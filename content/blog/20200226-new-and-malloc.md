---
title: "new と malloc(3) を混在させていいのか"
date: 2020-02-26T23:33:11+09:00

tags:
  - tech
  - C
  - C++
---

という議論が [ここ](http://blogs.wankuma.com/jitta/archive/2007/01/09/55215.aspx)
にあったけど（2007 年……古い……！），`malloc(3)` で取ってきたメモリを
`delete`（もしくは `delete[]`）に渡してはいけないとか，`new` で取ってきた
メモリを `free(3)` に渡してはいけないのに `malloc(3)` を読んだり `new` したり
しても問題ないってのはなんか奇妙な話な気がしてきた。
（普通に C++ 書いていれば malloc には用がないけど）。
なぜかというと，どちらのメモリも `malloc(3)` が管理していないと，
同じ領域が別の用途で使われてしまうということになるので。
で，`new` で取ってきたのも `malloc` が管理しているんだったら，
`delete` しても `free(3)` に渡されるだけだから，
デストラクタとかがなければ問題にならない気がする。

と思って gdb でアタッチして試したら実際に `malloc` が呼ばれてるっぽい。
まあ仕様上未定義ってだけだよね。

まあ `new` と `malloc` 混在させてはいけないとかだと C++ から C のライブラリ
使うと死ぬ訳で………。

しかし `getline(3)` とかは内部で多分 malloc するんだけど，glibc のじゃない
カスタムのメモリアロケータ（tcmalloc とか）を使う場合は呼ぶと危険な関数になるってことだろうか……。
そうだとしたら不便。

# 参考

- https://github.com/gperftools/gperftools/blob/master/src/tcmalloc.cc
- https://japan.googleblog.com/2009/05/google-4-performance-tools.html
