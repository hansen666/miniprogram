// miniprogram/pages/myGoodsDetail/myGoodsDetail.js
const app = getApp()
var goodsID //物品id

Page({
  data: {
    avatarUrl: '', //头像
    nickname: '', //昵称
    picUrl: [], //物品图片列表
    name: '', //物品名称
    description: '', //描述
    price: 0, //价格
    browseCount: 0, //浏览次数
    pubTime: '', //发布时间
    phone: '', //联系方式
    realName: '', //用户姓名
    showEdit:true,
    remote_path: `${app.globalData.REMOTE_PATH}/publish/`
  },

  /**
   * 页面加载
   * 获取物品详情，买家身份类型，买家是否收藏该物品
   */
  onLoad: function (options) {
    goodsID = Number(options.id)
    if(options.noEdit){
      this.setData({
        showEdit:false
      })
    }
    this.getGoodsDetail()
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
 * 到编辑页
 */
  toEdit() {
    wx.navigateTo({
      url: `/pages/publishGoods/publishGoods?id=${goodsID}`,
    })
  }
})