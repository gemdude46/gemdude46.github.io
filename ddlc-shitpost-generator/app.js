'use strict';

function gebi(i) {
	return document.getElementById(i);
}

var loaded = false;

var sd, sd_ctx;

var ui;

var dialog = `I made a shitty web clone of u/SemenMosaic's "dumb little dialog
generator thing" so it can be used on devices to which the main
version is not ported to. If you can use the original, do it, it's better.`;

var loading_interval;

function reset_cvs() {
	sd.width = sd.offsetWidth; sd.height = sd.offsetHeight;
	ui.style.top = sd.offsetTop + 'px';
	ui.style.left = sd.offsetLeft + 'px';
	ui.style.width = sd.width + 'px';
	ui.style.height = sd.height + 'px';
	render();
}

function swapNext(list, ind) {
	if (ind < 0) return;

	const tmp = list.splice(ind, 1)[0];
	list.splice(ind+1, 0, tmp);
}

addEventListener('resize', reset_cvs);

addEventListener('keypress', e => {
	if (e.keyCode === 27) {
		close_guis();
	}
});

addEventListener('DOMContentLoaded', () => {
	
	ui = gebi('ui');

	sd = gebi('scaled_display');
	sd_ctx = sd.getContext('2d');
	
	reset_cvs();

	loading_interval = setInterval(() => {
		sd_ctx.font = '30px monospace';
		sd_ctx.textAlign = 'center';
		sd_ctx.fillStyle = 'black';

		sd_ctx.fillText('Loading...', sd.offsetWidth >> 1, sd.offsetHeight >> 1);
	}, 256);
});

const fs = document.createElement('canvas');

fs.width = 1280;
fs.height = 720;

const fs_ctx = fs.getContext('2d');

function drawText(text, x, y, align, w, col, ocol, font) {
	
	w = w || 1;
	col = col || 'white';
	ocol = ocol || '#533643';
	font = font || '20px aller';

	fs_ctx.fillStyle = col;
	fs_ctx.strokeStyle = ocol;
	fs_ctx.lineWidth = 2*w;
	fs_ctx.textAlign = align;
	fs_ctx.font = font;
	fs_ctx.lineJoin = 'round';

	fs_ctx.strokeText(text, x, y);
	fs_ctx.fillText(text, x, y);
}

class Background {
	
	constructor(element) {
		this.el = element;
		this.tab = element.getAttribute('tab');
		this.name = element.getAttribute('alt');
	}

	icon() {
		const img = document.createElement('img');
		img.src = this.el.src;
		img.style.width = '128px';
		img.style.float = 'left';
		img.style['margin-right'] = '1em';

		const el = document.createElement('div');
		el.style['background-color'] = (this === background) ? 'white' : 'transparent';
		el.style.color = '#555';
		el.style['font-size'] = '16pt';
		el.style.height = '72px';
		el.style.padding = '5px';
		el.style.cursor = 'pointer';
		el.setAttribute('title', this.name);

		el.appendChild(img);
		el.appendChild(document.createTextNode(this.name));

		const me = this;
		el.addEventListener('click', () => {
			background = me;
			render();
			close_guis();
		});

		return el;
	}

};

const backgrounds = [];

var background;

const girl_positions = [null, 208, 256, 500, 640, 790, 1024, 1094];

const poses = {
	sayori: {
		left: [],
		right: [],
		head: []
	},
	yuri: {
		left: [],
		right: [],
		head: []
	},
	natsuki: {
		left: [],
		right: [],
		head: []
	},
	monika: {
		left: [],
		right: [],
		head: []
	}
};

class Girl {
	
	constructor(name) {
		this.name = name;
		this.pose = {
			left: 0,
			right: 0,
			head: 0
		};
		this.pos = 4;
		this.infont = false;
		this.close = false;
	}

