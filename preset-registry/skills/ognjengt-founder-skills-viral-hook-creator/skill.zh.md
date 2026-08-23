---
name: viral-hook-creator
description: Creates viral social media hooks using proven psychological patterns and trigger words. Use when user needs attention-grabbing openings for posts, threads, videos, or content.
---
# 病毒式钩子创作器

## 目的
使用经过验证的心理学模式生成 3-5 个病毒式钩子选项，以激发好奇心、提供价值并推动互动。钩子针对社交平台（X/Twitter、LinkedIn、Instagram、TikTok）进行了优化。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"viral-hook-creator 已加载，请继续提供其他说明"

然后等待用户在下一条消息中提供需求。

### 如果 $ARGUMENTS 包含内容：
立即继续执行任务（跳过“已加载”消息）。

---

## 任务执行

当用户需求可用时（来自初始 $ARGUMENTS 或后续消息）：

### 1. 强制要求：首先读取参考文件
**阻塞性要求——不得跳过此步骤**

在执行任何其他操作之前，你必须使用 Read 工具读取以下两个参考文件。此要求不可协商：

```
Read: ./references/hook-patterns.md
Read: ./references/trigger_words.md
```

**你将在其中找到：**
- **hook-patterns.md**：18 种经过验证的钩子模式，包括模板、心理学原理说明和模式选择矩阵
- **trigger_words.md**：四类病毒式触发词（内幕型、帮助型、思辨型、强化词）

在读取这两个文件并将其中的模式和触发词加载到上下文之前，**不得继续**执行第 2 步。

### 2. 检查业务背景（可选）
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：**读取该文件，并使用其中的业务背景对输出进行个性化处理（行业术语、受众痛点、品牌语调、权威性指标）。
- **如果不存在：**使用“默认值与假设”部分中的默认设置继续执行。

### 3. 分析输入
从用户需求中提取：
- 内容主题
- 目标平台（X、LinkedIn、Instagram、TikTok、通用）
- 目标（认知、教育、互动、转化）
- 目标受众的人口统计特征和心理特征
- 可用的社会证明（统计数据、成就、研究）

对于任何缺失的信息，应用**“默认值与假设”**部分中的默认设置。

### 4. 生成病毒式钩子
使用你在第 1 步中读取的模式和触发词创建钩子：

1. 使用模式选择矩阵从 hook-patterns.md 中**选择模式**（匹配用户的目标和平台）
2. 以模式模板为起点，**起草每个钩子**
3. 在撰写每个钩子时，将 trigger_words.md 中的 **1-2 个触发词融入其中**：
   - **内幕型词语**（secretly、revealed、hidden、uncovered 等）→ 独家性模式
   - **帮助型词语**（losing、wasting、bleeding、stealing 等）→ 问题/紧迫性模式
   - **思辨型词语**（backwards、myth、counterintuitive、paradox 等）→ 反常识模式
   - **强化词**（literally、every、zero、completely 等）→ 可用于任何模式以增强表达强度

4. **遵循所有写作规则**（核心规则、特定模式规则、特定平台适配）
5. **确保差异化**——每个钩子必须使用独特的模式
6. **验证自然融合度**——触发词应增强效果，而非造成干扰

### 5. 格式化并验证
- 按照 **Output Format** 部分组织输出
- 完成 **Quality Checklist** 自我验证
- 验证每个钩子都包含参考文件中的触发词

---

## 写作规则
硬性约束。不得自行解读。

### 核心规则
- X/Twitter 钩子最多 120 个字符。
- 视频钩子最多 1-2 行（40-60 个字符）。
- 以最有趣的元素开头。
- 制造好奇缺口（承诺价值，但保留细节）。
- 尽可能使用具体数字（不要用“很多”，而要用“17”）。
- 避免使用无法兑现的标题党内容。
- 使用强力词：steal、secret、mistake、never、proven、blueprint。
- 除非是平台特定用法，否则不要使用表情符号（Instagram/TikTok 可以使用，LinkedIn/X 避免使用）。
- 不要使用空话或赘词。
- 只使用主动语态。
- 优先使用现在时。

