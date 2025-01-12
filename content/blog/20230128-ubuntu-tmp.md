---
title: "Ubuntuの/tmpをtmpfsにする方法"
date: 2023-01-28T22:49:51+09:00
tags:
  - tech
  - Ubuntu
  - systemd
  - GNU/Linux
---

systemd のデフォルトでは /tmp は tmpfs でマウントされるようになっている。
でも Ubuntu では /tmp で tmpfs を使わないようにしてある。何度か /tmp を tmpfs にする試みはあったらしい[^1]が……。

まあどうでもいいといえばどうでもいいが、Ubuntu の /tmp を tmpfs にする方法。

```shell
$ sudo systemctl enable /usr/share/systemd/tmp.mount
$ sudo reboot
```

これだけ。

通常、systemd では /tmp は tmp\.mount でマウントされる。
Ubuntu でもこのファイルは /usr/share/systemd にインストールされるようになっていて、ユーザの好みに合わせて使える。
ただし、ここはユニットファイルの検索パスに入っていないので普通に指定すると有効化できない。
というわけで、フルパスを指定して mount unit を有効化することで、直接使えるようにしている。

起動中に /tmp をマウントし直すと中に置いてあるファイルが見えなくなってしまうので、再起動するのが安全だと思う。

[^1]: [Data Driven Analysis: /tmp on tmpfs | Ubuntu](https://ubuntu.com/blog/data-driven-analysis-tmp-on-tmpfs)
