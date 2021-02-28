---
title: "CMakeのedit_cacheが使えるという話"
date: 2021-02-28T16:39:33+09:00
tags:
  - development
  - CMake
---

CMake で Makefile とか生成したときにできる `edit_cache` ターゲットが実は便利なやつだったと
気づいた。

`edit_cache` すると、すでにビルドディレクトリとして CMake を走らせたディレクトリの
オプションをいろいろ編集できる。
これまでは適当に `CMakeCache.txt` を直接編集してたけど、このツールだともっと楽で安全に編集できるっぽい。

`make edit_cache` とかで起動する。

![edit_cache](/images/20210228-cmake-edit-cache/editcache.png)

するとデフォルトだと `CMAKE_INSTALL_PREFIX` と `CMAKE_BUILD_TYPE` が出るっぽい。
まあ現実的に変えたそうなやつだし妥当だと思う。
なぜか Boost を `find_package` のした結果設定された変数が出てるけどなんでなんでしょうね (にっこり)。

あと `CMakeLists.txt` の中で `option(...)` コマンドを使ってると、これで設定してる変数も出る。便利。

でカーソルキーとか J/K とかで項目選んで Enter 押すと編集。bool だと ON と OFF が切り替わる。
PATH とかだとそこが編集可能になるんだけどカーソル一番後ろにしといて欲しかった。

T を押すと `CMakeCache.txt` に存在する全変数を表示するモードに切り替わる。
コンパイラ変えたいとかだったらここをいじればいいんではなかろうか。

C を押すと編集した内容が保存される。これをしないと編集内容が消えてしまうのちょっと分かりにくいな。
Configure すると `[g] Generate` とかが出現して Makefile を再生成できるんだけど、
`CMakeCahce.txt` が変わってるとどうせ次回 make なんとかってやったときに
Makefile も更新されるので Quit するのと結果は変わらないです。
他のビルドシステムだと変わるのかもしれないけど。

Q を押すとおしまい。

Q
