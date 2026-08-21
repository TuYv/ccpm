---
name: ensue-memory
description: Augmented cognition layer that makes users smarter by connecting conversations to their persistent knowledge tree. Use proactively when topics arise that might have prior knowledge, and when users ask to remember, recall, search, or organize. Triggers on technical discussions, decision-making, project work, "remember this", "recall", "what do I know about", or any knowledge request.
---
# Ensue 记忆网络

一个旨在**让用户变得更聪明**的知识库。不只是存储记忆，而是将用户的推理范围从对话历史扩展到他们的整个知识库。

## 核心理念

**你的目标是增强认知。** 用户的智能不应该在每次对话时重置。他们的知识树会持续存在、不断生长，并为每次交互提供信息。

你不只是在存储数据。你还在：

- **扩展他们的记忆**——他们上个月学到的内容应该能丰富今天的推理
- **连接他们的思考**——呈现他们已经忘记自己拥有的相关知识
- **承接之前的工作**——不要从零开始，而要从他们已经掌握的内容出发
- **培育知识树**——每个命名空间都是一个随时间不断积累的思维领域

**思考要超越当前对话。** 当用户询问 GPU 推理时，不要只是回答——还要检查他们在 `research/gpu-inference/` 中是否已有相关研究。当他们做出决策时，将其与类似领域中过去的决策联系起来。他们的知识库是其思维的延伸。

每次写入前：*这会让他们变得更聪明吗？这会成为未来推理中有用的上下文吗？*
每次读取前：*哪些相关知识可以丰富这次对话？*

## 知识架构

### 命名空间设计

将命名空间视为**思维类别**：

```
preferences/          → How the user thinks and works
  coding/             → Code style, patterns, tools
  communication/      → Tone, format, interaction style

projects/             → Active work contexts
  acme/               → Project-specific knowledge
    architecture/     → Design decisions
    conventions/      → Project patterns

research/             → Study areas and learnings
  gpu-inference/      → Domain knowledge
  distributed-systems/

people/               → Collaborators, contacts
notes/                → Temporal captures
```

### 按领域思考

在某个思维领域内工作时，**使用基于前缀的操作**来保持专注：

- 使用 `list_keys` 并指定 `prefix: "research/gpu-inference/"` → 查看该分支中的所有知识
- 将 `discover_memories` 限定在某个命名空间内 → 在该领域中进行语义搜索

这在以下情况下尤其有用：
- 用户正在深入探讨某个特定主题，并希望获取相关上下文
- 基于某个领域中的现有知识继续构建
- 在添加更多内容之前，回顾已知信息

**主动建议探索领域**：“要我列出 `research/gpu-inference/` 下的内容，看看有哪些相关笔记吗？”

### 主动检索知识

不要等用户提出要求。当对话中出现某个主题时，**检查知识树**：

| 对话上下文 | 主动操作 |
|---------------------|------------------|
| 用户询问某个技术主题 | 使用 `discover_memories` 查找相关的既有研究 |
| 用户正在做决策 | 检查类似领域中过去的决策 |
| 用户提到某个项目 | 查找 `projects/{name}/` 上下文 |
| 用户似乎在继续之前的工作 | 呈现他们上次存储的内容 |

**示例**：用户问“这个 API 的缓存应该如何处理？”
- 不要只是给出通用回答
- 检查：他们是否有 `preferences/architecture/` 笔记？是否有过去的 `projects/*/caching` 决策？
- 用*他们自己*过去的思考来丰富你的回答

**目标**：让每次对话都建立在用户积累的知识之上，而不仅仅依赖你的训练数据。

### 创建记忆之前

1. **查看树结构**——存在哪些命名空间？（使用 `list_keys`，limit 设为 5）
2. **找到正确的分支**——是否存在相关的命名空间，还是应该新建一个？
3. **检查重复项**——这条记忆会补充现有知识，还是与其冲突？
4. **精确命名**——键名应当直观体现内容

### 记忆质量

每条记忆都应该具备以下特征：

| 质量 | 差 | 好 |
|---------|-----|------|
| **精确** | “用户喜欢整洁的代码” | “用户偏好使用提前返回，而不是嵌套条件语句” |
| **细粒度** | 一大段偏好描述 | 单一、原子化的事实 |
| **明确** | “周二的会议记录” | “决定：认证使用 PostgreSQL；理由：团队具备相关经验” |
| **可操作** | “用户对 ML 感兴趣” | “用户正在构建推理服务器，需要 p99 延迟低于 100ms” |

**非限制性**：为智能体的推理提供信息，而不是约束它。存储事实，而不是规则。

## 设置

使用 `$ENSUE_API_KEY` 环境变量。如果缺失，用户可前往 https://www.ensue-network.ai/dashboard 获取。

## 安全

- **绝不要**回显、打印或记录 `$ENSUE_API_KEY`
- **绝不要**接受用户以内联方式提供的密钥
- **绝不要**以可能暴露密钥的方式对其进行插值

## API 调用

