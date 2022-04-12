let isSearchResultState = false;
let article = [] as any[];
let pagination: HTMLElement | null = null;
let currentPage = 1;

// Define `React' here, because Hugo does not allow to inject tsconfig.json.
class React {
    static createElement = (
        tag: string | undefined,
        props: any,
        ...children: HTMLElement[]
    ): HTMLElement | null => {
        if (typeof tag === 'undefined') {
            return null;
        }

        const element = document.createElement(tag);
        if (props !== null) {
            for (let [name, val] of Object.entries(props)) {
                if (name === 'className') {
                    name = 'class';
                } else if (name === 'onClick') {
                    element.addEventListener('click', val as EventListenerOrEventListenerObject);
                    continue;
                } else if (name === 'dangerouslySetInnerHTML') {
                    element.innerHTML = (val as any)['__html'];
                }
                element.setAttribute(name, val as any);
            }
        }
        if (children !== null) {
            for (const child of children) {
                if (child === null) {
                    continue;
                }

                let childNode: HTMLElement | null = null;
                if (typeof child === 'string') {
                    childNode = document.createTextNode(child);
                } else if (typeof child === 'number') {
                    childNode = document.createTextNode(child.toString());
                } else {
                    childNode = child;
                }
                element.appendChild(childNode);
            }
        }
        return element;
    };
}

type DisplayState = {
    searchMode: boolean;
    query: string;
    page: number;
    scrollPos: number;
};

const formatUnixTime = (time: number): string => {
    const date = new Date(time * 1000);
    const y = date.getFullYear().toString();
    const m = ('0' + date.getMonth() + 1).slice(-2);
    const d = ('0' + date.getDay()).slice(-2);
    return `${y}-${m}-${d}`;
};

const formatRFC3339 = (time: number): string => {
    const date = new Date(time * 1000);
    return date.toISOString();
};

const showSearchResult = (searchResult: any, query: string, page: number) => {
    isSearchResultState = true;

    const mainElement = document.getElementsByTagName('main')[0];

    mainElement.innerHTML = '';
    const pagination = document.querySelector('div.pagination');
    if (pagination !== null) {
        pagination.remove();
    }

    const header = (
        <header className="post__header">
            <h1>"{query}" の検索結果</h1>
            <div className="list__meta meta">
                {searchResult['count']}件の結果 （{searchResult['took'] / 1000} 秒）
            </div>
        </header>
    );
    mainElement.appendChild(header);

    if (searchResult.hits.length === 0) {
        const emptyState = (
            <div className="warning">
                <h1 className="warning__headline">検索結果がありません</h1>
                <p className="warning__text">違うキーワードで検索してみてください。</p>
            </div>
        );
        mainElement.appendChild(emptyState);
        return;
    }

    for (const hit of searchResult.hits) {
        const article = (
            <article className="list__item post">
                <header className="list__header">
                    <h2 className="list__title post__title">
                        <a
                            href={hit['permalink']}
                            rel="bookmark"
                            dangerouslySetInnerHTML={{ __html: hit['title'] }}
                        ></a>
                    </h2>
                    <div className="list__meta meta">
                        <div className="meta__item-datetime meta__item">
                            <svg
                                className="meta__icon icon icon-time"
                                width="16"
                                height="14"
                                viewBox="0 0 30 28"
                            >
                                <path d="M15 0C7 0 1 6 1 14s6 14 14 14 14-6 14-14S23 0 15 0zm0 25C9 25 4 20 4 14S9 3 15 3s11 5 11 11-5 11-11 11zm1-18h-2v8.4l6.8 4.4L22 18l-6-3.8V7z"></path>
                            </svg>
                            <time className="meta__text" dateTime={formatRFC3339(hit['date'])}>
                                {formatUnixTime(hit['date'])}
                            </time>
                            {hit['date'] === hit['lastmod'] ? (
                                <></>
                            ) : (
                                <time className="meta__text" dateTime={formatRFC3339(hit['date'])}>
                                    (最終更新: {formatUnixTime(hit['date'])})
                                </time>
                            )}
                        </div>
                    </div>
                </header>
                <div
                    className="content list__excerpt post__content clearfix"
                    dangerouslySetInnerHTML={{ __html: hit['summary'] }}
                ></div>
                {hit['truncated'] ? (
                    <div className="list__footer clearfix">
                        <a className="list__footer-readmore btn" href={hit['permalink']}>
                            続きを読む…
                        </a>
                    </div>
                ) : (
                    <></>
                )}
            </article>
        );
        mainElement.appendChild(article);
    }

    if (searchResult['count'] > 10) {
        const totalPage = Math.ceil(searchResult['count'] / 10);

        const pagination = (
            <div className="pagination">
                {page == 1 ? (
                    <></>
                ) : (
                    <a
                        className="pagination__item pagination__item-prev btn"
                        onClick={(ev) => {
                            ev.preventDefault();
                            doSearch(query, page - 1, true);
                            scroll(0, 0);
                        }}
                    >
                        «
                    </a>
                )}
                <span className="pagination__item pagination__item--current">
                    {page}/{totalPage}
                </span>
                {page == totalPage ? (
                    <></>
                ) : (
                    <a
                        className="pagination__item pagination__item-prev btn"
                        onClick={(ev) => {
                            ev.preventDefault();
                            doSearch(query, page + 1, true);
                            scroll(0, 0);
                        }}
                    >
                        »
                    </a>
                )}
            </div>
        );

        document.querySelector('div.primary').insertBefore(pagination, mainElement.nextSibling);
    }
};

