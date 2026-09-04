---
name: worktree-pr
description: "Decide whether a task deserves its own git worktree and, if chosen, run it end to end: branch from the integration branch rather than the current tree, keep the main working copy untouched while the task runs, compare the result against the untouched baseline before declaring it done, and prepare it for a pull request instead of merging. Use when a request says to do the work in a new worktree or branch, when a change is large or risky enough that the main tree should stay usable, when several tasks need to run in parallel on one repository, when a result has to be diffed against current behavior, and when deciding where screenshots, builds, and other artifacts produced in a worktree should end up."
license: Apache-2.0
metadata:
  author: scarletkc
  source: https://github.com/scarletkc/agents
  summary: "Optionally run a task in its own worktree: branch from the integration branch, compare against the baseline, and prepare it for a PR."
---
# Worktree 与 PR

一个 worktree 换来两样东西：任务运行期间主工作副本保持可用，而这份未被触碰的副本也留作对比用的基线。这两点都值得付出真实的搭建成本，但并非每一次改动都用得上它们。

本文讨论的是隔离机制。至于改动本身应该有多大，见 [`scoped-change`](https://github.com/scarletkc/agents/blob/main/skills/scoped-change/SKILL.md)，它在 worktree 内的适用方式与在其他任何地方完全相同。

## 决策

当以下条件至少成立一项时，可以考虑使用 worktree：任务足够大，以至于半途而废的状态会阻塞其他工作；多个任务需要同时在同一仓库上推进；结果需要与当前行为进行对比；或者改动风险足够高，以至于放弃它应当不付出任何代价。

当改动很小、自成一体、且一遍就能审完时，跳过它。为修复一个拼写错误或一行配置修改而搭建隔离副本，成本大于收益，而多出来的分支、目录和 PR 全都是日后要有人买单的开销。当请求者说直接在当前分支上工作时，这个决定已经做出了。

## 执行

- **从集成分支切出分支，而不是从当前检出的任何分支切出。** 隔离副本的意义在于一个干净的起点状态；继承无关的进行中改动会让这一点落空，并使最终的 diff 无法阅读。先执行 fetch，确保基础是当前的，而不是一个过期的本地引用。
- **任务运行期间不要动主工作副本。** 两边同时编辑会破坏隔离并毁掉基线。如果任务最终需要对主树进行改动，停下来并如实说明，而不是越界去改。
- **并行的 worktree 只有在互不重叠时才保持独立。** 同一仓库的两个副本编辑同样的文件，最终会汇成一场没人排期的冲突，而代价落在合并时而非当下。在开启第二个之前，先看看第一个正在动哪些文件。
- **明确指明产物的存放位置。** 在 worktree 内生成的截图、构建产物和导出文件会随它一起消失。任何请求者需要看到的东西都必须写到持久的位置，或者附到 PR 上，而且必须说明位置，而不能想当然。

## 在宣布完成之前

- **与未触碰的基线对比，而不是与预期对比。** 保留一份干净副本的理由，就是两边都跑一遍、看看差异。对于行为改动，这意味着把旧路径和新路径都实际运行一遍；对于视觉改动，这意味着把同一个视图截取两次。“应该等价”只是一种说法，而基线就在那里，可以用来检验。
- **交代工具引入的东西。** 生成的产物、格式化工具带来的变动以及依赖锁文件的更新，会在隔离副本中在无人选择的情况下累积，而一旦合并，它们就与有意为之的改动无从区分。要么解释每一项为何属于这个分支，要么把它删掉。

## 落地

遵循用户既有的授权偏好。如果提交、推送或创建 pull request 需要明确授权，先完成并验证本地改动，然后把确切的命令交给对方，直到获得授权为止。获得授权后，推送分支并创建 pull request，说明动机、执行过的命令，以及评审者必须手工检查的事项；除非另有指示，把合并留给仓库所有者。直白地说明哪些部分已完成、哪些未经验证、哪些是有意略去的，因为 worktree 的隔离性很容易让人把未测试的结果当作已完成来报告。分支落地之后，删除 worktree；已合并分支留下的陈旧副本，对下一个打开它的会话来说是个陷阱。