	render() {
		const left = poses[this.name].left[this.pose.left];
		const right = poses[this.name].right[this.pose.right];
		const head = poses[this.name].head[this.pose.head];
		const size = this.close ? 720*2 : 720;
		const x = girl_positions[this.pos] - (size >> 1);
		const y = this.close ? -100 : 0;

		fs_ctx.drawImage(head, x, y + (this.name === 'monika' ? 1 : 0), size, size);
		fs_ctx.drawImage(left, x, y, size, size);
		fs_ctx.drawImage(right, x, y, size, size);

		if (this === sel_girl) {
			fs_ctx.beginPath();
			fs_ctx.rect(x + size/3, 50, size/3, 620);
			fs_ctx.strokeStyle = 'red';
			fs_ctx.lineWidth = 3;
			fs_ctx.stroke();
		}
	}

	headl() { if (this.pose.head-- === 0) this.pose.head = poses[this.name].head.length - 1; render(); }
	headr() { if (++this.pose.head === poses[this.name].head.length) this.pose.head = 0; render(); }
	leftl() { if (this.pose.left-- === 0) this.pose.left = poses[this.name].left.length - 1; render(); }
	leftr() { if (++this.pose.left === poses[this.name].left.length) this.pose.left = 0; render(); }
	rightl() { if (this.pose.right-- === 0) this.pose.right = poses[this.name].right.length - 1; render(); }
	rightr() { if (++this.pose.right === poses[this.name].right.length) this.pose.right = 0; render(); }
};

const girls = [];

var sel_girl;

function select_girl(girl) {
	sel_girl = girl;

	const g_opt = gebi('g_opt');
	if (g_opt) ui.removeChild(g_opt);

	if (girl) {
		const el = document.createElement('div');
		el.id = 'g_opt';
		el.className = 'gui';
		el.style.float = girl.pos > 4 ? 'left' : 'right';
		el.innerHTML = `
			<h1>${girl.name.charAt(0).toUpperCase()}${girl.name.substring(1)}</h1>
			<fieldset>
				<legend>Pose:</legend>
				<table>
					<tbody>
						<tr>
							<td>
								<button onclick="sel_girl.headl()">&lt;</button>
							</td>
							<td>
								Head
							</td>
							<td>
								<button onclick="sel_girl.headr()">&gt;</button>
							</td>
						</tr>
						${girl.name === 'yuri' ? '<!--' : ''}
						<tr>
							<td>
								<button onclick="sel_girl.leftl()">&lt;</button>
							</td>
							<td>
								Left
							</td>
							<td>
								<button onclick="sel_girl.leftr()">&gt;</button>
							</td>
						</tr>
						<tr>
							<td>
								<button onclick="sel_girl.rightl()">&lt;</button>
							</td>
							<td>
								Right
							</td>
							<td>
								<button onclick="sel_girl.rightr()">&gt;</button>
							</td>
						</tr>
						${girl.name === 'yuri' ? '-->' : '<!--'}
						<tr>
							<td>
								<button onclick="sel_girl.leftl();sel_girl.rightl();">&lt;</button>
							</td>
							<td>
								Body
							</td>
							<td>
								<button onclick="sel_girl.leftr();sel_girl.rightr();">&gt;</button>
							</td>
						</tr>
						${girl.name === 'yuri' ? '' : '-->'}
					</tbody>
				</table>
			</fieldset><br>
			<fieldset>
				<legend>Position:</legend>
				<button onclick="(sel_girl.pos=Math.max(1, sel_girl.pos-1))<4&&(gebi('g_opt').style.float='right');render();">
					&lt; left</button>
				<button onclick="(sel_girl.pos=Math.min(7, sel_girl.pos+1))>4&&(gebi('g_opt').style.float='left');render();">
					&gt; right</button>
			</fieldset><br>
			<fieldset id=layerfs>
				<legend>Layer:</legend>
				<button onclick="girls.splice(girls.indexOf(sel_girl), 1);girls.splice(0, 0, sel_girl);render();" \
					title="Move to back">&#10515;</button>
				<button onclick="swapNext(girls, girls.indexOf(sel_girl)-1);render();" title="Move backwards">&#8595;</button>
				<button onclick="swapNext(girls, girls.indexOf(sel_girl));render();" title="Move forwards">&#8593;</button>
				<button onclick="girls.splice(girls.indexOf(sel_girl), 1);girls.push(sel_girl);render()" \
					title="Move to front">&#10514;</button>
			</fieldset><br>
			<input ${girl.infront ? 'checked' : ''} onchange="sel_girl.infront=this.checked;render();" type=checkbox>
				In front of textbox?<br>
			<input ${girl.close ? 'checked' : ''}   onchange="sel_girl.close=this.checked;render();" type=checkbox>
				Close up?
			
			<br><br><br><button onclick="girls.splice(girls.indexOf(sel_girl), 1);select_girl(null);">Delete</button><br><br>
		`;

		ui.appendChild(el);
	}

	render();

	return girl;
}

