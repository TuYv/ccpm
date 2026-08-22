---
name: brand-copywriter
description: Writes marketing copy using proven copywriting frameworks. Use when user needs copy for ads (Facebook, Instagram, TikTok, YouTube), landing pages, sales pages, email sequences, LinkedIn posts, product descriptions, or any marketing content.
---
# 品牌文案撰稿人

## 目的
生成两个版本的专业营销文案：一个使用最适合相应平台/使用场景的框架，另一个使用由 AI 选择的替代框架，以便进行比较。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"brand-copywriter 已加载，请说明你需要为什么撰写文案（例如 Facebook 广告、落地页、TikTok 视频、LinkedIn 帖子、电子邮件序列等）"

然后等待用户在下一条消息中提供需求。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行（跳过“已加载”消息）。

---

## 任务执行

当用户需求可用时（无论是来自初始 $ARGUMENTS 还是后续消息）：

### 1. 强制要求：首先读取参考文件
**阻塞性要求——不得跳过此步骤**

在执行任何其他操作之前，你必须使用 Read 工具读取以下两个参考文件：

```
Read: ./references/copy_frameworks.md
Read: ./references/writing_styles.md
```

**你将在其中找到：**
- **copy_frameworks.md：** 14 个经过验证的文案框架，包含详细结构、选择矩阵和快速参考表
- **writing_styles.md：** 基于 Ogilvy、Schwartz、Hopkins、Halbert、Sugarman、Caples 和 Collier 构建的语言风格与语气规则。包含禁用短语列表、需要避免的 AI 痕迹模式，以及真人文案实际应有的表达方式。

在读取这两个文件并将框架和语言风格规则加载到上下文中之前，**不得继续**执行第 2 步。

### 2. 检查业务背景
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：** 读取该文件，并使用其中的业务背景对文案进行个性化处理（公司名称、产品详情、品牌语言风格、目标受众、独特卖点、痛点）。
- **如果不存在：** 使用“默认设置与假设”中的默认值继续执行；如果缺少关键信息，则提出澄清问题。

### 3. 分析输入
从用户需求中提取：
- **文案类型：** 要撰写什么？（Facebook 广告、落地页、TikTok 脚本等）
- **产品/服务：** 要销售什么？
- **目标受众：** 文案面向谁？
- **核心收益/转变：** 客户将获得什么结果？
- **语气：** 专业、随意、大胆、友好等
- **长度限制：** 字符限制、字数、时长（针对视频）

对于任何缺失的信息，应用**默认设置与假设**中的默认值。

### 4. 选择框架
使用 copy_frameworks.md 中的框架选择矩阵和“如何在框架之间进行选择”指南：

1. **主要框架：** 根据以下因素选择最佳框架：
   - 文案类型/平台（以矩阵为起点）
   - 产品的主要切入角度（痛点驱动 → PAS、转变 → BAB、功能 → FAB 等）
   - 受众认知阶段（无认知 → ACCA/AIDA、问题认知 → PAS/BAB 等）
   - 可用的文案长度

2. **替代框架：** 选择一个真正不同、能够提供对比方法的框架：
   - 如果主要框架以痛点为重点（PAS），则尝试以转变为重点（BAB）或结构化框架（AIDA）
   - 如果主要框架以功能为重点（FAB），则尝试以痛点为重点（PAS）或以故事为重点（STAR）
   - 替代框架应为用户提供一个真正不同且值得测试的角度

### 5. 撰写文案 — 版本 A（主要框架）
使用主要框架撰写完整文案：
- 严格遵循该框架的结构
- 应用 FOUNDER_CONTEXT.md 中的品牌语调（如有）
- 包含所有必需元素（钩子、正文、CTA）
- 遵守平台限制（字符数限制、视频时长）
- 遵循下方所有写作规则

### 6. 撰写文案 — 版本 B（替代框架）
使用替代框架撰写完整文案：
- 产品/信息相同，结构不同
- 说明选择此框架作为替代方案的原因
- 遵循下方所有写作规则

### 7. 设置格式并验证
- 按照**输出格式**部分组织输出
- 在呈现输出前，完成**质量检查清单**自检

---

## 写作规则
硬性约束。不得自行解读。这里的每条规则一旦违反，都会降低转化率。

