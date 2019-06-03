import 'styles/app.styl'
import utils from 'src/libs/utils'
import * as PIXI from 'pixi.js'
import $ from 'zepto-webpack'
import Wechat from './libs/wechat'



const config = require('root/app.json')
const manifest = require('src/manifest.json')
require('src/vendors/scroller/src/Animate')
require('src/vendors/scroller/src/Scroller')


const app = {
  
  init() {
    this.initAssets()
  },

  initAssets() {
    const assets = {}
    for(let item of manifest) {
      Object.assign(assets, item)
    }
    this.assets = {
      image: [],
      sound: []
    }
    utils.getAssets(assets.image, this.assets.image)
    utils.getAssets(assets.sound, this.assets.sound)
  }

}

app.init()

window.PIXI = PIXI
window.Wechat = Wechat





