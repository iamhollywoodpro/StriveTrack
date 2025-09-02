var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// ../.wrangler/tmp/bundle-TwJjzZ/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-TwJjzZ/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// ../node_modules/uuid/dist/esm-browser/rng.js
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
var getRandomValues, rnds8;
var init_rng = __esm({
  "../node_modules/uuid/dist/esm-browser/rng.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    rnds8 = new Uint8Array(16);
    __name(rng, "rng");
  }
});

// ../node_modules/uuid/dist/esm-browser/regex.js
var regex_default;
var init_regex = __esm({
  "../node_modules/uuid/dist/esm-browser/regex.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// ../node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "../node_modules/uuid/dist/esm-browser/validate.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_regex();
    __name(validate, "validate");
    validate_default = validate;
  }
});

// ../node_modules/uuid/dist/esm-browser/stringify.js
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "../node_modules/uuid/dist/esm-browser/stringify.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    __name(unsafeStringify, "unsafeStringify");
    __name(stringify, "stringify");
    stringify_default = stringify;
  }
});

// ../node_modules/uuid/dist/esm-browser/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "../node_modules/uuid/dist/esm-browser/v1.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    __name(v1, "v1");
    v1_default = v1;
  }
});

// ../node_modules/uuid/dist/esm-browser/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "../node_modules/uuid/dist/esm-browser/parse.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_validate();
    __name(parse, "parse");
    parse_default = parse;
  }
});

// ../node_modules/uuid/dist/esm-browser/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  __name(generateUUID, "generateUUID");
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "../node_modules/uuid/dist/esm-browser/v35.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_stringify();
    init_parse();
    __name(stringToBytes, "stringToBytes");
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    __name(v35, "v35");
  }
});

// ../node_modules/uuid/dist/esm-browser/md5.js
function md5(bytes) {
  if (typeof bytes === "string") {
    const msg = unescape(encodeURIComponent(bytes));
    bytes = new Uint8Array(msg.length);
    for (let i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }
  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
function md5ToHexEncodedArray(input) {
  const output = [];
  const length32 = input.length * 32;
  const hexTab = "0123456789abcdef";
  for (let i = 0; i < length32; i += 8) {
    const x = input[i >> 5] >>> i % 32 & 255;
    const hex = parseInt(hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15), 16);
    output.push(hex);
  }
  return output;
}
function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
function wordsToMd5(x, len) {
  x[len >> 5] |= 128 << len % 32;
  x[getOutputLength(len) - 1] = len;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }
  const length8 = input.length * 8;
  const output = new Uint32Array(getOutputLength(length8));
  for (let i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 255) << i % 32;
  }
  return output;
}
function safeAdd(x, y) {
  const lsw = (x & 65535) + (y & 65535);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
var md5_default;
var init_md5 = __esm({
  "../node_modules/uuid/dist/esm-browser/md5.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(md5, "md5");
    __name(md5ToHexEncodedArray, "md5ToHexEncodedArray");
    __name(getOutputLength, "getOutputLength");
    __name(wordsToMd5, "wordsToMd5");
    __name(bytesToWords, "bytesToWords");
    __name(safeAdd, "safeAdd");
    __name(bitRotateLeft, "bitRotateLeft");
    __name(md5cmn, "md5cmn");
    __name(md5ff, "md5ff");
    __name(md5gg, "md5gg");
    __name(md5hh, "md5hh");
    __name(md5ii, "md5ii");
    md5_default = md5;
  }
});

// ../node_modules/uuid/dist/esm-browser/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "../node_modules/uuid/dist/esm-browser/v3.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_v35();
    init_md5();
    v3 = v35("v3", 48, md5_default);
    v3_default = v3;
  }
});

// ../node_modules/uuid/dist/esm-browser/native.js
var randomUUID, native_default;
var init_native = __esm({
  "../node_modules/uuid/dist/esm-browser/native.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
    native_default = {
      randomUUID
    };
  }
});

// ../node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "../node_modules/uuid/dist/esm-browser/v4.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_native();
    init_rng();
    init_stringify();
    __name(v4, "v4");
    v4_default = v4;
  }
});

// ../node_modules/uuid/dist/esm-browser/sha1.js
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;
    case 1:
      return x ^ y ^ z;
    case 2:
      return x & y ^ x & z ^ y & z;
    case 3:
      return x ^ y ^ z;
  }
}
function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}
function sha1(bytes) {
  const K = [1518500249, 1859775393, 2400959708, 3395469782];
  const H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof bytes === "string") {
    const msg = unescape(encodeURIComponent(bytes));
    bytes = [];
    for (let i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  } else if (!Array.isArray(bytes)) {
    bytes = Array.prototype.slice.call(bytes);
  }
  bytes.push(128);
  const l = bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = new Array(N);
  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);
    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
    M[i] = arr;
  }
  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);
    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }
    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }
  return [H[0] >> 24 & 255, H[0] >> 16 & 255, H[0] >> 8 & 255, H[0] & 255, H[1] >> 24 & 255, H[1] >> 16 & 255, H[1] >> 8 & 255, H[1] & 255, H[2] >> 24 & 255, H[2] >> 16 & 255, H[2] >> 8 & 255, H[2] & 255, H[3] >> 24 & 255, H[3] >> 16 & 255, H[3] >> 8 & 255, H[3] & 255, H[4] >> 24 & 255, H[4] >> 16 & 255, H[4] >> 8 & 255, H[4] & 255];
}
var sha1_default;
var init_sha1 = __esm({
  "../node_modules/uuid/dist/esm-browser/sha1.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(f, "f");
    __name(ROTL, "ROTL");
    __name(sha1, "sha1");
    sha1_default = sha1;
  }
});

