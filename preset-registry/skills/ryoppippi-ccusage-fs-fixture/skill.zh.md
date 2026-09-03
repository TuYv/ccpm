---
name: fs-fixture
description: Guides fs-fixture test setup. Use when tests need disposable files, directories, copied templates, symlinks, or automatic cleanup with createFixture().
---
# fs-fixture

在需要磁盘上存在真实文件或目录的测试中使用 `fs-fixture`。

## 参考

在使用较少见的选项或 API 之前，先阅读本地 README：

```text
node_modules/.pnpm/fs-fixture@2.8.1/node_modules/fs-fixture/README.md
```

如果具体的 pnpm store 路径发生变化，可使用以下命令定位：

```sh
fd -a README.md node_modules/.pnpm | rg "fs-fixture"
```

## 默认模式

优先使用 `await using`，这样清理会自动进行：

```ts
import { createFixture } from 'fs-fixture';

await using fixture = await createFixture({
	'projects/example/session.jsonl': '{}\n',
});

const filePath = fixture.getPath('projects/example/session.jsonl');
```

## 注意事项

- 对小型内联 fixture 使用对象树。
- 当多个测试共享同一较大的 fixture 结构时，使用模板目录输入。
- 使用 `fixture.getPath(...)`，而不是手动基于 `fixture.path` 进行拼接。
- 当测试需要逐步构建数据时，使用 `fixture.writeFile()` 或 `fixture.writeJson()`。
- 当只需复制模板目录的一部分时，使用 `templateFilter`。
