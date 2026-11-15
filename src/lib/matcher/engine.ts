import type { NavTool, NavToolCategory } from '@/data/nav-tools';
import { mergeNavToolsWithCapabilities } from '@/data/matcher/tool-profiles';
import type {
  BudgetPreference,
  CandidateEvaluation,
  ConfidenceLevel,
  DimensionScoreDetail,
  MatcherAnswersV2,
  MatcherHardConstraints,
  MatcherRecommendationReport,
  MergedToolProfile,
  NetworkPreference,
  SceneKey,
  TaskKey,
  ToolRole,
  WorkModePreference,
} from '@/data/matcher/types';

// ============================================================================
// 任务与场景元数据（仅依赖 TaskKey / SceneKey / NavToolCategory，禁止硬编码工具 ID）
// ============================================================================

export const INFRASTRUCTURE_PRIMARY_TASKS = new Set<TaskKey>([
  'api_management',
  'local_deployment',
  'workflow_auto',
  'rag_knowledge',
]);

export interface TaskMetadata {
  key: TaskKey;
  label: string;
  scene: SceneKey;
  primaryCategories: NavToolCategory[];
}

export const SCENE_META: Record<
  SceneKey,
  { label: string; shortLabel: string; description: string; categories: NavToolCategory[] }
> = {
  coding_web: {
    label: '编程开发与做网站/做应用',
    shortLabel: '编程与建站',
    description: '自然语言建站、应用原型、IDE 编程、Bug 排查与自主 Coding Agent',
    categories: ['app-builder', 'coding'],
  },
  office_efficiency: {
    label: '日常办公与文档表格整理',
    shortLabel: '日常办公',
    description: '长文写作、PPT 制作、Excel 数据处理与本地文件批量整理',
    categories: ['desktop-agents', 'app-builder', 'audio-productivity'],
  },
  research_learning: {
    label: '学术文献检索与深度研究',
    shortLabel: '学术与调研',
    description: '文献查找追踪、论文精读拆解、联网核查与专题深度研究',
    categories: ['research', 'audio-productivity'],
  },
  workflow_automation: {
    label: '工作流搭建与知识库自动化',
    shortLabel: '工作流与 RAG',
    description: '企业/个人知识库问答、低代码流程编排、机器人与定时工作流',
    categories: ['workflow', 'desktop-agents'],
  },
  model_local: {
    label: '多模型 API 接入与本地部署',
    shortLabel: 'API 与本地部署',
    description: '多模型 API 路由管理、本机离线大模型运行与私有推理环境搭建',
    categories: ['api-compute', 'workflow', 'coding'],
  },
  visual_creation: {
    label: 'AI 绘图、修图与视频创作',
    shortLabel: '视觉与视频',
    description: 'AI 商业生图、可控修图改图、文生视频与镜头运镜创作',
    categories: ['multimodal-visual', 'workflow'],
  },
  audio_meeting: {
    label: '会议纪要、语音转写与音频创作',
    shortLabel: '音频与会议',
    description: '会议录音转文字、纪要行动项整理、配音克隆与 AI 音乐制作',
    categories: ['audio-productivity'],
  },
  desktop_agent: {
    label: '桌面/浏览器跨应用自主执行',
    shortLabel: '桌面与浏览器代理',
    description: '自动操控桌面软件与浏览器填表、比价、跨应用执行长周期任务',
    categories: ['desktop-agents'],
  },
};

export const TASK_META: Record<TaskKey, TaskMetadata> = {
  website_build: {
    key: 'website_build',
    label: '自然语言生成网站或 Web 应用',
    scene: 'coding_web',
    primaryCategories: ['app-builder', 'coding'],
  },
  app_prototyping: {
    key: 'app_prototyping',
    label: '应用原型设计与全栈快速搭建',
    scene: 'coding_web',
    primaryCategories: ['app-builder', 'coding'],
  },
  code_editing: {
    key: 'code_editing',
    label: 'IDE 日常代码编写与重构',
    scene: 'coding_web',
    primaryCategories: ['coding'],
  },
  debugging: {
    key: 'debugging',
    label: '复杂 Debug、修测试与代码审查',
    scene: 'coding_web',
    primaryCategories: ['coding'],
  },
  agent_coding: {
    key: 'agent_coding',
    label: 'AI Agent 多文件自主开发交付',
    scene: 'coding_web',
    primaryCategories: ['coding', 'desktop-agents'],
  },
  desktop_automation: {
    key: 'desktop_automation',
    label: '桌面跨应用操作与长任务代办',
    scene: 'desktop_agent',
    primaryCategories: ['desktop-agents'],
  },
  browser_automation: {
    key: 'browser_automation',
    label: '浏览器自动填表、比价与网页巡检',
    scene: 'desktop_agent',
    primaryCategories: ['desktop-agents', 'workflow'],
  },
  office_writing: {
    key: 'office_writing',
    label: '办公文档写作、方案起草与润色',
    scene: 'office_efficiency',
    primaryCategories: ['desktop-agents', 'audio-productivity', 'research'],
  },
  ppt_making: {
    key: 'ppt_making',
    label: 'PPT 演示文稿大纲与排版生成',
    scene: 'office_efficiency',
    primaryCategories: ['app-builder', 'desktop-agents'],
  },
  excel_data: {
    key: 'excel_data',
    label: 'Excel 表格整理与数据分析处理',
    scene: 'office_efficiency',
    primaryCategories: ['desktop-agents'],
  },
  file_automation: {
    key: 'file_automation',
    label: '本地文件夹归类与办公文件批处理',
    scene: 'office_efficiency',
    primaryCategories: ['desktop-agents'],
  },
  meeting_notes: {
    key: 'meeting_notes',
    label: '会议记录、重点整理与待办抽取',
    scene: 'audio_meeting',
    primaryCategories: ['audio-productivity'],
  },
  speech_to_text: {
    key: 'speech_to_text',
    label: '高精度语音转文字与多语种听写',
    scene: 'audio_meeting',
    primaryCategories: ['audio-productivity'],
  },
  literature_search: {
    key: 'literature_search',
    label: '学术论文检索、追踪与可信溯源',
    scene: 'research_learning',
    primaryCategories: ['research'],
  },
  paper_reading: {
    key: 'paper_reading',
    label: '长篇论文精读、笔记整理与对照问答',
    scene: 'research_learning',
    primaryCategories: ['research', 'audio-productivity'],
  },
  deep_research: {
    key: 'deep_research',
    label: '深度联网调研与多源报告综合',
    scene: 'research_learning',
    primaryCategories: ['research', 'desktop-agents'],
  },
  image_generation: {
    key: 'image_generation',
    label: 'AI 绘图生成与设计素材产出',
    scene: 'visual_creation',
    primaryCategories: ['multimodal-visual', 'workflow'],
  },
  image_editing: {
    key: 'image_editing',
    label: 'AI 局部修图、矢量化与可控改图',
    scene: 'visual_creation',
    primaryCategories: ['multimodal-visual', 'workflow'],
  },
  video_generation: {
    key: 'video_generation',
    label: 'AI 视频生成、分镜控制与镜头创作',
    scene: 'visual_creation',
    primaryCategories: ['multimodal-visual'],
  },
  audio_music: {
    key: 'audio_music',
    label: 'AI 语音合成、声音克隆与音乐创作',
    scene: 'audio_meeting',
    primaryCategories: ['audio-productivity'],
  },
  api_management: {
    key: 'api_management',
    label: '多模型 API 聚合路由与 Key 管理',
    scene: 'model_local',
    primaryCategories: ['api-compute', 'coding'],
  },
  rag_knowledge: {
    key: 'rag_knowledge',
    label: '企业/个人 RAG 知识库问答搭建',
    scene: 'workflow_automation',
    primaryCategories: ['workflow', 'audio-productivity'],
  },
  workflow_auto: {
    key: 'workflow_auto',
    label: '低代码工作流编排与定时自动化',
    scene: 'workflow_automation',
    primaryCategories: ['workflow', 'desktop-agents'],
  },
  local_deployment: {
    key: 'local_deployment',
    label: '本地开源大模型部署与离线推理',
    scene: 'model_local',
    primaryCategories: ['workflow', 'research'],
  },
};

