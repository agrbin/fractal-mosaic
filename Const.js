/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

zz.kApiUrl = 'http://fractal-mosaic.xfer.hr/';

zz.kWidth = 1024 * 4;
zz.kHeight = 576 * 4;

zz.kFrameWidth = 256;
zz.kFrameHeight = 144;

zz.kRows = 2;
zz.kCols = 2; 

zz.viewMargin = 0.1;
zz.zoomSpeed = 0.0001;

zz.drawImages = true;
zz.drawGrid = false;

zz.kStartLoadingArea = zz.kWidth * zz.kHeight / Math.pow(3, 2);
