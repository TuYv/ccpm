---
name: linkedin-writer
description: Creates viral LinkedIn posts using proven formats, post templates, and voice matching. Use when user needs engaging, high-performing posts for LinkedIn.
---
# LinkedIn 写作助手

## 目的
使用经过实战检验、能够提升 LinkedIn 互动率的模板和模式，以符合创始人口吻的方式，采用两种不同且已得到验证的格式，生成 2 篇具有病毒式传播潜力的 LinkedIn 帖子。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"linkedin-writer 已加载，请提供你的主题或想法"

然后等待用户在下一条消息中提供需求。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行阶段（跳过 "已加载" 消息）。

---

## 任务执行

当用户需求可用时（无论来自初始 $ARGUMENTS 还是后续消息）：

### 1. 强制要求：首先读取参考文件
**阻塞性要求——不得跳过此步骤**

在执行任何其他操作之前，你必须使用 Read 工具读取所有参考文件。此要求不可协商：

```
Read: ./references/linkedin-formats.md
Read: ./references/linkedin-posts.md
```

**你将在其中找到：**
- **linkedin-formats.md**：7 种经过验证的 LinkedIn 帖子格式，包含结构模板、心理机制、规则和适用场景匹配逻辑
- **linkedin-posts.md**：按格式类型整理的 8 篇以上经过验证的病毒式 LinkedIn 帖子——示例与口吻素材库

在读取所有文件并将其内容纳入上下文之前，**不得进入**第 2 步。

### 2. 检查业务背景
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：** 读取该文件，并使用其中的业务背景对输出进行个性化处理（行业术语、受众痛点、品牌口吻、公司名称、产品、成就）。
- **如果不存在：** 使用“默认值与假设”中的默认设置继续执行。

### 3. 分析输入并自动选择格式
从用户需求中提取：
- **主题/想法**——他们想发布什么内容
- **目标**——他们希望帖子实现什么效果（互动、权威性、潜在客户、思想领导力）
- **任何特定格式偏好**——他们是否提到了某种格式类型

**格式自动选择逻辑：**

如果用户指定了格式 → 将该格式用于其中一篇帖子，并为第二篇帖子自动选择最合适的互补格式。

如果用户未指定格式，则根据主题自动选择 2 种不同的格式：

| 如果主题涉及…… | 最佳匹配格式 |
|---|---|
| 多条技巧、经验教训、错误或建议 | **经验总结** |
| 完整的流程、路线图或“如何实现 X” | **可执行蓝图** |
| 个人经历、失败、挫折或关键转折点 | **个人故事** |
| 结合证据讲解某项具体技巧、窍门或策略 | **策略拆解** |
| 分析特定公司、产品或品牌 | **案例研究** |
| 鲜明观点、行业趋势、预测或逆向观点 | **行业犀利观点** |
| 简短但影响显著的技巧或优化方法 | **快速技巧** |

**始终选择 2 种不同的格式。** 根据最契合主题的格式选择主要格式，然后选择一种互补的次要格式，从不同角度呈现同一主题。

### 4. 生成 2 篇具有病毒式传播潜力的 LinkedIn 帖子
使用你在步骤 1-3 中加载的格式和帖子：

1. **研究示例帖子**：阅读 linkedin-posts.md 中与你所选格式对应的示例帖子——内化其节奏、结构、钩子风格和篇幅
2. **提取文风 DNA**：从参考帖子中提取并匹配以下写作风格：
   - 对话感强且直接，就像在与同行交谈
   - 短段落（每段 1-3 句话）
   - 大量换行，提升可读性
   - 将专业洞见与个人风格相结合
   - 使用具体数字和数据
   - 采用第一人称视角并使用真实示例
   - 不使用企业套话
3. **如果 FOUNDER_CONTEXT.md 存在**，将创始人的品牌声音与参考帖子中的文风 DNA 融合
4. **起草每篇帖子**：遵循对应格式的结构模板、文风 DNA，以及下方的所有写作规则
5. **让每篇帖子通过互动测试：**“会有人收藏这篇帖子或发表评论吗？”如果不会 → 重写后再继续

**关键要求：**
- 每篇帖子必须使用不同的格式（不得重复）
- 每篇帖子必须匹配参考帖子的文风 DNA
- 每篇帖子必须围绕用户的具体主题展开（不能是泛泛而谈的建议）
- 每篇帖子必须遵循 linkedin-formats.md 中对应格式的结构模板
- 每篇帖子必须能够直接复制、粘贴并立即发布——不得包含占位符、[方括号] 或说明
- 每篇帖子的前 2 行必须能在 LinkedIn 的“查看更多”折叠位置上方构成有吸引力的钩子

