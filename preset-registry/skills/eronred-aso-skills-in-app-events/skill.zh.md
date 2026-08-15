---
name: in-app-events
description: When the user wants to create, plan, or optimize App Store In-App Events — the event cards that appear on the Today tab, search results, and your product page. Use when the user mentions "in-app event", "App Store event", "event card", "Today tab", "live event", "challenge", "game event", "seasonal event card", or wants visibility beyond organic search. For general ASO, see aso-audit. For seasonal keyword strategy, see seasonal-aso.
metadata:
  version: 1.0.0
---
# App 内活动

你帮助用户规划、撰写和优化 **App Store App 内活动**——这些活动卡片会展示在搜索结果、Today 标签页和产品页面中，无需付费媒体投放即可推动安装和用户回流。

## 什么是 App 内活动

App 内活动是 App Store 上具有时效性的内容卡片。它们会显示在：
- **Today 标签页**（编辑推荐 + 算法推荐）
- **搜索结果**（与 App 搜索结果一起显示）
- **你的产品页面**
- **个性化推荐**（面向流失用户）

**核心优势：** 最近没有打开你的 App 的现有用户会收到活动通知。尚未安装的用户则可以通过活动发现你的 App。

## 活动类型

| 类型 | 最适合 | 示例 |
|------|----------|---------|
| **挑战** | 用户参与的竞赛 | “30 天连续打卡挑战” |
| **竞赛** | 具有排名或计分机制的比赛 | “每周最高分排行榜” |
| **直播活动** | 实时活动 | “与专家实时问答” |
| **重大更新** | 重要的新功能 | “隆重推出 AI 教练” |
| **首发** | 内容首次发布 | “全新系列：晨间习惯” |
| **特别活动** | 季节性或主题性时刻 | “节日系列已解锁” |

## 活动卡片规格

| 字段 | 限制 | 备注 |
|-------|-------|-------|
| **活动名称** | 30 个字符 | 突出显示——需考虑关键词 |
| **简短描述** | 50 个字符 | 显示在卡片名称下方 |
| **详细描述** | 120 个字符 | 显示在展开后的活动视图中 |
| **活动卡片图片** | 2160×1080px | 2:1 比例，PNG/JPG，无需添加文字 |
| **标记** | — | 从上述 6 种类型标记中选择 |
| **持续时间** | 最长 31 天 | 必须设置开始和结束时间 |

同一时间最多可以有 **10 个活动**处于已上线或已安排状态。

## 规划工作流程

### 第 1 步——选择活动创意

1. 检查是否存在 `app-marketing-context.md`
2. 根据 App 类别评估活动类型：

| App 类型 | 最合适的活动类型 |
|----------|----------------|
| 游戏 | 挑战、竞赛、重大更新 |
| 健身 | 挑战、直播活动、重大更新 |
| 效率工具 | 重大更新、首发 |
| 社交 / 社区 | 直播活动、挑战 |
| 流媒体 / 内容 | 首发、特别活动 |
| 实用工具 | 重大更新、特别活动 |

3. 确定主要目标：
   - **召回用户** → 使用会触发通知的活动（任意类型）
   - **获取新用户** → 重点争取 Today 标签页曝光（挑战或竞赛）
   - **发布功能** → 使用重大更新类型

### 第 2 步——撰写活动文案

**活动名称（30 个字符）——规则：**
- 首先突出用户收益或行动，而不是你的 App 名称
- 在自然的情况下加入相关关键词
- ✅ “30 天习惯养成挑战” | ❌ “AppName 2026 挑战”

**简短描述（50 个字符）：**
- 用一句话回答“这对我有什么好处？”
- ✅ “坚持打卡，赢取专属奖励”

**详细描述（120 个字符）：**
- 扩展简短描述：说明活动内容、时间以及参加理由
- ✅ “加入我们的 30 天挑战。每天完成习惯任务、坚持连续打卡，并解锁你的成就徽章。”

### 第 3 步——活动卡片图片

规格：2160×1080px，2:1 比例

**最佳实践：**
- 无需添加文字（名称/描述会以叠加层形式显示）——但可以使用简短的标语
- 使用高对比度、醒目的视觉设计，确保在较小的缩略图尺寸下也能清晰呈现
- 展示成果或奖励，而不只是应用 UI
- 以 390×195px 的尺寸测试缩略图，确认其可读性

### 第 4 步——在 App Store Connect 中提交

1. App Store Connect → 你的应用 → App 内活动 → `+`
2. 填写所有必填字段并上传图片
3. 提交审核（通常需要 24–48 小时）
4. 设置开始/结束时间

请在期望的开始日期前 **3–5 天提交**，以预留审核时间。

## 优化技巧

### 最大限度提高在 Today 标签页展示的机会

Apple 的算法更青睐具备以下特点的活动：
- **时效性强**——与现实世界中的重要时点相关（节日、趋势、应用周年纪念）
- **质量高**——图片精美、描述完整
- **吸引用户参与**——能够带来会话的活动类型（挑战 > 更新）
- **持续稳定**——定期举办活动的应用更容易持续获得展示机会

**每月至少举办一次活动**，以保持获得算法推荐的资格。

### 搜索中的关键词可见性

活动名称和简短描述会被 **App Store 搜索算法编入索引**。

- 在活动名称中自然地加入 1–2 个目标关键词
- 简短描述可进一步强化次要关键词
- 使用 `keyword-research` skill 验证应包含哪些词语

### 用户召回通知

已下载你的应用但最近未打开的用户，会自动收到你的活动推送通知——无需用户选择接收。这是 App 内活动最具价值的功能。

**将活动名称作为通知主题行**——确保它作为一条独立消息也足够吸引人。

## 输出格式

### 活动简报

```
📅 Event: [Name — 30 chars]
   Type:  [Badge type]
   Dates: [Start] → [End]

Copy:
  Short:  [50 chars]
  Long:   [120 chars]

Image direction:
  Visual: [describe the scene/concept]
  Style:  [photography / illustration / abstract]
  Key element: [the reward, the action, the outcome]

Goals:
  Primary: [re-engagement / acquisition / feature launch]
  KPIs: [sessions spike, downloads, event page views]

Submit by: [date — 4 days before start]
```

### 活动日历（按月）

```
Week 1:  [Event name] — [type] — [dates]
Week 2:  [No event / buffer]
Week 3:  [Event name] — [type] — [dates]
Week 4:  [Event name] — [type] — [dates]
```

## 常见错误

| 错误 | 修正方式 |
|---------|-----|
| 活动名称中包含应用名称 | 以用户收益开头 |
| 图片过于普通（UI 截图） | 通过视觉方式展示奖励/成果 |
| 活动持续时间少于 7 天 | 若要获得 Today 标签页展示机会，活动至少持续 7 天 |
| 活动当天才提交 | 提前 4–5 天提交以供审核 |
| 没有周期性安排 | 每月举办 1 次以上活动，以持续获得展示机会 |

## 相关 Skill

- `seasonal-aso`——使活动时间与关键词的季节性高峰保持一致
- `screenshot-optimization`——将相同的视觉最佳实践应用于活动图片
- `app-store-featured`——活动可以提高获得编辑推荐的资格
- `retention-optimization`——跟踪活动带来的用户召回提升幅度