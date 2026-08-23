---
name: release-candidate-prep
description: Preflight and prepare an OpenAI Agents Python release candidate in a dedicated worktree from exact origin/main, gate readiness before branch creation, freeze the released API contract, create or replace the local release branch with one release commit, enforce final release review as a checker, and produce release-specific PR text. Use only when explicitly invoked with a version. Never push, open a PR, or mutate GitHub.
---
# 发布候选版本准备

仅当用户显式调用 `$release-candidate-prep` 并提供一个不带前导 `v` 的发布版本时，才使用此技能，例如 `VERSION=0.20.1`。此技能使用经过审查的本地工作流，取代已移除的 GitHub Actions 发布 PR 创建器。

## 不可妥协的边界

- 将显式调用视为执行以下操作的授权：获取 `origin/main`、创建一个专用的分离式发布工作树、在其中运行与分支无关的发布就绪性门禁、仅在这些门禁通过后于该工作树中创建或替换本地 `release/v<version>`、更新三个由发布流程负责的文件，并创建一个本地提交。如果该分支已存在于本地或远程，所要求的最终本地状态仍必须是精确对应当前 `origin/main`，且仅包含新的发布提交；只有当现有本地分支未在其他工作树中被检出时，才可以替换该分支。
- 让用户的源检出保持在其现有且干净的 `main` 提交上。不要对其执行快进、切换其分支，也不要在那里生成发布文件。保留专用发布工作树，以用于通过后的交接、受阻审查或可恢复的失败。
- 绝不推送、创建或编辑拉取请求、添加标签或里程碑、创建发布，或以其他方式修改 GitHub。绝不运行 `gh`。
- 仅负责 `pyproject.toml`、`uv.lock` 和 `tests/fixtures/released_api_contract.json`。运行时、文档、工作流或其他仓库变更必须在发布准备之前合入 `main`。
- 不要暂存、删除、覆盖或移除现有工作树，也不要绕过无关的本地变更。在以下情况下，必须于创建分支前失败：初始检出存在未提交更改或不在 `main` 上；专用工作树并非干净的、处于分离状态且指向刷新后的 `origin/main`；现有本地发布分支已在其他工作树中被检出；在允许的依赖项引导恢复之后，预期的软件包契约门禁仍然失败；规划审查阻止继续；或者在这些门禁运行后 `origin/main` 又有推进。
- 将 `$final-release-review` 视为具有控制权的发布检查器，而不只是报告生成器。其规划门禁必须在创建分支前通过，其最终候选版本门禁必须检查已生成内容的工作树，并在交接为 PR 就绪状态之前通过。候选内容、提交或基础分支的任何变更都会使之前的通过结果失效。
- 从每个子命令中移除继承的 `OPENAI_API_KEY`。发布准备不需要实时发起 OpenAI API 请求。
- 在完成本地提交、最终发布审查和可直接复制的交接内容后停止。推送和创建拉取请求由用户负责。

## 1. 确定发布输入

要求提供一个类似 semver 且不带前导 `v` 的版本。不要根据里程碑、分支名称或本地修改推断版本。说明此技能将创建并保留一个包含单个本地提交的专用发布工作树，保持源检出不变，并且不会写入 GitHub。

开始之前，完整阅读 `$final-release-review`。它的最终候选版本报告就是发布拉取请求的描述。不要对发布候选版本本身使用 `$pr-draft-summary`；此技能负责固定的发布分支、提交主题、标题和描述。在实现对此技能或其他仓库行为的更改时，仍照常继续使用 `$pr-draft-summary`。

## 2. 创建隔离的无分支预检输入

在仓库根目录中运行：

```bash
env -u OPENAI_API_KEY -u GITHUB_TOKEN -u GH_TOKEN UV_DEFAULT_INDEX=https://pypi.org/simple uv run --frozen python .agents/skills/release-candidate-prep/scripts/prepare.py preflight --version <version> --worktree-root <codex-worktree-root>
```

辅助程序必须完成以下所有操作，否则应在将源检出保留于其原始 `main` 提交的同时，给出可操作的错误并失败：

