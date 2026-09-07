---
name: build
description: "Use this skill when the user needs to build features with AI coding tools, choose between Claude Code, Lovable, Replit, or Cursor, write effective prompts for code generation, or iterate on AI-generated code. Covers tool selection, prompting strategies, and development workflows for non-technical founders."
---
# 构建

## 工具选择

**从零开始？** → Lovable（最快出 MVP）
**已有代码库？** → Claude Code（上下文最好）
**正在学习编程？** → Replit（适合学习）
**已经会写代码？** → Cursor（功能强大）

详细对比见 [TOOLS.md](TOOLS.md)。

---

## 构建工作流

```
- [ ] Start with spec (use scope skill)
- [ ] Give spec to AI tool
- [ ] Test happy path + edge cases
- [ ] Give specific feedback on issues
- [ ] Iterate (expect 2-4 rounds)
- [ ] Deploy when working
```

---

## 把规格说明交给 AI

### Claude Code
```
Build this feature: [paste spec]

Codebase: React + TypeScript + Tailwind
Reference: src/components/Button.tsx for button patterns
```

### Lovable
```
Build: [paste simplified spec focusing on outcome]
Make it look like Linear (minimal, clean)
```

### Replit
```
Create: [paste spec emphasizing what user sees]
Use React. Keep simple.
```

相关模式见 [PROMPTS.md](PROMPTS.md)。

---

## 分步构建，不要一次做完

非技术创始人犯的最大错误：把整份规格说明一次性交给 AI，然后指望它一次就完美交付。不可能。AI 工具在专注完成一个个小块任务时表现最好。

**构建循环：**
```
1. Pick ONE piece (a single feature or flow)
2. Give AI a clear spec for just that piece
3. Test it — does the piece work?
4. Fix any issues before moving on
5. Pick the next piece → repeat
```

**合适的工作单元**（每个 1-3 小时）：
- 用户注册和登录
- 展示关键指标的仪表盘
- 包含个人资料编辑的设置页
- 一个核心工作流（例如“创建一张发票”）

**不合适的工作单元**（太大）：
- “构建整个应用”
- “构建包含所有集成的仪表盘”
- “包含角色、权限和团队功能的用户管理”

### 各工作单元之间的质量关卡

在构建下一个功能之前，先检查：**上一个功能还能正常用吗？** 你还能注册、完成核心操作、看到结果吗？AI 工具有时会在添加新功能时弄坏已有功能。要尽早发现这些问题。

### 何时开启全新会话

在以下情况下，请与你的 AI 工具开启新的聊天/会话：
- AI 对同一个修复已尝试 **3 次以上**仍未成功 —— 上下文已被污染
- 每修好一个 bug 就**冒出新 bug**
- AI 在**兜圈子**（提出它已经试过的方案）
- 完成当前功能后想**添加新功能**

开启新会话时，要向 AI 清楚描述：已有哪些东西、哪些能正常工作、你接下来需要什么。不要默认它还记得。

### AI 不会主动添加、除非你要求的东西

AI 构建的项目通常在没有以下内容的情况下就上线了。请明确要求添加：

```
Ask Your AI Tool to Add:
- [ ] Error tracking (Sentry) — so you know when things break
- [ ] Analytics snippet (Plausible, PostHog, or GA4) — so you know who visits
- [ ] Proper 404 page — so broken links don't show a blank screen
- [ ] Proper 500 page — so server errors show a helpful message
- [ ] Favicon — so your browser tab has an icon, not a blank square
- [ ] Meta tags (title, description, OG image) — so links look good when shared
- [ ] Loading states — so users know something is happening
```

---

## 审查 AI 构建的东西

要测试，而不只是运行：

```
- [ ] Looks right?
- [ ] Happy path works?
- [ ] Edge cases work?
- [ ] Works on mobile?
- [ ] Error messages clear?
```

---

## 给出反馈

**差：**“这个不好使”
**好：**“点击‘保存’没有任何反应。预期：出现‘已保存！’的提示”

**模板：**
```
What I tried: [action]
Expected: [outcome]
Got: [what happened]
```

---

## 迭代预期

**正常情况：**每个功能 2-4 轮
**第一次构建：**AI 按规格说明构建，你发现 3-5 个问题
**第二次构建：**修掉这些问题，你又发现 1-2 个
**第三次构建：**最终打磨

**满足以下条件就停止：**
- 主流程能正常使用
- 边界情况已处理
- 移动端可用
- 没有明显 bug

**不要为了以下原因而迭代：**
- 追求完美
- 规格说明之外的功能
- 过早优化

---

## 常见错误

| 错误 | 解决办法 |
|---------|-----|
| 没有规格说明 | 先使用 scope 技能 |
| “构建一个仪表盘” | 明确说出上面要有什么 |
| 跳过边界情况测试 | 想办法把它弄坏试试 |
| 不审查就直接接受 | 始终要测试 |
| 构建中途加功能 | 先完成当前功能 |
| 自己动手改代码 | 描述问题，让 AI 修 |

---

## 合理划定工作规模

**太大：**“构建整个应用”
**太小：**“加一个按钮”
**刚好：**“构建用户认证流程”（1-3 小时）

**合适的任务块：**
- 用户登录/注册流程
- 展示 4 个指标的仪表盘
- 包含个人资料编辑的设置页

---

## 遇到卡点时

**AI 总是弄坏东西：**
→ 拆成更小的任务块，开启全新会话

**搞不定复杂功能：**
→ 问：“最简单的做法是什么？”接受更简单的方案

**每修一处就弄坏另一处：**
→ 停下来。问：“有没有更好的思路？”考虑推倒重来

---

## 在现有代码上开发

```
Add [feature] to existing project.

Stack: [React, Next.js, etc]
Patterns: Check src/components for examples
Style: Tailwind + custom design system
Follow existing code style
```

---

## 提示词模式

**引用现有内容：**
```
Build Settings page.
Reference Dashboard page layout.
Use same Card/Button components.
```

**提供示例：**
```
Pricing page with 3 tiers.
Like Linear's pricing - clean, minimal.
```

**明确约束条件：**
```
Build profile page.
Must work offline.
Load under 2 seconds.
WCAG AA accessible.
```

更多内容见 [PROMPTS.md](PROMPTS.md)。

---

## 面向非技术创始人的审查

**要检查：**
- 是否符合规格说明？
- 按钮都能用？
- 表单校验正常？
- 外观与设计参考一致？
- 移动端可用？
- 错误信息清晰？

**不必检查：**
- 代码整洁度
- 优化程度
- “最佳实践”

代码质量交给 AI。需求由你把关。

---

## 成功是什么样子

✅ 功能符合规格说明
✅ 2-4 轮迭代（而不是 10 多轮）
✅ 能说清楚问题出在哪
✅ 每周构建速度都在变快
