import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.SUPABASE_URL?.trim() || undefined;
const rawNextPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
const supabaseUrl = rawSupabaseUrl ?? rawNextPublicUrl;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 缺少必要的 Supabase 环境变量（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

type ResourceType = 'tool' | 'model' | 'tutorial' | 'paper' | 'prompt';

interface ResourceSeedRow {
  slug: string;
  type: ResourceType;
  title: string;
  original_title: string | null;
  description: string;
  content: string;
  tags: string[];
  source: string;
  author: string;
  published_at: string;
  updated_at: string;
  url: string;
  favorite_count: number;
  credibility_label: string;
  is_mock_data: boolean;
  status: 'published';
  link_status: 'ok';
}

interface HfDailyPaperRaw {
  publishedAt?: string;
  title?: string;
  summary?: string;
  paper?: {
    id?: string;
    title?: string;
    summary?: string;
    ai_summary?: string;
    ai_keywords?: string[];
    publishedAt?: string;
    upvotes?: number;
    projectPage?: string;
    githubRepo?: string;
    authors?: { name?: string }[];
    organization?: { fullname?: string; name?: string };
  };
}

const HF_DAILY_PAPERS_MIRRORS = [
  'https://huggingface.co/api/daily_papers?limit=25',
  'https://hf-mirror.com/api/daily_papers?limit=25',
];

