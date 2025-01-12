---
title: "標準入出力を乗っ取ったりしていろいろやる"
date: 2020-07-07T17:11:06+09:00

tags:
  - shell
  - tech
---

ちょっと前に `.bashrc` に追加したやつの紹介。

既に（別の terminal で）動いているプロセスの stdin, stdout, stderr を乗っ取って自分の terminal に
無理矢理つなぐ。

（適当に dotfiles から抜粋）

```bash
if [ "$#" -ne 1 ]; then
    echo 'usage: hijack PID' >&2
    return 1
fi
local tty="$(readlink /proc/self/fd/0)"

echo "Info: Connect to $tty"

local run_as_root=
if command -v sudo &>/dev/null && [ "_$(whoami)" != '_root' ]; then
    run_as_root=sudo
fi

local pid="$1"

$run_as_root gdb -p "$pid" <<EOF
compile code                                                        \
unsigned char attrs[3][1024];                                       \
for (int fd = 0; fd < 3; ++fd) {                                    \
    tcgetattr(fd, (struct termios *)attrs[fd]);                     \
}                                                                   \
dup2(open("$tty", 0 /* O_RDONLY */), 0);                            \
dup2(open("$tty", 1 /* O_WRONLY */), 1);                            \
dup2(open("$tty", 1 /* O_WRONLY */), 2);                            \
for (int fd = 0; fd < 3; ++fd) {                                    \
    tcsetattr(fd, 0 /* TCSADRAIN */, (struct termios *)attrs[fd]);  \
}
EOF
# If this is TUI app, let it redraw.
kill -WINCH "$pid"
tail -f /dev/null --pid "$pid"
```

やっていることは基本的に単純で，gdb でプロセスを attach して file descriptor
の 0 から 2 までを書き換えています。`compile` ってのは gdb のコマンドで，渡したコード
をコンパイルして，そのプロセスで実行してくれる。このときに `#include` すると
いろいろ問題が起きたりしたので `O_RDONLY` とか `O_RWONLY` とかは数字をそのまま書いてある。
あといろんなヘッダファイルに書いてある情報が使えないがために `struct termios` の
大きさが 1024 byte 以下という仮定をしていたりする。1 KiB 超えの構造体ってなんやねん
なので大丈夫やろ。

最後に謎に `/dev/null` を tail しているのは，乗っ取ったプロセスが死ぬまで shell に
戻したくないからです。

gdb でプロセスを attach する場合 root が要るんですが，そこで sudo とか使っているのは
気に食わない…んですがこれは仕方ないです。諦めます。

で，基本要るのは open して dup2 するところなんですが，curses アプリとかも乗っ取りたいなー
という願望が生まれて（危険）， termios とかもコピる感じになってます。あとプロセスに
SIGWINCH を送ってあげて，画面を再描画させる。WINCH のデフォルトハンドラは SIG_IGN なので
基本問題ないはず。Apache とかは graceful restart のシグナルが SIGWINCH らしい。
どうでもいい。

まあこいう方法でやればいいっつーのはいつでも思いつく気がするけど（乱暴）使いたいときに
一発で書くのは割と面倒な気がする。

でこれで Vim はとりあえず乗っ取れます。Emacs は無理でした。なんか 0, 1, 2 を使ってない。
