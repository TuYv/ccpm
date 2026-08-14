---
name: plannotator-visual-explainer
disable-model-invocation: true
description: >
  Generate self-contained HTML visualizations with Plannotator theming. Use for implementation
  plans, PR explainers, architecture diagrams, data tables, slide decks, and any visual
  explanation of technical concepts. Plans and PR explainers follow Plannotator's prescriptive
  approach; all other visual content delegates to nicobailon/visual-explainer.
---
# Plannotator 可视化讲解器

根据内容类型分为三条路径。每条路径都有各自的参考资料和结构。

## 按内容类型选择路径

**实施计划、设计文档或提案** → 遵循[计划路径](#plan-path)。阅读 `references/design-system.md` 和 `references/svg-patterns.md`。采用规定结构。

**PR 讲解、差异审查或代码变更演练** → 遵循 [PR 路径](#pr-path)。阅读 `references/design-system.md` 和 `references/pr-components.md`。采用规定结构。

**其他所有内容**（架构图、数据表、幻灯片、项目回顾、常规可视化讲解）→ 遵循[可视化讲解器路径](#visual-explainer-path)。使用 Plannotator 主题令牌，委托给 nicobailon/visual-explainer。

## 交付

始终通过 Plannotator 的标注 UI 交付。请勿使用 `open` 或 `xdg-open`。

对于任何使用 Mermaid 的交付物，在打开标注 UI 之前，都必须使用 Mermaid 11 分别以浅色和深色
调色板渲染每张图。渲染是一道强制门禁：出现异常、
空 SVG，或 `aria-roledescription="error"`、`Syntax error in text`
等错误输出，都意味着讲解内容不可交付。修复图表或主题配置，并重新使用两种
调色板运行，直到每个 SVG 都通过检查。

**计划/提案**（用户应批准/拒绝）：
```bash
plannotator annotate <file> --gate
```

**其他所有内容**（信息性）：
```bash
plannotator annotate <file>
```

---

## 计划路径

适用于实施计划、设计文档、功能规格、迁移指南和提案。

**生成前请阅读：**
1. `references/design-system.md` — Plannotator 主题令牌、排版和组件模式
2. `references/svg-patterns.md` — 用于架构图、流程图和数据流的内联 SVG 构建块

**文档结构（按顺序，选择适用的部分）：**

1. **页眉** — 眉题标签（等宽字体、大写）、标题（衬线字体、大字号）、提示框（原始需求）
2. **摘要条** — 3-5 个统计卡片，一览关键数字（组件、端点、表等）
3. **里程碑/时间线** — 展示各阶段但不包含时间估算的垂直时间线。阶段用于展示顺序和依赖关系，而非持续时间。
4. **架构/数据流** — 内联 SVG 图。用于存在 3 个或更多交互组件的情况。使用高亮方框表示新组件，使用虚线箭头表示异步路径。
5. **模型图** — 直接使用 HTML/CSS 构建 UI 模型，而不是用文字描述
6. **关键代码** — 带有语法高亮的深色主题代码块。仅展示具有架构重要性的接口/模式，而非每个函数。
7. **风险与缓解措施** — 带有严重程度徽章（高/中/低）的表格
8. **待决问题** — 带有决策负责人信息的提示卡片（“与后端团队共同决定”）

并非每个计划都需要包含每个部分。跳过对内容没有帮助的部分。绝不包含时间估算、样板章节或详尽的文件列表。

**根据任务进行调整：** 后端 → 以数据流开篇。前端 → 以模型图开篇。重构 → 以变更前后对比图开篇。基础设施 → 以架构开篇。

**质量标准：** 阅读者应能在 30 秒内从方案中了解“做什么、为什么做以及如何做”。留白本身就是一种功能——每个视口只呈现一个核心概念。

---

## PR 路径

适用于 PR 演示、差异审查、代码变更说明和审查者指南。

**生成前，请阅读：**
1. `references/design-system.md` —— Plannotator 主题令牌、排版和组件模式
2. `references/pr-components.md` —— 差异渲染、审查评论气泡、风险标签、文件卡片和前后对比面板

**文档结构（按顺序，选择适用部分）：**

1. **页眉** —— PR 标题、元信息栏（文件数量、增删行数、分支、作者）
2. **概要** —— 带有主强调色左边框的卡片。使用 2-3 个句子。即使读者只看到这一部分，也应能理解要点。
3. **原因** —— 动机和前后对比（双列网格）
4. **文件导览** —— 每个文件对应一张可折叠卡片。每张卡片包含：文件路径 + 标记（NEW/MOD/DEL）+ 行数统计、一段解释“为什么”的文字，以及重要的差异片段。高风险文件默认展开，安全文件默认折叠。
5. **风险图** —— 使用可视化标签展示哪些文件需要仔细审查，哪些只是机械性变更。分为三个级别：需注意（破坏性）、中等（警告）、安全（成功）。
6. **重点关注位置** —— 带编号的提示卡片。每张卡片指出一个文件/函数，并说明需要关注的问题。
7. **测试计划** —— 复选框样式的验证清单
8. **发布**（如适用）—— 使用功能开关进行分阶段部署

通过 CDN 使用 Pierre 差异组件呈现带语法高亮的行内差异——具体模式参见 `references/pr-components.md`。

---

## 可视化讲解路径

适用于架构图、数据表、幻灯片、项目回顾、对比分析及其他任何可视化说明。

**生成前：**

1. 确保已安装 `visual-explainer`：
   - 检查：`~/.claude/skills/visual-explainer/SKILL.md` 或 `~/.agents/skills/visual-explainer/SKILL.md`
   - 如果未找到：`npx skills add nicobailon/visual-explainer -g --yes`
2. 阅读 visual-explainer 的 `SKILL.md`（工作流、图表类型、反粗制滥造规则）
3. 阅读与你的内容类型相关的 visual-explainer 参考资料和模板
4. 阅读 `references/theme-override.md` —— 使用 Plannotator 令牌替换 Nico 的调色板

遵循 visual-explainer 的结构、组件类（`.ve-card`、`.kpi-card`、`.pipeline`）和反粗制滥造规则。唯一的覆盖项是颜色/排版层——使用 Plannotator 令牌，而不是 Nico 的自定义调色板。

---

## 设计理念（适用于所有路径）

- **留白本身就是一种功能。** 使用宽裕的内边距和较大的章节间距。如果看起来拥挤，应增加空间，而不是缩小文字。
- **每个视口只呈现一个核心概念。** 先是主视觉部分，然后是图表，最后是细节网格——不要把所有内容都挤在一起。
- **展示，而非描述。** 时间线用于展示顺序。图表用于展示关系。代码块用于展示接口。
- **不要提供时间估算。** 时间线只展示阶段和依赖关系。绝不附加小时数或天数估算。