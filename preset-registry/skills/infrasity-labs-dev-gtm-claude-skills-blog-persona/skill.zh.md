---
name: blog-persona
description: >
  Create and manage writing personas with NNGroup 4-dimension tone framework
  (Funny-Serious, Formal-Casual, Respectful-Irreverent, Enthusiastic-Matter-of-fact).
  Personas define readability targets, sentence length distribution, vocabulary tier,
  contraction frequency, and summary box label. Used by blog-write and blog-rewrite
  to enforce consistent voice. Use when user says "persona", "voice", "tone",
  "writing style", "brand voice", "create persona", "use persona".
user-invokable: true
argument-hint: "[create|list|use|show] [persona-name]"
---
# 博客人格 - 写作声音管理

基于 NNGroup 四维语气框架和 CMI 品牌声音图表创建、存储并强制执行写作人格。人格可确保 blog-write 和 blog-rewrite 生成的所有博客内容保持一致的声音。

## 命令

| 命令 | 用途 |
|---------|---------|
| `/blog persona create` | 通过交互式访谈构建新人格 |
| `/blog persona list` | 显示所有已保存的人格 |
| `/blog persona use <name>` | 设置当前会话的活跃人格 |
| `/blog persona show <name>` | 显示完整的人格档案 |

## 创建流程

运行包含 6 个步骤的交互式访谈。逐步提问，等待用户回答后再继续。

### 第 1 步：品牌基础信息

询问用户以下信息：
- **品牌名称** - 公司品牌或个人品牌
- **行业** - 主要领域（例如 SaaS、医疗健康、金融、教育）
- **目标受众** - 博客读者是谁（角色、经验水平、目标）
- **一句话品牌使命** - 品牌帮助人们完成什么

### 第 2 步：语气维度（NNGroup 框架）

将每个维度展示为从 0.0 到 1.0 的滑块。通过示例解释滑块两端的含义。

| 维度 | 0.0 端 | 1.0 端 | 0.0 示例 | 1.0 示例 |
|-----------|---------|---------|-----------------|-----------------|
| funny_serious | 幽默 | 严肃 | “说实话，根本没人看服务条款” | “理解法律协议有助于保护您的企业” |
| formal_casual | 正式 | 随意 | “我们很高兴地宣布” | “猜猜怎么着——我们发布了！” |
| respectful_irreverent | 尊重 | 不拘礼俗 | “感谢您的耐心等待” | “没错，那套老办法确实不管用了” |
| enthusiastic_matter_of_fact | 热情 | 实事求是 | “这将改变一切！” | “结果如下。” |

如果用户不确定，则使用默认值：`[0.6, 0.5, 0.3, 0.5]`（略偏严肃、正式程度均衡、尊重、热情程度均衡）。

### 第 3 步：写作规则

首先让用户选择一个**词汇层级**，然后自动建议匹配的可读性区间（用户可以覆盖）。

| 设置 | 询问内容 | 默认值 |
|---------|-------------|---------|
| 词汇层级 | 大众、专业或技术 | 专业 |
| 可读性区间 | 根据层级自动填充（见下表） | 8-10 年级 |
| 平均句长 | 每句话的平均单词数 | 18 |
| 句长标准差 | 句子长度的变化程度 | 6 |
| 缩略形式使用频率 | 0.0（从不）到 1.0（总是） | 0.6 |
| 被动语态上限 | 被动结构的最高占比 | 10% |

### 第 4 步：该做与不该做的事项（CMI 品牌声音图表）

要求用户在每个列表中提供 3-5 项。根据语气维度提供起始示例。

**该做事项示例：**“使用数据支持主张”、“使用‘你’称呼读者”、“以问题或统计数据开篇”

**不该做事项示例：**“不要使用未加定义的行话”、“不要以 There is/There are 开头造句”、“不要使用 game-changer 等陈词滥调”

### 第 5 步：摘要标签偏好

博客文章中摘要/要点框使用的标签。让用户选择一个：

- 关键要点（默认）
- 最终结论
- 你将学到什么
- TL;DR
- 快速摘要
- 简而言之
- 自定义标签

### 第 6 步：语气样本（可选）

询问用户是否有 1-3 个能够体现期望语气的现有内容 URL。
将 URL 存储在 persona 中，以供日后参考。如果提供了 URL，请读取每个 URL 并提取：
- 平均句子长度
- 缩写形式使用频率
- 语气维度估计值
- 词汇级别

