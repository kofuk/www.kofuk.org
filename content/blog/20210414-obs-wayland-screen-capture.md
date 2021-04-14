---
title: "OBS StudioにWaylandのスクリーンキャプチャが入ったので試してみた"
date: 2021-04-14T16:40:06+09:00
---

前 Wayland のスクリーンキャプチャの Pull Request 入りたがってたなとか
思ってリポジトリ見に行ったら、認識していたものは Close されてたんだけど、
他の Pull Request がマージされてて Wayland でもスクリーンキャプチャできるようになってた。

試してみたのが下の動画。

{{< youtube zgq6RSKclWA >}}

こういう部分あんまり知らんのでよく分からないんだけど PipeWire を使うと取れるらしい。

一応方法を。

1. OBS の HEAD を clone してきてビルドする。Browser Source 用っぽいところでコケたら
    `-DBUILD_BROWSER=OFF` で無効にしてやればおk。
1. install する。適当なパスでいい。
1. インストール先の `lib` ディレクトリを `LD_LIBRARY_PATH` に足す。
1. 環境変数 `OBS_USE_EGL` を設定してから開く。こういうハックが必要なのは GNOME 上だけかも
    (Qt は GNOME 上での Wayland のサポートを意図的に無効化しているので)。

あと必要なパッケージをインストールする。

```plaintext
$ sudo pacman -S xdg-desktop-portal xdg-desktop-portal-gtk
```

イマイチ分からんけどこれがないと動かなかった。
ディスプレイとかウィンドウ選ぶダイアログ出すため？

こうすればソース追加するメニューに `ScreenCaputre (PipeWire)` というのが出てくるので
それで全画面のキャプチャができる。同様に単一のウィンドウのキャプチャもできる。

現状ウィンドウの枠の外の影の部分 (半透明で描画されている) 部分は黒くなってしまうっぽいので、
諦めて全画面でやるか切り取るかするしかない。
