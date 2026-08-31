---
name: desktop-brand-builder
description: Generate a branded Qwen Code desktop package from the Tauri desktop shell using a minimal brandId and logo. Use when the user wants a custom, white-label, or rebranded desktop client, installer, DMG/EXE/AppImage/deb, or one-click brand build on top of packages/desktop-shell.
---
# 桌面品牌构建器（Tauri shell）

## 目标

使用最少的用户输入，从 `packages/desktop-shell` 创建品牌化桌面包。用户通常只需提供：

```text
brandId: acme-ai
logo: /absolute/path/to/logo.png
website: https://acme.ai
```

`website` 是可选的。除非用户明确要求覆盖，否则不要询问应用名称、应用 ID、构件名称、版权信息或更新器端点。

此技能取代了原先位于已移除的 `packages/desktop` 中、基于 Electron 的品牌构建器。现在 Tauri shell 是唯一的桌面实现；品牌化挂钩位于 `src-tauri/tauri.conf.json`、`src-tauri/icons/` 和 `bootstrap/` 启动 UI 中。

## 输入规则

必填字段：

- `brandId`：必须匹配 `^[a-z][a-z0-9-]*$`
- `logo`：本地文件路径；文件必须存在；建议使用 `.png`（正方形，>= 1024px）

可选覆盖项：

- `website`
- `appName`
- `appId`（Tauri bundle identifier）
- `artifactPrefix`
- `updaterEndpoints`（JSON array；空数组会禁用应用内更新）
- `updaterPubkey`（base64 public key；当 `updaterEndpoints` 非空时**必填**——必须与用于签署更新构件的 `TAURI_SIGNING_PRIVATE_KEY` 匹配）
- `target`：`mac`、`win`、`linux` 或 `all`

如果缺少必填输入，只询问一次：

```text
请提供：
brandId: 例如 acme-ai，只能小写字母、数字、短横线
logo: 本地 logo 文件路径（建议 1024x1024 PNG）
website: 可选
```

必填字段齐全后，直接继续，无需确认步骤。

## 派生默认值

以确定性的方式推断缺失值：

- `appName`：将以短横线分隔的 `brandId` 转换为标题格式；`acme-ai` 变为 `Acme AI`
- `artifactPrefix`：将以短横线分隔的 `brandId` 转换为标题格式，并使用短横线连接；`acme-ai` 变为 `Acme-AI`
- `appId`：如果 `website` 包含有效主机名，则将主机名标签反转并追加 `.desktop`；`https://acme.ai` 变为 `ai.acme.desktop`
- `appId` 回退值：`app.<brandId>.desktop`
- `updaterEndpoints`：默认为空。品牌化构建绝不能轮询官方 Qwen Code 更新器 feed，官方 feed 也绝不能更新品牌化构建。只有在用户提供自己的 feed 时才设置端点。

## 工作流

在隔离的构建克隆中操作，以保持工作仓库干净：

```bash
BUILD_ROOT="$PWD/brand-builds/<brandId>-<timestamp>"
mkdir -p "$BUILD_ROOT"
git clone --branch main --single-branch \
  https://github.com/QwenLM/qwen-code.git \
  "$BUILD_ROOT/qwen-code"
cd "$BUILD_ROOT/qwen-code"
git checkout -B brand-<brandId> origin/main
```

如果克隆或 checkout 失败，则停止并报告失败。不要假装 `brand-<brandId>` 已创建后继续操作。

在构建目录中创建临时的 `brand.json`：

```json
{
  "brandId": "acme-ai",
  "logo": "/absolute/path/to/logo.png",
  "website": "https://acme.ai",
  "appName": "Acme AI",
  "appId": "ai.acme.desktop",
  "artifactPrefix": "Acme-AI",
  "updaterEndpoints": [],
  "updaterPubkey": ""
}
```

安装依赖项。品牌脚本本身只需要 desktop-shell 自己的 `node_modules`，但 `npm run build:runtime` 会调用仓库根目录中的命令（该目录使用 `cross-env` 和其他根目录 devDependencies），因此打包前也必须安装根目录依赖：

```bash
# Root dependencies (needed by build:runtime → cross-env, esbuild, etc.)
npm install

# Desktop-shell dependencies
cd packages/desktop-shell
npm install --workspaces=false
cd ../..
```

然后使用普通 Node 运行此 skill 捆绑的品牌创建脚本（该脚本除 Node >= 18 外没有其他依赖）：

```bash
node packages/desktop-shell/.agents/skills/desktop-brand-builder/scripts/brand-create.mjs \
  --shell-root /absolute/path/to/qwen-code/packages/desktop-shell \
  --config /absolute/path/to/brand.json
```

