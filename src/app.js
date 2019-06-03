import 'styles/app.styl'
import utils from 'src/libs/utils'
import * as PIXI from 'pixi.js'
import $ from 'zepto-webpack'
import Wechat from './libs/wechat'

const config = require('root/app.json')
const manifest = require('src/manifest.json')

const assets = {}, scenes = {}

const app = {
  
  init() {
    this.initAssets()
    this.initScenes()
  },

  initAssets() {
    for(let item of manifest) {
      Object.assign(assets, item)
    }
    const image = [], sound = []
    utils.getAssets(assets.img, image)
    utils.getAssets(assets.sound, sound)
    this.assets = {
      image,
      sound
    }
  },

  initScenes() {
    for(let id of config.scenes) {
      scenes[id] = {
        assets: {
          image: utils.getSceneAssets(id, assets.img),
          sound: utils.getSceneAssets(id, assets.sound)
        }
      }
    }
  }

}

app.init()

window.PIXI = PIXI
window.Wechat = Wechat





