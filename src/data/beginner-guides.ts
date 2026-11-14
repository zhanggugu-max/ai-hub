export interface GuideComparison {
  badTitle: string;
  bad: string;
  goodTitle: string;
  good: string;
}

export interface GuideLinkItem {
  label: string;
  href: string;
}

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  steps?: string[];
  comparison?: GuideComparison;
  tip?: string;
  links?: GuideLinkItem[];
}

export interface GuideStep {
  id: string;
  stepNumber: '01' | '02' | '03' | '04';
  title: string;
  subtitle: string;
  readTime: string;
  tags: string[];
  showAffiliateBanner?: boolean;
  sections: GuideSection[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  scene: string;
  description: string;
  promptText: string;
}

export interface GlossaryItem {
  id: string;
  term: string;
  plainName: string;
  explanation: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'step-01-pick-right-ai',
    stepNumber: '01',
    title: '3 分钟搞懂 AI 怎么选——别再把所有问题都问同一个模型',
    subtitle: '写代码、查最新资料、做PPT、看长文档各有所长，先选对工具比练提示词更省时间。',
    readTime: '3 分钟',
    tags: ['工具选型', '零基础必看', '避坑入门'],
    sections: [
      {
        heading: '为什么你总觉得 AI 有时聪明、有时“犯蠢”？',
        paragraphs: [
          '很多新手刚接触 AI 时，习惯打开一个聊天框解决所有问题：早上让它查今天的行业新闻，中午让它改前端代码，晚上让它帮做视频。结果查新闻开始胡编网址，写代码漏改联动文件，做视频干脆说“我只是文本模型”。',
          '这并不是 AI 不行，而是工具与场景错配。到了 2026 年，主流 AI 工具已经明确分化成 5 种角色，各自负责不同的活：',
        ],
        steps: [
          '【日常对话与复杂思考】：适合拆解方案、写文案、多步逻辑推理（常见主力如 Claude 系列、GPT / o 系列、DeepSeek、Kimi）。',
          '【实时联网检索】：需要最新时间线、政策变化和可点击信源，优先用带溯源引用的 AI 搜索（如 Perplexity、秘塔 AI 搜索、Grok DeepSearch），不要靠普通聊天模型凭记忆硬猜。',
          '【写代码与改项目】：想直接读写你电脑里的多文件项目，优先选 Cursor、Claude Code、TRAE 或开源插件 Cline，而不是一遍遍把代码复制贴进网页聊天框。',
          '【长文档与论文精读】：几十页 PDF 或多个文档放一起提问，用 NotebookLM 或 Kimi 这种支持超长上下文、能定位原文出处的工具最稳。',
          '【多模态与桌面数字员工】：生图生视频用可灵、Veo、即梦；想让 AI 自己接管电脑整理文件、跑脚本，直接用 WorkBuddy、QoderWork 或 Antigravity。',
        ],
      },
      {
        heading: '懒人选型法：直接借用本站两个现成工具页',
        paragraphs: [
          '你完全不需要把市面上的几十个模型名字背下来。遇到陌生需求时，按这两步 30 秒拍板即可：',
        ],
        steps: [
          '先看「场景化 AI 工具导航」：按你的目的（如 AI 编程、建站原型、视频创作、办公自动执行）直接挑口碑最好的前 2 个工具。',
          '再查「AI 能力榜单」：如果你已经准备接入 API 或挑主力模型，直接去榜单按「综合 / 编程 / 性价比 / 国产模型」排序看客观跑分与价格。',
        ],
        tip: '避坑提示：国内日常查资料、写中文文案首选国产直连工具（免折腾网络，免费额度也很够用）；只有遇到极高难度系统架构、复杂代码重构时，再按需切到海外旗舰模型。',
        links: [
          { label: '逛场景化 AI 工具导航', href: '/nav' },
          { label: '看最新 AI 能力榜单', href: '/leaderboard' },
        ],
      },
    ],
  },
  {
    id: 'step-02-prompting-rules',
    stepNumber: '02',
    title: '告别“人工智障”——2026 最新 AI 提问心法与反套路技巧',
    subtitle: '推理模型时代别再背诵长篇大论的“玄学咒语”，用三要素公式一次说出你要的结果。',
    readTime: '4 分钟',
    tags: ['提问技巧', '反套路', '对比示范'],
    sections: [
      {
        heading: '先忘掉过时的“玄学套话”',
        paragraphs: [
          '两年前网上流传很多模板，动不动开头就是“请你扮演拥有 20 年经验的资深专家，请一步步深呼吸思考，答不好我要扣你工资”。在早期模型上这招有点用，但在如今新一代推理模型（Reasoning Model）和旗舰模型上，这些废话不仅浪费字数，有时还会把模型带偏到空泛的“腔调模仿”。',
          '真正让输出质量翻倍的，其实只有人话版三要素：【明确目标】+【补充背景】+【验收标准】。',
        ],
        steps: [
          '明确目标：一句话说清你要“做什么产出”（例如：输出一封发给客户的道歉兼延期邮件，而不是“帮我处理一下客诉”）。',
          '补充背景：交代对象是谁、你手里有什么现状、卡在什么限制条件（例如：对方是重视合规的国企客户，功能因接口联调延迟 3 天）。',
          '验收标准：规定字数、格式、语气和禁忌项（例如：控制在 250 字以内，语气诚恳不甩锅，分“原因+补偿方案+新时间表”三段，不要套话）。',
        ],
      },
      {
        heading: '一眼看懂：❌ 错误提问 vs ✅ 正确提问',
        paragraphs: [
          '把需求当成给新来的实习生派活——你交代得越具体，返工次数越少：',
        ],
        comparison: {
          badTitle: '❌ 错误示范（太模糊，AI 只能猜着胡编）',
          bad: '帮我写一份周报，我这周主要做了一个登录页面和几个接口优化，写得专业高大上一点，请一步步思考。',
          goodTitle: '✅ 正确示范（三要素齐备，一遍出稿直接能发）',
          good: '我要给研发总监发本周工作周报（目标）。本周完成：1. 重构移动端登录页，首屏加载从 2.4s 降到 0.9s；2. 修复 3 个超时接口，报错率降为 0；下周计划接入微信扫码登录（背景）。请用 Markdown 分「本周成果（突出业务影响）/ 风险与卡点 / 下周计划」三部分输出，控制在 300 字内，语言干练不要空洞套词（验收标准）。',
        },
        tip: '避坑提示：让 AI 改代码报错时，千万别用自己的话概括“它好像连不上网了”。请直接把完整的终端报错日志、相关代码片段一起复制发给它，准确度能提升 10 倍。',
      },
    ],
  },
  {
    id: 'step-03-api-key-setup',
    stepNumber: '03',
    title: '保姆级教程——5 分钟申请 API Key 并接入桌面客户端',
    subtitle: '不用每月花 20 美元固定订阅，学会用 API Key 按实际字数付费，10 元能用很久。',
    readTime: '5 分钟',
    tags: ['API Key', '硅基流动', 'Cherry Studio'],
    showAffiliateBanner: true,
    sections: [
      {
        heading: '用大白话搞懂：API Key 和官方会员有什么区别？',
        paragraphs: [
          '开通官网包月会员就像办健身房月卡——不管你这个月去没去、用多用少，每月固定扣一笔钱（通常 20 美元/月）。而 API 接口模式就像“按度交水电费”：先去平台充 10 块钱或领系统送的免费体验额度，每问一次按字数扣几厘钱，不问不扣钱，而且能自由切换不同厂商的最新模型。',
          'API Key 就是一串以 sk- 开头的专属密码钥匙，把它填进好用的本地桌面客户端（比如开源的 Cherry Studio），你就拥有了一个可随时切换全球主流模型的私人全能工作台。',
        ],
      },
      {
        heading: '手把手 4 步配通你的第一个客户端',
        paragraphs: [
          '新手可以从国内平台（如硅基流动 SiliconFlow）领免费额度免魔法上手，也可以通过聚合网关（如 OpenRouter）用一个 Key 统一调用海外全系旗舰模型：',
        ],
        steps: [
          '注册并领额度：打开模型服务平台（国内新手推荐硅基流动；想一站测 Claude / GPT / DeepSeek 全家桶，可直接用下方的聚合 API 平台），完成注册登录。',
          '生成 API Key：在后台左侧菜单找到「API 密钥 / API Keys」页面，点击「新建密钥」，复制生成出来的那串 `sk-xxxxxxxx` 字符（注意关闭页面后通常无法再次查看完整密钥）。',
          '下载桌面客户端：安装并打开开源桌面端 Cherry Studio（支持 Windows / macOS，内置聊天、文档知识库和联网搜索）。',
          '填进去一键连通：打开 Cherry Studio 左下角「设置」->「模型服务」，选中对应平台，把刚刚复制的 Key 粘贴进「API 密钥」输入框，勾选想用的模型（如 DeepSeek-V3 / Qwen / Claude），点「检查」看到绿色通过提示即可开聊。',
        ],
        tip: '安全红线：API Key 相当于绑了你钱包的银行卡密码！绝对不要截图发到微信群、朋友圈，也不要写死在公开上传到 GitHub 的前端代码里，否则几分钟内就会被恶意脚本盗刷光额度。',
        links: [
          { label: '看 Cherry Studio 完整图文教程', href: '/resources/tool-cherry-studio' },
          { label: '看 OpenRouter 聚合路由实操', href: '/resources/tool-openrouter' },
        ],
      },
    ],
  },
  {
    id: 'step-04-local-mcp-agents',
    stepNumber: '04',
    title: '从聊天到数字员工——本地部署、MCP 与自主 Agent 入门',
    subtitle: '把 AI 从“只能聊天的网页框”升级为能读写你本地文件、离线运行并自己干完一整件事的助手。',
    readTime: '4 分钟',
    tags: ['本地部署', 'MCP', '桌面智能体'],
    sections: [
      {
        heading: '升级第一站：本地部署开源模型（Ollama）',
        paragraphs: [
          '如果公司有严格的数据保密要求，或者你想在没有网的飞机/高铁上继续用 AI，可以使用 Ollama。它的体验就像在电脑上装了一个常规软件，安装好后在终端运行一行命令，就能把 Qwen、Llama、DeepSeek 开源模型下载到你自己的显卡里跑，所有聊天记录完全留在本地硬盘。',
        ],
      },
      {
        heading: '升级第二站：MCP 让 AI 长出“手和脚”',
        paragraphs: [
          '以前用 AI 最烦的是反复充当“人肉复制粘贴机”——文件夹在电脑里、数据库在本地、报错在浏览器里，得一段段手动喂给模型。',
          'MCP（模型上下文协议）就是一套专为 AI 设计的“通用 Type-C 数据线标准”。只要在 Cherry Studio、Cursor 或 Claude Desktop 里挂载上对应的 MCP 工具，模型就能自己读你指定目录下的文件、查数据库结构、甚至操作浏览器核对页面效果。',
        ],
      },
      {
        heading: '升级第三站：交给桌面自主智能体（Agent）',
        paragraphs: [
          '2026 年最大的变化是智能体真正走向桌面和云电脑。像 腾讯 WorkBuddy、阿里 QoderWork、Claude Code、Google Antigravity 这类自主智能体，你不再需要当监工一句句指挥，只需要把最终目标和相关目录授权给它：',
        ],
        steps: [
          '它会自己拆解任务计划，先读懂现有文档或代码仓库。',
          '直接修改本地文件、生成表格报告，或在沙箱终端里运行测试脚本验证有没有报错。',
          '发现异常会自行排查修补，直到把可验收的最终成品摆到你面前。',
        ],
        tip: '避坑提示：给 Agent 授权本地目录或自动执行权限时，建议初期把重要代码先做 Git 提交备份，或专门划定一个独立工作文件夹给它测试，确认习惯它的脾气后再放开更多权限。',
        links: [
          { label: '看 Ollama 本地部署指南', href: '/resources/tool-06' },
          { label: '看 MCP 开放协议与挂载教程', href: '/resources/tool-mcp' },
          { label: '浏览 21 款桌面自主智能体', href: '/nav' },
        ],
      },
    ],
  },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'prompt-explain-eli5',
    title: '零基础概念通俗拆解',
    scene: '学习新知识 / 看不懂黑话',
    description: '把拗口的技术名词、行业白话翻译成小学生都能秒懂的生活比喻，快速扫盲。',
    promptText: `请用「零基础新手也能秒懂」的大白话，向我解释：[在此填入你的内容]。

要求按以下 3 部分输出：
1. 一句话生活比喻：用一个日常生活的例子说明它到底是什么；
2. 解决什么实际问题：没有它之前有多麻烦，有了它能带来什么好处；
3. 常见误区提醒：新手理解或使用它时最容易踩的 1~2 个坑。
请避免堆砌专业缩写，如果必须出现英文词，请顺带解释中文意思。`,
  },
  {
    id: 'prompt-debug-code',
    title: '小白让 AI 写程序 / 改报错',
    scene: '编程排错 / 环境报错',
    description: '防止 AI 直接甩出一堆看不懂的代码，要求先定位原因，再给最小可复制的修复方案。',
    promptText: `我在开发/运行项目时遇到了报错，背景环境是：[在此填入你的内容（例如：Windows 11 + Node 22 / Next.js 项目）]。

完整报错日志如下：
[在此填入你的内容（完整报错信息或异常现象）]

请按以下顺序帮我排查：
1. 人话翻译原因：用通俗的话告诉我这句话到底哪里错了；
2. 最小修改方案：只告诉我需要修改哪个文件、哪几行代码，或者执行哪条终端命令；
3. 验证方法：改完之后我该怎么确认问题已经彻底修复。
如果还需要查看其它文件内容，请先列出文件路径让我发给你，不要盲目猜测改写整个文件。`,
  },
  {
    id: 'prompt-paper-article-digest',
    title: '长文章 / 论文核心提炼',
    scene: '技术长文 / PDF 研报精读',
    description: '跳过冗长铺垫，直接抽干货：核心结论、关键数字、方法亮点以及和你有什么关系。',
    promptText: `请作为我的技术研究助理，帮我快速提炼下面这篇长文/论文的核心信息：

[在此填入你的内容（直接粘贴文章正文、摘要或关键段落）]

请按以下结构输出精华总结（总字数控制在 600 字以内）：
- 一句话总结：这篇文章最核心的发现或主张是什么？
- 3 个关键支撑论据/数据：有哪些具体实验数据、对比结果或事实支持这个观点？
- 可落地的启发：对我实际写代码、选工具或做业务有什么直接参考价值？
- 局限性与存疑点：作者忽略了哪些前提条件，或哪些结论需要谨慎验证？`,
  },
  {
    id: 'prompt-weekly-report-email',
    title: '工作周报与邮件高情商润色',
    scene: '职场沟通 / 汇报润色',
    description: '把零散流水账转成条理清晰、重点突出业务价值的汇报，或调整发给客户/领导的语气。',
    promptText: `请帮我把下面这些零碎的工作记录/草稿，改写成得体、重点突出的职场文本：

发送对象：[在此填入你的内容（例如：直属技术负责人 / 外部合作客户）]
核心目的：[在此填入你的内容（例如：周报汇总 / 说明项目延期 2 天并同步补偿方案）]
我的原始素材：
[在此填入你的内容]

要求：
1. 结构清晰：先讲关键结果和核心结论，再补充细节与后续安排；
2. 去油腻去套话：不要出现“赋能、抓手、闭环、高度重视”等空洞词汇；
3. 提供两个版本：一版「简洁直接版（适合微信/飞书快速沟通）」，一版「正式完整版（适合邮件/周报）」。`,
  },
  {
    id: 'prompt-decision-matrix',
    title: '复杂决策利弊分析',
    scene: '工具选型 / 方案拍板',
    description: '纠结“选 A 还是选 B”时，逼着 AI 拉出同一维度的硬指标对比和反面风险。',
    promptText: `我正在做一个选择/决策，目前的纠结背景与约束条件是：
[在此填入你的内容（例如：个人博客想低成本上线，纠结用自建 VPS 还是 Vercel + Supabase，预算每月 50 元内）]

需要对比的备选方案：
[在此填入你的内容（例如：方案 A vs 方案 B）]

请帮我输出一份冷静客观的对比分析：
1. 核心维度对比表：从「成本、上手难度、维护时间、长期扩展性、潜在风险」逐项打分对比；
2. 各自最劝退的缺点：分别点出如果选错后期最难受的地方；
3. 明确推荐结论：基于我前面的预算与约束，给出明确的优先建议（不要各打五十大板），并说明如果情况变了什么时候该切换方案。`,
  },
  {
    id: 'prompt-study-roadmap',
    title: '学习计划制定助手',
    scene: '从零学技能 / 转行打卡',
    description: '拒绝大而空的书单，生成结合你每天空闲时间的分阶段实战路线和验收小项目。',
    promptText: `我想在 [在此填入你的内容（例如：4 周 / 2 个月）] 内从零上手掌握：[在此填入你的内容（例如：Python 自动化办公 / AI 工作流编排 Dify）]。

我的现状与时间：
- 当前基础：[在此填入你的内容（例如：完全没写过代码，只会用 Excel）]
- 每天可投入时间：[在此填入你的内容（例如：工作日晚上 1 小时 + 周末半天）]

请帮我制定一份「以做出能用的小成品为导向」的学习路线图：
1. 按周拆解任务：每周只学 1~2 个最核心概念，不要塞一长串理论书单；
2. 每周动手作业：为每周设计一个具体、1 小时内能验证成功的小实践任务；
3. 推荐 3 个免费优质练习入口，并标注学习过程中最容易半途而废的卡点及对策。`,
  },
];