export const SCORE_WEIGHTS = {
  scene: 30,
  task: 25,
  environment: 15,
  budget: 12,
  network: 10,
  difficulty: 8,
} as const;

export const ENGINE_NOTICE =
  '海兰 AI 规则匹配评分（0~100）仅衡量工具能力画像与您当前 5 项条件之间的贴合程度，用于辅助决策，不代表实际使用成功率；所有缺失或官方未明确公开的字段均按“待核实/未知”处理，不默认免费、不默认国内直连、也不默认本地可运行。';

// ============================================================================
// 维度评分细则（全部纯基于 MergedToolProfile 通用字段计算）
// ============================================================================

function clampScore(value: number): number {
  return Math.max(0, Math.min(5, Number(value.toFixed(2))));
}

function scoreSceneDimension(tool: MergedToolProfile, answers: MatcherAnswersV2): DimensionScoreDetail {
  const role: ToolRole | 'none' = tool.taskRoles[answers.task] ?? 'none';
  const taskMeta = TASK_META[answers.task];
  const sceneMeta = SCENE_META[answers.scene];
  const isInfraTask = INFRASTRUCTURE_PRIMARY_TASKS.has(answers.task);

  let rawScore = 0.5;
  let note = '该任务并非工具定位方向';

  if (role === 'primary') {
    rawScore = 4.2;
    note = `明确承担「${taskMeta.label}」主力工具角色`;
  } else if (role === 'infrastructure') {
    rawScore = isInfraTask ? 4.0 : 1.6;
    note = isInfraTask
      ? '作为基础设施工具可直接承接当前技术底座任务'
      : '定位为底层基础设施/协议组件，不适合作为非技术终端任务主力';
  } else if (role === 'assistant') {
    rawScore = 2.2;
    note = `可作为「${taskMeta.label}」的配套辅助或协同工具`;
  }

  const categoryMatch =
    taskMeta.primaryCategories.includes(tool.category as NavToolCategory) ||
    sceneMeta.categories.includes(tool.category as NavToolCategory);
  if (categoryMatch && (role === 'primary' || (role === 'infrastructure' && isInfraTask))) {
    rawScore += 0.5;
  }

  const sameScenePrimaryCount = tool.primaryTasks.filter(
    (tk) => TASK_META[tk]?.scene === answers.scene,
  ).length;
  if (sameScenePrimaryCount >= 2 && (role === 'primary' || (role === 'infrastructure' && isInfraTask))) {
    rawScore += 0.3;
  } else if (sameScenePrimaryCount >= 1 && role === 'primary') {
    rawScore += 0.2;
  }

  rawScore = clampScore(rawScore);

  return {
    key: 'scene',
    label: '场景角色匹配度',
    weight: SCORE_WEIGHTS.scene,
    applicable: true,
    rawScore,
    weightedContribution: 0,
    isUnknownField: false,
    note,
  };
}

function scoreTaskDimension(tool: MergedToolProfile, answers: MatcherAnswersV2): DimensionScoreDetail {
  const cap = tool.taskCapabilities[answers.task];
  if (cap === undefined) {
    return {
      key: 'task',
      label: '任务胜任度',
      weight: SCORE_WEIGHTS.task,
      applicable: true,
      rawScore: 2.5,
      weightedContribution: 0,
      isUnknownField: true,
      note: '该工具在此细分任务的能力尚未完成核实或未申报能力分，按中性值 2.5 处理',
    };
  }

  return {
    key: 'task',
    label: '任务胜任度',
    weight: SCORE_WEIGHTS.task,
    applicable: true,
    rawScore: cap,
    weightedContribution: 0,
    isUnknownField: false,
    note: `任务专项能力评分 ${cap}/5`,
  };
}

