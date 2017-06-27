window.Vast = new (function() {
    
    // Priorities
    this.Error = function(msg) {
        this.message = msg;
        this.name = 'VastError';
        this.toString = function() {
            return this.name + ': ' + this.message;
        }
    };
    
    this.taskQueue = [];
    this.taskQueueRunning = false;
    
    this.setup = false;
    
    this.required = function() {
        if (!Vast.setup) {
            throw(new Vast.Error("Vast.init() must be called before doing this operation."));
        }
    }
    
    this.execTask = function() {
        if (Vast.taskQueue.length === 0) {
            Vast.taskQueueRunning = false;
        } else {
            Vast.taskQueueRunning = true;
            var task = Vast.taskQueue.splice(0,1)[0];
            
            Vast.tasks[task.task](task);
        }
    }
    
    this.doTask = function(task) {
        Vast.taskQueue.push(task);
        if (!Vast.taskQueueRunning) {
            Vast.execTask();
        }
    };
    
    this.init = function(cb) {
        Vast.doTask({task: 'init', cb: cb});
    };
    
    this.Scene = function() {
        
        if (Vast === this) return new Vast.Scene();
        
        this.setup = false;
        
        this.nodes = [];
        
        this.init = function() {
            this.scene = new THREE.Scene();
            this.activeCamera = new THREE.PerspectiveCamera(45, 1, 0.0001, Number.MAX_SAFE_INTEGER);
            this.scene.add(this.activeCamera);
            
            this.setup = true;
        };
        
        this.runIn = function(el) {
            if (this.setup) {
                this.scrWidth = el.offsetWidth;
                this.scrHeight = el.offsetHeight;
                this.renderer = new THREE.WebGLRenderer();
                this.renderer.setSize(this.scrWidth, this.scrHeight);
                Array.from(el.childNodes).forEach(function(child) {el.removeChild(child);});
                el.appendChild(this.renderer.domElement);
                
                this.activeCamera.aspect = this.scrWidth / this.scrHeight;
                this.activeCamera.updateProjectionMatrix();
                
                var self = this;
                var rf = function(){
                    self.renderer.render(self.scene, self.activeCamera);
                    requestAnimationFrame(rf);
                };
                
                rf();
            } else Vast.doTask({task: 'runSceneFunc', func: 'runIn', scene: this, argA: el});
        };
        
        this.setBackground = function(bg) {
            if (this.setup) {
                this.scene.background = new THREE.Color(bg);
            } else Vast.doTask({task: 'runSceneFunc', func: 'setBackground', scene: this, argA: bg});
        };
        
        this.addVastSphere = function(r, p, c) {
            this.nodes.push(new Vast.VastSphereNode(this, r, p, c));
        };
        
        this.setCameraPosition = function(p) {
            if (this.setup) {
                this.nodes.forEach(function(node) {
                    node.offsetIntNeg(p);
                });
            } else Vast.doTask({task: 'runSceneFunc', func: 'setCameraPosition', scene: this, argA: p});
        };
        
        if (Vast.setup) this.init();
        else Vast.doTask({task: 'initScene', scene: this});
    };
    
    this.VastSphereNode = function(sc, r, p, c) {
        this.scene = sc;
        this.radius = r;
        this.position = p;
        this.color = new THREE.Color(c);
        
        this.setup = false;
        
        this.init = function() {
            this.setup = true;
            var geom = new THREE.SphereGeometry(+this.radius, 32, 32);
            var mat = new THREE.MeshBasicMaterial( {color: this.color} );
            this.node = new THREE.Mesh(geom, mat);
            this.node.add(new THREE.Points(Vast.pointGeom, new THREE.PointsMaterial( {color: this.color, sizeAttenuation: false} )));
            sc.scene.add(this.node);
            this.offsetIntNeg(new Vast.V3D(0,0,0));
        };
        
        this.offsetIntNeg = function(p) {
            if (this.setup) {
                var nip = this.position.minus(p);
                var nipple = nip.len();
                var md = Number.MAX_SAFE_INTEGER;
                if (nipple.gt(md)) this.node.visible = false;
                else {
                    this.node.visible = true;
                    this.node.position.set(+nip.x, +nip.y, +nip.z);
                }
            } else Vast.doTask({task: 'runSceneFunc', func: 'offsetIntNeg', scene: this, argA: p});
        };
        
        if (sc.setup) this.init();
        else Vast.doTask({task: 'initScene', scene: this});
    };
    
    this.V3D = function(x, y, z) {
        
        if (Vast === this) return new Vast.V3D(x, y, z);
        
        this.x = new Big(x);
        this.y = new Big(y);
        this.z = new Big(z);
        
        this.minus = function(othr) {
            return new Vast.V3D(this.x.minus(othr.x), this.y.minus(othr.y), this.z.minus(othr.z))
        };
        
        this.len = function() {
            return this.x.times(this.x).add(this.y.times(this.y)).add(this.z.times(this.z)).sqrt();
        };
    };
    
    this.tasks = {
        init: function(task) {
            if (window.THREE && window.Big) {
                Vast.setup = true;
                Vast.execTask();
                task.cb && task.cb();
            } else {
                var el = document.createElement('SCRIPT');
                el.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/three.js/84/three.min.js');
                el.addEventListener('load', function() {
                    var el = document.createElement('SCRIPT');
                    el.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/big.js/3.1.3/big.min.js');
                    el.addEventListener('load', function() {
                        Vast.setup = true;
                        Vast.pointGeom = new THREE.Geometry();
                        Vast.pointGeom.vertices.push(new THREE.Vector3(0,0,0));
                        Vast.pointGeom.computeBoundingSphere();
                        Vast.execTask();
                        task.cb && task.cb();
                    });
                    document.head.appendChild(el);
                });
                document.head.appendChild(el);
            }
        },
        initScene: function(task) {
            Vast.required();
            task.scene.init();
            Vast.execTask();
        },
        runSceneFunc: function(task) {
            task.scene[task.func](task.argA, task.argB, task.argC, task.argD, task.argE, task.argF);
            Vast.execTask();
        }
    };
})();

window.VastError = window.Vast.Error;
