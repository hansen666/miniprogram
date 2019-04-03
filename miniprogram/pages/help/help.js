// miniprogram/pages/help/help.js
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
    wx.getLocation({
      success: function(res) {
        console.log(res)
      },
      fail(err){
        console.log('获取位置失败',err)
        wx.showModal({
          title: '警告',
          content: '我们无法获取到您的实时位置，请确认已打开GPS后再进行发布',
        })
      }
    })
  },

  previewImage(e){
    console.log(e.currentTarget.dataset.src)
    const src=e.currentTarget.dataset.src
    wx.previewImage({
      urls: [src],
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