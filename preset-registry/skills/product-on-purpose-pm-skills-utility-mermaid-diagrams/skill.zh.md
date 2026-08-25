---
name: utility-mermaid-diagrams
description: Teaches PMs to create syntactically valid mermaid diagrams by selecting the right diagram type for their communication need, following syntax validity rules, and validating before shipping. Covers all 15 mermaid diagram types with PM-relevant examples and a dual-lens navigation system.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-04-07
  category: documentation
  frameworks:
    - mermaid
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# Mermaid 图表

为产品文档创建有效且语法正确的 mermaid 图表。

## 适用场景

- 为 PRD、规格说明、路线图或利益相关者演示文稿创建 mermaid 图表
- 选择 15 种图表类型中适合特定沟通需求的一种
- 调试无法渲染或渲染不正确的 mermaid 代码
- 审查图表的清晰度、准确性和可访问性

## 不适用场景

- 将图表导出为图像文件（PNG/SVG）——这是渲染工具的职责
- 使用非 mermaid 的图表工具（Figma、Lucidchart、draw.io）
- 创建没有信息传达目的的纯装饰性视觉内容

## 首要原则

> 不要把列表能够表达的内容绘制成图表。

当图表能够揭示被文字描述扁平化的**关系**、**分支**或**流程**时，才有存在的价值。在创建任何图表之前，先问自己：

*这是否展示了列表或表格会被扁平化的分支、关系或流程？*

- **是** → 使用图表
- **否** → 改用编号列表、项目符号列表或表格

一个 5 步的线性流程适合用列表表示。一个包含两个决策点和一个重试循环的 5 步流程适合用图表表示。

## 图表选择指南

| 我需要展示…… | 使用 | 也可以考虑 |
|-------------------|-----|---------------|
| 决策或审批流程 | 流程图 | 状态图 |
| 多服务或多方交互 | 时序图 | 流程图 |
| 功能生命周期或状态转换 | 状态图 | 流程图 |
| 工作阶段或流水线状态 | 看板图 | 状态图 |
| 带有依赖关系的发布或迭代时间线 | 甘特图 | 时间线 |
| 版本历史或按时间顺序排列的里程碑 | 时间线 | 甘特图 |
| 二维优先级排序（工作量/影响、风险/价值） | 四象限图 | - |
| 分配明细或组成结构 | 饼图 | 矩形树图 |
| 问题分解或头脑风暴 | 思维导图 | - |
| 领域模型或数据关系 | ER 图 | 类图 |
| API 或对象契约 | 类图 | ER 图 |
| 系统拓扑或基础设施 | 架构图 | 流程图 |
| 流量或预算分配 | 桑基图 | 饼图 |
| 分层比例数据 | 矩形树图 | 饼图 |
| 趋势或时间序列指标 | XY 图表 | - |

按 PM 任务组织的完整示例，请参阅 `references/pm-use-cases.md`。  
每种类型的完整语法和选项，请参阅 `references/diagram-catalog.md`。

## 语法有效性原则

以下六条规则可以避免大多数渲染失败：

1. **为标签加引号** - 任何包含空格、圆括号、方括号、冒号、逗号或保留字的标签，都必须使用双引号括起来
2. **转义特殊字符** - 具有 mermaid 或 markdown 含义的字符（`>`, `<`, `-` 位于行首时、`#`）需要进行转义或加引号
3. **先声明后引用** - 在边中使用节点之前先定义该节点；在某些类型中引用未声明的节点会导致静默失败
4. **遵守限制** - 每种图表类型都有一个最大节点数/参与者数量，超过该数量后可读性会崩溃（各类型的具体限制请参阅 `references/diagram-catalog.md`）
5. **注释你的意图** - 使用 `%%` 注释记录不明显的选择（为什么采用这种布局方向，为什么进行这种分组）
6. **发布前测试** - 将内容粘贴到 mermaid 渲染器（mermaid.live、VS Code 预览或你的目标环境）中，并确认其能够正确渲染

有关完整的语法参考，请参阅 `references/syntax-guide.md`。

## Instructions

1. **明确你要传达的内容** - 哪种关系、流程、层级或比例需要清晰呈现？受众是谁？
2. **遵循首要原则** - 确认图表相比列表或表格能够提供更多价值
3. **选择图表类型** - 使用上方的选择指南，按任务浏览 `references/pm-use-cases.md`，或按类型浏览 `references/diagram-catalog.md`
4. **规划图表** - 填写 `references/TEMPLATE.md` 中的规划工作表：目的、受众、节点清单、类型选择理由
5. **编写 mermaid 代码** - 遵循 `references/syntax-guide.md` 中的规则；从 `references/diagram-catalog.md` 中的最简语法示例开始，然后逐步扩展
6. **验证** - 按照下面的质量检查清单逐项检查
7. **嵌入** - 将经过验证的 mermaid 代码块放入文档中

## Output Contract

- **规划产物**：一份完整的图表规划工作表（`references/TEMPLATE.md`）
- **最终输出**：嵌入目标文档中的语法有效的 mermaid 代码块
- **质量门槛**：质量检查清单中的所有项目均通过

## Quality Checklist

- [ ] 图表在目标环境中渲染时不会出错
- [ ] 满足首要原则——列表或表格无法更清晰地传达这些内容
- [ ] 不存在没有分支、关系或层级的线性序列
- [ ] 所有包含空格或特殊字符的标签均已正确加引号
- [ ] 需要时已对特殊字符进行转义
- [ ] 节点数/参与者数量在该类型规定的限制范围内
- [ ] 颜色具有可访问性（最低 WCAG AA 3:1 对比度，浅色背景使用黑色文本）
- [ ] 颜色绝不是唯一的区分方式——还需通过形状和标签区分元素
- [ ] 图表具有描述性标题或周围的上下文说明
- [ ] `%%` 注释记录了任何不明显的布局或分组选择

## References

| File | Purpose |
|------|---------|
| `references/TEMPLATE.md` | 图表规划工作表——在编写 mermaid 代码之前填写 |
| `references/EXAMPLE.md` | 完整示例：PM 为产品发布创建 4 个图表 |
| `references/diagram-catalog.md` | 全部 15 种图表类型：语法、PM 示例、限制和常见问题 |
| `references/pm-use-cases.md` | PM 任务 → 图表类型映射及简短完整示例 |
| `references/syntax-guide.md` | 完整的语法有效性规则、转义、样式设置和验证检查清单 |