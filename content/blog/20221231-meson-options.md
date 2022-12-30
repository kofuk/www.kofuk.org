---
title: "Meson で subproject のオプションを指定する方法"
date: 2022-12-31T01:20:54+09:00
tags:
  - development
  - Meson
---

備忘録。
出てこないなーとか思ってたら普通に書いてあった。

単に `-D` で指定するときに `subproject名:オプション名` というふうに指定すればいいだけだった。

例えば subproject `hoge` でだけ `warning_level` を 3 にしたい場合は

```shell
$ meson configure -Dhoge:warning_level=3
```

のように指定すれば ok。

ちなみにモジュール (`meson.build` の中で `import` とかして使うやつ) ごとのオプションは `.` で区切る。

なので `pkgconfig` の `relocatable` を `true` にする場合とかは `-Dpkgconfig.relocatable=true` とかを指定すればいい。

#### 参考

- [Built-in options](https://mesonbuild.com/Builtin-options.html#specifying-options-per-subproject)
