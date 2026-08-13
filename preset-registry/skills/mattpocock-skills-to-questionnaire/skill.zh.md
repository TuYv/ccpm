---
name: to-questionnaire
description: Turn a decision you can't fully answer into a questionnaire for someone else to fill in.
disable-model-invocation: true
---
将用户无法单独回答的问题转化为一份**问卷**——一份由用户交给某个人异步填写，或在会议中共同填写的 Markdown 文档。接收者拥有用户缺乏的知识；问卷通过它把这些知识提取出来。

**提问聚焦“发送”，不要聚焦“主题”。** 只就用户始终能够回答的 _send_ 进行访谈：它要发给谁，以及他们需要拿回什么。文档中的问题应当围绕接收者已知而用户缺失的**差距**来设计。

1. **要发给谁？** 在一次交互中询问接收者的角色、专长以及与用户的关系。这会确定问卷的语气以及需要携带多少上下文。在你明确知道接收者是谁，以及他们知道用户不知道的内容后完成此步骤。

2. **你需要收回什么？** 在一次交互中询问用户无法独立解决的具体决策或事实，并且需要该人提供。在你得到一份用户必须获得并据此做出行动或决策的具体清单后完成此步骤。

3. **编写问卷。** 按照以下“文档结构”编写针对第 1–2 步差距的提问。将其写入当前目录下的 `to-questionnaire-<slug>.md`（slug 来源于主题），并汇报路径。在文件存在且第 2 步中的每一项用户需求都被问题覆盖后完成此步骤。

## 文档结构

将该文档构建为**探索性问卷**：用户缺少上下文，接收者掌握上下文。按“最重要优先”排序问题——异步模式可能只能进行一轮沟通——当问题超过少量时，用 `##` 按主题分组。按以下模板编写。

<questionnaire-template>

# <Questionnaire title>

**Purpose:** 为什么要进行这份问卷，以及它所承载的决策。

**From:** <the user> — **To:** <the recipient> — **How your answers will be used:** <where they go>

## Context

一段面向未在用户脑中参与思考的接收者的说明。足够回答得好即可，不必是一整页。

## How to answer

截止日期和大致工作量。部分回答和“我不知道”都很有价值——将不确定之处标注出来，而不是跳过。

## <Theme heading>

每个主题一个 `##` 章节。每个章节下按最重要优先排列问题。每个问题只问一个点——不要复合提问——并在问题下方直接给出答题框；对于可能被误解或引出敷衍回答的问题，仅在下面添加一行 _为什么这很重要_ 说明。

<question-example>
### 系统上线时预计要承载的负载是多少？

_Why this matters: it decides whether we provision for burst traffic now or defer it._

>
</question-example>

## Anything else?

结尾兜底：还有哪些我们没有问到、但应该知道的信息？

</questionnaire-template>
