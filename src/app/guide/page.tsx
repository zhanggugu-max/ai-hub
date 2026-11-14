import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, GraduationCap, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GuideClient } from '@/components/guide/GuideClient';
import { ServiceSupportCard } from '@/components/monetization/ServiceSupportCard';
import {
  AI_GLOSSARY,
  GUIDE_STEPS,
  PROMPT_TEMPLATES,
} from '@/data/beginner-guides';
import { SITE_BRAND } from '@/config/brand';
import { getSiteUrl } from '@/lib/site-url';

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'AI 零基础实战入门指南：选型、提问模板与 API Key 教程',
  description:
    '不讲晦涩算法原理，用大白话带零基础用户 4 步搞定 AI 工具选型、2026 最新提问公式、API Key 配置与桌面智能体入门，附可复制万能提示词模板与 AI 术语人话词典。',
  alternates: {
    canonical: '/guide',
  },
  openGraph: {
    title: 'AI 零基础实战入门指南｜海兰 AI',
    description:
      '4 步零基础通关指南 + 6 个万能提示词模板 + 8 个 AI 黑话人话词典，5 分钟跑通你的第一个 API 与桌面智能体。',
    url: `${baseUrl}/guide`,
    siteName: SITE_BRAND.name,
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
            <span className="font-medium text-slate-900">新手教程</span>
          </nav>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                <GraduationCap className="h-7 w-7 text-emerald-600" />
                <span>AI 零基础实战入门指南</span>
              </h1>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                {GUIDE_STEPS.length} 步通关 · {PROMPT_TEMPLATES.length} 个抄作业模板 · {AI_GLOSSARY.length} 条人话词典
              </Badge>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              不讲晦涩算法原理，用大白话带你选对工具、写好提示词、5 分钟跑通第一个 API。
            </p>
          </div>
        </header>

        <GuideClient />

        <ServiceSupportCard />
      </div>
    </main>
  );
}
