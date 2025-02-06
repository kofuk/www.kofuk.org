---
title: "すごい syslog の話"
date: 2020-02-22T09:33:56+09:00

tags:
  - tech
  - GNU/Linux
  - shell
---

なんか `/var/log` あたりを見ても `syslog` がないな，と思っていたら，
systemd がすごい syslogd をやってるらしい。systemd 肥大化しすぎでは……。

で，そのログを見るには，

```console
$ journalctl
```

とかする。

でも，これは保存されているログが古い方から全部出てしまうのでたいていの場合は用途に合わない気がする。
僕の場合は 12 月のログとかが最初に出てきてうーん，となった。
たいていの場合はログは新しい方から見たいんではないかと思うので，そういう場合は，

```console
$ journalctl --reverse
```

とかすると，新しいものから表示してくれる。

あと `--grep` オプションとかもあって，

```console
$ cat /var/log/syslog | grep foobar
```

みたいにやってたところを 1 つのコマンドで済ませられるっぽい。うーん，でもこれはなんかなー。

他には `--since` とか `--until` とかもあるっぽいけど，`syslog.1` とかの方がなんとなく好きだったりします。

## 参考

- man page for journalctl
