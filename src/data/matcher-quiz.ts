import type { NavTool, NavToolCategory } from '@/data/nav-tools';

export type QuizQuestionId = 'scene' | 'budget' | 'skill' | 'network' | 'workMode';

export interface QuizOption {
  value: string;
  label: string;
  shortTag: string;
  description: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  stepNumber: number;
  title: string;
  subtitle: string;
  maxWeight: number;
  options: QuizOption[];
}

export type MatcherAnswers = Partial<Record<QuizQuestionId, string>>;

export interface MatchedToolResult {
  tool: NavTool;
  score: number;
  matchPercent: number;
  reasons: string[];
}

export const MATCHER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'scene',
    stepNumber: 1,
    title: '你目前最想让 AI 帮你解决哪类事情？',
    subtitle: '核心使用场景决定匹配基调（最高权重 +50 分）',
    maxWeight: 50,
    options: [
      {
        value: 'A',
        label: '写代码 / 修 Bug / 搭网站',
        shortTag: '编程建站',
        description: '需要辅助写项目代码、排查报错或快速搭一个可上线网站。',
      },
      {
        value: 'B',
        label: '日常办公 / 自动整理文件 / 写文档 PPT',
        shortTag: '办公自动化',
        description: '想把整理文件、写周报做 PPT、跨软件琐事交给桌面助手。',
      },
      {
        value: 'C',
        label: '查资料 / 读长论文 / 写深度分析报告',
        shortTag: '检索科研',
        description: '看重实时联网溯源、大篇幅 PDF 文档解析与对比调研。',
      },
      {
        value: 'D',
        label: '做图片 / 剪视频 / 配音写歌',
        shortTag: '多模态创作',
        description: '需要商业海报、AI 视频、人声配音克隆或 AI 写歌编曲。',
      },
      {
        value: 'E',
        label: '低成本调用各种大模型 API / 折腾部署',
        shortTag: 'API 与部署',
        description: '想申请高性价比 API Key、聚合切换多模型或本地部署。',
      },
    ],
  },
  {
    id: 'budget',
    stepNumber: 2,
    title: '你的预算偏好是怎样的？',
    subtitle: '结合收费模式为你筛选最划算的入手方式（+25 分）',
    maxWeight: 25,
    options: [
      {
        value: 'A',
        label: '纯白嫖 / 优先免费额度',
        shortTag: '免费 / 开源优先',
        description: '优先开源免费软件或官方每日/新客赠送免费额度的工具。',
      },
      {
        value: 'B',
        label: '按实际用量付费，不包月',
        shortTag: '按量付费不包月',
        description: '用多少算多少，不想每月被 20 美元固定月费绑定。',
      },
      {
        value: 'C',
        label: '只要效果最强，愿意付费订阅',
        shortTag: '旗舰效果优先',
        description: '看重最省心或最顶尖的旗舰表现，接受按月订阅会员。',
      },
    ],
  },
  {
    id: 'skill',
    stepNumber: 3,
    title: '你的动手折腾能力如何？',
    subtitle: '匹配与你技术背景最合拍的工具形态（+20 分）',
    maxWeight: 20,
    options: [
      {
        value: 'A',
        label: '纯小白，打开网页或安装软件就能直接用',
        shortTag: '零门槛开箱即用',
        description: '不想碰黑框命令行或环境变量，最好点开就能用。',
      },
      {
        value: 'B',
        label: '会一点基础操作，愿意跟着教程配 API Key 或插件',
        shortTag: '可配 Key / 插件',
        description: '能照着教程复制粘贴 Key 或装 VS Code / 桌面客户端。',
      },
      {
        value: 'C',
        label: '极客玩家，喜欢本地部署、命令行和高度自定义',
        shortTag: '极客 / 本地自定义',
        description: '偏好终端 CLI、Docker 私有化部署与高自由度开源工具。',
      },
    ],
  },
  {
    id: 'network',
    stepNumber: 4,
    title: '你的网络使用习惯是？',
    subtitle: '兼顾国内直连可用性与海外旗舰覆盖（+20 分）',
    maxWeight: 20,
    options: [
      {
        value: 'A',
        label: '希望国内网络直接打开，不折腾复杂环境',
        shortTag: '国内直连优先',
        description: '首选国产主力平台或运行在自己电脑上的本地工具。',
      },
      {
        value: 'B',
        label: '国内外主流工具都能正常访问，只看综合实力',
        shortTag: '全球无限制优选',
        description: '可顺畅访问海内外所有平台，按综合能力择优匹配。',
      },
    ],
  },
  {
    id: 'workMode',
    stepNumber: 5,
    title: '你更习惯哪种工作方式？',
    subtitle: '决定优先推荐网页端、桌面软件还是编辑器工作流（+15 分）',
    maxWeight: 15,
    options: [
      {
        value: 'A',
        label: '网页端随时打开即用，不占电脑内存',
        shortTag: '网页端轻量即用',
        description: '打开浏览器即可运行，换电脑也能随时登录继续。',
      },
      {
        value: 'B',
        label: '装在电脑桌面上，能直接帮我操作本地文件',
        shortTag: '桌面本地操作',
        description: '常驻桌面或可读写电脑文件夹，减少来回上传下载。',
      },
      {
        value: 'C',
        label: '嵌入到我现有的编辑器（如 VS Code）或自动化流程里',
        shortTag: '嵌入编辑器 / 工作流',
        description: '直接整合进代码编辑器、终端命令行或 API/节点编排流。',
      },
    ],
  },
];

