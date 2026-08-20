---
name: git-integration-operations-cli
description: >
  Automate the Microsoft Fabric Git integration lifecycle from CLI environments
  using the Fabric CLI (fab api), with az rest as a fallback. Use when the user
  wants to connect a workspace to Azure DevOps or GitHub, commit or update/pull
  workspace items, check Git sync status, resolve update conflicts, disconnect,
  automate Git sync with a service principal, or link a branch workspace to its
  base. Do NOT use for branch switching, for deployment tools (fab deploy,
  fabric-cicd, Bulk Import), for deployment-pipeline runtime, or for
  cross-workspace reference rebinding after promotion (a property of the item
  definition format, not the Git lifecycle). Triggers: "connect workspace to
  git", "commit fabric to git", "update workspace from git", "fabric git
  status", "resolve git conflict fabric", "service principal git sync", "link
  branch to base".
metadata:
  maturity: experimental
  owner: yaron
---
> **遥测 — 强制要求。** 每个对 `api.fabric.microsoft.com` 的调用都必须携带
> `x-ms-fabric-skill: git-integration-operations-cli`（`az rest`：`--headers "x-ms-fabric-skill=git-integration-operations-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项，但仍必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区 ID：列出所有工作区，然后使用 JMESPath 按
>    `displayName` 筛选。要查找项目 ID：列出工作区中该类型的项目，然后按
>    `displayName` 筛选。
> 2. 所有 Git 操作都是针对
>    `https://api.fabric.microsoft.com` 的**控制平面**调用。运行一次 `fab auth login`，之后 `fab api`
>    会自动设置基 URL 和 Fabric 令牌受众。使用 `az rest`
>    回退方案时，你必须自行传递匹配的 `--resource`，否则会收到 401。
> 3. `commitToGit`、`updateFromGit`，甚至 `git/status` 都可能返回 **HTTP 202
>    （长时间运行的操作）**，而不只是同步响应正文。收到 `202` 时，应轮询该
>    操作：使用 `fab` 时，从 `--show_headers` 中读取 `x-ms-operation-id`，并轮询
>    `fab api operations/{id}`，直到 `status` 为 `Succeeded`；使用 `az rest`
>    回退方案时，轮询 `Location` / `x-ms-operation-id` 标头（参见 COMMON-CORE
>    长时间运行操作轮询）。然后读取 `git/status`，确认
>    `workspaceHead == remoteCommitHash`。应优先通过轮询操作来确认
>    完成状态；如果改为轮询 `git/status`，则应将进行中（`202`）或
>    尚未同步的响应视为“仍在运行”，并且在两个 head 匹配之前，不要根据其 `changes`
>    执行任何操作。（参阅：rest/api/fabric/core/git 和
>    fabric/cicd/git-integration/git-automation。）
> 4. `updateFromGit` 需要工作区的**当前** `workspaceHead`；陈旧的
>    值会返回 `400 WorkspaceHeadMismatch`。务必先读取 `git/status`。
> 5. **每个 Git 操作的先决条件：**工作区必须分配到某个
>    **容量**（未分配的工作区会因 `WorkspaceHasNoCapacityAssigned` 而失败），
>    并且调用方（用户或服务主体）必须拥有正确的工作区
>    角色：**连接和断开连接需要 Admin**；**提交和更新至少需要 Contributor**，
>    且对所有项目拥有写入权限；**切换分支需要 Admin**
>    （如果已开启工作区选择加入设置 *Allow users
>    with at least Contributor role to change Git branch*，则 Contributor 也可以）。同一时间只能对一个工作区
>    运行一个 Git 操作。
> 6. **租户管理员开关**会控制 Git 集成，也是导致不明原因失败的
>    常见原因。**GitHub** 同步开关**默认关闭**（在连接任何 GitHub 仓库前需将其
>    启用）；Azure DevOps 同步默认开启。跨区域工作区连接到 *Azure* 仓库时，需要启用
>    **跨地域导出**开关（GitHub 不受此限制）。请参阅 [references/git-integration-concepts.md § 租户管理员先决条件](references/git-integration-concepts.md#tenant-admin-prerequisites)。

# Git 集成操作 — CLI Skill

从 CLI 环境自动执行 Fabric Git 集成生命周期（连接、提交、更新、状态、
断开连接）。升级后，跨工作区项目引用是否会重新绑定是另一个独立问题，
它取决于项目定义格式（逻辑 ID 与对象 ID），而非 Git 生命周期本身。

## 前置知识

请先阅读以下共享参考资料（路径假定此技能位于 `skills-for-fabric` 的
`skills/git-integration-operations-cli/` 下；在仓库外编写文档时请相应调整）：

- [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) — 通过名称解析工作区/项目 ID 时**必须**阅读。
- [COMMON-CORE.md § 身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) — 受众错误会导致 401；遇到任何身份验证问题前请先阅读。
- [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) — 用于 CLI 的 `az login` 流程和令牌获取。
- [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) — `az rest` **回退**路径（**始终传递 `--resource`**）；包含 LRO 轮询辅助工具。
- [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) — 分页、长时间运行操作轮询、速率限制。

## 目录

| 任务 | 参考资料 |
|---|---|
| 连接前的预检 | [SKILL.md § 预检（连接之前）](#pre-flight-before-you-connect) |
| 将工作区连接到 Git | [SKILL.md § 将工作区连接到 Git](#connect-a-workspace-to-git) |
| 创建 Git 连接（服务主体） | [SKILL.md § 创建 Git 提供程序连接（服务主体）](#create-the-git-provider-connection-service-principal) |
| 将工作区项目提交到 Git | [SKILL.md § 提交到 Git](#commit-to-git) |
| 从 Git 更新工作区 | [SKILL.md § 从 Git 更新](#update-from-git) |
| 检查同步状态 | [SKILL.md § 检查同步状态](#check-sync-status) |
| 解决更新冲突 | [SKILL.md § 解决冲突](#resolve-conflicts) |
| 断开与 Git 的连接 | [SKILL.md § 断开与 Git 的连接](#disconnect-from-git) |
| 将分支工作区链接到其基础工作区（工作区关系） | [SKILL.md § 将分支工作区链接到其基础工作区（工作区关系）](#link-a-branch-workspace-to-its-base-workspace-relations) |
| Git 集成概念（同步模型、状态、权限） | [references/git-integration-concepts.md § 概念](references/git-integration-concepts.md#concepts) |
| 租户管理员前置要求（开关） | [references/git-integration-concepts.md § 租户管理员前置要求](references/git-integration-concepts.md#tenant-admin-prerequisites) |
| 支持的 Git 提供程序 | [references/git-integration-concepts.md § 支持的 Git 提供程序](references/git-integration-concepts.md#supported-git-providers) |
| 支持的项目类型 | [references/git-integration-concepts.md § 支持的项目类型](references/git-integration-concepts.md#supported-item-types) |
| 避免仅格式差异（尾随换行符/行尾序列） | [references/git-integration-concepts.md § 避免仅格式差异](references/git-integration-concepts.md#avoiding-formatting-only-diffs) |
| 服务主体/CI-CD 管道模板 | [references/automation-templates.md](references/automation-templates.md) |
| 注意事项、规则、故障排除 | [SKILL.md § 注意事项、规则、故障排除](#gotchas-rules-troubleshooting) |

## 必须/优先/避免

### 必须执行
- 读取 `git/status`，并将当前的 `workspaceHead` 传入每一次 `commitToGit`
  和 `updateFromGit` 调用。
- 在每次异步操作后轮询 `git/status`，直到
  `workspaceHead == remoteCommitHash` **并且** `changes` 数组为空。`202`/`Succeeded`
  状态并不能证明同步正确——请验证实际状态。
- 在同一次提交中部署某个项及其引用的项，以便逻辑 ID 能够在目标工作区内解析。

### 绝对禁止
- 切勿在同一个工作区上并发运行两个 Git 操作——如果一个操作仍处于 `Running`
  状态时启动第二个 `commitToGit`/`updateFromGit`，会破坏 head 跟踪。请串行执行：
  轮询第一个操作直至其变为 `Succeeded`，然后再启动下一个操作。
- 切勿让一个工作区在同一分支上既作为事实来源，**又**作为 CI/CD 推送目标。
  每个分支只能选择一个写入方：要么由人员从工作区提交，要么由自动化流程推送到 Git——不能同时进行。

### 优先
- 将 `fab api`（执行 `fab auth login` 后）用作**主要**驱动方式：它会自动设置基础
  URL 和 Fabric 令牌受众，从而避免因受众错误而导致的 401 问题。当 `fab` 不可用或需要
  对请求头进行精细控制时，使用带有 `--resource "https://api.fabric.microsoft.com"` 的
  `az rest` 作为**备用**方式。
- 使用 `PreferRemote` 冲突解决策略，将“从 Git 拉取最新内容”干净地应用到下游/目标工作区。

### 避免
- 重复使用过期的 `workspaceHead`（会导致 `400 WorkspaceHeadMismatch`）。
- 通过 stdin 将请求正文传递给 `fab api`（请使用 `-i <file.json>` 或 `-i '<inline JSON>'`）。

---

## CLI：以 `fab` 为主，以 `az rest` 为备用

下面的每个操作均使用 `fab api` 展示。只需运行一次 `fab auth login`（它支持使用
服务主体进行自动化）；此后，`fab` 会为你处理基础 URL 和令牌受众。在备用的
`az rest` 方式中，相同调用可直接进行机械式转换：

**为当前运行操作所使用的身份验证 `fab`：**

```bash
fab auth login                                              # interactive user (SSO)
fab auth login -u <client-id> -p <client-secret> --tenant <tenant-id>   # service principal (CI/CD)
fab auth login --identity                                   # managed identity (Azure compute)
```

服务主体或托管标识必须具有工作区 **Admin** 权限才能连接或断开连接（对于
提交/更新操作，至少具有 **Contributor** 权限并对所有项拥有写入权限即可），并且
（对于 `ConfiguredConnection` 路径）必须持有 Git 提供商凭据。完整的流水线脚本请参阅
[references/automation-templates.md](references/automation-templates.md)。

- `fab api <endpoint>` 转换为 `az rest --method GET --url "https://api.fabric.microsoft.com/v1/<endpoint>" --resource "https://api.fabric.microsoft.com"`。
- `fab api -X post <endpoint> -i body.json` 会添加 `--method POST --headers "Content-Type=application/json" --body @body.json`。

`fab api` 通过 `-i` 从文件路径或内联 JSON 字符串（例如
`-i '{"displayName":"..."}'`）读取请求正文——绝不能从 stdin 读取。它会输出
`{"status_code": <code>, "text": <parsed body>}`（添加 `--show_headers` 可获得顶层
`headers` 对象），因此请使用 `jq -r '.text.<field>'` 读取响应字段，并使用
`jq -r '.headers["x-ms-operation-id"]'` 读取 LRO ID。有关完整的 `az rest` 调用对，
请参阅[示例 2](#example-2-az-rest-fallback-equivalents)。

---

## 起飞前检查（连接之前）

在执行 `git/connect` 之前，请按顺序完成以下与 Git 相关的检查。每种失败情况都有相应的修复方法——提前解决这些问题可以避免最常见的连接时错误。

| 检查 | 命令 | 通过 = 继续 / 失败 = 修复 |
|---|---|---|
| 身份验证 + Fabric 令牌 | `fab auth login`，然后执行 `fab api workspaces` | `401` → 重新登录（`fab` 会自动设置正确的受众） |
| 调用方是工作区管理员 | `fab api "workspaces/${WORKSPACE_ID}/roleAssignments"` | 连接/断开连接需要 **Admin** 角色 |
| 工作区具有容量 | `fab api "workspaces/${WORKSPACE_ID}"` → 检查 `capacityId` | `WorkspaceHasNoCapacityAssigned` → 分配容量（Git 要求必须具有容量） |
| SP 路径的 Git 凭据 | `fab api connections`（如果已有合适的连接，则复用） | SP 连接需要一个 `ConfiguredConnection`。如果不存在，此技能会使用你的 ADO 组织/项目/仓库以及 SP 租户/客户端/密钥来**创建**它——请参阅[创建 Git 提供程序连接](#create-the-git-provider-connection-service-principal)（需要启用租户开关「服务主体可以创建连接」）。交互式用户 SSO 路径使用 `Automatic`，不需要连接。 |
| 目标 `directoryName` 存在于分支中 | GitHub：`curl -fsS -H "Authorization: Bearer $PAT" "https://api.github.com/repos/$OWNER/$REPO/contents/$DIR?ref=$BRANCH"` — ADO：仓库上的 Items API | 此 API（与门户不同）**不会**创建缺失的文件夹——连接到不存在的 `directoryName` 会失败，并返回 `404 GitProviderResourceNotFound`。如果是新文件夹，请先预创建它（请参阅[将工作区连接到 Git](#connect-a-workspace-to-git) 下方的说明）。 |

## 将工作区连接到 Git

将工作区连接到 Azure DevOps 或 GitHub 仓库，然后初始化连接以确定同步方向。

```bash
# 1. Connect (Azure DevOps example). Body goes in a file, passed with -i.
cat > connect.json <<'JSON'
{
  "gitProviderDetails": {
    "gitProviderType": "AzureDevOps",
    "organizationName": "myorg",
    "projectName": "MyProject",
    "repositoryName": "fabric",
    "branchName": "main",
    "directoryName": "/workspace-a"
  }
}
JSON
fab api -X post "workspaces/${WORKSPACE_ID}/git/connect" -i connect.json

# 2. Initialize the connection (choose which side wins on first sync)
printf '{"initializationStrategy":"PreferWorkspace"}' > init.json
fab api -X post "workspaces/${WORKSPACE_ID}/git/initializeConnection" -i init.json
```

当工作区中已经包含权威项目时，使用 `PreferWorkspace`；当 Git 分支是权威来源时，使用 `PreferRemote`。

> **目标 `directoryName` 必须已经存在于分支中。** Fabric
> 门户会通过在缺失的文件夹中提交一个 `README.md`
> 占位文件来静默创建该文件夹，但与之不同的是，`git/connect` **API 不会创建该文件夹**。
> 连接到分支中不存在的 `directoryName` 会失败，并返回
> `404 GitProviderResourceNotFound`。仓库和分支也必须存在（连接操作
> 从不创建分支）。如果是新文件夹，请先**通过 Git 提供程序的 API**（而不是 Fabric
> API）向分支提交占位文件来创建它，然后再进行连接。请遵循门户的约定，创建一个 `README.md`，其正文为
> `This is an auto-created file via Fabric skills for <workspace-name>`。
>
> ```bash
> # GitHub: create <DIR>/README.md on <BRANCH> (reuse the PAT behind the Git connection)
> DIR="workspace-a"; WS_NAME="My Workspace"
> CONTENT=$(printf 'This is an auto-created file via Fabric skills for %s\n' "$WS_NAME" | base64)
> cat > mkfolder.json <<JSON
> { "message": "Create ${DIR} folder for Fabric Git connect", "branch": "${BRANCH}", "content": "${CONTENT}" }
> JSON
> curl -fsS -X PUT -H "Authorization: Bearer ${GITHUB_PAT}" \
>   "https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}/README.md" -d @mkfolder.json
> # Azure DevOps equivalent: POST .../_apis/git/repositories/${REPO}/pushes with an
> # "add" change for "/${DIR}/README.md" on refs/heads/${BRANCH} (same body content).
> ```

> **两种身份验证模式（两个提供程序都使用 `myGitCredentials` 进行自动化）。**
> 工作区通过以下两种方式之一向 git 进行身份验证：
> - **自动 git 凭据**（仅限 Azure DevOps）：连接用户的 SSO
>   身份，从工作区设置中建立。至少具有 Contributor 权限的其他参与者可复用该身份。
>   此方式不适用于 GitHub，也不能用于无头自动化/服务主体自动化。
> - **配置的凭据**（Azure DevOps *和* GitHub）：在连接请求正文中引用的 Fabric
>   云连接。任何服务主体或无人值守运行都必须采用此方式：
>   ```json
>   "myGitCredentials": { "source": "ConfiguredConnection", "connectionId": "<connection-guid>" }
>   ```
>   对于 **Azure DevOps**，连接的 `credentialType` 可以是
>   `ServicePrincipal`（无头自动化）或 `OAuth2`（存储的委派用户
>   令牌）；根据 Create Connection API，两者都是有效的 ConfiguredConnection
>   凭据，并且都支持多租户场景。
>   对于 **GitHub**，连接工作区**需要 Personal Access Token (PAT)**：
>   云连接存储具有 Contents Read 权限（提交还需 Write 权限）的细粒度令牌，
>   或具有 `repo` 作用域的经典令牌。GitHub 没有自动凭据模式，
>   因此即使是交互式用户连接，也必须使用 PAT。
> 区别并不是“GitHub 需要凭据，而 ADO 不需要”。当服务主体驱动连接时，ADO
> *同样*需要 ConfiguredConnection；自动模式仅涵盖交互式用户 SSO。（参阅：
> fabric/cicd/git-integration/automate-git-integration-with-service-principal;
> rest/api/fabric/core/git/connect。）

> **处理初始化响应。** `initializeConnection` 返回
> `requiredAction`（`UpdateFromGit`、`CommitToGit` 或 `None`），以及 `workspaceHead`
> 和 `remoteCommitHash`，并且自身也可能返回 `202`。操作完成后，使用返回的哈希值调用
> `requiredAction` 指定的同步操作，否则工作区将保持已连接但未完全同步的状态。（参阅：
> rest/api/fabric/core/git/initialize-connection。）

### 创建 Git 提供程序连接（服务主体）

对于无人值守自动化，首先创建一个用于存储 git 提供程序凭据的 Fabric 云连接，
然后将其 `id` 作为上述 `myGitCredentials` 块中的 `connectionId` 传入。使用
[Create Connection API](https://learn.microsoft.com/rest/api/fabric/core/connections/create-connection)
（`POST /v1/connections`，委派作用域 `Connection.ReadWrite.All`）。只有当 Fabric 管理设置
“服务主体可以创建工作区、连接和部署管道”处于启用状态时，服务主体才能创建连接。

**必须提供的信息（Azure DevOps）：**
- ADO **组织**、**项目**和**存储库**名称，并将它们组合为一个
  `url` 参数：`https://dev.azure.com/<org>/<project>/_git/<repo>/`
- 服务主体的**租户 ID**、**客户端（应用程序）ID**和
  **客户端密码**
- 连接**显示名称**（最多 200 个字符，在租户中必须唯一）

**连接生效前的先决条件：**向服务主体授予  
(a) 对该 **Azure DevOps 组织和项目**的访问权限（git 访问由 ADO 本身强制执行，而不仅仅由 Fabric 执行），以及 (b) 目标 Fabric 工作区的 **Admin** 权限。

```bash
# Create an Azure DevOps source-control connection using a service principal.
# The body holds a cleartext SP secret, so restrict perms and delete it on exit
# (a leftover connection.json can be captured by a later CI step or artifact upload).
trap 'rm -f connection.json' EXIT
umask 077
cat > connection.json <<'JSON'
{
  "displayName": "ado-sp-fabric-cicd",
  "connectivityType": "ShareableCloud",
  "connectionDetails": {
    "type": "AzureDevOpsSourceControl",
    "creationMethod": "AzureDevOpsSourceControl.Contents",
    "parameters": [
      { "dataType": "Text", "name": "url",
        "value": "https://dev.azure.com/<org>/<project>/_git/<repo>/" }
    ]
  },
  "credentialDetails": {
    "credentials": {
      "credentialType": "ServicePrincipal",
      "tenantId": "<tenant-id>",
      "servicePrincipalClientId": "<client-id>",
      "servicePrincipalSecret": "<client-secret>"
    }
  }
}
JSON
fab api -X post "connections" -i connection.json
```

`201` 响应会返回连接的 `id`；在连接调用的 `myGitCredentials` 块中将其用作 `connectionId`。对于完全无密钥的变体，可使用 `-i '{...}'` 内联传递请求正文（不在磁盘上创建文件），或通过 `servicePrincipalSecretReference` 引用 Key Vault 密钥，而不是使用原始的 `servicePrincipalSecret`。上面的示例使用 `credentialType: "ServicePrincipal"`；Azure DevOps 连接也接受 `credentialType: "OAuth2"`（存储的委托用户令牌），并且这两种凭据类型都支持多租户场景。若要将一个*现有的*用户连接工作区切换为服务主体，请将该 SP 添加为工作区 Admin，共享或重新创建此连接，然后使用相同的 ConfiguredConnection 请求正文调用 `PATCH /workspaces/{id}/git/myGitCredentials`。（了解更多：fabric/cicd/git-integration/automate-git-integration-with-service-principal；rest/api/fabric/core/connections/create-connection。）

## 提交到 Git

将工作区项推送到已连接的分支。先读取头提交，然后提交。

```bash
# Read current head. git/status can return 202 (LRO) with no body — capture the
# status code with --show_headers and poll before reading, or workspaceHead comes
# back as "null" and the commit below fails with a misleading 400.
RESP=$(fab api "workspaces/${WORKSPACE_ID}/git/status" --show_headers)
if [ "$(echo "$RESP" | jq -r '.status_code')" = "202" ]; then
  OP=$(echo "$RESP" | jq -r '.headers["x-ms-operation-id"]')
  until [ "$(fab api "operations/${OP}" | jq -r '.text.status')" = "Succeeded" ]; do sleep 5; done
  RESP=$(fab api "workspaces/${WORKSPACE_ID}/git/status" --show_headers)   # now 200 with body
fi
HEAD=$(echo "$RESP" | jq -r '.text.workspaceHead')

# Commit all pending changes. Build the body with jq so the comment is always
# valid JSON even if it contains a quote, backslash, or newline.
jq -n --arg head "$HEAD" --arg msg "Author items" \
  '{mode:"All", workspaceHead:$head, comment:$msg}' > commit.json
RESP=$(fab api -X post "workspaces/${WORKSPACE_ID}/git/commitToGit" -i commit.json --show_headers)
# commitToGit may complete synchronously (200) or async (202). Only poll when async.
if [ "$(echo "$RESP" | jq -r '.status_code')" = "202" ]; then
  OP=$(echo "$RESP" | jq -r '.headers["x-ms-operation-id"]')
  until [ "$(fab api "operations/${OP}" | jq -r '.text.status')" = "Succeeded" ]; do sleep 5; done
fi
```

使用 `"mode": "Selective"` 和 `items` 数组提交其中一部分。`commitToGit`
可能同步完成（`200`，已完成），也可能异步完成（`202`
并返回用于轮询的 `x-ms-operation-id`）——应像上文一样根据 `.status_code`
进行分支处理，而不要假定响应一定是 `202`。

## 从 Git 更新

将已提交的项拉取到工作区（例如，连接到同一分支/文件夹的下游工作区或目标
工作区）。

```bash
# Read both hashes from the target workspace
STATUS=$(fab api "workspaces/${TARGET_WS}/git/status")
TH=$(echo "$STATUS" | jq -r '.text.workspaceHead')
REMOTE=$(echo "$STATUS" | jq -r '.text.remoteCommitHash')

cat > update.json <<JSON
{
  "workspaceHead": "${TH}",
  "remoteCommitHash": "${REMOTE}",
  "conflictResolution": {
    "conflictResolutionType": "Workspace",
    "conflictResolutionPolicy": "PreferRemote"
  },
  "options": { "allowOverrideItems": true }
}
JSON
fab api -X post "workspaces/${TARGET_WS}/git/updateFromGit" -i update.json
```

## 检查同步状态

持续轮询，直到工作区头与远程头一致。`commitToGit` 和
`updateFromGit` 都是异步操作，因此可通过此循环确认它们是否已完成。

```bash
for i in $(seq 1 30); do
  S=$(fab api "workspaces/${WORKSPACE_ID}/git/status")
  WH=$(echo "$S" | jq -r '.text.workspaceHead')
  RC=$(echo "$S" | jq -r '.text.remoteCommitHash')
  CH=$(echo "$S" | jq -r '.text.changes | length')
  # Success = heads match AND no residual changes. Heads matching alone can still
  # leave uncommitted/unapplied diffs; validate both before declaring "synced".
  [ "$WH" = "$RC" ] && [ "$CH" = "0" ] && { echo "synced at $WH"; break; }
  sleep 8
done
```

对于仍在进行中的操作（提交/更新返回 `202`），应直接轮询 LRO，而不是根据头进行猜测：

```bash
# Capture x-ms-operation-id from the 202, then poll until Succeeded
OP_ID=$(fab api -X post "workspaces/${WORKSPACE_ID}/git/commitToGit" -i commit.json \
  --show_headers | jq -r '.headers["x-ms-operation-id"]')
while :; do
  ST=$(fab api "operations/${OP_ID}" | jq -r '.text.status')
  case "$ST" in Succeeded) break ;; Failed) echo "op failed"; break ;; *) sleep 5 ;; esac
done
```

`git/status` 还会返回一个 `changes` 数组——非空数组表示存在未提交的（工作区）
差异或尚未应用的（远程）差异。

## 解决冲突

真正的冲突是*双方均有更改*：上次同步后，工作区中修改了**同一个项**
（未提交的本地编辑），**同时**分支中也修改了该项（新提交）。`git/status`
会在其 `changes` 数组中使用 `conflictType: "Conflict"` 标记该项（`workspaceChange`
和 `remoteChange` 均显示 `Modified`）。这与单方面差异不同；对于单方面差异，
只需执行 `updateFromGit`（仅远程更改）或 `commitToGit`（仅工作区更改），无需策略。

当双方均修改了某个项时，`updateFromGit` **要求**提供冲突策略——如果调用时不包含
`conflictResolution` 块，将返回 `400 MissingWorkspaceConflictResolution`：

- `conflictResolutionPolicy: "PreferRemote"`——以 Git 分支为准（通常用于
  拉取到目标的部署）；本地编辑将被丢弃。
- `conflictResolutionPolicy: "PreferWorkspace"`——以实时工作区为准；如果要将
  工作区版本推送到 Git，请改用 `commitToGit`，它不接受冲突策略。

设置 `options.allowOverrideItems: true`，以允许更新覆盖目标工作区中已存在的项（只要发生冲突的项已存在于工作区中，就必须设置此选项；根据定义，在双向冲突中该项必然已存在）。

**如何选择策略：**

| 场景 | 策略 |
|---|---|
| 下游/目标工作区从 Git 拉取最新内容 | `PreferRemote` |
| 创作工作区是事实来源 | `PreferWorkspace`（或使用 `commitToGit` 将工作区版本推送到 Git） |
| 同一项存在真正的双向编辑 | 在 `git/status` 中检查每个 `changes` 条目的 `conflictType`，并有针对性地逐项解决 |

## 断开与 Git 的连接

```bash
fab api -X post "workspaces/${WORKSPACE_ID}/git/disconnect"
```

---

## 将分支工作区链接到其基础工作区（工作区关系）

> **预览版。** **Git 工作区关系** API 属于 Fabric Git 功能，目前处于预览阶段。它们会记录**分支**工作区与其派生自的**基础**工作区之间的沿袭链接，使基础工作区与分支工作区之间的关系在 Fabric 门户中可见。如果分支工作区是在内置分支派生功能发布**之前**创建的，或者分支工作区由你自己的**自动化流程**（而非门户的分支派生用户体验）进行预配，并且你仍希望该沿袭关系显示在 UI 中，请使用这些 API。创建关系**不会**将任一工作区连接到 Git、移动项或启动同步——它只会记录该链接。

**前提条件——两个工作区必须指向同一个 Git 根目录。** 除非基础工作区和分支工作区连接到**同一个仓库根目录**，并且仅分支不同，否则创建操作会失败并返回 `WorkspaceRelationRootDirectoryMismatch`：

- **Azure DevOps：** `organizationName`、`projectName`、`repositoryName` 和
  `directoryName` 必须相同——仅 `branchName` 不同。
- **GitHub：** 仓库 URL 和 `directoryName` 必须相同——仅 `branchName` 不同。

因此，请先将两个工作区连接到 Git（并完成初始化）；该关系只是让现有的分支/基础工作区对变得可见。

### 创建关系（链接分支 ↔ 基础工作区）

该关系是**双向的**，因此只需创建**一次**。请仔细阅读请求正文——POST 请求所发送到的工作区与 `relationType` 是两个不同的概念：

- **URL** 中的工作区（`workspaces/{workspaceId}/...`）是发起调用的*来源*一侧。
- `relatedWorkspaceId` 是**另一个**工作区。
- `relationType` 描述的是该**另一个**（`relatedWorkspaceId`）工作区的角色，**而不是** URL 中工作区的角色。创建时只有 `Base` 和 `Branch` 是有效值。

因此，同一个链接有两种等效的创建方式：

| 发起调用的一侧（URL 中的工作区） | `relatedWorkspaceId` | `relationType` |
|---|---|---|
| **分支**工作区 | **基础**工作区 | `Base` |
| **基础**工作区 | **分支**工作区 | `Branch` |

**不要**同时执行这两种操作——一旦一个方向的关系已存在，创建另一个方向的关系将失败并返回 `WorkspaceRelationBidirectionalExists`。无论从哪一侧发起调用，权限要求都相同：**对分支工作区拥有管理员权限，并且对基础工作区拥有参与者（或更高）权限。** 推荐（也是最直观）的方式是从分支工作区发起调用并指向基础工作区：

```bash
# From the BRANCH workspace, declare that the related workspace is its Base.
printf '{"relatedWorkspaceId":"%s","relationType":"Base"}' "${BASE_WS}" > relation.json
fab api -X post "workspaces/${BRANCH_WS}/git/workspaceRelations" -i relation.json
```

返回 `201`。支持服务主体和托管标识。

### 列出关系

任何具有 **Viewer or higher** 权限的用户都可以列出工作区的关系（通过 `continuationToken` 分页）。响应中的 `relationType` 可以是 `Base`、`Branch` 或 `RelatedWorkspace`。

```bash
fab api "workspaces/${WORKSPACE_ID}/git/workspaceRelations"
```

### 删除关系

仅移除沿袭关系链接——它**不会**删除任一工作区或其中的项目。调用方必须是路径中所指定工作区（基础端或分支端）的 **Admin**。只有 `Branch` 关系可以删除，否则 API 会返回 `WorkspaceRelationTypeNotBranch`。

```bash
fab api -X delete "workspaces/${WORKSPACE_ID}/git/workspaceRelations/${RELATION_ID}"
```

（Learn：rest/api/fabric/core/workspace-relations。）

---

## 相关：跨工作区项目绑定

从同一分支更新目标工作区会将项目提升到该工作区。每个项目到项目的引用是自动重新绑定（逻辑 ID）还是失效（对象 ID／硬编码端点），取决于项目定义格式，而非 Git 生命周期；这一点同样适用于 fabric-cicd 和 Bulk Import API。若要预测特定依赖项的判定结果，请查阅带有证据标记的兼容性矩阵；若要对不确定的引用进行实证验证，请使用 **cross-workspace-item-binding** Skill（规划中的配套 Skill，此仓库中尚不可用）——它与本 Skill 所驱动的连接／提交／更新生命周期是不同的关注点。

## 相关：Terraform（基础设施即代码）

若要以声明式方式（基础设施即代码）而非命令式 `fab api` 调用来管理**连接**端，请使用 **git-integration-terraform** Skill（规划中的配套 Skill，此仓库中尚不可用）。它涵盖 `microsoft/fabric` 提供程序的 `fabric_connection` 和 `fabric_workspace_git` 资源（Azure DevOps 服务主体或自动方式、GitHub PAT、初始化策略、plan/apply/import）。在该模式下，Terraform 负责管理连接，而本 Skill 中的提交／从 Git 更新／状态操作仍采用命令式运行时路径——因此，常见设置是使用 Terraform 管理连接，再通过一个 CLI 步骤执行从 Git 更新。

## 相关：Variable Library（环境参数化）

Git 集成可在工作区之间移动项目*定义*，但它本身不会对各阶段（dev/test/prod）必须不同的值进行参数化，例如连接字符串、端点、容量 ID 和功能标志。此类按环境进行的参数化由 **Variable Library** 负责：只需定义一次变量，为每个阶段提供一个值集，并让项目解析适用于相应阶段的值。当与 Git 同步的工作区需要使用因环境而异的值时，请使用配套的 `variable-library-cli` Skill 对变量／值集进行建模，而不要在此处硬编码或复制该逻辑——本 Skill 负责源代码控制生命周期，Variable Library Skill 负责其所提供的参数化。

## 注意事项、规则与故障排除

| 症状 | 原因 | 解决方法 |
|---|---|---|
| `400 WorkspaceHeadMismatch` | `workspaceHead` 已过期 | 重新读取 `git/status`，使用当前 head 重试 |
| `400 MissingWorkspaceConflictResolution` | 双方都更改了同一项，但发送 `updateFromGit` 时未提供 `conflictResolution` | 添加 `conflictResolution`（策略为 `PreferRemote` 或 `PreferWorkspace`）+ `options.allowOverrideItems: true`；先检查 `git/status` 中是否有 `conflictType: "Conflict"` |
| `WorkspaceHasNoCapacityAssigned` | 工作区未分配到容量（Git 要求必须分配） | 为工作区分配容量，然后重试 |
| `git/connect` 出现 `404 GitProviderResourceNotFound` | 提供商上不存在该仓库、分支或 `directoryName`——与门户不同，API **不会**自动创建文件夹 | 验证仓库和分支名称；如果是新建**文件夹**，请先通过 Git 提供商 API 将一个占位 `README.md` 提交到该分支，以预先创建文件夹（参见[将工作区连接到 Git](#connect-a-workspace-to-git)），然后重试 |
| `WorkspaceAlreadyConnectedToGit` | 工作区已关联到某个仓库 | 先断开连接，然后连接到新仓库 |
| `InsufficientPrivileges` / `403` | 调用方缺少操作所需的角色（连接/断开连接需要 **Admin**；提交/更新至少需要对所有项具有写入权限的 **Contributor**） | 向调用方授予所需角色：连接/断开连接需要 Admin，提交/更新需要对所有项具有写入权限的 Contributor |
| `PrincipalTypeNotSupported` | 服务主体使用了自动凭据（或 GitHub） | 在 `myGitCredentials` 中切换到 `ConfiguredConnection` |
| `commitToGitRequest is required`（使用 `fab api` 时） | 正文通过 stdin 管道传入 | 将正文写入文件，并传入 `-i body.json` |
| 操作返回 `202` 后没有任何变化 | 异步操作尚未完成 | 轮询 `operations/{id}`（从 `--show_headers` 获取），或轮询 `git/status`，直到各 head 一致 |
| 操作长时间停留在 `Running` 状态 | 工作区较大，或第二个 Git 操作正在队列中等待 | 使用合理的超时时间（约 10 分钟）持续轮询；切勿并发启动第二个 Git 操作 |
| `401 Unauthorized` | 令牌受众错误 | 运行 `fab auth login`（fab 会自动设置受众）；使用 `az rest` 回退方案时，传入 `--resource https://api.fabric.microsoft.com` |
| `git/workspaceRelations` 出现 `WorkspaceRelationRootDirectoryMismatch` | 基础工作区和分支工作区连接到了不同的 Git 根目录 | 将两者连接到相同的仓库/组织/项目/目录（Azure DevOps）或仓库 URL/目录（GitHub），仅 `branchName` 不同，然后重试 |
| `WorkspaceRelationAlreadyExists` / `WorkspaceRelationBidirectionalExists` | 基础工作区↔分支工作区的关系已记录（该关系是双向的） | 无需执行任何操作——使用 `GET git/workspaceRelations` 确认；不要再创建反向关系 |
| 删除时出现 `WorkspaceRelationTypeNotBranch` | 尝试删除的关系不是 `Branch` 关系 | 只有 `Branch` 关系可以删除——请使用正确的 `workspaceRelationId`，并从分支侧删除 |
| 每次同步都报告一项并非由你造成的未提交更改（删除了一个空行，或 CRLF/LF 发生了切换） | 在受影响的工作区中，编辑器或 AI 智能体在编写项源文件（`notebook-content.py`、`pipeline-content.json`、`.platform`）时使用了末尾换行符或 CRLF，随后 Fabric 将其重新序列化为观测到的导出格式（LF，且**没有**末尾换行符） | 通过一次具有代表性的往返操作确认该行为，然后在编写时匹配观测到的导出格式：不使用末尾换行符，使用 LF 行尾。在同步的仓库中通过 `.editorconfig` + `.gitattributes` 固定该格式，并告知 AI 智能体不要添加末尾换行符。参见 [git-integration-concepts.md § 避免仅格式差异](references/git-integration-concepts.md#avoiding-formatting-only-diffs) |

## 示例

### 示例 1：提交源工作区，然后部署到目标工作区

```bash
# Commit everything in the source workspace (jq builds a JSON-safe body)
SRC_HEAD=$(fab api "workspaces/${SRC_WS}/git/status" | jq -r '.text.workspaceHead')
jq -n --arg head "$SRC_HEAD" --arg msg "Deploy v1" \
  '{mode:"All", workspaceHead:$head, comment:$msg}' > commit.json
fab api -X post "workspaces/${SRC_WS}/git/commitToGit" -i commit.json
# ...poll src status until synced, then updateFromGit into ${TARGET_WS} (see above)
```

### 示例 2：`az rest` 后备等效命令

当 `fab` 不可用时，可以通过 `az rest` 使用相同的 REST 端点。始终传递
`--resource`；请求正文可以内联提供（`--body '{...}'`），也可以从文件读取
（`--body @file.json`）：

```bash
# status
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/git/status" \
  --resource "https://api.fabric.microsoft.com"

# commit (body inline)
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/git/commitToGit" \
  --resource "https://api.fabric.microsoft.com" \
  --headers "Content-Type=application/json" \
  --body "{\"mode\":\"All\",\"workspaceHead\":\"${HEAD}\",\"comment\":\"Author items\"}"
```