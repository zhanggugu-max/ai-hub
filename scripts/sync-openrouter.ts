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

const LIVEBENCH_BASE_URL = 'https://livebench.ai/';
const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

const METHODOLOGY_NOTES: Record<LeaderboardCategory, string> = {
  overall:
    '数据直接抓取自 LiveBench 2.0 官方发布版本（无污染长程真实任务评测），覆盖 Long Agentic (×2)、Coding (×1.5)、Design (×1.5)、Reasoning (×1)、Browser (×1)、Data Analysis (×1)、Research (×1) 七大维度加权计算综合分；定价取自 LiveBench cost.csv，公开权重标注与官方链接取自 LiveBench 模型清单，上下文长度由 OpenRouter 校验补充。',
  open_source:
    '筛选 LiveBench 2.0 官方标记为 openweight（开源权重并附 Hugging Face / 模型页入口）的参评模型，按与综合榜一致的七维加权综合分降序排列，同时保留代码、复杂推理及 API 成本数据。',
  api_value:
    '筛选 LiveBench 2.0 综合分 ≥ 45 且具备官方 cost.csv 计费单价的在役模型。加权均价 ($/1M) = (输入单价 + 3 × 输出单价) / 4；性价比分 = 综合分 / ∛加权均价，数值越高代表同成本下长程真实能力越强。',
};

const OFFICIAL_DISCLAIMER =
  '本站榜单数据定时直接抓取自 LiveBench 2.0（https://livebench.ai/#/）官方公开评测表与成本统计（table.csv / categories.json / cost.csv），并辅以 OpenRouter 公开模型目录校准上下文长度，仅供开发者学习与选型参考。由于 AI 模型持续更新、各家推理档位与区域计费可能变动，具体性能与价格请以厂商官方与 LiveBench 原始页面为准。本站不对因使用该数据造成的任何决策损失负责。';

interface LiveBenchModelMeta {
  displayName?: string;
  organization?: string;
  url?: string;
  huggingface?: string;
  openweight?: boolean;
  effort?: string;
  reasoner?: boolean;
}

interface LiveBenchCategories {
  _overall_weights?: Record<string, number>;
  [category: string]: string[] | Record<string, number> | undefined;
}

interface LiveBenchCostRow {
  model: string;
  input_price_per_million?: string;
  output_price_per_million?: string;
  avg_input_tokens?: string;
  avg_output_tokens?: string;
}

interface OpenRouterModelRaw {
  id: string;
  name: string;
  created?: number;
  context_length?: number;
  hugging_face_id?: string | null;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

interface NormalizedModel {
  modelSlug: string;
  modelName: string;
  provider: string;
  licenseType: LicenseType;
  licenseLabel: string;
  overallScore: number;
  codingScore: number | null;
  mathScore: number | null;
  reasoningScore: number | null;
  contextWindowK: number;
  inputPricePer1MUsd: number | null;
  outputPricePer1MUsd: number | null;
  blendedPricePer1MUsd: number;
  highlights: string[];
  officialUrl: string;
}

const PROVIDER_NAME_ALIASES: Record<string, string> = {
  Alibaba: 'Qwen',
  'Moonshot AI': 'MoonshotAI',
  'Mistral AI': 'Mistral',
  'Z.AI': 'Z.ai',
  'Abacus.AI': 'AbacusAI',
};

function normalizeProvider(org: string | undefined, fallbackId: string): string {
  if (org && org.trim()) {
    const trimmed = org.trim();
    return PROVIDER_NAME_ALIASES[trimmed] ?? trimmed;
  }
  const prefix = fallbackId.split(/[-_]/)[0]?.toLowerCase() ?? '';
  if (prefix === 'claude') return 'Anthropic';
  if (prefix === 'gpt') return 'OpenAI';
  if (prefix === 'gemini' || prefix === 'gemma') return 'Google';
  if (prefix === 'deepseek') return 'DeepSeek';
  if (prefix === 'qwen') return 'Qwen';
  if (prefix === 'glm') return 'Z.ai';
  if (prefix === 'grok') return 'xAI';
  if (prefix === 'kimi') return 'MoonshotAI';
  if (prefix === 'mistral') return 'Mistral';
  return 'Other';
}

function roundScore(val: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
}

function roundUsd(val: number): number {
  return Math.round(val * 10000) / 10000;
}

function parseCsvRows(csvText: string): Record<string, string>[] {
  const lines = csvText
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? '').trim();
    }
    rows.push(row);
  }
  return rows;
}

