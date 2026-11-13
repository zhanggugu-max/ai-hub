import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getRelatedResources,
  getResourceBySlug,
  getSearchItems,
} from '@/lib/search/data-loader';
import { ResourceHeader } from '@/components/resources/ResourceHeader';
import { MarkdownRenderer } from '@/components/resources/MarkdownRenderer';
import { ResourceSidebar } from '@/components/resources/ResourceSidebar';
import { RelatedResources } from '@/components/resources/RelatedResources';
import { ServiceSupportCard } from '@/components/monetization/ServiceSupportCard';
import { getSiteUrl } from '@/lib/site-url';

const baseUrl = getSiteUrl();

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

function decodeSlugSafe(rawSlug: string): string {
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return rawSlug;
  }
}

export async function generateStaticParams() {
  const items = await getSearchItems();
  return items.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeSlugSafe(rawSlug);
  const item = await getResourceBySlug(slug);

  if (!item) {
    return {
      title: '未找到该资料 | AI 智搜',
      description: '请求的 AI 资料条目不存在或尚未发布。',
    };
  }

  return {
    metadataBase: new URL(baseUrl),
    title: `${item.title} | AI 智搜`,
    description: item.description,
    keywords: item.tags,
    alternates: {
      canonical: `/resources/${encodeURIComponent(item.id)}`,
    },
    openGraph: {
      title: item.title,
      description: item.description,
      type: 'article',
      publishedTime: item.publishedAt,
      modifiedTime: item.updatedAt,
      tags: item.tags,
    },
  };
}

function ResourceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-56 w-full animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-[460px] animate-pulse rounded-2xl bg-slate-200 lg:col-span-8" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200 lg:col-span-4" />
      </div>
    </div>
  );
}

async function ResourceDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlugSafe(rawSlug);
  const item = await getResourceBySlug(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedResources(item, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': item.type === 'tool' ? 'SoftwareApplication' : 'TechArticle',
    name: item.title,
    headline: item.title,
    description: item.description,
    author: {
      '@type': 'Person',
      name: item.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI 智搜 (AISearchHub)',
    },
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    keywords: item.tags.join(', '),
    mainEntityOfPage: `${baseUrl}/resources/${encodeURIComponent(item.id)}`,
    sameAs: item.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="space-y-6">
        <ResourceHeader item={item} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <MarkdownRenderer
              content={item.content}
              description={item.description}
              externalUrl={item.url}
            />
          </div>

          <div className="lg:col-span-4">
            <ResourceSidebar item={item} />
          </div>
        </div>

        <RelatedResources items={relatedItems} />

        <ServiceSupportCard />
      </div>
    </>
  );
}

export default function ResourcePage({ params }: ResourcePageProps) {
  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Suspense fallback={<ResourceDetailSkeleton />}>
          <ResourceDetailContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
