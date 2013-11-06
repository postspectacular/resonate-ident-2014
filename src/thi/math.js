goog.provide('thi.ng.math.core');

thi.ng.math.core = {

    /**
     * @param {number} a
     * @param {number} b
     * @param {number} t
     * @return {number}
     */
    mix: function(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * @param {number} a
     * @param {number=} b
     * @return {number}
     */
    random: function(a, b) {
        if (!goog.isNumber(b)) {
            b = a;
            a = 0;
        }
        return thi.ng.math.core.mix(a, b, Math.random());
    }
};
