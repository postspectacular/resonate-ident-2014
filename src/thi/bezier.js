goog.provide('thi.ng.geom.Bezier2');

goog.require('thi.ng.geom.LineStrip2');
goog.require('thi.ng.geom.Vec2');

/**
 * @constructor
 * @param {Array.<thi.ng.geom.Vec2>=} points
 */
thi.ng.geom.Bezier2 = function(points) {
	this.points = points || [];
};

/**
 * @param {thi.ng.geom.Vec2} a
 * @param {thi.ng.geom.Vec2} b
 * @param {thi.ng.geom.Vec2} c
 * @param {thi.ng.geom.Vec2} d
 * @param {number} t
 * @return {thi.ng.geom.Vec2}
 */
thi.ng.geom.Bezier2.mix = function(a, b, c, d, t) {
	var it = 1.0 - t;
	var it2 = it * it;
	var t2 = t * t;
	return a.copy().scaleN(it * it2).madd3(b, 3 * t * it2, c, 3 * it * t2, d,
			t * t2);
};

/**
 * @param {thi.ng.geom.Vec2} a
 * @param {thi.ng.geom.Vec2} b
 * @param {thi.ng.geom.Vec2} c
 * @param {thi.ng.geom.Vec2} d
 * @param {number} res
 * @return {Array.<thi.ng.geom.Vec2>}
 */
thi.ng.geom.Bezier2.sampleSegment = function(a, b, c, d, res) {
	var points = [];
	for (var i = 0, dt = 1.0 / res; i < res; i++) {
		points[i] = thi.ng.geom.Bezier2.mix(a, b, c, d, i * dt);
	}
	return points;
};

thi.ng.geom.Bezier2.prototype = {

	/**
	 * @param {number=} tight
	 * @return {Array.<thi.ng.geom.Vec2>}
	 */
	findCPoints : function(tight) {
		tight = tight || 0.25;
		var points = this.points;
		var np = points.length;
		var invt = 1.0 / tight;
		var c1 = points[2].copy().subV(points[0]).scaleN(tight);
		var bi = [ 0, -tight ];
		var coeff = [ new thi.ng.geom.Vec2(), c1 ];
		for (var i = 2, np1 = np - 1; i < np1; i++) {
			var b = bi[i] = -1.0 / (invt + bi[i - 1]);
			coeff[i] = points[i + 1].copy().subV(points[i - 1]).subV(
					coeff[i - 1]).scaleN(-b);
		}
		var delta = new Array(np);
		delta[np - 1] = new thi.ng.geom.Vec2();
		for (i = np - 2; i >= 0; i--) {
			delta[i] = coeff[i].madd(delta[i + 1] || new thi.ng.geom.Vec2(),
					bi[i]);
		}
		return delta;
	},

	/**
	 * @param {number=} tight
	 * @return {Array.<thi.ng.geom.Vec2>}
	 */
	autoSpline : function(tight) {
		var cpoints = this.findCPoints(tight);
		var points = this.points;
		var npoints = [];
		var np = cpoints.length - 1;
		for (var i = 0; i < np; i++) {
			var p = points[i];
			npoints = npoints.concat([ p, cpoints[i].addV(p),
					points[i + 1].copy().subV(cpoints[i + 1]) ]);
		}
		npoints.push(points[np]);
		return npoints;
	},

	/**
	 * @param {number} res
	 * @param {boolean} appendLast
	 * @return {Array.<thi.ng.geom.Vec2>}
	 */
	sampleWithRes : function(res, appendLast) {
		var lpoints = [];
		var cpoints = this.points;
		for (var i = 0, np = cpoints.length - 4; i <= np; i += 3) {
			lpoints = lpoints.concat(thi.ng.geom.Bezier2.sampleSegment(
					cpoints[i], cpoints[i + 1], cpoints[i + 2], cpoints[i + 3],
					res));
		}
		if (appendLast) {
			lpoints.push(this.points[this.points.length - 1]);
		}
		return lpoints;
	}
};
