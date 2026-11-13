'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardFilterState,
  LeaderboardSnapshot,
  LeaderboardSortKey,
  LicenseType,
} from '@/data/leaderboard/mock-data';
import {
  DEFAULT_FILTER_STATE,
  filterAndSortEntries,
  getUniqueProviders,
} from '@/lib/leaderboard/helpers';
import { LeaderboardHeader } from './LeaderboardHeader';
import { SourceMetaBanner } from './SourceMetaBanner';
import { LeaderboardFilterBar } from './LeaderboardFilterBar';
import { LeaderboardTable } from './LeaderboardTable';
import { LeaderboardCardList } from './LeaderboardCardList';
import { CompareFloatingBar } from './CompareFloatingBar';
import { CompareDialog } from './CompareDialog';

interface LeaderboardClientProps {
  snapshots: Record<LeaderboardCategory, LeaderboardSnapshot>;
}

const MAX_COMPARE_COUNT = 4;
const DEFAULT_VISIBLE_ROWS = 25;

const VALID_CATEGORIES: LeaderboardCategory[] = ['overall', 'open_source', 'api_value'];
const VALID_LICENSES: ('all' | LicenseType)[] = ['all', 'open_weights', 'proprietary'];
const VALID_SORT_KEYS: LeaderboardSortKey[] = [
  'rank',
  'overallScore',
  'codingScore',
  'mathScore',
  'contextWindow',
  'inputPricePer1M',
  'outputPricePer1M',
];

function parseInitialFilters(
  params: ReturnType<typeof useSearchParams>
): LeaderboardFilterState {
  const rawCategory = params.get('board') as LeaderboardCategory | null;
  const rawLicense = params.get('license') as 'all' | LicenseType | null;
  const rawSort = params.get('sort') as LeaderboardSortKey | null;
  const rawOrder = params.get('order');
  const rawMinCtx = Number(params.get('ctx') ?? '0');

  return {
    category:
      rawCategory && VALID_CATEGORIES.includes(rawCategory)
        ? rawCategory
        : DEFAULT_FILTER_STATE.category,
    search: params.get('q') ?? DEFAULT_FILTER_STATE.search,
    license:
      rawLicense && VALID_LICENSES.includes(rawLicense)
        ? rawLicense
        : DEFAULT_FILTER_STATE.license,
    provider: params.get('provider') ?? DEFAULT_FILTER_STATE.provider,
    minContextK: Number.isFinite(rawMinCtx) && rawMinCtx > 0 ? rawMinCtx : 0,
    sortKey:
      rawSort && VALID_SORT_KEYS.includes(rawSort)
        ? rawSort
        : DEFAULT_FILTER_STATE.sortKey,
    sortOrder: rawOrder === 'desc' || rawOrder === 'asc' ? rawOrder : DEFAULT_FILTER_STATE.sortOrder,
  };
}