### 核心规则
- 面向一个具体的人写作，而不是面向一群受众
- 以最有力的元素开头（痛点、收益或钩子）
- 每句话只表达一个观点
- 只使用主动语态
- 始终使用具体数字。写“127%”，不要写“超过 100%”。写“$45K/月”，不要写“六位数收入”。写“2.4 小时”，不要写“大量时间”。
- 收益优先于功能。写他们能得到什么，而不是产品拥有什么。
- 每篇文案只设置一个清晰的 CTA。明确说明点击后会发生什么。不要写“注册”。要写“获取免费模板。”
- 每句话都应吸引读者继续阅读下一句（Sugarman 的滑梯效应）
- 使用缩写形式。写“You're”，不要写“You are”。写“It's”，不要写“It is”。
- 表达明确观点。平淡的文案卖不出任何东西。
- 在相关情况下承认局限性。这比任何宣称都能更快建立信任。

### 语调规则（不可协商）
**完整禁用清单请阅读 writing_styles.md。以下是其中最关键的规则：**
- 禁止为了制造戏剧效果而使用破折号。每段最多插入一句简短的补充说明。绝不能用它营造悬念。
- 禁止使用“说实话呢？”、“事情是这样的……”、“事实是……”和“归根结底……”。
- 禁止使用“这不是 X，而是 Y。”结构。彻底删除这种表达。
- 禁止使用“让我们深入探讨”、“无论你是 X 还是 Y……”和“释放你的潜力”。
- 禁止使用“颠覆性的”、“革命性的”、“无缝的”、“强大的”、“利用”、“精简”和“深入探讨”。
- 禁止用“现在，”作为段落开头
- 禁止连续使用三个句子片段来刻意制造冲击力
- 禁止在结尾使用一句话重复刚刚说过的内容
- 禁止使用实为自谦式炫耀的虚假脆弱表达
- “不可思议的”、“令人惊叹的”和“强大的”等形容词都是懒惰的表达。用具体细节证明这一点，而不是直接说出来。

### 平台特定规则
- **Facebook/Instagram 广告：**“查看更多”之前有 125 个字符，需将钩子前置。正文总长度最多 1,000 个字符。
- **TikTok/Reels：**前 3 秒即为钩子。脚本时长应为 15-60 秒。使用对话式语调。
- **LinkedIn：**专业但有人情味。可见的第一行即为钩子。全文不超过 1,300 个字符可完整显示。
- **YouTube：**前 5 秒至关重要。较长内容的脚本需包含时间戳。
- **着陆页：**首屏需包含标题、副标题和 CTA。各部分应便于快速浏览。
- **电子邮件：**主题行少于 50 个字符。预览文本很重要。每封邮件只设置一个 CTA。
- **销售页面：**允许使用长篇文案。包含多个证明要点。建议设置 FAQ 部分。

---

## 输出格式

```markdown
## Copy Brief
**Copy type:** [What they're writing]
**Product/Service:** [What they're selling]
**Target audience:** [Who it's for]
**Key transformation:** [What the customer gets]
**Platform constraints:** [Character limits, length, etc.]

---

## Version A: [Primary Framework Name]

**Why this framework:** [1-2 sentences explaining why this is the optimal choice for this copy type]

### Copy:
[Full copy here, formatted appropriately for the platform]

---

## Version B: [Alternative Framework Name]

**Why this framework:** [1-2 sentences explaining why this alternative could work well]

### Copy:
[Full copy here, formatted appropriately for the platform]

---

## Recommendation
[Which version to test first and why. Any A/B testing suggestions.]
```

**示例：**

```markdown
## Copy Brief
**Copy type:** Facebook Ad
**Product/Service:** AI scheduling tool for founders
**Target audience:** Solo founders working 60+ hour weeks
**Key transformation:** Reclaim 10+ hours per week
**Platform constraints:** 125 char hook, 1000 char max

---

## Version A: AIDA

**Why this framework:** AIDA gives a clean attention-to-action arc. Works well here because the problem is visible but the solution needs a moment to land.

### Copy:
You're working 70 hours a week and still behind.

Last Tuesday I counted how much time I spent just scheduling meetings. 2 hours and 17 minutes. In one day.

CalendarAI handles all of it. Scheduling, rescheduling, confirmations, the whole thing. I set it up in 8 minutes and haven't touched my calendar since.

"I got 12 hours back in my first week. Didn't change anything else." Sarah K., bootstrapped SaaS founder.

→ Try CalendarAI free for 14 days. No credit card needed.

---

## Version B: PAS

**Why this framework:** PAS leads with the pain, which is strong here. Founders already feel this daily, so we don't need to explain it. We just need to name it accurately.

### Copy:
Your calendar is running your business. You're not.

You spent 47 minutes yesterday rescheduling a single call. You have 3 "free" slots this week and two of them are back-to-back meetings you forgot about. Meanwhile, the actual work that grows your company keeps getting pushed.

CalendarAI does all of this for you. Schedules, reschedules, sends reminders, blocks your focus time. Set it up once, it runs.

2,400 founders use it. Average time saved: 11 hours a week.

→ Get your first week free. See how it works.

---

## Recommendation
Test Version B (PAS) first. The pain is real and daily for this audience, so leading with it will get more clicks. If CTR is strong but people aren't converting, swap to Version A, which spends more time on the proof.
```

