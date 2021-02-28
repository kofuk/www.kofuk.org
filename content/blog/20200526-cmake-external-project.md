---
title: "CMakeのExternalProject"
date: 2020-05-26T18:34:10+09:00

tags:
  - development
  - CMake
---

これで良いのかは分からないが，まあ動くっぽいのでヨシッ！
厳密なこと言うといくらでもダメな状況ってのが出てきそう。

```cmake
cmake_minimum_required(VERSION 3.15)
project(ext_sample CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_STANDARD_REQUIRED ON)

include(ExternalProject)

ExternalProject_Add(zlib_project
  URL https://zlib.net/zlib-1.2.11.tar.xz
  CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${PROJECT_SOURCE_DIR}/zlib)
ExternalProject_Add(libpng_project
  URL https://download.sourceforge.net/libpng/libpng-1.6.37.tar.xz
  CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${PROJECT_SOURCE_DIR}/libpng)

add_library(zlib IMPORTED SHARED)
set_target_properties(zlib PROPERTIES
  IMPORTED_LOCATION ${PROJECT_SOURCE_DIR}/zlib/lib/libz.so)

add_library(libpng IMPORTED SHARED)
add_dependencies(libpng zlib)
set_target_properties(libpng PROPERTIES
  IMPORTED_LOCATION ${PROJECT_SOURCE_DIR}/libpng/lib/libpng.so
  INTERFACE_INCLUDE_DIRECTORIES ${PROJECT_SOURCE_DIR}/zlib/include
  INTERFACE_LINK_LIBRARIES zlib)

find_package(Threads)
find_package(Boost COMPONENTS unit_test_framework)

add_executable(mcmap)
target_include_directories(mcmap PRIVATE
  ${PROJECT_SOURCE_DIR}/libpng/include
  ${PROJECT_SOURCE_DIR}/zlib/include)
target_include_directories(mcmap PRIVATE ${CMAKE_BINARY_DIR})
target_link_libraries(mcmap PRIVATE zlib libpng ${CMAKE_THREAD_LIBS_INIT})

add_subdirectory(block)
add_subdirectory(src)
```

で試しに `ldd` で見てみる。

```shell
$ ldd build/mcmap
	linux-vdso.so.1 (0x00007fffbf7f6000)
	libpng16.so.16 => /tmp/foo/libpng/lib/libpng16.so.16 (0x00007f3a7ffea000)
	libpthread.so.0 => /usr/lib/libpthread.so.0 (0x00007f3a7ff9c000)
	libz.so.1 => /tmp/foo/zlib/lib/libz.so.1 (0x00007f3a7ff7b000)
	libstdc++.so.6 => /usr/lib/libstdc++.so.6 (0x00007f3a7fd9e000)
	libm.so.6 => /usr/lib/libm.so.6 (0x00007f3a7fc59000)
	libgcc_s.so.1 => /usr/lib/libgcc_s.so.1 (0x00007f3a7fc3f000)
	libc.so.6 => /usr/lib/libc.so.6 (0x00007f3a7fa76000)
	/lib64/ld-linux-x86-64.so.2 => /usr/lib64/ld-linux-x86-64.so.2 (0x00007f3a8007c000)
```

あといい感じに `install` を書きましょう（こんな方法が必要なのは Windows でのビルドだけのような気がするが）。

まあ実際に使うときは最初に `find_package` してみてダメだったらフォールバックする
って感じにするかなと。

そういや最近 Windows の `winget` ってのが発表されましたね。
