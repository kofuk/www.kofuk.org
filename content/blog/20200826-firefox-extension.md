---
title: "Firefoxで署名していないアドオンをインストールする"
date: 2020-08-26T00:20:30+09:00

tags:
  - development
---

最初の設定は最初しかしない（当たり前）のですぐ忘れる。

これをせずに未署名のアドオンをインストールしようとすると壊れているとか文句を言われる。壊れてねーよ。

1. Firefox Developer Edition を入れる。Stable とかだと署名していないアドオンをインストールできるようにできない。まあこれは常識。
1. `about:config` で `xpinstall.signatures.required` を `false` にする。

おしまい。

これで壊れていると言われたら多分本当に壊れている（欠けているファイルがあるとか）。

今日ハマったのとしては，zip にするときに `zip extension.zip *` ってやったことでサブディレクトリが zip に入ってなかった。
`zip extension.zip **` ってやれば解決。

あと `applications.gecko` が必要なのかよく分かってないけど前うまくいかなかった気がするので追加。

```json
"applications": {
  "gecko": {
    "id": "{9e13ea3f-fe6d-4246-88f9-00a9836d9816}"
  }
},
```

id のところはメールアドレススタイルの id 考えるのがだるいので適当に `uuidgen` で生成した UUID で埋めればいいっぽい
（知らんけど）。
