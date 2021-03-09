---
title: "プロンプトが壊れる件について"
date: 2021-03-09T22:39:54+09:00
tags:
  - development
  - readline
  - bash
---

[readlineのバグだった](/blog/20210308-readline-bug/)とか寝言言ってたけど違った。君のせいにしてごめんよ。

ソースコード読んでみて分かったんだけど、readline はエスケープシーケンスを考慮して文字数計算するみたいなことは
もともとやってくれない。そのかわりに、文字数の計算で無視したい部分を
[ここ](http://git.savannah.gnu.org/cgit/readline.git/tree/readline.h?h=readline-8.1#n870)
で定義してある `RL_PROMPT_START_IGNORE` (`\001`) と `RL_PROMPT_END_IGNORE` (`\002`) ではさむことによって
プロンプトが崩れないようにする。

Bash のプロンプトを設定するときにはそれぞれ `\[` と `\]` で挟むとこれらの文字に置き換えてくれるっぽい
(これは挙動から推測しているだけで、正確には Bash のソースコードを読んでいないので分からない)。

これはちゃんと Bash の Manual page にも書いてある。

```
\[     begin  a sequence of non-printing characters, which could be used to embed a terminal  control  sequence  into  the prompt
\]     end a sequence of non-printing characters
```

man 読みましょうね。

…といっても readline は色付けのエスケープシーケンス無視する機能くらい持っててもいいと思うんだ……。
