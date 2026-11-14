'use client';

import type { RefObject } from 'react';
import type { LeaderboardSnapshot } from '@/data/leaderboard/mock-data';
import {
  formatContextWindow,
  formatUpdatedTime,
  getScoreSourceInfo,
} from '@/lib/leaderboard/helpers';
import { SITE_BRAND } from '@/config/brand';
import {
  MiniQrGraphic,
  POSTER_FONT_STACK,
  SHARE_SITE_DOMAIN,
} from '@/components/share/SharePosterPrimitives';

interface LeaderboardSharePosterProps {
  posterRef: RefObject<HTMLDivElement | null>;
  snapshot: LeaderboardSnapshot;
}

const RANK_THEME: Record<
  number,
  { badgeBg: string; badgeText: string; badgeBorder: string; accent: string; cardBorder: string }
> = {
  1: {
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    badgeBorder: '#FCD34D',
    accent: '#2563EB',
    cardBorder: '#60A5FA',
  },
  2: {
    badgeBg: '#E2E8F0',
    badgeText: '#1E293B',
    badgeBorder: '#CBD5E1',
    accent: '#0284C7',
    cardBorder: '#CBD5E1',
  },
  3: {
    badgeBg: '#FFEDD5',
    badgeText: '#9A3412',
    badgeBorder: '#FDBA74',
    accent: '#0D9488',
    cardBorder: '#CBD5E1',
  },
};

/**
 * 大模型 Top 3 跑分对比长图模板（固定 800px 宽，梯度边框 + 科技网格 + 权威数据源印章）
 */
