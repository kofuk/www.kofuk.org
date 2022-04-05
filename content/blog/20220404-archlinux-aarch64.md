---
title: "QEMUで雑に作るArch Linux ARMビルド環境"
date: 2022-04-04T20:36:34+09:00
lastmod: 2022-04-05T21:36:47+09:00
tags:
  - development
  - ArchLinux
---

QEMU で起動するのが楽な Alpine Linux で aarch64 な Linux 環境を作り、
その中でブートストラップした Arch Linux ARM に chroot して使ってやろうというもの。

Alpine も Arhc も小さいのでビルドしようとするものによるが、tmpfs だけで戦える可能性が十分ある。
bazel と mozc のビルドをやったが、16 GB メモリのマシンで tmpfs しか使わずに作業が終わった (ビルド後にいらなくなった一時ファイルを消したりはしたが)。

## 準備

- aarch64 の仮想マシンの実行には [qemu-arch-extra](https://archlinux.org/packages/extra/x86_64/qemu-arch-extra/) が必要なので事前に入れておく。
- Alpine のイメージを[公式サイト](https://www.alpinelinux.org/downloads/)から落としておく。
多分どれでもいいが、今回は standard を使った。
- UEFI を使うため、[edk2-armvirt](https://archlinux.org/packages/extra/x86_64/edk2-armvirt/) を入れる。

## QEMU のイメージの準備

サイズとかは適当に。後で拡張したりできるので大袈裟に気にすることはない (ちょっとめんどくさいが)。

```shell
$ qemu-img create -f qcow2 alpine.qcow2 8G
```

## インストール

ダウンロードした Alpine のイメージを CD-ROM として使って QEMU を起動する。

```shell
$ qemu-system-aarch64 \
      -m 1G -nic user -M virt -cpu cortex-a57 -smp $(nproc) \
      -bios /usr/share/edk2-armvirt/aarch64/QEMU_EFI.fd \
      -nographic \
      -cdrom alpine-standard-3.15.3-aarch64.iso \
      -hda alpine.qcow2
```

`-smp` でコア数を指定しないと、遅いエミュレーションで 1 コアで頑張るみたいなことになってしまうので注意が必要。

エミュレートする CPU は、今回は適当に Cortex-A57 にしたが、ちゃんと調べて
実際に使うマシンに載っているものと近いものを選んだ方が良いとは思う。

起動したら `setup-alpine` コマンドでインストールしていく。
終わったら `poweroff`。

## 2 回目の起動

CD-ROM のオプションなしで立ち上げる。インストールしたイメージが使われていればとりあえず成功。

```shell
$ qemu-system-aarch64 \
      -m 1G -nic user -M virt -cpu cortex-a57 -smp $(nproc) \
      -bios /usr/share/edk2-armvirt/aarch64/QEMU_EFI.fd \
      -nographic \
      -hda alpine.qcow2
```

使いたいパッケージがあればここで `apk` で入れてもいい。

## Arch Linux 環境の構築

[Arch Linux ARM の rootfs の tarball](https://archlinuxarm.org/about/downloads) を落としてくる。
AArch64 Multi-platform のものにしておけば無難だと思う。

chroot 用のディレクトリを作る。ここでは `chroot` という微妙な名前のものにした。

```shell
$ mkdir chroot
```

chroot 用のディレクトリの中に必要なディレクトリをマウントしていく。

```shell
$ mount -t proc proc ./chroot/proc
$ mount -t sysfs sys ./chroot/sys
$ mount -o bind /dev ./chroot/dev
$ mount -o bind /dev/pts ./chroot/dev/pts
```

なんでも `/dev/pts` をバインドマウントしておかないと `pacman` が動かないんだとか。試してないけど。

で、いざ chroot。

```shell
$ chroot ./chroot bash
```

そのまま `pacman -Syu` しようとしたらデバイスの空き容量のチェックに失敗してこけてしまったので、
現場猫案件だがチェックを無効化してなんとかする。

```shell
$ sed -i 's/^CheckSpace$/#CheckSpace/' /etc/pacman.conf
```

いろいろ設定

```shell
$ pacman-key --init
$ pacman-key --populate archlinuxarm
$ pacman -Syu
```

root で作業するといろいろアレになりがちなので適当なユーザで作業できるようにしていく。
デフォルトで alarm というユーザがいるのでこいつをいい感じにする。
作業用のユーザが root になれるように sudo を入れる。


```shell
$ pacman -S sudo
$ usermod -aG wheel alarm
$ passwd alarm
```

alarm ユーザに切り替える。

```shell
$ su - alarm
```

おしまい。

`base-devel` すら入っていないのでここからいろいろ入れていく必要あり。

### 参考にしたサイト

- [Installing ArchLinux inside an Alpine chroot - Alpine Linux](https://wiki.alpinelinux.org/wiki/Installing_ArchLinux_inside_an_Alpine_chroot)
- [QEMUにaarch64版のAlpine Linuxをインストールする – Ideal Reality](https://ideal-reality.com/computer/linux/qemu-alpine-virt/)
- [Package Signing | Arch Linux ARM](https://archlinuxarm.org/about/package-signing)
