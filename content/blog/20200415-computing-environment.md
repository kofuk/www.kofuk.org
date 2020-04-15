---
title: "環境のメモ"
date: 2020-04-15T21:59:59+09:00

tags:
  - development
---

どうでもいいけど今の環境

- ThinkPad X395
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
- firefox
- thunkderbird

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
- Firefox, Thunderbird の言語を日本語に
- いらない desktop entry がたくさんあるので `~/.local/share/applications` に `/dev/null` への symlink をたくさんつくって消す
- `/etc/default/grub` をいじって起動時のログを冗長にする
- ibus が起動してくれなかったらなんとかする
