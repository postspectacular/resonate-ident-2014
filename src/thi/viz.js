goog.provide('thi.ng.viz');
goog.require('thi.ng.geom.Bezier2');
goog.require('thi.ng.geom.Vec2');
goog.require('thi.ng.physics.Particle2');

thi.ng.viz = {

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Array.<thi.ng.physics.Particle2>} particles
	 * @param {number} t
	 */
	drawTweenedParticleString : function(ctx, particles, t) {
		ctx.beginPath();
		goog.array.forEach(particles, function(p, i) {
			var o = p.origPos;
			var x = o.x + (p.pos.x - o.x) * t;
			var y = o.y + (p.pos.y - o.y) * t;
			if (i == 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		});
		ctx.stroke();
	},

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Array.<thi.ng.geom.Vec2>} origPoints
	 * @param {Array.<thi.ng.geom.Vec2>} points
	 * @param {number} t
	 */
	drawTweenedSpline : function(ctx, origPoints, points, t) {
		ctx.beginPath();
		var a1, b1, c1, a2, b2, c2;
		var m = thi.ng.math.core.mix;
		ctx.moveTo(m(origPoints[0].x, points[0].x, t), m(origPoints[0].y,
				points[0].y, t));
		for (var i = 1, np = points.length; i < np; i += 3) {
			a1 = origPoints[i], b1 = origPoints[i + 1], c1 = origPoints[i + 2];
			a2 = points[i], b2 = points[i + 1], c2 = points[i + 2];
			ctx.bezierCurveTo(m(a1.x, a2.x, t), m(a1.y, a2.y, t), m(b1.x, b2.x,
					t), m(b1.y, b2.y, t), m(c1.x, c2.x, t), m(c1.y, c2.y, t));
		}
		ctx.stroke();
	}
};
