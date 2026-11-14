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
import {
  extractSourceReleaseDate,
  formatUpdatedTime,
} from '@/lib/leaderboard/helpers';

interface SourceMetaBannerProps {
  snapshot: LeaderboardSnapshot;
}

const DATA_SOURCES = [
  { label: 'LiveBench 2.0 官网', url: 'https://livebench.ai/#/' },
  { label: 'LiveBench GitHub', url: 'https://github.com/LiveBench/LiveBench' },
  { label: 'OpenRouter 模型目录', url: 'https://openrouter.ai/models' },
];

export function SourceMetaBanner({ snapshot }: SourceMetaBannerProps) {
  const formattedTime = formatUpdatedTime(snapshot.updatedAt);
  const sourceReleaseDate = extractSourceReleaseDate(snapshot.sourceName);

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

          {sourceReleaseDate && (
            <div className="inline-flex items-center gap-1.5 text-slate-700">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>来源数据版本：</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium tabular-nums text-slate-800">
                LiveBench {sourceReleaseDate}
              </span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 text-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>本站最近同步：</span>
            <time dateTime={snapshot.updatedAt} className="font-medium tabular-nums text-slate-900">
              {formattedTime} (UTC+8)
            </time>
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
                  <div className="mb-1.5 font-semibold text-slate-900">1. LiveBench 2.0 评测体系与权重</div>
                  <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600">
                    <li>
                      <strong className="text-slate-800">主榜综合分</strong>：
                      直接抓取自 LiveBench 2.0 官方最新公开数据集（<code>table.csv</code> 与 <code>categories.json</code>），按官方加权平均计算：
                      <strong>Long Agentic (×2)</strong>、<strong>Coding (×1.5)</strong>、<strong>Design (×1.5)</strong>，以及 Reasoning / Browser / Data Analysis / Research（其余各 ×1）。
                    </li>
                    <li>
                      <strong className="text-slate-800">无污染真实任务</strong>：
                      采用定期更新的非公开长程实战题目，覆盖研究报告、复杂代码修复、浏览交互与长周期 Agent 执行，避免主观聊天偏好导致的旧模型虚高。
                    </li>
                    <li>
                      <strong className="text-slate-800">定价与上下文补充</strong>：
                      API 输入/输出单价直接取自 LiveBench 官方 <code>cost.csv</code>；模型上下文长度、Slug 与官方发布链接结合 OpenRouter 目录与 LiveBench 清单核对。
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-slate-50 p-3.5">
                  <div className="mb-1.5 font-semibold text-slate-900">2. 缺失指标如何处理</div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    LiveBench 2.0 官方若某维度尚在重测（标注为 <code>—</code>），计算加权总分时按官方规则跳过该维度、仅对已测维度加权平均，不补零拉低总分；界面中未测维度标注为「暂无」或「暂无数据」，在对比表中全空行会自动折叠提示。
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

      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-500">
        <p>
          <span className="font-medium text-slate-700">评分口径：</span>
          {snapshot.methodologyNote}
        </p>
        <p className="text-[11px] text-slate-500">
          <span className="font-medium text-slate-700">指标说明：</span>
          综合能力分（LiveBench 2.0 加权汇总）、代码分（Coding 单项得分）、上下文（OpenRouter / 官方标称最大 Token 窗口）、价格单位（美元／百万 Token，即 USD / 1M Tokens）；来源未记录的数据显示为「暂无」或「—」。
        </p>
      </div>
    </section>
  );
}
