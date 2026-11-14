'use client';

import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  LeaderboardFilterState,
  LeaderboardSortKey,
  LicenseType,
} from '@/data/leaderboard/mock-data';

interface LeaderboardFilterBarProps {
  filters: LeaderboardFilterState;
  providers: string[];
  totalCount: number;
  filteredCount: number;
  visibleCount: number;
  onFilterChange: <K extends keyof LeaderboardFilterState>(
    key: K,
    value: LeaderboardFilterState[K]
  ) => void;
  onSortSelect: (sortKey: LeaderboardSortKey) => void;
  onReset: () => void;
}

const LICENSE_LABELS: Record<'all' | LicenseType, string> = {
  all: '全部协议',
  open_weights: '开源权重',
  proprietary: '闭源商用',
};

const CONTEXT_LABELS: Record<number, string> = {
  0: '上下文不限',
  64: '≥ 64K',
  128: '≥ 128K',
  200: '≥ 200K',
  1000: '≥ 1M',
};

const SORT_OPTIONS: { value: LeaderboardSortKey; label: string }[] = [
  { value: 'rank', label: '默认排名' },
  { value: 'overallScore', label: '综合能力分' },
  { value: 'valueScore', label: '性价比分' },
  { value: 'blendedPricePer1M', label: '1:3 加权均价' },
  { value: 'codingScore', label: '代码能力分' },
  { value: 'mathScore', label: '数学推理分' },
  { value: 'contextWindow', label: '上下文长度' },
  { value: 'inputPricePer1M', label: '输入价格 (美元/百万 Token)' },
  { value: 'outputPricePer1M', label: '输出价格 (美元/百万 Token)' },
];

const SORT_LABELS: Record<LeaderboardSortKey, string> = Object.fromEntries(
  SORT_OPTIONS.map((item) => [item.value, item.label])
) as Record<LeaderboardSortKey, string>;

export function LeaderboardFilterBar({
  filters,
  providers,
  totalCount,
  filteredCount,
  visibleCount,
  onFilterChange,
  onSortSelect,
  onReset,
}: LeaderboardFilterBarProps) {
  const hasActiveFilter =
    filters.search !== '' ||
    filters.license !== 'all' ||
    filters.provider !== 'all' ||
    filters.minContextK !== 0 ||
    filters.sortKey !== 'rank' ||
    filters.sortOrder !== 'asc';

  return (
    <section
      aria-label="榜单筛选工具栏"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        {/* 模型/机构搜索框 */}
        <div className="relative lg:col-span-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="搜索模型名、机构、协议或特性..."
            className="pr-8 pl-9"
            aria-label="搜索模型或机构"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="清空搜索词"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 开源 / 闭源筛选 */}
        <div className="lg:col-span-2">
          <Select
            value={filters.license}
            onValueChange={(value) => {
              if (value) onFilterChange('license', value as 'all' | LicenseType);
            }}
          >
            <SelectTrigger className="w-full" aria-label="按开源或闭源筛选">
              <SelectValue placeholder="协议类型">
                {LICENSE_LABELS[filters.license]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部协议</SelectItem>
              <SelectItem value="open_weights">开源权重</SelectItem>
              <SelectItem value="proprietary">闭源商用</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 机构筛选 */}
        <div className="lg:col-span-2">
          <Select
            value={filters.provider}
            onValueChange={(value) => {
              if (value) onFilterChange('provider', value);
            }}
          >
            <SelectTrigger className="w-full" aria-label="按研发机构筛选">
              <SelectValue placeholder="研发机构">
                {filters.provider === 'all' ? '全部机构' : filters.provider}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部机构</SelectItem>
              {providers.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 最小上下文窗口 */}
        <div className="lg:col-span-2">
          <Select
            value={String(filters.minContextK)}
            onValueChange={(value) => {
              if (value !== null) onFilterChange('minContextK', Number(value));
            }}
          >
            <SelectTrigger className="w-full" aria-label="按最小上下文长度筛选">
              <SelectValue placeholder="上下文要求">
                {CONTEXT_LABELS[filters.minContextK] ?? `≥ ${filters.minContextK}K`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">上下文不限</SelectItem>
              <SelectItem value="64">≥ 64K</SelectItem>
              <SelectItem value="128">≥ 128K</SelectItem>
              <SelectItem value="200">≥ 200K</SelectItem>
              <SelectItem value="1000">≥ 1M</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 排序字段选择 */}
        <div className="lg:col-span-2">
          <Select
            value={filters.sortKey}
            onValueChange={(value) => {
              if (value) onSortSelect(value as LeaderboardSortKey);
            }}
          >
            <SelectTrigger className="w-full" aria-label="排序维度">
              <SelectValue placeholder="排序方式">
                {SORT_LABELS[filters.sortKey]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 底部结果计数与重置 */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>
            {filteredCount === totalCount ? (
              <>
                共匹配{' '}
                <strong className="font-semibold tabular-nums text-slate-900">
                  {filteredCount}
                </strong>{' '}
                款，已显示{' '}
                <strong className="font-semibold tabular-nums text-slate-900">
                  {visibleCount}
                </strong>{' '}
                款
              </>
            ) : (
              <>
                共匹配{' '}
                <strong className="font-semibold tabular-nums text-slate-900">
                  {filteredCount}
                </strong>{' '}
                / {totalCount} 款，已显示{' '}
                <strong className="font-semibold tabular-nums text-slate-900">
                  {visibleCount}
                </strong>{' '}
                款
              </>
            )}
            （点击表头可切换升/降序）
          </span>
        </div>

        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 gap-1 px-2 text-xs text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置筛选
          </Button>
        )}
      </div>
    </section>
  );
}
