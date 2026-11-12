import Link from 'next/link';
import { ArrowRight, Bookmark, ExternalLink, ShieldCheck, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SearchItem } from '@/data/search/mock-data';

interface HotToolsProps {
  tools: SearchItem[];
}

export function HotTools({ tools }: HotToolsProps) {
  return (
    <section aria-labelledby="home-tools-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2
            id="home-tools-heading"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            <Wrench className="h-5 w-5 text-sky-600" />
            <span>热门 AI 工具推荐</span>
          </h2>
          <p className="text-sm text-slate-600">
            精选高频 AI 编程、知识库、自动化编排与本地部署工具（支持按标签快速筛选）。
          </p>
        </div>

        <Link
          href="/search?type=tool"
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:text-blue-600 sm:self-auto"
        >
          <span>浏览全部工具</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <article
            key={tool.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-blue-300"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className="gap-1 border-sky-200 bg-sky-50 text-xs text-sky-700"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  {tool.credibilityLabel}
                </Badge>

                <span className="inline-flex items-center gap-1 text-xs tabular-nums text-slate-400">
                  <Bookmark className="h-3.5 w-3.5" />
                  {tool.favoriteCount}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold leading-snug text-slate-900">
                <Link
                  href={`/resources/${encodeURIComponent(tool.id)}`}
                  className="transition-colors hover:text-blue-600"
                >
                  {tool.title}
                </Link>
              </h3>

              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                {tool.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?type=tool&tag=${encodeURIComponent(tag)}`}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <Link
                  href={`/resources/${encodeURIComponent(tool.id)}`}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <span>详情</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline"
                >
                  <span>直达</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
