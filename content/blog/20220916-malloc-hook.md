---
title: "mallocをフックしてメモリ使用量を測る"
date: 2022-09-16T13:24:59+09:00
tags:
  - tech
  - C
---

いろいろと怪しいけどこれでフックすれば取れるはず。
まあ malloc をフックしている時点で怪しいので細かいことを気にしてはいけない (？)

```c
#define _GNU_SOURCE
#include <dlfcn.h>
#include <string.h>
#include <stdio.h>

static size_t max_usage;
static size_t cur_usage;

static void *(*orig_malloc)(size_t);
static void (*orig_free)(void *);
static void *(*orig_realloc)(void *, size_t);

__attribute__((constructor)) void initialize(void) {
    orig_malloc = dlsym(RTLD_NEXT, "malloc");
    orig_free = dlsym(RTLD_NEXT, "free");
    orig_realloc = dlsym(RTLD_NEXT, "realloc");
}

extern char *__progname;

__attribute__((destructor)) void print_stat(void) {
    size_t result = max_usage;
    fprintf(stderr, "%s: max memory usage: %zu\n", __progname, result);
}

void *malloc(size_t size) {
    void *ptr = orig_malloc(size + sizeof(size_t));
    if (ptr == NULL) {
        return NULL;
    }
    memcpy(ptr, &size, sizeof(size_t));
    cur_usage += size;
    if (cur_usage > max_usage) {
        max_usage = cur_usage;
    }
    return (void *)((unsigned char *)ptr + sizeof(size_t));
}

void *calloc(size_t nmemb, size_t size) {
    void *ptr = malloc(nmemb * size);
    if (ptr != NULL) {
        memset(ptr, 0, size * nmemb);
    }
    return ptr;
}

void free(void *ptr) {
    if (ptr == NULL) {
        return;
    }
    void *head = (void *)((unsigned char *)ptr - sizeof(size_t));
    size_t size;
    memcpy(&size, head, sizeof(size_t));
    cur_usage -= size;
    orig_free(head);
}

void *realloc(void *ptr, size_t size) {
    size_t old_size = 0;
    void *result;
    if (ptr != NULL) {
        void *head = (void *)((unsigned char *)ptr - sizeof(size_t));
        memcpy(&old_size, head, sizeof(size_t));
        result = orig_realloc(head, size + sizeof(size_t));
    } else {
        result = orig_realloc(ptr, size + sizeof(size_t));
    }
    if (result != NULL) {
        cur_usage -= old_size;
        cur_usage += size;
        if (cur_usage > max_usage) {
            max_usage = cur_usage;
        }
        memcpy(result, &size, sizeof(size));
        return (void *)((unsigned char *)result + sizeof(size_t));
    }
    return NULL;
}

void *reallocarray(void *ptr, size_t nmemb, size_t size) {
    return realloc(ptr, nmemb * size);
}
```

```bash
$ gcc -shared -fPIC -ldl -o libmh.so mh.c
```

でコンパイル、


```bash
$ LD_PRELOAD=/path/to/libmh.so hogehoge
```

みたいに使う。
