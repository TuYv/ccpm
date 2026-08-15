---
name: git-safety-net
description: >-
  Audits, preserves, recovers, and safely retires local Git state: unpushed or
  wrong-branch commits, dirty or detached worktrees, forgotten duplicate clones of the
  same repo, untracked work no bundle can back up, orphaned stashes, dangling commits,
  stale branches, and squash/rebase merge uncertainty. Use when the user fears work was
  lost; asks to recover a commit or branch; asks whether a worktree, clone, or scratch
  directory can be deleted; wants everything converged onto one main branch; or
  needs proof that cleanup will not drop work. Use it even after an audit reported clean
  — the usual gap is scope: every in-repo command is blind to a second clone elsewhere
  on disk. Triggers on "did I lose work", "is everything merged", "is anything else
  lost", "safe to delete this clone", "clean up old branches/stashes", "only keep one
  main branch", "git reflog", "dangling commits", "分支灾难", "误删分支/commit",
  "worktree 能删吗", "还有没有丢的东西", "只保留一个主分支".
  Covers local-Git forensics, not GitHub PR/API operations or routine sync.
---
# Git 安全网

防止在错综复杂的分支、stash 和 rebase 中丢失工作，并在事情已经出错时进行取证式恢复。这里的所有命令在某个步骤被明确标记为破坏性操作之前，都是**非破坏性或增量式的**——恢复绝不能让损失进一步扩大。

## 入口路由——根据用户担心的问题选择模式

| 用户所说的 / 所需的…… | 前往 |
|---|---|
| “我好像丢失了某个 commit / branch / stash”“恢复已删除的 X”“git reflog” | **模式 A——恢复** |
| “我有丢失任何东西吗？”“还剩哪些 worktree/stash/branch？”；经历混乱的操作后 | **模式 B——审计并保全** |
| “所有内容都已合并吗？”“还有哪些内容不在 main 上？”；删除旧分支之前 | **模式 C——验证已合并** |
| “怎样避免这种情况再次发生？”；开始并行/多分支工作时 | **模式 D——预防** |
| “清理 worktree/stash/branch”“将所有内容汇聚到 main 上”“只保留一个 main 分支” | **模式 E——安全退役** |
| “审计已经说没问题，但还有没有遗漏的内容？”“再检查一次” | **模式 B，从步骤 0 开始**——重复提出请求通常意味着第一次检查的范围有误，而不是检查得不够仔细 |

如有疑问，**先运行模式 B**：从 `git_find_all_checkouts.sh`（步骤 0）开始，然后在它找到的每个 checkout 中运行 `git_loss_audit.sh`。两者成本都很低且不会造成破坏，并且能够回答整台机器上“是否有任何内容面临风险”，而不只是回答你最初所在目录中的情况。

## 六条关键规则（务必内化；各模式都是这些规则的具体应用）

1. **在相信任何结论之前，先确保范围正确：这里的每一种工具都只能看到它所在的 repository。** `git worktree list`、`git branch -a`、`git fsck`、`git stash list`、`git log --not --remotes`——它们在结构上都无法看到机器上同一 repository 位于其他位置的**独立 clone**。链接的 worktree（`git worktree add`）带有一个指向主 repository 的 gitlink *文件*，因此能够被发现；第二个 `git clone` 拥有自己完整的 `.git`，且没有反向引用，因此**不会出现在任何结果中**。请先运行 `git_find_all_checkouts.sh`——否则，一次结果干净的审计只意味着“这个目录没有问题”，而这并不是用户提出的问题。真实事件：某个 repository 的审计结果一切正常，所有 branch 都已 push，但某个同级 clone 中仍有 440 行正在开发的功能代码以 untracked file 的形式存在，距离被一次 `rm -rf` 永久删除仅一步之遥。
   **范围还有第二个维度：时间。** 每个 `origin/*` ref 都是上次 fetch 时保存的缓存快照，并不等同于 remote——因此，在相信任何依赖它的结论之前，请先执行 `git fetch --all --prune`。应根据问题的方向正确解读陈旧缓存：对于“*哪些内容会丢失*”，它的误差偏向安全一侧（可能多报未 push 的工作，但绝不会将其隐藏），所以这里的脚本即使离线也仍然可以运行。对于“*这些内容是否已经 upstream*”，它的误差方向则相反——remote 已有的工作会被视为独有内容，导致你再次提交；如果 remote 同时对它进行了改进，你的“恢复”操作会在看似救援的同时悄无声息地**还原**这些改进。真实事件：一个落后一天的比较基准让已经合并的更改看起来尚未提交；相应的救援 PR 会还原后续 review 在其上添加的三个修复，其中一个还是安全修复。
