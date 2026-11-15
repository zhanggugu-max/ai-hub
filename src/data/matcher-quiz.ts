import type { NavTool } from '@/data/nav-tools';
import type {
  BudgetPreference,
  HardConstraintKey,
  MatcherAnswersV2,
  MatcherRecommendationReport,
  NetworkPreference,
  SceneKey,
  TaskKey,
  WorkModePreference,
} from '@/data/matcher/types';
import { evaluateToolMatches, SCENE_META, TASK_META } from '@/lib/matcher/engine';

export interface SceneQuizOption {
  value: SceneKey;
  label: string;
  description: string;
  tag: string;
}

export interface TaskQuizOption {
  value: TaskKey;
  label: string;
  description: string;
  badge?: string;
}

export interface DimensionQuizOption<T extends string> {
  value: T;
  label: string;
  description: string;
  isNoPreference?: boolean;
}

export interface HardConstraintOption {
  key: HardConstraintKey;
  label: string;
  description: string;
}

export const SCENE_QUIZ_OPTIONS: SceneQuizOption[] = [
  {
    value: 'coding_web',
    label: SCENE_META.coding_web.label,
    description: SCENE_META.coding_web.description,
    tag: '最热门',
  },
  {
    value: 'office_efficiency',
    label: SCENE_META.office_efficiency.label,
    description: SCENE_META.office_efficiency.description,
    tag: '高频刚需',
  },
  {
    value: 'desktop_agent',
    label: SCENE_META.desktop_agent.label,
    description: SCENE_META.desktop_agent.description,
    tag: 'Agent 实操',
  },
  {
    value: 'research_learning',
    label: SCENE_META.research_learning.label,
    description: SCENE_META.research_learning.description,
    tag: '可溯源',
  },
  {
    value: 'workflow_automation',
    label: SCENE_META.workflow_automation.label,
    description: SCENE_META.workflow_automation.description,
    tag: '流程提效',
  },
  {
    value: 'model_local',
    label: SCENE_META.model_local.label,
    description: SCENE_META.model_local.description,
    tag: '进阶可控',
  },
  {
    value: 'visual_creation',
    label: SCENE_META.visual_creation.label,
    description: SCENE_META.visual_creation.description,
    tag: '创意产出',
  },
  {
    value: 'audio_meeting',
    label: SCENE_META.audio_meeting.label,
    description: SCENE_META.audio_meeting.description,
    tag: '听写配音',
  },
];

