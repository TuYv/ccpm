---
name: git-integration-operations-cli
description: "Runs the Fabric Git integration lifecycle through fab api or az rest, including connecting a workspace to Azure DevOps or GitHub, committing, updating from Git, reading sync status, resolving conflicts, disconnecting a connected workspace, and automating sync with a service principal. For stage promotion use deployment-pipelines-authoring-cli. Branch switching, fab deploy, fabric-cicd and cross-workspace rebinding are out of scope."
metadata:
  maturity: experimental
  owner: yaron
---
> **Telemetry — 必须遵守。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: git-integration-operations-cli`（`az rest`：`--headers "x-ms-fabric-skill=git-integration-operations-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该参数——但仍需添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区 ID：列出所有工作区，然后使用 JMESPath
>    按 `displayName` 进行筛选。要查找项 ID：列出工作区中该类型的所有项，然后按
>    `displayName` 进行筛选。
> 2. 所有 Git 操作都是针对
>    `https://api.fabric.microsoft.com` 执行的**控制平面**调用。运行一次 `fab auth login`，然后
>    `fab api` 会自动设置基 URL 和 Fabric 令牌受众。使用 `az rest` 回退方式时，必须自行传入匹配的
>    `--resource`，否则会收到 401。
> 3. `commitToGit`、`updateFromGit`，甚至 `git/status` 都可能返回 **HTTP 202
>    （长时间运行操作）**，而不只是同步响应正文。遇到 `202` 时，轮询该操作：使用 `fab` 时，从
>    `--show_headers` 中读取 `x-ms-operation-id`，然后轮询 `fab api operations/{id}`，直到
>    `status` 为 `Succeeded`；使用 `az rest` 回退方式时，轮询 `Location` / `x-ms-operation-id` 标头（参见 COMMON-CORE
>    长时间运行操作轮询）。**然后**读取 `git/status`，确认
>    `workspaceHead == remoteCommitHash`。应优先通过操作轮询确认完成；如果改为轮询 `git/status`，则将正在进行中的（`202`）或尚未同步的响应视为“仍在运行”，在两端 head 匹配之前，不要根据其
>    `changes` 采取任何操作。（参见：rest/api/fabric/core/git
>    和
>    fabric/cicd/git-integration/git-automation。）
> 4. `updateFromGit` 要求使用工作区的**当前** `workspaceHead`；过期的值会返回
>    `400 WorkspaceHeadMismatch`。务必先读取 `git/status`。
> 5. **每项 Git 操作的前提条件：**工作区必须分配到一个
>    **容量**（未分配容量的工作区会失败并返回 `WorkspaceHasNoCapacityAssigned`），
>    且调用者（用户或服务主体）必须持有正确的工作区角色：**连接和断开连接要求 Admin**；
>    **提交和更新至少要求 Contributor**，并且对所有项拥有写入权限；**切换分支要求 Admin**
>    （或者在工作区选择加入设置 *Allow users
>    with at least Contributor role to change Git branch* 已启用时，要求 Contributor）。同一时间只能对一个工作区运行一项 Git
>    操作。
> 6. **租户管理员开关**会控制 Git 集成，也是导致无法解释的失败的常见原因。**GitHub** 同步开关默认**关闭**（进行任何 GitHub 连接之前请先启用）；Azure DevOps 同步默认开启。工作区与跨区域的 *Azure* 存储库之间进行连接需要启用**跨地理区域导出**开关（GitHub 不会强制要求该开关）。请参阅 [references/git-integration-concepts.md § 租户管理员前提条件](references/git-integration-concepts.md#tenant-admin-prerequisites)。

# Git 集成操作 — CLI Skill

从 CLI 环境自动化 Fabric Git 集成生命周期（连接、提交、更新、状态检查、断开连接）。跨工作区项目引用在提升后是否重新绑定是一个独立问题，其结果由项目定义格式（逻辑 ID 还是对象 ID）决定，而不是由 Git 生命周期本身决定。

## 前置知识

请先阅读这些共享参考资料（路径假定此技能位于
`skills/git-integration-operations-cli/` 下的 `skills-for-fabric` 中；在仓库外起草时请进行相应调整）：

- [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) — 通过名称解析工作区/项目 ID 时**必须**阅读。
- [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) — audience 错误会导致 401；遇到任何身份验证问题前请先阅读。
- [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) — CLI 的 `az login` 流程和令牌获取。
- [COMMON-CLI.md § 通过 az rest 调用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) — `az rest` **备用**路径（**始终传递 `--resource`**）；包含长时间运行操作的轮询辅助工具。
- [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) — 分页、长时间运行操作轮询、速率限制。

## 目录

| 任务 | 参考 |
|---|---|
| 连接前的预检 | [SKILL.md § 预检（连接之前）](#pre-flight-before-you-connect) |
| 将工作区连接到 Git | [SKILL.md § 将工作区连接到 Git](#connect-a-workspace-to-git) |
| 创建 git 连接（服务主体） | [SKILL.md § 创建 Git 提供程序连接（服务主体）](#create-the-git-provider-connection-service-principal) |
| 将工作区项目提交到 Git | [SKILL.md § 提交到 Git](#commit-to-git) |
| 从 Git 更新工作区 | [SKILL.md § 从 Git 更新](#update-from-git) |
| 检查同步状态 | [SKILL.md § 检查同步状态](#check-sync-status) |
| 解决更新冲突 | [SKILL.md § 解决冲突](#resolve-conflicts) |
| 断开与 Git 的连接 | [SKILL.md § 断开与 Git 的连接](#disconnect-from-git) |
| 将分支工作区链接到其基础工作区（工作区关系） | [SKILL.md § 将分支工作区链接到其基础工作区（工作区关系）](#link-a-branch-workspace-to-its-base-workspace-relations) |
| Git 集成概念（同步模型、状态、权限） | [references/git-integration-concepts.md § 概念](references/git-integration-concepts.md#concepts) |
| 租户管理员前置条件（开关） | [references/git-integration-concepts.md § 租户管理员前置条件](references/git-integration-concepts.md#tenant-admin-prerequisites) |
| 支持的 Git 提供程序 | [references/git-integration-concepts.md § 支持的 Git 提供程序](references/git-integration-concepts.md#supported-git-providers) |
| 支持的项目类型 | [references/git-integration-concepts.md § 支持的项目类型](references/git-integration-concepts.md#supported-item-types) |
| 避免仅由格式造成的差异（尾随换行符 / 行尾） | [references/git-integration-concepts.md § 避免仅由格式造成的差异](references/git-integration-concepts.md#avoiding-formatting-only-diffs) |
| 服务主体 / CI-CD 管道模板 | [references/automation-templates.md](references/automation-templates.md) |
| 注意事项、规则、故障排除 | [SKILL.md § 注意事项、规则、故障排除](#gotchas-rules-troubleshooting) |

## 必须/优先/避免

### 必须执行
- 读取 `git/status`，并将当前的 `workspaceHead` 传入每次
  `commitToGit` 和 `updateFromGit` 调用。
- 每次异步操作后轮询 `git/status`，直到
  `workspaceHead == remoteCommitHash` **且** `changes` 数组为空。
  `202`/`Succeeded` 状态并不能证明同步正确 — 必须验证状态。
- 在同一提交中部署某个项及其引用的项，以便逻辑 ID 能够在目标工作区中解析。

### 严禁执行
- 严禁在同一工作区上并发运行两个 Git 操作 — 当一个操作仍处于 `Running` 状态时，
  不得再次执行 `commitToGit`/`updateFromGit`，否则会破坏 head 跟踪。必须串行执行：
  轮询第一个操作直到 `Succeeded` 后，再启动下一个操作。
- 严禁将工作区同时作为真实来源和同一分支上的 CI/CD 推送目标。每个分支只能有一个写入方：
  要么由人工从工作区提交，要么由自动化推送到 Git — 不能同时进行。

### 优先
- 在执行 `fab auth login` 后使用 `fab api` 作为**主要**驱动程序：它会自动设置基础
  URL 和 Fabric 令牌受众，从而避免 401 错误受众陷阱。当 `fab` 不可用或需要精细控制
  请求头时，使用带有 `--resource "https://api.fabric.microsoft.com"` 的 `az rest`
  作为**备用方案**。
- 使用 `PreferRemote` 冲突解决方式，将 Git 中的最新内容干净地“拉取”到下游/目标工作区。

### 避免
- 重用过期的 `workspaceHead`（会导致 `400 WorkspaceHeadMismatch`）。
- 通过 stdin 向 `fab api` 传递请求体（请使用 `-i <file.json>` 或 `-i '<inline JSON>'`）。

---

## CLI：`fab` 主用，`az rest` 备用

下面的每个操作都使用 `fab api` 展示。运行一次 `fab auth login`（它支持用于自动化的服务主体）；
之后 `fab` 会为你处理基础 URL 和令牌受众。使用 `az rest` 的相同调用是机械式转换：

**为你所运行的身份验证 `fab`：**

```bash
fab auth login                                              # interactive user (SSO)
fab auth login -u <client-id> -p <client-secret> --tenant <tenant-id>   # service principal (CI/CD)
fab auth login --identity                                   # managed identity (Azure compute)
```

服务主体或托管标识必须是工作区 **Admin** 才能连接或断开连接（对于提交/更新操作，
至少拥有对所有项的写入权限的 **Contributor** 即可），并且（对于 `ConfiguredConnection` 路径）
必须持有 Git 提供商凭据。有关完整的管道脚本，请参阅
[references/automation-templates.md](references/automation-templates.md)。

- `fab api <endpoint>` 等同于 `az rest --method GET --url "https://api.fabric.microsoft.com/v1/<endpoint>" --resource "https://api.fabric.microsoft.com"`。
- `fab api -X post <endpoint> -i body.json` 会添加 `--method POST --headers "Content-Type=application/json" --body @body.json`。

`fab api` 通过 `-i` 从文件路径或内联 JSON 字符串读取请求体（例如 `-i '{"displayName":"..."}'`）—
 绝不能从 stdin 读取。它会打印
`{"status_code": <code>, "text": <parsed body>}`（添加 `--show_headers` 可获得顶层的
`headers` 对象），因此请使用 `jq -r '.text.<field>'` 读取响应字段，并使用
`jq -r '.headers["x-ms-operation-id"]'` 读取 LRO id。完整的 `az rest` 调用对请参阅
[示例 2](#example-2-az-rest-fallback-equivalents)。

---

## 预检（连接之前）

在执行 `git/connect` 之前，按顺序运行这些与 Git 相关的检查。每项检查失败时都有特定的修复方法——提前解决这些问题可以避免最常见的连接时错误。

| 检查 | 命令 | 通过 = 继续 / 失败 = 修复 |
|---|---|---|
| 身份验证 + Fabric token | `fab auth login` then `fab api workspaces` | `401` → 重新登录（`fab` 会自动设置正确的 audience） |
| 调用方是工作区 Admin | `fab api "workspaces/${WORKSPACE_ID}/roleAssignments"` | 连接/断开连接需要 **Admin** 角色 |
| 工作区有容量 | `fab api "workspaces/${WORKSPACE_ID}"` → 检查 `capacityId` | `WorkspaceHasNoCapacityAssigned` → 分配容量（Git 需要容量） |
| SP 路径的 Git 凭据 | `fab api connections`（如果已有合适的连接则重复使用） | SP 连接需要一个 `ConfiguredConnection`。如果不存在，此 skill 会根据你的 ADO org/project/repo + SP tenant/client/secret 创建它——参见[创建 Git 提供程序连接](#create-the-git-provider-connection-service-principal)（需要启用租户设置“service principals can create connections”）。交互式用户 SSO 路径使用 `Automatic`，不需要连接。 |
| 分支上存在目标 `directoryName` | GitHub：`curl -fsS -H "Authorization: Bearer $PAT" "https://api.github.com/repos/$OWNER/$REPO/contents/$DIR?ref=$BRANCH"` — ADO：使用 repo 的 Items API | 该 API（不同于门户）**不会**创建缺失的文件夹——连接到不存在的 `directoryName` 会失败，并返回 `404 GitProviderResourceNotFound`。如果文件夹是新的，请先预创建它（参见[将工作区连接到 Git](#connect-a-workspace-to-git)下的说明）。 |

## 将工作区连接到 Git

将工作区连接到 Azure DevOps 或 GitHub 仓库，然后初始化连接以建立同步方向。

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

当工作区中已经有权威项目时使用 `PreferWorkspace`；当 Git 分支是权威来源时使用 `PreferRemote`。

> **目标 `directoryName` 必须已存在于分支上。** 不同于 Fabric
> 门户——门户会通过向缺失的文件夹中提交一个 `README.md`
> 占位文件来静默创建该文件夹——`git/connect` **API 不会创建文件夹**。
> 连接到分支上不存在的 `directoryName` 会失败，并返回
> `404 GitProviderResourceNotFound`。仓库和分支也必须存在（connect 永远不会创建分支）。如果文件夹是新的，请先通过 **Git 提供程序的 API**（而不是 Fabric API）向分支提交一个占位文件来创建它，然后再进行连接。使用内容为
> `This is an auto-created file via Fabric skills for <workspace-name>` 的 `README.md`，以匹配门户的约定。
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

> **两种身份验证模式（两种提供程序都使用 `myGitCredentials` 进行自动化）。**
> 工作区通过以下两种方式之一向 git 进行身份验证：
> - **自动 git 凭据**（仅限 Azure DevOps）：连接用户的 SSO
>   身份，该身份根据工作区设置建立。具有至少 Contributor 权限的次要贡献者会
>   复用该身份。GitHub 不支持此模式，并且该模式不能用于
>   无头自动化或服务主体自动化。
> - **已配置的凭据**（Azure DevOps *和* GitHub）：在连接请求正文中引用的 Fabric
>   云连接。这是任何服务主体或无人值守运行所需的方式：
>   ```json
>   "myGitCredentials": { "source": "ConfiguredConnection", "connectionId": "<connection-guid>" }
>   ```
>   对于 **Azure DevOps**，连接的 `credentialType` 可以是
>   `ServicePrincipal`（无头自动化）或 `OAuth2`（存储的委托用户令牌）；根据 Create Connection
>   API 的定义，两者都是有效的 ConfiguredConnection 凭据，并且都支持多租户场景。
>   对于 **GitHub**，连接工作区**必须使用 Personal Access Token (PAT)**：
>   云连接存储一个具有 Contents Read 权限（提交时还需 Write 权限）的细粒度令牌，
>   或一个具有 `repo` 作用域的经典令牌。GitHub 没有自动凭据模式，因此即使是交互式用户连接，
>   也必须使用 PAT。
>   这里的区别并不是“GitHub 需要凭据，而 ADO 不需要”。当服务主体驱动连接时，ADO
>   **同样**需要 ConfiguredConnection；自动模式仅适用于交互式用户 SSO。（了解：
>   fabric/cicd/git-integration/automate-git-integration-with-service-principal；
>   rest/api/fabric/core/git/connect。）

> **处理 initialize 响应。** `initializeConnection` 返回
>   `requiredAction`（`UpdateFromGit`、`CommitToGit` 或 `None`）以及 `workspaceHead`
>   和 `remoteCommitHash`，并且其自身也可能返回 `202`。在该操作完成后，使用返回的哈希值调用
>   `requiredAction` 指定的同步操作，否则工作区虽然已连接，但不会完全同步。（了解：
>   rest/api/fabric/core/git/initialize-connection。）

### 创建 Git 提供程序连接（服务主体）

对于无人值守自动化，首先创建一个存储 Git 提供程序凭据的 Fabric 云连接，然后将其 `id` 作为上方
`myGitCredentials` 块中的 `connectionId` 传入。使用
[Create Connection API](https://learn.microsoft.com/rest/api/fabric/core/connections/create-connection)
（`POST /v1/connections`，委托作用域 `Connection.ReadWrite.All`）。只有在 Fabric 管理员设置“服务主体可以创建工作区、连接和部署管道”启用时，服务主体才能创建连接。

**你必须提供的信息（Azure DevOps）：**
- ADO **组织**、**项目**和**存储库**名称，并将其组合到一个
  `url` 参数中：`https://dev.azure.com/<org>/<project>/_git/<repo>/`
- 服务主体的 **租户 ID**、**客户端（应用程序）ID**和
  **客户端密钥**
- 连接的**显示名称**（最多 200 个字符，且必须在租户中唯一）

**连接生效前的前提条件：**授予服务主体以下权限：  
(a) 该 **Azure DevOps 组织和项目**的访问权限（git 访问权限由 ADO 自身强制执行，而不仅仅是由 Fabric 强制执行），以及 (b) 目标 Fabric 工作区的 **Admin** 权限。

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

`201` 响应会返回连接的 `id`；在连接调用的
`myGitCredentials` 块中将其用作 `connectionId`。如需完全无密钥的变体，
可以使用 `-i '{...}'` 将请求正文内联传入（磁盘上不会生成文件），或者通过
`servicePrincipalSecretReference` 引用 Key Vault 密钥，而不是使用原始的
`servicePrincipalSecret`。上面的示例使用
`credentialType: "ServicePrincipal"`；Azure DevOps 连接也接受
`credentialType: "OAuth2"`（存储的委托用户令牌），并且这两种凭据类型都支持多租户场景。要将*现有的*用户连接工作区切换为服务主体，请将 SP 添加为工作区 Admin，共享或重新创建此连接，然后使用相同的 ConfiguredConnection
正文执行
`PATCH /workspaces/{id}/git/myGitCredentials`。（了解更多：
fabric/cicd/git-integration/automate-git-integration-with-service-principal；
rest/api/fabric/core/connections/create-connection。）

## 提交到 Git

将工作区项目推送到已连接的分支。先读取 head，然后提交。

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

使用 `"mode": "Selective"` 和 `items` 数组来提交子集。`commitToGit`
要么同步完成（`200`，表示已完成），要么异步完成（`202`，并附带用于轮询的
`x-ms-operation-id`）——应像上文一样根据 `.status_code` 进行分支判断，而不是
假定一定会返回 `202`。

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

轮询，直到工作区和远程端的 head 相匹配。`commitToGit` 和
`updateFromGit` 都是异步操作，因此可以通过此循环确认它们已完成。

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

对于仍在执行中的操作（提交/更新返回 `202`），应直接轮询 LRO，而不是根据
head 猜测状态：

```bash
# Capture x-ms-operation-id from the 202, then poll until Succeeded
OP_ID=$(fab api -X post "workspaces/${WORKSPACE_ID}/git/commitToGit" -i commit.json \
  --show_headers | jq -r '.headers["x-ms-operation-id"]')
while :; do
  ST=$(fab api "operations/${OP_ID}" | jq -r '.text.status')
  case "$ST" in Succeeded) break ;; Failed) echo "op failed"; break ;; *) sleep 5 ;; esac
done
```

`git/status` 还会返回 `changes` 数组——非空数组表示存在未提交的（工作区）或
尚未应用的（远程端）差异。

## 解决冲突

真正的冲突是*双方都发生了更改*：在上次同步之后，**同一个项**同时在工作区中
（一次未提交的本地编辑）和分支上（一次新的提交）被修改。`git/status` 会在其
`changes` 数组中将该项标记为 `conflictType: "Conflict"`（`workspaceChange` 和
`remoteChange` 都显示为 `Modified`）。这不同于单边差异，后者只需执行
`updateFromGit`（仅远程端更改）或 `commitToGit`（仅工作区更改），无需指定策略。

当项的双方都发生更改时，`updateFromGit` **必须**指定冲突策略——不带
`conflictResolution` 块调用它会返回
`400 MissingWorkspaceConflictResolution`：

- `conflictResolutionPolicy: "PreferRemote"` — Git 分支优先（通常用于拉取到目标
  工作区的部署场景）；本地编辑将被丢弃。
- `conflictResolutionPolicy: "PreferWorkspace"` — 当前工作区优先；若要将工作区
  版本推送到 Git，应改用 `commitToGit`，该操作不接受冲突策略。

设置 `options.allowOverrideItems: true`，以允许更新覆盖目标工作区中已经存在的项目（只要冲突项目已经存在于工作区中，就必须设置此项；而在双边冲突中，根据定义它必然已经存在）。

**选择哪种策略：**

| 场景 | 策略 |
|---|---|
| 下游/目标工作区从 Git 拉取最新内容 | `PreferRemote` |
| 创作工作区是真实来源 | `PreferWorkspace`（或使用 `commitToGit` 将工作区版本推送到 Git） |
| 同一项目确实存在双边编辑 | 在 `git/status` 中检查每个 `changes` 条目的 `conflictType`，然后针对每个项目谨慎解决 |

## 与 Git 断开连接

```bash
fab api -X post "workspaces/${WORKSPACE_ID}/git/disconnect"
```

---

## 将分支工作区链接到其基础工作区（工作区关系）

> **预览功能。** **Git 工作区关系** API 属于 Fabric Git 功能，目前处于预览阶段。它们记录**分支**工作区与其派生自的**基础**工作区之间的谱系链接，从而使基础工作区↔分支工作区的关系显示在 Fabric 门户中。当分支工作区在内置分支创建功能发布**之前**创建，或分支工作区由你自己的**自动化**流程（而不是门户中的分支创建 UX）预配，并且你仍希望该谱系显示在 UI 中时，请使用这些 API。创建关系**不会**将任一工作区连接到 Git、移动项目或启动同步——它只记录该链接。

**前置条件——两个工作区必须指向同一个 Git 根目录。** 如果基础工作区和分支工作区未连接到**同一个仓库根目录**（仅分支不同），创建操作会失败并返回 `WorkspaceRelationRootDirectoryMismatch`：

- **Azure DevOps：** `organizationName`、`projectName`、`repositoryName` 和 `directoryName` 相同——只有 `branchName` 不同。
- **GitHub：** 仓库 URL 和 `directoryName` 相同——只有 `branchName` 不同。

因此，请先将两个工作区连接到 Git（并完成初始化）；关系只会让现有的分支/基础工作区对在界面中显示出来。

### 创建关系（链接分支 ↔ 基础工作区）

该关系是**双向的**，因此只需创建**一次**。请仔细阅读请求正文——你 POST 到的工作区和 `relationType` 是两回事：

- **URL** 中的工作区（`workspaces/{workspaceId}/...`）是你调用请求的来源方。
- `relatedWorkspaceId` 是**另一个**工作区。
- `relationType` 描述的是该**另一个**（`relatedWorkspaceId`）工作区的角色，**不是** URL 中工作区的角色。创建时只有 `Base` 和 `Branch` 有效。

因此，同一个链接有两种等价的创建方式：

| 调用来源（URL 工作区） | `relatedWorkspaceId` | `relationType` |
|---|---|---|
| **分支**工作区 | **基础**工作区 | `Base` |
| **基础**工作区 | **分支**工作区 | `Branch` |

**不要**同时运行两种方式——一旦某个方向的关系已经存在，再创建另一个方向会失败并返回 `WorkspaceRelationBidirectionalExists`。无论从哪一方发起调用，权限要求都相同：对**分支工作区**拥有 **Admin** 权限，对**基础工作区**拥有 **Contributor** 或更高权限。推荐（也最直观）的方式是从分支工作区发起调用，并指向基础工作区：

```bash
# 在 BRANCH 工作区中，声明相关工作区是其 Base。
printf '{"relatedWorkspaceId":"%s","relationType":"Base"}' "${BASE_WS}" > relation.json
fab api -X post "workspaces/${BRANCH_WS}/git/workspaceRelations" -i relation.json
```

返回 `201`。支持服务主体和托管标识。

### 列出关系

任何 **Viewer 或更高权限** 的用户都可以列出工作区的关系（通过
`continuationToken` 分页）。响应中的 `relationType` 可以是 `Base`、`Branch` 或
`RelatedWorkspace`。

```bash
fab api "workspaces/${WORKSPACE_ID}/git/workspaceRelations"
```

### 删除关系

仅移除谱系链接 — **不会**删除任一工作区或其中的项目。调用者必须是路径中所指工作区（即 Base 端或 Branch 端工作区）的 **Admin**。只有 `Branch` 关系可以删除 — 否则 API 会返回 `WorkspaceRelationTypeNotBranch`。

```bash
fab api -X delete "workspaces/${WORKSPACE_ID}/git/workspaceRelations/${RELATION_ID}"
```

（了解更多：rest/api/fabric/core/workspace-relations。）

---

## 相关内容：跨工作区项目绑定

从同一分支更新目标工作区会将项目提升到该工作区中。每个项目到项目的引用是否会自动重新绑定（逻辑 ID），还是会断开（对象 ID / 硬编码端点），取决于项目定义格式的特性，而不是 Git 生命周期的特性；这同样适用于 fabric-cicd 和 Bulk Import API。若要预测特定依赖关系的判定结果，请阅读带证据标签的兼容性矩阵；或者，如果某个引用尚不确定，请使用 **cross-workspace-item-binding** skill（计划中的配套 skill，目前尚未在此仓库中提供）进行实证验证 — 这与本 skill 所驱动的 connect/commit/update 生命周期是不同的关注点。

## 相关内容：Terraform（基础设施即代码）

若要以声明式方式（基础设施即代码）管理 **connect** 端，而不是使用命令式的 `fab api` 调用，请使用 **git-integration-terraform** skill（计划中的配套 skill，目前尚未在此仓库中提供）。该 skill 涵盖 `microsoft/fabric` provider 的 `fabric_connection` 和 `fabric_workspace_git` 资源（Azure DevOps 服务主体或自动模式、GitHub PAT、初始化策略、plan/apply/import）。在这种模式下，Terraform 负责连接，而本 skill 中的 commit / update-from-git / status 操作仍作为命令式运行时路径 — 因此常见的设置是使用 Terraform 管理连接，再通过 CLI 步骤执行 update-from-git。

## 相关内容：Variable Library（环境参数化）

Git 集成会在工作区之间移动项目的*定义*，但它本身不会对必须随阶段（dev/test/prod）变化的值进行参数化 — 例如连接字符串、端点、容量 ID 和功能标志。这种按环境进行的参数化是 **Variable Library** 的职责：定义一次变量，为每个阶段提供一组值，并让项目解析出适用于相应阶段的值。当 Git 同步的工作区需要使用随环境变化的值时，请使用 `variable-library-cli` companion skill 来建模变量/值集，而不要在此处硬编码或复制这部分逻辑 — 本 skill 负责源代码控制生命周期，Variable Library skill 负责其所提供的参数化。

## 易错点、规则与故障排除

| 症状 | 原因 | 修复方法 |
|---|---|---|
| `400 WorkspaceHeadMismatch` | `workspaceHead` 已过时 | 重新读取 `git/status`，使用当前 head 重试 |
| `400 MissingWorkspaceConflictResolution` | 两侧修改了同一项，但发送 `updateFromGit` 时未提供 `conflictResolution` | 添加 `conflictResolution`（策略为 `PreferRemote` 或 `PreferWorkspace`）以及 `options.allowOverrideItems: true`；先检查 `git/status`，确认 `conflictType: "Conflict"` |
| `WorkspaceHasNoCapacityAssigned` | 工作区未分配容量（Git 需要容量） | 为工作区分配容量，然后重试 |
| `git/connect` 上出现 `404 GitProviderResourceNotFound` | 提供程序上不存在该存储库、分支或 `directoryName` —— 与门户不同，该 API **不会**自动创建文件夹 | 验证存储库/分支名称；如果是新的**文件夹**，请先通过 Git 提供程序 API 向该分支提交一个 `README.md` 占位文件来预创建文件夹（参见[将工作区连接到 Git](#connect-a-workspace-to-git)），然后重试 |
| `WorkspaceAlreadyConnectedToGit` | 工作区已链接到存储库 | 先断开连接，然后连接到新存储库 |
| `InsufficientPrivileges` / `403` | 调用方缺少操作所需的角色（连接/断开连接需要 **Admin**；提交/更新至少需要对所有项具有写入权限的 **Contributor**） | 为调用方授予所需角色：连接/断开连接需要 Admin；提交/更新需要对所有项具有写入权限的 Contributor |
| `PrincipalTypeNotSupported` | 服务主体使用自动凭据（或使用 GitHub） | 在 `myGitCredentials` 中切换为 `ConfiguredConnection` |
| 使用 `fab api` 时出现 `commitToGitRequest is required` | 请求正文通过 stdin 管道传入 | 将请求正文写入文件，并传递 `-i body.json` |
| 操作返回 `202`，但之后没有任何变化 | 异步操作尚未完成 | 轮询 `operations/{id}`（从 `--show_headers` 获取），或持续轮询 `git/status`，直到 heads 匹配 |
| 操作长时间停留在 `Running` 状态 | 工作区较大，或队列中已有第二个 Git 操作 | 使用合理的超时持续轮询（约 10 分钟）；绝不要并发启动第二个 Git 操作 |
| `401 Unauthorized` | Token audience 错误 | 运行 `fab auth login`（fab 会自动设置 audience）；如果使用 `az rest` 作为后备方案，请传递 `--resource https://api.fabric.microsoft.com` |
| `git/workspaceRelations` 上出现 `WorkspaceRelationRootDirectoryMismatch` | 基础工作区和分支工作区连接到了不同的 Git 根目录 | 将两者连接到相同的存储库/组织/项目/目录（Azure DevOps），或相同的存储库 URL/目录（GitHub）；两者只能在 `branchName` 上有所不同，然后重试 |
| `WorkspaceRelationAlreadyExists` / `WorkspaceRelationBidirectionalExists` | 基础工作区↔分支工作区关系已被记录（该关系是双向的） | 无需执行任何操作 —— 使用 `GET git/workspaceRelations` 进行确认；不要再创建反向关系 |
| 删除时出现 `WorkspaceRelationTypeNotBranch` | 尝试删除的关系不是 `Branch` 关系 | 只有 `Branch` 关系可删除 —— 使用正确的 `workspaceRelationId`，并从分支侧删除 |
| 每次同步都报告一项并非由你做出的未提交更改（删除了一个空行，或发生了 CRLF/LF 切换） | 在受影响的工作区中，编辑器或 AI 代理为项源文件（`notebook-content.py`、`pipeline-content.json`、`.platform`）添加了末尾换行符或 CRLF，随后 Fabric 将其重新序列化为实际导出格式（LF、**无**末尾换行符） | 先通过具有代表性的往返操作确认该行为，然后在创作时匹配实际观察到的导出格式：无末尾换行符，使用 LF 换行。使用 `.editorconfig` + `.gitattributes` 在同步的存储库中固定该格式，并告知 AI 代理不要添加末尾换行符。参见 [git-integration-concepts.md § 避免仅由格式引起的差异](references/git-integration-concepts.md#avoiding-formatting-only-diffs) |

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

### 示例 2：`az rest` 的备用等价用法

当 `fab` 不可用时，可以通过 `az rest` 使用相同的 REST 端点。始终
传递 `--resource`；请求正文可以内联提供（`--body '{...}'`），也可以从文件中读取
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