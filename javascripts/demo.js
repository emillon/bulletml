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
var caml_global_data = [0];
function caml_failwith (msg) {
  caml_raise_with_string(caml_global_data[3], msg);
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
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[undefined];
    return caml_call_gen(f, args);
  }
}
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b;
}
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
function caml_obj_tag (x) { return (x instanceof Array)?x[0]:1000; }
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_sys_const_word_size () { return 32; }
function caml_update_dummy (x, y) {
  if( typeof y==="function" ) { x.fun = y; return 0; }
  if( y.fun ) { x.fun = y.fun; return 0; }
  var i = y.length; while (i--) x[i] = y[i]; return 0;
}
(function(){function i1(sE,sF,sG,sH,sI,sJ,sK){return sE.length==6?sE(sF,sG,sH,sI,sJ,sK):caml_call_gen(sE,[sF,sG,sH,sI,sJ,sK]);}function q$(sz,sA,sB,sC,sD){return sz.length==4?sz(sA,sB,sC,sD):caml_call_gen(sz,[sA,sB,sC,sD]);}function eR(sv,sw,sx,sy){return sv.length==3?sv(sw,sx,sy):caml_call_gen(sv,[sw,sx,sy]);}function cD(ss,st,su){return ss.length==2?ss(st,su):caml_call_gen(ss,[st,su]);}function cq(sq,sr){return sq.length==1?sq(sr):caml_call_gen(sq,[sr]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=new MlString("File \"%s\", line %d, characters %d-%d: %s"),f=new MlString("");caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var bG=[0,new MlString("Out_of_memory")],bF=[0,new MlString("Match_failure")],bE=[0,new MlString("Stack_overflow")],bD=[0,new MlString("Undefined_recursive_module")],bC=new MlString("%.12g"),bB=new MlString("."),bA=new MlString("%d"),bz=new MlString("true"),by=new MlString("false"),bx=new MlString("Pervasives.do_at_exit"),bw=new MlString("\\b"),bv=new MlString("\\t"),bu=new MlString("\\n"),bt=new MlString("\\r"),bs=new MlString("\\\\"),br=new MlString("\\'"),bq=new MlString(""),bp=new MlString("String.blit"),bo=new MlString("String.sub"),bn=new MlString("Queue.Empty"),bm=new MlString("Buffer.add: cannot grow buffer"),bl=new MlString(""),bk=new MlString(""),bj=new MlString("%.12g"),bi=new MlString("\""),bh=new MlString("\""),bg=new MlString("'"),bf=new MlString("'"),be=new MlString("nan"),bd=new MlString("neg_infinity"),bc=new MlString("infinity"),bb=new MlString("."),ba=new MlString("printf: bad positional specification (0)."),a$=new MlString("%_"),a_=[0,new MlString("printf.ml"),143,8],a9=new MlString("'"),a8=new MlString("Printf: premature end of format string '"),a7=new MlString("'"),a6=new MlString(" in format string '"),a5=new MlString(", at char number "),a4=new MlString("Printf: bad conversion %"),a3=new MlString("Sformat.index_of_int: negative argument "),a2=new MlString(""),a1=new MlString(", %s%s"),a0=[1,1],aZ=new MlString("%s\n"),aY=new MlString("(Program not linked with -g, cannot print stack backtrace)\n"),aX=new MlString("Raised at"),aW=new MlString("Re-raised at"),aV=new MlString("Raised by primitive operation at"),aU=new MlString("Called from"),aT=new MlString("%s file \"%s\", line %d, characters %d-%d"),aS=new MlString("%s unknown location"),aR=new MlString("Out of memory"),aQ=new MlString("Stack overflow"),aP=new MlString("Pattern matching failed"),aO=new MlString("Assertion failed"),aN=new MlString("Undefined recursive module"),aM=new MlString("(%s%s)"),aL=new MlString(""),aK=new MlString(""),aJ=new MlString("(%s)"),aI=new MlString("%d"),aH=new MlString("%S"),aG=new MlString("_"),aF=[0,987910699,495797812,364182224,414272206,318284740,990407751,383018966,270373319,840823159,24560019,536292337,512266505,189156120,730249596,143776328,51606627,140166561,366354223,1003410265,700563762,981890670,913149062,526082594,1021425055,784300257,667753350,630144451,949649812,48546892,415514493,258888527,511570777,89983870,283659902,308386020,242688715,482270760,865188196,1027664170,207196989,193777847,619708188,671350186,149669678,257044018,87658204,558145612,183450813,28133145,901332182,710253903,510646120,652377910,409934019,801085050],aE=new MlString("Pcre.Error"),aD=new MlString("Pcre.Backtrack"),aC=[1,new MlString("")],aB=new MlString("Pcre.Error"),aA=new MlString("Pcre.Backtrack"),az=new MlString("\\s+"),ay=new MlString("Pcre.FoundAt"),ax=[0,613575188,0],aw=new MlString("\\d+"),av=new MlString("0(x|X)[0-9a-fA-F]+"),au=new MlString("0(o|O)[0-7]+"),at=new MlString("0(b|B)[01]+"),as=new MlString("-?\\d+"),ar=new MlString("-?\\d+(\\.\\d*)?((e|E)?(\\+|-)?\\d+)?"),aq=[0,new MlString("src/core/lwt.ml"),648,20],ap=[0,new MlString("src/core/lwt.ml"),651,8],ao=[0,new MlString("src/core/lwt.ml"),498,8],an=[0,new MlString("src/core/lwt.ml"),487,9],am=new MlString("Lwt.wakeup_result"),al=new MlString("Lwt.Canceled"),ak=new MlString("canvas"),aj=new MlString("2d"),ai=new MlString("Dom_html.Canvas_not_available"),ah=new MlString("Exception during Lwt.async: "),ag=new MlString("Rand"),af=new MlString("Rank"),ae=new MlString("Num "),ad=new MlString(")"),ac=new MlString("("),ab=new MlString("Param "),aa=new MlString(" +@ "),$=new MlString(" -@ "),_=new MlString(" *@ "),Z=new MlString(" /@ "),Y=new MlString(" %@ "),X=new MlString(")"),W=new MlString("Direct ("),V=new MlString(")"),U=new MlString("\", "),T=new MlString("Indirect (\""),S=new MlString("]"),R=new MlString("; "),Q=new MlString("["),P=new MlString("Param"),O=[0,new MlString("bulletml/interp.ml"),129,20],N=[0,0],M=[2,[0,0]],L=[0,[0,1]],K=new MlString(", "),J=new MlString("a: %s\nb: %s\nf: %s\n"),I=[0,new MlString("top"),[0,new MlString("top1"),0]],H=new MlString(" bullets"),G=[0,105,210,231],F=[0,250,105,0],E=[0,[0,-2,0],[0,[0,-2,1],[0,[0,-2,2],[0,[0,-2,-1],[0,[0,-1,0],[0,[0,-1,1],[0,[0,-1,2],[0,[0,-1,3],[0,[0,-1,-1],[0,[0,-1,-2],[0,[0,0,0],[0,[0,0,1],[0,[0,0,2],[0,[0,0,3],[0,[0,0,-1],[0,[0,0,-2],[0,[0,1,0],[0,[0,1,1],[0,[0,1,2],[0,[0,1,3],[0,[0,1,-1],[0,[0,1,-2],[0,[0,2,0],[0,[0,2,1],[0,[0,2,2],[0,[0,2,3],[0,[0,2,-1],[0,[0,2,-2],[0,[0,3,0],[0,[0,3,1],[0,[0,3,2],[0,[0,3,-1],0]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],D=[0,255,255,255],C=[0,[5,[0,5]],0],B=[0,30],A=[0,45],z=[2,[0,0]],y=[0,12],x=[0,[0,[2,[0,[0,0.3]],[0,30]],[0,[5,[0,100]],[0,[2,[0,[0,5]],[0,100]],0]]]],w=[0,[0,[0,2]]],v=new MlString("hmgLsr"),u=[0,[5,[0,60]],0],t=[0,[0,[0,8],[0,[0,[5,[0,1]],[0,[1,[0,[0,[0,[1,[0,0]]],0,[1,new MlString("hmgLsr"),0]]]],0]]]],[0,[5,[0,10]],0]],s=[1,new MlString("hmgLsr"),0],r=[0,120],q=[0,60],p=[0,0],o=[0,20],n=new MlString("top"),m=[0,200,100],l=[0,200,250];function k(g){throw [0,a,g];}function bH(h){throw [0,b,h];}function bI(j,i){return caml_greaterequal(j,i)?j:i;}function bT(bJ,bL){var bK=bJ.getLen(),bM=bL.getLen(),bN=caml_create_string(bK+bM|0);caml_blit_string(bJ,0,bN,0,bK);caml_blit_string(bL,0,bN,bK,bM);return bN;}function b2(bO){return caml_format_int(bA,bO);}function b3(bP){var bQ=caml_format_float(bC,bP),bR=0,bS=bQ.getLen();for(;;){if(bS<=bR)var bU=bT(bQ,bB);else{var bV=bQ.safeGet(bR),bW=48<=bV?58<=bV?0:1:45===bV?1:0;if(bW){var bX=bR+1|0,bR=bX;continue;}var bU=bQ;}return bU;}}function bZ(bY,b0){if(bY){var b1=bY[1];return [0,b1,bZ(bY[2],b0)];}return b0;}var b4=caml_ml_open_descriptor_out(2),b$=caml_ml_open_descriptor_out(1);function cb(b6,b5){return caml_ml_output(b6,b5,0,b5.getLen());}function ca(b_){var b7=caml_ml_out_channels_list(0);for(;;){if(b7){var b8=b7[2];try {}catch(b9){}var b7=b8;continue;}return 0;}}caml_register_named_value(bx,ca);function cf(cd,cc){return caml_ml_output_char(cd,cc);}function c0(ce){return caml_ml_flush(ce);}function cZ(cg){var ch=cg,ci=0;for(;;){if(ch){var cj=ch[2],ck=[0,ch[1],ci],ch=cj,ci=ck;continue;}return ci;}}function cm(cl){if(cl){var cn=cl[1];return bZ(cn,cm(cl[2]));}return 0;}function cs(cp,co){if(co){var cr=co[2],ct=cq(cp,co[1]);return [0,ct,cs(cp,cr)];}return 0;}function c1(cw,cu){var cv=cu;for(;;){if(cv){var cx=cv[2];cq(cw,cv[1]);var cv=cx;continue;}return 0;}}function c2(cC,cy,cA){var cz=cy,cB=cA;for(;;){if(cB){var cE=cB[2],cF=cD(cC,cz,cB[1]),cz=cF,cB=cE;continue;}return cz;}}function cH(cJ,cG,cI){if(cG){var cK=cG[1];return cD(cJ,cK,cH(cJ,cG[2],cI));}return cI;}function c3(cO,cL){var cM=cL;for(;;){if(cM){var cN=cM[1],cQ=cM[2],cP=cN[2];if(0===caml_compare(cN[1],cO))return cP;var cM=cQ;continue;}throw [0,c];}}function c4(cX){return cq(function(cR,cT){var cS=cR,cU=cT;for(;;){if(cU){var cV=cU[2],cW=cU[1];if(cq(cX,cW)){var cY=[0,cW,cS],cS=cY,cU=cV;continue;}var cU=cV;continue;}return cZ(cS);}},0);}function dq(c5,c7){var c6=caml_create_string(c5);caml_fill_string(c6,0,c5,c7);return c6;}function dr(c_,c8,c9){if(0<=c8&&0<=c9&&!((c_.getLen()-c9|0)<c8)){var c$=caml_create_string(c9);caml_blit_string(c_,c8,c$,0,c9);return c$;}return bH(bo);}function ds(dc,db,de,dd,da){if(0<=da&&0<=db&&!((dc.getLen()-da|0)<db)&&0<=dd&&!((de.getLen()-da|0)<dd))return caml_blit_string(dc,db,de,dd,da);return bH(bp);}function dt(dl,df){if(df){var dg=df[1],dh=[0,0],di=[0,0],dk=df[2];c1(function(dj){dh[1]+=1;di[1]=di[1]+dj.getLen()|0;return 0;},df);var dm=caml_create_string(di[1]+caml_mul(dl.getLen(),dh[1]-1|0)|0);caml_blit_string(dg,0,dm,0,dg.getLen());var dn=[0,dg.getLen()];c1(function(dp){caml_blit_string(dl,0,dm,dn[1],dl.getLen());dn[1]=dn[1]+dl.getLen()|0;caml_blit_string(dp,0,dm,dn[1],dp.getLen());dn[1]=dn[1]+dp.getLen()|0;return 0;},dk);return dm;}return bq;}var du=caml_sys_const_word_size(0),dv=caml_mul(du/8|0,(1<<(du-10|0))-1|0)-1|0,dQ=252,dP=253,dO=[0,bn];function dN(dw){var dx=1<=dw?dw:1,dy=dv<dx?dv:dx,dz=caml_create_string(dy);return [0,dz,0,dy,dz];}function dR(dA){return dr(dA[1],0,dA[2]);}function dH(dB,dD){var dC=[0,dB[3]];for(;;){if(dC[1]<(dB[2]+dD|0)){dC[1]=2*dC[1]|0;continue;}if(dv<dC[1])if((dB[2]+dD|0)<=dv)dC[1]=dv;else k(bm);var dE=caml_create_string(dC[1]);ds(dB[1],0,dE,0,dB[2]);dB[1]=dE;dB[3]=dC[1];return 0;}}function dS(dF,dI){var dG=dF[2];if(dF[3]<=dG)dH(dF,1);dF[1].safeSet(dG,dI);dF[2]=dG+1|0;return 0;}function dT(dL,dJ){var dK=dJ.getLen(),dM=dL[2]+dK|0;if(dL[3]<dM)dH(dL,dK);ds(dJ,0,dL[1],dL[2],dK);dL[2]=dM;return 0;}function dX(dU){return 0<=dU?dU:k(bT(a3,b2(dU)));}function dY(dV,dW){return dX(dV+dW|0);}var dZ=cq(dY,1);function d6(d0){return dr(d0,0,d0.getLen());}function d8(d1,d2,d4){var d3=bT(a6,bT(d1,a7)),d5=bT(a5,bT(b2(d2),d3));return bH(bT(a4,bT(dq(1,d4),d5)));}function eX(d7,d_,d9){return d8(d6(d7),d_,d9);}function eY(d$){return bH(bT(a8,bT(d6(d$),a9)));}function et(ea,ei,ek,em){function eh(eb){if((ea.safeGet(eb)-48|0)<0||9<(ea.safeGet(eb)-48|0))return eb;var ec=eb+1|0;for(;;){var ed=ea.safeGet(ec);if(48<=ed){if(!(58<=ed)){var ef=ec+1|0,ec=ef;continue;}var ee=0;}else if(36===ed){var eg=ec+1|0,ee=1;}else var ee=0;if(!ee)var eg=eb;return eg;}}var ej=eh(ei+1|0),el=dN((ek-ej|0)+10|0);dS(el,37);var en=ej,eo=cZ(em);for(;;){if(en<=ek){var ep=ea.safeGet(en);if(42===ep){if(eo){var eq=eo[2];dT(el,b2(eo[1]));var er=eh(en+1|0),en=er,eo=eq;continue;}throw [0,d,a_];}dS(el,ep);var es=en+1|0,en=es;continue;}return dR(el);}}function gm(ez,ex,ew,ev,eu){var ey=et(ex,ew,ev,eu);if(78!==ez&&110!==ez)return ey;ey.safeSet(ey.getLen()-1|0,117);return ey;}function eZ(eG,eQ,eV,eA,eU){var eB=eA.getLen();function eS(eC,eP){var eD=40===eC?41:125;function eO(eE){var eF=eE;for(;;){if(eB<=eF)return cq(eG,eA);if(37===eA.safeGet(eF)){var eH=eF+1|0;if(eB<=eH)var eI=cq(eG,eA);else{var eJ=eA.safeGet(eH),eK=eJ-40|0;if(eK<0||1<eK){var eL=eK-83|0;if(eL<0||2<eL)var eM=1;else switch(eL){case 1:var eM=1;break;case 2:var eN=1,eM=0;break;default:var eN=0,eM=0;}if(eM){var eI=eO(eH+1|0),eN=2;}}else var eN=0===eK?0:1;switch(eN){case 1:var eI=eJ===eD?eH+1|0:eR(eQ,eA,eP,eJ);break;case 2:break;default:var eI=eO(eS(eJ,eH+1|0)+1|0);}}return eI;}var eT=eF+1|0,eF=eT;continue;}}return eO(eP);}return eS(eV,eU);}function fm(eW){return eR(eZ,eY,eX,eW);}function fC(e0,e$,fj){var e1=e0.getLen()-1|0;function fk(e2){var e3=e2;a:for(;;){if(e3<e1){if(37===e0.safeGet(e3)){var e4=0,e5=e3+1|0;for(;;){if(e1<e5)var e6=eY(e0);else{var e7=e0.safeGet(e5);if(58<=e7){if(95===e7){var e9=e5+1|0,e8=1,e4=e8,e5=e9;continue;}}else if(32<=e7)switch(e7-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var e_=e5+1|0,e5=e_;continue;case 10:var fa=eR(e$,e4,e5,105),e5=fa;continue;default:var fb=e5+1|0,e5=fb;continue;}var fc=e5;c:for(;;){if(e1<fc)var fd=eY(e0);else{var fe=e0.safeGet(fc);if(126<=fe)var ff=0;else switch(fe){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var fd=eR(e$,e4,fc,105),ff=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var fd=eR(e$,e4,fc,102),ff=1;break;case 33:case 37:case 44:case 64:var fd=fc+1|0,ff=1;break;case 83:case 91:case 115:var fd=eR(e$,e4,fc,115),ff=1;break;case 97:case 114:case 116:var fd=eR(e$,e4,fc,fe),ff=1;break;case 76:case 108:case 110:var fg=fc+1|0;if(e1<fg){var fd=eR(e$,e4,fc,105),ff=1;}else{var fh=e0.safeGet(fg)-88|0;if(fh<0||32<fh)var fi=1;else switch(fh){case 0:case 12:case 17:case 23:case 29:case 32:var fd=cD(fj,eR(e$,e4,fc,fe),105),ff=1,fi=0;break;default:var fi=1;}if(fi){var fd=eR(e$,e4,fc,105),ff=1;}}break;case 67:case 99:var fd=eR(e$,e4,fc,99),ff=1;break;case 66:case 98:var fd=eR(e$,e4,fc,66),ff=1;break;case 41:case 125:var fd=eR(e$,e4,fc,fe),ff=1;break;case 40:var fd=fk(eR(e$,e4,fc,fe)),ff=1;break;case 123:var fl=eR(e$,e4,fc,fe),fn=eR(fm,fe,e0,fl),fo=fl;for(;;){if(fo<(fn-2|0)){var fp=cD(fj,fo,e0.safeGet(fo)),fo=fp;continue;}var fq=fn-1|0,fc=fq;continue c;}default:var ff=0;}if(!ff)var fd=eX(e0,fc,fe);}var e6=fd;break;}}var e3=e6;continue a;}}var fr=e3+1|0,e3=fr;continue;}return e3;}}fk(0);return 0;}function hB(fD){var fs=[0,0,0,0];function fB(fx,fy,ft){var fu=41!==ft?1:0,fv=fu?125!==ft?1:0:fu;if(fv){var fw=97===ft?2:1;if(114===ft)fs[3]=fs[3]+1|0;if(fx)fs[2]=fs[2]+fw|0;else fs[1]=fs[1]+fw|0;}return fy+1|0;}fC(fD,fB,function(fz,fA){return fz+1|0;});return fs[1];}function gi(fE,fH,fF){var fG=fE.safeGet(fF);if((fG-48|0)<0||9<(fG-48|0))return cD(fH,0,fF);var fI=fG-48|0,fJ=fF+1|0;for(;;){var fK=fE.safeGet(fJ);if(48<=fK){if(!(58<=fK)){var fN=fJ+1|0,fM=(10*fI|0)+(fK-48|0)|0,fI=fM,fJ=fN;continue;}var fL=0;}else if(36===fK)if(0===fI){var fO=k(ba),fL=1;}else{var fO=cD(fH,[0,dX(fI-1|0)],fJ+1|0),fL=1;}else var fL=0;if(!fL)var fO=cD(fH,0,fF);return fO;}}function gd(fP,fQ){return fP?fQ:cq(dZ,fQ);}function f4(fR,fS){return fR?fR[1]:fS;}function i0(hW,fU,h8,fX,hG,ic,fT){var fV=cq(fU,fT);function hX(fW){return cD(fX,fV,fW);}function hF(f2,ib,fY,f7){var f1=fY.getLen();function hC(h5,fZ){var f0=fZ;for(;;){if(f1<=f0)return cq(f2,fV);var f3=fY.safeGet(f0);if(37===f3){var f$=function(f6,f5){return caml_array_get(f7,f4(f6,f5));},gf=function(gh,ga,gc,f8){var f9=f8;for(;;){var f_=fY.safeGet(f9)-32|0;if(!(f_<0||25<f_))switch(f_){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return gi(fY,function(gb,gg){var ge=[0,f$(gb,ga),gc];return gf(gh,gd(gb,ga),ge,gg);},f9+1|0);default:var gj=f9+1|0,f9=gj;continue;}var gk=fY.safeGet(f9);if(124<=gk)var gl=0;else switch(gk){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var gn=f$(gh,ga),go=caml_format_int(gm(gk,fY,f0,f9,gc),gn),gq=gp(gd(gh,ga),go,f9+1|0),gl=1;break;case 69:case 71:case 101:case 102:case 103:var gr=f$(gh,ga),gs=caml_format_float(et(fY,f0,f9,gc),gr),gq=gp(gd(gh,ga),gs,f9+1|0),gl=1;break;case 76:case 108:case 110:var gt=fY.safeGet(f9+1|0)-88|0;if(gt<0||32<gt)var gu=1;else switch(gt){case 0:case 12:case 17:case 23:case 29:case 32:var gv=f9+1|0,gw=gk-108|0;if(gw<0||2<gw)var gx=0;else{switch(gw){case 1:var gx=0,gy=0;break;case 2:var gz=f$(gh,ga),gA=caml_format_int(et(fY,f0,gv,gc),gz),gy=1;break;default:var gB=f$(gh,ga),gA=caml_format_int(et(fY,f0,gv,gc),gB),gy=1;}if(gy){var gC=gA,gx=1;}}if(!gx){var gD=f$(gh,ga),gC=caml_int64_format(et(fY,f0,gv,gc),gD);}var gq=gp(gd(gh,ga),gC,gv+1|0),gl=1,gu=0;break;default:var gu=1;}if(gu){var gE=f$(gh,ga),gF=caml_format_int(gm(110,fY,f0,f9,gc),gE),gq=gp(gd(gh,ga),gF,f9+1|0),gl=1;}break;case 37:case 64:var gq=gp(ga,dq(1,gk),f9+1|0),gl=1;break;case 83:case 115:var gG=f$(gh,ga);if(115===gk)var gH=gG;else{var gI=[0,0],gJ=0,gK=gG.getLen()-1|0;if(!(gK<gJ)){var gL=gJ;for(;;){var gM=gG.safeGet(gL),gN=14<=gM?34===gM?1:92===gM?1:0:11<=gM?13<=gM?1:0:8<=gM?1:0,gO=gN?2:caml_is_printable(gM)?1:4;gI[1]=gI[1]+gO|0;var gP=gL+1|0;if(gK!==gL){var gL=gP;continue;}break;}}if(gI[1]===gG.getLen())var gQ=gG;else{var gR=caml_create_string(gI[1]);gI[1]=0;var gS=0,gT=gG.getLen()-1|0;if(!(gT<gS)){var gU=gS;for(;;){var gV=gG.safeGet(gU),gW=gV-34|0;if(gW<0||58<gW)if(-20<=gW)var gX=1;else{switch(gW+34|0){case 8:gR.safeSet(gI[1],92);gI[1]+=1;gR.safeSet(gI[1],98);var gY=1;break;case 9:gR.safeSet(gI[1],92);gI[1]+=1;gR.safeSet(gI[1],116);var gY=1;break;case 10:gR.safeSet(gI[1],92);gI[1]+=1;gR.safeSet(gI[1],110);var gY=1;break;case 13:gR.safeSet(gI[1],92);gI[1]+=1;gR.safeSet(gI[1],114);var gY=1;break;default:var gX=1,gY=0;}if(gY)var gX=0;}else var gX=(gW-1|0)<0||56<(gW-1|0)?(gR.safeSet(gI[1],92),gI[1]+=1,gR.safeSet(gI[1],gV),0):1;if(gX)if(caml_is_printable(gV))gR.safeSet(gI[1],gV);else{gR.safeSet(gI[1],92);gI[1]+=1;gR.safeSet(gI[1],48+(gV/100|0)|0);gI[1]+=1;gR.safeSet(gI[1],48+((gV/10|0)%10|0)|0);gI[1]+=1;gR.safeSet(gI[1],48+(gV%10|0)|0);}gI[1]+=1;var gZ=gU+1|0;if(gT!==gU){var gU=gZ;continue;}break;}}var gQ=gR;}var gH=bT(bh,bT(gQ,bi));}if(f9===(f0+1|0))var g0=gH;else{var g1=et(fY,f0,f9,gc);try {var g2=0,g3=1;for(;;){if(g1.getLen()<=g3)var g4=[0,0,g2];else{var g5=g1.safeGet(g3);if(49<=g5)if(58<=g5)var g6=0;else{var g4=[0,caml_int_of_string(dr(g1,g3,(g1.getLen()-g3|0)-1|0)),g2],g6=1;}else{if(45===g5){var g8=g3+1|0,g7=1,g2=g7,g3=g8;continue;}var g6=0;}if(!g6){var g9=g3+1|0,g3=g9;continue;}}var g_=g4;break;}}catch(g$){if(g$[1]!==a)throw g$;var g_=d8(g1,0,115);}var ha=g_[1],hb=gH.getLen(),hc=0,hg=g_[2],hf=32;if(ha===hb&&0===hc){var hd=gH,he=1;}else var he=0;if(!he)if(ha<=hb)var hd=dr(gH,hc,hb);else{var hh=dq(ha,hf);if(hg)ds(gH,hc,hh,0,hb);else ds(gH,hc,hh,ha-hb|0,hb);var hd=hh;}var g0=hd;}var gq=gp(gd(gh,ga),g0,f9+1|0),gl=1;break;case 67:case 99:var hi=f$(gh,ga);if(99===gk)var hj=dq(1,hi);else{if(39===hi)var hk=br;else if(92===hi)var hk=bs;else{if(14<=hi)var hl=0;else switch(hi){case 8:var hk=bw,hl=1;break;case 9:var hk=bv,hl=1;break;case 10:var hk=bu,hl=1;break;case 13:var hk=bt,hl=1;break;default:var hl=0;}if(!hl)if(caml_is_printable(hi)){var hm=caml_create_string(1);hm.safeSet(0,hi);var hk=hm;}else{var hn=caml_create_string(4);hn.safeSet(0,92);hn.safeSet(1,48+(hi/100|0)|0);hn.safeSet(2,48+((hi/10|0)%10|0)|0);hn.safeSet(3,48+(hi%10|0)|0);var hk=hn;}}var hj=bT(bf,bT(hk,bg));}var gq=gp(gd(gh,ga),hj,f9+1|0),gl=1;break;case 66:case 98:var hp=f9+1|0,ho=f$(gh,ga)?bz:by,gq=gp(gd(gh,ga),ho,hp),gl=1;break;case 40:case 123:var hq=f$(gh,ga),hr=eR(fm,gk,fY,f9+1|0);if(123===gk){var hs=dN(hq.getLen()),hw=function(hu,ht){dS(hs,ht);return hu+1|0;};fC(hq,function(hv,hy,hx){if(hv)dT(hs,a$);else dS(hs,37);return hw(hy,hx);},hw);var hz=dR(hs),gq=gp(gd(gh,ga),hz,hr),gl=1;}else{var hA=gd(gh,ga),hD=dY(hB(hq),hA),gq=hF(function(hE){return hC(hD,hr);},hA,hq,f7),gl=1;}break;case 33:cq(hG,fV);var gq=hC(ga,f9+1|0),gl=1;break;case 41:var gq=gp(ga,bl,f9+1|0),gl=1;break;case 44:var gq=gp(ga,bk,f9+1|0),gl=1;break;case 70:var hH=f$(gh,ga);if(0===gc)var hI=bj;else{var hJ=et(fY,f0,f9,gc);if(70===gk)hJ.safeSet(hJ.getLen()-1|0,103);var hI=hJ;}var hK=caml_classify_float(hH);if(3===hK)var hL=hH<0?bd:bc;else if(4<=hK)var hL=be;else{var hM=caml_format_float(hI,hH),hN=0,hO=hM.getLen();for(;;){if(hO<=hN)var hP=bT(hM,bb);else{var hQ=hM.safeGet(hN)-46|0,hR=hQ<0||23<hQ?55===hQ?1:0:(hQ-1|0)<0||21<(hQ-1|0)?1:0;if(!hR){var hS=hN+1|0,hN=hS;continue;}var hP=hM;}var hL=hP;break;}}var gq=gp(gd(gh,ga),hL,f9+1|0),gl=1;break;case 91:var gq=eX(fY,f9,gk),gl=1;break;case 97:var hT=f$(gh,ga),hU=cq(dZ,f4(gh,ga)),hV=f$(0,hU),hZ=f9+1|0,hY=gd(gh,hU);if(hW)hX(cD(hT,0,hV));else cD(hT,fV,hV);var gq=hC(hY,hZ),gl=1;break;case 114:var gq=eX(fY,f9,gk),gl=1;break;case 116:var h0=f$(gh,ga),h2=f9+1|0,h1=gd(gh,ga);if(hW)hX(cq(h0,0));else cq(h0,fV);var gq=hC(h1,h2),gl=1;break;default:var gl=0;}if(!gl)var gq=eX(fY,f9,gk);return gq;}},h7=f0+1|0,h4=0;return gi(fY,function(h6,h3){return gf(h6,h5,h4,h3);},h7);}cD(h8,fV,f3);var h9=f0+1|0,f0=h9;continue;}}function gp(ia,h_,h$){hX(h_);return hC(ia,h$);}return hC(ib,0);}var id=cD(hF,ic,dX(0)),ie=hB(fT);if(ie<0||6<ie){var it=function(ig,im){if(ie<=ig){var ih=caml_make_vect(ie,0),ik=function(ii,ij){return caml_array_set(ih,(ie-ii|0)-1|0,ij);},il=0,io=im;for(;;){if(io){var ip=io[2],iq=io[1];if(ip){ik(il,iq);var ir=il+1|0,il=ir,io=ip;continue;}ik(il,iq);}return cD(id,fT,ih);}}return function(is){return it(ig+1|0,[0,is,im]);};},iu=it(0,0);}else switch(ie){case 1:var iu=function(iw){var iv=caml_make_vect(1,0);caml_array_set(iv,0,iw);return cD(id,fT,iv);};break;case 2:var iu=function(iy,iz){var ix=caml_make_vect(2,0);caml_array_set(ix,0,iy);caml_array_set(ix,1,iz);return cD(id,fT,ix);};break;case 3:var iu=function(iB,iC,iD){var iA=caml_make_vect(3,0);caml_array_set(iA,0,iB);caml_array_set(iA,1,iC);caml_array_set(iA,2,iD);return cD(id,fT,iA);};break;case 4:var iu=function(iF,iG,iH,iI){var iE=caml_make_vect(4,0);caml_array_set(iE,0,iF);caml_array_set(iE,1,iG);caml_array_set(iE,2,iH);caml_array_set(iE,3,iI);return cD(id,fT,iE);};break;case 5:var iu=function(iK,iL,iM,iN,iO){var iJ=caml_make_vect(5,0);caml_array_set(iJ,0,iK);caml_array_set(iJ,1,iL);caml_array_set(iJ,2,iM);caml_array_set(iJ,3,iN);caml_array_set(iJ,4,iO);return cD(id,fT,iJ);};break;case 6:var iu=function(iQ,iR,iS,iT,iU,iV){var iP=caml_make_vect(6,0);caml_array_set(iP,0,iQ);caml_array_set(iP,1,iR);caml_array_set(iP,2,iS);caml_array_set(iP,3,iT);caml_array_set(iP,4,iU);caml_array_set(iP,5,iV);return cD(id,fT,iP);};break;default:var iu=cD(id,fT,[0]);}return iu;}function i3(iX){function iZ(iW){return 0;}return i1(i0,0,function(iY){return iX;},cf,cb,c0,iZ);}function je(i2){return cD(i3,b$,i2);}function ja(i4){return dN(2*i4.getLen()|0);}function i9(i7,i5){var i6=dR(i5);i5[2]=0;return cq(i7,i6);}function jd(i8){var i$=cq(i9,i8);return i1(i0,1,ja,dS,dT,function(i_){return 0;},i$);}function jf(jc){return cD(jd,function(jb){return jb;},jc);}var jg=[0,0];function jn(jh,ji){var jj=jh[ji+1];return caml_obj_is_block(jj)?caml_obj_tag(jj)===dQ?cD(jf,aH,jj):caml_obj_tag(jj)===dP?b3(jj):aG:cD(jf,aI,jj);}function jm(jk,jl){if(jk.length-1<=jl)return a2;var jo=jm(jk,jl+1|0);return eR(jf,a1,jn(jk,jl),jo);}function jT(jq){var jp=jg[1];for(;;){if(jp){var jv=jp[2],jr=jp[1];try {var js=cq(jr,jq),jt=js;}catch(jw){var jt=0;}if(!jt){var jp=jv;continue;}var ju=jt[1];}else if(jq[1]===bG)var ju=aR;else if(jq[1]===bE)var ju=aQ;else if(jq[1]===bF){var jx=jq[2],jy=jx[3],ju=i1(jf,e,jx[1],jx[2],jy,jy+5|0,aP);}else if(jq[1]===d){var jz=jq[2],jA=jz[3],ju=i1(jf,e,jz[1],jz[2],jA,jA+6|0,aO);}else if(jq[1]===bD){var jB=jq[2],jC=jB[3],ju=i1(jf,e,jB[1],jB[2],jC,jC+6|0,aN);}else{var jD=jq.length-1,jG=jq[0+1][0+1];if(jD<0||2<jD){var jE=jm(jq,2),jF=eR(jf,aM,jn(jq,1),jE);}else switch(jD){case 1:var jF=aK;break;case 2:var jF=cD(jf,aJ,jn(jq,1));break;default:var jF=aL;}var ju=bT(jG,jF);}return ju;}}function jU(jQ){var jH=caml_convert_raw_backtrace(caml_get_exception_raw_backtrace(0));if(jH){var jI=jH[1],jJ=0,jK=jI.length-1-1|0;if(!(jK<jJ)){var jL=jJ;for(;;){if(caml_notequal(caml_array_get(jI,jL),a0)){var jM=caml_array_get(jI,jL),jN=0===jM[0]?jM[1]:jM[1],jO=jN?0===jL?aX:aW:0===jL?aV:aU,jP=0===jM[0]?i1(jf,aT,jO,jM[2],jM[3],jM[4],jM[5]):cD(jf,aS,jO);eR(i3,jQ,aZ,jP);}var jR=jL+1|0;if(jK!==jL){var jL=jR;continue;}break;}}var jS=0;}else var jS=cD(i3,jQ,aY);return jS;}function jY(jV){jV[2]=(jV[2]+1|0)%55|0;var jW=caml_array_get(jV[1],jV[2]),jX=(caml_array_get(jV[1],(jV[2]+24|0)%55|0)+(jW^jW>>>25&31)|0)&1073741823;caml_array_set(jV[1],jV[2],jX);return jX;}32===du;var jZ=[0,aF.slice(),0];function j2(j1,j0){return caml_register_named_value(j1,j0[0+1]);}j2(aB,[0,[0,aE],aC]);j2(aA,[0,[0,aD]]);pcre_ocaml_init(0);function j9(j5,j3){var j4=251713540<=j3?613575188<=j3?978885248<=j3?979133625<=j3?8:16384:946806097<=j3?2048:16:426394317===j3?2:601676297<=j3?1:262144:-405330348<=j3?-246639943<=j3?-183446928<=j3?64:512:-381917576<=j3?8192:4096:-459022792<=j3?4:32;return j4|j5;}function j_(j8,j6){var j7=-466207028===j6?128:-360666271<=j6?613575188<=j6?16:32768:-466057841<=j6?256:1024;return j7|j8;}pcre_version_stub(0);pcre_config_utf8_stub(0);pcre_config_newline_stub(0);pcre_config_link_size_stub(0);pcre_config_match_limit_stub(0);pcre_config_match_limit_recursion_stub(0);pcre_config_stackrecurse_stub(0);function kk(j$,kh,kj,kb,kd,kf,ke){var ka=j$?j$[1]:1,kc=kb?kb[1]:0,kg=kd?pcre_compile_stub(c2(j9,0,kd[1]),kf,ke):pcre_compile_stub(kc,kf,ke);if(ka)pcre_study_stub(kg);var ki=kh?pcre_set_imp_match_limit_stub(kg,kh[1]):kg;return kj?pcre_set_imp_match_limit_recursion_stub(ki,kj[1]):ki;}kk(0,0,0,0,0,0,az);var kl=[0,ay],km=48,kn=[0,0],ko=f.getLen()-1|0,kp=0,kK=[0,0];for(;;){if(!(ko<kp))try {if(!(ko<kp)){var kq=kp;for(;;){if(36===f.safeGet(kq))throw [0,kl,kq];var kr=kq+1|0;if(ko!==kq){var kq=kr;continue;}break;}}}catch(ks){if(ks[1]!==kl)throw ks;var kt=ks[2];if(kt!==ko){var ku=kt+1|0;kp===kt;var kv=f.safeGet(ku);if(58<=kv){if(96===kv){var kw=ku+1|0,kp=kw;continue;}var kx=0;}else if(33<=kv)switch(kv-33|0){case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:var ky=[0,kv-km|0];try {var kz=ku+1|0;if(!(ko<kz)){var kA=kz;for(;;){var kB=f.safeGet(kA);if(48<=kB&&!(57<kB)){ky[1]=((10*ky[1]|0)+kB|0)-km|0;var kD=kA+1|0;if(ko!==kA){var kA=kD;continue;}var kC=1;}else var kC=0;if(!kC)throw [0,kl,kA];break;}}kn[1]=bI(ky[1],kn[1]);}catch(kE){if(kE[1]===kl){var kF=kE[2];kn[1]=bI(ky[1],kn[1]);var kp=kF;continue;}throw kE;}var kx=1;break;case 0:var kG=ku+1|0,kp=kG;continue;case 3:var kH=ku+1|0,kp=kH;continue;case 5:var kI=ku+1|0,kp=kI;continue;case 6:var kJ=ku+1|0,kp=kJ;continue;case 10:kK[1]=1;var kL=ku+1|0,kp=kL;continue;default:var kx=0;}else var kx=0;if(!kx){var kp=ku;continue;}}}c2(j_,0,ax);var kN=function(kM){return kk(0,0,0,0,0,0,kM);};kN(aw);kN(av);kN(au);kN(at);kN(as);kN(ar);var kQ=function(kP){var kO=[];caml_update_dummy(kO,[0,kO,kO]);return kO;},kR=[0,al],kS=[0,0],k0=42,kW=function(kT){var kU=kT[1];{if(3===kU[0]){var kV=kU[1],kX=kW(kV);if(kX!==kV)kT[1]=[3,kX];return kX;}return kT;}},k1=function(kY){return kW(kY);},k2=[0,function(kZ){jT(kZ);caml_ml_output_char(b4,10);jU(b4);ca(0);return caml_sys_exit(2);}],lq=function(k4,k3){try {var k5=cq(k4,k3);}catch(k6){return cq(k2[1],k6);}return k5;},lf=function(k$,k7,k9){var k8=k7,k_=k9;for(;;)if(typeof k8==="number")return la(k$,k_);else switch(k8[0]){case 1:cq(k8[1],k$);return la(k$,k_);case 2:var lb=k8[1],lc=[0,k8[2],k_],k8=lb,k_=lc;continue;default:var ld=k8[1][1];return ld?(cq(ld[1],k$),la(k$,k_)):la(k$,k_);}},la=function(lg,le){return le?lf(lg,le[1],le[2]):0;},ls=function(lh,lj){var li=lh,lk=lj;for(;;)if(typeof li==="number")return lm(lk);else switch(li[0]){case 1:var ll=li[1];if(ll[4]){ll[4]=0;ll[1][2]=ll[2];ll[2][1]=ll[1];}return lm(lk);case 2:var ln=li[1],lo=[0,li[2],lk],li=ln,lk=lo;continue;default:var lp=li[2];kS[1]=li[1];lq(lp,0);return lm(lk);}},lm=function(lr){return lr?ls(lr[1],lr[2]):0;},lw=function(lu,lt){var lv=1===lt[0]?lt[1][1]===kR?(ls(lu[4],0),1):0:0;return lf(lt,lu[2],0);},lx=[0,0],ly=[0,0,0],lV=function(lB,lz){var lA=[0,lz],lC=kW(lB),lD=lC[1];switch(lD[0]){case 1:if(lD[1][1]===kR){var lE=0,lF=1;}else var lF=0;break;case 2:var lG=lD[1];lC[1]=lA;var lH=kS[1],lI=lx[1]?1:(lx[1]=1,0);lw(lG,lA);if(lI){kS[1]=lH;var lJ=0;}else for(;;){if(0!==ly[1]){if(0===ly[1])throw [0,dO];ly[1]=ly[1]-1|0;var lK=ly[2],lL=lK[2];if(lL===lK)ly[2]=0;else lK[2]=lL[2];var lM=lL[1];lw(lM[1],lM[2]);continue;}lx[1]=0;kS[1]=lH;var lJ=0;break;}var lE=lJ,lF=1;break;default:var lF=0;}if(!lF)var lE=bH(am);return lE;},lT=function(lN,lO){return typeof lN==="number"?lO:typeof lO==="number"?lN:[2,lN,lO];},lQ=function(lP){if(typeof lP!=="number")switch(lP[0]){case 2:var lR=lP[1],lS=lQ(lP[2]);return lT(lQ(lR),lS);case 1:break;default:if(!lP[1][1])return 0;}return lP;},lX=[0,function(lU){return 0;}],lW=kQ(0),l0=[0,0],l5=true,l_=function(l4){var lY=1-(lW[2]===lW?1:0);if(lY){var lZ=kQ(0);lZ[1][2]=lW[2];lW[2][1]=lZ[1];lZ[1]=lW[1];lW[1][2]=lZ;lW[1]=lW;lW[2]=lW;l0[1]=0;var l1=lZ[2];for(;;){var l2=l1!==lZ?1:0;if(l2){if(l1[4])lV(l1[3],0);var l3=l1[2],l1=l3;continue;}return l2;}}return lY;},l9=null,l8=undefined,l7=Array,l$=function(l6){return l6 instanceof l7?0:[0,new MlWrappedString(l6.toString())];};jg[1]=[0,l$,jg[1]];var mf=function(mb){return caml_js_wrap_callback(function(ma){if(ma){var mc=cq(mb,ma);if(!(mc|0))ma.preventDefault();return mc;}var md=event,me=cq(mb,md);if(!(me|0))md.returnValue=me;return me;});},mg=this,mh=mg.document,mj=aj.toString(),mi=[0,ai];this.HTMLElement===l8;var mk=2147483,mm=caml_js_get_console(0);lX[1]=function(ml){return 1===ml?(mg.setTimeout(caml_js_wrap_callback(l_),0),0):0;};var mo=function(mn){return mm.log(mn.toString());};k2[1]=function(mp){mo(ah);mo(jT(mp));return jU(b4);};var mu=function(mr,mq){return [1,1,mr,mq];},mv=function(mt,ms){return [1,2,mt,ms];},mw=[],mA=[];caml_update_dummy(mA,function(my,mx){{if(0===mx[0])return bT(W,bT(cq(my,mx[1]),X));var mz=mx[1];return bT(T,bT(mz,bT(U,bT(bT(Q,bT(dt(R,cs(mw,mx[2])),S)),V))));}});caml_update_dummy(mw,function(mB){if(typeof mB==="number")return 0===mB?ag:af;else switch(mB[0]){case 1:var mD=mB[2],mC=mB[1],mF=bT(cq(mw,mB[3]),ad);switch(mC){case 1:var mE=$;break;case 2:var mE=_;break;case 3:var mE=Z;break;case 4:var mE=Y;break;default:var mE=aa;}var mG=bT(mE,mF);return bT(ac,bT(cq(mw,mD),mG));case 2:return bT(ab,b2(mB[1]));default:return bT(ae,b3(mB[1]));}});var mH=Math.acos(-1),n_=function(mJ,mI){return [0,mJ[1]+mI[1],mJ[2]+mI[2]];},n$=function(mL,mK){return [0,mL[1]-mK[1],mL[2]-mK[2]];},mQ=function(mM,mN){return [0,mM[1]*mN,mM[2]*mN];},oa=function(mO){var mP=2*mH*mO/360;return mQ([0,Math.sin(mP),Math.cos(mP)],0.4);},m7=function(mR){switch(mR){case 1:return function(mS,mT){return mS-mT;};case 2:return function(mU,mV){return mU*mV;};case 3:return function(mW,mX){return mW/mX;};case 4:return function(mZ,mY){return caml_mod(mZ|0,mY|0);};default:return function(m0,m1){return m0+m1;};}},m3=function(m2){if(typeof m2==="number"){if(0===m2){var m8=1073741824,m9=jY(jZ);return (m9/m8+jY(jZ))/m8*1;}return 0.5;}else switch(m2[0]){case 1:var m5=m2[2],m4=m2[1],m6=m3(m2[3]);return eR(m7,m4,m3(m5),m6);case 2:return k(P);default:return m2[1];}},na=function(m$,m_){if(typeof m_!=="number")switch(m_[0]){case 2:return c3(m_[1],m$);case 0:break;default:var nc=m_[2],nb=m_[1],nd=na(m$,m_[3]);return [1,nb,na(m$,nc),nd];}return m_;},nA=function(nf,ne){switch(ne[0]){case 1:return [1,na(nf,ne[1])];case 2:return [2,na(nf,ne[1])];case 3:return [3,na(nf,ne[1])];default:return [0,na(nf,ne[1])];}},nx=function(nh,ng){switch(ng[0]){case 1:return [1,na(nh,ng[1])];case 2:return [2,na(nh,ng[1])];default:return [0,na(nh,ng[1])];}},nt=function(nk,nj,ni){{if(0===ni[0])return [0,cD(nk,nj,ni[1])];var nm=ni[2],nl=ni[1];return [1,nl,cs(cq(na,nj),nm)];}},nD=function(np,no,nn){return nn?[0,cD(np,no,nn[1])]:0;},nG=function(nq){return cq(cs,cq(nr,nq));},nr=function(nu,ns){if(typeof ns==="number")return 0;else switch(ns[0]){case 1:return [1,nt(nv,nu,ns[1])];case 2:var nw=ns[1],ny=na(nu,ns[2]);return [2,nx(nu,nw),ny];case 3:var nz=ns[1],nB=na(nu,ns[2]);return [3,nA(nu,nz),nB];case 4:var nC=ns[1],nE=na(nu,ns[3]),nF=nD(na,nu,nC);return [4,nD(na,nu,nC),nF,nE];case 5:return [5,na(nu,ns[1])];case 6:return [6,nt(nG,nu,ns[1])];default:var nH=ns[1],nI=nt(nG,nu,ns[2]);return [0,na(nu,nH),nI];}},nv=function(nK,nJ){var nN=nJ[2],nM=nJ[1],nO=nt(nL,nK,nJ[3]),nP=nD(nx,nK,nN);return [0,nD(nA,nK,nM),nP,nO];},nL=function(nR,nQ){var nU=nQ[3],nT=nQ[2],nS=nQ[1],nV=cs(cD(nt,nG,nR),nU),nW=nD(nx,nR,nT);return [0,nD(nA,nR,nS),nW,nV];},n7=function(nZ){var nX=[0,0];return cs(function(nY){nX[1]+=1;return [0,nX[1],nY];},nZ);},ob=function(n2,n8,n1,n0){{if(0===n0[0])return n0[1];var n4=n0[2],n3=n0[1],n6=c3(n3,cq(n2,n1));return cD(n8,n7(cs(function(n5){return [0,m3(n5)];},n4)),n6);}},od=cD(ob,function(n9){return n9[5];},nG),of=cD(ob,function(oc){return oc[6];},nL),on=cD(ob,function(oe){return oe[7];},nv),pO=function(oh,og){return og[3]+(oh[1]-og[1]|0)*(og[4]-og[3])/(og[2]-og[1]|0);},oj=function(oi,ok){if(0<=oi)return 0===oi?0:[0,ok,oj(oi-1|0,ok)];throw [0,d,O];},oy=function(om,oo,ol){if(typeof ol==="number")return [0,0,oo];else switch(ol[0]){case 1:return [0,[3,cD(on,om,ol[1])],oo];case 2:return [0,[4,ol[1],ol[2]],oo];case 3:return [0,[6,ol[1],ol[2]],oo];case 4:var ot=ol[3],os=ol[2],or=ol[1],oq=function(op){return op?op[1]:N;},ou=oq(os);return [0,[8,oq(or),ou,ot],oo];case 5:return [0,[1,ol[1]],oo];case 6:var ov=ol[1];return 0===ov[0]?ow(om,ov[1],oo):[0,[10,ov[1],ov[2]],oo];default:var ox=ol[1];return [0,[0,ox,cD(od,om,ol[2])],oo];}},ow=function(oB,oD,oC){return cH(function(oz,oA){return oy(oB,oA,oz);},oD,oC);},pw=function(oH,oF,oE){switch(oE[0]){case 1:var oG=oF[6];return m3(oE[1])+oG;case 2:var oJ=oE[1],oI=n$(oH[2],oF[5]),oK=360*Math.atan2(oI[1],oI[2])/(2*mH);return m3(oJ)+oK;case 3:var oL=oF[3];return m3(oE[1])+oL;default:return m3(oE[1]);}},py=function(oN,oM){switch(oM[0]){case 1:var oO=oN[2];return m3(oM[1])+oO;case 2:var oP=oN[7];return m3(oM[1])+oP;default:return m3(oM[1]);}},pr=function(oQ,oR,oS){return oQ?oQ[1]:oR?oR[1]:oS;},o9=function(o5,oT){var o8=oT[4],o_=cD(c4,function(oU){var oV=0===oU[4]?1:0;if(oV){var oW=oU[8];if(oW){var oX=oW,oY=0;}else{var oZ=oU[5],o0=oZ[2],o1=oZ[1],o2=o1<0?1:0;if(o2)var o3=o2;else{var o4=o0<0?1:0;if(o4)var o3=o4;else{var o6=o5[3]<=o1?1:0,o3=o6?o6:o5[3]<=o0?1:0;}}var o7=o3,oY=1;}}else{var oX=oV,oY=0;}if(!oY)var o7=oX;return 1-o7;},o8),pa=cs(cq(o9,o5),o_),o$=oT.slice();o$[4]=pa;var pb=o$;for(;;){var pc=pb[1];if(pc){var pd=pc[1];if(typeof pd==="number"){var qp=pb.slice();qp[1]=0;qp[8]=1;var pb=qp;continue;}else switch(pd[0]){case 1:var pe=pc[2],pg=m3(pd[1])|0,pf=pb.slice();pf[1]=[0,[2,pg],pe];var pb=pf;continue;case 2:var ph=pd[1];if(0===ph){var pi=pb.slice();pi[1]=pc[2];var pb=pi;continue;}if(1===ph){var pj=pb.slice();pj[1]=pc[2];var pk=pj;}else{var pl=pb.slice();pl[1]=[0,[2,ph-1|0],pc[2]];var pk=pl;}break;case 3:var pm=pd[1],pq=pc[2],pp=pm[2],po=pm[1],pn=cD(of,o5,pm[3]),pu=pn[3],pt=pn[2],ps=pr(pn[1],po,M),pv=pr(pt,pp,L),px=pw(o5,pb,ps),pz=py(pb,pv),pB=ow(o5,cs(function(pA){return [6,pA];},pu),0),pD=[0,pB,pz,px,0,pb[5],pb[6],pb[7],pb[8]],pC=1===ps[0]?px:pb[6],pE=2===pv[0]?pz:pb[7],pk=[0,pq,pb[2],pb[3],[0,pD,pb[4]],pb[5],pC,pE,pb[8]];break;case 4:var pG=pc[2],pF=pd[2],pH=py(pb,pd[1]),pI=m3(pF)|0,pJ=pb.slice();pJ[1]=[0,[5,[0,o5[1],o5[1]+pI|0,pb[2],pH]],pG];var pb=pJ;continue;case 5:var pK=pd[1],pM=pc[2];if(pK[2]<o5[1]){var pL=pb.slice();pL[1]=pM;var pk=pL;}else{var pN=pb.slice();pN[2]=pO(o5,pK);var pk=pN;}break;case 6:var pQ=pc[2],pP=pd[2],pR=pw(o5,pb,pd[1]),pS=m3(pP)|0,pT=pb.slice();pT[1]=[0,[7,[0,o5[1],o5[1]+pS|0,pb[3],pR]],pQ];var pb=pT;continue;case 7:var pU=pd[1],pW=pc[2];if(pU[2]<o5[1]){var pV=pb.slice();pV[1]=pW;var pk=pV;}else{var pX=pb.slice();pX[3]=pO(o5,pU);var pk=pX;}break;case 8:var p0=pc[2],pZ=pd[3],pY=pd[2],p1=m3(pd[1]),p2=m3(pY),p3=m3(pZ),p4=pb[2],p5=mQ(oa(pb[3]),p4),p6=n_(p5,[0,p1,p2]),p7=pb.slice();p7[1]=[0,[9,[0,o5[1],o5[1]+(p3|0)|0,p5,p6]],p0];var pb=p7;continue;case 9:var p8=pd[1],p_=pc[2];if(p8[2]<o5[1]){var p9=pb.slice();p9[1]=p_;var pk=p9;}else{var p$=(o5[1]-p8[1]|0)/(p8[2]-p8[1]|0),qa=mQ(n$(p8[4],p8[3]),p$),qb=n_(p8[3],qa),qc=qb[2],qd=qb[1],qe=pb.slice();qe[2]=caml_hypot_float(qd,qc);qe[3]=Math.atan2(qd,qc);var pk=qe;}break;case 10:var qg=pc[2],qf=pd[2],qi=c3(pd[1],o5[5]),qk=cD(nG,n7(cs(function(qh){return [0,m3(qh)];},qf)),qi),qj=pb.slice();qj[1]=ow(o5,qk,qg);var pb=qj;continue;default:var qm=pc[2],ql=pd[2],qo=m3(pd[1])|0,qn=pb.slice();qn[1]=ow(o5,cm(oj(qo,ql)),qm);var pb=qn;continue;}}else var pk=pb;var qq=pk.slice(),qr=pk[2],qs=mQ(oa(pk[3]),qr);qq[5]=n_(pk[5],qs);return qq;}},qu=function(qt){return bZ([0,qt,0],cm(cs(qu,qt[4])));},qv=[0,[0,v,[0,0,w,[0,x,[0,[0,[0,[0,y,[0,[0,[3,z,mu(A,mv(1,B))],C]]],0]],0]]]],0],qw=mv(0,r),qx=400,qy=300,qz=[0,l],qA=[0,[1,n,[0,[0,o,[0,[0,[1,[0,[0,[0,[2,[1,0,mu(p,q),qw]]],0,s]]],t]]],u]],qv],qV=qz[1],qW=function(qB){qz[1]=[0,qB.clientX,qB.clientY];return l5;},qS=function(qC,qJ,qG,qE,qD){var qF=4*((qD*qx|0)+qE|0)|0,qI=qC[3],qH=qC[2];qG[qF+0|0]=qC[1];qG[qF+1|0]=qH;qG[qF+2|0]=qI;qG[qF+3|0]=255;return 0;},qX=function(qK,qU,qM,qN,qO){var qL=qK?qK[1]:F,qT=qM.data,qR=qN|0,qQ=qO|0;return c1(function(qP){return qS(qL,qU,qT,qR+qP[1]|0,qQ+qP[2]|0);},E);},qY=mh.createElement(ak.toString());if(1-(qY.getContext==l9?1:0)){qY.width=qx;qY.height=qy;qY.onmousemove=mf(qW);mh.body.appendChild(qY);var qZ=[0,0],q0=[0,0],q1=[0,0];c1(function(q2){switch(q2[0]){case 1:qZ[1]=[0,[0,q2[1],q2[2]],qZ[1]];return 0;case 2:q1[1]=[0,[0,q2[1],q2[2]],q1[1]];return 0;default:q0[1]=[0,[0,q2[1],q2[2]],q0[1]];return 0;}},qA);var q3=q1[1],q4=q0[1],q5=qZ[1],q8=function(q7){return dt(K,cs(function(q6){return q6[1];},q7));},q9=q8(q3),q_=q8(q4);q$(je,J,q8(q5),q_,q9);var ra=I;for(;;){if(ra){var re=ra[2],rb=ra[1];try {var rc=c3(rb,q5);}catch(rd){if(rd[1]===c){var ra=re;continue;}throw rd;}var rf=[0,0,qV,qx,qy,q5,q4,q3],rg=[0,oy(rf,0,[6,[0,rc]]),0,0,0,m,0,0,0],rh=[0,0];qY.onclick=mf(function(ri){rh[1]=1;return l5;});var rD=function(rj,ru,sp){var rl=[0,rj,qz[1],rf[3],rf[4],rf[5],rf[6],rf[7]],rk=qY.getContext(mj),rm=rk.getImageData(0,0,qx,qy),rn=0,rr=rm.data;if(!(qx<rn)){var ro=rn;for(;;){var rp=0;if(!(qy<rp)){var rq=rp;for(;;){qS(D,rk,rr,ro,rq);var rs=rq+1|0;if(qy!==rq){var rq=rs;continue;}break;}}var rt=ro+1|0;if(qx!==ro){var ro=rt;continue;}break;}}var rw=qu(ru),rx=[0,0],rA=cD(c4,function(rv){return 1-rv[8];},rw);c1(function(ry){var rz=ry[5];qX(0,rk,rm,rz[1],rz[2]);rx[1]+=1;return 0;},rA);var rB=qz[1],rC=rx[1];qX([0,G],rk,rm,rB[1],rB[2]);rk.putImageData(rm,0,0);rk.fillText(bT(b2(rC),H).toString(),0,10);var rE=rh[1]?(rh[1]=0,cD(rD,1,rg)):cD(rD,rj+1|0,o9(rl,ru)),rF=[0,[2,[0,1,0,0,0]]],rG=[0,0],rO=0;function rL(rH,rN){var rI=mk<rH?[0,mk,rH-mk]:[0,rH,0],rJ=rI[2],rM=rI[1],rK=rJ==0?cq(lV,rF):cq(rL,rJ);rG[1]=[0,mg.setTimeout(caml_js_wrap_callback(rK),rM*1e3)];return 0;}rL(rO,0);function rR(rQ){var rP=rG[1];return rP?mg.clearTimeout(rP[1]):0;}var rS=k1(rF)[1];switch(rS[0]){case 1:var rT=rS[1][1]===kR?(lq(rR,0),1):0;break;case 2:var rU=rS[1],rV=[0,kS[1],rR],rW=rU[4],rX=typeof rW==="number"?rV:[2,rV,rW];rU[4]=rX;var rT=1;break;default:var rT=0;}var rY=k1(rF),rZ=rY[1];switch(rZ[0]){case 1:var r0=[0,rZ];break;case 2:var r1=rZ[1],r2=[0,[2,[0,[0,[0,rY]],0,0,0]]],r4=kS[1],sm=[1,function(r3){switch(r3[0]){case 0:var r5=r3[1];kS[1]=r4;try {var r6=cq(rE,r5),r7=r6;}catch(r8){var r7=[0,[1,r8]];}var r9=k1(r2),r_=k1(r7),r$=r9[1];{if(2===r$[0]){var sa=r$[1];if(r9===r_)var sb=0;else{var sc=r_[1];if(2===sc[0]){var sd=sc[1];r_[1]=[3,r9];sa[1]=sd[1];var se=lT(sa[2],sd[2]),sf=sa[3]+sd[3]|0;if(k0<sf){sa[3]=0;sa[2]=lQ(se);}else{sa[3]=sf;sa[2]=se;}var sg=sd[4],sh=sa[4],si=typeof sh==="number"?sg:typeof sg==="number"?sh:[2,sh,sg];sa[4]=si;var sb=0;}else{r9[1]=sc;var sb=lw(sa,sc);}}return sb;}throw [0,d,an];}case 1:var sj=k1(r2),sk=sj[1];{if(2===sk[0]){var sl=sk[1];sj[1]=r3;return lw(sl,r3);}throw [0,d,ao];}default:throw [0,d,aq];}}],sn=r1[2],so=typeof sn==="number"?sm:[2,sm,sn];r1[2]=so;var r0=r2;break;case 3:throw [0,d,ap];default:var r0=cq(rE,rZ[1]);}return r0;};rD(1,rg,0);ca(0);return;}throw [0,c];}}throw [0,mi];}}());
