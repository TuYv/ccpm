---
name: writing-plans
description: Creates executable implementation plans that break down designs into detailed tasks. This skill should be used when the user has completed a brainstorming design and asks to "write an implementation plan" or "create step-by-step tasks" for execution.
argument-hint: [design-folder-path]
user-invocable: true
allowed-tools: ["Bash(git-agent:*)", "Bash(git:*)", "Bash(${CLAUDE_PLUGIN_ROOT}/scripts/setup-superpower-loop.sh:*)"]
---
# 编写计划

创建可执行的实施计划，减少执行者在使用 Superpower Loop 持续迭代时可能遇到的歧义。

## 关键：第一步操作——立即启动 Superpower Loop

**解析设计路径并立即启动循环——在此之前不要读取设计文件、探索代码库或执行任何其他操作。**

1. 解析设计路径：
   - 如果 `$ARGUMENTS` 提供了路径（例如 `docs/plans/YYYY-MM-DD-topic-design/`），则使用该路径
   - 否则，在 `docs/plans/` 中搜索符合 `YYYY-MM-DD-*-design/` 格式的最新 `*-design/` 文件夹
   - 如果在没有显式参数的情况下找到，请向用户确认：“使用此设计：[path]？”
   - 如果未找到或用户拒绝，请向用户询问设计文件夹路径
2. 立即运行：
```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-superpower-loop.sh" "Write an implementation plan for: <resolved-design-path>. Continue progressing through the superpowers:writing-plans skill phases: Phase 1 (Plan Structure) → Phase 2 (Task Decomposition) → Phase 3 (Validation) → Phase 4 (Plan Reflection) → Phase 5 (Git Commit) → Phase 6 (Transition)." --completion-promise "PLAN_COMPLETE" --max-iterations 50
```
3. 仅在循环运行后，才继续执行下方的初始化

**该循环支持在整个规划过程中进行自我参照式迭代。**

## Superpower Loop 集成

此技能使用 Superpower Loop，以支持在整个规划过程中进行自我参照式迭代。

**关键**：在整个过程中，仅当满足以下条件时，你才可以输出 `<promise>PLAN_COMPLETE</promise>`：
- 阶段 1-4（计划结构、任务分解、验证、计划反思）均已完成
- 已创建计划文件夹，其中包含所有任务文件
- 已在阶段 3 获得用户批准
- 已完成 Git 提交

在所有条件真正满足之前，不要输出该承诺。

**绝对最终输出规则**：承诺标签必须是你输出的最后一段文本。请在该承诺标签之前输出所有过渡消息或给用户的说明。`<promise>PLAN_COMPLETE</promise>` 之后不得有任何内容。

## 初始化

（Superpower Loop 和设计路径已在上述第一步操作中解析——不要再次启动循环）

1. **设计检查**：验证文件夹中包含 `_index.md` 和 `bdd-specs.md`。
2. **上下文**：完整读取 `bdd-specs.md`。这是任务的事实依据。

循环将持续经历所有阶段，直到输出 `<promise>PLAN_COMPLETE</promise>`。

## 背景知识

**核心概念**：显式优于隐式、任务粒度精细、验证驱动、上下文独立。**禁止**：不要生成实现主体——不得包含函数逻辑或算法代码。**允许**：用于定义契约的接口签名和类型定义。

- **强制要求**：任务必须由 BDD 场景（给定/当/那么）驱动。
- **强制要求**：采用测试优先（红-绿）工作流。验证任务必须先于实现任务。
- **强制要求**：当计划包含单元测试时，要求使用测试替身隔离外部依赖项（数据库/网络/第三方 API）。
- **禁止**：不要生成实现主体——不得包含函数逻辑或算法代码。
- **允许**：用于定义契约的接口签名、类型定义和函数签名（例如 `async function improve(params: ImproveParams): Promise<Result>`）。
- **强制要求**：每个文件包含一个任务。每个任务都应拥有独立的 `.md` 文件。
- **强制要求**：`_index.md` 包含概述以及对所有任务文件的引用。

## 阶段 1：规划结构

定义目标、架构、约束和上下文。

