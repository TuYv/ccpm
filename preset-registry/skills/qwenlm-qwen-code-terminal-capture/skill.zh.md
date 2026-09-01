---
name: terminal-capture
description: Automates terminal UI screenshot testing for CLI commands. Applies
  when reviewing PRs that affect CLI output, testing slash commands (/about,
  /context, /auth, /export), generating visual documentation, or when 'terminal
  screenshot', 'CLI test', 'visual test', or 'terminal-capture' is mentioned.
---
# Terminal Capture — CLI 终端截图自动化

通过 TypeScript 配置驱动终端交互和截图，用于 PR 审查期间的视觉验证。

## 前置条件

运行前请确保已安装以下依赖：

```bash
npm install       # Install project dependencies.
npx playwright install chromium   # Install Playwright browser (skip in CI: see note below)
```

> **CI / verify context:** 当设置了 `QWEN_VERIFY_CHROMIUM=1` 时，浏览器已安装，并且 `PLAYWRIGHT_BROWSERS_PATH` 已指向该浏览器。请勿运行 `playwright install` — 该命令会下载约 170 MB 的内容，并且会因代理用户无法安装系统依赖而失败。

## 架构

```
node-pty (pseudo-terminal)
  → ANSI byte stream
  → xterm.js (Playwright headless)
  → Screenshot
```

核心文件：

- `integration-tests/terminal-capture/terminal-capture.ts`
  底层 PTY、xterm.js 和 Playwright 引擎。
- `integration-tests/terminal-capture/scenario-runner.ts`
  负责配置、交互和截图的场景执行器。
- `integration-tests/terminal-capture/run.ts`
  批量运行场景的 CLI 入口。
- `integration-tests/terminal-capture/scenarios/*.ts`
  场景配置文件。

## 快速开始

### 1. 编写场景配置

在 `integration-tests/terminal-capture/scenarios/` 下创建一个 `.ts` 文件：

```typescript
import type { ScenarioConfig } from '../scenario-runner.js';

export default {
  name: '/about',
  spawn: ['node', 'dist/cli.js', '--yolo'],
  // cwd is relative to this config file's location.
  terminal: { title: 'qwen-code', cwd: '../../..' },
  flow: [
    { type: 'Hi, can you help me understand this codebase?' },
    { type: '/about' },
  ],
} satisfies ScenarioConfig;
```

### 2. 运行

```bash
# Single scenario
npx tsx integration-tests/terminal-capture/run.ts \
  integration-tests/terminal-capture/scenarios/about.ts

# Batch (entire directory)
npx tsx integration-tests/terminal-capture/run.ts \
  integration-tests/terminal-capture/scenarios/
```

### 3. 输出

截图将保存到
`integration-tests/terminal-capture/scenarios/screenshots/{name}/`：

| 文件            | 描述                     |
| --------------- | ------------------------ |
| `01-01.png`     | 步骤 1 输入状态          |
| `01-02.png`     | 步骤 1 执行结果          |
| `02-01.png`     | 步骤 2 输入状态          |
| `02-02.png`     | 步骤 2 执行结果          |
| `full-flow.png` | 最终状态的全长度截图     |

## FlowStep API

每个流程步骤可以包含以下字段：

### `type: string` — 输入文本

自动行为：  
输入文本 → 截图 (01) → Enter → 稳定输出 → 截图 (02)。

```typescript
{
  type: 'Hello';
} // Plain text
{
  type: '/about';
} // Slash command (auto-completion handled automatically)
```

**特殊规则**：如果下一步是 `key`，则不要自动按下 Enter（将控制权交给按键序列）。

### `key: string | string[]` — 发送按键

用于菜单选择、Tab 补全和其他交互。不
会自动按下 Enter，也不会自动截取屏幕截图。

支持的按键名称：`ArrowUp`、`ArrowDown`、`ArrowLeft`、`ArrowRight`、`Enter`、
`Tab`、`Escape`、`Backspace`、`Space`、`Home`、`End`、`PageUp`、`PageDown`、
`Delete`

```typescript
{
  key: 'ArrowDown';
} // Single key
{
  key: ['ArrowDown', 'ArrowDown', 'Enter'];
} // Multiple keys
```

按键序列结束后会触发自动截屏（即下一步不是
`key` 时）。

### `streaming` — 执行期间捕获

