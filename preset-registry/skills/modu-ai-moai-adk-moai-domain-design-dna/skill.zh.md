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

大多数“让它看起来像这样”的请求都会以同一种方式失败：只看一遍参考对象，形成一个印象，然后凭记忆将这个印象编写成代码。最终保留下来的只是一种模糊的相似感——配色发生偏移，节奏趋于平淡，而那个赋予参考对象独特个性的关键效果则完全消失。

此 Skill 在观察与构建之间插入了一个中间产物。首先将参考对象解构为一份 **Design DNA JSON**，然后仅使用这份 JSON 进行生成。正是这个中间步骤让结果变得可核查：输出中的每种颜色、每个圆角半径和每条缓动曲线都可以追溯到一个已记录的字段，因此不匹配之处体现为差异，而不是关于审美的争论。

> **来源说明**：三维分类法和若干提取规则改编自采用 MIT 许可证的
> `zanwei/design-dna` Skill。有关保留的版权声明，请参阅
> `.claude/rules/moai/NOTICE.md`。

## 三个维度

这种划分很重要，因为三个维度的提取方式不同，出错方式也不同。

| 维度 | 包含的内容 | 获取方式 |
|---|---|---|
| `design_system` | 可以被**测量**的内容——颜色十六进制值、字体比例、间距基础单位、圆角半径、层级、动效时序、组件模式 | 从参考对象中采样和测量；数值化 |
| `design_style` | 可以被**感受**的内容——氛围、装饰程度、构图策略、留白理念、交互个性、微文案语气 | 整体判断；使用描述性词语，而非数字 |
| `visual_effects` | **无法用纯 CSS 表达**的内容——Canvas 场景、WebGL / 3D、着色器、粒子系统、滚动驱动动效、光标行为、玻璃拟态 | 在有源代码时从源代码中读取，否则根据截图进行描述 |

将它们合并会导致双向的信息损失。没有风格维度的令牌集合只能复现颜色，却无法复现任何个性；没有系统维度的情绪板只能复现氛围，却无法让任意两个元素对齐。

逐字段的模式与枚举词汇表：`references/dna-schema.md`。

## 阶段 1——结构

当请求针对模式本身（“设计档案包含哪些内容？”）时，请读取 `references/dna-schema.md`，展示三个维度及其字段组，并在开始提取之前询问是否需要扩展或删除任何维度。

## 阶段 2——分析（参考对象 → DNA JSON）

首先读取 `references/dna-schema.md`，然后逐个处理参考对象。

- **图像或截图** → 直接读取并分析其视觉属性。
- **URL** → 获取页面。优先使用源代码：`<canvas>` 元素、WebGL 上下文、动画库导入、自定义着色器、`IntersectionObserver` 滚动触发器以及 SVG `<animate>` 都是*明确陈述*的事实，而截图只能支持推断。
- **视频或交互录制** → 这是获取动效时序、滚动编排和过渡个性的唯一可靠来源。

### 提取规则

1. **颜色角色按主导程度分配，而不是按色相分配。** 主色是占据最大面积的颜色，次色是起辅助作用的表面颜色，强调色则是承载行动号召的颜色。将中性色阶映射为从最浅背景到最深文本的有序渐变。
2. **相对测量圆角半径。** 根据承载圆角的元素高度来记录它——当按钮尺寸变化后，绝对的 `12px` 就失去了意义，而“控件高度的一半”则能在缩放后继续成立。嵌套表面的同心圆角规则属于 `moai-ref-ui-polish`；不要在此处重复说明，而应在那里应用。
3. **根据比例推断字体级差**，而不是根据绝对尺寸。标题与正文的比例以及行高节奏可以跨视口迁移；像素尺寸则不行。
4. **密度即邻近程度。** 根据元素间距相对于基础单位的大小来判断间距，并根据这些间距在不同区段之间是保持不变还是逐步增大来判断区段节奏。
5. **当参考对象相互冲突时，记录主导模式并命名变体。** 对两个参考对象取平均值会产生一种二者都不具备的设计。
6. **填写每一个字段。** 空字符串与“未查看”无法区分。当参考对象确实没有体现某个字段时，应在值中明确说明——显式的“未观察到”是数据；空白则是缺口。
7. **参考对象中不存在的效果应设置为 `enabled: false`。** 这是禁止凭空创造的规则，而且至关重要：未设置的标志会诱使生成器添加一个无人要求的粒子场。
8. **无法确定的内容应放入 `composite_notes`。** 截图可以表明某个表面在发光，却无法表明它是如何实现的。描述观察结果胜过猜测实现方式并将猜测记录为事实。

