---
name: test-coverage-improver
description: 'Improve test coverage in the OpenAI Agents Python repository: run `make coverage`, inspect coverage artifacts, identify low-coverage files, propose high-impact tests, and confirm with the user before writing tests.'
---
# 测试覆盖率改进器

## 概述

当需要评估或提高覆盖率时（覆盖率回退、未达到阈值，或用户要求加强测试），请使用此技能。它会运行覆盖率测试套件、分析结果、突出显示最大的覆盖缺口，并准备要添加的测试，同时在更改代码前征得用户确认。

## 快速开始

1. 在仓库根目录运行 `make coverage`，重新生成 `.coverage` 数据和 `coverage.xml`。
2. 收集产物：`.coverage` 和 `coverage.xml`，以及用于深入分析的 `coverage report -m` 控制台输出。
3. 汇总覆盖率：总覆盖率百分比、覆盖率最低的文件，以及未覆盖的行/路径。
4. 为每个文件拟定测试方案：场景、被测行为、预期结果以及可能带来的覆盖率提升。
5. 请求用户批准实施所提议的测试；在用户同意前暂停操作。
6. 获得批准后，在 `tests/` 中编写测试，重新运行 `make coverage`，然后在将工作标记为完成前运行 `$code-change-verification`。

## 工作流详情

- **运行覆盖率测试**：在仓库根目录执行 `make coverage`。避免使用监视标志；仅在比较趋势时保留之前的覆盖率产物。
- **高效解析摘要**：
  - 优先使用 `coverage report -m` 的控制台输出来获取文件级汇总；如需用于工具或电子表格，则使用 `coverage.xml` 作为后备。
  - 如需交互式深入分析，请使用 `uv run coverage html` 生成 `htmlcov/index.html`。
- **确定目标优先级**：
  - 优先处理 `src/agents/` 中的公共 API 或共享实用工具，而非示例或文档。
  - 语句覆盖率较低的文件，或覆盖率为 0% 的新增代码。
  - 最近的错误修复或高风险代码路径（错误处理、重试、超时、并发）。
- **设计有影响力的测试**：
  - 覆盖尚未覆盖的路径：错误情形、边界输入、可选标志以及取消/超时。
  - 覆盖组合逻辑，而非简单的正常路径。
  - 将测试放在 `tests/` 下，并避免不稳定的异步时序。
- **与用户协调**：以编号形式简洁列出拟添加的测试及预期覆盖率提升。在编辑代码或固件前明确征得用户同意。
- **实施后**：重新运行覆盖率测试，报告更新后的摘要，并指出所有仍然覆盖率较低的区域。

## 注意事项

- 所有新增注释或代码均使用英文。
- 除非后续需要，否则不要创建 `scripts/`、`references/` 或 `assets/`。
- 如果覆盖率产物缺失或已过期，请重新运行 `make coverage`，不要猜测。