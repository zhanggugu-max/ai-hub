import type {
  LeaderboardEntry,
  LeaderboardFilterState,
  LeaderboardSortKey,
} from '@/data/leaderboard/mock-data';

export const DEFAULT_FILTER_STATE: LeaderboardFilterState = {
  category: 'overall',
  search: '',
  license: 'all',
  provider: 'all',
  minContextK: 0,
  sortKey: 'rank',
  sortOrder: 'asc',
};

/** 格式化更新时间（固定使用简体中文 + 24小时制，避免水合时区歧义） */
export function formatUpdatedTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

/** 统一格式化上下文长度（消除 1M 与 1.0M 精度混用） */
export function formatContextWindow(contextK: number): string {
  if (contextK >= 1000) {
    const roundedTenth = Math.round((contextK / 1000) * 10) / 10;
    return Number.isInteger(roundedTenth) ? `${roundedTenth}M` : `${roundedTenth.toFixed(1)}M`;
  }
  return `${contextK}K`;
}

/** 格式化精确上下文 token 量（用于悬停提示与横向对比明细） */
export function formatExactContextTokens(contextK: number): string {
  return `${contextK.toLocaleString('en-US')}K tokens`;
}

export interface ApiValueMetrics {
  blendedPricePer1M: number | null;
  valueScore: number | null;
}

/** 计算 API 性价比榜核心衍生指标：1:3 加权均价与性价比分（能力分 / ∛加权均价） */
export function computeApiValueMetrics(entry: LeaderboardEntry): ApiValueMetrics {
  if (!entry.pricing) {
    return { blendedPricePer1M: null, valueScore: null };
  }
  const blended = (entry.pricing.inputPer1MUsd + 3 * entry.pricing.outputPer1MUsd) / 4;
  if (!Number.isFinite(blended) || blended <= 0) {
    return { blendedPricePer1M: blended === 0 ? 0 : null, valueScore: null };
  }
  const valueScore = entry.scores.overall / Math.cbrt(blended);
  return {
    blendedPricePer1M: blended,
    valueScore: Number.isFinite(valueScore) ? valueScore : null,
  };
}

export interface ScoreSourceInfo {
  shortLabel: string;
  detail: string;
}

/** 根据模型亮点标签与子项指标识别综合分主来源 */
export function getScoreSourceInfo(entry: LeaderboardEntry): ScoreSourceInfo {
  const lb2Tag = entry.highlights.find((tag) => tag.startsWith('LB2:'));
  if (lb2Tag) {
    const score = lb2Tag.slice('LB2:'.length);
    return {
      shortLabel: 'LiveBench 2.0',
      detail: `综合分直接取自 LiveBench 2.0 官方无污染长程评测 (${score})：由 Long Agentic (×2)、Coding (×1.5)、Design (×1.5)、Reasoning、Browser、Data Analysis、Research 加权汇总。`,
    };
  }

  const arenaTag = entry.highlights.find((tag) => tag.startsWith('Arena:'));
  if (arenaTag) {
    const elo = arenaTag.slice('Arena:'.length);
    return {
      shortLabel: `LMArena ${elo}`,
      detail: `综合分由 LMArena 盲测 Elo (${elo}) 线性换算；缺少的代码/数学子项不拉低综合分。`,
    };
  }

  const aaTag = entry.highlights.find((tag) => tag.startsWith('AA综合:'));
  if (aaTag) {
    const idx = aaTag.slice('AA综合:'.length);
    return {
      shortLabel: 'AA 综合指数',
      detail: `综合分由 Artificial Analysis 综合指数 (${idx}) 归一化换算；暂无 LMArena 子项时不按零计分。`,
    };
  }

  const daTag = entry.highlights.find((tag) => tag.startsWith('DA:'));
  if (daTag) {
    const elo = daTag.slice('DA:'.length);
    return {
      shortLabel: `DA/子项估算`,
      detail: `暂无 LMArena 与 AA 综合分，由 DesignArena (${elo}) 与 AA 能力子项加权估算（封顶 72 分）。`,
    };
  }

  if (entry.highlights.includes('子项估算')) {
    return {
      shortLabel: 'AA 子项估算',
      detail: '暂无 LMArena 与 AA 综合分，由 AA 代码/Agent 子项加权估算（封顶 72 分）。',
    };
  }

  if (entry.scores.coding !== undefined || entry.scores.reasoning !== undefined) {
    return {
      shortLabel: 'AA / 公开基准',
      detail: '来自 OpenRouter Artificial Analysis 与公开基准综合归一化分数。',
    };
  }

  return {
    shortLabel: '公开基准聚合',
    detail: '来自 OpenRouter / DesignArena 公开评测汇总。',
  };
}

const VENDOR_HOMEPAGES: Record<string, string> = {
  OpenAI: 'https://openai.com/',
  Anthropic: 'https://www.anthropic.com/',
  Google: 'https://deepmind.google/models/gemini/',
  DeepSeek: 'https://www.deepseek.com/',
  Qwen: 'https://qwenlm.github.io/',
  Meta: 'https://ai.meta.com/',
  xAI: 'https://x.ai/',
  'Z.ai': 'https://z.ai/',
  MoonshotAI: 'https://www.moonshot.ai/',
  Mistral: 'https://mistral.ai/',
  MiniMax: 'https://www.minimax.io/',
  Cohere: 'https://cohere.com/',
  Amazon: 'https://aws.amazon.com/bedrock/',
  Xiaomi: 'https://mimo.xiaomi.com/',
  NVIDIA: 'https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/',
  StepFun: 'https://www.stepfun.com/',
  AbacusAI: 'https://abacus.ai/',
  'Thinking Machines': 'https://thinkingmachines.ai/',
  'Reflection AI': 'https://reflection.ai/',
};

