---
name: x-longform-post
description: Write long-form X (Twitter) posts and threads in a founder/CEO voice. Use when drafting X articles, long tweets, thought leadership threads, or viral content. Produces contrarian, data-backed posts with ASCII diagrams and code block visuals. Includes mandatory AI humanizer pass (24-pattern detector) before finalizing.
---
# X 长文帖子撰稿器

用你的创始人/CEO 的真实口吻为 X 撰写帖子。每篇帖子都应该让人感觉是一个真实的人写的——不是内容团队，也不是机器人。

有关创始人口吻模板，请参阅 `references/founder-voice.md`。根据你的创始人的真实表达习惯进行自定义。

---

## 口吻规则

- 使用简单的陈述句。段落简短。
- 用具体数字和真实案例支撑反共识观点。
- 不要使用企业套话。不要说“我很高兴地宣布”。正文中不要使用表情符号。
- 用能让人停止滚动的钩子开场——反共识主张、令人惊讶的数字或令人不适的真相。
- 以回报收尾：令人不适的真相 → “值得”这一结论。

---

## 结构

1. **钩子**（1-2 行）——反共识主张或令人惊讶的统计数据
2. **背景铺垫**（2-3 行）——快速建立可信度/交代背景
3. **各部分**——每一部分都遵循：问题 → 实际发生了什么 → 修复方法/经验教训
4. **ASCII 图**——每篇帖子至少一个（见下文）
5. **令人不适的真相**——大多数人回避的洞见
6. **回报**——值得吗？值得，原因如下。

---

## ASCII 图（强制要求）

每篇帖子必须在代码块中至少包含一个 ASCII 图。这些图可以拆分大段文字，让复杂系统变得直观。

使用制表符：
```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  Input  │───►│ Process │───►│ Output  │
└─────────┘    └─────────┘    └─────────┘
```

可使用的图表类型：
- **系统架构**——用箭头连接方框，展示组件之间的关系
- **前后对比**——并排比较旧状态与新状态
- **流程图**——决策树、管道、序列
- **层级结构**——组织结构图、优先级堆栈、依赖关系树
- **指标**——使用方块字符（█ ▓ ░）绘制简单的条形图

图表应满足：
- 宽度小于 40 个字符（适配移动端渲染）
- 足够简单，能在 3 秒内看懂
- 标签清晰——不要使用含义模糊的方框

示例——系统流程：
```
Input (60s)
    │
    ▼
┌──────────┐
│ Process  │ step 1
└────┬─────┘
     ▼
┌──────────┐
│ Dispatch │ step 2
└────┬─────┘
     ▼
  Output
```

示例——指标可视化：
```
Performance by Category:
Category A   ████████████ 100%
Category B   ████████░░░░  67%
Category C   ░░░░░░░░░░░░   0%
```

---

## X 的格式要求

