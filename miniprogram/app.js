//app.js
App({
  onLaunch: function() {

    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     traceUser: true,
    //   })
    // }

    this.globalData = {
      fontMaxLength: 35,
      //hostname:"http://localhost:8080",
      hostname: "https://www.compusshare.cn/weshare",
      REMOTE_PATH: "https://www.compusshare.cn/static",
      //webSocketUrl: "ws://localhost:8080/chat",
      webSocketUrl: "wss://www.compusshare.cn/weshare/chat",
      labelList: [{
          "id": 0,
          "name": "全部"
        },
        {
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
    }
  }
})