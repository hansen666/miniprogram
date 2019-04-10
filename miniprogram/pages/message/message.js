// miniprogram/pages/message/message.js
const app = getApp()

Page({
  data: {
    messageList: [], //消息列表{userId,avatarUrl,nickname,content,pubTime,read,type}read:0-未读，1-已读
    empty:false //是否没收到任何消息
  },

  /**
   *页面显示
   */
  onShow: function(options) {
    this.getMessageList()
  },

  /**
   * 跳转到对话页
   */
  toDetail(e) {
    const userID = e.currentTarget.dataset.userid
    const nickname = e.currentTarget.dataset.nickname
    const avatarUrl = e.currentTarget.dataset.avatarurl
    wx.navigateTo({
      url: `/pages/chatBox/chatBox?userID=${userID}&nickname=${nickname}&avatarUrl=${avatarUrl}`
    })
  },

  /**
   * 获取消息列表
   */
  getMessageList() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/chat/messageList`,
      header: {
        token
      },
      success(res) {
        var messageList = res.data.data
        that.handleMessage(messageList);
        that.setData({
          messageList
        })
      }
    })
  },

  /**
   * 对返回的消息进行处理
   */
  handleMessage(messageList) {
    if (messageList&&messageList.length>0) {
      messageList.forEach(item => {
        if (item.content.length > 20) {
          item.content = item.content.substring(0, 20) + "..."
        }
        if (item.type == 1) {
          item.content = "[图片]"
        }
        if (item.type == 2) {
          item.content = "[语音]"
        }
      })
      this.setData({
        empty: false
      })
    }else{
      this.setData({
        empty:true
      })
    }
  }

})