// 工具特征分类集合（严格对应 src/data/nav-tools.ts 中的 id）
const CLI_AND_COMPLEX_OSS_IDS = new Set([
  'claude-code',
  'openai-codex',
  'gemini-cli',
  'qwen-code',
  'mcp-protocol',
  'ollama',
  'openclaw',
  'hermes-agent',
  'hermes-agent-desktop',
  'nanobot',
  'gas-town-orchestrator',
  'trycua-cua',
  'ui-tars-desktop',
  'n8n',
  'comfyui',
]);

const TURNKEY_FRIENDLY_IDS = new Set([
  'tencent-workbuddy',
  'alibaba-qoderwork',
  'bytedance-traework',
  'zhipu-autoclaw',
  'minimax-agent',
  'manus-ai',
  'todesk-ai',
  'lindy-ai',
  'coze',
  'gamma-ai',
  'lovable-dev',
  'vercel-v0',
  'bolt-new',
  'replit-agent',
  'perplexity',
  'kimi-research',
  'notebooklm',
  'metaso-ai',
  'kling-ai',
  'jimeng-seedance',
  'google-veo',
  'runway-gen4',
  'midjourney-web',
  'recraft-ai',
  'suno-music',
  'elevenlabs-tts',
  'tongyi-tingwu',
  'granola-notes',
  'lm-studio',
  'trae',
  'cursor',
]);

const PLUGIN_AND_API_FRIENDLY_IDS = new Set([
  'cherry-studio',
  'cline-roo-code',
  'cursor',
  'trae',
  'dify',
  'n8n',
  'fastgpt',
  'lm-studio',
  'openrouter',
  'siliconflow',
  'deepseek-platform',
  'volcengine-ark',
  'aliyun-bailian',
  'fal-replicate',
  'obsidian-ai',
  'zotero-ai',
  'lava-workspace',
  'claude-cowork',
  'dyad-local',
  'google-antigravity',
]);

const DOMESTIC_DIRECT_IDS = new Set([
  'tencent-workbuddy',
  'alibaba-qoderwork',
  'bytedance-traework',
  'zhipu-autoclaw',
  'minimax-agent',
  'deepseek-harness',
  'todesk-ai',
  'trae',
  'qwen-code',
  'dify',
  'coze',
  'fastgpt',
  'siliconflow',
  'deepseek-platform',
  'volcengine-ark',
  'aliyun-bailian',
  'kimi-research',
  'metaso-ai',
  'kling-ai',
  'jimeng-seedance',
  'tongyi-tingwu',
  // 本地运行/客户端类软件国内可顺畅使用
  'cherry-studio',
  'ollama',
  'lm-studio',
  'dyad-local',
  'obsidian-ai',
  'zotero-ai',
  'fish-audio',
  'ui-tars-desktop',
  'nanobot',
]);

const OVERSEAS_CLOUD_RESTRICTED_IDS = new Set([
  'google-antigravity',
  'openai-codex-app',
  'openai-dots',
  'grok-bot',
  'meta-muse-agent',
  'claude-cowork',
  'lindy-ai',
  'manus-ai',
  'claude-code',
  'openai-codex',
  'gemini-cli',
  'openrouter',
  'official-frontier-apis',
  'meta-muse',
  'xai-grok',
  'perplexity',
  'notebooklm',
  'grok-deepsearch',
  'elicit-research',
  'lovable-dev',
  'vercel-v0',
  'bolt-new',
  'replit-agent',
  'gamma-ai',
  'google-veo',
  'runway-gen4',
  'midjourney-web',
  'recraft-ai',
  'suno-music',
  'elevenlabs-tts',
  'granola-notes',
]);

