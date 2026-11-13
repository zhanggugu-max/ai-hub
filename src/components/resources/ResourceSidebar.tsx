import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Globe,
  Info,
  ShieldCheck,
  Tag,
  Trophy,
} from 'lucide-react';
import type { SearchItem } from '@/data/search/mock-data';
import { formatSearchDate, isRealExternalUrl } from '@/lib/search/helpers';
import { RESOURCE_TYPE_META } from './ResourceTypeBadge';

interface ResourceSidebarProps {
  item: SearchItem;
}

function getSafeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ResourceSidebar({ item }: ResourceSidebarProps) {
  const typeMeta = RESOURCE_TYPE_META[item.type];
  const hasExternalUrl = isRealExternalUrl(item.url);
  const hostname = hasExternalUrl ? getSafeHostname(item.url) : '站内原生收录';

  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      {/* 醒目外链跳转卡片 */}
      <div className="rounded-2xl border border-blue-200/80 bg-linear-to-br from-blue-50/80 via-white to-slate-50 p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
          <Globe className="h-4 w-4" />
          <span>{hasExternalUrl ? '原文与官网直达' : '站内原创 / 精选整理'}</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {hasExternalUrl
            ? '点击下方按钮将跳转至外部原站获取完整文档、项目仓库或官方工具入口。'
            : '本篇为站内整理指南或提示词模板，完整正本内容已直接展示在左侧阅读区。'}
        </p>

        {hasExternalUrl ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <span>访问原文官网</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <Link
            href="/search"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-2xs transition-colors hover:bg-blue-50"
          >
            <span>浏览更多站内资料</span>
          </Link>
        )}

        <div className="mt-3 flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-[11px] text-slate-500 ring-1 ring-slate-200/70">
          <span className="shrink-0">来源归属</span>
          <span className="ml-2 truncate font-mono text-slate-700">{hostname}</span>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span>站内提供自编中文摘要、实操笔记与官方直达入口，版权归原作者及官网所有。</span>
        </p>
      </div>

      {/* 资料元信息卡片 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Info className="h-4 w-4 text-slate-500" />
          <span>资料档案</span>
        </h2>

        <dl className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <dt className="text-slate-500">所属分类</dt>
            <dd className="font-medium text-slate-900">{typeMeta.label}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <dt className="text-slate-500">收录来源</dt>
            <dd className="font-medium text-slate-900">{item.source}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <dt className="text-slate-500">作者 / 整理者</dt>
            <dd className="font-medium text-slate-900">{item.author}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <dt className="text-slate-500">发布日期</dt>
            <dd className="font-medium tabular-nums text-slate-900">
              {formatSearchDate(item.publishedAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <dt className="text-slate-500">最近更新</dt>
            <dd className="font-medium tabular-nums text-slate-900">
              {formatSearchDate(item.updatedAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="inline-flex items-center gap-1 text-slate-500">
              <Bookmark className="h-3.5 w-3.5" />
              <span>库内收藏热度</span>
            </dt>
            <dd className="font-semibold tabular-nums text-slate-900">
              {item.favoriteCount}
            </dd>
          </div>
        </dl>

        {/* 标签快捷跳转 */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <span>按标签检索同类资料</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 站内快捷返回 */}
      <div className="flex flex-col gap-2">
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>返回资料搜索中心</span>
        </Link>
        <Link
          href="/leaderboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span>查看 AI 模型能力榜单</span>
        </Link>
      </div>
    </aside>
  );
}
