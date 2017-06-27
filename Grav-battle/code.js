var width, height;
var alertDirty;
var RPX, RPY, RVX, RVY, BPX, BPY, BVX, BVY, MPX, MPY, MVX, MVY;
var game;
var G=400;
var spd=0.05;
var mu=1.02;
function startRound(){
    RVX=RVY=BVX=BVY=MVX=MVY=0;
    RPX=width/3.0;
    BPX=width/1.5;
    MPX=width/2.0;
    RPY=BPY=MPY=height/2.0;
    document.getElementById("alert").innerHTML="3";alertDirty=true;
    setTimeout(function(){document.getElementById("alert").innerHTML="2";alertDirty=true;},1000);
    setTimeout(function(){document.getElementById("alert").innerHTML="1";alertDirty=true;},2000);
    setTimeout(function(){document.getElementById("alert").innerHTML="GO!";game=true;alertDirty=true;},3000);
    setTimeout(function(){document.getElementById("alert").innerHTML="";alertDirty=true;},3500);
}

function keyboard_module(onUpdate){
    var kb = {};
    var unicode_mapping = {};
    document.onkeydown = function(e){
        var unicode=e.charCode? e.charCode : e.keyCode
        var key = getKey(unicode);
        kb[key] = true;
        if(onUpdate){
            onUpdate(kb);
        }
    }

    document.onkeyup = function(e){
        var unicode=e.charCode? e.charCode : e.keyCode
        var key = getKey(unicode);
        delete kb[key];
        if(onUpdate){
            onUpdate(kb);
        }
    }

    function getKey(unicode){
        if(unicode_mapping[unicode]){
            var key = unicode_mapping[unicode];
        }else{
            var key= unicode_mapping[unicode] = String.fromCharCode(unicode);
        }
        return key;
    }
    return kb;
}


var KB = keyboard_module();


window.onload=function(){setTimeout(startRound,500);};

setInterval(function(){
    var ow = width, oh = height;
    width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

    height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
    
    var sizeDirty = ow!=width||oh!=height;
    
    if (sizeDirty||alertDirty) {
        document.getElementById("alert").style.left=(width/2-document.getElementById("alert").offsetWidth /2)+"px";
        document.getElementById("alert").style.top=(height/2-document.getElementById("alert").offsetHeight/2)+"px";
    }
    
    document.getElementById("red").style.left=(RPX-40)+"px";
    document.getElementById("red").style.top=(RPY-40)+"px";
    document.getElementById("blue").style.left=(BPX-40)+"px";
    document.getElementById("blue").style.top=(BPY-40)+"px";
    document.getElementById("moon").style.left=(MPX-20)+"px";
    document.getElementById("moon").style.top=(MPY-20)+"px";
    
    if (game) {
    if(KB['W']) RVY-=spd;
    if(KB['A']) RVX-=spd;
    if(KB['S']) RVY+=spd;
    if(KB['D']) RVX+=spd;
    RVX/=mu;
    RVY/=mu;
    
    if(KB['&']) BVY-=spd;
    if(KB['%']) BVX-=spd;
    if(KB['(']) BVY+=spd;
    if(KB["'"]) BVX+=spd;
    BVX/=mu;
    BVY/=mu;
    }
    
},32);

setInterval(function(){if(!game)return;
    var f = G/((RPX-MPX)*(RPX-MPX)+(RPY-MPY)*(RPY-MPY));
    MVX+=f*Math.sin(Math.atan2(RPX-MPX,RPY-MPY));
    MVY+=f*Math.cos(Math.atan2(RPX-MPX,RPY-MPY));
    f = G/((BPX-MPX)*(BPX-MPX)+(BPY-MPY)*(BPY-MPY));
    MVX+=f*Math.sin(Math.atan2(BPX-MPX,BPY-MPY))+Math.random()*2e-10-1e-10;
    MVY+=f*Math.cos(Math.atan2(BPX-MPX,BPY-MPY))+Math.random()*2e-10-1e-10;
    if(RVX<0&&RPX<40)RVX=-RVX;
    if(RVY<0&&RPY<40)RVY=-RVY;
    if(RVX>0&&RPX>width-40)RVX=-RVX;
    if(RVY>0&&RPY>height-40)RVY=-RVY;
    if(BVX<0&&BPX<40)BVX=-BVX;
    if(BVY<0&&BPY<40)BVY=-BVY;
    if(BVX>0&&BPX>width-40)BVX=-BVX;
    if(BVY>0&&BPY>height-40)BVY=-BVY;
    if(MVX<0&&MPX<20)MVX=-MVX;
    if(MVY<0&&MPY<20)MVY=-MVY;
    if(MVX>0&&MPX>width-20)MVX=-MVX;
    if(MVY>0&&MPY>height-20)MVY=-MVY;
    RPX+=RVX;
    RPY+=RVY;
    BPX+=BVX;
    BPY+=BVY;
    MPX+=MVX;
    MPY+=MVY;
    if ((RPX-MPX)*(RPX-MPX)+(RPY-MPY)*(RPY-MPY)<3600) {
        game = false;
        document.getElementById("alert").innerHTML = "Blue Wins!";
        alertDirty = true;
        setTimeout(startRound,3000);
        return;
    }
    if ((BPX-MPX)*(BPX-MPX)+(BPY-MPY)*(BPY-MPY)<3600) {
        game = false;
        document.getElementById("alert").innerHTML = "Red Wins!";
        alertDirty = true;
        setTimeout(startRound,3000);
        return;
    }
    if ((RPX-BPX)*(RPX-BPX)+(RPY-BPY)*(RPY-BPY)<6400) {
        game = false;
        document.getElementById("alert").innerHTML = "Tie!";
        alertDirty = true;
        setTimeout(startRound,3000);
        return;
    }
},1);
