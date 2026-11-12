'use client';

import Link from 'next/link';
import { ChevronRight, Home, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlobalSearchBar } from '@/components/shared/GlobalSearchBar';

interface SearchHeaderProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  onHotTagClick: (tag: string) => void;
}

export function SearchHeader({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onHotTagClick,
}: SearchHeaderProps) {
  return (
    <header className="space-y-5">
      {/* 顶部面包屑与跨模块导航 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="面包屑导航" className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition-colors hover:text-slate-900"
          >
            <Home className="h-3.5 w-3.5" />
            <span>首页</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-slate-900">AI 资料聚合搜索</span>
        </nav>

        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span>查看 AI 能力排行榜</span>
        </Link>
      </div>

      {/* 标题与复用的全局搜索框 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
        <div className="mb-4 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              全网 AI 资料极速搜索
            </h1>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              中英双语索引 · 摘要直达原文
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            一站检索 AI 工具、开源模型、实战教程、前沿论文与提示词模板（输入自动 300ms 防抖同步链接）。
          </p>
        </div>

        <GlobalSearchBar
          size="lg"
          value={searchInput}
          onChange={onSearchInputChange}
          onSubmit={onSearchSubmit}
          onTagClick={onHotTagClick}
        />
      </div>
    </header>
  );
}
