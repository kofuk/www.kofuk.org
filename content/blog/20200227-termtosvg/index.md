---
title: "SVG でターミナルを録画できる termtosvg"
date: 2020-02-27T21:58:39+09:00

tags:
  - tech
  - GNU/Linux
---

いろんなワードで `pacman -Ss` してみて眺めていたら，`termtosvg` というやつを
見つけたので試してみた。

![](capture.svg)

結論：すごい。ただ alternative screen buffer ができないみたい。

ソース見たら CSS で表示位置をずらしてアニメーションしているように見せているっぽい？
よくわからぬ。
