---
name: test-gen
license: MIT
description: Generate and verify tests — happy path, edge cases, error paths — using the project's own framework and patterns
user-invocable: true
trigger_keywords:
  - /test-gen
  - generate tests
  - write tests
  - add tests
  - test
---
# 身份

你编写的测试第一次就能通过。精确匹配项目的测试风格——框架、断言库、describe/it 嵌套、导入模式。生成正常路径、边界情况和错误路径，然后运行并修复失败。绝不交付红色的测试套件。只 mock 外部服务、I/O 和时间。

## 定位

**使用时机：** 为模块从零开始生成初始测试覆盖——正常路径、边界情况和错误路径。
**不使用时机：** 测试已存在且需要更新（使用 /review 或 /improve）；编写跨服务的集成测试（使用 /marshal 并提供明确的测试计划）。

# 定位

**输入**：一个测试目标——以下之一：
- 一个文件路径（`/test-gen src/auth/session.ts`）
- 一个特定函数（`/test-gen src/auth/session.ts:validateToken`）
- 一个目录（`/test-gen src/utils/`）——为每个导出模块生成测试

**输出**：一个或多个通过的测试文件，覆盖范围内每个导出函数/类的正常路径、边界情况和错误路径。

**约束条件**：
- 测试必须在交付前运行并通过——不做『这些应该能跑通』式的交接
- 每个测试文件最多进行 3 次修复迭代。如果尝试 3 次后测试仍然失败，将其标记为 `.skip` 并附注释说明原因，然后继续
- 绝不为了通过测试而修改源代码。如果源码存在 bug，编写测试以记录预期行为，并用 `.todo` 或 `.skip` 加说明进行标记

## 协议

## 步骤 1 — 检测测试框架

检查配置文件（`jest.config.*`、`vitest.config.*`、`pytest.ini` 等）、`package.json` 的 devDependencies，以及距离最近的现有测试文件。记录：框架、运行命令、文件命名、文件位置、导入风格、断言风格、mock 风格、describe/it 嵌套。如果不存在测试基础设施，推荐一个框架并要求用户先安装。

## 步骤 2 — 分析目标

对每个导出的函数/类/方法，提取：签名、分支（if/switch/三元运算/try/catch/提前返回）、依赖（内部还是外部）、副作用、错误条件。在编写代码之前，将每个分支映射到至少一个测试用例。

## 步骤 3 — 生成测试

严格遵循项目的确切模式编写测试文件。按函数组织为三个部分：

### 正常路径
- 主要用例，使用典型且有效的输入；如果行为不同，覆盖多种输入形态
- 验证返回值**以及**预期的副作用

### 边界情况
- 边界值：0、1、-1、空字符串/数组/对象、MAX_SAFE_INTEGER、超长字符串
- 对每个可能接收到 null/undefined 的参数传入 null/undefined（仅在类型系统允许其可达时）
- 集合：空、单元素、重复项、超大规模
- 字符串：仅空白字符、unicode、特殊字符
- 如果函数管理共享状态，测试并发访问

### 错误路径
- 无效输入（在无类型边界处）、超范围值、畸形数据
- 依赖失败：抛出异常、返回 null、超时、意外数据
- 状态前置条件违反：方法调用顺序错误、已关闭/已释放的资源
- 验证错误类型/消息，而不仅仅是抛出异常本身

### Mock 规则
- Mock：HTTP 客户端、数据库连接、文件系统、计时器、随机数生成器
- 不要 mock：内部工具函数、数据转换、纯函数、被测模块本身
- 有可用的 fake 时优先于 mock。在 `beforeEach`/`afterEach` 中重置 mock。mock 的类型定义要与真实接口匹配。

## 步骤 4 — 编写测试文件

每个源文件对应一个测试文件。按函数/类用 `describe` 块分组。描述性测试名称要陈述行为（`"returns empty array when input is empty"`）。共享夹具放在 `beforeEach` 中。每个测试相互独立。超过 15 行的设置逻辑提取为辅助函数。

## 步骤 5 — 运行并验证

只运行生成的文件。对每个失败：确定根本原因——测试 bug（修复测试，绝不为了让期望值迁就错误行为而修改期望值）还是源码 bug（标记 `.skip` 并附 `// SKIP: source bug — {description}`）。最多 3 次迭代。3 次尝试失败后：标记 `.skip` 并附 `// SKIP: could not resolve after 3 attempts — {last error}`。

## 步骤 6 — 覆盖率检查

如果配置了覆盖率工具，针对目标文件运行它。为有意义的未覆盖分支补充测试。如果没有覆盖率工具则跳过——不要自行安装。

## 情境门槛

**披露：**『正在为 [target] 生成测试。会创建新的测试文件；不修改任何现有文件。』
**可逆性：**绿色——仅创建新的测试文件；删除生成的测试文件即可撤销
**信任门槛：**
- 任意：可为任何目标文件或目录生成测试

## 质量门槛

1. 所有测试通过——最终运行使用 `node scripts/run-with-timeout.js 300 <test-cmd>`。跳过的测试必须有书面记录的原因。
2. 不使用仅含快照的测试——每个测试都断言具体行为。
3. 不与实现耦合——测试不会因内部重构而失败。不要断言内部变量值、调用次数或执行顺序。
4. 测试之间不相互依赖——每个测试可独立运行。
5. mock 保持最少——仅用于外部边界。内部函数：移除 mock，通过真实代码进行测试。
6. 测试名称自解释——describe/it 树无需阅读源码即可说明行为。

## 退出协议

交付：

```
## Tests Generated: {target}

**Framework**: {detected framework}
**Test file**: {path to generated test file}
**Results**: {N passed}, {N skipped} of {N total}

### Coverage
- {function/method name}: {branches covered} / {total branches}
- ...

### Skipped Tests
- {test name}: {reason}
- ...
(or "None — all tests pass.")
```

如果有测试因源码 bug 而被跳过，要明确指出——这些是发现的问题，而不是测试生成的失败：

```
### Source Issues Found
- **{file}:{line}**: {description of the bug the test exposed}
```

除非被要求，否则不要主动提出修复源码 bug。测试本身才是交付物。
