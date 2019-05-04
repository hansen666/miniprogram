// miniprogram/pages/chooseSchool/chooseSchool.js
const app = getApp()
var schoolArray //数据库中学校名称列表
Page({
  data: {
    searchedSchools: [], //通过关键字匹配到的学校名称
    schoolName: '' //输入框中的学校名称
  },

  /**
   * 页面加载
   * 获取学校列表
   */
  onLoad: function(options) {
    if (options.modifySchool) {
      this.setData({
        modifySchool: options.modifySchool
      })
    }
    //调用用户地理位置接口，以弹出授权地理位置权限
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
      }
    })

    let that = this;
    wx.request({
      url: `${app.globalData.hostname}/login/selectSchool`,
      success(res) {
        schoolArray = res.data.data
      }
    })
  },

  /**
   * 输入关键字，搜索学校名称
   */
  searchInputAction: function(e) {
    var schoolName = e.detail.value;
    this.setData({
      schoolName
    })
    //获取输入值

    if (schoolName.length <= 0) {
      this.setData({
        showSchools: false
      })
      return
    }

    this.setData({
      showSchools: true
    })

    var searchedSchools = []
    var id = 1;
    schoolArray.forEach((schoolName) => {
      if (schoolName.indexOf(e.detail.value) >= 0) {
        searchedSchools.push({
          'id': id++,
          'key': e.detail.value,
          'name': schoolName
        })
      }
    })
    this.setData({
      searchedSchools
    })
  },

  /**
   * 选择学校
   */
  chooseSearchResultAction(e) {
    this.setData({
      schoolName: e.target.dataset.name,
      showSchools: false
    })
  },

  /**
   * 提交,如果是用户第一次选择学校，添加该用户到数据库中
   */
  submit() {
    if (this.data.schoolName && schoolArray.includes(this.data.schoolName)) {
      //修改学校 
      if (this.data.modifySchool) {
        wx.redirectTo({
          url: `/pages/editMessage/editMessage?schoolName=${this.data.schoolName}`,
        })
      } else {
        //第一次选择学校
        const schoolName = this.data.schoolName
        wx.getUserInfo({
          success: res => {
            const nickname = res.userInfo.nickName
            const avatarUrl = res.userInfo.avatarUrl
            wx.login({
              success(res) {
                wx.request({
                  url: `${app.globalData.hostname}/login/getToken`,
                  data: {
                    code: res.code
                  },
                  success(res) {
                    const token = res.data.data.token
                    wx.request({
                      url: `${app.globalData.hostname}/user/addUser`,
                      method: 'POST',
                      data: {
                        schoolName,
                        nickname,
                        avatarUrl
                      },
                      header: {
                        token
                      },
                      success(res) {
                        wx.setStorageSync('token', token)
                        wx.switchTab({
                          url: '/pages/index/index',
                        })
                      }
                    })
                  }
                })
              }
            })
          }

        })
      }
    } else {
      wx.showModal({
        title: '警告',
        content: '该学校不存在，请重新选择',
        showCancel: false,
        confirmText: '返回'
      })
    }

  }

})