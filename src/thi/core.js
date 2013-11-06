goog.provide('thi.ng.resonate.Logo');

goog.require('goog.array');
goog.require('goog.object');

goog.require('thi.ng.events.DragController');
goog.require('thi.ng.events.TouchState');
goog.require('thi.ng.geom.common');
goog.require('thi.ng.geom.path');
goog.require('thi.ng.math.core');
goog.require('thi.ng.viz');

/**
 * @constructor
 * @param {Object} config
 */
thi.ng.resonate.Logo = function(config) {
	this.conf = {};
	goog.object.extend(this.conf, thi.ng.resonate.Logo.config, config);
	var pdom = this.conf['parent'];
	this.parentDOM = goog.isString(pdom) ? document.getElementById(pdom) : pdom;
	/** @type {HTMLCanvasElement} */
	this.canv = null;
	this.resetCanvas(this.conf['width'], this.conf['height']);
	var letterConf = this.conf['letters'][this.conf['letter']];
	this.initPaths(letterConf);
	this.initPhysics(letterConf);
	this.initAttractors();
	this.initEventHandlers();
	// this.start();
};

thi.ng.resonate.Logo.prototype = {
	update : function() {
		this.physics.update();
		this.updateAttractors();
	},

	updateAttractors : function() {
		goog.array.forEach(this.attractors, function(a) {
			a.update();
		});
	},

	draw : function() {
		// var t0 = new Date().getTime();
		this.canv.width = this.canv.width;
		var ctx = this.ctx;
		var w = this.canv.width;
		var h = this.canv.height;
		var scale = h * 0.8;
		ctx.save();
		ctx.setTransform(scale, 0, 0, scale, w / 2, h / 2);
		ctx.lineCap = 'round';
		ctx.strokeStyle = this.conf['color'];
		// this.drawPoints(this.strings, 3, scale);
		this.drawStrings(this.strings, scale);
		// this.drawAttractors(this.physics.behaviors);
		// this.drawAttractors(goog.array.map(this.attractors, function(a) {
		// return a.attractor;
		// }));
		ctx.restore();
		// ctx.fillText((new Date().getTime() - t0) + 'ms', 10, h - 10);
	},

	/**
	 * @param {Array.<thi.ng.physics.ParticleString2>} strings
	 * @param {number} ps
	 * @param {number} scale
	 */
	drawPoints : function(strings, ps, scale) {
		var ctx = this.ctx;
		ps /= scale;
		var ps2 = ps * 0.5;
		ctx.lineWidth = 1 / scale;
		goog.array.forEach(strings, function(s) {
			goog.array.forEach(s.particles, function(p) {
				ctx.strokeRect(p.pos.x - ps2, p.pos.y - ps2, ps, ps);
			});
		});
	},

	/**
	 * @param {Array.<thi.ng.physics.ParticleString2>} strings
	 * @param {number} scale
	 */
	drawStrings : function(strings, scale) {
		var ctx = this.ctx;
		var base = this.baseSplines;
		var contours = this.conf['contours'];
		var nc = contours.length - 1;
		scale *= this.conf['refH'] / this.canv.height;
		goog.array.forEach(this.stringsToSplinePoints(strings), function(s, i) {
			goog.array.forEach(contours, function(c, t) {
				ctx.lineWidth = c / scale;
				thi.ng.viz.drawTweenedSpline(ctx, base[i], s, thi.ng.math.core.mix(
						0.2, 1.0, t / nc));
			});
		});
	},

	/**
	 * @param {Array.<thi.ng.physics.AttractionBehavior2>} attractors
	 */
	drawAttractors : function(attractors) {
		var ctx = this.ctx;
		var TWO_PI = Math.PI * 2;
		goog.array.forEach(attractors, function(a) {
			ctx.beginPath();
			ctx.arc(a.pos.x, a.pos.y, a.radius, 0, TWO_PI, false);
			ctx.stroke();
		});
	},

	start : function() {
		this.runner = setInterval(goog.bind(function() {
			this.update();
			this.draw();
		}, this), 16);
	},

	stop : function() {
		clearInterval(this.runner);
	},

	/**
	 * @param {number} width
	 * @param {number} height
	 */
	resetCanvas : function(width, height) {
		if (goog.isNull(this.canv)) {
			this.canv = document.createElement('canvas');
			this.ctx = this.canv.getContext('2d');
			this.parentDOM.appendChild(this.canv);
		}
		this.canv.width = width;
		this.canv.height = height;
	},

	/**
	 * @param {thi.ng.resonate.Logo.LetterConfig} lconf
	 */
	initPaths : function(lconf) {
		var udist = this.conf['udist'];
		var paths = goog.array.reduce(lconf.paths, function(acc, svg) {
			return acc.concat(thi.ng.geom.path.newFromSVG(svg).sampleWithRes(8));
		}, []);
		paths = goog.array.map(paths, function(path) {
			return new thi.ng.geom.LineStrip2(path).sampleUniform(udist, true);
		});
		var norm = thi.ng.geom.common.normalizedHeightMetrics(goog.array.reduce(
				paths, function(acc, path) {
					return acc.concat(path);
				}, []));
		var c = norm[0].invert();
		var scl = norm[1];
		goog.array.forEach(paths, function(path) {
			thi.ng.geom.common.transScale(path, c, scl);
		});
		this.paths = paths;
	},

	/**
	 * @param {thi.ng.resonate.Logo.LetterConfig} lconf
	 */
	initPhysics : function(lconf) {
		var c = this.conf;
		var strength = c['springStrength'];
		var paRadius = c['paRadius'];
		var paStrength = c['paStrength'];
		var pullStr = c['pullStrength'];
		var pullStrAlt = c['pullStrEnds'];
		var physics = new thi.ng.physics.Physics2(c['timeStep'], c['springIter'], c['drag']);
		var ctx = this;
		var strings = goog.array.reduce(this.paths,
		/**
		 * @param {Array.<thi.ng.physics.ParticleString2>} acc
		 * @param {Array.<thi.ng.geom.Vec2>} path
		 * @param {number} i
		 * @return {Array.<thi.ng.physics.ParticleString2>}
		 */
		function(acc, path, i) {
			var conn = null;
			if (goog.isArray(lconf.conns)) {
				conn = lconf.conns[i];
			}
			var pstr = new thi.ng.physics.ParticleString2(path, strength);
			acc.push(pstr);
			if (goog.isDefAndNotNull(conn)) {
				ctx.connectString(acc, pstr, conn.start, strength, true);
				ctx.connectString(acc, pstr, conn.end, strength, false);
			}
			return acc;
		}, []);
		goog.array
				.forEach(
						strings,
						function(str) {
							physics.addParticles(str.particles);
							physics.springs = physics.springs
									.concat(str.springs);
							var np = str.particles.length - 1;
							goog.array
									.forEach(
											str.particles,
											function(p, i) {
												var pbStr = (i == 0 || i == np) ? pullStrAlt
														: pullStr;
												physics
														.addBehavior(new thi.ng.physics.AttractionBehavior2(p.pos, paRadius, paStrength));
												physics
														.addSpring(new thi.ng.physics.PullbackSpring2(p.origPos, p, pbStr));
											});
						});
		this.baseSplines = this.stringsToSplinePoints(strings);
		this.strings = strings;
		this.physics = physics;
	},

	/**
	 * @param {Array.<thi.ng.physics.ParticleString2>} strings
	 * @return {Array}
	 */
	stringsToSplinePoints : function(strings) {
		return goog.array.map(strings, function(s) {
			var points = goog.array.map(s.particles, function(p) {
				return p.pos.copy();
			});
			return new thi.ng.geom.Bezier2(points).autoSpline();
		});
	},

	initAttractors : function() {
		this.attractors = [];
		for (var i = 0; i < 3; i++) {
			var pos = thi.ng.geom.Vec2.random(0.5);
			var dir = thi.ng.geom.Vec2.random(thi.ng.math.core
					.random(0.005, 0.0125));
			var r = thi.ng.math.core.random(0.1, 0.2);
			var strength = -thi.ng.math.core.random(0.015, 0.0175);
			var att = new thi.ng.resonate.Logo.Attractor(pos, dir, r, strength);
			this.attractors.push(att);
			this.physics.addBehavior(att.attractor);
		}
	},

	/**
	 * @param {Array.<thi.ng.physics.ParticleString2>} strings
	 * @param {thi.ng.physics.ParticleString2} curr
	 * @param {Array.<number>} conn
	 * @param {number} strength
	 * @param {boolean} isFirst
	 */
	connectString : function(strings, curr, conn, strength, isFirst) {
		var p, q, d, sp;
		if (goog.isArray(conn)) {
			p = curr.particles[isFirst ? 0 : curr.particles.length - 1];
			sp = strings[conn[0]].particles;
			q = this.findClosestParticle(sp, p, conn[1] || 0, conn[2] || 1);
			d = p.pos.dist(q.pos);
			curr.springs.push(new thi.ng.physics.Spring2(p, q, d, strength));
			if (isFirst) {
				goog.array.insertAt(curr.particles, q, 0);
			} else {
				curr.particles.push(q);
			}
		}
	},

	findClosestParticle : function(particles, p, from, to) {
		var np = particles.length - 1;
		var closest = goog.array.reduce(particles.slice(~~(from * np),
				~~(to * np)), function(acc, q) {
			var d = p.pos.distSquared(q.pos);
			if (d < acc[1]) {
				return [ q, d ];
			} else {
				return acc;
			}
		}, [ null, 1e6 ]);
		return closest[0];
	},

	initEventHandlers : function() {
		var ctx = this;
		this.ixd = new thi.ng.events.DragController(this.canv, {
			down : goog.bind(ctx.overrideAttractors, ctx),
			drag : goog.bind(ctx.overrideAttractors, ctx),
			up : goog.bind(ctx.releaseAttractors, ctx)
		});
	},

	/**
	 * @param {Array.<thi.ng.events.TouchState>} touches
	 */
	overrideAttractors : function(touches) {
		// window.console.log(touches);
		var attractors = this.attractors;
		var offset = new thi.ng.geom.Vec2(-0.5, -0.5);
		goog.array.forEach(touches, function(t) {
			var a = attractors[t.id];
			if (goog.isDef(a)) {
				a.isLocked = true;
				a.attractor.pos.setV(t.pos.addV(offset));
			}
		});
	},

	/**
	 * @param {Array.<thi.ng.events.TouchState>} touches
	 */
	releaseAttractors : function(touches) {
		var attractors = this.attractors;
		goog.array.forEach(touches, function(t) {
			var a = attractors[t.id];
			if (goog.isDef(a)) {
				a.isLocked = false;
			}
		});
	}
};

