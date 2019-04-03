//index.js

import commonJS from "../../utils/common.js"
const app = getApp()

Page({
  data: {
    showLabel: false, //是否显示分类下拉框
    showModal: false, //是否显示获取地理位置弹出框
    labelList: app.globalData.labelList, //物品分类列表
    keyword: "", //关键字
    currentPage: 0, //当前页
    goodsList: [], //物品列表
    labelid: 0, //分类标签id
    currentTime: (new Date()).toString(),
    isHideLoadMore: true, //是否隐藏加载更多 
    empty: false
  },

  /**
   * 页面加载
   * 1,检查用户授权基本信息
   * 2,检查session是否过期,过期则重新获取token
   * 3,获取物品列表
   */
  onLoad: function() {
    console.log(new Date())
    var that = this
    // 检查用户授权基本信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 查看session是否过期
          wx.checkSession({
            success() {
              //获取物品列表
              that.getGoodsList(0, 0, null)
            },
            fail() {
              wx.login({
                success(res) {
                  if (res.code) {
                    wx.request({
                      url: 'http://localhost:8080/login/getToken',
                      data: {
                        code: res.code
                      },
                      success(res) {
                        wx.setStorage({
                          key: 'token',
                          data: res.data.data.token
                        })
                        //检查是否为新用户
                        if (res.data.data.isNewUser) {
                          wx.redirectTo({
                            url: '/pages/chooseSchool/chooseSchool',
                          })
                        } else {
                          that.getGoodsList(0, 0, null)
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
   * 判断是否获得了用户地理位置授权
   */
  onShow() {
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
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      goodsList: [],
      currentPage: 0,
      currentTime: (new Date()).toString()
    })
    this.getGoodsList(0, this.data.labelid, null)
  },

  /**
   * 上拉触底加载
   */
  onReachBottom() {
    this.setData({
      isHideLoadMore: false
    })
    this.getGoodsList(this.data.currentPage, this.data.labelid, this.data.keyword)

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
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?id=' + e.currentTarget.dataset.id
    })
  },

  /**
   * 获取物品列表
   * currentPage:当前页
   * label:分类标签id
   * keyword:关键字
   */
  getGoodsList(currentPage, label, keyword) {
    var that = this
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
            keyword,
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
                that.setData({
                  isHideLoadMore: true
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