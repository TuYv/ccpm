---
name: latex-posters
description: "Create professional research posters in LaTeX using beamerposter, tikzposter, or baposter. Support for conference presentations, academic posters, and scientific communication. Includes layout design, color schemes, multi-column formats, figure integration, and poster-specific best practices for visual communication."
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
# LaTeX 研究海报

## 概述

研究海报是会议、研讨会和学术活动中进行科学传播的重要媒介。本技能提供了使用 LaTeX 宏包创建专业且具有视觉吸引力的研究海报的全面指导。生成具有适当布局、字体排版、配色方案和视觉层次的出版级海报。

## 使用此技能的场景

在以下情况下应使用此技能：
- 为会议、研讨会或海报展示会创建研究海报
- 为大学活动或论文答辩设计学术海报
- 准备用于公众参与的研究可视化摘要
- 将科学论文转换为海报格式
- 为研究小组或院系创建海报模板
- 设计符合特定会议尺寸要求的海报（A0、A1、36×48" 等）
- 构建复杂的多栏布局海报
- 将图表、表格、公式和引用整合到海报格式中

## AI 驱动的视觉元素生成

**标准工作流程：在创建 LaTeX 海报之前，使用 AI 生成所有主要视觉元素。**

这是创建具有视觉吸引力的海报的推荐方法：
1. 规划所需的所有视觉元素（标题、简介、方法、结果、结论）
2. 使用 scientific-schematics 或 Nano Banana Pro 生成每个元素
3. 将生成的图像组装到 LaTeX 模板中
4. 在视觉元素周围添加文本内容

**目标：海报区域的 60-70% 应为 AI 生成的视觉内容，30-40% 为文本。**

---

### 硬性限制（不得超出）

这些是限制，而非指导原则。违反这些限制是海报失败最常见的原因。完整的推理说明、按图形类型分类的表格以及具体示例，请参阅
[references/ai_graphics_for_posters.md](references/ai_graphics_for_posters.md)。

| 约束 | 限制 |
| --- | --- |
| 每个 AI 生成图形中的元素数量 | **最多 3-4 个**（3 个为理想数量） |
| 每个图形中的词数 | **最多 10 个** |
| 每个图形中的留白 | **至少 50%**（60% 更佳） |
| 关键数字 / 指标 | **120pt+** |
| 标签 | **80pt+** |
| 海报正文 | **24pt+** |
| 内容板块（A0） | **最多 5-6 个** |
| 海报总词数 | **300-800** |
| 图形宽度 | `0.85\linewidth`，不得使用 `1.0` |

每个图形提示词都必须包含：`POSTER FORMAT for A0`、明确的元素数量或词数（`ONLY 3 icons`、`3 words total`）、字体大小（`GIANT (120pt+)`）、`60% white space`，以及观看距离（`readable from 10-12 feet`）。

**两个强制性的审查关卡。** 跳过其中任何一个，都会导致海报难以阅读：

- **生成前** —— 对每个计划生成的图形进行确认：包含 3-4 个元素、一条信息、不超过 10 个词，并且不是包含 5 个或更多阶段的工作流程。如果不满足，则将其拆分为多个图形。
- **生成后、组装前** —— 以 25% 缩放比例打开每个图形。所有文本都应清晰可读，元素数量不超过 4 个，留白达到 50% 以上，并且能在 2 秒内理解。任何一项不符合要求，都必须重新生成或拆分。不要使用未通过审查的图形组装海报。

始终会失败的模式：`7-stage workflow`、`timeline with annual milestones`、  
`3 case studies in one graphic`、`comparison of 5+ methods`、`architecture with all layers`。  
将每种模式压缩为 3 个高层级项目，或制作多个独立图形。

**溢出是错误，而不是警告。** 编译后，运行 `grep -i overfull poster.log`，  
并在 100% 缩放下检查全部四条边。参见  
[references/compilation_and_quality_control.md](references/compilation_and_quality_control.md)。

