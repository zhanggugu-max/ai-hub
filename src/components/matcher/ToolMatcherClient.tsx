'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpenText,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceSupportCard } from '@/components/monetization/ServiceSupportCard';
import { NAV_CATEGORIES, type NavTool, type NavToolPricing } from '@/data/nav-tools';
import {
  computeToolMatches,
  MATCHER_QUESTIONS,
  type MatcherAnswers,
  type QuizQuestionId,
} from '@/data/matcher-quiz';
import { cn } from '@/lib/utils';

interface ToolMatcherClientProps {
  tools: NavTool[];
}

const PRICING_BADGE_STYLES: Record<NavToolPricing, string> = {
  开源免费: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  有免费额度: 'border-blue-200 bg-blue-50 text-blue-700',
  按量付费: 'border-slate-200 bg-slate-100 text-slate-700',
  订阅制: 'border-violet-200 bg-violet-50 text-violet-700',
};

function getCategoryLabel(catValue: string): string {
  return NAV_CATEGORIES.find((c) => c.value === catValue)?.label ?? catValue;
}

export function ToolMatcherClient({ tools }: ToolMatcherClientProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<MatcherAnswers>({});
  const [phase, setPhase] = useState<'quiz' | 'matching' | 'result'>('quiz');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const currentQuestion = MATCHER_QUESTIONS[currentStepIndex] ?? MATCHER_QUESTIONS[0];
  const progressPercent =
    phase === 'quiz'
      ? Math.round(((currentStepIndex + 1) / MATCHER_QUESTIONS.length) * 100)
      : 100;

  const rankedResults = useMemo(() => {
    if (phase !== 'result') return [];
    return computeToolMatches(tools, answers);
  }, [phase, tools, answers]);

  const topOne = rankedResults[0];
  const alternatives = rankedResults.slice(1, 3);

  const selectedProfileTags = useMemo(() => {
    return MATCHER_QUESTIONS.map((q) => {
      const selectedVal = answers[q.id];
      const option = q.options.find((o) => o.value === selectedVal);
      return option
        ? { questionId: q.id, stepNumber: q.stepNumber, tag: option.shortTag }
        : null;
    }).filter((item): item is { questionId: QuizQuestionId; stepNumber: number; tag: string } =>
      Boolean(item)
    );
  }, [answers]);

  const handleSelectOption = (questionId: QuizQuestionId, optionValue: string) => {
    const nextAnswers: MatcherAnswers = { ...answers, [questionId]: optionValue };
    setAnswers(nextAnswers);

    if (currentStepIndex < MATCHER_QUESTIONS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      return;
    }

    // 完成第 5 题 -> 0.4 秒平滑匹配动效后展示结果
    setPhase('matching');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setPhase('result');
      requestAnimationFrame(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }, 400);
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAnswers({});
    setCurrentStepIndex(0);
    setPhase('quiz');
  };

  return (
    <div className="space-y-8">
      {/* 答题状态 */}
      {phase === 'quiz' && (
        <section
          aria-label="AI 需求匹配问卷"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-7"
        >
          {/* 顶部进度条与操作 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700">
                <Sparkles className="h-4 w-4" />
                <span>
                  第 {currentStepIndex + 1} / {MATCHER_QUESTIONS.length} 题
                </span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>重置重选</span>
              </button>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 当前题目与选项卡片 */}
          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
                {currentQuestion.title}
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">{currentQuestion.subtitle}</p>
            </div>

            <div
              className={cn(
                'grid grid-cols-1 gap-3',
                currentQuestion.options.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
              )}
            >
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, opt.value)}
                    className={cn(
                      'group flex h-full flex-col justify-between rounded-xl border p-4 text-left transition-all',
                      isSelected
                        ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-slate-50/40 hover:border-blue-300 hover:bg-white'
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-700 sm:text-base">
                          <span
                            className={cn(
                              'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-700 ring-1 ring-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700'
                            )}
                          >
                            {opt.value}
                          </span>
                          <span>{opt.label}</span>
                        </span>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                      </div>
                      <p className="pl-8 text-xs leading-relaxed text-slate-500">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部上一步控制 */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>上一题</span>
            </Button>

            <span className="text-xs text-slate-400">点击选项即可自动进入下一题</span>
          </div>
        </section>
      )}

      {/* 0.4 秒过渡匹配动画 */}
      {phase === 'matching' && (
        <section
          aria-live="polite"
          className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-white py-16 text-center shadow-2xs"
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-base font-semibold text-slate-900">
            正在为你匹配最顺手的工具组合...
          </p>
          <p className="mt-1 text-xs text-slate-500">
            基于 {tools.length} 款工具的预算、网络与实操门槛综合加权计算
          </p>
        </section>
      )}

      {/* 推荐结果报告 */}
      {phase === 'result' && topOne && (
        <section ref={resultSectionRef} className="scroll-mt-24 space-y-6">
          {/* 温和免责提示条 */}
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200/80 bg-blue-50/70 px-4 py-3 text-xs leading-relaxed text-slate-700 sm:text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p>
              💡 温馨提示：以下结果根据你的 5 项偏好综合算分生成，仅供参考，并非唯一标准。建议优先体验免费额度，顺手最重要。
            </p>
          </div>

          {/* 需求画像回显 + 重新测试 */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">你的需求画像：</span>
              {selectedProfileTags.map((item) => (
                <span
                  key={item.questionId}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                >
                  {item.stepNumber}. {item.tag}
                </span>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="shrink-0 gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>重新测试</span>
            </Button>
          </div>

          {/* Top 1 · 主推首选卡片 */}
          <article className="rounded-xl border-2 border-blue-400 bg-gradient-to-br from-white via-white to-blue-50/50 p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-bold text-white">
                    <Award className="h-3.5 w-3.5" />
                    Top 1 · 最佳匹配
                  </span>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    匹配度 {topOne.matchPercent}%
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      PRICING_BADGE_STYLES[topOne.tool.pricingType]
                    )}
                  >
                    {topOne.tool.pricingType}
                  </Badge>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {getCategoryLabel(topOne.tool.category)}
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {topOne.tool.name}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">{topOne.tool.tagline}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={
                    topOne.tool.resourceSlug
                      ? `/resources/${encodeURIComponent(topOne.tool.resourceSlug)}`
                      : `/search?q=${encodeURIComponent(topOne.tool.searchKeyword)}`
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:text-sm"
                >
                  <BookOpenText className="h-4 w-4" />
                  <span>看站内教程</span>
                </Link>

                <a
                  href={topOne.tool.affiliateUrl || topOne.tool.officialUrl}
                  target="_blank"
                  rel={
                    topOne.tool.affiliateUrl
                      ? 'noopener noreferrer sponsored'
                      : 'noopener noreferrer'
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-600 sm:text-sm"
                >
                  <span>直达官网 / 获取额度</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-85" />
                </a>
              </div>
            </div>

            {/* 匹配推荐理由 */}
            <div className="mt-5 rounded-xl border border-blue-100 bg-white/90 p-4">
              <p className="text-xs font-bold text-slate-800">为什么最推荐它：</p>
              <ul className="mt-2 space-y-1.5">
                {topOne.reasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 sm:text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topOne.tool.badges.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Top 2 & Top 3 备选平替方案 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                备选平替方案（Top 2 & Top 3）
              </h3>
              <Link href="/nav" className="text-xs font-semibold text-blue-600 hover:underline">
                浏览全部 {tools.length} 款工具 →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {alternatives.map((item, idx) => {
                const tutorialHref = item.tool.resourceSlug
                  ? `/resources/${encodeURIComponent(item.tool.resourceSlug)}`
                  : `/search?q=${encodeURIComponent(item.tool.searchKeyword)}`;
                const targetUrl = item.tool.affiliateUrl || item.tool.officialUrl;

                return (
                  <article
                    key={item.tool.id}
                    className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-blue-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                              Top {idx + 2}
                            </span>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              匹配度 {item.matchPercent}%
                            </span>
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                              {getCategoryLabel(item.tool.category)}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{item.tool.name}</h4>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                            PRICING_BADGE_STYLES[item.tool.pricingType]
                          )}
                        >
                          {item.tool.pricingType}
                        </Badge>
                      </div>

                      <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {item.tool.tagline}
                      </p>

                      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                        <strong className="text-slate-800">匹配亮点：</strong>
                        {item.reasons[0]}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <Link
                        href={tutorialHref}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <BookOpenText className="h-3.5 w-3.5" />
                        <span>看站内教程</span>
                      </Link>

                      <a
                        href={targetUrl}
                        target="_blank"
                        rel={
                          item.tool.affiliateUrl
                            ? 'noopener noreferrer sponsored'
                            : 'noopener noreferrer'
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                      >
                        <span>直达官网 / 获取额度</span>
                        <ExternalLink className="h-3 w-3 opacity-85" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <ServiceSupportCard />
        </section>
      )}
    </div>
  );
}