function scoreEnvironmentDimension(
  tool: MergedToolProfile,
  workMode: WorkModePreference,
  unmetPreferences: string[],
  missingInfoNotes: string[],
): DimensionScoreDetail {
  if (workMode === 'no_preference') {
    return {
      key: 'environment',
      label: '运行环境与形态',
      weight: SCORE_WEIGHTS.environment,
      applicable: false,
      rawScore: 0,
      weightedContribution: 0,
      isUnknownField: false,
      note: '用户未限制形态/运行方式，本维度不计入总权重',
    };
  }

  if (tool.interfaces.length === 0 || tool.deploymentModes.length === 0) {
    missingInfoNotes.push('运行界面或部署方式字段缺失，环境匹配度按中性值 2.5 处理');
    return {
      key: 'environment',
      label: '运行环境与形态',
      weight: SCORE_WEIGHTS.environment,
      applicable: true,
      rawScore: 2.5,
      weightedContribution: 0,
      isUnknownField: true,
      note: '运行界面/部署形态信息未核实（中性值 2.5）',
    };
  }

  const hasIf = (name: string) => tool.interfaces.includes(name as never);
  const hasMode = (name: string) => tool.deploymentModes.includes(name as never);

  let rawScore = 2.0;
  let note = '与首选使用形态部分贴合';

  switch (workMode) {
    case 'web_simple': {
      if (hasIf('web') && (hasMode('cloud_saas') || hasMode('cloud_agent'))) {
        rawScore = 5;
        note = '打开网页即可使用，无需复杂本地安装';
      } else if (hasIf('web')) {
        rawScore = 4.2;
        note = '提供网页版入口，整体上手轻量';
      } else if (hasIf('desktop')) {
        rawScore = 2.4;
        note = '需下载桌面客户端安装，非纯网页即开即用';
        unmetPreferences.push('您偏好“打开网页即用”，但该工具主要以桌面客户端形式使用');
      } else {
        rawScore = 0.8;
        note = '依赖命令行、API 或本地服务部署，不适合纯网页轻量体验';
        unmetPreferences.push('您偏好“打开网页即用”，但该工具需要命令行或开发者配置');
      }
      break;
    }
    case 'desktop_client': {
      if (hasIf('desktop') || hasIf('mobile')) {
        rawScore = 5;
        note = '提供独立桌面/移动端客户端';
      } else if (hasIf('ide')) {
        rawScore = 4.0;
        note = '以桌面 IDE 客户端形态运行';
      } else if (hasIf('web')) {
        rawScore = 2.5;
        note = '主要为网页 SaaS 形态，暂无独立原生桌面端';
        unmetPreferences.push('您偏好“独立桌面客户端”，但该工具主要通过网页端运行');
      } else {
        rawScore = 1.0;
        note = '主要通过命令行或 API 接入，无常规图形化桌面软件';
        unmetPreferences.push('您偏好“独立桌面客户端”，但该工具无常见图形桌面入口');
      }
      break;
    }
    case 'ide_editor': {
      if (hasIf('ide')) {
        rawScore = 5;
        note = '原生定位为 AI IDE 或深度嵌入代码编辑器';
      } else if (hasIf('cli')) {
        rawScore = 3.4;
        note = '命令行终端工具，可搭配任意 IDE 终端窗口协同工作';
      } else if (hasIf('desktop')) {
        rawScore = 2.6;
        note = '独立桌面应用，非编辑器内原生补全/改写流';
        unmetPreferences.push('您偏好“IDE/代码编辑器内工作”，该工具为独立外部客户端');
      } else {
        rawScore = 1.8;
        note = '以网页端或 API 形态为主，未深度接入本地 IDE';
        unmetPreferences.push('您偏好“IDE/代码编辑器内工作”，该工具未提供 IDE 插件或编辑器形态');
      }
      break;
    }
    case 'cli_terminal': {
      if (hasIf('cli')) {
        rawScore = 5;
        note = '原生支持命令行（CLI）自动化工作流';
      } else if (hasIf('api') || hasIf('ide')) {
        rawScore = 3.0;
        note = '支持 API 或工程环境接入，但非纯粹 CLI 首选';
      } else {
        rawScore = 1.0;
        note = '以图形界面（网页/桌面端）为主，非命令行工作流';
        unmetPreferences.push('您偏好“命令行终端（CLI）”，但该工具以图形界面操作为主');
      }
      break;
    }
    case 'local_custom': {
      if (hasMode('local_inference') || hasMode('self_hosted')) {
        rawScore = 5;
        note = '支持本地推理或私有化自托管部署，可高度自定义';
      } else if (hasMode('local_client') && tool.licenseType === 'open_source') {
        rawScore = 4.6;
        note = '开源本机客户端，支持自定义接入模型与工作区控制';
      } else if (hasMode('local_client')) {
        rawScore = 3.4;
        note = '支持本地客户端安装，但部分能力或模型仍依赖官方云端';
      } else {
        rawScore = 0.8;
        note = '纯云端托管运行，不支持本地私有部署或底层深度定制';
        unmetPreferences.push('您偏好“本地运行/极客自定义”，但该工具仅提供云端托管形态');
      }
      break;
    }
  }

  return {
    key: 'environment',
    label: '运行环境与形态',
    weight: SCORE_WEIGHTS.environment,
    applicable: true,
    rawScore: clampScore(rawScore),
    weightedContribution: 0,
    isUnknownField: false,
    note,
  };
}

