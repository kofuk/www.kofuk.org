---
title: "Emacsをビルドするときにconfigureがうまくいかない場合の対処法"
date: 2019-07-31T10:00:00+09:00

tags:
  - tech
  - Emacs
---

たしか Ubuntu だと `libgnutls28-dev` を入れても `configure` スクリプトで認識されなかった。
その場合、 `pkg-config` を明示的にインストールしてやるとそれらのライブラリが認識されて
ビルドが通る。

これは。 `configure` スクリプトで `pkg-config` の結果がデフォルト値に設定されていて、
コマンドライン引数でそれを上書きできるという作りになっているからっぽい (だからオプションで指定しても
いいはず。面倒臭いけど)。
