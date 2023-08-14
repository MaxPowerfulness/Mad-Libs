/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var transitionalDefaults = __webpack_require__(/*! ../defaults/transitional */ "./node_modules/axios/lib/defaults/transitional.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults/index.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/defaults/index.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ../helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ../core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");
var transitionalDefaults = __webpack_require__(/*! ./transitional */ "./node_modules/axios/lib/defaults/transitional.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ../adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ../adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/defaults/transitional.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/defaults/transitional.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.26.1"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "div {\n    width: 500px;\n    height: 500px;\n    background-color: aqua;\n    border: black solid 1px;\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,aAAa;IACb,sBAAsB;IACtB,uBAAuB;AAC3B","sourcesContent":["div {\n    width: 500px;\n    height: 500px;\n    background-color: aqua;\n    border: black solid 1px;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/form-data/lib/browser.js":
/*!***********************************************!*\
  !*** ./node_modules/form-data/lib/browser.js ***!
  \***********************************************/
/***/ ((module) => {

/* eslint-env browser */
module.exports = typeof self == 'object' ? self.FormData : window.FormData;


/***/ }),

/***/ "./node_modules/openai/dist/api.js":
/*!*****************************************!*\
  !*** ./node_modules/openai/dist/api.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OpenAIApi = exports.OpenAIApiFactory = exports.OpenAIApiFp = exports.OpenAIApiAxiosParamCreator = exports.CreateImageRequestResponseFormatEnum = exports.CreateImageRequestSizeEnum = exports.ChatCompletionResponseMessageRoleEnum = exports.ChatCompletionRequestMessageRoleEnum = void 0;
const axios_1 = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
// Some imports not used depending on template conditions
// @ts-ignore
const common_1 = __webpack_require__(/*! ./common */ "./node_modules/openai/dist/common.js");
// @ts-ignore
const base_1 = __webpack_require__(/*! ./base */ "./node_modules/openai/dist/base.js");
exports.ChatCompletionRequestMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
};
exports.ChatCompletionResponseMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
};
exports.CreateImageRequestSizeEnum = {
    _256x256: '256x256',
    _512x512: '512x512',
    _1024x1024: '1024x1024'
};
exports.CreateImageRequestResponseFormatEnum = {
    Url: 'url',
    B64Json: 'b64_json'
};
/**
 * OpenAIApi - axios parameter creator
 * @export
 */
