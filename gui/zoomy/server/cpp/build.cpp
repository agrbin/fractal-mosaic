#include <cstdio>
#include <cassert>
#include <cstdlib>

#include "const.h"

uchar bmps[kMaxN][kRows][kCols][3];

int main() {
  FILE *fp;
  char *line = NULL;
  size_t len = 0;
  ssize_t read;
  int img = -1;
  int x, y, r, g, b;

  fp = fopen(inputFile, "w");
  assert(fp != NULL);

  while ((read = getline(&line, &len, stdin)) != -1) {
    if (line[0] == '#') {
      img++;
      printf("%d\n", img);
      continue;
    }
    sscanf(line, "%d,%d: (%d,%d,%d)", &y, &x, &r, &g, &b);
    bmps[img][x][y][0] = r;
    bmps[img][x][y][1] = g;
    bmps[img][x][y][2] = b;
  }

  assert(fwrite(bmps, sizeof bmps, 1, fp) == 1);
  return 0;
}
