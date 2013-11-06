goog.provide('thi.ng.geom.Line2');
goog.require('thi.ng.geom.Vec2');

/**
 * @constructor
 * @param {thi.ng.geom.Vec2} a
 * @param {thi.ng.geom.Vec2} b
 */
thi.ng.geom.Line2 = function(a, b) {
    this.a = a;
    this.b = b;
};

thi.ng.geom.Line2.prototype = {

    /**
     * @param {number} res
     * @param {boolean} appendLast
     * @return {Array.<thi.ng.geom.Vec2>}
     */
    sampleWithRes: function(res, appendLast) {
        var samples = [];
        for (var i = 0, dt = 1 / res; i < res; i++) {
            samples.push(this.a.copy().mix(this.b, i * dt));
        }
        if (appendLast) {
            samples.push(this.b.copy());
        }
        return samples;
    }
};
