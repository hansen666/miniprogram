// miniprogram/pages/publishGoods/publishGoods.js
const app = getApp()

Page({
  data: {
    imageCount: 4, //最多允许上传的照片数
    tempFilePaths: [], //上传图片临时文件名称
    name: '', //标题
    label: {}, // 物品标签
    description: '', //物品描述
    phone: '', //联系方式
    price: '', //  价格
    id: '', //物品id
    submitType: "发布",
  },

  /**
   * 页面加载
   */
  onLoad: function(options) {
    var that = this
    //从分类标签页过来
    if (options.label) {
      const data = wx.getStorageSync('publishGoodsData')
      that.setData({
        name: data.name,
        description: data.description,
        price: data.price,
        phone: data.phone,
        id:data.id,
        tempFilePaths: data.tempFilePaths,
        submitType: data.submitType,
        label: JSON.parse(options.label)
      })
    }
    //从我的发布页过来
    if (options.id) {
      const token = wx.getStorageSync('token')
      wx.request({
        url: `${app.globalData.hostname}/goods/showHomeDetail`,
        header: {
          token
        },
        data: {
          id: options.id
        },
        success(res) {
          var goodsDetail = res.data.data
          app.globalData.labelList.forEach((label) => {
            if (label.id == goodsDetail.label) {
              goodsDetail.label = label
            }
          })

          var picUrl = goodsDetail.picUrl.split(',');

          for (let i = 0; i < picUrl.length; i++) {
            picUrl[i] = `${app.globalData.REMOTE_PATH}/publish/${picUrl[i]}`
          }
          that.setData({
            name: goodsDetail.name,
            description: goodsDetail.description,
            price: goodsDetail.price,
            phone: goodsDetail.phone,
            tempFilePaths: picUrl,
            imageCount: 4 - picUrl.length,
            label: goodsDetail.label,
            id: options.id,
            submitType: "保存"
          })

        }
      })
    }
  },

  /**
   * 设置输入的标题
   */
  inputName(e) {
    this.setData({
      name: e.detail.value
    })
  },

  /**
   * 设置输入的描述
   */
  inputDescription(e) {
    this.setData({
      description: e.detail.value
    })
  },

  /**
   * 设置输入的价格
   */
  inputPrice(e) {
    this.setData({
      price: e.detail.value
    })
  },

  /**
   * 设置输入的手机号
   */
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  /**
   * 选择分类标签
   */
  chooseLabel(e) {
    wx.setStorageSync('publishGoodsData', this.data)
    wx.redirectTo({
      url: '/pages/label/label?fromPage=/pages/publishGoods/publishGoods',
    })
  },

  /**
   * 选择图片
   */
  chooseImage() {
    var that = this;
    if (this.data.imageCount == 0) {
      wx.showModal({
        name: '警告',
        content: '最多允许上传四张照片',
        showCancel: false,
        confirmText: '确定'
      })
      return;
    }
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

  /**
   * 点击查看大图 
   */
  imgView(e) {
    var src = e.currentTarget.dataset.src
    var imgList = e.currentTarget.dataset.list
    wx.previewImage({
      current: src,
      urls: imgList,
    })
  },

  /**
   * 删除图片
   */
  deleteImage(e) {
    var tempFilePaths = this.data.tempFilePaths
    var fileUrl = e.currentTarget.dataset.src
    tempFilePaths.splice(e.currentTarget.dataset.index, 1)

    this.setData({
      tempFilePaths: tempFilePaths,
      imageCount: this.data.imageCount + 1
    })
    if (fileUrl.indexOf('https') == 0) {
      var that = this
      var fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
      const token = wx.getStorageSync('token')
      wx.request({
        url: `${app.globalData.hostname}/goods/deleteImage`,
        method: "POST",
        header: {
          token
        },
        data: {
          id: that.data.id,
          imageName: fileName,
          method: "publish"
        }
      })
    }
  },

  /**
   * 检查输入值
   */
  checkInput(name, warnMessage) {
    if (!name) {
      wx.showModal({
        name: '警告',
        content: warnMessage,
        showCancel: false,
        confirmText: '确定'
      })
      return false;
    }
    return true;
  },

  /**
   * 发布/保存
   */
  publish(e) {
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        if (!that.checkInput(e.detail.value.name, '标题不能为空')) {
          return
        }
        if (!that.checkInput(e.detail.value.label, '请选择物品标签')) {
          return
        }
        if (!that.checkInput(e.detail.value.description, '描述不能为空')) {
          return
        }
        if (!that.checkInput(e.detail.value.price, '请输入价格')) {
          return
        }
        if (!that.checkInput(e.detail.value.phone, "手机号不能为空")) {
          return
        }
        if (!that.checkInput(that.data.tempFilePaths.length > 0, '请选择物品的图片')) {
          return
        }
        var id = 0;
        const arr = []
        const token = wx.getStorageSync('token')
        for (let path of that.data.tempFilePaths) {
          if (path.indexOf('https') != 0) {
            arr.push(that.uploadImage(token, path, id))
            id++
          }
        }
        wx.showLoading({
          name: '正在发布.....',
          mask: true
        })
        // 开始并行上传图片
        Promise.all(arr).then(res => {
          return res.sort(that.compare("id")).map(item => item.fileName)
        }).then(urls => {
          var picUrl = ""
          for (let url of urls) {
            picUrl += url + ","
          }
          picUrl = picUrl.substring(0, picUrl.length - 1)
          var urlString = ""
          if (that.data.submitType == "发布") {
            urlString = `${app.globalData.hostname}/goods/publish`
          } else if (that.data.submitType == "保存") {
            urlString = `${app.globalData.hostname}/goods/modifyMyPublish`
          }
          wx.request({
            url: urlString,
            method: "POST",
            header: {
              token
            },
            data: {
              "name": e.detail.value.name,
              "label": that.data.label.id,
              picUrl,
              "description": e.detail.value.description,
              "price": Number(e.detail.value.price).toFixed(2),
              "phone": e.detail.value.phone,
              latitude,
              longitude,
              id: that.data.id
            },
            success(res) {
              wx.hideLoading()
              wx.showModal({
                name: '提示',
                content: "发布成功",
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    if (that.data.submitType == "发布") {
                      wx.switchTab({
                        url: '/pages/publish/publish',
                      })
                    } else {
                      wx.navigateBack({
                        delta: 2
                      })
                    }
                  }
                }
              })
            }
          })
        }).catch(err => {
          wx.hideLoading()
          wx.showModal({
            name: '警告',
            content: "上传图片出错",
            showCancel: false,
            confirmText: '确定'
          })
        })
      },
      fail(err) {
        wx.showModal({
          title: '警告',
          content: '我们无法获取到您的实时位置，请确认已打开GPS后再进行发布',
        })
      }
    })
  },

  /**
   * 异步上传图片
   */
  uploadImage(token, filePath, id) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.hostname}/goods/imageUpload`,
        filePath: filePath,
        name: "file",
        header: {
          token
        },
        formData: {
          id: id,
          filePath: "publish"
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

  /**
   * 对象按指定属性升序排序
   */
  compare(property) {
    return function(obj1, obj2) {
      var value1 = obj1[property];
      var value2 = obj2[property];
      return value1 - value2; // 升序
    }
  }
})