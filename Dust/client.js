var BLOCKSIZE = 4;

self.DustClientCommands = {
    handshake: function(msg, client) {
        client.serverName = msg.serverName;
        client.send({cmd: 'haveData', playerName: 'Bob'});
    },
    
    loadWorld: function(msg, client) {
        client.chat("Connected to " + client.serverName, 'yellow');
    },
    
    disconnect: function(msg, client) {
        client.chat("DISCONNECTED: " + msg.reason, 'yellow');
    },
    
    message: function(msg, client) {
        client.chat(msg.text, msg.color);
    },
    
    haveChunk: function(msg, client) {
        var chunk = new DustClientChunk(msg.x, msg.y, msg.chunk, client);
        
        for (var i = 0; i < client.chunks.length; i++) 
            if (client.chunks[i].x === msg.x && client.chunks[i].y === msg.y) {
                client.chunks[i] = chunk;
                return;
            }
            
        client.chunks.push(chunk);
    },
    
    setBlock: function(msg, client) {
        var ch = client.getChunk(msg.chx, msg.chy);
        if (ch && ch.isChunkObject) ch.setBlock(msg.blk, msg.ind);
    },
    
    pan: function(msg, client) {
        client.camx = BLOCKSIZE * msg.x;
        client.camy = BLOCKSIZE * msg.y;
    }
};

self.DustClient = function(cvs) {
    
    this.kcmap = {
        37: 'left',
        39: 'right',
        32: 'jump',
        16: 'run'
    };
    
    this.bgcolor = [0,255,255];
    
    this.chunks = [];
    
    this.dirtychunks = 1;
    
    this.getChunk = function(x, y) {
        for (var i = 0; i < this.chunks.length; i++) 
            if (this.chunks[i].x === x && this.chunks[i].y === y)
                return this.chunks[i];
        
        return null;
    };
    
    this.getBlock = function (x, y) {
        var ch = this.getChunk(Math.floor(x / 128), Math.floor(y / 128));
        if (ch && ch.isChunkObject) {
            return ch.blocks[(y&127) + 128 * (x&127)];
        } else return DustDataBlocks.ERROR.id;
    };
    
    this.cvs = cvs;
    
    this.camx = 0;
    this.camy = 0;
    
    this.day = true;
    
    this.updateCanvas = function() {
        this.sf = CreateCanvasObject(cvs);
    };
    
    this.updateCanvas();
    
    this.onmsg = function(msg) {
        DustClientCommands[msg.cmd](msg, this);
    };
    
    this.chat_hist = [];
    
    this.chat = function(msg, clr) {
        this.chat_hist.push({message: msg, color: clr || 'white', timestamp: Date.now()});
        if (this.chat_hist.length > 16) this.chat_hist.splice(0,1);
    };
    
    this.render = function() {
        this.sf.clear();
        var me = this;
        this.dirtychunks = 0;
        this.chunks.forEach(function(chunk) { me.dirtychunks += !!chunk.sfdirty; });
        this.chunks.forEach(function(chunk) {
            
            if (!chunk.isChunkObject) return;
            
            if (chunk.sfdirty) chunk.render();
            me.sf.blit([0|(chunk.x * 128 * BLOCKSIZE - me.camx + me.sf.width / 2),
                        0|(chunk.y * 128 * BLOCKSIZE - me.camy + me.sf.height/ 2)], chunk.sf);
        });
        
        this.sf.drawRect([0|(me.sf.width / 2 - BLOCKSIZE * 3), 0|(me.sf.height / 2 - BLOCKSIZE * 7), BLOCKSIZE * 6, BLOCKSIZE * 14], 'red');
        
        this.renderChat();
    };
    
    this.renderChat = function() {
        var y = this.sf.height - 32;
        
        for (var i = this.chat_hist.length - 1; i >= Math.max(0, this.chat_hist.length - 5); i--) {
            var m = this.chat_hist[i];
            
            if (Date.now() - m.timestamp < 7000) {
                this.sf.drawRect([30,y-16,512,20], 'rgba(0,0,0,0.6)');
                this.sf.drawText([32,y], m.message, '16px Arial', m.color);
                y -= 20;
            }
        }
    };
    
    this.addLighting = function(x, y, al) {
        var ch = this.getChunk(Math.floor(x / 128), Math.floor(y / 128));
        if (ch && ch.isChunkObject) {
            ch.lighting[(y&127) + 128 * (x&127)] += al;
            ch.dirtyBlock(x&127, y&127);
        }
    };
    
    var me = this;
    var drawMe = function() {
        me.render();
        requestAnimationFrame(drawMe);
    };
    
    setInterval(function() {
        var chx = 0|(me.camx / (128 * BLOCKSIZE));
        var chy = 0|(me.camy / (128 * BLOCKSIZE));
        for (var i = -3; i < 3; i++)
            for (var j = -2; j < 3; j++)
                if (me.getChunk(i + chx, j + chy) === null) {
                    me.chunks.push({x: i + chx, y: j + chy});
                    me.send({cmd: 'getChunk', x: i + chx, y: j + chy});
                }
    }, 256);
    
    requestAnimationFrame(drawMe);
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode in me.kcmap) me.send({cmd: 'updateKey', key: me.kcmap[e.keyCode], down: true});
    });
    
    document.addEventListener('keyup', function(e) {
        if (e.keyCode in me.kcmap) me.send({cmd: 'updateKey', key: me.kcmap[e.keyCode], down: false});
    });
};

