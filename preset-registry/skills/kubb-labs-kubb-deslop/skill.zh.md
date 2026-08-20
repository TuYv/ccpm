---
name: deslop
description: Remove AI-generated code slop from a branch or diff. Use after writing or generating code to strip unnecessary comments, defensive checks, `any` casts, and style that does not match the surrounding file. For prose and markdown, use the humanizer skill instead.
---
# 去除代码垃圾

移除分支中引入的 AI 生成代码垃圾，使差异看起来像是由人编写的，并与周围文件及此仓库的约定保持一致。

## 适用场景

- 编写或生成一批代码之后、创建 PR 之前。
- 当差异中出现 AI 生成的典型迹象时：注释过多、防御性脚手架，或与现有文件冲突的代码风格。
- 散文和面向用户的 Markdown 不在此技能的处理范围内。请改用 `humanizer` 技能处理。

## 要移除的内容

- 人类不会添加的注释：重复说明代码已经清楚表达的内容，或与文件其余部分的注释密度不一致。
- 与当前区域惯例不符的防御性检查和 `try/catch` 块，尤其是在受信任或已经验证的代码路径上。`security` 规则要求在信任边界进行验证，而不是在内部代码中验证。
- 仅用于绕过类型错误的 `any` 类型转换。应改为修复类型。
- 本可通过提前返回来减少的深层嵌套。
- 与当前文件及 `code-style` 规则不一致的命名、导入或导出风格。

## 约束

- 除非是在修复明确的 bug，否则保持行为不变。
- 优先进行最小化、精准的修改，而不是大范围重写。
- 绝不要移除保护真实信任边界的检查或真正的错误处理。如果不确定某项检查是代码垃圾还是不可或缺的逻辑，请保留它。
- 不要为了让修改通过而弱化类型、lint 规则或测试。应修复根本原因。
- 编辑后，运行 `pnpm format && pnpm lint:fix` 并确保测试通过。
- 用 1–3 句话概述所做的修改。

## 相关技能

| 技能 | 用途 |
| --- | --- |
| [humanizer](../humanizer/SKILL.md) | 去除散文和面向用户的 Markdown 中的 AI 痕迹 |