2. **在一个 checkout *内部*，运行 `git_loss_audit.sh`，将其作为“哪些内容会丢失”的权威检查。** 它会将当前 HEAD、每个链接 worktree 的 HEAD、local branch 和 tag 与所有 remote 进行比较，然后检查每个 worktree 中 tracked/untracked 的更改，以及 stash 和 dangling commit。较简短的 `git log HEAD --branches --tags --not --remotes` 会漏掉另一个 worktree 中的 detached HEAD 以及所有未 commit 的文件。Ahead/behind 数量**无法**回答这个问题。应当对规则 1 找到的每个 checkout 分别运行一次，而不只是对你碰巧所在的 checkout 运行。
3. **对于“我丢失了某个 commit”，第一步应使用 `git reflog`，而不是 `fsck`。** Reflog 会记录约 90 天内 HEAD 的每个位置（commit、checkout、reset、rebase），丢失的 commit 通常就在最前面的几行中。对于 reflog 无法触及的 commit，`git fsck` 是更深一层的安全网。
4. **先保全，再清理——并且要了解哪种备份工具真正能够触及相关工作。** 在删除 branch、运行 `gc` 或 force-push 之前，先将有风险的/dangling commit 固定到垃圾回收无法触及的位置。只有在仍有 ref（或 reflog 窗口）指向相关工作时，清理才是可逆的。**关键的不对称性：`bundle`、`archive` 和 `format-patch` 只能触及 git 已经知道的对象。** 一个从未执行过 `git add`、也从未通过 `stash -u` 保存的 untracked file，对这三者而言都是不可见的——磁盘上的文件就是唯一副本，因此保全它意味着必须直接将该文件复制出去。备份“整个 repository”并以为未跟踪的工作也包含在内，正是看似完整的备份悄无声息地遗漏唯一风险项的原因。
5. **始终按内容验证“已合并”，绝不能按 commit 数量验证——同时还要知道，大多数内容检查同样并不可靠。** 在 squash-merge 之后，`main..branch` 会将 branch 原始的 commit 显示为“未合并”，即使其内容已经位于 main 上——通常会产生 100 多个虚假的 commit。但将数量检查替换成*最接近的*内容检查仍然不够：在一次审计中，三个依次被认为“这次肯定已经是内容层面的检查了”的工具分别给出了错误答案——`git cherry`（squash 会重写 patch-id → 错误显示 UNMERGED）、用于询问“base 缺少哪些内容”的**三点式** `diff base...ref`（三点式回答的是另一个问题，并且将缺失文件**少报了 5 倍**），以及文件级存在性检查（某个文件存在于 base 上，并不意味着其中没有缺少 ref 中的行）。只有试合并（`git merge-tree`，也就是 `git_verify_branch_merged.sh` 所运行的操作）每次都能给出正确答案。Diff 形式及逐级可靠性说明：**[references/merge_verification.md](references/merge_verification.md)**。
6. **对于高风险的“所有内容都已合并吗？”判断，应以对抗性方式进行验证——理想情况下，让多个独立 agent 扇出检查，并各自尝试*证伪*该结论。** 由一名 reviewer（无论是人还是模型）检查多个 branch，往往会漏掉真实缺口；独立交叉检查可以发现它。至少应明确安排一个 agent 扩大*范围*（规则 1），而不是再次检查已经列出的 branch——接受既定框架的 reviewer 无法发现隐藏在范围之外的缺口。

## 模式 A — 恢复丢失的工作

“消失”的提交/分支/暂存几乎总会在对象存储中保留约 90 天。
完整的恢复阶梯（reflog → fsck → dangling）、确切命令以及权威的 Git 事实，请参阅：
**[references/recovery_playbook.md](references/recovery_playbook.md)**。30 秒速览版：

