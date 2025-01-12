---
title: "Linux on ThinkPadのバッテリー設定をいい感じにする"
date: 2020-09-07T02:42:57+09:00

tags:
  - tech
  - Linux
---

僕は ThinkPad X1 Carbon の 2019 年モデルを使っていて，少なくとも僕が学生の間は買い換えないつもりでいる。
そこでちょっと気になるのがバッテリーの劣化という面。ThinkPad はバッテリーが取り出せないので
工夫して使わないとバッテリーをいじめる結果になってしまいそうだと思う。

で，ACアダプタにつないだときにバッテリーに充電する閾値を設定する方法。

入れる。

```shell
$ sudo pacman -S tlp
```

acpi-call を入れることを薦められたりするが，これはバッテリーの内部ゲージのリセットとかをしようと
しない限り必要ないようだ。

`tlp-stat` というユーティリティも同時にインストールされるので次のような感じで現在の設定値を確認できる。

```shell
$ sudo tlp-stat -b
```

まあ確認するだけなら適当なファイル（`/sys/class/power_supply/BAT0/*` とか）を見れば分かる気がするが。

で，一時的に値を設定するだけであれば，

```shell
$ sudo tlp setcharge 70 85 BAT0
```

とかすれば 75% で充電開始，85% で充電完了というふうに変更できる。
ただしこれは再起動で忘れてしまうはず（滅多に再起動しないのでこれでいいといえばいいのだが）。

永続的に利用するには，`/etc/tlp.conf` を編集するか `/etc/tlp.d/` に設定ファイルを作る。

一般論として `tlp.conf` などを直接編集するのはよくないので，ドロップインファイルを作って
設定した。

名前は `10-battery-threshold.conf` にした。適当。

```config
START_CHARGE_THRESH_BAT0=70
STOP_CHARGE_THRESH_BAT0=85
```

で Systemd のサービスを有効化する。

```shell
$ sudo systemctl enable tlp.service
```

眠くなってきたので寝る。
