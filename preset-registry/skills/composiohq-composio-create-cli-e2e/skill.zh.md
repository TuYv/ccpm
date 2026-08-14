---
description: Write end-to-end tests for CLI commands using the Docker-based test framework in ts/e2e-tests/cli/.
---
# CLI E2E 测试开发

为 `ts/e2e-tests/cli/` 中的 CLI 命令编写、扩展和维护端到端测试。

## 何时使用

- 为 CLI 命令添加新的 e2e 测试套件
- 修改或扩展现有的 CLI e2e 测试
- 调试失败的 CLI e2e 测试
- 审查 CLI 命令的输出契约是否得到了适当测试

有关 CLI **设计**（参数、标志、帮助文本、用户体验），请参阅 `create-cli` skill。
有关 CLI **实现**（Effect 模式、服务、命令注册），请参阅 `implement-cli-command` skill。

## 架构

每个 CLI e2e 测试都会在一个**临时 Debian Docker 容器**中运行已编译的 `composio` 二进制文件。该二进制文件是自包含的（通过 `bun build --compile` 构建）——运行时镜像中不存在 Node、Bun 或 pnpm。

关键特性：

- 每个测试套件对应 `ts/e2e-tests/cli/<suite-name>/` 下的一个目录
- 只能使用 `runCmd`。切勿使用 `runFixture`（它会对 CLI 测试抛出错误）。切勿设置 `usesFixtures`。
- **每次调用 `runCmd` 都会创建一个全新的容器。**调用之间不会保留任何状态。
- 命令在 `sh -c '...'` 中运行——只能使用 POSIX shell，不能使用 bash 特有语法。
- 容器可以访问网络——调用 API 的命令能够正常工作。
- `HOME=/tmp`，缓存目录为 `/tmp/.composio/`——身份验证只能通过环境变量传递。
- 在 Docker 内，`process.stdout.isTTY` 始终为 `false`——CLI 始终以管道模式运行。

### “管道模式”对测试意味着什么

在 Docker 内，composio 二进制文件的 stdout 从来不是 TTY。这会触发 CLI 的管道模式行为（请参阅 `ts/packages/cli/AGENTS.md` § “Output Conventions”）：
- `ui.output()` 写入 stdout
- 所有 Clack 装饰都会被抑制
- 对于成功的命令，stderr 为空

## 文件结构

对于新的测试套件 `<suite-name>`，创建 2 个文件：

```
ts/e2e-tests/cli/<suite-name>/
├── e2e.test.ts     # Test file
└── package.json    # Package manifest
```

### 命名约定

- **目录**：使用连字符分隔的小写名称，并与命令结构相匹配
  - `version`、`whoami`、`toolkits-list`、`tools-info`、`auth-configs-list`、`connected-accounts-link`
- **包名称**：`@e2e-tests/cli-<suite-name>`
  - `@e2e-tests/cli-version`、`@e2e-tests/cli-toolkits-list`

### package.json 模板

```json
{
  "name": "@e2e-tests/cli-<suite-name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test:e2e": "bun test e2e.test.ts",
    "test:e2e:cli": "bun test e2e.test.ts"
  },
  "devDependencies": {
    "@e2e-tests/utils": "workspace:*"
  }
}
```

## 选择测试模式

使用以下决策树选择正确的模式：

```
Does the command need env vars (e.g., COMPOSIO_API_KEY)?
├─ No → Is the output deterministic (exact value known at test time)?
│       ├─ Yes → Pattern A (simple command, exact assertions)
│       └─ No  → Pattern D (fuzzy assertions: toContain, toBeGreaterThan)
└─ Yes → Is the output deterministic given the env?
         ├─ Yes → Pattern B (env vars + exact assertions)
         └─ No  → Pattern D (env vars + fuzzy assertions)

Are you testing an error case (missing args, invalid input)?
└─ Yes → Pattern C (non-zero exit code, stderr non-empty)

Does the command perform an action with no machine-readable output?
└─ Yes → Pattern E (exitCode=0, stdout empty, no redirect test)
```

## 测试模式

### 模式 A：简单命令，无环境变量（规范模式）

适用于无需身份验证且能产生确定性输出的命令。这是基础模式——其他所有模式都是此模式的变体。

**参考**：`ts/e2e-tests/cli/version/e2e.test.ts`

