let MyPlugin = {}
MyPlugin.install = function (mgue, options) {
  // 1. 添加全局方法或属性
  mgue.myGlobalMethod = function () {
    console.log('myGlobalMethod')
    // 逻辑...
  }
  // 1. 添加实例方法
  mgue.prototype.$myMethod = function (methodOptions) {
    console.log('myMethod')
    // 逻辑...
  }
}