import { createClient } from '@supabase/supabase-js';
import {
  MOCK_LEADERBOARDS,
  type LeaderboardCategory,
} from '../src/data/leaderboard/mock-data';
import { MOCK_SEARCH_ITEMS } from '../src/data/search/mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌ 缺少环境变量：请确保 .env.local 中已配置 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

/**
 * 兼容 Supabase 新版密钥格式（sb_publishable_ / sb_secret_）
 * 关闭会话持久化与自动刷新令牌，适用于 Node 服务端脚本。
 */
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const DB_SOURCE_NAME_MAP: Record<LeaderboardCategory, string> = {
  overall: 'AI 智搜数据库 · 综合基准聚合快照',
  open_source: 'AI 智搜数据库 · 开源模型评测快照',
  api_value: 'AI 智搜数据库 · API 定价与吞吐快照',
};

async function seedLeaderboards() {
  const categories = Object.keys(MOCK_LEADERBOARDS) as LeaderboardCategory[];
  let totalModels = 0;

  for (const category of categories) {
    const snap = MOCK_LEADERBOARDS[category];

    const { error: resetError } = await supabase
      .from('leaderboard_snapshots')
      .update({ is_latest: false })
      .eq('category', category)
      .eq('is_latest', true);

    if (resetError) {
      throw new Error(`重置旧快照失败 (${category}): ${resetError.message}`);
    }

    const { data: insertedSnap, error: snapError } = await supabase
      .from('leaderboard_snapshots')
      .insert({
        category: snap.category,
        title: snap.title,
        short_label: snap.shortLabel,
        description: snap.description,
        source_name: DB_SOURCE_NAME_MAP[category],
        source_url: snap.sourceUrl,
        is_mock_data: false,
        methodology_note: snap.methodologyNote,
        disclaimer:
          '本榜单数据读取自 Supabase PostgreSQL 定时快照，保留来源链接与更新时间，不承诺毫秒级实时性，仅供选型参考。',
        snapshot_at: snap.updatedAt,
        is_latest: true,
      })
      .select('id')
      .single();

    if (snapError || !insertedSnap) {
      throw new Error(`写入榜单快照失败 (${category}): ${snapError?.message}`);
    }

    const modelRows = snap.entries.map((entry) => ({
      snapshot_id: insertedSnap.id,
      category: snap.category,
      model_slug: entry.modelSlug,
      model_name: entry.modelName.replace(/\s*\(Mock\)$/i, ''),
      provider: entry.provider,
      license_type: entry.licenseType,
      license_label: entry.licenseLabel,
      rank: entry.rank,
      rank_delta: entry.rankDelta,
      score_overall: entry.scores.overall,
      score_coding: entry.scores.coding ?? null,
      score_math: entry.scores.math ?? null,
      score_reasoning: entry.scores.reasoning ?? null,
      context_window_k: entry.contextWindowK,
      input_price_per_1m_usd: entry.pricing?.inputPer1MUsd ?? null,
      output_price_per_1m_usd: entry.pricing?.outputPer1MUsd ?? null,
      speed_tokens_per_sec: entry.speedTokensPerSec ?? null,
      highlights: entry.highlights,
      official_url: entry.officialUrl,
      is_active: true,
    }));

    const { error: modelsError } = await supabase
      .from('ai_models')
      .upsert(modelRows, { onConflict: 'snapshot_id,model_slug' });

    if (modelsError) {
      throw new Error(`写入模型条目失败 (${category}): ${modelsError.message}`);
    }

    totalModels += modelRows.length;
  }

  return totalModels;
}

async function seedResources() {
  const resourceRows = MOCK_SEARCH_ITEMS.map((item) => ({
    slug: item.id,
    type: item.type,
    title: item.title.replace(/（Mock）$/i, ''),
    original_title: item.originalTitle ?? null,
    description: item.description,
    tags: item.tags,
    source: item.source,
    author: item.author,
    published_at: item.publishedAt,
    updated_at: item.updatedAt,
    url: item.url,
    favorite_count: item.favoriteCount,
    credibility_label: item.credibilityLabel,
    is_mock_data: false,
    status: 'published',
    link_status: 'ok',
  }));

  const { error } = await supabase
    .from('ai_resources')
    .upsert(resourceRows, { onConflict: 'slug' });

  if (error) {
    throw new Error(`导入 ai_resources 失败: ${error.message}`);
  }

  return resourceRows.length;
}

async function main() {
  const startedAt = new Date();
  console.log('🚀 开始向 Supabase 导入初始数据...');

  try {
    const modelCount = await seedLeaderboards();
    const resourceCount = await seedResources();
    const finishedAt = new Date();

    const { error: logError } = await supabase.from('sync_logs').insert([
      {
        job_name: 'seed_initial_mock',
        target_table: 'ai_models',
        status: 'success',
        fetched_count: modelCount,
        upserted_count: modelCount,
        started_at: startedAt.toISOString(),
        finished_at: finishedAt.toISOString(),
        duration_ms: finishedAt.getTime() - startedAt.getTime(),
      },
      {
        job_name: 'seed_initial_mock',
        target_table: 'ai_resources',
        status: 'success',
        fetched_count: resourceCount,
        upserted_count: resourceCount,
        started_at: startedAt.toISOString(),
        finished_at: finishedAt.toISOString(),
        duration_ms: finishedAt.getTime() - startedAt.getTime(),
      },
    ]);

    if (logError) {
      console.warn('⚠️ 写入 sync_logs 警告:', logError.message);
    }

    console.log(
      `✅ 导入完成：leaderboard_snapshots 3 条，ai_models ${modelCount} 条，ai_resources ${resourceCount} 条。`
    );
  } catch (err) {
    const finishedAt = new Date();
    const message = err instanceof Error ? err.message : String(err);
    await supabase.from('sync_logs').insert({
      job_name: 'seed_initial_mock',
      target_table: 'all',
      status: 'failed',
      error_message: message,
      started_at: startedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
    });
    console.error('❌ 导入失败：', message);
    process.exit(1);
  }
}

main();
