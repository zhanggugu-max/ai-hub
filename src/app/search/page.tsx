import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getSearchItems } from '@/lib/search/data-loader';
import { SearchClient } from '@/components/search/SearchClient';
import { getSiteUrl } from '@/lib/site-url';

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: '全网 AI 资料极速搜索 - AI 导航 | AI 智搜',
  description:
    '一站式搜索 AI 工具、开源模型、实战教程、前沿论文与提示词模板，支持多维筛选、来源溯源与中英双语检索。',
  alternates: {
    canonical: '/search',
  },
};

function SearchSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-44 w-full animate-pulse rounded-2xl bg-slate-200" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="h-96 w-full animate-pulse rounded-2xl bg-slate-200 lg:w-72" />
        <div className="flex-1 space-y-4">
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="h-44 w-full animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-44 w-full animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage() {
  const items = await getSearchItems();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '全网 AI 资料极速搜索 | AI 智搜',
    description:
      '聚合 AI 工具、模型、教程、论文与提示词模板的中文优先搜索中心。',
    url: `${baseUrl}/search`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
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
        <Suspense fallback={<SearchSkeleton />}>
          <SearchClient items={items} />
        </Suspense>
      </div>
    </main>
  );
}
