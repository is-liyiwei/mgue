/*!
 * mgue.js v0.1.1
 * (c) 2018-2018 is-liyiwei
 * Released under the MIT License.
 * https://github.com/is-liyiwei/mgue
 */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() :
    typeof define === "function" && define.amd ? define(factory) :
      (global.mgue = factory())
}(this, (function () { "use strict"

  const LIFECYCLE_HOOKS = [
    "create",
    "chooseImg",
    "drawStart",
    "drawEnd",
    "uploadStart",
    "done",
    "fail"
  ]

  const class2type = {
    "[object Boolean]" : "boolean",
    "[object Number]"  : "number",
    "[object String]"  : "string",
    "[object Function]": "function",
    "[object Array]"   : "array",
    "[object Date]"    : "date",
    "[object RegExp]"  : "regExp",
    "[object Object]"  : "object",
    "[object Error]"   : "error"
  }

  const checkTypeForImage = /\.*(gif|jpg|jpeg|bmp|png)$/i

  // mime其实可以校验格式，但是这里暂时不太了解，先放着，下面写死一个默认的image/jpeg格式
  const mimes = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif"
    // "svg": "image/svg+xml"
    // "psd": "image/photoshop"
  }

  const checkType = (obj) => {
    return class2type[toString.call(obj)]
  }

  const getMime = (b64) => {
    return b64.split(',')[0].split(':')[1].split(';')[0]
  }

  /**
   * dataURL to blob, ref to https://gist.github.com/fupslot/5015897
   * @param dataURI,图片的base64格式数据
   * @returns {Blob}
   */
  let dataURItoBlob = (dataURI) => {
    let byteString = atob(dataURI.split(',')[1])
    let mimeString = getMime(dataURI)
    let ab = new ArrayBuffer(byteString.length)
    let ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], {type: mimeString})
  }

  let compress = (imgObj, mgue, opts) => {
    let canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        scale = imgObj.width / imgObj.height,
        width1 = imgObj.width,
        height1 = parseInt(width1 / scale)

    canvas.width = width1
    canvas.height = height1

    ctx.drawImage(imgObj, 0, 0, width1, height1)

    mgue["drawStart"] && mgue["drawStart"].call(mgue, ctx, imgObj, canvas)
    // 将原来图片的质量压缩到原先的coefficient倍。data url的形式
    let data = canvas.toDataURL(opts.fileMime, opts.coefficient)

    mgue["drawEnd"] && mgue["drawEnd"].call(mgue, ctx, imgObj, canvas)

    return data
  }

  let _canCompress = (fileMime) => {
    // gif暂时未找到合理绘图方法，暂用此方法跳过

    let flag = ["image/gif"].indexOf(fileMime) != -1

    return flag
  }

  class mgue {
    static use (plugin, opts) {
      if (plugin.installed) {
        console.info('plugin installed')
        return
      }
      plugin.install(this, opts)
      plugin.installed = true
    }
    constructor (options) {
      this.$mgue = this
      this._options = options
      this.init()
    }
    init () {
      let mgue = this
      // 超过2048kb则会压缩，默认值是2048，可手动定义
      // 压缩系数，默认是0.8，可选范围是0-1的数字类型的值，可手动定义
      let defaultOptions = {
        size: 2048,
        coefficient: 0.8
      }
      mgue.$data = Object.assign({}, defaultOptions, this._options.data)
      mgue.url = mgue._options.data.url
      mgue.$ref = document.getElementById(mgue._options.el.slice(1))
      mgue.blobList = []
      mgue.initHook()
      mgue.bindHandleDefault(mgue)
      mgue["create"] && mgue["create"].call(null)
    }
    initHook () {
      let o = this._options
      for (let hook of LIFECYCLE_HOOKS) {
        if (checkType(o[hook]) === "function") {
          this[hook] = o[hook]
        } else if (o[hook]) {
          throw new Error("hook must use function")
        }
      }
    }
    bindHandleDefault (mgue) {
      this.$ref.onchange = function (e) {
        mgue.fileList = this.files
        mgue.warn = false
        let compressSize = mgue.$data.size
        let coefficient = mgue.$data.coefficient
        let blobList = mgue.blobList = []

        let files = Array.prototype.slice.call(mgue.fileList)

        files.forEach(function (file) {

          if (!checkTypeForImage.test(file.type)) {
            // 检查是否是图片类型
            console.warn("warn: Must be the image type")
            return mgue.warn = true
          } else {
            // 设置图片类型
            file.fileMime = file.type.match(checkTypeForImage)["input"]
          }

          // 获取图片压缩前大小，打印图片压缩前大小
          // let size = ~~(file.size / 1024) + "KB"
          let size = ~~(file.size / 1024)

          let reader = new FileReader()

          reader.readAsDataURL(file)
          // 设置一个flag，gif暂时无法绘图
          file.is_gif_flag = _canCompress(file.fileMime)

          reader.onload = (evt) => {
            let img = new Image()
            img.src = evt.srcElement.result
            img.onload = () => {
              // 当图片大小不超过这个的时候或者为gif图，跳过canvas，直接上传
              if (size < compressSize || file.is_gif_flag) {
                // 小于这个尺寸，但是有绘图需求进入canvas，但不能是gif图
                if (!file.is_gif_flag && mgue["drawStart"] != undefined || mgue["drawEnd"] != undefined) {

                  let imgBase64 = compress(img, mgue, {
                    fileMime: file.fileMime,
                    coefficient,
                    size,
                    compressSize
                  })

                  blobList.push(dataURItoBlob(imgBase64))

                  if(blobList.length === files.length) {
                    mgue["chooseImg"] && mgue["chooseImg"].call(this, mgue.blobList, e)
                  }

                } else {
                  blobList.push(dataURItoBlob(evt.srcElement.result))
                  //将压缩后的二进制图片数据对象(blob)组成的list通过钩子函数返回出去
                  if(blobList.length === files.length) {
                    mgue["chooseImg"] && mgue["chooseImg"].call(this, mgue.blobList, e)
                  }
                }

              } else {
                let imgBase64 = compress(img, mgue, {
                  fileMime: file.fileMime,
                  coefficient,
                  size,
                  compressSize
                })
                // 打印压缩前后的大小，以及压缩比率
                // console.log('压缩前：' + evt.srcElement.result.length)
                // console.log('压缩后：' + imgBase64.length)
                // console.log('压缩率：' + ~~(100 * (evt.srcElement.result.length - imgBase64.length) / evt.srcElement.result.length) + "%")
                // console.log('base64数据', imgBase64)
                blobList.push(dataURItoBlob(imgBase64))

                // 将压缩后的二进制图片数据对象(blob)组成的list通过钩子函数返回出去
                if(blobList.length === files.length) {
                  mgue["chooseImg"] && mgue["chooseImg"].call(this, mgue.blobList, e)
                }
              }
            }
          }
        })
      }
    }
    // markHook (hook) {
    //   this[hook].apply(this)
    // }
    send () {
      let mg = this

      mg["uploadStart"] && mg["uploadStart"].call(null, mg.warn)

      if (mg.warn) {
        return mg["fail"] && mg["fail"].call(null, mg.warn)
      }

      for (let i = 0; i < mg.blobList.length; i++) {
        formUpData(mg, mg.blobList[i])
      }

      function formUpData (mgue, blobFile) {
        let formData = new FormData()
        let xhr = new XMLHttpRequest()

        let { headers, params } = mgue.$data.headers
        // 这里可以给mgue实例添加一个uid作为缓存，下个版本试试 

        // 添加其他参数
        if (checkType(params) === "object" && params) {
          Object.keys(params).forEach((k) => {
            formData.append(k, params[k])
          })
        }

        xhr.open("POST", mg.url)

        // 设置header
        if (checkType(headers) === "object" && headers) {
          Object.keys(headers).forEach((k) => {
            xhr.setRequestHeader(k, headers[k])
          })
        }

        formData.append("imgFiles", blobFile)

        xhr.onreadystatechange = function (e) {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              mg["done"] && mg["done"].call(null, this.response, e)
            } else {
              mg["fail"] && mg["fail"].call(null, this.response, e)
            }
          }
        }

        xhr.send(formData)
      }
    }
  }

  return mgue

})))