'use strict';

let isSearchResultState = false;
let article = [];
let pagination = null;
let currentPage = 1;

const formatUnixTime = (time) => {
    const date = new Date(time * 1000);
    const y = date.getFullYear().toString();
    const m = ('0' + date.getMonth() + 1).slice(-2);
    const d = ('0' + date.getDay()).slice(-2);
    return `${y}-${m}-${d}`;
};

const formatRFC3339 = (time) => {
    const date = new Date(time * 1000);
    return date.toISOString();
}

const showSearchResult = (searchResult, query, page) => {
    isSearchResultState = true;

    const mainElement = document.getElementsByTagName('main')[0];

    mainElement.innerHTML = '';
    const pagination = document.querySelector('div.pagination');
    if (pagination !== null) {
        pagination.remove();
    }

    const header = document.createElement('header');
    header.classList.add('post__header');
    mainElement.appendChild(header);
    const h1 = document.createElement('h1');
    h1.innerText = '"'+ query + '" の検索結果';
    header.appendChild(h1);
    const metaDiv = document.createElement('div');
    metaDiv.classList.add('list__meta', 'meta');
    metaDiv.innerText = searchResult['count'] + '件の結果 （' + (searchResult['took'] / 1000) + ' 秒）';
    header.appendChild(metaDiv);

    if (searchResult.hits.length === 0) {
        const div = document.createElement('div');
        div.classList.add('warning');
        mainElement.appendChild(div);
        const h1 = document.createElement('h1');
        h1.classList.add('warning__headline');
        h1.innerText = '検索結果がありません';
        div.appendChild(h1);
        const p = document.createElement('p');
        p.classList.add('warning__text');
        p.innerText = '違うキーワードで検索してみてください。';
        div.appendChild(p);
        return;
    }

    for (const hit of searchResult.hits) {
        const article = document.createElement('article');
        article.classList.add('list__item', 'post');
        mainElement.appendChild(article);
        const header = document.createElement('header');
        header.classList.add('list__header');
        article.appendChild(header);
        const h2 = document.createElement('h2');
        h2.classList.add('list__title', 'post__title');
        header.appendChild(h2);
        const metaDiv = document.createElement('div');
        metaDiv.classList.add('list__meta', 'meta');
        header.appendChild(metaDiv);
        const dateDiv = document.createElement('div');
        dateDiv.classList.add('meta__item-datetime', 'meta__item');
        metaDiv.appendChild(dateDiv);
        const svg = document.createElement('svg');
        svg.classList.add('meta__icon', 'icon', 'icon-time');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 30 28');
        svg.innerHTML = '<path d="M15 0C7 0 1 6 1 14s6 14 14 14 14-6 14-14S23 0 15 0zm0 25C9 25 4 20 4 14S9 3 15 3s11 5 11 11-5 11-11 11zm1-18h-2v8.4l6.8 4.4L22 18l-6-3.8V7z"></path>';
        dateDiv.appendChild(svg);
        const time = document.createElement('time');
        time.classList.add('meta__text');
        time.datetime = formatRFC3339(hit['date']);
        time.innerText = formatUnixTime(hit['date']);
        dateDiv.appendChild(time);
        if (hit['date'] !== hit['lastmod']) {
            const time = document.createElement('time');
            time.classList.add('meta__text');
            time.datetime = formatRFC3339(hit['date']);
            time.innerText = ' (最終更新: ' + formatUnixTime(hit['date']) + ')';
            dateDiv.appendChild(time);
        }
        const a = document.createElement('a');
        a.href = hit['permalink'];
        a.rel = 'bookmark';
        a.innerHTML = hit['title'];
        h2.appendChild(a);
        const div = document.createElement('div');
        div.classList.add('content', 'list__excerpt', 'post__content', 'clearfix');
        div.innerHTML = hit['summary'];
        article.appendChild(div);

        if (hit['truncated']) {
            const div = document.createElement('div');
            div.classList.add('list__footer', 'clearfix');
            article.appendChild(div);
            const a = document.createElement('a');
            a.classList.add('list__footer-readmore', 'btn');
            a.href = hit['permalink'];
            a.innerText = '続きを読む…';
            div.appendChild(a);
        }
    }

    if (searchResult['count'] > 10) {
        const totalPage = Math.ceil(searchResult['count'] / 10);

        const div = document.createElement('div');
        div.classList.add('pagination');
        if (page != 1) {
            const a = document.createElement('a');
            a.classList.add('pagination__item', 'pagination__item-prev', 'btn');
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                doSearch(query, page - 1, true);
                scroll(0, 0);
            });
            a.innerText = '«';
            div.appendChild(a);
        }
        const span = document.createElement('span');
        span.classList.add('pagination__item', 'pagination__item--current');
        span.innerText = page + '/' + totalPage;
        div.appendChild(span);
        if (page != totalPage) {
            const a = document.createElement('a');
            a.classList.add('pagination__item', 'pagination__item-prev', 'btn');
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                doSearch(query, page + 1, true);
                scroll(0, 0);
            });
            a.innerText = '»';
            div.appendChild(a);
        }

        document.querySelector('div.primary').insertBefore(div, mainElement.nextSibling);
    }
};

const hideSearchResult = (pushState) => {
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
        history.pushState({}, '', url.pathname);
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
        history.replaceState({
            searchMode: true,
            query: query,
            page: page
        }, '');

        doSearch(query, page, false);
    }
};

const doSearch = (query, page, pushState) => {
    currentPage = page;

    const url = new URL(location.href);
    url.pathname = '/search';
    const searchParam = new URLSearchParams;
    searchParam.append('q', query);
    searchParam.append('page', page.toString());
    url.search = searchParam.toString();
    url.searchParam = searchParam;

    fetch(url.toString())
        .then(resp => resp.json())
        .then(resp => {
            showSearchResult(resp, query, page);
        });

    if (pushState) {
        const urlParams = new URL(location.href).searchParams;
        urlParams.set('search_mode', 'true');
        urlParams.set('q', query);
        urlParams.set('page', page);
        history.pushState({
            searchMode: true,
            query: query,
            page: page,
            scrollPos: scrollY
        }, '', '?' + urlParams.toString());
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.getElementsByTagName('main')[0];
    article = [...mainElement.children];
    pagination = document.querySelector('div.pagination');

    revertStateFromUrl();

    document.getElementById('searchForm').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const searchQuery = document.getElementById('searchField').value;
        if (searchQuery.length === 0) {
            hideSearchResult(true);
            return;
        }

        doSearch(searchQuery, 1, true);
    });
});

addEventListener('popstate', (ev) => {
    const state = ev.state;
    if (!state || !state.searchMode) {
        hideSearchResult(false);
        return;
    }

    doSearch(state.query, state.page, false);
    document.getElementById('searchField').value = state.query;
    scroll(0, state.scrollY);
});
