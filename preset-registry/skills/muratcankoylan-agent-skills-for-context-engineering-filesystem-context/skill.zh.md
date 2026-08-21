---
name: filesystem-context
description: "This skill should be used when agent work needs file-backed context: durable scratchpads, tool-output offloading, just-in-time discovery, cross-agent handoff files, filesystem memory, or cleanup policies for context stored outside the prompt."
---
# 基于文件系统的上下文工程

将文件系统用作智能体上下文的主要溢出层，因为上下文窗口是有限的，而任务所需的信息往往超出单个窗口的容量。文件让智能体能够通过统一接口存储、检索和更新实际上近乎无限的上下文。

优先采用动态上下文发现——按需提取相关上下文——而不是静态包含，因为无论是否相关，静态上下文都会消耗 token，并挤占任务特定信息的空间。

## 何时启用

在以下情况下启用此技能：
- 工具输出导致上下文窗口过度膨胀
- 智能体需要在长流程中持久保存状态
- 子智能体必须在不直接传递消息的情况下共享信息
- 任务所需的上下文超出窗口容量
- 构建能够学习并更新自身指令的智能体
- 为中间结果实现暂存区
- 需要让智能体能够访问终端输出或日志

对于由其他技能负责的相邻工作，请勿启用此技能：
- 跨会话语义记忆、实体跟踪或时序知识图谱：`memory-systems`。
- 对话摘要、压缩或持久化交接措辞：`context-compression`。
- 不需要文件支持存储的 token 效率策略：`context-optimization`。
- 多智能体拓扑或交接协议设计：`multi-agent-patterns`。

## 核心概念

根据以下四种模式诊断上下文故障，因为每种模式都需要不同的文件系统补救措施：

1. **上下文缺失**——所需信息不在全部可用上下文中。解决方法是将工具输出和中间结果持久保存到文件，确保不会丢失任何内容。
2. **上下文检索不足**——检索到的内容未能涵盖智能体所需的信息。解决方法是对文件进行结构化，以便有针对性地检索（采用便于 grep 的格式、清晰的章节标题）。
3. **上下文检索过度**——检索到的内容远超实际所需，浪费 token 并削弱注意力。解决方法是将大量内容卸载到文件中，并返回简洁的引用。
4. **上下文埋藏**——小众信息隐藏在许多文件之中。解决方法是结合 glob 和 grep 进行结构化搜索，同时使用语义搜索处理概念性查询。

将文件系统用作解决上述四类问题的持久层：一次写入、持久存储、选择性检索。

## 详细主题

### 静态上下文与动态上下文之间的权衡

将静态上下文（系统指令、工具定义、关键规则）视为昂贵的空间资源——无论是否相关，它都会在每一轮交互中消耗 token。随着智能体不断积累能力，静态上下文会持续增长，并挤占动态信息的空间。

改用动态上下文发现：仅包含最少量的静态指引（名称、单行描述、文件路径），并在相关时使用搜索工具加载完整内容。这样可以提高 token 使用效率，而且通过减少窗口中相互矛盾或不相关的信息，通常还能提升响应质量。

接受这种权衡：动态发现要求模型能够识别何时需要更多上下文。当前的前沿模型在这方面表现良好，但能力较弱的模型可能无法触发加载。如有疑虑，应倾向于静态包含关键的安全性或正确性约束。

### 模式 1：将文件系统用作暂存区

将大型工具输出重定向到文件，而不是直接将其返回到上下文中，因为一次 Web 搜索或数据库查询就可能向消息历史记录中倾倒数千个 token，而这些内容会在整个对话期间持续存在。

将输出写入暂存文件，提取简洁摘要，并返回文件引用。然后，智能体使用定向检索（使用 grep 搜索模式、使用带行范围的 read_file 读取）来仅访问其所需内容。

```python
def handle_tool_output(output: str, threshold: int = 2000) -> str:
    if len(output) < threshold:
        return output

    file_path = f"scratch/{tool_name}_{timestamp}.txt"
    write_file(file_path, output)

    key_summary = extract_summary(output, max_tokens=200)
    return f"[Output written to {file_path}. Summary: {key_summary}]"
```

使用 grep 搜索卸载后的文件，并使用带行范围的 read_file 检索目标部分，因为这样既能保留完整输出以供稍后引用，又能让活动上下文中仅保留约 100 个 token。

### 模式 2：计划持久化

将计划写入文件系统，因为在长期任务中，当计划脱离注意范围或在摘要过程中丢失时，任务就会失去连贯性。智能体可以随时重新读取计划，恢复对目标和进度的认知。

以结构化格式存储计划，使其既便于人类阅读，也可由机器解析：
```yaml
# scratch/current_plan.yaml
objective: "Refactor authentication module"
status: in_progress
steps:
  - id: 1
    description: "Audit current auth endpoints"
    status: completed
  - id: 2
    description: "Design new token validation flow"
    status: in_progress
  - id: 3
    description: "Implement and test changes"
    status: pending
```

