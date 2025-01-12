---
title: "Waylandで動いているかXWaylandで動いているか見分ける"
date: 2020-06-01T17:26:40+09:00

tags:
  - tech
  - GNU/Linux
---

小数単位でのスケーリングをしていたら XWayland のアプリケーションは
ぼやけているので自明な感じはあるが，面白い（かつ見た目が良い？）見分け方を
見つけたので。

1. xeyes を起動する。
1. マウスを動かしてみる。

簡単ですね！

マウスをいろんなウィンドウの上に動かしてみて目が動くウィンドウは XWayland，
目が動かないウィンドウは Wayland で動いている。

## 参考

- https://medium.com/@bugaevc/how-to-easily-determine-if-an-app-runs-on-xwayland-or-on-wayland-natively-8191b506ab9a
- xeyes のソースコード: https://gitlab.freedesktop.org/xorg/app/xeyes
