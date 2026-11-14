import type { Metadata } from 'next';
import { getLeaderboardSnapshots } from '@/lib/leaderboard/data-loader';
import { getSearchItems } from '@/lib/search/data-loader';
import { HeroSection } from '@/components/home/HeroSection';
import { LeaderboardPreview } from '@/components/home/LeaderboardPreview';
import { HotTools } from '@/components/home/HotTools';
import { LatestResources } from '@/components/home/LatestResources';
import { SITE_BRAND } from '@/config/brand';
import { getSiteUrl } from '@/lib/site-url';

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    absolute: SITE_BRAND.defaultTitle,
  },
  description: SITE_BRAND.defaultDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_BRAND.defaultTitle,
    description: SITE_BRAND.defaultDescription,
    url: baseUrl,
    siteName: SITE_BRAND.name,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/brand/hailan-ai-logo-v2-white.png',
        width: 1024,
        height: 341,
        alt: SITE_BRAND.name,
      },
    ],
  },
};

export default async function HomePage() {
  const [snapshots, searchItems] = await Promise.all([
    getLeaderboardSnapshots(),
    getSearchItems(),
  ]);

  const hotTools = searchItems
    .filter((item) => item.type === 'tool')
    .sort((a, b) => b.favoriteCount - a.favoriteCount)
    .slice(0, 6);
  const latestResources = searchItems
    .filter((item) => item.type !== 'tool')
    .sort((a, b) => {
      const aBoost = a.source === 'AI-Hub 精选' ? 1 : 0;
      const bBoost = b.source === 'AI-Hub 精选' ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    })
    .slice(0, 6);
  const hasMockNotice =
    snapshots.overall.isMockData || searchItems.some((item) => item.isMockData);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_BRAND.name,
    alternateName: SITE_BRAND.positioning,
    url: baseUrl,
    description: SITE_BRAND.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="bg-slate-50/70">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <HeroSection />

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {hasMockNotice && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-xs text-amber-800">
            当前触发降级回退：展示本地 Mock 占位数据。
          </div>
        )}
        <LeaderboardPreview snapshot={snapshots.overall} />
        <HotTools tools={hotTools} />
        <LatestResources items={latestResources} />
      </main>
    </div>
  );
}
