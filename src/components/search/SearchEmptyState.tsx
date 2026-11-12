'use client';

import { RotateCcw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HOT_SEARCH_TAGS } from '@/data/search/mock-data';

interface SearchEmptyStateProps {
  query: string;
  onResetAll: () => void;
  onQuickTagClick: (tag: string) => void;
}

export function SearchEmptyState({
  query,
  onResetAll,
  onQuickTagClick,
}: SearchEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">
        {query.trim()
          ? `未找到与 “${query.trim()}” 匹配的 AI 资料`
          : '当前筛选条件下暂无匹配资料'}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
        建议精简搜索词、减少多选标签数量，或切换为“全部资料 / 全部时间”后重试。
      </p>

      <div className="mt-5 flex justify-center">
        <Button type="button" variant="outline" onClick={onResetAll} className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
          重置全部筛选条件
        </Button>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="mb-2.5 text-xs font-medium text-slate-500">试试热门方向：</div>
        <div className="flex flex-wrap justify-center gap-2">
          {HOT_SEARCH_TAGS.slice(0, 5).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onQuickTagClick(tag)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
