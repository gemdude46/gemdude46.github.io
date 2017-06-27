window.JSVM={
Instance: function(code){
    this.GMEM = [];
    this.code = code;
    this.pile=[new window.JSVM.Layer(0,[])];
    this.running = false;
    this.speed = 64;
    this.start = function(){ this.running = true ; };
    this.pause = function(){ this.running = false; };
    this.clayer = function(){ return this.pile[this.pile.length-1]; };
    this.ic = 0
    this.perms = {
        alert: true,
        JS: true
    };
    this.next = function(){
        var step = 0;
        while (this.ic < this.code.length && step < this.speed) {step++;
            var I = String.charCodeAt(this.code,this.ic);
            var P = String.charCodeAt(this.code,this.ic+1), Q = String.charCodeAt(this.code,this.ic+2);
            switch (I) {
                case 1:
                    this.clayer().stack.push(1);
                break;
                case 2:
                    var tmp = this.clayer().stack.pop();
                    var tmp2= this.clayer().stack.pop();
                    this.clayer().stack.push(tmp);
                    this.clayer().stack.push(tmp2);
                break;
                case 3:
                    var tmp = this.clayer().stack.pop();
                    this.clayer().stack.push(tmp);
                    this.clayer().stack.push(tmp);
                break;
                case 4:
                    this.clayer().stack.push(P*256+Q);
                    this.ic+=2;
                break;
                case 5:
                    var s = "";
                    this.ic++;
                    while(this.code.charAt(this.ic)!=String.fromCharCode(0)){
                        s+=this.code.charAt(this.ic);
                        this.ic++;
                    }
                    this.clayer().stack.push(s);
                break;
                case 10:
                    this.clayer().stack.push(this.clayer().stack.pop()+this.clayer().stack.pop());
                break;
                case 11:
                    this.clayer().stack.push(this.clayer().stack.pop()-this.clayer().stack.pop());
                break;
                case 12:
                    this.clayer().stack.push(this.clayer().stack.pop()*this.clayer().stack.pop());
                break;
                case 13:
                    this.clayer().stack.push(this.clayer().stack.pop()/this.clayer().stack.pop());
                break;
                case 14:
                    this.clayer().stack.push(this.clayer().stack.pop()%this.clayer().stack.pop());
                break;
                case 20:
                    this.clayer().stack.push(this.clayer().stack.pop()&this.clayer().stack.pop());
                break;
                case 21:
                    this.clayer().stack.push(this.clayer().stack.pop()|this.clayer().stack.pop());
                break;
                case 22:
                    this.clayer().stack.push(this.clayer().stack.pop()^this.clayer().stack.pop());
                break;
                case 23:
                    this.clayer().stack.push(this.clayer().stack.pop()>this.clayer().stack.pop());
                break;
                case 24:
                    this.clayer().stack.push(this.clayer().stack.pop()<this.clayer().stack.pop());
                break;
                case 25:
                    this.clayer().stack.push(this.clayer().stack.pop()==this.clayer().stack.pop());
                break;
                case 26:
                    this.clayer().stack.push(this.clayer().stack.pop()===this.clayer().stack.pop());
                break;
                case 100:
                    this.jumpTo(String.fromCharCode(P)+String.fromCharCode(Q));
                break;
                case 101:
                    if(this.clayer().stack.pop()) this.jumpTo(String.fromCharCode(P)+String.fromCharCode(Q));
                    else this.ic+=2;
                break;
                case 127:
                    this.ic+=2;
                break;
                case 201:
                    this.GMEM[P*256+Q] = this.clayer().stack.pop()
                    this.ic+=2;
                break;
                case 202:
                    this.clayer().LMEM[P*256+Q] = this.clayer().stack.pop()
                    this.ic+=2;
                break;
                case 203:
                    this.GMEM[this.clayer().stack.pop()] = this.clayer().stack.pop()
                break;
                case 204:
                    this.clayer().LMEM[this.clayer().stack.pop()] = this.clayer().stack.pop()
                break;
                case 211:
                    this.clayer().stack.push(this.GMEM[P*256+Q])
                    this.ic+=2;
                break;
                case 212:
                    this.clayer().stack.push(this.clayer().LMEM[P*256+Q])
                    this.ic+=2;
                break;
                case 213:
                    this.clayer().stack.push(this.GMEM[this.clayer().stack.pop()])
                break;
                case 214:
                    this.clayer().stack.push(this.clayer().LMEM[this.clayer().stack.pop()])
                break;
                case 222:
                    if (this.perms.JS) this.clayer().stack.push(eval(this.clayer().stack.pop()));
                    else this.clayer().stack.push(null);
                case 255:
                    this.ic++;
                    var out = this.clayer().stack.pop();
                    if (P == 0) console.log(out);
                    if (P == 1) console.warn(out);
                    if (P == 2) console.error(out);
                    if (P == 5 && this.perms.alert) alert(out);
                break;
                default:
            }
            this.ic++;
        }
    };
    this.jumpTo = function(addr){
        this.ic = 0;
        while(this.code[this.ic-1]!=String.fromCharCode(127)||this.code[this.ic]+this.code[this.ic+1]!=addr) {
            this.ic++;
            if (this.ic > this.code.length) break;
        }
        this.ic++;
    };
    window.JSVM.Instances.push(this);
},
InstanceFromHexString: function(hex){
    var bin = "";
    var i = 0;
    while (i<hex.length){
        bin += String.fromCharCode(parseInt(String.charAt(hex,i)+String.charAt(hex,i+1),16));
        i+=2;
    }
    return new window.JSVM.Instance(bin);
},
Layer: function(ret, args){
    this.ret = ret;
    this.args = args;
    this.stack = [];
    this.LMEM = [];
},
GMEM: [],
Instances: [],
};

setInterval(function(){
    var i = 0;
    while(i<window.JSVM.Instances.length){
        if(window.JSVM.Instances[i].running) window.JSVM.Instances[i].next();
        i++;
    }
},8);
