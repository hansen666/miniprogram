// miniprogram/pages/mySold/mySold.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [], //物品列表
    showCancel: false, //点击编辑出现“取消”
    editOrCancel: "编辑", //默认右上角为“编辑”
    chosedID: [], //选中的物品id组成的数组
    chosedCount: 0, //已选中物品的数目
    labelList: app.globalData.labelList, //标签列表
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   * 获取物品列表
   */
  onLoad: function(options) {
    this.getGoodsList()
  },

  /**
   * 编辑
   */
  edit() {
    this.setData({
      showCancel: !this.data.showCancel
    })
    if (this.data.showCancel == false) {
      var chosedID = []
      for (let i = 0; i < this.data.goodsList.length; i++) {
        chosedID.push(-1)
      }
      this.setData({
        editOrCancel: "编辑",
        chosedCount: 0,
        chosedID
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
    //不选中
    if (index > -1) {
      chosedID[e.currentTarget.dataset.index] = -1
      this.setData({
        chosedID,
        chosedCount: this.data.chosedCount - 1
      })
    } else {
      //选中
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
    //全不选
    if (this.data.chosedCount == this.data.goodsList.length) {
      for (let i = 0; i < this.data.goodsList.length; i++) {
        chosedID[i] = -1
      }
      this.setData({
        chosedID,
        chosedCount: 0
      })
    } else {
      //全选
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
   * 删除
   */
  delete() {
    var deleteArray = []
    var chosedID = this.data.chosedID
    chosedID.forEach(function(elem) {
      if (elem != -1) {
        deleteArray.push(elem)
      }
    })
    chosedID.fill(-1)
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/goods/removeSoldGoods',
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
            that.setData({
              deleteArray: [],
              goodsList,
              chosedCount: 0
            })
          }
        })
      },
    })
    this.edit()
  },


  /**
   * 获取物品列表
   */
  getGoodsList() {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/goods/sold',
          header: {
            token
          },
          success(res) {
            var goodsList = res.data.data
            console.log(goodsList)

            if (goodsList != null && goodsList.length > 0) {
              goodsList.forEach((item) => {
                for (let i in that.data.labelList) {
                  if (item.label == that.data.labelList[i].id) {
                    item.label = that.data.labelList[i]
                  }
                }
              })
              //标签id转化为对应的对象

              that.setData({
                goodsList,
                empty:false
              })
              //初始化chosedID：全部置为-1
              var chosedID = (new Array(res.data.data.length)).fill(-1)
              that.setData({
                chosedID
              })
            } else {
              that.setData({
                empty: true
              })
            }
          }
        })
      },
    })
  },


})