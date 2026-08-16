---
name: skill-writer
description: Create, synthesize, and iteratively improve agent skills following the Agent Skills specification. Use when asked to "create a skill", "write a skill", "synthesize sources into a skill", "improve a skill from positive/negative examples", "update a skill", or "maintain skill docs and registration". Handles source capture, precision passes, authoring, registration, and validation.
---
# Skill 编写器

将此作为创建和改进 Skill 的唯一规范工作流。
首要成功条件：在编写前最大限度覆盖高价值输入，同时尽量减少无效的运行时 token 消耗。

按顺序执行工作流步骤。仅加载当前步骤所需的参考文件。
`SKILL.md` 是主路由器：所有随附的参考文件都应直接放在 `references/` 下，并在此处列出，同时注明直接的“何时打开……”理由。

## 核心工作流参考资料

| 当你需要……时打开 | 阅读 |
|--------------------------|------|
| 为创建、更新、迭代或研究优先型工作选择最精简的工作流路径 | `references/mode-selection.md` |
| 在决定文件之前选择能够满足需求的最简单执行形式 | `references/execution-shapes.md` |
| 应用有关深度、简洁性和可移植性的写作约束 | `references/design-principles.md` |
| 决定哪些内容应放入 `SKILL.md`、`references/`、`SPEC.md` 或支持文件 | `references/reference-architecture.md` |
| 创建或更新 Skill 的维护契约 | `references/spec-template.md` |
| 查找缺失的高信号来源，包括历史记录和回归问题 | `references/source-discovery.md` |
| 将上游提示词、工作流、评分标准、基准或文档改编为 Skill | `references/source-adaptation.md` |
| 运行包含覆盖检查和来源捕获的完整综合流程 | `references/synthesis-path.md` |
| 编写或更新 `SKILL.md`、`SPEC.md` 和支持文件 | `references/authoring-path.md` |
| 改进触发语言以及误报/漏报行为 | `references/description-optimization.md` |
| 根据正面示例、负面示例或修复示例进行迭代 | `references/iteration-path.md` |
| 存储持久的工作示例和留出示例，以供未来修订使用 | `references/iteration-evidence.md` |
| 选择响应模板、模式或输出契约 | `references/output-contracts.md` |
| 为 Skill 的生成输出或运行时行为添加或更新评估 | `references/skill-evals.md` |
| 排查布局过载、隐藏参考资料或其他结构故障 | `references/structure-troubleshooting.md` |
| 注册 Skill 并运行最终验证检查 | `references/registration-validation.md` |

## 构件布局参考资料

| 当你需要……时打开 | 阅读 |
|--------------------------|------|
| 将整个 Skill 以内联方式保留在一个连贯的 `SKILL.md` 中 | `references/layout-inline-skill.md` |
| 将可选的深层知识拆分为聚焦且可路由的参考资料 | `references/layout-reference-backed-skill.md` |
| 添加脚本以实现确定性自动化或验证 | `references/layout-script-backed-workflow.md` |
| 定义通常使用显式参数调用的 Skill | `references/layout-argument-driven-skill.md` |
| 随 Skill 提供可复用模板、模式或其他静态资产 | `references/layout-asset-template-skill.md` |

## 工作流机制参考资料

| 当你需要……时打开 | 阅读 |
|--------------------------|------|
| 将任务拆分为固定的有序步骤 | `references/workflow-prompt-chaining.md` |
| 对请求进行分类并将其路由到不同的下游路径 | `references/workflow-routing.md` |
| 将独立工作拆分为并行单元或投票 | `references/workflow-parallel.md` |
| 动态发现工作单元并协调工作器输出 | `references/workflow-orchestrator-workers.md` |
| 在编写或执行期间运行“验证—修复—重复”检查 | `references/workflow-validation-loops.md` |
| 在执行高风险操作前验证计划 | `references/workflow-plan-validate-execute.md` |

## Claude Code 参考资料

| 当你需要……时打开 | 阅读 |
|--------------------------|------|
| 使用 Claude 特有的 frontmatter 或调用控制机制 | `references/claude-frontmatter-invocation.md` |
| 使用 Claude 参数字段或替换变量 | `references/claude-argument-substitutions.md` |
| 构建在隔离的 `context: fork` 中运行的技能 | `references/claude-subagent-fork.md` |
| 构建使用 Claude hooks 实施确定性约束的技能 | `references/claude-hook-backed.md` |
| 使用 Claude shell 预处理来动态注入上下文 | `references/claude-dynamic-context.md` |

## 示例配置

| 当你需要……时打开 | 阅读 |
|--------------------------|------|
| 查看文档密集型技能应达到的详细程度 | `references/example-documentation-skill.md` |
| 查看工作流流程型技能应达到的详细程度 | `references/example-workflow-process-skill.md` |
| 查看优秀的路由型技能是什么样的 | `references/example-router-skill.md` |
| 查看优秀的子代理分叉型技能是什么样的 | `references/example-subagent-fork-skill.md` |
| 查看优秀的 hook 支持型技能是什么样的 | `references/example-hook-backed-skill.md` |

