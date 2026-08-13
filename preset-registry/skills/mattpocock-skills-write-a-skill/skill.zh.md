---
name: write-a-skill
description: Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill.
---
# 编写 Skills

## 流程

1. **收集需求** - 询问用户：
   - 该技能覆盖什么任务/领域？
   - 它应处理哪些具体用例？
   - 是否需要可执行脚本，还是仅需说明文档？
   - 是否要包含参考材料？

2. **起草技能** - 创建：
   - 简洁指令的 `SKILL.md`
   - 如果内容超过 500 行则添加额外参考文件
   - 如需确定性操作则添加实用脚本

3. **与用户复核** - 提交草稿并询问：
   - 这是否覆盖了你的用例？
   - 有什么缺失或不清晰的地方吗？
   - 某个部分是否需要更详细或更简略？

## 技能结构

```
skill-name/
├── SKILL.md           # Main instructions (required)
├── REFERENCE.md       # Detailed docs (if needed)
├── EXAMPLES.md        # Usage examples (if needed)
└── scripts/           # Utility scripts (if needed)
    └── helper.js
```

## SKILL.md 模板

```md
---
name: skill-name
description: Brief description of capability. Use when [specific triggers].
---

# Skill Name

## Quick start

[Minimal working example]

## Workflows

[Step-by-step processes with checklists for complex tasks]

## Advanced features

[Link to separate files: See [REFERENCE.md](REFERENCE.md)]
```

## 描述要求

该描述是**代理决定加载哪个技能时唯一可见**的内容。它会与所有其他已安装技能一起显示在系统提示中。你的代理读取这些描述，并根据用户请求选择相关技能。

**目标**：向你的代理提供足够的信息以便知道：

1. 该技能提供什么能力
2. 何时/为何触发它（具体关键词、上下文、文件类型）

**格式**：

- 最多 1024 个字符
- 使用第三人称
- 第一条句子：说明它做什么
- 第二条句子：“在[具体触发条件]时使用”

**良好示例**：

```
Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when user mentions PDFs, forms, or document extraction.
```

**不良示例**：

```
Helps with documents.
```

该不良示例没有提供足够信息，使你的代理无法将其与其他文档技能区分开来。

## 何时添加脚本

在以下情况添加实用脚本：

- 操作具有确定性（验证、格式化）
- 相同代码会被反复生成
- 需要显式错误处理

脚本可以节省 token，并在与生成代码相比的情况下提高可靠性。

## 何时拆分文件

在以下情况拆分为多个文件：

- `SKILL.md` 超过 100 行
- 内容存在不同领域（如财务与销售 schema）
- 高级功能很少被需要

## 复核清单

起草完成后，校验：

- [ ] 描述包含触发条件（“在...时使用...”）
- [ ] `SKILL.md` 少于 100 行
- [ ] 没有时效性信息
- [ ] 术语使用一致
- [ ] 包含具体示例
- [ ] 引用层级为一级深度
