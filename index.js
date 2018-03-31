/*!
 * mgue.js v0.0.1
 * (c) 2018-2018 is-liyiwei
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mgue = factory());
}(this, (function () { 'use strict';

	const LIFECYCLE_HOOKS = [
	  'create',
	  'chooseImg',
	  'uploadStart',
	  'done',
	  'fail'
	]

	const class2type = {
	    '[object Boolean]' : 'boolean',
	    '[object Number]'  : 'number',
	    '[object String]'  : 'string',
	    '[object Function]': 'function',
	    '[object Array]'   : 'array',
	    '[object Date]'    : 'date',
	    '[object RegExp]'  : 'regExp',
	    '[object Object]'  : 'object',
	    '[object Error]'   : 'error'
	}

	const checkTypeForImage = /\.*(gif|jpg|jpeg|bmp|png)$/i;

	const checkType = function (obj) {
	    return class2type[toString.call(obj)]
	}

	/**
   * dataURL to blob, ref to https://gist.github.com/fupslot/5015897
   * @param dataURI,图片的base64格式数据
   * @returns {Blob}
   */
  function dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }

	function compress(imgObj, coefficient) {
		let canvas = document.createElement('canvas');
		let ctx = canvas.getContext('2d');

		//	canvas.setAttribute('width',imgObj.width);
		//	canvas.setAttribute('height',imgObj.height);
		//  canvas.style.width = imgObj.width;
		//  canvas.style.height = imgObj.height;

		//利用canvas进行绘图
		let scale = imgObj.width / imgObj.height;  // 比例
		let width1 = 1920;  // 现在主流的1920
		let height1 = parseInt(width1 / scale);  // 按照上面的方法这个就是1440
		canvas.width = width1;
		canvas.height = height1;
		//console.log(canvas.width );
		ctx.drawImage(imgObj, 0, 0, width1, height1);

		//将原来图片的质量压缩到原先的coefficient倍。
		let data = canvas.toDataURL('image/jpeg', coefficient); //data url的形式

		return data;

	}

	class mgue {
		constructor (options) {
			this.$mgue = this;
			this._options = options;
			this.init();
		}
		init () {
			let mgue = this;
			let defaultOptions = {
				size: 2048,  // 超过2048kb则会压缩，默认值是2048，可手动定义
				coefficient: 0.8 // 压缩系数，默认是0.8，可选范围是0-1的数字类型的值，可手动定义
			}
			let data = Object.assign({}, defaultOptions, this._options.data);
			mgue.$data = data;
			mgue.url = mgue._options.data.url;
			mgue.$ref = document.getElementById(mgue._options.el.slice(1));
			mgue.blobList = [];
			mgue.initHook();
			mgue.bindHandleDefault(mgue);
			mgue['create'] && mgue['create'].call(null);
		}
		initHook () {
			let o = this._options;
			for (let hook of LIFECYCLE_HOOKS) {
				if (checkType(o[hook]) === 'function') {
					this[hook] = o[hook];
				} else {
					throw new Error('hook must use function');
				}
			}
		}
		bindHandleDefault ($mgue) {
			this.$ref.onchange = function (e) {
				$mgue.fileList = this.files;
				$mgue.warn = false;
				let compressSize = $mgue.$data.size;
				let coefficient = $mgue.$data.coefficient;
				let blobList = $mgue.blobList = [];

				let files = Array.prototype.slice.call($mgue.fileList);

				files.forEach(function (file, i) {

	        if (!checkTypeForImage.test(file.type)) {
	            console.warn('warn: Must be the image type');
	            return $mgue.warn = true
	        }

	        // 获取图片压缩前大小，打印图片压缩前大小
          // let size = ~~(file.size / 1024) + "KB";
          let size = ~~(file.size / 1024);

          let reader = new FileReader();

          reader.readAsDataURL(file);

          reader.onload = function(evt) {

						if(size > compressSize) { // 当图片大小超过这个的时候就压缩，之前设置的是1024*1024*2的，但是图片还是太大了，导致手机上网络请求特别慢，最后导致请求超时接口无法调用
							let img = new Image();
							img.src = evt.srcElement.result;
							img.onload = () => {
								let imgBase64 = compress(img, coefficient);
								//打印压缩前后的大小，以及压缩比率
		            // console.log('压缩前：' + evt.srcElement.result.length);
		            // console.log('压缩后：' + imgBase64.length);
		            // console.log('压缩率：' + ~~(100 * (evt.srcElement.result.length - imgBase64.length) / evt.srcElement.result.length) + "%");
		            // console.log('base64数据', imgBase64);
		            blobList.push(dataURItoBlob(imgBase64));

		            //将压缩后的二进制图片数据对象(blob)组成的list通过钩子函数返回出去
                if(blobList.length === files.length) {
                	$mgue['chooseImg'] && $mgue['chooseImg'].call(this, $mgue.blobList, e);
                }
							}
						} else {
							blobList.push(dataURItoBlob(evt.srcElement.result));
							//将压缩后的二进制图片数据对象(blob)组成的list通过钩子函数返回出去
              if(blobList.length === files.length) {
              	$mgue['chooseImg'] && $mgue['chooseImg'].call(this, $mgue.blobList, e);
              }
						}
					}

	      })
			}
		}
		// markHook (hook) {
		// 	this[hook].call(this);
		// }
		send (options) {
			let mg = this;

      mg['uploadStart'] && mg['uploadStart'].call(null, this.warn);

      if (this.warn) {
      	return mg['fail'] && mg['fail'].call(null, files);
      }

      for (let i = 0; i < mg.blobList.length; i++) {
      	formUpData(this, mg.blobList[i]);
      }

	    function formUpData(mgue, blobFile){
        let formData = new FormData();

        formData.append("files", blobFile);
        
        let xhr = new XMLHttpRequest();
        
        xhr.open('POST', mg.url);

        xhr.onreadystatechange = function (e) {
          if (xhr.readyState == 4) {
          	if (xhr.status == 200) {
              mg['done'] && mg['done'].call(null, this.response, e);
          	} else {
          		mg['fail'] && mg['fail'].call(null, this.response, e);
          	}
          }
        }
        xhr.send(formData);
       }
		}
	};

	return mgue;

})));