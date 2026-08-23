---
name: sensitive-logging-audit
description: Audit and fix sensitive-data exposure through Python runtime logging in openai-agents-python. Use when reviewing logging, print, warnings, stderr, traceback, MCP names, model or tool exceptions, redaction flags, or any diagnostic path that may retain user data.
---
# 敏感日志审计

## 目标

查找候选输出接收点，手动追踪其值，修复已证实在共享运行时边界发生的泄露，并通过对抗性测试证明脱敏有效。

收集器仅是一种基于语法的搜索辅助工具。它不会解析 Python 别名或控制流、验证策略保护措施，也无法证明未出现候选项就意味着安全。

## 工作流程

### 1. 确定审查范围

- 在当前检出版本中工作，并保留不相关的更改。
- 阅读 `src/agents/_debug.py`、`src/agents/logger.py` 以及受影响的调用方。
- 将异常消息、参数、回溯、原因、上下文、注释、名称、URL 和任意值视为潜在敏感信息。
- 阅读 [Python 脱敏验证矩阵](references/redaction-validation.md)。

运行收集器测试，然后收集候选项：

```bash
uv run python .agents/skills/sensitive-logging-audit/scripts/test_inventory.py
uv run python .agents/skills/sensitive-logging-audit/scripts/inventory_logging.py \
  --format json --output /tmp/sensitive-logging-candidates.json
```

该报告有意不包含任何 `policy`、`safe` 或保护措施分类。

### 2. 使用源代码搜索补充收集器

收集器不会跟踪诸如 `emit = logger.error` 之类的赋值。请直接搜索源代码，并检查别名、回调、包装器和反射式分派：

```bash
rg -n '\.(debug|info|warning|warn|error|exception|critical|fatal|log)\b' src/agents
rg -n '\b(print|pprint|pp|warn|warn_explicit|write|writelines|print_exc|print_exception)\b' src/agents
rg -n 'DONT_LOG_(MODEL|TOOL)_DATA|log_(model|tool|model_and_tool)_action' src/agents
```

不要根据收集器覆盖情况或文本形式的保护措施得出安全结论。应追踪数据生成方和调用方。

### 3. 手动分类

为每条已审查的路径指定一种处置类别：

- `model`：模型请求、响应、Realtime 事件或其派生值。
- `tool`：工具参数、输出、MCP 数据、工具事件或其派生值。
- `model+tool`：任一类别都可能到达该接收点。
- `operational`：已证实仅包含非敏感 SDK 元数据。
- `intentional-output`：明确面向用户的输出，而非诊断信息。
- `uncertain`：源代码追踪不完整。

在审计报告中记录证据。该脚本不会验证或继承处置类别。

### 4. 修复运行时边界

在更改运行时行为之前，使用 `$implementation-strategy`。

- 在格式化或检查敏感值之前，检查相关的 `_debug.DONT_LOG_MODEL_DATA` 和 `_debug.DONT_LOG_TOOL_DATA` 标志。
- 当任一标志禁用数据日志记录时，对混合的模型/工具值进行脱敏。
- 在脱敏模式下，输出固定消息，并省略敏感的 `args`、`extra` 和 `exc_info`。
- 以惰性方式构建仅用于诊断的上下文，确保脱敏模式永远不会读取这些上下文。
- 当明确启用敏感数据日志记录时，保留有用的诊断信息。
- 确保日志记录失败不会改变回退、清理、事件、拒绝或取消行为。
- 对于 MCP URL，在诊断模式下移除凭据、查询参数和片段；绝不要使用净化后的名称来替代固定的脱敏消息。

### 5. 证明调用方行为

在每个发生变更的调用方边界添加测试。检查完整的 `LogRecord`，而不仅仅是渲染后的文本。测试两种脱敏策略、诊断模式、恶意对象、异常链，以及调用方可观察到的回退或清理行为（如适用）。

### 6. 重新运行并收尾

重新运行收集器、手动搜索、针对性测试以及适用的仓库门禁。对于运行时或测试变更，使用 `$code-change-verification`；在需要时使用 `$pr-draft-summary`。

仅将候选项数量作为搜索覆盖范围进行报告。应优先报告已修复的确认泄漏、保留的有意输出、已审查的不确定项以及验证结果。绝不要将收集器的干净结果作为不存在敏感日志记录路径的证明。