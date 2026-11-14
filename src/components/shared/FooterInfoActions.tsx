'use client';

import { useState } from 'react';
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
import { CONTACT_CONFIG, FEEDBACK_CONFIG } from '@/config/monetization';

const PLACEHOLDER_WECHAT_IDS = new Set(['', 'your_wechat_id', 'todo', 'placeholder']);

export function FooterInfoActions() {
  const [copiedWechat, setCopiedWechat] = useState(false);

  const realWechatId = !PLACEHOLDER_WECHAT_IDS.has(CONTACT_CONFIG.wechatId.trim().toLowerCase())
    ? CONTACT_CONFIG.wechatId.trim()
    : '';
  const realEmail = FEEDBACK_CONFIG.email.trim();
  const realFormUrl = FEEDBACK_CONFIG.formUrl.trim();
  const hasAnyChannel = Boolean(realWechatId || realEmail || realFormUrl);

  const handleCopyWechat = async () => {
    if (!realWechatId) return;
    try {
      await navigator.clipboard.writeText(realWechatId);
      setCopiedWechat(true);
      setTimeout(() => setCopiedWechat(false), 2000);
    } catch {
      // 忽略剪贴板权限限制
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
                本站仅展示条目元数据、自编中文摘要及原链接，不镜像或抓取第三方全文内容；如涉及来源标注或链接需调整，欢迎随时通过反馈通道通知我们修正。
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
            <DialogTitle>反馈与内容纠错</DialogTitle>
            <DialogDescription>
              发现链接失效、价格变动、测试口径描述不准确或希望补充新工具，欢迎提交纠错说明。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div className="rounded-lg bg-slate-50 p-3.5">
              <div className="mb-1.5 font-semibold text-slate-900">建议附带信息（方便快速核对）</div>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">
                <li>对应页面路径或模型 / 工具名称（如榜单页某模型条目）</li>
                <li>问题类型（链接打不开 / 定价更新 / 署名或来源标注需修正）</li>
                <li>可核验的官方参考链接（如有）</li>
              </ul>
            </div>

            {hasAnyChannel ? (
              <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-3.5">
                <div className="font-semibold text-slate-900">当前可用联系通道</div>
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
                {realEmail && (
                  <a
                    href={`mailto:${realEmail}`}
                    className="inline-flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>纠错邮箱：{realEmail}</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                )}
                {realWechatId && (
                  <button
                    type="button"
                    onClick={handleCopyWechat}
                    className="inline-flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <span>微信号：{realWechatId}</span>
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      {copiedWechat ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          复制
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                <div className="font-semibold">联系渠道待站长补充</div>
                <p className="mt-1 leading-relaxed">
                  当前暂未配置公开纠错邮箱、反馈问卷链接或有效微信号（本站未启用虚假提交表单）。站长可在配置文件补充真实联系方式后自动在此展示。
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
