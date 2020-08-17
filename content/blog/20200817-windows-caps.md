---
title: "WindowsでCapsLockキーをCtrlキーとして使う"
date: 2020-08-17T13:36:25+09:00

tags:
  - windows
---

ウェブのいろんなところに書いてあるけどレジストリをいじる。弄坏（だめ）。

```
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
  "Scancode Map"=hex:00,00,00,00,00,00,00,00,02,00,00,00,1d,00,3a,00,00,00,00,00
```

CapsLock を読んだら Ctrl として解釈するみたいなマップになっている。
空で書けって言われても無理。

バイトオーダー依存だとか。いくらなんでもイケてなさすぎる。
