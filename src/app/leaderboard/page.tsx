import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getLeaderboardSnapshots } from '@/lib/leaderboard/data-loader';
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient';
import { getSiteUrl } from '@/lib/site-url';

/**
 * Next.js 16 Cache Components 已启用（next.config.ts）。
 * 后续接入 Supabase 时，可在 data-loader.ts 中使用 `"use cache"` + `cacheLife` 控制定时刷新策略。
 */

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'AI 大模型能力排行榜与 API 性价比对比',
  description:
    '聚合 AI 模型综合能力榜、开源权重模型榜与 API 价格/吞吐对比，支持多维度筛选、更新时间溯源与最多 4 个模型横向对比。',
  alternates: {
    canonical: '/leaderboard',
  },
};

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-14 w-full animate-pulse rounded-xl bg-slate-200" />
      <div className="h-24 w-full animate-pulse rounded-xl bg-slate-200" />
      <div className="h-80 w-full animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

export default async function LeaderboardPage() {
  const snapshots = await getLeaderboardSnapshots();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: snapshots.overall.title,
    description: snapshots.overall.description,
    url: `${baseUrl}/leaderboard`,
    dateModified: snapshots.overall.updatedAt,
    creator: {
      '@type': 'Organization',
      name: snapshots.overall.sourceName,
    },
  };

  return (
    <main className="min-h-screen bg-slate-50/70">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardClient snapshots={snapshots} />
        </Suspense>
      </div>
    </main>
  );
}