/** 匹配主流模型研发商的官方主页（无法确认的第三方厂商返回 null，避免误标） */
export function getVendorHomepageUrl(provider: string): string | null {
  return VENDOR_HOMEPAGES[provider] ?? null;
}

/** 识别详情链接真实站点归属，避免将 OpenRouter 页面误称为“官网” */
export function getDetailLinkLabel(url: string): string {
  return url.includes('openrouter.ai') ? 'OpenRouter 详情' : '官方详情';
}

/** 提取当前榜单内不重复的机构列表 */
export function getUniqueProviders(entries: LeaderboardEntry[]): string[] {
  return Array.from(new Set(entries.map((item) => item.provider))).sort((a, b) =>
    a.localeCompare(b, 'zh-CN')
  );
}

/** 提取可排序的数值，缺失返回 null（确保缺失项始终排在末尾） */
function getNumericSortValue(
  entry: LeaderboardEntry,
  sortKey: LeaderboardSortKey
): number | null {
  switch (sortKey) {
    case 'rank':
      return entry.rank;
    case 'overallScore':
      return entry.scores.overall;
    case 'codingScore':
      return entry.scores.coding ?? null;
    case 'mathScore':
      return entry.scores.math ?? null;
    case 'reasoningScore':
      return entry.scores.reasoning ?? null;
    case 'contextWindow':
      return entry.contextWindowK;
    case 'inputPricePer1M':
      return entry.pricing?.inputPer1MUsd ?? null;
    case 'outputPricePer1M':
      return entry.pricing?.outputPer1MUsd ?? null;
    case 'blendedPricePer1M':
      return computeApiValueMetrics(entry).blendedPricePer1M;
    case 'valueScore':
      return computeApiValueMetrics(entry).valueScore;
    default:
      return entry.rank;
  }
}

/** 过滤与排序榜单条目 */
export function filterAndSortEntries(
  entries: LeaderboardEntry[],
  filters: LeaderboardFilterState
): LeaderboardEntry[] {
  const keyword = filters.search.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
    if (filters.license !== 'all' && entry.licenseType !== filters.license) {
      return false;
    }
    if (filters.provider !== 'all' && entry.provider !== filters.provider) {
      return false;
    }
    if (filters.minContextK > 0 && entry.contextWindowK < filters.minContextK) {
      return false;
    }
    if (keyword) {
      const haystack =
        `${entry.modelName} ${entry.provider} ${entry.licenseLabel} ${entry.highlights.join(' ')}`.toLowerCase();
      if (!haystack.includes(keyword)) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    const valA = getNumericSortValue(a, filters.sortKey);
    const valB = getNumericSortValue(b, filters.sortKey);

    if (valA === null && valB === null) return a.rank - b.rank;
    if (valA === null) return 1;
    if (valB === null) return -1;

    const diff = filters.sortOrder === 'asc' ? valA - valB : valB - valA;
    return diff !== 0 ? diff : a.rank - b.rank;
  });
}

export interface BestCompareMetrics {
  maxOverall: number | null;
  maxCoding: number | null;
  maxMath: number | null;
  maxReasoning: number | null;
  maxContextK: number | null;
  minInputPrice: number | null;
  minOutputPrice: number | null;
  minBlendedPrice: number | null;
  maxValueScore: number | null;
  maxSpeed: number | null;
}

function findDistinctBest(values: (number | undefined | null)[], mode: 'max' | 'min'): number | null {
  const valid = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length < 2) return null;
  const best = mode === 'max' ? Math.max(...valid) : Math.min(...valid);
  const allEqual = valid.every((v) => v === best);
  return allEqual ? null : best;
}

/** 计算横向对比组内各项的最优值（至少 2 个有效值且非全部相同时返回高亮基准） */
export function getBestCompareMetrics(entries: LeaderboardEntry[]): BestCompareMetrics {
  const apiMetrics = entries.map((e) => computeApiValueMetrics(e));
  return {
    maxOverall: findDistinctBest(entries.map((e) => e.scores.overall), 'max'),
    maxCoding: findDistinctBest(entries.map((e) => e.scores.coding), 'max'),
    maxMath: findDistinctBest(entries.map((e) => e.scores.math), 'max'),
    maxReasoning: findDistinctBest(entries.map((e) => e.scores.reasoning), 'max'),
    maxContextK: findDistinctBest(entries.map((e) => e.contextWindowK), 'max'),
    minInputPrice: findDistinctBest(entries.map((e) => e.pricing?.inputPer1MUsd), 'min'),
    minOutputPrice: findDistinctBest(entries.map((e) => e.pricing?.outputPer1MUsd), 'min'),
    minBlendedPrice: findDistinctBest(apiMetrics.map((m) => m.blendedPricePer1M), 'min'),
    maxValueScore: findDistinctBest(apiMetrics.map((m) => m.valueScore), 'max'),
    maxSpeed: findDistinctBest(entries.map((e) => e.speedTokensPerSec), 'max'),
  };
}