在每轮开始时或任何上下文刷新后重新读取计划，以重新确定方向，因为这相当于“通过复述来操控注意力”。

### 模式 3：子智能体通过文件系统通信

让子智能体通过文件系统传递发现，而不是通过消息传递，因为多跳消息链会在每一跳的摘要过程中造成信息损耗（“传话游戏”）。

让每个子智能体直接写入其各自的工作区目录。协调器直接读取这些文件，从而完整保留原始信息：
```
workspace/
  agents/
    research_agent/
      findings.md
      sources.jsonl
    code_agent/
      changes.md
      test_results.txt
  coordinator/
    synthesis.md
```

强制实施每个智能体的目录隔离，以防止写入冲突，并明确每项输出产物的所有权。

### 模式 4：动态加载 Skill

将 Skill 存储为文件，并在静态上下文中仅包含 Skill 名称及其简短描述，因为将所有指令都塞入系统提示词会浪费 token，还可能因相互矛盾的指导而使模型感到困惑。

```
Available skills (load with read_file when relevant):
- database-optimization: Query tuning and indexing strategies
- api-design: REST/GraphQL best practices
- testing-strategies: Unit, integration, and e2e testing patterns
```

仅当当前任务需要时，才加载完整的技能文件（例如 `skills/database-optimization/SKILL.md`）。这会将 O(n) 的静态令牌成本转换为每个任务 O(1) 的成本。

### 模式 5：终端与日志持久化

自动将终端输出持久化到文件，并使用 grep 进行选择性检索，因为长时间运行的进程所产生的终端输出会迅速累积，而手动复制粘贴容易出错。

```
terminals/
  1.txt    # Terminal session 1 output
  2.txt    # Terminal session 2 output
```

使用有针对性的 grep（`grep -A 5 "error" terminals/1.txt`）进行查询，而不是将完整的终端历史记录加载到上下文中。

### 模式 6：通过自我修改进行学习

让智能体将学到的偏好和模式写入其自身的指令文件，以便后续会话自动加载这些上下文，而无须手动更新系统提示词。

```python
def remember_preference(key: str, value: str):
    preferences_file = "agent/user_preferences.yaml"
    prefs = load_yaml(preferences_file)
    prefs[key] = value
    write_yaml(preferences_file, prefs)
```

应通过验证机制约束此模式，因为随着时间推移，自我修改可能会累积不正确或相互矛盾的指令。将其视为实验性功能——定期审查持久化的偏好。

### 文件系统搜索技巧

结合使用 `ls`/`list_dir`、`glob`、`grep` 和带行范围的 `read_file` 来发现上下文，因为模型经过了专门的文件系统遍历训练；对于结构模式清晰的技术内容，这种组合通常优于语义搜索。

- `ls` / `list_dir`：发现目录结构
- `glob`：查找与模式匹配的文件（例如 `**/*.py`）
- `grep`：搜索文件内容，并返回带上下文的匹配行
- 带范围的 `read_file`：读取特定部分，而无须加载整个文件

对于结构化查询和精确匹配查询，使用文件系统搜索；对于概念性查询，使用语义搜索。将两者结合起来，以实现全面的信息发现。

## 实用指南

### 何时使用文件系统上下文

当情况符合以下标准时，应用文件系统模式，因为它们会增加 I/O 开销，只有令牌节省或持久化需求才能证明这种开销是合理的：

**适合使用的情况：**
- 工具输出超过约 2000 个令牌
- 任务跨越多个对话轮次
- 多个智能体需要共享状态
- 技能或指令超出系统提示词可轻松容纳的大小
- 日志或终端输出需要选择性查询

**应避免使用的情况：**
- 任务可在单轮内完成（额外开销不值得）
- 上下文可以轻松容纳在窗口中（没有需要解决的问题）
- 延迟至关重要（文件 I/O 会带来可测量的延迟）
- 模型缺乏文件系统工具能力

### 文件组织

为便于智能体发现来组织文件，因为智能体通过列出并读取目录名称来进行导航：
```
project/
  scratch/           # Temporary working files
    tool_outputs/    # Large tool results
    plans/           # Active plans and checklists
  memory/            # Persistent learned information
    preferences.yaml # User preferences
    patterns.md      # Learned patterns
  skills/            # Loadable skill definitions
  agents/            # Sub-agent workspaces
```

使用一致的命名约定，并在暂存文件中包含时间戳或 ID，以避免混淆。

对于自主研究循环，将检索到的原始证据存放在使用它的运行目录下，例如 `researcher/runs/<run-id>/sources/evidence/raw/`。不要将原始研究数据堆放在仓库根目录中；根目录级别的产物难以审计，也很容易在缺少来源信息的情况下被引用。

### Token 核算

在应用文件系统模式前后，衡量 Token 的来源，因为未经衡量的优化会导致精力浪费：
- 跟踪静态上下文与动态上下文的比例
- 监控卸载前后的工具输出大小
- 衡量动态加载的上下文实际被使用的频率

## 示例