const hideSearchResult = (pushState: boolean) => {
    if (!isSearchResultState) {
        return;
    }
    isSearchResultState = false;

    const mainElement = document.getElementsByTagName('main')[0];
    mainElement.innerHTML = '';
    if (article !== null) {
        for (const a of article) {
            mainElement.appendChild(a);
        }
    }

    if (pagination !== null) {
        document.querySelector('div.primary').insertBefore(pagination, mainElement.nextSibling);
    }

    if (pushState) {
        const url = new URL(location.href);
        history.pushState(
            {
                searchMode: false,
                query: '',
                page: 0,
                scrollPos: 0,
            },
            '',
            url.pathname,
        );
    }
};

const revertStateFromUrl = () => {
    const urlParams = new URL(location.href).searchParams;
    if (urlParams.has('search_mode') && urlParams.get('search_mode') === 'true') {
        const query = urlParams.get('q') ? urlParams.get('q') : '';
        let page = Number(urlParams.get('page'));
        if (Number.isNaN(page) || page <= 0) {
            page = 1;
        }
        history.replaceState(
            {
                searchMode: true,
                query: query,
                page: page,
            },
            '',
        );

        doSearch(query, page, false);
    }
};

const doSearch = (query: string, page: number, pushState: boolean) => {
    currentPage = page;

    const url = new URL(location.href);
    url.pathname = '/search';
    const searchParam = new URLSearchParams();
    searchParam.append('q', query);
    searchParam.append('page', page.toString());
    url.search = searchParam.toString();
    url.search = searchParam.toString();

    fetch(url.toString())
        .then((resp) => resp.json())
        .then((resp) => {
            showSearchResult(resp, query, page);
        });

    if (pushState) {
        const urlParams = new URL(location.href).searchParams;
        urlParams.set('search_mode', 'true');
        urlParams.set('q', query);
        urlParams.set('page', page.toString());
        history.pushState(
            {
                searchMode: true,
                query,
                page,
                scrollY,
            },
            '',
            '?' + urlParams.toString(),
        );
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.getElementsByTagName('main')[0];
    article = [];
    for (let i = 0; i < mainElement.children.length; i++) {
        article.push(mainElement.children[i]);
    }
    pagination = document.querySelector('div.pagination');

    revertStateFromUrl();

    document.getElementById('searchForm').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const searchQuery = (document.getElementById('searchField') as HTMLInputElement).value;
        if (searchQuery.length === 0) {
            hideSearchResult(true);
            return;
        }

        doSearch(searchQuery, 1, true);
        scroll(0, 0);
    });
});

addEventListener('popstate', (ev) => {
    const state: DisplayState | null = ev.state;
    if (state === null || !state.searchMode) {
        hideSearchResult(false);
        return;
    }

    doSearch(state.query, state.page, false);
    (document.getElementById('searchField') as HTMLInputElement).value = state.query;
    scroll(0, state.scrollPos);
});
