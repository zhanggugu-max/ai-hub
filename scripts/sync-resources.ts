import { createClient } from '@supabase/supabase-js';
import { CURATED_RESOURCES, type CuratedResourceInput } from './data/curated-resources';

type ResourceType = 'tool' | 'model' | 'tutorial' | 'paper' | 'prompt';

interface ResourceSeedRow {
  slug: string;
  type: ResourceType;
  title: string;
  original_title: string | null;
  description: string;
  content: string;
  tags: string[];
  source: string;
  author: string;
  published_at: string;
  updated_at: string;
  url: string;
  favorite_count: number;
  credibility_label: string;
  is_mock_data: boolean;
  status: 'published';
  link_status: 'ok';
}

interface HfPaperItem {
  publishedAt?: string;
  numUpvotes?: number;
  paper?: {
    id?: string;
    title?: string;
    summary?: string;
    publishedAt?: string;
    authors?: Array<{ name?: string }>;
  };
}

interface GitHubRepoItem {
  id: number;
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  license?: { spdx_id?: string | null } | null;
  owner?: { login?: string };
}

interface DevToArticleItem {
  id: number;
  title: string;
  description: string | null;
  url: string;
  tag_list?: string[];
  reading_time_minutes?: number;
  positive_reactions_count?: number;
  published_at: string;
  user?: { name?: string };
}