/**
 * @constructor
 * @param {thi.ng.geom.Vec2} pos
 * @param {thi.ng.geom.Vec2} dir
 * @param {number} r
 * @param {number} str
 */
thi.ng.resonate.Logo.Attractor = function(pos, dir, r, str) {
	var p = new thi.ng.geom.Vec2(pos.x, pos.y);
	this.attractor = new thi.ng.physics.AttractionBehavior2(p, r, str);
	this.dir = dir;
	this.isLocked = false;
};

thi.ng.resonate.Logo.Attractor.prototype = {
	update : function() {
		if (!this.isLocked) {
			var p = this.attractor.pos;
			p.addV(this.dir);
			if (p.x < -1)
				p.x += 2;
			else if (p.x > 1)
				p.x -= 2;
			if (p.y < -1)
				p.y += 2;
			else if (p.y > 1)
				p.y -= 2;
		}
	}
};

/**
 * @constructor
 * @param {Array.<number>|null} start
 * @param {Array.<number>|null} end
 */
thi.ng.resonate.Logo.PathConnection = function(start, end) {
	this.start = start;
	this.end = end;
};

/**
 * @constructor
 * @param {Array} paths
 * @param {Array.<thi.ng.resonate.Logo.PathConnection>|null} conns
 */
thi.ng.resonate.Logo.LetterConfig = function(paths, conns) {
	this.paths = paths;
	this.conns = conns;
};

