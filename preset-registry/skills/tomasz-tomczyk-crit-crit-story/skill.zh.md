---
name: crit-story
description: "Author a crit story only when the user explicitly invokes /crit-story or directly asks you to generate a crit story. Do not infer this skill from generic review, PR, or diff-review requests."
allowed-tools: Bash(crit story:*), Read
argument-hint: ""
---
# 使用 `crit story` 编写 crit 故事

这是 `/crit` 的一个兄弟技能——它不会在常规的评审循环中运行。仅在用户明确要求生成故事时才刻意调用它；不要从一般的评审、PR 或 diff 评审请求中推断出需要调用它。

## 步骤 1：获取指南

```bash
crit story --guide
```

这会打印出已解析的编写指南（如果用户有自定义版本，则打印该版本——务必在运行时调用此命令，而不是复用本技能自身的文字），随后是 `---` 以及你必须输出的字段的 JSON schema。请精确阅读并遵循该指南的原则和 JSON 结构——它才是事实来源，而不是本文件。

## 步骤 2：写入 prep 文件

```bash
crit story --prep /tmp/crit-story-prep.txt
```

这会将完整的、未经裁剪的 diff（提交信息 + 每个 hunk 及其 `(file_path, old_start)` 标识）写入给定路径，并打印该路径。**务必读取该文件**——diff 绝不会被内联到指南提示中。

## 步骤 3：编写故事 JSON

按照步骤 1 获取的指南，按主题（而非按文件）对 hunk 进行聚类，并将一个**仅**包含 `prologue`、`chapters` 和 `support` 的 JSON 对象写入临时文件，例如 `/tmp/crit-story.json`。不要包含 `version`、`generated_at`、`agent`、`base_sha`、`head_sha`、`scope_fingerprint` 或 `coverage`——这些由 crit 自动填充。

## 步骤 4：导入

```bash
crit story --story-file /tmp/crit-story.json
```

退出码 0 表示故事已保存（crit 会打开浏览器展示它）。退出码 1 表示故事被拒绝——覆盖率报告（缺失/重复的 hunk）会在每次尝试时（无论成功或失败）以 JSON 格式打印到 stdout。如果被拒绝：

- `duplicated` 非空：某个 hunk 被两个章节（或一个章节与 support）同时声明。判断它应归属何处，然后重新导入。
- 退出码 0 时 `missing` 非空且 `auto_repaired: true`：crit 已将遗漏项回填到 `support[]` 中。可以选择重新编写，以便有意识地安置它们。
- 出现漂移错误（"diff changed since prep"）：重新运行 `crit story --prep`，并基于新的 prep 文件重新编写。

## 本技能不会做的事情

- 它不会调用 `crit comment`、`crit push` 或 `crit share`——那些是独立的流程。
- 它不会产出评审级别的人工评论。
- 它不会作为通用 `/crit` 评审循环的一部分运行。
