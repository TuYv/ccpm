---
name: document-skills/pptx
version: "1.0.0"
brand: AgentKits Marketing by AityTech
category: document
difficulty: intermediate
description: "Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"
license: Proprietary. LICENSE.txt has complete terms
triggers:
  - PowerPoint
  - PPTX
  - presentation
  - slides
  - create presentation
prerequisites: []
related_skills:
  - document-skills/docx
  - document-skills/pdf
agents:
  - docs-manager
  - sales-enabler
mcp_integrations:
  optional: []
success_metrics: []
---
# PPTX 创建、编辑与分析

## 语言与质量标准

**关键要求**：使用与用户相同的语言回复。如果用户使用越南语，则使用越南语回复。如果用户使用西班牙语，则使用西班牙语回复。

**标准**：提高 Token 效率，为简洁而牺牲语法完整性，在末尾列出未解决的问题。

---

## 概述

用户可能会要求你创建、编辑或分析 .pptx 文件的内容。.pptx 文件本质上是一个 ZIP 压缩包，其中包含可供读取或编辑的 XML 文件及其他资源。针对不同的任务，你可以使用不同的工具和工作流程。

## 读取和分析内容

### 文本提取
如果只需读取演示文稿中的文本内容，应将文档转换为 Markdown：

```bash
# Convert document to markdown
python -m markitdown path-to-file.pptx
```

### 访问原始 XML
以下内容需要访问原始 XML：批注、演讲者备注、幻灯片版式、动画、设计元素以及复杂格式。对于其中任何一种功能，都需要解压演示文稿并读取其原始 XML 内容。

#### 解压文件
`python ooxml/scripts/unpack.py <office_file> <output_dir>`

**注意**：unpack.py 脚本位于相对于项目根目录的 `skills/pptx/ooxml/scripts/unpack.py`。如果该路径下不存在此脚本，请使用 `find . -name "unpack.py"` 查找它。

#### 关键文件结构
* `ppt/presentation.xml` - 演示文稿的主要元数据和幻灯片引用
* `ppt/slides/slide{N}.xml` - 各张幻灯片的内容（slide1.xml、slide2.xml 等）
* `ppt/notesSlides/notesSlide{N}.xml` - 每张幻灯片的演讲者备注
* `ppt/comments/modernComment_*.xml` - 特定幻灯片的批注
* `ppt/slideLayouts/` - 幻灯片版式模板
* `ppt/slideMasters/` - 幻灯片母版模板
* `ppt/theme/` - 主题和样式信息
* `ppt/media/` - 图像和其他媒体文件

#### 字体排印与颜色提取
**当提供了需要仿照的设计示例时**：始终先使用以下方法分析演示文稿的字体排印和颜色：
1. **读取主题文件**：检查 `ppt/theme/theme1.xml` 中的颜色（`<a:clrScheme>`）和字体（`<a:fontScheme>`）
2. **对幻灯片内容进行采样**：检查 `ppt/slides/slide1.xml` 中实际使用的字体（`<a:rPr>`）和颜色
3. **搜索模式**：使用 grep 在所有 XML 文件中查找颜色（`<a:solidFill>`、`<a:srgbClr>`）和字体引用

## **不使用模板**创建新的 PowerPoint 演示文稿

从头创建新的 PowerPoint 演示文稿时，使用 **html2pptx** 工作流程将 HTML 幻灯片转换为定位精确的 PowerPoint 演示文稿。

### 设计原则

**关键要求**：在创建任何演示文稿之前，分析内容并选择合适的设计元素：
1. **考虑主题内容**：本演示文稿讲述什么内容？它体现了什么样的基调、行业或氛围？
2. **检查品牌信息**：如果用户提及某家公司或组织，应考虑其品牌颜色和品牌标识
3. **使配色方案与内容相符**：选择能够反映主题的颜色
4. **说明你的方法**：在编写代码之前解释你的设计选择