function scoreBudgetDimension(
  tool: MergedToolProfile,
  budget: BudgetPreference,
  unmetPreferences: string[],
  missingInfoNotes: string[],
): DimensionScoreDetail {
  if (budget === 'no_preference') {
    return {
      key: 'budget',
      label: '预算与付费模式',
      weight: SCORE_WEIGHTS.budget,
      applicable: false,
      rawScore: 0,
      weightedContribution: 0,
      isUnknownField: false,
      note: '用户未限制预算方式，本维度不计入总权重',
    };
  }

  if (tool.softwarePricingModel === 'unknown' || tool.modelApiBilling === 'unknown') {
    missingInfoNotes.push('该工具软件收费模式或模型算力计费方式尚未完全核实（按中性值 2.5 计算）');
    return {
      key: 'budget',
      label: '预算与付费模式',
      weight: SCORE_WEIGHTS.budget,
      applicable: true,
      rawScore: 2.5,
      weightedContribution: 0,
      isUnknownField: true,
      note: '收费或模型 API 计费细则未核实（中性值 2.5）',
    };
  }

  const sw = tool.softwarePricingModel;
  const api = tool.modelApiBilling;
  let rawScore = 2.5;
  let note = '';

  switch (budget) {
    case 'completely_free': {
      if (sw === 'free' && (api === 'included_free' || api === 'local_hardware')) {
        rawScore = 5;
        note =
          api === 'local_hardware'
            ? '软件开源免费且本地自备硬件即可零 API 费用运行'
            : '软件与默认模型使用均完全免费';
      } else if (sw === 'free' && api === 'included_quota') {
        rawScore = 3.8;
        note = '软件本身免费并赠送部分免费调用额度，超出仍有限额';
        unmetPreferences.push('您希望“完全免费”，该工具免费额度存在日/月上限');
      } else if (sw === 'freemium' && api === 'included_quota') {
        rawScore = 3.4;
        note = '提供基础免费档，但高频或高级功能需付费解锁';
        unmetPreferences.push('您希望“完全免费”，该工具仅提供受限免费试用额度');
      } else if (sw === 'free' && api === 'byok_payg') {
        rawScore = 2.0;
        note = '客户端/工具本体免费，但模型算力需自备付费 API Key 或本地部署';
        unmetPreferences.push('软件免费但模型需自带 API Key（非零成本开箱白嫖）');
      } else if (sw === 'freemium' && api === 'byok_payg') {
        rawScore = 1.5;
        note = '部分功能受限免费且模型算力仍需自带 API Key';
        unmetPreferences.push('需兼顾会员限额与自带模型 API 成本');
      } else {
        rawScore = 0.4;
        note = '属于纯付费订阅或买断型产品，无长期免费使用档';
        unmetPreferences.push('您希望“完全免费”，该工具要求付费订阅');
      }
      break;
    }
    case 'free_or_low_cost': {
      if (sw === 'free' && (api === 'included_free' || api === 'local_hardware')) {
        rawScore = 5;
        note = '软件免费且无强制云端充值门槛';
      } else if ((sw === 'free' || sw === 'freemium') && api === 'included_quota') {
        rawScore = 4.6;
        note = '提供可观免费体验额度，轻中度试错成本低';
      } else if (sw === 'free' && api === 'byok_payg') {
        rawScore = 3.9;
        note = '软件开源免费，按量调用平价 API 成本可控';
      } else if (sw === 'freemium' && api === 'byok_payg') {
        rawScore = 3.1;
        note = '基础版免费，扩展用量需自备 API Key';
      } else {
        rawScore = 1.0;
        note = '需直接开通月付/年付订阅，低预算试错灵活性较差';
        unmetPreferences.push('您偏好“免费额度够用/低成本试错”，该工具以直接订阅为主');
      }
      break;
    }
    case 'pay_as_you_go': {
      if (api === 'byok_payg') {
        rawScore = sw === 'free' ? 5 : 4.6;
        note = '支持自带 Key / 按实际 token 消耗付费，避免固定月租浪费';
      } else if (sw === 'freemium' && api === 'included_quota') {
        rawScore = 3.9;
        note = '提供免费起步与弹性积分/升级方案，支持轻度按需升级';
      } else if (api === 'included_free' || api === 'local_hardware') {
        rawScore = 4.4;
        note = '无固定订阅压力，成本极低或按本地硬件运行';
      } else {
        rawScore = 1.8;
        note = '以固定周期会员订阅为主，而非纯粹按量按次计费';
        unmetPreferences.push('您偏好“按量付费/自带 Key”，但该工具采用包月/包年订阅制');
      }
      break;
    }
    case 'subscription_ok': {
      if (api === 'included_quota' || api === 'subscription_included') {
        rawScore = 5;
        note = '官方一站式打包软件与模型配额，付费后省心即用';
      } else if (api === 'included_free') {
        rawScore = 4.6;
        note = '官方一站式可用，无需单独维护多平台 API Key';
      } else if (api === 'byok_payg') {
        rawScore = 3.1;
        note = '需自行申请并配置模型 API Key，不如官方打包订阅省心';
        unmetPreferences.push('您倾向“订阅省心不折腾”，但该工具需要自行管理模型 API Key');
      } else {
        rawScore = 2.6;
        note = '偏向自部署本地硬件模式，需一定手动维护成本';
        unmetPreferences.push('您倾向“付费省心开箱用”，但该工具需要本地部署维护');
      }
      break;
    }
    case 'self_host_control': {
      const isLocalOrSelf =
        tool.deploymentModes.includes('self_hosted') ||
        tool.deploymentModes.includes('local_inference') ||
        tool.deploymentModes.includes('local_client');
      if (tool.licenseType === 'open_source' && isLocalOrSelf) {
        rawScore = 5;
        note = '开源且支持本地或私有环境控制，数据自主度高';
      } else if (tool.licenseType === 'open_source') {
        rawScore = 4.4;
        note = '开源许可，规则与生态透明可控';
      } else if (tool.deploymentModes.includes('self_hosted')) {
        rawScore = 4.2;
        note = '支持私有部署（核心部分或社区版可控）';
      } else if (api === 'byok_payg') {
        rawScore = 2.8;
        note = '支持自控 API 钥匙，但工具本身为闭源/商业服务';
      } else {
        rawScore = 1.2;
        note = '闭源云端 SaaS 服务，数据和模型路由受平台托管限制';
        unmetPreferences.push('您偏好“开源自托管/完全可控”，但该工具属于闭源托管方案');
      }
      break;
    }
  }

  return {
    key: 'budget',
    label: '预算与付费模式',
    weight: SCORE_WEIGHTS.budget,
    applicable: true,
    rawScore: clampScore(rawScore),
    weightedContribution: 0,
    isUnknownField: false,
    note,
  };
}

