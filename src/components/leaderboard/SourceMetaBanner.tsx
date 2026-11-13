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

const DATA_SOURCES = [
  { label: 'LMArena 盲测榜', url: 'https://arena.ai/leaderboard' },
  {
    label: 'HF 官方数据集',
    url: 'https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset',
  },
  { label: 'OpenRouter 模型目录', url: 'https://openrouter.ai/models' },
  { label: 'Artificial Analysis', url: 'https://artificialanalysis.ai/' },
];

export function SourceMetaBanner({ snapshot }: SourceMetaBannerProps) {
  const formattedTime = formatUpdatedTime(snapshot.updatedAt);
  const arenaDateMatch = snapshot.sourceName.match(/\((\d{4}-\d{2}-\d{2})\)/);
  const arenaSnapshotDate = arenaDateMatch?.[1];

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
            {arenaSnapshotDate && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                Arena 快照 {arenaSnapshotDate}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>数据来源：</span>
            </span>

            {snapshot.isMockData ? (
              <a
                href={snapshot.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline"
              >
                <span>{snapshot.sourceName}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {DATA_SOURCES.map((src) => (
                  <a
                    key={src.label}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 underline-offset-4 hover:underline sm:text-sm"
                  >
                    <span>{src.label}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
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
            <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>评分权重、缺项规则与免责声明</DialogTitle>
                <DialogDescription>
                  定时同步并公开各模型综合分来源，便于核对不同基准的评分依据与价格口径。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5 pt-2 text-sm leading-relaxed text-slate-700">
                <div className="rounded-lg bg-slate-50 p-3.5">
                  <div className="mb-1.5 font-semibold text-slate-900">1. 综合分来源与权重分级</div>
                  <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600">
                    <li>
                      <strong className="text-slate-800">第一优先级（LMArena 盲测）</strong>：
                      命中 LMArena <code>text_style_control</code> 公开数据集时，直接使用其 overall Elo 线性换算至 0–100（权重 100%）。
                    </li>
                    <li>
                      <strong className="text-slate-800">第二优先级（AA 综合指数）</strong>：
                      若无 LMArena overall 成绩，采用 OpenRouter 收录的 Artificial Analysis 综合指数归一化换算。
                    </li>
                    <li>
                      <strong className="text-slate-800">第三优先级（子项/DA 估算）</strong>：
                      前两项均缺失时，结合 AA 代码（0.24~0.28）/ Agent（0.14~0.35）与 DesignArena（0.45）加权估算，且
                      <strong>封顶 72 分</strong>，防止缺主榜评测的新模型虚高排名前列。
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-slate-50 p-3.5">
                  <div className="mb-1.5 font-semibold text-slate-900">2. 缺失指标如何处理</div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    新发布模型常先有综合盲测分或 AA 综合指数，而代码、数学、复杂推理等分项基准尚未覆盖。本站
                    <strong>不把缺项按 0 分拉低综合分</strong>，也不猜测补值：表格与对比中缺项明确标注为「暂无」或「暂无数据」，并在按该列排序时自动排在末尾；若对比组内某一行全部模型均无数据，将自动折叠并提示。
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3.5">
                  <div className="mb-1.5 font-semibold text-slate-900">3. 当前榜单口径 & 性价比公式</div>
                  <p className="text-xs leading-relaxed text-slate-600">{snapshot.methodologyNote}</p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-amber-950">
                  <div className="mb-1 font-semibold">免责声明</div>
                  <p className="text-xs leading-relaxed">{snapshot.disclaimer}</p>
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
