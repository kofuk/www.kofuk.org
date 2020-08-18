---
title: "WindowsにCMakeのプロジェクトを移植する"
date: 2020-06-08T16:36:59+09:00
tags:
  - development
  - Windows
---

UNIX で Makefile 生成してビルドしていたような CMake のプロジェクトを Windows に移植する。

ここでは Visual Studio について言及するとき Visual Studio 2019 を前提とする
（というか試せる環境がそれしかない）が多分そこにはそんなに依存していないはず。

とりあえず言えることは，CMake で Visual Studio のプロジェクトを生成する方法は Make
を使ったプロジェクトとビルドシステムの設計というか思想が違いすぎてその差異を CMakeLists.txt
で吸収するのは無理だと思う（たぶん単純なプロジェクトだと大丈夫だけど凝ったことをしようとすると
すぐ詰む）。書くの面倒臭いので飛ばすけど Visual Studio は CMake では Multi-config
という扱いになって Makefile とはちょっと違う環境になるので。
というわけで，NMake の Makefile を生成するのが簡単な方法だと思う。
この方法だと最小限のプラットフォーム固有の（cmake の）コードでビルドが通るようにできる。

CMake+NMake でビルドするにはまず開発者向け PowerShell を起動する。普通の PowerShell と開発者向け
PowerShell の違いはいろいろな開発用のユーティリティに PATH が通ってることだと思う
（少なくとも表面上はそのくらいの違いくらいしか気づかない）が実際はどうなのか分からない。
この PoweShell は Visual Studio の中から起動することもできるしスタートメニュのエントリーにも
一応ある。

で起動したら普通に Unix でやっているようにディレクトリを作って CMake で Makefile を生成して
nmake ってやればできる。CMake のジェネレータを `cmake -G'NMake Makefiles'`といった
ふうに指定しないといけないのに注意。デフォルトだと Visual Studio のプロジェクトが生成される。
仕組み上 single-config な ninja とかでもできる気がするが試していないので分からない。

まあビルドシステムにビルドの自動化以上のことをさせるなというのはある。
