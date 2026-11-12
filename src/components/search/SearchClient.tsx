'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import type {
  SearchFilterState,
  SearchItem,
  SearchItemType,
  SearchSortKey,
  SearchTimeRange,
} from '@/data/search/mock-data';
import {
  useStoredFavoriteIds,
  writeStoredFavoriteIds,
} from '@/lib/search/favorites';
import {
  checkSlidingWindowRateLimit,
  DEFAULT_SEARCH_FILTERS,
  filterAndSortSearchItems,
  getDeterministicAnchorMs,
  getTagCounts,
  getTypeCounts,
  getUniqueSources,
} from '@/lib/search/helpers';
import { SearchHeader } from './SearchHeader';
import { SearchFilterBar } from './SearchFilterBar';
import { SearchResultList } from './SearchResultList';

interface SearchClientProps {
  items: SearchItem[];
}

const VALID_TYPES: ('all' | SearchItemType)[] = [
  'all',
  'tool',
  'model',
  'tutorial',
  'paper',
  'prompt',
];
const VALID_TIME_RANGES: SearchTimeRange[] = ['all', '7d', '30d', '90d'];
const VALID_SORTS: SearchSortKey[] = ['relevance', 'latest', 'popular'];

function parseInitialFilters(
  params: ReturnType<typeof useSearchParams>
): SearchFilterState {
  const rawType = params.get('type') as 'all' | SearchItemType | null;
  const rawTime = params.get('time') as SearchTimeRange | null;
  const rawSort = params.get('sort') as SearchSortKey | null;
  const rawTags = params.getAll('tag').flatMap((val) =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  return {
    q: params.get('q') ?? DEFAULT_SEARCH_FILTERS.q,
    type: rawType && VALID_TYPES.includes(rawType) ? rawType : 'all',
    tags: Array.from(new Set(rawTags)),
    source: params.get('source') ?? 'all',
    timeRange: rawTime && VALID_TIME_RANGES.includes(rawTime) ? rawTime : 'all',
    sort: rawSort && VALID_SORTS.includes(rawSort) ? rawSort : 'relevance',
  };
}

export function SearchClient({ items }: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilterState>(() =>
    parseInitialFilters(searchParams)
  );
  const [searchInput, setSearchInput] = useState<string>(() => filters.q);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // 收藏状态通过 useSyncExternalStore 优先读取 localStorage，未存储时回退条目默认值
  const defaultFavoriteIds = useMemo(
    () => new Set(items.filter((item) => item.isFavorited).map((item) => item.id)),
    [items]
  );
  const storedFavoriteIds = useStoredFavoriteIds();
  const favoriteIds = storedFavoriteIds ?? defaultFavoriteIds;

  // 时间过滤参考点（初始使用确定性快照时间，用户手动交互时刷新为实时时间戳）
  const [anchorNowMs, setAnchorNowMs] = useState<number>(() =>
    getDeterministicAnchorMs(items)
  );

  // 预留客户端限流提示状态（后续可直连服务端 429 响应）
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const actionTimestampsRef = useRef<number[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncUrlParams = useCallback(
    (next: SearchFilterState) => {
      const nextParams = new URLSearchParams();
      if (next.q.trim()) nextParams.set('q', next.q.trim());
      if (next.type !== 'all') nextParams.set('type', next.type);
      if (next.tags.length > 0) nextParams.set('tag', next.tags.join(','));
      if (next.source !== 'all') nextParams.set('source', next.source);
      if (next.timeRange !== 'all') nextParams.set('time', next.timeRange);
      if (next.sort !== 'relevance') nextParams.set('sort', next.sort);

      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  /** 触发限流检测：5 秒内操作超过 8 次拦截并弹出友好警告 */
  const guardRateLimit = useCallback((actionLabel: string): boolean => {
    const now = Date.now();
    const result = checkSlidingWindowRateLimit(actionTimestampsRef.current, now, 8, 5000);
    actionTimestampsRef.current = result.nextTimestamps;

    if (!result.allowed) {
      setRateLimitMessage(
        `操作过于频繁（${actionLabel}），请 ${result.retryAfterSeconds} 秒后再试（已预留服务端 HTTP 429 限流对接位）。`
      );
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = setTimeout(() => {
        setRateLimitMessage(null);
      }, 3500);
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  /** 搜索框输入：立即更新受控输入值，300ms 防抖同步过滤与 URL */
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const next: SearchFilterState = { ...filters, q: value };
      setFilters(next);
      syncUrlParams(next);
    }, 300);
  };

  /** 回车/点击立即搜索（受限流保护） */
  const handleSearchSubmit = (value: string) => {
    if (!guardRateLimit('频繁搜索')) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSearchInput(value);
    const next: SearchFilterState = { ...filters, q: value };
    setFilters(next);
    syncUrlParams(next);
  };

  /** 点击热门词 */
  const handleHotTagClick = (tag: string) => {
    if (!guardRateLimit('热搜词切换')) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const nextQ = filters.q.trim().toLowerCase() === tag.toLowerCase() ? '' : tag;
    setSearchInput(nextQ);
    const next: SearchFilterState = { ...filters, q: nextQ };
    setFilters(next);
    syncUrlParams(next);
  };

  const applyFilterUpdate = (updater: (prev: SearchFilterState) => SearchFilterState) => {
    if (!guardRateLimit('高频筛选')) return;
    const next = updater(filters);
    setFilters(next);
    syncUrlParams(next);
  };

  const handleToggleTag = (tag: string, checked: boolean) => {
    applyFilterUpdate((prev) => {
      const nextTags = checked
        ? Array.from(new Set([...prev.tags, tag]))
        : prev.tags.filter((item) => item !== tag);
      return { ...prev, tags: nextTags };
    });
  };

  const handleCardTagClick = (tag: string) => {
    const exists = filters.tags.includes(tag);
    handleToggleTag(tag, !exists);
  };

  const handleTimeRangeChange = (timeRange: SearchTimeRange) => {
    setAnchorNowMs(Date.now());
    applyFilterUpdate((prev) => ({ ...prev, timeRange }));
  };

  const handleToggleFavorite = (itemId: string) => {
    if (!guardRateLimit('频繁点击收藏')) return;
    const next = new Set(favoriteIds);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    writeStoredFavoriteIds(next);
  };

  const handleResetAll = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSearchInput('');
    setFavoritesOnly(false);
    setFilters(DEFAULT_SEARCH_FILTERS);
    syncUrlParams(DEFAULT_SEARCH_FILTERS);
  };

  const typeCounts = useMemo(() => getTypeCounts(items), [items]);
  const tagCounts = useMemo(() => getTagCounts(items), [items]);
  const sources = useMemo(() => getUniqueSources(items), [items]);

  const hasMockData = useMemo(
    () => items.some((item) => item.isMockData),
    [items]
  );

  const filteredItems = useMemo(
    () =>
      filterAndSortSearchItems(items, filters, anchorNowMs, {
        favoritesOnly,
        favoriteIds,
      }),
    [items, filters, anchorNowMs, favoritesOnly, favoriteIds]
  );

  return (
    <div className="space-y-6">
      {/* 接口限流警告条 */}
      {rateLimitMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{rateLimitMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setRateLimitMessage(null)}
            className="rounded p-1 text-rose-600 hover:bg-rose-100"
            aria-label="关闭限流提示"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <SearchHeader
        searchInput={searchInput}
        onSearchInputChange={handleSearchInputChange}
        onSearchSubmit={handleSearchSubmit}
        onHotTagClick={handleHotTagClick}
      />

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <SearchFilterBar
          filters={filters}
          typeCounts={typeCounts}
          tagCounts={tagCounts}
          sources={sources}
          favoritesOnly={favoritesOnly}
          favoriteTotalCount={favoriteIds.size}
          onTypeChange={(type) => applyFilterUpdate((prev) => ({ ...prev, type }))}
          onToggleTag={handleToggleTag}
          onSourceChange={(source) => applyFilterUpdate((prev) => ({ ...prev, source }))}
          onTimeRangeChange={handleTimeRangeChange}
          onSortChange={(sort) => applyFilterUpdate((prev) => ({ ...prev, sort }))}
          onFavoritesOnlyChange={(checked) => {
            if (!guardRateLimit('切换收藏筛选')) return;
            setFavoritesOnly(checked);
          }}
          onResetAll={handleResetAll}
        />

        <SearchResultList
          items={filteredItems}
          totalCount={items.length}
          hasMockData={hasMockData}
          query={filters.q}
          selectedTags={filters.tags}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onTagClick={handleCardTagClick}
          onRemoveTag={(tag) => handleToggleTag(tag, false)}
          onResetAll={handleResetAll}
          onQuickTagSearch={handleHotTagClick}
        />
      </div>

      <footer className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-500">
        <strong className="font-medium text-slate-700">来源与版权声明：</strong>
        本站仅提供 AI 资料元数据检索、自编中文摘要与原文外链跳转，不存储或展示第三方全文；所有外部内容版权归原作者及原发布平台所有。
      </footer>
    </div>
  );
}
