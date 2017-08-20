self.DustServerCommands = {
	getChunk: function(msg, svr, conn) {
		conn.send({cmd: 'haveChunk', x: msg.x, y: msg.y, chunk: svr.getChunk(msg.x, msg.y).blocks.slice()});
	},
	chat: function(msg, svr, conn) {
		if (msg.text.startsWith('/')) {
			var res = svr.runCommand(msg.text.split(' ').filter(x => !!x));
			conn.send({cmd: 'message', text: res, color: res.startsWith('[EE]') ? 'red' : 'gray'});
		} else {
			svr.players.forEach(function(plr) {
				if (plr.online) plr.conn.send({cmd: 'message', text: '<' + conn.player.username + '> ' + msg.text});
			});
		}
	},
	updateKey: function(msg, svr, conn) {
		conn.player.keys[msg.key] = msg.down;
	}
};

self.DustServer = function(properties) {
	
	properties = properties || {};
	
	this.name = properties.name || "Dust Server";
	
	this.worldGenerator = DustServerGenerators[properties.generator];
	
	this.gravity = properties.gravity || 275;
	
	this.players = [];
	
	this.entities = [];
	
	this.chunks = {};
	
	this.seed = properties.seed || Math.random() + ';' + Math.random();
	
	this.perlin1 = new Perlin(this.seed);
	this.perlin2 = new Perlin(this.seed + 'u');
	this.perlin3 = new Perlin(this.seed + 'r');
	this.perlin4 = new Perlin(this.seed + 'a');
	this.perlin5 = new Perlin(this.seed + 'd');
	
	this.addConnection = function(conn) {
		var svr = this;
		conn.onmsg = function(msg) {
			if (msg.cmd !== 'haveData') {
				this.disconnect('Unable to perform handshake: You have no hands.');
				return;
			}
			var player = new DustServerPlayer(svr, msg.playerName);
			svr.players.push(player);
			svr.entities.push(player);
			this.player = player;
			player.connect(this);
			this.send({cmd: 'loadWorld'});
			
			this.onmsg = function(msg) {
				DustServerCommands[msg.cmd](msg, svr, this);
			};
		}
		
		conn.send({cmd: 'handshake', serverName: this.name});
	};

	this.getPlayer = function(name) {
		for (var plr of this.players) {
			if (plr.username === name) {
				return plr;
			}
		}

		return null;
	};
	
	this.getChunk = function(x, y) {
		var key = x + ',' + y;
		return this.chunks[key] || (this.chunks[key] = new DustServerChunk(this, x, y, this.worldGenerator));
	};
	
	this.getBlock = function(x, y) {
		return this.getChunk(Math.floor(x / 128), Math.floor(y / 128)).blocks[(y & 127) + 128 * (x & 127)];
	};
	
	this.setBlock = function(x, y, blk) {
		var chunk = this.getChunk(Math.floor(x / 128), Math.floor(y / 128));
		var blocki = (y & 127) + 128 * (x & 127);
		chunk.blocks[blocki] = blk;
		this.players.forEach(function(plr) {
			if (plr.online) plr.conn.send({cmd: 'setBlock', chx: chunk.x, chy: chunk.y, ind: blocki, blk: blk});
		});
	};
	
	this.tick = function() {
		for (var i = this.entities.length - 1; i > -1; i--) {
			if (this.entities[i].tick(0.01)) {
				this.entities.splice(i, 1);
			}
		}
	};

	var me = this;

	this.cmdVars = {};
	this.runCommand = function(command) {
		const commands = {
			'/': {
				args: 1,
				func: function(args) {
					return args[0].run();
				}
			},
			'/setblock': {
				args: 3,
				func: function(args) {
					var x = args[0].run();
					var y = args[1].run();
					var b = args[2].run();

					if (isNaN(+x) || (+x) % 1 !== 0) {
						throw(x + " is not a valid integer.");
					}

					if (isNaN(+y) || (+y) % 1 !== 0) {
						throw(y + " is not a valid integer.");
					}

					if (b in DustDataBlocks) {
						b = DustDataBlocks[b];
					} else {
						throw(b + " is not a valid block");
					}

					x = +x;
					y = +y;

					me.setBlock(x, y, b.id);

					return "1 block updated.";
				}
			},
			'/tpc': {
				args: 3,
				func: function(args) {
					var p = args[0].run().split(',');
					var x = args[1].run();
					var y = args[2].run();

					if (isNaN(+x)) {
						throw(x + " is not a valid number.");
					}

					if (isNaN(+y)) {
						throw(y + " is not a valid number.");
					}

					x = +x;
					y = +y;

					p = p.map(x => {
						var plr = me.getPlayer(x);
						if (!plr) {
							throw(x + " is not a valid player.");
						}
						return plr;
					});

					for (var plr of p) {
						plr.x = x;
						plr.y = y;
					}

					return p.length + " player(s) moved."
				}
			}
		};

		function next() {
			if (command.length === 0) {
				throw("Not enough arguments passed to command.");
			}

			var cmd = command.splice(0, 1)[0];

			if (cmd.startsWith('/')) {
				if (cmd in commands) {
					var args = [];
					for (var i = 0; i < commands[cmd].args; i++) {
						args.push(next());
					}

					return {a: args, f: commands[cmd].func, run: function() {return this.f(this.a);}};
				} else throw(cmd + " is not a valid command.");
			} else if (cmd.startsWith('$')) {
				if (cmd.endsWith('=')) {
					return {run: function() {return me.cmdVars[cmd.substring(0, cmd.length-1)] = this.a.run()}, a: next()};
				} else {
					return {run: () => me.cmdVars[cmd] || ''};
				}
			} else {
				return {run: () => cmd};
			}
		}
		
		try {
			var root = next();
			if (command.length) {
				throw("Too many arguments passed to command");
			}

			return '[II] ' + root.run();
		} catch (e) {
			return '[EE] ' + e;
		}
	};
	
	setInterval(function() { me.tick(); }, 10);
};

