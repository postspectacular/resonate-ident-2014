goog.provide('thi.ng.physics.AttractionBehavior2');
goog.provide('thi.ng.physics.Particle2');
goog.provide('thi.ng.physics.Physics2');
goog.provide('thi.ng.physics.Spring2');

goog.require('goog.array');
goog.require('thi.ng.geom.Vec2');

thi.ng.physics.TEMP = new thi.ng.geom.Vec2();

/**
 * @interface
 */
thi.ng.physics.IParticle = function() {
};

thi.ng.physics.IParticle.prototype = {
	/**
	 * @param {thi.ng.geom.IVec} f
	 * @return {thi.ng.physics.IParticle}
	 */
	addForce : function(f) {
	},
	/**
	 * @return {thi.ng.physics.IParticle}
	 */
	applyForce : function() {
	},
	/**
	 * @param {number} s
	 * @return {thi.ng.physics.IParticle}
	 */
	scaleVelocity : function(s) {
	}
};

/**
 * @interface
 */
thi.ng.physics.IParticleBehavior = function() {
};

thi.ng.physics.IParticleBehavior.prototype = {
	/**
	 * @param {thi.ng.physics.IParticle} p
	 */
	applyBehavior : function(p) {
	}
};

/**
 * @interface
 */
thi.ng.physics.IParticleSpring = function() {
};

thi.ng.physics.IParticleSpring.prototype.relax = function() {
};

/**
 * @constructor
 * @implements thi.ng.physics.IParticle
 * @param {number} x
 * @param {number} y
 * @param {number=} mass
 * @param {boolean=} locked
 */
thi.ng.physics.Particle2 = function(x, y, mass, locked) {
	this.pos = new thi.ng.geom.Vec2(x, y);
	this.origPos = this.pos.copy();
	this.prev = this.pos.copy();
	this.force = new thi.ng.geom.Vec2();
	this.mass = mass || 1.0;
	this.invMass = 1.0 / this.mass;
	this.isLocked = locked || false;
};

thi.ng.physics.Particle2.prototype = {

	/**
	 * @return {thi.ng.physics.Particle2}
	 */
	copy : function() {
		return new thi.ng.physics.Particle2(this.pos.x, this.pos.y, this.mass, this.isLocked);
	},

	addForce : function(f) {
		this.force.addV(f);
		return this;
	},

	applyForce : function() {
		thi.ng.physics.TEMP.setV(this.pos);
		this.pos.subV(this.prev).madd(this.force, this.mass).addV(
				thi.ng.physics.TEMP);
		this.prev.setV(thi.ng.physics.TEMP);
		this.force.set(0, 0);
		return this;
	},

	scaleVelocity : function(drag) {
		this.prev.mix(this.pos, drag);
		return this;
	}
};

/**
 * @constructor
 * @implements thi.ng.physics.IParticleSpring
 * @param {thi.ng.physics.Particle2} a
 * @param {thi.ng.physics.Particle2} b
 * @param {number} rlen
 * @param {number=} strength
 */
thi.ng.physics.Spring2 = function(a, b, rlen, strength) {
	this.a = a;
	this.b = b;
	this.restLength = rlen;
	this.strength = strength || 1.0;
};

thi.ng.physics.Spring2.prototype = {

	relax : function() {
		var delta = thi.ng.physics.TEMP.setV(this.b.pos).subV(this.a.pos);
		var dist = delta.mag() + 1e-6;
		var nd = (dist - this.restLength)
				/ (dist * (this.a.invMass + this.b.invMass)) * this.strength;
		if (!this.a.isLocked) {
			this.a.pos.madd(delta, nd * this.a.invMass);
		}
		if (!this.b.isLocked) {
			this.b.pos.madd(delta, -nd * this.b.invMass);
		}
	}
};

/**
 * @constructor
 * @implements thi.ng.physics.IParticleSpring
 * @param {thi.ng.geom.Vec2} a
 * @param {thi.ng.physics.Particle2} b
 * @param {number=} strength
 */
thi.ng.physics.PullbackSpring2 = function(a, b, strength) {
	this.a = a;
	this.b = b;
	this.strength = strength;
};

