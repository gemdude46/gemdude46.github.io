function addEventListenerTo(e,t,f){
    if (e.addEventListener) e.addEventListener(t,f);
    else e.attachEvent("on"+t,f);
}

window.downListeners = [];
window.upListeners = [];

addEventListenerTo(document,'mousemove',function(e){
    Mouse.x=Mouse[0]=e.clientX;
    Mouse.y=Mouse[1]=e.clientY;
    Mouse.sx=e.screenX;
    Mouse.sy=e.screenY;
});

addEventListenerTo(document,'keydown',function(e){
    if (!Keyboard[e.keyCode]) {
        Keyboard[e.keyCode]=true;
        downListeners.forEach(function(l){
            if (e.keyCode==nameToCode(l[0])) {
                if (Date.now() - l[3] < l[2]) return;
                l[3] = Date.now();
                try {l[1](e);}
                catch (x) {}
            }
        });
    }
});

addEventListenerTo(document,'keyup',function(e){
    Keyboard[e.keyCode]=false;
});

addEventListenerTo(document,'mousedown',function(e){
    Mouse[e.button==2?'rmbdown':'down']=true;
});

addEventListenerTo(document,'mouseup',function(e){
    Mouse[e.button==2?'rmbdown':'down']=false;
});

window.Mouse = {x:0, y:0, 0:0, 1:0, sx:0, sy:0, down:false, rmbdown:false};
window.Keyboard = {};

window.Keymap = {
    'UP': 38,
    'DOWN': 40,
    'LEFT': 37,
    'RIGHT': 39,
    'SPACE': 32,
    ' ': 32,
    'ESC': 27,
    'ESCAPE': 27,
    'F1': 112, 'F2': 113, 'F3': 114,
    'F4': 115, 'F5': 116, 'F6': 117,
    'F7': 118, 'F8': 119, 'F9': 120,
    'F10':121, 'F11':122, 'F12':123,
    'HOME': 36,
    'END': 35,
    'INS': 45,
    'INSERT': 45,
    'DEL': 46,
    'DELETE': 46,
    'BACKSPACE': 8,
    'TAB': 9,
    '\t': 9,
    'LBRACKET': 219,
    'RBRACKET': 221,
    'ENTER': 13,
    '\n': 13,
    'CAPS': 20,
    'CAPSLOCK': 20,
    'CAPS LOCK': 20,
    "'": 222,
    'QUOTE': 222,
    'BACKSLASH': 220,
    '\\': 220,
    'SHIFT': 16,
    'CTRL': 17,
    'CONTROL': 17,
    'ALT': 18
};

function nameToCode(k) {
    return (typeof k)=='string'?((k.length==1&&"'\\ \t\n".indexOf(k)==-1)?k.toUpperCase().charCodeAt(0):Keymap[k.toUpperCase()]):k;
}

function isDown(k) {
    return Keyboard[nameToCode(k)];
}

function onKeyDown(k, f, c) {
    downListeners.push([k, f, c||0, -999999999]);
}