```typescript
/**
 * CLI version command e2e test
 *
 * Verifies that the compiled composio CLI behaves correctly in a scratch container.
 */

import { e2e, sanitizeOutput, type E2ETestResult, type E2ETestResultWithFiles } from '@e2e-tests/utils';
import { TIMEOUTS } from '@e2e-tests/utils/const';
import { describe, it, expect, beforeAll } from 'bun:test';
import cliPkg from '../../../packages/cli/package.json' with { type: 'json' };

e2e(import.meta.url, {
  versions: {
    cli: ['current'],
  },
  defineTests: ({ runCmd }) => {
    const expectedVersion = String(cliPkg.version ?? '').trim();
    let versionResult: E2ETestResult;
    let redirectedResult: E2ETestResultWithFiles<'out.txt'>;

    beforeAll(async () => {
      versionResult = await runCmd('composio version');
      redirectedResult = await runCmd({
        command: 'composio version > out.txt',
        files: ['out.txt'],
      });
    }, TIMEOUTS.FIXTURE);

    describe('composio version', () => {
      it('exits successfully', () => {
        expect(versionResult.exitCode).toBe(0);
      });

      it('stdout matches snapshot', () => {
        expect(sanitizeOutput(versionResult.stdout)).toBe(expectedVersion);
      });

      it('stderr matches snapshot', () => {
        expect(versionResult.stderr).toBe('');
      });
    });

    describe('stdout redirection to out.txt', () => {
      it('exits successfully', () => {
        expect(redirectedResult.exitCode).toBe(0);
      });

      it('stdout is empty', () => {
        expect(redirectedResult.stdout).toBe('');
      });

      it('stderr is empty', () => {
        expect(redirectedResult.stderr).toBe('');
      });

      it('out.txt matches snapshot', () => {
        expect(sanitizeOutput(redirectedResult.files['out.txt'])).toBe(expectedVersion);
      });
    });
  },
});
```

**结构摘要：**
- 两个测试组：**命令执行**（stdout 有数据，stderr 为空）+ **stdout 重定向**（文件有数据，Docker 的 stdout/stderr 均为空）
- 在断言前对 stdout 和文件内容使用 `sanitizeOutput()`
- 对运行 Docker 命令的 `beforeAll` 使用 `TIMEOUTS.FIXTURE`

### 模式 B：需要环境变量的命令

**与模式 A 相同**，但有以下三处补充：

**参考**：`ts/e2e-tests/cli/whoami/e2e.test.ts`

1. **类型扩充**，为 `Bun.env` 提供编译时安全性：
   ```typescript
   declare module 'bun' {
     interface Env {
       COMPOSIO_API_KEY: string;
     }
   }
   ```

2. 在配置中**传入环境变量**：
   ```typescript
   env: {
     COMPOSIO_API_KEY: Bun.env.COMPOSIO_API_KEY,
   },
   ```

3. 从环境变量中**派生预期值**：
   ```typescript
   const expectedApiKey = Bun.env.COMPOSIO_API_KEY.trim();
   ```

其余部分遵循相同的双分组结构（命令执行 + stdout 重定向）。

### 模式 C：错误场景测试

**与模式 A 的区别：**
- 不需要 stdout 重定向测试——错误场景不会产生数据输出
- 使用 `not.toBe(0)` 断言退出码非零（不要硬编码特定的错误码）
- 断言 stderr 非空；也可以选择使用 `toContain()` 检查特定的错误消息片段
- 仅导入 `E2ETestResult`，不导入 `E2ETestResultWithFiles`

```typescript
import { e2e, sanitizeOutput, type E2ETestResult } from '@e2e-tests/utils';
import { TIMEOUTS } from '@e2e-tests/utils/const';
import { describe, it, expect, beforeAll } from 'bun:test';

e2e(import.meta.url, {
  versions: { cli: ['current'] },
  defineTests: ({ runCmd }) => {
    let missingArgResult: E2ETestResult;

    beforeAll(async () => {
      missingArgResult = await runCmd('composio manage tools info');
    }, TIMEOUTS.FIXTURE);

    describe('composio manage tools info (missing argument)', () => {
      it('exits with non-zero code', () => {
        expect(missingArgResult.exitCode).not.toBe(0);
      });
      it('stderr contains an error message', () => {
        expect(missingArgResult.stderr).not.toBe('');
      });
    });
  },
});
```

