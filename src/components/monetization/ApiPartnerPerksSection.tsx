import { ExternalLink, Gift } from 'lucide-react';
import { API_PARTNER_PERKS } from '@/config/monetization';

export function ApiPartnerPerksSection() {
  return (
    <section
      aria-label="国内直连 API 平台新手邀请福利"
      className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
              <Gift className="h-4 w-4" />
            </span>
            <h2>国内直连 API 平台新手福利入口</h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
            学完第 03 步 API Key 配置后，可直接从下列官方邀请通道注册领额度起步。
          </p>
        </div>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500">
          含站长邀请福利，不影响推荐排序
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {API_PARTNER_PERKS.map((item) => (
          <article
            key={item.toolId}
            className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 transition-colors hover:border-blue-300 hover:bg-white"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{item.platformName}</h3>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {item.shortTag}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">{item.perkLabel}</p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-3">
              <span className="text-[11px] text-slate-400">官方邀请直达</span>
              <a
                href={item.referralUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
              >
                <span>直达领取</span>
                <ExternalLink className="h-3 w-3 opacity-85" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