```bash
git reflog --date=iso | head -40          # find the lost HEAD position (most recoveries are here)
git show <sha>                            # CONFIRM it's the right commit before acting
git switch -c rescue/<name> <sha>         # recover onto a NEW branch — never reset onto live work
```

如果 reflog 中没有显示它（例如，被丢弃的暂存，或 rebase 产生的孤立提交），则继续使用
`git fsck --dangling`——详见操作手册。

## 模式 B — 审计存在风险的工作，然后将其保全

**步骤 0 — 确定范围（规则 1）。** 找出本机上此仓库的每个检出，
包括任何仓库内部命令都无法发现的独立克隆：

```bash
scripts/git_find_all_checkouts.sh              # defaults to this repo's parent + grandparent
DEPTH=6 scripts/git_find_all_checkouts.sh ~    # widen when clones live far from each other
```

它通过规范化的远程 URL 匹配同级检出（因此同一仓库的 SSH 和 HTTPS 形式会被视为相同），
当当前检出或候选检出任一方没有 `origin` 时，则回退到根据**任何共享的提交历史**进行匹配。
该历史检查也适用于无法看到仓库真实根提交的浅克隆。它绝不会根据目录名进行匹配，
因为独立克隆的名称通常与原始克隆不同（`repo` 与 `repo-hotfix`），而这恰恰是名称匹配会失效的情况。
它会先规范化路径别名，再识别当前检出；在检查候选检出时禁用仓库提供的 fsmonitor 命令；
并且，即使分支没有上游，只要提交可从任何本地已知的远程跟踪引用访问，就会将其视为已推送。
当任何*其他*检出中存在未提交、未跟踪、未推送或无法检查的工作时，退出码为 1。
在它报告的**每个**检出中运行步骤 1–2，然后将“没有任何风险”视为针对所有检出的结论，
而不仅仅是当前检出。

### 维护者验证

更改检出发现逻辑后，运行隔离的回归测试套件：

```bash
uv run python -m unittest discover -s tests -p 'test_*.py'
```

**步骤 1 — 审计（非破坏性）。** 确定当前有哪些内容（如果有）存在丢失风险：

```bash
scripts/git_loss_audit.sh          # defaults to remote "origin"; pass a remote name to override
```

预期输出：每个工作树的分支/分离状态及整洁状态，以及
**仅存在于本地的提交**、**有未提交更改/不可用的工作树**、**暂存**和**悬空提交**的数量。
当存在于任何远程都没有的提交，或者工作树有未提交更改/无法检查时，退出码为 1；暂存和
悬空对象仍会显示，但它们本身不会导致审计失败。因此，退出码为 0 并不意味着可以删除可见的
暂存/悬空对象：应对每个报告的项目进行分类处置或保全。在指定工作树变得整洁，且其 HEAD 已被证明
包含在安全位置或已被有意保全之前，不要声称清理操作是安全的。

**步骤 2 — 保全（增量式，防 gc）。** 如果发现了任何内容，请在操作分支或运行 gc *之前*，确保它们不会丢失：

```bash
scripts/git_preserve_danglers.sh --patch-dir ~/git-danglers   # pin + export patches
```

这会将每个悬空提交固定在 `refs/dangling-backup/<sha>` 下（垃圾回收永远无法回收被引用的提交），且不会让 `git branch` 变得杂乱；还可选择为每个非 stash 提交写入一个 `.patch` 文件。对于某个*特定的*重要提交，还要给予完整保护——创建本地分支、推送远程分支，**并且**生成一个 `git format-patch` 文件——这样单块磁盘故障或单次 `git gc` 都无法将其抹去。详细步骤及三重备份的原因：**[references/recovery_playbook.md](references/recovery_playbook.md)**。

**未跟踪文件需要另一种工具——直接复制（规则 4）。** 上述所有操作移动的都是 *git 对象*；从未告知 git 的文件并不是对象。请明确保全这些文件，并将以下三个渠道彼此分开，以便后来的读者知道每个渠道能恢复什么：

```bash
git -C <checkout> status --porcelain | grep '^??'                     # what is untracked
cp <each-untracked-path> <backup>/                                    # the ONLY copy — plain cp
git -C <checkout> diff > <backup>/uncommitted.diff                    # tracked-but-uncommitted
git -C <checkout> bundle create <backup>/history.bundle origin/main..HEAD   # unpushed commits
git bundle verify <backup>/history.bundle                             # prove it restores
```

