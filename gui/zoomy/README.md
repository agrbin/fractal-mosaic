observations:

coordinate system should be discrete to play well with caching systems.
image generation should be a real recursive fractal generation.
each output image should be in same resolution, say 256x144 (or 8x8 small imgs)


FrameHolder holds Frames
Frame {
  id, frame of what image?
  x, y current upper left corner
  wdith, height, current width, height (always in 16:9)
}

If Frame goes out of the screen, destroy it.
If Frame is large enough that when tiled, only max 4 images are on the screeen,
   chunkify it.