### 特定模式规则
- 权威型钩子：以可信指标开头。
- 清单型钩子：使用奇数（7 > 6，5 > 4）。
- 故事型钩子：以意外结果开头。
- 数据型钩子：以令人惊讶的统计数据开头。
- 警示型钩子：以错误/教训开头。

### 特定平台适配
- **X/Twitter**：有冲击力、反常识、数据驱动，最多 120 个字符。
- **LinkedIn**：专业、成就导向、体现思想领导力，首行 40-60 个字符。
- **Instagram**：提供视觉化承诺、生活方式导向、具有理想感，在“更多”截断前最多 125 个字符。
- **TikTok**：快节奏、有共鸣、紧跟趋势，屏幕文字 20-30 个字符。
- **通用**：用途广泛，不针对特定平台。

---

## 输出格式
简洁明了。只输出钩子，并以对应的模式类型作为标题。

```markdown
### [Pattern Name]
[Hook text]

### [Pattern Name]
[Hook text]

### [Pattern Name]
[Hook text]
```

**示例：**
```markdown
### Authority Credibility
I run a 23-person software agency. Here are 5 things I would never do again.

### Data-Driven Insight
I analyzed 1,000 LinkedIn posts. Here are the top 5 patterns that drove engagement.

### Contrarian
Everyone tells you to post daily. I posted 3x per week and got 10x more engagement.
```

---

## 默认值与假设

除非被覆盖，否则使用以下设置。

- 钩子数量：3
- 平台：X/Twitter（字符限制最严格）。
- 目标：最大限度提高互动量（点赞、评论、分享）。
- 受众：一般商业/创业受众。
- 语气：专业但自然亲切（符合大多数创始人的风格）。
- 情绪：好奇心（病毒式传播内容最稳妥的默认选择）。
- 格式：主题帖/帖子的开头（不是视频钩子）。

---

## 参考资料

**生成任何钩子之前，必须使用 Read 工具读取这些文件（参见任务执行的步骤 1）：**

| 文件 | 用途 |
|------|---------|
| `./references/hook-patterns.md` | 18 种经过验证的钩子模式，包含模板、心理机制和模式选择矩阵 |
| `./references/trigger_words.md` | 病毒式传播触发词类别（Insider、Helper、Thinker、Amplifiers） |

**两者都很重要的原因：**钩子模式提供心理结构。触发词放大情绪影响。只有模式 = 好钩子。模式 + 触发词 = 病毒式传播钩子（互动量约提升 10 倍）。

---

## 质量检查清单（自我验证）

在最终确定之前，请验证以下所有事项：

### 生成前检查
- [ ] 我在生成钩子之前已阅读 `./references/hook-patterns.md`
- [ ] 我在生成钩子之前已阅读 `./references/trigger_words.md`
- [ ] 我已将 18 种模式和 4 类触发词纳入上下文

### 模式与结构验证
- [ ] 每个钩子都使用了 hook-patterns.md 中经过验证的模式（而非自行编造的模式）
- [ ] 每个钩子都使用不同的模式（不得重复）
- [ ] 模式模板已根据用户上下文进行调整
- [ ] 钩子能激发真正的好奇心，同时不会产生误导

### 触发词整合验证
- [ ] 每个钩子都包含 1-2 个来自我所读取文件的触发词
- [ ] 触发词与模式类型适当匹配
- [ ] 触发词的融入自然（不生硬）
- [ ] 触发词增强了情感冲击力

### 写作规则合规性
- [ ] 符合平台的字符数限制
- [ ] 使用具体数字（而非“许多”或“一些”）
- [ ] 全文使用主动语态
- [ ] 无冗余内容或滥用的短语

### 最终检查
如果任何钩子缺少参考文件中的触发词，或使用了并非来自 hook-patterns.md 的模式 → 请在展示前修改。

---