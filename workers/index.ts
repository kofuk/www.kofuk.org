import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

const DEBUG: boolean = false;

declare global {
    const ELASTICSEARCH_URL: string;
}

const handleSearch = async (event: FetchEvent): Promise<Response> => {
    return new Response('Hello');
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
