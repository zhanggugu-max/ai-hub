import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { NAV_CATEGORIES, NAV_TOOLS } from '../src/data/nav-tools';
import { TOOL_CAPABILITY_PROFILE_LIST, mergeNavToolsWithCapabilities } from '../src/data/matcher/tool-profiles';
import { SCENE_TASK_OPTIONS, evaluateMatcherReport } from '../src/data/matcher-quiz';
import type { MatcherAnswersV2, SceneKey, TaskKey } from '../src/data/matcher/types';
import { INFRASTRUCTURE_PRIMARY_TASKS, TASK_META } from '../src/lib/matcher/engine';

function runIntegrityChecks() {
  console.log('=== 1. 工具库与能力画像完整性核查 ===');
  assert.equal(NAV_TOOLS.length, 75, 'NAV_TOOLS 必须严格保持 75 款工具');
  assert.equal(NAV_CATEGORIES.length, 8, 'NAV_CATEGORIES 必须严格保持 8 大分类');

  const expectedCounts: Record<string, number> = {
    'desktop-agents': 21,
    coding: 9,
    workflow: 9,
    'api-compute': 9,
    research: 9,
    'app-builder': 6,
    'multimodal-visual': 6,
    'audio-productivity': 6,
  };
  const actualCounts: Record<string, number> = {};
  for (const t of NAV_TOOLS) {
    actualCounts[t.category] = (actualCounts[t.category] ?? 0) + 1;
  }
  assert.deepEqual(actualCounts, expectedCounts, '8 大分类数量分布必须与原始工具库一致');

  assert.equal(
    TOOL_CAPABILITY_PROFILE_LIST.length,
    NAV_TOOLS.length,
    '能力画像总数必须与 NAV_TOOLS 完全一致',
  );

  const navIds = new Set(NAV_TOOLS.map((t) => t.id));
  const profIds = new Set(TOOL_CAPABILITY_PROFILE_LIST.map((p) => p.id));
  assert.equal(profIds.size, NAV_TOOLS.length, '能力画像 ID 不能重复');
  for (const id of navIds) {
    assert.ok(profIds.has(id), `缺少工具 ${id} 的能力画像`);
  }

  const merged = mergeNavToolsWithCapabilities(NAV_TOOLS);
  for (const tool of merged) {
    const rolePrimary = Object.entries(tool.taskRoles)
      .filter(([, r]) => r === 'primary')
      .map(([k]) => k)
      .sort();
    assert.deepEqual(
      [...tool.primaryTasks].sort(),
      rolePrimary,
      `${tool.id}: primaryTasks 与 taskRoles 不一致`,
    );

    const roleSecondary = Object.entries(tool.taskRoles)
      .filter(([, r]) => r === 'assistant' || r === 'infrastructure')
      .map(([k]) => k)
      .sort();
    assert.deepEqual(
      [...tool.secondaryTasks].sort(),
      roleSecondary,
      `${tool.id}: secondaryTasks 与 taskRoles 不一致`,
    );

    for (const [taskKey, role] of Object.entries(tool.taskRoles)) {
      const cap = tool.taskCapabilities[taskKey as TaskKey];
      assert.ok(cap !== undefined, `${tool.id}: 任务 ${taskKey} 缺少 capability 分`);
      if (role === 'primary') {
        assert.ok(cap >= 3, `${tool.id}: 主力任务 ${taskKey} 的 capability 分低于 3`);
      }
    }
  }

  // 检查 24 项任务全覆盖
  const quizTasks = new Set<TaskKey>();
  for (const sceneKey of Object.keys(SCENE_TASK_OPTIONS) as SceneKey[]) {
    for (const opt of SCENE_TASK_OPTIONS[sceneKey]) {
      quizTasks.add(opt.value);
      const candidates = merged.filter((m) => {
        const r = m.taskRoles[opt.value];
        const c = m.taskCapabilities[opt.value] ?? 0;
        return (
          c >= 3 &&
          (r === 'primary' ||
            (r === 'infrastructure' && INFRASTRUCTURE_PRIMARY_TASKS.has(opt.value)))
        );
      });
      assert.ok(candidates.length >= 1, `任务 ${opt.value} 至少应有 1 款主力工具`);
    }
  }
  assert.equal(quizTasks.size, Object.keys(TASK_META).length, '问答第 2 题必须覆盖全部 24 项细分任务');

  // 静态审计引擎禁止硬编码工具 ID
  const engineSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/lib/matcher/engine.ts'),
    'utf8',
  );
  for (const id of navIds) {
    assert.ok(
      !engineSource.includes(`'${id}'`) && !engineSource.includes(`"${id}"`),
      `规则引擎禁止硬编码具体工具 ID: ${id}`,
    );
  }
  console.log('✓ 75 款工具完整性、24 项任务覆盖、零引擎硬编码校验全部通过！\n');
}

