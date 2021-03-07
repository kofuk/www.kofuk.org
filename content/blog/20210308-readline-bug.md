---
title: "readlineのバグだった"
date: 2021-03-08T00:01:01+09:00
tags:
  - development
  - bash
  - readline
---

[この記事](/blog/20201216-readline/) で Bash のプロンプトが壊れるとか
いろいろ言っていたが、いまさらながら調査した。

その結果、プロンプトに太字 (`\033[1m`) が含まれていると、履歴遡った時に文字列が残ったり、
入力中に行がずれたりすることが分かった。
試した範囲では 8 文字ずれるっぽい。

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
