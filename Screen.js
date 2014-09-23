/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

zz.Screen = function (canvasElem) {
  var width,
    height,
    that = this,
    ctx = canvasElem.getContext('2d'),
    viewport = zz.Rectangle.fromWidthHeight(zz.kWidth, zz.kHeight),
    persistentObjects = [];

  function resize() {
    var trans;
    width = canvasElem.width = window.innerWidth * 0.9;
    height = canvasElem.height = window.innerHeight * 0.9;
    // transform everything so that these values meet viewport rect.
    trans = new zz.Rectangle(
        new zz.Point(
          width * zz.viewMargin,
          height * zz.viewMargin
        ),
        new zz.Point(
          width * (1 - zz.viewMargin),
          height * (1 - zz.viewMargin)
        )
      )
      .fitSmallerRectangleRatio(16, 9);
    ctx.setTransform(
      trans.width() / zz.kWidth, 0, 0,
      trans.height() / zz.kHeight,
      trans.a.x, trans.a.y
    );
  }

  function drawPersistentLoop() {
    var it;

    // clear everything
    ctx.clearRect(-zz.kWidth, -zz.kHeight, 3 * zz.kWidth, 3 * zz.kHeight);

    for (it = 0; it < persistentObjects.length; ++it) {
      persistentObjects[it]();
    }

    // clear outside viewport
    if (zz.drawImages) {
      ctx.clearRect(-zz.kWidth, -zz.kHeight, zz.kWidth, zz.kHeight * 3);
      ctx.clearRect(zz.kWidth, -zz.kHeight, zz.kWidth, zz.kHeight * 3);

      ctx.clearRect(-zz.kWidth, -zz.kHeight, zz.kWidth * 3, zz.kHeight);
      ctx.clearRect(-zz.kWidth, zz.kHeight, zz.kWidth * 3, zz.kHeight);
    }

    ctx.font="200px Verdana";
    ctx.fillStyle="white";
    ctx.fillText(that.status, zz.kWidth / 30, -zz.kHeight / 30);

    window.requestAnimationFrame(drawPersistentLoop);
  }

  function mousemove (evt) {
    // can this be more ugly?
    var k = 1 - 1 * zz.viewMargin, k2 = 1 - 2 * zz.viewMargin;
    that.mousePos.x = (evt.clientX / canvasElem.width * zz.kWidth * k
      - zz.kWidth / 2) / k2 + zz.kWidth / 2;
    that.mousePos.y = (evt.clientY / canvasElem.height * zz.kHeight * k
      - zz.kHeight / 2) / k2 + zz.kHeight / 2;

    that.mousePos.x = Math.max(that.mousePos.x, 10);
    that.mousePos.y = Math.max(that.mousePos.y, 10);

    that.mousePos.x = Math.min(that.mousePos.x, zz.kWidth - 10);
    that.mousePos.y = Math.min(that.mousePos.y, zz.kHeight - 10);
  }

  this.status = 'ok';

  this.mousePos = new zz.Point(zz.kWidth / 2, zz.kHeight / 2);
  this.viewport = viewport;

  this.alpha = function (a) {ctx.globalAlpha = (a);};
  this.translateMatrix = function (x, y) {ctx.translate(x, y);}
  this.scaleMatrix = function (x, y) {ctx.scale(x, y);}
  this.saveMatrix = function () {ctx.save();};
  this.restoreMatrix = function () {ctx.restore();};

  this.draw = function (object, color, lineWidth) {
    if (object.drawToScreen) {
      return object.drawToScreen(that);
    }
    ctx.beginPath();
    ctx.lineWidth = lineWidth || 1;
    ctx.strokeStyle = color || '#000';
    if (object instanceof zz.Point) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(object.x, object.y);
      ctx.lineTo(object.x + 0.001, object.y);
    } else if (object instanceof zz.Rectangle) {
      ctx.rect(object.a.x, object.a.y, object.width(), object.height());
    } else if (object instanceof Image) {
      ctx.drawImage(object, 0, 0);
    }
    ctx.stroke();
  };

  this.drawAlways = function (object, color, lineWidth) {
    persistentObjects.push(that.draw.bind(that, object, color, lineWidth));
  };

  (function () {
    window.addEventListener('resize', resize, false);
    canvasElem.addEventListener('mousemove', mousemove, false);
    that.drawAlways(viewport, 'black', 2);
    drawPersistentLoop();
    resize();
  }());
};
