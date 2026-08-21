---
name: moai-domain-design-dna
description: >
  Reverse-engineer a reference design — a screenshot, an image set, or a live
  URL — into a portable Design DNA JSON across three dimensions (measurable
  tokens, qualitative style, special-rendering effects), then generate a new
  self-contained artifact from that JSON. Carries the extraction rules
  (dominance-based colour roles, relative radius measurement, multi-reference
  conflict resolution), a performance-tier technology map for Canvas / WebGL /
  shader / scroll effects, and a delivery gate covering contrast, reduced
  motion, and animation-loop hygiene.

when_to_use: >
  Use when someone points at an existing design and wants its look captured or
  reproduced — "build this in the same style as this screenshot", "extract the
  design tokens from this site", "make a page that feels like this reference" —
  or when a Design DNA JSON already exists and a new artifact must be generated
  from it. Not for report rendering (moai-domain-html-report), static diagrams
  (moai-domain-svg-infographic), or charts (dataviz).

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, WebFetch, Bash
user-invocable: true
metadata:
  version: "1.0.0"
  category: domain
  status: active
  related-skills: moai-ref-ui-polish, moai-domain-html-report, moai-domain-svg-infographic
---
# 设计 DNA

大多数“让它看起来像这样”的请求都会以同样的方式失败：只看一次参考对象，形成一个印象，然后凭记忆将这个印象编码实现。最终保留下来的只是一种模糊的相似感——配色发生偏移，节奏趋于平淡，而赋予参考对象独特个性的那个效果则完全缺失。

此技能在观察与构建之间插入了一个产物。首先将参考对象解构为一份 **设计 DNA JSON**，随后仅使用该 JSON 进行生成。正是这个中间步骤使结果变得可检查：输出中的每一种颜色、每一个圆角半径和每一条缓动曲线，都可以追溯到一个已记录的字段，因此不匹配可以通过差异对比来判断，而不再是关于审美的争论。

> **来源**：三维分类法和若干提取规则改编自采用 MIT 许可证的
> `zanwei/design-dna` 技能。保留的版权声明见
> `.claude/rules/moai/NOTICE.md`。

## 三个维度

之所以需要进行这种划分，是因为这三个维度的提取方式不同，出错方式也不同。

| 维度 | 包含的内容 | 获取方式 |
|---|---|---|
| `design_system` | 可以被**测量**的内容——颜色十六进制值、字号比例、间距基础单位、圆角半径、层级高度、动效时长、组件模式 | 从参考对象中采样和测量；数值型 |
| `design_style` | 可以被**感知**的内容——氛围、装饰程度、构图策略、留白理念、交互个性、微文案语气 | 整体判断；使用描述性词语，而非数字 |
| `visual_effects` | **无法用纯 CSS 表达**的内容——Canvas 场景、WebGL / 3D、着色器、粒子系统、滚动驱动动效、光标行为、玻璃拟态 | 有源代码时从源代码中读取，否则根据截图描述 |

将它们合并会导致双向的信息丢失。只有令牌清单而没有风格维度，只能复现颜色，却无法复现任何个性；只有情绪板而没有系统维度，只能复现氛围，却无法让任何两个元素对齐。

逐字段 schema 和枚举词汇表：`references/dna-schema.md`。

## 阶段 1——结构

当请求针对 schema 本身（“设计档案包含什么？”）时，读取 `references/dna-schema.md`，展示三个维度及其字段组，并在开始提取前询问是否需要扩展或移除任何维度。

## 阶段 2——分析（参考对象 → DNA JSON）

首先读取 `references/dna-schema.md`，然后逐个处理参考对象。

- **图像或截图** → 直接读取并分析其视觉属性。
- **URL** → 获取页面。优先使用源代码：`<canvas>` 元素、WebGL 上下文、动画库导入、自定义着色器、`IntersectionObserver` 滚动触发器和 SVG `<animate>` 都是*明确陈述*的事实，而截图只能支持推断。
- **视频或交互录屏** → 这是获取动效时长、滚动编排和过渡个性的唯一可靠来源。

### 提取规则

