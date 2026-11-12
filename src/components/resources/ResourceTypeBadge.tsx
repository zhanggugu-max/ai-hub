import { BookOpen, Cpu, FileText, Sparkles, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SearchItemType } from '@/data/search/mock-data';

export const RESOURCE_TYPE_META: Record<
  SearchItemType,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  tool: {
    label: 'AI 工具',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
    icon: <Wrench className="h-3 w-3" />,
  },
  model: {
    label: 'AI 模型',
    badgeClass: 'border-violet-200 bg-violet-50 text-violet-700',
    icon: <Cpu className="h-3 w-3" />,
  },
  tutorial: {
    label: '实战教程',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: <BookOpen className="h-3 w-3" />,
  },
  paper: {
    label: '前沿论文',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: <FileText className="h-3 w-3" />,
  },
  prompt: {
    label: '提示词',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: <Sparkles className="h-3 w-3" />,
  },
};

export function ResourceTypeBadge({ type }: { type: SearchItemType }) {
  const meta = RESOURCE_TYPE_META[type];
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${meta.badgeClass}`}>
      {meta.icon}
      <span>{meta.label}</span>
    </Badge>
  );
}
