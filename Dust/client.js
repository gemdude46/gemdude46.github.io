var BLOCKSIZE = 4;

self.DustClientCommands = {
	handshake: function(msg, client) {
		client.serverName = msg.serverName;
		client.send({cmd: 'haveData', playerName: 'Bob'});
	},
	
	loadWorld: function(msg, client) {
		client.chat("Connected to " + client.serverName, 'yellow');
		client.connected = true;
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
		16: 'run',
		84: 'chat'
	};
	
	this.displayChunkBoundries = true;

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
	
	this.setDay = function(day) {
		if (day ^ this.day) {
			this.day = day;
			for (var ch of this.chunks) {
				if (ch.y < 3) {
					ch.sfdirty = [0,0,128,128];
				}
			}
		}
	}

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

	this.say = function(msg) {
		this.send({cmd: 'chat', text: msg})
	};

	this.chatEl = document.createElement('input');
	this.chatEl.setAttribute('type', 'text');
	this.chatEl.style.position = 'fixed';
	this.chatEl.style.bottom = '20px';
	this.chatEl.style.left = '32px';
	this.chatEl.style.width = '512px';
	this.chatEl.style.color = 'white';
	this.chatEl.style['background-color'] = 'rgba(0,0,0,0.6)';
	this.chatEl.style.border = 'none';
	this.chatEl.style.display = 'none';
	this.chatEl.addEventListener('blur', e => {
		This.closeChat();
	});
	this.chatEl.addEventListener('keydown', e => { e.stopPropagation(); });
	this.chatEl.addEventListener('keyup',   e => { e.stopPropagation(); });
	this.chatEl.addEventListener('keypress',e => {
		if (e.keyCode === 27) {
			This.closeChat();
		}

		if (e.keyCode === 10 || e.keyCode === 13) {
			This.say(this.chatEl.value);
			This.closeChat();
		}
	});
	document.body.appendChild(this.chatEl);

	this.openChat = function() {
		this.chatEl.style.display = 'block';
		this.chatEl.value = '';
		this.chatEl.focus();
	};

	this.closeChat = function() {
		this.chatEl.style.display = 'none';
		this.chatEl.blur();
	};
	
	this.renderWorker = new Worker('chunkRenderWorker.js');

	this.getRenderWorker = function() {
		return this.renderWorker;
	};

	var This = this;
	this.renderWorker.onmessage = function(msg) {
		This.getChunk(msg.data.x, msg.data.y).uds();
	}

	this.render = function() {
		this.sf.clear();
		var me = this;
		this.dirtychunks = 0;
		this.chunks.forEach(function(chunk) {
			
			if (!chunk.isChunkObject) return;
			
			if (chunk.sfdirty) chunk.render();

			me.sf.blit([0|(chunk.x * 128 * BLOCKSIZE - me.camx + me.sf.width / 2),
			            0|(chunk.y * 128 * BLOCKSIZE - me.camy + me.sf.height/ 2)], chunk.sf);

			if (me.displayChunkBoundries) {
				me.sf.drawRect([0|(chunk.x * 128 * BLOCKSIZE - me.camx + me.sf.width / 2),
				                0|(chunk.y * 128 * BLOCKSIZE - me.camy + me.sf.height/ 2),
				                128 * BLOCKSIZE, 1], 'blue');

				me.sf.drawRect([0|(chunk.x * 128 * BLOCKSIZE - me.camx + me.sf.width / 2),
				                0|(chunk.y * 128 * BLOCKSIZE - me.camy + me.sf.height/ 2),
				                1, 128 * BLOCKSIZE], 'blue');
			}
		});
		
		this.sf.drawRect([0|(me.sf.width / 2 - BLOCKSIZE * 3), 0|(me.sf.height / 2 - BLOCKSIZE * 7), BLOCKSIZE * 6, BLOCKSIZE * 14], 'red');
		
		this.renderChat();
	};
	
	this.renderChat = function() {
		var y = this.sf.height - 64;
		
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
		if (!client.connected) return;
		var chx = 0|(me.camx / (128 * BLOCKSIZE));
		var chy = 0|(me.camy / (128 * BLOCKSIZE));
		for (var i = -3; i < 3; i++)
			for (var j = -2; j < 3; j++)
				if (me.getChunk(i + chx, j + chy) === null) {
					me.chunks.push({x: i + chx, y: j + chy});
					me.send({cmd: 'getChunk', x: i + chx, y: j + chy});
				}

		for (var i = me.chunks.length - 1; i >= 0; i--) {
			var ch = me.chunks[i];
			if (Math.max(Math.abs(chx - ch.x), Math.abs(chy - ch.y)) >= 7) {
				me.chunks.splice(i, 1);
			}
		}
	}, 256);
	
	requestAnimationFrame(drawMe);
	
	document.addEventListener('keydown', function(e) {
		if (me.kcmap[e.keyCode] === 'chat')
			setTimeout(() => { me.openChat(); }, 16);
		else if (e.keyCode in me.kcmap) me.send({cmd: 'updateKey', key: me.kcmap[e.keyCode], down: true});
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
	this.shdata = new SharedArrayBuffer(this.idata.data.byteLength);
	this.shdataview = new Uint8Array(this.shdata);

	this.blocks = blocks;
	this.lighting = Array(16384).fill(0.1);
	
	this.uds = function() {
		this.idata.data.set(this.shdataview);
		this.sf.ctx.putImageData(this.idata, 0, 0);
	};
	
	this.sfdirty = [0,0,128,128];
	
	this.dirtyBlock = function(x, y) {
		if (this.sfdirty) {
			if (x < this.sfdirty[0])	this.sfdirty[0] = x;
			if (y < this.sfdirty[1])	this.sfdirty[1] = y;
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

	this.updateWorkerData = function() {
		this.renderWorker.postMessage([1, this.blocks, this.lighting]);
	};
	
	for (var i = 0; i < 16384; i++) {
		this.addLighting(i);
	}

	this.render = function() {
		this.client.getRenderWorker().postMessage({
			shdata: this.shdata,
			blocks: this.blocks,
			lighting: this.lighting,
			day: this.client.day,
			i: {
				x: this.x,
				y: this.y
			},
			bs: BLOCKSIZE
		});
		this.sfdirty = null;
	}
};

DustClientUtils = {
	byteclamp: function(x) {
		return 0|(x < 0 ? 0 : (x > 255 ? 255 : x));
	}
}
