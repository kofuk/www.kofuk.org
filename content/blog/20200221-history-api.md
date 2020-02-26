---
title: "JavaScript History API"
date: 2020-02-21T22:46:44+09:00

tags:
  - development
---

久しぶりに触った。例によってマップの実装に使った訳だが。

プラウザの履歴をゴニョゴニョできる API だが，適当に使うのは割と簡単。

```javascript
history.pushState(null, null, '?foo=bar');
```

みたいな感じで URL のクエリを書き換えたりとかできる。
MDN を見たら第一引数と第二引数にいろいろ渡していたが，めんどくさいので `null` でよさそう。

書き換えを listen する方は，

```javascript
window.addEventListener('popstate', () => {
    // なんか処理
});
```

とかでよさそう。これが呼ばれたときには URL が書き換わっているので，
それを `location.href` とかで取ればよさそうな気がする。
真面目にやるなら push したときの値を受け取って使う感じになるんだろうけど。

`onload` と同時に `popstate` が起こるブラウザもあるらしい。怖いよ〜。

## 参考

- https://developer.mozilla.org/ja/docs/Web/API/History_API
- https://qiita.com/nenokido2000/items/2dd8da77d06837c8a510
