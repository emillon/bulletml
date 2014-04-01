// This program was compiled from OCaml by js_of_ocaml 1.4
function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg) {
  caml_raise_with_arg (tag, new MlWrappedString (msg));
}
function caml_invalid_argument (msg) {
  caml_raise_with_string(caml_global_data[4], msg);
}
function caml_array_bound_error () {
  caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
  if (!n) { return ""; }
  if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
  var r = caml_str_repeat(n >> 1, s);
  return r + r;
}
function MlString(param) {
  if (param != null) {
    this.bytes = this.fullBytes = param;
    this.last = this.len = param.length;
  }
}
MlString.prototype = {
  string:null,
  bytes:null,
  fullBytes:null,
  array:null,
  len:null,
  last:0,
  toJsString:function() {
    return this.string = decodeURIComponent (escape(this.getFullBytes()));
  },
  toBytes:function() {
    if (this.string != null)
      var b = unescape (encodeURIComponent (this.string));
    else {
      var b = "", a = this.array, l = a.length;
      for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);
    }
    this.bytes = this.fullBytes = b;
    this.last = this.len = b.length;
    return b;
  },
  getBytes:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return b;
  },
  getFullBytes:function() {
    var b = this.fullBytes;
    if (b !== null) return b;
    b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last < this.len) {
      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
      this.last = this.len;
    }
    this.fullBytes = b;
    return b;
  },
  toArray:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes ();
    var a = [], l = this.last;
    for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
    for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
    this.last = this.len;
    this.array = a;
    return a;
  },
  getArray:function() {
    var a = this.array;
    if (!a) a = this.toArray();
    return a;
  },
  getLen:function() {
    var len = this.len;
    if (len !== null) return len;
    this.toBytes();
    return this.len;
  },
  toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
  blitToArray:function(i1, a2, i2, l) {
    var a1 = this.array;
    if (a1) {
      if (i2 <= i1) {
        for (var i = 0; i < l; i++) a2[i2 + i] = a1[i1 + i];
      } else {
        for (var i = l - 1; i >= 0; i--) a2[i2 + i] = a1[i1 + i];
      }
    } else {
      var b = this.bytes;
      if (b == null) b = this.toBytes();
      var l1 = this.last - i1;
      if (l <= l1)
        for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
        for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
        for (; i < l; i++) a2 [i2 + i] = 0;
      }
    }
  },
  get:function (i) {
    var a = this.array;
    if (a) return a[i];
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return (i<this.last)?b.charCodeAt(i):0;
  },
  safeGet:function (i) {
    if (this.len == null) this.toBytes();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    return this.get(i);
  },
  set:function (i, c) {
    var a = this.array;
    if (!a) {
      if (this.last == i) {
        this.bytes += String.fromCharCode (c & 0xff);
        this.last ++;
        return 0;
      }
      a = this.toArray();
    } else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    a[i] = c & 0xff;
    return 0;
  },
  safeSet:function (i, c) {
    if (this.len == null) this.toBytes ();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    this.set(i, c);
  },
  fill:function (ofs, len, c) {
    if (ofs >= this.last && this.last && c == 0) return;
    var a = this.array;
    if (!a) a = this.toArray();
    else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    var l = ofs + len;
    for (var i = ofs; i < l; i++) a[i] = c;
  },
  compare:function (s2) {
    if (this.string != null && s2.string != null) {
      if (this.string < s2.string) return -1;
      if (this.string > s2.string) return 1;
      return 0;
    }
    var b1 = this.getFullBytes ();
    var b2 = s2.getFullBytes ();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },
  equal:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string == s2.string;
    return this.getFullBytes () == s2.getFullBytes ();
  },
  lessThan:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string < s2.string;
    return this.getFullBytes () < s2.getFullBytes ();
  },
  lessEqual:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string <= s2.string;
    return this.getFullBytes () <= s2.getFullBytes ();
  }
}
function MlWrappedString (s) { this.string = s; }
MlWrappedString.prototype = new MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
MlMakeString.prototype = new MlString ();
function caml_array_blit(a1, i1, a2, i2, len) {
  if (i2 <= i1) {
    for (var j = 1; j <= len; j++) a2[i2 + j] = a1[i1 + j];
  } else {
    for (var j = len; j >= 1; j--) a2[i2 + j] = a1[i1 + j];
  }
}
function caml_array_get (array, index) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  return array[index+1];
}
function caml_array_set (array, index, newval) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  array[index+1]=newval; return 0;
}
function caml_blit_string(s1, i1, s2, i2, len) {
  if (len === 0) return;
  if (i2 === s2.last && s2.bytes != null) {
    var b = s1.bytes;
    if (b == null) b = s1.toBytes ();
    if (i1 > 0 || s1.last > len) b = b.slice(i1, i1 + len);
    s2.bytes += b;
    s2.last += b.length;
    return;
  }
  var a = s2.array;
  if (!a) a = s2.toArray(); else { s2.bytes = s2.string = null; }
  s1.blitToArray (i1, a, i2, len);
}
function caml_call_gen(f, args) {
  if(f.fun)
    return caml_call_gen(f.fun, args);
  var n = f.length;
  var d = n - args.length;
  if (d == 0)
    return f.apply(null, args);
  else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
    return function (x){ return caml_call_gen(f, args.concat([x])); };
}
function caml_classify_float (x) {
  if (isFinite (x)) {
    if (Math.abs(x) >= 2.2250738585072014e-308) return 0;
    if (x != 0) return 1;
    return 2;
  }
  return isNaN(x)?4:3;
}
function caml_int64_compare(x,y) {
  var x3 = x[3] << 16;
  var y3 = y[3] << 16;
  if (x3 > y3) return 1;
  if (x3 < y3) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int_compare (a, b) {
  if (a < b) return (-1); if (a == b) return 0; return 1;
}
function caml_compare_val (a, b, total) {
  var stack = [];
  for(;;) {
    if (!(total && a === b)) {
      if (a instanceof MlString) {
        if (b instanceof MlString) {
            if (a != b) {
		var x = a.compare(b);
		if (x != 0) return x;
	    }
        } else
          return 1;
      } else if (a instanceof Array && a[0] === (a[0]|0)) {
        var ta = a[0];
        if (ta === 250) {
          a = a[1];
          continue;
        } else if (b instanceof Array && b[0] === (b[0]|0)) {
          var tb = b[0];
          if (tb === 250) {
            b = b[1];
            continue;
          } else if (ta != tb) {
            return (ta < tb)?-1:1;
          } else {
            switch (ta) {
            case 248: {
		var x = caml_int_compare(a[2], b[2]);
		if (x != 0) return x;
		break;
	    }
            case 255: {
		var x = caml_int64_compare(a, b);
		if (x != 0) return x;
		break;
	    }
            default:
              if (a.length != b.length) return (a.length < b.length)?-1:1;
              if (a.length > 1) stack.push(a, b, 1);
            }
          }
        } else
          return 1;
      } else if (b instanceof MlString ||
                 (b instanceof Array && b[0] === (b[0]|0))) {
        return -1;
      } else {
        if (a < b) return -1;
        if (a > b) return 1;
        if (total && a != b) {
          if (a == a) return 1;
          if (b == b) return -1;
        }
      }
    }
    if (stack.length == 0) return 0;
    var i = stack.pop();
    b = stack.pop();
    a = stack.pop();
    if (i + 1 < a.length) stack.push(a, b, i + 1);
    a = a[i];
    b = b[i];
  }
}
function caml_compare (a, b) { return caml_compare_val (a, b, true); }
function caml_convert_raw_backtrace () {
  caml_invalid_argument
    ("Primitive 'caml_convert_raw_backtrace' not implemented");
}
function caml_create_string(len) {
  if (len < 0) caml_invalid_argument("String.create");
  return new MlMakeString(len);
}
function caml_fill_string(s, i, l, c) { s.fill (i, l, c); }
var caml_global_data = [0];
function caml_failwith (msg) {
  caml_raise_with_string(caml_global_data[3], msg);
}
function caml_float_of_string(s) {
  var res;
  s = s.getFullBytes();
  res = +s;
  if ((s.length > 0) && (res === res)) return res;
  s = s.replace(/_/g,"");
  res = +s;
  if (((s.length > 0) && (res === res)) || /^[+-]?nan$/i.test(s)) return res;
  caml_failwith("float_of_string");
}
function caml_parse_format (fmt) {
  fmt = fmt.toString ();
  var len = fmt.length;
  if (len > 31) caml_invalid_argument("format_int: format too long");
  var f =
    { justify:'+', signstyle:'-', filler:' ', alternate:false,
      base:0, signedconv:false, width:0, uppercase:false,
      sign:1, prec:-1, conv:'f' };
  for (var i = 0; i < len; i++) {
    var c = fmt.charAt(i);
    switch (c) {
    case '-':
      f.justify = '-'; break;
    case '+': case ' ':
      f.signstyle = c; break;
    case '0':
      f.filler = '0'; break;
    case '#':
      f.alternate = true; break;
    case '1': case '2': case '3': case '4': case '5':
    case '6': case '7': case '8': case '9':
      f.width = 0;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.width = f.width * 10 + c; i++
      }
      i--;
     break;
    case '.':
      f.prec = 0;
      i++;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.prec = f.prec * 10 + c; i++
      }
      i--;
    case 'd': case 'i':
      f.signedconv = true; /* fallthrough */
    case 'u':
      f.base = 10; break;
    case 'x':
      f.base = 16; break;
    case 'X':
      f.base = 16; f.uppercase = true; break;
    case 'o':
      f.base = 8; break;
    case 'e': case 'f': case 'g':
      f.signedconv = true; f.conv = c; break;
    case 'E': case 'F': case 'G':
      f.signedconv = true; f.uppercase = true;
      f.conv = c.toLowerCase (); break;
    }
  }
  return f;
}
function caml_finish_formatting(f, rawbuffer) {
  if (f.uppercase) rawbuffer = rawbuffer.toUpperCase();
  var len = rawbuffer.length;
  if (f.signedconv && (f.sign < 0 || f.signstyle != '-')) len++;
  if (f.alternate) {
    if (f.base == 8) len += 1;
    if (f.base == 16) len += 2;
  }
  var buffer = "";
  if (f.justify == '+' && f.filler == ' ')
    for (var i = len; i < f.width; i++) buffer += ' ';
  if (f.signedconv) {
    if (f.sign < 0) buffer += '-';
    else if (f.signstyle != '-') buffer += f.signstyle;
  }
  if (f.alternate && f.base == 8) buffer += '0';
  if (f.alternate && f.base == 16) buffer += "0x";
  if (f.justify == '+' && f.filler == '0')
    for (var i = len; i < f.width; i++) buffer += '0';
  buffer += rawbuffer;
  if (f.justify == '-')
    for (var i = len; i < f.width; i++) buffer += ' ';
  return new MlWrappedString (buffer);
}
function caml_format_float (fmt, x) {
  var s, f = caml_parse_format(fmt);
  var prec = (f.prec < 0)?6:f.prec;
  if (x < 0) { f.sign = -1; x = -x; }
  if (isNaN(x)) { s = "nan"; f.filler = ' '; }
  else if (!isFinite(x)) { s = "inf"; f.filler = ' '; }
  else
    switch (f.conv) {
    case 'e':
      var s = x.toExponential(prec);
      var i = s.length;
      if (s.charAt(i - 3) == 'e')
        s = s.slice (0, i - 1) + '0' + s.slice (i - 1);
      break;
    case 'f':
      s = x.toFixed(prec); break;
    case 'g':
      prec = prec?prec:1;
      s = x.toExponential(prec - 1);
      var j = s.indexOf('e');
      var exp = +s.slice(j + 1);
      if (exp < -4 || x.toFixed(0).length > prec) {
        var i = j - 1; while (s.charAt(i) == '0') i--;
        if (s.charAt(i) == '.') i--;
        s = s.slice(0, i + 1) + s.slice(j);
        i = s.length;
        if (s.charAt(i - 3) == 'e')
          s = s.slice (0, i - 1) + '0' + s.slice (i - 1);
        break;
      } else {
        var p = prec;
        if (exp < 0) { p -= exp + 1; s = x.toFixed(p); }
        else while (s = x.toFixed(p), s.length > prec + 1) p--;
        if (p) {
          var i = s.length - 1; while (s.charAt(i) == '0') i--;
          if (s.charAt(i) == '.') i--;
          s = s.slice(0, i + 1);
        }
      }
      break;
    }
  return caml_finish_formatting(f, s);
}
function caml_format_int(fmt, i) {
  if (fmt.toString() == "%d") return new MlWrappedString(""+i);
  var f = caml_parse_format(fmt);
  if (i < 0) { if (f.signedconv) { f.sign = -1; i = -i; } else i >>>= 0; }
  var s = i.toString(f.base);
  if (f.prec >= 0) {
    f.filler = ' ';
    var n = f.prec - s.length;
    if (n > 0) s = caml_str_repeat (n, '0') + s;
  }
  return caml_finish_formatting(f, s);
}
function caml_get_exception_raw_backtrace () {
  caml_invalid_argument
    ("Primitive 'caml_get_exception_raw_backtrace' not implemented");
}
function caml_greaterequal (x, y) { return +(caml_compare(x,y,false) >= 0); }
function caml_int64_bits_of_float (x) {
  if (!isFinite(x)) {
    if (isNaN(x)) return [255, 1, 0, 0xfff0];
    return (x > 0)?[255,0,0,0x7ff0]:[255,0,0,0xfff0];
  }
  var sign = (x>=0)?0:0x8000;
  if (sign) x = -x;
  var exp = Math.floor(Math.LOG2E*Math.log(x)) + 1023;
  if (exp <= 0) {
    exp = 0;
    x /= Math.pow(2,-1026);
  } else {
    x /= Math.pow(2,exp-1027);
    if (x < 16) { x *= 2; exp -=1; }
    if (exp == 0) { x /= 2; }
  }
  var k = Math.pow(2,24);
  var r3 = x|0;
  x = (x - r3) * k;
  var r2 = x|0;
  x = (x - r2) * k;
  var r1 = x|0;
  r3 = (r3 &0xf) | sign | exp << 4;
  return [255, r1, r2, r3];
}
var caml_hash =
function () {
  var HASH_QUEUE_SIZE = 256;
  function ROTL32(x,n) { return ((x << n) | (x >>> (32-n))); }
  function MIX(h,d) {
    d = caml_mul(d, 0xcc9e2d51);
    d = ROTL32(d, 15);
    d = caml_mul(d, 0x1b873593);
    h ^= d;
    h = ROTL32(h, 13);
    return ((((h * 5)|0) + 0xe6546b64)|0);
  }
  function FINAL_MIX(h) {
    h ^= h >>> 16;
    h = caml_mul (h, 0x85ebca6b);
    h ^= h >>> 13;
    h = caml_mul (h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h;
  }
  function caml_hash_mix_int64 (h, v) {
    var lo = v[1] | (v[2] << 24);
    var hi = (v[2] >>> 8) | (v[3] << 16);
    h = MIX(h, lo);
    h = MIX(h, hi);
    return h;
  }
  function caml_hash_mix_int64_2 (h, v) {
    var lo = v[1] | (v[2] << 24);
    var hi = (v[2] >>> 8) | (v[3] << 16);
    h = MIX(h, hi ^ lo);
    return h;
  }
  function caml_hash_mix_string_str(h, s) {
    var len = s.length, i, w;
    for (i = 0; i + 4 <= len; i += 4) {
      w = s.charCodeAt(i)
          | (s.charCodeAt(i+1) << 8)
          | (s.charCodeAt(i+2) << 16)
          | (s.charCodeAt(i+3) << 24);
      h = MIX(h, w);
    }
    w = 0;
    switch (len & 3) {
    case 3: w  = s.charCodeAt(i+2) << 16;
    case 2: w |= s.charCodeAt(i+1) << 8;
    case 1: w |= s.charCodeAt(i);
            h = MIX(h, w);
    default:
    }
    h ^= len;
    return h;
  }
  function caml_hash_mix_string_arr(h, s) {
    var len = s.length, i, w;
    for (i = 0; i + 4 <= len; i += 4) {
      w = s[i]
          | (s[i+1] << 8)
          | (s[i+2] << 16)
          | (s[i+3] << 24);
      h = MIX(h, w);
    }
    w = 0;
    switch (len & 3) {
    case 3: w  = s[i+2] << 16;
    case 2: w |= s[i+1] << 8;
    case 1: w |= s[i];
            h = MIX(h, w);
    default:
    }
    h ^= len;
    return h;
  }
  return function (count, limit, seed, obj) {
    var queue, rd, wr, sz, num, h, v, i, len;
    sz = limit;
    if (sz < 0 || sz > HASH_QUEUE_SIZE) sz = HASH_QUEUE_SIZE;
    num = count;
    h = seed;
    queue = [obj]; rd = 0; wr = 1;
    while (rd < wr && num > 0) {
      v = queue[rd++];
      if (v instanceof Array && v[0] === (v[0]|0)) {
        switch (v[0]) {
        case 248:
          h = MIX(h, v[2]);
          num--;
          break;
        case 250:
          queue[--rd] = v[1];
          break;
        case 255:
          h = caml_hash_mix_int64_2 (h, v);
          num --;
          break;
        default:
          var tag = ((v.length - 1) << 10) | v[0];
          h = MIX(h, tag);
          for (i = 1, len = v.length; i < len; i++) {
            if (wr >= sz) break;
            queue[wr++] = v[i];
          }
          break;
        }
      } else if (v instanceof MlString) {
        var a = v.array;
        if (a) {
          h = caml_hash_mix_string_arr(h, a);
        } else {
          var b = v.getFullBytes ();
          h = caml_hash_mix_string_str(h, b);
        }
        num--;
        break;
      } else if (v === (v|0)) {
        h = MIX(h, v+v+1);
        num--;
      } else if (v === +v) {
        h = caml_hash_mix_int64(h, caml_int64_bits_of_float (v));
        num--;
        break;
      }
    }
    h = FINAL_MIX(h);
    return h & 0x3FFFFFFF;
  }
} ();
function caml_int64_to_bytes(x) {
  return [x[3] >> 8, x[3] & 0xff, x[2] >> 16, (x[2] >> 8) & 0xff, x[2] & 0xff,
          x[1] >> 16, (x[1] >> 8) & 0xff, x[1] & 0xff];
}
function caml_hash_univ_param (count, limit, obj) {
  var hash_accu = 0;
  function hash_aux (obj) {
    limit --;
    if (count < 0 || limit < 0) return;
    if (obj instanceof Array && obj[0] === (obj[0]|0)) {
      switch (obj[0]) {
      case 248:
        count --;
        hash_accu = (hash_accu * 65599 + obj[2]) | 0;
        break
      case 250:
        limit++; hash_aux(obj); break;
      case 255:
        count --;
        hash_accu = (hash_accu * 65599 + obj[1] + (obj[2] << 24)) | 0;
        break;
      default:
        count --;
        hash_accu = (hash_accu * 19 + obj[0]) | 0;
        for (var i = obj.length - 1; i > 0; i--) hash_aux (obj[i]);
      }
    } else if (obj instanceof MlString) {
      count --;
      var a = obj.array, l = obj.getLen ();
      if (a) {
        for (var i = 0; i < l; i++) hash_accu = (hash_accu * 19 + a[i]) | 0;
      } else {
        var b = obj.getFullBytes ();
        for (var i = 0; i < l; i++)
          hash_accu = (hash_accu * 19 + b.charCodeAt(i)) | 0;
      }
    } else if (obj === (obj|0)) {
      count --;
      hash_accu = (hash_accu * 65599 + obj) | 0;
    } else if (obj === +obj) {
      count--;
      var p = caml_int64_to_bytes (caml_int64_bits_of_float (obj));
      for (var i = 7; i >= 0; i--) hash_accu = (hash_accu * 19 + p[i]) | 0;
    }
  }
  hash_aux (obj);
  return hash_accu & 0x3FFFFFFF;
}
function caml_hypot_float (x, y) {
  var x = Math.abs(x), y = Math.abs(y);
  var a = Math.max(x, y), b = Math.min(x,y) / (a?a:1);
  return (a * Math.sqrt(1 + b*b));
}
function caml_int64_is_negative(x) {
  return (x[3] << 16) < 0;
}
function caml_int64_neg (x) {
  var y1 = - x[1];
  var y2 = - x[2] + (y1 >> 24);
  var y3 = - x[3] + (y2 >> 24);
  return [255, y1 & 0xffffff, y2 & 0xffffff, y3 & 0xffff];
}
function caml_int64_of_int32 (x) {
  return [255, x & 0xffffff, (x >> 24) & 0xffffff, (x >> 31) & 0xffff]
}
function caml_int64_ucompare(x,y) {
  if (x[3] > y[3]) return 1;
  if (x[3] < y[3]) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int64_lsl1 (x) {
  x[3] = (x[3] << 1) | (x[2] >> 23);
  x[2] = ((x[2] << 1) | (x[1] >> 23)) & 0xffffff;
  x[1] = (x[1] << 1) & 0xffffff;
}
function caml_int64_lsr1 (x) {
  x[1] = ((x[1] >>> 1) | (x[2] << 23)) & 0xffffff;
  x[2] = ((x[2] >>> 1) | (x[3] << 23)) & 0xffffff;
  x[3] = x[3] >>> 1;
}
function caml_int64_sub (x, y) {
  var z1 = x[1] - y[1];
  var z2 = x[2] - y[2] + (z1 >> 24);
  var z3 = x[3] - y[3] + (z2 >> 24);
  return [255, z1 & 0xffffff, z2 & 0xffffff, z3 & 0xffff];
}
function caml_int64_udivmod (x, y) {
  var offset = 0;
  var modulus = x.slice ();
  var divisor = y.slice ();
  var quotient = [255, 0, 0, 0];
  while (caml_int64_ucompare (modulus, divisor) > 0) {
    offset++;
    caml_int64_lsl1 (divisor);
  }
  while (offset >= 0) {
    offset --;
    caml_int64_lsl1 (quotient);
    if (caml_int64_ucompare (modulus, divisor) >= 0) {
      quotient[1] ++;
      modulus = caml_int64_sub (modulus, divisor);
    }
    caml_int64_lsr1 (divisor);
  }
  return [0,quotient, modulus];
}
function caml_int64_to_int32 (x) {
  return x[1] | (x[2] << 24);
}
function caml_int64_is_zero(x) {
  return (x[3]|x[2]|x[1]) == 0;
}
function caml_int64_format (fmt, x) {
  var f = caml_parse_format(fmt);
  if (f.signedconv && caml_int64_is_negative(x)) {
    f.sign = -1; x = caml_int64_neg(x);
  }
  var buffer = "";
  var wbase = caml_int64_of_int32(f.base);
  var cvtbl = "0123456789abcdef";
  do {
    var p = caml_int64_udivmod(x, wbase);
    x = p[1];
    buffer = cvtbl.charAt(caml_int64_to_int32(p[2])) + buffer;
  } while (! caml_int64_is_zero(x));
  if (f.prec >= 0) {
    f.filler = ' ';
    var n = f.prec - buffer.length;
    if (n > 0) buffer = caml_str_repeat (n, '0') + buffer;
  }
  return caml_finish_formatting(f, buffer);
}
function caml_parse_sign_and_base (s) {
  var i = 0, base = 10, sign = s.get(0) == 45?(i++,-1):1;
  if (s.get(i) == 48)
    switch (s.get(i + 1)) {
    case 120: case 88: base = 16; i += 2; break;
    case 111: case 79: base =  8; i += 2; break;
    case  98: case 66: base =  2; i += 2; break;
    }
  return [i, sign, base];
}
function caml_parse_digit(c) {
  if (c >= 48 && c <= 57)  return c - 48;
  if (c >= 65 && c <= 90)  return c - 55;
  if (c >= 97 && c <= 122) return c - 87;
  return -1;
}
function caml_int_of_string (s) {
  var r = caml_parse_sign_and_base (s);
  var i = r[0], sign = r[1], base = r[2];
  var threshold = -1 >>> 0;
  var c = s.get(i);
  var d = caml_parse_digit(c);
  if (d < 0 || d >= base) caml_failwith("int_of_string");
  var res = d;
  for (;;) {
    i++;
    c = s.get(i);
    if (c == 95) continue;
    d = caml_parse_digit(c);
    if (d < 0 || d >= base) break;
    res = base * res + d;
    if (res > threshold) caml_failwith("int_of_string");
  }
  if (i != s.getLen()) caml_failwith("int_of_string");
  res = sign * res;
  if ((res | 0) != res) caml_failwith("int_of_string");
  return res;
}
function caml_is_printable(c) { return +(c > 31 && c < 127); }
function caml_js_get_console () {
  var c = this.console?this.console:{};
  var m = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
           "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"];
  function f () {}
  for (var i = 0; i < m.length; i++) if (!c[m[i]]) c[m[i]]=f;
  return c;
}
var caml_js_regexps = { amp:/&/g, lt:/</g, quot:/\"/g, all:/[&<\"]/ };
function caml_js_html_escape (s) {
  if (!caml_js_regexps.all.test(s)) return s;
  return s.replace(caml_js_regexps.amp, "&amp;")
          .replace(caml_js_regexps.lt, "&lt;")
          .replace(caml_js_regexps.quot, "&quot;");
}
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[undefined];
    return caml_call_gen(f, args);
  }
}
function caml_lex_array(s) {
  s = s.getFullBytes();
  var a = [], l = s.length / 2;
  for (var i = 0; i < l; i++)
    a[i] = (s.charCodeAt(2 * i) | (s.charCodeAt(2 * i + 1) << 8)) << 16 >> 16;
  return a;
}
function caml_lex_engine(tbl, start_state, lexbuf) {
  var lex_buffer = 2;
  var lex_buffer_len = 3;
  var lex_start_pos = 5;
  var lex_curr_pos = 6;
  var lex_last_pos = 7;
  var lex_last_action = 8;
  var lex_eof_reached = 9;
  var lex_base = 1;
  var lex_backtrk = 2;
  var lex_default = 3;
  var lex_trans = 4;
  var lex_check = 5;
  if (!tbl.lex_default) {
    tbl.lex_base =    caml_lex_array (tbl[lex_base]);
    tbl.lex_backtrk = caml_lex_array (tbl[lex_backtrk]);
    tbl.lex_check =   caml_lex_array (tbl[lex_check]);
    tbl.lex_trans =   caml_lex_array (tbl[lex_trans]);
    tbl.lex_default = caml_lex_array (tbl[lex_default]);
  }
  var c, state = start_state;
  var buffer = lexbuf[lex_buffer].getArray();
  if (state >= 0) {
    lexbuf[lex_last_pos] = lexbuf[lex_start_pos] = lexbuf[lex_curr_pos];
    lexbuf[lex_last_action] = -1;
  } else {
    state = -state - 1;
  }
  for(;;) {
    var base = tbl.lex_base[state];
    if (base < 0) return -base-1;
    var backtrk = tbl.lex_backtrk[state];
    if (backtrk >= 0) {
      lexbuf[lex_last_pos] = lexbuf[lex_curr_pos];
      lexbuf[lex_last_action] = backtrk;
    }
    if (lexbuf[lex_curr_pos] >= lexbuf[lex_buffer_len]){
      if (lexbuf[lex_eof_reached] == 0)
        return -state - 1;
      else
        c = 256;
    }else{
      c = buffer[lexbuf[lex_curr_pos]];
      lexbuf[lex_curr_pos] ++;
    }
    if (tbl.lex_check[base + c] == state)
      state = tbl.lex_trans[base + c];
    else
      state = tbl.lex_default[state];
    if (state < 0) {
      lexbuf[lex_curr_pos] = lexbuf[lex_last_pos];
      if (lexbuf[lex_last_action] == -1)
        caml_failwith("lexing: empty token");
      else
        return lexbuf[lex_last_action];
    }else{
      /* Erase the EOF condition only if the EOF pseudo-character was
         consumed by the automaton (i.e. there was no backtrack above)
       */
      if (c == 256) lexbuf[lex_eof_reached] = 0;
    }
  }
}
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b;
}
function MlStringFromArray (a) {
  var len = a.length; this.array = a; this.len = this.last = len;
}
MlStringFromArray.prototype = new MlString ();
var caml_md5_string =
function () {
  function add (x, y) { return (x + y) | 0; }
  function xx(q,a,b,x,s,t) {
    a = add(add(a, q), add(x, t));
    return add((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a,b,c,d,x,s,t) {
    return xx((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a,b,c,d,x,s,t) {
    return xx((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a,b,c,d,x,s,t) { return xx(b ^ c ^ d, a, b, x, s, t); }
  function ii(a,b,c,d,x,s,t) { return xx(c ^ (b | (~d)), a, b, x, s, t); }
  function md5(buffer, length) {
    var i = length;
    buffer[i >> 2] |= 0x80 << (8 * (i & 3));
    for (i = (i & ~0x3) + 4;(i & 0x3F) < 56 ;i += 4)
      buffer[i >> 2] = 0;
    buffer[i >> 2] = length << 3;
    i += 4;
    buffer[i >> 2] = (length >> 29) & 0x1FFFFFFF;
    var w = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
    for(i = 0; i < buffer.length; i += 16) {
      var a = w[0], b = w[1], c = w[2], d = w[3];
      a = ff(a, b, c, d, buffer[i+ 0], 7, 0xD76AA478);
      d = ff(d, a, b, c, buffer[i+ 1], 12, 0xE8C7B756);
      c = ff(c, d, a, b, buffer[i+ 2], 17, 0x242070DB);
      b = ff(b, c, d, a, buffer[i+ 3], 22, 0xC1BDCEEE);
      a = ff(a, b, c, d, buffer[i+ 4], 7, 0xF57C0FAF);
      d = ff(d, a, b, c, buffer[i+ 5], 12, 0x4787C62A);
      c = ff(c, d, a, b, buffer[i+ 6], 17, 0xA8304613);
      b = ff(b, c, d, a, buffer[i+ 7], 22, 0xFD469501);
      a = ff(a, b, c, d, buffer[i+ 8], 7, 0x698098D8);
      d = ff(d, a, b, c, buffer[i+ 9], 12, 0x8B44F7AF);
      c = ff(c, d, a, b, buffer[i+10], 17, 0xFFFF5BB1);
      b = ff(b, c, d, a, buffer[i+11], 22, 0x895CD7BE);
      a = ff(a, b, c, d, buffer[i+12], 7, 0x6B901122);
      d = ff(d, a, b, c, buffer[i+13], 12, 0xFD987193);
      c = ff(c, d, a, b, buffer[i+14], 17, 0xA679438E);
      b = ff(b, c, d, a, buffer[i+15], 22, 0x49B40821);
      a = gg(a, b, c, d, buffer[i+ 1], 5, 0xF61E2562);
      d = gg(d, a, b, c, buffer[i+ 6], 9, 0xC040B340);
      c = gg(c, d, a, b, buffer[i+11], 14, 0x265E5A51);
      b = gg(b, c, d, a, buffer[i+ 0], 20, 0xE9B6C7AA);
      a = gg(a, b, c, d, buffer[i+ 5], 5, 0xD62F105D);
      d = gg(d, a, b, c, buffer[i+10], 9, 0x02441453);
      c = gg(c, d, a, b, buffer[i+15], 14, 0xD8A1E681);
      b = gg(b, c, d, a, buffer[i+ 4], 20, 0xE7D3FBC8);
      a = gg(a, b, c, d, buffer[i+ 9], 5, 0x21E1CDE6);
      d = gg(d, a, b, c, buffer[i+14], 9, 0xC33707D6);
      c = gg(c, d, a, b, buffer[i+ 3], 14, 0xF4D50D87);
      b = gg(b, c, d, a, buffer[i+ 8], 20, 0x455A14ED);
      a = gg(a, b, c, d, buffer[i+13], 5, 0xA9E3E905);
      d = gg(d, a, b, c, buffer[i+ 2], 9, 0xFCEFA3F8);
      c = gg(c, d, a, b, buffer[i+ 7], 14, 0x676F02D9);
      b = gg(b, c, d, a, buffer[i+12], 20, 0x8D2A4C8A);
      a = hh(a, b, c, d, buffer[i+ 5], 4, 0xFFFA3942);
      d = hh(d, a, b, c, buffer[i+ 8], 11, 0x8771F681);
      c = hh(c, d, a, b, buffer[i+11], 16, 0x6D9D6122);
      b = hh(b, c, d, a, buffer[i+14], 23, 0xFDE5380C);
      a = hh(a, b, c, d, buffer[i+ 1], 4, 0xA4BEEA44);
      d = hh(d, a, b, c, buffer[i+ 4], 11, 0x4BDECFA9);
      c = hh(c, d, a, b, buffer[i+ 7], 16, 0xF6BB4B60);
      b = hh(b, c, d, a, buffer[i+10], 23, 0xBEBFBC70);
      a = hh(a, b, c, d, buffer[i+13], 4, 0x289B7EC6);
      d = hh(d, a, b, c, buffer[i+ 0], 11, 0xEAA127FA);
      c = hh(c, d, a, b, buffer[i+ 3], 16, 0xD4EF3085);
      b = hh(b, c, d, a, buffer[i+ 6], 23, 0x04881D05);
      a = hh(a, b, c, d, buffer[i+ 9], 4, 0xD9D4D039);
      d = hh(d, a, b, c, buffer[i+12], 11, 0xE6DB99E5);
      c = hh(c, d, a, b, buffer[i+15], 16, 0x1FA27CF8);
      b = hh(b, c, d, a, buffer[i+ 2], 23, 0xC4AC5665);
      a = ii(a, b, c, d, buffer[i+ 0], 6, 0xF4292244);
      d = ii(d, a, b, c, buffer[i+ 7], 10, 0x432AFF97);
      c = ii(c, d, a, b, buffer[i+14], 15, 0xAB9423A7);
      b = ii(b, c, d, a, buffer[i+ 5], 21, 0xFC93A039);
      a = ii(a, b, c, d, buffer[i+12], 6, 0x655B59C3);
      d = ii(d, a, b, c, buffer[i+ 3], 10, 0x8F0CCC92);
      c = ii(c, d, a, b, buffer[i+10], 15, 0xFFEFF47D);
      b = ii(b, c, d, a, buffer[i+ 1], 21, 0x85845DD1);
      a = ii(a, b, c, d, buffer[i+ 8], 6, 0x6FA87E4F);
      d = ii(d, a, b, c, buffer[i+15], 10, 0xFE2CE6E0);
      c = ii(c, d, a, b, buffer[i+ 6], 15, 0xA3014314);
      b = ii(b, c, d, a, buffer[i+13], 21, 0x4E0811A1);
      a = ii(a, b, c, d, buffer[i+ 4], 6, 0xF7537E82);
      d = ii(d, a, b, c, buffer[i+11], 10, 0xBD3AF235);
      c = ii(c, d, a, b, buffer[i+ 2], 15, 0x2AD7D2BB);
      b = ii(b, c, d, a, buffer[i+ 9], 21, 0xEB86D391);
      w[0] = add(a, w[0]);
      w[1] = add(b, w[1]);
      w[2] = add(c, w[2]);
      w[3] = add(d, w[3]);
    }
    var t = [];
    for (var i = 0; i < 4; i++)
      for (var j = 0; j < 4; j++)
        t[i * 4 + j] = (w[i] >> (8 * j)) & 0xFF;
    return t;
  }
  return function (s, ofs, len) {
    var buf = [];
    if (s.array) {
      var a = s.array;
      for (var i = 0; i < len; i+=4) {
        var j = i + ofs;
        buf[i>>2] = a[j] | (a[j+1] << 8) | (a[j+2] << 16) | (a[j+3] << 24);
      }
      for (; i < len; i++) buf[i>>2] |= a[i + ofs] << (8 * (i & 3));
    } else {
      var b = s.getFullBytes();
      for (var i = 0; i < len; i+=4) {
        var j = i + ofs;
        buf[i>>2] =
          b.charCodeAt(j) | (b.charCodeAt(j+1) << 8) |
          (b.charCodeAt(j+2) << 16) | (b.charCodeAt(j+3) << 24);
      }
      for (; i < len; i++) buf[i>>2] |= b.charCodeAt(i + ofs) << (8 * (i & 3));
    }
    return new MlStringFromArray(md5(buf, len));
  }
} ();
function caml_ml_flush () { return 0; }
function caml_ml_open_descriptor_out () { return 0; }
function caml_ml_out_channels_list () { return 0; }
function caml_ml_output () { return 0; }
function caml_raise_constant (tag) { throw [0, tag]; }
function caml_raise_zero_divide () {
  caml_raise_constant(caml_global_data[6]);
}
function caml_mod(x,y) {
  if (y == 0) caml_raise_zero_divide ();
  return x%y;
}
function caml_mul(x,y) {
  return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;
}
function caml_notequal (x, y) { return +(caml_compare_val(x,y,false) != 0); }
function caml_obj_is_block (x) { return +(x instanceof Array); }
function caml_obj_set_tag (x, tag) { x[0] = tag; return 0; }
function caml_obj_tag (x) { return (x instanceof Array)?x[0]:1000; }
function caml_parse_engine(tables, env, cmd, arg)
{
  var ERRCODE = 256;
  var START = 0;
  var TOKEN_READ = 1;
  var STACKS_GROWN_1 = 2;
  var STACKS_GROWN_2 = 3;
  var SEMANTIC_ACTION_COMPUTED = 4;
  var ERROR_DETECTED = 5;
  var loop = 6;
  var testshift = 7;
  var shift = 8;
  var shift_recover = 9;
  var reduce = 10;
  var READ_TOKEN = 0;
  var RAISE_PARSE_ERROR = 1;
  var GROW_STACKS_1 = 2;
  var GROW_STACKS_2 = 3;
  var COMPUTE_SEMANTIC_ACTION = 4;
  var CALL_ERROR_FUNCTION = 5;
  var env_s_stack = 1;
  var env_v_stack = 2;
  var env_symb_start_stack = 3;
  var env_symb_end_stack = 4;
  var env_stacksize = 5;
  var env_stackbase = 6;
  var env_curr_char = 7;
  var env_lval = 8;
  var env_symb_start = 9;
  var env_symb_end = 10;
  var env_asp = 11;
  var env_rule_len = 12;
  var env_rule_number = 13;
  var env_sp = 14;
  var env_state = 15;
  var env_errflag = 16;
  var tbl_actions = 1;
  var tbl_transl_const = 2;
  var tbl_transl_block = 3;
  var tbl_lhs = 4;
  var tbl_len = 5;
  var tbl_defred = 6;
  var tbl_dgoto = 7;
  var tbl_sindex = 8;
  var tbl_rindex = 9;
  var tbl_gindex = 10;
  var tbl_tablesize = 11;
  var tbl_table = 12;
  var tbl_check = 13;
  var tbl_error_function = 14;
  var tbl_names_const = 15;
  var tbl_names_block = 16;
  if (!tables.dgoto) {
    tables.defred = caml_lex_array (tables[tbl_defred]);
    tables.sindex = caml_lex_array (tables[tbl_sindex]);
    tables.check  = caml_lex_array (tables[tbl_check]);
    tables.rindex = caml_lex_array (tables[tbl_rindex]);
    tables.table  = caml_lex_array (tables[tbl_table]);
    tables.len    = caml_lex_array (tables[tbl_len]);
    tables.lhs    = caml_lex_array (tables[tbl_lhs]);
    tables.gindex = caml_lex_array (tables[tbl_gindex]);
    tables.dgoto  = caml_lex_array (tables[tbl_dgoto]);
  }
  var res = 0, n, n1, n2, state1;
  var sp = env[env_sp];
  var state = env[env_state];
  var errflag = env[env_errflag];
  exit:for (;;) {
    switch(cmd) {
    case START:
      state = 0;
      errflag = 0;
    case loop:
      n = tables.defred[state];
      if (n != 0) { cmd = reduce; break; }
      if (env[env_curr_char] >= 0) { cmd = testshift; break; }
      res = READ_TOKEN;
      break exit;
    case TOKEN_READ:
      if (arg instanceof Array) {
        env[env_curr_char] = tables[tbl_transl_block][arg[0] + 1];
        env[env_lval] = arg[1];
      } else {
        env[env_curr_char] = tables[tbl_transl_const][arg + 1];
        env[env_lval] = 0;
      }
    case testshift:
      n1 = tables.sindex[state];
      n2 = n1 + env[env_curr_char];
      if (n1 != 0 && n2 >= 0 && n2 <= tables[tbl_tablesize] &&
          tables.check[n2] == env[env_curr_char]) {
        cmd = shift; break;
      }
      n1 = tables.rindex[state];
      n2 = n1 + env[env_curr_char];
      if (n1 != 0 && n2 >= 0 && n2 <= tables[tbl_tablesize] &&
          tables.check[n2] == env[env_curr_char]) {
        n = tables.table[n2];
        cmd = reduce; break;
      }
      if (errflag <= 0) {
        res = CALL_ERROR_FUNCTION;
        break exit;
      }
    case ERROR_DETECTED:
      if (errflag < 3) {
        errflag = 3;
        for (;;) {
          state1 = env[env_s_stack][sp + 1];
          n1 = tables.sindex[state1];
          n2 = n1 + ERRCODE;
          if (n1 != 0 && n2 >= 0 && n2 <= tables[tbl_tablesize] &&
              tables.check[n2] == ERRCODE) {
            cmd = shift_recover; break;
          } else {
            if (sp <= env[env_stackbase]) return RAISE_PARSE_ERROR;
            sp--;
          }
        }
      } else {
        if (env[env_curr_char] == 0) return RAISE_PARSE_ERROR;
        env[env_curr_char] = -1;
        cmd = loop; break;
      }
    case shift:
      env[env_curr_char] = -1;
      if (errflag > 0) errflag--;
    case shift_recover:
      state = tables.table[n2];
      sp++;
      if (sp >= env[env_stacksize]) {
        res = GROW_STACKS_1;
        break exit;
      }
    case STACKS_GROWN_1:
      env[env_s_stack][sp + 1] = state;
      env[env_v_stack][sp + 1] = env[env_lval];
      env[env_symb_start_stack][sp + 1] = env[env_symb_start];
      env[env_symb_end_stack][sp + 1] = env[env_symb_end];
      cmd = loop;
      break;
    case reduce:
      var m = tables.len[n];
      env[env_asp] = sp;
      env[env_rule_number] = n;
      env[env_rule_len] = m;
      sp = sp - m + 1;
      m = tables.lhs[n];
      state1 = env[env_s_stack][sp];
      n1 = tables.gindex[m];
      n2 = n1 + state1;
      if (n1 != 0 && n2 >= 0 && n2 <= tables[tbl_tablesize] &&
          tables.check[n2] == state1)
        state = tables.table[n2];
      else
        state = tables.dgoto[m];
      if (sp >= env[env_stacksize]) {
        res = GROW_STACKS_2;
        break exit;
      }
    case STACKS_GROWN_2:
      res = COMPUTE_SEMANTIC_ACTION;
      break exit;
    case SEMANTIC_ACTION_COMPUTED:
      env[env_s_stack][sp + 1] = state;
      env[env_v_stack][sp + 1] = arg;
      var asp = env[env_asp];
      env[env_symb_end_stack][sp + 1] = env[env_symb_end_stack][asp + 1];
      if (sp > asp) {
        env[env_symb_start_stack][sp + 1] = env[env_symb_end_stack][asp + 1];
      }
      cmd = loop; break;
    default:
      return RAISE_PARSE_ERROR;
    }
  }
  env[env_sp] = sp;
  env[env_state] = state;
  env[env_errflag] = errflag;
  return res;
}
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_string_equal(s1, s2) {
  var b1 = s1.fullBytes;
  var b2 = s2.fullBytes;
  if (b1 != null && b2 != null) return (b1 == b2)?1:0;
  return (s1.getFullBytes () == s2.getFullBytes ())?1:0;
}
function caml_string_notequal(s1, s2) { return 1-caml_string_equal(s1, s2); }
function caml_sys_const_word_size () { return 32; }
function caml_sys_get_config () {
  return [0, new MlWrappedString("Unix"), 32, 0];
}
function caml_raise_not_found () { caml_raise_constant(caml_global_data[7]); }
function caml_sys_getenv () { caml_raise_not_found (); }
function caml_sys_random_seed () {
  var x = new Date()^0xffffffff*Math.random();
  return {valueOf:function(){return x;},0:0,1:x,length:2};
}
function caml_update_dummy (x, y) {
  if( typeof y==="function" ) { x.fun = y; return 0; }
  if( y.fun ) { x.fun = y.fun; return 0; }
  var i = y.length; while (i--) x[i] = y[i]; return 0;
}
(function(){function lr(zO,zP,zQ,zR,zS,zT,zU){return zO.length==6?zO(zP,zQ,zR,zS,zT,zU):caml_call_gen(zO,[zP,zQ,zR,zS,zT,zU]);}function qs(zI,zJ,zK,zL,zM,zN){return zI.length==5?zI(zJ,zK,zL,zM,zN):caml_call_gen(zI,[zJ,zK,zL,zM,zN]);}function we(zD,zE,zF,zG,zH){return zD.length==4?zD(zE,zF,zG,zH):caml_call_gen(zD,[zE,zF,zG,zH]);}function hh(zz,zA,zB,zC){return zz.length==3?zz(zA,zB,zC):caml_call_gen(zz,[zA,zB,zC]);}function eD(zw,zx,zy){return zw.length==2?zw(zx,zy):caml_call_gen(zw,[zx,zy]);}function eq(zu,zv){return zu.length==1?zu(zv):caml_call_gen(zu,[zv]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=[0,new MlString(""),0,0,-1],f=[0,new MlString(""),1,0,0],g=new MlString("File \"%s\", line %d, characters %d-%d: %s"),h=new MlString(""),i=new MlString("textarea");caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var db=[0,new MlString("Out_of_memory")],da=[0,new MlString("End_of_file")],c$=[0,new MlString("Match_failure")],c_=[0,new MlString("Stack_overflow")],c9=[0,new MlString("Undefined_recursive_module")],c8=new MlString("%.12g"),c7=new MlString("."),c6=new MlString("%d"),c5=new MlString("true"),c4=new MlString("false"),c3=new MlString("Pervasives.do_at_exit"),c2=new MlString("Array.blit"),c1=new MlString("\\b"),c0=new MlString("\\t"),cZ=new MlString("\\n"),cY=new MlString("\\r"),cX=new MlString("\\\\"),cW=new MlString("\\'"),cV=new MlString("String.contains_from"),cU=new MlString(""),cT=new MlString("String.blit"),cS=new MlString("String.sub"),cR=new MlString(""),cQ=new MlString("syntax error"),cP=new MlString("Parsing.YYexit"),cO=new MlString("Parsing.Parse_error"),cN=new MlString("Queue.Empty"),cM=new MlString("CamlinternalLazy.Undefined"),cL=new MlString("Buffer.add: cannot grow buffer"),cK=new MlString(""),cJ=new MlString(""),cI=new MlString("%.12g"),cH=new MlString("\""),cG=new MlString("\""),cF=new MlString("'"),cE=new MlString("'"),cD=new MlString("nan"),cC=new MlString("neg_infinity"),cB=new MlString("infinity"),cA=new MlString("."),cz=new MlString("printf: bad positional specification (0)."),cy=new MlString("%_"),cx=[0,new MlString("printf.ml"),143,8],cw=new MlString("'"),cv=new MlString("Printf: premature end of format string '"),cu=new MlString("'"),ct=new MlString(" in format string '"),cs=new MlString(", at char number "),cr=new MlString("Printf: bad conversion %"),cq=new MlString("Sformat.index_of_int: negative argument "),cp=new MlString(""),co=new MlString(", %s%s"),cn=[1,1],cm=new MlString("%s\n"),cl=new MlString("(Program not linked with -g, cannot print stack backtrace)\n"),ck=new MlString("Raised at"),cj=new MlString("Re-raised at"),ci=new MlString("Raised by primitive operation at"),ch=new MlString("Called from"),cg=new MlString("%s file \"%s\", line %d, characters %d-%d"),cf=new MlString("%s unknown location"),ce=new MlString("Out of memory"),cd=new MlString("Stack overflow"),cc=new MlString("Pattern matching failed"),cb=new MlString("Assertion failed"),ca=new MlString("Undefined recursive module"),b$=new MlString("(%s%s)"),b_=new MlString(""),b9=new MlString(""),b8=new MlString("(%s)"),b7=new MlString("%d"),b6=new MlString("%S"),b5=new MlString("_"),b4=new MlString("x"),b3=[0,987910699,495797812,364182224,414272206,318284740,990407751,383018966,270373319,840823159,24560019,536292337,512266505,189156120,730249596,143776328,51606627,140166561,366354223,1003410265,700563762,981890670,913149062,526082594,1021425055,784300257,667753350,630144451,949649812,48546892,415514493,258888527,511570777,89983870,283659902,308386020,242688715,482270760,865188196,1027664170,207196989,193777847,619708188,671350186,149669678,257044018,87658204,558145612,183450813,28133145,901332182,710253903,510646120,652377910,409934019,801085050],b2=new MlString("OCAMLRUNPARAM"),b1=new MlString("CAMLRUNPARAM"),b0=new MlString(""),bZ=new MlString("TMPDIR"),bY=new MlString("TEMP"),bX=new MlString("Cygwin"),bW=new MlString("Unix"),bV=new MlString("Win32"),bU=[0,new MlString("filename.ml"),189,9],bT=new MlString("Pcre.Error"),bS=new MlString("Pcre.Backtrack"),bR=[1,new MlString("")],bQ=new MlString("Pcre.Error"),bP=new MlString("Pcre.Backtrack"),bO=new MlString("\\s+"),bN=new MlString("Pcre.FoundAt"),bM=[0,613575188,0],bL=new MlString("\\d+"),bK=new MlString("0(x|X)[0-9a-fA-F]+"),bJ=new MlString("0(o|O)[0-7]+"),bI=new MlString("0(b|B)[01]+"),bH=new MlString("-?\\d+"),bG=new MlString("-?\\d+(\\.\\d*)?((e|E)?(\\+|-)?\\d+)?"),bF=[0,new MlString("src/core/lwt.ml"),648,20],bE=[0,new MlString("src/core/lwt.ml"),651,8],bD=[0,new MlString("src/core/lwt.ml"),498,8],bC=[0,new MlString("src/core/lwt.ml"),487,9],bB=new MlString("Lwt.wakeup_result"),bA=new MlString("Lwt.Canceled"),bz=new MlString("\""),by=new MlString(" name=\""),bx=new MlString("\""),bw=new MlString(" type=\""),bv=new MlString("<"),bu=new MlString(">"),bt=new MlString(""),bs=new MlString("<input name=\"x\">"),br=new MlString("input"),bq=new MlString("x"),bp=new MlString("canvas"),bo=new MlString("2d"),bn=new MlString("Dom_html.Canvas_not_available"),bm=new MlString("Exception during Lwt.async: "),bl=new MlString(";"),bk=new MlString(";"),bj=new MlString("#"),bi=[0,[0,new MlString("gt"),62,new MlString(">")],[0,[0,new MlString("lt"),60,new MlString("<")],[0,[0,new MlString("amp"),38,new MlString("&")],[0,[0,new MlString("apos"),39,new MlString("'")],[0,[0,new MlString("quot"),34,new MlString("\"")],0]]]]],bh=new MlString("#PCDATA"),bg=new MlString("%s?"),bf=new MlString("%s*"),be=new MlString("%s+"),bd=new MlString("|"),bc=new MlString("(%s)"),bb=new MlString(","),ba=new MlString("(%s)"),a$=new MlString("%s?"),a_=new MlString("%s*"),a9=new MlString("%s+"),a8=new MlString(""),a7=new MlString("ANY"),a6=new MlString("EMPTY"),a5=new MlString("%s%s"),a4=new MlString("(%s%s)"),a3=new MlString("#REQUIRED"),a2=new MlString("#IMPLIED"),a1=new MlString("\"%s\""),a0=new MlString("#FIXED \"%s\""),aZ=new MlString("CDATA"),aY=new MlString("NMTOKEN"),aX=new MlString("ID"),aW=new MlString("IDREF"),aV=new MlString("|"),aU=new MlString("(%s)"),aT=new MlString("<!ATTLIST %s %s %s %s>"),aS=new MlString("<!ELEMENT %s %s>"),aR=[0,new MlString("dtd.ml"),289,34],aQ=[0,new MlString("dtd.ml"),122,35],aP=new MlString("Dtd.Parse_error"),aO=[0,new MlString("xmlParser.ml"),53,35],aN=[0,new MlString("xmlParser.ml"),52,30],aM=[0,new MlString("xmlParser.ml"),51,30],aL=new MlString("Xml.Error"),aK=new MlString("Xml.File_not_found"),aJ=new MlString("parser"),aI=[0,1],aH=[0,257,0,260,261,262,263,264,265,266,0],aG=new MlString("\xff\xff\x01\0\x02\0\x02\0\x03\0\x04\0\x04\0\x05\0\x05\0\x05\0\x05\0\x06\0\0\0"),aF=new MlString("\x02\0\x02\0\0\0\x02\0\x06\0\0\0\x03\0\x05\0\x04\0\x02\0\x02\0\x01\0\x02\0"),aE=new MlString("\0\0\0\0\0\0\0\0\f\0\0\0\0\0\0\0\x01\0\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x0b\0\0\0\0\0\t\0\n\0\0\0\0\0\0\0\0\0\x04\0\x06\0\0\0\b\0\x07\0"),aD=new MlString("\x02\0\x04\0\x05\0\x06\0\x0f\0\x10\0\x12\0"),aC=new MlString("\b\0\t\xff\0\0\n\xff\0\0\x0b\0\t\xff\b\xff\0\0\0\0\xfc\xfe\x0b\xff\f\xff\x0b\xff\x0b\xff\r\xff\x0e\xff\0\0\x0f\xff\xfc\xfe\0\0\0\0\x10\xff\xfc\xfe\xfc\xfe\x12\xff\0\0\0\0\x13\xff\0\0\0\0"),aB=new MlString("\0\0\x0f\0\0\0\0\0\0\0\0\0\x0f\0\0\0\0\0\0\0\x14\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x14\xff\0\0\0\0\0\0\x14\xff\x14\xff\0\0\0\0\0\0\0\0\0\0\0\0"),aA=new MlString("\0\0\0\0\n\0\0\0\xf0\xff\0\0\xf4\xff"),az=new MlString("\x0b\0\x14\0\x15\0\x19\0\f\0\r\0\x0e\0\x1b\0\x1c\0\x01\0\x03\0\b\0\x07\0\n\0\x11\0\x02\0\t\0\x13\0\0\0\x16\0\x18\0\x17\0\0\0\x1a\0\x1d\0\x1e\0\x05\0"),ay=new MlString("\x04\x01\r\0\x0e\0\x13\0\b\x01\t\x01\n\x01\x17\0\x18\0\x01\0\x01\x01\0\0\x02\x01\x05\x01\x03\x01\0\0\x06\0\x05\x01\xff\xff\x06\x01\x05\x01\x07\x01\xff\xff\x07\x01\x06\x01\x06\x01\x06\x01"),ax=new MlString("ACTION\0EOF\0REPEAT\0LPAREN\0RPAREN\0SEMICOLON\0FIRE\0WAIT\0SPEED\0"),aw=new MlString("IDENT\0NUM\0"),av=new MlString("Lex error: '%c'"),au=[0,new MlString("\0\0\xf2\xff\xf3\xff\x1a\0\f\x004\0N\0h\0\x82\0\xa0\0\xfb\xff\xfc\xff\xfd\xff\xfe\xff\xff\xff\xba\0\xd4\0\xee\0\b\x01\"\x01<\x01V\x01p\x01\x8a\x01\xa4\x01\xbe\x01\xd8\x01\xf2\x01\f\x02&\x02@\x02Z\x02t\x02\x8e\x02\xa8\x02"),new MlString("\xff\xff\xff\xff\xff\xff\x0b\0\n\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x0b\0\x0b\0\x0b\0\x0b\0\x05\0\x0b\0\x0b\0\x06\0\x0b\0\x0b\0\x0b\0\x0b\0\x07\0\x0b\0\x0b\0\b\0\x0b\0\x0b\0\x0b\0\t\0"),new MlString("\x01\0\0\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"),new MlString("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\r\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x0e\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\f\0\x0b\0\0\0\0\0\0\0\0\0\0\0\0\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\0\0\n\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\t\0\x03\0\x03\0\x03\0\x03\0\b\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x07\0\x05\0\x03\0\x03\0\x03\0\x06\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x1f\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x1c\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x17\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x14\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\0\0\0\0\0\0\x02\0\x03\0\x03\0\x0f\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x10\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x11\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x12\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x13\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x15\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x16\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x18\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x19\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x1a\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x1b\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x1d\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x1e\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0 \0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0!\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\"\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"),new MlString("\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\x07\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\xff\xff\xff\xff\xff\xff\0\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\t\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x0f\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x10\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x11\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x12\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x13\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x15\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x16\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x17\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1c\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\"\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"),new MlString(""),new MlString(""),new MlString(""),new MlString(""),new MlString(""),new MlString("")],at=new MlString("Rand"),as=new MlString("Rank"),ar=new MlString("Num "),aq=new MlString(")"),ap=new MlString("("),ao=new MlString("Param "),an=new MlString(" +@ "),am=new MlString(" -@ "),al=new MlString(" *@ "),ak=new MlString(" /@ "),aj=new MlString(" %@ "),ai=new MlString(")"),ah=new MlString("Direct ("),ag=new MlString(")"),af=new MlString("\", "),ae=new MlString("Indirect (\""),ad=new MlString("]"),ac=new MlString("; "),ab=new MlString("["),aa=new MlString("<string>"),$=new MlString("Parse error in %s %d:%d-%d:"),_=new MlString("parse error"),Z=new MlString("%s%c%s%s"),Y=new MlString("Param"),X=new MlString("replicate"),W=[0,0],V=[2,[0,0]],U=[0,[0,1]],T=new MlString(", "),S=new MlString("a: %s\nb: %s\nf: %s\n"),R=[0,new MlString("top"),[0,new MlString("top1"),0]],Q=[1,0],P=[1,0],O=new MlString(" bullets"),N=new MlString(".demo"),M=[0,105,210,231],L=[0,250,105,0],K=[0,[0,-2,0],[0,[0,-2,1],[0,[0,-2,2],[0,[0,-2,-1],[0,[0,-1,0],[0,[0,-1,1],[0,[0,-1,2],[0,[0,-1,3],[0,[0,-1,-1],[0,[0,-1,-2],[0,[0,0,0],[0,[0,0,1],[0,[0,0,2],[0,[0,0,3],[0,[0,0,-1],[0,[0,0,-2],[0,[0,1,0],[0,[0,1,1],[0,[0,1,2],[0,[0,1,3],[0,[0,1,-1],[0,[0,1,-2],[0,[0,2,0],[0,[0,2,1],[0,[0,2,2],[0,[0,2,3],[0,[0,2,-1],[0,[0,2,-2],[0,[0,3,0],[0,[0,3,1],[0,[0,3,2],[0,[0,3,-1],0]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],J=[0,255,255,255],I=[0,new MlString("jsapp.ml"),24,46],H=[0,[5,[0,5]],0],G=[0,30],F=[0,45],E=[2,[0,0]],D=[0,12],C=[0,[0,[2,[0,[0,0.3]],[0,30]],[0,[5,[0,100]],[0,[2,[0,[0,5]],[0,100]],0]]]],B=[0,[0,[0,2]]],A=new MlString("hmgLsr"),z=[0,[5,[0,60]],0],y=[0,[0,[0,8],[0,[0,[5,[0,1]],[0,[1,[0,[0,[0,[1,[0,0]]],0,[1,new MlString("hmgLsr"),0]]]],0]]]],[0,[5,[0,10]],0]],x=[1,new MlString("hmgLsr"),0],w=[0,120],v=[0,60],u=[0,0],t=[0,20],s=new MlString("top"),r=[0,0],q=[0,200,100],p=[0,200,250],o=new MlString("#shmup");function n(j){throw [0,a,j];}function dc(k){throw [0,b,k];}function dd(m,l){return caml_greaterequal(m,l)?m:l;}function dp(de,dg){var df=de.getLen(),dh=dg.getLen(),di=caml_create_string(df+dh|0);caml_blit_string(de,0,di,0,df);caml_blit_string(dg,0,di,df,dh);return di;}function dy(dj){return caml_format_int(c6,dj);}function dz(dk){var dl=caml_format_float(c8,dk),dm=0,dn=dl.getLen();for(;;){if(dn<=dm)var dq=dp(dl,c7);else{var dr=dl.safeGet(dm),ds=48<=dr?58<=dr?0:1:45===dr?1:0;if(ds){var dt=dm+1|0,dm=dt;continue;}var dq=dl;}return dq;}}function dv(du,dw){if(du){var dx=du[1];return [0,dx,dv(du[2],dw)];}return dw;}var dA=caml_ml_open_descriptor_out(1),dB=caml_ml_open_descriptor_out(2);function d4(dD,dC){return caml_ml_output(dD,dC,0,dC.getLen());}function d3(dQ){function dN(dK,dE,dG){var dF=dE,dH=dG;for(;;){if(dH){var dI=dH[1],dJ=dI.getLen(),dL=dH[2];caml_blit_string(dI,0,dK,dF-dJ|0,dJ);var dM=dF-dJ|0,dF=dM,dH=dL;continue;}return dK;}}var dO=0,dP=0;for(;;){var dR=caml_ml_input_scan_line(dQ);if(0===dR){if(!dO)throw [0,da];var dS=dN(caml_create_string(dP),dP,dO);}else{if(!(0<dR)){var dV=caml_create_string(-dR|0);caml_ml_input(dQ,dV,0,-dR|0);var dX=dP-dR|0,dW=[0,dV,dO],dO=dW,dP=dX;continue;}var dT=caml_create_string(dR-1|0);caml_ml_input(dQ,dT,0,dR-1|0);caml_ml_input_char(dQ);if(dO){var dU=(dP+dR|0)-1|0,dS=dN(caml_create_string(dU),dU,[0,dT,dO]);}else var dS=dT;}return dS;}}function d5(dY){caml_ml_output_char(dA,10);return caml_ml_flush(dA);}function d6(d2){var dZ=caml_ml_out_channels_list(0);for(;;){if(dZ){var d0=dZ[2];try {}catch(d1){}var dZ=d0;continue;}return 0;}}caml_register_named_value(c3,d6);function d_(d8,d7){return caml_ml_output_char(d8,d7);}function ef(d9){return caml_ml_flush(d9);}function ee(eb,ea,ed,ec,d$){if(0<=d$&&0<=ea&&!((eb.length-1-d$|0)<ea)&&0<=ec&&!((ed.length-1-d$|0)<ec))return caml_array_blit(eb,ea,ed,ec,d$);return dc(c2);}function eZ(eg){var eh=eg,ei=0;for(;;){if(eh){var ej=eh[2],ek=[0,eh[1],ei],eh=ej,ei=ek;continue;}return ei;}}function em(el){if(el){var en=el[1];return dv(en,em(el[2]));}return 0;}function es(ep,eo){if(eo){var er=eo[2],et=eq(ep,eo[1]);return [0,et,es(ep,er)];}return 0;}function e0(ew,eu){var ev=eu;for(;;){if(ev){var ex=ev[2];eq(ew,ev[1]);var ev=ex;continue;}return 0;}}function e1(eC,ey,eA){var ez=ey,eB=eA;for(;;){if(eB){var eE=eB[2],eF=eD(eC,ez,eB[1]),ez=eF,eB=eE;continue;}return ez;}}function eH(eJ,eG,eI){if(eG){var eK=eG[1];return eD(eJ,eK,eH(eJ,eG[2],eI));}return eI;}function e2(eO,eL){var eM=eL;for(;;){if(eM){var eN=eM[1],eQ=eM[2],eP=eN[2];if(0===caml_compare(eN[1],eO))return eP;var eM=eQ;continue;}throw [0,c];}}function e3(eX){return eq(function(eR,eT){var eS=eR,eU=eT;for(;;){if(eU){var eV=eU[2],eW=eU[1];if(eq(eX,eW)){var eY=[0,eW,eS],eS=eY,eU=eV;continue;}var eU=eV;continue;}return eZ(eS);}},0);}function fo(e4,e6){var e5=caml_create_string(e4);caml_fill_string(e5,0,e4,e6);return e5;}function fp(e9,e7,e8){if(0<=e7&&0<=e8&&!((e9.getLen()-e8|0)<e7)){var e_=caml_create_string(e8);caml_blit_string(e9,e7,e_,0,e8);return e_;}return dc(cS);}function fq(fb,fa,fd,fc,e$){if(0<=e$&&0<=fa&&!((fb.getLen()-e$|0)<fa)&&0<=fc&&!((fd.getLen()-e$|0)<fc))return caml_blit_string(fb,fa,fd,fc,e$);return dc(cT);}function fr(fk,fe){if(fe){var ff=fe[1],fg=[0,0],fh=[0,0],fj=fe[2];e0(function(fi){fg[1]+=1;fh[1]=fh[1]+fi.getLen()|0;return 0;},fe);var fl=caml_create_string(fh[1]+caml_mul(fk.getLen(),fg[1]-1|0)|0);caml_blit_string(ff,0,fl,0,ff.getLen());var fm=[0,ff.getLen()];e0(function(fn){caml_blit_string(fk,0,fl,fm[1],fk.getLen());fm[1]=fm[1]+fk.getLen()|0;caml_blit_string(fn,0,fl,fm[1],fn.getLen());fm[1]=fm[1]+fn.getLen()|0;return 0;},fj);return fl;}return cU;}var fs=caml_sys_get_config(0)[1],ft=caml_sys_const_word_size(0),fu=(1<<(ft-10|0))-1|0,fv=caml_mul(ft/8|0,fu)-1|0,fE=250,fD=252,fC=253;function fB(fA,fx,fw){var fy=fw-fx|0,fz=caml_create_string(fy);caml_blit_string(fA[2],fx,fz,0,fy);return fz;}var fF=[0,cP],fG=[0,cO],fH=[0,caml_make_vect(100,0),caml_make_vect(100,0),caml_make_vect(100,e),caml_make_vect(100,e),100,0,0,0,e,e,0,0,0,0,0,0];function fQ(fO){var fI=fH[5],fJ=fI*2|0,fK=caml_make_vect(fJ,0),fL=caml_make_vect(fJ,0),fM=caml_make_vect(fJ,e),fN=caml_make_vect(fJ,e);ee(fH[1],0,fK,0,fI);fH[1]=fK;ee(fH[2],0,fL,0,fI);fH[2]=fL;ee(fH[3],0,fM,0,fI);fH[3]=fM;ee(fH[4],0,fN,0,fI);fH[4]=fN;fH[5]=fJ;return 0;}var fV=[0,function(fP){return 0;}];function fU(fR,fS){return caml_array_get(fR[2],fR[11]-fS|0);}function fZ(fT){return 0;}var fY=[0,cN],fW=[0,cM];function gg(fX){throw [0,fW];}function gf(f0){var f1=1<=f0?f0:1,f2=fv<f1?fv:f1,f3=caml_create_string(f2);return [0,f3,0,f2,f3];}function gh(f4){return fp(f4[1],0,f4[2]);}function f$(f5,f7){var f6=[0,f5[3]];for(;;){if(f6[1]<(f5[2]+f7|0)){f6[1]=2*f6[1]|0;continue;}if(fv<f6[1])if((f5[2]+f7|0)<=fv)f6[1]=fv;else n(cL);var f8=caml_create_string(f6[1]);fq(f5[1],0,f8,0,f5[2]);f5[1]=f8;f5[3]=f6[1];return 0;}}function gi(f9,ga){var f_=f9[2];if(f9[3]<=f_)f$(f9,1);f9[1].safeSet(f_,ga);f9[2]=f_+1|0;return 0;}function gj(gd,gb){var gc=gb.getLen(),ge=gd[2]+gc|0;if(gd[3]<ge)f$(gd,gc);fq(gb,0,gd[1],gd[2],gc);gd[2]=ge;return 0;}function gn(gk){return 0<=gk?gk:n(dp(cq,dy(gk)));}function go(gl,gm){return gn(gl+gm|0);}var gp=eq(go,1);function gw(gq){return fp(gq,0,gq.getLen());}function gy(gr,gs,gu){var gt=dp(ct,dp(gr,cu)),gv=dp(cs,dp(dy(gs),gt));return dc(dp(cr,dp(fo(1,gu),gv)));}function hn(gx,gA,gz){return gy(gw(gx),gA,gz);}function ho(gB){return dc(dp(cv,dp(gw(gB),cw)));}function gV(gC,gK,gM,gO){function gJ(gD){if((gC.safeGet(gD)-48|0)<0||9<(gC.safeGet(gD)-48|0))return gD;var gE=gD+1|0;for(;;){var gF=gC.safeGet(gE);if(48<=gF){if(!(58<=gF)){var gH=gE+1|0,gE=gH;continue;}var gG=0;}else if(36===gF){var gI=gE+1|0,gG=1;}else var gG=0;if(!gG)var gI=gD;return gI;}}var gL=gJ(gK+1|0),gN=gf((gM-gL|0)+10|0);gi(gN,37);var gP=gL,gQ=eZ(gO);for(;;){if(gP<=gM){var gR=gC.safeGet(gP);if(42===gR){if(gQ){var gS=gQ[2];gj(gN,dy(gQ[1]));var gT=gJ(gP+1|0),gP=gT,gQ=gS;continue;}throw [0,d,cx];}gi(gN,gR);var gU=gP+1|0,gP=gU;continue;}return gh(gN);}}function iQ(g1,gZ,gY,gX,gW){var g0=gV(gZ,gY,gX,gW);if(78!==g1&&110!==g1)return g0;g0.safeSet(g0.getLen()-1|0,117);return g0;}function hp(g8,hg,hl,g2,hk){var g3=g2.getLen();function hi(g4,hf){var g5=40===g4?41:125;function he(g6){var g7=g6;for(;;){if(g3<=g7)return eq(g8,g2);if(37===g2.safeGet(g7)){var g9=g7+1|0;if(g3<=g9)var g_=eq(g8,g2);else{var g$=g2.safeGet(g9),ha=g$-40|0;if(ha<0||1<ha){var hb=ha-83|0;if(hb<0||2<hb)var hc=1;else switch(hb){case 1:var hc=1;break;case 2:var hd=1,hc=0;break;default:var hd=0,hc=0;}if(hc){var g_=he(g9+1|0),hd=2;}}else var hd=0===ha?0:1;switch(hd){case 1:var g_=g$===g5?g9+1|0:hh(hg,g2,hf,g$);break;case 2:break;default:var g_=he(hi(g$,g9+1|0)+1|0);}}return g_;}var hj=g7+1|0,g7=hj;continue;}}return he(hf);}return hi(hl,hk);}function hO(hm){return hh(hp,ho,hn,hm);}function h4(hq,hB,hL){var hr=hq.getLen()-1|0;function hM(hs){var ht=hs;a:for(;;){if(ht<hr){if(37===hq.safeGet(ht)){var hu=0,hv=ht+1|0;for(;;){if(hr<hv)var hw=ho(hq);else{var hx=hq.safeGet(hv);if(58<=hx){if(95===hx){var hz=hv+1|0,hy=1,hu=hy,hv=hz;continue;}}else if(32<=hx)switch(hx-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var hA=hv+1|0,hv=hA;continue;case 10:var hC=hh(hB,hu,hv,105),hv=hC;continue;default:var hD=hv+1|0,hv=hD;continue;}var hE=hv;c:for(;;){if(hr<hE)var hF=ho(hq);else{var hG=hq.safeGet(hE);if(126<=hG)var hH=0;else switch(hG){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var hF=hh(hB,hu,hE,105),hH=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var hF=hh(hB,hu,hE,102),hH=1;break;case 33:case 37:case 44:case 64:var hF=hE+1|0,hH=1;break;case 83:case 91:case 115:var hF=hh(hB,hu,hE,115),hH=1;break;case 97:case 114:case 116:var hF=hh(hB,hu,hE,hG),hH=1;break;case 76:case 108:case 110:var hI=hE+1|0;if(hr<hI){var hF=hh(hB,hu,hE,105),hH=1;}else{var hJ=hq.safeGet(hI)-88|0;if(hJ<0||32<hJ)var hK=1;else switch(hJ){case 0:case 12:case 17:case 23:case 29:case 32:var hF=eD(hL,hh(hB,hu,hE,hG),105),hH=1,hK=0;break;default:var hK=1;}if(hK){var hF=hh(hB,hu,hE,105),hH=1;}}break;case 67:case 99:var hF=hh(hB,hu,hE,99),hH=1;break;case 66:case 98:var hF=hh(hB,hu,hE,66),hH=1;break;case 41:case 125:var hF=hh(hB,hu,hE,hG),hH=1;break;case 40:var hF=hM(hh(hB,hu,hE,hG)),hH=1;break;case 123:var hN=hh(hB,hu,hE,hG),hP=hh(hO,hG,hq,hN),hQ=hN;for(;;){if(hQ<(hP-2|0)){var hR=eD(hL,hQ,hq.safeGet(hQ)),hQ=hR;continue;}var hS=hP-1|0,hE=hS;continue c;}default:var hH=0;}if(!hH)var hF=hn(hq,hE,hG);}var hw=hF;break;}}var ht=hw;continue a;}}var hT=ht+1|0,ht=hT;continue;}return ht;}}hM(0);return 0;}function j5(h5){var hU=[0,0,0,0];function h3(hZ,h0,hV){var hW=41!==hV?1:0,hX=hW?125!==hV?1:0:hW;if(hX){var hY=97===hV?2:1;if(114===hV)hU[3]=hU[3]+1|0;if(hZ)hU[2]=hU[2]+hY|0;else hU[1]=hU[1]+hY|0;}return h0+1|0;}h4(h5,h3,function(h1,h2){return h1+1|0;});return hU[1];}function iM(h6,h9,h7){var h8=h6.safeGet(h7);if((h8-48|0)<0||9<(h8-48|0))return eD(h9,0,h7);var h_=h8-48|0,h$=h7+1|0;for(;;){var ia=h6.safeGet(h$);if(48<=ia){if(!(58<=ia)){var id=h$+1|0,ic=(10*h_|0)+(ia-48|0)|0,h_=ic,h$=id;continue;}var ib=0;}else if(36===ia)if(0===h_){var ie=n(cz),ib=1;}else{var ie=eD(h9,[0,gn(h_-1|0)],h$+1|0),ib=1;}else var ib=0;if(!ib)var ie=eD(h9,0,h7);return ie;}}function iH(ig,ih){return ig?ih:eq(gp,ih);}function iw(ii,ij){return ii?ii[1]:ij;}function lq(ko,il,kA,ip,j_,kG,ik){var im=eq(il,ik);function kp(io){return eD(ip,im,io);}function j9(iu,kF,iq,iz){var it=iq.getLen();function j6(kx,ir){var is=ir;for(;;){if(it<=is)return eq(iu,im);var iv=iq.safeGet(is);if(37===iv){var iD=function(iy,ix){return caml_array_get(iz,iw(iy,ix));},iJ=function(iL,iE,iG,iA){var iB=iA;for(;;){var iC=iq.safeGet(iB)-32|0;if(!(iC<0||25<iC))switch(iC){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return iM(iq,function(iF,iK){var iI=[0,iD(iF,iE),iG];return iJ(iL,iH(iF,iE),iI,iK);},iB+1|0);default:var iN=iB+1|0,iB=iN;continue;}var iO=iq.safeGet(iB);if(124<=iO)var iP=0;else switch(iO){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var iR=iD(iL,iE),iS=caml_format_int(iQ(iO,iq,is,iB,iG),iR),iU=iT(iH(iL,iE),iS,iB+1|0),iP=1;break;case 69:case 71:case 101:case 102:case 103:var iV=iD(iL,iE),iW=caml_format_float(gV(iq,is,iB,iG),iV),iU=iT(iH(iL,iE),iW,iB+1|0),iP=1;break;case 76:case 108:case 110:var iX=iq.safeGet(iB+1|0)-88|0;if(iX<0||32<iX)var iY=1;else switch(iX){case 0:case 12:case 17:case 23:case 29:case 32:var iZ=iB+1|0,i0=iO-108|0;if(i0<0||2<i0)var i1=0;else{switch(i0){case 1:var i1=0,i2=0;break;case 2:var i3=iD(iL,iE),i4=caml_format_int(gV(iq,is,iZ,iG),i3),i2=1;break;default:var i5=iD(iL,iE),i4=caml_format_int(gV(iq,is,iZ,iG),i5),i2=1;}if(i2){var i6=i4,i1=1;}}if(!i1){var i7=iD(iL,iE),i6=caml_int64_format(gV(iq,is,iZ,iG),i7);}var iU=iT(iH(iL,iE),i6,iZ+1|0),iP=1,iY=0;break;default:var iY=1;}if(iY){var i8=iD(iL,iE),i9=caml_format_int(iQ(110,iq,is,iB,iG),i8),iU=iT(iH(iL,iE),i9,iB+1|0),iP=1;}break;case 37:case 64:var iU=iT(iE,fo(1,iO),iB+1|0),iP=1;break;case 83:case 115:var i_=iD(iL,iE);if(115===iO)var i$=i_;else{var ja=[0,0],jb=0,jc=i_.getLen()-1|0;if(!(jc<jb)){var jd=jb;for(;;){var je=i_.safeGet(jd),jf=14<=je?34===je?1:92===je?1:0:11<=je?13<=je?1:0:8<=je?1:0,jg=jf?2:caml_is_printable(je)?1:4;ja[1]=ja[1]+jg|0;var jh=jd+1|0;if(jc!==jd){var jd=jh;continue;}break;}}if(ja[1]===i_.getLen())var ji=i_;else{var jj=caml_create_string(ja[1]);ja[1]=0;var jk=0,jl=i_.getLen()-1|0;if(!(jl<jk)){var jm=jk;for(;;){var jn=i_.safeGet(jm),jo=jn-34|0;if(jo<0||58<jo)if(-20<=jo)var jp=1;else{switch(jo+34|0){case 8:jj.safeSet(ja[1],92);ja[1]+=1;jj.safeSet(ja[1],98);var jq=1;break;case 9:jj.safeSet(ja[1],92);ja[1]+=1;jj.safeSet(ja[1],116);var jq=1;break;case 10:jj.safeSet(ja[1],92);ja[1]+=1;jj.safeSet(ja[1],110);var jq=1;break;case 13:jj.safeSet(ja[1],92);ja[1]+=1;jj.safeSet(ja[1],114);var jq=1;break;default:var jp=1,jq=0;}if(jq)var jp=0;}else var jp=(jo-1|0)<0||56<(jo-1|0)?(jj.safeSet(ja[1],92),ja[1]+=1,jj.safeSet(ja[1],jn),0):1;if(jp)if(caml_is_printable(jn))jj.safeSet(ja[1],jn);else{jj.safeSet(ja[1],92);ja[1]+=1;jj.safeSet(ja[1],48+(jn/100|0)|0);ja[1]+=1;jj.safeSet(ja[1],48+((jn/10|0)%10|0)|0);ja[1]+=1;jj.safeSet(ja[1],48+(jn%10|0)|0);}ja[1]+=1;var jr=jm+1|0;if(jl!==jm){var jm=jr;continue;}break;}}var ji=jj;}var i$=dp(cG,dp(ji,cH));}if(iB===(is+1|0))var js=i$;else{var jt=gV(iq,is,iB,iG);try {var ju=0,jv=1;for(;;){if(jt.getLen()<=jv)var jw=[0,0,ju];else{var jx=jt.safeGet(jv);if(49<=jx)if(58<=jx)var jy=0;else{var jw=[0,caml_int_of_string(fp(jt,jv,(jt.getLen()-jv|0)-1|0)),ju],jy=1;}else{if(45===jx){var jA=jv+1|0,jz=1,ju=jz,jv=jA;continue;}var jy=0;}if(!jy){var jB=jv+1|0,jv=jB;continue;}}var jC=jw;break;}}catch(jD){if(jD[1]!==a)throw jD;var jC=gy(jt,0,115);}var jE=jC[1],jF=i$.getLen(),jG=0,jK=jC[2],jJ=32;if(jE===jF&&0===jG){var jH=i$,jI=1;}else var jI=0;if(!jI)if(jE<=jF)var jH=fp(i$,jG,jF);else{var jL=fo(jE,jJ);if(jK)fq(i$,jG,jL,0,jF);else fq(i$,jG,jL,jE-jF|0,jF);var jH=jL;}var js=jH;}var iU=iT(iH(iL,iE),js,iB+1|0),iP=1;break;case 67:case 99:var jM=iD(iL,iE);if(99===iO)var jN=fo(1,jM);else{if(39===jM)var jO=cW;else if(92===jM)var jO=cX;else{if(14<=jM)var jP=0;else switch(jM){case 8:var jO=c1,jP=1;break;case 9:var jO=c0,jP=1;break;case 10:var jO=cZ,jP=1;break;case 13:var jO=cY,jP=1;break;default:var jP=0;}if(!jP)if(caml_is_printable(jM)){var jQ=caml_create_string(1);jQ.safeSet(0,jM);var jO=jQ;}else{var jR=caml_create_string(4);jR.safeSet(0,92);jR.safeSet(1,48+(jM/100|0)|0);jR.safeSet(2,48+((jM/10|0)%10|0)|0);jR.safeSet(3,48+(jM%10|0)|0);var jO=jR;}}var jN=dp(cE,dp(jO,cF));}var iU=iT(iH(iL,iE),jN,iB+1|0),iP=1;break;case 66:case 98:var jT=iB+1|0,jS=iD(iL,iE)?c5:c4,iU=iT(iH(iL,iE),jS,jT),iP=1;break;case 40:case 123:var jU=iD(iL,iE),jV=hh(hO,iO,iq,iB+1|0);if(123===iO){var jW=gf(jU.getLen()),j0=function(jY,jX){gi(jW,jX);return jY+1|0;};h4(jU,function(jZ,j2,j1){if(jZ)gj(jW,cy);else gi(jW,37);return j0(j2,j1);},j0);var j3=gh(jW),iU=iT(iH(iL,iE),j3,jV),iP=1;}else{var j4=iH(iL,iE),j7=go(j5(jU),j4),iU=j9(function(j8){return j6(j7,jV);},j4,jU,iz),iP=1;}break;case 33:eq(j_,im);var iU=j6(iE,iB+1|0),iP=1;break;case 41:var iU=iT(iE,cK,iB+1|0),iP=1;break;case 44:var iU=iT(iE,cJ,iB+1|0),iP=1;break;case 70:var j$=iD(iL,iE);if(0===iG)var ka=cI;else{var kb=gV(iq,is,iB,iG);if(70===iO)kb.safeSet(kb.getLen()-1|0,103);var ka=kb;}var kc=caml_classify_float(j$);if(3===kc)var kd=j$<0?cC:cB;else if(4<=kc)var kd=cD;else{var ke=caml_format_float(ka,j$),kf=0,kg=ke.getLen();for(;;){if(kg<=kf)var kh=dp(ke,cA);else{var ki=ke.safeGet(kf)-46|0,kj=ki<0||23<ki?55===ki?1:0:(ki-1|0)<0||21<(ki-1|0)?1:0;if(!kj){var kk=kf+1|0,kf=kk;continue;}var kh=ke;}var kd=kh;break;}}var iU=iT(iH(iL,iE),kd,iB+1|0),iP=1;break;case 91:var iU=hn(iq,iB,iO),iP=1;break;case 97:var kl=iD(iL,iE),km=eq(gp,iw(iL,iE)),kn=iD(0,km),kr=iB+1|0,kq=iH(iL,km);if(ko)kp(eD(kl,0,kn));else eD(kl,im,kn);var iU=j6(kq,kr),iP=1;break;case 114:var iU=hn(iq,iB,iO),iP=1;break;case 116:var ks=iD(iL,iE),ku=iB+1|0,kt=iH(iL,iE);if(ko)kp(eq(ks,0));else eq(ks,im);var iU=j6(kt,ku),iP=1;break;default:var iP=0;}if(!iP)var iU=hn(iq,iB,iO);return iU;}},kz=is+1|0,kw=0;return iM(iq,function(ky,kv){return iJ(ky,kx,kw,kv);},kz);}eD(kA,im,iv);var kB=is+1|0,is=kB;continue;}}function iT(kE,kC,kD){kp(kC);return j6(kE,kD);}return j6(kF,0);}var kH=eD(j9,kG,gn(0)),kI=j5(ik);if(kI<0||6<kI){var kV=function(kJ,kP){if(kI<=kJ){var kK=caml_make_vect(kI,0),kN=function(kL,kM){return caml_array_set(kK,(kI-kL|0)-1|0,kM);},kO=0,kQ=kP;for(;;){if(kQ){var kR=kQ[2],kS=kQ[1];if(kR){kN(kO,kS);var kT=kO+1|0,kO=kT,kQ=kR;continue;}kN(kO,kS);}return eD(kH,ik,kK);}}return function(kU){return kV(kJ+1|0,[0,kU,kP]);};},kW=kV(0,0);}else switch(kI){case 1:var kW=function(kY){var kX=caml_make_vect(1,0);caml_array_set(kX,0,kY);return eD(kH,ik,kX);};break;case 2:var kW=function(k0,k1){var kZ=caml_make_vect(2,0);caml_array_set(kZ,0,k0);caml_array_set(kZ,1,k1);return eD(kH,ik,kZ);};break;case 3:var kW=function(k3,k4,k5){var k2=caml_make_vect(3,0);caml_array_set(k2,0,k3);caml_array_set(k2,1,k4);caml_array_set(k2,2,k5);return eD(kH,ik,k2);};break;case 4:var kW=function(k7,k8,k9,k_){var k6=caml_make_vect(4,0);caml_array_set(k6,0,k7);caml_array_set(k6,1,k8);caml_array_set(k6,2,k9);caml_array_set(k6,3,k_);return eD(kH,ik,k6);};break;case 5:var kW=function(la,lb,lc,ld,le){var k$=caml_make_vect(5,0);caml_array_set(k$,0,la);caml_array_set(k$,1,lb);caml_array_set(k$,2,lc);caml_array_set(k$,3,ld);caml_array_set(k$,4,le);return eD(kH,ik,k$);};break;case 6:var kW=function(lg,lh,li,lj,lk,ll){var lf=caml_make_vect(6,0);caml_array_set(lf,0,lg);caml_array_set(lf,1,lh);caml_array_set(lf,2,li);caml_array_set(lf,3,lj);caml_array_set(lf,4,lk);caml_array_set(lf,5,ll);return eD(kH,ik,lf);};break;default:var kW=eD(kH,ik,[0]);}return kW;}function lt(ln){function lp(lm){return 0;}return lr(lq,0,function(lo){return ln;},d_,d4,ef,lp);}function lG(ls){return eD(lt,dA,ls);}function lC(lu){return gf(2*lu.getLen()|0);}function lz(lx,lv){var lw=gh(lv);lv[2]=0;return eq(lx,lw);}function lF(ly){var lB=eq(lz,ly);return lr(lq,1,lC,gi,gj,function(lA){return 0;},lB);}function lH(lE){return eD(lF,function(lD){return lD;},lE);}var lI=[0,0];function lP(lJ,lK){var lL=lJ[lK+1];return caml_obj_is_block(lL)?caml_obj_tag(lL)===fD?eD(lH,b6,lL):caml_obj_tag(lL)===fC?dz(lL):b5:eD(lH,b7,lL);}function lO(lM,lN){if(lM.length-1<=lN)return cp;var lQ=lO(lM,lN+1|0);return hh(lH,co,lP(lM,lN),lQ);}function mj(lS){var lR=lI[1];for(;;){if(lR){var lX=lR[2],lT=lR[1];try {var lU=eq(lT,lS),lV=lU;}catch(lY){var lV=0;}if(!lV){var lR=lX;continue;}var lW=lV[1];}else if(lS[1]===db)var lW=ce;else if(lS[1]===c_)var lW=cd;else if(lS[1]===c$){var lZ=lS[2],l0=lZ[3],lW=lr(lH,g,lZ[1],lZ[2],l0,l0+5|0,cc);}else if(lS[1]===d){var l1=lS[2],l2=l1[3],lW=lr(lH,g,l1[1],l1[2],l2,l2+6|0,cb);}else if(lS[1]===c9){var l3=lS[2],l4=l3[3],lW=lr(lH,g,l3[1],l3[2],l4,l4+6|0,ca);}else{var l5=lS.length-1,l8=lS[0+1][0+1];if(l5<0||2<l5){var l6=lO(lS,2),l7=hh(lH,b$,lP(lS,1),l6);}else switch(l5){case 1:var l7=b9;break;case 2:var l7=eD(lH,b8,lP(lS,1));break;default:var l7=b_;}var lW=dp(l8,l7);}return lW;}}function mk(mg){var l9=caml_convert_raw_backtrace(caml_get_exception_raw_backtrace(0));if(l9){var l_=l9[1],l$=0,ma=l_.length-1-1|0;if(!(ma<l$)){var mb=l$;for(;;){if(caml_notequal(caml_array_get(l_,mb),cn)){var mc=caml_array_get(l_,mb),md=0===mc[0]?mc[1]:mc[1],me=md?0===mb?ck:cj:0===mb?ci:ch,mf=0===mc[0]?lr(lH,cg,me,mc[2],mc[3],mc[4],mc[5]):eD(lH,cf,me);hh(lt,mg,cm,mf);}var mh=mb+1|0;if(ma!==mb){var mb=mh;continue;}break;}}var mi=0;}else var mi=eD(lt,mg,cl);return mi;}function mo(ml){ml[2]=(ml[2]+1|0)%55|0;var mm=caml_array_get(ml[1],ml[2]),mn=(caml_array_get(ml[1],(ml[2]+24|0)%55|0)+(mm^mm>>>25&31)|0)&1073741823;caml_array_set(ml[1],ml[2],mn);return mn;}32===ft;var mp=[0,b3.slice(),0];try {var mq=caml_sys_getenv(b2),mr=mq;}catch(ms){if(ms[1]!==c)throw ms;try {var mt=caml_sys_getenv(b1),mu=mt;}catch(mv){if(mv[1]!==c)throw mv;var mu=b0;}var mr=mu;}var mw=0,mx=mr.getLen(),mA=82;if(0<=mw&&!(mx<mw))try {var mz=mw;for(;;){if(mx<=mz)throw [0,c];if(mr.safeGet(mz)!==mA){var mD=mz+1|0,mz=mD;continue;}var mB=1,mC=mB,my=1;break;}}catch(mE){if(mE[1]!==c)throw mE;var mC=0,my=1;}else var my=0;if(!my)var mC=dc(cV);var mX=[246,function(mW){var mF=caml_sys_random_seed(0),mG=[0,caml_make_vect(55,0),0],mH=0===mF.length-1?[0,0]:mF,mI=mH.length-1,mJ=0,mK=54;if(!(mK<mJ)){var mL=mJ;for(;;){caml_array_set(mG[1],mL,mL);var mM=mL+1|0;if(mK!==mL){var mL=mM;continue;}break;}}var mN=[0,b4],mO=0,mP=54+dd(55,mI)|0;if(!(mP<mO)){var mQ=mO;for(;;){var mR=mQ%55|0,mS=mN[1],mT=dp(mS,dy(caml_array_get(mH,caml_mod(mQ,mI))));mN[1]=caml_md5_string(mT,0,mT.getLen());var mU=mN[1];caml_array_set(mG[1],mR,(caml_array_get(mG[1],mR)^(((mU.safeGet(0)+(mU.safeGet(1)<<8)|0)+(mU.safeGet(2)<<16)|0)+(mU.safeGet(3)<<24)|0))&1073741823);var mV=mQ+1|0;if(mP!==mQ){var mQ=mV;continue;}break;}}mG[2]=0;return mG;}];function m0(mY,mZ){return 3<=mY.length-1?caml_hash(10,100,mY[3],mZ)&(mY[2].length-1-1|0):caml_mod(caml_hash_univ_param(10,100,mZ),mY[2].length-1);}function nj(m2,m1,m4){var m3=m0(m2,m1);caml_array_set(m2[2],m3,[0,m1,m4,caml_array_get(m2[2],m3)]);m2[1]=m2[1]+1|0;var m5=m2[2].length-1<<1<m2[1]?1:0;if(m5){var m6=m2[2],m7=m6.length-1,m8=m7*2|0,m9=m8<fu?1:0;if(m9){var m_=caml_make_vect(m8,0);m2[2]=m_;var nb=function(m$){if(m$){var na=m$[1],nc=m$[2];nb(m$[3]);var nd=m0(m2,na);return caml_array_set(m_,nd,[0,na,nc,caml_array_get(m_,nd)]);}return 0;},ne=0,nf=m7-1|0;if(!(nf<ne)){var ng=ne;for(;;){nb(caml_array_get(m6,ng));var nh=ng+1|0;if(nf!==ng){var ng=nh;continue;}break;}}var ni=0;}else var ni=m9;return ni;}return m5;}function nm(nl,nk){return caml_register_named_value(nl,nk[0+1]);}try {caml_sys_getenv(bZ);}catch(nn){if(nn[1]!==c)throw nn;}try {caml_sys_getenv(bY);}catch(no){if(no[1]!==c)throw no;}if(caml_string_notequal(fs,bX)&&caml_string_notequal(fs,bW)&&caml_string_notequal(fs,bV))throw [0,d,bU];nm(bQ,[0,[0,bT],bR]);nm(bP,[0,[0,bS]]);pcre_ocaml_init(0);function nv(nr,np){var nq=251713540<=np?613575188<=np?978885248<=np?979133625<=np?8:16384:946806097<=np?2048:16:426394317===np?2:601676297<=np?1:262144:-405330348<=np?-246639943<=np?-183446928<=np?64:512:-381917576<=np?8192:4096:-459022792<=np?4:32;return nq|nr;}function nw(nu,ns){var nt=-466207028===ns?128:-360666271<=ns?613575188<=ns?16:32768:-466057841<=ns?256:1024;return nt|nu;}pcre_version_stub(0);pcre_config_utf8_stub(0);pcre_config_newline_stub(0);pcre_config_link_size_stub(0);pcre_config_match_limit_stub(0);pcre_config_match_limit_recursion_stub(0);pcre_config_stackrecurse_stub(0);function nI(nx,nF,nH,nz,nB,nD,nC){var ny=nx?nx[1]:1,nA=nz?nz[1]:0,nE=nB?pcre_compile_stub(e1(nv,0,nB[1]),nD,nC):pcre_compile_stub(nA,nD,nC);if(ny)pcre_study_stub(nE);var nG=nF?pcre_set_imp_match_limit_stub(nE,nF[1]):nE;return nH?pcre_set_imp_match_limit_recursion_stub(nG,nH[1]):nG;}nI(0,0,0,0,0,0,bO);var nJ=[0,bN],nK=48,nL=[0,0],nM=h.getLen()-1|0,nN=0,n8=[0,0];for(;;){if(!(nM<nN))try {if(!(nM<nN)){var nO=nN;for(;;){if(36===h.safeGet(nO))throw [0,nJ,nO];var nP=nO+1|0;if(nM!==nO){var nO=nP;continue;}break;}}}catch(nQ){if(nQ[1]!==nJ)throw nQ;var nR=nQ[2];if(nR!==nM){var nS=nR+1|0;nN===nR;var nT=h.safeGet(nS);if(58<=nT){if(96===nT){var nU=nS+1|0,nN=nU;continue;}var nV=0;}else if(33<=nT)switch(nT-33|0){case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:var nW=[0,nT-nK|0];try {var nX=nS+1|0;if(!(nM<nX)){var nY=nX;for(;;){var nZ=h.safeGet(nY);if(48<=nZ&&!(57<nZ)){nW[1]=((10*nW[1]|0)+nZ|0)-nK|0;var n1=nY+1|0;if(nM!==nY){var nY=n1;continue;}var n0=1;}else var n0=0;if(!n0)throw [0,nJ,nY];break;}}nL[1]=dd(nW[1],nL[1]);}catch(n2){if(n2[1]===nJ){var n3=n2[2];nL[1]=dd(nW[1],nL[1]);var nN=n3;continue;}throw n2;}var nV=1;break;case 0:var n4=nS+1|0,nN=n4;continue;case 3:var n5=nS+1|0,nN=n5;continue;case 5:var n6=nS+1|0,nN=n6;continue;case 6:var n7=nS+1|0,nN=n7;continue;case 10:n8[1]=1;var n9=nS+1|0,nN=n9;continue;default:var nV=0;}else var nV=0;if(!nV){var nN=nS;continue;}}}e1(nw,0,bM);var n$=function(n_){return nI(0,0,0,0,0,0,n_);};n$(bL);n$(bK);n$(bJ);n$(bI);n$(bH);n$(bG);var oc=function(ob){var oa=[];caml_update_dummy(oa,[0,oa,oa]);return oa;},od=[0,bA],oe=[0,0],om=42,oi=function(of){var og=of[1];{if(3===og[0]){var oh=og[1],oj=oi(oh);if(oj!==oh)of[1]=[3,oj];return oj;}return of;}},on=function(ok){return oi(ok);},oo=[0,function(ol){mj(ol);caml_ml_output_char(dB,10);mk(dB);d6(0);return caml_sys_exit(2);}],oO=function(oq,op){try {var or=eq(oq,op);}catch(os){return eq(oo[1],os);}return or;},oD=function(ox,ot,ov){var ou=ot,ow=ov;for(;;)if(typeof ou==="number")return oy(ox,ow);else switch(ou[0]){case 1:eq(ou[1],ox);return oy(ox,ow);case 2:var oz=ou[1],oA=[0,ou[2],ow],ou=oz,ow=oA;continue;default:var oB=ou[1][1];return oB?(eq(oB[1],ox),oy(ox,ow)):oy(ox,ow);}},oy=function(oE,oC){return oC?oD(oE,oC[1],oC[2]):0;},oQ=function(oF,oH){var oG=oF,oI=oH;for(;;)if(typeof oG==="number")return oK(oI);else switch(oG[0]){case 1:var oJ=oG[1];if(oJ[4]){oJ[4]=0;oJ[1][2]=oJ[2];oJ[2][1]=oJ[1];}return oK(oI);case 2:var oL=oG[1],oM=[0,oG[2],oI],oG=oL,oI=oM;continue;default:var oN=oG[2];oe[1]=oG[1];oO(oN,0);return oK(oI);}},oK=function(oP){return oP?oQ(oP[1],oP[2]):0;},oU=function(oS,oR){var oT=1===oR[0]?oR[1][1]===od?(oQ(oS[4],0),1):0:0;return oD(oR,oS[2],0);},oV=[0,0],oW=[0,0,0],ph=function(oZ,oX){var oY=[0,oX],o0=oi(oZ),o1=o0[1];switch(o1[0]){case 1:if(o1[1][1]===od){var o2=0,o3=1;}else var o3=0;break;case 2:var o4=o1[1];o0[1]=oY;var o5=oe[1],o6=oV[1]?1:(oV[1]=1,0);oU(o4,oY);if(o6){oe[1]=o5;var o7=0;}else for(;;){if(0!==oW[1]){if(0===oW[1])throw [0,fY];oW[1]=oW[1]-1|0;var o8=oW[2],o9=o8[2];if(o9===o8)oW[2]=0;else o8[2]=o9[2];var o_=o9[1];oU(o_[1],o_[2]);continue;}oV[1]=0;oe[1]=o5;var o7=0;break;}var o2=o7,o3=1;break;default:var o3=0;}if(!o3)var o2=dc(bB);return o2;},pf=function(o$,pa){return typeof o$==="number"?pa:typeof pa==="number"?o$:[2,o$,pa];},pc=function(pb){if(typeof pb!=="number")switch(pb[0]){case 2:var pd=pb[1],pe=pc(pb[2]);return pf(pc(pd),pe);case 1:break;default:if(!pb[1][1])return 0;}return pb;},pj=[0,function(pg){return 0;}],pi=oc(0),pm=[0,0],pr=null,ps=undefined,pw=function(pq){var pk=1-(pi[2]===pi?1:0);if(pk){var pl=oc(0);pl[1][2]=pi[2];pi[2][1]=pl[1];pl[1]=pi[1];pi[1][2]=pl;pi[1]=pi;pi[2]=pi;pm[1]=0;var pn=pl[2];for(;;){var po=pn!==pl?1:0;if(po){if(pn[4])ph(pn[3],0);var pp=pn[2],pn=pp;continue;}return po;}}return pk;},pv=function(pt,pu){return pt==pr?0:eq(pu,pt);},px=true,py=Array,pA=function(pz){return pz instanceof py?0:[0,new MlWrappedString(pz.toString())];};lI[1]=[0,pA,lI[1]];var pI=function(pB,pC){pB.appendChild(pC);return 0;},pJ=function(pE){return caml_js_wrap_callback(function(pD){if(pD){var pF=eq(pE,pD);if(!(pF|0))pD.preventDefault();return pF;}var pG=event,pH=eq(pE,pG);if(!(pH|0))pG.returnValue=pH;return pH;});},pK=this,pL=pK.document,pR=bo.toString(),pQ=function(pM,pN){return pM?eq(pN,pM[1]):0;},pS=function(pP,pO){return pP.createElement(pO.toString());},pT=[0,785140586],pU=[0,bn];this.HTMLElement===ps;var pV=2147483,pX=caml_js_get_console(0);pj[1]=function(pW){return 1===pW?(pK.setTimeout(caml_js_wrap_callback(pw),0),0):0;};var pZ=function(pY){return pX.log(pY.toString());};oo[1]=function(p0){pZ(bm);pZ(mj(p0));return mk(dB);};var p1=0,p6=0,p5=0,p4=0,p3=0,p2=p1?p1[1]:mC,p7=16;for(;;){if(!(p3<=p7)&&!(fu<(p7*2|0))){var p8=p7*2|0,p7=p8;continue;}if(p2){var p9=caml_obj_tag(mX);if(250===p9)var p_=mX[1];else if(246===p9){var p$=mX[0+1];mX[0+1]=gg;try {var qa=eq(p$,0);mX[0+1]=qa;caml_obj_set_tag(mX,fE);}catch(qb){mX[0+1]=function(qc){throw qb;};throw qb;}var p_=qa;}else var p_=mX;var qd=mo(p_);}else var qd=0;var qe=[0,0,caml_make_vect(p7,0),qd,p7];e0(function(qf){var qg=qf[3],qh=qf[2];nj(qe,dp(qf[1],bl),qg);var qi=0<qh?1:0;return qi?nj(qe,dp(bj,dp(dy(qh),bk)),qg):qi;},bi);var qk=[0,aP],qm=[0,function(qj){throw [0,d,aQ];}],qN=[0,function(ql){throw [0,d,aR];}];qN[1]=function(qn){{if(0===qn[0]){var qo=qn[4],qp=typeof qo==="number"?0===qo?a3:a2:0===qo[0]?eD(lH,a1,qo[1]):eD(lH,a0,qo[1]),qq=qn[3];if(typeof qq==="number")switch(qq){case 1:var qr=aY;break;case 2:var qr=aX;break;case 3:var qr=aW;break;default:var qr=aZ;}else var qr=eD(lH,aU,fr(aV,qq[1]));return qs(lH,aT,qn[1],qn[2],qr,qp);}var qv=function(qt){var qu=qt;for(;;)if(typeof qu==="number")return bh;else switch(qu[0]){case 1:return eD(lH,bg,qv(qu[1]));case 2:return eD(lH,bf,qv(qu[1]));case 3:return eD(lH,be,qv(qu[1]));case 4:var qw=qu[1];if(qw&&!qw[2]){var qx=qw[1],qu=qx;continue;}return eD(lH,bc,fr(bd,es(qv,qw)));case 5:var qy=qu[1];if(qy&&!qy[2]){var qz=qy[1],qu=qz;continue;}return eD(lH,ba,fr(bb,es(qv,qy)));default:return qu[1];}},qA=qn[2];if(typeof qA==="number")var qB=0===qA?a6:a7;else{var qC=qA[1],qE=function(qD){if(typeof qD!=="number")switch(qD[0]){case 1:return eD(lH,a$,qE(qD[1]));case 2:return eD(lH,a_,qE(qD[1]));case 3:return eD(lH,a9,qE(qD[1]));default:}return a8;},qF=qC;for(;;){if(typeof qF==="number")var qH=0;else switch(qF[0]){case 4:var qG=qF[1],qH=qG?qG[2]?2:1:2;break;case 5:var qI=qF[1],qH=qI?qI[2]?2:1:2;break;case 0:var qH=0;break;default:var qJ=qF[1],qF=qJ;continue;}switch(qH){case 1:var qK=[0,qF,0];break;case 2:var qK=[0,qF,1];break;default:var qK=[0,qF,0];}if(0===qK[2]){var qL=qE(qC),qB=hh(lH,a4,qv(qF),qL);}else{var qM=qE(qC),qB=hh(lH,a5,qv(qF),qM);}break;}}return hh(lH,aS,qn[1],qB);}};var qQ=[0,function(qO){throw [0,d,aM];}],qS=[0,function(qP){throw [0,d,aN];}],qT=[0,aK],q2=[0,function(qR){throw [0,d,aO];}],q1=[0,aL],qV=function(qU){return [0,p5,p4,p6,qU[11][4]];},q3=function(qX,qW){return [0,qk,[0,qX,qV(qW)]];},q4=function(qY){return [0,qT,qY];};qQ[1]=function(q0,qZ){return [0,q1,[0,q0,qV(qZ)]];};q2[1]=q4;qS[1]=q3;qm[1]=function(q5){return [0,qT,q5];};var rn=aH.slice(),rm=[0,258,259,0],rl=26,ro=function(q6){throw [0,fF,fU(q6,0)];},rp=function(q7){return [0,fU(q7,0)];},rq=function(q8){return [2,[0,fU(q8,0)],aI];},rr=function(q9){return [5,fU(q9,0)];},rs=function(q_){return [1,[0,[0,0,0,[0,[0,0,0,[0,[0,fU(q_,1)],0]]]]]];},rt=function(q$){var ra=fU(q$,3);return [0,ra,[0,fU(q$,1)]];},ru=function(rb){var rc=fU(rb,2);return [0,rc,fU(rb,0)];},rv=function(rd){return 0;},rw=function(re){var rf=fU(re,4);return [1,rf,fU(re,2)];},rx=function(rg){var rh=fU(rg,1);return [0,rh,fU(rg,0)];},ry=function(ri){return 0;},rz=function(rj){return [0,0,fU(rj,1)];},rA=[0,[0,function(rk){return n(aJ);},rz,ry,rx,rw,rv,ru,rt,rs,rr,rq,rp,ro],rn,rm,aG,aF,aE,aD,aC,aB,aA,rl,az,ay,fZ,ax,aw],rG=function(rC){var rB=0;for(;;){var rD=caml_lex_engine(au,rB,rC);if(0<=rD){rC[11]=rC[12];var rE=rC[12];rC[12]=[0,rE[1],rE[2],rE[3],rC[4]+rC[6]|0];}if(rD<0||13<rD){eq(rC[1],rC);var rB=rD;continue;}switch(rD){case 1:var rF=rC[12];rC[12]=[0,rF[1],rF[2]+1|0,rF[4],rF[4]];var rH=rG(rC);break;case 2:var rH=3;break;case 3:var rH=4;break;case 4:var rH=5;break;case 5:var rH=0;break;case 6:var rH=6;break;case 7:var rH=2;break;case 8:var rH=7;break;case 9:var rH=8;break;case 10:var rH=[1,caml_float_of_string(fB(rC,rC[5],rC[6]))];break;case 11:var rH=[0,fB(rC,rC[5],rC[6])];break;case 12:var rH=1;break;case 13:var rH=n(eD(lH,av,rC[2].safeGet(rC[5])));break;default:var rH=rG(rC);}return rH;}},rM=function(rJ,rI){return [1,1,rJ,rI];},rN=function(rL,rK){return [1,2,rL,rK];},rO=[],rS=[];caml_update_dummy(rS,function(rQ,rP){{if(0===rP[0])return dp(ah,dp(eq(rQ,rP[1]),ai));var rR=rP[1];return dp(ae,dp(rR,dp(af,dp(dp(ab,dp(fr(ac,es(rO,rP[2])),ad)),ag))));}});caml_update_dummy(rO,function(rT){if(typeof rT==="number")return 0===rT?at:as;else switch(rT[0]){case 1:var rV=rT[2],rU=rT[1],rX=dp(eq(rO,rT[3]),aq);switch(rU){case 1:var rW=am;break;case 2:var rW=al;break;case 3:var rW=ak;break;case 4:var rW=aj;break;default:var rW=an;}var rY=dp(rW,rX);return dp(ap,dp(eq(rO,rV),rY));case 2:return dp(ao,dy(rT[1]));default:return dp(ar,dz(rT[1]));}});var rZ=Math.acos(-1),r8=function(r0){return 2*rZ*r0/360;},vH=function(r2,r1){return [0,r2[1]+r1[1],r2[2]+r1[2]];},vG=function(r3,r4){return [0,r3[1]*r4,r3[2]*r4];},t1=function(r5,r7){{if(0===r5[0]){var r6=r5[1];{if(0===r7[0])return [0,r6+r7[1]];var r9=r7[1];return [1,r8(r6)+r9];}}var r_=r5[1];return 0===r7[0]?[1,r_+r8(r7[1])]:[1,r_+r7[1]];}},sa=function(r$){return 0===r$[0]?r8(r$[1]):r$[1];},vE=function(sb){var sc=sa(sb);return [0,Math.sin(sc),Math.cos(sc)];},st=function(sd){switch(sd){case 1:return function(se,sf){return se-sf;};case 2:return function(sg,sh){return sg*sh;};case 3:return function(si,sj){return si/sj;};case 4:return function(sl,sk){return caml_mod(sl|0,sk|0);};default:return function(sm,sn){return sm+sn;};}},sp=function(so){if(typeof so==="number"){if(0===so){var su=1073741824,sv=mo(mp);return (sv/su+mo(mp))/su*1;}return 0.5;}else switch(so[0]){case 1:var sr=so[2],sq=so[1],ss=sp(so[3]);return hh(st,sq,sp(sr),ss);case 2:return n(Y);default:return so[1];}},sy=function(sx,sw){if(typeof sw!=="number")switch(sw[0]){case 2:return e2(sw[1],sx);case 0:break;default:var sA=sw[2],sz=sw[1],sB=sy(sx,sw[3]);return [1,sz,sy(sx,sA),sB];}return sw;},sY=function(sD,sC){switch(sC[0]){case 1:return [1,sy(sD,sC[1])];case 2:return [2,sy(sD,sC[1])];case 3:return [3,sy(sD,sC[1])];default:return [0,sy(sD,sC[1])];}},sV=function(sF,sE){switch(sE[0]){case 1:return [1,sy(sF,sE[1])];case 2:return [2,sy(sF,sE[1])];default:return [0,sy(sF,sE[1])];}},sR=function(sI,sH,sG){{if(0===sG[0])return [0,eD(sI,sH,sG[1])];var sK=sG[2],sJ=sG[1];return [1,sJ,es(eq(sy,sH),sK)];}},s1=function(sN,sM,sL){return sL?[0,eD(sN,sM,sL[1])]:0;},s4=function(sO){return eq(es,eq(sP,sO));},sP=function(sS,sQ){if(typeof sQ==="number")return 0;else switch(sQ[0]){case 1:return [1,sR(sT,sS,sQ[1])];case 2:var sU=sQ[1],sW=sy(sS,sQ[2]);return [2,sV(sS,sU),sW];case 3:var sX=sQ[1],sZ=sy(sS,sQ[2]);return [3,sY(sS,sX),sZ];case 4:var s0=sQ[1],s2=sy(sS,sQ[3]),s3=s1(sy,sS,s0);return [4,s1(sy,sS,s0),s3,s2];case 5:return [5,sy(sS,sQ[1])];case 6:return [6,sR(s4,sS,sQ[1])];default:var s5=sQ[1],s6=sR(s4,sS,sQ[2]);return [0,sy(sS,s5),s6];}},sT=function(s8,s7){var s$=s7[2],s_=s7[1],ta=sR(s9,s8,s7[3]),tb=s1(sV,s8,s$);return [0,s1(sY,s8,s_),tb,ta];},s9=function(td,tc){var tg=tc[3],tf=tc[2],te=tc[1],th=es(eD(sR,s4,td),tg),ti=s1(sV,td,tf);return [0,s1(sY,td,te),ti,th];},ts=function(tl){var tj=[0,0];return es(function(tk){tj[1]+=1;return [0,tj[1],tk];},tl);},tw=function(to,tt,tm){{if(0===tm[0])return [0,tm[1],0];var tn=tm[1],tp=tm[2],tr=e2(tn,to),tu=[0,tn];return [0,eD(tt,ts(es(function(tq){return [0,sp(tq)];},tp)),tr),tu];}},tQ=function(tv){return eD(tw,tv[5],s4);},uI=function(tx){return eD(tw,tx[6],s9);},tG=function(ty){return eD(tw,ty[7],sT);},vf=function(tA,tz){return tz[3]+(tA[1]-tz[1]|0)*(tz[4]-tz[3])/(tz[2]-tz[1]|0);},tC=function(tB,tD){return 0<=tB?0===tB?0:[0,tD,tC(tB-1|0,tD)]:dc(X);},tS=function(tF,tH,tE){if(typeof tE==="number")return [0,0,tH];else switch(tE[0]){case 1:return [0,[3,eD(tG,tF,tE[1])[1]],tH];case 2:return [0,[4,tE[1],tE[2]],tH];case 3:return [0,[6,tE[1],tE[2]],tH];case 4:var tM=tE[3],tL=tE[2],tK=tE[1],tJ=function(tI){return tI?tI[1]:W;},tN=tJ(tL);return [0,[8,tJ(tK),tN,tM],tH];case 5:return [0,[1,tE[1]],tH];case 6:var tO=tE[1];return 0===tO[0]?tP(tF,tO[1],tH):[0,[10,tO[1],tO[2]],tH];default:var tR=tE[1];return [0,[0,tR,eD(tQ,tF,tE[2])[1]],tH];}},tP=function(tV,tX,tW){return eH(function(tT,tU){return tS(tV,tU,tT);},tX,tW);},uU=function(t3,tZ,tY){switch(tY[0]){case 1:var t0=tZ[6];return t1([0,sp(tY[1])],t0);case 2:var t2=tZ[5],t4=t3[2],t5=[1,Math.atan2(t4[1]-t2[1],t4[2]-t2[2])];return t1([0,sp(tY[1])],t5);case 3:var t6=tZ[3];return t1([0,sp(tY[1])],t6);default:return [0,sp(tY[1])];}},uW=function(t8,t7){switch(t7[0]){case 1:var t9=t8[2];return sp(t7[1])+t9;case 2:var t_=t8[7];return sp(t7[1])+t_;default:return sp(t7[1]);}},uP=function(t$,ua,ub){return t$?t$[1]:ua?ua[1]:ub;},us=function(uo,uc){var ur=uc[4],ut=eD(e3,function(ud){var ue=0===ud[4]?1:0;if(ue){var uf=ud[8];if(uf){var ug=uf,uh=0;}else{var ui=ud[5],uj=ui[2],uk=ui[1],ul=uk<0?1:0;if(ul)var um=ul;else{var un=uj<0?1:0;if(un)var um=un;else{var up=uo[3]<=uk?1:0,um=up?up:uo[3]<=uj?1:0;}}var uq=um,uh=1;}}else{var ug=ue,uh=0;}if(!uh)var uq=ug;return 1-uq;},ur),uv=es(eq(us,uo),ut),uu=uc.slice();uu[4]=uv;var uw=uu;for(;;){var ux=uw[1];if(ux){var uy=ux[1];if(typeof uy==="number"){var vW=uw.slice();vW[1]=0;vW[8]=1;var uw=vW;continue;}else switch(uy[0]){case 1:var uz=ux[2],uB=sp(uy[1])|0,uA=uw.slice();uA[1]=[0,[2,uB],uz];var uw=uA;continue;case 2:var uC=uy[1];if(0===uC){var uD=uw.slice();uD[1]=ux[2];var uw=uD;continue;}if(1===uC){var uE=uw.slice();uE[1]=ux[2];var uF=uE;}else{var uG=uw.slice();uG[1]=[0,[2,uC-1|0],ux[2]];var uF=uG;}break;case 3:var uH=uy[1],uM=ux[2],uL=uH[2],uK=uH[1],uJ=eD(uI,uo,uH[3]),uN=uJ[2],uO=uJ[1],uS=uO[3],uR=uO[2],uQ=uP(uO[1],uK,V),uT=uP(uR,uL,U),uV=uU(uo,uw,uQ),uX=uW(uw,uT),uZ=tP(uo,es(function(uY){return [6,uY];},uS),0),u0=[0,uZ,uX,uV,0,uw[5],uw[6],uw[7],uw[8],uw[9]];if(uN){var u1=uN[1];try {var u3=e2(u1,uo[8]),u2=u0.slice();u2[9]=eq(u3,u0[9]);var u4=u2;}catch(u5){if(u5[1]!==c)throw u5;var u4=u0;}}else var u4=u0;var u6=1===uQ[0]?uV:uw[6],u7=2===uT[0]?uX:uw[7],uF=[0,uM,uw[2],uw[3],[0,u4,uw[4]],uw[5],u6,u7,uw[8],uw[9]];break;case 4:var u9=ux[2],u8=uy[2],u_=uW(uw,uy[1]),u$=sp(u8)|0,va=uw.slice();va[1]=[0,[5,[0,uo[1]-1|0,(uo[1]+u$|0)-1|0,uw[2],u_]],u9];var uw=va;continue;case 5:var vb=uy[1],vd=ux[2];if(vb[2]<uo[1]){var vc=uw.slice();vc[1]=vd;var uF=vc;}else{var ve=uw.slice();ve[2]=vf(uo,vb);var uF=ve;}break;case 6:var vh=ux[2],vg=uy[2],vi=uU(uo,uw,uy[1]),vj=sp(vg)|0,vk=sa(vi),vl=sa(uw[3]),vm=uw.slice();vm[1]=[0,[7,[0,uo[1]-1|0,(uo[1]+vj|0)-1|0,vl,vk]],vh];var uw=vm;continue;case 7:var vn=uy[1],vp=ux[2];if(vn[2]<uo[1]){var vo=uw.slice();vo[1]=vp;var uF=vo;}else{var vr=[1,vf(uo,vn)],vq=uw.slice();vq[3]=vr;var uF=vq;}break;case 8:var vu=ux[2],vt=uy[3],vs=uy[2],vv=sp(uy[1]),vw=sp(vs),vy=sp(vt),vx=uw.slice();vx[1]=[0,[9,[0,vv,vw,vy|0]],vu];var uw=vx;continue;case 9:var vz=ux[2],vA=uy[1],vB=vA[3],vC=vA[2],vD=vA[1];if(!(0<vB)){var vL=uw.slice();vL[1]=vz;var uw=vL;continue;}var vF=uw[2],vI=vH(vG(vE(uw[3]),vF),[0,vD,vC]),vJ=vI[2],vK=vI[1],uF=[0,[0,[9,[0,vD,vC,vB-1|0]],vz],caml_hypot_float(vK,vJ),[1,Math.atan2(vK,vJ)],uw[4],uw[5],uw[6],uw[7],uw[8],uw[9]];break;case 10:var vN=ux[2],vM=uy[2],vP=e2(uy[1],uo[5]),vR=eD(s4,ts(es(function(vO){return [0,sp(vO)];},vM)),vP),vQ=uw.slice();vQ[1]=tP(uo,vR,vN);var uw=vQ;continue;default:var vT=ux[2],vS=uy[2],vV=sp(uy[1])|0,vU=uw.slice();vU[1]=tP(uo,em(tC(vV,vS)),vT);var uw=vU;continue;}}else var uF=uw;var vX=uF.slice(),vY=uF[2],vZ=vG(vE(uF[3]),vY);vX[5]=vH(uF[5],vZ);return vX;}},v1=function(v0){return dv([0,v0,0],em(es(v1,v0[4])));},wo=function(v2,wk,wn){var v3=[0,0],v4=[0,0],v5=[0,0],v7=v2[2];e0(function(v6){switch(v6[0]){case 1:v3[1]=[0,[0,v6[1],v6[2]],v3[1]];return 0;case 2:v5[1]=[0,[0,v6[1],v6[2]],v5[1]];return 0;default:v4[1]=[0,[0,v6[1],v6[2]],v4[1]];return 0;}},v7);var v8=v5[1],v9=v4[1],v_=v3[1];function wb(wa){return fr(T,es(function(v$){return v$[1];},wa));}var wc=wb(v8),wd=wb(v9);we(lG,S,wb(v_),wd,wc);var wf=R;for(;;){if(wf){var wg=wf[1],wj=wf[2];try {var wh=e2(wg,v_);}catch(wi){if(wi[1]===c){var wf=wj;continue;}throw wi;}var wl=[0,0,wk[1],wk[3],wk[4],v_,v9,v8,0],wm=tS(wl,0,[6,[0,wh]]);return [0,wl,[0,wm,0,P,0,wk[2],Q,0,0,wn],wg];}throw [0,c];}},wp=[0,0],wq=[0,[0,A,[0,0,B,[0,C,[0,[0,[0,[0,D,[0,[0,[3,E,rM(F,rN(1,G))],H]]],0]],0]]]],0],wr=rN(0,w),ws=[0,[0,r,[0,[1,s,[0,[0,t,[0,[0,[1,[0,[0,[0,[2,[1,0,rM(u,v),wr]]],0,x]]],y]]],z]],wq]]],wt=400,wu=300,wv=[0,p],ww=[0,wv[1],q,wt,wu],xN=function(wB,wz){function wy(wx){if(wx===ps)throw [0,d,I];return wx;}var wA=wy(wz.pageX),wC=wy(wz.pageY);wv[1]=[0,wA-wB.offsetLeft|0,wC-wB.offsetTop|0];return px;},wT=function(wD,wK,wH,wF,wE){var wG=4*((wE*wt|0)+wF|0)|0,wJ=wD[3],wI=wD[2];wH[wG+0|0]=wD[1];wH[wG+1|0]=wI;wH[wG+2|0]=wJ;wH[wG+3|0]=255;return 0;},xO=function(wL,wV,wN,wO,wP){var wM=wL?wL[1]:L,wU=wN.data,wS=wO|0,wR=wP|0;return e0(function(wQ){return wT(wM,wV,wU,wS+wQ[1]|0,wR+wQ[2]|0);},K);},xP=function(wW){var wX=new MlWrappedString(wW.value),w7=[0],w6=1,w5=0,w4=0,w3=0,w2=0,w1=0,w0=wX.getLen(),wZ=dp(wX,cR),w8=[0,function(wY){wY[9]=1;return 0;},wZ,w0,w1,w2,w3,w4,w5,w6,w7,f,f],w9=w8[12];w8[12]=[0,aa,w9[2],w9[3],w9[4]];var w_=0;try {var xf=fH[11],xe=fH[14],xd=fH[6],xc=fH[15],xb=fH[7],xa=fH[8],w$=fH[16];fH[6]=fH[14]+1|0;fH[7]=1;fH[10]=w8[12];try {var xg=0,xh=0;for(;;)switch(caml_parse_engine(rA,fH,xg,xh)){case 1:throw [0,fG];case 2:fQ(0);var xj=0,xi=2,xg=xi,xh=xj;continue;case 3:fQ(0);var xl=0,xk=3,xg=xk,xh=xl;continue;case 4:try {var xm=[0,4,eq(caml_array_get(rA[1],fH[13]),fH)],xn=xm;}catch(xo){if(xo[1]!==fG)throw xo;var xn=[0,5,0];}var xq=xn[2],xp=xn[1],xg=xp,xh=xq;continue;case 5:eq(rA[14],cQ);var xs=0,xr=5,xg=xr,xh=xs;continue;default:var xt=rG(w8);fH[9]=w8[11];fH[10]=w8[12];var xu=1,xg=xu,xh=xt;continue;}}catch(xw){var xv=fH[7];fH[11]=xf;fH[14]=xe;fH[6]=xd;fH[15]=xc;fH[7]=xb;fH[8]=xa;fH[16]=w$;if(xw[1]!==fF){fV[1]=function(xz){return caml_obj_is_block(xz)?caml_array_get(rA[3],caml_obj_tag(xz))===xv?1:0:caml_array_get(rA[2],xz)===xv?1:0;};throw xw;}var xx=xw[2],xy=xx;}}catch(xA){if(xA[1]!==fG)throw xA;var xB=w8[11],xC=w8[12],xD=xB[2],xE=xB[4]-xB[3]|0,xF=xC[4]-xC[3]|0;d5(qs(lH,$,xB[1],xD,xE,xF));if(w_){var xG=w_[1];caml_ml_seek_in(xG,0);var xH=1,xI=xD-1|0;if(!(xI<xH)){var xJ=xH;for(;;){d3(xG);var xK=xJ+1|0;if(xI!==xJ){var xJ=xK;continue;}break;}}var xL=d3(xG),xM=fo(xE,32);d5(qs(lH,Z,xL,10,xM,fo((xF-xE|0)+1|0,94)));}var xy=n(_);}ws[1]=xy;wp[1]=1;return 0;},xQ=pS(pL,bp);if(1-(xQ.getContext==pr?1:0)){xQ.width=wt;xQ.height=wu;xQ.onmousemove=pJ(eq(xN,xQ));var xR=0,xS=0;for(;;){if(0===xS&&0===xR){var xT=pS(pL,i),xU=1;}else var xU=0;if(!xU){var xV=pT[1];if(785140586===xV){try {var xW=pL.createElement(bs.toString()),xX=br.toString(),xY=xW.tagName.toLowerCase()===xX?1:0,xZ=xY?xW.name===bq.toString()?1:0:xY,x0=xZ;}catch(x2){var x0=0;}var x1=x0?982028505:-1003883683;pT[1]=x1;continue;}if(982028505<=xV){var x3=new py();x3.push(bv.toString(),i.toString());pQ(xS,function(x4){x3.push(bw.toString(),caml_js_html_escape(x4),bx.toString());return 0;});pQ(xR,function(x5){x3.push(by.toString(),caml_js_html_escape(x5),bz.toString());return 0;});x3.push(bu.toString());var xT=pL.createElement(x3.join(bt.toString()));}else{var x6=pS(pL,i);pQ(xS,function(x7){return x6.type=x7;});pQ(xR,function(x8){return x6.name=x8;});var xT=x6;}}var x_=function(x9){pI(x9,xQ);return pI(x9,xT);};pv(pL.querySelector(o.toString()),x_);xT.onkeyup=pJ(function(ya){pK.setTimeout(caml_js_wrap_callback(function(x$){return xP(xT);}),10);return px;});var yb=pL.querySelectorAll(N.toString()),ye=function(yc){return yc.onclick=pJ(function(yd){xT.innerHTML=yc.innerHTML;xP(xT);return px;});},yf=0,yg=yb.length-1|0;if(!(yg<yf)){var yh=yf;for(;;){pv(yb.item(yh),ye);var yi=yh+1|0;if(yg!==yh){var yh=yi;continue;}break;}}var yj=wo(ws[1],ww,0),ym=yj[2],yl=yj[1];xQ.onclick=pJ(function(yk){wp[1]=1;return px;});var yH=function(yo,yy,zt){var yn=yl.slice();yn[1]=yo;yn[2]=wv[1];var yp=xQ.getContext(pR),yq=yp.getImageData(0,0,wt,wu),yr=0,yv=yq.data;if(!(wt<yr)){var ys=yr;for(;;){var yt=0;if(!(wu<yt)){var yu=yt;for(;;){wT(J,yp,yv,ys,yu);var yw=yu+1|0;if(wu!==yu){var yu=yw;continue;}break;}}var yx=ys+1|0;if(wt!==ys){var ys=yx;continue;}break;}}var yA=v1(yy),yB=[0,0],yE=eD(e3,function(yz){return 1-yz[8];},yA);e0(function(yC){var yD=yC[5];xO(0,yp,yq,yD[1],yD[2]);yB[1]+=1;return 0;},yE);var yF=wv[1],yG=yB[1];xO([0,M],yp,yq,yF[1],yF[2]);yp.putImageData(yq,0,0);yp.fillText(dp(dy(yG),O).toString(),0,10);var yI=wp[1]?(wp[1]=0,eD(yH,1,wo(ws[1],ww,0)[2])):eD(yH,yo+1|0,us(yn,yy)),yJ=[0,[2,[0,1,0,0,0]]],yK=[0,0],yS=0;function yP(yL,yR){var yM=pV<yL?[0,pV,yL-pV]:[0,yL,0],yN=yM[2],yQ=yM[1],yO=yN==0?eq(ph,yJ):eq(yP,yN);yK[1]=[0,pK.setTimeout(caml_js_wrap_callback(yO),yQ*1e3)];return 0;}yP(yS,0);function yV(yU){var yT=yK[1];return yT?pK.clearTimeout(yT[1]):0;}var yW=on(yJ)[1];switch(yW[0]){case 1:var yX=yW[1][1]===od?(oO(yV,0),1):0;break;case 2:var yY=yW[1],yZ=[0,oe[1],yV],y0=yY[4],y1=typeof y0==="number"?yZ:[2,yZ,y0];yY[4]=y1;var yX=1;break;default:var yX=0;}var y2=on(yJ),y3=y2[1];switch(y3[0]){case 1:var y4=[0,y3];break;case 2:var y5=y3[1],y6=[0,[2,[0,[0,[0,y2]],0,0,0]]],y8=oe[1],zq=[1,function(y7){switch(y7[0]){case 0:var y9=y7[1];oe[1]=y8;try {var y_=eq(yI,y9),y$=y_;}catch(za){var y$=[0,[1,za]];}var zb=on(y6),zc=on(y$),zd=zb[1];{if(2===zd[0]){var ze=zd[1];if(zb===zc)var zf=0;else{var zg=zc[1];if(2===zg[0]){var zh=zg[1];zc[1]=[3,zb];ze[1]=zh[1];var zi=pf(ze[2],zh[2]),zj=ze[3]+zh[3]|0;if(om<zj){ze[3]=0;ze[2]=pc(zi);}else{ze[3]=zj;ze[2]=zi;}var zk=zh[4],zl=ze[4],zm=typeof zl==="number"?zk:typeof zk==="number"?zl:[2,zl,zk];ze[4]=zm;var zf=0;}else{zb[1]=zg;var zf=oU(ze,zg);}}return zf;}throw [0,d,bC];}case 1:var zn=on(y6),zo=zn[1];{if(2===zo[0]){var zp=zo[1];zn[1]=y7;return oU(zp,y7);}throw [0,d,bD];}default:throw [0,d,bF];}}],zr=y5[2],zs=typeof zr==="number"?zq:[2,zq,zr];y5[2]=zs;var y4=y6;break;case 3:throw [0,d,bE];default:var y4=eq(yI,y3[1]);}return y4;};yH(1,ym,0);d6(0);return;}}throw [0,pU];}}}());
