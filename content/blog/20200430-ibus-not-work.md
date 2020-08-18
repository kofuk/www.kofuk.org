---
title: "GNOME Shell 3.36 で IBus が使えない対処"
date: 2020-04-30T00:50:12+09:00

tags:
  - GNU/Linux
---

IBus が自動起動しない（というか起動はしてるけど使えない）のは Wayland のときだけらしい。
たしかに GNOME on Xorg のセッションにすると問題なく IBus が GNOME Shell から
使えるようになっている。

この原因は，Unix ソケットを作るときに Xorg のときは `DISPLAY` 環境変数を見て，
Wayland のときは `WAYLAND_DISPLAY` 環境変数を見ないといけないところを，
IBus はどちらの場合も `DISPLAY` を見ているというところにあるらしい。
今まで Wayland でも動いていたということは GNOME Shell の実装が非標準だった
ということだろうか（よく分からない）。

https://github.com/ibus/ibus/pull/2195

この PR で直っているみたいなので IBus の次のリリースには GNOME Shell on Wayland でも
IBus が動くようになっているはず。
それまでは Wayland じゃなくて Xorg 使うか……。

そういえば `ibus-daemon -drx` とすれば wayland でも IBus が使えるようになる
のだが，なぜか Firefox が既に起動していた場合は Firefox 上だけで
IBus が機能しないので実用上問題があった。
