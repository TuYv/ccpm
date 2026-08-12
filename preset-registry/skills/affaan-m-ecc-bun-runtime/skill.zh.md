---
name: bun-runtime
description: Bun as runtime, package manager, bundler, and test runner. When to choose Bun vs Node, migration notes, and Vercel support.
origin: ECC
---
# Bun 运行时

Bun 是一个快速的一体化 JavaScript 运行时和工具包：集运行时、包管理器、打包器和测试运行器于一体。

## 何时使用

- **优先选择 Bun**：新建 JS/TS 项目、注重安装/运行速度的脚本、使用 Bun 运行时的 Vercel 部署，以及希望使用单一工具链（运行 + 安装 + 测试 + 构建）的场景。
- **优先选择 Node**：需要最大程度的生态系统兼容性、使用依赖 Node 的旧版工具，或某个依赖项存在已知的 Bun 兼容性问题时。

适用于：采用 Bun、从 Node 迁移、编写或调试 Bun 脚本/测试，或者在 Vercel 或其他平台上配置 Bun。

## 工作原理

- **运行时**：可直接替代 Node 的兼容运行时（基于 JavaScriptCore，以 Zig 实现）。
- **包管理器**：`bun install` 比 npm/yarn 快得多。在当前 Bun 版本中，默认锁文件为 `bun.lock`（文本格式）；旧版本使用 `bun.lockb`（二进制格式）。
- **打包器**：用于应用和库的内置打包器与转译器。
- **测试运行器**：内置的 `bun test`，提供类似 Jest 的 API。

**从 Node 迁移**：将 `node script.js` 替换为 `bun run script.js` 或 `bun script.js`。使用 `bun install` 代替 `npm install`；大多数软件包均可正常使用。使用 `bun run` 运行 npm 脚本；使用 `bun x` 执行类似 npx 的一次性命令。Bun 支持 Node 内置模块；如有对应的 Bun API，请优先使用，以获得更好的性能。

**Vercel**：在项目设置中将运行时设为 Bun。构建：`bun run build` 或 `bun build ./src/index.ts --outdir=dist`。安装：使用 `bun install --frozen-lockfile` 实现可复现部署。

## 示例

### 运行和安装

```bash
# Install dependencies (creates/updates bun.lock or bun.lockb)
bun install

# Run a script or file
bun run dev
bun run src/index.ts
bun src/index.ts
```

### 脚本和环境变量

```bash
bun run --env-file=.env dev
FOO=bar bun run script.ts
```

### 测试

```bash
bun test
bun test --watch
```

```typescript
// test/example.test.ts
import { expect, test } from "bun:test";

test("add", () => {
  expect(1 + 2).toBe(3);
});
```

### 运行时 API

```typescript
const file = Bun.file("package.json");
const json = await file.json();

Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello");
  },
});
```

## 最佳实践

- 提交锁文件（`bun.lock` 或 `bun.lockb`），以实现可复现安装。
- 运行脚本时优先使用 `bun run`。对于 TypeScript，Bun 可以原生运行 `.ts` 文件。
- 保持依赖项为最新版本；Bun 及其生态系统发展迅速。