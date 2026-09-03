---
name: vc-audit-plans
description: Audit active project plan files for staleness, completion, and routing truth. Use when cleaning up plans, reconciling active work, or archiving completed artifacts.
trigger_keywords: audit plans, plan inventory, stale plans, active plan count
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---
# 审计计划

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 回答先行、语言平实、不使用未加解释的术语，长篇回复附 TL;DR。

使用此技能来审查活跃的计划工件，并与当前代码库进行核对。

这是一个维护与恢复类技能，而不是任务完成后自动触发的钩子。

可选输入：用于确定优先级的功能、文件夹、计划文件名或维护范围。

在以下情况下优先使用本技能：

- 跳过了 UPDATE PROCESS，导致活跃计划清理的偏差不断累积
- 用户希望进行一轮定期的活跃计划清理
- 一轮密集工作之后，有多个活跃计划需要核对

## 工作流程

1. 阅读 `references/audit-plans.md` 以了解完整的审计流程。
2. 运行清单验证器：
   ```bash
   node .claude/skills/vc-audit-plans/scripts/validate-plan-inventory.mjs
   ```
3. 清点 `process/general-plans/active/` 和 `process/features/*/active/` 中的计划。计划现在存放于 `{slug}_{date}/` 任务子文件夹内 —— 需向下扫描一层。不要将任务文件夹内的 `_REPORT_`、`_REF_` 或 `_SPEC_` 文件计为计划；只有 `_PLAN_` 文件才计入。
   对于以功能为范围的审计，先运行 `find process/features/{feature}/ -type f | sort` 以获得完整的工件可见性。对于完整审计，运行 `find process/features/ -type f | sort` 以查看所有子目录（active、completed、backlog、references、reports）中的全部功能工件。
3.5. 在检查每个计划的同时，扫描任务文件夹的内容（同址存放的 REPORT/REF/SPEC 文件）。根据**任务文件夹工件同址存放**原则，每个工件（计划、规格、报告、参考）的正确存放位置都在其 `{slug}_{date}/` 任务文件夹内部；对于在已弃用的同级 `reports/`/`references/` 目录或任何临时位置中发现的任务工件，应将其标记为存放位置不当，并建议将其移动到所属的任务文件夹中。可通过功能 slug、日期邻近程度（7 天）或内容中对计划文件名的引用来进行匹配。
4. 通过文件存在性检查和有针对性的 `rg` 搜索，将每个计划与实际代码库进行交叉核对。
5. 将每个计划归类为 `Completed`、`Partially Done`、`Obsolete`、`Stale`、`Active` 或 `Reference`。
6. 仅将明确已完成或已废弃的计划移动到相应的 `completed/` 文件夹。使用 `git mv active/{slug}_{date}/ completed/{slug}_{date}/` —— 移动整个任务文件夹；不添加 `completed_` 前缀。
7. 删除任何内容之前先询问。
8. 在移动或编辑计划文件后，重新运行清单验证器。

## 输出

返回一份简明的汇总表，其中包含分类、已采取的操作以及需要用户做出的任何决定。同时纳入过期工件的发现（与已完成或已废弃计划相关联的报告/参考）及其建议操作。
