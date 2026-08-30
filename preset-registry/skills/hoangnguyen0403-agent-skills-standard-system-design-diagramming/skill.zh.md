---
name: system-design-diagramming
description: "Draw system diagrams in the Archify visual language: a typed JSON spec rendered as dark-canvas SVG with numbered lanes, semantic node colors, masked edge labels, and a legend. Covers architecture, workflow, sequence, dataflow, and lifecycle views. Use for any design-session diagram."
metadata:
  triggers:
    keywords:
      - archify
      - diagram
      - architecture diagram
      - sequence diagram
      - data flow diagram
      - lifecycle diagram
      - swimlane
      - draw the system
---
# 系统图示（Archify 风格）

## **优先级：P1（高）**

先编写类型化 JSON 规范，然后进行渲染。不要在 prose 中手动放置像素，也不要将 Mermaid 作为交付物。

## 选择一种类型

| 类型 | 用途 |
| --- | --- |
| `architecture` | 组件、服务、云和信任边界 |
| `workflow` | 流程、审批关卡、运行手册、CI/CD |
| `sequence` | 调用链、请求生命周期、异步跟踪 |
| `dataflow` | 流水线、ETL、数据血缘、消费者 |
| `lifecycle` | 状态转换、重试、终止状态 |

每张图只能使用一种类型。设计文档通常需要 `architecture`，再加上 `sequence` 或 `dataflow` 中的一种。

## 渲染路径

1. 检查是否已安装 Archify skill（任意 agent skills 目录下的 `archify/SKILL.md`）。
2. **已安装**：依据其 `schemas/<type>.schema.json` 编写 JSON，然后在每次编辑后运行 `archify validate <type> <file>.json`，最后运行一次 `archify deliver`。非零退出码绝不表示成功。
3. **未安装**：直接输出内联 SVG，并遵循[样式契约](references/archify-style.md)。使用相同的 tokens、相同的几何结构以及相同的图例规则。
4. 无论哪种情况，规范都是唯一事实来源：节点包含 `id`、`type`、`label`，以及可选的 `sublabel` 和 `tag`；边包含 `from`、`to`、`label`、`variant`；分组列出它们 `wrap` 的 id。

## 语义即颜色

- 节点的 `type` 表示含义，而非装饰：`frontend`、`backend`、`database`、`cloud`、`security`、`messagebus`、`external`。
- 边的 `variant` 表示含义：`default` 表示普通调用，`emphasis` 表示主请求路径，`security` 表示身份验证或策略跳转，`dashed` 表示异步或事件。
- 绝不要引入该映射之外的颜色，也绝不要内联会破坏深色/浅色一致性的字面量 hex。
- 分组框只有两种：`region` 表示部署范围或归属，`security-group` 表示信任边界。

## 组合规则

- 只有一条从左到右的主路径；侧分支从距离最近的主路径节点引出。
- 最多 12 个主节点。视图拥挤前应将其拆分。
- 按顺序为每个泳道或阶段编号，格式为 `01 / Label`。
- 每条边都要带标签，除非两个端点已经明确表示协议、方向和同步行为。
- 间距指的是**清晰间隔**，而不是中心点距离：应留出超过标签遮罩宽度加 8px 的空间。
- 图例是必需的，并且只列出实际存在的类型。

## 修复顺序

按照以下顺序修复，每次只处理一个已诊断出的控制项：先修复 schema 错误，然后修复节点重叠或超出范围的位置，再修复穿过不透明节点的边，接着修复含义不明确的通道和交叉，最后修复标签间距。

## 反模式

- **不交付 Mermaid**：如果提供了 Mermaid，可以读取它来了解拓扑，然后以此格式重新编写。
- **边不得穿过无关节点**：这始终是硬性失败，绝不能作为可接受的折中方案。
- **不得通过删除标签来修复几何结构**：标签是数据；应改道。
- **不得添加装饰性强调**：每种饱和色都必须对应节点或关系的含义。
- **不得在 prose 中规划坐标**：先编写规范，进行渲染，然后读取诊断信息。

## 参考资料

- [Archify 样式契约](references/archify-style.md) - 设计令牌、几何图形、SVG 脚手架、各类型布局区域。