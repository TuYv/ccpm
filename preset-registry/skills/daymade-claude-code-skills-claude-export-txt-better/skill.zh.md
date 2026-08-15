---
name: fixing-claude-export-conversations
description: >
  Fixes broken line wrapping in Claude Code exported conversation files (.txt),
  reconstructing tables, paragraphs, paths, and tool calls that were hard-wrapped
  at fixed column widths. Includes an automated validation suite (generic, file-agnostic checks).
  Triggers when the user has a Claude Code export file with broken formatting,
  mentions "fix export", "fix conversation", "exported conversation", "make export
  readable", references a file matching YYYY-MM-DD-HHMMSS-*.txt, or has a .txt
  file with broken tables, split paths, or mangled tool output from Claude Code.
---
# 修复 Claude Code 导出的对话

重建 Claude Code 导出的 `.txt` 文件中损坏的换行。

## 快速开始

```bash
# Fix and show stats
uv run <skill-path>/scripts/fix-claude-export.py <export.txt> --stats

# Custom output
uv run <skill-path>/scripts/fix-claude-export.py <export.txt> -o fixed.txt

# Validate the result (53 automated checks)
uv run <skill-path>/scripts/validate-claude-export-fix.py <export.txt> fixed.txt
```

将 `<skill-path>` 替换为此 Skill 目录的已解析路径。使用以下命令查找：
```bash
find ~/.claude -path "*/fixing-claude-export-conversations/scripts" -type d 2>/dev/null
```

## 工作流程

复制此检查清单并跟踪进度：

```
- [ ] Step 1: Locate the exported .txt file
- [ ] Step 2: Run fix script with --stats
- [ ] Step 3: Run validation suite
- [ ] Step 4: Spot-check output (tables, CJK paragraphs, tool results)
- [ ] Step 5: Deliver fixed file to user
```

**步骤 1：找到文件。** Claude Code 导出文件使用命名模式 `YYYY-MM-DD-HHMMSS-<slug>.txt`。

**步骤 2：运行修复脚本。**
```bash
uv run <skill-path>/scripts/fix-claude-export.py <input.txt> -o <output.txt> --stats
```
检查统计信息输出——典型结果为：行数减少 20–25%，修复 80 多处表格边框以及 160 多个表格单元格。

**步骤 3：运行验证套件。**
```bash
uv run <skill-path>/scripts/validate-claude-export-fix.py <input.txt> <output.txt>
```
所有检查都必须通过。如果有任何检查失败，请先调查原因再交付。使用 `--verbose` 还可查看通过的检查的完整详情。

**步骤 4：抽查。** 打开输出并验证：
- 表格边框完整（制表字符位于单行中）
- 中英文混合文本包含盘古空格（应为 `Portal 都需要`，而不是 `Portal都需要`）
- 工具结果块（`⎿`）在合并后的行中包含完整内容
- 工具结果中的差异输出让每个行号各占一行

**步骤 5：将**修复后的文件交付给用户。

## 修复的内容

该脚本使用带有下一行前瞻的状态机处理 10 种内容类型：

- **用户提示词**（`❯` 前缀，dw=76 填充）——使用盘古空格合并段落
- **Claude 响应**（`●` 前缀）——合并叙述文本、项目符号列表和编号列表
- **Claude 段落**（缩进 2 个空格）——通过 `_is_continuation_fragment` 进行下一行前瞻
- **表格**——重建边框，通过跟踪竖线数量重新填充单元格
- **工具调用**（`● Bash(` 等）——重建路径和参数
- **工具结果**（`⎿` 前缀）——合并续行，包括缩进更深的片段
- **计划文本**（缩进 5 个空格）——通过 `_is_plan_continuation_fragment` 进行下一行前瞻
- **代理树**（`├─`/`└─`）——保留结构
- **分隔符**（`────`、`---`）——永不合并
- **树形连接符**（单独的 `│`）——予以保留

## 关键设计决策

**下一行前瞻**（而非 dw 阈值）：脚本不会询问“这一行是否被换行了？”（这种阈值很脆弱），而是通过检查下一行的内容模式——以小写字母开头、以 CJK 表意文字开头、以左括号开头，或连字符/斜杠/下划线延续——来判断“下一行是否看起来像续行？”。

**盘古式空格**：在连接边界处的 ASCII 字母数字字符与中日韩表意文字之间插入空格。当 `%`、`#`、`+`、`:` 与中日韩文字相邻时也会触发。

**词元中部检测**：当边界表明内容为标识符（`BASE_` + `URL`）、路径（`documents` + `/05-team`）或带连字符的名称（`ready` + `-together`）时，不添加空格直接连接。例外：`--` 前缀前会添加空格（`run` + `--headed`）。

## 安全性

- 绝不修改原始文件
- 验证标记数量：`❯`、`●`、`✻`、`⎿`、`…` 在输入和输出中必须一致
- 失控连接检测：如果任何一行的显示宽度超过 500，则发出警告
- 严格使用 UTF-8 编码——不进行静默回退

## 依赖项

通过 `uv run` 使用 Python 3.10+——无外部软件包（仅使用标准库：`unicodedata`、`argparse`、`re`、`pathlib`、`dataclasses`）。