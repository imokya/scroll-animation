const config = require('root/app.json')

const getAssets = (mf, arr) => {
  for(let item of mf) {
    if(typeof(item) === 'string') {
      arr.push(`${item}?v=${config.version}`)
    } else {
      getAssets(Object.values(item)[0], arr)
    }
  }
}

const getSceneAssets = (sceneID, mf) => {
  const assets = []
  for(let item of mf) {
    if(typeof(item) === 'object') {
      if(Object.keys(item)[0] === sceneID) {
        getAssets(Object.values(item)[0], assets)
      }
    }
  }
  return assets
}

const getResId = (path) => {
  let str = path.replace(/\..*/ig, '')
  const pos = str.indexOf('/')
  if(pos) {
    return str.substr(pos + 1)
  } else {
    return str
  }
} 

const createSprite = (name, opt) => {
  const res = app.loader.resources
  const sprite = new PIXI.Sprite.from(res[name].url)
  Object.assign(sprite, opt || {})
  return sprite
}

const normal = (delta, min, max) => {
  return (delta - min) / (max - min)
}

const map = (min, max, delta, start, end) => {
  return start + normal(delta, min, max) * (end - start);
}

export default {
  normal,
  map,
  getAssets,
  getResId,
  createSprite,
  getSceneAssets
}