function scoreNetworkDimension(
  tool: MergedToolProfile,
  network: NetworkPreference,
  unmetPreferences: string[],
  missingInfoNotes: string[],
): DimensionScoreDetail {
  if (network === 'no_preference') {
    return {
      key: 'network',
      label: '国内网络可用性',
      weight: SCORE_WEIGHTS.network,
      applicable: false,
      rawScore: 0,
      weightedContribution: 0,
      isUnknownField: false,
      note: '用户未限制网络环境，本维度不计入总权重',
    };
  }

  if (tool.networkAvailability === 'unknown') {
    missingInfoNotes.push('该工具在国内网络的直连可用性尚未核实（按中性值 2.5 处理）');
    return {
      key: 'network',
      label: '国内网络可用性',
      weight: SCORE_WEIGHTS.network,
      applicable: true,
      rawScore: 2.5,
      weightedContribution: 0,
      isUnknownField: true,
      note: '国内网络访问条件未核实（中性值 2.5）',
    };
  }

  let rawScore = 3;
  let note = '';

  switch (network) {
    case 'domestic_direct': {
      if (tool.networkAvailability === 'domestic_direct') {
        rawScore = 5;
        note = '国内网络可稳定直连访问，无需复杂代理';
      } else if (tool.networkAvailability === 'partial_or_byok') {
        rawScore = 3.2;
        note = '软件本身可国内使用，但直连体验取决于所接入模型服务（如搭配 DeepSeek/硅基流动或本地模型可直连）';
        unmetPreferences.push('需搭配国内 API（如 DeepSeek/硅基流动）或本地模型才能全程直连');
      } else {
        rawScore = 0.4;
        note = '官方服务或登录流程依赖国际网络环境，国内直连受阻';
        unmetPreferences.push('您偏好“国内直连无门槛”，但该工具依赖国际网络环境与海外账号');
      }
      break;
    }
    case 'international_ok': {
      if (tool.networkAvailability === 'international_required') {
        rawScore = 5;
        note = '具备国际网络条件时可完整发挥海外原厂服务能力';
      } else if (tool.networkAvailability === 'partial_or_byok') {
        rawScore = 4.6;
        note = '国际与国内模型路线均可兼容切换';
      } else {
        rawScore = 4.5;
        note = '国内直连与国际访问均较顺畅';
      }
      break;
    }
    case 'no_mind_setup': {
      if (tool.networkAvailability === 'domestic_direct') {
        rawScore = 5;
        note = '国内直接可用，零网络折腾成本';
      } else if (tool.networkAvailability === 'partial_or_byok') {
        rawScore = 4.8;
        note = '可灵活通过自定义 API 地址、兼容接口或本地运行适配网络环境';
      } else {
        rawScore = 4.0;
        note = '需具备国际网络或合规代理条件即可启用';
      }
      break;
    }
  }

  return {
    key: 'network',
    label: '国内网络可用性',
    weight: SCORE_WEIGHTS.network,
    applicable: true,
    rawScore: clampScore(rawScore),
    weightedContribution: 0,
    isUnknownField: false,
    note,
  };
}

function scoreDifficultyDimension(
  tool: MergedToolProfile,
  answers: MatcherAnswersV2,
): DimensionScoreDetail {
  const diff = tool.difficultyByTask?.[answers.task] ?? tool.difficulty;
  let rawScore = 3.5;

  if (answers.workMode === 'web_simple') {
    rawScore = diff === 1 ? 5 : diff === 2 ? 4.4 : diff === 3 ? 2.8 : diff === 4 ? 1.6 : 1.0;
  } else if (answers.workMode === 'desktop_client') {
    rawScore = diff === 1 ? 5 : diff === 2 ? 4.8 : diff === 3 ? 4.0 : diff === 4 ? 2.4 : 1.4;
  } else if (answers.workMode === 'ide_editor') {
    rawScore = diff <= 3 ? 4.8 : diff === 4 ? 3.8 : 2.6;
  } else if (answers.workMode === 'cli_terminal' || answers.workMode === 'local_custom') {
    rawScore = diff <= 4 ? 4.8 : 4.2;
  } else {
    rawScore = diff === 1 ? 5 : diff === 2 ? 4.6 : diff === 3 ? 3.8 : diff === 4 ? 2.6 : 1.8;
  }

  return {
    key: 'difficulty',
    label: '上手门槛适配',
    weight: SCORE_WEIGHTS.difficulty,
    applicable: true,
    rawScore: clampScore(rawScore),
    weightedContribution: 0,
    isUnknownField: false,
    note: `上手难度 ${diff}/5（1 为零门槛，5 为硬核工程部署）`,
  };
}

// ============================================================================
// 硬性条件前置过滤与数据完整度计算
// ============================================================================

function checkHardConstraints(
  tool: MergedToolProfile,
  constraints: MatcherHardConstraints | undefined,
): { passed: boolean; failedReasons: string[]; unverifiedReasons: string[] } {
  const failedReasons: string[] = [];
  const unverifiedReasons: string[] = [];

  if (!constraints) {
    return { passed: true, failedReasons, unverifiedReasons };
  }

  if (constraints.mustLocalRun) {
    if (tool.deploymentModes.length === 0) {
      unverifiedReasons.push('未核实是否支持本地运行或私有化部署');
    } else {
      const hasLocalInferenceOrSelfHosted =
        tool.deploymentModes.includes('local_inference') ||
        tool.deploymentModes.includes('self_hosted');
      const isPureLocalClient =
        tool.deploymentModes.includes('local_client') &&
        !tool.deploymentModes.includes('cloud_saas') &&
        !tool.deploymentModes.includes('cloud_agent') &&
        tool.modelApiBilling !== 'included_quota' &&
        tool.modelApiBilling !== 'subscription_included';

      if (!hasLocalInferenceOrSelfHosted && !isPureLocalClient) {
        if (tool.deploymentModes.includes('local_client')) {
          failedReasons.push('仅为连云桌面客户端，核心模型与服务依赖官方云端运行，不满足严格本地/私有运行要求');
        } else {
          failedReasons.push('仅支持云端 SaaS / 云端 Agent 运行，不支持本地运行或私有部署');
        }
      }
    }
  }

  if (constraints.mustDomesticDirect) {
    if (tool.networkAvailability === 'unknown') {
      unverifiedReasons.push('未核实国内网络直连可用性');
    } else if (tool.networkAvailability === 'international_required') {
      failedReasons.push('官方服务依赖国际网络环境，不满足“必须国内网络直连”硬性要求');
    }
  }

  if (constraints.mustCompletelyFree) {
    if (tool.softwarePricingModel === 'unknown' || tool.modelApiBilling === 'unknown') {
      unverifiedReasons.push('未核实软件收费模式或模型算力计费方式');
    } else {
      const trulyZeroCost =
        tool.softwarePricingModel === 'free' &&
        (tool.modelApiBilling === 'included_free' || tool.modelApiBilling === 'local_hardware');
      if (!trulyZeroCost) {
        if (tool.softwarePricingModel === 'free' && tool.modelApiBilling === 'byok_payg') {
          failedReasons.push('软件开源免费，但模型需自带付费 API Key 或算力，不满足“完全零付费”硬约束');
        } else if (tool.modelApiBilling === 'included_quota') {
          failedReasons.push('仅含有限免费试用额度，超出或高配功能需付费，不满足“完全免费”硬约束');
        } else {
          failedReasons.push('属于订阅付费或阶梯收费产品，不满足“完全免费”硬约束');
        }
      }
    }
  }

  return {
    passed: failedReasons.length === 0 && unverifiedReasons.length === 0,
    failedReasons,
    unverifiedReasons,
  };
}

