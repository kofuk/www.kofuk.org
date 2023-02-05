---
title: "Arch Linuxを暗号化したディスクにインストールする"
date: 2023-02-04T15:45:38+09:00
tags:
  - Linux
  - Arch Linux
---

Arch Linux を LVM on LUKS の root filesystem にインストールしたのでメモ。
LVM を使うこと自体は完全にオプションで、LUKS の上に ext4 のファイルシステムを作っても別に良い（はず）。

これがどういう構成かというと、物理パーティションの上に LUKS で暗号化したパーティションを作り、
その上の LVM2 の LV の上の ext4 のパーティションに rootfs を作るというもの（オフチョベットしたテフをマブガッドしてリットにしてそうな説明）。

（意外にもとハマらずにできたので情報としての価値は低めです。）

[インストールガイド](https://wiki.archlinux.jp/index.php/%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%82%AC%E3%82%A4%E3%83%89)
に従ってパーティションを切るところまでやる。

パーティションはこんな感じで切った。

ディレクトリ | 範囲         | 説明
----------|--------------|-------------------
`/boot`   | 1 MiB--1 GiB | ブートローダとか諸々用
`/`       | 残り全部       | 残りのディレクトリ用。暗号化する。LVMを使うので後で分割も可能。

`/boot` 大きめっすね。

ファイルシステムを作る。`/boot` は普通。

```plaintext
# mkfs.vfat -F32 /dev/nvme0n1p1
```

もう一個のパーティションを LUKS でフォーマットしてマウントする。

```plaintext
# cryptsetup luksFormat /dev/nvme0n1p2
# cryptsetup open --type luks /dev/nvme0n1p2 arch_cryptroot
```

で、LVM の LV を作って ext4 に

```plaintext
# pvcreate /dev/mapper/arch_cryptroot
# vgcreate vgroot /dev/mapper/arch_cryptroot
# lvcreate -l 100%FREE vgroot -n root
# mkfs.ext4 /dev/mapper/vgroot-root
```

いつも通り（いつも通りって何だよって話ではあるが）マウントする。

```plaintext
# mount /dev/mapper/vgroot-root /mnt
# mkdir /mnt/boot
# mount /dev/nvme0n1p1 /mnt/boot
```

Arch のブートストラップとか。LVM がマウントできるように `lvm2` パッケージも入れる。

```plaintext
# pacstrap -K /mnt base base-devel linux linux-firmware lvm2 vim
# genfstab -U /mnt >>/mnt/etc/fstab
```

`genfstab` が普通に動いてるっぽかったのでちょっとびっくりした。

chroot

```plaintext
# arch-chroot /mnt
```

タイムゾーンとかローカライズとかをいい感じにする。（省略）

起動時に LUKS と LVM のマウントができるように `/etc/mkinitcpio.conf` の `HOOKS` に `encrypt` と `lvm2` を追加する。
`filesystems` の前じゃないといけないらしい。

```plaintext
HOOKS=(base udev autodetect modconf kms keyboard keymap consolefont block encrypt lvm2 filesystems fsck)
```

initcpio を再生成

```plaintext
# mkinitcpio -p linux
```

systemd-boot[^systemd-boot] を使ってブートするようにする。

```plaintext
# bootctl install
```

systemd-boot の設定ファイルを作る。`/boot/loader/entries` の中なら何でもいいが、ここでは `arch.conf` という名前にした。

```plaintext
title	Arch Linux
linux	/vmlinuz-linux
initrd	/initramfs-linux.img
options	cryptdevice=UUID=439d2c50-2f60-499a-9819-fea0d2e1adb9:arch_cryptroot root=/dev/mapper/vgroot-root rw
```

UUID のところには `blkid /dev/nvme0n1p2` とかで取ってきた実際の UUID、`:` 以降は `/dev/mapper` にできるファイル名（なんでもよい）をいれる[^encrypt-hook]。

これで起動時にパスワードを入れたら動く状態になる。他の設定はお好みで。

## TPM2 を使って起動時に復号

Clevis[^clevis] を使う。

Clevis と mkinitcpio のフックを使って、起動時に復号する。
AUR から [mkinitcpio-clevis-hook](https://aur.archlinux.org/packages/mkinitcpio-clevis-hook) をインストールする。

`mkinitcpio.conf` の HOOKS の `encrypt` の前に `clevis` を追加する。

```plaintext
HOOKS=(base udev autodetect modconf kms keyboard keymap consolefont block encrypt clevis lvm2 filesystems fsck)
```

Clevis の bind というやつをする。

```plaintext
# clevis luks bind -d /dev/nvme0n1p2 tpm2 '{}'
```

**追記**:  
`{}` の部分にオプションを指定した方がセキュアらしいが何を指定するのが良いのかよく分からん。
ArchWiki は `{"pcr_ids":"1,7"}` と言っているが、インストールメディアでロック解除できるか確認したりしていたら SSD に入れている方でも TPM2 でロック解除できなくなってしまった。
GentooWiki は `{"pcr_ids": "0,2,3,5,6,7"}` と言っているが、インストールメディアでロック解除できたので弱いような気も…。  
まあそもそもインストールメディアでロック解除するのを防げるものではない説もあるので、侵害される可能性が高いならパスワードだけにしとけということかもしれない。

終了。

再起動して確認。
動かなかったらインストールメディアで起動して手動マウントして頑張る（適当）

[^systemd-boot]: [systemd-boot - ArchWiki](https://wiki.archlinux.jp/index.php/Systemd-boot)
[^encrypt-hook]: [dm-crypt/システム設定 - ArchWiki](https://wiki.archlinux.jp/index.php/Dm-crypt/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E8%A8%AD%E5%AE%9A#encrypt_.E3.83.95.E3.83.83.E3.82.AF.E3.82.92.E4.BD.BF.E3.81.86)
[^clevis]: [Clevis - ArchWiki](https://wiki.archlinux.jp/index.php/Clevis)