**要求**：
- ✅ 在编写代码之前，先说明基于内容制定的设计方法
- ✅ 仅使用网页安全字体：Arial、Helvetica、Times New Roman、Georgia、Courier New、Verdana、Tahoma、Trebuchet MS、Impact
- ✅ 通过字号、字重和颜色建立清晰的视觉层级
- ✅ 确保可读性：对比度强、文字大小合适、对齐整洁
- ✅ 保持一致性：在各张幻灯片中重复使用统一的模式、间距和视觉语言

#### 调色板选择

**创造性地选择颜色**：
- **跳出默认思维**：哪些颜色真正符合这个特定主题？避免凭惯性选择颜色。
- **从多个角度考虑**：主题、行业、氛围、活力程度、目标受众、品牌识别（如有提及）
- **大胆尝试**：尝试意想不到的组合——医疗保健演示文稿不一定非得用绿色，金融演示文稿也不一定非得用海军蓝
- **构建你的调色板**：选择 3-5 种能够和谐搭配的颜色（主色 + 辅助色调 + 强调色）
- **确保对比度**：文字在背景上必须清晰易读

**调色板示例**（用这些示例激发创意——选择其中一种、对其进行调整，或创建自己的调色板）：

1. **经典蓝**：深海军蓝 (#1C2833)、板岩灰 (#2E4053)、银色 (#AAB7B8)、灰白色 (#F4F6F6)
2. **青色与珊瑚色**：青色 (#5EA8A7)、深青色 (#277884)、珊瑚色 (#FE4447)、白色 (#FFFFFF)
3. **大胆红色**：红色 (#C0392B)、亮红色 (#E74C3C)、橙色 (#F39C12)、黄色 (#F1C40F)、绿色 (#2ECC71)
4. **暖调腮红色**：淡紫褐色 (#A49393)、腮红色 (#EED6D3)、玫瑰色 (#E8B4B8)、奶油色 (#FAF7F2)
5. **奢华勃艮第红**：勃艮第红 (#5D1D2E)、深红色 (#951233)、铁锈色 (#C15937)、金色 (#997929)
6. **深紫色与祖母绿**：紫色 (#B165FB)、深蓝色 (#181B24)、祖母绿 (#40695B)、白色 (#FFFFFF)
7. **奶油色与森林绿**：奶油色 (#FFE1C7)、森林绿 (#40695B)、白色 (#FCFCFC)
8. **粉色与紫色**：粉色 (#F8275B)、珊瑚色 (#FF574A)、玫瑰色 (#FF737D)、紫色 (#3D2F68)
9. **酸橙绿与李子色**：酸橙绿 (#C5DE82)、李子色 (#7C3A5F)、珊瑚色 (#FD8C6E)、蓝灰色 (#98ACB5)
10. **黑色与金色**：金色 (#BF9A4A)、黑色 (#000000)、奶油色 (#F4F6F6)
11. **鼠尾草绿与赤陶色**：鼠尾草绿 (#87A96B)、赤陶色 (#E07A5F)、奶油色 (#F4F1DE)、炭灰色 (#2C2C2C)
12. **炭灰色与红色**：炭灰色 (#292929)、红色 (#E33737)、浅灰色 (#CCCBCB)
13. **活力橙色**：橙色 (#F96D00)、浅灰色 (#F2F2F2)、炭灰色 (#222831)
14. **森林绿**：黑色 (#191A19)、绿色 (#4E9F3D)、深绿色 (#1E5128)、白色 (#FFFFFF)
15. **复古彩虹色**：紫色 (#722880)、粉色 (#D72D51)、橙色 (#EB5C18)、琥珀色 (#F08800)、金色 (#DEB600)
16. **复古大地色**：芥末黄 (#E3B448)、鼠尾草绿 (#CBD18F)、森林绿 (#3A6B35)、奶油色 (#F4F1DE)
17. **海岸玫瑰色**：旧玫瑰色 (#AD7670)、海狸棕 (#B49886)、蛋壳色 (#F3ECDC)、灰绿色 (#BFD5BE)
18. **橙色与绿松石色**：浅橙色 (#FC993E)、灰调绿松石色 (#667C6F)、白色 (#FCFCFC)

#### 视觉细节选项

**几何图案**：
- 使用对角线分区线代替水平分区线
- 使用不对称的列宽（30/70、40/60、25/75）
- 将文本标题旋转 90° 或 270°
- 为图像使用圆形/六边形边框
- 在角落使用三角形强调形状
- 使用重叠形状营造纵深感

**边框与框架处理**：
- 仅在一侧使用粗单色边框（10-20pt）
- 使用对比色的双线边框
- 使用角括号代替完整边框
- L 形边框（顶部+左侧或底部+右侧）
- 标题下方的下划线强调装饰（3-5pt 粗）

**字体排印处理**：
- 极端的字号对比（72pt 标题与 11pt 正文）
- 使用宽字间距的全大写标题
- 使用超大展示字体呈现编号章节
- 数据/统计信息/技术内容使用等宽字体（Courier New）
- 密集信息使用窄体字体（Arial Narrow）
- 使用描边文字进行强调

**图表与数据样式**：
- 使用单一强调色突出关键数据的单色图表
- 使用水平条形图而非垂直条形图
- 使用点图而非条形图
- 使用最少的网格线或完全不使用网格线
- 直接在元素上添加数据标签（不使用图例）
- 使用超大数字呈现关键指标

**布局创新**：
- 带文字叠加层的全出血图像
- 用于导航/上下文信息的侧边栏列（宽度为 20-30%）
- 模块化网格系统（3×3、4×4 区块）
- Z 型或 F 型内容流
- 悬浮在彩色形状上的文本框
- 杂志风格的多栏布局

**背景处理**：
- 占据幻灯片 40-60% 面积的纯色区块
- 渐变填充（仅限垂直或对角线方向）
- 分割背景（两种颜色，采用对角线或垂直分割）
- 从一侧边缘延伸至另一侧边缘的色带
- 将负空间作为设计元素

### 布局技巧
**创建包含图表或表格的幻灯片时：**
- **双栏布局（首选）**：使用横跨整个宽度的标题，下方分为两栏——一栏放置文本/项目符号，另一栏放置重点内容。这样能够提供更好的平衡，并使图表/表格更易于阅读。使用宽度不等的 flexbox 双栏（例如 40%/60% 分割），以便针对每种内容类型优化空间。
- **全幻灯片布局**：让重点内容（图表/表格）占据整张幻灯片，以获得最大的视觉冲击力和可读性
- **切勿垂直堆叠**：不要在单栏中将图表/表格放在文本下方——这会导致可读性差和布局问题

### 工作流程
1. **强制要求——阅读整个文件**：从头到尾完整阅读 [`html2pptx.md`](html2pptx.md)。**读取此文件时，切勿设置任何范围限制。** 在开始创建演示文稿之前，请阅读完整文件内容，以了解详细语法、关键格式规则和最佳实践。
2. 为每张幻灯片创建一个具有正确尺寸的 HTML 文件（例如，16:9 使用 720pt × 405pt）
   - 所有文本内容均使用 `<p>`、`<h1>`-`<h6>`、`<ul>`、`<ol>`
   - 对将要添加图表/表格的区域使用 `class="placeholder"`（使用灰色背景渲染，以确保可见）
   - **关键要求**：首先使用 Sharp 将渐变和图标栅格化为 PNG 图像，然后在 HTML 中引用
   - **布局**：对于包含图表/表格/图像的幻灯片，请使用全幻灯片布局或双栏布局，以提高可读性
3. 使用 [`html2pptx.js`](scripts/html2pptx.js) 库创建并运行 JavaScript 文件，将 HTML 幻灯片转换为 PowerPoint 并保存演示文稿
   - 使用 `html2pptx()` 函数处理每个 HTML 文件
   - 使用 PptxGenJS API 将图表和表格添加到占位区域
   - 使用 `pptx.writeFile()` 保存演示文稿
4. **视觉验证**：生成缩略图并检查布局问题
   - 创建缩略图网格：`python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4`
   - 查看并仔细检查缩略图图像是否存在以下问题：
     - **文本截断**：文本被标题栏、形状或幻灯片边缘截断
     - **文本重叠**：文本与其他文本或形状重叠
     - **定位问题**：内容过于靠近幻灯片边界或其他元素
     - **对比度问题**：文本与背景之间的对比度不足
   - 如果发现问题，请调整 HTML 的边距/间距/颜色，并重新生成演示文稿
   - 重复此过程，直到所有幻灯片在视觉上均正确无误

## 编辑现有 PowerPoint 演示文稿

编辑现有 PowerPoint 演示文稿中的幻灯片时，需要使用原始 Office Open XML（OOXML）格式。这包括解压 .pptx 文件、编辑 XML 内容，然后重新打包。

### 工作流程
1. **强制要求——阅读整个文件**：从头到尾完整阅读 [`ooxml.md`](ooxml.md)（约 500 行）。**读取此文件时绝不要设置任何范围限制。** 在对演示文稿进行任何编辑之前，请阅读完整的文件内容，以获取有关 OOXML 结构和编辑工作流程的详细指导。
2. 解压演示文稿：`python ooxml/scripts/unpack.py <office_file> <output_dir>`
3. 编辑 XML 文件（主要是 `ppt/slides/slide{N}.xml` 及相关文件）
4. **关键要求**：每次编辑后立即进行验证，并在继续操作之前修复所有验证错误：`python ooxml/scripts/validate.py <dir> --original <file>`
5. 打包最终演示文稿：`python ooxml/scripts/pack.py <input_directory> <office_file>`

## **使用模板**创建新的 PowerPoint 演示文稿

当需要创建遵循现有模板设计的演示文稿时，需要先复制并重新排列模板幻灯片，然后替换占位符内容。

### 工作流程
1. **提取模板文本并创建可视化缩略图网格**：
   * 提取文本：`python -m markitdown template.pptx > template-content.md`
   * 阅读 `template-content.md`：阅读整个文件，以了解模板演示文稿的内容。**读取此文件时绝不要设置任何范围限制。**
   * 创建缩略图网格：`python scripts/thumbnail.py template.pptx`
   * 有关更多详细信息，请参阅[创建缩略图网格](#creating-thumbnail-grids)部分

2. **分析模板并将清单保存到文件**：
   * **视觉分析**：查看缩略图网格，以了解幻灯片布局、设计模式和视觉结构
   * 创建模板清单文件并保存到 `template-inventory.md`，内容如下：
     ```markdown
     # Template Inventory Analysis
     **Total Slides: [count]**
     **IMPORTANT: Slides are 0-indexed (first slide = 0, last slide = count-1)**

     ## [Category Name]
     - Slide 0: [Layout code if available] - Description/purpose
     - Slide 1: [Layout code] - Description/purpose
     - Slide 2: [Layout code] - Description/purpose
     [... EVERY slide must be listed individually with its index ...]
     ```
   * **使用缩略图网格**：参考可视化缩略图来识别：
     - 布局模式（标题幻灯片、内容布局、章节分隔页）
     - 图像占位符的位置和数量
     - 各幻灯片组之间的设计一致性
     - 视觉层级和结构
   * 下一步选择合适的模板时，必须使用此清单文件

3. **根据模板清单创建演示文稿大纲**：
   * 查看第 2 步中可用的模板。
   * 为第一张幻灯片选择一个引言或标题模板。它应当是最前面的模板之一。
   * 为其他幻灯片选择安全的、以文本为主的布局。
   * **关键要求：使布局结构与实际内容相匹配**：
     - 单栏布局：用于统一叙述或单一主题
     - 双栏布局：仅当恰好有 2 个不同的项目/概念时使用
     - 三栏布局：仅当恰好有 3 个不同的项目/概念时使用
     - 图像 + 文本布局：仅当有实际图像要插入时使用
     - 引用布局：仅用于人物的真实引语（并注明出处），绝不要用于强调
     - 绝不要使用占位符数量多于内容数量的布局
     - 如果有 2 个项目，不要强行将它们放入三栏布局
     - 如果有 4 个或更多项目，请考虑拆分为多张幻灯片或使用列表格式
   * 在选择布局之前，先计算实际内容块的数量
   * 确保所选布局中的每个占位符都会填入有意义的内容
   * 为每个内容部分选择一个代表**最佳**布局的选项。
   * 保存包含内容和模板映射的 `outline.md`，充分利用可用设计
   * 模板映射示例：
      ```
      # Template slides to use (0-based indexing)
      # WARNING: Verify indices are within range! Template with 73 slides has indices 0-72
      # Mapping: slide numbers from outline -> template slide indices
      template_mapping = [
          0,   # Use slide 0 (Title/Cover)
          34,  # Use slide 34 (B1: Title and body)
          34,  # Use slide 34 again (duplicate for second B1)
          50,  # Use slide 50 (E1: Quote)
          54,  # Use slide 54 (F2: Closing + Text)
      ]
      ```

4. **使用 `rearrange.py` 复制、重新排序和删除幻灯片**：
   * 使用 `scripts/rearrange.py` 脚本创建一个新演示文稿，并按所需顺序排列幻灯片：
     ```bash
     python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52
     ```
   * 该脚本会自动处理重复幻灯片的复制、未使用幻灯片的删除以及幻灯片的重新排序
   * 幻灯片索引从 0 开始（第一张幻灯片为 0，第二张为 1，依此类推）
   * 同一个幻灯片索引可以出现多次，以复制该幻灯片

5. **使用 `inventory.py` 脚本提取所有文本**：
   * **运行清单提取**：
     ```bash
     python scripts/inventory.py working.pptx text-inventory.json
     ```
   * **读取 text-inventory.json**：读取整个 text-inventory.json 文件，以了解所有形状及其属性。**读取此文件时，绝不要设置任何范围限制。**

   * 清单 JSON 结构：
      ```json
        {
          "slide-0": {
            "shape-0": {
              "placeholder_type": "TITLE",  // or null for non-placeholders
              "left": 1.5,                  // position in inches
              "top": 2.0,
              "width": 7.5,
              "height": 1.2,
              "paragraphs": [
                {
                  "text": "Paragraph text",
                  // Optional properties (only included when non-default):
                  "bullet": true,           // explicit bullet detected
                  "level": 0,               // only included when bullet is true
                  "alignment": "CENTER",    // CENTER, RIGHT (not LEFT)
                  "space_before": 10.0,     // space before paragraph in points
                  "space_after": 6.0,       // space after paragraph in points
                  "line_spacing": 22.4,     // line spacing in points
                  "font_name": "Arial",     // from first run
                  "font_size": 14.0,        // in points
                  "bold": true,
                  "italic": false,
                  "underline": false,
                  "color": "FF0000"         // RGB color
                }
              ]
            }
          }
        }
      ```

   * 主要特性：
     - **幻灯片**：命名为 "slide-0"、"slide-1" 等
     - **形状**：按视觉位置（从上到下、从左到右）排序，并命名为 "shape-0"、"shape-1" 等
     - **占位符类型**：TITLE、CENTER_TITLE、SUBTITLE、BODY、OBJECT 或 null
     - **默认字号**：从布局占位符中提取的以磅为单位的 `default_font_size`（如果可用）
     - **幻灯片编号会被过滤**：占位符类型为 SLIDE_NUMBER 的形状会自动从清单中排除
     - **项目符号**：当 `bullet: true` 时，始终会包含 `level`（即使其值为 0）
     - **间距**：以磅为单位的 `space_before`、`space_after` 和 `line_spacing`（仅在已设置时包含）
     - **颜色**：`color` 表示 RGB 颜色（例如 "FF0000"），`theme_color` 表示主题颜色（例如 "DARK_1"）
     - **属性**：输出中仅包含非默认值

6. **生成替换文本并将数据保存到 JSON 文件**
   根据上一步中的文本清单：
   - **关键**：首先确认清单中存在哪些形状——只引用实际存在的形状
   - **验证**：replace.py 脚本将验证替换 JSON 中的所有形状是否都存在于清单中
     - 如果引用了不存在的形状，将收到一条显示可用形状的错误消息
     - 如果引用了不存在的幻灯片，将收到一条指出该幻灯片不存在的错误消息
     - 在脚本退出之前，会一次性显示所有验证错误
   - **重要**：replace.py 脚本在内部使用 inventory.py 来识别所有文本形状
   - **自动清除**：除非为文本形状提供 "paragraphs"，否则清单中的所有文本形状都将被清除
   - 为需要内容的形状添加 "paragraphs" 字段（而不是 "replacement_paragraphs"）
   - 替换 JSON 中没有 "paragraphs" 的形状，其文本将被自动清除
   - 带项目符号的段落将自动左对齐。当 `"bullet": true` 时，不要设置 `alignment` 属性
   - 为占位文本生成适当的替换内容
   - 根据形状大小确定适当的内容长度
   - **关键**：包含原始清单中的段落属性——不要只提供文本
   - **重要**：当 bullet: true 时，不要在文本中包含项目符号（•、-、*）——它们会被自动添加
   - **必要的格式规则**：
     - 页眉/标题通常应设置 `"bold": true`
     - 列表项应设置 `"bullet": true, "level": 0`（当 bullet 为 true 时，level 为必填项）
     - 保留所有对齐属性（例如，居中文本使用 `"alignment": "CENTER"`）
     - 当字体属性与默认值不同时，应将其包含在内（例如，`"font_size": 14.0`、`"font_name": "Lora"`）
     - 颜色：RGB 颜色使用 `"color": "FF0000"`，主题颜色使用 `"theme_color": "DARK_1"`
     - 替换脚本需要**格式正确的段落**，而不仅仅是文本字符串
     - **重叠形状**：优先选择 default_font_size 较大或 placeholder_type 更合适的形状
   - 将包含替换内容的更新后清单保存到 `replacement-text.json`
   - **警告**：不同模板布局的形状数量不同——创建替换内容之前，始终检查实际清单

   展示正确格式的 paragraphs 字段示例：
   ```json
   "paragraphs": [
     {
       "text": "New presentation title text",
       "alignment": "CENTER",
       "bold": true
     },
     {
       "text": "Section Header",
       "bold": true
     },
     {
       "text": "First bullet point without bullet symbol",
       "bullet": true,
       "level": 0
     },
     {
       "text": "Red colored text",
       "color": "FF0000"
     },
     {
       "text": "Theme colored text",
       "theme_color": "DARK_1"
     },
     {
       "text": "Regular paragraph text without special formatting"
     }
   ]
   ```

**替换 JSON 中未列出的形状会被自动清空**：
   ```json
   {
     "slide-0": {
       "shape-0": {
         "paragraphs": [...] // This shape gets new text
       }
       // shape-1 and shape-2 from inventory will be cleared automatically
     }
   }
   ```

   **演示文稿中的常见格式模式**：
   - 标题幻灯片：文本加粗，有时居中
   - 幻灯片内的章节标题：文本加粗
   - 项目符号列表：每个项目都需要 `"bullet": true, "level": 0`
   - 正文文本：通常不需要特殊属性
   - 引用：可能具有特殊的对齐方式或字体属性

7. **使用 `replace.py` 脚本应用替换**
   ```bash
   python scripts/replace.py working.pptx replacement-text.json output.pptx
   ```

   该脚本将：
   - 首先使用 inventory.py 中的函数提取所有文本形状的清单
   - 验证替换 JSON 中的所有形状是否都存在于清单中
   - 清空清单中标识出的所有形状内的文本
   - 仅将新文本应用于替换 JSON 中定义了 "paragraphs" 的形状
   - 通过应用 JSON 中的段落属性来保留格式
   - 自动处理项目符号、对齐方式、字体属性和颜色
   - 保存更新后的演示文稿

   验证错误示例：
   ```
   ERROR: Invalid shapes in replacement JSON:
     - Shape 'shape-99' not found on 'slide-0'. Available shapes: shape-0, shape-1, shape-4
     - Slide 'slide-999' not found in inventory
   ```

   ```
   ERROR: Replacement text made overflow worse in these shapes:
     - slide-0/shape-2: overflow worsened by 1.25" (was 0.00", now 1.25")
   ```

## 创建缩略图网格

如需创建 PowerPoint 幻灯片的可视化缩略图网格，以便快速分析和参考：

```bash
python scripts/thumbnail.py template.pptx [output_prefix]
```

**功能**：
- 创建：`thumbnails.jpg`（对于大型演示文稿，则创建 `thumbnails-1.jpg`、`thumbnails-2.jpg` 等）
- 默认：5 列，每个网格最多 30 张幻灯片（5×6）
- 自定义前缀：`python scripts/thumbnail.py template.pptx my-grid`
  - 注意：如果希望输出到特定目录，输出前缀应包含路径（例如 `workspace/my-grid`）
- 调整列数：`--cols 4`（范围：3-6，会影响每个网格包含的幻灯片数量）
- 网格限制：3 列 = 每个网格 12 张幻灯片，4 列 = 20 张，5 列 = 30 张，6 列 = 42 张
- 幻灯片从零开始编号（幻灯片 0、幻灯片 1，依此类推）

**使用场景**：
- 模板分析：快速了解幻灯片布局和设计模式
- 内容审查：直观浏览整个演示文稿
- 导航参考：通过视觉外观查找特定幻灯片
- 质量检查：验证所有幻灯片的格式是否正确

**示例**：
```bash
# Basic usage
python scripts/thumbnail.py presentation.pptx

# Combine options: custom name, columns
python scripts/thumbnail.py template.pptx analysis --cols 4
```

## 将幻灯片转换为图像

如需对 PowerPoint 幻灯片进行可视化分析，请使用以下两步流程将其转换为图像：

1. **将 PPTX 转换为 PDF**：
   ```bash
   soffice --headless --convert-to pdf template.pptx
   ```

2. **将 PDF 页面转换为 JPEG 图像**：
   ```bash
   pdftoppm -jpeg -r 150 template.pdf slide
   ```
   这会创建 `slide-1.jpg`、`slide-2.jpg` 等文件。

选项：
- `-r 150`：将分辨率设置为 150 DPI（可调整以平衡质量与文件大小）
- `-jpeg`：输出为 JPEG 格式（如果需要，也可使用 `-png` 输出 PNG）
- `-f N`：要转换的起始页（例如，`-f 2` 从第 2 页开始）
- `-l N`：要转换的结束页（例如，`-l 5` 在第 5 页结束）
- `slide`：输出文件的前缀

指定页面范围的示例：
```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 template.pdf slide  # Converts only pages 2-5
```

## 代码风格指南
**重要**：生成用于 PPTX 操作的代码时：
- 编写简洁的代码
- 避免冗长的变量名和重复操作
- 避免不必要的打印语句

## 依赖项

必需的依赖项（应该已经安装）：

- **markitdown**：`pip install "markitdown[pptx]"`（用于从演示文稿中提取文本）
- **pptxgenjs**：`npm install -g pptxgenjs`（用于通过 html2pptx 创建演示文稿）
- **playwright**：`npm install -g playwright`（用于在 html2pptx 中渲染 HTML）
- **react-icons**：`npm install -g react-icons react react-dom`（用于图标）
- **sharp**：`npm install -g sharp`（用于 SVG 栅格化和图像处理）
- **LibreOffice**：`sudo apt-get install libreoffice`（用于转换 PDF）
- **Poppler**：`sudo apt-get install poppler-utils`（用于通过 pdftoppm 将 PDF 转换为图像）
- **defusedxml**：`pip install defusedxml`（用于安全解析 XML）