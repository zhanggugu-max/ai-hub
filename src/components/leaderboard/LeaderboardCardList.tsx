'use client';

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type { LeaderboardEntry } from '@/data/leaderboard/mock-data';
import { formatContextWindow } from '@/lib/leaderboard/helpers';
import { RankDeltaBadge } from './RankDeltaBadge';

interface LeaderboardCardListProps {
  entries: LeaderboardEntry[];
  selectedSlugs: string[];
  maxCompare: number;
  onToggleCompare: (modelSlug: string, checked: boolean) => void;
  onResetFilters: () => void;
}

export function LeaderboardCardList({
  entries,
  selectedSlugs,
  maxCompare,
  onToggleCompare,
  onResetFilters,
}: LeaderboardCardListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center md:hidden">
        <p className="text-sm text-slate-600">未找到符合当前筛选条件的模型。</p>
        <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-3">
          清空筛选条件
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {entries.map((entry) => {
        const isChecked = selectedSlugs.includes(entry.modelSlug);
        const isDisabled = !isChecked && selectedSlugs.length >= maxCompare;

        return (
          <article
            key={entry.id}
            className={`rounded-xl border bg-white p-4 shadow-2xs ${
              isChecked ? 'border-blue-400 ring-1 ring-blue-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-bold tabular-nums text-slate-900">
                  {entry.rank}
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">{entry.modelName}</h2>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span>{entry.provider}</span>
                    <span>·</span>
                    <Badge
                      variant="secondary"
                      className={
                        entry.licenseType === 'open_weights'
                          ? 'bg-emerald-50 px-1.5 py-0 text-[11px] text-emerald-700'
                          : 'bg-slate-100 px-1.5 py-0 text-[11px] text-slate-700'
                      }
                    >
                      {entry.licenseLabel}
                    </Badge>
                    <RankDeltaBadge delta={entry.rankDelta} />
                  </div>
                </div>
              </div>

              <label className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
                <Checkbox
                  checked={isChecked}
                  disabled={isDisabled}
                  onCheckedChange={(checked) =>
                    onToggleCompare(entry.modelSlug, checked === true)
                  }
                  aria-label={`勾选对比 ${entry.modelName}`}
                />
                <span>对比</span>
              </label>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-2.5 text-center">
              <div>
                <div className="text-[11px] text-slate-500">综合</div>
                <div className="font-bold tabular-nums text-slate-900">
                  {entry.scores.overall.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">代码</div>
                <div className="font-medium tabular-nums text-slate-800">
                  {entry.scores.coding !== undefined ? entry.scores.coding.toFixed(1) : '-'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">数学</div>
                <div className="font-medium tabular-nums text-slate-800">
                  {entry.scores.math !== undefined ? entry.scores.math.toFixed(1) : '-'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">上下文</div>
                <div className="font-medium tabular-nums text-slate-800">
                  {formatContextWindow(entry.contextWindowK)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <div className="tabular-nums">
                API 价格：
                {entry.pricing
                  ? `$${entry.pricing.inputPer1MUsd.toFixed(2)} / $${entry.pricing.outputPer1MUsd.toFixed(2)} (1M)`
                  : '-'}
              </div>
              <a
                href={entry.officialUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 font-medium text-blue-600"
              >
                官方页
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
