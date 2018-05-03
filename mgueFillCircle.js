let fillCirclePlugin = {}
fillCirclePlugin.install = function (mgue, options) {
  // 1. 添加实例方法
  mgue.prototype.$fillCircle = function (ctx, opts) {
    ctx.beginPath()
    ctx.arc(opts.x, opts.y, opts.r, opts.sAngle, opts.eAngle, opts.counterclockwise)
    ctx.fillStyle = opts.fillColor || '#fff'
    ctx.fill()
    ctx.strokeStyle = opts.strokeColor || '#fff'
    ctx.lineWidth = opts.strokeWidth || 2
    ctx.stroke()
    ctx.closePath()
  }
}

if (typeof exports == "object") {
  module.exports = fillCirclePlugin
} else if (typeof define == "function" && define.amd) {
  define([], function () {
    return fillCirclePlugin
  })
} else if (window) {
  window.fillCirclePlugin = fillCirclePlugin
}
