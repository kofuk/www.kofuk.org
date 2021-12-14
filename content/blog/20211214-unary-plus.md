---
title: "C/C++の単項演算子 + について"
date: 2021-12-14T11:28:57+09:00
tags:
  - C
  - C++
---

C++ で `char` を `std::cout` とかで出したいとき、
```c++
char hoge = 'a';
std::cout << +hoge;
```
みたいに書くと `a` じゃなくて `97` が出る。これはなぜなのか。

C11 ではこのように述べられている。

> The result of the unary + operator is the value of its (promoted) operand. The integer
> promotions are performed on the operand, and the result has the promoted type.

C++17 ではこのように述べられている。

> The operand of the unary + operator shall ...(略)  
> Integral promotion is performed on integral or enumeration operands.
> The type of the result is the type of the promoted operand.


というわけで C、C++ 両方で単項演算子 `+` の結果は汎整数拡張がなされた結果になる。
`hoge` は `char` で `+hoge` は `int` の型を持つということになり、
`operator<<` の `int` オーバーロードが呼ばれ、`97` が出力された。

## 参考にした資料

手元にあった C11 と C++17 の最終ドラフトで確認した。
より新しい規格では仕様が変わっている可能性もある。
