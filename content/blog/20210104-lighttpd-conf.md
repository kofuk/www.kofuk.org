---
title: "lighttpd でローカルでいろいろやる場合のテンプレート"
date: 2021-01-04T17:58:57+09:00
tags:
  - tech
---

あけましておめでとうございます (社交辞令) ってことで、lighttpd
で適当にローカルにサーバ立てたりする場合のテンプレートをメモ (新年とか関係ないけどそのくらいのもの)。

Python の http.server モジュールとかでも静的なファイルを見せるとかとおまけの CGI
くらいの機能ならあるんだけど、なんかいろいろ足りなかったりするので。

## コマンドラインでいい感じになるように起動する

デフォルトだとデーモンになってしまってウザい (は？)。

```shell
$ lighttpd -D -f path-to-conf.conf
```

## FastCGI

```lighttpd
server.port = 8000
server.document-root = "<適当>"
server.modules += ( "mod_fastcgi" )

server.error-handler-404 = "/"
fastcgi.server = (
    "/" => (
      (
        "socket" => "<ソケットへのパス>",
      )
    )
)
```

## WebDAV

ずっと立てておくわけではないので認証とかはいらないものとする。

```lighttpd
server.port = 8000
server.modules += ( "mod_fastcgi", "mod_cgi", "mod_webdav" )

server.document-root = "<見せたいディレクトリ>"

webdav.activate = "enable"

# ro にしたい場合
#webdav.is-readonly = "enable"
```

これでファイルマネージャとかで `dav://localhost:8000` ってやると自分のところにあるファイルが
WebDAV 越しに見えて嬉しい (別に嬉しくない)。

・・・やっぱり認証とかもできたほうが嬉しい気がしてきたのでメモ。以下を追記する。

```lighttpd
server.modules += ( "mod_auth", "mod_authn_file" )

auth.backend = "htdigest"
auth.backend.htdigest.userfile = "./users"
auth.require = ( "/" =>
    (
        "method"  => "digest",
        "realm"   => "WebDAV",
        "require" => "valid-user"
    )
)
```

で、認証情報のファイルつごうする。`htdigest` コマンドがあるならそれで生成してもいいが、
ないものをわざわざインストールするのは面倒なのでワンライナーで適当にでっちあげる。

```shell
$ echo "<user>:WebDAV:$(echo -n '<user>:WebDAV:<password>' | md5sum | cut -d' ' -f1)" >>users
```

今回 WebDAV と書いた部分は realm と呼ばれる部分で、ここは任意の文字列が使える。
ただし `userfile` で使ったものと lighttpd の設定に書いた realm が一致していないと認証に失敗するので注意。

## ところで

Emacs の TRAMP、`ssh:` とか `scp:` とか `sudo:` とかだけじゃなくて `dav:`
もいけるんですね。まあ WebDAV のサーバ立てられるくらいならきっと SSH も使えるので
わざわざ WebDAV 準備する必要ない気がするけど。

## どうでもいい

lighttpd の設定ファイルでは `'` で囲った部分は文字列として認識されないみたいなのでハマった。
