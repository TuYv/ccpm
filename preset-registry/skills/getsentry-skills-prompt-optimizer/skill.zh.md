---
name: prompt-optimizer
description: Creates, optimizes, and iteratively refines agent prompts, system prompts, developer prompts, and reusable prompt templates. Use when asked to improve a prompt, optimize a system prompt, rewrite an agent prompt, tune prompt wording, make a prompt more reliable, port prompts between OpenAI, Claude, or Gemini, or build prompt evals.
---
# 提示词优化器

通过评测优化提示词。确保每条指令、每个示例和每处外部上下文引用都具有因果作用。

## 仅加载所需内容

| 需求 | 阅读 |
|------|------|
| 新提示词 | `references/core-patterns.md`, `references/model-family-notes.md`, `references/transformed-examples.md` |
| 现有提示词 | `references/meta-optimization-loop.md`, `references/core-patterns.md`, `references/model-family-notes.md` |
| 模型家族迁移 | `references/model-family-notes.md`, `references/core-patterns.md` |
| 反复失败 | `references/meta-optimization-loop.md`, `references/core-patterns.md` |
| 薄弱或含糊的草稿 | `references/transformed-examples.md` |
| 来源追溯 | `SOURCES.md` |

## 第 1 步：明确约定

编辑前记录：

- 任务类型：新建、改进、迁移或调试
- 目标模型家族及快照（如已知）
- 提示词所在层面：`system`、`developer`、`user`、工具描述、示例、模式
- 各层所有者：平台、部署方/角色、检索到的上下文、用户载荷
- 目标和非目标
- 可用的输入、工具和外部文件
- 要求的输出格式
- 成功标准和失败情况
- 硬性约束：延迟、详略程度、安全、预算、工具使用、风格

如果缺少成功标准或示例，请先创建一个小型评测集。
如果瓶颈在于模型选择、检索、工具模式或缺少评测，请在重写前明确指出。

## 第 2 步：盘点外部上下文

对于代码仓库或智能体提示词，按精确路径列出稳定的上下文：

| 上下文类型 | 示例 |
|--------------|----------|
| 智能体规则 | `AGENTS.md`, `CLAUDE.md` |
| 规范 | `specs/*.md`, `docs/api.md` |
| 策略 | `SECURITY.md`, `docs/releasing.md` |
| 示例 | `examples/`, `tests/fixtures/` |

规则：

- 使用相对于代码仓库的路径引用稳定文件，而不是复制其内容。
- 仅粘贴提示词或评测用例所需的摘录。
- 标明文件是 `loaded`、`referenced` 还是 `out of scope`。
- 避免使用“阅读文档”之类含糊的上下文指引。

## 第 3 步：选择模型策略

阅读 `references/model-family-notes.md`。

- 已知家族：针对该家族进行优化。
- 未知家族：编写可移植的基础版本，并附上简短的适配说明。
- 快照发生变化：重新运行评测。
- 跨家族差异：仅对失败的层进行专门适配。

## 第 4 步：构建提示词

阅读 `references/core-patterns.md`。

- 将稳定的策略放在 `system` 或 `developer` 中。
- 将任务本地事实、检索到的上下文和变量放在面向用户的部分。
- 每条行为规则只由一个所有者负责。
- 仅使用标题或标签来分隔不同类型的内容。
- 将工具策略放在提示词文本中；模式则保留在提供商原生工具中。
- 除非角色设定会改变行为，否则应保持简洁。
- 使用能够保留约束的最简短措辞。
- 删除填充内容、重复提醒、无效示例以及不会影响评测的理由说明。

## 第 5 步：优化

阅读 `references/meta-optimization-loop.md` 以了解改进方法。

1. 在相同的评测子集上为当前提示词建立基线。
2. 按根本原因对失败进行聚类。
3. 写出具体的编辑批评意见。
4. 生成两到四个候选版本：
   - 最小差异修复
   - 结构优先的重写
   - 示例优先或工具规则变体
   - 必要时提供商适配器
5. 在相同的用例上比较候选版本。
6. 保留简短的优化日志。
7. 在留出用例上验证胜出版本。
8. 出现平台期、振荡、过拟合、成本过高或非提示词瓶颈时停止。

## 第 6 步：返回交付包

返回：

1. `Target`
2. `Success Criteria`
3. `External Context`
4. `Optimized Prompt`
5. `Adapter Notes`
6. `Eval Set`
7. `Optimization Log`
8. `Residual Risks`

对于现有提示词，请包含一份简洁的差异说明，列出主要的行为变更。

## 失败模式

- 在定义评估目标之前进行编辑
- 在没有明确边界的情况下混合策略、示例和原始上下文
- 在不同层级间重复规则
- 将持久性策略放入用户载荷中
- 要求提供思维链
- 保留相互矛盾的旧版指令
- 对一两个示例过拟合
- 保留已无法再改善评估结果的示例
- 当工具描述或模式较弱时，仅通过提示词文本修复工具使用失败问题
- 添加无法减少歧义的标记
- 使用角色设定代替行为规则