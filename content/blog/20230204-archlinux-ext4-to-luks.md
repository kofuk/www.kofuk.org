---
title: "Arch Linuxでext4のrootfsをLUKSで暗号化する"
date: 2023-02-04T20:25:16+09:00
tags:
  - Linux
  - Arch Linux
---

既存のファイルシステムを暗号化もできるらしい。
とりあえず使い捨ての環境でやってみたのでメモしておく。使ってる環境でやるならバックアップ取ってからやった方がいいと思う。

まず、Arch のインストールメディアで起動する。

ここでは `/dev/nvme0n1p2` に rootfs があって、それ以上は分割されていないものとする。
複数のパーティションを 1 つの暗号化パーティションに入れることができるかは分からない。

LUKS のヘッダ分のスペースを空けないといけないので、まず ext4 のファイルシステムを縮小する。
僕はデータが入り切る最小サイズまで縮小した。計算が得意な人はギリギリのサイズに縮小してもいいと思うけど、
ext4 だとデータはあんまりバラけてないはず（多分）なのでどのくらい意味があるのかは不明。
（あと、僕はどうせミスる）

```plaintext
# e2fsck -f /dev/nvme0n1p2      # e2fsck しないとリサイズさせてもらえない
# resize2fs -M /dev/nvme0n1p2
```

で、ファイルシステムのサイズがパーティションよりも 16 MiB 以上小さいことを確認する。
空きがなかったら後ろの方が切れてしまうので、データを消してやり直そう！

確認できたらパーティション全体を暗号化する。かなり時間がかかる。

```plaintext
# cryptsetup reencrypt --encrypt --reduce-device-size 16M /dev/nvme0n1p2
```

暗号化できたら復号されたボリュームを map する。

```plaintext
# cryptsetup open /dev/nvme0n1p2 arch_root
```

中に入っている ext4 のファイルシステムをパーティション全体まで拡大する。

```plaintext
# e2fsck -f /dev/mapper/arch_root
# resize2fs /dev/mapper/arch_root
```

いつも通り `/mnt` にマウントする。

```plaintext
# mount /dev/mapper/arch_root /mnt
# mount /dev/nvme0n1p1 /mnt/boot
```

必要なら `/` が `/dev/mapper/arch_root` を見るように fstab をいじる。
多分中に入っている ext4 の UUID になるのでここは多分変える必要はない。

`mkinitcpio.conf` の `HOOKS` に encrypt を加える（`filesystems` より前に）。

```bash
HOOKS=(base udev autodetect modconf kms keyboard keymap consolefont block encrypt filesystems fsck)
```

Linux のブートパラメータをいじる。僕は systemd-boot を使っているので `/boot/loader/entries/arch.conf`

```plaintext
title	Arch Linux
linux	/vmlinuz-linux
initrd	/initramfs-linux.img
options	cryptdevice=UUID=7e9aade5-b65a-4dac-9d1c-1eb7015374f1:arch_root root=/dev/mapper/arch_root rw
```

これで起動時にパスワードを入れると復号されるようになった。

起動時に自動で復号したい場合は[こっちの記事](https://www.kofuk.org/blog/20230204-archlinux-luks-lvm/#tpm2-%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E8%B5%B7%E5%8B%95%E6%99%82%E3%81%AB%E5%BE%A9%E5%8F%B7)を参考に。
