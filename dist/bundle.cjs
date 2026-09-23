var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error2 = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error2);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error2 = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error2);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error2 = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error2);
            return;
          }
          if (!this._fragmented) {
            const error2 = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error2);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error2 = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error2);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error2 = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error2);
            return;
          }
          if (compressed) {
            const error2 = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error2);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error2 = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error2);
            return;
          }
        } else {
          const error2 = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error2);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error2 = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error2);
            return;
          }
        } else if (this._masked) {
          const error2 = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error2);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error2 = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error2);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error2 = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error2);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error2 = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error2);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error2 = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error2);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error2 = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error2);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error2 = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error2);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error2 = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error2);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event2 = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event2.prototype, "target", { enumerable: true });
    Object.defineProperty(Event2.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event2 {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event2 {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event2 {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error2) {
            const event = new ErrorEvent("error", {
              error: error2,
              message: error2.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event2("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event: Event2,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http2 = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http2.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error2(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error2(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http2 = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http2.createServer((req, res) => {
            const body = http2.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server2 = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server2.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server2, map) {
      for (const event of Object.keys(map)) server2.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server2.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server2) {
      server2._state = CLOSED;
      server2.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http2.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http2.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server2, req, socket, code, message, headers) {
      if (server2.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server2.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/aes70/src/log.js
function warn(...args) {
  try {
    console.warn(...args);
  } catch (_e) {
  }
}
function error(...args) {
  try {
    console.error(...args);
  } catch (_e) {
  }
}

// node_modules/aes70/src/events.js
var Events = class {
  constructor() {
    this.event_handlers = /* @__PURE__ */ new Map();
    this.event_handlers_cleared = false;
  }
  /**
   * Emit an event.
   *
   * @param {string} name - Name of the event.
   * @param {...*} args - Extra arguments.
   */
  emit(name) {
    const handlers = this.event_handlers.get(name);
    const args = Array.prototype.slice.call(arguments, 1);
    if (!handlers) return;
    handlers.forEach((cb) => {
      try {
        cb.apply(this, args);
      } catch (e) {
        console.warn("ERROR when calling %o: %o", cb, e);
      }
    });
  }
  /**
   * Subscribe to an event.
   *
   * @param {string} name - Name of the event.
   * @param {Function} cb - Callback function.
   */
  on(name, cb) {
    if (typeof name !== "string")
      throw new TypeError("Event name must be a string.");
    if (typeof cb !== "function")
      throw new TypeError("Event handler must be a function.");
    let handlers = this.event_handlers.get(name);
    if (!handlers) {
      this.event_handlers.set(name, handlers = /* @__PURE__ */ new Set());
    }
    handlers.add(cb);
  }
  addEventListener(name, cb) {
    this.on(name, cb);
  }
  /**
   * Removes an event handler.
   *
   * @param {string} name - Name of the event.
   * @param {Function} cb - Callback function.
   */
  removeEventListener(name, cb) {
    const handlers = this.event_handlers.get(name);
    if (!handlers || !handlers.has(cb)) {
      if (!this.event_handlers_cleared) {
        console.warn("removeEventListeners(): not installed:", name, cb);
      }
      return;
    }
    handlers.delete(cb);
  }
  /**
   * Removes an event handler.
   *
   * @param {string} name
   * @param {Function} cb
   */
  off(name, cb) {
    this.removeEventListener(name, cb);
  }
  /**
   * Removes all event listeners.
   */
  removeAllEventListeners() {
    this.event_handlers.clear();
    this.event_handlers_cleared = true;
  }
  /**
   *
   * @param {string} name
   * @param {Function} cb
   */
  subscribe(name, cb) {
    this.on(name, cb);
    return () => {
      if (name === void 0) return;
      this.off(name, cb);
      name = void 0;
    };
  }
};

// node_modules/aes70/src/OCP1/pdu.js
var PDU = class {
  get messageType() {
    return this.constructor.messageType;
  }
};

// node_modules/aes70/src/OCP1/encoded_arguments.js
function calculateByteLength(encoders, data) {
  let byteLength = 0;
  for (let i = 0; i < encoders.length; i++) {
    byteLength += encoders[i].encodedLength(data[i]);
  }
  return byteLength;
}
function encode(encoders, data, byteLength) {
  if (!byteLength) return null;
  const result = new ArrayBuffer(byteLength);
  const dataView = new DataView(result);
  for (let i = 0, pos = 0; i < encoders.length; i++) {
    pos = encoders[i].encodeTo(dataView, pos, data[i]);
  }
  return result;
}
var EncodedArguments = class {
  constructor(encoders, data) {
    this.encoders = encoders;
    this.data = data;
    this.byteLength = calculateByteLength(encoders, data);
    this.buffer = encode(encoders, data, this.byteLength);
  }
  encodeTo(dataView, pos) {
    pos = pos | 0;
    const { byteLength, buffer } = this;
    if (!byteLength) return pos;
    const src = new Uint8Array(buffer);
    const dst = new Uint8Array(
      dataView.buffer,
      dataView.byteOffset,
      dataView.byteLength
    );
    dst.set(src, pos);
    return pos + byteLength;
  }
};

// node_modules/aes70/src/OCP1/command.js
var Command = class extends PDU {
  constructor(target, method_level, method_index, param_count, parameters) {
    super();
    this.target = +target;
    this.method_level = method_level | 0;
    this.method_index = method_index | 0;
    this.param_count = param_count | 0;
    this.parameters = parameters || null;
    this.handle = 0;
  }
  static get messageType() {
    return 0;
  }
  encode_to(dst, pos) {
    pos = pos | 0;
    dst.setUint32(pos, this.encoded_length());
    pos += 4;
    dst.setUint32(pos, this.handle);
    pos += 4;
    dst.setUint32(pos, this.target);
    pos += 4;
    dst.setUint16(pos, this.method_level);
    pos += 2;
    dst.setUint16(pos, this.method_index);
    pos += 2;
    dst.setUint8(pos, this.param_count);
    pos++;
    if (this.param_count) {
      const parameters = this.parameters;
      if (parameters instanceof EncodedArguments) {
        pos = parameters.encodeTo(dst, pos);
      } else {
        new Uint8Array(dst.buffer).set(
          new Uint8Array(parameters),
          dst.byteOffset + pos
        );
        pos += parameters.byteLength;
      }
    }
    return pos;
  }
  encoded_length() {
    return 17 + (this.param_count ? this.parameters.byteLength : 0);
  }
  decode_from(data, pos, data_len) {
    let len = data.getUint32(pos);
    pos += 4;
    this.handle = data.getUint32(pos);
    pos += 4;
    this.target = data.getUint32(pos);
    pos += 4;
    this.method_level = data.getUint16(pos);
    pos += 2;
    this.method_index = data.getUint16(pos);
    pos += 2;
    this.param_count = data.getUint8(pos);
    pos++;
    len -= 17;
    if (len < 0) throw new Error("Bad Command Length.");
    if (len > 0) {
      if (!this.param_count) throw new Error("Expected no parameter bytes.");
      this.parameters = data.buffer.slice(
        data.byteOffset + pos,
        data.byteOffset + pos + len
      );
      pos += len;
    }
    return pos;
  }
  response(status_code, param_count, parameters) {
    return new Response(this.handle, status_code, param_count, parameters);
  }
};

// node_modules/aes70/src/OCP1/commandrrq.js
var CommandRrq = class extends Command {
  static get messageType() {
    return 1;
  }
};

// node_modules/aes70/src/OCP1/createType.js
function createType(Type) {
  if (!Type.isConstantLength) return Type;
  const encodedLength = Type.encodedLength();
  const decode = Type.decode;
  const encodeTo = Type.encodeTo;
  const decodeFrom = Type.decodeFrom;
  return {
    isConstantLength: true,
    canEncode: Type.canEncode,
    encodedLength: Type.encodedLength,
    encodeTo,
    decode,
    decodeFrom: decode ? function(dataView, pos) {
      const result = decode(dataView, pos);
      return [pos + encodedLength, result];
    } : decodeFrom,
    decodeLength: function(dataView, pos) {
      return pos + encodedLength;
    }
  };
}

// node_modules/aes70/src/OCP1/OcaUint16.js
var OcaUint16 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 2;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setUint16(pos, 0 | value, false);
    return pos + 2;
  },
  decode: function(dataView, pos) {
    return dataView.getUint16(pos, false);
  }
});

// node_modules/aes70/src/OCP1/Struct.js
function Struct(Types, DataType) {
  const countTypes = Object.keys(Types).length;
  if (!DataType) {
    DataType = class {
      constructor(...args) {
        if (args.length === countTypes) {
          let i = 0;
          for (const name in Types) {
            if (!Object.prototype.hasOwnProperty.call(Types, name)) continue;
            this[name] = args[i++];
          }
        } else if (args.length === 1 && typeof args[0] === "object") {
          const o = args[0];
          for (const name in Types) {
            if (!Object.prototype.hasOwnProperty.call(Types, name)) continue;
            this[name] = o[name];
          }
        } else throw new TypeError("Unexpected arguments.");
      }
    };
  }
  return createType({
    type: DataType,
    isConstantLength: false,
    canEncode: function(value) {
      if (typeof value !== "object") return false;
      for (const name in Types) {
        if (!Object.prototype.hasOwnProperty.call(Types, name)) continue;
        const Type = Types[name];
        if (!Type.canEncode(value[name])) return false;
      }
      return true;
    },
    encodedLength: function(value) {
      let result = 0;
      for (const name in Types) {
        if (!Object.prototype.hasOwnProperty.call(Types, name)) continue;
        const Type = Types[name];
        result += Type.encodedLength(value[name]);
      }
      return result;
    },
    encodeTo: function(dataView, pos, value) {
      for (const name in Types) {
        if (!Object.prototype.hasOwnProperty.call(Types, name)) continue;
        const Type = Types[name];
        pos = Type.encodeTo(dataView, pos, value[name]);
      }
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const args = new Array(Types.length);
      let i = 0;
      for (const name in Types) {
        if (!Object.prototype.hasOwnProperty.call(Types, name)) continue;
        const Type = Types[name];
        let tmp;
        [pos, tmp] = Type.decodeFrom(dataView, pos);
        args[i++] = tmp;
      }
      return [pos, new DataType(...args)];
    },
    decodeLength: function(dataView, pos) {
      for (const name in Types) {
        if (!Object.prototype.hasOwnProperty.call(Types, name)) continue;
        const Type = Types[name];
        pos = Type.decodeLength(dataView, pos);
      }
      return pos;
    }
  });
}

// node_modules/aes70/src/types/OcaEventID.js
var OcaEventID = class {
  /**
   * Representation of an OCA event ID. A class may define at most 255 events of
   * its own. Additional events may be inherited, so the total number may exceed
   * 255.
   * @class OcaEventID
   */
  constructor(DefLevel, EventIndex) {
    this.DefLevel = DefLevel;
    this.EventIndex = EventIndex;
  }
};

// node_modules/aes70/src/OCP1/OcaEventID.js
var OcaEventID2 = Struct(
  {
    DefLevel: OcaUint16,
    EventIndex: OcaUint16
  },
  OcaEventID
);

// node_modules/aes70/src/OCP1/OcaUint32.js
var OcaUint32 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 4;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setUint32(pos, value, false);
    return pos + 4;
  },
  decode: function(dataView, pos) {
    return dataView.getUint32(pos, false);
  }
});

// node_modules/aes70/src/types/OcaEvent.js
var OcaEvent = class {
  /**
   * Representation of an OCA event, i.e. the unique combination of emitter ONo
   * and the EventID.
   * @class OcaEvent
   */
  constructor(EmitterONo, EventID) {
    this.EmitterONo = EmitterONo;
    this.EventID = EventID;
  }
};

// node_modules/aes70/src/OCP1/OcaEvent.js
var OcaEvent2 = Struct(
  {
    EmitterONo: OcaUint32,
    EventID: OcaEventID2
  },
  OcaEvent
);

// node_modules/aes70/src/OCP1/notification.js
var Notification = class extends PDU {
  constructor(target, method_level, method_index, context, event, param_count, parameters) {
    super();
    this.target = target;
    this.method_level = method_level | 0;
    this.method_index = method_index | 0;
    this.context = context;
    this.event = event;
    this.param_count = param_count | 0;
    this.parameters = parameters || null;
  }
  static get messageType() {
    return 2;
  }
  encode_to(dst, pos) {
    dst.setUint32(pos, this.encoded_length());
    pos += 4;
    dst.setUint32(pos, this.target);
    pos += 4;
    dst.setUint16(pos, this.method_level);
    pos += 2;
    dst.setUint16(pos, this.method_index);
    pos += 2;
    dst.setUint8(pos, this.param_count);
    pos++;
    const context = this.context;
    if (context) {
      const len = context.byteLength;
      dst.setUint16(pos, len);
      pos += 2;
      if (len > 0) {
        new Uint8Array(dst.buffer).set(
          new Uint8Array(this.context),
          dst.byteOffset + pos
        );
        pos += len;
      }
    } else {
      dst.setUint16(pos, 0);
      pos += 2;
    }
    dst.setUint32(pos, this.event.EmitterONo);
    pos += 4;
    dst.setUint16(pos, this.event.EventID.DefLevel);
    pos += 2;
    dst.setUint16(pos, this.event.EventID.EventIndex);
    pos += 2;
    if (this.param_count > 1) {
      if (this.parameters instanceof EncodedArguments) {
        pos = this.parameters.encodeTo(dst, pos);
      } else {
        new Uint8Array(dst.buffer).set(
          new Uint8Array(this.parameters),
          dst.byteOffset + pos
        );
        pos += this.parameters.byteLength;
      }
    }
    return pos;
  }
  encoded_length() {
    return 23 + (this.param_count > 1 ? this.parameters.byteLength : 0) + (this.context ? this.context.byteLength : 0);
  }
  decode_from(data, pos, data_len) {
    let len = data.getUint32(pos);
    pos += 4;
    this.target = data.getUint32(pos);
    pos += 4;
    this.method_level = data.getUint16(pos);
    pos += 2;
    this.method_index = data.getUint16(pos);
    pos += 2;
    this.param_count = data.getUint8(pos);
    pos++;
    const context_length = data.getUint16(pos);
    pos += 2;
    if (context_length) {
      this.context = data.buffer.slice(
        data.byteOffset + pos,
        data.byteOffset + pos + context_length
      );
      pos += context_length;
    } else {
      this.context = null;
    }
    let event;
    [pos, event] = OcaEvent2.decodeFrom(data, pos);
    this.event = event;
    len -= 23 + context_length;
    if (len < 0) throw new Error("Bad Notification Length.");
    if (len > 0) {
      this.parameters = data.buffer.slice(
        data.byteOffset + pos,
        data.byteOffset + pos + len
      );
      pos += len;
    }
    return pos;
  }
};

// node_modules/aes70/src/OCP1/response.js
var Response2 = class extends PDU {
  constructor(handle, status_code, param_count, parameters) {
    super();
    this.handle = handle;
    this.status_code = status_code | 0;
    this.param_count = param_count | 0;
    this.parameters = parameters || null;
  }
  static get messageType() {
    return 3;
  }
  encoded_length() {
    return 10 + (this.param_count ? this.parameters.byteLength : 0);
  }
  decode_from(data, pos, data_len) {
    let len = data.getUint32(pos);
    pos += 4;
    this.handle = data.getUint32(pos);
    pos += 4;
    this.status_code = data.getUint8(pos);
    pos++;
    this.param_count = data.getUint8(pos);
    pos++;
    len -= 10;
    if (len < 0) throw new Error("Bad Response length.");
    if (len > 0) {
      if (!this.param_count)
        throw new Error(
          "Decoding response with parameterCount=0 but %o bytes of parameters",
          len
        );
      this.parameters = data.buffer.slice(
        data.byteOffset + pos,
        data.byteOffset + pos + len
      );
      pos += len;
    }
    return pos;
  }
  encode_to(dst, pos) {
    dst.setUint32(pos, this.encoded_length());
    pos += 4;
    dst.setUint32(pos, this.handle);
    pos += 4;
    dst.setUint8(pos, this.status_code);
    pos++;
    dst.setUint8(pos, this.param_count);
    pos++;
    if (this.param_count) {
      if (this.parameters instanceof EncodedArguments) {
        pos = this.parameters.encodeTo(dst, pos);
      } else {
        new Uint8Array(dst.buffer).set(
          new Uint8Array(this.parameters),
          dst.byteOffset + pos
        );
        pos += this.parameters.byteLength;
      }
    }
    return pos;
  }
};

// node_modules/aes70/src/OCP1/keepalive.js
var KeepAlive = class extends PDU {
  static get messageType() {
    return 4;
  }
  constructor(time) {
    super();
    this.time = time || 0;
  }
  decode_from(data, pos, len) {
    if (len == 4) {
      this.time = data.getUint32(pos);
      pos += 4;
    } else if (len == 2) {
      this.time = data.getUint16(pos) * 1e3;
      pos += 2;
    } else throw new Error("Bad keepalive timeout length.");
    return pos;
  }
  encode_to(dst, pos) {
    if (this.time % 1e3) {
      dst.setUint32(pos, this.time);
      pos += 4;
    } else {
      dst.setUint16(pos, this.time / 1e3);
      pos += 2;
    }
    return pos;
  }
  encoded_length() {
    if (this.time % 1e3) {
      return 4;
    } else {
      return 2;
    }
  }
};

// node_modules/aes70/src/OCP1/notification2.js
var Notification2 = class extends PDU {
  constructor(event, exception, data) {
    super();
    this.event = event;
    this.exception = !!exception;
    this.parameters = data || null;
  }
  static get messageType() {
    return 5;
  }
  encode_to(dst, pos) {
    dst.setUint32(pos, this.encoded_length());
    pos += 4;
    dst.setUint32(pos, this.event.EmitterONo);
    pos += 4;
    dst.setUint16(pos, this.event.EventID.DefLevel);
    pos += 2;
    dst.setUint16(pos, this.event.EventID.EventIndex);
    pos += 2;
    dst.setUint8(pos, this.exception ? 1 : 0);
    pos += 1;
    if (this.parameters) {
      if (this.parameters instanceof EncodedArguments) {
        pos = this.parameters.encodeTo(dst, pos);
      } else {
        new Uint8Array(dst.buffer).set(
          new Uint8Array(this.parameters),
          dst.byteOffset + pos
        );
        pos += this.parameters.byteLength;
      }
    }
    return pos;
  }
  encoded_length() {
    return 13 + (this.parameters ? this.parameters.byteLength : 0);
  }
  decode_from(data, pos, data_len) {
    let len = data.getUint32(pos);
    pos += 4;
    let event;
    [pos, event] = OcaEvent2.decodeFrom(data, pos);
    this.event = event;
    this.exception = data.getUint8(pos++) ? true : false;
    len -= 13;
    if (len < 0) throw new Error("Bad Notification Length.");
    if (len > 0) {
      this.parameters = data.buffer.slice(
        data.byteOffset + pos,
        data.byteOffset + pos + len
      );
      pos += len;
    }
    return pos;
  }
};

// node_modules/aes70/src/OCP1/decode_message.js
var PDUTypes = [
  Command,
  CommandRrq,
  Notification,
  Response2,
  KeepAlive,
  Notification2
];
function decodeMessage(data, pos, ret) {
  if (data.byteLength < data.byteOffset + pos + 10) return -1;
  pos = pos | 0;
  if (data.getUint8(pos) != 59) throw new Error("Bad sync value.");
  pos++;
  pos += 2;
  const messageSize = data.getUint32(pos);
  pos += 4;
  const messageType = data.getUint8(pos);
  pos++;
  const messageCount = data.getUint16(pos);
  pos += 2;
  const message_offset = data.byteOffset + pos - 9 + messageSize;
  if (message_offset > data.byteLength) return -1;
  ret.length = messageCount;
  const PDUType = PDUTypes[messageType];
  if (PDUType === void 0) throw new Error("Bad Message Type");
  if (PDUType === KeepAlive && messageCount !== 1)
    throw new Error("Bad KeepAlive message count.");
  for (let i = 0; i < messageCount; i++) {
    ret[i] = new PDUType();
    pos = ret[i].decode_from(data, pos, message_offset - data.byteOffset - pos);
  }
  if (pos != message_offset)
    throw new Error("Decode error: " + pos + " vs " + message_offset);
  return pos;
}

// node_modules/aes70/src/OCP1/protocol_version.js
var PROTOCOL_VERSION_2024 = 4;

// node_modules/aes70/src/OCP1/encode_message.js
var messageHeaderSize = 10;
var currentProtocolVersion = PROTOCOL_VERSION_2024;
function encodeMessageTo(dst, pos, pdus, offset, end) {
  if (!offset) offset = 0;
  if (!end) end = pdus.length;
  const count = end - offset;
  if (!(count <= 65535)) throw new Error("Too many PDUs.");
  dst.setUint8(pos, 59);
  pos += 1;
  const startPos = pos;
  dst.setUint16(pos, currentProtocolVersion);
  pos += 2;
  const lenPos = pos;
  pos += 4;
  dst.setUint8(pos, pdus[offset].messageType);
  pos++;
  dst.setUint16(pos, end - offset);
  pos += 2;
  for (let i = offset; i < end; i++) {
    pos = pdus[i].encode_to(dst, pos);
  }
  dst.setUint32(lenPos, pos - startPos);
  return pos;
}

// node_modules/aes70/src/OCP1/message_generator.js
var pduTypeKeepAlive = 4;
var MessageGenerator = class {
  constructor(batchSize, resultCallback) {
    if (!(batchSize <= 4294967295)) throw new TypeError("Invalid batch size.");
    this._pdus = [];
    this._batchSize = batchSize;
    this._resultCallback = resultCallback;
    this._currentSize = 0;
    this._currentCount = 0;
    this._lastMessageType = -1;
    this._flushScheduled = false;
    this._flushCb = () => {
      this._flushScheduled = false;
      if (this._pdus === null) return;
      this.flush();
    };
  }
  get bufferedAmount() {
    return this._currentSize;
  }
  get batchSize() {
    return this._batchSize;
  }
  add(pdu) {
    const currentSize = this._currentSize;
    const encodedLength = pdu.encoded_length();
    const messageType = pdu.messageType;
    const combine = this._lastMessageType === messageType && messageType !== pduTypeKeepAlive && this._currentCount < 65535;
    let additionalSize = encodedLength;
    if (!combine) additionalSize += messageHeaderSize;
    if (currentSize && currentSize + additionalSize > this._batchSize) {
      this.flush();
      additionalSize = encodedLength + messageHeaderSize;
    }
    this._pdus.push(pdu);
    this._currentSize += additionalSize;
    if (combine) {
      this._currentCount++;
    } else {
      this._currentCount = 1;
    }
    this._lastMessageType = messageType;
    if (this._currentSize + additionalSize > this._batchSize) {
      this.flush();
    } else if (this._pdus.length === 1) {
      this.scheduleFlush();
    }
  }
  scheduleFlush() {
    if (this._flushScheduled) return;
    this._flushScheduled = true;
    Promise.resolve().then(this._flushCb).catch((err) => {
      console.error(err);
    });
  }
  flush() {
    if (!this._currentSize) return;
    const pdus = this._pdus;
    const buf = new ArrayBuffer(this._currentSize);
    const dst = new DataView(buf);
    const length = pdus.length;
    for (let i = 0, from = 0, pos = 0; i < length; i++) {
      const pdu = pdus[i];
      const messageType = pdu.messageType;
      if (i === length - 1 || i + 1 - from === 65535 || messageType === pduTypeKeepAlive || messageType !== pdus[i + 1].messageType) {
        pos = encodeMessageTo(dst, pos, pdus, from, i + 1);
        from = i + 1;
      }
    }
    this._currentSize = 0;
    this._lastMessageType = -1;
    this._currentCount = 0;
    this._pdus.length = 0;
    this._resultCallback(buf);
  }
  dispose() {
    this._pdus = null;
  }
};

// node_modules/aes70/src/timeout_error.js
var TimeoutError = class extends Error {
  constructor(error2) {
    super(`Connection has timed out.`);
    this.name = "aes70.TimeoutError";
  }
};

// node_modules/aes70/src/utils/timer.js
function isItTime(target, now) {
  return target - now < 1;
}
var Timer = class {
  constructor(callback, getNow) {
    this._callback = callback;
    this._getNow = getNow;
    this._targetTime = void 0;
    this._timerId = void 0;
    this._timerAt = void 0;
  }
  poll() {
    const now = this._getNow();
    if (this._targetTime === void 0) return;
    if (isItTime(this._targetTime, now)) {
      this._targetTime = void 0;
      try {
        this._callback();
      } catch (err) {
        console.error("Timer callback threw an exception", err);
      }
    } else {
      this._reschedule();
    }
  }
  _reschedule() {
    const target = this._targetTime;
    const interval = target - this._getNow();
    if (this._timerId !== void 0) {
      if (target >= this._timerAt) {
        return;
      }
      clearTimeout(this._timerId);
      this._timerId = void 0;
    }
    this._timerAt = target;
    this._timerId = setTimeout(() => {
      this._timerId = void 0;
      this._timerAt = void 0;
      this.poll();
    }, Math.max(0, interval));
  }
  /**
   *
   * @param {number} interval
   *   Interval in milliseconds.
   */
  scheduleIn(interval) {
    if (!(interval >= 0)) {
      throw new TypeError(`Expected positive interval.`);
    }
    this._targetTime = this._getNow() + interval;
    this._reschedule();
  }
  /**
   * Schedule the timer in a given number of milliseconds. If the timer
   * is already running and scheduled to run before, do not modify it.
   *
   * @param {number} interval
   */
  scheduleDeadlineIn(interval) {
    if (!(interval >= 0)) {
      throw new TypeError(`Expected positive interval.`);
    }
    const target = this._getNow() + interval;
    if (this._targetTime !== void 0 && this._targetTime <= target) {
      this.poll();
      return;
    }
    this.scheduleAt(target);
  }
  /**
   *
   * @param {number} target
   *   Target time in milliseconds.
   */
  scheduleAt(target) {
    if (!(target >= 0)) {
      throw new TypeError();
    }
    this._targetTime = target;
    this._reschedule();
  }
  stop() {
    this._targetTime = void 0;
  }
  cancel() {
    this.stop();
    this._clearTimeout();
  }
  _clearTimeout() {
    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = void 0;
      this._timerAt = void 0;
    }
  }
  dispose() {
    this.cancel();
  }
};

// node_modules/aes70/src/connection.js
var Connection = class extends Events {
  constructor(options) {
    if (!options) options = {};
    super();
    const now = this._now();
    this.options = options;
    const batchSize = options.batch >= 0 ? options.batch : 64 * 1024;
    this._message_generator = new MessageGenerator(
      batchSize,
      (buf) => this.write(buf)
    );
    this.inbuf = null;
    this.inpos = 0;
    this.last_rx_time = now;
    this.last_tx_time = now;
    this.rx_bytes = 0;
    this.tx_bytes = 0;
    this._keepalive_timer = new Timer(
      () => this._check_keepalive(),
      () => this._now()
    );
    this.keepalive_interval = -1;
    this._closed = false;
    this.on("close", () => {
      if (this._closed) return;
      this._closed = true;
      this.cleanup();
    });
    this.on("error", (e) => {
      if (this._closed) return;
      this._closed = true;
      this.emit("close");
      this.cleanup(e);
    });
  }
  get is_reliable() {
    return true;
  }
  get bufferedAmount() {
    return this._message_generator.bufferedAmount;
  }
  get batchSize() {
    return this._message_generator.batchSize;
  }
  get pendingWrites() {
    return this._message_generator.bufferedAmount > 0 ? 1 : 0;
  }
  send(pdu) {
    if (this.is_closed()) throw new Error("Connection is closed.");
    this.emit("send", pdu);
    this._message_generator.add(pdu);
  }
  tx_idle_time() {
    return this._now() - this.last_tx_time;
  }
  rx_idle_time() {
    return this._now() - this.last_rx_time;
  }
  read(buf) {
    this.rx_bytes += buf.byteLength;
    this.last_rx_time = this._now();
    if (this.inbuf) {
      const len = this.inbuf.byteLength - this.inpos;
      const tmp = new Uint8Array(new ArrayBuffer(len + buf.byteLength));
      tmp.set(new Uint8Array(this.inbuf, this.inpos));
      tmp.set(new Uint8Array(buf), len);
      this.inbuf = null;
      this.inpos = 0;
      buf = tmp.buffer;
    }
    let pos = 0;
    const view = new DataView(buf);
    try {
      do {
        const ret = [];
        const len = decodeMessage(view, pos, ret);
        if (len == -1) {
          this.inbuf = buf;
          this.inpos = pos;
          break;
        }
        pos = len;
        this.incoming(ret);
      } while (pos < buf.byteLength);
    } catch (e) {
      if (this.is_reliable) {
        this.emit("error", e);
        return;
      } else {
        console.error(e);
      }
    }
    this.poll();
  }
  incoming(a) {
  }
  write(buf) {
    this.last_tx_time = this._now();
    this.tx_bytes += buf.byteLength;
  }
  is_closed() {
    return this._message_generator === null;
  }
  /**
   * Closes the connection. Overloaded by connection subclasses.
   */
  close() {
    if (this.is_closed()) return;
    this.emit("close");
  }
  error(err) {
    if (this.is_closed()) return;
    this.emit("error", err);
  }
  cleanup(error2) {
    if (this.is_closed()) throw new Error("cleanup() called twice.");
    this._keepalive_timer.dispose();
    this._message_generator.dispose();
    this._message_generator = null;
    this.removeAllEventListeners();
  }
  _check_keepalive() {
    if (this.is_closed()) return;
    const t = this.keepalive_interval;
    if (!(t > 0)) return;
    this._keepalive_timer.scheduleIn(t / 2 + 10);
    if (this.rx_idle_time() > t * 3) {
      this.emit("timeout");
      this.error(new TimeoutError());
    } else if (this.tx_idle_time() > t * 0.75) {
      this.flush();
      if (this.tx_idle_time() > t * 0.75) this.send(new KeepAlive(t));
    }
  }
  /**
   * Check if some regular internal timers must run.
   */
  poll() {
    this._keepalive_timer.poll();
  }
  /**
   * Flush write buffers. This are usually PDUs or may also be unwritten
   * buffers.
   */
  flush() {
    this._message_generator.flush();
  }
  /**
   * Set the keepalive interval. Setting the keepalive interval to a
   * positive number ``N`` will make sure to send some packet (possibly a
   * keepalive command) at ``N`` seconds.
   *
   * @param {number} seconds
   *    Keepalive interval in seconds.
   */
  set_keepalive_interval(seconds) {
    if (!(seconds <= 10)) {
      console.warn(
        "Unusually large keepalive interval %o seconds. Confusion of ms vs. seconds?"
      );
    }
    const t = seconds * 1e3;
    if (this.keepalive_interval === t) return;
    this.keepalive_interval = t;
    if (this.is_closed()) return;
    this.send(new KeepAlive(t));
    if (t > 0) {
      this._keepalive_timer.scheduleIn(t / 2 + 10);
    } else {
      this._keepalive_timer.stop();
    }
  }
};

// node_modules/aes70/src/controller/remote_error.js
var RemoteError = class extends Error {
  constructor(status, cmd) {
    super(`Call failed with OcaStatus ${status.name}`);
    this.name = "aes70.RemoteError";
    this.status = status;
    this.cmd = cmd;
  }
  static check_status(error2, status) {
    return error2 instanceof this && error2.status === status;
  }
};

// node_modules/aes70/src/controller/arguments.js
var Arguments = class {
  constructor(values) {
    this.values = values;
  }
  /**
   * Returns an item.
   * @param {integer} n - Index of the item.
   */
  item(n) {
    return this.values[n];
  }
  /**
   * The number of elements.
   */
  get length() {
    return this.values.length;
  }
  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }
};

// node_modules/aes70/src/types/Enum.js
function hasOwnProperty(o, name) {
  return Object.prototype.hasOwnProperty.call(o, name);
}
function Enum(values) {
  let names = null;
  function getName(value) {
    if (names === null) {
      names = /* @__PURE__ */ new Map();
      for (const name in values) {
        if (!hasOwnProperty(values, name)) continue;
        names.set(values[name], name);
      }
    }
    return names.get(value);
  }
  function getValue(name) {
    if (hasOwnProperty(values, name)) return values[name];
  }
  let blueprints = null;
  function setBlueprint(value, o) {
    if (blueprints === null) {
      blueprints = /* @__PURE__ */ new Map();
    }
    blueprints.set(value, o);
  }
  const result = class {
    get isEnum() {
      return true;
    }
    constructor(value) {
      if (typeof value === "string") {
        if (!hasOwnProperty(values, value))
          throw new Error("No such enum value.");
        return this.constructor[value];
      }
      if (blueprints !== null && blueprints.has(value)) {
        return blueprints.get(value);
      }
      this.value = value;
      setBlueprint(value, this);
    }
    get name() {
      return getName(this.value);
    }
    /**
     * @function Enum#valueOf
     * @returns {number} The numeric enum value.
     */
    valueOf() {
      return this.value;
    }
    /**
     * @function Enum#toString
     * @returns {string} The enum entry name.
     */
    toString() {
      return this.name;
    }
    static getName(value) {
      const name = getName(value);
      if (name === void 0) throw new Error("No such enum value.");
      return name;
    }
    static hasValue(value) {
      return getName(value) !== void 0;
    }
    static getValue(name) {
      const value = getValue(name);
      if (value === void 0) throw new Error("No such enum value.");
      return value;
    }
    static hasName(name) {
      return getValue(name) !== void 0;
    }
    static values() {
      return values;
    }
  };
  for (const name in values) {
    if (!hasOwnProperty(values, name)) continue;
    Object.defineProperty(result, name, {
      get: function() {
        return new this(values[name]);
      },
      enumerable: false,
      configurable: true
    });
  }
  return result;
}

// node_modules/aes70/src/types/OcaStatus.js
var OcaStatus = class extends Enum({
  OK: 0,
  ProtocolVersionError: 1,
  DeviceError: 2,
  Locked: 3,
  BadFormat: 4,
  BadONo: 5,
  ParameterError: 6,
  ParameterOutOfRange: 7,
  NotImplemented: 8,
  InvalidRequest: 9,
  ProcessingFailed: 10,
  BadMethod: 11,
  PartiallySucceeded: 12,
  Timeout: 13,
  BufferOverflow: 14,
  PermissionDenied: 15,
  OutOfMemory: 16,
  Busy: 17
}) {
};

// node_modules/aes70/src/close_error.js
var CloseError = class extends Error {
  constructor(error2) {
    super(`Connection has been closed.`);
    this.name = "aes70.CloseError";
    this.error = error2;
  }
};

// node_modules/aes70/src/utils/subscriptions.js
var Subscriptions = class {
  constructor() {
    this._callbacks = [];
  }
  /**
   * Add a subscription.
   *
   * @param {Function[]} cbs
   */
  add(...cbs) {
    cbs.forEach((cb) => {
      this._callbacks.push(cb);
    });
  }
  unsubscribe() {
    this._callbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
    this._callbacks.length = 0;
  }
};

// node_modules/aes70/src/utils/subscribeEvent.js
function addEvent(target, name, callback) {
  if (target.addEventListener) {
    target.addEventListener(name, callback);
  } else if (target.on) {
    target.on(name, callback);
  } else {
    throw new TypeError("Unsupported event target ", target);
  }
}
function removeEvent(target, name, callback) {
  if (target.removeEventListener) {
    target.removeEventListener(name, callback);
  } else if (target.off) {
    target.off(name, callback);
  } else {
    throw new TypeError("Unsupported event target ", target);
  }
}
function subscribeEvent(target, name, callback) {
  addEvent(target, name, callback);
  return () => {
    removeEvent(target, name, callback);
  };
}

// node_modules/aes70/src/controller/client_connection.js
var PendingCommand = class {
  get handle() {
    return this.command.handle;
  }
  constructor(resolve, reject, returnTypes, command, stack, name) {
    this.resolve = resolve;
    this.reject = reject;
    this.returnTypes = returnTypes;
    this.command = command;
    this.stack = stack;
    this.name = name;
    this.lastSent = 0;
    this.retries = 0;
    this.duration = 0;
  }
  /**
   * Sets the expected processing time for this command on the device.
   * This duration is used when scheduling retries.
   * Only has an effect for UDP connections.
   *
   * @param {number} interval
   *  The interval in milliseconds.
   */
  set_duration(interval) {
    this.duration = interval;
  }
  get_arguments() {
    const parameters = this.command.parameters;
    if (parameters && parameters instanceof EncodedArguments) {
      return parameters.data;
    }
  }
  handleError(error2) {
    if (this.stack && error2 instanceof Error) error2.stack = this.stack;
    this.reject(error2);
  }
  response(o) {
    const { resolve, reject, returnTypes, command } = this;
    if (o.status_code !== 0) {
      const error2 = new RemoteError(new OcaStatus(o.status_code), command);
      this.handleError(error2);
    } else if (!returnTypes) {
      resolve(o);
    } else {
      try {
        const length = Math.min(o.param_count, returnTypes.length);
        if (length === 0) {
          resolve();
        } else {
          const result = new Array(length);
          const dataView = new DataView(o.parameters);
          for (let i = 0, pos = 0; i < length; i++) {
            let tmp;
            [pos, tmp] = returnTypes[i].decodeFrom(dataView, pos);
            result[i] = tmp;
          }
          resolve(length === 1 ? result[0] : new Arguments(result));
        }
      } catch (err) {
        reject(err);
      }
    }
  }
};
function eventToKey(event) {
  const ono = event.EmitterONo;
  const id = event.EventID;
  return [ono, id.DefLevel, id.EventIndex].join(",");
}
var ClientConnection = class extends Connection {
  constructor(options) {
    super(options);
    this._pendingCommands = /* @__PURE__ */ new Map();
    this._scheduledPendingCommands = /* @__PURE__ */ new Set();
    this._sentPendingCommands = /* @__PURE__ */ new Set();
    this._lastCommandHandle = 0;
    this._subscribers = /* @__PURE__ */ new Map();
    this._sendCommandsTimer = new Timer(
      () => {
        this.sendCommands();
      },
      () => this._now()
    );
  }
  shouldSendMoreCommands() {
    return this.is_reliable;
  }
  sendCommands() {
    const { _scheduledPendingCommands, _sentPendingCommands } = this;
    for (const pendingCommand of _scheduledPendingCommands) {
      if (!this.shouldSendMoreCommands()) break;
      _scheduledPendingCommands.delete(pendingCommand);
      _sentPendingCommands.add(pendingCommand);
      this.send(pendingCommand.command);
      pendingCommand.lastSent = this._now();
      pendingCommand.retries++;
    }
  }
  scheduleSendCommands() {
    this._sendCommandsTimer.scheduleDeadlineIn(5);
  }
  poll() {
    super.poll();
    this._sendCommandsTimer.poll();
  }
  cleanup(error2) {
    super.cleanup(error2);
    this._sendCommandsTimer.dispose();
    const subscribers = this._subscribers;
    this._subscribers = null;
    const pendingCommands = this._pendingCommands;
    this._pendingCommands = null;
    this._scheduledPendingCommands.clear();
    this._sentPendingCommands.clear();
    const e = new CloseError(error2);
    pendingCommands.forEach((pendingCommand, id) => {
      pendingCommand.handleError(e);
    });
    subscribers.forEach((cb) => {
      cb(false, e);
    });
  }
  _addSubscriber(event, callback) {
    const key = eventToKey(event);
    const subscribers = this._subscribers;
    if (subscribers.has(key)) throw new Error("Subscriber already exists.");
    subscribers.set(key, callback);
  }
  _removeSubscriber(event) {
    if (this.is_closed()) return;
    const key = eventToKey(event);
    const subscribers = this._subscribers;
    if (!subscribers.has(key)) throw new Error("Unknown subscriber.");
    subscribers.delete(key);
  }
  _getNextCommandHandle() {
    let handle;
    const pendingCommands = this._pendingCommands;
    if (pendingCommands === null) {
      throw new Error("Connection not open.");
    }
    do {
      handle = this._lastCommandHandle;
      this._lastCommandHandle = handle + 1 | 0;
    } while (pendingCommands.has(handle));
    return handle;
  }
  _estimate_next_tx_time() {
    return this._now();
  }
  find_pending_command(pdu) {
    const pendingCommands = this._pendingCommands;
    if (pdu instanceof CommandRrq) {
      return pendingCommands.get(pdu.handle);
    } else if (pdu instanceof Response2) {
      return pendingCommands.get(pdu.handle);
    } else {
      throw new Error(`Expected command or response.`);
    }
  }
  get_last_pending_command() {
    return this._pendingCommands.get(this._lastCommandHandle);
  }
  send_command(command, returnTypes, callback, stack, name) {
    const executor = (resolve, reject) => {
      const handle = this._getNextCommandHandle();
      command.handle = handle;
      const pendingCommand = new PendingCommand(
        resolve,
        reject,
        returnTypes,
        command,
        stack,
        name
      );
      this._pendingCommands.set(handle, pendingCommand);
      this._scheduledPendingCommands.add(pendingCommand);
      this.scheduleSendCommands();
    };
    if (callback) {
      executor(
        (result) => callback(true, result),
        (error2) => callback(false, error2)
      );
    } else {
      return new Promise(executor);
    }
  }
  _removePendingCommand(handle) {
    const pendingCommands = this._pendingCommands;
    const pendingCommand = pendingCommands.get(handle);
    if (!pendingCommand) return null;
    pendingCommands.delete(handle);
    if (!this._sentPendingCommands.delete(pendingCommand))
      this._scheduledPendingCommands.delete(pendingCommand);
    return pendingCommand;
  }
  incoming(pdus) {
    for (let i = 0; i < pdus.length; i++) {
      if (this._pendingCommands === null) {
        return;
      }
      const o = pdus[i];
      this.emit("receive", o);
      if (o instanceof Response2) {
        const pendingCommand = this._removePendingCommand(o.handle);
        if (pendingCommand === null) {
          if (this.is_reliable) {
            this.error(new Error("Unknown handle."));
            return;
          } else {
            continue;
          }
        }
        pendingCommand.response(o);
      } else if (o instanceof Notification || o instanceof Notification2) {
        const subscribers = this._subscribers;
        const key = eventToKey(o.event);
        const cb = subscribers.get(key);
        if (!cb) {
          continue;
        } else {
          cb(true, o);
        }
      } else if (o instanceof KeepAlive) {
        if (!(o.time > 0)) {
          throw new Error("Bad keepalive timeout.");
        }
        this.emit("keepalive", o);
      } else {
        throw new Error("Unexpected PDU");
      }
    }
  }
  /**
   * Activates keepalive handling (using set_keepalive_interval) and waits for
   * at least one keepalive packet to arrive. If no keepalive message is received,
   * the connection will be closed and the returned promise will reject.
   * @param {number} interval
   *   Keepalive interval in seconds.
   * @param {AbortSignal} [signal]
   *   Optional abort signal which can be used to abort
   *   the process.
   */
  wait_for_keepalive(interval, signal) {
    const subscriptions = new Subscriptions();
    return new Promise((resolve, reject) => {
      if (signal) {
        subscriptions.add(
          subscribeEvent(signal, "abort", () => {
            reject(signal.reason);
          })
        );
      }
      subscriptions.add(
        this.subscribe("error", (error2) => {
          reject(error2);
        }),
        this.subscribe("close", () => {
          reject(new CloseError());
        }),
        this.subscribe("keepalive", () => {
          resolve();
        })
      );
      this.set_keepalive_interval(interval);
    }).finally(() => subscriptions.unsubscribe());
  }
};

// node_modules/aes70/src/OCP1/getLengthEncoder.js
function getLengthEncoder(byteLength) {
  let setLength, getLength, maxLength;
  if (byteLength === 2) {
    setLength = function(dataView, pos, length) {
      return dataView.setUint16(pos, length);
    };
    getLength = function(dataView, pos, length) {
      return dataView.getUint16(pos);
    };
    maxLength = 65535;
  } else if (byteLength === 4) {
    setLength = function(dataView, pos, length) {
      return dataView.setUint32(pos, length);
    };
    getLength = function(dataView, pos, length) {
      return dataView.getUint32(pos);
    };
    maxLength = 4294967295;
  } else throw new TypeError("Unsupported length size.");
  return { getLength, setLength, maxLength };
}

// node_modules/aes70/src/OCP1/createBlobType.js
function createBlobType(byteLength) {
  const { setLength, getLength, maxLength } = getLengthEncoder(byteLength);
  return createType({
    isConstantLength: false,
    canEncode: function(value) {
      if (typeof value !== "object") return false;
      return value instanceof ArrayBuffer || value instanceof Uint8Array || Array.isArray(value);
    },
    encodedLength: function(value) {
      if (value instanceof ArrayBuffer) value = new Uint8Array(value);
      if (!Array.isArray(value) && !(value instanceof Uint8Array))
        throw new TypeError("Expected Array or Uint8Array");
      const length = value.length;
      if (length > maxLength)
        throw new Error("Array too long for OCP.1 encoding.");
      return byteLength + length;
    },
    encodeTo: function(dataView, pos, value) {
      if (value instanceof ArrayBuffer) value = new Uint8Array(value);
      const length = value.length;
      setLength(dataView, pos, length);
      pos += byteLength;
      const u8 = new Uint8Array(dataView.buffer, dataView.byteOffset);
      u8.set(value, pos);
      return pos + length;
    },
    decodeFrom: function(dataView, pos) {
      const length = getLength(dataView, pos);
      pos += byteLength;
      return [
        pos + length,
        new Uint8Array(dataView.buffer, dataView.byteOffset + pos, length)
      ];
    },
    decodeLength: function(dataView, pos) {
      const length = getLength(dataView, pos);
      return pos + byteLength + length;
    }
  });
}

// node_modules/aes70/src/OCP1/OcaBlob.js
var OcaBlob = createBlobType(2);

// node_modules/aes70/src/OCP1/OcaBlobFixedLen.js
function OcaBlobFixedLen(Length) {
  return createType({
    isConstantLength: true,
    canEncode: function(value) {
      if (typeof value !== "object") return false;
      return (value instanceof Uint8Array || Array.isArray(value)) && value.length === Length;
    },
    encodedLength: function(value) {
      return Length;
    },
    encodeTo: function(dataView, pos, value) {
      if (!Array.isArray(value) && !(value instanceof Uint8Array))
        throw new TypeError("Expected Array or Uint8Array");
      const length = value.length;
      if (length !== Length) throw new Error("Length mismatch.");
      const u8 = new Uint8Array(dataView.buffer, dataView.byteOffset);
      u8.set(value, pos);
      return pos + Length;
    },
    decode: function(dataView, pos) {
      return new Uint8Array(dataView.buffer, dataView.byteOffset + pos, Length);
    }
  });
}

// node_modules/aes70/src/OCP1/OcaBoolean.js
var OcaBoolean = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "boolean" || typeof value === "number";
  },
  encodedLength: function(value) {
    return 1;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setUint8(pos, value ? 1 : 0);
    return pos + 1;
  },
  decode: function(dataView, pos) {
    return dataView.getUint8(pos) !== 0;
  }
});

// node_modules/aes70/src/OCP1/OcaUint8.js
var OcaUint8 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 1;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setUint8(pos, 0 | value);
    return pos + 1;
  },
  decode: function(dataView, pos) {
    return dataView.getUint8(pos);
  }
});

// node_modules/aes70/src/OCP1/Enum.js
function Enum2(DataType, Base) {
  const encodeTo = Base.encodeTo;
  const decode = Base.decode;
  const type = createType({
    isConstantLength: true,
    encodedLength: Base.encodedLength,
    canEncode: function(value) {
      const type2 = typeof value;
      return type2 === "object" && value instanceof DataType || type2 === "string" && DataType.hasName(value) || type2 === "number" && DataType.hasValue(value);
    },
    encodeTo: function(dataView, pos, value) {
      if (typeof value === "object" && value instanceof DataType) {
        value = value.value;
      } else if (typeof value === "string") {
        value = DataType.getValue(value);
      } else if (typeof value === "number") {
        DataType.getName(value);
      } else {
        throw new TypeError("Unsupported type.");
      }
      return encodeTo(dataView, pos, value);
    },
    decode: function(dataView, pos) {
      const value = decode(dataView, pos);
      const result = new DataType(value);
      return result;
    }
  });
  for (const name in DataType.values()) {
    Object.defineProperty(type, name, {
      get: function() {
        return DataType[name];
      },
      enumerable: false,
      configurable: true
    });
  }
  return type;
}

// node_modules/aes70/src/OCP1/Enum8.js
function Enum8(DataType) {
  return Enum2(DataType, OcaUint8);
}

// node_modules/aes70/src/types/OcaDeviceGenericState.js
var OcaDeviceGenericState = class extends Enum({
  NormalOperation: 0,
  Initializaing: 1,
  Updating: 2,
  Fault: 3,
  ExpansionBase: 128
}) {
};

// node_modules/aes70/src/OCP1/OcaDeviceGenericState.js
var OcaDeviceGenericState2 = Enum8(OcaDeviceGenericState);

// node_modules/aes70/src/types/OcaDeviceOperationalState.js
var OcaDeviceOperationalState = class {
  /**
   * Operating state of device: generic state + device-specific details
   * @class OcaDeviceOperationalState
   */
  constructor(Generic, Details) {
    this.Generic = Generic;
    this.Details = Details;
  }
};

// node_modules/aes70/src/OCP1/OcaDeviceOperationalState.js
var OcaDeviceOperationalState2 = Struct(
  {
    Generic: OcaDeviceGenericState2,
    Details: OcaBlob
  },
  OcaDeviceOperationalState
);

// node_modules/aes70/src/OCP1/Bitset16.js
var Bitset16 = OcaUint16;

// node_modules/aes70/src/OCP1/OcaDeviceState.js
var OcaDeviceState = Bitset16;

// node_modules/aes70/src/OCP1/is_typed_array.js
function isTypedArray(o) {
  return ArrayBuffer.isView(o) && !(o instanceof DataView);
}

// node_modules/aes70/src/OCP1/createListType.js
function canEncode(value) {
  return Array.isArray(value) || isTypedArray(value);
}
function OcaListConstantLength(Type, byteLength) {
  const encodedLength = Type.encodedLength(void 0);
  const encodeTo = Type.encodeTo;
  const decode = Type.decode;
  const { setLength, getLength, maxLength } = getLengthEncoder(byteLength);
  return createType({
    isConstantLength: false,
    canEncode,
    encodedLength: function(value) {
      if (!canEncode(value)) throw new TypeError("Expected array.");
      const length = value.length;
      if (length > maxLength)
        throw new Error("Array too long for OcaList OCP.1 encoding");
      return byteLength + length * encodedLength;
    },
    encodeTo: function(dataView, pos, value) {
      const length = value.length;
      setLength(dataView, pos, length);
      pos += byteLength;
      for (let i = 0; i < length; i++) {
        pos = encodeTo(dataView, pos, value[i]);
      }
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const length = getLength(dataView, pos);
      pos += byteLength;
      const value = new Array(length);
      for (let i = 0; i < length; i++) {
        value[i] = decode(dataView, pos);
        pos += encodedLength;
      }
      return [pos, value];
    },
    decodeLength: function(dataView, pos) {
      const length = getLength(dataView, pos);
      pos += byteLength + length * encodedLength;
      return pos;
    }
  });
}
function OcaListDynamicLength(Type, byteLength) {
  const encodedLength = Type.encodedLength;
  const encodeTo = Type.encodeTo;
  const decodeFrom = Type.decodeFrom;
  const decodeLength = Type.decodeLength;
  const { setLength, getLength, maxLength } = getLengthEncoder(byteLength);
  return createType({
    isConstantLength: false,
    canEncode,
    encodedLength: function(value) {
      if (!canEncode(value)) throw new TypeError("Expected array.");
      const length = value.length;
      if (length > maxLength)
        throw new Error("Array too long for OcaList OCP.1 encoding");
      let result = byteLength;
      for (let i = 0; i < length; i++) {
        result += encodedLength(value[i]);
      }
      return result;
    },
    encodeTo: function(dataView, pos, value) {
      const length = value.length;
      setLength(dataView, pos, length);
      pos += byteLength;
      for (let i = 0; i < length; i++) {
        pos = encodeTo(dataView, pos, value[i]);
      }
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const length = getLength(dataView, pos);
      pos += byteLength;
      const value = new Array(length);
      for (let i = 0; i < length; i++) {
        let tmp;
        [pos, tmp] = decodeFrom(dataView, pos);
        value[i] = tmp;
      }
      return [pos, value];
    },
    decodeLength: function(dataView, pos) {
      const length = getLength(dataView, pos);
      pos += byteLength;
      for (let i = 0; i < length; i++) {
        pos = decodeLength(dataView, pos);
      }
      return pos;
    }
  });
}
function createListType(byteLength) {
  return function(Type) {
    return Type.isConstantLength ? OcaListConstantLength(Type, byteLength) : OcaListDynamicLength(Type, byteLength);
  };
}

// node_modules/aes70/src/OCP1/OcaList.js
var OcaList = createListType(2);

// node_modules/aes70/src/utf8.js
var E = new TextEncoder();
var D = new TextDecoder();
function buffer_to_utf8(a8) {
  return D.decode(a8);
}
function utf8_to_buffer(str) {
  return E.encode(str);
}
function utf8_encoded_length(str) {
  return utf8_to_buffer(str).byteLength;
}
function utf8_codepoint_length(buf, pos, codepoints) {
  const start = pos;
  while (codepoints--) {
    const c = buf.getUint8(pos);
    pos++;
    if (c <= 127) continue;
    if (c < 194) throw new Error("Invalid UTF8 sequence.");
    pos++;
    if (c <= 223) continue;
    pos++;
    if (c <= 239) continue;
    pos++;
    if (c <= 244) continue;
    throw new Error("Invalid UTF8 sequence.");
  }
  return pos - start;
}
function count_codepoints(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++, n++) {
    const c = s.charCodeAt(i);
    if (c >= 55296 && c <= 56319) {
      i++;
      const c2 = s.charCodeAt(i);
      if (c2 < 56320 || c2 > 57343)
        throw new TypeError("Expected valid unicode string.");
    }
  }
  return n;
}

// node_modules/aes70/src/OCP1/OcaString.js
var OcaString = createType({
  isConstantLength: false,
  canEncode: function(value) {
    return typeof value === "string";
  },
  encodedLength: function(value) {
    if (typeof value !== "string") throw new TypeError("Expected string.");
    return 2 + utf8_encoded_length(value);
  },
  encodeTo: function(dataView, pos, value) {
    const length = count_codepoints(value);
    if (length > 65535)
      throw new Error("String too long for OcaString OCP.1 encoding.");
    dataView.setUint16(pos, length);
    pos += 2;
    const utf8_data = new Uint8Array(utf8_to_buffer(value));
    const u8 = new Uint8Array(dataView.buffer, dataView.byteOffset);
    u8.set(utf8_data, pos);
    return pos + utf8_data.length;
  },
  decodeFrom: function(dataView, pos) {
    const codepoints = dataView.getUint16(pos);
    pos += 2;
    const length = utf8_codepoint_length(dataView, pos, codepoints);
    const utf8_data = new Uint8Array(
      dataView.buffer,
      dataView.byteOffset + pos,
      length
    );
    return [pos + length, buffer_to_utf8(utf8_data)];
  },
  decodeLength: function(dataView, pos) {
    const codepoints = dataView.getUint16(pos);
    pos += 2;
    const length = utf8_codepoint_length(dataView, pos, codepoints);
    return pos + length;
  }
});

// node_modules/aes70/src/OCP1/String16.js
var String16 = createType({
  isConstantLength: false,
  canEncode: function(value) {
    return typeof value === "string";
  },
  encodedLength: function(value) {
    if (typeof value !== "string") throw new TypeError("Expected string.");
    const length = value.length;
    if (length > 65535)
      throw new Error("Array too long for String16 OCP.1 encoding.");
    return 2 + 2 * length;
  },
  encodeTo: function(dataView, pos, value) {
    const length = value.length;
    dataView.setUint16(pos, length, false);
    pos += 2;
    for (let i = 0; i < length; i++, pos += 2) {
      dataView.setUint16(pos, value.charCodeAt(i), false);
    }
    return pos;
  },
  decodeFrom: function(dataView, pos) {
    const length = dataView.getUint16(pos, false);
    pos += 2;
    const tmp = new Array(length);
    for (let i = 0; i < length; i++, pos += 2) {
      tmp[i] = dataView.getUint16(pos, false);
    }
    return [pos, String.fromCharCode.apply(String, tmp)];
  },
  decodeLength: function(dataView, pos) {
    const length = dataView.getUint16(pos);
    return pos + 2 + 2 * length;
  }
});

// node_modules/aes70/src/types/OcaManagerDescriptor.js
var OcaManagerDescriptor = class {
  /**
   * Structure that describes a Manager instance.
   * @class OcaManagerDescriptor
   */
  constructor(ObjectNumber, Name, ClassID, ClassVersion) {
    this.ObjectNumber = ObjectNumber;
    this.Name = Name;
    this.ClassID = ClassID;
    this.ClassVersion = ClassVersion;
  }
};

// node_modules/aes70/src/OCP1/OcaManagerDescriptor.js
var OcaManagerDescriptor2 = Struct(
  {
    ObjectNumber: OcaUint32,
    Name: OcaString,
    ClassID: String16,
    ClassVersion: OcaUint16
  },
  OcaManagerDescriptor
);

// node_modules/aes70/src/types/OcaManufacturer.js
var OcaManufacturer = class {
  /**
   * Structure that describes a manufacturer.
   * @class OcaManufacturer
   */
  constructor(Name, OrganizationID, Website, BusinessContact, TechnicalContact) {
    this.Name = Name;
    this.OrganizationID = OrganizationID;
    this.Website = Website;
    this.BusinessContact = BusinessContact;
    this.TechnicalContact = TechnicalContact;
  }
};

// node_modules/aes70/src/OCP1/OcaManufacturer.js
var OcaManufacturer2 = Struct(
  {
    Name: OcaString,
    OrganizationID: OcaBlobFixedLen(3),
    Website: OcaString,
    BusinessContact: OcaString,
    TechnicalContact: OcaString
  },
  OcaManufacturer
);

// node_modules/aes70/src/types/OcaModelDescription.js
var OcaModelDescription = class {
  /**
   * Friendly description of this particular product model.
   * @class OcaModelDescription
   */
  constructor(Manufacturer, Name, Version) {
    this.Manufacturer = Manufacturer;
    this.Name = Name;
    this.Version = Version;
  }
};

// node_modules/aes70/src/OCP1/OcaModelDescription.js
var OcaModelDescription2 = Struct(
  {
    Manufacturer: OcaString,
    Name: OcaString,
    Version: OcaString
  },
  OcaModelDescription
);

// node_modules/aes70/src/types/OcaModelGUID.js
var OcaModelGUID = class {
  /**
   * @class OcaModelGUID
   */
  constructor(Reserved, MfrCode, ModelCode) {
    this.Reserved = Reserved;
    this.MfrCode = MfrCode;
    this.ModelCode = ModelCode;
  }
};

// node_modules/aes70/src/OCP1/OcaModelGUID.js
var OcaModelGUID2 = Struct(
  {
    Reserved: OcaBlobFixedLen(1),
    MfrCode: OcaBlobFixedLen(3),
    ModelCode: OcaBlobFixedLen(4)
  },
  OcaModelGUID
);

// node_modules/aes70/src/types/OcaProduct.js
var OcaProduct = class {
  /**
   * Structure that describes a Product.
   * @class OcaProduct
   */
  constructor(Name, ModelID, RevisionLevel, BrandName, UUID, Description) {
    this.Name = Name;
    this.ModelID = ModelID;
    this.RevisionLevel = RevisionLevel;
    this.BrandName = BrandName;
    this.UUID = UUID;
    this.Description = Description;
  }
};

// node_modules/aes70/src/OCP1/OcaProduct.js
var OcaProduct2 = Struct(
  {
    Name: OcaString,
    ModelID: OcaString,
    RevisionLevel: OcaString,
    BrandName: OcaString,
    UUID: OcaString,
    Description: OcaString
  },
  OcaProduct
);

// node_modules/aes70/src/types/OcaResetCause.js
var OcaResetCause = class extends Enum({
  PowerOn: 0,
  InternalError: 1,
  Upgrade: 2,
  ExternalRequest: 3,
  Unknown: 255
}) {
};

// node_modules/aes70/src/OCP1/OcaResetCause.js
var OcaResetCause2 = Enum8(OcaResetCause);

// node_modules/aes70/src/controller/base_event.js
var EventSubscriber = class {
  constructor(callback, failure_callback) {
    this.callback = callback;
    this.failure_callback = failure_callback;
  }
  emit(ctx, results) {
    try {
      this.callback.apply(ctx, results);
    } catch (error2) {
      console.error("Exception thrown by event handler: ", error2);
    }
  }
  emit_error(ctx, error2) {
    if (this.failure_callback) {
      try {
        this.failure_callback.call(ctx, error2);
      } catch (e) {
        console.error("Exception thrown by error event handler: ", e);
      }
    } else {
      if (error2 instanceof CloseError) return;
      console.warn("No handler for error", error2);
    }
  }
};
var BaseEvent = class {
  constructor(object, id, argumentTypes) {
    this.object = object;
    this.id = id;
    this.subscribers = [];
    this.result = null;
    this.argumentTypes = argumentTypes;
  }
  has_subscribers() {
    return this.subscribers.length > 0;
  }
  emit(results) {
    this.subscribers.forEach((subscriber) => {
      subscriber.emit(this.object, results);
    });
  }
  emit_error(error2) {
    this.subscribers.forEach((subscriber) => {
      subscriber.emit_error(this.object, error2);
    });
    this.subscribers.splice(0, this.subscribers.length);
  }
  GetOcaEvent() {
    return new OcaEvent(this.object.ObjectNumber, this.id);
  }
  do_subscribe() {
  }
  do_unsubscribe() {
  }
  _remove_subscriber(index) {
    this.subscribers.splice(index, 1);
    if (!this.subscribers.length) this.do_unsubscribe();
  }
  /**
   * Subscribe to this event.
   * @param {function} callback
   */
  subscribe(callback, failure_callback) {
    const subscriber = new EventSubscriber(callback, failure_callback);
    this.subscribers.push(subscriber);
    if (this.subscribers.length === 1) {
      this.do_subscribe();
    }
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index === -1) return;
      this._remove_subscriber(index);
    };
  }
  /**
   * Unsubscribe from this event.
   * @param {function} callback
   * @deprecated Use the cleanup handler returned from
   *  subscriber() instead.
   */
  unsubscribe(callback) {
    const index = this.subscribers.findIndex(
      (subscriber) => subscriber.callback == callback
    );
    if (index === -1) {
      throw new Error("Subscriber does not exist.");
    }
    this._remove_subscriber(index);
  }
};

// node_modules/aes70/src/controller/notification_error.js
var OcaNotificationExceptionType = class extends Enum({
  Unspecified: 0,
  // Device canceled subscription
  CanceledByDevice: 1,
  // Object was deleted
  ObjectDeleted: 2,
  // Something went wrong in the Device.
  DeviceError: 3
}) {
};
var OcaNotificationExceptionTypeDecoder = Enum8(OcaNotificationExceptionType);
function parseNotificationExceptionData(buffer) {
  const view = new DataView(buffer);
  let pos = 0;
  let type, try_again, data;
  [pos, type] = OcaNotificationExceptionTypeDecoder.decodeFrom(view, pos);
  [pos, try_again] = OcaBoolean.decodeFrom(view, pos);
  [pos, data] = OcaBlob.decodeFrom(view, pos);
  return [type, try_again, data];
}
var NotificationError = class extends Error {
  constructor(notification) {
    super(`Notification failed with an exception.`);
    this.name = "aes70.NotificationError";
    this.notification = notification;
    try {
      const [type, try_again, data] = parseNotificationExceptionData(
        notification.parameters
      );
      this.type = type;
      this.try_again = try_again;
      this.data = data;
    } catch (_error) {
      console.error("Failed to decode notification exception data.");
      this.type = OcaNotificationExceptionType.Unspecified;
      this.try_again = false;
      this.data = null;
    }
  }
  is_object_deleted() {
    this.type === OcaNotificationExceptionType.ObjectDeleted;
  }
};

// node_modules/aes70/src/controller/event.js
var emptyBuffer = new ArrayBuffer();
var Event = class extends BaseEvent {
  constructor(object, id, argumentTypes) {
    super(object, id, argumentTypes);
    this.callback = (ok, notification) => {
      if (!ok) {
        this.emit_error(notification);
        return;
      }
      if (!this.has_subscribers()) return;
      if (notification.exception) {
        this.emit_error(new NotificationError(notification));
        return;
      }
      const args = new Array(argumentTypes.length);
      const data = new DataView(notification.parameters || emptyBuffer);
      for (let pos = 0, i = 0; i < argumentTypes.length; i++) {
        let tmp;
        [pos, tmp] = argumentTypes[i].decodeFrom(data, pos);
        args[i] = tmp;
      }
      this.emit(args);
    };
  }
  do_subscribe() {
    this.object.device.add_subscription(this.GetOcaEvent(), this.callback);
  }
  do_unsubscribe() {
    this.object.device.remove_subscription(this.GetOcaEvent(), this.callback);
  }
};

// node_modules/aes70/src/controller/property_event.js
var PropertyEvent = class extends BaseEvent {
  constructor(object, id, propertyType) {
    super(object, id, propertyType);
    this.callback = ([id2, dataView, changeType]) => {
      if (id2.DefLevel !== this.id.DefLevel || id2.PropertyIndex !== this.id.PropertyIndex)
        return;
      const value = propertyType[0].decodeFrom(dataView, 0)[1];
      this.emit([value, changeType, id2]);
    };
    this.error_callback = (error2) => {
      this.emit_error(error2);
    };
    this._unsubscribe = null;
  }
  do_subscribe() {
    this._unsubscribe = this.object.OnPropertyChanged.subscribe(
      this.callback,
      this.error_callback
    );
  }
  do_unsubscribe() {
    const unsubscribe = this._unsubscribe;
    if (!unsubscribe) return;
    this._unsubscribe = null;
    try {
      unsubscribe();
    } catch (error2) {
      console.error("Unsubscribing PropertyChanged event failed: ", error2);
    }
  }
};

// node_modules/aes70/src/controller/observeProperty.js
function observeProperty(o, property, callback) {
  let propertyName;
  if (typeof property === "string") {
    propertyName = property;
    property = o.get_properties().find_property(propertyName);
    if (!property)
      throw new Error(
        `Could not find property ${propertyName} in ${o.ClassName}`
      );
  } else {
    propertyName = property.name;
  }
  if (property.static) {
    callback(true, o[propertyName]);
    return () => {
    };
  }
  let lastValue = null;
  const notify = (changeIndex) => {
    try {
      callback(true, lastValue, changeIndex);
    } catch (error2) {
      console.error(
        "Subscriber",
        callback,
        "to property",
        propertyName,
        "in",
        o,
        "threw exception",
        error2
      );
    }
  };
  const eventCallback = (value, changeType, eventId) => {
    if (lastValue === null) return;
    switch (changeType.value) {
      case 1:
        if (lastValue instanceof Arguments) {
          lastValue.values[0] = value;
          notify(0);
          return;
        } else {
          lastValue = value;
          notify();
          return;
        }
        break;
      case 2:
        if (lastValue instanceof Arguments) {
          lastValue.values[1] = value;
          notify(1);
          return;
        }
        break;
      case 3:
        if (lastValue instanceof Arguments) {
          lastValue.values[2] = value;
          notify(2);
          return;
        }
        break;
      default:
        break;
    }
    console.warn("Unhandled event", value, changeType, eventId);
  };
  const errorCallback = (error2) => {
    callback(false, error2);
  };
  let active = true;
  const event = property.event(o);
  const getter = property.getter(o);
  if (!getter) {
    throw new Error(`No getter found for ${propertyName} in ${o.ClassName}`);
  }
  let unsubscribe = null;
  if (event) {
    unsubscribe = event.subscribe(eventCallback, errorCallback);
  }
  getter((ok, result) => {
    if (!active) return;
    if (!ok) {
      callback(false, result);
    } else {
      lastValue = result;
      notify();
    }
  });
  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

// node_modules/aes70/src/controller/property_sync.js
var PropertySync = class {
  init(o) {
    this.o = o;
    this.values = [];
    this.synchronized = false;
    this.subscriptions = [];
  }
  /**
   * Starts synchronizing the properties in this object with the corresponding
   * ones in the remote instance.
   *
   * @returns {Promise<void>}
   */
  sync() {
    if (this.synchronized) return Promise.resolve();
    let i = 0;
    const tasks = [];
    this.o.get_properties().forEach((prop) => {
      const getter = prop.getter(this.o);
      if (!getter) return;
      const index = i++;
      const task = new Promise((resolve, reject) => {
        const unsubscribe = observeProperty(this.o, prop, (ok, result) => {
          if (ok) {
            this.values[index] = result instanceof Arguments ? result.item(0) : result;
            resolve();
          } else if (result instanceof RemoteError) {
            resolve();
          }
        });
        this.subscriptions.push(unsubscribe);
      });
      tasks.push(task);
    });
    return Promise.all(tasks);
  }
  /**
   * Iterate over all properties.
   *
   * @param {Function} cb - Callback functions, Will be called with value and
   *                        property name as arguments.
   * @param {Object} ctx - The context to call the callback in. Defaults to
   *                       this.
   */
  forEach(cb, ctx) {
    let index = 0;
    if (!ctx) ctx = this;
    this.o.get_properties().forEach((prop) => {
      const getter = prop.getter(this.o);
      if (!getter) return;
      cb.call(ctx, this.values[index], prop.name);
      index++;
    });
  }
  /**
   * Dispose of this object. Will unsubscribe all event handlers.
   */
  Dispose() {
    this.o = null;
    this.subscriptions.forEach((cb) => cb());
    this.subscriptions = null;
  }
};

// node_modules/aes70/src/types/OcaPropertyID.js
var OcaPropertyID = class {
  /**
   * Representation of an OCA property ID. A class may define at most 255
   * properties of its own. Additional properties may be inherited, so the total
   * number may exceed 255.
   * @class OcaPropertyID
   */
  constructor(DefLevel, PropertyIndex) {
    this.DefLevel = DefLevel;
    this.PropertyIndex = PropertyIndex;
  }
};

// node_modules/aes70/src/controller/properties.js
var Properties = class {
  constructor(properties, level, parent) {
    const N = /* @__PURE__ */ new Map();
    const P = [];
    this.by_name = N;
    this.parent = parent;
    this.properties = P;
    this.level = level;
    for (let i = 0; i < properties.length; i++) {
      const p = properties[i];
      N.set(p.name, p);
      P[p.index] = p;
      if (p.aliases) {
        const aliases = p.aliases;
        for (let j = 0; j < aliases.length; j++) {
          N.set(aliases[j], p);
        }
      }
    }
  }
  /**
   * Find a property.
   *
   * @param {String|OcaPropertyID} id The property identifier. Either a name
   *    or a :class:`OcaPropertyID`.
   */
  find_property(id) {
    if (id instanceof OcaPropertyID) {
      if (id.DefLevel == this.level) {
        return this.properties[id.PropertyIndex];
      } else if (this.parent) {
        return this.parent.find_property(id);
      }
    } else if (typeof id === "string") {
      const p = this.by_name.get(id);
      if (p) return p;
      if (this.parent) return this.parent.find_property(id);
    } else throw new Error("Expected PropertyID");
  }
  find_name(id) {
    const p = this.find_property(id);
    if (p) return p.name;
  }
  /**
   * Iterate all properties.
   *
   * @param {Function} callback
   *    Function to be called with each
   *    :class:`Property` as only argument.
   * @param {Object} [ctx]
   *    Optional context to call function in.
   */
  forEach(cb, ctx) {
    const ret = this.parent ? this.parent.forEach(cb, ctx) : [];
    const P = this.properties;
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (p !== void 0) ret.push(cb.call(ctx, p));
    }
    return ret;
  }
};

// node_modules/aes70/src/OCP1/makeEncoder.js
function makeEncoder(name) {
  throw new Error("Not implemented.");
}

// node_modules/aes70/src/controller/property.js
var Property = class {
  constructor(name, type, level, index, readonly, is_static, aliases, accessors) {
    this.name = name;
    this.type = type;
    this.level = level;
    this.index = index;
    this.readonly = readonly;
    this.static = is_static;
    this.aliases = aliases;
    if (!aliases && !accessors && !is_static) {
      accessors = { get: "Get" + name };
    }
    this.accessors = accessors;
  }
  /**
   * Returns the OcaPropertyID of this property.
   */
  GetPropertyID() {
    return new OcaPropertyID(this.level, this.index);
  }
  /**
   * Returns the name of this property.
   */
  GetName() {
    return this.name;
  }
  /**
   * Returns the getter for this property in o.
   *
   * @param {Object} o - The remote object.
   * @param {boolean} [no_bind=false] - If true, the returned function is not
   *                                    bound to the object o.
   * @returns {Function} The getter. If none could be found, null is returned.
   */
  getter(o, no_bind) {
    const name = this.name;
    const aliases = this.aliases;
    const accessors = this.accessors;
    if (accessors) {
      const get = accessors.get;
      if (!get) return null;
      let fun;
      if (typeof get === "string") {
        fun = o[get];
      } else if (typeof get === "object") {
        const { name: name2, index } = get;
        if (index >= 0) {
          fun = function(callback) {
            if (typeof callback === "function") {
              this[name2]((ok, result) => {
                if (ok) {
                  result = result.item(index);
                }
                callback(ok, result);
              });
            } else {
              return this[name2]().then((result) => result.item(index));
            }
          };
        } else {
          fun = o[name2];
        }
      } else {
        throw new Error(`Unexpected accessor.`);
      }
      if (!fun) return null;
      return no_bind ? fun : fun.bind(o);
    }
    const possibleNames = aliases ? [name, ...aliases] : [name];
    for (const possibleName of possibleNames) {
      if (this.static) {
        const c = o.constructor;
        const v = c[possibleName];
        if (v !== void 0) {
          return function() {
            return Promise.resolve(v);
          };
        }
      } else {
        const fun = o["Get" + possibleName];
        if (fun) return no_bind ? fun : fun.bind(o);
      }
    }
    return null;
  }
  /**
   * Returns the setter for this property in o.
   *
   * @param {Object} o - The remote object.
   * @param {boolean} [no_bind=false] - If true, the returned function is not
   *                                    bound to the object o.
   * @returns {Function} The setter. If none could be found, null is returned.
   */
  setter(o, no_bind) {
    if (this.readonly || this.static) return null;
    const name = this.name;
    const aliases = this.aliases;
    const possibleNames = aliases ? [name, ...aliases] : [name];
    for (const possibleName of possibleNames) {
      const fun = o["Set" + possibleName];
      if (fun) return no_bind ? fun : fun.bind(o);
    }
    return null;
  }
  /**
   * Returns the event for this property in o.
   *
   * @returns {PropertyEvent} The event.
   */
  event(o) {
    let name = this.name, i = 0;
    const aliases = this.aliases;
    do {
      const event = o["On" + name + "Changed"];
      if (event) return event;
      if (aliases && i < aliases.length) {
        name = aliases[i++];
        continue;
      }
    } while (false);
    return null;
  }
  /**
   * Subscribe to changes of this property in o. If successful, the callback will be called at least
   * once with the initial value.
   *
   * @param {Object} o - The remote object.
   * @param {Function} cb - The callback.
   * @returns {boolean} Returns true if the property could be subscribed.
   */
  subscribe(o, cb) {
    const event = this.event(o);
    const getter = this.getter(o);
    if (event) event.subscribe(cb).catch(error);
    if (getter) getter().then(cb, error);
    if (event) return event;
    return !!getter;
  }
};

// node_modules/aes70/src/controller/make_control_class.js
function createPropertySync(control_class) {
  const o = Object.create(PropertySync.prototype);
  const blue_print = Object.create(control_class.prototype);
  let index = 0;
  control_class.get_properties().forEach((prop) => {
    const has_setter = !!prop.setter(blue_print, true);
    const has_getter = !!prop.getter(blue_print, true);
    const make_getter = function(i) {
      return function() {
        return this.values[i];
      };
    };
    const make_setter = function(setter) {
      return function(val) {
        setter.call(this.o, val);
        return val;
      };
    };
    if (!has_getter) return;
    const descriptor = {
      enumerable: true,
      get: make_getter(index)
    };
    if (has_setter) descriptor.set = make_setter(prop.setter(blue_print, true));
    Object.defineProperty(o, prop.name, descriptor);
    if (prop.aliases) {
      prop.aliases.forEach((alias) => {
        Object.defineProperty(o, alias, descriptor);
      });
    }
    index++;
  });
  const constructor = function(o2) {
    this.init(o2);
  };
  constructor.prototype = o;
  return constructor;
}
function implement_method(cls, method) {
  if (!method || !method.length) return;
  const [name, level, index, argumentTypes, returnTypes, aliases] = method;
  const debugName = `${cls.ClassName}.${name}`;
  cls.prototype[name] = function(...args) {
    const argumentCount = argumentTypes.length;
    let callback = null;
    if (argumentCount < args.length) {
      if (argumentCount + 1 === args.length && typeof args[argumentCount] === "function") {
        callback = args[argumentCount];
        args.length = argumentCount;
      }
    }
    const cmd = new CommandRrq(
      this.ono,
      level,
      index,
      argumentCount,
      new EncodedArguments(argumentTypes, args)
    );
    return this.device.send_command(cmd, returnTypes, callback, debugName);
  };
  if (aliases) {
    aliases.forEach((alias) => {
      cls.prototype[alias] = function(...args) {
        return this[name](...args);
      };
    });
  }
}
function implement_event(cls, event) {
  const [name, level, index, argumentTypes] = event;
  Object.defineProperty(cls.prototype, "On" + name, {
    get: function() {
      const ev_name = "_On" + name;
      const event2 = this[ev_name];
      if (event2) return event2;
      return this[ev_name] = new Event(
        this,
        new OcaEventID(level, index),
        argumentTypes
      );
    }
  });
}
function property_event_name(propertyName) {
  return "On" + propertyName + "Changed";
}
function implement_property_event(cls, property) {
  if (property.static) return;
  if (property.name === "ObjectNumber") return;
  const event_name = property_event_name(property.name);
  Object.defineProperty(cls.prototype, event_name, {
    get: function() {
      const ev_name = "_" + event_name;
      const event = this[ev_name];
      if (event) return event;
      return this[ev_name] = new PropertyEvent(
        this,
        new OcaPropertyID(property.level, property.index),
        property.type
      );
    }
  });
  if (property.aliases) {
    property.aliases.forEach((alias) => {
      const ev_name = property_event_name(alias);
      if (cls.prototype[ev_name]) return;
      Object.defineProperty(cls.prototype, ev_name, {
        get: function() {
          return this[event_name];
        }
      });
    });
  }
}
function make_property(o) {
  if (typeof o === "object" && o instanceof Property) return o;
  if (Array.isArray(o)) {
    if (typeof o[1] !== "object") o[1] = makeEncoder(o[1]);
    return new Property(...o);
  }
  throw new Error("Bad property.");
}
function make_control_class(name, level, class_id, class_version, base, methods, properties, events) {
  let property_sync = null;
  let _properties = null;
  properties = properties.map((v) => make_property(v));
  const cls = class extends base {
    static get ClassID() {
      return class_id;
    }
    static get ClassVersion() {
      return class_version;
    }
    static get ClassName() {
      return name;
    }
    static get_properties() {
      if (_properties === null)
        _properties = new Properties(properties, level, base.get_properties());
      return _properties;
    }
    static GetPropertySync() {
      if (property_sync === null) property_sync = createPropertySync(this);
      return property_sync;
    }
    constructor(device, ono) {
      super(device, ono);
      for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        this["_On" + prop.name + "Changed"] = null;
      }
      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        this["_On" + ev[0]] = null;
      }
    }
    Dispose() {
      super.Dispose();
      for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        const event = this["_On" + prop.name + "Changed"];
        if (event) event.Dispose();
      }
      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        const event = this["_On" + ev[0]];
        if (event) event.Dispose();
      }
    }
  };
  for (let i = 0; i < methods.length; i++) implement_method(cls, methods[i]);
  for (let i = 0; i < properties.length; i++)
    implement_property_event(cls, properties[i]);
  for (let i = 0; i < events.length; i++) implement_event(cls, events[i]);
  return cls;
}

// node_modules/aes70/src/types/OcaClassIdentification.js
var OcaClassIdentification = class {
  /**
   * @class OcaClassIdentification
   */
  constructor(ClassID, ClassVersion) {
    this.ClassID = ClassID;
    this.ClassVersion = ClassVersion;
  }
};

// node_modules/aes70/src/OCP1/OcaClassIdentification.js
var OcaClassIdentification2 = Struct(
  {
    ClassID: String16,
    ClassVersion: OcaUint16
  },
  OcaClassIdentification
);

// node_modules/aes70/src/types/OcaLockState.js
var OcaLockState = class extends Enum({
  NoLock: 0,
  LockNoWrite: 1,
  LockNoReadWrite: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaLockState.js
var OcaLockState2 = Enum8(OcaLockState);

// node_modules/aes70/src/OCP1/OcaPropertyID.js
var OcaPropertyID2 = Struct(
  {
    DefLevel: OcaUint16,
    PropertyIndex: OcaUint16
  },
  OcaPropertyID
);

// node_modules/aes70/src/types/OcaPropertyChangeType.js
var OcaPropertyChangeType = class extends Enum({
  CurrentChanged: 1,
  MinChanged: 2,
  MaxChanged: 3,
  ItemAdded: 4,
  ItemChanged: 5,
  ItemDeleted: 6
}) {
};

// node_modules/aes70/src/OCP1/OcaPropertyChangeType.js
var OcaPropertyChangeType2 = Enum8(OcaPropertyChangeType);

// node_modules/aes70/src/OCP1/RestWithOffset.js
function RestWithOffset(offset) {
  return createType({
    isConstantLength: false,
    canEncode: function(value) {
      return typeof value === "object" && value instanceof DataView;
    },
    encodedLength: function(value) {
      if (!(typeof value === "object" && value instanceof DataView))
        throw new TypeError("Expected DataView.");
      return value.byteLength - offset;
    },
    encodeTo: function(dataView, pos, value) {
      const length = value.byteLength;
      const src = new Uint8Array(value.buffer, value.byteOffset, length);
      const dst = new Uint8Array(dataView.buffer, dataView.byteOffset + pos);
      dst.set(src);
      return pos + length;
    },
    decodeFrom: function(dataView, pos) {
      const length = dataView.byteLength - pos - offset;
      return [
        pos + length,
        new DataView(dataView.buffer, dataView.byteOffset + pos, length)
      ];
    },
    decodeLength: function(dataView, pos) {
      const length = dataView.byteLength - pos - offset;
      return pos + length;
    }
  });
}

// node_modules/aes70/src/OCP1/Tuple.js
function Tuple(...Types) {
  const Length = Types.length;
  return createType({
    isConstantLength: false,
    canEncode: function(value) {
      return Array.isArray(value) || isTypedArray(value);
    },
    encodedLength: function(value) {
      if (!(Array.isArray(value) || isTypedArray(value)))
        throw new TypeError("Expected array.");
      if (value.length !== Length) throw new Error("Length mismatch.");
      let length = 0;
      for (let i = 0; i < Length; i++) {
        length += Types[i].encodedLength(value[i]);
      }
      return length;
    },
    encodeTo: function(dataView, pos, value) {
      for (let i = 0; i < Length; i++) {
        pos = Types[i].encodeTo(dataView, pos, value[i]);
      }
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const result = new Array(Length);
      for (let i = 0; i < Length; i++) {
        let tmp;
        [pos, tmp] = Types[i].decodeFrom(dataView, pos);
        result[i] = tmp;
      }
      return [pos, result];
    },
    decodeLength: function(dataView, pos) {
      for (let i = 0; i < Length; i++) {
        pos = Types[i].decodeLength(dataView, pos);
      }
      return pos;
    }
  });
}

// node_modules/aes70/src/OCP1/OcaPropertyChangedEventData.js
var OcaPropertyChangedEventData = Tuple(
  OcaPropertyID2,
  RestWithOffset(1),
  OcaPropertyChangeType2
);

// node_modules/aes70/src/controller/object_base.js
var ObjectBase = class {
  constructor(ObjectNumber, device) {
    this.ono = ObjectNumber;
    this.device = device;
  }
  /**
   * The ObjectNumber of this object.
   */
  get ObjectNumber() {
    return this.ono;
  }
  /**
   * The ClassVersion of this object. This is a local property.
   */
  get ClassVersion() {
    return this.constructor.ClassVersion;
  }
  /**
   * The ClassVersion of this object. This is a local property.
   */
  get ClassID() {
    return this.constructor.ClassID;
  }
  /**
   * The name of the class of this object. This is a local property.
   */
  get ClassName() {
    return this.constructor.ClassName;
  }
  sendCommandRrq(method_level, method_index, param_count, parameters, rs) {
    const cmd = new CommandRrq(
      this.ono,
      method_level,
      method_index,
      param_count,
      parameters
    );
    return this.device.send_command(cmd, rs);
  }
  /**
   * Get the name of a given OcaPropertyID.
   * @param {Types/OcaPropertyID} id
   * @return {string}
   */
  GetPropertyName(id) {
    return this.get_properties().find_name(id);
  }
  /**
   * Get the OcaPropertyID for a given name.
   * @param {String} name
   * @return {OcaPropertyID}
   */
  GetPropertyID(name) {
    const p = this.get_properties().find_property(name);
    if (p) return p.GetPropertyID();
  }
  static get_properties() {
    return null;
  }
  /**
   * Returns an instance of :class:`Properties` for this remote object.
   */
  get_properties() {
    return this.constructor.get_properties();
  }
  get __oca_properties__() {
    return this.get_properties();
  }
  /**
   * Returns an instance of :class:`PropertySync` for this remote object.
   */
  GetPropertySync() {
    const p = this.constructor.GetPropertySync();
    return new p(this);
  }
  Dispose() {
  }
};

// node_modules/aes70/src/controller/ControlClasses/OcaRoot.js
var OcaRoot = make_control_class(
  "OcaRoot",
  1,
  "",
  3,
  ObjectBase,
  [
    ["GetClassIdentification", 1, 1, [], [OcaClassIdentification2]],
    ["GetLockable", 1, 2, [], [OcaBoolean]],
    ["SetLockNoReadWrite", 1, 3, [], [], ["LockTotal"]],
    ["Unlock", 1, 4, [], []],
    ["GetRole", 1, 5, [], [OcaString]],
    ["SetLockNoWrite", 1, 6, [], [], ["LockReadOnly"]],
    ["GetLockState", 1, 7, [], [OcaLockState2]]
  ],
  [
    ["ClassID", [String16], 1, 1, true, true, null],
    ["ClassVersion", [OcaUint16], 1, 2, true, true, null],
    ["ObjectNumber", [OcaUint32], 1, 3, true, false, null],
    ["Lockable", [OcaBoolean], 1, 4, true, false, null],
    ["Role", [OcaString], 1, 5, true, false, null],
    ["LockState", [OcaLockState2], 1, 6, false, false, null]
  ],
  [["PropertyChanged", 1, 1, [OcaPropertyChangedEventData]]]
);

// node_modules/aes70/src/controller/ControlClasses/OcaManager.js
var OcaManager = make_control_class(
  "OcaManager",
  2,
  "",
  3,
  OcaRoot,
  [],
  [],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaDeviceManager.js
var OcaDeviceManager = make_control_class(
  "OcaDeviceManager",
  3,
  "",
  3,
  OcaManager,
  [
    ["GetOcaVersion", 3, 1, [], [OcaUint16]],
    ["GetModelGUID", 3, 2, [], [OcaModelGUID2]],
    ["GetSerialNumber", 3, 3, [], [OcaString]],
    ["GetDeviceName", 3, 4, [], [OcaString]],
    ["SetDeviceName", 3, 5, [OcaString], []],
    ["GetModelDescription", 3, 6, [], [OcaModelDescription2]],
    ["GetDeviceRole", 3, 7, [], [OcaString]],
    ["SetDeviceRole", 3, 8, [OcaString], []],
    ["GetUserInventoryCode", 3, 9, [], [OcaString]],
    ["SetUserInventoryCode", 3, 10, [OcaString], []],
    ["GetEnabled", 3, 11, [], [OcaBoolean]],
    ["SetEnabled", 3, 12, [OcaBoolean], []],
    ["GetState", 3, 13, [], [OcaDeviceState]],
    ["SetResetKey", 3, 14, [OcaBlobFixedLen(16), OcaBlob], []],
    ["GetResetCause", 3, 15, [], [OcaResetCause2]],
    ["ClearResetCause", 3, 16, [], []],
    ["GetMessage", 3, 17, [], [OcaString]],
    ["SetMessage", 3, 18, [OcaString], []],
    ["GetManagers", 3, 19, [], [OcaList(OcaManagerDescriptor2)]],
    ["GetDeviceRevisionID", 3, 20, [], [OcaString]],
    ["GetManufacturer", 3, 21, [], [OcaManufacturer2]],
    ["GetProduct", 3, 22, [], [OcaProduct2]],
    ["GetOperationalState", 3, 23, [], [OcaDeviceOperationalState2]],
    ["GetLoggingEnabled", 3, 24, [], [OcaBoolean]],
    ["SetLoggingEnabled", 3, 25, [OcaBoolean], []],
    ["GetMostRecentPatchDatasetONo", 3, 26, [], [OcaUint32]],
    ["ApplyPatch", 3, 27, [OcaUint32], []]
  ],
  [
    ["ModelGUID", [OcaModelGUID2], 3, 1, false, false, null],
    ["SerialNumber", [OcaString], 3, 2, true, false, null],
    ["ModelDescription", [OcaModelDescription2], 3, 3, false, false, null],
    ["DeviceName", [OcaString], 3, 4, false, false, null],
    ["OcaVersion", [OcaUint16], 3, 5, true, false, null],
    ["DeviceRole", [OcaString], 3, 6, false, false, ["Role"]],
    ["UserInventoryCode", [OcaString], 3, 7, false, false, null],
    ["ControlEnabled", [OcaBoolean], 3, 8, false, false, ["Enabled"]],
    ["State", [OcaDeviceState], 3, 9, false, false, null],
    ["Busy", [OcaBoolean], 3, 10, false, false, null],
    ["ResetCause", [OcaResetCause2], 3, 11, true, false, null],
    ["Message", [OcaString], 3, 12, false, false, null],
    ["Managers", [OcaList(OcaManagerDescriptor2)], 3, 13, false, false, null],
    ["DeviceRevisionID", [OcaString], 3, 14, true, false, null],
    ["Manufacturer", [OcaManufacturer2], 3, 15, true, false, null],
    ["Product", [OcaProduct2], 3, 16, true, false, null],
    [
      "OperationalState",
      [OcaDeviceOperationalState2],
      3,
      17,
      false,
      false,
      null
    ],
    ["LoggingEnabled", [OcaBoolean], 3, 18, false, false, null],
    ["MostRecentPatchDatasetONo", [OcaUint32], 3, 19, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaSecurityManager.js
var OcaSecurityManager = make_control_class(
  "OcaSecurityManager",
  3,
  "",
  3,
  OcaManager,
  [
    ["EnableControlSecurity", 3, 1, [], []],
    ["DisableControlSecurity", 3, 2, [], []],
    ["ChangePreSharedKey", 3, 3, [OcaString, OcaBlob], []],
    ["AddPreSharedKey", 3, 4, [OcaString, OcaBlob], []],
    ["DeletePreSharedKey", 3, 5, [OcaString], []]
  ],
  [["secureControlData", [OcaBoolean], 3, 1, false, false, null]],
  []
);

// node_modules/aes70/src/OCP1/Enum16.js
function Enum16(DataType) {
  return Enum2(DataType, OcaUint16);
}

// node_modules/aes70/src/types/OcaComponent.js
var OcaComponent = class extends Enum({
  BootLoader: 0
}) {
};

// node_modules/aes70/src/OCP1/OcaComponent.js
var OcaComponent2 = Enum16(OcaComponent);

// node_modules/aes70/src/types/OcaVersion.js
var OcaVersion = class {
  /**
   * Representation of a version number of a (hardware/software) component of a
   * device in the form of Major.Minor.Build (e.g. 1.0.123).
   * @class OcaVersion
   */
  constructor(Major, Minor, Build, Component) {
    this.Major = Major;
    this.Minor = Minor;
    this.Build = Build;
    this.Component = Component;
  }
};

// node_modules/aes70/src/OCP1/OcaVersion.js
var OcaVersion2 = Struct(
  {
    Major: OcaUint32,
    Minor: OcaUint32,
    Build: OcaUint32,
    Component: OcaComponent2
  },
  OcaVersion
);

// node_modules/aes70/src/controller/ControlClasses/OcaFirmwareManager.js
var OcaFirmwareManager = make_control_class(
  "OcaFirmwareManager",
  3,
  "",
  3,
  OcaManager,
  [
    ["GetComponentVersions", 3, 1, [], [OcaList(OcaVersion2)]],
    ["StartUpdateProcess", 3, 2, [], []],
    ["BeginActiveImageUpdate", 3, 3, [OcaComponent2], []],
    ["AddImageData", 3, 4, [OcaUint32, OcaBlob], []],
    ["VerifyImage", 3, 5, [OcaBlob], []],
    ["EndActiveImageUpdate", 3, 6, [], []],
    [
      "BeginPassiveComponentUpdate",
      3,
      7,
      [OcaComponent2, OcaBlob, OcaString],
      []
    ],
    ["EndUpdateProcess", 3, 8, [], []]
  ],
  [["ComponentVersions", [OcaList(OcaVersion2)], 3, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaMethodID.js
var OcaMethodID = class {
  /**
   * Representation of an OCA method ID. A class may define at most 255 methods
   * of its own. Additional methods may be inherited, so the total number may
   * exceed 255.
   * @class OcaMethodID
   */
  constructor(DefLevel, MethodIndex) {
    this.DefLevel = DefLevel;
    this.MethodIndex = MethodIndex;
  }
};

// node_modules/aes70/src/OCP1/OcaMethodID.js
var OcaMethodID2 = Struct(
  {
    DefLevel: OcaUint16,
    MethodIndex: OcaUint16
  },
  OcaMethodID
);

// node_modules/aes70/src/types/OcaMethod.js
var OcaMethod = class {
  /**
   * Representation of an OCA method, i.e. the unique combination of an ONo and
   * a MethodID. To denote the absence of a method, all field values shall be
   * zero. Such a value is called the *Null Method Identifier*.
   * @class OcaMethod
   */
  constructor(ONo, MethodID) {
    this.ONo = ONo;
    this.MethodID = MethodID;
  }
};

// node_modules/aes70/src/OCP1/OcaMethod.js
var OcaMethod2 = Struct(
  {
    ONo: OcaUint32,
    MethodID: OcaMethodID2
  },
  OcaMethod
);

// node_modules/aes70/src/types/OcaNotificationDeliveryMode.js
var OcaNotificationDeliveryMode = class extends Enum({
  Normal: 1,
  Lightweight: 2,
  Reliable: 1,
  Fast: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaNotificationDeliveryMode.js
var OcaNotificationDeliveryMode2 = Enum8(OcaNotificationDeliveryMode);

// node_modules/aes70/src/types/OcaObjectListEventData.js
var OcaObjectListEventData = class {
  /**
   * Notification data supplied by events returning object lists, for example
   * the **SynchronizeState** event defined in **OcaSubscriptionManager.**
   * @class OcaObjectListEventData
   */
  constructor(objectList) {
    this.objectList = objectList;
  }
};

// node_modules/aes70/src/OCP1/OcaObjectListEventData.js
var OcaObjectListEventData2 = Struct(
  {
    objectList: OcaList(OcaUint32)
  },
  OcaObjectListEventData
);

// node_modules/aes70/src/OCP1/OcaStatus.js
var OcaStatus2 = Enum8(OcaStatus);

// node_modules/aes70/src/types/OcaSubscriptionManagerState.js
var OcaSubscriptionManagerState = class extends Enum({
  Normal: 1,
  EventsDisabled: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaSubscriptionManagerState.js
var OcaSubscriptionManagerState2 = Enum8(OcaSubscriptionManagerState);

// node_modules/aes70/src/controller/ControlClasses/OcaSubscriptionManager.js
var OcaSubscriptionManager = make_control_class(
  "OcaSubscriptionManager",
  3,
  "",
  4,
  OcaManager,
  [
    [
      "AddSubscription",
      3,
      1,
      [OcaEvent2, OcaMethod2, OcaBlob, OcaNotificationDeliveryMode2, OcaBlob],
      []
    ],
    ["RemoveSubscription", 3, 2, [OcaEvent2, OcaMethod2], []],
    ["DisableNotifications", 3, 3, [], []],
    ["ReEnableNotifications", 3, 4, [], []],
    [
      "AddPropertyChangeSubscription",
      3,
      5,
      [
        OcaUint32,
        OcaPropertyID2,
        OcaMethod2,
        OcaBlob,
        OcaNotificationDeliveryMode2,
        OcaBlob
      ],
      []
    ],
    [
      "RemovePropertyChangeSubscription",
      3,
      6,
      [OcaUint32, OcaPropertyID2, OcaMethod2],
      []
    ],
    ["GetMaximumSubscriberContextLength", 3, 7, [], [OcaUint16]],
    [
      "AddSubscription2",
      3,
      8,
      [OcaEvent2, OcaNotificationDeliveryMode2, OcaBlob],
      []
    ],
    [
      "RemoveSubscription2",
      3,
      9,
      [OcaEvent2, OcaNotificationDeliveryMode2, OcaBlob],
      []
    ],
    [
      "AddPropertyChangeSubscription2",
      3,
      10,
      [OcaUint32, OcaPropertyID2, OcaNotificationDeliveryMode2, OcaBlob],
      []
    ],
    [
      "RemovePropertyChangeSubscription2",
      3,
      11,
      [OcaUint32, OcaPropertyID2, OcaNotificationDeliveryMode2, OcaBlob],
      []
    ],
    [
      "AddSubscription2List",
      3,
      12,
      [OcaList(OcaEvent2), OcaNotificationDeliveryMode2, OcaBlob],
      [OcaList(OcaStatus2)]
    ],
    [
      "RemoveSubscription2List",
      3,
      13,
      [OcaList(OcaEvent2), OcaNotificationDeliveryMode2, OcaBlob],
      []
    ],
    [
      "AddPropertyChangeSubscription2List",
      3,
      14,
      [
        OcaList(OcaUint32),
        OcaList(OcaPropertyID2),
        OcaNotificationDeliveryMode2,
        OcaBlob,
        OcaList(OcaStatus2)
      ],
      []
    ],
    [
      "RemovePropertyChangeSubscription2List",
      3,
      15,
      [
        OcaList(OcaUint32),
        OcaList(OcaPropertyID2),
        OcaNotificationDeliveryMode2,
        OcaBlob
      ],
      []
    ]
  ],
  [["State", [OcaSubscriptionManagerState2], 3, 1, false, false, null]],
  [
    ["NotificationsDisabled", 3, 1, []],
    ["SynchronizeState", 3, 2, [OcaObjectListEventData2]]
  ]
);

// node_modules/aes70/src/types/OcaPowerState.js
var OcaPowerState = class extends Enum({
  None: 0,
  Working: 1,
  Standby: 2,
  Off: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaPowerState.js
var OcaPowerState2 = Enum8(OcaPowerState);

// node_modules/aes70/src/controller/ControlClasses/OcaPowerManager.js
var OcaPowerManager = make_control_class(
  "OcaPowerManager",
  3,
  "",
  3,
  OcaManager,
  [
    ["GetState", 3, 1, [], [OcaPowerState2]],
    ["SetTargetState", 3, 2, [OcaPowerState2], [], ["SetState"]],
    ["GetPowerSupplies", 3, 3, [], [OcaList(OcaUint32)]],
    ["GetActivePowerSupplies", 3, 4, [], [OcaList(OcaUint32)]],
    ["ExchangePowerSupply", 3, 5, [OcaUint32, OcaUint32, OcaBoolean], []],
    ["GetAutoState", 3, 6, [], [OcaBoolean]],
    ["GetTargetState", 3, 7, [], [OcaPowerState2]]
  ],
  [
    ["State", [OcaPowerState2], 3, 1, false, false, null],
    ["PowerSupplies", [OcaList(OcaUint32)], 3, 2, false, false, null],
    ["ActivePowerSupplies", [OcaList(OcaUint32)], 3, 3, false, false, null],
    ["AutoState", [OcaBoolean], 3, 4, false, false, null],
    ["TargetState", [OcaPowerState2], 3, 5, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaNetworkManager.js
var OcaNetworkManager = make_control_class(
  "OcaNetworkManager",
  3,
  "",
  3,
  OcaManager,
  [
    ["GetNetworks", 3, 1, [], [OcaList(OcaUint32)]],
    ["GetStreamNetworks", 3, 2, [], [OcaList(OcaUint32)]],
    ["GetControlNetworks", 3, 3, [], [OcaList(OcaUint32)]],
    ["GetMediaTransportNetworks", 3, 4, [], [OcaList(OcaUint32)]],
    ["GetNetworkInterfaces", 3, 5, [], [OcaList(OcaUint32)]],
    ["GetNetworkApplications", 3, 6, [], [OcaList(OcaUint32)]]
  ],
  [
    ["Networks", [OcaList(OcaUint32)], 3, 1, false, false, null],
    ["StreamNetworks", [OcaList(OcaUint32)], 3, 2, false, false, null],
    ["ControlNetworks", [OcaList(OcaUint32)], 3, 3, false, false, null],
    ["MediaTransportNetworks", [OcaList(OcaUint32)], 3, 4, false, false, null],
    ["NetworkInterfaces", [OcaList(OcaUint32)], 3, 5, false, false, null],
    ["NetworkApplications", [OcaList(OcaUint32)], 3, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaMediaClockType.js
var OcaMediaClockType = class extends Enum({
  None: 0,
  Internal: 1,
  Network: 2,
  External: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaClockType.js
var OcaMediaClockType2 = Enum8(OcaMediaClockType);

// node_modules/aes70/src/controller/ControlClasses/OcaMediaClockManager.js
var OcaMediaClockManager = make_control_class(
  "OcaMediaClockManager",
  3,
  "\x07",
  3,
  OcaManager,
  [
    ["GetClocks", 3, 1, [], [OcaList(OcaUint32)]],
    ["GetMediaClockTypesSupported", 3, 2, [], [OcaList(OcaMediaClockType2)]],
    ["GetClock3s", 3, 3, [], [OcaList(OcaUint32)]]
  ],
  [
    [
      "ClockSourceTypesSupported",
      [OcaList(OcaMediaClockType2)],
      3,
      1,
      false,
      false,
      null
    ],
    ["Clocks", [OcaList(OcaUint32)], 3, 2, false, false, null],
    ["Clock3s", [OcaList(OcaUint32)], 3, 3, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaLibVolIdentifier.js
var OcaLibVolIdentifier = class {
  /**
   * Unique identifier of a library volume within the device.
   * @class OcaLibVolIdentifier
   */
  constructor(Library, ID) {
    this.Library = Library;
    this.ID = ID;
  }
};

// node_modules/aes70/src/OCP1/OcaLibVolIdentifier.js
var OcaLibVolIdentifier2 = Struct(
  {
    Library: OcaUint32,
    ID: OcaUint32
  },
  OcaLibVolIdentifier
);

// node_modules/aes70/src/types/OcaLibVolType.js
var OcaLibVolType = class {
  /**
   * Globally unique identifier of a library type.
   * @class OcaLibVolType
   */
  constructor(Authority, ID) {
    this.Authority = Authority;
    this.ID = ID;
  }
};

// node_modules/aes70/src/OCP1/OcaLibVolType.js
var OcaLibVolType2 = Struct(
  {
    Authority: OcaBlobFixedLen(3),
    ID: OcaUint32
  },
  OcaLibVolType
);

// node_modules/aes70/src/types/OcaLibraryIdentifier.js
var OcaLibraryIdentifier = class {
  /**
   * Full identifier (type + object number) of Library (i.e. of an
   * **OcaLibrary** instance)
   * @class OcaLibraryIdentifier
   */
  constructor(Type, ONo) {
    this.Type = Type;
    this.ONo = ONo;
  }
};

// node_modules/aes70/src/OCP1/OcaLibraryIdentifier.js
var OcaLibraryIdentifier2 = Struct(
  {
    Type: OcaLibVolType2,
    ONo: OcaUint32
  },
  OcaLibraryIdentifier
);

// node_modules/aes70/src/controller/ControlClasses/OcaLibraryManager.js
var OcaLibraryManager = make_control_class(
  "OcaLibraryManager",
  3,
  "\b",
  3,
  OcaManager,
  [
    ["AddLibrary", 3, 1, [OcaLibVolType2], [OcaLibraryIdentifier2]],
    ["DeleteLibrary", 3, 2, [OcaUint32], []],
    ["GetLibraryCount", 3, 3, [OcaLibVolType2], [OcaUint16]],
    ["GetLibraryList", 3, 4, [OcaLibVolType2], [OcaList(OcaLibraryIdentifier2)]],
    ["GetCurrentPatch", 3, 5, [], [OcaLibVolIdentifier2]],
    ["ApplyPatch", 3, 6, [OcaLibVolIdentifier2], []]
  ],
  [
    ["Libraries", [OcaList(OcaLibraryIdentifier2)], 3, 1, false, false, null],
    ["CurrentPatch", [OcaUint16], 3, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaAudioProcessingManager.js
var OcaAudioProcessingManager = make_control_class(
  "OcaAudioProcessingManager",
  3,
  "	",
  3,
  OcaManager,
  [],
  [],
  []
);

// node_modules/aes70/src/bigint.js
var HAS_BIGINT = typeof BigInt !== "undefined";
var UINT64_MAX = HAS_BIGINT && (BigInt(1) << BigInt(64)) - BigInt(1);
var INT64_MAX = HAS_BIGINT && UINT64_MAX >> BigInt(1);
var INT64_MIN = HAS_BIGINT && -INT64_MAX - BigInt(1);
var INT56_MAX = HAS_BIGINT && (BigInt(1) << BigInt(55)) - BigInt(1);
var INT56_MIN = HAS_BIGINT && -INT56_MAX - BigInt(1);

// node_modules/aes70/src/OCP1/OcaUint64.js
function assertSupport() {
  if (!HAS_BIGINT) throw new Error("Missing BigInt support");
}
var OcaUint64 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number" || typeof value === "bigint";
  },
  encodedLength: function(value) {
    return 8;
  },
  encodeTo: function(dataView, pos, value) {
    assertSupport();
    if (!(value <= UINT64_MAX && value >= 0))
      throw new TypeError("Uint64 out of range.");
    dataView.setBigUint64(pos, BigInt(value), false);
    return pos + 8;
  },
  decode: function(dataView, pos) {
    assertSupport();
    const value = dataView.getBigUint64(pos, false);
    return value <= Number.MAX_SAFE_INTEGER ? Number(value) : value;
  }
});

// node_modules/aes70/src/types/OcaTime.js
var OcaTime = class {
  /**
   * Absolute or relative time. Time values in PTP presentation format with
   * added sign. - 48 bit integer seconds - 32 bit integer nanoseconds - boolean
   * sign (positive=TRUE) field. Absolute times are always positive. Relative
   * times may be positive or negative.
   * @class OcaTime
   */
  constructor(Negative, Seconds, Nanoseconds) {
    this.Negative = Negative;
    this.Seconds = Seconds;
    this.Nanoseconds = Nanoseconds;
  }
};

// node_modules/aes70/src/OCP1/OcaTime.js
var OcaTime2 = Struct(
  {
    Negative: OcaBoolean,
    Seconds: OcaUint64,
    Nanoseconds: OcaUint32
  },
  OcaTime
);

// node_modules/aes70/src/controller/ControlClasses/OcaDeviceTimeManager.js
var OcaDeviceTimeManager = make_control_class(
  "OcaDeviceTimeManager",
  3,
  "\n",
  3,
  OcaManager,
  [
    ["GetDeviceTimeNTP", 3, 1, [], [OcaUint64]],
    ["SetDeviceTimeNTP", 3, 2, [OcaUint64], []],
    ["GetTimeSources", 3, 3, [], [OcaList(OcaUint32)]],
    ["GetCurrentDeviceTimeSource", 3, 4, [], [OcaUint32]],
    ["SetCurrentDeviceTimeSource", 3, 5, [OcaUint32], []],
    ["GetDeviceTime", 3, 6, [], [OcaTime2], ["GetDeviceTimePTP"]],
    ["SetDeviceTime", 3, 7, [OcaTime2], [], ["SetDeviceTimePTP"]]
  ],
  [
    ["TimeSources", [OcaList(OcaUint32)], 3, 1, false, false, null],
    ["CurrentDeviceTimeSource", [OcaUint32], 3, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/OCP1/OcaMap.js
function OcaMap(KeyType, ValueType) {
  const kencodedLength = KeyType.encodedLength;
  const kencodeTo = KeyType.encodeTo;
  const kdecodeFrom = KeyType.decodeFrom;
  const kdecodeLength = KeyType.decodeLength;
  const vencodedLength = ValueType.encodedLength;
  const vencodeTo = ValueType.encodeTo;
  const vdecodeFrom = ValueType.decodeFrom;
  const vdecodeLength = ValueType.decodeLength;
  return createType({
    isConstantLength: false,
    canEncode: function(value) {
      return value instanceof Map || value instanceof WeakMap;
    },
    encodedLength: function(value) {
      if (!(value instanceof Map || value instanceof WeakMap))
        throw new TypeError("Expected Map or WeakMap");
      let result = 2;
      value.forEach((value2, key) => {
        result += kencodedLength(key);
        result += vencodedLength(value2);
      });
      return result;
    },
    encodeTo: function(dataView, pos, value) {
      dataView.setUint16(pos, value.size);
      pos += 2;
      value.forEach((value2, key) => {
        pos = kencodeTo(dataView, pos, key);
        pos = vencodeTo(dataView, pos, value2);
      });
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const result = /* @__PURE__ */ new Map();
      const length = dataView.getUint16(pos);
      pos += 2;
      for (let i = 0; i < length; i++) {
        let key, value;
        [pos, key] = kdecodeFrom(dataView, pos);
        [pos, value] = vdecodeFrom(dataView, pos);
        result.set(key, value);
      }
      if (result.size !== length)
        throw new Error("Key appeared twice in decoded Map.");
      return [pos, result];
    },
    decodeLength: function(dataView, pos) {
      const length = dataView.getUint16(pos);
      pos += 2;
      for (let i = 0; i < length; i++) {
        pos = kdecodeLength(dataView, pos);
        pos = vdecodeLength(dataView, pos);
      }
      return pos;
    }
  });
}

// node_modules/aes70/src/OCP1/OcaFloat32.js
var OcaFloat32 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 4;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setFloat32(pos, +value, false);
    return pos + 4;
  },
  decode: function(dataView, pos) {
    return dataView.getFloat32(pos, false);
  }
});

// node_modules/aes70/src/types/OcaTimeMode.js
var OcaTimeMode = class extends Enum({
  Absolute: 1,
  Relative: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaTimeMode.js
var OcaTimeMode2 = Enum8(OcaTimeMode);

// node_modules/aes70/src/types/OcaTask.js
var OcaTask = class {
  /**
   * An execution thread that runs an AES70 Program. Programs are OcaLibrary
   * volumes that contain application-specific execution instructions. **
   * Deprecated** in OCA 1.5.
   * @class OcaTask
   */
  constructor(ID, Label, ProgramID, GroupID, TimeMode, TimeSourceONo, StartTime, Duration, ApplicationSpecificParameters) {
    this.ID = ID;
    this.Label = Label;
    this.ProgramID = ProgramID;
    this.GroupID = GroupID;
    this.TimeMode = TimeMode;
    this.TimeSourceONo = TimeSourceONo;
    this.StartTime = StartTime;
    this.Duration = Duration;
    this.ApplicationSpecificParameters = ApplicationSpecificParameters;
  }
};

// node_modules/aes70/src/OCP1/OcaTask.js
var OcaTask2 = Struct(
  {
    ID: OcaUint32,
    Label: OcaString,
    ProgramID: OcaLibVolIdentifier2,
    GroupID: OcaUint16,
    TimeMode: OcaTimeMode2,
    TimeSourceONo: OcaUint32,
    StartTime: OcaTime2,
    Duration: OcaFloat32,
    ApplicationSpecificParameters: OcaBlob
  },
  OcaTask
);

// node_modules/aes70/src/types/OcaTaskCommand.js
var OcaTaskCommand = class extends Enum({
  None: 0,
  Prepare: 1,
  Start: 3,
  Stop: 4,
  Abort: 5,
  Disable: 6,
  Clear: 7
}) {
};

// node_modules/aes70/src/OCP1/OcaTaskCommand.js
var OcaTaskCommand2 = Enum8(OcaTaskCommand);

// node_modules/aes70/src/types/OcaTaskManagerState.js
var OcaTaskManagerState = class extends Enum({
  None: 0,
  Enabled: 1,
  Disabled: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaTaskManagerState.js
var OcaTaskManagerState2 = Enum8(OcaTaskManagerState);

// node_modules/aes70/src/types/OcaTaskState.js
var OcaTaskState = class extends Enum({
  None: 0,
  NotPrepared: 1,
  Disabled: 2,
  Enabled: 3,
  Running: 4,
  Completed: 5,
  Failed: 6,
  Stopped: 7,
  Aborted: 8
}) {
};

// node_modules/aes70/src/OCP1/OcaTaskState.js
var OcaTaskState2 = Enum8(OcaTaskState);

// node_modules/aes70/src/types/OcaTaskStatus.js
var OcaTaskStatus = class {
  /**
   * Status of an OcaTask: task state plus an error code that gives more detail.
   * **Deprecated** in OCA 1.5.
   * @class OcaTaskStatus
   */
  constructor(ID, State, ErrorCode) {
    this.ID = ID;
    this.State = State;
    this.ErrorCode = ErrorCode;
  }
};

// node_modules/aes70/src/OCP1/OcaTaskStatus.js
var OcaTaskStatus2 = Struct(
  {
    ID: OcaUint32,
    State: OcaTaskState2,
    ErrorCode: OcaUint16
  },
  OcaTaskStatus
);

// node_modules/aes70/src/types/OcaTaskStatusChangedEventData.js
var OcaTaskStatusChangedEventData = class {
  /**
   * **Deprecated** event raised by **OcaTaskManager** when the status of a
   * legacy task changes. Legacy task are task that execute now-deprecated
   * **OcaLibrary** volumes.
   * @class OcaTaskStatusChangedEventData
   */
  constructor(TaskID, ProgramID, Status) {
    this.TaskID = TaskID;
    this.ProgramID = ProgramID;
    this.Status = Status;
  }
};

// node_modules/aes70/src/OCP1/OcaTaskStatusChangedEventData.js
var OcaTaskStatusChangedEventData2 = Struct(
  {
    TaskID: OcaUint32,
    ProgramID: OcaLibVolIdentifier2,
    Status: OcaTaskStatus2
  },
  OcaTaskStatusChangedEventData
);

// node_modules/aes70/src/controller/ControlClasses/OcaTaskManager.js
var OcaTaskManager = make_control_class(
  "OcaTaskManager",
  3,
  "\v",
  3,
  OcaManager,
  [
    ["Enable", 3, 1, [OcaBoolean], []],
    ["ControlAllTasks", 3, 2, [OcaTaskCommand2, OcaBlob], []],
    ["ControlTaskGroup", 3, 3, [OcaUint16, OcaTaskCommand2, OcaBlob], []],
    ["ControlTask", 3, 4, [OcaUint32, OcaTaskCommand2, OcaBlob], []],
    ["GetState", 3, 5, [], [OcaTaskManagerState2]],
    ["GetTaskStatuses", 3, 6, [], [OcaTaskStatus2]],
    ["GetTaskStatus", 3, 7, [OcaUint32], [OcaTaskStatus2]],
    ["AddTask", 3, 8, [OcaTask2], [OcaTask2]],
    ["GetTasks", 3, 9, [], [OcaMap(OcaUint32, OcaTask2)]],
    ["GetTask", 3, 10, [OcaUint32], [OcaTask2]],
    ["SetTask", 3, 11, [OcaUint32, OcaTask2], []],
    ["DeleteTask", 3, 12, [OcaUint32], []]
  ],
  [
    ["State", [OcaTaskManagerState2], 3, 1, false, false, null],
    ["Tasks", [OcaMap(OcaUint32, OcaTask2)], 3, 2, false, false, null]
  ],
  [["TaskStateChanged", 3, 1, [OcaTaskStatusChangedEventData2]]]
);

// node_modules/aes70/src/controller/ControlClasses/OcaCodingManager.js
var OcaCodingManager = make_control_class(
  "OcaCodingManager",
  3,
  "\f",
  3,
  OcaManager,
  [
    ["GetAvailableEncodingSchemes", 3, 1, [], [OcaMap(OcaUint16, OcaString)]],
    ["GetAvailableDecodingSchemes", 3, 2, [], [OcaMap(OcaUint16, OcaString)]]
  ],
  [
    [
      "AvailableEncodingSchemes",
      [OcaMap(OcaUint16, OcaString)],
      3,
      1,
      false,
      false,
      null
    ],
    [
      "AvailableDecodingSchemes",
      [OcaMap(OcaUint16, OcaString)],
      3,
      2,
      false,
      false,
      null
    ]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaDiagnosticManager.js
var OcaDiagnosticManager = make_control_class(
  "OcaDiagnosticManager",
  3,
  "\r",
  3,
  OcaManager,
  [],
  [],
  []
);

// node_modules/aes70/src/types/OcaObjectIdentification.js
var OcaObjectIdentification = class {
  /**
   * Object identification. Composite of object number and object's class. Used
   * mainly in discovery processes.
   * @class OcaObjectIdentification
   */
  constructor(ONo, ClassIdentification) {
    this.ONo = ONo;
    this.ClassIdentification = ClassIdentification;
  }
};

// node_modules/aes70/src/OCP1/OcaObjectIdentification.js
var OcaObjectIdentification2 = Struct(
  {
    ONo: OcaUint32,
    ClassIdentification: OcaClassIdentification2
  },
  OcaObjectIdentification
);

// node_modules/aes70/src/types/OcaActionObjectSearchResult.js
var OcaActionObjectSearchResult = class {
  /**
   * Result of Action Object search via the **FindActionObject...()** methods of
   * **OcaBlock**. Dynamic format, form used depends on type of search and
   * options.
   * @class OcaActionObjectSearchResult
   */
  constructor(Identification, ContainerPath, Role, Label) {
    this.Identification = Identification;
    this.ContainerPath = ContainerPath;
    this.Role = Role;
    this.Label = Label;
  }
};

// node_modules/aes70/src/OCP1/OcaActionObjectSearchResult.js
var OcaActionObjectSearchResult2 = Struct(
  {
    Identification: OcaObjectIdentification2,
    ContainerPath: OcaList(OcaUint32),
    Role: OcaString,
    Label: OcaString
  },
  OcaActionObjectSearchResult
);

// node_modules/aes70/src/OCP1/OcaActionObjectSearchResultFlags.js
var OcaActionObjectSearchResultFlags = Bitset16;

// node_modules/aes70/src/OCP1/OcaBlockConfigurability.js
var OcaBlockConfigurability = Bitset16;

// node_modules/aes70/src/types/OcaBlockMember.js
var OcaBlockMember = class {
  /**
   * Describes an object that is a member of a block.
   * @class OcaBlockMember
   */
  constructor(MemberObjectIdentification, ContainerObjectNumber) {
    this.MemberObjectIdentification = MemberObjectIdentification;
    this.ContainerObjectNumber = ContainerObjectNumber;
  }
};

// node_modules/aes70/src/OCP1/OcaBlockMember.js
var OcaBlockMember2 = Struct(
  {
    MemberObjectIdentification: OcaObjectIdentification2,
    ContainerObjectNumber: OcaUint32
  },
  OcaBlockMember
);

// node_modules/aes70/src/types/OcaConstructionParameter.js
var OcaConstructionParameter = class {
  /**
   * Construction parameter. Defines the value of a property that will be set at
   * object construction time.
   * @class OcaConstructionParameter
   */
  constructor(ID, Value) {
    this.ID = ID;
    this.Value = Value;
  }
};

// node_modules/aes70/src/OCP1/OcaConstructionParameter.js
var OcaConstructionParameter2 = Struct(
  {
    ID: OcaPropertyID2,
    Value: OcaBlob
  },
  OcaConstructionParameter
);

// node_modules/aes70/src/types/OcaDatasetSearchResult.js
var OcaDatasetSearchResult = class {
  /**
   * Result of Dataset search via the **FindDatasets(...)** and
   * **FindDatasetsRecursive(...)** methods of **OcaBlock**.
   * @class OcaDatasetSearchResult
   */
  constructor(Object2, Name, Type) {
    this.Object = Object2;
    this.Name = Name;
    this.Type = Type;
  }
};

// node_modules/aes70/src/OCP1/OcaDatasetSearchResult.js
var OcaDatasetSearchResult2 = Struct(
  {
    Object: OcaBlockMember2,
    Name: OcaString,
    Type: OcaString
  },
  OcaDatasetSearchResult
);

// node_modules/aes70/src/types/OcaGlobalTypeIdentifier.js
var OcaGlobalTypeIdentifier = class {
  /**
   * Globally unique identifier of something that belongs to an organization. An
   * identifier with both Authority and ID fields of zero shall be interpreted
   * as a null value.
   * @class OcaGlobalTypeIdentifier
   */
  constructor(Organization, ID) {
    this.Organization = Organization;
    this.ID = ID;
  }
};

// node_modules/aes70/src/OCP1/OcaGlobalTypeIdentifier.js
var OcaGlobalTypeIdentifier2 = Struct(
  {
    Organization: OcaBlobFixedLen(3),
    ID: OcaUint32
  },
  OcaGlobalTypeIdentifier
);

// node_modules/aes70/src/types/OcaLibVolData_ParamSet.js
var OcaLibVolData_ParamSet = class {
  /**
   * Library volume data for a Parset (short for Parameter Set) volume. A Parset
   * is a collection of operating parameter settings that can be applied to a
   * block. Each Parset is associated with a specific block type, but not with a
   * specific instance of that type. A Parset may be applied to any block
   * instance of the associated type. A block's type is a the object number of
   * its factory or, for factory-defined blocks, a unique identifier set at time
   * of manufacture.
   * @class OcaLibVolData_ParamSet
   */
  constructor(TargetBlockType, ParData) {
    this.TargetBlockType = TargetBlockType;
    this.ParData = ParData;
  }
};

// node_modules/aes70/src/OCP1/OcaLibVolData_ParamSet.js
var OcaLibVolData_ParamSet2 = Struct(
  {
    TargetBlockType: OcaUint32,
    ParData: OcaBlob
  },
  OcaLibVolData_ParamSet
);

// node_modules/aes70/src/OCP1/OcaLongBlob.js
var OcaLongBlob = createBlobType(4);

// node_modules/aes70/src/types/OcaIODirection.js
var OcaIODirection = class extends Enum({
  Input: 1,
  Output: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaIODirection.js
var OcaIODirection2 = Enum8(OcaIODirection);

// node_modules/aes70/src/types/OcaPortID.js
var OcaPortID = class {
  /**
   * Unique identifier of input or output Port within a given Worker or Block
   * class. Port numbers are ordinals starting at 1, and there are separate
   * numbering spaces for input and output Ports.
   * @class OcaPortID
   */
  constructor(Direction, Index) {
    this.Direction = Direction;
    this.Index = Index;
  }
};

// node_modules/aes70/src/OCP1/OcaPortID.js
var OcaPortID2 = Struct(
  {
    Direction: OcaIODirection2,
    Index: OcaUint16
  },
  OcaPortID
);

// node_modules/aes70/src/types/OcaPort.js
var OcaPort = class {
  /**
   * Representation of an OCA (input or output) port that is used in the signal
   * path representation of an OCA device.
   * @class OcaPort
   */
  constructor(Owner, ID, Role) {
    this.Owner = Owner;
    this.ID = ID;
    this.Role = Role;
  }
};

// node_modules/aes70/src/OCP1/OcaPort.js
var OcaPort2 = Struct(
  {
    Owner: OcaUint32,
    ID: OcaPortID2,
    Role: OcaString
  },
  OcaPort
);

// node_modules/aes70/src/types/OcaSignalPath.js
var OcaSignalPath = class {
  /**
   * Signal path between two OcaPorts in the same device.
   * @class OcaSignalPath
   */
  constructor(OutputPort, InputPort) {
    this.OutputPort = OutputPort;
    this.InputPort = InputPort;
  }
};

// node_modules/aes70/src/OCP1/OcaSignalPath.js
var OcaSignalPath2 = Struct(
  {
    OutputPort: OcaPort2,
    InputPort: OcaPort2
  },
  OcaSignalPath
);

// node_modules/aes70/src/types/OcaStringComparisonType.js
var OcaStringComparisonType = class extends Enum({
  Exact: 0,
  Substring: 1,
  Contains: 2,
  ExactCaseInsensitive: 3,
  SubstringCaseInsensitive: 4,
  ContainsCaseInsensitive: 5
}) {
};

// node_modules/aes70/src/OCP1/OcaStringComparisonType.js
var OcaStringComparisonType2 = Enum8(OcaStringComparisonType);

// node_modules/aes70/src/types/OcaSamplingRateConverterType.js
var OcaSamplingRateConverterType = class extends Enum({
  None: 0,
  Synchronous: 1,
  Asynchronous: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaSamplingRateConverterType.js
var OcaSamplingRateConverterType2 = Enum8(OcaSamplingRateConverterType);

// node_modules/aes70/src/types/OcaPortClockMapEntry.js
var OcaPortClockMapEntry = class {
  /**
   * Port clock map entry that describes the clocking and sample-rate conversion
   * (if any) of an **OcaPort**.
   * @class OcaPortClockMapEntry
   */
  constructor(ClockONo, SRCType) {
    this.ClockONo = ClockONo;
    this.SRCType = SRCType;
  }
};

// node_modules/aes70/src/OCP1/OcaPortClockMapEntry.js
var OcaPortClockMapEntry2 = Struct(
  {
    ClockONo: OcaUint32,
    SRCType: OcaSamplingRateConverterType2
  },
  OcaPortClockMapEntry
);

// node_modules/aes70/src/controller/ControlClasses/OcaWorker.js
var OcaWorker = make_control_class(
  "OcaWorker",
  2,
  "",
  3,
  OcaRoot,
  [
    ["GetEnabled", 2, 1, [], [OcaBoolean]],
    ["SetEnabled", 2, 2, [OcaBoolean], []],
    ["AddPort", 2, 3, [OcaString, OcaIODirection2], [OcaPortID2]],
    ["DeletePort", 2, 4, [OcaPortID2], []],
    ["GetPorts", 2, 5, [], [OcaList(OcaPort2)]],
    ["GetPortName", 2, 6, [OcaPortID2], [OcaString]],
    ["SetPortName", 2, 7, [OcaPortID2, OcaString], []],
    ["GetLabel", 2, 8, [], [OcaString]],
    ["SetLabel", 2, 9, [OcaString], []],
    ["GetOwner", 2, 10, [], [OcaUint32]],
    ["GetLatency", 2, 11, [], [OcaFloat32]],
    ["SetLatency", 2, 12, [OcaFloat32], []],
    ["GetPath", 2, 13, [], [OcaList(OcaString), OcaList(OcaUint32)]],
    ["GetPortClockMap", 2, 14, [], [OcaMap(OcaPortID2, OcaPortClockMapEntry2)]],
    ["SetPortClockMap", 2, 15, [OcaMap(OcaPortID2, OcaPortClockMapEntry2)], []],
    ["GetPortClockMapEntry", 2, 16, [OcaPortID2], [OcaPortClockMapEntry2]],
    ["SetPortClockMapEntry", 2, 17, [OcaPortID2, OcaPortClockMapEntry2], []],
    ["DeletePortClockMapEntry", 2, 18, [OcaPortID2], []]
  ],
  [
    ["Enabled", [OcaBoolean], 2, 1, false, false, null],
    ["Ports", [OcaList(OcaPort2)], 2, 2, false, false, null],
    ["Label", [OcaString], 2, 3, false, false, null],
    ["Owner", [OcaUint32], 2, 4, true, false, null],
    ["Latency", [OcaFloat32], 2, 5, false, false, null],
    [
      "PortClockMap",
      [OcaMap(OcaPortID2, OcaPortClockMapEntry2)],
      2,
      6,
      false,
      false,
      null
    ]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaBlock.js
var OcaBlock = make_control_class(
  "OcaBlock",
  3,
  "",
  3,
  OcaWorker,
  [
    ["GetType", 3, 1, [], [OcaUint32]],
    [
      "ConstructActionObject",
      3,
      2,
      [String16, OcaList(OcaConstructionParameter2)],
      [OcaUint32]
    ],
    [
      "ConstructBlockUsingFactory",
      3,
      3,
      [OcaUint32],
      [OcaUint32],
      ["ConstructMemberUsingFactory"]
    ],
    ["DeleteMember", 3, 4, [OcaUint32], []],
    [
      "GetActionObjects",
      3,
      5,
      [],
      [OcaList(OcaObjectIdentification2)],
      ["GetMembers"]
    ],
    [
      "GetActionObjectsRecursive",
      3,
      6,
      [],
      [OcaList(OcaBlockMember2)],
      ["GetMembersRecursive"]
    ],
    ["AddSignalPath", 3, 7, [OcaSignalPath2], [OcaUint16]],
    ["DeleteSignalPath", 3, 8, [OcaUint16], []],
    ["GetSignalPaths", 3, 9, [], [OcaMap(OcaUint16, OcaSignalPath2)]],
    ["GetSignalPathsRecursive", 3, 10, [], [OcaMap(OcaUint16, OcaSignalPath2)]],
    ["GetMostRecentParamSetIdentifier", 3, 11, [], [OcaLibVolIdentifier2]],
    ["ApplyParamSet", 3, 12, [], [OcaLibVolIdentifier2]],
    ["GetCurrentParamSetData", 3, 13, [], [OcaLibVolData_ParamSet2]],
    ["StoreCurrentParamSetData", 3, 14, [OcaLibVolIdentifier2], []],
    ["GetGlobalType", 3, 15, [], [OcaGlobalTypeIdentifier2]],
    ["GetONoMap", 3, 16, [], [OcaMap(OcaUint32, OcaUint32)]],
    [
      "FindActionObjectsByRole",
      3,
      17,
      [
        OcaString,
        OcaStringComparisonType2,
        String16,
        OcaActionObjectSearchResultFlags
      ],
      [OcaList(OcaActionObjectSearchResult2)],
      ["FindObjectsByRole"]
    ],
    [
      "FindActionObjectsByRoleRecursive",
      3,
      18,
      [
        OcaString,
        OcaStringComparisonType2,
        String16,
        OcaActionObjectSearchResultFlags
      ],
      [OcaList(OcaActionObjectSearchResult2)],
      ["FindObjectsByRoleRecursive"]
    ],
    [
      "FindActionObjectsByLabelRecursive",
      3,
      19,
      [
        OcaString,
        OcaStringComparisonType2,
        String16,
        OcaActionObjectSearchResultFlags
      ],
      [OcaList(OcaActionObjectSearchResult2)],
      ["FindObjectsByLabelRecursive"]
    ],
    [
      "FindActionObjectsByRolePath",
      3,
      20,
      [OcaList(OcaString), OcaActionObjectSearchResultFlags],
      [OcaList(OcaActionObjectSearchResult2)],
      ["FindObjectsByPath"]
    ],
    ["GetConfigurability", 3, 21, [], [OcaBlockConfigurability]],
    ["GetMostRecentParamDatasetONo", 3, 22, [], [OcaUint32]],
    ["ApplyParamDataset", 3, 23, [OcaUint32], []],
    ["StoreCurrentParameterData", 3, 24, [OcaUint32], []],
    ["FetchCurrentParameterData", 3, 25, [], [OcaLongBlob]],
    ["ApplyParameterData", 3, 26, [], [OcaLongBlob]],
    [
      "ConstructDataset",
      3,
      27,
      [String16, OcaString, OcaString, OcaUint64, OcaLongBlob],
      [OcaUint32]
    ],
    [
      "DuplicateDataset",
      3,
      28,
      [OcaUint32, OcaUint32, OcaString, OcaUint64],
      [OcaUint32]
    ],
    ["GetDatasetObjects", 3, 29, [], [OcaList(OcaObjectIdentification2)]],
    ["GetDatasetObjectsRecursive", 3, 30, [], [OcaList(OcaBlockMember2)]],
    [
      "FindDatasets",
      3,
      31,
      [OcaString, OcaStringComparisonType2, OcaString, OcaStringComparisonType2],
      [OcaList(OcaDatasetSearchResult2)]
    ],
    [
      "FindDatasetsRecursive",
      3,
      32,
      [OcaString, OcaStringComparisonType2, OcaString, OcaStringComparisonType2],
      [OcaList(OcaDatasetSearchResult2)]
    ],
    ["GetBlockFactoryONo", 3, 33, [], [OcaUint32]]
  ],
  [
    ["Type", [OcaUint32], 3, 1, true, false, null],
    [
      "ActionObjects",
      [OcaList(OcaObjectIdentification2)],
      3,
      2,
      false,
      false,
      ["Members"]
    ],
    [
      "SignalPaths",
      [OcaMap(OcaUint16, OcaSignalPath2)],
      3,
      3,
      false,
      false,
      null
    ],
    ["MostRecentParamSetIdentifier", [OcaUint32], 3, 4, false, false, null],
    ["GlobalType", [OcaGlobalTypeIdentifier2], 3, 5, true, false, null],
    ["ONoMap", [OcaMap(OcaUint32, OcaUint32)], 3, 6, true, false, null],
    [
      "DatasetObjects",
      [OcaList(OcaObjectIdentification2)],
      3,
      7,
      false,
      false,
      null
    ],
    ["Configurability", [OcaBlockConfigurability], 3, 8, true, false, null],
    ["MostRecentParamDatasetONo", [OcaUint32], 3, 9, false, false, null],
    ["BlockFactoryONo", [OcaUint32], 3, 10, true, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/tree_to_rolemap.js
function tree_to_rolemap(tree, s) {
  const roles = /* @__PURE__ */ new Map();
  if (!s) s = "/";
  const tasks = [];
  const fetch_role = (o) => {
    if (Array.isArray(o)) {
      o.forEach(fetch_role);
    } else {
      tasks.push(
        o.GetRole().then((role) => {
          roles.set(o, role);
        })
      );
    }
  };
  tree.forEach(fetch_role);
  return Promise.all(tasks).then(function() {
    const rolemap = /* @__PURE__ */ new Map();
    const build_paths = (a, prefix) => {
      const p = prefix != null ? prefix + s : "";
      const local_roles = /* @__PURE__ */ new Map();
      a.forEach(function(o, i) {
        if (Array.isArray(o)) return;
        const role = roles.get(o);
        if (local_roles.has(role)) {
          const tmp = local_roles.get(role);
          if (Array.isArray(tmp)) tmp.push(o);
          else local_roles.set(role, [tmp, o]);
        } else {
          local_roles.set(role, o);
        }
      });
      local_roles.forEach(function(o, role) {
        if (Array.isArray(o)) {
          let n = 1;
          for (let i = 0; i < o.length; i++) {
            let nrole;
            while (local_roles.has(nrole = role + n)) {
              n++;
            }
            local_roles.set(nrole, o[i]);
            local_roles.set(o[i], nrole);
          }
          local_roles.delete(role);
        } else {
          local_roles.set(o, role);
        }
      });
      a.forEach((o, i) => {
        if (Array.isArray(o)) {
          build_paths(o, p + local_roles.get(a[i - 1]));
        } else {
          const path2 = p + local_roles.get(o);
          rolemap.set(path2, o);
        }
      });
    };
    build_paths(tree, null);
    return rolemap;
  });
}
var tree_to_rolemap_default = tree_to_rolemap;

// node_modules/aes70/src/controller/ControlClasses.js
var ControlClasses_exports = {};
__export(ControlClasses_exports, {
  OcaActuator: () => OcaActuator,
  OcaAgent: () => OcaAgent,
  OcaApplicationNetwork: () => OcaApplicationNetwork,
  OcaAudioLevelSensor: () => OcaAudioLevelSensor,
  OcaAudioProcessingManager: () => OcaAudioProcessingManager,
  OcaBasicActuator: () => OcaBasicActuator,
  OcaBasicSensor: () => OcaBasicSensor,
  OcaBitstringActuator: () => OcaBitstringActuator,
  OcaBitstringSensor: () => OcaBitstringSensor,
  OcaBlock: () => OcaBlock,
  OcaBlockFactoryAgent: () => OcaBlockFactoryAgent,
  OcaBooleanActuator: () => OcaBooleanActuator,
  OcaBooleanSensor: () => OcaBooleanSensor,
  OcaCodingManager: () => OcaCodingManager,
  OcaCommandSet: () => OcaCommandSet,
  OcaCommandSetAgent: () => OcaCommandSetAgent,
  OcaControlNetwork: () => OcaControlNetwork,
  OcaCounterNotifier: () => OcaCounterNotifier,
  OcaCurrentSensor: () => OcaCurrentSensor,
  OcaDataset: () => OcaDataset,
  OcaDatasetWorker: () => OcaDatasetWorker,
  OcaDelay: () => OcaDelay,
  OcaDelayExtended: () => OcaDelayExtended,
  OcaDeviceManager: () => OcaDeviceManager,
  OcaDeviceTimeManager: () => OcaDeviceTimeManager,
  OcaDiagnosticManager: () => OcaDiagnosticManager,
  OcaDynamics: () => OcaDynamics,
  OcaDynamicsCurve: () => OcaDynamicsCurve,
  OcaDynamicsDetector: () => OcaDynamicsDetector,
  OcaFilterArbitraryCurve: () => OcaFilterArbitraryCurve,
  OcaFilterClassical: () => OcaFilterClassical,
  OcaFilterFIR: () => OcaFilterFIR,
  OcaFilterParametric: () => OcaFilterParametric,
  OcaFilterPolynomial: () => OcaFilterPolynomial,
  OcaFirmwareManager: () => OcaFirmwareManager,
  OcaFloat32Actuator: () => OcaFloat32Actuator,
  OcaFloat32Sensor: () => OcaFloat32Sensor,
  OcaFloat64Actuator: () => OcaFloat64Actuator,
  OcaFloat64Sensor: () => OcaFloat64Sensor,
  OcaFrequencyActuator: () => OcaFrequencyActuator,
  OcaFrequencySensor: () => OcaFrequencySensor,
  OcaGain: () => OcaGain,
  OcaGainSensor: () => OcaGainSensor,
  OcaGroup: () => OcaGroup,
  OcaGrouper: () => OcaGrouper,
  OcaIdentificationActuator: () => OcaIdentificationActuator,
  OcaIdentificationSensor: () => OcaIdentificationSensor,
  OcaImpedanceSensor: () => OcaImpedanceSensor,
  OcaInt16Actuator: () => OcaInt16Actuator,
  OcaInt16Sensor: () => OcaInt16Sensor,
  OcaInt32Actuator: () => OcaInt32Actuator,
  OcaInt32Sensor: () => OcaInt32Sensor,
  OcaInt64Actuator: () => OcaInt64Actuator,
  OcaInt64Sensor: () => OcaInt64Sensor,
  OcaInt8Actuator: () => OcaInt8Actuator,
  OcaInt8Sensor: () => OcaInt8Sensor,
  OcaJsonActuator: () => OcaJsonActuator,
  OcaJsonSensor: () => OcaJsonSensor,
  OcaLevelSensor: () => OcaLevelSensor,
  OcaLibraryManager: () => OcaLibraryManager,
  OcaLockManager: () => OcaLockManager,
  OcaLog: () => OcaLog,
  OcaManager: () => OcaManager,
  OcaMatrix: () => OcaMatrix,
  OcaMediaClock: () => OcaMediaClock,
  OcaMediaClock3: () => OcaMediaClock3,
  OcaMediaClockManager: () => OcaMediaClockManager,
  OcaMediaRecorderPlayer: () => OcaMediaRecorderPlayer,
  OcaMediaTransportApplication: () => OcaMediaTransportApplication,
  OcaMediaTransportNetwork: () => OcaMediaTransportNetwork,
  OcaMediaTransportSessionAgent: () => OcaMediaTransportSessionAgent,
  OcaMute: () => OcaMute,
  OcaNetwork: () => OcaNetwork,
  OcaNetworkApplication: () => OcaNetworkApplication,
  OcaNetworkInterface: () => OcaNetworkInterface,
  OcaNetworkManager: () => OcaNetworkManager,
  OcaNetworkSignalChannel: () => OcaNetworkSignalChannel,
  OcaNumericObserver: () => OcaNumericObserver,
  OcaNumericObserverList: () => OcaNumericObserverList,
  OcaPanBalance: () => OcaPanBalance,
  OcaPhysicalPosition: () => OcaPhysicalPosition,
  OcaPolarity: () => OcaPolarity,
  OcaPowerManager: () => OcaPowerManager,
  OcaPowerSensor: () => OcaPowerSensor,
  OcaPowerSupply: () => OcaPowerSupply,
  OcaProgram: () => OcaProgram,
  OcaRamper: () => OcaRamper,
  OcaRoot: () => OcaRoot,
  OcaSamplingRateConverter: () => OcaSamplingRateConverter,
  OcaSecurityManager: () => OcaSecurityManager,
  OcaSensor: () => OcaSensor,
  OcaSignalGenerator: () => OcaSignalGenerator,
  OcaSignalInput: () => OcaSignalInput,
  OcaSignalOutput: () => OcaSignalOutput,
  OcaStateSensor: () => OcaStateSensor,
  OcaStreamConnector: () => OcaStreamConnector,
  OcaStreamNetwork: () => OcaStreamNetwork,
  OcaStringActuator: () => OcaStringActuator,
  OcaStringSensor: () => OcaStringSensor,
  OcaSubscriptionManager: () => OcaSubscriptionManager,
  OcaSummingPoint: () => OcaSummingPoint,
  OcaSwitch: () => OcaSwitch,
  OcaTaskAgent: () => OcaTaskAgent,
  OcaTaskManager: () => OcaTaskManager,
  OcaTaskScheduler: () => OcaTaskScheduler,
  OcaTemperatureActuator: () => OcaTemperatureActuator,
  OcaTemperatureSensor: () => OcaTemperatureSensor,
  OcaTimeIntervalSensor: () => OcaTimeIntervalSensor,
  OcaTimeSource: () => OcaTimeSource,
  OcaUint16Actuator: () => OcaUint16Actuator,
  OcaUint16Sensor: () => OcaUint16Sensor,
  OcaUint32Actuator: () => OcaUint32Actuator,
  OcaUint32Sensor: () => OcaUint32Sensor,
  OcaUint64Actuator: () => OcaUint64Actuator,
  OcaUint64Sensor: () => OcaUint64Sensor,
  OcaUint8Actuator: () => OcaUint8Actuator,
  OcaUint8Sensor: () => OcaUint8Sensor,
  OcaVoltageSensor: () => OcaVoltageSensor,
  OcaWorker: () => OcaWorker
});

// node_modules/aes70/src/controller/ControlClasses/OcaActuator.js
var OcaActuator = make_control_class(
  "OcaActuator",
  3,
  "",
  3,
  OcaWorker,
  [],
  [],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaAgent.js
var OcaAgent = make_control_class(
  "OcaAgent",
  2,
  "",
  3,
  OcaRoot,
  [
    ["GetLabel", 2, 1, [], [OcaString]],
    ["SetLabel", 2, 2, [OcaString], []],
    ["GetOwner", 2, 3, [], [OcaUint32]],
    ["GetPath", 2, 4, [], [OcaList(OcaString), OcaList(OcaUint32)]]
  ],
  [
    ["Label", [OcaString], 2, 1, false, false, null],
    ["Owner", [OcaUint32], 2, 2, true, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaApplicationNetworkCommand.js
var OcaApplicationNetworkCommand = class extends Enum({
  None: 0,
  Prepare: 1,
  Start: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaApplicationNetworkCommand.js
var OcaApplicationNetworkCommand2 = Enum8(OcaApplicationNetworkCommand);

// node_modules/aes70/src/types/OcaApplicationNetworkState.js
var OcaApplicationNetworkState = class extends Enum({
  Unknown: 0,
  NotReady: 1,
  Readying: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaApplicationNetworkState.js
var OcaApplicationNetworkState2 = Enum8(OcaApplicationNetworkState);

// node_modules/aes70/src/controller/ControlClasses/OcaApplicationNetwork.js
var OcaApplicationNetwork = make_control_class(
  "OcaApplicationNetwork",
  2,
  "",
  1,
  OcaRoot,
  [
    ["GetLabel", 2, 1, [], [OcaString]],
    ["SetLabel", 2, 2, [OcaString], []],
    ["GetOwner", 2, 3, [], [OcaUint32]],
    ["GetServiceID", 2, 4, [], [OcaBlob]],
    ["SetServiceID", 2, 5, [OcaBlob], []],
    ["GetSystemInterfaces", 2, 6, [], [OcaList(OcaBlob)]],
    ["SetSystemInterfaces", 2, 7, [OcaList(OcaBlob)], []],
    ["GetState", 2, 8, [], [OcaApplicationNetworkState2]],
    ["GetErrorCode", 2, 9, [], [OcaUint16]],
    ["Control", 2, 10, [OcaApplicationNetworkCommand2], []],
    ["GetPath", 2, 11, [], [OcaList(OcaString), OcaList(OcaUint32)]]
  ],
  [
    ["Label", [OcaString], 2, 1, false, true, null],
    ["Owner", [OcaUint32], 2, 2, true, false, null],
    ["ServiceID", [OcaBlob], 2, 3, false, false, null],
    ["SystemInterfaces", [OcaList(OcaBlob)], 2, 4, false, false, null],
    ["State", [OcaApplicationNetworkState2], 2, 5, false, false, null],
    ["ErrorCode", [OcaUint16], 2, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaLevelMeterLaw.js
var OcaLevelMeterLaw = class extends Enum({
  VU: 1,
  StandardVU: 2,
  PPM1: 3,
  PPM2: 4,
  LKFS: 5,
  RMS: 6,
  Peak: 7,
  ProprietaryValueBase: 128
}) {
};

// node_modules/aes70/src/OCP1/OcaLevelMeterLaw.js
var OcaLevelMeterLaw2 = Enum8(OcaLevelMeterLaw);

// node_modules/aes70/src/types/OcaSensorReadingState.js
var OcaSensorReadingState = class extends Enum({
  Unknown: 0,
  Valid: 1,
  Underrange: 2,
  Overrange: 3,
  Error: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaSensorReadingState.js
var OcaSensorReadingState2 = Enum8(OcaSensorReadingState);

// node_modules/aes70/src/controller/ControlClasses/OcaSensor.js
var OcaSensor = make_control_class(
  "OcaSensor",
  3,
  "",
  3,
  OcaWorker,
  [["GetReadingState", 3, 1, [], [OcaSensorReadingState2]]],
  [["ReadingState", [OcaSensorReadingState2], 3, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaLevelSensor.js
var OcaLevelSensor = make_control_class(
  "OcaLevelSensor",
  4,
  "",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaAudioLevelSensor.js
var OcaAudioLevelSensor = make_control_class(
  "OcaAudioLevelSensor",
  5,
  "",
  3,
  OcaLevelSensor,
  [
    ["GetLaw", 5, 1, [], [OcaLevelMeterLaw2]],
    ["SetLaw", 5, 2, [OcaLevelMeterLaw2], []]
  ],
  [["Law", [OcaLevelMeterLaw2], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaBasicActuator.js
var OcaBasicActuator = make_control_class(
  "OcaBasicActuator",
  4,
  "",
  3,
  OcaActuator,
  [],
  [],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaBasicSensor.js
var OcaBasicSensor = make_control_class(
  "OcaBasicSensor",
  4,
  "",
  3,
  OcaSensor,
  [],
  [],
  []
);

// node_modules/aes70/src/OCP1/OcaBitstring.js
function toByteLength(length) {
  return length + 7 >> 3;
}
function decodeBitstring(dataView, pos, len) {
  const result = new Array(len);
  const byteLength = toByteLength(len);
  const a8 = new Uint8Array(
    dataView.buffer,
    dataView.byteOffset + pos,
    byteLength
  );
  for (let i = 0; i < len; i++) {
    result[i] = !!(a8[i >> 3] & 128 >> (i & 7));
  }
  return result;
}
function encodeBitstring(dataView, pos, from) {
  const len = from.length;
  const byteLength = toByteLength(len);
  const a8 = new Uint8Array(
    dataView.buffer,
    dataView.byteOffset + pos,
    byteLength
  );
  for (let i = 0, j = 0; j < byteLength; j++) {
    let tmp = 0;
    for (let k = 0; k < 8 && i < len; k++, i++) {
      if (from[i]) {
        tmp |= 128 >> k;
      }
    }
    a8[j] = tmp;
  }
  return pos + byteLength;
}
var OcaBitstring = createType({
  isConstantLength: false,
  canEncode: function(value) {
    return Array.isArray(value);
  },
  encodedLength: function(value) {
    if (!Array.isArray(value)) throw new TypeError("Expected Array.");
    const length = value.length;
    if (length > 65535)
      throw new Error("Array too long for OcaBlob OCP.1 encoding.");
    return 2 + (length + 7 >> 3);
  },
  encodeTo: function(dataView, pos, value) {
    const length = value.length;
    dataView.setUint16(pos, length);
    pos += 2;
    return encodeBitstring(dataView, pos, value);
  },
  decodeFrom: function(dataView, pos) {
    const length = dataView.getUint16(pos);
    pos += 2;
    return [pos + toByteLength(length), decodeBitstring(dataView, pos, length)];
  },
  decodeLength: function(dataView, pos) {
    const length = dataView.getUint16(pos);
    return pos + 2 + toByteLength(length);
  }
});

// node_modules/aes70/src/controller/ControlClasses/OcaBitstringActuator.js
var OcaBitstringActuator = make_control_class(
  "OcaBitstringActuator",
  5,
  "\r",
  3,
  OcaBasicActuator,
  [
    ["GetNrBits", 5, 1, [], [OcaUint16]],
    ["GetBit", 5, 2, [OcaUint16], [OcaBoolean]],
    ["SetBit", 5, 3, [OcaUint16, OcaBoolean], []],
    ["GetSetting", 5, 4, [], [OcaBitstring], ["GetBitstring"]],
    ["SetSetting", 5, 5, [OcaBitstring], [], ["SetBitstring"]]
  ],
  [["Setting", [OcaBitstring], 5, 1, false, false, ["Bitstring"]]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaBitstringSensor.js
var OcaBitstringSensor = make_control_class(
  "OcaBitstringSensor",
  5,
  "\r",
  3,
  OcaBasicSensor,
  [
    ["GetNrBits", 5, 1, [], [OcaUint16]],
    ["GetBit", 5, 2, [OcaUint16], [OcaUint8]],
    ["GetReading", 5, 3, [], [OcaBitstring], ["GetBitString"]]
  ],
  [["Reading", [OcaBitstring], 5, 1, false, false, ["BitString"]]],
  []
);

// node_modules/aes70/src/types/OcaProtoObjectIdentification.js
var OcaProtoObjectIdentification = class {
  /**
   * Prototype object identification. Composite of prototype object number and
   * prototype object's class identification.
   * @class OcaProtoObjectIdentification
   */
  constructor(POno, ClassIdentification) {
    this.POno = POno;
    this.ClassIdentification = ClassIdentification;
  }
};

// node_modules/aes70/src/OCP1/OcaProtoObjectIdentification.js
var OcaProtoObjectIdentification2 = Struct(
  {
    POno: OcaUint32,
    ClassIdentification: OcaClassIdentification2
  },
  OcaProtoObjectIdentification
);

// node_modules/aes70/src/types/OcaProtoPort.js
var OcaProtoPort = class {
  /**
   * @class OcaProtoPort
   */
  constructor(Owner, ProtoID, Name) {
    this.Owner = Owner;
    this.ProtoID = ProtoID;
    this.Name = Name;
  }
};

// node_modules/aes70/src/OCP1/OcaProtoPort.js
var OcaProtoPort2 = Struct(
  {
    Owner: OcaUint32,
    ProtoID: OcaPortID2,
    Name: OcaString
  },
  OcaProtoPort
);

// node_modules/aes70/src/types/OcaVariant.js
var OcaVariant = class {
  /**
   * A class holding the value of an OcaVariant.
   * @class OcaVariant
   */
  constructor(index, value) {
    this.Index = index;
    this.Value = value;
  }
};

// node_modules/aes70/src/OCP1/OcaVariant.js
function OcaVariant2(...Types) {
  const canEncode2 = function(value) {
    if (typeof value === "object" && value instanceof OcaVariant) {
      return Types[value.Index].canEncode(value.Value);
    }
    for (const type of Types) {
      if (type.canEncode(value)) return true;
    }
    return false;
  };
  const encodeTo = function(dataView, pos, value) {
    if (typeof value === "object" && value instanceof OcaVariant) {
      dataView.setUint8(pos++, value.Index);
      return Types[value.Index].encodeTo(dataView, pos, value.Value);
    }
    for (let i = 0; i < Types.length; i++) {
      const type = Types[i];
      if (!type.canEncode(value)) continue;
      dataView.setUint8(pos++, i);
      return type.encodeTo(dataView, pos, value);
    }
    throw new TypeError("Cannot encode argument.");
  };
  const decodeFrom = function(dataView, pos) {
    const index = dataView.getUint8(pos++);
    const type = Types[index];
    const tmp = type.decodeFrom(dataView, pos);
    tmp[1] = new OcaVariant(index, tmp[1]);
    return tmp;
  };
  const decodeLength = function(dataView, pos) {
    const index = dataView.getUint8(pos);
    if (index >= Types.length) {
      throw new Error("OcaVariant index out of bounds.");
    }
    const type = Types[index];
    return type.decodeLength(dataView, pos + 1) + 1;
  };
  const isConstantLength = Types.every((type) => type.isConstantLength);
  if (isConstantLength) {
    const encodedLengths = Types.map((type) => type.encodedLength());
    if (encodedLengths.every((length) => length === encodedLengths[0])) {
      return createType({
        isConstantLength: true,
        encodedLength: function(value) {
          return encodedLengths[0] + 1;
        },
        canEncode: canEncode2,
        encodeTo,
        decodeFrom,
        decodeLength
      });
    }
  }
  return createType({
    isConstantLength: false,
    encodedLength: function(value) {
      if (typeof value === "object" && value instanceof OcaVariant) {
        return Types[value.Index].encodedLength(value.Value) + 1;
      }
      for (const type of Types) {
        if (type.canEncode(value)) {
          return 1 + type.encodedLength(value);
        }
      }
      throw new TypeError("Cannot encode argument.");
    },
    canEncode: canEncode2,
    encodeTo,
    decodeFrom,
    decodeLength
  });
}

// node_modules/aes70/src/types/OcaProtoPortClockMapEntry.js
var OcaProtoPortClockMapEntry = class {
  /**
   * Entry describing the clocking and sampling rate conversion (if any) of an
   * **OcaPort**. Stored in the **ProtoPortClockMap** property of
   * **OcaBlockFactoryAgent**.
   * @class OcaProtoPortClockMapEntry
   */
  constructor(ClockONo, SRCType) {
    this.ClockONo = ClockONo;
    this.SRCType = SRCType;
  }
};

// node_modules/aes70/src/OCP1/OcaProtoPortClockMapEntry.js
var OcaProtoPortClockMapEntry2 = Struct(
  {
    ClockONo: OcaVariant2(OcaUint32, OcaUint32),
    SRCType: OcaSamplingRateConverterType2
  },
  OcaProtoPortClockMapEntry
);

// node_modules/aes70/src/types/OcaProtoSignalPath.js
var OcaProtoSignalPath = class {
  /**
   * Prototype signal path between two prototype member ports in a factory.
   * @class OcaProtoSignalPath
   */
  constructor(OutputProtoPort, InputProtoPort) {
    this.OutputProtoPort = OutputProtoPort;
    this.InputProtoPort = InputProtoPort;
  }
};

// node_modules/aes70/src/OCP1/OcaProtoSignalPath.js
var OcaProtoSignalPath2 = Struct(
  {
    OutputProtoPort: OcaProtoPort2,
    InputProtoPort: OcaProtoPort2
  },
  OcaProtoSignalPath
);

// node_modules/aes70/src/controller/ControlClasses/OcaBlockFactoryAgent.js
var OcaBlockFactoryAgent = make_control_class(
  "OcaBlockFactoryAgent",
  3,
  "",
  1,
  OcaAgent,
  [
    ["GetGlobalType", 3, 1, [], [OcaGlobalTypeIdentifier2]],
    ["SetGlobalType", 3, 2, [OcaGlobalTypeIdentifier2], []],
    [
      "AddProtoActionObject",
      3,
      3,
      [String16, OcaList(OcaConstructionParameter2)],
      [OcaUint32]
    ],
    ["AddProtoBlockUsingFactory", 3, 4, [OcaUint32], [OcaUint32]],
    [
      "GetProtoActionObjects",
      3,
      5,
      [],
      [OcaList(OcaProtoObjectIdentification2)]
    ],
    [
      "AddProtoDatasetObject",
      3,
      6,
      [String16, OcaList(OcaConstructionParameter2)],
      [OcaUint32]
    ],
    [
      "GetProtoDatasetObjects",
      3,
      7,
      [],
      [OcaList(OcaProtoObjectIdentification2)]
    ],
    ["DeleteProtoMember", 3, 8, [OcaUint32], []],
    ["GetProtoBlockPorts", 3, 9, [], [OcaList(OcaProtoPort2)]],
    ["SetProtoBlockPorts", 3, 10, [OcaList(OcaProtoPort2)], []],
    ["SetProtoBlockPort", 3, 11, [OcaString, OcaIODirection2], [OcaPortID2]],
    ["DeleteProtoBlockPort", 3, 12, [OcaPortID2], []],
    ["GetProtoSignalPaths", 3, 13, [], [OcaMap(OcaUint16, OcaProtoSignalPath2)]],
    ["SetProtoSignalPaths", 3, 14, [OcaMap(OcaUint16, OcaProtoSignalPath2)], []],
    ["SetProtoSignalPath", 3, 15, [OcaProtoSignalPath2], [OcaUint16]],
    ["DeleteProtoSignalPath", 3, 16, [], [OcaUint16]],
    [
      "GetProtoBlockPortClockMap",
      3,
      17,
      [],
      [OcaMap(OcaPortID2, OcaProtoPortClockMapEntry2)]
    ],
    [
      "SetProtoBlockPortClockMap",
      3,
      18,
      [OcaMap(OcaPortID2, OcaProtoPortClockMapEntry2)],
      []
    ],
    [
      "SetProtoBlockPortClockMapEntry",
      3,
      19,
      [OcaPortID2, OcaProtoPortClockMapEntry2],
      []
    ],
    ["DeleteProtoBlockPortClockMapEntry", 3, 20, [OcaPortID2], []]
  ],
  [
    ["GlobalType", [OcaGlobalTypeIdentifier2], 3, 1, false, false, null],
    [
      "ProtoActionObjects",
      [OcaList(OcaProtoObjectIdentification2)],
      3,
      2,
      false,
      false,
      null
    ],
    [
      "ProtoDatasetObjects",
      [OcaList(OcaProtoObjectIdentification2)],
      3,
      3,
      false,
      false,
      null
    ],
    ["ProtoBlockPorts", [OcaList(OcaProtoPort2)], 3, 4, false, false, null],
    [
      "ProtoBlockPortClockMap",
      [OcaMap(OcaPortID2, OcaProtoPortClockMapEntry2)],
      3,
      5,
      false,
      false,
      null
    ],
    [
      "ProtoSignalPaths",
      [OcaMap(OcaUint16, OcaProtoSignalPath2)],
      3,
      6,
      false,
      false,
      null
    ]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaBooleanActuator.js
var OcaBooleanActuator = make_control_class(
  "OcaBooleanActuator",
  5,
  "",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaBoolean]],
    ["SetSetting", 5, 2, [OcaBoolean], []]
  ],
  [["Setting", [OcaBoolean], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaBooleanSensor.js
var OcaBooleanSensor = make_control_class(
  "OcaBooleanSensor",
  5,
  "",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaBoolean]]],
  [["Reading", [OcaBoolean], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaCommand.js
var OcaCommand = class {
  /**
   * A member of a CommandSet. See the datatype **OcaCommandSet**.
   * @class OcaCommand
   */
  constructor(Method, Parameters) {
    this.Method = Method;
    this.Parameters = Parameters;
  }
};

// node_modules/aes70/src/OCP1/OcaCommand.js
var OcaCommand2 = Struct(
  {
    Method: OcaMethod2,
    Parameters: OcaList(OcaLongBlob)
  },
  OcaCommand
);

// node_modules/aes70/src/OCP1/OcaProgramRunMode.js
var OcaProgramRunMode = Bitset16;

// node_modules/aes70/src/controller/ControlClasses/OcaDataset.js
var OcaDataset = make_control_class(
  "OcaDataset",
  2,
  "",
  1,
  OcaRoot,
  [
    ["OpenRead", 2, 1, [OcaLockState2], [OcaUint64, OcaUint32]],
    ["OpenWrite", 2, 2, [OcaLockState2], [OcaUint64, OcaUint32]],
    ["Close", 2, 3, [OcaUint32], []],
    [
      "Read",
      2,
      4,
      [OcaUint32, OcaUint64, OcaUint64],
      [OcaBoolean, OcaLongBlob]
    ],
    ["Write", 2, 5, [OcaUint32, OcaUint64, OcaLongBlob], []],
    ["Clear", 2, 6, [OcaUint32], []],
    ["GetOwner", 2, 7, [], [OcaUint32]],
    ["GetName", 2, 8, [], [OcaString]],
    ["SetName", 2, 9, [OcaString], []],
    ["GetType", 2, 10, [], [OcaString]],
    ["SetType", 2, 11, [OcaString], []],
    ["GetReadOnly", 2, 12, [], [OcaBoolean]],
    ["SetReadOnly", 2, 13, [OcaBoolean], []],
    ["GetLastModificationTime", 2, 14, [], [OcaTime2]],
    ["GetDatasetSizes", 2, 15, [], [OcaUint64, OcaUint64]]
  ],
  [
    ["Owner", [OcaUint32], 2, 1, true, false, null],
    ["Name", [OcaString], 2, 2, false, false, null],
    ["Type", [OcaString], 2, 3, false, false, null],
    ["ReadOnly", [OcaBoolean], 2, 4, false, false, null],
    ["LastModificationTime", [OcaTime2], 2, 5, false, false, null],
    ["MaxSize", [OcaUint64], 2, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaProgram.js
var OcaProgram = make_control_class(
  "OcaProgram",
  3,
  "",
  1,
  OcaDataset,
  [
    ["GetSupportedRunModes", 3, 1, [], [OcaList(OcaProgramRunMode)]],
    ["SetSupportedRunModes", 3, 2, [OcaList(OcaProgramRunMode)], []]
  ],
  [
    [
      "SupportedRunModes",
      [OcaList(OcaProgramRunMode)],
      3,
      1,
      false,
      false,
      null
    ]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaCommandSet.js
var OcaCommandSet = make_control_class(
  "OcaCommandSet",
  4,
  "",
  2,
  OcaProgram,
  [
    ["GetCommands", 4, 1, [], [OcaList(OcaCommand2)]],
    ["SetCommands", 4, 2, [OcaList(OcaCommand2)], []],
    ["GetCommand", 4, 3, [OcaUint16], [OcaCommand2]],
    ["SetCommand", 4, 4, [OcaUint16, OcaCommand2], []],
    ["InsertCommand", 4, 5, [OcaUint16, OcaCommand2], []],
    ["DeleteCommand", 4, 6, [OcaUint16], []],
    ["Clear", 4, 7, [], []]
  ],
  [["Commands", [OcaList(OcaCommand2)], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaCommandResult.js
var OcaCommandResult = class {
  /**
   * Execution result of a Command in a Commandset.
   * @class OcaCommandResult
   */
  constructor(Status, Data) {
    this.Status = Status;
    this.Data = Data;
  }
};

// node_modules/aes70/src/OCP1/OcaCommandResult.js
var OcaCommandResult2 = Struct(
  {
    Status: OcaStatus2,
    Data: OcaList(OcaLongBlob)
  },
  OcaCommandResult
);

// node_modules/aes70/src/OCP1/OcaList32.js
var OcaList32 = createListType(4);

// node_modules/aes70/src/controller/ControlClasses/OcaCommandSetAgent.js
var OcaCommandSetAgent = make_control_class(
  "OcaCommandSetAgent",
  3,
  "",
  1,
  OcaAgent,
  [["Execute", 3, 1, [OcaList32(OcaCommand2)], [OcaList32(OcaCommandResult2)]]],
  [],
  []
);

// node_modules/aes70/src/types/OcaNetworkControlProtocol.js
var OcaNetworkControlProtocol = class extends Enum({
  None: 0,
  OCP01: 1,
  OCP02: 2,
  OCP03: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkControlProtocol.js
var OcaNetworkControlProtocol2 = Enum8(OcaNetworkControlProtocol);

// node_modules/aes70/src/controller/ControlClasses/OcaControlNetwork.js
var OcaControlNetwork = make_control_class(
  "OcaControlNetwork",
  3,
  "",
  1,
  OcaApplicationNetwork,
  [["GetControlProtocol", 3, 1, [], [OcaNetworkControlProtocol2]]],
  [
    [
      "Protocol",
      [OcaNetworkControlProtocol2],
      3,
      1,
      false,
      false,
      ["ControlProtocol"]
    ]
  ],
  []
);

// node_modules/aes70/src/types/OcaRelationalOperator.js
var OcaRelationalOperator = class extends Enum({
  None: 0,
  Equality: 1,
  Inequality: 2,
  GreaterThan: 3,
  GreaterThanOrEqual: 4,
  LessThan: 5,
  LessThanOrEqual: 6
}) {
};

// node_modules/aes70/src/OCP1/OcaRelationalOperator.js
var OcaRelationalOperator2 = Enum8(OcaRelationalOperator);

// node_modules/aes70/src/types/OcaCounterNotifierFilterParameters.js
var OcaCounterNotifierFilterParameters = class {
  /**
   * Filter parameters for **OcaCountersetNotifier**.
   * @class OcaCounterNotifierFilterParameters
   */
  constructor(Threshold, Operator, Period, CountDelta) {
    this.Threshold = Threshold;
    this.Operator = Operator;
    this.Period = Period;
    this.CountDelta = CountDelta;
  }
};

// node_modules/aes70/src/OCP1/OcaCounterNotifierFilterParameters.js
var OcaCounterNotifierFilterParameters2 = Struct(
  {
    Threshold: OcaUint64,
    Operator: OcaRelationalOperator2,
    Period: OcaFloat32,
    CountDelta: OcaUint64
  },
  OcaCounterNotifierFilterParameters
);

// node_modules/aes70/src/types/OcaCounterUpdate.js
var OcaCounterUpdate = class {
  /**
   * Descriptor of a Counter update, used by **OcaCounterNotifier**, in its
   * **CounterUpdate()** event and its **GetLastUpdate()** method.
   * @class OcaCounterUpdate
   */
  constructor(CounterSetID, CounterID, Value) {
    this.CounterSetID = CounterSetID;
    this.CounterID = CounterID;
    this.Value = Value;
  }
};

// node_modules/aes70/src/OCP1/OcaCounterUpdate.js
var OcaCounterUpdate2 = Struct(
  {
    CounterSetID: OcaBlob,
    CounterID: OcaUint16,
    Value: OcaUint64
  },
  OcaCounterUpdate
);

// node_modules/aes70/src/types/OcaCounterUpdateEventData.js
var OcaCounterUpdateEventData = class {
  /**
   * Notification data supplied by **OcaCounterNotifier.CounterUpdate()** event
   * @class OcaCounterUpdateEventData
   */
  constructor(Updates) {
    this.Updates = Updates;
  }
};

// node_modules/aes70/src/OCP1/OcaCounterUpdateEventData.js
var OcaCounterUpdateEventData2 = Struct(
  {
    Updates: OcaList(OcaCounterUpdate2)
  },
  OcaCounterUpdateEventData
);

// node_modules/aes70/src/controller/ControlClasses/OcaCounterNotifier.js
var OcaCounterNotifier = make_control_class(
  "OcaCounterNotifier",
  3,
  "",
  1,
  OcaAgent,
  [
    ["GetLastUpdate", 3, 1, [], [OcaList(OcaCounterUpdate2)]],
    ["GetFilterParameters", 3, 2, [], [OcaCounterNotifierFilterParameters2]],
    ["SetFilterParameters", 3, 3, [OcaCounterNotifierFilterParameters2], []]
  ],
  [
    [
      "FilterParameters",
      [OcaCounterNotifierFilterParameters2],
      3,
      1,
      false,
      false,
      null
    ]
  ],
  [["CounterUpdate", 3, 1, [OcaCounterUpdateEventData2]]]
);

// node_modules/aes70/src/controller/ControlClasses/OcaCurrentSensor.js
var OcaCurrentSensor = make_control_class(
  "OcaCurrentSensor",
  4,
  "\b",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaDatasetWorker.js
var OcaDatasetWorker = make_control_class(
  "OcaDatasetWorker",
  3,
  "\x07",
  3,
  OcaWorker,
  [["GetDatasetONo", 3, 1, [], [OcaUint32]]],
  [["DatasetONo", [OcaUint32], 3, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaDelay.js
var OcaDelay = make_control_class(
  "OcaDelay",
  4,
  "\x07",
  3,
  OcaActuator,
  [
    ["GetDelayTime", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetDelayTime", 4, 2, [OcaFloat32], []]
  ],
  [["DelayTime", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaDelayUnit.js
var OcaDelayUnit = class extends Enum({
  Time: 1,
  Distance: 2,
  Samples: 3,
  Microseconds: 4,
  Milliseconds: 5,
  Centimeters: 6,
  Inches: 7,
  Feet: 8
}) {
};

// node_modules/aes70/src/OCP1/OcaDelayUnit.js
var OcaDelayUnit2 = Enum8(OcaDelayUnit);

// node_modules/aes70/src/types/OcaDelayValue.js
var OcaDelayValue = class {
  /**
   * Multifield descriptor that defines a delay value element. This datatype is
   * **deprecated** in AES70-2022.
   * @class OcaDelayValue
   */
  constructor(DelayValue, DelayUnit) {
    this.DelayValue = DelayValue;
    this.DelayUnit = DelayUnit;
  }
};

// node_modules/aes70/src/OCP1/OcaDelayValue.js
var OcaDelayValue2 = Struct(
  {
    DelayValue: OcaFloat32,
    DelayUnit: OcaDelayUnit2
  },
  OcaDelayValue
);

// node_modules/aes70/src/controller/ControlClasses/OcaDelayExtended.js
var OcaDelayExtended = make_control_class(
  "OcaDelayExtended",
  5,
  "\x07",
  3,
  OcaDelay,
  [
    ["GetDelayValue", 5, 1, [], [OcaDelayValue2, OcaDelayValue2, OcaDelayValue2]],
    ["SetDelayValue", 5, 2, [OcaDelayValue2], []],
    ["GetDelayValueConverted", 5, 3, [OcaDelayUnit2], [OcaDelayValue2]]
  ],
  [["DelayValue", [OcaDelayValue2], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaDBr.js
var OcaDBr = class {
  /**
   * An absolute level expressed in dB above the given absolute reference level.
   * @class OcaDBr
   */
  constructor(Value, Ref) {
    this.Value = Value;
    this.Ref = Ref;
  }
};

// node_modules/aes70/src/OCP1/OcaDBr.js
var OcaDBr2 = Struct(
  {
    Value: OcaFloat32,
    Ref: OcaFloat32
  },
  OcaDBr
);

// node_modules/aes70/src/types/OcaDynamicsFunction.js
var OcaDynamicsFunction = class extends Enum({
  None: 0,
  Compress: 1,
  Limit: 2,
  Expand: 3,
  Gate: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaDynamicsFunction.js
var OcaDynamicsFunction2 = Enum8(OcaDynamicsFunction);

// node_modules/aes70/src/types/OcaLevelDetectionLaw.js
var OcaLevelDetectionLaw = class extends Enum({
  None: 0,
  RMS: 1,
  Peak: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaLevelDetectionLaw.js
var OcaLevelDetectionLaw2 = Enum8(OcaLevelDetectionLaw);

// node_modules/aes70/src/OCP1/OcaParameterMask.js
var OcaParameterMask = Bitset16;

// node_modules/aes70/src/types/OcaPresentationUnit.js
var OcaPresentationUnit = class extends Enum({
  dBu: 0,
  dBV: 1,
  V: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaPresentationUnit.js
var OcaPresentationUnit2 = Enum8(OcaPresentationUnit);

// node_modules/aes70/src/controller/ControlClasses/OcaDynamics.js
var OcaDynamics = make_control_class(
  "OcaDynamics",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetTriggered", 4, 1, [], [OcaBoolean]],
    ["GetDynamicGain", 4, 2, [], [OcaFloat32]],
    ["GetFunction", 4, 3, [], [OcaDynamicsFunction2]],
    ["SetFunction", 4, 4, [OcaDynamicsFunction2], []],
    ["GetRatio", 4, 5, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetRatio", 4, 6, [OcaFloat32], []],
    ["GetThreshold", 4, 7, [], [OcaDBr2, OcaFloat32, OcaFloat32]],
    ["SetThreshold", 4, 8, [OcaDBr2], []],
    ["GetThresholdPresentationUnits", 4, 9, [], [OcaPresentationUnit2]],
    ["SetThresholdPresentationUnits", 4, 10, [OcaPresentationUnit2], []],
    ["GetDetectorLaw", 4, 11, [], [OcaLevelDetectionLaw2]],
    ["SetDetectorLaw", 4, 12, [OcaLevelDetectionLaw2], []],
    ["GetAttackTime", 4, 13, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetAttackTime", 4, 14, [OcaFloat32], []],
    ["GetReleaseTime", 4, 15, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetReleaseTime", 4, 16, [OcaFloat32], []],
    ["GetHoldTime", 4, 17, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetHoldTime", 4, 18, [OcaFloat32], []],
    ["GetDynamicGainFloor", 4, 19, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetDynamicGainFloor", 4, 20, [OcaFloat32], []],
    ["GetDynamicGainCeiling", 4, 21, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetDynamicGainCeiling", 4, 22, [OcaFloat32], []],
    ["GetKneeParameter", 4, 23, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetKneeParameter", 4, 24, [OcaFloat32], []],
    ["GetSlope", 4, 25, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetSlope", 4, 26, [OcaFloat32], []],
    [
      "SetMultiple",
      4,
      27,
      [
        OcaParameterMask,
        OcaDynamicsFunction2,
        OcaDBr2,
        OcaPresentationUnit2,
        OcaLevelDetectionLaw2,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32
      ],
      []
    ]
  ],
  [
    ["Triggered", [OcaBoolean], 4, 1, false, false, null],
    ["DynamicGain", [OcaFloat32], 4, 2, false, false, null],
    ["Function", [OcaDynamicsFunction2], 4, 3, false, false, null],
    ["Ratio", [OcaFloat32], 4, 4, false, false, null],
    ["Threshold", [OcaDBr2], 4, 5, false, false, null],
    [
      "ThresholdPresentationUnits",
      [OcaPresentationUnit2],
      4,
      6,
      false,
      false,
      null
    ],
    ["DetectorLaw", [OcaLevelDetectionLaw2], 4, 7, false, false, null],
    ["AttackTime", [OcaFloat32], 4, 8, false, false, null],
    ["ReleaseTime", [OcaFloat32], 4, 9, false, false, null],
    ["HoldTime", [OcaFloat32], 4, 10, false, false, null],
    ["DynamicGainCeiling", [OcaFloat32], 4, 11, false, false, null],
    ["DynamicGainFloor", [OcaFloat32], 4, 12, false, false, null],
    ["KneeParameter", [OcaFloat32], 4, 13, false, false, null],
    ["Slope", [OcaFloat32], 4, 14, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaDynamicsCurve.js
var OcaDynamicsCurve = make_control_class(
  "OcaDynamicsCurve",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetNSegments", 4, 1, [], [OcaUint8, OcaUint8, OcaUint8]],
    ["SetNSegments", 4, 2, [OcaUint8], []],
    ["GetThreshold", 4, 3, [], [OcaDBr2, OcaFloat32, OcaFloat32]],
    ["SetThresholds", 4, 4, [OcaList(OcaDBr2)], [], ["SetThreshold"]],
    [
      "GetSlopes",
      4,
      5,
      [],
      [OcaList(OcaFloat32), OcaList(OcaFloat32), OcaList(OcaFloat32)],
      ["GetSlope"]
    ],
    ["SetSlopes", 4, 6, [OcaList(OcaFloat32)], [], ["SetSlope"]],
    [
      "GetKneeParameters",
      4,
      7,
      [],
      [OcaList(OcaFloat32), OcaList(OcaFloat32), OcaList(OcaFloat32)],
      ["GetKneeParameter"]
    ],
    [
      "SetKneeParameters",
      4,
      8,
      [OcaList(OcaFloat32)],
      [],
      ["SetKneeParameter"]
    ],
    ["GetDynamicGainCeiling", 4, 9, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetDynamicGainCeiling", 4, 10, [OcaFloat32], []],
    ["GetDynamicGainFloor", 4, 11, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetDynamicGainFloor", 4, 12, [OcaFloat32], []],
    [
      "SetMultiple",
      4,
      13,
      [
        OcaParameterMask,
        OcaUint8,
        OcaList(OcaDBr2),
        OcaList(OcaFloat32),
        OcaList(OcaFloat32),
        OcaFloat32,
        OcaFloat32
      ],
      []
    ],
    ["GetThresholds", 4, 14, [], [OcaList(OcaDBr2), OcaFloat32, OcaFloat32]]
  ],
  [
    ["nSegments", [OcaUint8], 4, 1, false, false, null],
    ["Thresholds", [OcaList(OcaDBr2)], 4, 2, false, false, ["Threshold"]],
    ["Slopes", [OcaList(OcaFloat32)], 4, 3, false, false, ["Slope"]],
    [
      "KneeParameters",
      [OcaList(OcaFloat32)],
      4,
      4,
      false,
      false,
      ["KneeParameter"]
    ],
    ["DynamicGainFloor", [OcaFloat32], 4, 5, false, false, null],
    ["DynamicGainCeiling", [OcaFloat32], 4, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaDynamicsDetector.js
var OcaDynamicsDetector = make_control_class(
  "OcaDynamicsDetector",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetLaw", 4, 1, [], [OcaLevelDetectionLaw2]],
    ["SetLaw", 4, 2, [OcaLevelDetectionLaw2], []],
    ["GetAttackTime", 4, 3, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetAttackTime", 4, 4, [OcaFloat32], []],
    ["GetReleaseTime", 4, 5, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetReleaseTime", 4, 6, [OcaFloat32], []],
    ["GetHoldTime", 4, 7, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetHoldTime", 4, 8, [OcaFloat32], []],
    [
      "SetMultiple",
      4,
      9,
      [
        OcaParameterMask,
        OcaLevelDetectionLaw2,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32
      ],
      []
    ]
  ],
  [
    ["Law", [OcaLevelDetectionLaw2], 4, 1, false, false, null],
    ["AttackTime", [OcaFloat32], 4, 2, false, false, null],
    ["ReleaseTime", [OcaFloat32], 4, 3, false, false, null],
    ["HoldTime", [OcaFloat32], 4, 4, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaTransferFunction.js
var OcaTransferFunction = class {
  /**
   * Complex (i.e. magnitude + phase) transfer function.
   * @class OcaTransferFunction
   */
  constructor(Frequency, Amplitude, Phase) {
    this.Frequency = Frequency;
    this.Amplitude = Amplitude;
    this.Phase = Phase;
  }
};

// node_modules/aes70/src/OCP1/OcaTransferFunction.js
var OcaTransferFunction2 = Struct(
  {
    Frequency: OcaList(OcaFloat32),
    Amplitude: OcaList(OcaFloat32),
    Phase: OcaList(OcaFloat32)
  },
  OcaTransferFunction
);

// node_modules/aes70/src/controller/ControlClasses/OcaFilterArbitraryCurve.js
var OcaFilterArbitraryCurve = make_control_class(
  "OcaFilterArbitraryCurve",
  4,
  "\r",
  3,
  OcaActuator,
  [
    ["GetTransferFunction", 4, 1, [], [OcaTransferFunction2]],
    ["SetTransferFunction", 4, 2, [OcaTransferFunction2], []],
    ["GetSampleRate", 4, 3, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetSampleRate", 4, 4, [OcaFloat32], []],
    ["GetTFMinLength", 4, 5, [], [OcaUint16]],
    ["GetTFMaxLength", 4, 6, [], [OcaUint16]]
  ],
  [
    ["TransferFunction", [OcaTransferFunction2], 4, 1, false, false, null],
    ["SampleRate", [OcaFloat32], 4, 2, false, false, null],
    ["TFMinLength", [OcaUint16], 4, 3, false, false, null],
    ["TFMaxLength", [OcaUint16], 4, 4, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaClassicalFilterShape.js
var OcaClassicalFilterShape = class extends Enum({
  Butterworth: 1,
  Bessel: 2,
  Chebyshev: 3,
  LinkwitzRiley: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaClassicalFilterShape.js
var OcaClassicalFilterShape2 = Enum8(OcaClassicalFilterShape);

// node_modules/aes70/src/types/OcaFilterPassband.js
var OcaFilterPassband = class extends Enum({
  HiPass: 1,
  LowPass: 2,
  BandPass: 3,
  BandReject: 4,
  AllPass: 5
}) {
};

// node_modules/aes70/src/OCP1/OcaFilterPassband.js
var OcaFilterPassband2 = Enum8(OcaFilterPassband);

// node_modules/aes70/src/controller/ControlClasses/OcaFilterClassical.js
var OcaFilterClassical = make_control_class(
  "OcaFilterClassical",
  4,
  "	",
  3,
  OcaActuator,
  [
    ["GetFrequency", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetFrequency", 4, 2, [OcaFloat32], []],
    ["GetPassband", 4, 3, [], [OcaFilterPassband2]],
    ["SetPassband", 4, 4, [OcaFilterPassband2], []],
    ["GetShape", 4, 5, [], [OcaClassicalFilterShape2]],
    ["SetShape", 4, 6, [OcaClassicalFilterShape2], []],
    ["GetOrder", 4, 7, [], [OcaUint16, OcaUint16, OcaUint16]],
    ["SetOrder", 4, 8, [OcaUint16], []],
    ["GetParameter", 4, 9, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetParameter", 4, 10, [OcaFloat32], []],
    [
      "SetMultiple",
      4,
      11,
      [
        OcaParameterMask,
        OcaFloat32,
        OcaFilterPassband2,
        OcaClassicalFilterShape2,
        OcaUint16,
        OcaFloat32
      ],
      []
    ]
  ],
  [
    ["Frequency", [OcaFloat32], 4, 1, false, false, null],
    ["Passband", [OcaFilterPassband2], 4, 2, false, false, null],
    ["Shape", [OcaClassicalFilterShape2], 4, 3, false, false, null],
    ["Order", [OcaUint16], 4, 4, false, false, null],
    ["Parameter", [OcaFloat32], 4, 5, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaFilterFIR.js
var OcaFilterFIR = make_control_class(
  "OcaFilterFIR",
  4,
  "\f",
  3,
  OcaActuator,
  [
    ["GetLength", 4, 1, [], [OcaUint32, OcaUint32, OcaUint32]],
    ["GetCoefficients", 4, 2, [], [OcaList(OcaFloat32)]],
    ["SetCoefficients", 4, 3, [OcaList(OcaFloat32)], []],
    ["GetSampleRate", 4, 4, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetSampleRate", 4, 5, [OcaFloat32], []]
  ],
  [
    ["Length", [OcaUint32], 4, 1, false, false, null],
    ["Coefficients", [OcaList(OcaFloat32)], 4, 2, false, false, null],
    ["SampleRate", [OcaFloat32], 4, 3, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaParametricEQShape.js
var OcaParametricEQShape = class extends Enum({
  None: 0,
  PEQ: 1,
  LowShelv: 2,
  HighShelv: 3,
  LowPass: 4,
  HighPass: 5,
  BandPass: 6,
  AllPass: 7,
  Notch: 8,
  ToneControlLowFixed: 9,
  ToneControlLowSliding: 10,
  ToneControlHighFixed: 11,
  ToneControlHighSliding: 12
}) {
};

// node_modules/aes70/src/OCP1/OcaParametricEQShape.js
var OcaParametricEQShape2 = Enum8(OcaParametricEQShape);

// node_modules/aes70/src/controller/ControlClasses/OcaFilterParametric.js
var OcaFilterParametric = make_control_class(
  "OcaFilterParametric",
  4,
  "\n",
  3,
  OcaActuator,
  [
    ["GetFrequency", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetFrequency", 4, 2, [OcaFloat32], []],
    ["GetShape", 4, 3, [], [OcaParametricEQShape2]],
    ["SetShape", 4, 4, [OcaParametricEQShape2], []],
    [
      "GetWidthParameter",
      4,
      5,
      [],
      [OcaFloat32, OcaFloat32, OcaFloat32],
      ["GetQ"]
    ],
    ["SetWidthParameter", 4, 6, [OcaFloat32], [], ["SetQ"]],
    ["GetInbandGain", 4, 7, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetInbandGain", 4, 8, [OcaFloat32], [], ["SetInbandgain"]],
    ["GetShapeParameter", 4, 9, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetShapeParameter", 4, 10, [OcaFloat32], []],
    [
      "SetMultiple",
      4,
      11,
      [
        OcaParameterMask,
        OcaFloat32,
        OcaParametricEQShape2,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32
      ],
      []
    ]
  ],
  [
    ["Frequency", [OcaFloat32], 4, 1, false, false, null],
    ["Shape", [OcaParametricEQShape2], 4, 2, false, false, null],
    ["WidthParameter", [OcaFloat32], 4, 3, false, false, ["Q"]],
    ["InBandGain", [OcaFloat32], 4, 4, false, false, ["InbandGain"]],
    ["ShapeParameter", [OcaFloat32], 4, 5, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaFilterPolynomial.js
var OcaFilterPolynomial = make_control_class(
  "OcaFilterPolynomial",
  4,
  "\v",
  3,
  OcaActuator,
  [
    ["GetCoefficients", 4, 1, [], [OcaList(OcaFloat32), OcaList(OcaFloat32)]],
    ["SetCoefficients", 4, 2, [OcaList(OcaFloat32), OcaList(OcaFloat32)], []],
    ["GetSampleRate", 4, 3, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetSampleRate", 4, 4, [OcaFloat32], []],
    ["GetMaxOrder", 4, 5, [], [OcaUint8]]
  ],
  [
    [
      "A",
      [OcaList(OcaFloat32)],
      4,
      1,
      false,
      false,
      null,
      {
        get: { name: "GetCoefficients", index: 0 },
        set: { name: "SetCoefficients", index: 0 }
      }
    ],
    [
      "B",
      [OcaList(OcaFloat32)],
      4,
      2,
      false,
      false,
      null,
      {
        get: { name: "GetCoefficients", index: 1 },
        set: { name: "SetCoefficients", index: 1 }
      }
    ],
    ["SampleRate", [OcaFloat32], 4, 3, false, false, null],
    ["MaxOrder", [OcaUint8], 4, 4, true, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaFloat32Actuator.js
var OcaFloat32Actuator = make_control_class(
  "OcaFloat32Actuator",
  5,
  "\n",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetSetting", 5, 2, [OcaFloat32], []]
  ],
  [["Setting", [OcaFloat32], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaFloat32Sensor.js
var OcaFloat32Sensor = make_control_class(
  "OcaFloat32Sensor",
  5,
  "\n",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/OCP1/OcaFloat64.js
var OcaFloat64 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 8;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setFloat64(pos, +value, false);
    return pos + 8;
  },
  decode: function(dataView, pos) {
    return dataView.getFloat64(pos, false);
  }
});

// node_modules/aes70/src/controller/ControlClasses/OcaFloat64Actuator.js
var OcaFloat64Actuator = make_control_class(
  "OcaFloat64Actuator",
  5,
  "\v",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaFloat64, OcaFloat64, OcaFloat64]],
    ["SetSetting", 5, 2, [OcaFloat64], []]
  ],
  [["Setting", [OcaFloat64], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaFloat64Sensor.js
var OcaFloat64Sensor = make_control_class(
  "OcaFloat64Sensor",
  5,
  "\v",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaFloat64, OcaFloat64, OcaFloat64]]],
  [["Reading", [OcaFloat64], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaFrequencyActuator.js
var OcaFrequencyActuator = make_control_class(
  "OcaFrequencyActuator",
  4,
  "\b",
  3,
  OcaActuator,
  [
    ["GetFrequency", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetFrequency", 4, 2, [OcaFloat32], []]
  ],
  [["Frequency", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaFrequencySensor.js
var OcaFrequencySensor = make_control_class(
  "OcaFrequencySensor",
  4,
  "",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaGain.js
var OcaGain = make_control_class(
  "OcaGain",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetGain", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetGain", 4, 2, [OcaFloat32], []]
  ],
  [["Gain", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaGainSensor.js
var OcaGainSensor = make_control_class(
  "OcaGainSensor",
  4,
  "\n",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaGroupException.js
var OcaGroupException = class {
  /**
   * Member of the OcaGroupExceptionEventData list.
   * @class OcaGroupException
   */
  constructor(ONo, MethodID, Status) {
    this.ONo = ONo;
    this.MethodID = MethodID;
    this.Status = Status;
  }
};

// node_modules/aes70/src/OCP1/OcaGroupException.js
var OcaGroupException2 = Struct(
  {
    ONo: OcaUint32,
    MethodID: OcaMethodID2,
    Status: OcaStatus2
  },
  OcaGroupException
);

// node_modules/aes70/src/controller/ControlClasses/OcaGroup.js
var OcaGroup = make_control_class(
  "OcaGroup",
  3,
  "",
  4,
  OcaAgent,
  [
    ["GetMembers", 3, 1, [], [OcaList(OcaUint32)]],
    ["SetMembers", 3, 2, [OcaList(OcaUint32)], []],
    ["AddMember", 3, 3, [OcaUint32], []],
    ["RemoveMember", 3, 4, [OcaUint32], []],
    ["GetGroupControllerONo", 3, 5, [], [OcaUint32]],
    ["SetGroupControllerONo", 3, 6, [OcaUint32], []],
    ["GetAggregationRule", 3, 7, [], [OcaString]],
    ["SetAggregationRule", 3, 8, [OcaString], []],
    ["GetSaturationRule", 3, 9, [], [OcaString]],
    ["SetSaturationRule", 3, 10, [OcaString], []]
  ],
  [
    ["Members", [OcaList(OcaUint32)], 3, 1, false, false, null],
    ["GroupControllerONo", [OcaUint32], 3, 2, false, false, null],
    ["AggregationRule", [OcaString], 3, 3, false, false, null],
    ["SaturationRule", [OcaString], 3, 4, false, false, null]
  ],
  [["GroupException", 3, 1, [OcaList(OcaGroupException2)]]]
);

// node_modules/aes70/src/types/OcaOPath.js
var OcaOPath = class {
  /**
   * Object address. Composite of network address in which object resides, and
   * object number.
   * @class OcaOPath
   */
  constructor(HostID, ONo) {
    this.HostID = HostID;
    this.ONo = ONo;
  }
};

// node_modules/aes70/src/OCP1/OcaOPath.js
var OcaOPath2 = Struct(
  {
    HostID: OcaBlob,
    ONo: OcaUint32
  },
  OcaOPath
);

// node_modules/aes70/src/types/OcaGrouperCitizen.js
var OcaGrouperCitizen = class {
  /**
   * Describes a Citizen of a Grouper. Refers to a specific Worker object
   * somewhere in the media network. **Deprecated** in AES70-2024.
   * @class OcaGrouperCitizen
   */
  constructor(Index, ObjectPath, Online) {
    this.Index = Index;
    this.ObjectPath = ObjectPath;
    this.Online = Online;
  }
};

// node_modules/aes70/src/OCP1/OcaGrouperCitizen.js
var OcaGrouperCitizen2 = Struct(
  {
    Index: OcaUint16,
    ObjectPath: OcaOPath2,
    Online: OcaBoolean
  },
  OcaGrouperCitizen
);

// node_modules/aes70/src/types/OcaGrouperEnrollment.js
var OcaGrouperEnrollment = class {
  /**
   * Describes the Enrollment of a Citizen in a Group. **Deprecated** in
   * AES70-2024.
   * @class OcaGrouperEnrollment
   */
  constructor(GroupIndex, CitizenIndex) {
    this.GroupIndex = GroupIndex;
    this.CitizenIndex = CitizenIndex;
  }
};

// node_modules/aes70/src/OCP1/OcaGrouperEnrollment.js
var OcaGrouperEnrollment2 = Struct(
  {
    GroupIndex: OcaUint16,
    CitizenIndex: OcaUint16
  },
  OcaGrouperEnrollment
);

// node_modules/aes70/src/types/OcaGrouperGroup.js
var OcaGrouperGroup = class {
  /**
   * Describes a Group in a Grouper. **Deprecated** in AES70-2024.
   * @class OcaGrouperGroup
   */
  constructor(Index, Name, ProxyONo) {
    this.Index = Index;
    this.Name = Name;
    this.ProxyONo = ProxyONo;
  }
};

// node_modules/aes70/src/OCP1/OcaGrouperGroup.js
var OcaGrouperGroup2 = Struct(
  {
    Index: OcaUint16,
    Name: OcaString,
    ProxyONo: OcaUint32
  },
  OcaGrouperGroup
);

// node_modules/aes70/src/types/OcaGrouperMode.js
var OcaGrouperMode = class extends Enum({
  Hierarchical: 1,
  PeerToPeer: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaGrouperMode.js
var OcaGrouperMode2 = Enum8(OcaGrouperMode);

// node_modules/aes70/src/types/OcaGrouperStatusChangeType.js
var OcaGrouperStatusChangeType = class extends Enum({
  citizenAdded: 1,
  citizenDeleted: 2,
  citizenConnectionLost: 3,
  citizenConnectionReEstablished: 4,
  citizenError: 5,
  enrollment: 6,
  unEnrollment: 7
}) {
};

// node_modules/aes70/src/OCP1/OcaGrouperStatusChangeType.js
var OcaGrouperStatusChangeType2 = Enum8(OcaGrouperStatusChangeType);

// node_modules/aes70/src/types/OcaGrouperStatusChangeEventData.js
var OcaGrouperStatusChangeEventData = class {
  /**
   * Notification data supplied by the **OcaGrouper.StatusChange()** event.
   * **Deprecated** in AES70-2024.
   * @class OcaGrouperStatusChangeEventData
   */
  constructor(groupIndex, citizenIndex, changeType) {
    this.groupIndex = groupIndex;
    this.citizenIndex = citizenIndex;
    this.changeType = changeType;
  }
};

// node_modules/aes70/src/OCP1/OcaGrouperStatusChangeEventData.js
var OcaGrouperStatusChangeEventData2 = Struct(
  {
    groupIndex: OcaUint16,
    citizenIndex: OcaUint16,
    changeType: OcaGrouperStatusChangeType2
  },
  OcaGrouperStatusChangeEventData
);

// node_modules/aes70/src/controller/ControlClasses/OcaGrouper.js
var OcaGrouper = make_control_class(
  "OcaGrouper",
  3,
  "",
  3,
  OcaAgent,
  [
    ["AddGroup", 3, 1, [OcaString], [OcaUint16, OcaUint32]],
    ["DeleteGroup", 3, 2, [OcaUint16], []],
    ["GetGroupCount", 3, 3, [], [OcaUint16]],
    ["GetGroupList", 3, 4, [], [OcaList(OcaGrouperGroup2)]],
    ["AddCitizen", 3, 5, [OcaGrouperCitizen2], [OcaUint16]],
    ["DeleteCitizen", 3, 6, [OcaUint16], []],
    ["GetCitizenCount", 3, 7, [], [OcaUint16]],
    ["GetCitizenList", 3, 8, [], [OcaList(OcaGrouperCitizen2)]],
    ["GetEnrollment", 3, 9, [OcaGrouperEnrollment2], [OcaBoolean]],
    ["SetEnrollment", 3, 10, [OcaGrouperEnrollment2, OcaBoolean], []],
    ["GetGroupMemberList", 3, 11, [OcaUint16], [OcaList(OcaGrouperCitizen2)]],
    ["GetActuatorOrSensor", 3, 12, [], [OcaBoolean]],
    ["SetActuatorOrSensor", 3, 13, [OcaBoolean], []],
    ["GetMode", 3, 14, [], [OcaGrouperMode2]],
    ["SetMode", 3, 15, [OcaGrouperMode2], []]
  ],
  [
    ["ActuatorOrSensor", [OcaBoolean], 3, 1, false, false, null],
    ["Groups", [OcaList(OcaGrouperGroup2)], 3, 2, false, false, null],
    ["Citizens", [OcaList(OcaGrouperCitizen2)], 3, 3, false, false, null],
    ["Enrollments", [OcaList(OcaGrouperEnrollment2)], 3, 4, false, false, null],
    ["Mode", [OcaGrouperMode2], 3, 5, false, false, null]
  ],
  [["StatusChange", 3, 1, [OcaGrouperStatusChangeEventData2]]]
);

// node_modules/aes70/src/controller/ControlClasses/OcaIdentificationActuator.js
var OcaIdentificationActuator = make_control_class(
  "OcaIdentificationActuator",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetActive", 4, 1, [], [OcaBoolean]],
    ["SetActive", 4, 2, [OcaBoolean], []]
  ],
  [["Active", [OcaBoolean], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaIdentificationSensor.js
var OcaIdentificationSensor = make_control_class(
  "OcaIdentificationSensor",
  4,
  "",
  3,
  OcaSensor,
  [],
  [],
  [["Identify", 4, 1, []]]
);

// node_modules/aes70/src/types/OcaImpedance.js
var OcaImpedance = class {
  /**
   * Complex impedance. Expressed as a magnitude and phase.
   * @class OcaImpedance
   */
  constructor(Magnitude, Phase) {
    this.Magnitude = Magnitude;
    this.Phase = Phase;
  }
};

// node_modules/aes70/src/OCP1/OcaImpedance.js
var OcaImpedance2 = Struct(
  {
    Magnitude: OcaFloat32,
    Phase: OcaFloat32
  },
  OcaImpedance
);

// node_modules/aes70/src/controller/ControlClasses/OcaImpedanceSensor.js
var OcaImpedanceSensor = make_control_class(
  "OcaImpedanceSensor",
  4,
  "	",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaImpedance2, OcaImpedance2, OcaImpedance2]]],
  [["Reading", [OcaImpedance2], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/OCP1/OcaInt16.js
var OcaInt16 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 2;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setInt16(pos, 0 | value, false);
    return pos + 2;
  },
  decode: function(dataView, pos) {
    return dataView.getInt16(pos, false);
  }
});

// node_modules/aes70/src/controller/ControlClasses/OcaInt16Actuator.js
var OcaInt16Actuator = make_control_class(
  "OcaInt16Actuator",
  5,
  "",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaInt16, OcaInt16, OcaInt16]],
    ["SetSetting", 5, 2, [OcaInt16], []]
  ],
  [["Setting", [OcaInt16], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaInt16Sensor.js
var OcaInt16Sensor = make_control_class(
  "OcaInt16Sensor",
  5,
  "",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaInt16, OcaInt16, OcaInt16]]],
  [["Reading", [OcaInt16], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/OCP1/OcaInt32.js
var OcaInt32 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 4;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setInt32(pos, 0 | value, false);
    return pos + 4;
  },
  decode: function(dataView, pos) {
    return dataView.getInt32(pos, false);
  }
});

// node_modules/aes70/src/controller/ControlClasses/OcaInt32Actuator.js
var OcaInt32Actuator = make_control_class(
  "OcaInt32Actuator",
  5,
  "",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaInt32, OcaInt32, OcaInt32]],
    ["SetSetting", 5, 2, [OcaInt32], []]
  ],
  [["Setting", [OcaInt32], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaInt32Sensor.js
var OcaInt32Sensor = make_control_class(
  "OcaInt32Sensor",
  5,
  "",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaInt32, OcaInt32, OcaInt32]]],
  [["Reading", [OcaInt32], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/OCP1/OcaInt64.js
function assertSupport2() {
  if (!HAS_BIGINT) throw new Error("Missing BigInt support");
}
var OcaInt64 = createType({
  isConstantLength: true,
  encodedLength: function(value) {
    return 8;
  },
  canEncode: function(value) {
    return typeof value === "number" || typeof value === "bigint";
  },
  encodeTo: function(dataView, pos, value) {
    assertSupport2();
    if (!(value >= INT64_MIN && value <= INT64_MAX))
      throw new TypeError("Int64 out of range.");
    dataView.setBigInt64(pos, BigInt(value), false);
    return pos + 8;
  },
  decode: function(dataView, pos) {
    assertSupport2();
    const value = dataView.getBigInt64(pos, false);
    return value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER ? Number(value) : value;
  }
});

// node_modules/aes70/src/controller/ControlClasses/OcaInt64Actuator.js
var OcaInt64Actuator = make_control_class(
  "OcaInt64Actuator",
  5,
  "",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaInt64, OcaInt64, OcaInt64]],
    ["SetSetting", 5, 2, [OcaInt64], []]
  ],
  [["Setting", [OcaInt64], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaInt64Sensor.js
var OcaInt64Sensor = make_control_class(
  "OcaInt64Sensor",
  5,
  "",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaInt64, OcaInt64, OcaInt64]]],
  [["Reading", [OcaInt64], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/OCP1/OcaInt8.js
var OcaInt8 = createType({
  isConstantLength: true,
  canEncode: function(value) {
    return typeof value === "number";
  },
  encodedLength: function(value) {
    return 1;
  },
  encodeTo: function(dataView, pos, value) {
    dataView.setInt8(pos, value | 0);
    return pos + 1;
  },
  decode: function(dataView, pos) {
    return dataView.getInt8(pos);
  }
});

// node_modules/aes70/src/controller/ControlClasses/OcaInt8Actuator.js
var OcaInt8Actuator = make_control_class(
  "OcaInt8Actuator",
  5,
  "",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaInt8, OcaInt8, OcaInt8]],
    ["SetSetting", 5, 2, [OcaInt8], []]
  ],
  [["Setting", [OcaInt8], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaInt8Sensor.js
var OcaInt8Sensor = make_control_class(
  "OcaInt8Sensor",
  5,
  "",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaInt8, OcaInt8, OcaInt8]]],
  [["Reading", [OcaInt8], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaJsonActuator.js
var OcaJsonActuator = make_control_class(
  "OcaJsonActuator",
  5,
  "",
  1,
  OcaBasicActuator,
  [
    ["GetValue", 5, 1, [], [OcaString]],
    ["SetValue", 5, 2, [OcaString], []],
    ["GetMaxLen", 5, 3, [], [OcaUint16]]
  ],
  [
    ["Value", [OcaString], 5, 1, false, false, null],
    ["MaxLen", [OcaUint16], 5, 2, true, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaJsonSensor.js
var OcaJsonSensor = make_control_class(
  "OcaJsonSensor",
  5,
  "",
  1,
  OcaBasicSensor,
  [
    ["GetValue", 5, 1, [], [OcaString]],
    ["GetMaxLen", 5, 2, [], [OcaUint16]],
    ["SetMaxLen", 5, 3, [OcaUint16], []]
  ],
  [
    ["Value", [OcaString], 5, 1, false, false, null],
    ["MaxLen", [OcaUint16], 5, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaLockManager.js
var OcaLockManager = make_control_class(
  "OcaLockManager",
  3,
  "",
  1,
  OcaManager,
  [
    ["LockWait", 3, 1, [OcaUint32, OcaLockState2, OcaFloat32], []],
    ["AbortWaits", 3, 2, [OcaUint32], []]
  ],
  [],
  []
);

// node_modules/aes70/src/OCP1/OcaIntervalBounds.js
var OcaIntervalBounds = Bitset16;

// node_modules/aes70/src/types/OcaInterval.js
var OcaInterval = class {
  /**
   * Template datatype that expresses a range of values according to the
   * mathematical definition of "interval". An interval consists of one or two
   * values called "bounds".
   *
   *  - An interval with two bounds (an upper and a lower) is called "bounded".
   *
   *  - An interval with only one bound is called "half-bounded".
   *
   *
   * A bound may be "inclusive" or "exclusive".
   *
   *  - An inclusive bound includes its value in the interval.
   *
   *  - An exclusive bound excludes its value from the interval.
   *
   *  - Inclusive bounds are usually indicated by "[ ]" delimiters, exclusive
   *    bounds by "( )" or "][".
   *
   *
   * For example:
   *
   *  - [5,10] includes all values V such that 5 ``<=`` V ``<=`` 10.
   *
   *  - (5,10) includes all values V such that 5 ``<`` V ``<`` 10.
   *
   *  - [5,10) includes all values V such that 5 ``<=`` V ``<`` 10.
   *
   *  - (5,10] includes all values V such that 5 ``<`` V ``<=`` 10.
   *
   *
   * Here are some half-bounded intervals:
   *
   *  - [5,) and [5,] mean all values V such that 5 ``<=`` V.
   *
   *  - (5,) and (5,] mean all values V such that 5 ``<`` V.
   *
   *  - (,10] and [,10] mean all values V such that V ``<=`` 10.
   *
   *  - (,10) and [,10) mean all values V such that V ``<`` 10.
   *
   *
   * When a datatype (e.g. **OcaFloat32**, **OcaFloat64**) has a value
   * ("**inf**" below) to represent Infinity, it may be used as a bound. For
   * example:
   *
   *  - [1.0, **inf**) means all values V such that 1.0 ``<=`` V and V ``<``
   *    **inf**
   *
   *  - [1.0,** inf**] means all values V such that 1.0 ``<=`` V
   *
   *  - (**-inf**, 1.0] means all values V such that V ``<=`` 1.0 and V ``>``
   *    **-inf**
   *
   *  - [**-inf**, 1.0] means all values V such that V ``<=`` 1.0
   *
   *
   * ... and so on. The usual term "range" means an inclusive, bounded interval,
   * e.g. "the range from 3 to 12" means [3,12]. The property **.Bounds** is a
   * bitset that specifies which bounds are given and whether the given bounds
   * are inclusive or exclusive. **OcaInterval** is a **template** datatype,
   * where the template variable is the datatype of the bounds. Thus, may be
   * defined for integers, floats, and even strings.
   */
  constructor(Min, Max, Bounds) {
    this.Min = Min;
    this.Max = Max;
    this.Bounds = Bounds;
  }
};

// node_modules/aes70/src/OCP1/OcaInterval.js
function OcaInterval2(DT) {
  return Struct(
    {
      Min: DT,
      Max: DT,
      Bounds: OcaIntervalBounds
    },
    OcaInterval
  );
}

// node_modules/aes70/src/types/OcaLogFilter.js
var OcaLogFilter = class {
  /**
   * Filter for log entry retrieval.
   * @class OcaLogFilter
   */
  constructor(FunctionalCategory, SeverityRange, EmitterONo, TimestampRange) {
    this.FunctionalCategory = FunctionalCategory;
    this.SeverityRange = SeverityRange;
    this.EmitterONo = EmitterONo;
    this.TimestampRange = TimestampRange;
  }
};

// node_modules/aes70/src/OCP1/OcaLogFilter.js
var OcaLogFilter2 = Struct(
  {
    FunctionalCategory: OcaUint32,
    SeverityRange: OcaInterval2(OcaInt32),
    EmitterONo: OcaUint32,
    TimestampRange: OcaInterval2(OcaTime2)
  },
  OcaLogFilter
);

// node_modules/aes70/src/types/OcaLogRecord.js
var OcaLogRecord = class {
  /**
   * Format of a log record. Payload format is application-specific; header data
   * is standard.
   * @class OcaLogRecord
   */
  constructor(FunctionalCategory, Severity, EmitterONo, Timestamp, Payload) {
    this.FunctionalCategory = FunctionalCategory;
    this.Severity = Severity;
    this.EmitterONo = EmitterONo;
    this.Timestamp = Timestamp;
    this.Payload = Payload;
  }
};

// node_modules/aes70/src/OCP1/OcaLogRecord.js
var OcaLogRecord2 = Struct(
  {
    FunctionalCategory: OcaUint32,
    Severity: OcaInt32,
    EmitterONo: OcaUint32,
    Timestamp: OcaTime2,
    Payload: OcaBlob
  },
  OcaLogRecord
);

// node_modules/aes70/src/controller/ControlClasses/OcaLog.js
var OcaLog = make_control_class(
  "OcaLog",
  3,
  "",
  1,
  OcaDataset,
  [
    ["AddLogRecord", 3, 1, [OcaLogRecord2], []],
    ["GetSeverityThreshold", 3, 2, [], [OcaInt32]],
    ["SetSeverityThreshold", 3, 3, [OcaInt32], []],
    ["OpenRetrievalSession", 3, 4, [OcaLockState2, OcaLogFilter2], [OcaUint32]],
    ["CloseRetrievalSession", 3, 5, [OcaUint32], []],
    [
      "RetrieveRecords",
      3,
      6,
      [OcaUint32, OcaUint64, OcaUint16, OcaUint64],
      [OcaBoolean, OcaUint64, OcaList(OcaLogRecord2)]
    ],
    ["GetEnabled", 3, 7, [], [OcaBoolean]],
    ["SetEnabled", 3, 8, [OcaBoolean], []]
  ],
  [
    ["Enabled", [OcaBoolean], 3, 1, false, false, null],
    ["SeverityThreshold", [OcaInt32], 3, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/OCP1/OcaList2D.js
function OcaList2DConstantLength(Type) {
  const encodedLength = Type.encodedLength(void 0);
  const encodeTo = Type.encodeTo;
  const decode = Type.decode;
  return createType({
    isConstantLength: false,
    canEncode: function(value) {
      return Array.isArray(value) || isTypedArray(value);
    },
    encodedLength: function(value) {
      if (!(Array.isArray(value) || isTypedArray(value)))
        throw new TypeError("Expected array.");
      const rows = value.length;
      if (rows === 0) return 4;
      if (!(Array.isArray(value[0]) || isTypedArray(value[0])))
        throw new TypeError("Expected array.");
      const columns = value[0].length;
      if (rows > 65535 || columns > 65535)
        throw new Error("Array too long for OcaList2D OCP.1 encoding");
      return 4 + rows * columns * encodedLength;
    },
    encodeTo: function(dataView, pos, value) {
      const rows = value.length;
      const columns = rows === 0 ? 0 : value[0].length;
      dataView.setUint16(pos, rows);
      pos += 2;
      dataView.setUint16(pos, columns);
      pos += 2;
      for (let i = 0; i < rows; i++) {
        const row = value[i];
        for (let j = 0; j < columns; j++) {
          pos = encodeTo(dataView, pos, row[j]);
        }
      }
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const rows = dataView.getUint16(pos);
      pos += 2;
      const columns = dataView.getUint16(pos);
      pos += 2;
      const value = new Array(rows).fill().map(() => new Array(columns));
      for (let i = 0; i < rows; i++) {
        const row = value[i];
        for (let j = 0; j < columns; j++) {
          row[j] = decode(dataView, pos);
          pos += encodedLength;
        }
      }
      return [pos, value];
    },
    decodeLength: function(dataView, pos) {
      const rows = dataView.getUint16(pos);
      pos += 2;
      const columns = dataView.getUint16(pos);
      pos += 2;
      pos += rows * columns * encodedLength;
      return pos;
    }
  });
}
function OcaList2DDynamicLength(Type) {
  const encodedLength = Type.encodedLength;
  const encodeTo = Type.encodeTo;
  const decodeFrom = Type.decodeFrom;
  const decodeLength = Type.decodeLength;
  return createType({
    isConstantLength: false,
    canEncode: function(value) {
      return Array.isArray(value) || isTypedArray(value);
    },
    encodedLength: function(value) {
      if (!(Array.isArray(value) || isTypedArray(value)))
        throw new TypeError("Expected array.");
      const rows = value.length;
      if (rows === 0) return 4;
      if (!(Array.isArray(value[0]) || isTypedArray(value[0])))
        throw new TypeError("Expected array.");
      const columns = value[0].length;
      if (rows > 65535 || columns > 65535)
        throw new Error("Array too long for OcaList2D OCP.1 encoding");
      let result = 4;
      for (let i = 0; i < rows; i++) {
        const row = value[i];
        for (let j = 0; j < columns; j++) {
          result += encodedLength(row[j]);
        }
      }
      return result;
    },
    encodeTo: function(dataView, pos, value) {
      const rows = value.length;
      const columns = rows === 0 ? 0 : value[0].length;
      dataView.setUint16(pos, rows);
      pos += 2;
      dataView.setUint16(pos, columns);
      pos += 2;
      for (let i = 0; i < rows; i++) {
        const row = value[i];
        for (let j = 0; j < columns; j++) {
          pos = encodeTo(dataView, pos, row[j]);
        }
      }
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const rows = dataView.getUint16(pos);
      pos += 2;
      const columns = dataView.getUint16(pos);
      pos += 2;
      const value = new Array(rows).fill().map(() => new Array(columns));
      for (let i = 0; i < rows; i++) {
        const row = value[i];
        for (let j = 0; j < columns; j++) {
          let tmp;
          [pos, tmp] = decodeFrom(dataView, pos);
          row[j] = tmp;
        }
      }
      return [pos, value];
    },
    decodeLength: function(dataView, pos) {
      const rows = dataView.getUint16(pos);
      pos += 2;
      const columns = dataView.getUint16(pos);
      pos += 2;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          pos = decodeLength(dataView, pos);
        }
      }
      return pos;
    }
  });
}
function OcaList2D(Type) {
  return Type.isConstantLength ? OcaList2DConstantLength(Type) : OcaList2DDynamicLength(Type);
}

// node_modules/aes70/src/types/OcaMatrixCoordinates.js
var OcaMatrixCoordinates = class {
  /**
   * (X,Y) of a Matrix Member. X=column, Y=row. Zero-relative: X=0 is first
   * column, Y=0 is first row.
   * @class OcaMatrixCoordinates
   */
  constructor(X, Y) {
    this.X = X;
    this.Y = Y;
  }
};

// node_modules/aes70/src/OCP1/OcaMatrixCoordinates.js
var OcaMatrixCoordinates2 = Struct(
  {
    X: OcaUint16,
    Y: OcaUint16
  },
  OcaMatrixCoordinates
);

// node_modules/aes70/src/types/OcaMatrixCommand.js
var OcaMatrixCommand = class {
  /**
   * (X,Y) of a Matrix Member. X=column, Y=row. Zero-relative: X=0 is first
   * column, Y=0 is first row.
   * @class OcaMatrixCommand
   */
  constructor(Coordinates, ID, Parameters) {
    this.Coordinates = Coordinates;
    this.ID = ID;
    this.Parameters = Parameters;
  }
};

// node_modules/aes70/src/OCP1/OcaMatrixCommand.js
var OcaMatrixCommand2 = Struct(
  {
    Coordinates: OcaMatrixCoordinates2,
    ID: OcaMethodID2,
    Parameters: OcaList(OcaLongBlob)
  },
  OcaMatrixCommand
);

// node_modules/aes70/src/controller/ControlClasses/OcaMatrix.js
var OcaMatrix = make_control_class(
  "OcaMatrix",
  3,
  "",
  4,
  OcaWorker,
  [
    ["GetCurrentXY", 3, 1, [], [OcaUint16, OcaUint16]],
    ["SetCurrentXY", 3, 2, [OcaUint16, OcaUint16], []],
    [
      "GetSize",
      3,
      3,
      [],
      [OcaUint16, OcaUint16, OcaUint16, OcaUint16, OcaUint16, OcaUint16]
    ],
    ["SetSize", 3, 4, [OcaUint16, OcaUint16], []],
    ["GetMembers", 3, 5, [], [OcaList2D(OcaUint32)]],
    ["SetMembers", 3, 6, [OcaList2D(OcaUint32)], []],
    ["GetMember", 3, 7, [OcaUint16, OcaUint16], [OcaUint32]],
    ["SetMember", 3, 8, [OcaUint16, OcaUint16, OcaUint32], []],
    ["GetProxy", 3, 9, [], [OcaUint32]],
    ["SetProxy", 3, 10, [OcaUint32], []],
    ["GetPortsPerRow", 3, 11, [], [OcaUint8]],
    ["SetPortsPerRow", 3, 12, [OcaUint8], []],
    ["GetPortsPerColumn", 3, 13, [], [OcaUint8]],
    ["SetPortsPerColumn", 3, 14, [OcaUint8], []],
    ["SetCurrentXYLock", 3, 15, [OcaUint16, OcaUint16], []],
    ["UnlockCurrent", 3, 16, [], []],
    [
      "ExecuteMethod",
      3,
      17,
      [OcaList32(OcaMatrixCoordinates2), OcaMethodID2, OcaList(OcaLongBlob)],
      [OcaList(OcaCommandResult2)]
    ],
    [
      "ExecuteCommands",
      3,
      18,
      [OcaList32(OcaMatrixCommand2)],
      [OcaList32(OcaCommandResult2)]
    ]
  ],
  [
    ["X", [OcaUint16], 3, 1, false, false, null],
    ["Y", [OcaUint16], 3, 2, false, false, null],
    ["xSize", [OcaUint16], 3, 3, false, false, null],
    ["ySize", [OcaUint16], 3, 4, false, false, null],
    ["Members", [OcaList2D(OcaUint32)], 3, 5, false, false, null],
    ["Proxy", [OcaUint32], 3, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaMediaClockLockState.js
var OcaMediaClockLockState = class extends Enum({
  Undefined: 0,
  Locked: 1,
  Synchronizing: 2,
  FreeRun: 3,
  Stopped: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaClockLockState.js
var OcaMediaClockLockState2 = Enum8(OcaMediaClockLockState);

// node_modules/aes70/src/types/OcaMediaClockRate.js
var OcaMediaClockRate = class {
  /**
   * Media Clock nominal rate and associated parameters.
   * @class OcaMediaClockRate
   */
  constructor(NominalRate, PullRange, Accuracy, JitterMax) {
    this.NominalRate = NominalRate;
    this.PullRange = PullRange;
    this.Accuracy = Accuracy;
    this.JitterMax = JitterMax;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaClockRate.js
var OcaMediaClockRate2 = Struct(
  {
    NominalRate: OcaFloat32,
    PullRange: OcaFloat32,
    Accuracy: OcaFloat32,
    JitterMax: OcaFloat32
  },
  OcaMediaClockRate
);

// node_modules/aes70/src/controller/ControlClasses/OcaMediaClock.js
var OcaMediaClock = make_control_class(
  "OcaMediaClock",
  3,
  "",
  3,
  OcaAgent,
  [
    ["GetType", 3, 1, [], [OcaMediaClockType2]],
    ["SetType", 3, 2, [OcaMediaClockType2], []],
    ["GetDomainID", 3, 3, [], [OcaUint16]],
    ["SetDomainID", 3, 4, [OcaUint16], []],
    ["GetSupportedRates", 3, 5, [], [OcaList(OcaMediaClockRate2)]],
    ["GetRate", 3, 6, [], [OcaMediaClockRate2], ["GetCurrentRate"]],
    ["SetRate", 3, 7, [OcaMediaClockRate2], [], ["SetCurrentRate"]],
    ["GetLockState", 3, 8, [], [OcaMediaClockLockState2]]
  ],
  [
    ["Type", [OcaMediaClockType2], 3, 1, false, false, null],
    ["DomainID", [OcaUint16], 3, 2, false, false, null],
    ["RatesSupported", [OcaList(OcaMediaClockRate2)], 3, 3, false, false, null],
    ["CurrentRate", [OcaMediaClockRate2], 3, 4, false, false, ["Rate"]],
    ["LockState", [OcaMediaClockLockState2], 3, 5, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaMediaClockAvailability.js
var OcaMediaClockAvailability = class extends Enum({
  Unavailable: 0,
  Available: 1
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaClockAvailability.js
var OcaMediaClockAvailability2 = Enum8(OcaMediaClockAvailability);

// node_modules/aes70/src/controller/ControlClasses/OcaMediaClock3.js
var OcaMediaClock3 = make_control_class(
  "OcaMediaClock3",
  3,
  "",
  3,
  OcaAgent,
  [
    ["GetAvailability", 3, 1, [], [OcaMediaClockAvailability2]],
    ["SetAvailability", 3, 2, [OcaMediaClockAvailability2], []],
    ["GetCurrentRate", 3, 3, [], [OcaMediaClockRate2, OcaUint32]],
    ["SetCurrentRate", 3, 4, [OcaMediaClockRate2, OcaUint32], []],
    ["GetOffset", 3, 5, [], [OcaTime2]],
    ["SetOffset", 3, 6, [OcaTime2], []],
    [
      "GetSupportedRates",
      3,
      7,
      [],
      [OcaMap(OcaUint32, OcaList(OcaMediaClockRate2))]
    ]
  ],
  [
    ["Availability", [OcaMediaClockAvailability2], 3, 1, false, false, null],
    ["TimeSourceONo", [OcaUint32], 3, 2, false, false, null],
    ["Offset", [OcaTime2], 3, 3, false, false, null],
    ["CurrentRate", [OcaMediaClockRate2], 3, 4, false, false, null],
    [
      "SupportedRates",
      [OcaMap(OcaUint32, OcaList(OcaMediaClockRate2))],
      3,
      5,
      false,
      false,
      null
    ]
  ],
  []
);

// node_modules/aes70/src/types/OcaMediaAccessMode.js
var OcaMediaAccessMode = class extends Enum({
  None: 0,
  Play: 1,
  Record: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaAccessMode.js
var OcaMediaAccessMode2 = Enum8(OcaMediaAccessMode);

// node_modules/aes70/src/types/OcaMediaPlayOption.js
var OcaMediaPlayOption = class extends Enum({
  Normal: 0,
  Autoclose: 1,
  RepeatInterval: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaPlayOption.js
var OcaMediaPlayOption2 = Enum8(OcaMediaPlayOption);

// node_modules/aes70/src/types/OcaMediaRecorderPlayerState.js
var OcaMediaRecorderPlayerState = class extends Enum({
  Idle: 0,
  Stopped: 1,
  Seeking: 2,
  Recording: 3,
  Playing: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaRecorderPlayerState.js
var OcaMediaRecorderPlayerState2 = Enum8(OcaMediaRecorderPlayerState);

// node_modules/aes70/src/OCP1/OcaMediaTrackFunction.js
var OcaMediaTrackFunction = Bitset16;

// node_modules/aes70/src/types/OcaMediaVolumePositionType.js
var OcaMediaVolumePositionType = class extends Enum({
  Samples: 0,
  Seconds: 1
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaVolumePositionType.js
var OcaMediaVolumePositionType2 = Enum16(OcaMediaVolumePositionType);

// node_modules/aes70/src/types/OcaMediaVolumePosition.js
var OcaMediaVolumePosition = class {
  /**
   * Position within a media volume - samples or seconds.
   * @class OcaMediaVolumePosition
   */
  constructor(PositionType, Position) {
    this.PositionType = PositionType;
    this.Position = Position;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaVolumePosition.js
var OcaMediaVolumePosition2 = Struct(
  {
    PositionType: OcaMediaVolumePositionType2,
    Position: OcaUint64
  },
  OcaMediaVolumePosition
);

// node_modules/aes70/src/controller/ControlClasses/OcaMediaRecorderPlayer.js
var OcaMediaRecorderPlayer = make_control_class(
  "OcaMediaRecorderPlayer",
  4,
  "\x07",
  3,
  OcaDatasetWorker,
  [
    ["Open", 4, 1, [OcaUint32, OcaMediaAccessMode2, OcaLockState2], []],
    ["Close", 4, 2, [], []],
    ["Record", 4, 3, [], []],
    ["Play", 4, 4, [], []],
    ["Stop", 4, 5, [], []],
    ["Reset", 4, 6, [], []],
    ["GetState", 4, 7, [], [OcaMediaRecorderPlayerState2]],
    ["GetTrackCount", 4, 8, [], [OcaUint16]],
    ["SetTrackCount", 4, 9, [OcaUint16], []],
    ["GetTrackFunctions", 4, 10, [], [OcaList(OcaMediaTrackFunction)]],
    ["SetTrackFunctions", 4, 11, [OcaList(OcaMediaTrackFunction)], []],
    ["GetPlayOption", 4, 12, [], [OcaMediaPlayOption2]],
    ["SetPlayOption", 4, 13, [OcaMediaPlayOption2], []],
    ["GetPosition", 4, 14, [], [OcaMediaVolumePosition2]],
    ["SetPosition", 4, 15, [OcaMediaVolumePosition2], []],
    [
      "GetWindowRange",
      4,
      16,
      [],
      [OcaMediaVolumePosition2, OcaMediaVolumePosition2]
    ],
    [
      "SetWindowRange",
      4,
      17,
      [OcaMediaVolumePosition2, OcaMediaVolumePosition2],
      []
    ]
  ],
  [
    ["State", [OcaMediaRecorderPlayerState2], 4, 1, false, false, null],
    ["TrackCount", [OcaUint16], 4, 2, false, false, null],
    [
      "TrackFunctions",
      [OcaList(OcaMediaTrackFunction)],
      4,
      3,
      false,
      false,
      null
    ],
    ["PlayOption", [OcaMediaPlayOption2], 4, 4, false, false, null],
    ["WindowStart", [OcaMediaVolumePosition2], 4, 5, false, false, null],
    ["WindowEnd", [OcaMediaVolumePosition2], 4, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaCounter.js
var OcaCounter = class {
  /**
   * A general-purpose Counter. See [AES70-1(Counters and Countersets)].
   * @class OcaCounter
   */
  constructor(ID, Value, InitialValue, Role, Notifiers) {
    this.ID = ID;
    this.Value = Value;
    this.InitialValue = InitialValue;
    this.Role = Role;
    this.Notifiers = Notifiers;
  }
};

// node_modules/aes70/src/OCP1/OcaCounter.js
var OcaCounter2 = Struct(
  {
    ID: OcaUint16,
    Value: OcaUint64,
    InitialValue: OcaUint64,
    Role: OcaString,
    Notifiers: OcaList(OcaUint32)
  },
  OcaCounter
);

// node_modules/aes70/src/types/OcaCounterSet.js
var OcaCounterSet = class {
  /**
   * A set of Counters
   * @class OcaCounterSet
   */
  constructor(ID, Counters) {
    this.ID = ID;
    this.Counters = Counters;
  }
};

// node_modules/aes70/src/OCP1/OcaCounterSet.js
var OcaCounterSet2 = Struct(
  {
    ID: OcaBlob,
    Counters: OcaList(OcaCounter2)
  },
  OcaCounterSet
);

// node_modules/aes70/src/types/OcaMediaStreamCastMode.js
var OcaMediaStreamCastMode = class extends Enum({
  Unknown: 0,
  Unicast: 1,
  Multicast: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaStreamCastMode.js
var OcaMediaStreamCastMode2 = Enum8(OcaMediaStreamCastMode);

// node_modules/aes70/src/types/OcaMediaFrameFormat.js
var OcaMediaFrameFormat = class extends Enum({
  Undefined: 0,
  RTP: 1,
  AAF: 2,
  CRF_MILAN: 3,
  IEC_61883_6: 4,
  USB_AUDIO_2_0: 5,
  ExtensionPoint: 65
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaFrameFormat.js
var OcaMediaFrameFormat2 = Enum8(OcaMediaFrameFormat);

// node_modules/aes70/src/types/OcaMediaStreamMode.js
var OcaMediaStreamMode = class {
  /**
   * Current media stream mode descriptor.
   * @class OcaMediaStreamMode
   */
  constructor(FrameFormat, EncodingType, SamplingRate, ChannelCount, PacketTime) {
    this.FrameFormat = FrameFormat;
    this.EncodingType = EncodingType;
    this.SamplingRate = SamplingRate;
    this.ChannelCount = ChannelCount;
    this.PacketTime = PacketTime;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaStreamMode.js
var OcaMediaStreamMode2 = Struct(
  {
    FrameFormat: OcaMediaFrameFormat2,
    EncodingType: OcaString,
    SamplingRate: OcaFloat32,
    ChannelCount: OcaUint16,
    PacketTime: OcaFloat32
  },
  OcaMediaStreamMode
);

// node_modules/aes70/src/OCP1/OcaMultiMap.js
function OcaMultiMap(KeyType, ValueType) {
  const kencodedLength = KeyType.encodedLength;
  const kencodeTo = KeyType.encodeTo;
  const kdecodeFrom = KeyType.decodeFrom;
  const kdecodeLength = KeyType.decodeLength;
  const vencodedLength = ValueType.encodedLength;
  const vencodeTo = ValueType.encodeTo;
  const vdecodeFrom = ValueType.decodeFrom;
  const vdecodeLength = ValueType.decodeLength;
  return createType({
    isConstantLength: false,
    canEncode: function(value) {
      return value instanceof Map || value instanceof WeakMap;
    },
    encodedLength: function(value) {
      if (!(value instanceof Map || value instanceof WeakMap))
        throw new TypeError("Expected Map or WeakMap");
      let result = 2;
      value.forEach((set, key) => {
        result += kencodedLength(key) * set.size;
        set.forEach((value2) => {
          result += vencodedLength(value2);
        });
      });
      return result;
    },
    encodeTo: function(dataView, pos, value) {
      const size_pos = pos;
      let size = 0;
      pos += 2;
      value.forEach((set, key) => {
        size += set.size;
        set.forEach((value2) => {
          pos = kencodeTo(dataView, pos, key);
          pos = vencodeTo(dataView, pos, value2);
        });
      });
      dataView.setUint16(size_pos, size);
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const result = /* @__PURE__ */ new Map();
      const length = dataView.getUint16(pos);
      pos += 2;
      for (let i = 0; i < length; i++) {
        let key, value;
        [pos, key] = kdecodeFrom(dataView, pos);
        [pos, value] = vdecodeFrom(dataView, pos);
        let set = result.get(key);
        if (!set) {
          result.set(key, set = /* @__PURE__ */ new Set());
        }
        set.add(value);
      }
      return [pos, result];
    },
    decodeLength: function(dataView, pos) {
      const length = dataView.getUint16(pos);
      pos += 2;
      for (let i = 0; i < length; i++) {
        pos = kdecodeLength(dataView, pos);
        pos = vdecodeLength(dataView, pos);
      }
      return pos;
    }
  });
}

// node_modules/aes70/src/types/OcaSecurityType.js
var OcaSecurityType = class extends Enum({
  None: 0,
  Default: 1
}) {
};

// node_modules/aes70/src/OCP1/OcaSecurityType.js
var OcaSecurityType2 = Enum8(OcaSecurityType);

// node_modules/aes70/src/types/OcaMediaStreamEndpoint.js
var OcaMediaStreamEndpoint = class {
  /**
   * Media stream endpoint descriptor. Collected by
   * **OcaMediaTransportApplication**.
   * @class OcaMediaStreamEndpoint
   */
  constructor(IDInternal, IDExternal, Direction, UserLabel, NetworkAssignmentIDs, StreamModeCapabilityIDs, ClockONo, ChannelMapDynamic, ChannelMap, AlignmentLevel, CurrentStreamMode, SecurityType, StreamCastMode, AdaptationData, RedundantSetID) {
    this.IDInternal = IDInternal;
    this.IDExternal = IDExternal;
    this.Direction = Direction;
    this.UserLabel = UserLabel;
    this.NetworkAssignmentIDs = NetworkAssignmentIDs;
    this.StreamModeCapabilityIDs = StreamModeCapabilityIDs;
    this.ClockONo = ClockONo;
    this.ChannelMapDynamic = ChannelMapDynamic;
    this.ChannelMap = ChannelMap;
    this.AlignmentLevel = AlignmentLevel;
    this.CurrentStreamMode = CurrentStreamMode;
    this.SecurityType = SecurityType;
    this.StreamCastMode = StreamCastMode;
    this.AdaptationData = AdaptationData;
    this.RedundantSetID = RedundantSetID;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaStreamEndpoint.js
var OcaMediaStreamEndpoint2 = Struct(
  {
    IDInternal: OcaUint32,
    IDExternal: OcaBlob,
    Direction: OcaIODirection2,
    UserLabel: OcaString,
    NetworkAssignmentIDs: OcaList(OcaUint16),
    StreamModeCapabilityIDs: OcaList(OcaUint16),
    ClockONo: OcaUint32,
    ChannelMapDynamic: OcaBoolean,
    ChannelMap: OcaMultiMap(OcaUint16, OcaPortID2),
    AlignmentLevel: OcaFloat32,
    CurrentStreamMode: OcaMediaStreamMode2,
    SecurityType: OcaSecurityType2,
    StreamCastMode: OcaMediaStreamCastMode2,
    AdaptationData: OcaBlob,
    RedundantSetID: OcaUint16
  },
  OcaMediaStreamEndpoint
);

// node_modules/aes70/src/types/OcaMediaStreamEndpointCommand.js
var OcaMediaStreamEndpointCommand = class extends Enum({
  None: 0,
  SetReady: 1,
  Connect: 2,
  ConnectAndStart: 3,
  Disconnect: 4,
  StopAndDisconnect: 5,
  Start: 6,
  Stop: 7
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaStreamEndpointCommand.js
var OcaMediaStreamEndpointCommand2 = Enum8(OcaMediaStreamEndpointCommand);

// node_modules/aes70/src/types/OcaMediaStreamEndpointState.js
var OcaMediaStreamEndpointState = class extends Enum({
  Unknown: 0,
  NotReady: 1,
  Ready: 2,
  Connected: 3,
  Running: 4,
  ErrorHalt: 5
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaStreamEndpointState.js
var OcaMediaStreamEndpointState2 = Enum8(OcaMediaStreamEndpointState);

// node_modules/aes70/src/types/OcaMediaStreamEndpointStatus.js
var OcaMediaStreamEndpointStatus = class {
  /**
   * Current status of a media stream endpoint.
   * @class OcaMediaStreamEndpointStatus
   */
  constructor(State, ErrorCode) {
    this.State = State;
    this.ErrorCode = ErrorCode;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaStreamEndpointStatus.js
var OcaMediaStreamEndpointStatus2 = Struct(
  {
    State: OcaMediaStreamEndpointState2,
    ErrorCode: OcaUint16
  },
  OcaMediaStreamEndpointStatus
);

// node_modules/aes70/src/OCP1/OcaMediaStreamModeCapabilityDirection.js
var OcaMediaStreamModeCapabilityDirection = Bitset16;

// node_modules/aes70/src/types/OcaMediaStreamModeCapability.js
var OcaMediaStreamModeCapability = class {
  /**
   * Media stream mode capability descriptor.
   * @class OcaMediaStreamModeCapability
   */
  constructor(ID, Name, Direction, FrameFormatList, EncodingTypeList, SamplingRateList, ChannelCountList, ChannelCountRange, PacketTimeList, PacketTimeRange) {
    this.ID = ID;
    this.Name = Name;
    this.Direction = Direction;
    this.FrameFormatList = FrameFormatList;
    this.EncodingTypeList = EncodingTypeList;
    this.SamplingRateList = SamplingRateList;
    this.ChannelCountList = ChannelCountList;
    this.ChannelCountRange = ChannelCountRange;
    this.PacketTimeList = PacketTimeList;
    this.PacketTimeRange = PacketTimeRange;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaStreamModeCapability.js
var OcaMediaStreamModeCapability2 = Struct(
  {
    ID: OcaUint16,
    Name: OcaString,
    Direction: OcaMediaStreamModeCapabilityDirection,
    FrameFormatList: OcaList(OcaMediaFrameFormat2),
    EncodingTypeList: OcaList(OcaString),
    SamplingRateList: OcaList(OcaFloat32),
    ChannelCountList: OcaList(OcaUint16),
    ChannelCountRange: OcaInterval2(OcaUint16),
    PacketTimeList: OcaList(OcaFloat32),
    PacketTimeRange: OcaInterval2(OcaFloat32)
  },
  OcaMediaStreamModeCapability
);

// node_modules/aes70/src/types/OcaMediaTransportTimingParameters.js
var OcaMediaTransportTimingParameters = class {
  /**
   * Media transport application's transport timing parameters
   * @class OcaMediaTransportTimingParameters
   */
  constructor(MinReceiveBufferCapacity, MaxReceiveBufferCapacity, TransmissionTimeVariation) {
    this.MinReceiveBufferCapacity = MinReceiveBufferCapacity;
    this.MaxReceiveBufferCapacity = MaxReceiveBufferCapacity;
    this.TransmissionTimeVariation = TransmissionTimeVariation;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaTransportTimingParameters.js
var OcaMediaTransportTimingParameters2 = Struct(
  {
    MinReceiveBufferCapacity: OcaFloat32,
    MaxReceiveBufferCapacity: OcaFloat32,
    TransmissionTimeVariation: OcaFloat32
  },
  OcaMediaTransportTimingParameters
);

// node_modules/aes70/src/types/OcaTimeReferenceType.js
var OcaTimeReferenceType = class extends Enum({
  Undefined: 0,
  Local: 1,
  Private: 2,
  TAI: 3,
  ExpansionBase: 128
}) {
};

// node_modules/aes70/src/OCP1/OcaTimeReferenceType.js
var OcaTimeReferenceType2 = Enum8(OcaTimeReferenceType);

// node_modules/aes70/src/types/OcaNetworkAdvertisingService.js
var OcaNetworkAdvertisingService = class extends Enum({
  DNSSD: 0,
  MDNS_DNSSD: 1,
  NMOS: 2,
  ExpansionBase: 128
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkAdvertisingService.js
var OcaNetworkAdvertisingService2 = Enum8(OcaNetworkAdvertisingService);

// node_modules/aes70/src/types/OcaNetworkAdvertisingMechanism.js
var OcaNetworkAdvertisingMechanism = class {
  /**
   * Descriptor of a Network Advertising mechanism specified by a Network
   * Assignment.
   * @class OcaNetworkAdvertisingMechanism
   */
  constructor(Service, Parameters) {
    this.Service = Service;
    this.Parameters = Parameters;
  }
};

// node_modules/aes70/src/OCP1/OcaNetworkAdvertisingMechanism.js
var OcaNetworkAdvertisingMechanism2 = Struct(
  {
    Service: OcaNetworkAdvertisingService2,
    Parameters: OcaString
  },
  OcaNetworkAdvertisingMechanism
);

// node_modules/aes70/src/types/OcaNetworkInterfaceAssignment.js
var OcaNetworkInterfaceAssignment = class {
  /**
   * Assignment of a Network Interface object to a Network Application object.
   * Also specifies associated Network Advertising mechanism(s).
   * @class OcaNetworkInterfaceAssignment
   */
  constructor(ID, NetworkInterfaceONo, NetworkBindingParameters, SecurityKeyIdentities, AdvertisingMechanisms) {
    this.ID = ID;
    this.NetworkInterfaceONo = NetworkInterfaceONo;
    this.NetworkBindingParameters = NetworkBindingParameters;
    this.SecurityKeyIdentities = SecurityKeyIdentities;
    this.AdvertisingMechanisms = AdvertisingMechanisms;
  }
};

// node_modules/aes70/src/OCP1/OcaNetworkInterfaceAssignment.js
var OcaNetworkInterfaceAssignment2 = Struct(
  {
    ID: OcaUint16,
    NetworkInterfaceONo: OcaUint32,
    NetworkBindingParameters: OcaBlob,
    SecurityKeyIdentities: OcaList(OcaString),
    AdvertisingMechanisms: OcaList(OcaNetworkAdvertisingMechanism2)
  },
  OcaNetworkInterfaceAssignment
);

// node_modules/aes70/src/controller/ControlClasses/OcaNetworkApplication.js
var OcaNetworkApplication = make_control_class(
  "OcaNetworkApplication",
  2,
  "\x07",
  1,
  OcaRoot,
  [
    ["GetLabel", 2, 1, [], [OcaString]],
    ["SetLabel", 2, 2, [OcaString], []],
    ["GetOwner", 2, 3, [], [OcaUint32]],
    ["GetPath", 2, 4, [], [OcaList(OcaString), OcaList(OcaUint32)]],
    [
      "GetNetworkInterfaceAssignments",
      2,
      5,
      [],
      [OcaList(OcaNetworkInterfaceAssignment2)]
    ],
    [
      "SetNetworkInterfaceAssignments",
      2,
      6,
      [OcaList(OcaNetworkInterfaceAssignment2)],
      []
    ],
    ["GetAdaptationIdentifier", 2, 7, [], [OcaString]],
    ["GetAdaptationData", 2, 8, [], [OcaBlob]],
    ["SetAdaptationData", 2, 9, [OcaBlob], []],
    ["GetCounterSet", 2, 10, [], [OcaCounterSet2]],
    ["GetCounter", 2, 11, [OcaUint16], [OcaCounter2]],
    ["AttachCounterNotifier", 2, 12, [OcaUint16, OcaUint32], []],
    ["DetachCounterNotifier", 2, 13, [OcaUint16, OcaUint32], []],
    ["ResetCounters", 2, 14, [], []]
  ],
  [
    ["Label", [OcaString], 2, 1, false, false, null],
    ["Owner", [OcaUint32], 2, 2, true, false, null],
    [
      "NetworkInterfaceAssignments",
      [OcaList(OcaNetworkInterfaceAssignment2)],
      2,
      3,
      false,
      false,
      null
    ],
    ["AdaptationIdentifier", [OcaString], 2, 4, true, false, null],
    ["AdaptationData", [OcaBlob], 2, 5, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaMediaTransportApplication.js
var OcaMediaTransportApplication = make_control_class(
  "OcaMediaTransportApplication",
  3,
  "\x07",
  1,
  OcaNetworkApplication,
  [
    ["AddPort", 3, 1, [OcaString, OcaIODirection2], [OcaPortID2]],
    ["DeletePort", 3, 2, [OcaPortID2], []],
    ["GetPorts", 3, 3, [], [OcaList(OcaPort2)]],
    ["GetPortName", 3, 4, [OcaPortID2], [OcaString]],
    ["SetPortName", 3, 5, [OcaPortID2, OcaString], []],
    ["GetPortClockMap", 3, 6, [], [OcaMap(OcaPortID2, OcaPortClockMapEntry2)]],
    ["SetPortClockMap", 3, 7, [OcaMap(OcaPortID2, OcaPortClockMapEntry2)], []],
    ["SetPortClockMapEntry", 3, 8, [OcaPortID2, OcaPortClockMapEntry2], []],
    ["DeletePortClockMapEntry", 3, 9, [OcaPortID2], []],
    ["GetPortClockMapEntry", 3, 10, [OcaPortID2], [OcaPortClockMapEntry2]],
    ["GetMaxEndpointCounts", 3, 11, [], [OcaUint16, OcaUint16]],
    ["GetMaxPortsPerChannel", 3, 12, [], [OcaUint16]],
    ["GetMaxChannelsPerEndpoint", 3, 13, [], [OcaUint16]],
    ["SetAlignmentLevelLimits", 3, 14, [OcaInterval2(OcaFloat32)], []],
    [
      "GetMediaStreamModeCapabilities",
      3,
      15,
      [],
      [OcaList(OcaMediaStreamModeCapability2)]
    ],
    [
      "SetMediaStreamModeCapabilities",
      3,
      16,
      [OcaList(OcaMediaStreamModeCapability2)],
      []
    ],
    [
      "GetMediaStreamModeCapability",
      3,
      17,
      [OcaUint16],
      [OcaMediaStreamModeCapability2]
    ],
    [
      "GetTransportTimingParameters",
      3,
      18,
      [],
      [OcaMediaTransportTimingParameters2]
    ],
    [
      "SetTransportTimingParameters",
      3,
      19,
      [OcaMediaTransportTimingParameters2],
      []
    ],
    ["GetAlignmentLevelLimits", 3, 20, [], [OcaInterval2(OcaFloat32)]],
    ["GetEndpoints", 3, 21, [], [OcaList(OcaMediaStreamEndpoint2)]],
    ["GetEndpoint", 3, 22, [OcaUint32], [OcaMediaStreamEndpoint2]],
    [
      "GetEndpointStatuses",
      3,
      23,
      [],
      [OcaMap(OcaUint32, OcaMediaStreamEndpointStatus2)]
    ],
    ["GetEndpointStatus", 3, 24, [OcaUint32], [OcaMediaStreamEndpointStatus2]],
    [
      "AddEndpoint",
      3,
      25,
      [OcaMediaStreamEndpoint2, OcaMediaStreamEndpointState2],
      [OcaMediaStreamEndpoint2]
    ],
    ["DeleteEndpoint", 3, 26, [OcaUint32], []],
    [
      "ApplyEndpointCommand",
      3,
      27,
      [OcaUint32, OcaMediaStreamEndpointCommand2],
      []
    ],
    ["SetEndpointUserLabel", 3, 28, [OcaUint32, OcaString], []],
    ["SetEndpointMediaStreamMode", 3, 29, [OcaUint32, OcaMediaStreamMode2], []],
    [
      "SetEndpointChannelMap",
      3,
      30,
      [OcaUint32, OcaMultiMap(OcaUint16, OcaPortID2)],
      []
    ],
    ["SetEndpointAlignmentLevel", 3, 31, [OcaUint32, OcaFloat32], []],
    [
      "GetEndpointTimeSource",
      3,
      32,
      [OcaUint32],
      [OcaTimeReferenceType2, OcaString]
    ],
    ["SetEndpointAdaptationData", 3, 33, [OcaUint32, OcaBlob], []],
    ["GetEndpointCounterSets", 3, 34, [], [OcaMap(OcaUint32, OcaCounterSet2)]],
    ["GetEndpointCounterSet", 3, 35, [OcaUint32], [OcaCounterSet2]],
    ["GetEndpointCounter", 3, 36, [OcaUint32, OcaUint16], [OcaCounter2]],
    [
      "AttachEndpointCounterNotifier",
      3,
      37,
      [OcaUint32, OcaUint16, OcaUint32],
      []
    ],
    [
      "DetachEndpointCounterNotifier",
      3,
      38,
      [OcaUint32, OcaUint16, OcaUint32],
      []
    ],
    ["ResetEndpointCounterSet", 3, 39, [OcaUint32, OcaUint16], []],
    ["GetTransportSessionControlAgentONos", 3, 40, [], [OcaList(OcaUint32)]],
    ["SetTransportSessionControlAgentONos", 3, 41, [OcaList(OcaUint32)], []]
  ],
  [
    ["Ports", [OcaList(OcaPort2)], 3, 1, false, false, null],
    [
      "PortClockMap",
      [OcaMap(OcaPortID2, OcaPortClockMapEntry2)],
      3,
      2,
      false,
      false,
      null
    ],
    ["MaxInputEndpoints", [OcaUint16], 3, 3, false, false, null],
    ["MaxOutputEndpoints", [OcaUint16], 3, 4, false, false, null],
    ["MaxPortsPerChannel", [OcaUint16], 3, 5, false, false, null],
    ["MaxChannelsPerEndpoint", [OcaUint16], 3, 6, false, false, null],
    [
      "MediaStreamModeCapabilities",
      [OcaList(OcaMediaStreamModeCapability2)],
      3,
      7,
      false,
      false,
      null
    ],
    [
      "TransportTimingParameters",
      [OcaMediaTransportTimingParameters2],
      3,
      8,
      false,
      false,
      null
    ],
    [
      "AlignmentLevelLimits",
      [OcaInterval2(OcaFloat32)],
      3,
      9,
      false,
      false,
      null
    ],
    ["Endpoints", [OcaList(OcaMediaStreamEndpoint2)], 3, 10, false, false, null],
    [
      "EndpointStatuses",
      [OcaMap(OcaUint32, OcaMediaStreamEndpointStatus2)],
      3,
      11,
      false,
      false,
      null
    ],
    [
      "TransportSessionControlAgentONos",
      [OcaList(OcaUint32)],
      3,
      13,
      false,
      false,
      null
    ]
  ],
  []
);

// node_modules/aes70/src/types/OcaMediaCoding.js
var OcaMediaCoding = class {
  /**
   * Codec ID + Coding parameters
   * @class OcaMediaCoding
   */
  constructor(CodingSchemeID, CodecParameters, ClockONo) {
    this.CodingSchemeID = CodingSchemeID;
    this.CodecParameters = CodecParameters;
    this.ClockONo = ClockONo;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaCoding.js
var OcaMediaCoding2 = Struct(
  {
    CodingSchemeID: OcaUint16,
    CodecParameters: OcaString,
    ClockONo: OcaUint32
  },
  OcaMediaCoding
);

// node_modules/aes70/src/types/OcaMediaConnection.js
var OcaMediaConnection = class {
  /**
   * A single-channel or multichannel connection between a local media connector
   * (i.e. **OcaMedia(Source/Sink)Connector** instance) of an
   * **OcaMediaTransportNetwork** object in this node and another ("remote")
   * media source or sink. Normally, the remote source or sink is in another
   * node. The remote end may or may not be an OCA-compliant device. A
   * connection is unidirectional. Its direction is determined by the connector
   * that owns the connection. Its direction is either:
   *
   *  - *Outbound: * A signal flow from a **source** connector to an external
   *    destination; or
   *
   *  - *Inbound: * A signal flow from an external source to a **sink**
   *    connector.
   *
   *
   * An **OcaMediaConnection** object may represent a connection to either a
   * unicast or a multicast stream. Any given **OcaMedia(Source/Sink)Connector**
   * object will only have one media connection. In non-OCA documents,
   * connections are sometimes referred to as *streams* or *flows.*
   * @class OcaMediaConnection
   */
  constructor(Secure, StreamParameters, StreamCastMode, StreamChannelCount) {
    this.Secure = Secure;
    this.StreamParameters = StreamParameters;
    this.StreamCastMode = StreamCastMode;
    this.StreamChannelCount = StreamChannelCount;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaConnection.js
var OcaMediaConnection2 = Struct(
  {
    Secure: OcaBoolean,
    StreamParameters: OcaBlob,
    StreamCastMode: OcaMediaStreamCastMode2,
    StreamChannelCount: OcaUint16
  },
  OcaMediaConnection
);

// node_modules/aes70/src/types/OcaMediaConnectorCommand.js
var OcaMediaConnectorCommand = class extends Enum({
  None: 0,
  Start: 1,
  Pause: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaConnectorCommand.js
var OcaMediaConnectorCommand2 = Enum8(OcaMediaConnectorCommand);

// node_modules/aes70/src/types/OcaMediaConnectorState.js
var OcaMediaConnectorState = class extends Enum({
  Stopped: 0,
  SettingUp: 1,
  Running: 2,
  Paused: 3,
  Fault: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaConnectorState.js
var OcaMediaConnectorState2 = Enum8(OcaMediaConnectorState);

// node_modules/aes70/src/types/OcaMediaConnectorStatus.js
var OcaMediaConnectorStatus = class {
  /**
   * Represents the current status of a media (source or sink) connector.
   * @class OcaMediaConnectorStatus
   */
  constructor(ConnectorID, State, ErrorCode) {
    this.ConnectorID = ConnectorID;
    this.State = State;
    this.ErrorCode = ErrorCode;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaConnectorStatus.js
var OcaMediaConnectorStatus2 = Struct(
  {
    ConnectorID: OcaUint16,
    State: OcaMediaConnectorState2,
    ErrorCode: OcaUint16
  },
  OcaMediaConnectorStatus
);

// node_modules/aes70/src/types/OcaMediaSinkConnector.js
var OcaMediaSinkConnector = class {
  /**
   * Media sink (i.e. input) connector. Connects to an inbound stream. Collected
   * by **OcaMediaTransportNetwork**.
   * @class OcaMediaSinkConnector
   */
  constructor(IDInternal, IDExternal, Connection2, AvailableCodings, PinCount, ChannelPinMap, AlignmentLevel, AlignmentGain, CurrentCoding) {
    this.IDInternal = IDInternal;
    this.IDExternal = IDExternal;
    this.Connection = Connection2;
    this.AvailableCodings = AvailableCodings;
    this.PinCount = PinCount;
    this.ChannelPinMap = ChannelPinMap;
    this.AlignmentLevel = AlignmentLevel;
    this.AlignmentGain = AlignmentGain;
    this.CurrentCoding = CurrentCoding;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaSinkConnector.js
var OcaMediaSinkConnector2 = Struct(
  {
    IDInternal: OcaUint16,
    IDExternal: OcaString,
    Connection: OcaMediaConnection2,
    AvailableCodings: OcaList(OcaMediaCoding2),
    PinCount: OcaUint16,
    ChannelPinMap: OcaMultiMap(OcaUint16, OcaPortID2),
    AlignmentLevel: OcaFloat32,
    AlignmentGain: OcaFloat32,
    CurrentCoding: OcaMediaCoding2
  },
  OcaMediaSinkConnector
);

// node_modules/aes70/src/OCP1/OcaMediaConnectorElement.js
var OcaMediaConnectorElement = Bitset16;

// node_modules/aes70/src/types/OcaMediaSinkConnectorChangedEventData.js
var OcaMediaSinkConnectorChangedEventData = class {
  /**
   * @class OcaMediaSinkConnectorChangedEventData
   */
  constructor(SinkConnector, ChangeType, ChangedElement) {
    this.SinkConnector = SinkConnector;
    this.ChangeType = ChangeType;
    this.ChangedElement = ChangedElement;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaSinkConnectorChangedEventData.js
var OcaMediaSinkConnectorChangedEventData2 = Struct(
  {
    SinkConnector: OcaMediaSinkConnector2,
    ChangeType: OcaPropertyChangeType2,
    ChangedElement: OcaMediaConnectorElement
  },
  OcaMediaSinkConnectorChangedEventData
);

// node_modules/aes70/src/types/OcaMediaSourceConnector.js
var OcaMediaSourceConnector = class {
  /**
   * Media source (i.e. output) connector. Connects to an outbound stream.
   * Collected by **OcaMediaTransportNetwork**.
   * @class OcaMediaSourceConnector
   */
  constructor(IDInternal, IDExternal, Connection2, AvailableCodings, PinCount, ChannelPinMap, AlignmentLevel, CurrentCoding) {
    this.IDInternal = IDInternal;
    this.IDExternal = IDExternal;
    this.Connection = Connection2;
    this.AvailableCodings = AvailableCodings;
    this.PinCount = PinCount;
    this.ChannelPinMap = ChannelPinMap;
    this.AlignmentLevel = AlignmentLevel;
    this.CurrentCoding = CurrentCoding;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaSourceConnector.js
var OcaMediaSourceConnector2 = Struct(
  {
    IDInternal: OcaUint16,
    IDExternal: OcaString,
    Connection: OcaMediaConnection2,
    AvailableCodings: OcaList(OcaMediaCoding2),
    PinCount: OcaUint16,
    ChannelPinMap: OcaMap(OcaUint16, OcaPortID2),
    AlignmentLevel: OcaFloat32,
    CurrentCoding: OcaMediaCoding2
  },
  OcaMediaSourceConnector
);

// node_modules/aes70/src/types/OcaMediaSourceConnectorChangedEventData.js
var OcaMediaSourceConnectorChangedEventData = class {
  /**
   * @class OcaMediaSourceConnectorChangedEventData
   */
  constructor(SourceConnector, ChangeType, ChangedElement) {
    this.SourceConnector = SourceConnector;
    this.ChangeType = ChangeType;
    this.ChangedElement = ChangedElement;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaSourceConnectorChangedEventData.js
var OcaMediaSourceConnectorChangedEventData2 = Struct(
  {
    SourceConnector: OcaMediaSourceConnector2,
    ChangeType: OcaPropertyChangeType2,
    ChangedElement: OcaMediaConnectorElement
  },
  OcaMediaSourceConnectorChangedEventData
);

// node_modules/aes70/src/types/OcaNetworkMediaProtocol.js
var OcaNetworkMediaProtocol = class extends Enum({
  None: 0,
  AV3: 1,
  AVBTP: 2,
  Dante: 3,
  Cobranet: 4,
  AES67: 5,
  SMPTEAudio: 6,
  LiveWire: 7,
  ExtensionPoint: 65
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkMediaProtocol.js
var OcaNetworkMediaProtocol2 = Enum8(OcaNetworkMediaProtocol);

// node_modules/aes70/src/controller/ControlClasses/OcaMediaTransportNetwork.js
var OcaMediaTransportNetwork = make_control_class(
  "OcaMediaTransportNetwork",
  3,
  "",
  1,
  OcaApplicationNetwork,
  [
    ["GetMediaProtocol", 3, 1, [], [OcaNetworkMediaProtocol2]],
    ["GetPorts", 3, 2, [], [OcaList(OcaPort2)]],
    ["GetPortName", 3, 3, [OcaPortID2], [OcaString]],
    ["SetPortName", 3, 4, [OcaPortID2, OcaString], []],
    ["GetMaxSourceConnectors", 3, 5, [], [OcaUint16]],
    ["GetMaxSinkConnectors", 3, 6, [], [OcaUint16]],
    ["GetMaxPinsPerConnector", 3, 7, [], [OcaUint16]],
    ["GetMaxPortsPerPin", 3, 8, [], [OcaUint16]],
    ["GetSourceConnectors", 3, 9, [], [OcaList(OcaMediaSourceConnector2)]],
    ["GetSourceConnector", 3, 10, [OcaUint16], [OcaMediaSourceConnector2]],
    ["GetSinkConnectors", 3, 11, [], [OcaList(OcaMediaSinkConnector2)]],
    ["GetSinkConnector", 3, 12, [OcaUint16], [OcaMediaSinkConnector2]],
    ["GetConnectorsStatuses", 3, 13, [], [OcaList(OcaMediaConnectorStatus2)]],
    ["GetConnectorStatus", 3, 14, [OcaUint16], [OcaMediaConnectorStatus2]],
    [
      "AddSourceConnector",
      3,
      15,
      [OcaMediaSourceConnector2, OcaMediaConnectorState2],
      []
    ],
    [
      "AddSinkConnector",
      3,
      16,
      [OcaMediaConnectorStatus2, OcaMediaSinkConnector2],
      [OcaMediaSinkConnector2]
    ],
    ["ControlConnector", 3, 17, [OcaUint16, OcaMediaConnectorCommand2], []],
    [
      "SetSourceConnectorPinMap",
      3,
      18,
      [OcaUint16, OcaMap(OcaUint16, OcaPortID2)],
      []
    ],
    [
      "SetSinkConnectorPinMap",
      3,
      19,
      [OcaUint16, OcaMultiMap(OcaUint16, OcaPortID2)],
      []
    ],
    ["SetConnectorConnection", 3, 20, [OcaUint16, OcaMediaConnection2], []],
    ["SetConnectorCoding", 3, 21, [OcaUint16, OcaMediaCoding2], []],
    ["SetConnectorAlignmentLevel", 3, 22, [OcaUint16, OcaFloat32], []],
    ["SetConnectorAlignmentGain", 3, 23, [OcaUint16, OcaFloat32], []],
    ["DeleteConnector", 3, 24, [OcaUint16], []],
    ["GetAlignmentLevel", 3, 25, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["GetAlignmentGain", 3, 26, [], [OcaFloat32, OcaFloat32, OcaFloat32]]
  ],
  [
    ["Protocol", [OcaNetworkMediaProtocol2], 3, 1, false, false, null],
    ["Ports", [OcaList(OcaPort2)], 3, 2, false, false, null],
    ["MaxSourceConnectors", [OcaUint16], 3, 3, false, false, null],
    ["MaxSinkConnectors", [OcaUint16], 3, 4, false, false, null],
    ["MaxPinsPerConnector", [OcaUint16], 3, 5, false, false, null],
    ["MaxPortsPerPin", [OcaUint16], 3, 6, false, false, null],
    ["AlignmentLevel", [OcaFloat32], 3, 7, false, false, null],
    ["AlignmentGain", [OcaFloat32], 3, 8, false, false, null]
  ],
  [
    ["ConnectorStatusChanged", 3, 3, [OcaMediaConnectorStatus2]],
    ["SinkConnectorChanged", 3, 2, [OcaMediaSinkConnectorChangedEventData2]],
    ["SourceConnectorChanged", 3, 1, [OcaMediaSourceConnectorChangedEventData2]]
  ]
);

// node_modules/aes70/src/types/OcaMediaTransportSessionConnection.js
var OcaMediaTransportSessionConnection = class {
  /**
   * A Media Stream connection belonging to an **OcaMediaTransportSession**
   * instance.
   * @class OcaMediaTransportSessionConnection
   */
  constructor(ID, LocalEndpointID, RemoteEndpointID) {
    this.ID = ID;
    this.LocalEndpointID = LocalEndpointID;
    this.RemoteEndpointID = RemoteEndpointID;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaTransportSessionConnection.js
var OcaMediaTransportSessionConnection2 = Struct(
  {
    ID: OcaUint32,
    LocalEndpointID: OcaUint32,
    RemoteEndpointID: OcaBlob
  },
  OcaMediaTransportSessionConnection
);

// node_modules/aes70/src/types/OcaMediaTransportSessionConnectionState.js
var OcaMediaTransportSessionConnectionState = class {
  /**
   * State of a stream connection belonging to an **OcaMediaTransportSession**
   * instance. The state of a stream connection is the union of the states of
   * its two endpoints.
   * @class OcaMediaTransportSessionConnectionState
   */
  constructor(LocalEndpointState, RemoteEndpointState) {
    this.LocalEndpointState = LocalEndpointState;
    this.RemoteEndpointState = RemoteEndpointState;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaTransportSessionConnectionState.js
var OcaMediaTransportSessionConnectionState2 = Struct(
  {
    LocalEndpointState: OcaMediaStreamEndpointState2,
    RemoteEndpointState: OcaMediaStreamEndpointState2
  },
  OcaMediaTransportSessionConnectionState
);

// node_modules/aes70/src/types/OcaMediaTransportSession.js
var OcaMediaTransportSession = class {
  /**
   * Container of all the Media Transport Sessions belonging to a Media
   * Transport Session control Agent.
   * @class OcaMediaTransportSession
   */
  constructor(IDInternal, IDExternal, UserLabel, StreamingEnabled, AdaptationData, Connections, ConnectionStates) {
    this.IDInternal = IDInternal;
    this.IDExternal = IDExternal;
    this.UserLabel = UserLabel;
    this.StreamingEnabled = StreamingEnabled;
    this.AdaptationData = AdaptationData;
    this.Connections = Connections;
    this.ConnectionStates = ConnectionStates;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaTransportSession.js
var OcaMediaTransportSession2 = Struct(
  {
    IDInternal: OcaUint32,
    IDExternal: OcaBlob,
    UserLabel: OcaString,
    StreamingEnabled: OcaBoolean,
    AdaptationData: OcaBlob,
    Connections: OcaList(OcaMediaTransportSessionConnection2),
    ConnectionStates: OcaMap(
      OcaUint32,
      OcaMediaTransportSessionConnectionState2
    )
  },
  OcaMediaTransportSession
);

// node_modules/aes70/src/types/OcaMediaTransportSessionState.js
var OcaMediaTransportSessionState = class extends Enum({
  Unconfigured: 1,
  Configured: 2,
  ConnectedNotStreaming: 3,
  ConnectedStreaming: 4,
  Error: 5
}) {
};

// node_modules/aes70/src/OCP1/OcaMediaTransportSessionState.js
var OcaMediaTransportSessionState2 = Enum8(OcaMediaTransportSessionState);

// node_modules/aes70/src/types/OcaMediaTransportSessionStatus.js
var OcaMediaTransportSessionStatus = class {
  /**
   * Status of a media transport session. Two parts: a generic part, and an
   * application-specific part.
   * @class OcaMediaTransportSessionStatus
   */
  constructor(State, AdaptationData) {
    this.State = State;
    this.AdaptationData = AdaptationData;
  }
};

// node_modules/aes70/src/OCP1/OcaMediaTransportSessionStatus.js
var OcaMediaTransportSessionStatus2 = Struct(
  {
    State: OcaMediaTransportSessionState2,
    AdaptationData: OcaBlob
  },
  OcaMediaTransportSessionStatus
);

// node_modules/aes70/src/controller/ControlClasses/OcaMediaTransportSessionAgent.js
var OcaMediaTransportSessionAgent = make_control_class(
  "OcaMediaTransportSessionAgent",
  3,
  "",
  1,
  OcaAgent,
  [
    ["GetSessionType", 3, 1, [], [OcaString]],
    ["GetSessions", 3, 2, [], [OcaList(OcaMediaTransportSession2)]],
    ["GetSession", 3, 3, [OcaUint32], [OcaMediaTransportSession2]],
    [
      "AddSession",
      3,
      4,
      [OcaMediaTransportSession2],
      [OcaMediaTransportSession2]
    ],
    ["ConfigureSession", 3, 5, [OcaUint32, OcaBlob, OcaString, OcaBlob], []],
    ["DeleteSession", 3, 6, [OcaUint32], []],
    ["ResetSession", 3, 7, [OcaUint32], []],
    ["SetStreamingEnabled", 3, 8, [OcaUint32, OcaBoolean], []],
    ["StartStreaming", 3, 9, [OcaUint32], []],
    ["StopStreaming", 3, 10, [OcaUint32], []],
    [
      "GetSessionStatuses",
      3,
      11,
      [],
      [OcaMap(OcaUint32, OcaMediaTransportSessionStatus2)]
    ],
    ["GetSessionStatus", 3, 12, [OcaUint32], [OcaMediaTransportSessionStatus2]],
    [
      "AddConnection",
      3,
      13,
      [OcaUint32, OcaMediaTransportSessionConnection2],
      [OcaMediaTransportSessionConnection2]
    ],
    [
      "ConfigureConnection",
      3,
      14,
      [OcaUint32, OcaUint32, OcaUint32, OcaBlob],
      []
    ],
    ["DeleteConnection", 3, 15, [OcaUint32, OcaUint32], []],
    ["DeleteConnections", 3, 16, [OcaUint32], []],
    ["GetAdaptationData", 3, 17, [], [OcaBlob]],
    ["SetAdaptationData", 3, 18, [OcaBlob], []]
  ],
  [
    ["SessionType", [OcaString], 3, 1, true, false, null],
    ["Sessions", [OcaList(OcaMediaTransportSession2)], 3, 2, false, false, null],
    [
      "SessionStatuses",
      [OcaMap(OcaUint32, OcaMediaTransportSessionStatus2)],
      3,
      3,
      false,
      false,
      null
    ],
    ["AdaptationData", [OcaBlob], 3, 4, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaMuteState.js
var OcaMuteState = class extends Enum({
  Muted: 1,
  Unmuted: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaMuteState.js
var OcaMuteState2 = Enum8(OcaMuteState);

// node_modules/aes70/src/controller/ControlClasses/OcaMute.js
var OcaMute = make_control_class(
  "OcaMute",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetState", 4, 1, [], [OcaMuteState2]],
    ["SetState", 4, 2, [OcaMuteState2], []]
  ],
  [["State", [OcaMuteState2], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaNetworkLinkType.js
var OcaNetworkLinkType = class extends Enum({
  None: 0,
  EthernetWired: 1,
  EthernetWireless: 2,
  USB: 3,
  SerialP2P: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkLinkType.js
var OcaNetworkLinkType2 = Enum8(OcaNetworkLinkType);

// node_modules/aes70/src/types/OcaNetworkStatistics.js
var OcaNetworkStatistics = class {
  /**
   * Historical statistics of the network.
   * @class OcaNetworkStatistics
   */
  constructor(rxPacketErrors, txPacketErrors) {
    this.rxPacketErrors = rxPacketErrors;
    this.txPacketErrors = txPacketErrors;
  }
};

// node_modules/aes70/src/OCP1/OcaNetworkStatistics.js
var OcaNetworkStatistics2 = Struct(
  {
    rxPacketErrors: OcaUint32,
    txPacketErrors: OcaUint32
  },
  OcaNetworkStatistics
);

// node_modules/aes70/src/types/OcaNetworkStatus.js
var OcaNetworkStatus = class extends Enum({
  Unknown: 0,
  Ready: 1,
  StartingUp: 2,
  Stopped: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkStatus.js
var OcaNetworkStatus2 = Enum8(OcaNetworkStatus);

// node_modules/aes70/src/types/OcaNetworkSystemInterfaceID.js
var OcaNetworkSystemInterfaceID = class {
  /**
   * ID of a system interface used by a network. Format is data network type
   * dependent.
   * @class OcaNetworkSystemInterfaceID
   */
  constructor(SystemInterfaceHandle, MyNetworkAddress) {
    this.SystemInterfaceHandle = SystemInterfaceHandle;
    this.MyNetworkAddress = MyNetworkAddress;
  }
};

// node_modules/aes70/src/OCP1/OcaNetworkSystemInterfaceID.js
var OcaNetworkSystemInterfaceID2 = Struct(
  {
    SystemInterfaceHandle: OcaBlob,
    MyNetworkAddress: OcaBlob
  },
  OcaNetworkSystemInterfaceID
);

// node_modules/aes70/src/controller/ControlClasses/OcaNetwork.js
var OcaNetwork = make_control_class(
  "OcaNetwork",
  3,
  "",
  3,
  OcaAgent,
  [
    ["GetLinkType", 3, 1, [], [OcaNetworkLinkType2]],
    ["GetIDAdvertised", 3, 2, [], [OcaBlob]],
    ["SetIDAdvertised", 3, 3, [OcaBlob], []],
    ["GetControlProtocol", 3, 4, [], [OcaNetworkControlProtocol2]],
    ["GetMediaProtocol", 3, 5, [], [OcaNetworkMediaProtocol2]],
    ["GetStatus", 3, 6, [], [OcaNetworkStatus2]],
    ["GetStatistics", 3, 7, [], [OcaNetworkStatistics2]],
    ["ResetStatistics", 3, 8, [], []],
    ["GetSystemInterfaces", 3, 9, [], [OcaList(OcaNetworkSystemInterfaceID2)]],
    ["SetSystemInterfaces", 3, 10, [OcaList(OcaNetworkSystemInterfaceID2)], []],
    ["GetMediaPorts", 3, 11, [], [OcaList(OcaUint32)]],
    ["Startup", 3, 12, [], []],
    ["Shutdown", 3, 13, [], []]
  ],
  [
    ["LinkType", [OcaNetworkLinkType2], 3, 1, true, false, null],
    ["IDAdvertised", [OcaBlob], 3, 2, false, false, null],
    ["ControlProtocol", [OcaNetworkControlProtocol2], 3, 3, false, false, null],
    ["MediaProtocol", [OcaNetworkMediaProtocol2], 3, 4, false, false, null],
    ["Status", [OcaNetworkStatus2], 3, 5, false, false, null],
    [
      "SystemInterfaces",
      [OcaList(OcaNetworkSystemInterfaceID2)],
      3,
      6,
      false,
      false,
      null
    ],
    ["MediaPorts", [OcaList(OcaUint32)], 3, 7, false, false, null],
    ["Statistics", [OcaNetworkStatistics2], 3, 8, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaNetworkInterfaceCommand.js
var OcaNetworkInterfaceCommand = class extends Enum({
  Start: 0,
  Stop: 1,
  Restart: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkInterfaceCommand.js
var OcaNetworkInterfaceCommand2 = Enum8(OcaNetworkInterfaceCommand);

// node_modules/aes70/src/types/OcaNetworkInterfaceState.js
var OcaNetworkInterfaceState = class extends Enum({
  NotReady: 0,
  Ready: 1,
  Fault: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkInterfaceState.js
var OcaNetworkInterfaceState2 = Enum8(OcaNetworkInterfaceState);

// node_modules/aes70/src/types/OcaNetworkInterfaceStatus.js
var OcaNetworkInterfaceStatus = class {
  /**
   * Network-type-specific network interface status.
   * @class OcaNetworkInterfaceStatus
   */
  constructor(State, AdaptationData) {
    this.State = State;
    this.AdaptationData = AdaptationData;
  }
};

// node_modules/aes70/src/OCP1/OcaNetworkInterfaceStatus.js
var OcaNetworkInterfaceStatus2 = Struct(
  {
    State: OcaNetworkInterfaceState2,
    AdaptationData: OcaBlob
  },
  OcaNetworkInterfaceStatus
);

// node_modules/aes70/src/controller/ControlClasses/OcaNetworkInterface.js
var OcaNetworkInterface = make_control_class(
  "OcaNetworkInterface",
  2,
  "",
  1,
  OcaRoot,
  [
    ["GetLabel", 2, 1, [], [OcaString]],
    ["SetLabel", 2, 2, [OcaString], []],
    ["GetOwner", 2, 3, [], [OcaUint32]],
    ["GetPath", 2, 4, [], [OcaList(OcaString), OcaList(OcaUint32)]],
    ["GetEnabled", 2, 5, [], [OcaBoolean]],
    ["SetEnabled", 2, 6, [OcaBoolean], []],
    ["GetSystemIoInterfaceName", 2, 7, [], [OcaString]],
    ["SetSystemIoInterfaceName", 2, 8, [OcaString], []],
    ["GetGroupID", 2, 9, [], [OcaUint16]],
    ["SetGroupID", 2, 10, [OcaUint16], []],
    ["GetPrecedence", 2, 11, [], [OcaUint8]],
    ["SetPrecedence", 2, 12, [OcaUint8], []],
    ["GetAdaptationIdentifier", 2, 13, [], [OcaString]],
    ["GetActiveNetworkSettings", 2, 14, [], [OcaBlob]],
    ["GetTargetNetworkSettings", 2, 15, [], [OcaBlob]],
    ["SetTargetNetworkSettings", 2, 16, [OcaBlob], []],
    ["GetNetworkSettingsPending", 2, 17, [], [OcaBoolean]],
    ["GetStatus", 2, 18, [], [OcaNetworkInterfaceStatus2]],
    ["GetErrorCode", 2, 19, [], [OcaUint16]],
    ["GetCounterSet", 2, 20, [], [OcaCounterSet2]],
    ["GetCounter", 2, 21, [OcaUint16], [OcaCounter2]],
    ["AttachCounterNotifier", 2, 22, [OcaUint16, OcaUint32], []],
    ["DetachCounterNotifier", 2, 23, [OcaUint16, OcaUint32], []],
    ["ResetCounters", 2, 24, [], []],
    ["ApplyCommand", 2, 25, [OcaNetworkInterfaceCommand2], []]
  ],
  [
    ["Label", [OcaString], 2, 1, false, false, null],
    ["Owner", [OcaUint32], 2, 2, true, false, null],
    ["Enabled", [OcaBoolean], 2, 3, false, false, null],
    ["SystemIoInterfaceName", [OcaString], 2, 4, false, false, null],
    ["GroupID", [OcaUint16], 2, 5, false, false, null],
    ["Precedence", [OcaUint16], 2, 6, false, false, null],
    ["AdaptationIdentifier", [OcaString], 2, 7, false, false, null],
    ["ActiveNetworkSettings", [OcaBlob], 2, 8, false, false, null],
    ["TargetNetworkSettings", [OcaBlob], 2, 9, false, false, null],
    ["NetworkSettingsPending", [OcaBoolean], 2, 10, false, false, null],
    ["Status", [OcaNetworkInterfaceStatus2], 2, 11, false, false, null],
    ["ErrorCode", [OcaUint16], 2, 12, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaNetworkMediaSourceOrSink.js
var OcaNetworkMediaSourceOrSink = class extends Enum({
  None: 0,
  Source: 1,
  Sink: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkMediaSourceOrSink.js
var OcaNetworkMediaSourceOrSink2 = Enum8(OcaNetworkMediaSourceOrSink);

// node_modules/aes70/src/types/OcaNetworkSignalChannelStatus.js
var OcaNetworkSignalChannelStatus = class extends Enum({
  NotConnected: 0,
  Connected: 1,
  Muted: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaNetworkSignalChannelStatus.js
var OcaNetworkSignalChannelStatus2 = Enum8(OcaNetworkSignalChannelStatus);

// node_modules/aes70/src/controller/ControlClasses/OcaNetworkSignalChannel.js
var OcaNetworkSignalChannel = make_control_class(
  "OcaNetworkSignalChannel",
  3,
  "",
  3,
  OcaWorker,
  [
    ["GetIDAdvertised", 3, 1, [], [OcaBlob]],
    ["SetIDAdvertised", 3, 2, [OcaBlob], []],
    ["GetNetwork", 3, 3, [], [OcaUint32]],
    ["SetNetwork", 3, 4, [OcaUint32], []],
    ["GetConnectorPins", 3, 5, [], [OcaMap(OcaUint32, OcaUint16)]],
    ["AddToConnector", 3, 6, [OcaUint32, OcaUint16], []],
    ["RemoveFromConnector", 3, 7, [OcaUint32], []],
    ["GetRemoteChannelID", 3, 8, [], [OcaBlob]],
    ["SetRemoteChannelID", 3, 9, [OcaBlob], []],
    ["GetSourceOrSink", 3, 10, [], [OcaNetworkMediaSourceOrSink2]],
    ["GetStatus", 3, 11, [], [OcaNetworkSignalChannelStatus2]]
  ],
  [
    ["IDAdvertised", [OcaBlob], 3, 1, false, false, null],
    ["Network", [OcaUint32], 3, 2, false, false, null],
    ["ConnectorPins", [OcaMap(OcaUint32, OcaUint16)], 3, 3, false, false, null],
    ["RemoteChannelID", [OcaBlob], 3, 4, false, false, null],
    ["SourceOrSink", [OcaNetworkMediaSourceOrSink2], 3, 5, false, false, null],
    ["Status", [OcaNetworkSignalChannelStatus2], 3, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaObservationEventData.js
var OcaObservationEventData = class {
  /**
   * Notification data supplied by event **OcaNumericObserver.Observation**.
   * Note: due to an error in AES70-2015, this class was not made a subclass of
   * **OcaEventData**. Therefore, this class explicitly defines the **Event**
   * property explicitly, rather than inheriting it from **OcaEventData,** as
   * other event data classes do. However, the effect is the same as for all
   * event data classes: the first property in the data structure is an
   * **OcaEvent** value.
   * @class OcaObservationEventData
   */
  constructor(Reading) {
    this.Reading = Reading;
  }
};

// node_modules/aes70/src/OCP1/OcaObservationEventData.js
var OcaObservationEventData2 = Struct(
  {
    Reading: OcaFloat64
  },
  OcaObservationEventData
);

// node_modules/aes70/src/types/OcaObserverState.js
var OcaObserverState = class extends Enum({
  NotTriggered: 0,
  Triggered: 1
}) {
};

// node_modules/aes70/src/OCP1/OcaObserverState.js
var OcaObserverState2 = Enum8(OcaObserverState);

// node_modules/aes70/src/types/OcaBaseDataType.js
var OcaBaseDataType = class extends Enum({
  None: 0,
  OcaBoolean: 1,
  OcaInt8: 2,
  OcaInt16: 3,
  OcaInt32: 4,
  OcaInt64: 5,
  OcaUint8: 6,
  OcaUint16: 7,
  OcaUint32: 8,
  OcaUint64: 9,
  OcaFloat32: 10,
  OcaFloat64: 11,
  OcaString: 12,
  OcaBitstring: 13,
  OcaBlob: 14,
  OcaBlobFixedLen: 15,
  OcaBit: 16
}) {
};

// node_modules/aes70/src/OCP1/OcaBaseDataType.js
var OcaBaseDataType2 = Enum8(OcaBaseDataType);

// node_modules/aes70/src/types/OcaPropertyDescriptor.js
var OcaPropertyDescriptor = class {
  /**
   * Description of an OCA property, including property ID, Get and Set method
   * IDs, and datatype.
   * @class OcaPropertyDescriptor
   */
  constructor(PropertyID, BaseDataType, GetterMethodID, SetterMethodID) {
    this.PropertyID = PropertyID;
    this.BaseDataType = BaseDataType;
    this.GetterMethodID = GetterMethodID;
    this.SetterMethodID = SetterMethodID;
  }
};

// node_modules/aes70/src/OCP1/OcaPropertyDescriptor.js
var OcaPropertyDescriptor2 = Struct(
  {
    PropertyID: OcaPropertyID2,
    BaseDataType: OcaBaseDataType2,
    GetterMethodID: OcaMethodID2,
    SetterMethodID: OcaMethodID2
  },
  OcaPropertyDescriptor
);

// node_modules/aes70/src/types/OcaProperty.js
var OcaProperty = class {
  /**
   * Identification of an OCA property instance, including object number,
   * property ID, Get and Set method IDs, and datatype.
   * @class OcaProperty
   */
  constructor(ONo, Descriptor) {
    this.ONo = ONo;
    this.Descriptor = Descriptor;
  }
};

// node_modules/aes70/src/OCP1/OcaProperty.js
var OcaProperty2 = Struct(
  {
    ONo: OcaUint32,
    Descriptor: OcaPropertyDescriptor2
  },
  OcaProperty
);

// node_modules/aes70/src/controller/ControlClasses/OcaNumericObserver.js
var OcaNumericObserver = make_control_class(
  "OcaNumericObserver",
  3,
  "",
  3,
  OcaAgent,
  [
    ["GetLastObservation", 3, 1, [], [OcaFloat64]],
    ["GetState", 3, 2, [], [OcaObserverState2]],
    ["GetObservedProperty", 3, 3, [], [OcaProperty2]],
    ["SetObservedProperty", 3, 4, [OcaProperty2], []],
    ["GetThreshold", 3, 5, [], [OcaFloat64]],
    ["SetThreshold", 3, 6, [OcaFloat64], []],
    ["GetOperator", 3, 7, [], [OcaRelationalOperator2]],
    ["SetOperator", 3, 8, [OcaRelationalOperator2], []],
    ["GetTwoWay", 3, 9, [], [OcaBoolean]],
    ["SetTwoWay", 3, 10, [OcaBoolean], []],
    ["GetHysteresis", 3, 11, [], [OcaFloat64]],
    ["SetHysteresis", 3, 12, [OcaFloat64], []],
    ["GetPeriod", 3, 13, [], [OcaFloat32]],
    ["SetPeriod", 3, 14, [OcaFloat32], []]
  ],
  [
    ["State", [OcaObserverState2], 3, 1, false, false, null],
    ["ObservedProperty", [OcaProperty2], 3, 2, false, false, null],
    ["Threshold", [OcaFloat64], 3, 3, false, false, null],
    ["Operator", [OcaRelationalOperator2], 3, 4, false, false, null],
    ["TwoWay", [OcaBoolean], 3, 5, false, false, null],
    ["Hysteresis", [OcaFloat64], 3, 6, false, false, null],
    ["Period", [OcaFloat32], 3, 7, false, false, null]
  ],
  [["Observation", 3, 1, [OcaObservationEventData2]]]
);

// node_modules/aes70/src/types/OcaObservationListEventData.js
var OcaObservationListEventData = class {
  /**
   * Notification data supplied by event **OcaNumericObserverList.Observation**.
   * Note: due to an error in AES70-2015, this class was not made a subclass of
   * **OcaEventData**. Therefore, this class explicitly defines the **Event**
   * property explicitly, rather than inheriting it from **OcaEventData,** as
   * other event data classes do. However, the effect is the same as for all
   * event data classes: the first property in the data structure is an
   * **OcaEvent** value.
   * @class OcaObservationListEventData
   */
  constructor(Reading) {
    this.Reading = Reading;
  }
};

// node_modules/aes70/src/OCP1/OcaObservationListEventData.js
var OcaObservationListEventData2 = Struct(
  {
    Reading: OcaList(OcaFloat64)
  },
  OcaObservationListEventData
);

// node_modules/aes70/src/controller/ControlClasses/OcaNumericObserverList.js
var OcaNumericObserverList = make_control_class(
  "OcaNumericObserverList",
  3,
  "	",
  3,
  OcaAgent,
  [
    ["GetLastObservation", 3, 1, [], [OcaList(OcaFloat64)]],
    ["GetState", 3, 2, [], [OcaObserverState2]],
    ["GetObservedProperties", 3, 3, [], [OcaList(OcaProperty2)]],
    ["SetObservedProperties", 3, 4, [OcaList(OcaProperty2)], []],
    ["GetThreshold", 3, 5, [], [OcaFloat64]],
    ["SetThreshold", 3, 6, [OcaFloat64], []],
    ["GetOperator", 3, 7, [], [OcaRelationalOperator2]],
    ["SetOperator", 3, 8, [OcaRelationalOperator2], []],
    ["GetTwoWay", 3, 9, [], [OcaBoolean]],
    ["SetTwoWay", 3, 10, [OcaBoolean], []],
    ["GetHysteresis", 3, 11, [], [OcaFloat64]],
    ["SetHysteresis", 3, 12, [OcaFloat64], []],
    ["GetPeriod", 3, 13, [], [OcaFloat32]],
    ["SetPeriod", 3, 14, [OcaFloat32], []]
  ],
  [
    ["State", [OcaObserverState2], 3, 1, false, false, null],
    ["ObservedProperties", [OcaList(OcaProperty2)], 3, 2, false, false, null],
    ["Threshold", [OcaFloat64], 3, 3, false, false, null],
    ["Operator", [OcaRelationalOperator2], 3, 4, false, false, null],
    ["TwoWay", [OcaBoolean], 3, 5, false, false, null],
    ["Hysteresis", [OcaFloat64], 3, 6, false, false, null],
    ["Period", [OcaFloat32], 3, 7, false, false, null]
  ],
  [["Observation", 3, 1, [OcaObservationListEventData2]]]
);

// node_modules/aes70/src/controller/ControlClasses/OcaPanBalance.js
var OcaPanBalance = make_control_class(
  "OcaPanBalance",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetPosition", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetPosition", 4, 2, [OcaFloat32], []],
    ["GetMidpointGain", 4, 3, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetMidpointGain", 4, 4, [OcaFloat32], []]
  ],
  [
    ["Position", [OcaFloat32], 4, 1, false, false, null],
    ["MidpointGain", [OcaFloat32], 4, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaPositionCoordinateSystem.js
var OcaPositionCoordinateSystem = class extends Enum({
  Robotic: 1,
  ItuAudioObjectBasedPolar: 2,
  ItuAudioObjectBasedCartesian: 3,
  ItuAudioSceneBasedPolar: 4,
  ItuAudioSceneBasedCartesian: 5,
  NAV: 6,
  ProprietaryBase: 128
}) {
};

// node_modules/aes70/src/OCP1/OcaPositionCoordinateSystem.js
var OcaPositionCoordinateSystem2 = Enum8(OcaPositionCoordinateSystem);

// node_modules/aes70/src/OCP1/OcaArray1D.js
function OcaArray1DConstantLength(Type, length) {
  const encodedLength = Type.encodedLength(void 0);
  const encodeTo = Type.encodeTo;
  const decode = Type.decode;
  const canEncode2 = function(value) {
    return (Array.isArray(value) || isTypedArray(value)) && value.length === length;
  };
  return createType({
    isConstantLength: true,
    canEncode: canEncode2,
    encodedLength: function() {
      return length * encodedLength;
    },
    encodeTo: function(dataView, pos, value) {
      for (let i = 0; i < length; i++) {
        pos = encodeTo(dataView, pos, value[i]);
      }
      return pos;
    },
    decode: function(dataView, pos) {
      const value = new Array(length);
      for (let i = 0; i < length; i++) {
        value[i] = decode(dataView, pos);
        pos += encodedLength;
      }
      return value;
    }
  });
}
function OcaArray1DDynamicLength(Type, length) {
  const encodedLength = Type.encodedLength;
  const encodeTo = Type.encodeTo;
  const decodeFrom = Type.decodeFrom;
  const decodeLength = Type.decodeLength;
  const canEncode2 = function(value) {
    return (Array.isArray(value) || isTypedArray(value)) && value.length === length;
  };
  return createType({
    isConstantLength: false,
    canEncode: canEncode2,
    encodedLength: function(value) {
      if (!canEncode2(value))
        throw new TypeError(`Expected array of length ${length}.`);
      let result = 0;
      for (let i = 0; i < length; i++) {
        result += encodedLength(value[i]);
      }
      return result;
    },
    encodeTo: function(dataView, pos, value) {
      for (let i = 0; i < length; i++) {
        pos = encodeTo(dataView, pos, value[i]);
      }
      return pos;
    },
    decodeFrom: function(dataView, pos) {
      const value = new Array(length);
      for (let i = 0; i < length; i++) {
        let tmp;
        [pos, tmp] = decodeFrom(dataView, pos);
        value[i] = tmp;
      }
      return [pos, value];
    },
    decodeLength: function(dataView, pos) {
      for (let i = 0; i < length; i++) {
        pos = decodeLength(dataView, pos);
      }
      return pos;
    }
  });
}
function OcaArray1D(Type, length) {
  if (typeof length !== "number" || !isFinite(length) || !Number.isInteger(length) || length <= 0)
    throw new TypeError(`Expected length to be a positive integer.`);
  return Type.isConstantLength ? OcaArray1DConstantLength(Type, length) : OcaArray1DDynamicLength(Type, length);
}

// node_modules/aes70/src/OCP1/OcaPositionDescriptorFieldFlags.js
var OcaPositionDescriptorFieldFlags = Bitset16;

// node_modules/aes70/src/types/OcaPositionDescriptor.js
var OcaPositionDescriptor = class {
  /**
   * A six-axis (c1,c2,c3,c4,c5,c6) coordinate. For mechanical systems, these
   * axes shall be interpreted as follows:
   *
   *  - c1 = X; axial (fore-and-aft) position
   *
   *  - c2 = Y; lateral (side-to-side) position
   *
   *  - c3 = Z; vertical position
   *
   *  - c4 = rX; rotation around the X-axis, also known as *Roll*
   *
   *  - c5 = rY; rotation around the Y-axis, also known as *Pitch*
   *
   *  - c6 = rZ; rotation around the Z-axis. also known as *Yaw*
   *
   *
   * Rotation angles are measured according to the *right-hand rule:* if the
   * right hand "holds" an axis with the thumb pointing in the direction of
   * ascending coordinate values, then the fingers point in the direction of
   * ascending angle values. For GPS systems, these axes shall be interpreted as
   * follows:
   *
   *  - c1 = longitude
   *
   *  - c2 = latitude
   *
   *  - c3 = altitude
   *
   *  - c4 : not used
   *
   *  - c5 : not used
   *
   *  - c6 : not used
   *
   *
   * @class OcaPositionDescriptor
   */
  constructor(CoordinateSystem, FieldFlags, Values) {
    this.CoordinateSystem = CoordinateSystem;
    this.FieldFlags = FieldFlags;
    this.Values = Values;
  }
};

// node_modules/aes70/src/OCP1/OcaPositionDescriptor.js
var OcaPositionDescriptor2 = Struct(
  {
    CoordinateSystem: OcaPositionCoordinateSystem2,
    FieldFlags: OcaPositionDescriptorFieldFlags,
    Values: OcaArray1D(OcaFloat32, 6)
  },
  OcaPositionDescriptor
);

// node_modules/aes70/src/controller/ControlClasses/OcaPhysicalPosition.js
var OcaPhysicalPosition = make_control_class(
  "OcaPhysicalPosition",
  3,
  "",
  3,
  OcaAgent,
  [
    ["GetCoordinateSystem", 3, 1, [], [OcaPositionCoordinateSystem2]],
    [
      "GetPositionDescriptorFieldFlags",
      3,
      2,
      [],
      [OcaPositionDescriptorFieldFlags]
    ],
    [
      "GetPositionDescriptor",
      3,
      3,
      [],
      [OcaPositionDescriptor2, OcaPositionDescriptor2, OcaPositionDescriptor2]
    ],
    ["SetPositionDescriptor", 3, 4, [OcaPositionDescriptor2], []]
  ],
  [
    [
      "CoordinateSystem",
      [OcaPositionCoordinateSystem2],
      3,
      1,
      true,
      false,
      null
    ],
    [
      "PositionDescriptorFieldFlags",
      [OcaPositionDescriptorFieldFlags],
      3,
      2,
      true,
      false,
      null
    ],
    ["PositionDescriptor", [OcaPositionDescriptor2], 3, 3, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaPolarityState.js
var OcaPolarityState = class extends Enum({
  NonInverted: 1,
  Inverted: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaPolarityState.js
var OcaPolarityState2 = Enum8(OcaPolarityState);

// node_modules/aes70/src/controller/ControlClasses/OcaPolarity.js
var OcaPolarity = make_control_class(
  "OcaPolarity",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetState", 4, 1, [], [OcaPolarityState2]],
    ["SetState", 4, 2, [OcaPolarityState2], []]
  ],
  [["State", [OcaPolarityState2], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaPowerSensor.js
var OcaPowerSensor = make_control_class(
  "OcaPowerSensor",
  4,
  "\v",
  1,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32, OcaFloat32]]],
  [
    ["Power", [OcaFloat32], 4, 1, false, false, null],
    ["PowerFactor", [OcaFloat32], 4, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaPowerSupplyLocation.js
var OcaPowerSupplyLocation = class extends Enum({
  Unspecified: 1,
  Internal: 2,
  External: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaPowerSupplyLocation.js
var OcaPowerSupplyLocation2 = Enum8(OcaPowerSupplyLocation);

// node_modules/aes70/src/types/OcaPowerSupplyState.js
var OcaPowerSupplyState = class extends Enum({
  Off: 0,
  Unavailable: 1,
  Available: 2,
  Active: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaPowerSupplyState.js
var OcaPowerSupplyState2 = Enum8(OcaPowerSupplyState);

// node_modules/aes70/src/types/OcaPowerSupplyType.js
var OcaPowerSupplyType = class extends Enum({
  None: 0,
  Mains: 1,
  Battery: 2,
  Phantom: 3,
  Solar: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaPowerSupplyType.js
var OcaPowerSupplyType2 = Enum8(OcaPowerSupplyType);

// node_modules/aes70/src/controller/ControlClasses/OcaPowerSupply.js
var OcaPowerSupply = make_control_class(
  "OcaPowerSupply",
  3,
  "\x07",
  3,
  OcaAgent,
  [
    ["GetType", 3, 1, [], [OcaPowerSupplyType2]],
    ["GetModelInfo", 3, 2, [], [OcaString]],
    ["GetState", 3, 3, [], [OcaPowerSupplyState2]],
    ["SetState", 3, 4, [OcaPowerSupplyState2], []],
    ["GetCharging", 3, 5, [], [OcaBoolean]],
    ["GetLoadFractionAvailable", 3, 6, [], [OcaFloat32]],
    ["GetStorageFractionAvailable", 3, 7, [], [OcaFloat32]],
    ["GetLocation", 3, 8, [], [OcaPowerSupplyLocation2]]
  ],
  [
    ["Type", [OcaPowerSupplyType2], 3, 1, false, false, null],
    ["ModelInfo", [OcaString], 3, 2, false, false, null],
    ["State", [OcaPowerSupplyState2], 3, 3, false, false, null],
    ["Charging", [OcaBoolean], 3, 4, false, false, null],
    ["LoadFractionAvailable", [OcaFloat32], 3, 5, false, false, null],
    ["StorageFractionAvailable", [OcaFloat32], 3, 6, false, false, null],
    ["Location", [OcaPowerSupplyLocation2], 3, 7, true, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaRamperCommand.js
var OcaRamperCommand = class extends Enum({
  Enable: 1,
  Start: 2,
  Halt: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaRamperCommand.js
var OcaRamperCommand2 = Enum8(OcaRamperCommand);

// node_modules/aes70/src/types/OcaRamperInterpolationLaw.js
var OcaRamperInterpolationLaw = class extends Enum({
  Linear: 1,
  ReverseLinear: 2,
  Sine: 3,
  Exponential: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaRamperInterpolationLaw.js
var OcaRamperInterpolationLaw2 = Enum8(OcaRamperInterpolationLaw);

// node_modules/aes70/src/types/OcaRamperState.js
var OcaRamperState = class extends Enum({
  NotInitialized: 1,
  Initialized: 2,
  Scheduled: 3,
  Enabled: 4,
  Ramping: 5
}) {
};

// node_modules/aes70/src/OCP1/OcaRamperState.js
var OcaRamperState2 = Enum8(OcaRamperState);

// node_modules/aes70/src/types/OcaWhenPhysicalAbsolute.js
var OcaWhenPhysicalAbsolute = class {
  /**
   * Absolute physical time.
   * @class OcaWhenPhysicalAbsolute
   */
  constructor(TimeRefONo, Value) {
    this.TimeRefONo = TimeRefONo;
    this.Value = Value;
  }
};

// node_modules/aes70/src/OCP1/OcaWhenPhysicalAbsolute.js
var OcaWhenPhysicalAbsolute2 = Struct(
  {
    TimeRefONo: OcaUint32,
    Value: OcaTime2
  },
  OcaWhenPhysicalAbsolute
);

// node_modules/aes70/src/types/OcaWhenPhysicalRelative.js
var OcaWhenPhysicalRelative = class {
  /**
   * Physical time relative to time of method call.
   * @class OcaWhenPhysicalRelative
   */
  constructor(TimeRefONo, Value) {
    this.TimeRefONo = TimeRefONo;
    this.Value = Value;
  }
};

// node_modules/aes70/src/OCP1/OcaWhenPhysicalRelative.js
var OcaWhenPhysicalRelative2 = Struct(
  {
    TimeRefONo: OcaUint32,
    Value: OcaTime2
  },
  OcaWhenPhysicalRelative
);

// node_modules/aes70/src/controller/ControlClasses/OcaRamper.js
var OcaRamper = make_control_class(
  "OcaRamper",
  3,
  "",
  2,
  OcaAgent,
  [
    ["Control", 3, 1, [OcaRamperCommand2], []],
    ["GetState", 3, 2, [], [OcaRamperState2]],
    ["GetRampedProperty", 3, 3, [], [OcaProperty2]],
    ["SetRampedProperty", 3, 4, [OcaProperty2], []],
    ["GetTimeMode", 3, 5, [], [OcaTimeMode2]],
    ["SetTimeMode", 3, 6, [OcaTimeMode2], []],
    ["GetStartTime", 3, 7, [], [OcaUint64]],
    ["SetStartTime", 3, 8, [OcaUint64], []],
    ["GetDuration", 3, 9, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetDuration", 3, 10, [OcaFloat32], []],
    ["GetInterpolationLaw", 3, 11, [], [OcaRamperInterpolationLaw2]],
    ["SetInterpolationLaw", 3, 12, [OcaRamperInterpolationLaw2], []],
    ["GetGoal", 3, 13, [], [OcaFloat64]],
    ["SetGoal", 3, 14, [OcaFloat64], []],
    [
      "GetStartWhen",
      3,
      15,
      [],
      [OcaVariant2(OcaWhenPhysicalAbsolute2, OcaWhenPhysicalRelative2)]
    ],
    [
      "SetStartWhen",
      3,
      16,
      [OcaVariant2(OcaWhenPhysicalAbsolute2, OcaWhenPhysicalRelative2)],
      []
    ]
  ],
  [
    ["State", [OcaRamperState2], 3, 1, false, false, null],
    ["RampedProperty", [OcaProperty2], 3, 2, false, false, null],
    ["TimeMode", [OcaTimeMode2], 3, 3, false, false, null],
    ["StartTime", [OcaUint64], 3, 4, false, false, null],
    ["Duration", [OcaFloat32], 3, 5, false, false, null],
    ["InterpolationLaw", [OcaRamperInterpolationLaw2], 3, 6, false, false, null],
    ["Goal", [OcaFloat64], 3, 7, false, false, null],
    [
      "StartWhen",
      [OcaVariant2(OcaWhenPhysicalAbsolute2, OcaWhenPhysicalRelative2)],
      3,
      8,
      false,
      false,
      null
    ]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaSamplingRateConverter.js
var OcaSamplingRateConverter = make_control_class(
  "OcaSamplingRateConverter",
  4,
  "",
  1,
  OcaActuator,
  [["GetType", 4, 1, [], [OcaSamplingRateConverterType2]]],
  [["Type", [OcaSamplingRateConverterType2], 4, 1, true, false, null]],
  []
);

// node_modules/aes70/src/types/OcaSweepType.js
var OcaSweepType = class extends Enum({
  Linear: 1,
  Logarithmic: 2,
  None: 0
}) {
};

// node_modules/aes70/src/OCP1/OcaSweepType.js
var OcaSweepType2 = Enum8(OcaSweepType);

// node_modules/aes70/src/types/OcaWaveformType.js
var OcaWaveformType = class extends Enum({
  None: 0,
  DC: 1,
  Sine: 2,
  Square: 3,
  Impulse: 4,
  NoisePink: 5,
  NoiseWhite: 6,
  PolarityTest: 7
}) {
};

// node_modules/aes70/src/OCP1/OcaWaveformType.js
var OcaWaveformType2 = Enum8(OcaWaveformType);

// node_modules/aes70/src/controller/ControlClasses/OcaSignalGenerator.js
var OcaSignalGenerator = make_control_class(
  "OcaSignalGenerator",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetFrequency1", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetFrequency1", 4, 2, [OcaFloat32], []],
    ["GetFrequency2", 4, 3, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetFrequency2", 4, 4, [OcaFloat32], []],
    ["GetLevel", 4, 5, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetLevel", 4, 6, [OcaFloat32], []],
    ["GetWaveform", 4, 7, [], [OcaWaveformType2]],
    ["SetWaveform", 4, 8, [OcaWaveformType2], []],
    ["GetSweepType", 4, 9, [], [OcaSweepType2]],
    ["SetSweepType", 4, 10, [OcaSweepType2], []],
    ["GetSweepTime", 4, 11, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetSweepTime", 4, 12, [OcaFloat32], []],
    ["GetSweepRepeat", 4, 13, [], [OcaBoolean]],
    ["SetSweepRepeat", 4, 14, [OcaBoolean], []],
    ["GetGenerating", 4, 15, [], [OcaBoolean]],
    ["Start", 4, 16, [], []],
    ["Stop", 4, 17, [], []],
    [
      "SetMultiple",
      4,
      18,
      [
        OcaParameterMask,
        OcaFloat32,
        OcaFloat32,
        OcaFloat32,
        OcaWaveformType2,
        OcaSweepType2,
        OcaFloat32,
        OcaBoolean
      ],
      []
    ]
  ],
  [
    ["Frequency1", [OcaFloat32], 4, 1, false, false, null],
    ["Frequency2", [OcaFloat32], 4, 2, false, false, null],
    ["Level", [OcaFloat32], 4, 3, false, false, null],
    ["Waveform", [OcaWaveformType2], 4, 4, false, false, null],
    ["SweepType", [OcaSweepType2], 4, 5, false, false, null],
    ["SweepTime", [OcaFloat32], 4, 6, false, false, null],
    ["SweepRepeat", [OcaBoolean], 4, 7, false, false, null],
    ["Generating", [OcaBoolean], 4, 8, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaSignalInput.js
var OcaSignalInput = make_control_class(
  "OcaSignalInput",
  4,
  "",
  3,
  OcaActuator,
  [],
  [],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaSignalOutput.js
var OcaSignalOutput = make_control_class(
  "OcaSignalOutput",
  4,
  "",
  3,
  OcaActuator,
  [],
  [],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaStateSensor.js
var OcaStateSensor = make_control_class(
  "OcaStateSensor",
  4,
  "\f",
  1,
  OcaSensor,
  [
    ["GetState", 4, 1, [], [OcaUint16, OcaUint16, OcaUint16]],
    ["GetStateNames", 4, 2, [], [OcaList(OcaString)]],
    ["SetStateNames", 4, 3, [OcaList(OcaString)], []]
  ],
  [
    ["State", [OcaUint16], 4, 1, false, false, null],
    ["StateNames", [OcaList(OcaString)], 4, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/types/OcaStreamConnectorIdentification.js
var OcaStreamConnectorIdentification = class {
  /**
   * A signal source or sink connector at the far end of a stream - normally, in
   * another device. Not all of the fields of this datatype need be used. The
   * fields used will depend on remote device type, media transport network
   * type, and media transport implementation. Normal usage scenarios are:
   *
   *  - **Unicast input or output**: The **OcaStream** object is instantiated in
   *    an **OcaStreamConnector** object in the local device, and it links to an
   *    **OcaStreamConnector** object in a remote device.
   *
   *  - **Multicast input**: The **OcaStream** object is instantiated in an
   *    **OcaStreamConnector** object in the local device, and, it may or may
   *    not link to an **OcaStreamConnector** object in a remote device.
   *
   *  - **Multicast output**: The **OcaStream** object is instantiated in an
   *    **OcaStreamConnector** object in the local device, but in this case does
   *    not link to any specific remote connector object.
   *
   *
   * @class OcaStreamConnectorIdentification
   */
  constructor(HostID, NetworkAddress, NodeID, StreamConnectorID) {
    this.HostID = HostID;
    this.NetworkAddress = NetworkAddress;
    this.NodeID = NodeID;
    this.StreamConnectorID = StreamConnectorID;
  }
};

// node_modules/aes70/src/OCP1/OcaStreamConnectorIdentification.js
var OcaStreamConnectorIdentification2 = Struct(
  {
    HostID: OcaBlob,
    NetworkAddress: OcaBlob,
    NodeID: OcaBlob,
    StreamConnectorID: OcaBlob
  },
  OcaStreamConnectorIdentification
);

// node_modules/aes70/src/types/OcaStreamStatus.js
var OcaStreamStatus = class extends Enum({
  NotConnected: 0,
  Connected: 1,
  Paused: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaStreamStatus.js
var OcaStreamStatus2 = Enum8(OcaStreamStatus);

// node_modules/aes70/src/types/OcaStreamType.js
var OcaStreamType = class extends Enum({
  None: 0,
  Unicast: 1,
  Multicast: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaStreamType.js
var OcaStreamType2 = Enum8(OcaStreamType);

// node_modules/aes70/src/types/OcaStream.js
var OcaStream = class {
  /**
   * A single-channel or multichannel signal flow between a local stream
   * connector (i.e. **OcaStreamConnector** instance) of an **OcaStreamNetwork**
   * object in this node and another ("remote") stream connector. Normally, the
   * remote stream connector is in another node. Each stream is unidirectional.
   * With respect to the **OcaStreamNetwork** object in question, a stream is
   * either:
   *
   *  - *Outbound: * A signal flow from an output connector port in the
   *    **OcaStreamNetwork** object to an external destination; or
   *
   *  - *Inbound: * A signal flow from an external source to an *input*
   *    connector in the **OcaStreamNetwork** object.
   *
   *
   * An **OcaStream** object may represent either a unicast or a multicast
   * stream. Any given **OcaStreamConnector** object may support multiple
   * outbound flows, but not multiple inbound flows.
   * @class OcaStream
   */
  constructor(ErrorNumber, IDAdvertised, Index, Label, LocalConnectorONo, Priority, RemoteConnectorIdentification, Secure, Status, StreamParameters, StreamType) {
    this.ErrorNumber = ErrorNumber;
    this.IDAdvertised = IDAdvertised;
    this.Index = Index;
    this.Label = Label;
    this.LocalConnectorONo = LocalConnectorONo;
    this.Priority = Priority;
    this.RemoteConnectorIdentification = RemoteConnectorIdentification;
    this.Secure = Secure;
    this.Status = Status;
    this.StreamParameters = StreamParameters;
    this.StreamType = StreamType;
  }
};

// node_modules/aes70/src/OCP1/OcaStream.js
var OcaStream2 = Struct(
  {
    ErrorNumber: OcaUint16,
    IDAdvertised: OcaBlob,
    Index: OcaUint16,
    Label: OcaString,
    LocalConnectorONo: OcaUint32,
    Priority: OcaUint16,
    RemoteConnectorIdentification: OcaStreamConnectorIdentification2,
    Secure: OcaBoolean,
    Status: OcaStreamStatus2,
    StreamParameters: OcaBlob,
    StreamType: OcaStreamType2
  },
  OcaStream
);

// node_modules/aes70/src/types/OcaStreamConnectorStatus.js
var OcaStreamConnectorStatus = class extends Enum({
  NotAvailable: 0,
  Idle: 1,
  Connected: 2,
  Paused: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaStreamConnectorStatus.js
var OcaStreamConnectorStatus2 = Enum8(OcaStreamConnectorStatus);

// node_modules/aes70/src/controller/ControlClasses/OcaStreamConnector.js
var OcaStreamConnector = make_control_class(
  "OcaStreamConnector",
  3,
  "\v",
  3,
  OcaAgent,
  [
    ["GetOwnerNetwork", 3, 1, [], [OcaUint32]],
    ["SetOwnerNetwork", 3, 2, [OcaUint32], []],
    ["GetIDAdvertised", 3, 3, [], [OcaBlob]],
    ["SetIDAdvertised", 3, 4, [OcaBlob], []],
    ["GetSourceOrSink", 3, 5, [], [OcaNetworkMediaSourceOrSink2]],
    ["SetSourceOrSink", 3, 6, [OcaNetworkMediaSourceOrSink2], []],
    ["ConnectStream", 3, 7, [OcaStream2], [OcaUint16]],
    ["DisconnectStream", 3, 8, [OcaUint16], []],
    ["GetStreams", 3, 9, [], [OcaMap(OcaUint16, OcaStream2)]],
    ["GetPins", 3, 10, [], [OcaMap(OcaUint16, OcaUint32)]],
    ["GetStatus", 3, 11, [], [OcaStreamConnectorStatus2]]
  ],
  [
    ["OwnerNetwork", [OcaUint32], 3, 1, false, false, null],
    ["IDAdvertised", [OcaBlob], 3, 2, false, false, null],
    ["SourceOrSink", [OcaNetworkMediaSourceOrSink2], 3, 3, false, false, null],
    ["Streams", [OcaMap(OcaUint16, OcaStream2)], 3, 4, false, false, null],
    ["Pins", [OcaMap(OcaUint16, OcaUint32)], 3, 5, false, false, null],
    ["Status", [OcaStreamConnectorStatus2], 3, 6, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaStreamNetwork.js
var OcaStreamNetwork = make_control_class(
  "OcaStreamNetwork",
  3,
  "\n",
  3,
  OcaAgent,
  [
    ["GetLinkType", 3, 1, [], [OcaNetworkLinkType2]],
    ["GetIDAdvertised", 3, 2, [], [OcaBlob]],
    ["SetIDAdvertised", 3, 3, [OcaBlob], []],
    ["GetControlProtocol", 3, 4, [], [OcaNetworkControlProtocol2]],
    ["GetMediaProtocol", 3, 5, [], [OcaNetworkMediaProtocol2]],
    ["GetStatus", 3, 6, [], [OcaNetworkStatus2]],
    ["GetStatistics", 3, 7, [], [OcaNetworkStatistics2]],
    ["ResetStatistics", 3, 8, [], []],
    ["GetSystemInterfaces", 3, 9, [], [OcaList(OcaNetworkSystemInterfaceID2)]],
    ["SetSystemInterfaces", 3, 10, [OcaList(OcaNetworkSystemInterfaceID2)], []],
    ["GetStreamConnectorsSource", 3, 11, [], [OcaList(OcaUint32)]],
    ["SetStreamConnectorsSource", 3, 12, [OcaList(OcaUint32)], []],
    ["GetStreamConnectorsSink", 3, 13, [], [OcaList(OcaUint32)]],
    ["SetStreamConnectorsSink", 3, 14, [OcaList(OcaUint32)], []],
    ["GetSignalChannelsSource", 3, 15, [], [OcaList(OcaUint32)]],
    ["SetSignalChannelsSource", 3, 16, [OcaList(OcaUint32)], []],
    ["GetSignalChannelsSink", 3, 17, [], [OcaList(OcaUint32)]],
    ["SetSignalChannelsSink", 3, 18, [OcaList(OcaUint32)], []],
    ["Startup", 3, 19, [], []],
    ["Shutdown", 3, 20, [], []]
  ],
  [
    ["LinkType", [OcaNetworkLinkType2], 3, 1, true, false, null],
    ["IDAdvertised", [OcaBlob], 3, 2, false, false, null],
    ["ControlProtocol", [OcaNetworkControlProtocol2], 3, 3, false, false, null],
    ["MediaProtocol", [OcaNetworkMediaProtocol2], 3, 4, false, false, null],
    ["Status", [OcaNetworkStatus2], 3, 5, false, false, null],
    [
      "SystemInterfaces",
      [OcaList(OcaNetworkSystemInterfaceID2)],
      3,
      6,
      false,
      false,
      null
    ],
    ["StreamConnectorsSource", [OcaList(OcaUint32)], 3, 7, false, false, null],
    ["StreamConnectorsSink", [OcaList(OcaUint32)], 3, 8, false, false, null],
    ["SignalChannelsSource", [OcaList(OcaUint32)], 3, 9, false, false, null],
    ["SignalChannelsSink", [OcaList(OcaUint32)], 3, 10, false, false, null],
    ["Statistics", [OcaNetworkStatistics2], 3, 11, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaStringActuator.js
var OcaStringActuator = make_control_class(
  "OcaStringActuator",
  5,
  "\f",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaString]],
    ["SetSetting", 5, 2, [OcaString], []],
    ["GetMaxLen", 5, 3, [], [OcaUint16]]
  ],
  [
    ["Setting", [OcaString], 5, 1, false, false, null],
    ["MaxLen", [OcaUint16], 5, 2, true, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaStringSensor.js
var OcaStringSensor = make_control_class(
  "OcaStringSensor",
  5,
  "\f",
  3,
  OcaBasicSensor,
  [
    ["GetReading", 5, 1, [], [OcaString], ["GetString"]],
    ["GetMaxLen", 5, 2, [], [OcaUint16]],
    ["SetMaxLen", 5, 3, [OcaUint16], []]
  ],
  [
    ["Reading", [OcaString], 5, 1, false, false, ["String"]],
    ["MaxLen", [OcaUint16], 5, 2, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaSummingPoint.js
var OcaSummingPoint = make_control_class(
  "OcaSummingPoint",
  4,
  "",
  3,
  OcaActuator,
  [],
  [],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaSwitch.js
var OcaSwitch = make_control_class(
  "OcaSwitch",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetPosition", 4, 1, [], [OcaUint16, OcaUint16, OcaUint16]],
    ["SetPosition", 4, 2, [OcaUint16], []],
    ["GetPositionName", 4, 3, [OcaUint16], [OcaString]],
    ["SetPositionName", 4, 4, [OcaUint16, OcaString], []],
    ["GetPositionNames", 4, 5, [], [OcaList(OcaString)]],
    ["SetPositionNames", 4, 6, [OcaList(OcaString)], []],
    [
      "GetPositionEnableFlag",
      4,
      7,
      [OcaUint16],
      [OcaBoolean],
      ["GetPositionEnabled"]
    ],
    [
      "SetPositionEnableFlag",
      4,
      8,
      [OcaUint16, OcaBoolean],
      [],
      ["SetPositionEnabled"]
    ],
    [
      "GetPositionEnableFlags",
      4,
      9,
      [],
      [OcaList(OcaBoolean)],
      ["GetPositionEnableds"]
    ],
    [
      "SetPositionEnableFlags",
      4,
      10,
      [OcaList(OcaBoolean)],
      [],
      ["SetPositionEnableds"]
    ]
  ],
  [
    ["Position", [OcaUint16], 4, 1, false, false, null],
    ["PositionNames", [OcaList(OcaString)], 4, 2, false, false, null],
    [
      "PositionEnableFlags",
      [OcaList(OcaBoolean)],
      4,
      3,
      false,
      false,
      ["PositionEnable", "PositionEnableds"]
    ]
  ],
  []
);

// node_modules/aes70/src/types/OcaGenericEndState.js
var OcaGenericEndState = class extends Enum({
  CompletedNormally: 1,
  CompletedAbnormally: 2,
  Interrupted: 3,
  Failed: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaGenericEndState.js
var OcaGenericEndState2 = Enum8(OcaGenericEndState);

// node_modules/aes70/src/types/OcaCommandSetResult.js
var OcaCommandSetResult = class {
  /**
   * Execution result of a Commandset
   * @class OcaCommandSetResult
   */
  constructor(EndState, CommandResults) {
    this.EndState = EndState;
    this.CommandResults = CommandResults;
  }
};

// node_modules/aes70/src/OCP1/OcaCommandSetResult.js
var OcaCommandSetResult2 = Struct(
  {
    EndState: OcaGenericEndState2,
    CommandResults: OcaList(OcaCommandResult2)
  },
  OcaCommandSetResult
);

// node_modules/aes70/src/types/OcaExecutableType.js
var OcaExecutableType = class extends Enum({
  Undefined: 0,
  Program: 1,
  Commandset: 2
}) {
};

// node_modules/aes70/src/OCP1/OcaExecutableType.js
var OcaExecutableType2 = Enum8(OcaExecutableType);

// node_modules/aes70/src/types/OcaTypedBlob.js
var OcaTypedBlob = class {
  /**
   * **OcaBlob** with ancillary field that shall specify the MIME type of the
   * **OcaBlob's** content.
   * @class OcaTypedBlob
   */
  constructor(ContentType, Content) {
    this.ContentType = ContentType;
    this.Content = Content;
  }
};

// node_modules/aes70/src/OCP1/OcaTypedBlob.js
var OcaTypedBlob2 = Struct(
  {
    ContentType: OcaString,
    Content: OcaBlob
  },
  OcaTypedBlob
);

// node_modules/aes70/src/types/OcaProgramResult.js
var OcaProgramResult = class {
  /**
   * Execution result of a Program.
   * @class OcaProgramResult
   */
  constructor(EndState, Data) {
    this.EndState = EndState;
    this.Data = Data;
  }
};

// node_modules/aes70/src/OCP1/OcaProgramResult.js
var OcaProgramResult2 = Struct(
  {
    EndState: OcaGenericEndState2,
    Data: OcaList(OcaTypedBlob2)
  },
  OcaProgramResult
);

// node_modules/aes70/src/types/OcaTaskExecutionTerminatedEventData.js
var OcaTaskExecutionTerminatedEventData = class {
  /**
   * Notification data emitted by the **OcaTaskAgent.TaskChanged** event upon
   * successful or unsuccessful termination of an Executable the task agent has
   * been running.
   * @class OcaTaskExecutionTerminatedEventData
   */
  constructor(ExecutableType, ExecutableONo, Result) {
    this.ExecutableType = ExecutableType;
    this.ExecutableONo = ExecutableONo;
    this.Result = Result;
  }
};

// node_modules/aes70/src/OCP1/OcaTaskExecutionTerminatedEventData.js
var OcaTaskExecutionTerminatedEventData2 = Struct(
  {
    ExecutableType: OcaExecutableType2,
    ExecutableONo: OcaUint32,
    Result: OcaVariant2(OcaProgramResult2, OcaCommandSetResult2)
  },
  OcaTaskExecutionTerminatedEventData
);

// node_modules/aes70/src/types/OcaTaskGenericState.js
var OcaTaskGenericState = class extends Enum({
  None: 0,
  Idle: 1,
  Ready: 2,
  Running: 3,
  Ended: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaTaskGenericState.js
var OcaTaskGenericState2 = Enum8(OcaTaskGenericState);

// node_modules/aes70/src/types/OcaTaskOperationalState.js
var OcaTaskOperationalState = class {
  /**
   * Operational state of task: generic state + task-specific details
   * @class OcaTaskOperationalState
   */
  constructor(Generic, Details) {
    this.Generic = Generic;
    this.Details = Details;
  }
};

// node_modules/aes70/src/OCP1/OcaTaskOperationalState.js
var OcaTaskOperationalState2 = Struct(
  {
    Generic: OcaTaskGenericState2,
    Details: OcaList(OcaTypedBlob2)
  },
  OcaTaskOperationalState
);

// node_modules/aes70/src/controller/ControlClasses/OcaTaskAgent.js
var OcaTaskAgent = make_control_class(
  "OcaTaskAgent",
  3,
  "\f",
  1,
  OcaAgent,
  [
    ["ActionPrepare", 3, 1, [OcaUint32, OcaBlob, OcaProgramRunMode], []],
    ["ActionRun", 3, 2, [OcaUint32, OcaBlob, OcaProgramRunMode], []],
    ["ActionStart", 3, 3, [], []],
    ["ActionStop", 3, 4, [], []],
    ["ActionReset", 3, 5, [], []],
    ["ActionClear", 3, 6, [], []],
    ["GetBlocked", 3, 7, [], [OcaBoolean]],
    ["SetBlocked", 3, 8, [OcaBoolean], []],
    ["GetOperationalState", 3, 9, [], [OcaTaskOperationalState2]],
    ["GetExecutableONo", 3, 10, [], [OcaUint32]],
    ["GetExecutionParameters", 3, 11, [], [OcaBlob]],
    ["GetRunMode", 3, 12, [], [OcaProgramRunMode]]
  ],
  [
    ["ExecutableONo", [OcaUint32], 3, 1, false, false, null],
    ["GroupID", [OcaUint16], 3, 2, false, false, null],
    ["ExecutionParameters", [OcaBlob], 3, 3, false, false, null],
    ["RunMode", [OcaProgramRunMode], 3, 4, false, false, null],
    ["Blocked", [OcaBoolean], 3, 5, false, false, null],
    ["OperationalState", [OcaTaskOperationalState2], 3, 6, false, false, null]
  ],
  [["ExecutionTerminated", 3, 1, [OcaTaskExecutionTerminatedEventData2]]]
);

// node_modules/aes70/src/types/OcaJobDisposition.js
var OcaJobDisposition = class extends Enum({
  RunStarted: 1,
  ItemDeleted: 2,
  FailedToStart_TaskNotAvailable: 3,
  FailedToStart_TaskNotCompatible: 4,
  FailedToStart_ResourceUnavailable: 5,
  FailedToStart_DeviceError: 6
}) {
};

// node_modules/aes70/src/OCP1/OcaJobDisposition.js
var OcaJobDisposition2 = Enum8(OcaJobDisposition);

// node_modules/aes70/src/types/OcaJobQueueItem.js
var OcaJobQueueItem = class {
  /**
   * An item of the Job Queue in **OcaTaskAgentManager**.
   * @class OcaJobQueueItem
   */
  constructor(ID, ProgramONo, RunMode, RunParameters, RunWhen, RunWhere) {
    this.ID = ID;
    this.ProgramONo = ProgramONo;
    this.RunMode = RunMode;
    this.RunParameters = RunParameters;
    this.RunWhen = RunWhen;
    this.RunWhere = RunWhere;
  }
};

// node_modules/aes70/src/OCP1/OcaJobQueueItem.js
var OcaJobQueueItem2 = Struct(
  {
    ID: OcaUint32,
    ProgramONo: OcaUint32,
    RunMode: OcaProgramRunMode,
    RunParameters: OcaBlob,
    RunWhen: OcaVariant2(OcaWhenPhysicalAbsolute2, OcaWhenPhysicalRelative2),
    RunWhere: OcaUint32
  },
  OcaJobQueueItem
);

// node_modules/aes70/src/types/OcaJobDisposedEventData.js
var OcaJobDisposedEventData = class {
  /**
   * Notification data emitted by the **OcaTaskScheduler.RunQueueItemDisposed**
   * event.
   * @class OcaJobDisposedEventData
   */
  constructor(QueueItem, Disposition, DispositionDetails) {
    this.QueueItem = QueueItem;
    this.Disposition = Disposition;
    this.DispositionDetails = DispositionDetails;
  }
};

// node_modules/aes70/src/OCP1/OcaJobDisposedEventData.js
var OcaJobDisposedEventData2 = Struct(
  {
    QueueItem: OcaJobQueueItem2,
    Disposition: OcaJobDisposition2,
    DispositionDetails: OcaBlob
  },
  OcaJobDisposedEventData
);

// node_modules/aes70/src/types/OcaTaskSchedulerState.js
var OcaTaskSchedulerState = class extends Enum({
  Unknown: 0,
  Running: 1,
  Paused: 2,
  Draining: 3,
  Stopped: 4
}) {
};

// node_modules/aes70/src/OCP1/OcaTaskSchedulerState.js
var OcaTaskSchedulerState2 = Enum8(OcaTaskSchedulerState);

// node_modules/aes70/src/controller/ControlClasses/OcaTaskScheduler.js
var OcaTaskScheduler = make_control_class(
  "OcaTaskScheduler",
  3,
  "\r",
  1,
  OcaAgent,
  [
    ["ActionStart", 3, 1, [], []],
    ["ActionStop", 3, 2, [], []],
    ["ActionPause", 3, 3, [], []],
    ["ActionDrain", 3, 4, [], []],
    ["GetState", 3, 5, [], [OcaTaskSchedulerState2]],
    ["GetTaskAgents", 3, 6, [], [OcaList(OcaUint32)]],
    ["GetJobQueue", 3, 7, [], [OcaList(OcaJobQueueItem2)]],
    ["GetJob", 3, 8, [OcaUint32], [OcaJobQueueItem2]],
    ["SetJob", 3, 9, [OcaUint32, OcaJobQueueItem2], []],
    ["AddJob", 3, 10, [OcaJobQueueItem2], [OcaUint32]],
    ["DeleteJob", 3, 11, [OcaUint32], []],
    ["ClearJobQueue", 3, 12, [], []]
  ],
  [
    ["State", [OcaTaskSchedulerState2], 3, 1, false, false, null],
    ["TaskAgents", [OcaList(OcaUint32)], 3, 2, false, false, null],
    ["JobQueue", [OcaList(OcaJobQueueItem2)], 3, 3, false, false, null]
  ],
  [["JobDisposed", 3, 1, [OcaJobDisposedEventData2]]]
);

// node_modules/aes70/src/controller/ControlClasses/OcaTemperatureActuator.js
var OcaTemperatureActuator = make_control_class(
  "OcaTemperatureActuator",
  4,
  "",
  3,
  OcaActuator,
  [
    ["GetTemperature", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
    ["SetTemperature", 4, 2, [OcaFloat32], []]
  ],
  [["Temperature", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaTemperatureSensor.js
var OcaTemperatureSensor = make_control_class(
  "OcaTemperatureSensor",
  4,
  "",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaTimeIntervalSensor.js
var OcaTimeIntervalSensor = make_control_class(
  "OcaTimeIntervalSensor",
  4,
  "",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaTimeDeliveryMechanism.js
var OcaTimeDeliveryMechanism = class extends Enum({
  Undefined: 0,
  Local: 1,
  Private: 2,
  NTP: 3,
  SNTP: 4,
  IEEE1588_2002: 5,
  IEEE1588_2008: 6,
  IEEE1588_2019: 7,
  IEEE8021AS: 8,
  StreamEndpoint: 9,
  AES11: 11,
  TerrestrialRadio: 12,
  GPS: 13,
  Galileo: 14,
  GLONASS: 15,
  Beidou: 16,
  INRSS: 17,
  ExpansionBase: 128,
  None: 1,
  IEEE1588v1: 5,
  IEEE1588v2: 6,
  IEEE1588v2_1: 7
}) {
};

// node_modules/aes70/src/OCP1/OcaTimeDeliveryMechanism.js
var OcaTimeDeliveryMechanism2 = Enum8(OcaTimeDeliveryMechanism);

// node_modules/aes70/src/types/OcaTimeSourceAvailability.js
var OcaTimeSourceAvailability = class extends Enum({
  Unavailable: 0,
  Available: 1
}) {
};

// node_modules/aes70/src/OCP1/OcaTimeSourceAvailability.js
var OcaTimeSourceAvailability2 = Enum8(OcaTimeSourceAvailability);

// node_modules/aes70/src/types/OcaTimeSourceSyncStatus.js
var OcaTimeSourceSyncStatus = class extends Enum({
  Undefined: 0,
  Unsynchronized: 1,
  Synchronizing: 2,
  Synchronized: 3
}) {
};

// node_modules/aes70/src/OCP1/OcaTimeSourceSyncStatus.js
var OcaTimeSourceSyncStatus2 = Enum8(OcaTimeSourceSyncStatus);

// node_modules/aes70/src/controller/ControlClasses/OcaTimeSource.js
var OcaTimeSource = make_control_class(
  "OcaTimeSource",
  3,
  "",
  3,
  OcaAgent,
  [
    ["GetAvailability", 3, 1, [], [OcaTimeSourceAvailability2]],
    [
      "GetTimeDeliveryMechanism",
      3,
      2,
      [],
      [OcaTimeDeliveryMechanism2],
      ["GetProtocol"]
    ],
    [
      "SetTimeDeliveryMechanism",
      3,
      3,
      [OcaTimeDeliveryMechanism2],
      [],
      ["SetProtocol"]
    ],
    ["GetReferenceSDPDescription", 3, 4, [], [OcaString], ["GetParameters"]],
    ["SetReferenceSDPDescription", 3, 5, [OcaString], [], ["SetParameters"]],
    ["GetReferenceType", 3, 6, [], [OcaTimeReferenceType2]],
    ["SetReferenceType", 3, 7, [OcaTimeReferenceType2], []],
    ["GetReferenceID", 3, 8, [], [OcaString]],
    ["SetReferenceID", 3, 9, [OcaString], []],
    ["GetSyncStatus", 3, 10, [], [OcaTimeSourceSyncStatus2]],
    ["Reset", 3, 11, [], []],
    ["GetTimeDeliveryParameters", 3, 12, [], [OcaString]],
    ["SetTimeDeliveryParameters", 3, 13, [OcaString], []]
  ],
  [
    ["Availability", [OcaTimeSourceAvailability2], 3, 1, false, false, null],
    [
      "TimeDeliveryMechanism",
      [OcaTimeDeliveryMechanism2],
      3,
      2,
      false,
      false,
      ["Protocol"]
    ],
    [
      "ReferenceSDPDescription",
      [OcaString],
      3,
      3,
      false,
      false,
      ["Parameters"]
    ],
    ["ReferenceType", [OcaTimeReferenceType2], 3, 4, false, false, null],
    ["ReferenceID", [OcaString], 3, 5, false, false, null],
    ["SyncStatus", [OcaTimeSourceSyncStatus2], 3, 6, false, false, null],
    ["TimeDeliveryParameters", [OcaString], 3, 7, false, false, null]
  ],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint16Actuator.js
var OcaUint16Actuator = make_control_class(
  "OcaUint16Actuator",
  5,
  "\x07",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaUint16, OcaUint16, OcaUint16]],
    ["SetSetting", 5, 2, [OcaUint16], []]
  ],
  [["Setting", [OcaUint16], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint16Sensor.js
var OcaUint16Sensor = make_control_class(
  "OcaUint16Sensor",
  5,
  "\x07",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaUint16, OcaUint16, OcaUint16]]],
  [["Reading", [OcaUint16], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint32Actuator.js
var OcaUint32Actuator = make_control_class(
  "OcaUint32Actuator",
  5,
  "\b",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaUint32, OcaUint32, OcaUint32]],
    ["SetSetting", 5, 2, [OcaUint32], []]
  ],
  [["Setting", [OcaUint32], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint32Sensor.js
var OcaUint32Sensor = make_control_class(
  "OcaUint32Sensor",
  5,
  "\b",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaUint32, OcaUint32, OcaUint32]]],
  [["Reading", [OcaUint32], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint64Actuator.js
var OcaUint64Actuator = make_control_class(
  "OcaUint64Actuator",
  5,
  "	",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaUint64, OcaUint64, OcaUint64]],
    ["SetSetting", 5, 2, [OcaUint64], []]
  ],
  [["Setting", [OcaUint64], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint64Sensor.js
var OcaUint64Sensor = make_control_class(
  "OcaUint64Sensor",
  5,
  "	",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaUint64, OcaUint64, OcaUint64]]],
  [["Reading", [OcaUint64], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint8Actuator.js
var OcaUint8Actuator = make_control_class(
  "OcaUint8Actuator",
  5,
  "",
  3,
  OcaBasicActuator,
  [
    ["GetSetting", 5, 1, [], [OcaUint8, OcaUint8, OcaUint8]],
    ["SetSetting", 5, 2, [OcaUint8], []]
  ],
  [["Setting", [OcaUint8], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaUint8Sensor.js
var OcaUint8Sensor = make_control_class(
  "OcaUint8Sensor",
  5,
  "",
  3,
  OcaBasicSensor,
  [["GetReading", 5, 1, [], [OcaUint8, OcaUint8, OcaUint8]]],
  [["Reading", [OcaUint8], 5, 1, false, false, null]],
  []
);

// node_modules/aes70/src/controller/ControlClasses/OcaVoltageSensor.js
var OcaVoltageSensor = make_control_class(
  "OcaVoltageSensor",
  4,
  "\x07",
  3,
  OcaSensor,
  [["GetReading", 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]]],
  [["Reading", [OcaFloat32], 4, 1, false, false, null]],
  []
);

// node_modules/aes70/src/types/OcaManagerDefaultObjectNumbers.js
var OcaManagerDefaultObjectNumbers = {
  /**
   * Object number of the :class:`OcaDeviceManager`.
   * @type {number}
   * @member DeviceManager
   * @static
   */
  DeviceManager: 1,
  /**
   * Object number of the :class:`OcaSecurityManager`.
   * @type {number}
   * @member SecurityManager
   * @static
   */
  SecurityManager: 2,
  /**
   * Object number of the :class:`OcaFirmwareManager`.
   * @type {number}
   * @member FirmwareManager
   * @static
   */
  FirmwareManager: 3,
  /**
   * Object number of the :class:`OcaSubscriptionManager`.
   * @type {number}
   * @member SubscriptionManager
   * @static
   */
  SubscriptionManager: 4,
  /**
   * Object number of the :class:`OcaPowerManager`.
   * @type {number}
   * @member PowerManager
   * @static
   */
  PowerManager: 5,
  /**
   * Object number of the :class:`OcaNetworkManager`.
   * @type {number}
   * @member NetworkManager
   * @static
   */
  NetworkManager: 6,
  /**
   * Object number of the :class:`OcaMediaClockManager`.
   * @type {number}
   * @member MediaClockManager
   * @static
   */
  MediaClockManager: 7,
  /**
   * Object number of the :class:`OcaLibraryManager`.
   * @type {number}
   * @member LibraryManager
   * @static
   */
  LibraryManager: 8,
  /**
   * Object number of the :class:`OcaAudioProcessingManager`.
   * @type {number}
   * @member AudioProcessingManager
   * @static
   */
  AudioProcessingManager: 9,
  /**
   * Object number of the :class:`OcaDeviceTimeManager`.
   * @type {number}
   * @member DeviceTimeManager
   * @static
   */
  DeviceTimeManager: 10,
  /**
   * Object number of the :class:`OcaTaskManager`.
   * @type {number}
   * @member TaskManager
   * @static
   */
  TaskManager: 11,
  /**
   * Object number of the :class:`OcaCodingManager`.
   * @type {number}
   * @member CodingManager
   * @static
   */
  CodingManager: 12,
  /**
   * Object number of the :class:`OcaDiagnosticManager`.
   * @type {number}
   * @member DiagnosticManager
   * @static
   */
  DiagnosticManager: 13,
  /**
   * Object number of the :class:`OcaLockManager`.
   * @type {number}
   * @member LockManager
   * @static
   */
  LockManager: 14
};

// node_modules/aes70/src/controller/remote_device.js
var emptyUint8Array = new Uint8Array(0);
function eventToKey2(event) {
  const ono = event.EmitterONo;
  const id = event.EventID;
  return [ono, id.DefLevel, id.EventIndex].join(",");
}
var subscriberMethod = {
  ONo: 1055,
  MethodID: {
    DefLevel: 1,
    MethodIndex: 1
  }
};
var EventSubscription = class {
  constructor(event, cb) {
    this.event = event;
    this.callbacks = [];
    this.cb = cb;
    this.subscribing = null;
    this.version = 0;
  }
  add_callback(cb) {
    this.callbacks.push(cb);
  }
  delete_callback(cb) {
    this.callbacks = this.callbacks.filter((entry) => entry !== cb);
  }
  emit(ok, notification) {
    this.callbacks.forEach((cb) => {
      try {
        cb(ok, notification);
      } catch (error2) {
        console.log("Event handler threw an exception", error2);
      }
    });
  }
  emit_error(error2) {
    this.emit(false, error2);
  }
  has_subscribers() {
    return this.callbacks.length !== 0;
  }
};
var RemoteDevice = class extends Events {
  constructor(connection, ...modules) {
    super();
    this.objects = /* @__PURE__ */ new Map();
    this.connection = connection;
    this._stackDebug = false;
    this._supportsEV2 = void 0;
    this._checkEV2Promise = void 0;
    connection.on("error", (e) => {
      this.emit("error", e);
    });
    connection.on("close", () => {
      this.emit("close");
    });
    this.modules = [];
    this.add_control_classes(Object.values(ControlClasses_exports));
    modules.map((m) => this.add_control_classes(m));
    this.DeviceManager = new OcaDeviceManager(
      OcaManagerDefaultObjectNumbers.DeviceManager,
      this
    );
    this.SecurityManager = new OcaSecurityManager(
      OcaManagerDefaultObjectNumbers.SecurityManager,
      this
    );
    this.FirmwareManager = new OcaFirmwareManager(
      OcaManagerDefaultObjectNumbers.FirmwareManager,
      this
    );
    this.SubscriptionManager = new OcaSubscriptionManager(
      OcaManagerDefaultObjectNumbers.SubscriptionManager,
      this
    );
    this.PowerManager = new OcaPowerManager(
      OcaManagerDefaultObjectNumbers.PowerManager,
      this
    );
    this.NetworkManager = new OcaNetworkManager(
      OcaManagerDefaultObjectNumbers.NetworkManager,
      this
    );
    this.MediaClockManager = new OcaMediaClockManager(
      OcaManagerDefaultObjectNumbers.MediaClockManager,
      this
    );
    this.LibraryManager = new OcaLibraryManager(
      OcaManagerDefaultObjectNumbers.LibraryManager,
      this
    );
    this.AudioProcessingManager = new OcaAudioProcessingManager(
      OcaManagerDefaultObjectNumbers.AudioProcessingManager,
      this
    );
    this.DeviceTimeManager = new OcaDeviceTimeManager(
      OcaManagerDefaultObjectNumbers.DeviceTimeManager,
      this
    );
    this.TaskManager = new OcaTaskManager(
      OcaManagerDefaultObjectNumbers.TaskManager,
      this
    );
    this.CodingManager = new OcaCodingManager(
      OcaManagerDefaultObjectNumbers.CodingManager,
      this
    );
    this.DiagnosticManager = new OcaDiagnosticManager(
      OcaManagerDefaultObjectNumbers.DiagnosticManager,
      this
    );
    this.Root = new OcaBlock(100, this);
    this.subscriptions = /* @__PURE__ */ new Map();
  }
  /**
   * Close the associated connection.
   */
  close() {
    this.connection.close();
  }
  send_command(cmd, returnType, callback, name) {
    const stack = this._stackDebug ? new Error().stack : null;
    return this.connection.send_command(cmd, returnType, callback, stack, name);
  }
  async _doSubscribe(event) {
    const { _checkEV2Promise } = this;
    if (_checkEV2Promise) await _checkEV2Promise;
    const { _supportsEV2, SubscriptionManager } = this;
    if (_supportsEV2 === void 0 || _supportsEV2) {
      const p = SubscriptionManager.AddSubscription2(
        event,
        OcaNotificationDeliveryMode.Normal,
        emptyUint8Array
      );
      try {
        if (_supportsEV2 === void 0) {
          this._checkEV2Promise = p.catch((err) => {
          });
        }
        await p;
        if (_supportsEV2 === void 0) {
          this._supportsEV2 = true;
        }
        return 2;
      } catch (err) {
        if (!(err instanceof RemoteError)) {
          throw err;
        }
        this._supportsEV2 = false;
      } finally {
        if (_supportsEV2 === void 0) {
          this._checkEV2Promise = void 0;
        }
      }
    }
    await SubscriptionManager.AddSubscription(
      event,
      subscriberMethod,
      emptyUint8Array,
      OcaNotificationDeliveryMode.Normal,
      emptyUint8Array
    );
    return 1;
  }
  _doUnsubscribe(info, event) {
    if (info.version === 2) {
      return this.SubscriptionManager.RemoveSubscription2(
        event,
        OcaNotificationDeliveryMode.Normal,
        emptyUint8Array
      );
    } else if (info.version === 1) {
      return this.SubscriptionManager.RemoveSubscription(
        event,
        subscriberMethod
      );
    } else {
    }
  }
  add_subscription(event, callback) {
    if (this.connection.is_closed()) throw new Error("Connection was closed.");
    const key = eventToKey2(event);
    const subscriptions = this.subscriptions;
    let info = subscriptions.get(key);
    if (info) {
      info.add_callback(callback);
      return;
    }
    const dropSubscribers = () => {
      this.subscriptions.delete(key);
      this.connection._removeSubscriber(event);
    };
    const cb = (ok, notification) => {
      const S = this.subscriptions.get(key);
      if (!S) {
        warn("Subscription lost.");
        return;
      }
      S.emit(ok, notification);
      if (!ok || notification.exception) {
        dropSubscribers();
      } else if (S.version > 0 && !S.has_subscribers()) {
        dropSubscribers();
        this._doUnsubscribe(S, event).catch((error2) => {
          if (error2.name === "aes70.CloseError") return;
          console.error("Unsubscribe failed: %o", error2);
        });
      }
    };
    this.connection._addSubscriber(event, cb);
    info = new EventSubscription(event, cb);
    info.add_callback(callback);
    subscriptions.set(key, info);
    const p = this._doSubscribe(event);
    p.then(
      (version) => {
        info.version = version;
      },
      (error2) => {
        info.emit_error(error2);
        dropSubscribers();
      }
    );
  }
  remove_subscription(event, callback) {
    const key = eventToKey2(event);
    const info = this.subscriptions.get(key);
    if (!info) return Promise.reject("Callback not registered.");
    info.delete_callback(callback);
  }
  find_best_class(id) {
    if (typeof id === "object" && id.ClassID) id = id.ClassID;
    while (id.length) {
      const result = this.find_class_by_id(id);
      if (result) return result;
      id = id.substr(0, id.length - 1);
    }
    return null;
  }
  /**
   * Add a set of control classes. When communicating with a device the
   * objects created for remote control objects will be picked from the
   * ones added. The standard control classes are always added by
   * default.
   *
   * @param {Object|Array} module - The set of classes to add. Either an
   *    object contains the control classes with the classid as key, or
   *    an array of control classes.
   */
  add_control_classes(module2) {
    if (Array.isArray(module2)) {
      const m = {};
      for (let i = 0; i < module2.length; i++) {
        const o = module2[i];
        m[o.ClassID] = o;
      }
      module2 = m;
    } else if (typeof module2 !== "object") {
      throw new Error("Unsupported module.");
    }
    this.modules.push(module2);
  }
  find_class_by_id(id) {
    if (typeof id === "object" && id.ClassID) id = id.ClassID;
    const modules = this.modules;
    for (let i = modules.length - 1; i >= 0; i--) {
      const ret = modules[i][id];
      if (ret) return ret;
    }
    return null;
  }
  allocate(c, ono) {
    if (typeof ono === "object") ono = ono.valueOf();
    const objects = this.objects;
    if (!objects.has(ono)) {
      objects.set(ono, new c(ono, this));
    }
    return objects.get(ono);
  }
  resolve_object(o) {
    if ("MemberObjectIdentification" in o)
      return this.resolve_object(o.MemberObjectIdentification);
    if ("ONo" in o && "ClassIdentification" in o) {
      const ono = o.ONo;
      const id = o.ClassIdentification;
      return this.allocate(this.find_best_class(id), ono);
    }
    throw new TypeError("Expected OcaObjectIdentification or OcaBlockMember");
  }
  GetDeviceTree() {
    const get_members = (block) => {
      return block.GetMembers().then((a) => {
        const ret = [];
        a = a.map(this.resolve_object, this);
        for (let i = 0; i < a.length; i++) {
          ret.push(Promise.resolve(a[i]));
          if (a[i].ClassID.startsWith(OcaBlock.ClassID)) {
            ret.push(get_members(a[i]));
          }
        }
        return Promise.all(ret);
      });
    };
    return get_members(this.Root);
  }
  /**
   * Discovers the device object tree. This are all objects starting at the Root
   * block.
   *
   * @returns {Promise} The object tree. A recursive tree structure consisting of arrays of objects.
   *                    Each block is followed by an array of it's children.
   */
  get_device_tree() {
    return this.GetDeviceTree();
  }
  /**
   * Returns a map of role paths to objects. This is a convenience function
   * which internally calls get_device_tree and then tree_to_rolemap.
   * If more than one object has the same role name on the same tree level,
   * their role names will be appended with numbers starting at 1.
   *
   * @param {String} [separator='/'] Optional argument used as a separator
   *                                 for levels in the tree.
   * @returns {Promise<Map<string, Object>>} The map of role paths to control
   *                                        objects.
   */
  get_role_map(separator) {
    return this.get_device_tree().then(function(tree) {
      return tree_to_rolemap_default(tree, separator);
    });
  }
  discover_all_fallback() {
    return this.GetDeviceTree().then((tree) => {
      const ret = [];
      const it = function(a) {
        for (let i = 0; i < a.length; i++) {
          if (Array.isArray(a[i])) {
            it(a[i]);
          } else {
            ret.push(a[i]);
          }
        }
      };
      it(tree);
      return ret;
    });
  }
  /**
   * Discovers the complete object tree of this device starting
   * from the root block. The root block itself will not be part
   * of the resulting list.
   *
   * @deprecated Use :func:`get_device_tree` instead.
   * @returns {Promise} The object list.
   */
  discover_all() {
    return this.Root.GetMembersRecursive().then((res) => res.map(this.resolve_object, this)).catch(() => this.discover_all_fallback());
  }
  /**
   * Set the keepalive interval.
   * @param {number} seconds - Keepalive interval in seconds.
   */
  set_keepalive_interval(seconds) {
    this.connection.set_keepalive_interval(seconds);
  }
  /**
   * Enable or disable stack debug.
   *
   */
  enable_stack_debug(enable) {
    this._stackDebug = !!enable;
  }
};

// node_modules/aes70/src/controller/tcp_connection.js
var import_net = require("net");
var import_buffer = require("buffer");
var import_perf_hooks = require("perf_hooks");
var TCPConnection = class extends ClientConnection {
  constructor(socket, options) {
    super(options);
    this.socket = socket;
    socket.on("data", (data) => {
      this.read(data.buffer);
    });
    socket.on("error", (e) => {
      this.emit("error", e);
    });
    socket.on("close", () => {
      this.emit("close");
    });
  }
  cleanup() {
    super.cleanup();
    try {
      this.socket.destroy();
    } catch (_e) {
    }
  }
  /**
   * Connect to the given endpoint.
   * @param {net.NetConnectOpts} options
   * @param {String} options.host
   *    Hostname or ip address.
   * @param {number} options.port
   *    Port number.
   * @param {AbortSignal} [options.connectSignal]
   *    An optional AbortSignal which can be used to abort the connect attempt.
   *    Note that this is different from the `signal` option which will destroy
   *    the socket also after the connect attempt has been successful.
   * @returns {Promise<TCPConnection>}
   *    The connection.
   */
  static connect(options) {
    return new Promise((resolve, reject) => {
      const connectSignal = options.connectSignal;
      if (connectSignal) connectSignal.throwIfAborted();
      const socket = new import_net.createConnection(options);
      const onerror = function(ev) {
        reject(ev);
        cleanup();
      };
      const onabort = function(ev) {
        const err = connectSignal.reason;
        reject(err);
        socket.destroy(err);
      };
      const cleanup = function() {
        socket.removeListener("error", onerror);
        socket.removeListener("timeout", onerror);
        if (connectSignal) connectSignal.removeEventListener("abort", onabort);
      };
      if (connectSignal) connectSignal.addEventListener("abort", onabort);
      socket.on("error", onerror);
      socket.on("timeout", onerror);
      socket.on("connect", () => {
        resolve(new this(socket, options));
        cleanup();
      });
    });
  }
  write(buf) {
    this.socket.write(import_buffer.Buffer.from(buf), "binary");
    super.write(buf);
  }
  /**
   * Close the TCP connection.
   */
  close() {
    super.close();
    this.socket.destroy();
    this.emit("close");
  }
  _now() {
    return import_perf_hooks.performance.now();
  }
};

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// server.js
var import_node_http = __toESM(require("node:http"), 1);
var import_promises = require("node:fs/promises");
var import_node_path = __toESM(require("node:path"), 1);
var import_node_url = require("node:url");

// discovery.js
var import_node_child_process = require("node:child_process");
var SERVICE = "_oca._tcp";
var SCAN_MS = 3e3;
var RESCAN_MS = 2e4;
function parseZoneDump(text) {
  const found = /* @__PURE__ */ new Map();
  const srvRe = /^(\S+)\._oca\._tcp\s+SRV\s+\d+\s+\d+\s+(\d+)\s+(\S+?)\.?\s*(?:;.*)?$/;
  const txtRe = /^(\S+)\._oca\._tcp\s+TXT\s+(.*)$/;
  for (const line of text.split("\n")) {
    let m = srvRe.exec(line.trim());
    if (m) {
      const [, instance, port, hostname] = m;
      const rec = found.get(instance) || {};
      rec.port = parseInt(port, 10);
      rec.hostname = hostname;
      found.set(instance, rec);
      continue;
    }
    m = txtRe.exec(line.trim());
    if (m) {
      const [, instance, rest] = m;
      const rec = found.get(instance) || {};
      rec.txt = rec.txt || {};
      const pairRe = /"([^"=]+)=([^"]*)"/g;
      let p;
      while (p = pairRe.exec(rest)) {
        rec.txt[p[1]] = p[2];
      }
      found.set(instance, rec);
    }
  }
  return found;
}
function resolveHost(hostname, timeoutMs = 2e3) {
  return new Promise((resolve) => {
    const child = (0, import_node_child_process.spawn)("dns-sd", ["-G", "v4", hostname]);
    let done = false;
    const finish = (addr) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.kill();
      resolve(addr);
    };
    let buf = "";
    child.stdout.on("data", (d) => {
      buf += d;
      const m = /Add\s+\S+\s+\S+\s+\S+\s+(\d+\.\d+\.\d+\.\d+)/.exec(buf);
      if (m) finish(m[1]);
    });
    child.on("error", () => finish(null));
    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}
async function scanOnce() {
  const text = await new Promise((resolve, reject) => {
    const child = (0, import_node_child_process.spawn)("dns-sd", ["-Z", SERVICE, "local."]);
    let out = "";
    child.stdout.on("data", (d) => out += d);
    child.on("error", reject);
    const timer = setTimeout(() => {
      child.kill();
    }, SCAN_MS);
    child.on("close", () => {
      clearTimeout(timer);
      resolve(out);
    });
  });
  const records = parseZoneDump(text);
  const results = await Promise.all(
    [...records].map(async ([instance, rec]) => {
      const txt = rec.txt || {};
      if (!txt.db_serialnumber || !rec.hostname || !rec.port) return null;
      const ip = await resolveHost(rec.hostname);
      if (!ip) return null;
      const model = (txt.db_firmwarevers || txt.db_devicename || instance).trim().split(/\s+/)[0];
      return {
        serial: txt.db_serialnumber,
        instance,
        model,
        deviceName: txt.db_devicename || instance,
        firmware: txt.db_firmwarevers || "",
        host: ip,
        port: rec.port
      };
    })
  );
  return results.filter(Boolean);
}
function startDiscovery(onUpdate) {
  let stopped = false;
  async function loop() {
    while (!stopped) {
      try {
        const amps2 = await scanOnce();
        onUpdate(amps2);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.error(
            "[discovery] the 'dns-sd' command isn't available on this system (discovery only works on macOS right now). Set D80_HOSTS to a comma-separated list of amp IPs and NO_DISCOVERY=1 to skip this. Stopping discovery."
          );
          return;
        }
        console.error("[discovery] scan failed:", err.message);
      }
      await new Promise((r) => setTimeout(r, RESCAN_MS));
    }
  }
  loop();
  return () => {
    stopped = true;
  };
}

// server.js
var import_meta = {};
var __dirname = typeof __filename !== "undefined" ? import_node_path.default.dirname(__filename) : import_node_path.default.dirname((0, import_node_url.fileURLToPath)(import_meta.url));
var HTTP_PORT = process.env.PORT || 8080;
var MAX_CONCURRENT_DISCOVERY = 4;
var MANUAL_HOSTS = (process.env.D80_HOSTS || "").split(",").map((s) => s.trim()).filter(Boolean);
var amps = /* @__PURE__ */ new Map();
var connecting = /* @__PURE__ */ new Set();
var activeDiscoverySlots = 0;
var discoveryQueue = [];
function makeAmpState({ serial, model, deviceName, host, port }) {
  return {
    serial,
    model: model || "?",
    deviceName: deviceName || serial,
    host,
    port,
    connected: false,
    status: {},
    channels: [],
    // Alert flags the user has told us to stop flagging on this specific
    // amp (e.g. a known SMPS fault). In-memory only, on purpose — restarting
    // the server is the only way to clear it, so a new session starts with
    // every current fault visible again rather than silently carrying old
    // acknowledgements forward.
    suppressedFlags: []
  };
}
var KNOWN_ERROR_FLAGS = ["generalError", "deviceError", "ampError", "smpsError"];
function setFlagSuppressed(serial, flag, suppressed) {
  const amp = amps.get(serial);
  if (!amp || !KNOWN_ERROR_FLAGS.includes(flag)) return false;
  const has = amp.suppressedFlags.includes(flag);
  if (suppressed && !has) amp.suppressedFlags.push(flag);
  if (!suppressed && has) amp.suppressedFlags = amp.suppressedFlags.filter((f) => f !== flag);
  broadcast();
  return true;
}
var wss;
var broadcastPending = false;
function broadcast() {
  if (broadcastPending || !wss) return;
  broadcastPending = true;
  setTimeout(() => {
    broadcastPending = false;
    const msg = JSON.stringify({ type: "state", amps: Object.fromEntries(amps) });
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(msg);
    }
  }, 250);
}
function normalize(value) {
  if (value && typeof value === "object") {
    if (typeof value.item === "function" && Array.isArray(value.values)) {
      value = value.item(0);
    }
  }
  if (value && typeof value === "object" && value.isEnum) {
    value = value.name;
  }
  return value;
}
async function withDiscoverySlot(fn) {
  if (activeDiscoverySlots >= MAX_CONCURRENT_DISCOVERY) {
    await new Promise((resolve) => discoveryQueue.push(resolve));
  }
  activeDiscoverySlots++;
  try {
    return await fn();
  } finally {
    activeDiscoverySlots--;
    const next = discoveryQueue.shift();
    if (next) next();
  }
}
async function connectAmp(serial) {
  for (; ; ) {
    const amp = amps.get(serial);
    if (!amp) return;
    try {
      connecting.add(serial);
      const { device, roles, channelCount } = await withDiscoverySlot(async () => {
        console.log(`[${amp.deviceName}] connecting to ${amp.host}:${amp.port}...`);
        const connection = await TCPConnection.connect({ host: amp.host, port: amp.port });
        const d = new RemoteDevice(connection);
        d.set_keepalive_interval(5);
        const r = await d.get_role_map();
        const count = [...r.keys()].filter((k) => /^ChStatus\/ChStatus_Isp\d*$/.test(k)).length;
        return { device: d, roles: r, channelCount: count };
      });
      connecting.delete(serial);
      console.log(`[${amp.deviceName}] connected, ${roles.size} objects, ${channelCount} channels`);
      amp.connected = true;
      amp.channels = Array.from({ length: channelCount }, () => ({}));
      broadcast();
      const closed = new Promise((resolve) => {
        device.connection.on("close", resolve);
        device.connection.on("error", (err) => {
          console.error(`[${amp.deviceName}] connection error:`, err.message);
        });
      });
      const watch = (roleName, target, key, prop = "Reading") => {
        const obj = roles.get(roleName);
        if (!obj) return;
        try {
          observeProperty(obj, prop, (ok, value) => {
            if (!ok) return;
            target[key] = normalize(value);
            broadcast();
          });
        } catch (err) {
          console.warn(`[${amp.deviceName}] cannot observe ${roleName}.${prop}:`, err.message);
        }
      };
      const watchWithMax = (roleName, target, key, maxKey) => {
        const obj = roles.get(roleName);
        if (!obj) return;
        try {
          observeProperty(obj, "Reading", (ok, value) => {
            if (!ok) return;
            if (value && typeof value.item === "function" && Array.isArray(value.values)) {
              target[key] = normalize(value.item(0));
              target[maxKey] = normalize(value.item(2));
            } else {
              target[key] = normalize(value);
            }
            broadcast();
          });
        } catch (err) {
          console.warn(`[${amp.deviceName}] cannot observe ${roleName}.Reading:`, err.message);
        }
      };
      watch("Status/Status_DeviceStatus", amp.status, "deviceStatus", "Position");
      watch("Status/Status_StatusText", amp.status, "firmware");
      watch("Status/Status_PwrOk", amp.status, "pwrOk");
      watch("Status/Status_SmpsTemperature", amp.status, "smpsTempC");
      watch("Error/Error_GnrlErr", amp.status, "generalError");
      watch("Error/Error_DeviceErr", amp.status, "deviceError");
      watch("Error/Error_AmpErr", amp.status, "ampError");
      watch("Error/Error_SmpsErr", amp.status, "smpsError");
      watch("Error/Error_ErrorText", amp.status, "errorText");
      for (let i = 1; i <= channelCount; i++) {
        const ch = amp.channels[i - 1];
        watch(`Config/Config_Mute${i}`, ch, "muted", "State");
        watch(`Config/Config_PotiLevel${i}`, ch, "gainDb", "Gain");
        watch(`Config/Config_ChannelName${i}`, ch, "name", "Setting");
        watch(`ChStatus/ChStatus_Isp${i}`, ch, "isp");
        watch(`ChStatus/ChStatus_Osp${i}`, ch, "osp");
        watch(`ChStatus/ChStatus_AmpOn${i}`, ch, "ampOn");
        watch(`ChStatus/ChStatus_Ovl${i}`, ch, "overload");
        watch(`ChStatus/ChStatus_InputOverload${i}`, ch, "inputOverload");
        watch(`ChStatus/ChStatus_OutputOverload${i}`, ch, "outputOverload");
        watch(`ChStatus/ChStatus_Gr${i}`, ch, "limiting");
        watch(`ChStatus/ChStatus_GrHead${i}`, ch, "headroomDb");
        watch(`ChStatus/ChStatus_InputVoltage${i}`, ch, "inputLevelDbu");
        watchWithMax(`ChStatus/ChStatus_OutputPower${i}`, ch, "outputPowerW", "outputPowerMaxW");
        watch(`ChStatus/ChStatus_SpeakerImpedance${i}`, ch, "impedanceOhm");
        watch(`ChStatus/ChStatus_AmpTemperature${i}`, ch, "tempC");
        watch(`ChStatus/ChStatus_StatusText${i}`, ch, "statusText");
      }
      await closed;
      console.log(`[${amp.deviceName}] connection closed`);
    } catch (err) {
      connecting.delete(serial);
      console.error(`[${amp.deviceName || serial}] ${err.message}`);
    }
    const stillTracked = amps.get(serial);
    if (!stillTracked) return;
    stillTracked.connected = false;
    broadcast();
    await new Promise((r) => setTimeout(r, 5e3));
  }
}
for (const entry of MANUAL_HOSTS) {
  const [host, portStr] = entry.split(":");
  const port = portStr ? parseInt(portStr, 10) : 30013;
  const serial = `manual:${entry}`;
  amps.set(serial, makeAmpState({ serial, model: "?", deviceName: entry, host, port }));
  connectAmp(serial);
}
if (!process.env.NO_DISCOVERY) {
  startDiscovery((discovered) => {
    for (const d of discovered) {
      const existing = amps.get(d.serial);
      if (!existing) {
        amps.set(d.serial, makeAmpState(d));
        broadcast();
        connectAmp(d.serial);
      } else {
        existing.model = d.model;
        existing.deviceName = d.deviceName;
        if (!existing.connected) {
          existing.host = d.host;
          existing.port = d.port;
        }
      }
    }
  });
}
var MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
var PUBLIC_DIR = import_node_path.default.join(__dirname, "public");
var server = import_node_http.default.createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0];
  if (urlPath === "/state") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ amps: Object.fromEntries(amps) }, null, 2));
    return;
  }
  if (req.method === "POST" && urlPath === "/api/suppress-flag") {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", () => {
      try {
        const { serial, flag, suppressed } = JSON.parse(body);
        const ok = setFlagSuppressed(serial, flag, !!suppressed);
        res.writeHead(ok ? 200 : 404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "bad request" }));
      }
    });
    return;
  }
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  const full = import_node_path.default.normalize(import_node_path.default.join(PUBLIC_DIR, decoded));
  if (full !== PUBLIC_DIR && !full.startsWith(PUBLIC_DIR + import_node_path.default.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const data = await (0, import_promises.readFile)(full);
    const ext = import_node_path.default.extname(full);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
wss = new import_websocket_server.default({ server });
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "state", amps: Object.fromEntries(amps) }));
});
server.listen(HTTP_PORT, () => {
  console.log(`D80 panel: http://localhost:${HTTP_PORT}`);
});
for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => process.exit(0));
}
