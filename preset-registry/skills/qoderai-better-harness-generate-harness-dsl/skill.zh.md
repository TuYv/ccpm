---
name: generate-harness-dsl
description: Generate, revise, or review complete Harness as Code `.harness` files when a coding-agent workflow, agent role, skill, tool contract, MCP connection, runtime, or deployment must be compiler-valid and resolvable with `@qoder-ai/harness`.
---
# 生成 Harness DSL

创建一份独立的 Harness as Code v0.3 文档，并通过包编译器和解析器证明执行契约。

## 工作流程

1. 确定宿主、它实际必须暴露的能力，以及真正的控制方。一个宿主会话使用一个 `session`。仅当所选适配器明确实现了相应模式时，才使用 `state-machine` 或 `program`。
2. 阅读[DSL 契约](references/dsl-contract.md)。从[最小示例](../../examples/minimal.harness)开始；需要可调用工具时，打开[标准示例](../../examples/standard-coding.harness)。
3. 除非用户请求片段，否则生成一份自包含文档。包含 `language 0.3`、每个被引用的声明、一个具体的运行时以及一个命名部署。标准工具可以保持隐式声明。
4. 运行 `scripts/validate.mjs`。修复所有编译或解析错误，然后重新运行。仅能编译通过的状态机并不是可执行的 Qoder 或 Pi 部署。
5. 返回 DSL 或已保存的文件，以及 harness id、deployment id、runtime、解析状态，以及所选适配器无法满足的任何执行边界。

## 编写规则

- 只陈述可证伪的要求。不要添加权限、设置、降级、绑定、输入/输出名称或运行时执行语法；v0.3 特意不包含这些语法。
- 让需求动词与其能力相匹配：`use skill`、`require tool` 或 `connect mcp`。
- 只有契约中的标准工具 id 可以不声明。每个自定义工具都要声明一个稳定的 `contract` id，并且该 id 必须与适配器暴露的 id 匹配。
- Qoder 和 Pi 描述符仅运行 `session` 工作流。使用某个工作流的每个 harness 都要恰好声明一个 agent 角色。
- 状态机结果在 agents 上进行类型声明。每个路由发射器、结果、目标、入口和停止节点都必须存在，并且每个 agent 都必须可达。
- 只有当适配器在 `programmaticLanguages` 中列出相同语言时，`program <language> <entry>` 工作流才会解析成功。
- 不要将凭据放入源代码。MCP 端点优先使用 `env.VARIABLE`，但请记住，声明端点并不会连接它；适配器必须完成连接。
- 生成或验证 DSL 时，不要调用宿主 SDK、安装集成，或声称具备原生强制执行能力。

## 验证

在此 skill 目录中运行：

```sh
node scripts/validate.mjs /path/to/workflow.harness [harness-id ...]
```

该命令会打印 JSON；当编译失败或任何选定的命名部署解析失败时以非零状态退出。在声称生成的 DSL 可执行之前，必须确保命令成功退出。

编辑此 skill 时，先构建包，以确保 `dist/` 反映当前编译器：

```sh
npm run harness:build
```