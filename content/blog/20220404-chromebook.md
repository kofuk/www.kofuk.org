---
title: "Chromebook を購入し (て Crostini に Arch Linux を入れ) た話"
date: 2022-04-04T01:18:58+09:00
tags:
  - ChromeOS
  - ArchLinux
---

使ってた iPad のボタンの調子が悪かったので移行先を探していたのですが、
「そういや 2-in-1 の Chromebook とかでいいじゃん」てことで Chromebook [^1] を購入しました。

CPU が遅かったり aarch64 だったりで、Linux をちゃんと使おうとすると辛さがあるような気がしているので、
開発環境として使いたかったら x86 系のものを買っておいたほうが良いと思います。

## 操作感

iPad のかわりにしたくて買ったということもあり、タブレットとして使えるかは割と不安だったんですが、
割といい感じです。キーボードを外すとタッチ用の UI になり、少なくとも最近の Android を使ったことがある人は
操作で迷うということはないと思います。UI 自体もけっこう Android に近い。

## Arch Linux を入れる

操作感とかはどうでもよくてこっちが本題です。

Chromebook の売りの一つが Linux の開発環境を簡単に作れるというものがあります。
この Linux 環境は Chrome OS の Gentoo の環境がそのまま見えるのでなく、Gentoo の上で立ち上げた
コンテナが見えるという感じになっています。で、このコンテナは Debian が入っているのですが、
Arch Linux に慣らされているとパッケージが古くて我慢ならなくなってしまいます。
というわけでこのコンテナに Arch Linux を入れれば……… (ここで黙る) ………というわけです

で、例によって [Arch Wiki に方法が書いてある](https://wiki.archlinux.org/title/Chrome_OS_devices/Crostini)
のでそれを見てやれば基本的にはできます。ただ、日本語版の方法だと内容が古くて、非推奨になってるスクリプトを
使ったりしているので、最初から英語版の方法でやりました (日本語版でもできるのかもしれないけど)。

Arch Wiki を見れば分かることですが、おおまかな流れは以下のような感じです。

1. [LXC のイメージ](https://us.lxd.images.canonical.com/)を使って適当なコンテナを作る
2. コンテナの中をいい感じにする
3. デフォルトのコンテナを消し、さっき作ったコンテナを penguin という名前にする

以下、Wiki に書いてあることからの差分と思える内容を書いていきます。

Arch Linux の公式配布は x86\_64 だけなのですが、Arch Linux ARM の成果物を使った aarch64
用のイメージが配布されており、アーキテクチャ意識せずにインストールできます。

まず、適当なコンテナを作るステップですが、Wiki にある通りうまくいってもエラーが出ます (？？？) が、
本当にエラーの場合もあるらしく、コンテナができていないこともあります。
ぜんぜん調査していないので条件は謎ですが、`lxc list` の中に作ったコンテナがあれば大丈夫そうです。

で、コンテナの中をいい感じにするステップですが、主にやつことは以下のような感じです。

- 任意でユーザ名を変える
- AUR から [cros-container-guest-tools-git](https://aur.archlinux.org/packages/cros-container-guest-tools-git/)
を入れる
- X と Wayland のサーバを立ち上げるようにする
- systemd-networkd と systemd-resolved を使うのをやめて dhclient を使うようにする
(バージョンによっては必要ないらしいが、今回は必要だった)

まず、ユーザ名を変えるステップですが、デフォルトで alarm という謎な名前のユーザが uid=1000 を陣取っています。
名前からしてシステムで使ってそうなのですが、1000 番のユーザだから大丈夫と信じて好きな名前に変えます。

次に AUR から cros-container-guest-tools-git を入れるステップですが、あんまりメンテされていないらしく、
`package()` で失敗する状態でした。`05-cros-fonts.conf` がなくてエラーを吐いていたので、
適当に落としてきた [05-cros-fonts.conf](https://chromium.googlesource.com/chromiumos/containers/cros-container-guest-tools/+/f9243404ec44554e3fa35c868fde21a3e896da04) を使うようにして回避しました。
でも[本当はホストの fontconfig のファイルをバインドマウントするようにするのが正しいっぽい](https://chromium.googlesource.com/chromiumos/containers/cros-container-guest-tools/+/b933792566dcff3b23b5ef7b4b920d794b8bf2ef)
ので後でなんとかしたい。

で、コンテナの中はいい感じにできたものとして、作ったコンテナを penguin という名前にすれば完了です。
どうやら完了後は再起動した方が良いっぽい。

[^1]: [ASUS Chromebook Detachable CM3 CM3000 | Chromebook | ノートパソコン | ASUS日本](https://www.asus.com/jp/Laptops/For-Home/Chromebook/ASUS-Chromebook-Detachable-CM3-CM3000/)
