---
title: "EmscriptenでJSとCで相互にデータをやり取りする"
date: 2021-12-02T11:09:21+09:00
tags:
  - Emscripten
  - WebAssembly
  - C
  - C++
---

Emscripten で JavaScript の世界と C の世界でデータをやり取りする方法をメモ (with ccall/cwrap)。

## C や C++ 側で必要なこと

Emscripten でコンパイルすると、`main` から到達できないコードは dead code elimination でサクサク消されちゃうので
関数に `EMSCRIPTEN_KEEPALIVE` を付けて消されないようにしておく必要がある
(`EMSCRIPTEN_KEEPALIVE` 自体は `__attribute__((used))` に展開されるっぽい。環境によるとは思うけど)。

コンパイルは

```console
$ emcc -s WASM=1 -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS="['ccall']" -o index.html main.cc
```

とかで。`NO_EXIT_RUNTIME` にしておくことで、 `main` を実行したあとランタイムを止めるというデフォルトの挙動を変更できる。
`ExPORTED_RUNTIME_METHODS` に `cwrap` とかを入れておくと cwrap から使えるようになる。

## ccall や cwrap で関数を呼び出すときの基本的な方法

```js
Module.cwrap('hoge', 'string', 'number')(5);
```

みたいな感じで C の関数を呼び出せるが、問題は引数と戻り値のところに何を入れるかということになる。

一応使える型は表のような感じらしい。

名前        | 用途
-----------|-----
`'string'` | C 文字列を JavaScript 側に渡すときに指定できる (それらしい記述は見当たらなかったが、wasm の世界に渡す向きはちゃんと動かないっぽい (エラーは出ないが))
`'array'`  | 単純な配列か Uint8Array か Int8Array を C 側に渡す (戻り値側に書くとエラー)
`'number'` | 整数、実数、ポインタ何にでも使える。具体的な型は意識しなくていいっぽい。

## ポインタについて

ポインタは `HEAPU8` の配列のインデックスになる。JavaScript 側で `HEAPU8` から `malloc`, `free` するには
`Module._malloc`, `Module._free` する。ヒープにデータを置くときは `HEAPU8.set()` する。

あと同じ配列への参照で `HEAP8` (符号付き8ビット整数)、`HEAP32` とかいろいろあるっぽい。ビット幅が違う参照はインデックスも
変わるので注意。

これ知ってるだけで (推奨される方法かどうかはさておき) 一通り動くものはできそう。

### 参考

- [Interacting with code — Emscripten 3.0.1-git (dev) documentation](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code-ccall-cwrap)
