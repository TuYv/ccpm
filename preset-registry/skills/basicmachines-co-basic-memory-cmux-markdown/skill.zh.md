---
name: cmux-markdown
description: Open markdown files in a formatted viewer panel with live reload. Use when you need to display plans, documentation, or notes alongside the terminal with rich rendering (headings, code blocks, tables, lists).
---
# 使用 cmux 的 Markdown 查看器

编写一个 `.md` 文件，在面板中打开它；每当磁盘上的文件发生变化时，面板都会重新渲染。可以将它用于在终端旁显示智能体计划和任务列表、工作期间查阅文档和变更日志，以及查看由其他进程逐步更新的笔记。

```bash
cmux markdown open plan.md                              # 在当前终端旁拆分面板
cmux markdown open /path/to/PLAN.md
cmux markdown open design.md --workspace workspace:2    # 也支持 --surface、--window
```

相对路径会基于调用者的 cwd 解析，并且 `~` 会被展开；解析后的绝对路径会在输出中返回。

## 智能体用法

先完整写入计划文件，再打开它，这样面板就不会显示仅写入了一部分的文件。之后可以自由覆盖或追加内容：每次写入都会触发重新渲染，并且支持原子替换（编辑器保存、`sed -i`、VS Code）。

若要为项目中的编码智能体提供指引，请将以下内容添加到项目的 `AGENTS.md`：

```markdown
## Plan Display

When creating a plan or task list, write it to a `.md` file and open it in cmux:

    cmux markdown open plan.md

The panel renders markdown with rich formatting and auto-updates when the file changes.
```

## 渲染

支持 h1-h6 标题（h1/h2 带分隔线）、使用等宽字体的围栏代码块、带高亮背景的行内代码、使用交替行颜色的表格、嵌套的有序和无序列表、带左边框的块引用、粗体/斜体/删除线、可点击链接、水平分隔线和行内图片。同时支持浅色和深色模式。

## 深入参考

| 参考资料 | 使用时机 |
|-----------|-------------|
| [references/commands.md](references/commands.md) | 完整的命令语法、选项、输出结构和面板行为 |
| [references/live-reload.md](references/live-reload.md) | 文件监视、原子写入、文件不可用状态和性能 |