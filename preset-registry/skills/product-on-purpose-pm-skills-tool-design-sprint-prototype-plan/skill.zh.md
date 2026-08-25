---
name: tool-design-sprint-prototype-plan
description: Day 4 (Thursday) move of a Design Sprint that produces the planning artifact for the day. Output covers the prototype role plan (Maker, Stitcher, Writer, Asset Collector, Interviewer), prototype brief (what to build, fidelity bar, time allocation per role), canonical Five-Act Interview script (Welcome, Context, Intro, Tasks, Debrief), trial-run checklist, and Friday participant confirmation tracker. The actual prototype build is craft work outside the skill's AI invocation surface. Use Thursday morning after Wednesday's storyboard is signed off.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: design-sprint
  move: prototype-plan
  category: discovery
  frameworks:
    - design-sprint
    - sprint
  timebox_minutes: 90
  roles:
    - facilitator
    - design
    - engineering
    - researcher
    - pm
  prerequisites:
    - tool-design-sprint-decide-and-storyboard
  inputs:
    - storyboard (from Wednesday)
    - sprint questions (from Monday)
    - founding hypothesis (optional; from a prior Foundation Sprint)
    - prototype medium choice (from the brief)
  outputs:
    - prototype role plan
    - prototype brief
    - interview script (Five-Act)
    - trial-run checklist
    - participant confirmation tracker
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 设计冲刺原型计划（周四上午）

周四是构建原型的日子。此技能生成用于推进构建工作的上午规划文档，但**不会**自行构建原型。此技能会分配角色、确定保真度标准、起草五幕访谈脚本、定义试运行门槛，并确认周五的参与者。实际构建工作（Figma 画面、幻灯片演示文稿、角色扮演脚本、纸质组件）属于团队负责的制作工作，将在整个周四继续进行。

系列契约：[`docs/reference/skill-families/design-sprint-skills-contract.md`](../../docs/reference/skill-families/design-sprint-skills-contract.md)。此技能属于 `design-sprint-skills`。

## 适用时机

- 现在是设计冲刺的周四上午，且周三的故事板已经签字确认。
- 需要在周四上午对周五的参与者跟踪表进行确认检查；此时出现取消将触发备用名额启用。
- 需要起草访谈脚本（或根据上一轮冲刺的模板进行完善），以便访谈主持人能在周四下午进行模拟演练。
- 团队需要在并行构建工作开始前分配角色；在周四下午临时分配会浪费 1–2 小时。

## 不适用时机

- 周三的工作尚未结束。返回 `tool-design-sprint-decide-and-storyboard`；没有锁定的故事板，原型就没有规格说明。
- 团队试图使用此技能来构建原型。原型构建属于制作工作（依据 DS 集成计划中的批准决策 1）。此技能负责规划周四；构建工作将在 Figma、Keynote、纸张或其他媒介中完成。
- 团队已经决定跳过周五的试运行。试运行是一个门槛，用于在正式访谈开始前发现“无法访问原型”或“访谈脚本让客户感到困惑”等问题。跳过试运行会把周五变成调试时间。
- 周五参与者取消后，导致参与者队列缩减至少于 4 人。暂停冲刺，并决定是推迟周五的活动，还是接受证据较少的测试。

## 此技能产出的内容

一个包含以下五个部分的整合文档：

1. **原型角色计划**：在团队成员之间分配 5 个规范角色（制作人、串联人、撰稿人、素材收集人、访谈主持人）。小团队可以由一人兼任多个角色；除素材收集人外，不得一人兼任三个角色。
2. **原型简报**：一页规格说明，涵盖要构建的内容（纳入范围的故事板面板）、保真度标准（针对所用媒介，“足够真实”意味着什么）、每个角色的时间分配，以及明确**不**构建的内容。
3. **访谈脚本（五幕）**：规范的五幕结构（欢迎、背景、介绍、任务、复盘），其中任务措辞由团队根据故事板提供。幕次顺序固定；只有“任务”部分需要进行大量定制。
4. **试运行检查清单**：原型在周四下午（规范时间为 16:00–17:00）必须通过的门槛，之后周五的活动才能开始。每个门槛都是访谈主持人或制作人确认的是/否事项。
5. **参与者确认跟踪表**：周四上午重新确认周五的全部 5 个时段；取消将触发备用时段启用；确认失败会进一步触发参与者队列决策时点。

请参阅 `references/TEMPLATE.md` 了解规范结构，并参阅 `references/EXAMPLE.md` 了解 Brainshelf 图书目录周四上午产物的示例。

## 五个规范角色

Sprint 书第 16 章定义了以下 5 个角色。由技能分配角色；由团队成员承担具体工作。

