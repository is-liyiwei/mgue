一个仿Vue风格的图片上传工具，使用方式类似于Vue风格，demo请看index.html

主要逻辑大概如下，主要目的在于数据和ui层的分离，两者互不影响


> use browser

```
<script type="text/javascript" src="mgue.js"></script>
```

> use module

```
npm i mgue
import mgue from 'mgue'
```

> 完整例子

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>uploadImg</title>
	<meta name="viewport" content="initial-scale=1.0, maximum-scale=1, user-scalable=no">
	<style>
		#input-box {
			display: flex;
			position: relative;
			height: 3rem;
		}
		#upload {
			position: absolute;
			width: 100%;
			height: 100%;
			opacity: 0;
		}
		.btn {
			width: 100%;
			height: 100%;
			border: none;
			background-color: pink;
			border-radius: 3px;
			color: #fff;
			cursor: pointer;
			margin: 0;
			padding: 0;
		}
		#send {
			margin-top: 20px;
			height: 50px;
			background-color: lightgreen;
		}

		img {
			width: 100%;
			height: 100%;
			margin-top: 10px;
		}
	</style>
</head>
<body>

	<div id="input-box">
		<input type="file" id="upload" capture="camera" multiple="false" />
		<button class="btn">chooseImg</button>
	</div>

	<button id="send" class="btn">send</button>

	<div id="box"></div>

</body>
<script type="text/javascript" src="index.js"></script>
<script>

let mg = new mgue({
	el: '#upload', // 仅支持id选择器
	data: {
		url: 'http://192.168.0.106:3000/web/getSwipe',  // 上传的地址
		size: 2048,  // 超过2048kb则会压缩，默认值是2048，可手动定义
		coefficient: 0.8, // 压缩系数，默认是0.8，可选范围是0-1的数字类型的值，可手动定义
		params: {  // 额外参数
			name: 'liyiwei'
		},
		headers: { // 请求头部参数
			heData: 'heData'
		}
	},
	create () {
		console.log('create');  // 创建实例的钩子
	},
	chooseImg (data, $event) {
		console.log('chooseImg');  // 选择图片的钩子

		let box = document.getElementById('box');
		box.innerHTML = '';
		for(let i = 0; i < data.length; i++) {
			let Img = new Image();

			// 重点在这一步，解析blob数据，然后赋值img标签的src即可，解析的blob数据就是img的临时路径地址
			Img.src = window.URL.createObjectURL(data[i]);

			box.appendChild(Img);
		}
	},
	uploadStart (hasWarn) {
		console.log(hasWarn);
		console.log('uploadStart');  // 上传开始钩子，大部分功能用来显示loading
	},
	done (res) {
		console.log('done');  // 成功钩子
		console.log(res);
	},
	fail (rej) {
		console.log('fail');  // 失败钩子
		console.log(rej);
	}
})

document.getElementById('send').onclick = function () {
	mg.send()
}

</script>
</html>
```

> 后端代码以node为示例，基于express，依赖formidable库

```js
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'heData');
    next();
});

router.post('/web/getSwipe', function(req, res, next) {
  // console.log(req)
  // console.log(req.body)
  // console.log(req.params)
  // console.log(req.query)
  res.header( 'Content-Type','text/javascript;charset=utf-8');        //设置返回字符串编码
    var form = new formidable.IncomingForm();                            //创建对象
    form.uploadDir = "./public/images/";                        //设置临时文件存放的路径
    form.encoding='utf-8';                                                //设置上传数据的编码
    form.keepExtensions = true;                                            //设置是否保持上传文件的拓展名
    form.maxFieldsSize = 2 * 1024 * 1024;                               //文件大小

    // form.on('progress', function (bytesReceived, bytesExpected) {
    //     console.log(bytesReceived);
    //     console.log(bytesExpected);
    // });

    form.parse(req, function(err, fields, files) {
        if (err) {
          console.log(err);
          return;
        }

        console.log('headers', req.headers.hedata) // 这里heData变成了全部小写，不知道是什么原因
        console.log('params', fields); // 这里是额外的参数
        console.log(files.imgFiles); // imgFiles数据

        var extName = '';                      //后缀名
        switch (files.imgFiles.type) {
          case 'image/pjpeg':
            extName = 'jpg';
            break;
          case 'image/jpeg':
            extName = 'jpg';
            break;         
          case 'image/png':
            extName = 'png';
            break;
          case 'image/x-png':
            extName = 'png';
            break;
          case 'image/gif':
            extName = 'gif';
            break;         
        }

        if(extName == '') {
            res.statusCode = 404;
            res.statusMessage = 'files type error form statusMessage';
            res.send('files type error');
            return;
        }

        var dataName = new Date(files.imgFiles.lastModifiedDate).getTime()

        var avatarName = dataName + '.' + extName;
        var newPath = form.uploadDir + avatarName;

        console.log(newPath);
        fs.renameSync(files.imgFiles.path, newPath);  //重命名

        setTimeout( () => {
            res.send({
                avatarName
            });
        }, 2000)  // 定时器是为了测试uploadStart事件
      });
});

module.exports = router;

```