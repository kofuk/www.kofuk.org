---
title: "Minecraft のマップを生成するやつを C++ で書き直し始めた"
date: 2020-02-01T22:53:43+09:00
---

一月は行く，二月は逃げる，三月は去るみたいな，この時期にありがちな，でもちょっと早いような話をしつつ……。
でももう二月なんで早いですよね。まあそんなことはどうでもいい。

こないだ作った Minecraft のマップ画像を生成するやつを C++ で書き直し始めてみたりした。
でもまあ今日はそんなに作業できなかったのでほとんどヘッダファイル書いたら終わったみたいな感じだけど。
もともと Python で書いていたやつは anvil-parser というライブラリを使っていて，
そのライブラリは NBT なる Minecraft の独自バイナリ形式のパーズには nbt という別のライブラリに
任せているっぽかった。nbt というライブラリのリポジトリを見に行ってみたら，チャンク読むところとかも実装されていて，
なんかマップを生成する example も存在したんですね。うーん。まあいいやろ。
で，anvil-parser ってのはそのライブラリのチャンクの実装とかは使ってなくて，
その部分は独自でやってるみたいでした。まあ古い形式にしか対応してなさそうだったのでそのせいかな，
という感じがします。

で，僕は自分でパーザを実装したいというより最小の労力で生成するのを高速化したいだけなので，
anvil-parser の実装をただただ C++ に翻訳していくことにしました。
翻訳するべきソースファイルの数としてはそこまでない（だからこそ翻訳する気になったわけですが）
んですが，割と面倒臭いな，という気持ちにはなっています。

まあ出来たらどのくらい速くなったかとかも含めてまた書くってことで。