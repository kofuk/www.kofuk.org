---
title: "Android の Factory Image を Linux でマウントする"
date: 2019-10-12T10:00:00+09:00

tags:
  - tech
  - GNU/Linux
  - Android
---

Google からダウンロードできる Nexus用 (もしくは Pixel用) のFactory Image は
Linux でそのままマウントすることはできません.

```console
$ sudo mount system.img system
mount: /home/kofu/Downloads/razorg-JLS36C/tmp: wrong fs type, bad option, bad superblock on /dev/loop6, missing codepage or helper program, or other error.
```

これをマウントするためには, `simg2img` というコマンドを利用します.
APT で入ります.

```console
$ sudo apt install simg2img
$ simg2img system.img out.img
$ sudo mount out.img system
```

`simg` ってのは何かというと, `img` の空の領域を圧縮してサイズを小さくしたものらしい
([simg2img の simg とは何か？ (make_ext4fs コマンドなど)](https://www.talkwithdevices.com/archives/197)).

