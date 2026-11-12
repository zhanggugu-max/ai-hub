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

/** 格式化上下文长度 */
export function formatContextWindow(contextK: number): string {
  if (contextK >= 1000) {
    const m = contextK / 1000;
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`;
  }
  return `${contextK}K`;
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
    case 'contextWindow':
      return entry.contextWindowK;
    case 'inputPricePer1M':
      return entry.pricing?.inputPer1MUsd ?? null;
    case 'outputPricePer1M':
      return entry.pricing?.outputPer1MUsd ?? null;
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
  maxSpeed: number | null;
}

function findDistinctBest(values: (number | undefined)[], mode: 'max' | 'min'): number | null {
  const valid = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length < 2) return null;
  const best = mode === 'max' ? Math.max(...valid) : Math.min(...valid);
  const allEqual = valid.every((v) => v === best);
  return allEqual ? null : best;
}

/** 计算横向对比组内各项的最优值（至少 2 个有效值且非全部相同时返回高亮基准） */
export function getBestCompareMetrics(entries: LeaderboardEntry[]): BestCompareMetrics {
  return {
    maxOverall: findDistinctBest(entries.map((e) => e.scores.overall), 'max'),
    maxCoding: findDistinctBest(entries.map((e) => e.scores.coding), 'max'),
    maxMath: findDistinctBest(entries.map((e) => e.scores.math), 'max'),
    maxReasoning: findDistinctBest(entries.map((e) => e.scores.reasoning), 'max'),
    maxContextK: findDistinctBest(entries.map((e) => e.contextWindowK), 'max'),
    minInputPrice: findDistinctBest(entries.map((e) => e.pricing?.inputPer1MUsd), 'min'),
    minOutputPrice: findDistinctBest(entries.map((e) => e.pricing?.outputPer1MUsd), 'min'),
    maxSpeed: findDistinctBest(entries.map((e) => e.speedTokensPerSec), 'max'),
  };
}
