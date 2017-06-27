window.swoop={cfg:{
    editBodyStyle: true,
    attrPrefix: 'swoop-'
},
mod:function(a, b){
    return a - b*Math.floor(a/b);
},
onFrame:function(cb){
    swoop.frameCallbacks.push(cb);
},
frameCallbacks:[],
parseSwoop:function(s,e,d) {
    
    var nbr = Number(s);
    if (!isNaN(nbr)) return nbr;
    
    var pps = ''
    while (s.length) {
        if (s.charAt(0) == '$') {
            s = s.substr(1);
            var c = '';
            while (0 > (' ;%'.indexOf(s.charAt(0)))) {
                c += s.charAt(0);
                s = s.substr(1);
            }
            try { pps += eval(c); } catch (e) { window.console && console.error(e); }
        }
        pps += s.charAt(0);
        s = s.substr(1);
    }
    pps += ' ';
    var tks = [];
    var letters = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM', numbers = '1234567890.';
    while (pps.length) {
        if (0 <= (' \t\r\n'.indexOf(pps.charAt(0)))) {
            pps = pps.substr(1);
            continue;
        }
        
        if (0 <= ('%+-*/()'.indexOf(pps.charAt(0)))) {
            tks.push({t: pps.charAt(0)});
            pps = pps.substr(1);
            continue;
        }
        
        if (0 <= (letters.indexOf(pps.charAt(0)))) {
            var S = ''
            while (0 <= (letters.indexOf(pps.charAt(0)))) {
                S += pps.charAt(0);
                pps = pps.substr(1);
            }
            if      (S == 'em') tks.push({t: S});
            else if (S == 'px') tks.push({t: S});
            else if (S == 'pt') tks.push({t: S});
            else if (S == 'vw') tks.push({t: S});
            else if (S == 'vh') tks.push({t: S});
            else if (S == 'vmin') tks.push({t: S});
            else if (S == 'vmax') tks.push({t: S});
            else if (S == 'mod') tks.push({t: S});
            else if (S == 'flow') tks.push({t: S});
            else tks.push({t: 'id', d: S});
            continue;
        }
        
        if (0 <= (numbers.indexOf(pps.charAt(0)))) {
            var S = '';
            while (0 <= (numbers.indexOf(pps.charAt(0)))) {
                S += pps.charAt(0);
                pps = pps.substr(1);
            }
            tks.push({t: 'nbr', d: Number(S)});
            continue;
        }
        
        throw new Error('Uexpected character '+pps.charAt(0));
    }
    tks.push({t: 'eof'});
    
    var next = function() {
        var tk = tks[0];
        tks.splice(0, 1);
        return tk;
    };
    
    var accept = function() {
        for (var i = 0; i < arguments.length; i++) {
            if (tks[0].t == arguments[i]) return tks[0];
        }
    };
    
    var expect = function() {
        for (var i = 0; i < arguments.length; i++) {
            if (tks[0].t == arguments[i]) return next();
        }
        throw new Error('Unexpected token '+tks[0].t+', expected '+arguments[0]);
    };
    
    var accpect = function(t) {
        if (accept(t)) return next();
    };
    
    var parseLit = function() {
        if (accpect('(')) {
            var x = parseBase();
            expect(')');
            return x;
        }
        
        if (accept('nbr')) return next().d;
        
        if (accpect('flow') && d == 'y') {
            if (e.childNodes.length > 0) {
                var lc, lci = e.childNodes.length;
                do {
                    if (lci-- == 0) return 0;
                    lc = e.childNodes[lci];
                } while (lc.nodeType == Node.TEXT_NODE && lc.data.trim().length == 0);
                if (lc.nodeType == Node.TEXT_NODE) {
                    var r = document.createRange();
                    r.selectNodeContents(lc);
                    return r.getBoundingClientRect().bottom - e.getBoundingClientRect().top + scrollY;
                } else return lc.offsetTop + lc.offsetHeight;
            } else return 0
        }
        
        expect('expression');
    }
    
    var parseMMD = function() {
        var c = parseLit();
        while (accept('*', '/', 'mod')) {
            var op = next().t;
            if (op == '*') c = c * parseLit();
            if (op == '/') c = c / parseLit();
            if (op == 'mod') c = swoop.mod(c, parseLit());
        }
        return c;
    }
    
    var parseUnit = function() {
        var v = parseMMD();
        if (accpect('px')) return v;
        if (accpect('%'))  return v * e.parentNode['offset' + (d == 'x' ? 'Width' : 'Height')] / 100;
        return v;
    }
    
    var parseAS = function() {
        var c = parseUnit();
        while (accept('+', '-')) {
            var op = next().t;
            if (op == '+') c = c + parseUnit();
            if (op == '-') c = c - parseUnit();
        }
        return c;
    }
    
    var parseBase = parseAS;
    
    var res = parseBase();
    
    expect('eof');
    
    return res;
}};
(window.addEventListener || attachEvent)(window.addEventListener?'load':'onload',function(){
    var W = window, D = document;
    if (swoop.cfg.editBodyStyle) {
        var hs = D.getElementsByTagName('html')[0].style, bs = D.body.style;
        hs.width = hs.height = bs.width = bs.height = '100%';
        hs.margin = bs.margin = '0';
    }
    var sSty = function(e, s, v) {
        if (e.style[s] != v) e.style[s] = v;
    };
    var rfr = function(f) {
        (W.requestAnimationFrame||W.mozRequestAnimationFrame||W.webkitRequestAnimationFrame||function(c){setTimeout(c,16);})(f);
    };
    var fr = function() {
        rfr(fr);
        swoop.frameCallbacks.forEach(rfr);
        window.ea = D.querySelectorAll('box, swoop, .swoop');
        for (var i = 0; i < ea.length; i++) {
            var e = ea[i], a;
            if (!e.getAttribute('swoop-init-complete')) {
                e.style.position = 'absolute';
                e.setAttribute('swoop-init-complete', 'yes');
            }
            
            a = e.getAttribute(swoop.cfg.attrPrefix+'opacity')
            if (a) {
                var res = swoop.parseSwoop(a, e);
                if (res != e.style.opacity) e.style.opacity = res;
            }
            
            var x, y, s;
            x = e.getAttribute(swoop.cfg.attrPrefix+'left');
            y = e.getAttribute(swoop.cfg.attrPrefix+'right');
            s = e.getAttribute(swoop.cfg.attrPrefix+'width');
            if (x && y && !s) {
                var l = swoop.parseSwoop(x, e, 'x');
                var r = swoop.parseSwoop(y, e, 'x');
                sSty(e, 'left', l + 'px');
                sSty(e, 'width', (e.parentNode.offsetWidth - r - l) + 'px');
            }
            if (x && !y && s) {
                var l = swoop.parseSwoop(x, e, 'x');
                var w = swoop.parseSwoop(s, e, 'x');
                sSty(e, 'left', l + 'px');
                sSty(e, 'width', w + 'px');
            }
            if (!x && y && s) {
                var r = swoop.parseSwoop(y, e, 'x');
                var w = swoop.parseSwoop(s, e, 'x');
                sSty(e, 'left', (e.parentNode.offsetWidth - r - w) + 'px');
                sSty(e, 'width', w + 'px');
            }
            
            x = e.getAttribute(swoop.cfg.attrPrefix+'top');
            y = e.getAttribute(swoop.cfg.attrPrefix+'bottom');
            s = e.getAttribute(swoop.cfg.attrPrefix+'height');
            if (x && y && !s) {
                var t = swoop.parseSwoop(x, e, 'y');
                var b = swoop.parseSwoop(y, e, 'y');
                sSty(e, 'top', t + 'px');
                sSty(e, 'height', (e.parentNode.offsetHeight - b - t) + 'px');
            }
            if (x && !y && s) {
                var t = swoop.parseSwoop(x, e, 'y');
                var h = swoop.parseSwoop(s, e, 'y');
                sSty(e, 'top', t + 'px');
                sSty(e, 'height', h + 'px');
            }
            if (!x && y && s) {
                var b = swoop.parseSwoop(y, e, 'y');
                var h = swoop.parseSwoop(s, e, 'y');
                sSty(e, 'top', (e.parentNode.offsetHeight - b - h) + 'px');
                sSty(e, 'height', h + 'px');
            }
        }
    };
    fr();
});
