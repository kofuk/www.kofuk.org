---
title: "Linux 環境で適当にサンドボックスする"
date: 2020-05-18T22:54:37+09:00

tags:
  - GNU/Linux
---

入れる．

```shell
$ sudo pacman -Ss firejail
```

再起動する．

試しに Bash を実行する．

```shell
$ firejail bash
```

一見普通に Bash が起動したように見えるが， `ps aux` とかやってみると普通じゃないことが
すぐに分かって，他のプロセスが見えない．

```shell
$ ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
kofu           1  1.5  0.0   4952  2612 pts/2    S    22:58   0:00 firejail bash
kofu           3  1.5  0.0   9368  4884 pts/2    S    22:58   0:00 bash
kofu           5  0.0  0.0   9844  3084 pts/2    R+   22:58   0:00 ps aux
```

でもこれだとホームディレクトリへの読み書きとかは普通にできる．
それが嫌だったら `--private` をつけてやると，何もない tmpfs がホームディレクトリにマウントされる．

おしまい．
