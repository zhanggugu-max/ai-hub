'use client';

import { CheckCircle2, ExternalLink, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/data/leaderboard/mock-data';
import {
  formatContextWindow,
  getBestCompareMetrics,
} from '@/lib/leaderboard/helpers';

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: LeaderboardEntry[];
  onRemove: (modelSlug: string) => void;
}

export function CompareDialog({
  open,
  onOpenChange,
  entries,
  onRemove,
}: CompareDialogProps) {
  const best = getBestCompareMetrics(entries);

  const highlightClass = (isBest: boolean) =>
    isBest
      ? 'inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700'
      : 'text-slate-800';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>多模型横向对比（{entries.length} 个模型）</DialogTitle>
          <DialogDescription>
            绿色高亮代表当前对比组内该维度最优表现（最高分 / 最长上下文 / 最低单价）。
          </DialogDescription>
        </DialogHeader>

        {entries.length < 2 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            请至少保留 2 个模型进行横向对比。
          </div>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="w-36 p-3 text-left font-medium text-slate-500">对比维度</th>
                  {entries.map((entry) => (
                    <th key={entry.modelSlug} className="min-w-[150px] p-3 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">{entry.modelName}</div>
                          <div className="text-xs font-normal text-slate-500">
                            {entry.provider}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(entry.modelSlug)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          aria-label={`从对比中移除 ${entry.modelName}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 tabular-nums">
                <tr>
                  <td className="p-3 font-medium text-slate-600">协议类型</td>
                  {entries.map((e) => (
                    <td key={e.modelSlug} className="p-3">
                      <Badge
                        variant="secondary"
                        className={
                          e.licenseType === 'open_weights'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }
                      >
                        {e.licenseLabel}
                      </Badge>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">综合能力分</td>
                  {entries.map((e) => {
                    const isBest = best.maxOverall !== null && e.scores.overall === best.maxOverall;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {e.scores.overall.toFixed(1)}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">代码能力分</td>
                  {entries.map((e) => {
                    const val = e.scores.coding;
                    const isBest =
                      val !== undefined && best.maxCoding !== null && val === best.maxCoding;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {val !== undefined ? val.toFixed(1) : '-'}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">数学推理分</td>
                  {entries.map((e) => {
                    const val = e.scores.math;
                    const isBest =
                      val !== undefined && best.maxMath !== null && val === best.maxMath;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {val !== undefined ? val.toFixed(1) : '-'}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">复杂推理分</td>
                  {entries.map((e) => {
                    const val = e.scores.reasoning;
                    const isBest =
                      val !== undefined &&
                      best.maxReasoning !== null &&
                      val === best.maxReasoning;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {val !== undefined ? val.toFixed(1) : '-'}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">上下文窗口</td>
                  {entries.map((e) => {
                    const isBest =
                      best.maxContextK !== null && e.contextWindowK === best.maxContextK;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {formatContextWindow(e.contextWindowK)}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">API 输入单价 (/1M)</td>
                  {entries.map((e) => {
                    const val = e.pricing?.inputPer1MUsd;
                    const isBest =
                      val !== undefined &&
                      best.minInputPrice !== null &&
                      val === best.minInputPrice;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {val !== undefined ? `$${val.toFixed(2)}` : '-'}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">API 输出单价 (/1M)</td>
                  {entries.map((e) => {
                    const val = e.pricing?.outputPer1MUsd;
                    const isBest =
                      val !== undefined &&
                      best.minOutputPrice !== null &&
                      val === best.minOutputPrice;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {val !== undefined ? `$${val.toFixed(2)}` : '-'}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">输出吞吐参考</td>
                  {entries.map((e) => {
                    const val = e.speedTokensPerSec;
                    const isBest =
                      val !== undefined && best.maxSpeed !== null && val === best.maxSpeed;
                    return (
                      <td key={e.modelSlug} className="p-3">
                        <span className={highlightClass(isBest)}>
                          {val !== undefined ? `${val} tok/s` : '-'}
                          {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="p-3 font-medium text-slate-600">官方入口</td>
                  {entries.map((e) => (
                    <td key={e.modelSlug} className="p-3">
                      <a
                        href={e.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                      >
                        查看详情
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