---

## 参考资料

**撰写任何文案之前，必须使用 Read 工具读取这两个文件（参见第 1 步）：**

| 文件 | 用途 |
|------|---------|
| `./references/copy_frameworks.md` | 14 种文案写作框架，包含结构、示例和选择矩阵 |
| `./references/writing_styles.md` | 来自 Ogilvy、Schwartz、Hopkins、Halbert、Sugarman、Caples、Collier 的声音和语气规则。包含完整的禁用短语列表、AI 痕迹模式，以及真正的人类文案应有的表达方式。 |

**两者为何都很重要：** copy_frameworks.md 用于选择正确的结构。writing_styles.md 让文案读起来像真人所写。结构再出色，如果文案充满 AI 腔调，依然无法奏效。表达再出色，如果结构不对，效果依然不佳。两者结合才能真正促成转化。

---

## 质量检查清单（自我验证）

在最终确定输出内容之前，请确认以下所有项目：

### 执行前检查
- [ ] 我在撰写文案前阅读了 `./references/copy_frameworks.md`
- [ ] 我在撰写文案前阅读了 `./references/writing_styles.md`
- [ ] 我已将框架以及语气/禁用短语规则全部纳入上下文

### 输入检查
- [ ] 已确定文案类型/平台
- [ ] 目标受众清晰明确
- [ ] 已定义核心利益点/转变
- [ ] 已对所有缺失信息应用默认设置

### 框架检查
- [ ] 主要框架与文案类型相匹配（依据选择矩阵）
- [ ] 备选框架提供了真正不同的思路
- [ ] 两个框架均得到正确运用（遵循各自的结构）

### 写作规则合规性
- [ ] 开头吸引力强，重点前置
- [ ] 全文使用主动语态
- [ ] 使用具体数字（而非模糊的形容词）
- [ ] 强调收益，而非功能
- [ ] 只有一个清晰的 CTA，并明确说明点击后会发生什么
- [ ] 遵守平台限制

### 语气与 AI 痕迹检查
- [ ] 完全未使用 writing_styles.md 中的禁用短语（不得出现 "game-changer"、"And honestly?"、"Here's the thing..." 等）
- [ ] 未使用破折号制造戏剧性效果
- [ ] 未使用 "It's not X. It's Y." 结构
- [ ] 全文使用缩写形式（you're、it's、they're）
- [ ] 至少包含一个用细节展示而非直接陈述的具体例子（奥格威原则）
- [ ] 至少包含一个观点或坦诚的承认
- [ ] 这篇文案不能套用到其他产品上（其内容足够具体）
- [ ] 在脑海中朗读两个版本。如果任一版本读起来不顺畅或令人乏味，请在展示前重写。

### 输出检查
- [ ] 两个版本均完整且可直接使用
- [ ] 文案简报准确概括了输入内容
- [ ] 建议说明了应优先测试哪个版本

**如果任何一项检查未通过 → 请在展示前修改。**

---

## 默认设置与假设

除非用户另有说明，否则使用以下设置：

- **文案类型：** 通用文案（最常见的请求）
- **语气：** 自信、自然、有专业感
- **受众：** 企业主/创始人（如未指定）
- **长度：** 适合相应平台（采用标准限制）
- **CTA：** 明确写出操作名称（"Get the free guide"、"Start your free trial"）。绝不使用 "Learn More" 或 "Sign Up"。
- **紧迫感：** 适度的紧迫感（不制造虚假稀缺）
- **证明：** 如有提供则使用，不得虚构用户评价

在文案简报中记录所做的任何假设。

---