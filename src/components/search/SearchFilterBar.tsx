'use client';

import { Bookmark, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SEARCH_TYPE_META,
  type SearchFilterState,
  type SearchItemType,
  type SearchSortKey,
  type SearchTimeRange,
} from '@/data/search/mock-data';

interface SearchFilterBarProps {
  filters: SearchFilterState;
  typeCounts: Record<'all' | SearchItemType, number>;
  tagCounts: { tag: string; count: number }[];
  sources: string[];
  favoritesOnly: boolean;
  favoriteTotalCount: number;
  onTypeChange: (type: 'all' | SearchItemType) => void;
  onToggleTag: (tag: string, checked: boolean) => void;
  onSourceChange: (source: string) => void;
  onTimeRangeChange: (timeRange: SearchTimeRange) => void;
  onSortChange: (sort: SearchSortKey) => void;
  onFavoritesOnlyChange: (checked: boolean) => void;
  onResetAll: () => void;
}

const TIME_LABELS: Record<SearchTimeRange, string> = {
  all: '全部时间',
  '7d': '最近 7 天',
  '30d': '最近 30 天',
  '90d': '最近 90 天',
};

const SORT_LABELS: Record<SearchSortKey, string> = {
  relevance: '综合相关度',
  latest: '最新发布时间',
  popular: '最新发布时间',
};

export function SearchFilterBar({
  filters,
  typeCounts,
  tagCounts,
  sources,
  favoritesOnly,
  favoriteTotalCount,
  onTypeChange,
  onToggleTag,
  onSourceChange,
  onTimeRangeChange,
  onSortChange,
  onFavoritesOnlyChange,
  onResetAll,
}: SearchFilterBarProps) {
  const hasActiveFilter =
    filters.type !== 'all' ||
    filters.tags.length > 0 ||
    filters.source !== 'all' ||
    filters.timeRange !== 'all' ||
    filters.sort !== 'relevance' ||
    favoritesOnly;

  return (
    <aside
      aria-label="搜索多维筛选"
      className="w-full shrink-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs lg:w-72"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>多维筛选</span>
        </div>
        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetAll}
            className="h-7 gap-1 px-2 text-xs text-slate-500 hover:text-slate-900"
          >
            <RotateCcw className="h-3 w-3" />
            重置
          </Button>
        )}
      </div>

      {/* 1. 分类 Type Tab */}
      <div className="space-y-2">
        <div className="text-xs font-semibold tracking-wide text-slate-500">资料分类</div>
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
          {SEARCH_TYPE_META.map((item) => {
            const active = filters.type === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onTypeChange(item.value)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                    active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {typeCounts[item.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 只看我的收藏 */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
        <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
          <span className="inline-flex items-center gap-2 font-medium text-slate-800">
            <Bookmark className="h-4 w-4 text-amber-500" />
            <span>仅看已收藏</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-slate-500">{favoriteTotalCount}</span>
            <Checkbox
              checked={favoritesOnly}
              onCheckedChange={(checked) => onFavoritesOnlyChange(checked === true)}
              aria-label="仅查看我收藏的资料"
            />
          </div>
        </label>
      </div>

      {/* 3. 来源筛选 */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold tracking-wide text-slate-500">数据来源</div>
        <Select
          value={filters.source}
          onValueChange={(value) => {
            if (value) onSourceChange(value);
          }}
        >
          <SelectTrigger className="w-full" aria-label="按来源筛选">
            <SelectValue placeholder="全部来源">
              {filters.source === 'all' ? '全部来源' : filters.source}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部来源</SelectItem>
            {sources.map((src) => (
              <SelectItem key={src} value={src}>
                {src}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. 发布时间范围 */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold tracking-wide text-slate-500">发布时间</div>
        <Select
          value={filters.timeRange}
          onValueChange={(value) => {
            if (value) onTimeRangeChange(value as SearchTimeRange);
          }}
        >
          <SelectTrigger className="w-full" aria-label="按发布时间筛选">
            <SelectValue placeholder="全部时间">
              {TIME_LABELS[filters.timeRange]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部时间</SelectItem>
            <SelectItem value="7d">最近 7 天</SelectItem>
            <SelectItem value="30d">最近 30 天</SelectItem>
            <SelectItem value="90d">最近 90 天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 5. 排序方式 */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold tracking-wide text-slate-500">排序方式</div>
        <Select
          value={filters.sort}
          onValueChange={(value) => {
            if (value) onSortChange(value as SearchSortKey);
          }}
        >
          <SelectTrigger className="w-full" aria-label="按排序方式筛选">
            <SelectValue placeholder="综合相关度">
              {SORT_LABELS[filters.sort]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">综合相关度</SelectItem>
            <SelectItem value="latest">最新发布时间</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 6. 标签多选（Tags） */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500">
            标签多选（{filters.tags.length} 已选）
          </span>
        </div>
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {tagCounts.map(({ tag, count }) => {
            const checked = filters.tags.includes(tag);
            return (
              <label
                key={tag}
                className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 text-sm hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(state) => onToggleTag(tag, state === true)}
                    aria-label={`按标签 ${tag} 筛选`}
                  />
                  <span className={checked ? 'font-medium text-blue-700' : 'text-slate-700'}>
                    {tag}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-slate-400">{count}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