在它们旁边写一个一段式的 `README`，说明它们来自哪里、属于哪个分支，以及会话何时停止。六周后无人能够理解的备份，只比没有备份稍好一点——而且阅读它的人不会是创建它的人。

## 模式 C — 验证所有内容均已合并（不要被计数误导）

陷阱：某个陈旧分支显示“领先 main 173 个提交”，但其中每一行内容实际上都已存在于 main 中（压缩合并造成的假象）。绝不要根据计数得出“未合并”的结论。逐分支检查内容：

```bash
scripts/git_verify_branch_merged.sh <branch> [<base>]   # base defaults to origin/main
```

在这个模式下，陈旧的基准反而是*不安全的*（规则 1）：如果根据昨天的 `origin/main` 进行判断，内容在几小时前已合入的分支仍会显示为 UNMERGED，而对其进行“抢救”会把旧版本重新应用到在它之上构建的所有内容之上。脚本正是为此才会先执行 fetch——但如果 fetch 失败，它会回退到缓存的引用，并且**仅在 stderr 上**说明这一点。应将该信息视为阻断项，而不是脚注：在网络恢复后重新运行，然后才能依据判定结果采取行动。手动比较（`git diff origin/main <branch>`、`git log origin/main..<branch>`）根本没有这种安全保障——每次都必须先自行执行 fetch。

它会报告 **MERGED (ancestor)** 或 **MERGED (content contained)**——可以安全删除——或者报告 **UNMERGED / NEEDS REVIEW**，并列出该分支仍会更改的文件。该判定是可靠的，而非启发式的：它使用 `git merge-tree` 对分支执行一次合入基准的试验性三方合并（在内存中进行，不执行 checkout），并且只有当该合并不会造成任何更改时，才会判定“可以安全删除”——因此，尽管压缩合并后的分支提交计数不为零，它仍会显示为 MERGED；而如果存在基准中没有的还原、编辑或新文件，则会显示为 UNMERGED。它**偏向安全性**：任何无法证明已包含的内容都会报告为需要审查，因为错误地判定为“已合并”会导致工作成果丢失，而错误地判定为“未合并”只会多花时间检查。完整技术说明（以及为何 `--find-object`/blob 启发式方法不适合自动决策），再加上针对整个仓库分支的**对抗式多智能体验证**模式（只读智能体，每批一个，每个都被要求去*证伪*“所有内容均已合并”，且每项发现都要独立复查）：**[references/merge_verification.md](references/merge_verification.md)**。

## 模式 D — 防止灾难发生

这些习惯可以避免分支纠缠导致工作成果陷入搁置：
**[references/prevention_practices.md](references/prevention_practices.md)**。其中起关键支撑作用的几项：

- **切换前先提交——既不要使用 `git stash`，也不要使用 `git worktree`。** 未提交的工作才会
  陷入搁置：可能是一个后来找不到的 `git stash`，也可能是被一次 `switch` 掩埋的编辑。
  将每一项工作提交到各自的分支并尽早推送（已提交、已推送的分支不会成为孤儿），然后
  通过合并将其*实时*带到需要的位置——不要暂存，也不要再创建第二个
  `git worktree` 检出（那只是又多了一个可能遗忘工作的地方，而且其中甚至不会有被
  gitignore 忽略的依赖）。共享工作树并遵循先提交再切换的纪律，是安全的默认选择。
- **如果确实需要第二个检出，请使用工作树——绝不要再执行一次 `git clone`。** 两者都会
  增加一个可能遗忘工作的地方，因此上面的先提交再切换仍然是默认选择。但两者的
  失败模式并不相同：链接工作树会在 `git worktree list` 中表明自己的存在，因此
  每次审计都能发现它；而独立克隆对于从原始仓库运行的所有命令都是不可见的。为了
  几天的并行工作而选择 `clone`，等同于悄无声息地退出所有安全工具的保护范围。如果
  已经存在一个克隆（由同事创建、由脚本创建，或是由你接手），请将它登记在团队确实
  会查看的位置，并在工作完成当天将其退役——在此之前，应将它本身视为审计目标，而
  不是临时目录。
- **尽早将进行中的工作分支推送到远程。** 只存在于本地分支上的提交，是笔记本电脑
  损坏后真正会丢失的唯一提交。
