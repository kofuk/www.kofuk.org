---
title: "Socket Activation"
date: 2021-03-04T23:14:46+09:00
tags:
  - development
  - systemd
---

systemd の Unit ファイルっぽいものにはいろいろ種類があって、
一番よく見かける .service のやつの他にも .socket とか .mount とかいろいろある。
その中で、ソケット関連を systemd がよしなにやってくれる socket activation というやつが
便利そうだったので適当に触ってみた。

## service と socket について

socket の方を enable しておくと、systemd が指定したソケットを見ておいて、
必要なときに対応する service の方を起動してくれる。
んで仮に service を止めたとしても、socket の方が残ってればまた
接続があったときによしなに service を起動してくれる。

完璧に Unix ドメインソケットの話してるけど、ソケットのファイルの管理は
地味にめんどい (ファイル残ってると次回起動するときに面倒くさいので消したいとか
パーミッションをいろいろやりたいとか) のでそのへんを自動でやってくれるのは便利だなと思いました。

## C API

systemd から立ち上げられたときに見に行くべきソケットを見つける方法。

`sd_listen_fds(3)` で渡されたソケットの数を取れるので、\\([SD\\_LISTEN\\_FDS\\_START..SD\\_LISTEN\\_FDS+n)\\)
が渡されたファイルディスクリプタになる。`sd_listen_fds` の第 1 引数を非ゼロにすると、ファイルディスクリプタを
教えるために設定されていた環境変数が消えるらしいけど、特にこだわりがなければ `0` でいいような。
で取れたファイルディスクリプタに対して `accept(2)` して、通信するためのファイルディスクリプタを取れば ok。

サンプルコード

```c
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <pthread.h>
#include <sys/socket.h>
#include <unistd.h>

#include <systemd/sd-daemon.h>

static void *foo(void *pfd) {
    int fd = *(int *)pfd;

    char buf[1024];
    for (;;) {
        ssize_t n = read(fd, buf, 1024);
        if (n < 0) {
            perror("read");
        }
        write(fd, buf, (size_t)n);
    }

    close(fd);
    free(pfd);
    return NULL;
}

int main(void) {
    int n_fds = sd_listen_fds(0);
    if (n_fds < 0) {
        errno = -n_fds;
        perror("sd_listen_fds");
    } else if (n_fds == 0) {
        fputs("No file descriptor passed.\n", stderr);
        return 1;
    }

    int listen_fd = SD_LISTEN_FDS_START;

    for (;;) {
        int fd = accept(listen_fd, NULL, NULL);
        if (fd == -1) {
            perror("accept");
            continue;
        }

        int *pfd = malloc(sizeof(int));
        memcpy(pfd, &fd, sizeof(int));

        pthread_t th;
        if (pthread_create(&th, NULL, &foo, pfd) != 0) {
            close(fd);
            continue;
        }
        pthread_detach(th);
    }
}
```

(別スレッドで処理することにしてみたけど超適当なので `detach` している)

処理としてはただエコーバックするだけ。

## Unit ファイル

service の方。割と普通。

```systemd
[Unit]
Description=Sample Socket-Activatable Service
Requires=sa.socket

[Service]
Type=simple
ExecStart=/tmp/socket-activation/build/sa
ExecStop=/usr/bin/kill $MAINPID

[Install]
WantedBy=multi-user.target
```

socket の方。

```systemd
[Unit]
Description=Sample Socket

[Socket]
ListenStream=/tmp/sa.sock
SocketMode=0666

[Install]
WantedBy=sockets.target
```

`ListenStream` にアドレスとかポート番号とかを設定することで TCP 見てたりとかできる。

## 使い方

socket の方を `start` すると、とりあえずソケットだけ作られる。
でここに接続すると service のほうがにわかに立ち上がってきて、送った内容を捌いてくれるって感じ。

service の方を `start` しても結局は socket の方も立ち上がって、service 殺しても socket
が勝手に生き残っててまた service が起こされたりする。

どっちも殺してもソケット自体はファイルシステムに残るっぽいな。
まあ次起動したときもちゃんと動くんで特に文句はないけど。

### 参考

- Manual page: `systemd.socket`
- Manual page: `sd_listen_fds(3)`
- [docker.service](https://github.com/moby/moby/tree/master/contrib/init/systemd)