## 科学示意图集成

有关创建示意图的详细指导，请参阅 **scientific-schematics** 技能文档。

**主要功能：**
- Nano Banana Pro 自动生成、审查并优化图表
- 创建具有适当格式的出版级图像
- 确保可访问性（色盲友好、高对比度）
- 支持对复杂图表进行迭代优化

---

## 核心功能

支持三种海报软件包——**beamerposter**（Beamer 语法、机构主题）、**tikzposter**（现代、彩色、灵活）和 **baposter**（结构化多栏布局）。软件包比较、布局与网格系统、设计原则、标准尺寸、各软件包模板、图表与图像集成、配色方案、排版以及二维码均记录在  
[references/latex_poster_reference.md](references/latex_poster_reference.md) 中。

可复用的分区内容模式、可访问性要求以及演示日指导位于  
[references/poster_patterns_and_presentation.md](references/poster_patterns_and_presentation.md)。

## 海报制作工作流

### 阶段 1：规划与内容开发

1. **确定海报要求**：
   - 会议尺寸规格（A0、36×48" 等）
   - 方向（纵向还是横向）
   - 投稿截止日期和格式要求

2. **制定内容大纲**：
   - 确定 1-3 条核心信息
   - 选择关键图表（通常为 3-6 个主要视觉元素）
   - 为每个部分起草简洁文本（优先使用项目符号）
   - 总字数控制在 300-800 词

3. **选择 LaTeX 软件包**：
   - beamerposter：熟悉 Beamer、需要机构主题时
   - tikzposter：需要现代、彩色且灵活的设计时
   - baposter：需要结构化、专业的多栏布局时

### 阶段 2：生成视觉元素（AI 驱动）

**关键：生成内容简单、信息极少的图表。每个图形 = 一条信息。**

**内容限制：**
- 每个图形最多 4-5 个元素
- 每个图形总计最多 15 个词
- 至少 50% 的留白
- 超大字体（标签使用 80pt+，关键数字使用 120pt+）

1. **创建 figures 目录**：
   ```bash
   mkdir -p figures
   ```

2. **生成简单的视觉元素**：
   ```bash
   # Introduction - ONLY 3 icons/elements
   python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE visual with ONLY 3 elements: [icon1] [icon2] [icon3]. ONE word labels (80pt+). 50% white space. Readable from 8 feet." -o figures/intro.png
   
   # Methods - ONLY 4 steps maximum
   python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE flowchart with ONLY 4 boxes: STEP1 → STEP2 → STEP3 → STEP4. GIANT labels (100pt+). 50% white space. NO sub-steps." -o figures/methods.png
   
   # Results - ONLY 3 bars/comparisons
   python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE chart with ONLY 3 bars. GIANT percentages ON bars (120pt+). NO axis, NO legend. 50% white space." -o figures/results.png
   
   # Conclusions - EXACTLY 3 items with GIANT numbers
   python scripts/generate_schematic.py "POSTER FORMAT for A0. EXACTLY 3 key findings: '[NUMBER]' (150pt) '[LABEL]' (60pt) for each. 50% white space. NO other text." -o figures/conclusions.png
   ```

3. **检查生成的图示——检查是否溢出：**
   - **以 25% 的缩放比例查看**：所有文字仍然清晰可读吗？
   - **统计元素数量**：超过 5 个？→ 重新生成更简单的版本
   - **检查留白**：少于 40%？→ 在提示词中加入 "60% white space"
   - **字体太小？**：加入 "EVEN LARGER" 或增大 pt 大小
   - **仍然溢出？**：将元素数量减少到 3 个，而不是 4-5 个

### 阶段 3：设计与布局

1. **选择或创建模板**：
   - 从 `assets/` 中提供的模板开始
   - 自定义配色方案以匹配品牌形象
   - 配置页面大小和方向

2. **设计布局结构**：
   - 规划列结构（2 列、3 列或 4 列）
   - 规划内容流向（通常为从左到右、从上到下）
   - 为标题分配空间（10-15%）、内容（70-80%）和页脚（5-10%）