- **提交前确认当前分支**（`git branch --show-current`）——提交到错误功能分支上的修复
  对其真正对应的 PR 不可见，并且很容易在清理时丢失。
- **在共享工作树中，绝不要让破坏性命令以“当前分支”为目标——请显式指定分支名称。**
  `reset --hard`、`merge` 和 `rebase` 都会作用于它们运行瞬间*实际检出的任何分支*，
  因此分支检查一返回就已经过时：并行会话可能在此期间执行 `switch`，于是你的命令
  会落到**他们的**分支上。这与下面一项正好相反（下面那一项保护*你的*工作不受*他们*
  切换的影响；这一项保护*他们的*工作不受*你的*命令影响），而更频繁地重新检查也
  无法解决问题——竞态是固有的。请改用与检出无关的形式；这些形式会明确指定目标，
  并且绝不会触碰工作树：
  ```bash
  git branch -f <branch> <target>          # instead of: switch <branch> && reset --hard <target>
  git fetch origin <branch>:<branch>       # fast-forward a branch you are not on
  git push origin <sha>:refs/heads/<branch>
  ```
  真实事故：在 `git branch --show-current` 显示 `main` 几秒后执行的
  `reset --hard origin/main`，却落到了并行会话的功能分支上，并将其回退了两个提交；
  随后的“修复”又一次失败，因为工作树已被第二次切换。`git branch -f` 一次就修复了
  这两个问题，原因正是它从不查询当前检出。
- **如果并行会话将共享工作树切换到了其分支**，导致你未提交的工作被搁置在那里，
  不要将提交放到他们的分支上——将你的编辑带到一个从基线分出的分支
  （`git checkout origin/main -b …`，先用 `git diff --quiet` 证明你的文件在不同基线上
  一致），只提交你显式指定的路径，然后将工作树切换回他们的分支，以恢复他们的状态。
- **如果并行会话正在*主动*写入共享工作树**——你工作时不断有文件出现——完全不要执行
  `switch`、`add` 或 `reset`：每个命令要么会导致他们未提交的工作陷入搁置，要么会
  触发工作树保护机制。如果你自己的更改是自包含的（新文件，或属于 `origin/main`
  而不是他们正在处理的工作树的编辑），可以使用完全不触碰工作树的底层命令构建提交，
  然后将其推送到一个分支并创建 PR：
  ```bash
  export GIT_INDEX_FILE=$(mktemp)     # a scratch index — the tree's real index is untouched
  git read-tree origin/main           # start from the pushed base, not the dirty tree
  git update-index --add --cacheinfo 100644,"$(git hash-object -w path/to/file)",path/to/file
  tree=$(git write-tree)
  commit=$(git commit-tree "$tree" -p origin/main -m "…")   # HEAD does not move
  unset GIT_INDEX_FILE
  git push origin "$commit":refs/heads/<branch>             # open the PR from here
  ```
  这组操作只读写对象存储和一个一次性索引，因此共享工作树中的 `git status` 会逐字节
  保持不变，另一个会话也不会察觉任何波动。当因为其他人占用工作树而无法采用先提交
  再切换的方式时，这就是应急通道。
- **执行任何 rebase 或删除分支操作之前，先运行模式 B 审计。** 只需十秒；这决定了
  结果是“没有任何东西会丢失”，还是在 gc 之后才发现问题。
- **递增共享版本号或更新锁文件之前，先检查基线中的当前值**，以免两个并行分支都
  声称进行了同一次递增（这种无声的冲突会阻止后续更改发布）。

## 模式 E — 安全退役工作树、贮藏和分支

与模式 A 的担忧相反：不是“我丢了什么”，而是“这些遗留项越积越多——
哪些可以销毁？”删除很简单；**证明每一项都已被取代才是真正的工作**。
先运行 `git_find_all_checkouts.sh`——仅靠 `git worktree list --porcelain` 不会显示
独立克隆，而它们正是最容易被遗忘的遗留项——然后在该脚本报告的每个检出中运行 `git_loss_audit.sh`。
将每个检出都视为一个可能藏有未提交工作或分离头指针工作内容的独立位置。然后进行分类处置、备份和退役：

