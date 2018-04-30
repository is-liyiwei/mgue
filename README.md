##### 一个仿Vue风格的图片上传工具，但不是Vue的插件，只是使用方式类似于Vue风格，原生无依赖，数据与ui分离，使用插件方式拓展方法

> 存在的bug

+ gif图无法进行任何压缩、绘图操作，直接上传

+ 没有绘图操作时不要写drawStart和drawEnd方法，会导致图片进入canvas操作，从而使图片变大。(插件上设计的问题，暂未找到解决办法)


> use browser

```
<script type="text/javascript" src="./index.js"></script>
```

> use module

```
npm i mgue
import mgue from 'mgue'
```

> 插件使用(是不是很像Vue，就是参(chao)考(xi)了Vue的思路！0.0)

```
// 编写插件
let fillTextPlugin = {}
fillTextPlugin.install = function (mgue, options) {
  console.log(options)
   // 1. 添加全局方法或属性，一般不使用
  mgue.myGlobalMethod = function () {
    console.log('myGlobalMethod')
    // 逻辑...
  }
  // 2. 添加实例方法
  mgue.prototype.$fillText = function (ctx, opts) {
    ctx.font = opts.font;
    ctx.fillStyle = opts.fillStyle;
    ctx.textAlign = opts.textAlign;  
    ctx.fillText(opts.txt, opts.w , opts.h);
  }
}

if (typeof exports == "object") {
  module.exports = fillTextPlugin;
} else if (typeof define == "function" && define.amd) {
  define([], function () {
    return fillTextPlugin
  })
} else if (window) {
  window.fillTextPlugin = fillTextPlugin;
}

// 注册插件
mgue.use(MyPlugin, {
  params: 'test' // 可以添加额外的参数
})

// 使用插件
var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop("0", "white")
    gradient.addColorStop("0.5", "#00bfff")
    gradient.addColorStop("1.0", "white")

    // 使用插件，这是个加文字到图片上的插件
    this.$fillText(ctx, {
      font: `${img.width / 10}px microsoft yahei`,
      fillStyle: gradient,
      txt: '居中填充文字',
      textAlign: 'center',
      w: canvas.width / 2,
      h: canvas.height / 2
    })
```

```js
// 插件的使用一般是对canvas进行操作，所以插件一般用在drawStart方法里面，该方法会暴露出当前的绘图对象和img本身
// ctx, img, canvas，目录下有三个常用方法的插件，用于添加文本，图形，可用于加水印标识等等，也可自己写插件，按照上面
// 的方法使用即可，本意上就是对canvas进行操作，只要有足够的绘图功底，Nothing is impossible！！！

drawStart(ctx, img, canvas) { // 绘图开始钩子
  this.$pluginFn(ctx, {

  })
}
```

> 示例，可直接下载此项目，查看demo文件夹下对应的文件

+ [普通使用，压缩上传]()
+ [压缩上传，添加文字]()
+ [压缩上传，添加方形]()
+ [压缩上传，添加圆形]()
+ [综合示例]()

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

router.post('/web/upload', function(req, res, next) {
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

> 参考文献

+ [要多简单就有多简单的H5拍照加水印](https://segmentfault.com/a/1190000007098531)
+ [手把手教你如何编写一个前端图片压缩、方向纠正、预览、上传插件](https://juejin.im/post/5a9759a16fb9a0635b5360b3)
+ [系统学习前端之FormData详解](https://segmentfault.com/a/1190000006716454)
