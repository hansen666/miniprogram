// miniprogram/pages/feedBack/feedBack.js
const app = getApp()
Page({
      data: {
        content: '',
      },

      /**
       * 获取输入值
       */
      inputContent(e) {
        this.setData({
          content: e.detail.value
        })
      },

      /**
       * 提交用户评论
       */
      submit() {
        if (this.data.content) {
          const token = wx.getStorageSync('token')
          wx.request({
              url: `${app.globalData.hostname}/user/sendFeedback`,
              method: 'POST',
              header: {
                token
              },
              data: {
                content: this.data.content
              },
              success(res) {
                wx.showModal({
                  name: '提示',
                  content: "提交成功",
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      wx.navigateBack({
                        delta: 1
                      })
                    }
                  }
                })
              }
            })
          }
        }

      })