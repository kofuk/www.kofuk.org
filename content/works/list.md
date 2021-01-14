---
title: "作ったもの"
date: 2020-08-28T12:58:02+09:00
lastmod: 2021-01-15T00:54:39+09:00
menu:
  main:
    name: Works
    weight: 10
---

ある程度形になったものを適当に書き連ねておくリスト。
作り始めた時期で整理することにした。

上にいくほど新しいはず。
ただし、2019 年くらいから前は記憶をたどって書いているので時期は正確じゃないかもしれない。
あと最近は作るたびに書いているのでちょっとしたツールでも書いている。

## 2021

## 2020

- rebuild ([GitHub](https://github.com/kofuk/rebuild))
    - ファイルが更新されたときにコマンドを実行する。TeX のコンパイルとか。
    - こういうのは上位互換がたくさんありそう。
    - 現時点での課題として、1つのファイルしか監視できないというものがある。
- ben ([GitHub](https://github.com/kofuk/ben))
    - Binary wo E-kanji de Nagameru yatsu（適当すぎる命名）。
    - バイナリファイルを手動でパースしないといけないとき用。
- web-search-filter ([GitHub](https://github.com/kofuk/web-search-filter))
    - Google 検索の結果からいらない（主観）結果を除外する Firefox アドオン。
    - Mozilla に署名してもらうの面倒なので Developer Edition を使うことにしている。
- regetopt ([GitHub](https://github.com/kofuk/regetopt))
    - glibc の `getopt_long` っぽいやつを Windows の MSVC ビルドで使いたかったので作った。
- Pixel Terrain ([GitHub](https://github.com/kofuk/pixel-terrain))
    - Minecraft (Java Edition) のセーブデータから俯瞰図を生成。
    - 特定座標の表面ブロックを返すデーモン。
    - NBT (Named Binary Tag) を操作する細々したユーティリティ。
        - NBT を XML に変換する。
        - 複数の NBT が格納されているセーブデータを複数の単一の NBT ファイルに分解する。

## 2019

- ked ([GitHub](https://github.com/kofuk/ked))
    - コンソールで動くテキストエディタ。
    - 簡単な UTF-8 サポートあり。
- flood ([GitHub](https://github.com/kofuk/flood))
    - 一応特定地点の洪水時の浸水状況をグラフィカルに表示するというやつ。
    - 画像をチャンクに分けて地図っぽいものを Canvas に描画するのを実装した。楽しかったけど割と大変だった。
    - 大学の授業関連で作った。大変だった割にあんまり刺さらなくてがっかりした記憶 (まあそれはそうな感じはする)。
- emacs-cms ([GitHub](https://github.com/kofuk/emacs-cms))
    - たしか Bash CMS に触発されて Emacs がインタープリタになってる CMS 作ってやるぜ！って感じで作った気がする。
    - たしか org-mode で書いて、HTML エクスポート機能で HTML に変換していたんだったような。

## 2018

- md-server ([GitHub](https://github.com/kofuk/md-server))
    - Markdown を HTML に変換する CLI フロントエンドとエディタとかがついた Web のフロントエンドがあったっぽい。
    あんまり覚えていない。
    - たしか箇条書きとかで無効な HTML が出力されてしまうバグがあった気がする。
    - 今見ると Makefile が `.PHONY` 使ってなかったりして割と怪しい。
- Liftim ([GitHub](https://github.com/ChronoscopeAppLab/open-liftim-android))
    - 主に作っていたのは Android アプリ。
    - サーバ側も API だけ作っていた。フロントエンドは友人が作っていた。
    - 後述の時間割の後継。誰でも配信用できるようにサービスとして整備した。

## 2017

- SecureScreen ([GitHub](https://github.com/kofuk/SecureScreen))
    - Android アプリ
    - Android の画面固定機能で操作は受け付けないという感じのやつ。
    - 一応 Play Store で公開している（が更新していないのでいつ消されるか分からない）。

## 2016

- 時間割アプリ
    - Android アプリ。
    - クラスで時間割を配信したりして遊んでいた。
    - Play Store で公開していたけど消した。
    - サーバ側には毎回 FTP で JSON をアップロードしないといけないという割と面倒な仕様だった
    ので、登録用のアプリとかも別で作っていた。
    - 主に iOS ユーザ向けに Web 版とかもあって、これは友人が作っていた。
    - あとなでしこで書かれた Windows 版とかいうのも友人が作っていた。ユーザはいなかったっぽい (？)
