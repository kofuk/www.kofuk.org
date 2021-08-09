---
title: "GNOME 端末 と Sixel"
date: 2020-02-25T22:55:25+09:00
lastmod: 2021-08-10T08:44:18+09:00

tags:
  - GNOME
  - shell
---

GNOME 端末，というか GNOME 端末が使っている vte に Sixel が入ってほしいな，
と思っていたけど，[これ](https://gitlab.gnome.org/GNOME/vte/issues/165)
を見た感じ入る日は来なさそうだな，と思った。

この issue は重複する issue を上げるな，というところから，
sixel のプロトコルがレガシーでパレットベースで，view/model を分けるのが困難
という説明までしている。

bugzilla の方もパッチはあるけどそのパッチが入る雰囲気はゼロだった。

### 2021/8/10 追記

そういえばこれ[入ってました](/blog/20210803-vte-sixel/)。
