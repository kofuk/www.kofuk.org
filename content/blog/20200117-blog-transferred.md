---
title: "ブログをまた動かした"
date: 2020-01-17T11:19:05+09:00

tags:
  - tech
---

なんか，前は Emacs Lisp で動く CMS でブログを動かしていたのだけど，なにしろ
Emacs Lisp で拡張していくのはあまりにも苦行なので VPS を移行するのと同時に書き直すことにした。
VPS を移行したといっても今も昔もさくらの VPS なので，その部分は変わってないのだけど，
前は Minecraft のサーバーを動かす必要があってそこそこハイスペックなものを借りていて毎月の出費が痛かったので，
それを小さいものに移行したという話。さくらインターネットはスケールアップだけじゃなくて
ダウンする方も実装してくれていいのではと思う。（そういや最近さくらインターネット炎上してたなあ。。。）

で，CMS を書き直した話だけど，変な言語で書きたいけどあまり辛い思いはしたくないな，
ということで Bash で動くやつを書いてみた。といってもなんか結局割と苦労したが。
辛い思いをしたくないのであれば Wordpress などといった既存の CMS を使ったらいいじゃないかという話
なんだけど，ウェブインターフェースで記事を書かないといけないところとか RDB で管理されるところとか
が後で動かしたくなったときに辛そうな気がして，なんとなく気が進まず，自前で用意している。
ブログサービスなんかを使うという手もあるけどその場合，前者の理由に加えて，他人の場所を使っているということで
S/N 比を気にしてしまうところがあって，やっぱり自分で作るという結論になってしまった。
まあ Emacs で動かしていたころも S/N 比どうでもいいにも関わらずあまり書いてなかったわけではあるが。

で，Bash で CMS を作ったのだけど，とりあえず動くようにしただけでまだ荒削りどころじゃないくらい
粗削りで，今後修正しないといけないな，というところがたくさんある。めんどくさい。

ローカルで開発して，サーバーに持っていってみると動かん，となってしまって，
雑にデバッグしていたら割と時間を溶かしてしまったのだけど，よくよく考えてみるとサーバー側に moreutils とか
pandoc とか入れてなかったという話とかもあった。

そういや何かを作るという話になると，なにか作りたいと思い始めるといろいろ思いついてしまって，
それがスタックに積まれていくのでよくない。キューであるべきなんだけど，作りたいと思った瞬間というのは
それを最高に作りたい状態なのでどうしてもキューになってしまう気がする。

なんか読み返してないけど全然文章まとまってねえな。最近思いついたことを適当に書いてしまうので
いきなり話が飛ぶような文章を書いてしまうなあ。
