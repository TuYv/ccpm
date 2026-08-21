---
name: common-session-retrospective
description: Analyze conversation corrections to detect skill gaps and prepare targeted skill-library maintenance tasks. Use after any session with user corrections, rework, or retrospective requests. After finding correction loops, also load +common/common-learning-log to persist mistake entries to AGENTS_LEARNING.md.
metadata:
  triggers:
    files:
    - '**/*.spec.ts'
    - '**/*.test.ts'
    - 'SKILL.md'
    - 'AGENTS.md'
    - '+common/common-learning-log'
    keywords:
    - retrospective
    - self-learning
    - improve skills
    - session review
    - correction
    - rework
---
# 会话复盘

## **优先级：P1（高）**

## 结构

```text
common/session-retrospective/
├── SKILL.md              # Protocol (this file)
└── references/
    └── methodology.md    # Signal tables, taxonomy, report template
```

## 协议

1. **提取** — 扫描纠正信号（循环、拒绝、形态不匹配、lint 返工）
2. **分类** — 根本原因：技能缺失 | 不完整 | 示例与规则矛盾 | 工作流缺口 | **触发遗漏**
3. **触发遗漏检查** — 对会话中的每个任务询问：_"存在相关技能但未加载？"_
 - 如果是：记录技能 ID、使用的间接表述以及修复方式（向触发器添加关键字别名）
4. **提出方案** — 每个根本原因对应一个修复方案：修订现有指导、更新参考资料、添加新技能或添加新工作流
5. **实施** — 仅当当前任务明确授权进行仓库维护时，才在配置的各代理目录中应用已批准的仓库变更。保持 SKILL.md 简洁；将大型表格移至 `references/`。更新 `AGENTS.md`
6. **记录到 AGENTS_LEARNING.md** — 对发现的每个纠正循环，使用 `common/common-learning-log` 协议追加一条记录（信号：`Session retrospective`）
7. **报告** — 输出纠正次数、变更的技能、发现的触发遗漏、预计节省的轮次

## 触发遗漏输出

为检测到的每个遗漏输出触发遗漏块（模式见 [references/methodology.md](references/methodology.md#trigger-miss-schema)）。

## 指南

- **引用具体信息**：每项方案均需引用对话中的具体时刻
- **优先扩展**：创建前先搜索 `AGENTS.md`——优先扩展现有指导
- **每个循环一个修复**：一次纠正 → 一项有针对性的技能变更
- **限定于任务范围**：仅在明确为该仓库执行维护工作时，才更改仓库的库源文件
- **同步所有代理**：应用到 `.skillsrc` 的 `agents` 字段中列出的每个代理技能目录
- **遵循 skill-creator**：新技能须符合 `common/skill-creator` 标准

## 反模式

- **禁止模糊方案**：明确指出具体缺口和修复方式，而不是“让 X 更好”
- **禁止重复技能**：先搜索 AGENTS.md 索引
- **禁止过大的补丁**：按照 skill-creator 标准提取到 `references/`

## 参考资料

信号表、根本原因分类法、报告模板、真实案例：
[references/methodology.md](references/methodology.md)

## 规范响应锚点

当此技能适用时，请在相关情况下保留以下领域术语或在回答中提供等效的具体示例：
- AGENTS.md 和 AGENTS_LEARNING.md