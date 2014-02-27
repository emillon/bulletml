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
(function(){function jv(sW,sX,sY,sZ,s0,s1,s2){return sW.length==6?sW(sX,sY,sZ,s0,s1,s2):caml_call_gen(sW,[sX,sY,sZ,s0,s1,s2]);}function rs(sR,sS,sT,sU,sV){return sR.length==4?sR(sS,sT,sU,sV):caml_call_gen(sR,[sS,sT,sU,sV]);}function fl(sN,sO,sP,sQ){return sN.length==3?sN(sO,sP,sQ):caml_call_gen(sN,[sO,sP,sQ]);}function c9(sK,sL,sM){return sK.length==2?sK(sL,sM):caml_call_gen(sK,[sL,sM]);}function cW(sI,sJ){return sI.length==1?sI(sJ):caml_call_gen(sI,[sJ]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=new MlString("File \"%s\", line %d, characters %d-%d: %s"),f=new MlString(""),g=[0,0,0,0];caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var ca=[0,new MlString("Out_of_memory")],b$=[0,new MlString("Match_failure")],b_=[0,new MlString("Stack_overflow")],b9=[0,new MlString("Undefined_recursive_module")],b8=new MlString("%.12g"),b7=new MlString("."),b6=new MlString("%d"),b5=new MlString("true"),b4=new MlString("false"),b3=new MlString("Pervasives.do_at_exit"),b2=new MlString("\\b"),b1=new MlString("\\t"),b0=new MlString("\\n"),bZ=new MlString("\\r"),bY=new MlString("\\\\"),bX=new MlString("\\'"),bW=new MlString(""),bV=new MlString("String.blit"),bU=new MlString("String.sub"),bT=new MlString("Queue.Empty"),bS=new MlString("Buffer.add: cannot grow buffer"),bR=new MlString(""),bQ=new MlString(""),bP=new MlString("%.12g"),bO=new MlString("\""),bN=new MlString("\""),bM=new MlString("'"),bL=new MlString("'"),bK=new MlString("nan"),bJ=new MlString("neg_infinity"),bI=new MlString("infinity"),bH=new MlString("."),bG=new MlString("printf: bad positional specification (0)."),bF=new MlString("%_"),bE=[0,new MlString("printf.ml"),143,8],bD=new MlString("'"),bC=new MlString("Printf: premature end of format string '"),bB=new MlString("'"),bA=new MlString(" in format string '"),bz=new MlString(", at char number "),by=new MlString("Printf: bad conversion %"),bx=new MlString("Sformat.index_of_int: negative argument "),bw=new MlString(""),bv=new MlString(", %s%s"),bu=[1,1],bt=new MlString("%s\n"),bs=new MlString("(Program not linked with -g, cannot print stack backtrace)\n"),br=new MlString("Raised at"),bq=new MlString("Re-raised at"),bp=new MlString("Raised by primitive operation at"),bo=new MlString("Called from"),bn=new MlString("%s file \"%s\", line %d, characters %d-%d"),bm=new MlString("%s unknown location"),bl=new MlString("Out of memory"),bk=new MlString("Stack overflow"),bj=new MlString("Pattern matching failed"),bi=new MlString("Assertion failed"),bh=new MlString("Undefined recursive module"),bg=new MlString("(%s%s)"),bf=new MlString(""),be=new MlString(""),bd=new MlString("(%s)"),bc=new MlString("%d"),bb=new MlString("%S"),ba=new MlString("_"),a$=[0,987910699,495797812,364182224,414272206,318284740,990407751,383018966,270373319,840823159,24560019,536292337,512266505,189156120,730249596,143776328,51606627,140166561,366354223,1003410265,700563762,981890670,913149062,526082594,1021425055,784300257,667753350,630144451,949649812,48546892,415514493,258888527,511570777,89983870,283659902,308386020,242688715,482270760,865188196,1027664170,207196989,193777847,619708188,671350186,149669678,257044018,87658204,558145612,183450813,28133145,901332182,710253903,510646120,652377910,409934019,801085050],a_=new MlString("Pcre.Error"),a9=new MlString("Pcre.Backtrack"),a8=[1,new MlString("")],a7=new MlString("Pcre.Error"),a6=new MlString("Pcre.Backtrack"),a5=new MlString("\\s+"),a4=new MlString("Pcre.FoundAt"),a3=[0,613575188,0],a2=new MlString("\\d+"),a1=new MlString("0(x|X)[0-9a-fA-F]+"),a0=new MlString("0(o|O)[0-7]+"),aZ=new MlString("0(b|B)[01]+"),aY=new MlString("-?\\d+"),aX=new MlString("-?\\d+(\\.\\d*)?((e|E)?(\\+|-)?\\d+)?"),aW=[0,new MlString("src/core/lwt.ml"),648,20],aV=[0,new MlString("src/core/lwt.ml"),651,8],aU=[0,new MlString("src/core/lwt.ml"),498,8],aT=[0,new MlString("src/core/lwt.ml"),487,9],aS=new MlString("Lwt.wakeup_result"),aR=new MlString("Lwt.Canceled"),aQ=new MlString("canvas"),aP=new MlString("2d"),aO=new MlString("Dom_html.Canvas_not_available"),aN=new MlString("Exception during Lwt.async: "),aM=[0,0],aL=new MlString("Rand"),aK=new MlString("Rank"),aJ=new MlString("Num "),aI=new MlString(")"),aH=new MlString("("),aG=new MlString("$"),aF=new MlString(" + "),aE=new MlString(" - "),aD=new MlString(" * "),aC=new MlString(" / "),aB=new MlString(" % "),aA=new MlString(")"),az=new MlString("Direct ("),ay=new MlString(")"),ax=new MlString(", "),aw=new MlString("Indirect ("),av=new MlString("]"),au=new MlString(", "),at=new MlString("["),as=new MlString("Param"),ar=[0,new MlString("interp.ml"),125,20],aq=[0,0],ap=new MlString(", "),ao=new MlString("a: %s\nb: %s\nf: %s\n"),an=[0,new MlString("top"),[0,new MlString("top1"),0]],am=[0,[5,[0,430]],0],al=[0,1],ak=new MlString("slow"),aj=[5,[0,1]],ai=[1,[1,new MlString("slow"),[0,[0,1],0]]],ah=[5,[0,1]],ag=[1,[0,[0,[0,[0,[0,85]]],0,[1,new MlString("fast"),0]]]],af=[5,[0,1]],ae=[1,new MlString("fast"),0],ad=[0,85],ac=new MlString("top"),ab=[2,new MlString("slow"),[0,0,0,[0,[0,0,0,[0,[0,[0,[1,[1,new MlString("slowColorChange"),[0,[2,1],0]]],[0,0,0]]],0]]]]],aa=[0,0,0],$=[0,4],_=[0,8],Z=[6,[1,new MlString("add3"),0]],Y=[0,[0,[0,1.2]]],X=[2,1],W=[0,4],V=[0,8],U=[0,50],T=[0,50],S=[2,[0,[0,0]],[0,1]],R=[5,[0,6]],Q=[0,[0,[0,7]]],P=[2,1],O=[0,45],N=[0,180],M=new MlString("slowColorChange"),L=[0,[2,[0,0]]],K=[0,[1,[0,90]]],J=[0,3],I=new MlString("add3"),H=[0,0,0],G=[0,18],F=[0,10],E=[0,336],D=[0,[6,[1,new MlString("add3"),0]],0],C=[0,0.2],B=[0,0.1],A=[0,[1,[0,0]]],z=[0,4],y=[6,[1,new MlString("add3"),0]],x=[0,[0,[0,1.5]]],w=[0,2],v=[0,11],u=[0,18],t=[0,10],s=[5,[0,20]],r=[2,[0,[0,0]],[0,1]],q=[5,[0,6]],p=[0,[0,[0,10]]],o=new MlString("fast"),n=[0,200,100],m=[0,200,250];function l(h){throw [0,a,h];}function cb(i){throw [0,b,i];}function cc(k,j){return caml_greaterequal(k,j)?k:j;}function cn(cd,cf){var ce=cd.getLen(),cg=cf.getLen(),ch=caml_create_string(ce+cg|0);caml_blit_string(cd,0,ch,0,ce);caml_blit_string(cf,0,ch,ce,cg);return ch;}function cw(ci){return caml_format_int(b6,ci);}function cx(cj){var ck=caml_format_float(b8,cj),cl=0,cm=ck.getLen();for(;;){if(cm<=cl)var co=cn(ck,b7);else{var cp=ck.safeGet(cl),cq=48<=cp?58<=cp?0:1:45===cp?1:0;if(cq){var cr=cl+1|0,cl=cr;continue;}var co=ck;}return co;}}function ct(cs,cu){if(cs){var cv=cs[1];return [0,cv,ct(cs[2],cu)];}return cu;}var cy=caml_ml_open_descriptor_out(2),cF=caml_ml_open_descriptor_out(1);function cH(cA,cz){return caml_ml_output(cA,cz,0,cz.getLen());}function cG(cE){var cB=caml_ml_out_channels_list(0);for(;;){if(cB){var cC=cB[2];try {}catch(cD){}var cB=cC;continue;}return 0;}}caml_register_named_value(b3,cG);function cL(cJ,cI){return caml_ml_output_char(cJ,cI);}function dv(cK){return caml_ml_flush(cK);}function du(cM){var cN=cM,cO=0;for(;;){if(cN){var cP=cN[2],cQ=[0,cN[1],cO],cN=cP,cO=cQ;continue;}return cO;}}function cS(cR){if(cR){var cT=cR[1];return ct(cT,cS(cR[2]));}return 0;}function cY(cV,cU){if(cU){var cX=cU[2],cZ=cW(cV,cU[1]);return [0,cZ,cY(cV,cX)];}return 0;}function dw(c2,c0){var c1=c0;for(;;){if(c1){var c3=c1[2];cW(c2,c1[1]);var c1=c3;continue;}return 0;}}function dx(c8,c4,c6){var c5=c4,c7=c6;for(;;){if(c7){var c_=c7[2],c$=c9(c8,c5,c7[1]),c5=c$,c7=c_;continue;}return c5;}}function db(dd,da,dc){if(da){var de=da[1];return c9(dd,de,db(dd,da[2],dc));}return dc;}function dy(di,df){var dg=df;for(;;){if(dg){var dh=dg[1],dk=dg[2],dj=dh[2];if(0===caml_compare(dh[1],di))return dj;var dg=dk;continue;}throw [0,c];}}function dz(ds){return cW(function(dl,dn){var dm=dl,dp=dn;for(;;){if(dp){var dq=dp[2],dr=dp[1];if(cW(ds,dr)){var dt=[0,dr,dm],dm=dt,dp=dq;continue;}var dp=dq;continue;}return du(dm);}},0);}function dW(dA,dC){var dB=caml_create_string(dA);caml_fill_string(dB,0,dA,dC);return dB;}function dX(dF,dD,dE){if(0<=dD&&0<=dE&&!((dF.getLen()-dE|0)<dD)){var dG=caml_create_string(dE);caml_blit_string(dF,dD,dG,0,dE);return dG;}return cb(bU);}function dY(dJ,dI,dL,dK,dH){if(0<=dH&&0<=dI&&!((dJ.getLen()-dH|0)<dI)&&0<=dK&&!((dL.getLen()-dH|0)<dK))return caml_blit_string(dJ,dI,dL,dK,dH);return cb(bV);}function dZ(dS,dM){if(dM){var dN=dM[1],dO=[0,0],dP=[0,0],dR=dM[2];dw(function(dQ){dO[1]+=1;dP[1]=dP[1]+dQ.getLen()|0;return 0;},dM);var dT=caml_create_string(dP[1]+caml_mul(dS.getLen(),dO[1]-1|0)|0);caml_blit_string(dN,0,dT,0,dN.getLen());var dU=[0,dN.getLen()];dw(function(dV){caml_blit_string(dS,0,dT,dU[1],dS.getLen());dU[1]=dU[1]+dS.getLen()|0;caml_blit_string(dV,0,dT,dU[1],dV.getLen());dU[1]=dU[1]+dV.getLen()|0;return 0;},dR);return dT;}return bW;}var d0=caml_sys_const_word_size(0),d1=caml_mul(d0/8|0,(1<<(d0-10|0))-1|0)-1|0,ek=252,ej=253,ei=[0,bT];function eh(d2){var d3=1<=d2?d2:1,d4=d1<d3?d1:d3,d5=caml_create_string(d4);return [0,d5,0,d4,d5];}function el(d6){return dX(d6[1],0,d6[2]);}function eb(d7,d9){var d8=[0,d7[3]];for(;;){if(d8[1]<(d7[2]+d9|0)){d8[1]=2*d8[1]|0;continue;}if(d1<d8[1])if((d7[2]+d9|0)<=d1)d8[1]=d1;else l(bS);var d_=caml_create_string(d8[1]);dY(d7[1],0,d_,0,d7[2]);d7[1]=d_;d7[3]=d8[1];return 0;}}function em(d$,ec){var ea=d$[2];if(d$[3]<=ea)eb(d$,1);d$[1].safeSet(ea,ec);d$[2]=ea+1|0;return 0;}function en(ef,ed){var ee=ed.getLen(),eg=ef[2]+ee|0;if(ef[3]<eg)eb(ef,ee);dY(ed,0,ef[1],ef[2],ee);ef[2]=eg;return 0;}function er(eo){return 0<=eo?eo:l(cn(bx,cw(eo)));}function es(ep,eq){return er(ep+eq|0);}var et=cW(es,1);function eA(eu){return dX(eu,0,eu.getLen());}function eC(ev,ew,ey){var ex=cn(bA,cn(ev,bB)),ez=cn(bz,cn(cw(ew),ex));return cb(cn(by,cn(dW(1,ey),ez)));}function fr(eB,eE,eD){return eC(eA(eB),eE,eD);}function fs(eF){return cb(cn(bC,cn(eA(eF),bD)));}function eZ(eG,eO,eQ,eS){function eN(eH){if((eG.safeGet(eH)-48|0)<0||9<(eG.safeGet(eH)-48|0))return eH;var eI=eH+1|0;for(;;){var eJ=eG.safeGet(eI);if(48<=eJ){if(!(58<=eJ)){var eL=eI+1|0,eI=eL;continue;}var eK=0;}else if(36===eJ){var eM=eI+1|0,eK=1;}else var eK=0;if(!eK)var eM=eH;return eM;}}var eP=eN(eO+1|0),eR=eh((eQ-eP|0)+10|0);em(eR,37);var eT=eP,eU=du(eS);for(;;){if(eT<=eQ){var eV=eG.safeGet(eT);if(42===eV){if(eU){var eW=eU[2];en(eR,cw(eU[1]));var eX=eN(eT+1|0),eT=eX,eU=eW;continue;}throw [0,d,bE];}em(eR,eV);var eY=eT+1|0,eT=eY;continue;}return el(eR);}}function gS(e5,e3,e2,e1,e0){var e4=eZ(e3,e2,e1,e0);if(78!==e5&&110!==e5)return e4;e4.safeSet(e4.getLen()-1|0,117);return e4;}function ft(fa,fk,fp,e6,fo){var e7=e6.getLen();function fm(e8,fj){var e9=40===e8?41:125;function fi(e_){var e$=e_;for(;;){if(e7<=e$)return cW(fa,e6);if(37===e6.safeGet(e$)){var fb=e$+1|0;if(e7<=fb)var fc=cW(fa,e6);else{var fd=e6.safeGet(fb),fe=fd-40|0;if(fe<0||1<fe){var ff=fe-83|0;if(ff<0||2<ff)var fg=1;else switch(ff){case 1:var fg=1;break;case 2:var fh=1,fg=0;break;default:var fh=0,fg=0;}if(fg){var fc=fi(fb+1|0),fh=2;}}else var fh=0===fe?0:1;switch(fh){case 1:var fc=fd===e9?fb+1|0:fl(fk,e6,fj,fd);break;case 2:break;default:var fc=fi(fm(fd,fb+1|0)+1|0);}}return fc;}var fn=e$+1|0,e$=fn;continue;}}return fi(fj);}return fm(fp,fo);}function fS(fq){return fl(ft,fs,fr,fq);}function f8(fu,fF,fP){var fv=fu.getLen()-1|0;function fQ(fw){var fx=fw;a:for(;;){if(fx<fv){if(37===fu.safeGet(fx)){var fy=0,fz=fx+1|0;for(;;){if(fv<fz)var fA=fs(fu);else{var fB=fu.safeGet(fz);if(58<=fB){if(95===fB){var fD=fz+1|0,fC=1,fy=fC,fz=fD;continue;}}else if(32<=fB)switch(fB-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var fE=fz+1|0,fz=fE;continue;case 10:var fG=fl(fF,fy,fz,105),fz=fG;continue;default:var fH=fz+1|0,fz=fH;continue;}var fI=fz;c:for(;;){if(fv<fI)var fJ=fs(fu);else{var fK=fu.safeGet(fI);if(126<=fK)var fL=0;else switch(fK){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var fJ=fl(fF,fy,fI,105),fL=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var fJ=fl(fF,fy,fI,102),fL=1;break;case 33:case 37:case 44:case 64:var fJ=fI+1|0,fL=1;break;case 83:case 91:case 115:var fJ=fl(fF,fy,fI,115),fL=1;break;case 97:case 114:case 116:var fJ=fl(fF,fy,fI,fK),fL=1;break;case 76:case 108:case 110:var fM=fI+1|0;if(fv<fM){var fJ=fl(fF,fy,fI,105),fL=1;}else{var fN=fu.safeGet(fM)-88|0;if(fN<0||32<fN)var fO=1;else switch(fN){case 0:case 12:case 17:case 23:case 29:case 32:var fJ=c9(fP,fl(fF,fy,fI,fK),105),fL=1,fO=0;break;default:var fO=1;}if(fO){var fJ=fl(fF,fy,fI,105),fL=1;}}break;case 67:case 99:var fJ=fl(fF,fy,fI,99),fL=1;break;case 66:case 98:var fJ=fl(fF,fy,fI,66),fL=1;break;case 41:case 125:var fJ=fl(fF,fy,fI,fK),fL=1;break;case 40:var fJ=fQ(fl(fF,fy,fI,fK)),fL=1;break;case 123:var fR=fl(fF,fy,fI,fK),fT=fl(fS,fK,fu,fR),fU=fR;for(;;){if(fU<(fT-2|0)){var fV=c9(fP,fU,fu.safeGet(fU)),fU=fV;continue;}var fW=fT-1|0,fI=fW;continue c;}default:var fL=0;}if(!fL)var fJ=fr(fu,fI,fK);}var fA=fJ;break;}}var fx=fA;continue a;}}var fX=fx+1|0,fx=fX;continue;}return fx;}}fQ(0);return 0;}function h7(f9){var fY=[0,0,0,0];function f7(f3,f4,fZ){var f0=41!==fZ?1:0,f1=f0?125!==fZ?1:0:f0;if(f1){var f2=97===fZ?2:1;if(114===fZ)fY[3]=fY[3]+1|0;if(f3)fY[2]=fY[2]+f2|0;else fY[1]=fY[1]+f2|0;}return f4+1|0;}f8(f9,f7,function(f5,f6){return f5+1|0;});return fY[1];}function gO(f_,gb,f$){var ga=f_.safeGet(f$);if((ga-48|0)<0||9<(ga-48|0))return c9(gb,0,f$);var gc=ga-48|0,gd=f$+1|0;for(;;){var ge=f_.safeGet(gd);if(48<=ge){if(!(58<=ge)){var gh=gd+1|0,gg=(10*gc|0)+(ge-48|0)|0,gc=gg,gd=gh;continue;}var gf=0;}else if(36===ge)if(0===gc){var gi=l(bG),gf=1;}else{var gi=c9(gb,[0,er(gc-1|0)],gd+1|0),gf=1;}else var gf=0;if(!gf)var gi=c9(gb,0,f$);return gi;}}function gJ(gj,gk){return gj?gk:cW(et,gk);}function gy(gl,gm){return gl?gl[1]:gm;}function ju(is,go,iE,gr,ia,iK,gn){var gp=cW(go,gn);function it(gq){return c9(gr,gp,gq);}function h$(gw,iJ,gs,gB){var gv=gs.getLen();function h8(iB,gt){var gu=gt;for(;;){if(gv<=gu)return cW(gw,gp);var gx=gs.safeGet(gu);if(37===gx){var gF=function(gA,gz){return caml_array_get(gB,gy(gA,gz));},gL=function(gN,gG,gI,gC){var gD=gC;for(;;){var gE=gs.safeGet(gD)-32|0;if(!(gE<0||25<gE))switch(gE){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return gO(gs,function(gH,gM){var gK=[0,gF(gH,gG),gI];return gL(gN,gJ(gH,gG),gK,gM);},gD+1|0);default:var gP=gD+1|0,gD=gP;continue;}var gQ=gs.safeGet(gD);if(124<=gQ)var gR=0;else switch(gQ){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var gT=gF(gN,gG),gU=caml_format_int(gS(gQ,gs,gu,gD,gI),gT),gW=gV(gJ(gN,gG),gU,gD+1|0),gR=1;break;case 69:case 71:case 101:case 102:case 103:var gX=gF(gN,gG),gY=caml_format_float(eZ(gs,gu,gD,gI),gX),gW=gV(gJ(gN,gG),gY,gD+1|0),gR=1;break;case 76:case 108:case 110:var gZ=gs.safeGet(gD+1|0)-88|0;if(gZ<0||32<gZ)var g0=1;else switch(gZ){case 0:case 12:case 17:case 23:case 29:case 32:var g1=gD+1|0,g2=gQ-108|0;if(g2<0||2<g2)var g3=0;else{switch(g2){case 1:var g3=0,g4=0;break;case 2:var g5=gF(gN,gG),g6=caml_format_int(eZ(gs,gu,g1,gI),g5),g4=1;break;default:var g7=gF(gN,gG),g6=caml_format_int(eZ(gs,gu,g1,gI),g7),g4=1;}if(g4){var g8=g6,g3=1;}}if(!g3){var g9=gF(gN,gG),g8=caml_int64_format(eZ(gs,gu,g1,gI),g9);}var gW=gV(gJ(gN,gG),g8,g1+1|0),gR=1,g0=0;break;default:var g0=1;}if(g0){var g_=gF(gN,gG),g$=caml_format_int(gS(110,gs,gu,gD,gI),g_),gW=gV(gJ(gN,gG),g$,gD+1|0),gR=1;}break;case 37:case 64:var gW=gV(gG,dW(1,gQ),gD+1|0),gR=1;break;case 83:case 115:var ha=gF(gN,gG);if(115===gQ)var hb=ha;else{var hc=[0,0],hd=0,he=ha.getLen()-1|0;if(!(he<hd)){var hf=hd;for(;;){var hg=ha.safeGet(hf),hh=14<=hg?34===hg?1:92===hg?1:0:11<=hg?13<=hg?1:0:8<=hg?1:0,hi=hh?2:caml_is_printable(hg)?1:4;hc[1]=hc[1]+hi|0;var hj=hf+1|0;if(he!==hf){var hf=hj;continue;}break;}}if(hc[1]===ha.getLen())var hk=ha;else{var hl=caml_create_string(hc[1]);hc[1]=0;var hm=0,hn=ha.getLen()-1|0;if(!(hn<hm)){var ho=hm;for(;;){var hp=ha.safeGet(ho),hq=hp-34|0;if(hq<0||58<hq)if(-20<=hq)var hr=1;else{switch(hq+34|0){case 8:hl.safeSet(hc[1],92);hc[1]+=1;hl.safeSet(hc[1],98);var hs=1;break;case 9:hl.safeSet(hc[1],92);hc[1]+=1;hl.safeSet(hc[1],116);var hs=1;break;case 10:hl.safeSet(hc[1],92);hc[1]+=1;hl.safeSet(hc[1],110);var hs=1;break;case 13:hl.safeSet(hc[1],92);hc[1]+=1;hl.safeSet(hc[1],114);var hs=1;break;default:var hr=1,hs=0;}if(hs)var hr=0;}else var hr=(hq-1|0)<0||56<(hq-1|0)?(hl.safeSet(hc[1],92),hc[1]+=1,hl.safeSet(hc[1],hp),0):1;if(hr)if(caml_is_printable(hp))hl.safeSet(hc[1],hp);else{hl.safeSet(hc[1],92);hc[1]+=1;hl.safeSet(hc[1],48+(hp/100|0)|0);hc[1]+=1;hl.safeSet(hc[1],48+((hp/10|0)%10|0)|0);hc[1]+=1;hl.safeSet(hc[1],48+(hp%10|0)|0);}hc[1]+=1;var ht=ho+1|0;if(hn!==ho){var ho=ht;continue;}break;}}var hk=hl;}var hb=cn(bN,cn(hk,bO));}if(gD===(gu+1|0))var hu=hb;else{var hv=eZ(gs,gu,gD,gI);try {var hw=0,hx=1;for(;;){if(hv.getLen()<=hx)var hy=[0,0,hw];else{var hz=hv.safeGet(hx);if(49<=hz)if(58<=hz)var hA=0;else{var hy=[0,caml_int_of_string(dX(hv,hx,(hv.getLen()-hx|0)-1|0)),hw],hA=1;}else{if(45===hz){var hC=hx+1|0,hB=1,hw=hB,hx=hC;continue;}var hA=0;}if(!hA){var hD=hx+1|0,hx=hD;continue;}}var hE=hy;break;}}catch(hF){if(hF[1]!==a)throw hF;var hE=eC(hv,0,115);}var hG=hE[1],hH=hb.getLen(),hI=0,hM=hE[2],hL=32;if(hG===hH&&0===hI){var hJ=hb,hK=1;}else var hK=0;if(!hK)if(hG<=hH)var hJ=dX(hb,hI,hH);else{var hN=dW(hG,hL);if(hM)dY(hb,hI,hN,0,hH);else dY(hb,hI,hN,hG-hH|0,hH);var hJ=hN;}var hu=hJ;}var gW=gV(gJ(gN,gG),hu,gD+1|0),gR=1;break;case 67:case 99:var hO=gF(gN,gG);if(99===gQ)var hP=dW(1,hO);else{if(39===hO)var hQ=bX;else if(92===hO)var hQ=bY;else{if(14<=hO)var hR=0;else switch(hO){case 8:var hQ=b2,hR=1;break;case 9:var hQ=b1,hR=1;break;case 10:var hQ=b0,hR=1;break;case 13:var hQ=bZ,hR=1;break;default:var hR=0;}if(!hR)if(caml_is_printable(hO)){var hS=caml_create_string(1);hS.safeSet(0,hO);var hQ=hS;}else{var hT=caml_create_string(4);hT.safeSet(0,92);hT.safeSet(1,48+(hO/100|0)|0);hT.safeSet(2,48+((hO/10|0)%10|0)|0);hT.safeSet(3,48+(hO%10|0)|0);var hQ=hT;}}var hP=cn(bL,cn(hQ,bM));}var gW=gV(gJ(gN,gG),hP,gD+1|0),gR=1;break;case 66:case 98:var hV=gD+1|0,hU=gF(gN,gG)?b5:b4,gW=gV(gJ(gN,gG),hU,hV),gR=1;break;case 40:case 123:var hW=gF(gN,gG),hX=fl(fS,gQ,gs,gD+1|0);if(123===gQ){var hY=eh(hW.getLen()),h2=function(h0,hZ){em(hY,hZ);return h0+1|0;};f8(hW,function(h1,h4,h3){if(h1)en(hY,bF);else em(hY,37);return h2(h4,h3);},h2);var h5=el(hY),gW=gV(gJ(gN,gG),h5,hX),gR=1;}else{var h6=gJ(gN,gG),h9=es(h7(hW),h6),gW=h$(function(h_){return h8(h9,hX);},h6,hW,gB),gR=1;}break;case 33:cW(ia,gp);var gW=h8(gG,gD+1|0),gR=1;break;case 41:var gW=gV(gG,bR,gD+1|0),gR=1;break;case 44:var gW=gV(gG,bQ,gD+1|0),gR=1;break;case 70:var ib=gF(gN,gG);if(0===gI)var ic=bP;else{var id=eZ(gs,gu,gD,gI);if(70===gQ)id.safeSet(id.getLen()-1|0,103);var ic=id;}var ie=caml_classify_float(ib);if(3===ie)var ig=ib<0?bJ:bI;else if(4<=ie)var ig=bK;else{var ih=caml_format_float(ic,ib),ii=0,ij=ih.getLen();for(;;){if(ij<=ii)var ik=cn(ih,bH);else{var il=ih.safeGet(ii)-46|0,im=il<0||23<il?55===il?1:0:(il-1|0)<0||21<(il-1|0)?1:0;if(!im){var io=ii+1|0,ii=io;continue;}var ik=ih;}var ig=ik;break;}}var gW=gV(gJ(gN,gG),ig,gD+1|0),gR=1;break;case 91:var gW=fr(gs,gD,gQ),gR=1;break;case 97:var ip=gF(gN,gG),iq=cW(et,gy(gN,gG)),ir=gF(0,iq),iv=gD+1|0,iu=gJ(gN,iq);if(is)it(c9(ip,0,ir));else c9(ip,gp,ir);var gW=h8(iu,iv),gR=1;break;case 114:var gW=fr(gs,gD,gQ),gR=1;break;case 116:var iw=gF(gN,gG),iy=gD+1|0,ix=gJ(gN,gG);if(is)it(cW(iw,0));else cW(iw,gp);var gW=h8(ix,iy),gR=1;break;default:var gR=0;}if(!gR)var gW=fr(gs,gD,gQ);return gW;}},iD=gu+1|0,iA=0;return gO(gs,function(iC,iz){return gL(iC,iB,iA,iz);},iD);}c9(iE,gp,gx);var iF=gu+1|0,gu=iF;continue;}}function gV(iI,iG,iH){it(iG);return h8(iI,iH);}return h8(iJ,0);}var iL=c9(h$,iK,er(0)),iM=h7(gn);if(iM<0||6<iM){var iZ=function(iN,iT){if(iM<=iN){var iO=caml_make_vect(iM,0),iR=function(iP,iQ){return caml_array_set(iO,(iM-iP|0)-1|0,iQ);},iS=0,iU=iT;for(;;){if(iU){var iV=iU[2],iW=iU[1];if(iV){iR(iS,iW);var iX=iS+1|0,iS=iX,iU=iV;continue;}iR(iS,iW);}return c9(iL,gn,iO);}}return function(iY){return iZ(iN+1|0,[0,iY,iT]);};},i0=iZ(0,0);}else switch(iM){case 1:var i0=function(i2){var i1=caml_make_vect(1,0);caml_array_set(i1,0,i2);return c9(iL,gn,i1);};break;case 2:var i0=function(i4,i5){var i3=caml_make_vect(2,0);caml_array_set(i3,0,i4);caml_array_set(i3,1,i5);return c9(iL,gn,i3);};break;case 3:var i0=function(i7,i8,i9){var i6=caml_make_vect(3,0);caml_array_set(i6,0,i7);caml_array_set(i6,1,i8);caml_array_set(i6,2,i9);return c9(iL,gn,i6);};break;case 4:var i0=function(i$,ja,jb,jc){var i_=caml_make_vect(4,0);caml_array_set(i_,0,i$);caml_array_set(i_,1,ja);caml_array_set(i_,2,jb);caml_array_set(i_,3,jc);return c9(iL,gn,i_);};break;case 5:var i0=function(je,jf,jg,jh,ji){var jd=caml_make_vect(5,0);caml_array_set(jd,0,je);caml_array_set(jd,1,jf);caml_array_set(jd,2,jg);caml_array_set(jd,3,jh);caml_array_set(jd,4,ji);return c9(iL,gn,jd);};break;case 6:var i0=function(jk,jl,jm,jn,jo,jp){var jj=caml_make_vect(6,0);caml_array_set(jj,0,jk);caml_array_set(jj,1,jl);caml_array_set(jj,2,jm);caml_array_set(jj,3,jn);caml_array_set(jj,4,jo);caml_array_set(jj,5,jp);return c9(iL,gn,jj);};break;default:var i0=c9(iL,gn,[0]);}return i0;}function jx(jr){function jt(jq){return 0;}return jv(ju,0,function(js){return jr;},cL,cH,dv,jt);}function jK(jw){return c9(jx,cF,jw);}function jG(jy){return eh(2*jy.getLen()|0);}function jD(jB,jz){var jA=el(jz);jz[2]=0;return cW(jB,jA);}function jJ(jC){var jF=cW(jD,jC);return jv(ju,1,jG,em,en,function(jE){return 0;},jF);}function jL(jI){return c9(jJ,function(jH){return jH;},jI);}var jM=[0,0];function jT(jN,jO){var jP=jN[jO+1];return caml_obj_is_block(jP)?caml_obj_tag(jP)===ek?c9(jL,bb,jP):caml_obj_tag(jP)===ej?cx(jP):ba:c9(jL,bc,jP);}function jS(jQ,jR){if(jQ.length-1<=jR)return bw;var jU=jS(jQ,jR+1|0);return fl(jL,bv,jT(jQ,jR),jU);}function kn(jW){var jV=jM[1];for(;;){if(jV){var j1=jV[2],jX=jV[1];try {var jY=cW(jX,jW),jZ=jY;}catch(j2){var jZ=0;}if(!jZ){var jV=j1;continue;}var j0=jZ[1];}else if(jW[1]===ca)var j0=bl;else if(jW[1]===b_)var j0=bk;else if(jW[1]===b$){var j3=jW[2],j4=j3[3],j0=jv(jL,e,j3[1],j3[2],j4,j4+5|0,bj);}else if(jW[1]===d){var j5=jW[2],j6=j5[3],j0=jv(jL,e,j5[1],j5[2],j6,j6+6|0,bi);}else if(jW[1]===b9){var j7=jW[2],j8=j7[3],j0=jv(jL,e,j7[1],j7[2],j8,j8+6|0,bh);}else{var j9=jW.length-1,ka=jW[0+1][0+1];if(j9<0||2<j9){var j_=jS(jW,2),j$=fl(jL,bg,jT(jW,1),j_);}else switch(j9){case 1:var j$=be;break;case 2:var j$=c9(jL,bd,jT(jW,1));break;default:var j$=bf;}var j0=cn(ka,j$);}return j0;}}function ko(kk){var kb=caml_convert_raw_backtrace(caml_get_exception_raw_backtrace(0));if(kb){var kc=kb[1],kd=0,ke=kc.length-1-1|0;if(!(ke<kd)){var kf=kd;for(;;){if(caml_notequal(caml_array_get(kc,kf),bu)){var kg=caml_array_get(kc,kf),kh=0===kg[0]?kg[1]:kg[1],ki=kh?0===kf?br:bq:0===kf?bp:bo,kj=0===kg[0]?jv(jL,bn,ki,kg[2],kg[3],kg[4],kg[5]):c9(jL,bm,ki);fl(jx,kk,bt,kj);}var kl=kf+1|0;if(ke!==kf){var kf=kl;continue;}break;}}var km=0;}else var km=c9(jx,kk,bs);return km;}function ks(kp){kp[2]=(kp[2]+1|0)%55|0;var kq=caml_array_get(kp[1],kp[2]),kr=(caml_array_get(kp[1],(kp[2]+24|0)%55|0)+(kq^kq>>>25&31)|0)&1073741823;caml_array_set(kp[1],kp[2],kr);return kr;}32===d0;var kt=[0,a$.slice(),0];function kw(kv,ku){return caml_register_named_value(kv,ku[0+1]);}kw(a7,[0,[0,a_],a8]);kw(a6,[0,[0,a9]]);pcre_ocaml_init(0);function kD(kz,kx){var ky=251713540<=kx?613575188<=kx?978885248<=kx?979133625<=kx?8:16384:946806097<=kx?2048:16:426394317===kx?2:601676297<=kx?1:262144:-405330348<=kx?-246639943<=kx?-183446928<=kx?64:512:-381917576<=kx?8192:4096:-459022792<=kx?4:32;return ky|kz;}function kE(kC,kA){var kB=-466207028===kA?128:-360666271<=kA?613575188<=kA?16:32768:-466057841<=kA?256:1024;return kB|kC;}pcre_version_stub(0);pcre_config_utf8_stub(0);pcre_config_newline_stub(0);pcre_config_link_size_stub(0);pcre_config_match_limit_stub(0);pcre_config_match_limit_recursion_stub(0);pcre_config_stackrecurse_stub(0);function kQ(kF,kN,kP,kH,kJ,kL,kK){var kG=kF?kF[1]:1,kI=kH?kH[1]:0,kM=kJ?pcre_compile_stub(dx(kD,0,kJ[1]),kL,kK):pcre_compile_stub(kI,kL,kK);if(kG)pcre_study_stub(kM);var kO=kN?pcre_set_imp_match_limit_stub(kM,kN[1]):kM;return kP?pcre_set_imp_match_limit_recursion_stub(kO,kP[1]):kO;}kQ(0,0,0,0,0,0,a5);var kR=[0,a4],kS=48,kT=[0,0],kU=f.getLen()-1|0,kV=0,le=[0,0];for(;;){if(!(kU<kV))try {if(!(kU<kV)){var kW=kV;for(;;){if(36===f.safeGet(kW))throw [0,kR,kW];var kX=kW+1|0;if(kU!==kW){var kW=kX;continue;}break;}}}catch(kY){if(kY[1]!==kR)throw kY;var kZ=kY[2];if(kZ!==kU){var k0=kZ+1|0;kV===kZ;var k1=f.safeGet(k0);if(58<=k1){if(96===k1){var k2=k0+1|0,kV=k2;continue;}var k3=0;}else if(33<=k1)switch(k1-33|0){case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:var k4=[0,k1-kS|0];try {var k5=k0+1|0;if(!(kU<k5)){var k6=k5;for(;;){var k7=f.safeGet(k6);if(48<=k7&&!(57<k7)){k4[1]=((10*k4[1]|0)+k7|0)-kS|0;var k9=k6+1|0;if(kU!==k6){var k6=k9;continue;}var k8=1;}else var k8=0;if(!k8)throw [0,kR,k6];break;}}kT[1]=cc(k4[1],kT[1]);}catch(k_){if(k_[1]===kR){var k$=k_[2];kT[1]=cc(k4[1],kT[1]);var kV=k$;continue;}throw k_;}var k3=1;break;case 0:var la=k0+1|0,kV=la;continue;case 3:var lb=k0+1|0,kV=lb;continue;case 5:var lc=k0+1|0,kV=lc;continue;case 6:var ld=k0+1|0,kV=ld;continue;case 10:le[1]=1;var lf=k0+1|0,kV=lf;continue;default:var k3=0;}else var k3=0;if(!k3){var kV=k0;continue;}}}dx(kE,0,a3);var lh=function(lg){return kQ(0,0,0,0,0,0,lg);};lh(a2);lh(a1);lh(a0);lh(aZ);lh(aY);lh(aX);var lk=function(lj){var li=[];caml_update_dummy(li,[0,li,li]);return li;},ll=[0,aR],lm=[0,0],lu=42,lq=function(ln){var lo=ln[1];{if(3===lo[0]){var lp=lo[1],lr=lq(lp);if(lr!==lp)ln[1]=[3,lr];return lr;}return ln;}},lv=function(ls){return lq(ls);},lw=[0,function(lt){kn(lt);caml_ml_output_char(cy,10);ko(cy);cG(0);return caml_sys_exit(2);}],lW=function(ly,lx){try {var lz=cW(ly,lx);}catch(lA){return cW(lw[1],lA);}return lz;},lL=function(lF,lB,lD){var lC=lB,lE=lD;for(;;)if(typeof lC==="number")return lG(lF,lE);else switch(lC[0]){case 1:cW(lC[1],lF);return lG(lF,lE);case 2:var lH=lC[1],lI=[0,lC[2],lE],lC=lH,lE=lI;continue;default:var lJ=lC[1][1];return lJ?(cW(lJ[1],lF),lG(lF,lE)):lG(lF,lE);}},lG=function(lM,lK){return lK?lL(lM,lK[1],lK[2]):0;},lY=function(lN,lP){var lO=lN,lQ=lP;for(;;)if(typeof lO==="number")return lS(lQ);else switch(lO[0]){case 1:var lR=lO[1];if(lR[4]){lR[4]=0;lR[1][2]=lR[2];lR[2][1]=lR[1];}return lS(lQ);case 2:var lT=lO[1],lU=[0,lO[2],lQ],lO=lT,lQ=lU;continue;default:var lV=lO[2];lm[1]=lO[1];lW(lV,0);return lS(lQ);}},lS=function(lX){return lX?lY(lX[1],lX[2]):0;},l2=function(l0,lZ){var l1=1===lZ[0]?lZ[1][1]===ll?(lY(l0[4],0),1):0:0;return lL(lZ,l0[2],0);},l3=[0,0],l4=[0,0,0],mp=function(l7,l5){var l6=[0,l5],l8=lq(l7),l9=l8[1];switch(l9[0]){case 1:if(l9[1][1]===ll){var l_=0,l$=1;}else var l$=0;break;case 2:var ma=l9[1];l8[1]=l6;var mb=lm[1],mc=l3[1]?1:(l3[1]=1,0);l2(ma,l6);if(mc){lm[1]=mb;var md=0;}else for(;;){if(0!==l4[1]){if(0===l4[1])throw [0,ei];l4[1]=l4[1]-1|0;var me=l4[2],mf=me[2];if(mf===me)l4[2]=0;else me[2]=mf[2];var mg=mf[1];l2(mg[1],mg[2]);continue;}l3[1]=0;lm[1]=mb;var md=0;break;}var l_=md,l$=1;break;default:var l$=0;}if(!l$)var l_=cb(aS);return l_;},mn=function(mh,mi){return typeof mh==="number"?mi:typeof mi==="number"?mh:[2,mh,mi];},mk=function(mj){if(typeof mj!=="number")switch(mj[0]){case 2:var ml=mj[1],mm=mk(mj[2]);return mn(mk(ml),mm);case 1:break;default:if(!mj[1][1])return 0;}return mj;},mr=[0,function(mo){return 0;}],mq=lk(0),mu=[0,0],mD=function(my){var ms=1-(mq[2]===mq?1:0);if(ms){var mt=lk(0);mt[1][2]=mq[2];mq[2][1]=mt[1];mt[1]=mq[1];mq[1][2]=mt;mq[1]=mq;mq[2]=mq;mu[1]=0;var mv=mt[2];for(;;){var mw=mv!==mt?1:0;if(mw){if(mv[4])mp(mv[3],0);var mx=mv[2],mv=mx;continue;}return mw;}}return ms;},mC=null,mB=undefined,mA=Array,mE=function(mz){return mz instanceof mA?0:[0,new MlWrappedString(mz.toString())];};jM[1]=[0,mE,jM[1]];var mF=this,mG=mF.document,mI=aP.toString(),mH=[0,aO];this.HTMLElement===mB;var mJ=2147483,mL=caml_js_get_console(0);mr[1]=function(mK){return 1===mK?(mF.setTimeout(caml_js_wrap_callback(mD),0),0):0;};var mN=function(mM){return mL.log(mM.toString());};lw[1]=function(mO){mN(aN);mN(kn(mO));return ko(cy);};var mX=function(mQ,mP){return [1,0,mQ,mP];},mV=function(mS,mR){return [1,1,mS,mR];},mY=function(mU,mT){return [1,2,mU,mT];},mZ=function(mW){return mV(aM,mW);},m0=[],m4=[];caml_update_dummy(m4,function(m2,m1){{if(0===m1[0])return cn(az,cn(cW(m2,m1[1]),aA));var m3=m1[1];return cn(aw,cn(m3,cn(ax,cn(cn(at,cn(dZ(au,cY(m0,m1[2])),av)),ay))));}});caml_update_dummy(m0,function(m5){if(typeof m5==="number")return 0===m5?aL:aK;else switch(m5[0]){case 1:var m7=m5[2],m6=m5[1],m9=cn(cW(m0,m5[3]),aI);switch(m6){case 1:var m8=aE;break;case 2:var m8=aD;break;case 3:var m8=aC;break;case 4:var m8=aB;break;default:var m8=aF;}var m_=cn(m8,m9);return cn(aH,cn(cW(m0,m7),m_));case 2:return cn(aG,cw(m5[1]));default:return cn(aJ,cx(m5[1]));}});var oB=function(na,m$){return [0,na[1]+m$[1],na[2]+m$[2]];},oC=function(nc,nb){return [0,nc[1]-nb[1],nc[2]-nb[2]];},nh=function(nd,ne){return [0,nd[1]*ne,nd[2]*ne];},oD=function(nf){var ng=2*Math.acos(-1)*nf/360;return nh([0,Math.sin(ng),Math.cos(ng)],0.4);},ny=function(ni){switch(ni){case 1:return function(nj,nk){return nj-nk;};case 2:return function(nl,nm){return nl*nm;};case 3:return function(nn,no){return nn/no;};case 4:return function(nq,np){return caml_mod(nq|0,np|0);};default:return function(nr,ns){return nr+ns;};}},nu=function(nt){if(typeof nt==="number"){if(0===nt){var nz=1073741824,nA=ks(kt);return (nA/nz+ks(kt))/nz*1;}return 0.5;}else switch(nt[0]){case 1:var nw=nt[2],nv=nt[1],nx=nu(nt[3]);return fl(ny,nv,nu(nw),nx);case 2:return l(as);default:return nt[1];}},nD=function(nC,nB){if(typeof nB!=="number")switch(nB[0]){case 2:return dy(nB[1],nC);case 0:break;default:var nF=nB[2],nE=nB[1],nG=nD(nC,nB[3]);return [1,nE,nD(nC,nF),nG];}return nB;},n3=function(nI,nH){switch(nH[0]){case 1:return [1,nD(nI,nH[1])];case 2:return [2,nD(nI,nH[1])];case 3:return [3,nD(nI,nH[1])];default:return [0,nD(nI,nH[1])];}},n0=function(nK,nJ){switch(nJ[0]){case 1:return [1,nD(nK,nJ[1])];case 2:return [2,nD(nK,nJ[1])];default:return [0,nD(nK,nJ[1])];}},nW=function(nN,nM,nL){{if(0===nL[0])return [0,c9(nN,nM,nL[1])];var nP=nL[2],nO=nL[1];return [1,nO,cY(cW(nD,nM),nP)];}},n6=function(nS,nR,nQ){return nQ?[0,c9(nS,nR,nQ[1])]:0;},n9=function(nT){return cW(cY,cW(nU,nT));},nU=function(nX,nV){if(typeof nV==="number")return 0;else switch(nV[0]){case 1:return [1,nW(nY,nX,nV[1])];case 2:var nZ=nV[1],n1=nD(nX,nV[2]);return [2,n0(nX,nZ),n1];case 3:var n2=nV[1],n4=nD(nX,nV[2]);return [3,n3(nX,n2),n4];case 4:var n5=nV[1],n7=nD(nX,nV[3]),n8=n6(nD,nX,n5);return [4,n6(nD,nX,n5),n8,n7];case 5:return [5,nD(nX,nV[1])];case 6:return [6,nW(n9,nX,nV[1])];default:var n_=nV[1],n$=nW(n9,nX,nV[2]);return [0,nD(nX,n_),n$];}},nY=function(ob,oa){var oe=oa[2],od=oa[1],of=nW(oc,ob,oa[3]),og=n6(n0,ob,oe);return [0,n6(n3,ob,od),og,of];},oc=function(oi,oh){var ol=oh[3],ok=oh[2],oj=oh[1],om=cY(c9(nW,n9,oi),ol),on=n6(n0,oi,ok);return [0,n6(n3,oi,oj),on,om];},oy=function(oq){var oo=[0,0];return cY(function(op){oo[1]+=1;return [0,oo[1],op];},oq);},oE=function(ot,oz,os,or){{if(0===or[0])return or[1];var ov=or[2],ou=or[1],ox=dy(ou,cW(ot,os));return c9(oz,oy(cY(function(ow){return [0,nu(ow)];},ov)),ox);}},oG=c9(oE,function(oA){return oA[5];},n9),oI=c9(oE,function(oF){return oF[6];},oc),oQ=c9(oE,function(oH){return oH[7];},nY),qf=function(oK,oJ){return oJ[3]+(oK[1]-oJ[1]|0)*(oJ[4]-oJ[3])/(oJ[2]-oJ[1]|0);},oM=function(oL,oN){if(0<=oL)return 0===oL?0:[0,oN,oM(oL-1|0,oN)];throw [0,d,ar];},o1=function(oP,oR,oO){if(typeof oO==="number")return [0,0,oR];else switch(oO[0]){case 1:return [0,[3,c9(oQ,oP,oO[1])],oR];case 2:return [0,[4,oO[1],oO[2]],oR];case 3:return [0,[6,oO[1],oO[2]],oR];case 4:var oW=oO[3],oV=oO[2],oU=oO[1],oT=function(oS){return oS?oS[1]:aq;},oX=oT(oV);return [0,[8,oT(oU),oX,oW],oR];case 5:return [0,[1,oO[1]],oR];case 6:var oY=oO[1];return 0===oY[0]?oZ(oP,oY[1],oR):[0,[10,oY[1],oY[2]],oR];default:var o0=oO[1];return [0,[0,o0,c9(oG,oP,oO[2])],oR];}},oZ=function(o4,o6,o5){return db(function(o2,o3){return o1(o4,o3,o2);},o6,o5);},pZ=function(o_,o8,o7){switch(o7[0]){case 1:var o9=o8[6];return nu(o7[1])+o9;case 2:var pa=o7[1],o$=oC(o_[2],o8[5]),pb=Math.atan2(o$[2],o$[1]);return nu(pa)+pb;case 3:var pc=o8[3];return nu(o7[1])+pc;default:return nu(o7[1]);}},p1=function(pe,pd){switch(pd[0]){case 1:var pf=pe[2];return nu(pd[1])+pf;case 2:var pg=pe[7];return nu(pd[1])+pg;default:return nu(pd[1]);}},pU=function(ph,pi,pj){return ph?ph[1]:pi?pi[1]:pj;},pA=function(pw,pk){var pz=pk[4],pB=c9(dz,function(pl){var pm=0===pl[4]?1:0;if(pm){var pn=pl[8];if(pn){var po=pn,pp=0;}else{var pq=pl[5],pr=pq[2],ps=pq[1],pt=ps<0?1:0;if(pt)var pu=pt;else{var pv=pr<0?1:0;if(pv)var pu=pv;else{var px=pw[3]<=ps?1:0,pu=px?px:pw[3]<=pr?1:0;}}var py=pu,pp=1;}}else{var po=pm,pp=0;}if(!pp)var py=po;return 1-py;},pz),pD=cY(cW(pA,pw),pB),pC=pk.slice();pC[4]=pD;var pE=pC;for(;;){var pF=pE[1];if(pF){var pG=pF[1];if(typeof pG==="number"){var qS=pE.slice();qS[1]=0;qS[8]=1;var pE=qS;continue;}else switch(pG[0]){case 1:var pH=pF[2],pJ=nu(pG[1])|0,pI=pE.slice();pI[1]=[0,[2,pJ],pH];var pE=pI;continue;case 2:var pK=pG[1];if(0===pK){var pL=pE.slice();pL[1]=pF[2];var pE=pL;continue;}if(1===pK){var pM=pE.slice();pM[1]=pF[2];var pN=pM;}else{var pO=pE.slice();pO[1]=[0,[2,pK-1|0],pF[2]];var pN=pO;}break;case 3:var pP=pG[1],pT=pF[2],pS=pP[2],pR=pP[1],pQ=c9(oI,pw,pP[3]),pX=pQ[3],pW=pQ[2],pV=pU(pQ[1],pR,[0,[0,pE[3]]]),pY=pU(pW,pS,[0,[0,pE[2]]]),p0=pZ(pw,pE,pV),p2=p1(pE,pY),p4=oZ(pw,cY(function(p3){return [6,p3];},pX),0),p6=[0,p4,p2,p0,0,pE[5],pE[6],pE[7],pE[8]],p5=1===pV[0]?p0:pE[6],p7=2===pY[0]?p2:pE[7],pN=[0,pT,pE[2],pE[3],[0,p6,pE[4]],pE[5],p5,p7,pE[8]];break;case 4:var p9=pF[2],p8=pG[2],p_=p1(pE,pG[1]),p$=nu(p8)|0,qa=pE.slice();qa[1]=[0,[5,[0,pw[1],pw[1]+p$|0,pE[2],p_]],p9];var pE=qa;continue;case 5:var qb=pG[1],qd=pF[2];if(qb[2]<pw[1]){var qc=pE.slice();qc[1]=qd;var pN=qc;}else{var qe=pE.slice();qe[2]=qf(pw,qb);var pN=qe;}break;case 6:var qh=pF[2],qg=pG[2],qi=pZ(pw,pE,pG[1]),qj=nu(qg)|0,qk=pE.slice();qk[1]=[0,[7,[0,pw[1],pw[1]+qj|0,pE[3],qi]],qh];var pE=qk;continue;case 7:var ql=pG[1],qn=pF[2];if(ql[2]<pw[1]){var qm=pE.slice();qm[1]=qn;var pN=qm;}else{var qo=pE.slice();qo[3]=qf(pw,ql);var pN=qo;}break;case 8:var qr=pF[2],qq=pG[3],qp=pG[2],qs=nu(pG[1]),qt=nu(qp),qu=nu(qq),qv=pE[2],qw=nh(oD(pE[3]),qv),qx=oB(qw,[0,qs,qt]),qy=pE.slice();qy[1]=[0,[9,[0,pw[1],pw[1]+(qu|0)|0,qw,qx]],qr];var pE=qy;continue;case 9:var qz=pG[1],qB=pF[2];if(qz[2]<pw[1]){var qA=pE.slice();qA[1]=qB;var pN=qA;}else{var qC=(pw[1]-qz[1]|0)/(qz[2]-qz[1]|0),qD=nh(oC(qz[4],qz[3]),qC),qE=oB(qz[3],qD),qF=qE[2],qG=qE[1],qH=pE.slice();qH[2]=caml_hypot_float(qG,qF);qH[3]=Math.atan2(qG,qF);var pN=qH;}break;case 10:var qJ=pF[2],qI=pG[2],qL=dy(pG[1],pw[5]),qN=c9(n9,oy(cY(function(qK){return [0,nu(qK)];},qI)),qL),qM=pE.slice();qM[1]=oZ(pw,qN,qJ);var pE=qM;continue;default:var qP=pF[2],qO=pG[2],qR=nu(pG[1])|0,qQ=pE.slice();qQ[1]=oZ(pw,cS(oM(qR,qO)),qP);var pE=qQ;continue;}}else var pN=pE;var qT=pN.slice(),qU=pN[2],qV=nh(oD(pN[3]),qU);qT[5]=oB(pN[5],qV);return qT;}},qX=function(qW){return ct([0,qW,0],cS(cY(qX,qW[4])));},qY=[0,af,[0,ag,[0,ah,[0,ai,[0,aj,[0,[1,[1,ak,[0,mZ(al),0]]],am]]]]]],qZ=[0,ab,[0,[1,ac,[0,[1,[0,[0,[0,[0,mZ(ad)]],0,ae]]],qY]],0]],q0=[0,Z,[0,[5,mX(mV(_,mY(1,$)),0)],0]],q1=[0,[0,[1,[0,[0,[0,[1,mY(mV(V,mY(1,W)),X)]],Y,[0,g]]]],q0]],q2=[0,[0,0,0,[0,[0,[0,R,[0,S,[0,[0,mX(T,mY(1,U)),q1],aa]]]],0]]],q3=[0,[1,I,[0,[0,J,[0,[0,[1,[0,[0,K,L,[0,g]]]],0]]],0]],[0,[2,M,[0,[0,[0,mX(N,mY(O,P))]],Q,q2]],qZ]],q4=[0,[5,[1,3,E,mX(F,mY(1,G))]],0],q5=[0,y,[0,[0,z,[0,[0,[1,[0,[0,A,[0,[2,mX(B,mY(1,C))]],[0,g]]]],D]]],q4]],q6=mY(0,w),q7=[0,[0,[1,[0,[0,[0,[1,mV(mZ(v),q6)]],x,[0,g]]]],q5]],q8=400,q9=300,re=[0,[0,o,[0,0,p,[0,[0,[0,q,[0,r,[0,s,[0,[0,mX(t,mY(1,u)),q7],H]]]]],0]]],q3],rd=function(rc,rb,q$,q_){var ra=4*((q_*q8|0)+q$|0)|0;rb[ra+0|0]=250;rb[ra+1|0]=105;rb[ra+2|0]=0;rb[ra+3|0]=255;return 0;},rf=mG.createElement(aQ.toString());if(1-(rf.getContext==mC?1:0)){rf.width=q8;rf.height=q9;mG.body.appendChild(rf);var rg=[0,0],rh=[0,0],ri=[0,0];dw(function(rj){switch(rj[0]){case 1:rg[1]=[0,[0,rj[1],rj[2]],rg[1]];return 0;case 2:ri[1]=[0,[0,rj[1],rj[2]],ri[1]];return 0;default:rh[1]=[0,[0,rj[1],rj[2]],rh[1]];return 0;}},re);var rk=ri[1],rl=rh[1],rm=rg[1],rp=function(ro){return dZ(ap,cY(function(rn){return rn[1];},ro));},rq=rp(rk),rr=rp(rl);rs(jK,ao,rp(rm),rr,rq);var rt=an;for(;;){if(rt){var rx=rt[2],ru=rt[1];try {var rv=dy(ru,rm);}catch(rw){if(rw[1]===c){var rt=rx;continue;}throw rw;}var ry=[0,0,m,q8,q9,rm,rl,rk],sH=[0,o1(ry,0,[6,[0,rv]]),0,0,0,n,0,0,0],rU=function(rA,rL){var rz=ry.slice();rz[1]=rA;var rB=rf.getContext(mI),rC=rB.getImageData(0,0,q8,q9),rD=rC.data,rE=0;if(!(q8<rE)){var rF=rE;for(;;){var rG=0;if(!(q9<rG)){var rH=rG;for(;;){var rI=4*((rH*q8|0)+rF|0)|0;rD[rI+0|0]=255;rD[rI+1|0]=255;rD[rI+2|0]=255;rD[rI+3|0]=255;var rJ=rH+1|0;if(q9!==rH){var rH=rJ;continue;}break;}}var rK=rF+1|0;if(q8!==rF){var rF=rK;continue;}break;}}var rN=qX(rL),rT=c9(dz,function(rM){return 1-rM[8];},rN);dw(function(rO){var rP=rO[5],rQ=rC.data,rR=rP[1]|0,rS=rP[2]|0;rd(rB,rQ,rR,rS);rd(rB,rQ,rR,rS+1|0);rd(rB,rQ,rR+1|0,rS);rd(rB,rQ,rR,rS-1|0);rd(rB,rQ,rR-1|0,rS);return 0;},rT);rB.putImageData(rC,0,0);function rW(rV){return rU(rA+1|0,pA(rz,rL));}var rX=[0,[2,[0,1,0,0,0]]],rY=[0,0],r6=0;function r3(rZ,r5){var r0=mJ<rZ?[0,mJ,rZ-mJ]:[0,rZ,0],r1=r0[2],r4=r0[1],r2=r1==0?cW(mp,rX):cW(r3,r1);rY[1]=[0,mF.setTimeout(caml_js_wrap_callback(r2),r4*1e3)];return 0;}r3(r6,0);function r9(r8){var r7=rY[1];return r7?mF.clearTimeout(r7[1]):0;}var r_=lv(rX)[1];switch(r_[0]){case 1:var r$=r_[1][1]===ll?(lW(r9,0),1):0;break;case 2:var sa=r_[1],sb=[0,lm[1],r9],sc=sa[4],sd=typeof sc==="number"?sb:[2,sb,sc];sa[4]=sd;var r$=1;break;default:var r$=0;}var se=lv(rX),sf=se[1];switch(sf[0]){case 1:var sg=[0,sf];break;case 2:var sh=sf[1],si=[0,[2,[0,[0,[0,se]],0,0,0]]],sk=lm[1],sE=[1,function(sj){switch(sj[0]){case 0:var sl=sj[1];lm[1]=sk;try {var sm=rW(sl),sn=sm;}catch(so){var sn=[0,[1,so]];}var sp=lv(si),sq=lv(sn),sr=sp[1];{if(2===sr[0]){var ss=sr[1];if(sp===sq)var st=0;else{var su=sq[1];if(2===su[0]){var sv=su[1];sq[1]=[3,sp];ss[1]=sv[1];var sw=mn(ss[2],sv[2]),sx=ss[3]+sv[3]|0;if(lu<sx){ss[3]=0;ss[2]=mk(sw);}else{ss[3]=sx;ss[2]=sw;}var sy=sv[4],sz=ss[4],sA=typeof sz==="number"?sy:typeof sy==="number"?sz:[2,sz,sy];ss[4]=sA;var st=0;}else{sp[1]=su;var st=l2(ss,su);}}return st;}throw [0,d,aT];}case 1:var sB=lv(si),sC=sB[1];{if(2===sC[0]){var sD=sC[1];sB[1]=sj;return l2(sD,sj);}throw [0,d,aU];}default:throw [0,d,aW];}}],sF=sh[2],sG=typeof sF==="number"?sE:[2,sE,sF];sh[2]=sG;var sg=si;break;case 3:throw [0,d,aV];default:var sg=rW(sf[1]);}return sg;};rU(1,sH);cG(0);return;}throw [0,c];}}throw [0,mH];}}());