**步骤 1 — 将每个遗留项分类：仍在进行的 WIP，还是已被取代的草稿？** 证据阶梯，按证明力从强到弱排列：

1. **`git cherry <base> <branch>`** — 根据*补丁内容*而不是提交消息文本进行判断。所有显示
   `-` 的提交都已存在于基线上（即使经过变基或改写提交消息也仍能识别）；任何 `+` 都需要
   继续通过后续阶梯核查。绝不要通过 grep 提交消息来作出判断——同一项工作经常会以
   不同的消息合入。
2. **同文件取代检查** — 对于涉及后来在基线上被重新修改的文件的贮藏或 `+` 提交：
   提取其中该文件的版本，并与基线的当前版本进行比较
   （`git show <ref>:<path> | wc -l` 与 `git show <base>:<path> | wc -l`，然后抽查差异）。
   如果基线版本是一个**超集**（包含遗留项中的全部内容，外加后续工作），
   那么该遗留项就是已被取代的草稿。真实案例：一个标记为“未完成开发”的贮藏中包含一个 1128 行的
   渲染器；而 main 中的版本有 1151 行——包含相同的函数，*外加*一个后来新增的功能参数。
   恢复该贮藏将造成回退，而不是恢复工作。
3. **函数/标记级探查** — 在基线中 grep 遗留项中的独特新增内容
   （`def new_helper`、某个常量或某条错误字符串）。如果它们全都存在于基线上 → 已被取代。
   这可以发现“已被吸收到重构中”的情况，此时文件结构变化太大，无法使用第 2 阶梯。

任何无法证明已被取代的内容都应保留（与模式 C 采用相同的安全倾向：错误地判定为“已被取代”
会丢失工作；错误地判定为“仍然有效”最多只会占用一个分支名称）。有一条会改变判断结果的警告：**遗留项的
标签不能作为证据**——名为“未完成开发”的贮藏可能是已完全合入的早期草稿；
应始终将其内容与当前基线进行比较，绝不能根据名称判断。三个阶梯的完整示例（包括压缩提交伪象和已被吸收到重构中的情况）：
**[references/merge_verification.md](references/merge_verification.md)** § 取代情况分类处置。

**步骤 2 — 固定真正的孤立项，然后备份每个可寻址引用：**

```bash
scripts/git_preserve_danglers.sh --patch-dir <backup-dir>/dangling-patches
scripts/git_export_before_drop.sh --all-stashes --all-refs --out <backup-dir>
```

第一条命令使未被引用的提交变为可达；随后，`--all-refs` 会将分支、贮藏、
隐藏备份和链接工作树的 HEAD 引用捕获到一个经过验证的捆绑包中。对于小规模的定向清理，
请改为重复使用 `--branch`。导出工具绝不会丢弃或删除任何内容。

**步骤 3 — 按安全顺序销毁：**

- Stash：从**最高索引开始向下**丢弃（先执行 `drop stash@{2}`，再执行 `stash@{1}`）——索引会随着丢弃操作而变化，而从高到低处理可确保每个编号始终与备份文件名所表达的含义一致。
- 关联 worktree：要求 `git -C <path> status --short --branch` 显示工作区干净，记录其确切的 HEAD，证明该 HEAD 已被包含或取代，然后使用 `git worktree remove <absolute-path>`，**不要使用
  `--force`**，并重新运行 `git worktree list`。绝不要移除主检出或当前检出。遵循
  **[references/merge_verification.md](references/merge_verification.md)** § Worktree 退役。
