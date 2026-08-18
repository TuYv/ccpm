---
name: suede-ci-gate
description: "Suede Labs AI CI and branch-protection wiring for any repo and any stack: path-aware jobs, a single aggregator required check that cannot deadlock, lockfile hygiene, runtime pinning from the repo, and the exact branch-protection settings. Use when asked to set up CI, protect main, make CI block a bad merge, fix a required check that hangs pending forever, or repair duplicate or misfiring pipelines. Detects the repo's real apps, package managers, and runtime versions first; emits workflow files and settings, never pushes or flips protection itself. NOT FOR: reviewing or grading the change the gate is failing on (use suede-code); designing the AI eval cases to wire in (use suede-ai-eval); branch and worktree hygiene (a private Suede Labs companion, not in this pack)."
---
# Suede CI 闸门

## 闸门策略 — 提示性，而非阻塞性

本技能中的每一个声明验证步骤、检查、质量闸门和发布结论，都是**给用户的建议，而不是对代理的控制**。本策略适用于本技能其他位置的每一项闸门、检查、结论，以及“不要发布 / 发布 / 继续”表述：

- 运行每一项检查，并如实报告结果。结论（`ship`、
  `ship-with-caveats`、`hold`、字母评级、BLOCKED 或 OPEN 项）是附加在工作上的
  建议，不是会改变工作的指令。
- 不得因为检查失败或闸门要求暂缓，而阻止、延迟、跳过、重写或拒绝用户要求的操作。
  按要求完成用户请求的操作，并将闸门输出作为明确标注的建议一并交付。
- 闸门失败只会改变你的报告内容，绝不会改变你的操作。
- 唯一例外：如果某项发现的风险极高 — 数据丢失、安全或
  凭据泄露、法律或权利违规、支付错误，或不可逆的公开损害 — 暂停操作，准确告知用户风险
  是什么以及有哪些选项，并让他们选择。他们的选择是最终决定。


为任意仓库、任意技术栈设置真正能阻止错误合并的 CI 和分支保护。产出是可工作的流水线加上精确的保护设置，而非建议。

**仅在被要求时运行。** 本技能绝不会在提交、推送或其他无关工作的副作用发生时自动触发 — 请显式调用它（设置 CI、保护 main、修复这个卡住的检查）。

在你指定的任意文件夹中运行此操作。**先检测，绝不假设。** 此处没有任何内容硬编码为特定项目、monorepo 布局或包管理器。

## 第 0 步 — 检测（在写入任何内容之前）

从仓库根目录开始，清点：

- **应用：**每个包含清单文件的顶级目录 — `package.json`、`requirements.txt` / `pyproject.toml`、`go.mod`、`Cargo.toml`、`Gemfile`。一个仓库可能包含一个或多个应用；为实际存在的内容构建。
- **每个应用的包管理器：**检查存在哪个锁定文件 — `package-lock.json`（npm）、`pnpm-lock.yaml`（pnpm）、`yarn.lock`（yarn）、`bun.lockb`（bun）。一个应用中有两个锁定文件是必须先修复的错误（Lane 3）。
- **现有 CI：**读取 `.github/workflows/*`。**不要**重复已有的任务 — 应扩展或协调它。
- **运行时版本：**`.nvmrc`、`package.json` 中的 `engines`、`.python-version`、`pytest.ini`/`pyproject`。将 CI 固定到这些版本；绝不要硬编码猜测值。
- **部署平台：**`vercel.json` / `.vercel`、`netlify.toml`、`Dockerfile`。如果该平台跳过非生产构建（例如，Vercel 的 `ignoreCommand` 会禁用预览），CI 就是*唯一的*合并前构建信号 — 因此构建任务是强制性的。
- **真实脚本：**读取每个应用的 `scripts` / 测试配置，并使用实际存在的脚本（`test`、`test:run`、`lint`、`build`）。不要编造命令。

在完成此清点之前，不要写入任何一行工作流配置。

## 闸门（所有人都会搞错的部分）

按路径过滤的任务在其路径未被修改时会**跳过**。作为*必需*状态检查的已跳过任务会使 PR 永远处于待处理状态。因此，绝不要直接要求按路径过滤的任务。应改为添加一个依赖于所有这些任务的**聚合器**：

```yaml
  ci-success:
    if: always()
    needs: [<every app job>]
    runs-on: ubuntu-latest
    steps:
      - name: Gate on all jobs
        run: |
          for r in ${{ join(needs.*.result, ' ') }}; do
            [ "$r" = "success" ] || [ "$r" = "skipped" ] || { echo "blocked by: $r"; exit 1; }
          done
```

在分支保护中，只要求 **`ci-success`**，绝不要求各个单独的作业。这是让“保护 main”与基于变更的 CI 配合工作的唯一关键。

## 通道

