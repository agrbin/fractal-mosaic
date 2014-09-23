/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

zz.FrameHolder = function (clock, provider) {
  var nextFrameId = 0,
    frameCount = 0,
    frames = {},
    that = this,
    repeatSpawn,
    repeatDelete,
    log = console.log.bind(console),
    lastFrame = null;

  function clock() {
    return new Date().getTime();
  }

  function getId() {
    frameCount++;
    return nextFrameId++;
  }

  function deleteInivisbleFrames(screen) {
    var it, k1, k2, frame, toDelete = [];
    for (it in frames) {
      frame = frames[it];
      if (!frame.rect.intersectsRect(screen.viewport)) {
        toDelete.push(it);
      }
      if (frame.childrenLoaded === zz.kRows * zz.kCols &&
          !frame.hasBlendedChild()) {
        toDelete.push(it);
      }
    }
    for (it = 0; it < toDelete.length; ++it) {
      frameCount--;
      delete frames[toDelete[it]];
    }
  }

  // this is called at the and of main loop
  function tryAddFrame(parentFrame, screen) {
    var it, jt, child, loaded = false, fhId;
    for (it = 0; it < zz.kRows; ++it) {
      for (jt = 0; jt < zz.kCols; ++jt) {
        if (parentFrame.childFrames[it][jt]
            && !parentFrame.childFrames[it][jt].imageData) {
          screen.status = '...';
        }
        if (parentFrame.childFrames[it][jt]
            && parentFrame.childFrames[it][jt].imageData
            && !parentFrame.childFrames[it][jt].fhId) {
          fhId = getId();
          child = parentFrame.childFrames[it][jt];
          child.fhId = fhId;
          child.rect = parentFrame.getChildRect(it, jt);
          frames[fhId] = child;
          parentFrame.childrenLoaded++;
          loaded = true;
        }
      }
    }
    if (loaded) {
      repeatDelete.callHimNextTime();
    }
  }

  function spawnNewFrames(screen) {
    var it, frame;
    for (it in frames) {
      frame = frames[it];
      if (frame.shouldStartLoading(screen)) {
        frame.initiateChildrenLoad(provider, screen);
      }
    }
  }

  this.drawToScreen = function (screen) {
    var it, frame, t = clock();
    that.movePt = screen.mousePos;
    screen.status = '';
    if (t - lastFrame > 100) {
      lastFrame = t - 100;
    }
    for (it in frames) {
      frame = frames[it];
      screen.saveMatrix();
      frame.updateRect((t - lastFrame) * zz.zoomSpeed, this.movePt);
      frame.transformMatrix(screen);
      screen.draw(frame);
      screen.restoreMatrix();
    }
    for (it in frames) {
      if (frames[it].childLoading) {
        tryAddFrame(frames[it], screen);
      }
    }
    repeatSpawn.callMeMaybe(spawnNewFrames.bind(null, screen));
    repeatDelete.callMeMaybe(deleteInivisbleFrames.bind(null, screen));
    lastFrame = t;
  };

  (function () {
    var firstId = getId();
    repeatSpawn = new zz.Repeat(1000);
    repeatDelete = new zz.Repeat(1000);
    lastFrame = clock();
    frames[firstId] = zz.Frame.constructStartFrame(firstId);
  }());
};
