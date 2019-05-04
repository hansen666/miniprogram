// miniprogram/pages/wishDetail/wishDetail.js
const app = getApp()
var goodsID //心愿id
var publisherID //发布人ID

Page({
  data: {
    avatarUrl: '', //头像
    nickname: '', //昵称
    identifiedType: 0, //认证类型：0-未认证 ，1-学生
    picUrl: [], //物品图片列表
    name: '', //物品名称
    description: '', //描述
    price: 0, //价格
    browseCount: 0, //浏览次数
    pubTime: '', //发布时间
    phone: '', //联系方式
    realName: '', //用户姓名
    publisherID: '', //发布人ID
    commentList: [], //评论列表{senderID,receiverID,senderUrl,receiverUrl,senderNickname,receiverNickname,pubTime,content}
    commentTip: "评论区留下idea吧",
    showContact: true, //是否显示私戳它
    height: 0, //评论框距离底部的位置
    focus: false, //是否获得焦点
    remote_path: `${app.globalData.REMOTE_PATH}/want/`
  },

  /**
   * 页面加载
   */
  onLoad: function(options) {
    goodsID = Number(options.id)
    this.getWishDetail()
    this.getIdentifiedType()
    this.getComments()
  },

  /**
   * 获取心愿详情
   */
  getWishDetail() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/showWishDetail`,
      header: {
        token
      },
      data: {
        "id": goodsID
      },
      success(res) {
        var result = res.data.data
        if (result.picUrl) {
          result.picUrl = result.picUrl.split(',')
        }
        if (!result.realName) {
          result.realName = "***"
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
          publisherID: result.publisherID,
          realName: result.realName
        })
        publisherID = result.publisherID
      }
    })
  },

  /**
   * 获取买家认证类型
   */
  getIdentifiedType() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/user/identifiedType`,
      header: {
        token
      },
      success(res) {
        var identifiedType=res.data.data.identifiedType
        that.setData({
          identifiedType
        })
        if (identifiedType == 0) {
          var phone = that.data.phone
          that.setData({
            phone: phone.substring(0, 1) + "*********" + phone.substring(phone.length - 1),
          })
        }
      }
    })
  },

  /**
   * 获取评论列表
   */
  getComments() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/getComments`,
      header: {
        token
      },
      data: {
        goodsID
      },
      success(res) {
        var commentList = res.data.data
        if (commentList != null) {
          that.setData({
            commentList
          })
        }
      }
    })
  },

  /**
   * 点击查看大图 
   */
  imgView(e) {
    var that = this
    var src = e.currentTarget.dataset.src
    var imgList = e.currentTarget.dataset.list
    for (var i = 0; i < imgList.length; i++) {
      imgList[i] = that.data.remote_path + imgList[i]
    }
    wx.previewImage({
      current: src,
      urls: imgList,
    })
  },

  /**
   * 输入评论
   */
  inputComment(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  /**
   * 输入框失去焦点
   */
  inputBlur(e) {
    this.setData({
      height: 0,
      showContact: true,
      focus: false
    })
    if (!this.data.comment || this.data.comment.length == 0) {
      this.setData({
        receiverID: '',
        commentTip: '评论区留下idea吧'
      })
    }
  },

  /**
   * 输入框获得焦点
   */
  inputFocus(e) {
    this.setData({
      height: e.detail.height,
      showContact: false
    })
  },


  /**
   * 点击回复评论
   */
  replyComment(e) {
    var senderID = e.currentTarget.dataset.senderid
    var senderNickname = e.currentTarget.dataset.sendernickname
    this.setData({
      showCommentModal: true,
      commentTip: "回复：" + senderNickname,
      receiverID: senderID,
      focus: true
    })
  },

  /**
   * 发送评论
   */
  send(e) {
    var comment = this.data.comment
    if (this.data.receiverID) { //回复评论
      this.postComment(comment, this.data.receiverID)
    } else { //直接评论
      this.postComment(comment, this.data.publisherID)
    }
    this.setData({
      comment: '',
      receiverID: '',
      commentTip: '评论区留下idea吧'
    })
  },

  /**
   * 提交评论到后台
   */
  postComment(comment, receiverID) {
    var that = this
    const token = wx.getStorageSync('token')
    if (comment && comment.length > 0) {
      wx.request({
        url: `${app.globalData.hostname}/goods/sendComment`,
        method: "POST",
        header: {
          token
        },
        data: {
          context: comment,
          goodsID,
          receiverID
        },
        success(res) {
          var thisComment = res.data.data
          that.data.commentList.push(thisComment)
          that.setData({
            commentList: that.data.commentList
          })
        }
      })
    }
  },

  /**
   * 进行身份认证
   */
  toIdentity() {
    wx.navigateTo({
      url: '/pages/identityConfirm/identityConfirm',
    })
  },

  /**
   * 到聊天页
   */
  toChatBox() {
    var that = this
    wx.navigateTo({
      url: `/pages/chatBox/chatBox?userID=${publisherID}&nickname=${that.data.nickname}&avatarUrl=${that.data.avatarUrl}`
    })
  }
})