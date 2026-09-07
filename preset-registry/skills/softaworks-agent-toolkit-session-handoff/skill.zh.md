---
name: session-handoff
description: "Creates comprehensive handoff documents for seamless AI agent session transfers. Triggered when: (1) user requests handoff/memory/context save, (2) context window approaches capacity, (3) major task milestone completed, (4) work session ending, (5) user says 'save state', 'create handoff', 'I need to pause', 'context is getting full', (6) resuming work with 'load handoff', 'resume from', 'continue where we left off'. Proactively suggests handoffs after substantial work (multiple file edits, complex debugging, architecture decisions). Solves long-running agent context exhaustion by enabling fresh agents to continue with zero ambiguity."
---
# 工作交接

创建全面的交接文档，使全新的 AI 智能体能够毫无歧义地无缝继续工作。解决长时间运行的智能体上下文耗尽问题。

## 模式选择

判断当前适用哪种模式：

**要创建交接文档？** 用户希望保存当前状态、暂停工作，或者上下文即将耗尽。
- 请遵循：下方的 CREATE 工作流

**要从交接文档恢复工作？** 用户希望继续之前的工作、加载上下文，或者提到了已有的交接文档。
- 请遵循：下方的 RESUME 工作流

**主动建议？** 在完成大量工作（5 次以上文件编辑、复杂调试、重大决策）之后，建议：
> “我们已经取得了显著进展。可以考虑创建一份交接文档，将此上下文保存下来供未来的会话使用。准备好后说 'create handoff' 即可。”

## CREATE 工作流

### 步骤 1：生成脚手架

运行智能脚手架脚本，创建一份预填充的交接文档：

```bash
python scripts/create_handoff.py [task-slug]
```

示例：`python scripts/create_handoff.py implementing-user-auth`

**对于延续型交接文档**（关联之前的工作）：
```bash
python scripts/create_handoff.py "auth-part-2" --continues-from 2024-01-15-auth.md
```

该脚本将：
- 按需创建 `.claude/handoffs/` 目录
- 生成带时间戳的文件名
- 预填充：时间戳、项目路径、git 分支、最近的提交、已修改的文件
- 如果延续自之前的交接文档，则添加交接链链接
- 输出文件路径以便编辑

### 步骤 2：完善交接文档

打开生成的文件，填写所有 `[TODO: ...]` 部分。请优先完成以下部分：

1. **当前状态摘要** - 目前正在进行的工作
2. **重要上下文** - 下一个智能体必须了解的关键信息
3. **立即执行的后续步骤** - 清晰、可立即执行的最初步骤
4. **已做出的决策** - 包含理由的选择（而不仅是结果）

请参考 [references/handoff-template.md](references/handoff-template.md) 中的模板结构作为指导。

### 步骤 3：校验交接文档

运行校验脚本，检查完整性与安全性：

```bash
python scripts/validate_handoff.py <handoff-file>
```

校验器会检查：
- [ ] 没有遗留的 `[TODO: ...]` 占位符
- [ ] 必需部分均已存在并填写完毕
- [ ] 未检测到疑似机密信息（API 密钥、密码、令牌）
- [ ] 被引用的文件均存在
- [ ] 质量评分（0-100）

**若检测到机密信息或评分低于 70，请勿最终确认该交接文档。**

### 步骤 4：确认交接

向用户报告：
- 交接文档的存放位置
- 校验评分及任何警告
- 已捕获上下文的摘要
- 下次会话的第一个行动事项

## RESUME 工作流

### 步骤 1：查找可用的交接文档

列出当前项目中的交接文档：

```bash
python scripts/list_handoffs.py
```

这会显示所有交接文档的日期、标题和完成状态。

### 步骤 2：检查时效性

在加载之前，先检查交接文档的新旧程度：

```bash
python scripts/check_staleness.py <handoff-file>
```

时效性等级：
- **FRESH**：可安全恢复 - 自交接以来改动极少
- **SLIGHTLY_STALE**：先审查变更，再恢复
- **STALE**：恢复前须仔细核实上下文
- **VERY_STALE**：考虑创建新的交接文档

该脚本会检查：
- 交接文档创建后经过的时间
- 交接以来的 git 提交
- 交接以来变更的文件
- 分支分歧
- 缺失的被引用文件

### 步骤 3：加载交接文档

在采取任何行动之前，请完整阅读相关的交接文档。

如果交接文档属于某个链条的一环（带有“延续自”链接），还应阅读所链接的前一份交接文档，以获取完整上下文。

### 步骤 4：核实上下文

按照 [references/resume-checklist.md](references/resume-checklist.md) 中的核实清单执行：

1. 核实项目目录和 git 分支是否匹配
2. 检查阻碍事项是否已解决
3. 验证各项假设是否依然成立
4. 审查已修改的文件是否存在冲突
5. 检查环境状态

### 步骤 5：开始工作

从交接文档中“立即执行的后续步骤”的第 1 项开始。

工作时请参考以下部分：
- “关键文件” - 重要位置
- “已发现的关键模式” - 需遵循的惯例
- “潜在陷阱” - 避免已知问题

### 步骤 6：更新交接文档或建立交接链

在工作过程中：
- 在“待办工作”中标记已完成的项目
- 将新的发现添加到相关部分
- 对于较长的会话：使用 `--continues-from` 创建新的交接文档进行串联

## 交接链

对于长期运行的项目，可将交接文档串联起来，以保持上下文脉络：

```
handoff-1.md (initial work)
    ↓
handoff-2.md --continues-from handoff-1.md
    ↓
handoff-3.md --continues-from handoff-2.md
```

链中的每份交接文档：
- 链接到其前一份交接文档
- 可将较旧的交接文档标记为已被取代
- 为新的智能体提供上下文线索

从交接链恢复时，先阅读最近的交接文档，再按需参考其前序文档。

## 存储位置

交接文档存储于：`.claude/handoffs/`

命名规范：`YYYY-MM-DD-HHMMSS-[slug].md`

示例：`2024-01-15-143022-implementing-auth.md`

## 资源

### scripts/

| 脚本 | 用途 |
|--------|---------|
| `create_handoff.py [slug] [--continues-from <file>]` | 通过智能脚手架生成新的交接文档 |
| `list_handoffs.py [path]` | 列出项目中可用的交接文档 |
| `validate_handoff.py <file>` | 检查完整性、质量和安全性 |
| `check_staleness.py <file>` | 评估交接文档的上下文是否仍然有效 |

### references/

- [handoff-template.md](references/handoff-template.md) - 附带指导说明的完整模板结构
- [resume-checklist.md](references/resume-checklist.md) - 供恢复工作的智能体使用的核实清单