1. 验证仓库根目录、`main` 分支和干净的工作树。
2. 检查 `release/v<version>` 是否存在于本地或远程。允许替换，但如果本地分支已在另一个工作树中检出，则失败。
3. 将 `main` 获取到 `origin/main`，但不合并或切换源检出。
4. 在配置的 Codex 工作树根目录下选择一个唯一的、面向任务的路径。同时检查文件系统和 `git worktree list`；绝不复用或删除发生冲突的路径。
5. 在精确刷新后的 `origin/main` 上创建一个分离头指针工作树，然后要求该工作树保持干净、处于分离头指针状态，并位于精确的 40 字符基础提交上。
6. 重新检查现有本地发布分支仍可被替换，并要求源检出在其原始提交的 `main` 上保持干净。
7. 输出精确的基础提交、未发生变化的源检出提交、计划创建的分支，以及专用工作树路径，供两个就绪门禁和后续实体化使用。

将基础提交记录为 `<preflight-base>`，将源检出提交记录为 `<source-head>`，并将路径记录为 `<release-worktree>`。此时不要创建或切换分支。如果后续门禁阻止流程继续，请保留分离头指针工作树，以便仍可检查其中经过确切审查的源代码。

## 3. 运行无分支就绪门禁

在启动任一就绪门禁之前，先引导配置专用工作树：

```bash
env -u OPENAI_API_KEY -u GITHUB_TOKEN -u GH_TOKEN UV_DEFAULT_INDEX=https://pypi.org/simple make sync
```

此依赖安装是强制性的环境准备，而不是候选版本实体化。它与预期契约 CI 作业保持一致，后者会在生成契约之前安装所有可选依赖项。同步完成后，要求 `<release-worktree>` 保持干净，忽略的环境或 `.tmp` 输出除外。如果同步更改了受跟踪或未跟踪的仓库路径，请停止并保留该证据，而不要将发生更改的检出视为经过审查的源代码。

在实体化任何候选版本之前，针对精确的 `<preflight-base>` 运行以下两个门禁：

1. 从 `<release-worktree>` 启动预期的已发布包契约门禁：

   ```bash
   env -u OPENAI_API_KEY -u GITHUB_TOKEN -u GH_TOKEN UV_DEFAULT_INDEX=https://pypi.org/simple make check-prospective-released-api-contract
   ```

2. 从 `<release-worktree>` 调用 `$final-release-review`，使用**发布前规划**模式，并将 `TARGET=<preflight-base>` 和请求的版本作为发布意图。要求其发布检查器结果为 **GREEN LIGHT TO SHIP**。将目标固定到该提交，而不是允许后续的 `origin/main` 刷新改变经过审查的源代码，并要求所有本地源代码、契约和包检查均使用专用工作树。

这些门禁是同一个干净源提交的独立使用方。当执行环境支持并行时，将预检命令作为长时间运行的会话启动，并在其运行期间执行只读规划审查。等待两项结果都完成后再继续。如果无法并发执行，则按顺序运行，先执行预检门禁；正确性不得依赖于并行执行。

如果预检命令仅报告可选依赖模块不可用，请将该结果视为可恢复的环境引导失败，而不是契约门禁判定。不要让用户在同步依赖和修复 `main` 之间做选择。重新运行无需凭据的 `make sync` 命令，要求工作树保持干净，并仅重试预检命令一次。不得将此恢复流程用于契约不匹配、打包或运行时兼容性失败、仓库路径已更改，或任何其他实质性门禁失败。

如果依赖同步仍然失败、单次重试后预检命令仍报告依赖模块不可用，或者任一门禁以其他方式失败或被阻塞，请停止操作，不要创建 `release/v<version>`，保持源检出不变，保留分离的工作树，并报告其路径以及确切的失败信息或规划审查的解除阻塞检查清单。将依赖安装失败归类为环境或依赖设置问题，将契约生成不匹配归类为 `main` 上的公共接口或 `tests/fixtures/released_api_contract_policy.json` 工作，并根据实际失败的源代码、打包、平台或运行时路径对已打包兼容性失败进行归类。被阻塞的规划审查应根据实际情况，将运行时或文档时机的后续处理指向 `main`。不要仅仅因为审查生成了格式良好的报告就继续操作。

两个门禁均通过后，必须满足以下所有条件才能进行实体化：

- 源检出仍位于 `main`，保持干净，并且与预检前的提交相同。
- `<release-worktree>` 除了被忽略的 `.tmp` 输出外保持干净，仍处于分离状态，且 `HEAD == <preflight-base>`。
- 规划审查的绿色门禁适用于 `<preflight-base>` 和所请求的发布意图。

## 4. 实体化未提交的候选版本

运行：

