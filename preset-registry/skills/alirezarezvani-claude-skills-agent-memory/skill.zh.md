---
name: agent-memory
description: Use when a project's CLAUDE.md has grown past what anyone reads and you want the agent to learn durable facts from its own sessions instead — or when asking why the agent keeps re-learning the same correction, why a remembered rule is wrong, or where a memory line came from. Implements a four-tier store (L0 transcripts / L1 candidates / L2 project context / L3 stable persona) where promotion is earned by recurrence across sessions and days, never by one confident statement, and nothing reaches a committed file without a human adopting it.
argument-hint: "[optional: status | why \"<claim>\" | a tier name]"
license: MIT
metadata:
  version: 1.0.0
  build_pattern: "Tencent TencentDB-Agent-Memory's tiering concept rebuilt natively on Claude Code hooks; deterministic recurrence gates, no LLM, no database"
  distinct_from: "llm-wiki (a vault you write on purpose; this writes itself from sessions); skillopt-sleep (replays tasks to improve a skill; this extracts facts to remember); memory-engineering (audits and prices any memory system; this IS one, and is a legitimate subject of that audit)"
---
# Agent Memory — 晋升靠积累，而不是自称

> **可移植性：** 仅使用标准库。不需要数据库、嵌入、网络或 LLM 调用。

## 问题

项目的 `CLAUDE.md` 是一个只有一层且不会淘汰内容的记忆系统：每个持久事实和每个临时偏好都会进入同一个始终加载的文件，直到重要内容被偶然信息稀释。会话中途了解到的事实会在会话结束时消失，除非有人把它们写下来。

**解决方案不是增加存储空间，而是建立晋升阶梯。** 一条声明只有在反复出现后，才会逐步进入始终加载的上下文；最后一步需要人工确认。

## 四个层级

层级由**注入策略**区分，而不是由存储格式区分。

| 层级 | 保存内容 | 注入时机 | 提交条件 |
|---|---|---|---|
| **L0** | 原始会话记录 | 从不 | 否（已在磁盘上） |
| **L1** | 候选原子信息 | 在提示时根据相关性注入 | 否（已被 gitignore） |
| **L2** | 本项目的上下文 | 每次会话开始时 | 是，在采纳后 |
| **L3** | 跨项目稳定人格 | 始终 | 是，在采纳后 |

## 晋升门槛

内容不会因为听起来重要就自动晋升。只有因为它反复出现，才会晋升。

- **L0 → L1** — 显式标记触发（指令、更正、明确表达的偏好、命名的经验教训、可复现的失败）。基于规则，精确率高，并刻意保持较低的召回率。
- **L1 → L2** — ≥ 3 个不同会话，跨越 ≥ 2 个不同日历日。一条直接陈述的声明需要 2 个会话；不同日期的规则仍然适用。经过验证的声明在一次观察后即可晋升，是唯一不受日期限制的路径。
- **L2 → L3** — 存在于 ≥ 2 个不同项目中，存续时间 ≥ 30 天，且没有争议。

**有两个门槛会拒绝而不是猜测。** 如果一条声明的文本被脱敏修改过，它永远不会仅凭证据晋升——触发标记本身就说明来源包含敏感信息，而词法过滤器发现一个秘密，并不能证明它发现了全部秘密。如果一条声明存在未解决的矛盾，它会被冻结在 L1，直到人工解决；现有内容绝不会被静默覆盖。

## 使用方法

```bash
# what is remembered, and what is blocking the next promotion
python3 scripts/memory_inspect.py --tier L1

# where did this line come from — sessions, days, transcript, quoted source
python3 scripts/memory_inspect.py --why "PR base branch is dev"

# every claim with an open contradiction, both directions of the join
python3 scripts/memory_inspect.py --contested

# dry-run the promotion pass; writes nothing
python3 scripts/memory_promote.py
```

三个钩子会在无人干预的情况下运行整个循环：`SessionStart` 注入 L2 + L3，`UserPromptSubmit` 召回相关的 L1 原子信息，`SessionEnd` 捕获并暂存。可以通过 `AGENT_MEMORY_SESSIONSTART=0`、`AGENT_MEMORY_USERPROMPTSUBMIT=0`、`AGENT_MEMORY_SESSIONEND=0` 分别禁用每个钩子。每个钩子都会失败开放：记忆系统损坏只会让你失去记忆，绝不会让会话中断。

## 硬性规则

1. **写入前先脱敏。** 每个原子信息在写入磁盘前都必须经过过滤器。任何被修改过的内容都会被隔离，禁止晋升。
2. **只提议，绝不直接应用。** 晋升内容会写入 `.memory/staged/`。只有显式执行 `/cs:memory adopt` 才会修改 `CLAUDE.md`，并且会先备份这两者。
3. **引用来源，不要凭空捏造。** 每个原子信息都带有一个反向指针，指向产生它的记录行。`--why` 如果解析结果为*不明确*，则什么也不打印，而不是进行猜测：错误的引用比缺少引用更糟。
4. **绝不将存在争议的声明作为事实呈现。** 它仍然会被注入——隐藏冲突更糟——但始终会带有标记。
5. **已提交的层级不包含任何路径。** 晋升会移除反向指针前缀，该前缀中包含操作系统用户名。

## 强制性问题

在信任该存储之前，逐一回答以下问题。

1. 你在采取行动之前，最后实际阅读的是 `CLAUDE.md` 中的哪一行？
2. 你更希望代理忘记一件真实的事情，还是记住一件错误的事情？
3. 当两条记住的规则发生冲突时，由谁决定——何时决定？
4. 什么情况会让你彻底删除 `.memory/`？

设计依据、未决决定、字段架构：[`../../DESIGN.md`](../../DESIGN.md)。