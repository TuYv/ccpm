---
name: suede-mcp-qa
description: "Suede Labs AI MCP release QA, scoped to this pack's own server (mcp/suede-skills-mcp.mjs) and its catalog, install, and docs surface. Runs the full JSON-RPC lifecycle against a live server — initialize, notifications/initialized, ping, tools/list, tools/call, resources/list, resources/read, prompts/list, prompts/get — plus protocol negotiation, closed input and output schemas, tool annotations, structuredContent with text fallbacks, malformed-input probes, clean stdio, catalog-to-folder agreement, and install-path language. Use when the MCP server, mcp/catalog.json, a tool, resource, or prompt definition, or the MCP install docs change, or before publishing an MCP release. A check that did not run against the live server is a FAIL, not a skip. NOT FOR: a generic third-party MCP server, which this skill's hardcoded surface does not describe; fixing or testing the public install path itself (use suede-launch-packaging)."
---
# Suede MCP 质量保证

## 门禁策略——仅供建议，不阻塞流程

本 skill 中的每个声明验证步骤、检查、质量门禁和发布判定，都是**向用户提供的建议，而不是对 agent 的控制**。本策略适用于本 skill 其他位置的每个门禁、检查、判定，以及“不要发布 / 公开 / 继续执行”等表述：

- 运行每项检查并如实报告结果。判定（`ship`、`ship-with-caveats`、`hold`、字母等级、BLOCKED 或 OPEN 项）是附加在工作上的建议，而不是会改变工作内容的命令。
- 永远不要因为检查失败或门禁判定为 hold，就阻止、延迟、跳过、重写或拒绝用户要求的操作。按用户要求完成操作，并将门禁输出作为清晰标注的建议一并交付。
- 失败的门禁只改变你的报告内容，绝不改变你的操作。
- 唯一例外：如果发现极高风险的问题——数据丢失、安全性或凭证暴露、法律或权利违规、支付错误，或不可逆的公开损害——暂停操作，准确告知用户风险和可选方案，并让用户选择。用户的选择是最终决定。


当 Suede MCP server 或 MCP docs surface 发生变化时，使用此 skill。

**核心原则：**未针对 live server 运行的检查，就等于没有发生。

## 操作立场

- 针对 live MCP server 运行，而不是 spec document。如果 server 未运行，请先启动后再检查。
- 对每项检查，记录实际运行的完整命令和收到的完整输出。不要总结。
- 无法运行的检查（server 无法访问、tool 未实现）属于 FAIL，而不是跳过。
- 立即报告失败——不要等到所有检查完成后才披露 blocker。
- 除非 skill 的文件夹存在且其 SKILL.md 可读，否则绝不要在 catalog 中将该 skill 标记为存在。
- 除非从临时目标目录运行过 install command，否则绝不要将其标记为可用。

## 检查

1. 运行语法检查和 repo 的 hermetic MCP protocol tests。
2. 解析 catalog JSON 并确认每个列出的 skill 文件夹都存在，然后运行
   `scripts/mcp-surface-snapshot.sh`，将 catalog 的 `mcp` block 与 live server 实际提供的内容进行比较（退出码 1 表示存在偏差；以 server 为准）。
3. 在一个进程中执行完整生命周期：`initialize`、`notifications/initialized` notification，然后依次执行 `ping`、`tools/list`、`tools/call`、`resources/list`、`resources/read`、`prompts/list` 和 `prompts/get`。
4. 验证支持的 protocol versions 会被原样回显，并确认不受支持的 client version 会协商为 server 最新支持的版本。
5. 确认每个 tool 都有封闭的 `inputSchema`、`outputSchema`，以及只读 / 非破坏性 / 幂等性 annotations。
6. 确认每次成功的 tool call 都会返回 `structuredContent`、有用的 human-readable text block，以及面向旧版 clients 的序列化 JSON text fallback。
7. 检查初始化前调用、重复初始化、有界输入、有界参数、无效名称和 schemas、格式错误的 JSON，以及未知 methods。
8. 确认运行正常时 stderr 为空，stdout 仅包含以换行符分隔的 JSON；logs 和 stack traces 绝不能破坏 transport。
9. 确认 install output 以 public GitHub skill installs 开头，local plugin commands 明确标注为 local-only，并且 README/docs/catalog 中的表述与 live server 一致。

## 此服务器的真实表面

