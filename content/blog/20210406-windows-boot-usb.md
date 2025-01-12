---
title: "Arch LinuxでWindowsの起動USBを作る方法"
date: 2021-04-06T00:03:07+09:00
tags:
  - tech
  - Windows
  - Arch Linux
---

Windows のイメージは Microsoft のサイトからダウンロードできるが、
クソデカファイルが含まれているので、そのまま焼いても (USB の作成は成功したように見えるが)
壊れた起動 USB ができている。

FAT32 は 1 ファイルのサイズには 4 GiB の制限があるが、ISO ファイルには 5 GiB 超の
ファイルが入っているのでそのまま焼くことができない。
このクソデカファイルを分割することで、この制限を突破することができるので、
その方法で起動用の USB を作成する。

## 1. USB を FAT32 でフォーマットする

普通。コマンドでやるなら下みたいな感じかな。

```plaintext
# parted /dev/sdb
(parted) mklabel msdos
(parted) mkpart primary fat32 0% 100%
(parted) q
# mkfs.fat -F32 /dev/sdb1
```

## `sources/install.wim` 以外をコピーする

ダウンロードしてきたイメージをマウントし、中のファイルをコピーする。
cp でやるなり rsync 使うなりお好みで。

ただし、`install.wim` だけは 4 GiB を超えているのでコピーしない。

## `install.wim` を分割して入れる

`install.wim` を `wimlib` というツールを使って分割する。
Arch Linux の場合は pacman でインストールできる。

```plaintext
# wimlib-imagex split <ISO のマウントポイント>/sources/install.wim <USB のマウントポイント>/sources/install.swm 3800
```

完成。おしまい。