self.DustServerChunk = function(svr, x, y, genf) {
	
	this.svr = svr;
	
	this.x = x;
	this.y = y;
	
	this.blocks = Array(16384).fill(DustDataBlocks.ERROR.id);
	
	if (genf) genf(this);
	
};

self.DustServerConnection = function() {
	
	this.toBeDeleted = false;
	
	this.player = null;
	
	this.disconnect = function(rs) {
		this.send({cmd: 'disconnect', reason: rs});
		this.toBeDeleted = true;
		this.player.online = false;
	};
};

self.DustServerPlayer = function(svr, name) {
	this.username = name;
	this.online = false;
	this.conn = null;
	this.svr = svr;
	
	this.connect = function(conn) {
		this.online = true;
		this.conn = conn;
	};
	
	this.keys = {
		left: false,
		right: false,
		jump: false,
		run: false
	};
	
	this.x = 0;
	this.y = -30;
	this.dx = 0;
	this.dy = 0;
	this.hcolwidth = 3;
	this.hcolheight = 7;
	
	this.jumppwr = 100;
	
	this.tick = function(dtime) {
		//DustServerPhysicsTickEntity(this, 0.01);
		
		var dxofs = (this.keys.left * -30 + this.keys.right * 30) * (1 + this.keys.run);
		
		var ix = Math.floor(this.x);
		var iy = Math.floor(this.y);
		
		this.dy += this.svr.gravity * dtime;
		
		var friction = 0;
		
		if (this.dy > 0) {
			var tsol = 0;
			var bounce = 0;
			
			for (var i = ix - this.hcolwidth; i <= ix + this.hcolwidth; i++) {
				var blk = DustDataBlocks[this.svr.getBlock(i, iy + this.hcolheight)];
				if (blk.physics === 'solid') {
					bounce += blk.bounciness || 0;
					friction += blk.friction || 1;
					tsol++;
				}
			}
			
			if (tsol) {
				this.dy *= bounce /- tsol;
				if (Math.abs(this.dy) < 1) this.dy = 0;
				
				if (this.keys.jump) this.dy -= this.jumppwr;
				
				friction /= tsol;
			}
		}
		
		if (this.dy < 0) {
			var tsol = 0;
			var bounce = 0;
			
			for (var i = ix - this.hcolwidth; i <= ix + this.hcolwidth; i++) {
				var blk = DustDataBlocks[this.svr.getBlock(i, iy - this.hcolheight)];
				if (blk.physics === 'solid') {
					bounce += blk.bounciness || 0;
					tsol++;
				}
			}
			
			if (tsol) {
				this.dy *= bounce /- tsol;
			}
		}
		
		if (friction > 1) friction = 1;
		
		if (friction < 0.7) friction = 0.7;

		this.dx = (this.dx - dxofs) * Math.pow(1 - friction, dtime) + dxofs;
		
		this.x += this.dx * dtime;
		this.y += this.dy * dtime;
		
		if (this.online) {
			this.conn.send({cmd: 'pan', x: ix, y: iy});
		}
	};
};

self.DustServerGeneratorEntity = function(x, y, svr, gen) {
	this.x = x;
	this.y = y;
	this.svr = svr;
	this.gen = gen;
	
	this.tick = function() {
		DustServerStructureGenerators[this.gen](this.svr, this.x, this.y);
		return true;
	};
}

