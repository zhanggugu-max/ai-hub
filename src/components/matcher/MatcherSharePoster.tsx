'use client';

import type { RefObject } from 'react';
import type { MatchedToolResult } from '@/data/matcher-quiz';
import { NAV_CATEGORIES } from '@/data/nav-tools';
import { SITE_BRAND } from '@/config/brand';
import {
  MiniQrGraphic,
  POSTER_FONT_STACK,
  SHARE_SITE_DOMAIN,
} from '@/components/share/SharePosterPrimitives';

interface MatcherSharePosterProps {
  posterRef: RefObject<HTMLDivElement | null>;
  profileTags: string[];
  topOne: MatchedToolResult;
  alternatives: MatchedToolResult[];
}

function getCategoryName(category: string): string {
  return NAV_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

/**
 * `/matcher` 专属匹配结果长图模板（固定 640px 宽，使用显式 hex 配色以保证 2x 截图稳定性）
 */
export function MatcherSharePoster({
  posterRef,
  profileTags,
  topOne,
  alternatives,
}: MatcherSharePosterProps) {
  const profileSummary = profileTags.length > 0 ? profileTags.join(' · ') : '智能场景偏好匹配';

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
      <div
        id="share-card-matcher"
        ref={posterRef}
        style={{
          width: 640,
          backgroundColor: '#F8FAFC',
          fontFamily: POSTER_FONT_STACK,
          color: '#0F172A',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* 顶部深海蓝渐变品牌头图 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #091732 0%, #153E75 56%, #0E7490 100%)',
            padding: '28px 32px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 细腻网格与星芒光晕装饰 */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -30,
              width: 190,
              height: 190,
              borderRadius: '999px',
              background:
                'radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(34,211,238,0) 72%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(8, 22, 48, 0.28)',
                  padding: 7,
                  boxSizing: 'border-box',
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
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                  }}
                >
                  {SITE_BRAND.name}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#BAE6FD',
                  }}
                >
                  选对 AI，用好 AI
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: '6px 14px',
                background:
                  'linear-gradient(90deg, rgba(34,211,238,0.25) 0%, rgba(59,130,246,0.35) 100%)',
                border: '1px solid rgba(165,243,252,0.45)',
                fontSize: 12,
                fontWeight: 700,
                color: '#ECFEFF',
                whiteSpace: 'nowrap',
              }}
            >
              ✨ 专属测试报告
            </div>
          </div>

          {/* 需求画像回显胶囊 */}
          <div
            style={{
              marginTop: 20,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>🏷️</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#E0F2FE',
                lineHeight: 1.5,
              }}
            >
              偏好画像：{profileSummary}
            </span>
          </div>
        </div>

        {/* 主体卡片内容区 */}
        <div style={{ padding: '24px 28px 22px' }}>
          {/* Top 1 核心高亮推荐卡片 */}
          <div
            style={{
              borderRadius: 18,
              border: '2px solid #3B82F6',
              background: 'linear-gradient(155deg, #FFFFFF 0%, #F0F7FF 100%)',
              padding: '22px 24px',
              boxShadow: '0 10px 28px rgba(37, 99, 235, 0.10)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 999,
                    }}
                  >
                    🏆 Top 1 · 本命首选
                  </span>
                  <span
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1D4ED8',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}
                  >
                    {topOne.tool.pricingType}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}
                  >
                    {getCategoryName(topOne.tool.category)}
                  </span>
                </div>

                <h2
                  style={{
                    margin: '12px 0 0',
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#0F172A',
                    lineHeight: 1.2,
                  }}
                >
                  {topOne.tool.name}
                </h2>
              </div>

              {/* 匹配度大数字徽章 */}
              <div
                style={{
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #059669 0%, #0EA5E9 100%)',
                  padding: '10px 14px',
                  textAlign: 'center',
                  color: '#FFFFFF',
                  minWidth: 88,
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.9 }}>契合度</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {topOne.matchPercent}%
                </div>
              </div>
            </div>

            <p
              style={{
                margin: '10px 0 0',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#334155',
                fontWeight: 500,
              }}
            >
              {topOne.tool.tagline}
            </p>

            {/* 海兰推荐理由 */}
            <div
              style={{
                marginTop: 16,
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                border: '1px solid #DBEAFE',
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#1E3A8A',
                  marginBottom: 8,
                }}
              >
                海兰 AI 推荐理由
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topOne.reasons.slice(0, 3).map((reason) => (
                  <div
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      color: '#334155',
                    }}
                  >
                    <span style={{ color: '#2563EB', fontWeight: 800, flexShrink: 0 }}>✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 2 & Top 3 备选紧凑双列 */}
          {alternatives.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: 10,
                }}
              >
                高契合备选平替（Top 2 & Top 3）
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                {alternatives.map((item, idx) => (
                  <div
                    key={item.tool.id}
                    style={{
                      borderRadius: 14,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      padding: '14px 16px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#334155',
                          backgroundColor: '#F1F5F9',
                          padding: '2px 8px',
                          borderRadius: 999,
                        }}
                      >
                        Top {idx + 2}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#059669',
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {item.matchPercent}%
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 15,
                        fontWeight: 800,
                        color: '#0F172A',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.tool.name}
                    </div>

                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 11.5,
                        color: '#64748B',
                        lineHeight: 1.45,
                      }}
                    >
                      {item.tool.tagline}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部品牌水印与二维码 */}
        <div
          style={{
            margin: '0 28px 24px',
            borderRadius: 16,
            background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            color: '#FFFFFF',
          }}
        >
          <div style={{ spaceY: 4 } as React.CSSProperties}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
              「扫码/访问官网，30秒测试你的专属AI」
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11.5,
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ color: '#38BDF8', fontWeight: 700 }}>{SHARE_SITE_DOMAIN}/matcher</span>
              <span>·</span>
              <span>海兰 AI · 75+ 工具精准选型</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>✦</span>
            <MiniQrGraphic size={58} />
          </div>
        </div>
      </div>
    </div>
  );
}
