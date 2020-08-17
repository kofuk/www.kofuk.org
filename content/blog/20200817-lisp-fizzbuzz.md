---
title: "LISPでFizzBuzz"
date: 2020-08-17T23:10:34+09:00

tags:
  - development
  - lisp
---

ふと FizzBuzz を LISP 的に書くとどうなるんだろうと思って調べてみた。
ループで書くのは LISP 的にはダサいはず（適当）なので末尾再帰とかだろうかと
思っていたら，1 から 100 までのリストを作って map していくという感じらしい。
ほんまか？

```scheme
(letrec ((print-all
          (lambda (l)
            (when (pair? l)
                (print (car l))
                (print-all (cdr l))))))
  (print-all
   (map
    (lambda (n)
      (cond ((= (remainder n 15) 0) "FizzBuzz")
            ((= (remainder n 3) 0) "Fizz")
            ((= (remainder n 5) 0) "Buzz")
            (else (number->string n))))
    (iota 100 1))))
```

てことで Scheme で書いてみた。一応手元の環境の Gauche 0.9.9 では動いた。

出力する部分のせいでかなりごちゃごちゃになったが，FizzBuzz のリストを作ること自体は
簡単にできる（僕は LISP はまともに書けないのでこのコードは LISP の人から見ると一笑に付す
ようなものだろうが）。

しかしなんというかメモリが潤沢な前提の贅沢な考え方だなぁ……。
