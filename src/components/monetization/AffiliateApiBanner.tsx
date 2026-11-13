import { KeyRound } from 'lucide-react';
import { AFFILIATE_CONFIG } from '@/config/monetization';

export function AffiliateApiBanner() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-blue-200/80 bg-blue-50/50 px-4 py-2.5 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <KeyRound className="h-3.5 w-3.5 shrink-0 text-blue-600" />
        <p className="leading-relaxed">{AFFILIATE_CONFIG.bannerText}</p>
      </div>

      <a
        href={AFFILIATE_CONFIG.aggregatorUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`前往 ${AFFILIATE_CONFIG.aggregatorName}`}
        className="inline-flex shrink-0 items-center self-start rounded-lg border border-blue-200 bg-white px-3 py-1 font-semibold text-blue-600 shadow-2xs transition-colors hover:border-blue-300 hover:bg-blue-600 hover:text-white sm:self-auto"
      >
        {AFFILIATE_CONFIG.bannerCta}
      </a>
    </div>
  );
}
