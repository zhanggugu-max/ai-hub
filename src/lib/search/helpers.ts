import type {
  SearchFilterState,
  SearchItem,
  SearchItemType,
  SearchTimeRange,
} from '@/data/search/mock-data';

export const DEFAULT_SEARCH_FILTERS: SearchFilterState = {
  q: '',
  type: 'all',
  tags: [],
  source: 'all',
  timeRange: 'all',
  sort: 'relevance',
};

const TIME_RANGE_DAYS: Record<Exclude<SearchTimeRange, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

/** 校验是否为有效外部 HTTP(S) 链接（过滤空值及 example.com 占位域名） */
export function isRealExternalUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return !/(^|\.)example\.com$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

/** 固定 UTC+8 日期格式化，避免 SSR/CSR 水合不一致 */
export function formatSearchDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

/** 根据条目生成确定性参考时间戳，避免 Next.js Cache Components / React 纯度报错 */
export function getDeterministicAnchorMs(items: SearchItem[]): number {
  let latest = 0;
  for (const item of items) {
    const t = Date.parse(item.updatedAt);
    if (!Number.isNaN(t) && t > latest) {
      latest = t;
    }
  }
  return latest > 0 ? latest : Date.parse('2026-11-12T12:00:00+08:00');
}

/** 提取不重复的来源列表 */
export function getUniqueSources(items: SearchItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.source))).sort((a, b) =>
    a.localeCompare(b, 'zh-CN')
  );
}

