---
title: "LaTeXのenumerateで使う文字を変更する"
date: 2020-06-17T15:39:45+09:00
tags:
  - latex
---

深さNのところをi, ii, iii,... というふうにしたいならば，

```latex
\renewcommand{\labelnumN}{\roman{enumN}}
```

`\roman`の部分は選べる。

なまえ     | すたいる
----------|---------------
`\alph`   | a, b, c,...
`\Alph`   | A, B, C,...
`\arabic` | 1, 2, 3,...
`\roman`  | i, ii, iii,...
`\Roman`  | I, II, III,...

プリアンブルに書くと文書全体これになるので，一箇所だけに適用したければ enumerate 環境の中で
`\renewcommand` する。おわり。
