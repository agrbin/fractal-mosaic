fractal-mosaic
==============

Endless zoom. Check it out! <http://agrbin.github.io/fractal-mosaic/>

What is the animation you can see in this visualization? There are some images
and they keep zooming in. Each image is then turned into a mosaic of other
images and the thing is just going on and on forever..

Well, forever, until it crashes because of a memory leak on client's
JavaScript. Help me out if you can spot the leak!

A mosaic
--------

There are N images in the database. All images are normalized - they have equal
dimensions and thus the equal aspect ratio. When `K^2` images are tiled
together in a matrix of `KxK` images and downsized `K` times, a **composed
image** is obtained with same resolution as original images.

We define a **distance** between two images of same resolution as a pixel-wise
distance in LAB color space.

A **mosaic of a fixed image over a database** is a `KxK` composed image that has
the smallest distance with fixed image. The most naive way to determine a
mosaic would be to test all of the `N^(K^2)` compositions. Independence of sub
problems comes to the rescue - we can choose the closest image for each of `K^2`
subpictures and then compose results into a mosaic. In order to find closest
image for one subpicture one can flatten image to a vector and then search for
nearest neighbors in that vector space.  This turns a mosaic problem into a
`K^2` evaluations of closest neighbor queries.

Before we square the complexity of a mosaic problem, we note how this approach
with independent subpictures has a visual weakness. It happens that same small
image appears multiple times in a connected component of big picture with small
color variance.

We mitigated this firstly by choosing multiple approximate nearest candidates
for each subpicture and storing them into a list for each slot. Then the slots
in the matrix are iterated in random order and closest candidate from list is
assigned. When candidate is assigned, all instances of same candidate in
neighboring slots gets penalty inverse proportional to distance. This approach
yielded best results with small computational overhead and the algorithm is
inspired from Kohonen's neural network.

To sum up the simple mosaic algorithm we use `B` for fixed image, `B_i,j` for
subpicture of `B` in row `i + 1` and column `j + 1`, and `D` for database set
of images.

    for (i,j) < K in parallel
      candidates[i,j] = k-nearest-images to (B_i,j) in D

Each candidate in list contains image identifier and calculated distance from
`B`.  `assigned` stores list of assigned slots for each candidate image.

    for (i,j) < K in random order
      best_distance = oo;
      for each candidate in candidates[i,j]
        for each (si, sj) in assigned[candidate.id]
          candidate.distance += Beta / dist( [i,j], [si, sj] )
        if candidate.distance < best_distance
          candidate.distance = best_distance
          mosaic[i,j] = candidate.id
      assigned[ mosaic[i,j] ].push( [i,j] )

`mosaic[i,j]` now keeps the calculated image that best fit into a mosaic on
place `i, j`.

We have chosen the following numbers in our computation:

* `N = 65536`, number of images
* `1024x576` is resolution of images in database, and they are stored with jpeg
  compression, `q=40`
* `K = 32`, which means that each mosaic is composed of `K^2 = 1024` smaller
  images 
* `d = 192` is dimension of vector that represents each image for nearest
  neighbor search. This vector is composed of average colors of `8x8 = 64` areas
  in image. Color is represented in LAB system.
* FLANN is used to do the nearest neighbor search and auto tuned index of all
  images with `store_dataset` option is 97 mb big.

Squared mosaic problem and a fractal
------------------------------------

It is showed how building a mosaic for a single image takes `K^2` nearest
neighbors queries. However, this work tackled another more complex problem:
**determine a mosaic of each image in database using images from that same
database.**

Using above notation, `mosaic` is now 3D array with keys `mosaic[ID][i, j]`.
This value tells us which image will best fit into a mosaic of fixed image `ID`
on slot `i, j`.

This problem is trivially parallelizable: one can obtain mosaics for different
images concurrently. When all mosaics are calculated, a mosaic fractal can be
defined as follows:

    fractal(id) is continuous image composed of K^2 smaller fractals:
      for each i,j < K
        fractal(id)[i, j] = fractal( mosaic[id][i,j] ) downsized K times

To perform the calculation we used distributed computation provided by
<http://github.com/agrbin/v8boinc-remote> and library for nearest neighbors
transcompiled to JavaScript <http://github.com/agrbin/flann.js>. Source code is
visible under `lib/` and `tiler/`.

To visualize this fractal we've built endless zoom GUI. We faced a challenge of
displaying continuous image of infinite resolution into a discrete space. First
decision was how to encode a position in a fractal. We did this by using a
referent big image `ID` and by encoding a smaller subimage from it:

* `ID`, referent image identificator.
* `k from {32, 16, 8, 4, 2}`, size of subimage we want to display (in mosaic
  matrix slots)
