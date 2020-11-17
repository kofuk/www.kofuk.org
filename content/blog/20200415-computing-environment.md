---
title: "環境のメモ"
date: 2020-04-15T21:59:59+09:00
lastmod: 2020-11-17T14:53:03+09:00

tags:
  - development
---

どうでもいいけど今の環境

- ThinkPad X1 Carbon
- Arch Linux
- GNOME

以下，思いついたら追記する。

# 入れる

このへんは base-devel

- make
- gcc
- automake

その他

- clang
- cmake
- Emacs（ビルド）
- vim（設定いじる時用。あと xxd 目当てで）
- ninja（mozc のビルドにいる）
- mozc（自分のリポジトリからビルド）
- texlive-langjapanese, texlive-latexextra, texlive-pictures
- poppler-data（poppler とセットで入らない意味がよくわからない）
- firefox-developer-edition（署名せずに拡張機能使いたい）
- thunderbird

# コピーして引っ越さないといけない系

- `~/Documents` （TeX のゴミファイルは消した方がいいかも）
- `~/source` 以下ゴソッと。`~/source/aur` はいらない。
- `~/.ssh`

# セットアップ

- SSH 鍵
- `dotfiles` を clone して install
- `.emacs.d` を clone

# 他の設定

- `gsettings set org.gnome.desktop.input-sources xkb-options "['ctrl:nocaps']"`
- `gsettings set org.gnome.desktop.wm.preferences button-layout 'close,minimize,maximize:appmenu'`
- Firefox, Thunderbird の言語を日本語に && Wayland を使うことにする。ウェイウェイ
- いらない desktop entry がたくさんあるので `~/.local/share/applications` に `/dev/null` への symlink をたくさんつくって消す
- ~~`/etc/default/grub` をいじって起動時のログを冗長にする~~ GRUB じゃなくて systemd-boot 使えばいいや
- ibus が起動してくれなかったらなんとかする
- PHP で SQLite が使えるように設定ファイルを足す（ファイル名は何でもいいけど `/etc/php/conf.d/sqlite.ini` とかに）

```ini
extension=pdo_sqlite
```
