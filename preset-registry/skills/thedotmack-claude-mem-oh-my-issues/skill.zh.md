---
name: oh-my-issues
description: Cluster a GitHub issue backlog by root cause into a small set of plan-master issues, redirect children with a standardized comment, and bundle architectural-fix PRs that close clusters atomically. Use when an issue tracker has accumulated dozens of reports that share underlying defects, when asked to triage / consolidate / cluster / dedupe issues, when asked to build a plan series or roadmap from open issues, or when routing a new incoming bug into an existing plan.
---
# oh-my-issues

将问题待办清单转化为路线图。Issue 是症状数据，而非工作单元；工作单元是产生它们的架构缺陷。最终状态是 `open issues == open plans`，一一对应。

## 核心原则

不要逐个关闭 Issue。将共享单一架构修复方式的症状聚成一组，为该分组设定一个标准化归宿（一个主计划 Issue + 一个 `plans/0X-*.md` 设计文档），用统一的重定向方式关闭每个子 Issue，并为每个分组提交一个 PR，原子化关闭该分组的全部子项。新出现的 Bug 以“第 N 轮（Round N）”评论追加到匹配的主计划，而不是作为新追踪 Issue 打开。

这在三个方面形成复合效应：架构修复一次性淘汰整类症状，计划中的测试矩阵在 CI 中制度化地预防复发，标准化分流让剩余新流入成本更低。

## 适用场景

- 仓库有 20+ 个未关闭 Issue，且许多看起来像重复项或同一缺陷在不同平台下的表象。
- 用户要求对问题列表进行“triage”（分流）、“consolidate”（合并）、“cluster”（聚类）、“dedupe”（去重）、“group”（分组）或“make a plan from”（基于其制订计划）。
- 新 bug 被提交，用户想确认它是否属于已有工作。
- 用户希望提交一个聚焦 PR 来解决一组相关问题。

## 不适用场景

- 未关闭 Issue 少于约 15 个：直接逐个关闭即可。
- Issue 彼此真正独立（无共享根因）：每个 Issue 一个修复是正确做法。
- 仓库没有 `plans/` 规范，且用户不愿引入时——先提出建议，不要直接强制执行。

## 三种模式

### 模式 1：聚类遍历（初始归并）

用于待办列表尚未进行过归并的情况。目标：一次性从 N 个 Issue 降到 N_plans 个主计划。

1. **完整阅读。** 获取每个未关闭 Issue 的正文 *和* 评论线程，而不仅是标题。只看标题的表层归并会失败，复现步骤、关联重复项和诊断输出通常位于评论中，而不在原始正文内。参见下文的“GitHub CLI primitives”，了解正确的分页列表与逐 Issue 评论抓取方式（单次 `gh issue list` 调用**不会**返回评论正文）。
2. **按根因聚类，而非按表象。** 聚类时关注问题是：*一次架构变更是否能一次性修复这些问题？*——而不是 *它们是否出现了同一个词？*。`Windows` 是表象；`spawn contract violated by host shells` 是根因。不同表象的两个 Issue 也可归入同一簇（例如：两个不同代码路径中同一缺失环境隔离边界导致的环境变量泄露）。
3. **把每个分组命名为架构问题。** 标题格式：`[plan-XX] <Architectural Defect> — <one-line scope>`。示例：`[plan-02] Spawn-Contract Templating — canonical ${CLAUDE_PLUGIN_ROOT} resolution across all hosts`。标题必须表达修复动作，而非仅表达主题。
4. **为每个分组创建一个主 Issue**，正文中列出：架构缺陷、子 Issue（按编号）、修复顺序，以及必需的测试矩阵（host × IDE × shell 等）以防止回归。
5. **将每个主计划在仓库中镜像为 `plans/0X-<slug>.md`。** Issue 作为公开跟踪项，文档作为设计文档。两者互相引用。
6. **关闭每个子 Issue**，使用标准化重定向评论（见下文），并标记为 `not planned`。
7. **验证最终状态：** `gh issue list --state open` 仅返回主计划且不包含其他内容。

