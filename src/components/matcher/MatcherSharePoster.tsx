'use client';

import type { RefObject } from 'react';
import type { CandidateEvaluation, ConfidenceLevel, MatcherRecommendationReport } from '@/data/matcher/types';
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
  report: MatcherRecommendationReport;
}

function getCategoryName(category: string): string {
  return NAV_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return '高置信度';
    case 'medium':
      return '中置信度';
    case 'low':
      return '低置信度（部分待核实）';
  }
}

function getShortBillingBadge(ev: CandidateEvaluation): string {
  const t = ev.tool;
  if (t.softwarePricingModel === 'unknown' || t.modelApiBilling === 'unknown') {
    return '收费待核实';
  }
  if (t.softwarePricingModel === 'free' && t.modelApiBilling === 'local_hardware') {
    return '开源免费 · 本地算力';
  }
  if (t.softwarePricingModel === 'free' && t.modelApiBilling === 'included_free') {
    return '软件与模型均免费';
  }
  if (t.softwarePricingModel === 'free' && t.modelApiBilling === 'byok_payg') {
    return '软件免费 · 自备 API 按量';
  }
  if (t.modelApiBilling === 'included_quota') {
    return '有免费额度 · 高频需付费';
  }
  return '订阅制';
}

function getShortNetworkBadge(ev: CandidateEvaluation): string {
  switch (ev.tool.networkAvailability) {
    case 'domestic_direct':
      return '国内直连';
    case 'partial_or_byok':
      return '国内视 API / 本地而定';
    case 'international_required':
      return '需国际网络';
    case 'unknown':
      return '网络待核实';
  }
}

/**
 * `/matcher` 专属匹配结果长图模板（固定 640px 宽，使用显式 hex 配色以保证 2x 截图稳定性）
 */
export function MatcherSharePoster({
  posterRef,
  profileTags,
  report,
}: MatcherSharePosterProps) {
  const topOne = report.primaryRecommendations[0];
  const alternatives = report.primaryRecommendations.slice(1, 3);
  const profileSummary = profileTags.length > 0 ? profileTags.join(' · ') : report.taskLabel;

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
            padding: '26px 30px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
                  width: 50,
                  height: 50,
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
                    fontSize: 21,
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
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: '#BAE6FD',
                  }}
                >
                  选对 AI，用好 AI · 规则选型报告
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: 999,
                border: '1px solid rgba(186, 230, 253, 0.42)',
                backgroundColor: 'rgba(15, 23, 42, 0.35)',
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: '#E0F2FE',
                whiteSpace: 'nowrap',
              }}
            >
              AI 工具选型匹配结果
            </div>
          </div>

          {/* 当前任务与约束摘要 */}
          <div
            style={{
              marginTop: 18,
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.11)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '12px 16px',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD' }}>
              目标任务：{report.taskLabel}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#FFFFFF',
                lineHeight: 1.45,
              }}
            >
              {profileSummary}
            </div>
          </div>
        </div>

        {/* 主体推荐区 */}
        <div style={{ padding: '22px 28px 18px' }}>
          {topOne ? (
            <div
              style={{
                borderRadius: 18,
                border: '1.5px solid #BFDBFE',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                padding: '20px 22px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        borderRadius: 999,
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                      }}
                    >
                      Top 1 主力首选
                    </span>
                    <span
                      style={{
                        borderRadius: 999,
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 10px',
                      }}
                    >
                      {getCategoryName(topOne.tool.category)}
                    </span>
                    <span
                      style={{
                        borderRadius: 999,
                        backgroundColor: '#F1F5F9',
                        color: '#334155',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 9px',
                      }}
                    >
                      {getShortBillingBadge(topOne)}
                    </span>
                    <span
                      style={{
                        borderRadius: 999,
                        backgroundColor: '#ECFEFF',
                        border: '1px solid #A5F3FC',
                        color: '#0E7490',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 9px',
                      }}
                    >
                      {getShortNetworkBadge(topOne)}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 25,
                      fontWeight: 800,
                      color: '#0F172A',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    {topOne.tool.name}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13.5,
                      color: '#475569',
                      lineHeight: 1.5,
                    }}
                  >
                    {topOne.tool.tagline}
                  </div>
                </div>

                {/* 右侧规则匹配度圆角方框 */}
                <div
                  style={{
                    minWidth: 102,
                    borderRadius: 16,
                    background: 'linear-gradient(145deg, #EFF6FF 0%, #ECFEFF 100%)',
                    border: '1.5px solid #BAE6FD',
                    padding: '10px 12px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: '#0369A1',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {topOne.score}
                    <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 2 }}>分</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: '#0F172A' }}>
                    规则匹配度
                  </div>
                  <div style={{ marginTop: 2, fontSize: 10, fontWeight: 600, color: '#475569' }}>
                    完整度 {topOne.dataCompleteness}% · {getConfidenceLabel(topOne.confidence)}
                  </div>
                </div>
              </div>

              {/* 核心推荐理由 */}
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 12,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '11px 14px',
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  推荐理由与核心条件贴合点
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {topOne.reasons.slice(0, 3).map((reason) => (
                    <div
                      key={reason}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 7,
                        fontSize: 12.5,
                        color: '#1E293B',
                        lineHeight: 1.45,
                      }}
                    >
                      <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 关键费用、硬件与局限透明提示 */}
              <div
                style={{
                  marginTop: 10,
                  borderRadius: 12,
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  padding: '10px 13px',
                  fontSize: 11.5,
                  color: '#78350F',
                  lineHeight: 1.5,
                }}
              >
                <div>
                  <strong>费用与网络：</strong>
                  {topOne.softwareCostLabel}；{topOne.networkLabel}
                </div>
                {topOne.limitations[0] && (
                  <div style={{ marginTop: 3 }}>
                    <strong>注意局限：</strong>
                    {topOne.limitations[0]}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 16,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                padding: '20px 22px',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                当前硬性条件下暂无直接胜任的主力工具
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                {report.noPrimaryMatchReason ?? report.summaryAdvice}
              </div>
            </div>
          )}

          {/* Top 2 & Top 3 差异化备选 */}
          {alternatives.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: 8,
                  paddingLeft: 2,
                }}
              >
                差异化主力备选方案
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: alternatives.length === 1 ? '1fr' : '1fr 1fr',
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
                      padding: '13px 15px',
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
                          color: '#0369A1',
                          backgroundColor: '#ECFEFF',
                          border: '1px solid #A5F3FC',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        规则 {item.score}/100
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 7,
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
                        marginTop: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#0369A1',
                      }}
                    >
                      {getShortBillingBadge(item)} · {getShortNetworkBadge(item)}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11.5,
                        color: '#64748B',
                        lineHeight: 1.45,
                      }}
                    >
                      {item.reasons[0] ?? item.tool.tagline}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 辅助说明小字 */}
          <div
            style={{
              marginTop: 12,
              fontSize: 10.5,
              color: '#64748B',
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            注：规则匹配评分仅衡量当前 5 项问答条件与公开工具画像的贴合度，不代表实际使用成功率。
          </div>
        </div>

        {/* 底部品牌水印与二维码 */}
        <div
          style={{
            margin: '0 28px 22px',
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
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
              「访问官网，30 秒基于任务与真实门槛筛选 AI 工具」
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
              <span>海兰 AI · 75 款工具能力画像匹配</span>
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
