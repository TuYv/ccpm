---
name: final-release-review
description: Perform pre-release planning or a final release-candidate review for openai-agents-python by comparing the target with the previous remote tag, determining the minimum compatible release type, auditing regressions and contract changes, reviewing open documentation PR coverage, drafting minor-release Key Changes, and calling the ship/block gate.
---
# 最终发布审查

## 目的

以以下两种模式之一审计 `BASE_TAG...TARGET`：

- **发布前规划：** 当用户要求规划下一个版本，或者目标（通常为 `origin/main`）尚未声明候选发布版本时使用。用户仍可提供暂定的 `patch` 或 `minor` 意向。推荐兼容的发布类型；不要将未变更的软件包元数据视为阻碍因素。
- **最终候选版本：** 当用户要求对最终候选版本作出决定、目标是发布分支，或者目标软件包元数据相较于 BASE 已为下一版本完成版本号提升时使用。将候选版本意向与差异所要求的最低发布类型进行比较。

在这两种模式下，都要查找具体的回归问题和发布风险，独立确定版本兼容性，在声称缺少文档覆盖之前审查最新的开放文档 PR，并生成可执行的发布交接信息。文档就绪情况应与发布门禁分开处理。发布结论是一项具有控制作用的检查结果：调用方在收到 **BLOCKED** 时必须停止，只有在收到 **GREEN LIGHT TO SHIP** 时才能继续。仅生成报告文本本身并不代表检查通过。

## 快速开始

1. 确保仓库根目录为 `openai-agents-python`。当调用方提供专用的候选版本 worktree 时，所有本地检查都必须从该 worktree 运行，而不是从该仓库的其他 checkout 运行。
2. 同步远程标签并选择上一个发布版本：
   ```bash
   BASE_TAG="$(.agents/skills/final-release-review/scripts/find_latest_release_tag.sh origin 'v*')"
   ```
3. 刷新并解析目标，默认为 `origin/main`：
   ```bash
   git fetch origin main --prune
   TARGET="$(git rev-parse origin/main)"
   ```
4. 独立于发布意向确定审查模式：
   1. 遵循用户对发布前规划或最终候选版本审查的明确要求。
   2. 否则，仅当目标是发布分支，或者其软件包元数据相较于 BASE 已为下一版本完成版本号提升时，才使用最终候选版本模式。
   3. 否则，使用发布前规划模式。
5. 单独确定发布意向；当仓库状态已经给出答案时，无需询问：
   1. 用户提供的版本或 `patch`/`minor` 意向。
   2. 声明了下一发布版本的目标分支名称或目标软件包版本。
   3. 否则，将意向设置为 `unspecified`。
   4. 如果用户明确要求使用最终候选版本模式，但意向仍为 `unspecified`，则在给出最终候选版本门禁结果之前，询问预期的发布类型或版本。如果用户希望审查不中断，则切换到发布前规划模式并给出建议。
6. 获取发布差异的快照：
   ```bash
   git diff --stat "${BASE_TAG}"..."${TARGET}"
   git diff --dirstat=files,0 "${BASE_TAG}"..."${TARGET}"
   git log --oneline --reverse "${BASE_TAG}".."${TARGET}"
   git diff --name-status "${BASE_TAG}"..."${TARGET}"
   ```
7. 使用 `references/review-checklist.md` 审计差异，确定最低发布类型，并依据已发布的契约证实或排除每个候选问题。
8. 使用当前只读的 GitHub 状态发现并审查相关的开放文档 PR。不要根据本地分支、标题或历史上下文推断覆盖情况。
9. 报告发布意向、发布/阻止门禁结果、风险评估、文档覆盖情况，以及有条件提供的次要版本发布“关键变更”草稿。

对于以 `TARGET=HEAD` 审查的最终候选版本，还必须确认 `HEAD` 正是候选版本检出中的目标，直接检查已检出的分支和由发布流程管理的文件，并避免把提交之外的工作树更改误认为已审查的候选版本内容。

## 发布意图和版本控制策略

- 将常规的兼容性发布视为 `patch`。
- 非 beta 公共契约的破坏性变更或重大功能新增必须使用 `minor`。在 1.0 之前保留主版本号。
- 独立于已声明的意图，根据差异确定**最低要求的发布类型**。
- 按以下方式对版本控制进行分类：

