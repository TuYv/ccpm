---
description: Build the CLI binary from source and test it locally by running commands against the built binary.
---
# CLI 测试

从源代码构建 Composio CLI 二进制文件，并通过直接运行命令对其进行测试。

## 构建步骤

从 monorepo 根目录依次运行以下命令：

```bash
# 1. Install dependencies
pnpm install

# 2. Build all packages (CLI depends on core, client, ts-builders, etc.)
pnpm turbo build

# 3. Build the standalone binary
pnpm --dir ts/packages/cli build:binary
```

二进制文件将输出至 `ts/packages/cli/dist/composio`。

## 测试二进制文件

直接对已构建的二进制文件运行命令：

```bash
./ts/packages/cli/dist/composio version
./ts/packages/cli/dist/composio whoami
./ts/packages/cli/dist/composio --help
```

默认情况下，该二进制文件会使用你现有的 Composio CLI 身份验证信息（存储在 `~/.composio/user-config.json` 中）。无需额外设置，只需构建并运行即可。

## 针对 Staging 或 Preview 环境进行测试

如需针对 staging 而非 production 环境进行测试，请在运行二进制文件前导出以下环境变量：

```bash
export COMPOSIO_BASE_URL=https://staging-backend.composio.dev
export COMPOSIO_WEB_URL=https://staging-platform.composio.dev
```

或者使用简写形式：

```bash
export COMPOSIO_ENVIRONMENT=staging
```

对于 preview 环境，请将 URL 设置为 preview backend 和 dashboard：

```bash
export COMPOSIO_BASE_URL=<preview-backend-url>
export COMPOSIO_WEB_URL=<preview-dashboard-url>
```

然后针对该环境重新进行身份验证：

```bash
./ts/packages/cli/dist/composio login
```

## 参考文件

| 文件 | 用途 |
|---|---|
| `ts/packages/cli/scripts/build-binary.ts` | 二进制文件构建脚本 |
| `ts/packages/cli/dist/composio` | 构建后的二进制文件输出 |
| `ts/packages/cli/src/effects/app-config.ts` | 环境变量配置解析 |
| `ts/packages/cli/src/constants.ts` | 默认和 staging URL |