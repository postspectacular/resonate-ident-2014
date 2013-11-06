goog.provide('thi.ng.events.DragController');
goog.provide('thi.ng.events.TouchState');

goog.require('goog.object');
goog.require('thi.ng.geom.Vec2');

thi.ng.events.isTouch = 'ontouchstart' in window || 'onmsgesturechange' in window;

/**
 * @constructor
 * @param {number} id
 * @param {thi.ng.geom.Vec2} pos
 */
thi.ng.events.TouchState = function(id, pos) {
	this.id = id;
	this.pos = pos;
};

/**
 * @constructor
 * @param {HTMLElement} el
 * @param {{down:function(Array.<thi.ng.events.TouchState>), drag:function(Array.<thi.ng.events.TouchState>),
 *            up:function(Array.<thi.ng.events.TouchState>)}} handlers
 */
thi.ng.events.DragController = function(el, handlers) {
	/** @type {Object.<string, thi.ng.events.TouchState>} */
	this.touchIndex = {};
	this.indexSize = 0;
	this.handlers = handlers;
	this.element = el;
	var ae = goog.bind(el.addEventListener, el);
	if (thi.ng.events.isTouch) {
		var start = goog.bind(this.touchStart, this);
		var end = goog.bind(this.touchEnd, this);
		ae('touchstart', start, false);
		ae('touchmove', start, false);
		ae('touchend', end, false);
		ae('touchcancel', end, false);
		ae('touchleave', end, false);
	} else {
		var end = goog.bind(this.mouseUp, this);
		ae('mousedown', goog.bind(this.mouseDown, this), false);
		ae('mousemove', goog.bind(this.mouseMove, this), false);
		ae('mouseup', end, false);
		ae('mouseleave', end, false);
	}
};

thi.ng.events.DragController.prototype = {

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {thi.ng.geom.Vec2}
	 */
	normalizedPosition : function(x, y) {
		var bounds = this.element.getBoundingClientRect();
		var offset = new thi.ng.geom.Vec2(bounds.left, bounds.top);
		return new thi.ng.geom.Vec2(x, y).subV(offset).scaleV(
				new thi.ng.geom.Vec2(1 / bounds.width, 1 / bounds.height));
	},

	mouseDown : function(e) {
		e.preventDefault();
		var ts = this.touchIndex['__m'] = new thi.ng.events.TouchState(0, this
				.normalizedPosition(e.pageX, e.pageY));
		this.handlers.down([ ts ]);
	},

	mouseMove : function(e) {
		e.preventDefault();
		if (goog.isDefAndNotNull(this.touchIndex['__m'])) {
			var ts = this.touchIndex['__m'] = new thi.ng.events.TouchState(0, this
					.normalizedPosition(e.pageX, e.pageY));
			this.handlers.drag([ ts ]);
		}
	},

	mouseUp : function(e) {
		e.preventDefault();
		if (goog.isDefAndNotNull(this.touchIndex['__m'])) {
			this.handlers.up([ this.touchIndex['__m'] ]);
			delete this.touchIndex['__m'];
		}
	},

	/**
	 * @param touches
	 * @returns {Array.<thi.ng.events.TouchState>}
	 */
	addTouches : function(touches) {
		var ctx = this;
		goog.array.forEach(touches, function(t) {
			var id = '' + t.identifier;
			var ival = ctx.touchIndex[id];
			var p = ctx.normalizedPosition(t.pageX, t.pageY);
			var ts;
			if (goog.isDef(ival)) {
				ts = ival;
				ts.pos = p;
			} else {
				ts = new thi.ng.events.TouchState(ctx.indexSize, p);
				ctx.touchIndex[id] = ts;
				ctx.indexSize++;
			}
		});
		return goog.object.getValues(this.touchIndex);
	},

	/**
	 * @param touches
	 * @return {Array.<thi.ng.events.TouchState>}
	 */
	removeTouches : function(touches) {
		var ctx = this;
		return goog.array.reduce(touches, function(acc, t) {
			var id = '' + t.identifier;
			var ival = ctx.touchIndex[id];
			if (goog.isDef(ival)) {
				delete ctx.touchIndex[id];
				ctx.indexSize--;
				acc.push(ival);
			}
			return acc;
		}, []);
	},

	touchStart : function(e) {
		//e.preventDefault();
		this.handlers.down(this.addTouches(e.changedTouches));
	},

	touchEnd : function(e) {
		//e.preventDefault();
		this.handlers.up(this.removeTouches(e.changedTouches));
	}
};