thi.ng.physics.PullbackSpring2.prototype = {
	relax : function() {
		if (!this.b.isLocked) {
			var delta = thi.ng.physics.TEMP.setV(this.b.pos).subV(this.a);
			var dist = delta.mag() + 1e-6;
			var nd = dist / (dist * (1 + this.b.invMass)) * this.strength;
			this.b.pos.madd(delta, -nd);
		}
	}
};

/**
 * @constructor
 * @param {number=} timeStep
 * @param {number=} iter
 * @param {number=} drag
 */
thi.ng.physics.Physics2 = function(timeStep, iter, drag) {
	/** @type {Array.<thi.ng.physics.Particle2>} */
	this.particles = [];
	/** @type {Array.<thi.ng.physics.IParticleSpring>} */
	this.springs = [];
	/** @type {Array.<thi.ng.physics.IParticleBehavior>} */
	this.behaviors = [];
	this.timeStep = timeStep || 1.0;
	this.iterations = iter || 50;
	this.drag = drag || 0.05;
};

thi.ng.physics.Physics2.prototype = {
	updateParticles : function() {
		var drag = this.drag;
		goog.array.forEach(this.particles, function(p) {
			if (!p.isLocked) {
				p.scaleVelocity(drag).applyForce();
			}
		});
	},

	updateSprings : function() {
		for (var i = 0, n = this.iterations; i < n; i++) {
			goog.array.forEach(this.springs, function(s) {
				s.relax();
			});
		}
	},

	update : function() {
		this.applyBehaviors();
		this.updateParticles();
		this.updateSprings();
	},

	applyBehaviors : function() {
		var particles = this.particles;
		goog.array.forEach(this.behaviors, function(b) {
			goog.array.forEach(particles, function(p) {
				if (!p.isLocked) {
					b.applyBehavior(p);
				}
			});
		});
	},

	/**
	 * @param {thi.ng.physics.IParticleBehavior} b
	 */
	addBehavior : function(b) {
		this.behaviors.push(b);
	},

	/**
	 * @param {thi.ng.physics.Particle2} p
	 */
	addParticle : function(p) {
		if (!goog.array.contains(this.particles, p)) {
			this.particles.push(p);
		} else {
			// window.console.log('skip:', p);
		}
	},

	/**
	 * @param {Array.<thi.ng.physics.Particle2>} particles
	 */
	addParticles : function(particles) {
		var ctx = this;
		goog.array.forEach(particles, function(p) {
			ctx.addParticle(p);
		});
	},

	/**
	 * @param {thi.ng.physics.IParticleSpring} s
	 */
	addSpring : function(s) {
		this.springs.push(s);
	}
};

/**
 * @constructor
 * @param {Array.<thi.ng.geom.Vec2>} points
 * @param {number} strength
 */
thi.ng.physics.ParticleString2 = function(points, strength) {
	var particles = goog.array.map(points, function(p) {
		return new thi.ng.physics.Particle2(p.x, p.y, 1.0);
	});
	var np = particles.length - 1;
	var springs = goog.array.map(particles, function(p, i) {
		if (i < np) {
			var q = particles[i + 1];
			return new thi.ng.physics.Spring2(p, q, p.pos.dist(q.pos), strength);
		}
	});
	springs.pop();
	this.particles = particles;
	this.springs = springs;
};

/**
 * @constructor
 * @implements thi.ng.physics.IParticleBehavior
 * @param {thi.ng.geom.Vec2} pos
 * @param {number} radius
 * @param {number} strength
 */
thi.ng.physics.AttractionBehavior2 = function(pos, radius, strength) {
	this.pos = pos;
	this.radius = radius;
	this.radiusSq = radius * radius;
	this.strength = strength;
};

thi.ng.physics.AttractionBehavior2.prototype = {

	applyBehavior : function(p) {
		if (p.pos != this.pos) {
			var delta = thi.ng.physics.TEMP.setV(this.pos).subV(p.pos);
			var d = delta.magSquared();
			if (d < this.radiusSq) {
				p.addForce(delta.normalize((1 - d / this.radiusSq)
						* this.strength));
			}
		}
	}
};
