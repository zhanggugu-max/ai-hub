'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Info, Mail, MessageSquareWarning, ShieldCheck } from 'lucide-react';
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
            <blockquote className="rounded-lg border border-slate-200/80 border-l-[3px] border-l-blue-400/70 bg-slate-50/70 px-4 py-3 text-slate-600">
              {SITE_BRAND.motto}
            </blockquote>
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

      {/* 免责声明 */}
      <Dialog>
        <DialogTrigger className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-blue-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>免责声明</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>免责与合规声明</DialogTitle>
            <DialogDescription>
              使用 {SITE_BRAND.name} 导航、能力参考榜、规则选型及资料索引服务前，请阅读以下声明。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div className="rounded-lg bg-slate-50 p-3.5">
              <div className="mb-1 font-semibold text-slate-900">1. 中立导航与知识产权</div>
              <p>
                本站仅提供工具导航索引、公开技术元数据与自编中文使用摘要。所收录 AI 产品、模型及项目的商标、名称与官网内容版权均归原权利人所有；如发现署名、来源标注或权利异议，请邮件联系{' '}
                <a
                  href={`mailto:${realEmail}`}
                  className="font-medium text-blue-600 underline-offset-2 hover:underline"
                >
                  {realEmail}
                </a>{' '}
                核实处理。
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3.5">
              <div className="mb-1 font-semibold text-slate-900">2. 合法合规使用提示</div>
              <p>
                本站不提供任何网络代理服务或软件破解、盗版镜像、共享账号等违规资源，所有外链均指向官方正版渠道或合规开源仓库。用户访问与使用相关海外或国内 AI 服务时，须自行遵守所在地法律法规及目标平台用户协议。
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3.5">
              <div className="mb-1 font-semibold text-slate-900">3. 信息时效性</div>
              <p>
                大模型能力评测、平台免费体验额度、接口定价及网络访问策略可能随厂商政策动态调整，本站展示字段与推荐结果仅供选型参考，请以对应官方页面最新实时公告为准。
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5">
              <div className="mb-1 font-semibold text-slate-900">4. 推广与邀请披露</div>
              <p>
                部分云平台或工具外链可能包含站长邀请福利或合作推广标识，且均在页面明确提示；推广与邀请关系不会改变匹配算法权重、榜单得分或推荐排序。
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