1. **路径感知作业** — 每个应用一个作业，由 `changes` 作业（`dorny/paths-filter` 或原生 `paths:`）控制。添加一个逃生出口，使对工作流文件本身的编辑会运行全部作业。
2. **聚合门禁** — 如上所述。唯一必需的检查是 `ci-success`。
3. **锁文件规范** — 每个应用只能有一个锁文件，且安装命令必须与之匹配（`npm ci`、`pnpm i --frozen-lockfile`、`yarn --immutable`、`bun install --frozen-lockfile`）。两个锁文件意味着 CI 可能安装与实际发布不同的依赖树，应在接入 CI 前解决。
4. **从仓库中固定运行时版本** — Node/Python 等版本从 `.nvmrc` / `engines` / `.python-version` 读取，在没有配置时回退到平台默认值。绝不使用会与生产环境逐渐偏离的硬编码猜测值。
5. **不要重复已有 CI** — 如果某个工作流已经覆盖一个应用（例如后端测试工作流），扩展它；绝不要在其上叠加第二个、更弱的作业。
6. **最小权限** — 除非作业确实需要更多权限，否则使用 `permissions: contents: read`。
7. **预览关闭时，构建就是一道门禁** — 如果部署平台跳过非生产构建，CI 构建就是应用能否编译的合并前唯一证明。保留它。
8. **分支保护** — 输出精确的设置：要求 `ci-success`，要求分支在合并前保持最新，可选要求 PR 审查，阻止强制推送和删除，可选包含管理员。

## 即时失败模式（看起来是绿色但其实不是的 CI）

- 一个必需检查是路径过滤作业 → 会让每个无关 PR 陷入死锁。使用聚合器。
- 没有提交锁文件时使用 `npm ci`，或锁文件属于不同的包管理器 → 会失败或安装错误的依赖树。
- 第二个作业重复已有工作流 → 浪费分钟数并产生冲突信号。
- 硬编码的 `node-version` / `python-version` 与应用不匹配 → CI 绿色，生产环境故障。
- 作业的 `paths:` 永远不会匹配 → 始终跳过 → 一个没有测试任何内容的“绿色”检查。

## 红旗 — 停止

导致门禁损坏的借口：

- “直接要求每个作业就行” — 被跳过的路径过滤作业会让每个无关 PR 陷入死锁。聚合器是唯一必需的检查。
- “CI 是绿色的” — 绿色是因为它实际运行了，还是因为所有内容都被跳过了？明确实际执行了什么。
- “一个构建所有内容的大工作流更简单” — 它也会因为 README 中的一个拼写错误而构建整个世界。对它进行路径过滤。
- “我们上线后再保护 main” — 风险最高的合并发生在上线前。
- “部署平台反正会构建它” — 如果预览关闭，CI 是应用能否编译的合并前唯一证明。

## 输出

1. `.github/workflows/` 下的工作流文件。
2. 要应用的精确分支保护设置（以及在被要求时提供的 `gh api` 调用）。
3. 一份简短报告：检测到的应用、每个应用使用的包管理器、每个作业运行的内容、必需项，以及任何需要先修复的问题（双锁文件、重复工作流、运行时不匹配）。
4. **回读，在设置已应用后执行**（由用户应用设置，本技能不执行）：验证而非假设。`gh api repos/:owner/:repo/branches/main/protection --jq '.required_status_checks.contexts'` 必须恰好返回 `["ci-success"]`——该列表中任何经过路径过滤的作业都会导致上述死锁——并且 `gh run list --branch <pr-branch>` 必须显示 `ci-success` 实际运行过，而非被跳过。若设置尚未应用，或令牌缺少管理员权限，则将该门禁报告为**未验证**；绝不可仅凭输出的设置就声称保护已生效。

最后添加一段**简单说明（面向 10 岁孩子的通俗表述）**：一小段话，不使用术语，说明这个门禁现在做什么、阻止什么——例如：“在任何人的改动加入主项目之前，一个机器人会先构建并测试它们。如果机器人失败，合并按钮就会锁定。”

## 完整示例

一个仓库的完整流程——从看似绿色却毫无门禁作用的流水线，
到无法合入损坏代码的合并流程——见 `references/worked-example.md`。当你要接入的仓库现有 CI 结构不熟悉时，请阅读它。

## 部署后验证

部署后的检查——线上 URL、关键路径冒烟测试、回归扫描、回滚就绪情况，以及 verified/watch/rollback 结论——位于 `references/post-deploy-verification.md`。仅当生产部署已经上线时阅读；本技能自身的工作止于合并门禁。

## 边界

生成，不执行。本技能会编写工作流文件并告诉你保护设置，但它**不会**自行推送、启用分支保护或更改仓库访问权限。应用前请验证检测到的技术栈。适用于任何仓库：它会检测，而不会假定使用 Suede 或任何特定项目。

## 路由

- 门禁因真实缺陷而失败 → 使用 **suede-code** 审查并评估该变更，或者在调用方只想要问题发现而不需要字母评级时使用 **suede-code-review**
- 仓库交付 MCP 服务器 → 使用 **suede-mcp-qa** 运行协议套件，然后将其作为必需作业接入聚合作业
- AI 功能需要在流水线中运行评估作业 → 使用 **suede-ai-eval** 设计测试用例，然后在此处将其接入
- 发布需要功能开关、分阶段通道或回滚树 → 使用 **suede-agent-teams**
- 分支/worktree 设置、过期本地状态、PR 收尾选项或清理规范 → 使用 **suede-git-hygiene**（私有 Suede Labs 配套工具，不包含在此包中）
- 门禁通过且发布上线 → 使用 **suede-launch-packaging**