// ../node_modules/uuid/dist/esm-browser/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "../node_modules/uuid/dist/esm-browser/v5.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_v35();
    init_sha1();
    v5 = v35("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// ../node_modules/uuid/dist/esm-browser/nil.js
var nil_default;
var init_nil = __esm({
  "../node_modules/uuid/dist/esm-browser/nil.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// ../node_modules/uuid/dist/esm-browser/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default;
var init_version = __esm({
  "../node_modules/uuid/dist/esm-browser/version.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_validate();
    __name(version, "version");
    version_default = version;
  }
});

// ../node_modules/uuid/dist/esm-browser/index.js
var esm_browser_exports = {};
__export(esm_browser_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_browser = __esm({
  "../node_modules/uuid/dist/esm-browser/index.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// utils/auth.js
async function getCurrentUser(request, env) {
  const sessionId = request.headers.get("x-session-id");
  if (!sessionId) {
    return null;
  }
  const session = await env.DB.prepare(`
        SELECT s.*, u.id as user_id, u.email, u.role, u.points
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
    `).bind(sessionId).first();
  if (!session) {
    return null;
  }
  return {
    id: session.user_id,
    email: session.email,
    role: session.role,
    points: session.points
  };
}
async function requireAuth(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return user;
}
async function requireAdmin(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  return user;
}
async function createSession(userId, env) {
  const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
  const sessionId = uuidv4();
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  await env.DB.prepare(`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (?, ?, ?)
    `).bind(sessionId, userId, expiresAt.toISOString()).run();
  return sessionId;
}
async function deleteSession(sessionId, env) {
  if (!sessionId) return;
  await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}
async function cleanupExpiredSessions(env) {
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
}
var init_auth = __esm({
  "utils/auth.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(getCurrentUser, "getCurrentUser");
    __name(requireAuth, "requireAuth");
    __name(requireAdmin, "requireAdmin");
    __name(createSession, "createSession");
    __name(deleteSession, "deleteSession");
    __name(cleanupExpiredSessions, "cleanupExpiredSessions");
  }
});

// api/media/file/[id].js
async function onRequestGet(context) {
  const { request, env, params } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const mediaId = params.id;
    if (!mediaId) {
      return new Response("Media ID required", { status: 400 });
    }
    const media = await env.DB.prepare(`
            SELECT * FROM media_uploads WHERE id = ?
        `).bind(mediaId).first();
    if (!media) {
      return new Response("Media not found", { status: 404 });
    }
    if (media.user_id !== user.id && user.role !== "admin") {
      return new Response("Access denied", { status: 403 });
    }
    const object = await env.MEDIA_BUCKET.get(media.r2_key);
    if (!object) {
      return new Response("File not found", { status: 404 });
    }
    return new Response(object.body, {
      headers: {
        "Content-Type": media.file_type,
        "Content-Length": object.size,
        "Cache-Control": "public, max-age=31536000",
        // Cache for 1 year
        "Content-Disposition": `inline; filename="${media.original_name}"`
      }
    });
  } catch (error) {
    console.error("Serve media error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
var init_id = __esm({
  "api/media/file/[id].js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestGet, "onRequestGet");
  }
});

// api/media/[id]/delete.js
async function onRequestDelete(context) {
  const { request, env, params } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const mediaId = params.id;
    if (!mediaId) {
      return new Response(JSON.stringify({
        error: "Media ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const media = await env.DB.prepare(`
            SELECT * FROM media_uploads 
            WHERE id = ? AND user_id = ?
        `).bind(mediaId, user.id).first();
    if (!media) {
      return new Response(JSON.stringify({
        error: "Media not found or you do not have permission to delete it"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      await env.MEDIA_BUCKET.delete(media.r2_key);
    } catch (r2Error) {
      console.error("R2 delete error:", r2Error);
    }
    await env.DB.prepare(`
            DELETE FROM media_uploads WHERE id = ? AND user_id = ?
        `).bind(mediaId, user.id).run();
    const pointsToDeduct = media.media_type === "before" ? 10 : media.media_type === "after" ? 15 : 5;
    await env.DB.prepare("UPDATE users SET points = points - ? WHERE id = ?").bind(pointsToDeduct, user.id).run();
    return new Response(JSON.stringify({
      message: "Media deleted successfully",
      points_deducted: pointsToDeduct
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_delete = __esm({
  "api/media/[id]/delete.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestDelete, "onRequestDelete");
  }
});

// utils/achievements.js
var achievements_exports = {};
__export(achievements_exports, {
  checkAndAwardAchievements: () => checkAndAwardAchievements,
  checkNutritionAchievements: () => checkNutritionAchievements,
  checkVideoAchievements: () => checkVideoAchievements,
  createUserReminders: () => createUserReminders
});
async function checkAndAwardAchievements(userId, actionType, actionData, env) {
  try {
    const newAchievements = [];
    const userStats = await getUserStats(userId, env);
    const unearned = await env.DB.prepare(`
            SELECT a.* FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE ua.id IS NULL AND a.is_recurring = 0
        `).bind(userId).all();
    const unearnedAchievements = unearned.results || [];
    const videoAchievements = await checkVideoAchievements(env.DB, userId);
    const nutritionAchievements = await checkNutritionAchievements(env.DB, userId);
    newAchievements.push(...videoAchievements, ...nutritionAchievements);
    for (const achievement of unearnedAchievements) {
      let shouldUnlock = false;
      switch (achievement.requirement_type) {
        case "account_created":
          shouldUnlock = true;
          break;
        case "habits_created":
          shouldUnlock = userStats.habits_created >= achievement.requirement_value;
          break;
        case "total_completions":
          shouldUnlock = userStats.total_completions >= achievement.requirement_value;
          break;
        case "photos_uploaded":
          shouldUnlock = userStats.photos_uploaded >= achievement.requirement_value;
          break;
        case "videos_uploaded":
          shouldUnlock = userStats.videos_uploaded >= achievement.requirement_value;
          break;
        case "total_media":
          shouldUnlock = userStats.total_media >= achievement.requirement_value;
          break;
        case "total_points":
          shouldUnlock = userStats.total_points >= achievement.requirement_value;
          break;
        case "habit_streak":
          shouldUnlock = false;
          break;
        case "weekly_before_after":
          if (actionType === "media_upload") {
            shouldUnlock = await checkWeeklyBeforeAfter(userId, env);
          }
          break;
        case "morning_completions":
          if (actionType === "habit_completion" && actionData?.time) {
            const hour = new Date(actionData.time).getHours();
            if (hour < 10) {
              const morningCount = await getMorningCompletions(userId, env);
              shouldUnlock = morningCount >= achievement.requirement_value;
            }
          }
          break;
        case "weekend_streaks":
          if (actionType === "habit_completion") {
            shouldUnlock = await checkWeekendStreaks(userId, achievement.requirement_value, env);
          }
          break;
        case "habit_categories":
          shouldUnlock = await checkHabitVariety(userId, achievement.requirement_value, env);
          break;
        // Social & Community Achievement Types
        case "friends_count":
          shouldUnlock = await checkFriendsCount(userId, achievement.requirement_value, env);
          break;
        case "weekly_rank":
          shouldUnlock = await checkWeeklyRank(userId, achievement.requirement_value, env);
          break;
        case "top_5_weeks":
          shouldUnlock = await checkConsecutiveTopRanking(userId, achievement.requirement_value, env);
          break;
        // Analytics & Data Achievement Types
        case "stats_views":
          shouldUnlock = await checkStatsViews(userId, achievement.requirement_value, env);
          break;
        case "progress_views":
          shouldUnlock = await checkProgressViews(userId, achievement.requirement_value, env);
          break;
        case "leaderboard_views":
          shouldUnlock = await checkLeaderboardViews(userId, achievement.requirement_value, env);
          break;
        // Enhanced Habit & Routine Achievement Types
        case "routine_consistency":
          shouldUnlock = await checkRoutineConsistency(userId, achievement.requirement_value, env);
          break;
        case "morning_habit_streak":
          shouldUnlock = await checkMorningHabitStreak(userId, achievement.requirement_value, env);
          break;
        case "evening_habit_streak":
          shouldUnlock = await checkEveningHabitStreak(userId, achievement.requirement_value, env);
          break;
        case "weekend_consistency":
          shouldUnlock = await checkWeekendConsistency(userId, achievement.requirement_value, env);
          break;
        // Enhanced Progress Tracking
        case "monthly_video_comparisons":
          shouldUnlock = await checkMonthlyVideoComparisons(userId, achievement.requirement_value, env);
          break;
        case "described_uploads":
          shouldUnlock = await checkDescribedUploads(userId, achievement.requirement_value, env);
          break;
        case "weekly_photo_streak":
          shouldUnlock = await checkWeeklyPhotoStreak(userId, achievement.requirement_value, env);
          break;
        case "weekly_video_streak":
          shouldUnlock = await checkWeeklyVideoStreak(userId, achievement.requirement_value, env);
          break;
        case "progress_day_streak":
          shouldUnlock = await checkProgressDayStreak(userId, achievement.requirement_value, env);
          break;
        // Advanced Nutrition Achievement Types
        case "macro_perfect_streak":
          shouldUnlock = await checkMacroPerfectStreak(userId, achievement.requirement_value, env);
          break;
        case "hydration_streak":
          shouldUnlock = await checkHydrationStreak(userId, achievement.requirement_value, env);
          break;
        case "custom_recipes":
          shouldUnlock = await checkCustomRecipes(userId, achievement.requirement_value, env);
          break;
        case "nutrition_tracking_streak":
          shouldUnlock = await checkNutritionTrackingStreak(userId, achievement.requirement_value, env);
          break;
        case "balanced_macro_streak":
          shouldUnlock = await checkBalancedMacroStreak(userId, achievement.requirement_value, env);
          break;
        // Challenge & Goals Achievement Types
        case "daily_challenges_completed":
          shouldUnlock = await checkDailyChallengesCompleted(userId, achievement.requirement_value, env);
          break;
        case "perfect_challenge_week":
          shouldUnlock = await checkPerfectChallengeWeek(userId, achievement.requirement_value, env);
          break;
        case "weekly_goals_completed":
          shouldUnlock = await checkWeeklyGoalsCompleted(userId, achievement.requirement_value, env);
          break;
        case "simultaneous_streaks":
          shouldUnlock = await checkSimultaneousStreaks(userId, achievement.requirement_value, env);
          break;
        case "streak_comeback":
          shouldUnlock = await checkStreakComeback(userId, achievement.requirement_value, env);
          break;
        // Enhanced Consistency Achievement Types
        case "login_streak":
          shouldUnlock = await checkLoginStreak(userId, achievement.requirement_value, env);
          break;
        case "single_habit_streak":
          shouldUnlock = await checkSingleHabitStreak(userId, achievement.requirement_value, env);
          break;
        case "multi_habit_streaks":
          shouldUnlock = await checkMultiHabitStreaks(userId, achievement.requirement_value, env);
          break;
        case "yearly_consistency":
          shouldUnlock = await checkYearlyConsistency(userId, achievement.requirement_value, env);
          break;
        case "perfect_consistency":
          shouldUnlock = await checkPerfectConsistency(userId, achievement.requirement_value, env);
          break;
        // Enhanced Onboarding Achievement Types
        case "feature_exploration":
          shouldUnlock = await checkFeatureExploration(userId, achievement.requirement_value, env);
          break;
        case "early_engagement":
          shouldUnlock = await checkEarlyEngagement(userId, achievement.requirement_value, env);
          break;
        case "early_invites":
          shouldUnlock = await checkEarlyInvites(userId, achievement.requirement_value, env);
          break;
        case "fast_achievements":
          shouldUnlock = await checkFastAchievements(userId, achievement.requirement_value, env);
          break;
        case "commitment_streak":
          shouldUnlock = await checkCommitmentStreak(userId, achievement.requirement_value, env);
          break;
        // Combo & Streak Achievement Types
        case "achievement_combo":
          shouldUnlock = false;
          break;
        case "daily_achievement_count":
          shouldUnlock = await checkDailyAchievementCount(userId, achievement.requirement_value, env);
          break;
        case "category_mastery":
          shouldUnlock = await checkCategoryMastery(userId, achievement.category, env);
          break;
        case "daily_achievement_streak":
          shouldUnlock = await checkDailyAchievementStreak(userId, achievement.requirement_value, env);
          break;
        case "weekly_achievement_streak":
          shouldUnlock = await checkWeeklyAchievementStreak(userId, achievement.requirement_value, env);
          break;
        case "total_achievements":
          shouldUnlock = await checkTotalAchievements(userId, achievement.requirement_value, env);
          break;
        case "achievements_in_timeframe":
          shouldUnlock = await checkAchievementsInTimeframe(userId, achievement.requirement_value, env);
          break;
        case "seasonal_event":
          shouldUnlock = await checkSeasonalEvent(userId, achievement.requirement_value, env);
          break;
        case "monthly_challenge":
          shouldUnlock = await checkMonthlyChallenge(userId, achievement.requirement_value, env);
          break;
        case "consecutive_monthly":
          shouldUnlock = await checkConsecutiveMonthly(userId, achievement.requirement_value, env);
          break;
        case "achievement_rank":
          shouldUnlock = await checkAchievementRank(userId, achievement.requirement_value, env);
          break;
        case "achievement_leaderboard":
          shouldUnlock = await checkAchievementLeaderboard(userId, achievement.requirement_value, env);
          break;
        case "perfect_category":
          shouldUnlock = await checkPerfectCategory(userId, achievement.requirement_value, env);
          break;
        case "completionist":
          shouldUnlock = await checkCompletionist(userId, achievement.requirement_value, env);
          break;
      }
      if (shouldUnlock) {
        await unlockAchievement(userId, achievement.id, env);
        newAchievements.push(achievement);
      }
    }
    await checkRecurringAchievements(userId, actionType, actionData, env);
    return newAchievements;
  } catch (error) {
    console.error("Achievement check error:", error);
    return [];
  }
}
async function getUserStats(userId, env) {
  const result = await env.DB.prepare(`
        SELECT 
            u.points as total_points,
            u.created_at as user_created_at,
            (SELECT COUNT(*) FROM habits WHERE user_id = ?) as habits_created,
            (SELECT COUNT(*) FROM habit_completions WHERE user_id = ?) as total_completions,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'image/%') as photos_uploaded,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'video/%') as videos_uploaded,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ?) as total_media
        FROM users u
        WHERE u.id = ?
    `).bind(userId, userId, userId, userId, userId, userId).first();
  return result || {
    total_points: 0,
    habits_created: 0,
    total_completions: 0,
    photos_uploaded: 0,
    videos_uploaded: 0,
    total_media: 0
  };
}
async function unlockAchievement(userId, achievementId, env) {
  try {
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const userAchievementId = uuidv4();
    await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id)
            VALUES (?, ?, ?)
        `).bind(userAchievementId, userId, achievementId).run();
    const achievement = await env.DB.prepare(
      "SELECT points FROM achievements WHERE id = ?"
    ).bind(achievementId).first();
    if (achievement && achievement.points > 0) {
      await env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?").bind(achievement.points, userId).run();
    }
    return true;
  } catch (error) {
    console.error("Unlock achievement error:", error);
    return false;
  }
}
async function checkWeeklyBeforeAfter(userId, env) {
  const now = /* @__PURE__ */ new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  const weeklyPhotos = await env.DB.prepare(`
        SELECT uploaded_at FROM media_uploads 
        WHERE user_id = ? 
        AND file_type LIKE 'image/%' 
        AND uploaded_at >= ? 
        AND uploaded_at <= ?
        ORDER BY uploaded_at
    `).bind(userId, weekStart.toISOString(), weekEnd.toISOString()).all();
  const photos = weeklyPhotos.results || [];
  if (photos.length >= 2) {
    const firstPhoto = new Date(photos[0].uploaded_at);
    const lastPhoto = new Date(photos[photos.length - 1].uploaded_at);
    const daysDiff = Math.floor((lastPhoto - firstPhoto) / (1e3 * 60 * 60 * 24));
    return daysDiff >= 3;
  }
  return false;
}
async function getMorningCompletions(userId, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM habit_completions 
        WHERE user_id = ? 
        AND strftime('%H', completed_at) < '10'
    `).bind(userId).first();
  return result?.count || 0;
}
async function checkWeekendStreaks(userId, targetStreaks, env) {
  return false;
}
async function checkHabitVariety(userId, targetCategories, env) {
  const habits = await env.DB.prepare(`
        SELECT name FROM habits WHERE user_id = ?
    `).bind(userId).all();
  const habitList = habits.results || [];
  const categories = /* @__PURE__ */ new Set();
  habitList.forEach((habit) => {
    const name = habit.name.toLowerCase();
    if (name.includes("\u{1F4A7}") || name.includes("water")) categories.add("hydration");
    if (name.includes("\u{1F3C3}") || name.includes("cardio") || name.includes("run")) categories.add("cardio");
    if (name.includes("\u{1F4AA}") || name.includes("strength") || name.includes("gym")) categories.add("strength");
    if (name.includes("\u{1F34E}") || name.includes("nutrition") || name.includes("eat")) categories.add("nutrition");
    if (name.includes("\u{1F634}") || name.includes("sleep") || name.includes("rest")) categories.add("wellness");
    if (name.includes("\u{1F4DA}") || name.includes("read") || name.includes("study")) categories.add("learning");
    if (name.includes("\u{1F9D8}") || name.includes("meditat") || name.includes("mindful")) categories.add("mindfulness");
  });
  return categories.size >= targetCategories;
}
async function checkRecurringAchievements(userId, actionType, actionData, env) {
  return [];
}
async function checkVideoAchievements(db, userId) {
  const unlockedAchievements = [];
  try {
    const videoStats = await db.prepare(`
            SELECT 
                COUNT(*) as total_videos,
                COUNT(CASE WHEN video_type = 'progress' THEN 1 END) as progress_videos,
                COUNT(CASE WHEN is_before_after = 1 THEN 1 END) as before_after_videos,
                COUNT(CASE WHEN upload_date >= date('now', 'start of month') THEN 1 END) as this_month_videos,
                COUNT(CASE WHEN upload_date >= date('now', '-7 days') THEN 1 END) as this_week_videos
            FROM user_video_uploads
            WHERE user_id = ?
        `).bind(userId).first();
    const weeklyConsistency = await db.prepare(`
            SELECT COUNT(DISTINCT week_number) as consistent_weeks
            FROM user_video_uploads
            WHERE user_id = ? AND upload_date >= date('now', '-28 days')
        `).bind(userId).first();
    const achievements = [
      { id: "video_first_upload", check: videoStats.total_videos >= 1 },
      { id: "video_weekly_creator", check: weeklyConsistency.consistent_weeks >= 4 },
      { id: "video_monthly_diary", check: videoStats.this_month_videos >= 7 },
      { id: "video_master", check: videoStats.total_videos >= 30 },
      { id: "before_after_video", check: videoStats.before_after_videos >= 1 },
      { id: "video_consistency_pro", check: await checkVideoConsistency(db, userId, 12) }
    ];
    for (const achievement of achievements) {
      if (achievement.check) {
        const unlocked = await unlockAchievementIfNotEarned(db, userId, achievement.id);
        if (unlocked) unlockedAchievements.push(unlocked);
      }
    }
  } catch (error) {
    console.error("Video achievement check error:", error);
  }
  return unlockedAchievements;
}
async function checkNutritionAchievements(db, userId) {
  const unlockedAchievements = [];
  try {
    const nutritionStats = await db.prepare(`
            SELECT COUNT(*) as total_logs FROM user_nutrition_logs WHERE user_id = ?
        `).bind(userId).first();
    const streakStats = await getNutritionStreakStats(db, userId);
    const uniqueFoods = await db.prepare(`
            SELECT COUNT(DISTINCT food_name) as unique_count
            FROM user_nutrition_logs WHERE user_id = ?
        `).bind(userId).first();
    const customRecipes = await db.prepare(`
            SELECT COUNT(DISTINCT food_name) as recipe_count
            FROM user_nutrition_logs WHERE user_id = ? AND is_custom_recipe = 1
        `).bind(userId).first();
    const achievements = [
      { id: "nutrition_first_log", check: nutritionStats.total_logs >= 1 },
      { id: "protein_champion", check: streakStats.protein_streak >= 7 },
      { id: "carb_counter", check: streakStats.tracking_streak >= 14 },
      { id: "fat_balance_master", check: streakStats.macro_balance_streak >= 7 },
      { id: "macro_perfect", check: streakStats.macro_perfect_days >= 3 },
      { id: "nutrition_ninja", check: streakStats.tracking_streak >= 30 },
      { id: "calorie_conscious", check: streakStats.calorie_streak >= 7 },
      { id: "target_hitter", check: streakStats.calorie_streak >= 5 },
      { id: "sugar_tracker", check: streakStats.tracking_streak >= 14 },
      { id: "hydration_hero", check: streakStats.water_streak >= 10 },
      { id: "fiber_focus", check: streakStats.tracking_streak >= 7 },
      { id: "macro_mastery", check: streakStats.macro_perfect_days >= 10 },
      { id: "nutrition_consistency", check: streakStats.tracking_streak >= 100 },
      { id: "meal_variety", check: uniqueFoods.unique_count >= 50 },
      { id: "recipe_creator", check: customRecipes.recipe_count >= 10 }
    ];
    for (const achievement of achievements) {
      if (achievement.check) {
        const unlocked = await unlockAchievementIfNotEarned(db, userId, achievement.id);
        if (unlocked) unlockedAchievements.push(unlocked);
      }
    }
  } catch (error) {
    console.error("Nutrition achievement check error:", error);
  }
  return unlockedAchievements;
}
async function checkVideoConsistency(db, userId, weeks) {
  const result = await db.prepare(`
        SELECT COUNT(DISTINCT week_number) as consistent_weeks
        FROM user_video_uploads
        WHERE user_id = ? AND upload_date >= date('now', '-' || ? || ' days')
    `).bind(userId, weeks * 7).first();
  return result.consistent_weeks >= weeks;
}
async function getNutritionStreakStats(db, userId) {
  const recentDays = await db.prepare(`
        SELECT log_date, macro_balance_score, met_calorie_goal, met_protein_goal, 
               met_carbs_goal, met_fat_goal, total_water_ml
        FROM user_daily_nutrition
        WHERE user_id = ?
        ORDER BY log_date DESC
        LIMIT 100
    `).bind(userId).all();
  let trackingStreak = 0;
  let proteinStreak = 0;
  let calorieStreak = 0;
  let macroBalanceStreak = 0;
  let waterStreak = 0;
  let macroPerfectDays = 0;
  for (const day of recentDays.results || []) {
    if (day.macro_balance_score > 0) trackingStreak++;
    else break;
    if (day.met_protein_goal && proteinStreak === trackingStreak - 1) proteinStreak++;
    if (day.met_calorie_goal && calorieStreak === trackingStreak - 1) calorieStreak++;
    if (day.met_protein_goal && day.met_carbs_goal && day.met_fat_goal) {
      if (macroBalanceStreak === trackingStreak - 1) macroBalanceStreak++;
      macroPerfectDays++;
    }
    if (day.total_water_ml >= 2e3 && waterStreak === trackingStreak - 1) waterStreak++;
  }
  return {
    tracking_streak: trackingStreak,
    protein_streak: proteinStreak,
    calorie_streak: calorieStreak,
    macro_balance_streak: macroBalanceStreak,
    water_streak: waterStreak,
    macro_perfect_days: macroPerfectDays
  };
}
async function unlockAchievementIfNotEarned(db, userId, achievementId) {
  const existing = await db.prepare(`
        SELECT id FROM user_achievements 
        WHERE user_id = ? AND achievement_id = ?
    `).bind(userId, achievementId).first();
  if (existing) return null;
  const achievement = await db.prepare(`
        SELECT * FROM achievements WHERE id = ?
    `).bind(achievementId).first();
  if (!achievement) return null;
  const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
  const userAchievementId = uuidv4();
  await db.prepare(`
        INSERT INTO user_achievements (id, user_id, achievement_id, points_earned)
        VALUES (?, ?, ?, ?)
    `).bind(userAchievementId, userId, achievementId, achievement.points).run();
  await db.prepare(`
        UPDATE users SET points = points + ? WHERE id = ?
    `).bind(achievement.points, userId).run();
  return achievement;
}
async function createUserReminders(userId, env) {
  try {
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const reminders = [
      {
        id: uuidv4(),
        user_id: userId,
        reminder_type: "weekly_photo",
        title: "\u{1F4F8} Weekly Before Photo",
        message: "Time to take your weekly before photo! Document your starting point for this week.",
        trigger_day: "sunday",
        trigger_time: "09:00"
      },
      {
        id: uuidv4(),
        user_id: userId,
        reminder_type: "weekly_photo",
        title: "\u{1F4F8} Weekly After Photo",
        message: "Great week! Time to take your weekly after photo and see your progress.",
        trigger_day: "saturday",
        trigger_time: "18:00"
      },
      {
        id: uuidv4(),
        user_id: userId,
        reminder_type: "habit",
        title: "\u{1F4AA} Daily Habit Check",
        message: "Don't forget to complete your daily habits! You've got this!",
        trigger_day: "daily",
        trigger_time: "10:00"
      },
      {
        id: uuidv4(),
        user_id: userId,
        reminder_type: "achievement",
        title: "\u{1F3C6} Weekly Achievement Review",
        message: "Check your achievements and see what you've accomplished this week!",
        trigger_day: "sunday",
        trigger_time: "20:00"
      }
    ];
    for (const reminder of reminders) {
      await env.DB.prepare(`
                INSERT INTO user_reminders 
                (id, user_id, reminder_type, title, message, trigger_day, trigger_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
        reminder.id,
        reminder.user_id,
        reminder.reminder_type,
        reminder.title,
        reminder.message,
        reminder.trigger_day,
        reminder.trigger_time
      ).run();
    }
    return reminders;
  } catch (error) {
    console.error("Create reminders error:", error);
    return [];
  }
}
async function checkFriendsCount(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as friend_count 
        FROM friendships 
        WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    `).bind(userId, userId).first();
  return result.friend_count >= requiredCount;
}
async function checkWeeklyRank(userId, maxRank, env) {
  const weekStart = getWeekStart(/* @__PURE__ */ new Date());
  const result = await env.DB.prepare(`
        SELECT COUNT(*) + 1 as rank
        FROM (
            SELECT u.id, SUM(hc.points) as weekly_points
            FROM users u
            LEFT JOIN habit_completions hc ON u.id = hc.user_id 
                AND date(hc.created_at) >= date(?)
            GROUP BY u.id
            HAVING weekly_points > (
                SELECT SUM(hc2.points) 
                FROM habit_completions hc2 
                WHERE hc2.user_id = ? AND date(hc2.created_at) >= date(?)
            )
        )
    `).bind(weekStart, userId, weekStart).first();
  return result.rank <= maxRank;
}
async function checkConsecutiveTopRanking(userId, requiredWeeks, env) {
  let consecutiveWeeks = 0;
  const currentDate = /* @__PURE__ */ new Date();
  for (let i = 0; i < requiredWeeks + 5; i++) {
    const weekStart = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1e3);
    const rank = await getUserWeeklyRank(userId, weekStart, env);
    if (rank <= 5) {
      consecutiveWeeks++;
      if (consecutiveWeeks >= requiredWeeks) return true;
    } else {
      consecutiveWeeks = 0;
    }
  }
  return false;
}
async function checkStatsViews(userId, requiredViews, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as view_count 
        FROM user_activity_log 
        WHERE user_id = ? AND activity_type = 'stats_view'
    `).bind(userId).first();
  return result.view_count >= requiredViews;
}
async function checkProgressViews(userId, requiredViews, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as view_count 
        FROM user_activity_log 
        WHERE user_id = ? AND activity_type = 'progress_view'
    `).bind(userId).first();
  return result.view_count >= requiredViews;
}
async function checkLeaderboardViews(userId, requiredViews, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as view_count 
        FROM user_activity_log 
        WHERE user_id = ? AND activity_type = 'leaderboard_view'
    `).bind(userId).first();
  return result.view_count >= requiredViews;
}
async function checkRoutineConsistency(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as consistent_days
        FROM habit_completions hc1
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays + 10} days')
        AND EXISTS (
            SELECT 1 FROM habit_completions hc2
            WHERE hc2.user_id = hc1.user_id
            AND date(hc2.created_at) = date(hc1.created_at, '+1 day')
            AND hc2.habit_id = hc1.habit_id
        )
    `).bind(userId).first();
  return result.consistent_days >= requiredDays;
}
async function checkMorningHabitStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as morning_days
        FROM (
            SELECT date(created_at) as completion_date
            FROM habit_completions
            WHERE user_id = ? 
            AND time(created_at) <= '08:00:00'
            AND date(created_at) >= date('now', '-${requiredDays + 5} days')
            GROUP BY date(created_at)
            HAVING COUNT(*) > 0
        )
    `).bind(userId).first();
  return result.morning_days >= requiredDays;
}
async function checkEveningHabitStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as evening_days
        FROM (
            SELECT date(created_at) as completion_date
            FROM habit_completions
            WHERE user_id = ? 
            AND time(created_at) >= '18:00:00'
            AND date(created_at) >= date('now', '-${requiredDays + 5} days')
            GROUP BY date(created_at)
            HAVING COUNT(*) > 0
        )
    `).bind(userId).first();
  return result.evening_days >= requiredDays;
}
async function checkWeekendConsistency(userId, requiredWeekends, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as weekend_count
        FROM (
            SELECT strftime('%Y-%W', created_at) as week_year
            FROM habit_completions
            WHERE user_id = ? 
            AND strftime('%w', created_at) IN ('0', '6')
            GROUP BY strftime('%Y-%W', created_at)
            HAVING COUNT(DISTINCT strftime('%w', created_at)) = 2
        )
    `).bind(userId).first();
  return result.weekend_count >= requiredWeekends;
}
async function checkMonthlyVideoComparisons(userId, requiredMonths, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) as month_count
        FROM media_uploads
        WHERE user_id = ? 
        AND file_type LIKE 'video/%'
        AND video_type IN ('before', 'after')
    `).bind(userId).first();
  return result.month_count >= requiredMonths;
}
async function checkDescribedUploads(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as described_count
        FROM media_uploads
        WHERE user_id = ? 
        AND description IS NOT NULL 
        AND description != ''
    `).bind(userId).first();
  return result.described_count >= requiredCount;
}
async function checkWeeklyPhotoStreak(userId, requiredWeeks, env) {
  let consecutiveWeeks = 0;
  const currentDate = /* @__PURE__ */ new Date();
  for (let i = 0; i < requiredWeeks + 2; i++) {
    const weekStart = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1e3);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1e3);
    const result = await env.DB.prepare(`
            SELECT COUNT(*) as photo_count
            FROM media_uploads
            WHERE user_id = ? 
            AND file_type LIKE 'image/%'
            AND date(created_at) BETWEEN date(?) AND date(?)
        `).bind(userId, weekStart.toISOString().split("T")[0], weekEnd.toISOString().split("T")[0]).first();
    if (result.photo_count > 0) {
      consecutiveWeeks++;
      if (consecutiveWeeks >= requiredWeeks) return true;
    } else {
      consecutiveWeeks = 0;
    }
  }
  return false;
}
async function checkWeeklyVideoStreak(userId, requiredWeeks, env) {
  let consecutiveWeeks = 0;
  const currentDate = /* @__PURE__ */ new Date();
  for (let i = 0; i < requiredWeeks + 2; i++) {
    const weekStart = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1e3);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1e3);
    const result = await env.DB.prepare(`
            SELECT COUNT(*) as video_count
            FROM media_uploads
            WHERE user_id = ? 
            AND file_type LIKE 'video/%'
            AND date(created_at) BETWEEN date(?) AND date(?)
        `).bind(userId, weekStart.toISOString().split("T")[0], weekEnd.toISOString().split("T")[0]).first();
    if (result.video_count > 0) {
      consecutiveWeeks++;
      if (consecutiveWeeks >= requiredWeeks) return true;
    } else {
      consecutiveWeeks = 0;
    }
  }
  return false;
}
async function checkProgressDayStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as upload_days
        FROM media_uploads
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
  return result.upload_days >= requiredDays;
}
async function checkMacroPerfectStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT MAX(consecutive_days) as max_streak
        FROM (
            SELECT COUNT(*) as consecutive_days
            FROM user_daily_nutrition udn
            WHERE user_id = ? 
            AND protein_target_met = 1 
            AND carbs_target_met = 1 
            AND fat_target_met = 1
            AND date >= date('now', '-${requiredDays + 10} days')
        )
    `).bind(userId).first();
  return result.max_streak >= requiredDays;
}
async function checkHydrationStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as hydration_days
        FROM user_daily_nutrition
        WHERE user_id = ? 
        AND water_target_met = 1
        AND date >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
  return result.hydration_days >= requiredDays;
}
async function checkCustomRecipes(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT food_name) as recipe_count
        FROM user_nutrition_logs
        WHERE user_id = ? AND is_custom_recipe = 1
    `).bind(userId).first();
  return result.recipe_count >= requiredCount;
}
async function checkNutritionTrackingStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as tracking_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
  return result.tracking_days >= requiredDays;
}
async function checkBalancedMacroStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as balanced_days
        FROM user_daily_nutrition
        WHERE user_id = ? 
        AND ABS(protein_percentage - 25) <= 2.5
        AND ABS(carbs_percentage - 45) <= 4.5
        AND ABS(fat_percentage - 30) <= 3.0
        AND date >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
  return result.balanced_days >= requiredDays;
}
async function checkDailyChallengesCompleted(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as completed_count
        FROM daily_challenge_completions dcc
        JOIN daily_challenges dc ON dcc.challenge_id = dc.id
        WHERE dcc.user_id = ?
    `).bind(userId).first();
  return result.completed_count >= requiredCount;
}
async function checkPerfectChallengeWeek(userId, requiredWeeks, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as perfect_weeks
        FROM (
            SELECT strftime('%Y-%W', dcc.created_at) as week_year,
                   COUNT(*) as completed,
                   (SELECT COUNT(*) FROM daily_challenges 
                    WHERE date BETWEEN date(?, 'weekday 0', '-6 days') AND date(?)) as total
            FROM daily_challenge_completions dcc
            WHERE user_id = ?
            GROUP BY strftime('%Y-%W', dcc.created_at)
            HAVING completed = total AND total > 0
        )
    `).bind(getWeekStart(/* @__PURE__ */ new Date()).toISOString(), (/* @__PURE__ */ new Date()).toISOString(), userId).first();
  return result.perfect_weeks >= requiredWeeks;
}
async function checkWeeklyGoalsCompleted(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as goals_completed
        FROM (
            SELECT strftime('%Y-%W', hc.created_at) as week_year
            FROM habit_completions hc
            JOIN habits h ON hc.habit_id = h.id
            WHERE h.user_id = ?
            GROUP BY h.id, strftime('%Y-%W', hc.created_at)
            HAVING COUNT(*) >= h.weekly_target
        )
    `).bind(userId).first();
  return result.goals_completed >= requiredCount;
}
async function checkSimultaneousStreaks(userId, requiredStreaks, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as active_streaks
        FROM habits h
        WHERE h.user_id = ? AND (
            SELECT COUNT(DISTINCT date(hc.created_at))
            FROM habit_completions hc
            WHERE hc.habit_id = h.id
            AND date(hc.created_at) >= date('now', '-35 days')
        ) >= 30
    `).bind(userId).first();
  return result.active_streaks >= requiredStreaks;
}
async function checkStreakComeback(userId, requiredCount, env) {
  return false;
}
async function checkLoginStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as login_days
        FROM user_activity_log
        WHERE user_id = ? 
        AND activity_type = 'login'
        AND date(created_at) >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
  return result.login_days >= requiredDays;
}
async function checkSingleHabitStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT MAX(streak_days) as max_streak
        FROM (
            SELECT habit_id, COUNT(DISTINCT date(created_at)) as streak_days
            FROM habit_completions
            WHERE user_id = ?
            AND date(created_at) >= date('now', '-${requiredDays + 10} days')
            GROUP BY habit_id
        )
    `).bind(userId).first();
  return result.max_streak >= requiredDays;
}
async function checkMultiHabitStreaks(userId, requiredStreaks, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as active_streaks
        FROM (
            SELECT habit_id, COUNT(DISTINCT date(created_at)) as streak_days
            FROM habit_completions
            WHERE user_id = ?
            AND date(created_at) >= date('now', '-20 days')
            GROUP BY habit_id
            HAVING streak_days >= 14
        )
    `).bind(userId).first();
  return result.active_streaks >= requiredStreaks;
}
async function checkYearlyConsistency(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as active_days
        FROM habit_completions
        WHERE user_id = ?
        AND date(created_at) >= date('now', '-366 days')
    `).bind(userId).first();
  return result.active_days >= requiredDays;
}
async function checkPerfectConsistency(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as perfect_days
        FROM habit_completions hc1
        WHERE user_id = ?
        AND date(created_at) >= date('now', '-${requiredDays + 10} days')
        AND NOT EXISTS (
            SELECT 1 FROM habits h
            WHERE h.user_id = hc1.user_id
            AND h.created_at <= date(hc1.created_at)
            AND NOT EXISTS (
                SELECT 1 FROM habit_completions hc2
                WHERE hc2.habit_id = h.id
                AND date(hc2.created_at) = date(hc1.created_at)
            )
        )
    `).bind(userId).first();
  return result.perfect_days >= requiredDays;
}
async function checkFeatureExploration(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT activity_type) as features_used
        FROM user_activity_log
        WHERE user_id = ?
        AND activity_type IN ('habit_creation', 'media_upload', 'nutrition_log', 'achievement_view')
        AND date(created_at) = date('now')
    `).bind(userId).first();
  return result.features_used >= 4;
}
async function checkEarlyEngagement(userId, requiredDays, env) {
  const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
  if (!userCreated) return false;
  const createdDate = new Date(userCreated.created_at);
  const twoWeeksLater = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1e3);
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as active_days
        FROM user_activity_log
        WHERE user_id = ?
        AND activity_type = 'login'
        AND created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), twoWeeksLater.toISOString()).first();
  return result.active_days >= requiredDays;
}
async function checkEarlyInvites(userId, requiredCount, env) {
  const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
  if (!userCreated) return false;
  const createdDate = new Date(userCreated.created_at);
  const oneMonthLater = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1e3);
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as invite_count
        FROM friendships
        WHERE user_id = ?
        AND created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), oneMonthLater.toISOString()).first();
  return result.invite_count >= requiredCount;
}
async function checkFastAchievements(userId, requiredCount, env) {
  const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
  if (!userCreated) return false;
  const createdDate = new Date(userCreated.created_at);
  const twoWeeksLater = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1e3);
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as achievement_count
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        AND ua.created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), twoWeeksLater.toISOString()).first();
  return result.achievement_count >= requiredCount;
}
async function checkCommitmentStreak(userId, requiredDays, env) {
  const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
  if (!userCreated) return false;
  const createdDate = new Date(userCreated.created_at);
  const thirtyDaysLater = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1e3);
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as login_days
        FROM user_activity_log
        WHERE user_id = ?
        AND activity_type = 'login'
        AND created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), thirtyDaysLater.toISOString()).first();
  return result.login_days >= requiredDays;
}
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}
async function getUserWeeklyRank(userId, weekStart, env) {
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1e3);
  const result = await env.DB.prepare(`
        SELECT COUNT(*) + 1 as rank
        FROM (
            SELECT u.id, COALESCE(SUM(hc.points), 0) as weekly_points
            FROM users u
            LEFT JOIN habit_completions hc ON u.id = hc.user_id 
                AND date(hc.created_at) BETWEEN date(?) AND date(?)
            GROUP BY u.id
            HAVING weekly_points > (
                SELECT COALESCE(SUM(hc2.points), 0)
                FROM habit_completions hc2 
                WHERE hc2.user_id = ? 
                AND date(hc2.created_at) BETWEEN date(?) AND date(?)
            )
        )
    `).bind(
    weekStart.toISOString().split("T")[0],
    weekEnd.toISOString().split("T")[0],
    userId,
    weekStart.toISOString().split("T")[0],
    weekEnd.toISOString().split("T")[0]
  ).first();
  return result.rank;
}
async function checkDailyAchievementCount(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as achievement_count
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        AND date(ua.created_at) = date('now')
    `).bind(userId).first();
  return result.achievement_count >= requiredCount;
}
async function checkCategoryMastery(userId, category, env) {
  const categoryAchievements = await env.DB.prepare(`
        SELECT COUNT(*) as total_in_category
        FROM achievements
        WHERE category = ? AND is_hidden = 0
    `).bind(category).first();
  const userCategoryAchievements = await env.DB.prepare(`
        SELECT COUNT(*) as earned_in_category
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ? AND a.category = ? AND a.is_hidden = 0
    `).bind(userId, category).first();
  return userCategoryAchievements.earned_in_category >= categoryAchievements.total_in_category;
}
async function checkDailyAchievementStreak(userId, requiredDays, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(ua.created_at)) as achievement_days
        FROM user_achievements ua
        WHERE ua.user_id = ?
        AND date(ua.created_at) >= date('now', '-${requiredDays} days')
    `).bind(userId).first();
  return result.achievement_days >= requiredDays;
}
async function checkWeeklyAchievementStreak(userId, requiredWeeks, env) {
  let consecutiveWeeks = 0;
  const currentDate = /* @__PURE__ */ new Date();
  for (let i = 0; i < requiredWeeks + 2; i++) {
    const weekStart = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1e3);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1e3);
    const result = await env.DB.prepare(`
            SELECT COUNT(*) as weekly_achievements
            FROM user_achievements ua
            WHERE ua.user_id = ?
            AND date(ua.created_at) BETWEEN date(?) AND date(?)
        `).bind(userId, weekStart.toISOString().split("T")[0], weekEnd.toISOString().split("T")[0]).first();
    if (result.weekly_achievements > 0) {
      consecutiveWeeks++;
      if (consecutiveWeeks >= requiredWeeks) return true;
    } else {
      consecutiveWeeks = 0;
    }
  }
  return false;
}
async function checkTotalAchievements(userId, requiredCount, env) {
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as total_achievements
        FROM user_achievements
        WHERE user_id = ?
    `).bind(userId).first();
  return result.total_achievements >= requiredCount;
}
async function checkAchievementsInTimeframe(userId, requiredCount, env) {
  const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
  if (!userCreated) return false;
  const createdDate = new Date(userCreated.created_at);
  const oneMonthLater = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1e3);
  const result = await env.DB.prepare(`
        SELECT COUNT(*) as achievement_count
        FROM user_achievements ua
        WHERE ua.user_id = ?
        AND ua.created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), oneMonthLater.toISOString()).first();
  return result.achievement_count >= requiredCount;
}
async function checkSeasonalEvent(userId, requiredCount, env) {
  return false;
}
async function checkMonthlyChallenge(userId, requiredCount, env) {
  return false;
}
async function checkConsecutiveMonthly(userId, requiredCount, env) {
  return false;
}
async function checkAchievementRank(userId, percentile, env) {
  const friendsCount = await env.DB.prepare(`
        SELECT COUNT(*) as friends_count
        FROM friendships
        WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    `).bind(userId, userId).first();
  if (friendsCount.friends_count === 0) return false;
  const userAchievementCount = await env.DB.prepare(`
        SELECT COUNT(*) as user_achievements
        FROM user_achievements
        WHERE user_id = ?
    `).bind(userId).first();
  const betterFriends = await env.DB.prepare(`
        SELECT COUNT(DISTINCT f.friend_id) as better_count
        FROM friendships f
        LEFT JOIN user_achievements ua ON (
            f.friend_id = ua.user_id OR 
            (f.user_id = ua.user_id AND f.friend_id = ?)
        )
        WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND f.status = 'accepted'
        GROUP BY f.friend_id
        HAVING COUNT(ua.id) > ?
    `).bind(userId, userId, userId, userAchievementCount.user_achievements).first();
  const percentileRank = (friendsCount.friends_count - (betterFriends?.better_count || 0)) / friendsCount.friends_count * 100;
  return percentileRank >= percentile;
}
async function checkAchievementLeaderboard(userId, requiredRank, env) {
  return await checkAchievementRank(userId, 100, env);
}
async function checkPerfectCategory(userId, requiredCount, env) {
  const categories = ["onboarding", "habits", "progress", "nutrition", "social", "consistency", "challenges", "analytics"];
  for (const category of categories) {
    const mastery = await checkCategoryMastery(userId, category, env);
    if (mastery) return true;
  }
  return false;
}
async function checkCompletionist(userId, requiredCount, env) {
  const totalNonHidden = await env.DB.prepare(`
        SELECT COUNT(*) as total_achievements
        FROM achievements
        WHERE is_hidden = 0
    `).first();
  const userAchievements = await env.DB.prepare(`
        SELECT COUNT(*) as user_achievements
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ? AND a.is_hidden = 0
    `).bind(userId).first();
  return userAchievements.user_achievements >= totalNonHidden.total_achievements * 0.95;
}
var init_achievements = __esm({
  "utils/achievements.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(checkAndAwardAchievements, "checkAndAwardAchievements");
    __name(getUserStats, "getUserStats");
    __name(unlockAchievement, "unlockAchievement");
    __name(checkWeeklyBeforeAfter, "checkWeeklyBeforeAfter");
    __name(getMorningCompletions, "getMorningCompletions");
    __name(checkWeekendStreaks, "checkWeekendStreaks");
    __name(checkHabitVariety, "checkHabitVariety");
    __name(checkRecurringAchievements, "checkRecurringAchievements");
    __name(checkVideoAchievements, "checkVideoAchievements");
    __name(checkNutritionAchievements, "checkNutritionAchievements");
    __name(checkVideoConsistency, "checkVideoConsistency");
    __name(getNutritionStreakStats, "getNutritionStreakStats");
    __name(unlockAchievementIfNotEarned, "unlockAchievementIfNotEarned");
    __name(createUserReminders, "createUserReminders");
    __name(checkFriendsCount, "checkFriendsCount");
    __name(checkWeeklyRank, "checkWeeklyRank");
    __name(checkConsecutiveTopRanking, "checkConsecutiveTopRanking");
    __name(checkStatsViews, "checkStatsViews");
    __name(checkProgressViews, "checkProgressViews");
    __name(checkLeaderboardViews, "checkLeaderboardViews");
    __name(checkRoutineConsistency, "checkRoutineConsistency");
    __name(checkMorningHabitStreak, "checkMorningHabitStreak");
    __name(checkEveningHabitStreak, "checkEveningHabitStreak");
    __name(checkWeekendConsistency, "checkWeekendConsistency");
    __name(checkMonthlyVideoComparisons, "checkMonthlyVideoComparisons");
    __name(checkDescribedUploads, "checkDescribedUploads");
    __name(checkWeeklyPhotoStreak, "checkWeeklyPhotoStreak");
    __name(checkWeeklyVideoStreak, "checkWeeklyVideoStreak");
    __name(checkProgressDayStreak, "checkProgressDayStreak");
    __name(checkMacroPerfectStreak, "checkMacroPerfectStreak");
    __name(checkHydrationStreak, "checkHydrationStreak");
    __name(checkCustomRecipes, "checkCustomRecipes");
    __name(checkNutritionTrackingStreak, "checkNutritionTrackingStreak");
    __name(checkBalancedMacroStreak, "checkBalancedMacroStreak");
    __name(checkDailyChallengesCompleted, "checkDailyChallengesCompleted");
    __name(checkPerfectChallengeWeek, "checkPerfectChallengeWeek");
    __name(checkWeeklyGoalsCompleted, "checkWeeklyGoalsCompleted");
    __name(checkSimultaneousStreaks, "checkSimultaneousStreaks");
    __name(checkStreakComeback, "checkStreakComeback");
    __name(checkLoginStreak, "checkLoginStreak");
    __name(checkSingleHabitStreak, "checkSingleHabitStreak");
    __name(checkMultiHabitStreaks, "checkMultiHabitStreaks");
    __name(checkYearlyConsistency, "checkYearlyConsistency");
    __name(checkPerfectConsistency, "checkPerfectConsistency");
    __name(checkFeatureExploration, "checkFeatureExploration");
    __name(checkEarlyEngagement, "checkEarlyEngagement");
    __name(checkEarlyInvites, "checkEarlyInvites");
    __name(checkFastAchievements, "checkFastAchievements");
    __name(checkCommitmentStreak, "checkCommitmentStreak");
    __name(getWeekStart, "getWeekStart");
    __name(getUserWeeklyRank, "getUserWeeklyRank");
    __name(checkDailyAchievementCount, "checkDailyAchievementCount");
    __name(checkCategoryMastery, "checkCategoryMastery");
    __name(checkDailyAchievementStreak, "checkDailyAchievementStreak");
    __name(checkWeeklyAchievementStreak, "checkWeeklyAchievementStreak");
    __name(checkTotalAchievements, "checkTotalAchievements");
    __name(checkAchievementsInTimeframe, "checkAchievementsInTimeframe");
    __name(checkSeasonalEvent, "checkSeasonalEvent");
    __name(checkMonthlyChallenge, "checkMonthlyChallenge");
    __name(checkConsecutiveMonthly, "checkConsecutiveMonthly");
    __name(checkAchievementRank, "checkAchievementRank");
    __name(checkAchievementLeaderboard, "checkAchievementLeaderboard");
    __name(checkPerfectCategory, "checkPerfectCategory");
    __name(checkCompletionist, "checkCompletionist");
  }
});

// utils/streaks.js
async function updateStreak(db, userId, streakType) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  try {
    const currentStreak = await db.prepare(`
            SELECT * FROM user_streaks 
            WHERE user_id = ? AND streak_type = ?
        `).bind(userId, streakType).first();
    if (!currentStreak) {
      await db.prepare(`
                INSERT INTO user_streaks (id, user_id, streak_type, current_streak, best_streak, last_update_date)
                VALUES (?, ?, ?, 1, 1, ?)
            `).bind(`streak_${userId}_${streakType}_${Date.now()}`, userId, streakType, today).run();
      return { current_streak: 1, best_streak: 1, is_new_record: true };
    } else {
      const lastUpdate = new Date(currentStreak.last_update_date);
      const todayDate = new Date(today);
      const daysDifference = Math.floor((todayDate - lastUpdate) / (1e3 * 60 * 60 * 24));
      let newStreak;
      let isNewRecord = false;
      if (daysDifference === 1) {
        newStreak = currentStreak.current_streak + 1;
      } else if (daysDifference === 0) {
        newStreak = currentStreak.current_streak;
      } else {
        newStreak = 1;
      }
      const newBestStreak = Math.max(newStreak, currentStreak.best_streak);
      isNewRecord = newBestStreak > currentStreak.best_streak;
      await db.prepare(`
                UPDATE user_streaks 
                SET current_streak = ?, best_streak = ?, last_update_date = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND streak_type = ?
            `).bind(newStreak, newBestStreak, today, userId, streakType).run();
      return {
        current_streak: newStreak,
        best_streak: newBestStreak,
        is_new_record: isNewRecord,
        days_difference: daysDifference
      };
    }
  } catch (error) {
    console.error("Streak update error:", error);
    return null;
  }
}
async function updateDailyChallengeProgress(db, userId, challengeType, progressAmount = 1) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  try {
    const challenges = await db.prepare(`
            SELECT dc.* FROM daily_challenges dc
            WHERE dc.is_active = 1 AND dc.requirement_type = ?
        `).bind(challengeType).all();
    const results = [];
    for (const challenge of challenges.results || []) {
      let userChallenge = await db.prepare(`
                SELECT * FROM user_daily_challenges
                WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
            `).bind(userId, challenge.id, today).first();
      if (!userChallenge) {
        const challengeId = `udc_${userId}_${challenge.id}_${today}_${Date.now()}`;
        await db.prepare(`
                    INSERT INTO user_daily_challenges 
                    (id, user_id, challenge_id, challenge_date, progress_count)
                    VALUES (?, ?, ?, ?, ?)
                `).bind(challengeId, userId, challenge.id, today, progressAmount).run();
        userChallenge = { progress_count: progressAmount, is_completed: 0 };
      } else {
        const newProgress = userChallenge.progress_count + progressAmount;
        await db.prepare(`
                    UPDATE user_daily_challenges 
                    SET progress_count = ?
                    WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
                `).bind(newProgress, userId, challenge.id, today).run();
        userChallenge.progress_count = newProgress;
      }
      if (userChallenge.progress_count >= challenge.requirement_value && !userChallenge.is_completed) {
        await db.prepare(`
                    UPDATE user_daily_challenges 
                    SET is_completed = 1, completed_at = CURRENT_TIMESTAMP, points_earned = ?
                    WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
                `).bind(challenge.points_reward, userId, challenge.id, today).run();
        await db.prepare(`
                    UPDATE users SET points = points + ? WHERE id = ?
                `).bind(challenge.points_reward, userId).run();
        results.push({
          challenge,
          completed: true,
          points_earned: challenge.points_reward
        });
      }
    }
    return results;
  } catch (error) {
    console.error("Daily challenge progress error:", error);
    return [];
  }
}
var init_streaks = __esm({
  "utils/streaks.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(updateStreak, "updateStreak");
    __name(updateDailyChallengeProgress, "updateDailyChallengeProgress");
  }
});

// api/achievements/check.js
async function onRequestPost({ request, env }) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const { trigger } = await request.json();
    const streakResults = [];
    if (trigger === "login") {
      const loginStreak = await updateStreak(env.DB, userId, "daily_login");
      if (loginStreak) {
        streakResults.push({ type: "daily_login", ...loginStreak });
      }
    } else if (trigger === "habit_completion") {
      const habitStreak = await updateStreak(env.DB, userId, "habit_completion");
      if (habitStreak) {
        streakResults.push({ type: "habit_completion", ...habitStreak });
      }
      await updateDailyChallengeProgress(env.DB, userId, "habits", 1);
    } else if (trigger === "media_upload") {
      await updateDailyChallengeProgress(env.DB, userId, "media", 1);
    } else if (trigger === "video_upload") {
      await updateDailyChallengeProgress(env.DB, userId, "media", 1);
    } else if (trigger === "nutrition_log") {
      await updateDailyChallengeProgress(env.DB, userId, "nutrition", 1);
    }
    const achievementResults = await checkAndAwardAchievements(userId, trigger, {}, env);
    const progressHints = await env.DB.prepare(`
            SELECT 
                a.*,
                uap.current_progress,
                CASE 
                    WHEN uap.current_progress >= a.requirement_value * 0.8 
                    AND uap.current_progress < a.requirement_value 
                    THEN 1 
                    ELSE 0 
                END as show_hint
            FROM achievements a
            LEFT JOIN user_achievement_progress uap ON a.id = uap.achievement_id AND uap.user_id = ?
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE ua.id IS NULL 
            AND uap.current_progress >= a.requirement_value * 0.8
            AND uap.current_progress < a.requirement_value
            LIMIT 2
        `).bind(userId, userId).all();
    const hints = progressHints.results?.map((hint) => ({
      achievement: {
        id: hint.id,
        name: hint.name,
        description: hint.description,
        icon: hint.icon,
        difficulty: hint.difficulty
      },
      current_progress: hint.current_progress,
      required_progress: hint.requirement_value
    })) || [];
    return new Response(JSON.stringify({
      unlocked_achievements: achievementResults.unlocked || [],
      progress_hints: hints,
      total_points_earned: achievementResults.points_earned || 0,
      streaks: streakResults
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Achievement check error:", error);
    return new Response(JSON.stringify({ error: "Failed to check achievements" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_check = __esm({
  "api/achievements/check.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_achievements();
    init_streaks();
    __name(onRequestPost, "onRequestPost");
  }
});

// ../node_modules/bcryptjs/dist/bcrypt.js
var require_bcrypt = __commonJS({
  "../node_modules/bcryptjs/dist/bcrypt.js"(exports, module) {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    (function(global, factory) {
      if (typeof define === "function" && define["amd"])
        define([], factory);
      else if (typeof __require === "function" && typeof module === "object" && module && module["exports"])
        module["exports"] = factory();
      else
        (global["dcodeIO"] = global["dcodeIO"] || {})["bcrypt"] = factory();
    })(exports, function() {
      "use strict";
      var bcrypt = {};
      var randomFallback = null;
      function random(len) {
        if (typeof module !== "undefined" && module && module["exports"])
          try {
            return __require("crypto")["randomBytes"](len);
          } catch (e) {
          }
        try {
          var a;
          (self["crypto"] || self["msCrypto"])["getRandomValues"](a = new Uint32Array(len));
          return Array.prototype.slice.call(a);
        } catch (e) {
        }
        if (!randomFallback)
          throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
        return randomFallback(len);
      }
      __name(random, "random");
      var randomAvailable = false;
      try {
        random(1);
        randomAvailable = true;
      } catch (e) {
      }
      randomFallback = null;
      bcrypt.setRandomFallback = function(random2) {
        randomFallback = random2;
      };
      bcrypt.genSaltSync = function(rounds, seed_length) {
        rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof rounds !== "number")
          throw Error("Illegal arguments: " + typeof rounds + ", " + typeof seed_length);
        if (rounds < 4)
          rounds = 4;
        else if (rounds > 31)
          rounds = 31;
        var salt = [];
        salt.push("$2a$");
        if (rounds < 10)
          salt.push("0");
        salt.push(rounds.toString());
        salt.push("$");
        salt.push(base64_encode(random(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
        return salt.join("");
      };
      bcrypt.genSalt = function(rounds, seed_length, callback) {
        if (typeof seed_length === "function")
          callback = seed_length, seed_length = void 0;
        if (typeof rounds === "function")
          callback = rounds, rounds = void 0;
        if (typeof rounds === "undefined")
          rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
        else if (typeof rounds !== "number")
          throw Error("illegal arguments: " + typeof rounds);
        function _async(callback2) {
          nextTick(function() {
            try {
              callback2(null, bcrypt.genSaltSync(rounds));
            } catch (err) {
              callback2(err);
            }
          });
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt.hashSync = function(s, salt) {
        if (typeof salt === "undefined")
          salt = GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof salt === "number")
          salt = bcrypt.genSaltSync(salt);
        if (typeof s !== "string" || typeof salt !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof salt);
        return _hash(s, salt);
      };
      bcrypt.hash = function(s, salt, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s === "string" && typeof salt === "number")
            bcrypt.genSalt(salt, function(err, salt2) {
              _hash(s, salt2, callback2, progressCallback);
            });
          else if (typeof s === "string" && typeof salt === "string")
            _hash(s, salt, callback2, progressCallback);
          else
            nextTick(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof salt)));
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      function safeStringCompare(known, unknown) {
        var right = 0, wrong = 0;
        for (var i = 0, k = known.length; i < k; ++i) {
          if (known.charCodeAt(i) === unknown.charCodeAt(i))
            ++right;
          else
            ++wrong;
        }
        if (right < 0)
          return false;
        return wrong === 0;
      }
      __name(safeStringCompare, "safeStringCompare");
      bcrypt.compareSync = function(s, hash) {
        if (typeof s !== "string" || typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof hash);
        if (hash.length !== 60)
          return false;
        return safeStringCompare(bcrypt.hashSync(s, hash.substr(0, hash.length - 31)), hash);
      };
      bcrypt.compare = function(s, hash, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s !== "string" || typeof hash !== "string") {
            nextTick(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof hash)));
            return;
          }
          if (hash.length !== 60) {
            nextTick(callback2.bind(this, null, false));
            return;
          }
          bcrypt.hash(s, hash.substr(0, 29), function(err, comp) {
            if (err)
              callback2(err);
            else
              callback2(null, safeStringCompare(comp, hash));
          }, progressCallback);
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt.getRounds = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        return parseInt(hash.split("$")[2], 10);
      };
      bcrypt.getSalt = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        if (hash.length !== 60)
          throw Error("Illegal hash length: " + hash.length + " != 60");
        return hash.substring(0, 29);
      };
      var nextTick = typeof process !== "undefined" && process && typeof process.nextTick === "function" ? typeof setImmediate === "function" ? setImmediate : process.nextTick : setTimeout;
      function stringToBytes2(str) {
        var out = [], i = 0;
        utfx.encodeUTF16toUTF8(function() {
          if (i >= str.length) return null;
          return str.charCodeAt(i++);
        }, function(b) {
          out.push(b);
        });
        return out;
      }
      __name(stringToBytes2, "stringToBytes");
      var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
      var BASE64_INDEX = [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        0,
        1,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        -1,
        -1,
        -1,
        -1,
        -1
      ];
      var stringFromCharCode = String.fromCharCode;
      function base64_encode(b, len) {
        var off = 0, rs = [], c1, c2;
        if (len <= 0 || len > b.length)
          throw Error("Illegal len: " + len);
        while (off < len) {
          c1 = b[off++] & 255;
          rs.push(BASE64_CODE[c1 >> 2 & 63]);
          c1 = (c1 & 3) << 4;
          if (off >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off++] & 255;
          c1 |= c2 >> 4 & 15;
          rs.push(BASE64_CODE[c1 & 63]);
          c1 = (c2 & 15) << 2;
          if (off >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off++] & 255;
          c1 |= c2 >> 6 & 3;
          rs.push(BASE64_CODE[c1 & 63]);
          rs.push(BASE64_CODE[c2 & 63]);
        }
        return rs.join("");
      }
      __name(base64_encode, "base64_encode");
      function base64_decode(s, len) {
        var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
        if (len <= 0)
          throw Error("Illegal len: " + len);
        while (off < slen - 1 && olen < len) {
          code = s.charCodeAt(off++);
          c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          code = s.charCodeAt(off++);
          c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c1 == -1 || c2 == -1)
            break;
          o = c1 << 2 >>> 0;
          o |= (c2 & 48) >> 4;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off >= slen)
            break;
          code = s.charCodeAt(off++);
          c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c3 == -1)
            break;
          o = (c2 & 15) << 4 >>> 0;
          o |= (c3 & 60) >> 2;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off >= slen)
            break;
          code = s.charCodeAt(off++);
          c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          o = (c3 & 3) << 6 >>> 0;
          o |= c4;
          rs.push(stringFromCharCode(o));
          ++olen;
        }
        var res = [];
        for (off = 0; off < olen; off++)
          res.push(rs[off].charCodeAt(0));
        return res;
      }
      __name(base64_decode, "base64_decode");
      var utfx = function() {
        "use strict";
        var utfx2 = {};
        utfx2.MAX_CODEPOINT = 1114111;
        utfx2.encodeUTF8 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = /* @__PURE__ */ __name(function() {
              return null;
            }, "src");
          while (cp !== null || (cp = src()) !== null) {
            if (cp < 128)
              dst(cp & 127);
            else if (cp < 2048)
              dst(cp >> 6 & 31 | 192), dst(cp & 63 | 128);
            else if (cp < 65536)
              dst(cp >> 12 & 15 | 224), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            else
              dst(cp >> 18 & 7 | 240), dst(cp >> 12 & 63 | 128), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            cp = null;
          }
        };
        utfx2.decodeUTF8 = function(src, dst) {
          var a, b, c, d, fail = /* @__PURE__ */ __name(function(b2) {
            b2 = b2.slice(0, b2.indexOf(null));
            var err = Error(b2.toString());
            err.name = "TruncatedError";
            err["bytes"] = b2;
            throw err;
          }, "fail");
          while ((a = src()) !== null) {
            if ((a & 128) === 0)
              dst(a);
            else if ((a & 224) === 192)
              (b = src()) === null && fail([a, b]), dst((a & 31) << 6 | b & 63);
            else if ((a & 240) === 224)
              ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 15) << 12 | (b & 63) << 6 | c & 63);
            else if ((a & 248) === 240)
              ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63);
            else throw RangeError("Illegal starting byte: " + a);
          }
        };
        utfx2.UTF16toUTF8 = function(src, dst) {
          var c1, c2 = null;
          while (true) {
            if ((c1 = c2 !== null ? c2 : src()) === null)
              break;
            if (c1 >= 55296 && c1 <= 57343) {
              if ((c2 = src()) !== null) {
                if (c2 >= 56320 && c2 <= 57343) {
                  dst((c1 - 55296) * 1024 + c2 - 56320 + 65536);
                  c2 = null;
                  continue;
                }
              }
            }
            dst(c1);
          }
          if (c2 !== null) dst(c2);
        };
        utfx2.UTF8toUTF16 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = /* @__PURE__ */ __name(function() {
              return null;
            }, "src");
          while (cp !== null || (cp = src()) !== null) {
            if (cp <= 65535)
              dst(cp);
            else
              cp -= 65536, dst((cp >> 10) + 55296), dst(cp % 1024 + 56320);
            cp = null;
          }
        };
        utfx2.encodeUTF16toUTF8 = function(src, dst) {
          utfx2.UTF16toUTF8(src, function(cp) {
            utfx2.encodeUTF8(cp, dst);
          });
        };
        utfx2.decodeUTF8toUTF16 = function(src, dst) {
          utfx2.decodeUTF8(src, function(cp) {
            utfx2.UTF8toUTF16(cp, dst);
          });
        };
        utfx2.calculateCodePoint = function(cp) {
          return cp < 128 ? 1 : cp < 2048 ? 2 : cp < 65536 ? 3 : 4;
        };
        utfx2.calculateUTF8 = function(src) {
          var cp, l = 0;
          while ((cp = src()) !== null)
            l += utfx2.calculateCodePoint(cp);
          return l;
        };
        utfx2.calculateUTF16asUTF8 = function(src) {
          var n = 0, l = 0;
          utfx2.UTF16toUTF8(src, function(cp) {
            ++n;
            l += utfx2.calculateCodePoint(cp);
          });
          return [n, l];
        };
        return utfx2;
      }();
      Date.now = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      var BCRYPT_SALT_LEN = 16;
      var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
      var BLOWFISH_NUM_ROUNDS = 16;
      var MAX_EXECUTION_TIME = 100;
      var P_ORIG = [
        608135816,
        2242054355,
        320440878,
        57701188,
        2752067618,
        698298832,
        137296536,
        3964562569,
        1160258022,
        953160567,
        3193202383,
        887688300,
        3232508343,
        3380367581,
        1065670069,
        3041331479,
        2450970073,
        2306472731
      ];
      var S_ORIG = [
        3509652390,
        2564797868,
        805139163,
        3491422135,
        3101798381,
        1780907670,
        3128725573,
        4046225305,
        614570311,
        3012652279,
        134345442,
        2240740374,
        1667834072,
        1901547113,
        2757295779,
        4103290238,
        227898511,
        1921955416,
        1904987480,
        2182433518,
        2069144605,
        3260701109,
        2620446009,
        720527379,
        3318853667,
        677414384,
        3393288472,
        3101374703,
        2390351024,
        1614419982,
        1822297739,
        2954791486,
        3608508353,
        3174124327,
        2024746970,
        1432378464,
        3864339955,
        2857741204,
        1464375394,
        1676153920,
        1439316330,
        715854006,
        3033291828,
        289532110,
        2706671279,
        2087905683,
        3018724369,
        1668267050,
        732546397,
        1947742710,
        3462151702,
        2609353502,
        2950085171,
        1814351708,
        2050118529,
        680887927,
        999245976,
        1800124847,
        3300911131,
        1713906067,
        1641548236,
        4213287313,
        1216130144,
        1575780402,
        4018429277,
        3917837745,
        3693486850,
        3949271944,
        596196993,
        3549867205,
        258830323,
        2213823033,
        772490370,
        2760122372,
        1774776394,
        2652871518,
        566650946,
        4142492826,
        1728879713,
        2882767088,
        1783734482,
        3629395816,
        2517608232,
        2874225571,
        1861159788,
        326777828,
        3124490320,
        2130389656,
        2716951837,
        967770486,
        1724537150,
        2185432712,
        2364442137,
        1164943284,
        2105845187,
        998989502,
        3765401048,
        2244026483,
        1075463327,
        1455516326,
        1322494562,
        910128902,
        469688178,
        1117454909,
        936433444,
        3490320968,
        3675253459,
        1240580251,
        122909385,
        2157517691,
        634681816,
        4142456567,
        3825094682,
        3061402683,
        2540495037,
        79693498,
        3249098678,
        1084186820,
        1583128258,
        426386531,
        1761308591,
        1047286709,
        322548459,
        995290223,
        1845252383,
        2603652396,
        3431023940,
        2942221577,
        3202600964,
        3727903485,
        1712269319,
        422464435,
        3234572375,
        1170764815,
        3523960633,
        3117677531,
        1434042557,
        442511882,
        3600875718,
        1076654713,
        1738483198,
        4213154764,
        2393238008,
        3677496056,
        1014306527,
        4251020053,
        793779912,
        2902807211,
        842905082,
        4246964064,
        1395751752,
        1040244610,
        2656851899,
        3396308128,
        445077038,
        3742853595,
        3577915638,
        679411651,
        2892444358,
        2354009459,
        1767581616,
        3150600392,
        3791627101,
        3102740896,
        284835224,
        4246832056,
        1258075500,
        768725851,
        2589189241,
        3069724005,
        3532540348,
        1274779536,
        3789419226,
        2764799539,
        1660621633,
        3471099624,
        4011903706,
        913787905,
        3497959166,
        737222580,
        2514213453,
        2928710040,
        3937242737,
        1804850592,
        3499020752,
        2949064160,
        2386320175,
        2390070455,
        2415321851,
        4061277028,
        2290661394,
        2416832540,
        1336762016,
        1754252060,
        3520065937,
        3014181293,
        791618072,
        3188594551,
        3933548030,
        2332172193,
        3852520463,
        3043980520,
        413987798,
        3465142937,
        3030929376,
        4245938359,
        2093235073,
        3534596313,
        375366246,
        2157278981,
        2479649556,
        555357303,
        3870105701,
        2008414854,
        3344188149,
        4221384143,
        3956125452,
        2067696032,
        3594591187,
        2921233993,
        2428461,
        544322398,
        577241275,
        1471733935,
        610547355,
        4027169054,
        1432588573,
        1507829418,
        2025931657,
        3646575487,
        545086370,
        48609733,
        2200306550,
        1653985193,
        298326376,
        1316178497,
        3007786442,
        2064951626,
        458293330,
        2589141269,
        3591329599,
        3164325604,
        727753846,
        2179363840,
        146436021,
        1461446943,
        4069977195,
        705550613,
        3059967265,
        3887724982,
        4281599278,
        3313849956,
        1404054877,
        2845806497,
        146425753,
        1854211946,
        1266315497,
        3048417604,
        3681880366,
        3289982499,
        290971e4,
        1235738493,
        2632868024,
        2414719590,
        3970600049,
        1771706367,
        1449415276,
        3266420449,
        422970021,
        1963543593,
        2690192192,
        3826793022,
        1062508698,
        1531092325,
        1804592342,
        2583117782,
        2714934279,
        4024971509,
        1294809318,
        4028980673,
        1289560198,
        2221992742,
        1669523910,
        35572830,
        157838143,
        1052438473,
        1016535060,
        1802137761,
        1753167236,
        1386275462,
        3080475397,
        2857371447,
        1040679964,
        2145300060,
        2390574316,
        1461121720,
        2956646967,
        4031777805,
        4028374788,
        33600511,
        2920084762,
        1018524850,
        629373528,
        3691585981,
        3515945977,
        2091462646,
        2486323059,
        586499841,
        988145025,
        935516892,
        3367335476,
        2599673255,
        2839830854,
        265290510,
        3972581182,
        2759138881,
        3795373465,
        1005194799,
        847297441,
        406762289,
        1314163512,
        1332590856,
        1866599683,
        4127851711,
        750260880,
        613907577,
        1450815602,
        3165620655,
        3734664991,
        3650291728,
        3012275730,
        3704569646,
        1427272223,
        778793252,
        1343938022,
        2676280711,
        2052605720,
        1946737175,
        3164576444,
        3914038668,
        3967478842,
        3682934266,
        1661551462,
        3294938066,
        4011595847,
        840292616,
        3712170807,
        616741398,
        312560963,
        711312465,
        1351876610,
        322626781,
        1910503582,
        271666773,
        2175563734,
        1594956187,
        70604529,
        3617834859,
        1007753275,
        1495573769,
        4069517037,
        2549218298,
        2663038764,
        504708206,
        2263041392,
        3941167025,
        2249088522,
        1514023603,
        1998579484,
        1312622330,
        694541497,
        2582060303,
        2151582166,
        1382467621,
        776784248,
        2618340202,
        3323268794,
        2497899128,
        2784771155,
        503983604,
        4076293799,
        907881277,
        423175695,
        432175456,
        1378068232,
        4145222326,
        3954048622,
        3938656102,
        3820766613,
        2793130115,
        2977904593,
        26017576,
        3274890735,
        3194772133,
        1700274565,
        1756076034,
        4006520079,
        3677328699,
        720338349,
        1533947780,
        354530856,
        688349552,
        3973924725,
        1637815568,
        332179504,
        3949051286,
        53804574,
        2852348879,
        3044236432,
        1282449977,
        3583942155,
        3416972820,
        4006381244,
        1617046695,
        2628476075,
        3002303598,
        1686838959,
        431878346,
        2686675385,
        1700445008,
        1080580658,
        1009431731,
        832498133,
        3223435511,
        2605976345,
        2271191193,
        2516031870,
        1648197032,
        4164389018,
        2548247927,
        300782431,
        375919233,
        238389289,
        3353747414,
        2531188641,
        2019080857,
        1475708069,
        455242339,
        2609103871,
        448939670,
        3451063019,
        1395535956,
        2413381860,
        1841049896,
        1491858159,
        885456874,
        4264095073,
        4001119347,
        1565136089,
        3898914787,
        1108368660,
        540939232,
        1173283510,
        2745871338,
        3681308437,
        4207628240,
        3343053890,
        4016749493,
        1699691293,
        1103962373,
        3625875870,
        2256883143,
        3830138730,
        1031889488,
        3479347698,
        1535977030,
        4236805024,
        3251091107,
        2132092099,
        1774941330,
        1199868427,
        1452454533,
        157007616,
        2904115357,
        342012276,
        595725824,
        1480756522,
        206960106,
        497939518,
        591360097,
        863170706,
        2375253569,
        3596610801,
        1814182875,
        2094937945,
        3421402208,
        1082520231,
        3463918190,
        2785509508,
        435703966,
        3908032597,
        1641649973,
        2842273706,
        3305899714,
        1510255612,
        2148256476,
        2655287854,
        3276092548,
        4258621189,
        236887753,
        3681803219,
        274041037,
        1734335097,
        3815195456,
        3317970021,
        1899903192,
        1026095262,
        4050517792,
        356393447,
        2410691914,
        3873677099,
        3682840055,
        3913112168,
        2491498743,
        4132185628,
        2489919796,
        1091903735,
        1979897079,
        3170134830,
        3567386728,
        3557303409,
        857797738,
        1136121015,
        1342202287,
        507115054,
        2535736646,
        337727348,
        3213592640,
        1301675037,
        2528481711,
        1895095763,
        1721773893,
        3216771564,
        62756741,
        2142006736,
        835421444,
        2531993523,
        1442658625,
        3659876326,
        2882144922,
        676362277,
        1392781812,
        170690266,
        3921047035,
        1759253602,
        3611846912,
        1745797284,
        664899054,
        1329594018,
        3901205900,
        3045908486,
        2062866102,
        2865634940,
        3543621612,
        3464012697,
        1080764994,
        553557557,
        3656615353,
        3996768171,
        991055499,
        499776247,
        1265440854,
        648242737,
        3940784050,
        980351604,
        3713745714,
        1749149687,
        3396870395,
        4211799374,
        3640570775,
        1161844396,
        3125318951,
        1431517754,
        545492359,
        4268468663,
        3499529547,
        1437099964,
        2702547544,
        3433638243,
        2581715763,
        2787789398,
        1060185593,
        1593081372,
        2418618748,
        4260947970,
        69676912,
        2159744348,
        86519011,
        2512459080,
        3838209314,
        1220612927,
        3339683548,
        133810670,
        1090789135,
        1078426020,
        1569222167,
        845107691,
        3583754449,
        4072456591,
        1091646820,
        628848692,
        1613405280,
        3757631651,
        526609435,
        236106946,
        48312990,
        2942717905,
        3402727701,
        1797494240,
        859738849,
        992217954,
        4005476642,
        2243076622,
        3870952857,
        3732016268,
        765654824,
        3490871365,
        2511836413,
        1685915746,
        3888969200,
        1414112111,
        2273134842,
        3281911079,
        4080962846,
        172450625,
        2569994100,
        980381355,
        4109958455,
        2819808352,
        2716589560,
        2568741196,
        3681446669,
        3329971472,
        1835478071,
        660984891,
        3704678404,
        4045999559,
        3422617507,
        3040415634,
        1762651403,
        1719377915,
        3470491036,
        2693910283,
        3642056355,
        3138596744,
        1364962596,
        2073328063,
        1983633131,
        926494387,
        3423689081,
        2150032023,
        4096667949,
        1749200295,
        3328846651,
        309677260,
        2016342300,
        1779581495,
        3079819751,
        111262694,
        1274766160,
        443224088,
        298511866,
        1025883608,
        3806446537,
        1145181785,
        168956806,
        3641502830,
        3584813610,
        1689216846,
        3666258015,
        3200248200,
        1692713982,
        2646376535,
        4042768518,
        1618508792,
        1610833997,
        3523052358,
        4130873264,
        2001055236,
        3610705100,
        2202168115,
        4028541809,
        2961195399,
        1006657119,
        2006996926,
        3186142756,
        1430667929,
        3210227297,
        1314452623,
        4074634658,
        4101304120,
        2273951170,
        1399257539,
        3367210612,
        3027628629,
        1190975929,
        2062231137,
        2333990788,
        2221543033,
        2438960610,
        1181637006,
        548689776,
        2362791313,
        3372408396,
        3104550113,
        3145860560,
        296247880,
        1970579870,
        3078560182,
        3769228297,
        1714227617,
        3291629107,
        3898220290,
        166772364,
        1251581989,
        493813264,
        448347421,
        195405023,
        2709975567,
        677966185,
        3703036547,
        1463355134,
        2715995803,
        1338867538,
        1343315457,
        2802222074,
        2684532164,
        233230375,
        2599980071,
        2000651841,
        3277868038,
        1638401717,
        4028070440,
        3237316320,
        6314154,
        819756386,
        300326615,
        590932579,
        1405279636,
        3267499572,
        3150704214,
        2428286686,
        3959192993,
        3461946742,
        1862657033,
        1266418056,
        963775037,
        2089974820,
        2263052895,
        1917689273,
        448879540,
        3550394620,
        3981727096,
        150775221,
        3627908307,
        1303187396,
        508620638,
        2975983352,
        2726630617,
        1817252668,
        1876281319,
        1457606340,
        908771278,
        3720792119,
        3617206836,
        2455994898,
        1729034894,
        1080033504,
        976866871,
        3556439503,
        2881648439,
        1522871579,
        1555064734,
        1336096578,
        3548522304,
        2579274686,
        3574697629,
        3205460757,
        3593280638,
        3338716283,
        3079412587,
        564236357,
        2993598910,
        1781952180,
        1464380207,
        3163844217,
        3332601554,
        1699332808,
        1393555694,
        1183702653,
        3581086237,
        1288719814,
        691649499,
        2847557200,
        2895455976,
        3193889540,
        2717570544,
        1781354906,
        1676643554,
        2592534050,
        3230253752,
        1126444790,
        2770207658,
        2633158820,
        2210423226,
        2615765581,
        2414155088,
        3127139286,
        673620729,
        2805611233,
        1269405062,
        4015350505,
        3341807571,
        4149409754,
        1057255273,
        2012875353,
        2162469141,
        2276492801,
        2601117357,
        993977747,
        3918593370,
        2654263191,
        753973209,
        36408145,
        2530585658,
        25011837,
        3520020182,
        2088578344,
        530523599,
        2918365339,
        1524020338,
        1518925132,
        3760827505,
        3759777254,
        1202760957,
        3985898139,
        3906192525,
        674977740,
        4174734889,
        2031300136,
        2019492241,
        3983892565,
        4153806404,
        3822280332,
        352677332,
        2297720250,
        60907813,
        90501309,
        3286998549,
        1016092578,
        2535922412,
        2839152426,
        457141659,
        509813237,
        4120667899,
        652014361,
        1966332200,
        2975202805,
        55981186,
        2327461051,
        676427537,
        3255491064,
        2882294119,
        3433927263,
        1307055953,
        942726286,
        933058658,
        2468411793,
        3933900994,
        4215176142,
        1361170020,
        2001714738,
        2830558078,
        3274259782,
        1222529897,
        1679025792,
        2729314320,
        3714953764,
        1770335741,
        151462246,
        3013232138,
        1682292957,
        1483529935,
        471910574,
        1539241949,
        458788160,
        3436315007,
        1807016891,
        3718408830,
        978976581,
        1043663428,
        3165965781,
        1927990952,
        4200891579,
        2372276910,
        3208408903,
        3533431907,
        1412390302,
        2931980059,
        4132332400,
        1947078029,
        3881505623,
        4168226417,
        2941484381,
        1077988104,
        1320477388,
        886195818,
        18198404,
        3786409e3,
        2509781533,
        112762804,
        3463356488,
        1866414978,
        891333506,
        18488651,
        661792760,
        1628790961,
        3885187036,
        3141171499,
        876946877,
        2693282273,
        1372485963,
        791857591,
        2686433993,
        3759982718,
        3167212022,
        3472953795,
        2716379847,
        445679433,
        3561995674,
        3504004811,
        3574258232,
        54117162,
        3331405415,
        2381918588,
        3769707343,
        4154350007,
        1140177722,
        4074052095,
        668550556,
        3214352940,
        367459370,
        261225585,
        2610173221,
        4209349473,
        3468074219,
        3265815641,
        314222801,
        3066103646,
        3808782860,
        282218597,
        3406013506,
        3773591054,
        379116347,
        1285071038,
        846784868,
        2669647154,
        3771962079,
        3550491691,
        2305946142,
        453669953,
        1268987020,
        3317592352,
        3279303384,
        3744833421,
        2610507566,
        3859509063,
        266596637,
        3847019092,
        517658769,
        3462560207,
        3443424879,
        370717030,
        4247526661,
        2224018117,
        4143653529,
        4112773975,
        2788324899,
        2477274417,
        1456262402,
        2901442914,
        1517677493,
        1846949527,
        2295493580,
        3734397586,
        2176403920,
        1280348187,
        1908823572,
        3871786941,
        846861322,
        1172426758,
        3287448474,
        3383383037,
        1655181056,
        3139813346,
        901632758,
        1897031941,
        2986607138,
        3066810236,
        3447102507,
        1393639104,
        373351379,
        950779232,
        625454576,
        3124240540,
        4148612726,
        2007998917,
        544563296,
        2244738638,
        2330496472,
        2058025392,
        1291430526,
        424198748,
        50039436,
        29584100,
        3605783033,
        2429876329,
        2791104160,
        1057563949,
        3255363231,
        3075367218,
        3463963227,
        1469046755,
        985887462
      ];
      var C_ORIG = [
        1332899944,
        1700884034,
        1701343084,
        1684370003,
        1668446532,
        1869963892
      ];
      function _encipher(lr, off, P, S) {
        var n, l = lr[off], r = lr[off + 1];
        l ^= P[0];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[1];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[2];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[3];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[4];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[5];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[6];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[7];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[8];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[9];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[10];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[11];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[12];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[13];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[14];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[15];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[16];
        lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
        lr[off + 1] = l;
        return lr;
      }
      __name(_encipher, "_encipher");
      function _streamtoword(data, offp) {
        for (var i = 0, word = 0; i < 4; ++i)
          word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
        return { key: word, offp };
      }
      __name(_streamtoword, "_streamtoword");
      function _key(key, P, S) {
        var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
        for (i = 0; i < plen; i += 2)
          lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      __name(_key, "_key");
      function _ekskey(data, key, P, S) {
        var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
        offp = 0;
        for (i = 0; i < plen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      __name(_ekskey, "_ekskey");
      function _crypt(b, salt, rounds, callback, progressCallback) {
        var cdata = C_ORIG.slice(), clen = cdata.length, err;
        if (rounds < 4 || rounds > 31) {
          err = Error("Illegal number of rounds (4-31): " + rounds);
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.length !== BCRYPT_SALT_LEN) {
          err = Error("Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN);
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        rounds = 1 << rounds >>> 0;
        var P, S, i = 0, j;
        if (Int32Array) {
          P = new Int32Array(P_ORIG);
          S = new Int32Array(S_ORIG);
        } else {
          P = P_ORIG.slice();
          S = S_ORIG.slice();
        }
        _ekskey(salt, b, P, S);
        function next() {
          if (progressCallback)
            progressCallback(i / rounds);
          if (i < rounds) {
            var start = Date.now();
            for (; i < rounds; ) {
              i = i + 1;
              _key(b, P, S);
              _key(salt, P, S);
              if (Date.now() - start > MAX_EXECUTION_TIME)
                break;
            }
          } else {
            for (i = 0; i < 64; i++)
              for (j = 0; j < clen >> 1; j++)
                _encipher(cdata, j << 1, P, S);
            var ret = [];
            for (i = 0; i < clen; i++)
              ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
            if (callback) {
              callback(null, ret);
              return;
            } else
              return ret;
          }
          if (callback)
            nextTick(next);
        }
        __name(next, "next");
        if (typeof callback !== "undefined") {
          next();
        } else {
          var res;
          while (true)
            if (typeof (res = next()) !== "undefined")
              return res || [];
        }
      }
      __name(_crypt, "_crypt");
      function _hash(s, salt, callback, progressCallback) {
        var err;
        if (typeof s !== "string" || typeof salt !== "string") {
          err = Error("Invalid string / salt: Not a string");
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var minor, offset;
        if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
          err = Error("Invalid salt version: " + salt.substring(0, 2));
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.charAt(2) === "$")
          minor = String.fromCharCode(0), offset = 3;
        else {
          minor = salt.charAt(2);
          if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
            err = Error("Invalid salt revision: " + salt.substring(2, 4));
            if (callback) {
              nextTick(callback.bind(this, err));
              return;
            } else
              throw err;
          }
          offset = 4;
        }
        if (salt.charAt(offset + 2) > "$") {
          err = Error("Missing salt rounds");
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
        s += minor >= "a" ? "\0" : "";
        var passwordb = stringToBytes2(s), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
        function finish(bytes) {
          var res = [];
          res.push("$2");
          if (minor >= "a")
            res.push(minor);
          res.push("$");
          if (rounds < 10)
            res.push("0");
          res.push(rounds.toString());
          res.push("$");
          res.push(base64_encode(saltb, saltb.length));
          res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
          return res.join("");
        }
        __name(finish, "finish");
        if (typeof callback == "undefined")
          return finish(_crypt(passwordb, saltb, rounds));
        else {
          _crypt(passwordb, saltb, rounds, function(err2, bytes) {
            if (err2)
              callback(err2, null);
            else
              callback(null, finish(bytes));
          }, progressCallback);
        }
      }
      __name(_hash, "_hash");
      bcrypt.encodeBase64 = base64_encode;
      bcrypt.decodeBase64 = base64_decode;
      return bcrypt;
    });
  }
});

// utils/database.js
async function getUserByEmail(email, env) {
  return await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
}
async function getUserById(id, env) {
  return await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
}
async function createUser(userData, env) {
  const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
  const bcrypt = await Promise.resolve().then(() => __toESM(require_bcrypt()));
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const role = userData.email === env.ADMIN_EMAIL ? "admin" : "user";
  await env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, role, points)
        VALUES (?, ?, ?, ?, 0)
    `).bind(userId, userData.email, hashedPassword, role).run();
  return await getUserById(userId, env);
}
async function validatePassword(password, hash) {
  const bcrypt = await Promise.resolve().then(() => __toESM(require_bcrypt()));
  return await bcrypt.compare(password, hash);
}
async function updateUserPoints(userId, points, env) {
  await env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?").bind(points, userId).run();
}
async function getUserHabits(userId, env) {
  const result = await env.DB.prepare(`
        SELECT h.*, 
               COUNT(hc.id) as total_completions,
               COUNT(CASE WHEN date(hc.completed_at) = date('now') THEN 1 END) as today_completed
        FROM habits h
        LEFT JOIN habit_completions hc ON h.id = hc.habit_id
        WHERE h.user_id = ?
        GROUP BY h.id
        ORDER BY h.created_at DESC
    `).bind(userId).all();
  return result.results || [];
}
async function createHabit(habitData, env) {
  const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
  const habitId = uuidv4();
  await env.DB.prepare(`
        INSERT INTO habits (id, user_id, name, description, target_frequency, color, weekly_target)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
    habitId,
    habitData.user_id,
    habitData.name,
    habitData.description || "",
    habitData.target_frequency || 1,
    habitData.color || "#667eea",
    habitData.weekly_target || 7
  ).run();
  return habitId;
}
async function markHabitComplete(habitId, userId, notes, env) {
  const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
  const existingCompletion = await env.DB.prepare(`
        SELECT id FROM habit_completions 
        WHERE habit_id = ? AND user_id = ? AND date(completed_at) = date('now')
    `).bind(habitId, userId).first();
  if (existingCompletion) {
    return { error: "Habit already completed today" };
  }
  const completionId = uuidv4();
  await env.DB.prepare(`
        INSERT INTO habit_completions (id, habit_id, user_id, notes)
        VALUES (?, ?, ?, ?)
    `).bind(completionId, habitId, userId, notes || "").run();
  await updateUserPoints(userId, 10, env);
  return { success: true, completionId, points: 10 };
}
async function getUserMedia(userId, env) {
  const result = await env.DB.prepare(`
        SELECT * FROM media_uploads 
        WHERE user_id = ? 
        ORDER BY uploaded_at DESC
    `).bind(userId).all();
  return result.results || [];
}
async function getAllMedia(env) {
  const result = await env.DB.prepare(`
        SELECT m.*, u.email as user_email
        FROM media_uploads m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.uploaded_at DESC
    `).all();
  return result.results || [];
}
async function checkAndAwardAchievements2(userId, env) {
  try {
    const { checkAndAwardAchievements: enhancedCheck } = await Promise.resolve().then(() => (init_achievements(), achievements_exports));
    return await enhancedCheck(userId, "general", {}, env);
  } catch (error) {
    console.error("Enhanced achievement check error:", error);
    return [];
  }
}
var init_database = __esm({
  "utils/database.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(getUserByEmail, "getUserByEmail");
    __name(getUserById, "getUserById");
    __name(createUser, "createUser");
    __name(validatePassword, "validatePassword");
    __name(updateUserPoints, "updateUserPoints");
    __name(getUserHabits, "getUserHabits");
    __name(createHabit, "createHabit");
    __name(markHabitComplete, "markHabitComplete");
    __name(getUserMedia, "getUserMedia");
    __name(getAllMedia, "getAllMedia");
    __name(checkAndAwardAchievements2, "checkAndAwardAchievements");
  }
});

// api/admin/media.js
async function onRequestGet2(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) return authResult;
    const media = await getAllMedia(env);
    const mediaWithUrls = media.map((item) => ({
      ...item,
      url: `/api/media/file/${item.id}`,
      download_url: `/api/admin/media/download/${item.id}`
    }));
    return new Response(JSON.stringify({ media: mediaWithUrls }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get admin media error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestPost2(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) return authResult;
    const body = await request.json();
    const { mediaId, action } = body;
    if (!mediaId || !action) {
      return new Response(JSON.stringify({
        error: "Media ID and action are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const media = await env.DB.prepare(
      "SELECT * FROM media_uploads WHERE id = ?"
    ).bind(mediaId).first();
    if (!media) {
      return new Response(JSON.stringify({
        error: "Media not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    switch (action) {
      case "flag":
        await env.DB.prepare(
          "UPDATE media_uploads SET is_flagged = 1 WHERE id = ?"
        ).bind(mediaId).run();
        return new Response(JSON.stringify({
          message: "Media flagged successfully"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      case "unflag":
        await env.DB.prepare(
          "UPDATE media_uploads SET is_flagged = 0 WHERE id = ?"
        ).bind(mediaId).run();
        return new Response(JSON.stringify({
          message: "Media unflagged successfully"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      case "delete":
        try {
          await env.MEDIA_BUCKET.delete(media.r2_key);
        } catch (error) {
          console.error("Error deleting from R2:", error);
        }
        await env.DB.prepare("DELETE FROM media_uploads WHERE id = ?").bind(mediaId).run();
        return new Response(JSON.stringify({
          message: "Media deleted successfully"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      default:
        return new Response(JSON.stringify({
          error: "Invalid action. Use: flag, unflag, or delete"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    console.error("Admin media action error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_media = __esm({
  "api/admin/media.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    init_database();
    __name(onRequestGet2, "onRequestGet");
    __name(onRequestPost2, "onRequestPost");
  }
});

// api/admin/users.js
async function onRequestGet3(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) return authResult;
    const users = await env.DB.prepare(`
            SELECT u.id, u.email, u.role, u.points, u.created_at,
                   COUNT(DISTINCT h.id) as total_habits,
                   COUNT(DISTINCT hc.id) as total_completions,
                   COUNT(DISTINCT m.id) as total_media
            FROM users u
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON u.id = hc.user_id
            LEFT JOIN media_uploads m ON u.id = m.user_id
            WHERE u.role != 'admin'
            GROUP BY u.id, u.email, u.role, u.points, u.created_at
            ORDER BY u.created_at DESC
        `).all();
    const stats = await env.DB.prepare(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role != 'admin') as total_users,
                (SELECT COUNT(*) FROM habits) as total_habits,
                (SELECT COUNT(*) FROM habit_completions) as total_completions,
                (SELECT COUNT(*) FROM media_uploads) as total_media,
                (SELECT COUNT(*) FROM media_uploads WHERE is_flagged = 1) as flagged_media
        `).first();
    return new Response(JSON.stringify({
      users,
      stats
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestDelete2(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) return authResult;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return new Response(JSON.stringify({
        error: "User ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const user = await env.DB.prepare(
      "SELECT id, role FROM users WHERE id = ?"
    ).bind(userId).first();
    if (!user) {
      return new Response(JSON.stringify({
        error: "User not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (user.role === "admin") {
      return new Response(JSON.stringify({
        error: "Cannot delete admin user"
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userMedia = await env.DB.prepare(
      "SELECT r2_key FROM media_uploads WHERE user_id = ?"
    ).bind(userId).all();
    for (const media of userMedia) {
      try {
        await env.MEDIA_BUCKET.delete(media.r2_key);
      } catch (error) {
        console.error("Error deleting R2 object:", error);
      }
    }
    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
    return new Response(JSON.stringify({
      message: "User deleted successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_users = __esm({
  "api/admin/users.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestGet3, "onRequestGet");
    __name(onRequestDelete2, "onRequestDelete");
  }
});

// api/auth/login.js
async function onRequestPost3(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: "Email and password are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await cleanupExpiredSessions(env);
    const user = await getUserByEmail(email, env);
    if (!user) {
      return new Response(JSON.stringify({
        error: "Invalid email or password"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isValidPassword = await validatePassword(password, user.password_hash);
    if (!isValidPassword) {
      return new Response(JSON.stringify({
        error: "Invalid email or password"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionId = await createSession(user.id, env);
    return new Response(JSON.stringify({
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        points: user.points
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_login = __esm({
  "api/auth/login.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_database();
    init_auth();
    __name(onRequestPost3, "onRequestPost");
  }
});

// api/auth/logout.js
async function onRequestPost4(context) {
  const { request, env } = context;
  try {
    const sessionId = request.headers.get("x-session-id");
    if (sessionId) {
      await deleteSession(sessionId, env);
    }
    return new Response(JSON.stringify({
      message: "Logged out successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_logout = __esm({
  "api/auth/logout.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestPost4, "onRequestPost");
  }
});

// api/auth/register.js
async function onRequestPost5(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: "Email and password are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        error: "Invalid email format"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({
        error: "Password must be at least 6 characters"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingUser = await getUserByEmail(email, env);
    if (existingUser) {
      return new Response(JSON.stringify({
        error: "Email already registered"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const user = await createUser({ email, password }, env);
    const sessionId = await createSession(user.id, env);
    return new Response(JSON.stringify({
      message: "User registered successfully",
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        points: user.points
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_register = __esm({
  "api/auth/register.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_database();
    init_auth();
    __name(onRequestPost5, "onRequestPost");
  }
});

// api/auth/validate-session.js
async function onRequestGet4(context) {
  const { request, env } = context;
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(JSON.stringify({
        error: "Invalid session"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        points: user.points
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_validate_session = __esm({
  "api/auth/validate-session.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestGet4, "onRequestGet");
  }
});

// api/challenges/daily.js
async function onRequestGet5({ request, env }) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const challenges = await env.DB.prepare(`
            SELECT 
                dc.*,
                COALESCE(udc.progress_count, 0) as current_progress,
                COALESCE(udc.is_completed, 0) as is_completed,
                COALESCE(udc.points_earned, 0) as points_earned,
                udc.completed_at,
                CASE 
                    WHEN udc.is_completed = 1 THEN 100
                    ELSE ROUND((CAST(COALESCE(udc.progress_count, 0) AS FLOAT) / dc.requirement_value) * 100)
                END as progress_percentage
            FROM daily_challenges dc
            LEFT JOIN user_daily_challenges udc ON dc.id = udc.challenge_id 
                AND udc.user_id = ? 
                AND udc.challenge_date = ?
            WHERE dc.is_active = 1
            ORDER BY 
                udc.is_completed ASC,
                CASE dc.rarity 
                    WHEN 'legendary' THEN 4
                    WHEN 'epic' THEN 3 
                    WHEN 'rare' THEN 2
                    ELSE 1
                END DESC,
                dc.points_reward DESC
        `).bind(userId, today).all();
    const streaks = await env.DB.prepare(`
            SELECT * FROM user_streaks WHERE user_id = ?
        `).bind(userId).all();
    const totalChallenges = challenges.results?.length || 0;
    const completedChallenges = challenges.results?.filter((c) => c.is_completed).length || 0;
    const totalPointsEarned = challenges.results?.reduce((sum, c) => sum + c.points_earned, 0) || 0;
    const completionPercentage = totalChallenges > 0 ? Math.round(completedChallenges / totalChallenges * 100) : 0;
    return new Response(JSON.stringify({
      challenges: challenges.results || [],
      streaks: streaks.results || [],
      stats: {
        total_challenges: totalChallenges,
        completed_challenges: completedChallenges,
        completion_percentage: completionPercentage,
        points_earned_today: totalPointsEarned
      },
      date: today
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Daily challenges error:", error);
    return new Response(JSON.stringify({ error: "Failed to load daily challenges" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_daily = __esm({
  "api/challenges/daily.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequestGet5, "onRequestGet");
  }
});

// api/habits/complete.js
async function onRequestPost6(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const body = await request.json();
    const { habitId, notes } = body;
    if (!habitId) {
      return new Response(JSON.stringify({
        error: "Habit ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const habit = await env.DB.prepare(
      "SELECT id FROM habits WHERE id = ? AND user_id = ?"
    ).bind(habitId, user.id).first();
    if (!habit) {
      return new Response(JSON.stringify({
        error: "Habit not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await markHabitComplete(habitId, user.id, notes, env);
    if (result.error) {
      return new Response(JSON.stringify({
        error: result.error
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { checkAndAwardAchievements: enhancedCheck } = await Promise.resolve().then(() => (init_achievements(), achievements_exports));
    const newAchievements = await enhancedCheck(user.id, "habit_completion", {
      habitId,
      time: (/* @__PURE__ */ new Date()).toISOString(),
      notes
    }, env);
    return new Response(JSON.stringify({
      message: "Habit completed successfully",
      points: result.points,
      newAchievements
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Complete habit error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_complete = __esm({
  "api/habits/complete.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    init_database();
    __name(onRequestPost6, "onRequestPost");
  }
});

// api/habits/weekly.js
async function onRequestGet6(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const url = new URL(request.url);
    const weekStart = url.searchParams.get("weekStart") || getCurrentWeekStart();
    const habitsResult = await env.DB.prepare(`
            SELECT h.*, h.weekly_target
            FROM habits h
            WHERE h.user_id = ?
            ORDER BY h.created_at DESC
        `).bind(user.id).all();
    const habits = habitsResult.results || [];
    const completionsResult = await env.DB.prepare(`
            SELECT * FROM weekly_habit_completions
            WHERE user_id = ? AND week_start_date = ?
        `).bind(user.id, weekStart).all();
    const completions = completionsResult.results || [];
    const habitsWithWeekly = habits.map((habit) => {
      const weekCompletions = completions.filter((c) => c.habit_id === habit.id);
      const completedDays = weekCompletions.map((c) => c.day_of_week);
      return {
        ...habit,
        weekStart,
        completedDays,
        weekCompletions,
        completedCount: completedDays.length,
        targetCount: habit.weekly_target || 7
      };
    });
    return new Response(JSON.stringify({
      habits: habitsWithWeekly,
      weekStart,
      weekEnd: getWeekEnd(weekStart)
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get weekly habits error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestPost7(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const body = await request.json();
    const { habitId, date, dayOfWeek } = body;
    if (!habitId || !date || dayOfWeek === void 0) {
      return new Response(JSON.stringify({
        error: "Habit ID, date, and dayOfWeek are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const habit = await env.DB.prepare(
      "SELECT id FROM habits WHERE id = ? AND user_id = ?"
    ).bind(habitId, user.id).first();
    if (!habit) {
      return new Response(JSON.stringify({
        error: "Habit not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const weekStart = getWeekStartFromDate(date);
    const existing = await env.DB.prepare(`
            SELECT id FROM weekly_habit_completions 
            WHERE habit_id = ? AND completion_date = ?
        `).bind(habitId, date).first();
    if (existing) {
      await env.DB.prepare(`
                DELETE FROM weekly_habit_completions WHERE id = ?
            `).bind(existing.id).run();
      return new Response(JSON.stringify({
        message: "Completion removed",
        completed: false
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
      const completionId = uuidv4();
      await env.DB.prepare(`
                INSERT INTO weekly_habit_completions 
                (id, habit_id, user_id, completion_date, day_of_week, week_start_date)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(completionId, habitId, user.id, date, dayOfWeek, weekStart).run();
      await env.DB.prepare("UPDATE users SET points = points + 5 WHERE id = ?").bind(user.id).run();
      return new Response(JSON.stringify({
        message: "Completion added",
        completed: true,
        points: 5
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Toggle weekly completion error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
function getCurrentWeekStart() {
  const now = /* @__PURE__ */ new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  return sunday.toISOString().split("T")[0];
}
function getWeekStartFromDate(dateStr) {
  const date = new Date(dateStr);
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  return sunday.toISOString().split("T")[0];
}
function getWeekEnd(weekStartStr) {
  const weekStart = new Date(weekStartStr);
  const saturday = new Date(weekStart);
  saturday.setDate(weekStart.getDate() + 6);
  return saturday.toISOString().split("T")[0];
}
var init_weekly = __esm({
  "api/habits/weekly.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestGet6, "onRequestGet");
    __name(onRequestPost7, "onRequestPost");
    __name(getCurrentWeekStart, "getCurrentWeekStart");
    __name(getWeekStartFromDate, "getWeekStartFromDate");
    __name(getWeekEnd, "getWeekEnd");
  }
});

// api/media/enhanced.js
function getWeekStartFromDate2(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}
function getWeekEndFromDate(date) {
  const weekStart = getWeekStartFromDate2(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}
async function getUserMediaEnhanced(userId, env) {
  const result = await env.DB.prepare(`
        SELECT * FROM media_uploads 
        WHERE user_id = ? 
        ORDER BY uploaded_at DESC
    `).bind(userId).all();
  const media = result.results || [];
  const categorizedMedia = media.map((item) => ({
    ...item,
    media_type: item.media_type || "progress"
  }));
  return categorizedMedia;
}
async function pairBeforeAfterMedia(media) {
  const pairs = [];
  const beforeMedia = media.filter((m) => m.media_type === "before");
  const afterMedia = media.filter((m) => m.media_type === "after");
  beforeMedia.forEach((beforeItem) => {
    const beforeDate = new Date(beforeItem.uploaded_at);
    const weekStart = getWeekStartFromDate2(beforeDate);
    const weekEnd = getWeekEndFromDate(beforeDate);
    const matchingAfter = afterMedia.find((afterItem) => {
      const afterDate = new Date(afterItem.uploaded_at);
      return afterDate >= weekStart && afterDate <= weekEnd;
    });
    if (matchingAfter) {
      pairs.push({
        id: `pair_${beforeItem.id}_${matchingAfter.id}`,
        before: beforeItem,
        after: matchingAfter,
        week_start: weekStart.toISOString().split("T")[0],
        week_end: weekEnd.toISOString().split("T")[0]
      });
    }
  });
  return pairs;
}
async function calculateMediaStats(media) {
  const totalUploads = media.length;
  const beforeCount = media.filter((m) => m.media_type === "before").length;
  const afterCount = media.filter((m) => m.media_type === "after").length;
  const progressCount = media.filter((m) => m.media_type === "progress").length;
  const weeklyUploads = {};
  media.forEach((item) => {
    const date = new Date(item.uploaded_at);
    const weekStart = getWeekStartFromDate2(date).toISOString().split("T")[0];
    if (!weeklyUploads[weekStart]) {
      weeklyUploads[weekStart] = { before: 0, after: 0, progress: 0, total: 0 };
    }
    weeklyUploads[weekStart][item.media_type]++;
    weeklyUploads[weekStart].total++;
  });
  const mostActiveWeek = Object.keys(weeklyUploads).reduce((max, week) => {
    return weeklyUploads[week].total > (weeklyUploads[max]?.total || 0) ? week : max;
  }, null);
  return {
    total_uploads: totalUploads,
    before_count: beforeCount,
    after_count: afterCount,
    progress_count: progressCount,
    weekly_uploads: weeklyUploads,
    most_active_week: mostActiveWeek,
    most_active_week_count: mostActiveWeek ? weeklyUploads[mostActiveWeek].total : 0
  };
}
async function onRequestGet7(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const url = new URL(request.url);
    const includeStats = url.searchParams.get("stats") === "true";
    const includePairs = url.searchParams.get("pairs") === "true";
    const filterType = url.searchParams.get("type");
    const media = await getUserMediaEnhanced(user.id, env);
    const mediaWithUrls = await Promise.all(media.map(async (item) => {
      try {
        const object = await env.MEDIA_BUCKET.get(item.r2_key);
        if (object) {
          return {
            ...item,
            url: `/api/media/file/${item.id}`,
            thumbnail: `/api/media/thumbnail/${item.id}`
          };
        }
        return item;
      } catch (error) {
        console.error("Error getting media URL:", error);
        return item;
      }
    }));
    const filteredMedia = filterType ? mediaWithUrls.filter((m) => m.media_type === filterType) : mediaWithUrls;
    const response = {
      media: filteredMedia
    };
    if (includeStats) {
      response.stats = await calculateMediaStats(mediaWithUrls);
    }
    if (includePairs) {
      const pairs = await pairBeforeAfterMedia(mediaWithUrls);
      response.pairs = pairs;
    }
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get enhanced media error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestPost8(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const formData = await request.formData();
    const file = formData.get("file");
    const description = formData.get("description") || "";
    const mediaType = formData.get("media_type") || "progress";
    if (!file || !file.name) {
      return new Response(JSON.stringify({
        error: "File is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const validTypes = ["before", "after", "progress"];
    if (!validTypes.includes(mediaType)) {
      return new Response(JSON.stringify({
        error: "Invalid media type. Must be: before, after, or progress"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        error: "Invalid file type. Only images and videos are allowed."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (file.size > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({
        error: "File size too large. Maximum 50MB allowed."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const mediaId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const r2Key = `uploads/${user.id}/${mediaId}.${fileExtension}`;
    await env.MEDIA_BUCKET.put(r2Key, file.stream());
    await env.DB.prepare(`
            INSERT INTO media_uploads (id, user_id, filename, original_name, file_type, file_size, r2_key, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      mediaId,
      user.id,
      `${mediaId}.${fileExtension}`,
      file.name,
      file.type,
      file.size,
      r2Key,
      `${mediaType}: ${description}`.trim()
      // Prefix description with media type
    ).run();
    const points = mediaType === "before" ? 10 : mediaType === "after" ? 15 : 5;
    await env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?").bind(points, user.id).run();
    let pairBonus = 0;
    if (mediaType === "after") {
      const userMedia = await getUserMediaEnhanced(user.id, env);
      const pairs = await pairBeforeAfterMedia(userMedia);
      const newPair = pairs.find((pair) => pair.after.id === mediaId);
      if (newPair) {
        pairBonus = 25;
        await env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?").bind(pairBonus, user.id).run();
      }
    }
    const { checkAndAwardAchievements: checkAndAwardAchievements3 } = await Promise.resolve().then(() => (init_achievements(), achievements_exports));
    const newAchievements = await checkAndAwardAchievements3(user.id, "media_upload", {
      media_type: mediaType,
      total_points: points + pairBonus
    }, env);
    return new Response(JSON.stringify({
      message: "Media uploaded successfully",
      mediaId,
      media_type: mediaType,
      points,
      pair_bonus: pairBonus,
      total_points: points + pairBonus,
      newAchievements
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Upload enhanced media error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_enhanced = __esm({
  "api/media/enhanced.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(getWeekStartFromDate2, "getWeekStartFromDate");
    __name(getWeekEndFromDate, "getWeekEndFromDate");
    __name(getUserMediaEnhanced, "getUserMediaEnhanced");
    __name(pairBeforeAfterMedia, "pairBeforeAfterMedia");
    __name(calculateMediaStats, "calculateMediaStats");
    __name(onRequestGet7, "onRequestGet");
    __name(onRequestPost8, "onRequestPost");
  }
});

// api/media/videos.js
async function onRequestPost9({ request, env }) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const formData = await request.formData();
    const file = formData.get("file");
    const videoType = formData.get("video_type") || "progress";
    const tags = formData.get("tags") || "[]";
    if (!file) {
      return new Response(JSON.stringify({ error: "No video file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!file.type.startsWith("video/")) {
      return new Response(JSON.stringify({ error: "File must be a video" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const fileExtension = file.name.split(".").pop();
    const fileName = `videos/${userId}/${Date.now()}-${uuidv4()}.${fileExtension}`;
    try {
      await env.MEDIA_BUCKET.put(fileName, file.stream(), {
        httpMetadata: {
          contentType: file.type
        },
        customMetadata: {
          userId,
          videoType,
          uploadDate: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      const videoUrl = `${env.MEDIA_BUCKET_URL || "/api/media/serve"}/${fileName}`;
      const today = /* @__PURE__ */ new Date();
      const uploadDate = today.toISOString().split("T")[0];
      const weekNumber = getWeekNumber(today);
      const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      const videoId = uuidv4();
      await env.DB.prepare(`
                INSERT INTO user_video_uploads (
                    id, user_id, video_url, video_type, upload_date, 
                    week_number, month_year, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
        videoId,
        userId,
        videoUrl,
        videoType,
        uploadDate,
        weekNumber,
        monthYear,
        tags
      ).run();
      const pointsEarned = videoType === "before" || videoType === "after" ? 50 : 25;
      await env.DB.prepare(
        "UPDATE users SET points = points + ?, weekly_points = weekly_points + ? WHERE id = ?"
      ).bind(pointsEarned, pointsEarned, userId).run();
      let beforeAfterPaired = false;
      if (videoType === "before" || videoType === "after") {
        const oppositeType = videoType === "before" ? "after" : "before";
        const pairVideo = await env.DB.prepare(`
                    SELECT id FROM user_video_uploads 
                    WHERE user_id = ? AND video_type = ? 
                    AND upload_date >= date('now', '-60 days')
                    ORDER BY upload_date DESC LIMIT 1
                `).bind(userId, oppositeType).first();
        if (pairVideo) {
          await env.DB.prepare(`
                        UPDATE user_video_uploads 
                        SET is_before_after = 1, comparison_video_id = ?
                        WHERE id = ?
                    `).bind(pairVideo.id, videoId).run();
          await env.DB.prepare(`
                        UPDATE user_video_uploads 
                        SET is_before_after = 1, comparison_video_id = ?
                        WHERE id = ?
                    `).bind(videoId, pairVideo.id).run();
          beforeAfterPaired = true;
        }
      }
      try {
        const { checkAndAwardAchievements: checkAndAwardAchievements3 } = await Promise.resolve().then(() => (init_achievements(), achievements_exports));
        await checkAndAwardAchievements3(userId, "video_upload", { video_type: videoType }, env);
      } catch (achievementError) {
        console.error("Achievement check error:", achievementError);
      }
      return new Response(JSON.stringify({
        message: "Video uploaded successfully!",
        video_id: videoId,
        video_url: videoUrl,
        points_earned: pointsEarned,
        before_after_paired: beforeAfterPaired,
        video_type: videoType
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (uploadError) {
      console.error("Video upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload video" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Video upload error:", error);
    return new Response(JSON.stringify({ error: "Failed to process video upload" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestGet8({ request, env }) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const videos = await env.DB.prepare(`
            SELECT 
                id, video_url, video_type, upload_date, tags,
                is_before_after, comparison_video_id,
                week_number, month_year
            FROM user_video_uploads 
            WHERE user_id = ? 
            ORDER BY upload_date DESC
        `).bind(userId).all();
    const videoStats = {
      total: videos.results?.length || 0,
      by_type: {},
      this_month: 0,
      this_week: 0,
      before_after_pairs: 0
    };
    const today = /* @__PURE__ */ new Date();
    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const thisWeek = getWeekNumber(today);
    videos.results?.forEach((video) => {
      videoStats.by_type[video.video_type] = (videoStats.by_type[video.video_type] || 0) + 1;
      if (video.month_year === thisMonth) {
        videoStats.this_month++;
      }
      if (video.week_number === thisWeek) {
        videoStats.this_week++;
      }
      if (video.is_before_after) {
        videoStats.before_after_pairs++;
      }
    });
    return new Response(JSON.stringify({
      videos: videos.results || [],
      stats: videoStats
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get videos error:", error);
    return new Response(JSON.stringify({ error: "Failed to load videos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 864e5;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
var init_videos = __esm({
  "api/media/videos.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequestPost9, "onRequestPost");
    __name(onRequestGet8, "onRequestGet");
    __name(getWeekNumber, "getWeekNumber");
  }
});

// api/achievements/unlock.js
async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const session = await env.DB.prepare(
      'SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!session) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = session.user_id;
    const body = await request.json();
    const { achievement_id } = body;
    if (!achievement_id) {
      return new Response(JSON.stringify({ error: "Achievement ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const achievement = await env.DB.prepare(`
            SELECT a.*, 
                   CASE WHEN ua.id IS NULL THEN 0 ELSE 1 END as is_completed,
                   ua.created_at as earned_at
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE a.id = ?
        `).bind(userId, achievement_id).first();
    if (!achievement) {
      return new Response(JSON.stringify({ error: "Achievement not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (achievement.is_completed) {
      return new Response(JSON.stringify({ error: "Achievement already unlocked" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { checkAndAwardAchievements: checkAndAwardAchievements3 } = await Promise.resolve().then(() => (init_achievements(), achievements_exports));
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const userAchievementId = uuidv4();
    await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `).bind(userAchievementId, userId, achievement_id).run();
    if (achievement.points > 0) {
      await env.DB.prepare(`
                UPDATE users SET points = points + ? WHERE id = ?
            `).bind(achievement.points, userId).run();
    }
    const unlockedAchievement = await env.DB.prepare(`
            SELECT a.*, ua.created_at as earned_at, 1 as is_completed
            FROM achievements a
            JOIN user_achievements ua ON a.id = ua.achievement_id
            WHERE ua.id = ?
        `).bind(userAchievementId).first();
    try {
      const activityId = uuidv4();
      await env.DB.prepare(`
                INSERT INTO user_activity_log (id, user_id, activity_type, activity_data, created_at)
                VALUES (?, ?, 'achievement_unlock', ?, datetime('now'))
            `).bind(activityId, userId, JSON.stringify({
        achievement_id,
        achievement_name: achievement.name,
        rarity: achievement.rarity,
        points: achievement.points
      })).run();
    } catch (error) {
      console.error("Failed to log achievement activity:", error);
    }
    await checkComboAchievements(userId, env);
    return new Response(JSON.stringify({
      success: true,
      achievement: unlockedAchievement,
      message: `Achievement "${achievement.name}" unlocked! +${achievement.points} points`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Achievement unlock error:", error);
    return new Response(JSON.stringify({ error: "Failed to unlock achievement" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function checkComboAchievements(userId, env) {
  try {
    const todayAchievements = await env.DB.prepare(`
            SELECT COUNT(*) as count
            FROM user_achievements
            WHERE user_id = ? AND date(created_at) = date('now')
        `).bind(userId).first();
    if (todayAchievements.count >= 3) {
      await awardComboAchievement(userId, "Achievement Spree", 3, env);
    }
    if (todayAchievements.count >= 5) {
      await awardComboAchievement(userId, "Achievement Frenzy", 5, env);
    }
    if (todayAchievements.count >= 10) {
      await awardComboAchievement(userId, "Achievement Hurricane", 10, env);
    }
  } catch (error) {
    console.error("Combo achievement check error:", error);
  }
}
async function awardComboAchievement(userId, achievementName, count, env) {
  try {
    const existingCombo = await env.DB.prepare(`
            SELECT ua.id
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ? AND a.name = ?
        `).bind(userId, achievementName).first();
    if (existingCombo) return;
    const comboAchievement = await env.DB.prepare(`
            SELECT * FROM achievements WHERE name = ?
        `).bind(achievementName).first();
    if (!comboAchievement) return;
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const comboId = uuidv4();
    await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `).bind(comboId, userId, comboAchievement.id).run();
    if (comboAchievement.points > 0) {
      await env.DB.prepare(`
                UPDATE users SET points = points + ? WHERE id = ?
            `).bind(comboAchievement.points, userId).run();
    }
  } catch (error) {
    console.error("Award combo achievement error:", error);
  }
}
var init_unlock = __esm({
  "api/achievements/unlock.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequest, "onRequest");
    __name(checkComboAchievements, "checkComboAchievements");
    __name(awardComboAchievement, "awardComboAchievement");
  }
});

// api/leaderboards/achievements.js
async function onRequest2(context) {
  const { request, env } = context;
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const session = await env.DB.prepare(
      'SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!session) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = session.user_id;
    const weekStart = /* @__PURE__ */ new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const leaderboard = await env.DB.prepare(`
            SELECT 
                u.id,
                u.email,
                COALESCE(u.display_name, SUBSTR(u.email, 1, INSTR(u.email, '@') - 1)) as display_name,
                COUNT(ua.id) as weekly_achievements,
                (SELECT COUNT(*) FROM user_achievements ua2 WHERE ua2.user_id = u.id) as total_achievements,
                u.points as total_points,
                CASE WHEN u.id = ? THEN 1 ELSE 0 END as is_current_user,
                ROW_NUMBER() OVER (ORDER BY COUNT(ua.id) DESC, u.points DESC) as rank
            FROM users u
            LEFT JOIN user_achievements ua ON u.id = ua.user_id 
                AND date(ua.created_at) >= date(?)
            WHERE u.id IN (
                SELECT CASE 
                    WHEN f.user_id = ? THEN f.friend_id
                    WHEN f.friend_id = ? THEN f.user_id
                END as friend_id
                FROM friendships f 
                WHERE (f.user_id = ? OR f.friend_id = ?) 
                AND f.status = 'accepted'
                UNION
                SELECT ? -- Include current user
            )
            GROUP BY u.id, u.email, u.display_name, u.points
            ORDER BY COUNT(ua.id) DESC, u.points DESC
            LIMIT 10
        `).bind(userId, weekStartStr, userId, userId, userId, userId, userId).all();
    const results = leaderboard.results || [];
    const formattedLeaderboard = results.map((entry) => ({
      id: entry.id,
      display_name: entry.display_name,
      score: entry.weekly_achievements,
      total_achievements: entry.total_achievements,
      total_points: entry.total_points,
      rank: entry.rank,
      is_current_user: entry.is_current_user === 1
    }));
    const userStats = await env.DB.prepare(`
            SELECT 
                COUNT(CASE WHEN date(ua.created_at) >= date(?) THEN 1 END) as weekly_achievements,
                COUNT(*) as total_achievements,
                COUNT(CASE WHEN a.rarity = 'legendary' THEN 1 END) as legendary_count,
                COUNT(CASE WHEN a.rarity = 'epic' THEN 1 END) as epic_count,
                COUNT(CASE WHEN a.rarity = 'rare' THEN 1 END) as rare_count,
                COUNT(CASE WHEN a.rarity = 'common' THEN 1 END) as common_count
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
        `).bind(weekStartStr, userId).first();
    return new Response(JSON.stringify({
      leaderboard: formattedLeaderboard,
      user_stats: userStats || {
        weekly_achievements: 0,
        total_achievements: 0,
        legendary_count: 0,
        epic_count: 0,
        rare_count: 0,
        common_count: 0
      },
      week_start: weekStartStr,
      leaderboard_type: "achievements"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Achievement leaderboard error:", error);
    return new Response(JSON.stringify({ error: "Failed to load achievement leaderboard" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_achievements2 = __esm({
  "api/leaderboards/achievements.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequest2, "onRequest");
  }
});

// api/habits/[id].js
async function onRequestDelete3(context) {
  const { request, env, params } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const habitId = params.id;
    if (!habitId) {
      return new Response(JSON.stringify({
        error: "Habit ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const habit = await env.DB.prepare(
      "SELECT id FROM habits WHERE id = ? AND user_id = ?"
    ).bind(habitId, user.id).first();
    if (!habit) {
      return new Response(JSON.stringify({
        error: "Habit not found or you do not have permission to delete it"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare("DELETE FROM habit_completions WHERE habit_id = ?").bind(habitId).run();
    await env.DB.prepare("DELETE FROM habits WHERE id = ? AND user_id = ?").bind(habitId, user.id).run();
    return new Response(JSON.stringify({
      message: "Habit deleted successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Delete habit error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_id2 = __esm({
  "api/habits/[id].js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestDelete3, "onRequestDelete");
  }
});

// api/achievements/index.js
async function onRequestGet9(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const achievementsResult = await env.DB.prepare(`
            SELECT 
                a.*,
                ua.earned_at,
                CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as earned
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            ORDER BY 
                a.category,
                a.difficulty,
                earned DESC,
                a.points ASC
        `).bind(user.id).all();
    const achievements = achievementsResult.results || [];
    const userStatsResult = await env.DB.prepare(`
            SELECT 
                u.points as total_points,
                u.created_at as user_created_at,
                (SELECT COUNT(*) FROM habits WHERE user_id = ?) as habits_created,
                (SELECT COUNT(*) FROM habit_completions WHERE user_id = ?) as total_completions,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'image/%') as photos_uploaded,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'video/%') as videos_uploaded,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ?) as total_media
            FROM users u
            WHERE u.id = ?
        `).bind(user.id, user.id, user.id, user.id, user.id, user.id).first();
    const achievementsWithProgress = achievements.map((achievement) => {
      let currentProgress = 0;
      let progressPercentage = 0;
      switch (achievement.requirement_type) {
        case "account_created":
          currentProgress = 1;
          break;
        case "habits_created":
          currentProgress = userStatsResult.habits_created;
          break;
        case "total_completions":
          currentProgress = userStatsResult.total_completions;
          break;
        case "photos_uploaded":
          currentProgress = userStatsResult.photos_uploaded;
          break;
        case "videos_uploaded":
          currentProgress = userStatsResult.videos_uploaded;
          break;
        case "total_media":
          currentProgress = userStatsResult.total_media;
          break;
        case "total_points":
          currentProgress = userStatsResult.total_points;
          break;
        case "habit_streak":
          currentProgress = 0;
          break;
        default:
          currentProgress = achievement.earned ? achievement.requirement_value : 0;
      }
      progressPercentage = Math.min(100, Math.round(currentProgress / achievement.requirement_value * 100));
      return {
        ...achievement,
        current_progress: currentProgress,
        progress_percentage: progressPercentage,
        is_completed: achievement.earned === 1,
        is_unlockable: currentProgress >= achievement.requirement_value && !achievement.earned
      };
    });
    const groupedAchievements = achievementsWithProgress.reduce((groups, achievement) => {
      const category = achievement.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(achievement);
      return groups;
    }, {});
    const totalAchievements = achievements.length;
    const earnedAchievements = achievements.filter((a) => a.earned === 1).length;
    const totalPointsFromAchievements = achievements.filter((a) => a.earned === 1).reduce((sum, a) => sum + a.points, 0);
    const stats = {
      total_achievements: totalAchievements,
      earned_achievements: earnedAchievements,
      completion_percentage: Math.round(earnedAchievements / totalAchievements * 100),
      total_points: userStatsResult.total_points,
      achievement_points: totalPointsFromAchievements,
      unlockable_count: achievementsWithProgress.filter((a) => a.is_unlockable).length
    };
    return new Response(JSON.stringify({
      achievements: achievementsWithProgress,
      grouped_achievements: groupedAchievements,
      stats
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestPost10(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const body = await request.json();
    const { achievement_id } = body;
    if (!achievement_id) {
      return new Response(JSON.stringify({
        error: "Achievement ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const achievement = await env.DB.prepare(
      "SELECT * FROM achievements WHERE id = ?"
    ).bind(achievement_id).first();
    if (!achievement) {
      return new Response(JSON.stringify({
        error: "Achievement not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingUserAchievement = await env.DB.prepare(
      "SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?"
    ).bind(user.id, achievement_id).first();
    if (existingUserAchievement) {
      return new Response(JSON.stringify({
        error: "Achievement already earned"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const userAchievementId = uuidv4();
    await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id)
            VALUES (?, ?, ?)
        `).bind(userAchievementId, user.id, achievement_id).run();
    if (achievement.points > 0) {
      await env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?").bind(achievement.points, user.id).run();
    }
    return new Response(JSON.stringify({
      message: "Achievement unlocked!",
      achievement,
      points_awarded: achievement.points
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Unlock achievement error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_achievements3 = __esm({
  "api/achievements/index.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    __name(onRequestGet9, "onRequestGet");
    __name(onRequestPost10, "onRequestPost");
  }
});

// api/friends/index.js
async function onRequestGet10({ request, env }) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const friends = await env.DB.prepare(`
            SELECT 
                u.id,
                u.email,
                u.points,
                u.weekly_points,
                uf.created_at as friendship_date,
                (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements
            FROM user_friends uf
            JOIN users u ON (
                CASE 
                    WHEN uf.user_id = ? THEN u.id = uf.friend_id
                    ELSE u.id = uf.user_id
                END
            )
            WHERE (uf.user_id = ? OR uf.friend_id = ?) AND uf.status = 'accepted'
            ORDER BY uf.created_at DESC
        `).bind(userId, userId, userId).all();
    const pendingRequests = await env.DB.prepare(`
            SELECT 
                fr.id,
                u.email,
                fr.created_at
            FROM friend_requests fr
            JOIN users u ON fr.from_user_id = u.id
            WHERE fr.to_user_id = ? AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        `).bind(userId).all();
    const sentRequests = await env.DB.prepare(`
            SELECT 
                fr.id,
                u.email,
                fr.created_at
            FROM friend_requests fr
            JOIN users u ON fr.to_user_id = u.id
            WHERE fr.from_user_id = ? AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        `).bind(userId).all();
    return new Response(JSON.stringify({
      friends: friends.results || [],
      pending_requests: pendingRequests.results || [],
      sent_requests: sentRequests.results || []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Friends list error:", error);
    return new Response(JSON.stringify({ error: "Failed to load friends" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestPost11({ request, env }) {
  try {
    const sessionId = request.headers.get("x-session-id");
    const { action, email, request_id } = await request.json();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    if (action === "send_request") {
      const targetUser = await env.DB.prepare(
        "SELECT id FROM users WHERE email = ?"
      ).bind(email).first();
      if (!targetUser) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (targetUser.id === userId) {
        return new Response(JSON.stringify({ error: "Cannot add yourself as friend" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const existingFriendship = await env.DB.prepare(`
                SELECT id FROM user_friends 
                WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
            `).bind(userId, targetUser.id, targetUser.id, userId).first();
      if (existingFriendship) {
        return new Response(JSON.stringify({ error: "Friendship already exists" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const existingRequest = await env.DB.prepare(`
                SELECT id FROM friend_requests 
                WHERE ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?))
                AND status = 'pending'
            `).bind(userId, targetUser.id, targetUser.id, userId).first();
      if (existingRequest) {
        return new Response(JSON.stringify({ error: "Friend request already sent" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      await env.DB.prepare(`
                INSERT INTO friend_requests (id, from_user_id, to_user_id)
                VALUES (?, ?, ?)
            `).bind(uuidv4(), userId, targetUser.id).run();
      return new Response(JSON.stringify({ message: "Friend request sent!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else if (action === "accept_request") {
      const request2 = await env.DB.prepare(
        'SELECT * FROM friend_requests WHERE id = ? AND to_user_id = ? AND status = "pending"'
      ).bind(request_id, userId).first();
      if (!request2) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      await env.DB.prepare(`
                UPDATE friend_requests 
                SET status = 'accepted', responded_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).bind(request_id).run();
      const friendshipId1 = uuidv4();
      const friendshipId2 = uuidv4();
      await env.DB.prepare(`
                INSERT INTO user_friends (id, user_id, friend_id, status, accepted_at)
                VALUES (?, ?, ?, 'accepted', CURRENT_TIMESTAMP)
            `).bind(friendshipId1, request2.from_user_id, userId).run();
      await env.DB.prepare(`
                INSERT INTO user_friends (id, user_id, friend_id, status, accepted_at)
                VALUES (?, ?, ?, 'accepted', CURRENT_TIMESTAMP)
            `).bind(friendshipId2, userId, request2.from_user_id).run();
      await env.DB.prepare("UPDATE users SET total_friends = total_friends + 1 WHERE id = ?").bind(userId).run();
      await env.DB.prepare("UPDATE users SET total_friends = total_friends + 1 WHERE id = ?").bind(request2.from_user_id).run();
      return new Response(JSON.stringify({ message: "Friend request accepted!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else if (action === "decline_request") {
      await env.DB.prepare(`
                UPDATE friend_requests 
                SET status = 'declined', responded_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND to_user_id = ?
            `).bind(request_id, userId).run();
      return new Response(JSON.stringify({ message: "Friend request declined" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Friends action error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_friends = __esm({
  "api/friends/index.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequestGet10, "onRequestGet");
    __name(onRequestPost11, "onRequestPost");
  }
});

// api/habits/index.js
async function onRequestGet11(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const habits = await getUserHabits(user.id, env);
    return new Response(JSON.stringify({ habits }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get habits error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestPost12(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const body = await request.json();
    const { name, description, target_frequency, color, weekly_target } = body;
    if (!name || name.trim() === "") {
      return new Response(JSON.stringify({
        error: "Habit name is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const habitData = {
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || "",
      target_frequency: target_frequency || 1,
      color: color || "#667eea",
      weekly_target: weekly_target || 7
    };
    const habitId = await createHabit(habitData, env);
    const newAchievements = await checkAndAwardAchievements2(user.id, env);
    return new Response(JSON.stringify({
      message: "Habit created successfully",
      habitId,
      newAchievements
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Create habit error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_habits = __esm({
  "api/habits/index.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    init_database();
    __name(onRequestGet11, "onRequestGet");
    __name(onRequestPost12, "onRequestPost");
  }
});

// api/leaderboards/index.js
async function onRequestGet12({ request, env }) {
  try {
    const url = new URL(request.url);
    const sessionId = request.headers.get("x-session-id");
    const leaderboardType = url.searchParams.get("type") || "weekly";
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const friends = await env.DB.prepare(`
            SELECT DISTINCT 
                CASE 
                    WHEN uf.user_id = ? THEN uf.friend_id 
                    ELSE uf.user_id 
                END as friend_user_id
            FROM user_friends uf
            WHERE (uf.user_id = ? OR uf.friend_id = ?) 
            AND uf.status = 'accepted'
        `).bind(userId, userId, userId).all();
    const friendIds = friends.results?.map((f2) => f2.friend_user_id) || [];
    friendIds.push(userId);
    let leaderboardData = [];
    if (leaderboardType === "weekly") {
      leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    u.weekly_points as score,
                    u.weekly_points,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements,
                    'weekly_points' as metric
                FROM users u
                WHERE u.id IN (${friendIds.map(() => "?").join(",")})
                ORDER BY u.weekly_points DESC
                LIMIT 20
            `).bind(...friendIds).all();
    } else if (leaderboardType === "achievements") {
      leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    COUNT(ua.id) as score,
                    u.weekly_points,
                    COUNT(ua.id) as total_achievements,
                    'total_achievements' as metric
                FROM users u
                LEFT JOIN user_achievements ua ON u.id = ua.user_id
                WHERE u.id IN (${friendIds.map(() => "?").join(",")})
                GROUP BY u.id, u.email, u.weekly_points
                ORDER BY COUNT(ua.id) DESC
                LIMIT 20
            `).bind(...friendIds).all();
    } else if (leaderboardType === "streaks") {
      leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    COALESCE(MAX(us.current_streak), 0) as score,
                    u.weekly_points,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements,
                    'current_streaks' as metric
                FROM users u
                LEFT JOIN user_streaks us ON u.id = us.user_id
                WHERE u.id IN (${friendIds.map(() => "?").join(",")})
                GROUP BY u.id, u.email, u.weekly_points
                ORDER BY MAX(us.current_streak) DESC
                LIMIT 20
            `).bind(...friendIds).all();
    } else if (leaderboardType === "challenges") {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    COUNT(udc.id) as score,
                    u.weekly_points,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements,
                    'daily_challenges' as metric
                FROM users u
                LEFT JOIN user_daily_challenges udc ON u.id = udc.user_id 
                    AND udc.challenge_date = ? AND udc.is_completed = 1
                WHERE u.id IN (${friendIds.map(() => "?").join(",")})
                GROUP BY u.id, u.email, u.weekly_points
                ORDER BY COUNT(udc.id) DESC
                LIMIT 20
            `).bind(today, ...friendIds).all();
    }
    const formattedLeaderboard = leaderboardData.results?.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.id,
      email: entry.email,
      display_name: entry.email.split("@")[0],
      // Use email prefix as display name
      score: entry.score,
      weekly_points: entry.weekly_points,
      total_achievements: entry.total_achievements,
      is_current_user: entry.id === userId,
      metric: entry.metric
    })) || [];
    const friendsCount = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM user_friends 
            WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
        `).bind(userId, userId).first();
    return new Response(JSON.stringify({
      leaderboard: formattedLeaderboard,
      leaderboard_type: leaderboardType,
      friends_count: friendsCount?.count || 0,
      user_rank: formattedLeaderboard.findIndex((entry) => entry.is_current_user) + 1 || null
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return new Response(JSON.stringify({ error: "Failed to load leaderboards" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_leaderboards = __esm({
  "api/leaderboards/index.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequestGet12, "onRequestGet");
  }
});

// api/media/index.js
async function onRequestGet13(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const media = await getUserMedia(user.id, env);
    const mediaWithUrls = await Promise.all(media.map(async (item) => {
      try {
        const object = await env.MEDIA_BUCKET.get(item.r2_key);
        if (object) {
          return {
            ...item,
            url: `/api/media/file/${item.id}`,
            // We'll create this endpoint
            thumbnail: `/api/media/thumbnail/${item.id}`
          };
        }
        return item;
      } catch (error) {
        console.error("Error getting media URL:", error);
        return item;
      }
    }));
    return new Response(JSON.stringify({ media: mediaWithUrls }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get media error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestPost13(context) {
  const { request, env } = context;
  try {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult;
    const formData = await request.formData();
    const file = formData.get("file");
    const description = formData.get("description") || "";
    const mediaType = formData.get("media_type") || "progress";
    if (!file || !file.name) {
      return new Response(JSON.stringify({
        error: "File is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        error: "Invalid file type. Only images and videos are allowed."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (file.size > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({
        error: "File size too large. Maximum 50MB allowed."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const mediaId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const r2Key = `uploads/${user.id}/${mediaId}.${fileExtension}`;
    await env.MEDIA_BUCKET.put(r2Key, file.stream());
    const validTypes = ["before", "after", "progress"];
    if (!validTypes.includes(mediaType)) {
      return new Response(JSON.stringify({
        error: "Invalid media type. Must be: before, after, or progress"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
            INSERT INTO media_uploads (id, user_id, filename, original_name, file_type, file_size, r2_key, description, media_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      mediaId,
      user.id,
      `${mediaId}.${fileExtension}`,
      file.name,
      file.type,
      file.size,
      r2Key,
      description,
      mediaType
    ).run();
    const points = mediaType === "before" ? 10 : mediaType === "after" ? 15 : 5;
    await env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?").bind(points, user.id).run();
    const newAchievements = await checkAndAwardAchievements2(user.id, env);
    return new Response(JSON.stringify({
      message: "Media uploaded successfully",
      mediaId,
      media_type: mediaType,
      points,
      newAchievements
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Upload media error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_media2 = __esm({
  "api/media/index.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    init_auth();
    init_database();
    __name(onRequestGet13, "onRequestGet");
    __name(onRequestPost13, "onRequestPost");
  }
});

// api/nutrition/index.js
async function onRequestPost14({ request, env }) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const {
      food_name,
      meal_type = "snack",
      calories = 0,
      protein_g = 0,
      carbs_g = 0,
      fat_g = 0,
      sugar_g = 0,
      fiber_g = 0,
      water_ml = 0,
      is_custom_recipe = false
    } = await request.json();
    if (!food_name) {
      return new Response(JSON.stringify({ error: "Food name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const logId = uuidv4();
    await env.DB.prepare(`
            INSERT INTO user_nutrition_logs (
                id, user_id, log_date, meal_type, food_name,
                calories, protein_g, carbs_g, fat_g, sugar_g, fiber_g, water_ml, is_custom_recipe
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      logId,
      userId,
      today,
      meal_type,
      food_name,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      sugar_g,
      fiber_g,
      water_ml,
      is_custom_recipe
    ).run();
    await updateDailyNutrition(env.DB, userId, today);
    let pointsEarned = 5;
    if (is_custom_recipe) pointsEarned += 10;
    if (water_ml > 0) pointsEarned += 2;
    await env.DB.prepare(
      "UPDATE users SET points = points + ?, weekly_points = weekly_points + ? WHERE id = ?"
    ).bind(pointsEarned, pointsEarned, userId).run();
    try {
      const { checkAndAwardAchievements: checkAndAwardAchievements3 } = await Promise.resolve().then(() => (init_achievements(), achievements_exports));
      await checkAndAwardAchievements3(userId, "nutrition_log", { food_name, meal_type }, env);
    } catch (achievementError) {
      console.error("Achievement check error:", achievementError);
    }
    return new Response(JSON.stringify({
      message: "Nutrition logged successfully!",
      log_id: logId,
      points_earned: pointsEarned,
      date: today
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Nutrition logging error:", error);
    return new Response(JSON.stringify({ error: "Failed to log nutrition" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function onRequestGet14({ request, env }) {
  try {
    const url = new URL(request.url);
    const sessionId = request.headers.get("x-session-id");
    const date = url.searchParams.get("date") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sessionQuery = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!sessionQuery) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = sessionQuery.user_id;
    const logs = await env.DB.prepare(`
            SELECT * FROM user_nutrition_logs 
            WHERE user_id = ? AND log_date = ?
            ORDER BY created_at DESC
        `).bind(userId, date).all();
    const dailySummary = await env.DB.prepare(`
            SELECT * FROM user_daily_nutrition 
            WHERE user_id = ? AND log_date = ?
        `).bind(userId, date).first();
    const streakStats = await getNutritionStreaks(env.DB, userId);
    return new Response(JSON.stringify({
      date,
      logs: logs.results || [],
      daily_summary: dailySummary || null,
      streak_stats: streakStats
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get nutrition error:", error);
    return new Response(JSON.stringify({ error: "Failed to load nutrition data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function updateDailyNutrition(db, userId, date) {
  const totals = await db.prepare(`
        SELECT 
            SUM(calories) as total_calories,
            SUM(protein_g) as total_protein_g,
            SUM(carbs_g) as total_carbs_g,
            SUM(fat_g) as total_fat_g,
            SUM(sugar_g) as total_sugar_g,
            SUM(fiber_g) as total_fiber_g,
            SUM(water_ml) as total_water_ml
        FROM user_nutrition_logs
        WHERE user_id = ? AND log_date = ?
    `).bind(userId, date).first();
  const calorieGoal = 2e3;
  const proteinGoal = 150;
  const carbsGoal = 200;
  const fatGoal = 65;
  const metCalorieGoal = (totals.total_calories || 0) >= calorieGoal * 0.95 && (totals.total_calories || 0) <= calorieGoal * 1.05;
  const metProteinGoal = (totals.total_protein_g || 0) >= proteinGoal;
  const metCarbsGoal = (totals.total_carbs_g || 0) >= carbsGoal * 0.8 && (totals.total_carbs_g || 0) <= carbsGoal * 1.2;
  const metFatGoal = (totals.total_fat_g || 0) >= fatGoal * 0.8 && (totals.total_fat_g || 0) <= fatGoal * 1.2;
  let balanceScore = 0;
  if (metCalorieGoal) balanceScore += 25;
  if (metProteinGoal) balanceScore += 25;
  if (metCarbsGoal) balanceScore += 25;
  if (metFatGoal) balanceScore += 25;
  await db.prepare(`
        INSERT OR REPLACE INTO user_daily_nutrition (
            id, user_id, log_date,
            total_calories, total_protein_g, total_carbs_g, total_fat_g,
            total_sugar_g, total_fiber_g, total_water_ml,
            calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g,
            met_calorie_goal, met_protein_goal, met_carbs_goal, met_fat_goal,
            macro_balance_score, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
    `daily_${userId}_${date}`,
    userId,
    date,
    totals.total_calories || 0,
    totals.total_protein_g || 0,
    totals.total_carbs_g || 0,
    totals.total_fat_g || 0,
    totals.total_sugar_g || 0,
    totals.total_fiber_g || 0,
    totals.total_water_ml || 0,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    metCalorieGoal,
    metProteinGoal,
    metCarbsGoal,
    metFatGoal,
    balanceScore
  ).run();
}
async function getNutritionStreaks(db, userId) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const recentDays = await db.prepare(`
        SELECT log_date, macro_balance_score,
               met_calorie_goal, met_protein_goal, met_carbs_goal, met_fat_goal
        FROM user_daily_nutrition
        WHERE user_id = ? AND log_date <= ?
        ORDER BY log_date DESC
        LIMIT 30
    `).bind(userId, today).all();
  let currentStreak = 0;
  let proteinStreak = 0;
  let calorieStreak = 0;
  let macroStreak = 0;
  for (const day of recentDays.results || []) {
    if (day.macro_balance_score > 0) {
      currentStreak++;
    } else {
      break;
    }
    if (day.met_protein_goal) {
      proteinStreak++;
    } else if (proteinStreak === currentStreak - 1) {
      proteinStreak = 0;
    }
    if (day.met_calorie_goal) {
      calorieStreak++;
    } else if (calorieStreak === currentStreak - 1) {
      calorieStreak = 0;
    }
    if (day.met_protein_goal && day.met_carbs_goal && day.met_fat_goal) {
      macroStreak++;
    } else if (macroStreak === currentStreak - 1) {
      macroStreak = 0;
    }
  }
  return {
    tracking_streak: currentStreak,
    protein_streak: proteinStreak,
    calorie_streak: calorieStreak,
    macro_balance_streak: macroStreak,
    total_tracking_days: recentDays.results?.length || 0
  };
}
var init_nutrition = __esm({
  "api/nutrition/index.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequestPost14, "onRequestPost");
    __name(onRequestGet14, "onRequestGet");
    __name(updateDailyNutrition, "updateDailyNutrition");
    __name(getNutritionStreaks, "getNutritionStreaks");
  }
});

// _middleware.js
async function onRequest3(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-session-id",
    "Access-Control-Max-Age": "86400"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    await initializeDatabase(env);
  } catch (error) {
    console.error("Database initialization error:", error);
  }
  const response = await next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
async function initializeDatabase(env) {
  try {
    const adminCheck = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(env.ADMIN_EMAIL).first();
    if (!adminCheck) {
      const bcrypt = await Promise.resolve().then(() => __toESM(require_bcrypt()));
      const { v4: uuidv4 } = await Promise.resolve().then(() => (init_esm_browser(), esm_browser_exports));
      const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
      const adminId = uuidv4();
      await env.DB.prepare(`
                INSERT INTO users (id, email, password_hash, role, points)
                VALUES (?, ?, ?, 'admin', 0)
            `).bind(adminId, env.ADMIN_EMAIL, hashedPassword).run();
      console.log("Created admin user:", env.ADMIN_EMAIL);
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}
var init_middleware = __esm({
  "_middleware.js"() {
    init_functionsRoutes_0_9302165230404282();
    init_checked_fetch();
    __name(onRequest3, "onRequest");
    __name(initializeDatabase, "initializeDatabase");
  }
});

// ../.wrangler/tmp/pages-vSI4IG/functionsRoutes-0.9302165230404282.mjs
var routes;
var init_functionsRoutes_0_9302165230404282 = __esm({
  "../.wrangler/tmp/pages-vSI4IG/functionsRoutes-0.9302165230404282.mjs"() {
    init_id();
    init_delete();
    init_check();
    init_media();
    init_media();
    init_users();
    init_users();
    init_login();
    init_logout();
    init_register();
    init_validate_session();
    init_daily();
    init_complete();
    init_weekly();
    init_weekly();
    init_enhanced();
    init_enhanced();
    init_videos();
    init_videos();
    init_unlock();
    init_achievements2();
    init_id2();
    init_achievements3();
    init_achievements3();
    init_friends();
    init_friends();
    init_habits();
    init_habits();
    init_leaderboards();
    init_media2();
    init_media2();
    init_nutrition();
    init_nutrition();
    init_middleware();
    routes = [
      {
        routePath: "/api/media/file/:id",
        mountPath: "/api/media/file",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/media/:id/delete",
        mountPath: "/api/media/:id",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete]
      },
      {
        routePath: "/api/achievements/check",
        mountPath: "/api/achievements",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/admin/media",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/admin/media",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/admin/users",
        mountPath: "/api/admin",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete2]
      },
      {
        routePath: "/api/admin/users",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/auth/login",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/auth/logout",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/api/auth/validate-session",
        mountPath: "/api/auth",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/challenges/daily",
        mountPath: "/api/challenges",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5]
      },
      {
        routePath: "/api/habits/complete",
        mountPath: "/api/habits",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost6]
      },
      {
        routePath: "/api/habits/weekly",
        mountPath: "/api/habits",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6]
      },
      {
        routePath: "/api/habits/weekly",
        mountPath: "/api/habits",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost7]
      },
      {
        routePath: "/api/media/enhanced",
        mountPath: "/api/media",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7]
      },
      {
        routePath: "/api/media/enhanced",
        mountPath: "/api/media",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost8]
      },
      {
        routePath: "/api/media/videos",
        mountPath: "/api/media",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8]
      },
      {
        routePath: "/api/media/videos",
        mountPath: "/api/media",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost9]
      },
      {
        routePath: "/api/achievements/unlock",
        mountPath: "/api/achievements",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/leaderboards/achievements",
        mountPath: "/api/leaderboards",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/habits/:id",
        mountPath: "/api/habits",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete3]
      },
      {
        routePath: "/api/achievements",
        mountPath: "/api/achievements",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet9]
      },
      {
        routePath: "/api/achievements",
        mountPath: "/api/achievements",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost10]
      },
      {
        routePath: "/api/friends",
        mountPath: "/api/friends",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet10]
      },
      {
        routePath: "/api/friends",
        mountPath: "/api/friends",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost11]
      },
      {
        routePath: "/api/habits",
        mountPath: "/api/habits",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet11]
      },
      {
        routePath: "/api/habits",
        mountPath: "/api/habits",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost12]
      },
      {
        routePath: "/api/leaderboards",
        mountPath: "/api/leaderboards",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet12]
      },
      {
        routePath: "/api/media",
        mountPath: "/api/media",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet13]
      },
      {
        routePath: "/api/media",
        mountPath: "/api/media",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost13]
      },
      {
        routePath: "/api/nutrition",
        mountPath: "/api/nutrition",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet14]
      },
      {
        routePath: "/api/nutrition",
        mountPath: "/api/nutrition",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost14]
      },
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest3],
        modules: []
      }
    ];
  }
});

// ../.wrangler/tmp/bundle-TwJjzZ/middleware-loader.entry.ts
init_functionsRoutes_0_9302165230404282();
init_checked_fetch();

// ../.wrangler/tmp/bundle-TwJjzZ/middleware-insertion-facade.js
init_functionsRoutes_0_9302165230404282();
init_checked_fetch();

// ../../../../usr/lib/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_9302165230404282();
init_checked_fetch();

// ../../../../usr/lib/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_9302165230404282();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse2, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse2(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../usr/lib/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../usr/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_9302165230404282();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../usr/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_9302165230404282();
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-TwJjzZ/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../usr/lib/node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_9302165230404282();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-TwJjzZ/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

bcryptjs/dist/bcrypt.js:
  (**
   * @license bcrypt.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
   * Released under the Apache License, Version 2.0
   * see: https://github.com/dcodeIO/bcrypt.js for details
   *)
*/
//# sourceMappingURL=functionsWorker-0.1734108418323579.mjs.map
