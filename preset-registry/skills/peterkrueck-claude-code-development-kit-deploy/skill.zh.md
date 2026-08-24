---
name: deploy
description: Test and deploy changes safely. Discovers deploy targets, runs fail-stop gates before going live, optionally shadow-deploys and swaps, then runs report-only post-deploy checks. This is a TEMPLATE — customize the commands and checks for your specific deployment pipeline.
user_invocable: true
---
# 部署 — 安全部署流水线

<!-- ============================================================
     模板：根据你的部署流水线定制此 skill。
     替换每个 [PLACEHOLDER] 以及每个带有 "CUSTOMIZE" 注释的代码块，
     填入实际命令。删除不使用的模式（shadow/canary 可选）。
     值得保留的部分是整体结构 ——
     discover → gate → deploy → report。
     ============================================================ -->

流水线形态：**发现目标 → 失败即停止的门禁 → 部署 → 仅报告检查**。默认范围是整个项目；可选按模块指定目标（参见 Target Discovery）。

## 输入

```
/deploy [target(s)...] [--all] [--skip-tests]
```

- **`target(s)`**（可选）——要部署的特定服务/函数/应用。省略时，将根据 git diff 自动检测。
- **`--all`**——部署当前 diff 影响的所有目标。
- **`--skip-tests`**——跳过部署前的测试门禁（仅在刚刚运行过测试时使用）。

<!-- CUSTOMIZE：列出有效的部署目标；如果你的仓库只有一个部署目标，则删除此行 -->
有效目标：`[YOUR_TARGET_1]`、`[YOUR_TARGET_2]`、...

## 目标发现

流水线通过扫描**能力标记文件**来确定要部署的内容——该文件表示“此目录可独立部署”。应发现目标，而不是将其硬编码，这样新增目标时无需编辑此 skill。

<!-- CUSTOMIZE：根据你的技术栈和目录布局选择标记文件。
     每个仓库一个项目：通常在仓库根目录只有一个标记文件，
     此时“发现”只需确认该文件存在即可。仅当你的仓库确实包含
     多个可独立部署的单元时，才使用模块级标记文件。 -->
```bash
# Scan for the capability marker. Default to the whole project (repo root).
# Examples of marker files (pick ONE for your stack):
#   <!-- e.g. fly.toml | vercel.json | wrangler.toml | serverless.yml
#         | Dockerfile | Procfile | package.json with a "deploy" script -->
find . -maxdepth 2 -name '[YOUR_MARKER_FILE]' -not -path '*/node_modules/*'
```

如果在仓库根目录找到标记文件 → 部署目标就是整个项目（常见情况）。如果在多个子目录中存在标记文件 → 每个目录都是一个独立目标；将 diff 映射到受影响的目标。

### 解析部署配置（回退层级）

从以下**第一个存在的来源**读取部署配置（应用 id、账户/项目标识符、区域——具体取决于你的提供商所需的配置）：

1. **已提交的配置**——提交并纳入版本控制的仓库文件（规范来源，对 worktree 安全）。
   <!-- CUSTOMIZE：例如 fly.toml 中的 `app =`、vercel.json，或提交到仓库中的 `.deploy-target` 文件 -->
2. **CLI 管理的临时文件/状态**——你的提供商 CLI 在执行 `link`/`login` 后写入的内容（通常被 gitignore）。
   <!-- CUSTOMIZE：例如 `.vercel/project.json`，或项目临时目录下的 CLI 缓存 -->
3. **启发式推断**——根据约定推导（目录名、仓库名、环境变量）。
   <!-- CUSTOMIZE：例如应用名称 == 仓库名称；区域来自环境变量 -->

如果均无法解析，则 **STOP**，并输出可执行的消息：
`No deploy config for [target]. Run '[YOUR_LINK_COMMAND]', or create '[YOUR_COMMITTED_CONFIG_FILE]'.`

### 检测发生了哪些变化

如果未显式传入 target，则将 diff 映射到各个 target：

```bash
git diff --name-only HEAD
git diff --name-only --cached
```

<!-- CUSTOMIZE: 将发生变化的路径映射到受影响的 target。对于单个 target，
     可简化为“是否有任何可部署内容发生变化？” -->

## 共享代码依赖感知

如果 diff 涉及其他可部署单元所导入的共享代码/库代码，则这些导入方也必须重新部署——它们会将发生变化的代码一并打包。

<!-- CUSTOMIZE: 将此处指向你的共享目录和导入语法。
     模式：查找直接导入方，然后递归查找一次传递导入方。 -->
```bash
# Direct importers of the changed shared file:
grep -rl "[CHANGED_SHARED_PATH]" [YOUR_SOURCE_GLOB]

# Transitive: a shared file that imports the changed shared file is itself
# "changed" — repeat the grep for it, then add its importers. Recurse until
# the set stops growing (usually one extra pass is enough).
```

