const formatUnixTime = (time: number): string => {
    const date = new Date(time * 1000);
    const y = date.getFullYear().toString();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDay()).slice(-2);
    return `${y}-${m}-${d}`;
};

const renderError = (title: string, instruction: string) => {
    const container = document.querySelector('.article-list');
    container.innerHTML = '';

    const innerContainer = document.createElement('div');
    innerContainer.classList.add('error');

    const titleElement = document.createElement('h3');
    titleElement.innerText = title;
    innerContainer.appendChild(titleElement);

    const instructionElement = document.createElement('p');
    instructionElement.innerText = instruction;
    innerContainer.appendChild(instructionElement);

    container.appendChild(innerContainer);
};

const renderSearchResult = (searchResult: any, query: string, page: number) => {
    if (searchResult['count'] === 0) {
        renderError('検索結果がありません', '別のキーワードで検索してみてください。');
        return;
    }

    const searchMeta = document.getElementById('searchMeta');
    const count = searchResult['count'];
    const timeInSec = searchResult['took'] / 1000;
    searchMeta.innerText = `${count} 件の結果（${timeInSec} 秒）`;

    const articleList = document.querySelector('.article-list');
    articleList.innerHTML = '';

    for (const hit of searchResult['hits']) {
        const link = document.createElement('a');
        link.href = hit['permalink'];

        const article = document.createElement('article');

        const title = document.createElement('h3');
        title.classList.add('title');
        title.innerText = hit['title'];
        article.appendChild(title);

        const frontmatter = document.createElement('div');
        frontmatter.classList.add('frontmatter');
        let articleDate = formatUnixTime(hit['date']);
        if (hit['date'] !== hit['lastmod']) {
            const lastmod = formatUnixTime(hit['lastmod']);
            articleDate += `（最終更新: ${lastmod}）`
        }
        frontmatter.innerText = articleDate;
        article.appendChild(frontmatter);

        const summary = document.createElement('div');
        summary.classList.add('summary');
        summary.innerHTML = hit['summary'] + (hit['truncated'] ? '…' : '');
        if (hit['truncated']) {
            const readMore = document.createElement('span');
            readMore.classList.add('read-more');
            readMore.innerText = '続きを読む';
            summary.appendChild(readMore);
        }
        article.appendChild(summary);

        link.appendChild(article);

        articleList.appendChild(link, null);
    }

    if (searchResult['count'] > 10) {
        const totalPage = Math.ceil(searchResult['count'] / 10);

        const paginator = document.querySelector('.paginator');

        if (page !== 1) {
            const prevLink = document.createElement('a');
            prevLink.classList.add('prev');
            prevLink.innerText = '前のページ';
            const params = new URLSearchParams();
            params.append('q', query);
            if (page !== 2) {
                params.append('p', page - 1);
            }
            prevLink.href = '/search/?' + params.toString();
            paginator.appendChild(prevLink);
        }

        const countIndicator = document.createElement('span');
        countIndicator.classList.add('count');
        countIndicator.innerText = `${page}/${totalPage}`;
        paginator.appendChild(countIndicator);

        if (page !== totalPage) {
            const nextLink = document.createElement('a');
            nextLink.classList.add('next');
            nextLink.innerText = '次のページ';
            const params = new URLSearchParams();
            params.append('q', query);
            params.append('p', page + 1);
            nextLink.href = '/search/?' + params.toString();
            paginator.appendChild(nextLink);
        }
    }
};

addEventListener('load', () => {
    document.querySelector('.article-list').innerText = '読み込み中…';

    const params = new URL(location.href).searchParams;
    const query = params.get('q') || '';
    const page = Number(params.get('p')) || 1;

    const apiUrl = new URL(location.href);
    apiUrl.pathname = '/internal/search';
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('page', page.toString());
    apiUrl.search = searchParams.toString();

    fetch(apiUrl.toString())
        .then((resp) => resp.json())
        .then((resp) => {
            renderSearchResult(resp, query, page);
        })
        .catch((err) => {
            renderError('エラーが発生しました', 'しばらくしてもう一度お試しください。');
            console.error(err);
        });

    const listTitle = document.querySelector('.list-title');
    listTitle.innerText = `“${query}” ${listTitle.innerText}`;

    document.title = `“${query}” ${document.title}`;

    const searchField = document.getElementById('searchField');
    searchField.value = query;
});
