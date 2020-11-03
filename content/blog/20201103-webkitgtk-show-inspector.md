---
title: "WebKitGTK+でインスペクタを表示する方法"
date: 2020-11-03T14:56:15+09:00
tags:
  - development
---

調べたら普通にドキュメントが出るけどメモ。

まず WebSettings というのを変更して `enable-developer-extras` というのを有効にしてやって、

```c
WebKitSettings *settings = webkit_web_view_get_settings (WEBKIT_WEB_VIEW(web_view));
g_object_set(G_OBJECT(settings), "enable-developer-extras", TRUE, NULL);
```

それから inspector を開くという感じ。

```c
WebKitWebInspector *inspector = webkit_web_view_get_inspector(WEBKIT_WEB_VIEW(web_view));
webkit_web_inspector_show(WEBKIT_WEB_INSPECTOR(inspector));
```

実行してやるといつも F12 で開いてる感じの画面が別窓で出てくる。

全体像

```c
#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

static void on_destroy(GtkWidget *widget, GtkWidget *window) {
    gtk_main_quit();
}

static gboolean on_close_web_view(WebKitWebView *web_view, GtkWidget *window) {
    gtk_widget_destroy(window);

    return TRUE;
}

int main(int argc, char **argv) {
    gtk_init(&argc, &argv);

    GtkWidget *main_window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_default_size(GTK_WINDOW(main_window), 800, 600);
    gtk_window_set_title(GTK_WINDOW(main_window), "Browse");

    WebKitWebView *web_view = WEBKIT_WEB_VIEW(webkit_web_view_new());
    gtk_container_add(GTK_CONTAINER(main_window), GTK_WIDGET(web_view));

    g_signal_connect(main_window, "destroy", G_CALLBACK(&on_destroy), NULL);
    g_signal_connect(web_view, "close", G_CALLBACK(&on_close_web_view), main_window);

    WebKitSettings *settings = webkit_web_view_get_settings (WEBKIT_WEB_VIEW(web_view));
    g_object_set(G_OBJECT(settings), "enable-developer-extras", TRUE, NULL);

    webkit_web_view_load_uri(web_view, "https://www.chronoscoper.com/");

    WebKitWebInspector *inspector = webkit_web_view_get_inspector(WEBKIT_WEB_VIEW(web_view));
    webkit_web_inspector_show(WEBKIT_WEB_INSPECTOR(inspector));

    gtk_widget_grab_focus(GTK_WIDGET(web_view));

    gtk_widget_show_all(main_window);

    gtk_main();
}
```

このキャプチャはインスペクタを表示して、ソースコード眺めてたら目についた `console.screenshot()` というのを
呼んでみたところ。

![インスペクタ](/images/20201103-webkitgtk-show-inspector/inspector.png)

どうでもいいけど WebKit のソースいじったりしていろいろやろうと思っている（思いつき）。
