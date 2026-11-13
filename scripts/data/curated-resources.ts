import { EXTRA_CURATED_RESOURCES } from './curated-prompts-and-tutorials';

export type CuratedResourceType = 'tool' | 'model' | 'tutorial' | 'paper' | 'prompt';

export interface CuratedResourceInput {
  slug: string;
  type: CuratedResourceType;
  title: string;
  original_title: string | null;
  description: string;
  tags: string[];
  source: string;
  author: string;
  published_at: string;
  url: string;
  favorite_count: number;
  credibility_label: string;
  content: string;
}

export const CURATED_RESOURCES: CuratedResourceInput[] = [
  {
    slug: 'tool-grok-workflow',
    type: 'tool',
    title: 'Grok 全家桶实战指南：DeepSearch 实时检索与 xAI API 接入',
    original_title: 'xAI Grok DeepSearch, Think Mode & API Guide',
    description:
      '系统拆解 Grok DeepSearch / DeeperSearch 实时信息检索技巧、Grok 4.20 / 4.7 API 参数调优与多智能体并发调用实战。',
    tags: ['效率工具', 'Agent', '评测基准'],
    source: 'xAI 官方文档整理',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-13T09:00:00+08:00',
    url: 'https://docs.x.ai',
    favorite_count: 720,
    credibility_label: '站内精选',
    content: `## 为什么 Grok 适合实时情报与多智能体协作

与其他大模型主要依赖静态检索索引不同，**Grok** 原生打通了实时社交信号与全网深度搜索（**DeepSearch / DeeperSearch**），在突发性科技事件追踪、开源项目动态核验、多角度舆情比对场景具备独特优势。

### 一、网页端三大核心模式分工

| 模式 | 适用场景 | 提示词建议 |
| :--- | :--- | :--- |
| **标准对话** | 常规代码改写、文案润色、快速概念解释 | 给出明确角色与输出格式约束 |
| **DeepSearch / DeeperSearch** | 竞品动态调研、漏洞通告核查、最新框架版本对比 | 显式要求「列出原始发布日期、来源链接并剔除未经证实的传言」 |
| **Think / Reasoning** | 复杂算法推导、架构权衡分析、长日志根因排查 | 先给出边界条件和错误日志，要求分步验证假设 |

### 二、通过 OpenAI 兼容 SDK 调用 xAI Grok API

\`\`\`typescript
import OpenAI from 'openai';

const grok = new OpenAI({
  baseURL: 'https://api.x.ai/v1',
  apiKey: process.env.XAI_API_KEY,
});

const res = await grok.chat.completions.create({
  model: 'grok-4.20', // 也可通过 OpenRouter 路由调用 x-ai/grok-4.7
  temperature: 0.2,
  messages: [
    { role: 'system', content: '你是技术情报分析助手，输出严格使用 Markdown 表格并标注出处日期。' },
    { role: 'user', content: '对比本周开源推理引擎 vLLM 与 SGLang 的最新性能改进点。' },
  ],
});
\`\`\`

### 三、生产落地避坑清单

1. **防时效幻觉**：做实时搜索时在 System Prompt 中注入当前日期（如 \`Today is YYYY-MM-DD\`），强制要求结论必须引用 30 天内一手源。
2. **Multi-Agent 并发控费**：\`grok-4.20-multi-agent\` 等多代理推理版本耗时与 Token 消耗高于普通档位，建议仅用于终审或高价值研报任务，日常流水线走单模型路由。`,
  },
  {
    slug: 'model-muse-series',
    type: 'model',
    title: 'Meta Muse 系列深度解析：Muse Wonder 与 Muse Spark 1.3 选型与部署手册',
    original_title: 'Meta Muse Wonder & Muse Spark 1.3 Technical Guide',
    description:
      '全面解读 LMArena 榜单前十新锐 Meta Muse Wonder、Muse Spark 1.3 与开源版 Muse Spark Open 的能力边界、代码实测与调用成本。',
    tags: ['开源模型', '评测基准', '代码助手'],
    source: 'Meta AI / LMArena 实测',
    author: 'AI 智搜评测组',
    published_at: '2026-11-13T08:30:00+08:00',
    url: 'https://openrouter.ai/meta',
    favorite_count: 695,
    credibility_label: '站内精选',
    content: `## Meta Muse 家族梯队与实测定位

在 2026 下半年的 LMArena 官方盲测数据中，Meta 全新推出的 **Muse** 系列异军突起，其中 **Muse Wonder** 稳居总榜 Top 5 梯队，**Muse Spark 1.3 / 1.2 / 1.1** 与开源版 **Muse Spark Open** 同样表现抢眼。

### 系列型号横向对比

| 模型型号 | 定位 | 开放协议 | 核心优势场景 |
| :--- | :--- | :--- | :--- |
| **Muse Wonder (Max)** | 旗舰推理/通用主力 | Proprietary | 复杂工程设计、长程代码重构、高难度数学推导 |
| **Muse Spark 1.3** | 均衡高速旗舰 | Proprietary | 综合对话、多轮上下文遵循、全栈开发主力 |
| **Muse Spark Open** | 开源权重先锋版 | Open Weights | 私有化部署、开源社区微调、零外泄内网服务 |

### API 快速接入（OpenRouter）

\`\`\`typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta/muse-wonder', // 或开源轻量高性价比选择 meta/muse-spark-open
    messages: [{ role: 'user', content: '为 Next.js Server Action 设计防重放与限流中间件。' }],
  }),
});
\`\`\`

### 选型建议

- 需要**代码生成极限准确率**且预算充足：优先测试 \`Muse Wonder\` 与 \`Claude Opus / Gemini 4\` 对比黄金测试集。
- 需要**开源可自托管**且希望站在开源榜第一梯队：\`Muse Spark Open\` 与 \`Kimi K3\`、\`GLM 5.3\`、\`DeepSeek V4.1 Flash\` 构成当前开源最强第一阵营。`,
  },
  {
    slug: 'tutorial-ai-bots',
    type: 'tutorial',
    title: '全平台 AI Bot 实战开发指南：Telegram / Discord / 飞书 / 企业微信接入模板',
    original_title: 'Building Production AI Bots for Telegram, Discord & Feishu',
    description:
      '从 Webhook 验签、3 秒超时异步回执、流式消息更新到群聊 @ 唤醒与会话记忆隔离，手把手写出稳定不超时的生产级 AI Bot。',
    tags: ['Agent', '工程实践', '自动化'],
    source: '站内原创教程',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-13T08:00:00+08:00',
    url: '/resources/tutorial-ai-bots',
    favorite_count: 780,
    credibility_label: '站内精选',
    content: `## 开发生产级 AI Bot 最大的 4 个坑

大多数人写 Demo Bot 时直接把大模型 API 同步塞进 Webhook 请求处理器里，一上线就遇到 **平台 3 秒超时重试轰炸**、**一条问题被回复 3 遍**、**群聊上下文串线** 等故障。

### 生产级 Bot 通用架构

\`\`\`text
[IM 平台 Webhook (飞书 / Telegram / Discord / Slack)]
   │ 1. 校验签名 / Token + event_id 幂等去重
   │ 2. 立即返回 HTTP 200 OK（耗时 < 100ms，防平台重试！）
   ▼
[异步任务队列 / 后台 Worker]
   │ 3. 发送占位消息「思考中...」拿到 message_id
   │ 4. 流式请求 LLM（每 600ms 节流 editMessage 更新同一条消息）
   │ 5. 调用工具 / 查询知识库（带超时与异常兜底提示）
   ▼
[按 (platform, chat_id, thread_id) 隔离保存会话历史]
\`\`\`

### Node.js / TypeScript 核心防重与流式节流示例

\`\`\`typescript
const processedEvents = new Set<string>();

export async function handleWebhook(req: Request) {
  const payload = await req.json();
  const eventId = payload.header?.event_id ?? String(payload.update_id);

  // 1. 幂等去重：防止平台超时重发导致 AI 重复回复
  if (processedEvents.has(eventId)) {
    return Response.json({ ok: true, deduplicated: true });
  }
  processedEvents.add(eventId);

  // 2. 立即 ack，异步执行耗时的模型推理
  void processBotReplyAsync(payload).catch((err) => {
    console.error('Bot async worker error:', err);
  });

  return Response.json({ ok: true });
}
\`\`\`

### 各平台差异与必调参数

| 平台 | 接收方式推荐 | 流式体验优化方案 | 群聊防刷屏要点 |
| :--- | :--- | :--- | :--- |
| **飞书 (Feishu/Lark)** | 长连接 WebSocket（免公网 IP）或 Webhook | 发送卡片后调用 \`PATCH /im/v1/messages/:id\` 刷新卡片内容 | 仅响应 \`mentions\` 含机器人的 \`im.message.receive_v1\` 事件 |
| **Telegram** | Webhook + \`secret_token\` 校验 | \`sendMessageDraft\` / 节流调用 \`editMessageText\` | 群组开启 \`Privacy Mode\` 或仅拦截 \`@bot_name\` / \`/\` 指令 |
| **Discord** | Gateway Bot 或 Interactions HTTP | 先 \`deferReply()\`（获得 15 分钟窗口），再 \`editReply()\` | 优先用 Slash Command \`/ask\` + Thread 隔离长对话 |
| **企业微信** | 回调 URL AES 加解密 | 被动回复先回空串，异步走应用消息主动推送 API | 注意 \`MsgId\` 去重窗口与 Markdown 子集兼容限制 |`,
  },
  {
    slug: 'tool-coze-dify-bot',
    type: 'tool',
    title: '零代码 AI Bot 编排选型：Coze (扣子) vs Dify vs n8n 全方位对比',
    original_title: 'No-Code AI Bot Builders: Coze vs Dify vs n8n',
    description:
      '对比 Coze 扣子、Dify 与 n8n 在插件生态、国内 IM 发布（飞书/微信/豆包）、私有化合规与成本控制上的真实差异。',
    tags: ['Agent', '工作流', '效率工具'],
    source: '站内评测对比',
    author: 'AI 智搜评测组',
    published_at: '2026-11-12T21:00:00+08:00',
    url: 'https://www.coze.cn',
    favorite_count: 610,
    credibility_label: '站内精选',
    content: `## 三大 Bot 编排平台怎么选？

很多团队纠结用 **Coze（扣子）**、**Dify** 还是 **n8n** 来做内部效率 Bot 或对外客服机器人。三者的定位其实非常互补：

### 核心能力对比矩阵

| 维度 | Coze (扣子) | Dify | n8n |
| :--- | :--- | :--- | :--- |
| **上手门槛** | 极低（开箱即用 SaaS） | 低–中（支持 Docker 私有部署） | 中（偏工程自动化节点） |
| **IM 一键发布** | 飞书、微信客服、Discord、Telegram 原生一键托管 | 提供 API / WebApp，需自配少量桥接服务 | 原生内置 Slack、Telegram、Discord、飞书社区节点 |
| **RAG 知识库** | 托管式开箱可用 | 精细控制分段、混合检索与 Rerank | 需外接 Pinecone / Supabase / Qdrant 节点 |
| **数据私有化** | 云端 SaaS 为主 | Apache-2.0（带附加商业条款）完全可私有化 | Fair-code 可自托管于内网 |
| **定时触发与系统集成** | 较弱（偏对话触发） | 中（支持 Workflow API 调用） | **极强**（400+ SaaS 连接器 + Cron + Webhook） |

### 选型口诀

- **快速验证想法 / 个人玩微信飞书 Bot**：直接用 **Coze**，30 分钟即可跑通。
- **企业内部知识库问答 / 要精细调优 RAG 与私有化**：首选 **Dify**。
- **定时抓邮件、监控 GitHub、读写数据库并主动推消息**：首选 **n8n**。`,
  },
  {
    slug: 'tool-windsurf',
    type: 'tool',
    title: 'Windsurf IDE 与 Cascade 代理引擎实战：大型项目协同编码技巧',
    original_title: 'Windsurf Editor & Cascade Agent Workflow',
    description:
      '深入讲解 Windsurf Cascade 上下文感知引擎、Terminal 自动修复循环、Memories 持久化规则与和 Cursor 的差异化选型。',
    tags: ['代码助手', 'Agent', '工程实践'],
    source: 'Codeium / Windsurf 官方文档',
    author: 'AI 智搜编辑部',
    published_at: '2026-11-12T17:00:00+08:00',
    url: 'https://windsurf.com',
    favorite_count: 584,
    credibility_label: '官方一手',
    content: `## Windsurf Cascade 核心工作流

**Windsurf** 以 **Cascade** 引擎为核心，把代码编辑、终端命令执行、测试反馈和跨文件上下文检索打通在同一条 Flow 中，尤其擅长在开发者手动修改几行代码后自动续接后续改动。

### 四步用好 Windsurf

1. **善用 \`.windsurfrules\` 与 Memories**：将项目架构约束、禁用的 API、数据库命名规范写入全局或仓库级 Rules，避免每次重新解释目录结构。
2. **Flow 模式接力开发**：先在 Cascade 里生成基础接口与页面骨架，手动调整样式后直接在对话框输入「基于我刚改的 Props 类型同步更新测试和调用方」。
3. **MCP 工具挂载**：在 MCP 配置中接入 Postgres（只读）或 Playwright，让 Cascade 能直接核查真实表结构与页面渲染错误。`,
  },
  {
    slug: 'tool-cline-roo',
    type: 'tool',
    title: 'Cline & Roo Code 开源自主编程 Agent：VS Code 接入本地模型与 MCP 全流程',
    original_title: 'Cline & Roo Code - Autonomous Coding Agent in VS Code',
    description:
      '完全开源且可自带 API Key（BYOK）的 VS Code 编程助手，支持 Plan/Act 分离、自定义角色模式与无缝切换 DeepSeek / Ollama。',
    tags: ['代码助手', '开源项目', 'Agent'],
    source: 'GitHub',
    author: 'Cline / Roo Code Community',
    published_at: '2026-11-12T14:00:00+08:00',
    url: 'https://github.com/cline/cline',
    favorite_count: 632,
    credibility_label: '开源仓库',
    content: `## 为什么很多工程师从闭源 IDE 切回 VS Code + Cline / Roo Code

- **完全透明的 API 计费**：直接填 OpenRouter、DeepSeek、Anthropic 或本地 Ollama 地址，实时看到每次对话消耗的 Token 与美元金额，无订阅黑盒。
- **Plan vs Act 双阶段隔离**：先用只读 **Plan 模式** 让高推理模型梳理方案并确认改动范围，再切 **Act 模式** 批量执行改代码和跑单测，极大减少返工与 Token 浪费。
- **Roo Code 多角色分工**：支持定制 Architect、Coder、Debugger、Reviewer 等不同模式，可为不同模式绑定不同性价比的模型！

### 推荐模型分层配置

- **Architect / Plan 模式**：\`Claude Opus / Sonnet\` 或 \`Gemini 4 Argon\`
- **Code / Act 常规执行**：\`DeepSeek V4.1 Flash\` 或 \`Qwen3.8 Max\`（单次迭代成本极低）`,
  },
  {
    slug: 'tool-cherry-studio',
    type: 'tool',
    title: 'Cherry Studio 全能开源桌面 AI 客户端：多模型聚合、本地知识库与 MCP 挂载',
    original_title: 'Cherry Studio - Multi-Provider Desktop AI Client',
    description:
      '国产口碑极高的开源跨平台 AI 客户端，支持 30+ 模型服务商统一管理、本地文档向量检索（RAG）与可视化 MCP 服务器配置。',
    tags: ['效率工具', '开源项目', '知识库'],
    source: 'GitHub',
    author: 'CherryHQ',
    published_at: '2026-11-12T10:30:00+08:00',
    url: 'https://github.com/CherryHQ/cherry-studio',
    favorite_count: 668,
    credibility_label: '开源仓库',
    content: `## Cherry Studio 核心高频用法

对于不想被单一网页端订阅绑死的开发者与日常办公用户，**Cherry Studio** 把所有模型能力收口在一个高颜值桌面客户端里：

### 必配三大模块

1. **多供应商聚合路由**：同时配置 OpenRouter、DeepSeek 官方、硅基流动、本地 Ollama，在同一个聊天窗口随时切换甚至**多模型同屏并行对比回答**。
2. **本地私密知识库（RAG）**：直接拖入 PDF、Word、Markdown、网页链接或整个笔记文件夹，选用本地 BGE / Nomic Embedding 模型建库，全过程文档不上传云端。
3. **内置 MCP 插件市场**：一键启用文件系统读写、Fetch 网页抓取、Sequential Thinking 等 MCP Server，让桌面对话窗口直接变成个人自动化工作台。`,
  },
  {
    slug: 'tool-open-webui',
    type: 'tool',
    title: 'Open WebUI 私有化部署实战：Docker 一键搭建团队共享 AI 工作台',
    original_title: 'Open WebUI - Self-Hosted AI Platform',
    description:
      '支持一键对接 Ollama 与 OpenAI 兼容接口的开源 Web 控制台，自带权限管理、联网搜索、企业内部 RAG 知识库与模型微调评测。',
    tags: ['私有化部署', '开源项目', 'RAG'],
    source: 'GitHub',
    author: 'Open WebUI Team',
    published_at: '2026-11-11T19:00:00+08:00',
    url: 'https://github.com/open-webui/open-webui',
    favorite_count: 588,
    credibility_label: '开源仓库',
    content: `## 一条 Docker 命令拉起团队级 AI 工作台

\`\`\`bash
docker run -d -p 3000:8080 \\
  -e OPENAI_API_BASE_URL=https://openrouter.ai/api/v1 \\
  -e OPENAI_API_KEY=your_key_here \\
  -v open-webui:/app/backend/data \\
  --name open-webui --restart always \\
  ghcr.io/open-webui/open-webui:main
\`\`\`

### 团队落地亮点

- **RBAC 精细权限管控**：管理员统一配置 API Key 与模型白名单，研发、产品、运营登录内网网址即可使用，无需每人自购海外账号。
- **Pipelines 插件流水线**：支持挂载敏感词脱敏、审计日志落库、自定义企业数据库查询工具。`,
  },
  {
    slug: 'tool-bolt-v0-lovable',
    type: 'tool',
    title: 'AI 全栈原型工具横评：v0.dev vs bolt.new vs Lovable 实战选型',
    original_title: 'AI Full-Stack App Builders: v0 vs bolt.new vs Lovable',
    description:
      '对比三大一句话生成全栈应用平台在 Next.js / Tailwind 组件美观度、Supabase 后端联调与源码导出二次开发上的真实体验。',
    tags: ['代码助手', '效率工具', '工程实践'],
    source: '站内评测对比',
    author: 'AI 智搜评测组',
    published_at: '2026-11-11T15:00:00+08:00',
    url: 'https://v0.dev',
    favorite_count: 542,
    credibility_label: '站内精选',
    content: `## 一句话生成应用：什么时候用谁？

| 工具 | 最强领域 | 后端/数据库联动 | 推荐用法 |
| :--- | :--- | :--- | :--- |
| **v0.dev** | Next.js + shadcn/ui 高颜值前端页面与数据看板 | 支持 Vercel / Supabase 一键挂载环境变量 | 先用 v0 生成精致 UI 组件，再导出到 Cursor / Claude Code 接业务逻辑 |
| **bolt.new** | 浏览器内 WebContainers 秒级预览完整全栈项目 | 内置多种模板与终端环境 | 快速验证 SaaS MVP、互动小工具与客户演示 Demo |
| **Lovable** | React + Supabase 全流程一体化建站 | Supabase Auth / RLS / Edge Functions 深度集成 | 非重度编码的产品经理从 0 到 1 搭出可登录付费的线上产品 |`,
  },
  {
    slug: 'tool-playwright-mcp',
    type: 'tool',
    title: 'Playwright MCP 实战：让 AI Agent 接管真实浏览器做 UI 验收与爬测',
    original_title: 'Playwright MCP - Browser Automation for AI Agents',
    description:
      '基于无障碍树（Accessibility Tree）而非易碎像素坐标驱动浏览器，帮编程 Agent 在改完前端代码后自动点页面、查控制台报错与回归测试。',
    tags: ['Agent', '工程实践', '自动化'],
    source: 'Microsoft / GitHub',
    author: 'Microsoft Playwright',
    published_at: '2026-11-11T12:00:00+08:00',
    url: 'https://github.com/microsoft/playwright-mcp',
    favorite_count: 515,
    credibility_label: '开源仓库',
    content: `## 用 Playwright MCP 打通「写代码 → 浏览器实机验收」闭环

传统开发流程中，AI 写完前端代码后往往“自以为跑通了”，实际一打开页面就遇到 Hydration 报错或按钮遮挡。接入 **Playwright MCP** 后，Agent 可直接获取网页无障碍快照（Snapshot）：

\`\`\`json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
\`\`\`

### 实战收益

- **极低 Token 消耗**：相比每一步传整张高清截图，Accessibility Tree 文本快照体积小 10 倍且控件引用 \`ref\` 极其稳定。
- **真实 Console & Network 检查**：自动捕捉 404/500 接口异常与 React 水合警告。`,
  },
  {
    slug: 'tool-comfyui',
    type: 'tool',
    title: 'ComfyUI 节点式 AIGC 工作流指南：Flux 生图与 API 自动化批处理',
    original_title: 'ComfyUI Node-Based Workflow & Production API Guide',
    description:
      '系统掌握 ComfyUI 节点连线逻辑、Flux / ControlNet / LoRA 组合工作流保存与 JSON API 队列批量出图架构。',
    tags: ['多模态', '开源项目', '自动化'],
    source: 'GitHub',
    author: 'comfyanonymous',
    published_at: '2026-11-10T17:00:00+08:00',
    url: 'https://github.com/comfyanonymous/ComfyUI',
    favorite_count: 560,
    credibility_label: '开源仓库',
    content: `## 从「玩界面」到「上生产」：ComfyUI 核心工程化思路

**ComfyUI** 之所以成为工业级图像/视频工作流标准，在于它的每张工作流图本质上就是一个可版本控制的 **JSON DAG 执行计划**。

### 高效实践要点

1. **Manager 与环境隔离**：必装 \`ComfyUI-Manager\` 管理自定义节点，并将固定依赖冻结到 Docker 镜像防止节点更新炸环境。
2. **Enable Dev Mode Options**：开启开发者模式后可一键导出 \`Save (API Format)\` JSON，后端服务只需替换其中的 \`prompt\` 文本与 \`seed\` 即可通过 WebSocket 批量出图。`,
  },
  {
    slug: 'tool-kling-runway',
    type: 'tool',
    title: 'AI 视频生成提示词工程：可灵 (Kling) / Runway / Veo 运镜与一致性实战',
    original_title: 'AI Video Prompting Guide: Kling, Runway & Veo',
    description:
      '拆解「主体锚定 + 动作指令 + 镜头语言 + 光影氛围」四段式视频提示词公式，解决人物崩坏、画面闪烁与运镜失控问题。',
    tags: ['多模态', '提示词模板', '效率工具'],
    source: '站内原创教程',
    author: 'AI 智搜评测组',
    published_at: '2026-11-10T14:00:00+08:00',
    url: 'https://klingai.com',
    favorite_count: 478,
    credibility_label: '站内精选',
    content: `## 高可控 AI 视频四段式提示词公式

直接输入抽象形容词很容易导致视频模型“放飞自我”。建议固定使用：

> **\`[首帧主体与外观细节] + [单一清晰的动作变化] + [物理机位与运镜方式] + [光线、色调与画幅风格]\`**

### 常见运镜关键词速查

- **推进聚焦**：\`Slow dolly in\`, \`Push in close-up\`
- **环绕展示**：\`Smooth 180-degree orbit shot around the subject\`
- **跟随运动**：\`Tracking shot following from behind at eye level\`
- **稳定防闪烁**：尽量用 **图生视频（I2V）** 先用静态生图锁定角色与服装，再限制单个 5 秒镜头内只发生 1–2 个物理动作。`,
  },
  {
    slug: 'model-glm-kimi',
    type: 'model',
    title: '国产旗舰双雄选型：GLM 5.3 / Flash 与 Kimi K3 / K3.1 Pro 深度对比',
    original_title: 'GLM 5.3 & Kimi K3 Series Technical Comparison',
    description:
      '基于最新 LMArena 实测与 API 单价，对比 Z.ai GLM 5.3 系列与 Moonshot Kimi K3 系列在开源部署、长文档与代码场景的表现。',
    tags: ['开源模型', '中文优化', '评测基准'],
    source: 'LMArena & OpenRouter 实测',
    author: 'AI 智搜评测组',
    published_at: '2026-11-12T19:00:00+08:00',
    url: 'https://open.bigmodel.cn',
    favorite_count: 625,
    credibility_label: '站内精选',
    content: `## GLM 5.3 与 Kimi K3 梯队定位拆解

在当前 LMArena 开源及商用榜单中，国产第一梯队在中文理解、长上下文与工具调用稳定性上表现突出：

| 系列代表 | 突出强项 | 成本与部署建议 |
| :--- | :--- | :--- |
| **Kimi K3 / K3.1 Pro** | 开源榜前列、超长文档综合研读、复杂 Agent 多步规划 | 适合企业研发中台、长合同/研报深度分析 |
| **GLM 5.3** | 均衡通用能力与代码生成、中文格式遵循稳定 | 兼具开源权重生态与云端高并发 API |
| **GLM 5.3 Flash** | 极低延迟与性价比榜领跑（超低单价 + 高能力分） | 适合高并发实时摘要、智能客服与流水线批处理 |`,
  },
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
    favorite_count: 682,
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
2. **用单测/构建兜底**：每次改动结束后让 Agent 自动跑完类型检查与单元测试再收尾。
3. **善用 Subagents / Worktree 隔离**：把跨模块调研或独立子功能交给独立工作区，主会话只保留干净的决策脉络。`,
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
| **Checkpointer** | 自动持久化每一步状态快照（Postgres/SQLite） | 服务重启后从中断点续跑长任务 |
| **Human-in-the-loop** | \`interrupt()\` 挂起执行等待人类确认 | 支付、删库、发邮件前的人工审批 |
| **Subgraphs** | 隔离每个子 Agent 的私有状态 | 多角色审查、研究与编码解耦 |

### 最小状态机结构示例

\`\`\`python
from langgraph.graph import StateGraph, END

builder = StateGraph(AgentState)
builder.add_node("research", research_node)
builder.add_node("writer", writer_node)
builder.add_conditional_edges("writer", should_continue, {"revise": "research", "done": END})
graph = builder.compile(checkpointer=postgres_saver)
\`\`\``,
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
- **\`--quantization fp8\`**：H100 / L40S 等 Ada/Hopper 架构显卡建议启用 FP8，几乎无损前提下显存需求减半。
- **\`--max-num-seqs\`**：并发高但单条输出较短时适当上调，避免请求在排队区空等 GPU 算力。`,
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
    favorite_count: 645,
    credibility_label: '官方一手',
    content: `## 什么是 MCP（Model Context Protocol）

**MCP** 相当于 AI 应用领域的“USB-C 接口”：将工具调用（Tools）、只读上下文资源（Resources）和可复用提示模板（Prompts）解耦为标准化的 Client-Server 协议。

### 三大核心原语

- **Tools（模型可控动作）**：例如查询数据库、创建 Issue、检索内部工单，由模型决策触发。
- **Resources（应用/用户可控数据）**：类 REST 只读 URI，将日志、配置、文档安全挂载进上下文。
- **Prompts（标准工作流模板）**：预设好参数与最佳实践的交互快捷指令。

### TypeScript MCP Server 最小骨架

\`\`\`typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({ name: 'internal-docs', version: '1.0.0' });

server.tool('search_docs', { query: z.string() }, async ({ query }) => ({
  content: [{ type: 'text', text: \`Matched docs for: \${query}\` }],
}));
\`\`\``,
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
      '面向 Next.js / TypeScript 的流式生成与工具调用标准开发套件，统一 streamText、generateObject 与前端 useChat 状态管理。',
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
    title: 'Gemini 4 Carbon / Argon / Hydrogen 与 3.8 Flash 多模态选型指南',
    original_title: 'Gemini 4 & Gemini 3.8 Flash Developer Guide',
    description:
      '对比 Gemini 4 Carbon、Argon、Hydrogen 与 Gemini 3.8 Flash 在 LMArena 综合/代码/数学的统治力表现及原生音视频理解实践。',
    tags: ['多模态', '评测基准', '长上下文'],
    source: 'Google AI 官方文档',
    author: 'AI 智搜评测组',
    published_at: '2026-11-12T18:00:00+08:00',
    url: 'https://ai.google.dev/gemini-api/docs',
    favorite_count: 602,
    credibility_label: '官方一手',
    content: `## Gemini 4 与 Flash 系列应用分工

- **Gemini 4 Carbon / Argon / Hydrogen**：LMArena 综合、代码与数学榜前排主力，适合高难度工程架构设计、跨模态长视频/PDF 深度解析与复杂推理任务。
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
  {
    slug: 'tool-suno-udio',
    type: 'tool',
    title: 'Suno & Udio AI 音乐生成实战：结构化歌词标记、曲风控制与人声克隆',
    original_title: 'Suno & Udio AI Music Generation Guide',
    description:
      '系统掌握 Suno 与 Udio 的 Meta Tags 分段控制语法（[Intro]、[Verse]、[Chorus]、[Bridge]）、乐器编排提示词、Extend 续写与 Stem 分轨导出流程。',
    tags: ['音频视频', '效率工具', '多模态', 'Prompt工程'],
    source: 'AI-Hub 精选',
    author: 'AI-Hub 编辑部',
    published_at: '2026-11-13T11:10:00+08:00',
    url: 'https://suno.com/',
    favorite_count: 472,
    credibility_label: '站内精选',
    content: `## Suno 与 Udio 适用场景对比

| 工具 | 优势领域 | 推荐工作流 |
| :--- | :--- | :--- |
| **Suno** | 完整人声旋律流畅、中文咬字自然 | 快速制作短视频 BGM、品牌主题曲、播客片头 |
| **Udio** | 编曲质感细腻、细节控制强、分轨丰富 | 30 秒片段精细 Inpaint 局部重绘 + Extend 拼接 |

## 结构化歌词 Meta Tags 模板

在 Custom Mode 下使用方括号控制段落节奏，避免模型直接把结构词唱出来：

\`\`\`text
[Intro]
(Warm Rhodes electric piano, lo-fi vinyl crackle, 88 BPM)

[Verse 1]
深夜的城市还亮着屏幕微光
键盘敲下第十七行待定方案

[Pre-Chorus]
(Drum groove kicks in, subtle bassline)
别急着把未完的草稿合上

[Chorus]
(Soaring synth lead, uplifting indie pop, wide stereo harmonies)
穿过漫长等待的窗口 终会遇见回响
\`\`\`

## 实战技巧

- **控制 BPM 与情绪词**：把 \`88 BPM\`、\`uplifting indie pop\`、\`female vocal, airy\` 写在 Style Prompt 里，比堆砌抽象形容词更稳。
- **分轨二次混音**：导出 Vocal + Instrumental Stem 后导入 DAW 或剪映，能单独压低人声频段做背景配乐。`,
  },
  {
    slug: 'tutorial-crewai-autogen',
    type: 'tutorial',
    title: '多智能体编排框架选型：LangGraph vs CrewAI vs AutoGen 架构与实战对比',
    original_title: 'Multi-Agent Framework Comparison: LangGraph vs CrewAI vs AutoGen',
    description:
      '从状态控制粒度、角色协作模式、工具调用可观测性与生产部署成本四个维度对比主流 Multi-Agent 框架，并附可落地的代码组织建议。',
    tags: ['Agent', '教程', 'LangGraph', '开发框架'],
    source: 'AI-Hub 精选',
    author: 'AI-Hub 架构组',
    published_at: '2026-11-13T11:20:00+08:00',
    url: 'https://docs.crewai.com/',
    favorite_count: 506,
    credibility_label: '站内精选',
    content: `## 三大框架定位差异

| 框架 | 核心抽象 | 状态持久化与中断恢复 | 典型适用场景 |
| :--- | :--- | :--- | :--- |
| **LangGraph** | 有向状态图（StateGraph + Checkpointer） | 原生支持 Human-in-the-loop 与断点续跑 | 复杂审批流、高可靠生产后端、严格分支控制 |
| **CrewAI** | 角色化团队（Agent + Task + Crew） | Flow 模式支持状态流转 | 调研报告生成、内容流水线、快速原型验证 |
| **AutoGen** | 异步消息驱动多智能体对话（v0.4+ 事件架构） | 支持分布式 Agent Runtime | 代码沙箱自纠错、多角色辩论与仿真 |

## CrewAI 快速定义分工角色示例

\`\`\`python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="AI Benchmark Analyst",
    goal="梳理最新大模型测评分数与价格变化",
    backstory="专注开源模型与推理性价比分析的技术研究员",
)

writer = Agent(
    role="Technical Editor",
    goal="将结构化评测数据整理为清晰易读的中文周报",
    backstory="擅长用表格与对比总结表达技术洞察",
)
\`\`\`

## 工程选型建议

1. **生产级严肃业务**：优先用 **LangGraph**，显式声明 \`TypedDict\` 状态，出 Bug 可直接按 \`thread_id\` 回放状态历史。
2. **偏探索与内容协同**：用 **CrewAI** 起手最快，1 小时即可跑通「检索员 + 审校员 + 排版员」流水线。
3. **重度代码执行闭环**：**AutoGen** 的 Docker 代码执行器隔离较完善，适合自动写脚本并验证结果。`,
  },
  {
    slug: 'tool-midjourney-flux',
    type: 'tool',
    title: 'Midjourney & FLUX 开源生图工作流：写实人像、一致性角色与 LoRA 精修指南',
    original_title: 'Midjourney & FLUX Image Generation Workflow Guide',
    description:
      '梳理 Midjourney `--cref` / `--sref` 一致性参数、Black Forest Labs FLUX.1/FLUX.2 提示词结构、局部重绘与电商/UI 配图落地规范。',
    tags: ['图像生成', '多模态', '效率工具', 'Prompt工程'],
    source: 'AI-Hub 精选',
    author: 'AI-Hub 设计组',
    published_at: '2026-11-13T11:25:00+08:00',
    url: 'https://blackforestlabs.ai/',
    favorite_count: 488,
    credibility_label: '站内精选',
    content: `## Midjourney 与 FLUX 如何搭配使用

- **Midjourney（快速探索审美与构图）**：适合概念设计、情绪板与艺术插画；利用 \`--sref <url>\` 锁定风格，\`--cref <url> --cw 80\` 保持人物面部与服装一致。
- **FLUX（开源可控与画面文字渲染）**：对长自然语言描述和图片内英文/排版文字响应极准，搭配 ComfyUI + ControlNet Depth/Canny 可精确对齐线稿与产品轮廓。

## 高可用 FLUX 自然语言 Prompt 结构

FLUX 不建议堆砌 \`8k, masterpiece, best quality\` 这类旧 SD1.5 咒语，直接写清画面要素效果更好：

\`\`\`text
A minimalist editorial product photo of a matte silver smart speaker sitting on a warm oak desk, soft morning sunlight casting diagonal window shadows across a plaster wall, shot on 50mm lens at f/2.8, shallow depth of field, clean studio composition.
\`\`\`

## 常用质量控制清单

1. **比例预设**：网页 Hero Banner 优先 \`16:9\` 或 \`21:9\`，社媒封面 \`3:4\`。
2. **文字排版**：FLUX 生成海报文字后，再用 Figma / Canva 替换可编辑矢量文字以保证商用印刷清晰度。`,
  },
  ...EXTRA_CURATED_RESOURCES,
];
