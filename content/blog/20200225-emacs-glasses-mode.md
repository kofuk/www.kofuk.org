---
title: "Emacs の glasses-mode"
date: 2020-02-25T00:09:24+09:00

tags:
  - emacs
---

camel case を snake case で表示してくれるやつ。
僕は camel case より snake case や chain case の方が好きなので，
………と思ったけど表示とデータが違うって実際に書くときに使える訳ないじゃん。

そういや C# で推奨されてるメソッド名を大文字で始めるってやつ好きくない。。。。。（言葉がおかしい）

```lisp
(setq glasses-mode-uncapitalize-p t)
```

ってしとくと，アンダースコア直後のアルファベットが小文字に変換されて表示される。
まあ実用性はないです。

実用性ないといえば，`M-x zone` とかけっこう好き。特に drip 系のエフェクトが秀逸。

という訳で，glasses-mode は好きじゃないスタイルのソースコードを眺めるときに便利だよ，
という話でした。（ほんまか）
