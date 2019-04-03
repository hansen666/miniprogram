// miniprogram/pages/myHome/myHome.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
     wx.getUserInfo({
       success(res){
         const userInfo=res.userInfo
         const nickName = userInfo.nickName
         const avatarUrl = userInfo.avatarUrl
         that.setData({
           nickName,
           avatarUrl
         })
       }
     })
  },

/**
 * 跳转到编辑页
 */
toEdit(){
  wx.navigateTo({
    url: '/pages/editMessage/editMessage',
  })
},

/**
 * 到我的发布详情
 */
  toMyPublish(){
    wx.navigateTo({
      url: '/pages/myPublish/myPublish',
    })
  },

/**
 * 到我的售出页
 */
  toMySold(){
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
  toIdentityConfirm(){
    var that=this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token=res.data
        wx.request({
          url: 'http://localhost:8080/user/identifiedType',
          header:{
            token
          },success(res){
            const identifiedType=res.data.identifiedType
            if(identifiedType==0){
              wx.navigateTo({
                url: '/pages/identityConfirm/identityConfirm',
              })
            }else{
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})