/** 统计全部标签出现频次并按频次降序 */
export function getTagCounts(items: SearchItem[]): { tag: string; count: number }[] {
  const counter = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counter.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

/** 统计各分类条目数 */
export function getTypeCounts(
  items: SearchItem[]
): Record<'all' | SearchItemType, number> {
  const counts: Record<'all' | SearchItemType, number> = {
    all: items.length,
    tool: 0,
    model: 0,
    tutorial: 0,
    paper: 0,
    prompt: 0,
  };
  for (const item of items) {
    counts[item.type] += 1;
  }
  return counts;
}

const SEARCH_PHRASE_SYNONYMS: Array<{ phrase: string; terms: string[] }> = [
  {
    phrase: '写代码',
    terms: ['写代码', '代码', '编程', 'coding', 'code', 'cursor', 'copilot', 'ide', '单元测试'],
  },
  {
    phrase: '做 ppt',
    terms: ['做 ppt', 'ppt', '演示', '幻灯片', '大纲', '文档', 'prd', '汇报'],
  },
  {
    phrase: '做ppt',
    terms: ['做ppt', 'ppt', '演示', '幻灯片', '大纲', '文档', 'prd', '汇报'],
  },
  {
    phrase: '读论文',
    terms: ['读论文', '论文', 'arxiv', '文献', '研读', 'pdf', '科研'],
  },
  {
    phrase: '做视频',
    terms: ['做视频', '视频', '多模态', 'kling', 'runway', 'veo', 'sora', '剪辑', '视觉'],
  },
  {
    phrase: '自动化办公',
    terms: ['自动化办公', '自动化', '办公', '工作流', 'workflow', 'dify', 'n8n', 'coze', 'bot'],
  },
];

const SEARCH_TOKEN_SYNONYMS: Record<string, string[]> = {
  ppt: ['ppt', '演示', '幻灯片', '大纲', '文档', 'prd', '汇报'],
  论文: ['论文', 'arxiv', '文献', '研读', 'pdf', '科研'],
  视频: ['视频', '多模态', 'kling', 'runway', 'veo', 'sora', '剪辑', '视觉'],
  编程: ['编程', '代码', 'coding', 'code', 'cursor', 'ide'],
  代码: ['代码', '编程', 'coding', 'code', 'cursor', 'ide'],
  自动化: ['自动化', '办公', '工作流', 'workflow', 'dify', 'n8n', 'coze'],
};

/** 拆词工具：按空白拆分为去重小写关键词 */
export function tokenizeSearchQuery(query: string): string[] {
  return Array.from(
    new Set(
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
    )
  );
}

/** 将搜索词解析为“每组内部 OR、组间 AND”的检索同义词组，确保新手高频场景词不返回空结果 */
export function buildSearchTokenGroups(query: string): string[][] {
  let remaining = query.trim().toLowerCase();
  if (!remaining) return [];

  const groups: string[][] = [];
  for (const entry of SEARCH_PHRASE_SYNONYMS) {
    if (remaining.includes(entry.phrase)) {
      groups.push(entry.terms);
      remaining = remaining.replaceAll(entry.phrase, ' ').trim();
    }
  }

  for (const token of tokenizeSearchQuery(remaining)) {
    const mapped = SEARCH_TOKEN_SYNONYMS[token];
    groups.push(mapped ? mapped : [token]);
  }

  return groups;
}

/** 计算简单相关性得分（标题权重 > 标签 > 原题/作者/来源 > 摘要） */
export function computeRelevanceScore(
  item: SearchItem,
  tokensOrGroups: string[] | string[][]
): number {
  if (tokensOrGroups.length === 0) return 0;

  const groups: string[][] = Array.isArray(tokensOrGroups[0])
    ? (tokensOrGroups as string[][])
    : (tokensOrGroups as string[]).map((t) => [t]);

  const title = item.title.toLowerCase();
  const originalTitle = (item.originalTitle ?? '').toLowerCase();
  const desc = item.description.toLowerCase();
  const tags = item.tags.join(' ').toLowerCase();
  const meta = `${item.source} ${item.author}`.toLowerCase();

  let score = 0;
  for (const group of groups) {
    let bestGroupScore = 0;
    for (let idx = 0; idx < group.length; idx += 1) {
      const term = group[idx];
      const weight = idx === 0 ? 1 : 0.7;
      let termScore = 0;
      if (title.includes(term)) termScore += 10 * weight;
      if (originalTitle.includes(term)) termScore += 7 * weight;
      if (tags.includes(term)) termScore += 6 * weight;
      if (meta.includes(term)) termScore += 4 * weight;
      if (desc.includes(term)) termScore += 3 * weight;
      if (termScore > bestGroupScore) bestGroupScore = termScore;
    }
    score += bestGroupScore;
  }
  return score;
}

/** 多维筛选 + 排序 */
export function filterAndSortSearchItems(
  items: SearchItem[],
  filters: SearchFilterState,
  anchorNowMs: number,
  options?: {
    favoritesOnly?: boolean;
    favoriteIds?: Set<string>;
  }
): SearchItem[] {
  const tokenGroups = buildSearchTokenGroups(filters.q);
  const cutoffMs =
    filters.timeRange === 'all'
      ? null
      : anchorNowMs - TIME_RANGE_DAYS[filters.timeRange] * 24 * 60 * 60 * 1000;

  const matched = items.filter((item) => {
    if (filters.type !== 'all' && item.type !== filters.type) {
      return false;
    }

    if (filters.source !== 'all' && item.source !== filters.source) {
      return false;
    }

    if (filters.tags.length > 0) {
      // 多选标签采用 AND 精准交集，或包含全部选中标签
      const hasAllTags = filters.tags.every((tag) => item.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    if (cutoffMs !== null) {
      const publishedMs = Date.parse(item.publishedAt);
      if (!Number.isNaN(publishedMs) && publishedMs < cutoffMs) {
        return false;
      }
    }

    if (options?.favoritesOnly && options.favoriteIds && !options.favoriteIds.has(item.id)) {
      return false;
    }

    if (tokenGroups.length > 0) {
      const haystack = `${item.title} ${item.originalTitle ?? ''} ${item.description} ${item.tags.join(' ')} ${item.source} ${item.author}`.toLowerCase();
      const allMatched = tokenGroups.every((group) =>
        group.some((candidate) => haystack.includes(candidate))
      );
      if (!allMatched) {
        return false;
      }
    }

    return true;
  });

  return [...matched].sort((a, b) => {
    if (filters.sort === 'relevance' && tokenGroups.length > 0) {
      const scoreDiff =
        computeRelevanceScore(b, tokenGroups) -
        computeRelevanceScore(a, tokenGroups);
      if (scoreDiff !== 0) return scoreDiff;
    }

    // 默认或并列时按最新更新时间/发布时间降序
    return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  });
}

export interface HighlightSegment {
  text: string;
  matched: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 安全关键词高亮分段（纯字符串切分 + React 节点渲染，绝不使用 dangerouslySetInnerHTML）
 */
export function splitHighlightSegments(
  text: string,
  query: string
): HighlightSegment[] {
  const tokenGroups = buildSearchTokenGroups(query);
  const tokens = Array.from(new Set(tokenGroups.flat()));
  if (tokens.length === 0 || !text) {
    return [{ text, matched: false }];
  }

  // 长词优先匹配，避免短词截断长词高亮
  const sortedTokens = [...tokens].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sortedTokens.map(escapeRegExp).join('|')})`, 'gi');
  const rawParts = text.split(pattern);

  return rawParts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      matched: sortedTokens.some((token) => part.toLowerCase() === token),
    }));
}

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds: number;
  nextTimestamps: number[];
}

/**
 * 滑动窗口客户端限流校验（预留与服务端 429 Too Many Requests 对接）
 * 例如：5 秒窗口内最多允许 8 次高频操作，超出则拦截并提示用户稍候。
 */
export function checkSlidingWindowRateLimit(
  historyTimestamps: number[],
  nowMs: number,
  maxRequests = 8,
  windowMs = 5000
): RateLimitCheckResult {
  const validWindow = historyTimestamps.filter((ts) => nowMs - ts < windowMs);
  if (validWindow.length >= maxRequests) {
    const oldestInWindow = validWindow[0] ?? nowMs;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowMs - (nowMs - oldestInWindow)) / 1000)
    );
    return {
      allowed: false,
      retryAfterSeconds,
      nextTimestamps: validWindow,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    nextTimestamps: [...validWindow, nowMs],
  };
}
