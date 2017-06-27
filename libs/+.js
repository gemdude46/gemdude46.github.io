/*Object.prototype.path=function(p){
    var c=this;
    while(p){
        if(p.
    }
}*/

addEventListener('load', function(){
    window.body = document.body;
});
window.head = document.head;
window.html = document.querySelector('html');

(function(){
    var raw = (
        location.href.indexOf('?')==-1?'':
            location.href.substring(
                1+location.href.indexOf('?'),
                location.href.indexOf('#')==-1?
                    location.href.length:
                    location.href.indexOf('#')
            )
        );
    var arg_pairs = raw.split('&'), args = {};
    for (var i = 0; i < arg_pairs.length; i++)
        if (arg_pairs[i])
            args[decodeURI(arg_pairs[i].substr(0, arg_pairs[i].indexOf('=')))] = decodeURI(arg_pairs[i].substr(1+arg_pairs[i].indexOf('=')));
    location.arguments = args;
})();

window.PLUS = {};

function noop(){}
PLUS.noop = noop;

String.prototype.isString=true;

Array.prototype.toCSSColorRGBf = function () {
    if (this.length != 3)
        throw TypeError('RGB color must contain 3 values.');
    if (this[0] < 0 || this[0] > 1 || this[1] < 0 || this[1] > 1 || this[2] < 0 || this[2] > 1)
        throw RangeError('All RGB float values must be between 0 and 1.');
    return 'rgb(' + (0|(this[0]*255)) + ',' + (0|(this[1]*255)) + ',' + (0|(this[2]*255)) + ')';
};

String.prototype.asHTML = function(t) {
    var s='';
    while(t){
        s+=t[0]=='>'?'&gt;':(t[0]=='<'?'&lt;':(t[0]=='&'?'&amp;':(t[0]=='\n'?'<br>':t[0])));
        t=t.substr(1);
    }
    return s;
}

if (!Array.from) {
    Array.from = function(i) {
        return [].slice.call(i);
    };
}

if (!''.startsWith) {
    String.prototype.startsWith = function(prefix) {
        return this.indexOf(prefix) === 0;
    };

    String.prototype.endsWith = function(suffix) {
        return this.match(suffix+"$") == suffix;
    };
}

if (![].indexOf) {
    Array.prototype.indexOf = function(d, e) {
        var a;
        if (null == this) throw new TypeError('"this" is null or not defined');
        var c = Object(this),
            b = c.length >>> 0;
        if (0 === b) return -1;
        a = +e || 0;
        Infinity === Math.abs(a) && (a = 0);
        if (a >= b) return -1;
        for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b;) {
            if (a in c && c[a] === d) return a;
            a++;
        }
        return -1
    };
}

Array.prototype.isArray=true;
Array.prototype.first=function(){return this[0];};
Array.prototype.last=function(){return this[this.length-1];};
Array.prototype.removeFirst=function(i){this.splice(this.indexOf(i),1);return this;};

Element.prototype.isElement=true;
Element.prototype.currentlyPlayingAnimations=0;

Element.prototype.setValue=function(c){this.value=c;return this;};
Element.prototype.scrollToTop=function(){this.scrollVertTo(0);return this;};
Element.prototype.scrollToBottom=function(){this.scrollVertTo(this.scrollHeight);return this;};
Element.prototype.scrollVertTo=function(x){if(this==body)scrollTo(scrollX,x);else this.scrollTop=x;return this;};
Element.prototype.hide=function(){this.style.visibility='hidden';return this;};
Element.prototype.show=function(){this.style.visibility='visible';return this;};
Element.prototype.remove=function(){this.parentNode.removeChild(this);return this;};
Element.prototype.setContent=function(c){
    if (c.isString) this.innerHTML=c;
    else {
        this.setContent('');
        this.appendContent(c);
    }
    return this;
};
Element.prototype.appendContent=function(c){
    if (c.isString) this.innerHTML+=c;
    else if (c.hasOwnProperty('length')) for (var i = 0; i < c.length; i++) this.appendContent(c[i]);
    else if (c.isElement) this.appendChild(c);
    return this;
};
Element.prototype.setCaretPosition=function(pos){
	if(this.setSelectionRange) {
		this.focus();
		this.setSelectionRange(pos,pos);
	}
	else if (ctrl.createTextRange) {
		var range = this.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
	return this;
};
Element.prototype.fadeIn=function(over,cb){
    this.currentlyPlayingAnimations++;
    over=(over/50)|0||20;
    this.show();
    (function __fadeIn(e,c,m,cb){
        e.style.opacity=c/m;
        if(c-m)setTimeout(__fadeIn,50,e,c+1,m,cb);
        else {
            e.currentlyPlayingAnimations--;
            cb();
        }
    })(this,0,over,cb||noop);
    return this;
};
Element.prototype.fadeOut=function(over,cb){
    this.currentlyPlayingAnimations++;
    over=(over/50)|0||20;
    (function __fadeOut(e,c,m,cb){
        e.style.opacity=1-c/m;
        if(c-m)setTimeout(__fadeOut,50,e,c+1,m,cb);
        else {
            e.currentlyPlayingAnimations--;
            cb();
        }
    })(this,0,over,cb||noop);
    return this;
};
Element.prototype.scrollVertToElement=function(e){
    var o=0;
    while(this!=e){
        o+=e.offsetTop;
        e=e.parentElement;
        if(e==html) throw RangeError('Unable to scroll to element that is not decendant of scroller.');
    }
    return this.scrollVertTo(o);
};
/*Element.prototype.scrollVertToOver(to,over,cb){
    this.currentlyPlayingAnimations++;
    over=(over/50)|0||20;
    (function __SV2O(e,c,o,f,t,cb){
        this.scroll
    }
};*/

function AJAX(m,u,d,f){
    var r=new XMLHttpRequest();
    r.open(m,u,true);
    r.onreadystatechange=function(){
        if(r.readyState==4) f(r);
    };
    r.send(d);
}
PLUS.AJAX = AJAX;

function Position(x,y){
    this.x=x||0;
    this.y=y||0;
    this.distanceFrom=function(that){
        return Math.sqrt((this.x-that.x)*(this.x-that.x)+(this.y-that.y)*(this.y-that.y));
    };
}
PLUS.Position = Position;

function createElement(t,a,h,c){
    var e=document.createElement(t);
    Object.keys(a||{}).forEach(function(i){
        e.setAttribute(i,a[i]);
    });
    e.innerHTML=h||'';
    if(c)c.forEach(function(h){
        e.addEventListener(h[0], h[1]);
    });
    return e;
}
PLUS.createElement = createElement;

function ImportJS(s,cb){
    var e = createElement('SCRIPT',{type:'text/javascript',src:s});
    if(cb)e.addEventListener('load',cb);
    document.head.appendChild(e);
}
PLUS.ImportJS = ImportJS;

function ImportCSS(s){
    var e = createElement('LINK',{type:'text/css',rel:'stylesheet',href:s});
    document.head.appendChild(e);
}
PLUS.ImportCSS = ImportCSS;