interface ScenarioSpec {
  id: string;
  label: string;
  answers: MatcherAnswersV2;
  check: (report: ReturnType<typeof evaluateMatcherReport>) => void;
}

const TWENTY_SCENARIOS: ScenarioSpec[] = [
  {
    id: 'S01',
    label: '自然语言建站（本地可自定义 + 按量付费 + 国内偏好）',
    answers: {
      scene: 'coding_web',
      task: 'website_build',
      budget: 'pay_as_you_go',
      network: 'domestic_direct',
      workMode: 'local_custom',
    },
    check: (r) => {
      assert.ok(r.primaryRecommendations.length >= 1);
      assert.equal(r.primaryRecommendations[0].tool.id, 'dyad-local');
    },
  },
  {
    id: 'S02',
    label: '全栈网站生成（网页即用 + 订阅制 + 海外网络）',
    answers: {
      scene: 'coding_web',
      task: 'website_build',
      budget: 'subscription_ok',
      network: 'international_ok',
      workMode: 'web_simple',
    },
    check: (r) => {
      const topIds = r.primaryRecommendations.map((c) => c.tool.id);
      assert.ok(
        topIds.some((id) => ['lovable-dev', 'vercel-v0', 'bolt-new', 'replit-agent'].includes(id)),
      );
      assert.ok(!topIds.includes('cherry-studio'));
    },
  },
  {
    id: 'S03',
    label: '应用原型全栈敏捷搭建（免费试用 + 海外可用 + 网页即用）',
    answers: {
      scene: 'coding_web',
      task: 'app_prototyping',
      budget: 'free_or_low_cost',
      network: 'international_ok',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.ok(r.primaryRecommendations.length >= 2);
      assert.ok(
        r.primaryRecommendations.every((c) => c.roleForTask === 'primary' && (c.taskCapability as number) >= 3),
      );
    },
  },
  {
    id: 'S04',
    label: 'IDE 日常写代码（国内直连 + IDE 形态 + 免费额度）',
    answers: {
      scene: 'coding_web',
      task: 'code_editing',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'ide_editor',
    },
    check: (r) => {
      assert.equal(r.primaryRecommendations[0].tool.id, 'trae');
    },
  },
  {
    id: 'S05',
    label: 'IDE 日常写代码（海外网络 + 订阅省心 + IDE 形态）',
    answers: {
      scene: 'coding_web',
      task: 'code_editing',
      budget: 'subscription_ok',
      network: 'international_ok',
      workMode: 'ide_editor',
    },
    check: (r) => {
      assert.ok(['cursor', 'google-antigravity'].includes(r.primaryRecommendations[0].tool.id));
    },
  },
  {
    id: 'S06',
    label: '复杂 Debug 与修测试（终端命令行 + 按量付费 + 海外网络）',
    answers: {
      scene: 'coding_web',
      task: 'debugging',
      budget: 'pay_as_you_go',
      network: 'international_ok',
      workMode: 'cli_terminal',
    },
    check: (r) => {
      assert.ok(['claude-code', 'openai-codex'].includes(r.primaryRecommendations[0].tool.id));
    },
  },
  {
    id: 'S07',
    label: 'AI Agent 多文件自主开发（国内直连 + 终端命令行 + 按量/免费）',
    answers: {
      scene: 'coding_web',
      task: 'agent_coding',
      budget: 'pay_as_you_go',
      network: 'domestic_direct',
      workMode: 'cli_terminal',
    },
    check: (r) => {
      assert.ok(['qwen-code', 'deepseek-harness'].includes(r.primaryRecommendations[0].tool.id));
    },
  },
  {
    id: 'S08',
    label: '桌面办公与本地文件夹整理（国内直连 + 桌面端 + 免费额度）',
    answers: {
      scene: 'office_efficiency',
      task: 'file_automation',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'desktop_client',
    },
    check: (r) => {
      const topIds = r.primaryRecommendations.map((c) => c.tool.id);
      assert.ok(
        topIds.some((id) =>
          ['tencent-workbuddy', 'alibaba-qoderwork', 'bytedance-traework'].includes(id),
        ),
      );
    },
  },
  {
    id: 'S09',
    label: '办公文档写作与润色（国内直连 + 网页即用）',
    answers: {
      scene: 'office_efficiency',
      task: 'office_writing',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.ok(r.primaryRecommendations.length >= 1);
      assert.equal(r.primaryRecommendations[0].tool.networkAvailability, 'domestic_direct');
    },
  },
  {
    id: 'S10',
    label: 'PPT 制作与结构化演示（海外网络 + 网页即用）',
    answers: {
      scene: 'office_efficiency',
      task: 'ppt_making',
      budget: 'free_or_low_cost',
      network: 'international_ok',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.equal(r.primaryRecommendations[0].tool.id, 'gamma-ai');
    },
  },
  {
    id: 'S11',
    label: 'Excel 数据与表格处理（国内直连 + 桌面端）',
    answers: {
      scene: 'office_efficiency',
      task: 'excel_data',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'desktop_client',
    },
    check: (r) => {
      assert.ok(
        ['tencent-workbuddy', 'alibaba-qoderwork', 'bytedance-traework'].includes(
          r.primaryRecommendations[0].tool.id,
        ),
      );
    },
  },
  {
    id: 'S12',
    label: '桌面自主跨应用执行（国内直连 + 桌面端）',
    answers: {
      scene: 'desktop_agent',
      task: 'desktop_automation',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'desktop_client',
    },
    check: (r) => {
      assert.ok(r.primaryRecommendations.length >= 2);
      assert.ok(!r.primaryRecommendations.some((c) => c.tool.id === 'trycua-cua'));
    },
  },
  {
    id: 'S13',
    label: '浏览器自动填表巡检（海外 + 订阅省心 + 网页即用）',
    answers: {
      scene: 'desktop_agent',
      task: 'browser_automation',
      budget: 'subscription_ok',
      network: 'international_ok',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.ok(
        ['grok-bot', 'manus-ai', 'lindy-ai', 'openai-dots'].includes(
          r.primaryRecommendations[0].tool.id,
        ),
      );
    },
  },
  {
    id: 'S14',
    label: '学术论文检索溯源（国内直连 + 网页即用）',
    answers: {
      scene: 'research_learning',
      task: 'literature_search',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.equal(r.primaryRecommendations[0].tool.id, 'metaso-ai');
    },
  },
  {
    id: 'S15',
    label: '长论文精读分析（海外可用 + 网页即用）',
    answers: {
      scene: 'research_learning',
      task: 'paper_reading',
      budget: 'free_or_low_cost',
      network: 'international_ok',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.ok(['notebooklm', 'elicit-research'].includes(r.primaryRecommendations[0].tool.id));
    },
  },
  {
    id: 'S16',
    label: '深度联网调研报告（国内直连 + 免费额度 + 网页即用）',
    answers: {
      scene: 'research_learning',
      task: 'deep_research',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.ok(['kimi-research', 'metaso-ai'].includes(r.primaryRecommendations[0].tool.id));
    },
  },
  {
    id: 'S17',
    label: '企业 RAG 知识库搭建（开源自托管 + 国内直连 + 私有化）',
    answers: {
      scene: 'workflow_automation',
      task: 'rag_knowledge',
      budget: 'self_host_control',
      network: 'domestic_direct',
      workMode: 'local_custom',
    },
    check: (r) => {
      assert.ok(['fastgpt', 'dify'].includes(r.primaryRecommendations[0].tool.id));
    },
  },
  {
    id: 'S18',
    label: '多模型 API 管理与桌面聚合（按量付费 + 桌面端 + 国内直连）',
    answers: {
      scene: 'model_local',
      task: 'api_management',
      budget: 'pay_as_you_go',
      network: 'domestic_direct',
      workMode: 'desktop_client',
    },
    check: (r) => {
      assert.ok(r.primaryRecommendations.some((c) => c.tool.id === 'cherry-studio'));
    },
  },
  {
    id: 'S19',
    label: '本地开源模型离线部署（完全免费 + 本地自定义 + 国内直连）',
    answers: {
      scene: 'model_local',
      task: 'local_deployment',
      budget: 'completely_free',
      network: 'domestic_direct',
      workMode: 'local_custom',
      hardConstraints: { mustLocalRun: true, mustCompletelyFree: true },
    },
    check: (r) => {
      const topIds = r.primaryRecommendations.map((c) => c.tool.id);
      assert.ok(topIds.includes('ollama') && topIds.includes('lm-studio'));
    },
  },
  {
    id: 'S20',
    label: 'AI 视频创作与会议纪要（多模态国内场景）',
    answers: {
      scene: 'visual_creation',
      task: 'video_generation',
      budget: 'free_or_low_cost',
      network: 'domestic_direct',
      workMode: 'web_simple',
    },
    check: (r) => {
      assert.ok(['kling-ai', 'jimeng-seedance'].includes(r.primaryRecommendations[0].tool.id));
    },
  },
];

