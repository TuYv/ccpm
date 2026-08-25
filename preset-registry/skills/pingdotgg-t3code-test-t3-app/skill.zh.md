---
name: test-t3-app
description: Launch, retain, and test the T3 Code web app in isolated development environments, including first-try browser authentication with one-time pairing URLs, pairing-token recovery, worktree-safe state directories, cross-turn dev server lifecycle, and direct SQLite inspection or fixture seeding. Use when an agent needs to run T3 locally, iteratively test UI behavior with a human, recover from an expired or consumed pairing token, isolate dev state, or prepare test data in state.sqlite.
---
# 测试 T3 应用

对 Web 客户端使用此 skill。对于针对隔离 T3 后端的 iOS Simulator、Android Emulator 或实体设备测试，请使用同级的 [`test-t3-mobile`](../test-t3-mobile/SKILL.md) skill。

## 启动隔离的 Web 环境

1. 从仓库根目录运行命令。
2. 选择一个只属于当前 worktree 或测试的基础目录：
   - 使用仓库中被忽略的 `.t3` 目录来保存可复用的 worktree 本地状态。
   - 使用 `mktemp -d /tmp/t3code-test.XXXXXX` 保存一次性状态，并保留输出的绝对路径。
3. 使用 `vp run dev` 启动完整的 Web 栈。当用户需要从另一个 tailnet 设备打开它时，添加 `--share`。在链接的 worktree 中，它默认使用该 worktree 被 Git 忽略的 `.t3`；只有当测试需要不同的隔离目录时，才传递 `--home-dir <base-dir>`。
4. 保持终端会话处于活动状态，并从其输出中读取所选的服务器端口、Web 端口、基础目录和配对 URL。

只有当基础目录是为当前测试创建或明确选定时，才将其视为可丢弃目录。绝不要删除或直接填充共享的 `~/.t3` 目录。相比清理归属不明确的状态，优先使用新的临时基础目录启动。

worktree 本地默认目录会有意优先于环境中的 `T3CODE_HOME`；不要将共享 home 传递给 worktree dev server。

端口根据 worktree 路径派生，但当端口被占用时可能会发生变化。始终从 `[dev-runner]` 行读取实际值。

共享浏览器开发环境使用单一来源：Vite 会代理后端路径，因此绝不要为 `dev`/`dev:web` 设置 `VITE_HTTP_URL` 或 `VITE_WS_URL`。

dev runner 默认禁用浏览器自动打开。自动化测试期间不要传递 `--browser`：自动打开的页面可能会在受控浏览器使用一次性 bootstrap token 之前消耗它。

### 在交接给人工使用前验证共享环境

当其他人将使用输出的配对 URL 时，首先在受控浏览器中打开不含配对路径或片段的共享 origin，并确认 T3 Code 应用能够加载。即使 curl 成功，也必须进行这次浏览器导航，因为浏览器会在发出网络请求前阻止某些其他方式可以访问的端口。

不要在此次可达性检查中打开其他人的完整配对 URL；这样会消耗其一次性 token。如果 agent 也需要经过身份验证的浏览器，请创建并使用单独的配对 token，然后为其他人保留一个新的 token。

## 迭代时保留环境

将整个测试或实现循环——而不是一次 assistant 轮次或一次验证——视为环境生命周期的边界。

- 当用户可能检查结果或请求后续修改时，保持 dev 进程、基础目录、所选端口、已通过身份验证的浏览器标签页、已注册的项目和已填充的 fixture 处于活动状态。
- 不要仅仅因为一次验证完成，或因为你要向用户回复，就停止服务器。
- 在启动另一个环境之前，检查现有进程和浏览器标签页是否仍能服务于该任务。只要运行正常，就复用它们，而不是丢弃有用状态。
- 在后续轮次中，验证现有进程是否仍处于活动状态，并复用其输出的端口和基础目录。如果进程已退出，则使用相同的基础目录重启；只有当浏览器会话不再有效时，才创建新的配对 token。
- 当测试环境仍可用时告知用户，包括在有用时提供其非机密 Web URL。只有当用户仍需要进行配对时，才包含配对 token（见下文）。

