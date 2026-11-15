import type { NavTool, NavToolCategory } from '@/data/nav-tools';

export type TaskKey =
  | 'website_build'      // 自然语言生成网站或应用
  | 'app_prototyping'    // 应用原型设计与快速搭建
  | 'code_editing'       // IDE 代码编写与重构
  | 'debugging'          // Debug 与代码审查
  | 'agent_coding'       // AI Agent 自主编程
  | 'desktop_automation' // 桌面自主智能体与跨应用操作
  | 'browser_automation' // 浏览器自动化操作
  | 'office_writing'     // 文档写作与润色
  | 'ppt_making'         // PPT 制作
  | 'excel_data'         // Excel 与数据处理
  | 'file_automation'    // 文件整理与自动化办公
  | 'meeting_notes'      // 会议记录与总结
  | 'speech_to_text'     // 语音转文字
  | 'literature_search'  // 学术文献检索
  | 'paper_reading'      // 论文阅读与长文档分析
  | 'deep_research'      // 深度网络检索与调研
  | 'image_generation'   // AI 绘图生成
  | 'image_editing'      // AI 图片编辑与修图
  | 'video_generation'   // AI 视频生成与剪辑
  | 'audio_music'        // AI 配音与音乐生成
  | 'api_management'     // 多模型 API 聚合与管理
  | 'rag_knowledge'      // RAG 知识库搭建
  | 'workflow_auto'      // 工作流编排与自动化
  | 'local_deployment';  // 本地模型运行与私有部署

export type ToolRole = 'primary' | 'assistant' | 'infrastructure';

export type ToolInterface = 'web' | 'desktop' | 'ide' | 'cli' | 'api' | 'mobile';

export type DeploymentMode =
  | 'cloud_saas'
  | 'cloud_agent'
  | 'local_client'
  | 'local_inference'
  | 'self_hosted';

export type LicenseType = 'open_source' | 'source_available' | 'proprietary' | 'unknown';

export type SoftwarePricingModel =
  | 'free'
  | 'freemium'
  | 'paid_subscription'
  | 'one_time'
  | 'unknown';

export type ModelApiBilling =
  | 'included_free'
  | 'included_quota'
  | 'byok_payg'
  | 'subscription_included'
  | 'local_hardware'
  | 'unknown';

export type NetworkAvailability =
  | 'domestic_direct'
  | 'partial_or_byok'
  | 'international_required'
  | 'unknown';

export type CapabilityScore = 0 | 1 | 2 | 3 | 4 | 5;
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FieldEvidenceItem {
  sourceUrl: string;
  verifiedAt: string;
  confidence: ConfidenceLevel;
}

export interface ToolCapabilityProfile {
  id: string;
  name: string;
  category: NavToolCategory | string; // 兼容原有 8 大导航分类

  taskRoles: Partial<Record<TaskKey, ToolRole>>;
  primaryTasks: TaskKey[];
  secondaryTasks: TaskKey[];
  taskCapabilities: Partial<Record<TaskKey, CapabilityScore>>;

  interfaces: ToolInterface[];
  deploymentModes: DeploymentMode[];

  licenseType: LicenseType;
  softwarePricingModel: SoftwarePricingModel;
  modelApiBilling: ModelApiBilling;
  freeQuotaNote: string;

  networkAvailability: NetworkAvailability;

  difficulty: DifficultyLevel;
  difficultyByTask?: Partial<Record<TaskKey, DifficultyLevel>>;

  advantages: string[];
  limitations: string[];

  officialUrl: string;
  sourceUrl?: string;
  fieldEvidence?: Record<string, FieldEvidenceItem>;
  verifiedAt?: string;
  dataConfidence: ConfidenceLevel;
}

export type MergedToolProfile = NavTool & ToolCapabilityProfile;

// ============================================================================
// 5 道测试题与硬性条件定义
// ============================================================================

export type SceneKey =
  | 'coding_web'
  | 'office_efficiency'
  | 'research_learning'
  | 'workflow_automation'
  | 'model_local'
  | 'visual_creation'
  | 'audio_meeting'
  | 'desktop_agent';

export type BudgetPreference =
  | 'completely_free'
  | 'free_or_low_cost'
  | 'pay_as_you_go'
  | 'subscription_ok'
  | 'self_host_control'
  | 'no_preference';

export type NetworkPreference =
  | 'domestic_direct'
  | 'international_ok'
  | 'no_mind_setup'
  | 'no_preference';

export type WorkModePreference =
  | 'web_simple'
  | 'desktop_client'
  | 'ide_editor'
  | 'cli_terminal'
  | 'local_custom'
  | 'no_preference';

export type HardConstraintKey =
  | 'mustLocalRun'
  | 'mustDomesticDirect'
  | 'mustCompletelyFree';

export interface MatcherHardConstraints {
  mustLocalRun?: boolean;
  mustDomesticDirect?: boolean;
  mustCompletelyFree?: boolean;
}

export interface MatcherAnswersV2 {
  scene: SceneKey;
  task: TaskKey;
  budget: BudgetPreference;
  network: NetworkPreference;
  workMode: WorkModePreference;
  hardConstraints?: MatcherHardConstraints;
}

export type ScoreDimensionKey =
  | 'scene'
  | 'task'
  | 'environment'
  | 'budget'
  | 'network'
  | 'difficulty';

export interface DimensionScoreDetail {
  key: ScoreDimensionKey;
  label: string;
  weight: number;
  applicable: boolean;
  rawScore: number; // 0 ~ 5
  weightedContribution: number;
  isUnknownField: boolean;
  note: string;
}

export interface CandidateEvaluation {
  tool: MergedToolProfile;
  roleForTask: ToolRole | 'none';
  taskCapability: CapabilityScore | 'unknown';
  score: number; // 0 ~ 100（有效维度归一化）
  matchPercent: number; // 与 score 同步的 0~100 规则评分
  dimensionBreakdown: DimensionScoreDetail[];
  dataCompleteness: number; // 0 ~ 100（独立计算，不混入匹配分）
  confidence: ConfidenceLevel;
  reasons: string[];
  advantages: string[];
  limitations: string[];
  softwareCostLabel: string;
  apiCostLabel: string;
  hardwareRequirementLabel: string;
  networkLabel: string;
  unmetPreferences: string[];
  missingInfoNotes: string[];
  hardConstraintStatus: {
    passed: boolean;
    failedReasons: string[];
    unverifiedReasons: string[];
  };
}

export interface MatcherRecommendationReport {
  answers: MatcherAnswersV2;
  taskLabel: string;
  sceneLabel: string;
  isInfrastructureTask: boolean;
  primaryRecommendations: CandidateEvaluation[]; // Top 1~3，宁缺毋滥
  assistantRecommendations: CandidateEvaluation[]; // 配套辅助推荐
  infrastructureNoteCandidates: CandidateEvaluation[]; // 被隔离的基础设施工具说明
  unverifiedHardConstraintTools: CandidateEvaluation[]; // 硬性条件无法核实的工具
  excludedHardConstraintCount: number;
  summaryAdvice: string;
  noPrimaryMatchReason: string | null;
  engineNotice: string;
}
