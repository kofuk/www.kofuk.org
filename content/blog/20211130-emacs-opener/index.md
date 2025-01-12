---
title: "Emacs内のターミナルでのEmacsの実行をいい感じにした"
date: 2021-11-30T22:27:16+09:00
tags:
  - tech
  - Emacs
---

ちょっと前ですが、「Emacs 内のターミナルで Emacs を開こうとしたら既に開いている
Emacs でそのファイルを開く」やつを作りました。

![動作](emacs.gif)

## しくみ

ざっくり説明すると、DBus を使って Emacs とシェル (で立ち上がるプロセス) が通信して、
Emacs を開く代わりに現在のセッションで開いているように*見せる*という感じになります。
通信できるなら別に DBus じゃなくてソケットでもいいんですが、DBus だと Emacs Lisp の
インターフェースでサーバを作るのが楽なので DBus になりました。

さて、この機能の実現には Emacs 側とシェル側 (厳密には `emacs` コマンドで立ち上げるプロセス)
に細工が必要です。これ以降でそれらをもう少し詳しく説明します。

## Emacs 側の細工

DBus インターフェースで待ち受けておく必要があります。

幸い Emacs には DBus を扱うためのパッケージがもともと入っているのでこれを使います。

やっていることは単純で、DBus のメソッドが叩かれたら `find-file-other-window` で別のウィンドウで
指定されたファイルを開いているだけです。
```el
(defun remocon--handle-open-buffer (path)
    (message (concat "Open file requested from remote: " (file-name-nondirectory path)))
    (find-file-other-window path)
    t)

;; ...

(defun ;...
    ;;...
    (dbus-register-method
     :session
     opener-service-name
     "/org/kofuk/EmacsOpener"
     "org.kofuk.EmacsOpener"
     "OpenBuffer"
     #'remocon--handle-open-buffer))
```

考慮すべき点として、Emacs を複数立ち上げるというのもありうるので、DBus のインターフェースが
被らないようにしてあげないといけません。
そこで、インターフェースに pid をプリペンドして適当に回避しています。

あと、本筋とはあまり関係ないですが、`org.freedesktop.DBus.Introspectable` などの
introspect 用のメソッドとかを実装しておかないと他のツールなどで introspect できなくて気持ち悪いので、
少し冗長ですが真面目に実装しています。このせいでだいぶコードが長くなった。

扱いやすいように global な minor-mode にまとめました。
(名前は適当に remocon-mode にしました。ところでリモコンという略称は和製らしいですね)。

現状ファイルを開く機能しかないですが、もちろん他の機能を叩くためのメソッドを生やすことも可能なので
思いついたら実装していきたいです。

[ソースコード](https://github.com/kofuk/emacs-config/blob/67aa84c97b7f4466043047f322819bbe901f897d/site-lisp/remocon.el)

## シェル側の細工

Emacs 内で立ち上げられたシェルのプロセスには `INSIDE_EMACS` という環境変数がいるので
それを見て分岐しています。

```bash
function emacs() {
    if [ ! -z "${INSIDE_EMACS}" ] && [[ $# -eq 1 ]]; then
        dbus-send --session --print-reply --type=method_call --dest="org.kofuk.EmacsOpener${PPID}" \
                  /org/kofuk/EmacsOpener "org.kofuk.EmacsOpener.OpenBuffer" \
                  "string:$(realpath -s "$1")" &>/dev/null \
            && return
    fi
    command emacs "$@"
}
```

`--print-reply` して `&>/dev/null` しているので一見無駄に見えますが、こうすることで
`dbus-send` コマンドが Emacs と正常に通信できたことを確認するまで待ってくれます。
こうすることで、何らかの要因で Emacs と通信できなかった場合にも通常の Emacs の起動にフォールバックできます。

こういうラッパー的な関数全般に言えることですが、関数内でコマンドの `emacs` を起動するときは
`command emacs` のように書かなければ、関数の方の `emacs` の実行になってしまい無限ループに
陥るため注意が必要です。

[ソースコード](https://github.com/kofuk/dotfiles/blob/a8ab30b44427e641aa4791476ec979f6077873ab/bash/utilities.bash#L356-L364)
