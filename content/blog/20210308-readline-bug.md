---
title: "readlineのバグだった"
date: 2021-03-08T00:01:01+09:00
lastmod: 2021-03-09T23:01:13+09:00
tags:
  - development
  - bash
  - readline
---

**注意: この記事の内容は間違っています。
[こちら](/blog/20210309-bash-prompt/)を参照してください。**

[この記事](/blog/20201216-readline/) で Bash のプロンプトが壊れるとか
いろいろ言っていたが、いまさらながら調査した。

その結果、プロンプトにエスケープシーケンスが含まれていると、その文字数だけ履歴が残ったり
行の途中で折り返してしたりすることが分かった。
たぶんプロンプトから残りの文字数を計算する部分でエスケープシーケンスが処理されていない？

以下 PoC。

```c
#include <stdio.h>

#include <readline/readline.h>
#include <readline/history.h>

int main(void) {
    for (;;) {
        char *line = readline("\033[1mfoobar\033[0m");
        if (line == NULL) {
            break;
        }
        add_history(line);
    }
}
```

これで `22222...` の行まで入れたあとに 2 つ履歴を遡るとこれになる。

![PoC](/images/20210308-readline-bug/poc.png)

特に騒がれてないということはロケールとかフォント依存だったりするのかな……。
コード読んたりするのは明日以降に…。

というか今日プロンプトを2行にしてワークアラウンドしたんだけど、
2 行のプロンプト見にくくてあんまり好きじゃないのでなんとか解消したいんだよなぁ。
まあ太字にするのやめればいいんだけど。
