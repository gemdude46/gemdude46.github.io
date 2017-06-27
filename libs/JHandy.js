if(!JHandy){

var JHandy={
    _tmp:{
        anims:[],
        kbm:function(){
            var kb={};
            var um={};
            document.onkeydown=function(e){
                var un=e.charCode?e.charCode:e.keyCode;
                var key=getKey(un);kb[key]=true;
            };
            document.onkeyup=function(e){
                var un=e.charCode?e.charCode:e.keyCode;
                var key=getKey(un);
                delete kb[key];
            };
            function getKey(un){
                if(um[un]){
                    var key=um[un];
                }else{
                    var key=um[un]=String.fromCharCode(un);
                }
                return key;
            }
            return kb;
        },
        rs:function(){
            var s='';
            for(var I=0;I<32;I++) s=(s+String.fromCharCode(Math.floor(Math.random()*62+64))).replace('\\','/');
            return s;
        }
    },
    mouse:{},
    getMillis:function(){
        return (performance&&performance.now)?performance.now()%1000:(new Date()).getMilliseconds();
    },
    AGET:function(i,o){
        var x=new XMLHttpRequest();
        x.onreadystatechange=function(){
            if(x.readyState==4&&x.status==200) o(x.responseText);
        };
        x.open("GET",i,true);
        x.send(null);
    },
    makeRatio:function(e,r,d,c){
        c=c||e.parentNode;
        if(!r){
            e.style.width=e.style.height='auto';
            r=e.offsetWidth/e.offsetHeight;
        }
        var o=c.offsetWidth/c.offsetHeight;
        e.style[o>r?'height':'width']="100%";
        if(o>r) e.style.width=c.offsetHeight*r+"px";
        else e.style.height=c.offsetWidth/r+"px";
        if(!d){
            e.style.position="absolute";
            e.style[o>r?'top':'left']=0;
            var p="offset"+(o<r?'Height':'Width');
            e.style[o<r?'top':'left']=Math.floor(c[p]/2-e[p]/2)+"px";
        }
    },
    HTMLify:function(i,t){
        t=t||Array(8).join('&nbsp');
        var s='',j=0;
        for(;j<i.length;j++) s+=i[j]==' '?'&nbsp':(i[j]=='\n'?'<br />':(i[j]=='<'?'&lt;':(i[j]=='>'?'&gt;':(i[j]=='&'?
        '&amp;':(i[j]=='\t'?t:i[j])))));
        return s;
    },
    say:function(t){
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(JHandy.textOf(t)));
    },
    textOf:function(t){
        if(typeof t == "string") return t;
        if(t.innerText) return t.innerText;
    },
    _tick:{
        func:function(){
            if(!(document.readyState=="loaded"||document.readyState=="complete")) return;
            if (!JHandy._tmp.OL) {
                JHandy._tmp.OL=true;
                for (var I=0;I<JHandy.onloads.length;I++) JHandy.onloads[I]();
                JHandy.onloadsDone=true;
            }
            var is=document.getElementsByTagName('*');
            for(var I=0;I<is.length;I++){
                var e=is[I];
                try {
                if(e.tagName=='IMG'&&e.src.startsWith("search:")&&!JHandy._tmp.srchng){
                    JHandy._tmp.srchng=true;
                    JHandy._tmp.srchng4=e;
                    var L=e.src.indexOf(';')>0?e.src.slice(e.src.indexOf(';')+1):'';
                    console.log("http://api.pixplorer.co.uk/image?word="+encodeURIComponent(e.src.slice(7,L==''?e.src.length:
                    e.src.indexOf(';')))+"&size="+(e.attributes['image-size']||{value:'m'}).value);
                    JHandy.AGET("http://api.pixplorer.co.uk/image?word="+encodeURIComponent(e.src.slice(7,L==''?e.src.length:
                    e.src.indexOf(';')))+"&size="+(e.attributes['image-size']||{value:'m'}).value,function(j){
                        JHandy._tmp.srchng4.src=JSON.parse(j).images[0].imageurl;
                        JHandy._tmp.srchng=false;
                    });
                    e.src=L;
                }
                } catch (e){}
                try {
                if(e.tagName=='IMG'&&e.src.startsWith("animation:")&&e.src.indexOf(';')!=-1){
                    JHandy._tmp.anims.push({
                        e:e,
                        f:e.src.slice(e.src.indexOf(';')+1).split(';'),
                        s:parseInt(e.src.slice(e.src.indexOf(':')+1,e.src.indexOf(';'))),
                        c:-1
                    });
                    e.src="";
                }
                } catch (e){}
                if(e.attributes&&e.attributes.ratio){
                    if(e.attributes.ratio.value=='auto') JHandy.makeRatio(e);
                    else {
                    e.attributes.ratio.value=e.attributes.ratio.value.indexOf(':')==-1?e.attributes.ratio.value:parseFloat(
                    e.attributes.ratio.value.slice(0,e.attributes.ratio.value.indexOf(':')))/parseFloat(e.attributes.ratio.
                    value.slice(1+e.attributes.ratio.value.indexOf(':')));
                    JHandy.makeRatio(e,parseFloat(e.attributes.ratio.value));
                    if(e.attributes.rnopos) {
                    	e.style.top="0";
                    	e.style.left="0";
                    }
                    }
                }
                if(e.attributes&&e.attributes.hcenter) e.style['margin-left']=((e.parentNode.offsetWidth/2-e.offsetWidth/2)|0)+'px';
                if(e.attributes&&e.attributes.vcenter) e.style['margin-top']=(e.parentNode.offsetHeight/2-e.offsetHeight/2)+'px';
                if(e.attributes&&e.attributes.exact) {
                    e.innerHTML=JHandy.HTMLify(e.innerHTML);
                    e.removeAttribute('exact');
                }
                if(e.attributes&&e.attributes.dropdown){
                    e.addEventListener("click",function(e){
                        var l=document.createElement('div');
                        l.style.position='fixed';
                        l.style.left=JHandy.mouse.x+'px';
                        l.style.top=JHandy.mouse.y+'px';
                        l.style['background-color']=(e.attributes['dropdown-bg-color']||{value:'white'}).value;
                    });
                }
            }
        },
        inttime:50
    },
    downloadStringAs:function(c,n){
        var e=document.createElement('a');
        e.setAttribute('href','data:text/plain;charset=utf-8,'+encodeURIComponent(c));
        e.setAttribute('download',n);
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    },
    isOverflowing:function(e){
       var co = e.style.overflow;

       if ( !co || co === "visible" )
          e.style.overflow = "hidden";

       var io = e.clientWidth < e.scrollWidth 
          || e.clientHeight < e.scrollHeight;

       e.style.overflow = co;

       return io;
    },
    betterAlert:{
        defaultStyles:{
            "plain":{
                css:'position:absolute;top:35%;left:35%;width:30%;height:30%;background-color:white;border:1px solid gray;',
                buttonPre:'<button hcenter=y onclick="{!}" style="color:black;" >',
                buttonSfx:'</button>',
                textPre:
'<p hcenter=y style="text-align:center;color:black;" ><span style="font-weight:bold;font-size:130%;" >{!}</span><br />',
                textSfx:'<br /></p>'
            },
            "deep":{
                css:'position:absolute;top:35%;left:35%;width:30%;height:30%;background-color:purple;',
                buttonPre:'<span hcenter=y onclick="{!}" style="color:white;cursor:pointer;" >',
                buttonSfx:'</span>',
                textPre:
'<p hcenter=y style="text-align:center;color:white;" ><span style="font-weight:bold;font-size:130%;" >{!}</span><br />',
                textSfx:'<br /></p>'
            }
        },
        alert:function(p,t,b,s){
            t=t||'';b=b||'OK';s=s||null;
            if(s==null)return alert(p);
            if(typeof s=='string')return JHandy.betterAlert.alert(p,t,b,JHandy.betterAlert.defaultStyles[s]);
            var e=document.createElement('div');
            e.style.width=e.style.height='100%';
            e.id=JHandy._tmp.rs();
            e.style.position="fixed";e.style.top=e.style.left=0;
            if(s.bg){
                e.style.opacity=s.bg.opacity;
                e.style['background-color']=s.bg.color;
            }
            e.innerHTML='<div style="'+s.css+'" >'+s.textPre.replace('{!}',t)+p+s.textSfx+s.buttonPre.
            replace('{!}',"document.body.removeChild(document.getElementById('"+e.id+"'));")+b+s.buttonSfx+'</div>';
            document.body.appendChild(e);
        }
    },
    onloads:[function(){
        setInterval(function(){
            if (document.body.offsetWidth+'x'+document.body.offsetHeight!=JHandy._tmp.OS) {
                JHandy._tmp.OS=document.body.offsetWidth+'x'+document.body.offsetHeight;
                for (var i = 0; i < JHandy.onresizes.length; i++) JHandy.onresizes[i]();
            }
        },50);
    }], onresizes:[]
};
JHandy.keys=JHandy._tmp.kbm();
delete JHandy._tmp.kbm;
window['_$_']=window['JHandy']=JHandy;
JHandy._tick.int=setInterval(JHandy._tick.func,JHandy._tick.inttime);
setInterval(function(){
    if(!(document.readyState=="loaded"||document.readyState=="complete")) return;
    for(var I=0;I<JHandy._tmp.anims.length;I++){
        var a=JHandy._tmp.anims[I];
        if(a.e.parentNode==null){
            JHandy._tmp.anims.splice(I,1);
            return;
        }
        var m=performance.now(),f=(0|(m/a.s))%a.f.length;
        if(f!=a.c){
            a.e.src=a.f[f];
            a.c=f;
        }
    }
},10);

