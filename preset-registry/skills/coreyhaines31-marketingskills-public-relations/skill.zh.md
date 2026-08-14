---
name: public-relations
description: "When the user wants help with public relations, earned media, press coverage, journalist outreach, or media strategy (not pull requests). Also use when the user mentions 'PR,' 'public relations,' 'press,' 'press release,' 'press coverage,' 'media outreach,' 'pitch a journalist,' 'get featured,' 'media list,' 'media kit,' 'press kit,' 'newsjacking,' 'news hijack,' 'HARO,' 'Qwoted,' 'Featured,' 'Help A Reporter,' 'reporter request,' 'tech press,' 'TechCrunch,' 'earned media,' 'thought leadership placement,' 'op-ed,' 'guest article,' 'press contacts,' or 'how do I get press.' Use this for earned media work — finding journalists, pitching stories, newsjacking, and responding to press requests. For startup/SaaS/AI directory submissions, see directory-submissions. For product launches, see launch. For social-media engagement, see social. For cold-email outreach to prospects, see cold-email."
metadata:
  version: 1.0.0
---
# 公共关系与赢得媒体

你是软件产品赢得媒体领域的专家。你的目标是帮助用户高效地获得记者、播客和新闻通讯的报道，同时尊重接收推介的另一方。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或旧版配置中的旧文件名 `product-marketing-context.md`），请在提问前阅读该文件。利用其中的上下文，只询问尚未涵盖或与此任务特定相关的信息。

---

## 核心理念

公关不能替代分发。它是分发的放大器。

- **赢得媒体不会直接推动转化。** 一篇 TechCrunch 报道不会为你带来 1,000 名付费客户。它会为你带来反向链接、品牌公信力、AI 引用覆盖面，以及销售沟通中的有力素材。
- **像向客户推介一样向记者推介：**具体、实用、快速，而且绝不以你自己为中心。
- **故事不是你的产品。故事是趋势、数据、冲突或人物。**你的产品是证据。
- **在响应式公关中，速度胜过精雕细琢。** 新闻发生后第一个小时内发出的 B+ 级推介，胜过第三天才发出的 A+ 级推介。

### 何时值得做公关

- 你有**真正的故事**——专有数据、鲜明观点、里程碑、具有显著前后对比的客户案例，或针对热门话题的新颖视角
- 你能投入**创始人/高管的时间**——记者希望引用利益攸关者的观点，而不是公关代表的说辞
- 你有**承接流量的目的地**——新闻页面、博客文章或产品发布页面，能够将关注转化为有用的成果

### 何时应暂缓公关

- 产品尚未发布，除了“我们存在”之外没有其他故事
- 团队中没有人能持续进行 4–6 周的推介（公关是一场依靠势能的游戏）
- 你没有清晰的 ICP——记者会问：“谁会因为这件事而阅读我的文章？”如果你无法回答，他们也无法回答

---

## 公关组合

共有四种模式。大多数团队会过度侧重其中一种。至少同时开展三种。

| 模式 | 内容 | 投入 | 获得报道的速度 |
|------|------------|--------|-------------------|
| **响应式（新闻劫持）** | 将你的观点融入热门新闻 | 低至中等 | 数小时至数天 |
| **主动式（媒体推介）** | 建立媒体名单，推介原创故事 | 高 | 2–8 周 |
| **入站式（媒体征集）** | 回应 HARO/Qwoted/Featured 上的记者征集 | 低 | 数天至数周 |
| **自有式（新闻页面 + 媒体资料包）** | 让记者能够轻松找到你 | 一次性设置 | 不适用 |

**关于响应式新闻劫持工作流**——请参阅 [references/newsjacking.md](references/newsjacking.md)

**关于主动向记者推介**——请参阅 [references/journalist-pitching.md](references/journalist-pitching.md)

**关于入站式媒体征集平台（HARO、Qwoted 等）**——请参阅 [references/press-platforms.md](references/press-platforms.md)

**关于向何处推介（媒体机构、播客、新闻通讯）**——请参阅 [references/media-outlets.md](references/media-outlets.md)。对于初创企业/SaaS/AI 目录，请使用单独的 `directory-submissions` skill——目的不同，名单也不同。

---

## 自有阵地：新闻页面 + 媒体资料包

只需设置一次。这是成本最低的公关投入，却能让未来的每一篇报道都获得最高的投资回报率。

**新闻页面（`/press` 或 `/newsroom`）应包含：**
- 一段式公司简介（可直接复制粘贴）
- 创始人简介及头像（高分辨率、可下载）
- Logo 素材包（SVG + PNG、浅色版 + 深色版，并附使用指南）
- 产品截图（高分辨率）
- 近期报道列表（为下一位记者提供社会认同）
- 成立日期、员工人数、融资情况（如已公开）
- 媒体联系邮箱（不要用表单——记者讨厌表单）
- 近期新闻稿 / 公告

**在页面顶部放一句话：**“如需采访或获取素材，请发送邮件至 press@yourcompany.com——我们会在 24 小时内回复。”

然后*真的*在 24 小时内回复。

---

## 快速参考：推介质量标准

发送任何推介之前，以下所有问题的答案都应该是“是”：

- [ ] 这位记者是否报道这一领域？（查看他们最近的 5 篇文章。）
- [ ] 是否有明确的新闻切入点——某件刚刚发生或即将发生的事情？
- [ ] 这位记者能否仅凭这封邮件写出一篇完整报道？（数据、引语、客户名称、联系方式。）
- [ ] 邮件主题是否足够具体，能够据此预测文章标题？
- [ ] 推介内容是否少于 150 个单词？
- [ ] 是否避免使用了“revolutionary”“game-changing”“disruptive”和“synergy”这些词？
- [ ] 诉求是否明确？（采访？禁发期？独家？引语？）

只要有一个答案是“否”，就不要发送。

---

## 衡量指标

需要跟踪的指标：

| 指标 | 原因 |
|--------|-----|
| **报道数量**（刊登次数 / 月） | 活跃度基准 |
| **刊登媒体的域名评级** | 反向链接价值 |
| **报道带来的引荐流量** | 真的有人点击了吗？ |
| **品牌搜索量增长** | 人们阅读后搜索你了吗？ |
| **AI 引用率**（ChatGPT、Perplexity 是否引用你的品牌？） | 如今真正重要的新衡量指标 |
| **提及该文章的销售对话** | 唯一真正影响营收的指标 |

不必过度关注：AVE（广告价值当量）——这是公关公司发明的虚荣指标。

---

## 常见工作流

### “帮我借势营销 [trending story]”
前往 [newsjacking.md](references/newsjacking.md)，执行评分标准，拟定 2–3 个角度，选出最佳角度，然后起草推介邮件。

### “查找报道 [beat] 的记者”
前往 [journalist-pitching.md](references/journalist-pitching.md)，使用发现清单 + dev-browser 研究近期文章，建立一份经过评分的名单。

### “本周有哪些内容值得推介？”
综合考虑：近期产品里程碑 + 当前新闻周期 + 你收集到的任何数据。按照上述质量标准为每个潜在报道选题评分。

### “回复这条 HARO 征询”
前往 [press-platforms.md](references/press-platforms.md)，使用回复模板，并将内容控制在 200 个单词以内。

### “创建我的新闻页面”
使用上述清单。大多数公司会花一个下午完成这件事，然后一年都不再管它——这没问题。