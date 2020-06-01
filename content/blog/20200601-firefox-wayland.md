---
title: "Firefox on Wayland"
date: 2020-06-01T16:19:55+09:00
---

XWayland だとスケーリングしたときにぼやける問題があるので，Wayland を使うようにする。

今の段階だと `MOZ_ENABLE_WAYLAND=1` という環境変数があった場合は Wayland を使う
ようになっている。毎回端末から実行すれば当然できるが，それは面倒なのでアイコンをクリックしたときでも
Wayland を使う設定で普通に起動するようにしたい。

同じ方法で Thunderbird にも Wayland を使わせることができる。

## 方法1: `.bashrc` とかに書く

一番簡単。でも僕はむやみに環境変数足したくない派（全然関係ないプロセスからアプリケーション固有の
設定が見えるのが無駄な感じがする）なのでこの方法はあまり好きじゃない。

## 方法2: デスクトップエントリーをいじる

`/usr/share/applications/firefox.desktop` を `~/.local/share/applications/` に
コピーしてきて `Exec` の行のコマンドの先頭に `env MOZ_ENABLE_WAYLAND=1` を追加する。
本当は差分だけ編集したい（systemd のユニットファイルみたく）けどそういう方法では動かなかった。
