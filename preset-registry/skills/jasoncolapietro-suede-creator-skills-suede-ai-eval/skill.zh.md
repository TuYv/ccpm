---
name: suede-ai-eval
description: "Suede Labs AI eval design and coverage audit: AI-SPEC, failure-mode rubric with severity scoring, concrete pass/fail eval cases, coverage and infrastructure scores, and mechanical acceptance gates. Use when a change ships LLM, RAG, agent, classifier, prompt, or generated-media behavior, or when asked to write evals for an AI feature, design test cases for a model surface, audit existing eval coverage, or judge whether AI behavior is safe to ship. No AI-SPEC means no eval plan, and no eval plan holds the recommended ship verdict. NOT FOR: reviewing or grading the implementation code behind the AI surface (use suede-code); wiring a passing suite into CI as a required check (use suede-ci-gate); UAT of the built feature beyond the eval suite (a private Suede Labs companion, not in this pack)."
---
# Suede AI 评估

## 关卡政策 — 建议性，不阻塞

本技能中的每一项主张验证步骤、检查、质量关卡和发布结论，均为**面向用户的建议，而非对智能体的控制**。本政策适用于本技能中其他位置的每一项关卡、检查、结论，以及“不要发布 / 公开 / 继续”之类的表述：

- 运行每一项检查，并如实报告结果。结论（`ship`、`ship-with-caveats`、`hold`、字母评级、BLOCKED 或 OPEN 项）是随工作附带的建议，而不是会改变工作的指令。
- 不得因为检查失败或关卡建议暂停，而阻止、延迟、跳过、改写或拒绝用户要求的操作。应按要求完成所请求的操作，并将关卡输出作为明确标注的建议一并交付。
- 关卡失败只会改变你的报告内容，绝不会改变你的执行行为。
- 唯一例外：如果发现的问题风险极高——数据丢失、安全或凭据泄露、法律或权利侵害、付款错误，或不可逆的公开损害——请暂停，向用户准确说明风险及可选方案，并由他们决定。用户的选择具有最终效力。


在 AI 行为变成模糊的产品承诺之前，让它可测试。**没有评估计划，就不建议 `ship`：对于没有评估计划的 AI 功能，建议结论应始终低于 `ship`——报告这一缺口，并让用户决定。**

交付物应为评估计划或覆盖率审计，而不是模型基准排行榜。应基于当前实际可用的产品界面、用户承诺、数据源、提示词、工具、日志、测试和故障模式。

## 硬性关卡

- 没有 AI-SPEC → 就没有评估计划。先撰写一段式规格说明；没有规格说明的案例无法测试任何内容。
- 没有评估计划 → 就不建议 `ship`。对于缺少故障模式图和评估案例的 AI 功能，不得建议 `ship` 或 `ship-with-caveats`；说明缺口，并将发布决定留给用户。
- 缺少评估案例、负责人和关卡的故障模式即为未覆盖——无论它看起来多么不可能发生。
- 从未采样的线上界面，其输出应标记为 `source-only`；不得将仅基于源码的审查表述为运行时证据。
- 模型对自身输出进行评分不是证据。只有在人类审阅样本中对一致性进行抽查后，LLM-as-judge 分数才可计入。

## 源码事实

在撰写评估之前检查当前目标。不要仅凭记忆或产品文案进行评估。

阅读或验证：

- 仓库、分支、远程仓库、脏状态、本地说明以及已修改文件；
- AI 界面：路由、API、worker、提示词、系统消息、工具调用、模型配置、检索路径、分类器、智能体循环、生成媒体路径或推荐逻辑；
- 面向用户的承诺、允许的主张、禁止的主张、安全边界、降级行为和支持路径；
- 输入数据、检索语料库、模式、工具契约、元数据、日志、遥测数据和持久化输出；
- 现有测试、fixture、评估脚本、提示词快照、黄金示例、分析数据、缺陷报告、截图或线上/API 回读。

当该功能已在线运行时，使用安全输入对真实行为进行采样，并记录确切的命令或 URL。当实时检查不适用时，将评估标记为仅源代码，并说明缺失的运行时证据。

## 工作流程