/**
 * 从 JS bundle 中提取从某 `{` 开始并严格配对 `}` 的对象字面量文本，
 * 随后无 eval 地转换为合法 JSON 解析，避免因代码压缩混淆导致解析失稳。
 */
function extractBalancedObjectAround(js: string, anchorNeedle: string): string | null {
  const anchorIdx = js.indexOf(anchorNeedle);
  if (anchorIdx === -1) return null;

  // 向左回溯找到外层词典对象的起始 `{`
  let scan = anchorIdx - 1;
  let innerDepth = 0;
  let objStart = -1;
  while (scan >= 0) {
    const ch = js[scan];
    if (ch === '}') innerDepth++;
    else if (ch === '{') {
      if (innerDepth === 0) {
        objStart = scan;
        break;
      }
      innerDepth--;
    }
    scan--;
  }
  if (objStart === -1) return null;

  let depth = 0;
  let inStr = false;
  let quoteChar = '';
  let escaped = false;
  for (let i = objStart; i < js.length; i++) {
    const ch = js[i];
    if (inStr) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quoteChar) {
        inStr = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = true;
      quoteChar = ch;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return js.slice(objStart, i + 1);
      }
    }
  }
  return null;
}

function parseJsObjectLiteralToJson<T>(raw: string): T {
  let out = '';
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < raw.length) {
        if (raw[j] === '\\') {
          j += 2;
          continue;
        }
        if (raw[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      out += raw.slice(i, j);
      i = j;
    } else if (raw.slice(i, i + 2) === '!0') {
      out += 'true';
      i += 2;
    } else if (raw.slice(i, i + 2) === '!1') {
      out += 'false';
      i += 2;
    } else if (/[A-Za-z_$]/.test(ch) && (out.endsWith('{') || out.endsWith(','))) {
      let j = i;
      while (j < raw.length && /[A-Za-z0-9_$]/.test(raw[j])) j++;
      if (raw[j] === ':') {
        out += `"${raw.slice(i, j)}"`;
        i = j;
      } else {
        out += ch;
        i++;
      }
    } else {
      out += ch;
      i++;
    }
  }
  return JSON.parse(out) as T;
}

function extractReleaseIds(js: string): string[] {
  const candidates = new Set<string>();
  const arrayMatches = js.matchAll(/\[([^\]]*"202[5-9]\d{4}"[^\]]*)\]/g);
  for (const m of arrayMatches) {
    for (const item of m[1].matchAll(/"(202[5-9]\d{4})"/g)) {
      candidates.add(item[1]);
    }
  }
  return Array.from(candidates).sort((a, b) => b.localeCompare(a));
}

function formatReleaseDate(releaseId: string): string {
  if (/^\d{8}$/.test(releaseId)) {
    return `${releaseId.slice(0, 4)}-${releaseId.slice(4, 6)}-${releaseId.slice(6, 8)}`;
  }
  return releaseId;
}

function matchOpenRouterContext(
  liveBenchId: string,
  orModels: OpenRouterModelRaw[]
): OpenRouterModelRaw | null {
  const target = liveBenchId.toLowerCase();
  const nonBatch = orModels.filter((m) => !m.id.includes(':batch'));

  // 1. 精确匹配 OpenRouter ID 尾段（去掉厂商前缀与免费标识）
  for (const m of nonBatch) {
    const slug = m.id.replace(/^~/, '').split('/')[1]?.replace(/:free$/, '').toLowerCase();
    if (slug === target) return m;
  }

  // 2. 常见命名尾缀与日期版本对齐（排除 :batch、避免跨版本号误匹配）
  const aliases = [
    `${target}-it`,
    `${target}-pro`,
    `${target}-prime`,
    `${target}-contributor`,
    `${target}-2-small`,
    target.replace(/-1\.0$/, ''),
    `${target}-instruct`,
  ];
  for (const alias of aliases) {
    for (const m of nonBatch) {
      const slug = m.id.replace(/^~/, '').split('/')[1]?.replace(/:free$/, '').toLowerCase();
      if (slug === alias) return m;
    }
  }

  // 3. 日期后缀（如 qwen3.8-max -> qwen3.8-max-0902）及词序置换（nemotron-super-vl-3.5）
  for (const m of nonBatch) {
    const slug = m.id.replace(/^~/, '').split('/')[1]?.replace(/:free$/, '').toLowerCase();
    if (!slug) continue;
    if (slug.startsWith(`${target}-`) && /^\d{4}$/.test(slug.slice(target.length + 1))) {
      return m;
    }
  }

  const targetTokens = target.split('-').filter(Boolean).sort().join('|');
  for (const m of nonBatch) {
    const slug = m.id.replace(/^~/, '').split('/')[1]?.replace(/:free$/, '').toLowerCase();
    if (!slug) continue;
    if (slug.split('-').filter(Boolean).sort().join('|') === targetTokens) {
      return m;
    }
  }

  return null;
}