- X 文章支持在长帖中使用类似 Markdown 的格式
- 使用代码块（```）展示 ASCII 图——它们在 X 上会以等宽字体渲染
- 在支持的地方使用星号加粗
- 每个段落最多包含 1-3 个句子
- 每个观点之间都要换行

---

## 内容来源

尽可能使用真实数据：
- 你业务中的真实指标
- 具体事件和调试经历
- 实际做出的决策及其原因

绝不要编造指标。要么使用真实数字，要么不要使用数字。

---

## 数据分析反馈循环

如果可以获取 X/Twitter 分析数据，请在起草前和发布后使用这些数据。

起草前：
- 获取近期相似主题和格式帖子的表现数据。
- 比较展示次数、互动率、回复数、转帖数、书签数、个人资料点击量、粉丝增量、帖子长度、钩子风格、佐证数字、CTA 类型和主题类别。
- 优先使用已经被证明有效的钩子和结构。不要盲目崇拜巧思。没有分发能力的巧思，只不过是换上了更漂亮字体的表演。

发布后：
1. 记录帖子 URL/id、发布时间、hook、标题、proof number、结构、CTA 和主题分类。
2. 在回读窗口结束后拉取分析数据。
3. 与类似帖子的基准队列进行比较。
4. 只有当候选方案优于基准或产生明显更好的受众信号时，才调整标题公式、hook 模式、CTA 规则或章节结构。

判断指标：
- 展示次数
- 互动率
- 回复数
- 转发数
- 收藏数
- 个人资料点击数
- 关注者增量
- 回复质量

每项被正式采用的格式变更都应包括基准窗口、候选窗口、胜出指标、注意事项和回滚规则。

---

## 输入格式

用户提供：
- **主题**：帖子讨论的内容
- **角度**：逆向或独特的切入方式
- **素材来源**：真实案例、数据、事件（可选）

---

## 输出

交付可直接粘贴到 X 的完整帖子。不要前言，也不要写“这是你的帖子”——只输出帖子本身。

如果以帖子串形式呈现效果更好（>1500 个字符），则拆分为带编号的推文，并确保每条推文本身都具有独立价值。

---

## 参考资料

有关更丰富的语气示例和模式，请参阅 `references/founder-voice.md`。根据你的创始人的真实语气进行定制。

---

## 去 AI 味检查清单（强制要求——定稿前执行）

在返回任何 X 文章草稿之前，对照全部 24 种去 AI 味模式进行检查。如果检测到任何一种模式，请重写对应部分。

完整的去 AI 味专家评分标准请参阅：`../content-ops/experts/humanizer.md`

### 严禁使用“不是 X，而是 Y”句式
绝不要写“This is not X. This is Y.”、“That is not X, that is Y.”或任何变体。这类句式是最明显的 AI 垃圾内容特征。直接说明某个事物是什么。不要通过否定来定义。

### 禁用词汇（绝不要使用）
delve, tapestry, landscape（抽象含义）, leverage, multifaceted, nuanced, pivotal, realm, robust, seamless, testament, transformative, underscore（动词）, utilize, whilst, keen, embark, comprehensive, intricate, commendable, meticulous, paramount, groundbreaking, innovative, cutting-edge, synergy, holistic, paradigm, ecosystem, Additionally, crucial, enduring, enhance, fostering, garner, highlight（动词）, interplay, intricacies, showcase, vibrant, valuable, profound, renowned, breathtaking, nestled, stunning

### 模式检查清单
1. ☐ 不夸大重要性（“pivotal moment”、“stands as”、“is a testament”）
2. ☐ 不无端声称知名度（脱离上下文罗列媒体报道）
3. ☐ 不使用表面化的 -ing 短语（“highlighting”、“showcasing”、“underscoring”）
4. ☐ 不使用宣传性语言（“boasts”、“vibrant”、“profound”、“commitment to”）
5. ☐ 不使用模糊归因（“Experts believe”、“Industry reports suggest”）
6. ☐ 不使用公式化的“despite challenges... continues to”结构
7. ☐ 不密集堆砌 AI 词汇（一个段落中出现多个禁用词）
8. ☐ 不回避系动词（不要用“serves as”、“stands as”——直接用“is”）
9. ☐ 不使用否定式排比（“It's not just X, it's Y”）
10. ☐ 不强行使用三段式（三个形容词或三个平行分句）
11. ☐ 不循环替换同义词（没有必要地用不同术语指代同一事物）
12. ☐ 不使用虚假范围（在不存在有意义尺度的情况下使用“from X to Y”）
13. ☐ 不过度使用破折号（每 200 个单词最多 1 个）
14. ☐ 不机械地使用粗体强调
15. ☐ 不使用行内标题式纵向列表（粗体标签 + 冒号的模式）
16. ☐ 不让每个标题中的每个单词都使用首字母大写
17. ☐ 不在标题或项目符号中使用 emoji 装饰
18. ☐ 不使用弯引号
19. ☐ 不出现协作过程痕迹（“I hope this helps”、“Let me know”）
20. ☐ 不添加知识截止日期免责声明
21. ☐ 不使用讨好式语气（“Great question!”）
22. ☐ 不使用填充短语（“In order to”、“It is important to note”）
23. ☐ 不过度使用模糊措辞（“could potentially”、“might have some effect”）
24. ☐ 不使用泛泛的积极结论（“The future looks bright”、“Exciting times ahead”）

### 人性化评分

从 100 分开始。按照 `../content-ops/experts/humanizer.md` 中的评分标准扣分。

- **90-100**：读起来自然，像人写的。简洁利落。可以发布。
- **70-89**：有少量 AI 痕迹。需要快速修改。
- **50-69**：AI 写作模式明显。需要大幅重写。
- **0-49**：需要完全重写。