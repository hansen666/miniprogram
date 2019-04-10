// miniprogram/pages/label/label.js
var fromPage = ''
Page({
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
        "id": 5,
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
   * 页面加载
   * 保存来访页
   */
  onLoad: function(options) {
    if (options.fromPage) {
      fromPage = options.fromPage
    }
  },

  /**
   * 选择标签
   */
  chooseLabel(e) {
    var label = e.target.dataset
    wx.redirectTo({
      url: `${fromPage}?label=${JSON.stringify(label)}`,
    })
  }


})