import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Home, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NAV_CATEGORIES, NAV_TOOLS } from '@/data/nav-tools';
import { NavExplorer } from '@/components/nav/NavExplorer';
import { ServiceSupportCard } from '@/components/monetization/ServiceSupportCard';
import { SITE_BRAND } from '@/config/brand';
import { getSiteUrl } from '@/lib/site-url';

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: '场景化 AI 工具导航：桌面智能体、编程、建站与多模态选型指南',
  description:
    `拒绝网址堆砌，按真实开发、科研与创作工作流精选 ${NAV_TOOLS.length} 款高口碑桌面自主智能体、AI 编程 Agent、工作流编排、AI 建站原型、图像视频与音频效率工具，附大白话选型建议与实战教程直达。`,
  alternates: {
    canonical: '/nav',
  },
  openGraph: {
    title: '场景化 AI 工具导航｜海兰 AI',
    description:
      `${NAV_CATEGORIES.length} 大场景精选 ${NAV_TOOLS.length} 款高口碑 AI 工具与大白话选型建议，直达站内深度教程与官方入口。`,
    url: `${baseUrl}/nav`,
    siteName: SITE_BRAND.name,
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function NavPage() {
  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="space-y-4">
          <nav aria-label="面包屑导航" className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 transition-colors hover:text-slate-900"
            >
              <Home className="h-3.5 w-3.5" />
              <span>首页</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-900">场景化 AI 工具导航</span>
          </nav>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                <Layers className="h-6 w-6 text-blue-600" />
                <span>场景化 AI 工具导航</span>
              </h1>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                {NAV_CATEGORIES.length} 大工作流场景 · {NAV_TOOLS.length} 款高口碑工具
              </Badge>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              拒绝千篇一律的网址堆砌，按真实开发与科研工作流精选高口碑工具，附大白话选型建议与实战教程。
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50/70 via-white to-blue-50/70 px-4 py-2.5 text-xs text-slate-700 sm:text-sm">
              <span>不知道 {NAV_TOOLS.length} 款工具选哪个？</span>
              <Link
                href="/matcher"
                className="inline-flex items-center gap-1 font-semibold text-violet-700 transition-colors hover:text-violet-800 hover:underline"
              >
                <span>👉 花 30 秒做个需求小测试，帮你匹配顺手工具 →</span>
              </Link>
            </div>
          </div>
        </header>

        <NavExplorer tools={NAV_TOOLS} />

        <ServiceSupportCard />
      </div>
    </main>
  );
}
