---
name: dream
description: Memory consolidation - review, merge, prune, and index memory files. Run periodically to keep memories organized and up-to-date.
user_invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
# Dream：记忆整合

你正在执行一次 dream——即对记忆文件进行的一次回顾性梳理。将近期学到的东西提炼为持久、组织良好的记忆，让未来的会话能够快速定位方向。

## 阶段 1 - 熟悉现状

- 对记忆目录执行 `ls`，看看已有哪些内容
- 阅读 `MEMORY.md`，了解当前的索引
- 快速浏览现有的主题文件，以便改进它们而不是创建重复内容
- 如果存在 `logs/` 或 `sessions/` 子目录，查看其中最近的条目

## 阶段 2 - 收集近期信号

寻找值得持久化的新信息。来源按大致优先级顺序排列：

1. **每日日志**（`logs/YYYY/MM/YYYY-MM-DD.md`，如果存在）——它们是只追加的记录流
2. **已偏离现状的现有记忆**——与你在代码库中现在所见相矛盾的事实
3. **转录搜索**——如果需要特定上下文，用较窄的关键词 grep 转录文件：
   `grep -rn "<narrow term>" .claude/transcripts/ --include="*.jsonl" | tail -50`

不要穷尽式地通读转录内容。只查找那些你已经怀疑其重要性的东西。

## 阶段 3 - 整合

对每一件值得记住的事，编写或更新一个记忆文件。使用以下类型约定：

| 类型 | 适合存放的内容 | 示例 |
|------|-------------|----------|
| **user** | 用户的角色、目标、偏好、知识 | “资深 Go 开发者，刚接触 React” |
| **feedback** | 来自用户的纠正与确认 | “测试中不要 mock 数据库”、“打包提交 PR 是正确决定” |
| **project** | 进行中的工作背景、截止日期、专项计划 | “2026-03-05 为移动端发布冻结合并” |
| **reference** | 指向外部系统的指针 | “流水线 bug 记录在 Linear 项目 INGEST 中” |

每个记忆文件使用如下格式：
```markdown
---
name: {{name}}
description: {{one-line description}}
type: {{user, feedback, project, reference}}
---

{{content - for feedback/project: rule, then **Why:** and **How to apply:**}}
```

重点关注：
- 将新信号合并到现有主题文件中，而不是创建近乎重复的文件
- 将相对日期（“昨天”、“上周”）转换为绝对日期
- 删除已被推翻的事实——如果今天的调查证明某条旧记忆有误，就在源头修正它

## 阶段 4 - 修剪与索引

更新 `MEMORY.md`，使其保持在 200 行以内且不超过约 25KB。它是一个**索引**，而不是内容堆放处：

- 每个条目：一行，不超过约 150 个字符：`- [Title](file.md) - one-line hook`
- 永远不要把记忆内容直接写进 MEMORY.md
- 删除指向过时、错误或已被取代的记忆的指针
- 精简冗长的条目——把细节移到主题文件中
- 为新近变得重要的记忆添加指针
- 解决矛盾——如果两个文件说法不一致，修正错误的那个

## 不要保存的内容

- 代码模式、架构、文件路径——可从项目中推导得出
- Git 历史——`git log` / `git blame` 才是权威来源
- 调试解决方案——修复就在代码里
- 任何已存在于 CLAUDE.md 中的内容
- 临时性的任务细节或对话上下文

---

返回一份简要总结，说明你整合、更新或修剪了哪些内容。如果没有发生变化，也请如实说明。
