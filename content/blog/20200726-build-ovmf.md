---
title: "OVMFをビルドする"
date: 2020-07-26T23:02:40+09:00
tags:
  - development
---

OVMF は Open Virtual Machine Firmware の略で，qemu
なんかで UEFI を使いたい場合に `-bios` で指定すると UEFI で使えるようになる。

入れる。

```bash
$ sudo pacman -S nasm acpica
```

拾ってくる。

```bash
$ git clone --depth 1 https://github.com/tianocore/edk2.git
```

もらってくる。

```bash
$ git sumbodule update --init --depth 1
```

ってできると思いきや shallow clone できなかったので

```bash
$ git submodule update --init
```

Submodule で同じリポジトリを 2 箇所にダウンロードしてるの腹立つな。

する。

```bash
$ cd OvmfPkg
```

ビルド。

```bash
$ ./build.sh
```

コンソールに無限行書かれる。

よくわからなかったのでそのまま実行したけど `-n 4` とかやれば並列でいけたらしい。

ビルド結果は `/Build/OvmfX64/DEBUG_GCC5/FV/OVMF.fd`。