function runTwentyScenarioTests() {
  console.log('=== 2. 20 组典型用户场景端到端回归测试 ===');
  for (const s of TWENTY_SCENARIOS) {
    const report = evaluateMatcherReport(NAV_TOOLS, s.answers);
    s.check(report);
    const names = report.primaryRecommendations.map((c) => `${c.tool.name}(${c.score})`).join(' | ');
    console.log(`✓ [${s.id}] ${s.label} => ${names}`);
  }
  console.log('');
}

function runBoundaryAssertions() {
  console.log('=== 3. 10 项关键边界条件断言 ===');

  // B1: Cherry Studio 在 website_build + pay_as_you_go + local_custom + domestic_direct 不得进主力且得分严格低于 dyad-local
  const b1 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'coding_web',
    task: 'website_build',
    budget: 'pay_as_you_go',
    network: 'domestic_direct',
    workMode: 'local_custom',
  });
  assert.ok(!b1.primaryRecommendations.some((c) => c.tool.id === 'cherry-studio'));
  assert.equal(b1.primaryRecommendations[0].tool.id, 'dyad-local');
  console.log('✓ B1: 建站场景下 Cherry Studio 被隔离出主力榜，dyad-local 主力胜出');

  // B2: 建站网页版 + 订阅制 + 海外网络 => 真实建站 SaaS 主力在前
  const b2 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'coding_web',
    task: 'website_build',
    budget: 'subscription_ok',
    network: 'international_ok',
    workMode: 'web_simple',
  });
  assert.ok(
    b2.primaryRecommendations
      .slice(0, 2)
      .every((c) => ['lovable-dev', 'vercel-v0', 'bolt-new', 'replit-agent'].includes(c.tool.id)),
  );
  console.log('✓ B2: 建站云端订阅场景命中真实全栈建站 SaaS 主力');

  // B3: api_management 下 Cherry Studio 作为主力进入推荐
  const b3 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'model_local',
    task: 'api_management',
    budget: 'pay_as_you_go',
    network: 'domestic_direct',
    workMode: 'desktop_client',
  });
  assert.ok(b3.primaryRecommendations.some((c) => c.tool.id === 'cherry-studio'));
  console.log('✓ B3: API 管理场景下 Cherry Studio 作为主力正常入选');

  // B4: 选择 no_preference 时按适用维度权重归一化（不会掉分到 63）
  const b4 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'coding_web',
    task: 'website_build',
    budget: 'no_preference',
    network: 'no_preference',
    workMode: 'no_preference',
  });
  assert.ok(
    b4.primaryRecommendations[0].score >= 90,
    `归一化总分异常偏低: ${b4.primaryRecommendations[0].score}`,
  );
  assert.equal(
    b4.primaryRecommendations[0].dimensionBreakdown.filter((d) => !d.applicable).length,
    3,
  );
  console.log(`✓ B4: 3 项暂不限制权重归一化生效（Top1=${b4.primaryRecommendations[0].score}/100）`);

  // B5: website_build + mustCompletelyFree=true 诚实空结果（宁缺毋滥，不塞入 BYOK 或限额版）
  const b5 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'coding_web',
    task: 'website_build',
    budget: 'completely_free',
    network: 'no_preference',
    workMode: 'no_preference',
    hardConstraints: { mustCompletelyFree: true },
  });
  assert.equal(b5.primaryRecommendations.length, 0);
  assert.ok(b5.noPrimaryMatchReason && b5.noPrimaryMatchReason.length > 10);
  console.log('✓ B5: 建站+完全免费硬约束下诚实返回 0 个主力工具与原因说明');

  // B6: mustLocalRun=true 不得出现纯云端工具或连云闭源客户端
  const b6 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'desktop_agent',
    task: 'desktop_automation',
    budget: 'no_preference',
    network: 'no_preference',
    workMode: 'local_custom',
    hardConstraints: { mustLocalRun: true },
  });
  for (const ev of [...b6.primaryRecommendations, ...b6.assistantRecommendations]) {
    assert.ok(
      !['cloud_saas', 'cloud_agent'].every((m) => ev.tool.deploymentModes.length === 1 && ev.tool.deploymentModes[0] === m),
      `${ev.tool.id} 不应通过 mustLocalRun`,
    );
    assert.ok(
      ev.tool.deploymentModes.includes('local_inference') ||
        ev.tool.deploymentModes.includes('self_hosted') ||
        (!ev.tool.deploymentModes.includes('cloud_saas') &&
          !ev.tool.deploymentModes.includes('cloud_agent')),
      `${ev.tool.id} 连云依赖未通过 mustLocalRun 严格校验`,
    );
  }
  console.log('✓ B6: mustLocalRun 硬性拦截纯云端与连云客户端生效');

  // B7: mustDomesticDirect=true 不得出现 international_required 或 unknown
  const b7 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'desktop_agent',
    task: 'desktop_automation',
    budget: 'no_preference',
    network: 'domestic_direct',
    workMode: 'no_preference',
    hardConstraints: { mustDomesticDirect: true },
  });
  for (const ev of [...b7.primaryRecommendations, ...b7.assistantRecommendations]) {
    assert.notEqual(ev.tool.networkAvailability, 'international_required');
    assert.notEqual(ev.tool.networkAvailability, 'unknown');
  }
  assert.ok(b7.unverifiedHardConstraintTools.some((u) => u.tool.id === 'lava-workspace'));
  console.log('✓ B7: mustDomesticDirect 硬性拦截海外工具并将 unknown（Lava）放入未核实名单');

  // B8: unknown 字段绝不默认视为高置信度或完全满足
  const b8 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'desktop_agent',
    task: 'desktop_automation',
    budget: 'completely_free',
    network: 'domestic_direct',
    workMode: 'desktop_client',
    hardConstraints: { mustCompletelyFree: true },
  });
  assert.ok(b8.unverifiedHardConstraintTools.some((u) => u.tool.id === 'meta-muse-agent'));
  const metaMuseEv = b8.unverifiedHardConstraintTools.find((u) => u.tool.id === 'meta-muse-agent');
  assert.ok(metaMuseEv && metaMuseEv.confidence === 'low' && metaMuseEv.dataCompleteness < 100);
  console.log('✓ B8: 缺失公开收费字段的工具保持 low 置信度，并在完全免费硬筛选下被诚实隔离');

  // B9: 非底座任务中基础设施工具不得混入主力
  const b9 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'desktop_agent',
    task: 'browser_automation',
    budget: 'no_preference',
    network: 'no_preference',
    workMode: 'no_preference',
  });
  assert.ok(!b9.primaryRecommendations.some((c) => c.tool.id === 'trycua-cua'));
  assert.ok(!b9.primaryRecommendations.some((c) => c.tool.id === 'mcp-protocol'));
  console.log('✓ B9: 非基础设施任务自动隔离 Cua 沙箱 / MCP 协议等底层组件');

  // B10: 语音会议（音频生态）验证软件免费 vs 额度说明区分
  const b10 = evaluateMatcherReport(NAV_TOOLS, {
    scene: 'audio_meeting',
    task: 'speech_to_text',
    budget: 'free_or_low_cost',
    network: 'domestic_direct',
    workMode: 'no_preference',
  });
  assert.ok(['fish-audio', 'tongyi-tingwu'].includes(b10.primaryRecommendations[0].tool.id));
  console.log('✓ B10: 音频转写场景准确命中国内语音生态主力并区分收费口径\n');
}

runIntegrityChecks();
runTwentyScenarioTests();
runBoundaryAssertions();
console.log('🎉 全部 75 工具完整性校验 + 20 场景测试 + 10 项边界断言 100% 通过！');