self.DustClientChunk = function(x, y, blocks, client) {
    this.isChunkObject = true;
    
    this.client = client;
    
    this.x = x;
    this.y = y;
    
    this.sf = CreateSurface([128 * BLOCKSIZE, 128 * BLOCKSIZE]);
    
    this.idata = client.sf.ctx.createImageData(128 * BLOCKSIZE, 128 * BLOCKSIZE);
    
    this.blocks = blocks;
    this.lighting = Array(16384).fill(0.1);
    
    this.spixcol = function(x, y, clr) {
        var pixs = 4*(x + y * this.idata.width);
        this.idata.data[pixs]   = clr[0];
        this.idata.data[pixs+1] = clr[1];
        this.idata.data[pixs+2] = clr[2];
        this.idata.data[pixs+3] = 255;
    };
    
    this.sblkcol = function(x, y, clr) {
        for (var i = 0; i < BLOCKSIZE; i++)
            for (var j = 0; j < BLOCKSIZE; j++)
                this.spixcol(x * BLOCKSIZE + i, y * BLOCKSIZE + j, clr);
    };
    
    this.uds = function() {
        this.sf.ctx.putImageData(this.idata, 0, 0);
    };
    
    this.sfdirty = [0,0,128,128];
    
    this.render = function(start_time) {

        start_time = start_time || performance.now();
        
        var j = this.sfdirty[0];
        for (var k = this.sfdirty[1]; k < this.sfdirty[3]; k++) {
            var block = self.DustDataBlocks[this.blocks[k+j*128]];
            var light = this.lighting[k+j*128];
            if (this.client.day && this.y < 4) {
                var cy = k-1;
                var dist = 1;
                while (this.blocks[cy + 128 * j] !== DustDataBlocks.air.id) {
                    if ((cy & 127) == 127) {
                        cy += 128 * this.y;
                        var rx = j + 128 * this.x;
                        
                        while (this.client.getBlock(rx, cy) !== DustDataBlocks.air.id) {
                            dist++;
                            cy--;
                            if (dist >= 180) {
                                break;
                            }
                        }
                        
                        break;
                    }
                    dist++;
                    cy--;
                }
                light += 1 - (dist / 180); 
            }
            if (block.render === 'none') {
                //this.sf.drawRect([j * BLOCKSIZE, k * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE], this.client.bgcolor);
                this.sblkcol(j, k, this.client.bgcolor);
            } else if (block.render === 'normal' || block.render === 'fluid') {
                var clr = block.color;
                var ofs;
                if (block.variation) {
                    ofs = new alea(j+'.'+k+'.'+this.x+'.'+this.y+'.').int32() % block.variation;
                } else {
                    ofs = 0;
                }
                clr = [
                    DustClientUtils.byteclamp(light * (clr[0] + ofs)),
                    DustClientUtils.byteclamp(light * (clr[1] + ofs)),
                    DustClientUtils.byteclamp(light * (clr[2] + ofs))
                ];
                //this.sf.drawRect([j * BLOCKSIZE, k * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE], clr);
                this.sblkcol(j, k, clr);
            }
        }
        
        if ((++this.sfdirty[0]) == this.sfdirty[2]) {
            this.sfdirty = null;
            this.uds();
        } else if (performance.now() - start_time < 16 / this.client.dirtychunks)
            this.render(start_time);
        //else
        //    this.uds();
    };
    
    this.dirtyBlock = function(x, y) {
        if (this.sfdirty) {
            if (x < this.sfdirty[0])    this.sfdirty[0] = x;
            if (y < this.sfdirty[1])    this.sfdirty[1] = y;
            if (x+2 > this.sfdirty[2])  this.sfdirty[2] = x+1;
            if (y+2 > this.sfdirty[3])  this.sfdirty[3] = y+1;
        } else this.sfdirty = [x, y, 1+x, 1+y];
    }
    
    this.setBlock = function(blk, pos) {
        var x = pos >> 7;
        var y = pos & 127;
        this.addLighting(pos, -1);
        this.blocks[pos] = blk;
        this.dirtyBlock(x, y);
        this.addLighting(pos);
    };
    
    this.addLighting = function(pos, mul) {
        var lum = DustDataBlocks[this.blocks[pos]].light;
        
        mul = mul || 1;
        
        if (lum) {
            var px = pos >> 7;
            var py = pos & 127;
            for (var x = px-50; x < px + 50; x++)
                for (var y = py - 50; y < py + 50; y++) {
                    var d = Math.sqrt((x - px)*(x - px) + (y - py)*(y - py));
                    var al = Math.max(50/(d+(1/lum)) - 1, 0) * mul;
                    if (al !== 0) {
                        if (x < 0 || y < 0 || x > 127 || y > 127)
                            this.client.addLighting(this.x * 128 + x, this.y * 128 + y, al);
                        else {
                            this.lighting[y+128*x] += al;
                            this.dirtyBlock(x, y);
                        }
                    }
                }
        }
    };
    
    for (var i = 0; i < 16384; i++) {
        this.addLighting(i);
    }
};

DustClientUtils = {
    byteclamp: function(x) {
        return 0|(x < 0 ? 0 : (x > 255 ? 255 : x));
    }
}
