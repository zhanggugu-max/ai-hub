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
  PreferenceConflictItem,
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
        unmetPreferences.push('软件免费但模型需自带 API Key（非完全零成本开箱使用）');
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
        note = '支持国内网络直接稳定访问，无需复杂网络配置';
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
        note = '需自行具备合规海外网络环境即可启用';
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
    note: `上手难度 ${diff}/5（1 为极低门槛，5 为硬核工程部署）`,
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
      unverifiedReasons.push('未核实是否支持本地模型推理或私有部署');
    } else if (!tool.deploymentModes.includes('local_inference')) {
      if (tool.deploymentModes.includes('self_hosted')) {
        failedReasons.push(
          '仅支持自托管服务端部署（仍需配合云端 API 或另行接入本地 Ollama），不属于开箱本地模型推理工具',
        );
      } else if (tool.deploymentModes.includes('local_client')) {
        failedReasons.push(
          '仅提供安装在本机的桌面或命令行客户端（模型推理在云端或外部 API 完成），不满足“必须本地模型推理”要求',
        );
      } else {
        failedReasons.push('仅支持云端 SaaS / 云端 Agent 运行，不支持本地模型推理');
      }
    }
  }

  if (constraints.mustDomesticDirect) {
    if (tool.networkAvailability === 'unknown') {
      unverifiedReasons.push('未核实国内网络直连可用性');
    } else if (tool.networkAvailability === 'partial_or_byok') {
      failedReasons.push(
        '需用户自行配置国内大模型 API 或本地 Ollama 才可稳定直连，不属于开箱完全国内直连产品',
      );
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
  if (modes.includes('local_inference') && modes.includes('cloud_saas')) {
    return '既可使用官方云端 SaaS（免显卡），也可下载模型在本地 NVIDIA 显卡/高配主机完成推理';
  }
  if (modes.includes('local_inference')) {
    return '支持在本机或自有 GPU 服务器完成本地模型推理（建议 16GB+ 内存，开源大模型建议 8GB~16GB+ 独立显存）';
  }
  if (modes.includes('self_hosted') && modes.includes('cloud_saas')) {
    return '支持官方云端免部署使用，也支持本机或自有服务器 Docker 私有部署（私有部署仍需配合云端 API 或本地 Ollama）';
  }
  if (modes.includes('self_hosted')) {
    return '支持本机或自有服务器 Docker/源码自托管；普通配置即可运行框架，若同时加载本地模型需另配独立显卡与 Ollama';
  }
  if (modes.includes('local_client') && (modes.includes('cloud_saas') || modes.includes('cloud_agent'))) {
    return '需安装本地桌面客户端，核心模型推理在云端完成，对本机 GPU 无硬性要求';
  }
  if (modes.includes('local_client')) {
    return '仅需在本机安装桌面/终端客户端（模型本身默认走外部 API，若接云端 API 无需独显，接本地 Ollama 则需对应显存）';
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

function getDeploymentFamily(tool: MergedToolProfile): string {
  const modes = tool.deploymentModes;
  if (modes.includes('local_inference')) return 'local_inference';
  if (modes.includes('self_hosted')) return 'self_hosted';
  if (modes.includes('local_client') && !modes.includes('cloud_saas') && !modes.includes('cloud_agent')) {
    return 'local_client';
  }
  if (modes.includes('local_client')) return 'hybrid_client';
  return 'cloud';
}

function getBillingFamily(tool: MergedToolProfile): string {
  if (tool.modelApiBilling === 'local_hardware') return 'local_hardware';
  if (tool.modelApiBilling === 'byok_payg') return 'byok_payg';
  if (tool.modelApiBilling === 'included_free') return 'included_free';
  return 'quota_or_subscription';
}

function deriveAlternativeRoleLabel(candidate: CandidateEvaluation, top1: CandidateEvaluation): string {
  const candFamily = getDeploymentFamily(candidate.tool);
  const top1Family = getDeploymentFamily(top1.tool);

  if (candFamily === 'local_inference' && top1Family !== 'local_inference') {
    return '本地推理 / 开源路线';
  }
  if (candFamily === 'self_hosted' && top1Family !== 'self_hosted') {
    return '私有部署 / 自托管路线';
  }
  if (candFamily === 'cloud' && (top1Family === 'local_inference' || top1Family === 'self_hosted' || top1Family === 'local_client')) {
    return '纯云端免配置路线';
  }
  if (
    candidate.tool.networkAvailability === 'domestic_direct' &&
    top1.tool.networkAvailability !== 'domestic_direct'
  ) {
    return '国内直连替代方案';
  }
  if (
    candidate.tool.modelApiBilling === 'byok_payg' &&
    top1.tool.modelApiBilling !== 'byok_payg'
  ) {
    return '自带 Key / 按量可控路线';
  }
  if (
    (candidate.tool.licenseType === 'open_source' || candidate.tool.licenseType === 'source_available') &&
    top1.tool.licenseType === 'proprietary'
  ) {
    return '开源开放生态备选';
  }
  if (
    candidate.tool.interfaces[0] === 'cli' &&
    top1.tool.interfaces[0] !== 'cli'
  ) {
    return '终端 / 开发者命令行备选';
  }
  return '差异化主力备选';
}

function pickDiverseTopPrimary(sortedPool: CandidateEvaluation[], limit = 3): CandidateEvaluation[] {
  if (sortedPool.length === 0) return [];
  if (sortedPool.length === 1) {
    return [{ ...sortedPool[0], selectionRoleLabel: '主力首选' }];
  }

  // 严格锁定 Top 1，绝不因为多样性改写最高匹配主力或篡改任何工具的真实评分
  const top1: CandidateEvaluation = { ...sortedPool[0], selectionRoleLabel: '主力首选' };
  const selected: CandidateEvaluation[] = [top1];
  const remaining = sortedPool.slice(1);

  while (selected.length < limit && remaining.length > 0) {
    let bestIdx = 0;
    let bestSelectionPriority = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const cap = typeof candidate.taskCapability === 'number' ? candidate.taskCapability : 0;
      const scoreDeltaFromTop1 = top1.score - candidate.score;

      let diversityBonus = 0;
      if (cap >= 3 && scoreDeltaFromTop1 <= 15) {
        const candFamily = getDeploymentFamily(candidate.tool);
        const candBilling = getBillingFamily(candidate.tool);

        const diffDeployFamily = selected.every((s) => getDeploymentFamily(s.tool) !== candFamily);
        const diffBillingFamily = selected.every((s) => getBillingFamily(s.tool) !== candBilling);
        const diffNetwork = selected.every((s) => s.tool.networkAvailability !== candidate.tool.networkAvailability);
        const diffLicense = selected.every((s) => s.tool.licenseType !== candidate.tool.licenseType);
        const diffInterface = selected.every((s) => s.tool.interfaces[0] !== candidate.tool.interfaces[0]);

        if (diffDeployFamily) diversityBonus += 6;
        if (diffBillingFamily) diversityBonus += 4.5;
        if (diffNetwork) diversityBonus += 3.5;
        if (diffLicense) diversityBonus += 3;
        if (diffInterface) diversityBonus += 2;
      }

      // 内部选拔优先级仅用于选出更有对比价值的 Top 2 / Top 3，绝不修改 candidate.score
      const selectionPriority =
        candidate.score + (cap >= 5 ? 1.5 : 0) + Math.min(12, diversityBonus);

      if (selectionPriority > bestSelectionPriority) {
        bestSelectionPriority = selectionPriority;
        bestIdx = i;
      }
    }

    const picked = remaining.splice(bestIdx, 1)[0];
    selected.push(picked);
  }

  const alternatives = selected
    .slice(1)
    .sort(compareEvaluations)
    .map((cand) => ({
      ...cand,
      selectionRoleLabel: deriveAlternativeRoleLabel(cand, top1),
    }));

  return [top1, ...alternatives];
}

export function detectPreferenceConflicts(answers: MatcherAnswersV2): PreferenceConflictItem[] {
  const conflicts: PreferenceConflictItem[] = [];
  const constraints = answers.hardConstraints;
  if (!constraints) return conflicts;

  if (
    constraints.mustCompletelyFree &&
    (answers.budget === 'subscription_ok' || answers.budget === 'pay_as_you_go')
  ) {
    conflicts.push({
      severity: 'conflict',
      title: '预算偏好与“必须完全免费”存在条件冲突',
      description:
        answers.budget === 'subscription_ok'
          ? '你在预算偏好选择了“可接受月付订阅”，同时又勾选了“必须完全免费”。系统已严格按完全免费条件拦截付费和订阅制工具；如需查看会员订阅主力工具，可取消该硬性限制或将预算偏好调回免费路线。'
          : '你在预算偏好选择了“按量付费 API / 自带密钥”，同时又勾选了“必须完全免费”。系统已严格过滤需按量付费的工具；如需自备密钥调用模型，请取消“必须完全免费”限制。',
      relatedConstraint: 'mustCompletelyFree',
      conflictingPreferenceField: 'budget',
    });
  }

  if (constraints.mustDomesticDirect && answers.network === 'international_ok') {
    conflicts.push({
      severity: 'narrowing',
      title: '网络条件偏好与“必须国内直连”叠加收窄',
      description:
        '你选择了“已有稳定国际网络条件”，但又勾选了“必须国内网络直连”。系统会优先执行硬性直连过滤，所有依赖海外网络或需额外配置接口的工具都将被拦截；如需参与全球工具对比，可取消“必须国内直连”。',
      relatedConstraint: 'mustDomesticDirect',
      conflictingPreferenceField: 'network',
    });
  }

  if (constraints.mustLocalRun && answers.workMode === 'web_simple') {
    conflicts.push({
      severity: 'narrowing',
      title: '“网页打开即用”与“必须本地模型推理”叠加收窄',
      description:
        '绝大多数网页即用工具将模型部署在官方云端，无法满足“必须本机或私有服务器推理”的硬性条件。系统已按本地推理要求严格过滤；如需保留免安装浏览器体验，建议取消本地推理限制，或改选桌面客户端 / 本地可部署环境。',
      relatedConstraint: 'mustLocalRun',
      conflictingPreferenceField: 'workMode',
    });
  }

  return conflicts;
}

function buildComparisonAdvice(
  taskLabel: string,
  primaries: CandidateEvaluation[],
  assistants: CandidateEvaluation[],
  excludedCount: number,
  unverifiedCount: number,
  conflicts: PreferenceConflictItem[],
  conditionalLocalCount: number,
  configurableNetworkCount: number,
  constraints?: MatcherHardConstraints,
): { summaryAdvice: string; noPrimaryMatchReason: string | null } {
  const constraintParts: string[] = [];
  if (constraints?.mustLocalRun) constraintParts.push('必须本地模型推理');
  if (constraints?.mustDomesticDirect) constraintParts.push('必须国内网络直连');
  if (constraints?.mustCompletelyFree) constraintParts.push('必须完全免费（软件+模型均免付费）');
  const constraintText = constraintParts.length > 0 ? `在「${constraintParts.join(' + ')}」硬性条件下，` : '';

  if (primaries.length === 0) {
    const conflictHint =
      conflicts.length > 0 ? ` 检测到偏好与硬性条件收窄提示（${conflicts.map((c) => c.title).join('；')}）。` : '';
    const conditionalHint =
      conditionalLocalCount > 0 || configurableNetworkCount > 0
        ? ` 下方已单独列出 ${conditionalLocalCount + configurableNetworkCount} 款“有条件可用”的相关工具说明，供确认是否放宽限制后使用。`
        : '';
    const noPrimaryMatchReason = `${constraintText}当前 75 款工具库中暂无同时严格满足条件且胜任「${taskLabel}」主力职责的工具。${
      unverifiedCount > 0 ? `另有 ${unverifiedCount} 款工具因关键收费或网络信息尚未核实而未纳入自动推荐。` : ''
    }${conflictHint}${conditionalHint}${
      assistants.length > 0 ? ' 您也可参考下方的“配套辅助推荐”，或放宽部分硬性约束后重试。' : ' 建议放宽至少一项硬性约束条件后再试。'
    }`;

    return {
      summaryAdvice: noPrimaryMatchReason,
      noPrimaryMatchReason,
    };
  }

  const top1 = primaries[0];
  if (primaries.length === 1) {
    return {
      summaryAdvice: `${constraintText}「${taskLabel}」下当前仅有 1 款严格满足条件的主力工具「${top1.tool.name}」（规则匹配度 ${top1.score}/100）。秉持“不足不凑数”原则，系统未用辅助或底层工具充数${
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
  if (getDeploymentFamily(top1.tool) !== getDeploymentFamily(top2.tool)) {
    diffs.push(
      `部署方式上，${top1.tool.name}侧重「${getDeploymentFamily(top1.tool) === 'cloud' ? '云端即用' : getDeploymentFamily(top1.tool) === 'local_inference' ? '本地模型推理' : '客户端/自托管'}」，${top2.tool.name}则提供不同运行时态`,
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

function passesConstraintExcept(
  tool: MergedToolProfile,
  constraints: MatcherHardConstraints | undefined,
  skip: 'mustLocalRun' | 'mustDomesticDirect',
): boolean {
  if (!constraints) return true;
  const sub: MatcherHardConstraints = {
    mustLocalRun: skip === 'mustLocalRun' ? false : constraints.mustLocalRun,
    mustDomesticDirect: skip === 'mustDomesticDirect' ? false : constraints.mustDomesticDirect,
    mustCompletelyFree: constraints.mustCompletelyFree,
  };
  return checkHardConstraints(tool, sub).passed;
}

export function evaluateToolMatches(
  navTools: NavTool[],
  answers: MatcherAnswersV2,
): MatcherRecommendationReport {
  const mergedTools = mergeNavToolsWithCapabilities(navTools);
  const isInfraTask = INFRASTRUCTURE_PRIMARY_TASKS.has(answers.task);
  const preferenceConflicts = detectPreferenceConflicts(answers);

  const evaluations = mergedTools.map((tool) => evaluateTool(tool, answers));

  let excludedHardConstraintCount = 0;
  const unverifiedHardConstraintTools: CandidateEvaluation[] = [];
  const passedTools: CandidateEvaluation[] = [];
  const conditionalLocalPool: CandidateEvaluation[] = [];
  const configurableNetworkPool: CandidateEvaluation[] = [];

  for (const ev of evaluations) {
    const cap = typeof ev.taskCapability === 'number' ? ev.taskCapability : 0;
    const isTaskCompetentPrimary =
      (ev.roleForTask === 'primary' || (ev.roleForTask === 'infrastructure' && isInfraTask)) &&
      cap >= 3;

    if (ev.hardConstraintStatus.failedReasons.length > 0) {
      excludedHardConstraintCount += 1;

      if (isTaskCompetentPrimary && passesConstraintExcept(ev.tool, answers.hardConstraints, 'mustLocalRun')) {
        const isSelfHostOrPureClient =
          !ev.tool.deploymentModes.includes('local_inference') &&
          (ev.tool.deploymentModes.includes('self_hosted') ||
            (ev.tool.deploymentModes.includes('local_client') &&
              !ev.tool.deploymentModes.includes('cloud_saas') &&
              !ev.tool.deploymentModes.includes('cloud_agent')));
        if (answers.hardConstraints?.mustLocalRun && isSelfHostOrPureClient) {
          conditionalLocalPool.push(ev);
        }
      }

      if (
        isTaskCompetentPrimary &&
        answers.hardConstraints?.mustDomesticDirect &&
        ev.tool.networkAvailability === 'partial_or_byok' &&
        passesConstraintExcept(ev.tool, answers.hardConstraints, 'mustDomesticDirect')
      ) {
        configurableNetworkPool.push(ev);
      }
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
  conditionalLocalPool.sort(compareEvaluations);
  configurableNetworkPool.sort(compareEvaluations);
  unverifiedHardConstraintTools.sort((a, b) => a.tool.name.localeCompare(b.tool.name, 'zh-CN'));

  const primaryRecommendations = pickDiverseTopPrimary(primaryPool, 3);
  const assistantRecommendations = assistantPool.slice(0, 3);
  const infrastructureNoteCandidates = infraNotePool.slice(0, 2);
  const conditionalLocalCandidates = conditionalLocalPool.slice(0, 3);
  const configurableNetworkCandidates = configurableNetworkPool.slice(0, 3);

  const taskMeta = TASK_META[answers.task];
  const sceneMeta = SCENE_META[answers.scene];

  const { summaryAdvice, noPrimaryMatchReason } = buildComparisonAdvice(
    taskMeta.label,
    primaryRecommendations,
    assistantRecommendations,
    excludedHardConstraintCount,
    unverifiedHardConstraintTools.length,
    preferenceConflicts,
    conditionalLocalCandidates.length,
    configurableNetworkCandidates.length,
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
    conditionalLocalCandidates,
    configurableNetworkCandidates,
    unverifiedHardConstraintTools,
    excludedHardConstraintCount,
    preferenceConflicts,
    summaryAdvice,
    noPrimaryMatchReason,
    engineNotice: ENGINE_NOTICE,
  };
}