const WEB_FIRST_IDS = new Set([
  'coze',
  'openrouter',
  'siliconflow',
  'deepseek-platform',
  'volcengine-ark',
  'aliyun-bailian',
  'fal-replicate',
  'perplexity',
  'kimi-research',
  'arxiv-daily',
  'notebooklm',
  'grok-deepsearch',
  'metaso-ai',
  'elicit-research',
  'huggingface-hub',
  'lovable-dev',
  'vercel-v0',
  'bolt-new',
  'replit-agent',
  'gamma-ai',
  'kling-ai',
  'google-veo',
  'jimeng-seedance',
  'runway-gen4',
  'midjourney-web',
  'recraft-ai',
  'suno-music',
  'elevenlabs-tts',
  'tongyi-tingwu',
  'manus-ai',
  'minimax-agent',
  'lindy-ai',
  'openai-dots',
  'grok-bot',
]);

const DESKTOP_APP_IDS = new Set([
  'cherry-studio',
  'cursor',
  'trae',
  'ollama',
  'lm-studio',
  'dyad-local',
  'obsidian-ai',
  'zotero-ai',
  'granola-notes',
  'fish-audio',
]);

const EMBEDDED_ORCHESTRATION_IDS = new Set([
  'claude-code',
  'cline-roo-code',
  'cursor',
  'trae',
  'openai-codex',
  'gemini-cli',
  'mcp-protocol',
  'qwen-code',
  'dify',
  'n8n',
  'comfyui',
  'fastgpt',
  'hermes-agent',
  'nanobot',
  'openrouter',
  'siliconflow',
  'deepseek-platform',
  'official-frontier-apis',
  'meta-muse',
  'xai-grok',
  'volcengine-ark',
  'aliyun-bailian',
  'fal-replicate',
  'gas-town-orchestrator',
  'lava-workspace',
  'trycua-cua',
  'obsidian-ai',
  'zotero-ai',
]);

const SCENE_CATEGORIES: Record<string, NavToolCategory[]> = {
  A: ['coding', 'app-builder'],
  B: ['desktop-agents', 'workflow'],
  C: ['research'],
  D: ['multimodal-visual', 'audio-productivity'],
  E: ['api-compute', 'workflow'],
};

const SCENE_SPECIAL_BONUS: Record<string, Record<string, number>> = {
  A: { 'gas-town-orchestrator': 42, 'dify': 26, 'fastgpt': 24 },
  B: { 'gamma-ai': 46, 'cherry-studio': 38, 'obsidian-ai': 40, 'tongyi-tingwu': 38, 'granola-notes': 38 },
  C: { 'kimi-research': 50, 'perplexity': 50, 'notebooklm': 50, 'metaso-ai': 48, 'elicit-research': 48 },
  D: { 'comfyui': 48 },
  E: { 'cherry-studio': 44, 'ollama': 48, 'lm-studio': 46, 'dify': 46, 'n8n': 44, 'fastgpt': 44 },
};

