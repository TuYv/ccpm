---
version: 0.12.0
name: higgsfield-brandkit
description: |
  Create and extend complete visual brand systems through the Higgsfield CLI and bundled deterministic local tooling: palettes, SVG logo marks, typography, mockups, social graphics, packaging, signage, merchandise, posters, presentation decks, and editable PPTX/PDF brandbooks. Preserves official supplied assets, persists approvals locally, and regenerates only dependent outputs. Use when: "create a brand kit", "make a visual identity", "design a logo and brandbook", "apply this logo to branded assets", "make packaging or signage", or "extend our existing branding". Chain with higgsfield-generate for general image production and Marketing Studio brand-kits when importing website metadata for ads. NOT for unbranded image generation (use higgsfield-generate), product catalog photography (use higgsfield-product-photoshoot), website implementation (use higgsfield-websites), or native Figma/Canva/PSD/AI delivery.
argument-hint: "[brand brief or existing assets] [requested deliverables]"
allowed-tools: Bash
---
# Higgsfield 品牌套件

构建统一的品牌形象及其所需应用。将提供的品牌信息和官方资产视为固定约束。

## 初始化

1. 将 `SKILL_ROOT` 解析为此技能的安装目录，并创建一个持久化项目目录：

   ```bash
   BRANDKIT_WORKDIR="${PWD}/brandkit"
   BRANDKIT_STATE="${BRANDKIT_WORKDIR}/state.json"
   mkdir -p "${BRANDKIT_WORKDIR}"
   ```

