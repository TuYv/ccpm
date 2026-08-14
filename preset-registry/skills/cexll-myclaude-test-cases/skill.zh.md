---
name: test-cases
description: This skill should be used when generating comprehensive test cases from PRD documents or user requirements. Triggers when users request test case generation, QA planning, test scenario creation, or need structured test documentation. Produces detailed test cases covering functional, edge case, error handling, and state transition scenarios.
license: MIT
---
# 测试用例生成器

此技能可根据 PRD 文档或用户需求，生成全面且由需求驱动的测试用例。

## 目的

将产品需求转化为结构化测试用例，确保完整覆盖功能、边界情况、错误场景和状态转换。此技能遵循务实的测试理念：测试重要内容，确保每项需求都有对应的测试覆盖，并注重测试质量而非数量。

## 何时使用

在以下情况下触发此技能：
- 用户提供 PRD 或需求文档并请求生成测试用例
- 用户要求“生成测试用例”“创建测试场景”或“规划 QA”
- 用户提及某项功能或需求的测试覆盖
- 用户需要 Markdown 格式的结构化测试文档

## 核心测试原则

生成测试用例时，请遵循以下原则：

1. **由需求驱动，而非由实现驱动** - 测试用例必须直接映射到需求，而非实现细节
2. **完整覆盖** - 每项需求必须至少有一个测试用例覆盖以下方面：
   - 正常路径（正常使用场景）
   - 边界情况（边界值、空输入、最大限制）
   - 错误处理（无效输入、失败场景、权限错误）
   - 状态转换（如果涉及状态，应覆盖所有有效的状态变化）
3. **清晰且可执行** - 每个测试用例都必须能由 QA 工程师无歧义地执行
4. **可追溯** - 在需求与测试用例之间保持清晰的映射关系

## 工作流程

### 第 1 步：收集需求

首先，确定需求来源：

1. 如果用户提供了 PRD 的文件路径，请使用 Read 工具读取该文件
2. 如果用户以文字形式描述需求，请记录这些需求
3. 如果需求不明确或不完整，请使用 AskUserQuestion 进行澄清：
   - 核心用户流程是什么？
   - 验收标准是什么？
   - 需要考虑哪些边界情况或错误场景？
   - 是否存在任何状态转换或工作流？
   - 需要测试哪些平台或环境？

### 第 2 步：提取测试场景

分析需求并提取测试场景：

1. **功能场景** - 需求中的正常使用场景
2. **边界情况场景** - 边界条件、空状态、最大限制
3. **错误场景** - 无效输入、权限失败、网络错误
4. **状态转换场景** - 如果功能涉及状态，请梳理所有状态转换

针对每项需求，确定：
- 前置条件（测试前必须满足的条件）
- 测试步骤（要执行的操作）
- 预期结果（应该发生的结果）
- 后置条件（测试完成后的状态）

### 第 3 步：组织测试用例

使用以下结构组织测试用例：

```markdown
# Test Cases: [Feature Name]

## Overview
- **Feature**: [Feature name]
- **Requirements Source**: [PRD file path or description]
- **Test Coverage**: [Summary of what's covered]
- **Last Updated**: [Date]

## Test Case Categories

### 1. Functional Tests
Test cases covering normal user flows and core functionality.

#### TC-F-001: [Test Case Title]
- **Requirement**: [Link to specific requirement]
- **Priority**: [High/Medium/Low]
- **Preconditions**:
  - [Condition 1]
  - [Condition 2]
- **Test Steps**:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Expected Results**:
  - [Expected result 1]
  - [Expected result 2]
- **Postconditions**: [State after test]

### 2. Edge Case Tests
Test cases covering boundary conditions and unusual inputs.

#### TC-E-001: [Test Case Title]
[Same structure as above]

### 3. Error Handling Tests
Test cases covering error scenarios and failure modes.

#### TC-ERR-001: [Test Case Title]
[Same structure as above]

### 4. State Transition Tests
Test cases covering state changes and workflows (if applicable).

#### TC-ST-001: [Test Case Title]
[Same structure as above]

## Test Coverage Matrix

| Requirement ID | Test Cases | Coverage Status |
|---------------|------------|-----------------|
| REQ-001 | TC-F-001, TC-E-001 | ✓ Complete |
| REQ-002 | TC-F-002 | ⚠ Partial |

## Notes
- [Any additional testing considerations]
- [Known limitations or assumptions]
```

### 步骤 4：生成测试用例

针对每个已识别的场景，按照上述结构创建详细的测试用例。确保：

1. **唯一 ID** - 使用前缀：TC-F（功能）、TC-E（边界）、TC-ERR（错误）、TC-ST（状态）
2. **清晰的标题** - 使用能够说明测试内容的描述性标题
3. **需求可追溯性** - 将每个测试用例关联到具体需求
4. **优先级分配** - 将关键路径标记为高优先级
5. **可执行的步骤** - 步骤必须足够清晰，任何 QA 工程师都能执行
6. **可衡量的结果** - 预期结果必须可验证

### 步骤 5：验证覆盖率

在最终确定之前，请验证：

1. 每项需求至少有一个测试用例
2. 所有用户流程的正常路径均已覆盖
3. 已识别边界条件的边界情况
4. 已覆盖故障模式的错误场景
5. 如果功能包含状态，则已测试状态转换

如果存在覆盖缺口，请生成额外的测试用例。

### 步骤 6：输出测试用例

将测试用例写入 `tests/<name>-test-cases.md`，其中 `<name>` 来源于：
- PRD 中的功能名称
- 用户指定的名称
- 经过清理的需求标题版本

使用 Write 工具创建包含结构化测试用例的文件。

### 步骤 7：总结

生成测试用例后，提供一份简短的中文总结：
- 生成的测试用例总数
- 覆盖情况明细（功能、边界、错误、状态）
- 所做的任何假设或需要澄清的领域
- 保存测试用例的文件路径

## 质量检查清单

在最终确定测试用例之前，请验证：

- [ ] 每项需求都有对应的测试用例
- [ ] 已覆盖正常路径场景
- [ ] 边界情况包括边界值、空输入和最大限制
- [ ] 错误处理覆盖无效输入和故障场景
- [ ] 如果适用，已测试状态转换
- [ ] 测试用例 ID 唯一且遵循命名约定
- [ ] 测试步骤清晰且可执行
- [ ] 预期结果可衡量且可验证
- [ ] 覆盖矩阵显示完整覆盖
- [ ] 文件已写入 `tests/<name>-test-cases.md`

## 使用示例

**用户**：“为 `docs/auth-prd.md` 中的用户身份验证功能生成测试用例”

**流程**：
1. 读取 `docs/auth-prd.md`
2. 提取需求：登录、退出登录、密码重置、会话管理
3. 识别场景：成功登录、凭据无效、会话过期等
4. 生成覆盖所有场景的测试用例
5. 写入 `tests/auth-test-cases.md`
6. 用中文总结覆盖情况

## 参考资料

有关详细的测试方法和最佳实践，请参阅：
- `references/testing-principles.md` - 核心测试原则和模式