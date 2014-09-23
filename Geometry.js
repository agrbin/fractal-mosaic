/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

zz.Point = function (x, y) {
  this.x = x;
  this.y = y;
};

zz.Point.prototype.add = function (t) {
  return new zz.Point(t.x + this.x, t.y + this.y);
};

zz.Point.prototype.scale = function (k) {
  return new zz.Point(this.x * k, this.y * k);
};

zz.Point.prototype.subtract = function (t) {
  return new zz.Point(this.x - t.x, this.y - t.y);
};

zz.Point.prototype.norm = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

zz.Rectangle = function (topLeft, bottomRight) {
  if (topLeft instanceof zz.Point && bottomRight instanceof zz.Point) {
    this.a = topLeft;
    this.b = bottomRight;
  } else {
    throw "topLeft and bottomRight should be points";
  }
  if (this.width() < 0 || this.height() < 0) {
    throw "negative rect. don't do it man.";
  }
};

zz.Rectangle.prototype.width = function () {
  return this.b.x - this.a.x;
};

zz.Rectangle.prototype.height = function () {
  return this.b.y - this.a.y;
};

zz.Rectangle.prototype.bottomRight = function () {
  return new zz.Point(this.b.x, this.b.y);
};

zz.Rectangle.prototype.bottomLeft = function () {
  return new zz.Point(this.a.x, this.b.y);
};

zz.Rectangle.prototype.topRight = function () {
  return new zz.Point(this.b.x, this.a.y);
};

zz.Rectangle.prototype.topLeft = function () {
  return new zz.Point(this.a.x, this.a.y);
};

zz.Rectangle.prototype.containsPoint = function (pt) {
  return this.a.x <= pt.x && pt.x <= this.b.x &&
    this.a.y <= pt.y && pt.y <= this.b.y;
};

zz.Rectangle.prototype.containsRect = function (rect) {
  return this.containsPoint(rect.a) && this.containsPoint(rect.b);
};

zz.Rectangle.prototype.intervalIntersection = function(x1, x2, y1, y2) {
  return Math.min(x2, y2) - Math.max(x1, y1);
}

zz.Rectangle.prototype.intersectsRect = function (rect) {
  return this.intervalIntersection(this.a.x, this.b.x, rect.a.x, rect.b.x) >= 0
    && this.intervalIntersection(this.a.y, this.b.y, rect.a.y, rect.b.y) >= 0;
};

zz.Rectangle.prototype.intersectsRectArea = function (rect) {
  if (!this.intersectsRect(rect)) {
    return 0;
  }
  return this.intervalIntersection(this.a.x, this.b.x, rect.a.x, rect.b.x) *
    this.intervalIntersection(this.a.y, this.b.y, rect.a.y, rect.b.y);
};

zz.Rectangle.prototype.scaleAroundPoint = function (k, t) {
  return new zz.Rectangle(
    this.a.subtract(t).scale(k).add(t),
    this.b.subtract(t).scale(k).add(t)
  );
};

zz.Rectangle.prototype.center = function () {
  return this.a.add(this.b).scale(0.5);
};

// sw/sh is ratio. use like this: viewport.fitSmallerRectangleRatio(16, 9)
zz.Rectangle.prototype.fitSmallerRectangleRatio = function (sw, sh) {
  var r = Math.min(this.width() / sw, this.height() / sh) * 0.5,
    vector = new zz.Point(sw, sh).scale(r);
  return new zz.Rectangle(
    this.center().subtract(vector),
    this.center().add(vector)
  );
};

zz.Rectangle.prototype.copy = function () {
  return new zz.Rectangle(this.x, this.y, this.w, this.h);
};

zz.Rectangle.prototype.area = function () {
  return this.width() * this.height();
};

zz.Rectangle.fromWidthHeight = function (w, h) {
  return new zz.Rectangle(
      new zz.Point(0, 0),
      new zz.Point(w, h)
    );
};
