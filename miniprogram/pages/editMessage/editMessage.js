// miniprogram/pages/editMessage/editMessage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this

      wx.getStorage({
        key: 'token',
        success: function(res) {
          const token=res.data
          wx.request({
            url: 'http://localhost:8080/user/information',
            header:{
              token
            },
            success(res){

              var userInfo=res.data.data;
              that.setData({
                avatarUrl:userInfo.avatarUrl,
                nickname:userInfo.nickname,
                realName:userInfo.realName,
                schoolName:userInfo.schoolName,
                phone:userInfo.phone,
                wxNumber:userInfo.wxNumber,
                identifiedType:userInfo.identifiedType
              })
              if (userInfo.identifiedType==0){
                  that.setData({
                    identity:"未认证"
                  })
              } else if (userInfo.identifiedType==1){
                that.setData({
                  color: "#aaa",
                  identity: "学生"
                })
              }else{
                that.setData({
                  color: "#aaa",
                  identity: "老师"
                })
              }
              if (options.schoolName) {
                that.setData({
                  schoolName: options.schoolName
                })
              }
            }
          })
        },
      })


  },

  /**
   * 更换头像
   */
  chooseAvatarUrl(){
    var that=this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        wx.getStorage({
          key: 'token',
          success: function(res) {
            const token=res.data
            wx.uploadFile({
              url: "http://localhost:8080/goods/imageUpload",
              filePath: tempFilePaths[0],
              name: "file",
              header: {
                token
              },
              formData: {
                id: 1,
                filePath: "avatar"
              },
              success(res) {
                if (JSON.parse(res.data).code == -1) {
                  console.log("上传文件错误")
                  return
                }
                var avatarUrl=JSON.parse(res.data).data.fileName
                wx.request({
                  url: 'http://localhost:8080/user/modify',
                  method: "POST",
                  header: {
                    token
                  },
                  data: {
                   avatarUrl
                  },
                  success(res) {
                    //TODO  替换为 更换后的头像
                    console.log("success")
                    // wx.switchTab({
                    //   url: '/pages/myHome/myHome',
                    // })
                  }
                })
              },
              fail(res) {
                console.log("fail")
              }
            })
          },
        })
        
      }
    })
  },

/**
 * 选择学校
 */
  chooseSchool(){

    if (this.data.identifiedType==0){
    wx.navigateTo({
      url: '/pages/chooseSchool/chooseSchool?modifySchool='+true,
    })
    }else{
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
  save(e){
    console.log(e);
    var that=this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token=res.data
        wx.request({
          url: 'http://localhost:8080/user/modify',
          method: "POST",
          header: {
            token
          },
          data:{
            nickname: e.detail.value.nickname,
            realName: e.detail.value.realName,
            schoolName: e.detail.value.schoolName,
            phone: e.detail.value.phone,
            wxNumber: e.detail.value.wxNumber
          },
          success(res){
            wx.switchTab({
              url: '/pages/myHome/myHome',
            })
          }
        })
      },
    })

  }
})