---
name: infographics
description: "Create professional infographics using Nano Banana Pro AI with smart iterative refinement. Uses Gemini 3.6 Flash for quality review. Integrates research-lookup and web search for accurate data. Supports 10 infographic types, 8 industry styles, and colorblind-safe palettes."
allowed-tools: Read Write Edit Bash
metadata:
  version: "1.6"
  openclaw:
    primaryEnv: OPENROUTER_API_KEY
    envVars:
    - name: OPENROUTER_API_KEY
      required: false
      description: OpenRouter API key for the skill's LLM-powered steps.
---
# 信息图

## 概述

信息图是信息、数据或知识的可视化呈现，旨在快速清晰地展示复杂内容。**此技能使用 Nano Banana Pro AI 生成信息图，使用 Gemini 3.6 Flash 进行质量审核，并使用 Perplexity Sonar 开展研究。**

**工作方式：**
- （可选）**研究阶段**：使用 Perplexity Sonar 收集准确的事实和统计数据
- 使用自然语言描述你的信息图
- Nano Banana Pro 自动生成出版级质量的信息图
- **Gemini 3.6 Flash 根据文档类型阈值审核质量**
- **智能迭代**：仅当质量低于阈值时才重新生成
- 几分钟内即可获得可直接用于专业场景的输出
- 无需设计技能

**按文档类型划分的质量阈值：**
| 文档类型 | 阈值 | 描述 |
|---------------|-----------|-------------|
| marketing | 8.5/10 | 营销材料——必须具备吸引力 |
| report | 8.0/10 | 商业报告——专业质量 |
| presentation | 7.5/10 | 幻灯片、演讲——清晰且引人入胜 |
| social | 7.0/10 | 社交媒体内容 |
| internal | 7.0/10 | 内部使用 |
| draft | 6.5/10 | 工作草稿 |
| default | 7.5/10 | 通用用途 |

**只需描述你想要的内容，Nano Banana Pro 就会创建它。**

## 快速开始

只需描述即可生成任意信息图：

```bash
# Generate a list infographic (default threshold 7.5/10)
python skills/infographics/scripts/generate_infographic.py \
  "5 benefits of regular exercise" \
  -o figures/exercise_benefits.png --type list

# Generate for marketing (highest threshold: 8.5/10)
python skills/infographics/scripts/generate_infographic.py \
  "Product features comparison" \
  -o figures/product_comparison.png --type comparison --doc-type marketing

# Generate with corporate style
python skills/infographics/scripts/generate_infographic.py \
  "Company milestones 2010-2025" \
  -o figures/timeline.png --type timeline --style corporate

# Generate with colorblind-safe palette
python skills/infographics/scripts/generate_infographic.py \
  "Heart disease statistics worldwide" \
  -o figures/health_stats.png --type statistical --palette wong

# Generate WITH RESEARCH for accurate, up-to-date data
python skills/infographics/scripts/generate_infographic.py \
  "Global AI market size and growth projections" \
  -o figures/ai_market.png --type statistical --research
```

**后台处理过程：**
1. **（可选）研究**：Perplexity Sonar 收集准确的事实、统计数据和资料
2. **生成 1**：Nano Banana Pro 遵循设计最佳实践创建初始信息图
3. **审核 1**：**Gemini 3.6 Flash** 根据文档类型阈值评估质量
4. **决策**：如果质量 >= 阈值 → **完成**（无需再进行迭代！）
5. **如果低于阈值**：根据评审意见改进提示词，然后重新生成
6. **重复**：直到质量达到阈值，或达到最大迭代次数

**智能迭代的优势：**
- ✅ 如果首次生成已足够好，可节省 API 调用
- ✅ 为营销材料提供更高的质量标准
- ✅ 为草稿/内部使用提供更快的交付速度
- ✅ 针对每种使用场景提供适当的质量

**输出**：带版本控制的图像，以及包含质量评分、评析和提前停止信息的详细审查日志。

## 何时使用此技能

在以下情况使用 **infographics** 技能：
- 以视觉格式呈现数据或统计信息
- 为项目里程碑或历史创建时间线可视化
- 解释流程、工作流或分步指南
- 并排比较选项、产品或概念
- 以引人入胜的视觉格式总结关键要点
- 创建地理或基于地图的数据可视化
- 构建层级结构图或组织结构图
- 设计社交媒体内容或营销材料

**以下情况请改用 scientific-schematics：**
- 技术流程图和电路图
- 生物通路和分子图
- 神经网络架构图
- CONSORT/PRISMA 方法学图

---

## 研究集成

### 自动数据收集 (`--research`)

创建需要准确、最新数据的信息图时，请使用 `--research` 标志，通过 **Perplexity Sonar Pro** 自动收集事实和统计数据。

```bash
# Research and generate statistical infographic
python skills/infographics/scripts/generate_infographic.py \
  "Global renewable energy adoption rates by country" \
  -o figures/renewable_energy.png --type statistical --research

# Research for timeline infographic
python skills/infographics/scripts/generate_infographic.py \
  "History of artificial intelligence breakthroughs" \
  -o figures/ai_history.png --type timeline --research

# Research for comparison infographic
python skills/infographics/scripts/generate_infographic.py \
  "Electric vehicles vs hydrogen vehicles comparison" \
  -o figures/ev_hydrogen.png --type comparison --research
```

### 研究提供的内容

研究阶段会自动：

