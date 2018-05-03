let fillRectPlugin = {}
fillRectPlugin.install = function (mgue, options) {
  // 1. 添加实例方法
  mgue.prototype.$fillRect = function (ctx, opts) {
   ctx.lineWidth = opts.lineWidth || 2
   ctx.fillStyle = opts.fillColor || '#fff'
   ctx.strokeStyle = opts.strokeColor || '#f00'

   ctx.beginPath()
   ctx.strokeRect(opts.left, opts.top, opts.width, opts.height)
   ctx.fillRect(opts.left, opts.top, opts.width, opts.height)
   ctx.closePath()
  }
}

if (typeof exports == "object") {
  module.exports = fillRectPlugin
} else if (typeof define == "function" && define.amd) {
  define([], function () {
    return fillRectPlugin
  })
} else if (window) {
  window.fillRectPlugin = fillRectPlugin
}
