// miniprogram/pages/wishWall/wishWall.js

var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'RP7BZ-LE2HW-OEIRO-OZLUZ-OT662-K5BG7' // 必填
});

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLabel: 0,
    currentPage: 0,
    labelList:app.globalData.labelList,
    labelid: 0,
    goodsList: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getGoodsList(0, 0)
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getGoodsList(this.data.currentPage, this.data.labelid)
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
    //获取物品列表
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
            label
          },
          success(res) {
            let goodsList = res.data.data
            var promise = []
            for (let index in goodsList) {
              //描述超过40个字，后面的用省略号表示
              if (goodsList[index].description.length > 40) {
                goodsList[index].description = goodsList[index].description.substring(0, 40) + "..."
              }
              //计算用户到各个点的距离
              promise.push(new Promise((reslove, reject) => {
                qqmapsdk.calculateDistance({
                  to: [{
                    latitude: goodsList[index].latitude,
                    longitude: goodsList[index].longitude
                  }],
                  success: function(res) {
                    goodsList[index].distance = res.result.elements[0].distance
                    if (goodsList[index].distance < 1000) {
                      goodsList[index].distance += "m"
                    } else {
                      goodsList[index].distance = (goodsList[index].distance / 1000).toFixed(1) + "km"
                    }
                    reslove(goodsList[index])
                  },
                  fail() {
                    goodsList[index].distance = "未知"
                    reslove(goodsList[index])
                  }
                })
              }))
            }
            //将查出来的结果，加在最后
            Promise.all(promise).then(res => {
              that.setData({
                goodsList: that.data.goodsList.concat(res),
                currentPage: that.data.currentPage + 1
              })
            }).catch(err => {
              console.log(err)
            })
          }
        })
      }
    })
  },

})