---
title: "Unicodeの正規化と濁点"
date: 2019-08-22T10:00:00+09:00

tags:
  - tech
  - shell
---

Unicode において，濁音の表現方法は2つあります．一つが濁点のついた文字のコードを使用する方法です．
もう一つが濁点のついていない文字と濁点を組み合わせる方法です．

後者の方法だと，本来は濁点のついていない文字に濁点をつけることができるのでおもしろかったりします．

`uconv` コマンドを使うとこれを相互に変換できます． `uconv` は
(Debian 系のディストロでは) `icu-devtools` パッケージの一部として APT で入れられます．

以下が 2番目の表現方法から 1 番目の表現方法に変換する例です．

```console
$ echo -n が | uconv -x NFD
が
```

分解されたものを再度合わせるのは以下です．

```console
$ echo -n が |n uconv -x NFC
が
```

と例をあげましたが，たいていの環境ではその違いを目視で確認できないと思います．
`xxd` を使いましょう．

まず，キーボードで入力した「が」です．

```console
$  echo -n が | xxd -g1
00000000: e3 81 8c                                         ...
```

で，前者の方法

```console
$ echo -n $(echo -n が | uconv -x NFD) | uconv -x NFC | xxd -g1
00000000: e3 81 8c                                         ...
```

後者の方法

```console
$  echo -n が | uconv -x NFD | xxd -g1
00000000: e3 81 8b e3 82 99                                ......
```

なんとなく文字数 (というよりバイト数) が変わっていることは分かると思います．

ここで，「か」の16進ダンプを見てみます．

```console
$ echo か | xxd -g1
00000000: e3 81 8b                                         ...
```

前者の方法の前半の16進ダンプを一致していることが分かると思います．

これを使って「ま」に濁点を付けてみたいと思います．

```console
$ echo $(echo -n ま | xxd -p)e38299 | xxd -p -r
ま゙
```

`xxd` の `-p` オプションは，16進数に変換したものをそのまま出力する，というオプションで，
`-r` は逆変換するオプションです．

これがちゃんと表示できるかは環境によると思いますが，
Unicode の闇が感じられて面白いよね，という話でした (だぶん)．