模式 C 可以在同一个测试文件中与模式 A 或 B 结合使用，以同时测试成功和错误路径。

### 模式 D：多行输出/API 依赖型输出

**结构与模式 A 或 B 相同**（具体取决于是否需要环境变量），但使用不同的断言策略：

- 对 API 数据**绝不要使用精确匹配断言**（`toBe`）——数据会随时间变化。
- 对已知且稳定的项目使用 `toContain()`（例如，`github`、`gmail` 始终存在）。
- 使用 `toBeGreaterThan()` 进行结构性检查（行数、长度）。
- 使用带正则表达式的 `toMatch()` 验证格式。

```typescript
// Instead of:
expect(sanitizeOutput(listResult.stdout)).toBe(exactValue);

// Use fuzzy assertions:
expect(sanitizeOutput(listResult.stdout).length).toBeGreaterThan(0);
expect(sanitizeOutput(listResult.stdout)).toContain('github');
const lines = sanitizeOutput(listResult.stdout).split('\n').filter(Boolean);
expect(lines.length).toBeGreaterThan(1);
```

重定向测试分组与模式 A 完全相同——断言文件包含数据，且 Docker stdout/stderr 为空。

### 模式 E：无 Stdout 数据的操作命令

适用于执行某项操作但不产生机器可读输出的命令（例如 `logout`、`upgrade`）。

**与模式 A 的区别：**
- 不进行重定向测试——没有可重定向的数据
- stdout 应严格为空（无需使用 `sanitizeOutput()`）
- 仅导入 `E2ETestResult`，不导入 `E2ETestResultWithFiles`

```typescript
e2e(import.meta.url, {
  versions: { cli: ['current'] },
  defineTests: ({ runCmd }) => {
    let logoutResult: E2ETestResult;

    beforeAll(async () => {
      logoutResult = await runCmd('composio logout');
    }, TIMEOUTS.FIXTURE);

    describe('composio logout', () => {
      it('exits successfully', () => {
        expect(logoutResult.exitCode).toBe(0);
      });

      it('stdout is empty', () => {
        expect(logoutResult.stdout).toBe('');
      });

      it('stderr is empty', () => {
        expect(logoutResult.stderr).toBe('');
      });
    });
  },
});
```

## 无法使用此框架测试的命令

请勿尝试为以下命令编写端到端测试：

| 类别 | 示例 | 原因 |
|---|---|---|
| **交互式命令** | `login`、`init`（带提示） | Docker 中没有 TTY——Clack 提示会卡住 |
| **长时间运行的命令** | `triggers listen` | 没有停止进程的机制 |
| **依赖浏览器的命令** | `login`（不带 `--no-browser`） | Docker 中没有浏览器 |
| **写入宿主机文件系统的命令** | `generate`（写入项目目录） | Docker 容器是隔离的 |

## 环境变量

### 自动传递的变量

如果宿主机上存在 `COMPOSIO_API_KEY` 和 `OPENAI_API_KEY`，它们会被自动转发到 Docker 容器（定义于 `WELL_KNOWN_ENV_VARS`）。

### 声明必需的变量

对于需要环境变量的测试：

1. 添加 `declare module 'bun'` 扩展（提供编译时安全性）。
2. 通过 `E2EConfig.env` 传递（在运行时提供给 Docker）。
3. 如果任意 `E2EConfig.env` 值为 `undefined`，测试会在启动时快速失败——此时尚未运行任何 Docker 容器。

### 多个环境变量

```typescript
declare module 'bun' {
  interface Env {
    COMPOSIO_API_KEY: string;
    COMPOSIO_BASE_URL: string;
  }
}

e2e(import.meta.url, {
  env: {
    COMPOSIO_API_KEY: Bun.env.COMPOSIO_API_KEY,
    COMPOSIO_BASE_URL: Bun.env.COMPOSIO_BASE_URL,
  },
  // ...
});
```

## Shell 引号

命令通过 POSIX shell 中的 `sh -c '...'` 运行。规则如下：

- 对包含空格或特殊字符的标志值使用双引号：
  ```typescript
  runCmd('composio manage tools info "GMAIL_SEND_EMAIL"')
  ```
