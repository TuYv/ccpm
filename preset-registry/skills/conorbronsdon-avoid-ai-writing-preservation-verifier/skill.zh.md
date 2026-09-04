---
name: preservation-verifier
description: Use when the user provides an original and rewritten version, asks whether a rewrite preserved protected content, or wants a deterministic check for code, frontmatter, quotes, tables, links, paths, numbers, headings, and residual AI-pattern regressions.
---
# Preservation Verifier

验证重写或文件编辑是否保留了原始 `../avoid-ai-writing/SKILL.md` 中要求保护的内容。

对于跨 Skill 工作，请遵循 `../avoid-ai-writing-router/references/handoff-contract.md` 和 `../avoid-ai-writing-router/references/skill-graph.json`。

## Connection contract

### Incoming

接受来自以下组件的前后版本验证：

- 当用户直接提供修改前和修改后的材料时，由 `avoid-ai-writing-router` 通过 `ROUTE` 发送。
- 由 `voice-preserving-rewriter` 在返回重写文本后通过 `VERIFY` 发送。
- 由 `file-edit-in-place` 在完成经过授权的指定文件修改后通过 `VERIFY` 发送。

必须同时提供原始版本和当前版本。如果任一版本不可用，应将控制权交回路由器，不得自行臆造比较结果。

### Produce

更新交接信封中的以下字段：

- `execution_evidence.verifier`：仅当运行了捆绑的验证器时设为 `executed`，否则设为 `model_only`。
- `verification_summary.status`：设为 `PASS`、`REVIEW` 或 `FAIL`。
- 阻塞性错误和警告。
- 如果可以修复，提供确切的修复目标。

`FAIL` 表示工作流被阻塞。重写或编辑阶段不能仅因为文本已经生成或文件写入成功就视为完成。

### Outgoing

- 当返回的文本未通过保留性验证时，向 `voice-preserving-rewriter` 发送 `REPAIR`。
- 当指定文件未通过保留性验证时，向 `file-edit-in-place` 发送 `REPAIR`。
- 仅当用户请求中包含收敛或残留审计时，才向 `ai-writing-detector` 发送 `RECHECK`。
- 在 `PASS` 后停止，除非用户还请求了其他阶段。
- 第二次验证失败后停止并报告。不得再启动修复循环。

## Architecture and implementation lenses

应用 `../avoid-ai-writing-router/references/agency-role-lenses.md` 中编码的两个视角：

- `agency-software-architect`：验证是一个具有明确责任归属和有界修复周期的边界闸门。
- `agency-senior-developer`：执行声明必须有实际的命令证据，错误必须向上传递，且前后状态必须能够归因到正确的目标。

验证器本身不重写内容。

## Preferred deterministic path

捆绑的 `scripts/validate.js` 是源代码仓库中保留性验证器的精确副本。当 Node 可执行时，运行：

```bash
node scripts/validate.js before.md after.md
```

用于程序化调用：

```js
const { validate } = require("./scripts/validate.js");
```

验证器会检查受保护的结构，并分别报告阻塞性错误和警告。除非当前主机确实执行过验证器，否则绝不能声称验证器已经运行。

如果无法执行，请使用相同的保留性契约手动比较原始版本和重写版本，并将结果标记为 `model_only`。

## Additional protected constraints

除规范验证器的结构检查外，还必须遵守交接信封中携带的受保护语义约束。

当 `human_representation_sensitive: true` 时，请使用 `agency-inclusive-visuals-specialist` 视角审查受保护的身份与呈现细节。结构上有效的重写仍可能需要 `REVIEW` 或 `FAIL`，如果它删除或泛化了关于物质文化、地理、残障、服饰、肤色/光照、物理现实或反刻板印象的约束。

不要声称确定性验证器检查了其未实现的语义表示细节。将该部分单独报告为仅由模型执行的语义审查。

## 结果处理

### PASS

未发现阻塞性的保留错误。仅当仍有其他请求的阶段时继续。

### REVIEW

警告或语义变更需要人工判断，但不会自动视为阻塞问题。解释确切的不确定性。

### FAIL

受保护内容已发生变更或消失。根据源内容类型识别正确的修复负责人：

- 返回的文本 -> `voice-preserving-rewriter`
- 指定的文件 -> `file-edit-in-place`

仅传递阻塞性的修复范围和现有信封。不要要求修复负责人重新处理完整内容中未受影响的部分。

## 修复循环限制

只允许重新进入修复流程一次。修复后再次验证一次。如果第二次检查仍然失败，则停止并报告未解决的错误。绝不要无限循环。

## 输出

返回 `PASS`、`FAIL` 或 `REVIEW`，验证器执行状态，阻塞性的保留错误，警告，任何单独的语义防护审查，建议的修复负责人，以及是否已经使用了有界修复机会。