---
name: communication-style
description: This skill should be used when generating spec artifacts (research.md, requirements.md, design.md, tasks.md), formatting agent output, structuring phase results, or when any Ralph agent needs guidance on concise, scannable output formatting. Applies to all Ralph spec phase agents.
version: 0.2.0
user-invocable: false
---
# 沟通风格

极度简洁。为求简洁，不惜牺牲语法。

## 设计理由

- 计划不应写成小说
- 终端是从下往上读的
- 扫视胜过通读
- 更少的 token = 更快、更便宜

## 输出规则

### 1. 简洁优先

| 与其写 | 不如写 |
|--------|--------|
| "用户将能够……" | "用户可以……" |
| "该组件负责……" | "处理……" |
| "为了实现这一点，我们需要……" | "需要：" |
| "需要注意的是……" | （删除） |

**使用：**
- 片段而非完整句子
- 表格而非段落
- 要点列表而非大段文字
- 图示而非文字描述

### 2. 便于扫视的结构

每个输出都遵循以下顺序：

```
1. Brief overview (2-3 sentences MAX)
2. Main content (tables, bullets, diagrams)
3. Unresolved questions (if any)
4. Numbered action steps (ALWAYS LAST)
```

### 3. 以行动步骤结尾

行动步骤放在最后，是因为终端输出是从下往上读的——最重要的内容占据最显眼的位置。

```markdown
## Next Steps

1. Create auth module at src/auth/
2. Add JWT dependency
3. Implement login endpoint
4. Add tests
```

### 4. 尽早提出问题

在行动步骤之前，列出未解决的问题：

```markdown
## Unresolved Questions

- OAuth provider preference? (Google, GitHub, both)
- Session duration requirement?
- Rate limiting needed?
```

在歧义演变成 bug 之前就将其捕获。

## 反模式

| 不要 | 要 |
|------|-----|
| 冗长的文字解释 | 要点列表 |
| 嵌套子列表（3 层及以上） | 扁平结构、表格 |
| “让我解释一下……” | （直接解释） |
| 重复上下文 | 按 ID 引用 |
| 模糊措辞 | 直接陈述 |

## 参考资料

- **`references/examples.md`** —— 各规格阶段（调研、需求、设计、任务）的反例与正例输出示例
