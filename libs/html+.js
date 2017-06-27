/*
 * HTML+ is licensed wi- BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH
 * BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BL
 * AH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH
 * BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BL
 * AH BLAH BLAH BLAH BLAH BLAH tl;dr Just don't claim it's yours.
 */

function _FEEOT(t,f){Array.from(document.querySelectorAll(t)).forEach(f);}
function _ESC(t){
    var s='';
    while(t){
        s+=t[0]=='>'?'&gt;':(t[0]=='<'?'&lt;':(t[0]=='&'?'&amp;':(t[0]=='\n'?'<br>':t[0])));
        t=t.substr(1);
    }
    return s;
}

var isBrowser = {};

isBrowser.Opera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
isBrowser.Firefox = typeof InstallTrigger !== 'undefined';
isBrowser.Safari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
isBrowser.IE = /*@cc_on!@*/false || !!document.documentMode;
isBrowser.Edge = !isBrowser.IE && !!window.StyleMedia;
isBrowser.Chrome = !!window.chrome && !!window.chrome.webstore;

setInterval(function(){
    _FEEOT('HELL',function(e){
        if(!e.getAttribute('__init__d')){
            e.style['font-family']='"Comic Sans MS"';
            e.style['font-size']='72pt';
            setInterval(function(h){
                if(h.style.visibility=='hidden'){
                    h.style.visibility='visible';
                    switch(h.style.color){
                        case('red'):
                            h.style.color='orange';
                        break;
                        case('orange'):
                            h.style.color='yellow';
                        break;
                        case('yellow'):
                            h.style.color='green';
                        break;
                        case('green'):
                            h.style.color='blue';
                        break;
                        case('blue'):
                            h.style.color='indigo';
                        break;
                        case('indigo'):
                            h.style.color='violet';
                        break;
                        default:
                            h.style.color='red';
                    }
                }else h.style.visibility='hidden';
            },128+((Math.random()*12-6)|0),e);
            e.setAttribute('__init__d','y');
        }
    });
    _FEEOT('LIVEJS',function(e){
        if(!e.getAttribute('__init__d')){
            setInterval(function(l){
                if(e.getAttribute('escape')==='') e.innerHTML = _ESC(''+eval(e.getAttribute('js')));
                else e.innerHTML = eval(e.getAttribute('js'));
            },128,e);
            e.setAttribute('js',e.innerHTML);
            e.setAttribute('__init__d','y');
        }
    });
    _FEEOT('CONT',function(e){
        if(!e.getAttribute('__init__d')){
            e.style.display='none';
            e.setAttribute('__init__d','y');
        }
    });
    _FEEOT('BROWSER',function(e){
        if(!e.getAttribute('__init__d')){
            var f = true;
            if (isBrowser.Chrome && e.getAttribute('chrome') === '') f = false;
            if (isBrowser.Firefox && e.getAttribute('firefox') === '') f = false;
            if (isBrowser.IE && e.getAttribute('ie') === '') f = false;
            if (isBrowser.Edge && e.getAttribute('edge') === '') f = false;
            if (isBrowser.Safari && e.getAttribute('safari') === '') f = false;
            if (isBrowser.Opera && e.getAttribute('opera') === '') f = false;
            if (e.getAttribute('not') === '') f = !f;
            if (f) e.style.display='none';
            e.setAttribute('__init__d','y');
        }
    });
    _FEEOT('*',function(e){
        if(e.getAttribute('alignx')) {
            var xa = e.getAttribute('alignx');
            if (xa=='center') e.style['margin-left'] = (0|(e.parentNode.offsetWidth/2 - e.offsetWidth/2)) + 'px';
        }
    });
},64);

