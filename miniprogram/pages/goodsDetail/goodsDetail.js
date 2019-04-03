// miniprogram/pages/goodsDetail/goodsDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   * 获取物品详情
   * 
   */
  onLoad: function(options) {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        wx.request({
          url: 'http://localhost:8080/goods/showHomeDetail',
          header: {
            token
          },
          data: {
            "id": options.id
          },
          success(res) {
            var result = res.data.data
            //将逗号分割的图片转化为数组
            result.picUrl = Array.of(result.picUrl.split(','))
            if (!result.realName) {
              result.realName = "***"
            }
            var identifiedLabel;
            switch (result.identifiedType) {
              case 0:
                identifiedLabel = "未认证"
                break
              case 1:
                identifiedLabel = "学生"
                break
              case 2:
                identifiedLabel = "老师"
                break
            }
            that.setData({
              avatarUrl: result.avatarUrl,
              nickname: result.nickname,
              identifiedType: result.identifiedType,
              picUrl: result.picUrl,
              name: result.name,
              description: result.description,
              price: result.price,
              browseCount: result.browseCount,
              pubTime: result.pubTime,
              phone: result.phone,
              realName: result.realName,
              goodsID: options.id,
              identifiedLabel
            })

            //获取买家认证类型
            wx.request({
              url: 'http://localhost:8080/user/identifiedType',
              header: {
                token
              },
              success(res) {
                console.log(res.data.data)
                if (res.data.data.identifiedType == 0) {
                  var phone = that.data.phone
                  that.setData({
                    phone: phone.substring(0, 1) + "*********" + phone.substring(phone.length - 1),
                    identifiedType: res.data.data.identifiedType
                  })
                }
              }
            })

            //获取买家是否已收藏该物品
            wx.request({
              url: 'http://localhost:8080/goods/isGoodsCollected',
              header: {
                token
              },
              data: {
                goodsID: that.data.goodsID
              },
              success(res) {
                that.setData({
                  collected: res.data.data.isCollected
                })
              }
            })
            //测试用图片
            that.setData({
              picUrl: [
                "../../images/search.png",
                "../../images/index.png",
                "../../images/camera.png"
              ]
            })
          }
        })
      },
    })
  },

/**
 * 点击查看大图 
 */
  imgView(e){
    var src=e.currentTarget.dataset.src
    var imgList=e.currentTarget.dataset.list 
    console.log(src)
    wx.previewImage({
      current:src,
      urls: imgList,
    })
  },

  /**
   * 收藏/取消收藏
   */
  collection() {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function(res) {
        const token = res.data
        if (that.data.collected) {
          wx.request({
            url: 'http://localhost:8080/goods/cancelCollection?goodsID=' + that.data.goodsID,
            method: "DELETE",
            header: {
              token
            },
            success(res) {
              that.setData({
                collected:false
              })
            }
          })
        }else{
          wx.request({
            url: 'http://localhost:8080/goods/collect?goodsID=' + that.data.goodsID,
            method: "POST",
            header: {
              token
            },
            success(res) {
              console.log(res)
              that.setData({
                collected: true
              })
            }
          })
        }
      }
    })



  },

  /**
   * 进行身份认证
   */
  toIdentity() {
      wx.navigateTo({
        url: '/pages/identityConfirm/identityConfirm',
      })
  }
})