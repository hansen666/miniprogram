// miniprogram/pages/wishWall/wishWall.js
import commonJS from "../../utils/common.js"
const app = getApp()

Page({
  data: {
    currentLabel: 0, //当前标签
    currentPage: 0, //当前页
    labelList: app.globalData.labelList, //分类标签列表
    labelid: 0, // 标签id
    goodsList: [], //物品列表
    currentTime: (new Date()).toString(), //当前时间
    isHideLoadMore: true, //是否隐藏加载更多   
    empty: false
  },

  /**
   * 页面加载
   * 获取心愿列表
   */
  onLoad: function(options) {
    this.getGoodsList(0, 0)
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      goodsList: [],
      currentPage: 0,
      currentTime: new Date().toString()
    })
    this.getGoodsList(0, this.data.labelid)
  },

  /**
   * 上拉加载
   */
  onReachBottom: function() {
    this.setData({
      isHideLoadMore: false
    })
    this.getGoodsList(this.data.currentPage, this.data.labelid)

  },

  /**
   * 根据分类进行搜索
   */
  searchByLabel(e) {
    this.setData({
      goodsList: [],
      currentLabel: e.target.dataset.id,
      currentPage: 0,
    })
    this.getGoodsList(this.data.currentPage, e.target.dataset.id)
  },

  /**
   * 查看心愿详情
   */
  toDetail(e) {
    wx.navigateTo({
      url: `/pages/wishDetail/wishDetail?id=${e.currentTarget.dataset.id}`
    })
  },

  /**
   * 获取心愿列表
   */
  getGoodsList(currentPage, label) {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/showWishWall`,
      method: "GET",
      header: {
        token
      },
      data: {
        currentPage,
        label,
        currentTime: that.data.currentTime
      },
      success(res) {
        let goodsList = res.data.data
        if (goodsList && goodsList.length > 0) {
          that.setData({
            empty: false
          })
          goodsList.forEach((item) => {
            //描述超过35个字，后面的用省略号表示
            if (item.description.length > app.globalData.fontMaxLength) {
              item.description = item.description.substring(0, app.globalData.fontMaxLength) + "..."
            }
            //标签id转化为对应的对象
            app.globalData.labelList.forEach((label) => {
              if (item.label == label.id) {
                item.label = label
              }
            })
          })
          wx.getLocation({
            success: function(res) {
              goodsList.forEach((item) => {
                item.distance = commonJS.getDistance(res.latitude, res.longitude, item.latitude, item.longitude)
                if (item.distance < 1000) {
                  item.distance = Math.floor(item.distance) + "m"
                } else {
                  item.distance = (item.distance / 1000).toFixed(1) + "km"
                }
              })
              that.setData({
                goodsList: that.data.goodsList.concat(goodsList),
              })
            },
            fail: function(err) {
                goodsList.forEach(item => {
                  item.distance = "未知"
                })
              that.setData({
                goodsList: that.data.goodsList.concat(goodsList),
              })
            }
          })

          wx.stopPullDownRefresh()
        } else {
          that.checkGoodsEmpty(that.data.goodsList)
        }
        that.setData({
          isHideLoadMore: true,
          currentPage: that.data.currentPage + 1,
        })
      }
    })
  },

  /**
   * 检查物品列表是否为空
   */
  checkGoodsEmpty(goodsList) {
    if (!goodsList || goodsList.length == 0) {
      this.setData({
        empty: true
      })
    } else {
      this.setData({
        empty: false
      })
    }
  }

})