约 100 个 Issue 的目标形态是 4–8 个主计划。超过 10 个说明你是在按表象聚类；少于 3 个说明分组过宽，不适合以一个 PR 各自独立发出。

### 模式 2：分流（新增 bug，稳态维护）

用于归并完成后出现新 issue 的情况。目标：防止 Issue 列表再次堆积。

1. **完整阅读新 Issue 的正文。**
2. **将症状与既有主计划进行模式匹配。** 对每个未关闭主计划，提问：*这里描述的修复是否也能修复这个新 bug？* 若是 → 属于该计划。
3. **若存在匹配**，在主计划下追加“Round N”评论，内容包括：
   - 指明新的子 Issue 编号
   - 一句话描述该症状
   - 勾勒具体修复（1–3 行，例如：`guard with \`case "$_SH" in /*.exe|"" ) _SH=bash ;; esac\``）
   - 补充该 bug 暴露出的任何新增测试矩阵单元
4. **将子 Issue 关闭**，使用标准化重定向评论，标记为 `not planned`。
5. **若无匹配且 bug 真正新颖：** 新建主计划 + `plans/0X-*.md`。不要滥用；大多数 bug 都是已有计划的子项。

### 模式 3：打包（交付分组）

当某个计划切片准备发版时使用。目标：一个 PR 原子化关闭 N 个子 Issue。

1. **列出主计划的子项。** 从主 Issue 正文和归并评论中收集该计划下路由到此处的全部子 Issue 编号。
2. **核验每个子 Issue 的症状是否被 PR 中的架构修复覆盖。** 若有未覆盖项，则该 PR 尚未就绪，或该子 Issue 应归入其他计划。
3. **生成 PR 描述：** 标题为计划切片（如 `"fix(spawn): canonical ${CLAUDE_PLUGIN_ROOT} resolution"`）；正文列出每个子 Issue，并附带 `Closes #N`，以便 GitHub 在合并时自动关闭。
4. **将计划中的测试矩阵** 在同一 PR 中补充到 CI。没有这个矩阵，问题分组会再次出现。
5. **合并后**，只有当所有子 Issue 均已覆盖，才可关闭主 Issue；若计划仍有剩余范围，保持主 Issue 打开，并将该 PR 标记为分阶段交付里程点。

## 命名主计划

主计划标题必须表达其修复内容。

| Bad (surface) | Good (architectural) |
|---|---|
| Windows bugs | Spawn-Contract Templating across hosts |
| Worker crashes | Worker / Daemon Lifecycle Hardening — supervision, health, retry |
| Auth issues | Worker Env Isolation — strip host CLI env from the SDK subprocess |
| Install failures | Installer Failure Transparency — cross-IDE error taxonomy + 12×4 test matrix |

如果你无法用一行写出架构范围，这个分组就是错误的。

## 标准化重定向评论

对每个子 Issue 关闭都使用这段固定表述。统一风格可让贡献者一眼识别模式，也便于审计链路检索。

```text
Consolidating into #<MASTER> (plan-XX). The root cause and fix sequencing are tracked there alongside the rest of the cluster — please follow that issue for progress.
```

使用 `not planned` 关闭（而非 `completed`）——因为子 Issue 是症状，而非工作单元。

## GitHub CLI primitives

解析仓库：

```bash
repo_json=$(gh repo view --json owner,name)
owner=$(jq -r '.owner.login // .owner.name' <<<"$repo_json")
repo=$(jq -r '.name' <<<"$repo_json")
```

列出所有未关闭 Issue（完整读写流程）。两个关键注意点：
- `gh issue list --json comments` 只返回计数占位符，不返回评论正文。你必须用 `gh issue view <N> --json comments` 对每个 Issue 逐一抓取评论。
- 任何显式的 `--limit` 在 backlog 很大时都会被静默截断。务必先检查全部未关闭数量。

