---
title: "Linuxのreadとrecvは何が違うのか"
date: 2023-01-25T16:39:01+09:00
tags:
  - development
  - Linux
---

`man 2 recv` \[Enter]ﾀｰﾝ

> The only difference between recv() and read(2) is the presence of flags.  With a zero flags argument, recv() is generally
> equivalent to read(2) (but see NOTES).
>
> （適当な訳）  
> recv() と read(2) の違いは flags の有無のみです。flags が 0 のとき、recv() はほとんどの場合 read(2) と等価になります。

おわり

というのもアレなので Linux kernel のソースを読んでどうなっているのか見てみることにしました。
僕は Linux ニワカなので見当違いなことを言っている可能性もあるのでまあそういうつもりで読んでいただけると……。
Linux のソースコードはたまたま手元にあったやつなので超適当ですが、よく見たら 2020 年のやつでした（思ったより古かった）

Linux のシステムコールは `SYSCALL_DEFINEn` みたいなマクロで定義するので、適当に grep します。
すると

- `read` は `fs/read_write.c`
- `recv` は `net/compat.c`

にあることが分かりました。

たぶんここでカーネルに詳しい人だったら `net/` とか `fs/` とかに直接行けるんでしょうが、僕はニワカなので最初 `kernel/` を探していました。

まず `read` システムコールを見てみます。

これの処理内容は `ksys_read` という関数に丸投げされています。システムコールの関数ってこういうのが多い気がする。

```c
ssize_t ksys_read(unsigned int fd, char __user *buf, size_t count)
{
	struct fd f = fdget_pos(fd);
	ssize_t ret = -EBADF;

	if (f.file) {
		loff_t pos, *ppos = file_ppos(f.file);
		if (ppos) {
			pos = *ppos;
			ppos = &pos;
		}
		ret = vfs_read(f.file, buf, count, ppos);
		if (ret >= 0 && ppos)
			f.file->f_pos = pos;
		fdput_pos(f);
	}
	return ret;
}
```

`fdget_pos` というのはユーザ空間で見える `int` 型の file descriptor からカーネル側の `fd` 構造体に変換してくれる関数みたいです。
`fd` 構造体っていうとなんかすごそう（小並感）ですが、本当にすごいのはこの中に入っている `file` 構造体で、`fd` 構造体は `file` 構造体と
フラグをまとめて持っておくためのラッパーみたいな感じみたいでした。

`file_ppos` というのはファイルの読んでいる位置（`lseek` とかでいじるアレ）を返してくれる関数みたいです。
といっても `read` できる全ての file descriptor が位置を持っているというわけではなくて、ストリーム（TCP とか）を読んでいるときは
`NULL` を返すらしい。フラグを見て切り替えているみたいでしたが、そのフラグがどこ由来なのかは見ていないです。

で、実際の read っぽいことをやっているのは `vfs_read` のような雰囲気。

```c
ssize_t vfs_read(struct file *file, char __user *buf, size_t count, loff_t *pos)
{
	ssize_t ret;

	if (!(file->f_mode & FMODE_READ))
		return -EBADF;
	if (!(file->f_mode & FMODE_CAN_READ))
		return -EINVAL;
	if (unlikely(!access_ok(buf, count)))
		return -EFAULT;

	ret = rw_verify_area(READ, file, pos, count);
	if (ret)
		return ret;
	if (count > MAX_RW_COUNT)
		count =  MAX_RW_COUNT;

	if (file->f_op->read)
		ret = file->f_op->read(file, buf, count, pos);
	else if (file->f_op->read_iter)
		ret = new_sync_read(file, buf, count, pos);
	else
		ret = -EINVAL;
	if (ret > 0) {
		fsnotify_access(file);
		add_rchar(current, ret);
	}
	inc_syscr(current);
	return ret;
}
```

最初でいろいろ弾いてるのはまあいいとして、重要っぽいのは真ん中より下くらいでしょうか。
これはデバイスファイル作る系のカーネルモジュールでおなじみの（とか知ったかぶって言っていますが、ニワカです）
`file_operations` 構造体の関数ポインタを呼び出しているみたいですね。

てことで socket の `file_operations` っぽいものを探していきます。面倒臭いので勘っでファイルを開いてみると、
`net/socket.c` に `socket_file_ops` という変数が定義されています。これっぽい。

