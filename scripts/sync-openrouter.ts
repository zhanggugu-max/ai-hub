import { createClient } from '@supabase/supabase-js';
import { parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import type { LeaderboardCategory, LicenseType } from '../src/data/leaderboard/mock-data';

const rawSupabaseUrl = process.env.SUPABASE_URL?.trim() || undefined;
const rawNextPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
const supabaseUrl = rawSupabaseUrl ?? rawNextPublicUrl;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 缺少必要的 Supabase 环境变量（Secrets 未配置、名称不一致或值为空）：');
  console.error(`   - SUPABASE_URL: ${rawSupabaseUrl ? '已配置' : '缺失'}`);
  console.error(`   - NEXT_PUBLIC_SUPABASE_URL: ${rawNextPublicUrl ? '已配置' : '缺失'}`);
  console.error(`   - SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '已配置' : '缺失'}`);
  console.error(
    '👉 请前往 GitHub 仓库 Settings -> Secrets and variables -> Actions 核对变量名与内容后重新触发。'
  );
  process.exit(1);
}

try {
  new URL(supabaseUrl);
} catch {
  console.error('❌ SUPABASE_URL 格式非法，请确认是以 https:// 开头的完整项目 URL（勿含多余引号或换行）。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
const LMARENA_DATASET_PATH =
  'datasets/lmarena-ai/leaderboard-dataset/resolve/main/text_style_control/latest-00000-of-00001.parquet';
const LMARENA_PARQUET_MIRRORS = [
  `https://huggingface.co/${LMARENA_DATASET_PATH}`,
  `https://hf-mirror.com/${LMARENA_DATASET_PATH}`,
];
const LMARENA_TREE_MIRRORS = [
  'https://huggingface.co/api/datasets/lmarena-ai/leaderboard-dataset/tree/main/text_style_control',
  'https://hf-mirror.com/api/datasets/lmarena-ai/leaderboard-dataset/tree/main/text_style_control',
];

const METHODOLOGY_NOTES: Record<LeaderboardCategory, string> = {
  overall:
    '多源融合榜单：以 LMArena 官方公开数据集（text_style_control）综合/代码/数学 Elo 为核心校准基准，融合 OpenRouter Artificial Analysis（AA 综合/代码/Agent 指数）与 DesignArena 盲测评分统一归一化为 0–100 量纲；同时保留最新 Preview、Exp 及带日期主版本模型并按跑分完整性智能去重。',
  open_source:
    '自动筛选具备开源权重仓库（Hugging Face Hub ID 或 LMArena 开源协议标注）且拥有 LMArena / AA / DesignArena 任一权威评测数据的主流开源模型（DeepSeek、Qwen、Llama、GLM、Kimi 等）。',
  api_value:
    '筛选综合能力分 ≥ 55 的在役商用与开源模型，按 1:3（输入:输出）加权均价计算能力/成本比（能力分 / ∛均价）排序，全面呈现 DeepSeek、Qwen、GLM、Gemini Flash 等高性价比推理选择。',
};

const OFFICIAL_DISCLAIMER =
  '本站榜单数据定时融合自 LMArena 官方公开数据集（lmarena-ai/leaderboard-dataset）与 OpenRouter 公开模型目录（含 Artificial Analysis / DesignArena 评测指标），仅供开发者学习与选型参考。由于 AI 模型迭代极快，且 API 计费受缓存折扣、区域节点及推理档位影响，具体性能表现与价格请务必以厂商官方最新页面为准。本站不对因使用该数据造成的任何决策损失负责。';

interface OpenRouterPricing {
  prompt?: string;
  completion?: string;
}

interface DesignArenaEntry {
  arena?: string;
  category?: string;
  elo?: number;
  win_rate?: number;
  rank?: number;
}

interface OpenRouterBenchmarks {
  artificial_analysis?: {
    intelligence_index?: number | null;
    coding_index?: number | null;
    agentic_index?: number | null;
  };
  design_arena?: DesignArenaEntry[];
}

interface OpenRouterModelRaw {
  id: string;
  hugging_face_id?: string | null;
  name: string;
  created?: number;
  context_length?: number;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: OpenRouterPricing;
  expiration_date?: string | null;
  endpoints?: string[];
  benchmarks?: OpenRouterBenchmarks;
}

interface LmArenaRowRaw {
  model_name?: unknown;
  organization?: unknown;
  license?: unknown;
  rating?: unknown;
  rank?: unknown;
  category?: unknown;
  leaderboard_publish_date?: unknown;
}

interface LmArenaModelScores {
  modelName: string;
  license: string | null;
  publishDate: string | null;
  overallElo: number | null;
  overallRank: number | null;
  codingElo: number | null;
  mathElo: number | null;
}

interface LmArenaIndex {
  byExactNorm: Map<string, LmArenaModelScores>;
  byLooseNorm: Map<string, LmArenaModelScores>;
  publishDate: string | null;
  totalOverallModels: number;
}

interface NormalizedModel {
  modelSlug: string;
  dedupeKey: string;
  modelName: string;
  provider: string;
  licenseType: LicenseType;
  licenseLabel: string;
  overallScore: number;
  codingScore: number | null;
  mathScore: number | null;
  reasoningScore: number | null;
  lmArenaElo: number | null;
  lmArenaRank: number | null;
  benchmarkSourceCount: number;
  createdAt: number;
  contextWindowK: number;
  inputPricePer1MUsd: number;
  outputPricePer1MUsd: number;
  blendedPricePer1MUsd: number;
  highlights: string[];
  officialUrl: string;
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeMatchKey(raw: string, stripQualifiers: boolean): string {
  let text = raw
    .toLowerCase()
    .replace(/^[^:]+:\s*/, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(202\d{5}|20\d{2}-\d{2}-\d{2}|\d{2}-\d{2}|\d{4})\b/g, ' ');

  if (stripQualifiers) {
    text = text.replace(
      /\b(preview|beta\s*\d*|exp|experimental|reasoning|thinking|instant|instruct|chat|it|open)\b/g,
      ' '
    );
  }

  return text.replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * 过滤真正的路由前缀与非文本输出噪音，放行 -preview / -exp / 带日期后缀（如 -1017、-0902）的真实版本。
 */
function isNoiseVariant(model: OpenRouterModelRaw): boolean {
  const idLower = model.id.toLowerCase();
  const nameLower = model.name.toLowerCase();

  if (idLower.includes(':')) return true;
  if (idLower.startsWith('openrouter/') || idLower.startsWith('switchpoint/')) return true;
  if (/\((free|batch)\)/i.test(nameLower)) return true;

  if (model.expiration_date) {
    const expMs = Date.parse(model.expiration_date);
    if (!Number.isNaN(expMs) && expMs <= Date.now()) return true;
  }

  const outputModalities = model.architecture?.output_modalities ?? [];
  if (outputModalities.length > 0 && !outputModalities.includes('text')) return true;

  const endpoints = model.endpoints ?? [];
  if (endpoints.length > 0 && !endpoints.includes('/api/v1/chat/completions')) return true;

  return false;
}

/**
 * 生成同型号跨快照的智能去重键：
 * 仅剥离日期后缀（-1017 / -0902 / -20260215 / -02-15）与 -preview / -exp，
 * 使 deepseek-v4.1-flash 与 deepseek-v4.1-flash-1017 归并到同一组并优先保留有跑分数据的版本，
 * 同时保留 v4 与 v4.1、5.1 与 5.2 等真实子代差异。
 */
function getDedupeModelKey(id: string): string {
  return id
    .toLowerCase()
    .replace(/^~/, '')
    .replace(/(-(202\d{5}|20\d{2}-\d{2}-\d{2}|\d{2}-\d{2}|\d{4}|preview|exp|experimental))+$/g, '');
}

function roundUsd(value: number): number {
  if (value <= 0) return 0;
  return Number(value.toFixed(value < 0.1 ? 4 : 2));
}

function cleanDisplayName(rawName: string): string {
  const idx = rawName.indexOf(':');
  return idx > 0 ? rawName.slice(idx + 1).trim() : rawName.trim();
}

function extractProvider(rawId: string, rawName: string): string {
  const idx = rawName.indexOf(':');
  if (idx > 0) return rawName.slice(0, idx).trim();
  return rawId.replace(/^~/, '').split('/')[0] ?? 'Unknown';
}

function computeDesignArenaAvgElo(entries?: DesignArenaEntry[]): number | null {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const elos = entries
    .map((entry) => entry.elo)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);
  if (elos.length === 0) return null;
  return Math.round(elos.reduce((sum, v) => sum + v, 0) / elos.length);
}

function arenaOverallEloTo100(elo: number): number {
  return clamp(5, 99.5, (elo - 1050) / 5.0);
}

function arenaSubEloTo100(elo: number): number {
  return Number(clamp(5, 99.5, (elo - 1050) / 5.2).toFixed(1));
}

function aaIndexTo100(aaIndex: number): number {
  return clamp(5, 99.0, 55 + 0.62 * aaIndex);
}

/**
 * 统一综合能力评分（0–100 量纲）：
 * - 同时拥有 LMArena Overall Elo 与 AA Intelligence Index：75% LMArena + 25% AA；
 * - 仅拥有 LMArena Overall Elo：直接按 LMArena 映射分展示；
 * - 仅拥有 AA Intelligence Index（如刚发布的未入 Arena 新模型）：按校准后 AA 分展示；
 * - 仅拥有 AA Coding/Agentic 或 DesignArena Elo：按经验回归映射到合理区间（上限 72）。
 */
function computeUnifiedScores(params: {
  lmArena: LmArenaModelScores | null;
  intelligenceIndex: number | null;
  codingIndex: number | null;
  agenticIndex: number | null;
  designArenaElo: number | null;
}): {
  overallScore: number;
  codingScore: number | null;
  mathScore: number | null;
  reasoningScore: number | null;
  benchmarkSourceCount: number;
} | null {
  const lmOverallElo = params.lmArena?.overallElo ?? null;
  const lmCodingElo = params.lmArena?.codingElo ?? null;
  const lmMathElo = params.lmArena?.mathElo ?? null;

  const arenaScore = lmOverallElo !== null ? arenaOverallEloTo100(lmOverallElo) : null;
  const aaScore =
    params.intelligenceIndex !== null ? aaIndexTo100(params.intelligenceIndex) : null;

  let overallScore: number | null = null;
  if (arenaScore !== null && aaScore !== null) {
    overallScore = 0.75 * arenaScore + 0.25 * aaScore;
  } else if (arenaScore !== null) {
    overallScore = arenaScore;
  } else if (aaScore !== null) {
    overallScore = aaScore;
  } else {
    let aaSub: number | null = null;
    if (params.agenticIndex !== null && params.codingIndex !== null) {
      aaSub = 48 + 0.24 * params.codingIndex + 0.14 * params.agenticIndex;
    } else if (params.codingIndex !== null) {
      aaSub = 46 + 0.28 * params.codingIndex;
    } else if (params.agenticIndex !== null) {
      aaSub = 46 + 0.35 * params.agenticIndex;
    }

    const daSub =
      params.designArenaElo !== null ? arenaOverallEloTo100(params.designArenaElo + 220) : null;

    if (aaSub !== null && daSub !== null) {
      overallScore = Math.min(72, 0.55 * aaSub + 0.45 * daSub);
    } else if (aaSub !== null || daSub !== null) {
      overallScore = Math.min(72, (aaSub ?? daSub)!);
    }
  }

  if (overallScore === null) return null;

  let codingScore: number | null = null;
  if (lmCodingElo !== null && params.codingIndex !== null) {
    codingScore = Number(
      (0.7 * arenaSubEloTo100(lmCodingElo) + 0.3 * clamp(5, 98, 42 + 0.58 * params.codingIndex)).toFixed(1)
    );
  } else if (lmCodingElo !== null) {
    codingScore = arenaSubEloTo100(lmCodingElo);
  } else if (params.codingIndex !== null) {
    codingScore = Number(params.codingIndex.toFixed(1));
  }

  const mathScore = lmMathElo !== null ? arenaSubEloTo100(lmMathElo) : null;
  const reasoningScore =
    params.agenticIndex !== null ? Number(params.agenticIndex.toFixed(1)) : null;

  const benchmarkSourceCount =
    (lmOverallElo !== null ? 2 : 0) +
    (params.intelligenceIndex !== null ? 2 : 0) +
    (params.codingIndex !== null || params.agenticIndex !== null ? 1 : 0) +
    (params.designArenaElo !== null ? 1 : 0);

  return {
    overallScore: Number(overallScore.toFixed(1)),
    codingScore,
    mathScore,
    reasoningScore,
    benchmarkSourceCount,
  };
}

function buildHighlights(params: {
  lmArenaElo: number | null;
  contextK: number;
  codingScore: number | null;
  designArenaElo: number | null;
  inputModalities: string[];
  licenseType: LicenseType;
  blendedPrice: number;
}): string[] {
  const tags: string[] = [];

  if (params.lmArenaElo !== null) {
    tags.push(`Arena:${Math.round(params.lmArenaElo)}`);
  }

  if (params.contextK >= 1000) {
    tags.push('1M+上下文');
  } else if (params.contextK >= 200) {
    tags.push('超长上下文');
  }

  if (params.codingScore !== null && params.codingScore >= 80) {
    tags.push('代码强项');
  }

  if (params.licenseType === 'open_weights') {
    tags.push('开源权重');
  }

  if (
    params.inputModalities.includes('image') ||
    params.inputModalities.includes('video')
  ) {
    tags.push('多模态');
  }

  if (params.blendedPrice > 0 && params.blendedPrice <= 0.5) {
    tags.push('超低成本');
  }

  if (params.designArenaElo !== null && tags.length < 3) {
    tags.push(`DA:${params.designArenaElo}`);
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

async function fetchLatestLmArenaParquetBuffer(): Promise<ArrayBuffer> {
  for (const directUrl of LMARENA_PARQUET_MIRRORS) {
    try {
      const res = await fetch(directUrl, {
        headers: { 'User-Agent': 'ai-hub-leaderboard-sync/1.0' },
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        return await res.arrayBuffer();
      }
    } catch {
      // 尝试下一镜像或动态文件名解析
    }
  }

  for (const treeUrl of LMARENA_TREE_MIRRORS) {
    try {
      const treeRes = await fetch(treeUrl, {
        headers: { 'User-Agent': 'ai-hub-leaderboard-sync/1.0' },
        signal: AbortSignal.timeout(10000),
      });
      if (!treeRes.ok) continue;
      const entries = (await treeRes.json()) as { path?: string }[];
      const latestPath = entries.find((e) => e.path?.includes('latest-') && e.path.endsWith('.parquet'))?.path;
      if (!latestPath) continue;

      const baseHost = treeUrl.startsWith('https://huggingface.co')
        ? 'https://huggingface.co'
        : 'https://hf-mirror.com';
      const fileRes = await fetch(
        `${baseHost}/datasets/lmarena-ai/leaderboard-dataset/resolve/main/${latestPath}`,
        {
          headers: { 'User-Agent': 'ai-hub-leaderboard-sync/1.0' },
          signal: AbortSignal.timeout(12000),
        }
      );
      if (fileRes.ok) {
        return await fileRes.arrayBuffer();
      }
    } catch {
      // 继续尝试兜底镜像
    }
  }

  throw new Error('所有 LMArena Hugging Face 数据集镜像均请求超时或不可用');
}

function upsertLmArenaEntry(
  map: Map<string, LmArenaModelScores>,
  key: string,
  incoming: LmArenaModelScores
) {
  if (!key) return;
  const existing = map.get(key);
  if (!existing) {
    map.set(key, { ...incoming });
    return;
  }

  if (
    incoming.overallElo !== null &&
    (existing.overallElo === null || incoming.overallElo > existing.overallElo)
  ) {
    existing.overallElo = incoming.overallElo;
    existing.overallRank = incoming.overallRank;
    existing.modelName = incoming.modelName;
    if (incoming.license) existing.license = incoming.license;
  }
  if (
    incoming.codingElo !== null &&
    (existing.codingElo === null || incoming.codingElo > existing.codingElo)
  ) {
    existing.codingElo = incoming.codingElo;
  }
  if (
    incoming.mathElo !== null &&
    (existing.mathElo === null || incoming.mathElo > existing.mathElo)
  ) {
    existing.mathElo = incoming.mathElo;
  }
}

async function fetchLmArenaIndex(): Promise<LmArenaIndex | null> {
  try {
    const buffer = await fetchLatestLmArenaParquetBuffer();
    const rows = (await parquetReadObjects({
      file: buffer,
      compressors,
    })) as LmArenaRowRaw[];

    const byModelRaw = new Map<string, LmArenaModelScores>();
    let publishDate: string | null = null;
    let totalOverallModels = 0;

    for (const row of rows) {
      const category = typeof row.category === 'string' ? row.category : '';
      if (category !== 'overall' && category !== 'coding' && category !== 'math') {
        continue;
      }

      const modelName = typeof row.model_name === 'string' ? row.model_name.trim() : '';
      const rating = Number(row.rating);
      const rank = Number(row.rank);
      if (!modelName || !Number.isFinite(rating) || rating <= 0) continue;

      if (!publishDate && typeof row.leaderboard_publish_date === 'string') {
        publishDate = row.leaderboard_publish_date;
      }

      let record = byModelRaw.get(modelName);
      if (!record) {
        record = {
          modelName,
          license: typeof row.license === 'string' ? row.license : null,
          publishDate: typeof row.leaderboard_publish_date === 'string' ? row.leaderboard_publish_date : null,
          overallElo: null,
          overallRank: null,
          codingElo: null,
          mathElo: null,
        };
        byModelRaw.set(modelName, record);
      }

      if (category === 'overall') {
        totalOverallModels++;
        record.overallElo = rating;
        record.overallRank = Number.isFinite(rank) ? rank : null;
      } else if (category === 'coding') {
        record.codingElo = rating;
      } else if (category === 'math') {
        record.mathElo = rating;
      }
    }

    const byExactNorm = new Map<string, LmArenaModelScores>();
    const byLooseNorm = new Map<string, LmArenaModelScores>();

    for (const entry of byModelRaw.values()) {
      upsertLmArenaEntry(byExactNorm, normalizeMatchKey(entry.modelName, false), entry);
      upsertLmArenaEntry(byLooseNorm, normalizeMatchKey(entry.modelName, true), entry);
    }

    console.log(
      `📊 已载入 LMArena 官方数据集 (发布日: ${publishDate ?? '未知'}, Overall: ${totalOverallModels} 条)`
    );

    return {
      byExactNorm,
      byLooseNorm,
      publishDate,
      totalOverallModels,
    };
  } catch (err) {
    console.warn(
      '⚠️ 拉取 LMArena 官方数据集失败，将降级仅使用 OpenRouter 内置评测:',
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

function matchLmArenaModel(
  lmIndex: LmArenaIndex | null,
  rawId: string,
  rawName: string
): LmArenaModelScores | null {
  if (!lmIndex) return null;
  const slugTail = rawId.replace(/^~/, '').split('/')[1] ?? rawId;
  const candidates = [cleanDisplayName(rawName), slugTail];

  for (const text of candidates) {
    const exact = lmIndex.byExactNorm.get(normalizeMatchKey(text, false));
    if (exact) return exact;
  }
  for (const text of candidates) {
    const loose = lmIndex.byLooseNorm.get(normalizeMatchKey(text, true));
    if (loose) return loose;
  }
  return null;
}

/**
 * 智能去重：同型号通配版（如 deepseek-v4.1-flash）与日期版（如 deepseek-v4.1-flash-1017）
 * 归并到同一 dedupeKey 时，优先保留评测数据更完整、综合分更高且更新的版本。
 */
function deduplicateSmartVariants(models: NormalizedModel[]): NormalizedModel[] {
  const bestByKey = new Map<string, NormalizedModel>();

  for (const model of models) {
    const existing = bestByKey.get(model.dedupeKey);
    if (!existing) {
      bestByKey.set(model.dedupeKey, model);
      continue;
    }

    const isBetter =
      model.benchmarkSourceCount !== existing.benchmarkSourceCount
        ? model.benchmarkSourceCount > existing.benchmarkSourceCount
        : model.overallScore !== existing.overallScore
          ? model.overallScore > existing.overallScore
          : model.createdAt > existing.createdAt;

    if (isBetter) {
      bestByKey.set(model.dedupeKey, model);
    }
  }

  return Array.from(bestByKey.values());
}

function inferOpenSource(raw: OpenRouterModelRaw, lmArena: LmArenaModelScores | null): {
  isOpen: boolean;
  label: string;
} {
  if (raw.hugging_face_id) {
    return { isOpen: true, label: 'Open Weights' };
  }
  const lmLic = lmArena?.license?.trim();
  if (lmLic && !/^proprietary$/i.test(lmLic)) {
    return { isOpen: true, label: lmLic };
  }
  return { isOpen: false, label: 'Proprietary' };
}

async function fetchMergedModels(lmIndex: LmArenaIndex | null): Promise<NormalizedModel[]> {
  const response = await fetch(OPENROUTER_MODELS_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ai-hub-leaderboard-sync/1.0',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API 请求失败: HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as { data?: OpenRouterModelRaw[] };
  const rawModels = payload.data ?? [];
  const candidates: NormalizedModel[] = [];

  for (const m of rawModels) {
    if (isNoiseVariant(m)) continue;

    const promptPerToken = Number(m.pricing?.prompt);
    const completionPerToken = Number(m.pricing?.completion);
    if (
      !Number.isFinite(promptPerToken) ||
      !Number.isFinite(completionPerToken) ||
      promptPerToken < 0 ||
      completionPerToken < 0
    ) {
      continue;
    }

    const lmArena = matchLmArenaModel(lmIndex, m.id, m.name);
    const aa = m.benchmarks?.artificial_analysis;
    const intelligenceIndex =
      typeof aa?.intelligence_index === 'number' && Number.isFinite(aa.intelligence_index)
        ? aa.intelligence_index
        : null;
    const codingIndex =
      typeof aa?.coding_index === 'number' && Number.isFinite(aa.coding_index)
        ? aa.coding_index
        : null;
    const agenticIndex =
      typeof aa?.agentic_index === 'number' && Number.isFinite(aa.agentic_index)
        ? aa.agentic_index
        : null;
    const designArenaElo = computeDesignArenaAvgElo(m.benchmarks?.design_arena);

    const unified = computeUnifiedScores({
      lmArena,
      intelligenceIndex,
      codingIndex,
      agenticIndex,
      designArenaElo,
    });
    if (!unified) continue;

    const inputPer1M = roundUsd(promptPerToken * 1_000_000);
    const outputPer1M = roundUsd(completionPerToken * 1_000_000);
    const blendedPrice = (inputPer1M + 3 * outputPer1M) / 4;
    const contextK = Math.max(1, Math.round((m.context_length ?? 0) / 1000));
    const openInfo = inferOpenSource(m, lmArena);

    candidates.push({
      modelSlug: m.id.replace(/^~/, ''),
      dedupeKey: getDedupeModelKey(m.id),
      modelName: cleanDisplayName(m.name),
      provider: extractProvider(m.id, m.name),
      licenseType: openInfo.isOpen ? 'open_weights' : 'proprietary',
      licenseLabel: openInfo.label,
      overallScore: unified.overallScore,
      codingScore: unified.codingScore,
      mathScore: unified.mathScore,
      reasoningScore: unified.reasoningScore,
      lmArenaElo: lmArena?.overallElo ? Math.round(lmArena.overallElo) : null,
      lmArenaRank: lmArena?.overallRank ?? null,
      benchmarkSourceCount: unified.benchmarkSourceCount,
      createdAt: m.created ?? 0,
      contextWindowK: contextK,
      inputPricePer1MUsd: inputPer1M,
      outputPricePer1MUsd: outputPer1M,
      blendedPricePer1MUsd: blendedPrice,
      highlights: buildHighlights({
        lmArenaElo: lmArena?.overallElo ?? null,
        contextK,
        codingScore: unified.codingScore,
        designArenaElo,
        inputModalities: m.architecture?.input_modalities ?? [],
        licenseType: openInfo.isOpen ? 'open_weights' : 'proprietary',
        blendedPrice,
      }),
      officialUrl: `https://openrouter.ai/${m.id.replace(/^~/, '')}`,
    });
  }

  return deduplicateSmartVariants(candidates);
}

async function loadPreviousRankMap(): Promise<
  Record<LeaderboardCategory, Map<string, number>>
> {
  const rankMap: Record<LeaderboardCategory, Map<string, number>> = {
    overall: new Map(),
    open_source: new Map(),
    api_value: new Map(),
  };

  const { data: latestSnaps, error: snapErr } = await supabase
    .from('leaderboard_snapshots')
    .select('id, category')
    .eq('is_latest', true);

  if (snapErr || !latestSnaps || latestSnaps.length === 0) {
    return rankMap;
  }

  const snapIds = latestSnaps.map((s) => s.id as string);
  const { data: prevModels, error: modErr } = await supabase
    .from('ai_models')
    .select('category, model_slug, rank')
    .in('snapshot_id', snapIds);

  if (modErr || !prevModels) {
    return rankMap;
  }

  for (const row of prevModels as {
    category: LeaderboardCategory;
    model_slug: string;
    rank: number;
  }[]) {
    rankMap[row.category]?.set(row.model_slug, row.rank);
  }

  return rankMap;
}

interface BoardSpec {
  category: LeaderboardCategory;
  title: string;
  shortLabel: string;
  description: string;
  models: NormalizedModel[];
}

async function main() {
  const startedAt = new Date();
  console.log('🚀 开始从 LMArena 官方数据集 + OpenRouter 同步全量最新榜单...');

  try {
    const lmIndex = await fetchLmArenaIndex();
    const allModels = await fetchMergedModels(lmIndex);

    if (allModels.length < 30) {
      throw new Error(`有效基准模型数量异常过少 (${allModels.length})，中止覆盖以保护线上快照`);
    }

    const overallModels = [...allModels]
      .sort((a, b) => {
        if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
        return (b.lmArenaElo ?? 0) - (a.lmArenaElo ?? 0);
      })
      .slice(0, 250);

    const openSourceModels = overallModels
      .filter((m) => m.licenseType === 'open_weights')
      .slice(0, 250);

    const apiValueModels = [...allModels]
      .filter((m) => m.overallScore >= 55 && m.blendedPricePer1MUsd > 0)
      .sort((a, b) => {
        const valueA = a.overallScore / Math.cbrt(a.blendedPricePer1MUsd);
        const valueB = b.overallScore / Math.cbrt(b.blendedPricePer1MUsd);
        return valueB - valueA;
      })
      .slice(0, 250);

    const boards: BoardSpec[] = [
      {
        category: 'overall',
        title: 'AI 大模型综合能力榜',
        shortLabel: '综合能力',
        description:
          '融合 LMArena 官方最新盲测 Elo（综合/代码/数学）与 OpenRouter AA / DesignArena 指标的全量旗舰榜。',
        models: overallModels,
      },
      {
        category: 'open_source',
        title: '开源大模型能力榜',
        shortLabel: '开源模型',
        description:
          '覆盖 Hugging Face 与 LMArena 认证开源权重模型（DeepSeek / Qwen / Llama / GLM / Kimi 等）及 API 成本。',
        models: openSourceModels,
      },
      {
        category: 'api_value',
        title: 'API 性价比排行榜',
        shortLabel: 'API 性价比',
        description:
          '基于融合综合分与 1:3 输入输出加权单价排序，全面对比高性价比主力模型。',
        models: apiValueModels,
      },
    ];

    const prevRankMap = await loadPreviousRankMap();
    const snapshotAt = new Date().toISOString();
    const arenaTag = lmIndex?.publishDate ? ` (${lmIndex.publishDate})` : '';
    let totalUpserted = 0;

    for (const board of boards) {
      if (board.models.length === 0) continue;

      const { data: insertedSnap, error: snapErr } = await supabase
        .from('leaderboard_snapshots')
        .insert({
          category: board.category,
          title: board.title,
          short_label: board.shortLabel,
          description: board.description,
          source_name: `LMArena 官方数据集${arenaTag} · OpenRouter & AA`,
          source_url: 'https://arena.ai/leaderboard',
          is_mock_data: false,
          methodology_note: METHODOLOGY_NOTES[board.category],
          disclaimer: OFFICIAL_DISCLAIMER,
          snapshot_at: snapshotAt,
          is_latest: false,
        })
        .select('id')
        .single();

      if (snapErr || !insertedSnap) {
        throw new Error(`写入快照失败 (${board.category}): ${snapErr?.message}`);
      }

      const prevBoardRanks = prevRankMap[board.category];
      const hasPrevSnapshot = prevBoardRanks.size > 0;

      const modelRows = board.models.map((m, idx) => {
        const rank = idx + 1;
        const prevRank = prevBoardRanks.get(m.modelSlug);
        const rankDelta = hasPrevSnapshot
          ? prevRank !== undefined
            ? prevRank - rank
            : null
          : 0;

        return {
          snapshot_id: insertedSnap.id,
          category: board.category,
          model_slug: m.modelSlug,
          model_name: m.modelName,
          provider: m.provider,
          license_type: m.licenseType,
          license_label: m.licenseLabel,
          rank,
          rank_delta: rankDelta,
          score_overall: m.overallScore,
          score_coding: m.codingScore,
          score_math: m.mathScore,
          score_reasoning: m.reasoningScore,
          context_window_k: m.contextWindowK,
          input_price_per_1m_usd: m.inputPricePer1MUsd,
          output_price_per_1m_usd: m.outputPricePer1MUsd,
          speed_tokens_per_sec: null,
          highlights: m.highlights,
          official_url: m.officialUrl,
          is_active: true,
        };
      });

      const { error: modelsErr } = await supabase.from('ai_models').insert(modelRows);
      if (modelsErr) {
        throw new Error(`写入模型条目失败 (${board.category}): ${modelsErr.message}`);
      }

      const { error: resetErr } = await supabase
        .from('leaderboard_snapshots')
        .update({ is_latest: false })
        .eq('category', board.category)
        .eq('is_latest', true)
        .neq('id', insertedSnap.id);

      if (resetErr) {
        throw new Error(`归档旧快照失败 (${board.category}): ${resetErr.message}`);
      }

      const { error: activateErr } = await supabase
        .from('leaderboard_snapshots')
        .update({ is_latest: true })
        .eq('id', insertedSnap.id);

      if (activateErr) {
        throw new Error(`激活新快照失败 (${board.category}): ${activateErr.message}`);
      }

      totalUpserted += modelRows.length;
      const deepseekCount = board.models.filter((m) =>
        m.modelSlug.toLowerCase().includes('deepseek')
      ).length;
      console.log(
        `✅ [${board.category}] 已激活新快照 (${modelRows.length} 款，含 DeepSeek ${deepseekCount} 款)，Top 5: ${board.models
          .slice(0, 5)
          .map((m) => `${m.modelName}(${m.overallScore})`)
          .join(' / ')}`
      );
    }

    const finishedAt = new Date();
    const { error: logErr } = await supabase.from('sync_logs').insert({
      job_name: 'sync_openrouter_models',
      target_table: 'ai_models',
      status: 'success',
      fetched_count: allModels.length,
      upserted_count: totalUpserted,
      started_at: startedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
    });

    if (logErr) {
      console.warn('⚠️ 写入 sync_logs 警告:', logErr.message);
    }

    console.log(
      `\n🎉 LMArena + OpenRouter 融合同步完成！去重后共收录 ${allModels.length} 款模型，三大榜单累计写入 ${totalUpserted} 条记录。`
    );
  } catch (err) {
    const finishedAt = new Date();
    const message = err instanceof Error ? err.message : String(err);

    try {
      await supabase.from('sync_logs').insert({
        job_name: 'sync_openrouter_models',
        target_table: 'ai_models',
        status: 'failed',
        error_message: message,
        started_at: startedAt.toISOString(),
        finished_at: finishedAt.toISOString(),
        duration_ms: finishedAt.getTime() - startedAt.getTime(),
      });
    } catch {
      // 忽略写入失败审计日志时的二次网络异常，确保保留主报错
    }

    console.error('❌ 融合同步失败:', message);
    process.exit(1);
  }
}

main();
