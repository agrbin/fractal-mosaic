#include <cstdio>
#include <cassert>
#include <cstdlib>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/mman.h>

#include "jpeglib.h"
#include "const.h"

// 113mb


int image_width = kColsOut;
int image_height = kRowsOut;
JSAMPLE* image_buffer;

extern "C" {
  GLOBAL(void) write_JPEG_file (FILE *fp, int quality);
};

int n, m, *mosaic;
uchar *bmps;

void loadBmps() {
  int fd = open(inputFile, O_RDONLY);
  assert(fd != -1);
  bmps = (uchar*) mmap(NULL, kMaxN * kRows * kCols * 3, PROT_READ, MAP_SHARED, fd, 0);
}

#define BMPS(a,b,c,d) \
  bmps[(a) * kRows * kCols * 3 + (b) * kCols * 3 + (c) * 3 + (d)]

int sol[kRowsOut][kColsOut][3];

void solve() {
  for (int x = 0; x < kRowsOut * filter; ++x) { // 144
    for (int y = 0; y < kColsOut * filter; ++y) { // 256
      int mx = x * kRows * n / kRowsOut / filter; // 18
      int my = y * kCols * m / kColsOut / filter; // 32
      int img = mosaic[mx / kRows * m + my / kCols];
      for (int c = 0; c < 3; ++c) {
        sol[x / filter][y / filter][c]
          += BMPS(img, mx % kRows, my % kCols, c);
      }
    }
  }
  for (int it = 0; it < image_width * image_height * 3; ++it) {
    image_buffer[it] = ((int*)sol)[it] / (filter * filter);
  }
}

int main() {
  image_buffer = (JSAMPLE*) malloc(
    image_width * image_height * 3 * sizeof (JSAMPLE)
  );
  loadBmps();
  scanf("%d%d", &n, &m);
  mosaic = new int[n * m];
  for (int i = 0; i < n * m; ++i) {
    scanf("%d", mosaic + i);
  }
  solve();
  write_JPEG_file(stdout, 75);
  return 0;
}
