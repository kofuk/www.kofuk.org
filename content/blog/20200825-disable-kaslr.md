---
title: "KASLRを無効化する"
date: 2020-08-25T15:38:55+09:00

tags:
  - development
  - linux
---

Linux カーネルには Kernel address space layout randomization
という仕組みがある（別に Linux カーネルじゃなくてもあると思うが）。
これはカーネルのコードが置かれる仮想アドレスを起動するたびにランダムにするというもので，
悪意のあるソフトウェアのカーネルへの攻撃を難しくしている。ってのはまあどうでもいい話。

で，これ，セキュアになるのはいいんだけどあんなことやこんなことをする時（つまり自分が悪意のある側，
とまではいかないが何かの手段としてそれに近いことをしようとした場合）に
面倒臭いことがあって，かといって自分で無効化してコンパイルし直すのもなということでメモ。

`nokaslr` をカーネルパラメータに追加する[^1]だけ。終了。

[^1]: 一応これをデフォルトにするのは良くない気がするので，起動時に GRUB で変えてやるのがいいと思う。