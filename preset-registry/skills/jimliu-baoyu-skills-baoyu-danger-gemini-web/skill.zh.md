---
name: baoyu-danger-gemini-web
description: Generates images and text via reverse-engineered Gemini Web API. Supports text generation, image generation from prompts, reference images for vision input, and multi-turn conversations. Use when other skills need image generation backend, or when user requests "generate image with Gemini", "Gemini text generation", or needs vision-capable AI generation.
version: 1.56.2
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-danger-gemini-web
    requires:
      anyBins:
        - bun
        - npx
---
# Gemini Web 客户端

通过 Gemini Web API 进行文本/图像生成。支持参考图像和多轮对话。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前代理运行时提供的内置用户输入工具 — 例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果没有此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用问题合并到一次调用中；如果仅支持单个问题，则按照优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅作为示例 — 在其他运行时中请替换为本地等效工具。

## 脚本目录

**重要**：所有脚本都位于此技能的 `scripts/` 子目录中。

**代理执行说明**：
1. 将此 SKILL.md 文件所在的目录路径确定为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun
4. 将本文档中的所有 `{baseDir}` 和 `${BUN_X}` 替换为实际值

**脚本参考**：
| 脚本 | 用途 |
|--------|---------|
| `scripts/main.ts` | 文本/图像生成的 CLI 入口点 |
| `scripts/gemini-webapi/*` | `gemini_webapi` 的 TypeScript 移植版（GeminiClient、types、utils） |

## 同意检查（必需）

首次使用前，确认用户是否同意使用逆向工程 API。

**同意文件位置**：
- macOS: `~/Library/Application Support/baoyu-skills/gemini-web/consent.json`
- Linux: `~/.local/share/baoyu-skills/gemini-web/consent.json`
- Windows: `%APPDATA%\baoyu-skills\gemini-web\consent.json`

**流程**：
1. 检查同意文件是否存在，并确认其中包含 `accepted: true` 和 `disclaimerVersion: "1.0"`
2. 如果存在有效同意 → 输出包含 `acceptedAt` 日期的警告，然后继续
3. 如果没有同意 → 显示免责声明，并通过 `AskUserQuestion` 询问用户：
   - “是，我接受” → 使用 ISO 时间戳创建同意文件，然后继续
   - “否，我拒绝” → 输出拒绝消息，然后停止
4. 同意文件格式：`{"version":1,"accepted":true,"acceptedAt":"<ISO>","disclaimerVersion":"1.0"}`

---

## 偏好设置（EXTEND.md）

按照优先级顺序检查 EXTEND.md — 使用找到的第一个文件：

| 优先级 | 路径 | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | 用户主目录 |

如果未找到任何文件，则使用默认设置。

**EXTEND.md 支持**：默认模型、代理设置、自定义数据目录。

## 用法

```bash
# Text generation
${BUN_X} {baseDir}/scripts/main.ts "Your prompt"
${BUN_X} {baseDir}/scripts/main.ts --prompt "Your prompt" --model gemini-3-flash

# Image generation
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cute cat" --image cat.png
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# Vision input (reference images)
${BUN_X} {baseDir}/scripts/main.ts --prompt "Describe this" --reference image.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "Create variation" --reference a.png --image out.png

# Multi-turn conversation
${BUN_X} {baseDir}/scripts/main.ts "Remember: 42" --sessionId session-abc
${BUN_X} {baseDir}/scripts/main.ts "What number?" --sessionId session-abc

# JSON output
${BUN_X} {baseDir}/scripts/main.ts "Hello" --json
```

## 选项

| 选项 | 描述 |
|--------|-------------|
| `--prompt`, `-p` | 提示文本 |
| `--promptfiles` | 从文件中读取提示（拼接后使用） |
| `--model`, `-m` | 模型：gemini-3-pro（默认）、gemini-3-flash、gemini-3-flash-thinking、gemini-3.1-pro-preview |
| `--image [path]` | 生成图像（默认：generated.png） |
| `--reference`, `--ref` | 用于视觉输入的参考图像 |
| `--sessionId` | 多轮对话的会话 ID |
| `--list-sessions` | 列出已保存的会话 |
| `--json` | 以 JSON 格式输出 |
| `--login` | 刷新 Cookie，然后退出 |
| `--cookie-path` | 自定义 Cookie 文件路径 |
| `--profile-dir` | Chrome 配置文件目录 |

## 模型

| 模型 | 描述 |
|-------|-------------|
| `gemini-3-pro` | 默认，最新的 3.0 Pro |
| `gemini-3-flash` | 快速、轻量的 3.0 Flash |
| `gemini-3-flash-thinking` | 支持思考的 3.0 Flash |
| `gemini-3.1-pro-preview` | 3.1 Pro 预览版（空标头，自动路由） |

## 身份验证

首次运行时会打开浏览器进行 Google 身份验证。Cookie 会自动缓存。

未设置显式配置文件目录时，Cookie 刷新可能会复用已运行的本地 Chrome/Chromium 调试会话，该会话与标准用户数据目录关联。
设置 `--profile-dir` 或 `GEMINI_WEB_CHROME_PROFILE_DIR` 可强制使用专用配置文件，并跳过已有会话复用。
这是尽力而为的 CDP 会话复用途径，并非 Chrome 官方文档中所述的基于 Chrome DevTools MCP 提示的 `--autoConnect` 流程。

支持的浏览器（自动检测）：Chrome、Chrome Canary/Beta、Chromium、Edge。

强制刷新：`--login` 标志。覆盖浏览器：`GEMINI_WEB_CHROME_PATH` 环境变量。

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `GEMINI_WEB_DATA_DIR` | 数据目录 |
| `GEMINI_WEB_COOKIE_PATH` | Cookie 文件路径 |
| `GEMINI_WEB_CHROME_PROFILE_DIR` | Chrome 配置文件目录 |
| `GEMINI_WEB_CHROME_PATH` | Chrome 可执行文件路径 |
| `HTTP_PROXY`, `HTTPS_PROXY` | 访问 Google 的代理（以内联方式随命令设置） |

## 会话

会话文件存储在数据目录下的 `sessions/<id>.json` 中。

包含：`id`、`metadata`（Gemini 聊天状态）、`messages` 数组、时间戳。

## 扩展支持

通过 EXTEND.md 使用自定义配置。有关路径和支持的选项，请参阅**偏好设置**部分。