import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import * as es from './estypes';

const DEBUG: boolean = false;

declare global {
    const ELASTICSEARCH_URL: string;
}

interface SearchHit {
    title: string;
    summary: string;
    date: number;
    lastmod: number;
    truncated: boolean;
}

interface SearchResult {
    took: number;
    count: number;
    hits: SearchHit[];
}

const handleSearch = async (event: FetchEvent): Promise<Response> => {
    const url = new URL(event.request.url);
    const params = url.searchParams;
    if (!params.has('q')) {
        return new Response(JSON.stringify('"q" not specified'), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    let page = Number(params.get('page'));
    if (Number.isNaN(page) || page <= 0) {
        page = 1;
    }
    // to zero-indexed
    page--;

    const esUrl = new URL(ELASTICSEARCH_URL);
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
                    query: params.get('q'),
                    fields: ['title', 'content', 'tags'],
                    default_operator: 'AND',
                },
            },
            from: page * 10,
            size: 10,
            _source: ['title', 'summary', 'permalink', 'date', 'lastmod', 'truncated'],
        }),
    }).then((resp) => resp.json())) as es.SearchResult;

    const hits: SearchHit[] = result.hits.hits.map((hit) => {
        return {
            title: hit._source.title,
            summary: hit._source.summary,
            date: hit._source.date,
            lastmod: hit._source.lastmod,
            truncated: hit._source.truncated,
        };
    });
    const searchResult: SearchResult = {
        took: result.took,
        count: result.hits.total.value,
        hits: hits,
    };

    return new Response(JSON.stringify(searchResult), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

const handleNormalPage = async (event: FetchEvent): Promise<Response> => {
    try {
        const options: any = {};

        if (DEBUG) {
            // customize caching
            options.cacheControl = {
                bypassCache: true,
            };
        }
        const page = await getAssetFromKV(event, options);

        // allow headers to be altered
        const response = new Response(page.body, page);

        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Referrer-Policy', 'unsafe-url');
        response.headers.set('Feature-Policy', 'none');

        return response;
    } catch (e: any) {
        // if an error is thrown try to serve the asset at 404.html
        if (!DEBUG) {
            try {
                let notFoundResponse = await getAssetFromKV(event, {
                    mapRequestToAsset: (req) =>
                        new Request(`${new URL(req.url).origin}/404.html`, req),
                });

                return new Response(notFoundResponse.body, {
                    ...notFoundResponse,
                    status: 404,
                });
            } catch (e: any) {}
        }

        return new Response(e.message || e.toString(), { status: 500 });
    }
};

const handleEvent = (event: FetchEvent): Promise<Response> => {
    const url = new URL(event.request.url);
    if (url.pathname === '/search' && event.request.method === 'GET') {
        return handleSearch(event);
    } else {
        return handleNormalPage(event);
    }
};

addEventListener('fetch', (event: FetchEvent) => {
    try {
        event.respondWith(handleEvent(event));
    } catch (e: any) {
        if (DEBUG) {
            return event.respondWith(
                new Response(e.message || e.toString(), {
                    status: 500,
                }),
            );
        }
        event.respondWith(new Response('Internal Error', { status: 500 }));
    }
});
