---
name: config
description: How to author a kubb.config.ts and pick the right @kubb/plugin-* packages when generating TypeScript from an OpenAPI/Swagger spec. Use whenever setting up Kubb, adding a generator, or debugging codegen output.
---
# 配置 Skill

此 Skill 用于指导代理编写 `kubb.config.ts`，并选择合适的
`@kubb/plugin-*` 包。生成过程通过 `kubb` CLI（`kubb generate`）运行，同一套
构建能力也为内置的 MCP 服务器提供支持。

## 何时使用

- 在项目中设置 Kubb
- 添加或替换生成器插件
- 调试生成的输出缺失或不正确的原因

## 功能

- 展示 `kubb.config.ts` 的结构
- 列出生成器插件及其组合方式
- 指出各插件的 `Options` 类型以及 kubb.dev 文档页面，以获取权威的选项说明
- 说明 validate、init 和 generate 工作流

## 配置的结构

```ts
import { defineConfig } from 'kubb'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginAxios } from '@kubb/plugin-axios'

export default defineConfig({
  root: '.',
  input: {
    path: './petstore.yaml', // local file path or a remote URL
  },
  output: {
    path: './src/gen',
    clean: true, // wipe the output dir before each run
    barrel: { type: 'named' }, // generate index.ts barrels with named exports
  },
  plugins: [
    pluginTs({ output: { path: 'models' } }),
    pluginAxios({ output: { path: 'clients' } }),
  ],
})
```

需要注意的规则：

- 仅在需要时设置适配器选项，方法是通过来自 `@kubb/adapter-oas` 的顶层
  `adapter: adapterOas({ ... })`（用于 `validate`、`serverIndex`、
  `serverVariables`、`discriminator` 或 `contentType`）。
- `pluginTs` 是基础插件。客户端插件（`pluginAxios`、`pluginFetch`）依赖它，框架插件（`pluginReactQuery`、
  `pluginVueQuery`、`pluginSwr`）依赖 `pluginTs` 和一个客户端插件，而 `pluginMsw` 则依赖
  `pluginTs` 和 `pluginFaker`。请查看 kubb.dev 上相应插件的文档页面
  （`https://kubb.dev/plugins/plugin-<name>`），获取完整的依赖项列表。
- 每个生成器插件都有自己的 `output.path`，该路径相对于顶层
  `output.path` 解析。将不同类型的生成内容放在不同文件夹中（`models`、`clients`、`hooks` 等）。
- `input` 接受用于文件或 URL 的 `{ path }`。对于不受信任的规范，请先使用 `kubb validate`
  进行验证，再生成代码。
- 当 `output.clean` 为 `true` 时，生成操作具有破坏性。切勿将 `output.path` 指向
  手写源代码。
- 将 `output.format` 或 `output.lint` 设置为 `'auto'`，即可使用
  项目中已有的工具（oxfmt、Biome、Prettier、oxlint 或 ESLint）格式化和检查生成的文件。

## 可用的生成器插件

根据使用方的需求选择插件，然后安装 `kubb` 以及每个相应的包。

| 需求 | 包 | 导入项 |
| --- | --- | --- |
| TypeScript 类型（推荐作为基础） | `@kubb/plugin-ts` | `pluginTs` |
| Axios 客户端 | `@kubb/plugin-axios` | `pluginAxios` |
| Fetch 客户端 | `@kubb/plugin-fetch` | `pluginFetch` |
| TanStack React Query hooks | `@kubb/plugin-react-query` | `pluginReactQuery` |
| Vue Query hooks | `@kubb/plugin-vue-query` | `pluginVueQuery` |
| SWR hooks | `@kubb/plugin-swr` | `pluginSwr` |
| Zod schemas | `@kubb/plugin-zod` | `pluginZod` |
| Faker.js 模拟工厂 | `@kubb/plugin-faker` | `pluginFaker` |
| MSW 请求处理程序 | `@kubb/plugin-msw` | `pluginMsw` |
| Cypress fixtures | `@kubb/plugin-cypress` | `pluginCypress` |
| 基于规范的 MCP 服务器 | `@kubb/plugin-mcp` | `pluginMcp` |
| ReDoc 文档 | `@kubb/plugin-redoc` | `pluginRedoc` |

要查看已安装插件的确切选项，请读取已安装包中的 `Options` 类型
（`node_modules/@kubb/plugin-<name>/src/types.ts` 或已发布的类型声明）以及
插件的文档页面（`https://kubb.dev/plugins/plugin-<name>`）。该页面列出了每个选项及其
默认值、插件依赖项和默认的 `output.path`。应将这些内容作为事实依据，而不是猜测选项名称。

常见组合：

- 仅生成类型：`pluginTs()`。
- 类型化数据获取：添加 `pluginAxios()` 或 `pluginFetch()`，或者添加会引入客户端生成功能的框架插件（`pluginReactQuery`、
  `pluginVueQuery` 或 `pluginSwr`）。
- 运行时验证：添加 `pluginZod()`，并让客户端指向它，以获得类型化且经过验证的响应。
- 测试和模拟：添加 `pluginFaker()` 和 `pluginMsw()`。

## 工作流程

这些命令封装了 `kubb` CLI，因此同样的步骤也适用于终端。

1. 在执行任何其他操作之前，使用 `kubb validate <spec>` 验证规范。
2. 使用 `kubb init` 创建项目结构并安装。传入 `--input`、`--output` 和 `--plugins` 可跳过
   提示，也可以按照上面的结构手动编写 `kubb.config.ts`。
3. 使用 `kubb generate` 生成代码。在诊断文件缺失或
   格式异常的原因时传入 `--verbose`，并使用 `--watch` 在规范发生变化时重新生成。
4. 对生成的输出执行类型检查，并将其接入应用。

## 相关技能

| 技能 | 用途 |
| --- | --- |
| **[../output/SKILL.md](../output/SKILL.md)** | 导入并使用生成的代码 |