1. **颜色角色根据主导程度而非色相分配。** 主色是占据最大面积的颜色，次色是起支撑作用的表面颜色，强调色则是承载行动号召的颜色。将中性色阶映射为一个有序渐变，范围从最浅的背景色到最深的文本色。
2. **相对测量圆角半径。** 根据承载圆角的元素高度来记录圆角——一旦按钮尺寸发生变化，绝对值 `12px` 就失去了意义，而“控件高度的一半”在缩放后依然成立。嵌套表面的同心圆角规则属于 `moai-ref-ui-polish`；不要在此处重复说明，而应在那里应用。
3. **根据比例推断字号比例**，而不是根据绝对尺寸。标题与正文的比例以及行高节奏可以跨视口迁移；像素尺寸则不能。
4. **密度就是邻近程度。** 根据元素间隙相对于基础单位的大小判断间距，并根据这些间隙在各区段之间是保持不变还是逐步增大，判断区段节奏。
5. **当参考对象相互冲突时，记录主导模式并注明变体。** 对两个参考对象取平均值，会产生一种两者都不具备的设计。
6. **填写每一个字段。** 空字符串与“未查看”无法区分。如果参考对象确实没有涉及某个字段，请在值中明确说明——显式的“未观察到”是数据；空白则是缺口。
7. **参考对象中不存在的效果应设置为 `enabled: false`。** 这是禁止凭空添加的规则，而且至关重要：未设置的标志会诱使生成器添加一个无人要求的粒子场。
8. **无法识别的内容放入 `composite_notes`。** 截图可以显示某个表面在发光，却无法展示其实现方式。描述观察结果胜过猜测实现方式并将该猜测记录为事实。

输出完成的 JSON，然后询问是否需要在生成前调整任何值。

## 阶段 3 — 生成（DNA JSON + 内容 → 制品）

在实现任何 `visual_effects` 条目之前，请阅读 `references/effects-implementation.md`。

**顺序很重要，因为早期决策会约束后续决策。** 色彩与排版共同承载了设计的大部分辨识度，因此应首先确定；效果则叠加在一个即使没有它们也能正常成立的设计之上。

1. 色彩与排版
2. 间距与布局
3. 形状与层次
4. `design_style` 定性字段 — 它们用于指导那些无法由令牌值决定的判断
5. `visual_effects`
6. 最后处理动效与交互：静态布局有误的界面无法靠添加动画来挽救

将 `design_system` 作为 CSS 自定义属性输出到单个 `:root` 块中，使每个下游值都只有一个定义，并且只需编辑一处即可替换令牌。

**获取真实素材，而不是用近似素材替代。** 当参考来源是 URL，且设计需要其中的徽标、图像或字体时，请从该来源获取实际素材。重新创建的近似素材是仿制品与复刻品之间最显眼的差异。

**默认输出为自包含文件** — 内联 CSS 和 JS，无需构建步骤 — 除非指定了框架。自包含约定本身已在 `moai-domain-html-report` § 输出中统一说明；这里的区别在于范围：该技能根据 Markdown 渲染*报告*，而本技能根据 DNA 配置文件生成*设计制品*。

## 交付门禁

交付前进行验证。以下每一项都曾在实践中出现过问题。

- 输出中的每种颜色都可追溯到 DNA 调色板条目。
- 字体系列、间距节奏和圆角与其 DNA 令牌匹配。
- 正文文本满足 4.5:1 的对比度，大号文本满足 3:1。
- `prefers-reduced-motion: reduce` 得到遵循 — 而不只是被检测到。
- `enabled` 标志为 `false` 的效果不会渲染任何内容。
- 动画循环使用 `requestAnimationFrame`；`setInterval` 不是动画原语，并且会与显示器刷新产生不同步的漂移。
- Canvas 和 WebGL 上下文的尺寸与其容器匹配，并能处理尺寸调整。
- 声明的 `fallback_strategy` 已实际实现，而不只是记录下来。

## 润色迭代

初稿显得单薄通常不是令牌问题 — 而是关注度问题，并且重新审视参考内容优于重新审视输出。重新附加相同的参考内容，并从六个维度进行核查：层级、装饰、排版节奏、动效、材质感和整体界面完成度。将结论合并回当前实现，而不是从头重新生成，因为后者会丢弃已经正确的部分。

## 边界

| 请求 | 负责方 |
|---|---|
| Markdown 报告 → HTML | `moai-domain-html-report` |
| 架构图 / 流程图 | `moai-domain-svg-infographic` |
| 图表、仪表板或分类调色板 | `dataviz` |
| 组件级细节完善：同心圆角、视觉对齐、点击区域、缓动工艺 | `moai-ref-ui-polish` |
| 托管于 claude.ai 的视觉识别页面 | `artifact-design` |
| 与 Claude Design 产品同步设计系统 | `manager-design` |

此技能负责其他技能不负责的一件事：将**现有参考对象**
转化为结构化档案，并基于该档案进行生成。如果设计
是基于第一性原理创作，而非通过解构得到的，则由那些技能
负责。

## 参考资料

- `references/dna-schema.md` — 三维度字段列表和枚举词汇表
- `references/effects-implementation.md` — 性能层级、技术选型及各类效果的实现模式