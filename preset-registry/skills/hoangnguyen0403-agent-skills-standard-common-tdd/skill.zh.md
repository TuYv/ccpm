---
name: common-tdd
description: "Guides quality-first TDD for new behavior, bug fixes, and test changes. Selects the smallest test layer, proves a distinct regression risk, and runs bounded RED-GREEN-REFACTOR verification."
metadata:
  triggers:
    files:
      - "**/*.test.ts"
      - "**/*.spec.ts"
      - "**/*_test.go"
      - "**/*Test.java"
      - "**/*_test.dart"
      - "**/*_spec.rb"
    keywords:
      - tdd
      - unit test
      - write test
      - red green refactor
      - failing test
      - test coverage
---
# 质量优先的 TDD

## **优先级：P0（关键）**

测试通过并不充分；测试必须证明一个自有行为以及一个独立且合理的故障。

## 选择模式

- **新行为：**严格遵循 RED -> GREEN -> REFACTOR。在出现预期的 RED 之前，不要编写生产代码。
- **遗留代码或缺陷修复：**仅在需要时进行特征化，然后将预期变更复现为失败的回归测试（RED）。保留无关的现有代码；不要仅仅因为它早于测试存在就将其删除。

## 编写测试之前

为每个行为/风险创建一条测试意图记录：

- `contract`：可观察契约——应用自身负责的结果或副作用
- `fault`：独立故障——该测试能够捕获的一种独立且合理的回归
- `layer`：最小且真实的单元、组件、契约、集成或 E2E 层
- `cases`：最少的不同等价类；对等价输入使用参数化测试
- `command`：精确且聚焦的单次运行命令

拒绝以下测试：与现有故障重复、断言实现细节或模拟调用流程、依赖时间/网络/顺序，或强行将更宽泛的行为塞进单元测试。

## 有界循环

1. 运行已配置的 lint/类型检查，检查附近的测试，并推导出范围最小的命令。
2. **RED：**添加一个意图组，并以前台、顺序、单次运行模式运行它。
3. 将 RED 分类为 `expected_red`、`invalid_red`、`unexpected_green` 或 `verification_infra_failed`。如果是 `unexpected_green`，请检查现有覆盖情况，并在实现生产代码之前移除冗余或薄弱的用例。
4. **GREEN：**仅实现足以满足 `expected_red` 的代码；重新运行相同命令。
5. **REFACTOR：**在不改变行为的前提下改进结构；重新运行相同命令。
6. 仅在证据要求时扩大验证范围：相关单元目标、集成/契约目标，然后是明确的发布/完整测试套件门禁。

## 执行安全

- 遵守项目超时设置；否则使用 120 秒的后备超时来限制聚焦命令的执行时间。
- 超时时，仅终止代理自身拥有的进程组，并确认子进程已清理。
- 切勿监听、无差别终止进程或在失败未发生变化时重试。应先记录新的假设或纠正性变更。
- 覆盖率是由仓库配置、归项目所有的证据。若未配置阈值，则应报告风险缺口，绝不能为了提高百分比而添加凑数测试。

## 危险信号与自我合理化

- 遇到以下说法时停止：`add tests after`、`too small`、`passed first run`、`run the full suite again` 或 `mock every collaborator`。
- 紧迫性、手动测试、测试数量或覆盖率目标，都不能绕过意图记录、预期 RED、有界命令或故障证明。

## 测试结构

- 使用清晰的 Arrange、Act、Assert 阶段；注释可选。
- 断言可观察的结果。仅当交互本身就是契约时，才断言该交互。
- 仅当隔离需要时模拟外部边界；优先使用真实的纯函数/领域行为和简单的伪实现。
- 测试名称应聚焦于行为，不要包含工单 ID 或 TODO/FIXME 标记。

有关意图记录、失败分类、分层路由和运行器示例，请参阅 `references/quality-contract.md`。