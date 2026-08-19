---
name: baoyu-electron-extract
description: Extracts resources and JavaScript from any installed Electron app (`.asar` bundle), restoring original sources from `.js.map` files when available or formatting minified code with Prettier otherwise. Use when user wants to "extract Electron app", "decompile Electron", "get the source code of <app>", "inspect app.asar", "看 Electron 应用源码", "提取 .asar", or asks how a desktop Electron app is built. Skips `node_modules` and supports both macOS and Windows.
version: 1.119.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-electron-extract
    requires:
      anyBins:
        - bun
        - npx
---
# Electron 应用提取

从已安装的 Electron 应用的 `app.asar` 中提取资源和代码。当存在 `.js.map` 时，从嵌入的 `sourcesContent` 中还原原始源文件；否则使用 Prettier 格式化压缩后的代码。源映射路径首先以 `.js.map` 文件为相对路径进行解析，因此像 `../../src/main.ts` 这样的打包路径会还原为 `restored/src/main.ts` 等可读路径，而不是哈希占位符。始终跳过 `node_modules`。支持 macOS 和 Windows。

## 用户输入工具

当此 skill 提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前 agent runtime 提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果没有此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用问题合并到一次调用中；如果仅支持单个问题，则按优先顺序逐个提问。

下面对 `AskUserQuestion` 的具体引用仅作为示例——在其他 runtime 中请替换为本地等效工具。

## 脚本目录

脚本位于 `scripts/` 子目录中。`{baseDir}` = 此 SKILL.md 的目录路径。解析 `${BUN_X}` runtime：如果已安装 `bun` → 使用 `bun`；如果 `npx` 可用 → 使用 `npx -y bun`；否则建议安装 bun。将 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| 脚本            | 用途                                             |
| --------------- | ------------------------------------------------ |
| `scripts/main.ts` | 应用发现 + asar 提取 + source-map 还原 + Prettier 格式化 |

## 使用时机

当用户希望查看已安装的 Electron 应用内部内容或检查其打包代码时，使用此 skill。触发短语包括：

- “提取 Electron 应用”、“反编译这个 Electron 应用”、“解包 app.asar”
- “展示 <app> 的源代码”、“查看 <app> 内部”、“<app> 是如何构建的”
- “获取 Codex / Cursor / Discord / Slack / VS Code / Notion / Obsidian / ChatGPT 桌面版的源代码”
- “提取 Electron 应用”、“查看 <app> 的源码”、“反编译 Electron”、“解包 app.asar”、“还原 source map”

`app name`（例如 `Codex`）和 `absolute path`（例如 `/Applications/Codex.app`、`.asar` 文件或 Windows 安装目录）均可接受。该脚本支持在两个平台上进行发现。

## 工作流程

**1. 确定输入。** 如果用户尚未提供应用名称或路径，请向其询问。如果用户希望使用自定义输出目录，也请一并询问。

**2. 运行脚本。**

```bash
${BUN_X} {baseDir}/scripts/main.ts "<app>" [--output <dir>] [--asar <path>] [--force]
```

如果不确定发现机制是否能找到正确的 bundle，请先使用 `--dry-run`；它会打印解析后的路径，并退出且不会修改文件系统。

**3. 处理结果。**

- **成功** → 报告输出路径以及数量统计（已提取 / 已还原 / 已格式化）。
- **多个匹配项** → 脚本会列出候选项并以非零状态退出。向用户展示候选项，询问要使用哪一个（通过 `AskUserQuestion` 或 runtime 中的等效工具），然后使用选定的绝对路径重新运行。
- **现有的非空输出目录** → 如果没有使用 `--force`，脚本会拒绝执行。询问用户是要覆盖（使用 `--force`），还是选择新的 `--output` 路径。
- **不支持的平台 / 没有匹配项** → 如果用户知道 bundle 所在位置，建议传入 `--asar /full/path/to/app.asar`。

**4. 将用户引导至结果。** 默认输出目录为 `~/Downloads/<AppName>-electron-extract/`。最值得关注的子目录取决于找到的内容：

- 存在 `restored/` → 已从 `.js.map` 文件重建原始源码树；应优先阅读这里的内容。
- 仅存在 `extracted/`（没有映射文件）→ `extracted/` 中的 JS/CSS 已就地使用 Prettier 格式化；请从这里开始阅读。

## 源映射路径还原

脚本应尽可能根据源映射保留原始源文件名和目录结构：

