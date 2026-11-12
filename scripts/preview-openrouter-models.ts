/**
 * 只读预览脚本：从 OpenRouter 公开 API 拉取并清洗主流大模型列表，不触碰任何数据库表。
 * 运行方式：npx tsx scripts/preview-openrouter-models.ts
 */

interface OpenRouterPricing {
  prompt?: string;
  completion?: string;
}

interface OpenRouterBenchmarks {
  artificial_analysis?: {
    intelligence_index?: number | null;
    coding_index?: number | null;
    agentic_index?: number | null;
  };
}

interface OpenRouterModelRaw {
  id: string;
  canonical_slug?: string;
  hugging_face_id?: string | null;
  name: string;
  created?: number;
  context_length?: number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: OpenRouterPricing;
  expiration_date?: string | null;
  endpoints?: string[];
  benchmarks?: OpenRouterBenchmarks;
}

interface CleanedModel {
  id: string;
  provider: string;
  displayName: string;
  licenseType: 'open_weights' | 'proprietary';
  contextK: number;
  inputPer1M: number;
  outputPer1M: number;
  intelligenceIndex: number | null;
  codingIndex: number | null;
  agenticIndex: number | null;
  createdIso: string;
}

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

/** 排除测试、免费限流、批处理及带日期旧版本噪音 */
function isNoiseVariant(model: OpenRouterModelRaw): string | null {
  const idLower = model.id.toLowerCase();
  const nameLower = model.name.toLowerCase();

  // 1. 排除所有冒号后缀变体（:free, :batch, :extended, :thinking, :exacto 等）
  if (idLower.includes(':')) {
    return 'colon_variant';
  }

  // 2. 排除路由聚合器或非具体模型
  if (idLower.startsWith('openrouter/') || idLower.startsWith('switchpoint/')) {
    return 'meta_router';
  }

  // 3. 排除预览、实验、测试、Free 等标签变体
  if (
    /(-preview|-exp\b|-experimental|-alpha|-beta|-test|\(free\)|\(preview\)|\(batch\))/i.test(
      `${idLower} ${nameLower}`
    )
  ) {
    return 'preview_or_experimental';
  }

  // 4. 排除末尾带日期版本号的旧快照（如 -20240229, -2025-04-14, -0528）
  if (/-\d{8}$|-\d{4}-\d{2}-\d{2}$|-\d{4}$/.test(idLower)) {
    return 'dated_snapshot';
  }

  // 5. 排除已标注过期时间的弃用模型
  if (model.expiration_date) {
    const expMs = Date.parse(model.expiration_date);
    if (!Number.isNaN(expMs) && expMs <= Date.now()) {
      return 'expired';
    }
  }

  // 6. 仅保留支持标准文本/对话补全且输出包含 text 的模型
  const outputModalities = model.architecture?.output_modalities ?? [];
  if (outputModalities.length > 0 && !outputModalities.includes('text')) {
    return 'non_text_output';
  }
  const endpoints = model.endpoints ?? [];
  if (endpoints.length > 0 && !endpoints.includes('/api/v1/chat/completions')) {
    return 'non_chat_endpoint';
  }

  return null;
}

function roundUsd(value: number): number {
  if (value === 0) return 0;
  return Number(value.toFixed(value < 0.1 ? 4 : 2));
}

function cleanDisplayName(rawName: string): string {
  // 去掉开头的 "OpenAI: " / "Anthropic: " 前缀，保留简洁模型名
  const idx = rawName.indexOf(':');
  return idx > 0 ? rawName.slice(idx + 1).trim() : rawName.trim();
}

function extractProvider(rawId: string, rawName: string): string {
  const idx = rawName.indexOf(':');
  if (idx > 0) return rawName.slice(0, idx).trim();
  return rawId.split('/')[0] ?? 'unknown';
}

async function main() {
  console.log(`🔎 正在只读拉取 OpenRouter 模型目录：${OPENROUTER_MODELS_URL}\n`);

  const response = await fetch(OPENROUTER_MODELS_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as { data?: OpenRouterModelRaw[] };
  const rawModels = payload.data ?? [];

  const rejectStats: Record<string, number> = {};
  const cleaned: CleanedModel[] = [];

  for (const m of rawModels) {
    const rejectReason = isNoiseVariant(m);
    if (rejectReason) {
      rejectStats[rejectReason] = (rejectStats[rejectReason] ?? 0) + 1;
      continue;
    }

    const promptPerToken = Number(m.pricing?.prompt);
    const completionPerToken = Number(m.pricing?.completion);
    if (
      !Number.isFinite(promptPerToken) ||
      !Number.isFinite(completionPerToken) ||
      promptPerToken < 0 ||
      completionPerToken < 0
    ) {
      rejectStats.invalid_pricing = (rejectStats.invalid_pricing ?? 0) + 1;
      continue;
    }

    const aa = m.benchmarks?.artificial_analysis;
    cleaned.push({
      id: m.id,
      provider: extractProvider(m.id, m.name),
      displayName: cleanDisplayName(m.name),
      licenseType: m.hugging_face_id ? 'open_weights' : 'proprietary',
      contextK: Math.round((m.context_length ?? 0) / 1000),
      inputPer1M: roundUsd(promptPerToken * 1_000_000),
      outputPer1M: roundUsd(completionPerToken * 1_000_000),
      intelligenceIndex:
        typeof aa?.intelligence_index === 'number' ? aa.intelligence_index : null,
      codingIndex: typeof aa?.coding_index === 'number' ? aa.coding_index : null,
      agenticIndex: typeof aa?.agentic_index === 'number' ? aa.agentic_index : null,
      createdIso: m.created
        ? new Date(m.created * 1000).toISOString().slice(0, 10)
        : 'unknown',
    });
  }

  const withBenchmark = cleaned
    .filter((m) => m.intelligenceIndex !== null)
    .sort((a, b) => (b.intelligenceIndex ?? 0) - (a.intelligenceIndex ?? 0));

  const openWeightsTop = withBenchmark.filter(
    (m) => m.licenseType === 'open_weights'
  );

  console.log(`📊 原始条目总数: ${rawModels.length}`);
  console.log(`🧹 过滤噪音统计: ${JSON.stringify(rejectStats)}`);
  console.log(
    `✅ 清洗后有效主力模型: ${cleaned.length} 条（其中含 Artificial Analysis 基准分: ${withBenchmark.length} 条）\n`
  );

  console.log('=== 🏆 综合基准 Top 10 主流旗舰模型（USD / 1M Tokens） ===');
  console.table(
    withBenchmark.slice(0, 10).map((m, i) => ({
      排名: i + 1,
      模型名: m.displayName,
      机构: m.provider,
      权重类型: m.licenseType === 'open_weights' ? '开源' : '闭源',
      上下文: `${m.contextK}K`,
      '输入($/1M)': m.inputPer1M,
      '输出($/1M)': m.outputPer1M,
      AA综合分: m.intelligenceIndex,
      代码分: m.codingIndex ?? '-',
      Agent分: m.agenticIndex ?? '-',
      Slug: m.id,
    }))
  );

  console.log('\n=== 🧩 开源权重模型 Top 5 预览 ===');
  console.table(
    openWeightsTop.slice(0, 5).map((m, i) => ({
      排名: i + 1,
      模型名: m.displayName,
      机构: m.provider,
      上下文: `${m.contextK}K`,
      '输入($/1M)': m.inputPer1M,
      '输出($/1M)': m.outputPer1M,
      AA综合分: m.intelligenceIndex,
      Slug: m.id,
    }))
  );
}

main().catch((err) => {
  console.error('❌ 只读预览失败:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
