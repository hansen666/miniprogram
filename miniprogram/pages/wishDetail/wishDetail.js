// miniprogram/pages/wishDetail/wishDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentList: [],
    commentTip: "评论区留下idea吧",
    // commentList: [{
    //   senderID:1,
    //   receiverID:2,
    //   senderUrl: 
    //   receiverUrl: 
    //   renderNickname:"hansen",
    //   receiverNickname:"萌",
    //   pubTime: "12分钟前",
    //   content: "早睡早起，养成每日好习惯i暗示hi是否哦是覅是的覅时候覅和士大夫好的覅和i但是十分士大夫死的好覅是的护肤斯蒂芬hi"
    // }],
    showCommentModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    that.setData({
      goodsID: Number(options.id)
    })
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/goods/showWishDetail',
          header: {
            token
          },
          data: {
            "id": options.id
          },
          success(res) {
            var result = res.data.data
            console.log(result)
            result.picUrl = Array.of(result.picUrl.split(','))
            if (!result.realName) {
              result.realName = "***"
            }
            var identifiedLabel;
            switch (result.identifiedType) {
              case 0:
                identifiedLabel = "未认证"
                break
              case 1:
                identifiedLabel = "学生"
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
              publisherID: result.publisherID,
              realName: result.realName,
              identifiedLabel
            })
            wx.request({
              url: 'http://localhost:8080/user/identifiedType',
              header: {
                token
              },
              success(res) {
                if (res.data.data.identifiedType == 0) {
                  var phone = that.data.phone
                  that.setData({
                    phone: phone.substring(0, 1) + "*********" + phone.substring(phone.length - 1),
                    identifiedType: res.data.data.identifiedType
                  })
                }
              }
            })
            wx.request({
              url: 'http://localhost:8080/goods/getComments',
              header: {
                token
              },
              data: {
                goodsID: options.id
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
            that.setData({
              // picUrl: [
              //   "../../images/search.png",
              //   "../../images/index.png",
              //   "../../images/camera.png"
              // ]
              picUrl: [],
              price: null
            })

          }
        })
      },
    })

  },

  /**
   * 点击查看大图 
   */
  imgView(e) {
    var src = e.currentTarget.dataset.src
    var imgList = e.currentTarget.dataset.list
    wx.previewImage({
      current: src,
      urls: imgList,
    })
  },


  /**
   * 点击评论
   */
  showCommentModal() {
    this.setData({
      showCommentModal: true
    })
  },

  /**
   * 回复评论
   */
  replyComment(e) {
    var senderID = e.currentTarget.dataset.senderid
    var senderNickname = e.currentTarget.dataset.sendernickname
    this.setData({
      showCommentModal: true,
      commentTip: "回复：" + senderNickname,
      receiverID:senderID
    })
  },

  /**
   * 发送评论
   */
  sendComment(e) {
    var comment = e.detail
    if(this.data.receiverID){       //回复评论
      this.postComment(comment,this.data.receiverID)
    }else{                                  //直接评论
      this.postComment(comment,this.data.publisherID)
    }
   
  },

  send(e) {
    var comment = this.data.comment
    if (this.data.receiverID) {       //回复评论
      this.postComment(comment, this.data.receiverID)
    } else {                                  //直接评论
      this.postComment(comment, this.data.publisherID)
    }
  },


  postComment(comment, receiverID) {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/goods/sendComment',
          method: "POST",
          header: {
            token
          },
          data: {
            context: comment,
            goodsID: that.data.goodsID,
            receiverID
          },
          success(res) {
            var thisComment=res.data.data
            that.data.commentList.push(thisComment)
            that.setData({
              receiverID:"",                                  
              comment: "",
              commentList: that.data.commentList
            })
          }

        })
      },
    })
  },

  setComment(e) {
    this.setData({
      comment: e.detail,
      commentTip:"说点什么吧"
    })
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
  toChatBox(){
    var that=this
    wx.navigateTo({
      url: '/pages/chatBox/chatBox?userID='+that.data.publisherID+"&nickname="+that.data.nickname+"&avatarUrl="+that.data.avatarUrl
    })
  }
})