function scoreTool(
  tool: NavTool,
  answers: MatcherAnswers
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. 核心场景 (+50)
  const sceneChoice = answers.scene ?? 'B';
  const targetCats = SCENE_CATEGORIES[sceneChoice] ?? [];
  const specialSceneBonus = SCENE_SPECIAL_BONUS[sceneChoice]?.[tool.id];

  if (targetCats[0] === tool.category) {
    score += 50;
  } else if (targetCats.includes(tool.category)) {
    score += 46;
  } else if (specialSceneBonus) {
    score += specialSceneBonus;
  } else {
    score += 6;
  }

  const sceneOption = MATCHER_QUESTIONS[0].options.find((o) => o.value === sceneChoice);
  if (sceneOption && (targetCats.includes(tool.category) || specialSceneBonus)) {
    reasons.push(`高度契合「${sceneOption.shortTag}」核心诉求：${tool.tagline}`);
  }

  // 2. 预算偏好 (+25)
  const budgetChoice = answers.budget ?? 'A';
  if (budgetChoice === 'A') {
    if (tool.pricingType === '开源免费') {
      score += 25;
      reasons.push('属于「开源免费」方案，无需长期付费订阅，试错成本为零。');
    } else if (tool.pricingType === '有免费额度') {
      score += 22;
      reasons.push('提供「有免费额度」入门体验，适合先零成本跑通日常需求。');
    } else if (tool.pricingType === '按量付费') {
      score += 6;
    } else {
      score -= 18;
    }
  } else if (budgetChoice === 'B') {
    if (tool.pricingType === '按量付费') {
      score += 25;
      reasons.push('支持「按量付费」，用多少扣多少，比每月固定月费更省钱。');
    } else if (tool.pricingType === '有免费额度') {
      score += 20;
      reasons.push('兼具「有免费额度」与灵活按需扩展能力，无需刚性包月。');
    } else if (tool.pricingType === '开源免费') {
      score += 14;
    } else {
      score -= 12;
    }
  } else {
    // C: 效果优先，愿意订阅
    if (tool.featured) score += 10;
    if (tool.pricingType === '订阅制') {
      score += 18;
      reasons.push('旗舰级成熟商用方案，体验省心稳定，付费换效率回报最高。');
    } else if (tool.pricingType === '按量付费') {
      score += 15;
    } else if (tool.pricingType === '有免费额度') {
      score += 14;
      if (tool.featured) {
        reasons.push('属于该场景官方精选首选，综合体验稳居一线水准。');
      }
    } else {
      score += 8;
    }
  }

  // 3. 动手能力 (+20)
  const skillChoice = answers.skill ?? 'A';
  if (skillChoice === 'A') {
    if (CLI_AND_COMPLEX_OSS_IDS.has(tool.id)) {
      score -= 26;
    } else if (TURNKEY_FRIENDLY_IDS.has(tool.id)) {
      score += 20;
      reasons.push('上手门槛极低，无需敲命令行即可开箱即用。');
    } else {
      score += 10;
    }
  } else if (skillChoice === 'B') {
    if (PLUGIN_AND_API_FRIENDLY_IDS.has(tool.id)) {
      score += 20;
      reasons.push('配置清晰可拓展，跟着教程填入 Key 或装好插件即可长久使用。');
    } else if (tool.id === 'gas-town-orchestrator' || tool.id === 'nanobot') {
      score += 4;
    } else {
      score += 13;
    }
  } else {
    // C: 极客玩家
    if (CLI_AND_COMPLEX_OSS_IDS.has(tool.id) || tool.pricingType === '开源免费') {
      score += 20;
      reasons.push('支持开源透明、命令行或本地高度自定义，非常合极客胃口。');
    } else {
      score += 8;
    }
  }

  // 4. 网络使用习惯 (+20)
  const networkChoice = answers.network ?? 'A';
  if (networkChoice === 'A') {
    if (DOMESTIC_DIRECT_IDS.has(tool.id)) {
      score += 20;
      reasons.push('支持国内直连或纯本地电脑运行，无需折腾复杂网络即可稳定访问。');
    } else if (OVERSEAS_CLOUD_RESTRICTED_IDS.has(tool.id)) {
      score -= 16;
    } else {
      score += 9;
    }
  } else {
    score += tool.featured ? 20 : 17;
  }

  // 5. 工作方式 (+15)
  const workModeChoice = answers.workMode ?? 'A';
  if (workModeChoice === 'A') {
    if (WEB_FIRST_IDS.has(tool.id)) {
      score += 15;
      reasons.push('打开浏览器就能随时运行，不占本机算力与内存。');
    } else if (tool.category === 'desktop-agents') {
      score += 4;
    } else {
      score += 7;
    }
  } else if (workModeChoice === 'B') {
    if (tool.category === 'desktop-agents' || DESKTOP_APP_IDS.has(tool.id)) {
      score += 15;
      reasons.push('具备桌面端或本地文件读写能力，无需频繁复制粘贴。');
    } else {
      score += 5;
    }
  } else {
    if (EMBEDDED_ORCHESTRATION_IDS.has(tool.id)) {
      score += 15;
      reasons.push('可直接嵌入你的编辑器、终端或自动化编排流程，长线效率提升明显。');
    } else {
      score += 5;
    }
  }

  // 轻微精选加权用于打破同分（+2）
  if (tool.featured) {
    score += 2;
  }

  // 若推荐理由少于 2 条，补充默认亮点
  if (reasons.length === 0) {
    reasons.push(tool.tagline);
  }

  return { score, reasons: reasons.slice(0, 3) };
}

export function computeToolMatches(
  tools: NavTool[],
  answers: MatcherAnswers
): MatchedToolResult[] {
  const scored = tools.map((tool) => {
    const { score, reasons } = scoreTool(tool, answers);
    // 理论满分 132 (50+25+20+20+15+2)，映射到 62%~99% 直观区间
    const matchPercent = Math.max(60, Math.min(99, Math.round((score / 132) * 100)));
    return {
      tool,
      score,
      matchPercent,
      reasons,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (Boolean(b.tool.featured) !== Boolean(a.tool.featured)) {
      return b.tool.featured ? 1 : -1;
    }
    return a.tool.name.localeCompare(b.tool.name, 'zh-CN');
  });

  return scored;
}
