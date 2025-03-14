---
title: "PHPerKaigi 2024に参加しました！（オンラインで）"
date: 2024-03-09T12:31:57+09:00
tags:
  - tech
  - PHP
---

2024/3/7〜9 に中野セントラルパークカンファレンスで開催された PHPerKaigi 2024 に参加しました。（オンライン参加なので、現地には行っていません）

{{< ogcard "https://phperkaigi.jp/2024/" >}}

オンラインではニコ生で現地の発表をリアルタイムで聞くことができました。これが非常に安定していて、発表を聞くぶんにはほとんど不自由を感じませんでした。
今回はオンライン参加だったので会場には行かなかったのですが、会場には最強インターネット環境が整備されていたり、ロッカーが提供されていたりしたらしいです。

サイボウズのスポンサーセッション [帰ってきた「完成度低いの歓迎LT大会」（PHPerKaigi出張版）](https://fortee.jp/phperkaigi-2024/proposal/89879dc7-5e21-4cf6-b5bf-a629dc61279d)で LT の機会をもらえました。
オンラインでの参加ということで、事前に収録したものを流す形だったのですが、Twitter で反応をもらえたりして嬉しかったです。
ハードルを下げてもらえたことで登壇の取っ掛かりができたので、これから登壇していきたい欲も高まりました。

## 聞いた発表と感想を簡単に

### day0 前夜祭

day0 は別の用事があり、ニコ生で遡って見ていました。

**[雰囲気実装を少し抜け出そう！RFCからPHPの実装までを考えるタイムゾーンとサマータイム！！！](https://fortee.jp/phperkaigi-2024/proposal/4033fc05-f5d6-4058-b27f-40dc8f18db1d)**  
タイムゾーンを雰囲気で扱ってバグらせたことがあるので聞きました（PHP ではないですが）。
どこで設定されている時間を見ているのか認識することが大事みたいな話はたしかにーとなりました。
PHP って OS のタイムゾーンを見てくれないんですね…。

**[PHPアプリケーションのスケーラビリティと信頼性を革新する: nginx+ngx_mrubyとGoの融合](https://fortee.jp/phperkaigi-2024/proposal/5bbc9927-0fe1-4fa6-9c0e-4862aa3f1c03)**  
仮想待合室を作った話は Twitter でチラッと見たことがあったんですが、ちゃんと話を聞くのは初めてでした。
Nginx の subrequest とかは全然知らなかったんですが、いつか探求してみたい気持ちになりました。
（発表者の GMO ペパボの [P山さん](https://twitter.com/pyama86)には数年前インターンでお世話になりました。）

### day1

**[10年モノのレガシーPHPアプリケーションを移植しきるまでの泥臭くも長い軌跡](https://fortee.jp/phperkaigi-2024/proposal/8f347718-97fb-4baf-afa3-7e78e1501ca4)**  
サイボウズの Garoon もレガシー PHP アプリケーションなので（直球）、世の中のレガシーアプリケーションの動向が気になって聞きに行きました（？）  
別言語で作り直すのが現実的な選択肢になったというのがヤバそう。リバプロで両立させながら進めたということで、割とイメージ通りでした。
こういうの、社内調整も大変そうで、そのへんの話も聞いてみたいなと思いました。社外では話しにくそうですが。

**[ウキウキ手作りミニマリストPHP](https://fortee.jp/phperkaigi-2024/proposal/9cb5ad60-8970-4877-894e-9a59826f20e1)**  
PHP のビルド周りの話でした。`--disable-all` でミニマルな設定でビルドした PHP に JSON は入っていたのがちょっと意外でした。
ところで、最近社内で[てきめんさん](https://twitter.com/youkidearitai)が PHP Internals Book 読書会を開いてくれています。雰囲気で `./configure` して `make` する PHP ビルドを脱却できて最強になりました。

**[こんな静的解析導入は負けフラグ](https://fortee.jp/phperkaigi-2024/proposal/97568455-c264-4abf-b280-5e5279384c0c)**  
CI でしか実行しないのは負けフラグらしいです。刺さりますね（？）。
で、設定周りの話ですが、結局のところコードの品質を良くしたいと思っていることが大事で、lint を黙らせるのが目的になると駄目ということなのかなーと思ったりしました。

**スポンサーセッション: [帰ってきた「完成度低いの歓迎LT大会」（PHPerKaigi出張版）](https://fortee.jp/phperkaigi-2024/proposal/89879dc7-5e21-4cf6-b5bf-a629dc61279d)**  
自分含めて 4 人が喋りました。
同期の森脇くんの発表「新卒入社で1年間仕事をしてみて感じたこと」は同じ一年目としてけっこう共感していました。

**[PHP8の機能を使って堅牢にコードを書く](https://fortee.jp/phperkaigi-2024/proposal/ae2ded4d-8e7e-47a0-85d1-26a8c92308ac)**  
PHP 8 でいろんな機能が入っていて、堅牢なコードを書けるだけでなく、気持ちよくコードが書けそうで、いいですね。
静的解析で検出できる潜在的なエラーも増えそうな気がしました。

**[どうやってWebサービスのページ表示速度を1/3にしたか](https://fortee.jp/phperkaigi-2024/proposal/2c3ccd3d-9630-4bf9-a33b-3b7d40d5be69)**  
いろんな方向からボトルネックを特定する方法が紹介されていて興味深かったです。
index を貼りまくっているあたりとかも ISUCON みがある（？）  
「デカい声で言うの重要」というのウケました。

### day2

**[PHP Parserで学ぶPHPと静的解析](https://fortee.jp/phperkaigi-2024/proposal/15b92894-11cb-4022-85d5-bf8279f61d43)**  
PHP をパースして依存関係を可視化するツールを自作する話。
PHP Parser、使いやすそうで良さそう。公式のライブラリかなと思ったんですが、どうやらそうではないんですね。
今すぐに使い道は思いつかないけれど、いざというときの手札が増えた気がします。

**LT: [OSSの脆弱性との向き合い方](https://fortee.jp/phperkaigi-2024/proposal/ccdbcea0-f8a6-4114-b29b-93d14fc33572)**  
サイボウズの脆弱性対応フローの話。「OSS 使ってますか？イエーイ！」の勢いで笑ってしまった。
クラウド版とオンプレ版があるので対応が大変ですよね。
僕もサイボウズという会社にいるんですけどビッグ・シールド・ガードナーは初めて聞きました（？）

## いろいろ

事前にノベルティボックスが届きました。各社工夫を凝らしたノベルティを作っていて面白かったです。

{{< x user="man_2_fork" id="1760917552115712466" >}}

弁護士ドットコム千代紙？で折りました。部屋に飾ってあります。

{{< x user="man_2_fork" id="1760930801276072318" >}}

あと、同梱されていた冊子は現地参加だとカレンダーとかを確認できて便利そう。
後半は普通に技術書だったのでおもしろく読みました。

## おわりに

楽しかったです。PHP カンファレンス福岡 2024 は現地で参加します。

おわりです。