3. **设置排版**：
   - 为不同层级配置字号
   - 确保正文文本至少为 24pt
   - 从 4-6 英尺的距离测试可读性

### 阶段 4：内容整合

1. **创建海报页眉**：
   - 标题（简洁、描述性强，10-15 个单词）
   - 作者和所属机构
   - 机构徽标（高分辨率）
   - 会议徽标（如有要求）

2. **整合 AI 生成的图示**：
   - 将阶段 2 中的所有图示添加到适当的版块
   - 使用 `\includegraphics` 并设置适当的尺寸
   - 确保图示主导每个版块（视觉内容优先，文字次之）
   - 将图示置于版块中央，以增强视觉效果

3. **添加最少量的辅助文字**：
   - 保持文字简洁且便于快速浏览（总计 300-800 个单词）
   - 使用项目符号，而不是段落
   - 使用主动语态
   - 文字应补充图示，而不是重复图示内容

4. **添加补充元素**：
   - 用于补充材料的二维码
   - 参考文献（仅引用关键论文，通常为 5-10 篇）
   - 联系信息和致谢

### 阶段 5：完善与测试

1. **检查并迭代**：
   - 检查拼写错误和其他错误
   - 验证所有图示均为高分辨率
   - 确保格式一致
   - 确认配色方案协调美观

2. **测试可读性**：
   - 以 25% 的比例打印，并从 2-3 英尺的距离阅读（模拟从 8-12 英尺外观看海报）
   - 在不同显示器上检查颜色
   - 验证二维码是否正常工作
   - 请同事进行审阅

3. **优化打印效果**：
   - 在 PDF 中嵌入所有字体
   - 验证图像分辨率
   - 检查 PDF 大小要求
   - 如有要求，包含出血区域

### 阶段 6：编译与交付

1. **编译最终 PDF**：
   ```bash
   pdflatex poster.tex
   # Or for better font support:
   lualatex poster.tex
   ```

2. **验证输出质量**：
   - 检查所有元素是否可见且位置正确
   - 放大至 100% 并检查图示质量
   - 验证颜色是否符合预期
   - 确认 PDF 可在不同查看器中正确打开

3. **准备打印**：
   - 如有要求，导出为 PDF/X-1a
   - 保存备份副本
   - 先在普通纸张上进行测试打印
   - 在截止日期前 2-3 天安排专业打印

4. **创建补充材料**：
   - 保存用于社交媒体的 PNG/JPG 版本
   - 创建讲义版本（8.5×11" 摘要）
   - 准备用于通过电子邮件分享的数字版本

## 与其他 Skills 的集成

此 skill 可与以下内容有效协作：
- **Scientific Schematics**：关键——用于生成所有海报图表和流程图
- **Generate Image / Nano Banana Pro**：用于风格化图形、概念插图和摘要视觉素材
- **Scientific Writing**：用于根据论文开发海报内容
- **Literature Review**：用于提供研究背景
- **Data Analysis**：用于创建结果图和图表

**推荐工作流**：始终在创建 LaTeX 海报之前，先使用 scientific-schematics 和 generate-image skills 生成所有视觉元素。

## 需要避免的常见问题

**AI 生成图形时的错误（最常见）：**
- ❌ 单个图形中包含过多元素（10+ 项）→ 最多保留 3-5 项
- ❌ AI 图形中的文字过小 → 指定“GIANT (100pt+)”或“HUGE (150pt+)”
- ❌ 提示词包含过多细节 → 使用“SIMPLE”和“ONLY X elements”
- ❌ 未指定留白 → 在每个提示词中加入“50% white space”
- ❌ 包含 8+ 个步骤的复杂流程图 → 最多限制为 4-5 个步骤
- ❌ 包含 6+ 项的比较图表 → 最多限制为 3 项
- ❌ 包含 5+ 个指标的关键发现 → 仅展示最重要的 3 个

