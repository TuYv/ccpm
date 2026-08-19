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
# 信息图表

## 概述

信息图表是信息、数据或知识的可视化表示，旨在快速、清晰地呈现复杂内容。**此技能使用 Nano Banana Pro AI 生成信息图表，使用 Gemini 3.6 Flash 进行质量审核，并使用 Perplexity Sonar 进行研究。**

**工作原理：**
- （可选）**研究阶段**：使用 Perplexity Sonar 收集准确的事实和统计数据
- 用自然语言描述你的信息图表
- Nano Banana Pro 自动生成出版级信息图表
- **Gemini 3.6 Flash 根据文档类型的质量阈值审核质量**
- **智能迭代**：仅在质量低于阈值时重新生成
- 几分钟内即可获得专业级输出
- 无需设计技能

**按文档类型划分的质量阈值：**
| 文档类型 | 阈值 | 描述 |
|---------------|-----------|-------------|
| marketing | 8.5/10 | 营销材料——必须具有吸引力 |
| report | 8.0/10 | 商业报告——专业品质 |
| presentation | 7.5/10 | 幻灯片、演讲——清晰且引人入胜 |
| social | 7.0/10 | 社交媒体内容 |
| internal | 7.0/10 | 内部使用 |
| draft | 6.5/10 | 工作草稿 |
| default | 7.5/10 | 通用用途 |

**只需描述你想要的内容，Nano Banana Pro 就会为你创建。**

## 快速开始

只需描述信息图表，即可生成任意信息图表：

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

**幕后发生的事情：**
1. **（可选）研究**：Perplexity Sonar 收集准确的事实、统计数据和资料
2. **第 1 次生成**：Nano Banana Pro 遵循设计最佳实践创建初始信息图表
3. **第 1 次审核**：**Gemini 3.6 Flash** 根据文档类型的质量阈值评估质量
4. **决策**：如果质量 >= 阈值 → **完成**（无需更多迭代！）
5. **如果低于阈值**：根据批评意见改进提示词，然后重新生成
6. **重复**：直到质量达到阈值**或**达到最大迭代次数

**智能迭代的优势：**
- ✅ 如果第一次生成已经足够好，可节省 API 调用
- ✅ 为营销材料提供更高的质量标准
- ✅ 加快草稿/内部使用场景的交付速度
- ✅ 为每种使用场景提供适当的质量水平

**输出**：带有版本号的图像，以及包含质量评分、批评意见和提前停止信息的详细审查日志。

## 何时使用此技能

在以下情况下使用 **infographics** 技能：
- 以视觉形式呈现数据或统计信息
- 为项目里程碑或历史创建时间线可视化
- 解释流程、工作流或分步指南
- 并排比较选项、产品或概念
- 以引人入胜的视觉形式总结要点
- 创建基于地理或地图的数据可视化
- 构建层级图或组织结构图
- 设计社交媒体内容或营销材料

**以下情况请改用 scientific-schematics：**
- 技术流程图和电路图
- 生物通路和分子图
- 神经网络架构图
- CONSORT/PRISMA 方法学图

---

## 研究集成

### 自动数据收集（`--research`）

创建需要准确、最新数据的信息图时，使用 `--research` 标志，通过 **Perplexity Sonar Pro** 自动收集事实和统计数据。

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

1. **收集关键事实**：关于主题的 5-8 条相关事实和统计数据
2. **提供背景信息**：用于准确呈现的背景信息
3. **查找数据点**：具体数字、百分比和日期
4. **引用来源**：提及主要研究或来源
5. **优先考虑时效性**：重点关注 2023-2026 年的信息

### 何时使用研究

**在以下情况下启用研究（`--research`）：**
- 需要准确数字的统计信息图
- 市场数据、行业统计或趋势
- 科学或医学信息
- 当前事件或近期发展
- 任何准确性至关重要的主题

**在以下情况下跳过研究：**
- 简单的概念性信息图
- 内部流程文档
- 你已在提示中提供全部数据的主题
- 对生成速度要求较高

### 研究输出

启用研究后，会创建其他文件：
- `{name}_research.json` - 原始研究数据和来源
- 研究内容会自动整合到信息图提示中