随后，每个受影响的 target 都要执行下面的完整部署流程。

## 流程

### 步骤 1 — 预检

1. 解析 target、部署列表和部署配置。
2. 打印摘要，以便操作员在实际发布前进行检查：
   ```
   Repo:    <path>
   Branch:  <name> @ <short-sha>
   Targets: <list>
   ```
   <!-- CUSTOMIZE: 如果你使用功能分支，还要显示 `git log main..HEAD --oneline` -->
3. **将每个 target 分类为生产环境中的新 target 或已有 target**（参见步骤 3——两种情况的处理分支不同）。
   <!-- CUSTOMIZE: 如何向你的提供商询问“该 target 是否已经在线上存在？”
        例如：`flyctl status`、`vercel ls`、`wrangler deployments list` 或 API 调用 -->

### 步骤 2 — 部署前门禁（FAIL-STOP）

这些操作会在任何内容上线**之前**运行。此处失败意味着**不会部署任何内容**——线上 target 保持不变。

<!-- CUSTOMIZE: 替换为你的测试命令。如果可以，请自动发现它
     （例如 package.json 中的 "test" 脚本）；如果没有则干净地跳过。 -->
```bash
[YOUR_TEST_COMMAND]
```

- 退出码非零 → **STOP**。报告失败的测试套件及通过/失败数量。不要部署任何内容。
- 仅在设置了 `--skip-tests` 或未发现测试命令时跳过。

### 步骤 3 — 部署

一次只部署一个 target。如果其中一个失败，则停止并报告——不要继续处理剩余的 target。

#### 3a. 新 target（生产环境中尚不存在）

没有线上版本需要保护，因此直接部署：

```bash
[YOUR_DEPLOY_COMMAND] [target]
```

- 然后运行**冒烟探测**（见下文）。硬失败（target 无法启动/无法路由访问）→ STOP 并报告。由于不存在可回退的先前版本，由操作员进行检查。

#### 3b. 已有 target — 可选的 Shadow/Canary，然后切换

<!-- OPTIONAL PATTERN. 如果你的提供商已经支持原子式、即时回滚，则跳过整个子步骤
     （大多数 PaaS 都支持——改为保留 previous-release id，参见下方的“Rollback”）。
     当错误部署会在你完成验证前提供给用户时，使用 shadow/canary。 -->

在 live 版本旁部署一个 **staging variant**，对其进行探测，只有通过后才进行切换。在切换之前，live target 会继续提供旧代码。

1. **Shadow-deploy** 一个并行 variant（独立的 slug / preview URL / canary 分片）：
   ```bash
   [YOUR_SHADOW_DEPLOY_COMMAND]      # deploy as <target>-shadow / a preview / N% canary
   ```
   <!-- 按 provider 进行自定义，例如：
        Vercel：      vercel deploy            （preview URL，而不是 --prod）
        Fly.io：      flyctl deploy --strategy canary
        AWS Lambda：  发布一个新版本 + 加权 alias
        Cloudflare：  wrangler deploy --name <target>-shadow   （独立的 Worker） -->
   - Shadow deploy 失败 → 对 shadow 运行 **Cleanup helper**，停止。Live target 不受影响。

2. **Smoke-probe gate（FAIL-STOP）** — 探测 shadow URL：
   ```bash
   [YOUR_SHADOW_SMOKE_PROBE]
   ```
   - 失败 → 对 shadow 运行 **Cleanup helper**，停止。Live target 不受影响。

3. **Swap** — 将已验证的 bundle 提升为 live target：
   ```bash
   [YOUR_SWAP_COMMAND]               # promote shadow → live / shift 100% traffic
   ```
   <!-- 按 provider 进行自定义，例如：
        Vercel：      vercel promote <deployment-url>
        Fly.io：      将流量切换到 canary release
        AWS Lambda：  将 alias 指向新版本
        Cloudflare：  将已验证的 bundle 部署到 live Worker 名称 -->
   - Swap 失败 → 参见错误处理中的 **仅重试一次**。Live target 可能处于中间状态；不要操作 git。

4. **Post-swap probe（REPORT-ONLY）** — 探测 live URL。参见步骤 4。失败时，**报告结果并保留 shadow 运行**以供检查 — 不要自动回滚。

5. **Cleanup** — 成功后，移除 shadow（参见 Cleanup helper）。

### 步骤 4 — 部署后验证（REPORT-ONLY）

这些操作会在 target 已上线后运行。它们**无法撤销部署** — 按定义，此时新代码已经在提供服务。因此它们是**仅报告**：展示结果，绝不触发破坏性的自动回滚。

<!-- 自定义：针对 LIVE target 执行 e2e / smoke / health 检查 -->
```bash
[YOUR_POST_DEPLOY_CHECK]
```

