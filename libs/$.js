$STD_LIBS = {
    alert:          'def alert(i)JS("alert($current.getMem(\'$i\'))")def prompt(i)return JS("prompt($current.getMem(\'$i\'))")'+
                    'def confirm(i)return JS("confirm($current.getMem(\'$i\'))");',
    jsfunctions:    'def callFunction(f,t)return JS("$current.getMem(\'$f\').apply($current.getMem(\'$t\'),'+
                    '$current.getMem(\'$args\').slice(2))");',
    dom:            'root=JS("document.querySelector(\'html\')")document=JS("document")window=JS("window")body=document["body"]'+
                    'head=document["head"]def getElementById(i)return JS("document.getElementById($current.getMem(\'$i\'))")'+
                    'def getElementsByTagName(i)return JS("Array.from(document.getElementsByTagName($current.getMem(\'$i\')))")'+
                    'def querySelector(i)return JS("document.querySelector($current.getMem(\'$i\'))")'+
                    'def querySelectorAll(i)return JS("Array.from(document.querySelectorAll($current.getMem(\'$i\')))");',
    time:           'def sleep(s,ds){ds=now while now-ds<1000*s yield};',
    ajax:           'def AJAX(m,u,d,R){JS("var r=new XMLHttpRequest(),c=$current;r.open(c.getMem(\'$m\'),c.getMem(\'$u\'),true);'+
                    'r.onreadystatechange=function(){if(r.readyState==4)c.setMem(\'$R\',{text:r.responseText,code:r.status})};'+
                    'r.send(c.getMem(\'$d\'))")while 1 if R return R}def GET(u)return AJAX("GET",u)def POST(u,d)return AJAX("POST",u,d);',
    uri:            'def encodeURI(u)return JS("encodeURI($current.getMem(\'$u\'))")def decodeURI(u)return JS("decodeURI('+
                    '$current.getMem(\'$u\'))")def encodeURIComponent(u)return JS("encodeURIComponent($current.getMem(\'$u\'))")',
    json:           'def JSONify(o)return JS("JSON.stringify($current.getMem(\'$o\'))")def deJSONify(o)return JS("JSON.parse('+
                    '$current.getMem(\'$o\'))");',
    storage:        'localStorage=JS("localStorage")sessionStorage=JS("sessionStorage")',
    me:             'me=JS("$current")',
    constants:      'pi=JS("Math.PI")e=JS("Math.E")sqrt2=JS("Math.SQRT2")',
    'random':       'def random(i){if args.length==0 return JS("Math.random()")if args.length==1 return i*JS("Math.random()")}'+
                    'def randint(i,j)=(0|(random(j-i)))+i if j==undefined return randint(0,i)def randbool()=!randint(2)'
};

var $load_time = Date.now();

function GET_s(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    
    return request.responseText;
}

var $TKI;

