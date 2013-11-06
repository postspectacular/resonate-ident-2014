goog.provide('thi.ng.geom.LineStrip2');

goog.require('goog.array');
goog.require('thi.ng.geom.Vec2');
goog.require('thi.ng.geom.common');

/**
 * @constructor
 * @param {Array.<thi.ng.geom.Vec2>} points
 */
thi.ng.geom.LineStrip2 = function(points) {
    this.points = points;
};

thi.ng.geom.LineStrip2.prototype = {

    /**
     * @param {thi.ng.geom.Vec2=} c
     * @return {thi.ng.geom.LineStrip2}
     */
    center: function(c) {
        this.points = thi.ng.geom.common.centerPoints(this.points, c);
        return this;
    },

    /**
     * @return {Array.<number>}
     */
    lengthIndex: function() {
        var idx = [0];
        var total = 0;
        for (var i = 1, p = this.points, np = p.length; i < np; i++) {
            total += p[i].dist(p[i - 1]);
            idx.push(total);
        }
        return idx;
    },

    /**
     * @param {number} udist
     * @param {boolean} appendLast
     * @return {Array.<thi.ng.geom.Vec2>}
     */
    sampleUniform: function(udist, appendLast) {
        var idx = this.lengthIndex();
        var total = idx[idx.length - 1];
        var delta = udist / total;
        var samples = [];
        var points = this.points;
        for (var t = 0, i = 1, j = 0; t < 1.0; t += delta) {
            var ct = t * total;
            while (ct >= idx[i])
                i++;
            var p = points[i - 1];
            var q = points[i];
            var pi = idx[i - 1];
            var frac = (ct - pi) / (idx[i] - pi);
            samples[j++] = p.copy().mix(q, frac);
        }
        if (appendLast) {
            samples.push(points[points.length - 1]);
        }
        return samples;
    },

    /**
     * @return {Array.<thi.ng.geom.Vec2>}
     */
    getPoints: function() {
        return this.points;
    }
};
