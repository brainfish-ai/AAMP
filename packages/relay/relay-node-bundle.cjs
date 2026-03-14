"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/encoders.js
var require_encoders = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/encoders.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TD = exports2.TE = exports2.Empty = void 0;
    exports2.encode = encode;
    exports2.decode = decode;
    exports2.Empty = new Uint8Array(0);
    exports2.TE = new TextEncoder();
    exports2.TD = new TextDecoder();
    function concat(...bufs) {
      let max = 0;
      for (let i = 0; i < bufs.length; i++) {
        max += bufs[i].length;
      }
      const out = new Uint8Array(max);
      let index = 0;
      for (let i = 0; i < bufs.length; i++) {
        out.set(bufs[i], index);
        index += bufs[i].length;
      }
      return out;
    }
    function encode(...a) {
      const bufs = [];
      for (let i = 0; i < a.length; i++) {
        bufs.push(exports2.TE.encode(a[i]));
      }
      if (bufs.length === 0) {
        return exports2.Empty;
      }
      if (bufs.length === 1) {
        return bufs[0];
      }
      return concat(...bufs);
    }
    function decode(a) {
      if (!a || a.length === 0) {
        return "";
      }
      return exports2.TD.decode(a);
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/nuid.js
var require_nuid = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/nuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nuid = exports2.Nuid = void 0;
    var digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var base = 36;
    var preLen = 12;
    var seqLen = 10;
    var maxSeq = 3656158440062976;
    var minInc = 33;
    var maxInc = 333;
    var totalLen = preLen + seqLen;
    function _getRandomValues(a) {
      for (let i = 0; i < a.length; i++) {
        a[i] = Math.floor(Math.random() * 255);
      }
    }
    function fillRandom(a) {
      var _a2;
      if ((_a2 = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _a2 === void 0 ? void 0 : _a2.getRandomValues) {
        globalThis.crypto.getRandomValues(a);
      } else {
        _getRandomValues(a);
      }
    }
    var Nuid = class {
      constructor() {
        this.buf = new Uint8Array(totalLen);
        this.inited = false;
      }
      /**
       * Initializes a nuid with a crypto random prefix,
       * and pseudo-random sequence and increment.
       *
       * @api private
       */
      init() {
        this.inited = true;
        this.setPre();
        this.initSeqAndInc();
        this.fillSeq();
      }
      /**
       * Initializes the pseudo randmon sequence number and the increment range.
       *
       * @api private
       */
      initSeqAndInc() {
        this.seq = Math.floor(Math.random() * maxSeq);
        this.inc = Math.floor(Math.random() * (maxInc - minInc) + minInc);
      }
      /**
       * Sets the prefix from crypto random bytes. Converts to base36.
       *
       * @api private
       */
      setPre() {
        const cbuf = new Uint8Array(preLen);
        fillRandom(cbuf);
        for (let i = 0; i < preLen; i++) {
          const di = cbuf[i] % base;
          this.buf[i] = digits.charCodeAt(di);
        }
      }
      /**
       * Fills the sequence part of the nuid as base36 from this.seq.
       *
       * @api private
       */
      fillSeq() {
        let n = this.seq;
        for (let i = totalLen - 1; i >= preLen; i--) {
          this.buf[i] = digits.charCodeAt(n % base);
          n = Math.floor(n / base);
        }
      }
      /**
       * Returns the next nuid.
       *
       * @api private
       */
      next() {
        if (!this.inited) {
          this.init();
        }
        this.seq += this.inc;
        if (this.seq > maxSeq) {
          this.setPre();
          this.initSeqAndInc();
        }
        this.fillSeq();
        return String.fromCharCode.apply(String, this.buf);
      }
      reset() {
        this.init();
      }
    };
    exports2.Nuid = Nuid;
    exports2.nuid = new Nuid();
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/core.js
var require_core = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/core.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServiceVerb = exports2.DEFAULT_HOST = exports2.DEFAULT_PORT = exports2.ServiceError = exports2.ServiceErrorCodeHeader = exports2.ServiceErrorHeader = exports2.ServiceResponseType = exports2.RequestStrategy = exports2.Match = exports2.NatsError = exports2.Messages = exports2.ErrorCode = exports2.DebugEvents = exports2.Events = void 0;
    exports2.isNatsError = isNatsError;
    exports2.syncIterator = syncIterator;
    exports2.createInbox = createInbox;
    var nuid_1 = require_nuid();
    var Events;
    (function(Events2) {
      Events2["Disconnect"] = "disconnect";
      Events2["Reconnect"] = "reconnect";
      Events2["Update"] = "update";
      Events2["LDM"] = "ldm";
      Events2["Error"] = "error";
    })(Events || (exports2.Events = Events = {}));
    var DebugEvents;
    (function(DebugEvents2) {
      DebugEvents2["Reconnecting"] = "reconnecting";
      DebugEvents2["PingTimer"] = "pingTimer";
      DebugEvents2["StaleConnection"] = "staleConnection";
      DebugEvents2["ClientInitiatedReconnect"] = "client initiated reconnect";
    })(DebugEvents || (exports2.DebugEvents = DebugEvents = {}));
    var ErrorCode;
    (function(ErrorCode2) {
      ErrorCode2["ApiError"] = "BAD API";
      ErrorCode2["BadAuthentication"] = "BAD_AUTHENTICATION";
      ErrorCode2["BadCreds"] = "BAD_CREDS";
      ErrorCode2["BadHeader"] = "BAD_HEADER";
      ErrorCode2["BadJson"] = "BAD_JSON";
      ErrorCode2["BadPayload"] = "BAD_PAYLOAD";
      ErrorCode2["BadSubject"] = "BAD_SUBJECT";
      ErrorCode2["Cancelled"] = "CANCELLED";
      ErrorCode2["ConnectionClosed"] = "CONNECTION_CLOSED";
      ErrorCode2["ConnectionDraining"] = "CONNECTION_DRAINING";
      ErrorCode2["ConnectionRefused"] = "CONNECTION_REFUSED";
      ErrorCode2["ConnectionTimeout"] = "CONNECTION_TIMEOUT";
      ErrorCode2["Disconnect"] = "DISCONNECT";
      ErrorCode2["InvalidOption"] = "INVALID_OPTION";
      ErrorCode2["InvalidPayload"] = "INVALID_PAYLOAD";
      ErrorCode2["MaxPayloadExceeded"] = "MAX_PAYLOAD_EXCEEDED";
      ErrorCode2["NoResponders"] = "503";
      ErrorCode2["NotFunction"] = "NOT_FUNC";
      ErrorCode2["RequestError"] = "REQUEST_ERROR";
      ErrorCode2["ServerOptionNotAvailable"] = "SERVER_OPT_NA";
      ErrorCode2["SubClosed"] = "SUB_CLOSED";
      ErrorCode2["SubDraining"] = "SUB_DRAINING";
      ErrorCode2["Timeout"] = "TIMEOUT";
      ErrorCode2["Tls"] = "TLS";
      ErrorCode2["Unknown"] = "UNKNOWN_ERROR";
      ErrorCode2["WssRequired"] = "WSS_REQUIRED";
      ErrorCode2["JetStreamInvalidAck"] = "JESTREAM_INVALID_ACK";
      ErrorCode2["JetStream404NoMessages"] = "404";
      ErrorCode2["JetStream408RequestTimeout"] = "408";
      ErrorCode2["JetStream409MaxAckPendingExceeded"] = "409";
      ErrorCode2["JetStream409"] = "409";
      ErrorCode2["JetStreamNotEnabled"] = "503";
      ErrorCode2["JetStreamIdleHeartBeat"] = "IDLE_HEARTBEAT";
      ErrorCode2["AuthorizationViolation"] = "AUTHORIZATION_VIOLATION";
      ErrorCode2["AuthenticationExpired"] = "AUTHENTICATION_EXPIRED";
      ErrorCode2["ProtocolError"] = "NATS_PROTOCOL_ERR";
      ErrorCode2["PermissionsViolation"] = "PERMISSIONS_VIOLATION";
      ErrorCode2["AuthenticationTimeout"] = "AUTHENTICATION_TIMEOUT";
      ErrorCode2["AccountExpired"] = "ACCOUNT_EXPIRED";
    })(ErrorCode || (exports2.ErrorCode = ErrorCode = {}));
    function isNatsError(err2) {
      return typeof err2.code === "string";
    }
    var Messages = class {
      constructor() {
        this.messages = /* @__PURE__ */ new Map();
        this.messages.set(ErrorCode.InvalidPayload, "Invalid payload type - payloads can be 'binary', 'string', or 'json'");
        this.messages.set(ErrorCode.BadJson, "Bad JSON");
        this.messages.set(ErrorCode.WssRequired, "TLS is required, therefore a secure websocket connection is also required");
      }
      static getMessage(s) {
        return messages.getMessage(s);
      }
      getMessage(s) {
        return this.messages.get(s) || s;
      }
    };
    exports2.Messages = Messages;
    var messages = new Messages();
    var NatsError = class _NatsError extends Error {
      /**
       * @param {String} message
       * @param {String} code
       * @param {Error} [chainedError]
       * @constructor
       *
       * @api private
       */
      constructor(message, code, chainedError) {
        super(message);
        this.name = "NatsError";
        this.message = message;
        this.code = code;
        this.chainedError = chainedError;
      }
      static errorForCode(code, chainedError) {
        const m = Messages.getMessage(code);
        return new _NatsError(m, code, chainedError);
      }
      isAuthError() {
        return this.code === ErrorCode.AuthenticationExpired || this.code === ErrorCode.AuthorizationViolation || this.code === ErrorCode.AccountExpired;
      }
      isAuthTimeout() {
        return this.code === ErrorCode.AuthenticationTimeout;
      }
      isPermissionError() {
        return this.code === ErrorCode.PermissionsViolation;
      }
      isProtocolError() {
        return this.code === ErrorCode.ProtocolError;
      }
      isJetStreamError() {
        return this.api_error !== void 0;
      }
      jsError() {
        return this.api_error ? this.api_error : null;
      }
    };
    exports2.NatsError = NatsError;
    var Match;
    (function(Match2) {
      Match2[Match2["Exact"] = 0] = "Exact";
      Match2[Match2["CanonicalMIME"] = 1] = "CanonicalMIME";
      Match2[Match2["IgnoreCase"] = 2] = "IgnoreCase";
    })(Match || (exports2.Match = Match = {}));
    var RequestStrategy;
    (function(RequestStrategy2) {
      RequestStrategy2["Timer"] = "timer";
      RequestStrategy2["Count"] = "count";
      RequestStrategy2["JitterTimer"] = "jitterTimer";
      RequestStrategy2["SentinelMsg"] = "sentinelMsg";
    })(RequestStrategy || (exports2.RequestStrategy = RequestStrategy = {}));
    function syncIterator(src) {
      const iter = src[Symbol.asyncIterator]();
      return {
        next() {
          return __awaiter(this, void 0, void 0, function* () {
            const m = yield iter.next();
            if (m.done) {
              return Promise.resolve(null);
            }
            return Promise.resolve(m.value);
          });
        }
      };
    }
    var ServiceResponseType;
    (function(ServiceResponseType2) {
      ServiceResponseType2["STATS"] = "io.nats.micro.v1.stats_response";
      ServiceResponseType2["INFO"] = "io.nats.micro.v1.info_response";
      ServiceResponseType2["PING"] = "io.nats.micro.v1.ping_response";
    })(ServiceResponseType || (exports2.ServiceResponseType = ServiceResponseType = {}));
    exports2.ServiceErrorHeader = "Nats-Service-Error";
    exports2.ServiceErrorCodeHeader = "Nats-Service-Error-Code";
    var ServiceError = class _ServiceError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
      static isServiceError(msg) {
        return _ServiceError.toServiceError(msg) !== null;
      }
      static toServiceError(msg) {
        var _a2, _b;
        const scode = ((_a2 = msg === null || msg === void 0 ? void 0 : msg.headers) === null || _a2 === void 0 ? void 0 : _a2.get(exports2.ServiceErrorCodeHeader)) || "";
        if (scode !== "") {
          const code = parseInt(scode) || 400;
          const description = ((_b = msg === null || msg === void 0 ? void 0 : msg.headers) === null || _b === void 0 ? void 0 : _b.get(exports2.ServiceErrorHeader)) || "";
          return new _ServiceError(code, description.length ? description : scode);
        }
        return null;
      }
    };
    exports2.ServiceError = ServiceError;
    function createInbox(prefix = "") {
      prefix = prefix || "_INBOX";
      if (typeof prefix !== "string") {
        throw new Error("prefix must be a string");
      }
      prefix.split(".").forEach((v) => {
        if (v === "*" || v === ">") {
          throw new Error(`inbox prefixes cannot have wildcards '${prefix}'`);
        }
      });
      return `${prefix}.${nuid_1.nuid.next()}`;
    }
    exports2.DEFAULT_PORT = 4222;
    exports2.DEFAULT_HOST = "127.0.0.1";
    var ServiceVerb;
    (function(ServiceVerb2) {
      ServiceVerb2["PING"] = "PING";
      ServiceVerb2["STATS"] = "STATS";
      ServiceVerb2["INFO"] = "INFO";
    })(ServiceVerb || (exports2.ServiceVerb = ServiceVerb = {}));
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/util.js
var require_util = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/util.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SimpleMutex = exports2.Perf = void 0;
    exports2.extend = extend;
    exports2.render = render;
    exports2.timeout = timeout;
    exports2.delay = delay;
    exports2.deadline = deadline;
    exports2.deferred = deferred;
    exports2.debugDeferred = debugDeferred;
    exports2.shuffle = shuffle;
    exports2.collect = collect;
    exports2.jitter = jitter;
    exports2.backoffWithMax = backoffWithMax;
    exports2.backoff = backoff;
    exports2.nanos = nanos;
    exports2.millis = millis;
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    function extend(a, ...b) {
      for (let i = 0; i < b.length; i++) {
        const o = b[i];
        Object.keys(o).forEach(function(k) {
          a[k] = o[k];
        });
      }
      return a;
    }
    function render(frame) {
      const cr2 = "\u240D";
      const lf = "\u240A";
      return encoders_1.TD.decode(frame).replace(/\n/g, lf).replace(/\r/g, cr2);
    }
    function timeout(ms, asyncTraces = true) {
      const err2 = asyncTraces ? core_1.NatsError.errorForCode(core_1.ErrorCode.Timeout) : null;
      let methods;
      let timer;
      const p = new Promise((_resolve, reject) => {
        const cancel = () => {
          if (timer) {
            clearTimeout(timer);
          }
        };
        methods = { cancel };
        timer = setTimeout(() => {
          if (err2 === null) {
            reject(core_1.NatsError.errorForCode(core_1.ErrorCode.Timeout));
          } else {
            reject(err2);
          }
        }, ms);
      });
      return Object.assign(p, methods);
    }
    function delay(ms = 0) {
      let methods;
      const p = new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve();
        }, ms);
        const cancel = () => {
          if (timer) {
            clearTimeout(timer);
          }
        };
        methods = { cancel };
      });
      return Object.assign(p, methods);
    }
    function deadline(p, millis2 = 1e3) {
      const err2 = new Error(`deadline exceeded`);
      const d = deferred();
      const timer = setTimeout(() => d.reject(err2), millis2);
      return Promise.race([p, d]).finally(() => clearTimeout(timer));
    }
    function deferred() {
      let methods = {};
      const p = new Promise((resolve, reject) => {
        methods = { resolve, reject };
      });
      return Object.assign(p, methods);
    }
    function debugDeferred() {
      let methods = {};
      const p = new Promise((resolve, reject) => {
        methods = {
          resolve: (v) => {
            console.trace("resolve", v);
            resolve(v);
          },
          reject: (err2) => {
            console.trace("reject");
            reject(err2);
          }
        };
      });
      return Object.assign(p, methods);
    }
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    function collect(iter) {
      return __awaiter(this, void 0, void 0, function* () {
        var _a2, iter_1, iter_1_1;
        var _b, e_1, _c, _d2;
        const buf = [];
        try {
          for (_a2 = true, iter_1 = __asyncValues(iter); iter_1_1 = yield iter_1.next(), _b = iter_1_1.done, !_b; _a2 = true) {
            _d2 = iter_1_1.value;
            _a2 = false;
            const v = _d2;
            buf.push(v);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (!_a2 && !_b && (_c = iter_1.return)) yield _c.call(iter_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return buf;
      });
    }
    var Perf = class {
      constructor() {
        this.timers = /* @__PURE__ */ new Map();
        this.measures = /* @__PURE__ */ new Map();
      }
      mark(key) {
        this.timers.set(key, performance.now());
      }
      measure(key, startKey, endKey) {
        const s = this.timers.get(startKey);
        if (s === void 0) {
          throw new Error(`${startKey} is not defined`);
        }
        const e = this.timers.get(endKey);
        if (e === void 0) {
          throw new Error(`${endKey} is not defined`);
        }
        this.measures.set(key, e - s);
      }
      getEntries() {
        const values = [];
        this.measures.forEach((v, k) => {
          values.push({ name: k, duration: v });
        });
        return values;
      }
    };
    exports2.Perf = Perf;
    var SimpleMutex = class {
      /**
       * @param max number of concurrent operations
       */
      constructor(max = 1) {
        this.max = max;
        this.current = 0;
        this.waiting = [];
      }
      /**
       * Returns a promise that resolves when the mutex is acquired
       */
      lock() {
        this.current++;
        if (this.current <= this.max) {
          return Promise.resolve();
        }
        const d = deferred();
        this.waiting.push(d);
        return d;
      }
      /**
       * Release an acquired mutex - must be called
       */
      unlock() {
        this.current--;
        const d = this.waiting.pop();
        d === null || d === void 0 ? void 0 : d.resolve();
      }
    };
    exports2.SimpleMutex = SimpleMutex;
    function jitter(n) {
      if (n === 0) {
        return 0;
      }
      return Math.floor(n / 2 + Math.random() * n);
    }
    function backoffWithMax(max = 3e4) {
      const a = [max];
      while (true) {
        const n = Math.floor(max / 2);
        if (n < 100) {
          a.unshift(0);
          break;
        }
        a.unshift(n);
        max = n;
      }
      return backoff(a);
    }
    function backoff(policy = [0, 250, 250, 500, 500, 3e3, 5e3]) {
      if (!Array.isArray(policy)) {
        policy = [0, 250, 250, 500, 500, 3e3, 5e3];
      }
      const max = policy.length - 1;
      return {
        backoff(attempt) {
          return jitter(attempt > max ? policy[max] : policy[attempt]);
        }
      };
    }
    function nanos(millis2) {
      return millis2 * 1e6;
    }
    function millis(ns) {
      return Math.floor(ns / 1e6);
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/databuffer.js
var require_databuffer = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/databuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DataBuffer = void 0;
    var encoders_1 = require_encoders();
    var DataBuffer = class {
      constructor() {
        this.buffers = [];
        this.byteLength = 0;
      }
      static concat(...bufs) {
        let max = 0;
        for (let i = 0; i < bufs.length; i++) {
          max += bufs[i].length;
        }
        const out = new Uint8Array(max);
        let index = 0;
        for (let i = 0; i < bufs.length; i++) {
          out.set(bufs[i], index);
          index += bufs[i].length;
        }
        return out;
      }
      static fromAscii(m) {
        if (!m) {
          m = "";
        }
        return encoders_1.TE.encode(m);
      }
      static toAscii(a) {
        return encoders_1.TD.decode(a);
      }
      reset() {
        this.buffers.length = 0;
        this.byteLength = 0;
      }
      pack() {
        if (this.buffers.length > 1) {
          const v = new Uint8Array(this.byteLength);
          let index = 0;
          for (let i = 0; i < this.buffers.length; i++) {
            v.set(this.buffers[i], index);
            index += this.buffers[i].length;
          }
          this.buffers.length = 0;
          this.buffers.push(v);
        }
      }
      shift() {
        if (this.buffers.length) {
          const a = this.buffers.shift();
          if (a) {
            this.byteLength -= a.length;
            return a;
          }
        }
        return new Uint8Array(0);
      }
      drain(n) {
        if (this.buffers.length) {
          this.pack();
          const v = this.buffers.pop();
          if (v) {
            const max = this.byteLength;
            if (n === void 0 || n > max) {
              n = max;
            }
            const d = v.subarray(0, n);
            if (max > n) {
              this.buffers.push(v.subarray(n));
            }
            this.byteLength = max - n;
            return d;
          }
        }
        return new Uint8Array(0);
      }
      fill(a, ...bufs) {
        if (a) {
          this.buffers.push(a);
          this.byteLength += a.length;
        }
        for (let i = 0; i < bufs.length; i++) {
          if (bufs[i] && bufs[i].length) {
            this.buffers.push(bufs[i]);
            this.byteLength += bufs[i].length;
          }
        }
      }
      peek() {
        if (this.buffers.length) {
          this.pack();
          return this.buffers[0];
        }
        return new Uint8Array(0);
      }
      size() {
        return this.byteLength;
      }
      length() {
        return this.buffers.length;
      }
    };
    exports2.DataBuffer = DataBuffer;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/transport.js
var require_transport = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/transport.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LF = exports2.CR = exports2.CRLF = exports2.CR_LF_LEN = exports2.CR_LF = void 0;
    exports2.setTransportFactory = setTransportFactory;
    exports2.defaultPort = defaultPort;
    exports2.getUrlParseFn = getUrlParseFn;
    exports2.newTransport = newTransport;
    exports2.getResolveFn = getResolveFn;
    exports2.protoLen = protoLen;
    exports2.extractProtocolMessage = extractProtocolMessage;
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    var databuffer_1 = require_databuffer();
    var transportConfig;
    function setTransportFactory(config2) {
      transportConfig = config2;
    }
    function defaultPort() {
      return transportConfig !== void 0 && transportConfig.defaultPort !== void 0 ? transportConfig.defaultPort : core_1.DEFAULT_PORT;
    }
    function getUrlParseFn() {
      return transportConfig !== void 0 && transportConfig.urlParseFn ? transportConfig.urlParseFn : void 0;
    }
    function newTransport() {
      if (!transportConfig || typeof transportConfig.factory !== "function") {
        throw new Error("transport fn is not set");
      }
      return transportConfig.factory();
    }
    function getResolveFn() {
      return transportConfig !== void 0 && transportConfig.dnsResolveFn ? transportConfig.dnsResolveFn : void 0;
    }
    exports2.CR_LF = "\r\n";
    exports2.CR_LF_LEN = exports2.CR_LF.length;
    exports2.CRLF = databuffer_1.DataBuffer.fromAscii(exports2.CR_LF);
    exports2.CR = new Uint8Array(exports2.CRLF)[0];
    exports2.LF = new Uint8Array(exports2.CRLF)[1];
    function protoLen(ba) {
      for (let i = 0; i < ba.length; i++) {
        const n = i + 1;
        if (ba.byteLength > n && ba[i] === exports2.CR && ba[n] === exports2.LF) {
          return n + 1;
        }
      }
      return 0;
    }
    function extractProtocolMessage(a) {
      const len = protoLen(a);
      if (len > 0) {
        const ba = new Uint8Array(a);
        const out = ba.slice(0, len);
        return encoders_1.TD.decode(out);
      }
      return "";
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/ipparser.js
var require_ipparser = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/ipparser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ipV4 = ipV4;
    exports2.isIP = isIP;
    exports2.parseIP = parseIP;
    var IPv4LEN = 4;
    var IPv6LEN = 16;
    var ASCII0 = 48;
    var ASCII9 = 57;
    var ASCIIA = 65;
    var ASCIIF = 70;
    var ASCIIa = 97;
    var ASCIIf = 102;
    var big2 = 16777215;
    function ipV4(a, b, c, d) {
      const ip = new Uint8Array(IPv6LEN);
      const prefix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255];
      prefix.forEach((v, idx) => {
        ip[idx] = v;
      });
      ip[12] = a;
      ip[13] = b;
      ip[14] = c;
      ip[15] = d;
      return ip;
    }
    function isIP(h2) {
      return parseIP(h2) !== void 0;
    }
    function parseIP(h2) {
      for (let i = 0; i < h2.length; i++) {
        switch (h2[i]) {
          case ".":
            return parseIPv4(h2);
          case ":":
            return parseIPv6(h2);
        }
      }
      return;
    }
    function parseIPv4(s) {
      const ip = new Uint8Array(IPv4LEN);
      for (let i = 0; i < IPv4LEN; i++) {
        if (s.length === 0) {
          return void 0;
        }
        if (i > 0) {
          if (s[0] !== ".") {
            return void 0;
          }
          s = s.substring(1);
        }
        const { n, c, ok } = dtoi(s);
        if (!ok || n > 255) {
          return void 0;
        }
        s = s.substring(c);
        ip[i] = n;
      }
      return ipV4(ip[0], ip[1], ip[2], ip[3]);
    }
    function parseIPv6(s) {
      const ip = new Uint8Array(IPv6LEN);
      let ellipsis = -1;
      if (s.length >= 2 && s[0] === ":" && s[1] === ":") {
        ellipsis = 0;
        s = s.substring(2);
        if (s.length === 0) {
          return ip;
        }
      }
      let i = 0;
      while (i < IPv6LEN) {
        const { n, c, ok } = xtoi(s);
        if (!ok || n > 65535) {
          return void 0;
        }
        if (c < s.length && s[c] === ".") {
          if (ellipsis < 0 && i != IPv6LEN - IPv4LEN) {
            return void 0;
          }
          if (i + IPv4LEN > IPv6LEN) {
            return void 0;
          }
          const ip4 = parseIPv4(s);
          if (ip4 === void 0) {
            return void 0;
          }
          ip[i] = ip4[12];
          ip[i + 1] = ip4[13];
          ip[i + 2] = ip4[14];
          ip[i + 3] = ip4[15];
          s = "";
          i += IPv4LEN;
          break;
        }
        ip[i] = n >> 8;
        ip[i + 1] = n;
        i += 2;
        s = s.substring(c);
        if (s.length === 0) {
          break;
        }
        if (s[0] !== ":" || s.length == 1) {
          return void 0;
        }
        s = s.substring(1);
        if (s[0] === ":") {
          if (ellipsis >= 0) {
            return void 0;
          }
          ellipsis = i;
          s = s.substring(1);
          if (s.length === 0) {
            break;
          }
        }
      }
      if (s.length !== 0) {
        return void 0;
      }
      if (i < IPv6LEN) {
        if (ellipsis < 0) {
          return void 0;
        }
        const n = IPv6LEN - i;
        for (let j = i - 1; j >= ellipsis; j--) {
          ip[j + n] = ip[j];
        }
        for (let j = ellipsis + n - 1; j >= ellipsis; j--) {
          ip[j] = 0;
        }
      } else if (ellipsis >= 0) {
        return void 0;
      }
      return ip;
    }
    function dtoi(s) {
      let i = 0;
      let n = 0;
      for (i = 0; i < s.length && ASCII0 <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCII9; i++) {
        n = n * 10 + (s.charCodeAt(i) - ASCII0);
        if (n >= big2) {
          return { n: big2, c: i, ok: false };
        }
      }
      if (i === 0) {
        return { n: 0, c: 0, ok: false };
      }
      return { n, c: i, ok: true };
    }
    function xtoi(s) {
      let n = 0;
      let i = 0;
      for (i = 0; i < s.length; i++) {
        if (ASCII0 <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCII9) {
          n *= 16;
          n += s.charCodeAt(i) - ASCII0;
        } else if (ASCIIa <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCIIf) {
          n *= 16;
          n += s.charCodeAt(i) - ASCIIa + 10;
        } else if (ASCIIA <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCIIF) {
          n *= 16;
          n += s.charCodeAt(i) - ASCIIA + 10;
        } else {
          break;
        }
        if (n >= big2) {
          return { n: 0, c: i, ok: false };
        }
      }
      if (i === 0) {
        return { n: 0, c: i, ok: false };
      }
      return { n, c: i, ok: true };
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/servers.js
var require_servers = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/servers.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Servers = exports2.ServerImpl = void 0;
    exports2.isIPV4OrHostname = isIPV4OrHostname;
    exports2.hostPort = hostPort;
    var transport_1 = require_transport();
    var util_1 = require_util();
    var ipparser_1 = require_ipparser();
    var core_1 = require_core();
    function isIPV4OrHostname(hp) {
      if (hp.indexOf("[") !== -1 || hp.indexOf("::") !== -1) {
        return false;
      }
      if (hp.indexOf(".") !== -1) {
        return true;
      }
      if (hp.split(":").length <= 2) {
        return true;
      }
      return false;
    }
    function isIPV6(hp) {
      return !isIPV4OrHostname(hp);
    }
    function filterIpv6MappedToIpv4(hp) {
      const prefix = "::FFFF:";
      const idx = hp.toUpperCase().indexOf(prefix);
      if (idx !== -1 && hp.indexOf(".") !== -1) {
        let ip = hp.substring(idx + prefix.length);
        ip = ip.replace("[", "");
        return ip.replace("]", "");
      }
      return hp;
    }
    function hostPort(u) {
      u = u.trim();
      if (u.match(/^(.*:\/\/)(.*)/m)) {
        u = u.replace(/^(.*:\/\/)(.*)/gm, "$2");
      }
      u = filterIpv6MappedToIpv4(u);
      if (isIPV6(u) && u.indexOf("[") === -1) {
        u = `[${u}]`;
      }
      const op = isIPV6(u) ? u.match(/(]:)(\d+)/) : u.match(/(:)(\d+)/);
      const port = op && op.length === 3 && op[1] && op[2] ? parseInt(op[2]) : core_1.DEFAULT_PORT;
      const protocol = port === 80 ? "https" : "http";
      const url = new URL(`${protocol}://${u}`);
      url.port = `${port}`;
      let hostname = url.hostname;
      if (hostname.charAt(0) === "[") {
        hostname = hostname.substring(1, hostname.length - 1);
      }
      const listen = url.host;
      return { listen, hostname, port };
    }
    var ServerImpl = class _ServerImpl {
      constructor(u, gossiped = false) {
        this.src = u;
        this.tlsName = "";
        const v = hostPort(u);
        this.listen = v.listen;
        this.hostname = v.hostname;
        this.port = v.port;
        this.didConnect = false;
        this.reconnects = 0;
        this.lastConnect = 0;
        this.gossiped = gossiped;
      }
      toString() {
        return this.listen;
      }
      resolve(opts) {
        return __awaiter(this, void 0, void 0, function* () {
          if (!opts.fn || opts.resolve === false) {
            return [this];
          }
          const buf = [];
          if ((0, ipparser_1.isIP)(this.hostname)) {
            return [this];
          } else {
            const ips = yield opts.fn(this.hostname);
            if (opts.debug) {
              console.log(`resolve ${this.hostname} = ${ips.join(",")}`);
            }
            for (const ip of ips) {
              const proto = this.port === 80 ? "https" : "http";
              const url = new URL(`${proto}://${isIPV6(ip) ? "[" + ip + "]" : ip}`);
              url.port = `${this.port}`;
              const ss = new _ServerImpl(url.host, false);
              ss.tlsName = this.hostname;
              buf.push(ss);
            }
          }
          if (opts.randomize) {
            (0, util_1.shuffle)(buf);
          }
          this.resolves = buf;
          return buf;
        });
      }
    };
    exports2.ServerImpl = ServerImpl;
    var Servers = class {
      constructor(listens = [], opts = {}) {
        this.firstSelect = true;
        this.servers = [];
        this.tlsName = "";
        this.randomize = opts.randomize || false;
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        if (listens) {
          listens.forEach((hp) => {
            hp = urlParseFn ? urlParseFn(hp) : hp;
            this.servers.push(new ServerImpl(hp));
          });
          if (this.randomize) {
            this.servers = (0, util_1.shuffle)(this.servers);
          }
        }
        if (this.servers.length === 0) {
          this.addServer(`${core_1.DEFAULT_HOST}:${(0, transport_1.defaultPort)()}`, false);
        }
        this.currentServer = this.servers[0];
      }
      clear() {
        this.servers.length = 0;
      }
      updateTLSName() {
        const cs = this.getCurrentServer();
        if (!(0, ipparser_1.isIP)(cs.hostname)) {
          this.tlsName = cs.hostname;
          this.servers.forEach((s) => {
            if (s.gossiped) {
              s.tlsName = this.tlsName;
            }
          });
        }
      }
      getCurrentServer() {
        return this.currentServer;
      }
      addServer(u, implicit = false) {
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        u = urlParseFn ? urlParseFn(u) : u;
        const s = new ServerImpl(u, implicit);
        if ((0, ipparser_1.isIP)(s.hostname)) {
          s.tlsName = this.tlsName;
        }
        this.servers.push(s);
      }
      selectServer() {
        if (this.firstSelect) {
          this.firstSelect = false;
          return this.currentServer;
        }
        const t = this.servers.shift();
        if (t) {
          this.servers.push(t);
          this.currentServer = t;
        }
        return t;
      }
      removeCurrentServer() {
        this.removeServer(this.currentServer);
      }
      removeServer(server) {
        if (server) {
          const index = this.servers.indexOf(server);
          this.servers.splice(index, 1);
        }
      }
      length() {
        return this.servers.length;
      }
      next() {
        return this.servers.length ? this.servers[0] : void 0;
      }
      getServers() {
        return this.servers;
      }
      update(info, encrypted) {
        const added = [];
        let deleted = [];
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        const discovered = /* @__PURE__ */ new Map();
        if (info.connect_urls && info.connect_urls.length > 0) {
          info.connect_urls.forEach((hp) => {
            hp = urlParseFn ? urlParseFn(hp, encrypted) : hp;
            const s = new ServerImpl(hp, true);
            discovered.set(hp, s);
          });
        }
        const toDelete = [];
        this.servers.forEach((s, index) => {
          const u = s.listen;
          if (s.gossiped && this.currentServer.listen !== u && discovered.get(u) === void 0) {
            toDelete.push(index);
          }
          discovered.delete(u);
        });
        toDelete.reverse();
        toDelete.forEach((index) => {
          const removed = this.servers.splice(index, 1);
          deleted = deleted.concat(removed[0].listen);
        });
        discovered.forEach((v, k) => {
          this.servers.push(v);
          added.push(k);
        });
        return { added, deleted };
      }
    };
    exports2.Servers = Servers;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/queued_iterator.js
var require_queued_iterator = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/queued_iterator.js"(exports2) {
    "use strict";
    var __await = exports2 && exports2.__await || function(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
    };
    var __asyncGenerator = exports2 && exports2.__asyncGenerator || function(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
      }, i;
      function awaitReturn(f) {
        return function(v) {
          return Promise.resolve(v).then(f, reject);
        };
      }
      function verb(n, f) {
        if (g[n]) {
          i[n] = function(v) {
            return new Promise(function(a, b) {
              q.push([n, v, a, b]) > 1 || resume(n, v);
            });
          };
          if (f) i[n] = f(i[n]);
        }
      }
      function resume(n, v) {
        try {
          step(g[n](v));
        } catch (e) {
          settle(q[0][3], e);
        }
      }
      function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
      }
      function fulfill(value) {
        resume("next", value);
      }
      function reject(value) {
        resume("throw", value);
      }
      function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.QueuedIteratorImpl = void 0;
    var util_1 = require_util();
    var core_1 = require_core();
    var QueuedIteratorImpl = class {
      constructor() {
        this.inflight = 0;
        this.filtered = 0;
        this.pendingFiltered = 0;
        this.processed = 0;
        this.received = 0;
        this.noIterator = false;
        this.done = false;
        this.signal = (0, util_1.deferred)();
        this.yields = [];
        this.iterClosed = (0, util_1.deferred)();
        this.time = 0;
        this.yielding = false;
      }
      [Symbol.asyncIterator]() {
        return this.iterate();
      }
      push(v) {
        if (this.done) {
          return;
        }
        if (typeof v === "function") {
          this.yields.push(v);
          this.signal.resolve();
          return;
        }
        const { ingest, protocol } = this.ingestionFilterFn ? this.ingestionFilterFn(v, this.ctx || this) : { ingest: true, protocol: false };
        if (ingest) {
          if (protocol) {
            this.filtered++;
            this.pendingFiltered++;
          }
          this.yields.push(v);
          this.signal.resolve();
        }
      }
      iterate() {
        return __asyncGenerator(this, arguments, function* iterate_1() {
          if (this.noIterator) {
            throw new core_1.NatsError("unsupported iterator", core_1.ErrorCode.ApiError);
          }
          if (this.yielding) {
            throw new core_1.NatsError("already yielding", core_1.ErrorCode.ApiError);
          }
          this.yielding = true;
          try {
            while (true) {
              if (this.yields.length === 0) {
                yield __await(this.signal);
              }
              if (this.err) {
                throw this.err;
              }
              const yields = this.yields;
              this.inflight = yields.length;
              this.yields = [];
              for (let i = 0; i < yields.length; i++) {
                if (typeof yields[i] === "function") {
                  const fn = yields[i];
                  try {
                    fn();
                  } catch (err2) {
                    throw err2;
                  }
                  if (this.err) {
                    throw this.err;
                  }
                  continue;
                }
                const ok = this.protocolFilterFn ? this.protocolFilterFn(yields[i]) : true;
                if (ok) {
                  this.processed++;
                  const start = Date.now();
                  yield yield __await(yields[i]);
                  this.time = Date.now() - start;
                  if (this.dispatchedFn && yields[i]) {
                    this.dispatchedFn(yields[i]);
                  }
                } else {
                  this.pendingFiltered--;
                }
                this.inflight--;
              }
              if (this.done) {
                break;
              } else if (this.yields.length === 0) {
                yields.length = 0;
                this.yields = yields;
                this.signal = (0, util_1.deferred)();
              }
            }
          } finally {
            this.stop();
          }
        });
      }
      stop(err2) {
        if (this.done) {
          return;
        }
        this.err = err2;
        this.done = true;
        this.signal.resolve();
        this.iterClosed.resolve(err2);
      }
      getProcessed() {
        return this.noIterator ? this.received : this.processed;
      }
      getPending() {
        return this.yields.length + this.inflight - this.pendingFiltered;
      }
      getReceived() {
        return this.received - this.filtered;
      }
    };
    exports2.QueuedIteratorImpl = QueuedIteratorImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/headers.js
var require_headers = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/headers.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MsgHdrsImpl = void 0;
    exports2.canonicalMIMEHeaderKey = canonicalMIMEHeaderKey;
    exports2.headers = headers;
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    function canonicalMIMEHeaderKey(k) {
      const a = 97;
      const A = 65;
      const Z = 90;
      const z = 122;
      const dash = 45;
      const colon = 58;
      const start = 33;
      const end = 126;
      const toLower = a - A;
      let upper = true;
      const buf = new Array(k.length);
      for (let i = 0; i < k.length; i++) {
        let c = k.charCodeAt(i);
        if (c === colon || c < start || c > end) {
          throw new core_1.NatsError(`'${k[i]}' is not a valid character for a header key`, core_1.ErrorCode.BadHeader);
        }
        if (upper && a <= c && c <= z) {
          c -= toLower;
        } else if (!upper && A <= c && c <= Z) {
          c += toLower;
        }
        buf[i] = c;
        upper = c == dash;
      }
      return String.fromCharCode(...buf);
    }
    function headers(code = 0, description = "") {
      if (code === 0 && description !== "" || code > 0 && description === "") {
        throw new Error("setting status requires both code and description");
      }
      return new MsgHdrsImpl(code, description);
    }
    var HEADER = "NATS/1.0";
    var MsgHdrsImpl = class _MsgHdrsImpl {
      constructor(code = 0, description = "") {
        this._code = code;
        this._description = description;
        this.headers = /* @__PURE__ */ new Map();
      }
      [Symbol.iterator]() {
        return this.headers.entries();
      }
      size() {
        return this.headers.size;
      }
      equals(mh) {
        if (mh && this.headers.size === mh.headers.size && this._code === mh._code) {
          for (const [k, v] of this.headers) {
            const a = mh.values(k);
            if (v.length !== a.length) {
              return false;
            }
            const vv = [...v].sort();
            const aa = [...a].sort();
            for (let i = 0; i < vv.length; i++) {
              if (vv[i] !== aa[i]) {
                return false;
              }
            }
          }
          return true;
        }
        return false;
      }
      static decode(a) {
        const mh = new _MsgHdrsImpl();
        const s = encoders_1.TD.decode(a);
        const lines = s.split("\r\n");
        const h2 = lines[0];
        if (h2 !== HEADER) {
          let str = h2.replace(HEADER, "").trim();
          if (str.length > 0) {
            mh._code = parseInt(str, 10);
            if (isNaN(mh._code)) {
              mh._code = 0;
            }
            const scode = mh._code.toString();
            str = str.replace(scode, "");
            mh._description = str.trim();
          }
        }
        if (lines.length >= 1) {
          lines.slice(1).map((s2) => {
            if (s2) {
              const idx = s2.indexOf(":");
              if (idx > -1) {
                const k = s2.slice(0, idx);
                const v = s2.slice(idx + 1).trim();
                mh.append(k, v);
              }
            }
          });
        }
        return mh;
      }
      toString() {
        if (this.headers.size === 0 && this._code === 0) {
          return "";
        }
        let s = HEADER;
        if (this._code > 0 && this._description !== "") {
          s += ` ${this._code} ${this._description}`;
        }
        for (const [k, v] of this.headers) {
          for (let i = 0; i < v.length; i++) {
            s = `${s}\r
${k}: ${v[i]}`;
          }
        }
        return `${s}\r
\r
`;
      }
      encode() {
        return encoders_1.TE.encode(this.toString());
      }
      static validHeaderValue(k) {
        const inv = /[\r\n]/;
        if (inv.test(k)) {
          throw new core_1.NatsError("invalid header value - \\r and \\n are not allowed.", core_1.ErrorCode.BadHeader);
        }
        return k.trim();
      }
      keys() {
        const keys = [];
        for (const sk of this.headers.keys()) {
          keys.push(sk);
        }
        return keys;
      }
      findKeys(k, match2 = core_1.Match.Exact) {
        const keys = this.keys();
        switch (match2) {
          case core_1.Match.Exact:
            return keys.filter((v) => {
              return v === k;
            });
          case core_1.Match.CanonicalMIME:
            k = canonicalMIMEHeaderKey(k);
            return keys.filter((v) => {
              return v === k;
            });
          default: {
            const lci = k.toLowerCase();
            return keys.filter((v) => {
              return lci === v.toLowerCase();
            });
          }
        }
      }
      get(k, match2 = core_1.Match.Exact) {
        const keys = this.findKeys(k, match2);
        if (keys.length) {
          const v = this.headers.get(keys[0]);
          if (v) {
            return Array.isArray(v) ? v[0] : v;
          }
        }
        return "";
      }
      last(k, match2 = core_1.Match.Exact) {
        const keys = this.findKeys(k, match2);
        if (keys.length) {
          const v = this.headers.get(keys[0]);
          if (v) {
            return Array.isArray(v) ? v[v.length - 1] : v;
          }
        }
        return "";
      }
      has(k, match2 = core_1.Match.Exact) {
        return this.findKeys(k, match2).length > 0;
      }
      set(k, v, match2 = core_1.Match.Exact) {
        this.delete(k, match2);
        this.append(k, v, match2);
      }
      append(k, v, match2 = core_1.Match.Exact) {
        const ck = canonicalMIMEHeaderKey(k);
        if (match2 === core_1.Match.CanonicalMIME) {
          k = ck;
        }
        const keys = this.findKeys(k, match2);
        k = keys.length > 0 ? keys[0] : k;
        const value = _MsgHdrsImpl.validHeaderValue(v);
        let a = this.headers.get(k);
        if (!a) {
          a = [];
          this.headers.set(k, a);
        }
        a.push(value);
      }
      values(k, match2 = core_1.Match.Exact) {
        const buf = [];
        const keys = this.findKeys(k, match2);
        keys.forEach((v) => {
          const values = this.headers.get(v);
          if (values) {
            buf.push(...values);
          }
        });
        return buf;
      }
      delete(k, match2 = core_1.Match.Exact) {
        const keys = this.findKeys(k, match2);
        keys.forEach((v) => {
          this.headers.delete(v);
        });
      }
      get hasError() {
        return this._code >= 300;
      }
      get status() {
        return `${this._code} ${this._description}`.trim();
      }
      toRecord() {
        const data = {};
        this.keys().forEach((v) => {
          data[v] = this.values(v);
        });
        return data;
      }
      get code() {
        return this._code;
      }
      get description() {
        return this._description;
      }
      static fromRecord(r) {
        const h2 = new _MsgHdrsImpl();
        for (const k in r) {
          h2.headers.set(k, r[k]);
        }
        return h2;
      }
    };
    exports2.MsgHdrsImpl = MsgHdrsImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/codec.js
var require_codec = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/codec.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StringCodec = StringCodec;
    exports2.JSONCodec = JSONCodec;
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    function StringCodec() {
      return {
        encode(d) {
          return encoders_1.TE.encode(d);
        },
        decode(a) {
          return encoders_1.TD.decode(a);
        }
      };
    }
    function JSONCodec(reviver) {
      return {
        encode(d) {
          try {
            if (d === void 0) {
              d = null;
            }
            return encoders_1.TE.encode(JSON.stringify(d));
          } catch (err2) {
            throw core_1.NatsError.errorForCode(core_1.ErrorCode.BadJson, err2);
          }
        },
        decode(a) {
          try {
            return JSON.parse(encoders_1.TD.decode(a), reviver);
          } catch (err2) {
            throw core_1.NatsError.errorForCode(core_1.ErrorCode.BadJson, err2);
          }
        }
      };
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/msg.js
var require_msg = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/msg.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MsgImpl = void 0;
    exports2.isRequestError = isRequestError;
    var headers_1 = require_headers();
    var encoders_1 = require_encoders();
    var codec_1 = require_codec();
    var core_1 = require_core();
    function isRequestError(msg) {
      var _a2;
      if (msg && msg.data.length === 0 && ((_a2 = msg.headers) === null || _a2 === void 0 ? void 0 : _a2.code) === 503) {
        return core_1.NatsError.errorForCode(core_1.ErrorCode.NoResponders);
      }
      return null;
    }
    var MsgImpl = class {
      constructor(msg, data, publisher) {
        this._msg = msg;
        this._rdata = data;
        this.publisher = publisher;
      }
      get subject() {
        if (this._subject) {
          return this._subject;
        }
        this._subject = encoders_1.TD.decode(this._msg.subject);
        return this._subject;
      }
      get reply() {
        if (this._reply) {
          return this._reply;
        }
        this._reply = encoders_1.TD.decode(this._msg.reply);
        return this._reply;
      }
      get sid() {
        return this._msg.sid;
      }
      get headers() {
        if (this._msg.hdr > -1 && !this._headers) {
          const buf = this._rdata.subarray(0, this._msg.hdr);
          this._headers = headers_1.MsgHdrsImpl.decode(buf);
        }
        return this._headers;
      }
      get data() {
        if (!this._rdata) {
          return new Uint8Array(0);
        }
        return this._msg.hdr > -1 ? this._rdata.subarray(this._msg.hdr) : this._rdata;
      }
      // eslint-ignore-next-line @typescript-eslint/no-explicit-any
      respond(data = encoders_1.Empty, opts) {
        if (this.reply) {
          this.publisher.publish(this.reply, data, opts);
          return true;
        }
        return false;
      }
      size() {
        var _a2;
        const subj = this._msg.subject.length;
        const reply = ((_a2 = this._msg.reply) === null || _a2 === void 0 ? void 0 : _a2.length) || 0;
        const payloadAndHeaders = this._msg.size === -1 ? 0 : this._msg.size;
        return subj + reply + payloadAndHeaders;
      }
      json(reviver) {
        return (0, codec_1.JSONCodec)(reviver).decode(this.data);
      }
      string() {
        return encoders_1.TD.decode(this.data);
      }
      requestInfo() {
        var _a2;
        const v = (_a2 = this.headers) === null || _a2 === void 0 ? void 0 : _a2.get("Nats-Request-Info");
        if (v) {
          return JSON.parse(v, function(key, value) {
            if ((key === "start" || key === "stop") && value !== "") {
              return new Date(Date.parse(value));
            }
            return value;
          });
        }
        return null;
      }
    };
    exports2.MsgImpl = MsgImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/muxsubscription.js
var require_muxsubscription = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/muxsubscription.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MuxSubscription = void 0;
    var msg_1 = require_msg();
    var core_1 = require_core();
    var MuxSubscription = class {
      constructor() {
        this.reqs = /* @__PURE__ */ new Map();
      }
      size() {
        return this.reqs.size;
      }
      init(prefix) {
        this.baseInbox = `${(0, core_1.createInbox)(prefix)}.`;
        return this.baseInbox;
      }
      add(r) {
        if (!isNaN(r.received)) {
          r.received = 0;
        }
        this.reqs.set(r.token, r);
      }
      get(token) {
        return this.reqs.get(token);
      }
      cancel(r) {
        this.reqs.delete(r.token);
      }
      getToken(m) {
        const s = m.subject || "";
        if (s.indexOf(this.baseInbox) === 0) {
          return s.substring(this.baseInbox.length);
        }
        return null;
      }
      all() {
        return Array.from(this.reqs.values());
      }
      handleError(isMuxPermissionError, err2) {
        if (err2 && err2.permissionContext) {
          if (isMuxPermissionError) {
            this.all().forEach((r) => {
              r.resolver(err2, {});
            });
            return true;
          }
          const ctx = err2.permissionContext;
          if (ctx.operation === "publish") {
            const req = this.all().find((s) => {
              return s.requestSubject === ctx.subject;
            });
            if (req) {
              req.resolver(err2, {});
              return true;
            }
          }
        }
        return false;
      }
      dispatcher() {
        return (err2, m) => {
          const token = this.getToken(m);
          if (token) {
            const r = this.get(token);
            if (r) {
              if (err2 === null && m.headers) {
                err2 = (0, msg_1.isRequestError)(m);
              }
              r.resolver(err2, m);
            }
          }
        };
      }
      close() {
        const err2 = core_1.NatsError.errorForCode(core_1.ErrorCode.Timeout);
        this.reqs.forEach((req) => {
          req.resolver(err2, {});
        });
      }
    };
    exports2.MuxSubscription = MuxSubscription;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/heartbeats.js
var require_heartbeats = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/heartbeats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Heartbeat = void 0;
    var util_1 = require_util();
    var core_1 = require_core();
    var Heartbeat = class {
      constructor(ph, interval, maxOut) {
        this.ph = ph;
        this.interval = interval;
        this.maxOut = maxOut;
        this.pendings = [];
      }
      // api to start the heartbeats, since this can be
      // spuriously called from dial, ensure we don't
      // leak timers
      start() {
        this.cancel();
        this._schedule();
      }
      // api for canceling the heartbeats, if stale is
      // true it will initiate a client disconnect
      cancel(stale) {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = void 0;
        }
        this._reset();
        if (stale) {
          this.ph.disconnect();
        }
      }
      _schedule() {
        this.timer = setTimeout(() => {
          this.ph.dispatchStatus({ type: core_1.DebugEvents.PingTimer, data: `${this.pendings.length + 1}` });
          if (this.pendings.length === this.maxOut) {
            this.cancel(true);
            return;
          }
          const ping = (0, util_1.deferred)();
          this.ph.flush(ping).then(() => {
            this._reset();
          }).catch(() => {
            this.cancel();
          });
          this.pendings.push(ping);
          this._schedule();
        }, this.interval);
      }
      _reset() {
        this.pendings = this.pendings.filter((p) => {
          const d = p;
          d.resolve();
          return false;
        });
      }
    };
    exports2.Heartbeat = Heartbeat;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/denobuffer.js
var require_denobuffer = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/denobuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DenoBuffer = exports2.MAX_SIZE = exports2.AssertionError = void 0;
    exports2.assert = assert;
    exports2.concat = concat;
    exports2.append = append;
    exports2.readAll = readAll;
    exports2.writeAll = writeAll;
    var encoders_1 = require_encoders();
    var AssertionError = class extends Error {
      constructor(msg) {
        super(msg);
        this.name = "AssertionError";
      }
    };
    exports2.AssertionError = AssertionError;
    function assert(cond, msg = "Assertion failed.") {
      if (!cond) {
        throw new AssertionError(msg);
      }
    }
    var MIN_READ = 32 * 1024;
    exports2.MAX_SIZE = Math.pow(2, 32) - 2;
    function copy(src, dst, off = 0) {
      const r = dst.byteLength - off;
      if (src.byteLength > r) {
        src = src.subarray(0, r);
      }
      dst.set(src, off);
      return src.byteLength;
    }
    function concat(origin, b) {
      if (origin === void 0 && b === void 0) {
        return new Uint8Array(0);
      }
      if (origin === void 0) {
        return b;
      }
      if (b === void 0) {
        return origin;
      }
      const output = new Uint8Array(origin.length + b.length);
      output.set(origin, 0);
      output.set(b, origin.length);
      return output;
    }
    function append(origin, b) {
      return concat(origin, Uint8Array.of(b));
    }
    var DenoBuffer = class {
      constructor(ab) {
        this._off = 0;
        if (ab == null) {
          this._buf = new Uint8Array(0);
          return;
        }
        this._buf = new Uint8Array(ab);
      }
      bytes(options = { copy: true }) {
        if (options.copy === false)
          return this._buf.subarray(this._off);
        return this._buf.slice(this._off);
      }
      empty() {
        return this._buf.byteLength <= this._off;
      }
      get length() {
        return this._buf.byteLength - this._off;
      }
      get capacity() {
        return this._buf.buffer.byteLength;
      }
      truncate(n) {
        if (n === 0) {
          this.reset();
          return;
        }
        if (n < 0 || n > this.length) {
          throw Error("bytes.Buffer: truncation out of range");
        }
        this._reslice(this._off + n);
      }
      reset() {
        this._reslice(0);
        this._off = 0;
      }
      _tryGrowByReslice(n) {
        const l = this._buf.byteLength;
        if (n <= this.capacity - l) {
          this._reslice(l + n);
          return l;
        }
        return -1;
      }
      _reslice(len) {
        assert(len <= this._buf.buffer.byteLength);
        this._buf = new Uint8Array(this._buf.buffer, 0, len);
      }
      readByte() {
        const a = new Uint8Array(1);
        if (this.read(a)) {
          return a[0];
        }
        return null;
      }
      read(p) {
        if (this.empty()) {
          this.reset();
          if (p.byteLength === 0) {
            return 0;
          }
          return null;
        }
        const nread = copy(this._buf.subarray(this._off), p);
        this._off += nread;
        return nread;
      }
      writeByte(n) {
        return this.write(Uint8Array.of(n));
      }
      writeString(s) {
        return this.write(encoders_1.TE.encode(s));
      }
      write(p) {
        const m = this._grow(p.byteLength);
        return copy(p, this._buf, m);
      }
      _grow(n) {
        const m = this.length;
        if (m === 0 && this._off !== 0) {
          this.reset();
        }
        const i = this._tryGrowByReslice(n);
        if (i >= 0) {
          return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
          copy(this._buf.subarray(this._off), this._buf);
        } else if (c + n > exports2.MAX_SIZE) {
          throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
          const buf = new Uint8Array(Math.min(2 * c + n, exports2.MAX_SIZE));
          copy(this._buf.subarray(this._off), buf);
          this._buf = buf;
        }
        this._off = 0;
        this._reslice(Math.min(m + n, exports2.MAX_SIZE));
        return m;
      }
      grow(n) {
        if (n < 0) {
          throw Error("Buffer._grow: negative count");
        }
        const m = this._grow(n);
        this._reslice(m);
      }
      readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while (true) {
          const shouldGrow = this.capacity - this.length < MIN_READ;
          const buf = shouldGrow ? tmp : new Uint8Array(this._buf.buffer, this.length);
          const nread = r.read(buf);
          if (nread === null) {
            return n;
          }
          if (shouldGrow)
            this.write(buf.subarray(0, nread));
          else
            this._reslice(this.length + nread);
          n += nread;
        }
      }
    };
    exports2.DenoBuffer = DenoBuffer;
    function readAll(r) {
      const buf = new DenoBuffer();
      buf.readFrom(r);
      return buf.bytes();
    }
    function writeAll(w, arr) {
      let nwritten = 0;
      while (nwritten < arr.length) {
        nwritten += w.write(arr.subarray(nwritten));
      }
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/parser.js
var require_parser = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.State = exports2.Parser = exports2.Kind = void 0;
    exports2.describe = describe;
    var denobuffer_1 = require_denobuffer();
    var encoders_1 = require_encoders();
    var Kind;
    (function(Kind2) {
      Kind2[Kind2["OK"] = 0] = "OK";
      Kind2[Kind2["ERR"] = 1] = "ERR";
      Kind2[Kind2["MSG"] = 2] = "MSG";
      Kind2[Kind2["INFO"] = 3] = "INFO";
      Kind2[Kind2["PING"] = 4] = "PING";
      Kind2[Kind2["PONG"] = 5] = "PONG";
    })(Kind || (exports2.Kind = Kind = {}));
    function describe(e) {
      let ks;
      let data = "";
      switch (e.kind) {
        case Kind.MSG:
          ks = "MSG";
          break;
        case Kind.OK:
          ks = "OK";
          break;
        case Kind.ERR:
          ks = "ERR";
          data = encoders_1.TD.decode(e.data);
          break;
        case Kind.PING:
          ks = "PING";
          break;
        case Kind.PONG:
          ks = "PONG";
          break;
        case Kind.INFO:
          ks = "INFO";
          data = encoders_1.TD.decode(e.data);
      }
      return `${ks}: ${data}`;
    }
    function newMsgArg() {
      const ma = {};
      ma.sid = -1;
      ma.hdr = -1;
      ma.size = -1;
      return ma;
    }
    var ASCII_0 = 48;
    var ASCII_9 = 57;
    var Parser = class {
      constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.state = State.OP_START;
        this.as = 0;
        this.drop = 0;
        this.hdr = 0;
      }
      parse(buf) {
        let i;
        for (i = 0; i < buf.length; i++) {
          const b = buf[i];
          switch (this.state) {
            case State.OP_START:
              switch (b) {
                case cc.M:
                case cc.m:
                  this.state = State.OP_M;
                  this.hdr = -1;
                  this.ma = newMsgArg();
                  break;
                case cc.H:
                case cc.h:
                  this.state = State.OP_H;
                  this.hdr = 0;
                  this.ma = newMsgArg();
                  break;
                case cc.P:
                case cc.p:
                  this.state = State.OP_P;
                  break;
                case cc.PLUS:
                  this.state = State.OP_PLUS;
                  break;
                case cc.MINUS:
                  this.state = State.OP_MINUS;
                  break;
                case cc.I:
                case cc.i:
                  this.state = State.OP_I;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_H:
              switch (b) {
                case cc.M:
                case cc.m:
                  this.state = State.OP_M;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_M:
              switch (b) {
                case cc.S:
                case cc.s:
                  this.state = State.OP_MS;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_MS:
              switch (b) {
                case cc.G:
                case cc.g:
                  this.state = State.OP_MSG;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_MSG:
              switch (b) {
                case cc.SPACE:
                case cc.TAB:
                  this.state = State.OP_MSG_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_MSG_SPC:
              switch (b) {
                case cc.SPACE:
                case cc.TAB:
                  continue;
                default:
                  this.state = State.MSG_ARG;
                  this.as = i;
              }
              break;
            case State.MSG_ARG:
              switch (b) {
                case cc.CR:
                  this.drop = 1;
                  break;
                case cc.NL: {
                  const arg = this.argBuf ? this.argBuf.bytes() : buf.subarray(this.as, i - this.drop);
                  this.processMsgArgs(arg);
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = State.MSG_PAYLOAD;
                  i = this.as + this.ma.size - 1;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.writeByte(b);
                  }
              }
              break;
            case State.MSG_PAYLOAD:
              if (this.msgBuf) {
                if (this.msgBuf.length >= this.ma.size) {
                  const data = this.msgBuf.bytes({ copy: false });
                  this.dispatcher.push({ kind: Kind.MSG, msg: this.ma, data });
                  this.argBuf = void 0;
                  this.msgBuf = void 0;
                  this.state = State.MSG_END;
                } else {
                  let toCopy = this.ma.size - this.msgBuf.length;
                  const avail = buf.length - i;
                  if (avail < toCopy) {
                    toCopy = avail;
                  }
                  if (toCopy > 0) {
                    this.msgBuf.write(buf.subarray(i, i + toCopy));
                    i = i + toCopy - 1;
                  } else {
                    this.msgBuf.writeByte(b);
                  }
                }
              } else if (i - this.as >= this.ma.size) {
                this.dispatcher.push({ kind: Kind.MSG, msg: this.ma, data: buf.subarray(this.as, i) });
                this.argBuf = void 0;
                this.msgBuf = void 0;
                this.state = State.MSG_END;
              }
              break;
            case State.MSG_END:
              switch (b) {
                case cc.NL:
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = State.OP_START;
                  break;
                default:
                  continue;
              }
              break;
            case State.OP_PLUS:
              switch (b) {
                case cc.O:
                case cc.o:
                  this.state = State.OP_PLUS_O;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_PLUS_O:
              switch (b) {
                case cc.K:
                case cc.k:
                  this.state = State.OP_PLUS_OK;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_PLUS_OK:
              switch (b) {
                case cc.NL:
                  this.dispatcher.push({ kind: Kind.OK });
                  this.drop = 0;
                  this.state = State.OP_START;
                  break;
              }
              break;
            case State.OP_MINUS:
              switch (b) {
                case cc.E:
                case cc.e:
                  this.state = State.OP_MINUS_E;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_MINUS_E:
              switch (b) {
                case cc.R:
                case cc.r:
                  this.state = State.OP_MINUS_ER;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_MINUS_ER:
              switch (b) {
                case cc.R:
                case cc.r:
                  this.state = State.OP_MINUS_ERR;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_MINUS_ERR:
              switch (b) {
                case cc.SPACE:
                case cc.TAB:
                  this.state = State.OP_MINUS_ERR_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_MINUS_ERR_SPC:
              switch (b) {
                case cc.SPACE:
                case cc.TAB:
                  continue;
                default:
                  this.state = State.MINUS_ERR_ARG;
                  this.as = i;
              }
              break;
            case State.MINUS_ERR_ARG:
              switch (b) {
                case cc.CR:
                  this.drop = 1;
                  break;
                case cc.NL: {
                  let arg;
                  if (this.argBuf) {
                    arg = this.argBuf.bytes();
                    this.argBuf = void 0;
                  } else {
                    arg = buf.subarray(this.as, i - this.drop);
                  }
                  this.dispatcher.push({ kind: Kind.ERR, data: arg });
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = State.OP_START;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.write(Uint8Array.of(b));
                  }
              }
              break;
            case State.OP_P:
              switch (b) {
                case cc.I:
                case cc.i:
                  this.state = State.OP_PI;
                  break;
                case cc.O:
                case cc.o:
                  this.state = State.OP_PO;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_PO:
              switch (b) {
                case cc.N:
                case cc.n:
                  this.state = State.OP_PON;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_PON:
              switch (b) {
                case cc.G:
                case cc.g:
                  this.state = State.OP_PONG;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_PONG:
              switch (b) {
                case cc.NL:
                  this.dispatcher.push({ kind: Kind.PONG });
                  this.drop = 0;
                  this.state = State.OP_START;
                  break;
              }
              break;
            case State.OP_PI:
              switch (b) {
                case cc.N:
                case cc.n:
                  this.state = State.OP_PIN;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_PIN:
              switch (b) {
                case cc.G:
                case cc.g:
                  this.state = State.OP_PING;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_PING:
              switch (b) {
                case cc.NL:
                  this.dispatcher.push({ kind: Kind.PING });
                  this.drop = 0;
                  this.state = State.OP_START;
                  break;
              }
              break;
            case State.OP_I:
              switch (b) {
                case cc.N:
                case cc.n:
                  this.state = State.OP_IN;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_IN:
              switch (b) {
                case cc.F:
                case cc.f:
                  this.state = State.OP_INF;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_INF:
              switch (b) {
                case cc.O:
                case cc.o:
                  this.state = State.OP_INFO;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_INFO:
              switch (b) {
                case cc.SPACE:
                case cc.TAB:
                  this.state = State.OP_INFO_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case State.OP_INFO_SPC:
              switch (b) {
                case cc.SPACE:
                case cc.TAB:
                  continue;
                default:
                  this.state = State.INFO_ARG;
                  this.as = i;
              }
              break;
            case State.INFO_ARG:
              switch (b) {
                case cc.CR:
                  this.drop = 1;
                  break;
                case cc.NL: {
                  let arg;
                  if (this.argBuf) {
                    arg = this.argBuf.bytes();
                    this.argBuf = void 0;
                  } else {
                    arg = buf.subarray(this.as, i - this.drop);
                  }
                  this.dispatcher.push({ kind: Kind.INFO, data: arg });
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = State.OP_START;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.writeByte(b);
                  }
              }
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
        }
        if ((this.state === State.MSG_ARG || this.state === State.MINUS_ERR_ARG || this.state === State.INFO_ARG) && !this.argBuf) {
          this.argBuf = new denobuffer_1.DenoBuffer(buf.subarray(this.as, i - this.drop));
        }
        if (this.state === State.MSG_PAYLOAD && !this.msgBuf) {
          if (!this.argBuf) {
            this.cloneMsgArg();
          }
          this.msgBuf = new denobuffer_1.DenoBuffer(buf.subarray(this.as));
        }
      }
      cloneMsgArg() {
        const s = this.ma.subject.length;
        const r = this.ma.reply ? this.ma.reply.length : 0;
        const buf = new Uint8Array(s + r);
        buf.set(this.ma.subject);
        if (this.ma.reply) {
          buf.set(this.ma.reply, s);
        }
        this.argBuf = new denobuffer_1.DenoBuffer(buf);
        this.ma.subject = buf.subarray(0, s);
        if (this.ma.reply) {
          this.ma.reply = buf.subarray(s);
        }
      }
      processMsgArgs(arg) {
        if (this.hdr >= 0) {
          return this.processHeaderMsgArgs(arg);
        }
        const args = [];
        let start = -1;
        for (let i = 0; i < arg.length; i++) {
          const b = arg[i];
          switch (b) {
            case cc.SPACE:
            case cc.TAB:
            case cc.CR:
            case cc.NL:
              if (start >= 0) {
                args.push(arg.subarray(start, i));
                start = -1;
              }
              break;
            default:
              if (start < 0) {
                start = i;
              }
          }
        }
        if (start >= 0) {
          args.push(arg.subarray(start));
        }
        switch (args.length) {
          case 3:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = void 0;
            this.ma.size = this.protoParseInt(args[2]);
            break;
          case 4:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = args[2];
            this.ma.size = this.protoParseInt(args[3]);
            break;
          default:
            throw this.fail(arg, "processMsgArgs Parse Error");
        }
        if (this.ma.sid < 0) {
          throw this.fail(arg, "processMsgArgs Bad or Missing Sid Error");
        }
        if (this.ma.size < 0) {
          throw this.fail(arg, "processMsgArgs Bad or Missing Size Error");
        }
      }
      fail(data, label = "") {
        if (!label) {
          label = `parse error [${this.state}]`;
        } else {
          label = `${label} [${this.state}]`;
        }
        return new Error(`${label}: ${encoders_1.TD.decode(data)}`);
      }
      processHeaderMsgArgs(arg) {
        const args = [];
        let start = -1;
        for (let i = 0; i < arg.length; i++) {
          const b = arg[i];
          switch (b) {
            case cc.SPACE:
            case cc.TAB:
            case cc.CR:
            case cc.NL:
              if (start >= 0) {
                args.push(arg.subarray(start, i));
                start = -1;
              }
              break;
            default:
              if (start < 0) {
                start = i;
              }
          }
        }
        if (start >= 0) {
          args.push(arg.subarray(start));
        }
        switch (args.length) {
          case 4:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = void 0;
            this.ma.hdr = this.protoParseInt(args[2]);
            this.ma.size = this.protoParseInt(args[3]);
            break;
          case 5:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = args[2];
            this.ma.hdr = this.protoParseInt(args[3]);
            this.ma.size = this.protoParseInt(args[4]);
            break;
          default:
            throw this.fail(arg, "processHeaderMsgArgs Parse Error");
        }
        if (this.ma.sid < 0) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Sid Error");
        }
        if (this.ma.hdr < 0 || this.ma.hdr > this.ma.size) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Header Size Error");
        }
        if (this.ma.size < 0) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Size Error");
        }
      }
      protoParseInt(a) {
        if (a.length === 0) {
          return -1;
        }
        let n = 0;
        for (let i = 0; i < a.length; i++) {
          if (a[i] < ASCII_0 || a[i] > ASCII_9) {
            return -1;
          }
          n = n * 10 + (a[i] - ASCII_0);
        }
        return n;
      }
    };
    exports2.Parser = Parser;
    var State;
    (function(State2) {
      State2[State2["OP_START"] = 0] = "OP_START";
      State2[State2["OP_PLUS"] = 1] = "OP_PLUS";
      State2[State2["OP_PLUS_O"] = 2] = "OP_PLUS_O";
      State2[State2["OP_PLUS_OK"] = 3] = "OP_PLUS_OK";
      State2[State2["OP_MINUS"] = 4] = "OP_MINUS";
      State2[State2["OP_MINUS_E"] = 5] = "OP_MINUS_E";
      State2[State2["OP_MINUS_ER"] = 6] = "OP_MINUS_ER";
      State2[State2["OP_MINUS_ERR"] = 7] = "OP_MINUS_ERR";
      State2[State2["OP_MINUS_ERR_SPC"] = 8] = "OP_MINUS_ERR_SPC";
      State2[State2["MINUS_ERR_ARG"] = 9] = "MINUS_ERR_ARG";
      State2[State2["OP_M"] = 10] = "OP_M";
      State2[State2["OP_MS"] = 11] = "OP_MS";
      State2[State2["OP_MSG"] = 12] = "OP_MSG";
      State2[State2["OP_MSG_SPC"] = 13] = "OP_MSG_SPC";
      State2[State2["MSG_ARG"] = 14] = "MSG_ARG";
      State2[State2["MSG_PAYLOAD"] = 15] = "MSG_PAYLOAD";
      State2[State2["MSG_END"] = 16] = "MSG_END";
      State2[State2["OP_H"] = 17] = "OP_H";
      State2[State2["OP_P"] = 18] = "OP_P";
      State2[State2["OP_PI"] = 19] = "OP_PI";
      State2[State2["OP_PIN"] = 20] = "OP_PIN";
      State2[State2["OP_PING"] = 21] = "OP_PING";
      State2[State2["OP_PO"] = 22] = "OP_PO";
      State2[State2["OP_PON"] = 23] = "OP_PON";
      State2[State2["OP_PONG"] = 24] = "OP_PONG";
      State2[State2["OP_I"] = 25] = "OP_I";
      State2[State2["OP_IN"] = 26] = "OP_IN";
      State2[State2["OP_INF"] = 27] = "OP_INF";
      State2[State2["OP_INFO"] = 28] = "OP_INFO";
      State2[State2["OP_INFO_SPC"] = 29] = "OP_INFO_SPC";
      State2[State2["INFO_ARG"] = 30] = "INFO_ARG";
    })(State || (exports2.State = State = {}));
    var cc;
    (function(cc2) {
      cc2[cc2["CR"] = "\r".charCodeAt(0)] = "CR";
      cc2[cc2["E"] = "E".charCodeAt(0)] = "E";
      cc2[cc2["e"] = "e".charCodeAt(0)] = "e";
      cc2[cc2["F"] = "F".charCodeAt(0)] = "F";
      cc2[cc2["f"] = "f".charCodeAt(0)] = "f";
      cc2[cc2["G"] = "G".charCodeAt(0)] = "G";
      cc2[cc2["g"] = "g".charCodeAt(0)] = "g";
      cc2[cc2["H"] = "H".charCodeAt(0)] = "H";
      cc2[cc2["h"] = "h".charCodeAt(0)] = "h";
      cc2[cc2["I"] = "I".charCodeAt(0)] = "I";
      cc2[cc2["i"] = "i".charCodeAt(0)] = "i";
      cc2[cc2["K"] = "K".charCodeAt(0)] = "K";
      cc2[cc2["k"] = "k".charCodeAt(0)] = "k";
      cc2[cc2["M"] = "M".charCodeAt(0)] = "M";
      cc2[cc2["m"] = "m".charCodeAt(0)] = "m";
      cc2[cc2["MINUS"] = "-".charCodeAt(0)] = "MINUS";
      cc2[cc2["N"] = "N".charCodeAt(0)] = "N";
      cc2[cc2["n"] = "n".charCodeAt(0)] = "n";
      cc2[cc2["NL"] = "\n".charCodeAt(0)] = "NL";
      cc2[cc2["O"] = "O".charCodeAt(0)] = "O";
      cc2[cc2["o"] = "o".charCodeAt(0)] = "o";
      cc2[cc2["P"] = "P".charCodeAt(0)] = "P";
      cc2[cc2["p"] = "p".charCodeAt(0)] = "p";
      cc2[cc2["PLUS"] = "+".charCodeAt(0)] = "PLUS";
      cc2[cc2["R"] = "R".charCodeAt(0)] = "R";
      cc2[cc2["r"] = "r".charCodeAt(0)] = "r";
      cc2[cc2["S"] = "S".charCodeAt(0)] = "S";
      cc2[cc2["s"] = "s".charCodeAt(0)] = "s";
      cc2[cc2["SPACE"] = " ".charCodeAt(0)] = "SPACE";
      cc2[cc2["TAB"] = "	".charCodeAt(0)] = "TAB";
    })(cc || (cc = {}));
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/semver.js
var require_semver = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/semver.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Features = exports2.Feature = void 0;
    exports2.parseSemVer = parseSemVer;
    exports2.compare = compare;
    function parseSemVer(s = "") {
      const m = s.match(/(\d+).(\d+).(\d+)/);
      if (m) {
        return {
          major: parseInt(m[1]),
          minor: parseInt(m[2]),
          micro: parseInt(m[3])
        };
      }
      throw new Error(`'${s}' is not a semver value`);
    }
    function compare(a, b) {
      if (a.major < b.major)
        return -1;
      if (a.major > b.major)
        return 1;
      if (a.minor < b.minor)
        return -1;
      if (a.minor > b.minor)
        return 1;
      if (a.micro < b.micro)
        return -1;
      if (a.micro > b.micro)
        return 1;
      return 0;
    }
    var Feature;
    (function(Feature2) {
      Feature2["JS_KV"] = "js_kv";
      Feature2["JS_OBJECTSTORE"] = "js_objectstore";
      Feature2["JS_PULL_MAX_BYTES"] = "js_pull_max_bytes";
      Feature2["JS_NEW_CONSUMER_CREATE_API"] = "js_new_consumer_create";
      Feature2["JS_ALLOW_DIRECT"] = "js_allow_direct";
      Feature2["JS_MULTIPLE_CONSUMER_FILTER"] = "js_multiple_consumer_filter";
      Feature2["JS_SIMPLIFICATION"] = "js_simplification";
      Feature2["JS_STREAM_CONSUMER_METADATA"] = "js_stream_consumer_metadata";
      Feature2["JS_CONSUMER_FILTER_SUBJECTS"] = "js_consumer_filter_subjects";
      Feature2["JS_STREAM_FIRST_SEQ"] = "js_stream_first_seq";
      Feature2["JS_STREAM_SUBJECT_TRANSFORM"] = "js_stream_subject_transform";
      Feature2["JS_STREAM_SOURCE_SUBJECT_TRANSFORM"] = "js_stream_source_subject_transform";
      Feature2["JS_STREAM_COMPRESSION"] = "js_stream_compression";
      Feature2["JS_DEFAULT_CONSUMER_LIMITS"] = "js_default_consumer_limits";
      Feature2["JS_BATCH_DIRECT_GET"] = "js_batch_direct_get";
    })(Feature || (exports2.Feature = Feature = {}));
    var Features = class {
      constructor(v) {
        this.features = /* @__PURE__ */ new Map();
        this.disabled = [];
        this.update(v);
      }
      /**
       * Removes all disabled entries
       */
      resetDisabled() {
        this.disabled.length = 0;
        this.update(this.server);
      }
      /**
       * Disables a particular feature.
       * @param f
       */
      disable(f) {
        this.disabled.push(f);
        this.update(this.server);
      }
      isDisabled(f) {
        return this.disabled.indexOf(f) !== -1;
      }
      update(v) {
        if (typeof v === "string") {
          v = parseSemVer(v);
        }
        this.server = v;
        this.set(Feature.JS_KV, "2.6.2");
        this.set(Feature.JS_OBJECTSTORE, "2.6.3");
        this.set(Feature.JS_PULL_MAX_BYTES, "2.8.3");
        this.set(Feature.JS_NEW_CONSUMER_CREATE_API, "2.9.0");
        this.set(Feature.JS_ALLOW_DIRECT, "2.9.0");
        this.set(Feature.JS_MULTIPLE_CONSUMER_FILTER, "2.10.0");
        this.set(Feature.JS_SIMPLIFICATION, "2.9.4");
        this.set(Feature.JS_STREAM_CONSUMER_METADATA, "2.10.0");
        this.set(Feature.JS_CONSUMER_FILTER_SUBJECTS, "2.10.0");
        this.set(Feature.JS_STREAM_FIRST_SEQ, "2.10.0");
        this.set(Feature.JS_STREAM_SUBJECT_TRANSFORM, "2.10.0");
        this.set(Feature.JS_STREAM_SOURCE_SUBJECT_TRANSFORM, "2.10.0");
        this.set(Feature.JS_STREAM_COMPRESSION, "2.10.0");
        this.set(Feature.JS_DEFAULT_CONSUMER_LIMITS, "2.10.0");
        this.set(Feature.JS_BATCH_DIRECT_GET, "2.11.0");
        this.disabled.forEach((f) => {
          this.features.delete(f);
        });
      }
      /**
       * Register a feature that requires a particular server version.
       * @param f
       * @param requires
       */
      set(f, requires) {
        this.features.set(f, {
          min: requires,
          ok: compare(this.server, parseSemVer(requires)) >= 0
        });
      }
      /**
       * Returns whether the feature is available and the min server
       * version that supports it.
       * @param f
       */
      get(f) {
        return this.features.get(f) || { min: "unknown", ok: false };
      }
      /**
       * Returns true if the feature is supported
       * @param f
       */
      supports(f) {
        var _a2;
        return ((_a2 = this.get(f)) === null || _a2 === void 0 ? void 0 : _a2.ok) || false;
      }
      /**
       * Returns true if the server is at least the specified version
       * @param v
       */
      require(v) {
        if (typeof v === "string") {
          v = parseSemVer(v);
        }
        return compare(this.server, v) >= 0;
      }
    };
    exports2.Features = Features;
  }
});

// node_modules/.pnpm/tweetnacl@1.0.3/node_modules/tweetnacl/nacl-fast.js
var require_nacl_fast = __commonJS({
  "node_modules/.pnpm/tweetnacl@1.0.3/node_modules/tweetnacl/nacl-fast.js"(exports2, module2) {
    (function(nacl) {
      "use strict";
      var gf = function(init) {
        var i, r = new Float64Array(16);
        if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
        return r;
      };
      var randombytes = function() {
        throw new Error("no PRNG");
      };
      var _0 = new Uint8Array(16);
      var _9 = new Uint8Array(32);
      _9[0] = 9;
      var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D = gf([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]), D2 = gf([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]), X = gf([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]), Y = gf([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]), I2 = gf([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
      function ts64(x, i, h2, l) {
        x[i] = h2 >> 24 & 255;
        x[i + 1] = h2 >> 16 & 255;
        x[i + 2] = h2 >> 8 & 255;
        x[i + 3] = h2 & 255;
        x[i + 4] = l >> 24 & 255;
        x[i + 5] = l >> 16 & 255;
        x[i + 6] = l >> 8 & 255;
        x[i + 7] = l & 255;
      }
      function vn(x, xi, y, yi, n) {
        var i, d = 0;
        for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
        return (1 & d - 1 >>> 8) - 1;
      }
      function crypto_verify_16(x, xi, y, yi) {
        return vn(x, xi, y, yi, 16);
      }
      function crypto_verify_32(x, xi, y, yi) {
        return vn(x, xi, y, yi, 32);
      }
      function core_salsa20(o, p, k, c) {
        var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
        var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
        for (var i = 0; i < 20; i += 2) {
          u = x0 + x12 | 0;
          x4 ^= u << 7 | u >>> 32 - 7;
          u = x4 + x0 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x4 | 0;
          x12 ^= u << 13 | u >>> 32 - 13;
          u = x12 + x8 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x1 | 0;
          x9 ^= u << 7 | u >>> 32 - 7;
          u = x9 + x5 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x9 | 0;
          x1 ^= u << 13 | u >>> 32 - 13;
          u = x1 + x13 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x6 | 0;
          x14 ^= u << 7 | u >>> 32 - 7;
          u = x14 + x10 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x14 | 0;
          x6 ^= u << 13 | u >>> 32 - 13;
          u = x6 + x2 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x11 | 0;
          x3 ^= u << 7 | u >>> 32 - 7;
          u = x3 + x15 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x3 | 0;
          x11 ^= u << 13 | u >>> 32 - 13;
          u = x11 + x7 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
          u = x0 + x3 | 0;
          x1 ^= u << 7 | u >>> 32 - 7;
          u = x1 + x0 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x1 | 0;
          x3 ^= u << 13 | u >>> 32 - 13;
          u = x3 + x2 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x4 | 0;
          x6 ^= u << 7 | u >>> 32 - 7;
          u = x6 + x5 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x6 | 0;
          x4 ^= u << 13 | u >>> 32 - 13;
          u = x4 + x7 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x9 | 0;
          x11 ^= u << 7 | u >>> 32 - 7;
          u = x11 + x10 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x11 | 0;
          x9 ^= u << 13 | u >>> 32 - 13;
          u = x9 + x8 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x14 | 0;
          x12 ^= u << 7 | u >>> 32 - 7;
          u = x12 + x15 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x12 | 0;
          x14 ^= u << 13 | u >>> 32 - 13;
          u = x14 + x13 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
        }
        x0 = x0 + j0 | 0;
        x1 = x1 + j1 | 0;
        x2 = x2 + j2 | 0;
        x3 = x3 + j3 | 0;
        x4 = x4 + j4 | 0;
        x5 = x5 + j5 | 0;
        x6 = x6 + j6 | 0;
        x7 = x7 + j7 | 0;
        x8 = x8 + j8 | 0;
        x9 = x9 + j9 | 0;
        x10 = x10 + j10 | 0;
        x11 = x11 + j11 | 0;
        x12 = x12 + j12 | 0;
        x13 = x13 + j13 | 0;
        x14 = x14 + j14 | 0;
        x15 = x15 + j15 | 0;
        o[0] = x0 >>> 0 & 255;
        o[1] = x0 >>> 8 & 255;
        o[2] = x0 >>> 16 & 255;
        o[3] = x0 >>> 24 & 255;
        o[4] = x1 >>> 0 & 255;
        o[5] = x1 >>> 8 & 255;
        o[6] = x1 >>> 16 & 255;
        o[7] = x1 >>> 24 & 255;
        o[8] = x2 >>> 0 & 255;
        o[9] = x2 >>> 8 & 255;
        o[10] = x2 >>> 16 & 255;
        o[11] = x2 >>> 24 & 255;
        o[12] = x3 >>> 0 & 255;
        o[13] = x3 >>> 8 & 255;
        o[14] = x3 >>> 16 & 255;
        o[15] = x3 >>> 24 & 255;
        o[16] = x4 >>> 0 & 255;
        o[17] = x4 >>> 8 & 255;
        o[18] = x4 >>> 16 & 255;
        o[19] = x4 >>> 24 & 255;
        o[20] = x5 >>> 0 & 255;
        o[21] = x5 >>> 8 & 255;
        o[22] = x5 >>> 16 & 255;
        o[23] = x5 >>> 24 & 255;
        o[24] = x6 >>> 0 & 255;
        o[25] = x6 >>> 8 & 255;
        o[26] = x6 >>> 16 & 255;
        o[27] = x6 >>> 24 & 255;
        o[28] = x7 >>> 0 & 255;
        o[29] = x7 >>> 8 & 255;
        o[30] = x7 >>> 16 & 255;
        o[31] = x7 >>> 24 & 255;
        o[32] = x8 >>> 0 & 255;
        o[33] = x8 >>> 8 & 255;
        o[34] = x8 >>> 16 & 255;
        o[35] = x8 >>> 24 & 255;
        o[36] = x9 >>> 0 & 255;
        o[37] = x9 >>> 8 & 255;
        o[38] = x9 >>> 16 & 255;
        o[39] = x9 >>> 24 & 255;
        o[40] = x10 >>> 0 & 255;
        o[41] = x10 >>> 8 & 255;
        o[42] = x10 >>> 16 & 255;
        o[43] = x10 >>> 24 & 255;
        o[44] = x11 >>> 0 & 255;
        o[45] = x11 >>> 8 & 255;
        o[46] = x11 >>> 16 & 255;
        o[47] = x11 >>> 24 & 255;
        o[48] = x12 >>> 0 & 255;
        o[49] = x12 >>> 8 & 255;
        o[50] = x12 >>> 16 & 255;
        o[51] = x12 >>> 24 & 255;
        o[52] = x13 >>> 0 & 255;
        o[53] = x13 >>> 8 & 255;
        o[54] = x13 >>> 16 & 255;
        o[55] = x13 >>> 24 & 255;
        o[56] = x14 >>> 0 & 255;
        o[57] = x14 >>> 8 & 255;
        o[58] = x14 >>> 16 & 255;
        o[59] = x14 >>> 24 & 255;
        o[60] = x15 >>> 0 & 255;
        o[61] = x15 >>> 8 & 255;
        o[62] = x15 >>> 16 & 255;
        o[63] = x15 >>> 24 & 255;
      }
      function core_hsalsa20(o, p, k, c) {
        var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
        var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
        for (var i = 0; i < 20; i += 2) {
          u = x0 + x12 | 0;
          x4 ^= u << 7 | u >>> 32 - 7;
          u = x4 + x0 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x4 | 0;
          x12 ^= u << 13 | u >>> 32 - 13;
          u = x12 + x8 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x1 | 0;
          x9 ^= u << 7 | u >>> 32 - 7;
          u = x9 + x5 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x9 | 0;
          x1 ^= u << 13 | u >>> 32 - 13;
          u = x1 + x13 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x6 | 0;
          x14 ^= u << 7 | u >>> 32 - 7;
          u = x14 + x10 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x14 | 0;
          x6 ^= u << 13 | u >>> 32 - 13;
          u = x6 + x2 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x11 | 0;
          x3 ^= u << 7 | u >>> 32 - 7;
          u = x3 + x15 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x3 | 0;
          x11 ^= u << 13 | u >>> 32 - 13;
          u = x11 + x7 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
          u = x0 + x3 | 0;
          x1 ^= u << 7 | u >>> 32 - 7;
          u = x1 + x0 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x1 | 0;
          x3 ^= u << 13 | u >>> 32 - 13;
          u = x3 + x2 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x4 | 0;
          x6 ^= u << 7 | u >>> 32 - 7;
          u = x6 + x5 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x6 | 0;
          x4 ^= u << 13 | u >>> 32 - 13;
          u = x4 + x7 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x9 | 0;
          x11 ^= u << 7 | u >>> 32 - 7;
          u = x11 + x10 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x11 | 0;
          x9 ^= u << 13 | u >>> 32 - 13;
          u = x9 + x8 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x14 | 0;
          x12 ^= u << 7 | u >>> 32 - 7;
          u = x12 + x15 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x12 | 0;
          x14 ^= u << 13 | u >>> 32 - 13;
          u = x14 + x13 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
        }
        o[0] = x0 >>> 0 & 255;
        o[1] = x0 >>> 8 & 255;
        o[2] = x0 >>> 16 & 255;
        o[3] = x0 >>> 24 & 255;
        o[4] = x5 >>> 0 & 255;
        o[5] = x5 >>> 8 & 255;
        o[6] = x5 >>> 16 & 255;
        o[7] = x5 >>> 24 & 255;
        o[8] = x10 >>> 0 & 255;
        o[9] = x10 >>> 8 & 255;
        o[10] = x10 >>> 16 & 255;
        o[11] = x10 >>> 24 & 255;
        o[12] = x15 >>> 0 & 255;
        o[13] = x15 >>> 8 & 255;
        o[14] = x15 >>> 16 & 255;
        o[15] = x15 >>> 24 & 255;
        o[16] = x6 >>> 0 & 255;
        o[17] = x6 >>> 8 & 255;
        o[18] = x6 >>> 16 & 255;
        o[19] = x6 >>> 24 & 255;
        o[20] = x7 >>> 0 & 255;
        o[21] = x7 >>> 8 & 255;
        o[22] = x7 >>> 16 & 255;
        o[23] = x7 >>> 24 & 255;
        o[24] = x8 >>> 0 & 255;
        o[25] = x8 >>> 8 & 255;
        o[26] = x8 >>> 16 & 255;
        o[27] = x8 >>> 24 & 255;
        o[28] = x9 >>> 0 & 255;
        o[29] = x9 >>> 8 & 255;
        o[30] = x9 >>> 16 & 255;
        o[31] = x9 >>> 24 & 255;
      }
      function crypto_core_salsa20(out, inp, k, c) {
        core_salsa20(out, inp, k, c);
      }
      function crypto_core_hsalsa20(out, inp, k, c) {
        core_hsalsa20(out, inp, k, c);
      }
      var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
      function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
        var z = new Uint8Array(16), x = new Uint8Array(64);
        var u, i;
        for (i = 0; i < 16; i++) z[i] = 0;
        for (i = 0; i < 8; i++) z[i] = n[i];
        while (b >= 64) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < 64; i++) c[cpos + i] = m[mpos + i] ^ x[i];
          u = 1;
          for (i = 8; i < 16; i++) {
            u = u + (z[i] & 255) | 0;
            z[i] = u & 255;
            u >>>= 8;
          }
          b -= 64;
          cpos += 64;
          mpos += 64;
        }
        if (b > 0) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < b; i++) c[cpos + i] = m[mpos + i] ^ x[i];
        }
        return 0;
      }
      function crypto_stream_salsa20(c, cpos, b, n, k) {
        var z = new Uint8Array(16), x = new Uint8Array(64);
        var u, i;
        for (i = 0; i < 16; i++) z[i] = 0;
        for (i = 0; i < 8; i++) z[i] = n[i];
        while (b >= 64) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < 64; i++) c[cpos + i] = x[i];
          u = 1;
          for (i = 8; i < 16; i++) {
            u = u + (z[i] & 255) | 0;
            z[i] = u & 255;
            u >>>= 8;
          }
          b -= 64;
          cpos += 64;
        }
        if (b > 0) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < b; i++) c[cpos + i] = x[i];
        }
        return 0;
      }
      function crypto_stream(c, cpos, d, n, k) {
        var s = new Uint8Array(32);
        crypto_core_hsalsa20(s, n, k, sigma);
        var sn = new Uint8Array(8);
        for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
        return crypto_stream_salsa20(c, cpos, d, sn, s);
      }
      function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
        var s = new Uint8Array(32);
        crypto_core_hsalsa20(s, n, k, sigma);
        var sn = new Uint8Array(8);
        for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
        return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
      }
      var poly1305 = function(key) {
        this.buffer = new Uint8Array(16);
        this.r = new Uint16Array(10);
        this.h = new Uint16Array(10);
        this.pad = new Uint16Array(8);
        this.leftover = 0;
        this.fin = 0;
        var t0, t1, t2, t3, t4, t5, t6, t7;
        t0 = key[0] & 255 | (key[1] & 255) << 8;
        this.r[0] = t0 & 8191;
        t1 = key[2] & 255 | (key[3] & 255) << 8;
        this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
        t2 = key[4] & 255 | (key[5] & 255) << 8;
        this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
        t3 = key[6] & 255 | (key[7] & 255) << 8;
        this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
        t4 = key[8] & 255 | (key[9] & 255) << 8;
        this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
        this.r[5] = t4 >>> 1 & 8190;
        t5 = key[10] & 255 | (key[11] & 255) << 8;
        this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
        t6 = key[12] & 255 | (key[13] & 255) << 8;
        this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
        t7 = key[14] & 255 | (key[15] & 255) << 8;
        this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
        this.r[9] = t7 >>> 5 & 127;
        this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
        this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
        this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
        this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
        this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
        this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
        this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
        this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
      };
      poly1305.prototype.blocks = function(m, mpos, bytes) {
        var hibit = this.fin ? 0 : 1 << 11;
        var t0, t1, t2, t3, t4, t5, t6, t7, c;
        var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
        var h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
        var r0 = this.r[0], r1 = this.r[1], r2 = this.r[2], r3 = this.r[3], r4 = this.r[4], r5 = this.r[5], r6 = this.r[6], r7 = this.r[7], r8 = this.r[8], r9 = this.r[9];
        while (bytes >= 16) {
          t0 = m[mpos + 0] & 255 | (m[mpos + 1] & 255) << 8;
          h0 += t0 & 8191;
          t1 = m[mpos + 2] & 255 | (m[mpos + 3] & 255) << 8;
          h1 += (t0 >>> 13 | t1 << 3) & 8191;
          t2 = m[mpos + 4] & 255 | (m[mpos + 5] & 255) << 8;
          h2 += (t1 >>> 10 | t2 << 6) & 8191;
          t3 = m[mpos + 6] & 255 | (m[mpos + 7] & 255) << 8;
          h3 += (t2 >>> 7 | t3 << 9) & 8191;
          t4 = m[mpos + 8] & 255 | (m[mpos + 9] & 255) << 8;
          h4 += (t3 >>> 4 | t4 << 12) & 8191;
          h5 += t4 >>> 1 & 8191;
          t5 = m[mpos + 10] & 255 | (m[mpos + 11] & 255) << 8;
          h6 += (t4 >>> 14 | t5 << 2) & 8191;
          t6 = m[mpos + 12] & 255 | (m[mpos + 13] & 255) << 8;
          h7 += (t5 >>> 11 | t6 << 5) & 8191;
          t7 = m[mpos + 14] & 255 | (m[mpos + 15] & 255) << 8;
          h8 += (t6 >>> 8 | t7 << 8) & 8191;
          h9 += t7 >>> 5 | hibit;
          c = 0;
          d0 = c;
          d0 += h0 * r0;
          d0 += h1 * (5 * r9);
          d0 += h2 * (5 * r8);
          d0 += h3 * (5 * r7);
          d0 += h4 * (5 * r6);
          c = d0 >>> 13;
          d0 &= 8191;
          d0 += h5 * (5 * r5);
          d0 += h6 * (5 * r4);
          d0 += h7 * (5 * r3);
          d0 += h8 * (5 * r2);
          d0 += h9 * (5 * r1);
          c += d0 >>> 13;
          d0 &= 8191;
          d1 = c;
          d1 += h0 * r1;
          d1 += h1 * r0;
          d1 += h2 * (5 * r9);
          d1 += h3 * (5 * r8);
          d1 += h4 * (5 * r7);
          c = d1 >>> 13;
          d1 &= 8191;
          d1 += h5 * (5 * r6);
          d1 += h6 * (5 * r5);
          d1 += h7 * (5 * r4);
          d1 += h8 * (5 * r3);
          d1 += h9 * (5 * r2);
          c += d1 >>> 13;
          d1 &= 8191;
          d2 = c;
          d2 += h0 * r2;
          d2 += h1 * r1;
          d2 += h2 * r0;
          d2 += h3 * (5 * r9);
          d2 += h4 * (5 * r8);
          c = d2 >>> 13;
          d2 &= 8191;
          d2 += h5 * (5 * r7);
          d2 += h6 * (5 * r6);
          d2 += h7 * (5 * r5);
          d2 += h8 * (5 * r4);
          d2 += h9 * (5 * r3);
          c += d2 >>> 13;
          d2 &= 8191;
          d3 = c;
          d3 += h0 * r3;
          d3 += h1 * r2;
          d3 += h2 * r1;
          d3 += h3 * r0;
          d3 += h4 * (5 * r9);
          c = d3 >>> 13;
          d3 &= 8191;
          d3 += h5 * (5 * r8);
          d3 += h6 * (5 * r7);
          d3 += h7 * (5 * r6);
          d3 += h8 * (5 * r5);
          d3 += h9 * (5 * r4);
          c += d3 >>> 13;
          d3 &= 8191;
          d4 = c;
          d4 += h0 * r4;
          d4 += h1 * r3;
          d4 += h2 * r2;
          d4 += h3 * r1;
          d4 += h4 * r0;
          c = d4 >>> 13;
          d4 &= 8191;
          d4 += h5 * (5 * r9);
          d4 += h6 * (5 * r8);
          d4 += h7 * (5 * r7);
          d4 += h8 * (5 * r6);
          d4 += h9 * (5 * r5);
          c += d4 >>> 13;
          d4 &= 8191;
          d5 = c;
          d5 += h0 * r5;
          d5 += h1 * r4;
          d5 += h2 * r3;
          d5 += h3 * r2;
          d5 += h4 * r1;
          c = d5 >>> 13;
          d5 &= 8191;
          d5 += h5 * r0;
          d5 += h6 * (5 * r9);
          d5 += h7 * (5 * r8);
          d5 += h8 * (5 * r7);
          d5 += h9 * (5 * r6);
          c += d5 >>> 13;
          d5 &= 8191;
          d6 = c;
          d6 += h0 * r6;
          d6 += h1 * r5;
          d6 += h2 * r4;
          d6 += h3 * r3;
          d6 += h4 * r2;
          c = d6 >>> 13;
          d6 &= 8191;
          d6 += h5 * r1;
          d6 += h6 * r0;
          d6 += h7 * (5 * r9);
          d6 += h8 * (5 * r8);
          d6 += h9 * (5 * r7);
          c += d6 >>> 13;
          d6 &= 8191;
          d7 = c;
          d7 += h0 * r7;
          d7 += h1 * r6;
          d7 += h2 * r5;
          d7 += h3 * r4;
          d7 += h4 * r3;
          c = d7 >>> 13;
          d7 &= 8191;
          d7 += h5 * r2;
          d7 += h6 * r1;
          d7 += h7 * r0;
          d7 += h8 * (5 * r9);
          d7 += h9 * (5 * r8);
          c += d7 >>> 13;
          d7 &= 8191;
          d8 = c;
          d8 += h0 * r8;
          d8 += h1 * r7;
          d8 += h2 * r6;
          d8 += h3 * r5;
          d8 += h4 * r4;
          c = d8 >>> 13;
          d8 &= 8191;
          d8 += h5 * r3;
          d8 += h6 * r2;
          d8 += h7 * r1;
          d8 += h8 * r0;
          d8 += h9 * (5 * r9);
          c += d8 >>> 13;
          d8 &= 8191;
          d9 = c;
          d9 += h0 * r9;
          d9 += h1 * r8;
          d9 += h2 * r7;
          d9 += h3 * r6;
          d9 += h4 * r5;
          c = d9 >>> 13;
          d9 &= 8191;
          d9 += h5 * r4;
          d9 += h6 * r3;
          d9 += h7 * r2;
          d9 += h8 * r1;
          d9 += h9 * r0;
          c += d9 >>> 13;
          d9 &= 8191;
          c = (c << 2) + c | 0;
          c = c + d0 | 0;
          d0 = c & 8191;
          c = c >>> 13;
          d1 += c;
          h0 = d0;
          h1 = d1;
          h2 = d2;
          h3 = d3;
          h4 = d4;
          h5 = d5;
          h6 = d6;
          h7 = d7;
          h8 = d8;
          h9 = d9;
          mpos += 16;
          bytes -= 16;
        }
        this.h[0] = h0;
        this.h[1] = h1;
        this.h[2] = h2;
        this.h[3] = h3;
        this.h[4] = h4;
        this.h[5] = h5;
        this.h[6] = h6;
        this.h[7] = h7;
        this.h[8] = h8;
        this.h[9] = h9;
      };
      poly1305.prototype.finish = function(mac, macpos) {
        var g = new Uint16Array(10);
        var c, mask, f, i;
        if (this.leftover) {
          i = this.leftover;
          this.buffer[i++] = 1;
          for (; i < 16; i++) this.buffer[i] = 0;
          this.fin = 1;
          this.blocks(this.buffer, 0, 16);
        }
        c = this.h[1] >>> 13;
        this.h[1] &= 8191;
        for (i = 2; i < 10; i++) {
          this.h[i] += c;
          c = this.h[i] >>> 13;
          this.h[i] &= 8191;
        }
        this.h[0] += c * 5;
        c = this.h[0] >>> 13;
        this.h[0] &= 8191;
        this.h[1] += c;
        c = this.h[1] >>> 13;
        this.h[1] &= 8191;
        this.h[2] += c;
        g[0] = this.h[0] + 5;
        c = g[0] >>> 13;
        g[0] &= 8191;
        for (i = 1; i < 10; i++) {
          g[i] = this.h[i] + c;
          c = g[i] >>> 13;
          g[i] &= 8191;
        }
        g[9] -= 1 << 13;
        mask = (c ^ 1) - 1;
        for (i = 0; i < 10; i++) g[i] &= mask;
        mask = ~mask;
        for (i = 0; i < 10; i++) this.h[i] = this.h[i] & mask | g[i];
        this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
        this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
        this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
        this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
        this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
        this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
        this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
        this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
        f = this.h[0] + this.pad[0];
        this.h[0] = f & 65535;
        for (i = 1; i < 8; i++) {
          f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
          this.h[i] = f & 65535;
        }
        mac[macpos + 0] = this.h[0] >>> 0 & 255;
        mac[macpos + 1] = this.h[0] >>> 8 & 255;
        mac[macpos + 2] = this.h[1] >>> 0 & 255;
        mac[macpos + 3] = this.h[1] >>> 8 & 255;
        mac[macpos + 4] = this.h[2] >>> 0 & 255;
        mac[macpos + 5] = this.h[2] >>> 8 & 255;
        mac[macpos + 6] = this.h[3] >>> 0 & 255;
        mac[macpos + 7] = this.h[3] >>> 8 & 255;
        mac[macpos + 8] = this.h[4] >>> 0 & 255;
        mac[macpos + 9] = this.h[4] >>> 8 & 255;
        mac[macpos + 10] = this.h[5] >>> 0 & 255;
        mac[macpos + 11] = this.h[5] >>> 8 & 255;
        mac[macpos + 12] = this.h[6] >>> 0 & 255;
        mac[macpos + 13] = this.h[6] >>> 8 & 255;
        mac[macpos + 14] = this.h[7] >>> 0 & 255;
        mac[macpos + 15] = this.h[7] >>> 8 & 255;
      };
      poly1305.prototype.update = function(m, mpos, bytes) {
        var i, want;
        if (this.leftover) {
          want = 16 - this.leftover;
          if (want > bytes)
            want = bytes;
          for (i = 0; i < want; i++)
            this.buffer[this.leftover + i] = m[mpos + i];
          bytes -= want;
          mpos += want;
          this.leftover += want;
          if (this.leftover < 16)
            return;
          this.blocks(this.buffer, 0, 16);
          this.leftover = 0;
        }
        if (bytes >= 16) {
          want = bytes - bytes % 16;
          this.blocks(m, mpos, want);
          mpos += want;
          bytes -= want;
        }
        if (bytes) {
          for (i = 0; i < bytes; i++)
            this.buffer[this.leftover + i] = m[mpos + i];
          this.leftover += bytes;
        }
      };
      function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
        var s = new poly1305(k);
        s.update(m, mpos, n);
        s.finish(out, outpos);
        return 0;
      }
      function crypto_onetimeauth_verify(h2, hpos, m, mpos, n, k) {
        var x = new Uint8Array(16);
        crypto_onetimeauth(x, 0, m, mpos, n, k);
        return crypto_verify_16(h2, hpos, x, 0);
      }
      function crypto_secretbox(c, m, d, n, k) {
        var i;
        if (d < 32) return -1;
        crypto_stream_xor(c, 0, m, 0, d, n, k);
        crypto_onetimeauth(c, 16, c, 32, d - 32, c);
        for (i = 0; i < 16; i++) c[i] = 0;
        return 0;
      }
      function crypto_secretbox_open(m, c, d, n, k) {
        var i;
        var x = new Uint8Array(32);
        if (d < 32) return -1;
        crypto_stream(x, 0, 32, n, k);
        if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1;
        crypto_stream_xor(m, 0, c, 0, d, n, k);
        for (i = 0; i < 32; i++) m[i] = 0;
        return 0;
      }
      function set25519(r, a) {
        var i;
        for (i = 0; i < 16; i++) r[i] = a[i] | 0;
      }
      function car25519(o) {
        var i, v, c = 1;
        for (i = 0; i < 16; i++) {
          v = o[i] + c + 65535;
          c = Math.floor(v / 65536);
          o[i] = v - c * 65536;
        }
        o[0] += c - 1 + 37 * (c - 1);
      }
      function sel25519(p, q, b) {
        var t, c = ~(b - 1);
        for (var i = 0; i < 16; i++) {
          t = c & (p[i] ^ q[i]);
          p[i] ^= t;
          q[i] ^= t;
        }
      }
      function pack25519(o, n) {
        var i, j, b;
        var m = gf(), t = gf();
        for (i = 0; i < 16; i++) t[i] = n[i];
        car25519(t);
        car25519(t);
        car25519(t);
        for (j = 0; j < 2; j++) {
          m[0] = t[0] - 65517;
          for (i = 1; i < 15; i++) {
            m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
            m[i - 1] &= 65535;
          }
          m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
          b = m[15] >> 16 & 1;
          m[14] &= 65535;
          sel25519(t, m, 1 - b);
        }
        for (i = 0; i < 16; i++) {
          o[2 * i] = t[i] & 255;
          o[2 * i + 1] = t[i] >> 8;
        }
      }
      function neq25519(a, b) {
        var c = new Uint8Array(32), d = new Uint8Array(32);
        pack25519(c, a);
        pack25519(d, b);
        return crypto_verify_32(c, 0, d, 0);
      }
      function par25519(a) {
        var d = new Uint8Array(32);
        pack25519(d, a);
        return d[0] & 1;
      }
      function unpack25519(o, n) {
        var i;
        for (i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
        o[15] &= 32767;
      }
      function A(o, a, b) {
        for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
      }
      function Z(o, a, b) {
        for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
      }
      function M2(o, a, b) {
        var v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
        v = a[0];
        t0 += v * b0;
        t1 += v * b1;
        t2 += v * b2;
        t3 += v * b3;
        t4 += v * b4;
        t5 += v * b5;
        t6 += v * b6;
        t7 += v * b7;
        t8 += v * b8;
        t9 += v * b9;
        t10 += v * b10;
        t11 += v * b11;
        t12 += v * b12;
        t13 += v * b13;
        t14 += v * b14;
        t15 += v * b15;
        v = a[1];
        t1 += v * b0;
        t2 += v * b1;
        t3 += v * b2;
        t4 += v * b3;
        t5 += v * b4;
        t6 += v * b5;
        t7 += v * b6;
        t8 += v * b7;
        t9 += v * b8;
        t10 += v * b9;
        t11 += v * b10;
        t12 += v * b11;
        t13 += v * b12;
        t14 += v * b13;
        t15 += v * b14;
        t16 += v * b15;
        v = a[2];
        t2 += v * b0;
        t3 += v * b1;
        t4 += v * b2;
        t5 += v * b3;
        t6 += v * b4;
        t7 += v * b5;
        t8 += v * b6;
        t9 += v * b7;
        t10 += v * b8;
        t11 += v * b9;
        t12 += v * b10;
        t13 += v * b11;
        t14 += v * b12;
        t15 += v * b13;
        t16 += v * b14;
        t17 += v * b15;
        v = a[3];
        t3 += v * b0;
        t4 += v * b1;
        t5 += v * b2;
        t6 += v * b3;
        t7 += v * b4;
        t8 += v * b5;
        t9 += v * b6;
        t10 += v * b7;
        t11 += v * b8;
        t12 += v * b9;
        t13 += v * b10;
        t14 += v * b11;
        t15 += v * b12;
        t16 += v * b13;
        t17 += v * b14;
        t18 += v * b15;
        v = a[4];
        t4 += v * b0;
        t5 += v * b1;
        t6 += v * b2;
        t7 += v * b3;
        t8 += v * b4;
        t9 += v * b5;
        t10 += v * b6;
        t11 += v * b7;
        t12 += v * b8;
        t13 += v * b9;
        t14 += v * b10;
        t15 += v * b11;
        t16 += v * b12;
        t17 += v * b13;
        t18 += v * b14;
        t19 += v * b15;
        v = a[5];
        t5 += v * b0;
        t6 += v * b1;
        t7 += v * b2;
        t8 += v * b3;
        t9 += v * b4;
        t10 += v * b5;
        t11 += v * b6;
        t12 += v * b7;
        t13 += v * b8;
        t14 += v * b9;
        t15 += v * b10;
        t16 += v * b11;
        t17 += v * b12;
        t18 += v * b13;
        t19 += v * b14;
        t20 += v * b15;
        v = a[6];
        t6 += v * b0;
        t7 += v * b1;
        t8 += v * b2;
        t9 += v * b3;
        t10 += v * b4;
        t11 += v * b5;
        t12 += v * b6;
        t13 += v * b7;
        t14 += v * b8;
        t15 += v * b9;
        t16 += v * b10;
        t17 += v * b11;
        t18 += v * b12;
        t19 += v * b13;
        t20 += v * b14;
        t21 += v * b15;
        v = a[7];
        t7 += v * b0;
        t8 += v * b1;
        t9 += v * b2;
        t10 += v * b3;
        t11 += v * b4;
        t12 += v * b5;
        t13 += v * b6;
        t14 += v * b7;
        t15 += v * b8;
        t16 += v * b9;
        t17 += v * b10;
        t18 += v * b11;
        t19 += v * b12;
        t20 += v * b13;
        t21 += v * b14;
        t22 += v * b15;
        v = a[8];
        t8 += v * b0;
        t9 += v * b1;
        t10 += v * b2;
        t11 += v * b3;
        t12 += v * b4;
        t13 += v * b5;
        t14 += v * b6;
        t15 += v * b7;
        t16 += v * b8;
        t17 += v * b9;
        t18 += v * b10;
        t19 += v * b11;
        t20 += v * b12;
        t21 += v * b13;
        t22 += v * b14;
        t23 += v * b15;
        v = a[9];
        t9 += v * b0;
        t10 += v * b1;
        t11 += v * b2;
        t12 += v * b3;
        t13 += v * b4;
        t14 += v * b5;
        t15 += v * b6;
        t16 += v * b7;
        t17 += v * b8;
        t18 += v * b9;
        t19 += v * b10;
        t20 += v * b11;
        t21 += v * b12;
        t22 += v * b13;
        t23 += v * b14;
        t24 += v * b15;
        v = a[10];
        t10 += v * b0;
        t11 += v * b1;
        t12 += v * b2;
        t13 += v * b3;
        t14 += v * b4;
        t15 += v * b5;
        t16 += v * b6;
        t17 += v * b7;
        t18 += v * b8;
        t19 += v * b9;
        t20 += v * b10;
        t21 += v * b11;
        t22 += v * b12;
        t23 += v * b13;
        t24 += v * b14;
        t25 += v * b15;
        v = a[11];
        t11 += v * b0;
        t12 += v * b1;
        t13 += v * b2;
        t14 += v * b3;
        t15 += v * b4;
        t16 += v * b5;
        t17 += v * b6;
        t18 += v * b7;
        t19 += v * b8;
        t20 += v * b9;
        t21 += v * b10;
        t22 += v * b11;
        t23 += v * b12;
        t24 += v * b13;
        t25 += v * b14;
        t26 += v * b15;
        v = a[12];
        t12 += v * b0;
        t13 += v * b1;
        t14 += v * b2;
        t15 += v * b3;
        t16 += v * b4;
        t17 += v * b5;
        t18 += v * b6;
        t19 += v * b7;
        t20 += v * b8;
        t21 += v * b9;
        t22 += v * b10;
        t23 += v * b11;
        t24 += v * b12;
        t25 += v * b13;
        t26 += v * b14;
        t27 += v * b15;
        v = a[13];
        t13 += v * b0;
        t14 += v * b1;
        t15 += v * b2;
        t16 += v * b3;
        t17 += v * b4;
        t18 += v * b5;
        t19 += v * b6;
        t20 += v * b7;
        t21 += v * b8;
        t22 += v * b9;
        t23 += v * b10;
        t24 += v * b11;
        t25 += v * b12;
        t26 += v * b13;
        t27 += v * b14;
        t28 += v * b15;
        v = a[14];
        t14 += v * b0;
        t15 += v * b1;
        t16 += v * b2;
        t17 += v * b3;
        t18 += v * b4;
        t19 += v * b5;
        t20 += v * b6;
        t21 += v * b7;
        t22 += v * b8;
        t23 += v * b9;
        t24 += v * b10;
        t25 += v * b11;
        t26 += v * b12;
        t27 += v * b13;
        t28 += v * b14;
        t29 += v * b15;
        v = a[15];
        t15 += v * b0;
        t16 += v * b1;
        t17 += v * b2;
        t18 += v * b3;
        t19 += v * b4;
        t20 += v * b5;
        t21 += v * b6;
        t22 += v * b7;
        t23 += v * b8;
        t24 += v * b9;
        t25 += v * b10;
        t26 += v * b11;
        t27 += v * b12;
        t28 += v * b13;
        t29 += v * b14;
        t30 += v * b15;
        t0 += 38 * t16;
        t1 += 38 * t17;
        t2 += 38 * t18;
        t3 += 38 * t19;
        t4 += 38 * t20;
        t5 += 38 * t21;
        t6 += 38 * t22;
        t7 += 38 * t23;
        t8 += 38 * t24;
        t9 += 38 * t25;
        t10 += 38 * t26;
        t11 += 38 * t27;
        t12 += 38 * t28;
        t13 += 38 * t29;
        t14 += 38 * t30;
        c = 1;
        v = t0 + c + 65535;
        c = Math.floor(v / 65536);
        t0 = v - c * 65536;
        v = t1 + c + 65535;
        c = Math.floor(v / 65536);
        t1 = v - c * 65536;
        v = t2 + c + 65535;
        c = Math.floor(v / 65536);
        t2 = v - c * 65536;
        v = t3 + c + 65535;
        c = Math.floor(v / 65536);
        t3 = v - c * 65536;
        v = t4 + c + 65535;
        c = Math.floor(v / 65536);
        t4 = v - c * 65536;
        v = t5 + c + 65535;
        c = Math.floor(v / 65536);
        t5 = v - c * 65536;
        v = t6 + c + 65535;
        c = Math.floor(v / 65536);
        t6 = v - c * 65536;
        v = t7 + c + 65535;
        c = Math.floor(v / 65536);
        t7 = v - c * 65536;
        v = t8 + c + 65535;
        c = Math.floor(v / 65536);
        t8 = v - c * 65536;
        v = t9 + c + 65535;
        c = Math.floor(v / 65536);
        t9 = v - c * 65536;
        v = t10 + c + 65535;
        c = Math.floor(v / 65536);
        t10 = v - c * 65536;
        v = t11 + c + 65535;
        c = Math.floor(v / 65536);
        t11 = v - c * 65536;
        v = t12 + c + 65535;
        c = Math.floor(v / 65536);
        t12 = v - c * 65536;
        v = t13 + c + 65535;
        c = Math.floor(v / 65536);
        t13 = v - c * 65536;
        v = t14 + c + 65535;
        c = Math.floor(v / 65536);
        t14 = v - c * 65536;
        v = t15 + c + 65535;
        c = Math.floor(v / 65536);
        t15 = v - c * 65536;
        t0 += c - 1 + 37 * (c - 1);
        c = 1;
        v = t0 + c + 65535;
        c = Math.floor(v / 65536);
        t0 = v - c * 65536;
        v = t1 + c + 65535;
        c = Math.floor(v / 65536);
        t1 = v - c * 65536;
        v = t2 + c + 65535;
        c = Math.floor(v / 65536);
        t2 = v - c * 65536;
        v = t3 + c + 65535;
        c = Math.floor(v / 65536);
        t3 = v - c * 65536;
        v = t4 + c + 65535;
        c = Math.floor(v / 65536);
        t4 = v - c * 65536;
        v = t5 + c + 65535;
        c = Math.floor(v / 65536);
        t5 = v - c * 65536;
        v = t6 + c + 65535;
        c = Math.floor(v / 65536);
        t6 = v - c * 65536;
        v = t7 + c + 65535;
        c = Math.floor(v / 65536);
        t7 = v - c * 65536;
        v = t8 + c + 65535;
        c = Math.floor(v / 65536);
        t8 = v - c * 65536;
        v = t9 + c + 65535;
        c = Math.floor(v / 65536);
        t9 = v - c * 65536;
        v = t10 + c + 65535;
        c = Math.floor(v / 65536);
        t10 = v - c * 65536;
        v = t11 + c + 65535;
        c = Math.floor(v / 65536);
        t11 = v - c * 65536;
        v = t12 + c + 65535;
        c = Math.floor(v / 65536);
        t12 = v - c * 65536;
        v = t13 + c + 65535;
        c = Math.floor(v / 65536);
        t13 = v - c * 65536;
        v = t14 + c + 65535;
        c = Math.floor(v / 65536);
        t14 = v - c * 65536;
        v = t15 + c + 65535;
        c = Math.floor(v / 65536);
        t15 = v - c * 65536;
        t0 += c - 1 + 37 * (c - 1);
        o[0] = t0;
        o[1] = t1;
        o[2] = t2;
        o[3] = t3;
        o[4] = t4;
        o[5] = t5;
        o[6] = t6;
        o[7] = t7;
        o[8] = t8;
        o[9] = t9;
        o[10] = t10;
        o[11] = t11;
        o[12] = t12;
        o[13] = t13;
        o[14] = t14;
        o[15] = t15;
      }
      function S(o, a) {
        M2(o, a, a);
      }
      function inv25519(o, i) {
        var c = gf();
        var a;
        for (a = 0; a < 16; a++) c[a] = i[a];
        for (a = 253; a >= 0; a--) {
          S(c, c);
          if (a !== 2 && a !== 4) M2(c, c, i);
        }
        for (a = 0; a < 16; a++) o[a] = c[a];
      }
      function pow2523(o, i) {
        var c = gf();
        var a;
        for (a = 0; a < 16; a++) c[a] = i[a];
        for (a = 250; a >= 0; a--) {
          S(c, c);
          if (a !== 1) M2(c, c, i);
        }
        for (a = 0; a < 16; a++) o[a] = c[a];
      }
      function crypto_scalarmult(q, n, p) {
        var z = new Uint8Array(32);
        var x = new Float64Array(80), r, i;
        var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf();
        for (i = 0; i < 31; i++) z[i] = n[i];
        z[31] = n[31] & 127 | 64;
        z[0] &= 248;
        unpack25519(x, p);
        for (i = 0; i < 16; i++) {
          b[i] = x[i];
          d[i] = a[i] = c[i] = 0;
        }
        a[0] = d[0] = 1;
        for (i = 254; i >= 0; --i) {
          r = z[i >>> 3] >>> (i & 7) & 1;
          sel25519(a, b, r);
          sel25519(c, d, r);
          A(e, a, c);
          Z(a, a, c);
          A(c, b, d);
          Z(b, b, d);
          S(d, e);
          S(f, a);
          M2(a, c, a);
          M2(c, b, e);
          A(e, a, c);
          Z(a, a, c);
          S(b, a);
          Z(c, d, f);
          M2(a, c, _121665);
          A(a, a, d);
          M2(c, c, a);
          M2(a, d, f);
          M2(d, b, x);
          S(b, e);
          sel25519(a, b, r);
          sel25519(c, d, r);
        }
        for (i = 0; i < 16; i++) {
          x[i + 16] = a[i];
          x[i + 32] = c[i];
          x[i + 48] = b[i];
          x[i + 64] = d[i];
        }
        var x32 = x.subarray(32);
        var x16 = x.subarray(16);
        inv25519(x32, x32);
        M2(x16, x16, x32);
        pack25519(q, x16);
        return 0;
      }
      function crypto_scalarmult_base(q, n) {
        return crypto_scalarmult(q, n, _9);
      }
      function crypto_box_keypair(y, x) {
        randombytes(x, 32);
        return crypto_scalarmult_base(y, x);
      }
      function crypto_box_beforenm(k, y, x) {
        var s = new Uint8Array(32);
        crypto_scalarmult(s, x, y);
        return crypto_core_hsalsa20(k, _0, s, sigma);
      }
      var crypto_box_afternm = crypto_secretbox;
      var crypto_box_open_afternm = crypto_secretbox_open;
      function crypto_box(c, m, d, n, y, x) {
        var k = new Uint8Array(32);
        crypto_box_beforenm(k, y, x);
        return crypto_box_afternm(c, m, d, n, k);
      }
      function crypto_box_open(m, c, d, n, y, x) {
        var k = new Uint8Array(32);
        crypto_box_beforenm(k, y, x);
        return crypto_box_open_afternm(m, c, d, n, k);
      }
      var K = [
        1116352408,
        3609767458,
        1899447441,
        602891725,
        3049323471,
        3964484399,
        3921009573,
        2173295548,
        961987163,
        4081628472,
        1508970993,
        3053834265,
        2453635748,
        2937671579,
        2870763221,
        3664609560,
        3624381080,
        2734883394,
        310598401,
        1164996542,
        607225278,
        1323610764,
        1426881987,
        3590304994,
        1925078388,
        4068182383,
        2162078206,
        991336113,
        2614888103,
        633803317,
        3248222580,
        3479774868,
        3835390401,
        2666613458,
        4022224774,
        944711139,
        264347078,
        2341262773,
        604807628,
        2007800933,
        770255983,
        1495990901,
        1249150122,
        1856431235,
        1555081692,
        3175218132,
        1996064986,
        2198950837,
        2554220882,
        3999719339,
        2821834349,
        766784016,
        2952996808,
        2566594879,
        3210313671,
        3203337956,
        3336571891,
        1034457026,
        3584528711,
        2466948901,
        113926993,
        3758326383,
        338241895,
        168717936,
        666307205,
        1188179964,
        773529912,
        1546045734,
        1294757372,
        1522805485,
        1396182291,
        2643833823,
        1695183700,
        2343527390,
        1986661051,
        1014477480,
        2177026350,
        1206759142,
        2456956037,
        344077627,
        2730485921,
        1290863460,
        2820302411,
        3158454273,
        3259730800,
        3505952657,
        3345764771,
        106217008,
        3516065817,
        3606008344,
        3600352804,
        1432725776,
        4094571909,
        1467031594,
        275423344,
        851169720,
        430227734,
        3100823752,
        506948616,
        1363258195,
        659060556,
        3750685593,
        883997877,
        3785050280,
        958139571,
        3318307427,
        1322822218,
        3812723403,
        1537002063,
        2003034995,
        1747873779,
        3602036899,
        1955562222,
        1575990012,
        2024104815,
        1125592928,
        2227730452,
        2716904306,
        2361852424,
        442776044,
        2428436474,
        593698344,
        2756734187,
        3733110249,
        3204031479,
        2999351573,
        3329325298,
        3815920427,
        3391569614,
        3928383900,
        3515267271,
        566280711,
        3940187606,
        3454069534,
        4118630271,
        4000239992,
        116418474,
        1914138554,
        174292421,
        2731055270,
        289380356,
        3203993006,
        460393269,
        320620315,
        685471733,
        587496836,
        852142971,
        1086792851,
        1017036298,
        365543100,
        1126000580,
        2618297676,
        1288033470,
        3409855158,
        1501505948,
        4234509866,
        1607167915,
        987167468,
        1816402316,
        1246189591
      ];
      function crypto_hashblocks_hl(hh, hl, m, n) {
        var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i, j, h2, l, a, b, c, d;
        var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
        var pos = 0;
        while (n >= 128) {
          for (i = 0; i < 16; i++) {
            j = 8 * i + pos;
            wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
            wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
          }
          for (i = 0; i < 80; i++) {
            bh0 = ah0;
            bh1 = ah1;
            bh2 = ah2;
            bh3 = ah3;
            bh4 = ah4;
            bh5 = ah5;
            bh6 = ah6;
            bh7 = ah7;
            bl0 = al0;
            bl1 = al1;
            bl2 = al2;
            bl3 = al3;
            bl4 = al4;
            bl5 = al5;
            bl6 = al6;
            bl7 = al7;
            h2 = ah7;
            l = al7;
            a = l & 65535;
            b = l >>> 16;
            c = h2 & 65535;
            d = h2 >>> 16;
            h2 = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
            l = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
            a += l & 65535;
            b += l >>> 16;
            c += h2 & 65535;
            d += h2 >>> 16;
            h2 = ah4 & ah5 ^ ~ah4 & ah6;
            l = al4 & al5 ^ ~al4 & al6;
            a += l & 65535;
            b += l >>> 16;
            c += h2 & 65535;
            d += h2 >>> 16;
            h2 = K[i * 2];
            l = K[i * 2 + 1];
            a += l & 65535;
            b += l >>> 16;
            c += h2 & 65535;
            d += h2 >>> 16;
            h2 = wh[i % 16];
            l = wl[i % 16];
            a += l & 65535;
            b += l >>> 16;
            c += h2 & 65535;
            d += h2 >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            th = c & 65535 | d << 16;
            tl = a & 65535 | b << 16;
            h2 = th;
            l = tl;
            a = l & 65535;
            b = l >>> 16;
            c = h2 & 65535;
            d = h2 >>> 16;
            h2 = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
            l = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
            a += l & 65535;
            b += l >>> 16;
            c += h2 & 65535;
            d += h2 >>> 16;
            h2 = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
            l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
            a += l & 65535;
            b += l >>> 16;
            c += h2 & 65535;
            d += h2 >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            bh7 = c & 65535 | d << 16;
            bl7 = a & 65535 | b << 16;
            h2 = bh3;
            l = bl3;
            a = l & 65535;
            b = l >>> 16;
            c = h2 & 65535;
            d = h2 >>> 16;
            h2 = th;
            l = tl;
            a += l & 65535;
            b += l >>> 16;
            c += h2 & 65535;
            d += h2 >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            bh3 = c & 65535 | d << 16;
            bl3 = a & 65535 | b << 16;
            ah1 = bh0;
            ah2 = bh1;
            ah3 = bh2;
            ah4 = bh3;
            ah5 = bh4;
            ah6 = bh5;
            ah7 = bh6;
            ah0 = bh7;
            al1 = bl0;
            al2 = bl1;
            al3 = bl2;
            al4 = bl3;
            al5 = bl4;
            al6 = bl5;
            al7 = bl6;
            al0 = bl7;
            if (i % 16 === 15) {
              for (j = 0; j < 16; j++) {
                h2 = wh[j];
                l = wl[j];
                a = l & 65535;
                b = l >>> 16;
                c = h2 & 65535;
                d = h2 >>> 16;
                h2 = wh[(j + 9) % 16];
                l = wl[(j + 9) % 16];
                a += l & 65535;
                b += l >>> 16;
                c += h2 & 65535;
                d += h2 >>> 16;
                th = wh[(j + 1) % 16];
                tl = wl[(j + 1) % 16];
                h2 = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                l = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                a += l & 65535;
                b += l >>> 16;
                c += h2 & 65535;
                d += h2 >>> 16;
                th = wh[(j + 14) % 16];
                tl = wl[(j + 14) % 16];
                h2 = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                l = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                a += l & 65535;
                b += l >>> 16;
                c += h2 & 65535;
                d += h2 >>> 16;
                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;
                wh[j] = c & 65535 | d << 16;
                wl[j] = a & 65535 | b << 16;
              }
            }
          }
          h2 = ah0;
          l = al0;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[0];
          l = hl[0];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[0] = ah0 = c & 65535 | d << 16;
          hl[0] = al0 = a & 65535 | b << 16;
          h2 = ah1;
          l = al1;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[1];
          l = hl[1];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[1] = ah1 = c & 65535 | d << 16;
          hl[1] = al1 = a & 65535 | b << 16;
          h2 = ah2;
          l = al2;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[2];
          l = hl[2];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[2] = ah2 = c & 65535 | d << 16;
          hl[2] = al2 = a & 65535 | b << 16;
          h2 = ah3;
          l = al3;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[3];
          l = hl[3];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[3] = ah3 = c & 65535 | d << 16;
          hl[3] = al3 = a & 65535 | b << 16;
          h2 = ah4;
          l = al4;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[4];
          l = hl[4];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[4] = ah4 = c & 65535 | d << 16;
          hl[4] = al4 = a & 65535 | b << 16;
          h2 = ah5;
          l = al5;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[5];
          l = hl[5];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[5] = ah5 = c & 65535 | d << 16;
          hl[5] = al5 = a & 65535 | b << 16;
          h2 = ah6;
          l = al6;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[6];
          l = hl[6];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[6] = ah6 = c & 65535 | d << 16;
          hl[6] = al6 = a & 65535 | b << 16;
          h2 = ah7;
          l = al7;
          a = l & 65535;
          b = l >>> 16;
          c = h2 & 65535;
          d = h2 >>> 16;
          h2 = hh[7];
          l = hl[7];
          a += l & 65535;
          b += l >>> 16;
          c += h2 & 65535;
          d += h2 >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[7] = ah7 = c & 65535 | d << 16;
          hl[7] = al7 = a & 65535 | b << 16;
          pos += 128;
          n -= 128;
        }
        return n;
      }
      function crypto_hash(out, m, n) {
        var hh = new Int32Array(8), hl = new Int32Array(8), x = new Uint8Array(256), i, b = n;
        hh[0] = 1779033703;
        hh[1] = 3144134277;
        hh[2] = 1013904242;
        hh[3] = 2773480762;
        hh[4] = 1359893119;
        hh[5] = 2600822924;
        hh[6] = 528734635;
        hh[7] = 1541459225;
        hl[0] = 4089235720;
        hl[1] = 2227873595;
        hl[2] = 4271175723;
        hl[3] = 1595750129;
        hl[4] = 2917565137;
        hl[5] = 725511199;
        hl[6] = 4215389547;
        hl[7] = 327033209;
        crypto_hashblocks_hl(hh, hl, m, n);
        n %= 128;
        for (i = 0; i < n; i++) x[i] = m[b - n + i];
        x[n] = 128;
        n = 256 - 128 * (n < 112 ? 1 : 0);
        x[n - 9] = 0;
        ts64(x, n - 8, b / 536870912 | 0, b << 3);
        crypto_hashblocks_hl(hh, hl, x, n);
        for (i = 0; i < 8; i++) ts64(out, 8 * i, hh[i], hl[i]);
        return 0;
      }
      function add2(p, q) {
        var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h2 = gf(), t = gf();
        Z(a, p[1], p[0]);
        Z(t, q[1], q[0]);
        M2(a, a, t);
        A(b, p[0], p[1]);
        A(t, q[0], q[1]);
        M2(b, b, t);
        M2(c, p[3], q[3]);
        M2(c, c, D2);
        M2(d, p[2], q[2]);
        A(d, d, d);
        Z(e, b, a);
        Z(f, d, c);
        A(g, d, c);
        A(h2, b, a);
        M2(p[0], e, f);
        M2(p[1], h2, g);
        M2(p[2], g, f);
        M2(p[3], e, h2);
      }
      function cswap(p, q, b) {
        var i;
        for (i = 0; i < 4; i++) {
          sel25519(p[i], q[i], b);
        }
      }
      function pack(r, p) {
        var tx = gf(), ty = gf(), zi = gf();
        inv25519(zi, p[2]);
        M2(tx, p[0], zi);
        M2(ty, p[1], zi);
        pack25519(r, ty);
        r[31] ^= par25519(tx) << 7;
      }
      function scalarmult(p, q, s) {
        var b, i;
        set25519(p[0], gf0);
        set25519(p[1], gf1);
        set25519(p[2], gf1);
        set25519(p[3], gf0);
        for (i = 255; i >= 0; --i) {
          b = s[i / 8 | 0] >> (i & 7) & 1;
          cswap(p, q, b);
          add2(q, p);
          add2(p, p);
          cswap(p, q, b);
        }
      }
      function scalarbase(p, s) {
        var q = [gf(), gf(), gf(), gf()];
        set25519(q[0], X);
        set25519(q[1], Y);
        set25519(q[2], gf1);
        M2(q[3], X, Y);
        scalarmult(p, q, s);
      }
      function crypto_sign_keypair(pk, sk, seeded) {
        var d = new Uint8Array(64);
        var p = [gf(), gf(), gf(), gf()];
        var i;
        if (!seeded) randombytes(sk, 32);
        crypto_hash(d, sk, 32);
        d[0] &= 248;
        d[31] &= 127;
        d[31] |= 64;
        scalarbase(p, d);
        pack(pk, p);
        for (i = 0; i < 32; i++) sk[i + 32] = pk[i];
        return 0;
      }
      var L3 = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
      function modL(r, x) {
        var carry, i, j, k;
        for (i = 63; i >= 32; --i) {
          carry = 0;
          for (j = i - 32, k = i - 12; j < k; ++j) {
            x[j] += carry - 16 * x[i] * L3[j - (i - 32)];
            carry = Math.floor((x[j] + 128) / 256);
            x[j] -= carry * 256;
          }
          x[j] += carry;
          x[i] = 0;
        }
        carry = 0;
        for (j = 0; j < 32; j++) {
          x[j] += carry - (x[31] >> 4) * L3[j];
          carry = x[j] >> 8;
          x[j] &= 255;
        }
        for (j = 0; j < 32; j++) x[j] -= carry * L3[j];
        for (i = 0; i < 32; i++) {
          x[i + 1] += x[i] >> 8;
          r[i] = x[i] & 255;
        }
      }
      function reduce(r) {
        var x = new Float64Array(64), i;
        for (i = 0; i < 64; i++) x[i] = r[i];
        for (i = 0; i < 64; i++) r[i] = 0;
        modL(r, x);
      }
      function crypto_sign(sm, m, n, sk) {
        var d = new Uint8Array(64), h2 = new Uint8Array(64), r = new Uint8Array(64);
        var i, j, x = new Float64Array(64);
        var p = [gf(), gf(), gf(), gf()];
        crypto_hash(d, sk, 32);
        d[0] &= 248;
        d[31] &= 127;
        d[31] |= 64;
        var smlen = n + 64;
        for (i = 0; i < n; i++) sm[64 + i] = m[i];
        for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];
        crypto_hash(r, sm.subarray(32), n + 32);
        reduce(r);
        scalarbase(p, r);
        pack(sm, p);
        for (i = 32; i < 64; i++) sm[i] = sk[i];
        crypto_hash(h2, sm, n + 64);
        reduce(h2);
        for (i = 0; i < 64; i++) x[i] = 0;
        for (i = 0; i < 32; i++) x[i] = r[i];
        for (i = 0; i < 32; i++) {
          for (j = 0; j < 32; j++) {
            x[i + j] += h2[i] * d[j];
          }
        }
        modL(sm.subarray(32), x);
        return smlen;
      }
      function unpackneg(r, p) {
        var t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
        set25519(r[2], gf1);
        unpack25519(r[1], p);
        S(num, r[1]);
        M2(den, num, D);
        Z(num, num, r[2]);
        A(den, r[2], den);
        S(den2, den);
        S(den4, den2);
        M2(den6, den4, den2);
        M2(t, den6, num);
        M2(t, t, den);
        pow2523(t, t);
        M2(t, t, num);
        M2(t, t, den);
        M2(t, t, den);
        M2(r[0], t, den);
        S(chk, r[0]);
        M2(chk, chk, den);
        if (neq25519(chk, num)) M2(r[0], r[0], I2);
        S(chk, r[0]);
        M2(chk, chk, den);
        if (neq25519(chk, num)) return -1;
        if (par25519(r[0]) === p[31] >> 7) Z(r[0], gf0, r[0]);
        M2(r[3], r[0], r[1]);
        return 0;
      }
      function crypto_sign_open(m, sm, n, pk) {
        var i;
        var t = new Uint8Array(32), h2 = new Uint8Array(64);
        var p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
        if (n < 64) return -1;
        if (unpackneg(q, pk)) return -1;
        for (i = 0; i < n; i++) m[i] = sm[i];
        for (i = 0; i < 32; i++) m[i + 32] = pk[i];
        crypto_hash(h2, m, n);
        reduce(h2);
        scalarmult(p, q, h2);
        scalarbase(q, sm.subarray(32));
        add2(p, q);
        pack(t, p);
        n -= 64;
        if (crypto_verify_32(sm, 0, t, 0)) {
          for (i = 0; i < n; i++) m[i] = 0;
          return -1;
        }
        for (i = 0; i < n; i++) m[i] = sm[i + 64];
        return n;
      }
      var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
      nacl.lowlevel = {
        crypto_core_hsalsa20,
        crypto_stream_xor,
        crypto_stream,
        crypto_stream_salsa20_xor,
        crypto_stream_salsa20,
        crypto_onetimeauth,
        crypto_onetimeauth_verify,
        crypto_verify_16,
        crypto_verify_32,
        crypto_secretbox,
        crypto_secretbox_open,
        crypto_scalarmult,
        crypto_scalarmult_base,
        crypto_box_beforenm,
        crypto_box_afternm,
        crypto_box,
        crypto_box_open,
        crypto_box_keypair,
        crypto_hash,
        crypto_sign,
        crypto_sign_keypair,
        crypto_sign_open,
        crypto_secretbox_KEYBYTES,
        crypto_secretbox_NONCEBYTES,
        crypto_secretbox_ZEROBYTES,
        crypto_secretbox_BOXZEROBYTES,
        crypto_scalarmult_BYTES,
        crypto_scalarmult_SCALARBYTES,
        crypto_box_PUBLICKEYBYTES,
        crypto_box_SECRETKEYBYTES,
        crypto_box_BEFORENMBYTES,
        crypto_box_NONCEBYTES,
        crypto_box_ZEROBYTES,
        crypto_box_BOXZEROBYTES,
        crypto_sign_BYTES,
        crypto_sign_PUBLICKEYBYTES,
        crypto_sign_SECRETKEYBYTES,
        crypto_sign_SEEDBYTES,
        crypto_hash_BYTES,
        gf,
        D,
        L: L3,
        pack25519,
        unpack25519,
        M: M2,
        A,
        S,
        Z,
        pow2523,
        add: add2,
        set25519,
        modL,
        scalarmult,
        scalarbase
      };
      function checkLengths(k, n) {
        if (k.length !== crypto_secretbox_KEYBYTES) throw new Error("bad key size");
        if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error("bad nonce size");
      }
      function checkBoxLengths(pk, sk) {
        if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error("bad public key size");
        if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
      }
      function checkArrayTypes() {
        for (var i = 0; i < arguments.length; i++) {
          if (!(arguments[i] instanceof Uint8Array))
            throw new TypeError("unexpected type, use Uint8Array");
        }
      }
      function cleanup(arr) {
        for (var i = 0; i < arr.length; i++) arr[i] = 0;
      }
      nacl.randomBytes = function(n) {
        var b = new Uint8Array(n);
        randombytes(b, n);
        return b;
      };
      nacl.secretbox = function(msg, nonce, key) {
        checkArrayTypes(msg, nonce, key);
        checkLengths(key, nonce);
        var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
        var c = new Uint8Array(m.length);
        for (var i = 0; i < msg.length; i++) m[i + crypto_secretbox_ZEROBYTES] = msg[i];
        crypto_secretbox(c, m, m.length, nonce, key);
        return c.subarray(crypto_secretbox_BOXZEROBYTES);
      };
      nacl.secretbox.open = function(box, nonce, key) {
        checkArrayTypes(box, nonce, key);
        checkLengths(key, nonce);
        var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
        var m = new Uint8Array(c.length);
        for (var i = 0; i < box.length; i++) c[i + crypto_secretbox_BOXZEROBYTES] = box[i];
        if (c.length < 32) return null;
        if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
        return m.subarray(crypto_secretbox_ZEROBYTES);
      };
      nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
      nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
      nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
      nacl.scalarMult = function(n, p) {
        checkArrayTypes(n, p);
        if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
        if (p.length !== crypto_scalarmult_BYTES) throw new Error("bad p size");
        var q = new Uint8Array(crypto_scalarmult_BYTES);
        crypto_scalarmult(q, n, p);
        return q;
      };
      nacl.scalarMult.base = function(n) {
        checkArrayTypes(n);
        if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
        var q = new Uint8Array(crypto_scalarmult_BYTES);
        crypto_scalarmult_base(q, n);
        return q;
      };
      nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
      nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
      nacl.box = function(msg, nonce, publicKey, secretKey) {
        var k = nacl.box.before(publicKey, secretKey);
        return nacl.secretbox(msg, nonce, k);
      };
      nacl.box.before = function(publicKey, secretKey) {
        checkArrayTypes(publicKey, secretKey);
        checkBoxLengths(publicKey, secretKey);
        var k = new Uint8Array(crypto_box_BEFORENMBYTES);
        crypto_box_beforenm(k, publicKey, secretKey);
        return k;
      };
      nacl.box.after = nacl.secretbox;
      nacl.box.open = function(msg, nonce, publicKey, secretKey) {
        var k = nacl.box.before(publicKey, secretKey);
        return nacl.secretbox.open(msg, nonce, k);
      };
      nacl.box.open.after = nacl.secretbox.open;
      nacl.box.keyPair = function() {
        var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
        crypto_box_keypair(pk, sk);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.box.keyPair.fromSecretKey = function(secretKey) {
        checkArrayTypes(secretKey);
        if (secretKey.length !== crypto_box_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
        crypto_scalarmult_base(pk, secretKey);
        return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
      };
      nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
      nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
      nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
      nacl.box.nonceLength = crypto_box_NONCEBYTES;
      nacl.box.overheadLength = nacl.secretbox.overheadLength;
      nacl.sign = function(msg, secretKey) {
        checkArrayTypes(msg, secretKey);
        if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
        crypto_sign(signedMsg, msg, msg.length, secretKey);
        return signedMsg;
      };
      nacl.sign.open = function(signedMsg, publicKey) {
        checkArrayTypes(signedMsg, publicKey);
        if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
          throw new Error("bad public key size");
        var tmp = new Uint8Array(signedMsg.length);
        var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
        if (mlen < 0) return null;
        var m = new Uint8Array(mlen);
        for (var i = 0; i < m.length; i++) m[i] = tmp[i];
        return m;
      };
      nacl.sign.detached = function(msg, secretKey) {
        var signedMsg = nacl.sign(msg, secretKey);
        var sig = new Uint8Array(crypto_sign_BYTES);
        for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
        return sig;
      };
      nacl.sign.detached.verify = function(msg, sig, publicKey) {
        checkArrayTypes(msg, sig, publicKey);
        if (sig.length !== crypto_sign_BYTES)
          throw new Error("bad signature size");
        if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
          throw new Error("bad public key size");
        var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
        var m = new Uint8Array(crypto_sign_BYTES + msg.length);
        var i;
        for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
        for (i = 0; i < msg.length; i++) sm[i + crypto_sign_BYTES] = msg[i];
        return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
      };
      nacl.sign.keyPair = function() {
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
        crypto_sign_keypair(pk, sk);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.sign.keyPair.fromSecretKey = function(secretKey) {
        checkArrayTypes(secretKey);
        if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];
        return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
      };
      nacl.sign.keyPair.fromSeed = function(seed) {
        checkArrayTypes(seed);
        if (seed.length !== crypto_sign_SEEDBYTES)
          throw new Error("bad seed size");
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
        for (var i = 0; i < 32; i++) sk[i] = seed[i];
        crypto_sign_keypair(pk, sk, true);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
      nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
      nacl.sign.seedLength = crypto_sign_SEEDBYTES;
      nacl.sign.signatureLength = crypto_sign_BYTES;
      nacl.hash = function(msg) {
        checkArrayTypes(msg);
        var h2 = new Uint8Array(crypto_hash_BYTES);
        crypto_hash(h2, msg, msg.length);
        return h2;
      };
      nacl.hash.hashLength = crypto_hash_BYTES;
      nacl.verify = function(x, y) {
        checkArrayTypes(x, y);
        if (x.length === 0 || y.length === 0) return false;
        if (x.length !== y.length) return false;
        return vn(x, 0, y, 0, x.length) === 0 ? true : false;
      };
      nacl.setPRNG = function(fn) {
        randombytes = fn;
      };
      (function() {
        var crypto3 = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
        if (crypto3 && crypto3.getRandomValues) {
          var QUOTA = 65536;
          nacl.setPRNG(function(x, n) {
            var i, v = new Uint8Array(n);
            for (i = 0; i < n; i += QUOTA) {
              crypto3.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
            }
            for (i = 0; i < n; i++) x[i] = v[i];
            cleanup(v);
          });
        } else if (typeof require !== "undefined") {
          crypto3 = require("crypto");
          if (crypto3 && crypto3.randomBytes) {
            nacl.setPRNG(function(x, n) {
              var i, v = crypto3.randomBytes(n);
              for (i = 0; i < n; i++) x[i] = v[i];
              cleanup(v);
            });
          }
        }
      })();
    })(typeof module2 !== "undefined" && module2.exports ? module2.exports : self.nacl = self.nacl || {});
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/helper.js
var require_helper = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/helper.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getEd25519Helper = exports2.setEd25519Helper = void 0;
    var helper;
    function setEd25519Helper(lib) {
      helper = lib;
    }
    exports2.setEd25519Helper = setEd25519Helper;
    function getEd25519Helper() {
      return helper;
    }
    exports2.getEd25519Helper = getEd25519Helper;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/crc16.js
var require_crc16 = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/crc16.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.crc16 = void 0;
    var crc16tab = new Uint16Array([
      0,
      4129,
      8258,
      12387,
      16516,
      20645,
      24774,
      28903,
      33032,
      37161,
      41290,
      45419,
      49548,
      53677,
      57806,
      61935,
      4657,
      528,
      12915,
      8786,
      21173,
      17044,
      29431,
      25302,
      37689,
      33560,
      45947,
      41818,
      54205,
      50076,
      62463,
      58334,
      9314,
      13379,
      1056,
      5121,
      25830,
      29895,
      17572,
      21637,
      42346,
      46411,
      34088,
      38153,
      58862,
      62927,
      50604,
      54669,
      13907,
      9842,
      5649,
      1584,
      30423,
      26358,
      22165,
      18100,
      46939,
      42874,
      38681,
      34616,
      63455,
      59390,
      55197,
      51132,
      18628,
      22757,
      26758,
      30887,
      2112,
      6241,
      10242,
      14371,
      51660,
      55789,
      59790,
      63919,
      35144,
      39273,
      43274,
      47403,
      23285,
      19156,
      31415,
      27286,
      6769,
      2640,
      14899,
      10770,
      56317,
      52188,
      64447,
      60318,
      39801,
      35672,
      47931,
      43802,
      27814,
      31879,
      19684,
      23749,
      11298,
      15363,
      3168,
      7233,
      60846,
      64911,
      52716,
      56781,
      44330,
      48395,
      36200,
      40265,
      32407,
      28342,
      24277,
      20212,
      15891,
      11826,
      7761,
      3696,
      65439,
      61374,
      57309,
      53244,
      48923,
      44858,
      40793,
      36728,
      37256,
      33193,
      45514,
      41451,
      53516,
      49453,
      61774,
      57711,
      4224,
      161,
      12482,
      8419,
      20484,
      16421,
      28742,
      24679,
      33721,
      37784,
      41979,
      46042,
      49981,
      54044,
      58239,
      62302,
      689,
      4752,
      8947,
      13010,
      16949,
      21012,
      25207,
      29270,
      46570,
      42443,
      38312,
      34185,
      62830,
      58703,
      54572,
      50445,
      13538,
      9411,
      5280,
      1153,
      29798,
      25671,
      21540,
      17413,
      42971,
      47098,
      34713,
      38840,
      59231,
      63358,
      50973,
      55100,
      9939,
      14066,
      1681,
      5808,
      26199,
      30326,
      17941,
      22068,
      55628,
      51565,
      63758,
      59695,
      39368,
      35305,
      47498,
      43435,
      22596,
      18533,
      30726,
      26663,
      6336,
      2273,
      14466,
      10403,
      52093,
      56156,
      60223,
      64286,
      35833,
      39896,
      43963,
      48026,
      19061,
      23124,
      27191,
      31254,
      2801,
      6864,
      10931,
      14994,
      64814,
      60687,
      56684,
      52557,
      48554,
      44427,
      40424,
      36297,
      31782,
      27655,
      23652,
      19525,
      15522,
      11395,
      7392,
      3265,
      61215,
      65342,
      53085,
      57212,
      44955,
      49082,
      36825,
      40952,
      28183,
      32310,
      20053,
      24180,
      11923,
      16050,
      3793,
      7920
    ]);
    var crc16 = class _crc16 {
      // crc16 returns the crc for the data provided.
      static checksum(data) {
        let crc = 0;
        for (let i = 0; i < data.byteLength; i++) {
          let b = data[i];
          crc = crc << 8 & 65535 ^ crc16tab[(crc >> 8 ^ b) & 255];
        }
        return crc;
      }
      // validate will check the calculated crc16 checksum for data against the expected.
      static validate(data, expected) {
        let ba = _crc16.checksum(data);
        return ba == expected;
      }
    };
    exports2.crc16 = crc16;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/base32.js
var require_base32 = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/base32.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.base32 = void 0;
    var b32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var base32 = class {
      static encode(src) {
        let bits = 0;
        let value = 0;
        let a = new Uint8Array(src);
        let buf = new Uint8Array(src.byteLength * 2);
        let j = 0;
        for (let i = 0; i < a.byteLength; i++) {
          value = value << 8 | a[i];
          bits += 8;
          while (bits >= 5) {
            let index = value >>> bits - 5 & 31;
            buf[j++] = b32Alphabet.charAt(index).charCodeAt(0);
            bits -= 5;
          }
        }
        if (bits > 0) {
          let index = value << 5 - bits & 31;
          buf[j++] = b32Alphabet.charAt(index).charCodeAt(0);
        }
        return buf.slice(0, j);
      }
      static decode(src) {
        let bits = 0;
        let byte = 0;
        let j = 0;
        let a = new Uint8Array(src);
        let out = new Uint8Array(a.byteLength * 5 / 8 | 0);
        for (let i = 0; i < a.byteLength; i++) {
          let v = String.fromCharCode(a[i]);
          let vv = b32Alphabet.indexOf(v);
          if (vv === -1) {
            throw new Error("Illegal Base32 character: " + a[i]);
          }
          byte = byte << 5 | vv;
          bits += 5;
          if (bits >= 8) {
            out[j++] = byte >>> bits - 8 & 255;
            bits -= 8;
          }
        }
        return out.slice(0, j);
      }
    };
    exports2.base32 = base32;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/codec.js
var require_codec2 = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/codec.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Codec = void 0;
    var crc16_1 = require_crc16();
    var nkeys_1 = require_nkeys();
    var base32_1 = require_base32();
    var Codec = class _Codec {
      static encode(prefix, src) {
        if (!src || !(src instanceof Uint8Array)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.SerializationError);
        }
        if (!nkeys_1.Prefixes.isValidPrefix(prefix)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        return _Codec._encode(false, prefix, src);
      }
      static encodeSeed(role, src) {
        if (!src) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ApiError);
        }
        if (!nkeys_1.Prefixes.isValidPublicPrefix(role)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        if (src.byteLength !== 32) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidSeedLen);
        }
        return _Codec._encode(true, role, src);
      }
      static decode(expected, src) {
        if (!nkeys_1.Prefixes.isValidPrefix(expected)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        const raw2 = _Codec._decode(src);
        if (raw2[0] !== expected) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        return raw2.slice(1);
      }
      static decodeSeed(src) {
        const raw2 = _Codec._decode(src);
        const prefix = _Codec._decodePrefix(raw2);
        if (prefix[0] != nkeys_1.Prefix.Seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidSeed);
        }
        if (!nkeys_1.Prefixes.isValidPublicPrefix(prefix[1])) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        return { buf: raw2.slice(2), prefix: prefix[1] };
      }
      // unsafe encode no prefix/role validation
      static _encode(seed, role, payload) {
        const payloadOffset = seed ? 2 : 1;
        const payloadLen = payload.byteLength;
        const checkLen = 2;
        const cap = payloadOffset + payloadLen + checkLen;
        const checkOffset = payloadOffset + payloadLen;
        const raw2 = new Uint8Array(cap);
        if (seed) {
          const encodedPrefix = _Codec._encodePrefix(nkeys_1.Prefix.Seed, role);
          raw2.set(encodedPrefix);
        } else {
          raw2[0] = role;
        }
        raw2.set(payload, payloadOffset);
        const checksum = crc16_1.crc16.checksum(raw2.slice(0, checkOffset));
        const dv = new DataView(raw2.buffer);
        dv.setUint16(checkOffset, checksum, true);
        return base32_1.base32.encode(raw2);
      }
      // unsafe decode - no prefix/role validation
      static _decode(src) {
        if (src.byteLength < 4) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncoding);
        }
        let raw2;
        try {
          raw2 = base32_1.base32.decode(src);
        } catch (ex) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncoding, ex);
        }
        const checkOffset = raw2.byteLength - 2;
        const dv = new DataView(raw2.buffer);
        const checksum = dv.getUint16(checkOffset, true);
        const payload = raw2.slice(0, checkOffset);
        if (!crc16_1.crc16.validate(payload, checksum)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidChecksum);
        }
        return payload;
      }
      static _encodePrefix(kind, role) {
        const b1 = kind | role >> 5;
        const b2 = (role & 31) << 3;
        return new Uint8Array([b1, b2]);
      }
      static _decodePrefix(raw2) {
        const b1 = raw2[0] & 248;
        const b2 = (raw2[0] & 7) << 5 | (raw2[1] & 248) >> 3;
        return new Uint8Array([b1, b2]);
      }
    };
    exports2.Codec = Codec;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/kp.js
var require_kp = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/kp.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.KP = void 0;
    var codec_1 = require_codec2();
    var nkeys_1 = require_nkeys();
    var helper_1 = require_helper();
    var KP = class {
      constructor(seed) {
        this.seed = seed;
      }
      getRawSeed() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        let sd = codec_1.Codec.decodeSeed(this.seed);
        return sd.buf;
      }
      getSeed() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return this.seed;
      }
      getPublicKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const sd = codec_1.Codec.decodeSeed(this.seed);
        const kp = (0, helper_1.getEd25519Helper)().fromSeed(this.getRawSeed());
        const buf = codec_1.Codec.encode(sd.prefix, kp.publicKey);
        return new TextDecoder().decode(buf);
      }
      getPrivateKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const kp = (0, helper_1.getEd25519Helper)().fromSeed(this.getRawSeed());
        return codec_1.Codec.encode(nkeys_1.Prefix.Private, kp.secretKey);
      }
      sign(input) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const kp = (0, helper_1.getEd25519Helper)().fromSeed(this.getRawSeed());
        return (0, helper_1.getEd25519Helper)().sign(input, kp.secretKey);
      }
      verify(input, sig) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const kp = (0, helper_1.getEd25519Helper)().fromSeed(this.getRawSeed());
        return (0, helper_1.getEd25519Helper)().verify(input, sig, kp.publicKey);
      }
      clear() {
        if (!this.seed) {
          return;
        }
        this.seed.fill(0);
        this.seed = void 0;
      }
      seal(input, recipient, nonce) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
      open(message, sender) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
    };
    exports2.KP = KP;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/public.js
var require_public = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/public.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PublicKey = void 0;
    var codec_1 = require_codec2();
    var nkeys_1 = require_nkeys();
    var helper_1 = require_helper();
    var PublicKey = class {
      constructor(publicKey) {
        this.publicKey = publicKey;
      }
      getPublicKey() {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return new TextDecoder().decode(this.publicKey);
      }
      getPrivateKey() {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.PublicKeyOnly);
      }
      getSeed() {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.PublicKeyOnly);
      }
      sign(_) {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.CannotSign);
      }
      verify(input, sig) {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        let buf = codec_1.Codec._decode(this.publicKey);
        return (0, helper_1.getEd25519Helper)().verify(input, sig, buf.slice(1));
      }
      clear() {
        if (!this.publicKey) {
          return;
        }
        this.publicKey.fill(0);
        this.publicKey = void 0;
      }
      seal(input, recipient, nonce) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
      open(message, sender) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
    };
    exports2.PublicKey = PublicKey;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/curve.js
var require_curve = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/curve.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CurveKP = exports2.curveNonceLen = exports2.curveKeyLen = void 0;
    var nkeys_1 = require_nkeys();
    var helper_1 = require_helper();
    var codec_1 = require_codec2();
    var mod_1 = require_mod();
    var base32_1 = require_base32();
    var crc16_1 = require_crc16();
    exports2.curveKeyLen = 32;
    var curveDecodeLen = 35;
    exports2.curveNonceLen = 24;
    var XKeyVersionV1 = [120, 107, 118, 49];
    var CurveKP = class {
      constructor(seed) {
        this.seed = seed;
      }
      clear() {
        if (!this.seed) {
          return;
        }
        this.seed.fill(0);
        this.seed = void 0;
      }
      getPrivateKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return codec_1.Codec.encode(mod_1.Prefix.Private, this.seed);
      }
      getPublicKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const pub = (0, helper_1.getEd25519Helper)().scalarBaseMultiply(this.seed);
        const buf = codec_1.Codec.encode(mod_1.Prefix.Curve, pub);
        return new TextDecoder().decode(buf);
      }
      getSeed() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return codec_1.Codec.encodeSeed(mod_1.Prefix.Curve, this.seed);
      }
      sign() {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidCurveOperation);
      }
      verify() {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidCurveOperation);
      }
      decodePubCurveKey(src) {
        try {
          const raw2 = base32_1.base32.decode(new TextEncoder().encode(src));
          if (raw2.byteLength !== curveDecodeLen) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidCurveKey);
          }
          if (raw2[0] !== mod_1.Prefix.Curve) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPublicKey);
          }
          const checkOffset = raw2.byteLength - 2;
          const dv = new DataView(raw2.buffer);
          const checksum = dv.getUint16(checkOffset, true);
          const payload = raw2.slice(0, checkOffset);
          if (!crc16_1.crc16.validate(payload, checksum)) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidChecksum);
          }
          return payload.slice(1);
        } catch (ex) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidRecipient, ex);
        }
      }
      seal(message, recipient, nonce) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        if (!nonce) {
          nonce = (0, helper_1.getEd25519Helper)().randomBytes(exports2.curveNonceLen);
        }
        let pub = this.decodePubCurveKey(recipient);
        const out = new Uint8Array(XKeyVersionV1.length + exports2.curveNonceLen);
        out.set(XKeyVersionV1, 0);
        out.set(nonce, XKeyVersionV1.length);
        const encrypted = (0, helper_1.getEd25519Helper)().seal(message, nonce, pub, this.seed);
        const fullMessage = new Uint8Array(out.length + encrypted.length);
        fullMessage.set(out);
        fullMessage.set(encrypted, out.length);
        return fullMessage;
      }
      open(message, sender) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        if (message.length <= exports2.curveNonceLen + XKeyVersionV1.length) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncrypted);
        }
        for (let i = 0; i < XKeyVersionV1.length; i++) {
          if (message[i] !== XKeyVersionV1[i]) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncrypted);
          }
        }
        const pub = this.decodePubCurveKey(sender);
        message = message.slice(XKeyVersionV1.length);
        const nonce = message.slice(0, exports2.curveNonceLen);
        message = message.slice(exports2.curveNonceLen);
        return (0, helper_1.getEd25519Helper)().open(message, nonce, pub, this.seed);
      }
    };
    exports2.CurveKP = CurveKP;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/nkeys.js
var require_nkeys = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/nkeys.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NKeysError = exports2.NKeysErrorCode = exports2.Prefixes = exports2.Prefix = exports2.fromSeed = exports2.fromCurveSeed = exports2.fromPublic = exports2.createCurve = exports2.createServer = exports2.createCluster = exports2.createUser = exports2.createAccount = exports2.createOperator = exports2.createPair = void 0;
    var kp_1 = require_kp();
    var public_1 = require_public();
    var codec_1 = require_codec2();
    var helper_1 = require_helper();
    var curve_1 = require_curve();
    function createPair(prefix) {
      const len = prefix === Prefix.Curve ? curve_1.curveKeyLen : 32;
      const rawSeed = (0, helper_1.getEd25519Helper)().randomBytes(len);
      let str = codec_1.Codec.encodeSeed(prefix, new Uint8Array(rawSeed));
      return prefix === Prefix.Curve ? new curve_1.CurveKP(new Uint8Array(rawSeed)) : new kp_1.KP(str);
    }
    exports2.createPair = createPair;
    function createOperator() {
      return createPair(Prefix.Operator);
    }
    exports2.createOperator = createOperator;
    function createAccount() {
      return createPair(Prefix.Account);
    }
    exports2.createAccount = createAccount;
    function createUser() {
      return createPair(Prefix.User);
    }
    exports2.createUser = createUser;
    function createCluster() {
      return createPair(Prefix.Cluster);
    }
    exports2.createCluster = createCluster;
    function createServer() {
      return createPair(Prefix.Server);
    }
    exports2.createServer = createServer;
    function createCurve() {
      return createPair(Prefix.Curve);
    }
    exports2.createCurve = createCurve;
    function fromPublic(src) {
      const ba = new TextEncoder().encode(src);
      const raw2 = codec_1.Codec._decode(ba);
      const prefix = Prefixes.parsePrefix(raw2[0]);
      if (Prefixes.isValidPublicPrefix(prefix)) {
        return new public_1.PublicKey(ba);
      }
      throw new NKeysError(NKeysErrorCode.InvalidPublicKey);
    }
    exports2.fromPublic = fromPublic;
    function fromCurveSeed(src) {
      const sd = codec_1.Codec.decodeSeed(src);
      if (sd.prefix !== Prefix.Curve) {
        throw new NKeysError(NKeysErrorCode.InvalidCurveSeed);
      }
      if (sd.buf.byteLength !== curve_1.curveKeyLen) {
        throw new NKeysError(NKeysErrorCode.InvalidSeedLen);
      }
      return new curve_1.CurveKP(sd.buf);
    }
    exports2.fromCurveSeed = fromCurveSeed;
    function fromSeed(src) {
      const sd = codec_1.Codec.decodeSeed(src);
      if (sd.prefix === Prefix.Curve) {
        return fromCurveSeed(src);
      }
      return new kp_1.KP(src);
    }
    exports2.fromSeed = fromSeed;
    var Prefix;
    (function(Prefix2) {
      Prefix2[Prefix2["Unknown"] = -1] = "Unknown";
      Prefix2[Prefix2["Seed"] = 144] = "Seed";
      Prefix2[Prefix2["Private"] = 120] = "Private";
      Prefix2[Prefix2["Operator"] = 112] = "Operator";
      Prefix2[Prefix2["Server"] = 104] = "Server";
      Prefix2[Prefix2["Cluster"] = 16] = "Cluster";
      Prefix2[Prefix2["Account"] = 0] = "Account";
      Prefix2[Prefix2["User"] = 160] = "User";
      Prefix2[Prefix2["Curve"] = 184] = "Curve";
    })(Prefix || (exports2.Prefix = Prefix = {}));
    var Prefixes = class {
      static isValidPublicPrefix(prefix) {
        return prefix == Prefix.Server || prefix == Prefix.Operator || prefix == Prefix.Cluster || prefix == Prefix.Account || prefix == Prefix.User || prefix == Prefix.Curve;
      }
      static startsWithValidPrefix(s) {
        let c = s[0];
        return c == "S" || c == "P" || c == "O" || c == "N" || c == "C" || c == "A" || c == "U" || c == "X";
      }
      static isValidPrefix(prefix) {
        let v = this.parsePrefix(prefix);
        return v !== Prefix.Unknown;
      }
      static parsePrefix(v) {
        switch (v) {
          case Prefix.Seed:
            return Prefix.Seed;
          case Prefix.Private:
            return Prefix.Private;
          case Prefix.Operator:
            return Prefix.Operator;
          case Prefix.Server:
            return Prefix.Server;
          case Prefix.Cluster:
            return Prefix.Cluster;
          case Prefix.Account:
            return Prefix.Account;
          case Prefix.User:
            return Prefix.User;
          case Prefix.Curve:
            return Prefix.Curve;
          default:
            return Prefix.Unknown;
        }
      }
    };
    exports2.Prefixes = Prefixes;
    var NKeysErrorCode;
    (function(NKeysErrorCode2) {
      NKeysErrorCode2["InvalidPrefixByte"] = "nkeys: invalid prefix byte";
      NKeysErrorCode2["InvalidKey"] = "nkeys: invalid key";
      NKeysErrorCode2["InvalidPublicKey"] = "nkeys: invalid public key";
      NKeysErrorCode2["InvalidSeedLen"] = "nkeys: invalid seed length";
      NKeysErrorCode2["InvalidSeed"] = "nkeys: invalid seed";
      NKeysErrorCode2["InvalidCurveSeed"] = "nkeys: invalid curve seed";
      NKeysErrorCode2["InvalidCurveKey"] = "nkeys: not a valid curve key";
      NKeysErrorCode2["InvalidCurveOperation"] = "nkeys: curve key is not valid for sign/verify";
      NKeysErrorCode2["InvalidNKeyOperation"] = "keys: only curve key can seal/open";
      NKeysErrorCode2["InvalidEncoding"] = "nkeys: invalid encoded key";
      NKeysErrorCode2["InvalidRecipient"] = "nkeys: not a valid recipient public curve key";
      NKeysErrorCode2["InvalidEncrypted"] = "nkeys: encrypted input is not valid";
      NKeysErrorCode2["CannotSign"] = "nkeys: cannot sign, no private key available";
      NKeysErrorCode2["PublicKeyOnly"] = "nkeys: no seed or private key available";
      NKeysErrorCode2["InvalidChecksum"] = "nkeys: invalid checksum";
      NKeysErrorCode2["SerializationError"] = "nkeys: serialization error";
      NKeysErrorCode2["ApiError"] = "nkeys: api error";
      NKeysErrorCode2["ClearedPair"] = "nkeys: pair is cleared";
    })(NKeysErrorCode || (exports2.NKeysErrorCode = NKeysErrorCode = {}));
    var NKeysError = class extends Error {
      /**
       * @param {NKeysErrorCode} code
       * @param {Error} [chainedError]
       * @constructor
       *
       * @api private
       */
      constructor(code, chainedError) {
        super(code);
        this.name = "NKeysError";
        this.code = code;
        this.chainedError = chainedError;
      }
    };
    exports2.NKeysError = NKeysError;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/util.js
var require_util2 = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.dump = exports2.decode = exports2.encode = void 0;
    function encode(bytes) {
      return btoa(String.fromCharCode(...bytes));
    }
    exports2.encode = encode;
    function decode(b64str) {
      const bin = atob(b64str);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes;
    }
    exports2.decode = decode;
    function dump(buf, msg) {
      if (msg) {
        console.log(msg);
      }
      let a = [];
      for (let i = 0; i < buf.byteLength; i++) {
        if (i % 8 === 0) {
          a.push("\n");
        }
        let v = buf[i].toString(16);
        if (v.length === 1) {
          v = "0" + v;
        }
        a.push(v);
      }
      console.log(a.join("  "));
    }
    exports2.dump = dump;
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/mod.js
var require_mod = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.encode = exports2.decode = exports2.Prefix = exports2.NKeysErrorCode = exports2.NKeysError = exports2.fromSeed = exports2.fromPublic = exports2.fromCurveSeed = exports2.createUser = exports2.createServer = exports2.createPair = exports2.createOperator = exports2.createCurve = exports2.createCluster = exports2.createAccount = void 0;
    var nkeys_1 = require_nkeys();
    Object.defineProperty(exports2, "createAccount", { enumerable: true, get: function() {
      return nkeys_1.createAccount;
    } });
    Object.defineProperty(exports2, "createCluster", { enumerable: true, get: function() {
      return nkeys_1.createCluster;
    } });
    Object.defineProperty(exports2, "createCurve", { enumerable: true, get: function() {
      return nkeys_1.createCurve;
    } });
    Object.defineProperty(exports2, "createOperator", { enumerable: true, get: function() {
      return nkeys_1.createOperator;
    } });
    Object.defineProperty(exports2, "createPair", { enumerable: true, get: function() {
      return nkeys_1.createPair;
    } });
    Object.defineProperty(exports2, "createServer", { enumerable: true, get: function() {
      return nkeys_1.createServer;
    } });
    Object.defineProperty(exports2, "createUser", { enumerable: true, get: function() {
      return nkeys_1.createUser;
    } });
    Object.defineProperty(exports2, "fromCurveSeed", { enumerable: true, get: function() {
      return nkeys_1.fromCurveSeed;
    } });
    Object.defineProperty(exports2, "fromPublic", { enumerable: true, get: function() {
      return nkeys_1.fromPublic;
    } });
    Object.defineProperty(exports2, "fromSeed", { enumerable: true, get: function() {
      return nkeys_1.fromSeed;
    } });
    Object.defineProperty(exports2, "NKeysError", { enumerable: true, get: function() {
      return nkeys_1.NKeysError;
    } });
    Object.defineProperty(exports2, "NKeysErrorCode", { enumerable: true, get: function() {
      return nkeys_1.NKeysErrorCode;
    } });
    Object.defineProperty(exports2, "Prefix", { enumerable: true, get: function() {
      return nkeys_1.Prefix;
    } });
    var util_1 = require_util2();
    Object.defineProperty(exports2, "decode", { enumerable: true, get: function() {
      return util_1.decode;
    } });
    Object.defineProperty(exports2, "encode", { enumerable: true, get: function() {
      return util_1.encode;
    } });
  }
});

// node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/nkeys.js@1.1.0/node_modules/nkeys.js/lib/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var nacl = require_nacl_fast();
    var helper = {
      randomBytes: nacl.randomBytes,
      verify: nacl.sign.detached.verify,
      fromSeed: nacl.sign.keyPair.fromSeed,
      sign: nacl.sign.detached,
      scalarBaseMultiply: nacl.scalarMult.base,
      seal: nacl.box,
      open: nacl.box.open
    };
    if (typeof TextEncoder === "undefined") {
      const util = require("util");
      global.TextEncoder = util.TextEncoder;
      global.TextDecoder = util.TextDecoder;
    }
    if (typeof atob === "undefined") {
      global.atob = (a) => {
        return Buffer.from(a, "base64").toString("binary");
      };
      global.btoa = (b) => {
        return Buffer.from(b, "binary").toString("base64");
      };
    }
    var { setEd25519Helper } = require_helper();
    setEd25519Helper(helper);
    __exportStar(require_mod(), exports2);
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/nkeys.js
var require_nkeys2 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/nkeys.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nkeys = void 0;
    exports2.nkeys = require_lib();
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/authenticator.js
var require_authenticator = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/authenticator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.multiAuthenticator = multiAuthenticator;
    exports2.noAuthFn = noAuthFn;
    exports2.usernamePasswordAuthenticator = usernamePasswordAuthenticator;
    exports2.tokenAuthenticator = tokenAuthenticator2;
    exports2.nkeyAuthenticator = nkeyAuthenticator;
    exports2.jwtAuthenticator = jwtAuthenticator;
    exports2.credsAuthenticator = credsAuthenticator2;
    var nkeys_1 = require_nkeys2();
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    function multiAuthenticator(authenticators) {
      return (nonce) => {
        let auth = {};
        authenticators.forEach((a) => {
          const args = a(nonce) || {};
          auth = Object.assign(auth, args);
        });
        return auth;
      };
    }
    function noAuthFn() {
      return () => {
        return;
      };
    }
    function usernamePasswordAuthenticator(user, pass) {
      return () => {
        const u = typeof user === "function" ? user() : user;
        const p = typeof pass === "function" ? pass() : pass;
        return { user: u, pass: p };
      };
    }
    function tokenAuthenticator2(token) {
      return () => {
        const auth_token = typeof token === "function" ? token() : token;
        return { auth_token };
      };
    }
    function nkeyAuthenticator(seed) {
      return (nonce) => {
        const s = typeof seed === "function" ? seed() : seed;
        const kp = s ? nkeys_1.nkeys.fromSeed(s) : void 0;
        const nkey = kp ? kp.getPublicKey() : "";
        const challenge = encoders_1.TE.encode(nonce || "");
        const sigBytes = kp !== void 0 && nonce ? kp.sign(challenge) : void 0;
        const sig = sigBytes ? nkeys_1.nkeys.encode(sigBytes) : "";
        return { nkey, sig };
      };
    }
    function jwtAuthenticator(ajwt, seed) {
      return (nonce) => {
        const jwt = typeof ajwt === "function" ? ajwt() : ajwt;
        const fn = nkeyAuthenticator(seed);
        const { nkey, sig } = fn(nonce);
        return { jwt, nkey, sig };
      };
    }
    function credsAuthenticator2(creds) {
      const fn = typeof creds !== "function" ? () => creds : creds;
      const parse = () => {
        const CREDS = /\s*(?:(?:[-]{3,}[^\n]*[-]{3,}\n)(.+)(?:\n\s*[-]{3,}[^\n]*[-]{3,}\n))/ig;
        const s = encoders_1.TD.decode(fn());
        let m = CREDS.exec(s);
        if (!m) {
          throw core_1.NatsError.errorForCode(core_1.ErrorCode.BadCreds);
        }
        const jwt = m[1].trim();
        m = CREDS.exec(s);
        if (!m) {
          throw core_1.NatsError.errorForCode(core_1.ErrorCode.BadCreds);
        }
        if (!m) {
          throw core_1.NatsError.errorForCode(core_1.ErrorCode.BadCreds);
        }
        const seed = encoders_1.TE.encode(m[1].trim());
        return { jwt, seed };
      };
      const jwtFn = () => {
        const { jwt } = parse();
        return jwt;
      };
      const nkeyFn = () => {
        const { seed } = parse();
        return seed;
      };
      return jwtAuthenticator(jwtFn, nkeyFn);
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/options.js
var require_options = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/options.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_RECONNECT_TIME_WAIT = exports2.DEFAULT_MAX_PING_OUT = exports2.DEFAULT_PING_INTERVAL = exports2.DEFAULT_JITTER_TLS = exports2.DEFAULT_JITTER = exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = void 0;
    exports2.defaultOptions = defaultOptions;
    exports2.buildAuthenticator = buildAuthenticator;
    exports2.parseOptions = parseOptions;
    exports2.checkOptions = checkOptions;
    exports2.checkUnsupportedOption = checkUnsupportedOption;
    var util_1 = require_util();
    var transport_1 = require_transport();
    var core_1 = require_core();
    var authenticator_1 = require_authenticator();
    var core_2 = require_core();
    exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
    exports2.DEFAULT_JITTER = 100;
    exports2.DEFAULT_JITTER_TLS = 1e3;
    exports2.DEFAULT_PING_INTERVAL = 2 * 60 * 1e3;
    exports2.DEFAULT_MAX_PING_OUT = 2;
    exports2.DEFAULT_RECONNECT_TIME_WAIT = 2 * 1e3;
    function defaultOptions() {
      return {
        maxPingOut: exports2.DEFAULT_MAX_PING_OUT,
        maxReconnectAttempts: exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS,
        noRandomize: false,
        pedantic: false,
        pingInterval: exports2.DEFAULT_PING_INTERVAL,
        reconnect: true,
        reconnectJitter: exports2.DEFAULT_JITTER,
        reconnectJitterTLS: exports2.DEFAULT_JITTER_TLS,
        reconnectTimeWait: exports2.DEFAULT_RECONNECT_TIME_WAIT,
        tls: void 0,
        verbose: false,
        waitOnFirstConnect: false,
        ignoreAuthErrorAbort: false
      };
    }
    function buildAuthenticator(opts) {
      const buf = [];
      if (typeof opts.authenticator === "function") {
        buf.push(opts.authenticator);
      }
      if (Array.isArray(opts.authenticator)) {
        buf.push(...opts.authenticator);
      }
      if (opts.token) {
        buf.push((0, authenticator_1.tokenAuthenticator)(opts.token));
      }
      if (opts.user) {
        buf.push((0, authenticator_1.usernamePasswordAuthenticator)(opts.user, opts.pass));
      }
      return buf.length === 0 ? (0, authenticator_1.noAuthFn)() : (0, authenticator_1.multiAuthenticator)(buf);
    }
    function parseOptions(opts) {
      const dhp = `${core_2.DEFAULT_HOST}:${(0, transport_1.defaultPort)()}`;
      opts = opts || { servers: [dhp] };
      opts.servers = opts.servers || [];
      if (typeof opts.servers === "string") {
        opts.servers = [opts.servers];
      }
      if (opts.servers.length > 0 && opts.port) {
        throw new core_2.NatsError("port and servers options are mutually exclusive", core_2.ErrorCode.InvalidOption);
      }
      if (opts.servers.length === 0 && opts.port) {
        opts.servers = [`${core_2.DEFAULT_HOST}:${opts.port}`];
      }
      if (opts.servers && opts.servers.length === 0) {
        opts.servers = [dhp];
      }
      const options = (0, util_1.extend)(defaultOptions(), opts);
      options.authenticator = buildAuthenticator(options);
      ["reconnectDelayHandler", "authenticator"].forEach((n) => {
        if (options[n] && typeof options[n] !== "function") {
          throw new core_2.NatsError(`${n} option should be a function`, core_2.ErrorCode.NotFunction);
        }
      });
      if (!options.reconnectDelayHandler) {
        options.reconnectDelayHandler = () => {
          let extra = options.tls ? options.reconnectJitterTLS : options.reconnectJitter;
          if (extra) {
            extra++;
            extra = Math.floor(Math.random() * extra);
          }
          return options.reconnectTimeWait + extra;
        };
      }
      if (options.inboxPrefix) {
        try {
          (0, core_1.createInbox)(options.inboxPrefix);
        } catch (err2) {
          throw new core_2.NatsError(err2.message, core_2.ErrorCode.ApiError);
        }
      }
      if (options.resolve === void 0) {
        options.resolve = typeof (0, transport_1.getResolveFn)() === "function";
      }
      if (options.resolve) {
        if (typeof (0, transport_1.getResolveFn)() !== "function") {
          throw new core_2.NatsError(`'resolve' is not supported on this client`, core_2.ErrorCode.InvalidOption);
        }
      }
      return options;
    }
    function checkOptions(info, options) {
      const { proto, tls_required: tlsRequired, tls_available: tlsAvailable } = info;
      if ((proto === void 0 || proto < 1) && options.noEcho) {
        throw new core_2.NatsError("noEcho", core_2.ErrorCode.ServerOptionNotAvailable);
      }
      const tls = tlsRequired || tlsAvailable || false;
      if (options.tls && !tls) {
        throw new core_2.NatsError("tls", core_2.ErrorCode.ServerOptionNotAvailable);
      }
    }
    function checkUnsupportedOption(prop, v) {
      if (v) {
        throw new core_2.NatsError(prop, core_2.ErrorCode.InvalidOption);
      }
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/protocol.js
var require_protocol = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/protocol.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolHandler = exports2.Subscriptions = exports2.SubscriptionImpl = exports2.Connect = exports2.INFO = void 0;
    var encoders_1 = require_encoders();
    var transport_1 = require_transport();
    var util_1 = require_util();
    var databuffer_1 = require_databuffer();
    var servers_1 = require_servers();
    var queued_iterator_1 = require_queued_iterator();
    var muxsubscription_1 = require_muxsubscription();
    var heartbeats_1 = require_heartbeats();
    var parser_1 = require_parser();
    var msg_1 = require_msg();
    var semver_1 = require_semver();
    var core_1 = require_core();
    var options_1 = require_options();
    var FLUSH_THRESHOLD = 1024 * 32;
    exports2.INFO = /^INFO\s+([^\r\n]+)\r\n/i;
    var PONG_CMD = (0, encoders_1.encode)("PONG\r\n");
    var PING_CMD = (0, encoders_1.encode)("PING\r\n");
    var Connect = class {
      constructor(transport, opts, nonce) {
        this.protocol = 1;
        this.version = transport.version;
        this.lang = transport.lang;
        this.echo = opts.noEcho ? false : void 0;
        this.verbose = opts.verbose;
        this.pedantic = opts.pedantic;
        this.tls_required = opts.tls ? true : void 0;
        this.name = opts.name;
        const creds = (opts && typeof opts.authenticator === "function" ? opts.authenticator(nonce) : {}) || {};
        (0, util_1.extend)(this, creds);
      }
    };
    exports2.Connect = Connect;
    var SubscriptionImpl = class extends queued_iterator_1.QueuedIteratorImpl {
      constructor(protocol, subject, opts = {}) {
        var _a2;
        super();
        (0, util_1.extend)(this, opts);
        this.protocol = protocol;
        this.subject = subject;
        this.draining = false;
        this.noIterator = typeof opts.callback === "function";
        this.closed = (0, util_1.deferred)();
        const asyncTraces = !(((_a2 = protocol.options) === null || _a2 === void 0 ? void 0 : _a2.noAsyncTraces) || false);
        if (opts.timeout) {
          this.timer = (0, util_1.timeout)(opts.timeout, asyncTraces);
          this.timer.then(() => {
            this.timer = void 0;
          }).catch((err2) => {
            this.stop(err2);
            if (this.noIterator) {
              this.callback(err2, {});
            }
          });
        }
        if (!this.noIterator) {
          this.iterClosed.then(() => {
            this.closed.resolve();
            this.unsubscribe();
          });
        }
      }
      setPrePostHandlers(opts) {
        if (this.noIterator) {
          const uc = this.callback;
          const ingestion = opts.ingestionFilterFn ? opts.ingestionFilterFn : () => {
            return { ingest: true, protocol: false };
          };
          const filter = opts.protocolFilterFn ? opts.protocolFilterFn : () => {
            return true;
          };
          const dispatched = opts.dispatchedFn ? opts.dispatchedFn : () => {
          };
          this.callback = (err2, msg) => {
            const { ingest } = ingestion(msg);
            if (!ingest) {
              return;
            }
            if (filter(msg)) {
              uc(err2, msg);
              dispatched(msg);
            }
          };
        } else {
          this.protocolFilterFn = opts.protocolFilterFn;
          this.dispatchedFn = opts.dispatchedFn;
        }
      }
      callback(err2, msg) {
        this.cancelTimeout();
        err2 ? this.stop(err2) : this.push(msg);
      }
      close() {
        if (!this.isClosed()) {
          this.cancelTimeout();
          const fn = () => {
            this.stop();
            if (this.cleanupFn) {
              try {
                this.cleanupFn(this, this.info);
              } catch (_err) {
              }
            }
            this.closed.resolve();
          };
          if (this.noIterator) {
            fn();
          } else {
            this.push(fn);
          }
        }
      }
      unsubscribe(max) {
        this.protocol.unsubscribe(this, max);
      }
      cancelTimeout() {
        if (this.timer) {
          this.timer.cancel();
          this.timer = void 0;
        }
      }
      drain() {
        if (this.protocol.isClosed()) {
          return Promise.reject(core_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionClosed));
        }
        if (this.isClosed()) {
          return Promise.reject(core_1.NatsError.errorForCode(core_1.ErrorCode.SubClosed));
        }
        if (!this.drained) {
          this.draining = true;
          this.protocol.unsub(this);
          this.drained = this.protocol.flush((0, util_1.deferred)()).then(() => {
            this.protocol.subscriptions.cancel(this);
          }).catch(() => {
            this.protocol.subscriptions.cancel(this);
          });
        }
        return this.drained;
      }
      isDraining() {
        return this.draining;
      }
      isClosed() {
        return this.done;
      }
      getSubject() {
        return this.subject;
      }
      getMax() {
        return this.max;
      }
      getID() {
        return this.sid;
      }
    };
    exports2.SubscriptionImpl = SubscriptionImpl;
    var Subscriptions = class {
      constructor() {
        this.sidCounter = 0;
        this.mux = null;
        this.subs = /* @__PURE__ */ new Map();
      }
      size() {
        return this.subs.size;
      }
      add(s) {
        this.sidCounter++;
        s.sid = this.sidCounter;
        this.subs.set(s.sid, s);
        return s;
      }
      setMux(s) {
        this.mux = s;
        return s;
      }
      getMux() {
        return this.mux;
      }
      get(sid) {
        return this.subs.get(sid);
      }
      resub(s) {
        this.sidCounter++;
        this.subs.delete(s.sid);
        s.sid = this.sidCounter;
        this.subs.set(s.sid, s);
        return s;
      }
      all() {
        return Array.from(this.subs.values());
      }
      cancel(s) {
        if (s) {
          s.close();
          this.subs.delete(s.sid);
        }
      }
      handleError(err2) {
        if (err2 && err2.permissionContext) {
          const ctx = err2.permissionContext;
          const subs = this.all();
          let sub;
          if (ctx.operation === "subscription") {
            sub = subs.find((s) => {
              return s.subject === ctx.subject && s.queue === ctx.queue;
            });
          }
          if (ctx.operation === "publish") {
            sub = subs.find((s) => {
              return s.requestSubject === ctx.subject;
            });
          }
          if (sub) {
            sub.callback(err2, {});
            sub.close();
            this.subs.delete(sub.sid);
            return sub !== this.mux;
          }
        }
        return false;
      }
      close() {
        this.subs.forEach((sub) => {
          sub.close();
        });
      }
    };
    exports2.Subscriptions = Subscriptions;
    var ProtocolHandler = class _ProtocolHandler {
      constructor(options, publisher) {
        this._closed = false;
        this.connected = false;
        this.connectedOnce = false;
        this.infoReceived = false;
        this.noMorePublishing = false;
        this.abortReconnect = false;
        this.listeners = [];
        this.pendingLimit = FLUSH_THRESHOLD;
        this.outMsgs = 0;
        this.inMsgs = 0;
        this.outBytes = 0;
        this.inBytes = 0;
        this.options = options;
        this.publisher = publisher;
        this.subscriptions = new Subscriptions();
        this.muxSubscriptions = new muxsubscription_1.MuxSubscription();
        this.outbound = new databuffer_1.DataBuffer();
        this.pongs = [];
        this.whyClosed = "";
        this.pendingLimit = options.pendingLimit || this.pendingLimit;
        this.features = new semver_1.Features({ major: 0, minor: 0, micro: 0 });
        this.connectPromise = null;
        const servers = typeof options.servers === "string" ? [options.servers] : options.servers;
        this.servers = new servers_1.Servers(servers, {
          randomize: !options.noRandomize
        });
        this.closed = (0, util_1.deferred)();
        this.parser = new parser_1.Parser(this);
        this.heartbeats = new heartbeats_1.Heartbeat(this, this.options.pingInterval || options_1.DEFAULT_PING_INTERVAL, this.options.maxPingOut || options_1.DEFAULT_MAX_PING_OUT);
      }
      resetOutbound() {
        this.outbound.reset();
        const pongs = this.pongs;
        this.pongs = [];
        const err2 = core_1.NatsError.errorForCode(core_1.ErrorCode.Disconnect);
        err2.stack = "";
        pongs.forEach((p) => {
          p.reject(err2);
        });
        this.parser = new parser_1.Parser(this);
        this.infoReceived = false;
      }
      dispatchStatus(status) {
        this.listeners.forEach((q) => {
          q.push(status);
        });
      }
      status() {
        const iter = new queued_iterator_1.QueuedIteratorImpl();
        this.listeners.push(iter);
        return iter;
      }
      prepare() {
        if (this.transport) {
          this.transport.discard();
        }
        this.info = void 0;
        this.resetOutbound();
        const pong = (0, util_1.deferred)();
        pong.catch(() => {
        });
        this.pongs.unshift(pong);
        this.connectError = (err2) => {
          pong.reject(err2);
        };
        this.transport = (0, transport_1.newTransport)();
        this.transport.closed().then((_err) => __awaiter(this, void 0, void 0, function* () {
          this.connected = false;
          if (!this.isClosed()) {
            yield this.disconnected(this.transport.closeError || this.lastError);
            return;
          }
        }));
        return pong;
      }
      disconnect() {
        this.dispatchStatus({ type: core_1.DebugEvents.StaleConnection, data: "" });
        this.transport.disconnect();
      }
      reconnect() {
        if (this.connected) {
          this.dispatchStatus({
            type: core_1.DebugEvents.ClientInitiatedReconnect,
            data: ""
          });
          this.transport.disconnect();
        }
        return Promise.resolve();
      }
      disconnected(err2) {
        return __awaiter(this, void 0, void 0, function* () {
          this.dispatchStatus({
            type: core_1.Events.Disconnect,
            data: this.servers.getCurrentServer().toString()
          });
          if (this.options.reconnect) {
            yield this.dialLoop().then(() => {
              var _a2;
              this.dispatchStatus({
                type: core_1.Events.Reconnect,
                data: this.servers.getCurrentServer().toString()
              });
              if (((_a2 = this.lastError) === null || _a2 === void 0 ? void 0 : _a2.code) === core_1.ErrorCode.AuthenticationExpired) {
                this.lastError = void 0;
              }
            }).catch((err3) => {
              this._close(err3);
            });
          } else {
            yield this._close(err2);
          }
        });
      }
      dial(srv) {
        return __awaiter(this, void 0, void 0, function* () {
          const pong = this.prepare();
          let timer;
          try {
            timer = (0, util_1.timeout)(this.options.timeout || 2e4);
            const cp = this.transport.connect(srv, this.options);
            yield Promise.race([cp, timer]);
            (() => __awaiter(this, void 0, void 0, function* () {
              var _a2, e_1, _b, _c;
              try {
                try {
                  for (var _d2 = true, _e = __asyncValues(this.transport), _f; _f = yield _e.next(), _a2 = _f.done, !_a2; _d2 = true) {
                    _c = _f.value;
                    _d2 = false;
                    const b = _c;
                    this.parser.parse(b);
                  }
                } catch (e_1_1) {
                  e_1 = { error: e_1_1 };
                } finally {
                  try {
                    if (!_d2 && !_a2 && (_b = _e.return)) yield _b.call(_e);
                  } finally {
                    if (e_1) throw e_1.error;
                  }
                }
              } catch (err2) {
                console.log("reader closed", err2);
              }
            }))().then();
          } catch (err2) {
            pong.reject(err2);
          }
          try {
            yield Promise.race([timer, pong]);
            if (timer) {
              timer.cancel();
            }
            this.connected = true;
            this.connectError = void 0;
            this.sendSubscriptions();
            this.connectedOnce = true;
            this.server.didConnect = true;
            this.server.reconnects = 0;
            this.flushPending();
            this.heartbeats.start();
          } catch (err2) {
            if (timer) {
              timer.cancel();
            }
            yield this.transport.close(err2);
            throw err2;
          }
        });
      }
      _doDial(srv) {
        return __awaiter(this, void 0, void 0, function* () {
          const { resolve } = this.options;
          const alts = yield srv.resolve({
            fn: (0, transport_1.getResolveFn)(),
            debug: this.options.debug,
            randomize: !this.options.noRandomize,
            resolve
          });
          let lastErr = null;
          for (const a of alts) {
            try {
              lastErr = null;
              this.dispatchStatus({ type: core_1.DebugEvents.Reconnecting, data: a.toString() });
              yield this.dial(a);
              return;
            } catch (err2) {
              lastErr = err2;
            }
          }
          throw lastErr;
        });
      }
      dialLoop() {
        if (this.connectPromise === null) {
          this.connectPromise = this.dodialLoop();
          this.connectPromise.then(() => {
          }).catch(() => {
          }).finally(() => {
            this.connectPromise = null;
          });
        }
        return this.connectPromise;
      }
      dodialLoop() {
        return __awaiter(this, void 0, void 0, function* () {
          let lastError;
          while (true) {
            if (this._closed) {
              this.servers.clear();
            }
            const wait = this.options.reconnectDelayHandler ? this.options.reconnectDelayHandler() : options_1.DEFAULT_RECONNECT_TIME_WAIT;
            let maxWait = wait;
            const srv = this.selectServer();
            if (!srv || this.abortReconnect) {
              if (lastError) {
                throw lastError;
              } else if (this.lastError) {
                throw this.lastError;
              } else {
                throw core_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionRefused);
              }
            }
            const now = Date.now();
            if (srv.lastConnect === 0 || srv.lastConnect + wait <= now) {
              srv.lastConnect = Date.now();
              try {
                yield this._doDial(srv);
                break;
              } catch (err2) {
                lastError = err2;
                if (!this.connectedOnce) {
                  if (this.options.waitOnFirstConnect) {
                    continue;
                  }
                  this.servers.removeCurrentServer();
                }
                srv.reconnects++;
                const mra = this.options.maxReconnectAttempts || 0;
                if (mra !== -1 && srv.reconnects >= mra) {
                  this.servers.removeCurrentServer();
                }
              }
            } else {
              maxWait = Math.min(maxWait, srv.lastConnect + wait - now);
              yield (0, util_1.delay)(maxWait);
            }
          }
        });
      }
      static connect(options, publisher) {
        return __awaiter(this, void 0, void 0, function* () {
          const h2 = new _ProtocolHandler(options, publisher);
          yield h2.dialLoop();
          return h2;
        });
      }
      static toError(s) {
        const t = s ? s.toLowerCase() : "";
        if (t.indexOf("permissions violation") !== -1) {
          const err2 = new core_1.NatsError(s, core_1.ErrorCode.PermissionsViolation);
          const m = s.match(/(Publish|Subscription) to "(\S+)"/);
          if (m) {
            err2.permissionContext = {
              operation: m[1].toLowerCase(),
              subject: m[2],
              queue: void 0
            };
            const qm = s.match(/using queue "(\S+)"/);
            if (qm) {
              err2.permissionContext.queue = qm[1];
            }
          }
          return err2;
        } else if (t.indexOf("authorization violation") !== -1) {
          return new core_1.NatsError(s, core_1.ErrorCode.AuthorizationViolation);
        } else if (t.indexOf("user authentication expired") !== -1) {
          return new core_1.NatsError(s, core_1.ErrorCode.AuthenticationExpired);
        } else if (t.indexOf("account authentication expired") != -1) {
          return new core_1.NatsError(s, core_1.ErrorCode.AccountExpired);
        } else if (t.indexOf("authentication timeout") !== -1) {
          return new core_1.NatsError(s, core_1.ErrorCode.AuthenticationTimeout);
        } else {
          return new core_1.NatsError(s, core_1.ErrorCode.ProtocolError);
        }
      }
      processMsg(msg, data) {
        this.inMsgs++;
        this.inBytes += data.length;
        if (!this.subscriptions.sidCounter) {
          return;
        }
        const sub = this.subscriptions.get(msg.sid);
        if (!sub) {
          return;
        }
        sub.received += 1;
        if (sub.callback) {
          sub.callback(null, new msg_1.MsgImpl(msg, data, this));
        }
        if (sub.max !== void 0 && sub.received >= sub.max) {
          sub.unsubscribe();
        }
      }
      processError(m) {
        const s = (0, encoders_1.decode)(m);
        const err2 = _ProtocolHandler.toError(s);
        const status = { type: core_1.Events.Error, data: err2.code };
        if (err2.isPermissionError()) {
          let isMuxPermissionError = false;
          if (err2.permissionContext) {
            status.permissionContext = err2.permissionContext;
            const mux = this.subscriptions.getMux();
            isMuxPermissionError = (mux === null || mux === void 0 ? void 0 : mux.subject) === err2.permissionContext.subject;
          }
          this.subscriptions.handleError(err2);
          this.muxSubscriptions.handleError(isMuxPermissionError, err2);
          if (isMuxPermissionError) {
            this.subscriptions.setMux(null);
          }
        }
        this.dispatchStatus(status);
        this.handleError(err2);
      }
      handleError(err2) {
        if (err2.isAuthError()) {
          this.handleAuthError(err2);
        } else if (err2.isProtocolError()) {
          this.lastError = err2;
        } else if (err2.isAuthTimeout()) {
          this.lastError = err2;
        }
        if (!err2.isPermissionError()) {
          this.lastError = err2;
        }
      }
      handleAuthError(err2) {
        if (this.lastError && err2.code === this.lastError.code && this.options.ignoreAuthErrorAbort === false) {
          this.abortReconnect = true;
        }
        if (this.connectError) {
          this.connectError(err2);
        } else {
          this.disconnect();
        }
      }
      processPing() {
        this.transport.send(PONG_CMD);
      }
      processPong() {
        const cb = this.pongs.shift();
        if (cb) {
          cb.resolve();
        }
      }
      processInfo(m) {
        const info = JSON.parse((0, encoders_1.decode)(m));
        this.info = info;
        const updates = this.options && this.options.ignoreClusterUpdates ? void 0 : this.servers.update(info, this.transport.isEncrypted());
        if (!this.infoReceived) {
          this.features.update((0, semver_1.parseSemVer)(info.version));
          this.infoReceived = true;
          if (this.transport.isEncrypted()) {
            this.servers.updateTLSName();
          }
          const { version, lang } = this.transport;
          try {
            const c = new Connect({ version, lang }, this.options, info.nonce);
            if (info.headers) {
              c.headers = true;
              c.no_responders = true;
            }
            const cs = JSON.stringify(c);
            this.transport.send((0, encoders_1.encode)(`CONNECT ${cs}${transport_1.CR_LF}`));
            this.transport.send(PING_CMD);
          } catch (err2) {
            this._close(err2);
          }
        }
        if (updates) {
          this.dispatchStatus({ type: core_1.Events.Update, data: updates });
        }
        const ldm = info.ldm !== void 0 ? info.ldm : false;
        if (ldm) {
          this.dispatchStatus({
            type: core_1.Events.LDM,
            data: this.servers.getCurrentServer().toString()
          });
        }
      }
      push(e) {
        switch (e.kind) {
          case parser_1.Kind.MSG: {
            const { msg, data } = e;
            this.processMsg(msg, data);
            break;
          }
          case parser_1.Kind.OK:
            break;
          case parser_1.Kind.ERR:
            this.processError(e.data);
            break;
          case parser_1.Kind.PING:
            this.processPing();
            break;
          case parser_1.Kind.PONG:
            this.processPong();
            break;
          case parser_1.Kind.INFO:
            this.processInfo(e.data);
            break;
        }
      }
      sendCommand(cmd, ...payloads) {
        const len = this.outbound.length();
        let buf;
        if (typeof cmd === "string") {
          buf = (0, encoders_1.encode)(cmd);
        } else {
          buf = cmd;
        }
        this.outbound.fill(buf, ...payloads);
        if (len === 0) {
          queueMicrotask(() => {
            this.flushPending();
          });
        } else if (this.outbound.size() >= this.pendingLimit) {
          this.flushPending();
        }
      }
      publish(subject, payload = encoders_1.Empty, options) {
        let data;
        if (payload instanceof Uint8Array) {
          data = payload;
        } else if (typeof payload === "string") {
          data = encoders_1.TE.encode(payload);
        } else {
          throw core_1.NatsError.errorForCode(core_1.ErrorCode.BadPayload);
        }
        let len = data.length;
        options = options || {};
        options.reply = options.reply || "";
        let headers = encoders_1.Empty;
        let hlen = 0;
        if (options.headers) {
          if (this.info && !this.info.headers) {
            throw new core_1.NatsError("headers", core_1.ErrorCode.ServerOptionNotAvailable);
          }
          const hdrs = options.headers;
          headers = hdrs.encode();
          hlen = headers.length;
          len = data.length + hlen;
        }
        if (this.info && len > this.info.max_payload) {
          throw core_1.NatsError.errorForCode(core_1.ErrorCode.MaxPayloadExceeded);
        }
        this.outBytes += len;
        this.outMsgs++;
        let proto;
        if (options.headers) {
          if (options.reply) {
            proto = `HPUB ${subject} ${options.reply} ${hlen} ${len}\r
`;
          } else {
            proto = `HPUB ${subject} ${hlen} ${len}\r
`;
          }
          this.sendCommand(proto, headers, data, transport_1.CRLF);
        } else {
          if (options.reply) {
            proto = `PUB ${subject} ${options.reply} ${len}\r
`;
          } else {
            proto = `PUB ${subject} ${len}\r
`;
          }
          this.sendCommand(proto, data, transport_1.CRLF);
        }
      }
      request(r) {
        this.initMux();
        this.muxSubscriptions.add(r);
        return r;
      }
      subscribe(s) {
        this.subscriptions.add(s);
        this._subunsub(s);
        return s;
      }
      _sub(s) {
        if (s.queue) {
          this.sendCommand(`SUB ${s.subject} ${s.queue} ${s.sid}\r
`);
        } else {
          this.sendCommand(`SUB ${s.subject} ${s.sid}\r
`);
        }
      }
      _subunsub(s) {
        this._sub(s);
        if (s.max) {
          this.unsubscribe(s, s.max);
        }
        return s;
      }
      unsubscribe(s, max) {
        this.unsub(s, max);
        if (s.max === void 0 || s.received >= s.max) {
          this.subscriptions.cancel(s);
        }
      }
      unsub(s, max) {
        if (!s || this.isClosed()) {
          return;
        }
        if (max) {
          this.sendCommand(`UNSUB ${s.sid} ${max}\r
`);
        } else {
          this.sendCommand(`UNSUB ${s.sid}\r
`);
        }
        s.max = max;
      }
      resub(s, subject) {
        if (!s || this.isClosed()) {
          return;
        }
        this.unsub(s);
        s.subject = subject;
        this.subscriptions.resub(s);
        this._sub(s);
      }
      flush(p) {
        if (!p) {
          p = (0, util_1.deferred)();
        }
        this.pongs.push(p);
        this.outbound.fill(PING_CMD);
        this.flushPending();
        return p;
      }
      sendSubscriptions() {
        const cmds = [];
        this.subscriptions.all().forEach((s) => {
          const sub = s;
          if (sub.queue) {
            cmds.push(`SUB ${sub.subject} ${sub.queue} ${sub.sid}${transport_1.CR_LF}`);
          } else {
            cmds.push(`SUB ${sub.subject} ${sub.sid}${transport_1.CR_LF}`);
          }
        });
        if (cmds.length) {
          this.transport.send((0, encoders_1.encode)(cmds.join("")));
        }
      }
      _close(err2) {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._closed) {
            return;
          }
          this.whyClosed = new Error("close trace").stack || "";
          this.heartbeats.cancel();
          if (this.connectError) {
            this.connectError(err2);
            this.connectError = void 0;
          }
          this.muxSubscriptions.close();
          this.subscriptions.close();
          this.listeners.forEach((l) => {
            l.stop();
          });
          this._closed = true;
          yield this.transport.close(err2);
          yield this.closed.resolve(err2);
        });
      }
      close() {
        return this._close();
      }
      isClosed() {
        return this._closed;
      }
      drain() {
        const subs = this.subscriptions.all();
        const promises = [];
        subs.forEach((sub) => {
          promises.push(sub.drain());
        });
        return Promise.all(promises).then(() => __awaiter(this, void 0, void 0, function* () {
          this.noMorePublishing = true;
          yield this.flush();
          return this.close();
        })).catch(() => {
        });
      }
      flushPending() {
        if (!this.infoReceived || !this.connected) {
          return;
        }
        if (this.outbound.size()) {
          const d = this.outbound.drain();
          this.transport.send(d);
        }
      }
      initMux() {
        const mux = this.subscriptions.getMux();
        if (!mux) {
          const inbox = this.muxSubscriptions.init(this.options.inboxPrefix);
          const sub = new SubscriptionImpl(this, `${inbox}*`);
          sub.callback = this.muxSubscriptions.dispatcher();
          this.subscriptions.setMux(sub);
          this.subscribe(sub);
        }
      }
      selectServer() {
        const server = this.servers.selectServer();
        if (server === void 0) {
          return void 0;
        }
        this.server = server;
        return this.server;
      }
      getServer() {
        return this.server;
      }
    };
    exports2.ProtocolHandler = ProtocolHandler;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/types.js
var require_types = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Empty = exports2.NatsError = void 0;
    var core_1 = require_core();
    Object.defineProperty(exports2, "NatsError", { enumerable: true, get: function() {
      return core_1.NatsError;
    } });
    var encoders_1 = require_encoders();
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: function() {
      return encoders_1.Empty;
    } });
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/request.js
var require_request = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/request.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RequestOne = exports2.RequestMany = exports2.BaseRequest = void 0;
    var util_1 = require_util();
    var nuid_1 = require_nuid();
    var core_1 = require_core();
    var BaseRequest = class {
      constructor(mux, requestSubject, asyncTraces = true) {
        this.mux = mux;
        this.requestSubject = requestSubject;
        this.received = 0;
        this.token = nuid_1.nuid.next();
        if (asyncTraces) {
          this.ctx = new Error();
        }
      }
    };
    exports2.BaseRequest = BaseRequest;
    var RequestMany = class extends BaseRequest {
      constructor(mux, requestSubject, opts = { maxWait: 1e3 }) {
        super(mux, requestSubject);
        this.opts = opts;
        if (typeof this.opts.callback !== "function") {
          throw new Error("callback is required");
        }
        this.callback = this.opts.callback;
        this.max = typeof opts.maxMessages === "number" && opts.maxMessages > 0 ? opts.maxMessages : -1;
        this.done = (0, util_1.deferred)();
        this.done.then(() => {
          this.callback(null, null);
        });
        this.timer = setTimeout(() => {
          this.cancel();
        }, opts.maxWait);
      }
      cancel(err2) {
        if (err2) {
          this.callback(err2, null);
        }
        clearTimeout(this.timer);
        this.mux.cancel(this);
        this.done.resolve();
      }
      resolver(err2, msg) {
        if (err2) {
          if (this.ctx) {
            err2.stack += `

${this.ctx.stack}`;
          }
          this.cancel(err2);
        } else {
          this.callback(null, msg);
          if (this.opts.strategy === core_1.RequestStrategy.Count) {
            this.max--;
            if (this.max === 0) {
              this.cancel();
            }
          }
          if (this.opts.strategy === core_1.RequestStrategy.JitterTimer) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
              this.cancel();
            }, this.opts.jitter || 300);
          }
          if (this.opts.strategy === core_1.RequestStrategy.SentinelMsg) {
            if (msg && msg.data.length === 0) {
              this.cancel();
            }
          }
        }
      }
    };
    exports2.RequestMany = RequestMany;
    var RequestOne = class extends BaseRequest {
      constructor(mux, requestSubject, opts = { timeout: 1e3 }, asyncTraces = true) {
        super(mux, requestSubject, asyncTraces);
        this.deferred = (0, util_1.deferred)();
        this.timer = (0, util_1.timeout)(opts.timeout, asyncTraces);
      }
      resolver(err2, msg) {
        if (this.timer) {
          this.timer.cancel();
        }
        if (err2) {
          if (this.ctx) {
            err2.stack += `

${this.ctx.stack}`;
          }
          this.deferred.reject(err2);
        } else {
          this.deferred.resolve(msg);
        }
        this.cancel();
      }
      cancel(err2) {
        if (this.timer) {
          this.timer.cancel();
        }
        this.mux.cancel(this);
        this.deferred.reject(err2 ? err2 : core_1.NatsError.errorForCode(core_1.ErrorCode.Cancelled));
      }
    };
    exports2.RequestOne = RequestOne;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsutil.js
var require_jsutil = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsutil.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Js409Errors = void 0;
    exports2.validateDurableName = validateDurableName;
    exports2.validateStreamName = validateStreamName;
    exports2.minValidation = minValidation;
    exports2.validateName = validateName;
    exports2.validName = validName;
    exports2.isFlowControlMsg = isFlowControlMsg;
    exports2.isHeartbeatMsg = isHeartbeatMsg;
    exports2.newJsErrorMsg = newJsErrorMsg;
    exports2.checkJsError = checkJsError;
    exports2.setMaxWaitingToFail = setMaxWaitingToFail;
    exports2.isTerminal409 = isTerminal409;
    exports2.checkJsErrorCode = checkJsErrorCode;
    var encoders_1 = require_encoders();
    var headers_1 = require_headers();
    var msg_1 = require_msg();
    var core_1 = require_core();
    function validateDurableName(name) {
      return minValidation("durable", name);
    }
    function validateStreamName(name) {
      return minValidation("stream", name);
    }
    function minValidation(context, name = "") {
      if (name === "") {
        throw Error(`${context} name required`);
      }
      const bad = [".", "*", ">", "/", "\\", " ", "	", "\n", "\r"];
      bad.forEach((v) => {
        if (name.indexOf(v) !== -1) {
          switch (v) {
            case "\n":
              v = "\\n";
              break;
            case "\r":
              v = "\\r";
              break;
            case "	":
              v = "\\t";
              break;
            default:
          }
          throw Error(`invalid ${context} name - ${context} name cannot contain '${v}'`);
        }
      });
      return "";
    }
    function validateName(context, name = "") {
      if (name === "") {
        throw Error(`${context} name required`);
      }
      const m = validName(name);
      if (m.length) {
        throw new Error(`invalid ${context} name - ${context} name ${m}`);
      }
    }
    function validName(name = "") {
      if (name === "") {
        throw Error(`name required`);
      }
      const RE = /^[-\w]+$/g;
      const m = name.match(RE);
      if (m === null) {
        for (const c of name.split("")) {
          const mm = c.match(RE);
          if (mm === null) {
            return `cannot contain '${c}'`;
          }
        }
      }
      return "";
    }
    function isFlowControlMsg(msg) {
      if (msg.data.length > 0) {
        return false;
      }
      const h2 = msg.headers;
      if (!h2) {
        return false;
      }
      return h2.code >= 100 && h2.code < 200;
    }
    function isHeartbeatMsg(msg) {
      var _a2;
      return isFlowControlMsg(msg) && ((_a2 = msg.headers) === null || _a2 === void 0 ? void 0 : _a2.description) === "Idle Heartbeat";
    }
    function newJsErrorMsg(code, description, subject) {
      const h2 = (0, headers_1.headers)(code, description);
      const arg = { hdr: 1, sid: 0, size: 0 };
      const msg = new msg_1.MsgImpl(arg, encoders_1.Empty, {});
      msg._headers = h2;
      msg._subject = subject;
      return msg;
    }
    function checkJsError(msg) {
      if (msg.data.length !== 0) {
        return null;
      }
      const h2 = msg.headers;
      if (!h2) {
        return null;
      }
      return checkJsErrorCode(h2.code, h2.description);
    }
    var Js409Errors;
    (function(Js409Errors2) {
      Js409Errors2["MaxBatchExceeded"] = "exceeded maxrequestbatch of";
      Js409Errors2["MaxExpiresExceeded"] = "exceeded maxrequestexpires of";
      Js409Errors2["MaxBytesExceeded"] = "exceeded maxrequestmaxbytes of";
      Js409Errors2["MaxMessageSizeExceeded"] = "message size exceeds maxbytes";
      Js409Errors2["PushConsumer"] = "consumer is push based";
      Js409Errors2["MaxWaitingExceeded"] = "exceeded maxwaiting";
      Js409Errors2["IdleHeartbeatMissed"] = "idle heartbeats missed";
      Js409Errors2["ConsumerDeleted"] = "consumer deleted";
    })(Js409Errors || (exports2.Js409Errors = Js409Errors = {}));
    var MAX_WAITING_FAIL = false;
    function setMaxWaitingToFail(tf) {
      MAX_WAITING_FAIL = tf;
    }
    function isTerminal409(err2) {
      if (err2.code !== core_1.ErrorCode.JetStream409) {
        return false;
      }
      const fatal = [
        Js409Errors.MaxBatchExceeded,
        Js409Errors.MaxExpiresExceeded,
        Js409Errors.MaxBytesExceeded,
        Js409Errors.MaxMessageSizeExceeded,
        Js409Errors.PushConsumer,
        Js409Errors.IdleHeartbeatMissed,
        Js409Errors.ConsumerDeleted
      ];
      if (MAX_WAITING_FAIL) {
        fatal.push(Js409Errors.MaxWaitingExceeded);
      }
      return fatal.find((s) => {
        return err2.message.indexOf(s) !== -1;
      }) !== void 0;
    }
    function checkJsErrorCode(code, description = "") {
      if (code < 300) {
        return null;
      }
      description = description.toLowerCase();
      switch (code) {
        case 404:
          return new core_1.NatsError(description, core_1.ErrorCode.JetStream404NoMessages);
        case 408:
          return new core_1.NatsError(description, core_1.ErrorCode.JetStream408RequestTimeout);
        case 409: {
          const ec = description.startsWith(Js409Errors.IdleHeartbeatMissed) ? core_1.ErrorCode.JetStreamIdleHeartBeat : core_1.ErrorCode.JetStream409;
          return new core_1.NatsError(description, ec);
        }
        case 503:
          return core_1.NatsError.errorForCode(core_1.ErrorCode.JetStreamNotEnabled, new Error(description));
        default:
          if (description === "") {
            description = core_1.ErrorCode.Unknown;
          }
          return new core_1.NatsError(description, `${code}`);
      }
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsbaseclient_api.js
var require_jsbaseclient_api = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsbaseclient_api.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BaseApiClient = void 0;
    exports2.defaultJsOptions = defaultJsOptions;
    var encoders_1 = require_encoders();
    var codec_1 = require_codec();
    var util_1 = require_util();
    var jsutil_1 = require_jsutil();
    var core_1 = require_core();
    var defaultPrefix = "$JS.API";
    var defaultTimeout = 5e3;
    function defaultJsOptions(opts) {
      opts = opts || {};
      if (opts.domain) {
        opts.apiPrefix = `$JS.${opts.domain}.API`;
        delete opts.domain;
      }
      return (0, util_1.extend)({ apiPrefix: defaultPrefix, timeout: defaultTimeout }, opts);
    }
    var BaseApiClient = class {
      constructor(nc, opts) {
        this.nc = nc;
        this.opts = defaultJsOptions(opts);
        this._parseOpts();
        this.prefix = this.opts.apiPrefix;
        this.timeout = this.opts.timeout;
        this.jc = (0, codec_1.JSONCodec)();
      }
      getOptions() {
        return Object.assign({}, this.opts);
      }
      _parseOpts() {
        let prefix = this.opts.apiPrefix;
        if (!prefix || prefix.length === 0) {
          throw new Error("invalid empty prefix");
        }
        const c = prefix[prefix.length - 1];
        if (c === ".") {
          prefix = prefix.substr(0, prefix.length - 1);
        }
        this.opts.apiPrefix = prefix;
      }
      _request(subj_1) {
        return __awaiter(this, arguments, void 0, function* (subj, data = null, opts) {
          opts = opts || {};
          opts.timeout = this.timeout;
          let a = encoders_1.Empty;
          if (data) {
            a = this.jc.encode(data);
          }
          let { retries } = opts;
          retries = retries || 1;
          retries = retries === -1 ? Number.MAX_SAFE_INTEGER : retries;
          const bo = (0, util_1.backoff)();
          for (let i = 0; i < retries; i++) {
            try {
              const m = yield this.nc.request(subj, a, opts);
              return this.parseJsResponse(m);
            } catch (err2) {
              const ne = err2;
              if ((ne.code === "503" || ne.code === core_1.ErrorCode.Timeout) && i + 1 < retries) {
                yield (0, util_1.delay)(bo.backoff(i));
              } else {
                throw err2;
              }
            }
          }
        });
      }
      findStream(subject) {
        return __awaiter(this, void 0, void 0, function* () {
          const q = { subject };
          const r = yield this._request(`${this.prefix}.STREAM.NAMES`, q);
          const names = r;
          if (!names.streams || names.streams.length !== 1) {
            throw new Error("no stream matches subject");
          }
          return names.streams[0];
        });
      }
      getConnection() {
        return this.nc;
      }
      parseJsResponse(m) {
        const v = this.jc.decode(m.data);
        const r = v;
        if (r.error) {
          const err2 = (0, jsutil_1.checkJsErrorCode)(r.error.code, r.error.description);
          if (err2 !== null) {
            err2.api_error = r.error;
            throw err2;
          }
        }
        return v;
      }
    };
    exports2.BaseApiClient = BaseApiClient;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jslister.js
var require_jslister = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jslister.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __await = exports2 && exports2.__await || function(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
    };
    var __asyncGenerator = exports2 && exports2.__asyncGenerator || function(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
      }, i;
      function awaitReturn(f) {
        return function(v) {
          return Promise.resolve(v).then(f, reject);
        };
      }
      function verb(n, f) {
        if (g[n]) {
          i[n] = function(v) {
            return new Promise(function(a, b) {
              q.push([n, v, a, b]) > 1 || resume(n, v);
            });
          };
          if (f) i[n] = f(i[n]);
        }
      }
      function resume(n, v) {
        try {
          step(g[n](v));
        } catch (e) {
          settle(q[0][3], e);
        }
      }
      function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
      }
      function fulfill(value) {
        resume("next", value);
      }
      function reject(value) {
        resume("throw", value);
      }
      function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListerImpl = void 0;
    var ListerImpl = class {
      constructor(subject, filter, jsm, payload) {
        if (!subject) {
          throw new Error("subject is required");
        }
        this.subject = subject;
        this.jsm = jsm;
        this.offset = 0;
        this.pageInfo = {};
        this.filter = filter;
        this.payload = payload || {};
      }
      next() {
        return __awaiter(this, void 0, void 0, function* () {
          if (this.err) {
            return [];
          }
          if (this.pageInfo && this.offset >= this.pageInfo.total) {
            return [];
          }
          const offset = { offset: this.offset };
          if (this.payload) {
            Object.assign(offset, this.payload);
          }
          try {
            const r = yield this.jsm._request(this.subject, offset, { timeout: this.jsm.timeout });
            this.pageInfo = r;
            const count = this.countResponse(r);
            if (count === 0) {
              return [];
            }
            this.offset += count;
            const a = this.filter(r);
            return a;
          } catch (err2) {
            this.err = err2;
            throw err2;
          }
        });
      }
      countResponse(r) {
        var _a2, _b, _c;
        switch (r === null || r === void 0 ? void 0 : r.type) {
          case "io.nats.jetstream.api.v1.stream_names_response":
          case "io.nats.jetstream.api.v1.stream_list_response":
            return ((_a2 = r.streams) === null || _a2 === void 0 ? void 0 : _a2.length) || 0;
          case "io.nats.jetstream.api.v1.consumer_list_response":
            return ((_b = r.consumers) === null || _b === void 0 ? void 0 : _b.length) || 0;
          default:
            console.error(`jslister.ts: unknown API response for paged output: ${r === null || r === void 0 ? void 0 : r.type}`);
            return ((_c = r.streams) === null || _c === void 0 ? void 0 : _c.length) || 0;
        }
        return 0;
      }
      [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a2() {
          let page = yield __await(this.next());
          while (page.length > 0) {
            for (const item of page) {
              yield yield __await(item);
            }
            page = yield __await(this.next());
          }
        });
      }
    };
    exports2.ListerImpl = ListerImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsapi_types.js
var require_jsapi_types = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsapi_types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConsumerApiAction = exports2.StoreCompression = exports2.ReplayPolicy = exports2.AckPolicy = exports2.DeliverPolicy = exports2.StorageType = exports2.DiscardPolicy = exports2.RetentionPolicy = void 0;
    exports2.defaultConsumer = defaultConsumer;
    var util_1 = require_util();
    var RetentionPolicy2;
    (function(RetentionPolicy3) {
      RetentionPolicy3["Limits"] = "limits";
      RetentionPolicy3["Interest"] = "interest";
      RetentionPolicy3["Workqueue"] = "workqueue";
    })(RetentionPolicy2 || (exports2.RetentionPolicy = RetentionPolicy2 = {}));
    var DiscardPolicy;
    (function(DiscardPolicy2) {
      DiscardPolicy2["Old"] = "old";
      DiscardPolicy2["New"] = "new";
    })(DiscardPolicy || (exports2.DiscardPolicy = DiscardPolicy = {}));
    var StorageType2;
    (function(StorageType3) {
      StorageType3["File"] = "file";
      StorageType3["Memory"] = "memory";
    })(StorageType2 || (exports2.StorageType = StorageType2 = {}));
    var DeliverPolicy;
    (function(DeliverPolicy2) {
      DeliverPolicy2["All"] = "all";
      DeliverPolicy2["Last"] = "last";
      DeliverPolicy2["New"] = "new";
      DeliverPolicy2["StartSequence"] = "by_start_sequence";
      DeliverPolicy2["StartTime"] = "by_start_time";
      DeliverPolicy2["LastPerSubject"] = "last_per_subject";
    })(DeliverPolicy || (exports2.DeliverPolicy = DeliverPolicy = {}));
    var AckPolicy2;
    (function(AckPolicy3) {
      AckPolicy3["None"] = "none";
      AckPolicy3["All"] = "all";
      AckPolicy3["Explicit"] = "explicit";
      AckPolicy3["NotSet"] = "";
    })(AckPolicy2 || (exports2.AckPolicy = AckPolicy2 = {}));
    var ReplayPolicy;
    (function(ReplayPolicy2) {
      ReplayPolicy2["Instant"] = "instant";
      ReplayPolicy2["Original"] = "original";
    })(ReplayPolicy || (exports2.ReplayPolicy = ReplayPolicy = {}));
    var StoreCompression;
    (function(StoreCompression2) {
      StoreCompression2["None"] = "none";
      StoreCompression2["S2"] = "s2";
    })(StoreCompression || (exports2.StoreCompression = StoreCompression = {}));
    var ConsumerApiAction;
    (function(ConsumerApiAction2) {
      ConsumerApiAction2["CreateOrUpdate"] = "";
      ConsumerApiAction2["Update"] = "update";
      ConsumerApiAction2["Create"] = "create";
    })(ConsumerApiAction || (exports2.ConsumerApiAction = ConsumerApiAction = {}));
    function defaultConsumer(name, opts = {}) {
      return Object.assign({
        name,
        deliver_policy: DeliverPolicy.All,
        ack_policy: AckPolicy2.Explicit,
        ack_wait: (0, util_1.nanos)(30 * 1e3),
        replay_policy: ReplayPolicy.Instant
      }, opts);
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/types.js
var require_types2 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConsumerOptsBuilderImpl = exports2.kvPrefix = exports2.RepublishHeaders = exports2.DirectMsgHeaders = exports2.KvWatchInclude = exports2.JsHeaders = exports2.AdvisoryKind = void 0;
    exports2.consumerOpts = consumerOpts;
    exports2.isConsumerOptsBuilder = isConsumerOptsBuilder;
    var jsapi_types_1 = require_jsapi_types();
    var jsutil_1 = require_jsutil();
    var util_1 = require_util();
    var AdvisoryKind;
    (function(AdvisoryKind2) {
      AdvisoryKind2["API"] = "api_audit";
      AdvisoryKind2["StreamAction"] = "stream_action";
      AdvisoryKind2["ConsumerAction"] = "consumer_action";
      AdvisoryKind2["SnapshotCreate"] = "snapshot_create";
      AdvisoryKind2["SnapshotComplete"] = "snapshot_complete";
      AdvisoryKind2["RestoreCreate"] = "restore_create";
      AdvisoryKind2["RestoreComplete"] = "restore_complete";
      AdvisoryKind2["MaxDeliver"] = "max_deliver";
      AdvisoryKind2["Terminated"] = "terminated";
      AdvisoryKind2["Ack"] = "consumer_ack";
      AdvisoryKind2["StreamLeaderElected"] = "stream_leader_elected";
      AdvisoryKind2["StreamQuorumLost"] = "stream_quorum_lost";
      AdvisoryKind2["ConsumerLeaderElected"] = "consumer_leader_elected";
      AdvisoryKind2["ConsumerQuorumLost"] = "consumer_quorum_lost";
    })(AdvisoryKind || (exports2.AdvisoryKind = AdvisoryKind = {}));
    var JsHeaders;
    (function(JsHeaders2) {
      JsHeaders2["StreamSourceHdr"] = "Nats-Stream-Source";
      JsHeaders2["LastConsumerSeqHdr"] = "Nats-Last-Consumer";
      JsHeaders2["LastStreamSeqHdr"] = "Nats-Last-Stream";
      JsHeaders2["ConsumerStalledHdr"] = "Nats-Consumer-Stalled";
      JsHeaders2["MessageSizeHdr"] = "Nats-Msg-Size";
      JsHeaders2["RollupHdr"] = "Nats-Rollup";
      JsHeaders2["RollupValueSubject"] = "sub";
      JsHeaders2["RollupValueAll"] = "all";
      JsHeaders2["PendingMessagesHdr"] = "Nats-Pending-Messages";
      JsHeaders2["PendingBytesHdr"] = "Nats-Pending-Bytes";
    })(JsHeaders || (exports2.JsHeaders = JsHeaders = {}));
    var KvWatchInclude;
    (function(KvWatchInclude2) {
      KvWatchInclude2["LastValue"] = "";
      KvWatchInclude2["AllHistory"] = "history";
      KvWatchInclude2["UpdatesOnly"] = "updates";
    })(KvWatchInclude || (exports2.KvWatchInclude = KvWatchInclude = {}));
    var DirectMsgHeaders;
    (function(DirectMsgHeaders2) {
      DirectMsgHeaders2["Stream"] = "Nats-Stream";
      DirectMsgHeaders2["Sequence"] = "Nats-Sequence";
      DirectMsgHeaders2["TimeStamp"] = "Nats-Time-Stamp";
      DirectMsgHeaders2["Subject"] = "Nats-Subject";
    })(DirectMsgHeaders || (exports2.DirectMsgHeaders = DirectMsgHeaders = {}));
    var RepublishHeaders;
    (function(RepublishHeaders2) {
      RepublishHeaders2["Stream"] = "Nats-Stream";
      RepublishHeaders2["Subject"] = "Nats-Subject";
      RepublishHeaders2["Sequence"] = "Nats-Sequence";
      RepublishHeaders2["LastSequence"] = "Nats-Last-Sequence";
      RepublishHeaders2["Size"] = "Nats-Msg-Size";
    })(RepublishHeaders || (exports2.RepublishHeaders = RepublishHeaders = {}));
    exports2.kvPrefix = "KV_";
    var ConsumerOptsBuilderImpl = class {
      constructor(opts) {
        this.stream = "";
        this.mack = false;
        this.ordered = false;
        this.config = (0, jsapi_types_1.defaultConsumer)("", opts || {});
      }
      getOpts() {
        var _a2;
        const o = {};
        o.config = Object.assign({}, this.config);
        if (o.config.filter_subject) {
          this.filterSubject(o.config.filter_subject);
          o.config.filter_subject = void 0;
        }
        if (o.config.filter_subjects) {
          (_a2 = o.config.filter_subjects) === null || _a2 === void 0 ? void 0 : _a2.forEach((v) => {
            this.filterSubject(v);
          });
          o.config.filter_subjects = void 0;
        }
        o.mack = this.mack;
        o.stream = this.stream;
        o.callbackFn = this.callbackFn;
        o.max = this.max;
        o.queue = this.qname;
        o.ordered = this.ordered;
        o.config.ack_policy = o.ordered ? jsapi_types_1.AckPolicy.None : o.config.ack_policy;
        o.isBind = o.isBind || false;
        if (this.filters) {
          switch (this.filters.length) {
            case 0:
              break;
            case 1:
              o.config.filter_subject = this.filters[0];
              break;
            default:
              o.config.filter_subjects = this.filters;
          }
        }
        return o;
      }
      description(description) {
        this.config.description = description;
        return this;
      }
      deliverTo(subject) {
        this.config.deliver_subject = subject;
        return this;
      }
      durable(name) {
        (0, jsutil_1.validateDurableName)(name);
        this.config.durable_name = name;
        return this;
      }
      startSequence(seq) {
        if (seq <= 0) {
          throw new Error("sequence must be greater than 0");
        }
        this.config.deliver_policy = jsapi_types_1.DeliverPolicy.StartSequence;
        this.config.opt_start_seq = seq;
        return this;
      }
      startTime(time) {
        this.config.deliver_policy = jsapi_types_1.DeliverPolicy.StartTime;
        this.config.opt_start_time = time.toISOString();
        return this;
      }
      deliverAll() {
        this.config.deliver_policy = jsapi_types_1.DeliverPolicy.All;
        return this;
      }
      deliverLastPerSubject() {
        this.config.deliver_policy = jsapi_types_1.DeliverPolicy.LastPerSubject;
        return this;
      }
      deliverLast() {
        this.config.deliver_policy = jsapi_types_1.DeliverPolicy.Last;
        return this;
      }
      deliverNew() {
        this.config.deliver_policy = jsapi_types_1.DeliverPolicy.New;
        return this;
      }
      startAtTimeDelta(millis) {
        this.startTime(new Date(Date.now() - millis));
        return this;
      }
      headersOnly() {
        this.config.headers_only = true;
        return this;
      }
      ackNone() {
        this.config.ack_policy = jsapi_types_1.AckPolicy.None;
        return this;
      }
      ackAll() {
        this.config.ack_policy = jsapi_types_1.AckPolicy.All;
        return this;
      }
      ackExplicit() {
        this.config.ack_policy = jsapi_types_1.AckPolicy.Explicit;
        return this;
      }
      ackWait(millis) {
        this.config.ack_wait = (0, util_1.nanos)(millis);
        return this;
      }
      maxDeliver(max) {
        this.config.max_deliver = max;
        return this;
      }
      filterSubject(s) {
        this.filters = this.filters || [];
        this.filters.push(s);
        return this;
      }
      replayInstantly() {
        this.config.replay_policy = jsapi_types_1.ReplayPolicy.Instant;
        return this;
      }
      replayOriginal() {
        this.config.replay_policy = jsapi_types_1.ReplayPolicy.Original;
        return this;
      }
      sample(n) {
        n = Math.trunc(n);
        if (n < 0 || n > 100) {
          throw new Error(`value must be between 0-100`);
        }
        this.config.sample_freq = `${n}%`;
        return this;
      }
      limit(n) {
        this.config.rate_limit_bps = n;
        return this;
      }
      maxWaiting(max) {
        this.config.max_waiting = max;
        return this;
      }
      maxAckPending(max) {
        this.config.max_ack_pending = max;
        return this;
      }
      idleHeartbeat(millis) {
        this.config.idle_heartbeat = (0, util_1.nanos)(millis);
        return this;
      }
      flowControl() {
        this.config.flow_control = true;
        return this;
      }
      deliverGroup(name) {
        this.queue(name);
        return this;
      }
      manualAck() {
        this.mack = true;
        return this;
      }
      maxMessages(max) {
        this.max = max;
        return this;
      }
      callback(fn) {
        this.callbackFn = fn;
        return this;
      }
      queue(n) {
        this.qname = n;
        this.config.deliver_group = n;
        return this;
      }
      orderedConsumer() {
        this.ordered = true;
        return this;
      }
      bind(stream2, durable) {
        this.stream = stream2;
        this.config.durable_name = durable;
        this.isBind = true;
        return this;
      }
      bindStream(stream2) {
        this.stream = stream2;
        return this;
      }
      inactiveEphemeralThreshold(millis) {
        this.config.inactive_threshold = (0, util_1.nanos)(millis);
        return this;
      }
      maxPullBatch(n) {
        this.config.max_batch = n;
        return this;
      }
      maxPullRequestExpires(millis) {
        this.config.max_expires = (0, util_1.nanos)(millis);
        return this;
      }
      memory() {
        this.config.mem_storage = true;
        return this;
      }
      numReplicas(n) {
        this.config.num_replicas = n;
        return this;
      }
      consumerName(n) {
        this.config.name = n;
        return this;
      }
    };
    exports2.ConsumerOptsBuilderImpl = ConsumerOptsBuilderImpl;
    function consumerOpts(opts) {
      return new ConsumerOptsBuilderImpl(opts);
    }
    function isConsumerOptsBuilder(o) {
      return typeof o.getOpts === "function";
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsmconsumer_api.js
var require_jsmconsumer_api = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsmconsumer_api.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConsumerAPIImpl = void 0;
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var jslister_1 = require_jslister();
    var jsutil_1 = require_jsutil();
    var semver_1 = require_semver();
    var jsapi_types_1 = require_jsapi_types();
    var ConsumerAPIImpl = class extends jsbaseclient_api_1.BaseApiClient {
      constructor(nc, opts) {
        super(nc, opts);
      }
      add(stream_1, cfg_1) {
        return __awaiter(this, arguments, void 0, function* (stream2, cfg, action = jsapi_types_1.ConsumerApiAction.Create) {
          var _a2, _b, _c;
          (0, jsutil_1.validateStreamName)(stream2);
          if (cfg.deliver_group && cfg.flow_control) {
            throw new Error("jetstream flow control is not supported with queue groups");
          }
          if (cfg.deliver_group && cfg.idle_heartbeat) {
            throw new Error("jetstream idle heartbeat is not supported with queue groups");
          }
          const cr2 = {};
          cr2.config = cfg;
          cr2.stream_name = stream2;
          cr2.action = action;
          if (cr2.config.durable_name) {
            (0, jsutil_1.validateDurableName)(cr2.config.durable_name);
          }
          const nci = this.nc;
          let { min, ok: newAPI } = nci.features.get(semver_1.Feature.JS_NEW_CONSUMER_CREATE_API);
          const name = cfg.name === "" ? void 0 : cfg.name;
          if (name && !newAPI) {
            throw new Error(`consumer 'name' requires server ${min}`);
          }
          if (name) {
            try {
              (0, jsutil_1.minValidation)("name", name);
            } catch (err2) {
              const m = err2.message;
              const idx = m.indexOf("cannot contain");
              if (idx !== -1) {
                throw new Error(`consumer 'name' ${m.substring(idx)}`);
              }
              throw err2;
            }
          }
          let subj;
          let consumerName = "";
          if (Array.isArray(cfg.filter_subjects)) {
            const { min: min2, ok } = nci.features.get(semver_1.Feature.JS_MULTIPLE_CONSUMER_FILTER);
            if (!ok) {
              throw new Error(`consumer 'filter_subjects' requires server ${min2}`);
            }
            newAPI = false;
          }
          if (cfg.metadata) {
            const { min: min2, ok } = nci.features.get(semver_1.Feature.JS_STREAM_CONSUMER_METADATA);
            if (!ok) {
              throw new Error(`consumer 'metadata' requires server ${min2}`);
            }
          }
          if (newAPI) {
            consumerName = (_b = (_a2 = cfg.name) !== null && _a2 !== void 0 ? _a2 : cfg.durable_name) !== null && _b !== void 0 ? _b : "";
          }
          if (consumerName !== "") {
            let fs = (_c = cfg.filter_subject) !== null && _c !== void 0 ? _c : void 0;
            if (fs === ">") {
              fs = void 0;
            }
            subj = fs !== void 0 ? `${this.prefix}.CONSUMER.CREATE.${stream2}.${consumerName}.${fs}` : `${this.prefix}.CONSUMER.CREATE.${stream2}.${consumerName}`;
          } else {
            subj = cfg.durable_name ? `${this.prefix}.CONSUMER.DURABLE.CREATE.${stream2}.${cfg.durable_name}` : `${this.prefix}.CONSUMER.CREATE.${stream2}`;
          }
          const r = yield this._request(subj, cr2);
          return r;
        });
      }
      update(stream2, durable, cfg) {
        return __awaiter(this, void 0, void 0, function* () {
          const ci = yield this.info(stream2, durable);
          const changable = cfg;
          return this.add(stream2, Object.assign(ci.config, changable), jsapi_types_1.ConsumerApiAction.Update);
        });
      }
      info(stream2, name) {
        return __awaiter(this, void 0, void 0, function* () {
          (0, jsutil_1.validateStreamName)(stream2);
          (0, jsutil_1.validateDurableName)(name);
          const r = yield this._request(`${this.prefix}.CONSUMER.INFO.${stream2}.${name}`);
          return r;
        });
      }
      delete(stream2, name) {
        return __awaiter(this, void 0, void 0, function* () {
          (0, jsutil_1.validateStreamName)(stream2);
          (0, jsutil_1.validateDurableName)(name);
          const r = yield this._request(`${this.prefix}.CONSUMER.DELETE.${stream2}.${name}`);
          const cr2 = r;
          return cr2.success;
        });
      }
      list(stream2) {
        (0, jsutil_1.validateStreamName)(stream2);
        const filter = (v) => {
          const clr = v;
          return clr.consumers;
        };
        const subj = `${this.prefix}.CONSUMER.LIST.${stream2}`;
        return new jslister_1.ListerImpl(subj, filter, this);
      }
      pause(stream2, name, until) {
        const subj = `${this.prefix}.CONSUMER.PAUSE.${stream2}.${name}`;
        const opts = {
          pause_until: until.toISOString()
        };
        return this._request(subj, opts);
      }
      resume(stream2, name) {
        return this.pause(stream2, name, /* @__PURE__ */ new Date(0));
      }
    };
    exports2.ConsumerAPIImpl = ConsumerAPIImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/mod.js
var require_mod2 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.usernamePasswordAuthenticator = exports2.tokenAuthenticator = exports2.syncIterator = exports2.StringCodec = exports2.ServiceVerb = exports2.ServiceResponseType = exports2.ServiceErrorHeader = exports2.ServiceErrorCodeHeader = exports2.ServiceError = exports2.RequestStrategy = exports2.nuid = exports2.Nuid = exports2.nkeys = exports2.nkeyAuthenticator = exports2.NatsError = exports2.nanos = exports2.MsgHdrsImpl = exports2.millis = exports2.Metric = exports2.Match = exports2.jwtAuthenticator = exports2.JSONCodec = exports2.headers = exports2.Events = exports2.ErrorCode = exports2.Empty = exports2.delay = exports2.deferred = exports2.DebugEvents = exports2.deadline = exports2.credsAuthenticator = exports2.createInbox = exports2.canonicalMIMEHeaderKey = exports2.buildAuthenticator = exports2.Bench = exports2.backoff = void 0;
    var internal_mod_1 = require_internal_mod();
    Object.defineProperty(exports2, "backoff", { enumerable: true, get: function() {
      return internal_mod_1.backoff;
    } });
    Object.defineProperty(exports2, "Bench", { enumerable: true, get: function() {
      return internal_mod_1.Bench;
    } });
    Object.defineProperty(exports2, "buildAuthenticator", { enumerable: true, get: function() {
      return internal_mod_1.buildAuthenticator;
    } });
    Object.defineProperty(exports2, "canonicalMIMEHeaderKey", { enumerable: true, get: function() {
      return internal_mod_1.canonicalMIMEHeaderKey;
    } });
    Object.defineProperty(exports2, "createInbox", { enumerable: true, get: function() {
      return internal_mod_1.createInbox;
    } });
    Object.defineProperty(exports2, "credsAuthenticator", { enumerable: true, get: function() {
      return internal_mod_1.credsAuthenticator;
    } });
    Object.defineProperty(exports2, "deadline", { enumerable: true, get: function() {
      return internal_mod_1.deadline;
    } });
    Object.defineProperty(exports2, "DebugEvents", { enumerable: true, get: function() {
      return internal_mod_1.DebugEvents;
    } });
    Object.defineProperty(exports2, "deferred", { enumerable: true, get: function() {
      return internal_mod_1.deferred;
    } });
    Object.defineProperty(exports2, "delay", { enumerable: true, get: function() {
      return internal_mod_1.delay;
    } });
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: function() {
      return internal_mod_1.Empty;
    } });
    Object.defineProperty(exports2, "ErrorCode", { enumerable: true, get: function() {
      return internal_mod_1.ErrorCode;
    } });
    Object.defineProperty(exports2, "Events", { enumerable: true, get: function() {
      return internal_mod_1.Events;
    } });
    Object.defineProperty(exports2, "headers", { enumerable: true, get: function() {
      return internal_mod_1.headers;
    } });
    Object.defineProperty(exports2, "JSONCodec", { enumerable: true, get: function() {
      return internal_mod_1.JSONCodec;
    } });
    Object.defineProperty(exports2, "jwtAuthenticator", { enumerable: true, get: function() {
      return internal_mod_1.jwtAuthenticator;
    } });
    Object.defineProperty(exports2, "Match", { enumerable: true, get: function() {
      return internal_mod_1.Match;
    } });
    Object.defineProperty(exports2, "Metric", { enumerable: true, get: function() {
      return internal_mod_1.Metric;
    } });
    Object.defineProperty(exports2, "millis", { enumerable: true, get: function() {
      return internal_mod_1.millis;
    } });
    Object.defineProperty(exports2, "MsgHdrsImpl", { enumerable: true, get: function() {
      return internal_mod_1.MsgHdrsImpl;
    } });
    Object.defineProperty(exports2, "nanos", { enumerable: true, get: function() {
      return internal_mod_1.nanos;
    } });
    Object.defineProperty(exports2, "NatsError", { enumerable: true, get: function() {
      return internal_mod_1.NatsError;
    } });
    Object.defineProperty(exports2, "nkeyAuthenticator", { enumerable: true, get: function() {
      return internal_mod_1.nkeyAuthenticator;
    } });
    Object.defineProperty(exports2, "nkeys", { enumerable: true, get: function() {
      return internal_mod_1.nkeys;
    } });
    Object.defineProperty(exports2, "Nuid", { enumerable: true, get: function() {
      return internal_mod_1.Nuid;
    } });
    Object.defineProperty(exports2, "nuid", { enumerable: true, get: function() {
      return internal_mod_1.nuid;
    } });
    Object.defineProperty(exports2, "RequestStrategy", { enumerable: true, get: function() {
      return internal_mod_1.RequestStrategy;
    } });
    Object.defineProperty(exports2, "ServiceError", { enumerable: true, get: function() {
      return internal_mod_1.ServiceError;
    } });
    Object.defineProperty(exports2, "ServiceErrorCodeHeader", { enumerable: true, get: function() {
      return internal_mod_1.ServiceErrorCodeHeader;
    } });
    Object.defineProperty(exports2, "ServiceErrorHeader", { enumerable: true, get: function() {
      return internal_mod_1.ServiceErrorHeader;
    } });
    Object.defineProperty(exports2, "ServiceResponseType", { enumerable: true, get: function() {
      return internal_mod_1.ServiceResponseType;
    } });
    Object.defineProperty(exports2, "ServiceVerb", { enumerable: true, get: function() {
      return internal_mod_1.ServiceVerb;
    } });
    Object.defineProperty(exports2, "StringCodec", { enumerable: true, get: function() {
      return internal_mod_1.StringCodec;
    } });
    Object.defineProperty(exports2, "syncIterator", { enumerable: true, get: function() {
      return internal_mod_1.syncIterator;
    } });
    Object.defineProperty(exports2, "tokenAuthenticator", { enumerable: true, get: function() {
      return internal_mod_1.tokenAuthenticator;
    } });
    Object.defineProperty(exports2, "usernamePasswordAuthenticator", { enumerable: true, get: function() {
      return internal_mod_1.usernamePasswordAuthenticator;
    } });
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsmsg.js
var require_jsmsg = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsmsg.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.JsMsgImpl = exports2.ACK = void 0;
    exports2.toJsMsg = toJsMsg;
    exports2.parseInfo = parseInfo;
    var databuffer_1 = require_databuffer();
    var codec_1 = require_codec();
    var request_1 = require_request();
    var mod_1 = require_mod2();
    var util_1 = require_util();
    exports2.ACK = Uint8Array.of(43, 65, 67, 75);
    var NAK = Uint8Array.of(45, 78, 65, 75);
    var WPI = Uint8Array.of(43, 87, 80, 73);
    var NXT = Uint8Array.of(43, 78, 88, 84);
    var TERM = Uint8Array.of(43, 84, 69, 82, 77);
    var SPACE = Uint8Array.of(32);
    function toJsMsg(m, ackTimeout = 5e3) {
      return new JsMsgImpl(m, ackTimeout);
    }
    function parseInfo(s) {
      const tokens = s.split(".");
      if (tokens.length === 9) {
        tokens.splice(2, 0, "_", "");
      }
      if (tokens.length < 11 || tokens[0] !== "$JS" || tokens[1] !== "ACK") {
        throw new Error(`not js message`);
      }
      const di = {};
      di.domain = tokens[2] === "_" ? "" : tokens[2];
      di.account_hash = tokens[3];
      di.stream = tokens[4];
      di.consumer = tokens[5];
      di.deliveryCount = parseInt(tokens[6], 10);
      di.redeliveryCount = di.deliveryCount;
      di.redelivered = di.deliveryCount > 1;
      di.streamSequence = parseInt(tokens[7], 10);
      di.deliverySequence = parseInt(tokens[8], 10);
      di.timestampNanos = parseInt(tokens[9], 10);
      di.pending = parseInt(tokens[10], 10);
      return di;
    }
    var JsMsgImpl = class {
      constructor(msg, timeout) {
        this.msg = msg;
        this.didAck = false;
        this.timeout = timeout;
      }
      get subject() {
        return this.msg.subject;
      }
      get sid() {
        return this.msg.sid;
      }
      get data() {
        return this.msg.data;
      }
      get headers() {
        return this.msg.headers;
      }
      get info() {
        if (!this.di) {
          this.di = parseInfo(this.reply);
        }
        return this.di;
      }
      get redelivered() {
        return this.info.deliveryCount > 1;
      }
      get reply() {
        return this.msg.reply || "";
      }
      get seq() {
        return this.info.streamSequence;
      }
      doAck(payload) {
        if (!this.didAck) {
          this.didAck = !this.isWIP(payload);
          this.msg.respond(payload);
        }
      }
      isWIP(p) {
        return p.length === 4 && p[0] === WPI[0] && p[1] === WPI[1] && p[2] === WPI[2] && p[3] === WPI[3];
      }
      // this has to dig into the internals as the message has access
      // to the protocol but not the high-level client.
      ackAck(opts) {
        return __awaiter(this, void 0, void 0, function* () {
          var _a2;
          opts = opts || {};
          opts.timeout = opts.timeout || this.timeout;
          const d = (0, mod_1.deferred)();
          if (!this.didAck) {
            this.didAck = true;
            if (this.msg.reply) {
              const mi = this.msg;
              const proto = mi.publisher;
              const trace = !(((_a2 = proto.options) === null || _a2 === void 0 ? void 0 : _a2.noAsyncTraces) || false);
              const r = new request_1.RequestOne(proto.muxSubscriptions, this.msg.reply, {
                timeout: opts.timeout
              }, trace);
              proto.request(r);
              try {
                proto.publish(this.msg.reply, exports2.ACK, {
                  reply: `${proto.muxSubscriptions.baseInbox}${r.token}`
                });
              } catch (err2) {
                r.cancel(err2);
              }
              try {
                yield Promise.race([r.timer, r.deferred]);
                d.resolve(true);
              } catch (err2) {
                r.cancel(err2);
                d.reject(err2);
              }
            } else {
              d.resolve(false);
            }
          } else {
            d.resolve(false);
          }
          return d;
        });
      }
      ack() {
        this.doAck(exports2.ACK);
      }
      nak(millis) {
        let payload = NAK;
        if (millis) {
          payload = (0, codec_1.StringCodec)().encode(`-NAK ${JSON.stringify({ delay: (0, util_1.nanos)(millis) })}`);
        }
        this.doAck(payload);
      }
      working() {
        this.doAck(WPI);
      }
      next(subj, opts = { batch: 1 }) {
        const args = {};
        args.batch = opts.batch || 1;
        args.no_wait = opts.no_wait || false;
        if (opts.expires && opts.expires > 0) {
          args.expires = (0, util_1.nanos)(opts.expires);
        }
        const data = (0, codec_1.JSONCodec)().encode(args);
        const payload = databuffer_1.DataBuffer.concat(NXT, SPACE, data);
        const reqOpts = subj ? { reply: subj } : void 0;
        this.msg.respond(payload, reqOpts);
      }
      term(reason = "") {
        let term = TERM;
        if ((reason === null || reason === void 0 ? void 0 : reason.length) > 0) {
          term = (0, codec_1.StringCodec)().encode(`+TERM ${reason}`);
        }
        this.doAck(term);
      }
      json() {
        return this.msg.json();
      }
      string() {
        return this.msg.string();
      }
    };
    exports2.JsMsgImpl = JsMsgImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/typedsub.js
var require_typedsub = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/typedsub.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypedSubscription = void 0;
    exports2.checkFn = checkFn;
    var util_1 = require_util();
    var queued_iterator_1 = require_queued_iterator();
    var core_1 = require_core();
    function checkFn(fn, name, required = false) {
      if (required === true && !fn) {
        throw core_1.NatsError.errorForCode(core_1.ErrorCode.ApiError, new Error(`${name} is not a function`));
      }
      if (fn && typeof fn !== "function") {
        throw core_1.NatsError.errorForCode(core_1.ErrorCode.ApiError, new Error(`${name} is not a function`));
      }
    }
    var TypedSubscription = class extends queued_iterator_1.QueuedIteratorImpl {
      constructor(nc, subject, opts) {
        super();
        checkFn(opts.adapter, "adapter", true);
        this.adapter = opts.adapter;
        if (opts.callback) {
          checkFn(opts.callback, "callback");
        }
        this.noIterator = typeof opts.callback === "function";
        if (opts.ingestionFilterFn) {
          checkFn(opts.ingestionFilterFn, "ingestionFilterFn");
          this.ingestionFilterFn = opts.ingestionFilterFn;
        }
        if (opts.protocolFilterFn) {
          checkFn(opts.protocolFilterFn, "protocolFilterFn");
          this.protocolFilterFn = opts.protocolFilterFn;
        }
        if (opts.dispatchedFn) {
          checkFn(opts.dispatchedFn, "dispatchedFn");
          this.dispatchedFn = opts.dispatchedFn;
        }
        if (opts.cleanupFn) {
          checkFn(opts.cleanupFn, "cleanupFn");
        }
        let callback = (err2, msg) => {
          this.callback(err2, msg);
        };
        if (opts.callback) {
          const uh = opts.callback;
          callback = (err2, msg) => {
            const [jer, tm] = this.adapter(err2, msg);
            if (jer) {
              uh(jer, null);
              return;
            }
            const { ingest } = this.ingestionFilterFn ? this.ingestionFilterFn(tm, this) : { ingest: true };
            if (ingest) {
              const ok = this.protocolFilterFn ? this.protocolFilterFn(tm) : true;
              if (ok) {
                uh(jer, tm);
                if (this.dispatchedFn && tm) {
                  this.dispatchedFn(tm);
                }
              }
            }
          };
        }
        const { max, queue, timeout } = opts;
        const sopts = { queue, timeout, callback };
        if (max && max > 0) {
          sopts.max = max;
        }
        this.sub = nc.subscribe(subject, sopts);
        if (opts.cleanupFn) {
          this.sub.cleanupFn = opts.cleanupFn;
        }
        if (!this.noIterator) {
          this.iterClosed.then(() => {
            this.unsubscribe();
          });
        }
        this.subIterDone = (0, util_1.deferred)();
        Promise.all([this.sub.closed, this.iterClosed]).then(() => {
          this.subIterDone.resolve();
        }).catch(() => {
          this.subIterDone.resolve();
        });
        ((s) => __awaiter(this, void 0, void 0, function* () {
          yield s.closed;
          this.stop();
        }))(this.sub).then().catch();
      }
      unsubscribe(max) {
        this.sub.unsubscribe(max);
      }
      drain() {
        return this.sub.drain();
      }
      isDraining() {
        return this.sub.isDraining();
      }
      isClosed() {
        return this.sub.isClosed();
      }
      callback(e, msg) {
        this.sub.cancelTimeout();
        const [err2, tm] = this.adapter(e, msg);
        if (err2) {
          this.stop(err2);
        }
        if (tm) {
          this.push(tm);
        }
      }
      getSubject() {
        return this.sub.getSubject();
      }
      getReceived() {
        return this.sub.getReceived();
      }
      getProcessed() {
        return this.sub.getProcessed();
      }
      getPending() {
        return this.sub.getPending();
      }
      getID() {
        return this.sub.getID();
      }
      getMax() {
        return this.sub.getMax();
      }
      get closed() {
        return this.sub.closed;
      }
    };
    exports2.TypedSubscription = TypedSubscription;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/base64.js
var require_base64 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/base64.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Base64UrlPaddedCodec = exports2.Base64UrlCodec = exports2.Base64Codec = void 0;
    var Base64Codec = class {
      static encode(bytes) {
        if (typeof bytes === "string") {
          return btoa(bytes);
        }
        const a = Array.from(bytes);
        return btoa(String.fromCharCode(...a));
      }
      static decode(s, binary = false) {
        const bin = atob(s);
        if (!binary) {
          return bin;
        }
        return Uint8Array.from(bin, (c) => c.charCodeAt(0));
      }
    };
    exports2.Base64Codec = Base64Codec;
    var Base64UrlCodec = class _Base64UrlCodec {
      static encode(bytes) {
        return _Base64UrlCodec.toB64URLEncoding(Base64Codec.encode(bytes));
      }
      static decode(s, binary = false) {
        return Base64Codec.decode(_Base64UrlCodec.fromB64URLEncoding(s), binary);
      }
      static toB64URLEncoding(b64str) {
        return b64str.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      static fromB64URLEncoding(b64str) {
        return b64str.replace(/_/g, "/").replace(/-/g, "+");
      }
    };
    exports2.Base64UrlCodec = Base64UrlCodec;
    var Base64UrlPaddedCodec = class _Base64UrlPaddedCodec {
      static encode(bytes) {
        return _Base64UrlPaddedCodec.toB64URLEncoding(Base64Codec.encode(bytes));
      }
      static decode(s, binary = false) {
        return _Base64UrlPaddedCodec.decode(_Base64UrlPaddedCodec.fromB64URLEncoding(s), binary);
      }
      static toB64URLEncoding(b64str) {
        return b64str.replace(/\+/g, "-").replace(/\//g, "_");
      }
      static fromB64URLEncoding(b64str) {
        return b64str.replace(/_/g, "/").replace(/-/g, "+");
      }
    };
    exports2.Base64UrlPaddedCodec = Base64UrlPaddedCodec;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/js-sha256.js
var require_js_sha256 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/js-sha256.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.sha256 = exports2.sha224 = exports2.default = void 0;
    function t(t2, e2) {
      return e2.forEach(function(e3) {
        e3 && "string" != typeof e3 && !Array.isArray(e3) && Object.keys(e3).forEach(function(r2) {
          if ("default" !== r2 && !(r2 in t2)) {
            var i2 = Object.getOwnPropertyDescriptor(e3, r2);
            Object.defineProperty(t2, r2, i2.get ? i2 : {
              enumerable: true,
              get: function() {
                return e3[r2];
              }
            });
          }
        });
      }), Object.freeze(t2);
    }
    var e = "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {};
    function r() {
      throw new Error("setTimeout has not been defined");
    }
    function i() {
      throw new Error("clearTimeout has not been defined");
    }
    var h2 = r;
    var s = i;
    function n(t2) {
      if (h2 === setTimeout)
        return setTimeout(t2, 0);
      if ((h2 === r || !h2) && setTimeout)
        return h2 = setTimeout, setTimeout(t2, 0);
      try {
        return h2(t2, 0);
      } catch (e2) {
        try {
          return h2.call(null, t2, 0);
        } catch (e3) {
          return h2.call(this, t2, 0);
        }
      }
    }
    "function" == typeof e.setTimeout && (h2 = setTimeout), "function" == typeof e.clearTimeout && (s = clearTimeout);
    var o;
    var a = [];
    var f = false;
    var u = -1;
    function c() {
      f && o && (f = false, o.length ? a = o.concat(a) : u = -1, a.length && l());
    }
    function l() {
      if (!f) {
        var t2 = n(c);
        f = true;
        for (var e2 = a.length; e2; ) {
          for (o = a, a = []; ++u < e2; )
            o && o[u].run();
          u = -1, e2 = a.length;
        }
        o = null, f = false, (function(t3) {
          if (s === clearTimeout)
            return clearTimeout(t3);
          if ((s === i || !s) && clearTimeout)
            return s = clearTimeout, clearTimeout(t3);
          try {
            return s(t3);
          } catch (e3) {
            try {
              return s.call(null, t3);
            } catch (e4) {
              return s.call(this, t3);
            }
          }
        })(t2);
      }
    }
    function y(t2, e2) {
      this.fun = t2, this.array = e2;
    }
    y.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    function p() {
    }
    var d = p;
    var w = p;
    var b = p;
    var v = p;
    var A = p;
    var g = p;
    var _ = p;
    var m = e.performance || {};
    var O = m.now || m.mozNow || m.msNow || m.oNow || m.webkitNow || function() {
      return (/* @__PURE__ */ new Date()).getTime();
    };
    var B = /* @__PURE__ */ new Date();
    var E = {
      nextTick: function(t2) {
        var e2 = new Array(arguments.length - 1);
        if (arguments.length > 1)
          for (var r2 = 1; r2 < arguments.length; r2++)
            e2[r2 - 1] = arguments[r2];
        a.push(new y(t2, e2)), 1 !== a.length || f || n(l);
      },
      title: "browser",
      browser: true,
      env: {},
      argv: [],
      version: "",
      versions: {},
      on: d,
      addListener: w,
      once: b,
      off: v,
      removeListener: A,
      removeAllListeners: g,
      emit: _,
      binding: function(t2) {
        throw new Error("process.binding is not supported");
      },
      cwd: function() {
        return "/";
      },
      chdir: function(t2) {
        throw new Error("process.chdir is not supported");
      },
      umask: function() {
        return 0;
      },
      hrtime: function(t2) {
        var e2 = 1e-3 * O.call(m), r2 = Math.floor(e2), i2 = Math.floor(e2 % 1 * 1e9);
        return t2 && (r2 -= t2[0], (i2 -= t2[1]) < 0 && (r2--, i2 += 1e9)), [
          r2,
          i2
        ];
      },
      platform: "browser",
      release: {},
      config: {},
      uptime: function() {
        return (/* @__PURE__ */ new Date() - B) / 1e3;
      }
    };
    var S = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
    function T(t2) {
      if (t2.__esModule)
        return t2;
      var e2 = Object.defineProperty({}, "__esModule", {
        value: true
      });
      return Object.keys(t2).forEach(function(r2) {
        var i2 = Object.getOwnPropertyDescriptor(t2, r2);
        Object.defineProperty(e2, r2, i2.get ? i2 : {
          enumerable: true,
          get: function() {
            return t2[r2];
          }
        });
      }), e2;
    }
    var k;
    var x = {
      exports: {}
    };
    var j = {};
    var N2 = T(t({
      __proto__: null,
      default: j
    }, [
      j
    ]));
    k = x, (function() {
      var t2 = "input is invalid type", e2 = "object" == typeof window, r2 = e2 ? window : {};
      r2.JS_SHA256_NO_WINDOW && (e2 = false);
      var i2 = !e2 && "object" == typeof self, h3 = !r2.JS_SHA256_NO_NODE_JS && E.versions && E.versions.node;
      h3 ? r2 = S : i2 && (r2 = self);
      var s2 = !r2.JS_SHA256_NO_COMMON_JS && k.exports, n2 = !r2.JS_SHA256_NO_ARRAY_BUFFER && "undefined" != typeof ArrayBuffer, o2 = "0123456789abcdef".split(""), a2 = [
        -2147483648,
        8388608,
        32768,
        128
      ], f2 = [
        24,
        16,
        8,
        0
      ], u2 = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ], c2 = [
        "hex",
        "array",
        "digest",
        "arrayBuffer"
      ], l2 = [];
      !r2.JS_SHA256_NO_NODE_JS && Array.isArray || (Array.isArray = function(t3) {
        return "[object Array]" === Object.prototype.toString.call(t3);
      }), !n2 || !r2.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW && ArrayBuffer.isView || (ArrayBuffer.isView = function(t3) {
        return "object" == typeof t3 && t3.buffer && t3.buffer.constructor === ArrayBuffer;
      });
      var y2 = function(t3, e3) {
        return function(r3) {
          return new v2(e3, true).update(r3)[t3]();
        };
      }, p2 = function(t3) {
        var e3 = y2("hex", t3);
        h3 && (e3 = d2(e3, t3)), e3.create = function() {
          return new v2(t3);
        }, e3.update = function(t4) {
          return e3.create().update(t4);
        };
        for (var r3 = 0; r3 < c2.length; ++r3) {
          var i3 = c2[r3];
          e3[i3] = y2(i3, t3);
        }
        return e3;
      }, d2 = function(e3, i3) {
        var h4, s3 = N2, n3 = N2.Buffer, o3 = i3 ? "sha224" : "sha256";
        return h4 = n3.from && !r2.JS_SHA256_NO_BUFFER_FROM ? n3.from : function(t3) {
          return new n3(t3);
        }, function(r3) {
          if ("string" == typeof r3)
            return s3.createHash(o3).update(r3, "utf8").digest("hex");
          if (null == r3)
            throw new Error(t2);
          return r3.constructor === ArrayBuffer && (r3 = new Uint8Array(r3)), Array.isArray(r3) || ArrayBuffer.isView(r3) || r3.constructor === n3 ? s3.createHash(o3).update(h4(r3)).digest("hex") : e3(r3);
        };
      }, w2 = function(t3, e3) {
        return function(r3, i3) {
          return new A2(r3, e3, true).update(i3)[t3]();
        };
      }, b2 = function(t3) {
        var e3 = w2("hex", t3);
        e3.create = function(e4) {
          return new A2(e4, t3);
        }, e3.update = function(t4, r4) {
          return e3.create(t4).update(r4);
        };
        for (var r3 = 0; r3 < c2.length; ++r3) {
          var i3 = c2[r3];
          e3[i3] = w2(i3, t3);
        }
        return e3;
      };
      function v2(t3, e3) {
        e3 ? (l2[0] = l2[16] = l2[1] = l2[2] = l2[3] = l2[4] = l2[5] = l2[6] = l2[7] = l2[8] = l2[9] = l2[10] = l2[11] = l2[12] = l2[13] = l2[14] = l2[15] = 0, this.blocks = l2) : this.blocks = [
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
          0
        ], t3 ? (this.h0 = 3238371032, this.h1 = 914150663, this.h2 = 812702999, this.h3 = 4144912697, this.h4 = 4290775857, this.h5 = 1750603025, this.h6 = 1694076839, this.h7 = 3204075428) : (this.h0 = 1779033703, this.h1 = 3144134277, this.h2 = 1013904242, this.h3 = 2773480762, this.h4 = 1359893119, this.h5 = 2600822924, this.h6 = 528734635, this.h7 = 1541459225), this.block = this.start = this.bytes = this.hBytes = 0, this.finalized = this.hashed = false, this.first = true, this.is224 = t3;
      }
      function A2(e3, r3, i3) {
        var h4, s3 = typeof e3;
        if ("string" === s3) {
          var o3, a3 = [], f3 = e3.length, u3 = 0;
          for (h4 = 0; h4 < f3; ++h4)
            (o3 = e3.charCodeAt(h4)) < 128 ? a3[u3++] = o3 : o3 < 2048 ? (a3[u3++] = 192 | o3 >>> 6, a3[u3++] = 128 | 63 & o3) : o3 < 55296 || o3 >= 57344 ? (a3[u3++] = 224 | o3 >>> 12, a3[u3++] = 128 | o3 >>> 6 & 63, a3[u3++] = 128 | 63 & o3) : (o3 = 65536 + ((1023 & o3) << 10 | 1023 & e3.charCodeAt(++h4)), a3[u3++] = 240 | o3 >>> 18, a3[u3++] = 128 | o3 >>> 12 & 63, a3[u3++] = 128 | o3 >>> 6 & 63, a3[u3++] = 128 | 63 & o3);
          e3 = a3;
        } else {
          if ("object" !== s3)
            throw new Error(t2);
          if (null === e3)
            throw new Error(t2);
          if (n2 && e3.constructor === ArrayBuffer)
            e3 = new Uint8Array(e3);
          else if (!(Array.isArray(e3) || n2 && ArrayBuffer.isView(e3)))
            throw new Error(t2);
        }
        e3.length > 64 && (e3 = new v2(r3, true).update(e3).array());
        var c3 = [], l3 = [];
        for (h4 = 0; h4 < 64; ++h4) {
          var y3 = e3[h4] || 0;
          c3[h4] = 92 ^ y3, l3[h4] = 54 ^ y3;
        }
        v2.call(this, r3, i3), this.update(l3), this.oKeyPad = c3, this.inner = true, this.sharedMemory = i3;
      }
      v2.prototype.update = function(e3) {
        if (!this.finalized) {
          var r3, i3 = typeof e3;
          if ("string" !== i3) {
            if ("object" !== i3)
              throw new Error(t2);
            if (null === e3)
              throw new Error(t2);
            if (n2 && e3.constructor === ArrayBuffer)
              e3 = new Uint8Array(e3);
            else if (!(Array.isArray(e3) || n2 && ArrayBuffer.isView(e3)))
              throw new Error(t2);
            r3 = true;
          }
          for (var h4, s3, o3 = 0, a3 = e3.length, u3 = this.blocks; o3 < a3; ) {
            if (this.hashed && (this.hashed = false, u3[0] = this.block, this.block = u3[16] = u3[1] = u3[2] = u3[3] = u3[4] = u3[5] = u3[6] = u3[7] = u3[8] = u3[9] = u3[10] = u3[11] = u3[12] = u3[13] = u3[14] = u3[15] = 0), r3)
              for (s3 = this.start; o3 < a3 && s3 < 64; ++o3)
                u3[s3 >>> 2] |= e3[o3] << f2[3 & s3++];
            else
              for (s3 = this.start; o3 < a3 && s3 < 64; ++o3)
                (h4 = e3.charCodeAt(o3)) < 128 ? u3[s3 >>> 2] |= h4 << f2[3 & s3++] : h4 < 2048 ? (u3[s3 >>> 2] |= (192 | h4 >>> 6) << f2[3 & s3++], u3[s3 >>> 2] |= (128 | 63 & h4) << f2[3 & s3++]) : h4 < 55296 || h4 >= 57344 ? (u3[s3 >>> 2] |= (224 | h4 >>> 12) << f2[3 & s3++], u3[s3 >>> 2] |= (128 | h4 >>> 6 & 63) << f2[3 & s3++], u3[s3 >>> 2] |= (128 | 63 & h4) << f2[3 & s3++]) : (h4 = 65536 + ((1023 & h4) << 10 | 1023 & e3.charCodeAt(++o3)), u3[s3 >>> 2] |= (240 | h4 >>> 18) << f2[3 & s3++], u3[s3 >>> 2] |= (128 | h4 >>> 12 & 63) << f2[3 & s3++], u3[s3 >>> 2] |= (128 | h4 >>> 6 & 63) << f2[3 & s3++], u3[s3 >>> 2] |= (128 | 63 & h4) << f2[3 & s3++]);
            this.lastByteIndex = s3, this.bytes += s3 - this.start, s3 >= 64 ? (this.block = u3[16], this.start = s3 - 64, this.hash(), this.hashed = true) : this.start = s3;
          }
          return this.bytes > 4294967295 && (this.hBytes += this.bytes / 4294967296 | 0, this.bytes = this.bytes % 4294967296), this;
        }
      }, v2.prototype.finalize = function() {
        if (!this.finalized) {
          this.finalized = true;
          var t3 = this.blocks, e3 = this.lastByteIndex;
          t3[16] = this.block, t3[e3 >>> 2] |= a2[3 & e3], this.block = t3[16], e3 >= 56 && (this.hashed || this.hash(), t3[0] = this.block, t3[16] = t3[1] = t3[2] = t3[3] = t3[4] = t3[5] = t3[6] = t3[7] = t3[8] = t3[9] = t3[10] = t3[11] = t3[12] = t3[13] = t3[14] = t3[15] = 0), t3[14] = this.hBytes << 3 | this.bytes >>> 29, t3[15] = this.bytes << 3, this.hash();
        }
      }, v2.prototype.hash = function() {
        var t3, e3, r3, i3, h4, s3, n3, o3, a3, f3 = this.h0, c3 = this.h1, l3 = this.h2, y3 = this.h3, p3 = this.h4, d3 = this.h5, w3 = this.h6, b3 = this.h7, v3 = this.blocks;
        for (t3 = 16; t3 < 64; ++t3)
          e3 = ((h4 = v3[t3 - 15]) >>> 7 | h4 << 25) ^ (h4 >>> 18 | h4 << 14) ^ h4 >>> 3, r3 = ((h4 = v3[t3 - 2]) >>> 17 | h4 << 15) ^ (h4 >>> 19 | h4 << 13) ^ h4 >>> 10, v3[t3] = v3[t3 - 16] + e3 + v3[t3 - 7] + r3 | 0;
        for (a3 = c3 & l3, t3 = 0; t3 < 64; t3 += 4)
          this.first ? (this.is224 ? (s3 = 300032, b3 = (h4 = v3[0] - 1413257819) - 150054599 | 0, y3 = h4 + 24177077 | 0) : (s3 = 704751109, b3 = (h4 = v3[0] - 210244248) - 1521486534 | 0, y3 = h4 + 143694565 | 0), this.first = false) : (e3 = (f3 >>> 2 | f3 << 30) ^ (f3 >>> 13 | f3 << 19) ^ (f3 >>> 22 | f3 << 10), i3 = (s3 = f3 & c3) ^ f3 & l3 ^ a3, b3 = y3 + (h4 = b3 + (r3 = (p3 >>> 6 | p3 << 26) ^ (p3 >>> 11 | p3 << 21) ^ (p3 >>> 25 | p3 << 7)) + (p3 & d3 ^ ~p3 & w3) + u2[t3] + v3[t3]) | 0, y3 = h4 + (e3 + i3) | 0), e3 = (y3 >>> 2 | y3 << 30) ^ (y3 >>> 13 | y3 << 19) ^ (y3 >>> 22 | y3 << 10), i3 = (n3 = y3 & f3) ^ y3 & c3 ^ s3, w3 = l3 + (h4 = w3 + (r3 = (b3 >>> 6 | b3 << 26) ^ (b3 >>> 11 | b3 << 21) ^ (b3 >>> 25 | b3 << 7)) + (b3 & p3 ^ ~b3 & d3) + u2[t3 + 1] + v3[t3 + 1]) | 0, e3 = ((l3 = h4 + (e3 + i3) | 0) >>> 2 | l3 << 30) ^ (l3 >>> 13 | l3 << 19) ^ (l3 >>> 22 | l3 << 10), i3 = (o3 = l3 & y3) ^ l3 & f3 ^ n3, d3 = c3 + (h4 = d3 + (r3 = (w3 >>> 6 | w3 << 26) ^ (w3 >>> 11 | w3 << 21) ^ (w3 >>> 25 | w3 << 7)) + (w3 & b3 ^ ~w3 & p3) + u2[t3 + 2] + v3[t3 + 2]) | 0, e3 = ((c3 = h4 + (e3 + i3) | 0) >>> 2 | c3 << 30) ^ (c3 >>> 13 | c3 << 19) ^ (c3 >>> 22 | c3 << 10), i3 = (a3 = c3 & l3) ^ c3 & y3 ^ o3, p3 = f3 + (h4 = p3 + (r3 = (d3 >>> 6 | d3 << 26) ^ (d3 >>> 11 | d3 << 21) ^ (d3 >>> 25 | d3 << 7)) + (d3 & w3 ^ ~d3 & b3) + u2[t3 + 3] + v3[t3 + 3]) | 0, f3 = h4 + (e3 + i3) | 0, this.chromeBugWorkAround = true;
        this.h0 = this.h0 + f3 | 0, this.h1 = this.h1 + c3 | 0, this.h2 = this.h2 + l3 | 0, this.h3 = this.h3 + y3 | 0, this.h4 = this.h4 + p3 | 0, this.h5 = this.h5 + d3 | 0, this.h6 = this.h6 + w3 | 0, this.h7 = this.h7 + b3 | 0;
      }, v2.prototype.hex = function() {
        this.finalize();
        var t3 = this.h0, e3 = this.h1, r3 = this.h2, i3 = this.h3, h4 = this.h4, s3 = this.h5, n3 = this.h6, a3 = this.h7, f3 = o2[t3 >>> 28 & 15] + o2[t3 >>> 24 & 15] + o2[t3 >>> 20 & 15] + o2[t3 >>> 16 & 15] + o2[t3 >>> 12 & 15] + o2[t3 >>> 8 & 15] + o2[t3 >>> 4 & 15] + o2[15 & t3] + o2[e3 >>> 28 & 15] + o2[e3 >>> 24 & 15] + o2[e3 >>> 20 & 15] + o2[e3 >>> 16 & 15] + o2[e3 >>> 12 & 15] + o2[e3 >>> 8 & 15] + o2[e3 >>> 4 & 15] + o2[15 & e3] + o2[r3 >>> 28 & 15] + o2[r3 >>> 24 & 15] + o2[r3 >>> 20 & 15] + o2[r3 >>> 16 & 15] + o2[r3 >>> 12 & 15] + o2[r3 >>> 8 & 15] + o2[r3 >>> 4 & 15] + o2[15 & r3] + o2[i3 >>> 28 & 15] + o2[i3 >>> 24 & 15] + o2[i3 >>> 20 & 15] + o2[i3 >>> 16 & 15] + o2[i3 >>> 12 & 15] + o2[i3 >>> 8 & 15] + o2[i3 >>> 4 & 15] + o2[15 & i3] + o2[h4 >>> 28 & 15] + o2[h4 >>> 24 & 15] + o2[h4 >>> 20 & 15] + o2[h4 >>> 16 & 15] + o2[h4 >>> 12 & 15] + o2[h4 >>> 8 & 15] + o2[h4 >>> 4 & 15] + o2[15 & h4] + o2[s3 >>> 28 & 15] + o2[s3 >>> 24 & 15] + o2[s3 >>> 20 & 15] + o2[s3 >>> 16 & 15] + o2[s3 >>> 12 & 15] + o2[s3 >>> 8 & 15] + o2[s3 >>> 4 & 15] + o2[15 & s3] + o2[n3 >>> 28 & 15] + o2[n3 >>> 24 & 15] + o2[n3 >>> 20 & 15] + o2[n3 >>> 16 & 15] + o2[n3 >>> 12 & 15] + o2[n3 >>> 8 & 15] + o2[n3 >>> 4 & 15] + o2[15 & n3];
        return this.is224 || (f3 += o2[a3 >>> 28 & 15] + o2[a3 >>> 24 & 15] + o2[a3 >>> 20 & 15] + o2[a3 >>> 16 & 15] + o2[a3 >>> 12 & 15] + o2[a3 >>> 8 & 15] + o2[a3 >>> 4 & 15] + o2[15 & a3]), f3;
      }, v2.prototype.toString = v2.prototype.hex, v2.prototype.digest = function() {
        this.finalize();
        var t3 = this.h0, e3 = this.h1, r3 = this.h2, i3 = this.h3, h4 = this.h4, s3 = this.h5, n3 = this.h6, o3 = this.h7, a3 = [
          t3 >>> 24 & 255,
          t3 >>> 16 & 255,
          t3 >>> 8 & 255,
          255 & t3,
          e3 >>> 24 & 255,
          e3 >>> 16 & 255,
          e3 >>> 8 & 255,
          255 & e3,
          r3 >>> 24 & 255,
          r3 >>> 16 & 255,
          r3 >>> 8 & 255,
          255 & r3,
          i3 >>> 24 & 255,
          i3 >>> 16 & 255,
          i3 >>> 8 & 255,
          255 & i3,
          h4 >>> 24 & 255,
          h4 >>> 16 & 255,
          h4 >>> 8 & 255,
          255 & h4,
          s3 >>> 24 & 255,
          s3 >>> 16 & 255,
          s3 >>> 8 & 255,
          255 & s3,
          n3 >>> 24 & 255,
          n3 >>> 16 & 255,
          n3 >>> 8 & 255,
          255 & n3
        ];
        return this.is224 || a3.push(o3 >>> 24 & 255, o3 >>> 16 & 255, o3 >>> 8 & 255, 255 & o3), a3;
      }, v2.prototype.array = v2.prototype.digest, v2.prototype.arrayBuffer = function() {
        this.finalize();
        var t3 = new ArrayBuffer(this.is224 ? 28 : 32), e3 = new DataView(t3);
        return e3.setUint32(0, this.h0), e3.setUint32(4, this.h1), e3.setUint32(8, this.h2), e3.setUint32(12, this.h3), e3.setUint32(16, this.h4), e3.setUint32(20, this.h5), e3.setUint32(24, this.h6), this.is224 || e3.setUint32(28, this.h7), t3;
      }, A2.prototype = new v2(), A2.prototype.finalize = function() {
        if (v2.prototype.finalize.call(this), this.inner) {
          this.inner = false;
          var t3 = this.array();
          v2.call(this, this.is224, this.sharedMemory), this.update(this.oKeyPad), this.update(t3), v2.prototype.finalize.call(this);
        }
      };
      var g2 = p2();
      g2.sha256 = g2, g2.sha224 = p2(true), g2.sha256.hmac = b2(), g2.sha224.hmac = b2(true), s2 ? k.exports = g2 : (r2.sha256 = g2.sha256, r2.sha224 = g2.sha224);
    })();
    var U = x.exports;
    var z = x.exports.sha224;
    var J = x.exports.sha256;
    exports2.default = U;
    exports2.sha224 = z;
    exports2.sha256 = J;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/sha_digest.parser.js
var require_sha_digest_parser = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/sha_digest.parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parseSha256 = parseSha256;
    exports2.checkSha256 = checkSha256;
    function parseSha256(s) {
      return toByteArray(s);
    }
    function isHex(s) {
      const hexRegex = /^[0-9A-Fa-f]+$/;
      if (!hexRegex.test(s)) {
        return false;
      }
      const isAllUpperCase = /^[0-9A-F]+$/.test(s);
      const isAllLowerCase = /^[0-9a-f]+$/.test(s);
      if (!(isAllUpperCase || isAllLowerCase)) {
        return false;
      }
      return s.length % 2 === 0;
    }
    function isBase64(s) {
      return /^[A-Za-z0-9\-_]*(={0,2})?$/.test(s) || /^[A-Za-z0-9+/]*(={0,2})?$/.test(s);
    }
    function detectEncoding(input) {
      if (isHex(input)) {
        return "hex";
      } else if (isBase64(input)) {
        return "b64";
      }
      return "";
    }
    function hexToByteArray(s) {
      if (s.length % 2 !== 0) {
        throw new Error("hex string must have an even length");
      }
      const a = new Uint8Array(s.length / 2);
      for (let i = 0; i < s.length; i += 2) {
        a[i / 2] = parseInt(s.substring(i, i + 2), 16);
      }
      return a;
    }
    function base64ToByteArray(s) {
      s = s.replace(/-/g, "+");
      s = s.replace(/_/g, "/");
      const sbin = atob(s);
      return Uint8Array.from(sbin, (c) => c.charCodeAt(0));
    }
    function toByteArray(input) {
      const encoding = detectEncoding(input);
      switch (encoding) {
        case "hex":
          return hexToByteArray(input);
        case "b64":
          return base64ToByteArray(input);
      }
      return null;
    }
    function checkSha256(a, b) {
      const aBytes = typeof a === "string" ? parseSha256(a) : a;
      const bBytes = typeof b === "string" ? parseSha256(b) : b;
      if (aBytes === null || bBytes === null) {
        return false;
      }
      if (aBytes.length !== bBytes.length) {
        return false;
      }
      for (let i = 0; i < aBytes.length; i++) {
        if (aBytes[i] !== bBytes[i]) {
          return false;
        }
      }
      return true;
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/objectstore.js
var require_objectstore = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/objectstore.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectStoreImpl = exports2.ObjectStoreStatusImpl = exports2.digestType = exports2.osPrefix = void 0;
    exports2.objectStoreStreamName = objectStoreStreamName;
    exports2.objectStoreBucketName = objectStoreBucketName;
    var kv_1 = require_kv();
    var base64_1 = require_base64();
    var codec_1 = require_codec();
    var nuid_1 = require_nuid();
    var util_1 = require_util();
    var databuffer_1 = require_databuffer();
    var headers_1 = require_headers();
    var types_1 = require_types2();
    var queued_iterator_1 = require_queued_iterator();
    var js_sha256_1 = require_js_sha256();
    var jsapi_types_1 = require_jsapi_types();
    var jsclient_1 = require_jsclient();
    var sha_digest_parser_1 = require_sha_digest_parser();
    exports2.osPrefix = "OBJ_";
    exports2.digestType = "SHA-256=";
    function objectStoreStreamName(bucket) {
      (0, kv_1.validateBucket)(bucket);
      return `${exports2.osPrefix}${bucket}`;
    }
    function objectStoreBucketName(stream2) {
      if (stream2.startsWith(exports2.osPrefix)) {
        return stream2.substring(4);
      }
      return stream2;
    }
    var ObjectStoreStatusImpl = class {
      constructor(si) {
        this.si = si;
        this.backingStore = "JetStream";
      }
      get bucket() {
        return objectStoreBucketName(this.si.config.name);
      }
      get description() {
        var _a2;
        return (_a2 = this.si.config.description) !== null && _a2 !== void 0 ? _a2 : "";
      }
      get ttl() {
        return this.si.config.max_age;
      }
      get storage() {
        return this.si.config.storage;
      }
      get replicas() {
        return this.si.config.num_replicas;
      }
      get sealed() {
        return this.si.config.sealed;
      }
      get size() {
        return this.si.state.bytes;
      }
      get streamInfo() {
        return this.si;
      }
      get metadata() {
        return this.si.config.metadata;
      }
      get compression() {
        if (this.si.config.compression) {
          return this.si.config.compression !== jsapi_types_1.StoreCompression.None;
        }
        return false;
      }
    };
    exports2.ObjectStoreStatusImpl = ObjectStoreStatusImpl;
    var ObjectInfoImpl = class {
      constructor(oi) {
        this.info = oi;
      }
      get name() {
        return this.info.name;
      }
      get description() {
        var _a2;
        return (_a2 = this.info.description) !== null && _a2 !== void 0 ? _a2 : "";
      }
      get headers() {
        if (!this.hdrs) {
          this.hdrs = headers_1.MsgHdrsImpl.fromRecord(this.info.headers || {});
        }
        return this.hdrs;
      }
      get options() {
        return this.info.options;
      }
      get bucket() {
        return this.info.bucket;
      }
      get chunks() {
        return this.info.chunks;
      }
      get deleted() {
        var _a2;
        return (_a2 = this.info.deleted) !== null && _a2 !== void 0 ? _a2 : false;
      }
      get digest() {
        return this.info.digest;
      }
      get mtime() {
        return this.info.mtime;
      }
      get nuid() {
        return this.info.nuid;
      }
      get size() {
        return this.info.size;
      }
      get revision() {
        return this.info.revision;
      }
      get metadata() {
        return this.info.metadata || {};
      }
      isLink() {
        var _a2, _b;
        return ((_a2 = this.info.options) === null || _a2 === void 0 ? void 0 : _a2.link) !== void 0 && ((_b = this.info.options) === null || _b === void 0 ? void 0 : _b.link) !== null;
      }
    };
    function toServerObjectStoreMeta(meta) {
      var _a2;
      const v = {
        name: meta.name,
        description: (_a2 = meta.description) !== null && _a2 !== void 0 ? _a2 : "",
        options: meta.options,
        metadata: meta.metadata
      };
      if (meta.headers) {
        const mhi = meta.headers;
        v.headers = mhi.toRecord();
      }
      return v;
    }
    function emptyReadableStream() {
      return new ReadableStream({
        pull(c) {
          c.enqueue(new Uint8Array(0));
          c.close();
        }
      });
    }
    var ObjectStoreImpl = class _ObjectStoreImpl {
      constructor(name, jsm, js) {
        this.name = name;
        this.jsm = jsm;
        this.js = js;
      }
      _checkNotEmpty(name) {
        if (!name || name.length === 0) {
          return { name, error: new Error("name cannot be empty") };
        }
        return { name };
      }
      info(name) {
        return __awaiter(this, void 0, void 0, function* () {
          const info = yield this.rawInfo(name);
          return info ? new ObjectInfoImpl(info) : null;
        });
      }
      list() {
        return __awaiter(this, void 0, void 0, function* () {
          var _a2, e_1, _b, _c;
          const buf = [];
          const iter = yield this.watch({
            ignoreDeletes: true,
            includeHistory: true
          });
          try {
            for (var _d2 = true, iter_1 = __asyncValues(iter), iter_1_1; iter_1_1 = yield iter_1.next(), _a2 = iter_1_1.done, !_a2; _d2 = true) {
              _c = iter_1_1.value;
              _d2 = false;
              const info = _c;
              if (info === null) {
                break;
              }
              buf.push(info);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (!_d2 && !_a2 && (_b = iter_1.return)) yield _b.call(iter_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
          return Promise.resolve(buf);
        });
      }
      rawInfo(name) {
        return __awaiter(this, void 0, void 0, function* () {
          const { name: obj, error } = this._checkNotEmpty(name);
          if (error) {
            return Promise.reject(error);
          }
          const meta = this._metaSubject(obj);
          try {
            const m = yield this.jsm.streams.getMessage(this.stream, {
              last_by_subj: meta
            });
            const jc = (0, codec_1.JSONCodec)();
            const soi = jc.decode(m.data);
            soi.revision = m.seq;
            return soi;
          } catch (err2) {
            if (err2.code === "404") {
              return null;
            }
            return Promise.reject(err2);
          }
        });
      }
      _si(opts) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            return yield this.jsm.streams.info(this.stream, opts);
          } catch (err2) {
            const nerr = err2;
            if (nerr.code === "404") {
              return null;
            }
            return Promise.reject(err2);
          }
        });
      }
      seal() {
        return __awaiter(this, void 0, void 0, function* () {
          let info = yield this._si();
          if (info === null) {
            return Promise.reject(new Error("object store not found"));
          }
          info.config.sealed = true;
          info = yield this.jsm.streams.update(this.stream, info.config);
          return Promise.resolve(new ObjectStoreStatusImpl(info));
        });
      }
      status(opts) {
        return __awaiter(this, void 0, void 0, function* () {
          const info = yield this._si(opts);
          if (info === null) {
            return Promise.reject(new Error("object store not found"));
          }
          return Promise.resolve(new ObjectStoreStatusImpl(info));
        });
      }
      destroy() {
        return this.jsm.streams.delete(this.stream);
      }
      _put(meta, rs, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          var _a2, _b;
          const jsopts = this.js.getOptions();
          opts = opts || { timeout: jsopts.timeout };
          opts.timeout = opts.timeout || jsopts.timeout;
          opts.previousRevision = (_a2 = opts.previousRevision) !== null && _a2 !== void 0 ? _a2 : void 0;
          const { timeout, previousRevision } = opts;
          const si = this.js.nc.info;
          const maxPayload = (si === null || si === void 0 ? void 0 : si.max_payload) || 1024;
          meta = meta || {};
          meta.options = meta.options || {};
          let maxChunk = ((_b = meta.options) === null || _b === void 0 ? void 0 : _b.max_chunk_size) || 128 * 1024;
          maxChunk = maxChunk > maxPayload ? maxPayload : maxChunk;
          meta.options.max_chunk_size = maxChunk;
          const old = yield this.info(meta.name);
          const { name: n, error } = this._checkNotEmpty(meta.name);
          if (error) {
            return Promise.reject(error);
          }
          const id = nuid_1.nuid.next();
          const chunkSubj = this._chunkSubject(id);
          const metaSubj = this._metaSubject(n);
          const info = Object.assign({
            bucket: this.name,
            nuid: id,
            size: 0,
            chunks: 0
          }, toServerObjectStoreMeta(meta));
          const d = (0, util_1.deferred)();
          const proms = [];
          const db = new databuffer_1.DataBuffer();
          try {
            const reader = rs ? rs.getReader() : null;
            const sha = js_sha256_1.sha256.create();
            while (true) {
              const { done, value } = reader ? yield reader.read() : { done: true, value: void 0 };
              if (done) {
                if (db.size() > 0) {
                  const payload = db.drain();
                  sha.update(payload);
                  info.chunks++;
                  info.size += payload.length;
                  proms.push(this.js.publish(chunkSubj, payload, { timeout }));
                }
                yield Promise.all(proms);
                proms.length = 0;
                info.mtime = (/* @__PURE__ */ new Date()).toISOString();
                const digest = base64_1.Base64UrlPaddedCodec.encode(sha.digest());
                info.digest = `${exports2.digestType}${digest}`;
                info.deleted = false;
                const h2 = (0, headers_1.headers)();
                if (typeof previousRevision === "number") {
                  h2.set(jsclient_1.PubHeaders.ExpectedLastSubjectSequenceHdr, `${previousRevision}`);
                }
                h2.set(types_1.JsHeaders.RollupHdr, types_1.JsHeaders.RollupValueSubject);
                const pa = yield this.js.publish(metaSubj, (0, codec_1.JSONCodec)().encode(info), {
                  headers: h2,
                  timeout
                });
                info.revision = pa.seq;
                if (old) {
                  try {
                    yield this.jsm.streams.purge(this.stream, {
                      filter: `$O.${this.name}.C.${old.nuid}`
                    });
                  } catch (_err) {
                  }
                }
                d.resolve(new ObjectInfoImpl(info));
                break;
              }
              if (value) {
                db.fill(value);
                while (db.size() > maxChunk) {
                  info.chunks++;
                  info.size += maxChunk;
                  const payload = db.drain(meta.options.max_chunk_size);
                  sha.update(payload);
                  proms.push(this.js.publish(chunkSubj, payload, { timeout }));
                }
              }
            }
          } catch (err2) {
            yield this.jsm.streams.purge(this.stream, { filter: chunkSubj });
            d.reject(err2);
          }
          return d;
        });
      }
      putBlob(meta, data, opts) {
        function readableStreamFrom(data2) {
          return new ReadableStream({
            pull(controller) {
              controller.enqueue(data2);
              controller.close();
            }
          });
        }
        if (data === null) {
          data = new Uint8Array(0);
        }
        return this.put(meta, readableStreamFrom(data), opts);
      }
      put(meta, rs, opts) {
        var _a2;
        if ((_a2 = meta === null || meta === void 0 ? void 0 : meta.options) === null || _a2 === void 0 ? void 0 : _a2.link) {
          return Promise.reject(new Error("link cannot be set when putting the object in bucket"));
        }
        return this._put(meta, rs, opts);
      }
      getBlob(name) {
        return __awaiter(this, void 0, void 0, function* () {
          function fromReadableStream(rs) {
            return __awaiter(this, void 0, void 0, function* () {
              const buf = new databuffer_1.DataBuffer();
              const reader = rs.getReader();
              while (true) {
                const { done, value } = yield reader.read();
                if (done) {
                  return buf.drain();
                }
                if (value && value.length) {
                  buf.fill(value);
                }
              }
            });
          }
          const r = yield this.get(name);
          if (r === null) {
            return Promise.resolve(null);
          }
          const vs = yield Promise.all([r.error, fromReadableStream(r.data)]);
          if (vs[0]) {
            return Promise.reject(vs[0]);
          } else {
            return Promise.resolve(vs[1]);
          }
        });
      }
      get(name) {
        return __awaiter(this, void 0, void 0, function* () {
          const info = yield this.rawInfo(name);
          if (info === null) {
            return Promise.resolve(null);
          }
          if (info.deleted) {
            return Promise.resolve(null);
          }
          if (info.options && info.options.link) {
            const ln = info.options.link.name || "";
            if (ln === "") {
              throw new Error("link is a bucket");
            }
            const os = info.options.link.bucket !== this.name ? yield _ObjectStoreImpl.create(this.js, info.options.link.bucket) : this;
            return os.get(ln);
          }
          if (!info.digest.startsWith(exports2.digestType)) {
            return Promise.reject(new Error(`unknown digest type: ${info.digest}`));
          }
          const digest = (0, sha_digest_parser_1.parseSha256)(info.digest.substring(8));
          if (digest === null) {
            return Promise.reject(new Error(`unable to parse digest: ${info.digest}`));
          }
          const d = (0, util_1.deferred)();
          const r = {
            info: new ObjectInfoImpl(info),
            error: d
          };
          if (info.size === 0) {
            r.data = emptyReadableStream();
            d.resolve(null);
            return Promise.resolve(r);
          }
          let controller;
          const oc = (0, types_1.consumerOpts)();
          oc.orderedConsumer();
          const sha = js_sha256_1.sha256.create();
          const subj = `$O.${this.name}.C.${info.nuid}`;
          const sub = yield this.js.subscribe(subj, oc);
          (() => __awaiter(this, void 0, void 0, function* () {
            var _a2, e_2, _b, _c;
            try {
              for (var _d2 = true, sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = yield sub_1.next(), _a2 = sub_1_1.done, !_a2; _d2 = true) {
                _c = sub_1_1.value;
                _d2 = false;
                const jm = _c;
                if (jm.data.length > 0) {
                  sha.update(jm.data);
                  controller.enqueue(jm.data);
                }
                if (jm.info.pending === 0) {
                  if (!(0, sha_digest_parser_1.checkSha256)(digest, sha.digest())) {
                    controller.error(new Error(`received a corrupt object, digests do not match received: ${info.digest} calculated ${digest}`));
                  } else {
                    controller.close();
                  }
                  sub.unsubscribe();
                }
              }
            } catch (e_2_1) {
              e_2 = { error: e_2_1 };
            } finally {
              try {
                if (!_d2 && !_a2 && (_b = sub_1.return)) yield _b.call(sub_1);
              } finally {
                if (e_2) throw e_2.error;
              }
            }
          }))().then(() => {
            d.resolve();
          }).catch((err2) => {
            controller.error(err2);
            d.reject(err2);
          });
          r.data = new ReadableStream({
            start(c) {
              controller = c;
            },
            cancel() {
              sub.unsubscribe();
            }
          });
          return r;
        });
      }
      linkStore(name, bucket) {
        if (!(bucket instanceof _ObjectStoreImpl)) {
          return Promise.reject("bucket required");
        }
        const osi = bucket;
        const { name: n, error } = this._checkNotEmpty(name);
        if (error) {
          return Promise.reject(error);
        }
        const meta = {
          name: n,
          options: { link: { bucket: osi.name } }
        };
        return this._put(meta, null);
      }
      link(name, info) {
        return __awaiter(this, void 0, void 0, function* () {
          const { name: n, error } = this._checkNotEmpty(name);
          if (error) {
            return Promise.reject(error);
          }
          if (info.deleted) {
            return Promise.reject(new Error("src object is deleted"));
          }
          if (info.isLink()) {
            return Promise.reject(new Error("src object is a link"));
          }
          const dest = yield this.rawInfo(name);
          if (dest !== null && !dest.deleted) {
            return Promise.reject(new Error("an object already exists with that name"));
          }
          const link = { bucket: info.bucket, name: info.name };
          const mm = {
            name: n,
            bucket: info.bucket,
            options: { link }
          };
          yield this.js.publish(this._metaSubject(name), JSON.stringify(mm));
          const i = yield this.info(name);
          return Promise.resolve(i);
        });
      }
      delete(name) {
        return __awaiter(this, void 0, void 0, function* () {
          const info = yield this.rawInfo(name);
          if (info === null) {
            return Promise.resolve({ purged: 0, success: false });
          }
          info.deleted = true;
          info.size = 0;
          info.chunks = 0;
          info.digest = "";
          const jc = (0, codec_1.JSONCodec)();
          const h2 = (0, headers_1.headers)();
          h2.set(types_1.JsHeaders.RollupHdr, types_1.JsHeaders.RollupValueSubject);
          yield this.js.publish(this._metaSubject(info.name), jc.encode(info), {
            headers: h2
          });
          return this.jsm.streams.purge(this.stream, {
            filter: this._chunkSubject(info.nuid)
          });
        });
      }
      update(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, meta = {}) {
          var _a2;
          const info = yield this.rawInfo(name);
          if (info === null) {
            return Promise.reject(new Error("object not found"));
          }
          if (info.deleted) {
            return Promise.reject(new Error("cannot update meta for a deleted object"));
          }
          meta.name = (_a2 = meta.name) !== null && _a2 !== void 0 ? _a2 : info.name;
          const { name: n, error } = this._checkNotEmpty(meta.name);
          if (error) {
            return Promise.reject(error);
          }
          if (name !== meta.name) {
            const i = yield this.info(meta.name);
            if (i && !i.deleted) {
              return Promise.reject(new Error("an object already exists with that name"));
            }
          }
          meta.name = n;
          const ii = Object.assign({}, info, toServerObjectStoreMeta(meta));
          const ack = yield this.js.publish(this._metaSubject(ii.name), JSON.stringify(ii));
          if (name !== meta.name) {
            yield this.jsm.streams.purge(this.stream, {
              filter: this._metaSubject(name)
            });
          }
          return Promise.resolve(ack);
        });
      }
      watch() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
          var _a2, _b;
          opts.includeHistory = (_a2 = opts.includeHistory) !== null && _a2 !== void 0 ? _a2 : false;
          opts.ignoreDeletes = (_b = opts.ignoreDeletes) !== null && _b !== void 0 ? _b : false;
          let initialized = false;
          const qi = new queued_iterator_1.QueuedIteratorImpl();
          const subj = this._metaSubjectAll();
          try {
            yield this.jsm.streams.getMessage(this.stream, { last_by_subj: subj });
          } catch (err2) {
            if (err2.code === "404") {
              qi.push(null);
              initialized = true;
            } else {
              qi.stop(err2);
            }
          }
          const jc = (0, codec_1.JSONCodec)();
          const copts = (0, types_1.consumerOpts)();
          copts.orderedConsumer();
          if (opts.includeHistory) {
            copts.deliverLastPerSubject();
          } else {
            initialized = true;
            copts.deliverNew();
          }
          copts.callback((err2, jm) => {
            var _a3;
            if (err2) {
              qi.stop(err2);
              return;
            }
            if (jm !== null) {
              const oi = jc.decode(jm.data);
              if (oi.deleted && opts.ignoreDeletes === true) {
              } else {
                qi.push(oi);
              }
              if (((_a3 = jm.info) === null || _a3 === void 0 ? void 0 : _a3.pending) === 0 && !initialized) {
                initialized = true;
                qi.push(null);
              }
            }
          });
          const sub = yield this.js.subscribe(subj, copts);
          qi._data = sub;
          qi.iterClosed.then(() => {
            sub.unsubscribe();
          });
          sub.closed.then(() => {
            qi.stop();
          }).catch((err2) => {
            qi.stop(err2);
          });
          return qi;
        });
      }
      _chunkSubject(id) {
        return `$O.${this.name}.C.${id}`;
      }
      _metaSubject(n) {
        return `$O.${this.name}.M.${base64_1.Base64UrlPaddedCodec.encode(n)}`;
      }
      _metaSubjectAll() {
        return `$O.${this.name}.M.>`;
      }
      init() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
          var _a2;
          try {
            this.stream = objectStoreStreamName(this.name);
          } catch (err2) {
            return Promise.reject(err2);
          }
          const max_age = (opts === null || opts === void 0 ? void 0 : opts.ttl) || 0;
          delete opts.ttl;
          const sc = Object.assign({ max_age }, opts);
          sc.name = this.stream;
          sc.num_replicas = (_a2 = opts.replicas) !== null && _a2 !== void 0 ? _a2 : 1;
          sc.allow_direct = true;
          sc.allow_rollup_hdrs = true;
          sc.discard = jsapi_types_1.DiscardPolicy.New;
          sc.subjects = [`$O.${this.name}.C.>`, `$O.${this.name}.M.>`];
          if (opts.placement) {
            sc.placement = opts.placement;
          }
          if (opts.metadata) {
            sc.metadata = opts.metadata;
          }
          if (typeof opts.compression === "boolean") {
            sc.compression = opts.compression ? jsapi_types_1.StoreCompression.S2 : jsapi_types_1.StoreCompression.None;
          }
          try {
            yield this.jsm.streams.info(sc.name);
          } catch (err2) {
            if (err2.message === "stream not found") {
              yield this.jsm.streams.add(sc);
            }
          }
        });
      }
      static create(js_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (js, name, opts = {}) {
          const jsm = yield js.jetstreamManager();
          const os = new _ObjectStoreImpl(name, jsm, js);
          yield os.init(opts);
          return Promise.resolve(os);
        });
      }
    };
    exports2.ObjectStoreImpl = ObjectStoreImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/idleheartbeat_monitor.js
var require_idleheartbeat_monitor = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/idleheartbeat_monitor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IdleHeartbeatMonitor = void 0;
    var IdleHeartbeatMonitor = class {
      /**
       * Constructor
       * @param interval in millis to check
       * @param cb a callback to report when heartbeats are missed
       * @param opts monitor options @see IdleHeartbeatOptions
       */
      constructor(interval, cb, opts = { maxOut: 2 }) {
        this.interval = interval;
        this.maxOut = (opts === null || opts === void 0 ? void 0 : opts.maxOut) || 2;
        this.cancelAfter = (opts === null || opts === void 0 ? void 0 : opts.cancelAfter) || 0;
        this.last = Date.now();
        this.missed = 0;
        this.count = 0;
        this.callback = cb;
        this._schedule();
      }
      /**
       * cancel monitoring
       */
      cancel() {
        if (this.autoCancelTimer) {
          clearTimeout(this.autoCancelTimer);
        }
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.timer = 0;
        this.autoCancelTimer = 0;
        this.missed = 0;
      }
      /**
       * work signals that there was work performed
       */
      work() {
        this.last = Date.now();
        this.missed = 0;
      }
      /**
       * internal api to change the interval, cancelAfter and maxOut
       * @param interval
       * @param cancelAfter
       * @param maxOut
       */
      _change(interval, cancelAfter = 0, maxOut = 2) {
        this.interval = interval;
        this.maxOut = maxOut;
        this.cancelAfter = cancelAfter;
        this.restart();
      }
      /**
       * cancels and restarts the monitoring
       */
      restart() {
        this.cancel();
        this._schedule();
      }
      /**
       * internal api called to start monitoring
       */
      _schedule() {
        if (this.cancelAfter > 0) {
          this.autoCancelTimer = setTimeout(() => {
            this.cancel();
          }, this.cancelAfter);
        }
        this.timer = setInterval(() => {
          this.count++;
          if (Date.now() - this.last > this.interval) {
            this.missed++;
          }
          if (this.missed >= this.maxOut) {
            try {
              if (this.callback(this.missed) === true) {
                this.cancel();
              }
            } catch (err2) {
              console.log(err2);
            }
          }
        }, this.interval);
      }
    };
    exports2.IdleHeartbeatMonitor = IdleHeartbeatMonitor;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsclient.js
var require_jsclient = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsclient.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.JetStreamSubscriptionImpl = exports2.JetStreamClientImpl = exports2.PubHeaders = void 0;
    var types_1 = require_types();
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var jsutil_1 = require_jsutil();
    var jsmconsumer_api_1 = require_jsmconsumer_api();
    var jsmsg_1 = require_jsmsg();
    var typedsub_1 = require_typedsub();
    var queued_iterator_1 = require_queued_iterator();
    var util_1 = require_util();
    var headers_1 = require_headers();
    var kv_1 = require_kv();
    var semver_1 = require_semver();
    var objectstore_1 = require_objectstore();
    var idleheartbeat_monitor_1 = require_idleheartbeat_monitor();
    var jsmstream_api_1 = require_jsmstream_api();
    var types_2 = require_types2();
    var core_1 = require_core();
    var jsapi_types_1 = require_jsapi_types();
    var nuid_1 = require_nuid();
    var PubHeaders;
    (function(PubHeaders2) {
      PubHeaders2["MsgIdHdr"] = "Nats-Msg-Id";
      PubHeaders2["ExpectedStreamHdr"] = "Nats-Expected-Stream";
      PubHeaders2["ExpectedLastSeqHdr"] = "Nats-Expected-Last-Sequence";
      PubHeaders2["ExpectedLastMsgIdHdr"] = "Nats-Expected-Last-Msg-Id";
      PubHeaders2["ExpectedLastSubjectSequenceHdr"] = "Nats-Expected-Last-Subject-Sequence";
    })(PubHeaders || (exports2.PubHeaders = PubHeaders = {}));
    var ViewsImpl = class {
      constructor(js) {
        this.js = js;
      }
      kv(name, opts = {}) {
        const jsi = this.js;
        const { ok, min } = jsi.nc.features.get(semver_1.Feature.JS_KV);
        if (!ok) {
          return Promise.reject(new Error(`kv is only supported on servers ${min} or better`));
        }
        if (opts.bindOnly) {
          return kv_1.Bucket.bind(this.js, name, opts);
        }
        return kv_1.Bucket.create(this.js, name, opts);
      }
      os(name, opts = {}) {
        var _a2;
        if (typeof ((_a2 = crypto === null || crypto === void 0 ? void 0 : crypto.subtle) === null || _a2 === void 0 ? void 0 : _a2.digest) !== "function") {
          return Promise.reject(new Error("objectstore: unable to calculate hashes - crypto.subtle.digest with sha256 support is required"));
        }
        const jsi = this.js;
        const { ok, min } = jsi.nc.features.get(semver_1.Feature.JS_OBJECTSTORE);
        if (!ok) {
          return Promise.reject(new Error(`objectstore is only supported on servers ${min} or better`));
        }
        return objectstore_1.ObjectStoreImpl.create(this.js, name, opts);
      }
    };
    var JetStreamClientImpl = class _JetStreamClientImpl extends jsbaseclient_api_1.BaseApiClient {
      constructor(nc, opts) {
        super(nc, opts);
        this.consumerAPI = new jsmconsumer_api_1.ConsumerAPIImpl(nc, opts);
        this.streamAPI = new jsmstream_api_1.StreamAPIImpl(nc, opts);
        this.consumers = new jsmstream_api_1.ConsumersImpl(this.consumerAPI);
        this.streams = new jsmstream_api_1.StreamsImpl(this.streamAPI);
      }
      jetstreamManager(checkAPI) {
        if (checkAPI === void 0) {
          checkAPI = this.opts.checkAPI;
        }
        const opts = Object.assign({}, this.opts, { checkAPI });
        return this.nc.jetstreamManager(opts);
      }
      get apiPrefix() {
        return this.prefix;
      }
      get views() {
        return new ViewsImpl(this);
      }
      publish(subj_1) {
        return __awaiter(this, arguments, void 0, function* (subj, data = types_1.Empty, opts) {
          opts = opts || {};
          opts.expect = opts.expect || {};
          const mh = (opts === null || opts === void 0 ? void 0 : opts.headers) || (0, headers_1.headers)();
          if (opts) {
            if (opts.msgID) {
              mh.set(PubHeaders.MsgIdHdr, opts.msgID);
            }
            if (opts.expect.lastMsgID) {
              mh.set(PubHeaders.ExpectedLastMsgIdHdr, opts.expect.lastMsgID);
            }
            if (opts.expect.streamName) {
              mh.set(PubHeaders.ExpectedStreamHdr, opts.expect.streamName);
            }
            if (typeof opts.expect.lastSequence === "number") {
              mh.set(PubHeaders.ExpectedLastSeqHdr, `${opts.expect.lastSequence}`);
            }
            if (typeof opts.expect.lastSubjectSequence === "number") {
              mh.set(PubHeaders.ExpectedLastSubjectSequenceHdr, `${opts.expect.lastSubjectSequence}`);
            }
          }
          const to = opts.timeout || this.timeout;
          const ro = {};
          if (to) {
            ro.timeout = to;
          }
          if (opts) {
            ro.headers = mh;
          }
          let { retries, retry_delay } = opts;
          retries = retries || 1;
          retry_delay = retry_delay || 250;
          let r;
          for (let i = 0; i < retries; i++) {
            try {
              r = yield this.nc.request(subj, data, ro);
              break;
            } catch (err2) {
              const ne = err2;
              if (ne.code === "503" && i + 1 < retries) {
                yield (0, util_1.delay)(retry_delay);
              } else {
                throw err2;
              }
            }
          }
          const pa = this.parseJsResponse(r);
          if (pa.stream === "") {
            throw types_1.NatsError.errorForCode(core_1.ErrorCode.JetStreamInvalidAck);
          }
          pa.duplicate = pa.duplicate ? pa.duplicate : false;
          return pa;
        });
      }
      pull(stream_1, durable_1) {
        return __awaiter(this, arguments, void 0, function* (stream2, durable, expires = 0) {
          (0, jsutil_1.validateStreamName)(stream2);
          (0, jsutil_1.validateDurableName)(durable);
          let timeout = this.timeout;
          if (expires > timeout) {
            timeout = expires;
          }
          expires = expires < 0 ? 0 : (0, util_1.nanos)(expires);
          const pullOpts = {
            batch: 1,
            no_wait: expires === 0,
            expires
          };
          const msg = yield this.nc.request(`${this.prefix}.CONSUMER.MSG.NEXT.${stream2}.${durable}`, this.jc.encode(pullOpts), { noMux: true, timeout });
          const err2 = (0, jsutil_1.checkJsError)(msg);
          if (err2) {
            throw err2;
          }
          return (0, jsmsg_1.toJsMsg)(msg, this.timeout);
        });
      }
      /*
       * Returns available messages upto specified batch count.
       * If expires is set the iterator will wait for the specified
       * amount of millis before closing the subscription.
       * If no_wait is specified, the iterator will return no messages.
       * @param stream
       * @param durable
       * @param opts
       */
      fetch(stream2, durable, opts = {}) {
        var _a2;
        (0, jsutil_1.validateStreamName)(stream2);
        (0, jsutil_1.validateDurableName)(durable);
        let timer = null;
        const trackBytes = ((_a2 = opts.max_bytes) !== null && _a2 !== void 0 ? _a2 : 0) > 0;
        let receivedBytes = 0;
        const max_bytes = trackBytes ? opts.max_bytes : 0;
        let monitor = null;
        const args = {};
        args.batch = opts.batch || 1;
        if (max_bytes) {
          const fv = this.nc.features.get(semver_1.Feature.JS_PULL_MAX_BYTES);
          if (!fv.ok) {
            throw new Error(`max_bytes is only supported on servers ${fv.min} or better`);
          }
          args.max_bytes = max_bytes;
        }
        args.no_wait = opts.no_wait || false;
        if (args.no_wait && args.expires) {
          args.expires = 0;
        }
        const expires = opts.expires || 0;
        if (expires) {
          args.expires = (0, util_1.nanos)(expires);
        }
        if (expires === 0 && args.no_wait === false) {
          throw new Error("expires or no_wait is required");
        }
        const hb = opts.idle_heartbeat || 0;
        if (hb) {
          args.idle_heartbeat = (0, util_1.nanos)(hb);
          if (opts.delay_heartbeat === true) {
            args.idle_heartbeat = (0, util_1.nanos)(hb * 4);
          }
        }
        const qi = new queued_iterator_1.QueuedIteratorImpl();
        const wants = args.batch;
        let received = 0;
        qi.protocolFilterFn = (jm, _ingest = false) => {
          const jsmi = jm;
          if ((0, jsutil_1.isHeartbeatMsg)(jsmi.msg)) {
            monitor === null || monitor === void 0 ? void 0 : monitor.work();
            return false;
          }
          return true;
        };
        qi.dispatchedFn = (m) => {
          if (m) {
            if (trackBytes) {
              receivedBytes += m.data.length;
            }
            received++;
            if (timer && m.info.pending === 0) {
              return;
            }
            if (qi.getPending() === 1 && m.info.pending === 0 || wants === received || max_bytes > 0 && receivedBytes >= max_bytes) {
              qi.stop();
            }
          }
        };
        const inbox = (0, core_1.createInbox)(this.nc.options.inboxPrefix);
        const sub = this.nc.subscribe(inbox, {
          max: opts.batch,
          callback: (err2, msg) => {
            if (err2 === null) {
              err2 = (0, jsutil_1.checkJsError)(msg);
            }
            if (err2 !== null) {
              if (timer) {
                timer.cancel();
                timer = null;
              }
              if ((0, core_1.isNatsError)(err2)) {
                qi.stop(hideNonTerminalJsErrors(err2) === null ? void 0 : err2);
              } else {
                qi.stop(err2);
              }
            } else {
              monitor === null || monitor === void 0 ? void 0 : monitor.work();
              qi.received++;
              qi.push((0, jsmsg_1.toJsMsg)(msg, this.timeout));
            }
          }
        });
        if (expires) {
          timer = (0, util_1.timeout)(expires);
          timer.catch(() => {
            if (!sub.isClosed()) {
              sub.drain().catch(() => {
              });
              timer = null;
            }
            if (monitor) {
              monitor.cancel();
            }
          });
        }
        (() => __awaiter(this, void 0, void 0, function* () {
          try {
            if (hb) {
              monitor = new idleheartbeat_monitor_1.IdleHeartbeatMonitor(hb, (v) => {
                qi.push(() => {
                  qi.err = new types_1.NatsError(`${jsutil_1.Js409Errors.IdleHeartbeatMissed}: ${v}`, core_1.ErrorCode.JetStreamIdleHeartBeat);
                });
                return true;
              });
            }
          } catch (_err) {
          }
          yield sub.closed;
          if (timer !== null) {
            timer.cancel();
            timer = null;
          }
          if (monitor) {
            monitor.cancel();
          }
          qi.stop();
        }))().catch();
        this.nc.publish(`${this.prefix}.CONSUMER.MSG.NEXT.${stream2}.${durable}`, this.jc.encode(args), { reply: inbox });
        return qi;
      }
      pullSubscribe(subject_1) {
        return __awaiter(this, arguments, void 0, function* (subject, opts = (0, types_2.consumerOpts)()) {
          const cso = yield this._processOptions(subject, opts);
          if (cso.ordered) {
            throw new Error("pull subscribers cannot be be ordered");
          }
          if (cso.config.deliver_subject) {
            throw new Error("consumer info specifies deliver_subject - pull consumers cannot have deliver_subject set");
          }
          const ackPolicy = cso.config.ack_policy;
          if (ackPolicy === jsapi_types_1.AckPolicy.None || ackPolicy === jsapi_types_1.AckPolicy.All) {
            throw new Error("ack policy for pull consumers must be explicit");
          }
          const so = this._buildTypedSubscriptionOpts(cso);
          const sub = new JetStreamPullSubscriptionImpl(this, cso.deliver, so);
          sub.info = cso;
          try {
            yield this._maybeCreateConsumer(cso);
          } catch (err2) {
            sub.unsubscribe();
            throw err2;
          }
          return sub;
        });
      }
      subscribe(subject_1) {
        return __awaiter(this, arguments, void 0, function* (subject, opts = (0, types_2.consumerOpts)()) {
          const cso = yield this._processOptions(subject, opts);
          if (!cso.isBind && !cso.config.deliver_subject) {
            throw new Error("push consumer requires deliver_subject");
          }
          const so = this._buildTypedSubscriptionOpts(cso);
          const sub = new JetStreamSubscriptionImpl(this, cso.deliver, so);
          sub.info = cso;
          try {
            yield this._maybeCreateConsumer(cso);
          } catch (err2) {
            sub.unsubscribe();
            throw err2;
          }
          sub._maybeSetupHbMonitoring();
          return sub;
        });
      }
      _processOptions(subject_1) {
        return __awaiter(this, arguments, void 0, function* (subject, opts = (0, types_2.consumerOpts)()) {
          var _a2, _b;
          const jsi = (0, types_2.isConsumerOptsBuilder)(opts) ? opts.getOpts() : opts;
          jsi.isBind = (0, types_2.isConsumerOptsBuilder)(opts) ? opts.isBind : false;
          jsi.flow_control = {
            heartbeat_count: 0,
            fc_count: 0,
            consumer_restarts: 0
          };
          if (jsi.ordered) {
            jsi.ordered_consumer_sequence = { stream_seq: 0, delivery_seq: 0 };
            if (jsi.config.ack_policy !== jsapi_types_1.AckPolicy.NotSet && jsi.config.ack_policy !== jsapi_types_1.AckPolicy.None) {
              throw new types_1.NatsError("ordered consumer: ack_policy can only be set to 'none'", core_1.ErrorCode.ApiError);
            }
            if (jsi.config.durable_name && jsi.config.durable_name.length > 0) {
              throw new types_1.NatsError("ordered consumer: durable_name cannot be set", core_1.ErrorCode.ApiError);
            }
            if (jsi.config.deliver_subject && jsi.config.deliver_subject.length > 0) {
              throw new types_1.NatsError("ordered consumer: deliver_subject cannot be set", core_1.ErrorCode.ApiError);
            }
            if (jsi.config.max_deliver !== void 0 && jsi.config.max_deliver > 1) {
              throw new types_1.NatsError("ordered consumer: max_deliver cannot be set", core_1.ErrorCode.ApiError);
            }
            if (jsi.config.deliver_group && jsi.config.deliver_group.length > 0) {
              throw new types_1.NatsError("ordered consumer: deliver_group cannot be set", core_1.ErrorCode.ApiError);
            }
            jsi.config.deliver_subject = (0, core_1.createInbox)(this.nc.options.inboxPrefix);
            jsi.config.ack_policy = jsapi_types_1.AckPolicy.None;
            jsi.config.max_deliver = 1;
            jsi.config.flow_control = true;
            jsi.config.idle_heartbeat = jsi.config.idle_heartbeat || (0, util_1.nanos)(5e3);
            jsi.config.ack_wait = (0, util_1.nanos)(22 * 60 * 60 * 1e3);
            jsi.config.mem_storage = true;
            jsi.config.num_replicas = 1;
          }
          if (jsi.config.ack_policy === jsapi_types_1.AckPolicy.NotSet) {
            jsi.config.ack_policy = jsapi_types_1.AckPolicy.All;
          }
          jsi.api = this;
          jsi.config = jsi.config || {};
          jsi.stream = jsi.stream ? jsi.stream : yield this.findStream(subject);
          jsi.attached = false;
          if (jsi.config.durable_name) {
            try {
              const info = yield this.consumerAPI.info(jsi.stream, jsi.config.durable_name);
              if (info) {
                if (info.config.filter_subject && info.config.filter_subject !== subject) {
                  throw new Error("subject does not match consumer");
                }
                const qn = (_a2 = jsi.config.deliver_group) !== null && _a2 !== void 0 ? _a2 : "";
                if (qn === "" && info.push_bound === true) {
                  throw new Error(`duplicate subscription`);
                }
                const rqn = (_b = info.config.deliver_group) !== null && _b !== void 0 ? _b : "";
                if (qn !== rqn) {
                  if (rqn === "") {
                    throw new Error(`durable requires no queue group`);
                  } else {
                    throw new Error(`durable requires queue group '${rqn}'`);
                  }
                }
                jsi.last = info;
                jsi.config = info.config;
                jsi.attached = true;
                if (!jsi.config.durable_name) {
                  jsi.name = info.name;
                }
              }
            } catch (err2) {
              if (err2.code !== "404") {
                throw err2;
              }
            }
          }
          if (!jsi.attached && jsi.config.filter_subject === void 0 && jsi.config.filter_subjects === void 0) {
            jsi.config.filter_subject = subject;
          }
          jsi.deliver = jsi.config.deliver_subject || (0, core_1.createInbox)(this.nc.options.inboxPrefix);
          return jsi;
        });
      }
      _buildTypedSubscriptionOpts(jsi) {
        const so = {};
        so.adapter = msgAdapter(jsi.callbackFn === void 0, this.timeout);
        so.ingestionFilterFn = _JetStreamClientImpl.ingestionFn(jsi.ordered);
        so.protocolFilterFn = (jm, ingest = false) => {
          const jsmi = jm;
          if ((0, jsutil_1.isFlowControlMsg)(jsmi.msg)) {
            if (!ingest) {
              jsmi.msg.respond();
            }
            return false;
          }
          return true;
        };
        if (!jsi.mack && jsi.config.ack_policy !== jsapi_types_1.AckPolicy.None) {
          so.dispatchedFn = autoAckJsMsg;
        }
        if (jsi.callbackFn) {
          so.callback = jsi.callbackFn;
        }
        so.max = jsi.max || 0;
        so.queue = jsi.queue;
        return so;
      }
      _maybeCreateConsumer(jsi) {
        return __awaiter(this, void 0, void 0, function* () {
          if (jsi.attached) {
            return;
          }
          if (jsi.isBind) {
            throw new Error(`unable to bind - durable consumer ${jsi.config.durable_name} doesn't exist in ${jsi.stream}`);
          }
          jsi.config = Object.assign({
            deliver_policy: jsapi_types_1.DeliverPolicy.All,
            ack_policy: jsapi_types_1.AckPolicy.Explicit,
            ack_wait: (0, util_1.nanos)(30 * 1e3),
            replay_policy: jsapi_types_1.ReplayPolicy.Instant
          }, jsi.config);
          const ci = yield this.consumerAPI.add(jsi.stream, jsi.config);
          if (Array.isArray(jsi.config.filter_subjects && !Array.isArray(ci.config.filter_subjects))) {
            throw new Error(`jetstream server doesn't support consumers with multiple filter subjects`);
          }
          jsi.name = ci.name;
          jsi.config = ci.config;
          jsi.last = ci;
        });
      }
      static ingestionFn(ordered) {
        return (jm, ctx) => {
          var _a2;
          const jsub = ctx;
          if (!jm)
            return { ingest: false, protocol: false };
          const jmi = jm;
          if (!(0, jsutil_1.checkJsError)(jmi.msg)) {
            (_a2 = jsub.monitor) === null || _a2 === void 0 ? void 0 : _a2.work();
          }
          if ((0, jsutil_1.isHeartbeatMsg)(jmi.msg)) {
            const ingest2 = ordered ? jsub._checkHbOrderConsumer(jmi.msg) : true;
            if (!ordered) {
              jsub.info.flow_control.heartbeat_count++;
            }
            return { ingest: ingest2, protocol: true };
          } else if ((0, jsutil_1.isFlowControlMsg)(jmi.msg)) {
            jsub.info.flow_control.fc_count++;
            return { ingest: true, protocol: true };
          }
          const ingest = ordered ? jsub._checkOrderedConsumer(jm) : true;
          return { ingest, protocol: false };
        };
      }
    };
    exports2.JetStreamClientImpl = JetStreamClientImpl;
    var JetStreamSubscriptionImpl = class extends typedsub_1.TypedSubscription {
      constructor(js, subject, opts) {
        super(js.nc, subject, opts);
        this.js = js;
        this.monitor = null;
        this.sub.closed.then(() => {
          if (this.monitor) {
            this.monitor.cancel();
          }
        });
      }
      set info(info) {
        this.sub.info = info;
      }
      get info() {
        return this.sub.info;
      }
      _resetOrderedConsumer(sseq) {
        if (this.info === null || this.sub.isClosed()) {
          return;
        }
        const newDeliver = (0, core_1.createInbox)(this.js.nc.options.inboxPrefix);
        const nci = this.js.nc;
        nci._resub(this.sub, newDeliver);
        const info = this.info;
        info.config.name = nuid_1.nuid.next();
        info.ordered_consumer_sequence.delivery_seq = 0;
        info.flow_control.heartbeat_count = 0;
        info.flow_control.fc_count = 0;
        info.flow_control.consumer_restarts++;
        info.deliver = newDeliver;
        info.config.deliver_subject = newDeliver;
        info.config.deliver_policy = jsapi_types_1.DeliverPolicy.StartSequence;
        info.config.opt_start_seq = sseq;
        const req = {};
        req.stream_name = this.info.stream;
        req.config = info.config;
        const subj = `${info.api.prefix}.CONSUMER.CREATE.${info.stream}`;
        this.js._request(subj, req, { retries: -1 }).then((v) => {
          const ci = v;
          const jinfo = this.sub.info;
          jinfo.last = ci;
          this.info.config = ci.config;
          this.info.name = ci.name;
        }).catch((err2) => {
          const nerr = new types_1.NatsError(`unable to recreate ordered consumer ${info.stream} at seq ${sseq}`, core_1.ErrorCode.RequestError, err2);
          this.sub.callback(nerr, {});
        });
      }
      // this is called by push subscriptions, to initialize the monitoring
      // if configured on the consumer
      _maybeSetupHbMonitoring() {
        var _a2, _b;
        const ns = ((_b = (_a2 = this.info) === null || _a2 === void 0 ? void 0 : _a2.config) === null || _b === void 0 ? void 0 : _b.idle_heartbeat) || 0;
        if (ns) {
          this._setupHbMonitoring((0, util_1.millis)(ns));
        }
      }
      _setupHbMonitoring(millis, cancelAfter = 0) {
        const opts = { cancelAfter: 0, maxOut: 2 };
        if (cancelAfter) {
          opts.cancelAfter = cancelAfter;
        }
        const sub = this.sub;
        const handler = (v) => {
          var _a2, _b, _c, _d2;
          const msg = (0, jsutil_1.newJsErrorMsg)(409, `${jsutil_1.Js409Errors.IdleHeartbeatMissed}: ${v}`, this.sub.subject);
          const ordered = (_a2 = this.info) === null || _a2 === void 0 ? void 0 : _a2.ordered;
          if (!ordered) {
            this.sub.callback(null, msg);
          } else {
            if (!this.js.nc.protocol.connected) {
              return false;
            }
            const seq = ((_c = (_b = this.info) === null || _b === void 0 ? void 0 : _b.ordered_consumer_sequence) === null || _c === void 0 ? void 0 : _c.stream_seq) || 0;
            this._resetOrderedConsumer(seq + 1);
            (_d2 = this.monitor) === null || _d2 === void 0 ? void 0 : _d2.restart();
            return false;
          }
          return !sub.noIterator;
        };
        this.monitor = new idleheartbeat_monitor_1.IdleHeartbeatMonitor(millis, handler, opts);
      }
      _checkHbOrderConsumer(msg) {
        const rm = msg.headers.get(types_2.JsHeaders.ConsumerStalledHdr);
        if (rm !== "") {
          const nci = this.js.nc;
          nci.publish(rm);
        }
        const lastDelivered = parseInt(msg.headers.get(types_2.JsHeaders.LastConsumerSeqHdr), 10);
        const ordered = this.info.ordered_consumer_sequence;
        this.info.flow_control.heartbeat_count++;
        if (lastDelivered !== ordered.delivery_seq) {
          this._resetOrderedConsumer(ordered.stream_seq + 1);
        }
        return false;
      }
      _checkOrderedConsumer(jm) {
        const ordered = this.info.ordered_consumer_sequence;
        const sseq = jm.info.streamSequence;
        const dseq = jm.info.deliverySequence;
        if (dseq != ordered.delivery_seq + 1) {
          this._resetOrderedConsumer(ordered.stream_seq + 1);
          return false;
        }
        ordered.delivery_seq = dseq;
        ordered.stream_seq = sseq;
        return true;
      }
      destroy() {
        return __awaiter(this, void 0, void 0, function* () {
          if (!this.isClosed()) {
            yield this.drain();
          }
          const jinfo = this.sub.info;
          const name = jinfo.config.durable_name || jinfo.name;
          const subj = `${jinfo.api.prefix}.CONSUMER.DELETE.${jinfo.stream}.${name}`;
          yield jinfo.api._request(subj);
        });
      }
      consumerInfo() {
        return __awaiter(this, void 0, void 0, function* () {
          const jinfo = this.sub.info;
          const name = jinfo.config.durable_name || jinfo.name;
          const subj = `${jinfo.api.prefix}.CONSUMER.INFO.${jinfo.stream}.${name}`;
          const ci = yield jinfo.api._request(subj);
          jinfo.last = ci;
          return ci;
        });
      }
    };
    exports2.JetStreamSubscriptionImpl = JetStreamSubscriptionImpl;
    var JetStreamPullSubscriptionImpl = class extends JetStreamSubscriptionImpl {
      constructor(js, subject, opts) {
        super(js, subject, opts);
      }
      pull(opts = { batch: 1 }) {
        var _a2, _b;
        const { stream: stream2, config: config2, name } = this.sub.info;
        const consumer = (_a2 = config2.durable_name) !== null && _a2 !== void 0 ? _a2 : name;
        const args = {};
        args.batch = opts.batch || 1;
        args.no_wait = opts.no_wait || false;
        if (((_b = opts.max_bytes) !== null && _b !== void 0 ? _b : 0) > 0) {
          const fv = this.js.nc.features.get(semver_1.Feature.JS_PULL_MAX_BYTES);
          if (!fv.ok) {
            throw new Error(`max_bytes is only supported on servers ${fv.min} or better`);
          }
          args.max_bytes = opts.max_bytes;
        }
        let expires = 0;
        if (opts.expires && opts.expires > 0) {
          expires = opts.expires;
          args.expires = (0, util_1.nanos)(expires);
        }
        let hb = 0;
        if (opts.idle_heartbeat && opts.idle_heartbeat > 0) {
          hb = opts.idle_heartbeat;
          args.idle_heartbeat = (0, util_1.nanos)(hb);
        }
        if (hb && expires === 0) {
          throw new Error("idle_heartbeat requires expires");
        }
        if (hb > expires) {
          throw new Error("expires must be greater than idle_heartbeat");
        }
        if (this.info) {
          if (this.monitor) {
            this.monitor.cancel();
          }
          if (expires && hb) {
            if (!this.monitor) {
              this._setupHbMonitoring(hb, expires);
            } else {
              this.monitor._change(hb, expires);
            }
          }
          const api = this.info.api;
          const subj = `${api.prefix}.CONSUMER.MSG.NEXT.${stream2}.${consumer}`;
          const reply = this.sub.subject;
          api.nc.publish(subj, api.jc.encode(args), { reply });
        }
      }
    };
    function msgAdapter(iterator, ackTimeout) {
      if (iterator) {
        return iterMsgAdapter(ackTimeout);
      } else {
        return cbMsgAdapter(ackTimeout);
      }
    }
    function cbMsgAdapter(ackTimeout) {
      return (err2, msg) => {
        if (err2) {
          return [err2, null];
        }
        err2 = (0, jsutil_1.checkJsError)(msg);
        if (err2) {
          return [err2, null];
        }
        return [null, (0, jsmsg_1.toJsMsg)(msg, ackTimeout)];
      };
    }
    function iterMsgAdapter(ackTimeout) {
      return (err2, msg) => {
        if (err2) {
          return [err2, null];
        }
        const ne = (0, jsutil_1.checkJsError)(msg);
        if (ne !== null) {
          return [hideNonTerminalJsErrors(ne), null];
        }
        return [null, (0, jsmsg_1.toJsMsg)(msg, ackTimeout)];
      };
    }
    function hideNonTerminalJsErrors(ne) {
      if (ne !== null) {
        switch (ne.code) {
          case core_1.ErrorCode.JetStream404NoMessages:
          case core_1.ErrorCode.JetStream408RequestTimeout:
            return null;
          case core_1.ErrorCode.JetStream409:
            if ((0, jsutil_1.isTerminal409)(ne)) {
              return ne;
            }
            return null;
          default:
            return ne;
        }
      }
      return null;
    }
    function autoAckJsMsg(data) {
      if (data) {
        data.ack();
      }
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/kv.js
var require_kv = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/kv.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.KvStatusImpl = exports2.Bucket = exports2.kvOperationHdr = void 0;
    exports2.Base64KeyCodec = Base64KeyCodec;
    exports2.NoopKvCodecs = NoopKvCodecs;
    exports2.defaultBucketOpts = defaultBucketOpts;
    exports2.validateKey = validateKey;
    exports2.validateSearchKey = validateSearchKey;
    exports2.hasWildcards = hasWildcards;
    exports2.validateBucket = validateBucket;
    var core_1 = require_core();
    var queued_iterator_1 = require_queued_iterator();
    var headers_1 = require_headers();
    var types_1 = require_types2();
    var semver_1 = require_semver();
    var util_1 = require_util();
    var encoders_1 = require_encoders();
    var jsapi_types_1 = require_jsapi_types();
    var jsclient_1 = require_jsclient();
    var nuid_1 = require_nuid();
    function Base64KeyCodec() {
      return {
        encode(key) {
          return btoa(key);
        },
        decode(bkey) {
          return atob(bkey);
        }
      };
    }
    function NoopKvCodecs() {
      return {
        key: {
          encode(k) {
            return k;
          },
          decode(k) {
            return k;
          }
        },
        value: {
          encode(v) {
            return v;
          },
          decode(v) {
            return v;
          }
        }
      };
    }
    function defaultBucketOpts() {
      return {
        replicas: 1,
        history: 1,
        timeout: 2e3,
        max_bytes: -1,
        maxValueSize: -1,
        codec: NoopKvCodecs(),
        storage: jsapi_types_1.StorageType.File
      };
    }
    exports2.kvOperationHdr = "KV-Operation";
    var kvSubjectPrefix = "$KV";
    var validKeyRe = /^[-/=.\w]+$/;
    var validSearchKey = /^[-/=.>*\w]+$/;
    var validBucketRe = /^[-\w]+$/;
    function validateKey(k) {
      if (k.startsWith(".") || k.endsWith(".") || !validKeyRe.test(k)) {
        throw new Error(`invalid key: ${k}`);
      }
    }
    function validateSearchKey(k) {
      if (k.startsWith(".") || k.endsWith(".") || !validSearchKey.test(k)) {
        throw new Error(`invalid key: ${k}`);
      }
    }
    function hasWildcards(k) {
      if (k.startsWith(".") || k.endsWith(".")) {
        throw new Error(`invalid key: ${k}`);
      }
      const chunks = k.split(".");
      let hasWildcards2 = false;
      for (let i = 0; i < chunks.length; i++) {
        switch (chunks[i]) {
          case "*":
            hasWildcards2 = true;
            break;
          case ">":
            if (i !== chunks.length - 1) {
              throw new Error(`invalid key: ${k}`);
            }
            hasWildcards2 = true;
            break;
          default:
        }
      }
      return hasWildcards2;
    }
    function validateBucket(name) {
      if (!validBucketRe.test(name)) {
        throw new Error(`invalid bucket name: ${name}`);
      }
    }
    var Bucket = class _Bucket {
      constructor(bucket, js, jsm) {
        this.validateKey = validateKey;
        this.validateSearchKey = validateSearchKey;
        this.hasWildcards = hasWildcards;
        validateBucket(bucket);
        this.js = js;
        this.jsm = jsm;
        this.bucket = bucket;
        this.prefix = kvSubjectPrefix;
        this.editPrefix = "";
        this.useJsPrefix = false;
        this._prefixLen = 0;
      }
      static create(js_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (js, name, opts = {}) {
          validateBucket(name);
          const jsm = yield js.jetstreamManager();
          const bucket = new _Bucket(name, js, jsm);
          yield bucket.init(opts);
          return bucket;
        });
      }
      static bind(js_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (js, name, opts = {}) {
          var _a2, _b;
          const jsm = yield js.jetstreamManager();
          const info = {
            config: {
              allow_direct: opts.allow_direct
            }
          };
          validateBucket(name);
          const bucket = new _Bucket(name, js, jsm);
          info.config.name = (_a2 = opts.streamName) !== null && _a2 !== void 0 ? _a2 : bucket.bucketName();
          Object.assign(bucket, info);
          bucket.stream = info.config.name;
          bucket.codec = opts.codec || NoopKvCodecs();
          bucket.direct = (_b = info.config.allow_direct) !== null && _b !== void 0 ? _b : false;
          bucket.initializePrefixes(info);
          return bucket;
        });
      }
      init() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
          var _a2, _b;
          const bo = Object.assign(defaultBucketOpts(), opts);
          this.codec = bo.codec;
          const sc = {};
          this.stream = sc.name = (_a2 = opts.streamName) !== null && _a2 !== void 0 ? _a2 : this.bucketName();
          sc.retention = jsapi_types_1.RetentionPolicy.Limits;
          sc.max_msgs_per_subject = bo.history;
          if (bo.maxBucketSize) {
            bo.max_bytes = bo.maxBucketSize;
          }
          if (bo.max_bytes) {
            sc.max_bytes = bo.max_bytes;
          }
          sc.max_msg_size = bo.maxValueSize;
          sc.storage = bo.storage;
          const location = (_b = opts.placementCluster) !== null && _b !== void 0 ? _b : "";
          if (location) {
            opts.placement = {};
            opts.placement.cluster = location;
            opts.placement.tags = [];
          }
          if (opts.placement) {
            sc.placement = opts.placement;
          }
          if (opts.republish) {
            sc.republish = opts.republish;
          }
          if (opts.description) {
            sc.description = opts.description;
          }
          if (opts.mirror) {
            const mirror = Object.assign({}, opts.mirror);
            if (!mirror.name.startsWith(types_1.kvPrefix)) {
              mirror.name = `${types_1.kvPrefix}${mirror.name}`;
            }
            sc.mirror = mirror;
            sc.mirror_direct = true;
          } else if (opts.sources) {
            const sources = opts.sources.map((s) => {
              const c = Object.assign({}, s);
              const srcBucketName = c.name.startsWith(types_1.kvPrefix) ? c.name.substring(types_1.kvPrefix.length) : c.name;
              if (!c.name.startsWith(types_1.kvPrefix)) {
                c.name = `${types_1.kvPrefix}${c.name}`;
              }
              if (!s.external && srcBucketName !== this.bucket) {
                c.subject_transforms = [
                  { src: `$KV.${srcBucketName}.>`, dest: `$KV.${this.bucket}.>` }
                ];
              }
              return c;
            });
            sc.sources = sources;
            sc.subjects = [this.subjectForBucket()];
          } else {
            sc.subjects = [this.subjectForBucket()];
          }
          if (opts.metadata) {
            sc.metadata = opts.metadata;
          }
          if (typeof opts.compression === "boolean") {
            sc.compression = opts.compression ? jsapi_types_1.StoreCompression.S2 : jsapi_types_1.StoreCompression.None;
          }
          const nci = this.js.nc;
          const have = nci.getServerVersion();
          const discardNew = have ? (0, semver_1.compare)(have, (0, semver_1.parseSemVer)("2.7.2")) >= 0 : false;
          sc.discard = discardNew ? jsapi_types_1.DiscardPolicy.New : jsapi_types_1.DiscardPolicy.Old;
          const { ok: direct, min } = nci.features.get(semver_1.Feature.JS_ALLOW_DIRECT);
          if (!direct && opts.allow_direct === true) {
            const v = have ? `${have.major}.${have.minor}.${have.micro}` : "unknown";
            return Promise.reject(new Error(`allow_direct is not available on server version ${v} - requires ${min}`));
          }
          opts.allow_direct = typeof opts.allow_direct === "boolean" ? opts.allow_direct : direct;
          sc.allow_direct = opts.allow_direct;
          this.direct = sc.allow_direct;
          sc.num_replicas = bo.replicas;
          if (bo.ttl) {
            sc.max_age = (0, util_1.nanos)(bo.ttl);
          }
          sc.allow_rollup_hdrs = true;
          let info;
          try {
            info = yield this.jsm.streams.info(sc.name);
            if (!info.config.allow_direct && this.direct === true) {
              this.direct = false;
            }
          } catch (err2) {
            if (err2.message === "stream not found") {
              info = yield this.jsm.streams.add(sc);
            } else {
              throw err2;
            }
          }
          this.initializePrefixes(info);
        });
      }
      initializePrefixes(info) {
        this._prefixLen = 0;
        this.prefix = `$KV.${this.bucket}`;
        this.useJsPrefix = this.js.apiPrefix !== "$JS.API";
        const { mirror } = info.config;
        if (mirror) {
          let n = mirror.name;
          if (n.startsWith(types_1.kvPrefix)) {
            n = n.substring(types_1.kvPrefix.length);
          }
          if (mirror.external && mirror.external.api !== "") {
            const mb = mirror.name.substring(types_1.kvPrefix.length);
            this.useJsPrefix = false;
            this.prefix = `$KV.${mb}`;
            this.editPrefix = `${mirror.external.api}.$KV.${n}`;
          } else {
            this.editPrefix = this.prefix;
          }
        }
      }
      bucketName() {
        var _a2;
        return (_a2 = this.stream) !== null && _a2 !== void 0 ? _a2 : `${types_1.kvPrefix}${this.bucket}`;
      }
      subjectForBucket() {
        return `${this.prefix}.${this.bucket}.>`;
      }
      subjectForKey(k, edit = false) {
        const builder = [];
        if (edit) {
          if (this.useJsPrefix) {
            builder.push(this.js.apiPrefix);
          }
          if (this.editPrefix !== "") {
            builder.push(this.editPrefix);
          } else {
            builder.push(this.prefix);
          }
        } else {
          if (this.prefix) {
            builder.push(this.prefix);
          }
        }
        builder.push(k);
        return builder.join(".");
      }
      fullKeyName(k) {
        if (this.prefix !== "") {
          return `${this.prefix}.${k}`;
        }
        return `${kvSubjectPrefix}.${this.bucket}.${k}`;
      }
      get prefixLen() {
        if (this._prefixLen === 0) {
          this._prefixLen = this.prefix.length + 1;
        }
        return this._prefixLen;
      }
      encodeKey(key) {
        const chunks = [];
        for (const t of key.split(".")) {
          switch (t) {
            case ">":
            case "*":
              chunks.push(t);
              break;
            default:
              chunks.push(this.codec.key.encode(t));
              break;
          }
        }
        return chunks.join(".");
      }
      decodeKey(ekey) {
        const chunks = [];
        for (const t of ekey.split(".")) {
          switch (t) {
            case ">":
            case "*":
              chunks.push(t);
              break;
            default:
              chunks.push(this.codec.key.decode(t));
              break;
          }
        }
        return chunks.join(".");
      }
      close() {
        return Promise.resolve();
      }
      dataLen(data, h2) {
        const slen = h2 ? h2.get(types_1.JsHeaders.MessageSizeHdr) || "" : "";
        if (slen !== "") {
          return parseInt(slen, 10);
        }
        return data.length;
      }
      smToEntry(sm) {
        return new KvStoredEntryImpl(this.bucket, this.prefixLen, sm);
      }
      jmToEntry(jm) {
        const key = this.decodeKey(jm.subject.substring(this.prefixLen));
        return new KvJsMsgEntryImpl(this.bucket, key, jm);
      }
      create(k, data) {
        return __awaiter(this, void 0, void 0, function* () {
          var _a2;
          let firstErr;
          try {
            const n = yield this.put(k, data, { previousSeq: 0 });
            return Promise.resolve(n);
          } catch (err2) {
            firstErr = err2;
            if (((_a2 = err2 === null || err2 === void 0 ? void 0 : err2.api_error) === null || _a2 === void 0 ? void 0 : _a2.err_code) !== 10071) {
              return Promise.reject(err2);
            }
          }
          let rev = 0;
          try {
            const e = yield this.get(k);
            if ((e === null || e === void 0 ? void 0 : e.operation) === "DEL" || (e === null || e === void 0 ? void 0 : e.operation) === "PURGE") {
              rev = e !== null ? e.revision : 0;
              return this.update(k, data, rev);
            } else {
              return Promise.reject(firstErr);
            }
          } catch (err2) {
            return Promise.reject(err2);
          }
        });
      }
      update(k, data, version) {
        if (version <= 0) {
          throw new Error("version must be greater than 0");
        }
        return this.put(k, data, { previousSeq: version });
      }
      put(k_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (k, data, opts = {}) {
          var _a2, _b;
          const ek = this.encodeKey(k);
          this.validateKey(ek);
          const o = {};
          if (opts.previousSeq !== void 0) {
            const h2 = (0, headers_1.headers)();
            o.headers = h2;
            h2.set(jsclient_1.PubHeaders.ExpectedLastSubjectSequenceHdr, `${opts.previousSeq}`);
          }
          try {
            const pa = yield this.js.publish(this.subjectForKey(ek, true), data, o);
            return pa.seq;
          } catch (err2) {
            const ne = err2;
            if (ne.isJetStreamError()) {
              ne.message = (_a2 = ne.api_error) === null || _a2 === void 0 ? void 0 : _a2.description;
              ne.code = `${(_b = ne.api_error) === null || _b === void 0 ? void 0 : _b.code}`;
              return Promise.reject(ne);
            }
            return Promise.reject(err2);
          }
        });
      }
      get(k, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          const ek = this.encodeKey(k);
          this.validateKey(ek);
          let arg = { last_by_subj: this.subjectForKey(ek) };
          if (opts && opts.revision > 0) {
            arg = { seq: opts.revision };
          }
          let sm;
          try {
            if (this.direct) {
              const direct = this.jsm.direct;
              sm = yield direct.getMessage(this.bucketName(), arg);
            } else {
              sm = yield this.jsm.streams.getMessage(this.bucketName(), arg);
            }
            const ke = this.smToEntry(sm);
            if (ke.key !== ek) {
              return null;
            }
            return ke;
          } catch (err2) {
            if (err2.code === core_1.ErrorCode.JetStream404NoMessages) {
              return null;
            }
            throw err2;
          }
        });
      }
      purge(k, opts) {
        return this._deleteOrPurge(k, "PURGE", opts);
      }
      delete(k, opts) {
        return this._deleteOrPurge(k, "DEL", opts);
      }
      purgeDeletes() {
        return __awaiter(this, arguments, void 0, function* (olderMillis = 30 * 60 * 1e3) {
          const done = (0, util_1.deferred)();
          const buf = [];
          const i = yield this.watch({
            key: ">",
            initializedFn: () => {
              done.resolve();
            }
          });
          (() => __awaiter(this, void 0, void 0, function* () {
            var _a2, e_1, _b, _c;
            try {
              for (var _d2 = true, i_1 = __asyncValues(i), i_1_1; i_1_1 = yield i_1.next(), _a2 = i_1_1.done, !_a2; _d2 = true) {
                _c = i_1_1.value;
                _d2 = false;
                const e = _c;
                if (e.operation === "DEL" || e.operation === "PURGE") {
                  buf.push(e);
                }
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (!_d2 && !_a2 && (_b = i_1.return)) yield _b.call(i_1);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
          }))().then();
          yield done;
          i.stop();
          const min = Date.now() - olderMillis;
          const proms = buf.map((e) => {
            const subj = this.subjectForKey(e.key);
            if (e.created.getTime() >= min) {
              return this.jsm.streams.purge(this.stream, { filter: subj, keep: 1 });
            } else {
              return this.jsm.streams.purge(this.stream, { filter: subj, keep: 0 });
            }
          });
          const purged = yield Promise.all(proms);
          purged.unshift({ success: true, purged: 0 });
          return purged.reduce((pv, cv) => {
            pv.purged += cv.purged;
            return pv;
          });
        });
      }
      _deleteOrPurge(k, op, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          var _a2, e_2, _b, _c;
          if (!this.hasWildcards(k)) {
            return this._doDeleteOrPurge(k, op, opts);
          }
          const iter = yield this.keys(k);
          const buf = [];
          try {
            for (var _d2 = true, iter_1 = __asyncValues(iter), iter_1_1; iter_1_1 = yield iter_1.next(), _a2 = iter_1_1.done, !_a2; _d2 = true) {
              _c = iter_1_1.value;
              _d2 = false;
              const k2 = _c;
              buf.push(this._doDeleteOrPurge(k2, op));
              if (buf.length === 100) {
                yield Promise.all(buf);
                buf.length = 0;
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (!_d2 && !_a2 && (_b = iter_1.return)) yield _b.call(iter_1);
            } finally {
              if (e_2) throw e_2.error;
            }
          }
          if (buf.length > 0) {
            yield Promise.all(buf);
          }
        });
      }
      _doDeleteOrPurge(k, op, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          const ek = this.encodeKey(k);
          this.validateKey(ek);
          const h2 = (0, headers_1.headers)();
          h2.set(exports2.kvOperationHdr, op);
          if (op === "PURGE") {
            h2.set(types_1.JsHeaders.RollupHdr, types_1.JsHeaders.RollupValueSubject);
          }
          if (opts === null || opts === void 0 ? void 0 : opts.previousSeq) {
            h2.set(jsclient_1.PubHeaders.ExpectedLastSubjectSequenceHdr, `${opts.previousSeq}`);
          }
          yield this.js.publish(this.subjectForKey(ek, true), encoders_1.Empty, { headers: h2 });
        });
      }
      _buildCC(k, content, opts = {}) {
        const a = !Array.isArray(k) ? [k] : k;
        let filter_subjects = a.map((k2) => {
          const ek = this.encodeKey(k2);
          this.validateSearchKey(k2);
          return this.fullKeyName(ek);
        });
        let deliver_policy = jsapi_types_1.DeliverPolicy.LastPerSubject;
        if (content === types_1.KvWatchInclude.AllHistory) {
          deliver_policy = jsapi_types_1.DeliverPolicy.All;
        }
        if (content === types_1.KvWatchInclude.UpdatesOnly) {
          deliver_policy = jsapi_types_1.DeliverPolicy.New;
        }
        let filter_subject = void 0;
        if (filter_subjects.length === 1) {
          filter_subject = filter_subjects[0];
          filter_subjects = void 0;
        }
        return Object.assign({
          deliver_policy,
          "ack_policy": jsapi_types_1.AckPolicy.None,
          filter_subjects,
          filter_subject,
          "flow_control": true,
          "idle_heartbeat": (0, util_1.nanos)(5 * 1e3)
        }, opts);
      }
      remove(k) {
        return this.purge(k);
      }
      history() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
          var _a2;
          const k = (_a2 = opts.key) !== null && _a2 !== void 0 ? _a2 : ">";
          const qi = new queued_iterator_1.QueuedIteratorImpl();
          const co = {};
          co.headers_only = opts.headers_only || false;
          let fn;
          fn = () => {
            qi.stop();
          };
          let count = 0;
          const cc = this._buildCC(k, types_1.KvWatchInclude.AllHistory, co);
          const subj = cc.filter_subject;
          const copts = (0, types_1.consumerOpts)(cc);
          copts.bindStream(this.stream);
          copts.orderedConsumer();
          copts.callback((err2, jm) => {
            if (err2) {
              qi.stop(err2);
              return;
            }
            if (jm) {
              const e = this.jmToEntry(jm);
              qi.push(e);
              qi.received++;
              if (fn && count > 0 && qi.received >= count || jm.info.pending === 0) {
                qi.push(fn);
                fn = void 0;
              }
            }
          });
          const sub = yield this.js.subscribe(subj, copts);
          if (fn) {
            const { info: { last } } = sub;
            const expect = last.num_pending + last.delivered.consumer_seq;
            if (expect === 0 || qi.received >= expect) {
              try {
                fn();
              } catch (err2) {
                qi.stop(err2);
              } finally {
                fn = void 0;
              }
            } else {
              count = expect;
            }
          }
          qi._data = sub;
          qi.iterClosed.then(() => {
            sub.unsubscribe();
          });
          sub.closed.then(() => {
            qi.stop();
          }).catch((err2) => {
            qi.stop(err2);
          });
          return qi;
        });
      }
      canSetWatcherName() {
        const jsi = this.js;
        const nci = jsi.nc;
        const { ok } = nci.features.get(semver_1.Feature.JS_NEW_CONSUMER_CREATE_API);
        return ok;
      }
      watch() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
          var _a2;
          const k = (_a2 = opts.key) !== null && _a2 !== void 0 ? _a2 : ">";
          const qi = new queued_iterator_1.QueuedIteratorImpl();
          const co = {};
          co.headers_only = opts.headers_only || false;
          let content = types_1.KvWatchInclude.LastValue;
          if (opts.include === types_1.KvWatchInclude.AllHistory) {
            content = types_1.KvWatchInclude.AllHistory;
          } else if (opts.include === types_1.KvWatchInclude.UpdatesOnly) {
            content = types_1.KvWatchInclude.UpdatesOnly;
          }
          const ignoreDeletes = opts.ignoreDeletes === true;
          let fn = opts.initializedFn;
          let count = 0;
          const cc = this._buildCC(k, content, co);
          const subj = cc.filter_subject;
          const copts = (0, types_1.consumerOpts)(cc);
          if (this.canSetWatcherName()) {
            copts.consumerName(nuid_1.nuid.next());
          }
          copts.bindStream(this.stream);
          if (opts.resumeFromRevision && opts.resumeFromRevision > 0) {
            copts.startSequence(opts.resumeFromRevision);
          }
          copts.orderedConsumer();
          copts.callback((err2, jm) => {
            if (err2) {
              qi.stop(err2);
              return;
            }
            if (jm) {
              const e = this.jmToEntry(jm);
              if (ignoreDeletes && e.operation === "DEL") {
                return;
              }
              qi.push(e);
              qi.received++;
              if (fn && (count > 0 && qi.received >= count || jm.info.pending === 0)) {
                qi.push(fn);
                fn = void 0;
              }
            }
          });
          const sub = yield this.js.subscribe(subj, copts);
          if (fn) {
            const { info: { last } } = sub;
            const expect = last.num_pending + last.delivered.consumer_seq;
            if (expect === 0 || qi.received >= expect) {
              try {
                fn();
              } catch (err2) {
                qi.stop(err2);
              } finally {
                fn = void 0;
              }
            } else {
              count = expect;
            }
          }
          qi._data = sub;
          qi.iterClosed.then(() => {
            sub.unsubscribe();
          });
          sub.closed.then(() => {
            qi.stop();
          }).catch((err2) => {
            qi.stop(err2);
          });
          return qi;
        });
      }
      keys() {
        return __awaiter(this, arguments, void 0, function* (k = ">") {
          const keys = new queued_iterator_1.QueuedIteratorImpl();
          const cc = this._buildCC(k, types_1.KvWatchInclude.LastValue, {
            headers_only: true
          });
          const subj = Array.isArray(k) ? ">" : cc.filter_subject;
          const copts = (0, types_1.consumerOpts)(cc);
          copts.bindStream(this.stream);
          copts.orderedConsumer();
          const sub = yield this.js.subscribe(subj, copts);
          (() => __awaiter(this, void 0, void 0, function* () {
            var _a2, e_3, _b, _c;
            var _d2;
            try {
              for (var _e = true, sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = yield sub_1.next(), _a2 = sub_1_1.done, !_a2; _e = true) {
                _c = sub_1_1.value;
                _e = false;
                const jm = _c;
                const op = (_d2 = jm.headers) === null || _d2 === void 0 ? void 0 : _d2.get(exports2.kvOperationHdr);
                if (op !== "DEL" && op !== "PURGE") {
                  const key = this.decodeKey(jm.subject.substring(this.prefixLen));
                  keys.push(key);
                }
                if (jm.info.pending === 0) {
                  sub.unsubscribe();
                }
              }
            } catch (e_3_1) {
              e_3 = { error: e_3_1 };
            } finally {
              try {
                if (!_e && !_a2 && (_b = sub_1.return)) yield _b.call(sub_1);
              } finally {
                if (e_3) throw e_3.error;
              }
            }
          }))().then(() => {
            keys.stop();
          }).catch((err2) => {
            keys.stop(err2);
          });
          const si = sub;
          if (si.info.last.num_pending === 0) {
            sub.unsubscribe();
          }
          return keys;
        });
      }
      purgeBucket(opts) {
        return this.jsm.streams.purge(this.bucketName(), opts);
      }
      destroy() {
        return this.jsm.streams.delete(this.bucketName());
      }
      status() {
        return __awaiter(this, void 0, void 0, function* () {
          var _a2, _b;
          const nc = this.js.nc;
          const cluster = (_b = (_a2 = nc.info) === null || _a2 === void 0 ? void 0 : _a2.cluster) !== null && _b !== void 0 ? _b : "";
          const bn = this.bucketName();
          const si = yield this.jsm.streams.info(bn);
          return new KvStatusImpl(si, cluster);
        });
      }
    };
    exports2.Bucket = Bucket;
    var KvStatusImpl = class {
      constructor(si, cluster = "") {
        this.si = si;
        this.cluster = cluster;
      }
      get bucket() {
        return this.si.config.name.startsWith(types_1.kvPrefix) ? this.si.config.name.substring(types_1.kvPrefix.length) : this.si.config.name;
      }
      get values() {
        return this.si.state.messages;
      }
      get history() {
        return this.si.config.max_msgs_per_subject;
      }
      get ttl() {
        return (0, util_1.millis)(this.si.config.max_age);
      }
      get bucket_location() {
        return this.cluster;
      }
      get backingStore() {
        return this.si.config.storage;
      }
      get storage() {
        return this.si.config.storage;
      }
      get replicas() {
        return this.si.config.num_replicas;
      }
      get description() {
        var _a2;
        return (_a2 = this.si.config.description) !== null && _a2 !== void 0 ? _a2 : "";
      }
      get maxBucketSize() {
        return this.si.config.max_bytes;
      }
      get maxValueSize() {
        return this.si.config.max_msg_size;
      }
      get max_bytes() {
        return this.si.config.max_bytes;
      }
      get placement() {
        return this.si.config.placement || { cluster: "", tags: [] };
      }
      get placementCluster() {
        var _a2, _b;
        return (_b = (_a2 = this.si.config.placement) === null || _a2 === void 0 ? void 0 : _a2.cluster) !== null && _b !== void 0 ? _b : "";
      }
      get republish() {
        var _a2;
        return (_a2 = this.si.config.republish) !== null && _a2 !== void 0 ? _a2 : { src: "", dest: "" };
      }
      get streamInfo() {
        return this.si;
      }
      get size() {
        return this.si.state.bytes;
      }
      get metadata() {
        var _a2;
        return (_a2 = this.si.config.metadata) !== null && _a2 !== void 0 ? _a2 : {};
      }
      get compression() {
        if (this.si.config.compression) {
          return this.si.config.compression !== jsapi_types_1.StoreCompression.None;
        }
        return false;
      }
    };
    exports2.KvStatusImpl = KvStatusImpl;
    var KvStoredEntryImpl = class {
      constructor(bucket, prefixLen, sm) {
        this.bucket = bucket;
        this.prefixLen = prefixLen;
        this.sm = sm;
      }
      get key() {
        return this.sm.subject.substring(this.prefixLen);
      }
      get value() {
        return this.sm.data;
      }
      get delta() {
        return 0;
      }
      get created() {
        return this.sm.time;
      }
      get revision() {
        return this.sm.seq;
      }
      get operation() {
        return this.sm.header.get(exports2.kvOperationHdr) || "PUT";
      }
      get length() {
        const slen = this.sm.header.get(types_1.JsHeaders.MessageSizeHdr) || "";
        if (slen !== "") {
          return parseInt(slen, 10);
        }
        return this.sm.data.length;
      }
      json() {
        return this.sm.json();
      }
      string() {
        return this.sm.string();
      }
    };
    var KvJsMsgEntryImpl = class {
      constructor(bucket, key, sm) {
        this.bucket = bucket;
        this.key = key;
        this.sm = sm;
      }
      get value() {
        return this.sm.data;
      }
      get created() {
        return new Date((0, util_1.millis)(this.sm.info.timestampNanos));
      }
      get revision() {
        return this.sm.seq;
      }
      get operation() {
        var _a2;
        return ((_a2 = this.sm.headers) === null || _a2 === void 0 ? void 0 : _a2.get(exports2.kvOperationHdr)) || "PUT";
      }
      get delta() {
        return this.sm.info.pending;
      }
      get length() {
        var _a2;
        const slen = ((_a2 = this.sm.headers) === null || _a2 === void 0 ? void 0 : _a2.get(types_1.JsHeaders.MessageSizeHdr)) || "";
        if (slen !== "") {
          return parseInt(slen, 10);
        }
        return this.sm.data.length;
      }
      json() {
        return this.sm.json();
      }
      string() {
        return this.sm.string();
      }
    };
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/consumer.js
var require_consumer = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/consumer.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OrderedPullConsumerImpl = exports2.PullConsumerImpl = exports2.OrderedConsumerMessages = exports2.PullConsumerMessagesImpl = exports2.ConsumerDebugEvents = exports2.ConsumerEvents = void 0;
    var util_1 = require_util();
    var nuid_1 = require_nuid();
    var jsutil_1 = require_jsutil();
    var queued_iterator_1 = require_queued_iterator();
    var core_1 = require_core();
    var idleheartbeat_monitor_1 = require_idleheartbeat_monitor();
    var jsmsg_1 = require_jsmsg();
    var jsapi_types_1 = require_jsapi_types();
    var types_1 = require_types2();
    var PullConsumerType;
    (function(PullConsumerType2) {
      PullConsumerType2[PullConsumerType2["Unset"] = -1] = "Unset";
      PullConsumerType2[PullConsumerType2["Consume"] = 0] = "Consume";
      PullConsumerType2[PullConsumerType2["Fetch"] = 1] = "Fetch";
    })(PullConsumerType || (PullConsumerType = {}));
    var ConsumerEvents;
    (function(ConsumerEvents2) {
      ConsumerEvents2["HeartbeatsMissed"] = "heartbeats_missed";
      ConsumerEvents2["ConsumerNotFound"] = "consumer_not_found";
      ConsumerEvents2["StreamNotFound"] = "stream_not_found";
      ConsumerEvents2["ConsumerDeleted"] = "consumer_deleted";
      ConsumerEvents2["OrderedConsumerRecreated"] = "ordered_consumer_recreated";
      ConsumerEvents2["NoResponders"] = "no_responders";
    })(ConsumerEvents || (exports2.ConsumerEvents = ConsumerEvents = {}));
    var ConsumerDebugEvents;
    (function(ConsumerDebugEvents2) {
      ConsumerDebugEvents2["DebugEvent"] = "debug";
      ConsumerDebugEvents2["Discard"] = "discard";
      ConsumerDebugEvents2["Reset"] = "reset";
      ConsumerDebugEvents2["Next"] = "next";
    })(ConsumerDebugEvents || (exports2.ConsumerDebugEvents = ConsumerDebugEvents = {}));
    var PullConsumerMessagesImpl = class extends queued_iterator_1.QueuedIteratorImpl {
      // callback: ConsumerCallbackFn;
      constructor(c, opts, refilling = false) {
        super();
        this.consumer = c;
        const copts = opts;
        this.opts = this.parseOptions(opts, refilling);
        this.callback = copts.callback || null;
        this.noIterator = typeof this.callback === "function";
        this.monitor = null;
        this.pong = null;
        this.pending = { msgs: 0, bytes: 0, requests: 0 };
        this.refilling = refilling;
        this.timeout = null;
        this.inbox = (0, core_1.createInbox)(c.api.nc.options.inboxPrefix);
        this.listeners = [];
        this.forOrderedConsumer = false;
        this.abortOnMissingResource = copts.abort_on_missing_resource === true;
        this.bind = copts.bind === true;
        this.inBackOff = false;
        this.start();
      }
      start() {
        const { max_messages, max_bytes, idle_heartbeat, threshold_bytes, threshold_messages } = this.opts;
        this.closed().then((err2) => {
          if (this.cleanupHandler) {
            try {
              this.cleanupHandler(err2);
            } catch (_err) {
            }
          }
        });
        const { sub } = this;
        if (sub) {
          sub.unsubscribe();
        }
        this.sub = this.consumer.api.nc.subscribe(this.inbox, {
          callback: (err2, msg) => {
            var _a2, _b, _c, _d2;
            if (err2) {
              this.stop(err2);
              return;
            }
            (_a2 = this.monitor) === null || _a2 === void 0 ? void 0 : _a2.work();
            const isProtocol = msg.subject === this.inbox;
            if (isProtocol) {
              if ((0, jsutil_1.isHeartbeatMsg)(msg)) {
                return;
              }
              const code = (_b = msg.headers) === null || _b === void 0 ? void 0 : _b.code;
              const description = ((_d2 = (_c = msg.headers) === null || _c === void 0 ? void 0 : _c.description) === null || _d2 === void 0 ? void 0 : _d2.toLowerCase()) || "unknown";
              const { msgsLeft, bytesLeft } = this.parseDiscard(msg.headers);
              if (msgsLeft > 0 || bytesLeft > 0) {
                this.pending.msgs -= msgsLeft;
                this.pending.bytes -= bytesLeft;
                this.pending.requests--;
                this.notify(ConsumerDebugEvents.Discard, { msgsLeft, bytesLeft });
              } else {
                if (code === 400) {
                  this.stop(new core_1.NatsError(description, `${code}`));
                  return;
                } else if (code === 409 && description === "consumer deleted") {
                  this.notify(ConsumerEvents.ConsumerDeleted, `${code} ${description}`);
                  if (!this.refilling || this.abortOnMissingResource) {
                    const error = new core_1.NatsError(description, `${code}`);
                    this.stop(error);
                    return;
                  }
                } else if (code === 503) {
                  this.notify(ConsumerEvents.NoResponders, `${code} No Responders`);
                  if (!this.refilling || this.abortOnMissingResource) {
                    const error = new core_1.NatsError("no responders", `${code}`);
                    this.stop(error);
                    return;
                  }
                } else {
                  this.notify(ConsumerDebugEvents.DebugEvent, `${code} ${description}`);
                }
              }
            } else {
              this._push((0, jsmsg_1.toJsMsg)(msg, this.consumer.api.timeout));
              this.received++;
              if (this.pending.msgs) {
                this.pending.msgs--;
              }
              if (this.pending.bytes) {
                this.pending.bytes -= msg.size();
              }
            }
            if (this.pending.msgs === 0 && this.pending.bytes === 0) {
              this.pending.requests = 0;
            }
            if (this.refilling) {
              if (max_messages && this.pending.msgs <= threshold_messages || max_bytes && this.pending.bytes <= threshold_bytes) {
                const batch = this.pullOptions();
                this.pull(batch);
              }
            } else if (this.pending.requests === 0) {
              this._push(() => {
                this.stop();
              });
            }
          }
        });
        this.sub.closed.then(() => {
          if (this.sub.draining) {
            this._push(() => {
              this.stop();
            });
          }
        });
        if (idle_heartbeat) {
          this.monitor = new idleheartbeat_monitor_1.IdleHeartbeatMonitor(idle_heartbeat, (data) => {
            this.notify(ConsumerEvents.HeartbeatsMissed, data);
            this.resetPending().then(() => {
            }).catch(() => {
            });
            return false;
          }, { maxOut: 2 });
        }
        (() => __awaiter(this, void 0, void 0, function* () {
          var _a2, e_1, _b, _c;
          var _d2;
          const status = this.consumer.api.nc.status();
          this.statusIterator = status;
          try {
            for (var _e = true, status_1 = __asyncValues(status), status_1_1; status_1_1 = yield status_1.next(), _a2 = status_1_1.done, !_a2; _e = true) {
              _c = status_1_1.value;
              _e = false;
              const s = _c;
              switch (s.type) {
                case core_1.Events.Disconnect:
                  (_d2 = this.monitor) === null || _d2 === void 0 ? void 0 : _d2.cancel();
                  break;
                case core_1.Events.Reconnect:
                  this.resetPending().then((ok) => {
                    var _a3;
                    if (ok) {
                      (_a3 = this.monitor) === null || _a3 === void 0 ? void 0 : _a3.restart();
                    }
                  }).catch(() => {
                  });
                  break;
                default:
              }
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (!_e && !_a2 && (_b = status_1.return)) yield _b.call(status_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        }))();
        this.pull(this.pullOptions());
      }
      _push(r) {
        if (!this.callback) {
          super.push(r);
        } else {
          const fn = typeof r === "function" ? r : null;
          try {
            if (!fn) {
              this.callback(r);
            } else {
              fn();
            }
          } catch (err2) {
            this.stop(err2);
          }
        }
      }
      notify(type, data) {
        if (this.listeners.length > 0) {
          (() => {
            this.listeners.forEach((l) => {
              if (!l.done) {
                l.push({ type, data });
              }
            });
          })();
        }
      }
      resetPending() {
        return this.bind ? this.resetPendingNoInfo() : this.resetPendingWithInfo();
      }
      resetPendingNoInfo() {
        this.pending.msgs = 0;
        this.pending.bytes = 0;
        this.pending.requests = 0;
        this.pull(this.pullOptions());
        return Promise.resolve(true);
      }
      resetPendingWithInfo() {
        return __awaiter(this, void 0, void 0, function* () {
          if (this.inBackOff) {
            return false;
          }
          let notFound = 0;
          let streamNotFound = 0;
          const bo = (0, util_1.backoff)([this.opts.expires]);
          let attempt = 0;
          while (true) {
            if (this.done) {
              return false;
            }
            if (this.consumer.api.nc.isClosed()) {
              console.error("aborting resetPending - connection is closed");
              return false;
            }
            try {
              yield this.consumer.info();
              this.inBackOff = false;
              notFound = 0;
              this.pending.msgs = 0;
              this.pending.bytes = 0;
              this.pending.requests = 0;
              this.pull(this.pullOptions());
              return true;
            } catch (err2) {
              if (err2.message === "stream not found") {
                streamNotFound++;
                this.notify(ConsumerEvents.StreamNotFound, streamNotFound);
                if (!this.refilling || this.abortOnMissingResource) {
                  this.stop(err2);
                  return false;
                }
              } else if (err2.message === "consumer not found") {
                notFound++;
                this.notify(ConsumerEvents.ConsumerNotFound, notFound);
                if (this.resetHandler) {
                  try {
                    this.resetHandler();
                  } catch (_) {
                  }
                }
                if (!this.refilling || this.abortOnMissingResource) {
                  this.stop(err2);
                  return false;
                }
                if (this.forOrderedConsumer) {
                  return false;
                }
              } else {
                notFound = 0;
                streamNotFound = 0;
              }
              this.inBackOff = true;
              const to = bo.backoff(attempt);
              const de = (0, util_1.delay)(to);
              yield Promise.race([de, this.consumer.api.nc.closed()]);
              de.cancel();
              attempt++;
            }
          }
        });
      }
      pull(opts) {
        var _a2, _b;
        this.pending.bytes += (_a2 = opts.max_bytes) !== null && _a2 !== void 0 ? _a2 : 0;
        this.pending.msgs += (_b = opts.batch) !== null && _b !== void 0 ? _b : 0;
        this.pending.requests++;
        const nc = this.consumer.api.nc;
        this._push(() => {
          nc.publish(`${this.consumer.api.prefix}.CONSUMER.MSG.NEXT.${this.consumer.stream}.${this.consumer.name}`, this.consumer.api.jc.encode(opts), { reply: this.inbox });
          this.notify(ConsumerDebugEvents.Next, opts);
        });
      }
      pullOptions() {
        const batch = this.opts.max_messages - this.pending.msgs;
        const max_bytes = this.opts.max_bytes - this.pending.bytes;
        const idle_heartbeat = (0, util_1.nanos)(this.opts.idle_heartbeat);
        const expires = (0, util_1.nanos)(this.opts.expires);
        return { batch, max_bytes, idle_heartbeat, expires };
      }
      parseDiscard(headers) {
        const discard = {
          msgsLeft: 0,
          bytesLeft: 0
        };
        const msgsLeft = headers === null || headers === void 0 ? void 0 : headers.get(types_1.JsHeaders.PendingMessagesHdr);
        if (msgsLeft) {
          discard.msgsLeft = parseInt(msgsLeft);
        }
        const bytesLeft = headers === null || headers === void 0 ? void 0 : headers.get(types_1.JsHeaders.PendingBytesHdr);
        if (bytesLeft) {
          discard.bytesLeft = parseInt(bytesLeft);
        }
        return discard;
      }
      trackTimeout(t) {
        this.timeout = t;
      }
      close() {
        this.stop();
        return this.iterClosed;
      }
      closed() {
        return this.iterClosed;
      }
      clearTimers() {
        var _a2, _b;
        (_a2 = this.monitor) === null || _a2 === void 0 ? void 0 : _a2.cancel();
        this.monitor = null;
        (_b = this.timeout) === null || _b === void 0 ? void 0 : _b.cancel();
        this.timeout = null;
      }
      setCleanupHandler(fn) {
        this.cleanupHandler = fn;
      }
      stop(err2) {
        var _a2, _b;
        if (this.done) {
          return;
        }
        (_a2 = this.sub) === null || _a2 === void 0 ? void 0 : _a2.unsubscribe();
        this.clearTimers();
        (_b = this.statusIterator) === null || _b === void 0 ? void 0 : _b.stop();
        this._push(() => {
          super.stop(err2);
          this.listeners.forEach((n) => {
            n.stop();
          });
        });
      }
      parseOptions(opts, refilling = false) {
        const args = opts || {};
        args.max_messages = args.max_messages || 0;
        args.max_bytes = args.max_bytes || 0;
        if (args.max_messages !== 0 && args.max_bytes !== 0) {
          throw new Error(`only specify one of max_messages or max_bytes`);
        }
        if (args.max_messages === 0) {
          args.max_messages = 100;
        }
        args.expires = args.expires || 3e4;
        if (args.expires < 1e3) {
          throw new Error("expires should be at least 1000ms");
        }
        args.idle_heartbeat = args.idle_heartbeat || args.expires / 2;
        args.idle_heartbeat = args.idle_heartbeat > 3e4 ? 3e4 : args.idle_heartbeat;
        if (refilling) {
          const minMsgs = Math.round(args.max_messages * 0.75) || 1;
          args.threshold_messages = args.threshold_messages || minMsgs;
          const minBytes = Math.round(args.max_bytes * 0.75) || 1;
          args.threshold_bytes = args.threshold_bytes || minBytes;
        }
        return args;
      }
      status() {
        const iter = new queued_iterator_1.QueuedIteratorImpl();
        this.listeners.push(iter);
        return Promise.resolve(iter);
      }
    };
    exports2.PullConsumerMessagesImpl = PullConsumerMessagesImpl;
    var OrderedConsumerMessages = class extends queued_iterator_1.QueuedIteratorImpl {
      constructor() {
        super();
        this.listeners = [];
      }
      setSource(src) {
        if (this.src) {
          this.src.resetHandler = void 0;
          this.src.setCleanupHandler();
          this.src.stop();
        }
        this.src = src;
        this.src.setCleanupHandler((err2) => {
          this.stop(err2 || void 0);
        });
        (() => __awaiter(this, void 0, void 0, function* () {
          var _a2, e_2, _b, _c;
          const status = yield this.src.status();
          try {
            for (var _d2 = true, status_2 = __asyncValues(status), status_2_1; status_2_1 = yield status_2.next(), _a2 = status_2_1.done, !_a2; _d2 = true) {
              _c = status_2_1.value;
              _d2 = false;
              const s = _c;
              this.notify(s.type, s.data);
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (!_d2 && !_a2 && (_b = status_2.return)) yield _b.call(status_2);
            } finally {
              if (e_2) throw e_2.error;
            }
          }
        }))().catch(() => {
        });
      }
      notify(type, data) {
        if (this.listeners.length > 0) {
          (() => {
            this.listeners.forEach((l) => {
              if (!l.done) {
                l.push({ type, data });
              }
            });
          })();
        }
      }
      stop(err2) {
        var _a2;
        if (this.done) {
          return;
        }
        (_a2 = this.src) === null || _a2 === void 0 ? void 0 : _a2.stop(err2);
        super.stop(err2);
        this.listeners.forEach((n) => {
          n.stop();
        });
      }
      close() {
        this.stop();
        return this.iterClosed;
      }
      closed() {
        return this.iterClosed;
      }
      status() {
        const iter = new queued_iterator_1.QueuedIteratorImpl();
        this.listeners.push(iter);
        return Promise.resolve(iter);
      }
    };
    exports2.OrderedConsumerMessages = OrderedConsumerMessages;
    var PullConsumerImpl = class {
      constructor(api, info) {
        this.api = api;
        this._info = info;
        this.stream = info.stream_name;
        this.name = info.name;
      }
      consume(opts = {
        max_messages: 100,
        expires: 3e4
      }) {
        return Promise.resolve(new PullConsumerMessagesImpl(this, opts, true));
      }
      fetch(opts = {
        max_messages: 100,
        expires: 3e4
      }) {
        const m = new PullConsumerMessagesImpl(this, opts, false);
        const to = Math.round(m.opts.expires * 1.05);
        const timer = (0, util_1.timeout)(to);
        m.closed().catch(() => {
        }).finally(() => {
          timer.cancel();
        });
        timer.catch(() => {
          m.close().catch();
        });
        m.trackTimeout(timer);
        return Promise.resolve(m);
      }
      next(opts = { expires: 3e4 }) {
        const d = (0, util_1.deferred)();
        const fopts = opts;
        fopts.max_messages = 1;
        const iter = new PullConsumerMessagesImpl(this, fopts, false);
        const to = Math.round(iter.opts.expires * 1.05);
        if (to >= 6e4) {
          (() => __awaiter(this, void 0, void 0, function* () {
            var _a2, e_3, _b, _c;
            try {
              for (var _d2 = true, _e = __asyncValues(yield iter.status()), _f; _f = yield _e.next(), _a2 = _f.done, !_a2; _d2 = true) {
                _c = _f.value;
                _d2 = false;
                const s = _c;
                if (s.type === ConsumerEvents.HeartbeatsMissed && s.data >= 2) {
                  d.reject(new Error("consumer missed heartbeats"));
                  break;
                }
              }
            } catch (e_3_1) {
              e_3 = { error: e_3_1 };
            } finally {
              try {
                if (!_d2 && !_a2 && (_b = _e.return)) yield _b.call(_e);
              } finally {
                if (e_3) throw e_3.error;
              }
            }
          }))().catch();
        }
        (() => __awaiter(this, void 0, void 0, function* () {
          var _a2, e_4, _b, _c;
          try {
            for (var _d2 = true, iter_1 = __asyncValues(iter), iter_1_1; iter_1_1 = yield iter_1.next(), _a2 = iter_1_1.done, !_a2; _d2 = true) {
              _c = iter_1_1.value;
              _d2 = false;
              const m = _c;
              d.resolve(m);
              break;
            }
          } catch (e_4_1) {
            e_4 = { error: e_4_1 };
          } finally {
            try {
              if (!_d2 && !_a2 && (_b = iter_1.return)) yield _b.call(iter_1);
            } finally {
              if (e_4) throw e_4.error;
            }
          }
        }))().catch(() => {
        });
        const timer = (0, util_1.timeout)(to);
        iter.closed().then((err2) => {
          err2 ? d.reject(err2) : d.resolve(null);
        }).catch((err2) => {
          d.reject(err2);
        }).finally(() => {
          timer.cancel();
        });
        timer.catch((_err) => {
          d.resolve(null);
          iter.close().catch();
        });
        iter.trackTimeout(timer);
        return d;
      }
      delete() {
        const { stream_name, name } = this._info;
        return this.api.delete(stream_name, name);
      }
      info(cached = false) {
        if (cached) {
          return Promise.resolve(this._info);
        }
        const { stream_name, name } = this._info;
        return this.api.info(stream_name, name).then((ci) => {
          this._info = ci;
          return this._info;
        });
      }
    };
    exports2.PullConsumerImpl = PullConsumerImpl;
    var OrderedPullConsumerImpl = class {
      constructor(api, stream2, opts = {}) {
        this.api = api;
        this.stream = stream2;
        this.cursor = { stream_seq: 1, deliver_seq: 0 };
        this.namePrefix = nuid_1.nuid.next();
        if (typeof opts.name_prefix === "string") {
          (0, jsutil_1.minValidation)("name_prefix", opts.name_prefix);
          this.namePrefix = opts.name_prefix + this.namePrefix;
        }
        this.serial = 0;
        this.currentConsumer = null;
        this.userCallback = null;
        this.iter = null;
        this.type = PullConsumerType.Unset;
        this.consumerOpts = opts;
        this.maxInitialReset = 30;
        this.startSeq = this.consumerOpts.opt_start_seq || 0;
        this.cursor.stream_seq = this.startSeq > 0 ? this.startSeq - 1 : 0;
      }
      getConsumerOpts(seq) {
        this.serial++;
        const name = `${this.namePrefix}_${this.serial}`;
        seq = seq === 0 ? 1 : seq;
        const config2 = {
          name,
          deliver_policy: jsapi_types_1.DeliverPolicy.StartSequence,
          opt_start_seq: seq,
          ack_policy: jsapi_types_1.AckPolicy.None,
          inactive_threshold: (0, util_1.nanos)(5 * 60 * 1e3),
          num_replicas: 1
        };
        if (this.consumerOpts.headers_only === true) {
          config2.headers_only = true;
        }
        if (Array.isArray(this.consumerOpts.filterSubjects)) {
          config2.filter_subjects = this.consumerOpts.filterSubjects;
        }
        if (typeof this.consumerOpts.filterSubjects === "string") {
          config2.filter_subject = this.consumerOpts.filterSubjects;
        }
        if (this.consumerOpts.replay_policy) {
          config2.replay_policy = this.consumerOpts.replay_policy;
        }
        if (seq === this.startSeq + 1) {
          config2.deliver_policy = this.consumerOpts.deliver_policy || jsapi_types_1.DeliverPolicy.StartSequence;
          if (this.consumerOpts.deliver_policy === jsapi_types_1.DeliverPolicy.LastPerSubject || this.consumerOpts.deliver_policy === jsapi_types_1.DeliverPolicy.New || this.consumerOpts.deliver_policy === jsapi_types_1.DeliverPolicy.Last) {
            delete config2.opt_start_seq;
            config2.deliver_policy = this.consumerOpts.deliver_policy;
          }
          if (config2.deliver_policy === jsapi_types_1.DeliverPolicy.LastPerSubject) {
            if (typeof config2.filter_subjects === "undefined" && typeof config2.filter_subject === "undefined") {
              config2.filter_subject = ">";
            }
          }
          if (this.consumerOpts.opt_start_time) {
            delete config2.opt_start_seq;
            config2.deliver_policy = jsapi_types_1.DeliverPolicy.StartTime;
            config2.opt_start_time = this.consumerOpts.opt_start_time;
          }
          if (this.consumerOpts.inactive_threshold) {
            config2.inactive_threshold = (0, util_1.nanos)(this.consumerOpts.inactive_threshold);
          }
        }
        return config2;
      }
      resetConsumer() {
        return __awaiter(this, arguments, void 0, function* (seq = 0) {
          var _a2, _b, _c, _d2, _e;
          const id = nuid_1.nuid.next();
          const isNew = this.serial === 0;
          (_a2 = this.consumer) === null || _a2 === void 0 ? void 0 : _a2.delete().catch(() => {
          });
          seq = seq === 0 ? 1 : seq;
          this.cursor.deliver_seq = 0;
          const config2 = this.getConsumerOpts(seq);
          config2.max_deliver = 1;
          config2.mem_storage = true;
          const bo = (0, util_1.backoff)([((_b = this.opts) === null || _b === void 0 ? void 0 : _b.expires) || 3e4]);
          let ci;
          for (let i = 0; ; i++) {
            try {
              ci = yield this.api.add(this.stream, config2);
              (_c = this.iter) === null || _c === void 0 ? void 0 : _c.notify(ConsumerEvents.OrderedConsumerRecreated, ci.name);
              break;
            } catch (err2) {
              if (err2.message === "stream not found") {
                (_d2 = this.iter) === null || _d2 === void 0 ? void 0 : _d2.notify(ConsumerEvents.StreamNotFound, i);
                if (this.type === PullConsumerType.Fetch || this.opts.abort_on_missing_resource === true) {
                  (_e = this.iter) === null || _e === void 0 ? void 0 : _e.stop(err2);
                  return Promise.reject(err2);
                }
              }
              if (isNew && i >= this.maxInitialReset) {
                throw err2;
              } else {
                yield (0, util_1.delay)(bo.backoff(i + 1));
              }
            }
          }
          return ci;
        });
      }
      internalHandler(serial) {
        return (m) => {
          var _a2;
          if (this.serial !== serial) {
            return;
          }
          const dseq = m.info.deliverySequence;
          if (dseq !== this.cursor.deliver_seq + 1) {
            this.notifyOrderedResetAndReset();
            return;
          }
          this.cursor.deliver_seq = dseq;
          this.cursor.stream_seq = m.info.streamSequence;
          if (this.userCallback) {
            this.userCallback(m);
          } else {
            (_a2 = this.iter) === null || _a2 === void 0 ? void 0 : _a2.push(m);
          }
        };
      }
      reset() {
        return __awaiter(this, arguments, void 0, function* (opts = {
          max_messages: 100,
          expires: 3e4
        }, info) {
          var _a2, _b;
          info = info || {};
          const fromFetch = info.fromFetch || false;
          const orderedReset = info.orderedReset || false;
          if (this.type === PullConsumerType.Fetch && orderedReset) {
            (_a2 = this.iter) === null || _a2 === void 0 ? void 0 : _a2.src.stop();
            yield (_b = this.iter) === null || _b === void 0 ? void 0 : _b.closed();
            this.currentConsumer = null;
            return;
          }
          if (this.currentConsumer === null || orderedReset) {
            this.currentConsumer = yield this.resetConsumer(this.cursor.stream_seq + 1);
          }
          if (this.iter === null || fromFetch) {
            this.iter = new OrderedConsumerMessages();
          }
          this.consumer = new PullConsumerImpl(this.api, this.currentConsumer);
          const copts = opts;
          copts.callback = this.internalHandler(this.serial);
          let msgs = null;
          if (this.type === PullConsumerType.Fetch && fromFetch) {
            msgs = yield this.consumer.fetch(opts);
          } else if (this.type === PullConsumerType.Consume) {
            msgs = yield this.consumer.consume(opts);
          }
          const msgsImpl = msgs;
          msgsImpl.forOrderedConsumer = true;
          msgsImpl.resetHandler = () => {
            this.notifyOrderedResetAndReset();
          };
          this.iter.setSource(msgsImpl);
        });
      }
      notifyOrderedResetAndReset() {
        var _a2;
        (_a2 = this.iter) === null || _a2 === void 0 ? void 0 : _a2.notify(ConsumerDebugEvents.Reset, "");
        this.reset(this.opts, { orderedReset: true });
      }
      consume() {
        return __awaiter(this, arguments, void 0, function* (opts = {
          max_messages: 100,
          expires: 3e4
        }) {
          const copts = opts;
          if (copts.bind) {
            return Promise.reject(new Error("bind is not supported"));
          }
          if (this.type === PullConsumerType.Fetch) {
            return Promise.reject(new Error("ordered consumer initialized as fetch"));
          }
          if (this.type === PullConsumerType.Consume) {
            return Promise.reject(new Error("ordered consumer doesn't support concurrent consume"));
          }
          const { callback } = opts;
          if (callback) {
            this.userCallback = callback;
          }
          this.type = PullConsumerType.Consume;
          this.opts = opts;
          yield this.reset(opts);
          return this.iter;
        });
      }
      fetch() {
        return __awaiter(this, arguments, void 0, function* (opts = { max_messages: 100, expires: 3e4 }) {
          var _a2;
          const copts = opts;
          if (copts.bind) {
            return Promise.reject(new Error("bind is not supported"));
          }
          if (this.type === PullConsumerType.Consume) {
            return Promise.reject(new Error("ordered consumer already initialized as consume"));
          }
          if (((_a2 = this.iter) === null || _a2 === void 0 ? void 0 : _a2.done) === false) {
            return Promise.reject(new Error("ordered consumer doesn't support concurrent fetch"));
          }
          const { callback } = opts;
          if (callback) {
            this.userCallback = callback;
          }
          this.type = PullConsumerType.Fetch;
          this.opts = opts;
          yield this.reset(opts, { fromFetch: true });
          return this.iter;
        });
      }
      next() {
        return __awaiter(this, arguments, void 0, function* (opts = { expires: 3e4 }) {
          const copts = opts;
          if (copts.bind) {
            return Promise.reject(new Error("bind is not supported"));
          }
          copts.max_messages = 1;
          const d = (0, util_1.deferred)();
          copts.callback = (m) => {
            this.userCallback = null;
            d.resolve(m);
          };
          const iter = yield this.fetch(copts);
          iter.iterClosed.then((err2) => {
            if (err2) {
              d.reject(err2);
            }
            d.resolve(null);
          }).catch((err2) => {
            d.reject(err2);
          });
          return d;
        });
      }
      delete() {
        if (!this.currentConsumer) {
          return Promise.resolve(false);
        }
        return this.api.delete(this.stream, this.currentConsumer.name).then((tf) => {
          return Promise.resolve(tf);
        }).catch((err2) => {
          return Promise.reject(err2);
        }).finally(() => {
          this.currentConsumer = null;
        });
      }
      info(cached) {
        return __awaiter(this, void 0, void 0, function* () {
          if (this.currentConsumer == null) {
            this.currentConsumer = yield this.resetConsumer(this.startSeq);
            return Promise.resolve(this.currentConsumer);
          }
          if (cached && this.currentConsumer) {
            return Promise.resolve(this.currentConsumer);
          }
          return this.api.info(this.stream, this.currentConsumer.name);
        });
      }
    };
    exports2.OrderedPullConsumerImpl = OrderedPullConsumerImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsmstream_api.js
var require_jsmstream_api = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsmstream_api.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamsImpl = exports2.StoredMsgImpl = exports2.StreamAPIImpl = exports2.StreamImpl = exports2.ConsumersImpl = void 0;
    exports2.convertStreamSourceDomain = convertStreamSourceDomain;
    var types_1 = require_types();
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var jslister_1 = require_jslister();
    var jsutil_1 = require_jsutil();
    var headers_1 = require_headers();
    var kv_1 = require_kv();
    var objectstore_1 = require_objectstore();
    var codec_1 = require_codec();
    var encoders_1 = require_encoders();
    var semver_1 = require_semver();
    var types_2 = require_types2();
    var consumer_1 = require_consumer();
    var jsmconsumer_api_1 = require_jsmconsumer_api();
    function convertStreamSourceDomain(s) {
      if (s === void 0) {
        return void 0;
      }
      const { domain } = s;
      if (domain === void 0) {
        return s;
      }
      const copy = Object.assign({}, s);
      delete copy.domain;
      if (domain === "") {
        return copy;
      }
      if (copy.external) {
        throw new Error("domain and external are both set");
      }
      copy.external = { api: `$JS.${domain}.API` };
      return copy;
    }
    var ConsumersImpl = class {
      constructor(api) {
        this.api = api;
        this.notified = false;
      }
      checkVersion() {
        const fv = this.api.nc.features.get(semver_1.Feature.JS_SIMPLIFICATION);
        if (!fv.ok) {
          return Promise.reject(new Error(`consumers framework is only supported on servers ${fv.min} or better`));
        }
        return Promise.resolve();
      }
      getPullConsumerFor(ci) {
        if (ci.config.deliver_subject !== void 0) {
          throw new Error("push consumer not supported");
        }
        return new consumer_1.PullConsumerImpl(this.api, ci);
      }
      get(stream_1) {
        return __awaiter(this, arguments, void 0, function* (stream2, name = {}) {
          if (typeof name === "object") {
            return this.ordered(stream2, name);
          }
          yield this.checkVersion();
          return this.api.info(stream2, name).then((ci) => {
            if (ci.config.deliver_subject !== void 0) {
              return Promise.reject(new Error("push consumer not supported"));
            }
            return new consumer_1.PullConsumerImpl(this.api, ci);
          }).catch((err2) => {
            return Promise.reject(err2);
          });
        });
      }
      ordered(stream2, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.checkVersion();
          const impl = this.api;
          const sapi = new StreamAPIImpl(impl.nc, impl.opts);
          return sapi.info(stream2).then((_si) => {
            return Promise.resolve(new consumer_1.OrderedPullConsumerImpl(this.api, stream2, opts));
          }).catch((err2) => {
            return Promise.reject(err2);
          });
        });
      }
    };
    exports2.ConsumersImpl = ConsumersImpl;
    var StreamImpl = class _StreamImpl {
      constructor(api, info) {
        this.api = api;
        this._info = info;
      }
      get name() {
        return this._info.config.name;
      }
      alternates() {
        return this.info().then((si) => {
          return si.alternates ? si.alternates : [];
        });
      }
      best() {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.info();
          if (this._info.alternates) {
            const asi = yield this.api.info(this._info.alternates[0].name);
            return new _StreamImpl(this.api, asi);
          } else {
            return this;
          }
        });
      }
      info(cached = false, opts) {
        if (cached) {
          return Promise.resolve(this._info);
        }
        return this.api.info(this.name, opts).then((si) => {
          this._info = si;
          return this._info;
        });
      }
      getConsumerFromInfo(ci) {
        return new ConsumersImpl(new jsmconsumer_api_1.ConsumerAPIImpl(this.api.nc, this.api.opts)).getPullConsumerFor(ci);
      }
      getConsumer(name) {
        return new ConsumersImpl(new jsmconsumer_api_1.ConsumerAPIImpl(this.api.nc, this.api.opts)).get(this.name, name);
      }
      getMessage(query) {
        return this.api.getMessage(this.name, query);
      }
      deleteMessage(seq, erase) {
        return this.api.deleteMessage(this.name, seq, erase);
      }
    };
    exports2.StreamImpl = StreamImpl;
    var StreamAPIImpl = class extends jsbaseclient_api_1.BaseApiClient {
      constructor(nc, opts) {
        super(nc, opts);
      }
      checkStreamConfigVersions(cfg) {
        const nci = this.nc;
        if (cfg.metadata) {
          const { min, ok } = nci.features.get(semver_1.Feature.JS_STREAM_CONSUMER_METADATA);
          if (!ok) {
            throw new Error(`stream 'metadata' requires server ${min}`);
          }
        }
        if (cfg.first_seq) {
          const { min, ok } = nci.features.get(semver_1.Feature.JS_STREAM_FIRST_SEQ);
          if (!ok) {
            throw new Error(`stream 'first_seq' requires server ${min}`);
          }
        }
        if (cfg.subject_transform) {
          const { min, ok } = nci.features.get(semver_1.Feature.JS_STREAM_SUBJECT_TRANSFORM);
          if (!ok) {
            throw new Error(`stream 'subject_transform' requires server ${min}`);
          }
        }
        if (cfg.compression) {
          const { min, ok } = nci.features.get(semver_1.Feature.JS_STREAM_COMPRESSION);
          if (!ok) {
            throw new Error(`stream 'compression' requires server ${min}`);
          }
        }
        if (cfg.consumer_limits) {
          const { min, ok } = nci.features.get(semver_1.Feature.JS_DEFAULT_CONSUMER_LIMITS);
          if (!ok) {
            throw new Error(`stream 'consumer_limits' requires server ${min}`);
          }
        }
        function validateStreamSource(context, src) {
          var _a2;
          const count = ((_a2 = src === null || src === void 0 ? void 0 : src.subject_transforms) === null || _a2 === void 0 ? void 0 : _a2.length) || 0;
          if (count > 0) {
            const { min, ok } = nci.features.get(semver_1.Feature.JS_STREAM_SOURCE_SUBJECT_TRANSFORM);
            if (!ok) {
              throw new Error(`${context} 'subject_transforms' requires server ${min}`);
            }
          }
        }
        if (cfg.sources) {
          cfg.sources.forEach((src) => {
            validateStreamSource("stream sources", src);
          });
        }
        if (cfg.mirror) {
          validateStreamSource("stream mirror", cfg.mirror);
        }
      }
      add() {
        return __awaiter(this, arguments, void 0, function* (cfg = {}) {
          var _a2;
          this.checkStreamConfigVersions(cfg);
          (0, jsutil_1.validateStreamName)(cfg.name);
          cfg.mirror = convertStreamSourceDomain(cfg.mirror);
          cfg.sources = (_a2 = cfg.sources) === null || _a2 === void 0 ? void 0 : _a2.map(convertStreamSourceDomain);
          const r = yield this._request(`${this.prefix}.STREAM.CREATE.${cfg.name}`, cfg);
          const si = r;
          this._fixInfo(si);
          return si;
        });
      }
      delete(stream2) {
        return __awaiter(this, void 0, void 0, function* () {
          (0, jsutil_1.validateStreamName)(stream2);
          const r = yield this._request(`${this.prefix}.STREAM.DELETE.${stream2}`);
          const cr2 = r;
          return cr2.success;
        });
      }
      update(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, cfg = {}) {
          var _a2;
          if (typeof name === "object") {
            const sc = name;
            name = sc.name;
            cfg = sc;
            console.trace(`\x1B[33m >> streams.update(config: StreamConfig) api changed to streams.update(name: string, config: StreamUpdateConfig) - this shim will be removed - update your code.  \x1B[0m`);
          }
          this.checkStreamConfigVersions(cfg);
          (0, jsutil_1.validateStreamName)(name);
          const old = yield this.info(name);
          const update = Object.assign(old.config, cfg);
          update.mirror = convertStreamSourceDomain(update.mirror);
          update.sources = (_a2 = update.sources) === null || _a2 === void 0 ? void 0 : _a2.map(convertStreamSourceDomain);
          const r = yield this._request(`${this.prefix}.STREAM.UPDATE.${name}`, update);
          const si = r;
          this._fixInfo(si);
          return si;
        });
      }
      info(name, data) {
        return __awaiter(this, void 0, void 0, function* () {
          (0, jsutil_1.validateStreamName)(name);
          const subj = `${this.prefix}.STREAM.INFO.${name}`;
          const r = yield this._request(subj, data);
          let si = r;
          let { total, limit } = si;
          let have = si.state.subjects ? Object.getOwnPropertyNames(si.state.subjects).length : 1;
          if (total && total > have) {
            const infos = [si];
            const paged = data || {};
            let i = 0;
            while (total > have) {
              i++;
              paged.offset = limit * i;
              const r2 = yield this._request(subj, paged);
              total = r2.total;
              infos.push(r2);
              const count = Object.getOwnPropertyNames(r2.state.subjects).length;
              have += count;
              if (count < limit) {
                break;
              }
            }
            let subjects = {};
            for (let i2 = 0; i2 < infos.length; i2++) {
              si = infos[i2];
              if (si.state.subjects) {
                subjects = Object.assign(subjects, si.state.subjects);
              }
            }
            si.offset = 0;
            si.total = 0;
            si.limit = 0;
            si.state.subjects = subjects;
          }
          this._fixInfo(si);
          return si;
        });
      }
      list(subject = "") {
        const payload = (subject === null || subject === void 0 ? void 0 : subject.length) ? { subject } : {};
        const listerFilter = (v) => {
          const slr = v;
          slr.streams.forEach((si) => {
            this._fixInfo(si);
          });
          return slr.streams;
        };
        const subj = `${this.prefix}.STREAM.LIST`;
        return new jslister_1.ListerImpl(subj, listerFilter, this, payload);
      }
      // FIXME: init of sealed, deny_delete, deny_purge shouldn't be necessary
      //  https://github.com/nats-io/nats-server/issues/2633
      _fixInfo(si) {
        si.config.sealed = si.config.sealed || false;
        si.config.deny_delete = si.config.deny_delete || false;
        si.config.deny_purge = si.config.deny_purge || false;
        si.config.allow_rollup_hdrs = si.config.allow_rollup_hdrs || false;
      }
      purge(name, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          if (opts) {
            const { keep, seq } = opts;
            if (typeof keep === "number" && typeof seq === "number") {
              throw new Error("can specify one of keep or seq");
            }
          }
          (0, jsutil_1.validateStreamName)(name);
          const v = yield this._request(`${this.prefix}.STREAM.PURGE.${name}`, opts);
          return v;
        });
      }
      deleteMessage(stream_1, seq_1) {
        return __awaiter(this, arguments, void 0, function* (stream2, seq, erase = true) {
          (0, jsutil_1.validateStreamName)(stream2);
          const dr = { seq };
          if (!erase) {
            dr.no_erase = true;
          }
          const r = yield this._request(`${this.prefix}.STREAM.MSG.DELETE.${stream2}`, dr);
          const cr2 = r;
          return cr2.success;
        });
      }
      getMessage(stream2, query) {
        return __awaiter(this, void 0, void 0, function* () {
          (0, jsutil_1.validateStreamName)(stream2);
          const r = yield this._request(`${this.prefix}.STREAM.MSG.GET.${stream2}`, query);
          const sm = r;
          return new StoredMsgImpl(sm);
        });
      }
      find(subject) {
        return this.findStream(subject);
      }
      listKvs() {
        const filter = (v) => {
          var _a2, _b;
          const slr = v;
          const kvStreams = slr.streams.filter((v2) => {
            return v2.config.name.startsWith(types_2.kvPrefix);
          });
          kvStreams.forEach((si) => {
            this._fixInfo(si);
          });
          let cluster = "";
          if (kvStreams.length) {
            cluster = (_b = (_a2 = this.nc.info) === null || _a2 === void 0 ? void 0 : _a2.cluster) !== null && _b !== void 0 ? _b : "";
          }
          const status = kvStreams.map((si) => {
            return new kv_1.KvStatusImpl(si, cluster);
          });
          return status;
        };
        const subj = `${this.prefix}.STREAM.LIST`;
        return new jslister_1.ListerImpl(subj, filter, this);
      }
      listObjectStores() {
        const filter = (v) => {
          const slr = v;
          const objStreams = slr.streams.filter((v2) => {
            return v2.config.name.startsWith(objectstore_1.osPrefix);
          });
          objStreams.forEach((si) => {
            this._fixInfo(si);
          });
          const status = objStreams.map((si) => {
            return new objectstore_1.ObjectStoreStatusImpl(si);
          });
          return status;
        };
        const subj = `${this.prefix}.STREAM.LIST`;
        return new jslister_1.ListerImpl(subj, filter, this);
      }
      names(subject = "") {
        const payload = (subject === null || subject === void 0 ? void 0 : subject.length) ? { subject } : {};
        const listerFilter = (v) => {
          const sr = v;
          return sr.streams;
        };
        const subj = `${this.prefix}.STREAM.NAMES`;
        return new jslister_1.ListerImpl(subj, listerFilter, this, payload);
      }
      get(name) {
        return __awaiter(this, void 0, void 0, function* () {
          const si = yield this.info(name);
          return Promise.resolve(new StreamImpl(this, si));
        });
      }
    };
    exports2.StreamAPIImpl = StreamAPIImpl;
    var StoredMsgImpl = class {
      constructor(smr) {
        this.smr = smr;
      }
      get subject() {
        return this.smr.message.subject;
      }
      get seq() {
        return this.smr.message.seq;
      }
      get timestamp() {
        return this.smr.message.time;
      }
      get time() {
        return new Date(Date.parse(this.timestamp));
      }
      get data() {
        return this.smr.message.data ? this._parse(this.smr.message.data) : types_1.Empty;
      }
      get header() {
        if (!this._header) {
          if (this.smr.message.hdrs) {
            const hd = this._parse(this.smr.message.hdrs);
            this._header = headers_1.MsgHdrsImpl.decode(hd);
          } else {
            this._header = (0, headers_1.headers)();
          }
        }
        return this._header;
      }
      _parse(s) {
        const bs = atob(s);
        const len = bs.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = bs.charCodeAt(i);
        }
        return bytes;
      }
      json(reviver) {
        return (0, codec_1.JSONCodec)(reviver).decode(this.data);
      }
      string() {
        return encoders_1.TD.decode(this.data);
      }
    };
    exports2.StoredMsgImpl = StoredMsgImpl;
    var StreamsImpl = class {
      constructor(api) {
        this.api = api;
      }
      get(stream2) {
        return this.api.info(stream2).then((si) => {
          return new StreamImpl(this.api, si);
        });
      }
    };
    exports2.StreamsImpl = StreamsImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsm.js
var require_jsm = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/jsm.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.JetStreamManagerImpl = exports2.DirectMsgImpl = exports2.DirectStreamAPIImpl = void 0;
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var jsmstream_api_1 = require_jsmstream_api();
    var jsmconsumer_api_1 = require_jsmconsumer_api();
    var queued_iterator_1 = require_queued_iterator();
    var types_1 = require_types2();
    var core_1 = require_core();
    var jsutil_1 = require_jsutil();
    var encoders_1 = require_encoders();
    var codec_1 = require_codec();
    var DirectStreamAPIImpl = class extends jsbaseclient_api_1.BaseApiClient {
      constructor(nc, opts) {
        super(nc, opts);
      }
      getMessage(stream2, query) {
        return __awaiter(this, void 0, void 0, function* () {
          (0, jsutil_1.validateStreamName)(stream2);
          let qq = query;
          const { last_by_subj } = qq;
          if (last_by_subj) {
            qq = null;
          }
          const payload = qq ? this.jc.encode(qq) : encoders_1.Empty;
          const pre = this.opts.apiPrefix || "$JS.API";
          const subj = last_by_subj ? `${pre}.DIRECT.GET.${stream2}.${last_by_subj}` : `${pre}.DIRECT.GET.${stream2}`;
          const r = yield this.nc.request(subj, payload, { timeout: this.timeout });
          const err2 = (0, jsutil_1.checkJsError)(r);
          if (err2) {
            return Promise.reject(err2);
          }
          const dm = new DirectMsgImpl(r);
          return Promise.resolve(dm);
        });
      }
      getBatch(stream2, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          (0, jsutil_1.validateStreamName)(stream2);
          const pre = this.opts.apiPrefix || "$JS.API";
          const subj = `${pre}.DIRECT.GET.${stream2}`;
          if (!Array.isArray(opts.multi_last) || opts.multi_last.length === 0) {
            return Promise.reject("multi_last is required");
          }
          const payload = JSON.stringify(opts, (key, value) => {
            if (key === "up_to_time" && value instanceof Date) {
              return value.toISOString();
            }
            return value;
          });
          const iter = new queued_iterator_1.QueuedIteratorImpl();
          const raw2 = yield this.nc.requestMany(subj, payload, {
            strategy: core_1.RequestStrategy.SentinelMsg
          });
          (() => __awaiter(this, void 0, void 0, function* () {
            var _a2, e_1, _b, _c;
            var _d2, _e, _f;
            let gotFirst = false;
            let badServer = false;
            let badRequest;
            try {
              for (var _g = true, raw_1 = __asyncValues(raw2), raw_1_1; raw_1_1 = yield raw_1.next(), _a2 = raw_1_1.done, !_a2; _g = true) {
                _c = raw_1_1.value;
                _g = false;
                const m = _c;
                if (!gotFirst) {
                  gotFirst = true;
                  const code = ((_d2 = m.headers) === null || _d2 === void 0 ? void 0 : _d2.code) || 0;
                  if (code !== 0 && code < 200 || code > 299) {
                    badRequest = (_e = m.headers) === null || _e === void 0 ? void 0 : _e.description.toLowerCase();
                    break;
                  }
                  const v = (_f = m.headers) === null || _f === void 0 ? void 0 : _f.get("Nats-Num-Pending");
                  if (v === "") {
                    badServer = true;
                    break;
                  }
                }
                if (m.data.length === 0) {
                  break;
                }
                iter.push(new DirectMsgImpl(m));
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (!_g && !_a2 && (_b = raw_1.return)) yield _b.call(raw_1);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
            iter.push(() => {
              if (badServer) {
                throw new Error("batch direct get not supported by the server");
              }
              if (badRequest) {
                throw new Error(`bad request: ${badRequest}`);
              }
              iter.stop();
            });
          }))();
          return Promise.resolve(iter);
        });
      }
    };
    exports2.DirectStreamAPIImpl = DirectStreamAPIImpl;
    var DirectMsgImpl = class {
      constructor(m) {
        if (!m.headers) {
          throw new Error("headers expected");
        }
        this.data = m.data;
        this.header = m.headers;
      }
      get subject() {
        return this.header.last(types_1.DirectMsgHeaders.Subject);
      }
      get seq() {
        const v = this.header.last(types_1.DirectMsgHeaders.Sequence);
        return typeof v === "string" ? parseInt(v) : 0;
      }
      get time() {
        return new Date(Date.parse(this.timestamp));
      }
      get timestamp() {
        return this.header.last(types_1.DirectMsgHeaders.TimeStamp);
      }
      get stream() {
        return this.header.last(types_1.DirectMsgHeaders.Stream);
      }
      json(reviver) {
        return (0, codec_1.JSONCodec)(reviver).decode(this.data);
      }
      string() {
        return encoders_1.TD.decode(this.data);
      }
    };
    exports2.DirectMsgImpl = DirectMsgImpl;
    var JetStreamManagerImpl = class extends jsbaseclient_api_1.BaseApiClient {
      constructor(nc, opts) {
        super(nc, opts);
        this.streams = new jsmstream_api_1.StreamAPIImpl(nc, opts);
        this.consumers = new jsmconsumer_api_1.ConsumerAPIImpl(nc, opts);
        this.direct = new DirectStreamAPIImpl(nc, opts);
      }
      getAccountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
          const r = yield this._request(`${this.prefix}.INFO`);
          return r;
        });
      }
      jetstream() {
        return this.nc.jetstream(this.getOptions());
      }
      advisories() {
        const iter = new queued_iterator_1.QueuedIteratorImpl();
        this.nc.subscribe(`$JS.EVENT.ADVISORY.>`, {
          callback: (err2, msg) => {
            if (err2) {
              throw err2;
            }
            try {
              const d = this.parseJsResponse(msg);
              const chunks = d.type.split(".");
              const kind = chunks[chunks.length - 1];
              iter.push({ kind, data: d });
            } catch (err3) {
              iter.stop(err3);
            }
          }
        });
        return iter;
      }
    };
    exports2.JetStreamManagerImpl = JetStreamManagerImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/service.js
var require_service = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/service.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServiceImpl = exports2.ServiceGroupImpl = exports2.ServiceMsgImpl = exports2.ServiceApiPrefix = void 0;
    var util_1 = require_util();
    var headers_1 = require_headers();
    var codec_1 = require_codec();
    var nuid_1 = require_nuid();
    var queued_iterator_1 = require_queued_iterator();
    var jsutil_1 = require_jsutil();
    var semver_1 = require_semver();
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    exports2.ServiceApiPrefix = "$SRV";
    var ServiceMsgImpl = class {
      constructor(msg) {
        this.msg = msg;
      }
      get data() {
        return this.msg.data;
      }
      get sid() {
        return this.msg.sid;
      }
      get subject() {
        return this.msg.subject;
      }
      get reply() {
        return this.msg.reply || "";
      }
      get headers() {
        return this.msg.headers;
      }
      respond(data, opts) {
        return this.msg.respond(data, opts);
      }
      respondError(code, description, data, opts) {
        var _a2, _b;
        opts = opts || {};
        opts.headers = opts.headers || (0, headers_1.headers)();
        (_a2 = opts.headers) === null || _a2 === void 0 ? void 0 : _a2.set(core_1.ServiceErrorCodeHeader, `${code}`);
        (_b = opts.headers) === null || _b === void 0 ? void 0 : _b.set(core_1.ServiceErrorHeader, description);
        return this.msg.respond(data, opts);
      }
      json(reviver) {
        return this.msg.json(reviver);
      }
      string() {
        return this.msg.string();
      }
    };
    exports2.ServiceMsgImpl = ServiceMsgImpl;
    var ServiceGroupImpl = class _ServiceGroupImpl {
      constructor(parent, name = "", queue = "") {
        if (name !== "") {
          validInternalToken("service group", name);
        }
        let root = "";
        if (parent instanceof ServiceImpl) {
          this.srv = parent;
          root = "";
        } else if (parent instanceof _ServiceGroupImpl) {
          const sg = parent;
          this.srv = sg.srv;
          if (queue === "" && sg.queue !== "") {
            queue = sg.queue;
          }
          root = sg.subject;
        } else {
          throw new Error("unknown ServiceGroup type");
        }
        this.subject = this.calcSubject(root, name);
        this.queue = queue;
      }
      calcSubject(root, name = "") {
        if (name === "") {
          return root;
        }
        return root !== "" ? `${root}.${name}` : name;
      }
      addEndpoint(name = "", opts) {
        opts = opts || { subject: name };
        const args = typeof opts === "function" ? { handler: opts, subject: name } : opts;
        (0, jsutil_1.validateName)("endpoint", name);
        let { subject, handler, metadata, queue } = args;
        subject = subject || name;
        queue = queue || this.queue;
        validSubjectName("endpoint subject", subject);
        subject = this.calcSubject(this.subject, subject);
        const ne = { name, subject, queue, handler, metadata };
        return this.srv._addEndpoint(ne);
      }
      addGroup(name = "", queue = "") {
        return new _ServiceGroupImpl(this, name, queue);
      }
    };
    exports2.ServiceGroupImpl = ServiceGroupImpl;
    function validSubjectName(context, subj) {
      if (subj === "") {
        throw new Error(`${context} cannot be empty`);
      }
      if (subj.indexOf(" ") !== -1) {
        throw new Error(`${context} cannot contain spaces: '${subj}'`);
      }
      const tokens = subj.split(".");
      tokens.forEach((v, idx) => {
        if (v === ">" && idx !== tokens.length - 1) {
          throw new Error(`${context} cannot have internal '>': '${subj}'`);
        }
      });
    }
    function validInternalToken(context, subj) {
      if (subj.indexOf(" ") !== -1) {
        throw new Error(`${context} cannot contain spaces: '${subj}'`);
      }
      const tokens = subj.split(".");
      tokens.forEach((v) => {
        if (v === ">") {
          throw new Error(`${context} name cannot contain internal '>': '${subj}'`);
        }
      });
    }
    var ServiceImpl = class _ServiceImpl {
      /**
       * @param verb
       * @param name
       * @param id
       * @param prefix - this is only supplied by tooling when building control subject that crosses an account
       */
      static controlSubject(verb, name = "", id = "", prefix) {
        const pre = prefix !== null && prefix !== void 0 ? prefix : exports2.ServiceApiPrefix;
        if (name === "" && id === "") {
          return `${pre}.${verb}`;
        }
        (0, jsutil_1.validateName)("control subject name", name);
        if (id !== "") {
          (0, jsutil_1.validateName)("control subject id", id);
          return `${pre}.${verb}.${name}.${id}`;
        }
        return `${pre}.${verb}.${name}`;
      }
      constructor(nc, config2 = { name: "", version: "" }) {
        this.nc = nc;
        this.config = Object.assign({}, config2);
        if (!this.config.queue) {
          this.config.queue = "q";
        }
        (0, jsutil_1.validateName)("name", this.config.name);
        (0, jsutil_1.validateName)("queue", this.config.queue);
        (0, semver_1.parseSemVer)(this.config.version);
        this._id = nuid_1.nuid.next();
        this.internal = [];
        this._done = (0, util_1.deferred)();
        this._stopped = false;
        this.handlers = [];
        this.started = (/* @__PURE__ */ new Date()).toISOString();
        this.reset();
        this.nc.closed().then(() => {
          this.close().catch();
        }).catch((err2) => {
          this.close(err2).catch();
        });
      }
      get subjects() {
        return this.handlers.filter((s) => {
          return s.internal === false;
        }).map((s) => {
          return s.subject;
        });
      }
      get id() {
        return this._id;
      }
      get name() {
        return this.config.name;
      }
      get description() {
        var _a2;
        return (_a2 = this.config.description) !== null && _a2 !== void 0 ? _a2 : "";
      }
      get version() {
        return this.config.version;
      }
      get metadata() {
        return this.config.metadata;
      }
      errorToHeader(err2) {
        const h2 = (0, headers_1.headers)();
        if (err2 instanceof core_1.ServiceError) {
          const se = err2;
          h2.set(core_1.ServiceErrorHeader, se.message);
          h2.set(core_1.ServiceErrorCodeHeader, `${se.code}`);
        } else {
          h2.set(core_1.ServiceErrorHeader, err2.message);
          h2.set(core_1.ServiceErrorCodeHeader, "500");
        }
        return h2;
      }
      setupHandler(h2, internal = false) {
        const queue = internal ? "" : h2.queue ? h2.queue : this.config.queue;
        const { name, subject, handler } = h2;
        const sv = h2;
        sv.internal = internal;
        if (internal) {
          this.internal.push(sv);
        }
        sv.stats = new NamedEndpointStatsImpl(name, subject, queue);
        sv.queue = queue;
        const callback = handler ? (err2, msg) => {
          if (err2) {
            this.close(err2);
            return;
          }
          const start = Date.now();
          try {
            handler(err2, new ServiceMsgImpl(msg));
          } catch (err3) {
            sv.stats.countError(err3);
            msg === null || msg === void 0 ? void 0 : msg.respond(encoders_1.Empty, { headers: this.errorToHeader(err3) });
          } finally {
            sv.stats.countLatency(start);
          }
        } : void 0;
        sv.sub = this.nc.subscribe(subject, {
          callback,
          queue
        });
        sv.sub.closed.then(() => {
          if (!this._stopped) {
            this.close(new Error(`required subscription ${h2.subject} stopped`)).catch();
          }
        }).catch((err2) => {
          if (!this._stopped) {
            const ne = new Error(`required subscription ${h2.subject} errored: ${err2.message}`);
            ne.stack = err2.stack;
            this.close(ne).catch();
          }
        });
        return sv;
      }
      info() {
        return {
          type: core_1.ServiceResponseType.INFO,
          name: this.name,
          id: this.id,
          version: this.version,
          description: this.description,
          metadata: this.metadata,
          endpoints: this.endpoints()
        };
      }
      endpoints() {
        return this.handlers.map((v) => {
          const { subject, metadata, name, queue } = v;
          return { subject, metadata, name, queue_group: queue };
        });
      }
      stats() {
        return __awaiter(this, void 0, void 0, function* () {
          const endpoints = [];
          for (const h2 of this.handlers) {
            if (typeof this.config.statsHandler === "function") {
              try {
                h2.stats.data = yield this.config.statsHandler(h2);
              } catch (err2) {
                h2.stats.countError(err2);
              }
            }
            endpoints.push(h2.stats.stats(h2.qi));
          }
          return {
            type: core_1.ServiceResponseType.STATS,
            name: this.name,
            id: this.id,
            version: this.version,
            started: this.started,
            metadata: this.metadata,
            endpoints
          };
        });
      }
      addInternalHandler(verb, handler) {
        const v = `${verb}`.toUpperCase();
        this._doAddInternalHandler(`${v}-all`, verb, handler);
        this._doAddInternalHandler(`${v}-kind`, verb, handler, this.name);
        this._doAddInternalHandler(`${v}`, verb, handler, this.name, this.id);
      }
      _doAddInternalHandler(name, verb, handler, kind = "", id = "") {
        const endpoint = {};
        endpoint.name = name;
        endpoint.subject = _ServiceImpl.controlSubject(verb, kind, id);
        endpoint.handler = handler;
        this.setupHandler(endpoint, true);
      }
      start() {
        const jc = (0, codec_1.JSONCodec)();
        const statsHandler = (err2, msg) => {
          if (err2) {
            this.close(err2);
            return Promise.reject(err2);
          }
          return this.stats().then((s) => {
            msg === null || msg === void 0 ? void 0 : msg.respond(jc.encode(s));
            return Promise.resolve();
          });
        };
        const infoHandler = (err2, msg) => {
          if (err2) {
            this.close(err2);
            return Promise.reject(err2);
          }
          msg === null || msg === void 0 ? void 0 : msg.respond(jc.encode(this.info()));
          return Promise.resolve();
        };
        const ping = jc.encode(this.ping());
        const pingHandler = (err2, msg) => {
          if (err2) {
            this.close(err2).then().catch();
            return Promise.reject(err2);
          }
          msg.respond(ping);
          return Promise.resolve();
        };
        this.addInternalHandler(core_1.ServiceVerb.PING, pingHandler);
        this.addInternalHandler(core_1.ServiceVerb.STATS, statsHandler);
        this.addInternalHandler(core_1.ServiceVerb.INFO, infoHandler);
        this.handlers.forEach((h2) => {
          const { subject } = h2;
          if (typeof subject !== "string") {
            return;
          }
          if (h2.handler === null) {
            return;
          }
          this.setupHandler(h2);
        });
        return Promise.resolve(this);
      }
      close(err2) {
        if (this._stopped) {
          return this._done;
        }
        this._stopped = true;
        let buf = [];
        if (!this.nc.isClosed()) {
          buf = this.handlers.concat(this.internal).map((h2) => {
            return h2.sub.drain();
          });
        }
        Promise.allSettled(buf).then(() => {
          this._done.resolve(err2 ? err2 : null);
        });
        return this._done;
      }
      get stopped() {
        return this._done;
      }
      get isStopped() {
        return this._stopped;
      }
      stop(err2) {
        return this.close(err2);
      }
      ping() {
        return {
          type: core_1.ServiceResponseType.PING,
          name: this.name,
          id: this.id,
          version: this.version,
          metadata: this.metadata
        };
      }
      reset() {
        this.started = (/* @__PURE__ */ new Date()).toISOString();
        if (this.handlers) {
          for (const h2 of this.handlers) {
            h2.stats.reset(h2.qi);
          }
        }
      }
      addGroup(name, queue) {
        return new ServiceGroupImpl(this, name, queue);
      }
      addEndpoint(name, handler) {
        const sg = new ServiceGroupImpl(this);
        return sg.addEndpoint(name, handler);
      }
      _addEndpoint(e) {
        const qi = new queued_iterator_1.QueuedIteratorImpl();
        qi.noIterator = typeof e.handler === "function";
        if (!qi.noIterator) {
          e.handler = (err2, msg) => {
            err2 ? this.stop(err2).catch() : qi.push(new ServiceMsgImpl(msg));
          };
          qi.iterClosed.then(() => {
            this.close().catch();
          });
        }
        const ss = this.setupHandler(e, false);
        ss.qi = qi;
        this.handlers.push(ss);
        return qi;
      }
    };
    exports2.ServiceImpl = ServiceImpl;
    var NamedEndpointStatsImpl = class {
      constructor(name, subject, queue = "") {
        this.name = name;
        this.subject = subject;
        this.average_processing_time = 0;
        this.num_errors = 0;
        this.num_requests = 0;
        this.processing_time = 0;
        this.queue = queue;
      }
      reset(qi) {
        this.num_requests = 0;
        this.processing_time = 0;
        this.average_processing_time = 0;
        this.num_errors = 0;
        this.last_error = void 0;
        this.data = void 0;
        const qii = qi;
        if (qii) {
          qii.time = 0;
          qii.processed = 0;
        }
      }
      countLatency(start) {
        this.num_requests++;
        this.processing_time += (0, util_1.nanos)(Date.now() - start);
        this.average_processing_time = Math.round(this.processing_time / this.num_requests);
      }
      countError(err2) {
        this.num_errors++;
        this.last_error = err2.message;
      }
      _stats() {
        const { name, subject, average_processing_time, num_errors, num_requests, processing_time, last_error, data, queue } = this;
        return {
          name,
          subject,
          average_processing_time,
          num_errors,
          num_requests,
          processing_time,
          last_error,
          data,
          queue_group: queue
        };
      }
      stats(qi) {
        const qii = qi;
        if ((qii === null || qii === void 0 ? void 0 : qii.noIterator) === false) {
          this.processing_time = (0, util_1.nanos)(qii.time);
          this.num_requests = qii.processed;
          this.average_processing_time = this.processing_time > 0 && this.num_requests > 0 ? this.processing_time / this.num_requests : 0;
        }
        return this._stats();
      }
    };
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/serviceclient.js
var require_serviceclient = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/serviceclient.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServiceClientImpl = void 0;
    var encoders_1 = require_encoders();
    var codec_1 = require_codec();
    var queued_iterator_1 = require_queued_iterator();
    var core_1 = require_core();
    var service_1 = require_service();
    var core_2 = require_core();
    var ServiceClientImpl = class {
      constructor(nc, opts = {
        strategy: core_2.RequestStrategy.JitterTimer,
        maxWait: 2e3
      }, prefix) {
        this.nc = nc;
        this.prefix = prefix;
        this.opts = opts;
      }
      ping(name = "", id = "") {
        return this.q(core_1.ServiceVerb.PING, name, id);
      }
      stats(name = "", id = "") {
        return this.q(core_1.ServiceVerb.STATS, name, id);
      }
      info(name = "", id = "") {
        return this.q(core_1.ServiceVerb.INFO, name, id);
      }
      q(v_1) {
        return __awaiter(this, arguments, void 0, function* (v, name = "", id = "") {
          const iter = new queued_iterator_1.QueuedIteratorImpl();
          const jc = (0, codec_1.JSONCodec)();
          const subj = service_1.ServiceImpl.controlSubject(v, name, id, this.prefix);
          const responses = yield this.nc.requestMany(subj, encoders_1.Empty, this.opts);
          (() => __awaiter(this, void 0, void 0, function* () {
            var _a2, e_1, _b, _c;
            try {
              for (var _d2 = true, responses_1 = __asyncValues(responses), responses_1_1; responses_1_1 = yield responses_1.next(), _a2 = responses_1_1.done, !_a2; _d2 = true) {
                _c = responses_1_1.value;
                _d2 = false;
                const m = _c;
                try {
                  const s = jc.decode(m.data);
                  iter.push(s);
                } catch (err2) {
                  iter.push(() => {
                    iter.stop(err2);
                  });
                }
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (!_d2 && !_a2 && (_b = responses_1.return)) yield _b.call(responses_1);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
            iter.push(() => {
              iter.stop();
            });
          }))().catch((err2) => {
            iter.stop(err2);
          });
          return iter;
        });
      }
    };
    exports2.ServiceClientImpl = ServiceClientImpl;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/nats.js
var require_nats = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/nats.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServicesFactory = exports2.NatsConnectionImpl = void 0;
    var util_1 = require_util();
    var protocol_1 = require_protocol();
    var encoders_1 = require_encoders();
    var types_1 = require_types();
    var semver_1 = require_semver();
    var options_1 = require_options();
    var queued_iterator_1 = require_queued_iterator();
    var request_1 = require_request();
    var msg_1 = require_msg();
    var jsm_1 = require_jsm();
    var jsclient_1 = require_jsclient();
    var service_1 = require_service();
    var serviceclient_1 = require_serviceclient();
    var core_1 = require_core();
    var NatsConnectionImpl = class _NatsConnectionImpl {
      constructor(opts) {
        this.draining = false;
        this.options = (0, options_1.parseOptions)(opts);
        this.listeners = [];
      }
      static connect(opts = {}) {
        return new Promise((resolve, reject) => {
          const nc = new _NatsConnectionImpl(opts);
          protocol_1.ProtocolHandler.connect(nc.options, nc).then((ph) => {
            nc.protocol = ph;
            (function() {
              return __awaiter(this, void 0, void 0, function* () {
                var _a2, e_1, _b, _c;
                try {
                  for (var _d2 = true, _e = __asyncValues(ph.status()), _f; _f = yield _e.next(), _a2 = _f.done, !_a2; _d2 = true) {
                    _c = _f.value;
                    _d2 = false;
                    const s = _c;
                    nc.listeners.forEach((l) => {
                      l.push(s);
                    });
                  }
                } catch (e_1_1) {
                  e_1 = { error: e_1_1 };
                } finally {
                  try {
                    if (!_d2 && !_a2 && (_b = _e.return)) yield _b.call(_e);
                  } finally {
                    if (e_1) throw e_1.error;
                  }
                }
              });
            })();
            resolve(nc);
          }).catch((err2) => {
            reject(err2);
          });
        });
      }
      closed() {
        return this.protocol.closed;
      }
      close() {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.protocol.close();
        });
      }
      _check(subject, sub, pub) {
        if (this.isClosed()) {
          throw types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionClosed);
        }
        if (sub && this.isDraining()) {
          throw types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionDraining);
        }
        if (pub && this.protocol.noMorePublishing) {
          throw types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionDraining);
        }
        subject = subject || "";
        if (subject.length === 0) {
          throw types_1.NatsError.errorForCode(core_1.ErrorCode.BadSubject);
        }
      }
      publish(subject, data, options) {
        this._check(subject, false, true);
        this.protocol.publish(subject, data, options);
      }
      publishMessage(msg) {
        return this.publish(msg.subject, msg.data, {
          reply: msg.reply,
          headers: msg.headers
        });
      }
      respondMessage(msg) {
        if (msg.reply) {
          this.publish(msg.reply, msg.data, {
            reply: msg.reply,
            headers: msg.headers
          });
          return true;
        }
        return false;
      }
      subscribe(subject, opts = {}) {
        this._check(subject, true, false);
        const sub = new protocol_1.SubscriptionImpl(this.protocol, subject, opts);
        this.protocol.subscribe(sub);
        return sub;
      }
      _resub(s, subject, max) {
        this._check(subject, true, false);
        const si = s;
        si.max = max;
        if (max) {
          si.max = max + si.received;
        }
        this.protocol.resub(si, subject);
      }
      // possibilities are:
      // stop on error or any non-100 status
      // AND:
      // - wait for timer
      // - wait for n messages or timer
      // - wait for unknown messages, done when empty or reset timer expires (with possible alt wait)
      // - wait for unknown messages, done when an empty payload is received or timer expires (with possible alt wait)
      requestMany(subject, data = encoders_1.Empty, opts = { maxWait: 1e3, maxMessages: -1 }) {
        const asyncTraces = !(this.protocol.options.noAsyncTraces || false);
        try {
          this._check(subject, true, true);
        } catch (err2) {
          return Promise.reject(err2);
        }
        opts.strategy = opts.strategy || core_1.RequestStrategy.Timer;
        opts.maxWait = opts.maxWait || 1e3;
        if (opts.maxWait < 1) {
          return Promise.reject(new types_1.NatsError("timeout", core_1.ErrorCode.InvalidOption));
        }
        const qi = new queued_iterator_1.QueuedIteratorImpl();
        function stop(err2) {
          qi.push(() => {
            qi.stop(err2);
          });
        }
        function callback(err2, msg) {
          if (err2 || msg === null) {
            stop(err2 === null ? void 0 : err2);
          } else {
            qi.push(msg);
          }
        }
        if (opts.noMux) {
          const stack = asyncTraces ? new Error().stack : null;
          let max = typeof opts.maxMessages === "number" && opts.maxMessages > 0 ? opts.maxMessages : -1;
          const sub = this.subscribe((0, core_1.createInbox)(this.options.inboxPrefix), {
            callback: (err2, msg) => {
              var _a2, _b;
              if (((_a2 = msg === null || msg === void 0 ? void 0 : msg.data) === null || _a2 === void 0 ? void 0 : _a2.length) === 0 && ((_b = msg === null || msg === void 0 ? void 0 : msg.headers) === null || _b === void 0 ? void 0 : _b.status) === core_1.ErrorCode.NoResponders) {
                err2 = types_1.NatsError.errorForCode(core_1.ErrorCode.NoResponders);
              }
              if (err2) {
                if (stack) {
                  err2.stack += `

${stack}`;
                }
                cancel(err2);
                return;
              }
              callback(null, msg);
              if (opts.strategy === core_1.RequestStrategy.Count) {
                max--;
                if (max === 0) {
                  cancel();
                }
              }
              if (opts.strategy === core_1.RequestStrategy.JitterTimer) {
                clearTimers();
                timer = setTimeout(() => {
                  cancel();
                }, 300);
              }
              if (opts.strategy === core_1.RequestStrategy.SentinelMsg) {
                if (msg && msg.data.length === 0) {
                  cancel();
                }
              }
            }
          });
          sub.requestSubject = subject;
          sub.closed.then(() => {
            stop();
          }).catch((err2) => {
            qi.stop(err2);
          });
          const cancel = (err2) => {
            if (err2) {
              qi.push(() => {
                throw err2;
              });
            }
            clearTimers();
            sub.drain().then(() => {
              stop();
            }).catch((_err) => {
              stop();
            });
          };
          qi.iterClosed.then(() => {
            clearTimers();
            sub === null || sub === void 0 ? void 0 : sub.unsubscribe();
          }).catch((_err) => {
            clearTimers();
            sub === null || sub === void 0 ? void 0 : sub.unsubscribe();
          });
          try {
            this.publish(subject, data, { reply: sub.getSubject() });
          } catch (err2) {
            cancel(err2);
          }
          let timer = setTimeout(() => {
            cancel();
          }, opts.maxWait);
          const clearTimers = () => {
            if (timer) {
              clearTimeout(timer);
            }
          };
        } else {
          const rmo = opts;
          rmo.callback = callback;
          qi.iterClosed.then(() => {
            r.cancel();
          }).catch((err2) => {
            r.cancel(err2);
          });
          const r = new request_1.RequestMany(this.protocol.muxSubscriptions, subject, rmo);
          this.protocol.request(r);
          try {
            this.publish(subject, data, {
              reply: `${this.protocol.muxSubscriptions.baseInbox}${r.token}`,
              headers: opts.headers
            });
          } catch (err2) {
            r.cancel(err2);
          }
        }
        return Promise.resolve(qi);
      }
      request(subject, data, opts = { timeout: 1e3, noMux: false }) {
        try {
          this._check(subject, true, true);
        } catch (err2) {
          return Promise.reject(err2);
        }
        const asyncTraces = !(this.protocol.options.noAsyncTraces || false);
        opts.timeout = opts.timeout || 1e3;
        if (opts.timeout < 1) {
          return Promise.reject(new types_1.NatsError("timeout", core_1.ErrorCode.InvalidOption));
        }
        if (!opts.noMux && opts.reply) {
          return Promise.reject(new types_1.NatsError("reply can only be used with noMux", core_1.ErrorCode.InvalidOption));
        }
        if (opts.noMux) {
          const inbox = opts.reply ? opts.reply : (0, core_1.createInbox)(this.options.inboxPrefix);
          const d = (0, util_1.deferred)();
          const errCtx = asyncTraces ? new Error() : null;
          const sub = this.subscribe(inbox, {
            max: 1,
            timeout: opts.timeout,
            callback: (err2, msg) => {
              if (err2) {
                if (errCtx && err2.code !== core_1.ErrorCode.Timeout) {
                  err2.stack += `

${errCtx.stack}`;
                }
                sub.unsubscribe();
                d.reject(err2);
              } else {
                err2 = (0, msg_1.isRequestError)(msg);
                if (err2) {
                  if (errCtx) {
                    err2.stack += `

${errCtx.stack}`;
                  }
                  d.reject(err2);
                } else {
                  d.resolve(msg);
                }
              }
            }
          });
          sub.requestSubject = subject;
          this.protocol.publish(subject, data, {
            reply: inbox,
            headers: opts.headers
          });
          return d;
        } else {
          const r = new request_1.RequestOne(this.protocol.muxSubscriptions, subject, opts, asyncTraces);
          this.protocol.request(r);
          try {
            this.publish(subject, data, {
              reply: `${this.protocol.muxSubscriptions.baseInbox}${r.token}`,
              headers: opts.headers
            });
          } catch (err2) {
            r.cancel(err2);
          }
          const p = Promise.race([r.timer, r.deferred]);
          p.catch(() => {
            r.cancel();
          });
          return p;
        }
      }
      /** *
       * Flushes to the server. Promise resolves when round-trip completes.
       * @returns {Promise<void>}
       */
      flush() {
        if (this.isClosed()) {
          return Promise.reject(types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionClosed));
        }
        return this.protocol.flush();
      }
      drain() {
        if (this.isClosed()) {
          return Promise.reject(types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionClosed));
        }
        if (this.isDraining()) {
          return Promise.reject(types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionDraining));
        }
        this.draining = true;
        return this.protocol.drain();
      }
      isClosed() {
        return this.protocol.isClosed();
      }
      isDraining() {
        return this.draining;
      }
      getServer() {
        const srv = this.protocol.getServer();
        return srv ? srv.listen : "";
      }
      status() {
        const iter = new queued_iterator_1.QueuedIteratorImpl();
        iter.iterClosed.then(() => {
          const idx = this.listeners.indexOf(iter);
          this.listeners.splice(idx, 1);
        });
        this.listeners.push(iter);
        return iter;
      }
      get info() {
        return this.protocol.isClosed() ? void 0 : this.protocol.info;
      }
      context() {
        return __awaiter(this, void 0, void 0, function* () {
          const r = yield this.request(`$SYS.REQ.USER.INFO`);
          return r.json((key, value) => {
            if (key === "time") {
              return new Date(Date.parse(value));
            }
            return value;
          });
        });
      }
      stats() {
        return {
          inBytes: this.protocol.inBytes,
          outBytes: this.protocol.outBytes,
          inMsgs: this.protocol.inMsgs,
          outMsgs: this.protocol.outMsgs
        };
      }
      jetstreamManager() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
          const adm = new jsm_1.JetStreamManagerImpl(this, opts);
          if (opts.checkAPI !== false) {
            try {
              yield adm.getAccountInfo();
            } catch (err2) {
              const ne = err2;
              if (ne.code === core_1.ErrorCode.NoResponders) {
                ne.code = core_1.ErrorCode.JetStreamNotEnabled;
              }
              throw ne;
            }
          }
          return adm;
        });
      }
      jetstream(opts = {}) {
        return new jsclient_1.JetStreamClientImpl(this, opts);
      }
      getServerVersion() {
        const info = this.info;
        return info ? (0, semver_1.parseSemVer)(info.version) : void 0;
      }
      rtt() {
        return __awaiter(this, void 0, void 0, function* () {
          if (!this.protocol._closed && !this.protocol.connected) {
            throw types_1.NatsError.errorForCode(core_1.ErrorCode.Disconnect);
          }
          const start = Date.now();
          yield this.flush();
          return Date.now() - start;
        });
      }
      get features() {
        return this.protocol.features;
      }
      get services() {
        if (!this._services) {
          this._services = new ServicesFactory(this);
        }
        return this._services;
      }
      reconnect() {
        if (this.isClosed()) {
          return Promise.reject(types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionClosed));
        }
        if (this.isDraining()) {
          return Promise.reject(types_1.NatsError.errorForCode(core_1.ErrorCode.ConnectionDraining));
        }
        return this.protocol.reconnect();
      }
    };
    exports2.NatsConnectionImpl = NatsConnectionImpl;
    var ServicesFactory = class {
      constructor(nc) {
        this.nc = nc;
      }
      add(config2) {
        try {
          const s = new service_1.ServiceImpl(this.nc, config2);
          return s.start();
        } catch (err2) {
          return Promise.reject(err2);
        }
      }
      client(opts, prefix) {
        return new serviceclient_1.ServiceClientImpl(this.nc, opts, prefix);
      }
    };
    exports2.ServicesFactory = ServicesFactory;
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/bench.js
var require_bench = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/bench.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports2 && exports2.__asyncValues || function(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Bench = exports2.Metric = void 0;
    exports2.throughput = throughput;
    exports2.msgThroughput = msgThroughput;
    exports2.humanizeBytes = humanizeBytes;
    var types_1 = require_types();
    var nuid_1 = require_nuid();
    var util_1 = require_util();
    var core_1 = require_core();
    var Metric = class {
      constructor(name, duration) {
        this.name = name;
        this.duration = duration;
        this.date = Date.now();
        this.payload = 0;
        this.msgs = 0;
        this.bytes = 0;
      }
      toString() {
        const sec = this.duration / 1e3;
        const mps = Math.round(this.msgs / sec);
        const label = this.asyncRequests ? "asyncRequests" : "";
        let minmax = "";
        if (this.max) {
          minmax = `${this.min}/${this.max}`;
        }
        return `${this.name}${label ? " [asyncRequests]" : ""} ${humanizeNumber(mps)} msgs/sec - [${sec.toFixed(2)} secs] ~ ${throughput(this.bytes, sec)} ${minmax}`;
      }
      toCsv() {
        return `"${this.name}",${new Date(this.date).toISOString()},${this.lang},${this.version},${this.msgs},${this.payload},${this.bytes},${this.duration},${this.asyncRequests ? this.asyncRequests : false}
`;
      }
      static header() {
        return `Test,Date,Lang,Version,Count,MsgPayload,Bytes,Millis,Async
`;
      }
    };
    exports2.Metric = Metric;
    var Bench = class {
      constructor(nc, opts = {
        msgs: 1e5,
        size: 128,
        subject: "",
        asyncRequests: false,
        pub: false,
        sub: false,
        req: false,
        rep: false
      }) {
        this.nc = nc;
        this.callbacks = opts.callbacks || false;
        this.msgs = opts.msgs || 0;
        this.size = opts.size || 0;
        this.subject = opts.subject || nuid_1.nuid.next();
        this.asyncRequests = opts.asyncRequests || false;
        this.pub = opts.pub || false;
        this.sub = opts.sub || false;
        this.req = opts.req || false;
        this.rep = opts.rep || false;
        this.perf = new util_1.Perf();
        this.payload = this.size ? new Uint8Array(this.size) : types_1.Empty;
        if (!this.pub && !this.sub && !this.req && !this.rep) {
          throw new Error("no bench option selected");
        }
      }
      run() {
        return __awaiter(this, void 0, void 0, function* () {
          this.nc.closed().then((err2) => {
            if (err2) {
              throw new core_1.NatsError(`bench closed with an error: ${err2.message}`, core_1.ErrorCode.Unknown, err2);
            }
          });
          if (this.callbacks) {
            yield this.runCallbacks();
          } else {
            yield this.runAsync();
          }
          return this.processMetrics();
        });
      }
      processMetrics() {
        const nc = this.nc;
        const { lang, version } = nc.protocol.transport;
        if (this.pub && this.sub) {
          this.perf.measure("pubsub", "pubStart", "subStop");
        }
        if (this.req && this.rep) {
          this.perf.measure("reqrep", "reqStart", "reqStop");
        }
        const measures = this.perf.getEntries();
        const pubsub = measures.find((m) => m.name === "pubsub");
        const reqrep = measures.find((m) => m.name === "reqrep");
        const req = measures.find((m) => m.name === "req");
        const rep = measures.find((m) => m.name === "rep");
        const pub = measures.find((m) => m.name === "pub");
        const sub = measures.find((m) => m.name === "sub");
        const stats = this.nc.stats();
        const metrics = [];
        if (pubsub) {
          const { name, duration } = pubsub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs * 2;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (reqrep) {
          const { name, duration } = reqrep;
          const m = new Metric(name, duration);
          m.msgs = this.msgs * 2;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (pub) {
          const { name, duration } = pub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (sub) {
          const { name, duration } = sub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (rep) {
          const { name, duration } = rep;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (req) {
          const { name, duration } = req;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        return metrics;
      }
      runCallbacks() {
        return __awaiter(this, void 0, void 0, function* () {
          const jobs = [];
          if (this.sub) {
            const d = (0, util_1.deferred)();
            jobs.push(d);
            let i = 0;
            this.nc.subscribe(this.subject, {
              max: this.msgs,
              callback: () => {
                i++;
                if (i === 1) {
                  this.perf.mark("subStart");
                }
                if (i === this.msgs) {
                  this.perf.mark("subStop");
                  this.perf.measure("sub", "subStart", "subStop");
                  d.resolve();
                }
              }
            });
          }
          if (this.rep) {
            const d = (0, util_1.deferred)();
            jobs.push(d);
            let i = 0;
            this.nc.subscribe(this.subject, {
              max: this.msgs,
              callback: (_, m) => {
                m.respond(this.payload);
                i++;
                if (i === 1) {
                  this.perf.mark("repStart");
                }
                if (i === this.msgs) {
                  this.perf.mark("repStop");
                  this.perf.measure("rep", "repStart", "repStop");
                  d.resolve();
                }
              }
            });
          }
          if (this.pub) {
            const job = (() => __awaiter(this, void 0, void 0, function* () {
              this.perf.mark("pubStart");
              for (let i = 0; i < this.msgs; i++) {
                this.nc.publish(this.subject, this.payload);
              }
              yield this.nc.flush();
              this.perf.mark("pubStop");
              this.perf.measure("pub", "pubStart", "pubStop");
            }))();
            jobs.push(job);
          }
          if (this.req) {
            const job = (() => __awaiter(this, void 0, void 0, function* () {
              if (this.asyncRequests) {
                this.perf.mark("reqStart");
                const a = [];
                for (let i = 0; i < this.msgs; i++) {
                  a.push(this.nc.request(this.subject, this.payload, { timeout: 2e4 }));
                }
                yield Promise.all(a);
                this.perf.mark("reqStop");
                this.perf.measure("req", "reqStart", "reqStop");
              } else {
                this.perf.mark("reqStart");
                for (let i = 0; i < this.msgs; i++) {
                  yield this.nc.request(this.subject);
                }
                this.perf.mark("reqStop");
                this.perf.measure("req", "reqStart", "reqStop");
              }
            }))();
            jobs.push(job);
          }
          yield Promise.all(jobs);
        });
      }
      runAsync() {
        return __awaiter(this, void 0, void 0, function* () {
          const jobs = [];
          if (this.rep) {
            let first = false;
            const sub = this.nc.subscribe(this.subject, { max: this.msgs });
            const job = (() => __awaiter(this, void 0, void 0, function* () {
              var _a2, e_1, _b, _c;
              try {
                for (var _d2 = true, sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = yield sub_1.next(), _a2 = sub_1_1.done, !_a2; _d2 = true) {
                  _c = sub_1_1.value;
                  _d2 = false;
                  const m = _c;
                  if (!first) {
                    this.perf.mark("repStart");
                    first = true;
                  }
                  m.respond(this.payload);
                }
              } catch (e_1_1) {
                e_1 = { error: e_1_1 };
              } finally {
                try {
                  if (!_d2 && !_a2 && (_b = sub_1.return)) yield _b.call(sub_1);
                } finally {
                  if (e_1) throw e_1.error;
                }
              }
              yield this.nc.flush();
              this.perf.mark("repStop");
              this.perf.measure("rep", "repStart", "repStop");
            }))();
            jobs.push(job);
          }
          if (this.sub) {
            let first = false;
            const sub = this.nc.subscribe(this.subject, { max: this.msgs });
            const job = (() => __awaiter(this, void 0, void 0, function* () {
              var _a2, e_2, _b, _c;
              try {
                for (var _d2 = true, sub_2 = __asyncValues(sub), sub_2_1; sub_2_1 = yield sub_2.next(), _a2 = sub_2_1.done, !_a2; _d2 = true) {
                  _c = sub_2_1.value;
                  _d2 = false;
                  const _m = _c;
                  if (!first) {
                    this.perf.mark("subStart");
                    first = true;
                  }
                }
              } catch (e_2_1) {
                e_2 = { error: e_2_1 };
              } finally {
                try {
                  if (!_d2 && !_a2 && (_b = sub_2.return)) yield _b.call(sub_2);
                } finally {
                  if (e_2) throw e_2.error;
                }
              }
              this.perf.mark("subStop");
              this.perf.measure("sub", "subStart", "subStop");
            }))();
            jobs.push(job);
          }
          if (this.pub) {
            const job = (() => __awaiter(this, void 0, void 0, function* () {
              this.perf.mark("pubStart");
              for (let i = 0; i < this.msgs; i++) {
                this.nc.publish(this.subject, this.payload);
              }
              yield this.nc.flush();
              this.perf.mark("pubStop");
              this.perf.measure("pub", "pubStart", "pubStop");
            }))();
            jobs.push(job);
          }
          if (this.req) {
            const job = (() => __awaiter(this, void 0, void 0, function* () {
              if (this.asyncRequests) {
                this.perf.mark("reqStart");
                const a = [];
                for (let i = 0; i < this.msgs; i++) {
                  a.push(this.nc.request(this.subject, this.payload, { timeout: 2e4 }));
                }
                yield Promise.all(a);
                this.perf.mark("reqStop");
                this.perf.measure("req", "reqStart", "reqStop");
              } else {
                this.perf.mark("reqStart");
                for (let i = 0; i < this.msgs; i++) {
                  yield this.nc.request(this.subject);
                }
                this.perf.mark("reqStop");
                this.perf.measure("req", "reqStart", "reqStop");
              }
            }))();
            jobs.push(job);
          }
          yield Promise.all(jobs);
        });
      }
    };
    exports2.Bench = Bench;
    function throughput(bytes, seconds) {
      return `${humanizeBytes(bytes / seconds)}/sec`;
    }
    function msgThroughput(msgs, seconds) {
      return `${Math.floor(msgs / seconds)} msgs/sec`;
    }
    function humanizeBytes(bytes, si = false) {
      const base = si ? 1e3 : 1024;
      const pre = si ? ["k", "M", "G", "T", "P", "E"] : ["K", "M", "G", "T", "P", "E"];
      const post = si ? "iB" : "B";
      if (bytes < base) {
        return `${bytes.toFixed(2)} ${post}`;
      }
      const exp = parseInt(Math.log(bytes) / Math.log(base) + "");
      const index = parseInt(exp - 1 + "");
      return `${(bytes / Math.pow(base, exp)).toFixed(2)} ${pre[index]}${post}`;
    }
    function humanizeNumber(n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/internal_mod.js
var require_internal_mod = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/nats-base-client/internal_mod.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parseIP = exports2.isIP = exports2.TE = exports2.TD = exports2.Metric = exports2.Bench = exports2.writeAll = exports2.readAll = exports2.MAX_SIZE = exports2.DenoBuffer = exports2.State = exports2.Parser = exports2.Kind = exports2.QueuedIteratorImpl = exports2.StringCodec = exports2.JSONCodec = exports2.usernamePasswordAuthenticator = exports2.tokenAuthenticator = exports2.nkeyAuthenticator = exports2.jwtAuthenticator = exports2.credsAuthenticator = exports2.RequestOne = exports2.checkUnsupportedOption = exports2.checkOptions = exports2.buildAuthenticator = exports2.DataBuffer = exports2.MuxSubscription = exports2.Heartbeat = exports2.MsgHdrsImpl = exports2.headers = exports2.canonicalMIMEHeaderKey = exports2.timeout = exports2.render = exports2.nanos = exports2.millis = exports2.extend = exports2.delay = exports2.deferred = exports2.deadline = exports2.collect = exports2.backoff = exports2.ProtocolHandler = exports2.INFO = exports2.Connect = exports2.setTransportFactory = exports2.getResolveFn = exports2.MsgImpl = exports2.nuid = exports2.Nuid = exports2.NatsConnectionImpl = void 0;
    exports2.Subscriptions = exports2.SubscriptionImpl = exports2.syncIterator = exports2.ServiceVerb = exports2.ServiceResponseType = exports2.ServiceErrorHeader = exports2.ServiceErrorCodeHeader = exports2.ServiceError = exports2.RequestStrategy = exports2.NatsError = exports2.Match = exports2.isNatsError = exports2.Events = exports2.ErrorCode = exports2.DebugEvents = exports2.createInbox = exports2.extractProtocolMessage = exports2.Empty = exports2.parseSemVer = exports2.compare = exports2.NoopKvCodecs = exports2.defaultBucketOpts = exports2.Bucket = exports2.Base64KeyCodec = exports2.TypedSubscription = void 0;
    var nats_1 = require_nats();
    Object.defineProperty(exports2, "NatsConnectionImpl", { enumerable: true, get: function() {
      return nats_1.NatsConnectionImpl;
    } });
    var nuid_1 = require_nuid();
    Object.defineProperty(exports2, "Nuid", { enumerable: true, get: function() {
      return nuid_1.Nuid;
    } });
    Object.defineProperty(exports2, "nuid", { enumerable: true, get: function() {
      return nuid_1.nuid;
    } });
    var msg_1 = require_msg();
    Object.defineProperty(exports2, "MsgImpl", { enumerable: true, get: function() {
      return msg_1.MsgImpl;
    } });
    var transport_1 = require_transport();
    Object.defineProperty(exports2, "getResolveFn", { enumerable: true, get: function() {
      return transport_1.getResolveFn;
    } });
    Object.defineProperty(exports2, "setTransportFactory", { enumerable: true, get: function() {
      return transport_1.setTransportFactory;
    } });
    var protocol_1 = require_protocol();
    Object.defineProperty(exports2, "Connect", { enumerable: true, get: function() {
      return protocol_1.Connect;
    } });
    Object.defineProperty(exports2, "INFO", { enumerable: true, get: function() {
      return protocol_1.INFO;
    } });
    Object.defineProperty(exports2, "ProtocolHandler", { enumerable: true, get: function() {
      return protocol_1.ProtocolHandler;
    } });
    var util_1 = require_util();
    Object.defineProperty(exports2, "backoff", { enumerable: true, get: function() {
      return util_1.backoff;
    } });
    Object.defineProperty(exports2, "collect", { enumerable: true, get: function() {
      return util_1.collect;
    } });
    Object.defineProperty(exports2, "deadline", { enumerable: true, get: function() {
      return util_1.deadline;
    } });
    Object.defineProperty(exports2, "deferred", { enumerable: true, get: function() {
      return util_1.deferred;
    } });
    Object.defineProperty(exports2, "delay", { enumerable: true, get: function() {
      return util_1.delay;
    } });
    Object.defineProperty(exports2, "extend", { enumerable: true, get: function() {
      return util_1.extend;
    } });
    Object.defineProperty(exports2, "millis", { enumerable: true, get: function() {
      return util_1.millis;
    } });
    Object.defineProperty(exports2, "nanos", { enumerable: true, get: function() {
      return util_1.nanos;
    } });
    Object.defineProperty(exports2, "render", { enumerable: true, get: function() {
      return util_1.render;
    } });
    Object.defineProperty(exports2, "timeout", { enumerable: true, get: function() {
      return util_1.timeout;
    } });
    var headers_1 = require_headers();
    Object.defineProperty(exports2, "canonicalMIMEHeaderKey", { enumerable: true, get: function() {
      return headers_1.canonicalMIMEHeaderKey;
    } });
    Object.defineProperty(exports2, "headers", { enumerable: true, get: function() {
      return headers_1.headers;
    } });
    Object.defineProperty(exports2, "MsgHdrsImpl", { enumerable: true, get: function() {
      return headers_1.MsgHdrsImpl;
    } });
    var heartbeats_1 = require_heartbeats();
    Object.defineProperty(exports2, "Heartbeat", { enumerable: true, get: function() {
      return heartbeats_1.Heartbeat;
    } });
    var muxsubscription_1 = require_muxsubscription();
    Object.defineProperty(exports2, "MuxSubscription", { enumerable: true, get: function() {
      return muxsubscription_1.MuxSubscription;
    } });
    var databuffer_1 = require_databuffer();
    Object.defineProperty(exports2, "DataBuffer", { enumerable: true, get: function() {
      return databuffer_1.DataBuffer;
    } });
    var options_1 = require_options();
    Object.defineProperty(exports2, "buildAuthenticator", { enumerable: true, get: function() {
      return options_1.buildAuthenticator;
    } });
    Object.defineProperty(exports2, "checkOptions", { enumerable: true, get: function() {
      return options_1.checkOptions;
    } });
    Object.defineProperty(exports2, "checkUnsupportedOption", { enumerable: true, get: function() {
      return options_1.checkUnsupportedOption;
    } });
    var request_1 = require_request();
    Object.defineProperty(exports2, "RequestOne", { enumerable: true, get: function() {
      return request_1.RequestOne;
    } });
    var authenticator_1 = require_authenticator();
    Object.defineProperty(exports2, "credsAuthenticator", { enumerable: true, get: function() {
      return authenticator_1.credsAuthenticator;
    } });
    Object.defineProperty(exports2, "jwtAuthenticator", { enumerable: true, get: function() {
      return authenticator_1.jwtAuthenticator;
    } });
    Object.defineProperty(exports2, "nkeyAuthenticator", { enumerable: true, get: function() {
      return authenticator_1.nkeyAuthenticator;
    } });
    Object.defineProperty(exports2, "tokenAuthenticator", { enumerable: true, get: function() {
      return authenticator_1.tokenAuthenticator;
    } });
    Object.defineProperty(exports2, "usernamePasswordAuthenticator", { enumerable: true, get: function() {
      return authenticator_1.usernamePasswordAuthenticator;
    } });
    var codec_1 = require_codec();
    Object.defineProperty(exports2, "JSONCodec", { enumerable: true, get: function() {
      return codec_1.JSONCodec;
    } });
    Object.defineProperty(exports2, "StringCodec", { enumerable: true, get: function() {
      return codec_1.StringCodec;
    } });
    __exportStar(require_nkeys2(), exports2);
    var queued_iterator_1 = require_queued_iterator();
    Object.defineProperty(exports2, "QueuedIteratorImpl", { enumerable: true, get: function() {
      return queued_iterator_1.QueuedIteratorImpl;
    } });
    var parser_1 = require_parser();
    Object.defineProperty(exports2, "Kind", { enumerable: true, get: function() {
      return parser_1.Kind;
    } });
    Object.defineProperty(exports2, "Parser", { enumerable: true, get: function() {
      return parser_1.Parser;
    } });
    Object.defineProperty(exports2, "State", { enumerable: true, get: function() {
      return parser_1.State;
    } });
    var denobuffer_1 = require_denobuffer();
    Object.defineProperty(exports2, "DenoBuffer", { enumerable: true, get: function() {
      return denobuffer_1.DenoBuffer;
    } });
    Object.defineProperty(exports2, "MAX_SIZE", { enumerable: true, get: function() {
      return denobuffer_1.MAX_SIZE;
    } });
    Object.defineProperty(exports2, "readAll", { enumerable: true, get: function() {
      return denobuffer_1.readAll;
    } });
    Object.defineProperty(exports2, "writeAll", { enumerable: true, get: function() {
      return denobuffer_1.writeAll;
    } });
    var bench_1 = require_bench();
    Object.defineProperty(exports2, "Bench", { enumerable: true, get: function() {
      return bench_1.Bench;
    } });
    Object.defineProperty(exports2, "Metric", { enumerable: true, get: function() {
      return bench_1.Metric;
    } });
    var encoders_1 = require_encoders();
    Object.defineProperty(exports2, "TD", { enumerable: true, get: function() {
      return encoders_1.TD;
    } });
    Object.defineProperty(exports2, "TE", { enumerable: true, get: function() {
      return encoders_1.TE;
    } });
    var ipparser_1 = require_ipparser();
    Object.defineProperty(exports2, "isIP", { enumerable: true, get: function() {
      return ipparser_1.isIP;
    } });
    Object.defineProperty(exports2, "parseIP", { enumerable: true, get: function() {
      return ipparser_1.parseIP;
    } });
    var typedsub_1 = require_typedsub();
    Object.defineProperty(exports2, "TypedSubscription", { enumerable: true, get: function() {
      return typedsub_1.TypedSubscription;
    } });
    var kv_1 = require_kv();
    Object.defineProperty(exports2, "Base64KeyCodec", { enumerable: true, get: function() {
      return kv_1.Base64KeyCodec;
    } });
    Object.defineProperty(exports2, "Bucket", { enumerable: true, get: function() {
      return kv_1.Bucket;
    } });
    Object.defineProperty(exports2, "defaultBucketOpts", { enumerable: true, get: function() {
      return kv_1.defaultBucketOpts;
    } });
    Object.defineProperty(exports2, "NoopKvCodecs", { enumerable: true, get: function() {
      return kv_1.NoopKvCodecs;
    } });
    var semver_1 = require_semver();
    Object.defineProperty(exports2, "compare", { enumerable: true, get: function() {
      return semver_1.compare;
    } });
    Object.defineProperty(exports2, "parseSemVer", { enumerable: true, get: function() {
      return semver_1.parseSemVer;
    } });
    var types_1 = require_types();
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: function() {
      return types_1.Empty;
    } });
    var transport_2 = require_transport();
    Object.defineProperty(exports2, "extractProtocolMessage", { enumerable: true, get: function() {
      return transport_2.extractProtocolMessage;
    } });
    var core_1 = require_core();
    Object.defineProperty(exports2, "createInbox", { enumerable: true, get: function() {
      return core_1.createInbox;
    } });
    Object.defineProperty(exports2, "DebugEvents", { enumerable: true, get: function() {
      return core_1.DebugEvents;
    } });
    Object.defineProperty(exports2, "ErrorCode", { enumerable: true, get: function() {
      return core_1.ErrorCode;
    } });
    Object.defineProperty(exports2, "Events", { enumerable: true, get: function() {
      return core_1.Events;
    } });
    Object.defineProperty(exports2, "isNatsError", { enumerable: true, get: function() {
      return core_1.isNatsError;
    } });
    Object.defineProperty(exports2, "Match", { enumerable: true, get: function() {
      return core_1.Match;
    } });
    Object.defineProperty(exports2, "NatsError", { enumerable: true, get: function() {
      return core_1.NatsError;
    } });
    Object.defineProperty(exports2, "RequestStrategy", { enumerable: true, get: function() {
      return core_1.RequestStrategy;
    } });
    Object.defineProperty(exports2, "ServiceError", { enumerable: true, get: function() {
      return core_1.ServiceError;
    } });
    Object.defineProperty(exports2, "ServiceErrorCodeHeader", { enumerable: true, get: function() {
      return core_1.ServiceErrorCodeHeader;
    } });
    Object.defineProperty(exports2, "ServiceErrorHeader", { enumerable: true, get: function() {
      return core_1.ServiceErrorHeader;
    } });
    Object.defineProperty(exports2, "ServiceResponseType", { enumerable: true, get: function() {
      return core_1.ServiceResponseType;
    } });
    Object.defineProperty(exports2, "ServiceVerb", { enumerable: true, get: function() {
      return core_1.ServiceVerb;
    } });
    Object.defineProperty(exports2, "syncIterator", { enumerable: true, get: function() {
      return core_1.syncIterator;
    } });
    var protocol_2 = require_protocol();
    Object.defineProperty(exports2, "SubscriptionImpl", { enumerable: true, get: function() {
      return protocol_2.SubscriptionImpl;
    } });
    Object.defineProperty(exports2, "Subscriptions", { enumerable: true, get: function() {
      return protocol_2.Subscriptions;
    } });
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/internal_mod.js
var require_internal_mod2 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/internal_mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConsumerEvents = exports2.ConsumerDebugEvents = exports2.StoreCompression = exports2.StorageType = exports2.RetentionPolicy = exports2.ReplayPolicy = exports2.DiscardPolicy = exports2.DeliverPolicy = exports2.AckPolicy = exports2.RepublishHeaders = exports2.KvWatchInclude = exports2.JsHeaders = exports2.isConsumerOptsBuilder = exports2.DirectMsgHeaders = exports2.consumerOpts = exports2.AdvisoryKind = exports2.isHeartbeatMsg = exports2.isFlowControlMsg = exports2.checkJsError = void 0;
    var jsutil_1 = require_jsutil();
    Object.defineProperty(exports2, "checkJsError", { enumerable: true, get: function() {
      return jsutil_1.checkJsError;
    } });
    Object.defineProperty(exports2, "isFlowControlMsg", { enumerable: true, get: function() {
      return jsutil_1.isFlowControlMsg;
    } });
    Object.defineProperty(exports2, "isHeartbeatMsg", { enumerable: true, get: function() {
      return jsutil_1.isHeartbeatMsg;
    } });
    var types_1 = require_types2();
    Object.defineProperty(exports2, "AdvisoryKind", { enumerable: true, get: function() {
      return types_1.AdvisoryKind;
    } });
    Object.defineProperty(exports2, "consumerOpts", { enumerable: true, get: function() {
      return types_1.consumerOpts;
    } });
    Object.defineProperty(exports2, "DirectMsgHeaders", { enumerable: true, get: function() {
      return types_1.DirectMsgHeaders;
    } });
    Object.defineProperty(exports2, "isConsumerOptsBuilder", { enumerable: true, get: function() {
      return types_1.isConsumerOptsBuilder;
    } });
    Object.defineProperty(exports2, "JsHeaders", { enumerable: true, get: function() {
      return types_1.JsHeaders;
    } });
    Object.defineProperty(exports2, "KvWatchInclude", { enumerable: true, get: function() {
      return types_1.KvWatchInclude;
    } });
    Object.defineProperty(exports2, "RepublishHeaders", { enumerable: true, get: function() {
      return types_1.RepublishHeaders;
    } });
    var jsapi_types_1 = require_jsapi_types();
    Object.defineProperty(exports2, "AckPolicy", { enumerable: true, get: function() {
      return jsapi_types_1.AckPolicy;
    } });
    Object.defineProperty(exports2, "DeliverPolicy", { enumerable: true, get: function() {
      return jsapi_types_1.DeliverPolicy;
    } });
    Object.defineProperty(exports2, "DiscardPolicy", { enumerable: true, get: function() {
      return jsapi_types_1.DiscardPolicy;
    } });
    Object.defineProperty(exports2, "ReplayPolicy", { enumerable: true, get: function() {
      return jsapi_types_1.ReplayPolicy;
    } });
    Object.defineProperty(exports2, "RetentionPolicy", { enumerable: true, get: function() {
      return jsapi_types_1.RetentionPolicy;
    } });
    Object.defineProperty(exports2, "StorageType", { enumerable: true, get: function() {
      return jsapi_types_1.StorageType;
    } });
    Object.defineProperty(exports2, "StoreCompression", { enumerable: true, get: function() {
      return jsapi_types_1.StoreCompression;
    } });
    var consumer_1 = require_consumer();
    Object.defineProperty(exports2, "ConsumerDebugEvents", { enumerable: true, get: function() {
      return consumer_1.ConsumerDebugEvents;
    } });
    Object.defineProperty(exports2, "ConsumerEvents", { enumerable: true, get: function() {
      return consumer_1.ConsumerEvents;
    } });
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/nats-base-client.js
var require_nats_base_client = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/nats-base-client.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_internal_mod(), exports2);
    __exportStar(require_internal_mod2(), exports2);
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/node_transport.js
var require_node_transport = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/node_transport.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve2) {
          resolve2(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve2, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __await = exports2 && exports2.__await || function(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
    };
    var __asyncGenerator = exports2 && exports2.__asyncGenerator || function(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
      }, i;
      function awaitReturn(f) {
        return function(v) {
          return Promise.resolve(v).then(f, reject);
        };
      }
      function verb(n, f) {
        if (g[n]) {
          i[n] = function(v) {
            return new Promise(function(a, b) {
              q.push([n, v, a, b]) > 1 || resume(n, v);
            });
          };
          if (f) i[n] = f(i[n]);
        }
      }
      function resume(n, v) {
        try {
          step(g[n](v));
        } catch (e) {
          settle(q[0][3], e);
        }
      }
      function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
      }
      function fulfill(value) {
        resume("next", value);
      }
      function reject(value) {
        resume("throw", value);
      }
      function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
      }
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NodeTransport = void 0;
    exports2.nodeResolveHost = nodeResolveHost;
    var nats_base_client_1 = require_nats_base_client();
    var net_1 = require("net");
    var util_1 = require_util();
    var tls_1 = require("tls");
    var { resolve } = require("path");
    var { readFile, existsSync } = require("fs");
    var dns = require("dns");
    var VERSION = "2.29.3";
    var LANG = "nats.js";
    var NodeTransport = class {
      constructor() {
        this.yields = [];
        this.signal = (0, nats_base_client_1.deferred)();
        this.closedNotification = (0, nats_base_client_1.deferred)();
        this.connected = false;
        this.tlsName = "";
        this.done = false;
        this.lang = LANG;
        this.version = VERSION;
      }
      connect(hp, options) {
        return __awaiter(this, void 0, void 0, function* () {
          this.tlsName = hp.tlsName;
          this.options = options;
          const { tls } = this.options;
          const { handshakeFirst } = tls || {};
          try {
            if (handshakeFirst === true) {
              this.socket = yield this.tlsFirst(hp);
            } else {
              this.socket = yield this.dial(hp);
            }
            const info = yield this.peekInfo();
            (0, nats_base_client_1.checkOptions)(info, options);
            const { tls_required: tlsRequired, tls_available: tlsAvailable } = info;
            const desired = tlsAvailable === true && options.tls !== null;
            if (!handshakeFirst && (tlsRequired || desired)) {
              this.socket = yield this.startTLS();
            }
            if (tlsRequired && this.socket.encrypted !== true) {
              throw new nats_base_client_1.NatsError("tls", nats_base_client_1.ErrorCode.ServerOptionNotAvailable);
            }
            this.connected = true;
            this.setupHandlers();
            this.signal.resolve();
            return Promise.resolve();
          } catch (err2) {
            if (!err2) {
              err2 = nats_base_client_1.NatsError.errorForCode(nats_base_client_1.ErrorCode.ConnectionRefused, new Error("node provided an undefined error!"));
            }
            const { code } = err2;
            const perr = code === "ECONNREFUSED" ? nats_base_client_1.NatsError.errorForCode(nats_base_client_1.ErrorCode.ConnectionRefused, err2) : err2;
            if (this.socket) {
              this.socket.destroy();
            }
            throw perr;
          }
        });
      }
      dial(hp) {
        const d = (0, nats_base_client_1.deferred)();
        let dialError;
        const socket = (0, net_1.createConnection)(hp.port, hp.hostname, () => {
          d.resolve(socket);
          socket.removeAllListeners();
        });
        socket.on("error", (err2) => {
          dialError = err2;
        });
        socket.on("close", () => {
          socket.removeAllListeners();
          d.reject(dialError);
        });
        socket.setNoDelay(true);
        return d;
      }
      get isClosed() {
        return this.done;
      }
      close(err2) {
        return this._closed(err2, false);
      }
      peekInfo() {
        const d = (0, nats_base_client_1.deferred)();
        let peekError;
        this.socket.on("data", (frame) => {
          this.yields.push(frame);
          const t = nats_base_client_1.DataBuffer.concat(...this.yields);
          const pm = (0, nats_base_client_1.extractProtocolMessage)(t);
          if (pm !== "") {
            try {
              const m = nats_base_client_1.INFO.exec(pm);
              if (!m) {
                throw new Error("unexpected response from server");
              }
              const info = JSON.parse(m[1]);
              d.resolve(info);
            } catch (err2) {
              d.reject(err2);
            } finally {
              this.socket.removeAllListeners();
            }
          }
        });
        this.socket.on("error", (err2) => {
          peekError = err2;
        });
        this.socket.on("close", () => {
          this.socket.removeAllListeners();
          d.reject(peekError);
        });
        return d;
      }
      loadFile(fn) {
        if (!fn) {
          return Promise.resolve();
        }
        const d = (0, nats_base_client_1.deferred)();
        try {
          fn = resolve(fn);
          if (!existsSync(fn)) {
            d.reject(new Error(`${fn} doesn't exist`));
          }
          readFile(fn, (err2, data) => {
            if (err2) {
              return d.reject(err2);
            }
            d.resolve(data);
          });
        } catch (err2) {
          d.reject(err2);
        }
        return d;
      }
      loadClientCerts() {
        return __awaiter(this, void 0, void 0, function* () {
          const tlsOpts = {};
          const { certFile, cert, caFile, ca, keyFile, key } = this.options.tls;
          try {
            if (certFile) {
              const data = yield this.loadFile(certFile);
              if (data) {
                tlsOpts.cert = data;
              }
            } else if (cert) {
              tlsOpts.cert = cert;
            }
            if (keyFile) {
              const data = yield this.loadFile(keyFile);
              if (data) {
                tlsOpts.key = data;
              }
            } else if (key) {
              tlsOpts.key = key;
            }
            if (caFile) {
              const data = yield this.loadFile(caFile);
              if (data) {
                tlsOpts.ca = [data];
              }
            } else if (ca) {
              tlsOpts.ca = ca;
            }
            return Promise.resolve(tlsOpts);
          } catch (err2) {
            return Promise.reject(err2);
          }
        });
      }
      tlsFirst(hp) {
        return __awaiter(this, void 0, void 0, function* () {
          let tlsError;
          let tlsOpts = {
            servername: this.tlsName,
            rejectUnauthorized: true
          };
          if (this.socket) {
            tlsOpts.socket = this.socket;
          }
          if (typeof this.options.tls === "object") {
            try {
              const certOpts = (yield this.loadClientCerts()) || {};
              tlsOpts = (0, util_1.extend)(tlsOpts, this.options.tls, certOpts);
            } catch (err2) {
              return Promise.reject(new nats_base_client_1.NatsError(err2.message, nats_base_client_1.ErrorCode.Tls, err2));
            }
          }
          const d = (0, nats_base_client_1.deferred)();
          try {
            const tlsSocket = (0, tls_1.connect)(hp.port, hp.hostname, tlsOpts, () => {
              tlsSocket.removeAllListeners();
              d.resolve(tlsSocket);
            });
            tlsSocket.on("error", (err2) => {
              tlsError = err2;
            });
            tlsSocket.on("secureConnect", () => {
              if (tlsOpts.rejectUnauthorized === false) {
                return;
              }
              if (!tlsSocket.authorized) {
                throw tlsSocket.authorizationError;
              }
            });
            tlsSocket.on("close", () => {
              d.reject(tlsError);
              tlsSocket.removeAllListeners();
            });
            tlsSocket.setNoDelay(true);
          } catch (err2) {
            d.reject(nats_base_client_1.NatsError.errorForCode(nats_base_client_1.ErrorCode.Tls, err2));
          }
          return d;
        });
      }
      startTLS() {
        return __awaiter(this, void 0, void 0, function* () {
          let tlsError;
          let tlsOpts = {
            socket: this.socket,
            servername: this.tlsName,
            rejectUnauthorized: true
          };
          if (typeof this.options.tls === "object") {
            try {
              const certOpts = (yield this.loadClientCerts()) || {};
              tlsOpts = (0, util_1.extend)(tlsOpts, this.options.tls, certOpts);
            } catch (err2) {
              return Promise.reject(new nats_base_client_1.NatsError(err2.message, nats_base_client_1.ErrorCode.Tls, err2));
            }
          }
          const d = (0, nats_base_client_1.deferred)();
          try {
            const tlsSocket = (0, tls_1.connect)(tlsOpts, () => {
              tlsSocket.removeAllListeners();
              d.resolve(tlsSocket);
            });
            tlsSocket.on("error", (err2) => {
              tlsError = err2;
            });
            tlsSocket.on("secureConnect", () => {
              if (tlsOpts.rejectUnauthorized === false) {
                return;
              }
              if (!tlsSocket.authorized) {
                throw tlsSocket.authorizationError;
              }
            });
            tlsSocket.on("close", () => {
              d.reject(tlsError);
              tlsSocket.removeAllListeners();
            });
          } catch (err2) {
            d.reject(nats_base_client_1.NatsError.errorForCode(nats_base_client_1.ErrorCode.Tls, err2));
          }
          return d;
        });
      }
      setupHandlers() {
        let connError;
        this.socket.on("data", (frame) => {
          this.yields.push(frame);
          return this.signal.resolve();
        });
        this.socket.on("error", (err2) => {
          connError = err2;
        });
        this.socket.on("end", () => {
          var _a2, _b;
          if ((_a2 = this.socket) === null || _a2 === void 0 ? void 0 : _a2.destroyed) {
            return;
          }
          (_b = this.socket) === null || _b === void 0 ? void 0 : _b.write(new Uint8Array(0), () => {
            var _a3;
            (_a3 = this.socket) === null || _a3 === void 0 ? void 0 : _a3.end();
          });
        });
        this.socket.on("close", () => {
          this._closed(connError, false);
        });
      }
      [Symbol.asyncIterator]() {
        return this.iterate();
      }
      iterate() {
        return __asyncGenerator(this, arguments, function* iterate_1() {
          const debug = this.options.debug;
          while (true) {
            if (this.yields.length === 0) {
              yield __await(this.signal);
            }
            const yields = this.yields;
            this.yields = [];
            for (let i = 0; i < yields.length; i++) {
              if (debug) {
                console.info(`> ${(0, nats_base_client_1.render)(yields[i])}`);
              }
              yield yield __await(yields[i]);
            }
            if (this.done) {
              break;
            } else if (this.yields.length === 0) {
              yields.length = 0;
              this.yields = yields;
              this.signal = (0, nats_base_client_1.deferred)();
            }
          }
        });
      }
      discard() {
      }
      disconnect() {
        this._closed(void 0, true).then().catch();
      }
      isEncrypted() {
        return this.socket instanceof tls_1.TLSSocket;
      }
      _send(frame) {
        if (this.isClosed || this.socket === void 0) {
          return Promise.resolve();
        }
        if (this.options.debug) {
          console.info(`< ${(0, nats_base_client_1.render)(frame)}`);
        }
        const d = (0, nats_base_client_1.deferred)();
        try {
          this.socket.write(frame, (err2) => {
            if (err2) {
              if (this.options.debug) {
                console.error(`!!! ${(0, nats_base_client_1.render)(frame)}: ${err2}`);
              }
              return d.reject(err2);
            }
            return d.resolve();
          });
        } catch (err2) {
          if (this.options.debug) {
            console.error(`!!! ${(0, nats_base_client_1.render)(frame)}: ${err2}`);
          }
          d.reject(err2);
        }
        return d;
      }
      send(frame) {
        const p = this._send(frame);
        p.catch((_err) => {
        });
      }
      _closed(err_1) {
        return __awaiter(this, arguments, void 0, function* (err2, internal = true) {
          if (!this.connected)
            return;
          if (this.done)
            return;
          this.closeError = err2;
          if (!err2 && this.socket && internal) {
            try {
              yield this._send(new TextEncoder().encode(""));
            } catch (err3) {
              if (this.options.debug) {
                console.log("transport close terminated with an error", err3);
              }
            }
          }
          try {
            if (this.socket) {
              this.socket.removeAllListeners();
              this.socket.destroy();
              this.socket = void 0;
            }
          } catch (err3) {
            console.log(err3);
          }
          this.done = true;
          this.closedNotification.resolve(this.closeError);
        });
      }
      closed() {
        return this.closedNotification;
      }
    };
    exports2.NodeTransport = NodeTransport;
    function nodeResolveHost(s) {
      return __awaiter(this, void 0, void 0, function* () {
        const a = (0, nats_base_client_1.deferred)();
        const aaaa = (0, nats_base_client_1.deferred)();
        dns.resolve4(s, (err2, records) => {
          if (err2) {
            a.resolve(err2);
          } else {
            a.resolve(records);
          }
        });
        dns.resolve6(s, (err2, records) => {
          if (err2) {
            aaaa.resolve(err2);
          } else {
            aaaa.resolve(records);
          }
        });
        const ips = [];
        const da = yield a;
        if (Array.isArray(da)) {
          ips.push(...da);
        }
        const daaaa = yield aaaa;
        if (Array.isArray(daaaa)) {
          ips.push(...daaaa);
        }
        if (ips.length === 0) {
          ips.push(s);
        }
        return ips;
      });
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/connect.js
var require_connect = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/connect.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.connect = connect2;
    var node_transport_1 = require_node_transport();
    var nats_base_client_1 = require_nats_base_client();
    function connect2(opts = {}) {
      (0, nats_base_client_1.setTransportFactory)({
        factory: () => {
          return new node_transport_1.NodeTransport();
        },
        dnsResolveFn: node_transport_1.nodeResolveHost
      });
      return nats_base_client_1.NatsConnectionImpl.connect(opts);
    }
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/mod.js
var require_mod3 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/jetstream/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.consumerOpts = exports2.StoreCompression = exports2.StorageType = exports2.RetentionPolicy = exports2.RepublishHeaders = exports2.ReplayPolicy = exports2.KvWatchInclude = exports2.JsHeaders = exports2.DiscardPolicy = exports2.DirectMsgHeaders = exports2.DeliverPolicy = exports2.ConsumerEvents = exports2.ConsumerDebugEvents = exports2.AdvisoryKind = exports2.AckPolicy = exports2.isHeartbeatMsg = exports2.isFlowControlMsg = exports2.checkJsError = void 0;
    var internal_mod_1 = require_internal_mod2();
    Object.defineProperty(exports2, "checkJsError", { enumerable: true, get: function() {
      return internal_mod_1.checkJsError;
    } });
    Object.defineProperty(exports2, "isFlowControlMsg", { enumerable: true, get: function() {
      return internal_mod_1.isFlowControlMsg;
    } });
    Object.defineProperty(exports2, "isHeartbeatMsg", { enumerable: true, get: function() {
      return internal_mod_1.isHeartbeatMsg;
    } });
    var internal_mod_2 = require_internal_mod2();
    Object.defineProperty(exports2, "AckPolicy", { enumerable: true, get: function() {
      return internal_mod_2.AckPolicy;
    } });
    Object.defineProperty(exports2, "AdvisoryKind", { enumerable: true, get: function() {
      return internal_mod_2.AdvisoryKind;
    } });
    Object.defineProperty(exports2, "ConsumerDebugEvents", { enumerable: true, get: function() {
      return internal_mod_2.ConsumerDebugEvents;
    } });
    Object.defineProperty(exports2, "ConsumerEvents", { enumerable: true, get: function() {
      return internal_mod_2.ConsumerEvents;
    } });
    Object.defineProperty(exports2, "DeliverPolicy", { enumerable: true, get: function() {
      return internal_mod_2.DeliverPolicy;
    } });
    Object.defineProperty(exports2, "DirectMsgHeaders", { enumerable: true, get: function() {
      return internal_mod_2.DirectMsgHeaders;
    } });
    Object.defineProperty(exports2, "DiscardPolicy", { enumerable: true, get: function() {
      return internal_mod_2.DiscardPolicy;
    } });
    Object.defineProperty(exports2, "JsHeaders", { enumerable: true, get: function() {
      return internal_mod_2.JsHeaders;
    } });
    Object.defineProperty(exports2, "KvWatchInclude", { enumerable: true, get: function() {
      return internal_mod_2.KvWatchInclude;
    } });
    Object.defineProperty(exports2, "ReplayPolicy", { enumerable: true, get: function() {
      return internal_mod_2.ReplayPolicy;
    } });
    Object.defineProperty(exports2, "RepublishHeaders", { enumerable: true, get: function() {
      return internal_mod_2.RepublishHeaders;
    } });
    Object.defineProperty(exports2, "RetentionPolicy", { enumerable: true, get: function() {
      return internal_mod_2.RetentionPolicy;
    } });
    Object.defineProperty(exports2, "StorageType", { enumerable: true, get: function() {
      return internal_mod_2.StorageType;
    } });
    Object.defineProperty(exports2, "StoreCompression", { enumerable: true, get: function() {
      return internal_mod_2.StoreCompression;
    } });
    var types_1 = require_types2();
    Object.defineProperty(exports2, "consumerOpts", { enumerable: true, get: function() {
      return types_1.consumerOpts;
    } });
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/mod.js
var require_mod4 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/lib/src/mod.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.connect = void 0;
    if (typeof TextEncoder === "undefined") {
      const { TextEncoder: TextEncoder2, TextDecoder: TextDecoder2 } = require("util");
      global.TextEncoder = TextEncoder2;
      global.TextDecoder = TextDecoder2;
    }
    if (typeof globalThis.crypto === "undefined") {
      const c = require("crypto");
      global.crypto = c.webcrypto;
    }
    if (typeof globalThis.ReadableStream === "undefined") {
      const chunks = process.versions.node.split(".");
      const v = parseInt(chunks[0]);
      if (v >= 16) {
        const streams = require("stream/web");
        global.ReadableStream = streams.ReadableStream;
      }
    }
    var connect_1 = require_connect();
    Object.defineProperty(exports2, "connect", { enumerable: true, get: function() {
      return connect_1.connect;
    } });
    __exportStar(require_mod2(), exports2);
    __exportStar(require_mod3(), exports2);
  }
});

// node_modules/.pnpm/nats@2.29.3/node_modules/nats/index.js
var require_nats2 = __commonJS({
  "node_modules/.pnpm/nats@2.29.3/node_modules/nats/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_mod4();
  }
});

// packages/relay/src/index-node.ts
var import_fs = require("fs");

// node_modules/.pnpm/@hono+node-server@1.19.11_hono@4.12.7/node_modules/@hono/node-server/dist/index.mjs
var import_http = require("http");
var import_http2 = require("http2");
var import_http22 = require("http2");
var import_stream = require("stream");
var import_crypto = __toESM(require("crypto"), 1);
var RequestError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RequestError";
  }
};
var toRequestError = (e) => {
  if (e instanceof RequestError) {
    return e;
  }
  return new RequestError(e.message, { cause: e });
};
var GlobalRequest = global.Request;
var Request2 = class extends GlobalRequest {
  constructor(input, options) {
    if (typeof input === "object" && getRequestCache in input) {
      input = input[getRequestCache]();
    }
    if (typeof options?.body?.getReader !== "undefined") {
      ;
      options.duplex ??= "half";
    }
    super(input, options);
  }
};
var newHeadersFromIncoming = (incoming) => {
  const headerRecord = [];
  const rawHeaders = incoming.rawHeaders;
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const { [i]: key, [i + 1]: value } = rawHeaders;
    if (key.charCodeAt(0) !== /*:*/
    58) {
      headerRecord.push([key, value]);
    }
  }
  return new Headers(headerRecord);
};
var wrapBodyStream = /* @__PURE__ */ Symbol("wrapBodyStream");
var newRequestFromIncoming = (method, url, headers, incoming, abortController) => {
  const init = {
    method,
    headers,
    signal: abortController.signal
  };
  if (method === "TRACE") {
    init.method = "GET";
    const req = new Request2(url, init);
    Object.defineProperty(req, "method", {
      get() {
        return "TRACE";
      }
    });
    return req;
  }
  if (!(method === "GET" || method === "HEAD")) {
    if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) {
      init.body = new ReadableStream({
        start(controller) {
          controller.enqueue(incoming.rawBody);
          controller.close();
        }
      });
    } else if (incoming[wrapBodyStream]) {
      let reader;
      init.body = new ReadableStream({
        async pull(controller) {
          try {
            reader ||= import_stream.Readable.toWeb(incoming).getReader();
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
            } else {
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
          }
        }
      });
    } else {
      init.body = import_stream.Readable.toWeb(incoming);
    }
  }
  return new Request2(url, init);
};
var getRequestCache = /* @__PURE__ */ Symbol("getRequestCache");
var requestCache = /* @__PURE__ */ Symbol("requestCache");
var incomingKey = /* @__PURE__ */ Symbol("incomingKey");
var urlKey = /* @__PURE__ */ Symbol("urlKey");
var headersKey = /* @__PURE__ */ Symbol("headersKey");
var abortControllerKey = /* @__PURE__ */ Symbol("abortControllerKey");
var getAbortController = /* @__PURE__ */ Symbol("getAbortController");
var requestPrototype = {
  get method() {
    return this[incomingKey].method || "GET";
  },
  get url() {
    return this[urlKey];
  },
  get headers() {
    return this[headersKey] ||= newHeadersFromIncoming(this[incomingKey]);
  },
  [getAbortController]() {
    this[getRequestCache]();
    return this[abortControllerKey];
  },
  [getRequestCache]() {
    this[abortControllerKey] ||= new AbortController();
    return this[requestCache] ||= newRequestFromIncoming(
      this.method,
      this[urlKey],
      this.headers,
      this[incomingKey],
      this[abortControllerKey]
    );
  }
};
[
  "body",
  "bodyUsed",
  "cache",
  "credentials",
  "destination",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "signal",
  "keepalive"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    get() {
      return this[getRequestCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    value: function() {
      return this[getRequestCache]()[k]();
    }
  });
});
Object.setPrototypeOf(requestPrototype, Request2.prototype);
var newRequest = (incoming, defaultHostname) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  const incomingUrl = incoming.url || "";
  if (incomingUrl[0] !== "/" && // short-circuit for performance. most requests are relative URL.
  (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
    if (incoming instanceof import_http22.Http2ServerRequest) {
      throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
    }
    try {
      const url2 = new URL(incomingUrl);
      req[urlKey] = url2.href;
    } catch (e) {
      throw new RequestError("Invalid absolute URL", { cause: e });
    }
    return req;
  }
  const host = (incoming instanceof import_http22.Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
  if (!host) {
    throw new RequestError("Missing host header");
  }
  let scheme;
  if (incoming instanceof import_http22.Http2ServerRequest) {
    scheme = incoming.scheme;
    if (!(scheme === "http" || scheme === "https")) {
      throw new RequestError("Unsupported scheme");
    }
  } else {
    scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
  }
  const url = new URL(`${scheme}://${host}${incomingUrl}`);
  if (url.hostname.length !== host.length && url.hostname !== host.replace(/:\d+$/, "")) {
    throw new RequestError("Invalid host header");
  }
  req[urlKey] = url.href;
  return req;
};
var responseCache = /* @__PURE__ */ Symbol("responseCache");
var getResponseCache = /* @__PURE__ */ Symbol("getResponseCache");
var cacheKey = /* @__PURE__ */ Symbol("cache");
var GlobalResponse = global.Response;
var Response2 = class _Response {
  #body;
  #init;
  [getResponseCache]() {
    delete this[cacheKey];
    return this[responseCache] ||= new GlobalResponse(this.#body, this.#init);
  }
  constructor(body, init) {
    let headers;
    this.#body = body;
    if (init instanceof _Response) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        this.#init = cachedGlobalResponse;
        this[getResponseCache]();
        return;
      } else {
        this.#init = init.#init;
        headers = new Headers(init.#init.headers);
      }
    } else {
      this.#init = init;
    }
    if (typeof body === "string" || typeof body?.getReader !== "undefined" || body instanceof Blob || body instanceof Uint8Array) {
      ;
      this[cacheKey] = [init?.status || 200, body, headers || init?.headers];
    }
  }
  get headers() {
    const cache = this[cacheKey];
    if (cache) {
      if (!(cache[2] instanceof Headers)) {
        cache[2] = new Headers(
          cache[2] || { "content-type": "text/plain; charset=UTF-8" }
        );
      }
      return cache[2];
    }
    return this[getResponseCache]().headers;
  }
  get status() {
    return this[cacheKey]?.[0] ?? this[getResponseCache]().status;
  }
  get ok() {
    const status = this.status;
    return status >= 200 && status < 300;
  }
};
["body", "bodyUsed", "redirected", "statusText", "trailers", "type", "url"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    get() {
      return this[getResponseCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    value: function() {
      return this[getResponseCache]()[k]();
    }
  });
});
Object.setPrototypeOf(Response2, GlobalResponse);
Object.setPrototypeOf(Response2.prototype, GlobalResponse.prototype);
async function readWithoutBlocking(readPromise) {
  return Promise.race([readPromise, Promise.resolve().then(() => Promise.resolve(void 0))]);
}
function writeFromReadableStreamDefaultReader(reader, writable, currentReadPromise) {
  const cancel = (error) => {
    reader.cancel(error).catch(() => {
    });
  };
  writable.on("close", cancel);
  writable.on("error", cancel);
  (currentReadPromise ?? reader.read()).then(flow, handleStreamError);
  return reader.closed.finally(() => {
    writable.off("close", cancel);
    writable.off("error", cancel);
  });
  function handleStreamError(error) {
    if (error) {
      writable.destroy(error);
    }
  }
  function onDrain() {
    reader.read().then(flow, handleStreamError);
  }
  function flow({ done, value }) {
    try {
      if (done) {
        writable.end();
      } else if (!writable.write(value)) {
        writable.once("drain", onDrain);
      } else {
        return reader.read().then(flow, handleStreamError);
      }
    } catch (e) {
      handleStreamError(e);
    }
  }
}
function writeFromReadableStream(stream2, writable) {
  if (stream2.locked) {
    throw new TypeError("ReadableStream is locked.");
  } else if (writable.destroyed) {
    return;
  }
  return writeFromReadableStreamDefaultReader(stream2.getReader(), writable);
}
var buildOutgoingHttpHeaders = (headers) => {
  const res = {};
  if (!(headers instanceof Headers)) {
    headers = new Headers(headers ?? void 0);
  }
  const cookies = [];
  for (const [k, v] of headers) {
    if (k === "set-cookie") {
      cookies.push(v);
    } else {
      res[k] = v;
    }
  }
  if (cookies.length > 0) {
    res["set-cookie"] = cookies;
  }
  res["content-type"] ??= "text/plain; charset=UTF-8";
  return res;
};
var X_ALREADY_SENT = "x-hono-already-sent";
if (typeof global.crypto === "undefined") {
  global.crypto = import_crypto.default;
}
var outgoingEnded = /* @__PURE__ */ Symbol("outgoingEnded");
var handleRequestError = () => new Response(null, {
  status: 400
});
var handleFetchError = (e) => new Response(null, {
  status: e instanceof Error && (e.name === "TimeoutError" || e.constructor.name === "TimeoutError") ? 504 : 500
});
var handleResponseError = (e, outgoing) => {
  const err2 = e instanceof Error ? e : new Error("unknown error", { cause: e });
  if (err2.code === "ERR_STREAM_PREMATURE_CLOSE") {
    console.info("The user aborted a request.");
  } else {
    console.error(e);
    if (!outgoing.headersSent) {
      outgoing.writeHead(500, { "Content-Type": "text/plain" });
    }
    outgoing.end(`Error: ${err2.message}`);
    outgoing.destroy(err2);
  }
};
var flushHeaders = (outgoing) => {
  if ("flushHeaders" in outgoing && outgoing.writable) {
    outgoing.flushHeaders();
  }
};
var responseViaCache = async (res, outgoing) => {
  let [status, body, header] = res[cacheKey];
  let hasContentLength = false;
  if (!header) {
    header = { "content-type": "text/plain; charset=UTF-8" };
  } else if (header instanceof Headers) {
    hasContentLength = header.has("content-length");
    header = buildOutgoingHttpHeaders(header);
  } else if (Array.isArray(header)) {
    const headerObj = new Headers(header);
    hasContentLength = headerObj.has("content-length");
    header = buildOutgoingHttpHeaders(headerObj);
  } else {
    for (const key in header) {
      if (key.length === 14 && key.toLowerCase() === "content-length") {
        hasContentLength = true;
        break;
      }
    }
  }
  if (!hasContentLength) {
    if (typeof body === "string") {
      header["Content-Length"] = Buffer.byteLength(body);
    } else if (body instanceof Uint8Array) {
      header["Content-Length"] = body.byteLength;
    } else if (body instanceof Blob) {
      header["Content-Length"] = body.size;
    }
  }
  outgoing.writeHead(status, header);
  if (typeof body === "string" || body instanceof Uint8Array) {
    outgoing.end(body);
  } else if (body instanceof Blob) {
    outgoing.end(new Uint8Array(await body.arrayBuffer()));
  } else {
    flushHeaders(outgoing);
    await writeFromReadableStream(body, outgoing)?.catch(
      (e) => handleResponseError(e, outgoing)
    );
  }
  ;
  outgoing[outgoingEnded]?.();
};
var isPromise = (res) => typeof res.then === "function";
var responseViaResponseObject = async (res, outgoing, options = {}) => {
  if (isPromise(res)) {
    if (options.errorHandler) {
      try {
        res = await res;
      } catch (err2) {
        const errRes = await options.errorHandler(err2);
        if (!errRes) {
          return;
        }
        res = errRes;
      }
    } else {
      res = await res.catch(handleFetchError);
    }
  }
  if (cacheKey in res) {
    return responseViaCache(res, outgoing);
  }
  const resHeaderRecord = buildOutgoingHttpHeaders(res.headers);
  if (res.body) {
    const reader = res.body.getReader();
    const values = [];
    let done = false;
    let currentReadPromise = void 0;
    if (resHeaderRecord["transfer-encoding"] !== "chunked") {
      let maxReadCount = 2;
      for (let i = 0; i < maxReadCount; i++) {
        currentReadPromise ||= reader.read();
        const chunk = await readWithoutBlocking(currentReadPromise).catch((e) => {
          console.error(e);
          done = true;
        });
        if (!chunk) {
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve));
            maxReadCount = 3;
            continue;
          }
          break;
        }
        currentReadPromise = void 0;
        if (chunk.value) {
          values.push(chunk.value);
        }
        if (chunk.done) {
          done = true;
          break;
        }
      }
      if (done && !("content-length" in resHeaderRecord)) {
        resHeaderRecord["content-length"] = values.reduce((acc, value) => acc + value.length, 0);
      }
    }
    outgoing.writeHead(res.status, resHeaderRecord);
    values.forEach((value) => {
      ;
      outgoing.write(value);
    });
    if (done) {
      outgoing.end();
    } else {
      if (values.length === 0) {
        flushHeaders(outgoing);
      }
      await writeFromReadableStreamDefaultReader(reader, outgoing, currentReadPromise);
    }
  } else if (resHeaderRecord[X_ALREADY_SENT]) {
  } else {
    outgoing.writeHead(res.status, resHeaderRecord);
    outgoing.end();
  }
  ;
  outgoing[outgoingEnded]?.();
};
var getRequestListener = (fetchCallback, options = {}) => {
  const autoCleanupIncoming = options.autoCleanupIncoming ?? true;
  if (options.overrideGlobalObjects !== false && global.Request !== Request2) {
    Object.defineProperty(global, "Request", {
      value: Request2
    });
    Object.defineProperty(global, "Response", {
      value: Response2
    });
  }
  return async (incoming, outgoing) => {
    let res, req;
    try {
      req = newRequest(incoming, options.hostname);
      let incomingEnded = !autoCleanupIncoming || incoming.method === "GET" || incoming.method === "HEAD";
      if (!incomingEnded) {
        ;
        incoming[wrapBodyStream] = true;
        incoming.on("end", () => {
          incomingEnded = true;
        });
        if (incoming instanceof import_http2.Http2ServerRequest) {
          ;
          outgoing[outgoingEnded] = () => {
            if (!incomingEnded) {
              setTimeout(() => {
                if (!incomingEnded) {
                  setTimeout(() => {
                    incoming.destroy();
                    outgoing.destroy();
                  });
                }
              });
            }
          };
        }
      }
      outgoing.on("close", () => {
        const abortController = req[abortControllerKey];
        if (abortController) {
          if (incoming.errored) {
            req[abortControllerKey].abort(incoming.errored.toString());
          } else if (!outgoing.writableFinished) {
            req[abortControllerKey].abort("Client connection prematurely closed.");
          }
        }
        if (!incomingEnded) {
          setTimeout(() => {
            if (!incomingEnded) {
              setTimeout(() => {
                incoming.destroy();
              });
            }
          });
        }
      });
      res = fetchCallback(req, { incoming, outgoing });
      if (cacheKey in res) {
        return responseViaCache(res, outgoing);
      }
    } catch (e) {
      if (!res) {
        if (options.errorHandler) {
          res = await options.errorHandler(req ? e : toRequestError(e));
          if (!res) {
            return;
          }
        } else if (!req) {
          res = handleRequestError();
        } else {
          res = handleFetchError(e);
        }
      } else {
        return handleResponseError(e, outgoing);
      }
    }
    try {
      return await responseViaResponseObject(res, outgoing, options);
    } catch (e) {
      return handleResponseError(e, outgoing);
    }
  };
};
var createAdaptorServer = (options) => {
  const fetchCallback = options.fetch;
  const requestListener = getRequestListener(fetchCallback, {
    hostname: options.hostname,
    overrideGlobalObjects: options.overrideGlobalObjects,
    autoCleanupIncoming: options.autoCleanupIncoming
  });
  const createServer = options.createServer || import_http.createServer;
  const server = createServer(options.serverOptions || {}, requestListener);
  return server;
};
var serve = (options, listeningListener) => {
  const server = createAdaptorServer(options);
  server.listen(options?.port ?? 3e3, options.hostname, () => {
    const serverInfo = server.address();
    listeningListener && listeningListener(serverInfo);
  });
  return server;
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err2) {
          if (err2 instanceof Error && onError) {
            context.error = err2;
            res = await onError(err2, context);
            isError = true;
          } else {
            throw err2;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey2 = `${label}#${next}`;
    if (!patternCache[cacheKey2]) {
      if (match2[2]) {
        patternCache[cacheKey2] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey2, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey2] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey2];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err2, c) => {
  if ("getResponse" in err2) {
    const res = err2.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err2);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app) {
    const subApp = this.basePath(path);
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err2, c) {
    if (err2 instanceof Error) {
      return this.errorHandler(err2, c);
    }
    throw err2;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err2) {
        return this.#handleError(err2, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err2) => this.#handleError(err2, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err2) {
        return this.#handleError(err2, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h2]) => [h2, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h2, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h2, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
  for (const _ in children) {
    return true;
  }
  return false;
};
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/utils/stream.js
var StreamingApi = class {
  writer;
  encoder;
  writable;
  abortSubscribers = [];
  responseReadable;
  /**
   * Whether the stream has been aborted.
   */
  aborted = false;
  /**
   * Whether the stream has been closed normally.
   */
  closed = false;
  constructor(writable, _readable) {
    this.writable = writable;
    this.writer = writable.getWriter();
    this.encoder = new TextEncoder();
    const reader = _readable.getReader();
    this.abortSubscribers.push(async () => {
      await reader.cancel();
    });
    this.responseReadable = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        done ? controller.close() : controller.enqueue(value);
      },
      cancel: () => {
        this.abort();
      }
    });
  }
  async write(input) {
    try {
      if (typeof input === "string") {
        input = this.encoder.encode(input);
      }
      await this.writer.write(input);
    } catch {
    }
    return this;
  }
  async writeln(input) {
    await this.write(input + "\n");
    return this;
  }
  sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async close() {
    try {
      await this.writer.close();
    } catch {
    }
    this.closed = true;
  }
  async pipe(body) {
    this.writer.releaseLock();
    await body.pipeTo(this.writable, { preventClose: true });
    this.writer = this.writable.getWriter();
  }
  onAbort(listener) {
    this.abortSubscribers.push(listener);
  }
  /**
   * Abort the stream.
   * You can call this method when stream is aborted by external event.
   */
  abort() {
    if (!this.aborted) {
      this.aborted = true;
      this.abortSubscribers.forEach((subscriber) => subscriber());
    }
  }
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/helper/streaming/utils.js
var isOldBunVersion = () => {
  const version = typeof Bun !== "undefined" ? Bun.version : void 0;
  if (version === void 0) {
    return false;
  }
  const result = version.startsWith("1.1") || version.startsWith("1.0") || version.startsWith("0.");
  isOldBunVersion = () => result;
  return result;
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/helper/streaming/sse.js
var SSEStreamingApi = class extends StreamingApi {
  constructor(writable, readable) {
    super(writable, readable);
  }
  async writeSSE(message) {
    const data = await resolveCallback(message.data, HtmlEscapedCallbackPhase.Stringify, false, {});
    const dataLines = data.split(/\r\n|\r|\n/).map((line) => {
      return `data: ${line}`;
    }).join("\n");
    for (const key of ["event", "id", "retry"]) {
      if (message[key] && /[\r\n]/.test(message[key])) {
        throw new Error(`${key} must not contain "\\r" or "\\n"`);
      }
    }
    const sseData = [
      message.event && `event: ${message.event}`,
      dataLines,
      message.id && `id: ${message.id}`,
      message.retry && `retry: ${message.retry}`
    ].filter(Boolean).join("\n") + "\n\n";
    await this.write(sseData);
  }
};
var run = async (stream2, cb, onError) => {
  try {
    await cb(stream2);
  } catch (e) {
    if (e instanceof Error && onError) {
      await onError(e, stream2);
      await stream2.writeSSE({
        event: "error",
        data: e.message
      });
    } else {
      console.error(e);
    }
  } finally {
    stream2.close();
  }
};
var contextStash = /* @__PURE__ */ new WeakMap();
var streamSSE = (c, cb, onError) => {
  const { readable, writable } = new TransformStream();
  const stream2 = new SSEStreamingApi(writable, readable);
  if (isOldBunVersion()) {
    c.req.raw.signal.addEventListener("abort", () => {
      if (!stream2.closed) {
        stream2.abort();
      }
    });
  }
  contextStash.set(stream2.responseReadable, c);
  c.header("Transfer-Encoding", "chunked");
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  run(stream2, cb, onError);
  return c.newResponse(stream2.responseReadable);
};

// node_modules/.pnpm/hono@4.12.7/node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// packages/relay/src/index-node.ts
var import_nats = __toESM(require_nats2(), 1);

// packages/core/dist/types.js
var AAMP_VERSION = "0.1.0";
var RoutingMode;
(function(RoutingMode2) {
  RoutingMode2["UNSPECIFIED"] = "UNSPECIFIED";
  RoutingMode2["BLIND_TRANSFER"] = "BLIND_TRANSFER";
  RoutingMode2["SUPERVISED_TRANSFER"] = "SUPERVISED_TRANSFER";
  RoutingMode2["SIDEBAR"] = "SIDEBAR";
  RoutingMode2["CONFERENCE"] = "CONFERENCE";
  RoutingMode2["PASSTHROUGH"] = "PASSTHROUGH";
})(RoutingMode || (RoutingMode = {}));
var TaskStatus;
(function(TaskStatus3) {
  TaskStatus3["UNSPECIFIED"] = "UNSPECIFIED";
  TaskStatus3["SUBMITTED"] = "SUBMITTED";
  TaskStatus3["RUNNING"] = "RUNNING";
  TaskStatus3["BLOCKED"] = "BLOCKED";
  TaskStatus3["AWAITING_CONFIRMATION"] = "AWAITING_CONFIRMATION";
  TaskStatus3["COMPLETED"] = "COMPLETED";
  TaskStatus3["FAILED"] = "FAILED";
  TaskStatus3["CANCELLED"] = "CANCELLED";
})(TaskStatus || (TaskStatus = {}));
var MessageType;
(function(MessageType2) {
  MessageType2["UNSPECIFIED"] = "UNSPECIFIED";
  MessageType2["TASK"] = "TASK";
  MessageType2["RESPONSE"] = "RESPONSE";
  MessageType2["STATUS"] = "STATUS";
  MessageType2["PROBE"] = "PROBE";
  MessageType2["PROBE_RESPONSE"] = "PROBE_RESPONSE";
  MessageType2["CONFIRM"] = "CONFIRM";
  MessageType2["CANCEL"] = "CANCEL";
})(MessageType || (MessageType = {}));

// node_modules/.pnpm/@noble+ed25519@2.3.0/node_modules/@noble/ed25519/index.js
var ed25519_CURVE = {
  p: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,
  n: 0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,
  h: 8n,
  a: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,
  d: 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  Gx: 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Gy: 0x6666666666666666666666666666666666666666666666666666666666666658n
};
var { p: P, n: N, Gx, Gy, a: _a, d: _d } = ed25519_CURVE;
var h = 8n;
var L = 32;
var L2 = 64;
var err = (m = "") => {
  throw new Error(m);
};
var isBig = (n) => typeof n === "bigint";
var isStr = (s) => typeof s === "string";
var isBytes = (a) => a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
var abytes = (a, l) => !isBytes(a) || typeof l === "number" && l > 0 && a.length !== l ? err("Uint8Array expected") : a;
var u8n = (len) => new Uint8Array(len);
var u8fr = (buf) => Uint8Array.from(buf);
var padh = (n, pad) => n.toString(16).padStart(pad, "0");
var bytesToHex = (b) => Array.from(abytes(b)).map((e) => padh(e, 2)).join("");
var C = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
var _ch = (ch) => {
  if (ch >= C._0 && ch <= C._9)
    return ch - C._0;
  if (ch >= C.A && ch <= C.F)
    return ch - (C.A - 10);
  if (ch >= C.a && ch <= C.f)
    return ch - (C.a - 10);
  return;
};
var hexToBytes = (hex) => {
  const e = "hex invalid";
  if (!isStr(hex))
    return err(e);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    return err(e);
  const array = u8n(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = _ch(hex.charCodeAt(hi));
    const n2 = _ch(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0)
      return err(e);
    array[ai] = n1 * 16 + n2;
  }
  return array;
};
var toU8 = (a, len) => abytes(isStr(a) ? hexToBytes(a) : u8fr(abytes(a)), len);
var cr = () => globalThis?.crypto;
var subtle = () => cr()?.subtle ?? err("crypto.subtle must be defined");
var concatBytes = (...arrs) => {
  const r = u8n(arrs.reduce((sum, a) => sum + abytes(a).length, 0));
  let pad = 0;
  arrs.forEach((a) => {
    r.set(a, pad);
    pad += a.length;
  });
  return r;
};
var randomBytes = (len = L) => {
  const c = cr();
  return c.getRandomValues(u8n(len));
};
var big = BigInt;
var arange = (n, min, max, msg = "bad number: out of range") => isBig(n) && min <= n && n < max ? n : err(msg);
var M = (a, b = P) => {
  const r = a % b;
  return r >= 0n ? r : b + r;
};
var invert = (num, md) => {
  if (num === 0n || md <= 0n)
    err("no inverse n=" + num + " mod=" + md);
  let a = M(num, md), b = md, x = 0n, y = 1n, u = 1n, v = 0n;
  while (a !== 0n) {
    const q = b / a, r = b % a;
    const m = x - u * q, n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  return b === 1n ? M(x, md) : err("no inverse");
};
var apoint = (p) => p instanceof Point ? p : err("Point expected");
var B256 = 2n ** 256n;
var Point = class _Point {
  static BASE;
  static ZERO;
  ex;
  ey;
  ez;
  et;
  constructor(ex, ey, ez, et) {
    const max = B256;
    this.ex = arange(ex, 0n, max);
    this.ey = arange(ey, 0n, max);
    this.ez = arange(ez, 1n, max);
    this.et = arange(et, 0n, max);
    Object.freeze(this);
  }
  static fromAffine(p) {
    return new _Point(p.x, p.y, 1n, M(p.x * p.y));
  }
  /** RFC8032 5.1.3: Uint8Array to Point. */
  static fromBytes(hex, zip215 = false) {
    const d = _d;
    const normed = u8fr(abytes(hex, L));
    const lastByte = hex[31];
    normed[31] = lastByte & ~128;
    const y = bytesToNumLE(normed);
    const max = zip215 ? B256 : P;
    arange(y, 0n, max);
    const y2 = M(y * y);
    const u = M(y2 - 1n);
    const v = M(d * y2 + 1n);
    let { isValid, value: x } = uvRatio(u, v);
    if (!isValid)
      err("bad point: y not sqrt");
    const isXOdd = (x & 1n) === 1n;
    const isLastByteOdd = (lastByte & 128) !== 0;
    if (!zip215 && x === 0n && isLastByteOdd)
      err("bad point: x==0, isLastByteOdd");
    if (isLastByteOdd !== isXOdd)
      x = M(-x);
    return new _Point(x, y, 1n, M(x * y));
  }
  /** Checks if the point is valid and on-curve. */
  assertValidity() {
    const a = _a;
    const d = _d;
    const p = this;
    if (p.is0())
      throw new Error("bad point: ZERO");
    const { ex: X, ey: Y, ez: Z, et: T } = p;
    const X2 = M(X * X);
    const Y2 = M(Y * Y);
    const Z2 = M(Z * Z);
    const Z4 = M(Z2 * Z2);
    const aX2 = M(X2 * a);
    const left = M(Z2 * M(aX2 + Y2));
    const right = M(Z4 + M(d * M(X2 * Y2)));
    if (left !== right)
      throw new Error("bad point: equation left != right (1)");
    const XY = M(X * Y);
    const ZT = M(Z * T);
    if (XY !== ZT)
      throw new Error("bad point: equation left != right (2)");
    return this;
  }
  /** Equality check: compare points P&Q. */
  equals(other) {
    const { ex: X1, ey: Y1, ez: Z1 } = this;
    const { ex: X2, ey: Y2, ez: Z2 } = apoint(other);
    const X1Z2 = M(X1 * Z2);
    const X2Z1 = M(X2 * Z1);
    const Y1Z2 = M(Y1 * Z2);
    const Y2Z1 = M(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }
  is0() {
    return this.equals(I);
  }
  /** Flip point over y coordinate. */
  negate() {
    return new _Point(M(-this.ex), this.ey, this.ez, M(-this.et));
  }
  /** Point doubling. Complete formula. Cost: `4M + 4S + 1*a + 6add + 1*2`. */
  double() {
    const { ex: X1, ey: Y1, ez: Z1 } = this;
    const a = _a;
    const A = M(X1 * X1);
    const B = M(Y1 * Y1);
    const C2 = M(2n * M(Z1 * Z1));
    const D = M(a * A);
    const x1y1 = X1 + Y1;
    const E = M(M(x1y1 * x1y1) - A - B);
    const G2 = D + B;
    const F = G2 - C2;
    const H = D - B;
    const X3 = M(E * F);
    const Y3 = M(G2 * H);
    const T3 = M(E * H);
    const Z3 = M(F * G2);
    return new _Point(X3, Y3, Z3, T3);
  }
  /** Point addition. Complete formula. Cost: `8M + 1*k + 8add + 1*2`. */
  add(other) {
    const { ex: X1, ey: Y1, ez: Z1, et: T1 } = this;
    const { ex: X2, ey: Y2, ez: Z2, et: T2 } = apoint(other);
    const a = _a;
    const d = _d;
    const A = M(X1 * X2);
    const B = M(Y1 * Y2);
    const C2 = M(T1 * d * T2);
    const D = M(Z1 * Z2);
    const E = M((X1 + Y1) * (X2 + Y2) - A - B);
    const F = M(D - C2);
    const G2 = M(D + C2);
    const H = M(B - a * A);
    const X3 = M(E * F);
    const Y3 = M(G2 * H);
    const T3 = M(E * H);
    const Z3 = M(F * G2);
    return new _Point(X3, Y3, Z3, T3);
  }
  /**
   * Point-by-scalar multiplication. Scalar must be in range 1 <= n < CURVE.n.
   * Uses {@link wNAF} for base point.
   * Uses fake point to mitigate side-channel leakage.
   * @param n scalar by which point is multiplied
   * @param safe safe mode guards against timing attacks; unsafe mode is faster
   */
  multiply(n, safe = true) {
    if (!safe && (n === 0n || this.is0()))
      return I;
    arange(n, 1n, N);
    if (n === 1n)
      return this;
    if (this.equals(G))
      return wNAF(n).p;
    let p = I;
    let f = G;
    for (let d = this; n > 0n; d = d.double(), n >>= 1n) {
      if (n & 1n)
        p = p.add(d);
      else if (safe)
        f = f.add(d);
    }
    return p;
  }
  /** Convert point to 2d xy affine point. (X, Y, Z) ∋ (x=X/Z, y=Y/Z) */
  toAffine() {
    const { ex: x, ey: y, ez: z } = this;
    if (this.equals(I))
      return { x: 0n, y: 1n };
    const iz = invert(z, P);
    if (M(z * iz) !== 1n)
      err("invalid inverse");
    return { x: M(x * iz), y: M(y * iz) };
  }
  toBytes() {
    const { x, y } = this.assertValidity().toAffine();
    const b = numTo32bLE(y);
    b[31] |= x & 1n ? 128 : 0;
    return b;
  }
  toHex() {
    return bytesToHex(this.toBytes());
  }
  // encode to hex string
  clearCofactor() {
    return this.multiply(big(h), false);
  }
  isSmallOrder() {
    return this.clearCofactor().is0();
  }
  isTorsionFree() {
    let p = this.multiply(N / 2n, false).double();
    if (N % 2n)
      p = p.add(this);
    return p.is0();
  }
  static fromHex(hex, zip215) {
    return _Point.fromBytes(toU8(hex), zip215);
  }
  get x() {
    return this.toAffine().x;
  }
  get y() {
    return this.toAffine().y;
  }
  toRawBytes() {
    return this.toBytes();
  }
};
var G = new Point(Gx, Gy, 1n, M(Gx * Gy));
var I = new Point(0n, 1n, 1n, 0n);
Point.BASE = G;
Point.ZERO = I;
var numTo32bLE = (num) => hexToBytes(padh(arange(num, 0n, B256), L2)).reverse();
var bytesToNumLE = (b) => big("0x" + bytesToHex(u8fr(abytes(b)).reverse()));
var pow2 = (x, power) => {
  let r = x;
  while (power-- > 0n) {
    r *= r;
    r %= P;
  }
  return r;
};
var pow_2_252_3 = (x) => {
  const x2 = x * x % P;
  const b2 = x2 * x % P;
  const b4 = pow2(b2, 2n) * b2 % P;
  const b5 = pow2(b4, 1n) * x % P;
  const b10 = pow2(b5, 5n) * b5 % P;
  const b20 = pow2(b10, 10n) * b10 % P;
  const b40 = pow2(b20, 20n) * b20 % P;
  const b80 = pow2(b40, 40n) * b40 % P;
  const b160 = pow2(b80, 80n) * b80 % P;
  const b240 = pow2(b160, 80n) * b80 % P;
  const b250 = pow2(b240, 10n) * b10 % P;
  const pow_p_5_8 = pow2(b250, 2n) * x % P;
  return { pow_p_5_8, b2 };
};
var RM1 = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n;
var uvRatio = (u, v) => {
  const v3 = M(v * v * v);
  const v7 = M(v3 * v3 * v);
  const pow = pow_2_252_3(u * v7).pow_p_5_8;
  let x = M(u * v3 * pow);
  const vx2 = M(v * x * x);
  const root1 = x;
  const root2 = M(x * RM1);
  const useRoot1 = vx2 === u;
  const useRoot2 = vx2 === M(-u);
  const noRoot = vx2 === M(-u * RM1);
  if (useRoot1)
    x = root1;
  if (useRoot2 || noRoot)
    x = root2;
  if ((M(x) & 1n) === 1n)
    x = M(-x);
  return { isValid: useRoot1 || useRoot2, value: x };
};
var etc = {
  sha512Async: async (...messages) => {
    const s = subtle();
    const m = concatBytes(...messages);
    return u8n(await s.digest("SHA-512", m.buffer));
  },
  sha512Sync: void 0,
  bytesToHex,
  hexToBytes,
  concatBytes,
  mod: M,
  invert,
  randomBytes
};
var W = 8;
var scalarBits = 256;
var pwindows = Math.ceil(scalarBits / W) + 1;
var pwindowSize = 2 ** (W - 1);
var precompute = () => {
  const points = [];
  let p = G;
  let b = p;
  for (let w = 0; w < pwindows; w++) {
    b = p;
    points.push(b);
    for (let i = 1; i < pwindowSize; i++) {
      b = b.add(p);
      points.push(b);
    }
    p = b.double();
  }
  return points;
};
var Gpows = void 0;
var ctneg = (cnd, p) => {
  const n = p.negate();
  return cnd ? n : p;
};
var wNAF = (n) => {
  const comp = Gpows || (Gpows = precompute());
  let p = I;
  let f = G;
  const pow_2_w = 2 ** W;
  const maxNum = pow_2_w;
  const mask = big(pow_2_w - 1);
  const shiftBy = big(W);
  for (let w = 0; w < pwindows; w++) {
    let wbits = Number(n & mask);
    n >>= shiftBy;
    if (wbits > pwindowSize) {
      wbits -= maxNum;
      n += 1n;
    }
    const off = w * pwindowSize;
    const offF = off;
    const offP = off + Math.abs(wbits) - 1;
    const isEven = w % 2 !== 0;
    const isNeg = wbits < 0;
    if (wbits === 0) {
      f = f.add(ctneg(isEven, comp[offF]));
    } else {
      p = p.add(ctneg(isNeg, comp[offP]));
    }
  }
  return { p, f };
};

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(b, ...lengths) {
  if (!isBytes2(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes2(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes2(data);
  return data;
}
var Hash = class {
};
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h2 = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h2, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}
var HashMD = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes2(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h: h2, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h2, l];
  }
  return [Ah, Al];
}
var shrSH = (h2, _l, s) => h2 >>> s;
var shrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
var rotrSH = (h2, l, s) => h2 >>> s | l << 32 - s;
var rotrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
var rotrBH = (h2, l, s) => h2 << 64 - s | l >>> s - 32;
var rotrBL = (h2, l, s) => h2 >>> s - 32 | l << 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/sha2.js
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
var SHA512 = class extends HashMD {
  constructor(outputLen = 64) {
    super(128, outputLen, 16, false);
    this.Ah = SHA512_IV[0] | 0;
    this.Al = SHA512_IV[1] | 0;
    this.Bh = SHA512_IV[2] | 0;
    this.Bl = SHA512_IV[3] | 0;
    this.Ch = SHA512_IV[4] | 0;
    this.Cl = SHA512_IV[5] | 0;
    this.Dh = SHA512_IV[6] | 0;
    this.Dl = SHA512_IV[7] | 0;
    this.Eh = SHA512_IV[8] | 0;
    this.El = SHA512_IV[9] | 0;
    this.Fh = SHA512_IV[10] | 0;
    this.Fl = SHA512_IV[11] | 0;
    this.Gh = SHA512_IV[12] | 0;
    this.Gl = SHA512_IV[13] | 0;
    this.Hh = SHA512_IV[14] | 0;
    this.Hl = SHA512_IV[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var sha512 = /* @__PURE__ */ createHasher(() => new SHA512());

// node_modules/.pnpm/@noble+hashes@1.8.0/node_modules/@noble/hashes/esm/sha512.js
var sha5122 = sha512;

// packages/identity/dist/keypair.js
etc.sha512Sync = (...m) => sha5122(m[0] ?? new Uint8Array());
var BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function bytesToBase58(bytes) {
  let num = BigInt("0x" + bytesToHex2(bytes));
  let result = "";
  while (num > 0n) {
    result = BASE58_ALPHABET[Number(num % 58n)] + result;
    num = num / 58n;
  }
  for (const byte of bytes) {
    if (byte === 0)
      result = "1" + result;
    else
      break;
  }
  return result;
}
function base58ToBytes(str) {
  let num = 0n;
  for (const char of str) {
    const idx = BASE58_ALPHABET.indexOf(char);
    if (idx === -1)
      throw new Error(`Invalid base58 character: ${char}`);
    num = num * 58n + BigInt(idx);
  }
  const hex = num.toString(16).padStart(2, "0");
  const bytes = hexToBytes2(hex.length % 2 ? "0" + hex : hex);
  const leadingZeros = [...str].filter((c) => c === "1").length;
  const result = new Uint8Array(leadingZeros + bytes.length);
  result.set(bytes, leadingZeros);
  return result;
}
function bytesToHex2(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes2(hex) {
  if (hex.length % 2)
    hex = "0" + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function publicKeyToMultibase(publicKey) {
  const prefixed = new Uint8Array([237, 1, ...publicKey]);
  return "z" + bytesToBase58(prefixed);
}
function multibaseToPublicKey(multibase) {
  if (!multibase.startsWith("z"))
    throw new Error("Only base58btc (z-prefix) multibase supported");
  const bytes = base58ToBytes(multibase.slice(1));
  return bytes.slice(2);
}

// packages/identity/dist/did.js
function resolveDidKey(did) {
  if (!did.startsWith("did:key:"))
    throw new Error(`Not a did:key DID: ${did}`);
  const multibase = did.slice("did:key:".length);
  const keyId = `${did}#${multibase}`;
  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    id: did,
    verificationMethod: [
      {
        id: keyId,
        type: "Ed25519VerificationKey2020",
        controller: did,
        publicKeyMultibase: multibase
      }
    ],
    authentication: [keyId],
    assertionMethod: [keyId]
  };
}
function didWebToUrl(did) {
  if (!did.startsWith("did:web:"))
    throw new Error(`Not a did:web DID: ${did}`);
  const remainder = did.slice("did:web:".length);
  const parts = remainder.split(":");
  const domain = parts[0];
  if (parts.length === 1) {
    return `https://${domain}/.well-known/did.json`;
  }
  const path = parts.slice(1).join("/");
  return `https://${domain}/${path}/did.json`;
}
function createDidWebDocument(did, keyPair, relayInboundUrl) {
  const multibase = publicKeyToMultibase(keyPair.publicKey);
  const keyId = `${did}#key-1`;
  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    id: did,
    verificationMethod: [
      {
        id: keyId,
        type: "Ed25519VerificationKey2020",
        controller: did,
        publicKeyMultibase: multibase
      }
    ],
    authentication: [keyId],
    assertionMethod: [keyId],
    service: [
      {
        id: `${did}#aamp-relay`,
        type: "AAMPRelay",
        serviceEndpoint: relayInboundUrl
      }
    ]
  };
}
var DIDResolver = class {
  cache = /* @__PURE__ */ new Map();
  ttlMs;
  constructor(options = {}) {
    this.ttlMs = options.cacheTtlMs ?? 5 * 60 * 1e3;
  }
  async resolve(did) {
    const cached = this.cache.get(did);
    if (cached && (cached.permanent || Date.now() - cached.fetchedAt < this.ttlMs)) {
      return cached.document;
    }
    let document;
    if (did.startsWith("did:key:")) {
      document = resolveDidKey(did);
    } else if (did.startsWith("did:web:")) {
      document = await this.fetchDidWeb(did);
    } else {
      throw new Error(`Unsupported DID method: ${did}`);
    }
    this.cache.set(did, { document, fetchedAt: Date.now() });
    return document;
  }
  /** Extract the first Ed25519 public key from a DID Document. */
  async getPublicKey(did) {
    const doc = await this.resolve(did);
    const vm = doc.verificationMethod[0];
    if (!vm?.publicKeyMultibase)
      throw new Error(`No public key found in DID Document for ${did}`);
    return multibaseToPublicKey(vm.publicKeyMultibase);
  }
  /** Extract the AAMP relay inbound URL for federation routing. */
  async getRelayEndpoint(did) {
    const doc = await this.resolve(did);
    const service = doc.service?.find((s) => s.type === "AAMPRelay");
    return service?.serviceEndpoint ?? null;
  }
  async fetchDidWeb(did) {
    const url = didWebToUrl(did);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5e3)
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch DID Document for ${did}: HTTP ${response.status}`);
    }
    return response.json();
  }
  /** Manually register a DID Document (useful for local/test environments).
   *  Permanently cached — never expires due to TTL. */
  register(did, document) {
    this.cache.set(did, { document, fetchedAt: Date.now(), permanent: true });
  }
  invalidate(did) {
    this.cache.delete(did);
  }
};

// packages/identity/dist/signing.js
etc.sha512Sync = (...m) => sha5122(m[0] ?? new Uint8Array());

// packages/identity/dist/capability.js
etc.sha512Sync = (...m) => sha5122(m[0] ?? new Uint8Array());

// packages/relay/src/registry-memory.ts
var MemoryAgentRegistry = class {
  byId = /* @__PURE__ */ new Map();
  byDid = /* @__PURE__ */ new Map();
  // did → agentId
  register(agentId, card, keyPair, relayPublicUrl, domain) {
    const didDocument = createDidWebDocument(
      card.did,
      keyPair,
      `${relayPublicUrl}/inbound`
    );
    return this.registerWithDocument(agentId, card, didDocument);
  }
  registerWithDocument(agentId, card, didDocument) {
    const reg = {
      agentId,
      did: card.did,
      card,
      didDocument,
      registeredAt: Date.now(),
      lastSeen: Date.now()
    };
    this.byId.set(agentId, reg);
    this.byDid.set(card.did, agentId);
    return Promise.resolve(reg);
  }
  get(agentIdOrDid) {
    const byId = this.byId.get(agentIdOrDid);
    if (byId) return Promise.resolve(byId);
    const id = this.byDid.get(agentIdOrDid);
    if (id) return Promise.resolve(this.byId.get(id));
    return Promise.resolve(void 0);
  }
  touch(agentIdOrDid) {
    const reg = this.byId.get(agentIdOrDid) ?? this.byId.get(this.byDid.get(agentIdOrDid) ?? "");
    if (reg) reg.lastSeen = Date.now();
    return Promise.resolve();
  }
  list() {
    return Promise.resolve(Array.from(this.byId.values()));
  }
  stale(staleThresholdMs = 6e4) {
    const cutoff = Date.now() - staleThresholdMs;
    return Promise.resolve(Array.from(this.byId.values()).filter((r) => r.lastSeen < cutoff));
  }
};

// packages/relay/src/federation.ts
var FederationRouter = class {
  resolver;
  timeout;
  constructor(resolver, timeoutMs = 1e4) {
    this.resolver = resolver;
    this.timeout = timeoutMs;
  }
  /**
   * Forward an envelope to the target agent's relay via HTTPS.
   * Called when the recipient DID belongs to a different domain.
   */
  async forwardToRemoteRelay(envelope) {
    let relayUrl;
    try {
      relayUrl = await this.resolver.getRelayEndpoint(envelope.recipientDid);
    } catch (err2) {
      return {
        success: false,
        error: `DID resolution failed for ${envelope.recipientDid}: ${String(err2)}`
      };
    }
    if (!relayUrl) {
      return {
        success: false,
        error: `No AAMPRelay service endpoint in DID Document for ${envelope.recipientDid}`
      };
    }
    const inboundUrl = relayUrl.endsWith("/inbound") ? relayUrl : `${relayUrl}/inbound`;
    try {
      const response = await fetch(inboundUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AAMP-Version": "0.1.0",
          "X-AAMP-Sender": envelope.senderDid,
          "X-AAMP-Task-ID": envelope.taskId
        },
        body: JSON.stringify(envelope),
        signal: AbortSignal.timeout(this.timeout)
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        return {
          success: false,
          relayUrl: inboundUrl,
          error: `Remote relay returned HTTP ${response.status}: ${body}`
        };
      }
      return { success: true, relayUrl: inboundUrl };
    } catch (err2) {
      return {
        success: false,
        relayUrl: inboundUrl,
        error: `Network error forwarding to ${inboundUrl}: ${String(err2)}`
      };
    }
  }
  /**
   * Determine if a DID belongs to the local relay domain.
   */
  isLocalDid(did, domain) {
    return did.startsWith(`did:web:${domain}`) || did.startsWith(`did:web:${domain.replace(/\./g, "\\.")}`);
  }
};

// packages/relay/src/index-node.ts
var PORT = parseInt(process.env.RELAY_PORT ?? "8087", 10);
var DOMAIN = process.env.RELAY_DOMAIN ?? "company-c.sandbox";
var PUBLIC_URL = process.env.RELAY_PUBLIC_URL ?? `http://localhost:${PORT}`;
var NATS_URL = process.env.NATS_URL ?? "wss://connect.ngs.global";
var STREAM_NAME = process.env.RELAY_STREAM_NAME ?? "AAMP_MESSAGES_C";
var NATS_CREDS = (() => {
  const file = process.env.NATS_CREDS_FILE;
  if (file) {
    try {
      return (0, import_fs.readFileSync)(file, "utf8");
    } catch {
    }
  }
  return process.env.NATS_CREDS;
})();
var config = {
  natsUrl: NATS_URL,
  natsCreds: NATS_CREDS,
  publicUrl: PUBLIC_URL,
  domain: DOMAIN,
  maxTtlMs: 24 * 60 * 60 * 1e3,
  streamName: STREAM_NAME,
  requireCapabilityProof: false,
  strictAuth: false
};
function toTcpNatsUrl(url) {
  if (url.startsWith("wss://")) return url.replace("wss://", "tls://");
  if (url.startsWith("ws://")) return url.replace("ws://", "nats://");
  return url;
}
async function connectNats() {
  const opts = { servers: toTcpNatsUrl(NATS_URL) };
  if (NATS_CREDS) {
    const creds = NATS_CREDS.trim();
    opts.authenticator = creds.startsWith("-----BEGIN NATS") ? (0, import_nats.credsAuthenticator)(new TextEncoder().encode(creds)) : (0, import_nats.tokenAuthenticator)(creds);
  }
  const nc = await (0, import_nats.connect)(opts);
  const jsm = await nc.jetstreamManager();
  const js = nc.jetstream();
  try {
    await jsm.streams.info(STREAM_NAME);
  } catch {
    await jsm.streams.add({
      name: STREAM_NAME,
      subjects: [`aamp.${DOMAIN}.*.inbox`],
      retention: import_nats.RetentionPolicy.Workqueue,
      storage: import_nats.StorageType.File,
      max_bytes: 256 * 1024 * 1024,
      // 256 MB — required by Synadia NGS
      max_age: config.maxTtlMs * 1e6,
      max_msg_size: 4 * 1024 * 1024,
      duplicate_window: 6e10,
      num_replicas: 1
    });
    console.log(`[nats] Created stream ${STREAM_NAME}`);
  }
  console.log(`[nats] Connected to ${NATS_URL}`);
  return { nc, jsm, js };
}
function buildNodeApp(nats) {
  const app = new Hono2();
  const registry = new MemoryAgentRegistry();
  const resolver = new DIDResolver();
  const federation = new FederationRouter(resolver);
  const START_TIME = Date.now();
  app.use("*", cors({ origin: "*" }));
  app.get("/health", (c) => c.json({
    status: "ok",
    aampVersion: AAMP_VERSION,
    domain: DOMAIN,
    provider: "vercel-sandbox",
    uptime: Math.floor((Date.now() - START_TIME) / 1e3),
    timestamp: Date.now()
  }));
  app.post("/resolver/register", async (c) => {
    const { did, document } = await c.req.json();
    if (!did || !document) return c.json({ error: "did and document required" }, 400);
    resolver.register(did, document);
    return c.json({ did, registered: true }, 201);
  });
  app.post("/agents/register", async (c) => {
    const { agentId, card } = await c.req.json();
    if (!agentId || !card) return c.json({ error: "agentId and card required" }, 400);
    let didDocument = {
      "@context": ["https://www.w3.org/ns/did/v1"],
      id: card.did,
      verificationMethod: [],
      authentication: [],
      assertionMethod: [],
      service: [{ id: `${card.did}#aamp-relay`, type: "AAMPRelay", serviceEndpoint: `${PUBLIC_URL}/inbound` }]
    };
    if (card.publicKey) {
      try {
        const pubKeyBytes = new Uint8Array(
          Array.from(atob(card.publicKey), (ch) => ch.charCodeAt(0))
        );
        const multibase = publicKeyToMultibase(pubKeyBytes);
        const keyId = `${card.did}#key-1`;
        didDocument = {
          ...didDocument,
          verificationMethod: [{ id: keyId, type: "Ed25519VerificationKey2020", controller: card.did, publicKeyMultibase: multibase }],
          authentication: [keyId],
          assertionMethod: [keyId]
        };
        resolver.register(card.did, didDocument);
      } catch {
      }
    }
    await registry.registerWithDocument(agentId, card, didDocument);
    const consumerName = `agent-${agentId}`;
    try {
      await nats.jsm.consumers.info(STREAM_NAME, consumerName);
    } catch {
      await nats.jsm.consumers.add(STREAM_NAME, {
        durable_name: consumerName,
        filter_subject: `aamp.${DOMAIN}.${agentId}.inbox`,
        ack_policy: import_nats.AckPolicy.Explicit,
        max_deliver: 5,
        ack_wait: 3e10
      }).catch(() => {
      });
    }
    console.log(`[relay-node] Agent registered: ${agentId} (${card.did})`);
    return c.json({ agentId, did: card.did, mailboxSubject: `aamp.${DOMAIN}.${agentId}.inbox` }, 201);
  });
  app.get("/agents", async (c) => c.json(await registry.list()));
  app.get("/agents/:id", async (c) => {
    const reg = await registry.get(c.req.param("id"));
    return reg ? c.json(reg.card) : c.json({ error: "not found" }, 404);
  });
  app.get("/agents/:id/did.json", async (c) => {
    const reg = await registry.get(c.req.param("id"));
    if (!reg) return c.json({ error: "not found" }, 404);
    return new Response(JSON.stringify(reg.didDocument), { headers: { "Content-Type": "application/did+json" } });
  });
  app.get("/mailbox/:agentId/poll", async (c) => {
    const { agentId } = c.req.param();
    const messages = [];
    try {
      const consumerName = `agent-${agentId}`;
      const iter = nats.js.fetch(STREAM_NAME, consumerName, { batch: 50, expires: 500 });
      for await (const msg of iter) {
        messages.push(new TextDecoder().decode(msg.data));
        msg.ack();
      }
    } catch {
    }
    return c.json({ messages: messages.map((r) => {
      try {
        return JSON.parse(r);
      } catch {
        return null;
      }
    }).filter(Boolean) });
  });
  app.post("/mailbox/:agentId/send", async (c) => {
    const body = await c.req.json();
    const envelope = { ...body, aampVersion: AAMP_VERSION, createdAt: body.createdAt ?? Date.now(), messageId: body.messageId ?? crypto.randomUUID() };
    await routeEnvelope(envelope, config, nats, federation, registry, resolver);
    return c.json({ messageId: envelope.messageId, taskId: envelope.taskId, status: "queued" }, 202);
  });
  app.get("/mailbox/notifications", (c) => {
    const agentId = c.req.query("agentId");
    if (!agentId) return c.json({ error: "agentId required" }, 400);
    const subject = `aamp.${DOMAIN}.${agentId}.inbox`;
    return streamSSE(c, async (stream2) => {
      const sub = nats.nc.subscribe(subject);
      stream2.onAbort(() => sub.unsubscribe());
      await stream2.writeSSE({ event: "connected", data: "{}" });
      const heartbeat = setInterval(() => {
        stream2.writeSSE({ event: "heartbeat", data: String(Date.now()) }).catch(() => {
        });
      }, 15e3);
      stream2.onAbort(() => clearInterval(heartbeat));
      for await (const msg of sub) {
        await stream2.writeSSE({ event: "message", data: new TextDecoder().decode(msg.data) });
      }
    });
  });
  app.patch("/status", async (c) => {
    const { agentId, taskId, status } = await c.req.json();
    if (!agentId || !taskId || !status) return c.json({ error: "agentId, taskId, and status required" }, 400);
    await registry.touch(agentId);
    const payload = new TextEncoder().encode(JSON.stringify({ messageId: crypto.randomUUID(), messageType: MessageType.STATUS, taskId, status, createdAt: Date.now(), aampVersion: AAMP_VERSION }));
    nats.nc.publish(`aamp.${DOMAIN}.${agentId}.inbox`, payload);
    return c.json({ ok: true, taskId, status });
  });
  app.post("/inbound", async (c) => {
    const envelope = await c.req.json();
    const reg = await registry.get(envelope.recipientDid);
    const agentId = reg?.agentId ?? envelope.recipientDid.split(":").pop();
    if (!agentId) return c.json({ error: "Recipient not local" }, 404);
    const payload = new TextEncoder().encode(JSON.stringify(envelope));
    nats.nc.publish(`aamp.${DOMAIN}.${agentId}.inbox`, payload);
    try {
      await nats.js.publish(`aamp.${DOMAIN}.${agentId}.inbox`, payload, { msgID: envelope.messageId });
    } catch {
    }
    await registry.touch(agentId);
    console.log(`[relay-node] Inbound: ${envelope.messageId} \u2192 ${agentId}`);
    return c.json({ messageId: envelope.messageId, status: "delivered" }, 202);
  });
  return app;
}
async function routeEnvelope(envelope, config2, nats, federation, registry, resolver) {
  const isReplyType = [MessageType.RESPONSE, MessageType.PROBE_RESPONSE, MessageType.STATUS, MessageType.CONFIRM, MessageType.CANCEL].includes(envelope.messageType);
  if (isReplyType && envelope.replyToMailbox) {
    nats.nc.publish(envelope.replyToMailbox, new TextEncoder().encode(JSON.stringify(envelope)));
    return;
  }
  const localReg = await registry.get(envelope.recipientDid);
  if (localReg) {
    deliver(envelope, localReg.agentId, nats, config2);
    return;
  }
  if (envelope.recipientDid.startsWith(`did:web:${DOMAIN}`)) {
    const agentId = envelope.recipientDid.split(":").pop();
    deliver(envelope, agentId, nats, config2);
    return;
  }
  const result = await federation.forwardToRemoteRelay(envelope);
  if (!result.success) throw new Error(`Federation failed: ${result.error}`);
}
function deliver(envelope, agentId, nats, config2) {
  const payload = new TextEncoder().encode(JSON.stringify(envelope));
  const subj = `aamp.${config2.domain}.${agentId}.inbox`;
  nats.nc.publish(subj, payload);
  nats.js.publish(subj, payload, { msgID: envelope.messageId }).catch(() => {
  });
}
async function main() {
  const nats = await connectNats();
  const app = buildNodeApp(nats);
  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`[relay-node] Relay C (${DOMAIN}) listening on http://localhost:${info.port}`);
    console.log(`[relay-node] Provider: Vercel Sandbox`);
  });
}
main().catch((err2) => {
  console.error("[relay-node] Fatal:", err2);
  process.exit(1);
});
/*! Bundled license information:

@noble/ed25519/index.js:
  (*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) *)

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
