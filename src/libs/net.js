const ajax = (params) => {
  if(params.jsonp) {
    const jsonpID = +new Date
    const callback = 'Xing' + jsonpID
    params.data.callback = callback
    params.removeOnLoad = true
    params.trigger = false
    window[callback] = (data) => {
      params.success && params.success(data)
    }
    loadScript(params)
  } else {
    loadXHR(param)
  }
}

const loadXHR = (params) => {
  const xhr = new XMLHttpRequest()
  xhr.onload = () => {
    if(this.status === 200) {
      var data = JSON.parse(this.response)
      params.success && params.success(data)
    }
  }
  xhr.onerror = () => {
    params.error && params.error()
  }
  xhr.open(params.type, params.url, true)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  const data = serialize(params.data)
  xhr.send(data)
}

const loadScript = (params)=> {
  const conf = {
    trigger: true
  }
  Object.assign(conf, params)
  const script = document.createElement('script')
  script.onload = () => {
    conf.trigger && conf.success && conf.success()
    conf.removeOnLoad && document.body.removeChild(script)
  }
  script.onerror = () => {
    conf.error && conf.error()
  }
  const url = conf.data ? 
              conf.url + '?' + serialize(conf.data) : 
              conf.url
  script.src = url
  document.body.appendChild(script)
}

const serialize = (data)=> {
  let res = ''
  for(let i in data) {
    res += i+'='+data[i]+'&'
  }
  return res.split('&').slice(0,-1).join('&')
}

export default {
  ajax,
  loadScript
}
