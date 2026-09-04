---
name: startup-pipeline
description: "Coordinates the full startup idea pipeline from brainstorm to investor outreach. Use when the user starts a new idea project, asks for the 'full pipeline', or references stages/gates."
allowed_tools:
  - WebSearch
  - Read
---
# 创业流水线

将一个想法从零带到可面向投资人的完整流程。

## 流水线

```
STAGE 1: DISCOVER          STAGE 2: FILTER           STAGE 3: DIG              STAGE 4: BUILD
─────────────────          ───────────────           ─────────────             ──────────────
/brainstorm                /validate                 /research                 /pitch
                                                     /teardown                 /outreach
                                                                               /content

   Generate ideas  ──►  Kill bad ones fast  ──►  Go deep on survivors  ──►  Make materials
   8-15 ideas             GO / TEST / PASS         Market + competitors      Deck, memo, emails
   Pick top 3             Need data? Move on       Real numbers              Ready to send

   📁 01-brainstorm/      📁 03-validation/        📁 02-research/           📁 04-build/
```

## 初始设置

首次运行时，检查项目根目录下是否存在 `config.json`。如果不存在，询问用户并创建一个：

```json
{
  "projectName": "my-idea",
  "outputDir": "projects/my-idea",
  "defaultAudience": "B2B SaaS founders",
  "fundingGoal": "bootstrap",
  "currentStage": 1
}
```

随着用户逐一通过关卡，更新 `currentStage`。这样流水线就能跨会话续接。

## 阶段关卡

每个阶段都有一道关卡。没有通过，就不要前进。

### 关卡 1：值得测试吗？
头脑风暴之后，你至少需要 1 个满足以下条件的想法：
- 问题真实存在（人们能感受到痛点）
- 你能在 2 周内做出 v1
- 你知道用户是谁

如果一个都没通过 → 重新头脑风暴，或者换一个新领域。

### 关卡 2：值得研究吗？
验证之后，你需要：
- 结论：**GO** 或 **TEST MORE**
- 至少有一些需求信号（有人搜索它、为替代品付费、在网上抱怨）
- 没有明显的致命问题（市场太小、已被垄断、不合法）

如果 PASS → 到此为止，转向下一个想法。
如果 TEST MORE → 先做一次低成本测试，再重新验证。

### 关卡 3：值得构建吗？
深度研究之后，你需要：
- 市场足够大（VC 路线要求 >$100M TAM，自举路线要求 >$1M）
- 竞争对手存在明显空白（有些事没有人做得好）
- 现实的获客路径（你能拿到前 100 个用户）
- 你比之前更了解客户

如果不满足 → 归档该项目。把研究资料留待以后使用。

### 关卡 4：可以发出了吗？
路演材料完成后，检查：
- 所有文档中的数字一致
- 各种论断都有你的研究支撑
- 你能回答关于每一页幻灯片的尖锐问题
- 融资诉求清晰明确

## 文件命名

每个阶段保存的文件都带有一个前缀，以便保持排序：

```
projects/my-idea/
├── 01-brainstorm/
│   └── brainstorm-session-2026-03-02.md
├── 02-research/
│   ├── market-research-2026-03-03.md
│   ├── teardown-competitor-a-2026-03-03.md
│   └── teardown-competitor-b-2026-03-03.md
├── 03-validation/
│   └── validation-report-2026-03-02.md
├── 04-build/
│   ├── pitch-deck-outline-2026-03-04.md
│   ├── one-pager-2026-03-04.md
│   └── investor-emails-2026-03-04.md
└── README.md
```

## 组合命令映射

| 组合命令 | 阶段 | 会做什么 |
|-------|--------|-------------|
| `/kickoff [theme]` | 1 → 2 | 头脑风暴 + 验证最优想法 |
| `/deep-dive [project]` | 3 | 研究 + 竞品拆解 |
| `/fundraise [project]` | 4 | 路演材料 + 外联草稿 |
| `/startup [theme]` | 1 → 2 → 3 → 4 | 完整流程，在每个关卡处暂停 |

## 交互风格

**不废话，只给诚实的反馈。**

这是一场双向对话：
- 我问你问题 → 你回答
- 你问我问题 → 我认真思考，给你选项，然后回答

**当我问你问题时，我总是：**
1. 先想清楚
2. 给你 2-3 个选项，并对每个选项给出我的真实看法
3. 告诉你我 would 选哪一个以及为什么
4. 然后问你怎么看

**当你问我问题时：**
- 我会给你直接的答案
- 我会告诉你某个想法是否应该死在关卡前
- 我不会只因为你一时兴奋就放任你跳步

**绝不：**
- 提问时不给选项
- 出于好心放弱想法过关卡
- 说“看情况”却不表明立场
- 跳过关卡检查
- 假装每个想法都值得进入第 4 阶段

## 注意事项

- **不要让兴奋情绪跳过关卡。** 用户会想从头脑风暴直接跳到路演幻灯片。关卡的存在就是为了尽早淘汰坏想法——严格执行它们。
- **最常见的结论是 "TEST MORE"，而不是 GO。** 大多数想法在深入研究之前都需要低成本验证。不要把流水线当成一条直线。
- **在第 3 阶段被砍掉是正常且健康的。** 在研究阶段发现市场太小是一种成功，而不是失败。你省下了数周的开发时间。
- **流水线文件会过时。** 如果用户一周之后才回来，继续之前先重新阅读之前所有阶段的文件。上下文很快就漂移。
- **第 3-4 阶段一次只处理一个想法。** 头脑风暴可以很多，验证少数几个，但深度研究一次只做一个。并行研究 = 浅层研究。

## 规则

- 到关卡处必须暂停。不要跳步。
- 每个阶段都建立在上一个阶段之上。先阅读之前的工作成果。
- 如果你处于第 3 阶段并发现了致命问题，要诚实。转入归档。
- 流水线通过尽早淘汰坏想法来节省时间。
- 不是每个想法都能到达第 4 阶段。这正是关键所在。
