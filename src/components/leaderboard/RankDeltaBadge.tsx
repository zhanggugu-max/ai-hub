import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RankDeltaBadgeProps {
  delta: number | null;
  className?: string;
}

/**
 * 排名周期变化指示徽章（用于榜单表格、移动端卡片及首页 Top 3 速览）
 */
export function RankDeltaBadge({ delta, className }: RankDeltaBadgeProps) {
  if (delta === null) {
    return (
      <Badge
        className={cn(
          'bg-blue-50 px-1.5 py-0 text-[10px] font-semibold text-blue-700 hover:bg-blue-50',
          className
        )}
      >
        NEW
      </Badge>
    );
  }
  if (delta > 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums text-emerald-600',
          className
        )}
      >
        <TrendingUp className="h-3 w-3" />
        {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums text-rose-600',
          className
        )}
      >
        <TrendingDown className="h-3 w-3" />
        {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span
      className={cn('inline-flex items-center text-xs text-slate-400', className)}
      title="排名持平"
    >
      <Minus className="h-3 w-3" />
    </span>
  );
}
