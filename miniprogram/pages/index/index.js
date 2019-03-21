//index.js

var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'RP7BZ-LE2HW-OEIRO-OZLUZ-OT662-K5BG7' // 必填
});

const app = getApp()

Page({
  data: {
    showLabel: false,
    showModal: false,
    labelList: app.globalData.labelList,
    userInfo: {},
    keyword: "",
    currentPage: 0,
    goodsList: [],
    labelid: 0,
    isHideLoadMore: true,
  },

  onLoad: function() {
    var that = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 用户已经授权，
          wx.getUserInfo({
            success: res => {
              that.setData({
                userInfo: res.userInfo
              })
              app.globalData.userInfo = res.userInfo
            }
          })

          wx.checkSession({
            success() {
              that.getGoodsList(0, 0, null)
            },
            fail() {
              // session_key 已经失效，需要重新执行登录流程
              wx.login({
                success(res) {
                  if (res.code) {
                    wx.request({
                      url: 'http://localhost:8080/login/getToken',
                      data: {
                        code: e.code
                      },
                      success(res) {
                        wx.setStorage({
                          key: 'token',
                          data: res.data.data.token
                        })
                        if (res.data.data.isNewUser) {
                          wx.redirectTo({
                            url: '/pages/chooseSchool/chooseSchool',
                          })
                        }
                      }
                    })
                  } else {
                    console.log('登录失败！' + res.errMsg)
                  }
                }

              })
            }
          })

        } else {
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  },

  /**
   * 页面显示
   */
  onShow() {
    //判断是否获得了用户地理位置授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          this.setData({
            showModal: true
          })
        } else {
          this.setData({
            showModal: false
          })
        }
      }
    })
  },
  /**
   * 输入关键字
   */
  inputKeyword(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  /**
   * 关键字搜索
   */
  search(e) {
    this.setData({
      goodsList: [],
      currentPage: 0,
      labelid: 0
    })
    this.getGoodsList(0, 0, this.data.keyword)
  },

  /**
   * 分类下拉与收起
   */
  pullDown() {
    this.setData({
      showLabel: !this.data.showLabel
    })
  },

  /**
   * 根据分类搜索
   */
  searchByLabel(e) {
    this.setData({
      goodsList: [],
      currentPage: 0,
      showLabel: false
    })
    this.getGoodsList(0, e.target.dataset.id, this.data.keyword)
  },

/**
 * 查看物品详情
 */
  toDetail(e){
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?id='+e.currentTarget.dataset.id
    })
  },
  /**
   * 下拉加载
   */
  onReachBottom() {
    this.setData({
      isHideLoadMore: false
    })
    this.getGoodsList(this.data.currentPage, this.data.labelid, this.data.keyword)
    this.setData({
      isHideLoadMore: true
    })
  },

  getGoodsList(currentPage, label, keyword) {
    var that = this
    //获取物品列表
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/goods/showHomeGoods',
          method: "GET",
          header: {
            token
          },
          data: {
            currentPage,
            label,
            keyword
          },
          success(res) {
            let goodsList = res.data.data
            var promise = []
            for (let index in goodsList) {
              //描述超过35个字，后面的用省略号表示
              if (goodsList[index].description.length > 35) {
                goodsList[index].description = goodsList[index].description.substring(0, 35) + "..."
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
              //标签id转化为对应的对象
              for (let i in app.globalData.labelList) {
                if (goodsList[index].label == app.globalData.labelList[i].id) {
                  goodsList[index].label = app.globalData.labelList[i]
                }
              }
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


  // Rad: function (d) { //根据经纬度判断距离
  //   return d * Math.PI / 180.0;
  // },
  // getDistance: function (lat1, lng1, lat2, lng2) {
  //   // lat1用户的纬度
  //   // lng1用户的经度
  //   // lat2物品的纬度
  //   // lng2物品的经度
  //   lat1 = lat1 || 0;
  //   lng1 = lng1 || 0;
  //   lat2 = lat2 || 0;
  //   lng2 = lng2 || 0;

  //   var rad1 = lat1 * Math.PI / 180.0;
  //   var rad2 = lat2 * Math.PI / 180.0;
  //   var a = rad1 - rad2;
  //   var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;

  //   var r = 6378137;
  //   return r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))

  // }
})