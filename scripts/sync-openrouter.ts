import { createClient } from '@supabase/supabase-js';
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

const METHODOLOGY_NOTES: Record<LeaderboardCategory, string> = {
  overall:
    '聚合 OpenRouter 公开目录中具备 Artificial Analysis（综合/代码/Agent 指数）或 DesignArena 盲测 Elo 任一权威评测数据的全部在役主流模型；优先直接采用 AA Intelligence Index（0–100 量纲），暂缺该字段的新模型按 AA Coding/Agentic 与 DesignArena Elo 保守折算并列展示；API 单价统一换算为 USD/1M Tokens。',
  open_source:
    '自动筛选具备开源权重仓库（Hugging Face Hub ID）且拥有 AA 指数或 DesignArena 盲测数据的全部主流开源模型（涵盖 DeepSeek、Qwen、Llama、GLM、Kimi 等），供本地/私有化部署选型对比。',
  api_value:
    '筛选综合能力分 ≥ 12 的在役商用与开源模型，按 1:3（输入:输出）加权均价计算能力/成本比（能力分 / ∛均价）排序，全面呈现 DeepSeek、Qwen、GLM、Gemini Flash 等高性价比推理选择。',
};

const OFFICIAL_DISCLAIMER =
  '本站榜单数据定时同步自 OpenRouter 公开模型接口与内嵌 Artificial Analysis / DesignArena 公开评测指标，仅供开发者学习与选型参考。由于 AI 模型迭代极快，且 API 计费受缓存折扣、区域节点及推理档位影响，具体性能表现与价格请务必以厂商官方最新页面为准。本站不对因使用该数据造成的任何决策损失负责。';

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

interface NormalizedModel {
  modelSlug: string;
  seriesKey: string;
  modelName: string;
  provider: string;
  licenseType: LicenseType;
  licenseLabel: string;
  overallScore: number;
  hasOfficialAAIndex: boolean;
  codingIndex: number | null;
  agenticIndex: number | null;
  designArenaElo: number | null;
  contextWindowK: number;
  inputPricePer1MUsd: number;
  outputPricePer1MUsd: number;
  blendedPricePer1MUsd: number;
  highlights: string[];
  officialUrl: string;
}

/** 过滤 :free / :batch / -preview / 带日期后缀等噪音变体 */
function isNoiseVariant(model: OpenRouterModelRaw): boolean {
  const idLower = model.id.toLowerCase();
  const nameLower = model.name.toLowerCase();

  if (idLower.includes(':')) return true;
  if (idLower.startsWith('openrouter/') || idLower.startsWith('switchpoint/')) return true;

  if (
    /(-preview|-exp\b|-experimental|-alpha|-beta|-test|\(free\)|\(preview\)|\(batch\))/i.test(
      `${idLower} ${nameLower}`
    )
  ) {
    return true;
  }

  if (/-\d{8}$|-\d{4}-\d{2}-\d{2}$|-\d{4}$/.test(idLower)) return true;

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
  return rawId.split('/')[0] ?? 'Unknown';
}

/**
 * 同子系列微版本归并（如 claude-fable-5.2 与 5.1 归并保留最优，
 * 同时保留 deepseek-v4-flash / deepseek-v3.2 / qwen3.8-27b / sol / terra 等不同型号）。
 */
function getModelSeriesKey(id: string): string {
  return id.toLowerCase().replace(/([/-])(\d+(?:\.\d+)?)(?=-|$)/g, '$1*');
}

function computeDesignArenaAvgElo(entries?: DesignArenaEntry[]): number | null {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const elos = entries
    .map((entry) => entry.elo)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);
  if (elos.length === 0) return null;
  const avg = elos.reduce((sum, v) => sum + v, 0) / elos.length;
  return Math.round(avg);
}

/**
 * 统一综合能力评分（0–100 量纲）：
 * - 拥有官方 AA Intelligence Index 时直接原值返回；
 * - 仅拥有 AA Coding/Agentic 或 DesignArena Elo 时，按同量纲经验回归保守折算（上限 45），
 *   确保主流新模型（DeepSeek / Qwen / Llama 等）不失真且能公平上榜。
 */
function computeUnifiedOverallScore(params: {
  intelligenceIndex: number | null;
  codingIndex: number | null;
  agenticIndex: number | null;
  designArenaElo: number | null;
}): { score: number; hasOfficialAAIndex: boolean } | null {
  if (params.intelligenceIndex !== null) {
    return {
      score: Number(params.intelligenceIndex.toFixed(1)),
      hasOfficialAAIndex: true,
    };
  }

  let aaEst: number | null = null;
  if (params.agenticIndex !== null && params.codingIndex !== null) {
    aaEst = Math.max(3, 0.42 * params.agenticIndex + 0.16 * params.codingIndex - 2);
  } else if (params.codingIndex !== null) {
    aaEst = Math.max(3, 0.3 * params.codingIndex - 1);
  } else if (params.agenticIndex !== null) {
    aaEst = Math.max(3, 0.55 * params.agenticIndex);
  }

  const daEst =
    params.designArenaElo !== null
      ? Math.max(2, Math.min(44, (params.designArenaElo - 1020) / 6.8))
      : null;

  let combined: number | null = null;
  if (aaEst !== null && daEst !== null) {
    combined = 0.55 * aaEst + 0.45 * daEst;
  } else {
    combined = aaEst ?? daEst;
  }

  if (combined === null) return null;

  return {
    score: Number(Math.max(2, Math.min(45, combined)).toFixed(1)),
    hasOfficialAAIndex: false,
  };
}

