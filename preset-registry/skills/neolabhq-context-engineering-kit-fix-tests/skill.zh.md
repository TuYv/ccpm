---
name: fix-tests
description: Systematically fix all failing tests after business logic changes or refactoring
---
# 修复测试

## 用户参数

用户可以提供参数，以专注于特定测试或模块：

```
$ARGUMENTS
```

如果未提供任何内容，则专注于所有测试。

## 上下文

在业务逻辑变更、重构或依赖更新之后，测试可能会失败，因为它们不再匹配当前的行为或实现。此命令通过专用代理编排所有失败测试的自动修复。

## 目标

修复所有失败的测试，使其匹配当前的业务逻辑和实现。

## 重要约束

- **专注于修复测试** - 除非绝对必要，否则避免更改业务逻辑
- **保留测试意图** - 确保测试仍然验证预期行为
- “分析变更的复杂性” - 
  - 如果有 2 个或更多变更文件，或一个文件包含复杂逻辑，则**不要自行编写测试** - 仅编排代理！
  - 如果只有一个变更文件，且变更简单，则可以自行编写测试。

## 工作流步骤

### 准备

1. **如果可用，读取 sadd skill**
   - 如果可用，读取 sadd skill 以了解管理代理的最佳实践

2. **发现测试基础设施**
   - 读取 @README.md 和 package.json（或等效的项目配置）
   - 确定运行测试和覆盖率报告的命令
   - 了解项目结构和测试约定

3. **运行所有测试**
   - 执行完整测试套件以建立基线

4. **识别所有失败的测试文件**
   - 解析测试输出，获取失败测试文件列表
   - 按文件分组，以便并行执行代理

### 分析

5. **验证单个测试的执行**
   - 选择任意测试文件
   - 启动 haiku 代理，并指示其找到仅运行该测试文件的正确命令
     - 要求其不断迭代，直到能够可靠地运行单个测试
   - 代理完成后，如果该测试文件存在，则尝试运行指定的测试文件
   - 这可确保代理能够单独运行测试

### 修复测试

6. **（并行）启动 `developer` 代理**
   - 为每个失败的测试文件启动一个代理
   - 为每个代理提供清晰的指示：
     * **上下文**：为什么该测试需要修复（业务逻辑已变更）
     * **目标**：需要修复的具体文件
     * **指导**：阅读 TDD skill（如果可用），了解编写测试的最佳实践。
     * **资源**：读取 README 和相关文档
     * **命令**：如何运行该特定测试文件
     * **目标**：不断迭代，直到测试通过
     * **约束**：修复测试，而不是业务逻辑（除非业务逻辑明显存在问题）

7. **验证所有修复**
   - 所有代理完成后，再次运行完整测试套件
   - 验证所有测试均已通过

8. **必要时迭代**
   - 如果仍有任何测试失败：返回第 5 步
   - 仅针对剩余失败启动新代理
   - 持续执行，直到通过率达到 100%

## 成功标准

- 所有测试通过 ✅
- 测试覆盖率得到保持
- 测试意图得到保留
- 业务逻辑未发生变化（除非发现错误）

## 代理指令模板

启动代理时，使用此模板：

```
The business logic has changed and test file {FILE_PATH} is now failing.

Your task:
1. Read the test file and understand what it's testing
2. Read TDD skill (if available) for best practices on writing tests.
3. Read @README.md for project context
4. Run the test: {TEST_COMMAND}
5. Analyze the failure - is it:
   - Test expectations outdated? → Fix test assertions
   - Test setup broken? → Fix test setup/mocks
   - Business logic bug? → Fix logic (rare case)
6. Fix the test and verify it passes
7. Iterate until test passes
```