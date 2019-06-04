import 'styles/app.styl'
import utils from 'src/libs/utils'
import * as PIXI from 'pixi.js'

import $ from 'zepto-webpack'
import { TweenMax } from 'gsap/TweenMax'
import Wechat from './libs/wechat'


const config = require('root/app.json')
const manifest = require('src/manifest.json')
require('src/vendors/scroller/src/Animate')
require('src/vendors/scroller/src/Scroller')
require('pixi-sound')

let ww = window.innerWidth
let wh = window.innerHeight
let res, scroller, pixi

const max = 5000

const wrap = $('#main')

const app = {
  
  init() {
    this.initAssets()
    this.initLoader()
    this.initEvents()
  },

  handleScroll(left, top, zoom) {
    const delta = top
    this.container.x = -delta

    if(100 < delta && delta < 2600) {
      this.part1BiaoMaskCont.scale.x = utils.map(100, 2600, delta ,0, 1)
    }
    if(0 < delta && delta < 100) {
      this.part1BiaoMaskCont.scale.x = 0
    }
    if(2600 < delta) {
      this.part1BiaoMaskCont.scale.x = 1
    }
    if(2080 < delta && delta < 3900){
      const scale = (1+Math.cos((delta-2080)*(48*Math.PI)/1820))/60+0.7
      this.part1Zhen1.rotation = utils.map(2080, 3900, delta, 0, Math.PI * 24)
      this.part1Zhen2.rotation = utils.map(2080, 3900, delta, 0, Math.PI * 2)
      this.part1Zhen1.scale.x = utils.map(2080, 3900, delta, 1, scale) 
      this.part1Zhen1.scale.y = utils.map(2080, 3900, delta, 1, scale)
    }
    if(2400 < delta && delta < 3940){
      this.part1Talk.x = utils.map(2400, 3940, delta, 3110, 2910)
    }

    if(4150 < delta && delta < 6000){
      this.part2.x = utils.map(4150,6000,delta,3571,5421)
    }

    if(2600 < delta && delta < 6000){
      this.part2HoleCont.rotation = utils.map(2600,6000,delta,0,8)
      this.part1HoleThing1.rotation = utils.map(2600,6000,delta,0,-2)
      this.part1HoleThing2.rotation = utils.map(2600,6000,delta,0,-5)
      this.part1HoleThing3.rotation = utils.map(2600,6000,delta,2,-6)

      this.part1HoleThing1.scale.x = utils.map(2600,6000,delta,0.4,1.2)
      this.part1HoleThing1.scale.y = utils.map(2600,6000,delta,0.4,1.2)

      this.part1HoleThing2.scale.x = utils.map(2600,6000,delta,0.2,1)
      this.part1HoleThing2.scale.y = utils.map(2600,6000,delta,0.2,1)

      this.part1HoleThing3.scale.x = utils.map(2600,6000,delta,0.5,1)
      this.part1HoleThing3.scale.y = utils.map(2600,6000,delta,0.5,1)
    }
    if(2600 < delta && delta < 4150){
      this.part2HoleCont.scale.x = utils.map(2600,4150,delta,0.4,1)
      this.part2HoleCont.scale.y = utils.map(2600,4150,delta,0.4,1)
    }

    if(110 < delta && delta < 3900 ){
      if(!res.dida.sound.isPlaying && res.dida.sound.flag) {
        res.dida.sound.volume = 1
        res.dida.sound.play()
        res.dida.sound.flag = false
      }
    }else{
      res.dida.sound.flag = true
    }
 
    if(50 < delta && delta < 110 ){
      if(res.dida.sound.isPlaying) {
        res.dida.sound.volume = (delta-50)/60
      }
    }
    if(1 < delta && delta < 50){
      res.dida.sound.pause()
    }

    if(3900 < delta && delta < 4100 ){
      if(res.dida.sound.isPlaying) {
        res.dida.sound.volume = 1+(delta-3900)/200
      }
    }
    if(4100 < delta){
      res.dida.sound.pause()
    }

    if(2900 < delta && delta < 3200){
      if(!res.nishuo1.sound.isPlaying && res.nishuo1.sound.flag){
        res.nishuo1.sound.volume = 1
        res.nishuo1.sound.play()
        res.nishuo1.sound.flag = false
      }
    } else {
      res.nishuo1.sound.flag = true
    }

    if(4400 < delta && delta < 5200 ){
      if(res.nishuo1.sound.isPlaying) {
        res.nishuo1.sound.volume = 1-(delta-4400)/800
      }
    }
    if(5200 < delta){
      res.nishuo1.sound.pause()
    }

    if(2200 < delta && delta < 2750 ){
      if(res.nishuo1.sound.isPlaying) {
        res.nishuo1.sound.volume = (delta-2200)/550
      }
    }
    if(1 < delta && delta < 2200){
      res.nishuo1.sound.pause()
    }
  },

  initScroll() {
    scroller = new Scroller((left, top, zoom) => {
      this.handleScroll(left, top, zoom)
    })
    scroller.setDimensions(
      pixi.view.width,
      pixi.view.height,
      pixi.view.height,
      max
    )
    scroller.scrollTo(0, 0, false)
  },

  initEvents() {
    const music = $('.music')
    music.on('click', ()=> {
      if(!res.bgm.sound.isPlaying){
        res.bgm.sound.play()
        music.removeClass('off')
      } else{
        res.bgm.sound.pause()
        music.addClass('off')
      }
    })
  
    wrap.on('touchstart', ()=> {
      TweenMax.fromTo(
        this.titleContainer,
        .4,
        {alpha:1},
        {alpha:0,
          onComplete:()=> {
            this.titleContainer.visible = false
            this.titleHandTween.pause()
        }}
      )
    })
    
    let touch = false
    $(document).on('touchstart', (e)=> {
      scroller.doTouchStart(e.touches, e.timeStamp)
      touch = true
    })
    $(document).on('touchmove', (e)=> {
      if(touch) {
        scroller.doTouchMove(e.touches, e.timeStamp)
      }
      e.preventDefault()
    })
    $(document).on('touchend', (e)=> {
      scroller.doTouchEnd(e.timeStamp)
      touch = false
    })
  },

  initScenes() {
    pixi = new PIXI.Application({
      width: config.width,
      height: config.height,
      backgroundColor: '0xffffff'
    })
    wrap.append(pixi.view)
    this.container = new PIXI.Container()
    this.container.interactive = true
    pixi.stage.addChild(this.container)
    this.setOrientation()
    this.initIntroScene()
    this.initPart1Scene()
    this.initPart2Scene()
    this.container.addChild(this.part2, this.part1)
    this.initScroll()
  },

  startScenes() {
    const target = $('.loading-wrap')
    TweenMax.to(target, .6, {
      alpha: 0,
      delay: .1,
      onComplete: ()=> {
        target.remove()
      }
    })
    this.titleHandTween.play()
    res.bgm.sound.loop = true
    res.bgm.sound.autoplay = true
    res.bgm.sound.play()
  },

  initPart1Scene() {
    this.part1 = new PIXI.Container();
    this.part1.x = 500
    this.part1.width = 3408
    this.part1BiaoCont = new PIXI.Container()
    this.part1BiaoCont.y = 205
    this.part1BiaoBg = utils.createSprite('part1/biao')
    this.part1Zhen1 = utils.createSprite('part1/zhen1',{
      x:3278,
      y:174
    })
    this.part1Zhen1.pivot.x = -9
    this.part1Zhen1.pivot.y = 59
    this.part1Zhen2 = utils.createSprite('part1/zhen2',{
      x:3278,
      y:174
    })
    this.part1Zhen2.pivot.x = -5
    this.part1Zhen2.pivot.y = 0
    this.part1BiaoCont.addChild(
      this.part1BiaoBg, 
      this.part1Zhen1, 
      this.part1Zhen2
    )
     
    this.part1BiaoMaskCont = new PIXI.Container()
    this.part1BiaoMaskCont.pivot.x = 0
    this.part1BiaoMaskCont.scale.x = 0
    this.part1BiaoMask = new PIXI.Graphics()
    this.part1BiaoMask.beginFill('0xofofof','0.5')
    this.part1BiaoMask.drawRect(0,0,3744,640)
    this.part1BiaoMask.endFill()
    this.part1BiaoMaskCont.addChild(this.part1BiaoMask)
    this.part1BiaoCont.mask = this.part1BiaoMask

    this.part1Talk = utils.createSprite('part1/talk',{
      x:3110,
      y:91
    })
    this.part1.addChild(
      this.part1BiaoCont,
      this.part1BiaoMaskCont,
      this.part1Talk
    )
  },

  initPart2Scene() {
    this.part2 = new PIXI.Container()
    this.part2.x = 3571
    this.part2HoleCont = new PIXI.Container();
    this.part2HoleCont.x = 1072
    this.part2HoleCont.y = 317
    this.part2HoleCont.pivot.x = 1072
    this.part2HoleCont.pivot.y = 1014
    this.part2HoleCont.scale.x = 0.4
    this.part2HoleCont.scale.y = 0.4

    this.part2HoleBg = utils.createSprite('part2/hole2')
    this.part2HoleBg.width = 2268
    this.part2HoleBg.height = 2182

    this.part2HoleHole = utils.createSprite('part2/holebg',{
      x:1072,
      y:1014
    })
    this.part2HoleHole.pivot.set(1072, 1014)
    this.part1HoleThing1 = utils.createSprite('part2/t1',{
      x:1072,
      y:1014
    })
    this.part1HoleThing1.pivot.x = 188
    this.part1HoleThing1.pivot.y = 253
    this.part1HoleThing1.scale.x = 0.4
    this.part1HoleThing1.scale.y = 0.4

    this.part1HoleThing2 = utils.createSprite('part2/t2', {
      x:1072,
      y:1014
    })
    this.part1HoleThing2.pivot.x = 188
    this.part1HoleThing2.pivot.y = 253
    this.part1HoleThing2.scale.x = 0.2
    this.part1HoleThing2.scale.y = 0.2

    this.part1HoleThing3 = utils.createSprite('part2/t3',{
      x:1072,
      y:1014
    })
    this.part1HoleThing3.pivot.x = 188
    this.part1HoleThing3.pivot.y = 253
    this.part1HoleThing3.scale.x = 0.5
    this.part1HoleThing3.scale.y = 0.5
    this.part1HoleThing3.rotation = 2

    this.part2HoleCont.addChild(
      this.part2HoleHole,
      this.part2HoleBg,
      this.part1HoleThing1,
      this.part1HoleThing2,
      this.part1HoleThing3
    )
    this.part2.addChild(this.part2HoleCont)
  },

  initIntroScene() {
    this.titleContainer = new PIXI.Container()
    this.titleStart = utils.createSprite('part1/title', {
      x: (wh - 541) / 2,
      y: 276
    })
    this.titleHand = utils.createSprite('part1/hand', {
        x:(wh - 83) / 2 + 65,
        y:350
    })
    this.titleContainer.addChild(
      this.titleStart,
      this.titleHand
    )
    this.container.addChild(this.titleContainer)
    this.titleHandTween = TweenMax.fromTo(
      this.titleHand,
      1.5, 
      {x: ((wh - 83) / 2 + 65)},
      {x:((wh - 83) / 2 - 65),
      ease:Linear.easeNone
    }).repeat(-1)
    this.titleHandTween.pause()
    
  },

  setOrientation() {
    wrap.css({
      'left': '50%',
      'top': '50%',
      'width': wh + 'px',
      'height': ww + 'px',
      'transform': 'translate3d(-50%, -50%, 0) rotate(90deg)'
    })
  },

  initLoader() {
    this.loader = new PIXI.Loader()
    this.loader.baseUrl = 'assets'
    this.assets.sound.forEach((item)=> {
      this.loader.add(utils.getResId(item), item)
    })
    this.assets.image.forEach((item)=> {
      this.loader.add(utils.getResId(item), item)
    })
    this.loader.onProgress.add((e)=> {
      $('.loading-num').text(Math.round(e.progress) + '%')
    })
    this.loader.load((loader, resource)=>{ 
      res = resource
      this.initScenes()
      this.startScenes()
    })
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

window.app = app
window.PIXI = PIXI
window.Wechat = Wechat
window.TweenMax = TweenMax





