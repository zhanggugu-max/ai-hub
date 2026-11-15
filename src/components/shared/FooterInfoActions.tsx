'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Info, Mail, MessageSquareWarning } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SITE_BRAND } from '@/config/brand';
import { FEEDBACK_CONFIG, PUBLIC_CONTACT_EMAIL } from '@/config/monetization';

export function FooterInfoActions() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const realEmail = (FEEDBACK_CONFIG.email || PUBLIC_CONTACT_EMAIL).trim();
  const realFormUrl = FEEDBACK_CONFIG.formUrl.trim();
  const hasAnyChannel = Boolean(realEmail || realFormUrl);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyEmail = async () => {
    if (!realEmail) return;
    try {
      await navigator.clipboard.writeText(realEmail);
      setCopiedEmail(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedEmail(false);
      }, 2500);
    } catch {
      setCopiedEmail(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {/* 关于海兰 AI */}
      <Dialog>
        <DialogTrigger className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-blue-600">
          <Info className="h-3.5 w-3.5" />
          <span>关于海兰 AI</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>关于 {SITE_BRAND.name}</DialogTitle>
            <DialogDescription>
              {SITE_BRAND.positioning} · {SITE_BRAND.slogan}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div className="rounded-lg bg-slate-50 p-3.5">
              <div className="mb-1 font-semibold text-slate-900">1. 定位与内容形式</div>
              <p>
                {SITE_BRAND.name}面向中文开发者、职场办公人群与 AI 新手，提供场景化工具导航、大模型能力参考榜、零基础入门指南与资料检索入口。
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3.5">
              <div className="mb-1 font-semibold text-slate-900">2. 公开数据来源与更新机制</div>
              <p>
                榜单分数与定价参考主要同步自 LiveBench 2.0 与 OpenRouter 公开数据集，资料索引来源于各工具官方文档、GitHub 与 arXiv 公开元数据；采用脚本定时同步与人工审核整理相结合的方式维护，并明确标注原始出处。
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-slate-600">
              <div className="mb-1 font-semibold text-slate-900">3. 版权与独立性声明</div>
              <p>
                本站仅展示条目元数据、自编中文摘要及原链接，不镜像或抓取第三方全文内容；部分平台链接可能附带站长邀请福利并明确标注，不影响工具推荐排序与测评打分。如需纠错或商务联系，可发邮件至{' '}
                <a
                  href={`mailto:${realEmail}`}
                  className="font-medium text-blue-600 underline-offset-2 hover:underline"
                >
                  {realEmail}
                </a>
                。
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 反馈与纠错 */}
      <Dialog>
        <DialogTrigger className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-blue-600">
          <MessageSquareWarning className="h-3.5 w-3.5" />
          <span>反馈与纠错</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>反馈与商务联系</DialogTitle>
            <DialogDescription>
              发现链接失效、价格变动、测试口径描述不准确，或希望沟通工具收录与商务合作，欢迎来信联系。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div className="rounded-lg bg-slate-50 p-3.5">
              <div className="mb-1.5 font-semibold text-slate-900">建议核对维度</div>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">
                <li>对应页面路径或模型 / 工具名称（如榜单页或匹配器条目）</li>
                <li>问题类型（链接失效 / 定价调整 / 署名与来源标注说明 / 商务合作）</li>
                <li>可核验的官方定价或文档参考链接</li>
              </ul>
            </div>

            {hasAnyChannel ? (
              <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-3.5">
                <div className="font-semibold text-slate-900">官方反馈与商务联系邮箱</div>
                {realEmail && (
                  <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-800 sm:text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                      <span className="truncate select-all">{realEmail}</span>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className={
                          copiedEmail
                            ? 'inline-flex cursor-pointer items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors'
                            : 'inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600'
                        }
                      >
                        {copiedEmail ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>已复制 ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>一键复制邮箱</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`mailto:${realEmail}`}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                      >
                        <span>发送邮件</span>
                        <ExternalLink className="h-3 w-3 opacity-85" />
                      </a>
                    </div>
                  </div>
                )}

                {realFormUrl && (
                  <a
                    href={realFormUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex w-full items-center justify-between rounded-md border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100/70"
                  >
                    <span>在线纠错 / 提报问卷</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600">
                <div className="font-semibold text-slate-900">站内说明</div>
                <p className="mt-1 leading-relaxed">
                  {SITE_BRAND.name}当前以公开工具导航、能力榜单与规则选型文档为主，暂未开放公开人工咨询通道。
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