thi.ng.resonate.Logo.config = {
	'width' : 640,
	'height' : 480,
	'udist' : 7.5,
	'letter' : 'R',
	'timeStep' : 1,
	'springIter' : 50,
	'drag' : 0.01,
	'paRadius' : 0.025,
	'paStrength' : -0.0125,
	'pullStrength' : 0.00025,
	'pullStrEnds' : 0.015,
	'contours' : [ 6, 1, 2, 3, 1, 2 ],
	'refH' : 400,
	'color' : '#fff',
	'letters' : {
		'R' : new thi.ng.resonate.Logo.LetterConfig([
				'M132.88874,623.69965L132.88874,578.08046L132.88874,525.08046L149.73025,525.08046C183.66463,525.08046 180.56445,554.65784 180.56445,554.65784C180.56445,554.65784 179.93604,575.92517 156.51712,578.75799C148.45426,579.42462 145.94614,578.99966 137.85498,578.99966',
				'M157.15246,580.01633L181.98886,623.69965' ], [
				new thi.ng.resonate.Logo.PathConnection(null, [ 0, 0, 0.5 ]),
				new thi.ng.resonate.Logo.PathConnection([ 0 ], null) ]),
		'E' : new thi.ng.resonate.Logo.LetterConfig([
				'M246.49215,525.08046L203.60632,525.08046L203.60632,621.57128L247.33004,621.73886',
				'M242.81939,572.75618L205.87697,572.75618' ], [ null,
				new thi.ng.resonate.Logo.PathConnection(null, [ 0 ]) ]),
		'S' : new thi.ng.resonate.Logo.LetterConfig([ 'M259.30502,611.98838C264.73516,617.28277 271.52287,622.65843 280.48261,622.65843C293.92223,622.65843 305.85469,612.88415 305.85469,601.20933C305.85469,589.53452 298.80935,580.90423 282.51982,571.26839C266.2303,561.63254 262.78193,556.95891 262.78193,545.28409C262.78193,533.60928 271.11743,523.835 284.55704,523.835C293.51678,523.835 300.30449,527.77187 305.73463,533.06625' ], null),
		'O' : new thi.ng.resonate.Logo.LetterConfig([ 'M324.03382,572.7091C324.03382,542.30406 337.34547,523.74677 353.94375,523.74677C370.54203,523.74677 383.76989,543.06118 383.76989,573.46622C383.76989,603.87125 370.69292,623.03477 353.94375,623.03477C337.34547,623.03477 324.03382,604.19953 324.03382,573.7945' ], [ new thi.ng.resonate.Logo.PathConnection(null, [
				0, 0, 0.1 ]) ]),
		'N' : new thi.ng.resonate.Logo.LetterConfig([ 'M406.45855,621.69363L406.45855,525.08046L458.3237,621.69363L458.3237,525.08046' ], null),
		'A' : new thi.ng.resonate.Logo.LetterConfig([
				'M479.02676,621.69363L509.06148,525.08046L538.91635,621.69363',
				'M489.4406,592.1296L528.50251,592.1296' ], [
				null,
				new thi.ng.resonate.Logo.PathConnection([ 0, 0, 0.5 ], [ 0, 0.5,
						1 ]) ]),
		'T' : new thi.ng.resonate.Logo.LetterConfig([
				'M540.9846,525.08046L591.52206,525.08046',
				'M566.16341,526.32202L566.16341,621.69363' ], [ null,
				new thi.ng.resonate.Logo.PathConnection([ 0 ], null) ])
	}
};

/**
 * @export
 * @param {Object} config
 */
thi.ng.resonate.Logo.newInstance = function(config) {
	var logo = new thi.ng.resonate.Logo(config);
	return {
		'update' : goog.bind(logo.update, logo),
		'draw' : goog.bind(logo.draw, logo),
		'resize' : goog.bind(logo.resetCanvas, logo)
	// 'instance' : logo
	};
};