输出完整的 JSON，然后询问在生成之前是否需要调整任何值。

## 阶段 3 — 生成（DNA JSON + 内容 → 制品）

在实现任何 `visual_effects` 条目之前，请阅读
`references/effects-implementation.md`。

**顺序很重要，因为前期决策会约束后续决策。** 色彩与字体排印共同承载了
设计的大部分特征，因此应当最先确定；各种效果则叠加在一个即使没有它们也
已经成立的设计之上。

1. 色彩与字体排印
2. 间距与布局
3. 形状与层次
4. `design_style` 定性字段 — 这些字段用于指导 token 值无法决定的
   判断
5. `visual_effects`
6. 最后处理动效与交互：如果界面的静态布局有误，添加动画也无法挽救它

将 `design_system` 作为 CSS 自定义属性输出到单个 `:root` 块中，使每个
下游值都有唯一的定义，并且替换 token 只需编辑一次。

**获取真实资源，而不是用近似内容代替。** 当参考对象是 URL，并且设计需要
其中的徽标、图像或字体时，请从该来源获取实际资源。重新创建的近似内容是
仿制品与克隆品之间最显眼的单一差异。

**默认输出为自包含文件** — 内联 CSS 和 JS，无需构建步骤 — 除非指定了
框架。自包含约定本身已在 `moai-domain-html-report` § 输出部分统一说明；
这里的区别在于范围：该 skill 根据 markdown 渲染一份*报告*，而本 skill
根据 DNA 配置文件生成一个*经过设计的制品*。

## 配置文件持久化

阶段 2 可以通过将完整的 DNA JSON 保存为**命名配置文件**来结束，而阶段 3
可以从**活动配置文件**开始，无需再次提取同一个参考对象：
`references/diagram-profiles.md` 记录了相关机制 — 项目根目录下的
`.design-dna/` 存储、标记优先的 `active` 选择器、slug 语法、加载时通过
"not observed" 回填进行的 schema 验证，以及覆盖前确认 / 通过重新读取验证的
保存路径。没有配置文件标记的项目会完全按照上述流程进行；持久化只会增加
保存钩子和起始来源选项，绝不会改变路由。

## 交付检查关卡

交付前进行验证。以下每一项都曾在实践中出现过问题。

- 输出中的每种颜色都能追溯到一个 DNA 调色板条目。
- 字体族、间距节奏和圆角与对应的 DNA token 一致。
- 正文文本达到 4.5:1 的对比度，大号文本达到 3:1。
- `prefers-reduced-motion: reduce` 得到遵循 — 而不仅仅是被检测到。
- `enabled` 标志为 `false` 的效果不会渲染任何内容。
- 动画循环使用 `requestAnimationFrame`；`setInterval` 不是动画基元，并且
  会逐渐偏离显示器刷新节奏。
- Canvas 和 WebGL 上下文的尺寸与其容器相匹配，并能处理尺寸调整。
- 声明的 `fallback_strategy` 得到了实际实现，而不仅仅是被记录下来。

## 润色迭代

如果第一版显得单薄，通常不是 token 的问题 — 而是关注度的问题；重新审视
参考对象比重新审视输出更有效。重新附上相同的参考对象，并从六个维度对照
审查：层级、装饰、字体排印节奏、动效、材质感以及界面的整体完成度。将结论
合并回当前实现，而不是从头重新生成，因为后者会丢弃已经正确的部分。

## 边界

| 请求 | 归属 |
|---|---|
| Markdown 报告 → HTML | `moai-domain-html-report` |
| 架构图 / 流程图 | `moai-domain-svg-infographic` |
| 图表、仪表盘或分类调色板 | `dataviz` |
| 组件级完善：同心圆角、视觉对齐、点击区域、缓动效果打磨 | `moai-ref-ui-polish` |
| 托管在 claude.ai 上的视觉识别页面 | `artifact-design` |
| 与 Claude Design 产品同步设计系统 | `manager-design` |

此技能负责一件其他技能不负责的事情：将**现有参考**
转化为结构化配置，并基于该配置进行生成。如果设计并非通过解构得出，
而是从基本原则出发创作，则应由那些技能负责。

## 参考资料

- `references/dna-schema.md` — 三个维度的字段列表和枚举词汇表
- `references/diagram-profiles.md` — 命名配置的持久化：`.design-dna/` 存储、标记优先解析、slug 语法、加载时验证
- `references/effects-implementation.md` — 性能层级、技术选择以及各类效果的实现模式