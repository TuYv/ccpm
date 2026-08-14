---
description: Trigger a CI binary build via workflow dispatch, monitor it, download the artifact, and test the CLI binary locally.
---
# 使用捆绑构建进行 CLI 测试（CI）

在 GitHub Actions 上触发 `Build CLI Binaries` 工作流，等待其完成，下载适用于当前平台的已构建二进制文件，并在本地进行测试。

## 前置条件

- `gh` CLI 已完成身份验证，并拥有访问 `ComposioHQ/composio` 的权限
- 当前分支已推送到远程仓库

## 第 1 步：确定版本

从 `ts/packages/cli/package.json` 中读取版本，并追加 beta 预发布后缀，使构建始终被视为 beta 版本。这可以防止意外发布生产版本，并将 GitHub Release 标记为预发布版本。

```bash
BASE_VERSION=$(jq -r .version ts/packages/cli/package.json)
BETA_VERSION="${BASE_VERSION}-beta.$(date +%Y%m%d%H%M%S)"
```

例如，如果 `package.json` 中的版本是 `1.2.3`，则版本将变为 `1.2.3-beta.20260331143022`。

## 第 2 步：触发工作流

**始终使用 beta 版本**——切勿直接传入 `package.json` 中的原始版本：

```bash
gh workflow run build-cli-binaries.yml \
  --repo ComposioHQ/composio \
  --ref "$(git rev-parse --abbrev-ref HEAD)" \
  --field version="${BETA_VERSION}"
```

这可确保 CI 工作流创建一个**预发布** GitHub Release（工作流会自动检测版本字符串中的 `beta`）。

## 第 3 步：查找并监控运行任务

触发后，等待几秒钟，然后查找运行任务：

```bash
gh run list \
  --repo ComposioHQ/composio \
  --workflow build-cli-binaries.yml \
  --limit 1 \
  --json databaseId,status,headBranch
```

然后监控该任务，直到完成：

```bash
gh run watch <run-id> --repo ComposioHQ/composio
```

或者，使用 `/loop 5m gh run view <run-id> --repo ComposioHQ/composio` 每 5 分钟轮询一次工作流状态，同时继续进行其他工作。

## 第 4 步：下载并安装二进制文件

运行成功后，确定对应平台的构件名称：

| 平台            | 构件名称                  |
|-----------------|--------------------------|
| macOS ARM64     | composio-darwin-aarch64  |
| macOS x64       | composio-darwin-x64      |
| Linux x64       | composio-linux-x64       |
| Linux ARM64     | composio-linux-aarch64   |

自动检测正确的构件：

```bash
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
  arm64|aarch64) ARCH="aarch64" ;;
  x86_64) ARCH="x64" ;;
esac
ARTIFACT="composio-${OS}-${ARCH}"
```

然后从 Release 中下载。该工作流会创建一个标签为 `@composio/cli@<beta-version>` 的 GitHub Release：

```bash
VERSION="${BETA_VERSION}"  # the beta version from Step 1
TAG="@composio/cli@${VERSION}"
ENCODED_TAG=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${TAG}', safe=''))")

mkdir -p /tmp/composio-prerelease-test && cd /tmp/composio-prerelease-test \
  && curl -L -o "${ARTIFACT}.zip" \
    "https://github.com/ComposioHQ/composio/releases/download/${ENCODED_TAG}/${ARTIFACT}.zip" \
  && unzip -o "${ARTIFACT}.zip" \
  && ./${ARTIFACT}/composio --version
```

或者，直接从工作流运行任务中下载构件（无需等待 Release 作业完成）：

```bash
gh run download <run-id> \
  --repo ComposioHQ/composio \
  --name "${ARTIFACT}" \
  --dir /tmp/composio-prerelease-test

cd /tmp/composio-prerelease-test && unzip -o "${ARTIFACT}.zip" && ./${ARTIFACT}/composio --version
```

## 第 5 步：测试二进制文件

使用下载的二进制文件运行命令：

```bash
BINARY="/tmp/composio-prerelease-test/${ARTIFACT}/composio"

$BINARY version
$BINARY whoami
$BINARY --help
```

### 关键：测试 `run` 和 `subAgent`

`composio run` 以及 `run` 内部的 `experimental_subAgent()` 涉及复杂的打包机制——它们会使用位于已编译二进制文件之外的配套模块来启动子 Bun 进程。这些命令最有可能在打包构建中出现问题。务必明确测试它们：

```bash
# Test composio run with a simple inline script
$BINARY run 'console.log("hello from composio run")'

# Test composio run with subAgent (requires OPENAI_API_KEY or similar)
$BINARY run 'const result = await experimental_subAgent({ goal: "What is 2+2?", toolNames: [] }); console.log(result)'
```

如果其中任意一项失败，则说明配套模块的打包出现了问题——请检查 `ts/packages/cli/scripts/build-binary.ts` 和 `buildCompanionModules` 函数。

### 身份验证

默认情况下，该二进制文件会使用你现有的 Composio CLI 身份验证信息（存储在 `~/.composio/user-config.json` 中）。无需额外设置。

### 针对暂存或预览环境进行测试

要针对暂存环境进行测试：

```bash
export COMPOSIO_BASE_URL=https://staging-backend.composio.dev
export COMPOSIO_WEB_URL=https://staging-platform.composio.dev
```

或者使用简写形式：

```bash
export COMPOSIO_ENVIRONMENT=staging
```

对于预览环境，请将 URL 设置为预览后端和仪表板：

```bash
export COMPOSIO_BASE_URL=<preview-backend-url>
export COMPOSIO_WEB_URL=<preview-dashboard-url>
```

然后针对该环境进行身份验证：

```bash
$BINARY login
```

## 第 6 步：将结果发布到 PR

应在涉及 CLI 代码的 PR 上运行此测试。测试完成后，留下 PR 评论，总结测试结果和复现方法。使用 `gh pr comment`：

```bash
gh pr comment <pr-number> --repo ComposioHQ/composio --body "$(cat <<'EOF'
## Binary bundle test results

| Command | Result |
|---|---|
| `composio version` | ✅ / ❌ |
| `composio whoami` | ✅ / ❌ |
| `composio run '...'` | ✅ / ❌ |
| `composio run` with `experimental_subAgent()` | ✅ / ❌ |

<details>
<summary>Reproduce locally</summary>

```sh
mkdir -p /tmp/composio-prerelease-test && cd /tmp/composio-prerelease-test \
  && curl -L -o <ARTIFACT>.zip '<RELEASE_URL>' \
  && unzip -o <ARTIFACT>.zip \
  && ./<ARTIFACT>/composio version
```

</details>
EOF
)"
```

填写实际结果、构件名称和发布 URL。评论应保持简洁——详细信息块可让任何人在不使 PR 内容杂乱的情况下进行复现。

## 参考文件

| 文件 | 用途 |
|---|---|
| `.github/workflows/build-cli-binaries.yml` | 构建二进制文件的 CI 工作流 |
| `ts/packages/cli/package.json` | CLI 版本的来源 |
| `ts/packages/cli/scripts/build-binary.ts` | 本地二进制文件构建脚本 |
| `ts/packages/cli/scripts/build-binary-cross.ts` | 跨平台构建脚本 |