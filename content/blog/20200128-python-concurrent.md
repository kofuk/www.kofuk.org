---
title: "Python の並列処理とか"
date: 2020-01-28T21:01:50+09:00

tags:
  - development
  - python
---

先日作った Minecraft のマップ画像を生成するやつが遅すぎる（7min/region）のをなんとかしたいので，
Python で並列処理をする方法を調べて使ってみた。

# Thread

`concurrent.futures.ThreadPoolExecutor` を使うというもの。別に pool 使わなくてもいいけど。
でもまあ pool 使った方がいいでしょってことで。

この方法では結局 GIL のせいか全然速くならなかった。むしろ遅くなった。たしか 11min/region
とかになった気がする。

Python で Thread を使うのは，主に IO がネックになってる場合っぽい。IO の待ち時間は
GIL が解除されるけど，その他の状況では GIL のせいで並列処理というよりむしろ
並行処理になってる。

# Process

`concurrent.futures.ProcessPoolExecutor` を使うというもの。
fork できる環境（主にUNIX 系の OS？）ではデフォルトで fork になるって書いてあった。
これがなかなか速くて，なんでか 2 つしかプロセス起動してないのに半分未満の時間で処理できた。
Windows とかでは fork できないから遅いのかもしれないけど，Windows 使ってないのでよくわからない。

ただ厄介な点は親じゃないプロセスで例外が上がってもバックトレースが出ないという点。`print` はできるけど。
僕のやりかたがおかしいのかもしれないけど，別のプロセスで動かすところを修正するときはプロセスを立ち上げない
ようにしてテストした。
