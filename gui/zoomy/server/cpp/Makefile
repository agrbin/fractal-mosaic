SMALL_DIR=../../../../data/big-dataset/thumbnails
LIBJPEG_INSTALL=$(HOME)/install/lib/
MAXID=65535
VPATH=bin

CXX=g++ -O3 -Wall -Wextra -L$(LIBJPEG_INSTALL)
CC=gcc -O3

all: montage build

libjpeg-example.o: libjpeg-example.c
	$(CC) -c libjpeg-example.c -o bin/libjpeg-example.o 

montage: montage.cpp const.h libjpeg-example.o
	$(CXX) montage.cpp bin/libjpeg-example.o -obin/montage -lturbojpeg -ljpeg

build: build.cpp const.h
	$(CXX) build.cpp -obin/build

small.dump: build
	bash -c 'for i in {0..$(MAXID)}; do \
		convert $(SMALL_DIR)/$$i.bmp txt:-; \
	done | ./bin/build'

clean:
	@echo "if you want to clean small.dump, erase it yourself."
	rm -rf bin/montage bin/build bin/*.o