1. **阅读规格**：阅读设计文件夹中的 `bdd-specs.md`（由 `superpowers:brainstorming` 生成）。
2. **起草结构**：使用 `./references/plan-structure-template.md` 勾勒计划大纲。
3. **编写上下文部分**：填写 `_index.md` 中的 `## Context` 部分：
   - 说明为什么需要开展这项工作（动机、约束、过往事件）。
   - 如果要修改现有代码，请添加当前状态与目标状态的对比表，涵盖关键维度（模块结构、API 形式、行为等）。对于全新项目，请省略该表。

## 阶段 2：任务拆解

将工作拆分为映射到特定 BDD 场景的小任务。

1. **引用场景**：**关键要求**：每个任务都必须使用 Gherkin 语法，在任务文件中明确包含完整的 BDD 场景内容。例如：

   ```gherkin
   ## BDD Scenario

   Scenario: [concise scenario title]
     Given [context or precondition]
     When [action or event occurs]
     Then [expected outcome]
     And [additional conditions or outcomes]
   ```

   场景内容应完整包含在任务文件中，而不能只是引用 `bdd-specs.md`。这样，执行者无需切换文件即可查看完整场景。
2. **定义验证方式**：**关键要求**：验证步骤必须运行 BDD 规格（例如 `npm test tests/login.spec.ts`）。
3. **强制执行顺序**：对于每个功能 NNN，测试任务（`task-NNN-<feature>-test`）必须通过 `depends-on` 排在其配对的实现任务（`task-NNN-<feature>-impl`）之前。
4. **声明依赖关系**：**强制要求**：每个任务文件都必须包含一个 `**depends-on**` 字段，其中仅列出**真正的技术前置条件**——即必须先获得其输出，本任务才能开始的任务。规则：
   - 功能 X 的测试任务（红灯阶段）不依赖其他功能的测试任务
   - 实现任务（绿灯阶段）仅依赖其配对的测试任务（红灯阶段），不依赖其他功能的实现任务
   - 默认情况下，修改不同文件并测试不同场景的任务相互独立
   - **禁止**：不要仅仅为了强制规定执行顺序而将任务串联起来——仅在确实存在技术原因时使用 `depends-on`（例如，“实现身份验证中间件”必须先于“实现受保护路由测试”）
5. **创建任务文件**：**强制要求**：每个任务创建一个 `.md` 文件。文件名格式：`task-<NNN>-<feature>-<type>.md`。
   - 示例：`task-001-setup.md`、`task-002-feature-test.md`、`task-002-feature-impl.md`
   - `<NNN>`：连续编号（001、002……）
   - `<feature>`：功能标识符（例如 auth-handler、user-profile）
   - `<type>`：类型（test、impl、config、refactor）
   - **同一功能的测试任务和实现任务使用相同的 NN 编号前缀**，例如 `002-feature-test` 和 `002-feature-impl`
6. **描述做什么，而非如何做**：**禁止**：不要生成实现主体。描述需要实现什么（例如，“创建一个验证用户凭据的函数”）。**允许**：可以包含接口签名以定义契约（例如 `def validate_credentials(username: str, password: str) -> bool: ...`），但绝不能包含函数主体逻辑。

## 阶段 3：验证与文档编写

验证完整性，向用户确认，并保存。

1. **验证**：检查提交边界是否有效，以及是否不存在模糊任务。
2. **确认**：使用 AskUserQuestion 获取用户对计划的批准。AskUserQuestion 会在当前轮次内暂停，确保用户能够在循环重新注入之前作出响应。
3. **保存**：写入 `docs/plans/YYYY-MM-DD-<topic>-plan/` 文件夹。
   - **关键要求**：`_index.md` 必须包含“执行计划”章节，并带有**内联 YAML 元数据**（请参阅 `./references/plan-structure-template.md` 中的模板）
   - **关键要求**：`_index.md` 必须包含“任务文件引用”章节，其中包含指向完整任务文件的链接，以提供详细的 BDD 场景
   - **关键要求**：`_index.md` 必须包含“BDD 覆盖率”章节，确认所有场景均已覆盖
   - **关键要求**：`_index.md` 必须包含“依赖链”章节，其中包含可视化依赖关系图（将在阶段 4 中填充）
   - YAML 元数据示例：
     ```yaml
     tasks:
       - id: "001"
         subject: "Setup project structure"
         slug: "setup-project-structure"
         type: "setup"
         depends-on: []
       - id: "002"
         subject: "Whale Discovery Test"
         slug: "whale-discovery-test"
         type: "test"
         depends-on: ["001"]
       - id: "003"
         subject: "Whale Discovery Impl"
         slug: "whale-discovery-impl"
         type: "impl"
         depends-on: ["002"]
     ```
   - 文件引用示例：
     `- [Task 002: Whale Discovery Test](./task-002-whale-discovery-test.md)`