- 在双引号上下文中使用单引号表示字面量字符串。
- **不要使用 Bash 特有语法**：不要使用 `[[`、`$()` 或数组。
- `PATH` 为 `/usr/local/bin:/bin`——在 Dockerfile 中设置。

## 添加新测试套件的检查清单

1. **创建目录**：`ts/e2e-tests/cli/<suite-name>/`
2. **创建 `package.json`**：使用上面的模板，并将名称设为 `@e2e-tests/cli-<suite-name>`
3. **创建 `e2e.test.ts`**：遵循适用的模式（A 到 E）
4. **运行 `pnpm install`**：从 monorepo 根目录运行，以解析工作区链接
5. **运行 `pnpm test:e2e:cli`**：验证测试通过
6. **更新 `ts/e2e-tests/cli/README.md`**：向测试套件表格添加新行

### README 表格格式

```markdown
| [suite-name](./suite-name/) | `composio <command>` description | `ENV_VAR_1`, `ENV_VAR_2` (or None) |
```

## 故障排查

### 读取 DEBUG.log

每个测试套件都会在其目录中生成一个 `DEBUG.log`，其中包含 Docker 执行详情：容器名称、命令、持续时间、退出码、标准输出和标准错误。测试失败时，请先阅读此文件。

### 过期的 Docker 镜像

如果 CLI 代码已更改，但测试仍显示旧行为，则说明 Docker 镜像已被缓存。请重新构建：

```bash
docker rmi composio-e2e-cli:$(jq -r .version ts/packages/cli/package.json)
```

### Shell 引号问题

检查 `DEBUG.log` 中的命令字符串。查找可能破坏 `sh -c` 解析的未转义特殊字符。

### 缺少环境变量

错误会在测试启动时出现（运行任何 Docker 容器之前），而不是在执行过程中出现。请验证 shell 中是否已设置 `Bun.env.*` 值。

### 容器无状态性

每次调用 `runCmd` 都会在一个全新的容器中运行。如果需要测试多步骤工作流（例如，“设置配置后再运行命令”），必须在单次 `runCmd` 调用中串联命令：

```typescript
runCmd('composio logout && composio whoami')
```

## API 参考

### `runCmd`（两个重载）

```typescript
// Simple: returns { exitCode, stdout, stderr }
const result: E2ETestResult = await runCmd('composio version');

// With file capture: returns { exitCode, stdout, stderr, files }
const result: E2ETestResultWithFiles<'out.txt'> = await runCmd({
  command: 'composio version > out.txt',
  files: ['out.txt'],
});
// Access: result.files['out.txt']
```

### `TIMEOUTS`

定义于 `ts/e2e-tests/_utils/src/const.ts`：

```typescript
TIMEOUTS.DEFAULT   // 5_000ms   — individual test timeout
TIMEOUTS.FIXTURE   // 120_000ms — beforeAll timeout (Docker startup + command execution)
TIMEOUTS.LLM_SHORT // 30_000ms  — commands involving LLM calls
TIMEOUTS.LLM_LONG  // 60_000ms  — commands involving longer LLM calls
```

对于运行 Docker 命令的 `beforeAll`，使用 `TIMEOUTS.FIXTURE`。对于单独的 `it()` 块，使用 `TIMEOUTS.DEFAULT`（默认值）。

## 参考文件

| 文件 | 用途 |
|---|---|
| `ts/e2e-tests/cli/version/e2e.test.ts` | 模式 A 参考 |
| `ts/e2e-tests/cli/whoami/e2e.test.ts` | 模式 B 参考 |
| `ts/e2e-tests/_utils/src/types.ts` | `E2EConfig`、`E2ETestResult`、`DefineTestsContext` 类型 |
| `ts/e2e-tests/_utils/src/const.ts` | `TIMEOUTS`、`WELL_KNOWN_ENV_VARS` |
| `ts/e2e-tests/_utils/src/sanitize.ts` | `sanitizeOutput()` |
| `ts/e2e-tests/_utils/Dockerfile.cli` | Docker 镜像定义 |
| `ts/e2e-tests/cli/README.md` | 测试套件表 |
| `CLI.md` | 规划中的 CLI 命令 |
| `ts/packages/cli/AGENTS.md` | CLI 架构和输出约定 |