self.DustServerGenerators = {
	flat0: function(chunk) {
		chunk.blocks.fill( chunk.y < 0 ? DustDataBlocks.air.id : DustDataBlocks.silicate_rock.id );
	},
	
	basic: function(chunk) {
		var f = 1e6, q = 20000;
		for (var x = 0; x < 128; x++) {
			var h = 0;
			var rx = x + 128 * chunk.x;
			h += (0.5 - chunk.svr.perlin1.noise(rx / (f >> 0), 42, 42)) * (q >> 0);
			h += (0.5 - chunk.svr.perlin2.noise(rx / (f >> 3), 42, 42)) * (q >> 2);
			h += (0.5 - chunk.svr.perlin3.noise(rx / (f >> 6), 42, 42)) * (q >> 4);
			h += (0.5 - chunk.svr.perlin4.noise(rx / (f >> 9), 42, 42)) * (q >> 6);
			h += (0.5 - chunk.svr.perlin5.noise(rx / (f >>12), 42, 42)) * (q >> 8);
			for (var y = 0; y < 128; y++) {
				var ry = y + 128 * chunk.y;
				
				chunk.blocks[128 * x + y] = (
					ry > h
					? (
						ry > h + 4
						? (
							(ry > h + 96 || Math.random() < 0.001)
							? DustDataBlocks.silicate_rock.id
							: DustDataBlocks.dirt.id
						)
						: (
							h > -32
							? DustDataBlocks.silica_sand.id
							: DustDataBlocks.grass.id
						)
					)
					: (
						ry > 0
						? DustDataBlocks.salt_water.id
						: DustDataBlocks.air.id
					)
				);
				
				if (1+(h|0) === ry) {
					if (h > 48 && h < 256 && Math.random() > 0.99) {
						chunk.svr.entities.push(new DustServerGeneratorEntity(rx, h, chunk.svr, 'gracilaria'));
					}
					
					if (h < -32 && Math.random() > 0.99 && Math.random() > 0.9) {
						chunk.svr.entities.push(new DustServerGeneratorEntity(rx, h, chunk.svr, 'bioluminescent_fungi'));
					}
				}
			}
		}
	}
};

self.DustServerStructureGenerators = {
	gracilaria: function(svr, x, y) {
		if (svr.getBlock(x, y)   !== DustDataBlocks.salt_water.id) return;
		if (svr.getBlock(x, y-1) !== DustDataBlocks.salt_water.id) return;
		svr.setBlock(x, y, DustDataBlocks.gracilaria.id);
		if (Math.random() < Math.max(y / 200, 0.1)) DustServerStructureGenerators.gracilaria(svr, x-1, y-1);
		if (Math.random() < Math.max(y / 400, 0.2)) DustServerStructureGenerators.gracilaria(svr, x,   y-1);
		if (Math.random() < Math.max(y / 200, 0.1)) DustServerStructureGenerators.gracilaria(svr, x+1, y-1);
	},
	
	bioluminescent_fungi: function(svr, x, y) {
		var height = 2 + (0|(Math.random() * 7));
		while (height--) {
			svr.setBlock(x, y--, DustDataBlocks.green_fungal_wall.id);
		}
		
		svr.setBlock(x-2, y, DustDataBlocks.green_fungal_wall.id);
		svr.setBlock(x-1, y, DustDataBlocks.green_fungal_wall.id);
		svr.setBlock(x,   y, DustDataBlocks.green_fungal_wall.id);
		svr.setBlock(x+1, y, DustDataBlocks.green_fungal_wall.id);
		svr.setBlock(x+2, y, DustDataBlocks.green_fungal_wall.id);
		
		svr.setBlock(x-2, y-1, DustDataBlocks.green_fungal_wall.id);
		svr.setBlock(x-1, y-1, DustDataBlocks.luciferin.id);
		svr.setBlock(x,   y-1, DustDataBlocks.luciferin.id);
		svr.setBlock(x+1, y-1, DustDataBlocks.luciferin.id);
		svr.setBlock(x+2, y-1, DustDataBlocks.green_fungal_wall.id);
		
		svr.setBlock(x-1, y-2, DustDataBlocks.green_fungal_wall.id);
		svr.setBlock(x,   y-2, DustDataBlocks.green_fungal_wall.id);
		svr.setBlock(x+1, y-2, DustDataBlocks.green_fungal_wall.id);
	}
};

/*
function DustServerPhysicsTickEntity(entity, time) {
	
	if (!entity.physics) return;
	
	entity.dy += 78 * time;
	
	var colofsx = 0;
	var colofsy = 0;
	var bounce = 0;
	var coltotal = 0;
	
	entity.dx -= entity.dxofs;
	entity.dy -= entity.dyofs;
	
	for (var i = (0|entity.x) - entity.hcolwidth; i < 1 + (0|entity.x) + entity.hcolwidth; i++) {
		for (var j = (0|entity.y) - entity.hcolheight; j < 1 + (0|entity.y) + entity.hcolheight; j++) {
			var block = DustDataBlocks[entity.svr.getBlock(i, j)];
			var phys = block.physics;
			if (phys === 'fluid') {
				entity.dy -= block.density * time;
			}
			if (phys === 'solid') {
				bounce += block.bounciness;
				coltotal++;
				colofsx += i - (0|entity.x);
				colofsy += j - (0|entity.y);
			}
		}
	}
	
	if (coltotal) {
		bounce /= coltotal;
		
		var normal = Math.atan2(colofsx, colofsy);
		var entang = Math.atan2(entity.dx, entity.dy);
		var nentan = 2 * normal - entang;
		var entvel = Math.sqrt(entity.dx * entity.dx + entity.dy * entity.dy);
		entity.dx = -Math.sin(nentan) * entvel * bounce;
		entity.dy = -Math.cos(nentan) * entvel * bounce;
	}
	
	entity.dx += entity.dxofs;
	entity.dy += entity.dyofs;
	
	entity.x += entity.dx * time;
	entity.y += entity.dy * time;
}
*/