## 阶段 4：计划复盘

提交前，验证计划质量。根据计划规模调整复盘方式。

**小型计划（最多 6 个任务）**：主代理执行一次审查——依次检查 BDD 覆盖率、依赖关系图和任务完整性。无需子代理。

**中型计划（7-15 个任务，2 个子代理）**：

**子代理 1：BDD 覆盖率与完整性审查**
- 重点：验证 BDD 场景覆盖情况以及任务结构完整性
- 输出：覆盖矩阵、不完整的任务、缺失的章节

**子代理 2：依赖关系图审查**
- 重点：验证 depends-on 字段、检查循环依赖、识别缺失的依赖项
- 输出：依赖关系图、循环依赖检测、错误的依赖关系

**大型计划（16 个及以上任务，3 个及以上子代理）**：

**子代理 1：BDD 覆盖率审查**
- 重点：验证设计中的每个 BDD 场景都有对应的任务
- 输出：覆盖矩阵、孤立场景、没有对应场景的额外任务

**子代理 2：依赖关系图审查**
- 重点：验证 depends-on 字段是否正确、检查循环依赖、识别缺失的依赖项
- 输出：依赖关系图、循环依赖检测、错误的依赖关系

**子代理 3：任务完整性审查**
- 重点：验证每个任务是否具备必需的结构（BDD 场景、文件、步骤、验证）
- 输出：不完整任务列表、各任务缺失的章节

**其他子代理（按需启动）**：红-绿配对审查、文件冲突审查。

**整合并更新**：
1. 收集所有子代理的发现
2. 按影响程度确定问题优先级
3. 更新计划文件以修复问题
4. **强制要求**：将子代理 2 生成的依赖关系图添加到 `_index.md` 的“依赖链”章节中
5. 重新验证更新后的章节
6. **向用户确认**：使用 AskUserQuestion 展示复盘摘要，并在提交前获取批准

**输出**：已更新计划，问题均已解决，依赖关系图已包含在 `_index.md` 中，并且已获得用户批准。

有关子代理提示词和集成工作流，请参阅 `./references/plan-reflection.md`。

## 阶段 5：Git 提交

使用 git-agent 提交计划文件夹（并以 git 作为后备方案）。

**操作**：
1. 暂存整个文件夹：`git add docs/plans/YYYY-MM-DD-<topic>-plan/`
2. 运行：`git-agent commit --no-stage --intent "add implementation plan for <topic>" --co-author "Claude <Model> <Version> <noreply@anthropic.com>"`
3. 如果出现身份验证错误，添加 `--free` 标志后重试
4. **后备方案**：如果 git-agent 不可用或执行失败，请使用 `git commit -m "docs: add implementation plan for <topic> ..."`，并采用约定式格式

有关详细模式，请参阅 `../../skills/references/git-commit.md`。

## 阶段 6：过渡到执行

提示用户使用 `superpowers:executing-plans`，然后将承诺标签作为绝对意义上的最后一行输出。

严格按照以下顺序输出：
1. 过渡消息："计划已完成。要执行此计划，请使用 `/superpowers:executing-plans`。"
2. `<promise>PLAN_COMPLETE</promise>` — 此后不得有任何内容

**禁止**：不得提出直接开始实施。不得在承诺标签后输出任何文本。

## 退出标准

计划已创建，具有明确的目标/约束，包含带文件列表和验证步骤的任务拆解、BDD 步骤及提交边界，不含模糊任务；已完成反思并获得用户批准。

## 参考资料

- `./references/plan-structure-template.md` - 计划结构模板
- `./references/task-granularity-and-verification.md` - 任务拆解与验证指南
- `./references/plan-reflection.md` - 用于计划反思的子代理提示词
- `../../skills/references/git-commit.md` - Git 提交模式和要求
- `../../skills/references/loop-patterns.md` - 完成承诺设计、提示词模式和安全保障措施