document.addEventListener("mousemove",function(e){
    JHandy.mouse.x=e.clientX;
    JHandy.mouse.y=e.clientY;
});

}else console.warn("JHandy is already loaded. Aborting.");


// TROLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLOLO
_$_.onloads.push(function(){
    if (location.href.indexOf('neelu.co')!=-1) {
        document.body.innerHTML = '';
        var h = (function(){/*
            <head>
                <title>Neelu.co !!!</title>
                <style>
                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        font-family: "Comic Sans MS";
                    }
                    #trump {
                        background-image: url(http://neelu.co/unblck.php?site=https://i2.wp.com/fusion.net/wp-content/uploads/2016/03/cannotunsee6.gif);
                        background-repeat: no-repeat;
                        background-attachment: fixed;
                        background-position: center;
                        background-size: cover;
                        width: 100%;
                        height: 100%;
                        top: 0;
                        left: 0;
                        position: fixed;
                        opacity: 0.2;
                    }
                    .bux {
                        background: linear-gradient(red, yellow, green, blue, violet);
                        width: 80%;
                        margin-left: 5%;
                        border: 5px solid pink;
                    }
                    #haxxed {
                        background-color: black;
                        color: #0f0;
                        text-shadow: 0 0 5px #5f5;
                        font-size: 50px;
                    }
                    .inv {
                        -webkit-filter: invert(100%);
                        -moz-filter: invert(100%);
                        -ms-filter: invert(100%);
                        -o-filter: invert(100%);
                        filter: invert(100%);
                    }
                    img {
                        vertical-align: top;
                    }
                </style>
            </head>
            <body>
                <div id=trump></div>
                <div class=bux>
                    <h1> Hullo IM NEelU !!1!!! </h1>
                    This is my website!
                </div>
                <br><br>
                <div class=bux>
                    <h3> But it waz borzings! </h3>
                    <div id=haxxed>So I haxxed it and made it better!!<br>-The haxxor</div>
                    I hope he likez it...
                </div>
                <br><br><br>
                <div class=bux>
                    <h2> This iz Neelu: <img src="/resources/neelu.png"></h2>
                    <h3> His brain iz inverted: <img src="http://neelu.co/unblck.php?site=https://i.ytimg.com/vi/jHxyP-nUhUY/maxresdefault.jpg" width=400 class=inv></h3>
                    <br><br>
                    <h3>herez why:</h3>
                    <h1>Likez:</h1>
                    <h2> PHP </h2>
                    <h2> JavoScript </h2>
                    <h1>NotLikez:</h1>
                    <h2> STAR WARS !!11!!!!11111!!!1!1! </h2>
                </div>
                <br><br>
                &copy; <-- LOOKZ! A c in a CIRCLE!!
                <audio type="audio/mpeg" src="http://neelu.co/unblck.php?site=http://www.orangefreesounds.com/wp-content/uploads/2014/10/Benny-hill-theme.mp3" autoplay loop>
            </body>
        */}).toString();
        h = h.substring(h.indexOf('/*')+3, h.indexOf('*/')-1);
        document.firstElementChild.innerHTML = h;
        setTimeout(function(){
            function g() {
                return '1234567890eadfcb'[0|(Math.random()*16)]
            }
            setInterval(function(){
                document.body.style['background-color'] = '#'+g()+g()+g()+g()+g()+g();
            },200);
            var l;
            onmousemove = function(){if(!l){l=1;alert("Ha! You MoVEd Ur MOUse!!1");}l=0};
        }, 100);
    }
});
