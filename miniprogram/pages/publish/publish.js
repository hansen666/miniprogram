// miniprogram/pages/publish/publish.js
const app = getApp()

Page({
  data: {
    textArray: [
      "1，用户发布的物品经后台审核通过才会展示出来",
      "2，求购信息将会展示在心愿墙上",
      "3，物品上传必须上传实物照片，不得使用虚假照片",
      "4，若发现其它违规物品，可以通过在线反馈告知系统",
      "5，同一物品只能发布一次，不得重复发布"
    ]
  },

  /**
   * 页面加载
   */
  onLoad: function(options) {},

  /**
   * 到发布二手物页
   */
  toGoods(){
    wx.navigateTo({
      url: '/pages/publishGoods/publishGoods',
    })
  },

  /**
   * 到发布心愿页
   */
    toWishes() {
    wx.navigateTo({
      url: '/pages/publishWishes/publishWishes',
    })
  }

})