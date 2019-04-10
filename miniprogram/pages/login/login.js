// miniprogram/pages/login/login.js
const app = getApp()

Page({
  data: {},

  /**
   * 页面加载
   */
  onLoad: function(options) {},

  /**
   * 用户授权处理函数
   */
  binGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      wx.login({
        success(res) {
          if (res.code) {
            wx.request({
              url: `${app.globalData.hostname}/login/getToken`,
              data: {
                code: res.code
              },
              success(res) {
                if (!res.data.data.isNewUser) {
                  wx.setStorageSync('token', res.data.data.token)
                  wx.switchTab({
                    url: '/pages/index/index',
                  })
                } else {
                  wx.redirectTo({
                    url: '/pages/chooseSchool/chooseSchool',
                  })
                }
              }
            })

          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    } else {
      //用户点了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  }

})