---
name: computer-use
description: Control local desktop applications through Computer Use for tasks that require reading or operating app UI. Prefer purpose-built connectors, APIs, or CLIs when available.
---
# 使用 CUA SDK 进行 Computer Use

- 优先使用专用连接器或 API。仅在专用接口未公开相应的 UI 状态或交互时，才使用 Computer Use。
- 通过 `node_repl` 和类型化的 `ComputerUse` API 执行 Computer Use。不要使用通用的 `callTool`、直接导入驱动程序、AppleScript、JXA 或合成输入工具。
- 操作前观察当前的确切窗口。优先使用当前元素令牌，而不是截图坐标；仅当辅助功能信息不完整且截图提供了目标时，才使用坐标。
- 将操作结果视为操作已发送的证据，而不是任务完成的证据。根据最新状态做出判断，并要求有稳定的后置条件证据。

## 设置

如果 `node_repl` 不可用，请自行运行以下命令：

```bash
qwen mcp add --scope user node-repl npx -y @qwen-code/node-repl-mcp@0.1.2
npm install --no-save --package-lock=false @qwen-code/cua-sdk@0.20.3
```

告知用户重启 Qwen Code，然后停止。如果仅缺少 SDK 导入，请运行第二条命令并重试。

每个 REPL 内核创建一个持久客户端：

```js
globalThis.computer = await (
  await import('@qwen-code/cua-sdk/computer-use')
).ComputerUse.create();
globalThis.cuaRevisions ??= new Map();
```

## 定位和观察

使用 `listApps({signal:nodeRepl.signal})` 并在 JavaScript 中进行筛选；只打印可能匹配的项。选择真实 PID 后，调用 `listWindows({pid,signal:nodeRepl.signal})`，并从返回的元数据中进行选择。绝不要猜测 PID、窗口 ID、元素令牌或坐标。如果应用未运行，请使用普通的 Node.js 进程 API 启动它，并刷新列表。

为每个窗口表面维护一个修订游标。第一次观察没有基准；后续观察仅使用同一表面实际消费的上一个修订：

```js
globalThis.observeCuaWindow = async (target, options = {}) => {
  const key = `${target.pid}:${target.windowId}`;
  const state = await computer.observeWindow({
    ...target,
    ...options,
    baseRevisionId: cuaRevisions.get(key),
    signal: nodeRepl.signal,
  });
  if (state.revisionId) cuaRevisions.set(key, state.revisionId);
  return state;
};
```

使用辅助功能文本来高效地做出决策。当元素树不完整、视觉布局很重要，或操作证据与元素树冲突时，请求截图。仅输出与决策相关的图像：

```js
for (const image of state.screenshot?.images ?? []) {
  if (image?.dataBase64 && image?.mimeType) {
    await nodeRepl.emitImage(
      `data:${image.mimeType};base64,${image.dataBase64}`,
    );
  }
}
```

如果 SDK 明确报告缺少/无效基准或谱系过期，请使用 `forceFull: true` 执行一次观察，替换该表面的游标，然后恢复使用常规辅助函数。不要将完整观察作为默认方式。

## 操作和验证

选择当前状态所支持的最精确操作。将观察到的 `element_token` 作为 `elementToken` 传入。仅当该精确操作出现在元素当前的 `actions` 列表中时，才使用 `performSecondaryAction`。

执行操作前，先声明一个具体且可观察的后置条件。对于可表达为窗口或元素状态的后置条件，请使用带有 `verifyState` 的 `actAndVerify`：

```js
try {
  globalThis.lastCuaOutcome = await computer.actAndVerify({
    action: () =>
      computer.setValue({
        ...target,
        elementToken,
        value: expectedValue,
        signal: nodeRepl.signal,
      }),
    verify: () =>
      computer.verifyState({
        ...target,
        expect: [
          {
            element: {
              selector: { role: expectedRole, label_contains: expectedLabel },
              value_equals: expectedValue,
            },
          },
        ],
        stableSamples: 2,
        signal: nodeRepl.signal,
      }),
  });
  nodeRepl.write(JSON.stringify(lastCuaOutcome));
} catch (error) {
  nodeRepl.write(JSON.stringify(error?.details ?? { message: String(error) }));
  throw error;
}
```

`verifyState.expect` 接受一至八个通过 AND 组合的谓词：

- `{window:{exists, bounds?}}`
- `{element:{selector:{role?, label_contains?}, exists:true?,
value_equals?, enabled?, selected?}}`

无法证明元素不存在。`unknown` 和 `stable:false` 都不算成功。
当后置条件是视觉上的，或不受支持时，请使用屏幕截图再次观察确切窗口，并在做出判断前检查最新结果。如果状态出乎预期，请再次观察，而不是盲目重复操作。

读取每个操作结果。`effect` 的值为 `confirmed`、`partial`、`unverifiable`、`suspected_noop` 或 `refused`；`route`、`delivery`、`evidence`、`escalation` 和 `operation` 会说明实际发生了什么。已提交的操作仍可能具有 `cancellationRequested:true`，因此仍然需要验证。只有在最新状态表明确实需要时，才遵循所声明的升级路径。

## 交互细节

- 在导航、对话框、菜单或其他界面发生变化后，刷新相关窗口列表，并观察新的确切界面。
- 使用返回的状态来确定文本字段的行为；不要假定输入会替换现有文本。需要替换时，请使用适合该平台的全选操作。
- 优先使用后台传递。只有当操作结果或最新状态表明后台路径不可用或无效时，才使用 `deliveryMode:'foreground'`。
- 请求的后置条件一旦稳定满足，就立即停止。不要添加可能撤销结果的额外清理操作。

## 完成

```js
await computer.close();
globalThis.computer = undefined;
globalThis.cuaRevisions = undefined;
globalThis.observeCuaWindow = undefined;
```

仅当不再需要其他持久状态时，才重置 REPL。