'use client';

import { Scale, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/data/leaderboard/mock-data';

interface CompareFloatingBarProps {
  selectedEntries: LeaderboardEntry[];
  maxCompare: number;
  onRemove: (modelSlug: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}

export function CompareFloatingBar({
  selectedEntries,
  maxCompare,
  onRemove,
  onClear,
  onOpenCompare,
}: CompareFloatingBarProps) {
  if (selectedEntries.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto max-w-4xl px-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">
            已选对比 ({selectedEntries.length}/{maxCompare})：
          </span>
          {selectedEntries.map((entry) => (
            <Badge
              key={entry.modelSlug}
              variant="secondary"
              className="gap-1 bg-slate-100 pr-1 text-xs text-slate-800"
            >
              <span className="max-w-[140px] truncate">{entry.modelName}</span>
              <button
                type="button"
                onClick={() => onRemove(entry.modelSlug)}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                aria-label={`移除 ${entry.modelName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-1 text-xs text-slate-500 hover:text-slate-900"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onOpenCompare}
            disabled={selectedEntries.length < 2}
            className="gap-1.5"
          >
            <Scale className="h-4 w-4" />
            {selectedEntries.length < 2 ? '至少选 2 个对比' : '开始横向对比'}
          </Button>
        </div>
      </div>
    </div>
  );
}
