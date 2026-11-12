/** 榜单 Tab 类型 */
export type LeaderboardCategory = 'overall' | 'open_source' | 'api_value';

/** 开源 / 闭源权重类型 */
export type LicenseType = 'open_weights' | 'proprietary';

/** 榜单排序字段 */
export type LeaderboardSortKey =
  | 'rank'
  | 'overallScore'
  | 'codingScore'
  | 'mathScore'
  | 'contextWindow'
  | 'inputPricePer1M'
  | 'outputPricePer1M';

/** 单个模型在榜单中的评测条目 */
export interface LeaderboardEntry {
  id: string;
  modelSlug: string;
  modelName: string;
  provider: string;
  licenseType: LicenseType;
  licenseLabel: string;
  rank: number;
  /** 较上周期排名变化：正数上升，负数下降，0持平，null 表示新入榜 */
  rankDelta: number | null;
  scores: {
    overall: number;
    coding?: number;
    math?: number;
    reasoning?: number;
  };
  /** 上下文窗口长度（单位：K tokens） */
  contextWindowK: number;
  pricing?: {
    inputPer1MUsd: number;
    outputPer1MUsd: number;
  };
  speedTokensPerSec?: number;
  highlights: string[];
  officialUrl: string;
}

/** 单个榜单完整快照 */
export interface LeaderboardSnapshot {
  category: LeaderboardCategory;
  title: string;
  shortLabel: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  isMockData: boolean;
  updatedAt: string;
  methodologyNote: string;
  disclaimer: string;
  entries: LeaderboardEntry[];
}

/** 榜单筛选与排序状态 */
export interface LeaderboardFilterState {
  category: LeaderboardCategory;
  search: string;
  license: 'all' | LicenseType;
  provider: string;
  minContextK: number;
  sortKey: LeaderboardSortKey;
  sortOrder: 'asc' | 'desc';
}

export const LEADERBOARD_CATEGORIES: {
  value: LeaderboardCategory;
  label: string;
  desc: string;
}[] = [
  { value: 'overall', label: '综合能力榜', desc: '对话、编程、数学与复杂推理综合基准' },
  { value: 'open_source', label: '开源模型榜', desc: '可下载权重与私有化部署模型对比' },
  { value: 'api_value', label: 'API 性价比榜', desc: '输入/输出单价、吞吐与能力均衡度' },
];

/**
 * ============================================================================
 * 后续数据源替换点（Mock -> 真实数据库/定时任务快照）
 * ============================================================================
 * 说明：
 * 1. 以下数值均为前端联调占位数据（isMockData: true），非真实评测跑分。
 * 2. 接入 Supabase 后，请通过 src/lib/leaderboard/data-loader.ts 查询
 *    `leaderboard_snapshots` 与 `ai_models` 表并组装为 Record<LeaderboardCategory, LeaderboardSnapshot>。
 * 3. 请勿在此处编造未验证的第三方 API 端点或官方跑分。
 * ============================================================================
 */
