import net from './net'

let conf

class Wechat {

  constructor(config) {
    this.config = {
      apiURL: 'http://uniqueevents.sinaapp.com/wx/getJsAPIA.php',
      wxURL: 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js',
      url: encodeURIComponent(location.href.split('#')[0]),
      debug: false,
      type: 'post',
      jsonp: true,
      data:{
        link: location.href,
        title: '',
        desc: '',
        imgUrl: '',
        success: null,
        cancel: null
      }
    }
    Object.assign(this.config, config)
    this.init()
  }

  init() {
    conf = this.config
    this.timelineData = Object.assign({}, conf.data)
    this.appMessageData = Object.assign({}, conf.data) 
    net.loadScript({
      url: conf.wxURL,
      success: ()=> {
        this.initShare()
      }
    })
  }

  initShare() {
    net.ajax({
      url: conf.apiURL,
      type: conf.type,
      data: {
        url: conf.url
      },
      jsonp: conf.jsonp,
      success: (data)=> {
        this.initData(data)
      }
    })
  }

  initData(data) {
    if(wx) {
      wx.config({
        debug: conf.debug,
        appId: data.appId,
        timestamp: data.timestamp, 
        nonceStr: data.nonceStr, 
        signature: data.signature,
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] 
      })
      wx.ready(() => {
        wx.onMenuShareTimeline(this.timelineData)
        wx.onMenuShareAppMessage(this.appMessageData)
      })
    }
  }

  shareToTimeline(data) {
    const obj = Object.assign(this.timelineData, data)
    wx && wx.onMenuShareTimeline(obj)
  }

  shareToFriend(data) {
    const obj = Object.assign(this.appMessageData, data)
    wx && wx.onMenuShareAppMessage(obj)
  }

  shareToAll(data) {
    this.shareToTimeline(data)
    this.shareToFriend(data)
  }

}

export default Wechat