| 角色 | 工作内容 | 典型负责人 |
|---|---|---|
| 制作者 | 构建原型界面（Figma 画板、Keynote 幻灯片、角色扮演道具）。负责视觉和交互工作。 | 设计负责人 |
| 串联者 | 将制作者的各个界面连接成连贯的端到端流程（Figma 交互、Keynote 转场、角色扮演流程）。 | 设计负责人或工程负责人 |
| 撰写者 | 撰写原型文案（按钮标签、正文、错误状态、微文案）。这对可信度至关重要；糟糕的文案会破坏信任。 | 产品经理或研究员 |
| 资源收集者 | 搜集图片、图标和示例数据（书籍封面、姓名、日期、虚构但可信的数据）。 | 任何有空的人；通常是没有处于关键路径上的人。 |
| 访谈员 | 执行周五的访谈。在周四下午起草并模拟演练五幕脚本。 | 研究员或有访谈经验的产品经理 |

对于 4 人团队，制作者和串联者通常合并为一个角色（由一名设计负责人承担）；撰写者和资源收集者可以合并；访谈员始终是一个专门的角色。

## 五幕访谈结构

规范结构来自 Sprint 书第 17 章。幕次顺序固定；任务幕需要进行大量定制；其他幕基本采用规范措辞。

| 幕 | 时间 | 目的 | 规范程度 |
|---|---|---|---|
| 欢迎 | 5 分钟 | 友好的介绍；确认同意；说明并不是在测试客户 | 采用规范措辞，仅替换团队名称 |
| 背景 | 5-10 分钟 | 了解客户当前与挑战相关的行为和背景 | 采用规范问题；团队根据挑战进行调整 |
| 介绍 | 5 分钟 | 介绍原型；说明这是一个原型（有些部分无法使用），并请客户大声说出自己的想法 | 采用规范措辞 |
| 任务 | 20-30 分钟 | 客户尝试故事板中的任务；访谈员观察并追问；团队在分组讨论室中安静观察 | 由团队根据故事板提供措辞 |
| 复盘 | 5-10 分钟 | 开放式了解客户的反应；如相关则询问价格；表示感谢 | 采用规范结构；团队调整价格问题 |

## 常见陷阱

- **把原型当成交付物，而不是学习工具。** 无论周五进展如何，原型都会在周五 17:00 PT 失效。在达到保真度标准后继续投入工程时间打磨原型，会浪费周四的时间。
- **只顾打磨，而没有构建足够的真实感。** 保真度标准问题是：“在 30 分钟访谈中，客户会相信这是真实产品吗？”如果答案是肯定的，原型就完成了。继续打磨会从试运行和补救工作中抢走时间。
- **访谈脚本包含引导性问题。** “你觉得相机流程使用起来简单吗？”是引导性的；“请带我回顾一下你刚才做了什么”则不是。试运行前，撰写者（或访谈员）要检查脚本中是否存在引导性问题。
- **跳过试运行。** 试运行可以发现失效的 Figma 链接、缺失的资源、令人困惑的文案，以及访谈员脚本过长等问题。务必在周四下午与一名虚拟客户一起进行试运行（由一名队友扮演目标画像中的客户）。
- **因为“这不重要”而不分配资源收集者角色。** 资源收集者负责避免演示屏幕上出现“`lorem ipsum`”以及“明显不是目标客户的人的图库照片”。务必分配该角色。
- **任务幕的脚本过于详细。** 任务应该是开放式的（“试着拍下这本书，稍后在你的书库中找到它”）；脚本过于详细的任务会变成教程，而不是测试。
- **因为“到时候再说”而没有暴露周四上午的取消情况。** 周四上午是激活候补参与者的最后一个无干扰窗口。到了周四下午，招聘人员对确认情况的把握会降低。

## 跨技能使用

前置条件：`tool-design-sprint-decide-and-storyboard`。Prototype-plan 使用周三的故事板作为构建规范。在没有故事板的情况下，此技能没有可用于映射角色的面板。

此技能不会调用 `tool-note-and-vote`。周四上午的规划没有投票环节；角色规划和脚本决策由 Facilitator 主导，并由 Decider 签字确认。

冲刺中的下一次调用：周五上午的 `tool-design-sprint-test-and-score`。

## 权威来源

- Knapp, J.、Zeratsky, J. 和 Kowitz, B. *Sprint*。Simon and Schuster，2016 年。周四章节（第 14–16 章）和 Five-Act Interview（第 17 章）。
- GV Design Sprint Guide。“Sprint Week Thursday.” https://www.gv.com/sprint/
- Character Capital。“Design Sprint Day 4.” https://www.character.vc
- Google Design Sprint Kit。“Thursday agenda template + Five-Act Interview script template.” https://designsprintkit.withgoogle.com/

## Decider 检查点

此技能在 `references/TEMPLATE.md` 中以 Decider Checkpoint 结束。Decider 批准角色规划、原型简报中的保真度标准、访谈脚本的 Tasks 环节以及试运行准入标准。签字确认后，团队分散开来并行开展构建工作；Decider 将于周五下午返回，参加访谈后的 Decider 评审。