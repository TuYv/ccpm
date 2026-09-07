---
name: landing-page
description: "Use this skill when the user needs to create or improve a landing page, write above-the-fold copy, structure a sales page, or increase landing page conversion rates. Also use when the user says 'build my landing page,' 'homepage copy,' 'hero section,' or 'marketing site.' Covers page structure, headline formulas, buyer psychology, and conversion elements."
---
# 落地页

落地页是一场销售对话，而不是一本宣传册。你只有 5 秒钟的时间来传达产品是做什么的、为什么它重要。这个技能为你提供每个部分所需的结构和文案。

## 核心原则

- 落地页只有一个目标。一切都服务于这个目标，否则就砍掉。
- 结构遵循买家的内心独白："这是什么？" -> "它适合我吗？" -> "它是如何运作的？" -> "我能信任它吗？" -> "我接下来该做什么？"
- 首屏是互联网上最宝贵的黄金地段。
- 长页面的表现可以胜过短页面——前提是每个部分都有其存在的价值。

---

## 工作流程

```
Landing Page Build:
- [ ] Define the ONE goal (signup, waitlist, demo request)
- [ ] Write the hero section (headline + subheadline + CTA)
- [ ] Plan sections in scroll order
- [ ] Write copy for each section
- [ ] Build the page
- [ ] Test on mobile
- [ ] Add analytics tracking (see analytics skill)
```

---

## 逐节构建

### Hero（首屏）

Hero 包含 5 个要素。把这些做对，剩下的就会容易得多。

1. **主标题** —— 陈述结果，而不是产品。
   - 要具体："把部署时间从 45 分钟缩短到 45 秒"
   - 而不是："部署得更快"
2. **副标题** —— 补充“如何实现”或第二个利益点。
3. **主要 CTA** —— 高对比度、具体的行动文案。“免费开始构建”，而不是“开始使用”。
4. **视觉元素** —— 产品截图、简短演示或动画插图。展示产品实际运行的样子。
5. **社会证明栏** —— Logo 展示条或数据指标：“深受 15,000+ 团队的信赖”

**告诉 AI：**
```
Write the hero section for our landing page:
- Product: [what it does, one sentence]
- Audience: [who it's for]
- Main benefit: [the #1 outcome users get]
- Social proof: [number of users, notable customers, or key metric]

Give me:
- 3 headline options (under 10 words each, outcome-focused)
- Subheadline for each (adds "how" or second benefit)
- Primary CTA button text + anxiety reducer below it
- Social proof line
Pick the strongest option and explain why.
```

### 工作原理

恰好 3 个步骤。认知上保持简单。

格式：[数字/图标] + [简短标题] + [一句话]

示例：
1. **连接你的代码仓库** —— 一键关联你的 GitHub。
2. **配置你的流水线** —— 我们的 AI 会推荐最优配置。
3. **自信发布** —— 每次 push 自动部署。

### 功能展示区

交替布局：先文字居左/图片居右，再文字居右/图片居左。

每个功能：[眉题标签] + [利益点标题] + [2-3 句描述] + [截图]

以利益点为主导，而不是功能名称：
- 差："高级分析仪表盘"
- 好："清楚知道哪些有效——以及哪些无效"

### 用户评价

- 包含：姓名、头衔、公司、头像照。
- 评价内容应提到：一个具体结果、使用前后的对比，或情感反应。
  - 好：“我们把新员工入职从 2 周缩短到 2 天。新员工现在真的会感谢我们。” —— Sarah Chen，Acme 工程副总裁
  - 差：“很棒的产品，真的太喜欢了！” —— J.S.
- 放在顾虑点附近（例如把安全性评价放在定价附近等）

### FAQ

任何 SaaS 都必须回答：
1. “有免费方案或试用吗？”
2. “设置需要多长时间？”
3. “可以随时取消吗？”
4. “我的数据安全吗？”
5. “你们支持哪些集成？”
6. 一两个产品特有的问题。

### 最终 CTA

用略有不同的角度重复主要 CTA。不同的标题，相同的行动。

---

## 完整页面构建

**告诉 AI：**
```
Build a landing page for our SaaS product:
- Product: [what it does]
- Audience: [who it's for]
- Main benefit: [#1 outcome]
- Features: [list 3-4 key features]
- Social proof: [logos, metrics, testimonials you have]
- CTA: [what you want visitors to do — signup, waitlist, demo]

Use this section order:
1. Hero (headline, subheadline, CTA, social proof bar)
2. Problem agitation (articulate the pain they're feeling)
3. How it works (3 steps)
4. Feature sections (3-4, alternating layout with screenshots)
5. Testimonials (use placeholders if I don't have real ones yet)
6. Pricing preview or "See plans" CTA
7. FAQ (6-8 questions)
8. Final CTA (different angle, same action)

Make it responsive. Use [Tailwind / our existing design system].
If I'm using Lovable: keep the prompt focused on what the user sees, not implementation details.
```

---

## 改进现有页面

**告诉 AI：**
```
Review our landing page at [URL or file path] and improve it:
- Check: Is the headline outcome-focused or feature-focused?
- Check: Is there a clear single CTA above the fold?
- Check: Does social proof appear early?
- Check: Does the page follow the buyer's monologue
  (What is this → Is it for me → How does it work → Can I trust it → What do I do)?
- Rewrite any weak sections
- Add missing sections (FAQ, testimonials, final CTA)
```

---

## 性能要求

- 加载时间：3G 网络下 <2 秒
- LCP（Largest Contentful Paint）：<2.5 秒
- 加载时无布局偏移（CLS <0.1）
- 对首屏以下的所有内容做懒加载
- 对 Hero 图片/视频进行极致优化

---

## 常见错误

| 错误 | 修正 |
|---------|-----|
| 首屏没有清晰的 CTA | 一个带有具体行动文案的高对比度按钮 |
| 以功能为中心的标题 | 陈述用户能获得的结果，而不是产品做什么 |
| “开始使用”或“了解更多”式的 CTA | 要具体：“创建你的第一个仪表盘” |
| 没有社会证明 | 添加 Logo、用户数或用户评价——哪怕只有一条也有帮助 |
| 缺少 FAQ 部分 | 回答每个买家都会有的 5-6 个问题 |
| 只针对桌面端的设计 | 50% 以上的流量来自移动端。优先在移动端测试。 |
| 试图面面俱到 | 一个页面，一个目标，一个受众。其余的都砍掉。 |

---

## 相关技能

- **copywriting** —— 撰写更有力的标题、CTA 和微文案
- **conversion** —— 用于提高注册率的 CRO 技巧
- **seo** —— 让落地页在目标关键词上获得排名
- **brand-identity-generator** —— 在动手构建之前确立视觉识别
- **beautify** —— 让页面看起来经过精心设计
