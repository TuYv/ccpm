---
name: build-in-public
description: Best practices for sharing engineering work publicly — what to post, what to withhold, and channel-specific guidance
when-to-use: When drafting build-in-public posts, changelogs, or launch content for social channels
user-invocable: false
effort: low
---
# 公开构建 —— 最佳实践

## 理念

公开构建不是营销。它是让别人看着你工作。最好的帖子感觉像你在把自己的思考过程讲给一个同样是资深工程师的朋友听。不要浮夸。不要“我很兴奋地宣布”。就直接说：我做了什么，为什么重要，我学到了什么。

## 该分享什么（以及不该分享什么）

**分享：**
- 技术决策以及背后的理由（“之所以选 SQLite 而不是 Postgres，因为...”）
- 架构洞见（“这里是 9 层路由管线的工作方式”）
- 失败经历以及学到的东西（“花了 3 小时调试竞态条件。根因是：...”）
- 前后对比指标（“Compaction 死循环：通过 Mnemos 从 26 降到 0”）
- 开源发布，但要有上下文，不只是贴链接
- 让你感到意外的反直觉发现

**绝不要分享：**
- 收入数据、用户数、估值
- 客户名称或可识别的客户细节
- 内部 URL、API 密钥、凭证
- 任何受 NDA 约束的内容
- 你可能无法兑现的路线图承诺
- 伪装成内容的“我们在招聘”

## 按渠道的最佳实践

### LinkedIn

**受众：** 工程师、CTO、会动手的创始人。他们在会议间隙刷内容，希望看到能让自己停下来思考的东西。

**格式：**
- 1-3 段，800-2000 字符是甜蜜区
- 以洞见开头，而不是背景
- 多用换行——整块文字会毁掉互动
- 每篇只传达一个明确收获
- 第一段不要放外链（LinkedIn 会惩罚跳转到平台外的点击）

**语气：** 自信，能教会别人一些东西。你是资深工程师在向同行解释自己的做法。不要用不加解释的行话。如果你用了别人可能不熟悉的技术，就简要说明一下。

**发布时间：** 目标时区的周二到周四，上午 8-10 点。避开周末和周一早上（大家都在补进度）。

**有效内容：**
- 带有具体代码示例的技术深挖
- “我是如何构建 X 的”类叙事，配上架构图
- 来自失败的经验教训（这类内容比成功故事表现好 3:1）
- 有依据的行业趋势观点

**效果差的内容：**
- “兴奋地宣布”式新闻稿
- 只有产品更新、没有技术洞见的内容
- 没有实质内容的激励式帖子
- 超过 2500 字符且没有强钩子的帖子

### X（Twitter）

**受众：** 会交付的开发者。他们刷得快，判断也快。你只有一句话去抓住他们的注意力。

**格式：**
- 最多 280 个字符
- 不要发长线程，除非这个洞见确实需要 3 条以上
- 以反直觉或出人意料的点开头
- 一条帖子只讲一个想法。如果有两个想法，就拆成两条
- 截图需要 alt 文本，描述图里显示了什么

**语气：** 尖锐、带观点、零废话。想象你在给一个做开发的朋友发消息。如果听起来像营销，删掉。

**发布时间：** 目标时区的周二到周五，上午 9-11 点或下午 2-4 点。周末也可能适合开发者受众（他们会做副业项目）。

**有效内容：**
- 一句话技术洞见（“好 API 和伟大 API 的差别在于错误信息。”）
- 带指标的前后对比
- “刚发布了 X。最让我意外的是这一点。”
- 提出真正的技术问题（参与诱导会适得其反）

**什么会翻车：**
- 关键词堆砌
- 本可以是一条帖子的线程
- 没有个人经历的泛泛“热观点”
- 发链接却不给上下文

## 内容日历节奏

**每日（如果你有话要说）：**
- 一条关于你今天在做什么或学到了什么的 X 帖子

**每周：**
- 一条 LinkedIn 帖子：更深入的技术洞见或项目里程碑

**每次事件（由插件触发）：**
- PR 合并 → 24 小时内发 LinkedIn，当天发 X
- 功能上线 → 两个渠道都发，LinkedIn 先发，X 90 分钟后发
- 评审通过 → 只发 X（架构洞见更适合短平快）
- 重大版本发布 → LinkedIn 深度解读 + X 公告

## 要避免的反模式

1. **“我们”陷阱** —— 独立开发者用 “we” 会显得没底气。用 “I”，除非你确实是团队。
2. **互动诱导** —— 每条帖尾都写 “Agree?” 或 “Thoughts?” 会显得很刻意。让观点自己成立。
3. **只发不做** —— 如果你两周内没有交付任何东西，就别发帖。你的内容应该是工作的副产品，而不是替代品。
4. **LinkedIn 大佬腔** —— “I'm humbled and honored to share...” 直接删掉。你不是在领奖。
5. **过度打磨** —— 一条像是改了 5 轮的帖子会显得太企业化。直接发草稿。
6. **忽视回复** —— 如果有人花时间互动，请在 24 小时内回复。评论区里的对话往往比原帖更有效。

## 评估什么有效

跟踪这些信号（Buffer、LinkedIn analytics、X analytics）：
- **Impressions** —— 有多少人看到了它
- **Engagement rate** —— （点赞 + 评论 + 转发）/ impressions
- **Profile visits** —— 这条帖子有没有把人带去进一步了解你？
- **Inbound** —— 提到具体帖子的私信、加好友请求或邮件

一篇好的 LinkedIn 帖子：3-5% 的 engagement rate。很棒的一篇：8%+。在 X 上，任何高于 2% 的技术内容都算不错。

## 插件集成

build-in-public 插件会自动遵循这些做法：

```yaml
# What gets shared vs skipped:
on_pr_merged:
  - Share if: >3 files changed, meaningful commit message
  - Skip if: typo fix, dependency bump, config change only

on_feature_shipped:
  - Share: always, with screenshot
  - LinkedIn: deep dive on architecture decisions
  - X: punchy one-liner on impact

on_review_passed:
  - Share if: 3/3 unanimous approval
  - X only: architecture insights are punchy
  - Skip if: 1/3 or 0/3 (revisions aren't share-worthy)
```

## 默认匿名

所有帖子在发布前都会通过 `anonymize.yaml` 脱敏。公司名称会变成通用描述。收入会变成“at scale”。读者学到的是你的工程实践，而不是你雇主的财务数据。