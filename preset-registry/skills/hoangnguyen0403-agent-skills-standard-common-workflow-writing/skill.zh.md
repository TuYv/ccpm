---
name: common-workflow-writing
description: Rules for writing concise, token-efficient workflow and skill files. Prevents over-building that requires costly optimization passes. Use when creating or editing workflow files, SKILL.md files, or new skill definitions.
metadata:
  triggers:
    files:
    - '.agents/workflows/*.md'
    - 'SKILL.md'
    keywords:
    - create workflow
    - write workflow
    - new skill
    - new workflow
---
# 工作流编写标准

## **优先级：P0（关键）**

## 核心规则

- **模板，而非示例**：工作流定义的是_结构_，而不是预填充的数据。智能体在运行时生成数据。
- **表格中不得包含示例行**：仅包含表头 + 1 个骨架行。绝不要填充虚假数据。
- **不得使用段落式说明**：如果项目符号或命令能够达到相同效果，则删除该段落。
- **不得预先回答问题**：不要记录智能体_将会_输出什么——让它自行输出。
- **合并连续步骤**：如果两个步骤总是一起执行，则将它们合并为一个步骤。

## 大小限制

| 文件类型 | 限制 | 超出限制时 |
| ----------------- | --------- | --------------------------------- |
| 工作流 `.md` | 80 行 | 将详细内容提取到 `references/` |
| SKILL.md | 100 行 | 将示例提取到 `references/` |
| 表格行数 | 8 | 提取到 `references/` |
| 内联代码块 | 10 行 | 提取到 `references/` |

## 工作流结构（顺序固定）

```
1. Goal (1 sentence)
2. Steps (imperative verb → command or checklist)
3. Output template (headers only, no pre-filled rows)
```

## 反模式

- **不得使用冗长的步骤开场白**：`"Before we start, it's important to understand..."` → 删除
- **不得使用预填充的报告行**：`| Security | P0 | ✅ PASS | CLIENT_ID moved to env |` → 删除
- **不得重复示例**：以不同格式两次展示相同概念 → 保留一个
- **不得使用“How to X”章节**：改为步骤指令
- **不得为显而易见的规则添加警告块**：仅为真正不明显的风险保留 `> ⚠️`
- **可移植的输出契约**：使用 `feature_status`、缺失的证据、所需的决策以及适配器中立的语言；在规范工作流中避免使用特定于运行时的工具名称、聊天频道、容器和挂载路径。

## 保存前快速自检

- [ ] 智能体能否在运行时根据上下文重建任何被删除的内容？如果可以 → 删除
- [ ] 每个表格行都是真实结构，而非示例数据吗？
- [ ] 是否存在可由项目符号列表替代的段落？
- [ ] 将内容删减一半后，是否仍足以让智能体采取行动？

## 规范响应锚点

应用此技能时，请在相关情况下保留以下领域术语或等效的具体示例：
- 80 行
- 删除