window.maf = new function(){
    this.update = function(el){
        el = el || document;
        
        var els = el.tagName == 'MAF' ? [el] : Array.from(el.querySelectorAll('MAF'));
        
        els.forEach(function(e){
            if (e.getAttribute('maf-cont') == e.textContent) return;
            
            var src = e.textContent, i = 0, tks = [];
            
            while (i < src.length) {
                let c = src.charAt(i);
                
                if (/\s/.test(c)) {
                    i++;
                    continue;
                }
                
                if (c == '(') {
                    tks.push({t: 'open', d: c});
                    i++;
                    continue;
                }
                
                if (c == ')') {
                    tks.push({t: 'close', d: c});
                    i++;
                    continue;
                }
                
                if (c == '&') {
                    tks.push({t: '&'});
                    i++;
                    continue;
                }
                
                if (c == ';') {
                    tks.push({t: ';'});
                    i++;
                    continue;
                }
                
                if (c == '/') {
                    tks.push({t: '/'});
                    i++;
                    continue;
                }
                
                if (/U\+[1234567890ABCDEF]{4}/.test(src.substr(i, 6))) {
                    tks.push({t: 'txt', d: String.fromCharCode(parseInt(src.substr(i+2,4), 16))});
                    i+=6;
                    continue;
                }
                
                if (/\d/.test(c)) {
                    let s = '';                    
                    while (c == '.' || /\d/.test(c)) {
                        s += c;
                        i++;
                        c = src.charAt(i) || ' ';
                    }
                    tks.push({t: 'txt', d: s});
                    continue;
                }
                
                if ('qwertyuiopasdfghjklzxcvbnnm'.indexOf(c.toLowerCase()) >= 0) {
                    let s = '';
                    while ('qwertyuiopasdfghjklzxcvbnnm'.indexOf(c.toLowerCase()) >= 0) {
                        s += c
                        i++;
                        c = src.charAt(i) || ' ';
                    }
                    if (s == 'pi') tks.push({t: 'txt', d: '\u03C0'});
                    else if (s == 'TF' || s == 'therefore') tks.push({t: 'txt', d: '\u2234'});
                    else if (s == 'theta') tks.push({t: 'txt', d: '\u03F4'});
                    else if (s == 'infinity') tks.push({t: 'txt', d: '\u221E'});
                    else if (s == 'in') tks.push({t: 'txt', d: '\u2208'});
                    else tks.push({t: 'txt', d: s});
                    continue;
                }
                
                let symbol_pairs = [
                    ['<->',     '\u2194'],
                    ['<-->',    '\u27F7'],
                    ['<=>',     '\u21D4'],
                    ['<==>',    '\u27FA'],
                    ['||C',     '\u2102'],
                    ['||H',     '\u210D'],
                    ['||N',     '\u2115'],
                    ['||P',     '\u2119'],
                    ['||Q',     '\u211A'],
                    ['||R',     '\u211D'],
                    ['||Z',     '\u2124'],
                    ['||pi',    '\u213C'],
                ], symbol_found = false;
                for (let symbol_i = 0; symbol_i < symbol_pairs.length; symbol_i++) {
                    let symbol = symbol_pairs[symbol_i];
                    if (src.substr(i, symbol[0].length) == symbol[0]) {
                        i += symbol[0].length;
                        tks.push({t: 'txt', d: symbol[1]});
                        symbol_found = true;
                        break;
                    }
                }
                if (symbol_found) continue;
                
                tks.push({t: 'txt', d: c});
                i++;
            }
            
            tks.push({t: 'EOF'});
            
            var accept = function(){
                return Array.from(arguments).indexOf(tks[0].t) == -1 ? false : tks[0];
            };
            
            var next = function(){
                return tks.splice(0,1)[0];
            };
            
            var parseTxt = function(){
                return accept('txt') ? new maf.TextSurface(next().d) : new maf.TextSurface(next().t);
            };
            
            var parseTerm = function(subfrac){
                
                if (accept('open')) {
                    let lb = next().d;
                    let sf = parseMaf();
                    
                    while (accept(';')) {
                        next();
                        sf = new maf.VJoinSurface(sf, parseMaf());
                    }
                    
                    let rb = accept('close') ? next().d : ' ';
                    
                    let lbs, rbs;
                    
                    if (lb == '(') {
                        lbs = new maf.CircleSurface([sf.height/4, sf.height], [0.625 * sf.height + 1, sf.height/2], 0.625 * sf.height, 3);
                    } else lbs = new maf.TextSurface(lb);
                    
                    if (rb == ')') {
                        rbs = new maf.CircleSurface([sf.height/4, sf.height], [-0.625 * sf.height + sf.height/4 - 1, sf.height/2], 0.625 * sf.height, 3);
                    } else rbs = new maf.TextSurface(rb);
                    
                    return new maf.JoinSurface(lbs, new maf.JoinSurface(sf, rbs));
                }
                
                if (accept('close')) {
                    return new maf.TextSurface(next().d);
                }
                
                return parseTxt();
            }
            
            var parseFrac = function(){
                var nextP = parseTerm;
                
                var top = nextP();
                
                if (accept('/')) {
                    top = maf.unparenthesize(top);
                    
                    next();
                    let bot = maf.unparenthesize(parseFrac());
                    return new maf.PaddedSurface(
                        new maf.VJoinSurface(
                            top,
                            new maf.VJoinSurface(
                                new maf.BlockSurface(4+Math.max(top.width, bot.width), 2),
                                bot
                            )
                        ),
                    3, 0);
                } else return top;
            }
            
            var parseMaf = function(){
                var nextP = parseFrac;
                
                var endings = ['EOF', ';', 'close'];
                if (accept.apply(this, endings)) return new maf.TextSurface(' ');
                
                var sf = nextP();
                while (!accept.apply(this, endings)) {
                    sf = new maf.JoinSurface(sf, nextP());
                }
                
                return sf;
            };
            
            var sf = parseMaf();
            
            e.style.display = 'inline-block';
            e.style.width = (sf.width + 8) + 'px';
            e.style.height = (sf.height + 8) + 'px';
            e.style['background-image'] = 'url("' + maf.render(sf) + '")';
            e.style.color = 'rgba(0,0,0,0)';
            e.style['font-size'] = '0';
            
            e.setAttribute('maf-cont', e.textContent);
        });
    };
    this.TextSurface = function(txt){
        this.width = maf.txtWidth(txt) + 4;
        this.height = 16;
        
        this.render = function(c, o){
            c.textAlign = 'left';
            c.fillText(txt, o[0]+2, o[1]+14);
        };
    };
    this.JoinSurface = function(a, b){
        this.width = a.width + b.width;
        this.height = Math.max(a.height, b.height);
        
        this.a = a;
        this.b = b;
        
        this.render = function(c, o){
            a.render(c, [o[0], o[1] + (this.height/2 - a.height/2)]);
            b.render(c, [a.width + o[0], o[1] + (this.height/2 - b.height/2)]);
        };
    };
    this.VJoinSurface = function(a, b){
        this.width = Math.max(a.width, b.width);
        this.height = a.height + b.height;
        
        this.render = function(c, o){
            a.render(c, [o[0] + (this.width/2 - a.width/2), o[1]]);
            b.render(c, [o[0] + (this.width/2 - b.width/2), o[1] + a.height]);
        };
    };
    this.PaddedSurface = function(sf, ph, pv){
        this.width = ph * 2 + sf.width;
        this.height = pv * 2 + sf.height;
        
        this.render = function(c, o){
            sf.render(c, [o[0]+ph, o[1]+pv]);
        };
    };
    this.BlockSurface = function(w, h){
        this.width = w;
        this.height = h;
        
        this.render = function(c, o){
            c.rect(o[0], o[1], w, h);
            c.fill();
        };
    };
    this.CircleSurface = function(vp, pos, rad, wid){
        this.width = vp[0];
        this.height = vp[1];
        
        this.render = function(c, o){
            var ce = document.createElement('CANVAS');
            ce.width = this.width;
            ce.height = this.height;
            var ctx = ce.getContext('2d');
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], rad, 0, 7);
            ctx.stroke();
            c.drawImage(ce, o[0], o[1]);
        };
    };
    this.unparenthesize = function(sf) {
        return (sf instanceof maf.JoinSurface
                && sf.a instanceof maf.CircleSurface
                && sf.b instanceof maf.JoinSurface
                && sf.b.b instanceof maf.CircleSurface) ? sf.b.a : sf;
    };
    this.font = '16px cambria math, cambria, computer modern, times new roman';
    this.render = function(sf){
        var c = document.createElement('CANVAS');
        c.width = sf.width + 8;
        c.height = sf.height + 8;
        var ctx = c.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.font = maf.font;
        sf.render(ctx, [4,4]);
        return c.toDataURL();
    };
    this.txtWidth = function(txt){
        var ctx = document.createElement('CANVAS').getContext('2d');
        ctx.font = maf.font;
        return ctx.measureText(txt).width;
    };
}();

maf.intervalID = setInterval(_=>maf.update(), 1000);
