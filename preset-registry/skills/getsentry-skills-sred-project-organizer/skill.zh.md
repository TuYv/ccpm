---
name: sred-project-organizer
description: Take a list of projects and their related documentation, and organize them into the SRED format for submission.
---
# SRED 项目整理

SRED 要求项目以特定格式呈现。获取过去一年中参与过的项目列表，并按照 SRED 所要求的格式进行总结，同时提供佐证材料。输出一个 Notion 文档，并为每个可归入 SRED 的项目创建一个子文档。

# 前置条件

开始之前，请确保可以访问 Github、Notion 和 Linear。Notion 和 Linear 应使用 MCP 连接。Github 可以使用 MCP 连接，但如果你可以使用 `gh` CLI 工具，也可以改用该工具。

如果无法访问其中任何一项，请先提示用户授予访问权限，然后再继续。

# 流程

## 第 1 步

提示用户提供一个 Notion 文档链接，该文档是由 `sred-work-summary` skill 生成的上一年度工作总结。

确保：
- 该 Notion 链接指向一个有效文档，且大致符合以下格式：

```markdown
# Projects

## [Project Name]
*Summary*: [X] PRs, [X] Notion docs, [X] Linear tickets

### Pull Requests [X]
*[repository name]
[Links to all the PRs]
- [link] - [Merge date]

### Notion Docs [X]
[Links to all the Notion docs]
- [link] - [Creation date]

### Linear Tickets [X]
- [link] - [Creation date]
```

## 第 2 步

对于工作总结中的每个项目，根据 `references/SRED.md` 中对 SRED 项目的描述进行评估。这意味着需要查看与该项目相关的 Notion 文档和 PR，并判断项目工作是否属于有效的 SRED 项目。进行分类时应采取积极判断的方式：能够被归类为 SRED 项目的项目越多越好。

输出看起来符合 SRED 模型描述的项目列表，以及不符合该模型的项目列表。符合 SRED 描述的项目称为“SREDable”项目。

确保：
- 工作总结中的所有项目都已被归类为 SREDable 或非 SREDable。

## 第 3 步

询问用户 SREDable 项目列表是否正确。允许用户手动将任意项目归类为 SREDable 或非 SREDable，并相应调整列表。

## 第 4 步

创建一个名为“SRED Project Descriptions”的私有 Notion 文档。输出该文档的完整链接。

## 第 5 步

对于每个 SREDable 项目，依次执行以下步骤。

*第 1 步*
创建一个名为“SRED Project Summary - <year> <project name>”的私有 Notion 文档，并将其作为第 4 步中创建的“SRED Project Description”文档的子文档。该文档应遵循 `references/project-template.md` 中的模板。

*第 2 步*
填写该文档中的 `Project Description` 和 `Project Goals` 部分。使用文档中这些部分里的 `aside` 区块作为提示，以确定每个部分应包含哪些信息。使用工作总结中为每个项目收集的全部信息。结合项目的 Notion 文档以及你自己的推理来填写这些部分。

确保：
- 项目描述不得超过 100 个单词。
- 项目目标不得超过 100 个单词。

*步骤 3*
向用户提供该项目的「SRED Project Summary」文档的完整 Notion 链接，并请他们在继续之前进行审核。根据他们的要求进行任何修改。

*步骤 4*
每个项目都会有一个或多个不确定性。不确定性由以下问题定义：
- 我们当时无法解答的挑战或问题是什么？
- 是否存在可以作为解决问题基础的现有技术？
- 如果不存在，原因是什么？

审核该项目的所有 Notion 文档、Github PR 和 Linear 工单。确定该项目存在哪些不确定性并向用户展示。询问用户这些不确定性是否正确，或者是否需要以某种方式进行调整。

确保：
- 每项不确定性的描述应仅包含几个句子。

*步骤 5*
将不确定性添加到 Project Summary Notion 文档的「Technical Uncertainties」部分。

确保：
- 不确定性的描述应仅包含几个句子。

*步骤 6*
对于上面找到的每项不确定性，使用 Notion 文档、Github PR 和 Linear 工单，查找为解决该不确定性而进行的任何实验或尝试。在该不确定性的 `Experiments` 部分中，为每项已进行的实验创建一个项目符号列表。在 `Results / Learnings / Success` 部分中创建一个项目符号列表，列出实验结果以及由此获得的任何经验或结论。对于引用的任何 Notion 文档、Github PR 或 Linear 工单，将该资源的链接放入该不确定性的 `Uncertainty-Specific Documentation & Links` 部分。

确保：
- 每项实验仅使用一个项目符号
- 每项结果/经验/成功仅使用一个项目符号

*步骤 7*
获取 Work Summary 中找到的该项目的所有链接，对于其中未作为某项不确定性的一部分进行链接的内容，将其纳入 Project Summary 的 `Project Documentation & Links` 部分。

确保：
- 提供所有具体链接的列表，而不是摘要或 Github 通知的通用链接。
- 检查每个链接是否都与该项目和/或其不确定性直接相关。

*步骤 8*
再次向用户提供 Project Summary 文档的链接，并请用户在继续处理下一个可申报 SRED 的项目之前进行审核。提醒用户填写文档的 Participants 部分。

## 步骤 6

提供「SRED Project Descriptions」Notion 文档的链接。


## 示例

Work Summary 示例：https://www.notion.so/sentry/SRED-Work-Summary-2026-30a8b10e4b5d81f5bc8df3553da55220


## 参考资料

关于项目的构成及其组织方式的摘要：`references/SRED.md`
特定项目摘要的 Notion 模板：`references/project-template.md`

## 资源

SRED 计划的完整文档：https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html