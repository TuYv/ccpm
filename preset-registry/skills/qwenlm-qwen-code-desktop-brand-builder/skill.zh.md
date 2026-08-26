---
name: desktop-brand-builder
description: Generate a branded qwen-code desktop package from a minimal brandId and logo. Use when the user wants a custom, white-label, rebranded, ModelStudio/OpenWork/Qwen Code desktop client, installer, DMG/EXE/AppImage, or one-click brand build.
---
# 桌面品牌构建器

## 目标

以尽可能少的用户输入创建品牌化桌面软件包。用户通常只需提供：

```text
brandId: acme-ai
logo: /absolute/path/to/logo.png
website: https://acme.ai
```

`website` 是可选的。除非用户明确要求覆盖，否则不要询问应用名称、应用 id、制品名称、版权信息、Dock 图标、渲染器符号、签名或本地安装。

## 输入规则

必填字段：

- `brandId`：必须匹配 `^[a-z][a-z0-9-]*$`
- `logo`：本地文件路径；文件必须存在

可选覆盖项：

- `website`
- `appName`
- `appId`
- `artifactPrefix`
- `target`：`mac`、`win`、`linux` 或 `all`

如果缺少必填输入，只询问一次：

```text
请提供：
brandId: 例如 acme-ai，只能小写字母、数字、短横线
logo: 本地 logo 文件路径
website: 可选
```

必填字段齐全后，无需确认即可继续。

## 派生默认值

以确定性的方式推断缺失值：

- `appName`：将以短横线分隔的 `brandId` 转换为标题格式；`acme-ai` 变为
  `Acme AI`
- `artifactPrefix`：将以短横线分隔的 `brandId` 转换为标题格式，并使用短横线连接；`acme-ai` 变为
  `Acme-AI`
- `appId`：如果 `website` 包含有效主机名，则将主机名标签反转并追加
  `.desktop`；`https://acme.ai` 变为 `ai.acme.desktop`
- `appId` 的回退值：`app.<brandId>.desktop`
- `copyright`：`Copyright © <current year> <appName>`
- 所有品牌图像：根据 `logo` 生成图标、Dock 图标和渲染器符号

用户明确提供的覆盖值在通过基本验证后按原样使用。

## 构建工作流

在当前工作目录下使用隔离的构建目录，以免修改用户当前工作树中的更改。默认使用 qwen-code 的 main 分支；除非用户明确要求使用该来源，否则不要从 `craft-agents-oss`、OpenWork 或其他本地检出目录进行克隆：

```bash
BUILD_ROOT="$PWD/brand-builds/<brandId>-<timestamp>"
mkdir -p "$BUILD_ROOT"
git clone --branch main --single-branch \
  https://github.com/QwenLM/qwen-code.git \
  "$BUILD_ROOT/qwen-code"
cd "$BUILD_ROOT/qwen-code"
git checkout -B brand-<brandId> origin/main
```

如果分支获取或检出失败，则停止并报告失败。不要继续操作并假装 `brand-<brandId>` 已创建。

在构建目录中创建临时的 `brand.json`：

```json
{
  "brandId": "acme-ai",
  "logo": "/absolute/path/to/logo.png",
  "website": "https://acme.ai",
  "appName": "Acme AI",
  "appId": "ai.acme.desktop",
  "artifactPrefix": "Acme-AI",
  "copyright": "Copyright © 2026 Acme AI"
}
```

如果 `packages/desktop/node_modules` 不存在，则安装桌面依赖：

```bash
cd packages/desktop
bun install
```

然后运行此 skill 随附的品牌创建脚本：

```bash
cd /absolute/path/to/qwen-code
bun run packages/desktop/.agents/skills/desktop-brand-builder/scripts/brand-create.ts \
  --desktop-root /absolute/path/to/qwen-code/packages/desktop \
  --config /absolute/path/to/brand.json
```

当此随附脚本可用时，代理不应手动编辑 `branding.ts` 或品牌资源文件。随附脚本是修改代码和生成资源的事实来源。

除非用户请求了特定目标，否则使用当前主机目标进行打包：

```bash
CRAFT_BRAND=<brandId> bun run electron:dist:mac
CRAFT_BRAND=<brandId> bun run electron:dist:win
CRAFT_BRAND=<brandId> bun run electron:dist:linux
```

对于 `target: all`，仅运行当前机器或 CI
环境支持的目标。除非文件确实存在，否则不要声称已生成跨平台构件。

## 验证

打包后：

1. 确认预期构件存在于
   `packages/desktop/apps/electron/release/` 下。
2. 对每个构件计算 `sha256sum` 或 `shasum -a 256`。
3. 在 macOS 上，对生成的 DMG 文件运行 `hdiutil verify`。
4. 报告构件路径、SHA-256、应用名称、应用 id 和构建目录。

## 失败处理

- 无效的 `brandId`：显示正则表达式，并要求提供更正后的值。
- 缺少 `logo`：要求提供有效的本地路径。
- 缺少捆绑脚本：报告
  `packages/desktop/.agents/skills/desktop-brand-builder/scripts/brand-create.ts`
  缺失，并包含预期命令。
- 构建失败：保留构建目录，返回最后几行有用的错误信息，并包含完整日志路径或产生失败的命令。

失败时不要删除构建目录。