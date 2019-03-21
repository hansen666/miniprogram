// miniprogram/pages/publishWishes/publishWishes.js
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'RP7BZ-LE2HW-OEIRO-OZLUZ-OT662-K5BG7' // 必填
});

Page({

  data: {
    imageCount: 4,
    tempFilePaths: [],
    title: '',
    label: {},
    description: '',
    phone: '',
    price: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (options.label) {
      wx.getStorage({
        key: 'publishGoodsData',
        success: function (res) {
          that.setData({
            title: res.data.title,
            description: res.data.description,
            price: res.data.price,
            phone: res.data.phone,
            tempFilePaths: res.data.tempFilePaths
          })
        },
      })
      this.setData({
        label: JSON.parse(options.label)
      })
      console.log(this.data)
    }

  },
  inputTitle(e) {
    this.setData({
      title: e.detail.value
    })
  },
  inputDescription(e) {
    this.setData({
      description: e.detail.value
    })
  },
  inputPrice(e) {
    this.setData({
      price: e.detail.value
    })
  },
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  chooseLabel(e) {
    wx.setStorage({
      key: 'publishGoodsData',
      data: this.data,
    })
    wx.redirectTo({
      url: '/pages/label/label?fromPage=/pages/publishWishes/publishWishes',
    })
  },
  chooseImage() {
    if (this.data.imageCount == 0) {
      wx.showModal({
        title: '警告',
        content: '最多允许上传四张照片',
        showCancel: false,
        confirmText: '确定'
      })
      return;
    }
    let that = this;
    wx.chooseImage({
      count: this.data.imageCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        that.setData({
          tempFilePaths: that.data.tempFilePaths.concat(tempFilePaths),
          imageCount: that.data.imageCount - tempFilePaths.length
        })
      }
    })

  },
  deleteImage(e) {
    var tempFilePaths = this.data.tempFilePaths
    tempFilePaths.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      tempFilePaths: tempFilePaths,
      imageCount: this.data.imageCount + 1
    })

  },
  checkInput(name, warnMessage) {
    if (!name) {
      wx.showModal({
        title: '警告',
        content: warnMessage,
        showCancel: false,
        confirmText: '确定'
      })
      return false;
    }
    return true;

  },
  publish(e) {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        if (!that.checkInput(e.detail.value.title, '标题不能为空')) {
          return
        }
        if (!that.checkInput(e.detail.value.label, '请选择物品标签')) {
          return
        }
        if (!that.checkInput(e.detail.value.description, '描述不能为空')) {
          return
        }
        // if (!that.checkInput(e.detail.value.price, '请输入价格')) {
        //   return
        // }
        if (!that.checkInput(e.detail.value.phone, "手机号不能为空")) {
          return
        }
        // if (!that.checkInput(that.data.tempFilePaths.length > 0, '请选择物品的图片')) {
        //   return
        // }
        const arr = []
        let id = 0;
        for (let path of that.data.tempFilePaths) {
          arr.push(that.uploadImage(path, id))
          id++
        }
        wx.showLoading({
          title: '正在发布.....',
          mask: true
        })

        // 开始并行上传图片
        Promise.all(arr).then(res => {
          return res.sort(that.compare("id")).map(item => item.fileName)
        }).then(urls => {
          let picUrl = ""
          for (let url of urls) {
            picUrl += url + ","
          }
          picUrl = picUrl.substring(0, picUrl.length - 1)
          wx.getStorage({
            key: 'token',
            success: function (res) {
          wx.request({
            url: 'http://localhost:8080/goods/want',
            method: "POST",
            header: {
             "token":res.data
            },
            data: {
              "goodsName": e.detail.value.title,
              "label": that.data.label.id,
              picUrl,
              "description": e.detail.value.description,
              "price": Number(e.detail.value.price).toFixed(2),
              "phone": e.detail.value.phone,
              latitude,
              longitude
            },
            success(res) {
              console.log(res)
            }
          })
            }
          })
        }).then(() => {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: "发布成功",
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/publish/publish',
                })
              }
            }
          })
        }).catch(err => {
          wx.hideLoading()
          wx.showModal({
            title: '警告',
            content: err,
            showCancel: false,
            confirmText: '确定'
          })
          console.log(">>>> upload images error:", err)
        })

      }
    })
  },
  uploadImage(filePath, id) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: "http://localhost:8080/goods/imageUploads",
        filePath: filePath,
        name: "file",
        formData: {
          id: id,
          filePath:"wishes"
        },
        success(res) {
          if (JSON.parse(res.data).code == -1) {
            reject("上传文件错误")
          }
          resolve(JSON.parse(res.data).data)
        },
        fail(res) {
          console.log("fail")
        }
      })
    })
  },
  compare(property) {
    return function (obj1, obj2) {
      var value1 = obj1[property];
      var value2 = obj2[property];
      return value1 - value2; // 升序
    }
  }
})