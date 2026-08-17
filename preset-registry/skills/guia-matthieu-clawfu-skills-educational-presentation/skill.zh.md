---
name: educational-presentation
description: >
  Transform Claude into an expert in evidence-based educational presentation design. 
  Use when designing presentations for teaching, training, or learning contexts where 
  retention and comprehension matter. Applies Cognitive Load Theory, Mayer's 12 Principles 
  of Multimedia Learning, Gagné's 9 Events of Instruction, C.R.A.P. design principles, 
  and WCAG 2.1 AA accessibility standards. Triggers on requests to (1) create educational 
  or training presentations, (2) design slides for teaching or workshops, (3) improve 
  existing educational presentations, (4) convert content into visual presentations, 
  (5) ensure accessible and inclusive presentations, or (6) apply learning science 
  to presentation design.
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 教育演示文稿设计

基于学习科学的研究证据，将任何演示文稿转化为经过认知优化的学习工具。

## 核心理念：最小化认知负荷

**首要准则**：每一项设计决策都必须服务于学习，具体包括：
1. 降低外在认知负荷（消除干扰）
2. 管理内在认知负荷（将复杂内容分块）
3. 优化相关认知负荷（最大限度地将心理资源用于真正的学习）

**关键规则**：如果某个设计元素不能直接促进学习，就将其移除。

---

## 基本原则（不可妥协）

### 迈耶最关键的三项原则

#### 1. 连贯原则 ⭐ 最重要
**规则**：排除所有无关材料——不使用装饰性剪贴画、杂乱的背景或无关细节。
**应用**：幻灯片中的每个元素都必须具有明确的教学目的。

#### 2. 冗余原则 ⭐ 关键  
**规则**：不要在幻灯片上放置将被逐字朗读的大段文本。
**原因**：这会造成“认知通道冲突”——观众无法同时阅读和聆听。
**解决方案**：
- 视觉内容 + 讲解 = 良好 ✅
- 视觉内容 + 文本墙 + 讲解 = 认知过载 ❌
- 将所有段落文本移至演讲者备注
- 幻灯片应仅包含：关键词、图形或图表

#### 3. 分段原则 ⭐ 必不可少
**规则**：使用渐进式呈现或多张幻灯片，将内容拆分为可由用户控制节奏的信息块。
**应用**：绝不要用一张内容密集的幻灯片让观众不堪重负——应将内容拆分到 3-5 张幻灯片中。

**如需了解迈耶全部 12 项原则及其详细应用**，请阅读 [`references/quick-reference.md`](references/quick-reference.md)。

---

## 宏观结构：加涅九大教学事件框架

每份教育演示文稿都必须遵循以下结构：

### 事件 1：引起注意
- 发人深省的问题、令人惊讶的统计数据或引人入胜的案例研究
- 激发好奇心并集中注意力

### 事件 2：告知学习者目标  
- “在本次课程结束时，你将能够……”
- 使用可衡量的行为动词（分析、比较、应用、评价、创建）

### 事件 3：唤起对先前所学内容的回忆
- 投票问题：“关于 X，你已经了解哪些内容？”
- 激活现有知识，将其作为学习基础

### 事件 4：呈现内容
- 使用视觉内容 + 讲解的方式呈现主要内容（而非文本墙）
- 将内容拆分为易于理解的 3-5 分钟信息块
- 应用渐进式呈现

### 事件 5：提供学习指导
- 完整示例、反例、类比和案例研究
- 图示组织工具和助记法

### 事件 6：引出学习表现
- “尝试解决这个问题”或“与你身边的人讨论”
- 互动式测验或应用练习（不计分）

### 事件 7：提供反馈
- 提供正确答案及解释
- 展示理想回答的范例以及应避免的常见错误

### 事件 8：评估学习表现
- 正式测验、项目任务要求或最终演示要求
- 衡量目标是否达成

### 事件 9：促进保持与迁移
- 最终总结和迁移问题：“你将如何在工作中运用这些内容？”
- 需要解决的现实问题

**有关每种活动的详细模板**，请阅读 [`references/slide-templates.md`](references/slide-templates.md)。

---

## 微观设计：C.R.A.P. 原则

### 1. 对比
通过强烈差异建立视觉层级：
- 大标题（36-44pt）与较小的正文（24-32pt）形成对比  
- 在中性背景上使用明亮的强调色
- 粗体与常规字重形成对比

### 2. 重复
重复使用相同的字体、颜色和布局：
- 标题位置保持一致
- 每张幻灯片使用相同的配色方案
- 整套幻灯片最多使用 2 种字体

### 3. 对齐
任何内容都不应随意放置：
- 使用不可见网格（启用参考线）
- 正文文本左对齐（切勿将段落居中）
- 让每个元素都与另一个元素形成关联

