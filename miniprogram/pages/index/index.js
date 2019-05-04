//index.js
import commonJS from "../../utils/common.js"
const app = getApp()
var labelid = 0 //当前分类标签id

Page({
  data: {
    showLabel: false, //是否显示分类下拉框
    showModal: false, //是否显示获取地理位置弹出框
    keyword: '', //关键字
    goodsList: [], //物品列表
    labelList: app.globalData.labelList, //物品分类列表
    currentTime: new Date().toString(), //当前时间
    currentPage: 0, //当前页
    isHideLoadMore: true, //是否隐藏加载更多 
    empty: false,
    remote_path: `${app.globalData.REMOTE_PATH}/publish/`
  },

  /**
   * 页面加载
   * 1,检查用户授权基本信息
   * 2,检查session是否过期,过期则重新获取token
   * 3,获取物品列表
   */
  onLoad: function() {
    this.checkAuthUserInfo()
  },

  /**
   * 检查用户授权情况
   */
  checkAuthUserInfo() {
    var that = this
    // 检查用户授权基本信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          this.checkGPSOpened()
          wx.login({
            success(res) {
              if (res.code) {
                wx.request({
                  url: app.globalData.hostname + '/login/getToken',
                  data: {
                    code: res.code
                  },
                  success(res) {
                    wx.setStorageSync('token', res.data.data.token)
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
              }
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
   * 检查GPS是否打开
   */
  checkGPSOpened() {
    wx.getLocation({
      success: function(res) {},
      fail() {
        wx.showModal({
          title: '警告',
          content: '我们无法获取到您的实时位置，无法为您计算离买家距离，请检查是否关闭了GPS!',
          showCancel: false,
          confirmText: "确定"
        })
      }
    })
  },

  /**
   * 页面显示
   * 判断是否获得了用户地理位置授权
   */
  onShow() {
    this.checkAuthLocation()
  },

  /**
   * 检查地理位置授权
   */
  checkAuthLocation() {
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
      currentTime: new Date().toString()
    })
    this.getGoodsList(0, labelid, null)
  },

  /**
   * 上拉触底加载
   */
  onReachBottom() {
    this.setData({
      isHideLoadMore: false
    })
    this.getGoodsList(this.data.currentPage, labelid, this.data.keyword)
  },

  /**
   * 输入关键字事件
   * 输入值赋给keyword
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
   * 分类标签显示/隐藏
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
      showLabel: false,
    })
    labelid = e.target.dataset.id
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
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/showHomeGoods`,
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
        if (goodsList && goodsList.length > 0) {
          that.setData({
            empty: false
          })
          goodsList.forEach((item) => {
            //描述超过35个字，后面的用省略号表示
            if (item.description.length > app.globalData.fontMaxLength) {
              item.description = item.description.substring(0, app.globalData.fontMaxLength) + "..."
            }
            //图片路径转化为网络路径
            item.picUrl = item.picUrl.split(',')[0]
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
          currentPage: that.data.currentPage + 1,
          isHideLoadMore: true
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
  },

})