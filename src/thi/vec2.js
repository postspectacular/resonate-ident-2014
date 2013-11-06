goog.provide('thi.ng.geom.IVec');
goog.provide('thi.ng.geom.Vec2');

goog.require('thi.ng.math.core');
/**
 * @interface
 */
thi.ng.geom.IVec = function() {
};

/**
 * @constructor
 * @implements thi.ng.geom.IVec
 * @param {number=} x
 * @param {number=} y
 */
thi.ng.geom.Vec2 = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

/**
 * @param {number=} n
 * @return {thi.ng.geom.Vec2}
 */
thi.ng.geom.Vec2.random = function(n) {
	return new thi.ng.geom.Vec2(thi.ng.math.core.random(-1, 1), thi.ng.math.core
			.random(-1, 1)).normalize(n || 1);
};

thi.ng.geom.Vec2.prototype = {

	/** @return {thi.ng.geom.Vec2} */
	copy : function() {
		return new thi.ng.geom.Vec2(this.x, this.y);
	},

	/**
	 * @param {number} x
	 * @param {number} y
	 * @return {thi.ng.geom.Vec2}
	 */
	set : function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {thi.ng.geom.Vec2}
	 */
	setV : function(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {thi.ng.geom.Vec2}
	 */
	addV : function(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {thi.ng.geom.Vec2}
	 */
	subV : function(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {thi.ng.geom.Vec2}
	 */
	scaleV : function(v) {
		this.x *= v.x;
		this.y *= v.y;
		return this;
	},

	/**
	 * @param {number} n
	 * @return {thi.ng.geom.Vec2}
	 */
	scaleN : function(n) {
		this.x *= n;
		this.y *= n;
		return this;
	},

	/**
	 * @return {thi.ng.geom.Vec2}
	 */
	invert : function() {
		this.x *= -1;
		this.y *= -1;
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @param {number} n
	 * @return {thi.ng.geom.Vec2}
	 */
	madd : function(v, n) {
		this.x += v.x * n;
		this.y += v.y * n;
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} a
	 * @param {number} at
	 * @param {thi.ng.geom.Vec2} b
	 * @param {number} bt
	 * @param {thi.ng.geom.Vec2} c
	 * @param {number} ct
	 * @return {thi.ng.geom.Vec2}
	 */
	madd3 : function(a, at, b, bt, c, ct) {
		this.x += a.x * at + b.x * bt + c.x * ct;
		this.y += a.y * at + b.y * bt + c.y * ct;
		return this;
	},

	/** @return {number} */
	mag : function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	/** @return {number} */
	magSquared : function() {
		return this.x * this.x + this.y * this.y;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {number}
	 */
	dist : function(v) {
		var dx = this.x - v.x;
		var dy = this.y - v.y;
		return Math.sqrt(dx * dx + dy * dy);
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {number}
	 */
	distSquared : function(v) {
		var dx = this.x - v.x;
		var dy = this.y - v.y;
		return dx * dx + dy * dy;
	},

	/**
	 * @param {number=} n
	 * @return {thi.ng.geom.Vec2}
	 */
	normalize : function(n) {
		var mag = Math.sqrt(this.x * this.x + this.y * this.y);
		if (mag > 0) {
			mag = (n || 1.0) / mag;
			this.x *= mag;
			this.y *= mag;
		}
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @param {number} t
	 * @return {thi.ng.geom.Vec2}
	 */
	mix : function(v, t) {
		this.x += (v.x - this.x) * t;
		this.y += (v.y - this.y) * t;
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {thi.ng.geom.Vec2}
	 */
	min : function(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		return this;
	},

	/**
	 * @param {thi.ng.geom.Vec2} v
	 * @return {thi.ng.geom.Vec2}
	 */
	max : function(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		return this;
	}
};
