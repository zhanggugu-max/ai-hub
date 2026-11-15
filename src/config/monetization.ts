export interface ToolReferralConfig {
  toolId: string;
  platformName: string;
  shortTag: string;
  referralUrl: string;
  perkLabel: string;
}

/**
 * 纯邀请链接 + 轻量福利提示配置（按 nav-tools 真实工具 ID 绑定）。
 * 注意：严格禁止在推荐打分与排序算法（src/lib/matcher/engine.ts）中引用本配置。
 */
export const TOOL_REFERRALS: Record<string, ToolReferralConfig> = {
  siliconflow: {
    toolId: 'siliconflow',
    platformName: '硅基流动（SiliconFlow）',
    shortTag: '国内高速开源推理',
    referralUrl: 'https://cloud.siliconflow.cn/i/B5LvOWbd',
    perkLabel: '通过站长邀请链接注册并认证，双方均可获赠官方算力代金券',
  },
  'volcengine-ark': {
    toolId: 'volcengine-ark',
    platformName: '火山方舟（Volcengine Ark）',
    shortTag: '豆包及主流模型平台',
    referralUrl: 'https://volcengine.com/L/UHeqefLYG2c/',
    perkLabel:
      '通过链接订阅 Agent Plan（Small/Medium）可享叠加 9.5 折（低至 9.4 元），支持 GLM-5.3、DeepSeek-V4.1、Kimi-K3 等模型',
  },
};

/**
 * 面向新手与 API 配置用户的官方合作邀请福利列表（含尚未作为独立工具收录的智谱 AI 开放平台）。
 */
export const API_PARTNER_PERKS: ToolReferralConfig[] = [
  TOOL_REFERRALS.siliconflow,
  TOOL_REFERRALS['volcengine-ark'],
  {
    toolId: 'zhipu-bigmodel',
    platformName: '智谱 AI 开放平台（BigModel）',
    shortTag: 'GLM 大模型官方 API',
    referralUrl:
      'https://www.bigmodel.cn/invite?icode=ez4bVIWJprr84IFR1o6dG%2F2gad6AKpjZefIo3dVEQyA%3D',
    perkLabel: '通过邀请链接注册，即可获赠 2000 万 Tokens 免费体验大礼包',
  },
];

export function getToolReferral(toolId: string): ToolReferralConfig | undefined {
  return TOOL_REFERRALS[toolId];
}

export const PUBLIC_CONTACT_EMAIL = 'hailanai@yeah.net';

export const FEEDBACK_CONFIG: {
  email: string;
  formUrl: string;
} = {
  email: PUBLIC_CONTACT_EMAIL,
  formUrl: '',
};

export const AFFILIATE_CONFIG = {
  aggregatorName: 'OpenRouter / 聚合 API 平台',
  aggregatorUrl: 'https://openrouter.ai',
  bannerText:
    '想低成本实测榜单模型？通过聚合 API 平台，一个 Key 即可调用 Claude / GPT / DeepSeek 全系接口',
  bannerCta: '获取 API Key ↗',
} as const;
