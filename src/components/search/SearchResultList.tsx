'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Calendar,
  ExternalLink,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SearchItem } from '@/data/search/mock-data';
import {
  formatSearchDate,
  isRealExternalUrl,
  splitHighlightSegments,
} from '@/lib/search/helpers';
import { ResourceTypeBadge } from '@/components/resources/ResourceTypeBadge';
import { SearchEmptyState } from './SearchEmptyState';

interface SearchResultListProps {
  items: SearchItem[];
  totalCount: number;
  hasMockData: boolean;
  query: string;
  selectedTags: string[];
  favoriteIds: Set<string>;
  onToggleFavorite: (itemId: string) => void;
  onTagClick: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onResetAll: () => void;
  onQuickTagSearch: (tag: string) => void;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = splitHighlightSegments(text, query);
  return (
    <>
      {segments.map((seg, index) =>
        seg.matched ? (
          <mark
            key={`${index}-${seg.text}`}
            className="rounded-xs bg-amber-200/70 px-0.5 text-slate-950"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={`${index}-${seg.text}`}>{seg.text}</span>
        )
      )}
    </>
  );
}

export function SearchResultList({
  items,
  totalCount,
  hasMockData,
  query,
  selectedTags,
  favoriteIds,
  onToggleFavorite,
  onTagClick,
  onRemoveTag,
  onResetAll,
  onQuickTagSearch,
}: SearchResultListProps) {
  return (
    <div className="min-w-0 flex-1 space-y-4">
      {/* 结果头部汇总 + Mock 合规提示 */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <span>
            共找到{' '}
            <strong className="font-semibold tabular-nums text-slate-900">
              {items.length}
            </strong>{' '}
            条结果（库内共 {totalCount} 条）
          </span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 bg-blue-50 pr-1 text-xs text-blue-700"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="rounded-full p-0.5 hover:bg-blue-200"
                aria-label={`移除标签 ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {hasMockData ? (
          <Badge className="gap-1 border-amber-200 bg-amber-50 text-xs text-amber-800 hover:bg-amber-50">
            <AlertTriangle className="h-3 w-3" />
            降级回退：当前为本地 Mock 数据（仅含自编摘要与外链）
          </Badge>
        ) : (
          <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-50">
            <ShieldCheck className="h-3 w-3" />
            仅索引自编中文摘要与原文外链
          </Badge>
        )}
      </div>

      {/* 结果卡片列表或空状态 */}
      {items.length === 0 ? (
        <SearchEmptyState
          query={query}
          onResetAll={onResetAll}
          onQuickTagClick={onQuickTagSearch}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const detailHref = `/resources/${encodeURIComponent(item.id)}`;
            const isFavorited = favoriteIds.has(item.id);
            const authorPrefix = item.author.startsWith('海兰 AI') ? '整理署名' : '原作者';

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-slate-300"
              >
                {/* 卡片顶部标签栏 */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <ResourceTypeBadge type={item.type} />
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      {item.credibilityLabel}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      原始来源：{item.source}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs tabular-nums text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>更新于 {formatSearchDate(item.updatedAt)}</span>
                  </div>
                </div>

                {/* 标题与英文原题（点击进入站内详情页） */}
                <div className="mt-3 space-y-1">
                  <h2 className="text-lg font-semibold leading-snug text-slate-900">
                    <Link
                      href={detailHref}
                      className="transition-colors hover:text-blue-600"
                    >
                      <HighlightedText text={item.title} query={query} />
                    </Link>
                  </h2>
                  {item.originalTitle && (
                    <p className="text-xs text-slate-400">
                      <HighlightedText text={item.originalTitle} query={query} />
                    </p>
                  )}
                </div>

                {/* 摘要（关键词高亮） */}
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  <HighlightedText text={item.description} query={query} />
                </p>

                {/* 标签与操作栏 */}
                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tags.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => onTagClick(tag)}
                          className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                            active
                              ? 'bg-blue-100 font-medium text-blue-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                    <span className="ml-1 inline-flex items-center gap-1 text-xs text-slate-400">
                      <User className="h-3 w-3" />
                      {authorPrefix}：{item.author} · 发布 {formatSearchDate(item.publishedAt)}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant={isFavorited ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => onToggleFavorite(item.id)}
                      className={`gap-1.5 text-xs tabular-nums ${
                        isFavorited
                          ? 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                          : 'text-slate-600'
                      }`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${
                          isFavorited ? 'fill-amber-500 text-amber-500' : ''
                        }`}
                      />
                      <span>{isFavorited ? '已收藏' : '收藏'}</span>
                    </Button>

                    <Link
                      href={detailHref}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <span>查看详情</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    {isRealExternalUrl(item.url) && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
                      >
                        <span>原文</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