* `mx, my`, offset in matrix for smaller subimage. `mx + k <= K, my + k <= K`.

For example, whole area of a `fractal(10)` would be encoded as `10-32-0-0`,
while it's upper right quadrant would be `10-16-0-16`. Smallest bottom right
subimage could be encoded as `10-1-31-31` but that is equivalent to
`mosaic[10][31, 31]-32-0-0`.

If large image has resolution `WxH`, small image encoded with `k, mx, my` would
span the area from corner point `mx W / K, my H / K` of size `k W / K, k H / K`.

We haven't tested whether this fractal is actually one fractal, eg. if relation
`image A contains image B in its mosaic` is a connected graph. When starting
visualization we choose random starting referent image and then we zoom into
one point from that image.

Drawing a fractal
-----------------

Zoom animation uses objects we call frames to do the business. Each frame is
coupled with following information:

* frame position on screen: offset and size,
* part of the fractal frame should display (encoded as above).

Frame position on screen is always scaled for some factor around the fixed
zooming point to get the effect of zooming in. When frame is not visible on
screen anymore, it is destroyed. When frame size reaches a critical point, a
frame mitosis described below begins. When mitosis is finished, parent frame is
destroyed.

Mitosis is a process of diving frame to 4 child frames placed inside of big
frame in quadrants. Child frame positions on screen are calculated based on
parent frame position and child quadrant. Child fractal position is similarly
calculated by dividing `k` by two and altering `mx, my` to represent the
correct quadrant. The only exception is if `k == 2`. Then, we first need to
load mosaic information of referent image for parent frame, and child frame in
quadrant `q` then gets the following encoding:

* `ID = mosaic[parent.ID][parent.mx + q / 2][parent.my + q % 2]`
* `k = 32, mx = 0, my = 0`, because now we want to display whole referent image.

For example, if we have a frame displaying subimage of `ID` of size `k=2` that
means that we've covered space of 4 slots in big image. When mitosis occur,
each child frame will display new referent image based on mosaic information in
those 4 slots.

With this encoding of fractal area we've accomplished that coordinates are kept
integral, which enables caching of frame images and avoids arithmetic errors.
It also plays very well with mitosis subdivision scheme.

Now we have frames that should be filled with part of the fractal image. Images
are loaded from server that renders the fractal on-line. Total number of
fractal subareas based on this encoding is `N K^2 (1/4 + 1/16 + 1/64 + 1/256 +
1/1024) = 22347776 == 22.34+E6`. One rendered image has resolution of `256x144`
and it's jpeg compressed to average size of around `10K`. To cache all images
it would take 223GB of disk space which is not impossible, but we've decided to
do the rendering online and to put CloudFlare cache in the middle.

The task of the renderer is to produce discrete image out of specified area of
continuous fractal image. The formal correct solution will firstly be described
and then the used estimation.

Each pixel in discrete output image represents an area in fractal image. Color
of output pixel should be the average color in this fractal area. What is an
average color of an fractal image if we can't grab any color sample? We can
use the recursive fractal definition:

    average_color(ID) = 1/1024 Sum[ average_color(mosaic[ID][i, j]) ] over i,j

This is a system of `N` equations with `N` unknowns that could be solved using
iterative method. Initial values for `average_color(ID)` could be the average
color of original image with label `ID`. Although, we didn't try to solve this
system, we expect that calculated fractal average colors don't significantly
deviate from original images average colors. This observation was used to craft
the estimation solution.

In estimated solution we downsampled each image from database into a `32x18`
image. When rendering an output image for a frame, we would simply build mosaic
array for requested area and then montage these small images together. Resize
to requested resolution is done afterwards. First prototype was using
ImageMagick's `montage` program, but the execution of rendering phase with it
took too long. The simple C program is implemented that does the thing using
preprocessed blob of memory that is `mmap`-ed into the process virtual memory
to avoid opening lot of files with small images. You can look for it's source
under `gui/zoomy/server/cpp`.

Building image database
-----------------------

Images are fetched from dump of Croatian wikipedia. The scripts in `data/` are
used to fetch, normalize and store all images.

While wikipedia contains lots of images that are not photos, like maps,
drawings and sketches we tried to create a classificator that decides
whether an image is a photo or a drawing. The simplest solution worked best.
Each image was converted to a 1-d feature vector: **its size on disk when
converted to bitmap and gzipped.** We took `N` largest images by this feature
and declared them as photos.

Except from gzipped bitmap size we also tried to use original jpeg size.

The reasoning behind this trick was the fact that photography will always have
*more content* than drawing or diagram, eg. higher entropy. We used gzip
simply to measure the entropy of input data.

Possible future work
--------------------

* renderer program can be more effective and simpler.
* track down memory leak in client's gui.
* incorporate links to original images from wikipedia into gui.

