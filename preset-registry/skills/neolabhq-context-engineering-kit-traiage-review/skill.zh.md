---
name: traiage-review
description: This skill should be used when need prioritize what changed code in repository human must review.
---
# 分诊审查

## 目标

此技能的目标是帮助人工审查者从仓库的整个变更列表中，优先关注需要特别留意的文件。

关键：人工注意力和时间是有限的。审查者无法检查仓库中所有现有变更。你的任务不是找出所有需要关注的变更，而是从整个变更池中构建一份详尽的文件列表，这些文件很可能会导致此次变更无法通过审查！

## 规则

- 你是编排代理，只负责启动代理并向它们传递数据。你不执行任何其他工作。
- 你可以自行运行以下只读命令，且仅限这些命令：
    - 随机抽样脚本（参见“## 随机抽样脚本”）。
    - 审查模式和默认分支检测所需的只读 git 命令：`git status`、`git diff --name-only`、`git branch`、`git symbolic-ref`、`git rev-parse`。
    - 提交模式检测和最新提交解析所需的只读提交命令：`git rev-parse HEAD`（解析最新提交）、`git show --name-only`、`git diff`（检查提交差异）。
- 你绝不能执行任何实现工作、读取源文件或运行任何会修改 git 状态的命令（commit、stash、push、checkout、reset、revert、add、merge、rebase 等）。如果你尝试读取源文件或运行上述允许的只读命令之外的任何命令，你将被终止！这关乎你的性命！

## 流程

1. 在启动代理之前确定审查模式：
    - 如果向技能传入了 `commit` 参数 → 直接使用**提交工作流**（其优先级高于下方的本地变更/分支自动检测）：
        - 如果给出了具体的提交哈希（`commit <commit-hash>`）→ 使用该哈希。
        - 如果未给出哈希（`commit` 或 `latest commit`）→ 使用 `git rev-parse HEAD` 解析最新提交，并使用解析出的具体哈希。
        - 记录解析出的具体提交哈希，以便在提交模式提示词和随机抽样脚本中使用。
    - 否则，如果向技能传入了 `branch` 参数 → 直接使用**分支差异工作流**。
    - 否则，使用只读命令检查本地变更：
      `git status --porcelain`（非空输出表示存在已暂存、未暂存或未跟踪的变更）。
        - 如果存在本地变更 → 使用**本地变更工作流**（默认行为）。
        - 如果不存在本地变更 → 检测默认分支（见下文），并检查当前分支是否为默认分支：
            - 当前分支：`git rev-parse --abbrev-ref HEAD`。
            - 如果当前分支不是默认分支 → 使用**分支差异工作流**（将当前分支与检测到的默认分支进行比较）。
            - 如果当前分支是默认分支 → 停止，并向用户报告不存在本地变更且当前分支为默认分支，因此没有可供比较的内容。
    - **默认分支检测**（只读、稳健）：
        - 首选：`git symbolic-ref --short refs/remotes/origin/HEAD` → 去除 `origin/` 前缀以获得 `main` 或 `master`。
        - 回退方案（如果首选方案失败）：`git rev-parse --verify origin/main`——如果成功，则默认分支为 `main`；否则尝试 `git rev-parse --verify origin/master`——如果成功，则默认分支为 `master`。
        - 将检测到的默认引用记录为 `origin/<default-branch>`（例如 `origin/main`），以便在分支模式提示词和随机抽样脚本中使用。
2. 并行启动 4 个代理，让每个代理根据各自的特定流程构建自己的需关注文件列表。向它们传递与模式相对应的代理提示词（参见“## 代理”）：本地变更工作流使用本地变更提示词，分支差异工作流使用分支模式提示词（填入检测到的 `origin/<default-branch>`），提交工作流使用提交模式提示词（填入解析出的具体 `<commit-hash>`）。
    - change-story-agent
    - change-impact-agent
    - change-failure-agent
    - change-expectation-agent
3. 每个代理将根据自己的判断生成关键文件列表。此外，Change Expectation Agent 还将生成声明式文件列表。
4. 解析所有关键文件列表，并构建最终的需关注文件列表。
    - 从每个代理的结果中选取排名前 5 的文件。如果其中一些文件重复，则根据所有标准的综合得分和足够高的置信度，从各代理结果中继续选取排名更高的文件。在此阶段，你的任务是持续构建列表，直至达到 20 个文件。（此阶段忽略声明式文件）
5. 运行 python 脚本，从整批已变更文件中随机选取 20 个文件。从该列表中选取 5 个文件并添加到最终列表中；如果其中一些已存在于最终列表中，则从该列表中继续选取其他文件。
6. 报告最终的需关注文件列表，并附上 Change Story agent 提供的关键事实摘要、随机抽样文件列表和声明式文件列表。

