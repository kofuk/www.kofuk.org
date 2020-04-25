---
title: "技術的な質問の作法はバグ報告と同じなのではないかと思う"
date: 2020-04-08T23:11:18+09:00

tags:
  - development
---

これは自分もできているとは言い切れない話なんですが（というか技術的なことを他人に質問する機会がなかなかない），
技術的な質問はバグ報告と同じような作法でやるといいような気がします。

バグ報告をするときに最低限求められる項目としては以下のようなものが挙げられると思います。

- 環境
- 再現するための手順
- 期待する挙動
- 実際の挙動

環境ってのには OS とか CPU のアーキテクチャとかが入ります。あと関連するソフトウェアやライブラリのバージョンの有無なんかが
入ります。でもまあ相手がそのあたりを想像できるのであればここはそんなに詳細に説明しなくてもいいんではないかと思います。
重要なのはあとの 3 つ。

再現するための手順というのには，意図しない挙動にたどりつくまでに自分がやった操作が入ります。
ただ直接的に意図しない挙動に結びついた操作がどれなのかということを自分で特定できる場合には
他人に質問しなくても調べれば解決することが多い気がします。あくまで僕の感覚ですが。
ただこの部分がないと質問した相手でさえも意図しない挙動に結びついた操作がどれなのか特定のしようがないので，
これは多少冗長になっても真面目に書いたほうがいい気がしています。

あと期待する挙動と実際の挙動。バグ報告と同じで，うまくいっていないと思っていた挙動が実は正しい挙動だったということは往々にして
起こります。なのでこの部分を書いておくことは非常に重要です。

で，質問として非常に多いなと思うのは実際の挙動しか説明していないパターンです。
この部分しか説明せずに質問した内容が解決する可能性は極めて低いので，バグ報告をする感覚で質問するのがよいのではないかと思います。