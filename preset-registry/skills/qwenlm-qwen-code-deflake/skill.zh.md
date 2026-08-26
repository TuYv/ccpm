---
name: deflake
description: Stabilize a flaky test with a minimal, assertion-preserving fix — never by weakening or deleting the check.
---
# 消除不稳定测试

一个 `deflake:` issue 会指定一个曾经失败、随后在同一 commit 上重新运行时通过的**单个**测试——这是不稳定测试的决定性特征。你的任务是在**不改变其验证内容**的前提下，让该测试变得确定性可重复。

issue 正文包含测试标识（文件 + 名称）以及观测到的失败特征（例如 `Test timed out in 5000ms`、`Timed out waiting for …`、依赖顺序的断言、依赖墙上时钟/随机数的值）。阅读测试，在脑中还原其发生机制，然后从下面允许的修复方式中，采用能够消除不确定性的**最小改动**。

## 唯一允许的修复方式

1. **提高超时时间 / 轮询预算。** 在 CI 争用下超过 vitest 默认超时时间的测试（完全 mock 或受 I/O 影响，而不是性能测试）可以获得一个宽裕的单测试 `testTimeout`（`it` 的第 3 个参数），或者为其内部轮询循环提供真实的墙上时钟预算，而不是固定的迭代次数（固定次数的 `setImmediate` 会在几毫秒内耗尽，并与真实 I/O 发生竞争）。
2. **稳定计时 / 等待行为。** 将裸 `setTimeout`/固定的 `sleep` 替换为对真实条件的显式 `await`（`vi.waitFor`、一个已 resolved 的 promise、一个事件）。在 `beforeAll` 中预热延迟加载的内容（例如 WASM runtime），使每个测试的耗时不包含首次加载的成本。
3. **使随机性 / 时间具有确定性。** 为 RNG 设置种子，使用 `vi.useFakeTimers()` / mock `Date.now`，或固定输入，使依赖真实时钟或 `Math.random` 的值不会漂移。
4. **隔离 / 串行化干扰。** 对共享资源发生冲突的测试（同名临时目录、固定端口、全局单例）提供每个测试独有的资源，或将其串行化。

## 硬性规则

- **绝不要**删除测试、将其 `skip`/`todo` 化、放宽断言、扩大预期范围、添加包罗万象的 `try/catch`，或在断言外添加重试包装器。这些做法只是隐藏不稳定性，而不是修复它们——并且可能隐藏真正的 bug。如果四种修复方式都不适用，或者失败看起来像真正的间歇性产品 bug（而不是测试不确定性），请编写 `<workdir>/failure.md`，说明你的发现，然后停止。由人工负责消除不稳定性。
- 保持 diff 最小，并将改动限制在指定的测试（及其文件中的辅助函数）范围内。不要重构无关代码。
- 保留每一条断言以及每一个输入，完全不作改动。提高超时时间只能改变上限；确定性修复只能改变不确定性的来源。
- 优先采用单测试或单文件级别的改动，而不是全局配置改动，除非能够证明同一类问题横跨整个 package（此时可以在该 package 的 `vitest.config.ts` 中设置 `testTimeout`，因为这只会提高上限，不会放宽任何断言）。

## 验证

多次运行指定测试所在的文件（在正确的 package 中执行 `npx vitest run <file>`，重复运行）——每次都必须通过。然后运行标准验证门禁（build / typecheck / lint / 已修改的测试）。如果无法让它稳定地通过，请编写 `<workdir>/failure.md`，然后停止。

然后按照 `.qwen/skills/prepare-pr/SKILL.md` 的要求编写 PR 正文，并（遵循共享规则）撰写双语的 `<workdir>/e2e-report.md`，其中说明：不稳定机制、你应用了四种修复方案中的哪一种及原因，以及重复运行的证据，证明现在它已具有确定性。