## Agent

选择与 Process 步骤中确定的审查模式相匹配的提示词，并将其原样传入以启动 change-story-agent、change-impact-agent、change-failure-agent 和 change-expectation-agent。

### 用于 local-changes 工作流的提示词

local-changes 工作流的默认路径——已暂存、未暂存和未跟踪的更改：

```md

Review current project staged AND unstaged changes according to your process and provide list of files that require attention.

```

### 用于 branch-diff 工作流的分支模式提示词

将 `origin/<default-branch>` 替换为检测到的默认引用，例如 `origin/main`：

```md

Review the diff of the current branch against the default branch `origin/<default-branch>` (use `git diff origin/<default-branch>...HEAD`, three-dot) according to your process and provide list of files that require attention.

```

### 用于 commit 工作流的提交模式提示词

将 `<commit-hash>` 替换为编排器解析出的具体提交哈希：

```md

Review the diff introduced by commit `<commit-hash>` (use `git show <commit-hash>` or `git diff <commit-hash>^!`, equivalently `git diff <commit-hash>^ <commit-hash>`) according to your process and provide list of files that require attention.

```

## 随机抽样脚本

使用此脚本从整批变更文件中随机选取 20 个文件。对于 local-changes 工作流（已暂存 + 未暂存 + 未跟踪），使用**本地模式**代码块；对于 branch-diff 工作流（默认分支与当前分支之间发生变更的文件），使用**分支模式**代码块；对于 commit 工作流（由该提交更改的文件），使用**提交模式**代码块。将 `origin/<default-branch>` 替换为检测到的默认引用（例如 `origin/main`），并将 `<commit-hash>` 替换为解析出的具体提交哈希。

**本地模式**（已暂存 + 未暂存 + 未跟踪）：

```python

import random
import subprocess

# Tracked changes (staged + unstaged) relative to HEAD
tracked = subprocess.check_output(['git', 'diff', '--name-only', 'HEAD']).decode('utf-8').splitlines()

# Untracked files (new, not yet added)
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard']).decode('utf-8').splitlines()

changed_files = sorted(set(tracked + untracked))

# Pick up to 20 random files (won't crash on small changesets)
random_files = random.sample(changed_files, min(20, len(changed_files)))

print(random_files)

```

**分支模式**（当前分支与默认分支相比发生变更的文件）：

```python

import random
import subprocess

# Files changed between the default branch and the current branch (three-dot: since the merge base)
default_ref = 'origin/<default-branch>'  # e.g. 'origin/main' — set to the detected default ref
changed_files = sorted(set(
    subprocess.check_output(
        ['git', 'diff', '--name-only', f'{default_ref}...HEAD']
    ).decode('utf-8').splitlines()
))

# Pick up to 20 random files (won't crash on small changesets)
random_files = random.sample(changed_files, min(20, len(changed_files)))

print(random_files)

```

**提交模式**（该提交更改的文件）：

```python

import random
import subprocess

# Files changed by the commit
commit = '<commit-hash>'  # set to the resolved concrete commit hash
changed_files = sorted(set(
    line for line in subprocess.check_output(
        ['git', 'show', '--name-only', '--pretty=format:', commit]
    ).decode('utf-8').splitlines()
    if line.strip()
))

# Pick up to 20 random files (won't crash on small changesets)
random_files = random.sample(changed_files, min(20, len(changed_files)))

print(random_files)

```

在随机文件列表中，仅选择与逻辑变更相关的文件，忽略文档、测试、配置等。除非已无其他文件可选，并且该文件未被智能体的关键文件列表标出。

## 输出格式

```md

### 关键事实

<note>关键事实应由变更故事智能体提供</note>

- 变更试图实现的目标：<如有>
- 架构变更：<如有>
- 设计决策：<如有>
- 风险：<如有>
- 解决方案：<如有>

### 关键文件

| 文件路径          | 变更行数              | 重要性       | 严重性     | 可检测性        | 置信度     |
|------------------|-----------------------|--------------|------------|-----------------|------------|
| <文件路径>        | <变更行数>             | <重要性>     | <严重性>    | <可检测性>       | <置信度>    |

<note>
- 在最后一列中填写提供该文件的智能体所给出的置信度评级（如果有多个，则填写最高置信度）
- 在其余列中填写提供该文件的智能体所给出的评级（如果有多个，则填写最高评级。如果没有评级，则标记为「-」）
</note>

### 随机样本

| 文件路径    | 变更行数              |
|-------------|-----------------------|
| <文件路径>  | <变更行数>             |


### 声明式文件

| 文件路径    | 变更行数              |
|-------------|-----------------------|
| <文件路径>  | <变更行数>             |

```