async function fetchOpenRouterCatalog(): Promise<OpenRouterModelRaw[]> {
  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'hailan-ai-leaderboard-sync/2.0',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`⚠️ OpenRouter 目录返回 HTTP ${res.status}，将跳过上下文补全`);
      return [];
    }
    const json = (await res.json()) as { data?: OpenRouterModelRaw[] };
    return json.data ?? [];
  } catch (err) {
    console.warn('⚠️ 请求 OpenRouter 目录异常，将使用默认上下文:', err);
    return [];
  }
}

async function fetchLiveBenchData(): Promise<{
  releaseId: string;
  releaseDate: string;
  models: NormalizedModel[];
}> {
  const htmlRes = await fetch(LIVEBENCH_BASE_URL, {
    headers: { 'User-Agent': 'ai-hub-leaderboard-sync/2.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!htmlRes.ok) {
    throw new Error(`访问 LiveBench 首页失败: HTTP ${htmlRes.status}`);
  }
  const html = await htmlRes.text();
  const scriptMatch = html.match(/src=["']([^"']*static\/js\/main\.[^"']+\.js)["']/);
  if (!scriptMatch?.[1]) {
    throw new Error('未能在 LiveBench 页面中定位前端主脚本 (main.*.js)');
  }

  const bundleUrl = new URL(scriptMatch[1], LIVEBENCH_BASE_URL).toString();
  const jsRes = await fetch(bundleUrl, {
    headers: { 'User-Agent': 'ai-hub-leaderboard-sync/2.0' },
    signal: AbortSignal.timeout(20000),
  });
  if (!jsRes.ok) {
    throw new Error(`拉取 LiveBench 脚本失败 (${bundleUrl}): HTTP ${jsRes.status}`);
  }
  const js = await jsRes.text();

  const releases = extractReleaseIds(js);
  if (releases.length === 0) {
    throw new Error('未能在 LiveBench 脚本中解析到版本号 (YYYYMMDD)');
  }

  const metaObjRaw =
    extractBalancedObjectAround(js, '"claude-opus-5.5":{displayName:') ??
    extractBalancedObjectAround(js, '"gemini-4-carbon":{displayName:') ??
    extractBalancedObjectAround(js, '"gpt-6-astra":{displayName:');
  if (!metaObjRaw) {
    throw new Error('未能在 LiveBench 脚本中定位模型元数据字典');
  }
  const modelMetaMap = parseJsObjectLiteralToJson<Record<string, LiveBenchModelMeta>>(metaObjRaw);

  // 从最新版本往下探测可读取的 data/<releaseId>/table.csv
  let activeRelease = '';
  let tableText = '';
  let catsJson: LiveBenchCategories | null = null;
  let costText = '';

  for (const rel of releases) {
    const baseDataUrl = new URL(`data/${rel}/`, LIVEBENCH_BASE_URL).toString();
    const [tRes, cRes, pRes] = await Promise.all([
      fetch(`${baseDataUrl}table.csv`, { signal: AbortSignal.timeout(15000) }),
      fetch(`${baseDataUrl}categories.json`, { signal: AbortSignal.timeout(15000) }),
      fetch(`${baseDataUrl}cost.csv`, { signal: AbortSignal.timeout(15000) }).catch(() => null),
    ]);
    if (tRes.ok && cRes.ok) {
      activeRelease = rel;
      tableText = await tRes.text();
      catsJson = (await cRes.json()) as LiveBenchCategories;
      costText = pRes && pRes.ok ? await pRes.text() : '';
      break;
    }
  }

  if (!activeRelease || !tableText || !catsJson) {
    throw new Error(`无法拉取 LiveBench 发布版数据 (${releases.join(', ')})`);
  }

  const orModels = await fetchOpenRouterCatalog();
  const tableRows = parseCsvRows(tableText);
  const costRows = costText ? parseCsvRows(costText) : [];
  const costMap = new Map<string, LiveBenchCostRow>();
  for (const c of costRows) {
    if (c.model) costMap.set(c.model, c as unknown as LiveBenchCostRow);
  }

  const weights = catsJson._overall_weights ?? {};
  const suiteEntries = Object.entries(catsJson).filter(
    ([k, v]) => k !== '_overall_weights' && Array.isArray(v)
  ) as [string, string[]][];

  const models: NormalizedModel[] = [];
  for (const row of tableRows) {
    const modelId = row.model;
    if (!modelId) continue;

    let weightedSum = 0;
    let totalWeight = 0;
    const catScores = new Map<string, number>();

    for (const [catName, cols] of suiteEntries) {
      const nums = cols
        .map((col) => {
          const rawVal = row[col];
          if (!rawVal || rawVal === '-') return NaN;
          return Number(rawVal);
        })
        .filter((n) => Number.isFinite(n));

      if (nums.length > 0) {
        const avg = nums.reduce((acc, v) => acc + v, 0) / nums.length;
        catScores.set(catName, avg);
        const w = Number(weights[catName] ?? 1);
        const effWeight = Number.isFinite(w) && w > 0 ? w : 1;
        weightedSum += avg * effWeight;
        totalWeight += effWeight;
      }
    }

    if (totalWeight <= 0) continue;

    const overallScore = roundScore(weightedSum / totalWeight, 2);
    const codingRaw = catScores.get('Coding');
    const reasoningRaw = catScores.get('Reasoning');
    const longAgenticRaw = catScores.get('Long Agentic');
    const browserRaw = catScores.get('Browser');
    const researchRaw = catScores.get('Research');
    const designRaw = catScores.get('Design');

    const meta = modelMetaMap[modelId] ?? {};
    const orMatch = matchOpenRouterContext(modelId, orModels);
    const costRow = costMap.get(modelId);

    let inputPrice = costRow?.input_price_per_million
      ? Number(costRow.input_price_per_million)
      : NaN;
    let outputPrice = costRow?.output_price_per_million
      ? Number(costRow.output_price_per_million)
      : NaN;

    if ((!Number.isFinite(inputPrice) || !Number.isFinite(outputPrice)) && orMatch?.pricing) {
      const orPrompt = Number(orMatch.pricing.prompt);
      const orComp = Number(orMatch.pricing.completion);
      if (Number.isFinite(orPrompt) && Number.isFinite(orComp)) {
        inputPrice = roundUsd(orPrompt * 1_000_000);
        outputPrice = roundUsd(orComp * 1_000_000);
      }
    }

    const validInput = Number.isFinite(inputPrice) && inputPrice >= 0 ? roundUsd(inputPrice) : null;
    const validOutput =
      Number.isFinite(outputPrice) && outputPrice >= 0 ? roundUsd(outputPrice) : null;
    const blendedPrice =
      validInput !== null && validOutput !== null ? (validInput + 3 * validOutput) / 4 : 0;

    const contextWindowK = orMatch?.context_length
      ? Math.max(1, Math.round(orMatch.context_length / 1000))
      : 128;

    const isOpenWeights = Boolean(meta.openweight || orMatch?.hugging_face_id);
    const licenseType: LicenseType = isOpenWeights ? 'open_weights' : 'proprietary';
    const licenseLabel = isOpenWeights ? '开源权重' : '闭源商用';

    const provider = normalizeProvider(meta.organization, modelId);
    const rawEffortMatch = meta.displayName?.match(/\((x?high|max|medium|low)\)\s*$/i);
    const evalConfig = meta.effort?.trim() || rawEffortMatch?.[1]?.toLowerCase() || null;
    const displayName =
      meta.displayName?.replace(/\s*\((x?high|max|medium|low)\)$/i, '').trim() || modelId;

    const highlights: string[] = [`LB2:${overallScore.toFixed(1)}`];
    if (evalConfig) {
      highlights.push(`测试配置:${evalConfig}`);
    }
    if (longAgenticRaw !== undefined) {
      highlights.push(`长程Agent:${longAgenticRaw.toFixed(1)}`);
    }
    const extraHighlightCandidates = [
      researchRaw !== undefined ? { label: '科研', val: researchRaw } : null,
      browserRaw !== undefined ? { label: '浏览器', val: browserRaw } : null,
      designRaw !== undefined ? { label: '设计', val: designRaw } : null,
    ].filter((x): x is { label: string; val: number } => x !== null);
    if (extraHighlightCandidates.length > 0) {
      extraHighlightCandidates.sort((a, b) => b.val - a.val);
      const best = extraHighlightCandidates[0];
      highlights.push(`${best.label}:${best.val.toFixed(1)}`);
    }
    if (contextWindowK >= 1000) {
      highlights.push('1M+上下文');
    } else if (isOpenWeights) {
      highlights.push('开源权重');
    }

    const modelSlug = orMatch?.id.replace(/^~/, '') || `livebench/${modelId}`;
    const officialUrl =
      meta.url ||
      meta.huggingface ||
      (orMatch ? `https://openrouter.ai/${orMatch.id.replace(/^~/, '')}` : LIVEBENCH_BASE_URL);

    models.push({
      modelSlug,
      modelName: displayName,
      provider,
      licenseType,
      licenseLabel,
      overallScore,
      codingScore: codingRaw !== undefined ? roundScore(codingRaw, 1) : null,
      mathScore: null,
      reasoningScore: reasoningRaw !== undefined ? roundScore(reasoningRaw, 1) : null,
      contextWindowK,
      inputPricePer1MUsd: validInput,
      outputPricePer1MUsd: validOutput,
      blendedPricePer1MUsd: blendedPrice,
      highlights,
      officialUrl,
    });
  }

  return {
    releaseId: activeRelease,
    releaseDate: formatReleaseDate(activeRelease),
    models,
  };
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
  console.log('🚀 开始从 LiveBench 2.0 (https://livebench.ai/#/) 抓取最新 AI 模型榜单...');

  try {
    const { releaseId, releaseDate, models: allModels } = await fetchLiveBenchData();
    console.log(
      `📊 已载入 LiveBench 2.0 官方数据集 (发布版: ${releaseId} / ${releaseDate}, 有效模型: ${allModels.length} 款)`
    );

    if (allModels.length < 15) {
      throw new Error(`有效基准模型数量异常过少 (${allModels.length})，中止覆盖以保护线上快照`);
    }

    const overallModels = [...allModels].sort((a, b) => b.overallScore - a.overallScore);

    const openSourceModels = overallModels.filter((m) => m.licenseType === 'open_weights');

    const apiValueModels = [...allModels]
      .filter((m) => m.overallScore >= 45 && m.blendedPricePer1MUsd > 0)
      .sort((a, b) => {
        const valueA = a.overallScore / Math.cbrt(a.blendedPricePer1MUsd);
        const valueB = b.overallScore / Math.cbrt(b.blendedPricePer1MUsd);
        return valueB - valueA;
      });

    const boards: BoardSpec[] = [
      {
        category: 'overall',
        title: 'AI 大模型综合能力榜',
        shortLabel: '综合能力',
        description:
          '直连 LiveBench 2.0 无污染长程基准，覆盖 Long Agentic、编程、复杂推理、浏览器与科研设计七维实测。',
        models: overallModels,
      },
      {
        category: 'open_source',
        title: '开源大模型能力榜',
        shortLabel: '开源模型',
        description:
          '筛选 LiveBench 2.0 认证的开源权重模型（DeepSeek / Qwen / GLM / Kimi / Mistral / Gemma 等）及实测成本。',
        models: openSourceModels,
      },
      {
        category: 'api_value',
        title: 'API 性价比排行榜',
        shortLabel: 'API 性价比',
        description:
          '结合 LiveBench 2.0 真实综合分与官方 cost.csv 1:3 加权输入输出单价，评估长程任务性价比。',
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
          source_name: `LiveBench 2.0 (${releaseDate}) · OpenRouter 上下文`,
          source_url: LIVEBENCH_BASE_URL,
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
      console.log(
        `✅ [${board.category}] 已激活新快照 (${modelRows.length} 款)，Top 5: ${board.models
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
      `\n🎉 LiveBench 2.0 同步完成！共收录 ${allModels.length} 款参评模型，三大榜单累计写入 ${totalUpserted} 条记录。`
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
      // 忽略写入失败审计日志时的二次网络异常
    }

    console.error('❌ LiveBench 2.0 同步失败:', message);
    process.exit(1);
  }
}

main();
