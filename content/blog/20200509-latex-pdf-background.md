---
title: "PDFやWordファイルのテンプレートでもLaTeXでなんとかする"
date: 2020-05-09T15:59:32+09:00

tags:
  - LaTeX
---

Word ファイルの場合，仕方ないので Microsoft Word とかで PDF に変換しておく。
LibreOffice とかでも一応 PDF は出てくるけどけっこう崩れる。

で，テンプレートファイルが PDF になったのでこれを1ページ1ファイルに分解する。

```shell
$ pdfseparate foo.pdf %d.pdf
```

`pdfseparate` コマンドがない場合は `poppler` とかを入れる。

で以下のようにして背景に PDF を埋め込む。

```latex
\documentclass[uplatex,dvipdfmx]{jsarticle}
\usepackage{wallpaper}
\pagestyle{empty}

\begin{document}
\ThisCenterWallPaper{1}{1.pdf}

ここにいろいろ書く
\end{document}
```

`\pagestyle{empty}` でページ番号を消す。

面倒くさいけど `\vspace` とかでテンプレートに合わせつつなんとかする。

余白が大きすぎる場合は geometry とかで調整する。

`jsarticle` を使う場合，フォントのサイズを調整すると背景がずれる（縮小して拡大するみたいな実装なので）ので，
デフォルトにしておいて必要に応じて `\fontsize{12pt}{0pt}\selectfont`
とかで調整する。
