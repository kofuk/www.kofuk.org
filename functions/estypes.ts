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
