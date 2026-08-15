---
name: regression-suite
description: "Map test coverage to GDD critical paths, identify fixed bugs without regression tests, flag coverage drift from new features, and maintain tests/regression-suite.md. Run after implementing a bug fix or before a release gate."
argument-hint: "[update | audit | report]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, AskUserQuestion
model: sonnet
---
# 回归测试套件

此技能确保每个错误修复都有一个本可捕获原始错误的测试作为保障，并确保回归测试套件随着游戏演进而保持最新。它还会检测是否添加了新功能却没有相应的回归测试覆盖。

回归测试套件并不是一种新的测试类别，而是一个**由 `tests/` 中已有测试组成的精选列表**，这些测试共同覆盖游戏的关键路径和已知故障点。此技能负责维护该列表。

**输出：** `tests/regression-suite.md`

**运行时机：**
- 修复错误后（确认已编写回归测试，或识别覆盖缺口）
- 发布门禁之前（`/gate-check polish` 要求回归测试套件已存在）
- 作为冲刺收尾的一部分，用于检测覆盖范围漂移

---

## 1. 解析参数

**模式：**
- `/regression-suite update` — 扫描本次冲刺中新修复的错误并检查是否存在回归测试；将新测试添加到套件清单中
- `/regression-suite audit` — 对照现有测试覆盖情况，全面审计所有 GDD 关键路径；标记没有回归测试的路径
- `/regression-suite report` — 只读状态报告（不写入）；适用于冲刺评审
- 无参数 — 如果明显存在活跃冲刺（冲刺计划已存在且包含进行中的故事），则运行 `update`。如果情况不明确或未检测到活跃冲刺，则使用 `AskUserQuestion`：
  - 提示："未指定子命令。你想运行哪种模式？"
  - 选项：
    - `[A] update — 扫描本次冲刺中新修复的错误并添加缺失的回归测试`
    - `[B] audit — 对照现有测试覆盖情况，全面审计所有 GDD 关键路径`
    - `[C] report — 只读状态报告（不写入）`

---

## 2. 加载上下文

### 步骤 2a — 加载现有回归测试套件

如果 `tests/regression-suite.md` 存在，则读取它。提取：
- 已登记的回归测试总数
- 最后更新日期
- 任何标记为 `STALE` 或 `QUARANTINED` 的测试

如果不存在：注明“未找到回归测试套件 — 将创建一个。”

### 步骤 2b — 加载测试清单

对以下所有测试文件执行 Glob：
```
tests/unit/**/*_test.*
tests/integration/**/*_test.*
tests/regression/**/*
```

对于每个文件，记录其所属系统（根据目录路径判断）和文件名。
除非进行名称到测试的映射时需要，否则不要读取测试文件内容。

### 步骤 2c — 加载 GDD 关键路径

对于 `audit` 模式：读取 `design/gdd/systems-index.md` 以获取所有系统。
对于每个 MVP 层级的系统，读取其 GDD 并提取：
- 验收标准（这些标准定义了关键路径）
- 公式部分（公式必须有回归测试）
- 边界情况部分（已知边界情况应有回归测试）

对于 `update` 模式：跳过完整的 GDD 扫描。改为读取当前冲刺计划和故事文件，以查找本次冲刺中 `Status: Complete` 的故事。

### 步骤 2d — 加载已关闭的错误

对 `production/qa/bugs/*.md` 执行 Glob，并筛选含有 `Status: Closed` 或 `Status: Fixed` 字段的错误。记录：
- 错误出现在哪个故事或系统中
- 修复说明中是否提到了回归测试

---

## 3. 映射覆盖范围 — 关键路径

仅适用于 `audit` 模式：

对于每条 GDD 验收标准，确定是否存在相应测试：

1. 在 `tests/unit/[system]/` 和 `tests/integration/[system]/` 中使用 Grep 搜索与该标准的关键名词/动词相关的文件名和函数名
2. 指定覆盖状态：

| 状态 | 含义 |
|--------|---------|
| **已覆盖** | 存在针对该标准逻辑的测试文件 |
| **部分覆盖** | 存在测试，但未覆盖所有情况（例如仅覆盖正常路径） |
| **缺失** | 未找到针对该关键路径的测试 |
| **豁免** | 视觉/体验或 UI 标准——按设计无法自动化 |

3. 将与公式或状态机对应的缺失项提升为**高优先级**缺口——这些是最有可能导致回归的来源。

---

## 4. 映射覆盖情况——已修复的 Bug

对于每个已关闭的 Bug：

1. 从 Bug 的元数据中提取系统 slug
2. 在 `tests/unit/[system]/` 和 `tests/integration/[system]/` 中使用 Grep 搜索引用该 Bug ID 或具体故障场景的测试
3. 指定：
   - **有回归测试**——找到了能够捕获此 Bug 的测试
   - **缺少回归测试**——Bug 已修复，但没有测试防止其再次出现