- 在存在 `sourceRoot` 时，使用它解析每个 `sources[]` 条目；否则相对于 `extracted/` 内 `.js.map` 文件所在目录解析。
- 将常规的打包器相对路径折叠到还原后的项目树中。例如，`.vite/main/index.js.map` + `../../src/main.ts` 会变为 `restored/src/main.ts`。
- 如果源路径向上越过了 `extracted/`，则将剩余的可读路径保留在 `restored/` 下，而不是进行哈希处理。例如，`.vite/main/index.js.map` + `../../../shared/src/lib/foo.ts` 会变为 `restored/shared/src/lib/foo.ts`。
- 从源名称中移除 URL/查询装饰，包括常见的 `webpack://`、`file://` 以及 `?loader` 后缀。
- 仅当源名称为空或无法转换为安全文件路径时，才使用 `restored/__unknown/<hash>.<ext>`。
- 继续跳过 `node_modules` 和 `webpack/runtime/*` 条目；它们是打包器/运行时噪声，并非应用源码。

## 用法

```bash
# 按应用名称提取（默认输出：~/Downloads/Codex-electron-extract/）
${BUN_X} {baseDir}/scripts/main.ts Codex

# 按绝对路径提取（适用于 .app 包、安装目录或 .asar 文件）
${BUN_X} {baseDir}/scripts/main.ts "/Applications/Visual Studio Code.app"
${BUN_X} {baseDir}/scripts/main.ts "C:\Users\you\AppData\Local\Programs\codex"
${BUN_X} {baseDir}/scripts/main.ts --asar /Applications/Codex.app/Contents/Resources/app.asar Codex

# 自定义输出
${BUN_X} {baseDir}/scripts/main.ts Codex --output ~/work/codex-source

# 仅预览发现结果，不写入任何内容
${BUN_X} {baseDir}/scripts/main.ts Codex --dry-run

# 覆盖现有输出目录
${BUN_X} {baseDir}/scripts/main.ts Codex --force

# 机器可读结果（stdout 上的一行 JSON）
${BUN_X} {baseDir}/scripts/main.ts Codex --json
```

## 选项

| 选项             | 简写  | 描述                                                            | 默认值                                   |
| ---------------- | ----- | --------------------------------------------------------------- | ---------------------------------------- |
| `<app>`          |       | 应用名称或绝对路径。除非提供了 `--asar`，否则必填。             | —                                        |
| `--output`       | `-o`  | 输出目录                                                        | `~/Downloads/<AppName>-electron-extract` |
| `--asar`         |       | 覆盖已解析的 `.asar` 路径                                       | 自动发现                                 |
| `--force`        | `-f`  | 允许写入非空的现有输出目录                                      | false                                    |
| `--skip-format`  |       | 跳过 Prettier 格式化                                            | false                                    |
| `--skip-restore` |       | 跳过源映射还原                                                  | false                                    |
| `--no-unpacked`  |       | 不复制一同存在的 `app.asar.unpacked/`                           | false                                    |
| `--dry-run`      |       | 打印已解析路径并退出，不进行写入                                | false                                    |
| `--json`         |       | 在 stdout 输出一行 JSON 摘要（抑制常规输出）                    | false                                    |

## 输出布局

```
~/Downloads/<AppName>-electron-extract/
├── extract-report.json          # JSON summary: counts, warnings, resolved paths
├── extracted/                   # raw asar contents (JS/CSS Prettier-formatted when no map)
│   └── ...                      # node_modules left untouched (skipped from format)
├── extracted.unpacked/          # copied from <asar>.unpacked/ if present
│   └── ...                      # native modules (.node), large assets
└── restored/                    # only present if at least one .js.map was usable
    └── <original/source/tree>   # rebuilt from sourcesContent in each .js.map
```

## 注意事项

- **node_modules** 始终跳过——源映射还原和 Prettier 格式化均会跳过它，因为在检查应用时，随附的依赖会造成干扰。
- **源映射还原**仅在 `.js.map` 内嵌了 `sourcesContent` 时有效。这是现代打包工具（webpack、esbuild、Vite、rollup）的常见情况。如果映射引用了外部 `.ts`/`.js` 文件但未将其内嵌，则会跳过该映射，并改为对对应的 `.js` 执行 Prettier 格式化。被跳过的映射会列在 `extract-report.json` 的 `warnings` 下。
- **优先使用可读路径而不是哈希值**——不要将源映射路径中的 `../` 片段自动视为不安全。应先根据映射位置解析这些路径，然后清理最终输出路径，确保其仍位于 `restored/` 下。只有在源名称不可用时才使用哈希回退。
- **应用发现**会在 macOS 上搜索 `/Applications` + `~/Applications`，在 Windows 上搜索 `%LOCALAPPDATA%\Programs`、`%PROGRAMFILES%`、`%PROGRAMFILES(X86)%`、`%APPDATA%`。如果发现多个匹配项，脚本会退出并列出这些匹配项——请使用绝对路径重新运行。在 Linux 或其他平台上，请显式传入 `--asar /path/to/app.asar`。
- **安全性**——脚本拒绝写入 `/`、用户主目录本身或当前工作目录；如果输出目录已存在且非空，未指定 `--force` 时也会拒绝填充该目录。
- **不进行全局安装**——`@electron/asar` 和 `prettier` 会通过 `npx -y` 按需解析。首次运行速度会较慢，因为 `npx` 需要缓存它们。