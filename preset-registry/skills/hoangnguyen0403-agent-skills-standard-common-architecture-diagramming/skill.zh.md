---
name: common-architecture-diagramming
description: Draw architecture diagrams as editable draw.io files with a fixed house style, C4 levels, and evidence-tagged shapes. Use when producing a system context, container, deployment, data flow, sequence, or state diagram, or redrawing an ASCII or Mermaid one.
metadata:
  triggers:
    files:
      - "ARCHITECTURE.md"
      - "**/*.drawio"
      - "**/*.mermaid"
      - "docs/architecture/**"
    keywords:
      - diagram
      - c4
      - drawio
      - mermaid
      - erd
      - entity relationship
      - schema diagram
      - aws
      - architecture diagram
      - solution architecture
      - system context
      - deployment diagram
---
# 架构图绘制标准

## **优先级：P1（高）**

## 流程

绝不要手写 mxGraph XML。编写规范；所有视觉决策由脚本负责，
这样不同作者、仓库和会话生成的图表才能保持一致。

1. 编写 `spec.json` —— 架构见 [diagram-spec.md](references/diagram-spec.md)。对于 ERD，
   使用以下命令生成：`python3 scripts/schema_to_spec.py db/schema.sql --title "<System> — ERD" -o spec.json`
2. `python3 scripts/validate_spec.py spec.json`
3. `python3 scripts/render_drawio.py spec.json -o docs/architecture/<slug>.drawio --strict`
   （退出码为 2 表示发现布局问题；请根据 [layout-rules.md](references/layout-rules.md) 修改规范）
4. 导出图像：如果会话中有 draw.io MCP 工具，则使用该工具；否则使用
   `python3 scripts/export_drawio.py docs/architecture/<slug>.drawio -f png -o docs/architecture/<slug>.png`，
   如果仍无法导出，则交付 `.drawio` 并说明图像未导出。参见[导出路径](references/mermaid-fallback.md)。

将 `.drawio` 作为事实来源提交；图像只是用于演示文稿的副本。

## 指南

- **在绘图前明确受众和决策。**
- **每张图只使用一个 C4 层级**：上下文、容器或组件，绝不混用。
- **根据消息选择图表类型**，不要凭习惯选择。参见 [diagram-selection.md](references/diagram-selection.md)。
- **每个节点都要有证据**，格式为 `path:line`。没有证据的节点会以虚线显示并标记为 UNVERIFIED —— 保留该标记，不要把猜测当作事实。
- **将数字放在框中。** `metric` 表示决定节点规模的负载或 SLO，`constraint` 表示其存在的原因；绝不要凭空捏造二者。
- **为每条边添加标签**，标明其协议或事件；对于事件，使用 `style: async`。
- **仅在经过验证的地方使用云图标。** `gcp:*` 和 `aws:*` 是官方图标；其他所有厂商都使用 `cloud:*` 类型，并在 `sublabel` 中写明服务名称。资源包中没有 Azure 徽标，因此 Azure 始终使用 `cloud:*`。
- **面向高管的图最多包含 12 个节点。** 超过此数量后，按层级或流程拆分。
- **图例和标题块由脚本生成。** 不要移除或重复添加。
- **在 draw.io 中进行细化，而不是修改 XML。** 重新运行渲染器会覆盖布局调整。

## 反模式

- **禁止手写 XML**：编写规范并运行渲染器。
- **禁止添加凭空捏造的框**：省略证据不支持的内容。
- **禁止混用层级**：上下文图中绝不出现表列。
- **禁止使用未标注的箭头**：注明协议或事件。
- **禁止使用含义不明的缩写**：首次使用时展开每个缩写。
- **禁止存在孤立节点**：连接它，或将其删去。

## 红线

| 想法 | 现实 |
|---------|---------|
| “这只有一个框，我直接写 XML 就行了” | 渲染器负责样式、图例和标题块。使用渲染器。 |
| “差不多就行，我猜一下这个服务” | 猜测会以事实的形式交付。省略证据，让它渲染为 UNVERIFIED。 |
| “管理者希望在一页中看到整个系统” | 超过 12 个节点后，他们就不再阅读了。拆分图表。 |

## 参考资料

- [图表规范](references/diagram-spec.md) · [样式目录](references/style-catalog.md) · [统一样式](references/house-style.md)
- [源代码提取](references/source-extraction.md) · [高管可读性](references/exec-readability.md)
- [C4 模型](references/c4-model.md) · [云架构](references/cloud-architecture.md) · [最佳实践](references/best-practices.md)
- [布局规则](references/layout-rules.md) · [检查清单](references/checklist.md) · [导出路径和 Mermaid 备用方案](references/mermaid-fallback.md)
- 可运行示例：每种图表类型各有一个 `assets/fixtures/<type>.spec.json`，架构示例位于 `assets/fixtures/schemas/`。
- 批量绘图或委托绘图：`specialist-solution-diagrammer`。