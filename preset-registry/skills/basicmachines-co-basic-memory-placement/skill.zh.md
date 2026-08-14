---
name: placement
description: Decide where a new note belongs in a Basic Memory project — which folder, matching project conventions read from a unified config file (basic-memory.md). Triggered automatically by a PreToolUse hook matching any MCP basic-memory write_note tool.
---
# 放置位置

在 Basic Memory 的 `write_note` 调用运行前，确定其 `directory` 参数。读取项目配置和全局配置（`basic-memory.md`），然后应用短路决策流程。

## 何时使用

此技能由 `PreToolUse` hook（匹配器：`mcp__.*__write_note`）自动调用，它会捕获任何 MCP basic-memory 变体——本地、云端或 claude.ai connector。你也可以在规划写入操作时直接调用它。

输入：笔记的标题和内容（均已起草），以及当前项目名称。

## 步骤（匹配后立即停止）

1. **读取配置**（先读取项目配置，再读取全局配置；如果本次对话中已有缓存，则复用）。
   - 项目：`read_note(project, "basic-memory")`——如果存在，则提取 `## Placements` 部分
   - 全局：`~/.basic-memory/basic-memory.md`——提取 `## Placements`。先查找 `### <project-name>`，然后查看 H2 标题下不属于子标题的内容。
2. **如果配置给出了明确答案** → 使用该答案。停止。
3. **通过 `list_directory` 列出项目目录树**。如果某个文件夹与主题明显匹配 → 使用该文件夹。停止。
4. **遵循先例。** 如果类似笔记已存放在特定位置（根目录或某个文件夹）——即使没有任何文件夹名称与主题完全匹配——也将新笔记放在那里。如有需要，使用 `search_notes` 查找先例。停止。
5. **只有在不存在配置规则、没有与主题明显匹配的文件夹，且没有先例时，才询问用户。** 不要仅仅因为没有完全匹配的主题就询问——有先例就足够了。

## 默认规则（没有适用规则时采用）

- 根据主题与现有文件夹进行匹配。
- 遵循先例：如果类似笔记已存放在某个位置，则直接放在那里，无需询问。
- 绝不静默创建新文件夹。创建前先询问。
- 避免使用大而全的文件夹（`misc/`、`notes/`、`tmp/`），除非它们已经存在。
- 遵循项目现有的目录深度和命名约定。
- 绝不使用基于日期或类型的文件夹，除非项目已经这样做。

## 缓存

如果你在本次对话前面已经读取过项目的 `basic-memory` 笔记或 `~/.basic-memory/basic-memory.md`，请复用已有内容。只有在对话中已知配置发生变化后（例如用户刚刚编辑了配置）才重新读取。

## 输出

设置待执行 `write_note` 调用的 `directory` 参数。如果项目的命名约定与建议的 slug 不同，还需调整 `title` 以符合该约定。

如果放置位置存在歧义（有多个合理的文件夹，或没有合适的位置），请先询问用户再继续。不要猜测。

## 范围

此技能决定笔记应放在**哪里**。它不会：
- 决定是否写入笔记（这是另一项独立事项）
- 将更新操作重定向到 `edit_note`（放置流程只负责设置 `write_note` 的 `directory`）
- 验证格式或 schema（这些是独立事项）
- 静默创建文件夹

## 配置文件参考

统一的 `basic-memory.md` 配置文件采用以下结构。H2 部分表示类别。H2 下的 H3 子部分表示项目专属覆盖项；H2 下不属于子标题的内容是该类别的默认配置。

```markdown
# Basic Memory config

## Projects
- work: default project for daily work
- personal: personal notes and reflections
- research: long-form research notes

## Placements
- Place into existing folders by topic match
- Never create new top-level folders without asking
- Match the project's existing naming convention
- Default depth: 1-2 levels; avoid deeper unless content demands it

### research
- Long-form notes go in `papers/`
- Quick references go in `refs/`
- Reading lists go in `reading-lists/`

## Formats
- Required frontmatter: title, type, date
- Observation categories: fact, decision, technique, problem, solution

## Schemas
### work
person:
  - name
  - email
  - role

project:
  - name
  - status
  - owner
```

有关配置模式的更多上下文，请参阅 `PLUGIN.md`。