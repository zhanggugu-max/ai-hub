import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Home, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ToolMatcherClient } from '@/components/matcher/ToolMatcherClient';
import { NAV_TOOLS } from '@/data/nav-tools';
import { SITE_BRAND } from '@/config/brand';
import { getSiteUrl } from '@/lib/site-url';

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'AI 工具智能选型匹配器：30 秒测出最适合你的工具组合',
  description:
    `不知道 ${NAV_TOOLS.length} 款 AI 工具选哪个？通过 5 道通俗场景、预算、网络与实操偏好问答，智能推荐最顺手的 Top 3 工具与一站式教程直达。`,
  alternates: {
    canonical: '/matcher',
  },
  openGraph: {
    title: 'AI 工具智能选型匹配器｜海兰 AI',
    description:
      `5 道场景小测试，从 ${NAV_TOOLS.length} 款主流 AI 工具中为你匹配 Top 1 首选与备选平替方案。`,
    url: `${baseUrl}/matcher`,
    siteName: SITE_BRAND.name,
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function MatcherPage() {
  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
            <span className="font-medium text-slate-900">AI 选型测试</span>
          </nav>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                <Wand2 className="h-6 w-6 text-violet-600" />
                <span>AI 工具智能匹配推荐器</span>
              </h1>
              <Badge variant="secondary" className="bg-violet-50 text-violet-700 hover:bg-violet-50">
                5 道题 · 30 秒匹配 · 覆盖 {NAV_TOOLS.length} 款工具库
              </Badge>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              工具太多看花眼？花 30 秒回答你的场景、预算、动手门槛与网络习惯，直接帮你算出最顺手的 Top 3 组合。
            </p>
          </div>
        </header>

        <ToolMatcherClient tools={NAV_TOOLS} />
      </div>
    </main>
  );
}
