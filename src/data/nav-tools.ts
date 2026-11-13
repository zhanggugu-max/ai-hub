export type NavToolCategory = 'coding' | 'workflow' | 'api-compute' | 'research';

export type NavToolPricing = '开源免费' | '有免费额度' | '按量付费' | '订阅制';

export interface NavTool {
  id: string;
  name: string;
  category: NavToolCategory;
  tagline: string;
  badges: string[];
  pricingType: NavToolPricing;
  searchKeyword: string;
  resourceSlug?: string;
  officialUrl: string;
  affiliateUrl?: string;
  featured?: boolean;
}

export interface NavCategoryMeta {
  value: NavToolCategory;
  label: string;
  intro: string;
}

export const NAV_CATEGORIES: NavCategoryMeta[] = [
  {
    value: 'coding',
    label: 'AI 编程全栈流',
    intro: '覆盖命令行 Agent、IDE 插件、原生编辑器与桌面端知识库，帮你选到顺手的写代码主力。',
  },
  {
    value: 'workflow',
    label: '工作流与私有部署',
    intro: '打通自动化工作流编排、RAG 知识库与本机离线推理，适合快速搭业务流或企业内网落地。',
  },
  {
    value: 'api-compute',
    label: '模型与算力底座',
    intro: '汇聚多模型聚合网关、高性价比国内推理平台与原厂直连通道，兼顾稳定性与成本控制。',
  },
  {
    value: 'research',
    label: '科研与深度检索',
    intro: '聚焦实时溯源搜索、长文档精读与每日论文追踪，让技术调研与文献阅读少走弯路。',
  },
];

