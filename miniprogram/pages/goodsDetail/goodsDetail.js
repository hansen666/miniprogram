// miniprogram/pages/goodsDetail/goodsDetail.js
const app = getApp()
var goodsID //物品id
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
    collected: false, //是否收藏
     remote_path: `${app.globalData.REMOTE_PATH}/publish/`
  },

  /**
   * 页面加载
   * 获取物品详情，买家身份类型，买家是否收藏该物品
   */
  onLoad: function(options) {
    goodsID = Number(options.id)
    this.getGoodsDetail()
    this.getIdentifiedType()
    this.isGoodsColleted()
  },

  /**
   * 获取物品详情
   */
  getGoodsDetail() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/showHomeDetail`,
      header: {
        token
      },
      data: {
        id: goodsID
      },
      success(res) {
        var result = res.data.data
        //将逗号分割的图片转化为数组
        result.picUrl = result.picUrl.split(',')
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
        var identifiedType = res.data.data.identifiedType
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
   * 买家是否收藏该物品
   */
  isGoodsColleted() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/isGoodsCollected`,
      header: {
        token
      },
      data: {
        goodsID
      },
      success(res) {
        that.setData({
          collected: res.data.data.isCollected
        })
      }
    })
  },

  /**
   * 点击查看大图 
   */
  imgView(e) {
    var that=this
    var src = e.currentTarget.dataset.src
    var imgList = e.currentTarget.dataset.list
    for(var i=0;i<imgList.length;i++){
      imgList[i]=that.data.remote_path+imgList[i]
    }
    wx.previewImage({
      current: src,
      urls: imgList,
    })
  },

  /**
   * 收藏/取消收藏
   */
  collection() {
    var that = this
    const token = wx.getStorageSync('token')
    if (that.data.collected) {
      wx.request({
        url: `${app.globalData.hostname}/goods/cancelCollection`,
        method: "DELETE",
        header: {
          token
        },
        data: {
          goodsID: [goodsID]
        },
        success(res) {
          that.setData({
            collected: false
          })
        }
      })
    } else {
      wx.request({
        url: `${app.globalData.hostname}/goods/collect?goodsID=${goodsID}`,
        method: "POST",
        header: {
          token
        },
        success(res) {
          that.setData({
            collected: true
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
      url: `/pages/chatBox/chatBox?userID=${publisherID}&nickname= ${that.data.nickname}&avatarUrl=${that.data.avatarUrl}`
    })
  }
})