// component/commentModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder:{
      type:String,
      value:"说点什么吧"
    },
    showModal:{
      type:Boolean,
      value:false
    },
    comment:{
      type:String,
      value:""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
      
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideModal() {
      this.setData({
        showModal: false
      })
      this.triggerEvent('unSend', this.data.commentMessage);
    },
    bindCommentMessage(e) {
      this.setData({
        commentMessage: e.detail.value
      })
    },
    send(e){
      this.setData({
        showModal: false,
      })
      this.triggerEvent('send', this.data.commentMessage);
    
    }
  }
})