exports.OpenAIApiAxiosParamCreator = function (configuration) {
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune: (fineTuneId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('cancelFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/cancel`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer: (createAnswerRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createAnswerRequest' is not null or undefined
            common_1.assertParamExists('createAnswer', 'createAnswerRequest', createAnswerRequest);
            const localVarPath = `/answers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createAnswerRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion: (createChatCompletionRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createChatCompletionRequest' is not null or undefined
            common_1.assertParamExists('createChatCompletion', 'createChatCompletionRequest', createChatCompletionRequest);
            const localVarPath = `/chat/completions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createChatCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification: (createClassificationRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createClassificationRequest' is not null or undefined
            common_1.assertParamExists('createClassification', 'createClassificationRequest', createClassificationRequest);
            const localVarPath = `/classifications`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createClassificationRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion: (createCompletionRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createCompletionRequest' is not null or undefined
            common_1.assertParamExists('createCompletion', 'createCompletionRequest', createCompletionRequest);
            const localVarPath = `/completions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit: (createEditRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createEditRequest' is not null or undefined
            common_1.assertParamExists('createEdit', 'createEditRequest', createEditRequest);
            const localVarPath = `/edits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createEditRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding: (createEmbeddingRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createEmbeddingRequest' is not null or undefined
            common_1.assertParamExists('createEmbedding', 'createEmbeddingRequest', createEmbeddingRequest);
            const localVarPath = `/embeddings`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createEmbeddingRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile: (file, purpose, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createFile', 'file', file);
            // verify required parameter 'purpose' is not null or undefined
            common_1.assertParamExists('createFile', 'purpose', purpose);
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (purpose !== undefined) {
                localVarFormParams.append('purpose', purpose);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune: (createFineTuneRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createFineTuneRequest' is not null or undefined
            common_1.assertParamExists('createFineTune', 'createFineTuneRequest', createFineTuneRequest);
            const localVarPath = `/fine-tunes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createFineTuneRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage: (createImageRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createImageRequest' is not null or undefined
            common_1.assertParamExists('createImage', 'createImageRequest', createImageRequest);
            const localVarPath = `/images/generations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createImageRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit: (image, prompt, mask, n, size, responseFormat, user, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'image' is not null or undefined
            common_1.assertParamExists('createImageEdit', 'image', image);
            // verify required parameter 'prompt' is not null or undefined
            common_1.assertParamExists('createImageEdit', 'prompt', prompt);
            const localVarPath = `/images/edits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (mask !== undefined) {
                localVarFormParams.append('mask', mask);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation: (image, n, size, responseFormat, user, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'image' is not null or undefined
            common_1.assertParamExists('createImageVariation', 'image', image);
            const localVarPath = `/images/variations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration: (createModerationRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createModerationRequest' is not null or undefined
            common_1.assertParamExists('createModeration', 'createModerationRequest', createModerationRequest);
            const localVarPath = `/moderations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createModerationRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch: (engineId, createSearchRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'engineId' is not null or undefined
            common_1.assertParamExists('createSearch', 'engineId', engineId);
            // verify required parameter 'createSearchRequest' is not null or undefined
            common_1.assertParamExists('createSearch', 'createSearchRequest', createSearchRequest);
            const localVarPath = `/engines/{engine_id}/search`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createSearchRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription: (file, model, prompt, responseFormat, temperature, language, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createTranscription', 'file', file);
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('createTranscription', 'model', model);
            const localVarPath = `/audio/transcriptions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            if (language !== undefined) {
                localVarFormParams.append('language', language);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation: (file, model, prompt, responseFormat, temperature, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createTranslation', 'file', file);
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('createTranslation', 'model', model);
            const localVarPath = `/audio/translations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('deleteFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'DELETE' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel: (model, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('deleteModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'DELETE' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('downloadFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}/content`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/engines`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents: (fineTuneId, stream, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('listFineTuneEvents', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/events`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            if (stream !== undefined) {
                localVarQueryParameter['stream'] = stream;
            }
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/fine-tunes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/models`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine: (engineId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'engineId' is not null or undefined
            common_1.assertParamExists('retrieveEngine', 'engineId', engineId);
            const localVarPath = `/engines/{engine_id}`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('retrieveFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune: (fineTuneId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('retrieveFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel: (model, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('retrieveModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
    };
};
/**
 * OpenAIApi - functional programming interface
 * @export
 */
exports.OpenAIApiFp = function (configuration) {
    const localVarAxiosParamCreator = exports.OpenAIApiAxiosParamCreator(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune(fineTuneId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.cancelFineTune(fineTuneId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer(createAnswerRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createAnswer(createAnswerRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion(createChatCompletionRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createChatCompletion(createChatCompletionRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification(createClassificationRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createClassification(createClassificationRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion(createCompletionRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createCompletion(createCompletionRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit(createEditRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createEdit(createEditRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding(createEmbeddingRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createEmbedding(createEmbeddingRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile(file, purpose, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createFile(file, purpose, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune(createFineTuneRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createFineTune(createFineTuneRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage(createImageRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImage(createImageRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation(image, n, size, responseFormat, user, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImageVariation(image, n, size, responseFormat, user, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration(createModerationRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createModeration(createModerationRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch(engineId, createSearchRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createSearch(engineId, createSearchRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createTranscription(file, model, prompt, responseFormat, temperature, language, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation(file, model, prompt, responseFormat, temperature, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createTranslation(file, model, prompt, responseFormat, temperature, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.deleteFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel(model, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.deleteModel(model, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.downloadFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listEngines(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFiles(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents(fineTuneId, stream, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFineTuneEvents(fineTuneId, stream, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFineTunes(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listModels(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine(engineId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveEngine(engineId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune(fineTuneId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveFineTune(fineTuneId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel(model, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveModel(model, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
    };
};
/**
 * OpenAIApi - factory interface
 * @export
 */
exports.OpenAIApiFactory = function (configuration, basePath, axios) {
    const localVarFp = exports.OpenAIApiFp(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune(fineTuneId, options) {
            return localVarFp.cancelFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer(createAnswerRequest, options) {
            return localVarFp.createAnswer(createAnswerRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion(createChatCompletionRequest, options) {
            return localVarFp.createChatCompletion(createChatCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification(createClassificationRequest, options) {
            return localVarFp.createClassification(createClassificationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion(createCompletionRequest, options) {
            return localVarFp.createCompletion(createCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit(createEditRequest, options) {
            return localVarFp.createEdit(createEditRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding(createEmbeddingRequest, options) {
            return localVarFp.createEmbedding(createEmbeddingRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile(file, purpose, options) {
            return localVarFp.createFile(file, purpose, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune(createFineTuneRequest, options) {
            return localVarFp.createFineTune(createFineTuneRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage(createImageRequest, options) {
            return localVarFp.createImage(createImageRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            return localVarFp.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation(image, n, size, responseFormat, user, options) {
            return localVarFp.createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration(createModerationRequest, options) {
            return localVarFp.createModeration(createModerationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch(engineId, createSearchRequest, options) {
            return localVarFp.createSearch(engineId, createSearchRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            return localVarFp.createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation(file, model, prompt, responseFormat, temperature, options) {
            return localVarFp.createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile(fileId, options) {
            return localVarFp.deleteFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel(model, options) {
            return localVarFp.deleteModel(model, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile(fileId, options) {
            return localVarFp.downloadFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines(options) {
            return localVarFp.listEngines(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles(options) {
            return localVarFp.listFiles(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents(fineTuneId, stream, options) {
            return localVarFp.listFineTuneEvents(fineTuneId, stream, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes(options) {
            return localVarFp.listFineTunes(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels(options) {
            return localVarFp.listModels(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine(engineId, options) {
            return localVarFp.retrieveEngine(engineId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile(fileId, options) {
            return localVarFp.retrieveFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune(fineTuneId, options) {
            return localVarFp.retrieveFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel(model, options) {
            return localVarFp.retrieveModel(model, options).then((request) => request(axios, basePath));
        },
    };
};
/**
 * OpenAIApi - object-oriented interface
 * @export
 * @class OpenAIApi
 * @extends {BaseAPI}
 */
class OpenAIApi extends base_1.BaseAPI {
    /**
     *
     * @summary Immediately cancel a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to cancel
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    cancelFineTune(fineTuneId, options) {
        return exports.OpenAIApiFp(this.configuration).cancelFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
     * @param {CreateAnswerRequest} createAnswerRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createAnswer(createAnswerRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createAnswer(createAnswerRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a completion for the chat message
     * @param {CreateChatCompletionRequest} createChatCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createChatCompletion(createChatCompletionRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createChatCompletion(createChatCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
     * @param {CreateClassificationRequest} createClassificationRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createClassification(createClassificationRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createClassification(createClassificationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a completion for the provided prompt and parameters
     * @param {CreateCompletionRequest} createCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createCompletion(createCompletionRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createCompletion(createCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a new edit for the provided input, instruction, and parameters.
     * @param {CreateEditRequest} createEditRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEdit(createEditRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createEdit(createEditRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an embedding vector representing the input text.
     * @param {CreateEmbeddingRequest} createEmbeddingRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEmbedding(createEmbeddingRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createEmbedding(createEmbeddingRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
     * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
     * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFile(file, purpose, options) {
        return exports.OpenAIApiFp(this.configuration).createFile(file, purpose, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {CreateFineTuneRequest} createFineTuneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFineTune(createFineTuneRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createFineTune(createFineTuneRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an image given a prompt.
     * @param {CreateImageRequest} createImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImage(createImageRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createImage(createImageRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an edited or extended image given an original image and a prompt.
     * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
     * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
     * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
        return exports.OpenAIApiFp(this.configuration).createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a variation of a given image.
     * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageVariation(image, n, size, responseFormat, user, options) {
        return exports.OpenAIApiFp(this.configuration).createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies if text violates OpenAI\'s Content Policy
     * @param {CreateModerationRequest} createModerationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createModeration(createModerationRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createModeration(createModerationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
     * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
     * @param {CreateSearchRequest} createSearchRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createSearch(engineId, createSearchRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createSearch(engineId, createSearchRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Transcribes audio into the input language.
     * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
        return exports.OpenAIApiFp(this.configuration).createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Translates audio into into English.
     * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranslation(file, model, prompt, responseFormat, temperature, options) {
        return exports.OpenAIApiFp(this.configuration).createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).deleteFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
     * @param {string} model The model to delete
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteModel(model, options) {
        return exports.OpenAIApiFp(this.configuration).deleteModel(model, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the contents of the specified file
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    downloadFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).downloadFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listEngines(options) {
        return exports.OpenAIApiFp(this.configuration).listEngines(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a list of files that belong to the user\'s organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFiles(options) {
        return exports.OpenAIApiFp(this.configuration).listFiles(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get fine-grained status updates for a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to get events for.
     * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTuneEvents(fineTuneId, stream, options) {
        return exports.OpenAIApiFp(this.configuration).listFineTuneEvents(fineTuneId, stream, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary List your organization\'s fine-tuning jobs
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTunes(options) {
        return exports.OpenAIApiFp(this.configuration).listFineTunes(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listModels(options) {
        return exports.OpenAIApiFp(this.configuration).listModels(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
     * @param {string} engineId The ID of the engine to use for this request
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveEngine(engineId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveEngine(engineId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns information about a specific file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {string} fineTuneId The ID of the fine-tune job
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFineTune(fineTuneId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
     * @param {string} model The ID of the model to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveModel(model, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveModel(model, options).then((request) => request(this.axios, this.basePath));
    }
}
exports.OpenAIApi = OpenAIApi;


/***/ }),

/***/ "./node_modules/openai/dist/base.js":
/*!******************************************!*\
  !*** ./node_modules/openai/dist/base.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequiredError = exports.BaseAPI = exports.COLLECTION_FORMATS = exports.BASE_PATH = void 0;
const axios_1 = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
exports.BASE_PATH = "https://api.openai.com/v1".replace(/\/+$/, "");
/**
 *
 * @export
 */
exports.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "\t",
    pipes: "|",
};
/**
 *
 * @export
 * @class BaseAPI
 */
class BaseAPI {
    constructor(configuration, basePath = exports.BASE_PATH, axios = axios_1.default) {
        this.basePath = basePath;
        this.axios = axios;
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath || this.basePath;
        }
    }
}
exports.BaseAPI = BaseAPI;
;
/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
class RequiredError extends Error {
    constructor(field, msg) {
        super(msg);
        this.field = field;
        this.name = "RequiredError";
    }
}
exports.RequiredError = RequiredError;


/***/ }),

/***/ "./node_modules/openai/dist/common.js":
/*!********************************************!*\
  !*** ./node_modules/openai/dist/common.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRequestFunction = exports.toPathString = exports.serializeDataIfNeeded = exports.setSearchParams = exports.setOAuthToObject = exports.setBearerAuthToObject = exports.setBasicAuthToObject = exports.setApiKeyToObject = exports.assertParamExists = exports.DUMMY_BASE_URL = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./node_modules/openai/dist/base.js");
/**
 *
 * @export
 */
exports.DUMMY_BASE_URL = 'https://example.com';
/**
 *
 * @throws {RequiredError}
 * @export
 */
exports.assertParamExists = function (functionName, paramName, paramValue) {
    if (paramValue === null || paramValue === undefined) {
        throw new base_1.RequiredError(paramName, `Required parameter ${paramName} was null or undefined when calling ${functionName}.`);
    }
};
/**
 *
 * @export
 */
exports.setApiKeyToObject = function (object, keyParamName, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.apiKey) {
            const localVarApiKeyValue = typeof configuration.apiKey === 'function'
                ? yield configuration.apiKey(keyParamName)
                : yield configuration.apiKey;
            object[keyParamName] = localVarApiKeyValue;
        }
    });
};
/**
 *
 * @export
 */
exports.setBasicAuthToObject = function (object, configuration) {
    if (configuration && (configuration.username || configuration.password)) {
        object["auth"] = { username: configuration.username, password: configuration.password };
    }
};
/**
 *
 * @export
 */
exports.setBearerAuthToObject = function (object, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.accessToken) {
            const accessToken = typeof configuration.accessToken === 'function'
                ? yield configuration.accessToken()
                : yield configuration.accessToken;
            object["Authorization"] = "Bearer " + accessToken;
        }
    });
};
/**
 *
 * @export
 */
exports.setOAuthToObject = function (object, name, scopes, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.accessToken) {
            const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
                ? yield configuration.accessToken(name, scopes)
                : yield configuration.accessToken;
            object["Authorization"] = "Bearer " + localVarAccessTokenValue;
        }
    });
};
function setFlattenedQueryParams(urlSearchParams, parameter, key = "") {
    if (parameter == null)
        return;
    if (typeof parameter === "object") {
        if (Array.isArray(parameter)) {
            parameter.forEach(item => setFlattenedQueryParams(urlSearchParams, item, key));
        }
        else {
            Object.keys(parameter).forEach(currentKey => setFlattenedQueryParams(urlSearchParams, parameter[currentKey], `${key}${key !== '' ? '.' : ''}${currentKey}`));
        }
    }
    else {
        if (urlSearchParams.has(key)) {
            urlSearchParams.append(key, parameter);
        }
        else {
            urlSearchParams.set(key, parameter);
        }
    }
}
/**
 *
 * @export
 */
exports.setSearchParams = function (url, ...objects) {
    const searchParams = new URLSearchParams(url.search);
    setFlattenedQueryParams(searchParams, objects);
    url.search = searchParams.toString();
};
/**
 *
 * @export
 */
exports.serializeDataIfNeeded = function (value, requestOptions, configuration) {
    const nonString = typeof value !== 'string';
    const needsSerialization = nonString && configuration && configuration.isJsonMime
        ? configuration.isJsonMime(requestOptions.headers['Content-Type'])
        : nonString;
    return needsSerialization
        ? JSON.stringify(value !== undefined ? value : {})
        : (value || "");
};
/**
 *
 * @export
 */
exports.toPathString = function (url) {
    return url.pathname + url.search + url.hash;
};
/**
 *
 * @export
 */
exports.createRequestFunction = function (axiosArgs, globalAxios, BASE_PATH, configuration) {
    return (axios = globalAxios, basePath = BASE_PATH) => {
        const axiosRequestArgs = Object.assign(Object.assign({}, axiosArgs.options), { url: ((configuration === null || configuration === void 0 ? void 0 : configuration.basePath) || basePath) + axiosArgs.url });
        return axios.request(axiosRequestArgs);
    };
};


/***/ }),

/***/ "./node_modules/openai/dist/configuration.js":
/*!***************************************************!*\
  !*** ./node_modules/openai/dist/configuration.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Configuration = void 0;
const packageJson = __webpack_require__(/*! ../package.json */ "./node_modules/openai/package.json");
class Configuration {
    constructor(param = {}) {
        this.apiKey = param.apiKey;
        this.organization = param.organization;
        this.username = param.username;
        this.password = param.password;
        this.accessToken = param.accessToken;
        this.basePath = param.basePath;
        this.baseOptions = param.baseOptions;
        this.formDataCtor = param.formDataCtor;
        if (!this.baseOptions) {
            this.baseOptions = {};
        }
        this.baseOptions.headers = Object.assign({ 'User-Agent': `OpenAI/NodeJS/${packageJson.version}`, 'Authorization': `Bearer ${this.apiKey}` }, this.baseOptions.headers);
        if (this.organization) {
            this.baseOptions.headers['OpenAI-Organization'] = this.organization;
        }
        if (!this.formDataCtor) {
            this.formDataCtor = __webpack_require__(/*! form-data */ "./node_modules/form-data/lib/browser.js");
        }
    }
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    isJsonMime(mime) {
        const jsonMime = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    }
}
exports.Configuration = Configuration;


/***/ }),

/***/ "./node_modules/openai/dist/index.js":
/*!*******************************************!*\
  !*** ./node_modules/openai/dist/index.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./api */ "./node_modules/openai/dist/api.js"), exports);
__exportStar(__webpack_require__(/*! ./configuration */ "./node_modules/openai/dist/configuration.js"), exports);


/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./node_modules/openai/package.json":
/*!******************************************!*\
  !*** ./node_modules/openai/package.json ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"openai","version":"3.2.1","description":"Node.js library for the OpenAI API","repository":{"type":"git","url":"git@github.com:openai/openai-node.git"},"keywords":["openai","open","ai","gpt-3","gpt3"],"author":"OpenAI","license":"MIT","main":"./dist/index.js","types":"./dist/index.d.ts","scripts":{"build":"tsc --outDir dist/"},"dependencies":{"axios":"^0.26.0","form-data":"^4.0.0"},"devDependencies":{"@types/node":"^12.11.5","typescript":"^3.6.4"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");



const openai = __webpack_require__(/*! openai */ "./node_modules/openai/dist/index.js");
const apiKey = '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';
openai.apiKey = apiKey;
console.log(openai);
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7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QUNBLGtEQUFrRDtBQUNsRDtBQUNBO0FBQ0EsMENBQTBDO0FBQzFDO0FBQ0E7QUFDQTtBQUNBLGlGQUFpRjtBQUNqRjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLHlEQUF5RDtBQUN6RDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUM1RGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDYkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7Ozs7Ozs7Ozs7Ozs7QUNBcUI7OztBQUdyQixlQUFlLG1CQUFPLENBQUMsbURBQVE7QUFDL0I7QUFDQTtBQUNBLG9CIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzL2luZGV4LmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy90cmFuc2l0aW9uYWwuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2Vudi9kYXRhLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3ZhbGlkYXRvci5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9zcmMvc3R5bGUuY3NzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL21hZC1saWJzLy4vbm9kZV9tb2R1bGVzL2Zvcm0tZGF0YS9saWIvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9vcGVuYWkvZGlzdC9hcGkuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvb3BlbmFpL2Rpc3QvYmFzZS5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9vcGVuYWkvZGlzdC9jb21tb24uanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvb3BlbmFpL2Rpc3QvY29uZmlndXJhdGlvbi5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9vcGVuYWkvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL3NyYy9zdHlsZS5jc3M/NzE2MyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9tYWQtbGlicy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL21hZC1saWJzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL21hZC1saWJzL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL21hZC1saWJzL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9tYWQtbGlicy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL21hZC1saWJzL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbWFkLWxpYnMvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL21hZC1saWJzLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciB0cmFuc2l0aW9uYWxEZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzL3RyYW5zaXRpb25hbCcpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIHZhciBvbkNhbmNlbGVkO1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi51bnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUoZnVuY3Rpb24gX3Jlc29sdmUodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIF9yZWplY3QoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dCA/ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcgOiAndGltZW91dCBleGNlZWRlZCc7XG4gICAgICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbCB8fCB0cmFuc2l0aW9uYWxEZWZhdWx0cztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgdHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4gfHwgY29uZmlnLnNpZ25hbCkge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICAgIG9uQ2FuY2VsZWQgPSBmdW5jdGlvbihjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlamVjdCghY2FuY2VsIHx8IChjYW5jZWwgJiYgY2FuY2VsLnR5cGUpID8gbmV3IENhbmNlbCgnY2FuY2VsZWQnKSA6IGNhbmNlbCk7XG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4gJiYgY29uZmlnLmNhbmNlbFRva2VuLnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwuYWJvcnRlZCA/IG9uQ2FuY2VsZWQoKSA6IGNvbmZpZy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICAvLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG4gIGluc3RhbmNlLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICAgIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhkZWZhdWx0Q29uZmlnLCBpbnN0YW5jZUNvbmZpZykpO1xuICB9O1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcbmF4aW9zLlZFUlNJT04gPSByZXF1aXJlKCcuL2Vudi9kYXRhJykudmVyc2lvbjtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuXG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuKGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgIGlmICghdG9rZW4uX2xpc3RlbmVycykgcmV0dXJuO1xuXG4gICAgdmFyIGk7XG4gICAgdmFyIGwgPSB0b2tlbi5fbGlzdGVuZXJzLmxlbmd0aDtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuLl9saXN0ZW5lcnNbaV0oY2FuY2VsKTtcbiAgICB9XG4gICAgdG9rZW4uX2xpc3RlbmVycyA9IG51bGw7XG4gIH0pO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuID0gZnVuY3Rpb24ob25mdWxmaWxsZWQpIHtcbiAgICB2YXIgX3Jlc29sdmU7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgIHRva2VuLnN1YnNjcmliZShyZXNvbHZlKTtcbiAgICAgIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICB9KS50aGVuKG9uZnVsZmlsbGVkKTtcblxuICAgIHByb21pc2UuY2FuY2VsID0gZnVuY3Rpb24gcmVqZWN0KCkge1xuICAgICAgdG9rZW4udW5zdWJzY3JpYmUoX3Jlc29sdmUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfTtcblxuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIGxpc3RlbmVyKHRoaXMucmVhc29uKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtsaXN0ZW5lcl07XG4gIH1cbn07XG5cbi8qKlxuICogVW5zdWJzY3JpYmUgZnJvbSB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICghdGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IHRoaXMuX2xpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnT3JVcmwsIGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZ09yVXJsID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25maWcudXJsID0gY29uZmlnT3JVcmw7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnT3JVcmwgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc3RhdHVzOiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc3RhdHVzID8gdGhpcy5yZXNwb25zZS5zdGF0dXMgOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURpcmVjdEtleXMocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lcmdlTWFwID0ge1xuICAgICd1cmwnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdtZXRob2QnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdkYXRhJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnYmFzZVVSTCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlcXVlc3QnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXNwb25zZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3BhcmFtc1NlcmlhbGl6ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dE1lc3NhZ2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd3aXRoQ3JlZGVudGlhbHMnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdhZGFwdGVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VUeXBlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkNvb2tpZU5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmSGVhZGVyTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uVXBsb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvbkRvd25sb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdkZWNvbXByZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Q29udGVudExlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heEJvZHlMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc3BvcnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwc0FnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnY2FuY2VsVG9rZW4nOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdzb2NrZXRQYXRoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VFbmNvZGluZyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3ZhbGlkYXRlU3RhdHVzJzogbWVyZ2VEaXJlY3RLZXlzXG4gIH07XG5cbiAgdXRpbHMuZm9yRWFjaChPYmplY3Qua2V5cyhjb25maWcxKS5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpLCBmdW5jdGlvbiBjb21wdXRlQ29uZmlnVmFsdWUocHJvcCkge1xuICAgIHZhciBtZXJnZSA9IG1lcmdlTWFwW3Byb3BdIHx8IG1lcmdlRGVlcFByb3BlcnRpZXM7XG4gICAgdmFyIGNvbmZpZ1ZhbHVlID0gbWVyZ2UocHJvcCk7XG4gICAgKHV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZ1ZhbHVlKSAmJiBtZXJnZSAhPT0gbWVyZ2VEaXJlY3RLZXlzKSB8fCAoY29uZmlnW3Byb3BdID0gY29uZmlnVmFsdWUpO1xuICB9KTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvZW5oYW5jZUVycm9yJyk7XG52YXIgdHJhbnNpdGlvbmFsRGVmYXVsdHMgPSByZXF1aXJlKCcuL3RyYW5zaXRpb25hbCcpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4uL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHRyYW5zaXRpb25hbERlZmF1bHRzLFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9LFxuXG4gIGhlYWRlcnM6IHtcbiAgICBjb21tb246IHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICAgIH1cbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgY2xhcmlmeVRpbWVvdXRFcnJvcjogZmFsc2Vcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4yNi4xXCJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGQrXFwtLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuIHV0aWxzLmlzT2JqZWN0KHBheWxvYWQpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBWRVJTSU9OID0gcmVxdWlyZSgnLi4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3IgLSBzZXQgdG8gZmFsc2UgaWYgdGhlIHRyYW5zaXRpb25hbCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZFxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uIC0gZGVwcmVjYXRlZCB2ZXJzaW9uIC8gcmVtb3ZlZCBzaW5jZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IG1lc3NhZ2UgLSBzb21lIG1lc3NhZ2Ugd2l0aCBhZGRpdGlvbmFsIGluZm9cbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBWRVJTSU9OICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkJyArICh2ZXJzaW9uID8gJyBpbiAnICsgdmVyc2lvbiA6ICcnKSkpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRm9ybURhdGFdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAoaXNBcnJheUJ1ZmZlcih2YWwuYnVmZmVyKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IFVSTFNlYXJjaFBhcmFtc10nO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJkaXYge1xcbiAgICB3aWR0aDogNTAwcHg7XFxuICAgIGhlaWdodDogNTAwcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IGFxdWE7XFxuICAgIGJvcmRlcjogYmxhY2sgc29saWQgMXB4O1xcbn1cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBO0lBQ0ksWUFBWTtJQUNaLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsdUJBQXVCO0FBQzNCXCIsXCJzb3VyY2VzQ29udGVudFwiOltcImRpdiB7XFxuICAgIHdpZHRoOiA1MDBweDtcXG4gICAgaGVpZ2h0OiA1MDBweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogYXF1YTtcXG4gICAgYm9yZGVyOiBibGFjayBzb2xpZCAxcHg7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG5tb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnID8gc2VsZi5Gb3JtRGF0YSA6IHdpbmRvdy5Gb3JtRGF0YTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogdHNsaW50OmRpc2FibGUgKi9cbi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIE9wZW5BSSBBUElcbiAqIEFQSXMgZm9yIHNhbXBsaW5nIGZyb20gYW5kIGZpbmUtdHVuaW5nIGxhbmd1YWdlIG1vZGVsc1xuICpcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBPcGVuQVBJIGRvY3VtZW50OiAxLjIuMFxuICpcbiAqXG4gKiBOT1RFOiBUaGlzIGNsYXNzIGlzIGF1dG8gZ2VuZXJhdGVkIGJ5IE9wZW5BUEkgR2VuZXJhdG9yIChodHRwczovL29wZW5hcGktZ2VuZXJhdG9yLnRlY2gpLlxuICogaHR0cHM6Ly9vcGVuYXBpLWdlbmVyYXRvci50ZWNoXG4gKiBEbyBub3QgZWRpdCB0aGUgY2xhc3MgbWFudWFsbHkuXG4gKi9cbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5PcGVuQUlBcGkgPSBleHBvcnRzLk9wZW5BSUFwaUZhY3RvcnkgPSBleHBvcnRzLk9wZW5BSUFwaUZwID0gZXhwb3J0cy5PcGVuQUlBcGlBeGlvc1BhcmFtQ3JlYXRvciA9IGV4cG9ydHMuQ3JlYXRlSW1hZ2VSZXF1ZXN0UmVzcG9uc2VGb3JtYXRFbnVtID0gZXhwb3J0cy5DcmVhdGVJbWFnZVJlcXVlc3RTaXplRW51bSA9IGV4cG9ydHMuQ2hhdENvbXBsZXRpb25SZXNwb25zZU1lc3NhZ2VSb2xlRW51bSA9IGV4cG9ydHMuQ2hhdENvbXBsZXRpb25SZXF1ZXN0TWVzc2FnZVJvbGVFbnVtID0gdm9pZCAwO1xuY29uc3QgYXhpb3NfMSA9IHJlcXVpcmUoXCJheGlvc1wiKTtcbi8vIFNvbWUgaW1wb3J0cyBub3QgdXNlZCBkZXBlbmRpbmcgb24gdGVtcGxhdGUgY29uZGl0aW9uc1xuLy8gQHRzLWlnbm9yZVxuY29uc3QgY29tbW9uXzEgPSByZXF1aXJlKFwiLi9jb21tb25cIik7XG4vLyBAdHMtaWdub3JlXG5jb25zdCBiYXNlXzEgPSByZXF1aXJlKFwiLi9iYXNlXCIpO1xuZXhwb3J0cy5DaGF0Q29tcGxldGlvblJlcXVlc3RNZXNzYWdlUm9sZUVudW0gPSB7XG4gICAgU3lzdGVtOiAnc3lzdGVtJyxcbiAgICBVc2VyOiAndXNlcicsXG4gICAgQXNzaXN0YW50OiAnYXNzaXN0YW50J1xufTtcbmV4cG9ydHMuQ2hhdENvbXBsZXRpb25SZXNwb25zZU1lc3NhZ2VSb2xlRW51bSA9IHtcbiAgICBTeXN0ZW06ICdzeXN0ZW0nLFxuICAgIFVzZXI6ICd1c2VyJyxcbiAgICBBc3Npc3RhbnQ6ICdhc3Npc3RhbnQnXG59O1xuZXhwb3J0cy5DcmVhdGVJbWFnZVJlcXVlc3RTaXplRW51bSA9IHtcbiAgICBfMjU2eDI1NjogJzI1NngyNTYnLFxuICAgIF81MTJ4NTEyOiAnNTEyeDUxMicsXG4gICAgXzEwMjR4MTAyNDogJzEwMjR4MTAyNCdcbn07XG5leHBvcnRzLkNyZWF0ZUltYWdlUmVxdWVzdFJlc3BvbnNlRm9ybWF0RW51bSA9IHtcbiAgICBVcmw6ICd1cmwnLFxuICAgIEI2NEpzb246ICdiNjRfanNvbidcbn07XG4vKipcbiAqIE9wZW5BSUFwaSAtIGF4aW9zIHBhcmFtZXRlciBjcmVhdG9yXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuT3BlbkFJQXBpQXhpb3NQYXJhbUNyZWF0b3IgPSBmdW5jdGlvbiAoY29uZmlndXJhdGlvbikge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBJbW1lZGlhdGVseSBjYW5jZWwgYSBmaW5lLXR1bmUgam9iLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZVR1bmVJZCBUaGUgSUQgb2YgdGhlIGZpbmUtdHVuZSBqb2IgdG8gY2FuY2VsXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWxGaW5lVHVuZTogKGZpbmVUdW5lSWQsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnZmluZVR1bmVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY2FuY2VsRmluZVR1bmUnLCAnZmluZVR1bmVJZCcsIGZpbmVUdW5lSWQpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9maW5lLXR1bmVzL3tmaW5lX3R1bmVfaWR9L2NhbmNlbGBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJmaW5lX3R1bmVfaWRcIn19YCwgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhmaW5lVHVuZUlkKSkpO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEFuc3dlcnMgdGhlIHNwZWNpZmllZCBxdWVzdGlvbiB1c2luZyB0aGUgcHJvdmlkZWQgZG9jdW1lbnRzIGFuZCBleGFtcGxlcy4gIFRoZSBlbmRwb2ludCBmaXJzdCBbc2VhcmNoZXNdKC9kb2NzL2FwaS1yZWZlcmVuY2Uvc2VhcmNoZXMpIG92ZXIgcHJvdmlkZWQgZG9jdW1lbnRzIG9yIGZpbGVzIHRvIGZpbmQgcmVsZXZhbnQgY29udGV4dC4gVGhlIHJlbGV2YW50IGNvbnRleHQgaXMgY29tYmluZWQgd2l0aCB0aGUgcHJvdmlkZWQgZXhhbXBsZXMgYW5kIHF1ZXN0aW9uIHRvIGNyZWF0ZSB0aGUgcHJvbXB0IGZvciBbY29tcGxldGlvbl0oL2RvY3MvYXBpLXJlZmVyZW5jZS9jb21wbGV0aW9ucykuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQW5zd2VyUmVxdWVzdH0gY3JlYXRlQW5zd2VyUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlQW5zd2VyOiAoY3JlYXRlQW5zd2VyUmVxdWVzdCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdjcmVhdGVBbnN3ZXJSZXF1ZXN0JyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVBbnN3ZXInLCAnY3JlYXRlQW5zd2VyUmVxdWVzdCcsIGNyZWF0ZUFuc3dlclJlcXVlc3QpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9hbnN3ZXJzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlQW5zd2VyUmVxdWVzdCwgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucywgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgY29tcGxldGlvbiBmb3IgdGhlIGNoYXQgbWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdH0gY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVDaGF0Q29tcGxldGlvbjogKGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUNoYXRDb21wbGV0aW9uJywgJ2NyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCcsIGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2NoYXQvY29tcGxldGlvbnNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGNvbW1vbl8xLnNlcmlhbGl6ZURhdGFJZk5lZWRlZChjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ2xhc3NpZmllcyB0aGUgc3BlY2lmaWVkIGBxdWVyeWAgdXNpbmcgcHJvdmlkZWQgZXhhbXBsZXMuICBUaGUgZW5kcG9pbnQgZmlyc3QgW3NlYXJjaGVzXSgvZG9jcy9hcGktcmVmZXJlbmNlL3NlYXJjaGVzKSBvdmVyIHRoZSBsYWJlbGVkIGV4YW1wbGVzIHRvIHNlbGVjdCB0aGUgb25lcyBtb3N0IHJlbGV2YW50IGZvciB0aGUgcGFydGljdWxhciBxdWVyeS4gVGhlbiwgdGhlIHJlbGV2YW50IGV4YW1wbGVzIGFyZSBjb21iaW5lZCB3aXRoIHRoZSBxdWVyeSB0byBjb25zdHJ1Y3QgYSBwcm9tcHQgdG8gcHJvZHVjZSB0aGUgZmluYWwgbGFiZWwgdmlhIHRoZSBbY29tcGxldGlvbnNdKC9kb2NzL2FwaS1yZWZlcmVuY2UvY29tcGxldGlvbnMpIGVuZHBvaW50LiAgTGFiZWxlZCBleGFtcGxlcyBjYW4gYmUgcHJvdmlkZWQgdmlhIGFuIHVwbG9hZGVkIGBmaWxlYCwgb3IgZXhwbGljaXRseSBsaXN0ZWQgaW4gdGhlIHJlcXVlc3QgdXNpbmcgdGhlIGBleGFtcGxlc2AgcGFyYW1ldGVyIGZvciBxdWljayB0ZXN0cyBhbmQgc21hbGwgc2NhbGUgdXNlIGNhc2VzLlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdH0gY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVDbGFzc2lmaWNhdGlvbjogKGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUNsYXNzaWZpY2F0aW9uJywgJ2NyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCcsIGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2NsYXNzaWZpY2F0aW9uc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ1BPU1QnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gY29tbW9uXzEuc2VyaWFsaXplRGF0YUlmTmVlZGVkKGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCwgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucywgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgY29tcGxldGlvbiBmb3IgdGhlIHByb3ZpZGVkIHByb21wdCBhbmQgcGFyYW1ldGVyc1xuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0fSBjcmVhdGVDb21wbGV0aW9uUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlQ29tcGxldGlvbjogKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2NyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0JyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVDb21wbGV0aW9uJywgJ2NyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0JywgY3JlYXRlQ29tcGxldGlvblJlcXVlc3QpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9jb21wbGV0aW9uc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ1BPU1QnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gY29tbW9uXzEuc2VyaWFsaXplRGF0YUlmTmVlZGVkKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBsb2NhbFZhclJlcXVlc3RPcHRpb25zLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBuZXcgZWRpdCBmb3IgdGhlIHByb3ZpZGVkIGlucHV0LCBpbnN0cnVjdGlvbiwgYW5kIHBhcmFtZXRlcnMuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlRWRpdFJlcXVlc3R9IGNyZWF0ZUVkaXRSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVFZGl0OiAoY3JlYXRlRWRpdFJlcXVlc3QsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnY3JlYXRlRWRpdFJlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUVkaXQnLCAnY3JlYXRlRWRpdFJlcXVlc3QnLCBjcmVhdGVFZGl0UmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2VkaXRzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlRWRpdFJlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBlbWJlZGRpbmcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgaW5wdXQgdGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVFbWJlZGRpbmdSZXF1ZXN0fSBjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVFbWJlZGRpbmc6IChjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0LCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2NyZWF0ZUVtYmVkZGluZ1JlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUVtYmVkZGluZycsICdjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0JywgY3JlYXRlRW1iZWRkaW5nUmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2VtYmVkZGluZ3NgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGNvbW1vbl8xLnNlcmlhbGl6ZURhdGFJZk5lZWRlZChjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0LCBsb2NhbFZhclJlcXVlc3RPcHRpb25zLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFVwbG9hZCBhIGZpbGUgdGhhdCBjb250YWlucyBkb2N1bWVudChzKSB0byBiZSB1c2VkIGFjcm9zcyB2YXJpb3VzIGVuZHBvaW50cy9mZWF0dXJlcy4gQ3VycmVudGx5LCB0aGUgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHVwbG9hZGVkIGJ5IG9uZSBvcmdhbml6YXRpb24gY2FuIGJlIHVwIHRvIDEgR0IuIFBsZWFzZSBjb250YWN0IHVzIGlmIHlvdSBuZWVkIHRvIGluY3JlYXNlIHRoZSBzdG9yYWdlIGxpbWl0LlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgTmFtZSBvZiB0aGUgW0pTT04gTGluZXNdKGh0dHBzOi8vanNvbmxpbmVzLnJlYWR0aGVkb2NzLmlvL2VuL2xhdGVzdC8pIGZpbGUgdG8gYmUgdXBsb2FkZWQuICBJZiB0aGUgJiN4NjA7cHVycG9zZSYjeDYwOyBpcyBzZXQgdG8gXFxcXFxcJnF1b3Q7ZmluZS10dW5lXFxcXFxcJnF1b3Q7LCBlYWNoIGxpbmUgaXMgYSBKU09OIHJlY29yZCB3aXRoIFxcXFxcXCZxdW90O3Byb21wdFxcXFxcXCZxdW90OyBhbmQgXFxcXFxcJnF1b3Q7Y29tcGxldGlvblxcXFxcXCZxdW90OyBmaWVsZHMgcmVwcmVzZW50aW5nIHlvdXIgW3RyYWluaW5nIGV4YW1wbGVzXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcvcHJlcGFyZS10cmFpbmluZy1kYXRhKS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHB1cnBvc2UgVGhlIGludGVuZGVkIHB1cnBvc2Ugb2YgdGhlIHVwbG9hZGVkIGRvY3VtZW50cy4gIFVzZSBcXFxcXFwmcXVvdDtmaW5lLXR1bmVcXFxcXFwmcXVvdDsgZm9yIFtGaW5lLXR1bmluZ10oL2RvY3MvYXBpLXJlZmVyZW5jZS9maW5lLXR1bmVzKS4gVGhpcyBhbGxvd3MgdXMgdG8gdmFsaWRhdGUgdGhlIGZvcm1hdCBvZiB0aGUgdXBsb2FkZWQgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUZpbGU6IChmaWxlLCBwdXJwb3NlLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ZpbGUnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUZpbGUnLCAnZmlsZScsIGZpbGUpO1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAncHVycG9zZScgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlRmlsZScsICdwdXJwb3NlJywgcHVycG9zZSk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbGVzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckZvcm1QYXJhbXMgPSBuZXcgKChjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uZm9ybURhdGFDdG9yKSB8fCBGb3JtRGF0YSkoKTtcbiAgICAgICAgICAgIGlmIChmaWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHVycG9zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgncHVycG9zZScsIHB1cnBvc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ211bHRpcGFydC9mb3JtLWRhdGEnO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgbG9jYWxWYXJGb3JtUGFyYW1zLmdldEhlYWRlcnMoKSksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gbG9jYWxWYXJGb3JtUGFyYW1zO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIGpvYiB0aGF0IGZpbmUtdHVuZXMgYSBzcGVjaWZpZWQgbW9kZWwgZnJvbSBhIGdpdmVuIGRhdGFzZXQuICBSZXNwb25zZSBpbmNsdWRlcyBkZXRhaWxzIG9mIHRoZSBlbnF1ZXVlZCBqb2IgaW5jbHVkaW5nIGpvYiBzdGF0dXMgYW5kIHRoZSBuYW1lIG9mIHRoZSBmaW5lLXR1bmVkIG1vZGVscyBvbmNlIGNvbXBsZXRlLiAgW0xlYXJuIG1vcmUgYWJvdXQgRmluZS10dW5pbmddKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZylcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVGaW5lVHVuZVJlcXVlc3R9IGNyZWF0ZUZpbmVUdW5lUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRmluZVR1bmU6IChjcmVhdGVGaW5lVHVuZVJlcXVlc3QsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnY3JlYXRlRmluZVR1bmVSZXF1ZXN0JyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVGaW5lVHVuZScsICdjcmVhdGVGaW5lVHVuZVJlcXVlc3QnLCBjcmVhdGVGaW5lVHVuZVJlcXVlc3QpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9maW5lLXR1bmVzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlRmluZVR1bmVSZXF1ZXN0LCBsb2NhbFZhclJlcXVlc3RPcHRpb25zLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gaW1hZ2UgZ2l2ZW4gYSBwcm9tcHQuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlSW1hZ2VSZXF1ZXN0fSBjcmVhdGVJbWFnZVJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUltYWdlOiAoY3JlYXRlSW1hZ2VSZXF1ZXN0LCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2NyZWF0ZUltYWdlUmVxdWVzdCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlSW1hZ2UnLCAnY3JlYXRlSW1hZ2VSZXF1ZXN0JywgY3JlYXRlSW1hZ2VSZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvaW1hZ2VzL2dlbmVyYXRpb25zYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlSW1hZ2VSZXF1ZXN0LCBsb2NhbFZhclJlcXVlc3RPcHRpb25zLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gZWRpdGVkIG9yIGV4dGVuZGVkIGltYWdlIGdpdmVuIGFuIG9yaWdpbmFsIGltYWdlIGFuZCBhIHByb21wdC5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBpbWFnZSBUaGUgaW1hZ2UgdG8gZWRpdC4gTXVzdCBiZSBhIHZhbGlkIFBORyBmaWxlLCBsZXNzIHRoYW4gNE1CLCBhbmQgc3F1YXJlLiBJZiBtYXNrIGlzIG5vdCBwcm92aWRlZCwgaW1hZ2UgbXVzdCBoYXZlIHRyYW5zcGFyZW5jeSwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIHRoZSBtYXNrLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvbXB0IEEgdGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUgZGVzaXJlZCBpbWFnZShzKS4gVGhlIG1heGltdW0gbGVuZ3RoIGlzIDEwMDAgY2hhcmFjdGVycy5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBbbWFza10gQW4gYWRkaXRpb25hbCBpbWFnZSB3aG9zZSBmdWxseSB0cmFuc3BhcmVudCBhcmVhcyAoZS5nLiB3aGVyZSBhbHBoYSBpcyB6ZXJvKSBpbmRpY2F0ZSB3aGVyZSAmI3g2MDtpbWFnZSYjeDYwOyBzaG91bGQgYmUgZWRpdGVkLiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBoYXZlIHRoZSBzYW1lIGRpbWVuc2lvbnMgYXMgJiN4NjA7aW1hZ2UmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBpbWFnZXMgdG8gZ2VuZXJhdGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IGluIHdoaWNoIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzIGFyZSByZXR1cm5lZC4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7dXJsJiN4NjA7IG9yICYjeDYwO2I2NF9qc29uJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIEEgdW5pcXVlIGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHlvdXIgZW5kLXVzZXIsIHdoaWNoIGNhbiBoZWxwIE9wZW5BSSB0byBtb25pdG9yIGFuZCBkZXRlY3QgYWJ1c2UuIFtMZWFybiBtb3JlXSgvZG9jcy9ndWlkZXMvc2FmZXR5LWJlc3QtcHJhY3RpY2VzL2VuZC11c2VyLWlkcykuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVJbWFnZUVkaXQ6IChpbWFnZSwgcHJvbXB0LCBtYXNrLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdpbWFnZScgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlSW1hZ2VFZGl0JywgJ2ltYWdlJywgaW1hZ2UpO1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAncHJvbXB0JyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVJbWFnZUVkaXQnLCAncHJvbXB0JywgcHJvbXB0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvaW1hZ2VzL2VkaXRzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckZvcm1QYXJhbXMgPSBuZXcgKChjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uZm9ybURhdGFDdG9yKSB8fCBGb3JtRGF0YSkoKTtcbiAgICAgICAgICAgIGlmIChpbWFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnaW1hZ2UnLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWFzayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnbWFzaycsIG1hc2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb21wdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgncHJvbXB0JywgcHJvbXB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCduJywgbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnc2l6ZScsIHNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdyZXNwb25zZV9mb3JtYXQnLCByZXNwb25zZUZvcm1hdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodXNlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgndXNlcicsIHVzZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ211bHRpcGFydC9mb3JtLWRhdGEnO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgbG9jYWxWYXJGb3JtUGFyYW1zLmdldEhlYWRlcnMoKSksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gbG9jYWxWYXJGb3JtUGFyYW1zO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIHZhcmlhdGlvbiBvZiBhIGdpdmVuIGltYWdlLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGltYWdlIFRoZSBpbWFnZSB0byB1c2UgYXMgdGhlIGJhc2lzIGZvciB0aGUgdmFyaWF0aW9uKHMpLiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBzcXVhcmUuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBpbWFnZXMgdG8gZ2VuZXJhdGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IGluIHdoaWNoIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzIGFyZSByZXR1cm5lZC4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7dXJsJiN4NjA7IG9yICYjeDYwO2I2NF9qc29uJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIEEgdW5pcXVlIGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHlvdXIgZW5kLXVzZXIsIHdoaWNoIGNhbiBoZWxwIE9wZW5BSSB0byBtb25pdG9yIGFuZCBkZXRlY3QgYWJ1c2UuIFtMZWFybiBtb3JlXSgvZG9jcy9ndWlkZXMvc2FmZXR5LWJlc3QtcHJhY3RpY2VzL2VuZC11c2VyLWlkcykuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVJbWFnZVZhcmlhdGlvbjogKGltYWdlLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdpbWFnZScgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlSW1hZ2VWYXJpYXRpb24nLCAnaW1hZ2UnLCBpbWFnZSk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ltYWdlcy92YXJpYXRpb25zYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckZvcm1QYXJhbXMgPSBuZXcgKChjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uZm9ybURhdGFDdG9yKSB8fCBGb3JtRGF0YSkoKTtcbiAgICAgICAgICAgIGlmIChpbWFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnaW1hZ2UnLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnbicsIG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ3NpemUnLCBzaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXNwb25zZUZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgncmVzcG9uc2VfZm9ybWF0JywgcmVzcG9uc2VGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVzZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ3VzZXInLCB1c2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdtdWx0aXBhcnQvZm9ybS1kYXRhJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGxvY2FsVmFyRm9ybVBhcmFtcy5nZXRIZWFkZXJzKCkpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGxvY2FsVmFyRm9ybVBhcmFtcztcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENsYXNzaWZpZXMgaWYgdGV4dCB2aW9sYXRlcyBPcGVuQUlcXCdzIENvbnRlbnQgUG9saWN5XG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlTW9kZXJhdGlvblJlcXVlc3R9IGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVNb2RlcmF0aW9uOiAoY3JlYXRlTW9kZXJhdGlvblJlcXVlc3QsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnY3JlYXRlTW9kZXJhdGlvblJlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZU1vZGVyYXRpb24nLCAnY3JlYXRlTW9kZXJhdGlvblJlcXVlc3QnLCBjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL21vZGVyYXRpb25zYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlTW9kZXJhdGlvblJlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgVGhlIHNlYXJjaCBlbmRwb2ludCBjb21wdXRlcyBzaW1pbGFyaXR5IHNjb3JlcyBiZXR3ZWVuIHByb3ZpZGVkIHF1ZXJ5IGFuZCBkb2N1bWVudHMuIERvY3VtZW50cyBjYW4gYmUgcGFzc2VkIGRpcmVjdGx5IHRvIHRoZSBBUEkgaWYgdGhlcmUgYXJlIG5vIG1vcmUgdGhhbiAyMDAgb2YgdGhlbS4gIFRvIGdvIGJleW9uZCB0aGUgMjAwIGRvY3VtZW50IGxpbWl0LCBkb2N1bWVudHMgY2FuIGJlIHByb2Nlc3NlZCBvZmZsaW5lIGFuZCB0aGVuIHVzZWQgZm9yIGVmZmljaWVudCByZXRyaWV2YWwgYXQgcXVlcnkgdGltZS4gV2hlbiBgZmlsZWAgaXMgc2V0LCB0aGUgc2VhcmNoIGVuZHBvaW50IHNlYXJjaGVzIG92ZXIgYWxsIHRoZSBkb2N1bWVudHMgaW4gdGhlIGdpdmVuIGZpbGUgYW5kIHJldHVybnMgdXAgdG8gdGhlIGBtYXhfcmVyYW5rYCBudW1iZXIgb2YgZG9jdW1lbnRzLiBUaGVzZSBkb2N1bWVudHMgd2lsbCBiZSByZXR1cm5lZCBhbG9uZyB3aXRoIHRoZWlyIHNlYXJjaCBzY29yZXMuICBUaGUgc2ltaWxhcml0eSBzY29yZSBpcyBhIHBvc2l0aXZlIHNjb3JlIHRoYXQgdXN1YWxseSByYW5nZXMgZnJvbSAwIHRvIDMwMCAoYnV0IGNhbiBzb21ldGltZXMgZ28gaGlnaGVyKSwgd2hlcmUgYSBzY29yZSBhYm92ZSAyMDAgdXN1YWxseSBtZWFucyB0aGUgZG9jdW1lbnQgaXMgc2VtYW50aWNhbGx5IHNpbWlsYXIgdG8gdGhlIHF1ZXJ5LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW5naW5lSWQgVGhlIElEIG9mIHRoZSBlbmdpbmUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3QuICBZb3UgY2FuIHNlbGVjdCBvbmUgb2YgJiN4NjA7YWRhJiN4NjA7LCAmI3g2MDtiYWJiYWdlJiN4NjA7LCAmI3g2MDtjdXJpZSYjeDYwOywgb3IgJiN4NjA7ZGF2aW5jaSYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVTZWFyY2hSZXF1ZXN0fSBjcmVhdGVTZWFyY2hSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVTZWFyY2g6IChlbmdpbmVJZCwgY3JlYXRlU2VhcmNoUmVxdWVzdCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdlbmdpbmVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlU2VhcmNoJywgJ2VuZ2luZUlkJywgZW5naW5lSWQpO1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnY3JlYXRlU2VhcmNoUmVxdWVzdCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlU2VhcmNoJywgJ2NyZWF0ZVNlYXJjaFJlcXVlc3QnLCBjcmVhdGVTZWFyY2hSZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZW5naW5lcy97ZW5naW5lX2lkfS9zZWFyY2hgXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wiZW5naW5lX2lkXCJ9fWAsIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoZW5naW5lSWQpKSk7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ1BPU1QnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gY29tbW9uXzEuc2VyaWFsaXplRGF0YUlmTmVlZGVkKGNyZWF0ZVNlYXJjaFJlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgVHJhbnNjcmliZXMgYXVkaW8gaW50byB0aGUgaW5wdXQgbGFuZ3VhZ2UuXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZSBUaGUgYXVkaW8gZmlsZSB0byB0cmFuc2NyaWJlLCBpbiBvbmUgb2YgdGhlc2UgZm9ybWF0czogbXAzLCBtcDQsIG1wZWcsIG1wZ2EsIG00YSwgd2F2LCBvciB3ZWJtLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZS4gT25seSAmI3g2MDt3aGlzcGVyLTEmI3g2MDsgaXMgY3VycmVudGx5IGF2YWlsYWJsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtwcm9tcHRdIEFuIG9wdGlvbmFsIHRleHQgdG8gZ3VpZGUgdGhlIG1vZGVsXFxcXFxcJiMzOTtzIHN0eWxlIG9yIGNvbnRpbnVlIGEgcHJldmlvdXMgYXVkaW8gc2VnbWVudC4gVGhlIFtwcm9tcHRdKC9kb2NzL2d1aWRlcy9zcGVlY2gtdG8tdGV4dC9wcm9tcHRpbmcpIHNob3VsZCBtYXRjaCB0aGUgYXVkaW8gbGFuZ3VhZ2UuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgb2YgdGhlIHRyYW5zY3JpcHQgb3V0cHV0LCBpbiBvbmUgb2YgdGhlc2Ugb3B0aW9uczoganNvbiwgdGV4dCwgc3J0LCB2ZXJib3NlX2pzb24sIG9yIHZ0dC5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IFt0ZW1wZXJhdHVyZV0gVGhlIHNhbXBsaW5nIHRlbXBlcmF0dXJlLCBiZXR3ZWVuIDAgYW5kIDEuIEhpZ2hlciB2YWx1ZXMgbGlrZSAwLjggd2lsbCBtYWtlIHRoZSBvdXRwdXQgbW9yZSByYW5kb20sIHdoaWxlIGxvd2VyIHZhbHVlcyBsaWtlIDAuMiB3aWxsIG1ha2UgaXQgbW9yZSBmb2N1c2VkIGFuZCBkZXRlcm1pbmlzdGljLiBJZiBzZXQgdG8gMCwgdGhlIG1vZGVsIHdpbGwgdXNlIFtsb2cgcHJvYmFiaWxpdHldKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xvZ19wcm9iYWJpbGl0eSkgdG8gYXV0b21hdGljYWxseSBpbmNyZWFzZSB0aGUgdGVtcGVyYXR1cmUgdW50aWwgY2VydGFpbiB0aHJlc2hvbGRzIGFyZSBoaXQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbGFuZ3VhZ2VdIFRoZSBsYW5ndWFnZSBvZiB0aGUgaW5wdXQgYXVkaW8uIFN1cHBseWluZyB0aGUgaW5wdXQgbGFuZ3VhZ2UgaW4gW0lTTy02MzktMV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl9JU09fNjM5LTFfY29kZXMpIGZvcm1hdCB3aWxsIGltcHJvdmUgYWNjdXJhY3kgYW5kIGxhdGVuY3kuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVUcmFuc2NyaXB0aW9uOiAoZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBsYW5ndWFnZSwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdmaWxlJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVUcmFuc2NyaXB0aW9uJywgJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ21vZGVsJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVUcmFuc2NyaXB0aW9uJywgJ21vZGVsJywgbW9kZWwpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9hdWRpby90cmFuc2NyaXB0aW9uc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ1BPU1QnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJGb3JtUGFyYW1zID0gbmV3ICgoY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmZvcm1EYXRhQ3RvcikgfHwgRm9ybURhdGEpKCk7XG4gICAgICAgICAgICBpZiAoZmlsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnZmlsZScsIGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1vZGVsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdtb2RlbCcsIG1vZGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcm9tcHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ3Byb21wdCcsIHByb21wdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzcG9uc2VGb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ3Jlc3BvbnNlX2Zvcm1hdCcsIHJlc3BvbnNlRm9ybWF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0ZW1wZXJhdHVyZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgndGVtcGVyYXR1cmUnLCB0ZW1wZXJhdHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGFuZ3VhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ2xhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ211bHRpcGFydC9mb3JtLWRhdGEnO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgbG9jYWxWYXJGb3JtUGFyYW1zLmdldEhlYWRlcnMoKSksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gbG9jYWxWYXJGb3JtUGFyYW1zO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgVHJhbnNsYXRlcyBhdWRpbyBpbnRvIGludG8gRW5nbGlzaC5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBhdWRpbyBmaWxlIHRvIHRyYW5zbGF0ZSwgaW4gb25lIG9mIHRoZXNlIGZvcm1hdHM6IG1wMywgbXA0LCBtcGVnLCBtcGdhLCBtNGEsIHdhdiwgb3Igd2VibS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIElEIG9mIHRoZSBtb2RlbCB0byB1c2UuIE9ubHkgJiN4NjA7d2hpc3Blci0xJiN4NjA7IGlzIGN1cnJlbnRseSBhdmFpbGFibGUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJvbXB0XSBBbiBvcHRpb25hbCB0ZXh0IHRvIGd1aWRlIHRoZSBtb2RlbFxcXFxcXCYjMzk7cyBzdHlsZSBvciBjb250aW51ZSBhIHByZXZpb3VzIGF1ZGlvIHNlZ21lbnQuIFRoZSBbcHJvbXB0XSgvZG9jcy9ndWlkZXMvc3BlZWNoLXRvLXRleHQvcHJvbXB0aW5nKSBzaG91bGQgYmUgaW4gRW5nbGlzaC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNjcmlwdCBvdXRwdXQsIGluIG9uZSBvZiB0aGVzZSBvcHRpb25zOiBqc29uLCB0ZXh0LCBzcnQsIHZlcmJvc2VfanNvbiwgb3IgdnR0LlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RlbXBlcmF0dXJlXSBUaGUgc2FtcGxpbmcgdGVtcGVyYXR1cmUsIGJldHdlZW4gMCBhbmQgMS4gSGlnaGVyIHZhbHVlcyBsaWtlIDAuOCB3aWxsIG1ha2UgdGhlIG91dHB1dCBtb3JlIHJhbmRvbSwgd2hpbGUgbG93ZXIgdmFsdWVzIGxpa2UgMC4yIHdpbGwgbWFrZSBpdCBtb3JlIGZvY3VzZWQgYW5kIGRldGVybWluaXN0aWMuIElmIHNldCB0byAwLCB0aGUgbW9kZWwgd2lsbCB1c2UgW2xvZyBwcm9iYWJpbGl0eV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9nX3Byb2JhYmlsaXR5KSB0byBhdXRvbWF0aWNhbGx5IGluY3JlYXNlIHRoZSB0ZW1wZXJhdHVyZSB1bnRpbCBjZXJ0YWluIHRocmVzaG9sZHMgYXJlIGhpdC5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVRyYW5zbGF0aW9uOiAoZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ZpbGUnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZVRyYW5zbGF0aW9uJywgJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ21vZGVsJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVUcmFuc2xhdGlvbicsICdtb2RlbCcsIG1vZGVsKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvYXVkaW8vdHJhbnNsYXRpb25zYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckZvcm1QYXJhbXMgPSBuZXcgKChjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uZm9ybURhdGFDdG9yKSB8fCBGb3JtRGF0YSkoKTtcbiAgICAgICAgICAgIGlmIChmaWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW9kZWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ21vZGVsJywgbW9kZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb21wdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgncHJvbXB0JywgcHJvbXB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXNwb25zZUZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgncmVzcG9uc2VfZm9ybWF0JywgcmVzcG9uc2VGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRlbXBlcmF0dXJlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCd0ZW1wZXJhdHVyZScsIHRlbXBlcmF0dXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdtdWx0aXBhcnQvZm9ybS1kYXRhJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGxvY2FsVmFyRm9ybVBhcmFtcy5nZXRIZWFkZXJzKCkpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGxvY2FsVmFyRm9ybVBhcmFtcztcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IERlbGV0ZSBhIGZpbGUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSWQgVGhlIElEIG9mIHRoZSBmaWxlIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVGaWxlOiAoZmlsZUlkLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ZpbGVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnZGVsZXRlRmlsZScsICdmaWxlSWQnLCBmaWxlSWQpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9maWxlcy97ZmlsZV9pZH1gXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wiZmlsZV9pZFwifX1gLCBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGZpbGVJZCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnREVMRVRFJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IERlbGV0ZSBhIGZpbmUtdHVuZWQgbW9kZWwuIFlvdSBtdXN0IGhhdmUgdGhlIE93bmVyIHJvbGUgaW4geW91ciBvcmdhbml6YXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBUaGUgbW9kZWwgdG8gZGVsZXRlXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVNb2RlbDogKG1vZGVsLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ21vZGVsJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdkZWxldGVNb2RlbCcsICdtb2RlbCcsIG1vZGVsKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvbW9kZWxzL3ttb2RlbH1gXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wibW9kZWxcIn19YCwgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhtb2RlbCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnREVMRVRFJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgZmlsZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgZG93bmxvYWRGaWxlOiAoZmlsZUlkLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ZpbGVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnZG93bmxvYWRGaWxlJywgJ2ZpbGVJZCcsIGZpbGVJZCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbGVzL3tmaWxlX2lkfS9jb250ZW50YFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKGB7JHtcImZpbGVfaWRcIn19YCwgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhmaWxlSWQpKSk7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ0dFVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBMaXN0cyB0aGUgY3VycmVudGx5IGF2YWlsYWJsZSAobm9uLWZpbmV0dW5lZCkgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RFbmdpbmVzOiAob3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2VuZ2luZXNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdHRVQnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgUmV0dXJucyBhIGxpc3Qgb2YgZmlsZXMgdGhhdCBiZWxvbmcgdG8gdGhlIHVzZXJcXCdzIG9yZ2FuaXphdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RGaWxlczogKG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9maWxlc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ0dFVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBHZXQgZmluZS1ncmFpbmVkIHN0YXR1cyB1cGRhdGVzIGZvciBhIGZpbmUtdHVuZSBqb2IuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYiB0byBnZXQgZXZlbnRzIGZvci5cbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBbc3RyZWFtXSBXaGV0aGVyIHRvIHN0cmVhbSBldmVudHMgZm9yIHRoZSBmaW5lLXR1bmUgam9iLiBJZiBzZXQgdG8gdHJ1ZSwgZXZlbnRzIHdpbGwgYmUgc2VudCBhcyBkYXRhLW9ubHkgW3NlcnZlci1zZW50IGV2ZW50c10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1NlcnZlci1zZW50X2V2ZW50cy9Vc2luZ19zZXJ2ZXItc2VudF9ldmVudHMjRXZlbnRfc3RyZWFtX2Zvcm1hdCkgYXMgdGhleSBiZWNvbWUgYXZhaWxhYmxlLiBUaGUgc3RyZWFtIHdpbGwgdGVybWluYXRlIHdpdGggYSAmI3g2MDtkYXRhOiBbRE9ORV0mI3g2MDsgbWVzc2FnZSB3aGVuIHRoZSBqb2IgaXMgZmluaXNoZWQgKHN1Y2NlZWRlZCwgY2FuY2VsbGVkLCBvciBmYWlsZWQpLiAgSWYgc2V0IHRvIGZhbHNlLCBvbmx5IGV2ZW50cyBnZW5lcmF0ZWQgc28gZmFyIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RmluZVR1bmVFdmVudHM6IChmaW5lVHVuZUlkLCBzdHJlYW0sIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnZmluZVR1bmVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnbGlzdEZpbmVUdW5lRXZlbnRzJywgJ2ZpbmVUdW5lSWQnLCBmaW5lVHVuZUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZmluZS10dW5lcy97ZmluZV90dW5lX2lkfS9ldmVudHNgXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wiZmluZV90dW5lX2lkXCJ9fWAsIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoZmluZVR1bmVJZCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGlmIChzdHJlYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXJbJ3N0cmVhbSddID0gc3RyZWFtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgTGlzdCB5b3VyIG9yZ2FuaXphdGlvblxcJ3MgZmluZS10dW5pbmcgam9ic1xuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEZpbmVUdW5lczogKG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9maW5lLXR1bmVzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IExpc3RzIHRoZSBjdXJyZW50bHkgYXZhaWxhYmxlIG1vZGVscywgYW5kIHByb3ZpZGVzIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IGVhY2ggb25lIHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBhdmFpbGFiaWxpdHkuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0TW9kZWxzOiAob3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL21vZGVsc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ0dFVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXRyaWV2ZXMgYSBtb2RlbCBpbnN0YW5jZSwgcHJvdmlkaW5nIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IGl0IHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBhdmFpbGFiaWxpdHkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmdpbmVJZCBUaGUgSUQgb2YgdGhlIGVuZ2luZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVFbmdpbmU6IChlbmdpbmVJZCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdlbmdpbmVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygncmV0cmlldmVFbmdpbmUnLCAnZW5naW5lSWQnLCBlbmdpbmVJZCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2VuZ2luZXMve2VuZ2luZV9pZH1gXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wiZW5naW5lX2lkXCJ9fWAsIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoZW5naW5lSWQpKSk7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ0dFVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIGluZm9ybWF0aW9uIGFib3V0IGEgc3BlY2lmaWMgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJZCBUaGUgSUQgb2YgdGhlIGZpbGUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHJpZXZlRmlsZTogKGZpbGVJZCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdmaWxlSWQnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ3JldHJpZXZlRmlsZScsICdmaWxlSWQnLCBmaWxlSWQpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9maWxlcy97ZmlsZV9pZH1gXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wiZmlsZV9pZFwifX1gLCBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGZpbGVJZCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEdldHMgaW5mbyBhYm91dCB0aGUgZmluZS10dW5lIGpvYi4gIFtMZWFybiBtb3JlIGFib3V0IEZpbmUtdHVuaW5nXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcpXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVGaW5lVHVuZTogKGZpbmVUdW5lSWQsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnZmluZVR1bmVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygncmV0cmlldmVGaW5lVHVuZScsICdmaW5lVHVuZUlkJywgZmluZVR1bmVJZCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbmUtdHVuZXMve2ZpbmVfdHVuZV9pZH1gXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wiZmluZV90dW5lX2lkXCJ9fWAsIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoZmluZVR1bmVJZCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHJpZXZlcyBhIG1vZGVsIGluc3RhbmNlLCBwcm92aWRpbmcgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1vZGVsIHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBwZXJtaXNzaW9uaW5nLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgVGhlIElEIG9mIHRoZSBtb2RlbCB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVNb2RlbDogKG1vZGVsLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ21vZGVsJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdyZXRyaWV2ZU1vZGVsJywgJ21vZGVsJywgbW9kZWwpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9tb2RlbHMve21vZGVsfWBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJtb2RlbFwifX1gLCBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKG1vZGVsKSkpO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdHRVQnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgIH07XG59O1xuLyoqXG4gKiBPcGVuQUlBcGkgLSBmdW5jdGlvbmFsIHByb2dyYW1taW5nIGludGVyZmFjZVxuICogQGV4cG9ydFxuICovXG5leHBvcnRzLk9wZW5BSUFwaUZwID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb24pIHtcbiAgICBjb25zdCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yID0gZXhwb3J0cy5PcGVuQUlBcGlBeGlvc1BhcmFtQ3JlYXRvcihjb25maWd1cmF0aW9uKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgSW1tZWRpYXRlbHkgY2FuY2VsIGEgZmluZS10dW5lIGpvYi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iIHRvIGNhbmNlbFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY2FuY2VsRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY2FuY2VsRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQW5zd2VycyB0aGUgc3BlY2lmaWVkIHF1ZXN0aW9uIHVzaW5nIHRoZSBwcm92aWRlZCBkb2N1bWVudHMgYW5kIGV4YW1wbGVzLiAgVGhlIGVuZHBvaW50IGZpcnN0IFtzZWFyY2hlc10oL2RvY3MvYXBpLXJlZmVyZW5jZS9zZWFyY2hlcykgb3ZlciBwcm92aWRlZCBkb2N1bWVudHMgb3IgZmlsZXMgdG8gZmluZCByZWxldmFudCBjb250ZXh0LiBUaGUgcmVsZXZhbnQgY29udGV4dCBpcyBjb21iaW5lZCB3aXRoIHRoZSBwcm92aWRlZCBleGFtcGxlcyBhbmQgcXVlc3Rpb24gdG8gY3JlYXRlIHRoZSBwcm9tcHQgZm9yIFtjb21wbGV0aW9uXSgvZG9jcy9hcGktcmVmZXJlbmNlL2NvbXBsZXRpb25zKS5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVBbnN3ZXJSZXF1ZXN0fSBjcmVhdGVBbnN3ZXJSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVBbnN3ZXIoY3JlYXRlQW5zd2VyUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlQW5zd2VyKGNyZWF0ZUFuc3dlclJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgY2hhdCBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0fSBjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUNoYXRDb21wbGV0aW9uKGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlQ2hhdENvbXBsZXRpb24oY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDbGFzc2lmaWVzIHRoZSBzcGVjaWZpZWQgYHF1ZXJ5YCB1c2luZyBwcm92aWRlZCBleGFtcGxlcy4gIFRoZSBlbmRwb2ludCBmaXJzdCBbc2VhcmNoZXNdKC9kb2NzL2FwaS1yZWZlcmVuY2Uvc2VhcmNoZXMpIG92ZXIgdGhlIGxhYmVsZWQgZXhhbXBsZXMgdG8gc2VsZWN0IHRoZSBvbmVzIG1vc3QgcmVsZXZhbnQgZm9yIHRoZSBwYXJ0aWN1bGFyIHF1ZXJ5LiBUaGVuLCB0aGUgcmVsZXZhbnQgZXhhbXBsZXMgYXJlIGNvbWJpbmVkIHdpdGggdGhlIHF1ZXJ5IHRvIGNvbnN0cnVjdCBhIHByb21wdCB0byBwcm9kdWNlIHRoZSBmaW5hbCBsYWJlbCB2aWEgdGhlIFtjb21wbGV0aW9uc10oL2RvY3MvYXBpLXJlZmVyZW5jZS9jb21wbGV0aW9ucykgZW5kcG9pbnQuICBMYWJlbGVkIGV4YW1wbGVzIGNhbiBiZSBwcm92aWRlZCB2aWEgYW4gdXBsb2FkZWQgYGZpbGVgLCBvciBleHBsaWNpdGx5IGxpc3RlZCBpbiB0aGUgcmVxdWVzdCB1c2luZyB0aGUgYGV4YW1wbGVzYCBwYXJhbWV0ZXIgZm9yIHF1aWNrIHRlc3RzIGFuZCBzbWFsbCBzY2FsZSB1c2UgY2FzZXMuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0fSBjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUNsYXNzaWZpY2F0aW9uKGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlQ2xhc3NpZmljYXRpb24oY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgY29tcGxldGlvbiBmb3IgdGhlIHByb3ZpZGVkIHByb21wdCBhbmQgcGFyYW1ldGVyc1xuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0fSBjcmVhdGVDb21wbGV0aW9uUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlQ29tcGxldGlvbihjcmVhdGVDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlQ29tcGxldGlvbihjcmVhdGVDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIG5ldyBlZGl0IGZvciB0aGUgcHJvdmlkZWQgaW5wdXQsIGluc3RydWN0aW9uLCBhbmQgcGFyYW1ldGVycy5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVFZGl0UmVxdWVzdH0gY3JlYXRlRWRpdFJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUVkaXQoY3JlYXRlRWRpdFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZUVkaXQoY3JlYXRlRWRpdFJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gZW1iZWRkaW5nIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGlucHV0IHRleHQuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlRW1iZWRkaW5nUmVxdWVzdH0gY3JlYXRlRW1iZWRkaW5nUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRW1iZWRkaW5nKGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZUVtYmVkZGluZyhjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBVcGxvYWQgYSBmaWxlIHRoYXQgY29udGFpbnMgZG9jdW1lbnQocykgdG8gYmUgdXNlZCBhY3Jvc3MgdmFyaW91cyBlbmRwb2ludHMvZmVhdHVyZXMuIEN1cnJlbnRseSwgdGhlIHNpemUgb2YgYWxsIHRoZSBmaWxlcyB1cGxvYWRlZCBieSBvbmUgb3JnYW5pemF0aW9uIGNhbiBiZSB1cCB0byAxIEdCLiBQbGVhc2UgY29udGFjdCB1cyBpZiB5b3UgbmVlZCB0byBpbmNyZWFzZSB0aGUgc3RvcmFnZSBsaW1pdC5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIE5hbWUgb2YgdGhlIFtKU09OIExpbmVzXShodHRwczovL2pzb25saW5lcy5yZWFkdGhlZG9jcy5pby9lbi9sYXRlc3QvKSBmaWxlIHRvIGJlIHVwbG9hZGVkLiAgSWYgdGhlICYjeDYwO3B1cnBvc2UmI3g2MDsgaXMgc2V0IHRvIFxcXFxcXCZxdW90O2ZpbmUtdHVuZVxcXFxcXCZxdW90OywgZWFjaCBsaW5lIGlzIGEgSlNPTiByZWNvcmQgd2l0aCBcXFxcXFwmcXVvdDtwcm9tcHRcXFxcXFwmcXVvdDsgYW5kIFxcXFxcXCZxdW90O2NvbXBsZXRpb25cXFxcXFwmcXVvdDsgZmllbGRzIHJlcHJlc2VudGluZyB5b3VyIFt0cmFpbmluZyBleGFtcGxlc10oL2RvY3MvZ3VpZGVzL2ZpbmUtdHVuaW5nL3ByZXBhcmUtdHJhaW5pbmctZGF0YSkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwdXJwb3NlIFRoZSBpbnRlbmRlZCBwdXJwb3NlIG9mIHRoZSB1cGxvYWRlZCBkb2N1bWVudHMuICBVc2UgXFxcXFxcJnF1b3Q7ZmluZS10dW5lXFxcXFxcJnF1b3Q7IGZvciBbRmluZS10dW5pbmddKC9kb2NzL2FwaS1yZWZlcmVuY2UvZmluZS10dW5lcykuIFRoaXMgYWxsb3dzIHVzIHRvIHZhbGlkYXRlIHRoZSBmb3JtYXQgb2YgdGhlIHVwbG9hZGVkIGZpbGUuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVGaWxlKGZpbGUsIHB1cnBvc2UsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZUZpbGUoZmlsZSwgcHVycG9zZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIGpvYiB0aGF0IGZpbmUtdHVuZXMgYSBzcGVjaWZpZWQgbW9kZWwgZnJvbSBhIGdpdmVuIGRhdGFzZXQuICBSZXNwb25zZSBpbmNsdWRlcyBkZXRhaWxzIG9mIHRoZSBlbnF1ZXVlZCBqb2IgaW5jbHVkaW5nIGpvYiBzdGF0dXMgYW5kIHRoZSBuYW1lIG9mIHRoZSBmaW5lLXR1bmVkIG1vZGVscyBvbmNlIGNvbXBsZXRlLiAgW0xlYXJuIG1vcmUgYWJvdXQgRmluZS10dW5pbmddKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZylcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVGaW5lVHVuZVJlcXVlc3R9IGNyZWF0ZUZpbmVUdW5lUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRmluZVR1bmUoY3JlYXRlRmluZVR1bmVSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVGaW5lVHVuZShjcmVhdGVGaW5lVHVuZVJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gaW1hZ2UgZ2l2ZW4gYSBwcm9tcHQuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlSW1hZ2VSZXF1ZXN0fSBjcmVhdGVJbWFnZVJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUltYWdlKGNyZWF0ZUltYWdlUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlSW1hZ2UoY3JlYXRlSW1hZ2VSZXF1ZXN0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGFuIGVkaXRlZCBvciBleHRlbmRlZCBpbWFnZSBnaXZlbiBhbiBvcmlnaW5hbCBpbWFnZSBhbmQgYSBwcm9tcHQuXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gaW1hZ2UgVGhlIGltYWdlIHRvIGVkaXQuIE11c3QgYmUgYSB2YWxpZCBQTkcgZmlsZSwgbGVzcyB0aGFuIDRNQiwgYW5kIHNxdWFyZS4gSWYgbWFzayBpcyBub3QgcHJvdmlkZWQsIGltYWdlIG11c3QgaGF2ZSB0cmFuc3BhcmVuY3ksIHdoaWNoIHdpbGwgYmUgdXNlZCBhcyB0aGUgbWFzay5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHByb21wdCBBIHRleHQgZGVzY3JpcHRpb24gb2YgdGhlIGRlc2lyZWQgaW1hZ2UocykuIFRoZSBtYXhpbXVtIGxlbmd0aCBpcyAxMDAwIGNoYXJhY3RlcnMuXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gW21hc2tdIEFuIGFkZGl0aW9uYWwgaW1hZ2Ugd2hvc2UgZnVsbHkgdHJhbnNwYXJlbnQgYXJlYXMgKGUuZy4gd2hlcmUgYWxwaGEgaXMgemVybykgaW5kaWNhdGUgd2hlcmUgJiN4NjA7aW1hZ2UmI3g2MDsgc2hvdWxkIGJlIGVkaXRlZC4gTXVzdCBiZSBhIHZhbGlkIFBORyBmaWxlLCBsZXNzIHRoYW4gNE1CLCBhbmQgaGF2ZSB0aGUgc2FtZSBkaW1lbnNpb25zIGFzICYjeDYwO2ltYWdlJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW25dIFRoZSBudW1iZXIgb2YgaW1hZ2VzIHRvIGdlbmVyYXRlLiBNdXN0IGJlIGJldHdlZW4gMSBhbmQgMTAuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2l6ZV0gVGhlIHNpemUgb2YgdGhlIGdlbmVyYXRlZCBpbWFnZXMuIE11c3QgYmUgb25lIG9mICYjeDYwOzI1NngyNTYmI3g2MDssICYjeDYwOzUxMng1MTImI3g2MDssIG9yICYjeDYwOzEwMjR4MTAyNCYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBpbiB3aGljaCB0aGUgZ2VuZXJhdGVkIGltYWdlcyBhcmUgcmV0dXJuZWQuIE11c3QgYmUgb25lIG9mICYjeDYwO3VybCYjeDYwOyBvciAmI3g2MDtiNjRfanNvbiYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFt1c2VyXSBBIHVuaXF1ZSBpZGVudGlmaWVyIHJlcHJlc2VudGluZyB5b3VyIGVuZC11c2VyLCB3aGljaCBjYW4gaGVscCBPcGVuQUkgdG8gbW9uaXRvciBhbmQgZGV0ZWN0IGFidXNlLiBbTGVhcm4gbW9yZV0oL2RvY3MvZ3VpZGVzL3NhZmV0eS1iZXN0LXByYWN0aWNlcy9lbmQtdXNlci1pZHMpLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlSW1hZ2VFZGl0KGltYWdlLCBwcm9tcHQsIG1hc2ssIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVJbWFnZUVkaXQoaW1hZ2UsIHByb21wdCwgbWFzaywgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSB2YXJpYXRpb24gb2YgYSBnaXZlbiBpbWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBpbWFnZSBUaGUgaW1hZ2UgdG8gdXNlIGFzIHRoZSBiYXNpcyBmb3IgdGhlIHZhcmlhdGlvbihzKS4gTXVzdCBiZSBhIHZhbGlkIFBORyBmaWxlLCBsZXNzIHRoYW4gNE1CLCBhbmQgc3F1YXJlLlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW25dIFRoZSBudW1iZXIgb2YgaW1hZ2VzIHRvIGdlbmVyYXRlLiBNdXN0IGJlIGJldHdlZW4gMSBhbmQgMTAuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2l6ZV0gVGhlIHNpemUgb2YgdGhlIGdlbmVyYXRlZCBpbWFnZXMuIE11c3QgYmUgb25lIG9mICYjeDYwOzI1NngyNTYmI3g2MDssICYjeDYwOzUxMng1MTImI3g2MDssIG9yICYjeDYwOzEwMjR4MTAyNCYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBpbiB3aGljaCB0aGUgZ2VuZXJhdGVkIGltYWdlcyBhcmUgcmV0dXJuZWQuIE11c3QgYmUgb25lIG9mICYjeDYwO3VybCYjeDYwOyBvciAmI3g2MDtiNjRfanNvbiYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFt1c2VyXSBBIHVuaXF1ZSBpZGVudGlmaWVyIHJlcHJlc2VudGluZyB5b3VyIGVuZC11c2VyLCB3aGljaCBjYW4gaGVscCBPcGVuQUkgdG8gbW9uaXRvciBhbmQgZGV0ZWN0IGFidXNlLiBbTGVhcm4gbW9yZV0oL2RvY3MvZ3VpZGVzL3NhZmV0eS1iZXN0LXByYWN0aWNlcy9lbmQtdXNlci1pZHMpLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlSW1hZ2VWYXJpYXRpb24oaW1hZ2UsIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVJbWFnZVZhcmlhdGlvbihpbWFnZSwgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENsYXNzaWZpZXMgaWYgdGV4dCB2aW9sYXRlcyBPcGVuQUlcXCdzIENvbnRlbnQgUG9saWN5XG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlTW9kZXJhdGlvblJlcXVlc3R9IGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVNb2RlcmF0aW9uKGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVNb2RlcmF0aW9uKGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUaGUgc2VhcmNoIGVuZHBvaW50IGNvbXB1dGVzIHNpbWlsYXJpdHkgc2NvcmVzIGJldHdlZW4gcHJvdmlkZWQgcXVlcnkgYW5kIGRvY3VtZW50cy4gRG9jdW1lbnRzIGNhbiBiZSBwYXNzZWQgZGlyZWN0bHkgdG8gdGhlIEFQSSBpZiB0aGVyZSBhcmUgbm8gbW9yZSB0aGFuIDIwMCBvZiB0aGVtLiAgVG8gZ28gYmV5b25kIHRoZSAyMDAgZG9jdW1lbnQgbGltaXQsIGRvY3VtZW50cyBjYW4gYmUgcHJvY2Vzc2VkIG9mZmxpbmUgYW5kIHRoZW4gdXNlZCBmb3IgZWZmaWNpZW50IHJldHJpZXZhbCBhdCBxdWVyeSB0aW1lLiBXaGVuIGBmaWxlYCBpcyBzZXQsIHRoZSBzZWFyY2ggZW5kcG9pbnQgc2VhcmNoZXMgb3ZlciBhbGwgdGhlIGRvY3VtZW50cyBpbiB0aGUgZ2l2ZW4gZmlsZSBhbmQgcmV0dXJucyB1cCB0byB0aGUgYG1heF9yZXJhbmtgIG51bWJlciBvZiBkb2N1bWVudHMuIFRoZXNlIGRvY3VtZW50cyB3aWxsIGJlIHJldHVybmVkIGFsb25nIHdpdGggdGhlaXIgc2VhcmNoIHNjb3Jlcy4gIFRoZSBzaW1pbGFyaXR5IHNjb3JlIGlzIGEgcG9zaXRpdmUgc2NvcmUgdGhhdCB1c3VhbGx5IHJhbmdlcyBmcm9tIDAgdG8gMzAwIChidXQgY2FuIHNvbWV0aW1lcyBnbyBoaWdoZXIpLCB3aGVyZSBhIHNjb3JlIGFib3ZlIDIwMCB1c3VhbGx5IG1lYW5zIHRoZSBkb2N1bWVudCBpcyBzZW1hbnRpY2FsbHkgc2ltaWxhciB0byB0aGUgcXVlcnkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmdpbmVJZCBUaGUgSUQgb2YgdGhlIGVuZ2luZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdC4gIFlvdSBjYW4gc2VsZWN0IG9uZSBvZiAmI3g2MDthZGEmI3g2MDssICYjeDYwO2JhYmJhZ2UmI3g2MDssICYjeDYwO2N1cmllJiN4NjA7LCBvciAmI3g2MDtkYXZpbmNpJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZVNlYXJjaFJlcXVlc3R9IGNyZWF0ZVNlYXJjaFJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVNlYXJjaChlbmdpbmVJZCwgY3JlYXRlU2VhcmNoUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlU2VhcmNoKGVuZ2luZUlkLCBjcmVhdGVTZWFyY2hSZXF1ZXN0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUcmFuc2NyaWJlcyBhdWRpbyBpbnRvIHRoZSBpbnB1dCBsYW5ndWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBhdWRpbyBmaWxlIHRvIHRyYW5zY3JpYmUsIGluIG9uZSBvZiB0aGVzZSBmb3JtYXRzOiBtcDMsIG1wNCwgbXBlZywgbXBnYSwgbTRhLCB3YXYsIG9yIHdlYm0uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBJRCBvZiB0aGUgbW9kZWwgdG8gdXNlLiBPbmx5ICYjeDYwO3doaXNwZXItMSYjeDYwOyBpcyBjdXJyZW50bHkgYXZhaWxhYmxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Byb21wdF0gQW4gb3B0aW9uYWwgdGV4dCB0byBndWlkZSB0aGUgbW9kZWxcXFxcXFwmIzM5O3Mgc3R5bGUgb3IgY29udGludWUgYSBwcmV2aW91cyBhdWRpbyBzZWdtZW50LiBUaGUgW3Byb21wdF0oL2RvY3MvZ3VpZGVzL3NwZWVjaC10by10ZXh0L3Byb21wdGluZykgc2hvdWxkIG1hdGNoIHRoZSBhdWRpbyBsYW5ndWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNjcmlwdCBvdXRwdXQsIGluIG9uZSBvZiB0aGVzZSBvcHRpb25zOiBqc29uLCB0ZXh0LCBzcnQsIHZlcmJvc2VfanNvbiwgb3IgdnR0LlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RlbXBlcmF0dXJlXSBUaGUgc2FtcGxpbmcgdGVtcGVyYXR1cmUsIGJldHdlZW4gMCBhbmQgMS4gSGlnaGVyIHZhbHVlcyBsaWtlIDAuOCB3aWxsIG1ha2UgdGhlIG91dHB1dCBtb3JlIHJhbmRvbSwgd2hpbGUgbG93ZXIgdmFsdWVzIGxpa2UgMC4yIHdpbGwgbWFrZSBpdCBtb3JlIGZvY3VzZWQgYW5kIGRldGVybWluaXN0aWMuIElmIHNldCB0byAwLCB0aGUgbW9kZWwgd2lsbCB1c2UgW2xvZyBwcm9iYWJpbGl0eV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9nX3Byb2JhYmlsaXR5KSB0byBhdXRvbWF0aWNhbGx5IGluY3JlYXNlIHRoZSB0ZW1wZXJhdHVyZSB1bnRpbCBjZXJ0YWluIHRocmVzaG9sZHMgYXJlIGhpdC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtsYW5ndWFnZV0gVGhlIGxhbmd1YWdlIG9mIHRoZSBpbnB1dCBhdWRpby4gU3VwcGx5aW5nIHRoZSBpbnB1dCBsYW5ndWFnZSBpbiBbSVNPLTYzOS0xXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX0lTT182MzktMV9jb2RlcykgZm9ybWF0IHdpbGwgaW1wcm92ZSBhY2N1cmFjeSBhbmQgbGF0ZW5jeS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVRyYW5zY3JpcHRpb24oZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBsYW5ndWFnZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlVHJhbnNjcmlwdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIGxhbmd1YWdlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUcmFuc2xhdGVzIGF1ZGlvIGludG8gaW50byBFbmdsaXNoLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGF1ZGlvIGZpbGUgdG8gdHJhbnNsYXRlLCBpbiBvbmUgb2YgdGhlc2UgZm9ybWF0czogbXAzLCBtcDQsIG1wZWcsIG1wZ2EsIG00YSwgd2F2LCBvciB3ZWJtLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZS4gT25seSAmI3g2MDt3aGlzcGVyLTEmI3g2MDsgaXMgY3VycmVudGx5IGF2YWlsYWJsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtwcm9tcHRdIEFuIG9wdGlvbmFsIHRleHQgdG8gZ3VpZGUgdGhlIG1vZGVsXFxcXFxcJiMzOTtzIHN0eWxlIG9yIGNvbnRpbnVlIGEgcHJldmlvdXMgYXVkaW8gc2VnbWVudC4gVGhlIFtwcm9tcHRdKC9kb2NzL2d1aWRlcy9zcGVlY2gtdG8tdGV4dC9wcm9tcHRpbmcpIHNob3VsZCBiZSBpbiBFbmdsaXNoLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IG9mIHRoZSB0cmFuc2NyaXB0IG91dHB1dCwgaW4gb25lIG9mIHRoZXNlIG9wdGlvbnM6IGpzb24sIHRleHQsIHNydCwgdmVyYm9zZV9qc29uLCBvciB2dHQuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGVtcGVyYXR1cmVdIFRoZSBzYW1wbGluZyB0ZW1wZXJhdHVyZSwgYmV0d2VlbiAwIGFuZCAxLiBIaWdoZXIgdmFsdWVzIGxpa2UgMC44IHdpbGwgbWFrZSB0aGUgb3V0cHV0IG1vcmUgcmFuZG9tLCB3aGlsZSBsb3dlciB2YWx1ZXMgbGlrZSAwLjIgd2lsbCBtYWtlIGl0IG1vcmUgZm9jdXNlZCBhbmQgZGV0ZXJtaW5pc3RpYy4gSWYgc2V0IHRvIDAsIHRoZSBtb2RlbCB3aWxsIHVzZSBbbG9nIHByb2JhYmlsaXR5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb2dfcHJvYmFiaWxpdHkpIHRvIGF1dG9tYXRpY2FsbHkgaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIHVudGlsIGNlcnRhaW4gdGhyZXNob2xkcyBhcmUgaGl0LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVHJhbnNsYXRpb24oZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVUcmFuc2xhdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IERlbGV0ZSBhIGZpbGUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSWQgVGhlIElEIG9mIHRoZSBmaWxlIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuZGVsZXRlRmlsZShmaWxlSWQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IERlbGV0ZSBhIGZpbmUtdHVuZWQgbW9kZWwuIFlvdSBtdXN0IGhhdmUgdGhlIE93bmVyIHJvbGUgaW4geW91ciBvcmdhbml6YXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBUaGUgbW9kZWwgdG8gZGVsZXRlXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVNb2RlbChtb2RlbCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuZGVsZXRlTW9kZWwobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgZmlsZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgZG93bmxvYWRGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuZG93bmxvYWRGaWxlKGZpbGVJZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgTGlzdHMgdGhlIGN1cnJlbnRseSBhdmFpbGFibGUgKG5vbi1maW5ldHVuZWQpIG1vZGVscywgYW5kIHByb3ZpZGVzIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IGVhY2ggb25lIHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBhdmFpbGFiaWxpdHkuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RW5naW5lcyhvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5saXN0RW5naW5lcyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIGEgbGlzdCBvZiBmaWxlcyB0aGF0IGJlbG9uZyB0byB0aGUgdXNlclxcJ3Mgb3JnYW5pemF0aW9uLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEZpbGVzKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmxpc3RGaWxlcyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBHZXQgZmluZS1ncmFpbmVkIHN0YXR1cyB1cGRhdGVzIGZvciBhIGZpbmUtdHVuZSBqb2IuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYiB0byBnZXQgZXZlbnRzIGZvci5cbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBbc3RyZWFtXSBXaGV0aGVyIHRvIHN0cmVhbSBldmVudHMgZm9yIHRoZSBmaW5lLXR1bmUgam9iLiBJZiBzZXQgdG8gdHJ1ZSwgZXZlbnRzIHdpbGwgYmUgc2VudCBhcyBkYXRhLW9ubHkgW3NlcnZlci1zZW50IGV2ZW50c10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1NlcnZlci1zZW50X2V2ZW50cy9Vc2luZ19zZXJ2ZXItc2VudF9ldmVudHMjRXZlbnRfc3RyZWFtX2Zvcm1hdCkgYXMgdGhleSBiZWNvbWUgYXZhaWxhYmxlLiBUaGUgc3RyZWFtIHdpbGwgdGVybWluYXRlIHdpdGggYSAmI3g2MDtkYXRhOiBbRE9ORV0mI3g2MDsgbWVzc2FnZSB3aGVuIHRoZSBqb2IgaXMgZmluaXNoZWQgKHN1Y2NlZWRlZCwgY2FuY2VsbGVkLCBvciBmYWlsZWQpLiAgSWYgc2V0IHRvIGZhbHNlLCBvbmx5IGV2ZW50cyBnZW5lcmF0ZWQgc28gZmFyIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RmluZVR1bmVFdmVudHMoZmluZVR1bmVJZCwgc3RyZWFtLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5saXN0RmluZVR1bmVFdmVudHMoZmluZVR1bmVJZCwgc3RyZWFtLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBMaXN0IHlvdXIgb3JnYW5pemF0aW9uXFwncyBmaW5lLXR1bmluZyBqb2JzXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RmluZVR1bmVzKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmxpc3RGaW5lVHVuZXMob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgTGlzdHMgdGhlIGN1cnJlbnRseSBhdmFpbGFibGUgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RNb2RlbHMob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IubGlzdE1vZGVscyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXRyaWV2ZXMgYSBtb2RlbCBpbnN0YW5jZSwgcHJvdmlkaW5nIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IGl0IHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBhdmFpbGFiaWxpdHkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmdpbmVJZCBUaGUgSUQgb2YgdGhlIGVuZ2luZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVFbmdpbmUoZW5naW5lSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLnJldHJpZXZlRW5naW5lKGVuZ2luZUlkLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIGluZm9ybWF0aW9uIGFib3V0IGEgc3BlY2lmaWMgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJZCBUaGUgSUQgb2YgdGhlIGZpbGUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHJpZXZlRmlsZShmaWxlSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLnJldHJpZXZlRmlsZShmaWxlSWQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEdldHMgaW5mbyBhYm91dCB0aGUgZmluZS10dW5lIGpvYi4gIFtMZWFybiBtb3JlIGFib3V0IEZpbmUtdHVuaW5nXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcpXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVGaW5lVHVuZShmaW5lVHVuZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5yZXRyaWV2ZUZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHJpZXZlcyBhIG1vZGVsIGluc3RhbmNlLCBwcm92aWRpbmcgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1vZGVsIHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBwZXJtaXNzaW9uaW5nLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgVGhlIElEIG9mIHRoZSBtb2RlbCB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVNb2RlbChtb2RlbCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IucmV0cmlldmVNb2RlbChtb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIH07XG59O1xuLyoqXG4gKiBPcGVuQUlBcGkgLSBmYWN0b3J5IGludGVyZmFjZVxuICogQGV4cG9ydFxuICovXG5leHBvcnRzLk9wZW5BSUFwaUZhY3RvcnkgPSBmdW5jdGlvbiAoY29uZmlndXJhdGlvbiwgYmFzZVBhdGgsIGF4aW9zKSB7XG4gICAgY29uc3QgbG9jYWxWYXJGcCA9IGV4cG9ydHMuT3BlbkFJQXBpRnAoY29uZmlndXJhdGlvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEltbWVkaWF0ZWx5IGNhbmNlbCBhIGZpbmUtdHVuZSBqb2IuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYiB0byBjYW5jZWxcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNhbmNlbEZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNhbmNlbEZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBBbnN3ZXJzIHRoZSBzcGVjaWZpZWQgcXVlc3Rpb24gdXNpbmcgdGhlIHByb3ZpZGVkIGRvY3VtZW50cyBhbmQgZXhhbXBsZXMuICBUaGUgZW5kcG9pbnQgZmlyc3QgW3NlYXJjaGVzXSgvZG9jcy9hcGktcmVmZXJlbmNlL3NlYXJjaGVzKSBvdmVyIHByb3ZpZGVkIGRvY3VtZW50cyBvciBmaWxlcyB0byBmaW5kIHJlbGV2YW50IGNvbnRleHQuIFRoZSByZWxldmFudCBjb250ZXh0IGlzIGNvbWJpbmVkIHdpdGggdGhlIHByb3ZpZGVkIGV4YW1wbGVzIGFuZCBxdWVzdGlvbiB0byBjcmVhdGUgdGhlIHByb21wdCBmb3IgW2NvbXBsZXRpb25dKC9kb2NzL2FwaS1yZWZlcmVuY2UvY29tcGxldGlvbnMpLlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUFuc3dlclJlcXVlc3R9IGNyZWF0ZUFuc3dlclJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUFuc3dlcihjcmVhdGVBbnN3ZXJSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVBbnN3ZXIoY3JlYXRlQW5zd2VyUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgY2hhdCBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0fSBjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUNoYXRDb21wbGV0aW9uKGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlQ2hhdENvbXBsZXRpb24oY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ2xhc3NpZmllcyB0aGUgc3BlY2lmaWVkIGBxdWVyeWAgdXNpbmcgcHJvdmlkZWQgZXhhbXBsZXMuICBUaGUgZW5kcG9pbnQgZmlyc3QgW3NlYXJjaGVzXSgvZG9jcy9hcGktcmVmZXJlbmNlL3NlYXJjaGVzKSBvdmVyIHRoZSBsYWJlbGVkIGV4YW1wbGVzIHRvIHNlbGVjdCB0aGUgb25lcyBtb3N0IHJlbGV2YW50IGZvciB0aGUgcGFydGljdWxhciBxdWVyeS4gVGhlbiwgdGhlIHJlbGV2YW50IGV4YW1wbGVzIGFyZSBjb21iaW5lZCB3aXRoIHRoZSBxdWVyeSB0byBjb25zdHJ1Y3QgYSBwcm9tcHQgdG8gcHJvZHVjZSB0aGUgZmluYWwgbGFiZWwgdmlhIHRoZSBbY29tcGxldGlvbnNdKC9kb2NzL2FwaS1yZWZlcmVuY2UvY29tcGxldGlvbnMpIGVuZHBvaW50LiAgTGFiZWxlZCBleGFtcGxlcyBjYW4gYmUgcHJvdmlkZWQgdmlhIGFuIHVwbG9hZGVkIGBmaWxlYCwgb3IgZXhwbGljaXRseSBsaXN0ZWQgaW4gdGhlIHJlcXVlc3QgdXNpbmcgdGhlIGBleGFtcGxlc2AgcGFyYW1ldGVyIGZvciBxdWljayB0ZXN0cyBhbmQgc21hbGwgc2NhbGUgdXNlIGNhc2VzLlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdH0gY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVDbGFzc2lmaWNhdGlvbihjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUNsYXNzaWZpY2F0aW9uKGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgcHJvdmlkZWQgcHJvbXB0IGFuZCBwYXJhbWV0ZXJzXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ29tcGxldGlvblJlcXVlc3R9IGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVDb21wbGV0aW9uKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVDb21wbGV0aW9uKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIG5ldyBlZGl0IGZvciB0aGUgcHJvdmlkZWQgaW5wdXQsIGluc3RydWN0aW9uLCBhbmQgcGFyYW1ldGVycy5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVFZGl0UmVxdWVzdH0gY3JlYXRlRWRpdFJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUVkaXQoY3JlYXRlRWRpdFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUVkaXQoY3JlYXRlRWRpdFJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGFuIGVtYmVkZGluZyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCB0ZXh0LlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUVtYmVkZGluZ1JlcXVlc3R9IGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUVtYmVkZGluZyhjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVFbWJlZGRpbmcoY3JlYXRlRW1iZWRkaW5nUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFVwbG9hZCBhIGZpbGUgdGhhdCBjb250YWlucyBkb2N1bWVudChzKSB0byBiZSB1c2VkIGFjcm9zcyB2YXJpb3VzIGVuZHBvaW50cy9mZWF0dXJlcy4gQ3VycmVudGx5LCB0aGUgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHVwbG9hZGVkIGJ5IG9uZSBvcmdhbml6YXRpb24gY2FuIGJlIHVwIHRvIDEgR0IuIFBsZWFzZSBjb250YWN0IHVzIGlmIHlvdSBuZWVkIHRvIGluY3JlYXNlIHRoZSBzdG9yYWdlIGxpbWl0LlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgTmFtZSBvZiB0aGUgW0pTT04gTGluZXNdKGh0dHBzOi8vanNvbmxpbmVzLnJlYWR0aGVkb2NzLmlvL2VuL2xhdGVzdC8pIGZpbGUgdG8gYmUgdXBsb2FkZWQuICBJZiB0aGUgJiN4NjA7cHVycG9zZSYjeDYwOyBpcyBzZXQgdG8gXFxcXFxcJnF1b3Q7ZmluZS10dW5lXFxcXFxcJnF1b3Q7LCBlYWNoIGxpbmUgaXMgYSBKU09OIHJlY29yZCB3aXRoIFxcXFxcXCZxdW90O3Byb21wdFxcXFxcXCZxdW90OyBhbmQgXFxcXFxcJnF1b3Q7Y29tcGxldGlvblxcXFxcXCZxdW90OyBmaWVsZHMgcmVwcmVzZW50aW5nIHlvdXIgW3RyYWluaW5nIGV4YW1wbGVzXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcvcHJlcGFyZS10cmFpbmluZy1kYXRhKS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHB1cnBvc2UgVGhlIGludGVuZGVkIHB1cnBvc2Ugb2YgdGhlIHVwbG9hZGVkIGRvY3VtZW50cy4gIFVzZSBcXFxcXFwmcXVvdDtmaW5lLXR1bmVcXFxcXFwmcXVvdDsgZm9yIFtGaW5lLXR1bmluZ10oL2RvY3MvYXBpLXJlZmVyZW5jZS9maW5lLXR1bmVzKS4gVGhpcyBhbGxvd3MgdXMgdG8gdmFsaWRhdGUgdGhlIGZvcm1hdCBvZiB0aGUgdXBsb2FkZWQgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUZpbGUoZmlsZSwgcHVycG9zZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlRmlsZShmaWxlLCBwdXJwb3NlLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIGpvYiB0aGF0IGZpbmUtdHVuZXMgYSBzcGVjaWZpZWQgbW9kZWwgZnJvbSBhIGdpdmVuIGRhdGFzZXQuICBSZXNwb25zZSBpbmNsdWRlcyBkZXRhaWxzIG9mIHRoZSBlbnF1ZXVlZCBqb2IgaW5jbHVkaW5nIGpvYiBzdGF0dXMgYW5kIHRoZSBuYW1lIG9mIHRoZSBmaW5lLXR1bmVkIG1vZGVscyBvbmNlIGNvbXBsZXRlLiAgW0xlYXJuIG1vcmUgYWJvdXQgRmluZS10dW5pbmddKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZylcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVGaW5lVHVuZVJlcXVlc3R9IGNyZWF0ZUZpbmVUdW5lUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRmluZVR1bmUoY3JlYXRlRmluZVR1bmVSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVGaW5lVHVuZShjcmVhdGVGaW5lVHVuZVJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGFuIGltYWdlIGdpdmVuIGEgcHJvbXB0LlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUltYWdlUmVxdWVzdH0gY3JlYXRlSW1hZ2VSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVJbWFnZShjcmVhdGVJbWFnZVJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUltYWdlKGNyZWF0ZUltYWdlUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gZWRpdGVkIG9yIGV4dGVuZGVkIGltYWdlIGdpdmVuIGFuIG9yaWdpbmFsIGltYWdlIGFuZCBhIHByb21wdC5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBpbWFnZSBUaGUgaW1hZ2UgdG8gZWRpdC4gTXVzdCBiZSBhIHZhbGlkIFBORyBmaWxlLCBsZXNzIHRoYW4gNE1CLCBhbmQgc3F1YXJlLiBJZiBtYXNrIGlzIG5vdCBwcm92aWRlZCwgaW1hZ2UgbXVzdCBoYXZlIHRyYW5zcGFyZW5jeSwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIHRoZSBtYXNrLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvbXB0IEEgdGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUgZGVzaXJlZCBpbWFnZShzKS4gVGhlIG1heGltdW0gbGVuZ3RoIGlzIDEwMDAgY2hhcmFjdGVycy5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBbbWFza10gQW4gYWRkaXRpb25hbCBpbWFnZSB3aG9zZSBmdWxseSB0cmFuc3BhcmVudCBhcmVhcyAoZS5nLiB3aGVyZSBhbHBoYSBpcyB6ZXJvKSBpbmRpY2F0ZSB3aGVyZSAmI3g2MDtpbWFnZSYjeDYwOyBzaG91bGQgYmUgZWRpdGVkLiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBoYXZlIHRoZSBzYW1lIGRpbWVuc2lvbnMgYXMgJiN4NjA7aW1hZ2UmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBpbWFnZXMgdG8gZ2VuZXJhdGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IGluIHdoaWNoIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzIGFyZSByZXR1cm5lZC4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7dXJsJiN4NjA7IG9yICYjeDYwO2I2NF9qc29uJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIEEgdW5pcXVlIGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHlvdXIgZW5kLXVzZXIsIHdoaWNoIGNhbiBoZWxwIE9wZW5BSSB0byBtb25pdG9yIGFuZCBkZXRlY3QgYWJ1c2UuIFtMZWFybiBtb3JlXSgvZG9jcy9ndWlkZXMvc2FmZXR5LWJlc3QtcHJhY3RpY2VzL2VuZC11c2VyLWlkcykuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVJbWFnZUVkaXQoaW1hZ2UsIHByb21wdCwgbWFzaywgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUltYWdlRWRpdChpbWFnZSwgcHJvbXB0LCBtYXNrLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSB2YXJpYXRpb24gb2YgYSBnaXZlbiBpbWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBpbWFnZSBUaGUgaW1hZ2UgdG8gdXNlIGFzIHRoZSBiYXNpcyBmb3IgdGhlIHZhcmlhdGlvbihzKS4gTXVzdCBiZSBhIHZhbGlkIFBORyBmaWxlLCBsZXNzIHRoYW4gNE1CLCBhbmQgc3F1YXJlLlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW25dIFRoZSBudW1iZXIgb2YgaW1hZ2VzIHRvIGdlbmVyYXRlLiBNdXN0IGJlIGJldHdlZW4gMSBhbmQgMTAuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2l6ZV0gVGhlIHNpemUgb2YgdGhlIGdlbmVyYXRlZCBpbWFnZXMuIE11c3QgYmUgb25lIG9mICYjeDYwOzI1NngyNTYmI3g2MDssICYjeDYwOzUxMng1MTImI3g2MDssIG9yICYjeDYwOzEwMjR4MTAyNCYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBpbiB3aGljaCB0aGUgZ2VuZXJhdGVkIGltYWdlcyBhcmUgcmV0dXJuZWQuIE11c3QgYmUgb25lIG9mICYjeDYwO3VybCYjeDYwOyBvciAmI3g2MDtiNjRfanNvbiYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFt1c2VyXSBBIHVuaXF1ZSBpZGVudGlmaWVyIHJlcHJlc2VudGluZyB5b3VyIGVuZC11c2VyLCB3aGljaCBjYW4gaGVscCBPcGVuQUkgdG8gbW9uaXRvciBhbmQgZGV0ZWN0IGFidXNlLiBbTGVhcm4gbW9yZV0oL2RvY3MvZ3VpZGVzL3NhZmV0eS1iZXN0LXByYWN0aWNlcy9lbmQtdXNlci1pZHMpLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlSW1hZ2VWYXJpYXRpb24oaW1hZ2UsIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVJbWFnZVZhcmlhdGlvbihpbWFnZSwgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDbGFzc2lmaWVzIGlmIHRleHQgdmlvbGF0ZXMgT3BlbkFJXFwncyBDb250ZW50IFBvbGljeVxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0fSBjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlTW9kZXJhdGlvbihjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlTW9kZXJhdGlvbihjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFRoZSBzZWFyY2ggZW5kcG9pbnQgY29tcHV0ZXMgc2ltaWxhcml0eSBzY29yZXMgYmV0d2VlbiBwcm92aWRlZCBxdWVyeSBhbmQgZG9jdW1lbnRzLiBEb2N1bWVudHMgY2FuIGJlIHBhc3NlZCBkaXJlY3RseSB0byB0aGUgQVBJIGlmIHRoZXJlIGFyZSBubyBtb3JlIHRoYW4gMjAwIG9mIHRoZW0uICBUbyBnbyBiZXlvbmQgdGhlIDIwMCBkb2N1bWVudCBsaW1pdCwgZG9jdW1lbnRzIGNhbiBiZSBwcm9jZXNzZWQgb2ZmbGluZSBhbmQgdGhlbiB1c2VkIGZvciBlZmZpY2llbnQgcmV0cmlldmFsIGF0IHF1ZXJ5IHRpbWUuIFdoZW4gYGZpbGVgIGlzIHNldCwgdGhlIHNlYXJjaCBlbmRwb2ludCBzZWFyY2hlcyBvdmVyIGFsbCB0aGUgZG9jdW1lbnRzIGluIHRoZSBnaXZlbiBmaWxlIGFuZCByZXR1cm5zIHVwIHRvIHRoZSBgbWF4X3JlcmFua2AgbnVtYmVyIG9mIGRvY3VtZW50cy4gVGhlc2UgZG9jdW1lbnRzIHdpbGwgYmUgcmV0dXJuZWQgYWxvbmcgd2l0aCB0aGVpciBzZWFyY2ggc2NvcmVzLiAgVGhlIHNpbWlsYXJpdHkgc2NvcmUgaXMgYSBwb3NpdGl2ZSBzY29yZSB0aGF0IHVzdWFsbHkgcmFuZ2VzIGZyb20gMCB0byAzMDAgKGJ1dCBjYW4gc29tZXRpbWVzIGdvIGhpZ2hlciksIHdoZXJlIGEgc2NvcmUgYWJvdmUgMjAwIHVzdWFsbHkgbWVhbnMgdGhlIGRvY3VtZW50IGlzIHNlbWFudGljYWxseSBzaW1pbGFyIHRvIHRoZSBxdWVyeS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGVuZ2luZUlkIFRoZSBJRCBvZiB0aGUgZW5naW5lIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0LiAgWW91IGNhbiBzZWxlY3Qgb25lIG9mICYjeDYwO2FkYSYjeDYwOywgJiN4NjA7YmFiYmFnZSYjeDYwOywgJiN4NjA7Y3VyaWUmI3g2MDssIG9yICYjeDYwO2RhdmluY2kmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlU2VhcmNoUmVxdWVzdH0gY3JlYXRlU2VhcmNoUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlU2VhcmNoKGVuZ2luZUlkLCBjcmVhdGVTZWFyY2hSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVTZWFyY2goZW5naW5lSWQsIGNyZWF0ZVNlYXJjaFJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUcmFuc2NyaWJlcyBhdWRpbyBpbnRvIHRoZSBpbnB1dCBsYW5ndWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBhdWRpbyBmaWxlIHRvIHRyYW5zY3JpYmUsIGluIG9uZSBvZiB0aGVzZSBmb3JtYXRzOiBtcDMsIG1wNCwgbXBlZywgbXBnYSwgbTRhLCB3YXYsIG9yIHdlYm0uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBJRCBvZiB0aGUgbW9kZWwgdG8gdXNlLiBPbmx5ICYjeDYwO3doaXNwZXItMSYjeDYwOyBpcyBjdXJyZW50bHkgYXZhaWxhYmxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Byb21wdF0gQW4gb3B0aW9uYWwgdGV4dCB0byBndWlkZSB0aGUgbW9kZWxcXFxcXFwmIzM5O3Mgc3R5bGUgb3IgY29udGludWUgYSBwcmV2aW91cyBhdWRpbyBzZWdtZW50LiBUaGUgW3Byb21wdF0oL2RvY3MvZ3VpZGVzL3NwZWVjaC10by10ZXh0L3Byb21wdGluZykgc2hvdWxkIG1hdGNoIHRoZSBhdWRpbyBsYW5ndWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNjcmlwdCBvdXRwdXQsIGluIG9uZSBvZiB0aGVzZSBvcHRpb25zOiBqc29uLCB0ZXh0LCBzcnQsIHZlcmJvc2VfanNvbiwgb3IgdnR0LlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RlbXBlcmF0dXJlXSBUaGUgc2FtcGxpbmcgdGVtcGVyYXR1cmUsIGJldHdlZW4gMCBhbmQgMS4gSGlnaGVyIHZhbHVlcyBsaWtlIDAuOCB3aWxsIG1ha2UgdGhlIG91dHB1dCBtb3JlIHJhbmRvbSwgd2hpbGUgbG93ZXIgdmFsdWVzIGxpa2UgMC4yIHdpbGwgbWFrZSBpdCBtb3JlIGZvY3VzZWQgYW5kIGRldGVybWluaXN0aWMuIElmIHNldCB0byAwLCB0aGUgbW9kZWwgd2lsbCB1c2UgW2xvZyBwcm9iYWJpbGl0eV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9nX3Byb2JhYmlsaXR5KSB0byBhdXRvbWF0aWNhbGx5IGluY3JlYXNlIHRoZSB0ZW1wZXJhdHVyZSB1bnRpbCBjZXJ0YWluIHRocmVzaG9sZHMgYXJlIGhpdC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtsYW5ndWFnZV0gVGhlIGxhbmd1YWdlIG9mIHRoZSBpbnB1dCBhdWRpby4gU3VwcGx5aW5nIHRoZSBpbnB1dCBsYW5ndWFnZSBpbiBbSVNPLTYzOS0xXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX0lTT182MzktMV9jb2RlcykgZm9ybWF0IHdpbGwgaW1wcm92ZSBhY2N1cmFjeSBhbmQgbGF0ZW5jeS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVRyYW5zY3JpcHRpb24oZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBsYW5ndWFnZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlVHJhbnNjcmlwdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIGxhbmd1YWdlLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgVHJhbnNsYXRlcyBhdWRpbyBpbnRvIGludG8gRW5nbGlzaC5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBhdWRpbyBmaWxlIHRvIHRyYW5zbGF0ZSwgaW4gb25lIG9mIHRoZXNlIGZvcm1hdHM6IG1wMywgbXA0LCBtcGVnLCBtcGdhLCBtNGEsIHdhdiwgb3Igd2VibS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIElEIG9mIHRoZSBtb2RlbCB0byB1c2UuIE9ubHkgJiN4NjA7d2hpc3Blci0xJiN4NjA7IGlzIGN1cnJlbnRseSBhdmFpbGFibGUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJvbXB0XSBBbiBvcHRpb25hbCB0ZXh0IHRvIGd1aWRlIHRoZSBtb2RlbFxcXFxcXCYjMzk7cyBzdHlsZSBvciBjb250aW51ZSBhIHByZXZpb3VzIGF1ZGlvIHNlZ21lbnQuIFRoZSBbcHJvbXB0XSgvZG9jcy9ndWlkZXMvc3BlZWNoLXRvLXRleHQvcHJvbXB0aW5nKSBzaG91bGQgYmUgaW4gRW5nbGlzaC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNjcmlwdCBvdXRwdXQsIGluIG9uZSBvZiB0aGVzZSBvcHRpb25zOiBqc29uLCB0ZXh0LCBzcnQsIHZlcmJvc2VfanNvbiwgb3IgdnR0LlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RlbXBlcmF0dXJlXSBUaGUgc2FtcGxpbmcgdGVtcGVyYXR1cmUsIGJldHdlZW4gMCBhbmQgMS4gSGlnaGVyIHZhbHVlcyBsaWtlIDAuOCB3aWxsIG1ha2UgdGhlIG91dHB1dCBtb3JlIHJhbmRvbSwgd2hpbGUgbG93ZXIgdmFsdWVzIGxpa2UgMC4yIHdpbGwgbWFrZSBpdCBtb3JlIGZvY3VzZWQgYW5kIGRldGVybWluaXN0aWMuIElmIHNldCB0byAwLCB0aGUgbW9kZWwgd2lsbCB1c2UgW2xvZyBwcm9iYWJpbGl0eV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9nX3Byb2JhYmlsaXR5KSB0byBhdXRvbWF0aWNhbGx5IGluY3JlYXNlIHRoZSB0ZW1wZXJhdHVyZSB1bnRpbCBjZXJ0YWluIHRocmVzaG9sZHMgYXJlIGhpdC5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVRyYW5zbGF0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlVHJhbnNsYXRpb24oZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJZCBUaGUgSUQgb2YgdGhlIGZpbGUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZUZpbGUoZmlsZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5kZWxldGVGaWxlKGZpbGVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IERlbGV0ZSBhIGZpbmUtdHVuZWQgbW9kZWwuIFlvdSBtdXN0IGhhdmUgdGhlIE93bmVyIHJvbGUgaW4geW91ciBvcmdhbml6YXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBUaGUgbW9kZWwgdG8gZGVsZXRlXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBkZWxldGVNb2RlbChtb2RlbCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuZGVsZXRlTW9kZWwobW9kZWwsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIHRoZSBjb250ZW50cyBvZiB0aGUgc3BlY2lmaWVkIGZpbGVcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJZCBUaGUgSUQgb2YgdGhlIGZpbGUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGRvd25sb2FkRmlsZShmaWxlSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmRvd25sb2FkRmlsZShmaWxlSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBMaXN0cyB0aGUgY3VycmVudGx5IGF2YWlsYWJsZSAobm9uLWZpbmV0dW5lZCkgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RFbmdpbmVzKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmxpc3RFbmdpbmVzKG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIGEgbGlzdCBvZiBmaWxlcyB0aGF0IGJlbG9uZyB0byB0aGUgdXNlclxcJ3Mgb3JnYW5pemF0aW9uLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEZpbGVzKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmxpc3RGaWxlcyhvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgR2V0IGZpbmUtZ3JhaW5lZCBzdGF0dXMgdXBkYXRlcyBmb3IgYSBmaW5lLXR1bmUgam9iLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZVR1bmVJZCBUaGUgSUQgb2YgdGhlIGZpbmUtdHVuZSBqb2IgdG8gZ2V0IGV2ZW50cyBmb3IuXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3N0cmVhbV0gV2hldGhlciB0byBzdHJlYW0gZXZlbnRzIGZvciB0aGUgZmluZS10dW5lIGpvYi4gSWYgc2V0IHRvIHRydWUsIGV2ZW50cyB3aWxsIGJlIHNlbnQgYXMgZGF0YS1vbmx5IFtzZXJ2ZXItc2VudCBldmVudHNdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TZXJ2ZXItc2VudF9ldmVudHMvVXNpbmdfc2VydmVyLXNlbnRfZXZlbnRzI0V2ZW50X3N0cmVhbV9mb3JtYXQpIGFzIHRoZXkgYmVjb21lIGF2YWlsYWJsZS4gVGhlIHN0cmVhbSB3aWxsIHRlcm1pbmF0ZSB3aXRoIGEgJiN4NjA7ZGF0YTogW0RPTkVdJiN4NjA7IG1lc3NhZ2Ugd2hlbiB0aGUgam9iIGlzIGZpbmlzaGVkIChzdWNjZWVkZWQsIGNhbmNlbGxlZCwgb3IgZmFpbGVkKS4gIElmIHNldCB0byBmYWxzZSwgb25seSBldmVudHMgZ2VuZXJhdGVkIHNvIGZhciB3aWxsIGJlIHJldHVybmVkLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEZpbmVUdW5lRXZlbnRzKGZpbmVUdW5lSWQsIHN0cmVhbSwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAubGlzdEZpbmVUdW5lRXZlbnRzKGZpbmVUdW5lSWQsIHN0cmVhbSwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IExpc3QgeW91ciBvcmdhbml6YXRpb25cXCdzIGZpbmUtdHVuaW5nIGpvYnNcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RGaW5lVHVuZXMob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAubGlzdEZpbmVUdW5lcyhvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgTGlzdHMgdGhlIGN1cnJlbnRseSBhdmFpbGFibGUgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RNb2RlbHMob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAubGlzdE1vZGVscyhvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgUmV0cmlldmVzIGEgbW9kZWwgaW5zdGFuY2UsIHByb3ZpZGluZyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBpdCBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW5naW5lSWQgVGhlIElEIG9mIHRoZSBlbmdpbmUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHJpZXZlRW5naW5lKGVuZ2luZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5yZXRyaWV2ZUVuZ2luZShlbmdpbmVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYSBzcGVjaWZpYyBmaWxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAucmV0cmlldmVGaWxlKGZpbGVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEdldHMgaW5mbyBhYm91dCB0aGUgZmluZS10dW5lIGpvYi4gIFtMZWFybiBtb3JlIGFib3V0IEZpbmUtdHVuaW5nXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcpXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVGaW5lVHVuZShmaW5lVHVuZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5yZXRyaWV2ZUZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXRyaWV2ZXMgYSBtb2RlbCBpbnN0YW5jZSwgcHJvdmlkaW5nIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IHRoZSBtb2RlbCBzdWNoIGFzIHRoZSBvd25lciBhbmQgcGVybWlzc2lvbmluZy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIFRoZSBJRCBvZiB0aGUgbW9kZWwgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHJpZXZlTW9kZWwobW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLnJldHJpZXZlTW9kZWwobW9kZWwsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgfTtcbn07XG4vKipcbiAqIE9wZW5BSUFwaSAtIG9iamVjdC1vcmllbnRlZCBpbnRlcmZhY2VcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBPcGVuQUlBcGlcbiAqIEBleHRlbmRzIHtCYXNlQVBJfVxuICovXG5jbGFzcyBPcGVuQUlBcGkgZXh0ZW5kcyBiYXNlXzEuQmFzZUFQSSB7XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBJbW1lZGlhdGVseSBjYW5jZWwgYSBmaW5lLXR1bmUgam9iLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYiB0byBjYW5jZWxcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNhbmNlbEZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jYW5jZWxGaW5lVHVuZShmaW5lVHVuZUlkLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBBbnN3ZXJzIHRoZSBzcGVjaWZpZWQgcXVlc3Rpb24gdXNpbmcgdGhlIHByb3ZpZGVkIGRvY3VtZW50cyBhbmQgZXhhbXBsZXMuICBUaGUgZW5kcG9pbnQgZmlyc3QgW3NlYXJjaGVzXSgvZG9jcy9hcGktcmVmZXJlbmNlL3NlYXJjaGVzKSBvdmVyIHByb3ZpZGVkIGRvY3VtZW50cyBvciBmaWxlcyB0byBmaW5kIHJlbGV2YW50IGNvbnRleHQuIFRoZSByZWxldmFudCBjb250ZXh0IGlzIGNvbWJpbmVkIHdpdGggdGhlIHByb3ZpZGVkIGV4YW1wbGVzIGFuZCBxdWVzdGlvbiB0byBjcmVhdGUgdGhlIHByb21wdCBmb3IgW2NvbXBsZXRpb25dKC9kb2NzL2FwaS1yZWZlcmVuY2UvY29tcGxldGlvbnMpLlxuICAgICAqIEBwYXJhbSB7Q3JlYXRlQW5zd2VyUmVxdWVzdH0gY3JlYXRlQW5zd2VyUmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVBbnN3ZXIoY3JlYXRlQW5zd2VyUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZUFuc3dlcihjcmVhdGVBbnN3ZXJSZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgY29tcGxldGlvbiBmb3IgdGhlIGNoYXQgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0fSBjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZUNoYXRDb21wbGV0aW9uKGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZUNoYXRDb21wbGV0aW9uKGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgQ2xhc3NpZmllcyB0aGUgc3BlY2lmaWVkIGBxdWVyeWAgdXNpbmcgcHJvdmlkZWQgZXhhbXBsZXMuICBUaGUgZW5kcG9pbnQgZmlyc3QgW3NlYXJjaGVzXSgvZG9jcy9hcGktcmVmZXJlbmNlL3NlYXJjaGVzKSBvdmVyIHRoZSBsYWJlbGVkIGV4YW1wbGVzIHRvIHNlbGVjdCB0aGUgb25lcyBtb3N0IHJlbGV2YW50IGZvciB0aGUgcGFydGljdWxhciBxdWVyeS4gVGhlbiwgdGhlIHJlbGV2YW50IGV4YW1wbGVzIGFyZSBjb21iaW5lZCB3aXRoIHRoZSBxdWVyeSB0byBjb25zdHJ1Y3QgYSBwcm9tcHQgdG8gcHJvZHVjZSB0aGUgZmluYWwgbGFiZWwgdmlhIHRoZSBbY29tcGxldGlvbnNdKC9kb2NzL2FwaS1yZWZlcmVuY2UvY29tcGxldGlvbnMpIGVuZHBvaW50LiAgTGFiZWxlZCBleGFtcGxlcyBjYW4gYmUgcHJvdmlkZWQgdmlhIGFuIHVwbG9hZGVkIGBmaWxlYCwgb3IgZXhwbGljaXRseSBsaXN0ZWQgaW4gdGhlIHJlcXVlc3QgdXNpbmcgdGhlIGBleGFtcGxlc2AgcGFyYW1ldGVyIGZvciBxdWljayB0ZXN0cyBhbmQgc21hbGwgc2NhbGUgdXNlIGNhc2VzLlxuICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0fSBjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlQ2xhc3NpZmljYXRpb24oY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlQ2xhc3NpZmljYXRpb24oY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgY29tcGxldGlvbiBmb3IgdGhlIHByb3ZpZGVkIHByb21wdCBhbmQgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSB7Q3JlYXRlQ29tcGxldGlvblJlcXVlc3R9IGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVDb21wbGV0aW9uKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlQ29tcGxldGlvbihjcmVhdGVDb21wbGV0aW9uUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIG5ldyBlZGl0IGZvciB0aGUgcHJvdmlkZWQgaW5wdXQsIGluc3RydWN0aW9uLCBhbmQgcGFyYW1ldGVycy5cbiAgICAgKiBAcGFyYW0ge0NyZWF0ZUVkaXRSZXF1ZXN0fSBjcmVhdGVFZGl0UmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlRWRpdChjcmVhdGVFZGl0UmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZUVkaXQoY3JlYXRlRWRpdFJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gZW1iZWRkaW5nIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGlucHV0IHRleHQuXG4gICAgICogQHBhcmFtIHtDcmVhdGVFbWJlZGRpbmdSZXF1ZXN0fSBjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVFbWJlZGRpbmcoY3JlYXRlRW1iZWRkaW5nUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZUVtYmVkZGluZyhjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBVcGxvYWQgYSBmaWxlIHRoYXQgY29udGFpbnMgZG9jdW1lbnQocykgdG8gYmUgdXNlZCBhY3Jvc3MgdmFyaW91cyBlbmRwb2ludHMvZmVhdHVyZXMuIEN1cnJlbnRseSwgdGhlIHNpemUgb2YgYWxsIHRoZSBmaWxlcyB1cGxvYWRlZCBieSBvbmUgb3JnYW5pemF0aW9uIGNhbiBiZSB1cCB0byAxIEdCLiBQbGVhc2UgY29udGFjdCB1cyBpZiB5b3UgbmVlZCB0byBpbmNyZWFzZSB0aGUgc3RvcmFnZSBsaW1pdC5cbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgTmFtZSBvZiB0aGUgW0pTT04gTGluZXNdKGh0dHBzOi8vanNvbmxpbmVzLnJlYWR0aGVkb2NzLmlvL2VuL2xhdGVzdC8pIGZpbGUgdG8gYmUgdXBsb2FkZWQuICBJZiB0aGUgJiN4NjA7cHVycG9zZSYjeDYwOyBpcyBzZXQgdG8gXFxcXFxcJnF1b3Q7ZmluZS10dW5lXFxcXFxcJnF1b3Q7LCBlYWNoIGxpbmUgaXMgYSBKU09OIHJlY29yZCB3aXRoIFxcXFxcXCZxdW90O3Byb21wdFxcXFxcXCZxdW90OyBhbmQgXFxcXFxcJnF1b3Q7Y29tcGxldGlvblxcXFxcXCZxdW90OyBmaWVsZHMgcmVwcmVzZW50aW5nIHlvdXIgW3RyYWluaW5nIGV4YW1wbGVzXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcvcHJlcGFyZS10cmFpbmluZy1kYXRhKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHVycG9zZSBUaGUgaW50ZW5kZWQgcHVycG9zZSBvZiB0aGUgdXBsb2FkZWQgZG9jdW1lbnRzLiAgVXNlIFxcXFxcXCZxdW90O2ZpbmUtdHVuZVxcXFxcXCZxdW90OyBmb3IgW0ZpbmUtdHVuaW5nXSgvZG9jcy9hcGktcmVmZXJlbmNlL2ZpbmUtdHVuZXMpLiBUaGlzIGFsbG93cyB1cyB0byB2YWxpZGF0ZSB0aGUgZm9ybWF0IG9mIHRoZSB1cGxvYWRlZCBmaWxlLlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlRmlsZShmaWxlLCBwdXJwb3NlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlRmlsZShmaWxlLCBwdXJwb3NlLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgam9iIHRoYXQgZmluZS10dW5lcyBhIHNwZWNpZmllZCBtb2RlbCBmcm9tIGEgZ2l2ZW4gZGF0YXNldC4gIFJlc3BvbnNlIGluY2x1ZGVzIGRldGFpbHMgb2YgdGhlIGVucXVldWVkIGpvYiBpbmNsdWRpbmcgam9iIHN0YXR1cyBhbmQgdGhlIG5hbWUgb2YgdGhlIGZpbmUtdHVuZWQgbW9kZWxzIG9uY2UgY29tcGxldGUuICBbTGVhcm4gbW9yZSBhYm91dCBGaW5lLXR1bmluZ10oL2RvY3MvZ3VpZGVzL2ZpbmUtdHVuaW5nKVxuICAgICAqIEBwYXJhbSB7Q3JlYXRlRmluZVR1bmVSZXF1ZXN0fSBjcmVhdGVGaW5lVHVuZVJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZUZpbmVUdW5lKGNyZWF0ZUZpbmVUdW5lUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZUZpbmVUdW5lKGNyZWF0ZUZpbmVUdW5lUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBpbWFnZSBnaXZlbiBhIHByb21wdC5cbiAgICAgKiBAcGFyYW0ge0NyZWF0ZUltYWdlUmVxdWVzdH0gY3JlYXRlSW1hZ2VSZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVJbWFnZShjcmVhdGVJbWFnZVJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVJbWFnZShjcmVhdGVJbWFnZVJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gZWRpdGVkIG9yIGV4dGVuZGVkIGltYWdlIGdpdmVuIGFuIG9yaWdpbmFsIGltYWdlIGFuZCBhIHByb21wdC5cbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGltYWdlIFRoZSBpbWFnZSB0byBlZGl0LiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBzcXVhcmUuIElmIG1hc2sgaXMgbm90IHByb3ZpZGVkLCBpbWFnZSBtdXN0IGhhdmUgdHJhbnNwYXJlbmN5LCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgdGhlIG1hc2suXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb21wdCBBIHRleHQgZGVzY3JpcHRpb24gb2YgdGhlIGRlc2lyZWQgaW1hZ2UocykuIFRoZSBtYXhpbXVtIGxlbmd0aCBpcyAxMDAwIGNoYXJhY3RlcnMuXG4gICAgICogQHBhcmFtIHtGaWxlfSBbbWFza10gQW4gYWRkaXRpb25hbCBpbWFnZSB3aG9zZSBmdWxseSB0cmFuc3BhcmVudCBhcmVhcyAoZS5nLiB3aGVyZSBhbHBoYSBpcyB6ZXJvKSBpbmRpY2F0ZSB3aGVyZSAmI3g2MDtpbWFnZSYjeDYwOyBzaG91bGQgYmUgZWRpdGVkLiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBoYXZlIHRoZSBzYW1lIGRpbWVuc2lvbnMgYXMgJiN4NjA7aW1hZ2UmI3g2MDsuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtuXSBUaGUgbnVtYmVyIG9mIGltYWdlcyB0byBnZW5lcmF0ZS4gTXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDEwLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2l6ZV0gVGhlIHNpemUgb2YgdGhlIGdlbmVyYXRlZCBpbWFnZXMuIE11c3QgYmUgb25lIG9mICYjeDYwOzI1NngyNTYmI3g2MDssICYjeDYwOzUxMng1MTImI3g2MDssIG9yICYjeDYwOzEwMjR4MTAyNCYjeDYwOy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IGluIHdoaWNoIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzIGFyZSByZXR1cm5lZC4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7dXJsJiN4NjA7IG9yICYjeDYwO2I2NF9qc29uJiN4NjA7LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbdXNlcl0gQSB1bmlxdWUgaWRlbnRpZmllciByZXByZXNlbnRpbmcgeW91ciBlbmQtdXNlciwgd2hpY2ggY2FuIGhlbHAgT3BlbkFJIHRvIG1vbml0b3IgYW5kIGRldGVjdCBhYnVzZS4gW0xlYXJuIG1vcmVdKC9kb2NzL2d1aWRlcy9zYWZldHktYmVzdC1wcmFjdGljZXMvZW5kLXVzZXItaWRzKS5cbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlRWRpdChpbWFnZSwgcHJvbXB0LCBtYXNrLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZUltYWdlRWRpdChpbWFnZSwgcHJvbXB0LCBtYXNrLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIHZhcmlhdGlvbiBvZiBhIGdpdmVuIGltYWdlLlxuICAgICAqIEBwYXJhbSB7RmlsZX0gaW1hZ2UgVGhlIGltYWdlIHRvIHVzZSBhcyB0aGUgYmFzaXMgZm9yIHRoZSB2YXJpYXRpb24ocykuIE11c3QgYmUgYSB2YWxpZCBQTkcgZmlsZSwgbGVzcyB0aGFuIDRNQiwgYW5kIHNxdWFyZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW25dIFRoZSBudW1iZXIgb2YgaW1hZ2VzIHRvIGdlbmVyYXRlLiBNdXN0IGJlIGJldHdlZW4gMSBhbmQgMTAuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgaW4gd2hpY2ggdGhlIGdlbmVyYXRlZCBpbWFnZXMgYXJlIHJldHVybmVkLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDt1cmwmI3g2MDsgb3IgJiN4NjA7YjY0X2pzb24mI3g2MDsuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFt1c2VyXSBBIHVuaXF1ZSBpZGVudGlmaWVyIHJlcHJlc2VudGluZyB5b3VyIGVuZC11c2VyLCB3aGljaCBjYW4gaGVscCBPcGVuQUkgdG8gbW9uaXRvciBhbmQgZGV0ZWN0IGFidXNlLiBbTGVhcm4gbW9yZV0oL2RvY3MvZ3VpZGVzL3NhZmV0eS1iZXN0LXByYWN0aWNlcy9lbmQtdXNlci1pZHMpLlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlSW1hZ2VWYXJpYXRpb24oaW1hZ2UsIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlSW1hZ2VWYXJpYXRpb24oaW1hZ2UsIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDbGFzc2lmaWVzIGlmIHRleHQgdmlvbGF0ZXMgT3BlbkFJXFwncyBDb250ZW50IFBvbGljeVxuICAgICAqIEBwYXJhbSB7Q3JlYXRlTW9kZXJhdGlvblJlcXVlc3R9IGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVNb2RlcmF0aW9uKGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlTW9kZXJhdGlvbihjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgVGhlIHNlYXJjaCBlbmRwb2ludCBjb21wdXRlcyBzaW1pbGFyaXR5IHNjb3JlcyBiZXR3ZWVuIHByb3ZpZGVkIHF1ZXJ5IGFuZCBkb2N1bWVudHMuIERvY3VtZW50cyBjYW4gYmUgcGFzc2VkIGRpcmVjdGx5IHRvIHRoZSBBUEkgaWYgdGhlcmUgYXJlIG5vIG1vcmUgdGhhbiAyMDAgb2YgdGhlbS4gIFRvIGdvIGJleW9uZCB0aGUgMjAwIGRvY3VtZW50IGxpbWl0LCBkb2N1bWVudHMgY2FuIGJlIHByb2Nlc3NlZCBvZmZsaW5lIGFuZCB0aGVuIHVzZWQgZm9yIGVmZmljaWVudCByZXRyaWV2YWwgYXQgcXVlcnkgdGltZS4gV2hlbiBgZmlsZWAgaXMgc2V0LCB0aGUgc2VhcmNoIGVuZHBvaW50IHNlYXJjaGVzIG92ZXIgYWxsIHRoZSBkb2N1bWVudHMgaW4gdGhlIGdpdmVuIGZpbGUgYW5kIHJldHVybnMgdXAgdG8gdGhlIGBtYXhfcmVyYW5rYCBudW1iZXIgb2YgZG9jdW1lbnRzLiBUaGVzZSBkb2N1bWVudHMgd2lsbCBiZSByZXR1cm5lZCBhbG9uZyB3aXRoIHRoZWlyIHNlYXJjaCBzY29yZXMuICBUaGUgc2ltaWxhcml0eSBzY29yZSBpcyBhIHBvc2l0aXZlIHNjb3JlIHRoYXQgdXN1YWxseSByYW5nZXMgZnJvbSAwIHRvIDMwMCAoYnV0IGNhbiBzb21ldGltZXMgZ28gaGlnaGVyKSwgd2hlcmUgYSBzY29yZSBhYm92ZSAyMDAgdXN1YWxseSBtZWFucyB0aGUgZG9jdW1lbnQgaXMgc2VtYW50aWNhbGx5IHNpbWlsYXIgdG8gdGhlIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmdpbmVJZCBUaGUgSUQgb2YgdGhlIGVuZ2luZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdC4gIFlvdSBjYW4gc2VsZWN0IG9uZSBvZiAmI3g2MDthZGEmI3g2MDssICYjeDYwO2JhYmJhZ2UmI3g2MDssICYjeDYwO2N1cmllJiN4NjA7LCBvciAmI3g2MDtkYXZpbmNpJiN4NjA7LlxuICAgICAqIEBwYXJhbSB7Q3JlYXRlU2VhcmNoUmVxdWVzdH0gY3JlYXRlU2VhcmNoUmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVTZWFyY2goZW5naW5lSWQsIGNyZWF0ZVNlYXJjaFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVTZWFyY2goZW5naW5lSWQsIGNyZWF0ZVNlYXJjaFJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IFRyYW5zY3JpYmVzIGF1ZGlvIGludG8gdGhlIGlucHV0IGxhbmd1YWdlLlxuICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZSBUaGUgYXVkaW8gZmlsZSB0byB0cmFuc2NyaWJlLCBpbiBvbmUgb2YgdGhlc2UgZm9ybWF0czogbXAzLCBtcDQsIG1wZWcsIG1wZ2EsIG00YSwgd2F2LCBvciB3ZWJtLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBJRCBvZiB0aGUgbW9kZWwgdG8gdXNlLiBPbmx5ICYjeDYwO3doaXNwZXItMSYjeDYwOyBpcyBjdXJyZW50bHkgYXZhaWxhYmxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJvbXB0XSBBbiBvcHRpb25hbCB0ZXh0IHRvIGd1aWRlIHRoZSBtb2RlbFxcXFxcXCYjMzk7cyBzdHlsZSBvciBjb250aW51ZSBhIHByZXZpb3VzIGF1ZGlvIHNlZ21lbnQuIFRoZSBbcHJvbXB0XSgvZG9jcy9ndWlkZXMvc3BlZWNoLXRvLXRleHQvcHJvbXB0aW5nKSBzaG91bGQgbWF0Y2ggdGhlIGF1ZGlvIGxhbmd1YWdlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgb2YgdGhlIHRyYW5zY3JpcHQgb3V0cHV0LCBpbiBvbmUgb2YgdGhlc2Ugb3B0aW9uczoganNvbiwgdGV4dCwgc3J0LCB2ZXJib3NlX2pzb24sIG9yIHZ0dC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RlbXBlcmF0dXJlXSBUaGUgc2FtcGxpbmcgdGVtcGVyYXR1cmUsIGJldHdlZW4gMCBhbmQgMS4gSGlnaGVyIHZhbHVlcyBsaWtlIDAuOCB3aWxsIG1ha2UgdGhlIG91dHB1dCBtb3JlIHJhbmRvbSwgd2hpbGUgbG93ZXIgdmFsdWVzIGxpa2UgMC4yIHdpbGwgbWFrZSBpdCBtb3JlIGZvY3VzZWQgYW5kIGRldGVybWluaXN0aWMuIElmIHNldCB0byAwLCB0aGUgbW9kZWwgd2lsbCB1c2UgW2xvZyBwcm9iYWJpbGl0eV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9nX3Byb2JhYmlsaXR5KSB0byBhdXRvbWF0aWNhbGx5IGluY3JlYXNlIHRoZSB0ZW1wZXJhdHVyZSB1bnRpbCBjZXJ0YWluIHRocmVzaG9sZHMgYXJlIGhpdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2xhbmd1YWdlXSBUaGUgbGFuZ3VhZ2Ugb2YgdGhlIGlucHV0IGF1ZGlvLiBTdXBwbHlpbmcgdGhlIGlucHV0IGxhbmd1YWdlIGluIFtJU08tNjM5LTFdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfSVNPXzYzOS0xX2NvZGVzKSBmb3JtYXQgd2lsbCBpbXByb3ZlIGFjY3VyYWN5IGFuZCBsYXRlbmN5LlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlVHJhbnNjcmlwdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIGxhbmd1YWdlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlVHJhbnNjcmlwdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIGxhbmd1YWdlLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBUcmFuc2xhdGVzIGF1ZGlvIGludG8gaW50byBFbmdsaXNoLlxuICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZSBUaGUgYXVkaW8gZmlsZSB0byB0cmFuc2xhdGUsIGluIG9uZSBvZiB0aGVzZSBmb3JtYXRzOiBtcDMsIG1wNCwgbXBlZywgbXBnYSwgbTRhLCB3YXYsIG9yIHdlYm0uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIElEIG9mIHRoZSBtb2RlbCB0byB1c2UuIE9ubHkgJiN4NjA7d2hpc3Blci0xJiN4NjA7IGlzIGN1cnJlbnRseSBhdmFpbGFibGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtwcm9tcHRdIEFuIG9wdGlvbmFsIHRleHQgdG8gZ3VpZGUgdGhlIG1vZGVsXFxcXFxcJiMzOTtzIHN0eWxlIG9yIGNvbnRpbnVlIGEgcHJldmlvdXMgYXVkaW8gc2VnbWVudC4gVGhlIFtwcm9tcHRdKC9kb2NzL2d1aWRlcy9zcGVlY2gtdG8tdGV4dC9wcm9tcHRpbmcpIHNob3VsZCBiZSBpbiBFbmdsaXNoLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgb2YgdGhlIHRyYW5zY3JpcHQgb3V0cHV0LCBpbiBvbmUgb2YgdGhlc2Ugb3B0aW9uczoganNvbiwgdGV4dCwgc3J0LCB2ZXJib3NlX2pzb24sIG9yIHZ0dC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RlbXBlcmF0dXJlXSBUaGUgc2FtcGxpbmcgdGVtcGVyYXR1cmUsIGJldHdlZW4gMCBhbmQgMS4gSGlnaGVyIHZhbHVlcyBsaWtlIDAuOCB3aWxsIG1ha2UgdGhlIG91dHB1dCBtb3JlIHJhbmRvbSwgd2hpbGUgbG93ZXIgdmFsdWVzIGxpa2UgMC4yIHdpbGwgbWFrZSBpdCBtb3JlIGZvY3VzZWQgYW5kIGRldGVybWluaXN0aWMuIElmIHNldCB0byAwLCB0aGUgbW9kZWwgd2lsbCB1c2UgW2xvZyBwcm9iYWJpbGl0eV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9nX3Byb2JhYmlsaXR5KSB0byBhdXRvbWF0aWNhbGx5IGluY3JlYXNlIHRoZSB0ZW1wZXJhdHVyZSB1bnRpbCBjZXJ0YWluIHRocmVzaG9sZHMgYXJlIGhpdC5cbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZVRyYW5zbGF0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZVRyYW5zbGF0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmlsZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgZGVsZXRlRmlsZShmaWxlSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5kZWxldGVGaWxlKGZpbGVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmluZS10dW5lZCBtb2RlbC4gWW91IG11c3QgaGF2ZSB0aGUgT3duZXIgcm9sZSBpbiB5b3VyIG9yZ2FuaXphdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgVGhlIG1vZGVsIHRvIGRlbGV0ZVxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgZGVsZXRlTW9kZWwobW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5kZWxldGVNb2RlbChtb2RlbCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgUmV0dXJucyB0aGUgY29udGVudHMgb2YgdGhlIHNwZWNpZmllZCBmaWxlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJZCBUaGUgSUQgb2YgdGhlIGZpbGUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGRvd25sb2FkRmlsZShmaWxlSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5kb3dubG9hZEZpbGUoZmlsZUlkLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBMaXN0cyB0aGUgY3VycmVudGx5IGF2YWlsYWJsZSAobm9uLWZpbmV0dW5lZCkgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgbGlzdEVuZ2luZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmxpc3RFbmdpbmVzKG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IFJldHVybnMgYSBsaXN0IG9mIGZpbGVzIHRoYXQgYmVsb25nIHRvIHRoZSB1c2VyXFwncyBvcmdhbml6YXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBsaXN0RmlsZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmxpc3RGaWxlcyhvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBHZXQgZmluZS1ncmFpbmVkIHN0YXR1cyB1cGRhdGVzIGZvciBhIGZpbmUtdHVuZSBqb2IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iIHRvIGdldCBldmVudHMgZm9yLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3N0cmVhbV0gV2hldGhlciB0byBzdHJlYW0gZXZlbnRzIGZvciB0aGUgZmluZS10dW5lIGpvYi4gSWYgc2V0IHRvIHRydWUsIGV2ZW50cyB3aWxsIGJlIHNlbnQgYXMgZGF0YS1vbmx5IFtzZXJ2ZXItc2VudCBldmVudHNdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TZXJ2ZXItc2VudF9ldmVudHMvVXNpbmdfc2VydmVyLXNlbnRfZXZlbnRzI0V2ZW50X3N0cmVhbV9mb3JtYXQpIGFzIHRoZXkgYmVjb21lIGF2YWlsYWJsZS4gVGhlIHN0cmVhbSB3aWxsIHRlcm1pbmF0ZSB3aXRoIGEgJiN4NjA7ZGF0YTogW0RPTkVdJiN4NjA7IG1lc3NhZ2Ugd2hlbiB0aGUgam9iIGlzIGZpbmlzaGVkIChzdWNjZWVkZWQsIGNhbmNlbGxlZCwgb3IgZmFpbGVkKS4gIElmIHNldCB0byBmYWxzZSwgb25seSBldmVudHMgZ2VuZXJhdGVkIHNvIGZhciB3aWxsIGJlIHJldHVybmVkLlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgbGlzdEZpbmVUdW5lRXZlbnRzKGZpbmVUdW5lSWQsIHN0cmVhbSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmxpc3RGaW5lVHVuZUV2ZW50cyhmaW5lVHVuZUlkLCBzdHJlYW0sIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IExpc3QgeW91ciBvcmdhbml6YXRpb25cXCdzIGZpbmUtdHVuaW5nIGpvYnNcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGxpc3RGaW5lVHVuZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmxpc3RGaW5lVHVuZXMob3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgTGlzdHMgdGhlIGN1cnJlbnRseSBhdmFpbGFibGUgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGxpc3RNb2RlbHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmxpc3RNb2RlbHMob3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgUmV0cmlldmVzIGEgbW9kZWwgaW5zdGFuY2UsIHByb3ZpZGluZyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBpdCBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmdpbmVJZCBUaGUgSUQgb2YgdGhlIGVuZ2luZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICByZXRyaWV2ZUVuZ2luZShlbmdpbmVJZCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLnJldHJpZXZlRW5naW5lKGVuZ2luZUlkLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIGluZm9ybWF0aW9uIGFib3V0IGEgc3BlY2lmaWMgZmlsZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgcmV0cmlldmVGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLnJldHJpZXZlRmlsZShmaWxlSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IEdldHMgaW5mbyBhYm91dCB0aGUgZmluZS10dW5lIGpvYi4gIFtMZWFybiBtb3JlIGFib3V0IEZpbmUtdHVuaW5nXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICByZXRyaWV2ZUZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5yZXRyaWV2ZUZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IFJldHJpZXZlcyBhIG1vZGVsIGluc3RhbmNlLCBwcm92aWRpbmcgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1vZGVsIHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBwZXJtaXNzaW9uaW5nLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBUaGUgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICByZXRyaWV2ZU1vZGVsKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikucmV0cmlldmVNb2RlbChtb2RlbCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxufVxuZXhwb3J0cy5PcGVuQUlBcGkgPSBPcGVuQUlBcGk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIHRzbGludDpkaXNhYmxlICovXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBPcGVuQUkgQVBJXG4gKiBBUElzIGZvciBzYW1wbGluZyBmcm9tIGFuZCBmaW5lLXR1bmluZyBsYW5ndWFnZSBtb2RlbHNcbiAqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgT3BlbkFQSSBkb2N1bWVudDogMS4yLjBcbiAqXG4gKlxuICogTk9URTogVGhpcyBjbGFzcyBpcyBhdXRvIGdlbmVyYXRlZCBieSBPcGVuQVBJIEdlbmVyYXRvciAoaHR0cHM6Ly9vcGVuYXBpLWdlbmVyYXRvci50ZWNoKS5cbiAqIGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaFxuICogRG8gbm90IGVkaXQgdGhlIGNsYXNzIG1hbnVhbGx5LlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJlcXVpcmVkRXJyb3IgPSBleHBvcnRzLkJhc2VBUEkgPSBleHBvcnRzLkNPTExFQ1RJT05fRk9STUFUUyA9IGV4cG9ydHMuQkFTRV9QQVRIID0gdm9pZCAwO1xuY29uc3QgYXhpb3NfMSA9IHJlcXVpcmUoXCJheGlvc1wiKTtcbmV4cG9ydHMuQkFTRV9QQVRIID0gXCJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxXCIucmVwbGFjZSgvXFwvKyQvLCBcIlwiKTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5DT0xMRUNUSU9OX0ZPUk1BVFMgPSB7XG4gICAgY3N2OiBcIixcIixcbiAgICBzc3Y6IFwiIFwiLFxuICAgIHRzdjogXCJcXHRcIixcbiAgICBwaXBlczogXCJ8XCIsXG59O1xuLyoqXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEJhc2VBUElcbiAqL1xuY2xhc3MgQmFzZUFQSSB7XG4gICAgY29uc3RydWN0b3IoY29uZmlndXJhdGlvbiwgYmFzZVBhdGggPSBleHBvcnRzLkJBU0VfUEFUSCwgYXhpb3MgPSBheGlvc18xLmRlZmF1bHQpIHtcbiAgICAgICAgdGhpcy5iYXNlUGF0aCA9IGJhc2VQYXRoO1xuICAgICAgICB0aGlzLmF4aW9zID0gYXhpb3M7XG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBjb25maWd1cmF0aW9uO1xuICAgICAgICAgICAgdGhpcy5iYXNlUGF0aCA9IGNvbmZpZ3VyYXRpb24uYmFzZVBhdGggfHwgdGhpcy5iYXNlUGF0aDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuQmFzZUFQSSA9IEJhc2VBUEk7XG47XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgUmVxdWlyZWRFcnJvclxuICogQGV4dGVuZHMge0Vycm9yfVxuICovXG5jbGFzcyBSZXF1aXJlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKGZpZWxkLCBtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5maWVsZCA9IGZpZWxkO1xuICAgICAgICB0aGlzLm5hbWUgPSBcIlJlcXVpcmVkRXJyb3JcIjtcbiAgICB9XG59XG5leHBvcnRzLlJlcXVpcmVkRXJyb3IgPSBSZXF1aXJlZEVycm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogT3BlbkFJIEFQSVxuICogQVBJcyBmb3Igc2FtcGxpbmcgZnJvbSBhbmQgZmluZS10dW5pbmcgbGFuZ3VhZ2UgbW9kZWxzXG4gKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIE9wZW5BUEkgZG9jdW1lbnQ6IDEuMi4wXG4gKlxuICpcbiAqIE5PVEU6IFRoaXMgY2xhc3MgaXMgYXV0byBnZW5lcmF0ZWQgYnkgT3BlbkFQSSBHZW5lcmF0b3IgKGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaCkuXG4gKiBodHRwczovL29wZW5hcGktZ2VuZXJhdG9yLnRlY2hcbiAqIERvIG5vdCBlZGl0IHRoZSBjbGFzcyBtYW51YWxseS5cbiAqL1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbiA9IGV4cG9ydHMudG9QYXRoU3RyaW5nID0gZXhwb3J0cy5zZXJpYWxpemVEYXRhSWZOZWVkZWQgPSBleHBvcnRzLnNldFNlYXJjaFBhcmFtcyA9IGV4cG9ydHMuc2V0T0F1dGhUb09iamVjdCA9IGV4cG9ydHMuc2V0QmVhcmVyQXV0aFRvT2JqZWN0ID0gZXhwb3J0cy5zZXRCYXNpY0F1dGhUb09iamVjdCA9IGV4cG9ydHMuc2V0QXBpS2V5VG9PYmplY3QgPSBleHBvcnRzLmFzc2VydFBhcmFtRXhpc3RzID0gZXhwb3J0cy5EVU1NWV9CQVNFX1VSTCA9IHZvaWQgMDtcbmNvbnN0IGJhc2VfMSA9IHJlcXVpcmUoXCIuL2Jhc2VcIik7XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuRFVNTVlfQkFTRV9VUkwgPSAnaHR0cHM6Ly9leGFtcGxlLmNvbSc7XG4vKipcbiAqXG4gKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICogQGV4cG9ydFxuICovXG5leHBvcnRzLmFzc2VydFBhcmFtRXhpc3RzID0gZnVuY3Rpb24gKGZ1bmN0aW9uTmFtZSwgcGFyYW1OYW1lLCBwYXJhbVZhbHVlKSB7XG4gICAgaWYgKHBhcmFtVmFsdWUgPT09IG51bGwgfHwgcGFyYW1WYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBiYXNlXzEuUmVxdWlyZWRFcnJvcihwYXJhbU5hbWUsIGBSZXF1aXJlZCBwYXJhbWV0ZXIgJHtwYXJhbU5hbWV9IHdhcyBudWxsIG9yIHVuZGVmaW5lZCB3aGVuIGNhbGxpbmcgJHtmdW5jdGlvbk5hbWV9LmApO1xuICAgIH1cbn07XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuc2V0QXBpS2V5VG9PYmplY3QgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXlQYXJhbU5hbWUsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBpZiAoY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmFwaUtleSkge1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBcGlLZXlWYWx1ZSA9IHR5cGVvZiBjb25maWd1cmF0aW9uLmFwaUtleSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgID8geWllbGQgY29uZmlndXJhdGlvbi5hcGlLZXkoa2V5UGFyYW1OYW1lKVxuICAgICAgICAgICAgICAgIDogeWllbGQgY29uZmlndXJhdGlvbi5hcGlLZXk7XG4gICAgICAgICAgICBvYmplY3Rba2V5UGFyYW1OYW1lXSA9IGxvY2FsVmFyQXBpS2V5VmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuc2V0QmFzaWNBdXRoVG9PYmplY3QgPSBmdW5jdGlvbiAob2JqZWN0LCBjb25maWd1cmF0aW9uKSB7XG4gICAgaWYgKGNvbmZpZ3VyYXRpb24gJiYgKGNvbmZpZ3VyYXRpb24udXNlcm5hbWUgfHwgY29uZmlndXJhdGlvbi5wYXNzd29yZCkpIHtcbiAgICAgICAgb2JqZWN0W1wiYXV0aFwiXSA9IHsgdXNlcm5hbWU6IGNvbmZpZ3VyYXRpb24udXNlcm5hbWUsIHBhc3N3b3JkOiBjb25maWd1cmF0aW9uLnBhc3N3b3JkIH07XG4gICAgfVxufTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5zZXRCZWFyZXJBdXRoVG9PYmplY3QgPSBmdW5jdGlvbiAob2JqZWN0LCBjb25maWd1cmF0aW9uKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5hY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSB0eXBlb2YgY29uZmlndXJhdGlvbi5hY2Nlc3NUb2tlbiA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgID8geWllbGQgY29uZmlndXJhdGlvbi5hY2Nlc3NUb2tlbigpXG4gICAgICAgICAgICAgICAgOiB5aWVsZCBjb25maWd1cmF0aW9uLmFjY2Vzc1Rva2VuO1xuICAgICAgICAgICAgb2JqZWN0W1wiQXV0aG9yaXphdGlvblwiXSA9IFwiQmVhcmVyIFwiICsgYWNjZXNzVG9rZW47XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuc2V0T0F1dGhUb09iamVjdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIHNjb3BlcywgY29uZmlndXJhdGlvbikge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQWNjZXNzVG9rZW5WYWx1ZSA9IHR5cGVvZiBjb25maWd1cmF0aW9uLmFjY2Vzc1Rva2VuID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgPyB5aWVsZCBjb25maWd1cmF0aW9uLmFjY2Vzc1Rva2VuKG5hbWUsIHNjb3BlcylcbiAgICAgICAgICAgICAgICA6IHlpZWxkIGNvbmZpZ3VyYXRpb24uYWNjZXNzVG9rZW47XG4gICAgICAgICAgICBvYmplY3RbXCJBdXRob3JpemF0aW9uXCJdID0gXCJCZWFyZXIgXCIgKyBsb2NhbFZhckFjY2Vzc1Rva2VuVmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5mdW5jdGlvbiBzZXRGbGF0dGVuZWRRdWVyeVBhcmFtcyh1cmxTZWFyY2hQYXJhbXMsIHBhcmFtZXRlciwga2V5ID0gXCJcIikge1xuICAgIGlmIChwYXJhbWV0ZXIgPT0gbnVsbClcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtZXRlcikpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlci5mb3JFYWNoKGl0ZW0gPT4gc2V0RmxhdHRlbmVkUXVlcnlQYXJhbXModXJsU2VhcmNoUGFyYW1zLCBpdGVtLCBrZXkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhcmFtZXRlcikuZm9yRWFjaChjdXJyZW50S2V5ID0+IHNldEZsYXR0ZW5lZFF1ZXJ5UGFyYW1zKHVybFNlYXJjaFBhcmFtcywgcGFyYW1ldGVyW2N1cnJlbnRLZXldLCBgJHtrZXl9JHtrZXkgIT09ICcnID8gJy4nIDogJyd9JHtjdXJyZW50S2V5fWApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHVybFNlYXJjaFBhcmFtcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdXJsU2VhcmNoUGFyYW1zLmFwcGVuZChrZXksIHBhcmFtZXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB1cmxTZWFyY2hQYXJhbXMuc2V0KGtleSwgcGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5zZXRTZWFyY2hQYXJhbXMgPSBmdW5jdGlvbiAodXJsLCAuLi5vYmplY3RzKSB7XG4gICAgY29uc3Qgc2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh1cmwuc2VhcmNoKTtcbiAgICBzZXRGbGF0dGVuZWRRdWVyeVBhcmFtcyhzZWFyY2hQYXJhbXMsIG9iamVjdHMpO1xuICAgIHVybC5zZWFyY2ggPSBzZWFyY2hQYXJhbXMudG9TdHJpbmcoKTtcbn07XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuc2VyaWFsaXplRGF0YUlmTmVlZGVkID0gZnVuY3Rpb24gKHZhbHVlLCByZXF1ZXN0T3B0aW9ucywgY29uZmlndXJhdGlvbikge1xuICAgIGNvbnN0IG5vblN0cmluZyA9IHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZyc7XG4gICAgY29uc3QgbmVlZHNTZXJpYWxpemF0aW9uID0gbm9uU3RyaW5nICYmIGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5pc0pzb25NaW1lXG4gICAgICAgID8gY29uZmlndXJhdGlvbi5pc0pzb25NaW1lKHJlcXVlc3RPcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKVxuICAgICAgICA6IG5vblN0cmluZztcbiAgICByZXR1cm4gbmVlZHNTZXJpYWxpemF0aW9uXG4gICAgICAgID8gSlNPTi5zdHJpbmdpZnkodmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pXG4gICAgICAgIDogKHZhbHVlIHx8IFwiXCIpO1xufTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy50b1BhdGhTdHJpbmcgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgcmV0dXJuIHVybC5wYXRobmFtZSArIHVybC5zZWFyY2ggKyB1cmwuaGFzaDtcbn07XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uID0gZnVuY3Rpb24gKGF4aW9zQXJncywgZ2xvYmFsQXhpb3MsIEJBU0VfUEFUSCwgY29uZmlndXJhdGlvbikge1xuICAgIHJldHVybiAoYXhpb3MgPSBnbG9iYWxBeGlvcywgYmFzZVBhdGggPSBCQVNFX1BBVEgpID0+IHtcbiAgICAgICAgY29uc3QgYXhpb3NSZXF1ZXN0QXJncyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgYXhpb3NBcmdzLm9wdGlvbnMpLCB7IHVybDogKChjb25maWd1cmF0aW9uID09PSBudWxsIHx8IGNvbmZpZ3VyYXRpb24gPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNvbmZpZ3VyYXRpb24uYmFzZVBhdGgpIHx8IGJhc2VQYXRoKSArIGF4aW9zQXJncy51cmwgfSk7XG4gICAgICAgIHJldHVybiBheGlvcy5yZXF1ZXN0KGF4aW9zUmVxdWVzdEFyZ3MpO1xuICAgIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogT3BlbkFJIEFQSVxuICogQVBJcyBmb3Igc2FtcGxpbmcgZnJvbSBhbmQgZmluZS10dW5pbmcgbGFuZ3VhZ2UgbW9kZWxzXG4gKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIE9wZW5BUEkgZG9jdW1lbnQ6IDEuMi4wXG4gKlxuICpcbiAqIE5PVEU6IFRoaXMgY2xhc3MgaXMgYXV0byBnZW5lcmF0ZWQgYnkgT3BlbkFQSSBHZW5lcmF0b3IgKGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaCkuXG4gKiBodHRwczovL29wZW5hcGktZ2VuZXJhdG9yLnRlY2hcbiAqIERvIG5vdCBlZGl0IHRoZSBjbGFzcyBtYW51YWxseS5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db25maWd1cmF0aW9uID0gdm9pZCAwO1xuY29uc3QgcGFja2FnZUpzb24gPSByZXF1aXJlKFwiLi4vcGFja2FnZS5qc29uXCIpO1xuY2xhc3MgQ29uZmlndXJhdGlvbiB7XG4gICAgY29uc3RydWN0b3IocGFyYW0gPSB7fSkge1xuICAgICAgICB0aGlzLmFwaUtleSA9IHBhcmFtLmFwaUtleTtcbiAgICAgICAgdGhpcy5vcmdhbml6YXRpb24gPSBwYXJhbS5vcmdhbml6YXRpb247XG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBwYXJhbS51c2VybmFtZTtcbiAgICAgICAgdGhpcy5wYXNzd29yZCA9IHBhcmFtLnBhc3N3b3JkO1xuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gcGFyYW0uYWNjZXNzVG9rZW47XG4gICAgICAgIHRoaXMuYmFzZVBhdGggPSBwYXJhbS5iYXNlUGF0aDtcbiAgICAgICAgdGhpcy5iYXNlT3B0aW9ucyA9IHBhcmFtLmJhc2VPcHRpb25zO1xuICAgICAgICB0aGlzLmZvcm1EYXRhQ3RvciA9IHBhcmFtLmZvcm1EYXRhQ3RvcjtcbiAgICAgICAgaWYgKCF0aGlzLmJhc2VPcHRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLmJhc2VPcHRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iYXNlT3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbih7ICdVc2VyLUFnZW50JzogYE9wZW5BSS9Ob2RlSlMvJHtwYWNrYWdlSnNvbi52ZXJzaW9ufWAsICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3RoaXMuYXBpS2V5fWAgfSwgdGhpcy5iYXNlT3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgaWYgKHRoaXMub3JnYW5pemF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmJhc2VPcHRpb25zLmhlYWRlcnNbJ09wZW5BSS1Pcmdhbml6YXRpb24nXSA9IHRoaXMub3JnYW5pemF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5mb3JtRGF0YUN0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybURhdGFDdG9yID0gcmVxdWlyZShcImZvcm0tZGF0YVwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gTUlNRSBpcyBhIEpTT04gTUlNRS5cbiAgICAgKiBKU09OIE1JTUUgZXhhbXBsZXM6XG4gICAgICogICBhcHBsaWNhdGlvbi9qc29uXG4gICAgICogICBhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURjhcbiAgICAgKiAgIEFQUExJQ0FUSU9OL0pTT05cbiAgICAgKiAgIGFwcGxpY2F0aW9uL3ZuZC5jb21wYW55K2pzb25cbiAgICAgKiBAcGFyYW0gbWltZSAtIE1JTUUgKE11bHRpcHVycG9zZSBJbnRlcm5ldCBNYWlsIEV4dGVuc2lvbnMpXG4gICAgICogQHJldHVybiBUcnVlIGlmIHRoZSBnaXZlbiBNSU1FIGlzIEpTT04sIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBpc0pzb25NaW1lKG1pbWUpIHtcbiAgICAgICAgY29uc3QganNvbk1pbWUgPSBuZXcgUmVnRXhwKCdeKGFwcGxpY2F0aW9uXFwvanNvbnxbXjsvIFxcdF0rXFwvW147LyBcXHRdK1srXWpzb24pWyBcXHRdKig7LiopPyQnLCAnaScpO1xuICAgICAgICByZXR1cm4gbWltZSAhPT0gbnVsbCAmJiAoanNvbk1pbWUudGVzdChtaW1lKSB8fCBtaW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhcHBsaWNhdGlvbi9qc29uLXBhdGNoK2pzb24nKTtcbiAgICB9XG59XG5leHBvcnRzLkNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogT3BlbkFJIEFQSVxuICogQVBJcyBmb3Igc2FtcGxpbmcgZnJvbSBhbmQgZmluZS10dW5pbmcgbGFuZ3VhZ2UgbW9kZWxzXG4gKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIE9wZW5BUEkgZG9jdW1lbnQ6IDEuMi4wXG4gKlxuICpcbiAqIE5PVEU6IFRoaXMgY2xhc3MgaXMgYXV0byBnZW5lcmF0ZWQgYnkgT3BlbkFQSSBHZW5lcmF0b3IgKGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaCkuXG4gKiBodHRwczovL29wZW5hcGktZ2VuZXJhdG9yLnRlY2hcbiAqIERvIG5vdCBlZGl0IHRoZSBjbGFzcyBtYW51YWxseS5cbiAqL1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2FwaVwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vY29uZmlndXJhdGlvblwiKSwgZXhwb3J0cyk7XG4iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsImltcG9ydCAnLi9zdHlsZS5jc3MnO1xuXG5cbmNvbnN0IG9wZW5haSA9IHJlcXVpcmUoJ29wZW5haScpO1xuY29uc3QgYXBpS2V5ID0gJ3NrLWhxT3JGSVBzSFpnMW9lSlNneGNlVDNCbGJrRkpybUZaajZxYzBzTEZLUVNQOG5vbSc7XG5vcGVuYWkuYXBpS2V5ID0gYXBpS2V5O1xuY29uc29sZS5sb2cob3BlbmFpKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=