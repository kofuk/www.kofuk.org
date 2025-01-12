---
title: "Qtに入門する"
date: 2020-08-10T22:26:28+09:00

tags:
  - tech
  - Qt
---

Qt は全く使ったことがなかったが，ここまでできれば簡単なことはリファレンスだけで
できそう。

.ui ファイルでレイアウトを作る方法や QtCreator を使う方法（まあこれも間接的に .ui を使う
方法だといえると思うが）ではなく，とりあえずコードでレイアウト組む方法でやってみた。
ちょっとした GUI を作るのに別ファイルが必要だったりテキストファイルを埋め込んだり
（バッファから読ませることができるのかは調べてないので分からない）というのは
面倒臭いと思ったので。

というわけで Hello world。

```c++
#include <QApplication>
#include <QLabel>

int main(int argc, char **argv)
{
    /* Widget を作る前に QApplication を作っておく必要あり */
    QApplication app(argc, argv);

    QLabel l("Hello");
    l.setWindowTitle("Hello world!");
    l.show();

    return app.exec();
}
```

コンパイルは：

```shell
$ g++ -fPIC $(pkg-config --cflags --libs Qt5Widgets) foo.cc
```

これで Hello と書かれた Hello world というタイトルのウィンドウが出てくる。
まともにレイアウトを作るならばなんとか Layout とかに `addWidget` したりしていき，
最後にルートの Widget に `setLayout` していくことになる。

Layout も show できるのかなと思ったけど Layout は Widget を継承していないらしい。

あと，Qt の諸々のオブジェクトをスタックに確保したくない場合，`new` した Widget に
`setAttribute(Qt::WA_DeleteOnClose)` しておけば自動で `delete` してくれるらしい。
これが開放されるときはどうせプロセスが死ぬとき（だと思う）ので開放しなくてもいいような
気もするが，leak sanitizer とかを使ったときにうるさいと思うので開放した方が無難な気がする。

・・・と思ったけどなぜか sanitizer 使っても検出されない（謎）。

依存関係の解決について，今回は適当に pkg-config でやったが，CMake もそれ用のモジュールが
あるので割と簡単にプロジェクトを作れるはず。

たぶん Qt 推奨のツールチェーンを使えばもっと簡単にセットアップできるんだろうが，
ビルド時に Qt のツールに依存するのは何となく面倒臭いと思ったので（CLI でできるのかしらん）
とりあえずコンパイルして動かすくらいはできてよかった。あと i18n だか l10n だかにも入門していきたい
（違いが分かっていない人）。