---

## 信息图类型

通过 `--type` 支持十种类型：`statistical`、`timeline`、`process`、`comparison`、  
`list`、`geographic`、`hierarchical`、`anatomical`、`resume` 和 `social`。每种类型的  
用途、所需的数据结构以及示例提示，详见  
[references/infographic_type_catalog.md](references/infographic_type_catalog.md) 和  
[references/infographic_types.md](references/infographic_types.md)。

## 样式预设

### 行业样式（`--style`）

| 样式 | 颜色 | 最适合用于 |
|-------|--------|----------|
| `corporate` | 海军蓝、钢蓝、金色 | 商业报告、金融 |
| `healthcare` | 医疗蓝、青色、浅青色 | 医疗、健康 |
| `technology` | 科技蓝、板岩色、紫罗兰色 | 软件、数据、AI |
| `nature` | 森林绿、薄荷绿、大地棕 | 环境、有机主题 |
| `education` | 学术蓝、浅蓝色、珊瑚色 | 学习、学术 |
| `marketing` | 珊瑚色、青绿色、黄色 | 社交媒体、营销活动 |
| `finance` | 海军蓝、金色、绿/红色 | 投资、银行 |
| `nonprofit` | 暖橙色、鼠尾草绿、沙色 | 社会公益、慈善机构 |

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
| `ibm` | 群青色、靛蓝色、品红色、橙色、金色 | IBM 的无障碍配色方案 |
| `tol` | 12 色扩展配色方案 | 适用于多种类别 |

```bash
# Wong's colorblind-safe palette
python skills/infographics/scripts/generate_infographic.py \
  "Survey results by category" -o survey.png --type statistical --palette wong
```

---

## 智能迭代优化与 CLI

生成-审查-优化循环、每个命令行选项以及配置均位于
[references/iterative_refinement.md](references/iterative_refinement.md)。

## 提示词工程技巧

### 明确指定内容

✓ **良好的提示词**（具体、详细）：
```
"5 benefits of meditation: reduces stress, improves focus, 
better sleep, lower blood pressure, emotional balance"
```

✗ **避免模糊的提示词**：
```
"meditation infographic"
```

### 包含数据点

✓ **良好示例**：
```
"Market growth from $10B (2020) to $45B (2025), CAGR 35%"
```

✗ **模糊示例**：
```
"market is growing"
```

### 指定视觉元素

✓ **良好示例**：
```
"Timeline showing 5 milestones with icons for each event"
```

---

## 参考文件

如需详细指导，请加载以下参考文件：

- **`references/infographic_types.md`**：涵盖全部 10+ 种类型的扩展模板
- **`references/design_principles.md`**：视觉层级、布局、排版
- **`references/color_palettes.md`**：完整的配色方案规范

---

## 故障排除

### 常见问题

**问题**：信息图中的文本难以阅读
- **解决方案**：减少文本内容；使用 `--type` 指定布局类型

**问题**：颜色冲突或不具备无障碍性
- **解决方案**：使用 `--palette wong` 以采用色盲友好型颜色

**问题**：质量评分过低
- **解决方案**：使用 `--iterations 3` 增加迭代次数；使用更具体的提示词

**问题**：生成了错误的信息图类型
- **解决方案**：始终指定 `--type` 标志，以获得一致的结果

---

## 与其他 Skills 的集成

此 skill 可与以下内容协同使用：

- **scientific-schematics**：用于技术图表和流程图
- **market-research-reports**：用于商业报告的信息图表
- **scientific-slides**：用于演示文稿的信息图表元素
- **generate-image**：用于非信息图类视觉内容

---

## 快速参考清单

生成前：
- [ ] 清晰、具体的内容描述
- [ ] 已选择信息图类型（`--type`）
- [ ] 样式适合受众（`--style`）
- [ ] 已指定输出路径（`-o`）
- [ ] 已配置 API 密钥

生成后：
- [ ] 检查生成的图像
- [ ] 查看评审日志中的评分
- [ ] 如有需要，使用更具体的提示词重新生成

---

使用此 skill，借助 Nano Banana Pro AI 以及智能质量评审功能，创建专业、易于访问且具有视觉吸引力的信息图表。