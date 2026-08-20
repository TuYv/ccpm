---
name: custom-blocks
description: Comprehensive guide to building Notion worker custom blocks - use when the user wants to build interactive UI connected to Notion data.
user-invocable: false
---
## 什么是自定义块

`worker.customBlock()` 声明一个由 Notion 在 iframe 中提供的前端 Web 应用。它是一项构建时/部署时能力，没有 `execute` 处理程序，因此无法使用 `ntn workers exec` 运行。自定义块有两个 SDK 接口：`@notionhq/workers` 声明如何构建该块以及它需要哪些数据源架构，而 `@notionhq/custom-blocks` 则允许 iframe 中的前端代码在运行时与 Notion 宿主通信。

在搭建自定义块前端之前，请将 `@notionhq/custom-blocks` 添加到 worker 现有的根目录 `package.json` 中，将 `@notionhq/custom-blocks-dev-shell` 添加到其 `devDependencies` 中，并从 worker 根目录执行安装。块前端共享该软件包及其 `node_modules`。不要在 Vite 应用内创建第二个 `package.json`。请阅读已安装软件包的 README 和文档，了解当前的客户端 API。

使用自定义块开发 shell 在本地进行测试：

```shell
ntn customblocks dev
```

此命令会构建 worker，使用项目的 Vite 服务器提供每个块，并在带有可供绑定的示例数据源的模拟 Notion 宿主中进行渲染。

有关数据绑定和示例数据的信息，请参阅 `node_modules/@notionhq/custom-blocks-dev-shell` 中的 README。

## 块源

项目源是默认选项。`path` 指向一个相对于 worker 根目录、可构建的项目目录。部署流水线会在该目录中运行 `npm run build`，并默认提供其 `dist` 输出：

```ts
worker.customBlock("issueBoard", {
  path: "./blocks/issue-board",
})
```

使用 `command` 和 `output` 覆盖这些构建默认值：

```ts
worker.customBlock("issueBoard", {
  path: "./blocks/issue-board",
  command: "npm run build-prod",
  output: "build",
})
```

如果目录已经包含应按原样提供的浏览器资源，请使用静态源：

```ts
worker.customBlock("issueBoard", {
  type: "static",
  path: "./blocks/issue-board/dist",
})
```

## 数据源架构

可选的 `dataSources` 字段声明块所需的架构。它不会将块绑定到某个具体数据库。架构键和属性键是由作者定义的标识符。

```ts
worker.customBlock("issueBoard", {
  path: "./blocks/issue-board",
  version: 1,
  dataSources: {
    issues: {
      name: "Issues",
      description: "The team's issues",
      icon: { type: "emoji", emoji: "🐛" },
      properties: {
        title: {
          name: "Title",
          type: "title",
        },
        status: {
          name: "Status",
          description: "Workflow state",
          type: "status",
        },
      },
    },
  },
})
```

属性类型使用公共 API 中的名称，例如 `title`、`rich_text`、`number`、`select`、`multi_select`、`status`、`date`、`people`、`files`、`checkbox`、`url`、`email`、`phone_number`、`formula`、`relation` 和 `rollup`。

渲染时，块会将其配置的绑定映射到匹配的 `dataSources` 键。请结合来自 `@notionhq/custom-blocks/react` 的 `useDataSource("issues")` 阅读上面的示例源代码。