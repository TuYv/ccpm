---
name: moai-workflow-gan-loop
description: >
  Builder-Evaluator GAN loop workflow for iterative design quality improvement.
  Implements Sprint Contract negotiation, 4-dimension scoring (Design Quality,
  Originality, Completeness, Functionality), stagnation detection, and
  escalation protocol. Reads parameters from design.yaml.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "1.0.0"
  category: "workflow"
  status: "active"
  updated: "2026-04-20"
  tags: "gan loop, builder evaluator, sprint contract, scoring, quality, iterative"
  related-skills: "moai-domain-brand-design, moai-domain-copywriting, moai-foundation-quality"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000

# MoAI Extension: Triggers
triggers:
  keywords: ["gan loop", "builder evaluator", "quality score", "pass threshold", "sprint contract", "iterative review", "design quality"]
  agents: ["evaluator-active", "expert-frontend"]
  phases: ["run"]
---
# moai-workflow-gan-loop

实现用于迭代提升设计质量的构建器-评估器 GAN 循环。整合自 agency constitution 第 11 节和第 12 节。集成了冲刺契约协议、四维评分、停滞检测以及评估器宽松度防范机制。

所有循环参数均从 `.moai/config/sections/design.yaml` 读取。请勿硬编码阈值。

---

## 快速参考

### 循环参数（来自 design.yaml）

```
design.gan_loop:
  max_iterations: 5          # Maximum Builder-Evaluator cycles
  pass_threshold: 0.75       # Score >= this value to exit loop
  escalation_after: 3        # Escalate to user after N iterations without passing
  improvement_threshold: 0.05  # Minimum score delta per iteration
  strict_mode: false         # If true, each dimension must pass individually
  sprint_contract:
    enabled: true
    required_harness_levels: [thorough]
    optional_harness_levels: [standard]
    artifact_dir: ".moai/sprints"
    max_negotiation_rounds: 2
```

### 四维评分权重

| 维度 | 权重 | 描述 |
| --- | --- | --- |
| 设计质量 | 30% | 视觉一致性、品牌令牌合规性、符合 WCAG AA |
| 原创性 | 25% | 不通用、无 AI 粗制滥造感、具有独特的品牌表达 |
| 完整性 | 25% | 包含所有 BRIEF 章节，文案符合契约 |
| 功能性 | 20% | 响应式、无障碍、所有交互均正常工作 |

总分 = 四个维度的加权平均值。

通过条件：`overall_score >= pass_threshold`，并且（如果 `strict_mode: true`）每个维度的得分均 >= `pass_threshold`。

---

## 实施指南

### GAN 循环执行流程

**阶段 1：冲刺契约（当执行框架级别要求时）**

当 `harness_level == thorough` 时为必需。
当 `harness_level == standard` 且用户选择启用时为可选。
当 `harness_level == minimal` 时跳过。

冲刺契约生成：
1. 评估器分析 BRIEF 文档和当前迭代范围。
2. 评估器生成冲刺契约文档：
   - `acceptance_checklist`：本次迭代具体且可测试的标准
   - `priority_dimension`：需要重点关注的四个维度之一
   - `test_scenarios`：具体的验证步骤
   - `pass_conditions`：每项标准的最低得分
3. 构建器审查契约：
   - 接受：继续实施
   - 请求调整：提出替代方案（最多进行 `max_negotiation_rounds` 轮）
4. 契约保存至 `design.gan_loop.sprint_contract.artifact_dir/sprint-N.json`

约束：评估器不得根据冲刺契约之外的标准评分。构建器不得在没有证据的情况下声称已满足标准。

**阶段 2：构建器执行**

构建器基于以下内容实施：
- 已接受的冲刺契约（如果存在）
- BRIEF 文档
- 来自 `moai-domain-copywriting` 的文案 JSON
- 来自 `moai-domain-brand-design` 或 `moai-workflow-design`（路径 A 处理器）的设计令牌

构建器输出：代码文件、渲染预览（如果 Playwright 可用）、实施说明。

**阶段 3：评估器评分**

评估器使用评估器宽松度防范机制，按照 4 个维度进行评分：

1. **评分标准锚定**：依据评分标准对每个维度进行评分（以 0.25 为增量），并提供明确理由。未引用评分标准的分数无效。
2. **仅基于证据的结论**：没有具体证据（截图、测试输出、代码引用）不得判定为 PASS。
3. **反模式交叉检查**：在最终确定前检查已知反模式。任何检测到反模式的相关维度得分上限为 0.50。
4. **必须通过防火墙**：文案完整性、移动端视口和 WCAG AA 是必须通过的标准。任何必须通过项失败，无论其他得分如何，整体结果均为 FAIL。

输出：在 `sprint_contract.artifact_dir` 中生成 `evaluation-report-N.json`。

**阶段 4：循环决策**

```
if overall_score >= pass_threshold:
    EXIT LOOP → proceed to next phase
elif iteration >= max_iterations:
    ESCALATE → present failure report to user
elif stagnation_detected:
    ESCALATE → present stagnation options
else:
    ITERATE → pass feedback to Builder, increment N
```

**阶段 5：迭代反馈**

如果返回循环：
1. 评估器针对每项未通过的标准生成有针对性的反馈。
2. 构建器接收反馈和之前的 Sprint Contract。
3. 之前已通过的标准继续有效（不允许回归）。
4. 仅针对未通过的标准生成新的 Sprint Contract。

---

### 停滞检测

