---
title: "DBusのEmacs Lispバインディング"
date: 2020-11-25T13:41:19+09:00
tags:
  - development
  - GNU/Linux
  - DBus
---

Emacs の scratch バッファで DBus のメソッドを叩いたりできるので便利。たぶん。
DBus 便利じゃんね。（分かってない）

## Introspection

プロパティとかインターフェースを眺めるやつ。
GNOME Shell のスクリーンショットのインターフェースを眺めてみる。
XML でなくて S 式で表示される。

```lisp
(dbus-introspect-xml
 :session "org.gnome.Shell"
 "/org/gnome/Shell/Screenshot")
```

## メソッドを叩く

適当に introspection で見えた通りに引数を詰め込んでウィンドウのスクリーンショットを撮ってみる。
コマンドラインの `dbus-send` だと型の指定が面倒だが（まあ `1` と `"1"` の区別つかないのでそれはそう）
Emacs だと Lisp での型が適当に DBus の型にマッピングされていて割と楽。
あと引数が一致しなかったりしたら Emacs Lisp の例外が上がる。

```lisp
(dbus-call-method
 :session "org.gnome.Shell"
 "/org/gnome/Shell/Screenshot"
 "org.gnome.Shell.Screenshot"
 "ScreenshotWindow"
 t t nil "/tmp/foo.png")
```

## プロパティを読む

同上

```lisp
(dbus-get-property
 :session "org.gnome.Shell"
 "/org/gnome/Shell"
 "org.gnome.Shell"
 "ShellVersion")
;=> "3.38.1"
```

## プロパティに書く

同上。これをやるとウィンドウ一覧の画面が表示される。

```lisp
(dbus-set-property
 :session "org.gnome.Shell"
 "/org/gnome/Shell"
 "org.gnome.Shell"
 "OverviewActive"
 t)
```

## シグナル

同じ。面倒臭くなってきた。
これは存在しないシグナルを subscribe してもエラーが出ないっぽい。

```lisp
(dbus-register-signal
 :session "org.gnome.Shell"
 "/org/gnome/Shell"
 "org.gnome.Shell.Extensions"
 "ExtensionStatusChanged"
 (lambda (uuid state error)
    (message "uuid: %s" uuid)))
```

## 結論

Python 好きじゃないこともあるのかもしれんが、いろいろ書かなくていいので面倒臭い度低めな気がする。
一回眠くなくなったけどまた眠くなってきた。

## 参考

- [ぐぬーのさいと](https://www.gnu.org/software/emacs/manual/html_mono/dbus.html)
