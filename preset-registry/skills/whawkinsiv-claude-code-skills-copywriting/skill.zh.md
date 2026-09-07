---
name: copywriting
description: "Use this skill when the user needs to write headlines, CTAs, button text, error messages, onboarding copy, or any UI text. Also use when the user says 'write copy for,' 'what should this say,' 'help me with the wording,' or is building any page or component that needs text. Covers headline formulas, microcopy best practices, benefit-driven copy, and SaaS writing style."
---
# 文案与微文案

文字也是界面元素。它们能减少困惑、建立信任、驱动行动。这项技能帮助你为产品的每一个界面撰写文案——从标题到错误提示。

> **如果项目根目录中存在 `ABOUT-ME.md` 和/或 `MY-ICP.md`**，请在动笔之前先阅读它们。用 ABOUT-ME.md 把握语气与风格——像创始人一样写作。用 MY-ICP.md 确定信息框架——用客户自己的语言去谈他们的痛点。当两者同时存在时：用创始人的声音传递客户的信息。

## 核心原则

- 清晰优先于巧妙。用户永远不该需要把一行字重读一遍。
- 像一位聪明的朋友那样写作，而不是像一家公司。温暖、直接、自信。
- 每个词都必须证明自己存在的价值。毫不留情地删。
- 收益先于功能。“每周节省 4 小时”胜过“自动化报表”。
- 最好的微文案是无形的——它在问题被问出之前就将其化解。
- 使用用户的语言，而不是你们的内部行话。
- 具体性建立可信度。“加入 12,847 个团队”胜过“加入数千个团队”。

---

## 工作流程

```
- [ ] Identify what you're writing (headline, CTA, error, empty state, etc.)
- [ ] Define the ONE job this copy has (inform, persuade, reassure, guide)
- [ ] Write a draft using the patterns below
- [ ] Review against the voice checklist
- [ ] Test: read it aloud. If it sounds stiff, rewrite.
```

---

## 标题

行之有效的公式：

- **[期望结果] + 无[痛点]：**“发布更快，不出乱子”
- **[动词] + 你的[名词]：**“自动化你的工作流”
- **为[特定人群]打造的[名词]：**“专为讨厌 CRM 的创始人打造的 CRM”
- **[时间期限]内实现[具体成果]：**“10 分钟内上线你的落地页”
- **告别[痛点]。开始[收益]：**“别再追讨发票。开始坐等收款。”

**告诉 AI：**
```
Write 5 headline options for our [page type]:
- Product: [what it does]
- Audience: [who it's for]
- Main benefit: [what they get]
- Use these formulas: outcome without pain, specific result in timeframe, the X for Y
- Make each under 10 words
- Show the strongest option first with reasoning
```

---

## 按钮与 CTA 文案

- 使用第一人称：写“开始我的免费试用”，而不是“开始你的免费试用”
- 要具体：“创建仪表盘”，而不是“提交”或“继续”
- 强化价值感：“获取我的报告”，而不是“下载”
- 降低焦虑：在 CTA 下方添加安抚性说明（“无需信用卡”、“随时可取消”、“最多 3 个项目免费”）
- 破坏性操作：写明后果。“删除项目”，而不是“删除”。确认提示：“这将永久删除 'Acme Dashboard' 及其所有数据。”

**告诉 AI：**
```
Write CTA copy for our [signup / pricing / feature] page:
- Primary action: [what the user does]
- Current CTA text: [what it says now]
- Anxiety reducers needed: [credit card concern, commitment concern, etc.]
- Give me 3 options: safe, bold, and playful
- Include the helper text that goes below the button
```

---

## 错误提示

这是任何产品中最被低估的文案。

- 用平实的语言说明发生了什么。
- 如果有帮助，说明为什么会发生。
- 说明如何解决——永远都要写。
- 永远不要责怪用户。

| 差 | 好 |
|-----|------|
| “输入无效” | “这个邮箱地址看起来不太对——检查一下有没有打错。” |
| “错误 403” | “您没有访问此页面的权限。请向团队管理员申请权限。” |
| “出错了” | “我们无法保存您的更改。请检查网络连接后重试。” |

**告诉 AI：**
```
Write error messages for these scenarios in our app:
1. [Form validation failure — what field, what's wrong]
2. [API/network error — what the user was trying to do]
3. [Permission error — what they tried to access]
4. [Not found — what they were looking for]

For each: plain language, no blame, include how to fix it.
Follow this pattern: What happened + Why (if helpful) + How to fix it.
```