export function LeaderboardClient({ snapshots }: LeaderboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<LeaderboardFilterState>(() =>
    parseInitialFilters(searchParams)
  );
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [expandedAll, setExpandedAll] = useState(false);
  const urlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSnapshot = snapshots[filters.category];

  const pushUrlParams = useCallback(
    (next: LeaderboardFilterState) => {
      const nextParams = new URLSearchParams();
      if (next.category !== DEFAULT_FILTER_STATE.category) nextParams.set('board', next.category);
      if (next.search.trim()) nextParams.set('q', next.search.trim());
      if (next.license !== 'all') nextParams.set('license', next.license);
      if (next.provider !== 'all') nextParams.set('provider', next.provider);
      if (next.minContextK > 0) nextParams.set('ctx', String(next.minContextK));
      if (next.sortKey !== 'rank') nextParams.set('sort', next.sortKey);
      if (next.sortOrder !== 'asc') nextParams.set('order', next.sortOrder);

      const queryString = nextParams.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const scheduleUrlSync = useCallback(
    (next: LeaderboardFilterState, immediate: boolean) => {
      if (urlTimerRef.current) {
        clearTimeout(urlTimerRef.current);
        urlTimerRef.current = null;
      }
      if (immediate) {
        pushUrlParams(next);
        return;
      }
      urlTimerRef.current = setTimeout(() => {
        pushUrlParams(next);
      }, 250);
    },
    [pushUrlParams]
  );

  useEffect(() => {
    return () => {
      if (urlTimerRef.current) {
        clearTimeout(urlTimerRef.current);
      }
    };
  }, []);

  const handleCategoryChange = (category: LeaderboardCategory) => {
    const next: LeaderboardFilterState = {
      ...filters,
      category,
      provider: 'all',
    };
    setExpandedAll(false);
    setFilters(next);
    scheduleUrlSync(next, true);
  };

  const handleFilterChange = <K extends keyof LeaderboardFilterState>(
    key: K,
    value: LeaderboardFilterState[K]
  ) => {
    const next: LeaderboardFilterState = { ...filters, [key]: value };
    setFilters(next);
    scheduleUrlSync(next, key !== 'search');
  };

  const handleSortSelect = (sortKey: LeaderboardSortKey) => {
    const defaultOrder =
      sortKey === 'rank' ||
      sortKey === 'inputPricePer1M' ||
      sortKey === 'outputPricePer1M'
        ? 'asc'
        : 'desc';
    const next: LeaderboardFilterState = {
      ...filters,
      sortKey,
      sortOrder: defaultOrder,
    };
    setFilters(next);
    scheduleUrlSync(next, true);
  };

  const handleSort = (columnKey: LeaderboardSortKey) => {
    let nextOrder: 'asc' | 'desc';
    if (filters.sortKey === columnKey) {
      nextOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      nextOrder =
        columnKey === 'rank' ||
        columnKey === 'inputPricePer1M' ||
        columnKey === 'outputPricePer1M'
          ? 'asc'
          : 'desc';
    }
    const next: LeaderboardFilterState = {
      ...filters,
      sortKey: columnKey,
      sortOrder: nextOrder,
    };
    setFilters(next);
    scheduleUrlSync(next, true);
  };

  const handleResetFilters = () => {
    const next: LeaderboardFilterState = {
      ...DEFAULT_FILTER_STATE,
      category: filters.category,
    };
    setFilters(next);
    scheduleUrlSync(next, true);
  };

  const providers = useMemo(
    () => getUniqueProviders(activeSnapshot.entries),
    [activeSnapshot.entries]
  );

  const filteredEntries = useMemo(
    () => filterAndSortEntries(activeSnapshot.entries, filters),
    [activeSnapshot.entries, filters]
  );

  // 搜索或启用筛选时自动展示全部命中项；默认无筛选且数量较多时先展示前 25 款并可一键展开全部
  const hasActiveCriteria =
    filters.search.trim().length > 0 ||
    filters.license !== 'all' ||
    filters.provider !== 'all' ||
    filters.minContextK > 0;

  const canToggleExpand = !hasActiveCriteria && filteredEntries.length > DEFAULT_VISIBLE_ROWS;
  const visibleEntries =
    canToggleExpand && !expandedAll
      ? filteredEntries.slice(0, DEFAULT_VISIBLE_ROWS)
      : filteredEntries;

  /** 建立跨 Tab 的模型字典，切换榜单 Tab 时依然保留已勾选对比项 */
  const modelLookup = useMemo(() => {
    const map = new Map<string, LeaderboardEntry>();
    Object.values(snapshots).forEach((snap) => {
      snap.entries.forEach((entry) => {
        if (!map.has(entry.modelSlug)) {
          map.set(entry.modelSlug, entry);
        }
      });
    });
    activeSnapshot.entries.forEach((entry) => {
      map.set(entry.modelSlug, entry);
    });
    return map;
  }, [snapshots, activeSnapshot.entries]);

  const selectedEntries = useMemo(
    () =>
      selectedSlugs
        .map((slug) => modelLookup.get(slug))
        .filter((item): item is LeaderboardEntry => item !== undefined),
    [selectedSlugs, modelLookup]
  );

  const handleToggleCompare = (modelSlug: string, checked: boolean) => {
    setSelectedSlugs((prev) => {
      if (checked) {
        if (prev.includes(modelSlug) || prev.length >= MAX_COMPARE_COUNT) {
          return prev;
        }
        return [...prev, modelSlug];
      }
      return prev.filter((slug) => slug !== modelSlug);
    });
  };

  const effectiveCompareOpen = compareOpen && selectedEntries.length >= 2;

  return (
    <div className="space-y-5 pb-24">
      <LeaderboardHeader
        activeCategory={filters.category}
        onCategoryChange={handleCategoryChange}
        title={activeSnapshot.title}
        description={activeSnapshot.description}
      />

      <SourceMetaBanner snapshot={activeSnapshot} />

      <LeaderboardFilterBar
        filters={filters}
        providers={providers}
        totalCount={activeSnapshot.entries.length}
        filteredCount={filteredEntries.length}
        onFilterChange={handleFilterChange}
        onSortSelect={handleSortSelect}
        onReset={handleResetFilters}
      />

      <LeaderboardTable
        entries={visibleEntries}
        sortKey={filters.sortKey}
        sortOrder={filters.sortOrder}
        onSort={handleSort}
        selectedSlugs={selectedSlugs}
        maxCompare={MAX_COMPARE_COUNT}
        onToggleCompare={handleToggleCompare}
        onResetFilters={handleResetFilters}
      />

      <LeaderboardCardList
        entries={visibleEntries}
        selectedSlugs={selectedSlugs}
        maxCompare={MAX_COMPARE_COUNT}
        onToggleCompare={handleToggleCompare}
        onResetFilters={handleResetFilters}
      />

      {canToggleExpand && (
        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => setExpandedAll((prev) => !prev)}
            className="gap-1.5 rounded-xl border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-300 hover:text-blue-600"
          >
            {expandedAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>收起至前 {DEFAULT_VISIBLE_ROWS} 款模型</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>
                  展开全部 {filteredEntries.length} 款模型（当前显示前 {DEFAULT_VISIBLE_ROWS} 款）
                </span>
              </>
            )}
          </Button>
        </div>
      )}

      <footer className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
        <strong className="font-medium text-slate-700">免责声明：</strong>
        {activeSnapshot.disclaimer}
      </footer>

      <CompareFloatingBar
        selectedEntries={selectedEntries}
        maxCompare={MAX_COMPARE_COUNT}
        onRemove={(slug) => handleToggleCompare(slug, false)}
        onClear={() => {
          setSelectedSlugs([]);
          setCompareOpen(false);
        }}
        onOpenCompare={() => setCompareOpen(true)}
      />

      <CompareDialog
        open={effectiveCompareOpen}
        onOpenChange={setCompareOpen}
        entries={selectedEntries}
        onRemove={(slug) => handleToggleCompare(slug, false)}
      />
    </div>
  );
}
