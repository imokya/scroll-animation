/*!
 * pixi-sound - v1.4.2
 * https://github.com/pixijs/pixi-sound
 * Compiled Tue, 11 Jul 2017 06:57:07 UTC
 *
 * pixi-sound is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.__pixiSound = {})));
}(this, (function (exports) { 'use strict';

if (typeof PIXI === "undefined") { throw "PixiJS required"; }

var Filterable = (function () {
    function Filterable(input, output) {
        this._output = output;
        this._input = input;
    }
    Object.defineProperty(Filterable.prototype, "destination", {
        get: function () {
            return this._input;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Filterable.prototype, "filters", {
        get: function () {
            return this._filters;
        },
        set: function (filters) {
            var _this = this;
            if (this._filters) {
                this._filters.forEach(function (filter) {
                    if (filter) {
                        filter.disconnect();
                    }
                });
                this._filters = null;
                this._input.connect(this._output);
            }
            if (filters && filters.length) {
                this._filters = filters.slice(0);
                this._input.disconnect();
                var prevFilter_1 = null;
                filters.forEach(function (filter) {
                    if (prevFilter_1 === null) {
                        _this._input.connect(filter.destination);
                    }
                    else {
                        prevFilter_1.connect(filter.destination);
                    }
                    prevFilter_1 = filter;
                });
                prevFilter_1.connect(this._output);
            }
        },
        enumerable: true,
        configurable: true
    });
    Filterable.prototype.destroy = function () {
        this.filters = null;
        this._input = null;
        this._output = null;
    };
    return Filterable;
}());

var Filter = (function () {
    function Filter(destination, source) {
        this.destination = destination;
        this.source = source || destination;
    }
    Filter.prototype.connect = function (destination) {
        this.source.connect(destination);
    };
    Filter.prototype.disconnect = function () {
        this.source.disconnect();
    };
    Filter.prototype.destroy = function () {
        this.disconnect();
        this.destination = null;
        this.source = null;
    };
    return Filter;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Code refactored from Mozilla Developer Network:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */

function assign(target, firstSource) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  var to = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    var keysArray = Object.keys(Object(nextSource));
    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex];
      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
}

function polyfill() {
  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: assign
    });
  }
}