**示例 1：工具输出卸载**
```
Input: Web search returns 8000 tokens
Before: 8000 tokens added to message history
After:
  - Write to scratch/search_results_001.txt
  - Return: "[Results in scratch/search_results_001.txt. Key finding: API rate limit is 1000 req/min]"
  - Agent greps file when needing specific details
Result: ~100 tokens in context, 8000 tokens accessible on demand
```

**示例 2：动态加载 Skill**
```
Input: User asks about database indexing
Static context: "database-optimization: Query tuning and indexing"
Agent action: read_file("skills/database-optimization/SKILL.md")
Result: Full skill loaded only when relevant
```

**示例 3：将聊天历史作为文件引用**
```
Trigger: Context window limit reached, summarization required
Action:
  1. Write full history to history/session_001.txt
  2. Generate summary for new context window
  3. Include reference: "Full history in history/session_001.txt"
Result: Agent can search history file to recover details lost in summarization
```

## 指南

1. 将大型输出写入文件；在上下文中返回摘要和引用
2. 将计划和状态存储在结构化文件中，以便重新读取
3. 使用子智能体的文件工作区，而不是消息链
4. 动态加载 Skill，而不是将所有内容都塞进系统提示词
5. 将终端和日志输出持久化为可搜索的文件
6. 结合 grep/glob 与语义搜索，实现全面发现
7. 使用清晰的命名方式组织文件，便于智能体发现
8. 衡量 Token 节省量，以验证文件系统模式是否有效
9. 为暂存文件实施清理机制，防止其无限增长
10. 通过验证机制保护自修改模式
11. 将原始证据与使用它的运行、评估和提案存放在一起

## 注意事项

1. **暂存目录无限增长**：智能体创建临时文件但不进行清理，最终会耗尽磁盘空间，并使目录列表变得杂乱。实施保留策略（基于时间或数量），并在会话边界执行清理。
2. **多智能体文件访问中的竞态条件**：并发写入同一文件会在不易察觉的情况下破坏状态。强制实施每个智能体的目录隔离，或使用带有智能体前缀条目的仅追加文件。
3. **移动或重命名后的过时文件引用**：智能体持有前几个轮次中的路径，但这些路径在重构或文件重组后已不再存在。读取缓存路径前始终验证文件是否存在；如果检查失败，则使用 glob 重新发现。
4. **Glob 模式误匹配**：过于宽泛的模式（例如 `**/*`）会将不相关文件拉入上下文，浪费 Token 并使模型产生混淆。将 glob 的范围限定到特定目录和扩展名。
5. **文件大小假设**：不检查大小就读取文件，可能会在单次工具调用中将 100K+ Token 的内容转储到上下文中。读取前检查文件大小；对大文件使用按行范围读取。
6. **缺少文件存在性检查**：智能体假设前几个轮次中的文件仍然存在，但它们可能已被删除或移动。读取操作前始终进行存在性检查，并妥善处理文件缺失错误。
7. **暂存区格式漂移**：非结构化暂存区经过多次写入后会变得无法解析，因为格式约定会随着连续追加而逐渐失效。从第一次写入开始就定义并强制执行一种模式（YAML、JSON 或结构化 Markdown）。
8. **硬编码绝对路径**：当仓库被检出到不同位置或在容器中运行时会失效。使用相对于项目根目录的路径，或动态解析路径。

## 集成

此技能负责基于文件的上下文存储与检索。相邻技能分别负责语义记忆、摘要和拓扑：

- `context-optimization`：当完整输出仍可检索时，将内容卸载到文件系统是实现观察遮蔽的一种方式。
- `memory-systems`：当基于文件的笔记已不足以满足需求，并且需要语义、实体或时间检索时使用。
- `multi-agent-patterns`：子智能体文件工作区可实现上下文隔离和直接交接。
- `context-compression`：文件引用可以作为摘要的锚点，并保留压缩上下文中省略的细节。
- `tool-design`：对于大型输出，工具应返回文件引用，并提供安全的读取/搜索操作。

## 参考资料

内部参考资料：
- [实现模式](./references/implementation-patterns.md) - 阅读时机：实现暂存区、计划持久化或工具输出卸载，并且需要内联示例之外的具体代码时

此集合中的相关技能：
- context-optimization - 阅读时机：将令牌缩减技术与文件系统卸载结合应用时
- memory-systems - 阅读时机：构建可在单次会话结束后继续存在的持久化存储时
- multi-agent-patterns - 阅读时机：设计使用共享文件工作区的智能体协调机制时

外部资源：
- LangChain Deep Agents — 阅读时机：在 LangChain/LangGraph 流水线中实现基于文件系统的上下文模式时
- Cursor context discovery — 阅读时机：研究生产级 IDE 如何实现动态上下文加载时
- Anthropic Agent Skills specification — 阅读时机：构建利用文件系统渐进式披露的技能时

---

## 技能元数据

**创建日期**：2026-01-07
**最后更新日期**：2026-05-15
**作者**：上下文工程智能体技能贡献者
**版本**：1.2.0