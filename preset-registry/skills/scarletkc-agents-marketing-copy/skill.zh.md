---
name: marketing-copy
description: "Write outbound promotional copy for a product or project: launch and update posts for community platforms and social media, store page descriptions and short blurbs, landing page headlines and calls to action, press-style announcements, and the naming of a product for another language or market. Covers what may be disclosed publicly, keeping claims traceable to shipped changes, and writing a headline that carries information instead of hype. Use when drafting or revising anything aimed at people who do not use the product yet, and when deciding whether a link, key, price, or unreleased detail can appear in public copy."
license: Apache-2.0
metadata:
  author: scarletkc
  source: https://github.com/scarletkc/agents
  summary: "Write outbound promo copy that stays truthful, discloses only what may be public, and earns attention without hype."
---
# 营销文案

对外文案触达的是既没有产品背景、也没有理由把它读完的人。它也是披露失误会永久留存的层面：帖子可以删除，它的截图不能。这两个事实推向同一个方向——做出读者可以核实的具体断言。

本文涵盖的是面向外部的文案。产品内部字符串和文档遵循 [`ux-writing`](https://github.com/scarletkc/agents/blob/main/skills/ux-writing/SKILL.md)；匹配作者个人语气则属于 [`talk-like-scarletkc`](https://github.com/scarletkc/agents/blob/main/skills/talk-like-scarletkc/SKILL.md)。

## 披露优先

动笔之前先决定哪些内容可以公开，因为草稿正是让泄密变得习以为常的地方。

- **密钥、邀请码和凭证不是文案。** 任何授予访问权限的东西，都属于在自身条款下分发它的那个渠道，绝不要内联出现在公开帖子里，也绝不要“待会再删”式地粘贴进草稿。
- **未发布或未公开的 URL 就保持不公开。** 一个尚未宣布的链接，不会因为它能解析就算已经发布。端点、staging 主机，以及只有已被告知者才能访问的页面，同理适用。
- **平台规则约束的是文案，而不只是账号。** 每个发布渠道对可推广、可链接、可定价或可赠送的内容都有自己的限制，而且承载同一篇帖子的不同平台之间，这些限制各不相同。当某条规则使某个细节无法发布时，就删掉这个细节；为了在字面上守住规则而拐弯抹角地暗示它，是同样的违规，只是文案更糟。
- **未上线的工作不是功能。** 路线图事项、计划中的平台，以及任何仍卡在审核之后的内容，要么按其本来面目描述，要么干脆不提。宣布一个日期，就制造了一项文案本身看不到的义务。

当某个限制挡住了请求方想要包含的细节时，要说明是哪个细节、为什么被挡，然后交给他们决定，而不是悄悄删掉或悄悄保留。

## 断言保持可追溯

从实际已发布的内容中取材：变更日志、提交范围、发布说明。每一个具体断言都要能追溯到其中之一，而承载了断言的形容词，就必须兑现 `ux-writing` 中 "adjectives need evidence" 对它的要求。对外文案补充的是兑换率：相同篇幅下，具体胜过形容词，因为一个数字、一种机制、一组前后对比所承载的说服力是 "greatly improved" 给不了的，而且它经得起会去核实的读者。

绝不编造指标、基准测试结果、用户数量、评论引语，或与点名竞争对手的对比。当诚实的版本显得单薄时，那是一条关于本次发布本身的信息，而不是催促你去夸大它的提示。

## 为从未见过它的人写作

先说这东西是什么，再说它为什么变好了。看不出产品是做什么的读者，无从在意它改进了；而一篇面向现有用户的更新帖，在其他所有人读来就是噪音。当一篇帖子必须同时服务两类读者时，那句点明产品是什么的话只花一行，却买下其余的一切。

Revolutionary、seamless、game-changing 和 unleash 这些词在这一文体中已经不再承载意义：无论实际发布了什么，它们都会出现在每一篇发布帖里，所以读者会跳过它们，去找底下的具体内容。直接写出具体内容。人为制造的紧迫感和凭空捏造的稀缺性会以同样的方式失效，而且当那个截止日期被证明纯属随意时，代价更大。

一篇帖子带有多个诉求是合理的，因为一次发布往往想同时收获愿望单、社区和下载。按这位特定读者当下能够着手行动的事项为这些诉求排序，让每一条都容易被找到，而不是在同一句子里互相争夺。

## 跨语言的命名

为另一个市场改写的产品名称是一项命名决策，而不是翻译。确认候选名称对该受众而言容易发音、便于记忆，不带意外的含义，也不与同品类的现有产品撞名。优先选择受众能够搜索的名称，而且一旦某个名称形式已随产品出现在任何公开场合，就保持稳定。同一产品的第二个名字，会把关于它的每一条搜索结果和每一次讨论都一分为二。
