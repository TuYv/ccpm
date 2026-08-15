---
name: smoke-check
description: "Run the critical path smoke test gate before QA hand-off. Executes the automated test suite, verifies core functionality, and produces a PASS/FAIL report. Run after a sprint's stories are implemented and before manual QA begins. A failed smoke check means the build is not ready for QA."
argument-hint: "[sprint | quick | --platform pc|console|mobile|all]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, AskUserQuestion
model: sonnet
---
# 冒烟检查

此技能是“实现完成”与“可以移交 QA”之间的关卡。它会运行自动化测试套件、检查测试覆盖率缺口、与开发者分批验证关键路径，并生成 PASS/FAIL 报告。

规则很简单：**未通过冒烟检查的构建不得移交 QA。**
将存在问题的构建交给 QA 会浪费他们的时间，也会打击团队士气。

**输出：** `production/qa/smoke-[date].md`

---

## 解析参数

参数可以组合使用：`/smoke-check sprint --platform console`

**基础模式**（第一个参数，默认值：`sprint`）：
- `sprint` — 针对当前迭代的用户故事执行完整的冒烟检查
- `quick` — 跳过覆盖率扫描（阶段 3）和批次 3；用于快速复查

**平台标志**（`--platform`，默认值：无）：
- `--platform pc` — 添加 PC 专属检查（键盘、鼠标、窗口模式）
- `--platform console` — 添加主机专属检查（手柄、电视安全区域、平台认证要求）
- `--platform mobile` — 添加移动设备专属检查（触控、横屏/竖屏、电池/温度表现）
- `--platform all` — 添加所有平台变体；输出各平台的判定表

如果提供了 `--platform`，阶段 4 将添加平台专属批次，阶段 5 除总体判定外，还将输出各平台的判定表。

---

## 阶段 1：检测测试设置

在运行任何内容之前，先了解环境：

1. **测试框架检查**：验证 `tests/` 目录是否存在。
   如果不存在：“未在 `tests/` 找到测试目录。运行 `/test-setup`
   以搭建测试基础设施；如果测试位于其他位置，也可以手动创建该目录。”
   然后停止。

2. **CI 检查**：检查 `.github/workflows/` 中是否包含引用测试的工作流文件。
   在报告中注明是否已配置 CI。

3. **引擎检测**：读取 `.claude/docs/technical-preferences.md` 并提取 `Engine:` 的值。
   保存该值，以便在阶段 2 中选择测试命令。

4. **冒烟测试列表**：检查 `production/qa/smoke-tests.md` 或 `tests/smoke/` 是否存在。
   如果找到冒烟测试列表，则加载该列表，以供阶段 4 使用。如果两者均不存在，
   则从当前 QA 计划中选取冒烟测试（阶段 4 的回退方案）。

5. **QA 计划检查**：使用 glob 匹配 `production/qa/qa-plan-*.md`，并选取最近修改的文件。
   如果找到，记录其路径——阶段 3 和阶段 4 将使用该文件。如果未找到，则注明：
   “未找到 QA 计划。为获得最佳冒烟检查结果，请先运行 `/qa-plan sprint`。”

继续之前报告检查结果：“环境：[engine]。测试目录：[found / not found]。
已配置 CI：[yes / no]。QA 计划：[path / not found]。”

---

## 阶段 2：运行自动化测试

尝试通过 Bash 运行测试套件。根据阶段 1 中检测到的引擎选择命令：

**Godot 4：**
```bash
godot --headless --script tests/gdunit4_runner.gd 2>&1
```
如果该路径下不存在 GDUnit4 运行器脚本，请尝试：
```bash
godot --headless -s addons/gdunit4/GdUnitRunner.gd 2>&1
```
如果两个路径均不存在，请注明：“未找到 GDUnit4 运行器——请确认你的测试框架所使用的运行器路径。”

**Unity：**
Unity 测试需要编辑器，在大多数环境中无法通过 shell 以无头方式运行。
检查最近的测试结果产物：
```bash
# List most recent test results (bash) — on Windows PowerShell use the fallback below
ls -t test-results/ 2>/dev/null | head -5 \
  || powershell -Command "Get-ChildItem test-results/ -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 5 -ExpandProperty Name"
```
如果存在测试结果文件（XML 或 JSON），读取最新的文件并解析
PASS/FAIL 数量。如果不存在产物：“Unity 测试必须通过
编辑器或 CI 流水线运行。请在继续之前手动确认测试状态。”

