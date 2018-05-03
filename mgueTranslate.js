let translatePlugin = {}
translatePlugin.install = function (mgue, options) {
  // 1. 添加实例方法
  mgue.prototype.$translate = function (ctx, opts) {
    let { img, canvas } = this
    let { width, height } = canvas

    ctx.clearRect(0, 0, width, height) // 清空这个区域的矩形
    ctx.fillStyle = opts.fillStyle || '#fff' // 将透明区域设置为白色底边
    ctx.fillRect(0, 0, width, height) // 生成一个这个区域的矩形
    ctx.translate(opts.translateX, opts.translateY); // 缩放计算
    ctx.drawImage(img, 0, 0, width, height)
  }
}

if (typeof exports == "object") {
  module.exports = translatePlugin
} else if (typeof define == "function" && define.amd) {
  define([], function () {
    return translatePlugin
  })
} else if (window) {
  window.translatePlugin = translatePlugin
}