对于缺少回归测试的项目：
- 将其标记为回归缺口
- 建议测试文件路径：`tests/unit/[system]/[bug-slug]_regression_test.[ext]`
- 注明：“如果没有此测试，这个 Bug 可能会在未来的冲刺中悄然重现。”

---

## 5. 检测覆盖漂移

当游戏不断扩展，而回归测试套件没有同步扩展时，就会发生覆盖漂移。

检查以下漂移指标：
- 本次冲刺中已完成，但在 `tests/` 中没有对应测试文件的故事
- 自上次更新回归测试套件以来，新增到 `systems-index.md` 的系统
- 自上次更新回归测试套件以来，新增或修订的 GDD 章节
  （如果有可用的 GDD 文件修改提示，则使用 Grep；否则询问用户）
- 比较 `tests/regression-suite.md` 的最后更新日期与当前日期——如果间隔 >
  2 个冲刺，则标记为可能已过时

---

## 6. 生成报告和套件清单

### 报告格式（在对话中）

```
## Regression Suite Status

**Mode**: [update | audit | report]
**Existing registered tests**: [N]
**Test files scanned**: [N]

### Critical Path Coverage (audit mode only)
| System | Total ACs | Covered | Partial | Missing | Exempt |
|--------|-----------|---------|---------|---------|--------|
| [name] | [N] | [N] | [N] | [N] | [N] |

**Coverage rate (non-exempt)**: [N]%

### Bug Regression Coverage
| Bug ID | System | Severity | Has Regression Test? |
|--------|--------|----------|----------------------|
| BUG-NNN | [system] | S[N] | YES / NO ⚠ |

**Bugs without regression tests**: [N]

### Coverage Drift Indicators
[List new systems or stories with no test coverage, or "None detected."]

### Recommended New Regression Tests
| Priority | System | Suggested Test File | Covers |
|----------|--------|---------------------|--------|
| HIGH | [system] | `tests/unit/[system]/[slug]_regression_test.[ext]` | BUG-NNN / AC-[N] |
| MEDIUM | [system] | `tests/unit/[system]/[slug]_test.[ext]` | [criterion] |
```

### 套件清单格式（`tests/regression-suite.md`）

该清单是一份经过筛选的索引——它本身并不是测试，而是一个登记表，用于记录发布前应始终通过的测试：

```markdown
# Regression Suite Manifest

> Last Updated: [date]
> Total registered tests: [N]
> Coverage: [N]% of GDD critical paths

## How to run

[Engine-specific command to run all regression tests]

## Registered Regression Tests

### [System Name]

| Test File | Test Function (if known) | Covers | Added |
|-----------|--------------------------|--------|-------|
| `tests/unit/[system]/[file]_test.[ext]` | `test_[scenario]` | AC-N / BUG-NNN | [date] |

## Known Gaps

Tests that should exist but don't yet:

| Priority | System | Suggested Path | Covers | Reason Not Yet Written |
|----------|--------|----------------|--------|------------------------|
| HIGH | [system] | `tests/unit/[system]/[path]` | BUG-NNN | Bug fixed without test |

## Quarantined Tests

Tests that are flaky or disabled (do not run in CI):

| Test File | Function | Reason | Quarantined Since |
|-----------|----------|--------|-------------------|
| (none) | | | |
```

---

## 7. 写入输出

询问：“我可以使用当前的回归套件清单写入或更新 `tests/regression-suite.md` 吗？”

对于 `update` 模式：追加新条目；切勿删除现有条目（使用 `Edit` 进行定向插入）。
对于 `audit` 模式：使用更新后的覆盖率数据重写完整清单。
对于 `report` 模式：不要写入任何内容。

写入后（如果获得批准）：

- 对于每个优先级为 HIGH 的缺口：“请考虑在下一个冲刺开始前创建缺失的回归测试。运行 `/test-helpers` 生成测试文件框架。”
- 如果错误回归缺口 > 0：“如果没有回归测试，这些错误可能会在不被察觉的情况下再次出现。下一个冲刺应包含一个用于编写缺失测试的用户故事。”
- 如果检测到覆盖率偏移：“回归套件可能正在发生偏移。请考虑在下一个冲刺边界运行 `/regression-suite audit`。”

结论：**COMPLETE**——回归套件已更新。（如果用户拒绝写入：结论：**BLOCKED**。）

---

## 协作协议

- **未经用户明确批准，绝不从清单中删除现有回归测试**——删除一个特意编写的测试本身就是一种回归风险
- **缺口仅作为建议，不会造成阻塞**——清晰地指出它们，但不要阻止其他工作继续进行（发布门禁要求回归套件时除外）
- **隔离并非删除**——对于间歇性失败的测试，应将其隔离（在清单中注明），而不是删除；应通过 `/test-flakiness` 修复这些测试
- **写入前先询问**——创建或更新清单前始终进行确认