| 模式 | 预期发布类型 | 最低要求 | 判定 |
|---|---|---|---|
| 规划 | `unspecified` | 任一 | 建议采用最低要求的类型 |
| 规划 | `patch` | `patch` | 兼容的计划 |
| 规划 | `minor` | `patch` 或 `minor` | 兼容的计划；说明何时 minor 是可选的 |
| 规划 | `patch` | `minor` | 建议将计划改为 minor；不要阻止尚未发布的目标 |
| 候选版本 | `patch` | `patch` | 兼容 |
| 候选版本 | `minor` | `patch` 或 `minor` | 兼容；说明何时 minor 是可选的 |
| 候选版本 | `patch` | `minor` | 版本号偏低，必须阻止发布 |

- 在预发布规划模式下，即使用户提供了暂定意图，也始终报告 `Recommended release type: patch|minor`。不要要求 `pyproject.toml` 或 `uv.lock` 已经包含下一个版本号；发布工作流会在之后负责该版本号更新。
- 在最终候选版本模式下，验证声明的版本、包元数据、锁文件和发布分支是否一致。阻止发布需要 minor 版本的 patch 候选版本。
- 区分未记录迁移方式与不存在可用迁移或兼容路径这两种情况。缺少文档不构成阻断条件；实际支持路径被破坏且没有可用的迁移或回退方案时，可以阻止发布。

## 确定性门禁策略

- 默认给出 **🟢 GREEN LIGHT TO SHIP**，除非至少有一个阻断触发条件得到证实。
- 仅当存在具体的发布阻断证据以及可执行的解除阻断条件时，才使用 **🔴 BLOCKED**。
- 阻断触发条件：
  - 确认 `BASE_TAG...TARGET` 中引入了回归或错误。
  - 在最终候选版本模式下，声明为 `patch` 的发布实际上需要 `minor`，或候选版本的版本元数据不一致。
  - 确认公共 API、协议、配置或持久化状态存在破坏性变更，且没有可用的迁移、回退或兼容路径。
  - 存在具体的数据丢失、数据损坏或安全影响变更，且缓解措施尚未解决。
  - 差异破坏了发布关键的打包、构建或运行时路径。
- 以下情况本身绝不能构成阻断条件：
  - 差异规模大、重构范围广或涉及大量文件。
  - 没有证据的推测性“可能回归”问题。
  - 未在本地重新运行 CI 检查。
  - 文档缺失、不完整、未合并、过时或在发布后才提供。
  - 在预发布规划模式下，包版本元数据未发生变化。
- 文档审查可能会发现底层运行时或兼容性缺陷。仅因该缺陷而阻止发布，而不是因文档状态阻止发布。
- 即使门禁结果为绿色，也必须说明重要的用户可见发布影响面。
- 调用方必须将审查之后发生的任何目标、基准、候选版本内容、版本元数据、锁文件或契约变更视为会使门禁结果失效。发生变更的候选版本需要重新进行完整审查并给出新的发布结论。
- 绝不能仅因为报告模板填写完整就给出绿色发布结论。必须先检查目标差异以及适用的已检出候选版本内容。

## 工作流程

### 准备并梳理差异

- 获取当前远程标签和目标引用。不要将工作树纳入比较。
- 优先使用用户指定的基础标签，但仍需刷新远程标签。
- 除非另有说明，否则假定目标已通过仓库 CI。默认不要重新运行常规的单元测试、代码检查、格式检查、类型检查或覆盖率检查。
- 使用差异统计、目录分布、提交顺序和名称状态来识别高风险区域。将变更的测试视为行为证据，而非其本身即可构成证明。

### 检查已具现化的候选检出

在最终候选模式下，当调用方提供专用检出目录或工作树时：