export function LeaderboardSharePoster({ posterRef, snapshot }: LeaderboardSharePosterProps) {
  const topThree = snapshot.entries.slice(0, 3);
  const updatedText = `${formatUpdatedTime(snapshot.updatedAt)} (UTC+8)`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      {/* 外层渐变边框容器 */}
      <div
        id="share-card-leaderboard"
        ref={posterRef}
        style={{
          width: 800,
          padding: 3,
          background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 48%, #0F172A 100%)',
          fontFamily: POSTER_FONT_STACK,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            backgroundColor: '#F8FAFC',
            overflow: 'hidden',
          }}
        >
          {/* 顶部网格星芒头图 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #091732 0%, #102A56 58%, #0C5F7A 100%)',
              backgroundImage:
                'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(135deg, #091732 0%, #102A56 58%, #0C5F7A 100%)',
              backgroundSize: '24px 24px, 24px 24px, 100% 100%',
              padding: '26px 32px 24px',
              color: '#FFFFFF',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    backgroundColor: '#FFFFFF',
                    padding: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(2, 12, 34, 0.35)',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- html-to-image 需直接读取同源位图 */}
                  <img
                    src="/brand/hailan-ai-mark-v2.png"
                    alt={SITE_BRAND.name}
                    crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        borderRadius: 999,
                        padding: '3px 10px',
                        backgroundColor: 'rgba(34,211,238,0.18)',
                        border: '1px solid rgba(103,232,249,0.4)',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#A5F3FC',
                      }}
                    >
                      ✦ 权威模型跑分速览
                    </span>
                    <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500 }}>
                      {snapshot.title}
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: '8px 0 0',
                      fontSize: 24,
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: '#FFFFFF',
                      lineHeight: 1.25,
                    }}
                  >
                    海兰 AI · 2026 最新大模型跑分对比榜
                  </h2>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',
                  flexShrink: 0,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  padding: '9px 14px',
                }}
              >
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 600 }}>最后更新</div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#E0F2FE',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {updatedText}
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 跑分并排卡片 */}
          <div style={{ padding: '24px 28px 18px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              {topThree.map((entry) => {
                const theme = RANK_THEME[entry.rank] ?? RANK_THEME[2];
                const scoreSource = getScoreSourceInfo(entry);

                return (
                  <div
                    key={entry.id}
                    style={{
                      borderRadius: 16,
                      border: entry.rank === 1 ? `2px solid ${theme.cardBorder}` : `1px solid ${theme.cardBorder}`,
                      backgroundColor: '#FFFFFF',
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow:
                        entry.rank === 1
                          ? '0 10px 26px rgba(37, 99, 235, 0.12)'
                          : '0 4px 12px rgba(15, 23, 42, 0.04)',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px 10px',
                            borderRadius: 8,
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText,
                            border: `1px solid ${theme.badgeBorder}`,
                            fontSize: 13,
                            fontWeight: 800,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          #{entry.rank}
                        </span>
                        <span
                          style={{
                            borderRadius: 999,
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor:
                              entry.licenseType === 'open_weights' ? '#ECFDF5' : '#F1F5F9',
                            color: entry.licenseType === 'open_weights' ? '#047857' : '#475569',
                          }}
                        >
                          {entry.licenseLabel}
                        </span>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            color: '#0F172A',
                            lineHeight: 1.3,
                          }}
                        >
                          {entry.modelName}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#64748B',
                          }}
                        >
                          {entry.provider}
                        </div>
                      </div>
                    </div>

                    {/* 底部核心指标矩阵 */}
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 14,
                        borderTop: '1px solid #F1F5F9',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                          综合能力分
                        </span>
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: theme.accent,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {entry.scores.overall.toFixed(1)}
                        </span>
                      </div>

                      {/* 能力分进度条 */}
                      <div
                        style={{
                          marginTop: 7,
                          height: 6,
                          width: '100%',
                          borderRadius: 999,
                          backgroundColor: '#E2E8F0',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, Math.max(0, entry.scores.overall))}%`,
                            borderRadius: 999,
                            backgroundColor: theme.accent,
                          }}
                        />
                      </div>

                      {/* 评测来源标签 */}
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 10.5,
                          fontWeight: 600,
                          color: '#64748B',
                        }}
                      >
                        评测口径：{scoreSource.shortLabel}
                      </div>

                      {/* 3 格核心参数 */}
                      <div
                        style={{
                          marginTop: 12,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                          gap: 6,
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            borderRadius: 8,
                            backgroundColor: '#F8FAFC',
                            padding: '7px 4px',
                          }}
                        >
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>代码分</div>
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: '#1E293B',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {entry.scores.coding !== undefined
                              ? entry.scores.coding.toFixed(1)
                              : '暂无'}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 8,
                            backgroundColor: '#F8FAFC',
                            padding: '7px 4px',
                          }}
                        >
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>上下文</div>
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: '#1E293B',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {formatContextWindow(entry.contextWindowK)}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 8,
                            backgroundColor: '#F8FAFC',
                            padding: '7px 4px',
                          }}
                        >
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>输入 $/1M</div>
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: '#1E293B',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {entry.pricing ? `$${entry.pricing.inputPer1MUsd.toFixed(2)}` : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 权威数据源印章条 */}
            <div
              style={{
                marginTop: 16,
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    borderRadius: 6,
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#047857',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                  }}
                >
                  ✓ 官方基准印章
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>
                  LiveBench 2.0 能力基准 · OpenRouter 上下文与 API 定价
                </span>
              </div>
              <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 500 }}>
                来源：{snapshot.sourceName}
              </span>
            </div>
          </div>

          {/* 底部品牌水印 */}
          <div
            style={{
              margin: '0 28px 24px',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              color: '#FFFFFF',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                海兰 AI ({SHARE_SITE_DOMAIN}) · 工具导航、模型榜单与实战教程
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#38BDF8', fontWeight: 600 }}>
                选对 AI，用好 AI · 实时同步全球前沿大模型表现
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#E2E8F0' }}>
                  🔍 扫码查看完整排行榜、获取高频 API 优惠
                </div>
                <div style={{ marginTop: 2, fontSize: 11, color: '#94A3B8' }}>
                  {SHARE_SITE_DOMAIN}/leaderboard
                </div>
              </div>
              <MiniQrGraphic size={58} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