export const MOCK_LEADERBOARDS: Record<LeaderboardCategory, LeaderboardSnapshot> = {
  overall: {
    category: 'overall',
    title: 'AI 大模型综合能力榜',
    shortLabel: '综合能力',
    description: '聚合主流大语言模型在通用对话、代码生成、数学推理与长文本理解上的基准表现。',
    sourceName: 'Mock 示例源（上线后替换为公开基准聚合快照）',
    sourceUrl: 'https://antigravity.google/docs',
    isMockData: true,
    updatedAt: '2026-11-12T08:00:00+08:00',
    methodologyNote: '按 0–100 归一化综合评分排序，保留每日快照以计算较上期排名升降（+N/-N）。',
    disclaimer:
      '当前页面展示为开发验证用 Mock 示例数据，所有分数、价格与吞吐量均为模拟占位值，不代表任何厂商或模型的实际评测成绩。正式上线后将展示真实来源链接、协议说明与定时同步时间戳。',
    entries: [
      {
        id: 'ov-1',
        modelSlug: 'frontier-pro-max',
        modelName: 'Frontier-Pro-Max (Mock)',
        provider: 'Lab Alpha',
        licenseType: 'proprietary',
        licenseLabel: 'Proprietary',
        rank: 1,
        rankDelta: 1,
        scores: { overall: 93.2, coding: 92.5, math: 94.1, reasoning: 93.8 },
        contextWindowK: 1000,
        pricing: { inputPer1MUsd: 2.5, outputPer1MUsd: 10.0 },
        speedTokensPerSec: 82,
        highlights: ['百万上下文', '复杂推理'],
        officialUrl: 'https://example.com/models/frontier-pro-max',
      },
      {
        id: 'ov-2',
        modelSlug: 'nova-reasoner-ultra',
        modelName: 'Nova-Reasoner-Ultra (Mock)',
        provider: 'Lab Beta',
        licenseType: 'proprietary',
        licenseLabel: 'Proprietary',
        rank: 2,
        rankDelta: -1,
        scores: { overall: 92.6, coding: 93.4, math: 92.0, reasoning: 92.4 },
        contextWindowK: 200,
        pricing: { inputPer1MUsd: 3.0, outputPer1MUsd: 15.0 },
        speedTokensPerSec: 74,
        highlights: ['代码架构', 'Agent 规划'],
        officialUrl: 'https://example.com/models/nova-reasoner-ultra',
      },
      {
        id: 'ov-3',
        modelSlug: 'open-coder-r2',
        modelName: 'Open-Coder-R2-72B (Mock)',
        provider: 'OpenStudio',
        licenseType: 'open_weights',
        licenseLabel: 'MIT',
        rank: 3,
        rankDelta: 2,
        scores: { overall: 90.8, coding: 91.9, math: 91.5, reasoning: 89.4 },
        contextWindowK: 128,
        pricing: { inputPer1MUsd: 0.45, outputPer1MUsd: 1.5 },
        speedTokensPerSec: 108,
        highlights: ['开源可商用', '高性价比'],
        officialUrl: 'https://example.com/models/open-coder-r2',
      },
      {
        id: 'ov-4',
        modelSlug: 'swift-flash-3',
        modelName: 'Swift-Flash-3.0 (Mock)',
        provider: 'Lab Alpha',
        licenseType: 'proprietary',
        licenseLabel: 'Proprietary',
        rank: 4,
        rankDelta: null,
        scores: { overall: 89.4, coding: 88.9, math: 90.2, reasoning: 89.1 },
        contextWindowK: 1000,
        pricing: { inputPer1MUsd: 0.15, outputPer1MUsd: 0.6 },
        speedTokensPerSec: 185,
        highlights: ['极速低延迟', '百万上下文'],
        officialUrl: 'https://example.com/models/swift-flash-3',
      },
      {
        id: 'ov-5',
        modelSlug: 'atlas-instruct-v4',
        modelName: 'Atlas-Instruct-405B (Mock)',
        provider: 'CloudFoundry',
        licenseType: 'open_weights',
        licenseLabel: 'Apache-2.0',
        rank: 5,
        rankDelta: 0,
        scores: { overall: 88.5, coding: 87.2, math: 88.9, reasoning: 89.0 },
        contextWindowK: 128,
        pricing: { inputPer1MUsd: 0.9, outputPer1MUsd: 2.7 },
        speedTokensPerSec: 65,
        highlights: ['Apache-2.0', '指令遵循'],
        officialUrl: 'https://example.com/models/atlas-instruct-v4',
      },
      {
        id: 'ov-6',
        modelSlug: 'mini-edge-14b',
        modelName: 'Mini-Edge-14B (Mock)',
        provider: 'OpenStudio',
        licenseType: 'open_weights',
        licenseLabel: 'Apache-2.0',
        rank: 6,
        rankDelta: 3,
        scores: { overall: 84.3, coding: 85.6, math: 84.8, reasoning: 82.9 },
        contextWindowK: 64,
        pricing: { inputPer1MUsd: 0.08, outputPer1MUsd: 0.24 },
        speedTokensPerSec: 210,
        highlights: ['本地部署友好', '极低成本'],
        officialUrl: 'https://example.com/models/mini-edge-14b',
      },
      {
        id: 'ov-7',
        modelSlug: 'prism-core-v2',
        modelName: 'Prism-Core-V2 (Mock)',
        provider: 'Lab Gamma',
        licenseType: 'proprietary',
        licenseLabel: 'Proprietary',
        rank: 7,
        rankDelta: -2,
        scores: { overall: 83.9, coding: 82.1, math: 84.0 },
        contextWindowK: 32,
        pricing: { inputPer1MUsd: 1.2, outputPer1MUsd: 4.8 },
        speedTokensPerSec: 96,
        highlights: ['中文文案优化'],
        officialUrl: 'https://example.com/models/prism-core-v2',
      },
    ],
  },

  open_source: {
    category: 'open_source',
    title: '开源大模型能力榜',
    shortLabel: '开源模型',
    description: '筛选公开权重并支持自托管部署的模型，重点标注开源协议与私有化成本参考。',
    sourceName: 'Mock 示例源（上线后替换为 Hugging Face 公开评测数据集）',
    sourceUrl: 'https://huggingface.co',
    isMockData: true,
    updatedAt: '2026-11-12T08:00:00+08:00',
    methodologyNote: '仅纳入 open_weights 模型；商用选型前请核对仓库 LICENSE 限制条款。',
    disclaimer:
      '当前页面展示为开发验证用 Mock 示例数据；开源模型的推理价格由第三方托管服务商测算占位，实际私有部署成本取决于显卡型号与量化方案。',
    entries: [
      {
        id: 'os-1',
        modelSlug: 'open-coder-r2',
        modelName: 'Open-Coder-R2-72B (Mock)',
        provider: 'OpenStudio',
        licenseType: 'open_weights',
        licenseLabel: 'MIT',
        rank: 1,
        rankDelta: 0,
        scores: { overall: 90.8, coding: 91.9, math: 91.5, reasoning: 89.4 },
        contextWindowK: 128,
        pricing: { inputPer1MUsd: 0.45, outputPer1MUsd: 1.5 },
        speedTokensPerSec: 108,
        highlights: ['MIT 协议', '代码第一梯队'],
        officialUrl: 'https://example.com/models/open-coder-r2',
      },
      {
        id: 'os-2',
        modelSlug: 'atlas-instruct-v4',
        modelName: 'Atlas-Instruct-405B (Mock)',
        provider: 'CloudFoundry',
        licenseType: 'open_weights',
        licenseLabel: 'Apache-2.0',
        rank: 2,
        rankDelta: 1,
        scores: { overall: 88.5, coding: 87.2, math: 88.9, reasoning: 89.0 },
        contextWindowK: 128,
        pricing: { inputPer1MUsd: 0.9, outputPer1MUsd: 2.7 },
        speedTokensPerSec: 65,
        highlights: ['Apache-2.0', '通用旗舰'],
        officialUrl: 'https://example.com/models/atlas-instruct-v4',
      },
      {
        id: 'os-3',
        modelSlug: 'q-math-moe-235b',
        modelName: 'Q-Math-MoE-235B (Mock)',
        provider: 'MathForge',
        licenseType: 'open_weights',
        licenseLabel: 'Apache-2.0',
        rank: 3,
        rankDelta: null,
        scores: { overall: 87.9, coding: 86.5, math: 92.8, reasoning: 88.2 },
        contextWindowK: 256,
        pricing: { inputPer1MUsd: 0.35, outputPer1MUsd: 1.1 },
        speedTokensPerSec: 120,
        highlights: ['MoE 稀疏激活', '数学强项'],
        officialUrl: 'https://example.com/models/q-math-moe-235b',
      },
      {
        id: 'os-4',
        modelSlug: 'mini-edge-14b',
        modelName: 'Mini-Edge-14B (Mock)',
        provider: 'OpenStudio',
        licenseType: 'open_weights',
        licenseLabel: 'Apache-2.0',
        rank: 4,
        rankDelta: -1,
        scores: { overall: 84.3, coding: 85.6, math: 84.8, reasoning: 82.9 },
        contextWindowK: 64,
        pricing: { inputPer1MUsd: 0.08, outputPer1MUsd: 0.24 },
        speedTokensPerSec: 210,
        highlights: ['消费级显卡可跑'],
        officialUrl: 'https://example.com/models/mini-edge-14b',
      },
      {
        id: 'os-5',
        modelSlug: 'vision-open-32b',
        modelName: 'Vision-Open-32B (Mock)',
        provider: 'CloudFoundry',
        licenseType: 'open_weights',
        licenseLabel: 'Community-License',
        rank: 5,
        rankDelta: 0,
        scores: { overall: 82.1, coding: 80.4, math: 81.9 },
        contextWindowK: 32,
        speedTokensPerSec: 135,
        highlights: ['图文理解', '注意商用条款'],
        officialUrl: 'https://example.com/models/vision-open-32b',
      },
    ],
  },

  api_value: {
    category: 'api_value',
    title: 'API 性价比与吞吐对比榜',
    shortLabel: 'API 性价比',
    description: '面向生产环境成本控制，横向对比输入/输出单价（USD/1M Tokens）与生成速度。',
    sourceName: 'Mock 示例源（上线后替换为厂商官方定价校验库）',
    sourceUrl: 'https://antigravity.google/docs',
    isMockData: true,
    updatedAt: '2026-11-12T08:00:00+08:00',
    methodologyNote: '按“综合能力 / 成本”性价比排序，支持点击表头按输入或输出单价升序查看最省方案。',
    disclaimer:
      '当前页面展示为开发验证用 Mock 示例数据；真实 API 计费受 Prompt 缓存命中、Batch 折扣与地区节点影响，请以厂商官方计费文档为准。',
    entries: [
      {
        id: 'api-1',
        modelSlug: 'swift-flash-3',
        modelName: 'Swift-Flash-3.0 (Mock)',
        provider: 'Lab Alpha',
        licenseType: 'proprietary',
        licenseLabel: 'Proprietary',
        rank: 1,
        rankDelta: 1,
        scores: { overall: 89.4, coding: 88.9, math: 90.2, reasoning: 89.1 },
        contextWindowK: 1000,
        pricing: { inputPer1MUsd: 0.15, outputPer1MUsd: 0.6 },
        speedTokensPerSec: 185,
        highlights: ['性价比冠军', '高吞吐'],
        officialUrl: 'https://example.com/models/swift-flash-3',
      },
      {
        id: 'api-2',
        modelSlug: 'mini-edge-14b',
        modelName: 'Mini-Edge-14B (Mock)',
        provider: 'OpenStudio',
        licenseType: 'open_weights',
        licenseLabel: 'Apache-2.0',
        rank: 2,
        rankDelta: 0,
        scores: { overall: 84.3, coding: 85.6, math: 84.8, reasoning: 82.9 },
        contextWindowK: 64,
        pricing: { inputPer1MUsd: 0.08, outputPer1MUsd: 0.24 },
        speedTokensPerSec: 210,
        highlights: ['最低单价', '210 tok/s'],
        officialUrl: 'https://example.com/models/mini-edge-14b',
      },
      {
        id: 'api-3',
        modelSlug: 'open-coder-r2',
        modelName: 'Open-Coder-R2-72B (Mock)',
        provider: 'OpenStudio',
        licenseType: 'open_weights',
        licenseLabel: 'MIT',
        rank: 3,
        rankDelta: -1,
        scores: { overall: 90.8, coding: 91.9, math: 91.5, reasoning: 89.4 },
        contextWindowK: 128,
        pricing: { inputPer1MUsd: 0.45, outputPer1MUsd: 1.5 },
        speedTokensPerSec: 108,
        highlights: ['代码高性价比'],
        officialUrl: 'https://example.com/models/open-coder-r2',
      },
      {
        id: 'api-4',
        modelSlug: 'frontier-pro-max',
        modelName: 'Frontier-Pro-Max (Mock)',
        provider: 'Lab Alpha',
        licenseType: 'proprietary',
        licenseLabel: 'Proprietary',
        rank: 4,
        rankDelta: 0,
        scores: { overall: 93.2, coding: 92.5, math: 94.1, reasoning: 93.8 },
        contextWindowK: 1000,
        pricing: { inputPer1MUsd: 2.5, outputPer1MUsd: 10.0 },
        speedTokensPerSec: 82,
        highlights: ['旗舰质量基准'],
        officialUrl: 'https://example.com/models/frontier-pro-max',
      },
      {
        id: 'api-5',
        modelSlug: 'nova-reasoner-ultra',
        modelName: 'Nova-Reasoner-Ultra (Mock)',
        provider: 'Lab Beta',
        licenseType: 'proprietary',
        licenseLabel: 'Proprietary',
        rank: 5,
        rankDelta: 0,
        scores: { overall: 92.6, coding: 93.4, math: 92.0, reasoning: 92.4 },
        contextWindowK: 200,
        pricing: { inputPer1MUsd: 3.0, outputPer1MUsd: 15.0 },
        speedTokensPerSec: 74,
        highlights: ['重度推理专精'],
        officialUrl: 'https://example.com/models/nova-reasoner-ultra',
      },
    ],
  },
};