**Unreal Engine：**
```bash
# List most recent Unreal automation logs (bash) — on Windows PowerShell use the fallback below
ls -t Saved/Logs/ 2>/dev/null | grep -i "test\|automation" | head -5 \
  || powershell -Command "Get-ChildItem Saved/Logs/ -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'test|automation' } | Sort-Object LastWriteTime -Descending | Select-Object -First 5 -ExpandProperty Name"
```
如果未找到匹配的日志：“UE 自动化测试必须通过 Session
Frontend 或 CI 流水线运行。请手动确认测试状态。”

**未知引擎 / 未配置：**
“尚未在 `.claude/docs/technical-preferences.md` 中配置引擎。运行
`/setup-engine` 以指定引擎，然后重新运行 `/smoke-check`。”

**如果测试运行器在此环境中不可用**（引擎二进制文件不在
PATH 中、未找到运行器脚本等），请明确报告：

“无法执行自动化测试——在 PATH 中找不到引擎二进制文件。
状态将记录为 NOT RUN。请通过本地 IDE
或 CI 流水线确认测试结果。未经确认的 NOT RUN 将被视为 PASS WITH WARNINGS，而非
FAIL——开发者必须手动确认结果。”

不要将 NOT RUN 自动视为 FAIL。将其记录为警告。
开发者在阶段 4 中的手动确认可以解决此问题。

解析运行器输出并提取：
- 运行的测试总数
- 通过数量
- 失败数量
- 所有失败测试的名称（最多 10 个；如果更多，请注明数量）
- 运行器本身的所有崩溃或错误输出

---

## 阶段 3：检查测试覆盖率

按以下优先顺序获取故事列表：
1. 阶段 1 中找到的 QA 计划（其测试摘要表列出了每个故事的预期测试
   文件路径）
2. `production/sprints/` 中的当前冲刺计划（最近修改的
   文件）
3. 如果传入了 `quick` 参数，则完全跳过此阶段并注明：
   “已跳过覆盖率扫描——运行 `/smoke-check sprint` 以执行完整的覆盖率
   分析。”

对于范围内的每个故事：

1. 从故事的文件路径中提取系统标识符
   （例如，`production/epics/combat/story-001.md` → `combat`）
2. 使用 Glob 在 `tests/unit/[system]/` 和 `tests/integration/[system]/` 中查找
   文件名包含故事标识符或密切相关术语的文件
3. 检查故事文件本身是否包含 `Test file:` 标头字段或
   “测试证据”部分

为每个故事分配一个覆盖状态：

| 状态 | 含义 |
|--------|---------|
| **COVERED** | 找到了与该故事的系统和范围相匹配的测试文件 |
| **MANUAL** | 故事类型为 Visual/Feel 或 UI；找到了测试证据文档 |
| **MISSING** | Logic 或 Integration 故事没有匹配的测试文件 |
| **EXPECTED** | Config/Data 故事——不需要测试文件；抽查即可 |
| **UNKNOWN** | 故事文件缺失或无法读取 |

MISSING 条目属于提示性缺口。它们不会导致 FAIL 结论，但必须
在报告中突出显示，并且必须先解决这些缺口，`/story-done` 才能
完全关闭这些故事。

---

## 阶段 4：运行手动冒烟检查

按以下优先级获取冒烟测试检查清单：
1. QA 计划的“Smoke Test Scope”部分（如果在阶段 1 中找到了 QA 计划）
2. `production/qa/smoke-tests.md`（如果存在）
3. `tests/smoke/` 目录内容（如果存在）
4. 下方的标准后备清单（仅在以上内容均不存在时使用）

根据冲刺或 QA 计划中识别出的实际系统调整批次 2 和批次 3。将方括号中的占位符替换为当前
冲刺故事中的真实机制名称。

使用 `AskUserQuestion` 进行批量验证。最多调用 3 次。

