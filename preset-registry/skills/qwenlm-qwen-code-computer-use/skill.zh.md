---
name: computer-use
description: Control local desktop applications through Computer Use for tasks that require reading or operating app UI. Prefer purpose-built connectors, APIs, or CLIs when available.
---
## `node_repl` + `@qwen-code/cua-sdk`（计算机操作）

- 所有计算机操作均使用 `node_repl`（JavaScript）。
- 除非用户明确要求，否则不要使用 `node_repl` 以外的其他技术进行计算机交互。这包括 AppleScript、
  `osascript`、JXA、System Events 和合成输入。
- 如果专用插件或技能可以完成任务，优先使用专用插件或技能；对于没有通过更具体接口暴露的应用程序交互，再使用计算机操作。
- 仅使用类型化的 `ComputerUse` API。不要使用通用 SDK `callTool`、直接导入 `CuaDriver` 或 Qwen 全局桥接。
- `node_repl` 状态会在各次调用之间持续存在。
- 使用 `nodeRepl.write(...)` 输出文本。它接收字符串，因此请使用 `JSON.stringify(...)` 包装对象。

## 自动安装

运行 `qwen mcp list`，检查是否已配置 `node-repl` 服务器。如果尚未配置，请自行运行以下两个命令：

```bash
qwen mcp add --scope user node-repl npx -y @qwen-code/node-repl-mcp@0.1.0
npm install --no-save --package-lock=false @qwen-code/cua-sdk@0.20.0
```

添加 MCP 服务器后，告知用户重启 Qwen Code，然后停止。不要要求用户复制或运行这些命令。

如果 `node_repl` 可用，但 SDK 导入失败，请在当前工作区中自行运行 SDK 安装命令，然后重试导入：

```bash
npm install --no-save --package-lock=false @qwen-code/cua-sdk@0.20.0
```

## 引导初始化

每个全新的 `node_repl` 内核中导入一次 SDK：

```js
globalThis.computer = await (
  await import('@qwen-code/cua-sdk/computer-use')
).ComputerUse.create();
```

## API 接口

```ts
type WindowTarget = { pid: number; windowId: number };
type ElementTarget = {
  pid: number;
  windowId?: number;
  elementToken: string;
};
type CoordinateTarget = WindowTarget & { x: number; y: number };
type PointOrElementTarget = CoordinateTarget | ElementTarget;
type App = {
  name?: string;
  bundle_id?: string;
  pid?: number;
  running?: boolean;
  launch_path?: string;
};
type Window = {
  window_id: number;
  title?: string;
  is_on_screen?: boolean;
  on_current_space?: boolean;
};
type Element = {
  element_token?: string;
  role?: string;
  label?: string;
  value?: unknown;
  actions?: string[];
};

type ComputerUse = {
  listApps: () => Promise<App[]>;
  listWindows: (args?: {
    pid?: number;
    onScreenOnly?: boolean;
  }) => Promise<Window[]>;
  observeWindow: (
    args: WindowTarget & {
      baseRevisionId?: string;
      forceFull?: boolean;
      includeScreenshot?: boolean;
    },
  ) => Promise<{
    text: string;
    elements: Element[];
    revisionId?: string;
    screenshot?: { images: object[] };
  }>;
  click: (
    args: PointOrElementTarget & {
      button?: 'left' | 'right' | 'middle';
      count?: number;
    },
  ) => Promise<object>;
  doubleClick: (args: PointOrElementTarget) => Promise<object>;
  rightClick: (args: PointOrElementTarget) => Promise<object>;
  setValue: (args: ElementTarget & { value: string }) => Promise<object>;
  typeText: (args: WindowTarget & { text: string }) => Promise<object>;
  pressKey: (args: WindowTarget & { key: string }) => Promise<object>;
  hotkey: (args: WindowTarget & { keys: string[] }) => Promise<object>;
  scroll: (
    args: PointOrElementTarget & {
      direction: 'up' | 'down' | 'left' | 'right';
      by?: 'line' | 'page';
      amount?: number;
    },
  ) => Promise<object>;
  drag: (
    args: WindowTarget & {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      deliveryMode?: 'background' | 'foreground';
    },
  ) => Promise<object>;
  performSecondaryAction: (
    args: ElementTarget & { action: string },
  ) => Promise<object>;
  close: () => Promise<void>;
};
```

## 工作流

### 1. 初始化

解析任务中指定的确切运行中应用程序和窗口名称。在 `node_repl` 内进行筛选；不要打印完整的应用程序列表：

```js
var apps = await computer.listApps();
var matches = apps.filter(
  (app) => app.name === 'Target App' || app.bundle_id === 'com.example.target',
);
nodeRepl.write(JSON.stringify(matches));
```

从返回的元数据中选择应用程序后，仅列出其窗口：

```js
var pid = matches[0].pid;
var windows = await computer.listWindows({ pid });
nodeRepl.write(JSON.stringify(windows));
```

从返回的元数据中选择窗口，然后获取其当前的辅助功能状态：

```js
var target = { pid, windowId: windows[0].window_id };
var state = await computer.observeWindow({ ...target, forceFull: true });
nodeRepl.write(state.text);
```

绝不要猜测 PID、窗口 ID、坐标或元素令牌。`ComputerUse` 可以发现正在运行的应用程序，但不会启动应用程序；如有必要，可从 `node_repl` 使用普通的 Node.js 进程 API 启动应用程序，然后刷新应用程序和窗口列表。

### 2. 执行操作并获取最新状态

仅选择完成用户任务所需的操作。优先使用当前的 `element_token` 值，而不是坐标。将观察到的 `element_token` 作为驼峰命名的 `elementToken` 操作字段传入：

```js
await computer.setValue({
  ...target,
  elementToken,
  value: 'hello',
});

state = await computer.observeWindow({
  ...target,
  baseRevisionId: state.revisionId,
});
nodeRepl.write(state.text);
```

执行一个或多个操作后，在决定下一步操作之前，始终观察确切的窗口。如果更新后的状态显示已得到请求的结果，则停止操作、完成清理并回答用户。如果 UI 未按预期运行，则获取最新的完整状态，然后再选择其他操作。

仅当当前辅助功能状态明确提供了某个确切操作时，才使用次要操作。为提高效率，优先使用辅助功能文本；当辅助功能文本不完整或需要关注视觉布局时，再使用屏幕截图。

## 读取屏幕截图

```js
var state = await computer.observeWindow({
  ...target,
  forceFull: true,
  includeScreenshot: true,
});

for (var image of state.screenshot?.images ?? []) {
  if (image?.dataBase64 && image?.mimeType) {
    await nodeRepl.emitImage(
      `data:${image.mimeType};base64,${image.dataBase64}`,
    );
  }
}
```

## 完成

任务完成后，关闭 SDK 客户端：

```js
await computer.close();
globalThis.computer = undefined;
```

不再需要其他 REPL 状态时，调用 `node_repl_reset`。