module Elasticsearch {
    export interface HitSources {
        title: string;
        summary: string;
        permalink: string;
        date: number;
        lastmod: number;
        truncated: boolean;
    }

    export interface SearchHits {
        _source: HitSources;
    }

    export interface SearchTotalHits {
        value: number;
    }

    export interface SearchMetadata {
        total: SearchTotalHits;
        hits: SearchHits[];
    }

    export interface SearchResult {
        took: number;
        timed_out: boolean;
        hits: SearchMetadata;
    }
}

function parseQuery(rawQuery: string): string {
    return rawQuery;
}

const search = async (elasticsearchUrl: string, rawQuery: string, page: number) => {
    const esUrl = new URL(elasticsearchUrl);
    esUrl.pathname = '/hugo/_search';

    const basicAuthHeaderVal = 'Basic ' + btoa(esUrl.username + ':' + esUrl.password);

    esUrl.username = '';
    esUrl.password = '';
    const result = (await fetch(esUrl.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: basicAuthHeaderVal,
        },
        body: JSON.stringify({
            query: {
                simple_query_string: {
                    query: parseQuery(rawQuery),
                    fields: ['title', 'content', 'tags'],
                    default_operator: 'AND',
                },
            },
            from: page * 10,
            size: 10,
            _source: ['title', 'summary', 'permalink', 'date', 'lastmod', 'truncated'],
        }),
    }).then((resp) => resp.json())) as Elasticsearch.SearchResult;

    const hits = result.hits.hits.map((hit) => {
        return {
            title: hit._source.title,
            summary: hit._source.summary,
            permalink: hit._source.permalink,
            date: hit._source.date,
            lastmod: hit._source.lastmod,
            truncated: hit._source.truncated,
        };
    });
    return {
        took: result.took,
        count: result.hits.total.value,
        hits: hits,
    };
};

interface Env {
    ELASTICSEARCH_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const request = context.request;
    const env = context.env;

    const url = new URL(request.url);
    const params = url.searchParams;
    if (!params.has('q')) {
        return new Response(JSON.stringify('"q" not specified'), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    let query = params.get('q')!;
    let page = Number(params.get('page'));
    if (Number.isNaN(page) || page <= 0) {
        page = 1;
    }
    // to zero-indexed
    page--;

    const searchResult = await search(env.ELASTICSEARCH_URL, query, page);

    return new Response(JSON.stringify(searchResult), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
