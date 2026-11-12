/** 资料分类（对应搜索页 Type 筛选） */
export type SearchItemType = 'tool' | 'model' | 'tutorial' | 'paper' | 'prompt';

/** 发布时间筛选范围 */
export type SearchTimeRange = 'all' | '7d' | '30d' | '90d';

/** 排序维度 */
export type SearchSortKey = 'relevance' | 'latest' | 'popular';

/** 统一 AI 资料条目接口 */
export interface SearchItem {
  id: string;
  type: SearchItemType;
  title: string;
  originalTitle?: string;
  description: string;
  content?: string;
  tags: string[];
  source: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  url: string;
  favoriteCount: number;
  credibilityLabel: string;
  isFavorited: boolean;
  isMockData: boolean;
}

/** 搜索页多维筛选状态（与 URL Query 双向同步） */
export interface SearchFilterState {
  q: string;
  type: 'all' | SearchItemType;
  tags: string[];
  source: string;
  timeRange: SearchTimeRange;
  sort: SearchSortKey;
}

export const SEARCH_TYPE_META: {
  value: 'all' | SearchItemType;
  label: string;
}[] = [
  { value: 'all', label: '全部资料' },
  { value: 'tool', label: 'AI 工具' },
  { value: 'model', label: 'AI 模型' },
  { value: 'tutorial', label: '实战教程' },
  { value: 'paper', label: '前沿论文' },
  { value: 'prompt', label: '提示词' },
];

export const HOT_SEARCH_TAGS: string[] = [
  'Agent',
  'RAG',
  '开源模型',
  '代码助手',
  '提示词工程',
  '多模态',
  '推理优化',
  '评测基准',
];

/**
 * ============================================================================
 * 后续数据源替换点（Mock -> Supabase PostgreSQL / Meilisearch）
 * ============================================================================
 * 1. 当前共 17 条覆盖 5 大分类的 Mock 数据（含 6 条 AI 工具，isMockData: true），仅作前端检索、筛选与 UI 联调。
 * 2. 严禁存储第三方全文内容，仅索引标题、自编中文摘要、元数据与原文外链。
 * 3. 上线时在 src/lib/search/data-loader.ts（或带 IP 限流的 /api/search）替换数据源。
 * ============================================================================
 */
