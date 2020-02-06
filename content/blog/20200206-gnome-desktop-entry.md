---
title: "GNOME のデスクトップエントリー"
date: 2020-02-06T10:44:24+09:00
---

これは GNOME に限らず，XDG 準拠のデスクトップ環境ならどこでも使える気がするんですが。

基本的にデスクトップエントリーのファイルは `/usr/share/applications` か
`/usr/local/share/applications` に作ればいいと思うんですが，権限がないときとか，
システムワイドにインストールしたくない場合とかがある。そのときは `~/.local/share/applications`
に置けばいい。`~/.local` は `/usr/local` に対応していると考えていいっぽいです。

あと，アイコン。デスクトップエントリーのファイルでは，`Icon` というキーでエントリー用のアイコンを
指定できるんですが，これは，テーマごとのアイコンのディレクトリから探索されます。
で，システムにインストールする場合は， `/usr/share/icons` か `/usr/local/share/icons` に
置けばよくて，ユーザーの場合は `~/.local/share/icons` に置けばいい。
`icons` 以下にテーマのディレクトリがあるんですが，だいたいのテーマは `hicolor` を継承しているので，
`/usr/share/icons/hicolor` に置けばいいみたいです。
そしてこれはちょっとハマったんですが，48x48 のアイコンは必ず準備しないと，他の解像度のを用意しても
アイコンが認識されないみたいです。あと，画像のファイルは `icons/テーマ/解像度（e.g. 48x48）/apps`
に置く。解像度のディレクトリに直接置いても認識されないです。

https://developer.gnome.org/integration-guide/stable/icons.html.en
