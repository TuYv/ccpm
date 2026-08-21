---
name: ax-extract-workflow
description: Reconstruct the workflow behind a past artifact - "what made X work" / "extract workflow from <date|sha>" / "how did we ship Y". Uses ax to find the relevant sessions and narrate the ordered skill arcs that produced the result. Triggers on "what made X work", "how did we build Y", "extract workflow from <date>", "extract workflow from <sha>", "what was the workflow around <topic>", "show me how I shipped <feature>", "reconstruct the recipe for <artifact>". Do NOT fire on generic "show recent activity" - this skill is for reconstructing the workflow behind a specific artifact.
role: framing
---
# ax:extract-workflow - 重建已交付成果背后的工作配方

给定一个交付成果（演示、PR 或功能），用户想知道：
哪些技能以怎样的顺序产出了它？此技能会解析一个锚点
（日期或 sha），圈定相关会话，并用纯文本按顺序讲述
技能轨迹。它也践行自身的方法：本身就是一种框架设定
技能。

假定 `ax` (axctl) 已加入 PATH。如果 `ax sessions here` 失败，请告知用户
检查 `docs/development.md#setup`（DuckDB dylib 设置——无需守护进程）
并停止。

## 何时触发

仅在出现明确的重建触发语句时触发：
- “是什么让 <X> 成功运行的”/“我们是如何交付 <Y> 的”
- “提取 <date> 的工作流”/“提取 <sha> 的工作流”
- “<topic> 前后的工作流是什么”
- “重建 <artifact> 的工作配方”
- “告诉我如何构建了 <feature>”

不要在泛泛的“我今天做了什么”或“显示近期活动”请求中触发。
那属于 `ax sessions here` 的使用场景，而不是此技能。

## 第 1 步——解析锚点

根据用户提供的内容，决定采用以下三种模式之一：

| 用户所说的内容 | 模式 | 操作 |
|---|---|---|
| commit sha（完整或缩写） | sha | 直接使用 |
| 日期或日期范围（YYYY-MM-DD） | date | 使用 `ax sessions around <date>` |
| 主题/功能/成果名称 | topic | 使用 `ax recall "<topic>" --sources=commit --json` 查找候选 sha |
| “此仓库，近期” | pwd | 使用 `ax sessions here --days=14` |

对于 topic 模式，选择相关性最高的 sha，然后以 sha 模式继续。如果
结果存在歧义，请先让用户选择一个，再继续。

## 第 2 步——圈定会话范围

为解析出的锚点选择正确的命令：

- sha 模式：    `ax sessions near <sha> --json`
- date 模式：   `ax sessions around <date> --days=3 --json`
- pwd 模式：    `ax sessions here --days=14 --json`

从 JSON 中选择相关性最高的 N 个会话（默认 N=5）。优先选择
轮次数最多且涉及与该成果相关文件的会话。

## 第 3 步——检查每个会话

对于选中的每个会话：

    ax sessions show <id> --json
    ax sessions show <id> --by-role     # optional, see Step 4

读取 `top_skills` 和 `agent_delegations` 数组。如果某个子代理的
工作看起来是该成果的核心部分，则深入查看：

    ax sessions show <id> --expand=<subagent-uuid>

## 第 4 步——叙述

直接在回复中生成两项内容（不要写入文件——将答案保留在聊天中）。

### 4a. 有序技能轨迹

首先列出开启这项工作的框架设定技能（如有 `--by-role` 输出，
则 `framing` 组排在最前）。然后列出执行技能，最后列出验证技能。
对于每项技能，给出名称，并用一行说明它产出了什么。

示例：

    1. brainstorming    -> defined the workflow extraction problem
    2. writing-plans    -> turned 13 grilled questions into a plan
    3. subagent-driven  -> executed the plan as 17 typed-CLI tasks
    4. code-review      -> two-stage spec + quality review per task
    5. test-driven-dev  -> 100% green throughout

### 4b. 关键决策

提取 2-4 个用户引导工作方向的轮次片段。使用：

ax recall "<keyword>" --skill=<framing-skill> --limit=5 --json

每项决策引用一行；注明会话 ID。

### 4c. 复现简述（可选，仅在用户提出要求时提供）

用一个段落概述“如果要再次完成此操作，你需要怎么做”——包括所用技能、执行顺序，以及关键引导节点上的重要用户输入。

## 何时建议运行 ax skills classify

如果 `ax sessions show <id> --by-role` 返回的许多技能都位于 `(unclassified)` 组中，那么上述按角色加权的输出会有较多噪声。建议用户运行一次 `ax skills classify`——它会生成简述，用户可以填写这些简述来初始化角色。不要因此阻塞后续操作；即使没有角色，工件重建流程仍然有效。

## 输出约定

所有内容都以内联方式编写。不要在 `.ax/tasks/` 或其他任何位置创建文件。不要修改仓库。这是一项只读的、专注于重建的技能。

如果用户要求提供永久性操作指南，建议他们自行将你的输出粘贴到 `docs/recipes/<name>.md` 中——ax 有意暂不提供操作指南的保存格式（依据 workflow-extraction-frictions 计划）。