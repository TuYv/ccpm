---
name: bun-api-reference
description: Checks local bun-types documentation before using or changing Bun runtime APIs such as Bun.$, files, spawning, argv, stdout, stderr, and string width.
---
# Bun API 参考

在编写、审查或调试调用 Bun 运行时 API 的代码时使用此技能。

## 本地参考资料

从以下内容开始：

```text
node_modules/bun-types/README.md
node_modules/bun-types/docs/
```

使用 `rg` 搜索本地文档和类型：

```sh
rg "Bun\\.\\$|Bun\\.file|Bun\\.write|Bun\\.spawn" node_modules/bun-types
rg "stringWidth|deepEquals|stdout|stderr" node_modules/bun-types
```

在检查 API 签名、返回类型、选项和细微行为时，优先参考本地 `bun-types` 文档，而非凭记忆。

## 常用需验证的 API

- `Bun.$`
- `Bun.file()`
- `Bun.write()`
- `Bun.spawn()`
- `Bun.argv`
- `Bun.deepEquals()`
- `Bun.file().writer()`
- `Bun.stdout`
- `Bun.stderr`
- `Bun.stringWidth()`

如果文档缺失或 `node_modules` 不可用，请先使用 `rg` 检查现有的本地用法，并在依赖备用知识之前说明其中的不足。
