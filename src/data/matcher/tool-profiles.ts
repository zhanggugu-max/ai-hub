import type { NavTool } from '@/data/nav-tools';
import type { MergedToolProfile, ToolCapabilityProfile } from './types';
import { BATCH1_DESKTOP_CODING_PROFILES } from './profiles/batch1-desktop-coding';
import { BATCH2_WORKFLOW_API_PROFILES } from './profiles/batch2-workflow-api';
import { BATCH3_RESEARCH_BUILDER_PROFILES } from './profiles/batch3-research-builder';
import { BATCH4_VISUAL_AUDIO_PROFILES } from './profiles/batch4-visual-audio';

export const TOOL_CAPABILITY_PROFILE_LIST: ToolCapabilityProfile[] = [
  ...BATCH1_DESKTOP_CODING_PROFILES,
  ...BATCH2_WORKFLOW_API_PROFILES,
  ...BATCH3_RESEARCH_BUILDER_PROFILES,
  ...BATCH4_VISUAL_AUDIO_PROFILES,
];

export const TOOL_CAPABILITY_PROFILES: Record<string, ToolCapabilityProfile> = Object.fromEntries(
  TOOL_CAPABILITY_PROFILE_LIST.map((profile) => [profile.id, profile])
);

/**
 * 将基础导航工具库（NAV_TOOLS）与独立维护的能力画像按 id 安全合并。
 * 若未来自动脚本更新了 nav-tools 基础展示信息，能力画像与人工核实字段不会被覆盖丢失。
 */
export function mergeNavToolsWithCapabilities(tools: NavTool[]): MergedToolProfile[] {
  return tools.map((tool) => {
    const profile = TOOL_CAPABILITY_PROFILES[tool.id];
    if (profile) {
      return {
        ...tool,
        ...profile,
        // 展示基础信息保留 nav-tools 当前数据，保证 /nav 与 /matcher 一致且兼容自动同步
        id: tool.id,
        name: tool.name,
        category: tool.category,
        officialUrl: tool.officialUrl,
      };
    }

    // 兜底：若未来新增未建画像的工具，诚实标为全 unknown + 低置信度，绝不默认当作免费/直连/主力
    return {
      ...tool,
      taskRoles: {},
      primaryTasks: [],
      secondaryTasks: [],
      taskCapabilities: {},
      interfaces: [],
      deploymentModes: [],
      licenseType: 'unknown',
      softwarePricingModel: 'unknown',
      modelApiBilling: 'unknown',
      freeQuotaNote: '该工具尚待完成结构化费用与额度核实，建议查看官方网站确认。',
      networkAvailability: 'unknown',
      difficulty: 3,
      advantages: [tool.tagline],
      limitations: ['能力画像信息尚待补充核实，暂无法给出细粒度匹配评估。'],
      dataConfidence: 'low',
    };
  });
}
