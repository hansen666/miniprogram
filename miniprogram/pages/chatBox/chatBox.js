// miniprogram/pages/chatBox/chatBox.js
var app = getApp()
var socketOpen = false
var SocketTask;
var recorder = wx.getRecorderManager() //录音管理上下文
const innerAudioContext = wx.createInnerAudioContext() //获取播放对象
var voice_start_date, voice_start_point, sendLock
var url = 'ws://localhost:8080/chat'
var userID, nickname
Page({

  /**
   * 页面的初始数据
   */
  data: {
    otherAvatarUrl: "https://img2.woyaogexing.com/2019/03/27/934141ded7374d6b89129befc40e7694!400x400.jpeg",
    myAvatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/zep4z1V4XA4zRoVFyWNQkVNziagn4XlCCEIWbic1GFj7kGK0ZzicVC0ic6CYgvC4OMiaAIZjdsHic2Rrt70T0fuY2Siag/132", //我的头像地址
    sendVoice: false, //是否要发送语音
    sendText: false, //是否要发送文本
    messageList: [], //消息列表{itime,messagSegement}
    messageSegment: [], //消息段{content,type,from}type:0-文本文字，1-图片，2-语音,from:0-我到它，1-它到我
    msg: "", //当前输入消息
    voiceTipText: "按住\t说话", //录音提示文本
    voiceBackColor: "#fff", //录音时背景颜色
    imgList: [], //消息中所有图片列表
    messageCount: 0 //我发送的消息条数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    userID = options.userID
    nickname = options.nickname
    var otherAvatarUrl = options.avatarUrl
    this.setData({
      otherAvatarUrl
    })
    this.getHistoryMessageList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   * 建立webSocket连接
   */
  onReady: function() {
    if (!socketOpen) {
      this.webSocket()
    }
    wx.setNavigationBarTitle({
      title: nickname,
    })
    this.on_recorder()
    this.bottom()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.close()
  },

  /**
   * 生命周期函数--监听页面销毁
   */
  onUnload: function() {
    this.close()
  },


  /**
   * 改变当前输入方式：文本/语音
   */
  changeInputType() {
    if (this.data.sendVoice) {
      this.setData({
        sendVoice: false,
      })
      if (this.data.msg.length > 0) {
        this.setData({
          sendText: true
        })
      }
    } else {
      this.setData({
        sendVoice: true,
        sendText: false
      })
    }
  },

  /**
   * 输入文字
   */
  bindKeyInput: function(e) {
    this.setData({
      msg: e.detail.value,
      sendText: true
    })
    if (this.data.msg.length == 0) {
      this.setData({
        sendText: false
      })
    }
  },

  /**
   * 发送文本数据
   */
  sendPlainText() {
    var messageBody = {
      userId: userID,
      type: 0,
      content: this.data.msg,
      isFirstMessage: 0
    }
    if (this.data.messageCount == 0) {
      messageBody.isFirstMessage = 1
    }
    this.handleMessage(this.data.msg, 0, 0)
    this.setData({
      sendText: false,
      msg: "",
    })
    this.sendSocketMessage(messageBody)
  },

  /**
   * 选择图片并上传
   */
  chooseImage() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const filePath = res.tempFilePaths[0]
        wx.getStorage({
          key: 'token',
          success: function(res) {
            const token = res.data
            wx.uploadFile({
              url: "http://localhost:8080/goods/imageUpload",
              filePath: filePath,
              name: "file",
              header: {
                token
              },
              formData: {
                id: 0,
                filePath: "message/photos"
              },
              success(res) {
                if (JSON.parse(res.data).code == -1) {
                  console.log("上传文件错误")
                  return
                }
                var fileName = JSON.parse(res.data).data.fileName
                console.log(fileName)
                that.sendImage(fileName)
              },
              fail(res) {
                console.log("fail")
              }
            })
          },
        })

      }
    })
  },

  /**
   * 发送图片
   */
  sendImage(imgName) {
    var messageBody = {
      userId: userID,
      type: 1,
      content: imgName,
      isFirstMessage: 0
    }
    if (this.data.messageCount == 0) {
      messageBody.isFirstMessage = 1
    }
    this.handleMessage(this.data.msg, 1, 0)
    this.bottom()
    this.sendSocketMessage(messageBody)

  },

  /**
   * 录音开始
   */
  handleRecordStart(e) {
    voice_start_point = e.touches[0]
    voice_start_date = new Date().getTime()
    sendLock = false
    this.setData({
      voiceTipText: "松开\t发送",
      voiceBackColor: "rgba(0,0,0,0.1)"
    })

    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }
    recorder.start(options)

    wx.showToast({
      title: '手机上划，取消发送',
      icon: "none",
      duration: 60000
    })
  },

  /**
   * 录音结束
   */
  handleRecordStoped() {
    this.setData({
      voiceTipText: "按住\t说话",
      voiceBackColor: "#fff"
    })
    wx.hideToast()
    recorder.stop()
  },

  /**
   * 取消录音
   */
  handleTouchMove(e) {
    var moveLength = e.touches[e.touches.length - 1].clientY - voice_start_point.clientY
    if (Math.abs(moveLength) > 50) {
      wx.showToast({
        title: '松开手指，取消发送',
        icon: "none",
        duration: 60000
      })
      sendLock = true
    }
  },

  /**
   * 录音监听事件
   */
  on_recorder() {
    var that = this
    recorder.onStart(res => {
      console.log("录音开始")
    })
    recorder.onStop(res => {
      console.log("停止录音，临时路径：" + res.tempFilePath)
      var voice_time = new Date().getTime() - voice_start_date
      if (voice_time > 1000) { //时长超过1s才进行发送
        that.handleMessage(res.tempFilePath, 2, 0)

        console.log(res.tempFilePath)
      }
    })
  },

  /**
   * 上传音频文件
   */
  uploadVoice(voiceFile) {

  },

  /**
   * 发送音频消息
   */
  sendVoice(voiceName) {
    var messageBody = {
      userId: userID,
      type: 2,
      content: voiceName,
      isFirstMessage: 0
    }
    if (this.data.messageCount == 0) {
      messageBody.isFirstMessage = 1
    }
    this.handleMessage(this.data.msg, 2, 0)
    this.bottom()
    this.sendSocketMessage(messageBody)
  },

  /**
   * 将信息渲染到对话页
   */
  handleMessage(content, type, from) {
    var message = {
      content,
      type,
      from
    }
    if (this.data.messageCount == 0) {
      var messageList = this.data.messageList
      messageList.push({
        time: "刚刚",
        messageSegment: [message]
      })
      this.setData({
        messageList
      })
    } else {
      var messageSegment = this.data.messageList[this.data.messageList.length - 1].messageSegment
      messageSegment.push(message)
      var lastMessageList = 'messageList[' + (this.data.messageList.length - 1) + '].messageSegment'
      this.setData({
        [lastMessageList]: messageSegment
      })
    }
    this.setData({
      messageCount: this.data.messageCount + 1,
    })
    this.bottom()
  },

  /**
   * 向服务器发送消息
   */
  sendSocketMessage(message) {
    var that = this
    console.log("通过webSocket发送数据：" + message)
    if (SocketTask.readyState != 1) {
      that.reconnect()
      console.log(SocketTask)
      if (SocketTask.readyState == 1) {
        SocketTask.send({
          data: JSON.stringify(message),
          success(res) {
            console.log("已发送：" + res)
          }
        })
      } else {
        wx.showToast({
          title: '无法连接服务器'
        })
      }
    } else {
      SocketTask.send({
        data: JSON.stringify(message),
        success(res) {
          console.log("已发送：" + res)
        }
      })
    }


  },

  /**
   * 建立webSocket连接
   */
  webSocket() {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data;
        console.log(token)
        SocketTask = wx.connectSocket({
          url: url + "?token=" + token,
          header: {
            'content-type': 'application/json',
            token
          },
          method: 'POST',
          success(res) {
            console.log("建立WebSocket连接：" + res)
            return true
          },
          fail(err) {
            wx.showToast({
              title: '网络异常',
            })
            console.log(err)
            return false
          }
        })
        that.initSocket()
      }
    })
  },

  /**
   * webSocket断开重连
   */
  reconnect() {
    var that = this
    var limit = 10
    while (limit > 0 && SocketTask.readyState != 1) {
      that.webSocket()
      console.log(limit)
      setTimeout(() => {
        limit--
       }, 1000)
    }
  },

  /**
   * 添加webSocket监听事件
   */
  initSocket() {
    SocketTask.onOpen(onOpen => {
      socketOpen = true
      console.log("监听webSocket连接打开事件:" + onOpen)
    })
    SocketTask.onClose(onClose => {
      socketOpen = false
      console.log("监听webSocket连接关闭事件:" + onClose)
    })
    SocketTask.onError(onError => {
      socketOpen = false
      console.log("监听webSocket连接错误:" + onError)
    })
    SocketTask.onMessage(onMessage => {
      var message = JSON.parse(onMessage.data)
      console.log(message.content, message.type)
      that.handleMessage(message.content, message.type, 1)
      console.log("接收到的服务器端的消息：" + onMessage.data)
    })
  },

  /**
   * 关闭webSocket连接
   */
  close() {
    if (SocketTask) {
      SocketTask.close((close) => {
        console.log("关闭websocket连接：" + close)
      })
    }
  },

  /**
   * 获取历史聊天记录
   */
  getHistoryMessageList() {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/chat/messageRecord',
          header: {
            token
          },
          data: {
            userId: userID
          },
          success(res) {
            var messageList = res.data.data.messageList
            that.setData({
              messageList
            })
            console.log(messageList)
            that.getImgList(messageList)
          }
        })
      },
    })

  },

  /**
   * 获取消息中图片列表
   */
  getImgList(messageList) {
    var imgList = []
    messageList.forEach(item => {
      item.messageSegment.forEach(message => {
        if (message.type == 1) {
          imgList.push(message.content)
        }
      })
    })
    this.setData({
      imgList
    })
  },

  /**
   * 点击查看大图 
   */
  imgView(e) {
    var src = e.currentTarget.dataset.src
    wx.previewImage({
      current: src,
      urls: this.data.imgList,
    })
  },

  /**
   * 播放语音
   */
  playAudio(e) {
    var path = e.currentTarget.dataset.audiopath
    innerAudioContext.src = path
    innerAudioContext.play()
  },
  /**
   * 页面滑动到底部
   */
  bottom() {
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 10000,
      })
    }, 100)

  }

})