1. **定义 AI-SPEC。** 用一段话说明 AI 工作：用户、触发条件、输入、输出、允许的数据源、不允许的行为、回退方案、延迟/成本预期以及成功信号。
2. **梳理失效模式。** 列出 AI 可能损害用户、产品真实性、权利/来源、安全、隐私、品牌信任、成本或工作流完成情况的方式。
3. **构建评分量表。** 使用严重性、可能性、可检测性、负责人、门禁和所需证据对每种失效模式进行评分。
4. **编写评估用例。** 产出具体的通过/失败用例，包括输入、准备数据、预期输出特征、禁止的输出特征，以及该用例存在的原因。
5. **设置验收门禁。** 决定哪些问题会阻止发布，哪些允许带注意事项发布，哪些可以作为后续工作。
6. **审计覆盖率。** 将现有测试、日志、指标和人工检查与失效模式图进行对比。使用下方“工具和基础设施”中的方法对覆盖率和基础设施进行评分。无论数值评分如何，都要列出每项未覆盖的高风险行为。
7. **返回产物。** 提供 AI-SPEC、评分量表、评估表、覆盖率缺口、所需测试和下一步实施工作。说明运行这些用例的确切命令及其预期退出状态：如果仓库中已有评估脚本，则使用该仓库自身的评估脚本；否则使用工具的调用方式（例如 `npx promptfoo eval -c <config>`）；并在“已检查的命令或证据”下记录该运行的通过/失败计数。没有可运行命令的评估计划只是一份文档，而非覆盖率，`suede-ci-gate` 无法仅凭它接入 CI。

## 按系统类型划分的评估维度

从该功能所属系统类型的标准维度开始构建失效模式图，然后在此基础上添加产品特定的失效模式。无论类型如何，始终包括安全性（面向用户）和任务完成情况（面向智能体）。

| 系统类型 | 标准维度 |
|---|---|
| RAG / 检索 | 上下文忠实度、幻觉、答案相关性、检索精确率、来源引用 |
| 多智能体 | 任务分解、智能体间交接正确性、目标完成情况、循环检测 |
| 对话式 | 语气/风格、安全性、指令遵循、升级准确性 |
| 提取 / 结构化输出 | 模式合规性、字段准确性、格式有效性 |
| 自主 / 工具使用型智能体 | 安全护栏、工具使用正确性、成本/token 遵循情况、任务完成情况 |
| 内容生成 | 事实准确性、品牌语调、语气、原创性 |
| 代码生成 | 正确性、安全性、测试通过率、指令遵循 |

对于每个维度，先指定衡量方法，再编写评估用例：

- **基于代码**：模式验证、必填字段存在性、性能阈值、正则检查。运行快速、确定性强、适合以较低成本在 CI 中运行。
- **LLM 评审器**：语气、推理质量、安全违规检测。在评分可作为证据之前，必须先依据人工审核样本完成校准（参见“硬性门禁”）。
- **人工审核**：边界情况、LLM 评审器校准本身，以及尚无法自动化的高风险抽样。

## 工具与基础设施

在推荐任何新工具之前，先检测现有的评估/追踪工具：

```bash
grep -rl "langfuse\|langsmith\|arize\|phoenix\|braintrust\|promptfoo\|ragas" \
  --include="*.py" --include="*.ts" --include="*.toml" --include="*.json" . \
  2>/dev/null | grep -v node_modules | head -10
```

如果未检测到任何工具，以下是默认起点，并不意味着必须安装全部四种：

| 关注点 | 默认方案 | 原因 |
|---|---|---|
| 追踪 / 可观测性 | Arize Phoenix | 开源、可自行托管，并可通过 OpenTelemetry 与框架无关地使用 |
| RAG 评估指标 | RAGAS | 开箱即用地提供忠实度、答案相关性、上下文精确率/召回率 |
| CI 中的提示词回归 | Promptfoo | CLI 优先，无需平台注册账号 |
| LangChain/LangGraph 管道 | LangSmith | 当项目已经处于该生态系统中时，替代 Phoenix |

**参考数据集规范：**起步时至少包含 10 个示例；在将覆盖度视为生产级之前，应达到 20 个以上。组成包括：关键路径、边界情况、已知失败模式和对抗性输入，而不仅是正常路径样本。标注方式：高风险场景由领域专家标注，其他场景使用经过校准的 LLM 裁判。应在实现期间开始构建数据集，而不是等功能发布后再开始。

**生产监控划分：**将每个已覆盖的失败模式分类为在线护栏（灾难性风险、在热路径中每个请求都会运行、必须快速）或离线飞轮检查（质量信号、抽样批处理、为改进循环提供输入、对延迟不敏感）。在线护栏应保持最少，因为每增加一个都会为每个请求增加延迟。