const CURATED_RESOURCES: Omit<ResourceSeedRow, 'is_mock_data' | 'status' | 'link_status' | 'updated_at'>[] = [
  {
    slug: 'tool-claude-code',
    type: 'tool',
    title: 'Claude Code 终端原生 AI 编程 Agent 实战工作流',
    original_title: 'Claude Code - Agentic Coding in Your Terminal',
    description:
      '直接在终端理解整个代码仓库上下文，支持跨文件重构、测试自动修复、Git 提交与 MCP 外部工具挂载。',
    tags: ['代码助手', 'Agent', '工程实践'],
    source: 'Anthropic 官方文档',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-12T09:00:00+08:00',
    url: 'https://docs.anthropic.com/en/docs/claude-code',
    favorite_count: 642,
    credibility_label: '官方一手',
    content: `## Claude Code 核心能力与工程实践

**Claude Code** 运行在开发者本地终端中，直接拥有代码检索、文件读写、Shell 命令执行与测试回归闭环能力，特别适合大型仓库跨模块改造。

### 推荐配置 \`CLAUDE.md\` 仓库记忆

在仓库根目录维护精简清晰的 \`CLAUDE.md\`，写入构建命令、测试命令与代码风格禁忌：

\`\`\`markdown
## Build & Test
- Typecheck: \`npx tsc --noEmit\`
- Lint: \`npm run lint\`
- Build: \`npm run build\`

## Conventions
- All server data loaders must handle network failures gracefully.
\`\`\`

### 高效协作习惯

1. **先规划后落盘**：复杂功能先要求列出涉及文件与测试边界，确认后再自动修改。
2. **用单测/构建兜底**：每次改动结束后让 Agent 自动跑完类型检查与单元测试再收尾。`,
  },
  {
    slug: 'tool-langgraph',
    type: 'tool',
    title: 'LangGraph 有状态多智能体与长程工作流编排指南',
    original_title: 'LangGraph - Stateful Multi-Agent Workflows',
    description:
      '基于有向循环图（DAG + Cycles）管理 Agent 状态机、断点持久化（Checkpointer）与人工审批中断恢复。',
    tags: ['Agent', '开源项目', '工作流'],
    source: 'LangChain 官方文档',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-11T16:00:00+08:00',
    url: 'https://langchain-ai.github.io/langgraph/',
    favorite_count: 518,
    credibility_label: '开源仓库',
    content: `## 为什么生产 Agent 需要状态图（StateGraph）

传统单循环 ReAct Agent 在超过 8–10 步后极易发生目标漂移或无限重试。**LangGraph** 通过显式节点（Node）、条件边（Conditional Edge）和状态归约器（Reducer）把工作流变成可追踪、可回放的状态机。

### 核心工程特性

| 特性 | 说明 | 典型用途 |
| :--- | :--- | :--- |
| **Checkpointer** | 自动持久化每一步状态快照 | 服务重启后从中断点续跑长任务 |
| **Human-in-the-loop** | \`interrupt()\` 挂起执行等待人类确认 | 支付、删库、发邮件前的人工审批 |
| **Subgraphs** | 隔离每个子 Agent 的私有状态 | 多角色审查、研究与编码解耦 |`,
  },
  {
    slug: 'tool-vllm',
    type: 'tool',
    title: 'vLLM 高吞吐大模型推理部署：PagedAttention 与张量并行实战',
    original_title: 'vLLM - High-Throughput LLM Serving Engine',
    description:
      '开源生产级推理服务引擎，通过 PagedAttention 与 Continuous Batching 成倍提升 GPU 利用率并原生兼容 OpenAI API。',
    tags: ['开源模型', '私有化部署', '推理加速'],
    source: 'GitHub',
    author: 'vLLM Team',
    published_at: '2026-11-10T11:30:00+08:00',
    url: 'https://docs.vllm.ai',
    favorite_count: 590,
    credibility_label: '开源仓库',
    content: `## vLLM 快速上线与吞吐调优

**vLLM** 是开源模型私有化部署的事实标准引擎，提供开箱即用的 \`OpenAI Compatible Server\`。

### 生产启动示例

\`\`\`bash
vllm serve deepseek-ai/DeepSeek-R1-Distill-Qwen-32B \\
  --tensor-parallel-size 2 \\
  --max-model-len 32768 \\
  --enable-prefix-caching \\
  --gpu-memory-utilization 0.92
\`\`\`

### 关键调优参数

- **\`--enable-prefix-caching\`**：多轮对话和长 System Prompt 场景必开，命中共享前缀 KV-Cache 可大幅压低 TTFT。
- **\`--quantization fp8\`**：H100 / L40S 等 Ada/Hopper 架构显卡建议启用 FP8，几乎无损前提下显存需求减半。`,
  },
  {
    slug: 'tool-sglang',
    type: 'tool',
    title: 'SGLang 高性能推理与 RadixAttention 前缀复用实践',
    original_title: 'SGLang - Fast Serving Framework for LLMs and VLMs',
    description:
      '针对多轮 Agent、JSON 结构化生成与 DeepSeek/Qwen MoE 架构深度优化的开源推理后端，支持零开销 FSM 约束解码。',
    tags: ['开源模型', '私有化部署', '推理加速'],
    source: 'GitHub',
    author: 'LMSYS / SGLang',
    published_at: '2026-11-09T14:00:00+08:00',
    url: 'https://docs.sglang.ai',
    favorite_count: 472,
    credibility_label: '开源仓库',
    content: `## SGLang 与 RadixAttention 核心优势

在 Few-shot 提示词、Agent 多分支树搜索（Tree-of-Thought）和 RAG 共享文档场景中，**RadixAttention** 通过基数树自动复用跨请求的公共前缀 KV-Cache，吞吐量表现突出。

### 核心适用场景

1. **DeepSeek V3/V4 与 MoE 大模型**：原生支持 MLA（Multi-head Latent Attention）与 DP/EP 专家并行加速。
2. **严格 JSON Schema 约束输出**：利用压缩有限状态机实现极低开销的结构化输出。`,
  },
  {
    slug: 'tool-mcp',
    type: 'tool',
    title: 'Model Context Protocol (MCP) 开放上下文协议架构与开发指南',
    original_title: 'Model Context Protocol Specification & SDKs',
    description:
      '标准化 AI 模型连接数据库、文件系统、GitHub 与企业内部 API 的开放协议，一次封装即可被各类客户端通用调用。',
    tags: ['Agent', '工程实践', '协议标准'],
    source: '官方文档整理',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-11T10:00:00+08:00',
    url: 'https://modelcontextprotocol.io',
    favorite_count: 615,
    credibility_label: '官方一手',
    content: `## 什么是 MCP（Model Context Protocol）

**MCP** 相当于 AI 应用领域的“USB-C 接口”：将工具调用（Tools）、只读上下文资源（Resources）和可复用提示模板（Prompts）解耦为标准化的 Client-Server 协议。

### 三大核心原语

- **Tools（模型可控动作）**：例如查询数据库、创建 Issue、检索内部工单，由模型决策触发。
- **Resources（应用/用户可控数据）**：类 REST 只读 URI，将日志、配置、文档安全挂载进上下文。
- **Prompts（标准工作流模板）**：预设好参数与最佳实践的交互快捷指令。`,
  },
  {
    slug: 'tool-litellm',
    type: 'tool',
    title: 'LiteLLM 统一大模型网关：多 Key 轮询、降级容灾与成本审计',
    original_title: 'LiteLLM Proxy Server & Unified SDK',
    description:
      '用标准 OpenAI 格式统一调用 100+ 模型供应商（OpenRouter、DeepSeek、Anthropic、Gemini），内置限流与预算告警。',
    tags: ['工程实践', 'API网关', '效率工具'],
    source: 'GitHub',
    author: 'BerriAI / LiteLLM',
    published_at: '2026-11-08T15:00:00+08:00',
    url: 'https://docs.litellm.ai',
    favorite_count: 446,
    credibility_label: '开源仓库',
    content: `## 用 LiteLLM Proxy 消除多供应商接入碎片化

企业或独立项目接入多个大模型 API 时，最头疼的是各自不同的错误码、限流策略和账单统计。**LiteLLM Proxy** 充当统一网关层：

- **自动 Fallback 故障切换**：当主力模型返回 429/503 或超时时自动切换到备用模型/供应商。
- **按项目/用户分配虚拟 Key**：精准统计每个业务线、每位用户的 Token 消耗与美元成本上限。`,
  },
  {
    slug: 'tool-openrouter',
    type: 'tool',
    title: 'OpenRouter 聚合路由实战：多模型基准对比与高可用选型',
    original_title: 'OpenRouter Unified LLM API & Model Rankings',
    description:
      '单个 API Key 即可调度全球 400+ 主流闭源与开源模型，自动在多家算力供应商间实现低延迟容灾路由。',
    tags: ['API网关', '效率工具', '评测基准'],
    source: '官方文档整理',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-12T11:00:00+08:00',
    url: 'https://openrouter.ai/docs',
    favorite_count: 528,
    credibility_label: '站内精选',
    content: `## OpenRouter 工程最佳实践

1. **\`models\` 备选链路由**：在请求体传入 \`models: ["anthropic/claude-opus-4.6", "google/gemini-3.8-flash"]\`，主模型拥堵时无缝回退。
2. **Provider 偏好约束**：对隐私或延迟敏感场景，可通过 \`provider.order\` 与 \`allow_fallbacks\` 锁定指定推理节点。
3. **结合本站榜单选型**：在本站 [AI 模型排行榜](/leaderboard) 可实时对比 OpenRouter 全部在役模型的价格与 LMArena 跑分。`,
  },
  {
    slug: 'tool-browser-use',
    type: 'tool',
    title: 'Browser Use 开源浏览器自动化 Agent：DOM 识别与视觉点击结合',
    original_title: 'browser-use - Make Websites Accessible for AI Agents',
    description:
      '将 Playwright 与多模态大模型结合，自动提取页面可交互元素索引并执行点击、填表、滚动与复杂多步骤网页操作。',
    tags: ['Agent', '开源项目', '自动化'],
    source: 'GitHub',
    author: 'Browser Use Team',
    published_at: '2026-11-06T13:00:00+08:00',
    url: 'https://github.com/browser-use/browser-use',
    favorite_count: 489,
    credibility_label: '开源仓库',
    content: `## Browser Use 工作原理与安全边界

**Browser Use** 不依赖脆弱的硬编码 CSS 选择器，而是为页面上的可交互元素标注编号边界框，再交由视觉-语言模型决策下一步动作。

### 注意事项

- 遇到登录认证、支付页或人机验证码（CAPTCHA）时应设计显式暂停机制交回人工处理。
- 高频重复列表操作可结合脚本化注入以减少大模型往返延迟。`,
  },
  {
    slug: 'tool-crawl4ai',
    type: 'tool',
    title: 'Crawl4AI 开源大模型爬虫：一键提取干净 Markdown 喂给 RAG',
    original_title: 'Crawl4AI - Open-Source LLM-Friendly Web Crawler',
    description:
      '支持异步并发与无头浏览器渲染，自动去除导航栏与广告噪音并输出结构化 Markdown 或 JSON，是 RAG 知识库采集利器。',
    tags: ['RAG', '开源项目', '效率工具'],
    source: 'GitHub',
    author: 'Crawl4AI Community',
    published_at: '2026-11-05T18:00:00+08:00',
    url: 'https://github.com/unclecode/crawl4ai',
    favorite_count: 432,
    credibility_label: '开源仓库',
    content: `## Crawl4AI 在 RAG 数据管道中的定位

高质量 RAG 的上限取决于输入文档的信噪比。**Crawl4AI** 通过内置启发式正文过滤（PruningContentFilter / BM25ContentFilter）在入库前剔除大量页面冗余 HTML 与页脚噪音，大幅节省 Embedding 与重排成本。`,
  },
  {
    slug: 'tool-vercel-ai-sdk',
    type: 'tool',
    title: 'Vercel AI SDK 全栈流式交互与 React Server Components 实战',
    original_title: 'AI SDK by Vercel - TypeScript Toolkit for AI Apps',
    description:
      '面向 Next.js / TypeScript 的流式生成与工具调用标准开发套件，统一 \`streamText\`、\`generateObject\` 与前端 \`useChat\` 状态管理。',
    tags: ['工程实践', '开源项目', '代码助手'],
    source: 'Vercel 官方文档',
    author: 'Vercel Team',
    published_at: '2026-11-10T10:00:00+08:00',
    url: 'https://ai-sdk.dev',
    favorite_count: 503,
    credibility_label: '官方一手',
    content: `## Vercel AI SDK 核心 API 速览

- **\`streamText\` + \`toUIMessageStreamResponse\`**：零样板代码完成服务端流式输出与多轮 Tool Calling 自动循环。
- **\`generateObject\` + Zod**：强类型校验大模型输出结构，直接得到带 TypeScript 类型推断的对象结果。
- **切换模型只需改一行**：配合 \`@ai-sdk/openai\`、\`@ai-sdk/anthropic\`、\`@ai-sdk/google\` 或 OpenRouter Provider 无缝切换底层模型。`,
  },
  {
    slug: 'model-deepseek-v4',
    type: 'model',
    title: 'DeepSeek V4 / V4.1 Flash 系列解析：长上下文代码与高性价比推理实战',
    original_title: 'DeepSeek V4 & V4.1 Flash Technical Overview',
    description:
      '梳理 DeepSeek V4 Pro、V4.1 Flash 与 V3.2 在 LMArena 与代码基准中的表现定位，以及高并发生产场景的 API 路由建议。',
    tags: ['开源模型', '代码助手', '评测基准'],
    source: '官方技术文档',
    author: 'AI 智搜评测组',
    published_at: '2026-11-12T15:00:00+08:00',
    url: 'https://api-docs.deepseek.com',
    favorite_count: 685,
    credibility_label: '站内精选',
    content: `## DeepSeek V4 / V4.1 系列实测定位

结合 LMArena 官方盲测数据与 OpenRouter 线上定价，DeepSeek 系列在开源模型阵营与 API 性价比维度保持强势竞争力：

| 型号定位 | 适用场景 | 核心优势 |
| :--- | :--- | :--- |
| **DeepSeek V4.1 Flash** | 通用高并发对话、代码生成、轻量 Agent | 开源 Top 10 梯队，代码与数学表现突出且延迟极低 |
| **DeepSeek V4 Pro** | 复杂架构推理、长文档综合分析 | 推理稳定性强，适合对准确度要求更高的主力任务 |
| **DeepSeek V3.2 / R1** | 私有化微调、超低成本批处理 | 生态工具链成熟，vLLM / SGLang / Ollama 开箱支持 |

> 完整实时分数与美元单价可在 [开源大模型榜](/leaderboard?category=open_source) 查看最新数据。`,
  },
  {
    slug: 'model-qwen3-series',
    type: 'model',
    title: 'Qwen3.8 / Qwen3.5 开源与旗舰家族选型手册（从 27B 到 2.4T MoE）',
    original_title: 'Qwen3.8 & Qwen3.5 Model Family Selection Guide',
    description:
      '全面对比 Qwen3.8 Max、Qwen3.7 Max、Qwen3.5 397B A17B 与 Qwen3.8 27B 的推理能力、中文理解与私有化显存需求。',
    tags: ['开源模型', '私有化部署', '中文优化'],
    source: 'Qwen 官方博客',
    author: 'AI 智搜评测组',
    published_at: '2026-11-12T12:00:00+08:00',
    url: 'https://qwenlm.github.io',
    favorite_count: 574,
    credibility_label: '官方一手',
    content: `## Qwen3.x 家族分层选型建议

1. **云端旗舰（Qwen3.8 Max / Qwen3.7 Max）**：在 LMArena 中文、代码与数学维度均处于第一梯队，适合复杂中文文档生成、RAG 精答与多工具编排。
2. **旗舰开源 MoE（Qwen3.5 397B A17B）**：激活参数仅 17B 即可发挥接近旗舰闭源模型的能力，吞吐成本远低于同体量稠密模型。
3. **中等显存主力（Qwen3.8 27B）**：单机多卡或高配工作站即可部署，兼具较强代码能力与高中文指令遵循度。`,
  },
  {
    slug: 'model-gemini-4-series',
    type: 'model',
    title: 'Gemini 4 Carbon / Argon 与 3.8 Flash 多模态选型与百万上下文指南',
    original_title: 'Gemini 4 & Gemini 3.8 Flash Developer Guide',
    description:
      '对比 Gemini 4 Carbon、Argon 与 Gemini 3.8 Flash 在 LMArena 综合/代码/数学的统治力表现及原生音视频理解实践。',
    tags: ['多模态', '评测基准', '长上下文'],
    source: 'Google AI 官方文档',
    author: 'AI 智搜评测组',
    published_at: '2026-11-12T18:00:00+08:00',
    url: 'https://ai.google.dev/gemini-api/docs',
    favorite_count: 602,
    credibility_label: '官方一手',
    content: `## Gemini 4 与 Flash 系列应用分工

- **Gemini 4 Carbon / Argon**：LMArena 综合、代码与数学榜前排主力，适合高难度工程架构设计、跨模态长视频/PDF 深度解析与复杂推理任务。
- **Gemini 3.8 Flash / 3.7 Flash**：兼具极快响应速度与 1M+ 上下文窗口，适合作为 Agent 路由节点、前端实时交互及大规模文档索引预处理。`,
  },
  {
    slug: 'tutorial-prompt-caching',
    type: 'tutorial',
    title: 'Prompt Caching（提示词缓存）实战：把长上下文 API 费用降到 1/10',
    original_title: 'Prompt Caching Cost & Latency Optimization',
    description:
      '详解系统指令、工具定义与共享知识前缀的缓存命中条件与排布顺序，大幅削减多轮对话与 Agent 重复 Token 计费。',
    tags: ['工程实践', '推理加速', '成本优化'],
    source: '站内原创教程',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-11T20:00:00+08:00',
    url: '/resources/tutorial-prompt-caching',
    favorite_count: 549,
    credibility_label: '站内精选',
    content: `## Prompt Caching 核心原则：固定前缀放最前

几乎所有主流厂商（Anthropic、OpenAI、Google、DeepSeek、OpenRouter）的缓存机制都严格依赖**完全匹配的前缀（Prefix Matching）**。哪怕前缀第 10 个字符插了一个动态时间戳，后面的数万 Token 缓存都会全部失效！

### 正确的 Messages 排布顺序

\`\`\`text
1. [System Prompt]       -> 静态角色规范与输出格式要求（不变）
2. [Tools Schema]        -> 固定工具定义列表（排序稳定，不要每次随机增删顺序）
3. [Shared Knowledge]    -> 仓库 Map / 核心手册 / Few-shot 示例（不变）
4. [Dynamic Metadata]    -> 当前时间、用户名、会话 ID（放在用户消息末尾或独立尾段！）
5. [Conversation History] -> 多轮增量消息
\`\`\``,
  },
  {
    slug: 'tutorial-llm-router',
    type: 'tutorial',
    title: '大小模型分级路由（Model Routing）架构：省下 70% API 预算的实践路径',
    original_title: 'Cascading & Semantic LLM Routing Architecture',
    description:
      '结合意图分类器与置信度分级，把简单抽取与格式转换交给 Flash 模型，仅将高复杂度推理路由给 Opus/Gemini 旗舰。',
    tags: ['工程实践', '成本优化', 'Agent'],
    source: '站内原创教程',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-10T19:00:00+08:00',
    url: '/resources/tutorial-llm-router',
    favorite_count: 461,
    credibility_label: '站内精选',
    content: `## 三层分级路由设计模板

在真实线上流量中，往往 **70%–80%** 的请求（改写、摘要、分类、简单 SQL、结构化抽取）并不需要动用最昂贵的旗舰模型。

### 推荐流量分配方案

1. **Tier 1（轻量高性价比 Flash，占比 ~75%）**：如 \`DeepSeek V4.1 Flash\`、\`GLM 5.3 Flash\`、\`Gemini 3.8 Flash\`，负责初筛、结构化解析与常规问答。
2. **Tier 2（旗舰主力，占比 ~20%）**：如 \`Claude Opus / Sonnet\`、\`Gemini 4\`、\`Qwen3.8 Max\`，处理多步骤规划、复杂代码生成与跨文件重构。
3. **Tier 3（高推理/兜底升级，占比 ~5%）**：当 Tier 1 输出校验失败或用户点“重新深度思考”时自动升级重试。`,
  },
  {
    slug: 'prompt-sql-optimizer',
    type: 'prompt',
    title: 'PostgreSQL / Supabase 索引优化与 RLS 安全审计提示词',
    original_title: 'PostgreSQL Index & RLS Security Audit Prompt',
    description:
      '输入表结构与慢查询 SQL，自动输出复合索引建议、N+1 查询消除方案以及行级安全策略（RLS）越权漏检排查清单。',
    tags: ['提示词模板', '工程实践', '安全审计'],
    source: '站内提示词库',
    author: 'AI 智搜提示词库',
    published_at: '2026-11-09T11:00:00+08:00',
    url: '/resources/prompt-sql-optimizer',
    favorite_count: 392,
    credibility_label: '站内精选',
    content: `## Supabase / PostgreSQL 性能与安全审查 Prompt

\`\`\`markdown
你是资深 PostgreSQL 与 Supabase 数据库架构师。请基于我提供的建表 DDL、RLS 策略和业务查询语句执行审计：

1. **索引与查询计划审查**：
   - 检查 WHERE / ORDER BY / JOIN 字段是否缺少匹配的复合索引（注意列顺序与选择性）。
   - 指出隐式类型转换或函数包裹导致的索引失效。
2. **Supabase RLS 安全审计**：
   - 核查 \`anon\` 与 \`authenticated\` 角色是否存在未加限制的 SELECT/INSERT/UPDATE/DELETE 漏洞。
   - 检查 RLS 表达式中是否触发了逐行重复子查询，给出用 \`(select auth.uid())\` 缓存优化的写法。
3. **直接可执行的迁移 SQL**：
   - 输出幂等 SQL（包含 \`IF NOT EXISTS\` 或先 \`DROP POLICY IF EXISTS\`）。
\`\`\``,
  },
];