export const NAV_TOOLS: NavTool[] = [
  // 1. AI 编程全栈流 (coding)
  {
    id: 'claude-code',
    name: 'Claude Code',
    category: 'coding',
    tagline: '终端原生自主编程 Agent，擅长大型代码库跨文件重构、排错与自动化提交。',
    badges: ['终端原生', 'Agent 执行', '闭源商用'],
    pricingType: '按量付费',
    searchKeyword: 'Claude Code',
    resourceSlug: 'tool-claude-code',
    officialUrl: 'https://docs.anthropic.com/en/docs/claude-code',
    featured: true,
  },
  {
    id: 'cline-roo-code',
    name: 'Cline & Roo Code',
    category: 'coding',
    tagline: 'VS Code 开源编程插件，支持自带 API Key、本地模型与多角色协作接入。',
    badges: ['VS Code 插件', '开源透明', '可接本地模型'],
    pricingType: '开源免费',
    searchKeyword: 'Cline',
    resourceSlug: 'tool-cline-roo',
    officialUrl: 'https://github.com/cline/cline',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding',
    tagline: 'AI 原生代码编辑器，Tab 预测补全与多文件协同修改体验目前最为成熟。',
    badges: ['AI IDE', '全库索引', '开箱即用'],
    pricingType: '有免费额度',
    searchKeyword: 'Cursor',
    resourceSlug: 'tool-01',
    officialUrl: 'https://www.cursor.com/',
  },
  {
    id: 'cherry-studio',
    name: 'Cherry Studio',
    category: 'coding',
    tagline: '高颜值开源桌面客户端，一站聚合多模型接口、本地 RAG 知识库与 MCP 工具。',
    badges: ['桌面客户端', '多模型聚合', '支持 MCP'],
    pricingType: '开源免费',
    searchKeyword: 'Cherry Studio',
    resourceSlug: 'tool-cherry-studio',
    officialUrl: 'https://cherry-ai.com/',
  },

  // 2. 工作流编排与私有部署 (workflow)
  {
    id: 'dify',
    name: 'Dify',
    category: 'workflow',
    tagline: '开源 LLM 应用开发平台，内置 RAG 知识库与可视化编排，企业私有部署首选。',
    badges: ['开源可私有部署', '可视化编排', '内置 RAG'],
    pricingType: '开源免费',
    searchKeyword: 'Dify',
    resourceSlug: 'tool-02',
    officialUrl: 'https://dify.ai/',
    featured: true,
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'workflow',
    tagline: '节点式自动化工作流神器，支持本地 Docker 部署与 400+ 常见应用无缝联动。',
    badges: ['开源可自托管', '节点自动化', '400+ 集成'],
    pricingType: '开源免费',
    searchKeyword: 'n8n',
    resourceSlug: 'tool-05',
    officialUrl: 'https://n8n.io/',
  },
  {
    id: 'coze',
    name: 'Coze（扣子）',
    category: 'workflow',
    tagline: '零代码 Bot 搭建平台，官方插件生态丰富，适合快速发布到飞书、微信等渠道。',
    badges: ['零代码编排', '插件丰富', '多渠道发布'],
    pricingType: '有免费额度',
    searchKeyword: 'Coze',
    resourceSlug: 'tool-coze-dify-bot',
    officialUrl: 'https://www.coze.cn/',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    category: 'workflow',
    tagline: '本地大模型运行底座，一行命令即可在个人电脑与内网快速拉起开源模型。',
    badges: ['本地离线运行', 'OpenAI 兼容', '跨平台 CLI'],
    pricingType: '开源免费',
    searchKeyword: 'Ollama',
    resourceSlug: 'tool-06',
    officialUrl: 'https://ollama.com/',
  },

  // 3. 模型调用与算力底座 (api-compute)
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'api-compute',
    tagline: '海外最全聚合 API 网关，一套接口统一调用全球主流模型并实时透明比价。',
    badges: ['多模型聚合', '统一接口', '按需比价'],
    pricingType: '按量付费',
    searchKeyword: 'OpenRouter',
    resourceSlug: 'tool-openrouter',
    officialUrl: 'https://openrouter.ai/',
    featured: true,
  },
  {
    id: 'siliconflow',
    name: '硅基流动（SiliconFlow）',
    category: 'api-compute',
    tagline: '国内高速开源模型推理平台，支持直连调用主流开源权重且注册即送免费额度。',
    badges: ['国内直连', '开源权重托管', '低延迟推理'],
    pricingType: '有免费额度',
    searchKeyword: 'DeepSeek',
    officialUrl: 'https://cloud.siliconflow.cn/',
  },
  {
    id: 'deepseek-platform',
    name: 'DeepSeek 开放平台',
    category: 'api-compute',
    tagline: '高性价比推理与编码官方接口，支持上下文硬盘缓存，显著降低长对话账单。',
    badges: ['上下文缓存', '官方直连', '高性价比'],
    pricingType: '按量付费',
    searchKeyword: 'DeepSeek',
    resourceSlug: 'model-deepseek-v4',
    officialUrl: 'https://platform.deepseek.com/',
  },
  {
    id: 'official-frontier-apis',
    name: 'Anthropic / OpenAI 官方接口',
    category: 'api-compute',
    tagline: '面向对接口稳定性、最新旗舰特性及高并发 SLA 有严格要求的生产级业务场景。',
    badges: ['原厂旗舰模型', '生产级 SLA', 'Batch 批处理'],
    pricingType: '按量付费',
    searchKeyword: 'Claude',
    resourceSlug: 'model-claude-series',
    officialUrl: 'https://platform.claude.com/',
  },

  // 4. 科研与深度检索 (research)
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'research',
    tagline: '自带实时联网与可点击信源引用的 AI 搜索引擎，适合技术调研与事实核验。',
    badges: ['实时联网', '信源可溯', 'Deep Research'],
    pricingType: '有免费额度',
    searchKeyword: 'Perplexity',
    resourceSlug: 'tool-04',
    officialUrl: 'https://www.perplexity.ai/',
    featured: true,
  },
  {
    id: 'kimi-research',
    name: 'Kimi 深度研究',
    category: 'research',
    tagline: '兼顾超长上下文文档解析与多步推理检索，适合啃透大型研报与长篇技术白皮书。',
    badges: ['长文档解析', '多步检索', '中文友好'],
    pricingType: '有免费额度',
    searchKeyword: 'Kimi',
    resourceSlug: 'model-glm-kimi',
    officialUrl: 'https://kimi.moonshot.cn/',
  },
  {
    id: 'zotero-ai',
    name: 'Zotero + AI 插件工作流',
    category: 'research',
    tagline: '开源文献管理与大模型辅助结合，一键批量完成本地 PDF 文献总结与专业翻译。',
    badges: ['学术文献库', 'PDF 精读', '本地可控'],
    pricingType: '开源免费',
    searchKeyword: '论文',
    officialUrl: 'https://www.zotero.org/',
  },
  {
    id: 'arxiv-daily',
    name: 'arXiv Daily 精选管线',
    category: 'research',
    tagline: '联动本站每日同步的最新 AI 论文中文速览与结构化精读模板，紧跟前沿研究。',
    badges: ['每日论文追踪', '中文速览', '站内直达'],
    pricingType: '开源免费',
    searchKeyword: 'arXiv',
    resourceSlug: 'prompt-paper-reader',
    officialUrl: 'https://huggingface.co/papers',
  },
];
