'use client';

import { AlertTriangle, Clock, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { LeaderboardSnapshot } from '@/data/leaderboard/mock-data';
import { formatUpdatedTime } from '@/lib/leaderboard/helpers';

interface SourceMetaBannerProps {
  snapshot: LeaderboardSnapshot;
}

export function SourceMetaBanner({ snapshot }: SourceMetaBannerProps) {
  const formattedTime = formatUpdatedTime(snapshot.updatedAt);

  return (
    <section
      aria-label="数据来源与更新说明"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {snapshot.isMockData && (
            <Badge className="gap-1 border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
              <AlertTriangle className="h-3.5 w-3.5" />
              Mock 示例数据（非真实跑分）
            </Badge>
          )}

          <div className="inline-flex items-center gap-1.5 text-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>最后更新：</span>
            <time dateTime={snapshot.updatedAt} className="font-medium tabular-nums text-slate-900">
              {formattedTime} (UTC+8)
            </time>
          </div>

          <div className="inline-flex items-center gap-1.5 text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>数据来源：</span>
            <a
              href={snapshot.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              <span>{snapshot.sourceName}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-600" />
              }
            >
              <Info className="h-3.5 w-3.5" />
              评测口径与免责声明
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>评分口径与合规免责声明</DialogTitle>
                <DialogDescription>
                  本页已综合 OpenRouter AA 跑分与 LMArena 盲测 Elo 等公开基准，定时刷新并保留更新记录，不承诺毫秒级实时性。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2 text-sm leading-relaxed text-slate-700">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-1 font-semibold text-slate-900">评分与排序说明</div>
                  <p>{snapshot.methodologyNote}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-amber-950">
                  <div className="mb-1 font-semibold">免责声明</div>
                  <p>{snapshot.disclaimer}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-500">
        <span className="font-medium text-slate-700">评分口径：</span>
        {snapshot.methodologyNote}
      </p>
    </section>
  );
}