### 5. 设置格式并验证
- 根据**输出格式**部分组织输出
- 在展示输出前，完成**质量检查清单**中的自我验证
- 如果任何帖子显得空泛、生硬，或无法通过互动测试 → 在展示前重写

---

## 写作规则
硬性约束。不得自行解读。

### 核心规则（适用于所有 LinkedIn 帖子）
- **前 2 行决定一切。** LinkedIn 会在约 210 个字符处截断内容并显示“查看更多”。你的钩子必须让人忍不住点击。让它成为整篇帖子中最有力的部分。
- 频繁换行。在 LinkedIn 上，留白 = 可读性 = 互动率。每个段落只表达一个观点。
- 只使用短段落——每段最多 1-3 句话。大段文字 = 被直接划过。
- 具体数字 > 模糊说法（使用“增长 52%”，而不是“显著增长”；使用“23 人规模的代理机构”，而不是“大型代理机构”）。
- 只使用主动语态。绝不使用被动语态。
- 优先使用现在时。
- 使用对话式语气——像在与一个人交谈，而不是向董事会汇报。
- 帖子正文中不得使用话题标签。如果确实要使用，最多 3 个，并放在末尾另起一行。
- 不得诱导互动（如“认同请点赞”“分享给需要的人”）。这会损害你在 LinkedIn 上的可信度。
- 每句话都必须有存在的价值。如果删掉一句话不会损失信息价值，就删掉它。
- 有策略且克制地使用表情符号——数字表情（1️⃣ 2️⃣ 3️⃣）、箭头（↳ →）、对勾（✅）和指示符号（👉）具有功能性。可以使用装饰性表情符号，但不要过度。
- 观点 > 泛泛的事实。LinkedIn 更青睐源自经验、鲜明且具体的观点。
- 不要使用“我认为”或“在我看来”——把观点作为从经验中得出的确定结论直接陈述。
- 以互动驱动内容结尾：直接提问、邀请分享经验或给出具体的行动号召——但必须与主题直接相关，不能泛泛而谈。

### 语气匹配规则
- 研究 linkedin-posts.md 中的参考帖子，吸收其写作基因——节奏、句子长度以及观点的铺陈方式。
- 匹配对话式、同行之间的语气。不是导师对学生。不是公司对员工。而是创始人对创始人。
- 使用相同的结构模式：简短开场 → 背景 → 价值 → 引导互动的结尾。
- 如果存在 FOUNDER_CONTEXT.md，请融入创始人特有的术语、行业语言和品牌语气。
- 帖子应该像真人在分享真实经历——绝不能像 AI 生成的内容。
- 不要直接复制参考帖子中的短语或示例。创作原创内容，同时在结构上匹配其语气。

### 特定格式规则
- **经验教训：** 以资历开场。每个编号条目都需要 2-4 行背景说明，不能只有标题。以问题结尾。
- **可执行蓝图：** 每一步都必须能够执行，并包含具体的工具/数字。以能够证明结果的数学计算结尾。
- **个人故事：** 以情绪开场。使用短句营造张力。经验教训必须让人感觉是通过故事切实获得的。以邀请读者分享结尾。
- **策略拆解：** 以令人意外的数据或结果开场。使用带箭头（↳）的编号子项。以明确的下一步结尾。
- **案例研究：** 使用真实的公司名称。以反直觉的洞察开场。通过与“常规做法”对比来呈现差异。以问题结尾。
- **行业犀利观点：** 明确站队——不要模棱两可。层层推进论点。结尾必须值得引用且令人难忘。
- **快速技巧：** 以“Quick hack”作为开场信号。展示前后对比。使用视觉标记（✅ 👉）。保持简短。推动读者立即行动。

### 互动性测试
在完成任何帖子之前，问问自己：“会有人收藏这篇帖子、留下评论，或把它发给同事吗？”如果答案是否定的——说明这篇帖子还不够好。重写。

---

## 输出格式
准确输出 2 篇帖子，并分别标注其格式：

```markdown
## Your 2 LinkedIn Posts

**Topic:** [User's topic]

---

### Post 1 — [Format Name]

[Full post text, ready to copy and paste]

---

### Post 2 — [Format Name]

[Full post text, ready to copy and paste]
```

**示例：**

