let scalePlugin = {}
scalePlugin.install = function (mgue, options) {
  // 1. 添加实例方法
  mgue.prototype.$scale = function (ctx, opts) {
    let { img, canvas } = this
    let { width, height } = canvas

    ctx.clearRect(0, 0, width, height) // 清空这个区域的矩形
    ctx.fillStyle = opts.fillStyle || '#fff' // 将透明区域设置为白色底边
    ctx.fillRect(0, 0, width, height) // 生成一个这个区域的矩形
    ctx.translate(width / 2, height / 2) // http://www.w3school.com.cn/tags/canvas_translate.asp，先偏移获取重点
    ctx.scale(opts.scale, opts.scale); // 缩放计算
    ctx.translate(-width / 2, -height / 2) // http://www.w3school.com.cn/tags/canvas_translate.asp，再偏移回来，达到中心点的效果
    ctx.drawImage(img, 0, 0, width, height)
  }
}

if (typeof exports == "object") {
  module.exports = scalePlugin
} else if (typeof define == "function" && define.amd) {
  define([], function () {
    return scalePlugin
  })
} else if (window) {
  window.scalePlugin = scalePlugin
}
