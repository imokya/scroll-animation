const fs = require('fs')
const path = require('path')

class ManifestWebpackPlugin {

  constructor(options) {
    this.options = options
    if(!options.disable) {
      this.generateManifest()
    }
  }

  generateManifest() {
    this.src = path.resolve(__dirname, this.options.source)
    this.des = path.resolve(__dirname, this.options.output)
    const manifest = []
    this.getFolderInfo(manifest)
    const data = JSON.stringify(manifest)
    fs.writeFileSync(this.des + path.sep + 'manifest.json', data, { flag: 'w' })
  }

  checkExclude(curPath) {
    let excPath = '', 
        exclude = this.options.exclude
    if(!exclude) return false
    if(Array.isArray(exclude)) {
      for(let item of exclude) {
        excPath = path.join(this.src, item)
        if(excPath === curPath) return true 
      }
    } else {
      excPath = path.join(this.src, exclude)
      if(excPath === curPath) return true
    }
    return false
  }

  getFolderInfo(manifest, prefix = '') {
    const newPrefix = prefix ?  prefix + path.sep : prefix
    const folder = this.src + path.sep + prefix
    const result = fs.readdirSync(folder, {
      withFileTypes: true
    })
    result.forEach((item) => {
      const preName = newPrefix + item.name
      const curPath = path.join(this.src, preName)
      if(this.checkExclude(curPath)) {
        return 
      }
      if(item.isDirectory()) {
        const obj = {}
        obj[item.name] = [], manifest.push(obj)
        this.getFolderInfo(obj[item.name], preName)
      } else {
        const filename = newPrefix + item.name
        manifest.push(filename.replace(/\\/g, '/'))
      }
    })
  }

  apply(compiler) {
 
  }
}

module.exports = ManifestWebpackPlugin