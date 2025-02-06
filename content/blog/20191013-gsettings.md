---
title: "gsettings で変更したい設定メモ"
date: 2019-10-13T10:00:00+09:00

tags:
  - tech
  - GNU/Linux
  - GNOME
---

# ウィンドウのボタンの配列を変更

Unity の頃の Ubuntu に慣れすぎて Windows なレイアウトに慣れないので, mac 風のレイアウトに変更.

※ 決して Windows が嫌いだからとかそういう理由ではない.

```console
$ gsettings set org.gnome.desktop.wm.preferences button-layout 'close,minimize,maximize:appmenu'
```

# CapsLock を潰す

鬱陶しいので. あとついでに Caps の位置に Ctrl があるのに慣れといた方がいいかな, と.

```console
$ gsettings set org.gnome.desktop.input-sources xkb-options "['ctrl:nocaps']"
```

`gsettings` ではないけど，linux console で CapsLock を Ctrl として使うには，
`/etc/default/keyboard` に以下を追加する．

```shell
XKBOPTIONS="ctrl:nocaps"
```