## 第 1 步：确定目标、路径和形态

1. 确定预期操作（`create`、`update`、`synthesize`、`iterate`），并在选择文件所属位置之前检查工作区中的既有实践。
2. 根据观察到的约定选择目标技能根目录。如果检查后仍不清楚规范位置，请在编辑文件前直接询问一个问题。
3. 阅读 `references/mode-selection.md`，以选择所需的最少工作流路径。
4. 阅读 `references/execution-shapes.md`，以选择主要执行形态。
5. 默认选择足以满足需求的最简单形态。如果选择更复杂的形态，请记录拒绝更简单形态的原因。
6. 仅加载该形态所需的具体产物布局、工作流机制和提供商特定的叶级文件。
7. 在添加指导内容之前，确定应当收窄、替换或移除哪条现有规则、哪个章节或哪个文件。
8. 在使用提供商特定机制之前，记录其可移植性影响。

## 第 2 步：在需要时进行综合

阅读 `references/synthesis-path.md`。

1. 将此路径用于新技能、实质性变更以及研究优先的规划。
2. 收集相关来源，并根据出处对其评分。
3. 当来源材料不足、陈旧或含糊时，阅读 `references/source-discovery.md`。
4. 当改编上游提示词、工作流、评分标准、基准或文档时，阅读 `references/source-adaptation.md`。
5. 生成有来源支持的决策以及覆盖情况/缺口状态，包括类别和执行形态的选择。
6. 仅当示例配置能为所选类别或形态增加具体深度时，才加载它们。
7. 如果该技能使用提供商特定机制，请纳入提供商当前的官方文档，并记录使用限制。
8. 在理解所需覆盖范围或明确缺口之前，不要进入编写阶段。

## 第 3 步：根据结果/示例进行改进时，先执行迭代流程

当所选路径包含 `iteration`（例如操作 `iterate`）时，首先阅读 `references/iteration-path.md`。

1. 捕获示例并进行匿名化处理，同时记录来源。
2. 当示例需要在当前轮次之后继续保留时，阅读 `references/iteration-evidence.md`。
3. 根据工作切片和留出切片审查技能行为。
4. 基于正面、负面和修正证据提出改进建议。
5. 将具体的行为变化落实到编写过程中。

当所选路径不包含 `iteration` 时，跳过此步骤。

## 步骤 4：编写或更新技能产物

阅读 `references/authoring-path.md`。

1. 使用祈使语气编写或更新 `SKILL.md`，并提供包含丰富触发条件的描述。
2. 将 `SKILL.md` 保持为运行时路由器，而不是百科全书。
3. 在创建新章节或文件之前，运行 `references/authoring-path.md` 中的编辑前精度检查。
4. 在添加大量指令或新的参考文件之前，阅读 `references/reference-architecture.md`。
5. 创建新技能或对其契约进行实质性更改时，使用 `references/spec-template.md` 创建或更新 `SPEC.md`。
6. 仅当每个聚焦的参考文件、脚本和资源都有明确的“何时打开……”理由，并且无法通过收紧现有文件来处理时，才创建或更新它们。
7. 如果添加了捆绑的参考文件，请在此 `SKILL.md` 中为其添加直接路由条目。
8. 优先使用检查清单、表格、模板和输入/输出示例，而不是解释性文字。
9. 仅遵循为此技能选定的特定产物布局、工作流机制、Claude 特定要求和输出契约参考资料。
10. 对于高级执行形式，在认为技能完成之前，添加所需的路由、委派或安全契约。
11. 对于编写器/生成器类技能，在参考资料中包含转换后的示例：
   - 理想路径
   - 安全/稳健变体
   - 反模式 + 修正版
12. 当请求要求为正在编写的技能提供评估、回归用例、基准测试用例或模型评分的质量检查时，阅读 `references/skill-evals.md`。
13. 对技能产物进行任何更改后，在描述优化或验证之前，运行 `references/authoring-path.md` 中的更改后精度检查。

## 步骤 5：优化描述质量

阅读 `references/description-optimization.md`。

1. 验证应触发和不应触发的查询集。
2. 通过有针对性的描述编辑来减少误报和漏报。
3. 除非该技能特意限定于特定提供商，否则应让触发语言在不同提供商之间保持通用。

## 步骤 6：注册并验证

阅读 `references/registration-validation.md`。

1. 针对已在工作区中验证的当前布局，执行仓库注册步骤。
2. 运行快速验证以进行结构检查。
3. 在完成之前，运用判断力审查验证器警告、精度检查结果和覆盖缺口。

## 输出格式

返回：

1. `Summary`
2. `Changes Made`
3. `Validation Results`
4. `Open Gaps`