```c
static const struct file_operations socket_file_ops = {
	.owner =	THIS_MODULE,
	.llseek =	no_llseek,
	.read_iter =	sock_read_iter,
	.write_iter =	sock_write_iter,
	.poll =		sock_poll,
	.unlocked_ioctl = sock_ioctl,
#ifdef CONFIG_COMPAT
	.compat_ioctl = compat_sock_ioctl,
#endif
	.mmap =		sock_mmap,
	.release =	sock_close,
	.fasync =	sock_fasync,
	.sendpage =	sock_sendpage,
	.splice_write = generic_splice_sendpage,
	.splice_read =	sock_splice_read,
	.show_fdinfo =	sock_show_fdinfo,
};
```

`vfs_read` の中身と見比べると、`read` はなくて `read_iter` があるので `read_iter` が使われるということでしょう。

```c
static ssize_t sock_read_iter(struct kiocb *iocb, struct iov_iter *to)
{
	struct file *file = iocb->ki_filp;
	struct socket *sock = file->private_data;
	struct msghdr msg = {.msg_iter = *to,
			     .msg_iocb = iocb};
	ssize_t res;

	if (file->f_flags & O_NONBLOCK || (iocb->ki_flags & IOCB_NOWAIT))
		msg.msg_flags = MSG_DONTWAIT;

	if (iocb->ki_pos != 0)
		return -ESPIPE;

	if (!iov_iter_count(to))	/* Match SYS5 behaviour */
		return 0;

	res = sock_recvmsg(sock, &msg, msg.msg_flags);
	*to = msg.msg_iter;
	return res;
}
```

てことで、よしなにフラグを設定して `sock_recvmsg` を呼んでいるのでしためでたしめでたし。

で、次は `recv` を見ていきます。いろいろたらい回しにされたあげく、`socket.c` の `__sys_recvfrom`
にたどり着きます。

```c
/*
 *	Receive a frame from the socket and optionally record the address of the
 *	sender. We verify the buffers are writable and if needed move the
 *	sender address from kernel to user space.
 */
int __sys_recvfrom(int fd, void __user *ubuf, size_t size, unsigned int flags,
		   struct sockaddr __user *addr, int __user *addr_len)
{
	struct socket *sock;
	struct iovec iov;
	struct msghdr msg;
	struct sockaddr_storage address;
	int err, err2;
	int fput_needed;

	err = import_single_range(READ, ubuf, size, &iov, &msg.msg_iter);
	if (unlikely(err))
		return err;
	sock = sockfd_lookup_light(fd, &err, &fput_needed);
	if (!sock)
		goto out;

	msg.msg_control = NULL;
	msg.msg_controllen = 0;
	/* Save some cycles and don't copy the address if not needed */
	msg.msg_name = addr ? (struct sockaddr *)&address : NULL;
	/* We assume all kernel code knows the size of sockaddr_storage */
	msg.msg_namelen = 0;
	msg.msg_iocb = NULL;
	msg.msg_flags = 0;
	if (sock->file->f_flags & O_NONBLOCK)
		flags |= MSG_DONTWAIT;
	err = sock_recvmsg(sock, &msg, flags);

	if (err >= 0 && addr != NULL) {
		err2 = move_addr_to_user(&address,
					 msg.msg_namelen, addr, addr_len);
		if (err2 < 0)
			err = err2;
	}

	fput_light(sock->file, fput_needed);
out:
	return err;
}
```

`import_single_range` は `iov` の初期化をいろいろやっているっぽかったですが、詳細不明。

`sockfd_lookup_light` では `int` の file descriptor からさっきの `fd` 構造体を取ってきて、
中に入っている `file` 構造体 の `private_data` に入っている `socket` 構造体のデータを取ってくるという感じのことをやっています。

あとは `msghdr` にいろいろ詰めたりしているけど `NULL` とか `0` とかなのであんまり関係なさそう。

で、`sock_recvmsg` を呼び出しています、指定された `flags` で。

おしまいですね。

ちなみに、長さが 0 のデータグラムが pending の状態のとき、`read` は何もしないけど `recv` はそいつを consume するという違いがあるらしいのですが、詳細不明。
いつかそのへんも探りたいです。
