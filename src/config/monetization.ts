export const CONTACT_CONFIG = {
  wechatId: 'your_wechat_id',
  serviceTitle: '部署报错或时间紧张？提供一对一实战支持',
  serviceDesc:
    '承接 Dify / n8n 自动化工作流搭建、本地模型私有化部署、MCP 接入与 API 成本优化。',
  ctaText: '复制微信号咨询',
} as const;

export const FEEDBACK_CONFIG: {
  email: string;
  formUrl: string;
} = {
  email: '',
  formUrl: '',
};

export const AFFILIATE_CONFIG = {
  aggregatorName: 'OpenRouter / 聚合 API 平台',
  aggregatorUrl: 'https://openrouter.ai',
  bannerText:
    '想低成本实测榜单模型？通过聚合 API 平台，一个 Key 即可调用 Claude / GPT / DeepSeek 全系接口',
  bannerCta: '获取 API Key ↗',
} as const;
