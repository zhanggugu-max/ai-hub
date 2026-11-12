import Link from 'next/link';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import type { SearchItem } from '@/data/search/mock-data';
import { formatSearchDate } from '@/lib/search/helpers';
import { ResourceTypeBadge } from './ResourceTypeBadge';

interface RelatedResourcesProps {
  items: SearchItem[];
}

export function RelatedResources({ items }: RelatedResourcesProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-resources-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="related-resources-heading"
          className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
        >
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span>相关 AI 资料推荐</span>
        </h2>
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
        >
          <span>去搜索更多</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-blue-300"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <ResourceTypeBadge type={item.type} />
                <span className="inline-flex items-center gap-1 text-xs tabular-nums text-slate-400">
                  <Calendar className="h-3 w-3" />
                  {formatSearchDate(item.publishedAt)}
                </span>
              </div>

              <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-base">
                <Link
                  href={`/resources/${encodeURIComponent(item.id)}`}
                  className="transition-colors hover:text-blue-600"
                >
                  {item.title}
                </Link>
              </h3>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {item.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <span className="truncate text-xs text-slate-500">{item.source}</span>
              <Link
                href={`/resources/${encodeURIComponent(item.id)}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <span>查看详情</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