当此捆绑脚本可用时，代理不应手动编辑 `tauri.conf.json`、图标文件或 bootstrap
品牌字符串。捆绑脚本是修改配置和生成资源的事实来源。

该脚本的操作如下：

1. 修改 `src-tauri/tauri.conf.json`：`productName`、`identifier`、
   `bundle.shortDescription` 和 `plugins.updater.endpoints`。当
   `updaterEndpoints` 为空时，它还会清除 `bundle.createUpdaterArtifacts`，
   并将官方的 `plugins.updater.pubkey` 置空（设置为空字符串而不是删除，因为
   updater 插件要求该字段存在）；提供自有 feed 的品牌必须提供自有 pubkey。
2. 通过 `npx --yes @tauri-apps/cli icon <logo>` 根据 logo 重新生成完整的图标集（如果
   CLI 无法运行，则退回为发出警告；此时手动将 logo 复制到
   `src-tauri/icons/icon.png`，并告知用户其余尺寸已过时）。
3. 修改 bootstrap UI：页面标题、品牌标题、`bootstrap/index.html` 和
   `bootstrap/bootstrap.js` 中的启动字符串，并将
   `bootstrap/qwen-code-logo.svg` 的使用替换为品牌 logo。

使用当前主机目标进行打包，除非用户指定了目标：

```bash
cd packages/desktop-shell
npm run build:runtime --workspaces=false
npx tauri build            # current platform
```

**交叉编译：**`build:runtime` 会为 `QWEN_DESKTOP_TARGET` 指定的平台打包 Node
运行时（默认为主机平台）。当目标平台不同时，你**必须**在每次执行
`tauri build --target` 之前设置环境变量并重新运行 `build:runtime`，否则打包产物会包含
错误架构的 Node 二进制文件，并在启动时因 exec format error 而失败：

```bash
# Cross-compile: set QWEN_DESKTOP_TARGET and re-run build:runtime per target
QWEN_DESKTOP_TARGET=aarch64-apple-darwin npm run build:runtime --workspaces=false
npx tauri build --target aarch64-apple-darwin   # explicit macOS arm64
```

对于 `target: all`，逐个目标执行 `build:runtime` → `tauri build`；仅运行当前机器或 CI
环境支持的目标。除非文件确实存在，否则不要声称已生成跨平台产物。
对于主机目标，产物位于
`packages/desktop-shell/src-tauri/target/release/bundle/`；使用
`--target <triple>` 时，产物位于
`src-tauri/target/<triple>/release/bundle/`。

## 签名和更新

品牌构建默认未签名。上游发布流水线的签名密钥（Apple、Windows）和更新器私钥仅属于
官方 Qwen Code 发布版本。对于需要签名发布或应用内更新的品牌，应设置单独的凭据和单独的
更新 feed；不要重复使用上游凭据。

要为更新器 feed 生成签名密钥对：

```bash
npx @tauri-apps/cli signer generate -w ~/.tauri/my-brand.key
# The .key file is the private key (set as TAURI_SIGNING_PRIVATE_KEY in
# your build CI). The corresponding .pub file contains the base64 public
# key — paste it into brand.json as updaterPubkey.
```

## 验证

打包后：

1. 确认预期的构件存在于
   `packages/desktop-shell/src-tauri/target/release/bundle/`
   （对于交叉编译目标，则位于 `src-tauri/target/<triple>/release/bundle/`）
   （`dmg/`、`nsis/`、`appimage/` 或 `deb/`）。
2. 对每个构件计算 `sha256sum` 或 `shasum -a 256`。
3. 在 macOS 上，对生成的 DMG 文件运行 `hdiutil verify`。
4. 报告构件路径、SHA-256、应用名称、应用 ID 和构建目录。

## 失败处理

- 无效的 `brandId`：显示正则表达式，并要求提供修正后的值。
- 缺少 `logo`：要求提供有效的本地路径。
- 缺少打包脚本：报告缺少
  `packages/desktop-shell/.agents/skills/desktop-brand-builder/scripts/brand-create.mjs`，
  并附上预期的命令。
- 已完成品牌化的 shell 根目录：当 `productName` 不再是默认值（`Qwen Code Desktop`）时，脚本会拒绝运行。从全新克隆开始——不要在已经打过补丁的目录中重新运行脚本。
- 构建失败：保留构建目录，返回最后几行有用的错误信息，并附上完整日志路径或生成失败的命令。

失败时不要删除构建目录。**绝不要在同一个克隆目录中重新运行 `brand-create`**——该脚本只能运行一次。“保留构建目录”的指导是为了事后调试，而不是为了重试品牌化步骤。如果品牌配置有误，请丢弃该克隆并重新开始。