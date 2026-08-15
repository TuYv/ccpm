---
name: design-style-picker
description: Batch-generate and compare visual design directions so a user can choose the style they actually want. Use when the user says they cannot describe an abstract visual style, asks for many style options, wants to choose from generated UI/design-system images, rejects outputs as too colorful/too dead/too generic, or needs an existing UI/design system evolved without discarding current assets.
---
# 设计风格选择器

## 目的

使用此技能将模糊的审美偏好转化为具体的视觉选择。目标不是猜测一个最终设计，而是生成一组结构化选项，以快速揭示用户的审美边界。

## 核心规则

如果用户已经表示无法描述抽象风格，就不要再要求他们描述。应生成可供比较的视觉依据，让他们做出选择，然后根据选定的参考进行实现。

## 工作流程

1. **重述真正的目标**
   - 说明用户实际要选择的内容：设计系统风格、业务应用界面、落地页、演示文稿、组件库等。
   - 区分主要交付物与验证样例。如果任务是设计系统，业务界面只是可选的验证样例，而不是主要交付物。
   - 保留任何现有 UI、资产、令牌、布局、品牌特征和领域上下文，除非用户明确要求舍弃它们。

2. **先收集现有资产**
   - 检查当前渲染的 UI 或截图。
   - 查看设计令牌、CSS 变量、组件名称、关键图像、品牌/领域参考资料以及现有截图。
   - 将当前资产视为起始词汇。不要在其上生成不相关的“全新”概念。

3. **生成矩阵，而不是细微变体**
   - 当审美偏好不明确时，至少使用两个轴：
     - 纵向阶梯：以较大步幅改变一个维度，例如色彩强度 20/35/50/65/80。
     - 横向方向：不同的组织策略，例如数据驱动的色彩、品牌主轴、温暖的产品图像、场景模块或治理导向的布局。
   - 让各选项在视觉上有明显差异。如果两张图看起来像是同一系列，就重新生成其中一张，使对比更加鲜明。
   - 优先批量生成。用户是在等待进行选择，而不是逐张观看缓慢生成的图像。

4. **将色彩作为一个系统使用**
   - “减少色彩”并不意味着黑白。它通常意味着减少相互争夺注意力的视觉焦点。
   - 保持产品配色的活力，但要为色彩分配不同角色：
     - 使用大面积区域和分区色带构建架构。
     - 使用数据可视化和证据系统表达多色语义。
     - 将品牌色/风险色用于少见但信号强烈的强调。
     - 将中性色组件用于常规 UI。
   - 当用户正在调整色彩时，应包含明确的上限样例：安全、中等、高强度和过载边界。

5. **展示前先进行审查**
   - 自行打开生成的图像。
   - 标记哪些可能过于沉闷、过于鲜艳、过于通用、过于像业务系统，或最接近目标。
   - 展示每个有用候选项的文件路径，并附上简短的决策说明。

6. **根据选定的图像进行实现**
   - 提取原则，而不是像素：色彩角色、布局密度、焦点层级、组件处理、图像使用，以及治理/数据的放置方式。
   - 明确融合选定的参考。例如：“使用 H02 的色彩布局和 V04 的配色强度。”
   - 除非用户要求创建新交付物，否则实现范围应限于现有 UI。
   - 实现后对渲染结果进行视觉质量检查。

## 提示词模式

生成图像时，请包含：

```text
This is an evolution of the existing UI/design system, not a replacement.
Preserve these assets: <tokens, imagery, sections, components, brand cues>.
Axis: <vertical ladder or horizontal direction>.
Variant name: <clear label>.
Color/visual rule: <specific budget or organization method>.
Primary focal point: <one thing>.
Avoid: <known rejected styles from the user>.
```

## 需要保留的经验

- 用户说“不要太多彩”时，可能是指“不要出现几十个视觉权重相同的小色块”，而不是“移除所有颜色”。
- 用户说“更有分量”时，可能是指视觉权威感和层级感，而不是深色模式的控制室风格。
- 对于设计系统相关工作，不要用业务仪表板取代设计系统。业务界面可以用于验证风格，但不应成为最终答案。
- 始终有意创建边界样例。它们能直观呈现“过度”的效果，并加快选择过程。
- 做出选择后，融合选定的参考方案，并说明每个方案分别贡献了什么。

## 参考资料

- 在开展完整的风格选择会话时，或用户在图像探索过程中提出审美修正意见时，请阅读 `references/selection-playbook.md`。