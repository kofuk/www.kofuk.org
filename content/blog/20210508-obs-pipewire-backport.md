---
title: "OBS StudioのPipeWireキャプチャが古いリリースでも動くようにしてみた"
date: 2021-05-08T16:35:02+09:00
tags:
  - development
---

今リリースされているバージョンの OBS Studio では Wayland 上で画面キャプチャができない。
OBS の master ブランチには PipeWire を使用した画面キャプチャが入っているので、
それを今のリリースされているバージョンに読ませて画面キャプチャできるようにしてみた。
これを `/usr/lib/obs-plugins` に置けば使えるはず。
(そのままビルドしただけでは動かないので適当に下みたいなパッチを当てた。)

[ビルドした linux-capture.so (消えてるかも)](https://www.dropbox.com/s/awksj7lpgg71am5/linux-capture.so?dl=0)  
sha256: `693caf89788be465dfb813fd2c4662280fa2fbe218900dad3ad6111eec2926a6`

適当に新しいやつのソース取ってきてビルドすればいいやんという話ではある。

{{< gist kofuk b9fe6387fd73e99452bd7b4f7e6dc5f0 >}}
