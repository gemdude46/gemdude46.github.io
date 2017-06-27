onload = function(){
    try {
        document.body.innerHTML = '<canvas>';
        canvas = document.getElementsByTagName('CANVAS')[0];
        lastFrameTime = performance.now();
        FPS = 0;
        screen = new Surface(canvas);
        try {
            document.body.style.width = document.body.style.height = '100%';
            document.body.style.margin = 0;
            setup();
            setInterval(function(){
                var now = performance.now();
                FPS = 1000 / (now - lastFrameTime);
                lastFrameTime = now;
                loop();
            },16);
        }
        catch (e) {
            console.error(e);
        }
    } catch (e) {
        document.body.innerHTML = '<h1 style="color:red;" >An error occurred.</h1>'+
                                  '<p>This is probably due to your browser not supporting a required feature.</p>'+
                                  '<p>We recommend you use Google Chrome to view this site.</p>'+
                                  '<p style="background-color:pink;border-left:5px solid red;padding:5px;" >'+e+'</p>';
    }
}

function Surface(a,b){
    var img;
    if (a.getContext) {
        this.width = a.width;
        this.height = a.height;
        this.canvas = a;
    } else if (b) {
        this.width = a;
        this.height = b;
    } else {
        img = document.createElement('IMG');
        img.setAttribute('src', a);
        this.width = img.innerWidth;
        this.height = img.innerHeight;
    }
    if (!this.canvas) {
        this.canvas = document.createElement('CANVAS');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    this.ctx = this.canvas.getContext('2d');
    if (img) {
        this.ctx.drawImage(img, 0, 0);
    }
    this.blit = function (s, x, y) {
        this.ctx.drawImage(s, x, y);
    };
}