```bash
# 1. 确认总数——不要信任任意的 --limit。
# 注意：GitHub 的 REST API 将 PR 也算作 issue，因此 /repos/{owner}/{repo} 中的
# .open_issues_count 实际上是 issues + PRs。使用 search
# API 获取仅 issue 的数量。
total=$(gh api "search/issues?q=repo:$owner/$repo+is:issue+is:open" --jq '.total_count')
echo "Open issues: $total"

# 2. 列出正文（将 --limit 设置为至少真实总数）
gh issue list --state open --limit "$total" \
  --json number,title,body,labels,author,createdAt

# 3. 对每个 issue 获取完整评论链
for n in $(gh issue list --state open --limit "$total" --json number --jq '.[].number'); do
  echo "=== Issue #$n ==="
  gh issue view "$n" --json comments \
    --jq '.comments[] | "\(.author.login) (\(.createdAt)): \(.body)"'
done
```

如果 `total > 1000`，通过 REST API 分页：`gh api "repos/$owner/$repo/issues?state=open&per_page=100&page=N"` 循环直到结果数组为空（注意该接口包含 PR，因此要过滤 `select(.pull_request|not)`）。

创建主计划：

```bash
gh issue create \
  --title "[plan-02] Spawn-Contract Templating — canonical \${CLAUDE_PLUGIN_ROOT} resolution across all hosts" \
  --body-file plans/02-spawn-contract-templating.md \
  --label plan,plan-02
```

发布合并评论并关闭子问题：

```bash
gh issue comment <CHILD> --body "Consolidating into #<MASTER> (plan-XX). The root cause and fix sequencing are tracked there alongside the rest of the cluster — please follow that issue for progress."
gh issue close <CHILD> --reason "not planned"
```

向主问题追加一个 `"Round N"` triage 评论：

```bash
gh issue comment <MASTER> --body "$(cat <<'EOF'
**Round N consolidation**

- #<CHILD> (<one-line symptom>) folded into this plan as <classification>.

Proposed fix: <1–3 line sketch>.

Adds matrix cell: <host/IDE/shell combination>.
EOF
)"
```

验证最终状态：

```bash
gh issue list --state open --json number,title \
  | jq -r '.[] | "\(.number)\t\(.title)"'
```

输出结果应当仅包含计划主单。

## 计划主单正文模板

保存为 `plans/0X-<slug>.md`，并将其作为主 issue 的 `--body-file` 使用。

```markdown
# [plan-XX] <Architectural Defect> — <one-line scope>

## Defect

<One paragraph: what is structurally broken, why it produces the observed family of symptoms.>

## Children

- #N — <symptom one-liner>
- #N — <symptom one-liner>
- ...

## Fix sequence

1. <First architectural change — bounded, reviewable>
2. <Second>
3. ...

## Test matrix

| Axis A | Axis B | Required behavior |
|---|---|---|
| ... | ... | ... |

The matrix lives in CI. A future regression must fail CI before a user can file.

## Out of scope

<What this plan deliberately does not cover, with pointers to other plan masters.>
```

## 健康检查

定期针对计划主单运行以下检查，以捕获失败模式。

- **Graveyard master：** 主单已累计 5+ 条 “Round N” 评论但尚无上线 PR。该计划需要一个强制 PR，或必须拆分。
- **Over-broad master：** 子问题的修复无法合并为一个 PR。应拆分为两个范围更窄的计划。
- **Surface-clustered master：** 子问题有共同主题但无共同修复方案。按根因重新聚类；部分子问题应归入其他计划。
- **Drift between issue and doc：** 主单正文与 `plans/0X-*.md` 不一致。选择一个为权威（文档），并从它重新生成 issue 正文。

## 停止条件

- 对于一次 cluster pass：当 `gh issue list --state open` 返回的仅为主单时停止。
- 对于一次 triage：当新子问题已关闭且主单已包含 Round-N 条目时停止。
- 对于一次 bundle：当 PR 合并且主单中列出的每个子问题都因 `Closes #N` 而自动关闭时停止。

## 需要拒绝的失败模式

- **Premature clustering**：在完整阅读每个 issue 正文之前就提前聚类。严禁。
- **Closing children before the master is open.** 在主单未打开前不要关闭子问题，子问题必须始终有重定向目标。
- **Using the redirect comment for issues that aren't symptoms**（如真正的功能需求且无共享根因）。这类 issue 应保持开放或走各自的处理通道。
- **Closing a master before every listed child is shipped.** 主单是合同约定；提前关闭会破坏审计链。
