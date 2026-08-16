---
name: scaffold-exercises
description: Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section.
---
# 搭建练习脚手架

创建能够通过 `pnpm ai-hero-cli internal lint` 检查的练习目录结构，然后使用 `git commit` 提交。

## 目录命名

- **章节**：位于 `exercises/` 内的 `XX-section-name/`（例如 `01-retrieval-skill-building`）
- **练习**：位于章节内的 `XX.YY-exercise-name/`（例如 `01.03-retrieval-with-bm25`）
- 章节编号 = `XX`，练习编号 = `XX.YY`
- 名称使用短横线命名法（小写字母、连字符）

## 练习变体

每个练习至少需要包含以下子文件夹之一：

- `problem/` - 包含 TODO 的学员工作区
- `solution/` - 参考实现
- `explainer/` - 概念性材料，不包含 TODO

创建占位脚手架时，除非计划另有指定，否则默认使用 `explainer/`。

## 必需文件

每个子文件夹（`problem/`、`solution/`、`explainer/`）都需要一个 `readme.md`，且该文件：

- **不能为空**（必须包含实际内容，即使只有一行标题也可以）
- 不得包含失效链接

创建占位脚手架时，使用包含标题和描述的最简 readme：

```md
# Exercise Title

Description here
```

如果子文件夹中包含代码，则还需要一个 `main.ts`（多于 1 行）。但对于占位脚手架，仅包含 readme 的练习即可。

## 工作流程

1. **解析计划** - 提取章节名称、练习名称和变体类型
2. **创建目录** - 对每个路径执行 `mkdir -p`
3. **创建占位 readme** - 在每个变体文件夹中创建一个带标题的 `readme.md`
4. **运行 lint** - 执行 `pnpm ai-hero-cli internal lint` 进行验证
5. **修复所有错误** - 反复修复，直到 lint 通过

## Lint 规则摘要

代码检查工具（`pnpm ai-hero-cli internal lint`）会检查：

- 每个练习都包含子文件夹（`problem/`、`solution/`、`explainer/`）
- 至少存在 `problem/`、`explainer/` 或 `explainer.1/` 之一
- 主子文件夹中存在非空的 `readme.md`
- 不存在 `.gitkeep` 文件
- 不存在 `speaker-notes.md` 文件
- readme 中不存在失效链接
- readme 中不存在 `pnpm run exercise` 命令
- 除非子文件夹只包含 readme，否则每个子文件夹都必须包含 `main.ts`

## 移动/重命名练习

重新编号或移动练习时：

1. 使用 `git mv`（而不是 `mv`）重命名目录，以保留 git 历史记录
2. 更新数字前缀以保持顺序
3. 移动后重新运行 lint

示例：

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## 示例：根据计划创建占位脚手架

给定如下计划：

```
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

创建：

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

然后创建 readme 占位文件：

```
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```