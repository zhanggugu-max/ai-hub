import type { MetadataRoute } from 'next';
import { getLeaderboardSnapshots } from '@/lib/leaderboard/data-loader';
import { getSearchItems } from '@/lib/search/data-loader';

function toValidDate(raw?: string): Date | undefined {
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getLatestItemDate(
  items: Awaited<ReturnType<typeof getSearchItems>>
): Date | undefined {
  let latest: Date | undefined;
  for (const item of items) {
    const candidate = toValidDate(item.updatedAt) ?? toValidDate(item.publishedAt);
    if (candidate && (!latest || candidate > latest)) {
      latest = candidate;
    }
  }
  return latest;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://hailanai.cc'
  ).replace(/\/+$/, '');
  const [snapshots, items] = await Promise.all([
    getLeaderboardSnapshots(),
    getSearchItems(),
  ]);

  const leaderboardUpdated = toValidDate(snapshots.overall.updatedAt);
  const latestResourceDate = getLatestItemDate(items);
  const homeUpdated =
    leaderboardUpdated && latestResourceDate
      ? leaderboardUpdated > latestResourceDate
        ? leaderboardUpdated
        : latestResourceDate
      : leaderboardUpdated ?? latestResourceDate;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: homeUpdated,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: leaderboardUpdated,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nav`,
      lastModified: homeUpdated,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: homeUpdated,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/matcher`,
      lastModified: homeUpdated,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: latestResourceDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const resourceRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${baseUrl}/resources/${encodeURIComponent(item.id)}`,
    lastModified: toValidDate(item.updatedAt) ?? toValidDate(item.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...resourceRoutes];
}
