---
title: "C言語使っていると「すげえ」ってなるC++の機能"
date: 2019-09-02T10:00:00+09:00

tags:
  - c
  - c++
  - development
---

今まで C 言語ばっかり使ってきて、C++ を使ったときに驚いた機能です。
比較的新しい言語仕様もあるっぽいので、処理系によってはサポートしていないかもしれません。

# auto

`auto` キーワードを使うと型推論してくれます。

例えば、

```c++
#include <iostream>

auto plus(auto a, auto b)
{
    return a + b;
}

int main()
{
    std::cout << plus(1.2, 3.4) << std::endl;
    return 0;
}
```

  こういうのが

```shell
$ ./a.out
4.6
```

  コンパイルも通ってちゃんと動きます。

  で、こういう `auto` を `float` と宣言すればいいだけ、みたいなやつだけじゃなく、
  以下のような変なやつも

```c++
#include <iostream>
#include <complex>

auto plus(auto a, auto b)
{
    return a + b;
}

int main()
{
    std::cout << plus(1.2, 3.4) << std::endl;
    std::cout << plus(std::complex<int>(1, 3), std::complex<int>(5, 7)) << std::endl;
    return 0;
}
```

```c++
$ ./a.out
4.6
(6,10)
```

ちゃんとコンパイルが通って動きます。怖い怖い!! (大袈裟)

# ラムダ式

C 言語ではある処理単位を引数として渡したい場合、
グローバルに宣言した関数をポインタで渡していたと思います。

```c
#include <stdio.h>

static int some_func(int a, int b)
{
    return a + b;
}

static int arith(int a, int b, int (*func)(int a, int b))
{
    return func(a, b);
}

int main(void)
{
    printf("%d\n", arith(1, 2, some_func));
    return 0;
}
```

こんな感じで。しかし、この方法はグローバルに宣言しないと使えないという欠点がありました。

で、C++ だと、

```c++
#include <iostream>
#include <complex>

static int arith(int a, int b, int (*func)(int a, int b))
{
    return func(a, b);
}

int main()
{
    std::cout << arith(1, 2, [](int a, int b){ return a + b; }) << std::endl;
    return 0;
}
```

こういう風に書けます。すごい。