function computeDataCompleteness(tool: MergedToolProfile, task: TaskKey): number {
  const checks = [
    tool.taskRoles[task] !== undefined,
    tool.taskCapabilities[task] !== undefined,
    tool.interfaces.length > 0,
    tool.deploymentModes.length > 0,
    tool.licenseType !== 'unknown',
    tool.softwarePricingModel !== 'unknown',
    tool.modelApiBilling !== 'unknown',
    tool.freeQuotaNote.trim().length > 0,
    tool.networkAvailability !== 'unknown',
    tool.advantages.length > 0 && tool.limitations.length > 0 && Boolean(tool.sourceUrl || tool.officialUrl),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

function computeConfidence(
  tool: MergedToolProfile,
  dataCompleteness: number,
  breakdown: DimensionScoreDetail[],
): ConfidenceLevel {
  const unknownCount = breakdown.filter((d) => d.applicable && d.isUnknownField).length;
  if (tool.dataConfidence === 'low' || dataCompleteness < 70 || unknownCount >= 2) {
    return 'low';
  }
  if (tool.dataConfidence === 'medium' || dataCompleteness < 90 || unknownCount === 1) {
    return 'medium';
  }
  return 'high';
}

// ============================================================================
// 费用、硬件、网络与推荐理由中文说明生成器
// ============================================================================

function formatSoftwareCostLabel(tool: MergedToolProfile): string {
  if (tool.softwarePricingModel === 'unknown') {
    return '软件收费情况待核实（官方暂未披露完整公开定价）';
  }
  const licensePrefix =
    tool.licenseType === 'open_source'
      ? '开源免费'
      : tool.licenseType === 'source_available'
        ? '源码可见'
        : tool.licenseType === 'proprietary'
          ? '闭源商业产品'
          : '许可类型待核实';

  switch (tool.softwarePricingModel) {
    case 'free':
      return `${licensePrefix}（软件本体免费使用）`;
    case 'freemium':
      return `${licensePrefix}（基础功能或体验档免费，进阶按订阅/额度收费）`;
    case 'paid_subscription':
      return `${licensePrefix}（需付费月/年订阅方可使用）`;
    case 'one_time':
      return `${licensePrefix}（需一次性买断授权）`;
  }
}

function formatApiCostLabel(tool: MergedToolProfile): string {
  const note = tool.freeQuotaNote?.trim();
  const base = (() => {
    switch (tool.modelApiBilling) {
      case 'included_free':
        return '内置模型能力免费提供（无额外 API 充值要求）';
      case 'included_quota':
        return '软件内含官方免费配额，高频或高阶模型需订阅或加购积分';
      case 'byok_payg':
        return '需自备模型 API Key 按量付费（或自行接入本地 Ollama/vLLM）';
      case 'subscription_included':
        return '模型算力打包在付费订阅档位内，需开通对应会员后使用';
      case 'local_hardware':
        return '完全依托本机硬件算力运行开源权重，无需向云端 API 供应商付费';
      case 'unknown':
        return '模型算力与 API 费用细则尚未核实，建议先查看官网说明';
    }
  })();
  return note ? `${base}。明细：${note}` : base;
}

function formatHardwareLabel(tool: MergedToolProfile): string {
  const modes = tool.deploymentModes;
  if (modes.includes('local_inference')) {
    return '需本机或自备服务器硬件算力（建议 16GB+ 内存及独立 GPU 显存，具体取决于加载的模型尺寸）';
  }
  if (modes.includes('self_hosted') && !modes.includes('cloud_saas')) {
    return '支持本机或自有服务器 Docker/源码自托管；普通配置即可跑服务框架，若同时加载本地模型则需要独立显卡';
  }
  if (modes.includes('local_client') && (modes.includes('cloud_saas') || modes.includes('cloud_agent'))) {
    return '需安装本地桌面客户端，核心模型推理在云端完成，对本机 GPU 无硬性要求';
  }
  if (modes.includes('local_client')) {
    return '需在本机安装桌面/终端客户端；若接入云端 API 则无显卡要求，若接本地模型则需相应内存/显存';
  }
  return '云端运行，浏览器即可打开使用，对本机 CPU/显卡无特殊要求';
}

function formatNetworkLabel(tool: MergedToolProfile): string {
  switch (tool.networkAvailability) {
    case 'domestic_direct':
      return '国内网络通常可直接访问使用';
    case 'partial_or_byok':
      return '客户端/框架本体支持国内运行，是否可直连取决于所接入的模型服务商（建议搭配 DeepSeek、硅基流动或本地模型）';
    case 'international_required':
      return '依赖国际网络环境访问官方服务或完成账号认证';
    case 'unknown':
      return '国内网络直连稳定性与海外依赖尚未核实';
  }
}

function buildDynamicReasons(
  tool: MergedToolProfile,
  answers: MatcherAnswersV2,
  breakdown: DimensionScoreDetail[],
  roleForTask: ToolRole | 'none',
): string[] {
  const reasons: string[] = [];
  const taskLabel = TASK_META[answers.task].label;
  const cap = tool.taskCapabilities[answers.task];

  if (roleForTask === 'primary') {
    reasons.push(`专门覆盖「${taskLabel}」主流程，专项能力达 ${cap ?? '待核实'}/5`);
  } else if (roleForTask === 'infrastructure') {
    reasons.push(
      INFRASTRUCTURE_PRIMARY_TASKS.has(answers.task)
        ? `在「${taskLabel}」技术底座与基础设施链路中具备 ${cap ?? '待核实'}/5 专项能力`
        : `可作为「${taskLabel}」背后的网关/底座协同，不直接取代前端主力产品`,
    );
  } else if (roleForTask === 'assistant') {
    reasons.push(`在「${taskLabel}」任务中承担辅助或局部提效角色`);
  }

  const envDim = breakdown.find((d) => d.key === 'environment');
  if (envDim?.applicable && envDim.rawScore >= 4.2) {
    reasons.push(envDim.note);
  }

  const budgetDim = breakdown.find((d) => d.key === 'budget');
  if (budgetDim?.applicable && budgetDim.rawScore >= 4.0) {
    reasons.push(budgetDim.note);
  }

  const netDim = breakdown.find((d) => d.key === 'network');
  if (netDim?.applicable && netDim.rawScore >= 4.5) {
    reasons.push(netDim.note);
  }

  if (reasons.length < 3 && tool.advantages.length > 0) {
    reasons.push(tool.advantages[0]);
  }

  return Array.from(new Set(reasons)).slice(0, 4);
}

// ============================================================================
// 单个工具评估与 Top 1~3 多样性筛选
// ============================================================================

function evaluateTool(tool: MergedToolProfile, answers: MatcherAnswersV2): CandidateEvaluation {
  const unmetPreferences: string[] = [];
  const missingInfoNotes: string[] = [];

  const sceneDim = scoreSceneDimension(tool, answers);
  const taskDim = scoreTaskDimension(tool, answers);
  const envDim = scoreEnvironmentDimension(tool, answers.workMode, unmetPreferences, missingInfoNotes);
  const budgetDim = scoreBudgetDimension(tool, answers.budget, unmetPreferences, missingInfoNotes);
  const networkDim = scoreNetworkDimension(tool, answers.network, unmetPreferences, missingInfoNotes);
  const difficultyDim = scoreDifficultyDimension(tool, answers);

  const breakdown = [sceneDim, taskDim, envDim, budgetDim, networkDim, difficultyDim];
  const applicableDims = breakdown.filter((d) => d.applicable);
  const totalWeight = applicableDims.reduce((sum, d) => sum + d.weight, 0) || 1;

  let totalScoreFloat = 0;
  for (const dim of applicableDims) {
    const contribution = ((dim.rawScore / 5) * dim.weight * 100) / totalWeight;
    dim.weightedContribution = Number(contribution.toFixed(1));
    totalScoreFloat += contribution;
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(totalScoreFloat)));
  const roleForTask: ToolRole | 'none' = tool.taskRoles[answers.task] ?? 'none';
  const taskCapability = tool.taskCapabilities[answers.task] ?? 'unknown';
  const dataCompleteness = computeDataCompleteness(tool, answers.task);
  const confidence = computeConfidence(tool, dataCompleteness, breakdown);
  const hardConstraintStatus = checkHardConstraints(tool, answers.hardConstraints);

  if (
    answers.hardConstraints?.mustDomesticDirect &&
    tool.networkAvailability === 'partial_or_byok' &&
    !unmetPreferences.some((u) => u.includes('国内 API'))
  ) {
    unmetPreferences.push('需自行配置国内直连模型 API（如 DeepSeek/硅基流动）或本地 Ollama 才可全程国内直连');
  }

  if (taskDim.isUnknownField) {
    missingInfoNotes.push('该工具在目标任务上的能力评分未完善（中性值 2.5 处理）');
  }

  return {
    tool,
    roleForTask,
    taskCapability,
    score: normalizedScore,
    matchPercent: normalizedScore,
    dimensionBreakdown: breakdown,
    dataCompleteness,
    confidence,
    reasons: buildDynamicReasons(tool, answers, breakdown, roleForTask),
    advantages: [...tool.advantages],
    limitations: [...tool.limitations],
    softwareCostLabel: formatSoftwareCostLabel(tool),
    apiCostLabel: formatApiCostLabel(tool),
    hardwareRequirementLabel: formatHardwareLabel(tool),
    networkLabel: formatNetworkLabel(tool),
    unmetPreferences: Array.from(new Set(unmetPreferences)),
    missingInfoNotes: Array.from(new Set(missingInfoNotes)),
    hardConstraintStatus,
  };
}

function compareEvaluations(a: CandidateEvaluation, b: CandidateEvaluation): number {
  if (b.score !== a.score) return b.score - a.score;
  const capA = typeof a.taskCapability === 'number' ? a.taskCapability : 0;
  const capB = typeof b.taskCapability === 'number' ? b.taskCapability : 0;
  if (capB !== capA) return capB - capA;
  if (b.dataCompleteness !== a.dataCompleteness) return b.dataCompleteness - a.dataCompleteness;
  if (a.tool.featured !== b.tool.featured) return a.tool.featured ? -1 : 1;
  return a.tool.name.localeCompare(b.tool.name, 'zh-CN');
}

function pickDiverseTopPrimary(sortedPool: CandidateEvaluation[], limit = 3): CandidateEvaluation[] {
  if (sortedPool.length <= 1) return sortedPool.slice(0, limit);

  const selected: CandidateEvaluation[] = [sortedPool[0]];
  const remaining = sortedPool.slice(1);

  while (selected.length < limit && remaining.length > 0) {
    let bestIdx = 0;
    let bestEffective = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      let diversityBonus = 0;

      const diffBilling = selected.every(
        (s) => s.tool.modelApiBilling !== candidate.tool.modelApiBilling,
      );
      const diffDeploy = selected.every(
        (s) => s.tool.deploymentModes[0] !== candidate.tool.deploymentModes[0],
      );
      const diffNetwork = selected.every(
        (s) => s.tool.networkAvailability !== candidate.tool.networkAvailability,
      );
      const diffInterface = selected.every(
        (s) => s.tool.interfaces[0] !== candidate.tool.interfaces[0],
      );

      if (diffBilling) diversityBonus += 2;
      if (diffDeploy) diversityBonus += 2;
      if (diffNetwork) diversityBonus += 1.5;
      if (diffInterface) diversityBonus += 1.5;

      // 多样性加分仅用于在相近分数区间拉开差异化备选，不允许劣质候选反超明显更高分的工具
      const effective = candidate.score + Math.min(4, diversityBonus);
      if (effective > bestEffective) {
        bestEffective = effective;
        bestIdx = i;
      }
    }

    selected.push(remaining.splice(bestIdx, 1)[0]);
  }

  return selected.sort(compareEvaluations);
}