**修复 AI 图形中的溢出问题：**
如果 AI 生成的图形出现溢出或文字过小：
1. 在提示词中加入“SIMPLER”或“ONLY 3 elements”
2. 增大字体：“150pt+”而不是“80pt+”
3. 加入“60% white space”而不是“50%”
4. 删除次要细节：“NO sub-steps”、“NO axis labels”、“NO legend”
5. 使用更少元素重新生成

**设计错误**：
- ❌ 文字过多（超过 1000 个单词）
- ❌ 字体过小（正文小于 24pt）
- ❌ 颜色组合对比度过低
- ❌ 布局拥挤且没有留白
- ❌ 各部分的风格不一致
- ❌ 图像质量差或出现像素化

**内容错误**：
- ❌ 没有清晰的叙事或核心信息
- ❌ 研究问题或目标过多
- ❌ 过度使用术语且没有定义
- ❌ 结果缺乏背景或解释
- ❌ 缺少作者联系信息

**技术错误**：
- ❌ 海报尺寸不符合会议要求
- ❌ 将 RGB 颜色发送给 CMYK 打印机（导致颜色偏移）
- ❌ PDF 中未嵌入字体
- ❌ 文件大小对于提交门户来说过大
- ❌ QR 码过小或未经测试

**最佳实践**：
- ✅ 生成简单的 AI 图形，最多包含 3-5 个元素
- ✅ 对图形中的关键数字使用超大字体（100pt+）
- ✅ 在每个 AI 提示词中指定“50% white space”
- ✅ 严格遵循会议的尺寸规格
- ✅ 在最终打印前，以缩小比例进行试印
- ✅ 使用高对比度且易于访问的配色方案
- ✅ 保持文字简洁且便于快速浏览
- ✅ 包含清晰的联系信息和 QR 码
- ✅ 仔细校对（错误在海报上会被放大！）

## 包安装

确保已安装所需的 LaTeX 包：

```bash
# For TeX Live (Linux/Mac)
tlmgr install beamerposter tikzposter baposter

# For MiKTeX (Windows)
# Packages typically auto-install on first use

# Additional recommended packages
tlmgr install qrcode graphics xcolor tcolorbox subcaption
```

## 脚本与自动化

`scripts/` 目录中提供的辅助脚本：

- `review_poster.sh`：海报审查与验证
- `generate_schematic.py`：生成科学图表和示意图

## 参考资料

- [references/ai_graphics_for_posters.md](references/ai_graphics_for_posters.md)：完整的 AI
  图形规则、各类型限制、经过实践的提示词示例以及审查关卡。
- [references/latex_poster_reference.md](references/latex_poster_reference.md)：宏包、
  布局、设计、尺寸、模板、图表、颜色、字体排版和二维码。
- [references/compilation_and_quality_control.md](references/compilation_and_quality_control.md)：
  编译引擎和完整的印前质量控制流程。
- [references/poster_patterns_and_presentation.md](references/poster_patterns_and_presentation.md)：
  内容模式、可访问性和展示技巧。
- [references/latex_poster_packages.md](references/latex_poster_packages.md)：beamerposter、tikzposter
  和 baposter 的详细比较及示例。
- [references/poster_layout_design.md](references/poster_layout_design.md)：布局
  原则、网格系统和视觉流。
- [references/poster_design_principles.md](references/poster_design_principles.md)：
  字体排版、色彩理论、视觉层次和可访问性。
- [references/poster_content_guide.md](references/poster_content_guide.md)：内容
  组织、写作风格和各章节的具体指导。

## 模板

`assets/` 目录中的可直接使用的海报模板：

- beamerposter 模板（经典、现代、彩色）
- tikzposter 模板（默认、光线、波浪、信封）
- baposter 模板（纵向、横向、极简）
- 来自各个科学领域的示例海报
- 配色方案定义和机构模板

加载这些模板，并根据具体的研究和会议要求进行定制。