function buildHighlights(params: {
  contextK: number;
  codingIndex: number | null;
  agenticIndex: number | null;
  designArenaElo: number | null;
  hasOfficialAAIndex: boolean;
  inputModalities: string[];
  licenseType: LicenseType;
  blendedPrice: number;
}): string[] {
  const tags: string[] = [];

  if (params.contextK >= 1000) {
    tags.push('1M+上下文');
  } else if (params.contextK >= 200) {
    tags.push('超长上下文');
  }

  if (params.codingIndex !== null && params.codingIndex >= 55) {
    tags.push('代码强项');
  }

  if (params.agenticIndex !== null && params.agenticIndex >= 40) {
    tags.push('Agent优势');
  }

  if (params.designArenaElo !== null) {
    tags.push(`DA:${params.designArenaElo}`);
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

  if (!params.hasOfficialAAIndex && tags.length < 3) {
    tags.push('多指标折算');
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

function deduplicateBySeries(models: NormalizedModel[]): NormalizedModel[] {
  const seenSeries = new Set<string>();
  const result: NormalizedModel[] = [];
  for (const model of models) {
    if (seenSeries.has(model.seriesKey)) continue;
    seenSeries.add(model.seriesKey);
    result.push(model);
  }
  return result;
}

async function fetchBenchmarkedOpenRouterModels(): Promise<NormalizedModel[]> {
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
  const normalized: NormalizedModel[] = [];

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

    const unified = computeUnifiedOverallScore({
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
    const isOpen = Boolean(m.hugging_face_id);

    normalized.push({
      modelSlug: m.id,
      seriesKey: getModelSeriesKey(m.id),
      modelName: cleanDisplayName(m.name),
      provider: extractProvider(m.id, m.name),
      licenseType: isOpen ? 'open_weights' : 'proprietary',
      licenseLabel: isOpen ? 'Open Weights' : 'Proprietary',
      overallScore: unified.score,
      hasOfficialAAIndex: unified.hasOfficialAAIndex,
      codingIndex: codingIndex !== null ? Number(codingIndex.toFixed(1)) : null,
      agenticIndex: agenticIndex !== null ? Number(agenticIndex.toFixed(1)) : null,
      designArenaElo,
      contextWindowK: contextK,
      inputPricePer1MUsd: inputPer1M,
      outputPricePer1MUsd: outputPer1M,
      blendedPricePer1MUsd: blendedPrice,
      highlights: buildHighlights({
        contextK,
        codingIndex,
        agenticIndex,
        designArenaElo,
        hasOfficialAAIndex: unified.hasOfficialAAIndex,
        inputModalities: m.architecture?.input_modalities ?? [],
        licenseType: isOpen ? 'open_weights' : 'proprietary',
        blendedPrice,
      }),
      officialUrl: `https://openrouter.ai/${m.id}`,
    });
  }

  return normalized;
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
  console.log('🚀 开始从 OpenRouter 同步全量多维度基准榜单...');

  try {
    const allModels = await fetchBenchmarkedOpenRouterModels();
    if (allModels.length < 20) {
      throw new Error(`有效基准模型数量异常过少 (${allModels.length})，中止覆盖以保护线上快照`);
    }

    const byOverallDesc = [...allModels].sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      return (b.codingIndex ?? 0) - (a.codingIndex ?? 0);
    });

    // 废除旧的 12/10 小截断：完整保留全量去重后的主流模型（上限放宽至 150 条）
    const overallModels = deduplicateBySeries(byOverallDesc).slice(0, 150);

    const openSourceModels = deduplicateBySeries(
      byOverallDesc.filter((m) => m.licenseType === 'open_weights')
    ).slice(0, 150);

    const apiValueCandidates = allModels
      .filter((m) => m.overallScore >= 12 && m.blendedPricePer1MUsd > 0)
      .sort((a, b) => {
        const valueA = a.overallScore / Math.cbrt(a.blendedPricePer1MUsd);
        const valueB = b.overallScore / Math.cbrt(b.blendedPricePer1MUsd);
        return valueB - valueA;
      });
    const apiValueModels = deduplicateBySeries(apiValueCandidates).slice(0, 150);

    const boards: BoardSpec[] = [
      {
        category: 'overall',
        title: 'AI 大模型综合能力榜',
        shortLabel: '综合能力',
        description:
          '全量收录具备 Artificial Analysis（综合/代码/Agent）或 DesignArena 盲测评测数据的在役模型。',
        models: overallModels,
      },
      {
        category: 'open_source',
        title: '开源大模型能力榜',
        shortLabel: '开源模型',
        description:
          '覆盖 Hugging Face 开源权重全系主力（DeepSeek / Qwen / Llama / GLM / Kimi 等）及 API 成本。',
        models: openSourceModels,
      },
      {
        category: 'api_value',
        title: 'API 性价比排行榜',
        shortLabel: 'API 性价比',
        description:
          '基于综合能力分与 1:3 输入输出加权单价排序，全面对比高性价比 API 与开源托管选择。',
        models: apiValueModels,
      },
    ];

    const prevRankMap = await loadPreviousRankMap();
    const snapshotAt = new Date().toISOString();
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
          source_name: 'OpenRouter 模型目录 · AA & DesignArena 多源评测',
          source_url: 'https://openrouter.ai/rankings',
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
          score_coding: m.codingIndex,
          score_math: null,
          score_reasoning: m.agenticIndex,
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
        `✅ [${board.category}] 已激活新快照 (${modelRows.length} 款，含 DeepSeek ${deepseekCount} 款)，Top 3: ${board.models
          .slice(0, 3)
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
      `\n🎉 多源扩榜同步完成！共捕获有权威基准模型 ${allModels.length} 款，三大榜单累计写入 ${totalUpserted} 条记录。`
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

    console.error('❌ OpenRouter 同步失败:', message);
    process.exit(1);
  }
}

main();
