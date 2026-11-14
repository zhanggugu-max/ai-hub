import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/data/leaderboard/mock-data';
import {
  extractEvalConfig,
  formatContextWindow,
  formatExactContextTokens,
  getDetailLinkLabel,
  getScoreSourceInfo,
  getVisibleHighlights,
} from '@/lib/leaderboard/helpers';
import { RankDeltaBadge } from './RankDeltaBadge';

interface LeaderboardTopCardProps {
  entry: LeaderboardEntry;
}

const RANK_BADGE_STYLES: Record<number, string> = {
  1: 'bg-amber-100 text-amber-800 border-amber-300',
  2: 'bg-slate-200 text-slate-800 border-slate-300',
  3: 'bg-orange-100 text-orange-800 border-orange-300',
};

/**
 * 榜单 Top 模型速览卡片（供首页 LeaderboardPreview 等摘要场景复用）
 */
export function LeaderboardTopCard({ entry }: LeaderboardTopCardProps) {
  const rankBadgeStyle =
    RANK_BADGE_STYLES[entry.rank] ?? 'bg-slate-100 text-slate-800 border-slate-200';
  const scoreSource = getScoreSourceInfo(entry);
  const detailLabel = getDetailLinkLabel(entry.officialUrl);
  const evalConfig = extractEvalConfig(entry);
  const visibleHighlights = getVisibleHighlights(entry.highlights, 2);

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-blue-300">
      <div>
        {/* 顶部：排名 + 升降趋势 + 官方外链 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold tabular-nums ${rankBadgeStyle}`}
            >
              #{entry.rank}
            </span>
            <RankDeltaBadge delta={entry.rankDelta} />
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

          <a
            href={entry.officialUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
            aria-label={`查看 ${entry.modelName} 的 ${detailLabel}`}
            title={detailLabel}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* 模型名与机构 */}
        <div className="mt-3.5">
          <h3 className="text-base font-bold text-slate-900">{entry.modelName}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{entry.provider}</p>
        </div>

        {/* 特性标签与测试配置 */}
        {(evalConfig || visibleHighlights.length > 0) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {evalConfig && (
              <span
                className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                title="来源数据中记录的推理 / 测试配置档位"
              >
                测试配置：{evalConfig}
              </span>
            )}
            {visibleHighlights.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 底部指标对比 */}
      <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3.5">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">综合能力分</span>
            <span
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
              title={scoreSource.detail}
            >
              {scoreSource.shortLabel}
            </span>
          </div>
          <span className="text-base font-bold tabular-nums text-blue-600">
            {entry.scores.overall.toFixed(1)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${Math.min(100, Math.max(0, entry.scores.overall))}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="rounded-lg bg-slate-50 py-1.5">
            <div className="text-[11px] text-slate-400">代码分</div>
            <div className="font-semibold tabular-nums text-slate-800">
              {entry.scores.coding !== undefined ? entry.scores.coding.toFixed(1) : '暂无'}
            </div>
          </div>
          <div
            className="rounded-lg bg-slate-50 py-1.5"
            title={formatExactContextTokens(entry.contextWindowK)}
          >
            <div className="text-[11px] text-slate-400">上下文</div>
            <div className="font-semibold tabular-nums text-slate-800">
              {formatContextWindow(entry.contextWindowK)}
            </div>
          </div>
          <div
            className="rounded-lg bg-slate-50 py-1.5"
            title="API 输入价格单位：美元 / 百万 Token"
          >
            <div className="text-[11px] text-slate-400">输入价格</div>
            <div className="font-semibold tabular-nums text-slate-800">
              {entry.pricing ? `$${entry.pricing.inputPer1MUsd.toFixed(2)}` : '暂无'}
            </div>
            <div className="text-[9px] text-slate-400">美元/百万Token</div>
          </div>
        </div>
      </div>
    </article>
  );
}
