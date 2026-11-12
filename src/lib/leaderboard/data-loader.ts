import { cacheLife } from 'next/cache';
import {
  MOCK_LEADERBOARDS,
  type LeaderboardCategory,
  type LeaderboardEntry,
  type LeaderboardSnapshot,
  type LicenseType,
} from '@/data/leaderboard/mock-data';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface DbSnapshotRow {
  id: string;
  category: LeaderboardCategory;
  title: string;
  short_label: string;
  description: string;
  source_name: string;
  source_url: string;
  is_mock_data: boolean;
  methodology_note: string;
  disclaimer: string;
  snapshot_at: string;
}

interface DbModelRow {
  id: string;
  snapshot_id: string;
  model_slug: string;
  model_name: string;
  provider: string;
  license_type: LicenseType;
  license_label: string;
  rank: number;
  rank_delta: number | null;
  score_overall: number | string;
  score_coding: number | string | null;
  score_math: number | string | null;
  score_reasoning: number | string | null;
  context_window_k: number;
  input_price_per_1m_usd: number | string | null;
  output_price_per_1m_usd: number | string | null;
  speed_tokens_per_sec: number | null;
  highlights: string[] | null;
  official_url: string;
}

function toOptionalNumber(val: number | string | null): number | undefined {
  if (val === null || val === undefined) return undefined;
  const num = Number(val);
  return Number.isFinite(num) ? num : undefined;
}

function mapDbModelToEntry(row: DbModelRow): LeaderboardEntry {
  const inputPrice = toOptionalNumber(row.input_price_per_1m_usd);
  const outputPrice = toOptionalNumber(row.output_price_per_1m_usd);

  return {
    id: row.id,
    modelSlug: row.model_slug,
    modelName: row.model_name,
    provider: row.provider,
    licenseType: row.license_type,
    licenseLabel: row.license_label,
    rank: row.rank,
    rankDelta: row.rank_delta,
    scores: {
      overall: Number(row.score_overall),
      coding: toOptionalNumber(row.score_coding),
      math: toOptionalNumber(row.score_math),
      reasoning: toOptionalNumber(row.score_reasoning),
    },
    contextWindowK: row.context_window_k,
    pricing:
      inputPrice !== undefined && outputPrice !== undefined
        ? { inputPer1MUsd: inputPrice, outputPer1MUsd: outputPrice }
        : undefined,
    speedTokensPerSec: row.speed_tokens_per_sec ?? undefined,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    officialUrl: row.official_url,
  };
}

/**
 * 服务端读取所有榜单快照（优先从 Supabase 读取，异常/超时/空库自动降级为本地 Mock）。
 */
export async function getLeaderboardSnapshots(): Promise<
  Record<LeaderboardCategory, LeaderboardSnapshot>
> {
  'use cache';
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return MOCK_LEADERBOARDS;
  }

  try {
    const { data: snapshotsData, error: snapError } = await supabase
      .from('leaderboard_snapshots')
      .select(
        'id, category, title, short_label, description, source_name, source_url, is_mock_data, methodology_note, disclaimer, snapshot_at'
      )
      .eq('is_latest', true);

    if (snapError || !snapshotsData || snapshotsData.length === 0) {
      if (snapError) {
        console.warn('[leaderboard/data-loader] Supabase 读取失败，已降级 Mock:', snapError.message);
      }
      return MOCK_LEADERBOARDS;
    }

    const snapshots = snapshotsData as DbSnapshotRow[];
    const snapshotIds = snapshots.map((s) => s.id);

    const { data: modelsData, error: modelsError } = await supabase
      .from('ai_models')
      .select(
        'id, snapshot_id, model_slug, model_name, provider, license_type, license_label, rank, rank_delta, score_overall, score_coding, score_math, score_reasoning, context_window_k, input_price_per_1m_usd, output_price_per_1m_usd, speed_tokens_per_sec, highlights, official_url'
      )
      .in('snapshot_id', snapshotIds)
      .eq('is_active', true)
      .order('rank', { ascending: true });

    if (modelsError || !modelsData) {
      console.warn(
        '[leaderboard/data-loader] 模型条目读取失败，已降级 Mock:',
        modelsError?.message
      );
      return MOCK_LEADERBOARDS;
    }

    const modelsBySnapshot = new Map<string, LeaderboardEntry[]>();
    for (const row of modelsData as DbModelRow[]) {
      const list = modelsBySnapshot.get(row.snapshot_id) ?? [];
      list.push(mapDbModelToEntry(row));
      modelsBySnapshot.set(row.snapshot_id, list);
    }

    const result: Record<LeaderboardCategory, LeaderboardSnapshot> = {
      ...MOCK_LEADERBOARDS,
    };

    for (const snap of snapshots) {
      const entries = modelsBySnapshot.get(snap.id) ?? [];
      if (entries.length === 0) continue;

      result[snap.category] = {
        category: snap.category,
        title: snap.title,
        shortLabel: snap.short_label,
        description: snap.description,
        sourceName: snap.source_name,
        sourceUrl: snap.source_url,
        isMockData: Boolean(snap.is_mock_data),
        updatedAt: snap.snapshot_at,
        methodologyNote: snap.methodology_note,
        disclaimer: snap.disclaimer,
        entries,
      };
    }

    return result;
  } catch (err) {
    console.warn(
      '[leaderboard/data-loader] 请求超时或异常，已降级 Mock:',
      err instanceof Error ? err.message : String(err)
    );
    return MOCK_LEADERBOARDS;
  }
}
