// miniprogram/pages/label/label.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "labelList": [{
        "id": 2,
        "name": "书籍"
      },
      {
        "id": 3,
        "name": "衣物"
      },
      {
        "id": 4,
        "name": "数码产品"
      },
      {
        "id":5,
        "name": "生活用品"
      },
      {
        "id": 6,
        "name": "电子产品"
      },
      {
        "id": 1,
        "name": "其它"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if(options.fromPage){
      this.setData({
        "fromPage":options.fromPage
      })
    }
  },

  chooseLabel(e){
    var label = e.target.dataset
    wx.redirectTo({
      url: this.data.fromPage+'?label='+JSON.stringify(label),
    })
  }


})