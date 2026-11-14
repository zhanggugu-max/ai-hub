'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, ExternalLink, Search, Sparkles, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  NAV_CATEGORIES,
  type NavTool,
  type NavToolCategory,
  type NavToolPricing,
} from '@/data/nav-tools';
import { cn } from '@/lib/utils';

interface NavExplorerProps {
  tools: NavTool[];
}

const PRICING_BADGE_STYLES: Record<NavToolPricing, string> = {
  开源免费: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  有免费额度: 'border-blue-200 bg-blue-50 text-blue-700',
  按量付费: 'border-slate-200 bg-slate-100 text-slate-700',
  订阅制: 'border-violet-200 bg-violet-50 text-violet-700',
};

function NavToolCard({ tool }: { tool: NavTool }) {
  const tutorialHref = tool.resourceSlug
    ? `/resources/${encodeURIComponent(tool.resourceSlug)}`
    : `/search?q=${encodeURIComponent(tool.searchKeyword)}`;
  const targetUrl = tool.affiliateUrl || tool.officialUrl;

  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-blue-300">
      <div className="space-y-3">
        {/* 卡片顶部：标题与右侧价格/精选角标 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold tracking-tight text-slate-900">{tool.name}</h3>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {tool.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                <Sparkles className="h-3 w-3" />
                海兰 AI 精选
              </span>
            )}
            <Badge
              variant="outline"
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                PRICING_BADGE_STYLES[tool.pricingType]
              )}
            >
              {tool.pricingType}
            </Badge>
          </div>
        </div>

        {/* 选型建议与短标签 */}
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{tool.tagline}</p>

        <div className="flex flex-wrap gap-1.5">
          {tool.badges.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 卡片底部操作栏 */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <Link
          href={tutorialHref}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <BookOpenText className="h-3.5 w-3.5" />
          <span>看站内教程</span>
        </Link>

        <a
          href={targetUrl}
          target="_blank"
          rel={tool.affiliateUrl ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
        >
          <span>直达官网</span>
          <ExternalLink className="h-3 w-3 opacity-85" />
        </a>
      </div>
    </article>
  );
}

export function NavExplorer({ tools }: NavExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | NavToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [freeOrOpenOnly, setFreeOrOpenOnly] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isGroupedMode = activeCategory === 'all' && !normalizedQuery && !freeOrOpenOnly;

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      if (activeCategory !== 'all' && tool.category !== activeCategory) {
        return false;
      }
      if (
        freeOrOpenOnly &&
        tool.pricingType !== '开源免费' &&
        tool.pricingType !== '有免费额度'
      ) {
        return false;
      }
      if (normalizedQuery) {
        const haystack =
          `${tool.name} ${tool.tagline} ${tool.badges.join(' ')} ${tool.searchKeyword} ${tool.pricingType}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }
      return true;
    });
  }, [tools, activeCategory, freeOrOpenOnly, normalizedQuery]);

  const handleReset = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setFreeOrOpenOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* 筛选与检索控制条 */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3">
          <Tabs
            value={activeCategory}
            onValueChange={(val) => setActiveCategory(val as 'all' | NavToolCategory)}
            className="w-full"
          >
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100 p-1 group-data-horizontal/tabs:h-auto">
              <TabsTrigger
                value="all"
                className="h-auto px-3 py-1.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-xs data-active:bg-white data-active:shadow-xs"
              >
                全部场景 ({tools.length})
              </TabsTrigger>
              {NAV_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="h-auto px-3 py-1.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-xs data-active:bg-white data-active:shadow-xs"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜工具名、标签或选型场景..."
                autoComplete="off"
                aria-label="检索场景工具"
                className="h-9 rounded-lg pr-8 pl-9 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="清空工具检索词"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-medium text-slate-700 select-none hover:border-blue-300">
              <Checkbox
                checked={freeOrOpenOnly}
                onCheckedChange={(checked) => setFreeOrOpenOnly(checked === true)}
                aria-label="仅看开源或免费额度工具"
              />
              <span>仅看开源/免费额度</span>
            </label>
          </div>
        </div>
      </div>

      {/* 结果展示：分组区块或扁平化网格 */}
      {isGroupedMode ? (
        <div className="space-y-8">
          {NAV_CATEGORIES.map((cat) => {
            const groupTools = tools.filter((t) => t.category === cat.value);
            return (
              <section key={cat.value} aria-labelledby={`nav-section-${cat.value}`} className="space-y-3.5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="flex items-center gap-2">
                    <h2
                      id={`nav-section-${cat.value}`}
                      className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
                    >
                      {cat.label}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {groupTools.length} 款
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 sm:text-sm">{cat.intro}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupTools.map((tool) => (
                    <NavToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <p className="text-sm text-slate-600">没有匹配当前关键词或价格条件的工具。</p>
          <Button variant="outline" size="sm" onClick={handleReset} className="mt-3">
            重置筛选条件
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>共筛选出 {filteredTools.length} 款符合条件的工具</span>
            {(normalizedQuery || freeOrOpenOnly) && (
              <button
                type="button"
                onClick={handleReset}
                className="font-medium text-blue-600 hover:underline"
              >
                重置全部条件
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <NavToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