var index = {
  assign: assign,
  polyfill: polyfill
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var promise = createCommonjsModule(function (module) {
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if ('object' !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(commonjsGlobal);
});

var id = 0;
var HTMLAudioInstance = (function (_super) {
    __extends(HTMLAudioInstance, _super);
    function HTMLAudioInstance(parent) {
        var _this = _super.call(this) || this;
        _this.id = id++;
        _this.init(parent);
        return _this;
    }
    Object.defineProperty(HTMLAudioInstance.prototype, "progress", {
        get: function () {
            var currentTime = this._source.currentTime;
            return currentTime / this._duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioInstance.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            var contextPaused = this._parent.context.paused;
            if (paused === this._paused && contextPaused === this._paused) {
                return;
            }
            this._paused = paused;
            if (paused || contextPaused) {
                this._internalStop();
                this.emit("paused");
            }
            else {
                this.emit("resumed");
                this.play(this._source.currentTime, this._end, 1, this._source.loop, 0, 0);
            }
            this.emit("pause", paused);
        },
        enumerable: true,
        configurable: true
    });
    HTMLAudioInstance.prototype._onPlay = function () {
        this._playing = true;
    };
    HTMLAudioInstance.prototype._onPause = function () {
        this._playing = false;
    };
    HTMLAudioInstance.prototype.init = function (parent) {
        var _this = this;
        this._playing = false;
        this._duration = parent.source.duration;
        var source = this._source = parent.source.cloneNode(false);
        source.src = parent.parent.url;
        source.onplay = this._onPlay.bind(this);
        source.onpause = this._onPause.bind(this);
        this._onVolumeChanged = function () {
            var volume = parent.volume;
            volume *= parent.context.volume;
            volume *= parent.context.muted ? 0 : 1;
            source.volume = volume;
        };
        this._onPausedChanged = function () {
            _this.paused = _this.paused;
        };
        parent.on('volume', this._onVolumeChanged);
        parent.context.on('volume', this._onVolumeChanged);
        parent.context.on('muted', this._onVolumeChanged);
        parent.context.on('paused', this._onPausedChanged);
        this._parent = parent;
        this._onPausedChanged();
        this._onVolumeChanged();
    };
    HTMLAudioInstance.prototype._internalStop = function () {
        if (this._source && this._playing) {
            this._source.onended = null;
            this._source.pause();
        }
    };
    HTMLAudioInstance.prototype.stop = function () {
        this._internalStop();
        if (this._source) {
            this.emit("stop");
        }
    };
    HTMLAudioInstance.prototype.play = function (start, end, speed, loop, fadeIn, fadeOut) {
        var _this = this;
        if (end) {
            console.assert(end > start, "End time is before start time");
        }
        if (loop !== undefined) {
            this._source.loop = loop;
        }
        if (loop === true && end !== undefined) {
            console.warn('Looping not support when specifying an "end" time');
            this._source.loop = false;
        }
        this._start = start;
        this._end = end || this._duration;
        this._start = Math.max(0, this._start - HTMLAudioInstance.PADDING);
        this._end = Math.min(this._end + HTMLAudioInstance.PADDING, this._duration);
        this._source.onloadedmetadata = function () {
            if (_this._source) {
                _this._source.currentTime = start;
                _this._source.onloadedmetadata = null;
                _this.emit("progress", start, _this._duration);
                PIXI.ticker.shared.add(_this._onUpdate, _this);
            }
        };
        this._source.onended = this._onComplete.bind(this);
        this._source.play();
        this.emit("start");
    };
    HTMLAudioInstance.prototype._onUpdate = function () {
        this.emit("progress", this.progress, this._duration);
        if (this._source.currentTime >= this._end && !this._source.loop) {
            this._onComplete();
        }
    };
    HTMLAudioInstance.prototype._onComplete = function () {
        PIXI.ticker.shared.remove(this._onUpdate, this);
        this._internalStop();
        this.emit("progress", 1, this._duration);
        this.emit("end", this);
    };
    HTMLAudioInstance.prototype.destroy = function () {
        PIXI.ticker.shared.remove(this._onUpdate, this);
        this.removeAllListeners();
        var source = this._source;
        if (source) {
            source.onended = null;
            source.onplay = null;
            source.onpause = null;
            this._internalStop();
        }
        this._source = null;
        this._end = 0;
        this._start = 0;
        this._duration = 0;
        this._playing = false;
        var parent = this._parent;
        if (parent) {
            parent.off('volume', this._onVolumeChanged);
            parent.context.off('muted', this._onVolumeChanged);
            parent.context.off('volume', this._onVolumeChanged);
            parent.context.off('paused', this._onPausedChanged);
        }
        this._parent = null;
        this._onVolumeChanged = null;
        this._onPausedChanged = null;
    };
    HTMLAudioInstance.prototype.toString = function () {
        return "[HTMLAudioInstance id=" + this.id + "]";
    };
    HTMLAudioInstance.PADDING = 0.1;
    return HTMLAudioInstance;
}(PIXI.utils.EventEmitter));

var HTMLAudioMedia = (function (_super) {
    __extends(HTMLAudioMedia, _super);
    function HTMLAudioMedia() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTMLAudioMedia.prototype.init = function (parent) {
        this.parent = parent;
        this._source = parent.options.source || new Audio();
        this.speed = parent.options.speed;
        if (parent.url) {
            this._source.src = parent.url;
        }
    };
    HTMLAudioMedia.prototype.create = function () {
        return new HTMLAudioInstance(this);
    };
    Object.defineProperty(HTMLAudioMedia.prototype, "isPlayable", {
        get: function () {
            return !!this._source && this._source.readyState === 4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioMedia.prototype, "volume", {
        get: function () {
            return this._source.volume;
        },
        set: function (volume) {
            var oldVolume = this.volume;
            this._source.volume = volume;
            if (volume !== oldVolume) {
                this.emit('volume', volume);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioMedia.prototype, "loop", {
        set: function (loop) {
            this._source.loop = loop;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioMedia.prototype, "speed", {
        get: function () {
            return this._source.playbackRate;
        },
        set: function (value) {
            var oldSpeed = this.speed;
            this._source.playbackRate = value;
            if (value != oldSpeed) {
                this.emit('speed', value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioMedia.prototype, "duration", {
        get: function () {
            return this._source.duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioMedia.prototype, "context", {
        get: function () {
            return this.parent.context;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioMedia.prototype, "filters", {
        get: function () {
            return null;
        },
        set: function (filters) {
            console.warn('HTML Audio does not support filters');
        },
        enumerable: true,
        configurable: true
    });
    HTMLAudioMedia.prototype.destroy = function () {
        this.removeAllListeners();
        this.parent = null;
        if (this._source) {
            this._source.src = "";
            this._source.load();
            this._source = null;
        }
    };
    Object.defineProperty(HTMLAudioMedia.prototype, "source", {
        get: function () {
            return this._source;
        },
        enumerable: true,
        configurable: true
    });
    HTMLAudioMedia.prototype.load = function (callback) {
        var source = this._source;
        var sound = this.parent;
        if (source.readyState === 4) {
            sound.isLoaded = true;
            var instance_1 = sound.autoPlayStart();
            if (callback) {
                setTimeout(function () {
                    callback(null, sound, instance_1);
                }, 0);
            }
            return;
        }
        if (!sound.url) {
            return callback(new Error("sound.url or sound.source must be set"));
        }
        source.src = sound.url;
        var removeListeners = function () {
            source.removeEventListener('canplaythrough', onLoad);
            source.removeEventListener('load', onLoad);
            source.removeEventListener('abort', onAbort);
            source.removeEventListener('error', onError);
        };
        var onLoad = function () {
            removeListeners();
            sound.isLoaded = true;
            var instance = sound.autoPlayStart();
            if (callback) {
                callback(null, sound, instance);
            }
        };
        var onAbort = function () {
            removeListeners();
            if (callback) {
                callback(new Error('Sound loading has been aborted'));
            }
        };
        var onError = function () {
            removeListeners();
            var message = "Failed to load audio element (code: " + source.error.code + ")";
            if (callback) {
                callback(new Error(message));
            }
            else {
                console.error(message);
            }
        };
        source.addEventListener('canplaythrough', onLoad, false);
        source.addEventListener('load', onLoad, false);
        source.addEventListener('abort', onAbort, false);
        source.addEventListener('error', onError, false);
        source.load();
    };
    return HTMLAudioMedia;
}(PIXI.utils.EventEmitter));

var HTMLAudioContext = (function (_super) {
    __extends(HTMLAudioContext, _super);
    function HTMLAudioContext() {
        var _this = _super.call(this) || this;
        _this._volume = 1;
        _this._muted = false;
        _this._paused = false;
        return _this;
    }
    Object.defineProperty(HTMLAudioContext.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            var oldPaused = this._paused;
            this._paused = paused;
            if (paused !== oldPaused) {
                this.emit('paused', paused);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioContext.prototype, "muted", {
        get: function () {
            return this._muted;
        },
        set: function (muted) {
            var oldMuted = this._muted;
            this._muted = muted;
            if (muted !== oldMuted) {
                this.emit('muted', muted);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioContext.prototype, "volume", {
        get: function () {
            return this._volume;
        },
        set: function (volume) {
            var oldVolume = this._volume;
            this._volume = volume;
            if (volume !== oldVolume) {
                this.emit('volume', volume);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioContext.prototype, "filters", {
        get: function () {
            console.warn('HTML Audio does not support filters');
            return null;
        },
        set: function (filters) {
            console.warn('HTML Audio does not support filters');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTMLAudioContext.prototype, "audioContext", {
        get: function () {
            console.warn('HTML Audio does not support audioContext');
            return null;
        },
        enumerable: true,
        configurable: true
    });
    HTMLAudioContext.prototype.toggleMute = function () {
        this.muted = !this.muted;
        return this._muted;
    };
    HTMLAudioContext.prototype.togglePause = function () {
        this.paused = !this.paused;
        return this._paused;
    };
    HTMLAudioContext.prototype.destroy = function () {
        this.removeAllListeners();
    };
    return HTMLAudioContext;
}(PIXI.utils.EventEmitter));



var htmlaudio = Object.freeze({
	HTMLAudioMedia: HTMLAudioMedia,
	HTMLAudioInstance: HTMLAudioInstance,
	HTMLAudioContext: HTMLAudioContext
});

var LoaderMiddleware = (function () {
    function LoaderMiddleware() {
    }
    LoaderMiddleware.install = function (sound) {
        LoaderMiddleware._sound = sound;
        LoaderMiddleware.legacy = sound.useLegacy;
        PIXI.loaders.Loader.addPixiMiddleware(function () {
            return LoaderMiddleware.plugin;
        });
        PIXI.loader.use(LoaderMiddleware.plugin);
    };
    Object.defineProperty(LoaderMiddleware, "legacy", {
        set: function (legacy) {
            var Resource = PIXI.loaders.Resource;
            var exts = LoaderMiddleware.EXTENSIONS;
            if (!legacy) {
                exts.forEach(function (ext) {
                    Resource.setExtensionXhrType(ext, Resource.XHR_RESPONSE_TYPE.BUFFER);
                    Resource.setExtensionLoadType(ext, Resource.LOAD_TYPE.XHR);
                });
            }
            else {
                exts.forEach(function (ext) {
                    Resource.setExtensionXhrType(ext, Resource.XHR_RESPONSE_TYPE.DEFAULT);
                    Resource.setExtensionLoadType(ext, Resource.LOAD_TYPE.AUDIO);
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    LoaderMiddleware.plugin = function (resource, next) {
        if (resource.data && LoaderMiddleware.EXTENSIONS.indexOf(resource.extension) > -1) {
            resource.sound = LoaderMiddleware._sound.add(resource.name, {
                loaded: next,
                preload: true,
                url: resource.url,
                source: resource.data,
            });
        }
        else {
            next();
        }
    };
    LoaderMiddleware.EXTENSIONS = ["wav", "mp3", "ogg", "oga", "m4a"];
    return LoaderMiddleware;
}());

var SoundSprite = (function () {
    function SoundSprite(parent, options) {
        this.parent = parent;
        Object.assign(this, options);
        this.duration = this.end - this.start;
        console.assert(this.duration > 0, "End time must be after start time");
    }
    SoundSprite.prototype.play = function (complete) {
        return this.parent.play(Object.assign({
            complete: complete,
            speed: this.speed || this.parent.speed,
            end: this.end,
            start: this.start,
        }));
    };
    SoundSprite.prototype.destroy = function () {
        this.parent = null;
    };
    return SoundSprite;
}());

var id$1 = 0;
var WebAudioInstance = (function (_super) {
    __extends(WebAudioInstance, _super);
    function WebAudioInstance(media) {
        var _this = _super.call(this) || this;
        _this.id = id$1++;
        _this._media = null;
        _this._paused = false;
        _this._elapsed = 0;
        _this._updateListener = _this._update.bind(_this);
        _this.init(media);
        return _this;
    }
    WebAudioInstance.prototype.stop = function () {
        if (this._source) {
            this._internalStop();
            this.emit("stop");
        }
    };
    WebAudioInstance.prototype.play = function (start, end, speed, loop, fadeIn, fadeOut) {
        if (end) {
            console.assert(end > start, "End time is before start time");
        }
        this._paused = false;
        this._source = this._media.nodes.cloneBufferSource();
        if (speed !== undefined) {
            this._source.playbackRate.value = speed;
        }
        this._speed = this._source.playbackRate.value;
        if (loop !== undefined) {
            this._loop = this._source.loop = !!loop;
        }
        if (this._loop && end !== undefined) {
            console.warn('Looping not support when specifying an "end" time');
            this._loop = this._source.loop = false;
        }
        this._end = end;
        var duration = this._source.buffer.duration;
        fadeIn = this._toSec(fadeIn);
        if (fadeIn > duration) {
            fadeIn = duration;
        }
        if (!this._loop) {
            fadeOut = this._toSec(fadeOut);
            if (fadeOut > duration - fadeIn) {
                fadeOut = duration - fadeIn;
            }
        }
        this._duration = duration;
        this._fadeIn = fadeIn;
        this._fadeOut = fadeOut;
        this._lastUpdate = this._now();
        this._elapsed = start;
        this._source.onended = this._onComplete.bind(this);
        if (end) {
            this._source.start(0, start, end - start);
        }
        else {
            this._source.start(0, start);
        }
        this.emit("start");
        this._update(true);
        this._enabled = true;
    };
    WebAudioInstance.prototype._toSec = function (time) {
        if (time > 10) {
            time /= 1000;
        }
        return time || 0;
    };
    Object.defineProperty(WebAudioInstance.prototype, "_enabled", {
        set: function (enabled) {
            var script = this._media.nodes.script;
            script.removeEventListener('audioprocess', this._updateListener);
            if (enabled) {
                script.addEventListener('audioprocess', this._updateListener);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioInstance.prototype, "progress", {
        get: function () {
            return this._progress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioInstance.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            if (paused !== this._paused) {
                this._paused = paused;
                if (paused) {
                    this._internalStop();
                    this.emit("paused");
                }
                else {
                    this.emit("resumed");
                    this.play(this._elapsed % this._duration, this._end, this._speed, this._loop, this._fadeIn, this._fadeOut);
                }
                this.emit("pause", paused);
            }
        },
        enumerable: true,
        configurable: true
    });
    WebAudioInstance.prototype.destroy = function () {
        this.removeAllListeners();
        this._internalStop();
        this._source = null;
        this._speed = 0;
        this._end = 0;
        this._media = null;
        this._elapsed = 0;
        this._duration = 0;
        this._loop = false;
        this._fadeIn = 0;
        this._fadeOut = 0;
        this._paused = false;
    };
    WebAudioInstance.prototype.toString = function () {
        return "[SoundInstance id=" + this.id + "]";
    };
    WebAudioInstance.prototype._now = function () {
        return this._media.context.audioContext.currentTime;
    };
    WebAudioInstance.prototype._update = function (force) {
        if (force === void 0) { force = false; }
        if (this._source) {
            var now = this._now();
            var delta = now - this._lastUpdate;
            if (delta > 0 || force) {
                this._elapsed += delta;
                this._lastUpdate = now;
                var duration = this._duration;
                var progress = ((this._elapsed * this._speed) % duration) / duration;
                if (this._fadeIn || this._fadeOut) {
                    var position = progress * duration;
                    var gain = this._media.nodes.gain.gain;
                    var maxVolume = this._media.parent.volume;
                    if (this._fadeIn) {
                        if (position <= this._fadeIn && progress < 1) {
                            gain.value = maxVolume * (position / this._fadeIn);
                        }
                        else {
                            gain.value = maxVolume;
                            this._fadeIn = 0;
                        }
                    }
                    if (this._fadeOut && position >= duration - this._fadeOut) {
                        var percent = (duration - position) / this._fadeOut;
                        gain.value = maxVolume * percent;
                    }
                }
                this._progress = progress;
                this.emit("progress", this._progress, duration);
            }
        }
    };
    WebAudioInstance.prototype.init = function (media) {
        this._media = media;
    };
    WebAudioInstance.prototype._internalStop = function () {
        if (this._source) {
            this._enabled = false;
            this._source.onended = null;
            this._source.stop();
            this._source = null;
            this._media.volume = this._media.parent.volume;
        }
    };
    WebAudioInstance.prototype._onComplete = function () {
        if (this._source) {
            this._enabled = false;
            this._source.onended = null;
        }
        this._source = null;
        this._progress = 1;
        this.emit("progress", 1, this._duration);
        this.emit("end", this);
    };
    return WebAudioInstance;
}(PIXI.utils.EventEmitter));

var WebAudioNodes = (function (_super) {
    __extends(WebAudioNodes, _super);
    function WebAudioNodes(context) {
        var _this = this;
        var audioContext = context.audioContext;
        var bufferSource = audioContext.createBufferSource();
        var script = audioContext.createScriptProcessor(WebAudioNodes.BUFFER_SIZE);
        var gain = audioContext.createGain();
        var analyser = audioContext.createAnalyser();
        bufferSource.connect(analyser);
        analyser.connect(gain);
        gain.connect(context.destination);
        script.connect(context.destination);
        _this = _super.call(this, analyser, gain) || this;
        _this.context = context;
        _this.bufferSource = bufferSource;
        _this.script = script;
        _this.gain = gain;
        _this.analyser = analyser;
        return _this;
    }
    WebAudioNodes.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.bufferSource.disconnect();
        this.script.disconnect();
        this.gain.disconnect();
        this.analyser.disconnect();
        this.bufferSource = null;
        this.script = null;
        this.gain = null;
        this.analyser = null;
        this.context = null;
    };
    WebAudioNodes.prototype.cloneBufferSource = function () {
        var orig = this.bufferSource;
        var clone = this.context.audioContext.createBufferSource();
        clone.buffer = orig.buffer;
        clone.playbackRate.value = orig.playbackRate.value;
        clone.loop = orig.loop;
        clone.connect(this.destination);
        return clone;
    };
    WebAudioNodes.BUFFER_SIZE = 256;
    return WebAudioNodes;
}(Filterable));

var WebAudioMedia = (function () {
    function WebAudioMedia() {
    }
    WebAudioMedia.prototype.init = function (parent) {
        this.parent = parent;
        this._nodes = new WebAudioNodes(this.context);
        this._source = this._nodes.bufferSource;
        this.source = parent.options.source;
        this.useXHR = parent.options.useXHR;
    };
    WebAudioMedia.prototype.destroy = function () {
        this.parent = null;
        this._nodes.destroy();
        this._nodes = null;
        this._source = null;
        this.source = null;
    };
    WebAudioMedia.prototype.create = function () {
        return new WebAudioInstance(this);
    };
    Object.defineProperty(WebAudioMedia.prototype, "context", {
        get: function () {
            return this.parent.context;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "isPlayable", {
        get: function () {
            return !!this._source && !!this._source.buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "volume", {
        set: function (volume) {
            this._nodes.gain.gain.value = volume;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "loop", {
        set: function (loop) {
            this._source.loop = loop;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "speed", {
        set: function (value) {
            this._source.playbackRate.value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "filters", {
        get: function () {
            return this._nodes.filters;
        },
        set: function (filters) {
            this._nodes.filters = filters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "duration", {
        get: function () {
            console.assert(this.isPlayable, "Sound not yet playable, no duration");
            return this._source.buffer.duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "buffer", {
        get: function () {
            return this._source.buffer;
        },
        set: function (buffer) {
            this._source.buffer = buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioMedia.prototype, "nodes", {
        get: function () {
            return this._nodes;
        },
        enumerable: true,
        configurable: true
    });
    WebAudioMedia.prototype.load = function (callback) {
        if (this.parent.url) {
            this.useXHR ? this._loadUrl(callback) : this._loadPath(callback);
        }
        else if (this.source) {
            this._decode(this.source, callback);
        }
        else if (callback) {
            callback(new Error("sound.url or sound.source must be set"));
        }
        else {
            console.error("sound.url or sound.source must be set");
        }
    };
    WebAudioMedia.prototype._loadUrl = function (callback) {
        var _this = this;
        var request = new XMLHttpRequest();
        var url = this.parent.url;
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            _this.source = request.response;
            _this._decode(request.response, callback);
        };
        request.send();
    };
    WebAudioMedia.prototype._loadPath = function (callback) {
        var _this = this;
        var fs = require("fs");
        var url = this.parent.url;
        fs.readFile(url, function (err, data) {
            if (err) {
                console.error(err);
                if (callback) {
                    callback(new Error("File not found " + _this.parent.url));
                }
                return;
            }
            var arrayBuffer = new ArrayBuffer(data.length);
            var view = new Uint8Array(arrayBuffer);
            for (var i = 0; i < data.length; ++i) {
                view[i] = data[i];
            }
            _this.source = arrayBuffer;
            _this._decode(arrayBuffer, callback);
        });
    };
    WebAudioMedia.prototype._decode = function (arrayBuffer, callback) {
        var _this = this;
        var context = this.parent.context;
        context.decode(arrayBuffer, function (err, buffer) {
            if (err) {
                if (callback) {
                    callback(err);
                }
            }
            else {
                _this.parent.isLoaded = true;
                _this.buffer = buffer;
                var instance = _this.parent.autoPlayStart();
                if (callback) {
                    callback(null, _this.parent, instance);
                }
            }
        });
    };
    return WebAudioMedia;
}());

var Sound = (function () {
    function Sound(media, options) {
        this.media = media;
        this.options = options;
        this._instances = [];
        this._sprites = {};
        this.media.init(this);
        var complete = options.complete;
        this._autoPlayOptions = complete ? { complete: complete } : null;
        this.isLoaded = false;
        this.isPlaying = false;
        this.autoPlay = options.autoPlay;
        this.singleInstance = options.singleInstance;
        this.preload = options.preload || this.autoPlay;
        this.url = options.url;
        this.speed = options.speed;
        this.volume = options.volume;
        this.loop = options.loop;
        if (options.sprites) {
            this.addSprites(options.sprites);
        }
        if (this.preload) {
            this._preload(options.loaded);
        }
    }
    Sound.from = function (source) {
        var options = {};
        if (typeof source === "string") {
            options.url = source;
        }
        else if (source instanceof ArrayBuffer || source instanceof HTMLAudioElement) {
            options.source = source;
        }
        else {
            options = source;
        }
        options = Object.freeze(Object.assign({
            autoPlay: false,
            singleInstance: false,
            url: null,
            source: null,
            preload: false,
            volume: 1,
            speed: 1,
            complete: null,
            loaded: null,
            loop: false,
            useXHR: true,
        }, options));
        var media = SoundLibrary.instance.useLegacy ?
            new HTMLAudioMedia() :
            new WebAudioMedia();
        return new Sound(media, options);
    };
    Object.defineProperty(Sound.prototype, "context", {
        get: function () {
            return SoundLibrary.instance.context;
        },
        enumerable: true,
        configurable: true
    });
    Sound.prototype.pause = function () {
        this.paused = true;
        this.isPlaying = false;
        return this;
    };
    Sound.prototype.resume = function () {
        this.paused = false;
        this.isPlaying = this._instances.length > 0;
        return this;
    };
    Object.defineProperty(Sound.prototype, "paused", {
        set: function (paused) {
            for (var i = this._instances.length - 1; i >= 0; i--) {
                this._instances[i].paused = paused;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "speed", {
        get: function () {
            return this._speed;
        },
        set: function (speed) {
            this._speed = this.media.speed = speed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "filters", {
        get: function () {
            return this.media.filters;
        },
        set: function (filters) {
            this.media.filters = filters;
        },
        enumerable: true,
        configurable: true
    });
    Sound.prototype.addSprites = function (source, data) {
        if (typeof source === "object") {
            var results = {};
            for (var alias in source) {
                results[alias] = this.addSprites(alias, source[alias]);
            }
            return results;
        }
        else if (typeof source === "string") {
            console.assert(!this._sprites[source], "Alias " + source + " is already taken");
            var sprite = new SoundSprite(this, data);
            this._sprites[source] = sprite;
            return sprite;
        }
    };
    Sound.prototype.destroy = function () {
        this._removeInstances();
        this.removeSprites();
        this.media.destroy();
        this.media = null;
        this._sprites = null;
        this._instances = null;
    };
    Sound.prototype.removeSprites = function (alias) {
        if (!alias) {
            for (var name_1 in this._sprites) {
                this.removeSprites(name_1);
            }
        }
        else {
            var sprite = this._sprites[alias];
            if (sprite !== undefined) {
                sprite.destroy();
                delete this._sprites[alias];
            }
        }
        return this;
    };
    Object.defineProperty(Sound.prototype, "isPlayable", {
        get: function () {
            return this.isLoaded && this.media && this.media.isPlayable;
        },
        enumerable: true,
        configurable: true
    });
    Sound.prototype.stop = function () {
        if (!this.isPlayable) {
            this.autoPlay = false;
            this._autoPlayOptions = null;
            return this;
        }
        this.isPlaying = false;
        for (var i = this._instances.length - 1; i >= 0; i--) {
            this._instances[i].stop();
        }
        return this;
    };
    Sound.prototype.play = function (source, complete) {
        var _this = this;
        var options;
        if (typeof source === "string") {
            var sprite = source;
            options = { sprite: sprite, complete: complete };
        }
        else if (typeof source === "function") {
            options = {};
            options.complete = source;
        }
        else {
            options = source;
        }
        options = Object.assign({
            complete: null,
            loaded: null,
            sprite: null,
            start: 0,
            fadeIn: 0,
            fadeOut: 0,
        }, options || {});
        if (options.sprite) {
            var alias = options.sprite;
            console.assert(!!this._sprites[alias], "Alias " + alias + " is not available");
            var sprite = this._sprites[alias];
            options.start = sprite.start;
            options.end = sprite.end;
            options.speed = sprite.speed;
            delete options.sprite;
        }
        if (options.offset) {
            options.start = options.offset;
        }
        if (!this.isLoaded) {
            return new Promise(function (resolve, reject) {
                _this.autoPlay = true;
                _this._autoPlayOptions = options;
                _this._preload(function (err, sound, instance) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if (options.loaded) {
                            options.loaded(err, sound, instance);
                        }
                        resolve(instance);
                    }
                });
            });
        }
        if (this.singleInstance) {
            this._removeInstances();
        }
        var instance = this._createInstance();
        this._instances.push(instance);
        this.isPlaying = true;
        instance.once("end", function () {
            if (options.complete) {
                options.complete(_this);
            }
            _this._onComplete(instance);
        });
        instance.once("stop", function () {
            _this._onComplete(instance);
        });
        instance.play(options.start, options.end, options.speed, options.loop, options.fadeIn, options.fadeOut);
        return instance;
    };
    Object.defineProperty(Sound.prototype, "volume", {
        get: function () {
            return this._volume;
        },
        set: function (volume) {
            this._volume = this.media.volume = volume;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "loop", {
        get: function () {
            return this._loop;
        },
        set: function (loop) {
            this._loop = this.media.loop = loop;
        },
        enumerable: true,
        configurable: true
    });
    Sound.prototype._preload = function (callback) {
        this.media.load(callback);
    };
    Object.defineProperty(Sound.prototype, "instances", {
        get: function () {
            return this._instances;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "sprites", {
        get: function () {
            return this._sprites;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "duration", {
        get: function () {
            return this.media.duration;
        },
        enumerable: true,
        configurable: true
    });
    Sound.prototype.autoPlayStart = function () {
        var instance;
        if (this.autoPlay) {
            instance = this.play(this._autoPlayOptions);
        }
        return instance;
    };
    Sound.prototype._removeInstances = function () {
        for (var i = this._instances.length - 1; i >= 0; i--) {
            this._poolInstance(this._instances[i]);
        }
        this._instances.length = 0;
    };
    Sound.prototype._onComplete = function (instance) {
        if (this._instances) {
            var index = this._instances.indexOf(instance);
            if (index > -1) {
                this._instances.splice(index, 1);
            }
            this.isPlaying = this._instances.length > 0;
        }
        this._poolInstance(instance);
    };
    Sound.prototype._createInstance = function () {
        if (Sound._pool.length > 0) {
            var instance = Sound._pool.pop();
            instance.init(this.media);
            return instance;
        }
        return this.media.create();
    };
    Sound.prototype._poolInstance = function (instance) {
        instance.destroy();
        if (Sound._pool.indexOf(instance) < 0) {
            Sound._pool.push(instance);
        }
    };
    Sound._pool = [];
    return Sound;
}());

var SoundUtils = (function () {
    function SoundUtils() {
    }
    SoundUtils.sineTone = function (hertz, seconds) {
        if (hertz === void 0) { hertz = 200; }
        if (seconds === void 0) { seconds = 1; }
        var sound = Sound.from({
            singleInstance: true,
        });
        if (!(sound.media instanceof WebAudioMedia)) {
            return sound;
        }
        var media = sound.media;
        var context = sound.context;
        var nChannels = 1;
        var sampleRate = 48000;
        var amplitude = 2;
        var buffer = context.audioContext.createBuffer(nChannels, seconds * sampleRate, sampleRate);
        var fArray = buffer.getChannelData(0);
        for (var i = 0; i < fArray.length; i++) {
            var time = i / buffer.sampleRate;
            var angle = hertz * time * Math.PI;
            fArray[i] = Math.sin(angle) * amplitude;
        }
        media.buffer = buffer;
        sound.isLoaded = true;
        return sound;
    };
    SoundUtils.render = function (sound, options) {
        var canvas = document.createElement("canvas");
        options = Object.assign({
            width: 512,
            height: 128,
            fill: "black",
        }, options || {});
        canvas.width = options.width;
        canvas.height = options.height;
        var baseTexture = PIXI.BaseTexture.fromCanvas(canvas);
        if (!(sound.media instanceof WebAudioMedia)) {
            return baseTexture;
        }
        var media = sound.media;
        console.assert(!!media.buffer, "No buffer found, load first");
        var context = canvas.getContext("2d");
        context.fillStyle = options.fill;
        var data = media.buffer.getChannelData(0);
        var step = Math.ceil(data.length / options.width);
        var amp = options.height / 2;
        for (var i = 0; i < options.width; i++) {
            var min = 1.0;
            var max = -1.0;
            for (var j = 0; j < step; j++) {
                var datum = data[(i * step) + j];
                if (datum < min) {
                    min = datum;
                }
                if (datum > max) {
                    max = datum;
                }
            }
            context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
        return baseTexture;
    };
    SoundUtils.playOnce = function (url, callback) {
        var alias = "alias" + SoundUtils.PLAY_ID++;
        SoundLibrary.instance.add(alias, {
            url: url,
            preload: true,
            autoPlay: true,
            loaded: function (err) {
                if (err) {
                    console.error(err);
                    SoundLibrary.instance.remove(alias);
                    if (callback) {
                        callback(err);
                    }
                }
            },
            complete: function () {
                SoundLibrary.instance.remove(alias);
                if (callback) {
                    callback(null);
                }
            },
        });
        return alias;
    };
    SoundUtils.PLAY_ID = 0;
    return SoundUtils;
}());

var WebAudioContext = (function (_super) {
    __extends(WebAudioContext, _super);
    function WebAudioContext() {
        var _this = this;
        var ctx = new WebAudioContext.AudioContext();
        var gain = ctx.createGain();
        var compressor = ctx.createDynamicsCompressor();
        var analyser = ctx.createAnalyser();
        analyser.connect(gain);
        gain.connect(compressor);
        compressor.connect(ctx.destination);
        _this = _super.call(this, analyser, gain) || this;
        _this._ctx = ctx;
        _this._offlineCtx = new WebAudioContext.OfflineAudioContext(1, 2, ctx.sampleRate);
        _this._unlocked = false;
        _this.gain = gain;
        _this.compressor = compressor;
        _this.analyser = analyser;
        _this.volume = 1;
        _this.muted = false;
        _this.paused = false;
        if ("ontouchstart" in window && ctx.state !== "running") {
            _this._unlock();
            _this._unlock = _this._unlock.bind(_this);
            document.addEventListener("mousedown", _this._unlock, true);
            document.addEventListener("touchstart", _this._unlock, true);
            document.addEventListener("touchend", _this._unlock, true);
        }
        return _this;
    }
    WebAudioContext.prototype._unlock = function () {
        if (this._unlocked) {
            return;
        }
        this.playEmptySound();
        if (this._ctx.state === "running") {
            document.removeEventListener("mousedown", this._unlock, true);
            document.removeEventListener("touchend", this._unlock, true);
            document.removeEventListener("touchstart", this._unlock, true);
            this._unlocked = true;
        }
    };
    WebAudioContext.prototype.playEmptySound = function () {
        var source = this._ctx.createBufferSource();
        source.buffer = this._ctx.createBuffer(1, 1, 22050);
        source.connect(this._ctx.destination);
        source.start(0, 0, 0);
    };
    Object.defineProperty(WebAudioContext, "AudioContext", {
        get: function () {
            var win = window;
            return (win.AudioContext ||
                win.webkitAudioContext ||
                null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioContext, "OfflineAudioContext", {
        get: function () {
            var win = window;
            return (win.OfflineAudioContext ||
                win.webkitOfflineAudioContext ||
                null);
        },
        enumerable: true,
        configurable: true
    });
    WebAudioContext.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        var ctx = this._ctx;
        if (typeof ctx.close !== "undefined") {
            ctx.close();
        }
        this.analyser.disconnect();
        this.gain.disconnect();
        this.compressor.disconnect();
        this.gain = null;
        this.analyser = null;
        this.compressor = null;
        this._offlineCtx = null;
        this._ctx = null;
    };
    Object.defineProperty(WebAudioContext.prototype, "audioContext", {
        get: function () {
            return this._ctx;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioContext.prototype, "offlineContext", {
        get: function () {
            return this._offlineCtx;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioContext.prototype, "muted", {
        get: function () {
            return this._muted;
        },
        set: function (muted) {
            this._muted = !!muted;
            this.gain.gain.value = this._muted ? 0 : this._volume;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioContext.prototype, "volume", {
        get: function () {
            return this._volume;
        },
        set: function (volume) {
            this._volume = volume;
            if (!this._muted) {
                this.gain.gain.value = this._volume;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebAudioContext.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            if (paused && this._ctx.state === "running") {
                this._ctx.suspend();
            }
            else if (!paused && this._ctx.state === "suspended") {
                this._ctx.resume();
            }
            this._paused = paused;
        },
        enumerable: true,
        configurable: true
    });
    WebAudioContext.prototype.toggleMute = function () {
        this.muted = !this.muted;
        return this._muted;
    };
    WebAudioContext.prototype.togglePause = function () {
        this.paused = !this.paused;
        return this._paused;
    };
    WebAudioContext.prototype.decode = function (arrayBuffer, callback) {
        this._offlineCtx.decodeAudioData(arrayBuffer, function (buffer) {
            callback(null, buffer);
        }, function () {
            callback(new Error("Unable to decode file"));
        });
    };
    return WebAudioContext;
}(Filterable));



var webaudio = Object.freeze({
	WebAudioMedia: WebAudioMedia,
	WebAudioInstance: WebAudioInstance,
	WebAudioNodes: WebAudioNodes,
	WebAudioContext: WebAudioContext
});

var SoundLibrary = (function () {
    function SoundLibrary() {
        if (this.supported) {
            this._webAudioContext = new WebAudioContext();
        }
        this._htmlAudioContext = new HTMLAudioContext();
        this._sounds = {};
        this.useLegacy = !this.supported;
    }
    Object.defineProperty(SoundLibrary.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    SoundLibrary.init = function () {
        if (SoundLibrary.instance) {
            throw new Error("SoundLibrary is already created");
        }
        var instance = SoundLibrary.instance = new SoundLibrary();
        if (typeof Object.assign === "undefined") {
            index.polyfill();
        }
        if (typeof Promise === "undefined") {
            window.Promise = promise;
        }
        if (typeof PIXI.loaders !== "undefined") {
            LoaderMiddleware.install(instance);
        }
        if (typeof window.__pixiSound === "undefined") {
            delete window.__pixiSound;
        }
        if (typeof module === "undefined") {
            instance.global();
        }
        return instance;
    };
    SoundLibrary.prototype.global = function () {
        var PixiJS = PIXI;
        if (!PixiJS.sound) {
            Object.defineProperty(PixiJS, "sound", {
                get: function () { return SoundLibrary.instance; },
            });
            Object.defineProperties(SoundLibrary.instance, {
                filters: { get: function () { return filters; } },
                htmlaudio: { get: function () { return htmlaudio; } },
                webaudio: { get: function () { return webaudio; } },
                utils: { get: function () { return SoundUtils; } },
                Sound: { get: function () { return Sound; } },
                SoundSprite: { get: function () { return SoundSprite; } },
                Filterable: { get: function () { return Filterable; } },
                SoundLibrary: { get: function () { return SoundLibrary; } },
            });
        }
    };
    Object.defineProperty(SoundLibrary.prototype, "filtersAll", {
        get: function () {
            if (!this.useLegacy) {
                return this._context.filters;
            }
            return [];
        },
        set: function (filters) {
            if (!this.useLegacy) {
                this._context.filters = filters;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundLibrary.prototype, "supported", {
        get: function () {
            return WebAudioContext.AudioContext !== null;
        },
        enumerable: true,
        configurable: true
    });
    SoundLibrary.prototype.add = function (source, sourceOptions) {
        if (typeof source === "object") {
            var results = {};
            for (var alias in source) {
                var options = this._getOptions(source[alias], sourceOptions);
                results[alias] = this.add(alias, options);
            }
            return results;
        }
        else if (typeof source === "string") {
            console.assert(!this._sounds[source], "Sound with alias " + source + " already exists.");
            if (sourceOptions instanceof Sound) {
                this._sounds[source] = sourceOptions;
                return sourceOptions;
            }
            else {
                var options = this._getOptions(sourceOptions);
                var sound = Sound.from(options);
                this._sounds[source] = sound;
                return sound;
            }
        }
    };
    SoundLibrary.prototype._getOptions = function (source, overrides) {
        var options;
        if (typeof source === "string") {
            options = { url: source };
        }
        else if (source instanceof ArrayBuffer || source instanceof HTMLAudioElement) {
            options = { source: source };
        }
        else {
            options = source;
        }
        return Object.assign(options, overrides || {});
    };
    Object.defineProperty(SoundLibrary.prototype, "useLegacy", {
        get: function () {
            return this._useLegacy;
        },
        set: function (legacy) {
            LoaderMiddleware.legacy = legacy;
            this._useLegacy = legacy;
            if (!legacy && this.supported) {
                this._context = this._webAudioContext;
            }
            else {
                this._context = this._htmlAudioContext;
            }
        },
        enumerable: true,
        configurable: true
    });
    SoundLibrary.prototype.remove = function (alias) {
        this.exists(alias, true);
        this._sounds[alias].destroy();
        delete this._sounds[alias];
        return this;
    };
    Object.defineProperty(SoundLibrary.prototype, "volumeAll", {
        get: function () {
            return this._context.volume;
        },
        set: function (volume) {
            this._context.volume = volume;
        },
        enumerable: true,
        configurable: true
    });
    SoundLibrary.prototype.togglePauseAll = function () {
        return this._context.togglePause();
    };
    SoundLibrary.prototype.pauseAll = function () {
        this._context.paused = true;
        return this;
    };
    SoundLibrary.prototype.resumeAll = function () {
        this._context.paused = false;
        return this;
    };
    SoundLibrary.prototype.toggleMuteAll = function () {
        return this._context.toggleMute();
    };
    SoundLibrary.prototype.muteAll = function () {
        this._context.muted = true;
        return this;
    };
    SoundLibrary.prototype.unmuteAll = function () {
        this._context.muted = false;
        return this;
    };
    SoundLibrary.prototype.removeAll = function () {
        for (var alias in this._sounds) {
            this._sounds[alias].destroy();
            delete this._sounds[alias];
        }
        return this;
    };
    SoundLibrary.prototype.stopAll = function () {
        for (var alias in this._sounds) {
            this._sounds[alias].stop();
        }
        return this;
    };
    SoundLibrary.prototype.exists = function (alias, assert) {
        if (assert === void 0) { assert = false; }
        var exists = !!this._sounds[alias];
        if (assert) {
            console.assert(exists, "No sound matching alias '" + alias + "'.");
        }
        return exists;
    };
    SoundLibrary.prototype.find = function (alias) {
        this.exists(alias, true);
        return this._sounds[alias];
    };
    SoundLibrary.prototype.play = function (alias, options) {
        return this.find(alias).play(options);
    };
    SoundLibrary.prototype.stop = function (alias) {
        return this.find(alias).stop();
    };
    SoundLibrary.prototype.pause = function (alias) {
        return this.find(alias).pause();
    };
    SoundLibrary.prototype.resume = function (alias) {
        return this.find(alias).resume();
    };
    SoundLibrary.prototype.volume = function (alias, volume) {
        var sound = this.find(alias);
        if (volume !== undefined) {
            sound.volume = volume;
        }
        return sound.volume;
    };
    SoundLibrary.prototype.duration = function (alias) {
        return this.find(alias).duration;
    };
    SoundLibrary.prototype.destroy = function () {
        this.removeAll();
        this._sounds = null;
        this._context = null;
    };
    return SoundLibrary;
}());

var EqualizerFilter = (function (_super) {
    __extends(EqualizerFilter, _super);
    function EqualizerFilter(f32, f64, f125, f250, f500, f1k, f2k, f4k, f8k, f16k) {
        if (f32 === void 0) { f32 = 0; }
        if (f64 === void 0) { f64 = 0; }
        if (f125 === void 0) { f125 = 0; }
        if (f250 === void 0) { f250 = 0; }
        if (f500 === void 0) { f500 = 0; }
        if (f1k === void 0) { f1k = 0; }
        if (f2k === void 0) { f2k = 0; }
        if (f4k === void 0) { f4k = 0; }
        if (f8k === void 0) { f8k = 0; }
        if (f16k === void 0) { f16k = 0; }
        var _this = this;
        if (SoundLibrary.instance.useLegacy) {
            _this = _super.call(this, null) || this;
            return;
        }
        var equalizerBands = [
            {
                f: EqualizerFilter.F32,
                type: 'lowshelf',
                gain: f32
            },
            {
                f: EqualizerFilter.F64,
                type: 'peaking',
                gain: f64
            },
            {
                f: EqualizerFilter.F125,
                type: 'peaking',
                gain: f125
            },
            {
                f: EqualizerFilter.F250,
                type: 'peaking',
                gain: f250
            },
            {
                f: EqualizerFilter.F500,
                type: 'peaking',
                gain: f500
            },
            {
                f: EqualizerFilter.F1K,
                type: 'peaking',
                gain: f1k
            },
            {
                f: EqualizerFilter.F2K,
                type: 'peaking',
                gain: f2k
            },
            {
                f: EqualizerFilter.F4K,
                type: 'peaking',
                gain: f4k
            },
            {
                f: EqualizerFilter.F8K,
                type: 'peaking',
                gain: f8k
            },
            {
                f: EqualizerFilter.F16K,
                type: 'highshelf',
                gain: f16k
            }
        ];
        var bands = equalizerBands.map(function (band) {
            var filter = SoundLibrary.instance.context.audioContext.createBiquadFilter();
            filter.type = band.type;
            filter.gain.value = band.gain;
            filter.Q.value = 1;
            filter.frequency.value = band.f;
            return filter;
        });
        _this = _super.call(this, bands[0], bands[bands.length - 1]) || this;
        _this.bands = bands;
        _this.bandsMap = {};
        for (var i = 0; i < _this.bands.length; i++) {
            var node = _this.bands[i];
            if (i > 0) {
                _this.bands[i - 1].connect(node);
            }
            _this.bandsMap[node.frequency.value] = node;
        }
        return _this;
    }
    EqualizerFilter.prototype.setGain = function (frequency, gain) {
        if (gain === void 0) { gain = 0; }
        if (!this.bandsMap[frequency]) {
            throw 'No band found for frequency ' + frequency;
        }
        this.bandsMap[frequency].gain.value = gain;
    };
    EqualizerFilter.prototype.getGain = function (frequency) {
        if (!this.bandsMap[frequency]) {
            throw 'No band found for frequency ' + frequency;
        }
        return this.bandsMap[frequency].gain.value;
    };
    Object.defineProperty(EqualizerFilter.prototype, "f32", {
        get: function () {
            return this.getGain(EqualizerFilter.F32);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F32, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f64", {
        get: function () {
            return this.getGain(EqualizerFilter.F64);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F64, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f125", {
        get: function () {
            return this.getGain(EqualizerFilter.F125);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F125, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f250", {
        get: function () {
            return this.getGain(EqualizerFilter.F250);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F250, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f500", {
        get: function () {
            return this.getGain(EqualizerFilter.F500);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F500, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f1k", {
        get: function () {
            return this.getGain(EqualizerFilter.F1K);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F1K, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f2k", {
        get: function () {
            return this.getGain(EqualizerFilter.F2K);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F2K, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f4k", {
        get: function () {
            return this.getGain(EqualizerFilter.F4K);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F4K, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f8k", {
        get: function () {
            return this.getGain(EqualizerFilter.F8K);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F8K, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EqualizerFilter.prototype, "f16k", {
        get: function () {
            return this.getGain(EqualizerFilter.F16K);
        },
        set: function (value) {
            this.setGain(EqualizerFilter.F16K, value);
        },
        enumerable: true,
        configurable: true
    });
    EqualizerFilter.prototype.reset = function () {
        this.bands.forEach(function (band) {
            band.gain.value = 0;
        });
    };
    EqualizerFilter.prototype.destroy = function () {
        this.bands.forEach(function (band) {
            band.disconnect();
        });
        this.bands = null;
        this.bandsMap = null;
    };
    EqualizerFilter.F32 = 32;
    EqualizerFilter.F64 = 64;
    EqualizerFilter.F125 = 125;
    EqualizerFilter.F250 = 250;
    EqualizerFilter.F500 = 500;
    EqualizerFilter.F1K = 1000;
    EqualizerFilter.F2K = 2000;
    EqualizerFilter.F4K = 4000;
    EqualizerFilter.F8K = 8000;
    EqualizerFilter.F16K = 16000;
    return EqualizerFilter;
}(Filter));

var DistortionFilter = (function (_super) {
    __extends(DistortionFilter, _super);
    function DistortionFilter(amount) {
        if (amount === void 0) { amount = 0; }
        var _this = this;
        if (SoundLibrary.instance.useLegacy) {
            _this = _super.call(this, null) || this;
            return;
        }
        var context = SoundLibrary.instance.context;
        var distortion = context.audioContext.createWaveShaper();
        _this = _super.call(this, distortion) || this;
        _this._distortion = distortion;
        _this.amount = amount;
        return _this;
    }
    Object.defineProperty(DistortionFilter.prototype, "amount", {
        get: function () {
            return this._amount;
        },
        set: function (value) {
            value *= 1000;
            this._amount = value;
            var samples = 44100;
            var curve = new Float32Array(samples);
            var deg = Math.PI / 180;
            var i = 0;
            var x;
            for (; i < samples; ++i) {
                x = i * 2 / samples - 1;
                curve[i] = (3 + value) * x * 20 * deg / (Math.PI + value * Math.abs(x));
            }
            this._distortion.curve = curve;
            this._distortion.oversample = '4x';
        },
        enumerable: true,
        configurable: true
    });
    DistortionFilter.prototype.destroy = function () {
        this._distortion = null;
        _super.prototype.destroy.call(this);
    };
    return DistortionFilter;
}(Filter));

var StereoFilter = (function (_super) {
    __extends(StereoFilter, _super);
    function StereoFilter(pan) {
        if (pan === void 0) { pan = 0; }
        var _this = this;
        if (SoundLibrary.instance.useLegacy) {
            _this = _super.call(this, null) || this;
            return;
        }
        var stereo;
        var panner;
        var destination;
        var audioContext = SoundLibrary.instance.context.audioContext;
        if (audioContext.createStereoPanner) {
            stereo = audioContext.createStereoPanner();
            destination = stereo;
        }
        else {
            panner = audioContext.createPanner();
            panner.panningModel = 'equalpower';
            destination = panner;
        }
        _this = _super.call(this, destination) || this;
        _this._stereo = stereo;
        _this._panner = panner;
        _this.pan = pan;
        return _this;
    }
    Object.defineProperty(StereoFilter.prototype, "pan", {
        get: function () {
            return this._pan;
        },
        set: function (value) {
            this._pan = value;
            if (this._stereo) {
                this._stereo.pan.value = value;
            }
            else {
                this._panner.setPosition(value, 0, 1 - Math.abs(value));
            }
        },
        enumerable: true,
        configurable: true
    });
    StereoFilter.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._stereo = null;
        this._panner = null;
    };
    return StereoFilter;
}(Filter));

var ReverbFilter = (function (_super) {
    __extends(ReverbFilter, _super);
    function ReverbFilter(seconds, decay, reverse) {
        if (seconds === void 0) { seconds = 3; }
        if (decay === void 0) { decay = 2; }
        if (reverse === void 0) { reverse = false; }
        var _this = this;
        if (SoundLibrary.instance.useLegacy) {
            _this = _super.call(this, null) || this;
            return;
        }
        var convolver = SoundLibrary.instance.context.audioContext.createConvolver();
        _this = _super.call(this, convolver) || this;
        _this._convolver = convolver;
        _this._seconds = _this._clamp(seconds, 1, 50);
        _this._decay = _this._clamp(decay, 0, 100);
        _this._reverse = reverse;
        _this._rebuild();
        return _this;
    }
    ReverbFilter.prototype._clamp = function (value, min, max) {
        return Math.min(max, Math.max(min, value));
    };
    Object.defineProperty(ReverbFilter.prototype, "seconds", {
        get: function () {
            return this._seconds;
        },
        set: function (seconds) {
            this._seconds = this._clamp(seconds, 1, 50);
            this._rebuild();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReverbFilter.prototype, "decay", {
        get: function () {
            return this._decay;
        },
        set: function (decay) {
            this._decay = this._clamp(decay, 0, 100);
            this._rebuild();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReverbFilter.prototype, "reverse", {
        get: function () {
            return this._reverse;
        },
        set: function (reverse) {
            this._reverse = reverse;
            this._rebuild();
        },
        enumerable: true,
        configurable: true
    });
    ReverbFilter.prototype._rebuild = function () {
        var context = SoundLibrary.instance.context.audioContext;
        var rate = context.sampleRate;
        var length = rate * this._seconds;
        var impulse = context.createBuffer(2, length, rate);
        var impulseL = impulse.getChannelData(0);
        var impulseR = impulse.getChannelData(1);
        var n;
        for (var i = 0; i < length; i++) {
            n = this._reverse ? length - i : i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, this._decay);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, this._decay);
        }
        this._convolver.buffer = impulse;
    };
    ReverbFilter.prototype.destroy = function () {
        this._convolver = null;
        _super.prototype.destroy.call(this);
    };
    return ReverbFilter;
}(Filter));

var MonoFilter = (function (_super) {
    __extends(MonoFilter, _super);
    function MonoFilter() {
        var _this = this;
        if (SoundLibrary.instance.useLegacy) {
            _this = _super.call(this, null) || this;
        }
        var audioContext = SoundLibrary.instance.context.audioContext;
        var splitter = audioContext.createChannelSplitter();
        var merger = audioContext.createChannelMerger();
        merger.connect(splitter);
        _this = _super.call(this, merger, splitter) || this;
        _this._merger = merger;
        return _this;
    }
    MonoFilter.prototype.destroy = function () {
        this._merger.disconnect();
        this._merger = null;
        _super.prototype.destroy.call(this);
    };
    return MonoFilter;
}(Filter));

var TelephoneFilter = (function (_super) {
    __extends(TelephoneFilter, _super);
    function TelephoneFilter() {
        var _this = this;
        if (SoundLibrary.instance.useLegacy) {
            _this = _super.call(this, null) || this;
            return;
        }
        var audioContext = SoundLibrary.instance.context.audioContext;
        var lpf1 = audioContext.createBiquadFilter();
        var lpf2 = audioContext.createBiquadFilter();
        var hpf1 = audioContext.createBiquadFilter();
        var hpf2 = audioContext.createBiquadFilter();
        lpf1.type = 'lowpass';
        lpf1.frequency.value = 2000.0;
        lpf2.type = 'lowpass';
        lpf2.frequency.value = 2000.0;
        hpf1.type = 'highpass';
        hpf1.frequency.value = 500.0;
        hpf2.type = 'highpass';
        hpf2.frequency.value = 500.0;
        lpf1.connect(lpf2);
        lpf2.connect(hpf1);
        hpf1.connect(hpf2);
        _this = _super.call(this, lpf1, hpf2) || this;
        return _this;
    }
    return TelephoneFilter;
}(Filter));



var filters = Object.freeze({
	Filter: Filter,
	EqualizerFilter: EqualizerFilter,
	DistortionFilter: DistortionFilter,
	StereoFilter: StereoFilter,
	ReverbFilter: ReverbFilter,
	MonoFilter: MonoFilter,
	TelephoneFilter: TelephoneFilter
});

var sound = SoundLibrary.init();

exports.filters = filters;
exports.htmlaudio = htmlaudio;
exports.webaudio = webaudio;
exports.sound = sound;
exports.utils = SoundUtils;
exports.Sound = Sound;
exports.SoundSprite = SoundSprite;
exports.Filterable = Filterable;
exports.SoundLibrary = SoundLibrary;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=pixi-sound.js.map