```bash
env -u OPENAI_API_KEY -u GITHUB_TOKEN -u GH_TOKEN UV_DEFAULT_INDEX=https://pypi.org/simple uv run --frozen python .agents/skills/release-candidate-prep/scripts/prepare.py materialize --version <version> --expected-base <preflight-base> --expected-source-head <source-head> --worktree <release-worktree>
```

该辅助程序必须完成以下所有操作，否则应以可操作的错误信息失败：

1. 再次执行源根目录、干净的 `main`、版本、已注册工作树、分离 HEAD 和发布分支可替换性检查。
2. 再次刷新 `origin/main`，且不移动源检出。
3. 要求刷新后的 `origin/main` 和 `<release-worktree>` HEAD 均等于 `<preflight-base>`。如果 `origin/main` 已向前推进，请保留旧的分离工作树，并在新的精确基线工作树中重新运行预检和两个就绪门禁。
4. 在更新 `pyproject.toml` 中唯一的项目版本声明时，保持工作树处于分离状态。
5. 使用 `UV_DEFAULT_INDEX=https://pypi.org/simple` 运行 `make sync`。
6. 运行 `make update-released-api-contract VERSION=<version>`，然后运行 `make check-released-api-contract VERSION=<version>`。
7. 要求 `<release-worktree>` 中恰好只有三个由发布流程负责的路径被修改，将它们保持为未暂存且未提交状态，并确认源检出保持不变。
8. 仅在这些候选版本检查通过后，才在 `<release-worktree>` 内创建本地 `release/v<version>`，或将其重置到精确的 `<preflight-base>`，同时保留已验证的未暂存清单。不要保留较旧本地或远程候选版本中的提交或内容。这种延迟替换必须确保在候选版本生成失败时，现有本地分支保持不变。

如果辅助工具在创建分支后失败，请保留其本地分支、专用工作树和工作树中的现场证据。报告失败的命令和状态，而不要猜测部分执行后是否可以安全恢复。绝不要将移除工作树作为自动清理操作。

## 5. 审查并提交准确的发布差异

从 `<release-worktree>` 运行其余命令。在暂存之前检查所有归发布流程所有的文件：

```bash
git status --short
git diff --check
git diff -- pyproject.toml uv.lock tests/fixtures/released_api_contract.json
```

确认以下所有事项：

- `pyproject.toml` 和 `uv.lock` 中可编辑的 `openai-agents` 条目声明了所请求的版本。
- API 合约基线为 `v<version>`，其 `baseline_commit` 是发布分支所基于的准确 `origin/main` 源提交。
- 生成的合约保留了上一个发布版本，并冻结了预期的新导出和签名。
- 已明确审查所有预期的 `public_properties`、`canonical_imports` 或 `public_modules` 策略新增项；更新工具不会自行推断这些内容。
- 三文件发布清单之外的任何路径均未被更改、暂存或处于未跟踪状态。

仅暂存清单中的文件，并创建恰好一个本地提交：

```bash
git add pyproject.toml uv.lock tests/fixtures/released_api_contract.json
git commit -m "release: <version>"
```

不要通过修改提交的方式将无关内容并入该提交。

## 6. 运行最终候选版本发布审查

从 `<release-worktree>` 以最终候选模式调用 `$final-release-review`，并将发布提交指定为 `TARGET=HEAD`。此次调用是一次发布检查：它必须检查完整的候选差异以及实际签出的 `release/v<version>` 内容，包括 `pyproject.toml`、`uv.lock` 中可编辑的 `openai-agents` 条目和 `tests/fixtures/released_api_contract.json`。分支、包元数据、锁文件、合约基线、合约 `baseline_commit` 和预期版本必须一致。

如果审查受阻，请停止。返回其解除阻塞检查清单，保留本地分支、提交和工作树以便后续处理，并且不要将候选版本表述为已准备好创建 PR。发布调用受阻时，报告正文并不表示可以继续执行。完成任何修复后，如果公共接口可能已发生变化，请重新生成 API 合约，恢复为单个发布提交，并重新运行完整的最终候选版本审查。

先前的规划审查证明了源提交在创建分支之前已准备就绪。此最终候选版本审查仍然是必需的，因为它会共同验证已实际生成的分支、版本元数据、锁文件和冻结的合约。将其绿色发布结论视为交接门槛，然后复用其完整报告作为发布拉取请求的描述；不要用规划报告代替它。

## 7. 重新检查 main 的新鲜度

