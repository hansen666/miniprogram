// miniprogram/pages/wishDetail/wishDetail.js
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
    wx.getStorage({
      key: 'token',
      success: function (res) {
        wx.request({
          url: 'http://localhost:8080/goods/showWishDetail',
          header: {
            "token": res.data
          },
          data: {
            "id": options.id
          },
          success(res) {
            var result = res.data.data
            result.picUrl = result.picUrl.split(',')
            if (!result.realName) {
              result.realName = "***"
            }
            var identifiedLabel;
            switch (result.identifiedType) {
              case 0:
                identifiedLabel = "未认证"
                break
              case 1:
                identifiedLabel = "已认证"
                break
              case 2:
                identifiedLabel = "已认证"
                break
            }
            that.setData({
              avatarUrl: result.avatarUrl,
              nickname: result.nickname,
              identifiedType: result.identifiedType,
              picUrl: result.picUrl,
              name: result.name,
              description: result.description,
              price: result.price,
              browseCount: result.browseCount,
              pubTime: result.pubTime,
              phone: result.phone,
              realName: result.realName,
              identifiedLabel
            })

            that.setData({
              // picUrl: [
              //   "../../images/search.png",
              //   "../../images/index.png",
              //   "../../images/camera.png"
              // ]
              picUrl:[],
              price:null
            })

          }
        })
      },
    })

    console.log(that.data)
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