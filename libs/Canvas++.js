function getFillStyle(c){
    if((typeof c)=='string'||c.addColorStop) return c;
    return c.length==3?'rgb('+c[0]+','+c[1]+','+c[2]+')':'rgba('+c[0]+','+c[1]+','+c[2]+','+c[3]+')';
}

function SurfaceFromCanvasElement(elll){
    this._ISSURFACE=true;
    this.e=elll;
    this.ctx=elll.getContext('2d');
    this.width=elll.width;
    this.height=elll.height;
    this.clear=function(){
        this.e.width=this.e.width;
    };
    this.drawRect=function(r,c){
        if(c) this.ctx.fillStyle = getFillStyle(c);
        this.ctx.beginPath();
        this.ctx.rect(r[0],r[1],r[2],r[3]);
        this.ctx.fill();
    };
    this.drawCircle=function(p,r,c){
        if(c) this.ctx.fillStyle = getFillStyle(c);
        this.ctx.beginPath();
        this.ctx.arc(p[0],p[1],r,0,2*Math.PI);
        this.ctx.fill();
    };
    this.drawPoly=function(p,c){
        if(c) this.ctx.fillStyle = getFillStyle(c);
        this.ctx.beginPath();
        this.ctx.moveTo(p[0][0],p[0][1]);
        for (var i = 1; i < p.length; i++) this.ctx.lineTo(p[i][0],p[i][1]);
        this.ctx.lineTo(p[0][0],p[0][1]);
        this.ctx.fill();
    };
    this.drawRegPoly=function(p,i,r,c,s){
        s=s||0;
        points = [];
        i = 2*Math.PI/i;
        for (var a = s; a - s < 2*Math.PI - i/2; a += i) points.push([p[0]+Math.sin(a)*r,p[1]+Math.cos(a)*r]);
        this.drawPoly(points, c)
    };
    this.drawLine=function(s,e,w,c,p){
        if(c) this.ctx.strokeStyle = getFillStyle(c);
        if(w) this.ctx.lineWidth = w;
        this.ctx.beginPath();
        this.ctx.moveTo(s[0],s[1]);
        this.ctx.lineTo(e[0],e[1]);
        this.ctx.stroke();
        if(p) {
            this.drawCircle(s,w/2,c);
            this.drawCircle(e,w/2,c);
        }
    };
    this.drawText=function(p,t,f,c){
        if(c) this.ctx.fillStyle = getFillStyle(c);
        if(f) this.ctx.font = f;
        this.ctx.textAlign = p[2]||'left';
        this.ctx.fillText(t,p[0],p[1]);
    };
    this.blit=function(p,i,s,a){
        if((typeof i)=='string') i=document.getElementById(i)||document.createElement('IMG');
        if(i._ISSURFACE) i=i.e;
        if(a) this.ctx.globalAlpha = a;
        s?this.ctx.drawImage(i,p[0],p[1],s[0],s[1]):this.ctx.drawImage(i,p[0],p[1]);
        this.ctx.globalAlpha = 1;
    };
    this.fill=function(c){
        this.drawRect([0,0,this.width,this.height],c);
    };
}

function CreateCanvasObject(e){
    var x = new SurfaceFromCanvasElement((typeof e)=='string'?document.getElementById(e):e);
    x.eventQueue = [];
    //x.e.addEventListener('click',function(e){x.eventQueue.push({type:'click',})})
    return x;
}

function CreateSurface(s){
    var e = document.createElement('CANVAS');
    e.width = s[0];
    e.height= s[1];
    return new SurfaceFromCanvasElement(e);
}