获得绿色审查结果后，从 `<release-worktree>` 再次以无凭据方式获取 `origin main`，并将其与发布提交的父提交进行比较。如果二者不同，则候选版本已经过期。首先确认分支是干净的、恰好有一个本地提交，并且该提交仅更改了三文件发布清单。将该提交变基到新的 `origin/main` 上，以便 Git 检测发布元数据中的任何冲突。完成干净的变基后，通过混合重置将本地发布分支移回 `origin/main`，这会将变基后的发布树保留为未暂存的任务所属更改。从 `origin/main` 恢复全部三个归发布流程所有的文件（`pyproject.toml`、`uv.lock` 和 `tests/fixtures/released_api_contract.json`），运行 `make sync`，并要求工作树在新基准上保持干净。仅在该内部一致的基准状态下运行 `make check-prospective-released-api-contract`，此时已安装的项目版本与冻结的合约基线保持一致。然后将 `pyproject.toml` 更新为 `<version>`，运行 `make sync`，运行 `make update-released-api-contract VERSION=<version>` 和 `make check-released-api-contract VERSION=<version>`，再次审查准确的清单，并重新创建单个 `release: <version>` 提交。基准和候选内容已发生变化，因此之前的绿色检查结果已失效：从工作树重新运行 `$final-release-review`，并要求获得新的绿色发布结论。重复此过程，直到已审查的本地分支恰好比当前 `origin/main` 领先一个提交，并且该提交仅更改三文件发布清单。

如果重放发生冲突或其他路径发生变更，请停止操作并保留可恢复的证据。不得强制解决问题，以免发布提交超出其清单范围。

## 8. 生成发布交接材料

对于状态正常且为最新的候选版本，请返回 `$final-release-review` 报告，并在其后附上以下英文的发布专用区块：

```markdown
# Release Pull Request

## Branch

release/v<version>

## Commit

release: <version>

## Title

Release <version>

## Description

<the complete final-candidate report from $final-release-review>
```

对报告应用仓库的 GitHub 即贴即用规则。对此仓库使用原生 `#123` 引用，对其他仓库使用 `owner/repo#123`。保留必需的比较 URL。不得在可直接复制使用的描述中包含本地路径、Codex 引用、操作诊断信息或应用指令。

还需在可直接复制使用的区块之外报告专用工作树路径、本地分支、提交 SHA、父 `origin/main` 提交以及准确的三文件清单。明确说明源检出未发生更改、未推送任何内容且未创建拉取请求。保留工作树不变，以便用户进行交接。

如果 `release/v<version>` 已存在于 `origin`，请在交接前立即使用无需凭据的 `git ls-remote --heads origin release/v<version>` 检查其当前的准确提交，并将其记录为 `<observed-remote-release-commit>`。明确说明本地分支已替换旧候选版本，现在包含准确的当前 `origin/main`，并且仅额外包含新的 `release: <version>` 提交。由于此技能从不修改 GitHub，请向用户提供准确的 `git push --force-with-lease=refs/heads/release/v<version>:<observed-remote-release-commit> origin release/v<version>` 命令，供其自行替换远程分支；绝不要运行该命令。在这种替换场景下，普通推送或未指定租约的推送均不充分。如果远程分支在检查后发生变化，显式租约必须拒绝推送，而不是覆盖未曾查看的工作。

## 失败行为

- 预检或工作树创建失败：保持源检出不变，并且不要删除或复用任何发生冲突的工作树。
- 依赖引导失败：仅按照就绪门禁流程中的说明，重试不可用的可选依赖设置；如果恢复未成功，则保留分离状态的工作树并返回准确的失败信息。
- 在允许的依赖引导恢复后，预期契约检查失败，或规划审查受阻：保留分离状态的工作树，不要创建发布分支，并返回准确的失败信息或解除阻塞检查清单。
- 成功替换分支之前发生实体化失败：保留分离状态的工作树及其中未提交的证据，并保持任何现有本地发布分支不变。成功替换分支后发生失败时，必须保留工作树、分支及证据，使其与失败命令执行后留下的状态完全一致。
- 最终候选版本审查受阻：保留唯一的发布提交和工作树，不要声称候选版本已准备好创建拉取请求，并返回由检查器生成的解除阻塞检查清单。
- 新鲜度冲突或出现意外变更路径：停止操作并保留可恢复的工作树证据，而不是强制解决问题或扩大发布清单。