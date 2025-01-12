---
title: "Mastodon の OpenTelemetry 対応 & Grafana Alloy を試した"
date: 2025-01-12T20:05:30+09:00
tags:
  - tech
  - Mastodon
  - OpenTelemetry
---

Mastodon が OpenTelemetry に対応したというので、Kubernetes にデプロイしている Mastodon で試してみました。
構成としては、Mastodon から Grafana Alloy にテレメトリを送って、そこでゴニョゴニョした結果を Grafana Cloud に送る、という感じになっています。

ついでに Grafana Alloy で Kubernetes の Pod のログとかも Grafana Cloud に送るようにしました。
もともとログを見ていないので大した感想は出てこないんですが、何か起こったときに調査しやすくなったはずなので、今後に期待です。
何も起こってほしくないけど。

## Grafana Alloy を Kubernetes にデプロイする

Grafana Alloy というのは、OpenTelemetry Collector を自称しているんですが Prometheus でメトリクスを収集できたり、
Loki でログを収集できたり、便利機能がいろいろついていて何者なのか謎になっている謎のソフトウェアです。
謎ではあるんですが、これひとつデプロイすれば全てをやってくれるので楽ではありますね。

Grafana Alloy は Helm でデプロイできるのでデプロイ自体はかなり楽です。
Kustomize でやるならこんな感じです。

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: alloy
helmCharts:
  - name: alloy
    releaseName: grafana-alloy
    namespace: alloy
    repo: https://grafana.github.io/helm-charts
    version: 0.10.1
    valuesInline:
      alloy:
        extraPorts:
          - name: otlp-grpc
            port: 4317
            targetPort: 4317
          - name: otlp-http
            port: 4318
            targetPort: 4318
        configMap:
          content: |
            otelcol.receiver.otlp "default" {
                grpc { }
                http { }

                output {
                    // ...
                }
            }

            // 残りの設定も頑張って書く
```

Grafana Alloy の設定例は [Collect and forward data with Grafana Alloy | Grafana Alloy documentation](https://grafana.com/docs/alloy/latest/collect/) に大量にあります。
OpenTelemetry に関しては、Grafana Cloud の Connections（`https://<なにか>.grafana.net/connections/add-new-connection/open-telemetry`）からパクってくるとひとまず動くものができるので、とりあえずやってみたい人にはおすすめです。
ちなみに上のコード例だけでは exporter がいないのでいつまで待ってもデータが送信されません。気をつけてください。

OpenTelemetry Collector として動かす場合に最低限必要なのは、`otelcol.receiver` で HTTP を有効にすること、
それぞれに対応するポートを service に出してあげることです。（Mastodon は HTTP しか対応していないっぽいので、gRPC ではなく HTTP の方を有効化する必要があります。）
そのために configMap と extraPorts を適当に設定します。前者は Grafana Alloy 自体の設定、後者は service に設定して他の Pod から疎通できるようにするために必要です。

## Mastodon のトレースを Grafana Cloud に送る

Grafana Alloy 経由で送ります。

Mastodon には数ヶ月前にリリースされた 4.3.0 から OpenTelemetry サポートが入っており、適切に環境変数を設定することでトレースを送信することができます。
ConfigMap に書く場合はこんな感じです。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mastodon-env
data:
  # ...
  OTEL_EXPORTER_OTLP_ENDPOINT: http://grafana-alloy.alloy.svc.cluster.local:4318
  OTEL_EXPORTER_OTLP_PROTOCOL: http/protobuf
  OTEL_SERVICE_NAME_PREFIX: mastodon-prod
```

これは宣伝ですが、Mastodon は艮鮟鱇という知り合いが作った [Magout](https://github.com/ushitora-anqou/magout) という Kubernetes operator でデプロイしています。
マイグレーションをいい感じにやってくれたり、毎日 pod を再起動するみたいな超適当エンジニアリングをやってくれたりして、とても便利です。

Grafana Alloy は gRPC もサポートしているのですが、どうやら Ruby の OpenTelemetry Instrumentation は gRPC に対応していないらしく、
`http/protobuf` で送信する必要があります。（たぶん [opentelemetry-ruby のソースコードのこのへん](https://github.com/open-telemetry/opentelemetry-ruby/blob/baeda39731d70f3f18ac8693168039fb8a1d2c8c/sdk/lib/opentelemetry/sdk/configurator.rb#L193C47-L194C1)に入る。）  
ローカルで Jaeger を使って試していたときは踏まなかったのでけっこうハマりました。

これで Mastodon から Grafana Alloy にトレースを送信することができます。
今のところアクセスログに trace ID が出ていないので不便すぎるんですが、すでに upstream には入っている雰囲気なので今後に期待です。

というわけですべてがいい感じになりました。（諸説あり）  
気になるところとしては Grafana Cloud の無料枠でどこまでいけるかというところですね。

おしまいです。
