import { cacheLife } from 'next/cache';
import {
  MOCK_SEARCH_ITEMS,
  type SearchItem,
  type SearchItemType,
} from '@/data/search/mock-data';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface DbResourceRow {
  slug: string;
  type: SearchItemType;
  title: string;
  original_title: string | null;
  description: string;
  content?: string | null;
  tags: string[] | null;
  source: string;
  author: string;
  published_at: string;
  updated_at: string;
  url: string;
  favorite_count: number;
  credibility_label: string;
  is_mock_data: boolean;
}

const SEARCHABLE_TYPES: SearchItemType[] = [
  'tool',
  'model',
  'tutorial',
  'paper',
  'prompt',
];

const LIST_SELECT_COLUMNS =
  'slug, type, title, original_title, description, tags, source, author, published_at, updated_at, url, favorite_count, credibility_label, is_mock_data';

const DETAIL_SELECT_COLUMNS = `${LIST_SELECT_COLUMNS}, content`;

function mapDbRowToSearchItem(row: DbResourceRow): SearchItem {
  return {
    id: row.slug,
    type: row.type,
    title: row.title,
    originalTitle: row.original_title ?? undefined,
    description: row.description,
    content: row.content ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    source: row.source,
    author: row.author,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    url: row.url,
    favoriteCount: row.favorite_count ?? 0,
    credibilityLabel: row.credibility_label,
    isFavorited: false,
    isMockData: Boolean(row.is_mock_data),
  };
}

/**
 * 服务端读取全站搜索资料集合（仅拉取摘要元数据，避免大字段 content 拖慢列表性能）。
 */
export async function getSearchItems(): Promise<SearchItem[]> {
  'use cache';
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return MOCK_SEARCH_ITEMS;
  }

  try {
    const { data, error } = await supabase
      .from('ai_resources')
      .select(LIST_SELECT_COLUMNS)
      .eq('status', 'published')
      .in('type', SEARCHABLE_TYPES)
      .order('published_at', { ascending: false })
      .limit(400);

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('[search/data-loader] Supabase 读取失败，已降级 Mock:', error.message);
      }
      return MOCK_SEARCH_ITEMS;
    }

    return (data as DbResourceRow[]).map(mapDbRowToSearchItem);
  } catch (err) {
    console.warn(
      '[search/data-loader] 请求超时或异常，已降级 Mock:',
      err instanceof Error ? err.message : String(err)
    );
    return MOCK_SEARCH_ITEMS;
  }
}

/**
 * 服务端按 slug 获取单条资源完整详情（含 Markdown content 正文，异常/未配置时降级 Mock）。
 */
export async function getResourceBySlug(slug: string): Promise<SearchItem | null> {
  'use cache';
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });

  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return MOCK_SEARCH_ITEMS.find((item) => item.id === normalizedSlug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from('ai_resources')
      .select(DETAIL_SELECT_COLUMNS)
      .eq('slug', normalizedSlug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.warn(
        `[search/data-loader] 详情读取失败 (${normalizedSlug})，尝试降级 Mock:`,
        error.message
      );
      return MOCK_SEARCH_ITEMS.find((item) => item.id === normalizedSlug) ?? null;
    }

    if (!data) {
      return null;
    }

    return mapDbRowToSearchItem(data as DbResourceRow);
  } catch (err) {
    console.warn(
      `[search/data-loader] 详情请求超时或异常 (${normalizedSlug})，尝试降级 Mock:`,
      err instanceof Error ? err.message : String(err)
    );
    return MOCK_SEARCH_ITEMS.find((item) => item.id === normalizedSlug) ?? null;
  }
}

/**
 * 基于重合标签与同分类推荐站内相关资料。
 */
export async function getRelatedResources(
  current: SearchItem,
  limit = 3
): Promise<SearchItem[]> {
  const allItems = await getSearchItems();
  const currentTags = new Set(current.tags.map((tag) => tag.toLowerCase()));

  return allItems
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      let score = candidate.type === current.type ? 2 : 0;
      for (const tag of candidate.tags) {
        if (currentTags.has(tag.toLowerCase())) {
          score += 3;
        }
      }
      return { candidate, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Date.parse(b.candidate.publishedAt) - Date.parse(a.candidate.publishedAt);
    })
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
