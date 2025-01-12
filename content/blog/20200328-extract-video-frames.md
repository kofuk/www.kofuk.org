---
title: "動画ファイルのフレームを画像ファイルとして抽出する方法"
date: 2020-03-28T17:27:43+09:00
tags:
  - tech
---

動画ってことで ffmpeg でやりたくなるけど，ImageMagick でやった方が簡単。

```
convert source.mp4 out.png
```

うまくいかない場合，おそらく `+adjoin` をつければできる。

これで `out-0.png`，`out-1.png`，`out-2.png`，・・・といった具合に画像ファイルになる。
