'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type {
  LeaderboardEntry,
  LeaderboardSortKey,
} from '@/data/leaderboard/mock-data';
import { formatContextWindow } from '@/lib/leaderboard/helpers';
import { RankDeltaBadge } from './RankDeltaBadge';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sortKey: LeaderboardSortKey;
  sortOrder: 'asc' | 'desc';
  onSort: (key: LeaderboardSortKey) => void;
  selectedSlugs: string[];
  maxCompare: number;
  onToggleCompare: (modelSlug: string, checked: boolean) => void;
  onResetFilters: () => void;
}

function SortIcon({
  columnKey,
  activeKey,
  order,
}: {
  columnKey: LeaderboardSortKey;
  activeKey: LeaderboardSortKey;
  order: 'asc' | 'desc';
}) {
  if (activeKey !== columnKey) {
    return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
  }
  return order === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
  );
}

export function LeaderboardTable({
  entries,
  sortKey,
  sortOrder,
  onSort,
  selectedSlugs,
  maxCompare,
  onToggleCompare,
  onResetFilters,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="hidden rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center md:block">
        <p className="text-sm text-slate-600">未找到符合当前筛选条件的模型。</p>
        <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-3">
          清空筛选条件
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs md:block">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="w-[54px] text-center">对比</TableHead>
            <TableHead className="w-[96px]">
              <button
                type="button"
                onClick={() => onSort('rank')}
                className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950"
              >
                排名
                <SortIcon columnKey="rank" activeKey={sortKey} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead className="min-w-[230px]">模型 / 机构 / 协议</TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => onSort('overallScore')}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950"
              >
                综合分
                <SortIcon columnKey="overallScore" activeKey={sortKey} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => onSort('codingScore')}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950"
              >
                代码
                <SortIcon columnKey="codingScore" activeKey={sortKey} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => onSort('mathScore')}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950"
              >
                数学
                <SortIcon columnKey="mathScore" activeKey={sortKey} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => onSort('contextWindow')}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950"
              >
                上下文
                <SortIcon columnKey="contextWindow" activeKey={sortKey} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => onSort('inputPricePer1M')}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950"
              >
                输入/输出 ($/1M)
                <SortIcon columnKey="inputPricePer1M" activeKey={sortKey} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead className="w-[70px] text-right">官网</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isChecked = selectedSlugs.includes(entry.modelSlug);
            const isDisabled = !isChecked && selectedSlugs.length >= maxCompare;

            return (
              <TableRow
                key={entry.id}
                className={isChecked ? 'bg-blue-50/40 hover:bg-blue-50/60' : undefined}
              >
                <TableCell className="text-center">
                  <div
                    className="flex justify-center"
                    title={isDisabled ? `最多同时对比 ${maxCompare} 个模型` : '加入横向对比'}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={(checked) =>
                        onToggleCompare(entry.modelSlug, checked === true)
                      }
                      aria-label={`勾选对比 ${entry.modelName}`}
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-sm font-bold tabular-nums text-slate-900">
                      {entry.rank}
                    </span>
                    <RankDeltaBadge delta={entry.rankDelta} />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{entry.modelName}</span>
                      <Badge
                        variant="secondary"
                        className={
                          entry.licenseType === 'open_weights'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                        }
                      >
                        {entry.licenseLabel}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>{entry.provider}</span>
                      {entry.highlights.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span className="font-bold tabular-nums text-slate-900">
                      {entry.scores.overall.toFixed(1)}
                    </span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, Math.max(0, entry.scores.overall))}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right tabular-nums text-slate-700">
                  {entry.scores.coding !== undefined ? entry.scores.coding.toFixed(1) : '-'}
                </TableCell>

                <TableCell className="text-right tabular-nums text-slate-700">
                  {entry.scores.math !== undefined ? entry.scores.math.toFixed(1) : '-'}
                </TableCell>

                <TableCell className="text-right font-medium tabular-nums text-slate-700">
                  {formatContextWindow(entry.contextWindowK)}
                </TableCell>

                <TableCell className="text-right text-xs tabular-nums text-slate-700">
                  {entry.pricing ? (
                    <span>
                      ${entry.pricing.inputPer1MUsd.toFixed(2)} / $
                      {entry.pricing.outputPer1MUsd.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <a
                    href={entry.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                    aria-label={`访问 ${entry.modelName} 官方页面`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
