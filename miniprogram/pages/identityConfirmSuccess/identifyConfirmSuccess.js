// miniprogram/pages/identityConfirmSuccess/identifyConfirmSuccess.js
const app = getApp()

Page({
  data: {
    schoolName: '' //学校名称
  },

  /**
   * 页面加载
   * 获取学校名称
   */
  onLoad: function(options) {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/user/information`,
      header: {
        token
      },
      success(res) {
        that.setData({
          schoolName: res.data.data.schoolName
        })
      }
    })
  }

})