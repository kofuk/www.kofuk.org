---
title: "dm-crypt で暗号化している SSD で TRIM を有効にする"
date: 2024-08-29T21:52:58+09:00
---

dm-crypt で暗号化している SSD ではデフォルトでは TRIM (a.k.a discard) が無効になっています。
暗号化されたディスクで TRIM を有効化するべきかどうかというのはセキュリティ面から諸説あるようではあります。
理解が怪しいので、気になる人は Arch Wiki のこのあたりを読んでください。  
https://wiki.archlinux.jp/index.php/Dm-crypt/%E7%89%B9%E8%A8%98%E4%BA%8B%E9%A0%85#.E3.82.BD.E3.83.AA.E3.83.83.E3.83.89.E3.82.B9.E3.83.86.E3.83.BC.E3.83.88.E3.83.89.E3.83.A9.E3.82.A4.E3.83.96_.28SSD.29_.E3.81.AE_Discard.2FTRIM_.E3.81.AE.E3.82.B5.E3.83.9D.E3.83.BC.E3.83.88

Arch Linux を前提としているので、他のディストリビューションでは動作しない可能性もあります。

## 起動中にパスワードを入力する場合

これは普通に `cryptdeivce` カーネルパラメータを使える場合で、一番シンプルです。
ただ、毎回パスワード入れている人は真面目な人だと思うので、TRIM したくならないのかもしれません。知りませんが。

これは `allow-discard` オプションを追加するだけいけるらしいです。試していないので実際に動くのかはよくわかりません。
どこにカーネルパラメータを書くかはブートローダー依存だと思うので、自分の環境に合うところに適当に書いてください。

```plaintext
cryptdevice=UUID=xxxx-xxxx-xxxx-xxxx:root:allow-discards
```

## TPM とか YubiKey とかでロック解除している場合

cryptsetup に `--persistent` オプションをつけて、`--allow-discards` オプションをつけると、次からは明示的に discard を有効化しなくても TRIM が有効になります。
crypttab とかに書くのが正攻法説とかもあるんですが、persistent しちゃう方がシンプルなのでこれでいいと思っています。

起動中に一度だけこれを実行すれば、次からは TRIM が有効な状態でマウントしてくれます。
    
```bash
$ sudo cryptsetup refresh --persistent --allow-discards /dev/nvme0n1p2 cryptroot
```

これをやると、fstrim が通るようになっているので、できているはず。

## 自動で TRIM する

Arch Linux だとデフォルトでは有効化されてないので、有効化したほうがよさそうです。

```bash
$ sudo systemctl enable --now fstrim.timer
```
