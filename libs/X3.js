window.X3 = {

useNamespaceX3: function() {
    Object.keys(X3).forEach(function(x){window[x]=X3[x];});
},

createDisplay: function(size, parent, noHTML5) {
    var d = new X3.display(size, noHTML5);
    parent&&parent.appendChild(d.canvas);
    return d;
},

display: function(size, noHTML5) {
    this.scene = new X3.scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(size[0], size[1]);
    this.renderer.domElement.innerHTML=noHTML5||'';
    this.canvas = this.renderer.domElement;
    this.onframe = X3.NOP;
    X3.displays.push(this);
},

scene: function() {
    this.scene = new THREE.Scene();
    this.activeCamera = null;
    
    this.addPlaneNode = function(w, h) {
        return X3.node(THREE.Mesh(THREE.PlaneGeometry(w, h),THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide})),this);
    };
},

node: function(o, s) {
    this.obj = o;
    this.scene = s;
}

NOP: function(){},

displays: []

};

function _X3_render() {
    requestAnimationFrame(_X3_render);
    X3.displays.forEach(function(d){
        d.scene.activeCamera&&d.renderer.render(d.scene,d.scene.activeCamera);
    });
}
_X3_render();