function buildComparisonAdvice(
  taskLabel: string,
  primaries: CandidateEvaluation[],
  assistants: CandidateEvaluation[],
  excludedCount: number,
  unverifiedCount: number,
  constraints?: MatcherHardConstraints,
): { summaryAdvice: string; noPrimaryMatchReason: string | null } {
  const constraintParts: string[] = [];
  if (constraints?.mustLocalRun) constraintParts.push('必须本地/私有运行');
  if (constraints?.mustDomesticDirect) constraintParts.push('必须国内网络直连');
  if (constraints?.mustCompletelyFree) constraintParts.push('必须完全免费（软件+模型均免付费）');
  const constraintText = constraintParts.length > 0 ? `在「${constraintParts.join(' + ')}」硬性条件下，` : '';

  if (primaries.length === 0) {
    const noPrimaryMatchReason = `${constraintText}当前 75 款工具库中暂无同时胜任「${taskLabel}」主力职责的工具。${
      unverifiedCount > 0 ? `另有 ${unverifiedCount} 款工具因关键收费或网络信息尚未核实而未纳入自动推荐。` : ''
    }${
      assistants.length > 0 ? ' 您可以参考下方的“配套辅助推荐”，或放宽部分硬性约束后重试。' : ' 建议放宽至少一项硬性约束条件后再试。'
    }`;

    return {
      summaryAdvice: noPrimaryMatchReason,
      noPrimaryMatchReason,
    };
  }

  const top1 = primaries[0];
  if (primaries.length === 1) {
    return {
      summaryAdvice: `${constraintText}「${taskLabel}」下当前仅有 1 款真正胜任的主力工具「${top1.tool.name}」（规则匹配度 ${top1.score}/100）。秉持“不足不凑数”原则，系统未用辅助或底层工具充数${
        excludedCount > 0 ? `（已为您严格拦截 ${excludedCount} 款不满足硬性条件的工具）` : ''
      }。`,
      noPrimaryMatchReason: null,
    };
  }

  const top2 = primaries[1];
  const diffs: string[] = [];

  if (top1.tool.networkAvailability !== top2.tool.networkAvailability) {
    diffs.push(
      `网络门槛上，${top1.tool.name}（${
        top1.tool.networkAvailability === 'domestic_direct' ? '国内直连' : '需适配或国际网络'
      }）与备选 ${top2.tool.name}（${
        top2.tool.networkAvailability === 'domestic_direct' ? '国内直连' : '需适配或国际网络'
      }）适用环境不同`,
    );
  }
  if (top1.tool.modelApiBilling !== top2.tool.modelApiBilling) {
    diffs.push(
      `付费结构上，${top1.tool.name}偏「${top1.tool.modelApiBilling === 'byok_payg' ? '自带 Key 按量计费' : top1.tool.modelApiBilling === 'local_hardware' ? '本地算力免费' : '官方含配额/订阅'}」，而 ${top2.tool.name}更适合对应另一种预算偏好`,
    );
  }
  if (top1.tool.deploymentModes[0] !== top2.tool.deploymentModes[0]) {
    diffs.push(
      `部署方式上，${top1.tool.name}侧重「${top1.tool.deploymentModes[0] === 'cloud_saas' || top1.tool.deploymentModes[0] === 'cloud_agent' ? '云端即用' : '本地客户端/自托管'}」，${top2.tool.name}则提供不同运行时态`,
    );
  }

  const diffSummary =
    diffs.length > 0
      ? diffs.slice(0, 2).join('；') + '。'
      : `综合规则匹配度分别为 ${top1.score} 分与 ${top2.score} 分，可根据您对界面习惯的偏好二选一。`;

  return {
    summaryAdvice: `${constraintText}「${taskLabel}」优先推荐主力方案「${top1.tool.name}」（匹配度 ${top1.score}/100）；同场备选「${top2.tool.name}」（${top2.score}/100）形成差异化互补：${diffSummary}`,
    noPrimaryMatchReason: null,
  };
}

