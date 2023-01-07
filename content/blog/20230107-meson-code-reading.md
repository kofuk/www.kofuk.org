---
title: "Mesonのコードを読む (1)"
date: 2023-01-07T21:13:07+09:00
tags:
  - development
  - code reading
  - Meson
---

お久しぶりです。
どうでもいいことを気軽に書けるように（ブログサービスではなく）自分のブログを作っているのに、あんまり気軽に書けてないなと感じている今日この頃です。
で、普段からどうでもいいことを書いていないとどうでもいいことも書きづらくなってしまうな（？）と思ったわけで、質にはこだわらずにどうでもいい記事をぽんぽん出していこうと
思ったわけですね。でも書くからには何かネタがないと厳しいなというわけで、適当にそのへんの OSS のコードを読んでそれを記事にするというのをひとまず続けてみようと思っています。
コード読んで解説くらいだったらそんなに負荷も高くないので続けられそうという希望的観測もあります。
あと他人のコード読むといろいろ学べるところもありますしね。

で、何のコードを読むか迷ったんですが、最初は軽めにビルドシステムの Meson を読んでみることにしました。

Meson は最近 Linux デスクトップ界隈で流行っている（という認識の）ビルドシステムです。
「何か実行ファイルをビルドする」というときに、必要なソースコードとかライブラリとかを書くと、インストールされているコンパイラを探し、それらの依存関係を解決しながら
ビルドするということをやってくれます。まあ厳密にいうと実際にビルドする部分は Ninja という別のシステムに任せてるんですけどね。
CMake の~~文法キモくない版~~みたいな感じです。

採用例としては GNOME プロジェクトはほとんどこれを使うようになっていますし、
systemd や D-Bus といったデスクトップの周辺ツールとかも軒並みこのビルドシステムを使っています。

Meson は CMake と同じように C や C++ といった言語のプロジェクトのビルドに使えます。あとちょっと変わっている点として Rust をサポートしています。
Rust は Cargo がいるから別にやらなくて良さそうな感じがするんですが、ちょっと前に出た Meson 1.0.0 で stable になったらしいです[^1]。
Mesa がプロダクションで使ってるらしい。

てなわけで、ここで頑張っていろいろ書くのもめんどくさくて続けられなくなりそうなので、適当に概要を列挙してコードを読んでいきたいと思います。

## Meson の概要

