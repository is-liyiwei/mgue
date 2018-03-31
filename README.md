一个仿Vue风格的图片上传工具，使用方式类似于Vue风格，demo请看index.html

主要逻辑大概如下，主要目的在于数据和ui层的分离，两者互不影响


use browser

```

<script type="text/javascript" src="mgue.js"></script>

```

use es6 module

```
npm i mgue

import mgue from 'mgue'

```

```

let mg = new mgue({
	el: '#upload',  // input标签的id
	data: {
		url: 'http://192.168.0.95:3000/web/getSwipe',  // 上传的地址
		size: 2048,  // 超过2048kb则会压缩，默认值是2048，可手动定义
		coefficient: 0.8, // 压缩系数，默认是0.8，可选范围是0-1的数字类型的值，可手动定义
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

```