var $kwds=['if','for','while','else','return','echo','yield','now','sin','cos','tan','asin','acos','atan'];
function $compile(code, RETURN){
    
    var includes = [];
    
    for (var i=0;i<code.length;i++) {
        if (code.substr(i,8) == '#include') {
            var nc = ''
            var j = i+8, k;
            while (code[j] == ' ' || code[j] == '\n' || code[j] == '\r' || code[j] == '\t') j++;
            if (code[j] == '<') {
                k = j+1;
                while (code[k] != '>') {
                    k++;
                    if (k > code.length) throw '$: Encountered EOF while parsing include statement.';
                }
                var lib = code.substring(j+1, k).trim();
                if (includes.indexOf(lib)==-1) {
                    nc = $STD_LIBS[lib];
                    if (!nc) throw '$: Unable to find library \''+lib+'\'.';
                    includes.push(lib);
                } else nc = '';
            } else if (code[j] == '"' || code[j] == "'") {
                k = j+1;
                while (code[k] != code[j]) {
                    k++;
                    if (k > code.length) throw '$: Encountered EOF while parsing include statement.';
                }
                nc = GET_s(code.substring(j+1, k).trim());
            } else throw '$: Invalid include statement argument starter \''+code[j]+'\'.';
            code = code.substr(0, i) + nc + code.substr(k+1);
            i--;
        }
    }
    if (RETURN == 'PREPROCCESSED') return code;
    
    var tkarr=[];
    (function tokenify(code){
        if(!code.length)return;
        var c=code[0];
        if(c==' '||c=='\n'||c=='\t'||c=='\r')return tokenify(code.substr(1));
        if('0123456789'.indexOf(c)>-1){
            var s='';
            while('0123456789.e'.indexOf(c)>-1){
                s+=c;
                code=code.substr(1);
                c=code[0];
            }try{
                tkarr.push({type:'lit',val:parseFloat(s)});
                return tokenify(code);
            }catch(e){
                throw '$: Invalid numeric literal in script. Aborting!';
            }
        }
        if('qwertyuiopasdfghjklzxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ_$'.indexOf(c)>-1||c.charCodeAt(0)>127){
            var s='';
            while('qwertyuiopasdfghjklzxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ_$1234567890#'.indexOf(c)>-1||c.charCodeAt(0)>127){
                s+=c;
                code=code.substr(1);
                c=code[0];
            }
            if($kwds.indexOf(s)>-1){
                tkarr.push({type:s});
            }else if(['true','false','Infinity','NaN','null'].indexOf(s)>-1) {
                tkarr.push({type:'lit',val:eval(s)});
            }else if(['def','define','func','function'].indexOf(s)>-1){
                tkarr.push({type:'def'});
            }else{
                tkarr.push({type:'id',val:s});
            }return tokenify(code);
        }
        if(c=='"'||c=="'"){
            var q=c,s='';
            code=code.substr(1);
            c=code[0];
            while(c!=q){
                if(c=='\\') {
                    code=code.substr(1);
                    c=code[0];
                    if(c=='n')c='\n';
                    if(c=='t')c='\t';
                    if(c=='r')c='\r';
                }
                s+=c;
                code=code.substr(1);
                c=code[0];
                if(!code) throw '$: Encountered EOF while parsing string literal.';
            }
            tkarr.push({type:'lit',val:s});
            return tokenify(code.substr(1));
        }
        var mcops=['&&','||','===','!==','==','!=','+=','-=','*=','/=','%=','>=','<=','[]','`',
        '++','--','=','+','-','*','/','%','#','.',',',';','(',')','{','}','[',']','<','>','!','&','|'];
        for (var i=0;i<mcops.length;i++) {
            if(code.startsWith(mcops[i])) {
                tkarr.push({type:mcops[i]});
                return tokenify(code.substr(mcops[i].length));
            }
        }
        throw '$: Unexpected character '+c+' in script. Aborting!';
    })(code+' ');
    
    tkarr.push({type:'EOF'});
    
    if (RETURN == 'TOKENS') return tkarr;
    
    var tree = {type:'block'};
    var tki = 0;
    
    function accept(){
        for (var i=0;i<arguments.length;i++){
            if(arguments[i]==tkarr[tki].type) return tkarr[tki];
        }
    }
    
    function expect(){
        tki++;
        for (var i=0;i<arguments.length;i++){
            if(arguments[i]==tkarr[tki-1].type) return tkarr[tki-1];
        }
        $TKI = tki-1;
        throw '$: Unexpected token \''+tkarr[tki-1].type+'\', expected \''+arguments[0]+'\'. Aborting';
    }
    
    function accpect(i) {
        if (accept(i)) return expect(i);
    }
    
    function parseParams() {
        expect('(');
        var p=[];
        while (true) {
            if (accept(')')) break;
            p.push(expect('id').val);
            if (accept(',',')').type==',') expect(',');
        }
        expect(')');
        return p;
    }
    
    function parseArgs() {
        expect('(');
        var a=[];
        while (true) {
            if (accept(')')) break;
            a.push(parseExpr());
            if (accept(',',')').type==',') expect(',');
        }
        expect(')');
        return a;
    }
    
    function parseExpr_F() {
        if (accept('lit')) {
            return {type:'lit',val:expect('lit').val};
        }
        if (accept('[]')) {
            expect('[]');
            return {type:'arrlit',c:[]};
        }
        if (accpect('#')) {
            return {type:'elbyid',xpr:{type:'lit',val:expect('id').val}};
        }
        if (accpect('-')) {
            return {type:'binop',op:'-',lhs:{type:'lit',val:0},rhs:parseExpr_F()};
        }
        if (accpect('(')) {
            var xpr = parseExpr();
            expect(')');
            if (accept('(')) {
                return {type:'jscall',f:xpr,args:parseArgs()};
            }
            return xpr;
        }
        if (accept('id')) {
            var idv = expect('id').val;
            if (accept('(')) return {type:'call',name:idv,args:parseArgs()};
            return {type:'var',name:idv};
        }
        if (accpect('now')) {
            return {type:'now'};
        }
        throw '$: Expression was expected but found \''+tkarr[tki].type+'\'. Aborting';
    }

    function parseExpr_______() {
        var ret = parseExpr_F();
        while(accept('[','.')){
            if (expect('[','.').type=='['){
                var rst = parseExpr();
                expect(']');
                ret = {type:'binop',op:'.',lhs:ret,rhs:rst};
            } else {
                var a = expect('id').val;
                if (accept('(')) {
                    ret = {type:'jscall',f:{type:'binop',op:'.',lhs:ret,rhs:{type:'lit',val:a}},args:parseArgs()};
                } else
                    ret = {type:'binop',op:'.',lhs:ret,rhs:{type:'lit',val:a}};
            }
        }
        return ret;
    }
    
    function parseExpr______() {
        if (accept('sin','cos','tan','asin','acos','atan')) {
            var f = expect('sin','cos','tan','asin','acos','atan').type;
            return {type:'fo',f:f,arg:parseExpr______()};
        }
        return parseExpr_______()
    }
    
    function parseExpr_____() {
        var lhs = parseExpr______();
        if(accept('*','/','%')){
            var optype = expect('*','/','%').type;
            return {type:'binop',op:optype,lhs:lhs,rhs:parseExpr_____()};
        }
        return lhs;
    }
    
    function parseExpr____() {
        var lhs = parseExpr_____();
        if(accept('+','-','&','|')){
            var optype = expect('+','-','&','|').type;
            return {type:'binop',op:optype,lhs:lhs,rhs:parseExpr____()};
        }
        return lhs;
    }
    
    function parseExpr___() {
        var lhs = parseExpr____();
        if(accept('==','>','<','!=','===','!==','<=','>=')){
            var optype = expect('==','>','<','!=','===','!==','<=','>=').type;
            return {type:'binop',op:optype,lhs:lhs,rhs:parseExpr____()};
        }
        return lhs;
    }
    
    function parseExpr__() {
        if(accpect('!')) {
            return {type:'not',val:parseExpr__()};
        }
        return parseExpr___();
    }
    
    function parseExpr_() {
        var lhs = parseExpr__();
        if(accept('||','&&')){
            var optype = expect('||','&&').type;
            return {type:'boolop',op:optype,lhs:lhs,rhs:parseExpr_()};
        }
        return lhs;
    }
    
    function parseExpr() {
        var lhs = parseExpr_();
        if(accept('=','+=','-=','*=','/=','%=')){
            var optype = expect('=','+=','-=','*=','/=','%=').type;
            return {type:'asop',op:optype,lhs:lhs,rhs:parseExpr()};
        }
        if(accept('++','--')){
            var optype = expect('++','--').type[0]+'=';
            return {type:'asop',op:optype,lhs:lhs,rhs:{type:'lit',val:1}};
        }
        return lhs;
    }
    
    function parseStmt(){
        if(accpect('echo')) {
            return {type:'echo',xpr:parseExpr()};
        }
        if(accpect('yield')) {
            return {type:'yield'};
        }
        if(accpect(';')) {
            return {type:'noop'};
        }
        if(accpect('def')) {
            var proc = expect('id').val;
            var params = parseParams();
            var df = accpect('=')?parseExpr():{type:'lit',val:undefined};
            return {type:'def',name:proc,code:parseStmt(),params:params,df:df};
        }
        if(accpect('{')) {
            var b=parseStmts();
            expect('}');
            return {type:'block',content:b};
        }
        if(accept('if','while')) {
            var t=expect('if','while').type;
            var c=parseExpr();
            var s=parseStmt();
            var e;
            if (accpect('else')) {
                e=parseStmt();
            }
            return {type:t,cond:c,stmt:s,els:e};
        }
        if(accpect('for')) {
            var has_pr = accpect('(');
            var init = parseStmt();
            accpect(';');
            var cond = parseExpr();
            accpect(';');
            var ittr = parseStmt();
            if (has_pr) expect(')');
            var stmt = parseStmt();
            return {type:'block',content:[init,{type:'while',cond:cond,stmt:{type:'block',content:[stmt,ittr]}}]};
            
        }
        if(accpect('return')) {
            if(accept(';','}')) return {type:'return'};
            return {type:'return',xpr:parseExpr()};
        }
        if(!accept('EOF','}')) return {type:'discard',xpr:parseExpr()};
    }
    
    function parseStmts(){
        var s, o=[];
        while(s=parseStmt()){
            o.push(s);
        }
        return o;
    };
    
    tree.content = parseStmts();
    
    expect('EOF');
    
    if (RETURN == 'AST') return tree;
    
    var bin = [];
    
    var njid=0;
    function gnjid(){
        return njid++;
    }
    
    function genCode(str) {
        if(str.type=='block') {
            str.content.forEach(genCode);
        }
        if(str.type=='echo') {
            genCode(str.xpr);
            bin.push('echo');
        }
        if(str.type=='lit') {
            bin.push('lit');
            bin.push(str.val);
        }
        if(str.type=='now') bin.push('now');
        if(str.type=='def') {
            var j = gnjid();
            bin.push('ip+9');
            bin.push('smem'); bin.push('f-'+str.name);
            bin.push('lit'); bin.push(str.params);
            bin.push('smem'); bin.push('fp-'+str.name);
            bin.push('jmp'); bin.push('p'+j);
            genCode(str.code);
            genCode(str.df);
            bin.push('return');
            bin.push('#p'+j);
        }
        if(str.type=='return'){
            if(str.xpr)genCode(str.xpr);
            else {
                bin.push('lit');
                bin.push(undefined);
            }
            bin.push('return');
        }
        if(str.type=='binop') {
            genCode(str.rhs);
            genCode(str.lhs);
            bin.push(str.op);
        }
        if(str.type=='boolop') {
            genCode(str.lhs);
            var j=gnjid();
            bin.push('dup');
            if (str.op=='&&') {
                bin.push('skif');
                bin.push('bo'+j);
                bin.push('pop');
                genCode(str.rhs);
            }
            if (str.op=='||') {
                bin.push('!');
                bin.push('skif');
                bin.push('bo'+j);
                bin.push('pop');
                genCode(str.rhs);
            }
            bin.push('#bo'+j);
        }
        if(str.type=='not') {
            genCode(str.val);
            bin.push('!');
        }
        if(str.type=='discard') {
            genCode(str.xpr);
            bin.push('pop');
        }
        if(str.type=='asop') {
            genCode(str.rhs);
            if(str.op=='=') {
                bin.push('dup');
                if(str.lhs.type=='var') {
                    bin.push('smem');
                    bin.push('$'+str.lhs.name);
                } else if(str.lhs.type=='binop'&&str.lhs.op=='.') {
                    genCode(str.lhs.rhs);
                    genCode(str.lhs.lhs);
                    bin.push('soav');
                } else throw '$: Invalid assignment to '+str.lhs.type+'. Aborting!';
            } else {
                if(str.lhs.type=='var') {
                    bin.push('gmem');
                    bin.push('$'+str.lhs.name);
                    bin.push(str.op[0]);
                    bin.push('dup');
                    bin.push('smem');
                    bin.push('$'+str.lhs.name);
                } else throw '$: Invalid assignment to '+str.lhs.type+'. Aborting!';
            }
        }
        if(str.type=='elbyid') {
            genCode(str.xpr);
            bin.push('elbyid');
        }
        if(str.type=='var') {
            bin.push('gmem');
            bin.push('$'+str.name);
        }
        if(str.type=='yield') {
            bin.push('yield');
        }
        if(str.type=='if') {
            genCode(str.cond);
            var j=gnjid(), k=gnjid();
            bin.push('skif');
            bin.push('if'+j);
            genCode(str.stmt);
            if(str.els) {
                bin.push('jmp');
                bin.push('if'+k);
            }
            bin.push('#if'+j);
            if(str.els) {
                genCode(str.els);
                bin.push('#if'+k);
            }
        }
        if(str.type=='while') {
            var j=gnjid(), k=gnjid();
            bin.push('#wh'+k);
            genCode(str.cond);
            bin.push('skif');
            bin.push('wh'+j);
            genCode(str.stmt);
            bin.push('jmp');
            bin.push('wh'+k);
            bin.push('#wh'+j);
        }
        if(str.type=='call') {
            if (str.name=='JS') {
                if (str.args.length!=1) throw '$: Built-in function \'JS\' expected 1 argument, but got '+str.args.length;
                genCode(str.args[0]);
                bin.push('evaljs');
            } else {
                bin.push('lit');
                bin.push('[]');
                bin.push('evaljs');
                str.args.forEach(function(a){
                    genCode(a);
                    bin.push('push');
                });
                bin.push('call');
                bin.push(str.name);
            }
        }
        if(str.type=='jscall') {
            genCode(str.f);
            bin.push('lit');
            bin.push('[]');
            bin.push('evaljs');
            str.args.forEach(function(a){
                genCode(a);
                bin.push('push');
            });
            bin.push('cjsf');
        }
        if(str.type=='arrlit') {
            bin.push('lit')
            bin.push('[]');
            bin.push('evaljs');
            str.c.forEach(function(a){
                genCode(a);
                bin.push('push');
            });
        }
        if(str.type=='fo') {
            genCode(str.arg);
            if(Math[str.f]) {
                bin.push('math');
                bin.push(str.f);
            }
        }
    }
    
    genCode(tree);
    
    return bin;
}