async function fetchHfDailyPapers(): Promise<ResourceSeedRow[]> {
  let rawList: HfDailyPaperRaw[] | null = null;

  for (const endpoint of HF_DAILY_PAPERS_MIRRORS) {
    try {
      const res = await fetch(endpoint, {
        headers: { 'User-Agent': 'ai-hub-resource-sync/1.0' },
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        rawList = (await res.json()) as HfDailyPaperRaw[];
        break;
      }
    } catch {
      // 尝试下一镜像
    }
  }

  if (!Array.isArray(rawList) || rawList.length === 0) {
    console.warn('⚠️ 未能拉取 Hugging Face Daily Papers，本次仅同步站内精选库。');
    return [];
  }

  const nowIso = new Date().toISOString();
  const rows: ResourceSeedRow[] = [];

  for (const item of rawList) {
    const p = item.paper;
    const arxivId = p?.id?.trim();
    const title = (p?.title ?? item.title ?? '').trim();
    const rawSummary = (p?.ai_summary ?? p?.summary ?? item.summary ?? '').replace(/\s+/g, ' ').trim();
    if (!arxivId || !title || !rawSummary) continue;

    const publishedAt = p?.publishedAt ?? item.publishedAt ?? nowIso;
    const authors = (p?.authors ?? [])
      .map((a) => a.name?.trim())
      .filter((n): n is string => Boolean(n));
    const authorText =
      authors.length > 3
        ? `${authors.slice(0, 3).join(', ')} et al.`
        : authors.join(', ') || 'arXiv Authors';

    const keywords = (p?.ai_keywords ?? [])
      .map((k) => k.trim())
      .filter((k) => k.length > 0 && k.length <= 20)
      .slice(0, 3);
    const tags = Array.from(new Set(['论文研报', 'arXiv', ...keywords])).slice(0, 4);

    const shortDesc =
      rawSummary.length > 150 ? `${rawSummary.slice(0, 147)}...` : rawSummary;

    const orgName = p?.organization?.fullname || p?.organization?.name || 'Hugging Face Daily Papers';
    const upvotes = typeof p?.upvotes === 'number' ? p.upvotes : 0;
    const hfUrl = `https://huggingface.co/papers/${arxivId}`;
    const arxivUrl = `https://arxiv.org/abs/${arxivId}`;

    const mdLines = [
      `## 论文概览`,
      '',
      `- **arXiv ID**：\`${arxivId}\``,
      `- **发布机构 / 来源**：${orgName}`,
      `- **作者**：${authorText}`,
      `- **社区热度**：${upvotes} Upvotes`,
      '',
      `### 核心摘要（Abstract / AI Summary）`,
      '',
      rawSummary,
      '',
      `### 原文与相关链接`,
      '',
      `- [Hugging Face Paper 讨论页](${hfUrl})`,
      `- [arXiv 官方论文页面](${arxivUrl})`,
    ];

    if (p?.projectPage) {
      mdLines.push(`- [项目主页 / 演示页面](${p.projectPage})`);
    }
    if (p?.githubRepo) {
      mdLines.push(`- [官方开源代码仓库](${p.githubRepo})`);
    }

    rows.push({
      slug: `hf-paper-${arxivId}`,
      type: 'paper',
      title,
      original_title: title,
      description: shortDesc,
      content: mdLines.join('\n'),
      tags,
      source: 'Hugging Face Daily Papers',
      author: authorText,
      published_at: publishedAt,
      updated_at: nowIso,
      url: hfUrl,
      favorite_count: Math.max(25, upvotes * 8),
      credibility_label: 'arXiv / HF 热榜',
      is_mock_data: false,
      status: 'published',
      link_status: 'ok',
    });
  }

  return rows;
}

async function main() {
  console.log('🚀 开始扩展并同步 AI 资料库（精选工具/模型/教程 + Hugging Face Daily Papers）...');

  const nowIso = new Date().toISOString();
  const curatedRows: ResourceSeedRow[] = CURATED_RESOURCES.map((item) => ({
    ...item,
    updated_at: nowIso,
    is_mock_data: false,
    status: 'published',
    link_status: 'ok',
  }));

  const paperRows = await fetchHfDailyPapers();
  const allRows = [...curatedRows, ...paperRows];

  const { error } = await supabase
    .from('ai_resources')
    .upsert(allRows, { onConflict: 'slug' });

  if (error) {
    throw new Error(`写入 ai_resources 失败: ${error.message}`);
  }

  const { count, error: countErr } = await supabase
    .from('ai_resources')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');

  if (countErr) {
    console.warn('⚠️ 统计总数失败:', countErr.message);
  }

  console.log(
    `✅ 资料同步完成：本次写入精选资料 ${curatedRows.length} 条 + HF Daily Papers ${paperRows.length} 条，线上已发布总计 ${count ?? allRows.length} 篇文章与工具！`
  );
}

main().catch((err) => {
  console.error('❌ 资料同步失败:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
