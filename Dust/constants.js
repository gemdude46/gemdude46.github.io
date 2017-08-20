self.DustDataBlocks = {
	
	air: {
		id: 0,
		render: 'none',
		physics: 'fluid',
		density: 0.00123
	},
	
	silicate_rock: {
		id: 1,
		color: [187, 187, 187],
		render: 'normal',
		variation: 7,
		physics: 'solid',
		bounciness: 0.05,
		friction: 0.9999
	},
	
	dirt: {
		id: 2,
		color: [87,59,12],
		render: 'normal',
		variation: 16,
		physics: 'solid',
		bounciness: 0.1,
		friction: 1
	},
	
	grass: {
		id: 3,
		color: [0,123,12],
		render: 'normal',
		variation: 10,
		physics: 'solid',
		bounciness: 0.3,
		friction: 1
	},
	
	silica_sand: {
		id: 4,
		color: [255,236,172],
		render: 'normal',
		variation: 3,
		physics: 'solid',
		bounciness: 0,
		friction: 1
	},
	
	salt_water: {
		id: 5,
		color: [0,48,80],
		render: 'fluid',
		physics: 'fluid',
		density: 0.9
	},
	
	gracilaria: {
		id: 100,
		color: [224,68,17],
		render: 'normal',
		variation: 12
	},
	
	green_fungal_wall: {
		id: 101,
		color: [40,80,40],
		render: 'normal',
		variation: 4
	},
	
	sun_stone: {
		id: 102,
		color: [255,255,222],
		render: 'normal',
		light: 1
	},
	
	luciferin: {
		id: 1000,
		color: [80,255,80],
		render: 'normal',
		light: 0.025
	},
	
	ERROR: {
		id: 65535,
		color: [150,0,150],
		render: 'normal'
	}
};

!function() {
	var blocks = [];
	for (var block in DustDataBlocks) {
		blocks.push(DustDataBlocks[block]);
	}
	for (var i = 0; i < blocks.length; i++) {
		DustDataBlocks[blocks[i].id] = blocks[i];
	}
}();
