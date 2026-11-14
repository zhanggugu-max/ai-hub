import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardSnapshot } from '@/data/leaderboard/mock-data';
import {
  extractSourceReleaseDate,
  formatUpdatedTime,
} from '@/lib/leaderboard/helpers';
import { LeaderboardTopCard } from '@/components/leaderboard/LeaderboardTopCard';
import { LeaderboardShareButton } from '@/components/leaderboard/LeaderboardShareButton';

interface LeaderboardPreviewProps {
  snapshot: LeaderboardSnapshot;
}

export function LeaderboardPreview({ snapshot }: LeaderboardPreviewProps) {
  const topThree = snapshot.entries.slice(0, 3);
  const sourceReleaseDate = extractSourceReleaseDate(snapshot.sourceName);

  return (
    <section aria-labelledby="home-leaderboard-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="home-leaderboard-heading"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>AI 大模型综合能力 Top 3</span>
            </h2>
            {snapshot.isMockData && (
              <Badge className="gap-1 border-amber-200 bg-amber-50 text-xs text-amber-800 hover:bg-amber-50">
                <AlertTriangle className="h-3 w-3" />
                Mock 示例数据
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {sourceReleaseDate && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                来源数据：{sourceReleaseDate}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              本站最近同步：{formatUpdatedTime(snapshot.updatedAt)} (UTC+8)
            </span>
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>来源：</span>
              <a
                href={snapshot.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-0.5 font-medium text-blue-600 underline-offset-4 hover:underline"
              >
                <span>{snapshot.sourceName}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LeaderboardShareButton snapshot={snapshot} />
          <Link
            href="/leaderboard?board=api_value"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            API 性价比榜
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-600"
          >
            <span>查看完整榜单</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topThree.map((entry) => (
          <LeaderboardTopCard key={entry.id} entry={entry} />
        ))}
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        指标说明：综合能力分与代码分取自公开基准（含测试配置档位标识），价格单位均为「美元／百万 Token」，未公布维度显示为「暂无」或「—」。
      </p>
    </section>
  );
}
