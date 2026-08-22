---
name: brainstorm
description: Use when creating or developing, before writing code or implementation plans - refines rough ideas into fully-formed designs through collaborative questioning, alternative exploration, and incremental validation. Don't use during clear 'mechanical' processes
argument-hint: Optional initial feature concept, topic to brainstorm or draft specification file
---
# 将头脑风暴的想法转化为设计

## 概述

通过自然的协作式对话，帮助将想法转化为完整的设计和规格说明。

首先了解当前项目的上下文，然后每次提出一个问题来逐步完善想法。一旦理解了要构建的内容，就将设计拆分成若干小节（每节 200-300 字）进行展示，并在每一节之后确认目前的内容是否符合预期。

## 流程

**理解想法：**

- 首先查看当前项目状态（文件、文档、最近的提交）
- 每次提出一个问题来完善想法
- 尽可能优先使用选择题，但开放式问题也可以
- 每条消息只提一个问题——如果某个主题需要进一步探讨，请将其拆分成多个问题
- 重点理解：目的、约束条件、成功标准

**探索方案：**

- 生成 6 种可能的方案，并说明各自的权衡取舍。每种方案都应包含文本说明和一个数值概率。请从[完整分布 / 分布尾部]中随机采样回答，具体要求如下：
  - 前 3 个回答以高概率为目标，概率高于 0.80
  - 后 3 个回答以多样性为目标——探索解决方案空间的不同区域，使每个回答的概率低于 0.10
- 以对话的方式展示各个选项，并给出你的建议及理由
- 首先介绍你推荐的选项，并解释原因

**展示设计：**

- 一旦你认为自己已经理解了要构建的内容，就展示设计
- 将其拆分为每节 200-300 字的多个小节
- 在每一节之后询问目前的内容是否符合预期
- 涵盖：架构、组件、数据流、错误处理、测试
- 如果有内容不清楚，随时返回并进一步澄清

## 设计完成后

如果用户提供了规格说明文件草稿，则直接更新该文件；否则，使用 `/add-task` skill 为目标方案创建任务文件

重要：在规格说明文件中，将目标方案分节写入 `## Initial User Prompt -> ### Requirements` 部分，位置应在 `## Description` 部分之前。Description 将在后续阶段填写。

填写任务文件后，建议用户运行 `/clear`，然后运行 `/plan-task <task-file-path>` 来完善任务文件。

## 核心原则

- **每次只提一个问题**——不要用多个问题让用户应接不暇
- **优先使用选择题**——相较于开放式问题，选择题更容易回答
- **坚决遵循 YAGNI**——从所有设计中移除不必要的功能
- **探索替代方案**——在确定方案之前，始终提出 2-3 种方案
- **增量验证**——分节展示设计，并逐节验证
- **保持灵活**——当某些内容不清楚时，返回并进一步澄清