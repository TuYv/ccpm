---
name: vague
description: This skill should be used when the user's request or requirement is ambiguous and needs iterative questioning to become actionable. Trigger on "clarify requirements", "refine requirements", "요구사항 명확히", "요구사항 정리", "뭘 원하는 건지", "make this clearer", "spec this out", "scope this", "/clarify". Turns vague inputs into concrete specs. For strategy blind spots use unknown; for content-vs-form reframing use metamedium.
---
# Vague：需求澄清

通过假设驱动的提问，将模糊或含糊的需求转化为精确、可执行的规格说明。**始终使用 AskUserQuestion 工具**——绝不要以纯文本形式提出澄清性问题。

## 何时使用

- 含糊的功能请求（“添加登录功能”）
- 不完整的 bug 报告（“导出功能坏了”）
- 规格不足的任务（“让应用更快”）

如需进行策略/规划盲点分析，请使用 **unknown** 技能。如需对内容与形式进行重新框定，请使用 **metamedium** 技能。

## 核心原则：假设即选项

将合理的解释以选项形式呈现，而不是提出开放式问题。每个选项都是一个关于用户真实意图的可检验假设。

```
BAD:  "What kind of login do you want?"           ← open question, high cognitive load
GOOD: "OAuth / Email+Password / SSO / Magic link" ← pick one, lower load
```

## 协议

### 阶段 1：捕获与诊断

逐字记录原始需求。识别模糊之处：
- 哪些内容不清晰或规格不足？
- 需要做出哪些假设？
- 哪些决策留待解读？

### 阶段 2：迭代式澄清

使用 AskUserQuestion 解决模糊之处。**每次调用最多批量提出 4 个相关问题。**每个选项都是关于用户意图的一个假设。

**上限：总共 5-8 个问题。**当所有关键模糊之处均已解决，或用户表示“足够好了”，或达到上限时，即应停止。

**AskUserQuestion 调用示例：**
```
questions:
  - question: "Which authentication method should the login use?"
    header: "Auth method"
    options:
      - label: "Email + Password"
        description: "Traditional signup with email verification"
      - label: "OAuth (Google/GitHub)"
        description: "Delegated auth, no password management needed"
      - label: "Magic link"
        description: "Passwordless email-based login"
    multiSelect: false
  - question: "What should happen after registration?"
    header: "Post-signup"
    options:
      - label: "Immediate access"
        description: "User can use the app right away"
      - label: "Email verification first"
        description: "Must confirm email before access"
    multiSelect: false
```

### 阶段 3：前后对比总结

展示转化结果：

```markdown
## Requirement Clarification Summary

### Before (Original)
"{original request verbatim}"

### After (Clarified)
**Goal**: [precise description]
**Scope**: [included and excluded]
**Constraints**: [limitations, preferences]
**Success Criteria**: [how to know when done]

**Decisions Made**:
| Question | Decision |
|----------|----------|
| [ambiguity 1] | [chosen option] |
```

### 阶段 4：保存选项

询问是否将澄清后的需求保存到文件。默认位置：`requirements/` 或适合项目的目录。

## 模糊类别

| 类别 | 示例假设 |
|----------|-------------------|
| **范围** | 所有用户 / 仅管理员 / 特定角色 |
| **行为** | 静默失败 / 显示错误 / 自动重试 |
| **接口** | REST API / GraphQL / CLI |
| **数据** | JSON / CSV / 两者 |
| **约束** | <100ms / <1s / 无要求 |
| **优先级** | 必须有 / 最好有 / 未来再做 |

## 规则

1. **是假设，而非开放式问题**：每个选项都是一种合理的解释
2. **不做假设**：提问，而非臆断
3. **保留意图**：细化，而非改变方向
4. **最多 5-8 个问题**：超过便会令人疲劳
5. **批量提出相关问题**：每次 AskUserQuestion 调用最多 4 个
6. **跟踪变更**：始终展示前后对比
