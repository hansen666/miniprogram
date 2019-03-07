// miniprogram/pages/chooseSchool/chooseSchool.js
Page({

  data: {
    schoolArray: [],
    searchedSchools: [],
    schoolName: ''
  },

  onLoad: function(options) {
    let that = this;
    wx.request({
      url: 'http://localhost:8080/homePage/selectSchool2',
      success(res) {
        var schoolArray = res.data.data
        that.setData({
          schoolArray: schoolArray
        })
      }
    })
  },

  searchInputAction: function(e) {
    this.setData({
      schoolName: e.detail.value
    })
    //获取输入值
    let value = e.detail.value;
    if (value.length <= 0) {
      this.setData({
        showSchools: false
      })
      return
    }

    this.setData({
      showSchools: true
    })
    const schoolArray = this.data.schoolArray
    var searchedSchools = []
    var id = 1;
    for (const index in schoolArray) {
      if (schoolArray[index].indexOf(e.detail.value) >= 0) {
        searchedSchools.push({
          'id': id++,
          'key': e.detail.value,
          'name': schoolArray[index]
        })
      }
    }
    this.setData({
      searchedSchools
    })
  },

  chooseSearchResultAction: function(e) {
    this.setData({
      schoolName: e.target.dataset.name,
      showSchools: false
    })
  },

  setSchool: function() {
    if (this.data.schoolName && this.data.schoolArray.includes(this.data.schoolName)) {
      var nickName=""
      var avatarUrl=""

      wx.getUserInfo({
        success: res => {
          nickName = res.userInfo.nickName
          avatarUrl = res.userInfo.avatarUrl
        }
      })
      // try {
      //   const key = wx.getStorageSync('key')
      // } catch (e) {
      //   // Do something when catch error
      // }
      // wx.request({
      //   url: '',
      //   method:'POST',
      //   data:{
      //     schoolName:this.data.schoolName,
      //     nickName:nickName,
      //     avatarUrl:avatarUrl,
      //     key:key
      //   },
      //   success(res) {
      //     console.log(res.data)
      //     wx.redirectTo({
      //       url: '/pages/index/index',
      //     })
      //   }
      // })
    } else {
      wx.showModal({
        title: '警告',
        content: '该学校不存在，请重新选择',
        showCancel: false,
        confirmText: '返回'
        // success: function(res) {
        //   if (res.confirm) {
        //     console.log('用户点击了“返回授权”')
        //   }
        // }
      })
    }
  }
})