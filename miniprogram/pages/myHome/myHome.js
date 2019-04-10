// miniprogram/pages/myHome/myHome.js
const app = getApp()

Page({
  data: {
    avatarUrl: '', //头像
    nickname: '' //昵称
  },

  /**
   * 页面显示
   */
  onShow: function(options) {
    this.getUserInfo()
  },



  /**
   * 跳转到编辑页
   */
  toEdit() {
    wx.navigateTo({
      url: '/pages/editMessage/editMessage',
    })
  },

  /**
   * 到我的发布详情
   */
  toMyPublish() {
    wx.navigateTo({
      url: '/pages/myPublish/myPublish',
    })
  },

  /**
   * 到我的售出页
   */
  toMySold() {
    wx.navigateTo({
      url: '/pages/mySold/mySold',
    })
  },

  /**
   * 到我的收藏页
   */
  toMyCollection() {
    wx.navigateTo({
      url: '/pages/myCollection/myCollection',
    })
  },

  /**
   * 到身份认证页
   */
  toIdentityConfirm() {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: `${app.globalData.hostname}/user/identifiedType`,
          header: {
            token
          },
          success(res) {

            const identifiedType = res.data.data.identifiedType
            if (identifiedType == 0) {
              wx.navigateTo({
                url: '/pages/identityConfirm/identityConfirm',
              })
            } else {
              wx.navigateTo({
                url: "/pages/identityConfirmSuccess/identifyConfirmSuccess"
              })
            }
          }
        })
      },
    })

  },

  /**
   * 获取用户基本信息
   */
  getUserInfo() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/user/information`,
      header: {
        token
      },
      success(res) {
        const userInfo = res.data.data
        that.setData({
          avatarUrl: userInfo.avatarUrl,
          nickname: userInfo.nickname
        })
      }
    })
  }
})