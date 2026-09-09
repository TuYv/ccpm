---
name: roborev-review-branch
description: Use only when the user explicitly invokes /roborev-review-branch
disable-model-invocation: true
---
我会按当前分支的常规代码审查流程处理这次请求，不调用 `roborev`：先确认仓库状态、分支和提交范围，再逐个检查变更并运行与风险相关的验证。先读取仓库元信息和项目级协作规则，确定审查基线与可用测试命令。我正在确认当前分支相对其上游或默认基线包含哪些提交，并检查工作区是否有未提交改动，以免把用户正在进行的修改误判为本次分支变更。# roborev-review-branch

请求审查当前分支上的所有提交，并呈现结果。

## 用法

```
/roborev-review-branch [--base <branch>] [--type security|design] [--panel <name>|none]
```

## 仅限显式调用

调用必须是显式的：使用字面量个人 `/roborev-review-branch`，或使用结构化的
Grok Build 技能选择。

诸如“审查此分支”之类、但不包含上述显式调用机制的请求，必须使用原生行为，且不得运行 roborev。

## 沙箱访问

roborev 使用本地守护进程。如果命令因 `permission denied` 失败，可能是沙箱阻止了对其回环端口或 Unix 套接字的访问。请使用运行时支持的沙箱权限提升机制重试相同的命令。不要因为沙箱环境中的状态探测无法访问守护进程而启动或重启守护进程。

## 不应调用此技能的情况

当用户正在提供或粘贴现有的审查结果时，**不要**调用此技能。包含审查发现、结论或摘要的消息属于输出，而不是启动新审查的请求。

## 重要事项

此技能要求你**执行 bash 命令**来验证输入并运行审查。审查完成并向用户呈现结果之前，任务都不算完成。

这些说明是指南，而不是严格脚本。请结合对话上下文。若项目级 `AGENTS.md` 中的说明与这些步骤冲突，应遵循项目级说明。可跳过已经满足的步骤。

## 说明

当用户调用 `/roborev-review-branch [--base <branch>] [--type security|design] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了基准分支，请使用下面的基准分支命令片段；该片段会在调用 `roborev review` 前存储并验证该引用。

该片段会自行处理一种情况：当引用指向某个已配置的远程仓库及其后的分支（例如 `upstream/main`），且该远程跟踪引用尚未获取到此工作树中时，它会从该远程仓库获取该分支，然后重新验证。它会从最长的、以斜杠分隔的前缀开始搜索已配置的远程仓库名称，因此支持名称中包含斜杠的远程仓库。其他所有无法解析的引用都会被拒绝；对于不包含已配置远程仓库前缀的引用，不会尝试获取。

如果验证失败，请告知用户该引用无效，并报告 git 错误。不要继续执行。

### 2. 构建并运行命令

构建并执行审查命令：

如果未指定基准分支，则运行：

```bash
roborev review --branch --wait [--type <type>] [--panel <name>|none]
```

如果指定了基准分支，则运行：

```bash
read -r branch <<'ROBOREV_REF'
<branch>
ROBOREV_REF
if ! git rev-parse --verify --quiet --end-of-options "$branch" >/dev/null; then
  remote=
  remote_branch="${branch##*/}"
  remote_candidate="${branch%/*}"
  while :; do
    if [ "$remote_candidate" != "$branch" ] && git config --get "remote.$remote_candidate.url" >/dev/null; then
      remote="$remote_candidate"
      break
    fi
    case "$remote_candidate" in
      */*)
        remote_branch="${remote_candidate##*/}/$remote_branch"
        remote_candidate="${remote_candidate%/*}"
        ;;
      *)
        break
        ;;
    esac
  done
  if [ -n "$remote" ]; then
    git check-ref-format --branch "$remote_branch" >/dev/null || exit 1
    git fetch --quiet --refmap= -- "$remote" "refs/heads/$remote_branch:refs/remotes/$remote/$remote_branch" || exit 1
    branch="refs/remotes/$remote/$remote_branch"
  fi
  git rev-parse --verify --end-of-options "$branch" >/dev/null || exit 1
fi
roborev review --branch --wait --base "$branch" [--type <type>] [--panel <name>|none]
```

- 如果指定了 `--base`，则包含它（否则自动检测基准分支）
- 如果指定了 `--type`，则包含它
- 如果指定了 `--panel <name>`，则包含它（扇出到指定的配置评审面板）；`--panel none` 会强制执行单智能体评审

`--wait` 标志会阻塞，直到评审完成。

### 3. 呈现结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化、评审出错），请将其报告给用户。建议使用 `roborev status` 检查守护进程；如果仓库未初始化，则使用 `roborev init`；或重新运行评审。

否则，向用户呈现评审结果：
- 突出显示结论（通过或失败）
- 如果存在发现项，按严重程度分组列出，并附带文件路径和行号，以便用户直接导航
- 如果评审通过，简要确认即可

#### 面板（多评审者评审）

如果传递了 `--panel <name>`，或者为显式评审配置了 `default_panel`，评审将扇出到一个评审者面板。在这种情况下，`Enqueued job <id>` 是聚合各项结果的**综合（父级）**任务，其结论和发现项是整个面板的综合结果。请呈现该综合结论/发现项，并针对该父级 ID 提供修复建议，绝不能针对单个评审者。对于综合任务，`roborev show` 会输出一行评审者摘要（例如 `3 reviewers: bug P, security F`）。`--panel none` 会强制执行单智能体评审，而自动的提交后钩子评审无论 `default_panel` 如何设置，始终保持单智能体。

### 4. 提供后续步骤

如果评审存在发现项（结论为失败），请提供解决这些问题的选项：

- “您想让我修复这些发现项吗？可以运行 `/roborev-fix <job_id>`”

从评审输出中提取任务 ID 并包含在建议中。请在 `Enqueued job <id> for ...` 行或评审标题中查找。对于面板评审，此 ID 是综合父级任务。

如果评审通过，请确认结果，不要提供 `/roborev-fix`。

## 示例

**默认分支评审：**

用户：`/roborev-review-branch`

智能体：
1. 执行 `roborev review --branch --wait`
2. 呈现按严重程度分组的结论和发现项
3. 如果存在发现项：“您想让我解决这些发现项吗？运行 `/roborev-fix 1042`”
4. 如果通过：“分支评审通过，没有发现项。”

**针对特定基准分支的安全评审：**

用户：`/roborev-review-branch --base develop --type security`

智能体：
1. 验证：`git rev-parse --verify --end-of-options "develop"`
2. 执行 `roborev review --branch --wait --base develop --type security`
3. 呈现结论和发现项
4. 如果存在发现项：“您想让我解决这些发现项吗？运行 `/roborev-fix 1043`”

## 另请参阅

- `/roborev-design-review-branch` — `/roborev-review-branch --type design` 的简写
- `/roborev-fix` — 修复评审在代码中发现的问题
- `/roborev-review` — 评审单个提交