function getSupabaseUrl(): string {
  const value = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error('Missing required environment variable: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  }
  return value;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toSlugSegment(input: string, maxLength = 48): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}

function formatCompactNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

function buildCuratedRows(nowIso: string): ResourceSeedRow[] {
  return CURATED_RESOURCES.map((item: CuratedResourceInput) => ({
    ...item,
    updated_at: nowIso,
    is_mock_data: false,
    status: 'published',
    link_status: 'ok',
  }));
}

async function fetchJsonWithTimeout<T>(url: string, headers: Record<string, string> = {}, timeoutMs = 12000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ai-hub-resource-sync/1.0',
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHfDailyPapers(nowIso: string, limit = 25): Promise<ResourceSeedRow[]> {
  const endpoints = [
    `https://huggingface.co/api/daily_papers?limit=${limit}`,
    `https://hf-mirror.com/api/daily_papers?limit=${limit}`,
  ];

  let items: HfPaperItem[] = [];
  for (const endpoint of endpoints) {
    try {
      const data = await fetchJsonWithTimeout<HfPaperItem[]>(endpoint);
      if (Array.isArray(data) && data.length > 0) {
        items = data;
        break;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`WARN: HF Daily Papers fetch failed for ${endpoint}: ${msg}`);
    }
  }

  return items
    .filter((entry) => entry.paper?.id && entry.paper?.title && entry.paper?.summary)
    .map((entry) => {
      const paper = entry.paper!;
      const arxivId = paper.id!.trim();
      const title = paper.title!.replace(/\s+/g, ' ').trim();
      const summary = paper.summary!.replace(/\s+/g, ' ').trim();
      const authors = (paper.authors ?? [])
        .map((a) => a.name?.trim())
        .filter((name): name is string => Boolean(name))
        .slice(0, 6);
      const publishedAt = entry.publishedAt ?? paper.publishedAt ?? nowIso;
      const upvotes = Number(entry.numUpvotes ?? 0);
      const arxivUrl = `https://arxiv.org/abs/${arxivId}`;
      const hfUrl = `https://huggingface.co/papers/${arxivId}`;

      return {
        slug: `paper-arxiv-${arxivId.replace(/[^a-zA-Z0-9.-]/g, '-')}`,
        type: 'paper',
        title,
        original_title: title,
        description: summary.length > 180 ? `${summary.slice(0, 177)}...` : summary,
        content: [
          `## 论文摘要（arXiv:${arxivId}）`,
          '',
          summary,
          '',
          '## 论文元数据',
          '',
          `- **arXiv ID**：\`${arxivId}\``,
          authors.length > 0 ? `- **主要作者**：${authors.join(', ')}` : '- **主要作者**：arXiv / Hugging Face Daily Papers',
          `- **发布时间**：${publishedAt.slice(0, 10)}`,
          `- **社区点赞**：${upvotes} upvotes`,
          '',
          '## 原文与讨论入口',
          '',
          `- arXiv 原文：[${arxivUrl}](${arxivUrl})`,
          `- Hugging Face Papers 页面：[${hfUrl}](${hfUrl})`,
        ].join('\n'),
        tags: ['论文精读', 'Hugging Face', '前沿研究'],
        source: 'Hugging Face Daily Papers',
        author: authors[0] ?? 'Hugging Face Community',
        published_at: publishedAt,
        updated_at: nowIso,
        url: arxivUrl,
        favorite_count: Math.min(340, 120 + upvotes),
        credibility_label: '论文原文',
        is_mock_data: false,
        status: 'published',
        link_status: 'ok',
      };
    });
}

function mapGitHubTags(repo: GitHubRepoItem): string[] {
  const tags = new Set<string>(['开源项目']);
  const topicText = [...(repo.topics ?? []), repo.description ?? '', repo.name].join(' ').toLowerCase();
  if (topicText.includes('agent') || topicText.includes('workflow')) tags.add('Agent');
  if (topicText.includes('rag') || topicText.includes('vector') || topicText.includes('knowledge')) tags.add('RAG');
  if (topicText.includes('code') || topicText.includes('ide') || topicText.includes('copilot')) tags.add('代码助手');
  if (topicText.includes('inference') || topicText.includes('serving') || topicText.includes('ollama')) tags.add('推理部署');
  if (topicText.includes('ui') || topicText.includes('chat')) tags.add('效率工具');
  return Array.from(tags).slice(0, 4);
}

async function fetchGitHubTopAiTools(nowIso: string): Promise<ResourceSeedRow[]> {
  const queries = [
    'https://api.github.com/search/repositories?q=topic:ai-agent+stars:>8000&sort=stars&order=desc&per_page=25',
  ];

  const headers: Record<string, string> = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const repoMap = new Map<number, GitHubRepoItem>();
  for (const url of queries) {
    try {
      const payload = await fetchJsonWithTimeout<{ items?: GitHubRepoItem[] }>(url, headers);
      for (const item of payload.items ?? []) {
        if (!item.full_name || !item.html_url) continue;
        repoMap.set(item.id, item);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`WARN: GitHub search fetch failed for ${url}: ${msg}`);
    }
  }

  return Array.from(repoMap.values())
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 26)
    .map((repo) => {
      const desc = repo.description?.trim() || `${repo.full_name} 开源 AI 项目与开发工具仓库`;
      const topics = (repo.topics ?? []).slice(0, 6);
      const stars = formatCompactNumber(repo.stargazers_count);
      const forks = formatCompactNumber(repo.forks_count);
      const licenseName = repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : 'Open Source';

      return {
        slug: `gh-${toSlugSegment(repo.full_name, 56)}`,
        type: 'tool',
        title: `${repo.full_name}（★${stars}）：${desc.length > 48 ? `${desc.slice(0, 45)}...` : desc}`,
        original_title: repo.full_name,
        description: desc.length > 180 ? `${desc.slice(0, 177)}...` : desc,
        content: [
          `## 项目概览：${repo.full_name}`,
          '',
          desc,
          '',
          '## 仓库关键指标',
          '',
          `- **GitHub Stars**：${repo.stargazers_count.toLocaleString('en-US')}（Forks: ${forks}）`,
          `- **主要语言**：${repo.language ?? '多语言 / Markdown'}`,
          `- **开源协议**：${licenseName}`,
          `- **最近代码推送**：${repo.pushed_at.slice(0, 10)}`,
          topics.length > 0 ? `- **技术标签**：${topics.map((t) => `\`${t}\``).join('、')}` : '',
          '',
          '## 快速克隆与文档入口',
          '',
          '```bash',
          `git clone ${repo.html_url}.git`,
          '```',
          '',
          `- 官方仓库地址：[${repo.html_url}](${repo.html_url})`,
        ]
          .filter(Boolean)
          .join('\n'),
        tags: mapGitHubTags(repo),
        source: 'GitHub Trending AI',
        author: repo.owner?.login ?? repo.full_name.split('/')[0],
        published_at: repo.pushed_at ?? nowIso,
        updated_at: nowIso,
        url: repo.html_url,
        favorite_count: Math.min(360, 150 + Math.floor(repo.stargazers_count / 1000)),
        credibility_label: '开源仓库',
        is_mock_data: false,
        status: 'published',
        link_status: 'ok',
      };
    });
}

