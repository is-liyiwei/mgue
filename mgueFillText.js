let fillTextPlugin = {}
fillTextPlugin.install = function (mgue, options) {
  console.log(options)
  // 1. 添加实例方法
  mgue.prototype.$fillText = function (ctx, opts) {
    ctx.font = opts.font
    ctx.fillStyle = opts.fillStyle
    ctx.textAlign = opts.textAlign  
    ctx.fillText(opts.txt, opts.left , opts.top)
  }
}

if (typeof exports == "object") {
  module.exports = fillTextPlugin
} else if (typeof define == "function" && define.amd) {
  define([], function () {
    return fillTextPlugin
  })
} else if (window) {
  window.fillTextPlugin = fillTextPlugin
}