**批次 1——核心稳定性（始终运行）：**
```
question: "Core stability — select any items that FAILED (leave all unselected if everything passed):"
multiSelect: true
options:
  - "Game does not launch or crashes before reaching the main menu"
  - "New game / session fails to start"
  - "Main menu does not respond to inputs"
  - "Crash or hang observed during basic navigation"
```

对于任何选中的项目，在生成报告前，请用户简要描述失败的具体情况。

**批次 2——冲刺变更与回归（始终运行）：**
```
question: "Sprint changes and regression — select any items that FAILED (leave all unselected if everything passed):"
multiSelect: true
options:
  - "[Primary mechanic this sprint] — FAILED"
  - "[Second notable change this sprint, if any] — FAILED"
  - "Regression in a previous sprint's feature — FAILED"
  - "Other unexpected breakage observed — FAILED"
```

对于任何选中的项目，在生成报告前，请用户简要描述损坏的具体情况。

**批次 3——数据完整性与性能（除非使用 `quick` 参数，否则运行）：**
```
question: "Data integrity and performance — select any items that FAILED or were skipped (leave all unselected if everything passed):"
multiSelect: true
options:
  - "Save / load — FAILED (data loss or corruption observed)"
  - "Save / load — N/A (save system not yet implemented)"
  - "Frame rate drops or hitches observed — FAILED"
  - "Performance not checked this session"
```

对于任何选中的 FAILED 项目，在生成报告前，请用户描述损坏的具体情况。

逐字记录每条回复，以用于阶段 5 的报告。

**平台批次** *（仅在提供了 `--platform` 参数时运行）*：

**PC 平台**（`--platform pc` 或 `--platform all`）：
```
question: "PC Platform — select any items that FAILED (leave all unselected if everything passed):"
multiSelect: true
options:
  - "Keyboard controls — FAILED (describe issue after)"
  - "Mouse input or cursor visibility — FAILED (describe issue after)"
  - "Windowed / fullscreen mode — FAILED (describe issue after)"
  - "Resolution change — FAILED (describe issue after)"
```

对于任何选中的项目，在生成报告之前，请用户简要描述具体的失败情况。

**主机平台**（`--platform console` 或 `--platform all`）：
```
question: "Console Platform — select any items that FAILED (leave all unselected if everything passed):"
multiSelect: true
options:
  - "Gamepad input — FAILED (describe issue after)"
  - "UI outside TV safe zone / text clipped — FAILED (describe what is clipped after)"
  - "Keyboard/mouse fallback shown to gamepad user — FAILED (describe after)"
  - "Cold start (no prior save) — FAILED (describe issue after)"
```

对于任何选中的项目，在生成报告之前，请用户简要描述具体的失败情况。

**移动平台**（`--platform mobile` 或 `--platform all`）：
```
question: "Mobile Platform — select any items that FAILED (leave all unselected if everything passed):"
multiSelect: true
options:
  - "Touch controls — FAILED (describe issue after)"
  - "Orientation change (portrait ↔ landscape) — FAILED (describe what breaks after)"
  - "Background / foreground transition (home button) — FAILED (describe issue after)"
  - "Performance / thermal throttling on target device — FAILED (describe after)"
```

对于任何选中的项目，在生成报告之前，请用户简要描述具体的失败情况。

---

## 阶段 5：生成报告

汇总完整的冒烟检查报告：

````markdown
## Smoke Check Report
**Date**: [date]
**Sprint**: [sprint name / number, or "Not identified"]
**Engine**: [engine]
**QA Plan**: [path, or "Not found — run /qa-plan first"]
**Argument**: [sprint | quick | blank]

---

### Automated Tests

**Status**: [PASS ([N] tests, [N] passing) | FAIL ([N] failures) |
NOT RUN ([reason])]

[If FAIL, list failing tests:]
- `[test name]` — [brief failure description from runner output]

[If NOT RUN:]
"Manual confirmation required: did tests pass in your local IDE or CI? This
will determine whether the automated test row contributes to a FAIL verdict."

---

### Test Coverage

| Story | Type | Test File | Coverage Status |
|-------|------|-----------|----------------|
| [title] | Logic | `tests/unit/[system]/[slug]_test.[ext]` | COVERED |
| [title] | Visual/Feel | `tests/evidence/[slug]-screenshots.md` | MANUAL |
| [title] | Logic | — | MISSING ⚠ |
| [title] | Config/Data | — | EXPECTED |

