---
title: "aws-sdk-go-v2でGCSを叩いた際のSignatureDoesNotMatchに対処する"
date: 2024-01-05T12:57:03+09:00
tags:
  - tech
  - AWS
  - GCP
---

[Google Cloud Storage](https://cloud.google.com/storage?hl=ja) は実は S3 互換の API が生えていて、既存の S3 を使うコードのオブジェクトの保存先を簡単に GCS に向けることができるようになっています。
理想的にはエンドポイントやトークンを差し替えれば移行できるのですが、他の S3 互換を謳うオブジェクトストレージと同じように単純にいかないことも多々あります。
最も一般的なエラーは S3 でサポートされているエンドポイントを互換オブジェクトストレージがサポートしていないという問題だと思いますが、
今回細かい部分の仕様の差異で AWS SDK で GCS のエンドポイントが叩けないという問題があったので、そのときにとった方法をメモしておきます。

雑な対処なので全く良い方法ではないですが。

## 起こったことと原因

aws-sdk-go-v2 で GCS に HMAC キーを使用してアクセスすると、正しいキーを指定しているにもかかわらず `SignatureNoesNotMatch` エラーが出ます。

S3 の API は `Authorization` ヘッダーに、他のヘッダーの値を使用して計算した signature を含めることになっています（[AWS Signature v4](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html)）。

GCS の場合も S3 互換の API を叩いた場合はこれを検証していますが、（おそらく Google のロードバランサー的な何かで）`Accept-Encoding` ヘッダーが書き換えられるため、クライアントが計算した signature とサーバが計算した signature が一致せず、
エラーになってしまいます。

リクエスト

```plaintext
GET /XXXXXXXX?list-type=2 HTTP/1.1
Host: storage.googleapis.com
User-Agent: aws-sdk-go-v2/1.24.0 os/linux lang/go#1.21.5 md/GOOS#linux md/GOARCH#amd64 api/s3#1.47.7
Accept-Encoding: identity
Amz-Sdk-Invocation-Id: XXXXXXXX
Amz-Sdk-Request: attempt=1; max=3
Authorization: AWS4-HMAC-SHA256 Credential=XXXXXXXX/20240104//s3/aws4_request, SignedHeaders=accept-encoding;amz-sdk-invocation-id;host;x-amz-content-sha256;x-amz-date, Signature=XXXXXXXX
X-Amz-Content-Sha256: XXXXXXXX
X-Amz-Date: 20240104T105425Z
```

レスポンス

```plaintext
HTTP/2.0 403 Forbidden
Content-Length: 877
Alt-Svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
Cache-Control: private, max-age=0
Content-Type: application/xml; charset=UTF-8
Date: Thu, 04 Jan 2024 10:54:25 GMT
Expires: Thu, 04 Jan 2024 10:54:25 GMT
Server: UploadServer
X-Guploader-Uploadid: XXXXXXXX

<?xml version='1.0' encoding='UTF-8'?><Error><Code>SignatureDoesNotMatch</Code><Message>Access denied.</Message><Details>The request signature we calculated does not match the signature you provided. Check your Google secret key and signing method.</Details><StringToSign>AWS4-HMAC-SHA256
20240104T105425Z
20240104//s3/aws4_request
XXXXXXXX</StringToSign><CanonicalRequest>GET
/XXXXXXXX
list-type=2
accept-encoding:identity,gzip(gfe)
amz-sdk-invocation-id:XXXXXXXX
host:storage.googleapis.com
x-amz-content-sha256:XXXXXXXX
x-amz-date:20240104T105425Z

accept-encoding;amz-sdk-invocation-id;host;x-amz-content-sha256;x-amz-date
XXXXXXXX</CanonicalRequest></Error>
```

## 解決方法

`Accept-Encoding` を signature の計算に含めないようにしました。
そもそも対象のヘッダーは `host`, `Content-Type`, `x-amz-` で始まるものということになっていて、`Accept-Encoding` を含める必要はないはずです。

ただ、この方法は一筋縄では行かず、aws-sdk-go-v2 でデフォルトの HTTPSigner をラップする、カスタムの signer を実装することで対処しています。

```go
import (
	"context"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4Signer "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type noAcceptEncodingSigner struct {
	signer s3.HTTPSignerV4
}

func newNoAcceptEncodingSigner(signer s3.HTTPSignerV4) *noAcceptEncodingSigner {
	return &noAcceptEncodingSigner{
		signer: signer,
	}
}

func (self *noAcceptEncodingSigner) SignHTTP(ctx context.Context, credentials aws.Credentials, r *http.Request, payloadHash string, service string, region string, signingTime time.Time, optFns ...func(*v4Signer.SignerOptions)) error {
	// 署名前に Accept-Encoding を取り除き、署名後に復元する
	acceptEncoding := r.Header.Get("Accept-Encoding")
	r.Header.Del("Accept-Encoding")
	err := self.signer.SignHTTP(ctx, credentials, r, payloadHash, service, region, signingTime, optFns...)
	if acceptEncoding != "" {
		r.Header.Set("Accept-Encoding", acceptEncoding)
	}
	return err
}
```

これを使って S3 の client を作成します。

```go
	s3Client := s3.NewFromConfig(config, func(options *s3.Options) {
		options.UsePathStyle = true
		defSigner := v4Signer.NewSigner(func(so *v4Signer.SignerOptions) {
			so.Logger = options.Logger
			so.LogSigning = options.ClientLogMode.IsSigning()
			so.DisableURIPathEscaping = true
		})
		options.HTTPSignerV4 = newNoAcceptEncodingSigner(defSigner)
	})
```

#### 参考

- AWS SDK にも Issue が上がっているが、サードパーティのプラットフォームなので対応できないと言われている（それはそう） https://github.com/aws/aws-sdk-go-v2/issues/1816
- rclone もこの問題を踏んでいて、GCS の場合には毎回 `Accept-Encoding: gzip` を送っているっぽい。 https://github.com/rclone/rclone/issues/6670
- 一応 Google Cloud Community に書いたので、何か更新があればこの記事を更新します。 https://www.googlecloudcommunity.com/gc/Infrastructure-Compute-Storage/Server-side-modification-of-header-seems-to-cause/td-p/694164
- Stack Overflow でも質問している人がいる。 https://stackoverflow.com/questions/73717477/gcp-cloud-storage-golang-aws-sdk2-upload-file-with-s3-interoperability-creds