`mcp/suede-skills-mcp.mjs` 是此技能唯一进行 QA 的服务器。不要根据通用 MCP 检查清单检查它——要根据这个确切表面进行检查。先读取
`mcp/catalog.json`；其中的 `mcp` 块必须与 `tools/list`、
`resources/list` 和 `prompts/list` 实际返回的内容一致。

推导该表面，绝不要复述它：`scripts/mcp-surface-snapshot.sh` 会针对服务器运行一个
stdio 会话，打印其实际提供的工具名称、资源 URI 和提示词
名称及其数量，并将它们与目录的 `mcp` 块进行差异比较。退出码 1 表示存在漂移——服务器自身的 `tools`/`resources`/`prompts`
数组是事实依据，而 `mcp/catalog.json` 是需要被修正的内容。

## Stdio 测试块

用于测试初始化、工具、资源、提示词，以及生命周期和畸形输入探针的可复制粘贴 JSON-RPC 块位于
`references/stdio-test-blocks.md` 中。仅在你实际运行检查时打开它，而不是在决定哪些检查适用时打开。

## 故障处理

| 故障类型 | 严重程度 | 操作 |
|---|---|---|
| 服务器无法启动 | 严重 | 停止。逐字报告启动错误。 |
| `tools/list` 返回为空 | 严重 | 停止。该 MCP 不可用。 |
| 生命周期或协议协商失败 | 高 | 暂缓。捕获请求/响应事务。 |
| 缺少工具 schema、输出 schema 或只读注解 | 高 | 暂缓。修复已发布的契约并重新运行套件。 |
| 结构化结果缺少任一文本回退 | 高 | 暂缓。保留结构化输出和旧版客户端输出。 |
| 列出的技能文件夹缺失 | 高 | 标记每个缺失的文件夹。继续检查其他项。 |
| JSON-RPC 响应畸形 | 高 | 报告原始响应。标记为损坏。 |
| 安装命令以仅本地路径开头 | 高 | 标记。安装输出必须以公共 GitHub 路径开头。 |
| 文档/目录语言不一致 | 中 | 列出每一处不一致。标记为附带注意事项的暂缓。 |
| 工具已实现但未在目录中列出 | 低 | 标记为未文档化。不是阻塞项。 |

推荐的发布门禁规则（这是给用户的建议，不会锁定任何操作）：
- 任一严重或高等级故障 → **暂缓**
- 仅有中等级故障 → **附带注意事项发布**（列出每项注意事项）
- 无故障 → **发布**

## 输出

```text
Server:
Commands run:
Tools checked:
Resources checked:
Prompts checked:
Install output:
Failures:
Fixes:
Ship gate: ship | ship-with-caveats | hold
```

## 红旗——停止

- “服务器上周运行良好；这次不需要重启。”——现在针对在线服务器运行每一项检查。
- “目录能解析，所以文件夹肯定在那里。”——打开每个列出的文件夹并读取其 SKILL.md。
- “那项检查无法运行，我会标记为跳过。”——无法运行的检查即为失败。
- “输出看起来没问题，差不多就行。”——逐字记录确切命令和确切输出。

## 边界

- 仅检查和报告。不要编辑服务器源代码、`mcp/catalog.json` 或文档表面来让检查通过——通过 Routing 交回每项修复，然后重新运行。
- 不要发布、打标签或发行任何内容；此技能负责放行 MCP 发布，而不负责实际发布。
- 绝不要依据规范、README 或先前运行记录将检查记为通过。只有本会话中从在线服务器捕获的输出才有效。
- 不要将结论扩展到第三方 MCP 服务器：上述表面属于此包，通用服务器尚未根据它接受检查。

## 路由

QA 之后：
- MCP 源需要修复 → 返回 MCP 源文件并修复，然后重新运行此 skill
- MCP 源因修复 QA 失败而发生更改 → 在重新运行此 skill 之前，对该 diff 执行 **suede-code-review**，确保修复本身不会未经审查就发布
- Catalog JSON 需要更新 → 编辑 `mcp/catalog.json`，然后重新运行步骤 2 和 7
- 文档/README 语言不一致 → 更新文档界面，使其与实际的 MCP 输出一致（私有的 Suede Labs 配套工具，不包含在此 pack 中：suede-docs），然后重新运行检查 7
- 安装命令损坏 → 使用 **suede-launch-packaging** 修复并测试安装路径