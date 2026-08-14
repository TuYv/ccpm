---
name: code-review
description: Use when reviewing Basic Machines code for house style, architecture risk, pre-merge hardening, or whether a change fits basic-memory/basic-memory-cloud conventions.
license: MIT
---
# Basic Machines 审查

当需要根据 Basic Machines 的内部风格和架构判断，对仓库本地内容进行常规代码审查时，请使用此技能。仅报告发现；除非用户要求你修复具体问题，否则不要编辑代码。

## 范围

根据以下内容审查当前差异或指定文件：

- 仓库的 `AGENTS.md` / `CLAUDE.md`
- `docs/ENGINEERING_STYLE.md`
- 涉及的代码路径和测试

仅应用当前仓库的指导原则。在 `basic-memory` 中，优先关注本地优先的文件/数据库/MCP 边界。在 `basic-memory-cloud` 中，优先关注租户/工作区隔离、云端工作进程行为以及 web-v2 状态/运行时边界。

## 审查准则

仅报告具体且可证伪的风险：

- **认知负担：** 此变更是否比问题本身所要求的更难理解？
- **变更传播：** 一处产品变更是否会迫使修改多个不相关的层？
- **知识重复：** 同一规则是否被编码在多个可能发生偏离的位置？
- **偶然复杂性：** 此变更是否添加了不必要的抽象、回退机制或状态？
- **依赖方向：** API/MCP/CLI、服务、仓库和 UI 存储是否遵守其预期边界？
- **领域模型失真：** 名称和类型是否仍与产品概念一致，或者传输/存储细节是否泄漏到了领域中？
- **测试判定质量：** 对于此变更声称要防止的错误或回归，测试是否会失败？

## 需要明确检查的内部规则

- 禁止针对未知模型形态推测性地使用 `getattr(obj, "attr", default)`。
- 禁止宽泛地吞掉异常、仅发出警告的失败路径或隐藏的回退行为。
- 禁止使用类型转换或 `Any` 隐藏不明确的类型关系。
- 内部值/结果对象使用数据类；在验证/序列化边界使用 Pydantic。
- 当只需要某项能力时，使用范围窄的 `Protocol`。
- 明确异步/资源的所有权、取消和清理。
- 对高风险变更提供有意义的回归测试或验证。
- 注释解释原因，而不是描述代码行为。

## 报告格式

首先列出发现，并按严重程度排序。每项发现应包括：

| 严重程度 | 适用情况 |
| -------- | ------- |
| `high` | 很可能导致正确性、安全性、数据丢失或租户/工作区隔离失败 |
| `medium` | 可能导致未来缺陷的具体可维护性或边界风险 |
| `low` | 轻微的一致性问题、模糊的指导原则或仅与审查相关的清理事项 |

```text
severity | file:line | risk category | claim
Why: concrete behavior or code path that proves the risk.
Fix: smallest practical change, or "none obvious" if the risk needs product input.
```

如果没有发现问题，请明确说明，并注明仍然存在的验证缺口。