export const SCENE_TASK_OPTIONS: Record<SceneKey, TaskQuizOption[]> = {
  coding_web: [
    {
      value: 'website_build',
      label: TASK_META.website_build.label,
      description: '用一句话描述想法直接生成网站页面、交互原型与前后端部署',
      badge: '建站主力',
    },
    {
      value: 'app_prototyping',
      label: TASK_META.app_prototyping.label,
      description: '快速做出可演示的 MVP 应用、登录与数据库原型并迭代发布',
    },
    {
      value: 'code_editing',
      label: TASK_META.code_editing.label,
      description: '在编辑器中实时补全代码、多文件改写、局部重构与项目问答',
    },
    {
      value: 'debugging',
      label: TASK_META.debugging.label,
      description: '定位复杂报错、编写/修复单元测试并做代码审查',
    },
    {
      value: 'agent_coding',
      label: TASK_META.agent_coding.label,
      description: '把完整需求拆解给智能体自主跑通改码、测试与交付流程',
    },
  ],
  office_efficiency: [
    {
      value: 'office_writing',
      label: TASK_META.office_writing.label,
      description: '长文报告起草、营销文案改写、格式整理与多文件汇总',
      badge: '高频办公',
    },
    {
      value: 'ppt_making',
      label: TASK_META.ppt_making.label,
      description: '一键将思路或文档转化为结构清晰、可微调导出的演示文稿',
    },
    {
      value: 'excel_data',
      label: TASK_META.excel_data.label,
      description: '表格清洗统计、公式处理、财务报表整理与洞察汇总',
    },
    {
      value: 'file_automation',
      label: TASK_META.file_automation.label,
      description: '批量分类命名本地文件夹、整理桌面文档并跨文档协同处理',
    },
  ],
  desktop_agent: [
    {
      value: 'desktop_automation',
      label: TASK_META.desktop_automation.label,
      description: '在电脑桌面多软件之间自主点击、读写文件并执行多步待办',
      badge: '桌面接管',
    },
    {
      value: 'browser_automation',
      label: TASK_META.browser_automation.label,
      description: '自动打开网页收集信息、填表下单、比价或定时巡检状态',
    },
  ],
  research_learning: [
    {
      value: 'literature_search',
      label: TASK_META.literature_search.label,
      description: '带精准学术引用与论文出处检索，降低模型幻觉风险',
      badge: '学术规范',
    },
    {
      value: 'paper_reading',
      label: TASK_META.paper_reading.label,
      description: '上传 PDF/文献资料做精读拆解、图表追问与多篇对比梳理',
    },
    {
      value: 'deep_research',
      label: TASK_META.deep_research.label,
      description: '自动开展多轮全网检索与交叉核验，产出结构化研究报告',
    },
  ],
  workflow_automation: [
    {
      value: 'rag_knowledge',
      label: TASK_META.rag_knowledge.label,
      description: '把内部手册、制度或专业文档切片入库并搭建精准问答机器人',
      badge: '知识库',
    },
    {
      value: 'workflow_auto',
      label: TASK_META.workflow_auto.label,
      description: '可视化连接触发器、大模型与第三方软件，实现自动化流水线',
    },
  ],
  model_local: [
    {
      value: 'api_management',
      label: TASK_META.api_management.label,
      description: '统一接入多厂商大模型 API、管理 Key 额度、切换与路由调用',
      badge: 'API 聚合',
    },
    {
      value: 'local_deployment',
      label: TASK_META.local_deployment.label,
      description: '在本地电脑或私有服务器上部署开源大模型权重与离线推理服务',
      badge: '隐私离线',
    },
  ],
  visual_creation: [
    {
      value: 'image_generation',
      label: TASK_META.image_generation.label,
      description: '根据提示词生成海报、插画、商业摄影与品牌设计稿',
      badge: '审美出图',
    },
    {
      value: 'image_editing',
      label: TASK_META.image_editing.label,
      description: '基于节点/蒙版/矢量规范执行换背景、人物一致与局部精修',
    },
    {
      value: 'video_generation',
      label: TASK_META.video_generation.label,
      description: '文字或首尾帧生成短片、控制运镜与音画同步镜头效果',
    },
  ],
  audio_meeting: [
    {
      value: 'meeting_notes',
      label: TASK_META.meeting_notes.label,
      description: '自动记录会议纪要、提炼重点决议、区分发言人与待办事项',
      badge: '职场常用',
    },
    {
      value: 'speech_to_text',
      label: TASK_META.speech_to_text.label,
      description: '将访谈、课程或音视频录音准确转写为带时间戳的文本',
    },
    {
      value: 'audio_music',
      label: TASK_META.audio_music.label,
      description: 'AI 拟真配音、多语言声音克隆、播客合成及人声歌曲创作',
    },
  ],
};

export const BUDGET_OPTIONS: DimensionQuizOption<BudgetPreference>[] = [
  {
    value: 'free_or_low_cost',
    label: '免费额度够用 / 低成本试错',
    description: '希望先零门槛或低花费试用，免费体验档能满足轻中度使用',
  },
  {
    value: 'completely_free',
    label: '尽量完全免费（不充 API、不买会员）',
    description: '倾向软件本体与日常核心算力均免费，或仅依赖本机已有硬件运行',
  },
  {
    value: 'pay_as_you_go',
    label: '接受按量付费 / 自带 API Key',
    description: '愿意为开源客户端或开发框架自行绑定 DeepSeek/OpenAI 等 Key，按用量结费',
  },
  {
    value: 'subscription_ok',
    label: '接受按月订阅，省心开箱即用',
    description: '不介意为高效主力工具付费订阅，只希望账号打包好算力，免去折腾 Key',
  },
  {
    value: 'self_host_control',
    label: '追求开源自托管 / 完全数据可控',
    description: '优先开源许可或支持自有服务器/本机私有控制，数据不随便进商业云端',
  },
  {
    value: 'no_preference',
    label: '暂不限制预算偏好',
    description: '不限免费或付费方式，优先把当前任务最能打的主力工具排出来',
    isNoPreference: true,
  },
];

