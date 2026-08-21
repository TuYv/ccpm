---
name: common-context-optimization
description: Maximize context window efficiency, reduce latency, and prevent lost-in-middle issues through strategic masking and compaction. Use when token budgets are tight, tool outputs overflow the context, conversations drift from intent, or latency spikes from cache misses.
metadata:
  triggers:
    files:
    - '*.log'
    - 'chat-history.json'
    keywords:
    - reduce tokens
    - optimize context
    - summarize history
    - clear output
---
## **优先级：P1（高）**


## 1. 观察结果遮蔽（减少噪声）

**问题**：大型工具输出（日志、JSON 列表）会淹没上下文并削弱推理能力。  
**解决方案**：在使用完毕后，用语义摘要替换原始输出。

1. **识别**超过 50 行或 1 KB 的输出。
2. **立即提取**关键数据点。
3. **遮蔽**：重写历史记录，用摘要占位符替换原始数据。
4. **参阅** `references/masking.md` 了解相关模式。

有关遮蔽模式，请参阅[实现示例](references/implementation.md)。

## 2. 上下文压缩（状态保留）

**问题**：长对话会逐渐偏离最初意图。  
**解决方案**：采用递归摘要，优先保留_状态_而非_对话_。

1. **触发**：每 10 轮对话或 8k 个 token 执行一次压缩。
2. **压缩**：
 - **保留**：用户目标、当前任务、当前错误、关键决策。
 - **丢弃**：闲聊、中间工具调用、已纠正的假设。
3. **格式**：使用压缩后的状态更新系统提示词或记忆文件。
4. **参阅** `references/compaction.md` 了解相关算法。

有关压缩状态的格式，请参阅[实现示例](references/implementation.md)。

## 3. KV-Cache 感知（延迟）

**目标**：最大限度提高预填充缓存命中率。

- **静态前缀**：强制采用严格顺序——系统 -> 工具 -> RAG -> 用户。
- **仅追加**：绝不在历史记录中间插入内容；仅追加新轮次。

## 参考资料

- [观察结果遮蔽模式](references/masking.md)
- [压缩算法](references/compaction.md)

## 反模式

- **禁止转储原始工具输出**：提取数据后立即遮蔽大型输出。
- **禁止无限增长**：每 10 轮对话执行一次压缩，优先保留意图而非对话。
- **禁止中间插入**：仅追加历史记录可最大限度提高 KV 缓存命中率。