---

## 空状态

永远不要留下空白的屏幕。空状态是引导用户上手的机会。

结构：[插图或图标] + [该区域的用途] + [单个引导开始的 CTA]

示例：“还没有项目。项目能帮你把工作组织成一个个专注的工作流。[创建你的第一个项目]”

**告诉 AI：**
```
Write empty state copy for these screens:
1. [Screen name — what it shows when populated]
2. [Screen name — what it shows when populated]
3. [Screen name — what it shows when populated]

For each: one sentence explaining what this area is for + one CTA button text.
Keep it encouraging, not sad. The user just got here — show them the path forward.
```

---

## 新手引导文案

- 欢迎页：强化价值主张，而不是“欢迎使用 AppName”。
  - 好的做法：“让我们在 5 分钟内让你的第一个仪表盘上线。”
- 进度指示：“第 2 步，共 4 步——连接你的数据源”
- 跳过选项：始终允许用户跳过。写“我稍后再做”，而不只是“跳过”。
- 工具提示：每条提示只讲一个意思。不超过 15 个词。

**告诉 AI：**
```
Write onboarding copy for our setup wizard:
- Product: [what it does]
- Steps: [list 3-5 setup steps]
- Aha moment: [when the user first gets value]

For each step: headline (under 8 words), description (under 25 words), button text.
Welcome screen should promise a quick win, not just say "Welcome."
Include skip option text for optional steps.
```

---

## 定价页文案

- 套餐名称应传达目标受众信息：“入门版”、“团队版”、“企业版”——而不是“青铜版”、“白银版”、“黄金版”
- 用“最受欢迎”或“适合大多数团队”来突出推荐套餐
- 功能列表：以差异化优势开头，而不是罗列通用功能
- 在有帮助时使用按单位拆分的表述：“$8/用户/月”比“10 个用户每月 $80”感觉更低

套餐分层设计与定价策略请参阅 **pricing** 技能。

---

## 通知与提醒文案

- Toast 轻提示：最多 6-10 个词。“项目已保存”或“邀请已发送给 3 位队友。”
- 确认对话框：写明操作与后果。“删除 'Q4 Report'？此操作无法撤销。”
- 成功状态：简短庆祝，然后引导用户转向下一步。“一切就绪。你的第一份报告大约 2 分钟后就会生成。”

---

## 设置与管理文案

- 为所有内容编写标签，就当用户从未见过它们一样。
- 在表单字段下方使用辅助说明来解释其影响。
- 开关的描述应写明“开启”意味着什么：“邮件通知——当有人提到你时收到一封邮件。”

---

## 语气校准

- **轻松时刻**（空状态、成功提示、新手引导）：更温暖、更友好。
- **关键时刻**（错误、破坏性操作、计费）：清晰、冷静、精确。
- 在错误场景下或用户可能感到沮丧时，绝不使用幽默。

---

## 文案审查清单

在任何文案发布之前：

```
- [ ] Can a stranger understand this without context?
- [ ] Is every word earning its place? (cut filler)
- [ ] Benefits before features?
- [ ] Specific rather than vague?
- [ ] Active voice, not passive?
- [ ] Reads naturally aloud?
- [ ] Matches the moment's tone (casual vs. critical)?
```

---

## 常见错误

| 错误 | 修正 |
|---------|-----|
| 每个按钮都写着“开始使用” | 点明具体操作：“创建项目”、“发送邀请” |
| 没人看得懂的炫技式标题 | 测试：陌生人能在 5 秒内看懂吗？ |
| “出错了”式的错误提示 | 说明发生了什么、如何解决 |
| 毫无引导的空白屏幕 | 每一个空状态都是一次引导上手的机会 |
| 公司腔（“我们很高兴地通知您……”） | 像人一样写作。“事情是这样的。” |
| 所有地方都用同一句 CTA 文案 | 让 CTA 契合每个页面的具体价值 |

---

## 相关技能

- **landing-page**——完整的页面结构与逐区块文案
- **conversion**——让文案获得更高转化的 CRO 技巧
- **humanize**——去除生成文案中的 AI 写作痕迹
- **brand-identity-generator**——在动笔前确立语气与风格
