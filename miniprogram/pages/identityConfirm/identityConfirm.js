// miniprogram/pages/identityConfirm/identityConfirm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 跳转到帮助页
   */
  toHelp() {
    wx.navigateTo({
      url: '/pages/help/help',
    })
  },

  /**
   * 保存在线验证码
   */
  inputCode(e) {
    this.setData({
      code: e.detail.value
    })
  },

  /**
   * 提交认证
   */
  submit() {
    var that = this
    if (!that.data.code) {
      wx.showModal({
        title: '警告',
        content: '请先输入在线验证码',
      })
    } else {

      wx.getStorage({
        key: 'token',
        success: function(res) {
          const token = res.data
          wx.request({
            url: 'http://localhost:8080/user/studentCertify',
            header: {
              token
            },
            data: {
              onlineCode: that.data.code
            },
            success(res) {
              if (res.data.code != 0) {
                wx.showModal({
                  title: '警告',
                  content: '在线验证码检测失败，请检查是否输入错误或者在线验证码已过期',
                })
              } else {
                wx.showModal({
                  title: '说明',
                  content: '身份验证成功',
                  showCancel: false,
                  confirmText: '确定',
                  success: function(res) {
                    if (res.confirm) {
                      wx.switchTab({
                        url: '/pages/myHome/myHome',
                      })
                    }
                  }
                })
              }
            }
          })
        },
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})