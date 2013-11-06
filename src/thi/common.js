goog.provide('thi.ng.geom.common');

goog.require('thi.ng.geom.Vec2');

thi.ng.geom.common = {

    /**
     * @param {Array.<thi.ng.geom.Vec2>} points
     * @param {thi.ng.geom.Vec2=} c
     * @return {Array.<thi.ng.geom.Vec2>}
     */
    centerPoints: function(points, c) {
        c = c || new thi.ng.geom.Vec2();
        var cp = goog.array.reduce(points, function(acc, p) {
            return acc.addV(p);
        }, new thi.ng.geom.Vec2());
        var delta = c.subV(cp.scaleN(1.0 / points.length));
        goog.array.forEach(points, function(p) {
            p.addV(delta);
        });
        return points;
    },

    /**
     * @param {Array.<thi.ng.geom.Vec2>} points
     * @return {Array.<thi.ng.geom.Vec2>}
     */
    boundingRect: function(points) {
        return goog.array
                .reduce(points, function(acc, p) {
                    return [acc[0].min(p), acc[1].max(p)];
                }, [new thi.ng.geom.Vec2(1e10, 1e10),
                        new thi.ng.geom.Vec2(-1e10, -1e10)]);
    },

    /**
     * @param {Array.<thi.ng.geom.Vec2>} points
     * @param {thi.ng.geom.Vec2} offset
     * @param {number} scale
     * @return {Array.<thi.ng.geom.Vec2>}
     */
    transScale: function(points, offset, scale) {
        return goog.array.map(points, function(p) {
            return p.addV(offset).scaleN(scale);
        });
    },

    /**
     * @param {Array.<thi.ng.geom.Vec2>} points
     * @return {Array}
     */
    normalizedHeightMetrics: function(points) {
        var bounds = thi.ng.geom.common.boundingRect(points);
        var c = bounds[0].copy().mix(bounds[1], 0.5);
        var s = 1.0 / (bounds[1].y - bounds[0].y);
        return [c, s];
    }
};
