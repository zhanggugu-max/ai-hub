'use client';

import Link from 'next/link';
import { ChevronRight, Code2, Home, Trophy, Zap } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LEADERBOARD_CATEGORIES,
  type LeaderboardCategory,
} from '@/data/leaderboard/mock-data';

interface LeaderboardHeaderProps {
  activeCategory: LeaderboardCategory;
  onCategoryChange: (category: LeaderboardCategory) => void;
  title: string;
  description: string;
}

const CATEGORY_ICONS: Record<LeaderboardCategory, React.ReactNode> = {
  overall: <Trophy className="h-4 w-4" />,
  open_source: <Code2 className="h-4 w-4" />,
  api_value: <Zap className="h-4 w-4" />,
};

export function LeaderboardHeader({
  activeCategory,
  onCategoryChange,
  title,
  description,
}: LeaderboardHeaderProps) {
  return (
    <header className="space-y-4">
      {/* 面包屑导航（SEO 与层级定位） */}
      <nav aria-label="面包屑导航" className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/"
          className="inline-flex items-center gap-1 transition-colors hover:text-slate-900"
        >
          <Home className="h-3.5 w-3.5" />
          <span>首页</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-medium text-slate-900">AI 能力排行榜</span>
      </nav>

      {/* 标题区 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              定时更新 · 最多 4 模型横向对比
            </Badge>
          </div>
          <p className="max-w-3xl text-sm text-slate-600 sm:text-base">{description}</p>
        </div>
      </div>

      {/* 榜单分类 Tab 切换 */}
      <Tabs
        value={activeCategory}
        onValueChange={(value) => onCategoryChange(value as LeaderboardCategory)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-1 gap-1.5 bg-slate-100 p-1.5 group-data-horizontal/tabs:h-auto sm:inline-grid sm:w-auto sm:grid-cols-3">
          {LEADERBOARD_CATEGORIES.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex h-auto items-center justify-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-xs data-active:bg-white data-active:shadow-xs"
            >
              {CATEGORY_ICONS[tab.value]}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </header>
  );
}
