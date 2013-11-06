goog.provide('thi.ng.geom.path');
goog.provide('thi.ng.geom.path.Path2');
goog.provide('thi.ng.geom.path.PathSegment');

goog.require('goog.array');
goog.require('thi.ng.geom.Bezier2');
goog.require('thi.ng.geom.Line2');
goog.require('thi.ng.geom.LineStrip2');
goog.require('thi.ng.geom.Vec2');

/**
 * @interface
 */
thi.ng.geom.path.PathSegment = function() {
};

thi.ng.geom.path.PathSegment.prototype = {
	/**
	 * @param {number} res
	 * @param {boolean} appendLast
	 * @return {Array.<thi.ng.geom.Vec2>}
	 */
	sampleSegment : function(res, appendLast) {
	}
};

/**
 * @constructor
 * @implements thi.ng.geom.path.PathSegment
 * @param {thi.ng.geom.Vec2} a
 * @param {thi.ng.geom.Vec2} b
 */
thi.ng.geom.path.CloseSegment = function(a, b) {
	this.segment = new thi.ng.geom.Line2(a, b);
};

thi.ng.geom.path.CloseSegment.prototype.sampleSegment = function(res, appendLast) {
	return this.segment.sampleWithRes(res, appendLast);
};

/**
 * @constructor
 * @implements thi.ng.geom.path.PathSegment
 * @param {thi.ng.geom.Vec2} a
 * @param {thi.ng.geom.Vec2} b
 */
thi.ng.geom.path.LineSegment = function(a, b) {
	this.segment = new thi.ng.geom.Line2(a, b);
};

thi.ng.geom.path.LineSegment.prototype.sampleSegment = function(res, appendLast) {
	return this.segment.sampleWithRes(res, appendLast);
};

/**
 * @constructor
 * @implements thi.ng.geom.path.PathSegment
 * @param {Array.<thi.ng.geom.Vec2>} cpoints
 */
thi.ng.geom.path.BezierSegment = function(cpoints) {
	this.segment = new thi.ng.geom.Bezier2(cpoints);
};

thi.ng.geom.path.BezierSegment.prototype.sampleSegment = function(res, appendLast) {
	return this.segment.sampleWithRes(res, appendLast);
};

/**
 * @constructor
 */
thi.ng.geom.path.Path2 = function(segments) {
	this.segments = segments;
};

thi.ng.geom.path.Path2.prototype = {

	/**
	 * @param {number} res
	 * @return {Array}
	 */
	sampleWithRes : function(res) {
		var paths = [];
		var curr = [];
		var ns = this.segments.length - 1;
		goog.array.forEach(this.segments, function(seg, i) {
			curr = curr.concat(seg.sampleSegment(res, i == ns));
			if (seg instanceof thi.ng.geom.path.CloseSegment) {
				paths.push(curr);
				curr = [];
			}
		});
		if (curr.length > 0) {
			paths.push(curr);
		}
		return paths;
	}
};

/**
 * @param {string} svgCoords
 * @return {Array.<thi.ng.geom.Vec2>}
 */
thi.ng.geom.path.Path2.parseSVGCoords = function(svgCoords) {
	var coords = svgCoords.trim().split(/\s+|,/);
	var points = [];
	for (var i = 0, nc = coords.length; i < nc; i += 2) {
		points
				.push(new thi.ng.geom.Vec2(parseFloat(coords[i]), parseFloat(coords[i + 1])));
	}
	return points;
};

/**
 * @param {string} svg
 * @return {thi.ng.geom.path.Path2}
 */
thi.ng.geom.path.newFromSVG = function(svg) {
	var reseq = svg.split(/([MLCZz])\s*(((([0-9\.\-]+)\,?){2}\s*){0,3})/);
	var segments = [];
	for (var i = 0, ns = reseq.length - 1, prev = null, p0 = null; i < ns; i += 6) {
		var coords = thi.ng.geom.path.Path2.parseSVGCoords(reseq[i + 2]);
		switch (reseq[i + 1]) {
		case 'M':
			p0 = prev = coords[0];
			break;
		case 'L':
			segments.push(new thi.ng.geom.path.LineSegment(prev, coords[0]));
			prev = coords[0];
			break;
		case 'C':
			coords.unshift(prev);
			segments.push(new thi.ng.geom.path.BezierSegment(coords));
			prev = coords[3];
			break;
		case 'Z':
		case 'z':
			segments.push(new thi.ng.geom.path.CloseSegment(prev, p0));
			prev = p0;
			break;
		default:
			// window.console.error('unimplemented segment type:' + reseq[i]);
		}
	}
	return new thi.ng.geom.path.Path2(segments);
};
