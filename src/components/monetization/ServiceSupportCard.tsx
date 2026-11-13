'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_CONFIG } from '@/config/monetization';

export function ServiceSupportCard() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_CONFIG.wechatId);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-label="实战部署与定制咨询"
      className="rounded-xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-blue-50/70 p-5 shadow-2xs sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 sm:text-base">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
              <MessageSquareText className="h-4 w-4" />
            </span>
            <span>{CONTACT_CONFIG.serviceTitle}</span>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            {CONTACT_CONFIG.serviceDesc}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            variant={copied ? 'secondary' : 'outline'}
            onClick={handleCopy}
            className={
              copied
                ? 'h-9 gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 hover:bg-emerald-50'
                : 'h-9 gap-1.5 rounded-lg border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 shadow-2xs hover:border-blue-300 hover:text-blue-600'
            }
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>已复制微信号 ✓</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{CONTACT_CONFIG.ctaText}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
