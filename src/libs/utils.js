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

export default {
  getAssets,
  getSceneAssets
}
