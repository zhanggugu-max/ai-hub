import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Globe,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { SearchItem } from '@/data/search/mock-data';
import { formatSearchDate } from '@/lib/search/helpers';
import { RESOURCE_TYPE_META, ResourceTypeBadge } from './ResourceTypeBadge';
import { ResourceActionsClient } from './ResourceActionsClient';

interface ResourceHeaderProps {
  item: SearchItem;
}

export function ResourceHeader({ item }: ResourceHeaderProps) {
  const typeMeta = RESOURCE_TYPE_META[item.type];

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
      {/* 面包屑导航 */}
      <nav
        aria-label="面包屑导航"
        className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
      >
        <Link href="/" className="transition-colors hover:text-blue-600">
          首页
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link href="/search" className="transition-colors hover:text-blue-600">
          资料搜索
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link
          href={`/search?type=${item.type}`}
          className="transition-colors hover:text-blue-600"
        >
          {typeMeta.label}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="max-w-xs truncate font-medium text-slate-700 sm:max-w-md">
          {item.title}
        </span>
      </nav>

      {/* 顶部属性徽标 */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ResourceTypeBadge type={item.type} />
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          {item.credibilityLabel}
        </span>
        {item.isMockData && (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            本地 Mock 降级数据
          </span>
        )}
      </div>

      {/* 标题区 */}
      <div className="mt-4 space-y-2">
        <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
          {item.title}
        </h1>
        {item.originalTitle && (
          <p className="text-sm font-medium text-slate-400 sm:text-base">
            {item.originalTitle}
          </p>
        )}
      </div>

      {/* 来源、作者、发布与更新时间 */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-slate-400" />
          <span>来源：{item.source}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <User className="h-4 w-4 text-slate-400" />
          <span>作者 / 整理：{item.author}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>发布：{formatSearchDate(item.publishedAt)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>更新：{formatSearchDate(item.updatedAt)}</span>
        </span>
      </div>

      {/* 标签与核心操作按钮栏 */}
      <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?tag=${encodeURIComponent(tag)}`}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <ResourceActionsClient
          resourceId={item.id}
          initialFavoriteCount={item.favoriteCount}
          defaultFavorited={item.isFavorited}
          externalUrl={item.url}
        />
      </div>
    </header>
  );
}