2. 阅读[先决条件](references/prerequisites.md)。在需要使用工具的阶段之前检查相应工具。未经用户许可，绝不要安装系统软件包。
3. 如果缺少 `higgsfield`，只能在获得许可后安装：

   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```

4. 如果 `higgsfield account status` 因身份验证或工作区错误而失败，请用户运行 `higgsfield auth login` 或选择一个工作区，然后等待。
5. 在进行付费生成之前，检查实时模型契约：

   ```bash
   higgsfield model get recraft_v4_1 --json
   higgsfield model get seedream_v5_pro --json
   higgsfield model get gpt_image_2 --json
   ```

## CLI 映射

| 操作 | 命令 |
|---|---|
| 查找模型 | `higgsfield model get <model> --json` |
| 生成并轮询 | `higgsfield generate create <model> ... --wait --json` |
| 恢复任务 | `higgsfield generate wait <job_id> --json` |
| 上传本地资产 | `higgsfield upload create <path> --json` |
| 导入网站元数据 | `higgsfield marketing-studio brand-kits fetch --url <url> --wait --json` |
| 读取/写入审批状态 | `python3 "$SKILL_ROOT/scripts/brandkit.py" state ...` |
| 渲染评审板 | `python3 "$SKILL_ROOT/scripts/brandkit.py" preview ...` |
| 检查选定的徽标 | `python3 "$SKILL_ROOT/scripts/brandkit.py" logo-inspect ...` |
| 导出徽标文件 | `python3 "$SKILL_ROOT/scripts/brandkit.py" logo-export ...` |
| 构建品牌手册 | `python3 "$SKILL_ROOT/scripts/brandkit.py" brandbook-build ...` |

通过 `--image` 传入的本地图像路径会自动上传。除非用户明确需要托管副本，否则应将 HTML、SVG、PPTX 和 PDF 交付物保留为本地项目文件。

## 面向用户的行为

- 使用与用户相同的语言。对设计思路推理、提示词、状态机制、脚本、模型查找和质量保证内部信息保密。
- 每个用户可见的生成批次最多发送一句简短的状态说明，然后保持安静，直到结果准备就绪。
- 仅针对尚未解决的阻塞性问题，一次性提出一组简洁的问题。绝不要重复已有信息，也不要为了局部任务强制用户填写完整的品牌形象问卷。
- 每次完成调色板、徽标、字体排印或下游内容的评审后，停止并等待用户正常反馈。
- 绝不要根据沉默、生成成功或你自己的偏好推断用户已批准。
- 原样保留用户提供的文案。绝不要虚构定位、价值观、声明、成分、价格、认证、统计数据或监管内容。

## 核心工作流程

1. **对请求进行分类。**
   - `apply-existing`：使用提供的官方资产，不对其进行重新设计。
   - `extend-partial`：仅创建所请求输出需要但尚缺失的内容。
   - `create-identity`：仅在用户明确请求时创建新徽标或品牌形象。
2. **读取状态。** 运行：

```bash
   python3 "$SKILL_ROOT/scripts/brandkit.py" state \
     --state-file "$BRANDKIT_STATE" --action get_status
   ```

   本地状态是持久化的。当状态文件存在时，绝不要粘贴、手动编辑或重新创建审批记录。
3. **执行需求收集和资产分析。** 阅读[需求收集](references/intake.md)、[资产分析](references/asset-analysis.md)、[状态路由](references/handoff.md)和[精确状态载荷](references/state-payloads.md)。立即锁定用户声明的每个官方徽标、调色板和字体槽位。
4. **创建品牌锁定。** 阅读[品牌锁定](references/brand-lock.md)。记录准确拼写、官方资产、颜色、字体、布局/形状规则、请求的输出以及禁止的处理方式。
5. **仅要求输出所使用的槽位。**
   - 仅徽标 → 新标志需要调色板 + 徽标；现有标志只需官方徽标
   - 仅调色板 → 调色板
   - 仅字体 → 字体
   - 无文案样机/商品 → 徽标；仅在颜色/应用需要时添加调色板
   - 包含文本的社交媒体图形/包装/海报/标牌 → 徽标 + 调色板 + 字体
   - 品牌手册/演示文稿 → 徽标 + 调色板 + 字体
6. **构建缺失的基础槽位。** 阅读[设计大脑](references/brandkit-design-brain.md)、[概念板](references/concept-boards.md)、[内联评审](references/inline-widgets.md)，以及仅按需阅读[调色板](references/palette.md)、[徽标](references/logo.md)或[字体](references/typography.md)模块。
7. **继续执行原始请求**，一旦其所需槽位获批。绝不要再次要求用户选择范围。
8. **仅加载请求的制作模块：**
   - [样机](references/mockups.md)
   - [社交媒体图形](references/social-templates.md)
   - [海报/横幅](references/posters-banners.md)
   - [包装](references/packaging.md)
   - [标牌](references/signage.md)
   - [商品](references/merchandise.md)
   - [演示文稿](references/presentation-deck.md)
   - [品牌手册](references/brandbook.md)
9. **质量检查与审批。** 阅读[质量检查与迭代](references/qa-and-iteration.md)。仅修复未通过检查的输出。只有在获得明确批准后，才能保存下游元素，并记录其确切的基础依赖项。

## 新品牌标识流程

### 1. 调色板

使用[预览载荷](references/preview-payloads.md)，将 2–3 个精确的调色板选项渲染为确定性 HTML。展示 PNG 截图和可编辑的 HTML 文件，然后等待。生成徽标之前，使用 `approve_palette` 持久化所选调色板。

### 2. SVG 徽标图形

阅读[徽标提示词增强器](references/logo-prompt-enhancer.md)。制作恰好三个不同的纯符号机制，并为每个机制编写一条 Recraft 提示词。将每条长提示词写入文件并分别提交：

```bash
higgsfield generate create recraft_v4_1 \
  --model_type vector \
  --colors @"${BRANDKIT_WORKDIR}/logo-colors.json" \
  --background_color '#F7F7F5' \
  --aspect_ratio 1:1 \
  --resolution 2k \
  --wait --json < "${BRANDKIT_WORKDIR}/logo-candidate-1.txt"
```

直接使用返回的 SVG URL 进行审核。选定后，在不做任何修改的情况下检查该 SVG：

```bash
python3 "$SKILL_ROOT/scripts/brandkit.py" logo-inspect \
  --source "<selected Recraft SVG URL or absolute local path>"