// ============================================================================
// 主入口：evaluateToolMatches
// ============================================================================

export function evaluateToolMatches(
  navTools: NavTool[],
  answers: MatcherAnswersV2,
): MatcherRecommendationReport {
  const mergedTools = mergeNavToolsWithCapabilities(navTools);
  const isInfraTask = INFRASTRUCTURE_PRIMARY_TASKS.has(answers.task);

  const evaluations = mergedTools.map((tool) => evaluateTool(tool, answers));

  let excludedHardConstraintCount = 0;
  const unverifiedHardConstraintTools: CandidateEvaluation[] = [];
  const passedTools: CandidateEvaluation[] = [];

  for (const ev of evaluations) {
    if (ev.hardConstraintStatus.failedReasons.length > 0) {
      excludedHardConstraintCount += 1;
    } else if (ev.hardConstraintStatus.unverifiedReasons.length > 0) {
      unverifiedHardConstraintTools.push(ev);
    } else {
      passedTools.push(ev);
    }
  }

  const primaryPool: CandidateEvaluation[] = [];
  const assistantPool: CandidateEvaluation[] = [];
  const infraNotePool: CandidateEvaluation[] = [];

  for (const ev of passedTools) {
    const cap = typeof ev.taskCapability === 'number' ? ev.taskCapability : 0;

    if (ev.roleForTask === 'primary' && cap >= 3) {
      primaryPool.push(ev);
    } else if (ev.roleForTask === 'infrastructure' && isInfraTask && cap >= 3) {
      primaryPool.push(ev);
    } else if (ev.roleForTask === 'assistant' && cap >= 2) {
      assistantPool.push(ev);
    } else if (ev.roleForTask === 'infrastructure' && !isInfraTask && cap >= 2) {
      infraNotePool.push(ev);
    }
  }

  primaryPool.sort(compareEvaluations);
  assistantPool.sort(compareEvaluations);
  infraNotePool.sort(compareEvaluations);
  unverifiedHardConstraintTools.sort((a, b) => a.tool.name.localeCompare(b.tool.name, 'zh-CN'));

  const primaryRecommendations = pickDiverseTopPrimary(primaryPool, 3);
  const assistantRecommendations = assistantPool.slice(0, 3);
  const infrastructureNoteCandidates = infraNotePool.slice(0, 2);

  const taskMeta = TASK_META[answers.task];
  const sceneMeta = SCENE_META[answers.scene];

  const { summaryAdvice, noPrimaryMatchReason } = buildComparisonAdvice(
    taskMeta.label,
    primaryRecommendations,
    assistantRecommendations,
    excludedHardConstraintCount,
    unverifiedHardConstraintTools.length,
    answers.hardConstraints,
  );

  return {
    answers,
    taskLabel: taskMeta.label,
    sceneLabel: sceneMeta.label,
    isInfrastructureTask: isInfraTask,
    primaryRecommendations,
    assistantRecommendations,
    infrastructureNoteCandidates,
    unverifiedHardConstraintTools,
    excludedHardConstraintCount,
    summaryAdvice,
    noPrimaryMatchReason,
    engineNotice: ENGINE_NOTICE,
  };
}
