---
name: scaffold-exercises
description: Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section.
---
# 搭建练习

创建能通过 `pnpm ai-hero-cli internal lint` 的练习目录结构，然后使用 `git commit` 提交。

## 目录命名

- **章节**：`exercises/` 内的 `XX-section-name/`（例如 `01-retrieval-skill-building`）
- **练习**：章节内的 `XX.YY-exercise-name/`（例如 `01.03-retrieval-with-bm25`）
- 章节编号 = `XX`，练习编号 = `XX.YY`
- 名称使用短横线命名法（小写、连字符）

## 练习变体

每个练习需要至少包含以下一个子文件夹：

- `problem/` - 学生工作区，带 TODO
- `solution/` - 参考实现
- `explainer/` - 概念材料，无 TODO

进行占位时，默认使用 `explainer/`，除非计划另有说明。

## 必需文件

每个子文件夹（`problem/`、`solution/`、`explainer/`）都需要一个 `readme.md`，该文件应：

- 非空（必须包含真实内容，即使只有一行标题也可以）
- 不含损坏的链接

进行占位时，创建一个仅含标题和说明的最小 readme：

```md
# Exercise Title

Description here
```

如果子文件夹包含代码，它还需要一个 `main.ts`（>1 行）。但对于占位练习，只有 readme 的练习是可以的。

## 工作流

1. **解析计划** - 提取章节名称、练习名称和变体类型
2. **创建目录** - 为每个路径执行 `mkdir -p`
3. **创建占位说明文件** - 每个变体文件夹各创建一个带标题的 `readme.md`
4. **运行 lint** - 执行 `pnpm ai-hero-cli internal lint` 进行校验
5. **修复任何错误** - 反复迭代直到 lint 通过

## Lint 规则摘要

该 linter（`pnpm ai-hero-cli internal lint`）会检查：

- 每个练习都有子文件夹（`problem/`、`solution/`、`explainer/`）
- 至少存在 `problem/`、`explainer/` 或 `explainer.1/` 之一
- `readme.md` 在主子文件夹中存在且非空
- 不允许存在 `.gitkeep` 文件
- 不允许存在 `speaker-notes.md` 文件
- readme 中没有损坏的链接
- readme 中不允许出现 `pnpm run exercise` 命令
- 每个子文件夹都需要 `main.ts`，除非是 readme-only（仅 readme）

## 移动/重命名练习

在重编号或移动练习时：

1. 使用 `git mv`（而不是 `mv`）来重命名目录，以保留 Git 历史
2. 更新数字前缀以保持顺序
3. 移动后重新运行 lint

Example:

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## 示例：根据计划进行占位

给定如下计划：

```
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

Create:

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

Then create readme stubs:

```
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```