var $_THREADARR = [];
var $GLOBALS = {};

window.$DEFAULT_NICE = 256;

function $thread(code,nice){
    this.bin=$compile(code);
    this.nice=nice||$DEFAULT_NICE;
    this.running=false;
    this.ip=0;
    this.memstack=[{$GLOBALS:$GLOBALS}];
    this.stack=[];
    this.stdout=function(s){console.log(s);};
    this.run=function(){this.running=true;};
    this.pause=function(){this.running=false;};
    this.next=function(){
        try {
            function j2(self,jid){
                for(var i=0;i<self.bin.length;i++)if(self.bin[i]=='#'+jid)return self.ip=i;
                console.error('$: #'+jid+' was not found in binary. Ignoring.');
            }
            for(var itr8 = this.nice; itr8 != 0; itr8--){
                var op = this.bin[this.ip];
                if(!op) return;
                while(this.bin[this.ip]&&this.bin[this.ip][0]=='#')this.ip++;
                if (op=='lit') {
                    this.stack.push(this.bin[this.ip+1]);
                    this.ip+=2;
                    continue;
                }
                if (op=='now') {
                    this.stack.push(window.performance?performance.now():(Date.now()-$load_time));
                    this.ip++;
                    continue;
                }
                if (op=='echo') {
                    this.stdout(this.stack.pop()+'');
                    this.ip++;
                    continue;
                }
                if (op=='yield') {
                    this.ip++;
                    return;
                }
                if (op=='skif') {
                    if(!this.stack.pop())j2(this,this.bin[this.ip+1]);
                    else this.ip+=2;
                    continue;
                }
                if (op=='jmp') {
                    j2(this,this.bin[this.ip+1]);
                    continue;
                }
                if (op=='elbyid') {
                    this.stack.push(document.getElementById(this.stack.pop()));
                    this.ip++;
                    continue;
                }
                if (op=='evaljs') {
                    this.stack.push(eval(this.stack.pop()));
                    this.ip++;
                    continue;
                }
                if (op=='smem') {
                    this.setMem(this.bin[this.ip+1],this.stack.pop());
                    this.ip+=2;
                    continue;
                }
                if (op=='gmem') {
                    this.stack.push(this.getMem(this.bin[this.ip+1]));
                    this.ip+=2;
                    continue;
                }
                if (op=='soav') {
                    var o = this.stack.pop();
                    var a = this.stack.pop();
                    var v = this.stack.pop();
                    o[a]=v;
                    this.stack.push(v);
                    this.ip++;
                    continue;
                }
                if (op=='dup') {
                    var v=this.stack.pop();
                    this.stack.push(v);
                    this.stack.push(v);
                    this.ip++;
                    continue;
                }
                if (op=='push') {
                    var o=this.stack.pop();
                    var a=this.stack.pop();
                    a.push(o);
                    this.stack.push(a);
                    this.ip++;
                    continue;
                }
                if (op=='call') {
                    this.memstack[this.memstack.length-1]['ip'] = this.ip+2;
                    var proc = this.bin[this.ip+1];
                    var nm = {$args:this.stack.pop()};
                    this.getMem('fp-'+proc).forEach(function(x,i){
                        nm['$'+x]=nm.$args[i];
                    });
                    this.memstack.push(nm);
                    this.ip=this.getMem('f-'+proc);
                    if(!this.ip) console.error('$: Function \''+proc+'\' is not defined. Ignoring.');
                    continue;
                }
                if (op=='ip+9') {
                    this.stack.push(this.ip+9);
                    this.ip++;
                    continue;
                }
                if (op=='return') {
                    this.memstack.pop();
                    this.ip=this.getMem('ip');
                    continue;
                }
                if (op=='+') {
                    this.stack.push(this.stack.pop()+this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='-') {
                    this.stack.push(this.stack.pop()-this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='&') {
                    this.stack.push(this.stack.pop()&this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='|') {
                    this.stack.push(this.stack.pop()|this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='*') {
                    this.stack.push(this.stack.pop()*this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='/') {
                    this.stack.push(this.stack.pop()/this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='%') {
                    this.stack.push(this.stack.pop()%this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='==') {
                    this.stack.push(this.stack.pop()==this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='>') {
                    this.stack.push(this.stack.pop()>this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='<') {
                    this.stack.push(this.stack.pop()<this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='>=') {
                    this.stack.push(this.stack.pop()>=this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='<=') {
                    this.stack.push(this.stack.pop()<=this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='!=') {
                    this.stack.push(this.stack.pop()!=this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='===') {
                    this.stack.push(this.stack.pop()===this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='!==') {
                    this.stack.push(this.stack.pop()!==this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='!') {
                    this.stack.push(!this.stack.pop());
                    this.ip++;
                    continue;
                }
                if (op=='pop') {
                    this.stack.pop();
                    this.ip++;
                    continue;
                }
                if (op=='.') {
                    var o = this.stack.pop();
                    var a = o[this.stack.pop()];
                    if((typeof a)=='function')a.$parent=o;
                    this.stack.push(a);
                    this.ip++;
                    continue;
                }
                if (op=='cjsf') {
                    var a = this.stack.pop();
                    var f = this.stack.pop();
                    this.stack.push(f.apply(f.$parent==undefined?window:f.$parent,a));
                    this.ip++;
                    continue;
                }
                if (op=='math') {
                    this.stack.push(Math[this.bin[this.ip+1]](this.stack.pop()));
                    this.ip+=2;
                    continue;
                }
            }
        } catch(e) {
            this.pause();
            throw e;
        }
    };
    this.getMem=function(k){
        var h=this.memstack.length-1;
        while(1){
            if(this.memstack[h--].hasOwnProperty(k))return this.memstack[h+1][k];
            if(h<0)return;
        }
    };
    this.setMem=function(k,v){
        if(this.memstack[0].hasOwnProperty(k))this.memstack[0][k]=v;
        else this.memstack[this.memstack.length-1][k]=v;
    }
    $_THREADARR.push(this);
}

try {
    var $CSS = 'dollarscript,d_s';
    var $STYLE = document.createElement('STYLE')
    $STYLE.innerHTML = $CSS+'{display:none}';
    document.head.appendChild($STYLE);
} catch (e) {}

setInterval(function(){
    Array.from(document.querySelectorAll($CSS)).forEach(function(e){
        if(e.getAttribute('_hasrun')!='yes') {
            var err;
            try {
                (new $thread(e.innerHTML,e.getAttribute('nice'))).run();
            } catch (ex) {
                err=ex;
            }
            e.setAttribute('_hasrun','yes');
            if (err) throw err;
        }
    });
},150);

setInterval(function(){
    $_THREADARR.forEach(function(t){
        window.$current=t;
        if(t.running) t.next();
    });
},1);

function $X(c,n){
    (new $thread(c,n)).run();
} 

function $debug(){
    
}