- 名前: Meson
- ライセンス: Apache-2.0
- 言語: Python
- 初回コミット (多分): 2012/12/23 ([a428c953ffd017933c7540927ecc6c1ee83f1a8d](https://github.com/mesonbuild/meson/commit/a428c953ffd017933c7540927ecc6c1ee83f1a8d))
- ビルドシステム

## 前提知識

さすが使い方くらいは軽く説明しておかなければという気分になったので。

Meson の使い方のだいたいの流れは下のような感じになります。

1. プロジェクトのルートに `meson.build` というファイルを作り、ビルドの設定を書く  
以下は `main.c` から `hoge` という実行ファイルを作るときの記述例
```meson
project('hogehoge', 'c')
executable('hoge', 'main.c')
```
2. コマンドラインで以下のコマンドを実行し、`_build` に Ninja のビルドファイルを生成する
```shell
$ meson setup . _build
```
3. ビルド用のディレクトリで `ninja` コマンドを実行し、実際にビルドする
```shell
$ cd _build
$ ninja
```

簡単なビルドファイルの例を示しましたが、実際には「ライブラリをビルドし、そのライブラリをリンクした実行ファイルを作る」
みたいなことをやったりするので、target 間で依存関係が発生します。
また、ソースコードを変更していないときはビルドしないみたいなこともやってくれます（まあこの部分は Ninja の責務のはずですが）。

今回は `meson setup` を実行してビルドファイルを生成するまでのところをいけるところまで読んでいきたいと思います。

挙動から推測すると、以下のような処理が実装されているはずです。

1. プロジェクトルートの `meson.build` ファイルをパースする
2. パースした情報を使って Ninja のビルドファイル（`build.ninja`）を生成

ターゲット間の依存関係の解決とかはおそらく Ninja の責務になっているので、自分でトポロジカルソートしたりといったことは
必要ないんでないかと思います。
なのでおそらく Meson 自体は `meson.build` のファイルを `build.ninja` に変換するトランスパイラみたいになってるんでないかと。

今回は執筆時点で最新の master ブランチ ([25e73b6c9e9599e852fba1f153497de1eccd862b](https://github.com/mesonbuild/meson/tree/25e73b6c9e9599e852fba1f153497de1eccd862b)) を読んでいきます。
~~後で思ったけど最新リリースとかを読んだ方が良かった。~~

## そろそろ始めよう（なかなか始まらん）

Meson の実質的なエントリーポイントは `mesonbuild/mesonmain.py` の `run` 関数にあります（プロジェクトのルートに `meson.py` というのがあるのですが、
このファイルは単なるラッパーなので大したことはやっていません）。

```python
def run(original_args, mainfile):
    # [...]

    args = original_args[:]

    # Special handling of internal commands called from backends, they don't
    # need to go through argparse.
    if len(args) >= 2 and args[0] == '--internal':
        if args[1] == 'regenerate':
            set_meson_command(mainfile)
            from . import msetup
            try:
                return msetup.run(['--reconfigure'] + args[2:])
            except Exception as e:
                return errorhandler(e, 'setup')
        else:
            return run_script_command(args[1], args[2:])

    set_meson_command(mainfile)
    return CommandLineParser().run(args)
```

実は Meson は生成された `build.ninja` の中からも呼び出されるようになっていて（CMake もこのような実装になっています）、
その場合を特別扱いするような実装が入ったりしていますが、ここでやっているのは `CommandLineParser` に引数を全部渡して実行するというだけです。
`CommandLineParser` はコマンドライン引数を解析してサブコマンド（ここでいう `setup` コマンド）に対応する関数を呼び出します。
パースするだけな感じの名前なので、`CommandLineParser` よりもっと別の名前あっただろという感じがしますが、こういうのであれこれ言っても
自転車置き場の議論にしかならないんだろうなとは思います。

さて、`CommandLineParser` の実装ですが、これも同じファイルにあり、argparse を使ってコマンドライン引数を解析するようになっています。
こいつのコンストラクタを見れば全サブコマンドのエントリーポイントが分かります。

```python
    def __init__(self):
        # [...]

        self.add_command('setup', msetup.add_arguments, msetup.run,
                         help_msg='Configure the project')
        self.add_command('configure', mconf.add_arguments, mconf.run,
                         help_msg='Change project options',)
        self.add_command('dist', mdist.add_arguments, mdist.run,
                         help_msg='Generate release archive',)
        # こんな感じで続く
```

`add_command` の引数は、サブコマンド名、argparse のパーサに引数を追加する関数、サブコマンド本体の関数、ヘルプメッセージという感じになっています。
`add_command` の中では "Hidden command" という、ヘルプに出てこないコマンドを作るためのハックをやっていたりするのですが、どうでもいいので飛ばします。

で、ここで作られた argparse のパーサが使われるのが、さっきの `run` 関数で呼び出されていた `CommandLineParser#run` です。

```python
    def run(self, args):
        # [...]

        # Hidden commands have their own parser instead of using the global one
        if args[0] in self.hidden_commands:
            command = args[0]
            parser = self.commands[command]
            args = args[1:]
        else:
            parser = self.parser
            command = None

        from . import mesonlib
        args = mesonlib.expand_arguments(args)
        options = parser.parse_args(args)

        if command is None:
            command = options.command

        # [...]

        try:
            return options.run_func(options)
        except Exception as e:
            return errorhandler(e, command)
        # [...]
```

（ここに来る過程でいわゆる（？）`argv[0]`（実行ファイルのファイル名）は削り落とされているので、`args[0]` がサブコマンドの名前になっています。）

"Hidden command" のせいで面倒臭くなっているのですが、基本はサブコマンド込みの argparse パーサに引数を渡して引数を解析しています（`parser.parse_args(args)` の行）。
その前の行で `mesonlib.expand_arguments` を呼び出している部分がありますが、これは curl にあるように `@ファイル名` というような引数を渡すとそのファイルの内容が
展開されるようになっています（この仕様を述べたドキュメントを見つけられていないのですが）。

そして、解析された引数を使ってサブコマンドのエントリーポイントとなる関数を呼び出しています。

ちなみにさっきの `@ファイル名` が展開される仕様は若干バグっていると思っています。
`expand_arguments` は 1 つでもファイルの展開に失敗したら `None` を返すようになっているのですが、呼び出し元で `None` かどうかをチェックしていません。
というわけで、`expand_arguments` が `None` を返した場合、argparse の `parse_args` は引数が `None` になります。
その場合、`sys.argv` が使われるので、展開前の引数を使ってこの後の処理が続けられることになります。
まあこの機能自体 undocumented な気がするので、割とどうでもいい気はするのですが、そのうち issue とかで聞いてみてもいいのかなとは思っています。

ここからが `setup` コマンドの実装になります。
`msetup.run` が実行されるようなので、その実装がある `mesonbuild/msetup.py` を見ていきます。

```python
def run(options: T.Union[argparse.Namespace, T.List[str]]) -> int:
    if not isinstance(options, argparse.Namespace):
        parser = argparse.ArgumentParser()
        add_arguments(parser)
        options = parser.parse_args(options)
    coredata.parse_cmd_line_options(options)
    app = MesonApp(options)
    app.generate()
    return 0
```

argparse でパースされていない引数も受け取れるようになっているので最初のところに分岐がありますが、
ここで重要なのは `MesonApp` のインスタンス化をして `generate` を呼ぶという部分です（偏見かもしれませんが、こういう親切っぽい実装は Python でありがちな気がしています）。

`coredata.parse_cmd_line_options(options)` という行がありますが、これは `setup` コマンドに複数の方法で渡せる同じ意味の引数
（build type を指定するのに `-Dbuildtype=debug` のように指定する方法と `--buildtype=debug` のように指定する方法がある）をいい感じにしているだけです。

どうでもいいですが、他のサブコマンドもある中でここだけ `MesonApp` を名乗っているあたり、歴史的経緯の香りがしますね。

`MesonApp` の実装を見ていきましょう。これも同じファイルにあります。
コンストラクタでは大したことをやっていないので飛ばし、`generate` メソッドを見てみますが、これもほとんど `_generate` を呼び出すだけのメソッドなので
``_generate` メソッドの中身を読んでいきます。

```python
    def _generate(self, env: environment.Environment) -> None:
        # [...]
        b = build.Build(env)

        intr = interpreter.Interpreter(b, user_defined_options=user_defined_options)
        # [...]
        try:
            if self.options.profile:
                # [...]
            else:
                intr.run()
        except Exception as e:
            # [...]

        # [...]
        try:
            # [...]
            if self.options.profile:
                # [...]
            else:
                intr.backend.generate()

            # [...]
```

ログの出力とかプロファイリングとか目的外のファイルの生成の部分とかは省略しました。

最初の方にある `build.Build` というのはビルドに必要なデータを全て持っておくためのクラスらしいです。
`Interpreter` が解析したデータを `Build` が持つというような実装になっていそうですね。

で、あとは `Interpreter` のインスタンスを作り、`run` で実行して `intr.backend.generate` で `build.ninja` を生成するようになってそうです。

てことで `Interpreter` を見ていきます。

```python
    def __init__(
                self,
                _build: build.Build,
                backend: T.Optional[Backend] = None,
                subproject: str = '',
                subdir: str = '',
                subproject_dir: str = 'subprojects',
                default_project_options: T.Optional[T.Dict[OptionKey, str]] = None,
                mock: bool = False,
                ast: T.Optional[mparser.CodeBlockNode] = None,
                is_translated: bool = False,
                relaxations: T.Optional[T.Set[InterpreterRuleRelaxation]] = None,
                user_defined_options: T.Optional['argparse.Namespace'] = None,
            ) -> None:
        super().__init__(_build.environment.get_source_dir(), subdir, subproject)
        # [...]
        if not mock and ast is None:
            self.load_root_meson_file()
            self.sanity_check_ast()
        elif ast is not None:
            # [...]
        self.builtin.update({'meson': MesonMain(self.build, self)})
        # [...]

        # [...]
        if not mock:
            self.parse_project()
        # [...]
```

`self.load_root_meson_file()` でさらっと `meson.build` を読む部分を呼び出しています。
普段 C++ を書いているとコンストラクタで例外が発生するような処理をしたくない癖があるので見落としかけました。
その次の行の `sanity_check_ast` では、`meson.build` の一番最初で `project` 関数を呼び出しているかチェックしています。
で、最後の `parse_project` でその呼び出しを評価し、プロジェクトの初期化をしているみたいです。~~割と雑な実装だなぁ~~

構文解析の入口っぽいところは見えたので `Interpreter#run` を見てみます。
…がこれはほとんどの処理が親クラスの `InterpreterBase#run` で行われているので、そちらを見てみます。

```python
    def run(self) -> None:
        # Evaluate everything after the first line, which is project() because
        # we already parsed that in self.parse_project()
        try:
            self.evaluate_codeblock(self.ast, start=1)
        except SubdirDoneRequest:
            pass
```

ここでは `evaluate_codeblock` を呼び出して AST を評価しています。`start=1` になっているのは、0 番目は `project()` の呼び出しで、
既に評価されているからです。

次は `intr.backend.generate` を見ていきますが、まず `intr.backend` の出自を探る必要がありそうです。
今まで見てきたところでは特に backend の設定は出てこなかったので、雑に grep して探します。
すると、`self.backend` に値を書いているのは `set_backend` というメソッドだということが分かりました。

```python
    def set_backend(self) -> None:
        # The backend is already set when parsing subprojects
        if self.backend is not None:
            return
        backend = self.coredata.get_option(OptionKey('backend'))
        from ..backend import backends
        self.backend = backends.get_backend_from_name(backend, self.build, self)

        if self.backend is None:
            raise InterpreterException(f'Unknown backend "{backend}".')
        if backend != self.backend.name:
            if self.backend.name.startswith('vs'):
                mlog.log('Auto detected Visual Studio backend:', mlog.bold(self.backend.name))
            self.coredata.set_option(OptionKey('backend'), self.backend.name)

        # Only init backend options on first invocation otherwise it would
        # override values previously set from command line.
        if self.environment.first_invocation:
            self.coredata.init_backend_options(backend)

        options = {k: v for k, v in self.environment.options.items() if k.is_backend()}
        self.coredata.set_options(options)
```

そのメソッドは `func_project` というメソッドから呼ばれていることが分かります。

```python
    def func_project(self, node: mparser.FunctionNode, args: T.Tuple[str, T.List[str]], kwargs: 'kwtypes.Project') -> None:
        # [...]
        # けっこう長いコード
        # [...]

        self.set_backend()
        # [...]
```

名前からして `meson.build` の `project()` 関数の中の人っぽいですが、一応確認します。

コンストラクタから呼ばれている `build_func_dict` で、`project()` 関数として登録しているっぽい部分があります。

```python
    def build_func_dict(self) -> None:
        self.funcs.update({'add_global_arguments': self.func_add_global_arguments,
                           # [...]
                           'project': self.func_project,
                           # [...]
                           })
        # [...]
```

一応 `funcs` も見てみると、`InterpreterBase` の `function_call` メソッドで、ここから探しているっぽい処理があったので
おそらく Meson の `project()` で間違っていないでしょう。

`self.backend` の設定は `meson.build` の `project` の呼び出しと同時に行われることが分かりました（ということにします。多分合ってるので。）

………ということで、今度は `build.ninja` を生成するバックエンドの実装を探す必要があります。  
`set_backend` の中の `backends` を見てみます。`mesonbuild/backend/backends.py` に実装があります。

```python
def get_backend_from_name(backend: str, build: T.Optional[build.Build] = None, interpreter: T.Optional['Interpreter'] = None) -> T.Optional['Backend']:
    if backend == 'ninja':
        from . import ninjabackend
        return ninjabackend.NinjaBackend(build, interpreter)
    elif backend == 'vs':
        from . import vs2010backend
        return vs2010backend.autodetect_vs_version(build, interpreter)
    elif backend == 'vs2010':
        from . import vs2010backend
        return vs2010backend.Vs2010Backend(build, interpreter)
    elif backend == 'vs2012':
        from . import vs2012backend
        return vs2012backend.Vs2012Backend(build, interpreter)
    elif backend == 'vs2013':
        from . import vs2013backend
        return vs2013backend.Vs2013Backend(build, interpreter)
    elif backend == 'vs2015':
        from . import vs2015backend
        return vs2015backend.Vs2015Backend(build, interpreter)
    elif backend == 'vs2017':
        from . import vs2017backend
        return vs2017backend.Vs2017Backend(build, interpreter)
    elif backend == 'vs2019':
        from . import vs2019backend
        return vs2019backend.Vs2019Backend(build, interpreter)
    elif backend == 'vs2022':
        from . import vs2022backend
        return vs2022backend.Vs2022Backend(build, interpreter)
    elif backend == 'xcode':
        from . import xcodebackend
        return xcodebackend.XCodeBackend(build, interpreter)
    return None
```

まさかのひたすら if 文を書いて出し分けていました。

あとは `NinjaBackend` の `generate` メソッドを見ていけば良さそうですね。`mesonbuild/backend/ninjabackend.py` に実装があります。

長かったのでコードは次回以降読んでいくことにしますが、`build.ninja` の生成はこの中にあるという認識で間違いなさそうです。
ついでに後ろの方で `compile_commands.json` の生成とかもやってそうな雰囲気。

全体の雰囲気が掴めたところで今回はおわりにします。

## 感想

内容を考えるのは簡単ですが、単純に文章の入力がめんどくさいことが分かりました。
あんまり頑張ると続かないので、もっと細切れにして負荷を下げていこうと思います。

## 次回以降

`InterpreterBase#load_root_meson_file` から呼ばれているパーサ周りと `evaluate_codeblock` から呼ばれている評価系、
`NinjaBackend` のジェネレータ周りを見ていきたいです。

割と素朴な実装っぽいのが見えてきたので、このへんはさらっと流してもっと細かいところを見た方が面白い説はありますが。

[^1]: [The Rust module is stable](https://mesonbuild.com/Release-notes-for-1-0-0.html#the-rust-module-is-stable)
