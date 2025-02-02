---
title: "lighttpd でプロキシのバッファリングを無効にする"
date: 2025-02-02T14:08:06+09:00
tags:
  - tech
---

複数のアプリケーションサーバを前段のリバースプロキシで束ねる場合、後ろにいるアプリケーションがリアルタイムでデータを送信するような場合に問題になることがあります。
例えば Server-Sent Events (SSE) でデータを送信する場合、リバースプロキシがデータをバッファリングしてしまうと、クライアントがリアルタイムでイベントを受信できなくなります。
試していませんが、gRPC の streaming でも同様の問題が発生する気がします。

Nginx を使う場合、`proxy_buffering off;` という設定を入れるか、ヘッダに `X-Accel-Buffering: no` を追加することでバッファリングを無効にできます。
一方で、lighttpd で同様の設定を行う方法が分かりにくかったので、メモしておきます。

lighttpd でプロキシのバッファリングを無効にするには、`server.stream-request-body`, `proxy.stream-response-body` を設定します。
以下のような設定でリバースプロキシのバッファリングを無効にできます。

```lighttpd
$HTTP["url"] =~ "^/api" {
    proxy.server = ( "" => ( ( "host" => "localhost", "port" => 8000 ) ) )

    server.stream-request-body = 2
    server.stream-response-body = 2
}
```

`server.stream-response-body` がレスポンスボディのストリーミングを有効にするための設定です。
デフォルトは `0` で、データを全て受け取ってからクライアントに返します。
`1` はバッファリングもしつつストリーミングでクライアントに返します。
クライアントが遅い場合にはバッファリングされるので、バックエンドはクライアントに律速されずにデータを送ってリクエストを完了できるのが利点らしいです。
`2` に設定することでバッファリングを無効にできます。
リアルタイムで少量ずつイベントを送り続けるようなユースケースではクライアントに律速されるデメリットは少ないので、こちらに設定しています。

同様の設定はリクエスト側にも設定でき、サンプルコードでも `server.stream-request-body` でリクエストボディのストリーミングを有効にしています。
とはいえ、SSE しか使わない場合はレスポンス側だけ設定すれば十分ではあります。

#### 参考

- [Server stream-request-bodyDetails - Lighttpd - lighty labs](https://redmine.lighttpd.net/projects/lighttpd/wiki/Server_stream-request-bodyDetails)
- [Server stream-response-bodyDetails - Lighttpd - lighty labs](https://redmine.lighttpd.net/projects/lighttpd/wiki/Server_stream-response-bodyDetails)