- 在审计前解析并记录检出根目录、当前分支、`HEAD` 和工作树清洁状态。不要切换到恰好共享同一 Git 对象数据库的其他检出目录。
- 要求 `TARGET=HEAD` 解析为当前检出的提交。将分离头指针、发布分支不匹配、发布流程所拥有的文件存在未提交变更，或存在无关路径变更等情况视为候选版本不一致。
- 从该检出目录读取 `pyproject.toml`、`uv.lock` 和 `tests/fixtures/released_api_contract.json`。根据发布分支和提交的父提交，验证预期版本、可编辑的 `openai-agents` 锁定条目、契约基线和契约的 `baseline_commit`。
- 检查确切的提交差异，并在调用工作流定义了预期发布清单时，确认具现化的发布提交仅包含该清单。
- 将检出路径保留为提供给调用方的本地证据，但不要将本地路径放入可直接复制使用的发布文本中。

这些检查使最终候选版本审查成为发布门禁。对于绿色结果，报告仍是人类可读的证据和 PR 描述来源；它不能替代这些检查。

### 审计契约并证明发现

- 比较 BASE 和 TARGET，而不是孤立地审查 TARGET。
- 对于公共 API，比较导出项、对象身份、签名、位置顺序、默认值、枚举和文档化行为。
- 对于软件包，比较支持的 Python 版本、依赖项、额外依赖、分发内容、版本元数据和导入行为。
- 对于持久化状态、模式、协议、配置和环境变量，识别已发布的持久边界，并验证向后读取能力或可用的迁移路径。
- 根据 `.agents/references/README.md` 将运行时变更路由至其归属参考文档，并追踪必需的使用方和对称性维度。
- 仅当差异证明存在契约违规、支持路径上的可达回归，或具体的用户可见发布注意事项时，才将候选项提升为风险项。
- 当静态证据无法解决与决策相关的问题时，使用最小化的 BASE 与 TARGET 公共路径或已安装制品探测。
- 将已验证且版本标注正确的注意事项评为 **🟢 LOW**，将具体但尚未解决的回归信号评为 **🟡 MODERATE**，将已确认的阻断问题评为 **🔴 HIGH**。
- 每个风险项都应包含 `Evidence`、`Impact`、`Files` 和 `Action`。不要为安全的发布注意事项凭空添加测试或代码工作。

### 审查文档覆盖情况

- 首先根据运行时审计结果整理一份文档义务清单：破坏性变更、迁移、默认值、选择加入/选择退出、主要功能、公共 API、提供商/版本兼容性、持久化 schema，以及发生变化的用户工作流。
- 在将任何义务报告为未覆盖之前，先通过获准的只读 GitHub 访问检查当前开放的 PR。切勿在此仓库中使用 `gh`，也切勿更改 GitHub 上的任何内容。
- 使用预期/推荐版本、功能名称、关联的实现 PR、分支名称及变更的文档路径来查找候选 PR。不要仅依赖 PR 标题。
- 对于每个候选 PR，记录其 PR URL/编号和最新的 head SHA，然后审查其当前的完整 diff，以及任何会实质性影响覆盖情况判定的当前讨论。多个 PR 可能共同覆盖该清单。
- 将发布目标的 diff 与文档 PR 的 diff 分开处理。不要暗示开放的文档 PR 已经属于发布目标的一部分。
- 将总体覆盖情况分类为 `covered`、`partially covered`、`not covered`、`stale/conflicting` 或 `unverified`。
- 如果当前无法进行只读 GitHub 访问，请使用 `unverified`，说明搜索限制，并且不要声称不存在文档 PR。
- 对于每一项无法证明已覆盖的义务，包括 `partially covered`、`not covered`、`stale/conflicting` 和 `unverified` 的情况，请给出确切的发布后文件、章节、示例或声明，以及迁移措辞建议。覆盖情况未经验证时，将建议标记为临时建议。
- 将尚未合并的文档 PR 视为可接受的发布后交接方式。文档会实时发布，因此当该 PR 应在 SDK 发布可用之前保持未合并状态时，请予以注明。

### 起草次要版本的 Key Changes

- 当预期发布版本为 `minor`，或预发布规划建议使用 `minor` 时，始终提供一份可直接复制使用的 Key Changes 草稿。对于补丁版本则省略，除非用户明确要求。
- 根据已验证的面向用户的契约来起草，而不是依据原始提交数量或目录摘要。
- 遵循既定的 GitHub 发布格式：

  ```markdown
  ## Key Changes

  <用一段简洁的文字说明为何这是次要版本，以及其中是否包含破坏性变更。>

  ### Highlights:

  -   <按主题归类的三至七项面向用户的亮点。>
  ```

