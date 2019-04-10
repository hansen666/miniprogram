// miniprogram/pages/help/help.js
Page({
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 预览图片
   */
  previewImage(e){
    const src=e.currentTarget.dataset.src
    wx.previewImage({
      urls: [src],
    })
  }
})