**Summary**: [N] covered, [N] manual, [N] missing, [N] expected.

---

### Manual Smoke Checks

- [x] Game launches without crash — PASS
- [x] New game starts — PASS
- [x] [Core mechanic] — PASS
- [ ] [Other check] — FAIL: [user's description]
- [x] Save / load — PASS
- [-] Performance — not checked this session

---

### Missing Test Evidence

Stories that must have test evidence before they can be marked COMPLETE via
`/story-done`:

- **[story title]** (`[path]`) — Logic story has no test file.
  Expected location: `tests/unit/[system]/[story-slug]_test.[ext]`

[If none:] "All Logic and Integration stories have test coverage."

---

### Platform-Specific Results *(only if `--platform` was provided)*

| Platform | Checks Run | Passed | Failed | Platform Verdict |
|----------|-----------|--------|--------|-----------------|
| PC | [N] | [N] | [N] | PASS / FAIL |
| Console | [N] | [N] | [N] | PASS / FAIL |
| Mobile | [N] | [N] | [N] | PASS / FAIL |

**Platform notes**: [any platform-specific observations not captured in pass/fail]

Any platform with one or more FAIL checks contributes to the overall FAIL verdict.

---

### Verdict: [PASS | PASS WITH WARNINGS | FAIL]

[Verdict rules — first matching rule wins:]

**FAIL** if ANY of:
- Automated test suite ran and reported one or more test failures
- Any Batch 1 (core stability) check returned FAIL
- Any Batch 2 (primary sprint mechanic or regression check) returned FAIL

**PASS WITH WARNINGS** if ALL of:
- Automated tests PASS or NOT RUN (developer has not yet confirmed)
- All Batch 1 and Batch 2 smoke checks PASS
- One or more Logic/Integration stories have MISSING test evidence

**PASS** if ALL of:
- Automated tests PASS
- All smoke checks in all batches PASS or N/A
- No MISSING test evidence entries
````

---

## 阶段 6：编写报告并给出门禁结论

在对话中展示完整报告，然后询问：

“我可以将此冒烟检查报告写入 `production/qa/smoke-[date].md` 吗？”

仅在获得批准后写入。

写入后，给出门禁结论：

**如果结论为 FAIL：**

“冒烟检查失败。在解决以下失败项之前，请勿移交 QA：

[列出每个失败的自动化测试或冒烟检查，并用一行文字进行说明]

修复这些失败项并再次运行 `/smoke-check`，以便在移交 QA 前重新执行门禁检查。”

**如果结论为 PASS WITH WARNINGS：**

“冒烟检查通过，但存在警告。该构建已准备好进行人工 QA。

在对受影响的用户故事运行 `/story-done` 之前，需要解决的建议项：
[列出 MISSING 测试证据条目]

QA 移交：将 `production/qa/qa-plan-[sprint].md` 分享给 qa-tester
智能体，以开始人工验证。”

**如果结论为 PASS：**

“冒烟检查完全通过。该构建已准备好进行人工 QA。

QA 移交：将 `production/qa/qa-plan-[sprint].md` 分享给 qa-tester
智能体，以开始人工验证。”

---

## 协作协议

- **绝不要将 NOT RUN 自动视为 FAIL** — 将其记录为 NOT RUN，并让
  开发者手动确认状态。未经确认的 NOT RUN 会导致
  PASS WITH WARNINGS，而不是 FAIL。
- **绝不要自动修复失败项** — 报告这些失败项，并说明必须解决哪些问题。
  不要尝试编辑源代码或测试文件。
- **PASS WITH WARNINGS 不会阻止 QA 移交** — 它会记录需要由
  `/story-done` 跟进的建议性缺口。
- **`quick` 参数**会跳过阶段 3（覆盖率扫描）和阶段 4 的批次 3。
  修复特定失败项后，可使用它进行快速复查。
- 所有人工冒烟检查验证均使用 `AskUserQuestion`。
- **绝不要在未询问的情况下写入报告** — 阶段 6 要求在创建任何文件之前
  获得明确批准。