- 通过 → 报告成功。
- 失败 → **重新运行一次**（部署后检查可能不稳定：冷启动、传播延迟、速率限制）。仍然失败 → **报告该结果**。如果 shadow 仍在运行（3b），**保留其运行状态**供操作人员检查。**不要**通过 git 或重新部署旧代码来自动回滚。

> 关键区别在于：**gate 在切换前失败即停止；部署后检查只在切换后报告结果。** 在代码已经上线后运行的检查可以发出警告，但绝不能静默修改部署或仓库。

## Smoke probe 语义

一个最小化的“它是否存活且可路由？”检查 — 不需要应用密钥或身份验证。

<!-- 自定义：替换 URL；根据你的身份验证设置调整哪些状态码表示 PASS -->
```bash
curl -s -o /dev/null -w "%{http_code}" "[YOUR_TARGET_URL]"
```

- **5xx** — 启动或分发时崩溃。**FAIL。**
- **404** — 路由器不认识此 target（部署错误 / 名称错误）。**FAIL。**
- **401 / 403** — 身份验证中间件拒绝了未经过身份验证的探测，但 target 处于存活状态。**PASS。**
- **2xx / 其他 4xx** — target 返回了响应。**PASS。**

## 清理辅助程序

在交换后或门禁失败后移除 shadow/canary 变体。可安全地幂等运行；清理失败会被报告，但绝不会阻塞已完成的交换。

```bash
# Remote: delete the shadow deployment.
[YOUR_SHADOW_DELETE_COMMAND]

# Local (if your shadow created files): note that `rm -rf` may be permission-gated.
# A surgical enumerate-then-remove avoids the prompt:
find [SHADOW_DIR] -depth -type f -delete
find [SHADOW_DIR] -depth -type d -empty -delete
```

## 错误处理

- **部署前测试失败** → 未部署任何内容；报告。
- **Shadow 部署失败** → 对 shadow 运行清理辅助程序，然后停止；线上目标未被触碰。
- **门禁（smoke-probe）失败** → 对 shadow 运行清理辅助程序，然后停止；线上目标未被触碰。
- **交换失败（仅重试一次）** → 交换通常是原子的，但可能遇到瞬时错误。再次运行交换命令 **一次**。如果再次失败，**报告** — 线上目标可能处于未知状态（旧代码仍在提供服务，或已被部分更新）。不要修改 git 状态。由操作员检查。
- **交换后 / 部署后检查失败** → **报告**。保留运行中的 shadow（不要清理），以便操作员进行比较。不要自动回滚。

## 回滚

<!-- 重要：优先使用提供商原生的原子回滚功能。几乎每个主机都会保留之前的不可变发布版本，你可以立即将流量重新指向这些版本。
     这比从 git 重建旧代码安全得多。在部署时记录之前的发布 id，使回滚可以用一行命令完成。 -->
```bash
[YOUR_NATIVE_ROLLBACK_COMMAND]    # re-point traffic to the previous good release
```
<!-- 按提供商进行自定义，例如：
     Vercel:      vercel rollback <previous-deployment-url>
     Fly.io:      flyctl releases list  →  flyctl deploy --image <previous-image>
     AWS Lambda:  point the alias back at the previous version
     Cloudflare:  wrangler rollback [<version-id>] -->

> 不要使用 `git checkout` 重建旧代码并重新部署，将其作为回滚路径。这具有破坏性（可能覆盖工作树状态），速度慢，并且可能无法复现线上运行版本的精确字节。上面的 shadow-then-swap 流程已经提供了真正的安全保障：**如果交换前发生任何失败，线上目标从未被触碰** — “回滚”就是“不进行交换”。

## 步骤 — 报告

```
Deploy Complete
───────────────
Targets: <target> @ <deploy-id>
Branch:  <branch> @ <sha>
Tests:   <X/X passed | skipped (none found) | skipped (--skip-tests)>
Results:
  <target1>: shadow → gate PASS → swap → post-check OK → cleaned
  <target2>: new → deploy → probe OK
```

## 跳过条件

以下情况不要部署：
- 仅文档变更（`*.md`）
- 仅客户端/前端变更，而部署目标为后端（反之亦然）
- 仅测试变更（除非明确指定 `--all`）
- 不需要重新部署的配置

## 注意事项

1. **门禁是安全保障** — 部署前测试门禁和 shadow smoke-probe 都会在交换前失败即停止。如果其中任何一项失败，线上目标从未被触碰。
2. **部署后检查只进行报告** — 代码上线后无法将其撤回部署，因此它们只会发出警告，绝不会自动回滚。
3. **Shadow/canary 是可选的** — 当错误部署可能在你完成验证前触达用户时使用它。如果你的主机已经支持原子且即时的回滚，则可能不需要它。
4. **回滚应当使用原生且原子的方式** — 将流量重新指向之前的发布版本；绝不要从 git 重建旧代码。
5. **每个执行部署的新 worktree** 都需要包含已提交的部署配置文件（Target Discovery #1），否则会回退到 CLI 状态 / 启发式判断。