### 4. 亲密性
将相关项目紧密地组合在一起：
- 将标签直接放在图形旁边
- 使用留白分隔不相关的组

**有关 C.R.A.P. 原则的详细应用方法**，请阅读 [`references/quick-reference.md`](references/quick-reference.md)。

---

## 字体排印与色彩基础

### 字体排印规则
- **字体选择**：仅使用无衬线字体（Arial、Calibri、Verdana、Helvetica）
- **字号**：主标题 36-44pt，正文文本至少 24-32pt
- **对齐**：所有正文文本均左对齐，切勿居中
- **强调**：使用粗体，切勿使用下划线或全大写

### 色彩策略
**60-30-10 规则**：
- 60% 主色（中性背景：白色、米白色、深灰色）
- 30% 辅色（结构元素：标题栏、侧边栏）  
- 10% 强调色（关键词、按钮、箭头——明亮且对比鲜明）

**无障碍性（WCAG 2.1 AA）**：
- 普通文本的对比度至少为 4.5:1
- 大号文本（18pt 及以上）的对比度至少为 3:1
- 切勿使用红色/绿色或蓝色/黄色组合

**工具**：WebAIM Contrast Checker、Adobe Color、Coolors

---

## 视觉元素与多媒体

### 图像与图标
- ✅ 高质量且相关的照片
- ✅ 专业图标（Noun Project、Flaticon、Iconoir）  
- ✅ 可以用图标替代项目符号
- ❌ 不要使用装饰性剪贴画或“诱惑性细节”

### 图表与示意图
- 每张图表只传达一个明确的信息
- 对复杂示意图使用渐进式呈现
- 直接在元素上添加标签（不要使用单独的图例）

**免费合法资源**：
- 图像：Unsplash、Wikimedia Commons
- 图标：Noun Project、Flaticon、Iconoir

---

## 渐进式呈现与动画

### 何时使用
- 有 3 个或更多项目符号或列表项
- 复杂的示意图或流程
- 分步骤说明

### 如何实现
**PowerPoint**：动画 > 添加动画 > 出现 > 效果选项：单击时
**Google Slides**：插入 > 动画 > 出现/淡入 > 单击时

**关键规则**：
- 仅使用“出现”或“淡入”（不要使用分散注意力的效果）
- 设置为“单击时”，而不是“上一动画之后”
- 逐个部分构建示意图

---

## 无障碍性（WCAG 2.1 AA）

### 必须满足的要求
1. 所有图像和图表都要有**替代文本**
2. **对比度**达到 4.5:1（使用工具验证）
3. 使用**内置布局**（不要随意放置浮动文本框）
4. 检查并纠正**阅读顺序**
5. 确保**颜色独立性**（不要仅依靠颜色表达含义）

### 工具
**PowerPoint**：文件 > 信息 > 检查问题 > 检查辅助功能
**Google Slides**：Grackle Slides 插件

**如需完整的无障碍检查清单**，请阅读 [`references/validation.md`](references/validation.md)。

---

## 应避免的常见错误

### ❌ 致命的项目符号幻灯片
**问题**：一次性呈现 8 个以上使用完整句子的项目符号
**修正**：拆分到 3-4 张幻灯片中，每张幻灯片只传达一个明确的信息，并使用渐进式呈现

### ❌ 文字墙
**问题**：幻灯片上堆满段落文字，同时演讲者逐字朗读
**修正**：将所有段落文字移至演讲者备注中，幻灯片上仅保留关键词/图形

### ❌ 剪贴画灾难  
**问题**：使用无法说明概念的通用剪贴画
**修正**：使用高质量、相关的照片或专业图标

### ❌ 令人不知所措的图表
**问题**：一次性展示复杂的流程图
**修正**：使用渐进式呈现，逐步构建图表

### ❌ 所有内容都居中
**问题**：幻灯片上的所有文字都居中对齐
**修正**：所有正文文字左对齐，并使用隐形网格

**如需详细的修改前后对比示例**，请阅读 [`references/before-after.md`](references/before-after.md)。

---

## 工作流：创建演示文稿

### 第 1 步：规划结构（5-10 分钟）
1. 定义学习目标（使用可衡量的动作动词）
2. 使用加涅九大教学事件框架拟定大纲
3. 确定需要预先讲解的关键概念
4. 规划练习机会和反馈

### 第 2 步：创建内容幻灯片（30-60 分钟）
1. 从幻灯片标题开始（每张幻灯片只表达一个明确的观点）
2. 优先添加相关视觉内容（不要仅作为装饰）
3. 添加尽可能少的文字（仅使用关键词，不使用句子）
4. 编写详细的演讲者备注（你要讲的内容）
5. 始终一致地应用 C.R.A.P. 原则

