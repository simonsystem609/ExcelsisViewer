var b_=Object.create;var Vc=Object.defineProperty;var w_=Object.getOwnPropertyDescriptor;var E_=Object.getOwnPropertyNames;var A_=Object.getPrototypeOf,T_=Object.prototype.hasOwnProperty;var Gc=(n,t)=>()=>(t||n((t={exports:{}}).exports,t),t.exports),R_=(n,t)=>{for(var e in t)Vc(n,e,{get:t[e],enumerable:!0})},C_=(n,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of E_(t))!T_.call(n,r)&&r!==e&&Vc(n,r,{get:()=>t[r],enumerable:!(i=w_(t,r))||i.enumerable});return n};var I_=(n,t,e)=>(e=n!=null?b_(A_(n)):{},C_(t||!n||!n.__esModule?Vc(e,"default",{value:n,enumerable:!0}):e,n));var Fd=Gc(no=>{"use strict";no.byteLength=L_;no.toByteArray=D_;no.fromByteArray=O_;var Tn=[],fn=[],P_=typeof Uint8Array<"u"?Uint8Array:Array,Wc="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(zi=0,Dd=Wc.length;zi<Dd;++zi)Tn[zi]=Wc[zi],fn[Wc.charCodeAt(zi)]=zi;var zi,Dd;fn[45]=62;fn[95]=63;function Nd(n){var t=n.length;if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var e=n.indexOf("=");e===-1&&(e=t);var i=e===t?0:4-e%4;return[e,i]}function L_(n){var t=Nd(n),e=t[0],i=t[1];return(e+i)*3/4-i}function U_(n,t,e){return(t+e)*3/4-e}function D_(n){var t,e=Nd(n),i=e[0],r=e[1],s=new P_(U_(n,i,r)),a=0,o=r>0?i-4:i,c;for(c=0;c<o;c+=4)t=fn[n.charCodeAt(c)]<<18|fn[n.charCodeAt(c+1)]<<12|fn[n.charCodeAt(c+2)]<<6|fn[n.charCodeAt(c+3)],s[a++]=t>>16&255,s[a++]=t>>8&255,s[a++]=t&255;return r===2&&(t=fn[n.charCodeAt(c)]<<2|fn[n.charCodeAt(c+1)]>>4,s[a++]=t&255),r===1&&(t=fn[n.charCodeAt(c)]<<10|fn[n.charCodeAt(c+1)]<<4|fn[n.charCodeAt(c+2)]>>2,s[a++]=t>>8&255,s[a++]=t&255),s}function N_(n){return Tn[n>>18&63]+Tn[n>>12&63]+Tn[n>>6&63]+Tn[n&63]}function F_(n,t,e){for(var i,r=[],s=t;s<e;s+=3)i=(n[s]<<16&16711680)+(n[s+1]<<8&65280)+(n[s+2]&255),r.push(N_(i));return r.join("")}function O_(n){for(var t,e=n.length,i=e%3,r=[],s=16383,a=0,o=e-i;a<o;a+=s)r.push(F_(n,a,a+s>o?o:a+s));return i===1?(t=n[e-1],r.push(Tn[t>>2]+Tn[t<<4&63]+"==")):i===2&&(t=(n[e-2]<<8)+n[e-1],r.push(Tn[t>>10]+Tn[t>>4&63]+Tn[t<<2&63]+"=")),r.join("")}});var Od=Gc(Xc=>{Xc.read=function(n,t,e,i,r){var s,a,o=r*8-i-1,c=(1<<o)-1,l=c>>1,h=-7,u=e?r-1:0,f=e?-1:1,d=n[t+u];for(u+=f,s=d&(1<<-h)-1,d>>=-h,h+=o;h>0;s=s*256+n[t+u],u+=f,h-=8);for(a=s&(1<<-h)-1,s>>=-h,h+=i;h>0;a=a*256+n[t+u],u+=f,h-=8);if(s===0)s=1-l;else{if(s===c)return a?NaN:(d?-1:1)*(1/0);a=a+Math.pow(2,i),s=s-l}return(d?-1:1)*a*Math.pow(2,s-i)};Xc.write=function(n,t,e,i,r,s){var a,o,c,l=s*8-r-1,h=(1<<l)-1,u=h>>1,f=r===23?Math.pow(2,-24)-Math.pow(2,-77):0,d=i?0:s-1,m=i?1:-1,_=t<0||t===0&&1/t<0?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(o=isNaN(t)?1:0,a=h):(a=Math.floor(Math.log(t)/Math.LN2),t*(c=Math.pow(2,-a))<1&&(a--,c*=2),a+u>=1?t+=f/c:t+=f*Math.pow(2,1-u),t*c>=2&&(a++,c/=2),a+u>=h?(o=0,a=h):a+u>=1?(o=(t*c-1)*Math.pow(2,r),a=a+u):(o=t*Math.pow(2,u-1)*Math.pow(2,r),a=0));r>=8;n[e+d]=o&255,d+=m,o/=256,r-=8);for(a=a<<r|o,l+=r;l>0;n[e+d]=a&255,d+=m,a/=256,l-=8);n[e+d-m]|=_*128}});var tp=Gc(Rr=>{"use strict";var qc=Fd(),Ar=Od(),Bd=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;Rr.Buffer=G;Rr.SlowBuffer=G_;Rr.INSPECT_MAX_BYTES=50;var io=2147483647;Rr.kMaxLength=io;G.TYPED_ARRAY_SUPPORT=B_();!G.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function B_(){try{let n=new Uint8Array(1),t={foo:function(){return 42}};return Object.setPrototypeOf(t,Uint8Array.prototype),Object.setPrototypeOf(n,t),n.foo()===42}catch{return!1}}Object.defineProperty(G.prototype,"parent",{enumerable:!0,get:function(){if(G.isBuffer(this))return this.buffer}});Object.defineProperty(G.prototype,"offset",{enumerable:!0,get:function(){if(G.isBuffer(this))return this.byteOffset}});function Vn(n){if(n>io)throw new RangeError('The value "'+n+'" is invalid for option "size"');let t=new Uint8Array(n);return Object.setPrototypeOf(t,G.prototype),t}function G(n,t,e){if(typeof n=="number"){if(typeof t=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return Jc(n)}return Vd(n,t,e)}G.poolSize=8192;function Vd(n,t,e){if(typeof n=="string")return k_(n,t);if(ArrayBuffer.isView(n))return H_(n);if(n==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof n);if(Rn(n,ArrayBuffer)||n&&Rn(n.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(Rn(n,SharedArrayBuffer)||n&&Rn(n.buffer,SharedArrayBuffer)))return Zc(n,t,e);if(typeof n=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');let i=n.valueOf&&n.valueOf();if(i!=null&&i!==n)return G.from(i,t,e);let r=V_(n);if(r)return r;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof n[Symbol.toPrimitive]=="function")return G.from(n[Symbol.toPrimitive]("string"),t,e);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof n)}G.from=function(n,t,e){return Vd(n,t,e)};Object.setPrototypeOf(G.prototype,Uint8Array.prototype);Object.setPrototypeOf(G,Uint8Array);function Gd(n){if(typeof n!="number")throw new TypeError('"size" argument must be of type number');if(n<0)throw new RangeError('The value "'+n+'" is invalid for option "size"')}function z_(n,t,e){return Gd(n),n<=0?Vn(n):t!==void 0?typeof e=="string"?Vn(n).fill(t,e):Vn(n).fill(t):Vn(n)}G.alloc=function(n,t,e){return z_(n,t,e)};function Jc(n){return Gd(n),Vn(n<0?0:Kc(n)|0)}G.allocUnsafe=function(n){return Jc(n)};G.allocUnsafeSlow=function(n){return Jc(n)};function k_(n,t){if((typeof t!="string"||t==="")&&(t="utf8"),!G.isEncoding(t))throw new TypeError("Unknown encoding: "+t);let e=Wd(n,t)|0,i=Vn(e),r=i.write(n,t);return r!==e&&(i=i.slice(0,r)),i}function Yc(n){let t=n.length<0?0:Kc(n.length)|0,e=Vn(t);for(let i=0;i<t;i+=1)e[i]=n[i]&255;return e}function H_(n){if(Rn(n,Uint8Array)){let t=new Uint8Array(n);return Zc(t.buffer,t.byteOffset,t.byteLength)}return Yc(n)}function Zc(n,t,e){if(t<0||n.byteLength<t)throw new RangeError('"offset" is outside of buffer bounds');if(n.byteLength<t+(e||0))throw new RangeError('"length" is outside of buffer bounds');let i;return t===void 0&&e===void 0?i=new Uint8Array(n):e===void 0?i=new Uint8Array(n,t):i=new Uint8Array(n,t,e),Object.setPrototypeOf(i,G.prototype),i}function V_(n){if(G.isBuffer(n)){let t=Kc(n.length)|0,e=Vn(t);return e.length===0||n.copy(e,0,0,t),e}if(n.length!==void 0)return typeof n.length!="number"||jc(n.length)?Vn(0):Yc(n);if(n.type==="Buffer"&&Array.isArray(n.data))return Yc(n.data)}function Kc(n){if(n>=io)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+io.toString(16)+" bytes");return n|0}function G_(n){return+n!=n&&(n=0),G.alloc(+n)}G.isBuffer=function(t){return t!=null&&t._isBuffer===!0&&t!==G.prototype};G.compare=function(t,e){if(Rn(t,Uint8Array)&&(t=G.from(t,t.offset,t.byteLength)),Rn(e,Uint8Array)&&(e=G.from(e,e.offset,e.byteLength)),!G.isBuffer(t)||!G.isBuffer(e))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(t===e)return 0;let i=t.length,r=e.length;for(let s=0,a=Math.min(i,r);s<a;++s)if(t[s]!==e[s]){i=t[s],r=e[s];break}return i<r?-1:r<i?1:0};G.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}};G.concat=function(t,e){if(!Array.isArray(t))throw new TypeError('"list" argument must be an Array of Buffers');if(t.length===0)return G.alloc(0);let i;if(e===void 0)for(e=0,i=0;i<t.length;++i)e+=t[i].length;let r=G.allocUnsafe(e),s=0;for(i=0;i<t.length;++i){let a=t[i];if(Rn(a,Uint8Array))s+a.length>r.length?(G.isBuffer(a)||(a=G.from(a)),a.copy(r,s)):Uint8Array.prototype.set.call(r,a,s);else if(G.isBuffer(a))a.copy(r,s);else throw new TypeError('"list" argument must be an Array of Buffers');s+=a.length}return r};function Wd(n,t){if(G.isBuffer(n))return n.length;if(ArrayBuffer.isView(n)||Rn(n,ArrayBuffer))return n.byteLength;if(typeof n!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof n);let e=n.length,i=arguments.length>2&&arguments[2]===!0;if(!i&&e===0)return 0;let r=!1;for(;;)switch(t){case"ascii":case"latin1":case"binary":return e;case"utf8":case"utf-8":return $c(n).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return e*2;case"hex":return e>>>1;case"base64":return jd(n).length;default:if(r)return i?-1:$c(n).length;t=(""+t).toLowerCase(),r=!0}}G.byteLength=Wd;function W_(n,t,e){let i=!1;if((t===void 0||t<0)&&(t=0),t>this.length||((e===void 0||e>this.length)&&(e=this.length),e<=0)||(e>>>=0,t>>>=0,e<=t))return"";for(n||(n="utf8");;)switch(n){case"hex":return tx(this,t,e);case"utf8":case"utf-8":return qd(this,t,e);case"ascii":return Q_(this,t,e);case"latin1":case"binary":return j_(this,t,e);case"base64":return J_(this,t,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ex(this,t,e);default:if(i)throw new TypeError("Unknown encoding: "+n);n=(n+"").toLowerCase(),i=!0}}G.prototype._isBuffer=!0;function ki(n,t,e){let i=n[t];n[t]=n[e],n[e]=i}G.prototype.swap16=function(){let t=this.length;if(t%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let e=0;e<t;e+=2)ki(this,e,e+1);return this};G.prototype.swap32=function(){let t=this.length;if(t%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let e=0;e<t;e+=4)ki(this,e,e+3),ki(this,e+1,e+2);return this};G.prototype.swap64=function(){let t=this.length;if(t%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let e=0;e<t;e+=8)ki(this,e,e+7),ki(this,e+1,e+6),ki(this,e+2,e+5),ki(this,e+3,e+4);return this};G.prototype.toString=function(){let t=this.length;return t===0?"":arguments.length===0?qd(this,0,t):W_.apply(this,arguments)};G.prototype.toLocaleString=G.prototype.toString;G.prototype.equals=function(t){if(!G.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t?!0:G.compare(this,t)===0};G.prototype.inspect=function(){let t="",e=Rr.INSPECT_MAX_BYTES;return t=this.toString("hex",0,e).replace(/(.{2})/g,"$1 ").trim(),this.length>e&&(t+=" ... "),"<Buffer "+t+">"};Bd&&(G.prototype[Bd]=G.prototype.inspect);G.prototype.compare=function(t,e,i,r,s){if(Rn(t,Uint8Array)&&(t=G.from(t,t.offset,t.byteLength)),!G.isBuffer(t))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof t);if(e===void 0&&(e=0),i===void 0&&(i=t?t.length:0),r===void 0&&(r=0),s===void 0&&(s=this.length),e<0||i>t.length||r<0||s>this.length)throw new RangeError("out of range index");if(r>=s&&e>=i)return 0;if(r>=s)return-1;if(e>=i)return 1;if(e>>>=0,i>>>=0,r>>>=0,s>>>=0,this===t)return 0;let a=s-r,o=i-e,c=Math.min(a,o),l=this.slice(r,s),h=t.slice(e,i);for(let u=0;u<c;++u)if(l[u]!==h[u]){a=l[u],o=h[u];break}return a<o?-1:o<a?1:0};function Xd(n,t,e,i,r){if(n.length===0)return-1;if(typeof e=="string"?(i=e,e=0):e>2147483647?e=2147483647:e<-2147483648&&(e=-2147483648),e=+e,jc(e)&&(e=r?0:n.length-1),e<0&&(e=n.length+e),e>=n.length){if(r)return-1;e=n.length-1}else if(e<0)if(r)e=0;else return-1;if(typeof t=="string"&&(t=G.from(t,i)),G.isBuffer(t))return t.length===0?-1:zd(n,t,e,i,r);if(typeof t=="number")return t=t&255,typeof Uint8Array.prototype.indexOf=="function"?r?Uint8Array.prototype.indexOf.call(n,t,e):Uint8Array.prototype.lastIndexOf.call(n,t,e):zd(n,[t],e,i,r);throw new TypeError("val must be string, number or Buffer")}function zd(n,t,e,i,r){let s=1,a=n.length,o=t.length;if(i!==void 0&&(i=String(i).toLowerCase(),i==="ucs2"||i==="ucs-2"||i==="utf16le"||i==="utf-16le")){if(n.length<2||t.length<2)return-1;s=2,a/=2,o/=2,e/=2}function c(h,u){return s===1?h[u]:h.readUInt16BE(u*s)}let l;if(r){let h=-1;for(l=e;l<a;l++)if(c(n,l)===c(t,h===-1?0:l-h)){if(h===-1&&(h=l),l-h+1===o)return h*s}else h!==-1&&(l-=l-h),h=-1}else for(e+o>a&&(e=a-o),l=e;l>=0;l--){let h=!0;for(let u=0;u<o;u++)if(c(n,l+u)!==c(t,u)){h=!1;break}if(h)return l}return-1}G.prototype.includes=function(t,e,i){return this.indexOf(t,e,i)!==-1};G.prototype.indexOf=function(t,e,i){return Xd(this,t,e,i,!0)};G.prototype.lastIndexOf=function(t,e,i){return Xd(this,t,e,i,!1)};function X_(n,t,e,i){e=Number(e)||0;let r=n.length-e;i?(i=Number(i),i>r&&(i=r)):i=r;let s=t.length;i>s/2&&(i=s/2);let a;for(a=0;a<i;++a){let o=parseInt(t.substr(a*2,2),16);if(jc(o))return a;n[e+a]=o}return a}function q_(n,t,e,i){return ro($c(t,n.length-e),n,e,i)}function Y_(n,t,e,i){return ro(sx(t),n,e,i)}function Z_(n,t,e,i){return ro(jd(t),n,e,i)}function $_(n,t,e,i){return ro(ax(t,n.length-e),n,e,i)}G.prototype.write=function(t,e,i,r){if(e===void 0)r="utf8",i=this.length,e=0;else if(i===void 0&&typeof e=="string")r=e,i=this.length,e=0;else if(isFinite(e))e=e>>>0,isFinite(i)?(i=i>>>0,r===void 0&&(r="utf8")):(r=i,i=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");let s=this.length-e;if((i===void 0||i>s)&&(i=s),t.length>0&&(i<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");r||(r="utf8");let a=!1;for(;;)switch(r){case"hex":return X_(this,t,e,i);case"utf8":case"utf-8":return q_(this,t,e,i);case"ascii":case"latin1":case"binary":return Y_(this,t,e,i);case"base64":return Z_(this,t,e,i);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return $_(this,t,e,i);default:if(a)throw new TypeError("Unknown encoding: "+r);r=(""+r).toLowerCase(),a=!0}};G.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function J_(n,t,e){return t===0&&e===n.length?qc.fromByteArray(n):qc.fromByteArray(n.slice(t,e))}function qd(n,t,e){e=Math.min(n.length,e);let i=[],r=t;for(;r<e;){let s=n[r],a=null,o=s>239?4:s>223?3:s>191?2:1;if(r+o<=e){let c,l,h,u;switch(o){case 1:s<128&&(a=s);break;case 2:c=n[r+1],(c&192)===128&&(u=(s&31)<<6|c&63,u>127&&(a=u));break;case 3:c=n[r+1],l=n[r+2],(c&192)===128&&(l&192)===128&&(u=(s&15)<<12|(c&63)<<6|l&63,u>2047&&(u<55296||u>57343)&&(a=u));break;case 4:c=n[r+1],l=n[r+2],h=n[r+3],(c&192)===128&&(l&192)===128&&(h&192)===128&&(u=(s&15)<<18|(c&63)<<12|(l&63)<<6|h&63,u>65535&&u<1114112&&(a=u))}}a===null?(a=65533,o=1):a>65535&&(a-=65536,i.push(a>>>10&1023|55296),a=56320|a&1023),i.push(a),r+=o}return K_(i)}var kd=4096;function K_(n){let t=n.length;if(t<=kd)return String.fromCharCode.apply(String,n);let e="",i=0;for(;i<t;)e+=String.fromCharCode.apply(String,n.slice(i,i+=kd));return e}function Q_(n,t,e){let i="";e=Math.min(n.length,e);for(let r=t;r<e;++r)i+=String.fromCharCode(n[r]&127);return i}function j_(n,t,e){let i="";e=Math.min(n.length,e);for(let r=t;r<e;++r)i+=String.fromCharCode(n[r]);return i}function tx(n,t,e){let i=n.length;(!t||t<0)&&(t=0),(!e||e<0||e>i)&&(e=i);let r="";for(let s=t;s<e;++s)r+=ox[n[s]];return r}function ex(n,t,e){let i=n.slice(t,e),r="";for(let s=0;s<i.length-1;s+=2)r+=String.fromCharCode(i[s]+i[s+1]*256);return r}G.prototype.slice=function(t,e){let i=this.length;t=~~t,e=e===void 0?i:~~e,t<0?(t+=i,t<0&&(t=0)):t>i&&(t=i),e<0?(e+=i,e<0&&(e=0)):e>i&&(e=i),e<t&&(e=t);let r=this.subarray(t,e);return Object.setPrototypeOf(r,G.prototype),r};function Re(n,t,e){if(n%1!==0||n<0)throw new RangeError("offset is not uint");if(n+t>e)throw new RangeError("Trying to access beyond buffer length")}G.prototype.readUintLE=G.prototype.readUIntLE=function(t,e,i){t=t>>>0,e=e>>>0,i||Re(t,e,this.length);let r=this[t],s=1,a=0;for(;++a<e&&(s*=256);)r+=this[t+a]*s;return r};G.prototype.readUintBE=G.prototype.readUIntBE=function(t,e,i){t=t>>>0,e=e>>>0,i||Re(t,e,this.length);let r=this[t+--e],s=1;for(;e>0&&(s*=256);)r+=this[t+--e]*s;return r};G.prototype.readUint8=G.prototype.readUInt8=function(t,e){return t=t>>>0,e||Re(t,1,this.length),this[t]};G.prototype.readUint16LE=G.prototype.readUInt16LE=function(t,e){return t=t>>>0,e||Re(t,2,this.length),this[t]|this[t+1]<<8};G.prototype.readUint16BE=G.prototype.readUInt16BE=function(t,e){return t=t>>>0,e||Re(t,2,this.length),this[t]<<8|this[t+1]};G.prototype.readUint32LE=G.prototype.readUInt32LE=function(t,e){return t=t>>>0,e||Re(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+this[t+3]*16777216};G.prototype.readUint32BE=G.prototype.readUInt32BE=function(t,e){return t=t>>>0,e||Re(t,4,this.length),this[t]*16777216+(this[t+1]<<16|this[t+2]<<8|this[t+3])};G.prototype.readBigUInt64LE=fi(function(t){t=t>>>0,Tr(t,"offset");let e=this[t],i=this[t+7];(e===void 0||i===void 0)&&Es(t,this.length-8);let r=e+this[++t]*2**8+this[++t]*2**16+this[++t]*2**24,s=this[++t]+this[++t]*2**8+this[++t]*2**16+i*2**24;return BigInt(r)+(BigInt(s)<<BigInt(32))});G.prototype.readBigUInt64BE=fi(function(t){t=t>>>0,Tr(t,"offset");let e=this[t],i=this[t+7];(e===void 0||i===void 0)&&Es(t,this.length-8);let r=e*2**24+this[++t]*2**16+this[++t]*2**8+this[++t],s=this[++t]*2**24+this[++t]*2**16+this[++t]*2**8+i;return(BigInt(r)<<BigInt(32))+BigInt(s)});G.prototype.readIntLE=function(t,e,i){t=t>>>0,e=e>>>0,i||Re(t,e,this.length);let r=this[t],s=1,a=0;for(;++a<e&&(s*=256);)r+=this[t+a]*s;return s*=128,r>=s&&(r-=Math.pow(2,8*e)),r};G.prototype.readIntBE=function(t,e,i){t=t>>>0,e=e>>>0,i||Re(t,e,this.length);let r=e,s=1,a=this[t+--r];for(;r>0&&(s*=256);)a+=this[t+--r]*s;return s*=128,a>=s&&(a-=Math.pow(2,8*e)),a};G.prototype.readInt8=function(t,e){return t=t>>>0,e||Re(t,1,this.length),this[t]&128?(255-this[t]+1)*-1:this[t]};G.prototype.readInt16LE=function(t,e){t=t>>>0,e||Re(t,2,this.length);let i=this[t]|this[t+1]<<8;return i&32768?i|4294901760:i};G.prototype.readInt16BE=function(t,e){t=t>>>0,e||Re(t,2,this.length);let i=this[t+1]|this[t]<<8;return i&32768?i|4294901760:i};G.prototype.readInt32LE=function(t,e){return t=t>>>0,e||Re(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24};G.prototype.readInt32BE=function(t,e){return t=t>>>0,e||Re(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]};G.prototype.readBigInt64LE=fi(function(t){t=t>>>0,Tr(t,"offset");let e=this[t],i=this[t+7];(e===void 0||i===void 0)&&Es(t,this.length-8);let r=this[t+4]+this[t+5]*2**8+this[t+6]*2**16+(i<<24);return(BigInt(r)<<BigInt(32))+BigInt(e+this[++t]*2**8+this[++t]*2**16+this[++t]*2**24)});G.prototype.readBigInt64BE=fi(function(t){t=t>>>0,Tr(t,"offset");let e=this[t],i=this[t+7];(e===void 0||i===void 0)&&Es(t,this.length-8);let r=(e<<24)+this[++t]*2**16+this[++t]*2**8+this[++t];return(BigInt(r)<<BigInt(32))+BigInt(this[++t]*2**24+this[++t]*2**16+this[++t]*2**8+i)});G.prototype.readFloatLE=function(t,e){return t=t>>>0,e||Re(t,4,this.length),Ar.read(this,t,!0,23,4)};G.prototype.readFloatBE=function(t,e){return t=t>>>0,e||Re(t,4,this.length),Ar.read(this,t,!1,23,4)};G.prototype.readDoubleLE=function(t,e){return t=t>>>0,e||Re(t,8,this.length),Ar.read(this,t,!0,52,8)};G.prototype.readDoubleBE=function(t,e){return t=t>>>0,e||Re(t,8,this.length),Ar.read(this,t,!1,52,8)};function $e(n,t,e,i,r,s){if(!G.isBuffer(n))throw new TypeError('"buffer" argument must be a Buffer instance');if(t>r||t<s)throw new RangeError('"value" argument is out of bounds');if(e+i>n.length)throw new RangeError("Index out of range")}G.prototype.writeUintLE=G.prototype.writeUIntLE=function(t,e,i,r){if(t=+t,e=e>>>0,i=i>>>0,!r){let o=Math.pow(2,8*i)-1;$e(this,t,e,i,o,0)}let s=1,a=0;for(this[e]=t&255;++a<i&&(s*=256);)this[e+a]=t/s&255;return e+i};G.prototype.writeUintBE=G.prototype.writeUIntBE=function(t,e,i,r){if(t=+t,e=e>>>0,i=i>>>0,!r){let o=Math.pow(2,8*i)-1;$e(this,t,e,i,o,0)}let s=i-1,a=1;for(this[e+s]=t&255;--s>=0&&(a*=256);)this[e+s]=t/a&255;return e+i};G.prototype.writeUint8=G.prototype.writeUInt8=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,1,255,0),this[e]=t&255,e+1};G.prototype.writeUint16LE=G.prototype.writeUInt16LE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,2,65535,0),this[e]=t&255,this[e+1]=t>>>8,e+2};G.prototype.writeUint16BE=G.prototype.writeUInt16BE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,2,65535,0),this[e]=t>>>8,this[e+1]=t&255,e+2};G.prototype.writeUint32LE=G.prototype.writeUInt32LE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,4,4294967295,0),this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=t&255,e+4};G.prototype.writeUint32BE=G.prototype.writeUInt32BE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,4,4294967295,0),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=t&255,e+4};function Yd(n,t,e,i,r){Qd(t,i,r,n,e,7);let s=Number(t&BigInt(4294967295));n[e++]=s,s=s>>8,n[e++]=s,s=s>>8,n[e++]=s,s=s>>8,n[e++]=s;let a=Number(t>>BigInt(32)&BigInt(4294967295));return n[e++]=a,a=a>>8,n[e++]=a,a=a>>8,n[e++]=a,a=a>>8,n[e++]=a,e}function Zd(n,t,e,i,r){Qd(t,i,r,n,e,7);let s=Number(t&BigInt(4294967295));n[e+7]=s,s=s>>8,n[e+6]=s,s=s>>8,n[e+5]=s,s=s>>8,n[e+4]=s;let a=Number(t>>BigInt(32)&BigInt(4294967295));return n[e+3]=a,a=a>>8,n[e+2]=a,a=a>>8,n[e+1]=a,a=a>>8,n[e]=a,e+8}G.prototype.writeBigUInt64LE=fi(function(t,e=0){return Yd(this,t,e,BigInt(0),BigInt("0xffffffffffffffff"))});G.prototype.writeBigUInt64BE=fi(function(t,e=0){return Zd(this,t,e,BigInt(0),BigInt("0xffffffffffffffff"))});G.prototype.writeIntLE=function(t,e,i,r){if(t=+t,e=e>>>0,!r){let c=Math.pow(2,8*i-1);$e(this,t,e,i,c-1,-c)}let s=0,a=1,o=0;for(this[e]=t&255;++s<i&&(a*=256);)t<0&&o===0&&this[e+s-1]!==0&&(o=1),this[e+s]=(t/a>>0)-o&255;return e+i};G.prototype.writeIntBE=function(t,e,i,r){if(t=+t,e=e>>>0,!r){let c=Math.pow(2,8*i-1);$e(this,t,e,i,c-1,-c)}let s=i-1,a=1,o=0;for(this[e+s]=t&255;--s>=0&&(a*=256);)t<0&&o===0&&this[e+s+1]!==0&&(o=1),this[e+s]=(t/a>>0)-o&255;return e+i};G.prototype.writeInt8=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,1,127,-128),t<0&&(t=255+t+1),this[e]=t&255,e+1};G.prototype.writeInt16LE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,2,32767,-32768),this[e]=t&255,this[e+1]=t>>>8,e+2};G.prototype.writeInt16BE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,2,32767,-32768),this[e]=t>>>8,this[e+1]=t&255,e+2};G.prototype.writeInt32LE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,4,2147483647,-2147483648),this[e]=t&255,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24,e+4};G.prototype.writeInt32BE=function(t,e,i){return t=+t,e=e>>>0,i||$e(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=t&255,e+4};G.prototype.writeBigInt64LE=fi(function(t,e=0){return Yd(this,t,e,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});G.prototype.writeBigInt64BE=fi(function(t,e=0){return Zd(this,t,e,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function $d(n,t,e,i,r,s){if(e+i>n.length)throw new RangeError("Index out of range");if(e<0)throw new RangeError("Index out of range")}function Jd(n,t,e,i,r){return t=+t,e=e>>>0,r||$d(n,t,e,4,34028234663852886e22,-34028234663852886e22),Ar.write(n,t,e,i,23,4),e+4}G.prototype.writeFloatLE=function(t,e,i){return Jd(this,t,e,!0,i)};G.prototype.writeFloatBE=function(t,e,i){return Jd(this,t,e,!1,i)};function Kd(n,t,e,i,r){return t=+t,e=e>>>0,r||$d(n,t,e,8,17976931348623157e292,-17976931348623157e292),Ar.write(n,t,e,i,52,8),e+8}G.prototype.writeDoubleLE=function(t,e,i){return Kd(this,t,e,!0,i)};G.prototype.writeDoubleBE=function(t,e,i){return Kd(this,t,e,!1,i)};G.prototype.copy=function(t,e,i,r){if(!G.isBuffer(t))throw new TypeError("argument should be a Buffer");if(i||(i=0),!r&&r!==0&&(r=this.length),e>=t.length&&(e=t.length),e||(e=0),r>0&&r<i&&(r=i),r===i||t.length===0||this.length===0)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(i<0||i>=this.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("sourceEnd out of bounds");r>this.length&&(r=this.length),t.length-e<r-i&&(r=t.length-e+i);let s=r-i;return this===t&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(e,i,r):Uint8Array.prototype.set.call(t,this.subarray(i,r),e),s};G.prototype.fill=function(t,e,i,r){if(typeof t=="string"){if(typeof e=="string"?(r=e,e=0,i=this.length):typeof i=="string"&&(r=i,i=this.length),r!==void 0&&typeof r!="string")throw new TypeError("encoding must be a string");if(typeof r=="string"&&!G.isEncoding(r))throw new TypeError("Unknown encoding: "+r);if(t.length===1){let a=t.charCodeAt(0);(r==="utf8"&&a<128||r==="latin1")&&(t=a)}}else typeof t=="number"?t=t&255:typeof t=="boolean"&&(t=Number(t));if(e<0||this.length<e||this.length<i)throw new RangeError("Out of range index");if(i<=e)return this;e=e>>>0,i=i===void 0?this.length:i>>>0,t||(t=0);let s;if(typeof t=="number")for(s=e;s<i;++s)this[s]=t;else{let a=G.isBuffer(t)?t:G.from(t,r),o=a.length;if(o===0)throw new TypeError('The value "'+t+'" is invalid for argument "value"');for(s=0;s<i-e;++s)this[s+e]=a[s%o]}return this};var Er={};function Qc(n,t,e){Er[n]=class extends e{constructor(){super(),Object.defineProperty(this,"message",{value:t.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${n}]`,this.stack,delete this.name}get code(){return n}set code(r){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:r,writable:!0})}toString(){return`${this.name} [${n}]: ${this.message}`}}}Qc("ERR_BUFFER_OUT_OF_BOUNDS",function(n){return n?`${n} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError);Qc("ERR_INVALID_ARG_TYPE",function(n,t){return`The "${n}" argument must be of type number. Received type ${typeof t}`},TypeError);Qc("ERR_OUT_OF_RANGE",function(n,t,e){let i=`The value of "${n}" is out of range.`,r=e;return Number.isInteger(e)&&Math.abs(e)>2**32?r=Hd(String(e)):typeof e=="bigint"&&(r=String(e),(e>BigInt(2)**BigInt(32)||e<-(BigInt(2)**BigInt(32)))&&(r=Hd(r)),r+="n"),i+=` It must be ${t}. Received ${r}`,i},RangeError);function Hd(n){let t="",e=n.length,i=n[0]==="-"?1:0;for(;e>=i+4;e-=3)t=`_${n.slice(e-3,e)}${t}`;return`${n.slice(0,e)}${t}`}function nx(n,t,e){Tr(t,"offset"),(n[t]===void 0||n[t+e]===void 0)&&Es(t,n.length-(e+1))}function Qd(n,t,e,i,r,s){if(n>e||n<t){let a=typeof t=="bigint"?"n":"",o;throw s>3?t===0||t===BigInt(0)?o=`>= 0${a} and < 2${a} ** ${(s+1)*8}${a}`:o=`>= -(2${a} ** ${(s+1)*8-1}${a}) and < 2 ** ${(s+1)*8-1}${a}`:o=`>= ${t}${a} and <= ${e}${a}`,new Er.ERR_OUT_OF_RANGE("value",o,n)}nx(i,r,s)}function Tr(n,t){if(typeof n!="number")throw new Er.ERR_INVALID_ARG_TYPE(t,"number",n)}function Es(n,t,e){throw Math.floor(n)!==n?(Tr(n,e),new Er.ERR_OUT_OF_RANGE(e||"offset","an integer",n)):t<0?new Er.ERR_BUFFER_OUT_OF_BOUNDS:new Er.ERR_OUT_OF_RANGE(e||"offset",`>= ${e?1:0} and <= ${t}`,n)}var ix=/[^+/0-9A-Za-z-_]/g;function rx(n){if(n=n.split("=")[0],n=n.trim().replace(ix,""),n.length<2)return"";for(;n.length%4!==0;)n=n+"=";return n}function $c(n,t){t=t||1/0;let e,i=n.length,r=null,s=[];for(let a=0;a<i;++a){if(e=n.charCodeAt(a),e>55295&&e<57344){if(!r){if(e>56319){(t-=3)>-1&&s.push(239,191,189);continue}else if(a+1===i){(t-=3)>-1&&s.push(239,191,189);continue}r=e;continue}if(e<56320){(t-=3)>-1&&s.push(239,191,189),r=e;continue}e=(r-55296<<10|e-56320)+65536}else r&&(t-=3)>-1&&s.push(239,191,189);if(r=null,e<128){if((t-=1)<0)break;s.push(e)}else if(e<2048){if((t-=2)<0)break;s.push(e>>6|192,e&63|128)}else if(e<65536){if((t-=3)<0)break;s.push(e>>12|224,e>>6&63|128,e&63|128)}else if(e<1114112){if((t-=4)<0)break;s.push(e>>18|240,e>>12&63|128,e>>6&63|128,e&63|128)}else throw new Error("Invalid code point")}return s}function sx(n){let t=[];for(let e=0;e<n.length;++e)t.push(n.charCodeAt(e)&255);return t}function ax(n,t){let e,i,r,s=[];for(let a=0;a<n.length&&!((t-=2)<0);++a)e=n.charCodeAt(a),i=e>>8,r=e%256,s.push(r),s.push(i);return s}function jd(n){return qc.toByteArray(rx(n))}function ro(n,t,e,i){let r;for(r=0;r<i&&!(r+e>=t.length||r>=n.length);++r)t[r+e]=n[r];return r}function Rn(n,t){return n instanceof t||n!=null&&n.constructor!=null&&n.constructor.name!=null&&n.constructor.name===t.name}function jc(n){return n!==n}var ox=function(){let n="0123456789abcdef",t=new Array(256);for(let e=0;e<16;++e){let i=e*16;for(let r=0;r<16;++r)t[i+r]=n[e]+n[r]}return t}();function fi(n){return typeof BigInt>"u"?lx:n}function lx(){throw new Error("BigInt not supported")}});var qA=I_(tp(),1);function Dr(n){let t=n.length;for(;--t>=0;)n[t]=0}var cx=0,zp=1,hx=2,ux=3,fx=258,bh=29,ks=256,Ls=ks+1+bh,Pr=30,wh=19,kp=2*Ls+1,Hi=15,th=16,dx=7,Eh=256,Hp=16,Vp=17,Gp=18,ph=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),ho=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),px=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),Wp=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),mx=512,Wn=new Array((Ls+2)*2);Dr(Wn);var Cs=new Array(Pr*2);Dr(Cs);var Us=new Array(mx);Dr(Us);var Ds=new Array(fx-ux+1);Dr(Ds);var Ah=new Array(bh);Dr(Ah);var uo=new Array(Pr);Dr(uo);function eh(n,t,e,i,r){this.static_tree=n,this.extra_bits=t,this.extra_base=e,this.elems=i,this.max_length=r,this.has_stree=n&&n.length}var Xp,qp,Yp;function nh(n,t){this.dyn_tree=n,this.max_code=0,this.stat_desc=t}var Zp=n=>n<256?Us[n]:Us[256+(n>>>7)],Ns=(n,t)=>{n.pending_buf[n.pending++]=t&255,n.pending_buf[n.pending++]=t>>>8&255},Je=(n,t,e)=>{n.bi_valid>th-e?(n.bi_buf|=t<<n.bi_valid&65535,Ns(n,n.bi_buf),n.bi_buf=t>>th-n.bi_valid,n.bi_valid+=e-th):(n.bi_buf|=t<<n.bi_valid&65535,n.bi_valid+=e)},In=(n,t,e)=>{Je(n,e[t*2],e[t*2+1])},$p=(n,t)=>{let e=0;do e|=n&1,n>>>=1,e<<=1;while(--t>0);return e>>>1},gx=n=>{n.bi_valid===16?(Ns(n,n.bi_buf),n.bi_buf=0,n.bi_valid=0):n.bi_valid>=8&&(n.pending_buf[n.pending++]=n.bi_buf&255,n.bi_buf>>=8,n.bi_valid-=8)},_x=(n,t)=>{let e=t.dyn_tree,i=t.max_code,r=t.stat_desc.static_tree,s=t.stat_desc.has_stree,a=t.stat_desc.extra_bits,o=t.stat_desc.extra_base,c=t.stat_desc.max_length,l,h,u,f,d,m,_=0;for(f=0;f<=Hi;f++)n.bl_count[f]=0;for(e[n.heap[n.heap_max]*2+1]=0,l=n.heap_max+1;l<kp;l++)h=n.heap[l],f=e[e[h*2+1]*2+1]+1,f>c&&(f=c,_++),e[h*2+1]=f,!(h>i)&&(n.bl_count[f]++,d=0,h>=o&&(d=a[h-o]),m=e[h*2],n.opt_len+=m*(f+d),s&&(n.static_len+=m*(r[h*2+1]+d)));if(_!==0){do{for(f=c-1;n.bl_count[f]===0;)f--;n.bl_count[f]--,n.bl_count[f+1]+=2,n.bl_count[c]--,_-=2}while(_>0);for(f=c;f!==0;f--)for(h=n.bl_count[f];h!==0;)u=n.heap[--l],!(u>i)&&(e[u*2+1]!==f&&(n.opt_len+=(f-e[u*2+1])*e[u*2],e[u*2+1]=f),h--)}},Jp=(n,t,e)=>{let i=new Array(Hi+1),r=0,s,a;for(s=1;s<=Hi;s++)r=r+e[s-1]<<1,i[s]=r;for(a=0;a<=t;a++){let o=n[a*2+1];o!==0&&(n[a*2]=$p(i[o]++,o))}},xx=()=>{let n,t,e,i,r,s=new Array(Hi+1);for(e=0,i=0;i<bh-1;i++)for(Ah[i]=e,n=0;n<1<<ph[i];n++)Ds[e++]=i;for(Ds[e-1]=i,r=0,i=0;i<16;i++)for(uo[i]=r,n=0;n<1<<ho[i];n++)Us[r++]=i;for(r>>=7;i<Pr;i++)for(uo[i]=r<<7,n=0;n<1<<ho[i]-7;n++)Us[256+r++]=i;for(t=0;t<=Hi;t++)s[t]=0;for(n=0;n<=143;)Wn[n*2+1]=8,n++,s[8]++;for(;n<=255;)Wn[n*2+1]=9,n++,s[9]++;for(;n<=279;)Wn[n*2+1]=7,n++,s[7]++;for(;n<=287;)Wn[n*2+1]=8,n++,s[8]++;for(Jp(Wn,Ls+1,s),n=0;n<Pr;n++)Cs[n*2+1]=5,Cs[n*2]=$p(n,5);Xp=new eh(Wn,ph,ks+1,Ls,Hi),qp=new eh(Cs,ho,0,Pr,Hi),Yp=new eh(new Array(0),px,0,wh,dx)},Kp=n=>{let t;for(t=0;t<Ls;t++)n.dyn_ltree[t*2]=0;for(t=0;t<Pr;t++)n.dyn_dtree[t*2]=0;for(t=0;t<wh;t++)n.bl_tree[t*2]=0;n.dyn_ltree[Eh*2]=1,n.opt_len=n.static_len=0,n.sym_next=n.matches=0},Qp=n=>{n.bi_valid>8?Ns(n,n.bi_buf):n.bi_valid>0&&(n.pending_buf[n.pending++]=n.bi_buf),n.bi_buf=0,n.bi_valid=0},ep=(n,t,e,i)=>{let r=t*2,s=e*2;return n[r]<n[s]||n[r]===n[s]&&i[t]<=i[e]},ih=(n,t,e)=>{let i=n.heap[e],r=e<<1;for(;r<=n.heap_len&&(r<n.heap_len&&ep(t,n.heap[r+1],n.heap[r],n.depth)&&r++,!ep(t,i,n.heap[r],n.depth));)n.heap[e]=n.heap[r],e=r,r<<=1;n.heap[e]=i},np=(n,t,e)=>{let i,r,s=0,a,o;if(n.sym_next!==0)do i=n.pending_buf[n.sym_buf+s++]&255,i+=(n.pending_buf[n.sym_buf+s++]&255)<<8,r=n.pending_buf[n.sym_buf+s++],i===0?In(n,r,t):(a=Ds[r],In(n,a+ks+1,t),o=ph[a],o!==0&&(r-=Ah[a],Je(n,r,o)),i--,a=Zp(i),In(n,a,e),o=ho[a],o!==0&&(i-=uo[a],Je(n,i,o)));while(s<n.sym_next);In(n,Eh,t)},mh=(n,t)=>{let e=t.dyn_tree,i=t.stat_desc.static_tree,r=t.stat_desc.has_stree,s=t.stat_desc.elems,a,o,c=-1,l;for(n.heap_len=0,n.heap_max=kp,a=0;a<s;a++)e[a*2]!==0?(n.heap[++n.heap_len]=c=a,n.depth[a]=0):e[a*2+1]=0;for(;n.heap_len<2;)l=n.heap[++n.heap_len]=c<2?++c:0,e[l*2]=1,n.depth[l]=0,n.opt_len--,r&&(n.static_len-=i[l*2+1]);for(t.max_code=c,a=n.heap_len>>1;a>=1;a--)ih(n,e,a);l=s;do a=n.heap[1],n.heap[1]=n.heap[n.heap_len--],ih(n,e,1),o=n.heap[1],n.heap[--n.heap_max]=a,n.heap[--n.heap_max]=o,e[l*2]=e[a*2]+e[o*2],n.depth[l]=(n.depth[a]>=n.depth[o]?n.depth[a]:n.depth[o])+1,e[a*2+1]=e[o*2+1]=l,n.heap[1]=l++,ih(n,e,1);while(n.heap_len>=2);n.heap[--n.heap_max]=n.heap[1],_x(n,t),Jp(e,c,n.bl_count)},ip=(n,t,e)=>{let i,r=-1,s,a=t[0*2+1],o=0,c=7,l=4;for(a===0&&(c=138,l=3),t[(e+1)*2+1]=65535,i=0;i<=e;i++)s=a,a=t[(i+1)*2+1],!(++o<c&&s===a)&&(o<l?n.bl_tree[s*2]+=o:s!==0?(s!==r&&n.bl_tree[s*2]++,n.bl_tree[Hp*2]++):o<=10?n.bl_tree[Vp*2]++:n.bl_tree[Gp*2]++,o=0,r=s,a===0?(c=138,l=3):s===a?(c=6,l=3):(c=7,l=4))},rp=(n,t,e)=>{let i,r=-1,s,a=t[0*2+1],o=0,c=7,l=4;for(a===0&&(c=138,l=3),i=0;i<=e;i++)if(s=a,a=t[(i+1)*2+1],!(++o<c&&s===a)){if(o<l)do In(n,s,n.bl_tree);while(--o!==0);else s!==0?(s!==r&&(In(n,s,n.bl_tree),o--),In(n,Hp,n.bl_tree),Je(n,o-3,2)):o<=10?(In(n,Vp,n.bl_tree),Je(n,o-3,3)):(In(n,Gp,n.bl_tree),Je(n,o-11,7));o=0,r=s,a===0?(c=138,l=3):s===a?(c=6,l=3):(c=7,l=4)}},yx=n=>{let t;for(ip(n,n.dyn_ltree,n.l_desc.max_code),ip(n,n.dyn_dtree,n.d_desc.max_code),mh(n,n.bl_desc),t=wh-1;t>=3&&n.bl_tree[Wp[t]*2+1]===0;t--);return n.opt_len+=3*(t+1)+5+5+4,t},vx=(n,t,e,i)=>{let r;for(Je(n,t-257,5),Je(n,e-1,5),Je(n,i-4,4),r=0;r<i;r++)Je(n,n.bl_tree[Wp[r]*2+1],3);rp(n,n.dyn_ltree,t-1),rp(n,n.dyn_dtree,e-1)},Mx=n=>{let t=4093624447,e;for(e=0;e<=31;e++,t>>>=1)if(t&1&&n.dyn_ltree[e*2]!==0)return 0;if(n.dyn_ltree[9*2]!==0||n.dyn_ltree[10*2]!==0||n.dyn_ltree[13*2]!==0)return 1;for(e=32;e<ks;e++)if(n.dyn_ltree[e*2]!==0)return 1;return 0},sp=!1,Sx=n=>{sp||(xx(),sp=!0),n.l_desc=new nh(n.dyn_ltree,Xp),n.d_desc=new nh(n.dyn_dtree,qp),n.bl_desc=new nh(n.bl_tree,Yp),n.bi_buf=0,n.bi_valid=0,Kp(n)},jp=(n,t,e,i)=>{Je(n,(cx<<1)+(i?1:0),3),Qp(n),Ns(n,e),Ns(n,~e),e&&n.pending_buf.set(n.window.subarray(t,t+e),n.pending),n.pending+=e},bx=n=>{Je(n,zp<<1,3),In(n,Eh,Wn),gx(n)},wx=(n,t,e,i)=>{let r,s,a=0;n.level>0?(n.strm.data_type===2&&(n.strm.data_type=Mx(n)),mh(n,n.l_desc),mh(n,n.d_desc),a=yx(n),r=n.opt_len+3+7>>>3,s=n.static_len+3+7>>>3,s<=r&&(r=s)):r=s=e+5,e+4<=r&&t!==-1?jp(n,t,e,i):n.strategy===4||s===r?(Je(n,(zp<<1)+(i?1:0),3),np(n,Wn,Cs)):(Je(n,(hx<<1)+(i?1:0),3),vx(n,n.l_desc.max_code+1,n.d_desc.max_code+1,a+1),np(n,n.dyn_ltree,n.dyn_dtree)),Kp(n),i&&Qp(n)},Ex=(n,t,e)=>(n.pending_buf[n.sym_buf+n.sym_next++]=t,n.pending_buf[n.sym_buf+n.sym_next++]=t>>8,n.pending_buf[n.sym_buf+n.sym_next++]=e,t===0?n.dyn_ltree[e*2]++:(n.matches++,t--,n.dyn_ltree[(Ds[e]+ks+1)*2]++,n.dyn_dtree[Zp(t)*2]++),n.sym_next===n.sym_end),Ax=Sx,Tx=jp,Rx=wx,Cx=Ex,Ix=bx,Px={_tr_init:Ax,_tr_stored_block:Tx,_tr_flush_block:Rx,_tr_tally:Cx,_tr_align:Ix},Lx=(n,t,e,i)=>{let r=n&65535|0,s=n>>>16&65535|0,a=0;for(;e!==0;){a=e>2e3?2e3:e,e-=a;do r=r+t[i++]|0,s=s+r|0;while(--a);r%=65521,s%=65521}return r|s<<16|0},Fs=Lx,Ux=()=>{let n,t=[];for(var e=0;e<256;e++){n=e;for(var i=0;i<8;i++)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n}return t},Dx=new Uint32Array(Ux()),Nx=(n,t,e,i)=>{let r=Dx,s=i+e;n^=-1;for(let a=i;a<s;a++)n=n>>>8^r[(n^t[a])&255];return n^-1},Ce=Nx,Wi={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},Yi={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8},{_tr_init:Fx,_tr_stored_block:gh,_tr_flush_block:Ox,_tr_tally:mi,_tr_align:Bx}=Px,{Z_NO_FLUSH:gi,Z_PARTIAL_FLUSH:zx,Z_FULL_FLUSH:kx,Z_FINISH:dn,Z_BLOCK:ap,Z_OK:Ue,Z_STREAM_END:op,Z_STREAM_ERROR:Pn,Z_DATA_ERROR:Hx,Z_BUF_ERROR:rh,Z_DEFAULT_COMPRESSION:Vx,Z_FILTERED:Gx,Z_HUFFMAN_ONLY:so,Z_RLE:Wx,Z_FIXED:Xx,Z_DEFAULT_STRATEGY:qx,Z_UNKNOWN:Yx,Z_DEFLATED:mo}=Yi,Zx=9,$x=15,Jx=8,Kx=29,Qx=256,_h=Qx+1+Kx,jx=30,ty=19,ey=2*_h+1,ny=15,$t=3,pi=258,Ln=pi+$t+1,iy=32,Lr=42,Th=57,xh=69,yh=73,vh=91,Mh=103,Vi=113,Ts=666,Xe=1,Nr=2,Xi=3,Fr=4,ry=3,Gi=(n,t)=>(n.msg=Wi[t],t),lp=n=>n*2-(n>4?9:0),di=n=>{let t=n.length;for(;--t>=0;)n[t]=0},sy=n=>{let t,e,i,r=n.w_size;t=n.hash_size,i=t;do e=n.head[--i],n.head[i]=e>=r?e-r:0;while(--t);t=r,i=t;do e=n.prev[--i],n.prev[i]=e>=r?e-r:0;while(--t)},ay=(n,t,e)=>(t<<n.hash_shift^e)&n.hash_mask,_i=ay,en=n=>{let t=n.state,e=t.pending;e>n.avail_out&&(e=n.avail_out),e!==0&&(n.output.set(t.pending_buf.subarray(t.pending_out,t.pending_out+e),n.next_out),n.next_out+=e,t.pending_out+=e,n.total_out+=e,n.avail_out-=e,t.pending-=e,t.pending===0&&(t.pending_out=0))},nn=(n,t)=>{Ox(n,n.block_start>=0?n.block_start:-1,n.strstart-n.block_start,t),n.block_start=n.strstart,en(n.strm)},Kt=(n,t)=>{n.pending_buf[n.pending++]=t},As=(n,t)=>{n.pending_buf[n.pending++]=t>>>8&255,n.pending_buf[n.pending++]=t&255},Sh=(n,t,e,i)=>{let r=n.avail_in;return r>i&&(r=i),r===0?0:(n.avail_in-=r,t.set(n.input.subarray(n.next_in,n.next_in+r),e),n.state.wrap===1?n.adler=Fs(n.adler,t,r,e):n.state.wrap===2&&(n.adler=Ce(n.adler,t,r,e)),n.next_in+=r,n.total_in+=r,r)},tm=(n,t)=>{let e=n.max_chain_length,i=n.strstart,r,s,a=n.prev_length,o=n.nice_match,c=n.strstart>n.w_size-Ln?n.strstart-(n.w_size-Ln):0,l=n.window,h=n.w_mask,u=n.prev,f=n.strstart+pi,d=l[i+a-1],m=l[i+a];n.prev_length>=n.good_match&&(e>>=2),o>n.lookahead&&(o=n.lookahead);do if(r=t,!(l[r+a]!==m||l[r+a-1]!==d||l[r]!==l[i]||l[++r]!==l[i+1])){i+=2,r++;do;while(l[++i]===l[++r]&&l[++i]===l[++r]&&l[++i]===l[++r]&&l[++i]===l[++r]&&l[++i]===l[++r]&&l[++i]===l[++r]&&l[++i]===l[++r]&&l[++i]===l[++r]&&i<f);if(s=pi-(f-i),i=f-pi,s>a){if(n.match_start=t,a=s,s>=o)break;d=l[i+a-1],m=l[i+a]}}while((t=u[t&h])>c&&--e!==0);return a<=n.lookahead?a:n.lookahead},Ur=n=>{let t=n.w_size,e,i,r;do{if(i=n.window_size-n.lookahead-n.strstart,n.strstart>=t+(t-Ln)&&(n.window.set(n.window.subarray(t,t+t-i),0),n.match_start-=t,n.strstart-=t,n.block_start-=t,n.insert>n.strstart&&(n.insert=n.strstart),sy(n),i+=t),n.strm.avail_in===0)break;if(e=Sh(n.strm,n.window,n.strstart+n.lookahead,i),n.lookahead+=e,n.lookahead+n.insert>=$t)for(r=n.strstart-n.insert,n.ins_h=n.window[r],n.ins_h=_i(n,n.ins_h,n.window[r+1]);n.insert&&(n.ins_h=_i(n,n.ins_h,n.window[r+$t-1]),n.prev[r&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=r,r++,n.insert--,!(n.lookahead+n.insert<$t)););}while(n.lookahead<Ln&&n.strm.avail_in!==0)},em=(n,t)=>{let e=n.pending_buf_size-5>n.w_size?n.w_size:n.pending_buf_size-5,i,r,s,a=0,o=n.strm.avail_in;do{if(i=65535,s=n.bi_valid+42>>3,n.strm.avail_out<s||(s=n.strm.avail_out-s,r=n.strstart-n.block_start,i>r+n.strm.avail_in&&(i=r+n.strm.avail_in),i>s&&(i=s),i<e&&(i===0&&t!==dn||t===gi||i!==r+n.strm.avail_in)))break;a=t===dn&&i===r+n.strm.avail_in?1:0,gh(n,0,0,a),n.pending_buf[n.pending-4]=i,n.pending_buf[n.pending-3]=i>>8,n.pending_buf[n.pending-2]=~i,n.pending_buf[n.pending-1]=~i>>8,en(n.strm),r&&(r>i&&(r=i),n.strm.output.set(n.window.subarray(n.block_start,n.block_start+r),n.strm.next_out),n.strm.next_out+=r,n.strm.avail_out-=r,n.strm.total_out+=r,n.block_start+=r,i-=r),i&&(Sh(n.strm,n.strm.output,n.strm.next_out,i),n.strm.next_out+=i,n.strm.avail_out-=i,n.strm.total_out+=i)}while(a===0);return o-=n.strm.avail_in,o&&(o>=n.w_size?(n.matches=2,n.window.set(n.strm.input.subarray(n.strm.next_in-n.w_size,n.strm.next_in),0),n.strstart=n.w_size,n.insert=n.strstart):(n.window_size-n.strstart<=o&&(n.strstart-=n.w_size,n.window.set(n.window.subarray(n.w_size,n.w_size+n.strstart),0),n.matches<2&&n.matches++,n.insert>n.strstart&&(n.insert=n.strstart)),n.window.set(n.strm.input.subarray(n.strm.next_in-o,n.strm.next_in),n.strstart),n.strstart+=o,n.insert+=o>n.w_size-n.insert?n.w_size-n.insert:o),n.block_start=n.strstart),n.high_water<n.strstart&&(n.high_water=n.strstart),a?Fr:t!==gi&&t!==dn&&n.strm.avail_in===0&&n.strstart===n.block_start?Nr:(s=n.window_size-n.strstart,n.strm.avail_in>s&&n.block_start>=n.w_size&&(n.block_start-=n.w_size,n.strstart-=n.w_size,n.window.set(n.window.subarray(n.w_size,n.w_size+n.strstart),0),n.matches<2&&n.matches++,s+=n.w_size,n.insert>n.strstart&&(n.insert=n.strstart)),s>n.strm.avail_in&&(s=n.strm.avail_in),s&&(Sh(n.strm,n.window,n.strstart,s),n.strstart+=s,n.insert+=s>n.w_size-n.insert?n.w_size-n.insert:s),n.high_water<n.strstart&&(n.high_water=n.strstart),s=n.bi_valid+42>>3,s=n.pending_buf_size-s>65535?65535:n.pending_buf_size-s,e=s>n.w_size?n.w_size:s,r=n.strstart-n.block_start,(r>=e||(r||t===dn)&&t!==gi&&n.strm.avail_in===0&&r<=s)&&(i=r>s?s:r,a=t===dn&&n.strm.avail_in===0&&i===r?1:0,gh(n,n.block_start,i,a),n.block_start+=i,en(n.strm)),a?Xi:Xe)},sh=(n,t)=>{let e,i;for(;;){if(n.lookahead<Ln){if(Ur(n),n.lookahead<Ln&&t===gi)return Xe;if(n.lookahead===0)break}if(e=0,n.lookahead>=$t&&(n.ins_h=_i(n,n.ins_h,n.window[n.strstart+$t-1]),e=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart),e!==0&&n.strstart-e<=n.w_size-Ln&&(n.match_length=tm(n,e)),n.match_length>=$t)if(i=mi(n,n.strstart-n.match_start,n.match_length-$t),n.lookahead-=n.match_length,n.match_length<=n.max_lazy_match&&n.lookahead>=$t){n.match_length--;do n.strstart++,n.ins_h=_i(n,n.ins_h,n.window[n.strstart+$t-1]),e=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart;while(--n.match_length!==0);n.strstart++}else n.strstart+=n.match_length,n.match_length=0,n.ins_h=n.window[n.strstart],n.ins_h=_i(n,n.ins_h,n.window[n.strstart+1]);else i=mi(n,0,n.window[n.strstart]),n.lookahead--,n.strstart++;if(i&&(nn(n,!1),n.strm.avail_out===0))return Xe}return n.insert=n.strstart<$t-1?n.strstart:$t-1,t===dn?(nn(n,!0),n.strm.avail_out===0?Xi:Fr):n.sym_next&&(nn(n,!1),n.strm.avail_out===0)?Xe:Nr},Cr=(n,t)=>{let e,i,r;for(;;){if(n.lookahead<Ln){if(Ur(n),n.lookahead<Ln&&t===gi)return Xe;if(n.lookahead===0)break}if(e=0,n.lookahead>=$t&&(n.ins_h=_i(n,n.ins_h,n.window[n.strstart+$t-1]),e=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart),n.prev_length=n.match_length,n.prev_match=n.match_start,n.match_length=$t-1,e!==0&&n.prev_length<n.max_lazy_match&&n.strstart-e<=n.w_size-Ln&&(n.match_length=tm(n,e),n.match_length<=5&&(n.strategy===Gx||n.match_length===$t&&n.strstart-n.match_start>4096)&&(n.match_length=$t-1)),n.prev_length>=$t&&n.match_length<=n.prev_length){r=n.strstart+n.lookahead-$t,i=mi(n,n.strstart-1-n.prev_match,n.prev_length-$t),n.lookahead-=n.prev_length-1,n.prev_length-=2;do++n.strstart<=r&&(n.ins_h=_i(n,n.ins_h,n.window[n.strstart+$t-1]),e=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart);while(--n.prev_length!==0);if(n.match_available=0,n.match_length=$t-1,n.strstart++,i&&(nn(n,!1),n.strm.avail_out===0))return Xe}else if(n.match_available){if(i=mi(n,0,n.window[n.strstart-1]),i&&nn(n,!1),n.strstart++,n.lookahead--,n.strm.avail_out===0)return Xe}else n.match_available=1,n.strstart++,n.lookahead--}return n.match_available&&(i=mi(n,0,n.window[n.strstart-1]),n.match_available=0),n.insert=n.strstart<$t-1?n.strstart:$t-1,t===dn?(nn(n,!0),n.strm.avail_out===0?Xi:Fr):n.sym_next&&(nn(n,!1),n.strm.avail_out===0)?Xe:Nr},oy=(n,t)=>{let e,i,r,s,a=n.window;for(;;){if(n.lookahead<=pi){if(Ur(n),n.lookahead<=pi&&t===gi)return Xe;if(n.lookahead===0)break}if(n.match_length=0,n.lookahead>=$t&&n.strstart>0&&(r=n.strstart-1,i=a[r],i===a[++r]&&i===a[++r]&&i===a[++r])){s=n.strstart+pi;do;while(i===a[++r]&&i===a[++r]&&i===a[++r]&&i===a[++r]&&i===a[++r]&&i===a[++r]&&i===a[++r]&&i===a[++r]&&r<s);n.match_length=pi-(s-r),n.match_length>n.lookahead&&(n.match_length=n.lookahead)}if(n.match_length>=$t?(e=mi(n,1,n.match_length-$t),n.lookahead-=n.match_length,n.strstart+=n.match_length,n.match_length=0):(e=mi(n,0,n.window[n.strstart]),n.lookahead--,n.strstart++),e&&(nn(n,!1),n.strm.avail_out===0))return Xe}return n.insert=0,t===dn?(nn(n,!0),n.strm.avail_out===0?Xi:Fr):n.sym_next&&(nn(n,!1),n.strm.avail_out===0)?Xe:Nr},ly=(n,t)=>{let e;for(;;){if(n.lookahead===0&&(Ur(n),n.lookahead===0)){if(t===gi)return Xe;break}if(n.match_length=0,e=mi(n,0,n.window[n.strstart]),n.lookahead--,n.strstart++,e&&(nn(n,!1),n.strm.avail_out===0))return Xe}return n.insert=0,t===dn?(nn(n,!0),n.strm.avail_out===0?Xi:Fr):n.sym_next&&(nn(n,!1),n.strm.avail_out===0)?Xe:Nr};function Cn(n,t,e,i,r){this.good_length=n,this.max_lazy=t,this.nice_length=e,this.max_chain=i,this.func=r}var Rs=[new Cn(0,0,0,0,em),new Cn(4,4,8,4,sh),new Cn(4,5,16,8,sh),new Cn(4,6,32,32,sh),new Cn(4,4,16,16,Cr),new Cn(8,16,32,32,Cr),new Cn(8,16,128,128,Cr),new Cn(8,32,128,256,Cr),new Cn(32,128,258,1024,Cr),new Cn(32,258,258,4096,Cr)],cy=n=>{n.window_size=2*n.w_size,di(n.head),n.max_lazy_match=Rs[n.level].max_lazy,n.good_match=Rs[n.level].good_length,n.nice_match=Rs[n.level].nice_length,n.max_chain_length=Rs[n.level].max_chain,n.strstart=0,n.block_start=0,n.lookahead=0,n.insert=0,n.match_length=n.prev_length=$t-1,n.match_available=0,n.ins_h=0};function hy(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=mo,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(ey*2),this.dyn_dtree=new Uint16Array((2*jx+1)*2),this.bl_tree=new Uint16Array((2*ty+1)*2),di(this.dyn_ltree),di(this.dyn_dtree),di(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(ny+1),this.heap=new Uint16Array(2*_h+1),di(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(2*_h+1),di(this.depth),this.sym_buf=0,this.lit_bufsize=0,this.sym_next=0,this.sym_end=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}var Hs=n=>{if(!n)return 1;let t=n.state;return!t||t.strm!==n||t.status!==Lr&&t.status!==Th&&t.status!==xh&&t.status!==yh&&t.status!==vh&&t.status!==Mh&&t.status!==Vi&&t.status!==Ts?1:0},nm=n=>{if(Hs(n))return Gi(n,Pn);n.total_in=n.total_out=0,n.data_type=Yx;let t=n.state;return t.pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap===2?Th:t.wrap?Lr:Vi,n.adler=t.wrap===2?0:1,t.last_flush=-2,Fx(t),Ue},im=n=>{let t=nm(n);return t===Ue&&cy(n.state),t},uy=(n,t)=>Hs(n)||n.state.wrap!==2?Pn:(n.state.gzhead=t,Ue),rm=(n,t,e,i,r,s)=>{if(!n)return Pn;let a=1;if(t===Vx&&(t=6),i<0?(a=0,i=-i):i>15&&(a=2,i-=16),r<1||r>Zx||e!==mo||i<8||i>15||t<0||t>9||s<0||s>Xx||i===8&&a!==1)return Gi(n,Pn);i===8&&(i=9);let o=new hy;return n.state=o,o.strm=n,o.status=Lr,o.wrap=a,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=r+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+$t-1)/$t),o.window=new Uint8Array(o.w_size*2),o.head=new Uint16Array(o.hash_size),o.prev=new Uint16Array(o.w_size),o.lit_bufsize=1<<r+6,o.pending_buf_size=o.lit_bufsize*4,o.pending_buf=new Uint8Array(o.pending_buf_size),o.sym_buf=o.lit_bufsize,o.sym_end=(o.lit_bufsize-1)*3,o.level=t,o.strategy=s,o.method=e,im(n)},fy=(n,t)=>rm(n,t,mo,$x,Jx,qx),dy=(n,t)=>{if(Hs(n)||t>ap||t<0)return n?Gi(n,Pn):Pn;let e=n.state;if(!n.output||n.avail_in!==0&&!n.input||e.status===Ts&&t!==dn)return Gi(n,n.avail_out===0?rh:Pn);let i=e.last_flush;if(e.last_flush=t,e.pending!==0){if(en(n),n.avail_out===0)return e.last_flush=-1,Ue}else if(n.avail_in===0&&lp(t)<=lp(i)&&t!==dn)return Gi(n,rh);if(e.status===Ts&&n.avail_in!==0)return Gi(n,rh);if(e.status===Lr&&e.wrap===0&&(e.status=Vi),e.status===Lr){let r=mo+(e.w_bits-8<<4)<<8,s=-1;if(e.strategy>=so||e.level<2?s=0:e.level<6?s=1:e.level===6?s=2:s=3,r|=s<<6,e.strstart!==0&&(r|=iy),r+=31-r%31,As(e,r),e.strstart!==0&&(As(e,n.adler>>>16),As(e,n.adler&65535)),n.adler=1,e.status=Vi,en(n),e.pending!==0)return e.last_flush=-1,Ue}if(e.status===Th){if(n.adler=0,Kt(e,31),Kt(e,139),Kt(e,8),e.gzhead)Kt(e,(e.gzhead.text?1:0)+(e.gzhead.hcrc?2:0)+(e.gzhead.extra?4:0)+(e.gzhead.name?8:0)+(e.gzhead.comment?16:0)),Kt(e,e.gzhead.time&255),Kt(e,e.gzhead.time>>8&255),Kt(e,e.gzhead.time>>16&255),Kt(e,e.gzhead.time>>24&255),Kt(e,e.level===9?2:e.strategy>=so||e.level<2?4:0),Kt(e,e.gzhead.os&255),e.gzhead.extra&&e.gzhead.extra.length&&(Kt(e,e.gzhead.extra.length&255),Kt(e,e.gzhead.extra.length>>8&255)),e.gzhead.hcrc&&(n.adler=Ce(n.adler,e.pending_buf,e.pending,0)),e.gzindex=0,e.status=xh;else if(Kt(e,0),Kt(e,0),Kt(e,0),Kt(e,0),Kt(e,0),Kt(e,e.level===9?2:e.strategy>=so||e.level<2?4:0),Kt(e,ry),e.status=Vi,en(n),e.pending!==0)return e.last_flush=-1,Ue}if(e.status===xh){if(e.gzhead.extra){let r=e.pending,s=(e.gzhead.extra.length&65535)-e.gzindex;for(;e.pending+s>e.pending_buf_size;){let o=e.pending_buf_size-e.pending;if(e.pending_buf.set(e.gzhead.extra.subarray(e.gzindex,e.gzindex+o),e.pending),e.pending=e.pending_buf_size,e.gzhead.hcrc&&e.pending>r&&(n.adler=Ce(n.adler,e.pending_buf,e.pending-r,r)),e.gzindex+=o,en(n),e.pending!==0)return e.last_flush=-1,Ue;r=0,s-=o}let a=new Uint8Array(e.gzhead.extra);e.pending_buf.set(a.subarray(e.gzindex,e.gzindex+s),e.pending),e.pending+=s,e.gzhead.hcrc&&e.pending>r&&(n.adler=Ce(n.adler,e.pending_buf,e.pending-r,r)),e.gzindex=0}e.status=yh}if(e.status===yh){if(e.gzhead.name){let r=e.pending,s;do{if(e.pending===e.pending_buf_size){if(e.gzhead.hcrc&&e.pending>r&&(n.adler=Ce(n.adler,e.pending_buf,e.pending-r,r)),en(n),e.pending!==0)return e.last_flush=-1,Ue;r=0}e.gzindex<e.gzhead.name.length?s=e.gzhead.name.charCodeAt(e.gzindex++)&255:s=0,Kt(e,s)}while(s!==0);e.gzhead.hcrc&&e.pending>r&&(n.adler=Ce(n.adler,e.pending_buf,e.pending-r,r)),e.gzindex=0}e.status=vh}if(e.status===vh){if(e.gzhead.comment){let r=e.pending,s;do{if(e.pending===e.pending_buf_size){if(e.gzhead.hcrc&&e.pending>r&&(n.adler=Ce(n.adler,e.pending_buf,e.pending-r,r)),en(n),e.pending!==0)return e.last_flush=-1,Ue;r=0}e.gzindex<e.gzhead.comment.length?s=e.gzhead.comment.charCodeAt(e.gzindex++)&255:s=0,Kt(e,s)}while(s!==0);e.gzhead.hcrc&&e.pending>r&&(n.adler=Ce(n.adler,e.pending_buf,e.pending-r,r))}e.status=Mh}if(e.status===Mh){if(e.gzhead.hcrc){if(e.pending+2>e.pending_buf_size&&(en(n),e.pending!==0))return e.last_flush=-1,Ue;Kt(e,n.adler&255),Kt(e,n.adler>>8&255),n.adler=0}if(e.status=Vi,en(n),e.pending!==0)return e.last_flush=-1,Ue}if(n.avail_in!==0||e.lookahead!==0||t!==gi&&e.status!==Ts){let r=e.level===0?em(e,t):e.strategy===so?ly(e,t):e.strategy===Wx?oy(e,t):Rs[e.level].func(e,t);if((r===Xi||r===Fr)&&(e.status=Ts),r===Xe||r===Xi)return n.avail_out===0&&(e.last_flush=-1),Ue;if(r===Nr&&(t===zx?Bx(e):t!==ap&&(gh(e,0,0,!1),t===kx&&(di(e.head),e.lookahead===0&&(e.strstart=0,e.block_start=0,e.insert=0))),en(n),n.avail_out===0))return e.last_flush=-1,Ue}return t!==dn?Ue:e.wrap<=0?op:(e.wrap===2?(Kt(e,n.adler&255),Kt(e,n.adler>>8&255),Kt(e,n.adler>>16&255),Kt(e,n.adler>>24&255),Kt(e,n.total_in&255),Kt(e,n.total_in>>8&255),Kt(e,n.total_in>>16&255),Kt(e,n.total_in>>24&255)):(As(e,n.adler>>>16),As(e,n.adler&65535)),en(n),e.wrap>0&&(e.wrap=-e.wrap),e.pending!==0?Ue:op)},py=n=>{if(Hs(n))return Pn;let t=n.state.status;return n.state=null,t===Vi?Gi(n,Hx):Ue},my=(n,t)=>{let e=t.length;if(Hs(n))return Pn;let i=n.state,r=i.wrap;if(r===2||r===1&&i.status!==Lr||i.lookahead)return Pn;if(r===1&&(n.adler=Fs(n.adler,t,e,0)),i.wrap=0,e>=i.w_size){r===0&&(di(i.head),i.strstart=0,i.block_start=0,i.insert=0);let c=new Uint8Array(i.w_size);c.set(t.subarray(e-i.w_size,e),0),t=c,e=i.w_size}let s=n.avail_in,a=n.next_in,o=n.input;for(n.avail_in=e,n.next_in=0,n.input=t,Ur(i);i.lookahead>=$t;){let c=i.strstart,l=i.lookahead-($t-1);do i.ins_h=_i(i,i.ins_h,i.window[c+$t-1]),i.prev[c&i.w_mask]=i.head[i.ins_h],i.head[i.ins_h]=c,c++;while(--l);i.strstart=c,i.lookahead=$t-1,Ur(i)}return i.strstart+=i.lookahead,i.block_start=i.strstart,i.insert=i.lookahead,i.lookahead=0,i.match_length=i.prev_length=$t-1,i.match_available=0,n.next_in=a,n.input=o,n.avail_in=s,i.wrap=r,Ue},gy=fy,_y=rm,xy=im,yy=nm,vy=uy,My=dy,Sy=py,by=my,wy="pako deflate (from Nodeca project)",Is={deflateInit:gy,deflateInit2:_y,deflateReset:xy,deflateResetKeep:yy,deflateSetHeader:vy,deflate:My,deflateEnd:Sy,deflateSetDictionary:by,deflateInfo:wy},Ey=(n,t)=>Object.prototype.hasOwnProperty.call(n,t),Ay=function(n){let t=Array.prototype.slice.call(arguments,1);for(;t.length;){let e=t.shift();if(e){if(typeof e!="object")throw new TypeError(e+"must be non-object");for(let i in e)Ey(e,i)&&(n[i]=e[i])}}return n},Ty=n=>{let t=0;for(let i=0,r=n.length;i<r;i++)t+=n[i].length;let e=new Uint8Array(t);for(let i=0,r=0,s=n.length;i<s;i++){let a=n[i];e.set(a,r),r+=a.length}return e},go={assign:Ay,flattenChunks:Ty},sm=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{sm=!1}var Os=new Uint8Array(256);for(let n=0;n<256;n++)Os[n]=n>=252?6:n>=248?5:n>=240?4:n>=224?3:n>=192?2:1;Os[254]=Os[254]=1;var Ry=n=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(n);let t,e,i,r,s,a=n.length,o=0;for(r=0;r<a;r++)e=n.charCodeAt(r),(e&64512)===55296&&r+1<a&&(i=n.charCodeAt(r+1),(i&64512)===56320&&(e=65536+(e-55296<<10)+(i-56320),r++)),o+=e<128?1:e<2048?2:e<65536?3:4;for(t=new Uint8Array(o),s=0,r=0;s<o;r++)e=n.charCodeAt(r),(e&64512)===55296&&r+1<a&&(i=n.charCodeAt(r+1),(i&64512)===56320&&(e=65536+(e-55296<<10)+(i-56320),r++)),e<128?t[s++]=e:e<2048?(t[s++]=192|e>>>6,t[s++]=128|e&63):e<65536?(t[s++]=224|e>>>12,t[s++]=128|e>>>6&63,t[s++]=128|e&63):(t[s++]=240|e>>>18,t[s++]=128|e>>>12&63,t[s++]=128|e>>>6&63,t[s++]=128|e&63);return t},Cy=(n,t)=>{if(t<65534&&n.subarray&&sm)return String.fromCharCode.apply(null,n.length===t?n:n.subarray(0,t));let e="";for(let i=0;i<t;i++)e+=String.fromCharCode(n[i]);return e},Iy=(n,t)=>{let e=t||n.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(n.subarray(0,t));let i,r,s=new Array(e*2);for(r=0,i=0;i<e;){let a=n[i++];if(a<128){s[r++]=a;continue}let o=Os[a];if(o>4){s[r++]=65533,i+=o-1;continue}for(a&=o===2?31:o===3?15:7;o>1&&i<e;)a=a<<6|n[i++]&63,o--;if(o>1){s[r++]=65533;continue}a<65536?s[r++]=a:(a-=65536,s[r++]=55296|a>>10&1023,s[r++]=56320|a&1023)}return Cy(s,r)},Py=(n,t)=>{t=t||n.length,t>n.length&&(t=n.length);let e=t-1;for(;e>=0&&(n[e]&192)===128;)e--;return e<0||e===0?t:e+Os[n[e]]>t?e:t},Bs={string2buf:Ry,buf2string:Iy,utf8border:Py};function Ly(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var am=Ly,om=Object.prototype.toString,{Z_NO_FLUSH:Uy,Z_SYNC_FLUSH:Dy,Z_FULL_FLUSH:Ny,Z_FINISH:Fy,Z_OK:fo,Z_STREAM_END:Oy,Z_DEFAULT_COMPRESSION:By,Z_DEFAULT_STRATEGY:zy,Z_DEFLATED:ky}=Yi;function Vs(n){this.options=go.assign({level:By,method:ky,chunkSize:16384,windowBits:15,memLevel:8,strategy:zy},n||{});let t=this.options;t.raw&&t.windowBits>0?t.windowBits=-t.windowBits:t.gzip&&t.windowBits>0&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new am,this.strm.avail_out=0;let e=Is.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(e!==fo)throw new Error(Wi[e]);if(t.header&&Is.deflateSetHeader(this.strm,t.header),t.dictionary){let i;if(typeof t.dictionary=="string"?i=Bs.string2buf(t.dictionary):om.call(t.dictionary)==="[object ArrayBuffer]"?i=new Uint8Array(t.dictionary):i=t.dictionary,e=Is.deflateSetDictionary(this.strm,i),e!==fo)throw new Error(Wi[e]);this._dict_set=!0}}Vs.prototype.push=function(n,t){let e=this.strm,i=this.options.chunkSize,r,s;if(this.ended)return!1;for(t===~~t?s=t:s=t===!0?Fy:Uy,typeof n=="string"?e.input=Bs.string2buf(n):om.call(n)==="[object ArrayBuffer]"?e.input=new Uint8Array(n):e.input=n,e.next_in=0,e.avail_in=e.input.length;;){if(e.avail_out===0&&(e.output=new Uint8Array(i),e.next_out=0,e.avail_out=i),(s===Dy||s===Ny)&&e.avail_out<=6){this.onData(e.output.subarray(0,e.next_out)),e.avail_out=0;continue}if(r=Is.deflate(e,s),r===Oy)return e.next_out>0&&this.onData(e.output.subarray(0,e.next_out)),r=Is.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===fo;if(e.avail_out===0){this.onData(e.output);continue}if(s>0&&e.next_out>0){this.onData(e.output.subarray(0,e.next_out)),e.avail_out=0;continue}if(e.avail_in===0)break}return!0};Vs.prototype.onData=function(n){this.chunks.push(n)};Vs.prototype.onEnd=function(n){n===fo&&(this.result=go.flattenChunks(this.chunks)),this.chunks=[],this.err=n,this.msg=this.strm.msg};function Rh(n,t){let e=new Vs(t);if(e.push(n,!0),e.err)throw e.msg||Wi[e.err];return e.result}function Hy(n,t){return t=t||{},t.raw=!0,Rh(n,t)}function Vy(n,t){return t=t||{},t.gzip=!0,Rh(n,t)}var Gy=Vs,Wy=Rh,Xy=Hy,qy=Vy,Yy=Yi,Zy={Deflate:Gy,deflate:Wy,deflateRaw:Xy,gzip:qy,constants:Yy},ao=16209,$y=16191,Jy=function(t,e){let i,r,s,a,o,c,l,h,u,f,d,m,_,g,p,y,x,v,R,E,w,I,M,S,D=t.state;i=t.next_in,M=t.input,r=i+(t.avail_in-5),s=t.next_out,S=t.output,a=s-(e-t.avail_out),o=s+(t.avail_out-257),c=D.dmax,l=D.wsize,h=D.whave,u=D.wnext,f=D.window,d=D.hold,m=D.bits,_=D.lencode,g=D.distcode,p=(1<<D.lenbits)-1,y=(1<<D.distbits)-1;t:do{m<15&&(d+=M[i++]<<m,m+=8,d+=M[i++]<<m,m+=8),x=_[d&p];e:for(;;){if(v=x>>>24,d>>>=v,m-=v,v=x>>>16&255,v===0)S[s++]=x&65535;else if(v&16){R=x&65535,v&=15,v&&(m<v&&(d+=M[i++]<<m,m+=8),R+=d&(1<<v)-1,d>>>=v,m-=v),m<15&&(d+=M[i++]<<m,m+=8,d+=M[i++]<<m,m+=8),x=g[d&y];n:for(;;){if(v=x>>>24,d>>>=v,m-=v,v=x>>>16&255,v&16){if(E=x&65535,v&=15,m<v&&(d+=M[i++]<<m,m+=8,m<v&&(d+=M[i++]<<m,m+=8)),E+=d&(1<<v)-1,E>c){t.msg="invalid distance too far back",D.mode=ao;break t}if(d>>>=v,m-=v,v=s-a,E>v){if(v=E-v,v>h&&D.sane){t.msg="invalid distance too far back",D.mode=ao;break t}if(w=0,I=f,u===0){if(w+=l-v,v<R){R-=v;do S[s++]=f[w++];while(--v);w=s-E,I=S}}else if(u<v){if(w+=l+u-v,v-=u,v<R){R-=v;do S[s++]=f[w++];while(--v);if(w=0,u<R){v=u,R-=v;do S[s++]=f[w++];while(--v);w=s-E,I=S}}}else if(w+=u-v,v<R){R-=v;do S[s++]=f[w++];while(--v);w=s-E,I=S}for(;R>2;)S[s++]=I[w++],S[s++]=I[w++],S[s++]=I[w++],R-=3;R&&(S[s++]=I[w++],R>1&&(S[s++]=I[w++]))}else{w=s-E;do S[s++]=S[w++],S[s++]=S[w++],S[s++]=S[w++],R-=3;while(R>2);R&&(S[s++]=S[w++],R>1&&(S[s++]=S[w++]))}}else if((v&64)===0){x=g[(x&65535)+(d&(1<<v)-1)];continue n}else{t.msg="invalid distance code",D.mode=ao;break t}break}}else if((v&64)===0){x=_[(x&65535)+(d&(1<<v)-1)];continue e}else if(v&32){D.mode=$y;break t}else{t.msg="invalid literal/length code",D.mode=ao;break t}break}}while(i<r&&s<o);R=m>>3,i-=R,m-=R<<3,d&=(1<<m)-1,t.next_in=i,t.next_out=s,t.avail_in=i<r?5+(r-i):5-(i-r),t.avail_out=s<o?257+(o-s):257-(s-o),D.hold=d,D.bits=m},Ir=15,cp=852,hp=592,up=0,ah=1,fp=2,Ky=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),Qy=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),jy=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),tv=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),ev=(n,t,e,i,r,s,a,o)=>{let c=o.bits,l=0,h=0,u=0,f=0,d=0,m=0,_=0,g=0,p=0,y=0,x,v,R,E,w,I=null,M,S=new Uint16Array(Ir+1),D=new Uint16Array(Ir+1),V=null,rt,L,O;for(l=0;l<=Ir;l++)S[l]=0;for(h=0;h<i;h++)S[t[e+h]]++;for(d=c,f=Ir;f>=1&&S[f]===0;f--);if(d>f&&(d=f),f===0)return r[s++]=1<<24|64<<16|0,r[s++]=1<<24|64<<16|0,o.bits=1,0;for(u=1;u<f&&S[u]===0;u++);for(d<u&&(d=u),g=1,l=1;l<=Ir;l++)if(g<<=1,g-=S[l],g<0)return-1;if(g>0&&(n===up||f!==1))return-1;for(D[1]=0,l=1;l<Ir;l++)D[l+1]=D[l]+S[l];for(h=0;h<i;h++)t[e+h]!==0&&(a[D[t[e+h]]++]=h);if(n===up?(I=V=a,M=20):n===ah?(I=Ky,V=Qy,M=257):(I=jy,V=tv,M=0),y=0,h=0,l=u,w=s,m=d,_=0,R=-1,p=1<<d,E=p-1,n===ah&&p>cp||n===fp&&p>hp)return 1;for(;;){rt=l-_,a[h]+1<M?(L=0,O=a[h]):a[h]>=M?(L=V[a[h]-M],O=I[a[h]-M]):(L=96,O=0),x=1<<l-_,v=1<<m,u=v;do v-=x,r[w+(y>>_)+v]=rt<<24|L<<16|O|0;while(v!==0);for(x=1<<l-1;y&x;)x>>=1;if(x!==0?(y&=x-1,y+=x):y=0,h++,--S[l]===0){if(l===f)break;l=t[e+a[h]]}if(l>d&&(y&E)!==R){for(_===0&&(_=d),w+=u,m=l-_,g=1<<m;m+_<f&&(g-=S[m+_],!(g<=0));)m++,g<<=1;if(p+=1<<m,n===ah&&p>cp||n===fp&&p>hp)return 1;R=y&E,r[R]=d<<24|m<<16|w-s|0}}return y!==0&&(r[w+y]=l-_<<24|64<<16|0),o.bits=d,0},Ps=ev,nv=0,lm=1,cm=2,{Z_FINISH:dp,Z_BLOCK:iv,Z_TREES:oo,Z_OK:qi,Z_STREAM_END:rv,Z_NEED_DICT:sv,Z_STREAM_ERROR:pn,Z_DATA_ERROR:hm,Z_MEM_ERROR:um,Z_BUF_ERROR:av,Z_DEFLATED:pp}=Yi,_o=16180,mp=16181,gp=16182,_p=16183,xp=16184,yp=16185,vp=16186,Mp=16187,Sp=16188,bp=16189,po=16190,Gn=16191,oh=16192,wp=16193,lh=16194,Ep=16195,Ap=16196,Tp=16197,Rp=16198,lo=16199,co=16200,Cp=16201,Ip=16202,Pp=16203,Lp=16204,Up=16205,ch=16206,Dp=16207,Np=16208,le=16209,fm=16210,dm=16211,ov=852,lv=592,cv=15,hv=cv,Fp=n=>(n>>>24&255)+(n>>>8&65280)+((n&65280)<<8)+((n&255)<<24);function uv(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}var Zi=n=>{if(!n)return 1;let t=n.state;return!t||t.strm!==n||t.mode<_o||t.mode>dm?1:0},pm=n=>{if(Zi(n))return pn;let t=n.state;return n.total_in=n.total_out=t.total=0,n.msg="",t.wrap&&(n.adler=t.wrap&1),t.mode=_o,t.last=0,t.havedict=0,t.flags=-1,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new Int32Array(ov),t.distcode=t.distdyn=new Int32Array(lv),t.sane=1,t.back=-1,qi},mm=n=>{if(Zi(n))return pn;let t=n.state;return t.wsize=0,t.whave=0,t.wnext=0,pm(n)},gm=(n,t)=>{let e;if(Zi(n))return pn;let i=n.state;return t<0?(e=0,t=-t):(e=(t>>4)+5,t<48&&(t&=15)),t&&(t<8||t>15)?pn:(i.window!==null&&i.wbits!==t&&(i.window=null),i.wrap=e,i.wbits=t,mm(n))},_m=(n,t)=>{if(!n)return pn;let e=new uv;n.state=e,e.strm=n,e.window=null,e.mode=_o;let i=gm(n,t);return i!==qi&&(n.state=null),i},fv=n=>_m(n,hv),Op=!0,hh,uh,dv=n=>{if(Op){hh=new Int32Array(512),uh=new Int32Array(32);let t=0;for(;t<144;)n.lens[t++]=8;for(;t<256;)n.lens[t++]=9;for(;t<280;)n.lens[t++]=7;for(;t<288;)n.lens[t++]=8;for(Ps(lm,n.lens,0,288,hh,0,n.work,{bits:9}),t=0;t<32;)n.lens[t++]=5;Ps(cm,n.lens,0,32,uh,0,n.work,{bits:5}),Op=!1}n.lencode=hh,n.lenbits=9,n.distcode=uh,n.distbits=5},xm=(n,t,e,i)=>{let r,s=n.state;return s.window===null&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new Uint8Array(s.wsize)),i>=s.wsize?(s.window.set(t.subarray(e-s.wsize,e),0),s.wnext=0,s.whave=s.wsize):(r=s.wsize-s.wnext,r>i&&(r=i),s.window.set(t.subarray(e-i,e-i+r),s.wnext),i-=r,i?(s.window.set(t.subarray(e-i,e),0),s.wnext=i,s.whave=s.wsize):(s.wnext+=r,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=r))),0},pv=(n,t)=>{let e,i,r,s,a,o,c,l,h,u,f,d,m,_,g=0,p,y,x,v,R,E,w,I,M=new Uint8Array(4),S,D,V=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(Zi(n)||!n.output||!n.input&&n.avail_in!==0)return pn;e=n.state,e.mode===Gn&&(e.mode=oh),a=n.next_out,r=n.output,c=n.avail_out,s=n.next_in,i=n.input,o=n.avail_in,l=e.hold,h=e.bits,u=o,f=c,I=qi;t:for(;;)switch(e.mode){case _o:if(e.wrap===0){e.mode=oh;break}for(;h<16;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(e.wrap&2&&l===35615){e.wbits===0&&(e.wbits=15),e.check=0,M[0]=l&255,M[1]=l>>>8&255,e.check=Ce(e.check,M,2,0),l=0,h=0,e.mode=mp;break}if(e.head&&(e.head.done=!1),!(e.wrap&1)||(((l&255)<<8)+(l>>8))%31){n.msg="incorrect header check",e.mode=le;break}if((l&15)!==pp){n.msg="unknown compression method",e.mode=le;break}if(l>>>=4,h-=4,w=(l&15)+8,e.wbits===0&&(e.wbits=w),w>15||w>e.wbits){n.msg="invalid window size",e.mode=le;break}e.dmax=1<<e.wbits,e.flags=0,n.adler=e.check=1,e.mode=l&512?bp:Gn,l=0,h=0;break;case mp:for(;h<16;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(e.flags=l,(e.flags&255)!==pp){n.msg="unknown compression method",e.mode=le;break}if(e.flags&57344){n.msg="unknown header flags set",e.mode=le;break}e.head&&(e.head.text=l>>8&1),e.flags&512&&e.wrap&4&&(M[0]=l&255,M[1]=l>>>8&255,e.check=Ce(e.check,M,2,0)),l=0,h=0,e.mode=gp;case gp:for(;h<32;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}e.head&&(e.head.time=l),e.flags&512&&e.wrap&4&&(M[0]=l&255,M[1]=l>>>8&255,M[2]=l>>>16&255,M[3]=l>>>24&255,e.check=Ce(e.check,M,4,0)),l=0,h=0,e.mode=_p;case _p:for(;h<16;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}e.head&&(e.head.xflags=l&255,e.head.os=l>>8),e.flags&512&&e.wrap&4&&(M[0]=l&255,M[1]=l>>>8&255,e.check=Ce(e.check,M,2,0)),l=0,h=0,e.mode=xp;case xp:if(e.flags&1024){for(;h<16;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}e.length=l,e.head&&(e.head.extra_len=l),e.flags&512&&e.wrap&4&&(M[0]=l&255,M[1]=l>>>8&255,e.check=Ce(e.check,M,2,0)),l=0,h=0}else e.head&&(e.head.extra=null);e.mode=yp;case yp:if(e.flags&1024&&(d=e.length,d>o&&(d=o),d&&(e.head&&(w=e.head.extra_len-e.length,e.head.extra||(e.head.extra=new Uint8Array(e.head.extra_len)),e.head.extra.set(i.subarray(s,s+d),w)),e.flags&512&&e.wrap&4&&(e.check=Ce(e.check,i,d,s)),o-=d,s+=d,e.length-=d),e.length))break t;e.length=0,e.mode=vp;case vp:if(e.flags&2048){if(o===0)break t;d=0;do w=i[s+d++],e.head&&w&&e.length<65536&&(e.head.name+=String.fromCharCode(w));while(w&&d<o);if(e.flags&512&&e.wrap&4&&(e.check=Ce(e.check,i,d,s)),o-=d,s+=d,w)break t}else e.head&&(e.head.name=null);e.length=0,e.mode=Mp;case Mp:if(e.flags&4096){if(o===0)break t;d=0;do w=i[s+d++],e.head&&w&&e.length<65536&&(e.head.comment+=String.fromCharCode(w));while(w&&d<o);if(e.flags&512&&e.wrap&4&&(e.check=Ce(e.check,i,d,s)),o-=d,s+=d,w)break t}else e.head&&(e.head.comment=null);e.mode=Sp;case Sp:if(e.flags&512){for(;h<16;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(e.wrap&4&&l!==(e.check&65535)){n.msg="header crc mismatch",e.mode=le;break}l=0,h=0}e.head&&(e.head.hcrc=e.flags>>9&1,e.head.done=!0),n.adler=e.check=0,e.mode=Gn;break;case bp:for(;h<32;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}n.adler=e.check=Fp(l),l=0,h=0,e.mode=po;case po:if(e.havedict===0)return n.next_out=a,n.avail_out=c,n.next_in=s,n.avail_in=o,e.hold=l,e.bits=h,sv;n.adler=e.check=1,e.mode=Gn;case Gn:if(t===iv||t===oo)break t;case oh:if(e.last){l>>>=h&7,h-=h&7,e.mode=ch;break}for(;h<3;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}switch(e.last=l&1,l>>>=1,h-=1,l&3){case 0:e.mode=wp;break;case 1:if(dv(e),e.mode=lo,t===oo){l>>>=2,h-=2;break t}break;case 2:e.mode=Ap;break;case 3:n.msg="invalid block type",e.mode=le}l>>>=2,h-=2;break;case wp:for(l>>>=h&7,h-=h&7;h<32;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if((l&65535)!==(l>>>16^65535)){n.msg="invalid stored block lengths",e.mode=le;break}if(e.length=l&65535,l=0,h=0,e.mode=lh,t===oo)break t;case lh:e.mode=Ep;case Ep:if(d=e.length,d){if(d>o&&(d=o),d>c&&(d=c),d===0)break t;r.set(i.subarray(s,s+d),a),o-=d,s+=d,c-=d,a+=d,e.length-=d;break}e.mode=Gn;break;case Ap:for(;h<14;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(e.nlen=(l&31)+257,l>>>=5,h-=5,e.ndist=(l&31)+1,l>>>=5,h-=5,e.ncode=(l&15)+4,l>>>=4,h-=4,e.nlen>286||e.ndist>30){n.msg="too many length or distance symbols",e.mode=le;break}e.have=0,e.mode=Tp;case Tp:for(;e.have<e.ncode;){for(;h<3;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}e.lens[V[e.have++]]=l&7,l>>>=3,h-=3}for(;e.have<19;)e.lens[V[e.have++]]=0;if(e.lencode=e.lendyn,e.lenbits=7,S={bits:e.lenbits},I=Ps(nv,e.lens,0,19,e.lencode,0,e.work,S),e.lenbits=S.bits,I){n.msg="invalid code lengths set",e.mode=le;break}e.have=0,e.mode=Rp;case Rp:for(;e.have<e.nlen+e.ndist;){for(;g=e.lencode[l&(1<<e.lenbits)-1],p=g>>>24,y=g>>>16&255,x=g&65535,!(p<=h);){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(x<16)l>>>=p,h-=p,e.lens[e.have++]=x;else{if(x===16){for(D=p+2;h<D;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(l>>>=p,h-=p,e.have===0){n.msg="invalid bit length repeat",e.mode=le;break}w=e.lens[e.have-1],d=3+(l&3),l>>>=2,h-=2}else if(x===17){for(D=p+3;h<D;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}l>>>=p,h-=p,w=0,d=3+(l&7),l>>>=3,h-=3}else{for(D=p+7;h<D;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}l>>>=p,h-=p,w=0,d=11+(l&127),l>>>=7,h-=7}if(e.have+d>e.nlen+e.ndist){n.msg="invalid bit length repeat",e.mode=le;break}for(;d--;)e.lens[e.have++]=w}}if(e.mode===le)break;if(e.lens[256]===0){n.msg="invalid code -- missing end-of-block",e.mode=le;break}if(e.lenbits=9,S={bits:e.lenbits},I=Ps(lm,e.lens,0,e.nlen,e.lencode,0,e.work,S),e.lenbits=S.bits,I){n.msg="invalid literal/lengths set",e.mode=le;break}if(e.distbits=6,e.distcode=e.distdyn,S={bits:e.distbits},I=Ps(cm,e.lens,e.nlen,e.ndist,e.distcode,0,e.work,S),e.distbits=S.bits,I){n.msg="invalid distances set",e.mode=le;break}if(e.mode=lo,t===oo)break t;case lo:e.mode=co;case co:if(o>=6&&c>=258){n.next_out=a,n.avail_out=c,n.next_in=s,n.avail_in=o,e.hold=l,e.bits=h,Jy(n,f),a=n.next_out,r=n.output,c=n.avail_out,s=n.next_in,i=n.input,o=n.avail_in,l=e.hold,h=e.bits,e.mode===Gn&&(e.back=-1);break}for(e.back=0;g=e.lencode[l&(1<<e.lenbits)-1],p=g>>>24,y=g>>>16&255,x=g&65535,!(p<=h);){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(y&&(y&240)===0){for(v=p,R=y,E=x;g=e.lencode[E+((l&(1<<v+R)-1)>>v)],p=g>>>24,y=g>>>16&255,x=g&65535,!(v+p<=h);){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}l>>>=v,h-=v,e.back+=v}if(l>>>=p,h-=p,e.back+=p,e.length=x,y===0){e.mode=Up;break}if(y&32){e.back=-1,e.mode=Gn;break}if(y&64){n.msg="invalid literal/length code",e.mode=le;break}e.extra=y&15,e.mode=Cp;case Cp:if(e.extra){for(D=e.extra;h<D;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}e.length+=l&(1<<e.extra)-1,l>>>=e.extra,h-=e.extra,e.back+=e.extra}e.was=e.length,e.mode=Ip;case Ip:for(;g=e.distcode[l&(1<<e.distbits)-1],p=g>>>24,y=g>>>16&255,x=g&65535,!(p<=h);){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if((y&240)===0){for(v=p,R=y,E=x;g=e.distcode[E+((l&(1<<v+R)-1)>>v)],p=g>>>24,y=g>>>16&255,x=g&65535,!(v+p<=h);){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}l>>>=v,h-=v,e.back+=v}if(l>>>=p,h-=p,e.back+=p,y&64){n.msg="invalid distance code",e.mode=le;break}e.offset=x,e.extra=y&15,e.mode=Pp;case Pp:if(e.extra){for(D=e.extra;h<D;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}e.offset+=l&(1<<e.extra)-1,l>>>=e.extra,h-=e.extra,e.back+=e.extra}if(e.offset>e.dmax){n.msg="invalid distance too far back",e.mode=le;break}e.mode=Lp;case Lp:if(c===0)break t;if(d=f-c,e.offset>d){if(d=e.offset-d,d>e.whave&&e.sane){n.msg="invalid distance too far back",e.mode=le;break}d>e.wnext?(d-=e.wnext,m=e.wsize-d):m=e.wnext-d,d>e.length&&(d=e.length),_=e.window}else _=r,m=a-e.offset,d=e.length;d>c&&(d=c),c-=d,e.length-=d;do r[a++]=_[m++];while(--d);e.length===0&&(e.mode=co);break;case Up:if(c===0)break t;r[a++]=e.length,c--,e.mode=co;break;case ch:if(e.wrap){for(;h<32;){if(o===0)break t;o--,l|=i[s++]<<h,h+=8}if(f-=c,n.total_out+=f,e.total+=f,e.wrap&4&&f&&(n.adler=e.check=e.flags?Ce(e.check,r,f,a-f):Fs(e.check,r,f,a-f)),f=c,e.wrap&4&&(e.flags?l:Fp(l))!==e.check){n.msg="incorrect data check",e.mode=le;break}l=0,h=0}e.mode=Dp;case Dp:if(e.wrap&&e.flags){for(;h<32;){if(o===0)break t;o--,l+=i[s++]<<h,h+=8}if(e.wrap&4&&l!==(e.total&4294967295)){n.msg="incorrect length check",e.mode=le;break}l=0,h=0}e.mode=Np;case Np:I=rv;break t;case le:I=hm;break t;case fm:return um;case dm:default:return pn}return n.next_out=a,n.avail_out=c,n.next_in=s,n.avail_in=o,e.hold=l,e.bits=h,(e.wsize||f!==n.avail_out&&e.mode<le&&(e.mode<ch||t!==dp))&&xm(n,n.output,n.next_out,f-n.avail_out),u-=n.avail_in,f-=n.avail_out,n.total_in+=u,n.total_out+=f,e.total+=f,e.wrap&4&&f&&(n.adler=e.check=e.flags?Ce(e.check,r,f,n.next_out-f):Fs(e.check,r,f,n.next_out-f)),n.data_type=e.bits+(e.last?64:0)+(e.mode===Gn?128:0)+(e.mode===lo||e.mode===lh?256:0),(u===0&&f===0||t===dp)&&I===qi&&(I=av),I},mv=n=>{if(Zi(n))return pn;let t=n.state;return t.window&&(t.window=null),n.state=null,qi},gv=(n,t)=>{if(Zi(n))return pn;let e=n.state;return(e.wrap&2)===0?pn:(e.head=t,t.done=!1,qi)},_v=(n,t)=>{let e=t.length,i,r,s;return Zi(n)||(i=n.state,i.wrap!==0&&i.mode!==po)?pn:i.mode===po&&(r=1,r=Fs(r,t,e,0),r!==i.check)?hm:(s=xm(n,t,e,e),s?(i.mode=fm,um):(i.havedict=1,qi))},xv=mm,yv=gm,vv=pm,Mv=fv,Sv=_m,bv=pv,wv=mv,Ev=gv,Av=_v,Tv="pako inflate (from Nodeca project)",Xn={inflateReset:xv,inflateReset2:yv,inflateResetKeep:vv,inflateInit:Mv,inflateInit2:Sv,inflate:bv,inflateEnd:wv,inflateGetHeader:Ev,inflateSetDictionary:Av,inflateInfo:Tv};function Rv(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var Cv=Rv,ym=Object.prototype.toString,{Z_NO_FLUSH:Iv,Z_FINISH:Pv,Z_OK:zs,Z_STREAM_END:fh,Z_NEED_DICT:dh,Z_STREAM_ERROR:Lv,Z_DATA_ERROR:Bp,Z_MEM_ERROR:Uv}=Yi;function Gs(n){this.options=go.assign({chunkSize:1024*64,windowBits:15,to:""},n||{});let t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,t.windowBits===0&&(t.windowBits=-15)),t.windowBits>=0&&t.windowBits<16&&!(n&&n.windowBits)&&(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&(t.windowBits&15)===0&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new am,this.strm.avail_out=0;let e=Xn.inflateInit2(this.strm,t.windowBits);if(e!==zs)throw new Error(Wi[e]);if(this.header=new Cv,Xn.inflateGetHeader(this.strm,this.header),t.dictionary&&(typeof t.dictionary=="string"?t.dictionary=Bs.string2buf(t.dictionary):ym.call(t.dictionary)==="[object ArrayBuffer]"&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(e=Xn.inflateSetDictionary(this.strm,t.dictionary),e!==zs)))throw new Error(Wi[e])}Gs.prototype.push=function(n,t){let e=this.strm,i=this.options.chunkSize,r=this.options.dictionary,s,a,o;if(this.ended)return!1;for(t===~~t?a=t:a=t===!0?Pv:Iv,ym.call(n)==="[object ArrayBuffer]"?e.input=new Uint8Array(n):e.input=n,e.next_in=0,e.avail_in=e.input.length;;){for(e.avail_out===0&&(e.output=new Uint8Array(i),e.next_out=0,e.avail_out=i),s=Xn.inflate(e,a),s===dh&&r&&(s=Xn.inflateSetDictionary(e,r),s===zs?s=Xn.inflate(e,a):s===Bp&&(s=dh));e.avail_in>0&&s===fh&&e.state.wrap>0&&n[e.next_in]!==0;)Xn.inflateReset(e),s=Xn.inflate(e,a);switch(s){case Lv:case Bp:case dh:case Uv:return this.onEnd(s),this.ended=!0,!1}if(o=e.avail_out,e.next_out&&(e.avail_out===0||s===fh))if(this.options.to==="string"){let c=Bs.utf8border(e.output,e.next_out),l=e.next_out-c,h=Bs.buf2string(e.output,c);e.next_out=l,e.avail_out=i-l,l&&e.output.set(e.output.subarray(c,c+l),0),this.onData(h)}else this.onData(e.output.length===e.next_out?e.output:e.output.subarray(0,e.next_out));if(!(s===zs&&o===0)){if(s===fh)return s=Xn.inflateEnd(this.strm),this.onEnd(s),this.ended=!0,!0;if(e.avail_in===0)break}}return!0};Gs.prototype.onData=function(n){this.chunks.push(n)};Gs.prototype.onEnd=function(n){n===zs&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=go.flattenChunks(this.chunks)),this.chunks=[],this.err=n,this.msg=this.strm.msg};function Ch(n,t){let e=new Gs(t);if(e.push(n),e.err)throw e.msg||Wi[e.err];return e.result}function Dv(n,t){return t=t||{},t.raw=!0,Ch(n,t)}var Nv=Gs,Fv=Ch,Ov=Dv,Bv=Ch,zv=Yi,kv={Inflate:Nv,inflate:Fv,inflateRaw:Ov,ungzip:Bv,constants:zv},{Deflate:Hv,deflate:Vv,deflateRaw:Gv,gzip:Wv}=Zy,{Inflate:Xv,inflate:qv,inflateRaw:Yv,ungzip:Zv}=kv,$v=Hv,Jv=Vv,Kv=Gv,Qv=Wv,jv=Xv,tM=qv,eM=Yv,nM=Zv,iM=Yi,rM={Deflate:$v,deflate:Jv,deflateRaw:Kv,gzip:Qv,Inflate:jv,inflate:tM,inflateRaw:eM,ungzip:nM,constants:iM};var __={};R_(__,{ACESFilmicToneMapping:()=>A0,AddEquation:()=>Ei,AddOperation:()=>S0,AdditiveAnimationBlendMode:()=>yd,AdditiveBlending:()=>du,AgXToneMapping:()=>R0,AlphaFormat:()=>L0,AlwaysCompare:()=>J0,AlwaysDepth:()=>m0,AlwaysStencilFunc:()=>Wu,AmbientLight:()=>vc,AnimationAction:()=>Ic,AnimationClip:()=>br,AnimationLoader:()=>Sf,AnimationMixer:()=>zf,AnimationObjectGroup:()=>Bf,AnimationUtils:()=>CA,ArcCurve:()=>Bl,ArrayCamera:()=>wl,ArrowHelper:()=>od,AttachedBindMode:()=>xu,Audio:()=>Rc,AudioAnalyser:()=>Ff,AudioContext:()=>Ka,AudioListener:()=>Df,AudioLoader:()=>Lf,AxesHelper:()=>ld,BackSide:()=>Ze,BasicDepthPacking:()=>H0,BasicShadowMap:()=>lM,BatchedMesh:()=>Nl,Bone:()=>La,BooleanKeyframeTrack:()=>hi,Box2:()=>Zf,Box3:()=>De,Box3Helper:()=>sd,BoxGeometry:()=>pr,BoxHelper:()=>rd,BufferAttribute:()=>Qt,BufferGeometry:()=>Wt,BufferGeometryLoader:()=>Ac,ByteType:()=>I0,Cache:()=>ni,Camera:()=>gs,CameraHelper:()=>id,CanvasTexture:()=>_f,CapsuleGeometry:()=>Wl,CatmullRomCurve3:()=>zl,CineonToneMapping:()=>E0,CircleGeometry:()=>Xl,ClampToEdgeWrapping:()=>ke,Clock:()=>Tc,Color:()=>pt,ColorKeyframeTrack:()=>Ya,ColorManagement:()=>ne,CompressedArrayTexture:()=>mf,CompressedCubeTexture:()=>gf,CompressedTexture:()=>ys,CompressedTextureLoader:()=>bf,ConeGeometry:()=>ql,ConstantAlphaFactor:()=>f0,ConstantColorFactor:()=>h0,CubeCamera:()=>Sl,CubeReflectionMapping:()=>ci,CubeRefractionMapping:()=>Ii,CubeTexture:()=>mr,CubeTextureLoader:()=>wf,CubeUVReflectionMapping:()=>Ss,CubicBezierCurve:()=>Da,CubicBezierCurve3:()=>kl,CubicInterpolant:()=>dc,CullFaceBack:()=>fu,CullFaceFront:()=>Jg,CullFaceFrontBack:()=>oM,CullFaceNone:()=>$g,Curve:()=>cn,CurvePath:()=>Gl,CustomBlending:()=>Qg,CustomToneMapping:()=>T0,CylinderGeometry:()=>Ms,Cylindrical:()=>Yf,Data3DTexture:()=>Sa,DataArrayTexture:()=>ds,DataTexture:()=>ai,DataTextureLoader:()=>Ef,DataUtils:()=>mS,DecrementStencilOp:()=>vM,DecrementWrapStencilOp:()=>SM,DefaultLoadingManager:()=>m_,DepthFormat:()=>Ri,DepthStencilFormat:()=>dr,DepthTexture:()=>Ra,DetachedBindMode:()=>C0,DirectionalLight:()=>yc,DirectionalLightHelper:()=>nd,DiscreteInterpolant:()=>pc,DisplayP3ColorSpace:()=>Nc,DodecahedronGeometry:()=>Yl,DoubleSide:()=>Nn,DstAlphaFactor:()=>s0,DstColorFactor:()=>o0,DynamicCopyUsage:()=>OM,DynamicDrawUsage:()=>PM,DynamicReadUsage:()=>DM,EdgesGeometry:()=>Zl,EllipseCurve:()=>vs,EqualCompare:()=>q0,EqualDepth:()=>_0,EqualStencilFunc:()=>AM,EquirectangularReflectionMapping:()=>ca,EquirectangularRefractionMapping:()=>ha,Euler:()=>ba,EventDispatcher:()=>wn,ExtrudeGeometry:()=>$l,FileLoader:()=>En,Float16BufferAttribute:()=>ef,Float32BufferAttribute:()=>yt,Float64BufferAttribute:()=>nf,FloatType:()=>Sn,Fog:()=>Rl,FogExp2:()=>Tl,FramebufferTexture:()=>pf,FrontSide:()=>li,Frustum:()=>gr,GLBufferAttribute:()=>Gf,GLSL1:()=>zM,GLSL3:()=>Xu,GreaterCompare:()=>Y0,GreaterDepth:()=>y0,GreaterEqualCompare:()=>$0,GreaterEqualDepth:()=>x0,GreaterEqualStencilFunc:()=>IM,GreaterStencilFunc:()=>RM,GridHelper:()=>td,Group:()=>Ai,HalfFloatType:()=>hs,HemisphereLight:()=>gc,HemisphereLightHelper:()=>jf,IcosahedronGeometry:()=>Jl,ImageBitmapLoader:()=>Pf,ImageLoader:()=>wr,ImageUtils:()=>Ma,IncrementStencilOp:()=>yM,IncrementWrapStencilOp:()=>MM,InstancedBufferAttribute:()=>Ui,InstancedBufferGeometry:()=>Ec,InstancedInterleavedBuffer:()=>Vf,InstancedMesh:()=>Dl,Int16BufferAttribute:()=>ju,Int32BufferAttribute:()=>tf,Int8BufferAttribute:()=>Ju,IntType:()=>fd,InterleavedBuffer:()=>xs,InterleavedBufferAttribute:()=>_r,Interpolant:()=>vr,InterpolateDiscrete:()=>da,InterpolateLinear:()=>pa,InterpolateSmooth:()=>ml,InvertStencilOp:()=>bM,KeepStencilOp:()=>sr,KeyframeTrack:()=>hn,LOD:()=>Pl,LatheGeometry:()=>za,Layers:()=>ps,LessCompare:()=>X0,LessDepth:()=>g0,LessEqualCompare:()=>Md,LessEqualDepth:()=>la,LessEqualStencilFunc:()=>TM,LessStencilFunc:()=>EM,Light:()=>kn,LightProbe:()=>bc,Line:()=>zn,Line3:()=>$f,LineBasicMaterial:()=>Ne,LineCurve:()=>Na,LineCurve3:()=>Hl,LineDashedMaterial:()=>fc,LineLoop:()=>Fl,LineSegments:()=>_n,LinearDisplayP3ColorSpace:()=>ja,LinearEncoding:()=>vd,LinearFilter:()=>xe,LinearInterpolant:()=>qa,LinearMipMapLinearFilter:()=>dM,LinearMipMapNearestFilter:()=>fM,LinearMipmapLinearFilter:()=>Pi,LinearMipmapNearestFilter:()=>ud,LinearSRGBColorSpace:()=>On,LinearToneMapping:()=>b0,LinearTransfer:()=>ga,Loader:()=>Ve,LoaderUtils:()=>Ja,LoadingManager:()=>Za,LoopOnce:()=>B0,LoopPingPong:()=>k0,LoopRepeat:()=>z0,LuminanceAlphaFormat:()=>D0,LuminanceFormat:()=>U0,MOUSE:()=>sM,Material:()=>Le,MaterialLoader:()=>wc,MathUtils:()=>tS,Matrix3:()=>Gt,Matrix4:()=>Lt,MaxEquation:()=>_u,Mesh:()=>ye,MeshBasicMaterial:()=>Bn,MeshDepthMaterial:()=>Ca,MeshDistanceMaterial:()=>Ia,MeshLambertMaterial:()=>hc,MeshMatcapMaterial:()=>uc,MeshNormalMaterial:()=>cc,MeshPhongMaterial:()=>oc,MeshPhysicalMaterial:()=>ac,MeshStandardMaterial:()=>Xa,MeshToonMaterial:()=>lc,MinEquation:()=>gu,MirroredRepeatWrapping:()=>fa,MixOperation:()=>M0,MultiplyBlending:()=>mu,MultiplyOperation:()=>Qa,NearestFilter:()=>_e,NearestMipMapLinearFilter:()=>uM,NearestMipMapNearestFilter:()=>hM,NearestMipmapLinearFilter:()=>na,NearestMipmapNearestFilter:()=>xl,NeverCompare:()=>W0,NeverDepth:()=>p0,NeverStencilFunc:()=>wM,NoBlending:()=>ii,NoColorSpace:()=>an,NoToneMapping:()=>ri,NormalAnimationBlendMode:()=>Dc,NormalBlending:()=>ur,NotEqualCompare:()=>Z0,NotEqualDepth:()=>v0,NotEqualStencilFunc:()=>CM,NumberKeyframeTrack:()=>Mr,Object3D:()=>jt,ObjectLoader:()=>If,ObjectSpaceNormalMap:()=>G0,OctahedronGeometry:()=>Ga,OneFactor:()=>n0,OneMinusConstantAlphaFactor:()=>d0,OneMinusConstantColorFactor:()=>u0,OneMinusDstAlphaFactor:()=>a0,OneMinusDstColorFactor:()=>l0,OneMinusSrcAlphaFactor:()=>_l,OneMinusSrcColorFactor:()=>r0,OrthographicCamera:()=>_s,P3Primaries:()=>xa,PCFShadowMap:()=>hd,PCFSoftShadowMap:()=>Kg,PMREMGenerator:()=>Ta,Path:()=>xr,PerspectiveCamera:()=>Se,Plane:()=>Dn,PlaneGeometry:()=>Aa,PlaneHelper:()=>ad,PointLight:()=>xc,PointLightHelper:()=>Qf,Points:()=>Ol,PointsMaterial:()=>Ua,PolarGridHelper:()=>ed,PolyhedronGeometry:()=>Di,PositionalAudio:()=>Nf,PropertyBinding:()=>ee,PropertyMixer:()=>Cc,QuadraticBezierCurve:()=>Fa,QuadraticBezierCurve3:()=>Oa,Quaternion:()=>He,QuaternionKeyframeTrack:()=>Ni,QuaternionLinearInterpolant:()=>mc,RED_GREEN_RGTC2_Format:()=>Vu,RED_RGTC1_Format:()=>O0,REVISION:()=>Pc,RGBADepthPacking:()=>V0,RGBAFormat:()=>Qe,RGBAIntegerFormat:()=>_d,RGBA_ASTC_10x10_Format:()=>Fu,RGBA_ASTC_10x5_Format:()=>Uu,RGBA_ASTC_10x6_Format:()=>Du,RGBA_ASTC_10x8_Format:()=>Nu,RGBA_ASTC_12x10_Format:()=>Ou,RGBA_ASTC_12x12_Format:()=>Bu,RGBA_ASTC_4x4_Format:()=>Eu,RGBA_ASTC_5x4_Format:()=>Au,RGBA_ASTC_5x5_Format:()=>Tu,RGBA_ASTC_6x5_Format:()=>Ru,RGBA_ASTC_6x6_Format:()=>Cu,RGBA_ASTC_8x5_Format:()=>Iu,RGBA_ASTC_8x6_Format:()=>Pu,RGBA_ASTC_8x8_Format:()=>Lu,RGBA_BPTC_Format:()=>pl,RGBA_ETC2_EAC_Format:()=>wu,RGBA_PVRTC_2BPPV1_Format:()=>Su,RGBA_PVRTC_4BPPV1_Format:()=>Mu,RGBA_S3TC_DXT1_Format:()=>ul,RGBA_S3TC_DXT3_Format:()=>fl,RGBA_S3TC_DXT5_Format:()=>dl,RGB_BPTC_SIGNED_Format:()=>zu,RGB_BPTC_UNSIGNED_Format:()=>ku,RGB_ETC1_Format:()=>xd,RGB_ETC2_Format:()=>bu,RGB_PVRTC_2BPPV1_Format:()=>vu,RGB_PVRTC_4BPPV1_Format:()=>yu,RGB_S3TC_DXT1_Format:()=>hl,RGFormat:()=>F0,RGIntegerFormat:()=>gd,RawShaderMaterial:()=>sc,Ray:()=>Li,Raycaster:()=>Wf,Rec709Primaries:()=>_a,RectAreaLight:()=>Mc,RedFormat:()=>N0,RedIntegerFormat:()=>md,ReinhardToneMapping:()=>w0,RenderTarget:()=>Ml,RepeatWrapping:()=>ua,ReplaceStencilOp:()=>xM,ReverseSubtractEquation:()=>t0,RingGeometry:()=>Kl,SIGNED_RED_GREEN_RGTC2_Format:()=>Gu,SIGNED_RED_RGTC1_Format:()=>Hu,SRGBColorSpace:()=>Me,SRGBTransfer:()=>oe,Scene:()=>Cl,ShaderChunk:()=>kt,ShaderLib:()=>Mn,ShaderMaterial:()=>gn,ShadowMaterial:()=>rc,Shape:()=>oi,ShapeGeometry:()=>Ql,ShapePath:()=>cd,ShapeUtils:()=>Fn,ShortType:()=>P0,Skeleton:()=>Ul,SkeletonHelper:()=>Kf,SkinnedMesh:()=>Ll,Source:()=>ti,Sphere:()=>Pe,SphereGeometry:()=>Wa,Spherical:()=>qf,SphericalHarmonics3:()=>Sc,SplineCurve:()=>Ba,SpotLight:()=>_c,SpotLightHelper:()=>Jf,Sprite:()=>Il,SpriteMaterial:()=>Pa,SrcAlphaFactor:()=>gl,SrcAlphaSaturateFactor:()=>c0,SrcColorFactor:()=>i0,StaticCopyUsage:()=>FM,StaticDrawUsage:()=>ya,StaticReadUsage:()=>UM,StereoCamera:()=>Uf,StreamCopyUsage:()=>BM,StreamDrawUsage:()=>LM,StreamReadUsage:()=>NM,StringKeyframeTrack:()=>ui,SubtractEquation:()=>jg,SubtractiveBlending:()=>pu,TOUCH:()=>aM,TangentSpaceNormalMap:()=>Fi,TetrahedronGeometry:()=>jl,Texture:()=>be,TextureLoader:()=>Af,TorusGeometry:()=>tc,TorusKnotGeometry:()=>ec,Triangle:()=>ei,TriangleFanDrawMode:()=>gM,TriangleStripDrawMode:()=>mM,TrianglesDrawMode:()=>pM,TubeGeometry:()=>nc,TwoPassDoubleSide:()=>cM,UVMapping:()=>Lc,Uint16BufferAttribute:()=>wa,Uint32BufferAttribute:()=>Ea,Uint8BufferAttribute:()=>Ku,Uint8ClampedBufferAttribute:()=>Qu,Uniform:()=>kf,UniformsGroup:()=>Hf,UniformsLib:()=>ot,UniformsUtils:()=>e_,UnsignedByteType:()=>si,UnsignedInt248Type:()=>Ti,UnsignedIntType:()=>jn,UnsignedShort4444Type:()=>dd,UnsignedShort5551Type:()=>pd,UnsignedShortType:()=>Uc,VSMShadowMap:()=>Un,Vector2:()=>$,Vector3:()=>C,Vector4:()=>ie,VectorKeyframeTrack:()=>Sr,VideoTexture:()=>df,WebGL1Renderer:()=>Al,WebGL3DRenderTarget:()=>Zu,WebGLArrayRenderTarget:()=>Yu,WebGLCoordinateSystem:()=>bn,WebGLCubeRenderTarget:()=>bl,WebGLMultipleRenderTargets:()=>$u,WebGLRenderTarget:()=>ln,WebGLRenderer:()=>El,WebGLUtils:()=>l_,WebGPUCoordinateSystem:()=>us,WireframeGeometry:()=>ic,WrapAroundEnding:()=>ma,ZeroCurvatureEnding:()=>lr,ZeroFactor:()=>e0,ZeroSlopeEnding:()=>cr,ZeroStencilOp:()=>_M,_SRGBAFormat:()=>yl,createCanvasElement:()=>Q0,sRGBEncoding:()=>Ci});var Pc="160",sM={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},aM={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},$g=0,fu=1,Jg=2,oM=3,lM=0,hd=1,Kg=2,Un=3,li=0,Ze=1,Nn=2,cM=2,ii=0,ur=1,du=2,pu=3,mu=4,Qg=5,Ei=100,jg=101,t0=102,gu=103,_u=104,e0=200,n0=201,i0=202,r0=203,gl=204,_l=205,s0=206,a0=207,o0=208,l0=209,c0=210,h0=211,u0=212,f0=213,d0=214,p0=0,m0=1,g0=2,la=3,_0=4,x0=5,y0=6,v0=7,Qa=0,M0=1,S0=2,ri=0,b0=1,w0=2,E0=3,A0=4,T0=5,R0=6,xu="attached",C0="detached",Lc=300,ci=301,Ii=302,ca=303,ha=304,Ss=306,ua=1e3,ke=1001,fa=1002,_e=1003,xl=1004,hM=1004,na=1005,uM=1005,xe=1006,ud=1007,fM=1007,Pi=1008,dM=1008,si=1009,I0=1010,P0=1011,Uc=1012,fd=1013,jn=1014,Sn=1015,hs=1016,dd=1017,pd=1018,Ti=1020,L0=1021,Qe=1023,U0=1024,D0=1025,Ri=1026,dr=1027,N0=1028,md=1029,F0=1030,gd=1031,_d=1033,hl=33776,ul=33777,fl=33778,dl=33779,yu=35840,vu=35841,Mu=35842,Su=35843,xd=36196,bu=37492,wu=37496,Eu=37808,Au=37809,Tu=37810,Ru=37811,Cu=37812,Iu=37813,Pu=37814,Lu=37815,Uu=37816,Du=37817,Nu=37818,Fu=37819,Ou=37820,Bu=37821,pl=36492,zu=36494,ku=36495,O0=36283,Hu=36284,Vu=36285,Gu=36286,B0=2200,z0=2201,k0=2202,da=2300,pa=2301,ml=2302,lr=2400,cr=2401,ma=2402,Dc=2500,yd=2501,pM=0,mM=1,gM=2,vd=3e3,Ci=3001,H0=3200,V0=3201,Fi=0,G0=1,an="",Me="srgb",On="srgb-linear",Nc="display-p3",ja="display-p3-linear",ga="linear",oe="srgb",_a="rec709",xa="p3",_M=0,sr=7680,xM=7681,yM=7682,vM=7683,MM=34055,SM=34056,bM=5386,wM=512,EM=513,AM=514,TM=515,RM=516,CM=517,IM=518,Wu=519,W0=512,X0=513,q0=514,Md=515,Y0=516,Z0=517,$0=518,J0=519,ya=35044,PM=35048,LM=35040,UM=35045,DM=35049,NM=35041,FM=35046,OM=35050,BM=35042,zM="100",Xu="300 es",yl=1035,bn=2e3,us=2001,wn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let i=this._listeners;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let r=this._listeners[t];if(r!==void 0){let s=r.indexOf(e);s!==-1&&r.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let i=this._listeners[t.type];if(i!==void 0){t.target=this;let r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,t);t.target=null}}},Oe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],vm=1234567,fr=Math.PI/180,fs=180/Math.PI;function on(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Oe[n&255]+Oe[n>>8&255]+Oe[n>>16&255]+Oe[n>>24&255]+"-"+Oe[t&255]+Oe[t>>8&255]+"-"+Oe[t>>16&15|64]+Oe[t>>24&255]+"-"+Oe[e&63|128]+Oe[e>>8&255]+"-"+Oe[e>>16&255]+Oe[e>>24&255]+Oe[i&255]+Oe[i>>8&255]+Oe[i>>16&255]+Oe[i>>24&255]).toLowerCase()}function pe(n,t,e){return Math.max(t,Math.min(e,n))}function Sd(n,t){return(n%t+t)%t}function kM(n,t,e,i,r){return i+(n-t)*(r-i)/(e-t)}function HM(n,t,e){return n!==t?(e-n)/(t-n):0}function ia(n,t,e){return(1-e)*n+e*t}function VM(n,t,e,i){return ia(n,t,1-Math.exp(-e*i))}function GM(n,t=1){return t-Math.abs(Sd(n,t*2)-t)}function WM(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*(3-2*n))}function XM(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*n*(n*(n*6-15)+10))}function qM(n,t){return n+Math.floor(Math.random()*(t-n+1))}function YM(n,t){return n+Math.random()*(t-n)}function ZM(n){return n*(.5-Math.random())}function $M(n){n!==void 0&&(vm=n);let t=vm+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function JM(n){return n*fr}function KM(n){return n*fs}function qu(n){return(n&n-1)===0&&n!==0}function QM(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function vl(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function jM(n,t,e,i,r){let s=Math.cos,a=Math.sin,o=s(e/2),c=a(e/2),l=s((t+i)/2),h=a((t+i)/2),u=s((t-i)/2),f=a((t-i)/2),d=s((i-t)/2),m=a((i-t)/2);switch(r){case"XYX":n.set(o*h,c*u,c*f,o*l);break;case"YZY":n.set(c*f,o*h,c*u,o*l);break;case"ZXZ":n.set(c*u,c*f,o*h,o*l);break;case"XZX":n.set(o*h,c*m,c*d,o*l);break;case"YXY":n.set(c*d,o*h,c*m,o*l);break;case"ZYZ":n.set(c*m,c*d,o*h,o*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function je(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Ht(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var tS={DEG2RAD:fr,RAD2DEG:fs,generateUUID:on,clamp:pe,euclideanModulo:Sd,mapLinear:kM,inverseLerp:HM,lerp:ia,damp:VM,pingpong:GM,smoothstep:WM,smootherstep:XM,randInt:qM,randFloat:YM,randFloatSpread:ZM,seededRandom:$M,degToRad:JM,radToDeg:KM,isPowerOfTwo:qu,ceilPowerOfTwo:QM,floorPowerOfTwo:vl,setQuaternionFromProperEuler:jM,normalize:Ht,denormalize:je},$=class n{constructor(t=0,e=0){n.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6],this.y=r[1]*e+r[4]*i+r[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),r=Math.sin(e),s=this.x-t.x,a=this.y-t.y;return this.x=s*i-a*r+t.x,this.y=s*r+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Gt=class n{constructor(t,e,i,r,s,a,o,c,l){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,r,s,a,o,c,l)}set(t,e,i,r,s,a,o,c,l){let h=this.elements;return h[0]=t,h[1]=r,h[2]=o,h[3]=e,h[4]=s,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,r=e.elements,s=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],u=i[7],f=i[2],d=i[5],m=i[8],_=r[0],g=r[3],p=r[6],y=r[1],x=r[4],v=r[7],R=r[2],E=r[5],w=r[8];return s[0]=a*_+o*y+c*R,s[3]=a*g+o*x+c*E,s[6]=a*p+o*v+c*w,s[1]=l*_+h*y+u*R,s[4]=l*g+h*x+u*E,s[7]=l*p+h*v+u*w,s[2]=f*_+d*y+m*R,s[5]=f*g+d*x+m*E,s[8]=f*p+d*v+m*w,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8];return e*a*h-e*o*l-i*s*h+i*o*c+r*s*l-r*a*c}invert(){let t=this.elements,e=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=h*a-o*l,f=o*c-h*s,d=l*s-a*c,m=e*u+i*f+r*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return t[0]=u*_,t[1]=(r*l-h*i)*_,t[2]=(o*i-r*a)*_,t[3]=f*_,t[4]=(h*e-r*c)*_,t[5]=(r*s-o*e)*_,t[6]=d*_,t[7]=(i*c-l*e)*_,t[8]=(a*e-i*s)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,r,s,a,o){let c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*a+l*o)+a+t,-r*l,r*c,-r*(-l*a+c*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Ih.makeScale(t,e)),this}rotate(t){return this.premultiply(Ih.makeRotation(-t)),this}translate(t,e){return this.premultiply(Ih.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let r=0;r<9;r++)if(e[r]!==i[r])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Ih=new Gt;function K0(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}var eS={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};function rs(n,t){return new eS[n](t)}function va(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Q0(){let n=va("canvas");return n.style.display="block",n}var Mm={};function ra(n){n in Mm||(Mm[n]=!0,console.warn(n))}var Sm=new Gt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),bm=new Gt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),xo={[On]:{transfer:ga,primaries:_a,toReference:n=>n,fromReference:n=>n},[Me]:{transfer:oe,primaries:_a,toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[ja]:{transfer:ga,primaries:xa,toReference:n=>n.applyMatrix3(bm),fromReference:n=>n.applyMatrix3(Sm)},[Nc]:{transfer:oe,primaries:xa,toReference:n=>n.convertSRGBToLinear().applyMatrix3(bm),fromReference:n=>n.applyMatrix3(Sm).convertLinearToSRGB()}},nS=new Set([On,ja]),ne={enabled:!0,_workingColorSpace:On,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!nS.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,t,e){if(this.enabled===!1||t===e||!t||!e)return n;let i=xo[t].toReference,r=xo[e].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,t){return this.convert(n,this._workingColorSpace,t)},toWorkingColorSpace:function(n,t){return this.convert(n,t,this._workingColorSpace)},getPrimaries:function(n){return xo[n].primaries},getTransfer:function(n){return n===an?ga:xo[n].transfer}};function ls(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ph(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Or,Ma=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Or===void 0&&(Or=va("canvas")),Or.width=t.width,Or.height=t.height;let i=Or.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),e=Or}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=va("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let r=i.getImageData(0,0,t.width,t.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=ls(s[a]/255)*255;return i.putImageData(r,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(ls(e[i]/255)*255):e[i]=ls(e[i]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},iS=0,ti=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:iS++}),this.uuid=on(),this.data=t,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Lh(r[a].image)):s.push(Lh(r[a]))}else s=Lh(r);i.url=s}return e||(t.images[this.uuid]=i),i}};function Lh(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ma.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var rS=0,be=class n extends wn{constructor(t=n.DEFAULT_IMAGE,e=n.DEFAULT_MAPPING,i=ke,r=ke,s=xe,a=Pi,o=Qe,c=si,l=n.DEFAULT_ANISOTROPY,h=an){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:rS++}),this.uuid=on(),this.name="",this.source=new ti(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new $(0,0),this.repeat=new $(1,1),this.center=new $(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Gt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(ra("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===Ci?Me:an),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Lc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ua:t.x=t.x-Math.floor(t.x);break;case ke:t.x=t.x<0?0:1;break;case fa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ua:t.y=t.y-Math.floor(t.y);break;case ke:t.y=t.y<0?0:1;break;case fa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return ra("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===Me?Ci:vd}set encoding(t){ra("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=t===Ci?Me:an}};be.DEFAULT_IMAGE=null;be.DEFAULT_MAPPING=Lc;be.DEFAULT_ANISOTROPY=1;var ie=class n{constructor(t=0,e=0,i=0,r=1){n.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=r}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,r){return this.x=t,this.y=e,this.z=i,this.w=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,r=this.z,s=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*e+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*e+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*e+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,r,s,c=t.elements,l=c[0],h=c[4],u=c[8],f=c[1],d=c[5],m=c[9],_=c[2],g=c[6],p=c[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(m+g)<.1&&Math.abs(l+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let x=(l+1)/2,v=(d+1)/2,R=(p+1)/2,E=(h+f)/4,w=(u+_)/4,I=(m+g)/4;return x>v&&x>R?x<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(x),r=E/i,s=w/i):v>R?v<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),i=E/r,s=I/r):R<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),i=w/s,r=I/s),this.set(i,r,s,e),this}let y=Math.sqrt((g-m)*(g-m)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(y)<.001&&(y=1),this.x=(g-m)/y,this.y=(u-_)/y,this.z=(f-h)/y,this.w=Math.acos((l+d+p-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ml=class extends wn{constructor(t=1,e=1,i={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ie(0,0,t,e),this.scissorTest=!1,this.viewport=new ie(0,0,t,e);let r={width:t,height:e,depth:1};i.encoding!==void 0&&(ra("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===Ci?Me:an),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:xe,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new be(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(t,e,i=1){(this.width!==t||this.height!==e||this.depth!==i)&&(this.width=t,this.height=e,this.depth=i,this.texture.image.width=t,this.texture.image.height=e,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.texture=t.texture.clone(),this.texture.isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new ti(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},ln=class extends Ml{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},ds=class extends be{constructor(t=null,e=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:r},this.magFilter=_e,this.minFilter=_e,this.wrapR=ke,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Yu=class extends ln{constructor(t=1,e=1,i=1,r={}){super(t,e,r),this.isWebGLArrayRenderTarget=!0,this.depth=i,this.texture=new ds(null,t,e,i),this.texture.isRenderTargetTexture=!0}},Sa=class extends be{constructor(t=null,e=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:r},this.magFilter=_e,this.minFilter=_e,this.wrapR=ke,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Zu=class extends ln{constructor(t=1,e=1,i=1,r={}){super(t,e,r),this.isWebGL3DRenderTarget=!0,this.depth=i,this.texture=new Sa(null,t,e,i),this.texture.isRenderTargetTexture=!0}},$u=class extends ln{constructor(t=1,e=1,i=1,r={}){super(t,e,r),this.isWebGLMultipleRenderTargets=!0;let s=this.texture;this.texture=[];for(let a=0;a<i;a++)this.texture[a]=s.clone(),this.texture[a].isRenderTargetTexture=!0}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let r=0,s=this.texture.length;r<s;r++)this.texture[r].image.width=t,this.texture[r].image.height=e,this.texture[r].image.depth=i;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}copy(t){this.dispose(),this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.texture.length=0;for(let e=0,i=t.texture.length;e<i;e++)this.texture[e]=t.texture[e].clone(),this.texture[e].isRenderTargetTexture=!0;return this}},He=class{constructor(t=0,e=0,i=0,r=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=r}static slerpFlat(t,e,i,r,s,a,o){let c=i[r+0],l=i[r+1],h=i[r+2],u=i[r+3],f=s[a+0],d=s[a+1],m=s[a+2],_=s[a+3];if(o===0){t[e+0]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=d,t[e+2]=m,t[e+3]=_;return}if(u!==_||c!==f||l!==d||h!==m){let g=1-o,p=c*f+l*d+h*m+u*_,y=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let R=Math.sqrt(x),E=Math.atan2(R,p*y);g=Math.sin(g*E)/R,o=Math.sin(o*E)/R}let v=o*y;if(c=c*g+f*v,l=l*g+d*v,h=h*g+m*v,u=u*g+_*v,g===1-o){let R=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=R,l*=R,h*=R,u*=R}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,r,s,a){let o=i[r],c=i[r+1],l=i[r+2],h=i[r+3],u=s[a],f=s[a+1],d=s[a+2],m=s[a+3];return t[e]=o*m+h*u+c*d-l*f,t[e+1]=c*m+h*f+l*u-o*d,t[e+2]=l*m+h*d+o*f-c*u,t[e+3]=h*m-o*u-c*f-l*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,r){return this._x=t,this._y=e,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,r=t._y,s=t._z,a=t._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(r/2),u=o(s/2),f=c(i/2),d=c(r/2),m=c(s/2);switch(a){case"XYZ":this._x=f*h*u+l*d*m,this._y=l*d*u-f*h*m,this._z=l*h*m+f*d*u,this._w=l*h*u-f*d*m;break;case"YXZ":this._x=f*h*u+l*d*m,this._y=l*d*u-f*h*m,this._z=l*h*m-f*d*u,this._w=l*h*u+f*d*m;break;case"ZXY":this._x=f*h*u-l*d*m,this._y=l*d*u+f*h*m,this._z=l*h*m+f*d*u,this._w=l*h*u-f*d*m;break;case"ZYX":this._x=f*h*u-l*d*m,this._y=l*d*u+f*h*m,this._z=l*h*m-f*d*u,this._w=l*h*u+f*d*m;break;case"YZX":this._x=f*h*u+l*d*m,this._y=l*d*u+f*h*m,this._z=l*h*m-f*d*u,this._w=l*h*u-f*d*m;break;case"XZY":this._x=f*h*u-l*d*m,this._y=l*d*u-f*h*m,this._z=l*h*m+f*d*u,this._w=l*h*u+f*d*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,r=Math.sin(i);return this._x=t.x*r,this._y=t.y*r,this._z=t.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],r=e[4],s=e[8],a=e[1],o=e[5],c=e[9],l=e[2],h=e[6],u=e[10],f=i+o+u;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-c)*d,this._y=(s-l)*d,this._z=(a-r)*d}else if(i>o&&i>u){let d=2*Math.sqrt(1+i-o-u);this._w=(h-c)/d,this._x=.25*d,this._y=(r+a)/d,this._z=(s+l)/d}else if(o>u){let d=2*Math.sqrt(1+o-i-u);this._w=(s-l)/d,this._x=(r+a)/d,this._y=.25*d,this._z=(c+h)/d}else{let d=2*Math.sqrt(1+u-i-o);this._w=(a-r)/d,this._x=(s+l)/d,this._y=(c+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(pe(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let r=Math.min(1,e/i);return this.slerp(t,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,r=t._y,s=t._z,a=t._w,o=e._x,c=e._y,l=e._z,h=e._w;return this._x=i*h+a*o+r*l-s*c,this._y=r*h+a*c+s*o-i*l,this._z=s*h+a*l+i*c-r*o,this._w=a*h-i*o-r*c-s*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let i=this._x,r=this._y,s=this._z,a=this._w,o=a*t._w+i*t._x+r*t._y+s*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;let c=1-o*o;if(c<=Number.EPSILON){let d=1-e;return this._w=d*a+e*this._w,this._x=d*i+e*this._x,this._y=d*r+e*this._y,this._z=d*s+e*this._z,this.normalize(),this}let l=Math.sqrt(c),h=Math.atan2(l,o),u=Math.sin((1-e)*h)/l,f=Math.sin(e*h)/l;return this._w=a*u+this._w*f,this._x=i*u+this._x*f,this._y=r*u+this._y*f,this._z=s*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=Math.random(),e=Math.sqrt(1-t),i=Math.sqrt(t),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(e*Math.cos(r),i*Math.sin(s),i*Math.cos(s),e*Math.sin(r))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},C=class n{constructor(t=0,e=0,i=0){n.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(wm.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(wm.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6]*r,this.y=s[1]*e+s[4]*i+s[7]*r,this.z=s[2]*e+s[5]*i+s[8]*r,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,r=this.z,s=t.elements,a=1/(s[3]*e+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*e+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*e+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*e+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,r=this.z,s=t.x,a=t.y,o=t.z,c=t.w,l=2*(a*r-o*i),h=2*(o*e-s*r),u=2*(s*i-a*e);return this.x=e+c*l+a*u-o*h,this.y=i+c*h+o*l-s*u,this.z=r+c*u+s*h-a*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*e+s[4]*i+s[8]*r,this.y=s[1]*e+s[5]*i+s[9]*r,this.z=s[2]*e+s[6]*i+s[10]*r,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,r=t.y,s=t.z,a=e.x,o=e.y,c=e.z;return this.x=r*c-s*o,this.y=s*a-i*c,this.z=i*o-r*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Uh.copy(this).projectOnVector(t),this.sub(Uh)}reflect(t){return this.sub(Uh.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,r=this.z-t.z;return e*e+i*i+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let r=Math.sin(e)*t;return this.x=r*Math.sin(i),this.y=Math.cos(e)*t,this.z=r*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),r=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=r,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=(Math.random()-.5)*2,e=Math.random()*Math.PI*2,i=Math.sqrt(1-t**2);return this.x=i*Math.cos(e),this.y=i*Math.sin(e),this.z=t,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Uh=new C,wm=new He,De=class{constructor(t=new C(1/0,1/0,1/0),e=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(xn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(xn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=xn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let s=i.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,xn):xn.fromBufferAttribute(s,a),xn.applyMatrix4(t.matrixWorld),this.expandByPoint(xn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),yo.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),yo.copy(i.boundingBox)),yo.applyMatrix4(t.matrixWorld),this.union(yo)}let r=t.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,xn),xn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ws),vo.subVectors(this.max,Ws),Br.subVectors(t.a,Ws),zr.subVectors(t.b,Ws),kr.subVectors(t.c,Ws),xi.subVectors(zr,Br),yi.subVectors(kr,zr),$i.subVectors(Br,kr);let e=[0,-xi.z,xi.y,0,-yi.z,yi.y,0,-$i.z,$i.y,xi.z,0,-xi.x,yi.z,0,-yi.x,$i.z,0,-$i.x,-xi.y,xi.x,0,-yi.y,yi.x,0,-$i.y,$i.x,0];return!Dh(e,Br,zr,kr,vo)||(e=[1,0,0,0,1,0,0,0,1],!Dh(e,Br,zr,kr,vo))?!1:(Mo.crossVectors(xi,yi),e=[Mo.x,Mo.y,Mo.z],Dh(e,Br,zr,kr,vo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,xn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(xn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(qn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},qn=[new C,new C,new C,new C,new C,new C,new C,new C],xn=new C,yo=new De,Br=new C,zr=new C,kr=new C,xi=new C,yi=new C,$i=new C,Ws=new C,vo=new C,Mo=new C,Ji=new C;function Dh(n,t,e,i,r){for(let s=0,a=n.length-3;s<=a;s+=3){Ji.fromArray(n,s);let o=r.x*Math.abs(Ji.x)+r.y*Math.abs(Ji.y)+r.z*Math.abs(Ji.z),c=t.dot(Ji),l=e.dot(Ji),h=i.dot(Ji);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var sS=new De,Xs=new C,Nh=new C,Pe=class{constructor(t=new C,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):sS.setFromPoints(t).getCenter(i);let r=0;for(let s=0,a=t.length;s<a;s++)r=Math.max(r,i.distanceToSquared(t[s]));return this.radius=Math.sqrt(r),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Xs.subVectors(t,this.center);let e=Xs.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),r=(i-this.radius)*.5;this.center.addScaledVector(Xs,r/i),this.radius+=r}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Nh.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Xs.copy(t.center).add(Nh)),this.expandByPoint(Xs.copy(t.center).sub(Nh))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},Yn=new C,Fh=new C,So=new C,vi=new C,Oh=new C,bo=new C,Bh=new C,Li=class{constructor(t=new C,e=new C(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Yn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Yn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Yn.copy(this.origin).addScaledVector(this.direction,e),Yn.distanceToSquared(t))}distanceSqToSegment(t,e,i,r){Fh.copy(t).add(e).multiplyScalar(.5),So.copy(e).sub(t).normalize(),vi.copy(this.origin).sub(Fh);let s=t.distanceTo(e)*.5,a=-this.direction.dot(So),o=vi.dot(this.direction),c=-vi.dot(So),l=vi.lengthSq(),h=Math.abs(1-a*a),u,f,d,m;if(h>0)if(u=a*c-o,f=a*o-c,m=s*h,u>=0)if(f>=-m)if(f<=m){let _=1/h;u*=_,f*=_,d=u*(u+a*f+2*o)+f*(a*u+f+2*c)+l}else f=s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*c)+l;else f=-s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*c)+l;else f<=-m?(u=Math.max(0,-(-a*s+o)),f=u>0?-s:Math.min(Math.max(-s,-c),s),d=-u*u+f*(f+2*c)+l):f<=m?(u=0,f=Math.min(Math.max(-s,-c),s),d=f*(f+2*c)+l):(u=Math.max(0,-(a*s+o)),f=u>0?s:Math.min(Math.max(-s,-c),s),d=-u*u+f*(f+2*c)+l);else f=a>0?-s:s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Fh).addScaledVector(So,f),d}intersectSphere(t,e){Yn.subVectors(t.center,this.origin);let i=Yn.dot(this.direction),r=Yn.dot(Yn)-i*i,s=t.radius*t.radius;if(r>s)return null;let a=Math.sqrt(s-r),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,r,s,a,o,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return l>=0?(i=(t.min.x-f.x)*l,r=(t.max.x-f.x)*l):(i=(t.max.x-f.x)*l,r=(t.min.x-f.x)*l),h>=0?(s=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(s=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),u>=0?(o=(t.min.z-f.z)*u,c=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,c=(t.min.z-f.z)*u),i>c||o>r)||((o>i||i!==i)&&(i=o),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,e)}intersectsBox(t){return this.intersectBox(t,Yn)!==null}intersectTriangle(t,e,i,r,s){Oh.subVectors(e,t),bo.subVectors(i,t),Bh.crossVectors(Oh,bo);let a=this.direction.dot(Bh),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;vi.subVectors(this.origin,t);let c=o*this.direction.dot(bo.crossVectors(vi,bo));if(c<0)return null;let l=o*this.direction.dot(Oh.cross(vi));if(l<0||c+l>a)return null;let h=-o*vi.dot(Bh);return h<0?null:this.at(h/a,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Lt=class n{constructor(t,e,i,r,s,a,o,c,l,h,u,f,d,m,_,g){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,r,s,a,o,c,l,h,u,f,d,m,_,g)}set(t,e,i,r,s,a,o,c,l,h,u,f,d,m,_,g){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=r,p[1]=s,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,i=t.elements,r=1/Hr.setFromMatrixColumn(t,0).length(),s=1/Hr.setFromMatrixColumn(t,1).length(),a=1/Hr.setFromMatrixColumn(t,2).length();return e[0]=i[0]*r,e[1]=i[1]*r,e[2]=i[2]*r,e[3]=0,e[4]=i[4]*s,e[5]=i[5]*s,e[6]=i[6]*s,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,r=t.y,s=t.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(r),l=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){let f=a*h,d=a*u,m=o*h,_=o*u;e[0]=c*h,e[4]=-c*u,e[8]=l,e[1]=d+m*l,e[5]=f-_*l,e[9]=-o*c,e[2]=_-f*l,e[6]=m+d*l,e[10]=a*c}else if(t.order==="YXZ"){let f=c*h,d=c*u,m=l*h,_=l*u;e[0]=f+_*o,e[4]=m*o-d,e[8]=a*l,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=d*o-m,e[6]=_+f*o,e[10]=a*c}else if(t.order==="ZXY"){let f=c*h,d=c*u,m=l*h,_=l*u;e[0]=f-_*o,e[4]=-a*u,e[8]=m+d*o,e[1]=d+m*o,e[5]=a*h,e[9]=_-f*o,e[2]=-a*l,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let f=a*h,d=a*u,m=o*h,_=o*u;e[0]=c*h,e[4]=m*l-d,e[8]=f*l+_,e[1]=c*u,e[5]=_*l+f,e[9]=d*l-m,e[2]=-l,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let f=a*c,d=a*l,m=o*c,_=o*l;e[0]=c*h,e[4]=_-f*u,e[8]=m*u+d,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-l*h,e[6]=d*u+m,e[10]=f-_*u}else if(t.order==="XZY"){let f=a*c,d=a*l,m=o*c,_=o*l;e[0]=c*h,e[4]=-u,e[8]=l*h,e[1]=f*u+_,e[5]=a*h,e[9]=d*u-m,e[2]=m*u-d,e[6]=o*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(aS,t,oS)}lookAt(t,e,i){let r=this.elements;return rn.subVectors(t,e),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),Mi.crossVectors(i,rn),Mi.lengthSq()===0&&(Math.abs(i.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),Mi.crossVectors(i,rn)),Mi.normalize(),wo.crossVectors(rn,Mi),r[0]=Mi.x,r[4]=wo.x,r[8]=rn.x,r[1]=Mi.y,r[5]=wo.y,r[9]=rn.y,r[2]=Mi.z,r[6]=wo.z,r[10]=rn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,r=e.elements,s=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],u=i[5],f=i[9],d=i[13],m=i[2],_=i[6],g=i[10],p=i[14],y=i[3],x=i[7],v=i[11],R=i[15],E=r[0],w=r[4],I=r[8],M=r[12],S=r[1],D=r[5],V=r[9],rt=r[13],L=r[2],O=r[6],H=r[10],J=r[14],Z=r[3],X=r[7],et=r[11],nt=r[15];return s[0]=a*E+o*S+c*L+l*Z,s[4]=a*w+o*D+c*O+l*X,s[8]=a*I+o*V+c*H+l*et,s[12]=a*M+o*rt+c*J+l*nt,s[1]=h*E+u*S+f*L+d*Z,s[5]=h*w+u*D+f*O+d*X,s[9]=h*I+u*V+f*H+d*et,s[13]=h*M+u*rt+f*J+d*nt,s[2]=m*E+_*S+g*L+p*Z,s[6]=m*w+_*D+g*O+p*X,s[10]=m*I+_*V+g*H+p*et,s[14]=m*M+_*rt+g*J+p*nt,s[3]=y*E+x*S+v*L+R*Z,s[7]=y*w+x*D+v*O+R*X,s[11]=y*I+x*V+v*H+R*et,s[15]=y*M+x*rt+v*J+R*nt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],r=t[8],s=t[12],a=t[1],o=t[5],c=t[9],l=t[13],h=t[2],u=t[6],f=t[10],d=t[14],m=t[3],_=t[7],g=t[11],p=t[15];return m*(+s*c*u-r*l*u-s*o*f+i*l*f+r*o*d-i*c*d)+_*(+e*c*d-e*l*f+s*a*f-r*a*d+r*l*h-s*c*h)+g*(+e*l*u-e*o*d-s*a*u+i*a*d+s*o*h-i*l*h)+p*(-r*o*h-e*c*u+e*o*f+r*a*u-i*a*f+i*c*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let r=this.elements;return t.isVector3?(r[12]=t.x,r[13]=t.y,r[14]=t.z):(r[12]=t,r[13]=e,r[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=t[9],f=t[10],d=t[11],m=t[12],_=t[13],g=t[14],p=t[15],y=u*g*l-_*f*l+_*c*d-o*g*d-u*c*p+o*f*p,x=m*f*l-h*g*l-m*c*d+a*g*d+h*c*p-a*f*p,v=h*_*l-m*u*l+m*o*d-a*_*d-h*o*p+a*u*p,R=m*u*c-h*_*c-m*o*f+a*_*f+h*o*g-a*u*g,E=e*y+i*x+r*v+s*R;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let w=1/E;return t[0]=y*w,t[1]=(_*f*s-u*g*s-_*r*d+i*g*d+u*r*p-i*f*p)*w,t[2]=(o*g*s-_*c*s+_*r*l-i*g*l-o*r*p+i*c*p)*w,t[3]=(u*c*s-o*f*s-u*r*l+i*f*l+o*r*d-i*c*d)*w,t[4]=x*w,t[5]=(h*g*s-m*f*s+m*r*d-e*g*d-h*r*p+e*f*p)*w,t[6]=(m*c*s-a*g*s-m*r*l+e*g*l+a*r*p-e*c*p)*w,t[7]=(a*f*s-h*c*s+h*r*l-e*f*l-a*r*d+e*c*d)*w,t[8]=v*w,t[9]=(m*u*s-h*_*s-m*i*d+e*_*d+h*i*p-e*u*p)*w,t[10]=(a*_*s-m*o*s+m*i*l-e*_*l-a*i*p+e*o*p)*w,t[11]=(h*o*s-a*u*s-h*i*l+e*u*l+a*i*d-e*o*d)*w,t[12]=R*w,t[13]=(h*_*r-m*u*r+m*i*f-e*_*f-h*i*g+e*u*g)*w,t[14]=(m*o*r-a*_*r-m*i*c+e*_*c+a*i*g-e*o*g)*w,t[15]=(a*u*r-h*o*r+h*i*c-e*u*c-a*i*f+e*o*f)*w,this}scale(t){let e=this.elements,i=t.x,r=t.y,s=t.z;return e[0]*=i,e[4]*=r,e[8]*=s,e[1]*=i,e[5]*=r,e[9]*=s,e[2]*=i,e[6]*=r,e[10]*=s,e[3]*=i,e[7]*=r,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],r=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,r))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),r=Math.sin(e),s=1-i,a=t.x,o=t.y,c=t.z,l=s*a,h=s*o;return this.set(l*a+i,l*o-r*c,l*c+r*o,0,l*o+r*c,h*o+i,h*c-r*a,0,l*c-r*o,h*c+r*a,s*c*c+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,r,s,a){return this.set(1,i,s,0,t,1,a,0,e,r,1,0,0,0,0,1),this}compose(t,e,i){let r=this.elements,s=e._x,a=e._y,o=e._z,c=e._w,l=s+s,h=a+a,u=o+o,f=s*l,d=s*h,m=s*u,_=a*h,g=a*u,p=o*u,y=c*l,x=c*h,v=c*u,R=i.x,E=i.y,w=i.z;return r[0]=(1-(_+p))*R,r[1]=(d+v)*R,r[2]=(m-x)*R,r[3]=0,r[4]=(d-v)*E,r[5]=(1-(f+p))*E,r[6]=(g+y)*E,r[7]=0,r[8]=(m+x)*w,r[9]=(g-y)*w,r[10]=(1-(f+_))*w,r[11]=0,r[12]=t.x,r[13]=t.y,r[14]=t.z,r[15]=1,this}decompose(t,e,i){let r=this.elements,s=Hr.set(r[0],r[1],r[2]).length(),a=Hr.set(r[4],r[5],r[6]).length(),o=Hr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),t.x=r[12],t.y=r[13],t.z=r[14],yn.copy(this);let l=1/s,h=1/a,u=1/o;return yn.elements[0]*=l,yn.elements[1]*=l,yn.elements[2]*=l,yn.elements[4]*=h,yn.elements[5]*=h,yn.elements[6]*=h,yn.elements[8]*=u,yn.elements[9]*=u,yn.elements[10]*=u,e.setFromRotationMatrix(yn),i.x=s,i.y=a,i.z=o,this}makePerspective(t,e,i,r,s,a,o=bn){let c=this.elements,l=2*s/(e-t),h=2*s/(i-r),u=(e+t)/(e-t),f=(i+r)/(i-r),d,m;if(o===bn)d=-(a+s)/(a-s),m=-2*a*s/(a-s);else if(o===us)d=-a/(a-s),m=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=d,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,r,s,a,o=bn){let c=this.elements,l=1/(e-t),h=1/(i-r),u=1/(a-s),f=(e+t)*l,d=(i+r)*h,m,_;if(o===bn)m=(a+s)*u,_=-2*u;else if(o===us)m=s*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-f,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-d,c[2]=0,c[6]=0,c[10]=_,c[14]=-m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let r=0;r<16;r++)if(e[r]!==i[r])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},Hr=new C,yn=new Lt,aS=new C(0,0,0),oS=new C(1,1,1),Mi=new C,wo=new C,rn=new C,Em=new Lt,Am=new He,ba=class n{constructor(t=0,e=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=r}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,r=this._order){return this._x=t,this._y=e,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let r=t.elements,s=r[0],a=r[4],o=r[8],c=r[1],l=r[5],h=r[9],u=r[2],f=r[6],d=r[10];switch(e){case"XYZ":this._y=Math.asin(pe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-pe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(pe(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-pe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(pe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-pe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Em.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Em,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Am.setFromEuler(this),this.setFromQuaternion(Am,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ba.DEFAULT_ORDER="XYZ";var ps=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},lS=0,Tm=new C,Vr=new He,Zn=new Lt,Eo=new C,qs=new C,cS=new C,hS=new He,Rm=new C(1,0,0),Cm=new C(0,1,0),Im=new C(0,0,1),uS={type:"added"},fS={type:"removed"},jt=class n extends wn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:lS++}),this.uuid=on(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new C,e=new ba,i=new He,r=new C(1,1,1);function s(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Lt},normalMatrix:{value:new Gt}}),this.matrix=new Lt,this.matrixWorld=new Lt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ps,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Vr.setFromAxisAngle(t,e),this.quaternion.multiply(Vr),this}rotateOnWorldAxis(t,e){return Vr.setFromAxisAngle(t,e),this.quaternion.premultiply(Vr),this}rotateX(t){return this.rotateOnAxis(Rm,t)}rotateY(t){return this.rotateOnAxis(Cm,t)}rotateZ(t){return this.rotateOnAxis(Im,t)}translateOnAxis(t,e){return Tm.copy(t).applyQuaternion(this.quaternion),this.position.add(Tm.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Rm,t)}translateY(t){return this.translateOnAxis(Cm,t)}translateZ(t){return this.translateOnAxis(Im,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Zn.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Eo.copy(t):Eo.set(t,e,i);let r=this.parent;this.updateWorldMatrix(!0,!1),qs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zn.lookAt(qs,Eo,this.up):Zn.lookAt(Eo,qs,this.up),this.quaternion.setFromRotationMatrix(Zn),r&&(Zn.extractRotation(r.matrixWorld),Vr.setFromRotationMatrix(Zn),this.quaternion.premultiply(Vr.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.push(t),t.dispatchEvent(uS)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(fS)),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Zn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Zn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Zn),this.add(t),t.updateWorldMatrix(!1,!0),this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,r=this.children.length;i<r;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,t,cS),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,hS,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let i=0,r=e.length;i<r;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,r=e.length;i<r;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,r=e.length;i<r;i++){let s=e[i];(s.matrixWorldAutoUpdate===!0||t===!0)&&s.updateMatrixWorld(t)}}updateWorldMatrix(t,e){let i=this.parent;if(t===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){let r=this.children;for(let s=0,a=r.length;s<a;s++){let o=r[s];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(t),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];s(t.shapes,u)}else s(t.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(t.materials,this.material[c]));r.material=o}else r.material=s(t.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];r.animations.push(s(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),l=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),d=a(t.animations),m=a(t.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),m.length>0&&(i.nodes=m)}return i.object=r,i;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let r=t.children[i];this.add(r.clone())}return this}};jt.DEFAULT_UP=new C(0,1,0);jt.DEFAULT_MATRIX_AUTO_UPDATE=!0;jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var vn=new C,$n=new C,zh=new C,Jn=new C,Gr=new C,Wr=new C,Pm=new C,kh=new C,Hh=new C,Vh=new C,Ao=!1,ei=class n{constructor(t=new C,e=new C,i=new C){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,r){r.subVectors(i,e),vn.subVectors(t,e),r.cross(vn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(t,e,i,r,s){vn.subVectors(r,e),$n.subVectors(i,e),zh.subVectors(t,e);let a=vn.dot(vn),o=vn.dot($n),c=vn.dot(zh),l=$n.dot($n),h=$n.dot(zh),u=a*l-o*o;if(u===0)return s.set(0,0,0),null;let f=1/u,d=(l*c-o*h)*f,m=(a*h-o*c)*f;return s.set(1-d-m,m,d)}static containsPoint(t,e,i,r){return this.getBarycoord(t,e,i,r,Jn)===null?!1:Jn.x>=0&&Jn.y>=0&&Jn.x+Jn.y<=1}static getUV(t,e,i,r,s,a,o,c){return Ao===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ao=!0),this.getInterpolation(t,e,i,r,s,a,o,c)}static getInterpolation(t,e,i,r,s,a,o,c){return this.getBarycoord(t,e,i,r,Jn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Jn.x),c.addScaledVector(a,Jn.y),c.addScaledVector(o,Jn.z),c)}static isFrontFacing(t,e,i,r){return vn.subVectors(i,e),$n.subVectors(t,e),vn.cross($n).dot(r)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,r){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[r]),this}setFromAttributeAndIndices(t,e,i,r){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,r),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return vn.subVectors(this.c,this.b),$n.subVectors(this.a,this.b),vn.cross($n).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return n.getBarycoord(t,this.a,this.b,this.c,e)}getUV(t,e,i,r,s){return Ao===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ao=!0),n.getInterpolation(t,this.a,this.b,this.c,e,i,r,s)}getInterpolation(t,e,i,r,s){return n.getInterpolation(t,this.a,this.b,this.c,e,i,r,s)}containsPoint(t){return n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,r=this.b,s=this.c,a,o;Gr.subVectors(r,i),Wr.subVectors(s,i),kh.subVectors(t,i);let c=Gr.dot(kh),l=Wr.dot(kh);if(c<=0&&l<=0)return e.copy(i);Hh.subVectors(t,r);let h=Gr.dot(Hh),u=Wr.dot(Hh);if(h>=0&&u<=h)return e.copy(r);let f=c*u-h*l;if(f<=0&&c>=0&&h<=0)return a=c/(c-h),e.copy(i).addScaledVector(Gr,a);Vh.subVectors(t,s);let d=Gr.dot(Vh),m=Wr.dot(Vh);if(m>=0&&d<=m)return e.copy(s);let _=d*l-c*m;if(_<=0&&l>=0&&m<=0)return o=l/(l-m),e.copy(i).addScaledVector(Wr,o);let g=h*m-d*u;if(g<=0&&u-h>=0&&d-m>=0)return Pm.subVectors(s,r),o=(u-h)/(u-h+(d-m)),e.copy(r).addScaledVector(Pm,o);let p=1/(g+_+f);return a=_*p,o=f*p,e.copy(i).addScaledVector(Gr,a).addScaledVector(Wr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},j0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Si={h:0,s:0,l:0},To={h:0,s:0,l:0};function Gh(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}var pt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let r=t;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Me){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ne.toWorkingColorSpace(this,e),this}setRGB(t,e,i,r=ne.workingColorSpace){return this.r=t,this.g=e,this.b=i,ne.toWorkingColorSpace(this,r),this}setHSL(t,e,i,r=ne.workingColorSpace){if(t=Sd(t,1),e=pe(e,0,1),i=pe(i,0,1),e===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+e):i+e-i*e,a=2*i-s;this.r=Gh(a,s,t+1/3),this.g=Gh(a,s,t),this.b=Gh(a,s,t-1/3)}return ne.toWorkingColorSpace(this,r),this}setStyle(t,e=Me){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(s,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Me){let i=j0[t.toLowerCase()];return i!==void 0?this.setHex(i,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ls(t.r),this.g=ls(t.g),this.b=ls(t.b),this}copyLinearToSRGB(t){return this.r=Ph(t.r),this.g=Ph(t.g),this.b=Ph(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Me){return ne.fromWorkingColorSpace(Be.copy(this),t),Math.round(pe(Be.r*255,0,255))*65536+Math.round(pe(Be.g*255,0,255))*256+Math.round(pe(Be.b*255,0,255))}getHexString(t=Me){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ne.workingColorSpace){ne.fromWorkingColorSpace(Be.copy(this),e);let i=Be.r,r=Be.g,s=Be.b,a=Math.max(i,r,s),o=Math.min(i,r,s),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case i:c=(r-s)/u+(r<s?6:0);break;case r:c=(s-i)/u+2;break;case s:c=(i-r)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=ne.workingColorSpace){return ne.fromWorkingColorSpace(Be.copy(this),e),t.r=Be.r,t.g=Be.g,t.b=Be.b,t}getStyle(t=Me){ne.fromWorkingColorSpace(Be.copy(this),t);let e=Be.r,i=Be.g,r=Be.b;return t!==Me?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(t,e,i){return this.getHSL(Si),this.setHSL(Si.h+t,Si.s+e,Si.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Si),t.getHSL(To);let i=ia(Si.h,To.h,e),r=ia(Si.s,To.s,e),s=ia(Si.l,To.l,e);return this.setHSL(i,r,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,r=this.b,s=t.elements;return this.r=s[0]*e+s[3]*i+s[6]*r,this.g=s[1]*e+s[4]*i+s[7]*r,this.b=s[2]*e+s[5]*i+s[8]*r,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Be=new pt;pt.NAMES=j0;var dS=0,Le=class extends wn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dS++}),this.uuid=on(),this.name="",this.type="Material",this.blending=ur,this.side=li,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=gl,this.blendDst=_l,this.blendEquation=Ei,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new pt(0,0,0),this.blendAlpha=0,this.depthFunc=la,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Wu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=sr,this.stencilZFail=sr,this.stencilZPass=sr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let r=this[e];if(r===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ur&&(i.blending=this.blending),this.side!==li&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==gl&&(i.blendSrc=this.blendSrc),this.blendDst!==_l&&(i.blendDst=this.blendDst),this.blendEquation!==Ei&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==la&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Wu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==sr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==sr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==sr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let a=[];for(let o in s){let c=s[o];delete c.metadata,a.push(c)}return a}if(e){let s=r(t.textures),a=r(t.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let r=e.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=e[s].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Bn=class extends Le{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new pt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Qa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Qn=pS();function pS(){let n=new ArrayBuffer(4),t=new Float32Array(n),e=new Uint32Array(n),i=new Uint32Array(512),r=new Uint32Array(512);for(let c=0;c<256;++c){let l=c-127;l<-27?(i[c]=0,i[c|256]=32768,r[c]=24,r[c|256]=24):l<-14?(i[c]=1024>>-l-14,i[c|256]=1024>>-l-14|32768,r[c]=-l-1,r[c|256]=-l-1):l<=15?(i[c]=l+15<<10,i[c|256]=l+15<<10|32768,r[c]=13,r[c|256]=13):l<128?(i[c]=31744,i[c|256]=64512,r[c]=24,r[c|256]=24):(i[c]=31744,i[c|256]=64512,r[c]=13,r[c|256]=13)}let s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let c=1;c<1024;++c){let l=c<<13,h=0;for(;(l&8388608)===0;)l<<=1,h-=8388608;l&=-8388609,h+=947912704,s[c]=l|h}for(let c=1024;c<2048;++c)s[c]=939524096+(c-1024<<13);for(let c=1;c<31;++c)a[c]=c<<23;a[31]=1199570944,a[32]=2147483648;for(let c=33;c<63;++c)a[c]=2147483648+(c-32<<23);a[63]=3347054592;for(let c=1;c<64;++c)c!==32&&(o[c]=1024);return{floatView:t,uint32View:e,baseTable:i,shiftTable:r,mantissaTable:s,exponentTable:a,offsetTable:o}}function Ke(n){Math.abs(n)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),n=pe(n,-65504,65504),Qn.floatView[0]=n;let t=Qn.uint32View[0],e=t>>23&511;return Qn.baseTable[e]+((t&8388607)>>Qn.shiftTable[e])}function ea(n){let t=n>>10;return Qn.uint32View[0]=Qn.mantissaTable[Qn.offsetTable[t]+(n&1023)]+Qn.exponentTable[t],Qn.floatView[0]}var mS={toHalfFloat:Ke,fromHalfFloat:ea},ve=new C,Ro=new $,Qt=class{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=ya,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[t+r]=e.array[i+r];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Ro.fromBufferAttribute(this,e),Ro.applyMatrix3(t),this.setXY(e,Ro.x,Ro.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix3(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix4(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)ve.fromBufferAttribute(this,e),ve.applyNormalMatrix(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)ve.fromBufferAttribute(this,e),ve.transformDirection(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=je(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Ht(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=je(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=je(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=je(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=je(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,r){return t*=this.itemSize,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array),r=Ht(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=r,this}setXYZW(t,e,i,r,s){return t*=this.itemSize,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array),r=Ht(r,this.array),s=Ht(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=r,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==ya&&(t.usage=this.usage),t}},Ju=class extends Qt{constructor(t,e,i){super(new Int8Array(t),e,i)}},Ku=class extends Qt{constructor(t,e,i){super(new Uint8Array(t),e,i)}},Qu=class extends Qt{constructor(t,e,i){super(new Uint8ClampedArray(t),e,i)}},ju=class extends Qt{constructor(t,e,i){super(new Int16Array(t),e,i)}},wa=class extends Qt{constructor(t,e,i){super(new Uint16Array(t),e,i)}},tf=class extends Qt{constructor(t,e,i){super(new Int32Array(t),e,i)}},Ea=class extends Qt{constructor(t,e,i){super(new Uint32Array(t),e,i)}},ef=class extends Qt{constructor(t,e,i){super(new Uint16Array(t),e,i),this.isFloat16BufferAttribute=!0}getX(t){let e=ea(this.array[t*this.itemSize]);return this.normalized&&(e=je(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize]=Ke(e),this}getY(t){let e=ea(this.array[t*this.itemSize+1]);return this.normalized&&(e=je(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize+1]=Ke(e),this}getZ(t){let e=ea(this.array[t*this.itemSize+2]);return this.normalized&&(e=je(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize+2]=Ke(e),this}getW(t){let e=ea(this.array[t*this.itemSize+3]);return this.normalized&&(e=je(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ht(e,this.array)),this.array[t*this.itemSize+3]=Ke(e),this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array)),this.array[t+0]=Ke(e),this.array[t+1]=Ke(i),this}setXYZ(t,e,i,r){return t*=this.itemSize,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array),r=Ht(r,this.array)),this.array[t+0]=Ke(e),this.array[t+1]=Ke(i),this.array[t+2]=Ke(r),this}setXYZW(t,e,i,r,s){return t*=this.itemSize,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array),r=Ht(r,this.array),s=Ht(s,this.array)),this.array[t+0]=Ke(e),this.array[t+1]=Ke(i),this.array[t+2]=Ke(r),this.array[t+3]=Ke(s),this}},yt=class extends Qt{constructor(t,e,i){super(new Float32Array(t),e,i)}},nf=class extends Qt{constructor(t,e,i){super(new Float64Array(t),e,i)}},gS=0,mn=new Lt,Wh=new jt,Xr=new C,sn=new De,Ys=new De,Ie=new C,Wt=class n extends wn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:gS++}),this.uuid=on(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(K0(t)?Ea:wa)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Gt().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(t),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return mn.makeRotationFromQuaternion(t),this.applyMatrix4(mn),this}rotateX(t){return mn.makeRotationX(t),this.applyMatrix4(mn),this}rotateY(t){return mn.makeRotationY(t),this.applyMatrix4(mn),this}rotateZ(t){return mn.makeRotationZ(t),this.applyMatrix4(mn),this}translate(t,e,i){return mn.makeTranslation(t,e,i),this.applyMatrix4(mn),this}scale(t,e,i){return mn.makeScale(t,e,i),this.applyMatrix4(mn),this}lookAt(t){return Wh.lookAt(t),Wh.updateMatrix(),this.applyMatrix4(Wh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xr).negate(),this.translate(Xr.x,Xr.y,Xr.z),this}setFromPoints(t){let e=[];for(let i=0,r=t.length;i<r;i++){let s=t[i];e.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new yt(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new De);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,r=e.length;i<r;i++){let s=e[i];sn.setFromBufferAttribute(s),this.morphTargetsRelative?(Ie.addVectors(this.boundingBox.min,sn.min),this.boundingBox.expandByPoint(Ie),Ie.addVectors(this.boundingBox.max,sn.max),this.boundingBox.expandByPoint(Ie)):(this.boundingBox.expandByPoint(sn.min),this.boundingBox.expandByPoint(sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pe);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new C,1/0);return}if(t){let i=this.boundingSphere.center;if(sn.setFromBufferAttribute(t),e)for(let s=0,a=e.length;s<a;s++){let o=e[s];Ys.setFromBufferAttribute(o),this.morphTargetsRelative?(Ie.addVectors(sn.min,Ys.min),sn.expandByPoint(Ie),Ie.addVectors(sn.max,Ys.max),sn.expandByPoint(Ie)):(sn.expandByPoint(Ys.min),sn.expandByPoint(Ys.max))}sn.getCenter(i);let r=0;for(let s=0,a=t.count;s<a;s++)Ie.fromBufferAttribute(t,s),r=Math.max(r,i.distanceToSquared(Ie));if(e)for(let s=0,a=e.length;s<a;s++){let o=e[s],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)Ie.fromBufferAttribute(o,l),c&&(Xr.fromBufferAttribute(t,l),Ie.add(Xr)),r=Math.max(r,i.distanceToSquared(Ie))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.array,r=e.position.array,s=e.normal.array,a=e.uv.array,o=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Qt(new Float32Array(4*o),4));let c=this.getAttribute("tangent").array,l=[],h=[];for(let S=0;S<o;S++)l[S]=new C,h[S]=new C;let u=new C,f=new C,d=new C,m=new $,_=new $,g=new $,p=new C,y=new C;function x(S,D,V){u.fromArray(r,S*3),f.fromArray(r,D*3),d.fromArray(r,V*3),m.fromArray(a,S*2),_.fromArray(a,D*2),g.fromArray(a,V*2),f.sub(u),d.sub(u),_.sub(m),g.sub(m);let rt=1/(_.x*g.y-g.x*_.y);isFinite(rt)&&(p.copy(f).multiplyScalar(g.y).addScaledVector(d,-_.y).multiplyScalar(rt),y.copy(d).multiplyScalar(_.x).addScaledVector(f,-g.x).multiplyScalar(rt),l[S].add(p),l[D].add(p),l[V].add(p),h[S].add(y),h[D].add(y),h[V].add(y))}let v=this.groups;v.length===0&&(v=[{start:0,count:i.length}]);for(let S=0,D=v.length;S<D;++S){let V=v[S],rt=V.start,L=V.count;for(let O=rt,H=rt+L;O<H;O+=3)x(i[O+0],i[O+1],i[O+2])}let R=new C,E=new C,w=new C,I=new C;function M(S){w.fromArray(s,S*3),I.copy(w);let D=l[S];R.copy(D),R.sub(w.multiplyScalar(w.dot(D))).normalize(),E.crossVectors(I,D);let rt=E.dot(h[S])<0?-1:1;c[S*4]=R.x,c[S*4+1]=R.y,c[S*4+2]=R.z,c[S*4+3]=rt}for(let S=0,D=v.length;S<D;++S){let V=v[S],rt=V.start,L=V.count;for(let O=rt,H=rt+L;O<H;O+=3)M(i[O+0]),M(i[O+1]),M(i[O+2])}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Qt(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let r=new C,s=new C,a=new C,o=new C,c=new C,l=new C,h=new C,u=new C;if(t)for(let f=0,d=t.count;f<d;f+=3){let m=t.getX(f+0),_=t.getX(f+1),g=t.getX(f+2);r.fromBufferAttribute(e,m),s.fromBufferAttribute(e,_),a.fromBufferAttribute(e,g),h.subVectors(a,s),u.subVectors(r,s),h.cross(u),o.fromBufferAttribute(i,m),c.fromBufferAttribute(i,_),l.fromBufferAttribute(i,g),o.add(h),c.add(h),l.add(h),i.setXYZ(m,o.x,o.y,o.z),i.setXYZ(_,c.x,c.y,c.z),i.setXYZ(g,l.x,l.y,l.z)}else for(let f=0,d=e.count;f<d;f+=3)r.fromBufferAttribute(e,f+0),s.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,s),u.subVectors(r,s),h.cross(u),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ie.fromBufferAttribute(t,e),Ie.normalize(),t.setXYZ(e,Ie.x,Ie.y,Ie.z)}toNonIndexed(){function t(o,c){let l=o.array,h=o.itemSize,u=o.normalized,f=new l.constructor(c.length*h),d=0,m=0;for(let _=0,g=c.length;_<g;_++){o.isInterleavedBufferAttribute?d=c[_]*o.data.stride+o.offset:d=c[_]*h;for(let p=0;p<h;p++)f[m++]=l[d++]}return new Qt(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new n,i=this.index.array,r=this.attributes;for(let o in r){let c=r[o],l=t(c,i);e.setAttribute(o,l)}let s=this.morphAttributes;for(let o in s){let c=[],l=s[o];for(let h=0,u=l.length;h<u;h++){let f=l[h],d=t(f,i);c.push(d)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let c in i){let l=i[c];t.data.attributes[c]=l.toJSON(t.data)}let r={},s=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,f=l.length;u<f;u++){let d=l[u];h.push(d.toJSON(t.data))}h.length>0&&(r[c]=h,s=!0)}s&&(t.data.morphAttributes=r,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone(e));let r=t.attributes;for(let l in r){let h=r[l];this.setAttribute(l,h.clone(e))}let s=t.morphAttributes;for(let l in s){let h=[],u=s[l];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let l=0,h=a.length;l<h;l++){let u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Lm=new Lt,Ki=new Li,Co=new Pe,Um=new C,qr=new C,Yr=new C,Zr=new C,Xh=new C,Io=new C,Po=new $,Lo=new $,Uo=new $,Dm=new C,Nm=new C,Fm=new C,Do=new C,No=new C,ye=class extends jt{constructor(t=new Wt,e=new Bn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let r=e[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(t,e){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(r,t);let o=this.morphTargetInfluences;if(s&&o){Io.set(0,0,0);for(let c=0,l=s.length;c<l;c++){let h=o[c],u=s[c];h!==0&&(Xh.fromBufferAttribute(u,t),a?Io.addScaledVector(Xh,h):Io.addScaledVector(Xh.sub(e),h))}e.add(Io)}return e}raycast(t,e){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Co.copy(i.boundingSphere),Co.applyMatrix4(s),Ki.copy(t.ray).recast(t.near),!(Co.containsPoint(Ki.origin)===!1&&(Ki.intersectSphere(Co,Um)===null||Ki.origin.distanceToSquared(Um)>(t.far-t.near)**2))&&(Lm.copy(s).invert(),Ki.copy(t.ray).applyMatrix4(Lm),!(i.boundingBox!==null&&Ki.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Ki)))}_computeIntersections(t,e,i){let r,s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,f=s.groups,d=s.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,_=f.length;m<_;m++){let g=f[m],p=a[g.materialIndex],y=Math.max(g.start,d.start),x=Math.min(o.count,Math.min(g.start+g.count,d.start+d.count));for(let v=y,R=x;v<R;v+=3){let E=o.getX(v),w=o.getX(v+1),I=o.getX(v+2);r=Fo(this,p,t,i,l,h,u,E,w,I),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=g.materialIndex,e.push(r))}}else{let m=Math.max(0,d.start),_=Math.min(o.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){let y=o.getX(g),x=o.getX(g+1),v=o.getX(g+2);r=Fo(this,a,t,i,l,h,u,y,x,v),r&&(r.faceIndex=Math.floor(g/3),e.push(r))}}else if(c!==void 0)if(Array.isArray(a))for(let m=0,_=f.length;m<_;m++){let g=f[m],p=a[g.materialIndex],y=Math.max(g.start,d.start),x=Math.min(c.count,Math.min(g.start+g.count,d.start+d.count));for(let v=y,R=x;v<R;v+=3){let E=v,w=v+1,I=v+2;r=Fo(this,p,t,i,l,h,u,E,w,I),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=g.materialIndex,e.push(r))}}else{let m=Math.max(0,d.start),_=Math.min(c.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){let y=g,x=g+1,v=g+2;r=Fo(this,a,t,i,l,h,u,y,x,v),r&&(r.faceIndex=Math.floor(g/3),e.push(r))}}}};function _S(n,t,e,i,r,s,a,o){let c;if(t.side===Ze?c=i.intersectTriangle(a,s,r,!0,o):c=i.intersectTriangle(r,s,a,t.side===li,o),c===null)return null;No.copy(o),No.applyMatrix4(n.matrixWorld);let l=e.ray.origin.distanceTo(No);return l<e.near||l>e.far?null:{distance:l,point:No.clone(),object:n}}function Fo(n,t,e,i,r,s,a,o,c,l){n.getVertexPosition(o,qr),n.getVertexPosition(c,Yr),n.getVertexPosition(l,Zr);let h=_S(n,t,e,i,qr,Yr,Zr,Do);if(h){r&&(Po.fromBufferAttribute(r,o),Lo.fromBufferAttribute(r,c),Uo.fromBufferAttribute(r,l),h.uv=ei.getInterpolation(Do,qr,Yr,Zr,Po,Lo,Uo,new $)),s&&(Po.fromBufferAttribute(s,o),Lo.fromBufferAttribute(s,c),Uo.fromBufferAttribute(s,l),h.uv1=ei.getInterpolation(Do,qr,Yr,Zr,Po,Lo,Uo,new $),h.uv2=h.uv1),a&&(Dm.fromBufferAttribute(a,o),Nm.fromBufferAttribute(a,c),Fm.fromBufferAttribute(a,l),h.normal=ei.getInterpolation(Do,qr,Yr,Zr,Dm,Nm,Fm,new C),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:c,c:l,normal:new C,materialIndex:0};ei.getNormal(qr,Yr,Zr,u.normal),h.face=u}return h}var pr=class n extends Wt{constructor(t=1,e=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};let o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);let c=[],l=[],h=[],u=[],f=0,d=0;m("z","y","x",-1,-1,i,e,t,a,s,0),m("z","y","x",1,-1,i,e,-t,a,s,1),m("x","z","y",1,1,t,i,e,r,a,2),m("x","z","y",1,-1,t,i,-e,r,a,3),m("x","y","z",1,-1,t,e,i,r,s,4),m("x","y","z",-1,-1,t,e,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new yt(l,3)),this.setAttribute("normal",new yt(h,3)),this.setAttribute("uv",new yt(u,2));function m(_,g,p,y,x,v,R,E,w,I,M){let S=v/w,D=R/I,V=v/2,rt=R/2,L=E/2,O=w+1,H=I+1,J=0,Z=0,X=new C;for(let et=0;et<H;et++){let nt=et*D-rt;for(let ft=0;ft<O;ft++){let W=ft*S-V;X[_]=W*y,X[g]=nt*x,X[p]=L,l.push(X.x,X.y,X.z),X[_]=0,X[g]=0,X[p]=E>0?1:-1,h.push(X.x,X.y,X.z),u.push(ft/w),u.push(1-et/I),J+=1}}for(let et=0;et<I;et++)for(let nt=0;nt<w;nt++){let ft=f+nt+O*et,W=f+nt+O*(et+1),Q=f+(nt+1)+O*(et+1),dt=f+(nt+1)+O*et;c.push(ft,W,dt),c.push(W,Q,dt),Z+=6}o.addGroup(d,Z,M),d+=Z,f+=J}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function ms(n){let t={};for(let e in n){t[e]={};for(let i in n[e]){let r=n[e][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=r.clone():Array.isArray(r)?t[e][i]=r.slice():t[e][i]=r}}return t}function Ye(n){let t={};for(let e=0;e<n.length;e++){let i=ms(n[e]);for(let r in i)t[r]=i[r]}return t}function xS(n){let t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function t_(n){return n.getRenderTarget()===null?n.outputColorSpace:ne.workingColorSpace}var e_={clone:ms,merge:Ye},yS=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,vS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,gn=class extends Le{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=yS,this.fragmentShader=vS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ms(t.uniforms),this.uniformsGroups=xS(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let r in this.uniforms){let a=this.uniforms[r].value;a&&a.isTexture?e.uniforms[r]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[r]={type:"m4",value:a.toArray()}:e.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}},gs=class extends jt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Lt,this.projectionMatrix=new Lt,this.projectionMatrixInverse=new Lt,this.coordinateSystem=bn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Se=class extends gs{constructor(t=50,e=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=fs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(fr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return fs*2*Math.atan(Math.tan(fr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(t,e,i,r,s,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(fr*.5*this.fov)/this.zoom,i=2*e,r=this.aspect*i,s=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;s+=a.offsetX*r/c,e-=a.offsetY*i/l,r*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(s+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,e,e-i,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},$r=-90,Jr=1,Sl=class extends jt{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Se($r,Jr,t,e);r.layers=this.layers,this.add(r);let s=new Se($r,Jr,t,e);s.layers=this.layers,this.add(s);let a=new Se($r,Jr,t,e);a.layers=this.layers,this.add(a);let o=new Se($r,Jr,t,e);o.layers=this.layers,this.add(o);let c=new Se($r,Jr,t,e);c.layers=this.layers,this.add(c);let l=new Se($r,Jr,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,r,s,a,o,c]=e;for(let l of e)this.remove(l);if(t===bn)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===us)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,c,l,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,r),t.render(e,s),t.setRenderTarget(i,1,r),t.render(e,a),t.setRenderTarget(i,2,r),t.render(e,o),t.setRenderTarget(i,3,r),t.render(e,c),t.setRenderTarget(i,4,r),t.render(e,l),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,r),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},mr=class extends be{constructor(t,e,i,r,s,a,o,c,l,h){t=t!==void 0?t:[],e=e!==void 0?e:ci,super(t,e,i,r,s,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},bl=class extends ln{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},r=[i,i,i,i,i,i];e.encoding!==void 0&&(ra("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),e.colorSpace=e.encoding===Ci?Me:an),this.texture=new mr(r,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:xe}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new pr(5,5,5),s=new gn({name:"CubemapFromEquirect",uniforms:ms(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ze,blending:ii});s.uniforms.tEquirect.value=e;let a=new ye(r,s),o=e.minFilter;return e.minFilter===Pi&&(e.minFilter=xe),new Sl(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,i,r){let s=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,r);t.setRenderTarget(s)}},qh=new C,MS=new C,SS=new Gt,Dn=class{constructor(t=new C(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,r){return this.normal.set(t,e,i),this.constant=r,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let r=qh.subVectors(i,e).cross(MS.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(r,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let i=t.delta(qh),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let s=-(t.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:e.copy(t.start).addScaledVector(i,s)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||SS.getNormalMatrix(t),r=this.coplanarPoint(qh).applyMatrix4(t),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},Qi=new Pe,Oo=new C,gr=class{constructor(t=new Dn,e=new Dn,i=new Dn,r=new Dn,s=new Dn,a=new Dn){this.planes=[t,e,i,r,s,a]}set(t,e,i,r,s,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=bn){let i=this.planes,r=t.elements,s=r[0],a=r[1],o=r[2],c=r[3],l=r[4],h=r[5],u=r[6],f=r[7],d=r[8],m=r[9],_=r[10],g=r[11],p=r[12],y=r[13],x=r[14],v=r[15];if(i[0].setComponents(c-s,f-l,g-d,v-p).normalize(),i[1].setComponents(c+s,f+l,g+d,v+p).normalize(),i[2].setComponents(c+a,f+h,g+m,v+y).normalize(),i[3].setComponents(c-a,f-h,g-m,v-y).normalize(),i[4].setComponents(c-o,f-u,g-_,v-x).normalize(),e===bn)i[5].setComponents(c+o,f+u,g+_,v+x).normalize();else if(e===us)i[5].setComponents(o,u,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Qi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Qi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Qi)}intersectsSprite(t){return Qi.center.set(0,0,0),Qi.radius=.7071067811865476,Qi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Qi)}intersectsSphere(t){let e=this.planes,i=t.center,r=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let r=e[i];if(Oo.x=r.normal.x>0?t.max.x:t.min.x,Oo.y=r.normal.y>0?t.max.y:t.min.y,Oo.z=r.normal.z>0?t.max.z:t.min.z,r.distanceToPoint(Oo)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function n_(){let n=null,t=!1,e=null,i=null;function r(s,a){e(s,a),i=n.requestAnimationFrame(r)}return{start:function(){t!==!0&&e!==null&&(i=n.requestAnimationFrame(r),t=!0)},stop:function(){n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){n=s}}}function bS(n,t){let e=t.isWebGL2,i=new WeakMap;function r(l,h){let u=l.array,f=l.usage,d=u.byteLength,m=n.createBuffer();n.bindBuffer(h,m),n.bufferData(h,u,f),l.onUploadCallback();let _;if(u instanceof Float32Array)_=n.FLOAT;else if(u instanceof Uint16Array)if(l.isFloat16BufferAttribute)if(e)_=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=n.UNSIGNED_SHORT;else if(u instanceof Int16Array)_=n.SHORT;else if(u instanceof Uint32Array)_=n.UNSIGNED_INT;else if(u instanceof Int32Array)_=n.INT;else if(u instanceof Int8Array)_=n.BYTE;else if(u instanceof Uint8Array)_=n.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)_=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:m,type:_,bytesPerElement:u.BYTES_PER_ELEMENT,version:l.version,size:d}}function s(l,h,u){let f=h.array,d=h._updateRange,m=h.updateRanges;if(n.bindBuffer(u,l),d.count===-1&&m.length===0&&n.bufferSubData(u,0,f),m.length!==0){for(let _=0,g=m.length;_<g;_++){let p=m[_];e?n.bufferSubData(u,p.start*f.BYTES_PER_ELEMENT,f,p.start,p.count):n.bufferSubData(u,p.start*f.BYTES_PER_ELEMENT,f.subarray(p.start,p.start+p.count))}h.clearUpdateRanges()}d.count!==-1&&(e?n.bufferSubData(u,d.offset*f.BYTES_PER_ELEMENT,f,d.offset,d.count):n.bufferSubData(u,d.offset*f.BYTES_PER_ELEMENT,f.subarray(d.offset,d.offset+d.count)),d.count=-1),h.onUploadCallback()}function a(l){return l.isInterleavedBufferAttribute&&(l=l.data),i.get(l)}function o(l){l.isInterleavedBufferAttribute&&(l=l.data);let h=i.get(l);h&&(n.deleteBuffer(h.buffer),i.delete(l))}function c(l,h){if(l.isGLBufferAttribute){let f=i.get(l);(!f||f.version<l.version)&&i.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}l.isInterleavedBufferAttribute&&(l=l.data);let u=i.get(l);if(u===void 0)i.set(l,r(l,h));else if(u.version<l.version){if(u.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(u.buffer,l,h),u.version=l.version}}return{get:a,remove:o,update:c}}var Aa=class n extends Wt{constructor(t=1,e=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:r};let s=t/2,a=e/2,o=Math.floor(i),c=Math.floor(r),l=o+1,h=c+1,u=t/o,f=e/c,d=[],m=[],_=[],g=[];for(let p=0;p<h;p++){let y=p*f-a;for(let x=0;x<l;x++){let v=x*u-s;m.push(v,-y,0),_.push(0,0,1),g.push(x/o),g.push(1-p/c)}}for(let p=0;p<c;p++)for(let y=0;y<o;y++){let x=y+l*p,v=y+l*(p+1),R=y+1+l*(p+1),E=y+1+l*p;d.push(x,v,E),d.push(v,R,E)}this.setIndex(d),this.setAttribute("position",new yt(m,3)),this.setAttribute("normal",new yt(_,3)),this.setAttribute("uv",new yt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.widthSegments,t.heightSegments)}},wS=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ES=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,AS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,TS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,RS=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,CS=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,IS=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,PS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,LS=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,US=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,DS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,NS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,FS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,OS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,BS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,zS=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,kS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,HS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,VS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,GS=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,WS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,XS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,qS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,YS=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ZS=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,$S=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,JS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,KS=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,QS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,jS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,tb="gl_FragColor = linearToOutputTexel( gl_FragColor );",eb=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,nb=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ib=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,rb=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,sb=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ab=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ob=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,lb=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,cb=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,hb=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ub=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,fb=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,db=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,pb=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,mb=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,gb=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,_b=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,xb=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,yb=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,vb=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Mb=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Sb=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,bb=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,wb=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Eb=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ab=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Tb=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Rb=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cb=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Ib=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Pb=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Lb=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ub=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Db=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Nb=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Fb=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ob=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Bb=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,zb=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,kb=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Hb=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Vb=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Gb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Wb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Xb=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,qb=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Yb=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Zb=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,$b=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Jb=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Kb=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Qb=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,jb=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,tw=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ew=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,nw=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,iw=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,rw=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,sw=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,aw=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,ow=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,lw=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,cw=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,hw=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,uw=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,fw=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,dw=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,pw=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,mw=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,gw=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_w=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,xw=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,yw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Mw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Sw=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,bw=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ww=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ew=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Aw=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rw=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cw=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Iw=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Pw=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Lw=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Uw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Dw=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Nw=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Fw=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ow=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Bw=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zw=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kw=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hw=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Vw=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gw=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Ww=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Xw=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qw=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yw=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Zw=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$w=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Jw=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kw=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Qw=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jw=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,t1=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,e1=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,n1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,kt={alphahash_fragment:wS,alphahash_pars_fragment:ES,alphamap_fragment:AS,alphamap_pars_fragment:TS,alphatest_fragment:RS,alphatest_pars_fragment:CS,aomap_fragment:IS,aomap_pars_fragment:PS,batching_pars_vertex:LS,batching_vertex:US,begin_vertex:DS,beginnormal_vertex:NS,bsdfs:FS,iridescence_fragment:OS,bumpmap_pars_fragment:BS,clipping_planes_fragment:zS,clipping_planes_pars_fragment:kS,clipping_planes_pars_vertex:HS,clipping_planes_vertex:VS,color_fragment:GS,color_pars_fragment:WS,color_pars_vertex:XS,color_vertex:qS,common:YS,cube_uv_reflection_fragment:ZS,defaultnormal_vertex:$S,displacementmap_pars_vertex:JS,displacementmap_vertex:KS,emissivemap_fragment:QS,emissivemap_pars_fragment:jS,colorspace_fragment:tb,colorspace_pars_fragment:eb,envmap_fragment:nb,envmap_common_pars_fragment:ib,envmap_pars_fragment:rb,envmap_pars_vertex:sb,envmap_physical_pars_fragment:_b,envmap_vertex:ab,fog_vertex:ob,fog_pars_vertex:lb,fog_fragment:cb,fog_pars_fragment:hb,gradientmap_pars_fragment:ub,lightmap_fragment:fb,lightmap_pars_fragment:db,lights_lambert_fragment:pb,lights_lambert_pars_fragment:mb,lights_pars_begin:gb,lights_toon_fragment:xb,lights_toon_pars_fragment:yb,lights_phong_fragment:vb,lights_phong_pars_fragment:Mb,lights_physical_fragment:Sb,lights_physical_pars_fragment:bb,lights_fragment_begin:wb,lights_fragment_maps:Eb,lights_fragment_end:Ab,logdepthbuf_fragment:Tb,logdepthbuf_pars_fragment:Rb,logdepthbuf_pars_vertex:Cb,logdepthbuf_vertex:Ib,map_fragment:Pb,map_pars_fragment:Lb,map_particle_fragment:Ub,map_particle_pars_fragment:Db,metalnessmap_fragment:Nb,metalnessmap_pars_fragment:Fb,morphcolor_vertex:Ob,morphnormal_vertex:Bb,morphtarget_pars_vertex:zb,morphtarget_vertex:kb,normal_fragment_begin:Hb,normal_fragment_maps:Vb,normal_pars_fragment:Gb,normal_pars_vertex:Wb,normal_vertex:Xb,normalmap_pars_fragment:qb,clearcoat_normal_fragment_begin:Yb,clearcoat_normal_fragment_maps:Zb,clearcoat_pars_fragment:$b,iridescence_pars_fragment:Jb,opaque_fragment:Kb,packing:Qb,premultiplied_alpha_fragment:jb,project_vertex:tw,dithering_fragment:ew,dithering_pars_fragment:nw,roughnessmap_fragment:iw,roughnessmap_pars_fragment:rw,shadowmap_pars_fragment:sw,shadowmap_pars_vertex:aw,shadowmap_vertex:ow,shadowmask_pars_fragment:lw,skinbase_vertex:cw,skinning_pars_vertex:hw,skinning_vertex:uw,skinnormal_vertex:fw,specularmap_fragment:dw,specularmap_pars_fragment:pw,tonemapping_fragment:mw,tonemapping_pars_fragment:gw,transmission_fragment:_w,transmission_pars_fragment:xw,uv_pars_fragment:yw,uv_pars_vertex:vw,uv_vertex:Mw,worldpos_vertex:Sw,background_vert:bw,background_frag:ww,backgroundCube_vert:Ew,backgroundCube_frag:Aw,cube_vert:Tw,cube_frag:Rw,depth_vert:Cw,depth_frag:Iw,distanceRGBA_vert:Pw,distanceRGBA_frag:Lw,equirect_vert:Uw,equirect_frag:Dw,linedashed_vert:Nw,linedashed_frag:Fw,meshbasic_vert:Ow,meshbasic_frag:Bw,meshlambert_vert:zw,meshlambert_frag:kw,meshmatcap_vert:Hw,meshmatcap_frag:Vw,meshnormal_vert:Gw,meshnormal_frag:Ww,meshphong_vert:Xw,meshphong_frag:qw,meshphysical_vert:Yw,meshphysical_frag:Zw,meshtoon_vert:$w,meshtoon_frag:Jw,points_vert:Kw,points_frag:Qw,shadow_vert:jw,shadow_frag:t1,sprite_vert:e1,sprite_frag:n1},ot={common:{diffuse:{value:new pt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Gt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Gt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Gt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Gt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Gt},normalScale:{value:new $(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Gt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Gt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Gt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Gt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new pt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new pt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0},uvTransform:{value:new Gt}},sprite:{diffuse:{value:new pt(16777215)},opacity:{value:1},center:{value:new $(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}}},Mn={basic:{uniforms:Ye([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.fog]),vertexShader:kt.meshbasic_vert,fragmentShader:kt.meshbasic_frag},lambert:{uniforms:Ye([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new pt(0)}}]),vertexShader:kt.meshlambert_vert,fragmentShader:kt.meshlambert_frag},phong:{uniforms:Ye([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new pt(0)},specular:{value:new pt(1118481)},shininess:{value:30}}]),vertexShader:kt.meshphong_vert,fragmentShader:kt.meshphong_frag},standard:{uniforms:Ye([ot.common,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.roughnessmap,ot.metalnessmap,ot.fog,ot.lights,{emissive:{value:new pt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag},toon:{uniforms:Ye([ot.common,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.gradientmap,ot.fog,ot.lights,{emissive:{value:new pt(0)}}]),vertexShader:kt.meshtoon_vert,fragmentShader:kt.meshtoon_frag},matcap:{uniforms:Ye([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,{matcap:{value:null}}]),vertexShader:kt.meshmatcap_vert,fragmentShader:kt.meshmatcap_frag},points:{uniforms:Ye([ot.points,ot.fog]),vertexShader:kt.points_vert,fragmentShader:kt.points_frag},dashed:{uniforms:Ye([ot.common,ot.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:kt.linedashed_vert,fragmentShader:kt.linedashed_frag},depth:{uniforms:Ye([ot.common,ot.displacementmap]),vertexShader:kt.depth_vert,fragmentShader:kt.depth_frag},normal:{uniforms:Ye([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,{opacity:{value:1}}]),vertexShader:kt.meshnormal_vert,fragmentShader:kt.meshnormal_frag},sprite:{uniforms:Ye([ot.sprite,ot.fog]),vertexShader:kt.sprite_vert,fragmentShader:kt.sprite_frag},background:{uniforms:{uvTransform:{value:new Gt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:kt.background_vert,fragmentShader:kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:kt.backgroundCube_vert,fragmentShader:kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:kt.cube_vert,fragmentShader:kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:kt.equirect_vert,fragmentShader:kt.equirect_frag},distanceRGBA:{uniforms:Ye([ot.common,ot.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:kt.distanceRGBA_vert,fragmentShader:kt.distanceRGBA_frag},shadow:{uniforms:Ye([ot.lights,ot.fog,{color:{value:new pt(0)},opacity:{value:1}}]),vertexShader:kt.shadow_vert,fragmentShader:kt.shadow_frag}};Mn.physical={uniforms:Ye([Mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Gt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Gt},clearcoatNormalScale:{value:new $(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Gt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Gt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Gt},sheen:{value:0},sheenColor:{value:new pt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Gt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Gt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Gt},transmissionSamplerSize:{value:new $},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Gt},attenuationDistance:{value:0},attenuationColor:{value:new pt(0)},specularColor:{value:new pt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Gt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Gt},anisotropyVector:{value:new $},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Gt}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag};var Bo={r:0,b:0,g:0};function i1(n,t,e,i,r,s,a){let o=new pt(0),c=s===!0?0:1,l,h,u=null,f=0,d=null;function m(g,p){let y=!1,x=p.isScene===!0?p.background:null;x&&x.isTexture&&(x=(p.backgroundBlurriness>0?e:t).get(x)),x===null?_(o,c):x&&x.isColor&&(_(x,1),y=!0);let v=n.xr.getEnvironmentBlendMode();v==="additive"?i.buffers.color.setClear(0,0,0,1,a):v==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||y)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),x&&(x.isCubeTexture||x.mapping===Ss)?(h===void 0&&(h=new ye(new pr(1,1,1),new gn({name:"BackgroundCubeMaterial",uniforms:ms(Mn.backgroundCube.uniforms),vertexShader:Mn.backgroundCube.vertexShader,fragmentShader:Mn.backgroundCube.fragmentShader,side:Ze,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,E,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=p.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,h.material.toneMapped=ne.getTransfer(x.colorSpace)!==oe,(u!==x||f!==x.version||d!==n.toneMapping)&&(h.material.needsUpdate=!0,u=x,f=x.version,d=n.toneMapping),h.layers.enableAll(),g.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new ye(new Aa(2,2),new gn({name:"BackgroundMaterial",uniforms:ms(Mn.background.uniforms),vertexShader:Mn.background.vertexShader,fragmentShader:Mn.background.fragmentShader,side:li,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,l.material.toneMapped=ne.getTransfer(x.colorSpace)!==oe,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||f!==x.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,u=x,f=x.version,d=n.toneMapping),l.layers.enableAll(),g.unshift(l,l.geometry,l.material,0,0,null))}function _(g,p){g.getRGB(Bo,t_(n)),i.buffers.color.setClear(Bo.r,Bo.g,Bo.b,p,a)}return{getClearColor:function(){return o},setClearColor:function(g,p=1){o.set(g),c=p,_(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(g){c=g,_(o,c)},render:m}}function r1(n,t,e,i){let r=n.getParameter(n.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:t.get("OES_vertex_array_object"),a=i.isWebGL2||s!==null,o={},c=g(null),l=c,h=!1;function u(L,O,H,J,Z){let X=!1;if(a){let et=_(J,H,O);l!==et&&(l=et,d(l.object)),X=p(L,J,H,Z),X&&y(L,J,H,Z)}else{let et=O.wireframe===!0;(l.geometry!==J.id||l.program!==H.id||l.wireframe!==et)&&(l.geometry=J.id,l.program=H.id,l.wireframe=et,X=!0)}Z!==null&&e.update(Z,n.ELEMENT_ARRAY_BUFFER),(X||h)&&(h=!1,I(L,O,H,J),Z!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(Z).buffer))}function f(){return i.isWebGL2?n.createVertexArray():s.createVertexArrayOES()}function d(L){return i.isWebGL2?n.bindVertexArray(L):s.bindVertexArrayOES(L)}function m(L){return i.isWebGL2?n.deleteVertexArray(L):s.deleteVertexArrayOES(L)}function _(L,O,H){let J=H.wireframe===!0,Z=o[L.id];Z===void 0&&(Z={},o[L.id]=Z);let X=Z[O.id];X===void 0&&(X={},Z[O.id]=X);let et=X[J];return et===void 0&&(et=g(f()),X[J]=et),et}function g(L){let O=[],H=[],J=[];for(let Z=0;Z<r;Z++)O[Z]=0,H[Z]=0,J[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:H,attributeDivisors:J,object:L,attributes:{},index:null}}function p(L,O,H,J){let Z=l.attributes,X=O.attributes,et=0,nt=H.getAttributes();for(let ft in nt)if(nt[ft].location>=0){let Q=Z[ft],dt=X[ft];if(dt===void 0&&(ft==="instanceMatrix"&&L.instanceMatrix&&(dt=L.instanceMatrix),ft==="instanceColor"&&L.instanceColor&&(dt=L.instanceColor)),Q===void 0||Q.attribute!==dt||dt&&Q.data!==dt.data)return!0;et++}return l.attributesNum!==et||l.index!==J}function y(L,O,H,J){let Z={},X=O.attributes,et=0,nt=H.getAttributes();for(let ft in nt)if(nt[ft].location>=0){let Q=X[ft];Q===void 0&&(ft==="instanceMatrix"&&L.instanceMatrix&&(Q=L.instanceMatrix),ft==="instanceColor"&&L.instanceColor&&(Q=L.instanceColor));let dt={};dt.attribute=Q,Q&&Q.data&&(dt.data=Q.data),Z[ft]=dt,et++}l.attributes=Z,l.attributesNum=et,l.index=J}function x(){let L=l.newAttributes;for(let O=0,H=L.length;O<H;O++)L[O]=0}function v(L){R(L,0)}function R(L,O){let H=l.newAttributes,J=l.enabledAttributes,Z=l.attributeDivisors;H[L]=1,J[L]===0&&(n.enableVertexAttribArray(L),J[L]=1),Z[L]!==O&&((i.isWebGL2?n:t.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](L,O),Z[L]=O)}function E(){let L=l.newAttributes,O=l.enabledAttributes;for(let H=0,J=O.length;H<J;H++)O[H]!==L[H]&&(n.disableVertexAttribArray(H),O[H]=0)}function w(L,O,H,J,Z,X,et){et===!0?n.vertexAttribIPointer(L,O,H,Z,X):n.vertexAttribPointer(L,O,H,J,Z,X)}function I(L,O,H,J){if(i.isWebGL2===!1&&(L.isInstancedMesh||J.isInstancedBufferGeometry)&&t.get("ANGLE_instanced_arrays")===null)return;x();let Z=J.attributes,X=H.getAttributes(),et=O.defaultAttributeValues;for(let nt in X){let ft=X[nt];if(ft.location>=0){let W=Z[nt];if(W===void 0&&(nt==="instanceMatrix"&&L.instanceMatrix&&(W=L.instanceMatrix),nt==="instanceColor"&&L.instanceColor&&(W=L.instanceColor)),W!==void 0){let Q=W.normalized,dt=W.itemSize,St=e.get(W);if(St===void 0)continue;let _t=St.buffer,It=St.type,Ft=St.bytesPerElement,bt=i.isWebGL2===!0&&(It===n.INT||It===n.UNSIGNED_INT||W.gpuType===fd);if(W.isInterleavedBufferAttribute){let Dt=W.data,P=Dt.stride,at=W.offset;if(Dt.isInstancedInterleavedBuffer){for(let Y=0;Y<ft.locationSize;Y++)R(ft.location+Y,Dt.meshPerAttribute);L.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=Dt.meshPerAttribute*Dt.count)}else for(let Y=0;Y<ft.locationSize;Y++)v(ft.location+Y);n.bindBuffer(n.ARRAY_BUFFER,_t);for(let Y=0;Y<ft.locationSize;Y++)w(ft.location+Y,dt/ft.locationSize,It,Q,P*Ft,(at+dt/ft.locationSize*Y)*Ft,bt)}else{if(W.isInstancedBufferAttribute){for(let Dt=0;Dt<ft.locationSize;Dt++)R(ft.location+Dt,W.meshPerAttribute);L.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let Dt=0;Dt<ft.locationSize;Dt++)v(ft.location+Dt);n.bindBuffer(n.ARRAY_BUFFER,_t);for(let Dt=0;Dt<ft.locationSize;Dt++)w(ft.location+Dt,dt/ft.locationSize,It,Q,dt*Ft,dt/ft.locationSize*Dt*Ft,bt)}}else if(et!==void 0){let Q=et[nt];if(Q!==void 0)switch(Q.length){case 2:n.vertexAttrib2fv(ft.location,Q);break;case 3:n.vertexAttrib3fv(ft.location,Q);break;case 4:n.vertexAttrib4fv(ft.location,Q);break;default:n.vertexAttrib1fv(ft.location,Q)}}}}E()}function M(){V();for(let L in o){let O=o[L];for(let H in O){let J=O[H];for(let Z in J)m(J[Z].object),delete J[Z];delete O[H]}delete o[L]}}function S(L){if(o[L.id]===void 0)return;let O=o[L.id];for(let H in O){let J=O[H];for(let Z in J)m(J[Z].object),delete J[Z];delete O[H]}delete o[L.id]}function D(L){for(let O in o){let H=o[O];if(H[L.id]===void 0)continue;let J=H[L.id];for(let Z in J)m(J[Z].object),delete J[Z];delete H[L.id]}}function V(){rt(),h=!0,l!==c&&(l=c,d(l.object))}function rt(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:u,reset:V,resetDefaultState:rt,dispose:M,releaseStatesOfGeometry:S,releaseStatesOfProgram:D,initAttributes:x,enableAttribute:v,disableUnusedAttributes:E}}function s1(n,t,e,i){let r=i.isWebGL2,s;function a(h){s=h}function o(h,u){n.drawArrays(s,h,u),e.update(u,s,1)}function c(h,u,f){if(f===0)return;let d,m;if(r)d=n,m="drawArraysInstanced";else if(d=t.get("ANGLE_instanced_arrays"),m="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[m](s,h,u,f),e.update(u,s,f)}function l(h,u,f){if(f===0)return;let d=t.get("WEBGL_multi_draw");if(d===null)for(let m=0;m<f;m++)this.render(h[m],u[m]);else{d.multiDrawArraysWEBGL(s,h,0,u,0,f);let m=0;for(let _=0;_<f;_++)m+=u[_];e.update(m,s,1)}}this.setMode=a,this.render=o,this.renderInstances=c,this.renderMultiDraw=l}function a1(n,t,e){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");i=n.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(w){if(w==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=typeof WebGL2RenderingContext<"u"&&n.constructor.name==="WebGL2RenderingContext",o=e.precision!==void 0?e.precision:"highp",c=s(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);let l=a||t.has("WEBGL_draw_buffers"),h=e.logarithmicDepthBuffer===!0,u=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),f=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),d=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),_=n.getParameter(n.MAX_VERTEX_ATTRIBS),g=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),p=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),x=f>0,v=a||t.has("OES_texture_float"),R=x&&v,E=a?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:l,getMaxAnisotropy:r,getMaxPrecision:s,precision:o,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:f,maxTextureSize:d,maxCubemapSize:m,maxAttributes:_,maxVertexUniforms:g,maxVaryings:p,maxFragmentUniforms:y,vertexTextures:x,floatFragmentTextures:v,floatVertexTextures:R,maxSamples:E}}function o1(n){let t=this,e=null,i=0,r=!1,s=!1,a=new Dn,o=new Gt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let d=u.length!==0||f||i!==0||r;return r=f,i=u.length,d},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){let m=u.clippingPlanes,_=u.clipIntersection,g=u.clipShadows,p=n.get(u);if(!r||m===null||m.length===0||s&&!g)s?h(null):l();else{let y=s?0:i,x=y*4,v=p.clippingState||null;c.value=v,v=h(m,f,x,d);for(let R=0;R!==x;++R)v[R]=e[R];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,f,d,m){let _=u!==null?u.length:0,g=null;if(_!==0){if(g=c.value,m!==!0||g===null){let p=d+_*4,y=f.matrixWorldInverse;o.getNormalMatrix(y),(g===null||g.length<p)&&(g=new Float32Array(p));for(let x=0,v=d;x!==_;++x,v+=4)a.copy(u[x]).applyMatrix4(y,o),a.normal.toArray(g,v),g[v+3]=a.constant}c.value=g,c.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,g}}function l1(n){let t=new WeakMap;function e(a,o){return o===ca?a.mapping=ci:o===ha&&(a.mapping=Ii),a}function i(a){if(a&&a.isTexture){let o=a.mapping;if(o===ca||o===ha)if(t.has(a)){let c=t.get(a).texture;return e(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let l=new bl(c.height/2);return l.fromEquirectangularTexture(n,a),t.set(a,l),a.addEventListener("dispose",r),e(l.texture,a.mapping)}else return null}}return a}function r(a){let o=a.target;o.removeEventListener("dispose",r);let c=t.get(o);c!==void 0&&(t.delete(o),c.dispose())}function s(){t=new WeakMap}return{get:i,dispose:s}}var _s=class extends gs{constructor(t=-1,e=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-t,a=i+t,o=r+e,c=r-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,a=s+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},ss=4,Om=[.125,.215,.35,.446,.526,.582],or=20,Yh=new _s,Bm=new pt,Zh=null,$h=0,Jh=0,ar=(1+Math.sqrt(5))/2,Kr=1/ar,zm=[new C(1,1,1),new C(-1,1,1),new C(1,1,-1),new C(-1,1,-1),new C(0,ar,Kr),new C(0,ar,-Kr),new C(Kr,0,ar),new C(-Kr,0,ar),new C(ar,Kr,0),new C(-ar,Kr,0)],Ta=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,i=.1,r=100){Zh=this._renderer.getRenderTarget(),$h=this._renderer.getActiveCubeFace(),Jh=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(t,i,r,s),e>0&&this._blur(s,0,0,e),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Hm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Zh,$h,Jh),t.scissorTest=!1,zo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ci||t.mapping===Ii?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Zh=this._renderer.getRenderTarget(),$h=this._renderer.getActiveCubeFace(),Jh=this._renderer.getActiveMipmapLevel();let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:xe,minFilter:xe,generateMipmaps:!1,type:hs,format:Qe,colorSpace:On,depthBuffer:!1},r=km(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=km(t,e,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=c1(s)),this._blurMaterial=h1(s,t,e)}return r}_compileMaterial(t){let e=new ye(this._lodPlanes[0],t);this._renderer.compile(e,Yh)}_sceneToCubeUV(t,e,i,r){let o=new Se(90,1,e,i),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(Bm),h.toneMapping=ri,h.autoClear=!1;let d=new Bn({name:"PMREM.Background",side:Ze,depthWrite:!1,depthTest:!1}),m=new ye(new pr,d),_=!1,g=t.background;g?g.isColor&&(d.color.copy(g),t.background=null,_=!0):(d.color.copy(Bm),_=!0);for(let p=0;p<6;p++){let y=p%3;y===0?(o.up.set(0,c[p],0),o.lookAt(l[p],0,0)):y===1?(o.up.set(0,0,c[p]),o.lookAt(0,l[p],0)):(o.up.set(0,c[p],0),o.lookAt(0,0,l[p]));let x=this._cubeSize;zo(r,y*x,p>2?x:0,x,x),h.setRenderTarget(r),_&&h.render(m,o),h.render(t,o)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=g}_textureToCubeUV(t,e){let i=this._renderer,r=t.mapping===ci||t.mapping===Ii;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vm()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Hm());let s=r?this._cubemapMaterial:this._equirectMaterial,a=new ye(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=t;let c=this._cubeSize;zo(e,0,0,3*c,2*c),i.setRenderTarget(e),i.render(a,Yh)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=zm[(r-1)%zm.length];this._blur(t,r-1,r,s,a)}e.autoClear=i}_blur(t,e,i,r,s){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,i,r,"latitudinal",s),this._halfBlur(a,t,i,i,r,"longitudinal",s)}_halfBlur(t,e,i,r,s,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new ye(this._lodPlanes[r],l),f=l.uniforms,d=this._sizeLods[i]-1,m=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*or-1),_=s/m,g=isFinite(s)?1+Math.floor(h*_):or;g>or&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${or}`);let p=[],y=0;for(let w=0;w<or;++w){let I=w/_,M=Math.exp(-I*I/2);p.push(M),w===0?y+=M:w<g&&(y+=2*M)}for(let w=0;w<p.length;w++)p[w]=p[w]/y;f.envMap.value=t.texture,f.samples.value=g,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);let{_lodMax:x}=this;f.dTheta.value=m,f.mipInt.value=x-i;let v=this._sizeLods[r],R=3*v*(r>x-ss?r-x+ss:0),E=4*(this._cubeSize-v);zo(e,R,E,3*v,2*v),c.setRenderTarget(e),c.render(u,Yh)}};function c1(n){let t=[],e=[],i=[],r=n,s=n-ss+1+Om.length;for(let a=0;a<s;a++){let o=Math.pow(2,r);e.push(o);let c=1/o;a>n-ss?c=Om[a-n+ss-1]:a===0&&(c=0),i.push(c);let l=1/(o-2),h=-l,u=1+l,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,m=6,_=3,g=2,p=1,y=new Float32Array(_*m*d),x=new Float32Array(g*m*d),v=new Float32Array(p*m*d);for(let E=0;E<d;E++){let w=E%3*2/3-1,I=E>2?0:-1,M=[w,I,0,w+2/3,I,0,w+2/3,I+1,0,w,I,0,w+2/3,I+1,0,w,I+1,0];y.set(M,_*m*E),x.set(f,g*m*E);let S=[E,E,E,E,E,E];v.set(S,p*m*E)}let R=new Wt;R.setAttribute("position",new Qt(y,_)),R.setAttribute("uv",new Qt(x,g)),R.setAttribute("faceIndex",new Qt(v,p)),t.push(R),r>ss&&r--}return{lodPlanes:t,sizeLods:e,sigmas:i}}function km(n,t,e){let i=new ln(n,t,e);return i.texture.mapping=Ss,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function zo(n,t,e,i,r){n.viewport.set(t,e,i,r),n.scissor.set(t,e,i,r)}function h1(n,t,e){let i=new Float32Array(or),r=new C(0,1,0);return new gn({name:"SphericalGaussianBlur",defines:{n:or,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:bd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ii,depthTest:!1,depthWrite:!1})}function Hm(){return new gn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:bd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ii,depthTest:!1,depthWrite:!1})}function Vm(){return new gn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:bd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ii,depthTest:!1,depthWrite:!1})}function bd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function u1(n){let t=new WeakMap,e=null;function i(o){if(o&&o.isTexture){let c=o.mapping,l=c===ca||c===ha,h=c===ci||c===Ii;if(l||h)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let u=t.get(o);return e===null&&(e=new Ta(n)),u=l?e.fromEquirectangular(o,u):e.fromCubemap(o,u),t.set(o,u),u.texture}else{if(t.has(o))return t.get(o).texture;{let u=o.image;if(l&&u&&u.height>0||h&&u&&r(u)){e===null&&(e=new Ta(n));let f=l?e.fromEquirectangular(o):e.fromCubemap(o);return t.set(o,f),o.addEventListener("dispose",s),f.texture}else return null}}}return o}function r(o){let c=0,l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function s(o){let c=o.target;c.removeEventListener("dispose",s);let l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:a}}function f1(n){let t={};function e(i){if(t[i]!==void 0)return t[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return t[i]=r,r}return{has:function(i){return e(i)!==null},init:function(i){i.isWebGL2?(e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance")):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(i){let r=e(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function d1(n,t,e,i){let r={},s=new WeakMap;function a(u){let f=u.target;f.index!==null&&t.remove(f.index);for(let m in f.attributes)t.remove(f.attributes[m]);for(let m in f.morphAttributes){let _=f.morphAttributes[m];for(let g=0,p=_.length;g<p;g++)t.remove(_[g])}f.removeEventListener("dispose",a),delete r[f.id];let d=s.get(f);d&&(t.remove(d),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return r[f.id]===!0||(f.addEventListener("dispose",a),r[f.id]=!0,e.memory.geometries++),f}function c(u){let f=u.attributes;for(let m in f)t.update(f[m],n.ARRAY_BUFFER);let d=u.morphAttributes;for(let m in d){let _=d[m];for(let g=0,p=_.length;g<p;g++)t.update(_[g],n.ARRAY_BUFFER)}}function l(u){let f=[],d=u.index,m=u.attributes.position,_=0;if(d!==null){let y=d.array;_=d.version;for(let x=0,v=y.length;x<v;x+=3){let R=y[x+0],E=y[x+1],w=y[x+2];f.push(R,E,E,w,w,R)}}else if(m!==void 0){let y=m.array;_=m.version;for(let x=0,v=y.length/3-1;x<v;x+=3){let R=x+0,E=x+1,w=x+2;f.push(R,E,E,w,w,R)}}else return;let g=new(K0(f)?Ea:wa)(f,1);g.version=_;let p=s.get(u);p&&t.remove(p),s.set(u,g)}function h(u){let f=s.get(u);if(f){let d=u.index;d!==null&&f.version<d.version&&l(u)}else l(u);return s.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function p1(n,t,e,i){let r=i.isWebGL2,s;function a(d){s=d}let o,c;function l(d){o=d.type,c=d.bytesPerElement}function h(d,m){n.drawElements(s,m,o,d*c),e.update(m,s,1)}function u(d,m,_){if(_===0)return;let g,p;if(r)g=n,p="drawElementsInstanced";else if(g=t.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",g===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}g[p](s,m,o,d*c,_),e.update(m,s,_)}function f(d,m,_){if(_===0)return;let g=t.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<_;p++)this.render(d[p]/c,m[p]);else{g.multiDrawElementsWEBGL(s,m,0,o,d,0,_);let p=0;for(let y=0;y<_;y++)p+=m[y];e.update(p,s,1)}}this.setMode=a,this.setIndex=l,this.render=h,this.renderInstances=u,this.renderMultiDraw=f}function m1(n){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(e.calls++,a){case n.TRIANGLES:e.triangles+=o*(s/3);break;case n.LINES:e.lines+=o*(s/2);break;case n.LINE_STRIP:e.lines+=o*(s-1);break;case n.LINE_LOOP:e.lines+=o*s;break;case n.POINTS:e.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:r,update:i}}function g1(n,t){return n[0]-t[0]}function _1(n,t){return Math.abs(t[1])-Math.abs(n[1])}function x1(n,t,e){let i={},r=new Float32Array(8),s=new WeakMap,a=new ie,o=[];for(let l=0;l<8;l++)o[l]=[l,0];function c(l,h,u){let f=l.morphTargetInfluences;if(t.isWebGL2===!0){let d=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,m=d!==void 0?d.length:0,_=s.get(h);if(_===void 0||_.count!==m){let L=function(){V.dispose(),s.delete(h),h.removeEventListener("dispose",L)};_!==void 0&&_.texture.dispose();let y=h.morphAttributes.position!==void 0,x=h.morphAttributes.normal!==void 0,v=h.morphAttributes.color!==void 0,R=h.morphAttributes.position||[],E=h.morphAttributes.normal||[],w=h.morphAttributes.color||[],I=0;y===!0&&(I=1),x===!0&&(I=2),v===!0&&(I=3);let M=h.attributes.position.count*I,S=1;M>t.maxTextureSize&&(S=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let D=new Float32Array(M*S*4*m),V=new ds(D,M,S,m);V.type=Sn,V.needsUpdate=!0;let rt=I*4;for(let O=0;O<m;O++){let H=R[O],J=E[O],Z=w[O],X=M*S*4*O;for(let et=0;et<H.count;et++){let nt=et*rt;y===!0&&(a.fromBufferAttribute(H,et),D[X+nt+0]=a.x,D[X+nt+1]=a.y,D[X+nt+2]=a.z,D[X+nt+3]=0),x===!0&&(a.fromBufferAttribute(J,et),D[X+nt+4]=a.x,D[X+nt+5]=a.y,D[X+nt+6]=a.z,D[X+nt+7]=0),v===!0&&(a.fromBufferAttribute(Z,et),D[X+nt+8]=a.x,D[X+nt+9]=a.y,D[X+nt+10]=a.z,D[X+nt+11]=Z.itemSize===4?a.w:1)}}_={count:m,texture:V,size:new $(M,S)},s.set(h,_),h.addEventListener("dispose",L)}let g=0;for(let y=0;y<f.length;y++)g+=f[y];let p=h.morphTargetsRelative?1:1-g;u.getUniforms().setValue(n,"morphTargetBaseInfluence",p),u.getUniforms().setValue(n,"morphTargetInfluences",f),u.getUniforms().setValue(n,"morphTargetsTexture",_.texture,e),u.getUniforms().setValue(n,"morphTargetsTextureSize",_.size)}else{let d=f===void 0?0:f.length,m=i[h.id];if(m===void 0||m.length!==d){m=[];for(let x=0;x<d;x++)m[x]=[x,0];i[h.id]=m}for(let x=0;x<d;x++){let v=m[x];v[0]=x,v[1]=f[x]}m.sort(_1);for(let x=0;x<8;x++)x<d&&m[x][1]?(o[x][0]=m[x][0],o[x][1]=m[x][1]):(o[x][0]=Number.MAX_SAFE_INTEGER,o[x][1]=0);o.sort(g1);let _=h.morphAttributes.position,g=h.morphAttributes.normal,p=0;for(let x=0;x<8;x++){let v=o[x],R=v[0],E=v[1];R!==Number.MAX_SAFE_INTEGER&&E?(_&&h.getAttribute("morphTarget"+x)!==_[R]&&h.setAttribute("morphTarget"+x,_[R]),g&&h.getAttribute("morphNormal"+x)!==g[R]&&h.setAttribute("morphNormal"+x,g[R]),r[x]=E,p+=E):(_&&h.hasAttribute("morphTarget"+x)===!0&&h.deleteAttribute("morphTarget"+x),g&&h.hasAttribute("morphNormal"+x)===!0&&h.deleteAttribute("morphNormal"+x),r[x]=0)}let y=h.morphTargetsRelative?1:1-p;u.getUniforms().setValue(n,"morphTargetBaseInfluence",y),u.getUniforms().setValue(n,"morphTargetInfluences",r)}}return{update:c}}function y1(n,t,e,i){let r=new WeakMap;function s(c){let l=i.render.frame,h=c.geometry,u=t.get(c,h);if(r.get(u)!==l&&(t.update(u),r.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),r.get(c)!==l&&(e.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,l))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==l&&(f.update(),r.set(f,l))}return u}function a(){r=new WeakMap}function o(c){let l=c.target;l.removeEventListener("dispose",o),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:s,dispose:a}}var Ra=class extends be{constructor(t,e,i,r,s,a,o,c,l,h){if(h=h!==void 0?h:Ri,h!==Ri&&h!==dr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===Ri&&(i=jn),i===void 0&&h===dr&&(i=Ti),super(null,r,s,a,o,c,h,i,l),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:_e,this.minFilter=c!==void 0?c:_e,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},i_=new be,r_=new Ra(1,1);r_.compareFunction=Md;var s_=new ds,a_=new Sa,o_=new mr,Gm=[],Wm=[],Xm=new Float32Array(16),qm=new Float32Array(9),Ym=new Float32Array(4);function bs(n,t,e){let i=n[0];if(i<=0||i>0)return n;let r=t*e,s=Gm[r];if(s===void 0&&(s=new Float32Array(r),Gm[r]=s),t!==0){i.toArray(s,0);for(let a=1,o=0;a!==t;++a)o+=e,n[a].toArray(s,o)}return s}function we(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Ee(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function Fc(n,t){let e=Wm[t];e===void 0&&(e=new Int32Array(t),Wm[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function v1(n,t){let e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function M1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;n.uniform2fv(this.addr,t),Ee(e,t)}}function S1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(we(e,t))return;n.uniform3fv(this.addr,t),Ee(e,t)}}function b1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;n.uniform4fv(this.addr,t),Ee(e,t)}}function w1(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(we(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,i))return;Ym.set(i),n.uniformMatrix2fv(this.addr,!1,Ym),Ee(e,i)}}function E1(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(we(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,i))return;qm.set(i),n.uniformMatrix3fv(this.addr,!1,qm),Ee(e,i)}}function A1(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(we(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,i))return;Xm.set(i),n.uniformMatrix4fv(this.addr,!1,Xm),Ee(e,i)}}function T1(n,t){let e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function R1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;n.uniform2iv(this.addr,t),Ee(e,t)}}function C1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(we(e,t))return;n.uniform3iv(this.addr,t),Ee(e,t)}}function I1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;n.uniform4iv(this.addr,t),Ee(e,t)}}function P1(n,t){let e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function L1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;n.uniform2uiv(this.addr,t),Ee(e,t)}}function U1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(we(e,t))return;n.uniform3uiv(this.addr,t),Ee(e,t)}}function D1(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;n.uniform4uiv(this.addr,t),Ee(e,t)}}function N1(n,t,e){let i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s=this.type===n.SAMPLER_2D_SHADOW?r_:i_;e.setTexture2D(t||s,r)}function F1(n,t,e){let i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),e.setTexture3D(t||a_,r)}function O1(n,t,e){let i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),e.setTextureCube(t||o_,r)}function B1(n,t,e){let i=this.cache,r=e.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),e.setTexture2DArray(t||s_,r)}function z1(n){switch(n){case 5126:return v1;case 35664:return M1;case 35665:return S1;case 35666:return b1;case 35674:return w1;case 35675:return E1;case 35676:return A1;case 5124:case 35670:return T1;case 35667:case 35671:return R1;case 35668:case 35672:return C1;case 35669:case 35673:return I1;case 5125:return P1;case 36294:return L1;case 36295:return U1;case 36296:return D1;case 35678:case 36198:case 36298:case 36306:case 35682:return N1;case 35679:case 36299:case 36307:return F1;case 35680:case 36300:case 36308:case 36293:return O1;case 36289:case 36303:case 36311:case 36292:return B1}}function k1(n,t){n.uniform1fv(this.addr,t)}function H1(n,t){let e=bs(t,this.size,2);n.uniform2fv(this.addr,e)}function V1(n,t){let e=bs(t,this.size,3);n.uniform3fv(this.addr,e)}function G1(n,t){let e=bs(t,this.size,4);n.uniform4fv(this.addr,e)}function W1(n,t){let e=bs(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function X1(n,t){let e=bs(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function q1(n,t){let e=bs(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function Y1(n,t){n.uniform1iv(this.addr,t)}function Z1(n,t){n.uniform2iv(this.addr,t)}function $1(n,t){n.uniform3iv(this.addr,t)}function J1(n,t){n.uniform4iv(this.addr,t)}function K1(n,t){n.uniform1uiv(this.addr,t)}function Q1(n,t){n.uniform2uiv(this.addr,t)}function j1(n,t){n.uniform3uiv(this.addr,t)}function tE(n,t){n.uniform4uiv(this.addr,t)}function eE(n,t,e){let i=this.cache,r=t.length,s=Fc(e,r);we(i,s)||(n.uniform1iv(this.addr,s),Ee(i,s));for(let a=0;a!==r;++a)e.setTexture2D(t[a]||i_,s[a])}function nE(n,t,e){let i=this.cache,r=t.length,s=Fc(e,r);we(i,s)||(n.uniform1iv(this.addr,s),Ee(i,s));for(let a=0;a!==r;++a)e.setTexture3D(t[a]||a_,s[a])}function iE(n,t,e){let i=this.cache,r=t.length,s=Fc(e,r);we(i,s)||(n.uniform1iv(this.addr,s),Ee(i,s));for(let a=0;a!==r;++a)e.setTextureCube(t[a]||o_,s[a])}function rE(n,t,e){let i=this.cache,r=t.length,s=Fc(e,r);we(i,s)||(n.uniform1iv(this.addr,s),Ee(i,s));for(let a=0;a!==r;++a)e.setTexture2DArray(t[a]||s_,s[a])}function sE(n){switch(n){case 5126:return k1;case 35664:return H1;case 35665:return V1;case 35666:return G1;case 35674:return W1;case 35675:return X1;case 35676:return q1;case 5124:case 35670:return Y1;case 35667:case 35671:return Z1;case 35668:case 35672:return $1;case 35669:case 35673:return J1;case 5125:return K1;case 36294:return Q1;case 36295:return j1;case 36296:return tE;case 35678:case 36198:case 36298:case 36306:case 35682:return eE;case 35679:case 36299:case 36307:return nE;case 35680:case 36300:case 36308:case 36293:return iE;case 36289:case 36303:case 36311:case 36292:return rE}}var rf=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=z1(e.type)}},sf=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=sE(e.type)}},af=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let r=this.seq;for(let s=0,a=r.length;s!==a;++s){let o=r[s];o.setValue(t,e[o.id],i)}}},Kh=/(\w+)(\])?(\[|\.)?/g;function Zm(n,t){n.seq.push(t),n.map[t.id]=t}function aE(n,t,e){let i=n.name,r=i.length;for(Kh.lastIndex=0;;){let s=Kh.exec(i),a=Kh.lastIndex,o=s[1],c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===r){Zm(e,l===void 0?new rf(o,n,t):new sf(o,n,t));break}else{let u=e.map[o];u===void 0&&(u=new af(o),Zm(e,u)),e=u}}}var cs=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=t.getActiveUniform(e,r),a=t.getUniformLocation(e,s.name);aE(s,a,this)}}setValue(t,e,i,r){let s=this.map[e];s!==void 0&&s.setValue(t,i,r)}setOptional(t,e,i){let r=e[i];r!==void 0&&this.setValue(t,i,r)}static upload(t,e,i,r){for(let s=0,a=e.length;s!==a;++s){let o=e[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,r)}}static seqWithValue(t,e){let i=[];for(let r=0,s=t.length;r!==s;++r){let a=t[r];a.id in e&&i.push(a)}return i}};function $m(n,t,e){let i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}var oE=37297,lE=0;function cE(n,t){let e=n.split(`
`),i=[],r=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let a=r;a<s;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}function hE(n){let t=ne.getPrimaries(ne.workingColorSpace),e=ne.getPrimaries(n),i;switch(t===e?i="":t===xa&&e===_a?i="LinearDisplayP3ToLinearSRGB":t===_a&&e===xa&&(i="LinearSRGBToLinearDisplayP3"),n){case On:case ja:return[i,"LinearTransferOETF"];case Me:case Nc:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function Jm(n,t,e){let i=n.getShaderParameter(t,n.COMPILE_STATUS),r=n.getShaderInfoLog(t).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let a=parseInt(s[1]);return e.toUpperCase()+`

`+r+`

`+cE(n.getShaderSource(t),a)}else return r}function uE(n,t){let e=hE(t);return`vec4 ${n}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function fE(n,t){let e;switch(t){case b0:e="Linear";break;case w0:e="Reinhard";break;case E0:e="OptimizedCineon";break;case A0:e="ACESFilmic";break;case R0:e="AgX";break;case T0:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function dE(n){return[n.extensionDerivatives||n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(as).join(`
`)}function pE(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(as).join(`
`)}function mE(n){let t=[];for(let e in n){let i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function gE(n,t){let e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(t,r),a=s.name,o=1;s.type===n.FLOAT_MAT2&&(o=2),s.type===n.FLOAT_MAT3&&(o=3),s.type===n.FLOAT_MAT4&&(o=4),e[a]={type:s.type,location:n.getAttribLocation(t,a),locationSize:o}}return e}function as(n){return n!==""}function Km(n,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Qm(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var _E=/^[ \t]*#include +<([\w\d./]+)>/gm;function of(n){return n.replace(_E,yE)}var xE=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function yE(n,t){let e=kt[t];if(e===void 0){let i=xE.get(t);if(i!==void 0)e=kt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return of(e)}var vE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function jm(n){return n.replace(vE,ME)}function ME(n,t,e,i){let r="";for(let s=parseInt(t);s<parseInt(e);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function tg(n){let t="precision "+n.precision+` float;
precision `+n.precision+" int;";return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function SE(n){let t="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===hd?t="SHADOWMAP_TYPE_PCF":n.shadowMapType===Kg?t="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Un&&(t="SHADOWMAP_TYPE_VSM"),t}function bE(n){let t="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ci:case Ii:t="ENVMAP_TYPE_CUBE";break;case Ss:t="ENVMAP_TYPE_CUBE_UV";break}return t}function wE(n){let t="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Ii:t="ENVMAP_MODE_REFRACTION";break}return t}function EE(n){let t="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Qa:t="ENVMAP_BLENDING_MULTIPLY";break;case M0:t="ENVMAP_BLENDING_MIX";break;case S0:t="ENVMAP_BLENDING_ADD";break}return t}function AE(n){let t=n.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:i,maxMip:e}}function TE(n,t,e,i){let r=n.getContext(),s=e.defines,a=e.vertexShader,o=e.fragmentShader,c=SE(e),l=bE(e),h=wE(e),u=EE(e),f=AE(e),d=e.isWebGL2?"":dE(e),m=pE(e),_=mE(s),g=r.createProgram(),p,y,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(as).join(`
`),p.length>0&&(p+=`
`),y=[d,"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(as).join(`
`),y.length>0&&(y+=`
`)):(p=[tg(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(as).join(`
`),y=[d,tg(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ri?"#define TONE_MAPPING":"",e.toneMapping!==ri?kt.tonemapping_pars_fragment:"",e.toneMapping!==ri?fE("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",kt.colorspace_pars_fragment,uE("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(as).join(`
`)),a=of(a),a=Km(a,e),a=Qm(a,e),o=of(o),o=Km(o,e),o=Qm(o,e),a=jm(a),o=jm(o),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[m,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,y=["precision mediump sampler2DArray;","#define varying in",e.glslVersion===Xu?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Xu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);let v=x+p+a,R=x+y+o,E=$m(r,r.VERTEX_SHADER,v),w=$m(r,r.FRAGMENT_SHADER,R);r.attachShader(g,E),r.attachShader(g,w),e.index0AttributeName!==void 0?r.bindAttribLocation(g,0,e.index0AttributeName):e.morphTargets===!0&&r.bindAttribLocation(g,0,"position"),r.linkProgram(g);function I(V){if(n.debug.checkShaderErrors){let rt=r.getProgramInfoLog(g).trim(),L=r.getShaderInfoLog(E).trim(),O=r.getShaderInfoLog(w).trim(),H=!0,J=!0;if(r.getProgramParameter(g,r.LINK_STATUS)===!1)if(H=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,g,E,w);else{let Z=Jm(r,E,"vertex"),X=Jm(r,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(g,r.VALIDATE_STATUS)+`

Program Info Log: `+rt+`
`+Z+`
`+X)}else rt!==""?console.warn("THREE.WebGLProgram: Program Info Log:",rt):(L===""||O==="")&&(J=!1);J&&(V.diagnostics={runnable:H,programLog:rt,vertexShader:{log:L,prefix:p},fragmentShader:{log:O,prefix:y}})}r.deleteShader(E),r.deleteShader(w),M=new cs(r,g),S=gE(r,g)}let M;this.getUniforms=function(){return M===void 0&&I(this),M};let S;this.getAttributes=function(){return S===void 0&&I(this),S};let D=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=r.getProgramParameter(g,oE)),D},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(g),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=lE++,this.cacheKey=t,this.usedTimes=1,this.program=g,this.vertexShader=E,this.fragmentShader=w,this}var RE=0,lf=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,i=t.fragmentShader,r=this._getShaderStage(e),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(t);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new cf(t),e.set(t,i)),i}},cf=class{constructor(t){this.id=RE++,this.code=t,this.usedTimes=0}};function CE(n,t,e,i,r,s,a){let o=new ps,c=new lf,l=[],h=r.isWebGL2,u=r.logarithmicDepthBuffer,f=r.vertexTextures,d=r.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(M){return M===0?"uv":`uv${M}`}function g(M,S,D,V,rt){let L=V.fog,O=rt.geometry,H=M.isMeshStandardMaterial?V.environment:null,J=(M.isMeshStandardMaterial?e:t).get(M.envMap||H),Z=J&&J.mapping===Ss?J.image.height:null,X=m[M.type];M.precision!==null&&(d=r.getMaxPrecision(M.precision),d!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",d,"instead."));let et=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,nt=et!==void 0?et.length:0,ft=0;O.morphAttributes.position!==void 0&&(ft=1),O.morphAttributes.normal!==void 0&&(ft=2),O.morphAttributes.color!==void 0&&(ft=3);let W,Q,dt,St;if(X){let Ge=Mn[X];W=Ge.vertexShader,Q=Ge.fragmentShader}else W=M.vertexShader,Q=M.fragmentShader,c.update(M),dt=c.getVertexShaderID(M),St=c.getFragmentShaderID(M);let _t=n.getRenderTarget(),It=rt.isInstancedMesh===!0,Ft=rt.isBatchedMesh===!0,bt=!!M.map,Dt=!!M.matcap,P=!!J,at=!!M.aoMap,Y=!!M.lightMap,st=!!M.bumpMap,q=!!M.normalMap,Et=!!M.displacementMap,mt=!!M.emissiveMap,A=!!M.metalnessMap,b=!!M.roughnessMap,F=M.anisotropy>0,it=M.clearcoat>0,j=M.iridescence>0,K=M.sheen>0,Mt=M.transmission>0,ct=F&&!!M.anisotropyMap,xt=it&&!!M.clearcoatMap,Tt=it&&!!M.clearcoatNormalMap,Bt=it&&!!M.clearcoatRoughnessMap,tt=j&&!!M.iridescenceMap,Jt=j&&!!M.iridescenceThicknessMap,Zt=K&&!!M.sheenColorMap,Nt=K&&!!M.sheenRoughnessMap,At=!!M.specularMap,vt=!!M.specularColorMap,Vt=!!M.specularIntensityMap,te=Mt&&!!M.transmissionMap,ue=Mt&&!!M.thicknessMap,qt=!!M.gradientMap,lt=!!M.alphaMap,U=M.alphaTest>0,ht=!!M.alphaHash,ut=!!M.extensions,Pt=!!O.attributes.uv1,Rt=!!O.attributes.uv2,re=!!O.attributes.uv3,se=ri;return M.toneMapped&&(_t===null||_t.isXRRenderTarget===!0)&&(se=n.toneMapping),{isWebGL2:h,shaderID:X,shaderType:M.type,shaderName:M.name,vertexShader:W,fragmentShader:Q,defines:M.defines,customVertexShaderID:dt,customFragmentShaderID:St,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:d,batching:Ft,instancing:It,instancingColor:It&&rt.instanceColor!==null,supportsVertexTextures:f,outputColorSpace:_t===null?n.outputColorSpace:_t.isXRRenderTarget===!0?_t.texture.colorSpace:On,map:bt,matcap:Dt,envMap:P,envMapMode:P&&J.mapping,envMapCubeUVHeight:Z,aoMap:at,lightMap:Y,bumpMap:st,normalMap:q,displacementMap:f&&Et,emissiveMap:mt,normalMapObjectSpace:q&&M.normalMapType===G0,normalMapTangentSpace:q&&M.normalMapType===Fi,metalnessMap:A,roughnessMap:b,anisotropy:F,anisotropyMap:ct,clearcoat:it,clearcoatMap:xt,clearcoatNormalMap:Tt,clearcoatRoughnessMap:Bt,iridescence:j,iridescenceMap:tt,iridescenceThicknessMap:Jt,sheen:K,sheenColorMap:Zt,sheenRoughnessMap:Nt,specularMap:At,specularColorMap:vt,specularIntensityMap:Vt,transmission:Mt,transmissionMap:te,thicknessMap:ue,gradientMap:qt,opaque:M.transparent===!1&&M.blending===ur,alphaMap:lt,alphaTest:U,alphaHash:ht,combine:M.combine,mapUv:bt&&_(M.map.channel),aoMapUv:at&&_(M.aoMap.channel),lightMapUv:Y&&_(M.lightMap.channel),bumpMapUv:st&&_(M.bumpMap.channel),normalMapUv:q&&_(M.normalMap.channel),displacementMapUv:Et&&_(M.displacementMap.channel),emissiveMapUv:mt&&_(M.emissiveMap.channel),metalnessMapUv:A&&_(M.metalnessMap.channel),roughnessMapUv:b&&_(M.roughnessMap.channel),anisotropyMapUv:ct&&_(M.anisotropyMap.channel),clearcoatMapUv:xt&&_(M.clearcoatMap.channel),clearcoatNormalMapUv:Tt&&_(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Bt&&_(M.clearcoatRoughnessMap.channel),iridescenceMapUv:tt&&_(M.iridescenceMap.channel),iridescenceThicknessMapUv:Jt&&_(M.iridescenceThicknessMap.channel),sheenColorMapUv:Zt&&_(M.sheenColorMap.channel),sheenRoughnessMapUv:Nt&&_(M.sheenRoughnessMap.channel),specularMapUv:At&&_(M.specularMap.channel),specularColorMapUv:vt&&_(M.specularColorMap.channel),specularIntensityMapUv:Vt&&_(M.specularIntensityMap.channel),transmissionMapUv:te&&_(M.transmissionMap.channel),thicknessMapUv:ue&&_(M.thicknessMap.channel),alphaMapUv:lt&&_(M.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(q||F),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,vertexUv1s:Pt,vertexUv2s:Rt,vertexUv3s:re,pointsUvs:rt.isPoints===!0&&!!O.attributes.uv&&(bt||lt),fog:!!L,useFog:M.fog===!0,fogExp2:L&&L.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:rt.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:nt,morphTextureStride:ft,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:n.shadowMap.enabled&&D.length>0,shadowMapType:n.shadowMap.type,toneMapping:se,useLegacyLights:n._useLegacyLights,decodeVideoTexture:bt&&M.map.isVideoTexture===!0&&ne.getTransfer(M.map.colorSpace)===oe,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Nn,flipSided:M.side===Ze,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionDerivatives:ut&&M.extensions.derivatives===!0,extensionFragDepth:ut&&M.extensions.fragDepth===!0,extensionDrawBuffers:ut&&M.extensions.drawBuffers===!0,extensionShaderTextureLOD:ut&&M.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ut&&M.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()}}function p(M){let S=[];if(M.shaderID?S.push(M.shaderID):(S.push(M.customVertexShaderID),S.push(M.customFragmentShaderID)),M.defines!==void 0)for(let D in M.defines)S.push(D),S.push(M.defines[D]);return M.isRawShaderMaterial===!1&&(y(S,M),x(S,M),S.push(n.outputColorSpace)),S.push(M.customProgramCacheKey),S.join()}function y(M,S){M.push(S.precision),M.push(S.outputColorSpace),M.push(S.envMapMode),M.push(S.envMapCubeUVHeight),M.push(S.mapUv),M.push(S.alphaMapUv),M.push(S.lightMapUv),M.push(S.aoMapUv),M.push(S.bumpMapUv),M.push(S.normalMapUv),M.push(S.displacementMapUv),M.push(S.emissiveMapUv),M.push(S.metalnessMapUv),M.push(S.roughnessMapUv),M.push(S.anisotropyMapUv),M.push(S.clearcoatMapUv),M.push(S.clearcoatNormalMapUv),M.push(S.clearcoatRoughnessMapUv),M.push(S.iridescenceMapUv),M.push(S.iridescenceThicknessMapUv),M.push(S.sheenColorMapUv),M.push(S.sheenRoughnessMapUv),M.push(S.specularMapUv),M.push(S.specularColorMapUv),M.push(S.specularIntensityMapUv),M.push(S.transmissionMapUv),M.push(S.thicknessMapUv),M.push(S.combine),M.push(S.fogExp2),M.push(S.sizeAttenuation),M.push(S.morphTargetsCount),M.push(S.morphAttributeCount),M.push(S.numDirLights),M.push(S.numPointLights),M.push(S.numSpotLights),M.push(S.numSpotLightMaps),M.push(S.numHemiLights),M.push(S.numRectAreaLights),M.push(S.numDirLightShadows),M.push(S.numPointLightShadows),M.push(S.numSpotLightShadows),M.push(S.numSpotLightShadowsWithMaps),M.push(S.numLightProbes),M.push(S.shadowMapType),M.push(S.toneMapping),M.push(S.numClippingPlanes),M.push(S.numClipIntersection),M.push(S.depthPacking)}function x(M,S){o.disableAll(),S.isWebGL2&&o.enable(0),S.supportsVertexTextures&&o.enable(1),S.instancing&&o.enable(2),S.instancingColor&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),M.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.skinning&&o.enable(4),S.morphTargets&&o.enable(5),S.morphNormals&&o.enable(6),S.morphColors&&o.enable(7),S.premultipliedAlpha&&o.enable(8),S.shadowMapEnabled&&o.enable(9),S.useLegacyLights&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),M.push(o.mask)}function v(M){let S=m[M.type],D;if(S){let V=Mn[S];D=e_.clone(V.uniforms)}else D=M.uniforms;return D}function R(M,S){let D;for(let V=0,rt=l.length;V<rt;V++){let L=l[V];if(L.cacheKey===S){D=L,++D.usedTimes;break}}return D===void 0&&(D=new TE(n,S,M,s),l.push(D)),D}function E(M){if(--M.usedTimes===0){let S=l.indexOf(M);l[S]=l[l.length-1],l.pop(),M.destroy()}}function w(M){c.remove(M)}function I(){c.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:v,acquireProgram:R,releaseProgram:E,releaseShaderCache:w,programs:l,dispose:I}}function IE(){let n=new WeakMap;function t(s){let a=n.get(s);return a===void 0&&(a={},n.set(s,a)),a}function e(s){n.delete(s)}function i(s,a,o){n.get(s)[a]=o}function r(){n=new WeakMap}return{get:t,remove:e,update:i,dispose:r}}function PE(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.z!==t.z?n.z-t.z:n.id-t.id}function eg(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function ng(){let n=[],t=0,e=[],i=[],r=[];function s(){t=0,e.length=0,i.length=0,r.length=0}function a(u,f,d,m,_,g){let p=n[t];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:m,renderOrder:u.renderOrder,z:_,group:g},n[t]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=m,p.renderOrder=u.renderOrder,p.z=_,p.group=g),t++,p}function o(u,f,d,m,_,g){let p=a(u,f,d,m,_,g);d.transmission>0?i.push(p):d.transparent===!0?r.push(p):e.push(p)}function c(u,f,d,m,_,g){let p=a(u,f,d,m,_,g);d.transmission>0?i.unshift(p):d.transparent===!0?r.unshift(p):e.unshift(p)}function l(u,f){e.length>1&&e.sort(u||PE),i.length>1&&i.sort(f||eg),r.length>1&&r.sort(f||eg)}function h(){for(let u=t,f=n.length;u<f;u++){let d=n[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:i,transparent:r,init:s,push:o,unshift:c,finish:h,sort:l}}function LE(){let n=new WeakMap;function t(i,r){let s=n.get(i),a;return s===void 0?(a=new ng,n.set(i,[a])):r>=s.length?(a=new ng,s.push(a)):a=s[r],a}function e(){n=new WeakMap}return{get:t,dispose:e}}function UE(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new C,color:new pt};break;case"SpotLight":e={position:new C,direction:new C,color:new pt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new C,color:new pt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new C,skyColor:new pt,groundColor:new pt};break;case"RectAreaLight":e={color:new pt,position:new C,halfWidth:new C,halfHeight:new C};break}return n[t.id]=e,e}}}function DE(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}var NE=0;function FE(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function OE(n,t){let e=new UE,i=DE(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)r.probe.push(new C);let s=new C,a=new Lt,o=new Lt;function c(h,u){let f=0,d=0,m=0;for(let V=0;V<9;V++)r.probe[V].set(0,0,0);let _=0,g=0,p=0,y=0,x=0,v=0,R=0,E=0,w=0,I=0,M=0;h.sort(FE);let S=u===!0?Math.PI:1;for(let V=0,rt=h.length;V<rt;V++){let L=h[V],O=L.color,H=L.intensity,J=L.distance,Z=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)f+=O.r*H*S,d+=O.g*H*S,m+=O.b*H*S;else if(L.isLightProbe){for(let X=0;X<9;X++)r.probe[X].addScaledVector(L.sh.coefficients[X],H);M++}else if(L.isDirectionalLight){let X=e.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity*S),L.castShadow){let et=L.shadow,nt=i.get(L);nt.shadowBias=et.bias,nt.shadowNormalBias=et.normalBias,nt.shadowRadius=et.radius,nt.shadowMapSize=et.mapSize,r.directionalShadow[_]=nt,r.directionalShadowMap[_]=Z,r.directionalShadowMatrix[_]=L.shadow.matrix,v++}r.directional[_]=X,_++}else if(L.isSpotLight){let X=e.get(L);X.position.setFromMatrixPosition(L.matrixWorld),X.color.copy(O).multiplyScalar(H*S),X.distance=J,X.coneCos=Math.cos(L.angle),X.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),X.decay=L.decay,r.spot[p]=X;let et=L.shadow;if(L.map&&(r.spotLightMap[w]=L.map,w++,et.updateMatrices(L),L.castShadow&&I++),r.spotLightMatrix[p]=et.matrix,L.castShadow){let nt=i.get(L);nt.shadowBias=et.bias,nt.shadowNormalBias=et.normalBias,nt.shadowRadius=et.radius,nt.shadowMapSize=et.mapSize,r.spotShadow[p]=nt,r.spotShadowMap[p]=Z,E++}p++}else if(L.isRectAreaLight){let X=e.get(L);X.color.copy(O).multiplyScalar(H),X.halfWidth.set(L.width*.5,0,0),X.halfHeight.set(0,L.height*.5,0),r.rectArea[y]=X,y++}else if(L.isPointLight){let X=e.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity*S),X.distance=L.distance,X.decay=L.decay,L.castShadow){let et=L.shadow,nt=i.get(L);nt.shadowBias=et.bias,nt.shadowNormalBias=et.normalBias,nt.shadowRadius=et.radius,nt.shadowMapSize=et.mapSize,nt.shadowCameraNear=et.camera.near,nt.shadowCameraFar=et.camera.far,r.pointShadow[g]=nt,r.pointShadowMap[g]=Z,r.pointShadowMatrix[g]=L.shadow.matrix,R++}r.point[g]=X,g++}else if(L.isHemisphereLight){let X=e.get(L);X.skyColor.copy(L.color).multiplyScalar(H*S),X.groundColor.copy(L.groundColor).multiplyScalar(H*S),r.hemi[x]=X,x++}}y>0&&(t.isWebGL2?n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ot.LTC_FLOAT_1,r.rectAreaLTC2=ot.LTC_FLOAT_2):(r.rectAreaLTC1=ot.LTC_HALF_1,r.rectAreaLTC2=ot.LTC_HALF_2):n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ot.LTC_FLOAT_1,r.rectAreaLTC2=ot.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=ot.LTC_HALF_1,r.rectAreaLTC2=ot.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=f,r.ambient[1]=d,r.ambient[2]=m;let D=r.hash;(D.directionalLength!==_||D.pointLength!==g||D.spotLength!==p||D.rectAreaLength!==y||D.hemiLength!==x||D.numDirectionalShadows!==v||D.numPointShadows!==R||D.numSpotShadows!==E||D.numSpotMaps!==w||D.numLightProbes!==M)&&(r.directional.length=_,r.spot.length=p,r.rectArea.length=y,r.point.length=g,r.hemi.length=x,r.directionalShadow.length=v,r.directionalShadowMap.length=v,r.pointShadow.length=R,r.pointShadowMap.length=R,r.spotShadow.length=E,r.spotShadowMap.length=E,r.directionalShadowMatrix.length=v,r.pointShadowMatrix.length=R,r.spotLightMatrix.length=E+w-I,r.spotLightMap.length=w,r.numSpotLightShadowsWithMaps=I,r.numLightProbes=M,D.directionalLength=_,D.pointLength=g,D.spotLength=p,D.rectAreaLength=y,D.hemiLength=x,D.numDirectionalShadows=v,D.numPointShadows=R,D.numSpotShadows=E,D.numSpotMaps=w,D.numLightProbes=M,r.version=NE++)}function l(h,u){let f=0,d=0,m=0,_=0,g=0,p=u.matrixWorldInverse;for(let y=0,x=h.length;y<x;y++){let v=h[y];if(v.isDirectionalLight){let R=r.directional[f];R.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(p),f++}else if(v.isSpotLight){let R=r.spot[m];R.position.setFromMatrixPosition(v.matrixWorld),R.position.applyMatrix4(p),R.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(p),m++}else if(v.isRectAreaLight){let R=r.rectArea[_];R.position.setFromMatrixPosition(v.matrixWorld),R.position.applyMatrix4(p),o.identity(),a.copy(v.matrixWorld),a.premultiply(p),o.extractRotation(a),R.halfWidth.set(v.width*.5,0,0),R.halfHeight.set(0,v.height*.5,0),R.halfWidth.applyMatrix4(o),R.halfHeight.applyMatrix4(o),_++}else if(v.isPointLight){let R=r.point[d];R.position.setFromMatrixPosition(v.matrixWorld),R.position.applyMatrix4(p),d++}else if(v.isHemisphereLight){let R=r.hemi[g];R.direction.setFromMatrixPosition(v.matrixWorld),R.direction.transformDirection(p),g++}}}return{setup:c,setupView:l,state:r}}function ig(n,t){let e=new OE(n,t),i=[],r=[];function s(){i.length=0,r.length=0}function a(u){i.push(u)}function o(u){r.push(u)}function c(u){e.setup(i,u)}function l(u){e.setupView(i,u)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:e},setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function BE(n,t){let e=new WeakMap;function i(s,a=0){let o=e.get(s),c;return o===void 0?(c=new ig(n,t),e.set(s,[c])):a>=o.length?(c=new ig(n,t),o.push(c)):c=o[a],c}function r(){e=new WeakMap}return{get:i,dispose:r}}var Ca=class extends Le{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=H0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Ia=class extends Le{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},zE=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,kE=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function HE(n,t,e){let i=new gr,r=new $,s=new $,a=new ie,o=new Ca({depthPacking:V0}),c=new Ia,l={},h=e.maxTextureSize,u={[li]:Ze,[Ze]:li,[Nn]:Nn},f=new gn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $},radius:{value:4}},vertexShader:zE,fragmentShader:kE}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let m=new Wt;m.setAttribute("position",new Qt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new ye(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=hd;let p=this.type;this.render=function(E,w,I){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||E.length===0)return;let M=n.getRenderTarget(),S=n.getActiveCubeFace(),D=n.getActiveMipmapLevel(),V=n.state;V.setBlending(ii),V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let rt=p!==Un&&this.type===Un,L=p===Un&&this.type!==Un;for(let O=0,H=E.length;O<H;O++){let J=E[O],Z=J.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",J,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;r.copy(Z.mapSize);let X=Z.getFrameExtents();if(r.multiply(X),s.copy(Z.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/X.x),r.x=s.x*X.x,Z.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/X.y),r.y=s.y*X.y,Z.mapSize.y=s.y)),Z.map===null||rt===!0||L===!0){let nt=this.type!==Un?{minFilter:_e,magFilter:_e}:{};Z.map!==null&&Z.map.dispose(),Z.map=new ln(r.x,r.y,nt),Z.map.texture.name=J.name+".shadowMap",Z.camera.updateProjectionMatrix()}n.setRenderTarget(Z.map),n.clear();let et=Z.getViewportCount();for(let nt=0;nt<et;nt++){let ft=Z.getViewport(nt);a.set(s.x*ft.x,s.y*ft.y,s.x*ft.z,s.y*ft.w),V.viewport(a),Z.updateMatrices(J,nt),i=Z.getFrustum(),v(w,I,Z.camera,J,this.type)}Z.isPointLightShadow!==!0&&this.type===Un&&y(Z,I),Z.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(M,S,D)};function y(E,w){let I=t.update(_);f.defines.VSM_SAMPLES!==E.blurSamples&&(f.defines.VSM_SAMPLES=E.blurSamples,d.defines.VSM_SAMPLES=E.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new ln(r.x,r.y)),f.uniforms.shadow_pass.value=E.map.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,n.setRenderTarget(E.mapPass),n.clear(),n.renderBufferDirect(w,null,I,f,_,null),d.uniforms.shadow_pass.value=E.mapPass.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,n.setRenderTarget(E.map),n.clear(),n.renderBufferDirect(w,null,I,d,_,null)}function x(E,w,I,M){let S=null,D=I.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(D!==void 0)S=D;else if(S=I.isPointLight===!0?c:o,n.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){let V=S.uuid,rt=w.uuid,L=l[V];L===void 0&&(L={},l[V]=L);let O=L[rt];O===void 0&&(O=S.clone(),L[rt]=O,w.addEventListener("dispose",R)),S=O}if(S.visible=w.visible,S.wireframe=w.wireframe,M===Un?S.side=w.shadowSide!==null?w.shadowSide:w.side:S.side=w.shadowSide!==null?w.shadowSide:u[w.side],S.alphaMap=w.alphaMap,S.alphaTest=w.alphaTest,S.map=w.map,S.clipShadows=w.clipShadows,S.clippingPlanes=w.clippingPlanes,S.clipIntersection=w.clipIntersection,S.displacementMap=w.displacementMap,S.displacementScale=w.displacementScale,S.displacementBias=w.displacementBias,S.wireframeLinewidth=w.wireframeLinewidth,S.linewidth=w.linewidth,I.isPointLight===!0&&S.isMeshDistanceMaterial===!0){let V=n.properties.get(S);V.light=I}return S}function v(E,w,I,M,S){if(E.visible===!1)return;if(E.layers.test(w.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&S===Un)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,E.matrixWorld);let rt=t.update(E),L=E.material;if(Array.isArray(L)){let O=rt.groups;for(let H=0,J=O.length;H<J;H++){let Z=O[H],X=L[Z.materialIndex];if(X&&X.visible){let et=x(E,X,M,S);E.onBeforeShadow(n,E,w,I,rt,et,Z),n.renderBufferDirect(I,null,rt,et,E,Z),E.onAfterShadow(n,E,w,I,rt,et,Z)}}}else if(L.visible){let O=x(E,L,M,S);E.onBeforeShadow(n,E,w,I,rt,O,null),n.renderBufferDirect(I,null,rt,O,E,null),E.onAfterShadow(n,E,w,I,rt,O,null)}}let V=E.children;for(let rt=0,L=V.length;rt<L;rt++)v(V[rt],w,I,M,S)}function R(E){E.target.removeEventListener("dispose",R);for(let I in l){let M=l[I],S=E.target.uuid;S in M&&(M[S].dispose(),delete M[S])}}}function VE(n,t,e){let i=e.isWebGL2;function r(){let U=!1,ht=new ie,ut=null,Pt=new ie(0,0,0,0);return{setMask:function(Rt){ut!==Rt&&!U&&(n.colorMask(Rt,Rt,Rt,Rt),ut=Rt)},setLocked:function(Rt){U=Rt},setClear:function(Rt,re,se,Ae,Ge){Ge===!0&&(Rt*=Ae,re*=Ae,se*=Ae),ht.set(Rt,re,se,Ae),Pt.equals(ht)===!1&&(n.clearColor(Rt,re,se,Ae),Pt.copy(ht))},reset:function(){U=!1,ut=null,Pt.set(-1,0,0,0)}}}function s(){let U=!1,ht=null,ut=null,Pt=null;return{setTest:function(Rt){Rt?Ft(n.DEPTH_TEST):bt(n.DEPTH_TEST)},setMask:function(Rt){ht!==Rt&&!U&&(n.depthMask(Rt),ht=Rt)},setFunc:function(Rt){if(ut!==Rt){switch(Rt){case p0:n.depthFunc(n.NEVER);break;case m0:n.depthFunc(n.ALWAYS);break;case g0:n.depthFunc(n.LESS);break;case la:n.depthFunc(n.LEQUAL);break;case _0:n.depthFunc(n.EQUAL);break;case x0:n.depthFunc(n.GEQUAL);break;case y0:n.depthFunc(n.GREATER);break;case v0:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ut=Rt}},setLocked:function(Rt){U=Rt},setClear:function(Rt){Pt!==Rt&&(n.clearDepth(Rt),Pt=Rt)},reset:function(){U=!1,ht=null,ut=null,Pt=null}}}function a(){let U=!1,ht=null,ut=null,Pt=null,Rt=null,re=null,se=null,Ae=null,Ge=null;return{setTest:function(ae){U||(ae?Ft(n.STENCIL_TEST):bt(n.STENCIL_TEST))},setMask:function(ae){ht!==ae&&!U&&(n.stencilMask(ae),ht=ae)},setFunc:function(ae,We,An){(ut!==ae||Pt!==We||Rt!==An)&&(n.stencilFunc(ae,We,An),ut=ae,Pt=We,Rt=An)},setOp:function(ae,We,An){(re!==ae||se!==We||Ae!==An)&&(n.stencilOp(ae,We,An),re=ae,se=We,Ae=An)},setLocked:function(ae){U=ae},setClear:function(ae){Ge!==ae&&(n.clearStencil(ae),Ge=ae)},reset:function(){U=!1,ht=null,ut=null,Pt=null,Rt=null,re=null,se=null,Ae=null,Ge=null}}}let o=new r,c=new s,l=new a,h=new WeakMap,u=new WeakMap,f={},d={},m=new WeakMap,_=[],g=null,p=!1,y=null,x=null,v=null,R=null,E=null,w=null,I=null,M=new pt(0,0,0),S=0,D=!1,V=null,rt=null,L=null,O=null,H=null,J=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,X=0,et=n.getParameter(n.VERSION);et.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(et)[1]),Z=X>=1):et.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(et)[1]),Z=X>=2);let nt=null,ft={},W=n.getParameter(n.SCISSOR_BOX),Q=n.getParameter(n.VIEWPORT),dt=new ie().fromArray(W),St=new ie().fromArray(Q);function _t(U,ht,ut,Pt){let Rt=new Uint8Array(4),re=n.createTexture();n.bindTexture(U,re),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let se=0;se<ut;se++)i&&(U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY)?n.texImage3D(ht,0,n.RGBA,1,1,Pt,0,n.RGBA,n.UNSIGNED_BYTE,Rt):n.texImage2D(ht+se,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Rt);return re}let It={};It[n.TEXTURE_2D]=_t(n.TEXTURE_2D,n.TEXTURE_2D,1),It[n.TEXTURE_CUBE_MAP]=_t(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(It[n.TEXTURE_2D_ARRAY]=_t(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),It[n.TEXTURE_3D]=_t(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),c.setClear(1),l.setClear(0),Ft(n.DEPTH_TEST),c.setFunc(la),mt(!1),A(fu),Ft(n.CULL_FACE),q(ii);function Ft(U){f[U]!==!0&&(n.enable(U),f[U]=!0)}function bt(U){f[U]!==!1&&(n.disable(U),f[U]=!1)}function Dt(U,ht){return d[U]!==ht?(n.bindFramebuffer(U,ht),d[U]=ht,i&&(U===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=ht),U===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=ht)),!0):!1}function P(U,ht){let ut=_,Pt=!1;if(U)if(ut=m.get(ht),ut===void 0&&(ut=[],m.set(ht,ut)),U.isWebGLMultipleRenderTargets){let Rt=U.texture;if(ut.length!==Rt.length||ut[0]!==n.COLOR_ATTACHMENT0){for(let re=0,se=Rt.length;re<se;re++)ut[re]=n.COLOR_ATTACHMENT0+re;ut.length=Rt.length,Pt=!0}}else ut[0]!==n.COLOR_ATTACHMENT0&&(ut[0]=n.COLOR_ATTACHMENT0,Pt=!0);else ut[0]!==n.BACK&&(ut[0]=n.BACK,Pt=!0);Pt&&(e.isWebGL2?n.drawBuffers(ut):t.get("WEBGL_draw_buffers").drawBuffersWEBGL(ut))}function at(U){return g!==U?(n.useProgram(U),g=U,!0):!1}let Y={[Ei]:n.FUNC_ADD,[jg]:n.FUNC_SUBTRACT,[t0]:n.FUNC_REVERSE_SUBTRACT};if(i)Y[gu]=n.MIN,Y[_u]=n.MAX;else{let U=t.get("EXT_blend_minmax");U!==null&&(Y[gu]=U.MIN_EXT,Y[_u]=U.MAX_EXT)}let st={[e0]:n.ZERO,[n0]:n.ONE,[i0]:n.SRC_COLOR,[gl]:n.SRC_ALPHA,[c0]:n.SRC_ALPHA_SATURATE,[o0]:n.DST_COLOR,[s0]:n.DST_ALPHA,[r0]:n.ONE_MINUS_SRC_COLOR,[_l]:n.ONE_MINUS_SRC_ALPHA,[l0]:n.ONE_MINUS_DST_COLOR,[a0]:n.ONE_MINUS_DST_ALPHA,[h0]:n.CONSTANT_COLOR,[u0]:n.ONE_MINUS_CONSTANT_COLOR,[f0]:n.CONSTANT_ALPHA,[d0]:n.ONE_MINUS_CONSTANT_ALPHA};function q(U,ht,ut,Pt,Rt,re,se,Ae,Ge,ae){if(U===ii){p===!0&&(bt(n.BLEND),p=!1);return}if(p===!1&&(Ft(n.BLEND),p=!0),U!==Qg){if(U!==y||ae!==D){if((x!==Ei||E!==Ei)&&(n.blendEquation(n.FUNC_ADD),x=Ei,E=Ei),ae)switch(U){case ur:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case du:n.blendFunc(n.ONE,n.ONE);break;case pu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case mu:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case ur:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case du:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case pu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case mu:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}v=null,R=null,w=null,I=null,M.set(0,0,0),S=0,y=U,D=ae}return}Rt=Rt||ht,re=re||ut,se=se||Pt,(ht!==x||Rt!==E)&&(n.blendEquationSeparate(Y[ht],Y[Rt]),x=ht,E=Rt),(ut!==v||Pt!==R||re!==w||se!==I)&&(n.blendFuncSeparate(st[ut],st[Pt],st[re],st[se]),v=ut,R=Pt,w=re,I=se),(Ae.equals(M)===!1||Ge!==S)&&(n.blendColor(Ae.r,Ae.g,Ae.b,Ge),M.copy(Ae),S=Ge),y=U,D=!1}function Et(U,ht){U.side===Nn?bt(n.CULL_FACE):Ft(n.CULL_FACE);let ut=U.side===Ze;ht&&(ut=!ut),mt(ut),U.blending===ur&&U.transparent===!1?q(ii):q(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),c.setFunc(U.depthFunc),c.setTest(U.depthTest),c.setMask(U.depthWrite),o.setMask(U.colorWrite);let Pt=U.stencilWrite;l.setTest(Pt),Pt&&(l.setMask(U.stencilWriteMask),l.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),l.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),F(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?Ft(n.SAMPLE_ALPHA_TO_COVERAGE):bt(n.SAMPLE_ALPHA_TO_COVERAGE)}function mt(U){V!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),V=U)}function A(U){U!==$g?(Ft(n.CULL_FACE),U!==rt&&(U===fu?n.cullFace(n.BACK):U===Jg?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):bt(n.CULL_FACE),rt=U}function b(U){U!==L&&(Z&&n.lineWidth(U),L=U)}function F(U,ht,ut){U?(Ft(n.POLYGON_OFFSET_FILL),(O!==ht||H!==ut)&&(n.polygonOffset(ht,ut),O=ht,H=ut)):bt(n.POLYGON_OFFSET_FILL)}function it(U){U?Ft(n.SCISSOR_TEST):bt(n.SCISSOR_TEST)}function j(U){U===void 0&&(U=n.TEXTURE0+J-1),nt!==U&&(n.activeTexture(U),nt=U)}function K(U,ht,ut){ut===void 0&&(nt===null?ut=n.TEXTURE0+J-1:ut=nt);let Pt=ft[ut];Pt===void 0&&(Pt={type:void 0,texture:void 0},ft[ut]=Pt),(Pt.type!==U||Pt.texture!==ht)&&(nt!==ut&&(n.activeTexture(ut),nt=ut),n.bindTexture(U,ht||It[U]),Pt.type=U,Pt.texture=ht)}function Mt(){let U=ft[nt];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function ct(){try{n.compressedTexImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function xt(){try{n.compressedTexImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Tt(){try{n.texSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Bt(){try{n.texSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function tt(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Jt(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Zt(){try{n.texStorage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Nt(){try{n.texStorage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function At(){try{n.texImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function vt(){try{n.texImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Vt(U){dt.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),dt.copy(U))}function te(U){St.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),St.copy(U))}function ue(U,ht){let ut=u.get(ht);ut===void 0&&(ut=new WeakMap,u.set(ht,ut));let Pt=ut.get(U);Pt===void 0&&(Pt=n.getUniformBlockIndex(ht,U.name),ut.set(U,Pt))}function qt(U,ht){let Pt=u.get(ht).get(U);h.get(ht)!==Pt&&(n.uniformBlockBinding(ht,Pt,U.__bindingPointIndex),h.set(ht,Pt))}function lt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),f={},nt=null,ft={},d={},m=new WeakMap,_=[],g=null,p=!1,y=null,x=null,v=null,R=null,E=null,w=null,I=null,M=new pt(0,0,0),S=0,D=!1,V=null,rt=null,L=null,O=null,H=null,dt.set(0,0,n.canvas.width,n.canvas.height),St.set(0,0,n.canvas.width,n.canvas.height),o.reset(),c.reset(),l.reset()}return{buffers:{color:o,depth:c,stencil:l},enable:Ft,disable:bt,bindFramebuffer:Dt,drawBuffers:P,useProgram:at,setBlending:q,setMaterial:Et,setFlipSided:mt,setCullFace:A,setLineWidth:b,setPolygonOffset:F,setScissorTest:it,activeTexture:j,bindTexture:K,unbindTexture:Mt,compressedTexImage2D:ct,compressedTexImage3D:xt,texImage2D:At,texImage3D:vt,updateUBOMapping:ue,uniformBlockBinding:qt,texStorage2D:Zt,texStorage3D:Nt,texSubImage2D:Tt,texSubImage3D:Bt,compressedTexSubImage2D:tt,compressedTexSubImage3D:Jt,scissor:Vt,viewport:te,reset:lt}}function GE(n,t,e,i,r,s,a){let o=r.isWebGL2,c=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap,u,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(A,b){return d?new OffscreenCanvas(A,b):va("canvas")}function _(A,b,F,it){let j=1;if((A.width>it||A.height>it)&&(j=it/Math.max(A.width,A.height)),j<1||b===!0)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap){let K=b?vl:Math.floor,Mt=K(j*A.width),ct=K(j*A.height);u===void 0&&(u=m(Mt,ct));let xt=F?m(Mt,ct):u;return xt.width=Mt,xt.height=ct,xt.getContext("2d").drawImage(A,0,0,Mt,ct),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+A.width+"x"+A.height+") to ("+Mt+"x"+ct+")."),xt}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+A.width+"x"+A.height+")."),A;return A}function g(A){return qu(A.width)&&qu(A.height)}function p(A){return o?!1:A.wrapS!==ke||A.wrapT!==ke||A.minFilter!==_e&&A.minFilter!==xe}function y(A,b){return A.generateMipmaps&&b&&A.minFilter!==_e&&A.minFilter!==xe}function x(A){n.generateMipmap(A)}function v(A,b,F,it,j=!1){if(o===!1)return b;if(A!==null){if(n[A]!==void 0)return n[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let K=b;if(b===n.RED&&(F===n.FLOAT&&(K=n.R32F),F===n.HALF_FLOAT&&(K=n.R16F),F===n.UNSIGNED_BYTE&&(K=n.R8)),b===n.RED_INTEGER&&(F===n.UNSIGNED_BYTE&&(K=n.R8UI),F===n.UNSIGNED_SHORT&&(K=n.R16UI),F===n.UNSIGNED_INT&&(K=n.R32UI),F===n.BYTE&&(K=n.R8I),F===n.SHORT&&(K=n.R16I),F===n.INT&&(K=n.R32I)),b===n.RG&&(F===n.FLOAT&&(K=n.RG32F),F===n.HALF_FLOAT&&(K=n.RG16F),F===n.UNSIGNED_BYTE&&(K=n.RG8)),b===n.RGBA){let Mt=j?ga:ne.getTransfer(it);F===n.FLOAT&&(K=n.RGBA32F),F===n.HALF_FLOAT&&(K=n.RGBA16F),F===n.UNSIGNED_BYTE&&(K=Mt===oe?n.SRGB8_ALPHA8:n.RGBA8),F===n.UNSIGNED_SHORT_4_4_4_4&&(K=n.RGBA4),F===n.UNSIGNED_SHORT_5_5_5_1&&(K=n.RGB5_A1)}return(K===n.R16F||K===n.R32F||K===n.RG16F||K===n.RG32F||K===n.RGBA16F||K===n.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function R(A,b,F){return y(A,F)===!0||A.isFramebufferTexture&&A.minFilter!==_e&&A.minFilter!==xe?Math.log2(Math.max(b.width,b.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?b.mipmaps.length:1}function E(A){return A===_e||A===xl||A===na?n.NEAREST:n.LINEAR}function w(A){let b=A.target;b.removeEventListener("dispose",w),M(b),b.isVideoTexture&&h.delete(b)}function I(A){let b=A.target;b.removeEventListener("dispose",I),D(b)}function M(A){let b=i.get(A);if(b.__webglInit===void 0)return;let F=A.source,it=f.get(F);if(it){let j=it[b.__cacheKey];j.usedTimes--,j.usedTimes===0&&S(A),Object.keys(it).length===0&&f.delete(F)}i.remove(A)}function S(A){let b=i.get(A);n.deleteTexture(b.__webglTexture);let F=A.source,it=f.get(F);delete it[b.__cacheKey],a.memory.textures--}function D(A){let b=A.texture,F=i.get(A),it=i.get(b);if(it.__webglTexture!==void 0&&(n.deleteTexture(it.__webglTexture),a.memory.textures--),A.depthTexture&&A.depthTexture.dispose(),A.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(F.__webglFramebuffer[j]))for(let K=0;K<F.__webglFramebuffer[j].length;K++)n.deleteFramebuffer(F.__webglFramebuffer[j][K]);else n.deleteFramebuffer(F.__webglFramebuffer[j]);F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer[j])}else{if(Array.isArray(F.__webglFramebuffer))for(let j=0;j<F.__webglFramebuffer.length;j++)n.deleteFramebuffer(F.__webglFramebuffer[j]);else n.deleteFramebuffer(F.__webglFramebuffer);if(F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer),F.__webglMultisampledFramebuffer&&n.deleteFramebuffer(F.__webglMultisampledFramebuffer),F.__webglColorRenderbuffer)for(let j=0;j<F.__webglColorRenderbuffer.length;j++)F.__webglColorRenderbuffer[j]&&n.deleteRenderbuffer(F.__webglColorRenderbuffer[j]);F.__webglDepthRenderbuffer&&n.deleteRenderbuffer(F.__webglDepthRenderbuffer)}if(A.isWebGLMultipleRenderTargets)for(let j=0,K=b.length;j<K;j++){let Mt=i.get(b[j]);Mt.__webglTexture&&(n.deleteTexture(Mt.__webglTexture),a.memory.textures--),i.remove(b[j])}i.remove(b),i.remove(A)}let V=0;function rt(){V=0}function L(){let A=V;return A>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+r.maxTextures),V+=1,A}function O(A){let b=[];return b.push(A.wrapS),b.push(A.wrapT),b.push(A.wrapR||0),b.push(A.magFilter),b.push(A.minFilter),b.push(A.anisotropy),b.push(A.internalFormat),b.push(A.format),b.push(A.type),b.push(A.generateMipmaps),b.push(A.premultiplyAlpha),b.push(A.flipY),b.push(A.unpackAlignment),b.push(A.colorSpace),b.join()}function H(A,b){let F=i.get(A);if(A.isVideoTexture&&Et(A),A.isRenderTargetTexture===!1&&A.version>0&&F.__version!==A.version){let it=A.image;if(it===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(it.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{dt(F,A,b);return}}e.bindTexture(n.TEXTURE_2D,F.__webglTexture,n.TEXTURE0+b)}function J(A,b){let F=i.get(A);if(A.version>0&&F.__version!==A.version){dt(F,A,b);return}e.bindTexture(n.TEXTURE_2D_ARRAY,F.__webglTexture,n.TEXTURE0+b)}function Z(A,b){let F=i.get(A);if(A.version>0&&F.__version!==A.version){dt(F,A,b);return}e.bindTexture(n.TEXTURE_3D,F.__webglTexture,n.TEXTURE0+b)}function X(A,b){let F=i.get(A);if(A.version>0&&F.__version!==A.version){St(F,A,b);return}e.bindTexture(n.TEXTURE_CUBE_MAP,F.__webglTexture,n.TEXTURE0+b)}let et={[ua]:n.REPEAT,[ke]:n.CLAMP_TO_EDGE,[fa]:n.MIRRORED_REPEAT},nt={[_e]:n.NEAREST,[xl]:n.NEAREST_MIPMAP_NEAREST,[na]:n.NEAREST_MIPMAP_LINEAR,[xe]:n.LINEAR,[ud]:n.LINEAR_MIPMAP_NEAREST,[Pi]:n.LINEAR_MIPMAP_LINEAR},ft={[W0]:n.NEVER,[J0]:n.ALWAYS,[X0]:n.LESS,[Md]:n.LEQUAL,[q0]:n.EQUAL,[$0]:n.GEQUAL,[Y0]:n.GREATER,[Z0]:n.NOTEQUAL};function W(A,b,F){if(F?(n.texParameteri(A,n.TEXTURE_WRAP_S,et[b.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,et[b.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,et[b.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,nt[b.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,nt[b.minFilter])):(n.texParameteri(A,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(A,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(b.wrapS!==ke||b.wrapT!==ke)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(A,n.TEXTURE_MAG_FILTER,E(b.magFilter)),n.texParameteri(A,n.TEXTURE_MIN_FILTER,E(b.minFilter)),b.minFilter!==_e&&b.minFilter!==xe&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),b.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,ft[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){let it=t.get("EXT_texture_filter_anisotropic");if(b.magFilter===_e||b.minFilter!==na&&b.minFilter!==Pi||b.type===Sn&&t.has("OES_texture_float_linear")===!1||o===!1&&b.type===hs&&t.has("OES_texture_half_float_linear")===!1)return;(b.anisotropy>1||i.get(b).__currentAnisotropy)&&(n.texParameterf(A,it.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,r.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy)}}function Q(A,b){let F=!1;A.__webglInit===void 0&&(A.__webglInit=!0,b.addEventListener("dispose",w));let it=b.source,j=f.get(it);j===void 0&&(j={},f.set(it,j));let K=O(b);if(K!==A.__cacheKey){j[K]===void 0&&(j[K]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,F=!0),j[K].usedTimes++;let Mt=j[A.__cacheKey];Mt!==void 0&&(j[A.__cacheKey].usedTimes--,Mt.usedTimes===0&&S(b)),A.__cacheKey=K,A.__webglTexture=j[K].texture}return F}function dt(A,b,F){let it=n.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(it=n.TEXTURE_2D_ARRAY),b.isData3DTexture&&(it=n.TEXTURE_3D);let j=Q(A,b),K=b.source;e.bindTexture(it,A.__webglTexture,n.TEXTURE0+F);let Mt=i.get(K);if(K.version!==Mt.__version||j===!0){e.activeTexture(n.TEXTURE0+F);let ct=ne.getPrimaries(ne.workingColorSpace),xt=b.colorSpace===an?null:ne.getPrimaries(b.colorSpace),Tt=b.colorSpace===an||ct===xt?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,b.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,b.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Tt);let Bt=p(b)&&g(b.image)===!1,tt=_(b.image,Bt,!1,r.maxTextureSize);tt=mt(b,tt);let Jt=g(tt)||o,Zt=s.convert(b.format,b.colorSpace),Nt=s.convert(b.type),At=v(b.internalFormat,Zt,Nt,b.colorSpace,b.isVideoTexture);W(it,b,Jt);let vt,Vt=b.mipmaps,te=o&&b.isVideoTexture!==!0&&At!==xd,ue=Mt.__version===void 0||j===!0,qt=R(b,tt,Jt);if(b.isDepthTexture)At=n.DEPTH_COMPONENT,o?b.type===Sn?At=n.DEPTH_COMPONENT32F:b.type===jn?At=n.DEPTH_COMPONENT24:b.type===Ti?At=n.DEPTH24_STENCIL8:At=n.DEPTH_COMPONENT16:b.type===Sn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),b.format===Ri&&At===n.DEPTH_COMPONENT&&b.type!==Uc&&b.type!==jn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),b.type=jn,Nt=s.convert(b.type)),b.format===dr&&At===n.DEPTH_COMPONENT&&(At=n.DEPTH_STENCIL,b.type!==Ti&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),b.type=Ti,Nt=s.convert(b.type))),ue&&(te?e.texStorage2D(n.TEXTURE_2D,1,At,tt.width,tt.height):e.texImage2D(n.TEXTURE_2D,0,At,tt.width,tt.height,0,Zt,Nt,null));else if(b.isDataTexture)if(Vt.length>0&&Jt){te&&ue&&e.texStorage2D(n.TEXTURE_2D,qt,At,Vt[0].width,Vt[0].height);for(let lt=0,U=Vt.length;lt<U;lt++)vt=Vt[lt],te?e.texSubImage2D(n.TEXTURE_2D,lt,0,0,vt.width,vt.height,Zt,Nt,vt.data):e.texImage2D(n.TEXTURE_2D,lt,At,vt.width,vt.height,0,Zt,Nt,vt.data);b.generateMipmaps=!1}else te?(ue&&e.texStorage2D(n.TEXTURE_2D,qt,At,tt.width,tt.height),e.texSubImage2D(n.TEXTURE_2D,0,0,0,tt.width,tt.height,Zt,Nt,tt.data)):e.texImage2D(n.TEXTURE_2D,0,At,tt.width,tt.height,0,Zt,Nt,tt.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){te&&ue&&e.texStorage3D(n.TEXTURE_2D_ARRAY,qt,At,Vt[0].width,Vt[0].height,tt.depth);for(let lt=0,U=Vt.length;lt<U;lt++)vt=Vt[lt],b.format!==Qe?Zt!==null?te?e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,lt,0,0,0,vt.width,vt.height,tt.depth,Zt,vt.data,0,0):e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,lt,At,vt.width,vt.height,tt.depth,0,vt.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):te?e.texSubImage3D(n.TEXTURE_2D_ARRAY,lt,0,0,0,vt.width,vt.height,tt.depth,Zt,Nt,vt.data):e.texImage3D(n.TEXTURE_2D_ARRAY,lt,At,vt.width,vt.height,tt.depth,0,Zt,Nt,vt.data)}else{te&&ue&&e.texStorage2D(n.TEXTURE_2D,qt,At,Vt[0].width,Vt[0].height);for(let lt=0,U=Vt.length;lt<U;lt++)vt=Vt[lt],b.format!==Qe?Zt!==null?te?e.compressedTexSubImage2D(n.TEXTURE_2D,lt,0,0,vt.width,vt.height,Zt,vt.data):e.compressedTexImage2D(n.TEXTURE_2D,lt,At,vt.width,vt.height,0,vt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):te?e.texSubImage2D(n.TEXTURE_2D,lt,0,0,vt.width,vt.height,Zt,Nt,vt.data):e.texImage2D(n.TEXTURE_2D,lt,At,vt.width,vt.height,0,Zt,Nt,vt.data)}else if(b.isDataArrayTexture)te?(ue&&e.texStorage3D(n.TEXTURE_2D_ARRAY,qt,At,tt.width,tt.height,tt.depth),e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,Zt,Nt,tt.data)):e.texImage3D(n.TEXTURE_2D_ARRAY,0,At,tt.width,tt.height,tt.depth,0,Zt,Nt,tt.data);else if(b.isData3DTexture)te?(ue&&e.texStorage3D(n.TEXTURE_3D,qt,At,tt.width,tt.height,tt.depth),e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,Zt,Nt,tt.data)):e.texImage3D(n.TEXTURE_3D,0,At,tt.width,tt.height,tt.depth,0,Zt,Nt,tt.data);else if(b.isFramebufferTexture){if(ue)if(te)e.texStorage2D(n.TEXTURE_2D,qt,At,tt.width,tt.height);else{let lt=tt.width,U=tt.height;for(let ht=0;ht<qt;ht++)e.texImage2D(n.TEXTURE_2D,ht,At,lt,U,0,Zt,Nt,null),lt>>=1,U>>=1}}else if(Vt.length>0&&Jt){te&&ue&&e.texStorage2D(n.TEXTURE_2D,qt,At,Vt[0].width,Vt[0].height);for(let lt=0,U=Vt.length;lt<U;lt++)vt=Vt[lt],te?e.texSubImage2D(n.TEXTURE_2D,lt,0,0,Zt,Nt,vt):e.texImage2D(n.TEXTURE_2D,lt,At,Zt,Nt,vt);b.generateMipmaps=!1}else te?(ue&&e.texStorage2D(n.TEXTURE_2D,qt,At,tt.width,tt.height),e.texSubImage2D(n.TEXTURE_2D,0,0,0,Zt,Nt,tt)):e.texImage2D(n.TEXTURE_2D,0,At,Zt,Nt,tt);y(b,Jt)&&x(it),Mt.__version=K.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function St(A,b,F){if(b.image.length!==6)return;let it=Q(A,b),j=b.source;e.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+F);let K=i.get(j);if(j.version!==K.__version||it===!0){e.activeTexture(n.TEXTURE0+F);let Mt=ne.getPrimaries(ne.workingColorSpace),ct=b.colorSpace===an?null:ne.getPrimaries(b.colorSpace),xt=b.colorSpace===an||Mt===ct?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,b.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,b.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,xt);let Tt=b.isCompressedTexture||b.image[0].isCompressedTexture,Bt=b.image[0]&&b.image[0].isDataTexture,tt=[];for(let lt=0;lt<6;lt++)!Tt&&!Bt?tt[lt]=_(b.image[lt],!1,!0,r.maxCubemapSize):tt[lt]=Bt?b.image[lt].image:b.image[lt],tt[lt]=mt(b,tt[lt]);let Jt=tt[0],Zt=g(Jt)||o,Nt=s.convert(b.format,b.colorSpace),At=s.convert(b.type),vt=v(b.internalFormat,Nt,At,b.colorSpace),Vt=o&&b.isVideoTexture!==!0,te=K.__version===void 0||it===!0,ue=R(b,Jt,Zt);W(n.TEXTURE_CUBE_MAP,b,Zt);let qt;if(Tt){Vt&&te&&e.texStorage2D(n.TEXTURE_CUBE_MAP,ue,vt,Jt.width,Jt.height);for(let lt=0;lt<6;lt++){qt=tt[lt].mipmaps;for(let U=0;U<qt.length;U++){let ht=qt[U];b.format!==Qe?Nt!==null?Vt?e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U,0,0,ht.width,ht.height,Nt,ht.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U,vt,ht.width,ht.height,0,ht.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Vt?e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U,0,0,ht.width,ht.height,Nt,At,ht.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U,vt,ht.width,ht.height,0,Nt,At,ht.data)}}}else{qt=b.mipmaps,Vt&&te&&(qt.length>0&&ue++,e.texStorage2D(n.TEXTURE_CUBE_MAP,ue,vt,tt[0].width,tt[0].height));for(let lt=0;lt<6;lt++)if(Bt){Vt?e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,0,0,tt[lt].width,tt[lt].height,Nt,At,tt[lt].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,vt,tt[lt].width,tt[lt].height,0,Nt,At,tt[lt].data);for(let U=0;U<qt.length;U++){let ut=qt[U].image[lt].image;Vt?e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U+1,0,0,ut.width,ut.height,Nt,At,ut.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U+1,vt,ut.width,ut.height,0,Nt,At,ut.data)}}else{Vt?e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,0,0,Nt,At,tt[lt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,vt,Nt,At,tt[lt]);for(let U=0;U<qt.length;U++){let ht=qt[U];Vt?e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U+1,0,0,Nt,At,ht.image[lt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,U+1,vt,Nt,At,ht.image[lt])}}}y(b,Zt)&&x(n.TEXTURE_CUBE_MAP),K.__version=j.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function _t(A,b,F,it,j,K){let Mt=s.convert(F.format,F.colorSpace),ct=s.convert(F.type),xt=v(F.internalFormat,Mt,ct,F.colorSpace);if(!i.get(b).__hasExternalTextures){let Bt=Math.max(1,b.width>>K),tt=Math.max(1,b.height>>K);j===n.TEXTURE_3D||j===n.TEXTURE_2D_ARRAY?e.texImage3D(j,K,xt,Bt,tt,b.depth,0,Mt,ct,null):e.texImage2D(j,K,xt,Bt,tt,0,Mt,ct,null)}e.bindFramebuffer(n.FRAMEBUFFER,A),q(b)?c.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,it,j,i.get(F).__webglTexture,0,st(b)):(j===n.TEXTURE_2D||j>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,it,j,i.get(F).__webglTexture,K),e.bindFramebuffer(n.FRAMEBUFFER,null)}function It(A,b,F){if(n.bindRenderbuffer(n.RENDERBUFFER,A),b.depthBuffer&&!b.stencilBuffer){let it=o===!0?n.DEPTH_COMPONENT24:n.DEPTH_COMPONENT16;if(F||q(b)){let j=b.depthTexture;j&&j.isDepthTexture&&(j.type===Sn?it=n.DEPTH_COMPONENT32F:j.type===jn&&(it=n.DEPTH_COMPONENT24));let K=st(b);q(b)?c.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,K,it,b.width,b.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,K,it,b.width,b.height)}else n.renderbufferStorage(n.RENDERBUFFER,it,b.width,b.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,A)}else if(b.depthBuffer&&b.stencilBuffer){let it=st(b);F&&q(b)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,it,n.DEPTH24_STENCIL8,b.width,b.height):q(b)?c.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,it,n.DEPTH24_STENCIL8,b.width,b.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,b.width,b.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,A)}else{let it=b.isWebGLMultipleRenderTargets===!0?b.texture:[b.texture];for(let j=0;j<it.length;j++){let K=it[j],Mt=s.convert(K.format,K.colorSpace),ct=s.convert(K.type),xt=v(K.internalFormat,Mt,ct,K.colorSpace),Tt=st(b);F&&q(b)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Tt,xt,b.width,b.height):q(b)?c.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Tt,xt,b.width,b.height):n.renderbufferStorage(n.RENDERBUFFER,xt,b.width,b.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ft(A,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(n.FRAMEBUFFER,A),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(b.depthTexture).__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),H(b.depthTexture,0);let it=i.get(b.depthTexture).__webglTexture,j=st(b);if(b.depthTexture.format===Ri)q(b)?c.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,it,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,it,0);else if(b.depthTexture.format===dr)q(b)?c.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,it,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,it,0);else throw new Error("Unknown depthTexture format")}function bt(A){let b=i.get(A),F=A.isWebGLCubeRenderTarget===!0;if(A.depthTexture&&!b.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Ft(b.__webglFramebuffer,A)}else if(F){b.__webglDepthbuffer=[];for(let it=0;it<6;it++)e.bindFramebuffer(n.FRAMEBUFFER,b.__webglFramebuffer[it]),b.__webglDepthbuffer[it]=n.createRenderbuffer(),It(b.__webglDepthbuffer[it],A,!1)}else e.bindFramebuffer(n.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer=n.createRenderbuffer(),It(b.__webglDepthbuffer,A,!1);e.bindFramebuffer(n.FRAMEBUFFER,null)}function Dt(A,b,F){let it=i.get(A);b!==void 0&&_t(it.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),F!==void 0&&bt(A)}function P(A){let b=A.texture,F=i.get(A),it=i.get(b);A.addEventListener("dispose",I),A.isWebGLMultipleRenderTargets!==!0&&(it.__webglTexture===void 0&&(it.__webglTexture=n.createTexture()),it.__version=b.version,a.memory.textures++);let j=A.isWebGLCubeRenderTarget===!0,K=A.isWebGLMultipleRenderTargets===!0,Mt=g(A)||o;if(j){F.__webglFramebuffer=[];for(let ct=0;ct<6;ct++)if(o&&b.mipmaps&&b.mipmaps.length>0){F.__webglFramebuffer[ct]=[];for(let xt=0;xt<b.mipmaps.length;xt++)F.__webglFramebuffer[ct][xt]=n.createFramebuffer()}else F.__webglFramebuffer[ct]=n.createFramebuffer()}else{if(o&&b.mipmaps&&b.mipmaps.length>0){F.__webglFramebuffer=[];for(let ct=0;ct<b.mipmaps.length;ct++)F.__webglFramebuffer[ct]=n.createFramebuffer()}else F.__webglFramebuffer=n.createFramebuffer();if(K)if(r.drawBuffers){let ct=A.texture;for(let xt=0,Tt=ct.length;xt<Tt;xt++){let Bt=i.get(ct[xt]);Bt.__webglTexture===void 0&&(Bt.__webglTexture=n.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&A.samples>0&&q(A)===!1){let ct=K?b:[b];F.__webglMultisampledFramebuffer=n.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let xt=0;xt<ct.length;xt++){let Tt=ct[xt];F.__webglColorRenderbuffer[xt]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,F.__webglColorRenderbuffer[xt]);let Bt=s.convert(Tt.format,Tt.colorSpace),tt=s.convert(Tt.type),Jt=v(Tt.internalFormat,Bt,tt,Tt.colorSpace,A.isXRRenderTarget===!0),Zt=st(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,Zt,Jt,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+xt,n.RENDERBUFFER,F.__webglColorRenderbuffer[xt])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(F.__webglDepthRenderbuffer=n.createRenderbuffer(),It(F.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(j){e.bindTexture(n.TEXTURE_CUBE_MAP,it.__webglTexture),W(n.TEXTURE_CUBE_MAP,b,Mt);for(let ct=0;ct<6;ct++)if(o&&b.mipmaps&&b.mipmaps.length>0)for(let xt=0;xt<b.mipmaps.length;xt++)_t(F.__webglFramebuffer[ct][xt],A,b,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ct,xt);else _t(F.__webglFramebuffer[ct],A,b,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0);y(b,Mt)&&x(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(K){let ct=A.texture;for(let xt=0,Tt=ct.length;xt<Tt;xt++){let Bt=ct[xt],tt=i.get(Bt);e.bindTexture(n.TEXTURE_2D,tt.__webglTexture),W(n.TEXTURE_2D,Bt,Mt),_t(F.__webglFramebuffer,A,Bt,n.COLOR_ATTACHMENT0+xt,n.TEXTURE_2D,0),y(Bt,Mt)&&x(n.TEXTURE_2D)}e.unbindTexture()}else{let ct=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(o?ct=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(ct,it.__webglTexture),W(ct,b,Mt),o&&b.mipmaps&&b.mipmaps.length>0)for(let xt=0;xt<b.mipmaps.length;xt++)_t(F.__webglFramebuffer[xt],A,b,n.COLOR_ATTACHMENT0,ct,xt);else _t(F.__webglFramebuffer,A,b,n.COLOR_ATTACHMENT0,ct,0);y(b,Mt)&&x(ct),e.unbindTexture()}A.depthBuffer&&bt(A)}function at(A){let b=g(A)||o,F=A.isWebGLMultipleRenderTargets===!0?A.texture:[A.texture];for(let it=0,j=F.length;it<j;it++){let K=F[it];if(y(K,b)){let Mt=A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,ct=i.get(K).__webglTexture;e.bindTexture(Mt,ct),x(Mt),e.unbindTexture()}}}function Y(A){if(o&&A.samples>0&&q(A)===!1){let b=A.isWebGLMultipleRenderTargets?A.texture:[A.texture],F=A.width,it=A.height,j=n.COLOR_BUFFER_BIT,K=[],Mt=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ct=i.get(A),xt=A.isWebGLMultipleRenderTargets===!0;if(xt)for(let Tt=0;Tt<b.length;Tt++)e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Tt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Tt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,ct.__webglMultisampledFramebuffer),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ct.__webglFramebuffer);for(let Tt=0;Tt<b.length;Tt++){K.push(n.COLOR_ATTACHMENT0+Tt),A.depthBuffer&&K.push(Mt);let Bt=ct.__ignoreDepthValues!==void 0?ct.__ignoreDepthValues:!1;if(Bt===!1&&(A.depthBuffer&&(j|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&(j|=n.STENCIL_BUFFER_BIT)),xt&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ct.__webglColorRenderbuffer[Tt]),Bt===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[Mt]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[Mt])),xt){let tt=i.get(b[Tt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,tt,0)}n.blitFramebuffer(0,0,F,it,0,0,F,it,j,n.NEAREST),l&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,K)}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),xt)for(let Tt=0;Tt<b.length;Tt++){e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Tt,n.RENDERBUFFER,ct.__webglColorRenderbuffer[Tt]);let Bt=i.get(b[Tt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,ct.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Tt,n.TEXTURE_2D,Bt,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ct.__webglMultisampledFramebuffer)}}function st(A){return Math.min(r.maxSamples,A.samples)}function q(A){let b=i.get(A);return o&&A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Et(A){let b=a.render.frame;h.get(A)!==b&&(h.set(A,b),A.update())}function mt(A,b){let F=A.colorSpace,it=A.format,j=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||A.format===yl||F!==On&&F!==an&&(ne.getTransfer(F)===oe?o===!1?t.has("EXT_sRGB")===!0&&it===Qe?(A.format=yl,A.minFilter=xe,A.generateMipmaps=!1):b=Ma.sRGBToLinear(b):(it!==Qe||j!==si)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),b}this.allocateTextureUnit=L,this.resetTextureUnits=rt,this.setTexture2D=H,this.setTexture2DArray=J,this.setTexture3D=Z,this.setTextureCube=X,this.rebindTextures=Dt,this.setupRenderTarget=P,this.updateRenderTargetMipmap=at,this.updateMultisampleRenderTarget=Y,this.setupDepthRenderbuffer=bt,this.setupFrameBufferTexture=_t,this.useMultisampledRTT=q}function l_(n,t,e){let i=e.isWebGL2;function r(s,a=an){let o,c=ne.getTransfer(a);if(s===si)return n.UNSIGNED_BYTE;if(s===dd)return n.UNSIGNED_SHORT_4_4_4_4;if(s===pd)return n.UNSIGNED_SHORT_5_5_5_1;if(s===I0)return n.BYTE;if(s===P0)return n.SHORT;if(s===Uc)return n.UNSIGNED_SHORT;if(s===fd)return n.INT;if(s===jn)return n.UNSIGNED_INT;if(s===Sn)return n.FLOAT;if(s===hs)return i?n.HALF_FLOAT:(o=t.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(s===L0)return n.ALPHA;if(s===Qe)return n.RGBA;if(s===U0)return n.LUMINANCE;if(s===D0)return n.LUMINANCE_ALPHA;if(s===Ri)return n.DEPTH_COMPONENT;if(s===dr)return n.DEPTH_STENCIL;if(s===yl)return o=t.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(s===N0)return n.RED;if(s===md)return n.RED_INTEGER;if(s===F0)return n.RG;if(s===gd)return n.RG_INTEGER;if(s===_d)return n.RGBA_INTEGER;if(s===hl||s===ul||s===fl||s===dl)if(c===oe)if(o=t.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(s===hl)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===ul)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===fl)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===dl)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=t.get("WEBGL_compressed_texture_s3tc"),o!==null){if(s===hl)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===ul)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===fl)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===dl)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===yu||s===vu||s===Mu||s===Su)if(o=t.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(s===yu)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===vu)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Mu)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Su)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===xd)return o=t.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===bu||s===wu)if(o=t.get("WEBGL_compressed_texture_etc"),o!==null){if(s===bu)return c===oe?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(s===wu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Eu||s===Au||s===Tu||s===Ru||s===Cu||s===Iu||s===Pu||s===Lu||s===Uu||s===Du||s===Nu||s===Fu||s===Ou||s===Bu)if(o=t.get("WEBGL_compressed_texture_astc"),o!==null){if(s===Eu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Au)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Tu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Ru)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Cu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Iu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Pu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Lu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Uu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Du)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Nu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Fu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Ou)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Bu)return c===oe?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===pl||s===zu||s===ku)if(o=t.get("EXT_texture_compression_bptc"),o!==null){if(s===pl)return c===oe?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===zu)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===ku)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===O0||s===Hu||s===Vu||s===Gu)if(o=t.get("EXT_texture_compression_rgtc"),o!==null){if(s===pl)return o.COMPRESSED_RED_RGTC1_EXT;if(s===Hu)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Vu)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Gu)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Ti?i?n.UNSIGNED_INT_24_8:(o=t.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):n[s]!==void 0?n[s]:null}return{convert:r}}var wl=class extends Se{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Ai=class extends jt{constructor(){super(),this.isGroup=!0,this.type="Group"}},WE={type:"move"},sa=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ai,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ai,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ai,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let r=null,s=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){a=!0;for(let _ of t.hand.values()){let g=e.getJointPose(_,i),p=this._getHandJoint(l,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,m=.005;l.inputState.pinching&&f>d+m?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&f<=d-m&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(r=e.getPose(t.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(WE)))}return o!==null&&(o.visible=r!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Ai;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},hf=class extends wn{constructor(t,e){super();let i=this,r=null,s=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,f=null,d=null,m=null,_=e.getContextAttributes(),g=null,p=null,y=[],x=[],v=new $,R=null,E=new Se;E.layers.enable(1),E.viewport=new ie;let w=new Se;w.layers.enable(2),w.viewport=new ie;let I=[E,w],M=new wl;M.layers.enable(1),M.layers.enable(2);let S=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let Q=y[W];return Q===void 0&&(Q=new sa,y[W]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(W){let Q=y[W];return Q===void 0&&(Q=new sa,y[W]=Q),Q.getGripSpace()},this.getHand=function(W){let Q=y[W];return Q===void 0&&(Q=new sa,y[W]=Q),Q.getHandSpace()};function V(W){let Q=x.indexOf(W.inputSource);if(Q===-1)return;let dt=y[Q];dt!==void 0&&(dt.update(W.inputSource,W.frame,l||a),dt.dispatchEvent({type:W.type,data:W.inputSource}))}function rt(){r.removeEventListener("select",V),r.removeEventListener("selectstart",V),r.removeEventListener("selectend",V),r.removeEventListener("squeeze",V),r.removeEventListener("squeezestart",V),r.removeEventListener("squeezeend",V),r.removeEventListener("end",rt),r.removeEventListener("inputsourceschange",L);for(let W=0;W<y.length;W++){let Q=x[W];Q!==null&&(x[W]=null,y[W].disconnect(Q))}S=null,D=null,t.setRenderTarget(g),d=null,f=null,u=null,r=null,p=null,ft.stop(),i.isPresenting=!1,t.setPixelRatio(R),t.setSize(v.width,v.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){s=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(W){l=W},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(W){if(r=W,r!==null){if(g=t.getRenderTarget(),r.addEventListener("select",V),r.addEventListener("selectstart",V),r.addEventListener("selectend",V),r.addEventListener("squeeze",V),r.addEventListener("squeezestart",V),r.addEventListener("squeezeend",V),r.addEventListener("end",rt),r.addEventListener("inputsourceschange",L),_.xrCompatible!==!0&&await e.makeXRCompatible(),R=t.getPixelRatio(),t.getSize(v),r.renderState.layers===void 0||t.capabilities.isWebGL2===!1){let Q={antialias:r.renderState.layers===void 0?_.antialias:!0,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,e,Q),r.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),p=new ln(d.framebufferWidth,d.framebufferHeight,{format:Qe,type:si,colorSpace:t.outputColorSpace,stencilBuffer:_.stencil})}else{let Q=null,dt=null,St=null;_.depth&&(St=_.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Q=_.stencil?dr:Ri,dt=_.stencil?Ti:jn);let _t={colorFormat:e.RGBA8,depthFormat:St,scaleFactor:s};u=new XRWebGLBinding(r,e),f=u.createProjectionLayer(_t),r.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),p=new ln(f.textureWidth,f.textureHeight,{format:Qe,type:si,depthTexture:new Ra(f.textureWidth,f.textureHeight,dt,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:_.stencil,colorSpace:t.outputColorSpace,samples:_.antialias?4:0});let It=t.properties.get(p);It.__ignoreDepthValues=f.ignoreDepthValues}p.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await r.requestReferenceSpace(o),ft.setContext(r),ft.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function L(W){for(let Q=0;Q<W.removed.length;Q++){let dt=W.removed[Q],St=x.indexOf(dt);St>=0&&(x[St]=null,y[St].disconnect(dt))}for(let Q=0;Q<W.added.length;Q++){let dt=W.added[Q],St=x.indexOf(dt);if(St===-1){for(let It=0;It<y.length;It++)if(It>=x.length){x.push(dt),St=It;break}else if(x[It]===null){x[It]=dt,St=It;break}if(St===-1)break}let _t=y[St];_t&&_t.connect(dt)}}let O=new C,H=new C;function J(W,Q,dt){O.setFromMatrixPosition(Q.matrixWorld),H.setFromMatrixPosition(dt.matrixWorld);let St=O.distanceTo(H),_t=Q.projectionMatrix.elements,It=dt.projectionMatrix.elements,Ft=_t[14]/(_t[10]-1),bt=_t[14]/(_t[10]+1),Dt=(_t[9]+1)/_t[5],P=(_t[9]-1)/_t[5],at=(_t[8]-1)/_t[0],Y=(It[8]+1)/It[0],st=Ft*at,q=Ft*Y,Et=St/(-at+Y),mt=Et*-at;Q.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(mt),W.translateZ(Et),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert();let A=Ft+Et,b=bt+Et,F=st-mt,it=q+(St-mt),j=Dt*bt/b*A,K=P*bt/b*A;W.projectionMatrix.makePerspective(F,it,j,K,A,b),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}function Z(W,Q){Q===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(Q.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(r===null)return;M.near=w.near=E.near=W.near,M.far=w.far=E.far=W.far,(S!==M.near||D!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),S=M.near,D=M.far);let Q=W.parent,dt=M.cameras;Z(M,Q);for(let St=0;St<dt.length;St++)Z(dt[St],Q);dt.length===2?J(M,E,w):M.projectionMatrix.copy(E.projectionMatrix),X(W,M,Q)};function X(W,Q,dt){dt===null?W.matrix.copy(Q.matrixWorld):(W.matrix.copy(dt.matrixWorld),W.matrix.invert(),W.matrix.multiply(Q.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(Q.projectionMatrix),W.projectionMatrixInverse.copy(Q.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=fs*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(f===null&&d===null))return c},this.setFoveation=function(W){c=W,f!==null&&(f.fixedFoveation=W),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=W)};let et=null;function nt(W,Q){if(h=Q.getViewerPose(l||a),m=Q,h!==null){let dt=h.views;d!==null&&(t.setRenderTargetFramebuffer(p,d.framebuffer),t.setRenderTarget(p));let St=!1;dt.length!==M.cameras.length&&(M.cameras.length=0,St=!0);for(let _t=0;_t<dt.length;_t++){let It=dt[_t],Ft=null;if(d!==null)Ft=d.getViewport(It);else{let Dt=u.getViewSubImage(f,It);Ft=Dt.viewport,_t===0&&(t.setRenderTargetTextures(p,Dt.colorTexture,f.ignoreDepthValues?void 0:Dt.depthStencilTexture),t.setRenderTarget(p))}let bt=I[_t];bt===void 0&&(bt=new Se,bt.layers.enable(_t),bt.viewport=new ie,I[_t]=bt),bt.matrix.fromArray(It.transform.matrix),bt.matrix.decompose(bt.position,bt.quaternion,bt.scale),bt.projectionMatrix.fromArray(It.projectionMatrix),bt.projectionMatrixInverse.copy(bt.projectionMatrix).invert(),bt.viewport.set(Ft.x,Ft.y,Ft.width,Ft.height),_t===0&&(M.matrix.copy(bt.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),St===!0&&M.cameras.push(bt)}}for(let dt=0;dt<y.length;dt++){let St=x[dt],_t=y[dt];St!==null&&_t!==void 0&&_t.update(St,Q,l||a)}et&&et(W,Q),Q.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Q}),m=null}let ft=new n_;ft.setAnimationLoop(nt),this.setAnimationLoop=function(W){et=W},this.dispose=function(){}}};function XE(n,t){function e(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,t_(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function r(g,p,y,x,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(g,p):p.isMeshToonMaterial?(s(g,p),u(g,p)):p.isMeshPhongMaterial?(s(g,p),h(g,p)):p.isMeshStandardMaterial?(s(g,p),f(g,p),p.isMeshPhysicalMaterial&&d(g,p,v)):p.isMeshMatcapMaterial?(s(g,p),m(g,p)):p.isMeshDepthMaterial?s(g,p):p.isMeshDistanceMaterial?(s(g,p),_(g,p)):p.isMeshNormalMaterial?s(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?c(g,p,y,x):p.isSpriteMaterial?l(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,e(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Ze&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,e(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Ze&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,e(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,e(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let y=t.get(p).envMap;if(y&&(g.envMap.value=y,g.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap){g.lightMap.value=p.lightMap;let x=n._useLegacyLights===!0?Math.PI:1;g.lightMapIntensity.value=p.lightMapIntensity*x,e(p.lightMap,g.lightMapTransform)}p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function c(g,p,y,x){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*y,g.scale.value=x*.5,p.map&&(g.map.value=p.map,e(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function l(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function f(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,g.roughnessMapTransform)),t.get(p).envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p,y){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ze&&g.clearcoatNormalScale.value.negate())),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=y.texture,g.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){let y=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(y.matrixWorld),g.nearDistance.value=y.shadow.camera.near,g.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function qE(n,t,e,i){let r={},s={},a=[],o=e.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function c(y,x){let v=x.program;i.uniformBlockBinding(y,v)}function l(y,x){let v=r[y.id];v===void 0&&(m(y),v=h(y),r[y.id]=v,y.addEventListener("dispose",g));let R=x.program;i.updateUBOMapping(y,R);let E=t.render.frame;s[y.id]!==E&&(f(y),s[y.id]=E)}function h(y){let x=u();y.__bindingPointIndex=x;let v=n.createBuffer(),R=y.__size,E=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,v),n.bufferData(n.UNIFORM_BUFFER,R,E),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,x,v),v}function u(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){let x=r[y.id],v=y.uniforms,R=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,x);for(let E=0,w=v.length;E<w;E++){let I=Array.isArray(v[E])?v[E]:[v[E]];for(let M=0,S=I.length;M<S;M++){let D=I[M];if(d(D,E,M,R)===!0){let V=D.__offset,rt=Array.isArray(D.value)?D.value:[D.value],L=0;for(let O=0;O<rt.length;O++){let H=rt[O],J=_(H);typeof H=="number"||typeof H=="boolean"?(D.__data[0]=H,n.bufferSubData(n.UNIFORM_BUFFER,V+L,D.__data)):H.isMatrix3?(D.__data[0]=H.elements[0],D.__data[1]=H.elements[1],D.__data[2]=H.elements[2],D.__data[3]=0,D.__data[4]=H.elements[3],D.__data[5]=H.elements[4],D.__data[6]=H.elements[5],D.__data[7]=0,D.__data[8]=H.elements[6],D.__data[9]=H.elements[7],D.__data[10]=H.elements[8],D.__data[11]=0):(H.toArray(D.__data,L),L+=J.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,V,D.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(y,x,v,R){let E=y.value,w=x+"_"+v;if(R[w]===void 0)return typeof E=="number"||typeof E=="boolean"?R[w]=E:R[w]=E.clone(),!0;{let I=R[w];if(typeof E=="number"||typeof E=="boolean"){if(I!==E)return R[w]=E,!0}else if(I.equals(E)===!1)return I.copy(E),!0}return!1}function m(y){let x=y.uniforms,v=0,R=16;for(let w=0,I=x.length;w<I;w++){let M=Array.isArray(x[w])?x[w]:[x[w]];for(let S=0,D=M.length;S<D;S++){let V=M[S],rt=Array.isArray(V.value)?V.value:[V.value];for(let L=0,O=rt.length;L<O;L++){let H=rt[L],J=_(H),Z=v%R;Z!==0&&R-Z<J.boundary&&(v+=R-Z),V.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=v,v+=J.storage}}}let E=v%R;return E>0&&(v+=R-E),y.__size=v,y.__cache={},this}function _(y){let x={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(x.boundary=4,x.storage=4):y.isVector2?(x.boundary=8,x.storage=8):y.isVector3||y.isColor?(x.boundary=16,x.storage=12):y.isVector4?(x.boundary=16,x.storage=16):y.isMatrix3?(x.boundary=48,x.storage=48):y.isMatrix4?(x.boundary=64,x.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),x}function g(y){let x=y.target;x.removeEventListener("dispose",g);let v=a.indexOf(x.__bindingPointIndex);a.splice(v,1),n.deleteBuffer(r[x.id]),delete r[x.id],delete s[x.id]}function p(){for(let y in r)n.deleteBuffer(r[y]);a=[],r={},s={}}return{bind:c,update:l,dispose:p}}var El=class{constructor(t={}){let{canvas:e=Q0(),context:i=null,depth:r=!0,stencil:s=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let f;i!==null?f=i.getContextAttributes().alpha:f=a;let d=new Uint32Array(4),m=new Int32Array(4),_=null,g=null,p=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Me,this._useLegacyLights=!1,this.toneMapping=ri,this.toneMappingExposure=1;let x=this,v=!1,R=0,E=0,w=null,I=-1,M=null,S=new ie,D=new ie,V=null,rt=new pt(0),L=0,O=e.width,H=e.height,J=1,Z=null,X=null,et=new ie(0,0,O,H),nt=new ie(0,0,O,H),ft=!1,W=new gr,Q=!1,dt=!1,St=null,_t=new Lt,It=new $,Ft=new C,bt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Dt(){return w===null?J:1}let P=i;function at(T,N){for(let z=0;z<T.length;z++){let k=T[z],B=e.getContext(k,N);if(B!==null)return B}return null}try{let T={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Pc}`),e.addEventListener("webglcontextlost",lt,!1),e.addEventListener("webglcontextrestored",U,!1),e.addEventListener("webglcontextcreationerror",ht,!1),P===null){let N=["webgl2","webgl","experimental-webgl"];if(x.isWebGL1Renderer===!0&&N.shift(),P=at(N,T),P===null)throw at(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&P instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),P.getShaderPrecisionFormat===void 0&&(P.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let Y,st,q,Et,mt,A,b,F,it,j,K,Mt,ct,xt,Tt,Bt,tt,Jt,Zt,Nt,At,vt,Vt,te;function ue(){Y=new f1(P),st=new a1(P,Y,t),Y.init(st),vt=new l_(P,Y,st),q=new VE(P,Y,st),Et=new m1(P),mt=new IE,A=new GE(P,Y,q,mt,st,vt,Et),b=new l1(x),F=new u1(x),it=new bS(P,st),Vt=new r1(P,Y,it,st),j=new d1(P,it,Et,Vt),K=new y1(P,j,it,Et),Zt=new x1(P,st,A),Bt=new o1(mt),Mt=new CE(x,b,F,Y,st,Vt,Bt),ct=new XE(x,mt),xt=new LE,Tt=new BE(Y,st),Jt=new i1(x,b,F,q,K,f,c),tt=new HE(x,K,st),te=new qE(P,Et,st,q),Nt=new s1(P,Y,Et,st),At=new p1(P,Y,Et,st),Et.programs=Mt.programs,x.capabilities=st,x.extensions=Y,x.properties=mt,x.renderLists=xt,x.shadowMap=tt,x.state=q,x.info=Et}ue();let qt=new hf(x,P);this.xr=qt,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let T=Y.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=Y.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return J},this.setPixelRatio=function(T){T!==void 0&&(J=T,this.setSize(O,H,!1))},this.getSize=function(T){return T.set(O,H)},this.setSize=function(T,N,z=!0){if(qt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=T,H=N,e.width=Math.floor(T*J),e.height=Math.floor(N*J),z===!0&&(e.style.width=T+"px",e.style.height=N+"px"),this.setViewport(0,0,T,N)},this.getDrawingBufferSize=function(T){return T.set(O*J,H*J).floor()},this.setDrawingBufferSize=function(T,N,z){O=T,H=N,J=z,e.width=Math.floor(T*z),e.height=Math.floor(N*z),this.setViewport(0,0,T,N)},this.getCurrentViewport=function(T){return T.copy(S)},this.getViewport=function(T){return T.copy(et)},this.setViewport=function(T,N,z,k){T.isVector4?et.set(T.x,T.y,T.z,T.w):et.set(T,N,z,k),q.viewport(S.copy(et).multiplyScalar(J).floor())},this.getScissor=function(T){return T.copy(nt)},this.setScissor=function(T,N,z,k){T.isVector4?nt.set(T.x,T.y,T.z,T.w):nt.set(T,N,z,k),q.scissor(D.copy(nt).multiplyScalar(J).floor())},this.getScissorTest=function(){return ft},this.setScissorTest=function(T){q.setScissorTest(ft=T)},this.setOpaqueSort=function(T){Z=T},this.setTransparentSort=function(T){X=T},this.getClearColor=function(T){return T.copy(Jt.getClearColor())},this.setClearColor=function(){Jt.setClearColor.apply(Jt,arguments)},this.getClearAlpha=function(){return Jt.getClearAlpha()},this.setClearAlpha=function(){Jt.setClearAlpha.apply(Jt,arguments)},this.clear=function(T=!0,N=!0,z=!0){let k=0;if(T){let B=!1;if(w!==null){let gt=w.texture.format;B=gt===_d||gt===gd||gt===md}if(B){let gt=w.texture.type,wt=gt===si||gt===jn||gt===Uc||gt===Ti||gt===dd||gt===pd,Ct=Jt.getClearColor(),Ut=Jt.getClearAlpha(),Xt=Ct.r,Ot=Ct.g,zt=Ct.b;wt?(d[0]=Xt,d[1]=Ot,d[2]=zt,d[3]=Ut,P.clearBufferuiv(P.COLOR,0,d)):(m[0]=Xt,m[1]=Ot,m[2]=zt,m[3]=Ut,P.clearBufferiv(P.COLOR,0,m))}else k|=P.COLOR_BUFFER_BIT}N&&(k|=P.DEPTH_BUFFER_BIT),z&&(k|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",lt,!1),e.removeEventListener("webglcontextrestored",U,!1),e.removeEventListener("webglcontextcreationerror",ht,!1),xt.dispose(),Tt.dispose(),mt.dispose(),b.dispose(),F.dispose(),K.dispose(),Vt.dispose(),te.dispose(),Mt.dispose(),qt.dispose(),qt.removeEventListener("sessionstart",Ge),qt.removeEventListener("sessionend",ae),St&&(St.dispose(),St=null),We.stop()};function lt(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),v=!0}function U(){console.log("THREE.WebGLRenderer: Context Restored."),v=!1;let T=Et.autoReset,N=tt.enabled,z=tt.autoUpdate,k=tt.needsUpdate,B=tt.type;ue(),Et.autoReset=T,tt.enabled=N,tt.autoUpdate=z,tt.needsUpdate=k,tt.type=B}function ht(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function ut(T){let N=T.target;N.removeEventListener("dispose",ut),Pt(N)}function Pt(T){Rt(T),mt.remove(T)}function Rt(T){let N=mt.get(T).programs;N!==void 0&&(N.forEach(function(z){Mt.releaseProgram(z)}),T.isShaderMaterial&&Mt.releaseShaderCache(T))}this.renderBufferDirect=function(T,N,z,k,B,gt){N===null&&(N=bt);let wt=B.isMesh&&B.matrixWorld.determinant()<0,Ct=y_(T,N,z,k,B);q.setMaterial(k,wt);let Ut=z.index,Xt=1;if(k.wireframe===!0){if(Ut=j.getWireframeAttribute(z),Ut===void 0)return;Xt=2}let Ot=z.drawRange,zt=z.attributes.position,me=Ot.start*Xt,tn=(Ot.start+Ot.count)*Xt;gt!==null&&(me=Math.max(me,gt.start*Xt),tn=Math.min(tn,(gt.start+gt.count)*Xt)),Ut!==null?(me=Math.max(me,0),tn=Math.min(tn,Ut.count)):zt!=null&&(me=Math.max(me,0),tn=Math.min(tn,zt.count));let Te=tn-me;if(Te<0||Te===1/0)return;Vt.setup(B,k,Ct,z,Ut);let Hn,ce=Nt;if(Ut!==null&&(Hn=it.get(Ut),ce=At,ce.setIndex(Hn)),B.isMesh)k.wireframe===!0?(q.setLineWidth(k.wireframeLinewidth*Dt()),ce.setMode(P.LINES)):ce.setMode(P.TRIANGLES);else if(B.isLine){let Yt=k.linewidth;Yt===void 0&&(Yt=1),q.setLineWidth(Yt*Dt()),B.isLineSegments?ce.setMode(P.LINES):B.isLineLoop?ce.setMode(P.LINE_LOOP):ce.setMode(P.LINE_STRIP)}else B.isPoints?ce.setMode(P.POINTS):B.isSprite&&ce.setMode(P.TRIANGLES);if(B.isBatchedMesh)ce.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else if(B.isInstancedMesh)ce.renderInstances(me,Te,B.count);else if(z.isInstancedBufferGeometry){let Yt=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,Bc=Math.min(z.instanceCount,Yt);ce.renderInstances(me,Te,Bc)}else ce.render(me,Te)};function re(T,N,z){T.transparent===!0&&T.side===Nn&&T.forceSinglePass===!1?(T.side=Ze,T.needsUpdate=!0,eo(T,N,z),T.side=li,T.needsUpdate=!0,eo(T,N,z),T.side=Nn):eo(T,N,z)}this.compile=function(T,N,z=null){z===null&&(z=T),g=Tt.get(z),g.init(),y.push(g),z.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(g.pushLight(B),B.castShadow&&g.pushShadow(B))}),T!==z&&T.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(g.pushLight(B),B.castShadow&&g.pushShadow(B))}),g.setupLights(x._useLegacyLights);let k=new Set;return T.traverse(function(B){let gt=B.material;if(gt)if(Array.isArray(gt))for(let wt=0;wt<gt.length;wt++){let Ct=gt[wt];re(Ct,z,B),k.add(Ct)}else re(gt,z,B),k.add(gt)}),y.pop(),g=null,k},this.compileAsync=function(T,N,z=null){let k=this.compile(T,N,z);return new Promise(B=>{function gt(){if(k.forEach(function(wt){mt.get(wt).currentProgram.isReady()&&k.delete(wt)}),k.size===0){B(T);return}setTimeout(gt,10)}Y.get("KHR_parallel_shader_compile")!==null?gt():setTimeout(gt,10)})};let se=null;function Ae(T){se&&se(T)}function Ge(){We.stop()}function ae(){We.start()}let We=new n_;We.setAnimationLoop(Ae),typeof self<"u"&&We.setContext(self),this.setAnimationLoop=function(T){se=T,qt.setAnimationLoop(T),T===null?We.stop():We.start()},qt.addEventListener("sessionstart",Ge),qt.addEventListener("sessionend",ae),this.render=function(T,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(v===!0)return;T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),qt.enabled===!0&&qt.isPresenting===!0&&(qt.cameraAutoUpdate===!0&&qt.updateCamera(N),N=qt.getCamera()),T.isScene===!0&&T.onBeforeRender(x,T,N,w),g=Tt.get(T,y.length),g.init(),y.push(g),_t.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),W.setFromProjectionMatrix(_t),dt=this.localClippingEnabled,Q=Bt.init(this.clippingPlanes,dt),_=xt.get(T,p.length),_.init(),p.push(_),An(T,N,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(Z,X),this.info.render.frame++,Q===!0&&Bt.beginShadows();let z=g.state.shadowsArray;if(tt.render(z,T,N),Q===!0&&Bt.endShadows(),this.info.autoReset===!0&&this.info.reset(),Jt.render(_,T),g.setupLights(x._useLegacyLights),N.isArrayCamera){let k=N.cameras;for(let B=0,gt=k.length;B<gt;B++){let wt=k[B];Rd(_,T,wt,wt.viewport)}}else Rd(_,T,N);w!==null&&(A.updateMultisampleRenderTarget(w),A.updateRenderTargetMipmap(w)),T.isScene===!0&&T.onAfterRender(x,T,N),Vt.resetDefaultState(),I=-1,M=null,y.pop(),y.length>0?g=y[y.length-1]:g=null,p.pop(),p.length>0?_=p[p.length-1]:_=null};function An(T,N,z,k){if(T.visible===!1)return;if(T.layers.test(N.layers)){if(T.isGroup)z=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(N);else if(T.isLight)g.pushLight(T),T.castShadow&&g.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||W.intersectsSprite(T)){k&&Ft.setFromMatrixPosition(T.matrixWorld).applyMatrix4(_t);let wt=K.update(T),Ct=T.material;Ct.visible&&_.push(T,wt,Ct,z,Ft.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||W.intersectsObject(T))){let wt=K.update(T),Ct=T.material;if(k&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ft.copy(T.boundingSphere.center)):(wt.boundingSphere===null&&wt.computeBoundingSphere(),Ft.copy(wt.boundingSphere.center)),Ft.applyMatrix4(T.matrixWorld).applyMatrix4(_t)),Array.isArray(Ct)){let Ut=wt.groups;for(let Xt=0,Ot=Ut.length;Xt<Ot;Xt++){let zt=Ut[Xt],me=Ct[zt.materialIndex];me&&me.visible&&_.push(T,wt,me,z,Ft.z,zt)}}else Ct.visible&&_.push(T,wt,Ct,z,Ft.z,null)}}let gt=T.children;for(let wt=0,Ct=gt.length;wt<Ct;wt++)An(gt[wt],N,z,k)}function Rd(T,N,z,k){let B=T.opaque,gt=T.transmissive,wt=T.transparent;g.setupLightsView(z),Q===!0&&Bt.setGlobalState(x.clippingPlanes,z),gt.length>0&&x_(B,gt,N,z),k&&q.viewport(S.copy(k)),B.length>0&&to(B,N,z),gt.length>0&&to(gt,N,z),wt.length>0&&to(wt,N,z),q.buffers.depth.setTest(!0),q.buffers.depth.setMask(!0),q.buffers.color.setMask(!0),q.setPolygonOffset(!1)}function x_(T,N,z,k){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;let gt=st.isWebGL2;St===null&&(St=new ln(1,1,{generateMipmaps:!0,type:Y.has("EXT_color_buffer_half_float")?hs:si,minFilter:Pi,samples:gt?4:0})),x.getDrawingBufferSize(It),gt?St.setSize(It.x,It.y):St.setSize(vl(It.x),vl(It.y));let wt=x.getRenderTarget();x.setRenderTarget(St),x.getClearColor(rt),L=x.getClearAlpha(),L<1&&x.setClearColor(16777215,.5),x.clear();let Ct=x.toneMapping;x.toneMapping=ri,to(T,z,k),A.updateMultisampleRenderTarget(St),A.updateRenderTargetMipmap(St);let Ut=!1;for(let Xt=0,Ot=N.length;Xt<Ot;Xt++){let zt=N[Xt],me=zt.object,tn=zt.geometry,Te=zt.material,Hn=zt.group;if(Te.side===Nn&&me.layers.test(k.layers)){let ce=Te.side;Te.side=Ze,Te.needsUpdate=!0,Cd(me,z,k,tn,Te,Hn),Te.side=ce,Te.needsUpdate=!0,Ut=!0}}Ut===!0&&(A.updateMultisampleRenderTarget(St),A.updateRenderTargetMipmap(St)),x.setRenderTarget(wt),x.setClearColor(rt,L),x.toneMapping=Ct}function to(T,N,z){let k=N.isScene===!0?N.overrideMaterial:null;for(let B=0,gt=T.length;B<gt;B++){let wt=T[B],Ct=wt.object,Ut=wt.geometry,Xt=k===null?wt.material:k,Ot=wt.group;Ct.layers.test(z.layers)&&Cd(Ct,N,z,Ut,Xt,Ot)}}function Cd(T,N,z,k,B,gt){T.onBeforeRender(x,N,z,k,B,gt),T.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),B.onBeforeRender(x,N,z,k,T,gt),B.transparent===!0&&B.side===Nn&&B.forceSinglePass===!1?(B.side=Ze,B.needsUpdate=!0,x.renderBufferDirect(z,N,k,B,T,gt),B.side=li,B.needsUpdate=!0,x.renderBufferDirect(z,N,k,B,T,gt),B.side=Nn):x.renderBufferDirect(z,N,k,B,T,gt),T.onAfterRender(x,N,z,k,B,gt)}function eo(T,N,z){N.isScene!==!0&&(N=bt);let k=mt.get(T),B=g.state.lights,gt=g.state.shadowsArray,wt=B.state.version,Ct=Mt.getParameters(T,B.state,gt,N,z),Ut=Mt.getProgramCacheKey(Ct),Xt=k.programs;k.environment=T.isMeshStandardMaterial?N.environment:null,k.fog=N.fog,k.envMap=(T.isMeshStandardMaterial?F:b).get(T.envMap||k.environment),Xt===void 0&&(T.addEventListener("dispose",ut),Xt=new Map,k.programs=Xt);let Ot=Xt.get(Ut);if(Ot!==void 0){if(k.currentProgram===Ot&&k.lightsStateVersion===wt)return Pd(T,Ct),Ot}else Ct.uniforms=Mt.getUniforms(T),T.onBuild(z,Ct,x),T.onBeforeCompile(Ct,x),Ot=Mt.acquireProgram(Ct,Ut),Xt.set(Ut,Ot),k.uniforms=Ct.uniforms;let zt=k.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(zt.clippingPlanes=Bt.uniform),Pd(T,Ct),k.needsLights=M_(T),k.lightsStateVersion=wt,k.needsLights&&(zt.ambientLightColor.value=B.state.ambient,zt.lightProbe.value=B.state.probe,zt.directionalLights.value=B.state.directional,zt.directionalLightShadows.value=B.state.directionalShadow,zt.spotLights.value=B.state.spot,zt.spotLightShadows.value=B.state.spotShadow,zt.rectAreaLights.value=B.state.rectArea,zt.ltc_1.value=B.state.rectAreaLTC1,zt.ltc_2.value=B.state.rectAreaLTC2,zt.pointLights.value=B.state.point,zt.pointLightShadows.value=B.state.pointShadow,zt.hemisphereLights.value=B.state.hemi,zt.directionalShadowMap.value=B.state.directionalShadowMap,zt.directionalShadowMatrix.value=B.state.directionalShadowMatrix,zt.spotShadowMap.value=B.state.spotShadowMap,zt.spotLightMatrix.value=B.state.spotLightMatrix,zt.spotLightMap.value=B.state.spotLightMap,zt.pointShadowMap.value=B.state.pointShadowMap,zt.pointShadowMatrix.value=B.state.pointShadowMatrix),k.currentProgram=Ot,k.uniformsList=null,Ot}function Id(T){if(T.uniformsList===null){let N=T.currentProgram.getUniforms();T.uniformsList=cs.seqWithValue(N.seq,T.uniforms)}return T.uniformsList}function Pd(T,N){let z=mt.get(T);z.outputColorSpace=N.outputColorSpace,z.batching=N.batching,z.instancing=N.instancing,z.instancingColor=N.instancingColor,z.skinning=N.skinning,z.morphTargets=N.morphTargets,z.morphNormals=N.morphNormals,z.morphColors=N.morphColors,z.morphTargetsCount=N.morphTargetsCount,z.numClippingPlanes=N.numClippingPlanes,z.numIntersection=N.numClipIntersection,z.vertexAlphas=N.vertexAlphas,z.vertexTangents=N.vertexTangents,z.toneMapping=N.toneMapping}function y_(T,N,z,k,B){N.isScene!==!0&&(N=bt),A.resetTextureUnits();let gt=N.fog,wt=k.isMeshStandardMaterial?N.environment:null,Ct=w===null?x.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:On,Ut=(k.isMeshStandardMaterial?F:b).get(k.envMap||wt),Xt=k.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ot=!!z.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),zt=!!z.morphAttributes.position,me=!!z.morphAttributes.normal,tn=!!z.morphAttributes.color,Te=ri;k.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(Te=x.toneMapping);let Hn=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ce=Hn!==void 0?Hn.length:0,Yt=mt.get(k),Bc=g.state.lights;if(Q===!0&&(dt===!0||T!==M)){let un=T===M&&k.id===I;Bt.setState(k,T,un)}let fe=!1;k.version===Yt.__version?(Yt.needsLights&&Yt.lightsStateVersion!==Bc.state.version||Yt.outputColorSpace!==Ct||B.isBatchedMesh&&Yt.batching===!1||!B.isBatchedMesh&&Yt.batching===!0||B.isInstancedMesh&&Yt.instancing===!1||!B.isInstancedMesh&&Yt.instancing===!0||B.isSkinnedMesh&&Yt.skinning===!1||!B.isSkinnedMesh&&Yt.skinning===!0||B.isInstancedMesh&&Yt.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&Yt.instancingColor===!1&&B.instanceColor!==null||Yt.envMap!==Ut||k.fog===!0&&Yt.fog!==gt||Yt.numClippingPlanes!==void 0&&(Yt.numClippingPlanes!==Bt.numPlanes||Yt.numIntersection!==Bt.numIntersection)||Yt.vertexAlphas!==Xt||Yt.vertexTangents!==Ot||Yt.morphTargets!==zt||Yt.morphNormals!==me||Yt.morphColors!==tn||Yt.toneMapping!==Te||st.isWebGL2===!0&&Yt.morphTargetsCount!==ce)&&(fe=!0):(fe=!0,Yt.__version=k.version);let Oi=Yt.currentProgram;fe===!0&&(Oi=eo(k,N,B));let Ld=!1,ws=!1,zc=!1,Fe=Oi.getUniforms(),Bi=Yt.uniforms;if(q.useProgram(Oi.program)&&(Ld=!0,ws=!0,zc=!0),k.id!==I&&(I=k.id,ws=!0),Ld||M!==T){Fe.setValue(P,"projectionMatrix",T.projectionMatrix),Fe.setValue(P,"viewMatrix",T.matrixWorldInverse);let un=Fe.map.cameraPosition;un!==void 0&&un.setValue(P,Ft.setFromMatrixPosition(T.matrixWorld)),st.logarithmicDepthBuffer&&Fe.setValue(P,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&Fe.setValue(P,"isOrthographic",T.isOrthographicCamera===!0),M!==T&&(M=T,ws=!0,zc=!0)}if(B.isSkinnedMesh){Fe.setOptional(P,B,"bindMatrix"),Fe.setOptional(P,B,"bindMatrixInverse");let un=B.skeleton;un&&(st.floatVertexTextures?(un.boneTexture===null&&un.computeBoneTexture(),Fe.setValue(P,"boneTexture",un.boneTexture,A)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}B.isBatchedMesh&&(Fe.setOptional(P,B,"batchingTexture"),Fe.setValue(P,"batchingTexture",B._matricesTexture,A));let kc=z.morphAttributes;if((kc.position!==void 0||kc.normal!==void 0||kc.color!==void 0&&st.isWebGL2===!0)&&Zt.update(B,z,Oi),(ws||Yt.receiveShadow!==B.receiveShadow)&&(Yt.receiveShadow=B.receiveShadow,Fe.setValue(P,"receiveShadow",B.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(Bi.envMap.value=Ut,Bi.flipEnvMap.value=Ut.isCubeTexture&&Ut.isRenderTargetTexture===!1?-1:1),ws&&(Fe.setValue(P,"toneMappingExposure",x.toneMappingExposure),Yt.needsLights&&v_(Bi,zc),gt&&k.fog===!0&&ct.refreshFogUniforms(Bi,gt),ct.refreshMaterialUniforms(Bi,k,J,H,St),cs.upload(P,Id(Yt),Bi,A)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(cs.upload(P,Id(Yt),Bi,A),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&Fe.setValue(P,"center",B.center),Fe.setValue(P,"modelViewMatrix",B.modelViewMatrix),Fe.setValue(P,"normalMatrix",B.normalMatrix),Fe.setValue(P,"modelMatrix",B.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){let un=k.uniformsGroups;for(let Hc=0,S_=un.length;Hc<S_;Hc++)if(st.isWebGL2){let Ud=un[Hc];te.update(Ud,Oi),te.bind(Ud,Oi)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Oi}function v_(T,N){T.ambientLightColor.needsUpdate=N,T.lightProbe.needsUpdate=N,T.directionalLights.needsUpdate=N,T.directionalLightShadows.needsUpdate=N,T.pointLights.needsUpdate=N,T.pointLightShadows.needsUpdate=N,T.spotLights.needsUpdate=N,T.spotLightShadows.needsUpdate=N,T.rectAreaLights.needsUpdate=N,T.hemisphereLights.needsUpdate=N}function M_(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(T,N,z){mt.get(T.texture).__webglTexture=N,mt.get(T.depthTexture).__webglTexture=z;let k=mt.get(T);k.__hasExternalTextures=!0,k.__hasExternalTextures&&(k.__autoAllocateDepthBuffer=z===void 0,k.__autoAllocateDepthBuffer||Y.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),k.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(T,N){let z=mt.get(T);z.__webglFramebuffer=N,z.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(T,N=0,z=0){w=T,R=N,E=z;let k=!0,B=null,gt=!1,wt=!1;if(T){let Ut=mt.get(T);Ut.__useDefaultFramebuffer!==void 0?(q.bindFramebuffer(P.FRAMEBUFFER,null),k=!1):Ut.__webglFramebuffer===void 0?A.setupRenderTarget(T):Ut.__hasExternalTextures&&A.rebindTextures(T,mt.get(T.texture).__webglTexture,mt.get(T.depthTexture).__webglTexture);let Xt=T.texture;(Xt.isData3DTexture||Xt.isDataArrayTexture||Xt.isCompressedArrayTexture)&&(wt=!0);let Ot=mt.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ot[N])?B=Ot[N][z]:B=Ot[N],gt=!0):st.isWebGL2&&T.samples>0&&A.useMultisampledRTT(T)===!1?B=mt.get(T).__webglMultisampledFramebuffer:Array.isArray(Ot)?B=Ot[z]:B=Ot,S.copy(T.viewport),D.copy(T.scissor),V=T.scissorTest}else S.copy(et).multiplyScalar(J).floor(),D.copy(nt).multiplyScalar(J).floor(),V=ft;if(q.bindFramebuffer(P.FRAMEBUFFER,B)&&st.drawBuffers&&k&&q.drawBuffers(T,B),q.viewport(S),q.scissor(D),q.setScissorTest(V),gt){let Ut=mt.get(T.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+N,Ut.__webglTexture,z)}else if(wt){let Ut=mt.get(T.texture),Xt=N||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,Ut.__webglTexture,z||0,Xt)}I=-1},this.readRenderTargetPixels=function(T,N,z,k,B,gt,wt){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=mt.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&wt!==void 0&&(Ct=Ct[wt]),Ct){q.bindFramebuffer(P.FRAMEBUFFER,Ct);try{let Ut=T.texture,Xt=Ut.format,Ot=Ut.type;if(Xt!==Qe&&vt.convert(Xt)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let zt=Ot===hs&&(Y.has("EXT_color_buffer_half_float")||st.isWebGL2&&Y.has("EXT_color_buffer_float"));if(Ot!==si&&vt.convert(Ot)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ot===Sn&&(st.isWebGL2||Y.has("OES_texture_float")||Y.has("WEBGL_color_buffer_float")))&&!zt){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=T.width-k&&z>=0&&z<=T.height-B&&P.readPixels(N,z,k,B,vt.convert(Xt),vt.convert(Ot),gt)}finally{let Ut=w!==null?mt.get(w).__webglFramebuffer:null;q.bindFramebuffer(P.FRAMEBUFFER,Ut)}}},this.copyFramebufferToTexture=function(T,N,z=0){let k=Math.pow(2,-z),B=Math.floor(N.image.width*k),gt=Math.floor(N.image.height*k);A.setTexture2D(N,0),P.copyTexSubImage2D(P.TEXTURE_2D,z,0,0,T.x,T.y,B,gt),q.unbindTexture()},this.copyTextureToTexture=function(T,N,z,k=0){let B=N.image.width,gt=N.image.height,wt=vt.convert(z.format),Ct=vt.convert(z.type);A.setTexture2D(z,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,z.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,z.unpackAlignment),N.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,k,T.x,T.y,B,gt,wt,Ct,N.image.data):N.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,k,T.x,T.y,N.mipmaps[0].width,N.mipmaps[0].height,wt,N.mipmaps[0].data):P.texSubImage2D(P.TEXTURE_2D,k,T.x,T.y,wt,Ct,N.image),k===0&&z.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),q.unbindTexture()},this.copyTextureToTexture3D=function(T,N,z,k,B=0){if(x.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let gt=T.max.x-T.min.x+1,wt=T.max.y-T.min.y+1,Ct=T.max.z-T.min.z+1,Ut=vt.convert(k.format),Xt=vt.convert(k.type),Ot;if(k.isData3DTexture)A.setTexture3D(k,0),Ot=P.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)A.setTexture2DArray(k,0),Ot=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);let zt=P.getParameter(P.UNPACK_ROW_LENGTH),me=P.getParameter(P.UNPACK_IMAGE_HEIGHT),tn=P.getParameter(P.UNPACK_SKIP_PIXELS),Te=P.getParameter(P.UNPACK_SKIP_ROWS),Hn=P.getParameter(P.UNPACK_SKIP_IMAGES),ce=z.isCompressedTexture?z.mipmaps[B]:z.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,ce.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,ce.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,T.min.x),P.pixelStorei(P.UNPACK_SKIP_ROWS,T.min.y),P.pixelStorei(P.UNPACK_SKIP_IMAGES,T.min.z),z.isDataTexture||z.isData3DTexture?P.texSubImage3D(Ot,B,N.x,N.y,N.z,gt,wt,Ct,Ut,Xt,ce.data):z.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),P.compressedTexSubImage3D(Ot,B,N.x,N.y,N.z,gt,wt,Ct,Ut,ce.data)):P.texSubImage3D(Ot,B,N.x,N.y,N.z,gt,wt,Ct,Ut,Xt,ce),P.pixelStorei(P.UNPACK_ROW_LENGTH,zt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,me),P.pixelStorei(P.UNPACK_SKIP_PIXELS,tn),P.pixelStorei(P.UNPACK_SKIP_ROWS,Te),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Hn),B===0&&k.generateMipmaps&&P.generateMipmap(Ot),q.unbindTexture()},this.initTexture=function(T){T.isCubeTexture?A.setTextureCube(T,0):T.isData3DTexture?A.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?A.setTexture2DArray(T,0):A.setTexture2D(T,0),q.unbindTexture()},this.resetState=function(){R=0,E=0,w=null,q.reset(),Vt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return bn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=t===Nc?"display-p3":"srgb",e.unpackColorSpace=ne.workingColorSpace===ja?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===Me?Ci:vd}set outputEncoding(t){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=t===Ci?Me:On}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(t){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=t}},Al=class extends El{};Al.prototype.isWebGL1Renderer=!0;var Tl=class n{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new pt(t),this.density=e}clone(){return new n(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}},Rl=class n{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new pt(t),this.near=e,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Cl=class extends jt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e}},xs=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=ya,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=on()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let r=0,s=this.stride;r<s;r++)this.array[t+r]=e.array[i+r];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=on()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=on()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},qe=new C,_r=class n{constructor(t,e,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)qe.fromBufferAttribute(this,e),qe.applyMatrix4(t),this.setXYZ(e,qe.x,qe.y,qe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)qe.fromBufferAttribute(this,e),qe.applyNormalMatrix(t),this.setXYZ(e,qe.x,qe.y,qe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)qe.fromBufferAttribute(this,e),qe.transformDirection(t),this.setXYZ(e,qe.x,qe.y,qe.z);return this}setX(t,e){return this.normalized&&(e=Ht(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Ht(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Ht(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Ht(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=je(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=je(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=je(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=je(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array),r=Ht(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=r,this}setXYZW(t,e,i,r,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ht(e,this.array),i=Ht(i,this.array),r=Ht(r,this.array),s=Ht(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=r,this.data.array[t+3]=s,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[r+s])}return new Qt(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new n(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Pa=class extends Le{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new pt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Qr,Zs=new C,jr=new C,ts=new C,es=new $,$s=new $,c_=new Lt,ko=new C,Js=new C,Ho=new C,rg=new $,Qh=new $,sg=new $,Il=class extends jt{constructor(t=new Pa){if(super(),this.isSprite=!0,this.type="Sprite",Qr===void 0){Qr=new Wt;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new xs(e,5);Qr.setIndex([0,1,2,0,2,3]),Qr.setAttribute("position",new _r(i,3,0,!1)),Qr.setAttribute("uv",new _r(i,2,3,!1))}this.geometry=Qr,this.material=t,this.center=new $(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),jr.setFromMatrixScale(this.matrixWorld),c_.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),ts.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&jr.multiplyScalar(-ts.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let a=this.center;Vo(ko.set(-.5,-.5,0),ts,a,jr,r,s),Vo(Js.set(.5,-.5,0),ts,a,jr,r,s),Vo(Ho.set(.5,.5,0),ts,a,jr,r,s),rg.set(0,0),Qh.set(1,0),sg.set(1,1);let o=t.ray.intersectTriangle(ko,Js,Ho,!1,Zs);if(o===null&&(Vo(Js.set(-.5,.5,0),ts,a,jr,r,s),Qh.set(0,1),o=t.ray.intersectTriangle(ko,Ho,Js,!1,Zs),o===null))return;let c=t.ray.origin.distanceTo(Zs);c<t.near||c>t.far||e.push({distance:c,point:Zs.clone(),uv:ei.getInterpolation(Zs,ko,Js,Ho,rg,Qh,sg,new $),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Vo(n,t,e,i,r,s){es.subVectors(n,e).addScalar(.5).multiply(i),r!==void 0?($s.x=s*es.x-r*es.y,$s.y=r*es.x+s*es.y):$s.copy(es),n.copy(t),n.x+=$s.x,n.y+=$s.y,n.applyMatrix4(c_)}var Go=new C,ag=new C,Pl=class extends jt{constructor(){super(),this._currentLevel=0,this.type="LOD",Object.defineProperties(this,{levels:{enumerable:!0,value:[]},isLOD:{value:!0}}),this.autoUpdate=!0}copy(t){super.copy(t,!1);let e=t.levels;for(let i=0,r=e.length;i<r;i++){let s=e[i];this.addLevel(s.object.clone(),s.distance,s.hysteresis)}return this.autoUpdate=t.autoUpdate,this}addLevel(t,e=0,i=0){e=Math.abs(e);let r=this.levels,s;for(s=0;s<r.length&&!(e<r[s].distance);s++);return r.splice(s,0,{distance:e,hysteresis:i,object:t}),this.add(t),this}getCurrentLevel(){return this._currentLevel}getObjectForDistance(t){let e=this.levels;if(e.length>0){let i,r;for(i=1,r=e.length;i<r;i++){let s=e[i].distance;if(e[i].object.visible&&(s-=s*e[i].hysteresis),t<s)break}return e[i-1].object}return null}raycast(t,e){if(this.levels.length>0){Go.setFromMatrixPosition(this.matrixWorld);let r=t.ray.origin.distanceTo(Go);this.getObjectForDistance(r).raycast(t,e)}}update(t){let e=this.levels;if(e.length>1){Go.setFromMatrixPosition(t.matrixWorld),ag.setFromMatrixPosition(this.matrixWorld);let i=Go.distanceTo(ag)/t.zoom;e[0].object.visible=!0;let r,s;for(r=1,s=e.length;r<s;r++){let a=e[r].distance;if(e[r].object.visible&&(a-=a*e[r].hysteresis),i>=a)e[r-1].object.visible=!1,e[r].object.visible=!0;else break}for(this._currentLevel=r-1;r<s;r++)e[r].object.visible=!1}}toJSON(t){let e=super.toJSON(t);this.autoUpdate===!1&&(e.object.autoUpdate=!1),e.object.levels=[];let i=this.levels;for(let r=0,s=i.length;r<s;r++){let a=i[r];e.object.levels.push({object:a.object.uuid,distance:a.distance,hysteresis:a.hysteresis})}return e}},og=new C,lg=new ie,cg=new ie,YE=new C,hg=new Lt,Wo=new C,jh=new Pe,ug=new Lt,tu=new Li,Ll=class extends ye{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=xu,this.bindMatrix=new Lt,this.bindMatrixInverse=new Lt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;this.boundingBox===null&&(this.boundingBox=new De),this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,Wo),this.boundingBox.expandByPoint(Wo)}computeBoundingSphere(){let t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Pe),this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,Wo),this.boundingSphere.expandByPoint(Wo)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}raycast(t,e){let i=this.material,r=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),jh.copy(this.boundingSphere),jh.applyMatrix4(r),t.ray.intersectsSphere(jh)!==!1&&(ug.copy(r).invert(),tu.copy(t.ray).applyMatrix4(ug),!(this.boundingBox!==null&&tu.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,tu)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new ie,e=this.geometry.attributes.skinWeight;for(let i=0,r=e.count;i<r;i++){t.fromBufferAttribute(e,i);let s=1/t.manhattanLength();s!==1/0?t.multiplyScalar(s):t.set(1,0,0,0),e.setXYZW(i,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===xu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===C0?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let i=this.skeleton,r=this.geometry;lg.fromBufferAttribute(r.attributes.skinIndex,t),cg.fromBufferAttribute(r.attributes.skinWeight,t),og.copy(e).applyMatrix4(this.bindMatrix),e.set(0,0,0);for(let s=0;s<4;s++){let a=cg.getComponent(s);if(a!==0){let o=lg.getComponent(s);hg.multiplyMatrices(i.bones[o].matrixWorld,i.boneInverses[o]),e.addScaledVector(YE.copy(og).applyMatrix4(hg),a)}}return e.applyMatrix4(this.bindMatrixInverse)}boneTransform(t,e){return console.warn("THREE.SkinnedMesh: .boneTransform() was renamed to .applyBoneTransform() in r151."),this.applyBoneTransform(t,e)}},La=class extends jt{constructor(){super(),this.isBone=!0,this.type="Bone"}},ai=class extends be{constructor(t=null,e=1,i=1,r,s,a,o,c,l=_e,h=_e,u,f){super(null,a,o,c,l,h,r,s,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},fg=new Lt,ZE=new Lt,Ul=class n{constructor(t=[],e=[]){this.uuid=on(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,r=this.bones.length;i<r;i++)this.boneInverses.push(new Lt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let i=new Lt;this.bones[t]&&i.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&i.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let t=this.bones,e=this.boneInverses,i=this.boneMatrices,r=this.boneTexture;for(let s=0,a=t.length;s<a;s++){let o=t[s]?t[s].matrixWorld:ZE;fg.multiplyMatrices(o,e[s]),fg.toArray(i,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new n(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let i=new ai(e,t,t,Qe,Sn);return i.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=i,this}getBoneByName(t){for(let e=0,i=this.bones.length;e<i;e++){let r=this.bones[e];if(r.name===t)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let i=0,r=t.bones.length;i<r;i++){let s=t.bones[i],a=e[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new La),this.bones.push(a),this.boneInverses.push(new Lt().fromArray(t.boneInverses[i]))}return this.init(),this}toJSON(){let t={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,i=this.boneInverses;for(let r=0,s=e.length;r<s;r++){let a=e[r];t.bones.push(a.uuid);let o=i[r];t.boneInverses.push(o.toArray())}return t}},Ui=class extends Qt{constructor(t,e,i,r=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},ns=new Lt,dg=new Lt,Xo=[],pg=new De,$E=new Lt,Ks=new ye,Qs=new Pe,Dl=class extends ye{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Ui(new Float32Array(i*16),16),this.instanceColor=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,$E)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new De),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,ns),pg.copy(t.boundingBox).applyMatrix4(ns),this.boundingBox.union(pg)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Pe),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,ns),Qs.copy(t.boundingSphere).applyMatrix4(ns),this.boundingSphere.union(Qs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}raycast(t,e){let i=this.matrixWorld,r=this.count;if(Ks.geometry=this.geometry,Ks.material=this.material,Ks.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Qs.copy(this.boundingSphere),Qs.applyMatrix4(i),t.ray.intersectsSphere(Qs)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,ns),dg.multiplyMatrices(i,ns),Ks.matrixWorld=dg,Ks.raycast(t,Xo);for(let a=0,o=Xo.length;a<o;a++){let c=Xo[a];c.instanceId=s,c.object=this,e.push(c)}Xo.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Ui(new Float32Array(this.instanceMatrix.count*3),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};function JE(n,t){return n.z-t.z}function KE(n,t){return t.z-n.z}var uf=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(t,e){let i=this.pool,r=this.list;this.index>=i.length&&i.push({start:-1,count:-1,z:-1});let s=i[this.index];r.push(s),this.index++,s.start=t.start,s.count=t.count,s.z=e}reset(){this.list.length=0,this.index=0}},is="batchId",bi=new Lt,mg=new Lt,QE=new Lt,gg=new Lt,eu=new gr,qo=new De,ji=new Pe,js=new C,nu=new uf,ze=new ye,Yo=[];function jE(n,t,e=0){let i=t.itemSize;if(n.isInterleavedBufferAttribute||n.array.constructor!==t.array.constructor){let r=n.count;for(let s=0;s<r;s++)for(let a=0;a<i;a++)t.setComponent(s+e,a,n.getComponent(s,a))}else t.array.set(n.array,e*i);t.needsUpdate=!0}var Nl=class extends ye{get maxGeometryCount(){return this._maxGeometryCount}constructor(t,e,i=e*2,r){super(new Wt,r),this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._drawRanges=[],this._reservedRanges=[],this._visibility=[],this._active=[],this._bounds=[],this._maxGeometryCount=t,this._maxVertexCount=e,this._maxIndexCount=i,this._geometryInitialized=!1,this._geometryCount=0,this._multiDrawCounts=new Int32Array(t),this._multiDrawStarts=new Int32Array(t),this._multiDrawCount=0,this._visibilityChanged=!0,this._matricesTexture=null,this._initMatricesTexture()}_initMatricesTexture(){let t=Math.sqrt(this._maxGeometryCount*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4),i=new ai(e,t,t,Qe,Sn);this._matricesTexture=i}_initializeGeometry(t){let e=this.geometry,i=this._maxVertexCount,r=this._maxGeometryCount,s=this._maxIndexCount;if(this._geometryInitialized===!1){for(let o in t.attributes){let c=t.getAttribute(o),{array:l,itemSize:h,normalized:u}=c,f=new l.constructor(i*h),d=new c.constructor(f,h,u);d.setUsage(c.usage),e.setAttribute(o,d)}if(t.getIndex()!==null){let o=i>65536?new Uint32Array(s):new Uint16Array(s);e.setIndex(new Qt(o,1))}let a=r>65536?new Uint32Array(i):new Uint16Array(i);e.setAttribute(is,new Qt(a,1)),this._geometryInitialized=!0}}_validateGeometry(t){if(t.getAttribute(is))throw new Error(`BatchedMesh: Geometry cannot use attribute "${is}"`);let e=this.geometry;if(!!t.getIndex()!=!!e.getIndex())throw new Error('BatchedMesh: All geometries must consistently have "index".');for(let i in e.attributes){if(i===is)continue;if(!t.hasAttribute(i))throw new Error(`BatchedMesh: Added geometry missing "${i}". All geometries must have consistent attributes.`);let r=t.getAttribute(i),s=e.getAttribute(i);if(r.itemSize!==s.itemSize||r.normalized!==s.normalized)throw new Error("BatchedMesh: All attributes must have a consistent itemSize and normalized value.")}}setCustomSort(t){return this.customSort=t,this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new De);let t=this._geometryCount,e=this.boundingBox,i=this._active;e.makeEmpty();for(let r=0;r<t;r++)i[r]!==!1&&(this.getMatrixAt(r,bi),this.getBoundingBoxAt(r,qo).applyMatrix4(bi),e.union(qo))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pe);let t=this._geometryCount,e=this.boundingSphere,i=this._active;e.makeEmpty();for(let r=0;r<t;r++)i[r]!==!1&&(this.getMatrixAt(r,bi),this.getBoundingSphereAt(r,ji).applyMatrix4(bi),e.union(ji))}addGeometry(t,e=-1,i=-1){if(this._initializeGeometry(t),this._validateGeometry(t),this._geometryCount>=this._maxGeometryCount)throw new Error("BatchedMesh: Maximum geometry count reached.");let r={vertexStart:-1,vertexCount:-1,indexStart:-1,indexCount:-1},s=null,a=this._reservedRanges,o=this._drawRanges,c=this._bounds;this._geometryCount!==0&&(s=a[a.length-1]),e===-1?r.vertexCount=t.getAttribute("position").count:r.vertexCount=e,s===null?r.vertexStart=0:r.vertexStart=s.vertexStart+s.vertexCount;let l=t.getIndex(),h=l!==null;if(h&&(i===-1?r.indexCount=l.count:r.indexCount=i,s===null?r.indexStart=0:r.indexStart=s.indexStart+s.indexCount),r.indexStart!==-1&&r.indexStart+r.indexCount>this._maxIndexCount||r.vertexStart+r.vertexCount>this._maxVertexCount)throw new Error("BatchedMesh: Reserved space request exceeds the maximum buffer size.");let u=this._visibility,f=this._active,d=this._matricesTexture,m=this._matricesTexture.image.data;u.push(!0),f.push(!0);let _=this._geometryCount;this._geometryCount++,QE.toArray(m,_*16),d.needsUpdate=!0,a.push(r),o.push({start:h?r.indexStart:r.vertexStart,count:-1}),c.push({boxInitialized:!1,box:new De,sphereInitialized:!1,sphere:new Pe});let g=this.geometry.getAttribute(is);for(let p=0;p<r.vertexCount;p++)g.setX(r.vertexStart+p,_);return g.needsUpdate=!0,this.setGeometryAt(_,t),_}setGeometryAt(t,e){if(t>=this._geometryCount)throw new Error("BatchedMesh: Maximum geometry count reached.");this._validateGeometry(e);let i=this.geometry,r=i.getIndex()!==null,s=i.getIndex(),a=e.getIndex(),o=this._reservedRanges[t];if(r&&a.count>o.indexCount||e.attributes.position.count>o.vertexCount)throw new Error("BatchedMesh: Reserved space not large enough for provided geometry.");let c=o.vertexStart,l=o.vertexCount;for(let d in i.attributes){if(d===is)continue;let m=e.getAttribute(d),_=i.getAttribute(d);jE(m,_,c);let g=m.itemSize;for(let p=m.count,y=l;p<y;p++){let x=c+p;for(let v=0;v<g;v++)_.setComponent(x,v,0)}_.needsUpdate=!0}if(r){let d=o.indexStart;for(let m=0;m<a.count;m++)s.setX(d+m,c+a.getX(m));for(let m=a.count,_=o.indexCount;m<_;m++)s.setX(d+m,c);s.needsUpdate=!0}let h=this._bounds[t];e.boundingBox!==null?(h.box.copy(e.boundingBox),h.boxInitialized=!0):h.boxInitialized=!1,e.boundingSphere!==null?(h.sphere.copy(e.boundingSphere),h.sphereInitialized=!0):h.sphereInitialized=!1;let u=this._drawRanges[t],f=e.getAttribute("position");return u.count=r?a.count:f.count,this._visibilityChanged=!0,t}deleteGeometry(t){let e=this._active;return t>=e.length||e[t]===!1?this:(e[t]=!1,this._visibilityChanged=!0,this)}getBoundingBoxAt(t,e){if(this._active[t]===!1)return this;let r=this._bounds[t],s=r.box,a=this.geometry;if(r.boxInitialized===!1){s.makeEmpty();let o=a.index,c=a.attributes.position,l=this._drawRanges[t];for(let h=l.start,u=l.start+l.count;h<u;h++){let f=h;o&&(f=o.getX(f)),s.expandByPoint(js.fromBufferAttribute(c,f))}r.boxInitialized=!0}return e.copy(s),e}getBoundingSphereAt(t,e){if(this._active[t]===!1)return this;let r=this._bounds[t],s=r.sphere,a=this.geometry;if(r.sphereInitialized===!1){s.makeEmpty(),this.getBoundingBoxAt(t,qo),qo.getCenter(s.center);let o=a.index,c=a.attributes.position,l=this._drawRanges[t],h=0;for(let u=l.start,f=l.start+l.count;u<f;u++){let d=u;o&&(d=o.getX(d)),js.fromBufferAttribute(c,d),h=Math.max(h,s.center.distanceToSquared(js))}s.radius=Math.sqrt(h),r.sphereInitialized=!0}return e.copy(s),e}setMatrixAt(t,e){let i=this._active,r=this._matricesTexture,s=this._matricesTexture.image.data,a=this._geometryCount;return t>=a||i[t]===!1?this:(e.toArray(s,t*16),r.needsUpdate=!0,this)}getMatrixAt(t,e){let i=this._active,r=this._matricesTexture.image.data,s=this._geometryCount;return t>=s||i[t]===!1?null:e.fromArray(r,t*16)}setVisibleAt(t,e){let i=this._visibility,r=this._active,s=this._geometryCount;return t>=s||r[t]===!1||i[t]===e?this:(i[t]=e,this._visibilityChanged=!0,this)}getVisibleAt(t){let e=this._visibility,i=this._active,r=this._geometryCount;return t>=r||i[t]===!1?!1:e[t]}raycast(t,e){let i=this._visibility,r=this._active,s=this._drawRanges,a=this._geometryCount,o=this.matrixWorld,c=this.geometry;ze.material=this.material,ze.geometry.index=c.index,ze.geometry.attributes=c.attributes,ze.geometry.boundingBox===null&&(ze.geometry.boundingBox=new De),ze.geometry.boundingSphere===null&&(ze.geometry.boundingSphere=new Pe);for(let l=0;l<a;l++){if(!i[l]||!r[l])continue;let h=s[l];ze.geometry.setDrawRange(h.start,h.count),this.getMatrixAt(l,ze.matrixWorld).premultiply(o),this.getBoundingBoxAt(l,ze.geometry.boundingBox),this.getBoundingSphereAt(l,ze.geometry.boundingSphere),ze.raycast(t,Yo);for(let u=0,f=Yo.length;u<f;u++){let d=Yo[u];d.object=this,d.batchId=l,e.push(d)}Yo.length=0}ze.material=null,ze.geometry.index=null,ze.geometry.attributes={},ze.geometry.setDrawRange(0,1/0)}copy(t){return super.copy(t),this.geometry=t.geometry.clone(),this.perObjectFrustumCulled=t.perObjectFrustumCulled,this.sortObjects=t.sortObjects,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this._drawRanges=t._drawRanges.map(e=>({...e})),this._reservedRanges=t._reservedRanges.map(e=>({...e})),this._visibility=t._visibility.slice(),this._active=t._active.slice(),this._bounds=t._bounds.map(e=>({boxInitialized:e.boxInitialized,box:e.box.clone(),sphereInitialized:e.sphereInitialized,sphere:e.sphere.clone()})),this._maxGeometryCount=t._maxGeometryCount,this._maxVertexCount=t._maxVertexCount,this._maxIndexCount=t._maxIndexCount,this._geometryInitialized=t._geometryInitialized,this._geometryCount=t._geometryCount,this._multiDrawCounts=t._multiDrawCounts.slice(),this._multiDrawStarts=t._multiDrawStarts.slice(),this._matricesTexture=t._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.slice(),this}dispose(){return this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this}onBeforeRender(t,e,i,r,s){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let a=r.getIndex(),o=a===null?1:a.array.BYTES_PER_ELEMENT,c=this._visibility,l=this._multiDrawStarts,h=this._multiDrawCounts,u=this._drawRanges,f=this.perObjectFrustumCulled;f&&(gg.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse).multiply(this.matrixWorld),eu.setFromProjectionMatrix(gg,t.isWebGPURenderer?us:bn));let d=0;if(this.sortObjects){mg.copy(this.matrixWorld).invert(),js.setFromMatrixPosition(i.matrixWorld).applyMatrix4(mg);for(let g=0,p=c.length;g<p;g++)if(c[g]){this.getMatrixAt(g,bi),this.getBoundingSphereAt(g,ji).applyMatrix4(bi);let y=!1;if(f&&(y=!eu.intersectsSphere(ji)),!y){let x=js.distanceTo(ji.center);nu.push(u[g],x)}}let m=nu.list,_=this.customSort;_===null?m.sort(s.transparent?KE:JE):_.call(this,m,i);for(let g=0,p=m.length;g<p;g++){let y=m[g];l[d]=y.start*o,h[d]=y.count,d++}nu.reset()}else for(let m=0,_=c.length;m<_;m++)if(c[m]){let g=!1;if(f&&(this.getMatrixAt(m,bi),this.getBoundingSphereAt(m,ji).applyMatrix4(bi),g=!eu.intersectsSphere(ji)),!g){let p=u[m];l[d]=p.start*o,h[d]=p.count,d++}}this._multiDrawCount=d,this._visibilityChanged=!1}onBeforeShadow(t,e,i,r,s,a){this.onBeforeRender(t,null,r,s,a)}},Ne=class extends Le{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new pt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},_g=new C,xg=new C,yg=new Lt,iu=new Li,Zo=new Pe,zn=class extends jt{constructor(t=new Wt,e=new Ne){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let r=1,s=e.count;r<s;r++)_g.fromBufferAttribute(e,r-1),xg.fromBufferAttribute(e,r),i[r]=i[r-1],i[r]+=_g.distanceTo(xg);t.setAttribute("lineDistance",new yt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let i=this.geometry,r=this.matrixWorld,s=t.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Zo.copy(i.boundingSphere),Zo.applyMatrix4(r),Zo.radius+=s,t.ray.intersectsSphere(Zo)===!1)return;yg.copy(r).invert(),iu.copy(t.ray).applyMatrix4(yg);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=new C,h=new C,u=new C,f=new C,d=this.isLineSegments?2:1,m=i.index,g=i.attributes.position;if(m!==null){let p=Math.max(0,a.start),y=Math.min(m.count,a.start+a.count);for(let x=p,v=y-1;x<v;x+=d){let R=m.getX(x),E=m.getX(x+1);if(l.fromBufferAttribute(g,R),h.fromBufferAttribute(g,E),iu.distanceSqToSegment(l,h,f,u)>c)continue;f.applyMatrix4(this.matrixWorld);let I=t.ray.origin.distanceTo(f);I<t.near||I>t.far||e.push({distance:I,point:u.clone().applyMatrix4(this.matrixWorld),index:x,face:null,faceIndex:null,object:this})}}else{let p=Math.max(0,a.start),y=Math.min(g.count,a.start+a.count);for(let x=p,v=y-1;x<v;x+=d){if(l.fromBufferAttribute(g,x),h.fromBufferAttribute(g,x+1),iu.distanceSqToSegment(l,h,f,u)>c)continue;f.applyMatrix4(this.matrixWorld);let E=t.ray.origin.distanceTo(f);E<t.near||E>t.far||e.push({distance:E,point:u.clone().applyMatrix4(this.matrixWorld),index:x,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let r=e[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}},vg=new C,Mg=new C,_n=class extends zn{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let r=0,s=e.count;r<s;r+=2)vg.fromBufferAttribute(e,r),Mg.fromBufferAttribute(e,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+vg.distanceTo(Mg);t.setAttribute("lineDistance",new yt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Fl=class extends zn{constructor(t,e){super(t,e),this.isLineLoop=!0,this.type="LineLoop"}},Ua=class extends Le{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new pt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Sg=new Lt,ff=new Li,$o=new Pe,Jo=new C,Ol=class extends jt{constructor(t=new Wt,e=new Ua){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let i=this.geometry,r=this.matrixWorld,s=t.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),$o.copy(i.boundingSphere),$o.applyMatrix4(r),$o.radius+=s,t.ray.intersectsSphere($o)===!1)return;Sg.copy(r).invert(),ff.copy(t.ray).applyMatrix4(Sg);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=i.index,u=i.attributes.position;if(l!==null){let f=Math.max(0,a.start),d=Math.min(l.count,a.start+a.count);for(let m=f,_=d;m<_;m++){let g=l.getX(m);Jo.fromBufferAttribute(u,g),bg(Jo,g,c,r,t,e,this)}}else{let f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let m=f,_=d;m<_;m++)Jo.fromBufferAttribute(u,m),bg(Jo,m,c,r,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let r=e[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}};function bg(n,t,e,i,r,s,a){let o=ff.distanceSqToPoint(n);if(o<e){let c=new C;ff.closestPointToPoint(n,c),c.applyMatrix4(i);let l=r.ray.origin.distanceTo(c);if(l<r.near||l>r.far)return;s.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:t,face:null,object:a})}}var df=class extends be{constructor(t,e,i,r,s,a,o,c,l){super(t,e,i,r,s,a,o,c,l),this.isVideoTexture=!0,this.minFilter=a!==void 0?a:xe,this.magFilter=s!==void 0?s:xe,this.generateMipmaps=!1;let h=this;function u(){h.needsUpdate=!0,t.requestVideoFrameCallback(u)}"requestVideoFrameCallback"in t&&t.requestVideoFrameCallback(u)}clone(){return new this.constructor(this.image).copy(this)}update(){let t=this.image;"requestVideoFrameCallback"in t===!1&&t.readyState>=t.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}},pf=class extends be{constructor(t,e){super({width:t,height:e}),this.isFramebufferTexture=!0,this.magFilter=_e,this.minFilter=_e,this.generateMipmaps=!1,this.needsUpdate=!0}},ys=class extends be{constructor(t,e,i,r,s,a,o,c,l,h,u,f){super(null,a,o,c,l,h,r,s,u,f),this.isCompressedTexture=!0,this.image={width:e,height:i},this.mipmaps=t,this.flipY=!1,this.generateMipmaps=!1}},mf=class extends ys{constructor(t,e,i,r,s,a){super(t,e,i,s,a),this.isCompressedArrayTexture=!0,this.image.depth=r,this.wrapR=ke}},gf=class extends ys{constructor(t,e,i){super(void 0,t[0].width,t[0].height,e,i,ci),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=t}},_f=class extends be{constructor(t,e,i,r,s,a,o,c,l){super(t,e,i,r,s,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},cn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,r=this.getPoint(0),s=0;e.push(0);for(let a=1;a<=t;a++)i=this.getPoint(a/t),s+=i.distanceTo(r),e.push(s),r=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let i=this.getLengths(),r=0,s=i.length,a;e?a=e:a=t*i[s-1];let o=0,c=s-1,l;for(;o<=c;)if(r=Math.floor(o+(c-o)/2),l=i[r]-a,l<0)o=r+1;else if(l>0)c=r-1;else{c=r;break}if(r=c,i[r]===a)return r/(s-1);let h=i[r],f=i[r+1]-h,d=(a-h)/f;return(r+d)/(s-1)}getTangent(t,e){let r=t-1e-4,s=t+1e-4;r<0&&(r=0),s>1&&(s=1);let a=this.getPoint(r),o=this.getPoint(s),c=e||(a.isVector2?new $:new C);return c.copy(o).sub(a).normalize(),c}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e){let i=new C,r=[],s=[],a=[],o=new C,c=new Lt;for(let d=0;d<=t;d++){let m=d/t;r[d]=this.getTangentAt(m,new C)}s[0]=new C,a[0]=new C;let l=Number.MAX_VALUE,h=Math.abs(r[0].x),u=Math.abs(r[0].y),f=Math.abs(r[0].z);h<=l&&(l=h,i.set(1,0,0)),u<=l&&(l=u,i.set(0,1,0)),f<=l&&i.set(0,0,1),o.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],o),a[0].crossVectors(r[0],s[0]);for(let d=1;d<=t;d++){if(s[d]=s[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(r[d-1],r[d]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(pe(r[d-1].dot(r[d]),-1,1));s[d].applyMatrix4(c.makeRotationAxis(o,m))}a[d].crossVectors(r[d],s[d])}if(e===!0){let d=Math.acos(pe(s[0].dot(s[t]),-1,1));d/=t,r[0].dot(o.crossVectors(s[0],s[t]))>0&&(d=-d);for(let m=1;m<=t;m++)s[m].applyMatrix4(c.makeRotationAxis(r[m],d*m)),a[m].crossVectors(r[m],s[m])}return{tangents:r,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},vs=class extends cn{constructor(t=0,e=0,i=1,r=1,s=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(t,e){let i=e||new $,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(a?s=0:s=r),this.aClockwise===!0&&!a&&(s===r?s=-r:s=s-r);let o=this.aStartAngle+t*s,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=c-this.aX,d=l-this.aY;c=f*h-d*u+this.aX,l=f*u+d*h+this.aY}return i.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Bl=class extends vs{constructor(t,e,i,r,s,a){super(t,e,i,i,r,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function wd(){let n=0,t=0,e=0,i=0;function r(s,a,o,c){n=s,t=o,e=-3*s+3*a-2*o-c,i=2*s-2*a+o+c}return{initCatmullRom:function(s,a,o,c,l){r(a,o,l*(o-s),l*(c-a))},initNonuniformCatmullRom:function(s,a,o,c,l,h,u){let f=(a-s)/l-(o-s)/(l+h)+(o-a)/h,d=(o-a)/h-(c-a)/(h+u)+(c-o)/u;f*=h,d*=h,r(a,o,f,d)},calc:function(s){let a=s*s,o=a*s;return n+t*s+e*a+i*o}}}var Ko=new C,ru=new wd,su=new wd,au=new wd,zl=class extends cn{constructor(t=[],e=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=r}getPoint(t,e=new C){let i=e,r=this.points,s=r.length,a=(s-(this.closed?0:1))*t,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:c===0&&o===s-1&&(o=s-2,c=1);let l,h;this.closed||o>0?l=r[(o-1)%s]:(Ko.subVectors(r[0],r[1]).add(r[0]),l=Ko);let u=r[o%s],f=r[(o+1)%s];if(this.closed||o+2<s?h=r[(o+2)%s]:(Ko.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=Ko),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,m=Math.pow(l.distanceToSquared(u),d),_=Math.pow(u.distanceToSquared(f),d),g=Math.pow(f.distanceToSquared(h),d);_<1e-4&&(_=1),m<1e-4&&(m=_),g<1e-4&&(g=_),ru.initNonuniformCatmullRom(l.x,u.x,f.x,h.x,m,_,g),su.initNonuniformCatmullRom(l.y,u.y,f.y,h.y,m,_,g),au.initNonuniformCatmullRom(l.z,u.z,f.z,h.z,m,_,g)}else this.curveType==="catmullrom"&&(ru.initCatmullRom(l.x,u.x,f.x,h.x,this.tension),su.initCatmullRom(l.y,u.y,f.y,h.y,this.tension),au.initCatmullRom(l.z,u.z,f.z,h.z,this.tension));return i.set(ru.calc(c),su.calc(c),au.calc(c)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let r=t.points[e];this.points.push(r.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let r=this.points[e];t.points.push(r.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let r=t.points[e];this.points.push(new C().fromArray(r))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function wg(n,t,e,i,r){let s=(i-t)*.5,a=(r-e)*.5,o=n*n,c=n*o;return(2*e-2*i+s+a)*c+(-3*e+3*i-2*s-a)*o+s*n+e}function tA(n,t){let e=1-n;return e*e*t}function eA(n,t){return 2*(1-n)*n*t}function nA(n,t){return n*n*t}function aa(n,t,e,i){return tA(n,t)+eA(n,e)+nA(n,i)}function iA(n,t){let e=1-n;return e*e*e*t}function rA(n,t){let e=1-n;return 3*e*e*n*t}function sA(n,t){return 3*(1-n)*n*n*t}function aA(n,t){return n*n*n*t}function oa(n,t,e,i,r){return iA(n,t)+rA(n,e)+sA(n,i)+aA(n,r)}var Da=class extends cn{constructor(t=new $,e=new $,i=new $,r=new $){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=r}getPoint(t,e=new $){let i=e,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return i.set(oa(t,r.x,s.x,a.x,o.x),oa(t,r.y,s.y,a.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},kl=class extends cn{constructor(t=new C,e=new C,i=new C,r=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=r}getPoint(t,e=new C){let i=e,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return i.set(oa(t,r.x,s.x,a.x,o.x),oa(t,r.y,s.y,a.y,o.y),oa(t,r.z,s.z,a.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Na=class extends cn{constructor(t=new $,e=new $){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new $){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new $){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Hl=class extends cn{constructor(t=new C,e=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new C){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new C){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Fa=class extends cn{constructor(t=new $,e=new $,i=new $){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new $){let i=e,r=this.v0,s=this.v1,a=this.v2;return i.set(aa(t,r.x,s.x,a.x),aa(t,r.y,s.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Oa=class extends cn{constructor(t=new C,e=new C,i=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new C){let i=e,r=this.v0,s=this.v1,a=this.v2;return i.set(aa(t,r.x,s.x,a.x),aa(t,r.y,s.y,a.y),aa(t,r.z,s.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ba=class extends cn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new $){let i=e,r=this.points,s=(r.length-1)*t,a=Math.floor(s),o=s-a,c=r[a===0?a:a-1],l=r[a],h=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return i.set(wg(o,c.x,l.x,h.x,u.x),wg(o,c.y,l.y,h.y,u.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let r=t.points[e];this.points.push(r.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let r=this.points[e];t.points.push(r.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let r=t.points[e];this.points.push(new $().fromArray(r))}return this}},Vl=Object.freeze({__proto__:null,ArcCurve:Bl,CatmullRomCurve3:zl,CubicBezierCurve:Da,CubicBezierCurve3:kl,EllipseCurve:vs,LineCurve:Na,LineCurve3:Hl,QuadraticBezierCurve:Fa,QuadraticBezierCurve3:Oa,SplineCurve:Ba}),Gl=class extends cn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Vl[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let a=r[s]-i,o=this.curves[s],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,e)}s++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,r=this.curves.length;i<r;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let r=0,s=this.curves;r<s.length;r++){let a=s[r],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,c=a.getPoints(o);for(let l=0;l<c.length;l++){let h=c[l];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let r=t.curves[e];this.curves.push(r.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let r=this.curves[e];t.curves.push(r.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let r=t.curves[e];this.curves.push(new Vl[r.type]().fromJSON(r))}return this}},xr=class extends Gl{constructor(t){super(),this.type="Path",this.currentPoint=new $,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new Na(this.currentPoint.clone(),new $(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,r){let s=new Fa(this.currentPoint.clone(),new $(t,e),new $(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(t,e,i,r,s,a){let o=new Da(this.currentPoint.clone(),new $(t,e),new $(i,r),new $(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new Ba(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,r,s,a){let o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+o,e+c,i,r,s,a),this}absarc(t,e,i,r,s,a){return this.absellipse(t,e,i,i,r,s,a),this}ellipse(t,e,i,r,s,a,o,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,i,r,s,a,o,c),this}absellipse(t,e,i,r,s,a,o,c){let l=new vs(t,e,i,r,s,a,o,c);if(this.curves.length>0){let u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},za=class n extends Wt{constructor(t=[new $(0,-.5),new $(.5,0),new $(0,.5)],e=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:r},e=Math.floor(e),r=pe(r,0,Math.PI*2);let s=[],a=[],o=[],c=[],l=[],h=1/e,u=new C,f=new $,d=new C,m=new C,_=new C,g=0,p=0;for(let y=0;y<=t.length-1;y++)switch(y){case 0:g=t[y+1].x-t[y].x,p=t[y+1].y-t[y].y,d.x=p*1,d.y=-g,d.z=p*0,_.copy(d),d.normalize(),c.push(d.x,d.y,d.z);break;case t.length-1:c.push(_.x,_.y,_.z);break;default:g=t[y+1].x-t[y].x,p=t[y+1].y-t[y].y,d.x=p*1,d.y=-g,d.z=p*0,m.copy(d),d.x+=_.x,d.y+=_.y,d.z+=_.z,d.normalize(),c.push(d.x,d.y,d.z),_.copy(m)}for(let y=0;y<=e;y++){let x=i+y*h*r,v=Math.sin(x),R=Math.cos(x);for(let E=0;E<=t.length-1;E++){u.x=t[E].x*v,u.y=t[E].y,u.z=t[E].x*R,a.push(u.x,u.y,u.z),f.x=y/e,f.y=E/(t.length-1),o.push(f.x,f.y);let w=c[3*E+0]*v,I=c[3*E+1],M=c[3*E+0]*R;l.push(w,I,M)}}for(let y=0;y<e;y++)for(let x=0;x<t.length-1;x++){let v=x+y*t.length,R=v,E=v+t.length,w=v+t.length+1,I=v+1;s.push(R,E,I),s.push(w,I,E)}this.setIndex(s),this.setAttribute("position",new yt(a,3)),this.setAttribute("uv",new yt(o,2)),this.setAttribute("normal",new yt(l,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.points,t.segments,t.phiStart,t.phiLength)}},Wl=class n extends za{constructor(t=1,e=1,i=4,r=8){let s=new xr;s.absarc(0,-e/2,t,Math.PI*1.5,0),s.absarc(0,e/2,t,0,Math.PI*.5),super(s.getPoints(i),r),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:i,radialSegments:r}}static fromJSON(t){return new n(t.radius,t.length,t.capSegments,t.radialSegments)}},Xl=class n extends Wt{constructor(t=1,e=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:r},e=Math.max(3,e);let s=[],a=[],o=[],c=[],l=new C,h=new $;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let u=0,f=3;u<=e;u++,f+=3){let d=i+u/e*r;l.x=t*Math.cos(d),l.y=t*Math.sin(d),a.push(l.x,l.y,l.z),o.push(0,0,1),h.x=(a[f]/t+1)/2,h.y=(a[f+1]/t+1)/2,c.push(h.x,h.y)}for(let u=1;u<=e;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new yt(a,3)),this.setAttribute("normal",new yt(o,3)),this.setAttribute("uv",new yt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Ms=class n extends Wt{constructor(t=1,e=1,i=1,r=32,s=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:c};let l=this;r=Math.floor(r),s=Math.floor(s);let h=[],u=[],f=[],d=[],m=0,_=[],g=i/2,p=0;y(),a===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new yt(u,3)),this.setAttribute("normal",new yt(f,3)),this.setAttribute("uv",new yt(d,2));function y(){let v=new C,R=new C,E=0,w=(e-t)/i;for(let I=0;I<=s;I++){let M=[],S=I/s,D=S*(e-t)+t;for(let V=0;V<=r;V++){let rt=V/r,L=rt*c+o,O=Math.sin(L),H=Math.cos(L);R.x=D*O,R.y=-S*i+g,R.z=D*H,u.push(R.x,R.y,R.z),v.set(O,w,H).normalize(),f.push(v.x,v.y,v.z),d.push(rt,1-S),M.push(m++)}_.push(M)}for(let I=0;I<r;I++)for(let M=0;M<s;M++){let S=_[M][I],D=_[M+1][I],V=_[M+1][I+1],rt=_[M][I+1];h.push(S,D,rt),h.push(D,V,rt),E+=6}l.addGroup(p,E,0),p+=E}function x(v){let R=m,E=new $,w=new C,I=0,M=v===!0?t:e,S=v===!0?1:-1;for(let V=1;V<=r;V++)u.push(0,g*S,0),f.push(0,S,0),d.push(.5,.5),m++;let D=m;for(let V=0;V<=r;V++){let L=V/r*c+o,O=Math.cos(L),H=Math.sin(L);w.x=M*H,w.y=g*S,w.z=M*O,u.push(w.x,w.y,w.z),f.push(0,S,0),E.x=O*.5+.5,E.y=H*.5*S+.5,d.push(E.x,E.y),m++}for(let V=0;V<r;V++){let rt=R+V,L=D+V;v===!0?h.push(L,L+1,rt):h.push(L+1,L,rt),I+=3}l.addGroup(p,I,v===!0?1:2),p+=I}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ql=class n extends Ms{constructor(t=1,e=1,i=32,r=1,s=!1,a=0,o=Math.PI*2){super(0,t,e,i,r,s,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(t){return new n(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Di=class n extends Wt{constructor(t=[],e=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:r};let s=[],a=[];o(r),l(i),h(),this.setAttribute("position",new yt(s,3)),this.setAttribute("normal",new yt(s.slice(),3)),this.setAttribute("uv",new yt(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(y){let x=new C,v=new C,R=new C;for(let E=0;E<e.length;E+=3)d(e[E+0],x),d(e[E+1],v),d(e[E+2],R),c(x,v,R,y)}function c(y,x,v,R){let E=R+1,w=[];for(let I=0;I<=E;I++){w[I]=[];let M=y.clone().lerp(v,I/E),S=x.clone().lerp(v,I/E),D=E-I;for(let V=0;V<=D;V++)V===0&&I===E?w[I][V]=M:w[I][V]=M.clone().lerp(S,V/D)}for(let I=0;I<E;I++)for(let M=0;M<2*(E-I)-1;M++){let S=Math.floor(M/2);M%2===0?(f(w[I][S+1]),f(w[I+1][S]),f(w[I][S])):(f(w[I][S+1]),f(w[I+1][S+1]),f(w[I+1][S]))}}function l(y){let x=new C;for(let v=0;v<s.length;v+=3)x.x=s[v+0],x.y=s[v+1],x.z=s[v+2],x.normalize().multiplyScalar(y),s[v+0]=x.x,s[v+1]=x.y,s[v+2]=x.z}function h(){let y=new C;for(let x=0;x<s.length;x+=3){y.x=s[x+0],y.y=s[x+1],y.z=s[x+2];let v=g(y)/2/Math.PI+.5,R=p(y)/Math.PI+.5;a.push(v,1-R)}m(),u()}function u(){for(let y=0;y<a.length;y+=6){let x=a[y+0],v=a[y+2],R=a[y+4],E=Math.max(x,v,R),w=Math.min(x,v,R);E>.9&&w<.1&&(x<.2&&(a[y+0]+=1),v<.2&&(a[y+2]+=1),R<.2&&(a[y+4]+=1))}}function f(y){s.push(y.x,y.y,y.z)}function d(y,x){let v=y*3;x.x=t[v+0],x.y=t[v+1],x.z=t[v+2]}function m(){let y=new C,x=new C,v=new C,R=new C,E=new $,w=new $,I=new $;for(let M=0,S=0;M<s.length;M+=9,S+=6){y.set(s[M+0],s[M+1],s[M+2]),x.set(s[M+3],s[M+4],s[M+5]),v.set(s[M+6],s[M+7],s[M+8]),E.set(a[S+0],a[S+1]),w.set(a[S+2],a[S+3]),I.set(a[S+4],a[S+5]),R.copy(y).add(x).add(v).divideScalar(3);let D=g(R);_(E,S+0,y,D),_(w,S+2,x,D),_(I,S+4,v,D)}}function _(y,x,v,R){R<0&&y.x===1&&(a[x]=y.x-1),v.x===0&&v.z===0&&(a[x]=R/2/Math.PI+.5)}function g(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.vertices,t.indices,t.radius,t.details)}},Yl=class n extends Di{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,r=1/i,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-i,0,-r,i,0,r,-i,0,r,i,-r,-i,0,-r,i,0,r,-i,0,r,i,0,-i,0,-r,i,0,-r,-i,0,r,i,0,r],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,a,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new n(t.radius,t.detail)}},Qo=new C,jo=new C,ou=new C,tl=new ei,Zl=class extends Wt{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){let r=Math.pow(10,4),s=Math.cos(fr*e),a=t.getIndex(),o=t.getAttribute("position"),c=a?a.count:o.count,l=[0,0,0],h=["a","b","c"],u=new Array(3),f={},d=[];for(let m=0;m<c;m+=3){a?(l[0]=a.getX(m),l[1]=a.getX(m+1),l[2]=a.getX(m+2)):(l[0]=m,l[1]=m+1,l[2]=m+2);let{a:_,b:g,c:p}=tl;if(_.fromBufferAttribute(o,l[0]),g.fromBufferAttribute(o,l[1]),p.fromBufferAttribute(o,l[2]),tl.getNormal(ou),u[0]=`${Math.round(_.x*r)},${Math.round(_.y*r)},${Math.round(_.z*r)}`,u[1]=`${Math.round(g.x*r)},${Math.round(g.y*r)},${Math.round(g.z*r)}`,u[2]=`${Math.round(p.x*r)},${Math.round(p.y*r)},${Math.round(p.z*r)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let y=0;y<3;y++){let x=(y+1)%3,v=u[y],R=u[x],E=tl[h[y]],w=tl[h[x]],I=`${v}_${R}`,M=`${R}_${v}`;M in f&&f[M]?(ou.dot(f[M].normal)<=s&&(d.push(E.x,E.y,E.z),d.push(w.x,w.y,w.z)),f[M]=null):I in f||(f[I]={index0:l[y],index1:l[x],normal:ou.clone()})}}for(let m in f)if(f[m]){let{index0:_,index1:g}=f[m];Qo.fromBufferAttribute(o,_),jo.fromBufferAttribute(o,g),d.push(Qo.x,Qo.y,Qo.z),d.push(jo.x,jo.y,jo.z)}this.setAttribute("position",new yt(d,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}},oi=class extends xr{constructor(t){super(t),this.uuid=on(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,r=this.holes.length;i<r;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let r=t.holes[e];this.holes.push(r.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let r=this.holes[e];t.holes.push(r.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let r=t.holes[e];this.holes.push(new xr().fromJSON(r))}return this}},oA={triangulate:function(n,t,e=2){let i=t&&t.length,r=i?t[0]*e:n.length,s=h_(n,0,r,e,!0),a=[];if(!s||s.next===s.prev)return a;let o,c,l,h,u,f,d;if(i&&(s=fA(n,t,s,e)),n.length>80*e){o=l=n[0],c=h=n[1];for(let m=e;m<r;m+=e)u=n[m],f=n[m+1],u<o&&(o=u),f<c&&(c=f),u>l&&(l=u),f>h&&(h=f);d=Math.max(l-o,h-c),d=d!==0?32767/d:0}return ka(s,a,e,o,c,d,0),a}};function h_(n,t,e,i,r){let s,a;if(r===bA(n,t,e,i)>0)for(s=t;s<e;s+=i)a=Eg(s,n[s],n[s+1],a);else for(s=e-i;s>=t;s-=i)a=Eg(s,n[s],n[s+1],a);return a&&Oc(a,a.next)&&(Va(a),a=a.next),a}function yr(n,t){if(!n)return n;t||(t=n);let e=n,i;do if(i=!1,!e.steiner&&(Oc(e,e.next)||he(e.prev,e,e.next)===0)){if(Va(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function ka(n,t,e,i,r,s,a){if(!n)return;!a&&s&&_A(n,i,r,s);let o=n,c,l;for(;n.prev!==n.next;){if(c=n.prev,l=n.next,s?cA(n,i,r,s):lA(n)){t.push(c.i/e|0),t.push(n.i/e|0),t.push(l.i/e|0),Va(n),n=l.next,o=l.next;continue}if(n=l,n===o){a?a===1?(n=hA(yr(n),t,e),ka(n,t,e,i,r,s,2)):a===2&&uA(n,t,e,i,r,s):ka(yr(n),t,e,i,r,s,1);break}}}function lA(n){let t=n.prev,e=n,i=n.next;if(he(t,e,i)>=0)return!1;let r=t.x,s=e.x,a=i.x,o=t.y,c=e.y,l=i.y,h=r<s?r<a?r:a:s<a?s:a,u=o<c?o<l?o:l:c<l?c:l,f=r>s?r>a?r:a:s>a?s:a,d=o>c?o>l?o:l:c>l?c:l,m=i.next;for(;m!==t;){if(m.x>=h&&m.x<=f&&m.y>=u&&m.y<=d&&os(r,o,s,c,a,l,m.x,m.y)&&he(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function cA(n,t,e,i){let r=n.prev,s=n,a=n.next;if(he(r,s,a)>=0)return!1;let o=r.x,c=s.x,l=a.x,h=r.y,u=s.y,f=a.y,d=o<c?o<l?o:l:c<l?c:l,m=h<u?h<f?h:f:u<f?u:f,_=o>c?o>l?o:l:c>l?c:l,g=h>u?h>f?h:f:u>f?u:f,p=xf(d,m,t,e,i),y=xf(_,g,t,e,i),x=n.prevZ,v=n.nextZ;for(;x&&x.z>=p&&v&&v.z<=y;){if(x.x>=d&&x.x<=_&&x.y>=m&&x.y<=g&&x!==r&&x!==a&&os(o,h,c,u,l,f,x.x,x.y)&&he(x.prev,x,x.next)>=0||(x=x.prevZ,v.x>=d&&v.x<=_&&v.y>=m&&v.y<=g&&v!==r&&v!==a&&os(o,h,c,u,l,f,v.x,v.y)&&he(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;x&&x.z>=p;){if(x.x>=d&&x.x<=_&&x.y>=m&&x.y<=g&&x!==r&&x!==a&&os(o,h,c,u,l,f,x.x,x.y)&&he(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;v&&v.z<=y;){if(v.x>=d&&v.x<=_&&v.y>=m&&v.y<=g&&v!==r&&v!==a&&os(o,h,c,u,l,f,v.x,v.y)&&he(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function hA(n,t,e){let i=n;do{let r=i.prev,s=i.next.next;!Oc(r,s)&&u_(r,i,i.next,s)&&Ha(r,s)&&Ha(s,r)&&(t.push(r.i/e|0),t.push(i.i/e|0),t.push(s.i/e|0),Va(i),Va(i.next),i=n=s),i=i.next}while(i!==n);return yr(i)}function uA(n,t,e,i,r,s){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&vA(a,o)){let c=f_(a,o);a=yr(a,a.next),c=yr(c,c.next),ka(a,t,e,i,r,s,0),ka(c,t,e,i,r,s,0);return}o=o.next}a=a.next}while(a!==n)}function fA(n,t,e,i){let r=[],s,a,o,c,l;for(s=0,a=t.length;s<a;s++)o=t[s]*i,c=s<a-1?t[s+1]*i:n.length,l=h_(n,o,c,i,!1),l===l.next&&(l.steiner=!0),r.push(yA(l));for(r.sort(dA),s=0;s<r.length;s++)e=pA(r[s],e);return e}function dA(n,t){return n.x-t.x}function pA(n,t){let e=mA(n,t);if(!e)return t;let i=f_(e,n);return yr(i,i.next),yr(e,e.next)}function mA(n,t){let e=t,i=-1/0,r,s=n.x,a=n.y;do{if(a<=e.y&&a>=e.next.y&&e.next.y!==e.y){let f=e.x+(a-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=s&&f>i&&(i=f,r=e.x<e.next.x?e:e.next,f===s))return r}e=e.next}while(e!==t);if(!r)return null;let o=r,c=r.x,l=r.y,h=1/0,u;e=r;do s>=e.x&&e.x>=c&&s!==e.x&&os(a<l?s:i,a,c,l,a<l?i:s,a,e.x,e.y)&&(u=Math.abs(a-e.y)/(s-e.x),Ha(e,n)&&(u<h||u===h&&(e.x>r.x||e.x===r.x&&gA(r,e)))&&(r=e,h=u)),e=e.next;while(e!==o);return r}function gA(n,t){return he(n.prev,n,t.prev)<0&&he(t.next,n,n.next)<0}function _A(n,t,e,i){let r=n;do r.z===0&&(r.z=xf(r.x,r.y,t,e,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,xA(r)}function xA(n){let t,e,i,r,s,a,o,c,l=1;do{for(e=n,n=null,s=null,a=0;e;){for(a++,i=e,o=0,t=0;t<l&&(o++,i=i.nextZ,!!i);t++);for(c=l;o>0||c>0&&i;)o!==0&&(c===0||!i||e.z<=i.z)?(r=e,e=e.nextZ,o--):(r=i,i=i.nextZ,c--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;e=i}s.nextZ=null,l*=2}while(a>1);return n}function xf(n,t,e,i,r){return n=(n-e)*r|0,t=(t-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,n|t<<1}function yA(n){let t=n,e=n;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==n);return e}function os(n,t,e,i,r,s,a,o){return(r-a)*(t-o)>=(n-a)*(s-o)&&(n-a)*(i-o)>=(e-a)*(t-o)&&(e-a)*(s-o)>=(r-a)*(i-o)}function vA(n,t){return n.next.i!==t.i&&n.prev.i!==t.i&&!MA(n,t)&&(Ha(n,t)&&Ha(t,n)&&SA(n,t)&&(he(n.prev,n,t.prev)||he(n,t.prev,t))||Oc(n,t)&&he(n.prev,n,n.next)>0&&he(t.prev,t,t.next)>0)}function he(n,t,e){return(t.y-n.y)*(e.x-t.x)-(t.x-n.x)*(e.y-t.y)}function Oc(n,t){return n.x===t.x&&n.y===t.y}function u_(n,t,e,i){let r=nl(he(n,t,e)),s=nl(he(n,t,i)),a=nl(he(e,i,n)),o=nl(he(e,i,t));return!!(r!==s&&a!==o||r===0&&el(n,e,t)||s===0&&el(n,i,t)||a===0&&el(e,n,i)||o===0&&el(e,t,i))}function el(n,t,e){return t.x<=Math.max(n.x,e.x)&&t.x>=Math.min(n.x,e.x)&&t.y<=Math.max(n.y,e.y)&&t.y>=Math.min(n.y,e.y)}function nl(n){return n>0?1:n<0?-1:0}function MA(n,t){let e=n;do{if(e.i!==n.i&&e.next.i!==n.i&&e.i!==t.i&&e.next.i!==t.i&&u_(e,e.next,n,t))return!0;e=e.next}while(e!==n);return!1}function Ha(n,t){return he(n.prev,n,n.next)<0?he(n,t,n.next)>=0&&he(n,n.prev,t)>=0:he(n,t,n.prev)<0||he(n,n.next,t)<0}function SA(n,t){let e=n,i=!1,r=(n.x+t.x)/2,s=(n.y+t.y)/2;do e.y>s!=e.next.y>s&&e.next.y!==e.y&&r<(e.next.x-e.x)*(s-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==n);return i}function f_(n,t){let e=new yf(n.i,n.x,n.y),i=new yf(t.i,t.x,t.y),r=n.next,s=t.prev;return n.next=t,t.prev=n,e.next=r,r.prev=e,i.next=e,e.prev=i,s.next=i,i.prev=s,i}function Eg(n,t,e,i){let r=new yf(n,t,e);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function Va(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function yf(n,t,e){this.i=n,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function bA(n,t,e,i){let r=0;for(let s=t,a=e-i;s<e;s+=i)r+=(n[a]-n[s])*(n[s+1]+n[a+1]),a=s;return r}var Fn=class n{static area(t){let e=t.length,i=0;for(let r=e-1,s=0;s<e;r=s++)i+=t[r].x*t[s].y-t[s].x*t[r].y;return i*.5}static isClockWise(t){return n.area(t)<0}static triangulateShape(t,e){let i=[],r=[],s=[];Ag(t),Tg(i,t);let a=t.length;e.forEach(Ag);for(let c=0;c<e.length;c++)r.push(a),a+=e[c].length,Tg(i,e[c]);let o=oA.triangulate(i,r);for(let c=0;c<o.length;c+=3)s.push(o.slice(c,c+3));return s}};function Ag(n){let t=n.length;t>2&&n[t-1].equals(n[0])&&n.pop()}function Tg(n,t){for(let e=0;e<t.length;e++)n.push(t[e].x),n.push(t[e].y)}var $l=class n extends Wt{constructor(t=new oi([new $(.5,.5),new $(-.5,.5),new $(-.5,-.5),new $(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,r=[],s=[];for(let o=0,c=t.length;o<c;o++){let l=t[o];a(l)}this.setAttribute("position",new yt(r,3)),this.setAttribute("uv",new yt(s,2)),this.computeVertexNormals();function a(o){let c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:d-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,y=e.UVGenerator!==void 0?e.UVGenerator:wA,x,v=!1,R,E,w,I;p&&(x=p.getSpacedPoints(h),v=!0,f=!1,R=p.computeFrenetFrames(h,!1),E=new C,w=new C,I=new C),f||(g=0,d=0,m=0,_=0);let M=o.extractPoints(l),S=M.shape,D=M.holes;if(!Fn.isClockWise(S)){S=S.reverse();for(let P=0,at=D.length;P<at;P++){let Y=D[P];Fn.isClockWise(Y)&&(D[P]=Y.reverse())}}let rt=Fn.triangulateShape(S,D),L=S;for(let P=0,at=D.length;P<at;P++){let Y=D[P];S=S.concat(Y)}function O(P,at,Y){return at||console.error("THREE.ExtrudeGeometry: vec does not exist"),P.clone().addScaledVector(at,Y)}let H=S.length,J=rt.length;function Z(P,at,Y){let st,q,Et,mt=P.x-at.x,A=P.y-at.y,b=Y.x-P.x,F=Y.y-P.y,it=mt*mt+A*A,j=mt*F-A*b;if(Math.abs(j)>Number.EPSILON){let K=Math.sqrt(it),Mt=Math.sqrt(b*b+F*F),ct=at.x-A/K,xt=at.y+mt/K,Tt=Y.x-F/Mt,Bt=Y.y+b/Mt,tt=((Tt-ct)*F-(Bt-xt)*b)/(mt*F-A*b);st=ct+mt*tt-P.x,q=xt+A*tt-P.y;let Jt=st*st+q*q;if(Jt<=2)return new $(st,q);Et=Math.sqrt(Jt/2)}else{let K=!1;mt>Number.EPSILON?b>Number.EPSILON&&(K=!0):mt<-Number.EPSILON?b<-Number.EPSILON&&(K=!0):Math.sign(A)===Math.sign(F)&&(K=!0),K?(st=-A,q=mt,Et=Math.sqrt(it)):(st=mt,q=A,Et=Math.sqrt(it/2))}return new $(st/Et,q/Et)}let X=[];for(let P=0,at=L.length,Y=at-1,st=P+1;P<at;P++,Y++,st++)Y===at&&(Y=0),st===at&&(st=0),X[P]=Z(L[P],L[Y],L[st]);let et=[],nt,ft=X.concat();for(let P=0,at=D.length;P<at;P++){let Y=D[P];nt=[];for(let st=0,q=Y.length,Et=q-1,mt=st+1;st<q;st++,Et++,mt++)Et===q&&(Et=0),mt===q&&(mt=0),nt[st]=Z(Y[st],Y[Et],Y[mt]);et.push(nt),ft=ft.concat(nt)}for(let P=0;P<g;P++){let at=P/g,Y=d*Math.cos(at*Math.PI/2),st=m*Math.sin(at*Math.PI/2)+_;for(let q=0,Et=L.length;q<Et;q++){let mt=O(L[q],X[q],st);_t(mt.x,mt.y,-Y)}for(let q=0,Et=D.length;q<Et;q++){let mt=D[q];nt=et[q];for(let A=0,b=mt.length;A<b;A++){let F=O(mt[A],nt[A],st);_t(F.x,F.y,-Y)}}}let W=m+_;for(let P=0;P<H;P++){let at=f?O(S[P],ft[P],W):S[P];v?(w.copy(R.normals[0]).multiplyScalar(at.x),E.copy(R.binormals[0]).multiplyScalar(at.y),I.copy(x[0]).add(w).add(E),_t(I.x,I.y,I.z)):_t(at.x,at.y,0)}for(let P=1;P<=h;P++)for(let at=0;at<H;at++){let Y=f?O(S[at],ft[at],W):S[at];v?(w.copy(R.normals[P]).multiplyScalar(Y.x),E.copy(R.binormals[P]).multiplyScalar(Y.y),I.copy(x[P]).add(w).add(E),_t(I.x,I.y,I.z)):_t(Y.x,Y.y,u/h*P)}for(let P=g-1;P>=0;P--){let at=P/g,Y=d*Math.cos(at*Math.PI/2),st=m*Math.sin(at*Math.PI/2)+_;for(let q=0,Et=L.length;q<Et;q++){let mt=O(L[q],X[q],st);_t(mt.x,mt.y,u+Y)}for(let q=0,Et=D.length;q<Et;q++){let mt=D[q];nt=et[q];for(let A=0,b=mt.length;A<b;A++){let F=O(mt[A],nt[A],st);v?_t(F.x,F.y+x[h-1].y,x[h-1].x+Y):_t(F.x,F.y,u+Y)}}}Q(),dt();function Q(){let P=r.length/3;if(f){let at=0,Y=H*at;for(let st=0;st<J;st++){let q=rt[st];It(q[2]+Y,q[1]+Y,q[0]+Y)}at=h+g*2,Y=H*at;for(let st=0;st<J;st++){let q=rt[st];It(q[0]+Y,q[1]+Y,q[2]+Y)}}else{for(let at=0;at<J;at++){let Y=rt[at];It(Y[2],Y[1],Y[0])}for(let at=0;at<J;at++){let Y=rt[at];It(Y[0]+H*h,Y[1]+H*h,Y[2]+H*h)}}i.addGroup(P,r.length/3-P,0)}function dt(){let P=r.length/3,at=0;St(L,at),at+=L.length;for(let Y=0,st=D.length;Y<st;Y++){let q=D[Y];St(q,at),at+=q.length}i.addGroup(P,r.length/3-P,1)}function St(P,at){let Y=P.length;for(;--Y>=0;){let st=Y,q=Y-1;q<0&&(q=P.length-1);for(let Et=0,mt=h+g*2;Et<mt;Et++){let A=H*Et,b=H*(Et+1),F=at+st+A,it=at+q+A,j=at+q+b,K=at+st+b;Ft(F,it,j,K)}}}function _t(P,at,Y){c.push(P),c.push(at),c.push(Y)}function It(P,at,Y){bt(P),bt(at),bt(Y);let st=r.length/3,q=y.generateTopUV(i,r,st-3,st-2,st-1);Dt(q[0]),Dt(q[1]),Dt(q[2])}function Ft(P,at,Y,st){bt(P),bt(at),bt(st),bt(at),bt(Y),bt(st);let q=r.length/3,Et=y.generateSideWallUV(i,r,q-6,q-3,q-2,q-1);Dt(Et[0]),Dt(Et[1]),Dt(Et[3]),Dt(Et[1]),Dt(Et[2]),Dt(Et[3])}function bt(P){r.push(c[P*3+0]),r.push(c[P*3+1]),r.push(c[P*3+2])}function Dt(P){s.push(P.x),s.push(P.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return EA(e,i,t)}static fromJSON(t,e){let i=[];for(let s=0,a=t.shapes.length;s<a;s++){let o=e[t.shapes[s]];i.push(o)}let r=t.options.extrudePath;return r!==void 0&&(t.options.extrudePath=new Vl[r.type]().fromJSON(r)),new n(i,t.options)}},wA={generateTopUV:function(n,t,e,i,r){let s=t[e*3],a=t[e*3+1],o=t[i*3],c=t[i*3+1],l=t[r*3],h=t[r*3+1];return[new $(s,a),new $(o,c),new $(l,h)]},generateSideWallUV:function(n,t,e,i,r,s){let a=t[e*3],o=t[e*3+1],c=t[e*3+2],l=t[i*3],h=t[i*3+1],u=t[i*3+2],f=t[r*3],d=t[r*3+1],m=t[r*3+2],_=t[s*3],g=t[s*3+1],p=t[s*3+2];return Math.abs(o-h)<Math.abs(a-l)?[new $(a,1-c),new $(l,1-u),new $(f,1-m),new $(_,1-p)]:[new $(o,1-c),new $(h,1-u),new $(d,1-m),new $(g,1-p)]}};function EA(n,t,e){if(e.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){let s=n[i];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Jl=class n extends Di{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new n(t.radius,t.detail)}},Ga=class n extends Di{constructor(t=1,e=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new n(t.radius,t.detail)}},Kl=class n extends Wt{constructor(t=.5,e=1,i=32,r=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:a},i=Math.max(3,i),r=Math.max(1,r);let o=[],c=[],l=[],h=[],u=t,f=(e-t)/r,d=new C,m=new $;for(let _=0;_<=r;_++){for(let g=0;g<=i;g++){let p=s+g/i*a;d.x=u*Math.cos(p),d.y=u*Math.sin(p),c.push(d.x,d.y,d.z),l.push(0,0,1),m.x=(d.x/e+1)/2,m.y=(d.y/e+1)/2,h.push(m.x,m.y)}u+=f}for(let _=0;_<r;_++){let g=_*(i+1);for(let p=0;p<i;p++){let y=p+g,x=y,v=y+i+1,R=y+i+2,E=y+1;o.push(x,v,E),o.push(v,R,E)}}this.setIndex(o),this.setAttribute("position",new yt(c,3)),this.setAttribute("normal",new yt(l,3)),this.setAttribute("uv",new yt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ql=class n extends Wt{constructor(t=new oi([new $(0,.5),new $(-.5,-.5),new $(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let i=[],r=[],s=[],a=[],o=0,c=0;if(Array.isArray(t)===!1)l(t);else for(let h=0;h<t.length;h++)l(t[h]),this.addGroup(o,c,h),o+=c,c=0;this.setIndex(i),this.setAttribute("position",new yt(r,3)),this.setAttribute("normal",new yt(s,3)),this.setAttribute("uv",new yt(a,2));function l(h){let u=r.length/3,f=h.extractPoints(e),d=f.shape,m=f.holes;Fn.isClockWise(d)===!1&&(d=d.reverse());for(let g=0,p=m.length;g<p;g++){let y=m[g];Fn.isClockWise(y)===!0&&(m[g]=y.reverse())}let _=Fn.triangulateShape(d,m);for(let g=0,p=m.length;g<p;g++){let y=m[g];d=d.concat(y)}for(let g=0,p=d.length;g<p;g++){let y=d[g];r.push(y.x,y.y,0),s.push(0,0,1),a.push(y.x,y.y)}for(let g=0,p=_.length;g<p;g++){let y=_[g],x=y[0]+u,v=y[1]+u,R=y[2]+u;i.push(x,v,R),c+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return AA(e,t)}static fromJSON(t,e){let i=[];for(let r=0,s=t.shapes.length;r<s;r++){let a=e[t.shapes[r]];i.push(a)}return new n(i,t.curveSegments)}};function AA(n,t){if(t.shapes=[],Array.isArray(n))for(let e=0,i=n.length;e<i;e++){let r=n[e];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t}var Wa=class n extends Wt{constructor(t=1,e=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let c=Math.min(a+o,Math.PI),l=0,h=[],u=new C,f=new C,d=[],m=[],_=[],g=[];for(let p=0;p<=i;p++){let y=[],x=p/i,v=0;p===0&&a===0?v=.5/e:p===i&&c===Math.PI&&(v=-.5/e);for(let R=0;R<=e;R++){let E=R/e;u.x=-t*Math.cos(r+E*s)*Math.sin(a+x*o),u.y=t*Math.cos(a+x*o),u.z=t*Math.sin(r+E*s)*Math.sin(a+x*o),m.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),g.push(E+v,1-x),y.push(l++)}h.push(y)}for(let p=0;p<i;p++)for(let y=0;y<e;y++){let x=h[p][y+1],v=h[p][y],R=h[p+1][y],E=h[p+1][y+1];(p!==0||a>0)&&d.push(x,v,E),(p!==i-1||c<Math.PI)&&d.push(v,R,E)}this.setIndex(d),this.setAttribute("position",new yt(m,3)),this.setAttribute("normal",new yt(_,3)),this.setAttribute("uv",new yt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},jl=class n extends Di{constructor(t=1,e=0){let i=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],r=[2,1,0,0,3,2,1,3,0,2,3,1];super(i,r,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new n(t.radius,t.detail)}},tc=class n extends Wt{constructor(t=1,e=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);let a=[],o=[],c=[],l=[],h=new C,u=new C,f=new C;for(let d=0;d<=i;d++)for(let m=0;m<=r;m++){let _=m/r*s,g=d/i*Math.PI*2;u.x=(t+e*Math.cos(g))*Math.cos(_),u.y=(t+e*Math.cos(g))*Math.sin(_),u.z=e*Math.sin(g),o.push(u.x,u.y,u.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),f.subVectors(u,h).normalize(),c.push(f.x,f.y,f.z),l.push(m/r),l.push(d/i)}for(let d=1;d<=i;d++)for(let m=1;m<=r;m++){let _=(r+1)*d+m-1,g=(r+1)*(d-1)+m-1,p=(r+1)*(d-1)+m,y=(r+1)*d+m;a.push(_,g,y),a.push(g,p,y)}this.setIndex(a),this.setAttribute("position",new yt(o,3)),this.setAttribute("normal",new yt(c,3)),this.setAttribute("uv",new yt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}},ec=class n extends Wt{constructor(t=1,e=.4,i=64,r=8,s=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:t,tube:e,tubularSegments:i,radialSegments:r,p:s,q:a},i=Math.floor(i),r=Math.floor(r);let o=[],c=[],l=[],h=[],u=new C,f=new C,d=new C,m=new C,_=new C,g=new C,p=new C;for(let x=0;x<=i;++x){let v=x/i*s*Math.PI*2;y(v,s,a,t,d),y(v+.01,s,a,t,m),g.subVectors(m,d),p.addVectors(m,d),_.crossVectors(g,p),p.crossVectors(_,g),_.normalize(),p.normalize();for(let R=0;R<=r;++R){let E=R/r*Math.PI*2,w=-e*Math.cos(E),I=e*Math.sin(E);u.x=d.x+(w*p.x+I*_.x),u.y=d.y+(w*p.y+I*_.y),u.z=d.z+(w*p.z+I*_.z),c.push(u.x,u.y,u.z),f.subVectors(u,d).normalize(),l.push(f.x,f.y,f.z),h.push(x/i),h.push(R/r)}}for(let x=1;x<=i;x++)for(let v=1;v<=r;v++){let R=(r+1)*(x-1)+(v-1),E=(r+1)*x+(v-1),w=(r+1)*x+v,I=(r+1)*(x-1)+v;o.push(R,E,I),o.push(E,w,I)}this.setIndex(o),this.setAttribute("position",new yt(c,3)),this.setAttribute("normal",new yt(l,3)),this.setAttribute("uv",new yt(h,2));function y(x,v,R,E,w){let I=Math.cos(x),M=Math.sin(x),S=R/v*x,D=Math.cos(S);w.x=E*(2+D)*.5*I,w.y=E*(2+D)*M*.5,w.z=E*Math.sin(S)*.5}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.tube,t.tubularSegments,t.radialSegments,t.p,t.q)}},nc=class n extends Wt{constructor(t=new Oa(new C(-1,-1,0),new C(-1,1,0),new C(1,1,0)),e=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:r,closed:s};let a=t.computeFrenetFrames(e,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new C,c=new C,l=new $,h=new C,u=[],f=[],d=[],m=[];_(),this.setIndex(m),this.setAttribute("position",new yt(u,3)),this.setAttribute("normal",new yt(f,3)),this.setAttribute("uv",new yt(d,2));function _(){for(let x=0;x<e;x++)g(x);g(s===!1?e:0),y(),p()}function g(x){h=t.getPointAt(x/e,h);let v=a.normals[x],R=a.binormals[x];for(let E=0;E<=r;E++){let w=E/r*Math.PI*2,I=Math.sin(w),M=-Math.cos(w);c.x=M*v.x+I*R.x,c.y=M*v.y+I*R.y,c.z=M*v.z+I*R.z,c.normalize(),f.push(c.x,c.y,c.z),o.x=h.x+i*c.x,o.y=h.y+i*c.y,o.z=h.z+i*c.z,u.push(o.x,o.y,o.z)}}function p(){for(let x=1;x<=e;x++)for(let v=1;v<=r;v++){let R=(r+1)*(x-1)+(v-1),E=(r+1)*x+(v-1),w=(r+1)*x+v,I=(r+1)*(x-1)+v;m.push(R,E,I),m.push(E,w,I)}}function y(){for(let x=0;x<=e;x++)for(let v=0;v<=r;v++)l.x=x/e,l.y=v/r,d.push(l.x,l.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new n(new Vl[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},ic=class extends Wt{constructor(t=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:t},t!==null){let e=[],i=new Set,r=new C,s=new C;if(t.index!==null){let a=t.attributes.position,o=t.index,c=t.groups;c.length===0&&(c=[{start:0,count:o.count,materialIndex:0}]);for(let l=0,h=c.length;l<h;++l){let u=c[l],f=u.start,d=u.count;for(let m=f,_=f+d;m<_;m+=3)for(let g=0;g<3;g++){let p=o.getX(m+g),y=o.getX(m+(g+1)%3);r.fromBufferAttribute(a,p),s.fromBufferAttribute(a,y),Rg(r,s,i)===!0&&(e.push(r.x,r.y,r.z),e.push(s.x,s.y,s.z))}}}else{let a=t.attributes.position;for(let o=0,c=a.count/3;o<c;o++)for(let l=0;l<3;l++){let h=3*o+l,u=3*o+(l+1)%3;r.fromBufferAttribute(a,h),s.fromBufferAttribute(a,u),Rg(r,s,i)===!0&&(e.push(r.x,r.y,r.z),e.push(s.x,s.y,s.z))}}this.setAttribute("position",new yt(e,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};function Rg(n,t,e){let i=`${n.x},${n.y},${n.z}-${t.x},${t.y},${t.z}`,r=`${t.x},${t.y},${t.z}-${n.x},${n.y},${n.z}`;return e.has(i)===!0||e.has(r)===!0?!1:(e.add(i),e.add(r),!0)}var Cg=Object.freeze({__proto__:null,BoxGeometry:pr,CapsuleGeometry:Wl,CircleGeometry:Xl,ConeGeometry:ql,CylinderGeometry:Ms,DodecahedronGeometry:Yl,EdgesGeometry:Zl,ExtrudeGeometry:$l,IcosahedronGeometry:Jl,LatheGeometry:za,OctahedronGeometry:Ga,PlaneGeometry:Aa,PolyhedronGeometry:Di,RingGeometry:Kl,ShapeGeometry:Ql,SphereGeometry:Wa,TetrahedronGeometry:jl,TorusGeometry:tc,TorusKnotGeometry:ec,TubeGeometry:nc,WireframeGeometry:ic}),rc=class extends Le{constructor(t){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new pt(0),this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.fog=t.fog,this}},sc=class extends gn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Xa=class extends Le{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new pt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fi,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ac=class extends Xa{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new $(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return pe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new pt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new pt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new pt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}},oc=class extends Le{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new pt(16777215),this.specular=new pt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fi,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Qa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},lc=class extends Le{constructor(t){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new pt(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fi,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.gradientMap=t.gradientMap,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.alphaMap=t.alphaMap,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},cc=class extends Le{constructor(t){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fi,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(t)}copy(t){return super.copy(t),this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.flatShading=t.flatShading,this}},hc=class extends Le{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new pt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fi,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Qa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},uc=class extends Le{constructor(t){super(),this.isMeshMatcapMaterial=!0,this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new pt(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fi,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={MATCAP:""},this.color.copy(t.color),this.matcap=t.matcap,this.map=t.map,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.alphaMap=t.alphaMap,this.flatShading=t.flatShading,this.fog=t.fog,this}},fc=class extends Ne{constructor(t){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}};function hr(n,t,e){return!n||!e&&n.constructor===t?n:typeof t.BYTES_PER_ELEMENT=="number"?new t(n):Array.prototype.slice.call(n)}function d_(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function p_(n){function t(r,s){return n[r]-n[s]}let e=n.length,i=new Array(e);for(let r=0;r!==e;++r)i[r]=r;return i.sort(t),i}function vf(n,t,e){let i=n.length,r=new n.constructor(i);for(let s=0,a=0;a!==i;++s){let o=e[s]*t;for(let c=0;c!==t;++c)r[a++]=n[o+c]}return r}function Ed(n,t,e,i){let r=1,s=n[0];for(;s!==void 0&&s[i]===void 0;)s=n[r++];if(s===void 0)return;let a=s[i];if(a!==void 0)if(Array.isArray(a))do a=s[i],a!==void 0&&(t.push(s.time),e.push.apply(e,a)),s=n[r++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[i],a!==void 0&&(t.push(s.time),a.toArray(e,e.length)),s=n[r++];while(s!==void 0);else do a=s[i],a!==void 0&&(t.push(s.time),e.push(a)),s=n[r++];while(s!==void 0)}function TA(n,t,e,i,r=30){let s=n.clone();s.name=t;let a=[];for(let c=0;c<s.tracks.length;++c){let l=s.tracks[c],h=l.getValueSize(),u=[],f=[];for(let d=0;d<l.times.length;++d){let m=l.times[d]*r;if(!(m<e||m>=i)){u.push(l.times[d]);for(let _=0;_<h;++_)f.push(l.values[d*h+_])}}u.length!==0&&(l.times=hr(u,l.times.constructor),l.values=hr(f,l.values.constructor),a.push(l))}s.tracks=a;let o=1/0;for(let c=0;c<s.tracks.length;++c)o>s.tracks[c].times[0]&&(o=s.tracks[c].times[0]);for(let c=0;c<s.tracks.length;++c)s.tracks[c].shift(-1*o);return s.resetDuration(),s}function RA(n,t=0,e=n,i=30){i<=0&&(i=30);let r=e.tracks.length,s=t/i;for(let a=0;a<r;++a){let o=e.tracks[a],c=o.ValueTypeName;if(c==="bool"||c==="string")continue;let l=n.tracks.find(function(p){return p.name===o.name&&p.ValueTypeName===c});if(l===void 0)continue;let h=0,u=o.getValueSize();o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(h=u/3);let f=0,d=l.getValueSize();l.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(f=d/3);let m=o.times.length-1,_;if(s<=o.times[0]){let p=h,y=u-h;_=o.values.slice(p,y)}else if(s>=o.times[m]){let p=m*u+h,y=p+u-h;_=o.values.slice(p,y)}else{let p=o.createInterpolant(),y=h,x=u-h;p.evaluate(s),_=p.resultBuffer.slice(y,x)}c==="quaternion"&&new He().fromArray(_).normalize().conjugate().toArray(_);let g=l.times.length;for(let p=0;p<g;++p){let y=p*d+f;if(c==="quaternion")He.multiplyQuaternionsFlat(l.values,y,_,0,l.values,y);else{let x=d-f*2;for(let v=0;v<x;++v)l.values[y+v]-=_[v]}}}return n.blendMode=yd,n}var CA={convertArray:hr,isTypedArray:d_,getKeyframeOrder:p_,sortedArray:vf,flattenJSON:Ed,subclip:TA,makeClipAdditive:RA},vr=class{constructor(t,e,i,r){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,r=e[i],s=e[i-1];t:{e:{let a;n:{i:if(!(t<r)){for(let o=i+2;;){if(r===void 0){if(t<s)break i;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(s=r,r=e[++i],t<r)break e}a=e.length;break n}if(!(t>=s)){let o=e[1];t<o&&(i=2,s=o);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(r=s,s=e[--i-1],t>=s)break e}a=i,i=0;break n}break t}for(;i<a;){let o=i+a>>>1;t<e[o]?a=o:i=o+1}if(r=e[i],s=e[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,t,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=t*r;for(let a=0;a!==r;++a)e[a]=i[s+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},dc=class extends vr{constructor(t,e,i,r){super(t,e,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:lr,endingEnd:lr}}intervalChanged_(t,e,i){let r=this.parameterPositions,s=t-2,a=t+1,o=r[s],c=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case cr:s=t,o=2*e-i;break;case ma:s=r.length-2,o=e+r[s]-r[s+1];break;default:s=t,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case cr:a=t,c=2*i-e;break;case ma:a=1,c=i+r[1]-r[0];break;default:a=t-1,c=e}let l=(i-e)*.5,h=this.valueSize;this._weightPrev=l/(e-o),this._weightNext=l/(c-i),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(t,e,i,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,m=(i-e)/(r-e),_=m*m,g=_*m,p=-f*g+2*f*_-f*m,y=(1+f)*g+(-1.5-2*f)*_+(-.5+f)*m+1,x=(-1-d)*g+(1.5+d)*_+.5*m,v=d*g-d*_;for(let R=0;R!==o;++R)s[R]=p*a[h+R]+y*a[l+R]+x*a[c+R]+v*a[u+R];return s}},qa=class extends vr{constructor(t,e,i,r){super(t,e,i,r)}interpolate_(t,e,i,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,h=(i-e)/(r-e),u=1-h;for(let f=0;f!==o;++f)s[f]=a[l+f]*u+a[c+f]*h;return s}},pc=class extends vr{constructor(t,e,i,r){super(t,e,i,r)}interpolate_(t){return this.copySampleValue_(t-1)}},hn=class{constructor(t,e,i,r){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=hr(e,this.TimeBufferType),this.values=hr(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:hr(t.times,Array),values:hr(t.values,Array)};let r=t.getInterpolation();r!==t.DefaultInterpolation&&(i.interpolation=r)}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new pc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new qa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new dc(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case da:e=this.InterpolantFactoryMethodDiscrete;break;case pa:e=this.InterpolantFactoryMethodLinear;break;case ml:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return da;case this.InterpolantFactoryMethodLinear:return pa;case this.InterpolantFactoryMethodSmooth:return ml}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,r=e.length;i!==r;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,r=e.length;i!==r;++i)e[i]*=t}return this}trim(t,e){let i=this.times,r=i.length,s=0,a=r-1;for(;s!==r&&i[s]<t;)++s;for(;a!==-1&&i[a]>e;)--a;if(++a,s!==0||a!==r){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=i.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==s;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(r!==void 0&&d_(r))for(let o=0,c=r.length;o!==c;++o){let l=r[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===ml,s=t.length-1,a=1;for(let o=1;o<s;++o){let c=!1,l=t[o],h=t[o+1];if(l!==h&&(o!==1||l!==t[0]))if(r)c=!0;else{let u=o*i,f=u-i,d=u+i;for(let m=0;m!==i;++m){let _=e[u+m];if(_!==e[f+m]||_!==e[d+m]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let u=o*i,f=a*i;for(let d=0;d!==i;++d)e[f+d]=e[u+d]}++a}}if(s>0){t[a]=t[s];for(let o=s*i,c=a*i,l=0;l!==i;++l)e[c+l]=e[o+l];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,r=new i(this.name,t,e);return r.createInterpolant=this.createInterpolant,r}};hn.prototype.TimeBufferType=Float32Array;hn.prototype.ValueBufferType=Float32Array;hn.prototype.DefaultInterpolation=pa;var hi=class extends hn{};hi.prototype.ValueTypeName="bool";hi.prototype.ValueBufferType=Array;hi.prototype.DefaultInterpolation=da;hi.prototype.InterpolantFactoryMethodLinear=void 0;hi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ya=class extends hn{};Ya.prototype.ValueTypeName="color";var Mr=class extends hn{};Mr.prototype.ValueTypeName="number";var mc=class extends vr{constructor(t,e,i,r){super(t,e,i,r)}interpolate_(t,e,i,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-e)/(r-e),l=t*o;for(let h=l+o;l!==h;l+=4)He.slerpFlat(s,0,a,l-o,a,l,c);return s}},Ni=class extends hn{InterpolantFactoryMethodLinear(t){return new mc(this.times,this.values,this.getValueSize(),t)}};Ni.prototype.ValueTypeName="quaternion";Ni.prototype.DefaultInterpolation=pa;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var ui=class extends hn{};ui.prototype.ValueTypeName="string";ui.prototype.ValueBufferType=Array;ui.prototype.DefaultInterpolation=da;ui.prototype.InterpolantFactoryMethodLinear=void 0;ui.prototype.InterpolantFactoryMethodSmooth=void 0;var Sr=class extends hn{};Sr.prototype.ValueTypeName="vector";var br=class{constructor(t,e=-1,i,r=Dc){this.name=t,this.tracks=i,this.duration=e,this.blendMode=r,this.uuid=on(),this.duration<0&&this.resetDuration()}static parse(t){let e=[],i=t.tracks,r=1/(t.fps||1);for(let a=0,o=i.length;a!==o;++a)e.push(PA(i[a]).scale(r));let s=new this(t.name,t.duration,e,t.blendMode);return s.uuid=t.uuid,s}static toJSON(t){let e=[],i=t.tracks,r={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode};for(let s=0,a=i.length;s!==a;++s)e.push(hn.toJSON(i[s]));return r}static CreateFromMorphTargetSequence(t,e,i,r){let s=e.length,a=[];for(let o=0;o<s;o++){let c=[],l=[];c.push((o+s-1)%s,o,(o+1)%s),l.push(0,1,0);let h=p_(c);c=vf(c,1,h),l=vf(l,1,h),!r&&c[0]===0&&(c.push(s),l.push(l[0])),a.push(new Mr(".morphTargetInfluences["+e[o].name+"]",c,l).scale(1/i))}return new this(t,-1,a)}static findByName(t,e){let i=t;if(!Array.isArray(t)){let r=t;i=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<i.length;r++)if(i[r].name===e)return i[r];return null}static CreateClipsFromMorphTargetSequences(t,e,i){let r={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,c=t.length;o<c;o++){let l=t[o],h=l.name.match(s);if(h&&h.length>1){let u=h[1],f=r[u];f||(r[u]=f=[]),f.push(l)}}let a=[];for(let o in r)a.push(this.CreateFromMorphTargetSequence(o,r[o],e,i));return a}static parseAnimation(t,e){if(!t)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let i=function(u,f,d,m,_){if(d.length!==0){let g=[],p=[];Ed(d,g,p,m),g.length!==0&&_.push(new u(f,g,p))}},r=[],s=t.name||"default",a=t.fps||30,o=t.blendMode,c=t.length||-1,l=t.hierarchy||[];for(let u=0;u<l.length;u++){let f=l[u].keys;if(!(!f||f.length===0))if(f[0].morphTargets){let d={},m;for(m=0;m<f.length;m++)if(f[m].morphTargets)for(let _=0;_<f[m].morphTargets.length;_++)d[f[m].morphTargets[_]]=-1;for(let _ in d){let g=[],p=[];for(let y=0;y!==f[m].morphTargets.length;++y){let x=f[m];g.push(x.time),p.push(x.morphTarget===_?1:0)}r.push(new Mr(".morphTargetInfluence["+_+"]",g,p))}c=d.length*a}else{let d=".bones["+e[u].name+"]";i(Sr,d+".position",f,"pos",r),i(Ni,d+".quaternion",f,"rot",r),i(Sr,d+".scale",f,"scl",r)}}return r.length===0?null:new this(s,c,r,o)}resetDuration(){let t=this.tracks,e=0;for(let i=0,r=t.length;i!==r;++i){let s=this.tracks[i];e=Math.max(e,s.times[s.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){let t=[];for(let e=0;e<this.tracks.length;e++)t.push(this.tracks[e].clone());return new this.constructor(this.name,this.duration,t,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function IA(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Mr;case"vector":case"vector2":case"vector3":case"vector4":return Sr;case"color":return Ya;case"quaternion":return Ni;case"bool":case"boolean":return hi;case"string":return ui}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function PA(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=IA(n.type);if(n.times===void 0){let e=[],i=[];Ed(n.keys,e,i,"value"),n.times=e,n.values=i}return t.parse!==void 0?t.parse(n):new t(n.name,n.times,n.values,n.interpolation)}var ni={enabled:!1,files:{},add:function(n,t){this.enabled!==!1&&(this.files[n]=t)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}},Za=class{constructor(t,e,i){let r=this,s=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this.itemStart=function(h){o++,s===!1&&r.onStart!==void 0&&r.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,r.onProgress!==void 0&&r.onProgress(h,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=l.length;u<f;u+=2){let d=l[u],m=l[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return m}return null}}},m_=new Za,Ve=class{constructor(t){this.manager=t!==void 0?t:m_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let i=this;return new Promise(function(r,s){i.load(t,r,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};Ve.DEFAULT_MATERIAL_NAME="__DEFAULT";var Kn={},Mf=class extends Error{constructor(t,e){super(t),this.response=e}},En=class extends Ve{constructor(t){super(t)}load(t,e,i,r){t===void 0&&(t=""),this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let s=ni.get(t);if(s!==void 0)return this.manager.itemStart(t),setTimeout(()=>{e&&e(s),this.manager.itemEnd(t)},0),s;if(Kn[t]!==void 0){Kn[t].push({onLoad:e,onProgress:i,onError:r});return}Kn[t]=[],Kn[t].push({onLoad:e,onProgress:i,onError:r});let a=new Request(t,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let h=Kn[t],u=l.body.getReader(),f=l.headers.get("Content-Length")||l.headers.get("X-File-Size"),d=f?parseInt(f):0,m=d!==0,_=0,g=new ReadableStream({start(p){y();function y(){u.read().then(({done:x,value:v})=>{if(x)p.close();else{_+=v.byteLength;let R=new ProgressEvent("progress",{lengthComputable:m,loaded:_,total:d});for(let E=0,w=h.length;E<w;E++){let I=h[E];I.onProgress&&I.onProgress(R)}p.enqueue(v),y()}})}}});return new Response(g)}else throw new Mf(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o===void 0)return l.text();{let u=/charset="?([^;"\s]*)"?/i.exec(o),f=u&&u[1]?u[1].toLowerCase():void 0,d=new TextDecoder(f);return l.arrayBuffer().then(m=>d.decode(m))}}}).then(l=>{ni.add(t,l);let h=Kn[t];delete Kn[t];for(let u=0,f=h.length;u<f;u++){let d=h[u];d.onLoad&&d.onLoad(l)}}).catch(l=>{let h=Kn[t];if(h===void 0)throw this.manager.itemError(t),l;delete Kn[t];for(let u=0,f=h.length;u<f;u++){let d=h[u];d.onError&&d.onError(l)}this.manager.itemError(t)}).finally(()=>{this.manager.itemEnd(t)}),this.manager.itemStart(t)}setResponseType(t){return this.responseType=t,this}setMimeType(t){return this.mimeType=t,this}},Sf=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=this,a=new En(this.manager);a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(t,function(o){try{e(s.parse(JSON.parse(o)))}catch(c){r?r(c):console.error(c),s.manager.itemError(t)}},i,r)}parse(t){let e=[];for(let i=0;i<t.length;i++){let r=br.parse(t[i]);e.push(r)}return e}},bf=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=this,a=[],o=new ys,c=new En(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(s.withCredentials);let l=0;function h(u){c.load(t[u],function(f){let d=s.parse(f,!0);a[u]={width:d.width,height:d.height,format:d.format,mipmaps:d.mipmaps},l+=1,l===6&&(d.mipmapCount===1&&(o.minFilter=xe),o.image=a,o.format=d.format,o.needsUpdate=!0,e&&e(o))},i,r)}if(Array.isArray(t))for(let u=0,f=t.length;u<f;++u)h(u);else c.load(t,function(u){let f=s.parse(u,!0);if(f.isCubemap){let d=f.mipmaps.length/f.mipmapCount;for(let m=0;m<d;m++){a[m]={mipmaps:[]};for(let _=0;_<f.mipmapCount;_++)a[m].mipmaps.push(f.mipmaps[m*f.mipmapCount+_]),a[m].format=f.format,a[m].width=f.width,a[m].height=f.height}o.image=a}else o.image.width=f.width,o.image.height=f.height,o.mipmaps=f.mipmaps;f.mipmapCount===1&&(o.minFilter=xe),o.format=f.format,o.needsUpdate=!0,e&&e(o)},i,r);return o}},wr=class extends Ve{constructor(t){super(t)}load(t,e,i,r){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let s=this,a=ni.get(t);if(a!==void 0)return s.manager.itemStart(t),setTimeout(function(){e&&e(a),s.manager.itemEnd(t)},0),a;let o=va("img");function c(){h(),ni.add(t,this),e&&e(this),s.manager.itemEnd(t)}function l(u){h(),r&&r(u),s.manager.itemError(t),s.manager.itemEnd(t)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(t),o.src=t,o}},wf=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=new mr;s.colorSpace=Me;let a=new wr(this.manager);a.setCrossOrigin(this.crossOrigin),a.setPath(this.path);let o=0;function c(l){a.load(t[l],function(h){s.images[l]=h,o++,o===6&&(s.needsUpdate=!0,e&&e(s))},void 0,r)}for(let l=0;l<t.length;++l)c(l);return s}},Ef=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=this,a=new ai,o=new En(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(t,function(c){let l;try{l=s.parse(c)}catch(h){if(r!==void 0)r(h);else{console.error(h);return}}l.image!==void 0?a.image=l.image:l.data!==void 0&&(a.image.width=l.width,a.image.height=l.height,a.image.data=l.data),a.wrapS=l.wrapS!==void 0?l.wrapS:ke,a.wrapT=l.wrapT!==void 0?l.wrapT:ke,a.magFilter=l.magFilter!==void 0?l.magFilter:xe,a.minFilter=l.minFilter!==void 0?l.minFilter:xe,a.anisotropy=l.anisotropy!==void 0?l.anisotropy:1,l.colorSpace!==void 0?a.colorSpace=l.colorSpace:l.encoding!==void 0&&(a.encoding=l.encoding),l.flipY!==void 0&&(a.flipY=l.flipY),l.format!==void 0&&(a.format=l.format),l.type!==void 0&&(a.type=l.type),l.mipmaps!==void 0&&(a.mipmaps=l.mipmaps,a.minFilter=Pi),l.mipmapCount===1&&(a.minFilter=xe),l.generateMipmaps!==void 0&&(a.generateMipmaps=l.generateMipmaps),a.needsUpdate=!0,e&&e(a,l)},i,r),a}},Af=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=new be,a=new wr(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){s.image=o,s.needsUpdate=!0,e!==void 0&&e(s)},i,r),s}},kn=class extends jt{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new pt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),e}},gc=class extends kn{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(jt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new pt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},lu=new Lt,Ig=new C,Pg=new C,$a=class{constructor(t){this.camera=t,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $(512,512),this.map=null,this.mapPass=null,this.matrix=new Lt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new gr,this._frameExtents=new $(1,1),this._viewportCount=1,this._viewports=[new ie(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,i=this.matrix;Ig.setFromMatrixPosition(t.matrixWorld),e.position.copy(Ig),Pg.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Pg),e.updateMatrixWorld(),lu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(lu),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(lu)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Tf=class extends $a{constructor(){super(new Se(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(t){let e=this.camera,i=fs*2*t.angle*this.focus,r=this.mapSize.width/this.mapSize.height,s=t.distance||e.far;(i!==e.fov||r!==e.aspect||s!==e.far)&&(e.fov=i,e.aspect=r,e.far=s,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this}},_c=class extends kn{constructor(t,e,i=0,r=Math.PI/3,s=0,a=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(jt.DEFAULT_UP),this.updateMatrix(),this.target=new jt,this.distance=i,this.angle=r,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new Tf}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},Lg=new Lt,ta=new C,cu=new C,Rf=class extends $a{constructor(){super(new Se(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new $(4,2),this._viewportCount=6,this._viewports=[new ie(2,1,1,1),new ie(0,1,1,1),new ie(3,1,1,1),new ie(1,1,1,1),new ie(3,0,1,1),new ie(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(t,e=0){let i=this.camera,r=this.matrix,s=t.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),ta.setFromMatrixPosition(t.matrixWorld),i.position.copy(ta),cu.copy(i.position),cu.add(this._cubeDirections[e]),i.up.copy(this._cubeUps[e]),i.lookAt(cu),i.updateMatrixWorld(),r.makeTranslation(-ta.x,-ta.y,-ta.z),Lg.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Lg)}},xc=class extends kn{constructor(t,e,i=0,r=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new Rf}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}},Cf=class extends $a{constructor(){super(new _s(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},yc=class extends kn{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(jt.DEFAULT_UP),this.updateMatrix(),this.target=new jt,this.shadow=new Cf}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},vc=class extends kn{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}},Mc=class extends kn{constructor(t,e,i=10,r=10){super(t,e),this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=i,this.height=r}get power(){return this.intensity*this.width*this.height*Math.PI}set power(t){this.intensity=t/(this.width*this.height*Math.PI)}copy(t){return super.copy(t),this.width=t.width,this.height=t.height,this}toJSON(t){let e=super.toJSON(t);return e.object.width=this.width,e.object.height=this.height,e}},Sc=class{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let t=0;t<9;t++)this.coefficients.push(new C)}set(t){for(let e=0;e<9;e++)this.coefficients[e].copy(t[e]);return this}zero(){for(let t=0;t<9;t++)this.coefficients[t].set(0,0,0);return this}getAt(t,e){let i=t.x,r=t.y,s=t.z,a=this.coefficients;return e.copy(a[0]).multiplyScalar(.282095),e.addScaledVector(a[1],.488603*r),e.addScaledVector(a[2],.488603*s),e.addScaledVector(a[3],.488603*i),e.addScaledVector(a[4],1.092548*(i*r)),e.addScaledVector(a[5],1.092548*(r*s)),e.addScaledVector(a[6],.315392*(3*s*s-1)),e.addScaledVector(a[7],1.092548*(i*s)),e.addScaledVector(a[8],.546274*(i*i-r*r)),e}getIrradianceAt(t,e){let i=t.x,r=t.y,s=t.z,a=this.coefficients;return e.copy(a[0]).multiplyScalar(.886227),e.addScaledVector(a[1],2*.511664*r),e.addScaledVector(a[2],2*.511664*s),e.addScaledVector(a[3],2*.511664*i),e.addScaledVector(a[4],2*.429043*i*r),e.addScaledVector(a[5],2*.429043*r*s),e.addScaledVector(a[6],.743125*s*s-.247708),e.addScaledVector(a[7],2*.429043*i*s),e.addScaledVector(a[8],.429043*(i*i-r*r)),e}add(t){for(let e=0;e<9;e++)this.coefficients[e].add(t.coefficients[e]);return this}addScaledSH(t,e){for(let i=0;i<9;i++)this.coefficients[i].addScaledVector(t.coefficients[i],e);return this}scale(t){for(let e=0;e<9;e++)this.coefficients[e].multiplyScalar(t);return this}lerp(t,e){for(let i=0;i<9;i++)this.coefficients[i].lerp(t.coefficients[i],e);return this}equals(t){for(let e=0;e<9;e++)if(!this.coefficients[e].equals(t.coefficients[e]))return!1;return!0}copy(t){return this.set(t.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(t,e=0){let i=this.coefficients;for(let r=0;r<9;r++)i[r].fromArray(t,e+r*3);return this}toArray(t=[],e=0){let i=this.coefficients;for(let r=0;r<9;r++)i[r].toArray(t,e+r*3);return t}static getBasisAt(t,e){let i=t.x,r=t.y,s=t.z;e[0]=.282095,e[1]=.488603*r,e[2]=.488603*s,e[3]=.488603*i,e[4]=1.092548*i*r,e[5]=1.092548*r*s,e[6]=.315392*(3*s*s-1),e[7]=1.092548*i*s,e[8]=.546274*(i*i-r*r)}},bc=class extends kn{constructor(t=new Sc,e=1){super(void 0,e),this.isLightProbe=!0,this.sh=t}copy(t){return super.copy(t),this.sh.copy(t.sh),this}fromJSON(t){return this.intensity=t.intensity,this.sh.fromArray(t.sh),this}toJSON(t){let e=super.toJSON(t);return e.object.sh=this.sh.toArray(),e}},wc=class n extends Ve{constructor(t){super(t),this.textures={}}load(t,e,i,r){let s=this,a=new En(s.manager);a.setPath(s.path),a.setRequestHeader(s.requestHeader),a.setWithCredentials(s.withCredentials),a.load(t,function(o){try{e(s.parse(JSON.parse(o)))}catch(c){r?r(c):console.error(c),s.manager.itemError(t)}},i,r)}parse(t){let e=this.textures;function i(s){return e[s]===void 0&&console.warn("THREE.MaterialLoader: Undefined texture",s),e[s]}let r=n.createMaterialFromType(t.type);if(t.uuid!==void 0&&(r.uuid=t.uuid),t.name!==void 0&&(r.name=t.name),t.color!==void 0&&r.color!==void 0&&r.color.setHex(t.color),t.roughness!==void 0&&(r.roughness=t.roughness),t.metalness!==void 0&&(r.metalness=t.metalness),t.sheen!==void 0&&(r.sheen=t.sheen),t.sheenColor!==void 0&&(r.sheenColor=new pt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(r.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&r.emissive!==void 0&&r.emissive.setHex(t.emissive),t.specular!==void 0&&r.specular!==void 0&&r.specular.setHex(t.specular),t.specularIntensity!==void 0&&(r.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&r.specularColor!==void 0&&r.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(r.shininess=t.shininess),t.clearcoat!==void 0&&(r.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=t.clearcoatRoughness),t.iridescence!==void 0&&(r.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(r.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(r.transmission=t.transmission),t.thickness!==void 0&&(r.thickness=t.thickness),t.attenuationDistance!==void 0&&(r.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&r.attenuationColor!==void 0&&r.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(r.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(r.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(r.fog=t.fog),t.flatShading!==void 0&&(r.flatShading=t.flatShading),t.blending!==void 0&&(r.blending=t.blending),t.combine!==void 0&&(r.combine=t.combine),t.side!==void 0&&(r.side=t.side),t.shadowSide!==void 0&&(r.shadowSide=t.shadowSide),t.opacity!==void 0&&(r.opacity=t.opacity),t.transparent!==void 0&&(r.transparent=t.transparent),t.alphaTest!==void 0&&(r.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(r.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(r.depthFunc=t.depthFunc),t.depthTest!==void 0&&(r.depthTest=t.depthTest),t.depthWrite!==void 0&&(r.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(r.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(r.blendSrc=t.blendSrc),t.blendDst!==void 0&&(r.blendDst=t.blendDst),t.blendEquation!==void 0&&(r.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(r.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(r.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(r.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&r.blendColor!==void 0&&r.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(r.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(r.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(r.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(r.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(r.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(r.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(r.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(r.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(r.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(r.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(r.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(r.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(r.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(r.rotation=t.rotation),t.linewidth!==void 0&&(r.linewidth=t.linewidth),t.dashSize!==void 0&&(r.dashSize=t.dashSize),t.gapSize!==void 0&&(r.gapSize=t.gapSize),t.scale!==void 0&&(r.scale=t.scale),t.polygonOffset!==void 0&&(r.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(r.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(r.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(r.dithering=t.dithering),t.alphaToCoverage!==void 0&&(r.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(r.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(r.forceSinglePass=t.forceSinglePass),t.visible!==void 0&&(r.visible=t.visible),t.toneMapped!==void 0&&(r.toneMapped=t.toneMapped),t.userData!==void 0&&(r.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?r.vertexColors=t.vertexColors>0:r.vertexColors=t.vertexColors),t.uniforms!==void 0)for(let s in t.uniforms){let a=t.uniforms[s];switch(r.uniforms[s]={},a.type){case"t":r.uniforms[s].value=i(a.value);break;case"c":r.uniforms[s].value=new pt().setHex(a.value);break;case"v2":r.uniforms[s].value=new $().fromArray(a.value);break;case"v3":r.uniforms[s].value=new C().fromArray(a.value);break;case"v4":r.uniforms[s].value=new ie().fromArray(a.value);break;case"m3":r.uniforms[s].value=new Gt().fromArray(a.value);break;case"m4":r.uniforms[s].value=new Lt().fromArray(a.value);break;default:r.uniforms[s].value=a.value}}if(t.defines!==void 0&&(r.defines=t.defines),t.vertexShader!==void 0&&(r.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(r.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(r.glslVersion=t.glslVersion),t.extensions!==void 0)for(let s in t.extensions)r.extensions[s]=t.extensions[s];if(t.lights!==void 0&&(r.lights=t.lights),t.clipping!==void 0&&(r.clipping=t.clipping),t.size!==void 0&&(r.size=t.size),t.sizeAttenuation!==void 0&&(r.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(r.map=i(t.map)),t.matcap!==void 0&&(r.matcap=i(t.matcap)),t.alphaMap!==void 0&&(r.alphaMap=i(t.alphaMap)),t.bumpMap!==void 0&&(r.bumpMap=i(t.bumpMap)),t.bumpScale!==void 0&&(r.bumpScale=t.bumpScale),t.normalMap!==void 0&&(r.normalMap=i(t.normalMap)),t.normalMapType!==void 0&&(r.normalMapType=t.normalMapType),t.normalScale!==void 0){let s=t.normalScale;Array.isArray(s)===!1&&(s=[s,s]),r.normalScale=new $().fromArray(s)}return t.displacementMap!==void 0&&(r.displacementMap=i(t.displacementMap)),t.displacementScale!==void 0&&(r.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(r.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(r.roughnessMap=i(t.roughnessMap)),t.metalnessMap!==void 0&&(r.metalnessMap=i(t.metalnessMap)),t.emissiveMap!==void 0&&(r.emissiveMap=i(t.emissiveMap)),t.emissiveIntensity!==void 0&&(r.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(r.specularMap=i(t.specularMap)),t.specularIntensityMap!==void 0&&(r.specularIntensityMap=i(t.specularIntensityMap)),t.specularColorMap!==void 0&&(r.specularColorMap=i(t.specularColorMap)),t.envMap!==void 0&&(r.envMap=i(t.envMap)),t.envMapIntensity!==void 0&&(r.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(r.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(r.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(r.lightMap=i(t.lightMap)),t.lightMapIntensity!==void 0&&(r.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(r.aoMap=i(t.aoMap)),t.aoMapIntensity!==void 0&&(r.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(r.gradientMap=i(t.gradientMap)),t.clearcoatMap!==void 0&&(r.clearcoatMap=i(t.clearcoatMap)),t.clearcoatRoughnessMap!==void 0&&(r.clearcoatRoughnessMap=i(t.clearcoatRoughnessMap)),t.clearcoatNormalMap!==void 0&&(r.clearcoatNormalMap=i(t.clearcoatNormalMap)),t.clearcoatNormalScale!==void 0&&(r.clearcoatNormalScale=new $().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(r.iridescenceMap=i(t.iridescenceMap)),t.iridescenceThicknessMap!==void 0&&(r.iridescenceThicknessMap=i(t.iridescenceThicknessMap)),t.transmissionMap!==void 0&&(r.transmissionMap=i(t.transmissionMap)),t.thicknessMap!==void 0&&(r.thicknessMap=i(t.thicknessMap)),t.anisotropyMap!==void 0&&(r.anisotropyMap=i(t.anisotropyMap)),t.sheenColorMap!==void 0&&(r.sheenColorMap=i(t.sheenColorMap)),t.sheenRoughnessMap!==void 0&&(r.sheenRoughnessMap=i(t.sheenRoughnessMap)),r}setTextures(t){return this.textures=t,this}static createMaterialFromType(t){let e={ShadowMaterial:rc,SpriteMaterial:Pa,RawShaderMaterial:sc,ShaderMaterial:gn,PointsMaterial:Ua,MeshPhysicalMaterial:ac,MeshStandardMaterial:Xa,MeshPhongMaterial:oc,MeshToonMaterial:lc,MeshNormalMaterial:cc,MeshLambertMaterial:hc,MeshDepthMaterial:Ca,MeshDistanceMaterial:Ia,MeshBasicMaterial:Bn,MeshMatcapMaterial:uc,LineDashedMaterial:fc,LineBasicMaterial:Ne,Material:Le};return new e[t]}},Ja=class{static decodeText(t){if(typeof TextDecoder<"u")return new TextDecoder().decode(t);let e="";for(let i=0,r=t.length;i<r;i++)e+=String.fromCharCode(t[i]);try{return decodeURIComponent(escape(e))}catch{return e}}static extractUrlBase(t){let e=t.lastIndexOf("/");return e===-1?"./":t.slice(0,e+1)}static resolveURL(t,e){return typeof t!="string"||t===""?"":(/^https?:\/\//i.test(e)&&/^\//.test(t)&&(e=e.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(t)||/^data:.*,.*$/i.test(t)||/^blob:.*$/i.test(t)?t:e+t)}},Ec=class extends Wt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}},Ac=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=this,a=new En(s.manager);a.setPath(s.path),a.setRequestHeader(s.requestHeader),a.setWithCredentials(s.withCredentials),a.load(t,function(o){try{e(s.parse(JSON.parse(o)))}catch(c){r?r(c):console.error(c),s.manager.itemError(t)}},i,r)}parse(t){let e={},i={};function r(d,m){if(e[m]!==void 0)return e[m];let g=d.interleavedBuffers[m],p=s(d,g.buffer),y=rs(g.type,p),x=new xs(y,g.stride);return x.uuid=g.uuid,e[m]=x,x}function s(d,m){if(i[m]!==void 0)return i[m];let g=d.arrayBuffers[m],p=new Uint32Array(g).buffer;return i[m]=p,p}let a=t.isInstancedBufferGeometry?new Ec:new Wt,o=t.data.index;if(o!==void 0){let d=rs(o.type,o.array);a.setIndex(new Qt(d,1))}let c=t.data.attributes;for(let d in c){let m=c[d],_;if(m.isInterleavedBufferAttribute){let g=r(t.data,m.data);_=new _r(g,m.itemSize,m.offset,m.normalized)}else{let g=rs(m.type,m.array),p=m.isInstancedBufferAttribute?Ui:Qt;_=new p(g,m.itemSize,m.normalized)}m.name!==void 0&&(_.name=m.name),m.usage!==void 0&&_.setUsage(m.usage),a.setAttribute(d,_)}let l=t.data.morphAttributes;if(l)for(let d in l){let m=l[d],_=[];for(let g=0,p=m.length;g<p;g++){let y=m[g],x;if(y.isInterleavedBufferAttribute){let v=r(t.data,y.data);x=new _r(v,y.itemSize,y.offset,y.normalized)}else{let v=rs(y.type,y.array);x=new Qt(v,y.itemSize,y.normalized)}y.name!==void 0&&(x.name=y.name),_.push(x)}a.morphAttributes[d]=_}t.data.morphTargetsRelative&&(a.morphTargetsRelative=!0);let u=t.data.groups||t.data.drawcalls||t.data.offsets;if(u!==void 0)for(let d=0,m=u.length;d!==m;++d){let _=u[d];a.addGroup(_.start,_.count,_.materialIndex)}let f=t.data.boundingSphere;if(f!==void 0){let d=new C;f.center!==void 0&&d.fromArray(f.center),a.boundingSphere=new Pe(d,f.radius)}return t.name&&(a.name=t.name),t.userData&&(a.userData=t.userData),a}},If=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=this,a=this.path===""?Ja.extractUrlBase(t):this.path;this.resourcePath=this.resourcePath||a;let o=new En(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(t,function(c){let l=null;try{l=JSON.parse(c)}catch(u){r!==void 0&&r(u),console.error("THREE:ObjectLoader: Can't parse "+t+".",u.message);return}let h=l.metadata;if(h===void 0||h.type===void 0||h.type.toLowerCase()==="geometry"){r!==void 0&&r(new Error("THREE.ObjectLoader: Can't load "+t)),console.error("THREE.ObjectLoader: Can't load "+t);return}s.parse(l,e)},i,r)}async loadAsync(t,e){let i=this,r=this.path===""?Ja.extractUrlBase(t):this.path;this.resourcePath=this.resourcePath||r;let s=new En(this.manager);s.setPath(this.path),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials);let a=await s.loadAsync(t,e),o=JSON.parse(a),c=o.metadata;if(c===void 0||c.type===void 0||c.type.toLowerCase()==="geometry")throw new Error("THREE.ObjectLoader: Can't load "+t);return await i.parseAsync(o)}parse(t,e){let i=this.parseAnimations(t.animations),r=this.parseShapes(t.shapes),s=this.parseGeometries(t.geometries,r),a=this.parseImages(t.images,function(){e!==void 0&&e(l)}),o=this.parseTextures(t.textures,a),c=this.parseMaterials(t.materials,o),l=this.parseObject(t.object,s,c,o,i),h=this.parseSkeletons(t.skeletons,l);if(this.bindSkeletons(l,h),e!==void 0){let u=!1;for(let f in a)if(a[f].data instanceof HTMLImageElement){u=!0;break}u===!1&&e(l)}return l}async parseAsync(t){let e=this.parseAnimations(t.animations),i=this.parseShapes(t.shapes),r=this.parseGeometries(t.geometries,i),s=await this.parseImagesAsync(t.images),a=this.parseTextures(t.textures,s),o=this.parseMaterials(t.materials,a),c=this.parseObject(t.object,r,o,a,e),l=this.parseSkeletons(t.skeletons,c);return this.bindSkeletons(c,l),c}parseShapes(t){let e={};if(t!==void 0)for(let i=0,r=t.length;i<r;i++){let s=new oi().fromJSON(t[i]);e[s.uuid]=s}return e}parseSkeletons(t,e){let i={},r={};if(e.traverse(function(s){s.isBone&&(r[s.uuid]=s)}),t!==void 0)for(let s=0,a=t.length;s<a;s++){let o=new Ul().fromJSON(t[s],r);i[o.uuid]=o}return i}parseGeometries(t,e){let i={};if(t!==void 0){let r=new Ac;for(let s=0,a=t.length;s<a;s++){let o,c=t[s];switch(c.type){case"BufferGeometry":case"InstancedBufferGeometry":o=r.parse(c);break;default:c.type in Cg?o=Cg[c.type].fromJSON(c,e):console.warn(`THREE.ObjectLoader: Unsupported geometry type "${c.type}"`)}o.uuid=c.uuid,c.name!==void 0&&(o.name=c.name),c.userData!==void 0&&(o.userData=c.userData),i[c.uuid]=o}}return i}parseMaterials(t,e){let i={},r={};if(t!==void 0){let s=new wc;s.setTextures(e);for(let a=0,o=t.length;a<o;a++){let c=t[a];i[c.uuid]===void 0&&(i[c.uuid]=s.parse(c)),r[c.uuid]=i[c.uuid]}}return r}parseAnimations(t){let e={};if(t!==void 0)for(let i=0;i<t.length;i++){let r=t[i],s=br.parse(r);e[s.uuid]=s}return e}parseImages(t,e){let i=this,r={},s;function a(c){return i.manager.itemStart(c),s.load(c,function(){i.manager.itemEnd(c)},void 0,function(){i.manager.itemError(c),i.manager.itemEnd(c)})}function o(c){if(typeof c=="string"){let l=c,h=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(l)?l:i.resourcePath+l;return a(h)}else return c.data?{data:rs(c.type,c.data),width:c.width,height:c.height}:null}if(t!==void 0&&t.length>0){let c=new Za(e);s=new wr(c),s.setCrossOrigin(this.crossOrigin);for(let l=0,h=t.length;l<h;l++){let u=t[l],f=u.url;if(Array.isArray(f)){let d=[];for(let m=0,_=f.length;m<_;m++){let g=f[m],p=o(g);p!==null&&(p instanceof HTMLImageElement?d.push(p):d.push(new ai(p.data,p.width,p.height)))}r[u.uuid]=new ti(d)}else{let d=o(u.url);r[u.uuid]=new ti(d)}}}return r}async parseImagesAsync(t){let e=this,i={},r;async function s(a){if(typeof a=="string"){let o=a,c=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(o)?o:e.resourcePath+o;return await r.loadAsync(c)}else return a.data?{data:rs(a.type,a.data),width:a.width,height:a.height}:null}if(t!==void 0&&t.length>0){r=new wr(this.manager),r.setCrossOrigin(this.crossOrigin);for(let a=0,o=t.length;a<o;a++){let c=t[a],l=c.url;if(Array.isArray(l)){let h=[];for(let u=0,f=l.length;u<f;u++){let d=l[u],m=await s(d);m!==null&&(m instanceof HTMLImageElement?h.push(m):h.push(new ai(m.data,m.width,m.height)))}i[c.uuid]=new ti(h)}else{let h=await s(c.url);i[c.uuid]=new ti(h)}}}return i}parseTextures(t,e){function i(s,a){return typeof s=="number"?s:(console.warn("THREE.ObjectLoader.parseTexture: Constant should be in numeric form.",s),a[s])}let r={};if(t!==void 0)for(let s=0,a=t.length;s<a;s++){let o=t[s];o.image===void 0&&console.warn('THREE.ObjectLoader: No "image" specified for',o.uuid),e[o.image]===void 0&&console.warn("THREE.ObjectLoader: Undefined image",o.image);let c=e[o.image],l=c.data,h;Array.isArray(l)?(h=new mr,l.length===6&&(h.needsUpdate=!0)):(l&&l.data?h=new ai:h=new be,l&&(h.needsUpdate=!0)),h.source=c,h.uuid=o.uuid,o.name!==void 0&&(h.name=o.name),o.mapping!==void 0&&(h.mapping=i(o.mapping,LA)),o.channel!==void 0&&(h.channel=o.channel),o.offset!==void 0&&h.offset.fromArray(o.offset),o.repeat!==void 0&&h.repeat.fromArray(o.repeat),o.center!==void 0&&h.center.fromArray(o.center),o.rotation!==void 0&&(h.rotation=o.rotation),o.wrap!==void 0&&(h.wrapS=i(o.wrap[0],Ug),h.wrapT=i(o.wrap[1],Ug)),o.format!==void 0&&(h.format=o.format),o.internalFormat!==void 0&&(h.internalFormat=o.internalFormat),o.type!==void 0&&(h.type=o.type),o.colorSpace!==void 0&&(h.colorSpace=o.colorSpace),o.encoding!==void 0&&(h.encoding=o.encoding),o.minFilter!==void 0&&(h.minFilter=i(o.minFilter,Dg)),o.magFilter!==void 0&&(h.magFilter=i(o.magFilter,Dg)),o.anisotropy!==void 0&&(h.anisotropy=o.anisotropy),o.flipY!==void 0&&(h.flipY=o.flipY),o.generateMipmaps!==void 0&&(h.generateMipmaps=o.generateMipmaps),o.premultiplyAlpha!==void 0&&(h.premultiplyAlpha=o.premultiplyAlpha),o.unpackAlignment!==void 0&&(h.unpackAlignment=o.unpackAlignment),o.compareFunction!==void 0&&(h.compareFunction=o.compareFunction),o.userData!==void 0&&(h.userData=o.userData),r[o.uuid]=h}return r}parseObject(t,e,i,r,s){let a;function o(f){return e[f]===void 0&&console.warn("THREE.ObjectLoader: Undefined geometry",f),e[f]}function c(f){if(f!==void 0){if(Array.isArray(f)){let d=[];for(let m=0,_=f.length;m<_;m++){let g=f[m];i[g]===void 0&&console.warn("THREE.ObjectLoader: Undefined material",g),d.push(i[g])}return d}return i[f]===void 0&&console.warn("THREE.ObjectLoader: Undefined material",f),i[f]}}function l(f){return r[f]===void 0&&console.warn("THREE.ObjectLoader: Undefined texture",f),r[f]}let h,u;switch(t.type){case"Scene":a=new Cl,t.background!==void 0&&(Number.isInteger(t.background)?a.background=new pt(t.background):a.background=l(t.background)),t.environment!==void 0&&(a.environment=l(t.environment)),t.fog!==void 0&&(t.fog.type==="Fog"?a.fog=new Rl(t.fog.color,t.fog.near,t.fog.far):t.fog.type==="FogExp2"&&(a.fog=new Tl(t.fog.color,t.fog.density)),t.fog.name!==""&&(a.fog.name=t.fog.name)),t.backgroundBlurriness!==void 0&&(a.backgroundBlurriness=t.backgroundBlurriness),t.backgroundIntensity!==void 0&&(a.backgroundIntensity=t.backgroundIntensity);break;case"PerspectiveCamera":a=new Se(t.fov,t.aspect,t.near,t.far),t.focus!==void 0&&(a.focus=t.focus),t.zoom!==void 0&&(a.zoom=t.zoom),t.filmGauge!==void 0&&(a.filmGauge=t.filmGauge),t.filmOffset!==void 0&&(a.filmOffset=t.filmOffset),t.view!==void 0&&(a.view=Object.assign({},t.view));break;case"OrthographicCamera":a=new _s(t.left,t.right,t.top,t.bottom,t.near,t.far),t.zoom!==void 0&&(a.zoom=t.zoom),t.view!==void 0&&(a.view=Object.assign({},t.view));break;case"AmbientLight":a=new vc(t.color,t.intensity);break;case"DirectionalLight":a=new yc(t.color,t.intensity);break;case"PointLight":a=new xc(t.color,t.intensity,t.distance,t.decay);break;case"RectAreaLight":a=new Mc(t.color,t.intensity,t.width,t.height);break;case"SpotLight":a=new _c(t.color,t.intensity,t.distance,t.angle,t.penumbra,t.decay);break;case"HemisphereLight":a=new gc(t.color,t.groundColor,t.intensity);break;case"LightProbe":a=new bc().fromJSON(t);break;case"SkinnedMesh":h=o(t.geometry),u=c(t.material),a=new Ll(h,u),t.bindMode!==void 0&&(a.bindMode=t.bindMode),t.bindMatrix!==void 0&&a.bindMatrix.fromArray(t.bindMatrix),t.skeleton!==void 0&&(a.skeleton=t.skeleton);break;case"Mesh":h=o(t.geometry),u=c(t.material),a=new ye(h,u);break;case"InstancedMesh":h=o(t.geometry),u=c(t.material);let f=t.count,d=t.instanceMatrix,m=t.instanceColor;a=new Dl(h,u,f),a.instanceMatrix=new Ui(new Float32Array(d.array),16),m!==void 0&&(a.instanceColor=new Ui(new Float32Array(m.array),m.itemSize));break;case"BatchedMesh":h=o(t.geometry),u=c(t.material),a=new Nl(t.maxGeometryCount,t.maxVertexCount,t.maxIndexCount,u),a.geometry=h,a.perObjectFrustumCulled=t.perObjectFrustumCulled,a.sortObjects=t.sortObjects,a._drawRanges=t.drawRanges,a._reservedRanges=t.reservedRanges,a._visibility=t.visibility,a._active=t.active,a._bounds=t.bounds.map(_=>{let g=new De;g.min.fromArray(_.boxMin),g.max.fromArray(_.boxMax);let p=new Pe;return p.radius=_.sphereRadius,p.center.fromArray(_.sphereCenter),{boxInitialized:_.boxInitialized,box:g,sphereInitialized:_.sphereInitialized,sphere:p}}),a._maxGeometryCount=t.maxGeometryCount,a._maxVertexCount=t.maxVertexCount,a._maxIndexCount=t.maxIndexCount,a._geometryInitialized=t.geometryInitialized,a._geometryCount=t.geometryCount,a._matricesTexture=l(t.matricesTexture.uuid);break;case"LOD":a=new Pl;break;case"Line":a=new zn(o(t.geometry),c(t.material));break;case"LineLoop":a=new Fl(o(t.geometry),c(t.material));break;case"LineSegments":a=new _n(o(t.geometry),c(t.material));break;case"PointCloud":case"Points":a=new Ol(o(t.geometry),c(t.material));break;case"Sprite":a=new Il(c(t.material));break;case"Group":a=new Ai;break;case"Bone":a=new La;break;default:a=new jt}if(a.uuid=t.uuid,t.name!==void 0&&(a.name=t.name),t.matrix!==void 0?(a.matrix.fromArray(t.matrix),t.matrixAutoUpdate!==void 0&&(a.matrixAutoUpdate=t.matrixAutoUpdate),a.matrixAutoUpdate&&a.matrix.decompose(a.position,a.quaternion,a.scale)):(t.position!==void 0&&a.position.fromArray(t.position),t.rotation!==void 0&&a.rotation.fromArray(t.rotation),t.quaternion!==void 0&&a.quaternion.fromArray(t.quaternion),t.scale!==void 0&&a.scale.fromArray(t.scale)),t.up!==void 0&&a.up.fromArray(t.up),t.castShadow!==void 0&&(a.castShadow=t.castShadow),t.receiveShadow!==void 0&&(a.receiveShadow=t.receiveShadow),t.shadow&&(t.shadow.bias!==void 0&&(a.shadow.bias=t.shadow.bias),t.shadow.normalBias!==void 0&&(a.shadow.normalBias=t.shadow.normalBias),t.shadow.radius!==void 0&&(a.shadow.radius=t.shadow.radius),t.shadow.mapSize!==void 0&&a.shadow.mapSize.fromArray(t.shadow.mapSize),t.shadow.camera!==void 0&&(a.shadow.camera=this.parseObject(t.shadow.camera))),t.visible!==void 0&&(a.visible=t.visible),t.frustumCulled!==void 0&&(a.frustumCulled=t.frustumCulled),t.renderOrder!==void 0&&(a.renderOrder=t.renderOrder),t.userData!==void 0&&(a.userData=t.userData),t.layers!==void 0&&(a.layers.mask=t.layers),t.children!==void 0){let f=t.children;for(let d=0;d<f.length;d++)a.add(this.parseObject(f[d],e,i,r,s))}if(t.animations!==void 0){let f=t.animations;for(let d=0;d<f.length;d++){let m=f[d];a.animations.push(s[m])}}if(t.type==="LOD"){t.autoUpdate!==void 0&&(a.autoUpdate=t.autoUpdate);let f=t.levels;for(let d=0;d<f.length;d++){let m=f[d],_=a.getObjectByProperty("uuid",m.object);_!==void 0&&a.addLevel(_,m.distance,m.hysteresis)}}return a}bindSkeletons(t,e){Object.keys(e).length!==0&&t.traverse(function(i){if(i.isSkinnedMesh===!0&&i.skeleton!==void 0){let r=e[i.skeleton];r===void 0?console.warn("THREE.ObjectLoader: No skeleton found with UUID:",i.skeleton):i.bind(r,i.bindMatrix)}})}},LA={UVMapping:Lc,CubeReflectionMapping:ci,CubeRefractionMapping:Ii,EquirectangularReflectionMapping:ca,EquirectangularRefractionMapping:ha,CubeUVReflectionMapping:Ss},Ug={RepeatWrapping:ua,ClampToEdgeWrapping:ke,MirroredRepeatWrapping:fa},Dg={NearestFilter:_e,NearestMipmapNearestFilter:xl,NearestMipmapLinearFilter:na,LinearFilter:xe,LinearMipmapNearestFilter:ud,LinearMipmapLinearFilter:Pi},Pf=class extends Ve{constructor(t){super(t),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(t){return this.options=t,this}load(t,e,i,r){t===void 0&&(t=""),this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let s=this,a=ni.get(t);if(a!==void 0){if(s.manager.itemStart(t),a.then){a.then(l=>{e&&e(l),s.manager.itemEnd(t)}).catch(l=>{r&&r(l)});return}return setTimeout(function(){e&&e(a),s.manager.itemEnd(t)},0),a}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;let c=fetch(t,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){return ni.add(t,l),e&&e(l),s.manager.itemEnd(t),l}).catch(function(l){r&&r(l),ni.remove(t),s.manager.itemError(t),s.manager.itemEnd(t)});ni.add(t,c),s.manager.itemStart(t)}},il,Ka=class{static getContext(){return il===void 0&&(il=new(window.AudioContext||window.webkitAudioContext)),il}static setContext(t){il=t}},Lf=class extends Ve{constructor(t){super(t)}load(t,e,i,r){let s=this,a=new En(this.manager);a.setResponseType("arraybuffer"),a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(t,function(c){try{let l=c.slice(0);Ka.getContext().decodeAudioData(l,function(u){e(u)}).catch(o)}catch(l){o(l)}},i,r);function o(c){r?r(c):console.error(c),s.manager.itemError(t)}}},Ng=new Lt,Fg=new Lt,tr=new Lt,Uf=class{constructor(){this.type="StereoCamera",this.aspect=1,this.eyeSep=.064,this.cameraL=new Se,this.cameraL.layers.enable(1),this.cameraL.matrixAutoUpdate=!1,this.cameraR=new Se,this.cameraR.layers.enable(2),this.cameraR.matrixAutoUpdate=!1,this._cache={focus:null,fov:null,aspect:null,near:null,far:null,zoom:null,eyeSep:null}}update(t){let e=this._cache;if(e.focus!==t.focus||e.fov!==t.fov||e.aspect!==t.aspect*this.aspect||e.near!==t.near||e.far!==t.far||e.zoom!==t.zoom||e.eyeSep!==this.eyeSep){e.focus=t.focus,e.fov=t.fov,e.aspect=t.aspect*this.aspect,e.near=t.near,e.far=t.far,e.zoom=t.zoom,e.eyeSep=this.eyeSep,tr.copy(t.projectionMatrix);let r=e.eyeSep/2,s=r*e.near/e.focus,a=e.near*Math.tan(fr*e.fov*.5)/e.zoom,o,c;Fg.elements[12]=-r,Ng.elements[12]=r,o=-a*e.aspect+s,c=a*e.aspect+s,tr.elements[0]=2*e.near/(c-o),tr.elements[8]=(c+o)/(c-o),this.cameraL.projectionMatrix.copy(tr),o=-a*e.aspect-s,c=a*e.aspect-s,tr.elements[0]=2*e.near/(c-o),tr.elements[8]=(c+o)/(c-o),this.cameraR.projectionMatrix.copy(tr)}this.cameraL.matrixWorld.copy(t.matrixWorld).multiply(Fg),this.cameraR.matrixWorld.copy(t.matrixWorld).multiply(Ng)}},Tc=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Og(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=Og();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function Og(){return(typeof performance>"u"?Date:performance).now()}var er=new C,Bg=new He,UA=new C,nr=new C,Df=class extends jt{constructor(){super(),this.type="AudioListener",this.context=Ka.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._clock=new Tc}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(t){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=t,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(t){return this.gain.gain.setTargetAtTime(t,this.context.currentTime,.01),this}updateMatrixWorld(t){super.updateMatrixWorld(t);let e=this.context.listener,i=this.up;if(this.timeDelta=this._clock.getDelta(),this.matrixWorld.decompose(er,Bg,UA),nr.set(0,0,-1).applyQuaternion(Bg),e.positionX){let r=this.context.currentTime+this.timeDelta;e.positionX.linearRampToValueAtTime(er.x,r),e.positionY.linearRampToValueAtTime(er.y,r),e.positionZ.linearRampToValueAtTime(er.z,r),e.forwardX.linearRampToValueAtTime(nr.x,r),e.forwardY.linearRampToValueAtTime(nr.y,r),e.forwardZ.linearRampToValueAtTime(nr.z,r),e.upX.linearRampToValueAtTime(i.x,r),e.upY.linearRampToValueAtTime(i.y,r),e.upZ.linearRampToValueAtTime(i.z,r)}else e.setPosition(er.x,er.y,er.z),e.setOrientation(nr.x,nr.y,nr.z,i.x,i.y,i.z)}},Rc=class extends jt{constructor(t){super(),this.type="Audio",this.listener=t,this.context=t.context,this.gain=this.context.createGain(),this.gain.connect(t.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(t){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=t,this.connect(),this}setMediaElementSource(t){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(t),this.connect(),this}setMediaStreamSource(t){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(t),this.connect(),this}setBuffer(t){return this.buffer=t,this.sourceType="buffer",this.autoplay&&this.play(),this}play(t=0){if(this.isPlaying===!0){console.warn("THREE.Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+t;let e=this.context.createBufferSource();return e.buffer=this.buffer,e.loop=this.loop,e.loopStart=this.loopStart,e.loopEnd=this.loopEnd,e.onended=this.onEnded.bind(this),e.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=e,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this._progress=0,this.source!==null&&(this.source.stop(),this.source.onended=null),this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let t=1,e=this.filters.length;t<e;t++)this.filters[t-1].connect(this.filters[t]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected!==!1){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let t=1,e=this.filters.length;t<e;t++)this.filters[t-1].disconnect(this.filters[t]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}}getFilters(){return this.filters}setFilters(t){return t||(t=[]),this._connected===!0?(this.disconnect(),this.filters=t.slice(),this.connect()):this.filters=t.slice(),this}setDetune(t){if(this.detune=t,this.source.detune!==void 0)return this.isPlaying===!0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(t){return this.setFilters(t?[t]:[])}setPlaybackRate(t){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.playbackRate=t,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1}getLoop(){return this.hasPlaybackControl===!1?(console.warn("THREE.Audio: this Audio has no playback control."),!1):this.loop}setLoop(t){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.loop=t,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(t){return this.loopStart=t,this}setLoopEnd(t){return this.loopEnd=t,this}getVolume(){return this.gain.gain.value}setVolume(t){return this.gain.gain.setTargetAtTime(t,this.context.currentTime,.01),this}},ir=new C,zg=new He,DA=new C,rr=new C,Nf=class extends Rc{constructor(t){super(t),this.panner=this.context.createPanner(),this.panner.panningModel="HRTF",this.panner.connect(this.gain)}connect(){super.connect(),this.panner.connect(this.gain)}disconnect(){super.disconnect(),this.panner.disconnect(this.gain)}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(t){return this.panner.refDistance=t,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(t){return this.panner.rolloffFactor=t,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(t){return this.panner.distanceModel=t,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(t){return this.panner.maxDistance=t,this}setDirectionalCone(t,e,i){return this.panner.coneInnerAngle=t,this.panner.coneOuterAngle=e,this.panner.coneOuterGain=i,this}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(ir,zg,DA),rr.set(0,0,1).applyQuaternion(zg);let e=this.panner;if(e.positionX){let i=this.context.currentTime+this.listener.timeDelta;e.positionX.linearRampToValueAtTime(ir.x,i),e.positionY.linearRampToValueAtTime(ir.y,i),e.positionZ.linearRampToValueAtTime(ir.z,i),e.orientationX.linearRampToValueAtTime(rr.x,i),e.orientationY.linearRampToValueAtTime(rr.y,i),e.orientationZ.linearRampToValueAtTime(rr.z,i)}else e.setPosition(ir.x,ir.y,ir.z),e.setOrientation(rr.x,rr.y,rr.z)}},Ff=class{constructor(t,e=2048){this.analyser=t.context.createAnalyser(),this.analyser.fftSize=e,this.data=new Uint8Array(this.analyser.frequencyBinCount),t.getOutput().connect(this.analyser)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.data),this.data}getAverageFrequency(){let t=0,e=this.getFrequencyData();for(let i=0;i<e.length;i++)t+=e[i];return t/e.length}},Cc=class{constructor(t,e,i){this.binding=t,this.valueSize=i;let r,s,a;switch(e){case"quaternion":r=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(i*6),this._workIndex=5;break;case"string":case"bool":r=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(i*5);break;default:r=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(i*5)}this._mixBufferRegion=r,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(t,e){let i=this.buffer,r=this.valueSize,s=t*r+r,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==r;++o)i[s+o]=i[o];a=e}else{a+=e;let o=e/a;this._mixBufferRegion(i,s,0,o,r)}this.cumulativeWeight=a}accumulateAdditive(t){let e=this.buffer,i=this.valueSize,r=i*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(e,r,0,t,i),this.cumulativeWeightAdditive+=t}apply(t){let e=this.valueSize,i=this.buffer,r=t*e+e,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){let c=e*this._origIndex;this._mixBufferRegion(i,r,c,1-s,e)}a>0&&this._mixBufferRegionAdditive(i,r,this._addIndex*e,1,e);for(let c=e,l=e+e;c!==l;++c)if(i[c]!==i[c+e]){o.setValue(i,r);break}}saveOriginalState(){let t=this.binding,e=this.buffer,i=this.valueSize,r=i*this._origIndex;t.getValue(e,r);for(let s=i,a=r;s!==a;++s)e[s]=e[r+s%i];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let t=this.valueSize*3;this.binding.setValue(this.buffer,t)}_setAdditiveIdentityNumeric(){let t=this._addIndex*this.valueSize,e=t+this.valueSize;for(let i=t;i<e;i++)this.buffer[i]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let t=this._origIndex*this.valueSize,e=this._addIndex*this.valueSize;for(let i=0;i<this.valueSize;i++)this.buffer[e+i]=this.buffer[t+i]}_select(t,e,i,r,s){if(r>=.5)for(let a=0;a!==s;++a)t[e+a]=t[i+a]}_slerp(t,e,i,r){He.slerpFlat(t,e,t,e,t,i,r)}_slerpAdditive(t,e,i,r,s){let a=this._workIndex*s;He.multiplyQuaternionsFlat(t,a,t,e,t,i),He.slerpFlat(t,e,t,e,t,a,r)}_lerp(t,e,i,r,s){let a=1-r;for(let o=0;o!==s;++o){let c=e+o;t[c]=t[c]*a+t[i+o]*r}}_lerpAdditive(t,e,i,r,s){for(let a=0;a!==s;++a){let o=e+a;t[o]=t[o]+t[i+a]*r}}},Ad="\\[\\]\\.:\\/",NA=new RegExp("["+Ad+"]","g"),Td="[^"+Ad+"]",FA="[^"+Ad.replace("\\.","")+"]",OA=/((?:WC+[\/:])*)/.source.replace("WC",Td),BA=/(WCOD+)?/.source.replace("WCOD",FA),zA=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Td),kA=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Td),HA=new RegExp("^"+OA+BA+zA+kA+"$"),VA=["material","materials","bones","map"],Of=class{constructor(t,e,i){let r=i||ee.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,r)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},ee=class n{constructor(t,e,i){this.path=e,this.parsedPath=i||n.parseTrackName(e),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new n.Composite(t,e,i):new n(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(NA,"")}static parseTrackName(t){let e=HA.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);VA.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===e||o.uuid===e)return o;let c=i(o.children);if(c)return c}return null},r=i(t.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)t[e++]=i[r]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,r=e.propertyName,s=e.propertyIndex;if(t||(t=n.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=e.objectIndex;switch(i){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(l!==void 0){if(t[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let a=t[r];if(a===void 0){let l=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+r+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ee.Composite=Of;ee.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ee.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ee.prototype.GetterByBindingType=[ee.prototype._getValue_direct,ee.prototype._getValue_array,ee.prototype._getValue_arrayElement,ee.prototype._getValue_toArray];ee.prototype.SetterByBindingTypeAndVersioning=[[ee.prototype._setValue_direct,ee.prototype._setValue_direct_setNeedsUpdate,ee.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ee.prototype._setValue_array,ee.prototype._setValue_array_setNeedsUpdate,ee.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ee.prototype._setValue_arrayElement,ee.prototype._setValue_arrayElement_setNeedsUpdate,ee.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ee.prototype._setValue_fromArray,ee.prototype._setValue_fromArray_setNeedsUpdate,ee.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Bf=class{constructor(){this.isAnimationObjectGroup=!0,this.uuid=on(),this._objects=Array.prototype.slice.call(arguments),this.nCachedObjects_=0;let t={};this._indicesByUUID=t;for(let i=0,r=arguments.length;i!==r;++i)t[arguments[i].uuid]=i;this._paths=[],this._parsedPaths=[],this._bindings=[],this._bindingsIndicesByPath={};let e=this;this.stats={objects:{get total(){return e._objects.length},get inUse(){return this.total-e.nCachedObjects_}},get bindingsPerObject(){return e._bindings.length}}}add(){let t=this._objects,e=this._indicesByUUID,i=this._paths,r=this._parsedPaths,s=this._bindings,a=s.length,o,c=t.length,l=this.nCachedObjects_;for(let h=0,u=arguments.length;h!==u;++h){let f=arguments[h],d=f.uuid,m=e[d];if(m===void 0){m=c++,e[d]=m,t.push(f);for(let _=0,g=a;_!==g;++_)s[_].push(new ee(f,i[_],r[_]))}else if(m<l){o=t[m];let _=--l,g=t[_];e[g.uuid]=m,t[m]=g,e[d]=_,t[_]=f;for(let p=0,y=a;p!==y;++p){let x=s[p],v=x[_],R=x[m];x[m]=v,R===void 0&&(R=new ee(f,i[p],r[p])),x[_]=R}}else t[m]!==o&&console.error("THREE.AnimationObjectGroup: Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes.")}this.nCachedObjects_=l}remove(){let t=this._objects,e=this._indicesByUUID,i=this._bindings,r=i.length,s=this.nCachedObjects_;for(let a=0,o=arguments.length;a!==o;++a){let c=arguments[a],l=c.uuid,h=e[l];if(h!==void 0&&h>=s){let u=s++,f=t[u];e[f.uuid]=h,t[h]=f,e[l]=u,t[u]=c;for(let d=0,m=r;d!==m;++d){let _=i[d],g=_[u],p=_[h];_[h]=g,_[u]=p}}}this.nCachedObjects_=s}uncache(){let t=this._objects,e=this._indicesByUUID,i=this._bindings,r=i.length,s=this.nCachedObjects_,a=t.length;for(let o=0,c=arguments.length;o!==c;++o){let l=arguments[o],h=l.uuid,u=e[h];if(u!==void 0)if(delete e[h],u<s){let f=--s,d=t[f],m=--a,_=t[m];e[d.uuid]=u,t[u]=d,e[_.uuid]=f,t[f]=_,t.pop();for(let g=0,p=r;g!==p;++g){let y=i[g],x=y[f],v=y[m];y[u]=x,y[f]=v,y.pop()}}else{let f=--a,d=t[f];f>0&&(e[d.uuid]=u),t[u]=d,t.pop();for(let m=0,_=r;m!==_;++m){let g=i[m];g[u]=g[f],g.pop()}}}this.nCachedObjects_=s}subscribe_(t,e){let i=this._bindingsIndicesByPath,r=i[t],s=this._bindings;if(r!==void 0)return s[r];let a=this._paths,o=this._parsedPaths,c=this._objects,l=c.length,h=this.nCachedObjects_,u=new Array(l);r=s.length,i[t]=r,a.push(t),o.push(e),s.push(u);for(let f=h,d=c.length;f!==d;++f){let m=c[f];u[f]=new ee(m,t,e)}return u}unsubscribe_(t){let e=this._bindingsIndicesByPath,i=e[t];if(i!==void 0){let r=this._paths,s=this._parsedPaths,a=this._bindings,o=a.length-1,c=a[o],l=t[o];e[l]=i,a[i]=c,a.pop(),s[i]=s[o],s.pop(),r[i]=r[o],r.pop()}}},Ic=class{constructor(t,e,i=null,r=e.blendMode){this._mixer=t,this._clip=e,this._localRoot=i,this.blendMode=r;let s=e.tracks,a=s.length,o=new Array(a),c={endingStart:lr,endingEnd:lr};for(let l=0;l!==a;++l){let h=s[l].createInterpolant(null);o[l]=h,h.settings=c}this._interpolantSettings=c,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=z0,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(t){return this._startTime=t,this}setLoop(t,e){return this.loop=t,this.repetitions=e,this}setEffectiveWeight(t){return this.weight=t,this._effectiveWeight=this.enabled?t:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(t){return this._scheduleFading(t,0,1)}fadeOut(t){return this._scheduleFading(t,1,0)}crossFadeFrom(t,e,i){if(t.fadeOut(e),this.fadeIn(e),i){let r=this._clip.duration,s=t._clip.duration,a=s/r,o=r/s;t.warp(1,a,e),this.warp(o,1,e)}return this}crossFadeTo(t,e,i){return t.crossFadeFrom(this,e,i)}stopFading(){let t=this._weightInterpolant;return t!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this}setEffectiveTimeScale(t){return this.timeScale=t,this._effectiveTimeScale=this.paused?0:t,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(t){return this.timeScale=this._clip.duration/t,this.stopWarping()}syncWith(t){return this.time=t.time,this.timeScale=t.timeScale,this.stopWarping()}halt(t){return this.warp(this._effectiveTimeScale,0,t)}warp(t,e,i){let r=this._mixer,s=r.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=r._lendControlInterpolant(),this._timeScaleInterpolant=o);let c=o.parameterPositions,l=o.sampleValues;return c[0]=s,c[1]=s+i,l[0]=t/a,l[1]=e/a,this}stopWarping(){let t=this._timeScaleInterpolant;return t!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(t,e,i,r){if(!this.enabled){this._updateWeight(t);return}let s=this._startTime;if(s!==null){let c=(t-s)*i;c<0||i===0?e=0:(this._startTime=null,e=i*c)}e*=this._updateTimeScale(t);let a=this._updateTime(e),o=this._updateWeight(t);if(o>0){let c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case yd:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(a),l[h].accumulateAdditive(o);break;case Dc:default:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(a),l[h].accumulate(r,o)}}}_updateWeight(t){let e=0;if(this.enabled){e=this.weight;let i=this._weightInterpolant;if(i!==null){let r=i.evaluate(t)[0];e*=r,t>i.parameterPositions[1]&&(this.stopFading(),r===0&&(this.enabled=!1))}}return this._effectiveWeight=e,e}_updateTimeScale(t){let e=0;if(!this.paused){e=this.timeScale;let i=this._timeScaleInterpolant;if(i!==null){let r=i.evaluate(t)[0];e*=r,t>i.parameterPositions[1]&&(this.stopWarping(),e===0?this.paused=!0:this.timeScale=e)}}return this._effectiveTimeScale=e,e}_updateTime(t){let e=this._clip.duration,i=this.loop,r=this.time+t,s=this._loopCount,a=i===k0;if(t===0)return s===-1?r:a&&(s&1)===1?e-r:r;if(i===B0){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));t:{if(r>=e)r=e;else if(r<0)r=0;else{this.time=r;break t}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=r,this._mixer.dispatchEvent({type:"finished",action:this,direction:t<0?-1:1})}}else{if(s===-1&&(t>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),r>=e||r<0){let o=Math.floor(r/e);r-=e*o,s+=Math.abs(o);let c=this.repetitions-s;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,r=t>0?e:0,this.time=r,this._mixer.dispatchEvent({type:"finished",action:this,direction:t>0?1:-1});else{if(c===1){let l=t<0;this._setEndings(l,!l,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=r,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=r;if(a&&(s&1)===1)return e-r}return r}_setEndings(t,e,i){let r=this._interpolantSettings;i?(r.endingStart=cr,r.endingEnd=cr):(t?r.endingStart=this.zeroSlopeAtStart?cr:lr:r.endingStart=ma,e?r.endingEnd=this.zeroSlopeAtEnd?cr:lr:r.endingEnd=ma)}_scheduleFading(t,e,i){let r=this._mixer,s=r.time,a=this._weightInterpolant;a===null&&(a=r._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,c=a.sampleValues;return o[0]=s,c[0]=e,o[1]=s+t,c[1]=i,this}},GA=new Float32Array(1),zf=class extends wn{constructor(t){super(),this._root=t,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(t,e){let i=t._localRoot||this._root,r=t._clip.tracks,s=r.length,a=t._propertyBindings,o=t._interpolants,c=i.uuid,l=this._bindingsByRootAndName,h=l[c];h===void 0&&(h={},l[c]=h);for(let u=0;u!==s;++u){let f=r[u],d=f.name,m=h[d];if(m!==void 0)++m.referenceCount,a[u]=m;else{if(m=a[u],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,c,d));continue}let _=e&&e._propertyBindings[u].binding.parsedPath;m=new Cc(ee.create(i,d,_),f.ValueTypeName,f.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,c,d),a[u]=m}o[u].resultBuffer=m.buffer}}_activateAction(t){if(!this._isActiveAction(t)){if(t._cacheIndex===null){let i=(t._localRoot||this._root).uuid,r=t._clip.uuid,s=this._actionsByClip[r];this._bindAction(t,s&&s.knownActions[0]),this._addInactiveAction(t,r,i)}let e=t._propertyBindings;for(let i=0,r=e.length;i!==r;++i){let s=e[i];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(t)}}_deactivateAction(t){if(this._isActiveAction(t)){let e=t._propertyBindings;for(let i=0,r=e.length;i!==r;++i){let s=e[i];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(t)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let t=this;this.stats={actions:{get total(){return t._actions.length},get inUse(){return t._nActiveActions}},bindings:{get total(){return t._bindings.length},get inUse(){return t._nActiveBindings}},controlInterpolants:{get total(){return t._controlInterpolants.length},get inUse(){return t._nActiveControlInterpolants}}}}_isActiveAction(t){let e=t._cacheIndex;return e!==null&&e<this._nActiveActions}_addInactiveAction(t,e,i){let r=this._actions,s=this._actionsByClip,a=s[e];if(a===void 0)a={knownActions:[t],actionByRoot:{}},t._byClipCacheIndex=0,s[e]=a;else{let o=a.knownActions;t._byClipCacheIndex=o.length,o.push(t)}t._cacheIndex=r.length,r.push(t),a.actionByRoot[i]=t}_removeInactiveAction(t){let e=this._actions,i=e[e.length-1],r=t._cacheIndex;i._cacheIndex=r,e[r]=i,e.pop(),t._cacheIndex=null;let s=t._clip.uuid,a=this._actionsByClip,o=a[s],c=o.knownActions,l=c[c.length-1],h=t._byClipCacheIndex;l._byClipCacheIndex=h,c[h]=l,c.pop(),t._byClipCacheIndex=null;let u=o.actionByRoot,f=(t._localRoot||this._root).uuid;delete u[f],c.length===0&&delete a[s],this._removeInactiveBindingsForAction(t)}_removeInactiveBindingsForAction(t){let e=t._propertyBindings;for(let i=0,r=e.length;i!==r;++i){let s=e[i];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(t){let e=this._actions,i=t._cacheIndex,r=this._nActiveActions++,s=e[r];t._cacheIndex=r,e[r]=t,s._cacheIndex=i,e[i]=s}_takeBackAction(t){let e=this._actions,i=t._cacheIndex,r=--this._nActiveActions,s=e[r];t._cacheIndex=r,e[r]=t,s._cacheIndex=i,e[i]=s}_addInactiveBinding(t,e,i){let r=this._bindingsByRootAndName,s=this._bindings,a=r[e];a===void 0&&(a={},r[e]=a),a[i]=t,t._cacheIndex=s.length,s.push(t)}_removeInactiveBinding(t){let e=this._bindings,i=t.binding,r=i.rootNode.uuid,s=i.path,a=this._bindingsByRootAndName,o=a[r],c=e[e.length-1],l=t._cacheIndex;c._cacheIndex=l,e[l]=c,e.pop(),delete o[s],Object.keys(o).length===0&&delete a[r]}_lendBinding(t){let e=this._bindings,i=t._cacheIndex,r=this._nActiveBindings++,s=e[r];t._cacheIndex=r,e[r]=t,s._cacheIndex=i,e[i]=s}_takeBackBinding(t){let e=this._bindings,i=t._cacheIndex,r=--this._nActiveBindings,s=e[r];t._cacheIndex=r,e[r]=t,s._cacheIndex=i,e[i]=s}_lendControlInterpolant(){let t=this._controlInterpolants,e=this._nActiveControlInterpolants++,i=t[e];return i===void 0&&(i=new qa(new Float32Array(2),new Float32Array(2),1,GA),i.__cacheIndex=e,t[e]=i),i}_takeBackControlInterpolant(t){let e=this._controlInterpolants,i=t.__cacheIndex,r=--this._nActiveControlInterpolants,s=e[r];t.__cacheIndex=r,e[r]=t,s.__cacheIndex=i,e[i]=s}clipAction(t,e,i){let r=e||this._root,s=r.uuid,a=typeof t=="string"?br.findByName(r,t):t,o=a!==null?a.uuid:t,c=this._actionsByClip[o],l=null;if(i===void 0&&(a!==null?i=a.blendMode:i=Dc),c!==void 0){let u=c.actionByRoot[s];if(u!==void 0&&u.blendMode===i)return u;l=c.knownActions[0],a===null&&(a=l._clip)}if(a===null)return null;let h=new Ic(this,a,e,i);return this._bindAction(h,l),this._addInactiveAction(h,o,s),h}existingAction(t,e){let i=e||this._root,r=i.uuid,s=typeof t=="string"?br.findByName(i,t):t,a=s?s.uuid:t,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[r]||null}stopAllAction(){let t=this._actions,e=this._nActiveActions;for(let i=e-1;i>=0;--i)t[i].stop();return this}update(t){t*=this.timeScale;let e=this._actions,i=this._nActiveActions,r=this.time+=t,s=Math.sign(t),a=this._accuIndex^=1;for(let l=0;l!==i;++l)e[l]._update(r,t,s,a);let o=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)o[l].apply(a);return this}setTime(t){this.time=0;for(let e=0;e<this._actions.length;e++)this._actions[e].time=0;return this.update(t)}getRoot(){return this._root}uncacheClip(t){let e=this._actions,i=t.uuid,r=this._actionsByClip,s=r[i];if(s!==void 0){let a=s.knownActions;for(let o=0,c=a.length;o!==c;++o){let l=a[o];this._deactivateAction(l);let h=l._cacheIndex,u=e[e.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,u._cacheIndex=h,e[h]=u,e.pop(),this._removeInactiveBindingsForAction(l)}delete r[i]}}uncacheRoot(t){let e=t.uuid,i=this._actionsByClip;for(let a in i){let o=i[a].actionByRoot,c=o[e];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}let r=this._bindingsByRootAndName,s=r[e];if(s!==void 0)for(let a in s){let o=s[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(t,e){let i=this.existingAction(t,e);i!==null&&(this._deactivateAction(i),this._removeInactiveAction(i))}},kf=class n{constructor(t){this.value=t}clone(){return new n(this.value.clone===void 0?this.value:this.value.clone())}},WA=0,Hf=class extends wn{constructor(){super(),this.isUniformsGroup=!0,Object.defineProperty(this,"id",{value:WA++}),this.name="",this.usage=ya,this.uniforms=[]}add(t){return this.uniforms.push(t),this}remove(t){let e=this.uniforms.indexOf(t);return e!==-1&&this.uniforms.splice(e,1),this}setName(t){return this.name=t,this}setUsage(t){return this.usage=t,this}dispose(){return this.dispatchEvent({type:"dispose"}),this}copy(t){this.name=t.name,this.usage=t.usage;let e=t.uniforms;this.uniforms.length=0;for(let i=0,r=e.length;i<r;i++){let s=Array.isArray(e[i])?e[i]:[e[i]];for(let a=0;a<s.length;a++)this.uniforms.push(s[a].clone())}return this}clone(){return new this.constructor().copy(this)}},Vf=class extends xs{constructor(t,e,i=1){super(t,e),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}clone(t){let e=super.clone(t);return e.meshPerAttribute=this.meshPerAttribute,e}toJSON(t){let e=super.toJSON(t);return e.isInstancedInterleavedBuffer=!0,e.meshPerAttribute=this.meshPerAttribute,e}},Gf=class{constructor(t,e,i,r,s){this.isGLBufferAttribute=!0,this.name="",this.buffer=t,this.type=e,this.itemSize=i,this.elementSize=r,this.count=s,this.version=0}set needsUpdate(t){t===!0&&this.version++}setBuffer(t){return this.buffer=t,this}setType(t,e){return this.type=t,this.elementSize=e,this}setItemSize(t){return this.itemSize=t,this}setCount(t){return this.count=t,this}},Wf=class{constructor(t,e,i=0,r=1/0){this.ray=new Li(t,e),this.near=i,this.far=r,this.camera=null,this.layers=new ps,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}intersectObject(t,e=!0,i=[]){return Xf(t,this,i,e),i.sort(kg),i}intersectObjects(t,e=!0,i=[]){for(let r=0,s=t.length;r<s;r++)Xf(t[r],this,i,e);return i.sort(kg),i}};function kg(n,t){return n.distance-t.distance}function Xf(n,t,e,i){if(n.layers.test(t.layers)&&n.raycast(t,e),i===!0){let r=n.children;for(let s=0,a=r.length;s<a;s++)Xf(r[s],t,e,!0)}}var qf=class{constructor(t=1,e=0,i=0){return this.radius=t,this.phi=e,this.theta=i,this}set(t,e,i){return this.radius=t,this.phi=e,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){return this.radius=Math.sqrt(t*t+e*e+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,i),this.phi=Math.acos(pe(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}},Yf=class{constructor(t=1,e=0,i=0){return this.radius=t,this.theta=e,this.y=i,this}set(t,e,i){return this.radius=t,this.theta=e,this.y=i,this}copy(t){return this.radius=t.radius,this.theta=t.theta,this.y=t.y,this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){return this.radius=Math.sqrt(t*t+i*i),this.theta=Math.atan2(t,i),this.y=e,this}clone(){return new this.constructor().copy(this)}},Hg=new $,Zf=class{constructor(t=new $(1/0,1/0),e=new $(-1/0,-1/0)){this.isBox2=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Hg.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(t){return this.isEmpty()?t.set(0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y)}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Hg).distanceTo(t)}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},Vg=new C,rl=new C,$f=class{constructor(t=new C,e=new C){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){Vg.subVectors(t,this.start),rl.subVectors(this.end,this.start);let i=rl.dot(rl),s=rl.dot(Vg)/i;return e&&(s=pe(s,0,1)),s}closestPointToPoint(t,e,i){let r=this.closestPointToPointParameter(t,e);return this.delta(i).multiplyScalar(r).add(this.start)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}},Gg=new C,Jf=class extends jt{constructor(t,e){super(),this.light=t,this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1,this.color=e,this.type="SpotLightHelper";let i=new Wt,r=[0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,-1,0,1,0,0,0,0,1,1,0,0,0,0,-1,1];for(let a=0,o=1,c=32;a<c;a++,o++){let l=a/c*Math.PI*2,h=o/c*Math.PI*2;r.push(Math.cos(l),Math.sin(l),1,Math.cos(h),Math.sin(h),1)}i.setAttribute("position",new yt(r,3));let s=new Ne({fog:!1,toneMapped:!1});this.cone=new _n(i,s),this.add(this.cone),this.update()}dispose(){this.cone.geometry.dispose(),this.cone.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1);let t=this.light.distance?this.light.distance:1e3,e=t*Math.tan(this.light.angle);this.cone.scale.set(e,e,t),Gg.setFromMatrixPosition(this.light.target.matrixWorld),this.cone.lookAt(Gg),this.color!==void 0?this.cone.material.color.set(this.color):this.cone.material.color.copy(this.light.color)}},wi=new C,sl=new Lt,hu=new Lt,Kf=class extends _n{constructor(t){let e=g_(t),i=new Wt,r=[],s=[],a=new pt(0,0,1),o=new pt(0,1,0);for(let l=0;l<e.length;l++){let h=e[l];h.parent&&h.parent.isBone&&(r.push(0,0,0),r.push(0,0,0),s.push(a.r,a.g,a.b),s.push(o.r,o.g,o.b))}i.setAttribute("position",new yt(r,3)),i.setAttribute("color",new yt(s,3));let c=new Ne({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(i,c),this.isSkeletonHelper=!0,this.type="SkeletonHelper",this.root=t,this.bones=e,this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1}updateMatrixWorld(t){let e=this.bones,i=this.geometry,r=i.getAttribute("position");hu.copy(this.root.matrixWorld).invert();for(let s=0,a=0;s<e.length;s++){let o=e[s];o.parent&&o.parent.isBone&&(sl.multiplyMatrices(hu,o.matrixWorld),wi.setFromMatrixPosition(sl),r.setXYZ(a,wi.x,wi.y,wi.z),sl.multiplyMatrices(hu,o.parent.matrixWorld),wi.setFromMatrixPosition(sl),r.setXYZ(a+1,wi.x,wi.y,wi.z),a+=2)}i.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(t)}dispose(){this.geometry.dispose(),this.material.dispose()}};function g_(n){let t=[];n.isBone===!0&&t.push(n);for(let e=0;e<n.children.length;e++)t.push.apply(t,g_(n.children[e]));return t}var Qf=class extends ye{constructor(t,e,i){let r=new Wa(e,4,2),s=new Bn({wireframe:!0,fog:!1,toneMapped:!1});super(r,s),this.light=t,this.color=i,this.type="PointLightHelper",this.matrix=this.light.matrixWorld,this.matrixAutoUpdate=!1,this.update()}dispose(){this.geometry.dispose(),this.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.color!==void 0?this.material.color.set(this.color):this.material.color.copy(this.light.color)}},XA=new C,Wg=new pt,Xg=new pt,jf=class extends jt{constructor(t,e,i){super(),this.light=t,this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1,this.color=i,this.type="HemisphereLightHelper";let r=new Ga(e);r.rotateY(Math.PI*.5),this.material=new Bn({wireframe:!0,fog:!1,toneMapped:!1}),this.color===void 0&&(this.material.vertexColors=!0);let s=r.getAttribute("position"),a=new Float32Array(s.count*3);r.setAttribute("color",new Qt(a,3)),this.add(new ye(r,this.material)),this.update()}dispose(){this.children[0].geometry.dispose(),this.children[0].material.dispose()}update(){let t=this.children[0];if(this.color!==void 0)this.material.color.set(this.color);else{let e=t.geometry.getAttribute("color");Wg.copy(this.light.color),Xg.copy(this.light.groundColor);for(let i=0,r=e.count;i<r;i++){let s=i<r/2?Wg:Xg;e.setXYZ(i,s.r,s.g,s.b)}e.needsUpdate=!0}this.light.updateWorldMatrix(!0,!1),t.lookAt(XA.setFromMatrixPosition(this.light.matrixWorld).negate())}},td=class extends _n{constructor(t=10,e=10,i=4473924,r=8947848){i=new pt(i),r=new pt(r);let s=e/2,a=t/e,o=t/2,c=[],l=[];for(let f=0,d=0,m=-o;f<=e;f++,m+=a){c.push(-o,0,m,o,0,m),c.push(m,0,-o,m,0,o);let _=f===s?i:r;_.toArray(l,d),d+=3,_.toArray(l,d),d+=3,_.toArray(l,d),d+=3,_.toArray(l,d),d+=3}let h=new Wt;h.setAttribute("position",new yt(c,3)),h.setAttribute("color",new yt(l,3));let u=new Ne({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}},ed=class extends _n{constructor(t=10,e=16,i=8,r=64,s=4473924,a=8947848){s=new pt(s),a=new pt(a);let o=[],c=[];if(e>1)for(let u=0;u<e;u++){let f=u/e*(Math.PI*2),d=Math.sin(f)*t,m=Math.cos(f)*t;o.push(0,0,0),o.push(d,0,m);let _=u&1?s:a;c.push(_.r,_.g,_.b),c.push(_.r,_.g,_.b)}for(let u=0;u<i;u++){let f=u&1?s:a,d=t-t/i*u;for(let m=0;m<r;m++){let _=m/r*(Math.PI*2),g=Math.sin(_)*d,p=Math.cos(_)*d;o.push(g,0,p),c.push(f.r,f.g,f.b),_=(m+1)/r*(Math.PI*2),g=Math.sin(_)*d,p=Math.cos(_)*d,o.push(g,0,p),c.push(f.r,f.g,f.b)}}let l=new Wt;l.setAttribute("position",new yt(o,3)),l.setAttribute("color",new yt(c,3));let h=new Ne({vertexColors:!0,toneMapped:!1});super(l,h),this.type="PolarGridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}},qg=new C,al=new C,Yg=new C,nd=class extends jt{constructor(t,e,i){super(),this.light=t,this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1,this.color=i,this.type="DirectionalLightHelper",e===void 0&&(e=1);let r=new Wt;r.setAttribute("position",new yt([-e,e,0,e,e,0,e,-e,0,-e,-e,0,-e,e,0],3));let s=new Ne({fog:!1,toneMapped:!1});this.lightPlane=new zn(r,s),this.add(this.lightPlane),r=new Wt,r.setAttribute("position",new yt([0,0,0,0,0,1],3)),this.targetLine=new zn(r,s),this.add(this.targetLine),this.update()}dispose(){this.lightPlane.geometry.dispose(),this.lightPlane.material.dispose(),this.targetLine.geometry.dispose(),this.targetLine.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),qg.setFromMatrixPosition(this.light.matrixWorld),al.setFromMatrixPosition(this.light.target.matrixWorld),Yg.subVectors(al,qg),this.lightPlane.lookAt(al),this.color!==void 0?(this.lightPlane.material.color.set(this.color),this.targetLine.material.color.set(this.color)):(this.lightPlane.material.color.copy(this.light.color),this.targetLine.material.color.copy(this.light.color)),this.targetLine.lookAt(al),this.targetLine.scale.z=Yg.length()}},ol=new C,de=new gs,id=class extends _n{constructor(t){let e=new Wt,i=new Ne({color:16777215,vertexColors:!0,toneMapped:!1}),r=[],s=[],a={};o("n1","n2"),o("n2","n4"),o("n4","n3"),o("n3","n1"),o("f1","f2"),o("f2","f4"),o("f4","f3"),o("f3","f1"),o("n1","f1"),o("n2","f2"),o("n3","f3"),o("n4","f4"),o("p","n1"),o("p","n2"),o("p","n3"),o("p","n4"),o("u1","u2"),o("u2","u3"),o("u3","u1"),o("c","t"),o("p","c"),o("cn1","cn2"),o("cn3","cn4"),o("cf1","cf2"),o("cf3","cf4");function o(m,_){c(m),c(_)}function c(m){r.push(0,0,0),s.push(0,0,0),a[m]===void 0&&(a[m]=[]),a[m].push(r.length/3-1)}e.setAttribute("position",new yt(r,3)),e.setAttribute("color",new yt(s,3)),super(e,i),this.type="CameraHelper",this.camera=t,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=t.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=a,this.update();let l=new pt(16755200),h=new pt(16711680),u=new pt(43775),f=new pt(16777215),d=new pt(3355443);this.setColors(l,h,u,f,d)}setColors(t,e,i,r,s){let o=this.geometry.getAttribute("color");o.setXYZ(0,t.r,t.g,t.b),o.setXYZ(1,t.r,t.g,t.b),o.setXYZ(2,t.r,t.g,t.b),o.setXYZ(3,t.r,t.g,t.b),o.setXYZ(4,t.r,t.g,t.b),o.setXYZ(5,t.r,t.g,t.b),o.setXYZ(6,t.r,t.g,t.b),o.setXYZ(7,t.r,t.g,t.b),o.setXYZ(8,t.r,t.g,t.b),o.setXYZ(9,t.r,t.g,t.b),o.setXYZ(10,t.r,t.g,t.b),o.setXYZ(11,t.r,t.g,t.b),o.setXYZ(12,t.r,t.g,t.b),o.setXYZ(13,t.r,t.g,t.b),o.setXYZ(14,t.r,t.g,t.b),o.setXYZ(15,t.r,t.g,t.b),o.setXYZ(16,t.r,t.g,t.b),o.setXYZ(17,t.r,t.g,t.b),o.setXYZ(18,t.r,t.g,t.b),o.setXYZ(19,t.r,t.g,t.b),o.setXYZ(20,t.r,t.g,t.b),o.setXYZ(21,t.r,t.g,t.b),o.setXYZ(22,t.r,t.g,t.b),o.setXYZ(23,t.r,t.g,t.b),o.setXYZ(24,e.r,e.g,e.b),o.setXYZ(25,e.r,e.g,e.b),o.setXYZ(26,e.r,e.g,e.b),o.setXYZ(27,e.r,e.g,e.b),o.setXYZ(28,e.r,e.g,e.b),o.setXYZ(29,e.r,e.g,e.b),o.setXYZ(30,e.r,e.g,e.b),o.setXYZ(31,e.r,e.g,e.b),o.setXYZ(32,i.r,i.g,i.b),o.setXYZ(33,i.r,i.g,i.b),o.setXYZ(34,i.r,i.g,i.b),o.setXYZ(35,i.r,i.g,i.b),o.setXYZ(36,i.r,i.g,i.b),o.setXYZ(37,i.r,i.g,i.b),o.setXYZ(38,r.r,r.g,r.b),o.setXYZ(39,r.r,r.g,r.b),o.setXYZ(40,s.r,s.g,s.b),o.setXYZ(41,s.r,s.g,s.b),o.setXYZ(42,s.r,s.g,s.b),o.setXYZ(43,s.r,s.g,s.b),o.setXYZ(44,s.r,s.g,s.b),o.setXYZ(45,s.r,s.g,s.b),o.setXYZ(46,s.r,s.g,s.b),o.setXYZ(47,s.r,s.g,s.b),o.setXYZ(48,s.r,s.g,s.b),o.setXYZ(49,s.r,s.g,s.b),o.needsUpdate=!0}update(){let t=this.geometry,e=this.pointMap,i=1,r=1;de.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),ge("c",e,t,de,0,0,-1),ge("t",e,t,de,0,0,1),ge("n1",e,t,de,-i,-r,-1),ge("n2",e,t,de,i,-r,-1),ge("n3",e,t,de,-i,r,-1),ge("n4",e,t,de,i,r,-1),ge("f1",e,t,de,-i,-r,1),ge("f2",e,t,de,i,-r,1),ge("f3",e,t,de,-i,r,1),ge("f4",e,t,de,i,r,1),ge("u1",e,t,de,i*.7,r*1.1,-1),ge("u2",e,t,de,-i*.7,r*1.1,-1),ge("u3",e,t,de,0,r*2,-1),ge("cf1",e,t,de,-i,0,1),ge("cf2",e,t,de,i,0,1),ge("cf3",e,t,de,0,-r,1),ge("cf4",e,t,de,0,r,1),ge("cn1",e,t,de,-i,0,-1),ge("cn2",e,t,de,i,0,-1),ge("cn3",e,t,de,0,-r,-1),ge("cn4",e,t,de,0,r,-1),t.getAttribute("position").needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose()}};function ge(n,t,e,i,r,s,a){ol.set(r,s,a).unproject(i);let o=t[n];if(o!==void 0){let c=e.getAttribute("position");for(let l=0,h=o.length;l<h;l++)c.setXYZ(o[l],ol.x,ol.y,ol.z)}}var ll=new De,rd=class extends _n{constructor(t,e=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),r=new Float32Array(8*3),s=new Wt;s.setIndex(new Qt(i,1)),s.setAttribute("position",new Qt(r,3)),super(s,new Ne({color:e,toneMapped:!1})),this.object=t,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(t){if(t!==void 0&&console.warn("THREE.BoxHelper: .update() has no longer arguments."),this.object!==void 0&&ll.setFromObject(this.object),ll.isEmpty())return;let e=ll.min,i=ll.max,r=this.geometry.attributes.position,s=r.array;s[0]=i.x,s[1]=i.y,s[2]=i.z,s[3]=e.x,s[4]=i.y,s[5]=i.z,s[6]=e.x,s[7]=e.y,s[8]=i.z,s[9]=i.x,s[10]=e.y,s[11]=i.z,s[12]=i.x,s[13]=i.y,s[14]=e.z,s[15]=e.x,s[16]=i.y,s[17]=e.z,s[18]=e.x,s[19]=e.y,s[20]=e.z,s[21]=i.x,s[22]=e.y,s[23]=e.z,r.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(t){return this.object=t,this.update(),this}copy(t,e){return super.copy(t,e),this.object=t.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}},sd=class extends _n{constructor(t,e=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),r=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],s=new Wt;s.setIndex(new Qt(i,1)),s.setAttribute("position",new yt(r,3)),super(s,new Ne({color:e,toneMapped:!1})),this.box=t,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(t){let e=this.box;e.isEmpty()||(e.getCenter(this.position),e.getSize(this.scale),this.scale.multiplyScalar(.5),super.updateMatrixWorld(t))}dispose(){this.geometry.dispose(),this.material.dispose()}},ad=class extends zn{constructor(t,e=1,i=16776960){let r=i,s=[1,-1,0,-1,1,0,-1,-1,0,1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],a=new Wt;a.setAttribute("position",new yt(s,3)),a.computeBoundingSphere(),super(a,new Ne({color:r,toneMapped:!1})),this.type="PlaneHelper",this.plane=t,this.size=e;let o=[1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],c=new Wt;c.setAttribute("position",new yt(o,3)),c.computeBoundingSphere(),this.add(new ye(c,new Bn({color:r,opacity:.2,transparent:!0,depthWrite:!1,toneMapped:!1})))}updateMatrixWorld(t){this.position.set(0,0,0),this.scale.set(.5*this.size,.5*this.size,1),this.lookAt(this.plane.normal),this.translateZ(-this.plane.constant),super.updateMatrixWorld(t)}dispose(){this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}},Zg=new C,cl,uu,od=class extends jt{constructor(t=new C(0,0,1),e=new C(0,0,0),i=1,r=16776960,s=i*.2,a=s*.2){super(),this.type="ArrowHelper",cl===void 0&&(cl=new Wt,cl.setAttribute("position",new yt([0,0,0,0,1,0],3)),uu=new Ms(0,.5,1,5,1),uu.translate(0,-.5,0)),this.position.copy(e),this.line=new zn(cl,new Ne({color:r,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new ye(uu,new Bn({color:r,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(t),this.setLength(i,s,a)}setDirection(t){if(t.y>.99999)this.quaternion.set(0,0,0,1);else if(t.y<-.99999)this.quaternion.set(1,0,0,0);else{Zg.set(t.z,0,-t.x).normalize();let e=Math.acos(t.y);this.quaternion.setFromAxisAngle(Zg,e)}}setLength(t,e=t*.2,i=e*.2){this.line.scale.set(1,Math.max(1e-4,t-e),1),this.line.updateMatrix(),this.cone.scale.set(i,e,i),this.cone.position.y=t,this.cone.updateMatrix()}setColor(t){this.line.material.color.set(t),this.cone.material.color.set(t)}copy(t){return super.copy(t,!1),this.line.copy(t.line),this.cone.copy(t.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}},ld=class extends _n{constructor(t=1){let e=[0,0,0,t,0,0,0,0,0,0,t,0,0,0,0,0,0,t],i=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],r=new Wt;r.setAttribute("position",new yt(e,3)),r.setAttribute("color",new yt(i,3));let s=new Ne({vertexColors:!0,toneMapped:!1});super(r,s),this.type="AxesHelper"}setColors(t,e,i){let r=new pt,s=this.geometry.attributes.color.array;return r.set(t),r.toArray(s,0),r.toArray(s,3),r.set(e),r.toArray(s,6),r.toArray(s,9),r.set(i),r.toArray(s,12),r.toArray(s,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}},cd=class{constructor(){this.type="ShapePath",this.color=new pt,this.subPaths=[],this.currentPath=null}moveTo(t,e){return this.currentPath=new xr,this.subPaths.push(this.currentPath),this.currentPath.moveTo(t,e),this}lineTo(t,e){return this.currentPath.lineTo(t,e),this}quadraticCurveTo(t,e,i,r){return this.currentPath.quadraticCurveTo(t,e,i,r),this}bezierCurveTo(t,e,i,r,s,a){return this.currentPath.bezierCurveTo(t,e,i,r,s,a),this}splineThru(t){return this.currentPath.splineThru(t),this}toShapes(t){function e(p){let y=[];for(let x=0,v=p.length;x<v;x++){let R=p[x],E=new oi;E.curves=R.curves,y.push(E)}return y}function i(p,y){let x=y.length,v=!1;for(let R=x-1,E=0;E<x;R=E++){let w=y[R],I=y[E],M=I.x-w.x,S=I.y-w.y;if(Math.abs(S)>Number.EPSILON){if(S<0&&(w=y[E],M=-M,I=y[R],S=-S),p.y<w.y||p.y>I.y)continue;if(p.y===w.y){if(p.x===w.x)return!0}else{let D=S*(p.x-w.x)-M*(p.y-w.y);if(D===0)return!0;if(D<0)continue;v=!v}}else{if(p.y!==w.y)continue;if(I.x<=p.x&&p.x<=w.x||w.x<=p.x&&p.x<=I.x)return!0}}return v}let r=Fn.isClockWise,s=this.subPaths;if(s.length===0)return[];let a,o,c,l=[];if(s.length===1)return o=s[0],c=new oi,c.curves=o.curves,l.push(c),l;let h=!r(s[0].getPoints());h=t?!h:h;let u=[],f=[],d=[],m=0,_;f[m]=void 0,d[m]=[];for(let p=0,y=s.length;p<y;p++)o=s[p],_=o.getPoints(),a=r(_),a=t?!a:a,a?(!h&&f[m]&&m++,f[m]={s:new oi,p:_},f[m].s.curves=o.curves,h&&m++,d[m]=[]):d[m].push({h:o,p:_[0]});if(!f[0])return e(s);if(f.length>1){let p=!1,y=0;for(let x=0,v=f.length;x<v;x++)u[x]=[];for(let x=0,v=f.length;x<v;x++){let R=d[x];for(let E=0;E<R.length;E++){let w=R[E],I=!0;for(let M=0;M<f.length;M++)i(w.p,f[M].p)&&(x!==M&&y++,I?(I=!1,u[M].push(w)):p=!0);I&&u[x].push(w)}}y>0&&p===!1&&(d=u)}let g;for(let p=0,y=f.length;p<y;p++){c=f[p].s,l.push(c),g=d[p];for(let x=0,v=g.length;x<v;x++)c.holes.push(g[x].h)}return l}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Pc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Pc);var export_Buffer=qA.Buffer;export{export_Buffer as Buffer,__ as THREE,rM as pako};
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

pako/dist/pako.esm.mjs:
  (*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) *)

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
