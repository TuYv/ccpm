---
name: loop-me
description: Grill me about specs for the workflows I want to build, within this workspace.
disable-model-invocation: true
argument-hint: "A workflow to design, or nothing to go find one"
---
运行一个有状态的 `/grilling` 会话，其唯一输出是 **workflow** 规范。使用 grilling 训练法——不懈地、每次一轮问题，并为每个问题附上推荐答案——围绕下面的词汇和目标展开。随着 grilling 解决问题，创建、编辑和删除规范。

## 循环视角

**loop** 是用户生活中的一个反复模式：他们的职业、他们的一周、他们的早晨、某项单独重复的活动。把生活看作循环中的循环，能够显现其活动实际上有多可预测——也正是这使它们值得**委派**的原因。使用这个视角去发现值得下规范的循环，并提出用户未察觉到的循环。

**workflow** 是某个循环的规范，落地为实际执行。你在一个循环上运行 workflow——该循环就是其运行实例。工作流位于 `workflows/*.md`，并且是可信源。

## 词汇

一种共享语言，仅在 workflow 需要时才调用——决不用于清单。**不要规定任何结构性内容**：除非 grilling 显示需要，否则 workflow 不需要 AI、不需要 checkpoint，也不需要 schedule。

- **Trigger** — 每次运行的触发点：一个**event**（新邮件、一个新 issue）或一个**schedule**（每天早晨）。基于事件触发通常更高效。
- **Checkpoint** — 人在流程中的关键点，用户需在此进行验证或决策。有些 workflow 没有此环节并可自动运行；有些完全不使用 AI。
- **Push right** — 尽量把 checkpoint 延后。尽可能多地先完成工作，再让人类介入，这样只需一次、在后期、带着全部准备好的内容提问。
- **Brief** — checkpoint 展示的内容：一个紧凑、可直接决策的总结——交付了什么、为什么要交付，以及指向资产本体的链接——绝不呈现原始输出。用户阅读的是 brief，而不是草稿。复核效率至关重要。

## 完成定义

当一个实现代理无需提任何问题就能构建该 workflow 规范时，该规范即完成。继续 grilling，直到达到该状态；只要还有问题存在，就不算完成。

## 工作区

- `workflows/*.md` — 每个工作流一个规范。
- `NOTES.md` — 用户世界的原始笔记：他们使用的工具、处理的渠道，以及他们对两者的自身术语。当其为空或内容过少时，在制定任何规范前先对其世界进行访谈。把模糊术语逐步细化为规范术语，并记录在这里。