export const AI_GLOSSARY: GlossaryItem[] = [
  {
    id: 'token',
    term: 'Token（词元）',
    plainName: 'AI 算字数和计费的最小积木块',
    explanation: '模型读字不是按“个”算，而是切碎成小块计算。中文大概 1~2 个字算 1~2 个 Token，用多少付多少钱。',
  },
  {
    id: 'context-window',
    term: '上下文窗口（Context）',
    plainName: 'AI 单次对话的“草稿纸大小”',
    explanation: '它决定 AI 一口气能记住多少聊天记录和上传文档。草稿纸写满了，它就会把最前面聊过的内容“忘掉”。',
  },
  {
    id: 'reasoning-model',
    term: '推理模型（Reasoning）',
    plainName: '先打草稿再作答的“慢思考学霸”',
    explanation: '不像普通模型脱口而出，它会先在后台拆解逻辑、反复验算再输出结论，最适合解数学、写代码与复杂排错。',
  },
  {
    id: 'rag',
    term: 'RAG（检索增强生成）',
    plainName: '带着参考书进考场“开卷考”',
    explanation: '先从你的本地文档或知识库里翻出相关段落，再让 AI 照着材料回答，能大幅减少胡编乱造，企业内网最常用。',
  },
  {
    id: 'mcp',
    term: 'MCP（模型上下文协议）',
    plainName: '接通 AI 与工具的“Type-C 数据线”',
    explanation: '一套统一插头标准，让支持的客户端直接读写你的本地文件、数据库或 GitHub，不用人工来回复制粘贴。',
  },
  {
    id: 'agent',
    term: 'Agent（智能体）',
    plainName: '能自己动手干活的“数字员工”',
    explanation: '聊天机器人只会动嘴给建议；Agent 能自己拆任务、上网查资料、改电脑文件、跑报错测试，直到把活干完。',
  },
  {
    id: 'hallucination',
    term: 'AI 幻觉（Hallucination）',
    plainName: '一本正经地“胡说八道”',
    explanation: '模型遇到没把握的知识时，会凭概率顺着词句往下编，造出不存在的文献或代码接口，关键数据务必手动核验。',
  },
  {
    id: 'open-vs-closed',
    term: '开源权重 vs 闭源接口',
    plainName: '买现成食材自己做 vs 下馆子点菜',
    explanation: '开源权重可免费下载部署到自家电脑或服务器，数据最安全；闭源接口免维护直接按次调大厂服务，效果通常更稳。',
  },
];
