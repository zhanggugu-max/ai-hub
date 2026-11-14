'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AffiliateApiBanner } from '@/components/monetization/AffiliateApiBanner';
import {
  AI_GLOSSARY,
  GUIDE_STEPS,
  PROMPT_TEMPLATES,
} from '@/data/beginner-guides';
import { cn } from '@/lib/utils';

export function GuideClient() {
  const [activeStepId, setActiveStepId] = useState<string>(GUIDE_STEPS[0].id);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [glossaryExpanded, setGlossaryExpanded] = useState<boolean>(true);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const activeIndex = Math.max(
    0,
    GUIDE_STEPS.findIndex((step) => step.id === activeStepId)
  );
  const activeStep = GUIDE_STEPS[activeIndex] ?? GUIDE_STEPS[0];

  const handleSelectStep = (stepId: string, scrollIntoView = false) => {
    setActiveStepId(stepId);
    if (scrollIntoView && articleRef.current) {
      articleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyPrompt = async (id: string, promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPromptId(id);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedPromptId(null);
      }, 2000);
    } catch {
      setCopiedPromptId(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* 模块一：4 步零基础通关指南 */}
      <section aria-labelledby="guide-steps-heading" className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2
            id="guide-steps-heading"
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            4 步零基础通关路线
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            点击任意关卡切换阅读，按顺序 15 分钟即可打通实用闭环
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 左侧目录卡片 */}
          <aside className="space-y-3 lg:col-span-4">
            {GUIDE_STEPS.map((step) => {
              const isActive = step.id === activeStep.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleSelectStep(step.id, true)}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-all',
                    isActive
                      ? 'border-blue-300 bg-white shadow-xs ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white/80 hover:border-blue-200 hover:bg-white'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      第 {step.stepNumber} 关
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {step.readTime}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      'mt-2.5 text-sm leading-snug font-bold',
                      isActive ? 'text-blue-700' : 'text-slate-900'
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {step.subtitle}
                  </p>
                </button>
              );
            })}
          </aside>

          {/* 右侧当前关卡正文 */}
          <article
            ref={articleRef}
            className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-7 lg:col-span-8"
          >
            <header className="space-y-3 border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-blue-600 text-white hover:bg-blue-600">
                  第 {activeStep.stepNumber} 关
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  <Clock className="h-3 w-3" />
                  预计阅读 {activeStep.readTime}
                </span>
                {activeStep.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="text-xl leading-snug font-bold tracking-tight text-slate-900 sm:text-2xl">
                {activeStep.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">{activeStep.subtitle}</p>
            </header>

            <div className="mt-6 space-y-7">
              {activeStep.sections.map((sec, sIdx) => (
                <section key={sec.heading} className="space-y-3.5">
                  <h4 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-600">
                      {sIdx + 1}
                    </span>
                    <span>{sec.heading}</span>
                  </h4>

                  <div className="space-y-2.5 text-sm leading-7 text-slate-700">
                    {sec.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>

                  {sec.steps && sec.steps.length > 0 && (
                    <ol className="space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                      {sec.steps.map((item, idx) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 ring-1 ring-slate-200">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {sec.comparison && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                        <p className="text-xs font-bold text-rose-700">
                          {sec.comparison.badTitle}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
                          {sec.comparison.bad}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                        <p className="text-xs font-bold text-emerald-700">
                          {sec.comparison.goodTitle}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
                          {sec.comparison.good}
                        </p>
                      </div>
                    </div>
                  )}

                  {sec.tip && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/90 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900 sm:text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p>{sec.tip}</p>
                    </div>
                  )}

                  {sec.links && sec.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {sec.links.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                        >
                          <span>{link.label}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {activeStep.showAffiliateBanner && sIdx === 0 && (
                    <div className="pt-1">
                      <AffiliateApiBanner />
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* 上下关切换 */}
            <footer className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeIndex <= 0}
                onClick={() => {
                  const prev = GUIDE_STEPS[activeIndex - 1];
                  if (prev) handleSelectStep(prev.id, true);
                }}
                className="gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>上一关</span>
              </Button>

              <span className="text-xs font-medium text-slate-400">
                {activeIndex + 1} / {GUIDE_STEPS.length}
              </span>

              <Button
                type="button"
                size="sm"
                disabled={activeIndex >= GUIDE_STEPS.length - 1}
                onClick={() => {
                  const next = GUIDE_STEPS[activeIndex + 1];
                  if (next) handleSelectStep(next.id, true);
                }}
                className="gap-1.5 bg-slate-900 text-white hover:bg-blue-600"
              >
                <span>下一关</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </footer>
          </article>
        </div>
      </section>

      {/* 模块二：高频万能提示词“抄作业库” */}
      <section aria-labelledby="prompt-templates-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2
              id="prompt-templates-heading"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              高频万能提示词“抄作业库”
            </h2>
          </div>
          <p className="text-xs text-slate-500 sm:text-sm">
            复制后把 <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">[在此填入你的内容]</code> 替换成你的问题即可
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PROMPT_TEMPLATES.map((tpl) => {
            const isCopied = copiedPromptId === tpl.id;
            return (
              <article
                key={tpl.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-blue-300"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">{tpl.title}</h3>
                      <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                        {tpl.scene}
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={isCopied ? 'secondary' : 'outline'}
                      onClick={() => handleCopyPrompt(tpl.id, tpl.promptText)}
                      className={cn(
                        'h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs font-semibold',
                        isCopied
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
                      )}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>已复制 ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>复制提示词</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {tpl.description}
                  </p>

                  <pre className="max-h-52 overflow-y-auto rounded-lg border border-slate-200/80 bg-slate-50 p-3 font-sans text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                    {tpl.promptText}
                  </pre>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 模块三：AI 常见黑话“人话词典” */}
      <section aria-labelledby="glossary-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-blue-600" />
            <h2
              id="glossary-heading"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              AI 常见黑话“人话词典”
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {AI_GLOSSARY.length} 个必懂术语
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setGlossaryExpanded((prev) => !prev)}
            className="h-8 gap-1 rounded-lg border-slate-200 bg-white text-xs text-slate-600 hover:text-slate-900"
          >
            <span>{glossaryExpanded ? '收起词典' : '展开词典'}</span>
            {glossaryExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {glossaryExpanded && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AI_GLOSSARY.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:border-blue-300"
              >
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">{item.term}</h3>
                  <p className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    <Lightbulb className="h-3 w-3 shrink-0" />
                    <span>{item.plainName}</span>
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">{item.explanation}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