- 将破坏性行为及其支持的迁移方式或回退方案放在最前面。如果次要版本升级是由不含破坏性变更的主要功能引起的，请明确说明。
- 涵盖主要发布主题，但不要复述完整的 `## What's Changed` 列表。完整保留确切的公共名称、默认值、版本范围、选择退出方式和兼容性限定条件。
- 如果已存在发布的文档，请链接至这些文档。如果文档仅存在于开放的 PR 中，请勿发布不稳定的分支链接；应确保措辞自身完整，并在 Documentation coverage 中单独提及该文档 PR。
- 即使发布被阻止，也要生成草稿，但不要让润色后的发布文案掩盖阻止发布的问题。

## 形成建议

- 说明 BASE_TAG、TARGET commit、审查模式、预期发布类型、最低要求类型和版本判定。
- 汇总关键目录和文件数量，不要将每个 commit 都变成报告条目。
- 仅列出有充分依据的阻塞项和最重要的、已经核实的发布注意事项，通常按用户影响分为两到五组。
- 将文档覆盖情况放在单独的非阻塞章节中。
- 如果存在阻塞，请提供准确的解除阻塞检查清单和通过条件。如果不存在具体的解除阻塞操作，则不要阻塞。
- 不要包含常规命令结果、通过数量、跳过数量、取消选择数量或验证状态清单。

## 输出格式（必需）

使用以下结构以英文生成报告。始终使用固定的比较 URL `https://github.com/openai/openai-agents-python/compare/<tag>...<target-commit>`。

```markdown
### Release readiness review (<tag> -> TARGET <ref>)

This is a release readiness report done by `$final-release-review` skill.

### Diff

https://github.com/openai/openai-agents-python/compare/<tag>...<target-commit>

### Release intent

- Review mode: <pre-release planning | final candidate>
- Intended release: <patch/minor intent, with version when known, or unspecified in planning mode>
- Minimum required release type: <patch | minor>
- Recommended release type: <patch | minor; include in planning mode only>
- Versioning verdict: <compatible | compatible plan | recommendation only | revise plan to minor | under-versioned>

### Release call

**<🟢 GREEN LIGHT TO SHIP | 🔴 BLOCKED>** <one-line rationale>

### Scope summary

- <N files changed (+A/-D); key areas touched: ...>

### Risk assessment (ordered by impact)

1. **<Finding or release consideration title>**
   - Risk: **<🟢 LOW | 🟡 MODERATE | 🔴 HIGH>**. <Impact statement.>
   - Evidence: <specific BASE-versus-TARGET evidence>
   - Files: <path(s)>
   - Action: <next step and pass condition>

### Documentation coverage (non-blocking)

- Coverage source: <PR URL/number and head SHA, multiple PRs, none found after a successful search, or search unavailable/partial>
- Status: <covered | partially covered | not covered | stale/conflicting | unverified>
- Covered obligations: <concise list or none>
- Gaps or post-release suggestions: <exact files/sections/claims, or none>
- Publication timing: <merge after release if the docs describe unreleased behavior, or not applicable>

### Unblock checklist

1. [ ] <required only when blocked>
   - Exit criteria: <what must be true>

### Key Changes draft

<Include the copy-ready `## Key Changes` block only for an intended or recommended minor release.>

### Notes

- <Material assumptions only>
```

- 发布获准时，省略 `Unblock checklist`。
- 对于补丁发布，除非有明确要求，否则省略 `Key Changes draft`。
- 对于会影响行为且获准的发布，至少保留一项 **🟢 LOW** 注意事项；不要只返回“未发现重大风险”。
- 对于不存在值得报告的用户可见契约变更、仅涉及元数据的发布，可以使用简洁的无风险说明。

## 资源

- `scripts/find_latest_release_tag.sh`：刷新远程标签并返回最新的匹配发布标签。
- `references/review-checklist.md`：详细的发现信号、发布意图检查、文档覆盖范围审查和证据要求。