1. **收集关键事实**：与主题相关的 5-8 项事实和统计数据
2. **提供背景信息**：用于确保准确呈现的背景信息
3. **查找数据点**：具体的数字、百分比和日期
4. **引用来源**：提及主要研究或来源
5. **优先考虑时效性**：重点关注 2023-2026 年的信息

### 何时使用研究

**以下情况启用研究（`--research`）：**
- 需要准确数字的统计信息图
- 市场数据、行业统计数据或趋势
- 科学或医学信息
- 时事或近期发展
- 准确性至关重要的任何主题

**以下情况跳过研究：**
- 简单的概念性信息图
- 内部流程文档
- 你在提示中提供了全部数据的主题
- 对生成速度要求很高的场景

### 研究输出

启用研究后，将创建额外文件：
- `{name}_research.json` - 原始研究数据和来源
- 研究内容会自动整合到信息图提示中

---

## 信息图类型

可通过 `--type` 使用十种类型：`statistical`、`timeline`、`process`、`comparison`、
`list`、`geographic`、`hierarchical`、`anatomical`、`resume` 和 `social`。各类型的
用途、预期数据形态和示例提示请参阅
[references/infographic_type_catalog.md](references/infographic_type_catalog.md) 和
[references/infographic_types.md](references/infographic_types.md)。

## 风格预设

### 行业风格（`--style`）

| 风格 | 颜色 | 最适合 |
|-------|--------|----------|
| `corporate` | 海军蓝、钢蓝、金色 | 商业报告、金融 |
| `healthcare` | 医疗蓝、青色、浅青色 | 医疗、健康 |
| `technology` | 科技蓝、石板灰、紫罗兰色 | 软件、数据、AI |
| `nature` | 森林绿、薄荷绿、土褐色 | 环境、有机 |
| `education` | 学术蓝、浅蓝、珊瑚色 | 学习、学术 |
| `marketing` | 珊瑚色、青绿色、黄色 | 社交媒体、营销活动 |
| `finance` | 海军蓝、金色、绿/红 | 投资、银行业 |
| `nonprofit` | 暖橙色、鼠尾草绿、沙色 | 社会公益、慈善事业 |

```bash
# Corporate style
python skills/infographics/scripts/generate_infographic.py \
  "Q4 Results" -o q4.png --type statistical --style corporate

# Healthcare style
python skills/infographics/scripts/generate_infographic.py \
  "Patient Journey" -o journey.png --type process --style healthcare
```

---

## 色盲友好型配色方案

### 可用配色方案（`--palette`）

| 配色方案 | 颜色 | 描述 |
|---------|--------|-------------|
| `wong` | 橙色、天蓝色、绿色、蓝色、朱红色 | 最广泛推荐 |
| `ibm` | 群青色、靛蓝色、洋红色、橙色、金色 | IBM 的无障碍配色方案 |
| `tol` | 12 色扩展配色方案 | 适用于多类别 |

```bash
# Wong's colorblind-safe palette
python skills/infographics/scripts/generate_infographic.py \
  "Survey results by category" -o survey.png --type statistical --palette wong
```

---

## 智能迭代优化和 CLI

生成-审查-优化循环、所有命令行选项及配置均位于
[references/iterative_refinement.md](references/iterative_refinement.md)。

## 提示工程技巧

### 明确内容细节

✓ **好的提示词**（具体、详细）：
```
"5 benefits of meditation: reduces stress, improves focus, 
better sleep, lower blood pressure, emotional balance"
```

✗ **避免模糊的提示词**：
```
"meditation infographic"
```

### 包含数据点

✓ **好的**：
```
"Market growth from $10B (2020) to $45B (2025), CAGR 35%"
```

✗ **模糊**：
```
"market is growing"
```

### 指定视觉元素

✓ **好的**：
```
"Timeline showing 5 milestones with icons for each event"
```

---

## 参考文件

如需详细指导，请加载以下参考文件：

- **`references/infographic_types.md`**：所有 10 多种类型的扩展模板
- **`references/design_principles.md`**：视觉层级、布局、排版
- **`references/color_palettes.md`**：完整的配色方案规范

---

## 故障排除

### 常见问题

**问题**：信息图中的文字无法阅读
- **解决方案**：减少文本内容；使用 --type 指定布局类型

**问题**：颜色冲突或无障碍性不足
- **解决方案**：使用 `--palette wong` 获取色盲友好型颜色

**问题**：质量评分过低
- **解决方案**：通过 `--iterations 3` 增加迭代次数；使用更具体的提示词

**问题**：生成了错误的信息图类型
- **解决方案**：始终指定 `--type` 标志以确保结果一致

---

## 与其他技能集成

此技能可与以下技能协同使用：

- **scientific-schematics**：用于技术图表和流程图
- **market-research-reports**：用于商业报告的信息图
- **scientific-slides**：用于演示文稿的信息图元素
- **generate-image**：用于非信息图类视觉内容

---

## 快速参考清单

生成前：
- [ ] 清晰、具体的内容描述
- [ ] 已选择信息图类型（`--type`）
- [ ] 风格适合目标受众（`--style`）
- [ ] 已指定输出路径（`-o`）
- [ ] 已配置 API 密钥

生成后：
- [ ] 检查生成的图像
- [ ] 查看审查日志中的评分
- [ ] 如有需要，使用更具体的提示词重新生成

---

使用此技能，借助 Nano Banana Pro AI 的强大能力和智能质量审查，创建专业、易于理解且视觉吸引力强的信息图。