- 本地分支：优先使用 `git branch -d`（它会拒绝删除未合并的分支）；仅对步骤 1 中已证明被取代、已备份且用户已授权删除的项目使用 `-D`。**压缩合并通常是导致 `-d` 拒绝删除内容已完全合并的分支的原因**：`-d` 根据提交祖先关系进行判断，而压缩合并会用一个具有新 SHA 的提交替换该分支的多个提交，因此，即使每一行内容都已合入，祖先关系仍然中断。这并不意味着可以条件反射式地改用 `-D`——而是应回退到步骤 1 的*内容*检查（`git cherry`、超集差异），并且只有在检查证明内容已被包含后才使用 `-D`。仅在重新核实确切的远程仓库以及仓库的可见性/所有权后，才删除远程分支。
- **独立 clone：不存在安全的 Git 级命令——只能使用 `rm -rf`，而 Git 无法撤销该操作。** `git worktree remove` 并不适用（因为它不是 worktree），也会拒绝提供帮助，因此通常所依赖的“如果不安全，工具会阻止我”这一道保障在这里并不存在。应改为明确执行检查：将删除操作设为只有在备份确实存在时才能进行，这样缺少文件时会直接中止，而不是事后才被发现。

  ```bash
  for f in <backup>/<untracked-file> <backup>/uncommitted.diff <backup>/history.bundle; do
    [ -s "$f" ] || { echo "MISSING: $f — refusing to delete"; exit 1; }
  done
  rm -rf <clone-path>
  ```

  与使用循环一次处理多个 clone 相比，应优先逐个删除 clone，并分别进行验证——一个删除五个目录的 glob 有五次出错的机会，却不会报告其中任何一次。

**步骤 4 — 删除后，按内容而不是按文件名重新检查。** 当清理（或一批压缩合并）已经完成，问题变成“其中是否有任何工作成果丢失？”时，先前看似充分的基于名称的检查——对 `git ls-tree` 的文件名运行 `comm`，或确认“每个文件仍然都在 main 上”——并不足够：文件名相同完全不能说明*内容*相同。已删除分支和保留分支上都存在的同一个文件，其内容仍可能逐行不同。应在 blob 层级重新验证，并以正确的方向阅读差异：

```bash
git diff <survivor-ref> <deleted-or-merged-tip>    # survivor first, the gone thing second
```

标记为 `-` 的行存在于保留分支中，但不存在于该 tip 中 → 保留分支是一个**超集**（安全：它拥有该 tip 中的全部内容，并且还有更多）。标记为 `+` 的行存在于该 tip 中，但不存在于保留分支中 → **可能存在丢失**——对每一处执行步骤 1 的逐级检查：该符号是否以不同形式存在于保留分支中（是重命名或重构，而不是删除）？如果一个差异大部分是 `-`，只有少量 `+`，这通常表明“保留分支已继续演进，而已删除分支是较旧版本”——说明合并成功，而不是工作成果丢失。对任何保留的备份应用相同测试：字节完全相同，或保留分支是超集，都属于安全情况；如果保留分支中确实完全缺少某一行，才需要升级处理。

**如果后悔了，恢复方法如下：** 补丁可通过 `git apply` 重新应用；未跟踪文件的 tar 归档可原地解压；bundle 可通过 `git fetch <file>.bundle <branch>:restored/<branch>` 恢复完整历史记录。

## 脚本（请执行这些脚本；除非特别注明，否则它们不会造成破坏性变更）

| 脚本 | 作用 | 是否会修改？ |
|---|---|---|
| `scripts/git_find_all_checkouts.sh [root ...]` | 查找本机上此仓库的每个检出副本——包括 `git worktree list` 无法发现的独立克隆——并标记其中包含未提交、未跟踪或未推送工作的副本，同时显示每个副本缓存的远程引用已过期多久（`STALE_AFTER=<s>`，默认值为 3600） | 无（只读，不执行 fetch） |
| `scripts/git_loss_audit.sh [remote]` | 刷新一个远程仓库，然后报告每个工作树、仅存在于本地的提交、stash 和悬空对象 | 仅修改远程跟踪引用 |
| `scripts/git_preserve_danglers.sh [--patch-dir DIR]` | 将悬空对象固定到 `refs/dangling-backup/`，可选择生成补丁 | 仅添加引用（绝不删除或执行 gc） |
| `scripts/git_verify_branch_merged.sh <branch> [base]` | 刷新远程仓库，然后在内容层面给出 MERGED/UNMERGED 结论 | 仅修改远程跟踪引用 |
| `scripts/git_export_before_drop.sh [--all-stashes] [--stash N] [--branch B] [--all-refs] [--out DIR]` | 将 stash 以及所选分支或所有当前引用导出为经过验证的 bundle | 仅写入备份文件（绝不丢弃或删除） |

