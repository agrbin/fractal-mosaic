/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

/*
 * frame knows it's image id, and rectangle on screen.
 */
zz.Frame = function (fhId, imageSpec, rect) {
  this.fhId = fhId;
  this.rect = rect;
  this.imageSpec = imageSpec;

  // when frame has image data it is ready to display
  // frame cycle:
  //  imageData=image, childLoading = 0, childrenLoaded = 0
  //  childLoading = true
  //  childFrames begins to populate and childrenLoaded rises
  //  if childrenLoaded == zz.kRows * zz.kCols, frame is deleted 
  //
  this.imageAlpha = 0;
  this.imageData = null;
  this.childLoading = false;
  this.childrenLoaded = 0;
  this.childFrames = zz.emptyArray(zz.kRows, zz.kCols);
};

zz.Frame.prototype.updateRect = function (speed, movePt) {
  this.imageAlpha = Math.min(1, this.imageAlpha + speed * 3);
  this.rect = this.rect.scaleAroundPoint(1 + speed, movePt);
};

zz.Frame.prototype.hasBlendedChild = function () {
  var it, jt;
  if (!this.childLoading) {
    return false;
  }
  for (it = 0; it < zz.kRows; ++it) {
    for (jt = 0; jt < zz.kCols; ++jt) {
      if (this.childFrames[it][jt] &&
          this.childFrames[it][jt].imageData &&
          this.childFrames[it][jt].imageAlpha < 1) {
        return true;
      }
    }
  }
  return false;
};


zz.Frame.prototype.transformMatrix = function (scr) {
  scr.translateMatrix(this.rect.a.x, this.rect.a.y);
  scr.scaleMatrix(
    this.rect.width() / zz.kFrameWidth,
    this.rect.height() / zz.kFrameHeight);
};

zz.Frame.prototype.drawToScreen = function (screen) {
  if (this.imageData && zz.drawImages) {
    screen.alpha(this.imageAlpha);
    screen.draw(this.imageData);
  }
  if (zz.drawGrid) {
    screen.draw(
      zz.Rectangle.fromWidthHeight(
        zz.kFrameWidth, zz.kFrameHeight
      ),
      this.childLoading ? 'black':'green',
      3
    );
  }
};

zz.Frame.prototype.shouldStartLoading = function (screen) {
  if (this.childLoading) {
    return false;
  }
  if (this.rect.intersectsRectArea(screen.viewport) > zz.kStartLoadingArea
      || this.rect.area() > screen.viewport.area()) {
    return this.childLoading = true;
  }
};

zz.Frame.prototype.setImageData = function (imageData) {
  this.imageData = imageData;
};

zz.Frame.prototype.initiateChildrenLoad = function (provider, screen, mosaic) {
  var it, jt, child;
  if (this.imageSpec.f === 2 && !mosaic) {
    return provider.getImageMosaic(
        this.imageSpec.id,
        this.initiateChildrenLoad.bind(this, provider, screen)
      );
  }
  for (it = 0; it < zz.kRows; ++it) {
    for (jt = 0; jt < zz.kCols; ++jt) {
      // don't load if this rect is already outside of viewport.
      if (!this.getChildRect(it, jt).intersectsRect(screen.viewport)) {
        this.childrenLoaded++;
        continue;
      }
      // fhId and rect will be updated when child is added to FrameHolder.
      child = new zz.Frame(null, this.getChildSpec(it, jt, mosaic), null);
      this.childFrames[it][jt] = child;
      // initiate load of image data.
      provider.getImageData(
        child.imageSpec,
        child.setImageData.bind(child)
      );
    }
  }
};

// child's rectangle is inspaced into parent's
zz.Frame.prototype.getChildRect = function (it, jt) {
  return new zz.Rectangle(
    new zz.Point(
      this.rect.a.x + jt * (this.rect.width() / zz.kCols),
      this.rect.a.y + it * (this.rect.height() / zz.kRows)
    ),
    new zz.Point(
      this.rect.a.x + (jt + 1) * (this.rect.width() / zz.kCols),
      this.rect.a.y + (it + 1) * (this.rect.height() / zz.kRows)
    )
  );
};

zz.Frame.prototype.getChildSpec = function (it, jt, mosaic) {
  if (this.imageSpec.f === 2) {
    return {
      id : mosaic[this.imageSpec.mx + it][this.imageSpec.my + jt],
      f: 32,
      mx: 0,
      my: 0,
    };
  } else {
    return {
        id : this.imageSpec.id,
        f: this.imageSpec.f / 2,
        mx: this.imageSpec.mx + it * this.imageSpec.f / 2,
        my: this.imageSpec.my + jt * this.imageSpec.f / 2,
    };
  }
};

zz.Frame.constructStartFrame = function (fhId) {
  return new zz.Frame(
    fhId,
    {
      id: Math.random() * 65536 | 0,
      f: 32,
      mx: 0,
      my: 0,
    },
    zz.Rectangle.fromWidthHeight(zz.kWidth, zz.kHeight)
  );
};