export const NETWORK_OPTIONS: DimensionQuizOption<NetworkPreference>[] = [
  {
    value: 'domestic_direct',
    label: '必须或优先国内网络直连',
    description: '国内网络打开即用，不折腾跨境代理与海外支付账号',
  },
  {
    value: 'international_ok',
    label: '具备国际网络与海外账号条件',
    description: '可以稳定使用国际网络及海外信用卡/账号，优先追求海外原厂前沿能力',
  },
  {
    value: 'no_mind_setup',
    label: '网络或接口都能配合微调',
    description: '只要工具足够强，无论国内直连、兼容国内 API 还是海外连接都可接受',
  },
  {
    value: 'no_preference',
    label: '暂不考虑网络差异',
    description: '跳过网络维度打分，按任务能力与预算直接排序',
    isNoPreference: true,
  },
];

export const WORK_MODE_OPTIONS: DimensionQuizOption<WorkModePreference>[] = [
  {
    value: 'web_simple',
    label: '打开网页即用，尽量免安装',
    description: '不折腾本地环境与命令行，浏览器里直接完成任务',
  },
  {
    value: 'desktop_client',
    label: '安装独立桌面客户端 / App',
    description: '希望有桌面端可方便读写本地文件夹，同时界面直观不晦涩',
  },
  {
    value: 'ide_editor',
    label: '直接在 IDE / 代码编辑器里用',
    description: '习惯 VS Code / Cursor 类编辑器工作流，注重代码补全与工程感知',
  },
  {
    value: 'cli_terminal',
    label: '终端命令行（CLI）高频驱动',
    description: '开发者熟练使用命令行与 Git，偏好轻量高效的 CLI Agent 工作流',
  },
  {
    value: 'local_custom',
    label: '本地运行 / 私有部署 / 极客自定义',
    description: '偏好自己部署框架、接本地模型、控制工作流与高度可定制能力',
  },
  {
    value: 'no_preference',
    label: '不限软件形态与部署方式',
    description: '网页、桌面、IDE 或命令行均可，由最适合任务的工具决定',
    isNoPreference: true,
  },
];

export const HARD_CONSTRAINT_OPTIONS: Record<
  'budget' | 'network' | 'workMode',
  HardConstraintOption
> = {
  budget: {
    key: 'mustCompletelyFree',
    label: '硬性筛选：必须完全免费（软件免费 + 模型免付费或用本机硬件）',
    description: '严格排除需订阅、仅有有限试用额度、或必须充值自带付费 API Key 的工具；若无则诚实留空',
  },
  network: {
    key: 'mustDomesticDirect',
    label: '硬性筛选：必须国内网络直连可用',
    description: '严格拦截需国际网络的工具，以及国内网络状态尚未核实的工具（不默认假定可直连）',
  },
  workMode: {
    key: 'mustLocalRun',
    label: '硬性筛选：必须支持本地运行或私有化部署',
    description: '严格排除仅支持云端 SaaS / 云端 Agent 或依赖官方云端运行的工具；未核实工具不入围',
  },
};

export const DEFAULT_MATCHER_ANSWERS: MatcherAnswersV2 = {
  scene: 'coding_web',
  task: 'website_build',
  budget: 'free_or_low_cost',
  network: 'domestic_direct',
  workMode: 'web_simple',
  hardConstraints: {
    mustLocalRun: false,
    mustDomesticDirect: false,
    mustCompletelyFree: false,
  },
};

export function evaluateMatcherReport(
  tools: NavTool[],
  answers: MatcherAnswersV2,
): MatcherRecommendationReport {
  return evaluateToolMatches(tools, answers);
}
