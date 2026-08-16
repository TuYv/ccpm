---
name: alpha
description: Fixture dispatcher with a mode table and forced-read references.
triggers: a-key-the-upstream-router-DOES-read
x-dead-key: a-key-no-router-reads
---
# Alpha

## 调度协议

1. 根据请求推断模式。
2. 每次调用都要读取 `references/CORE.md` 和 `references/POLICY.md`。在开展公开 Web 工作之前，读取 `references/OPTIONAL.md`。
3. 当目标是代码仓库时，在专家工作开始前读取一次 `references/CORE.md`；其费用已预先计入。

## 顶层模式

| 模式 | 推断条件 | 候选内部专家 |
|---|---|---|
| `Discovery` | 想法尚未定型。 | `references/legacy/office.md` |
| `Full chain` | 一次性处理所有事项。 | `references/legacy/auto.md` |