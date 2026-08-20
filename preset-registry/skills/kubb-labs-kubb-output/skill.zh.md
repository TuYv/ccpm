---
name: output
description: Import and use Kubb's generated code (types, clients, hooks, schemas, mocks). Use when writing app or test code that consumes a Kubb build.
---
# 输出技能

此技能指导代理如何导入和使用 Kubb 根据 OpenAPI/Swagger 规范生成的代码。

## 使用时机

- 编写调用生成的客户端或 hooks 的应用程序代码
- 编写使用生成的 mocks 或 schemas 的测试
- 将生成的文件接入应用程序

## 功能

- 说明生成的代码存放在哪里
- 展示如何查找实际的导出项和插件选项
- 列出使生成的代码保持同步的规则

## 输出位置

Kubb 会将生成的代码写入 `kubb.config.ts` 中的 `output.path`（例如 `./src/gen`），并按照各插件通过自身 `output.path` 设置的文件夹（例如 `models`、`clients`、`hooks`）进行组织。生成的文件带有 `Do not edit manually` 横幅，并会在每次执行 `kubb generate` 时被重写，因此如需更改这些文件，请编辑规范或配置并重新生成。

导出名称源自规范中的 `operationId` 和 schema 名称。大小写和分组均可配置，因此应查看生成的文件以获取准确的名称和签名，而不要自行推断。

## 查找生成的内容

检查实际输出，而不要猜测：

1. 查看 `kubb.config.ts`，了解顶层的 `output.path` 以及每个插件的 `output.path`。
2. 列出输出目录中的内容，以获取实际的文件名和导出名称。
3. 查看已安装插件的 `Options` 类型（`node_modules/@kubb/plugin-<name>/src/types.ts` 或发布的类型声明），了解其选项和默认值；并查看插件的文档页面（`https://kubb.dev/plugins/plugin-<name>`），了解其依赖项。应将这些内容作为事实依据，而不要自行假设选项名称。

设置 `output.barrel` 时，从文件夹的 `index.ts` 导入；否则直接从文件导入。

## 规则

- 切勿编辑 `output.path` 下的文件。应编辑规范或配置，然后重新运行 `kubb generate`。
- 导入生成的代码，而不是复制代码，以便重新生成后调用方能够保持同步。
- 只需配置一次运行时客户端。客户端函数和框架 hooks 会共享该客户端。
- 重新生成后执行类型检查，以便及时发现因规范变更而遭到破坏的调用位置。

## 相关技能

| 技能 | 用途 |
| --- | --- |
| **[../config/SKILL.md](../config/SKILL.md)** | 编写 `kubb.config.ts` 并选择插件 |