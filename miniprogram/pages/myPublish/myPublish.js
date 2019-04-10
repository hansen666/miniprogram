// miniprogram/pages/myPublish/myPublish.js
const app = getApp()
var labelList = app.globalData.labelList //标签列表
Page({
  data: {
    goodsList: [], //物品列表
    showCancel: false, //点击编辑出现“取消”
    editOrCancel: "编辑", //默认右上角为“编辑”
    chosedID: [], //选中的物品id组成的数组
    chosedCount: 0, //已选中物品的数目
    pageType: 0, //0：二手物页，1：心愿页
    empty: false,
    remote_path: `${app.globalData.REMOTE_PATH}/publish/`
  },

  /**
   * 页面加载
   * 获取物品列表
   */
  onLoad: function(options) {
    this.getGoodsList()
  },

  /**
   * 显示二手物列表
   */
  showMyGoods() {
    if (this.data.pageType == 1) {
      this.setData({
        pageType: 0,
        goodsList: []
      })
      this.getGoodsList()
    }
  },

  /**
   * 显示心愿列表
   */
  showMyWishes() {
    if (this.data.pageType == 0) {
      this.setData({
        pageType: 1,
        goodsList: []
      })
      this.getWishList()
    }
  },

  /**
   * 编辑
   */
  edit() {
    this.setData({
      showCancel: !this.data.showCancel
    })
    if (this.data.showCancel == false) {
      this.setData({
        editOrCancel: "编辑",
        chosedCount: 0,
        chosedID: this.data.chosedID.fill(-1)
      })
    } else {
      this.setData({
        editOrCancel: "取消"
      })
    }
  },

  /**
   * 选中/不选中某个物品
   */
  chooseItemID(e) {
    var chosedID = this.data.chosedID
    var index = chosedID.indexOf(e.currentTarget.dataset.id)
    if (index > -1) {
      chosedID[e.currentTarget.dataset.index] = -1
      this.setData({
        chosedID,
        chosedCount: this.data.chosedCount - 1
      })
    } else {
      chosedID[e.currentTarget.dataset.index] = e.currentTarget.dataset.id
      this.setData({
        chosedID,
        chosedCount: this.data.chosedCount + 1
      })
    }
  },

  /**
   * 全选/全不选
   */
  checkAll() {
    var chosedID = this.data.chosedID
    if (this.data.chosedCount == this.data.goodsList.length) {
      this.setData({
        chosedID: this.data.chosedID.fill(-1),
        chosedCount: 0
      })
    } else {
      var chosedID = []
      this.data.goodsList.forEach((ele) => {
        chosedID.push(ele.id)
      })
      this.setData({
        chosedID,
        chosedCount: this.data.goodsList.length
      })
    }
  },

  /**
   * 删除物品或心愿
   */
  delete() {
    var deleteArray = []
    var chosedID = this.data.chosedID
    var that = this
    const token = wx.getStorageSync('token')
    chosedID.forEach(function(elem) {
      if (elem != -1) {
        deleteArray.push(elem)
      }
    })

    wx.request({
      url: `${app.globalData.hostname}/goods/removePublish`,
      method: "DELETE",
      header: {
        token
      },
      data: {
        goodsID: deleteArray
      },
      success(res) {
        var goodsList = that.data.goodsList.filter((elem) => {
          return deleteArray.indexOf(elem.id) == -1
        })
        chosedID = new Array(goodsList.length).fill(-1)
        that.setData({
          chosedID,
          goodsList,
          chosedCount: 0
        })
      }
    })
    this.edit()
  },

  /**
   * 售出物品
   */
  sold(e) {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/dealCompleted?goodsID=${ e.currentTarget.dataset.id}`,
      method: "POST",
      header: {
        token
      },
      success(res) {
        var goodsList = that.data.goodsList.filter((elem) => {
          return elem.id != e.currentTarget.dataset.id
        })
        that.data.chosedID.fill(-1).pop()
        that.setData({
          goodsList,
          chosedID: that.data.chosedID
        })
      }
    })
  },

  //进入到详情页，编辑物品
  toDetail(e) {
    if (this.data.pageType == 0) {
      wx.navigateTo({
        url: '/pages/publishGoods/publishGoods?id=' + e.currentTarget.dataset.id
      })
    } else {
      wx.navigateTo({
        url: '/pages/myWishDetail/myWishDetail?id=' + e.currentTarget.dataset.id
      })
    }

  },

  /**
   * 获取物品列表
   */
  getGoodsList() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/myPublish`,
      header: {
        token
      },
      success(res) {
        var goodsList = res.data.data
        if (goodsList && goodsList.length > 0) {
          goodsList.forEach((item) => {
            item.picUrl=item.picUrl.split(',')[0]
            labelList.forEach((label) => {
              if (item.label == label.id) {
                item.label = label
              }
            })
          })
          var chosedID = new Array(goodsList.length).fill(-1)
          that.setData({
            goodsList,
            chosedID,
            empty: false
          })
        } else {
          that.setData({
            empty: true
          })
        }
      }
    })
  },

  /**
   * 获取心愿列表
   */
  getWishList() {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/goods/myWanted`,
      header: {
        token
      },
      success(res) {
        var goodsList = res.data.data
        if (goodsList && goodsList.length > 0) {
          goodsList.forEach((item) => {
            labelList.forEach((label) => {
              if (item.label == label.id) {
                item.label = label
              }
            })
          })
          var chosedID = new Array(goodsList.length).fill(-1)
          that.setData({
            goodsList,
            chosedID,
            empty: false
          })
        } else {
          that.setData({
            empty: true
          })
        }
      }
    })
  }
})