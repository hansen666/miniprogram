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
    submitType: "发布",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    //从分类标签页过来
    if (options.label) {
      wx.getStorage({
        key: 'publishGoodsData',
        success: function(res) {
          that.setData({
            name: res.data.name,
            description: res.data.description,
            price: res.data.price,
            phone: res.data.phone,
            tempFilePaths: res.data.tempFilePaths,
            submitType: res.data.submitType
          })
        },
      })
      this.setData({
        label: JSON.parse(options.label)
      })
    }
    //从我的发布页过来
    if (options.id) {
      console.log("心愿墙", options.id)
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
              id: options.id
            },

            success(res) {
              var goodsDetail = res.data.data
              console.log(goodsDetail)
              app.globalData.labelList.forEach((label) => {
                if (label.id == goodsDetail.label) {
                  goodsDetail.label = label
                }
              })
              that.setData({
                name: goodsDetail.name,
                description: goodsDetail.description,
                price: goodsDetail.price,
                phone: goodsDetail.phone,
                //tempFilePaths: goodsDetail.tempFilePaths,
                label: goodsDetail.label,
                id: options.id,
                submitType: "保存"
              })



            }
          })
        },
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
    wx.setStorage({
      key: 'publishGoodsData',
      data: this.data,
    })
    wx.redirectTo({
      url: '/pages/label/label?fromPage=/pages/publishGoods/publishGoods',
    })
  },

  /**
   * 选择图片
   */
  chooseImage() {
    if (this.data.imageCount == 0) {
      wx.showModal({
        name: '警告',
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

  /**
   * 点击查看大图 
   */
  imgView(e) {
    var src = e.currentTarget.dataset.src
    var imgList = e.currentTarget.dataset.list
    console.log(src)
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
    tempFilePaths.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      tempFilePaths: tempFilePaths,
      imageCount: this.data.imageCount + 1
    })
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
    let that = this
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
        const arr = []
        let id = 0;
        wx.getStorage({
          key: 'token',
          success: function(res) {
            const token = res.data
            for (let path of that.data.tempFilePaths) {
              arr.push(that.uploadImage(token, path, id))
              id++
            }
            wx.showLoading({
              name: '正在发布.....',
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
              var urlString = ""
              if (that.data.submitType == "发布") {
                urlString = "http://localhost:8080/goods/publish"
              } else if (that.data.submitType == "保存") {
                urlString = "http://localhost:8080/goods/modifyMyPublish"
              }
              wx.request({
                url: urlString,
                method: "POST",
                header: {
                  token
                },
                data: {
                  "goodsName": e.detail.value.name,
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
                  console.log(res)
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
                          wx.redirectTo({
                            url: '/pages/myPublish/myPublish',
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
              console.log(">>>> upload images error:", err)
            })
          },
        })
      },fail(err){
        console.log("获取地理位置失败")
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
        url: "http://localhost:8080/goods/imageUpload",
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