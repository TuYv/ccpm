---
name: patch-notes
description: "Generate player-facing patch notes from git history, sprint data, and internal changelogs. Translates developer language into clear, engaging player communication."
argument-hint: "[version] [--style brief|detailed|full]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash
model: haiku
agent: community-manager
---
## 阶段 1：解析参数

- `version`：要为其生成说明的发布版本（例如 `1.2.0`）
- `--style`：输出风格——`brief`（要点列表）、`detailed`（包含上下文）、`full`（包含开发者评论）。默认值：`detailed`。

如果未提供版本，请先询问用户再继续。

---

## 阶段 2：收集变更数据

- 如果存在，请读取 `production/releases/[version]/changelog.md` 中的内部变更日志
- 同时检查 `docs/CHANGELOG.md` 中对应版本的条目
- 作为后备方案，运行 `git log`，获取上一个发布标签与当前标签/HEAD 之间的记录
- 阅读 `production/sprints/` 中的冲刺回顾以了解背景信息
- 阅读 `design/balance/` 中的所有平衡性变更文档
- 如果有 QA 提供的错误修复记录，请一并读取

**如果没有可用的变更日志数据**（`production/releases/[version]/changelog.md`
和 `docs/CHANGELOG.md` 中的对应版本条目均不存在，并且 git 日志为空或不可用）：

> “未找到 [version] 的变更日志数据。请先运行 `/changelog [version]` 生成
> 内部变更日志，然后重新运行 `/patch-notes [version]`。”

判定：**BLOCKED**——到此停止，不生成说明。

---

## 阶段 2b：检测语气指南和模板

**语气指南检测**——在起草说明之前，检查是否存在写作风格指南：

1. 检查 `.claude/docs/technical-preferences.md` 中是否存在任何“语气”“口吻”或“风格”
   字段或章节。
2. 如果 `docs/PATCH-NOTES-STYLE.md` 存在，请检查该文件。
3. 如果 `design/community/tone-guide.md` 存在，请检查该文件。
4. 如果任何来源包含语气/口吻/风格说明，请提取这些说明，并将其应用于
   所生成说明的语言和表述方式。
5. 如果所有位置均未找到语气指南，则默认采用：
   对玩家友好的非技术性语言；充满热情但不过度夸张；
   重点描述玩家的体验，而非开发者所做的更改。

**模板检测**——检查是否存在补丁说明模板：

1. 使用 Glob 查找 `docs/patch-notes-template.md` 和 `.claude/docs/templates/patch-notes-template.md`。
2. 如果在任一位置找到模板，请读取该模板，并在阶段 4 中使用它作为输出结构，
   而不是使用内置风格模板（简洁 / 详细 / 完整）。使用已分类的数据填充
   模板中的各个章节。
3. 如果未找到，则使用阶段 4 中定义的内置风格模板。

---

## 阶段 3：分类和转换表述

将所有变更划分到面向玩家的类别中：

- **新内容**：新功能、地图、角色、物品、模式
- **玩法变更**：平衡性调整、机制变更、成长系统变更
- **体验优化**：UI 改进、便捷功能、无障碍功能
- **错误修复**：按系统分组（战斗、UI、网络等）
- **性能**：玩家可能注意到的优化改进
- **已知问题**：透明说明尚未解决的问题

将开发者语言转换为玩家语言：

- “重构了伤害计算管线” → “提高了命中检测的准确性”
- “修复了物品栏管理器中的空引用” → “修复了打开物品栏时发生崩溃的问题”
- “减少了战斗循环中的 GC 分配” → “提升了战斗性能”
- 移除不会影响玩家的纯内部变更
- 保留平衡性变更中的具体数值（伤害：50 → 45）

---

## 阶段 4：生成补丁说明

### 简洁样式
```markdown
# Patch [Version] — [Title]

**New**
- [Feature 1]
- [Feature 2]

**Changes**
- [Balance/mechanic change with before → after values]

**Fixes**
- [Bug fix 1]
- [Bug fix 2]

**Known Issues**
- [Issue 1]
```

### 详细样式
```markdown
# Patch [Version] — [Title]
*[Date]*

## Highlights
[1-2 sentence summary of the most exciting changes]

## New Content
### [Feature Name]
[2-3 sentences describing the feature and why players should be excited]

## Gameplay Changes
### Balance
| Change | Before | After | Reason |
| ---- | ---- | ---- | ---- |
| [Item/ability] | [old value] | [new value] | [brief rationale] |

### Mechanics
- **[Change]**: [explanation of what changed and why]

## Quality of Life
- [Improvement with context]

## Bug Fixes
### Combat
- Fixed [description of what players experienced]

### UI
- Fixed [description]

### Networking
- Fixed [description]

## Performance
- [Improvement players will notice]

## Known Issues
- [Issue and workaround if available]
```

### 完整样式
包含详细样式中的所有内容，另外还包括：
```markdown
## Developer Commentary
### [Topic]
> [Developer insight into a major change — why it was made, what was considered,
> what the team learned. Written in first-person team voice.]
```

---

## 阶段 5：检查输出

检查生成的说明是否符合以下要求：

- 不含内部术语（将技术术语替换为玩家易于理解的语言）
- 不引用内部系统、工单或冲刺编号
- 平衡性改动包含改动前后的数值
- Bug 修复描述玩家遇到的体验，而不是技术原因
- 语气符合游戏的风格（根据游戏风格调整正式程度）

---

## 阶段 6：保存补丁说明

向用户展示完成的补丁说明，并附上：按类别统计的改动数量，以及所有被排除的内部改动（供审核）。

询问：“可以将这些补丁说明写入 `docs/patch-notes/[version].md` 吗？”

如果用户同意，则将文件写入 `docs/patch-notes/[version].md`，并在需要时创建目录。同时写入 `production/releases/[version]/patch-notes.md`，作为内部存档副本。

---

## 阶段 7：后续步骤

结论：**已完成**——补丁说明已生成并保存。

- 发布前运行 `/release-checklist`，验证所有其他发布门槛均已满足。
- 在公开发布前，与社区经理分享补丁说明草稿，以审核其语气。