所有五个脚本都从仓库根目录运行。它们只会执行 `find`、`fetch`、`log`、`diff`、`show`、
`status`、`cat-file`、`rev-list`、`rev-parse`、`fsck`、`for-each-ref`、`remote get-url`、
`stash show`、`archive`、`bundle create/verify`，以及（仅限保留脚本）`update-ref`——绝不会执行
`checkout`、`reset`、`push`、`stash drop`、`branch -d` 或 `gc`，因此可安全地在脏工作树中运行，
也可与其他代理同时运行。`git_find_all_checkouts.sh` 还绝不会执行 fetch，因此
即使处于离线状态或代理之后也能正常工作。

## 故障排除

- **审计结果显示一切正常，但用户仍认为有内容丢失**——相信他们，并怀疑是**范围问题，而非检查不够彻底**。仓库内的工具对于它们能看到的那一个目录而言，很可能全都给出了正确结果。在重新运行任何已经运行过的工具之前，先执行步骤 0（`git_find_all_checkouts.sh`）；在错误范围内重复一次正确执行的检查，只会以更强的信心得到同样的一切正常结论，这比第一次检查更糟。
- **`git_find_all_checkouts.sh` 什么都没找到，但你相当确定还有另一个副本**——按可能性从高到低有三个原因：(1) 该副本位于默认根目录之外（传入显式根目录，例如 `~`，并增大 `DEPTH`）；(2) 它位于被排除的路径下——扫描会跳过 `node_modules`、`.venv`、`vendor`、`.terraform`；(3) 它的 `origin` 指向完全不同的位置（某个 fork 或路径远程仓库），因此远程匹配将其排除——使用 `git -C <suspect> remote -v` 检查，并手动比较根提交：`git rev-list --max-parents=0 HEAD`。如果某个副本是在仓库尚未配置任何远程仓库时通过 `cp -r` 创建的，那么它只能通过根提交匹配。
- **`git_loss_audit.sh` 报告了看起来像旧 stash 的悬空提交**——这是频繁使用 stash 后的预期现象。它们现在可通过 reflog 访问；如果希望它们在 gc 窗口期后仍然保留，请使用 `git_preserve_danglers.sh` 固定它们，之后再从容地通过 `git show <sha>` 检查。
- **某个分支显示大量“领先提交”，但你怀疑它其实已被合并**——相信 `git_verify_branch_merged.sh` 的结果（基于内容），而不是提交数量。请参阅模式 C。
- **脚本中的 `git fetch` 在代理之后或离线时卡住**——丢失检测仍可基于缓存的远程引用正常工作，因为过期缓存只会多报未推送的工作。合并和取代结论（模式 C、模式 E）是例外，确实需要执行 fetch；如果无法执行，请在报告中明确说明，而不要把结论表述为已经确定。
- **你的工作看起来尚未合并，但仓库在你工作期间发生了变化**——在抢救任何内容之前先检查时间：`git_find_all_checkouts.sh` 会显示每个检出副本上次执行 fetch 的时间，而在完成一次新的 fetch 后，`git log --oneline <cached-base>..origin/main` 会显示期间新增的内容。长时间会话是风险窗口——开始时用于比较的基准，到结束时可能已经过期数小时。需要识别的症状是：你确定已经提交的更改似乎不在上游，因此准备再次发布它。请先执行 fetch，然后按内容进行比较；如果它确实已经进入上游，请在将你的版本重新应用并覆盖他人的版本之前，检查是否有人对它做了改进。
- **检出某个提交后处于 detached HEAD 状态**——只要执行 `git switch -c <branch> HEAD`，该提交就是安全的（或者 reflog 会将它保留约 90 天）。不要让重要的新工作在 detached HEAD 状态下经历 `gc`。
- **清理后只剩一个工作树**——`git worktree list` 始终会包含主仓库检出副本。不要仅仅为了让数量归零而删除它；目标是保留一个得到维护的检出副本，而不是不保留任何检出副本。
- **之后发现 `refs/dangling-backup/*` 引用显得杂乱**——确认其内容已存在于远程仓库（模式 C）后，可使用 `git for-each-ref --format='%(refname)'
  refs/dangling-backup/ | xargs -n1 git update-ref -d` 删除它们。务必先完成验证。

## 下一步

完成恢复/审计后，如果仓库还需要常规设置、安全提交/推送、冲突处理或交接规范，
这些属于 `auto-repo-setup` 技能的职责（调用 `/auto-repo-setup`）——本技能负责取证/恢复层，
而该技能负责常规工作流层。