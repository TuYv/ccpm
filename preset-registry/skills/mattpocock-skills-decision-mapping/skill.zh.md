---
name: decision-mapping
description: Turn a loose idea into a sequenced map of investigation tickets, then drive them to resolution one at a time.
disable-model-invocation: true
---
当一个模糊想法需要多个代理会话才能转化为计划时，会调用此技能。它在一个 Markdown 文件中创建一个有状态的决策地图，并通过一系列票据引导用户解决开放问题——这些问题可能需要原型设计、调研或追问。该地图与领域无关：它可以规划工程工作、课程内容，或任何符合相同形态的事物。

## 决策地图

决策地图是一个紧凑的单个 Markdown 文件，每个规划工作对应一个，并与项目一起纳入 git 追踪。它是规范工件——**整张地图会作为上下文加载到每个会话中**，因此它必须保持紧凑。

票据期间创建的资产应从地图链接，而不是在地图中重复。

### 结构

条目（“票据”）各自是一个独立小节，以一个简短且可读作迷你标题的短横线小写 slug 作为键（例如 `relational-db`、`auth-strategy`、`cache-layer`）——足够简洁以节省 token，并且在地图内唯一。

```markdown
## relational-db: Relational Or Non-Relational Database?

Blocked by: <slug>, <slug>
Status: open | in-progress | resolved
Type: Research | Prototype | Grilling | Task

### Question

<question-here>

### Answer

<answer-here>
```

slug 是规范 ID，用于每条 `Blocked by` 边和正文引用；冒号后的标题是可选的。当票据的 `Blocked by` 列表中的每个票据都为 `resolved` 时，该票据即**已解除阻塞**。会话通过将 `Status` 设为 `in-progress` 并在任何工作开始前保存地图来**认领**其票据，从而让并发会话跳过它。

每张票据的规模必须限制在一个 100K token 的代理会话内。

## 票据类型

共有四种票据类型：

- **Research**：阅读文档、第三方 API 或知识库等本地资源。创建一个 Markdown 摘要作为资产。当需要当前工作目录之外的知识时使用。
- **Prototype**：通过制作一个廉价、粗糙、具体的可反应工件——例如大纲、粗略方案、桩，或通过 /prototype 技能实现的 UI/逻辑代码——来提升讨论的保真度。将原型创建为资产。当“它应该是什么样”或“它应该如何表现”是关键问题时使用。
- **Grilling**：与代理对话。使用 /grilling 和 /domain-modeling 技能。一次只问一个问题。默认情况。
- **Task**：必须在讨论继续之前完成的字面意义上的手工工作——没有需要决定、原型化或调研的内容。例如移动数据、注册第三方服务、开通权限。代理会在可能的地方自动执行；否则它会交给人类一份精确的手工执行清单。工作完成即视为已解决；答案记录已完成的内容，以及后续票据依赖的任何由此产生的事实（凭据位置、新 URL、行数）。

## 战争迷雾

地图在前沿之外被_有意_保持不完整。你的工作是调查前沿，并按顺序解决票据以推进前沿。一次一个节点地推开战争迷雾——直到通往终点的路径清晰且不再有票据。

## 调用

有两个分支。无论哪种情况，**每个会话都以 [Handoff](#handoff) 结束**——每个会话绝不解决多于一张票据。

### 创建地图

用户在有一个模糊想法时调用。

1. 运行一次 `/grilling` 和 `/domain-modeling` 会话，以揭示开放决策。一次只问一个问题。
2. 编写一个新的决策地图——大部分为迷雾，已识别前沿，可轻易决定的条目就地解决。
3. 交接。构建地图是一个会话的工作；不要同时解决票据。

### 处理地图

用户在提供现有地图路径时调用。票据 slug 是**可选的**——如果没有提供，由你选择下一个决策，而不是用户。

1. 将**整张地图**加载为上下文。
2. 选择票据。如果用户指定了票据，就使用它。否则选择文档顺序中第一个 [已解除阻塞](#structure) 的 `open` 票据。[认领它](#structure)：将 `Status` 设为 `in-progress` 并在任何工作开始前保存。
3. 解决它，并按需调用技能——包括 `## Notes` 块中列出的任何技能。如果不确定，使用 `/grilling` 和 `/domain-modeling`。
4. 将答案记录到票据正文中，并将 `Status` 设为 `resolved`。
5. 添加新发现的票据及其正确的 `Blocked by` 边。如果所做决策使地图的其他部分失效，则更新或删除这些节点。
6. 交接。

用户可以并行运行已解除阻塞的票据，因此要预期其他代理会在各自会话中编辑地图。

## 交接

通过清除上下文并打开一个或多个新会话来结束每个会话。以一个用户可复制粘贴的 **Next steps** 块收尾。有两种情况：

**仍有开放票据。** 列出当前已解除阻塞的票据，然后提供两种复制粘贴选项：一个用于单个会话的裸命令（由你选择下一张票据），以及每个已解除阻塞票据各一条的固定命令，用于并行运行。每个新窗口粘贴一行——可以打开一个、部分或全部。

> **下一步** — 3 张票据已解除阻塞：`auth-strategy`、`cache-layer`、`rate-limits`。
> 清除上下文，然后打开新会话。
>
> **单个会话** — 解决下一张已解除阻塞的票据：
> ```
> Invoke /decision-mapping with the map at <path>.
> ```
>
> **并行** — 每个窗口粘贴一行，最多全部 3 个：
> ```
> Invoke /decision-mapping with the map at <path>, ticket auth-strategy.
> Invoke /decision-mapping with the map at <path>, ticket cache-layer.
> Invoke /decision-mapping with the map at <path>, ticket rate-limits.
> ```

**没有剩余开放票据。** 战争迷雾已被推得足够远，通往终点的路径清晰——地图已完成。（最初的追问也可能揭示完全没有迷雾，这种情况下根本没有地图可构建。）建议直接实现，或使用 `/to-prd` 来规划多会话实现。

## Notes

一个可选块，声明**领域**、每个会话都应 `consult` 的任何技能，以及规划所呈现的自由格式固定偏好。
