---
title: "CMake on Windows (ライブラリの解決関係)"
date: 2021-02-19T18:07:32+09:00
tags:
  - tech
  - cmake
---

zlib とか libpng とかをビルドして、適当に `C:\usr` とかに配置してたら
CMake が認識してくれなかった。

`-DCMAKE_PREFIX_PATH` で `C:\usr` を指定してやれば解決。

```bat
> cmake -DCMAKE_PREFIX_PATH=C:\usr ..
```

このパスが複数ある場合 (例えばライブラリごとにインストールされているパスが違う場合)
は CMake のリスト (セミコロン `;` で区切る) で渡せばよい。

### 参考

- [CMAKE_PREFIX_PATH — CMake 3.20.0-rc1 Documentation](https://cmake.org/cmake/help/latest/variable/CMAKE_PREFIX_PATH.html)