function girl_at(x) {
	for (let i = girls.length - 1; i >= 0; i--) {
		if (Math.abs(girl_positions[girls[i].pos] - x) < 120) {
			return girls[i];
		}
	}

	return null;
}

var custom_name = '';

var tbimg, tbimg_corrupt, nbimg;

addEventListener('load', () => {
	clearInterval(loading_interval);

	for (const el of gebi('assets').children) {
		const type = el.getAttribute('what');

		if (type === 'bg') {
			backgrounds.push(new Background(el));
		}
		
		if (type === 'pose') {
			poses[el.getAttribute('girl')][el.getAttribute('part')].push(el);
		}
	}

	tbimg = gebi('tbimg');
	tbimg_corrupt = gebi('tbimg_corrupt');
	nbimg = gebi('namebox');

	background = backgrounds[0];

	loaded = true;

	ui.style.display = 'block';

	drawText('Starting...', sd.offsetWidth >> 1, sd.offsetHeight >> 1, 'center', 5, 'white', '#b59', '32px riffic');

	setTimeout(render, 16);

	ui.addEventListener('click', e => {
		if (e.target === ui) {
			close_guis();
		
			const rx = e.clientX - sd.offsetLeft, ry = e.clientY - sd.offsetTop;
			const sx = rx / sd.width * 1280, sy = ry / sd.width * 720;

			const girl = (sy > 50 && sy < 550) ? girl_at(sx) : null;
		
			select_girl(girl);
		}
	});

	setInterval(() => {
		let tb;

		if (tb = document.querySelector('#ted > textarea')) {
			tb.style.height = (tb.parentNode.offsetHeight - tb.offsetTop - 48) + 'px';
		}
	}, 64);
});

function render() {
	
	if (!loaded) return;

	render_bg();

	for (const girl of girls) {
		if (!girl.infront) girl.render();
	}

	render_textbox();

	for (const girl of girls) {
		if (girl.infront) girl.render();
	}

	display();
}

function render_bg() {
	fs_ctx.drawImage(background.el, 0, 0);
}

function render_textbox() {
	if (gebi('tbvis').checked) {
		if (gebi('tbcor').checked) {
			fs_ctx.drawImage(tbimg_corrupt, 190, 565);
		} else {
			fs_ctx.drawImage(tbimg, 232, 565);
		}

		let name;
		if (name = gebi('talking').value) {
			fs_ctx.drawImage(nbimg, 264, 565-39);
			drawText(name === 'other' ? custom_name : name, 264+84, 565-10, 'center', 3, 'white', '#b59', '24px riffic');
		}

		render_text();

		if (gebi('ctvis').checked) {
			fs_ctx.font = '13px aller';
			fs_ctx.fillStyle = gebi('skipa').checked ? '#522' : '#a66';
			fs_ctx.textAlign = 'left';
			
			fs_ctx.fillText('Skip', 566, 700);

			fs_ctx.fillStyle = '#522';
			
			fs_ctx.fillText('History', 512, 700);
			fs_ctx.fillText('Auto   Save   Load   Settings', 600, 700);
		}

		if (gebi('conta').checked) {
			fs_ctx.drawImage(gebi('contarr'), 1020, 685);
		}
	}
}