将提取的值与 persona 设置进行比较，并标记所有不匹配之处。

### 保存

将完成的 persona 以 JSON 格式写入：
`skills/blog/references/personas/<name>.json`

文件名使用 kebab-case（例如 `acme-saas.json`）。

## Persona 配置文件 Schema

```json
{
  "name": "acme-saas",
  "description": "Professional SaaS voice for B2B marketing content",
  "brand": "Acme Corp",
  "industry": "SaaS",
  "audience": "Marketing managers at mid-market companies",
  "mission": "Help marketing teams automate reporting",
  "tone_dimensions": {
    "funny_serious": 0.7,
    "formal_casual": 0.4,
    "respectful_irreverent": 0.2,
    "enthusiastic_matter_of_fact": 0.5
  },
  "readability": {
    "flesch_grade_min": 8,
    "flesch_grade_max": 10,
    "flesch_ease_min": 50,
    "flesch_ease_max": 60
  },
  "style": {
    "sentence_length_mean": 18,
    "sentence_length_std": 6,
    "contraction_frequency": 0.6,
    "passive_voice_max_pct": 10,
    "vocabulary_tier": "professional",
    "summary_label": "Key Takeaways"
  },
  "voice_samples": [],
  "do": [
    "Use data to back every major claim",
    "Address the reader directly as you",
    "Lead sections with actionable insight"
  ],
  "dont": [
    "Don't use buzzwords without context",
    "Don't write sentences longer than 30 words",
    "Don't open with We at Acme"
  ]
}
```

## 按词汇级别划分的可读性区间

| 级别 | Flesch 年级 | Flesch 易读度 | 典型用途 |
|------|-------------|-------------|-------------|
| 大众 | 6-8 | 60-80 | 健康、生活方式、个人理财 |
| 专业 | 8-10 | 50-60 | B2B、营销、管理 |
| 技术 | 10-12 | 30-50 | 工程、医疗、法律 |

当用户选择一个级别时，自动填充可读性字段。如果用户希望使用非标准组合（例如，在解释性内容中使用技术词汇，同时保持大众可读性），允许其覆盖这些字段。

## 与 blog-write 和 blog-rewrite 集成

当某个 persona 处于启用状态时（通过 `/blog persona use <name>`），writer agent 会加载 persona JSON，并在生成过程中强制执行以下约束：

1. **生成前** - 加载 persona，将语气维度和风格规则注入 blog-writer agent 的 system prompt。
2. **生成期间** - Writer 遵循 do/dont 规则，以句子长度的 mean/std 为目标，并按指定频率使用缩写形式。
3. **生成后验证** - 根据 persona 约束检查输出：
   - 句子长度分布处于目标均值的 1 个 std 范围内
   - 可读性分数处于指定的年级区间内
   - 被动语态占比低于最大值
   - 通过模式匹配未发现违反 "dont" 规则的情况

如果验证失败，标记具体的违规项并建议修改。

## List 命令

对 `skills/blog/references/personas/*.json` 执行 Glob，并显示表格：

| 角色画像 | 行业 | 受众 | 词汇风格 |
|---------|----------|----------|------------|
| acme-saas | SaaS | 营销经理 | 专业 |

如果不存在角色画像，则提示用户创建一个。

## Show 命令

读取指定的角色画像 JSON，并将其显示为格式化摘要，其中包含所有语气维度、风格规则以及应做/不应做事项列表。

## Use 命令

读取角色画像 JSON 并确认激活。输出将强制执行的关键约束摘要。该角色画像在当前对话会话期间保持激活状态。Blog-write 和 blog-rewrite 在生成内容前会检查当前激活的角色画像。

## 错误处理

- **无效的语气值**：如果用户提供的值超出 0.0-1.0 范围，则将其限制为最接近的有效边界值并发出警告
- **无法访问的声音样本**：如果 voice_samples 中的 URL 返回错误，则跳过该样本，并在配置文件中注明该样本不可用
- **角色画像目录为空**：在未保存任何角色画像的情况下运行 list 或 show 时，提示用户先创建一个
- **名称冲突**：如果在 create 期间角色画像名称已存在，则询问是覆盖还是选择其他名称
- **JSON 格式错误**：如果角色画像文件已损坏，则报告错误，并提议根据访谈重新创建该文件