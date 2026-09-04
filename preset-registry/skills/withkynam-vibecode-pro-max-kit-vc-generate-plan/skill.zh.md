---
name: vc-generate-plan
description: Create or update implementation plans in the repo's SIMPLE or COMPLEX format. Use when turning an idea, PRD, or approved direction into a saved plan artifact.
trigger_keywords: plan, create plan, write plan, generate spec, plan artifact
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---
# 生成计划

> 输出风格：按照规范规则——`process/development-protocols/communication-standards.md`——撰写计划时结论先行，使用表格/列表，并附一行 TL;DR。

使用此技能为项目工作产出权威的实施计划产物集。

此技能是本仓库的规范规划契约。此前分散在 `vc-plan` 中的规划纪律现在归入此处，外加 `plan-agent` 提示词。

常规输出是一个计划文件。

对于大型多阶段项目，此技能改为定义如何在同一个 feature 文件夹下创建总括计划加阶段计划集。参见 `process/development-protocols/phase-programs.md`。

可选输入：当用户已知晓预期深度时，提供一个功能想法外加 `simple` 或 `complex`。

## 工作流程

1. 阅读 `references/generate-plan.md` 以了解完整的计划契约。
2. 在选择文件名之前运行 `date +%d-%m-%y`。
3. 如果复杂度不明显，询问该计划是 `SIMPLE` 还是 `COMPLEX`。
4. 将计划保存在任务文件夹内：`process/general-plans/active/{slug}_{date}/{slug}_PLAN_{date}.md`（或 `process/features/{feature}/active/{slug}_{date}/{slug}_PLAN_{date}.md`）。先创建 `{slug}_{date}/` 子文件夹。根据**任务文件夹产物同置**原则，此计划产生的每一个产物——计划本身、任何 `{slug}_SPEC_{date}.md`、报告和引用——都必须存放在同一个任务文件夹之内；绝不要写入已弃用的同级 `reports/` 或 `references/` 目录。
5. 如果存在 `process/context/all-context.md`，阅读它以选择相关的上下文文档。
6. 对于复杂计划，在撰写之前阅读 `.claude/skills/vc-generate-plan/references/example-complex-prd.md`。
7. 纳入 `process/context/tests/all-tests.md` 中的自动化和手动验证门。
8. 对于新建或新近改动的直接 `*_PLAN_*.md` 计划，须包含 `Touchpoints`、`Public Contracts`、`Blast Radius`、`Verification Evidence`、`Test Infra Improvement Notes` 和 `Resume and Execution Handoff` 的明确章节。
9. 目前将恢复/依赖说明保持为 Markdown 结构；不要发明第二套仅面向机器的模式。
10. 如果该工作是大型多阶段项目，则创建或更新一个 feature 文件夹计划集：
    - 一个总括/编排计划
    - 每个阶段一个直接计划文件
    - 每个阶段一个持久化的报告存放位置
11. 验证生成的产物：
    ```bash
    node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs <plan-path>
    ```

## 重要规则

- 对于标准工作，只创建一个计划文件。
- 对于分阶段项目，创建一个总括计划外加每个阶段一个直接计划文件。
- 当主题对应到现有的 feature 文件夹时，优先使用 `process/features/{feature}/active/{slug}_{date}/` 任务文件夹。
- 如实维护阶段状态：仅完成代码的状态是 `CODE DONE`，而不是 `VERIFIED`。
- 在计划中明确执行信任：哪些代码或数据会发生变更、暴露了哪些契约、需要什么证明，以及在压缩之后 EXECUTE 应如何恢复。
- 以给 RIPER-5 或 Cursor Plan 模式的下一条指令收尾。
- 在将计划呈现为就绪之前，把验证失败视为阻碍项。
- 将红队问题、依赖映射、验证门和歧义检查融入所生成的计划本身，而不是依赖一个并行的计划负责人工作流。
- 如果执行实际上会按阶段逐步进行，就不要把一个大型项目藏在一份巨型计划中。
- 通过在每个阶段计划中保留阶段前研究和证明门来保留旧的复杂计划行为；新协议改变的是产物形态，而非严谨性。

## 必需的计划章节

对于新建或新近改动的直接 `*_PLAN_*.md` 文件，须包含以下所有章节：

- `Touchpoints` — 将被更改或读取的文件、包或服务
- `Public Contracts` — 对其他包或调用方可见的接口、API、schema 或行为
- `Blast Radius` — 变更范围：涉及多少文件、哪些包，以及风险类别
- `Verification Evidence` — 表格，其列为 `| Gate / Scenario | Strategy | Proves SPEC criterion |`；每一行将一个测试门映射到它所证明的 SPEC 验收标准及所用策略（Fully-Automated / Hybrid / Agent-Probe）
- `Test Infra Improvement Notes` — 撰写计划时为占位符（"(none identified yet)"）；随后会根据在 vc-test-coverage-plan 和 EVL 期间发现的测试基础设施缺口进行更新
- `Resume and Execution Handoff` — 必需的子字段：
  1. 选定的计划文件路径
  2. 最后完成的阶段或步骤
  3. validate-contract 状态（已写入 / 跳过并说明原因 / 待定）
  4. 已加载的支撑上下文文件
  5. 供在执行中途接手的全新代理执行的下一步
- `Validate Contract` — 由 vc-validate-agent 在 VALIDATE 运行后写入；在 PLAN 阶段留一个占位标题（`## Validate Contract\n\n(placeholder — vc-validate-agent writes this section before EXECUTE)`）

使用 Markdown 结构化章节，而不是第二套仅面向机器的模式。Markdown 章节在所有代理（Claude、Codex、未来的系统）之间保持稳定，无需解析器。
