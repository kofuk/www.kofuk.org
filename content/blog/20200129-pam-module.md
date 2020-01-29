---
title: "PAM で遊んでみた"
date: 2020-01-29T21:59:17+09:00
---

PAM で遊んでみた。PAM ってのは Pluggable Authentication Manager の略らしく，
Linux のユーザー認証のしくみで，これの設定次第でユーザーが自由に認証の方法を変更できる。
例えばパスワード認証の代わりに指紋認証を使いたいみたいな場合もこの PAM のモジュールで実現できるはず。
当たり前だが，設定次第で認証システムを破綻（？）させることも可能で，常にログインできる PAM
モジュールを使ってパスワードなしでログイン可能にしてしまったり，逆に絶対にログインできない PAM
モジュールで全ユーザーを締め出したりもできてしまう。てなわけでまあ割とヤバイ部分で遊んだ。

PAM のモジュールを書くのはとても簡単な部類で，常にログインできるやつとかだと下みたいなコードで
できたりする。

```c
#define PAM_SM_AUTH

#include <security/pam_modules.h>

int pam_sm_authenticate(pam_handle_t *pamh,
                        int flags, int argc, const char **argv) {
    return PAM_SUCCESS;
}
```

で，導入するのも簡単で，上のコードを Shared Object としてコンパイルして，/lib/security に
置き，/etc/pam.d/system-auth を編集すればいい。

```
#%PAM-1.0

auth    sufficient your_module.so
auth    required   pam_unix.so     try_first_pass nullok
.
.
.
```

上みたいに編集すると，your_module.so で認証が通らなかったら，通常の認証が試みられるということになる。
ウィンドウマネージャとかから一回ロックしてロック解除してみれば設定が反映されているのが分かると
思う。

脱線するけど Linux カーネルのモジュールとかも割と書くのは簡単な部類らしいけど，書いた後
導入するのが面倒くさいからなぁ，と。

で，なんで PAM のモジュールを書いてみようかと思ったかというと，[pam_usb](https://github.com/aluzzardi/pam_usb)
を試してみようと思ったら `UNMAINTAINED` と書いてあって，試しにコード呼んでみたら割と単純だったからだ。

まあ認証通す通さないのところは簡単だけど，通していいかだめか判断するところをセキュアに書けるかってところが
腕の見せ所なんだろうなと思った。
