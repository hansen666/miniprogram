// miniprogram/pages/login/login.js
const app = getApp()

Page({

      /**
       * 页面的初始数据
       */
      data: {

      },

      /**
       * 用户授权处理函数
       */
      binGetUserInfo: function(e) {
        if (e.detail.userInfo) {
          wx.login({
              success(e) {
                if (e.code) {
                  // wx.request({
                  //   url: 'https://test.com/onLogin',
                  //   data: {
                  //     code: res.code
                  //   },
                  //   success(res) {
                  //    //0，代表用户存在,进入首页
                  //     //1，用户不存在，进入学校选择界面
                  // wx.setStorage({
                  //   key: 'key',
                  //   data: 'value'
                  // })
                  // if (code == 0) {
                  //   wx.redirectTo({
                  //     url: '/pages/index/index',
                  //   })
                  // } else {
                  //   wx.redirectTo({
                  //     url: '/pages/chooseSchool/chooseSchool',
                  //   })
                    //     }
                    //     console.log(res.data)
                    //   }
                    // })
                    wx.redirectTo({
                      url: '/pages/chooseSchool/chooseSchool',
                    })
                  } else {
                    console.log('登录失败！' + res.errMsg)
                  }
                }
              })
            //判断该用户是否选择了学校

            //
          }
          else {
            //用户点了拒绝按钮
            wx.showModal({
              title: '警告',
              content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
              showCancel: false,
              confirmText: '返回授权',
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击了“返回授权”')
                }
              }
            })
          }
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function(options) {

          },









          /**
           * 页面相关事件处理函数--监听用户下拉动作
           */
          onPullDownRefresh: function() {

          },

          /**
           * 页面上拉触底事件的处理函数
           */
          onReachBottom: function() {

          },

          /**
           * 用户点击右上角分享
           */
          onShareAppMessage: function() {

          }
      })