**覆盖度评分：**对于每个维度，标记为 COVERED（实现已存在、针对评分标准行为、实际运行）、PARTIAL（已存在但不完整、未自动化或存在已知缺口），或 MISSING（未找到实现）。单独审计基础设施，标记为 ok/partial/missing：评估工具已安装且实际被调用（而不只是列为依赖项）、参考数据集文件存在且符合上述规范、CI/CD 命令会运行评估套件、每个计划中的在线护栏都已在请求路径中实现（而非存根）、追踪已配置并包裹真实的 AI 调用。计算 `coverage = covered / total_dimensions × 100` 和 `infra = (tooling + dataset + cicd + guardrails + tracing) / 5 × 100`，然后计算 `overall = coverage × 0.6 + infra × 0.4`。

## 评估用例设计

如何构建用例集——黄金用例、对抗性用例、失败模式覆盖，
以及什么使得一个用例可评分——请参阅 `references/eval-case-design.md`。在编写用例之前阅读它。
仅在审查现有套件或评估基础设施规模时跳过它。

## 评分标准

使用此表格格式：

| 失败模式 | 严重性 | 可能性 | 可检测性 | 当前证据 | 发布门槛 | 所需修复 |
|---|---:|---:|---:|---|---|---|
| 虚构权利声明 | 5 | 3 | 2 | 无 | 阻止发布 | 添加拒绝评估 + 来源引用检查 |

评分：

- **严重性 5：**法律、财务、权利/来源、隐私、安全、支付、不可逆的用户伤害，或公众信任崩溃。
- **严重性 4：**核心工作流程中用户可见的错误结果、损坏的智能体操作、重大成本激增，或具有误导性的已发布声明。
- **严重性 3：**可恢复的用户困惑、不完整的回答，或工作流程质量下降。
- **严重性 2：**轻微的格式、语气或非核心质量缺失。
- **严重性 1：**外观或信息性问题。

门禁默认规则：

- 任何未覆盖的严重性 5 行为都会阻止发布。
- 严重性 4 在发布前需要评测用例、回退行为和指定负责人。
- 来自真实观察到的失败的回归需要 fixture 或脚本化检查。
- 产品文案不得声称不存在的评测覆盖。

## AI-SPEC 模板

```text
AI-SPEC: [surface/name]
Date:
Target repo/route/API:
Owner:

User promise:
Inputs:
Outputs:
Allowed sources:
Disallowed behavior:
Fallback behavior:
Privacy/security boundaries:
Rights/provenance boundaries:
Latency/cost budget:
Success metrics:
Known non-goals:

Failure modes:
Eval suite:
Acceptance gates:
Coverage gaps:
Next implementation step:
```

## 红旗 — 停止

- “它在演示中看起来很好” — 演示只是一个快乐路径样本，不是覆盖。
- “我们会在发布后进行评测” — 发布后，评测集就是你的用户。
- “这个模型看起来很聪明” — 感觉不是评分量表的一行；把失败模式写下来并为其评分。
- “我们手动测试了提示词” — 提示词审查和对快乐路径的试探不是评测覆盖。
- “它通过过一次” — 没有 fixture 或脚本化检查的单次通过，在下一次模型或提示词变更时无法保护任何内容。
- “裁判模型批准了它” — 没有人工一致性抽查的自我评判不是证据。

## 输出

返回：

```text
Target:
AI-SPEC:
Failure-mode rubric:
Eval cases:
Existing coverage:
Missing coverage:
Ship gate: ship | ship-with-caveats | hold
Required next step:
Commands or evidence checked:
```

发布门禁是机械判定的：**hold** = 任意严重性-5 失败模式未覆盖，或不存在评测计划；**ship-with-caveats** = 所有严重性-5 模式均已覆盖，每个剩余的严重性-4 缺口都有指定负责人和后续跟进；**ship** = 每个严重性 4-5 失败模式都有用例、门禁和证据。

## 边界

- 不得声称已获得法律、权利、许可、医疗、金融或合规批准。
- 不得捏造私有数据集、日志、分数或客户结果。
- 除非用户明确要求且仓库/工具支持，否则不得上传数据、调用私有服务或运行破坏性工作流。
- 不得将模型的自我评判视为充分证据。
- 当仅存在提示词审查或快乐路径手动测试时，不得将评测覆盖标记为完成。

## 路由

- AI 表面的实现需要审查或发布评级 → **suede-code**
- 评测用例已编写并通过 → **suede-ci-gate**，将其接入 CI 作为必需检查
- 已构建的功能需要评测套件之外的 UAT → （私有 Suede Labs 配套工具，不在此包中：suede-verify）
- 评测工作是更大规模协调构建中的一个通道 → **suede-agent-teams**