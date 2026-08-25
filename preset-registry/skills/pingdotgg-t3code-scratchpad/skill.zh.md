---
name: scratchpad
description: Extract the JSDoc example nearest the active source selection or cursor into ./scratchpad as a TypeScript file. Use when the user asks to dump, copy, open, or try a source example in scratchpad.
---
使用此技能，从用户活动源代码光标或选区附近的 JSDoc `**Example**` 创建一个 scratchpad TypeScript 文件。

## 工作流

1. 确定源路径和行号：
   - 如果存在，使用 IDE 活动文件以及选区/光标所在行。
   - 如果用户提供了明确的文件和行号，则使用该文件和行号。
   - 如果没有可用的行号或选区，请向用户询问。
2. 运行：

   ```sh
   node .agents/skills/scratchpad/scripts/extract-example.mjs <source-path> <line>
   ```

3. 如果脚本因没有明显的运行器而以代码 2 退出，请询问用户是要完整保留示例、指定要运行的 Effect 值，还是取消操作。
   - 要完整保留示例，请使用 `--mode preserve` 重新运行。
   - 要运行特定的 Effect 值，请使用 `--runner <identifier>` 重新运行。
4. 将创建的路径报告为可点击的文件链接。这是打开代码窗格的确定性方式。
5. 除非用户明确要求，否则不要运行 scratchpad 文件。

## 行为

- 脚本会选择包含该行的 `**Example**` 部分中的示例；否则选择其后的第一个示例；再否则选择其前面最近的示例。
- 文件名根据源文件和示例标题生成，例如
  `scratchpad/Schedule-retrying-and-repeating-effects.ts`。
- 不会覆盖现有文件。脚本会追加数字后缀。
- 在自动模式下，如果存在顶层的 `program` 绑定，脚本会追加：

  ```ts
  Effect.runPromise(program).then(console.log, console.error)
  ```

- 如果示例已经包含 Effect 运行器，脚本会保留它。