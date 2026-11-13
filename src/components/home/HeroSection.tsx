import Link from 'next/link';
import {
  BookOpen,
  Cpu,
  FileText,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlobalSearchBar } from '@/components/shared/GlobalSearchBar';

const QUICK_CATEGORY_LINKS = [
  { label: 'AI 工具', href: '/search?type=tool', icon: Wrench },
  { label: '开源/闭源模型', href: '/search?type=model', icon: Cpu },
  { label: '实战教程', href: '/search?type=tutorial', icon: BookOpen },
  { label: 'arXiv 论文', href: '/search?type=paper', icon: FileText },
  { label: '提示词模板', href: '/search?type=prompt', icon: Sparkles },
  { label: 'API 性价比', href: '/leaderboard?board=api_value', icon: Zap },
];

export function HeroSection() {
  return (
    <section className="border-b border-slate-200/80 bg-white">
      {/* 居中 Hero 主视觉与搜索框 */}
      <div className="mx-auto max-w-4xl px-4 pt-10 pb-12 text-center sm:px-6 sm:pt-14 sm:pb-14 lg:px-8">
        <Badge
          variant="secondary"
          className="mb-4 border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
        >
          中文优先 · 仅索引元数据与自编摘要 · 榜单定时更新
        </Badge>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          一站找齐 AI 资料、能力榜单与实战工具
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          面向开发者、产品经理与 AI 学习者，快速检索工具指南、开源模型、前沿论文与提示词模板，横向对比主流模型能力与 API 性价比。
        </p>

        {/* 复用全局搜索组件 */}
        <div className="mx-auto mt-7 max-w-2xl text-left">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 shadow-xs sm:p-4">
            <GlobalSearchBar size="lg" />
          </div>
        </div>

        {/* 快捷分类入口 */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {QUICK_CATEGORY_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
              >
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