当连续两次或更多次迭代之间的分数提升低于 `improvement_threshold` 时，即检测到停滞。

跟踪：
- 每次迭代后，在 sprint 构件中记录 `{iteration: N, score: X}`。
- 计算 `delta = score[N] - score[N-1]`。
- 如果最近两次迭代的 `delta < improvement_threshold`，则标记为停滞。

检测到停滞时，通过 AskUserQuestion 向用户升级，并提供三个选项：
1. 继续使用当前方法（评估器尝试关注不同的维度）
2. 调整标准（用户提供指导或放宽约束）
3. 中止循环（按原样接受当前输出）

`escalation_after` 迭代时的升级触发条件独立生效：如果经过 3 次迭代仍未获得 PASS 分数，则无论是否处于停滞状态都要升级。

---

### 评估器宽松度防范机制

以下 5 项机制用于防止分数虚高，且必须应用于每次评估：

**机制 1：评分标准锚定**

每个维度的分数说明：
- 0.25：存在重大缺陷，大多数标准未通过
- 0.50：部分符合，仍存在显著问题
- 0.75：基本符合，仅存在少量问题
- 1.00：完全符合，未发现问题

在给出数值分数之前，始终说明适用的评分标准等级及其原因。

**机制 2：必须通过防火墙**

无论其他分数如何，以下情况都会导致立即 FAIL：
- 文案文本与原始 `copy.json` 或 BRIEF 的文案部分不一致
- 检测到 AI 粗制滥造：以紫色渐变（#8B5CF6-#6D28D9）作为主要视觉元素，并搭配通用白色卡片
- 375px 宽度下的移动端视口显示异常（内容溢出、文本无法阅读）
- 任何交互元素返回 404 或进入损坏状态
- Lighthouse Accessibility < 80

**机制 3：反模式惩罚**

已知会将维度分数上限限制为 0.50 的反模式：
- 使用未经品牌定制的通用图标集（原创性分数受限）
- 在设计令牌尺度之外使用硬编码的间距值（设计质量分数受限）
- 非装饰性图片缺少 `alt` 属性（功能性分数受限）
- 区块文案与约定文案不一致（完整性分数受限）

**机制 4：证据要求**

每个维度的评分都必须引用具体证据：
- 设计质量：引用令牌文件路径和 WCAG 对比度
- 原创性：说明设计的非通用之处
- 完整性：列出 BRIEF 中的每个区块及其实现状态
- 功能性：引用测试结果或 Playwright 输出

**机制 5：回归基线**

如果先前的迭代已通过某项标准，则当前迭代必须继续满足该标准。若先前已通过的标准出现回归，将自动降低相关维度的分数。

---

### Sprint 契约结构

Sprint 契约文档格式（`sprint-N.json`）：

```json
{
  "sprint_id": "sprint-N",
  "iteration": N,
  "priority_dimension": "Design Quality | Originality | Completeness | Functionality",
  "acceptance_checklist": [
    {
      "id": "AC-01",
      "criterion": "Hero headline contrast ratio >= 4.5:1",
      "verification": "Check color pair with contrast calculator",
      "status": "pending | passed | failed"
    }
  ],
  "test_scenarios": [
    {
      "id": "TS-01",
      "description": "Mobile viewport renders without horizontal scroll",
      "tool": "Playwright | visual inspection",
      "command": "playwright test --viewport 375x667"
    }
  ],
  "pass_conditions": {
    "Design Quality": 0.75,
    "Originality": 0.70,
    "Completeness": 0.80,
    "Functionality": 0.75
  },
  "negotiation_history": [],
  "created_at": "ISO-8601"
}
```

---

## 高级模式

### 严格模式

当 `design.yaml` 中的 `strict_mode: true` 时：
- 4 个维度的分数必须分别达到 `pass_threshold`。
- 仅加权平均分达标是不够的。
- 即使第一次迭代的加权平均分已达标，也至少需要进行 2 次迭代。
- 对于面向客户的交付成果，建议使用严格模式。

### 独立重新评估

每逢第 5 个项目都会触发独立重新评估：
- 使用彼此独立的提示词对同一个构建成果进行两次评分。
- 如果分数差异超过 0.10，则记录一条校准警告。
- 校准结果存储在 `sprint_contract.artifact_dir/calibration-log.json` 中。

### Playwright 集成

当 claude-in-chrome MCP 或 Playwright 可用时，评估器会使用自动化测试：
- 桌面端截图（1280x720）：完整页面
- 移动端截图（375x667）：完整页面
- 交互测试：点击所有 CTA，验证没有 404 错误
- 无障碍扫描：自动执行 WCAG 检查

当测试工具不可用时，仅回退到静态代码分析，并在评估报告中注明此限制。

---

## 适合搭配使用

- `moai-domain-brand-design`：提供由 Evaluator 在设计质量维度中验证的设计令牌
- `moai-domain-copywriting`：Copy JSON 是完整性维度的参考依据
- `evaluator-active`：GAN 循环在每次评分过程中编排 evaluator-active
- `moai-workflow-design`：提取的令牌（路径 A）作为设计参考基线

---

来源：于 2026-04-20 吸收自机构章程（第 11 节 GAN 循环契约、第 12 节防止 Evaluator 宽松评估）。
REQ 覆盖范围：REQ-SKILL-011、REQ-SKILL-012、REQ-SKILL-012a、REQ-SKILL-013、REQ-SKILL-014、REQ-CONST-004
版本：1.0.0