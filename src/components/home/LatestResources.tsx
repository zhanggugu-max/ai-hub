import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  Newspaper,
} from 'lucide-react';
import type { SearchItem } from '@/data/search/mock-data';
import { formatSearchDate } from '@/lib/search/helpers';
import { ResourceTypeBadge } from '@/components/resources/ResourceTypeBadge';

interface LatestResourcesProps {
  items: SearchItem[];
}

export function LatestResources({ items }: LatestResourcesProps) {
  return (
    <section aria-labelledby="home-latest-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2
            id="home-latest-heading"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            <Newspaper className="h-5 w-5 text-emerald-600" />
            <span>最新 AI 资料与研报</span>
          </h2>
          <p className="text-sm text-slate-600">
            聚合最新实战教程、开源模型卡片、arXiv 论文摘要与结构化提示词模板。
          </p>
        </div>

        <Link
          href="/search?sort=latest"
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:text-blue-600 sm:self-auto"
        >
          <span>查看全部资料</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => {
          const detailHref = `/resources/${encodeURIComponent(item.id)}`;

          return (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-slate-300"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ResourceTypeBadge type={item.type} />
                    <span className="text-xs text-slate-500">{item.source}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs tabular-nums text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {formatSearchDate(item.publishedAt)}
                  </span>
                </div>

                <h3 className="mt-3 line-clamp-1 text-base font-bold text-slate-900">
                  <Link
                    href={detailHref}
                    className="transition-colors hover:text-blue-600"
                  >
                    {item.title}
                  </Link>
                </h3>

                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.tags.slice(0, 2).map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?tag=${encodeURIComponent(tag)}`}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      #{tag}
                    </Link>
                  ))}
                  <span className="text-xs text-slate-400">· {item.author}</span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <Link
                    href={detailHref}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <span>详情</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline"
                  >
                    <span>原文</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
