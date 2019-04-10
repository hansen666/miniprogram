// miniprogram/pages/editMessage/editMessage.js
const app = getApp()
Page({
  data: {
    avatarUrl: '', //头像
    identifiedType: 0, //认证类型：0-未认证，1-学生
    nickname: '', //昵称
    realName: '', //真实姓名
    schoolName: '', //学校名称
    phone: '', //电话
    wxNumber: '', //微信号
  },

  /**
   * 页面加载
   * 获取用户基本信息
   * 
   */
  onLoad: function(options) {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/user/information`,
      header: {
        token
      },
      success(res) {
        var userInfo = res.data.data;
        that.setData({
          avatarUrl: userInfo.avatarUrl,
          nickname: userInfo.nickname,
          realName: userInfo.realName,
          schoolName: userInfo.schoolName,
          phone: userInfo.phone,
          wxNumber: userInfo.wxNumber,
          identifiedType: userInfo.identifiedType
        })
        if (options.schoolName) {
          that.setData({
            schoolName: options.schoolName
          })
        }
      }
    })

  },

  /**
   * 更换头像
   */
  chooseAvatarUrl() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0]
        const token = wx.getStorageSync('token')
        wx.uploadFile({
          url: `${app.globalData.hostname}/goods/imageUpload`,
          filePath: tempFilePath,
          name: "file",
          header: {
            token
          },
          formData: {
            filePath: "avatar"
          },
          success(res) {
            if (JSON.parse(res.data).code == -1) {
              console.log("上传文件错误")
              return
            }
            var avatarUrl = JSON.parse(res.data).data.fileName
            that.setData({
              avatarUrl
            })
            wx.request({
              url: `${app.globalData.hostname}/user/modify`,
              method: "POST",
              header: {
                token
              },
              data: {
                avatarUrl
              },
              success(res) {
              }
            })
          },
          fail(err) {
            console.log("fail", err)
          }
        })
      },
    })
  },

  /**
   * 选择学校
   */
  chooseSchool() {
    if (this.data.identifiedType == 0) {
      wx.navigateTo({
        url: '/pages/chooseSchool/chooseSchool?modifySchool=' + true,
      })
    } else {
      wx.showToast({
        title: '认证后的用户暂时无法修改学校',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 保存修改
   */
  save(e) {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.hostname}/user/modify`,
      method: "POST",
      header: {
        token
      },
      data: {
        nickname: e.detail.value.nickname,
        realName: e.detail.value.realName,
        schoolName: e.detail.value.schoolName,
        phone: e.detail.value.phone,
        wxNumber: e.detail.value.wxNumber
      },
      success(res) {
        wx.switchTab({
          url: '/pages/myHome/myHome',
        })
      }
    })
  }

})