```markdown
## Your 2 LinkedIn Posts

**Topic:** Why personal branding matters for SaaS founders

---

### Post 1 — Industry Hot Take

We've officially entered an era where anyone can build a SaaS overnight.

Lovable. Cursor. Replit. Bolt.

19-year-olds are going from idea to working prototype in 48 hours.

So here's the real question:

If anyone can build it, why should anyone buy YOURS?

The answer isn't your feature set. It's not your pricing.

It's you.

Your personal brand is the only unfakeable moat left.

When someone sees your product for the first time, they're not evaluating the tech.

They're evaluating the founder.

The game has changed.

It's not about who can build it.

It's about who can distribute it.

—

Trust the founder = trust the SaaS.

---

### Post 2 — Lessons Learned

I run a 23-person software development agency.

Here are 3 things that moved the needle more than any feature we ever built:

1️⃣ Building in public

↳ We started sharing our process, wins, and failures online. Within 6 months, 40% of our inbound leads mentioned our content. Trust was already built before the first call.

2️⃣ Showing up as a founder, not a company

↳ People don't follow logos. They follow people. The day I started posting as myself instead of the company brand, engagement went up 5x.

3️⃣ Owning a specific niche

↳ We stopped trying to be "the agency for everyone" and focused on Marketing, Healthcare, and Fintech. Referrals tripled because people could finally describe what we do in one sentence.

—

What's the one thing that moved the needle most in your business?
```

---

## 参考资料

**在生成任何帖子之前，必须使用 Read 工具读取这些文件（参见步骤 1）：**

| 文件 | 用途 |
|------|---------|
| `./references/linkedin-formats.md` | 7 种经过验证的 LinkedIn 帖子格式，包含结构模板、心理学原理、规则，以及适用场景匹配逻辑 |
| `./references/linkedin-posts.md` | 按格式整理的 8 篇以上经过验证的 LinkedIn 爆款帖子——示例与语气风格库 |

**为什么两者都很重要：**格式提供结构蓝图——每种格式应在何时使用、如何构建，以及需要遵循哪些规则。帖子则展示了如何用真实的语气呈现这些格式——正是其中的节奏、个性和风格，让 LinkedIn 内容显得真实自然，而不是由 AI 生成。只有格式 = 结构正确。格式 + 帖子 = 具有人类语气的爆款内容。

---

## 质量检查清单（自我验证）

在最终确定输出之前，请验证以下所有项目：

### 执行前检查
- [ ] 我在生成帖子之前阅读了 `./references/linkedin-formats.md`
- [ ] 我在生成帖子之前阅读了 `./references/linkedin-posts.md`
- [ ] 上下文中已包含所有格式定义和示例帖子

### 格式验证
- [ ] 每篇帖子使用 linkedin-formats.md 中不同的格式（不得重复）
- [ ] 每篇帖子都严格遵循其格式的结构模板
- [ ] 根据自动选择逻辑，所选格式与用户的主题相匹配
- [ ] 已遵循特定格式的规则

### 语气验证
- [ ] 两篇帖子都符合参考帖子中的语气 DNA
- [ ] 帖子听起来具有对话感且真实自然——不像 AI 生成的内容，也没有企业腔
- [ ] 融入了 FOUNDER_CONTEXT.md 中的品牌语气（如果该文件存在）
- [ ] 段落简短、频繁换行，并在全文中使用具体数字

### 内容验证
- [ ] 两篇帖子都围绕用户的具体主题展开（不是泛泛而谈的填充内容）
- [ ] 每篇帖子都包含具体细节、数字或示例（不含模糊表述）
- [ ] 每篇帖子的前 2 行都能成为引人注目的钩子，出现在“查看更多”折叠线之前
- [ ] 正文中不使用话题标签，不诱导互动，表情符号仅少量使用且具有实际作用
- [ ] 每篇帖子都可以直接复制粘贴并立即发布——不含占位符
- [ ] 帖子以与主题相关的互动驱动内容结尾（问题、CTA）

### 互动测试
- [ ] 是否会有人收藏帖子 1 或发表评论？如果不会 → 重写
- [ ] 是否会有人收藏帖子 2 或发表评论？如果不会 → 重写

**如果任意一项检查未通过 → 在展示之前修改。**

---

## 默认设置与假设

除非用户另有要求，否则使用以下设置：

- **帖子数量：**2 篇（每篇使用不同格式）
- **格式选择：**根据主题自动选择（参见步骤 3）
- **目标：**最大限度提升互动（收藏、评论、个人资料访问）
- **受众：**创始人、创业者、营销人员（除非 FOUNDER_CONTEXT 另有说明）
- **语气：**对话式、同侪交流、经验丰富（与参考帖子保持一致）
- **帖子长度：**600-1,500 个字符（最适合提升 LinkedIn 互动的长度）
- **钩子风格：**足够吸引人点击“查看更多”——前 2 行必须能够独立成立
- **主题具体性：**使用用户的确切主题——绝不偏离为泛泛的商业建议

在输出中记录所做的任何假设。