在长时间运行的输出期间（例如进度条），按时间间隔捕获多张屏幕截图。还可以选择生成动画 GIF。

```typescript
{
  type: 'Run this command: bash progress.sh',
  streaming: {
    delayMs: 7000,    // Wait before first capture (skip initial waiting phase)
    intervalMs: 500,  // Interval between captures
    count: 20,        // Maximum number of captures
    gif: true,        // Generate animated GIF (default: true, requires ffmpeg)
  },
}
```

- `delayMs`（可选）：按下 Enter 后等待的毫秒数，然后开始捕获。适用于跳过模型思考/审批时间。
- 如果连续 3 个时间间隔内终端输出都没有变化，捕获会提前停止。
- 重复帧（输出没有变化）会自动跳过。

**GIF 前置条件**：如果场景使用启用 GIF 的
`streaming`（默认启用），运行前检查是否已安装 `ffmpeg`。如果未安装，询问用户是否要安装：

```bash
# Check
which ffmpeg

# Install (macOS)
brew install ffmpeg
```

如果用户拒绝，场景仍会运行。GIF 生成会被跳过，并显示警告。

### `capture` / `captureFull` — 显式截屏

可作为独立步骤使用，也可以覆盖自动命名：

```typescript
{
  capture: 'initial.png';
} // Screenshot current viewport only
{
  captureFull: 'all-output.png';
} // Screenshot full scrollback buffer
```

## 场景示例

### 基本示例：输入 + 命令

```typescript
flow: [{ type: 'explain this project' }, { type: '/about' }];
```

### 次级菜单选择（/auth）

```typescript
flow: [
  { type: '/auth' },
  { key: 'ArrowDown' }, // Select API Key option
  { key: 'Enter' }, // Confirm
  { type: 'sk-xxx' }, // Input API key
];
```

### Tab 补全选择（/export）

```typescript
flow: [
  { type: 'Tell me about yourself' },
  { type: '/export' }, // No auto-Enter (next step is key)
  { key: 'Tab' }, // Pop format selection
  { key: 'ArrowDown' }, // Select format
  { key: 'Enter' }, // Confirm → auto-screenshot
];
```

### 数组批处理（一个文件中的多个场景）

```typescript
export default [
  { name: '/about', spawn: [...], flow: [...] },
  { name: '/context', spawn: [...], flow: [...] },
] satisfies ScenarioConfig[];
```

## 与 PR Review 集成

此工具通常用于 PR Review 期间的视觉验证。

## 故障排除

- Playwright 错误 `browser not found`
  原因：未安装浏览器。
  解决方案：`npx playwright install chromium`（仅限本地开发 — 在 CI 验证运行中，这意味着预安装步骤失败；请报告该问题，不要安装）。
- 屏幕截图为空白
  原因：进程启动缓慢或构建失败。
  解决方案：检查构建是否成功以及 spawn 命令。
- PTY 相关错误
  原因：node-pty 原生模块未编译。
  解决方案：`npm rebuild node-pty`。
- 屏幕截图输出不稳定
  原因：终端输出尚未完全渲染。
  解决方案：增加场景等待时间。

## 完整的 ScenarioConfig 类型

```typescript
interface FlowStep {
  type?: string; // Input text
  key?: string | string[]; // Key press(es)
  capture?: string; // Viewport screenshot filename
  captureFull?: string; // Full scrollback screenshot filename
  streaming?: {
    delayMs?: number; // Delay before first capture (default: 0)
    intervalMs: number; // Interval between captures in ms
    count: number; // Maximum number of captures
    gif?: boolean; // Generate animated GIF (default: true)
  };
}

interface ScenarioConfig {
  name: string; // Scenario name (also used as screenshot subdirectory name)
  spawn: string[]; // Launch command ["node", "dist/cli.js", "--yolo"]
  flow: FlowStep[]; // Interaction steps
  terminal?: {
    cols?: number; // Number of columns, default 100
    rows?: number; // Number of rows, default 28
    theme?: string; // Theme: dracula|one-dark|github-dark|monokai|night-owl
    chrome?: boolean; // macOS window decorations, default true
    title?: string; // Window title, default "Terminal"
    fontSize?: number; // Font size
    cwd?: string; // Working directory (relative to config file)
  };
  outputDir?: string; // Screenshot output directory (relative to config file)
}
```