### 第 3 步：实现渐进式呈现（10-20 分钟）
1. 找出包含 3 个以上项目的幻灯片
2. 添加“出现”动画，并将其设置为“单击时”
3. 测试流程和时机

### 第 4 步：演示前验证（10-15 分钟）
1. 运行辅助功能检查器
2. 验证对比度
3. 检查阅读顺序
4. 确认所有图像都有替代文本
5. 在实际的演示屏幕上进行测试

**如需完整的验证检查清单（174 项）**，请阅读 [`references/validation.md`](references/validation.md)。

---

## 决策树

### “我应该把这段文字放在幻灯片上吗？”

```
Will I read this text aloud?
├─ YES → Move to speaker notes ✅
│      (Use visual + keyword only on slide)
└─ NO → Consider keeping on slide
       ├─ Is it a keyword/label? → Keep ✅
       ├─ Is it a technical term that must be referenced? → Keep ✅  
       └─ Is it a full sentence/paragraph? → Move to notes ✅
```

### “我应该使用哪种图表？”

```
What's your data story?
├─ Comparing categories → Bar/Column chart
├─ Showing trend over time → Line graph
├─ Part-to-whole relationship → Pie/Donut (max 5 slices)
└─ Correlation between variables → Scatter plot
```

---

## 快速验证检查清单

交付前，请确认：

### 结构 ✓
- [ ] 遵循加涅九大教学事件框架
- [ ] 明确陈述了学习目标
- [ ] 包含练习机会和反馈

### 认知负荷 ✓  
- [ ] 每张幻灯片不超过一个主要观点
- [ ] 复杂内容进行了适当分块
- [ ] 移除了所有装饰性元素（连贯性原则）
- [ ] 不同时使用大段文字和旁白（冗余原则）

### 设计 ✓
- [ ] 强烈的对比营造出清晰的层级
- [ ] 全篇保持一致的重复性
- [ ] 所有元素均与网格对齐
- [ ] 每张幻灯片都留有充足的留白

### 字体排印 ✓
- [ ] 使用无衬线字体
- [ ] 最多使用 2 种字体
- [ ] 所有文字至少为 24pt
- [ ] 正文左对齐

### 色彩 ✓
- [ ] 应用了 60-30-10 法则
- [ ] 所有文字均达到 4.5:1 的对比度
- [ ] 不使用红/绿或蓝/黄组合

### 多媒体 ✓
- [ ] 每张幻灯片都有文字和图片
- [ ] 仅使用高质量且相关的图片
- [ ] 标签放置在图形旁边

### 交互 ✓
- [ ] 在适当之处应用渐进式呈现
- [ ] 动画设置为 "On Click"
- [ ] 仅使用 "Appear" 或 "Fade"

### 无障碍 ✓
- [ ] 所有图片/图表均有替代文本
- [ ] 使用内置版式
- [ ] 已验证对比度

---

## 核心箴言

1. **“如果不能促进学习，就删掉它。”**（连贯性原则）
2. **“视觉元素 + 旁白，而不是视觉元素 + 文字 + 旁白。”**（冗余原则）
3. **“一张幻灯片，一个观点。”**（分段原则）
4. **“简洁并非空洞，而是聚焦。”**（留白）
5. **“美观即高效。”**（认知负荷理论）
6. **“要么为所有人设计，要么就没有为任何人设计。”**（无障碍）

---

## 参考文件指南

此技能包含针对特定需求的详细参考文件：

### [`references/quick-reference.md`](references/quick-reference.md)
**使用时机**：你需要在创作过程中快速做出决策，或需要一份便于浏览的检查清单
**包含内容**： 
- 30 秒检查清单
- 12 秒掌握 Mayer 的 12 项原则
- 9 张幻灯片掌握 Gagné 的 9 个教学事件
- 用 4 个问题理解 C.R.A.P.
- 字体排印规则速览
- 色彩 60-30-10 法则
- 渐进式呈现指南
- 无障碍设计的 5 项必备要求
- 应避免的 5 大错误
- 图表选择指南

### [`references/slide-templates.md`](references/slide-templates.md)  
**使用时机**：你需要可直接用于特定幻灯片类型的模板
**包含内容**：
- 按 Gagné 的 9 个教学事件组织的 20 多个模板
- 开场幻灯片（3 个模板）
- 目标、回顾、内容和指导模板
- 练习、反馈和评估模板
- 迁移/应用模板
- 特殊幻灯片（章节分隔、总结、问答、致谢、参考资料）
- 每个模板的选择指南

### [`references/before-after.md`](references/before-after.md)
**使用时机**：你希望查看具体的改造案例或了解常见错误
**包含内容**：
- 6 个主要改造示例
- 对问题的认知分析
- 逐步应用的解决方案
- 用于验证的 C.R.A.P.-Mayer 评分
- 展示改进效果的视觉对比