```

使用 `approve_logo` 持久化保存准确的 job ID、SVG URL、name、palette revision，以及返回的规范几何指纹。

### 3. 字体排印

使用提供的字体或经过验证的 Google Fonts，提出 2–3 组独特的展示字体/正文字体搭配。通过预览脚本渲染真实的品牌名称和示例文案。仅使用 `approve_typography` 持久化保存选定的字体搭配。

交互式流程始终会在调色板、徽标和字体排印的选择环节暂停。明确的免提问模式可以选择并持久化保存调色板，但仍会展示全部三个 SVG 徽标候选方案，并暂停以等待用户选择徽标；绝不自行批准确切的品牌标志。

## 一致性不变量

- 在所有地方复用同一个已批准的徽标源。当可以进行确定性放置/导出时，绝不重新绘制官方或选定的 SVG。
- 生成的徽标依赖于创建它时所使用的 palette revision。更改该调色板会使生成的徽标及其依赖项失效；更改字体排印不会使符号标志失效。
- 更改某个基础 slot 时，仅使在 `required_slots` 中列出该 slot 的下游元素失效。
- 将相同的 Brand Lock 值复制到每个相关的生成提示词中：准确的十六进制颜色值、字体角色、形状语言、位置、净空区域、构图和禁止使用的处理方式。
- 仅使用 Recraft V4.1 矢量模式创建新的徽标标志。
- 使用 Seedream 作为主要的照片级真实感样机生成器。仅在添加可读文字或精确图形细节的受控阶段使用 GPT Image 2。
- 使用本地确定性 SVG/PPTX/HTML 构建来制作准确文案和可编辑版式。不要要求图像模型伪造可编辑文件。
- 不要承诺提供原生 Figma、Canva、PSD、AI 或 EPS 文件。

## 确定性脚本

在 `"$BRANDKIT_WORKDIR"` 下创建 JSON 输入文件；绝不要将用户文本直接插入 shell 参数中。

```bash
python3 "$SKILL_ROOT/scripts/brandkit.py" preview \
  --input "$BRANDKIT_WORKDIR/reviews.json" \
  --output-dir "$BRANDKIT_WORKDIR/reviews"

python3 "$SKILL_ROOT/scripts/brandkit.py" logo-export \
  --input "$BRANDKIT_WORKDIR/logo-export.json" \
  --output-dir "$BRANDKIT_WORKDIR/logo"

python3 "$SKILL_ROOT/scripts/brandkit.py" brandbook-build \
  --state-file "$BRANDKIT_STATE" \
  --input "$BRANDKIT_WORKDIR/brandbook.json" \
  --output-dir "$BRANDKIT_WORKDIR/brandbook"
```

对于徽标导出，请加载[徽标导出负载](references/logo-export-payloads.md)。对于品牌手册，仅使用随附的构建器；在确定性契约失败后，绝不要改用临时拼凑的 PowerPoint 或 PDF 生成器。

## 失败处理策略

- 对失败的 Recraft 或图像生成请求，使用相同的锁定概念和修正后的契约重试一次。第二次发生同等失败后停止。
- 如果预览或徽标导出失败两次，请报告具体错误；绝不要用临时的 SVG 重写来替代。
- 如果品牌手册模板、字体或转换契约失败，请立即停止。不要生成视觉效果不同的后备版本并将其称为规范版本。
- 如果无法保持准确的字体排印或官方徽标保真度，请披露该限制，而不是声称已完成。
- 绝不要在文件、日志或聊天中暴露原始身份验证令牌或凭据。

## 交付

对于 Brandbooks，请遵循 [brandbook](references/brandbook.md) 中严格的响应约定：仅提供 PPTX 链接/路径、PDF 链接/路径和字体安装警告。

对于其他输出，请返回：

1. 请求的视觉文件和预览。
2. 简洁的 Brand Lock 摘要。
3. 可编辑格式与扁平化格式标签。
4. 所需字体/导入限制。
5. 用于定向修订的稳定变体名称。

## 参考索引

- [前置条件](references/prerequisites.md) — 各阶段所需的本地依赖项和安装命令。
- [需求收集](references/intake.md) — 最少必要问题和输入路由。
- [资产分析](references/asset-analysis.md) — 官方/参考分类与测量。
- [状态路由](references/handoff.md) 和 [状态载荷](references/state-payloads.md) — 持久化审批。
- [Brand Lock](references/brand-lock.md) — 规范的视觉约束。
- [Design Brain](references/brandkit-design-brain.md) — 私有艺术指导。
- [概念板](references/concept-boards.md)、[预览载荷](references/preview-payloads.md) 和 [内联评审](references/inline-widgets.md) — 选择阶段。
- [Logo](references/logo.md)、[Logo 提示词增强器](references/logo-prompt-enhancer.md) 和 [Logo 导出载荷](references/logo-export-payloads.md) — SVG 生成和确定性变体。
- [调色板](references/palette.md) 和 [字体排印](references/typography.md) — 基础槽位。
- [样机](references/mockups.md)、[社交媒体图形](references/social-templates.md)、[海报/横幅](references/posters-banners.md)、[包装](references/packaging.md)、[标牌](references/signage.md) 和 [商品](references/merchandise.md) — 应用。
- [演示文稿](references/presentation-deck.md) 和 [Brandbooks](references/brandbook.md) — 可编辑文档。
- [QA 和迭代](references/qa-and-iteration.md) — 预检、修复、审批和交付清单。