## 在首次导航时对浏览器进行身份验证

1. 等待服务器日志显示需要进行身份验证，并包含以 `/pair#token=...` 结尾的 URL。
2. 使用代理可用的受控应用内浏览器或浏览器自动化界面。自动化测试期间不要使用系统浏览器启动命令。
3. 将该完整 URL 原样打开一次，作为受控浏览器的首次导航。完整保留片段和 token，不做任何改动。
4. 等待配对交换和重定向完成后，再导航到其他位置。
5. 继续使用同一个浏览器上下文，以便其存储的 bearer 会话保持可用。

不要将配对 URL 放入屏幕截图、提交的文件和持久化日志中。当用户要求共享环境时，交付内容就是完整的配对 URL——在回复中粘贴完整 URL，包括 token；只有源地址对他们没有用。配对 token 有效期很短且只能使用一次；在另一个浏览器中打开 URL 或将其打开两次都可能消耗该 token，因此绝不要打开你已交给用户的 URL。

## 恢复已消耗或已过期的配对 token

从仓库根目录运行 `node apps/server/src/bin.ts pair`。它会发现正在运行的开发服务器（优先使用 worktree `.t3`，与开发运行器的优先级相同），并针对服务器当前的 Web 源地址输出一个新的 `Pair URL`，其中包括 `--share` tailnet 源地址。仅当服务器以 `--home-dir` 启动时，才传递 `--base-dir <base-dir>`，并使用完全相同的路径。

通过 `pair` 获取的 token 带有标准客户端作用域。启动时的配对 URL 带有管理员作用域；如果用户需要 Settings → Connections 管理功能（`access:write`），请重启服务器并交付新的启动 URL。

## 检查或预置 SQLite 状态

在修改数据库之前阅读 [references/sqlite-fixtures.md](references/sqlite-fixtures.md)。

- 使用 `node apps/server/scripts/t3-sqlite-state.ts query` 进行架构发现和只读检查。
- 在使用 `node apps/server/scripts/t3-sqlite-state.ts exec` 之前停止开发服务器，然后使用相同的基础目录重新启动。
- 仅为一次性 UI fixture 预置投影表。测试业务行为或投影正确性时，使用应用程序命令和 API。
- 使用 auth CLI，而不是直接编辑 `auth_*` 表，来处理配对和会话。

默认情况下，该辅助工具拒绝写入共享的 `~/.t3` 目录，并会在每次变更之前创建数据库备份。

## 仅在测试循环结束后拆除环境

仅当用户明确要求、确认迭代已完成，或整体任务确实已完成且没有待处理的人工审核时，才进行拆除。不要根据助手回合结束来推断任务已完成。

适合拆除时：

1. 使用终端中断来停止开发进程。
2. 当隔离的基础目录包含有用的复现证据或可能在后续操作中使用的状态时，保留该目录。
3. 否则，在解析并验证确切目标后，仅删除为本次测试创建的路径。

如果无法确定任务是否完成，请保持环境运行，并说明该环境已保留以便进一步迭代。身份验证、迁移或 fixture 状态变得不明确时，使用全新的隔离基础目录仍然是最安全的重置方式。

## 可预测地排查问题

- 如果浏览器显示未通过身份验证的配对页面，请签发新令牌，而不是重试已使用过的 URL。
- 如果配对 URL 不再可见，请同时使用 `--dev-url` 和 `--base-url` 创建替代令牌。
- 如果替代令牌被拒绝，请确认 CLI 和服务器使用完全相同的绝对基础目录和 Web URL。
- 如果 UI 显示意外数据，请在进行任何编辑之前，确认每条命令都使用完全相同的显式基础目录。
- 如果由于另一个实例正在运行而导致端口发生变化，请以当前 `dev-runner` 输出为准，而不要假定端口为 `13773` 和 `5733`。