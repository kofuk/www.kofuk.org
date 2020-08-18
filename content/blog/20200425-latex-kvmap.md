---
title: "LaTeXでカルノーマップを描画する"
date: 2020-04-25T11:30:29+09:00

tags:
  - LaTeX
---

kvmap というパッケージが TeX Live にもともと入っていて，それを使えば簡単にカルノーマップを描画できる。

基本的な使い方は以下。

```latex
\documentclass[uplatex,dvipdfmx]{jsarticle}

% カルノーマップの描画に必要
\usepackage{graphicx}
\usepackage{kvmap}

\begin{document}
    \begin{kvmap}
      \begin{kvmatrix}{A,B,C.D}
        1 & 0 & 0 & 1 \\
        1 & 1 & 1 & 1 \\
        1 & 1 & 0 & 0 \\
        0 & 1 & 1 & 0 \\
      \end{kvmatrix}
      \bundle{0}{1}{1}{2}
    \end{kvmap}
\end{document}
```

ちゃんと例を書くのが面倒なので一箇所しか囲んでいないが，

```latex
\bundle{x1}{y1}{x2}{y2}
```

とするとその範囲に丸い囲みが描画される。
多分ここは完成した画像貼った方がいいんだろうけど面倒なので省略。

あと`color=...`を与えてやると色を変えたりとかも簡単にできる。

問題はここからで， `\bundle[invert=true]{...}` ってやると端と端を囲むことができるのだが，
例えば以下のような例だと縦の囲みか横の囲みかで曖昧になる。

```latex
\begin{kvmap}
  \begin{kvmatrix}{A,B,C}
    1 & 0 & 0 & 1 \\
    1 & 1 & 1 & 1 \\
  \end{kvmatrix}
  \bundle[invert=true]{0}{0}{3}{1}
\end{kvmap}

```

その結果下のようなカルノーマップが描画される。

![exmple](/images/20200425-latex-kvmap/example1.png)

これは問題だ。

結局，TeX Live 2019 に入っているバージョンでは対処できないらしく，
[CTAN](https://ctan.org/pkg/kvmap) から落としてきてビルドするのが正解っぽい。

最新のバージョンだと `hinvert=false` や `vinvert=false` を指定することで
どちらかを無効化することができる。それを使って描画したのが以下。

![example](/images/20200425-latex-kvmap/example2.png)

たぶんいらんけどソースコード。

```latex
\begin{kvmap}
  \begin{kvmatrix}{A,B,C}
    1 & 0 & 0 & 1 \\
    1 & 1 & 1 & 1 \\
  \end{kvmatrix}
  \bundle[invert=true,vinvert=false,overlapmargins=8pt]{0}{0}{3}{1}
\end{kvmap}
```