export const MOCK_SEARCH_ITEMS: SearchItem[] = [
  {
    id: 'tool-01',
    type: 'tool',
    title: 'Cursor AI 代码编辑器实战与 Project Rules 配置指南（Mock）',
    originalTitle: 'Cursor - The AI Code Editor',
    description:
      '聚焦全仓库上下文索引、多文件协同重构与 .cursorrules 工程规范编写，帮助开发者建立可复用的 AI 编程工作流。',
    tags: ['代码助手', 'Agent', '工程实践'],
    source: '官方文档整理',
    author: 'AI 智搜编辑部',
    publishedAt: '2026-11-10T10:00:00+08:00',
    updatedAt: '2026-11-12T09:00:00+08:00',
    url: 'https://example.com/tools/cursor-rules-guide',
    favoriteCount: 512,
    credibilityLabel: '站内精选',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'tool-02',
    type: 'tool',
    title: 'Dify 开源 LLM 应用编排平台：可视化工作流与 RAG 接入（Mock）',
    originalTitle: 'Dify Open Source LLM App Development Platform',
    description:
      '支持拖拽式 Agent 编排、知识库分段调优、多模型网关切换与 API 一键发布，适合快速搭建企业内部 AI 助手原型。',
    tags: ['Agent', 'RAG', '开源项目'],
    source: 'GitHub',
    author: 'Dify Community',
    publishedAt: '2026-11-04T15:30:00+08:00',
    updatedAt: '2026-11-11T14:20:00+08:00',
    url: 'https://example.com/tools/dify-workflow',
    favoriteCount: 438,
    credibilityLabel: '开源仓库',
    isFavorited: true,
    isMockData: true,
  },
  {
    id: 'tool-03',
    type: 'tool',
    title: 'NotebookLM 多源文档研读与播客摘要生成上手（Mock）',
    originalTitle: 'NotebookLM Research Assistant',
    description:
      '上传论文 PDF、会议记录或公开网页后自动建立基于引用出处的问答笔记，适合产品经理与研究团队快速消化长文档。',
    tags: ['多模态', '效率工具', '知识库'],
    source: '官方产品博客',
    author: 'AI 智搜评测组',
    publishedAt: '2026-10-18T09:00:00+08:00',
    updatedAt: '2026-11-08T18:00:00+08:00',
    url: 'https://example.com/tools/notebooklm-guide',
    favoriteCount: 367,
    credibilityLabel: '官方一手',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'tool-04',
    type: 'tool',
    title: 'Perplexity 深度研究模式（Deep Research）检索技巧与引用核验（Mock）',
    originalTitle: 'Perplexity Deep Research Workflow',
    description:
      '面向市场调研与技术预研场景，通过结构化追问、限定权威域名与交叉核验引用源提升 AI 搜索准确率。',
    tags: ['效率工具', 'RAG', '评测基准'],
    source: '官方文档整理',
    author: 'AI 智搜编辑部',
    publishedAt: '2026-11-05T10:30:00+08:00',
    updatedAt: '2026-11-11T11:00:00+08:00',
    url: 'https://example.com/tools/perplexity-deep-research',
    favoriteCount: 389,
    credibilityLabel: '站内精选',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'tool-05',
    type: 'tool',
    title: 'n8n + LLM 自动化工作流搭建：邮件摘要与飞书/Slack 推送（Mock）',
    originalTitle: 'n8n AI Agent Workflow Automation',
    description:
      '支持自托管的可视化节点编排工具，可结合定时触发器、Webhook 与大模型节点实现零代码日常信息自动化汇总。',
    tags: ['Agent', '开源项目', '效率工具'],
    source: 'GitHub',
    author: 'n8n Community',
    publishedAt: '2026-10-27T16:00:00+08:00',
    updatedAt: '2026-11-10T14:00:00+08:00',
    url: 'https://example.com/tools/n8n-ai-automation',
    favoriteCount: 415,
    credibilityLabel: '开源仓库',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'tool-06',
    type: 'tool',
    title: 'Ollama 本地大模型一键部署与 OpenAI 兼容接口调试（Mock）',
    originalTitle: 'Ollama Local LLM Runner',
    description:
      '几行命令即可在 Windows/macOS/Linux 本地拉取并运行量化开源模型，提供标准 REST 接口方便离线开发测试。',
    tags: ['开源模型', '私有化部署', '代码助手'],
    source: 'GitHub',
    author: 'Ollama Team',
    publishedAt: '2026-11-02T09:15:00+08:00',
    updatedAt: '2026-11-12T07:00:00+08:00',
    url: 'https://example.com/tools/ollama-local-setup',
    favoriteCount: 534,
    credibilityLabel: '开源仓库',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'model-01',
    type: 'model',
    title: 'Open-Coder-R2-72B 开源编程与推理模型技术卡片（Mock）',
    originalTitle: 'Open-Coder-R2-72B Technical Card',
    description:
      '采用 MIT 协议开源权重，支持 128K 上下文窗口与仓库级代码补全，在单元测试生成与 Bug 修复场景表现突出。',
    tags: ['开源模型', '代码助手', '推理优化'],
    source: 'Hugging Face',
    author: 'OpenStudio Team',
    publishedAt: '2026-11-09T11:00:00+08:00',
    updatedAt: '2026-11-12T08:00:00+08:00',
    url: 'https://example.com/models/open-coder-r2',
    favoriteCount: 489,
    credibilityLabel: '一手模型卡',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'model-02',
    type: 'model',
    title: 'Swift-Flash-3.0 低延迟高性价比多模态模型概览（Mock）',
    originalTitle: 'Swift-Flash-3.0 Model Overview',
    description:
      '面向高并发 Agent 与实时语音/文档解析场景优化，支持百万级上下文与低输入单价，适合生产环境大规模调用。',
    tags: ['多模态', '推理优化', '评测基准'],
    source: '官方发布说明',
    author: 'Lab Alpha',
    publishedAt: '2026-11-06T08:30:00+08:00',
    updatedAt: '2026-11-12T08:00:00+08:00',
    url: 'https://example.com/models/swift-flash-3',
    favoriteCount: 394,
    credibilityLabel: '官方一手',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'model-03',
    type: 'model',
    title: 'Mini-Edge-14B 消费级显卡可部署轻量推理模型（Mock）',
    originalTitle: 'Mini-Edge-14B Quantized Edge Model',
    description:
      'Apache-2.0 协议开源，INT4 量化后可在单张消费级显卡流畅运行，兼顾结构化 JSON 输出与基础代码任务。',
    tags: ['开源模型', '推理优化', '私有化部署'],
    source: 'Hugging Face',
    author: 'OpenStudio Team',
    publishedAt: '2026-09-25T16:00:00+08:00',
    updatedAt: '2026-11-01T10:00:00+08:00',
    url: 'https://example.com/models/mini-edge-14b',
    favoriteCount: 276,
    credibilityLabel: '一手模型卡',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'tutorial-01',
    type: 'tutorial',
    title: '生产级混合检索 RAG 架构实战：BM25 + 向量 + 重排（Mock）',
    originalTitle: 'Production Hybrid RAG Architecture Guide',
    description:
      '系统讲解文档解析、父子分段策略、双路召回权重调优、Reranker 精排及引用高亮防幻觉的完整工程落地清单。',
    tags: ['RAG', '知识库', '工程实践'],
    source: '社区精选教程',
    author: '陈工 AI 笔记',
    publishedAt: '2026-11-07T12:00:00+08:00',
    updatedAt: '2026-11-11T17:10:00+08:00',
    url: 'https://example.com/tutorials/hybrid-rag-guide',
    favoriteCount: 625,
    credibilityLabel: '实战教程',
    isFavorited: true,
    isMockData: true,
  },
  {
    id: 'tutorial-02',
    type: 'tutorial',
    title: 'Agent 工具调用（Function Calling）容错与重试设计模式（Mock）',
    originalTitle: 'Reliable Tool Calling Patterns for Agents',
    description:
      '总结 Schema 严格校验、参数幻觉拦截、幂等性保护、超时降级与人类审批断点（Human-in-the-loop）的后端最佳实践。',
    tags: ['Agent', '工程实践', '提示词工程'],
    source: 'GitHub',
    author: 'AgentPatterns OSS',
    publishedAt: '2026-10-22T14:00:00+08:00',
    updatedAt: '2026-11-05T09:40:00+08:00',
    url: 'https://example.com/tutorials/agent-tool-calling',
    favoriteCount: 342,
    credibilityLabel: '开源文档',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'tutorial-03',
    type: 'tutorial',
    title: '大模型选型评估方法论：如何用业务黄金集测准真实准确率（Mock）',
    originalTitle: 'Building Golden Evaluation Sets for LLM Selection',
    description:
      '教产品与研发团队构建 100 条高信噪比业务测试集，对比响应时延、Token 成本与 LLM-as-a-Judge 一致性。',
    tags: ['评测基准', '工程实践', 'RAG'],
    source: '官方产品博客',
    author: 'AI 智搜编辑部',
    publishedAt: '2026-08-19T10:00:00+08:00',
    updatedAt: '2026-10-30T15:00:00+08:00',
    url: 'https://example.com/tutorials/llm-eval-golden-set',
    favoriteCount: 298,
    credibilityLabel: '站内精选',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'paper-01',
    type: 'paper',
    title: '基于共享消息板的并行多智能体协作与上下文隔离研究（Mock）',
    originalTitle: 'Parallel Multi-Agent Collaboration via Shared Message Boards',
    description:
      '提出分片子智能体在分支工作区独立修改并由验证器交叉审查的架构，相比单线程推理显著降低长任务回退率。',
    tags: ['Agent', '评测基准', '推理优化'],
    source: 'arXiv',
    author: 'Li et al.',
    publishedAt: '2026-11-11T00:00:00+08:00',
    updatedAt: '2026-11-12T06:30:00+08:00',
    url: 'https://example.com/papers/arxiv-multi-agent-board',
    favoriteCount: 231,
    credibilityLabel: 'arXiv 元数据',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'paper-02',
    type: 'paper',
    title: '长上下文注意力衰减与 KV-Cache 压缩检索联合优化（Mock）',
    originalTitle: 'Mitigating Lost-in-the-Middle with Sparse KV Retrieval',
    description:
      '针对 128K–1M 超长输入中的关键信息遗漏问题，提出动态块压缩与检索头重加权方法，在多跳问答基准提升明显。',
    tags: ['RAG', '推理优化', '评测基准'],
    source: 'arXiv',
    author: 'Chen & Patel',
    publishedAt: '2026-10-29T00:00:00+08:00',
    updatedAt: '2026-11-04T12:00:00+08:00',
    url: 'https://example.com/papers/arxiv-kv-compression',
    favoriteCount: 184,
    credibilityLabel: 'arXiv 元数据',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'paper-03',
    type: 'paper',
    title: '视觉-语言模型在网页 UI 自动化测试中的精准定位基准（Mock）',
    originalTitle: 'Grounding Multimodal Agents for Web UI Automation',
    description:
      '构建跨分辨率浏览器交互评测集，分析 DOM 树结构与视觉截图双模态融合对点击准确率与防误触的贡献。',
    tags: ['多模态', 'Agent', '评测基准'],
    source: 'arXiv',
    author: 'Wang et al.',
    publishedAt: '2026-09-14T00:00:00+08:00',
    updatedAt: '2026-10-15T09:00:00+08:00',
    url: 'https://example.com/papers/arxiv-ui-grounding',
    favoriteCount: 159,
    credibilityLabel: 'arXiv 元数据',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'prompt-01',
    type: 'prompt',
    title: '全栈安全与架构审查官：PR Diff 自动体检提示词模板（Mock）',
    originalTitle: 'Senior Security & Architecture Reviewer Prompt',
    description:
      '引导模型按“阻塞级安全缺陷 / 重复逻辑与复杂度 / 边界条件遗漏”三段式审查代码变更，杜绝泛泛而谈的建议。',
    tags: ['提示词工程', '代码助手', '工程实践'],
    source: '站内提示词库',
    author: 'AI 智搜提示词库',
    publishedAt: '2026-11-08T18:00:00+08:00',
    updatedAt: '2026-11-12T07:30:00+08:00',
    url: 'https://example.com/prompts/security-code-review',
    favoriteCount: 742,
    credibilityLabel: '原创模板',
    isFavorited: false,
    isMockData: true,
  },
  {
    id: 'prompt-02',
    type: 'prompt',
    title: '产品需求拆解与竞品对比矩阵生成提示词（Mock）',
    originalTitle: 'PRD Breakdown & Competitive Matrix Prompt',
    description:
      '输入一句话产品想法，结构化输出目标用户画像、P0/P1/P2 优先级表格、合规风险点与 MVP 验收标准。',
    tags: ['提示词工程', '效率工具'],
    source: '站内提示词库',
    author: 'AI 智搜提示词库',
    publishedAt: '2026-10-30T11:00:00+08:00',
    updatedAt: '2026-11-09T10:15:00+08:00',
    url: 'https://example.com/prompts/prd-matrix-generator',
    favoriteCount: 586,
    credibilityLabel: '原创模板',
    isFavorited: false,
    isMockData: true,
  },
];
