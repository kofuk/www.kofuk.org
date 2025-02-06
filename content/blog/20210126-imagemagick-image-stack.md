---
title: "ImageMagick の image stack operator"
date: 2021-01-26T10:47:58+09:00

tags:
  - tech
  - shell
  - imagemagick
---

ImageMagick のコマンドラインオプションはスタックに画像を積み上げていって、
その画像に対してなんかやるみたいな体系になっている。
そのスタックの操作についてメモ。

## `(`

新しくスタックを作る。
スタック作っただけじゃあんまり意味なくて、何か画像を乗っけることで他のオペレータにも
スタックが使われるようになるっぽい (このへんの挙動がよく分からん)。

## `)`

今いるスタックに乗っかってる画像をメインのスタックに乗っける。複数の画像がいた場合は全部乗る。

## `-delete`

スタックから、指定したインデックスの画像を消す。負数を指定すると後ろから。
ハイフンで範囲指定もできる。

## `-insert`

スタックの一番上の画像のインデックスを指定したインデックスに変える。
負数だと後ろから。

## `-swap`

`-swap 0,1` みたいに指定して画像を入れ替える。`+swap` で後ろ2つが入れ替わる。

## `-reverse`

スタックをひっくり返す。

## `-duplicate`

`-duplicate count,index` ってやるとスタックの1番目の画像を2回複製する (3つになる)。
インデックスは省略できて、最後の画像が使われるっぽい。

`-clone` はこれの糖衣構文？(知らんけど)

あと `+duplicate` と `+clone` の挙動が同じに見える。

## `-clone`

指定したインデックスの画像を複製してスタックに積む。括弧の中以外で使うのは推奨されないらしい。なぜ？

ご丁寧に「最後にプッシュしたスタックから clone するぜ」みたいなことがドキュメントに書いてあるけど
やってみた感じだとインデックス指定しても 0 番目はいつもメインの最初になるっぽい。
今いるスタックの最初から取ってくる方法はよく分からん。

## 例を？

適当な画像から `favicon.ico` をこさえる。

```console
$ convert in.png +clone -resize 128x128 -clone 0 -resize 64x64 -clone 0 -resize 32x32 -delete 0 favicon.ico
```

いきなり推奨されない `-clone` の使い方をしてしまっている (？)

## 参考

- [Basic Usage -- IM v6 Examples](https://legacy.imagemagick.org/Usage/basics/)
- [ImageMagick - Command-line Options](https://imagemagick.org/script/command-line-options.php)
