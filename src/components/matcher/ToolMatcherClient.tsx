'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceSupportCard } from '@/components/monetization/ServiceSupportCard';
import { ShareImageModal } from '@/components/share/SharePosterPrimitives';
import { MatcherSharePoster } from './MatcherSharePoster';
import { exportElementToPng } from '@/lib/share-image';
import { NAV_CATEGORIES, type NavTool, type NavToolPricing } from '@/data/nav-tools';
import {
  BUDGET_OPTIONS,
  DEFAULT_MATCHER_ANSWERS,
  evaluateMatcherReport,
  HARD_CONSTRAINT_OPTIONS,
  NETWORK_OPTIONS,
  SCENE_QUIZ_OPTIONS,
  SCENE_TASK_OPTIONS,
  WORK_MODE_OPTIONS,
} from '@/data/matcher-quiz';
import type {
  BudgetPreference,
  CandidateEvaluation,
  ConfidenceLevel,
  HardConstraintKey,
  MatcherAnswersV2,
  NetworkPreference,
  PreferenceConflictItem,
  SceneKey,
  TaskKey,
  WorkModePreference,
} from '@/data/matcher/types';
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

const CONFIDENCE_BADGE_STYLES: Record<ConfidenceLevel, { label: string; className: string }> = {
  high: {
    label: '推荐置信度：高',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  medium: {
    label: '推荐置信度：中',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  low: {
    label: '推荐置信度：低（部分待核实）',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
};

const STEP_META = [
  {
    id: 'scene',
    title: '第 1 题：你最想解决哪一类核心场景？',
    subtitle: '先确定大方向，下一题会为你展开该场景下的具体任务。',
  },
  {
    id: 'task',
    title: '第 2 题：在这个场景下，你最直接想完成什么任务？',
    subtitle: '选得越具体，系统越能准确区分“主力工具”与“辅助配套工具”。',
  },
  {
    id: 'budget',
    title: '第 3 题：你对软件付费和模型 API 成本的接受度？',
    subtitle: '系统已拆开核算“软件授权费”与“模型 API 消耗”，不把开源客户端直接当零成本。',
  },
  {
    id: 'network',
    title: '第 4 题：你当前的网络与账号使用环境是？',
    subtitle: '如实选择网络条件，可避免推荐无法顺畅打开的海外工具。',
  },
  {
    id: 'workMode',
    title: '第 5 题：你偏好哪种操作界面与运行环境？',
    subtitle: '选定后即可生成分角色、可解释的专属匹配报告。',
  },
] as const;

const MATCHER_SHARE_FILENAME = '海兰AI_专属匹配报告.png';

function getCategoryLabel(catValue: string): string {
  return NAV_CATEGORIES.find((c) => c.value === catValue)?.label ?? catValue;
}

function getInterfaceLabels(interfaces: string[]): string {
  const map: Record<string, string> = {
    web: '网页版',
    desktop: '桌面客户端',
    ide: 'IDE 编辑器',
    cli: '命令行 CLI',
    api: 'API 接口',
    mobile: '移动端',
  };
  return interfaces.map((item) => map[item] ?? item).join(' / ') || '待核实';
}

function DimensionBreakdownPanel({ candidate }: { candidate: CandidateEvaluation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        <span>{open ? '收起 6 维度规则打分明细' : '查看 6 维度规则打分明细（全透明可审计）'}</span>
      </button>

      {open && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {candidate.dimensionBreakdown.map((dim) => (
            <div
              key={dim.key}
              className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2 font-medium text-slate-800">
                <span>
                  {dim.label}（权重 {dim.weight}%）
                </span>
                {dim.applicable ? (
                  <span className="tabular-nums text-blue-700">
                    {dim.rawScore}/5 · 贡献 {dim.weightedContribution} 分
                  </span>
                ) : (
                  <span className="text-slate-400">已跳过（未计权重）</span>
                )}
              </div>
              <p className="mt-1 leading-relaxed text-slate-500">{dim.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PreferenceConflictAlert({
  conflicts,
  onClearConstraint,
  onAlignPreference,
}: {
  conflicts: PreferenceConflictItem[];
  onClearConstraint: (key: HardConstraintKey) => void;
  onAlignPreference: (field: PreferenceConflictItem['conflictingPreferenceField']) => void;
}) {
  if (conflicts.length === 0) return null;

  const alignButtonLabel = (field: PreferenceConflictItem['conflictingPreferenceField']) => {
    switch (field) {
      case 'budget':
        return '将预算偏好改为完全免费';
      case 'network':
        return '将网络偏好改为国内直连';
      case 'workMode':
        return '将使用形态改为本地可部署';
    }
  };

  return (
    <div className="space-y-2.5">
      {conflicts.map((item) => {
        const isConflict = item.severity === 'conflict';
        return (
          <div
            key={`${item.relatedConstraint}-${item.conflictingPreferenceField}`}
            className={cn(
              'rounded-xl border p-3.5 text-xs',
              isConflict
                ? 'border-rose-200 bg-rose-50/70 text-rose-950'
                : 'border-amber-200 bg-amber-50/70 text-amber-950',
            )}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  isConflict ? 'text-rose-600' : 'text-amber-600',
                )}
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="font-semibold">{item.title}</p>
                <p className="leading-relaxed opacity-90">{item.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onClearConstraint(item.relatedConstraint)}
                    className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    取消此硬性限制
                  </button>
                  <button
                    type="button"
                    onClick={() => onAlignPreference(item.conflictingPreferenceField)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800 transition-colors hover:bg-blue-100"
                  >
                    {alignButtonLabel(item.conflictingPreferenceField)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PrimaryToolCard({
  candidate,
  rank,
}: {
  candidate: CandidateEvaluation;
  rank: number;
}) {
  const isFirst = rank === 1;
  const confMeta = CONFIDENCE_BADGE_STYLES[candidate.confidence];
  const badgeWrapClass = 'max-w-full whitespace-normal break-words text-left leading-snug';

  return (
    <article
      className={cn(
        'min-w-0 max-w-full overflow-x-hidden rounded-2xl border bg-white p-4 transition-all sm:p-6',
        isFirst
          ? 'border-blue-200 bg-gradient-to-br from-white via-white to-blue-50/40 shadow-sm ring-1 ring-blue-100'
          : 'border-slate-200/90 hover:border-slate-300',
      )}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge
              className={cn(
                badgeWrapClass,
                isFirst
                  ? 'bg-slate-900 text-white hover:bg-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-100',
              )}
            >
              {isFirst
                ? 'Top 1 主力首选'
                : `Top ${rank}${candidate.selectionRoleLabel ? ` · ${candidate.selectionRoleLabel}` : ' 差异化备选'}`}
            </Badge>
            <Badge variant="outline" className={cn(badgeWrapClass, 'border-slate-200 bg-slate-50 text-slate-700')}>
              {getCategoryLabel(candidate.tool.category)}
            </Badge>
            <Badge variant="outline" className={cn(badgeWrapClass, PRICING_BADGE_STYLES[candidate.tool.pricingType])}>
              {candidate.tool.pricingType}
            </Badge>
            <Badge variant="outline" className={cn(badgeWrapClass, confMeta.className)}>
              {confMeta.label}
            </Badge>
            <Badge variant="outline" className={cn(badgeWrapClass, 'border-slate-200 bg-white text-slate-600')}>
              数据完整度 {candidate.dataCompleteness}%
            </Badge>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {candidate.tool.name}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{candidate.tool.tagline}</p>
          </div>
        </div>

        <div
          className={cn(
            'shrink-0 rounded-xl border px-3.5 py-2.5 text-center sm:min-w-[126px]',
            isFirst ? 'border-blue-200 bg-blue-50/90' : 'border-slate-200 bg-slate-50',
          )}
        >
          <p className="text-2xl font-extrabold tabular-nums text-blue-700 sm:text-3xl">
            {candidate.score}
            <span className="ml-0.5 text-xs font-semibold">/100</span>
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-700">规则匹配评分</p>
          <p className="text-[10px] text-slate-500">
            专项能力 {candidate.taskCapability}/5 · {getInterfaceLabels(candidate.tool.interfaces)}
          </p>
        </div>
      </div>

      {/* 为什么推荐它 */}
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>为什么推荐它（可直接承担当前核心任务）</span>
        </p>
        <ul className="space-y-1.5">
          {candidate.reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 四项透明落地信息（软件费 / API 费 / 硬件 / 网络） */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Wallet className="h-3.5 w-3.5 text-slate-500" />
            <span>软件授权与收费</span>
          </p>
          <p className="mt-1 leading-relaxed text-slate-600">{candidate.softwareCostLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>模型与 API 费用</span>
          </p>
          <p className="mt-1 leading-relaxed text-slate-600">{candidate.apiCostLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Cpu className="h-3.5 w-3.5 text-slate-500" />
            <span>硬件与运行方式</span>
          </p>
          <p className="mt-1 leading-relaxed text-slate-600">{candidate.hardwareRequirementLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>国内网络与账号要求</span>
          </p>
          <p className="mt-1 leading-relaxed text-slate-600">{candidate.networkLabel}</p>
        </div>
      </div>

      {/* 优势与使用限制 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 px-3.5 py-2.5 text-xs">
          <p className="font-semibold text-emerald-900">核心优势</p>
          <ul className="mt-1.5 space-y-1 text-emerald-950/90">
            {candidate.advantages.map((adv) => (
              <li key={adv} className="leading-relaxed">
                • {adv}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs">
          <p className="font-semibold text-slate-800">已知限制与注意点</p>
          <ul className="mt-1.5 space-y-1 text-slate-600">
            {candidate.limitations.map((lim) => (
              <li key={lim} className="leading-relaxed">
                • {lim}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 偏好冲突或待核实披露 */}
      {(candidate.unmetPreferences.length > 0 || candidate.missingInfoNotes.length > 0) && (
        <div className="mt-3 space-y-2">
          {candidate.unmetPreferences.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-900">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>与您部分偏好的差异提示</span>
              </p>
              <ul className="mt-1 space-y-0.5 pl-5">
                {candidate.unmetPreferences.map((item) => (
                  <li key={item} className="list-disc leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {candidate.missingInfoNotes.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2.5 text-xs text-rose-900">
              <p className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                <span>部分信息待核实提示</span>
              </p>
              <ul className="mt-1 space-y-0.5 pl-5">
                {candidate.missingInfoNotes.map((note) => (
                  <li key={note} className="list-disc leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6 维度得分透明展开 + 外链按钮 */}
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] text-slate-400">
          画像核实日期：{candidate.tool.verifiedAt ?? '待补充'}
        </span>

        <div className="flex flex-wrap items-center gap-2.5">
          {candidate.tool.resourceSlug ? (
            <Link
              href={`/resources/${candidate.tool.resourceSlug}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <BookOpenText className="h-3.5 w-3.5 text-slate-500" />
              看站内教程
            </Link>
          ) : (
            <Link
              href="/nav"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <BookOpenText className="h-3.5 w-3.5 text-slate-500" />
              去导航站看同类
            </Link>
          )}

          <a
            href={candidate.tool.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-medium text-white transition-colors',
              isFirst ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            直达官网
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <DimensionBreakdownPanel candidate={candidate} />
    </article>
  );
}

export function ToolMatcherClient({ tools }: ToolMatcherClientProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<MatcherAnswersV2>(DEFAULT_MATCHER_ANSWERS);
  const [touchedSteps, setTouchedSteps] = useState<Record<string, boolean>>({
    scene: false,
    task: false,
    budget: false,
    network: false,
    workMode: false,
  });
  const [phase, setPhase] = useState<'quiz' | 'matching' | 'result'>('quiz');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const [shareIsMobile, setShareIsMobile] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);
  const posterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const currentStep = STEP_META[currentStepIndex] ?? STEP_META[0];
  const progressPercent =
    phase === 'quiz' ? ((currentStepIndex + 1) / STEP_META.length) * 100 : 100;

  const sceneTasks = useMemo(
    () => SCENE_TASK_OPTIONS[answers.scene] ?? [],
    [answers.scene],
  );

  const report = useMemo(() => evaluateMatcherReport(tools, answers), [tools, answers]);

  const profileTags = useMemo(() => {
    const tags: string[] = [];
    const sceneLabel = SCENE_QUIZ_OPTIONS.find((s) => s.value === answers.scene)?.label;
    const budgetLabel = BUDGET_OPTIONS.find((b) => b.value === answers.budget)?.label;
    const netLabel = NETWORK_OPTIONS.find((n) => n.value === answers.network)?.label;
    const modeLabel = WORK_MODE_OPTIONS.find((w) => w.value === answers.workMode)?.label;
    if (sceneLabel) tags.push(sceneLabel);
    if (budgetLabel && answers.budget !== 'no_preference') tags.push(budgetLabel);
    if (netLabel && answers.network !== 'no_preference') tags.push(netLabel);
    if (modeLabel && answers.workMode !== 'no_preference') tags.push(modeLabel);
    if (answers.hardConstraints?.mustLocalRun) tags.push('硬性：本地推理');
    if (answers.hardConstraints?.mustDomesticDirect) tags.push('硬性：国内直连');
    if (answers.hardConstraints?.mustCompletelyFree) tags.push('硬性：完全免费');
    return tags;
  }, [answers]);

  const handleClearConstraint = (key: HardConstraintKey) => {
    setAnswers((prev) => ({
      ...prev,
      hardConstraints: {
        ...prev.hardConstraints,
        [key]: false,
      },
    }));
  };

  const handleAlignPreference = (field: PreferenceConflictItem['conflictingPreferenceField']) => {
    setAnswers((prev) => {
      if (field === 'budget') return { ...prev, budget: 'completely_free' };
      if (field === 'network') return { ...prev, network: 'domestic_direct' };
      return { ...prev, workMode: 'local_custom' };
    });
  };

  const startMatchingTransition = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setPhase('matching');
    timerRef.current = setTimeout(() => {
      setPhase('result');
      timerRef.current = null;
      requestAnimationFrame(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }, 320);
  };

  const handleSelectScene = (scene: SceneKey) => {
    const validTasks = SCENE_TASK_OPTIONS[scene] ?? [];
    const nextTask = validTasks.some((item) => item.value === answers.task)
      ? answers.task
      : (validTasks[0]?.value ?? answers.task);

    setAnswers((prev) => ({
      ...prev,
      scene,
      task: nextTask,
    }));
    setTouchedSteps((prev) => ({ ...prev, scene: true }));
    setCurrentStepIndex(1);
  };

  const handleSelectTask = (task: TaskKey) => {
    setAnswers((prev) => ({ ...prev, task }));
    setTouchedSteps((prev) => ({ ...prev, task: true }));
    setCurrentStepIndex(2);
  };

  const handleSelectBudget = (budget: BudgetPreference) => {
    setAnswers((prev) => ({ ...prev, budget }));
    setTouchedSteps((prev) => ({ ...prev, budget: true }));
  };

  const handleSelectNetwork = (network: NetworkPreference) => {
    setAnswers((prev) => ({ ...prev, network }));
    setTouchedSteps((prev) => ({ ...prev, network: true }));
  };

  const handleSelectWorkMode = (workMode: WorkModePreference) => {
    setAnswers((prev) => ({ ...prev, workMode }));
    setTouchedSteps((prev) => ({ ...prev, workMode: true }));
  };

  const toggleHardConstraint = (key: HardConstraintKey) => {
    setAnswers((prev) => ({
      ...prev,
      hardConstraints: {
        ...prev.hardConstraints,
        [key]: !prev.hardConstraints?.[key],
      },
    }));
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAnswers(DEFAULT_MATCHER_ANSWERS);
    setTouchedSteps({
      scene: false,
      task: false,
      budget: false,
      network: false,
      workMode: false,
    });
    setCurrentStepIndex(0);
    setPhase('quiz');
    setShareDataUrl(null);
    setShareError(null);
  };

  const handleGenerateShareCard = async () => {
    if (!posterRef.current || isGenerating) return;
    setIsGenerating(true);
    setShareError(null);

    try {
      const result = await exportElementToPng(posterRef.current, MATCHER_SHARE_FILENAME);
      setShareDataUrl(result.dataUrl);
      setShareIsMobile(result.isMobile);
    } catch (error) {
      console.error('生成匹配结果分享卡片失败:', error);
      setShareError('卡片生成失败，请稍后重试或刷新页面后再试。');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuizStep = () => {
    if (currentStep.id === 'scene') {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {SCENE_QUIZ_OPTIONS.map((option) => {
            const isSelected = answers.scene === option.value && touchedSteps.scene;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectScene(option.value)}
                className={cn(
                  'group flex flex-col justify-between rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 sm:text-base">
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700',
                    )}
                  >
                    {option.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentStep.id === 'task') {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 px-3.5 py-2 text-xs text-blue-900">
            已选大类场景：
            <strong className="ml-1 font-semibold">
              {SCENE_QUIZ_OPTIONS.find((s) => s.value === answers.scene)?.label}
            </strong>
            （以下核心任务已按该场景动态切换）
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {sceneTasks.map((option) => {
              const isSelected = answers.task === option.value && touchedSteps.task;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectTask(option.value)}
                  className={cn(
                    'group flex flex-col justify-between rounded-xl border p-4 text-left transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 sm:text-base">
                      {option.label}
                    </span>
                    {option.badge && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentStep.id === 'budget') {
      const hc = HARD_CONSTRAINT_OPTIONS.budget;
      const checked = Boolean(answers.hardConstraints?.[hc.key]);
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {BUDGET_OPTIONS.map((option) => {
              const isSelected = answers.budget === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectBudget(option.value)}
                  className={cn(
                    'flex flex-col justify-between rounded-xl border p-4 text-left transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80',
                    option.isNoPreference && 'border-dashed',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 transition-colors hover:bg-amber-50">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleHardConstraint(hc.key)}
              className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs">
              <p className="font-semibold text-amber-950">{hc.label}</p>
              <p className="mt-0.5 leading-relaxed text-amber-800">{hc.description}</p>
            </div>
          </label>
        </div>
      );
    }

    if (currentStep.id === 'network') {
      const hc = HARD_CONSTRAINT_OPTIONS.network;
      const checked = Boolean(answers.hardConstraints?.[hc.key]);
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {NETWORK_OPTIONS.map((option) => {
              const isSelected = answers.network === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectNetwork(option.value)}
                  className={cn(
                    'flex flex-col justify-between rounded-xl border p-4 text-left transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80',
                    option.isNoPreference && 'border-dashed',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 transition-colors hover:bg-amber-50">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleHardConstraint(hc.key)}
              className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs">
              <p className="font-semibold text-amber-950">{hc.label}</p>
              <p className="mt-0.5 leading-relaxed text-amber-800">{hc.description}</p>
            </div>
          </label>
        </div>
      );
    }

    // Step 5: workMode
    const hc = HARD_CONSTRAINT_OPTIONS.workMode;
    const checked = Boolean(answers.hardConstraints?.[hc.key]);
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {WORK_MODE_OPTIONS.map((option) => {
            const isSelected = answers.workMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectWorkMode(option.value)}
                className={cn(
                  'flex flex-col justify-between rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80',
                  option.isNoPreference && 'border-dashed',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 transition-colors hover:bg-amber-50">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleHardConstraint(hc.key)}
            className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-blue-500"
          />
          <div className="text-xs">
            <p className="font-semibold text-amber-950">{hc.label}</p>
            <p className="mt-0.5 leading-relaxed text-amber-800">{hc.description}</p>
          </div>
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 顶部进度条 */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium text-slate-700">
            {phase === 'quiz'
              ? `第 ${currentStepIndex + 1} / ${STEP_META.length} 步 · 基于 ${tools.length} 款能力画像动态匹配`
              : phase === 'matching'
                ? '正在核查硬性条件并执行 6 维度规则匹配…'
                : `匹配完成 · 已定位核心任务「${report.taskLabel}」`}
          </span>
          <span className="text-xs font-medium tabular-nums text-slate-500">
            {Math.round(progressPercent)}%
          </span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {phase === 'quiz' && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {STEP_META.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                    isCurrent
                      ? 'bg-slate-900 text-white'
                      : idx < currentStepIndex
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                  )}
                >
                  {idx + 1}. {step.id === 'scene' ? '主场景' : step.id === 'task' ? '具体任务' : step.id === 'budget' ? '预算成本' : step.id === 'network' ? '网络条件' : '运行形态'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 问答阶段 */}
      {phase === 'quiz' && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-8">
          <div className="mb-6 space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {currentStep.title}
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">{currentStep.subtitle}</p>
          </div>

          {renderQuizStep()}

          {currentStepIndex >= 2 && report.preferenceConflicts.length > 0 && (
            <div className="mt-4">
              <PreferenceConflictAlert
                conflicts={report.preferenceConflicts}
                onClearConstraint={handleClearConstraint}
                onAlignPreference={handleAlignPreference}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-full"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              上一题
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              {currentStepIndex < STEP_META.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                  className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
                >
                  下一步
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={startMatchingTransition}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-5 text-white hover:opacity-95"
                >
                  生成专属匹配方案
                  <Sparkles className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startMatchingTransition}
                className="rounded-full text-slate-500 hover:text-slate-800"
              >
                跳过剩余直接算分
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 短暂加载态 */}
      {phase === 'matching' && (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            正在为你筛选 {tools.length} 款工具的主力胜任力…
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            严格隔离主力工具与配套工具，校验网络、费用及未知字段完整度
          </p>
        </section>
      )}

      {/* 结果阶段 */}
      {phase === 'result' && (
        <section ref={resultSectionRef} className="space-y-6">
          {/* 结果头部卡与硬性筛选快速切换 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="max-w-full gap-1 whitespace-normal break-words bg-blue-50 text-left text-blue-700 hover:bg-blue-50">
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span>专属选型报告</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="max-w-full whitespace-normal break-words border-slate-200 bg-slate-50 text-left text-slate-700"
                  >
                    目标任务：{report.taskLabel}
                  </Badge>
                  {report.excludedHardConstraintCount > 0 && (
                    <Badge
                      variant="outline"
                      className="max-w-full whitespace-normal break-words border-amber-200 bg-amber-50 text-left text-amber-800"
                    >
                      已硬性拦截 {report.excludedHardConstraintCount} 款不达标工具
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  为你筛选出最适合的实战方案
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">{report.summaryAdvice}</p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2.5 self-start">
                <Button
                  type="button"
                  size="sm"
                  disabled={isGenerating}
                  onClick={handleGenerateShareCard}
                  className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-4 text-white shadow-xs transition-all hover:opacity-95 disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      正在生成卡片...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                      保存结果卡片
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPhase('quiz');
                    setCurrentStepIndex(0);
                  }}
                  className="rounded-full"
                >
                  修改条件
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-full text-slate-500"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  重新测试
                </Button>
              </div>
            </div>

            {shareError && <p className="mt-3 text-xs text-rose-600">{shareError}</p>}

            {/* 快捷硬性过滤切换条 */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-500">硬性条件开关：</span>
              {(
                [
                  { key: 'mustLocalRun', label: '必须本地模型推理' },
                  { key: 'mustDomesticDirect', label: '必须开箱国内直连' },
                  { key: 'mustCompletelyFree', label: '必须完全免费（软件+模型）' },
                ] as const
              ).map((item) => {
                const active = Boolean(answers.hardConstraints?.[item.key]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleHardConstraint(item.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 评分方法论透明说明 */}
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              <p className="leading-relaxed">{report.engineNotice}</p>
            </div>

            {report.preferenceConflicts.length > 0 && (
              <div className="mt-3">
                <PreferenceConflictAlert
                  conflicts={report.preferenceConflicts}
                  onClearConstraint={handleClearConstraint}
                  onAlignPreference={handleAlignPreference}
                />
              </div>
            )}
          </div>

          {/* 主力工具区（Top 1~3，宁缺毋滥） */}
          {report.primaryRecommendations.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 text-center sm:p-8">
              <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                当前严苛约束下，暂无直接胜任的主力工具
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {report.noPrimaryMatchReason}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      hardConstraints: {
                        mustLocalRun: false,
                        mustDomesticDirect: false,
                        mustCompletelyFree: false,
                      },
                    }))
                  }
                  className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  放宽硬性筛选查看完整候选
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPhase('quiz');
                    setCurrentStepIndex(1);
                  }}
                  className="rounded-full"
                >
                  调整任务或偏好
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {report.primaryRecommendations.map((candidate, index) => (
                <PrimaryToolCard
                  key={candidate.tool.id}
                  candidate={candidate}
                  rank={index + 1}
                />
              ))}
            </div>
          )}

          {/* 配套辅助推荐（严格与主力工具隔离） */}
          {report.assistantRecommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
              <div className="mb-3 space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  配套辅助推荐（协同使用，不替代上述主力工具）
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  这些工具在当前任务中有辅助价值（例如提供本地编辑器协同、API Key 管理或补充自动化），但不应被当成「{report.taskLabel}」的第一主力方案。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {report.assistantRecommendations.map((item) => (
                  <div
                    key={item.tool.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="border-slate-200 bg-white text-[11px] text-slate-600">
                          配套辅助
                        </Badge>
                        <span className="text-xs font-semibold tabular-nums text-slate-600">
                          协同契合 {item.score}/100
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.tool.name}</h4>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {item.reasons[0] ?? item.tool.tagline}
                      </p>
                      {item.limitations[0] && (
                        <p className="text-[11px] leading-relaxed text-amber-800">
                          定位边界：{item.limitations[0]}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2">
                      <a
                        href={item.tool.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                      >
                        <span>了解详情</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底层基础设施工具隔离提示 */}
          {report.infrastructureNoteCandidates.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                底层技术组件说明（已从当前终端主力名单中自动隔离）
              </p>
              <p className="mt-1 leading-relaxed">
                以下工具属于协议标准、沙箱或编排基础设施，通常需要工程师二次集成，无法开箱直接交付当前非底层任务：
                {report.infrastructureNoteCandidates.map((item) => item.tool.name).join('、')}。
              </p>
            </div>
          )}

          {/* 需补充硬件/外部条件方可满足硬约束的工具单独披露（不混入严格主力） */}
          {report.conditionalLocalCandidates.length > 0 && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 text-xs text-amber-950 sm:p-5">
              <p className="font-semibold text-amber-950">
                有条件支持本地/私有部署的候选（未计入“必须本地模型推理”严格主力榜）
              </p>
              <p className="mt-1 leading-relaxed text-amber-900">
                以下工具可在你自己的电脑或私有服务器安装运行，但软件本身不含内置大模型权重，仍需配合云端 API 或另行连接本地 Ollama 才可完成任务：
              </p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {report.conditionalLocalCandidates.map((item) => (
                  <div
                    key={item.tool.id}
                    className="flex min-w-0 flex-col justify-between rounded-xl border border-amber-200/80 bg-white p-3.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{item.tool.name}</span>
                        <span className="shrink-0 tabular-nums text-[11px] font-semibold text-slate-600">
                          {item.score}/100
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        {item.hardConstraintStatus.failedReasons[0]}
                      </p>
                    </div>
                    <div className="mt-2.5">
                      <a
                        href={item.tool.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:underline"
                      >
                        <span>官网查看详情</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.configurableNetworkCandidates.length > 0 && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 text-xs text-amber-950 sm:p-5">
              <p className="font-semibold text-amber-950">
                可配置国内模型的候选（未计入“开箱国内直连”严格主力榜）
              </p>
              <p className="mt-1 leading-relaxed text-amber-900">
                以下软件本体或客户端在国内通常可启动，但仍需要你自己填写国内大模型 API（如 DeepSeek / 硅基流动 / 阿里云百炼）或本地 Ollama 才可全程国内直连：
              </p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {report.configurableNetworkCandidates.map((item) => (
                  <div
                    key={item.tool.id}
                    className="flex min-w-0 flex-col justify-between rounded-xl border border-amber-200/80 bg-white p-3.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{item.tool.name}</span>
                        <span className="shrink-0 tabular-nums text-[11px] font-semibold text-slate-600">
                          {item.score}/100
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        {item.hardConstraintStatus.failedReasons[0]}
                      </p>
                    </div>
                    <div className="mt-2.5">
                      <a
                        href={item.tool.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:underline"
                      >
                        <span>官网查看详情</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 硬性条件因数据缺失而无法核实的工具披露 */}
          {report.unverifiedHardConstraintTools.length > 0 && (
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 text-xs text-rose-900">
              <p className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                <span>
                  以下 {report.unverifiedHardConstraintTools.length} 款工具因部分公开信息尚未核实，未自动入围硬性筛选结果：
                </span>
              </p>
              <ul className="mt-1.5 space-y-1 pl-5">
                {report.unverifiedHardConstraintTools.map((item) => (
                  <li key={item.tool.id} className="list-disc leading-relaxed">
                    <strong>{item.tool.name}</strong>：
                    {item.hardConstraintStatus.unverifiedReasons.join('；')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ServiceSupportCard />
        </section>
      )}

      <MatcherSharePoster posterRef={posterRef} profileTags={profileTags} report={report} />

      <ShareImageModal
        open={shareDataUrl !== null}
        dataUrl={shareDataUrl}
        fileName={MATCHER_SHARE_FILENAME}
        title="您的专属 AI 选型报告长图已就绪"
        isMobile={shareIsMobile}
        onClose={() => setShareDataUrl(null)}
      />
    </div>
  );
}