### [`references/validation.md`](references/validation.md)
**使用时机**：你需要在交付前进行全面验证
**包含内容**：
- 包含 174 项的完整验证检查清单
- 13 个带评分的评估部分
- 教学结构（20 分）
- Mayer 原则（24 分）
- C.R.A.P. 设计（16 分）
- 字体排印、色彩、视觉元素（40 分）
- 动画、留白、无障碍（36 分）
- 内容、时长、叙事、一致性（38 分）
- 评分体系：95-100% = 卓越，85-94% = 非常好，70-84% = 可接受，<70% = 需要返工

---

## 使用技术工具实现

### PowerPoint/Google Slides
在 PowerPoint 或 Google Slides 中创建演示文稿时：
1. 手动应用这些原则
2. 使用内置的无障碍检查工具
3. 使用 WebAIM 或 Coolors 验证对比度
4. 测试渐进式呈现动画

### 使用 Claude 创建（pptx 技能）
当 Claude 需要创建实际的 .pptx 文件时：
1. 此技能提供**教学设计**和**内容结构**
2. `pptx` 技能提供**技术实现**（html2pptx、python-pptx）
3. 先使用此技能进行设计，再使用 pptx 技能进行构建

**工作流程**：
1. 使用 educational-presentation 技能规划结构和内容
2. 创建包含演讲者备注的详细幻灯片大纲
3. 使用 pptx 技能实现技术文件的创建
4. 返回此技能进行最终验证

---

## 核心理论与延伸阅读

**基础理论**：
- 认知负荷理论（Sweller）
- Mayer 的多媒体学习认知理论
- Gagné 的九大教学事件
- Bloom 教育目标分类法

**设计原则**：
- Robin Williams 的 C.R.A.P. 原则
- WCAG 2.1 无障碍指南

**推荐书籍**：
- Garr Reynolds 著《演说之禅》
- Nancy Duarte 著《幻灯片设计学》  
- Richard E. Mayer 著《多媒体学习》

---

## 总结：从这里开始

**刚接触教育演示文稿？** 请遵循以下路径：
1. 完整阅读此 SKILL.md 文件（15 分钟）
2. 查看 [`references/quick-reference.md`](references/quick-reference.md)（10 分钟）
3. 使用 [`references/slide-templates.md`](references/slide-templates.md) 开始创建（每个模板 5 分钟）
4. 交付前使用上方的检查清单进行验证

**要改进现有演示文稿？** 请遵循以下路径：
1. 阅读 [`references/before-after.md`](references/before-after.md)，以识别常见错误（30 分钟）
2. 对幻灯片应用相应的改进
3. 使用 [`references/validation.md`](references/validation.md) 进行验证（15-30 分钟）

**创建过程中需要快速参考？** 请保持打开 [`references/quick-reference.md`](references/quick-reference.md)

---

**请记住**：优秀的演示文稿在认知上是高效的。每项设计选择都应服务于学习，而不仅仅是美观。

---

## Claude 负责什么，您决定什么

| Claude 负责 | 您提供 |
|---------------|-------------|
| 应用 Gagné 的九大教学事件结构 | 学习目标和内容 |
| 落实 Mayer 的 12 项原则 | 领域专业知识和示例 |
| 检查无障碍性（WCAG 2.1 AA） | 视觉设计偏好 |
| 建议采用渐进式呈现 | 节奏和讲授风格 |
| 执行验证检查清单 | 最终批准和优化 |

---

## 技能边界

### 此技能擅长：
- 培训和教育演示文稿
- 研讨会和课程材料
- 注重知识留存的学习型内容
- 无障碍演示文稿设计

### 此技能不适合：
- 销售推介演示文稿 → 需要不同的结构
- 娱乐型演示文稿 → 互动性优先于知识留存
- 信息图 → 静态设计，而非渐进式呈现

---

## 迭代指南

| 轮次 | 重点 | 操作 |
|------|-------|--------|
| **第 1 轮** | 结构 | 应用加涅的九大教学事件框架 |
| **第 2 轮** | 认知负荷 | 检查连贯性、冗余性和分段 |
| **第 3 轮** | 设计 | 应用 C.R.A.P. 原则 |
| **第 4 轮** | 无障碍 | 执行 WCAG 检查清单 |

---

## Skill 元数据

```yaml
name: educational-presentation
category: content
subcategory: presentations
version: 2.0
author: GUIA
source_expert: Richard Mayer, Robert Gagné, Robin Williams
source_work: Multimedia Learning, Conditions of Learning, The Non-Designer's Design Book
difficulty: intermediate
mode: cyborg
tags: [presentation, education, training, cognitive-load, mayer, gagne, accessibility]
created: 2026-02-03
updated: 2026-02-03
```