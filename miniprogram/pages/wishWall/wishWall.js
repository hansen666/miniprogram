// miniprogram/pages/wishWall/wishWall.js

import commonJS from "../../utils/common.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
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
   * 生命周期函数--监听页面加载
   * 获取心愿列表
   */
  onLoad: function(options) {
    this.getGoodsList(0, 0)
  },

  /**
   * 页面上拉触底事件的处理函数
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
      url: '/pages/wishDetail/wishDetail?id=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 获取心愿列表
   */
  getGoodsList(currentPage, label) {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/goods/showWishWall',
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
            wx.getLocation({
              success: function(res) {
                for (let index in goodsList) {
                  //描述超过35个字，后面的用省略号表示
                  if (goodsList[index].description.length > app.globalData.fontMaxLength) {
                    goodsList[index].description = goodsList[index].description.substring(0, app.globalData.fontMaxLength) + "..."
                  }
                  //计算用户到各个点的距离
                  goodsList[index].distance = commonJS.getDistance(res.latitude, res.longitude, goodsList[index].latitude, goodsList[index].longitude)
                  if (goodsList[index].distance < 1000) {
                    goodsList[index].distance = Math.floor(goodsList[index].distance) + "m"
                  } else {
                    goodsList[index].distance = (goodsList[index].distance / 1000).toFixed(1) + "km"
                  }
                  //标签id转化为对应的对象
                  for (let i in app.globalData.labelList) {
                    if (goodsList[index].label == app.globalData.labelList[i].id) {
                      goodsList[index].label = app.globalData.labelList[i]
                    }
                  }
                }
                //将查出来的结果，加在最后
                that.setData({
                  goodsList: that.data.goodsList.concat(goodsList),
                  currentPage: that.data.currentPage + 1
                })
                if (that.data.goodsList.length == 0) {
                  that.setData({
                    empty: true
                  })
                } else {
                  that.setData({
                    empty: false
                  })
                }
                that.setData({
                  isHideLoadMore: true
                })
              },
              fail: function(err) {
                console.log("获取位置出错:")
                goodsList[index].distance = "未知"
              }
            })
          }
        })
      }
    })
  },

})