function render_text() {
	let text = [];
	
	let b = false;

	for (const line of dialog.split('\n')) {
		let cl;
		text.push(cl = []);
		for (const l of line) {
			if (l === '[') b = true;
			else if (l === ']') b = false;
			else cl.push({l:l, b:b});
		}
	}

	let y = 620;
	for (const line of text) {
		let f = false;
		if (line.length) {
			let x = 270;
			let i = 0;
			while (i < line.length) {
				let ct = '';
				let cb = line[i].b;

				f = f || cb;

				while (i < line.length && line[i].b == cb) {
					ct += line[i].l;
					if (cb) ct += ' ';
					i++;
				}

				drawText(ct, x, y, 'left', cb ? 8 : 2, '#fff', cb ? '#000' : '#523140', '24px aller');
				x += fs_ctx.measureText(ct).width;
			}
		}
		y += 26;
	}
}

function display() {
	sd_ctx.drawImage(fs, 0, 0, sd.width, sd.height);
}

function guis_open() {
	return !!document.querySelector('.gui');
}

function close_guis() {
	for (const gui of document.querySelectorAll('.gui')) {
		gui.parentNode.removeChild(gui);
	}

	select_girl(null);
}

function choose_bg() {

	if (guis_open()) {
		return;
	}

	const bg_sel = document.createElement('div');
	bg_sel.id = 'bg_sel';
	bg_sel.className = 'gui';

	for (const bg of backgrounds) {
		bg_sel.appendChild(bg.icon());
	}

	document.body.appendChild(bg_sel);
}

function edit_text() {
	
	if (guis_open()) {
		return;
	}

	const ted = document.createElement('div');
	ted.id = 'ted';
	ted.className = 'gui';

	ted.appendChild(document.createTextNode('Edit text:'))
	ted.appendChild(document.createElement('br'));
	ted.appendChild(document.createElement('br'));
	ted.appendChild(document.createTextNode('Use square brackets - [ and ] - to create bold text.'));
	ted.appendChild(document.createElement('br'));
	ted.appendChild(document.createElement('br'));
	ted.appendChild(document.createTextNode('Like this:'));
	ted.appendChild(document.createElement('br'));

	const code = document.createElement('code');
	code.appendChild(document.createTextNode('["fucking'));
	code.appendChild(document.createElement('br'));
	code.appendChild(document.createTextNode('monikammmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"]'));

	ted.appendChild(code);
	ted.appendChild(document.createElement('br'));
	ted.appendChild(document.createElement('br'));

	const box = document.createElement('textarea');
	box.value = dialog;

	ted.appendChild(box);

	const btn = document.createElement('div');
	btn.className = 'btn';
	btn.appendChild(document.createTextNode('Update textbox'));
	
	btn.addEventListener('click', () => {
		dialog = box.value;
		render();
		close_guis();
	});

	ted.appendChild(btn);

	document.body.appendChild(ted);
}

var prev_name = '';

function set_name() {
	if (gebi('talking').value === 'other') {
		custom_name = prompt('Enter name:');
		if (!custom_name) {
			gebi('talking').value = prev_name;
		}
	}

	prev_name = gebi('talking').value;

	render();
}

function add_girl() {
	
	if (guis_open()) {
		return;
	}

	const girl_sel = document.createElement('div');
	girl_sel.id = 'girl_sel';
	girl_sel.className = 'gui';

	const chibis = document.createElement('img');
	chibis.src = 'assets/chibi.png';
	chibis.style.cursor = 'pointer';

	chibis.addEventListener('click', e => {
		const cx = e.clientX - girl_sel.offsetLeft;
		const girl = cx < 123 ? 'sayori' : cx < 247 ? 'yuri' : cx < 370 ? 'monika' : 'natsuki';
		girls.push(new Girl(girl));
		render();
		close_guis();
	});

	girl_sel.appendChild(chibis);

	document.body.appendChild(girl_sel);
}

function downloadURI(uri, name) {
	const link = document.createElement("a");
	link.download = name;
	link.href = uri;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function download() {
	select_girl(null);
	render();
	downloadURI(fs.toDataURL(), 'shitpost.png');
}

function hsui() {
	if (gebi('hsui').innerHTML.charAt(0) === 'S') {
		ui.style.display = 'block';
		gebi('hsui').innerHTML = 'Hide UI';
	} else {
		ui.style.display = 'none';
		gebi('hsui').innerHTML = 'Show UI';
	}
}