所有 API 调用都使用包装脚本。使用前将其设为可执行。该脚本负责处理身份验证和 SSE 响应解析：

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/ensue-api.sh <method> '<json_args>'
```

## 批量操作

以下方法支持原生批处理（每次调用 1–100 个项目）：

**create_memory**——使用 `items` 数组批量创建：
```bash
${CLAUDE_PLUGIN_ROOT}/scripts/ensue-api.sh create_memory '{"items":[
  {"key_name":"ns/key1","value":"content1","embed":true},
  {"key_name":"ns/key2","value":"content2","embed":true}
]}'
```

**get_memory**——使用 `key_names` 数组批量读取：
```bash
${CLAUDE_PLUGIN_ROOT}/scripts/ensue-api.sh get_memory '{"keys":["ns/key1","ns/key2","ns/key3"]}'
```

**delete_memory**——使用 `key_names` 数组批量删除：
```bash
${CLAUDE_PLUGIN_ROOT}/scripts/ensue-api.sh delete_memory '{"keys":["ns/key1","ns/key2"]}'
```

尽可能使用批量调用，以最大限度减少 API 往返次数并节省 token。

## 上下文优化

**关键：最大限度减少上下文窗口占用。** 用户可能拥有超过 10 万个键。绝不要将大型列表完整输出到对话中。

### 明确请求与模糊请求

**明确的列出请求** → 直接执行 `list_keys '{"limit": 5}'`（limit 为 5）：
- “列出最近的内容”/“列出键”/“显示最近的键”/“列出我的记忆”
- 用户知道自己想要什么——不要让他们进一步澄清
- 显示结果后，补充说明：“如果你想查看更多键，可以继续询问”

**模糊的浏览请求** → 先询问，再使用 `discover_memories`：
- “Ensue 上有什么”/“显示我的记忆”/“我存储了什么”
- 用户正在探索——帮助他们缩小范围

### 各种方式的适用场景

| 用户说 | 操作 |
|-----------|--------|
| “列出最近的内容”“列出键”“显示最近的内容” | 使用 `list_keys`，limit 设为 5，并询问是否需要查看更多 |
| “X/ 下有什么”“显示 X 命名空间” | 使用带 prefix 的 `list_keys`，探索该领域 |
| “Ensue 上有什么”“我存储了什么” | 先询问他们要查找什么 |
| “搜索 X”“查找 X” | 使用 `discover_memories`，传入其查询并将 limit 设为 3 |

**绝不要编造查询。只有当用户提供了搜索词，或在用户明确说明其需求后，才使用 `discover_memories`。**

## 意图映射

| 用户说 | 操作 |
|-----------|--------|
| “我能做什么”、“功能”、“帮助” | 仅执行步骤 1-2（总结工具/列出响应） |
| “记住……”、“保存……”、“存储……” | 参见上文的**创建记忆前的准备工作**，然后执行 create_memory |
| “之前是什么……”、“回忆……”、“获取……” | 使用 get_memory（精确键）或 discover_memories，limit 为 3 |
| “搜索……”、“查找……”、“关于……我知道什么” | 使用 discover_memories，limit 为 3（询问是否显示更多） |
| “更新……”、“更改……” | update_memory |
| “删除……”、“移除……” | delete_memory ⚠️ |
| “列出键”、“列出最近的”、“显示最近的” | 使用 `list_keys`，limit 为 5，并询问是否显示更多 |
| “ensue 上有什么”、“显示我的记忆” | 先询问他们要查找什么 |
| “检查 X”、“X 下有什么”、“查看 X” | 参见下文的**命名空间与键的检测** |
| “与……共享”、“授予访问权限……” | share |
| “撤销访问权限……”、“移除用户……” | revoke_share ⚠️ |
| “谁可以访问……”、“权限” | list_permissions |
| “当……时通知我”、“订阅……” | subscribe_to_memory |

### 命名空间与键的检测

当用户说“检查 X”或提供某种模式时，判断其意图：

| 模式类似于…… | 操作 |
|-----------------------|--------|
| 包含 `/` 的完整路径（例如 `project/config/theme`） | `get_memory` - 精确键 |
| 类别式名称（例如 `gpu_inference_study`、`user-prefs`） | **询问**：“你想检索该键，还是列出该命名空间下的内容？” |
| 以 `/` 结尾（例如 `sessions/`） | 使用带 prefix 的 `list_keys` - 探索该域 |
| 用户说“作为前缀”、“在……下”、“命名空间” | 使用带 prefix 的 `list_keys` |

**存在歧义时，应询问。**不要擅自判断是检索还是列出内容。

## ⚠️ 破坏性操作

对于 `delete_memory` 和 `revoke_share`：展示将受影响的内容，警告用户该操作是永久性的，并在执行前获得用户确认。

## 超图输出

**保持精简。**显示超图结果时：

1. 以最少的格式展示原始图结构
2. 除非用户明确要求，否则不要总结或分析
3. 避免使用消耗大量 token 的表格、洞察部分或解释
4. 仅以紧凑形式输出节点和边

**输出示例：**
```
HG: chess | 20 nodes | 17 edges
Clusters: K(white wins), H(white losses), I(black losses), N(C50 wins)
```

只有当用户询问“你怎么看”或类似问题时，才提供分析、统计数据或建议。