import Link from 'next/link';
import type { Metadata } from 'next';
import { getLeaderboardSnapshots } from '@/lib/leaderboard/data-loader';
import { getSearchItems } from '@/lib/search/data-loader';
import { HeroSection } from '@/components/home/HeroSection';
import { LeaderboardPreview } from '@/components/home/LeaderboardPreview';
import { HotTools } from '@/components/home/HotTools';
import { LatestResources } from '@/components/home/LatestResources';
import { getSiteUrl } from '@/lib/site-url';

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'AI 智搜 - 全网 AI 资料聚合搜索、大模型能力榜单与工具指南',
  description:
    '面向开发者、产品经理与 AI 学习者的一站式 AI 导航与资料库：极速检索工具、模型、论文、教程与提示词，追踪主流模型能力榜单与 API 性价比。',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI 智搜 - 全网 AI 资料聚合搜索、大模型能力榜单与工具指南',
    description:
      '快速搜集、筛选、对比各类 AI 资料，查看大模型能力榜单定时更新与实战工具教程。',
    url: baseUrl,
    siteName: 'AI 智搜',
    locale: 'zh_CN',
    type: 'website',
  },
};

export default async function HomePage() {
  const [snapshots, searchItems] = await Promise.all([
    getLeaderboardSnapshots(),
    getSearchItems(),
  ]);

  const hotTools = searchItems.filter((item) => item.type === 'tool').slice(0, 6);
  const latestResources = searchItems
    .filter((item) => item.type !== 'tool')
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 6);
  const hasMockNotice =
    snapshots.overall.isMockData || searchItems.some((item) => item.isMockData);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI 智搜',
    url: baseUrl,
    description:
      '中文优先的 AI 资料聚合搜索站、大模型能力排行榜追踪与 AI 工具使用操作库。',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <HeroSection />

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        <LeaderboardPreview snapshot={snapshots.overall} />
        <HotTools tools={hotTools} />
        <LatestResources items={latestResources} />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs leading-relaxed text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-1">
            <p className="font-semibold text-slate-700">AI 智搜 · 合规与数据声明</p>
            <p>
              本站仅索引公开 AI 资料元数据、自编中文摘要与原文外链，不抓取或存储第三方全文内容；排行榜采用定时同步与缓存机制并标注来源与更新时间，不承诺毫秒级实时性。
              {hasMockNotice && '（当前触发降级回退：展示本地 Mock 占位数据）'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 font-medium text-slate-700">
            <Link href="/search" className="hover:text-blue-600">
              资料搜索
            </Link>
            <Link href="/leaderboard" className="hover:text-blue-600">
              能力排行榜
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
