---
title: "ImageMagickでExif情報からGPS情報を取る"
date: 2021-02-27T23:02:36+09:00
tags:
  - tech
  - ImageMagick
---

Exif 情報を表示するには:

```console
$ identify -verbose image.jpg
```

これで出力される情報のうち、`exif:GPS` から始まる行が GPS 情報になっている。

`exif:GPSLatitude`, `exif:GPSLongitude` は `度, 分, 秒` 表記になっているので、
さらにそれぞれ割り算して実際の座標を求める感じになっている。

例えば `31/1, 34/1, 71/25` とかだと、31°34'2.84" になる。

Google マップに持っていって表示したい場合は、検索欄に `度 分 秒N, 度, 分, 秒E` といった具合に
打ち込めばその座標にピンが表示される。
