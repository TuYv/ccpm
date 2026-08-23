---
name: changelog
description: Turn a range of commits or merged PRs into a changelog entry grouped by change type. Use when the user asks for release notes, a changelog, or "what changed" between two points.
---
# changelog — 根据提交/PR 范围编写变更日志

将一段历史记录整理成清晰的变更日志条目，方便用户判断是否需要升级以及如何升级。

## 获取范围

首先确定范围。遵循明确指定的范围（例如“从 v1.2.0 开始”“最近 10 次提交”“本周合并的 PR”）；否则，默认使用从最近标签开始的提交（先运行 `git describe --tags --abbrev=0`，再运行 `git log <tag>..HEAD`）。

使用 `sys_os_shell` 自行收集原始材料：
- 使用 `git log <range> --no-merges --pretty=format:'%h %s'` 获取提交主题。
- 使用 `git log <range> --merges` 或 `gh pr list --search "merged:>=<date>"` 获取 PR。
- 使用 `git diff <range> --stat` 查看影响范围；如果 PR 的主题行表述简略，则使用 `gh pr view <n>` 了解其意图。

当主题未明确说明对用户的影响时，派遣研究员（`purpose: explore`）阅读差异，并报告实际对用户产生了哪些变化——不要仅根据主题进行猜测。

## 按变更类型分组

使用 Keep a Changelog 的分类，并删除所有为空的分类：

    ## <version or range> — <YYYY-MM-DD>

    ### Added
    ### Changed
    ### Deprecated
    ### Removed
    ### Fixed
    ### Security

## 编写每个条目

- 每项用户可见的变更占一行，使用祈使语气或过去时描述其对用户的影响，而不是内部实现机制。
- 先写变更内容，并在末尾的括号中链接对应的 PR 或提交。
- 省略纯内部调整（重构、仅测试相关的变更、CI），除非其改变了行为。变更日志是写给用户的，不是提交记录的堆砌。
- 明确标出破坏性变更；如果需要执行升级步骤，请指向 migration-guide skill。

## 验证

在最终定稿前，如果变更日志将要发布，请将草稿交给 `reviewer`（`purpose: review`）审查——版本号、“已移除”/“破坏性”声明以及标志名称，正是事实核查能够发现问题的地方。