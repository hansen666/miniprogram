// miniprogram/pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messageList: [], //消息列表{userId,avatarUrl,nickname,content,pubTime,read,type}read:0-未读，1-已读
  },

  /**
   * 生命周期函数--监听显示
   */
  onShow: function(options) {
    this.getMessageList()
  },


  toDetail(e){
    const userID=e.currentTarget.dataset.userid
    console.log(userID)
    const nickname = e.currentTarget.dataset.nickname
    const avatarUrl = e.currentTarget.dataset.avatarurl
    wx.navigateTo({
      url: '/pages/chatBox/chatBox?userID=' + userID + "&nickname=" + nickname + "&avatarUrl=" + avatarUrl
    })
  },

  /**
   * 获取消息列表
   */
  getMessageList(){
    var that=this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token=res.data
        wx.request({
          url: 'http://localhost:8080/chat/messageList',
          header:{
            token
          },
          success(res){
            var messageList=res.data.data
            console.log(messageList)
            that.handleMessage(messageList);
            that.setData({
              messageList
            })
          }
        })
      },
    })
  },

  /**
   * 对返回的消息进行处理
   */
  handleMessage(messageList){
    messageList.forEach(item=>{
      if (item.content.length > 20) {
        item.content = item.content.substring(0, 20) + "..."
      }
      if(item.type == 1){
        item.content="[图片]"
      }
      if (item.type == 2) {
        item.content = "[语音]"
      }
    })
  }

})