async function fetchDevToAiTutorials(nowIso: string): Promise<ResourceSeedRow[]> {
  const endpoint = 'https://dev.to/api/articles?tag=ai&top=30&per_page=20';
  let articles: DevToArticleItem[] = [];
  try {
    const data = await fetchJsonWithTimeout<DevToArticleItem[]>(endpoint);
    if (Array.isArray(data)) {
      articles = data;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`WARN: Dev.to fetch failed for ${endpoint}: ${msg}`);
    return [];
  }

  return articles
    .filter((article) => article.title && article.url)
    .map((article) => {
      const desc = (article.description ?? article.title).replace(/\s+/g, ' ').trim();
      const rawTags = (article.tag_list ?? []).filter(Boolean).slice(0, 4);
      const readingTime = Number(article.reading_time_minutes ?? 5);
      const reactions = Number(article.positive_reactions_count ?? 0);
      const authorName = article.user?.name?.trim() || 'Dev.to Author';

      return {
        slug: `devto-${article.id}-${toSlugSegment(article.title, 40)}`,
        type: 'tutorial',
        title: article.title.trim(),
        original_title: article.title.trim(),
        description: desc.length > 180 ? `${desc.slice(0, 177)}...` : desc,
        content: [
          '## 英文实战专栏导读',
          '',
          desc,
          '',
          '## 文章参数',
          '',
          `- **作者**：${authorName}`,
          `- **预计阅读时长**：约 ${readingTime} 分钟`,
          `- **社区点赞**：${reactions} reactions`,
          `- **发布日期**：${article.published_at.slice(0, 10)}`,
          rawTags.length > 0 ? `- **原站标签**：${rawTags.map((t) => `\`#${t}\``).join(' ')}` : '',
          '',
          '## 阅读完整原文',
          '',
          `点击前往 Dev.to 查看代码片段与完整实践步骤：[${article.url}](${article.url})`,
        ]
          .filter(Boolean)
          .join('\n'),
        tags: ['教程', 'Dev.to', ...rawTags.slice(0, 2)],
        source: 'Dev.to AI 精选',
        author: authorName,
        published_at: article.published_at ?? nowIso,
        updated_at: nowIso,
        url: article.url,
        favorite_count: Math.min(310, 100 + Math.floor(reactions / 2)),
        credibility_label: '社区精选',
        is_mock_data: false,
        status: 'published',
        link_status: 'ok',
      };
    });
}

function deduplicateBySlug(rows: ResourceSeedRow[]): ResourceSeedRow[] {
  const seen = new Map<string, ResourceSeedRow>();
  for (const row of rows) {
    if (!seen.has(row.slug)) {
      seen.set(row.slug, row);
    }
  }
  return Array.from(seen.values());
}

async function main() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const nowIso = new Date().toISOString();

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const curatedRows = buildCuratedRows(nowIso);
  const [papers, githubTools, devtoTutorials] = await Promise.all([
    fetchHfDailyPapers(nowIso, 25),
    fetchGitHubTopAiTools(nowIso),
    fetchDevToAiTutorials(nowIso),
  ]);

  const rows = deduplicateBySlug([...curatedRows, ...githubTools, ...devtoTutorials, ...papers]);

  console.log(
    `Prepared ${rows.length} unique rows (curated=${curatedRows.length}, github=${githubTools.length}, devto=${devtoTutorials.length}, hfPapers=${papers.length})`
  );

  // Batch upsert in chunks of 40 so payload stays small and predictable
  for (let i = 0; i < rows.length; i += 40) {
    const batch = rows.slice(i, i + 40);
    const { error } = await supabase.from('ai_resources').upsert(batch, { onConflict: 'slug' });
    if (error) {
      throw new Error(`Upsert ai_resources batch [${i}..${i + batch.length}] failed: ${error.message}`);
    }
  }

  const { data: publishedRows, error: countError } = await supabase
    .from('ai_resources')
    .select('slug, type')
    .eq('status', 'published');

  if (countError) {
    throw new Error(`Verification query failed: ${countError.message}`);
  }

  const byType: Record<string, number> = {};
  for (const row of publishedRows ?? []) {
    byType[row.type] = (byType[row.type] ?? 0) + 1;
  }

  console.log('Published ai_resources summary:', {
    totalPublished: publishedRows?.length ?? 0,
    byType,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
