---
name: ln-636-manual-test-auditor
description: "Audits manual test evidence quality: reproducibility, fail-fast behavior, expected evidence/golden files, idempotency, and documentation. Use when auditing manual tests."
allowed-tools: Read, Grep, Glob, Bash
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 手动证据审计器（L3 工作器）

**类型：** L3 工作器

专门用于审计手动测试脚本是否能生成可复现且有用的证据。

## 目的与范围

- 审计**手动证据**（类别 7：中优先级）
- 按质量维度评估 `tests/manual/` 中的 bash 测试脚本
- 输出 `REWRITE_MANUAL_EVIDENCE` 或 `KEEP_MANUAL_EVIDENCE`
- 计算合规分数（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`testFilesMetadata`（已筛选为 `type: "manual"`）、`codebase_root`、`output_dir`。

手动测试元数据包括：`suite_dir`、`has_expected_dir`、`harness_sourced`。

## 工作流程

检测策略：采用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法不明确时才加载 `references/two_layer_detection.md`。

1) **解析上下文：** 从 contextStore 中提取手动测试文件列表、output_dir、codebase_root
2) **发现基础设施：** 检测共享基础设施文件：
   - `tests/manual/config.sh` -- 共享配置
   - `tests/manual/test_harness.sh` -- 共享测试框架（如果存在）
   - `tests/manual/test-all.sh` -- 主运行器
   - `tests/manual/TEMPLATE-*.sh` -- 测试模板（如果存在）
   - `tests/manual/regenerate-golden.sh` -- 黄金文件重新生成脚本（如果存在）
3) **扫描脚本（第 1 层）：** 对每个手动测试脚本，检查 7 个质量维度（参见审计规则）
3b) **上下文分析（第 2 层——强制）：** 对于每个候选发现，询问：
   - 这是设置/实用工具脚本吗（例如 `00-setup/*.sh`、`tools/*.sh`）？设置脚本有不同的要求——跳过测试框架/黄金文件检查
   - 这是主运行器（`test-all.sh`）吗？主运行器负责编排，而非测试——除快速失败外，跳过所有检查
   - 项目是否完全不使用共享测试框架？如果不存在 `test_harness.sh`，则测试框架采用情况检查不适用
4) **收集发现：** 记录违规项及其严重程度、位置（file:line）、工作量、操作和建议
5) **计算分数：** 按严重程度统计违规项，并计算合规分数（X/10）
6) **编写报告：** 按照 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过单次 Write 调用写入 `{output_dir}/ln-636--global.md`
7) **返回摘要：** 向协调器返回最简摘要（参见输出格式）

## 审计规则

### 1. 测试框架采用情况

**内容：** 测试脚本使用共享框架（`run_test`、`init_test_state`），而非自定义断言逻辑

**检测：**
- 在脚本中 Grep `run_test`、`init_test_state`
- 如果不存在，并且脚本包含自定义测试循环/断言 -> 自定义逻辑
- 如果项目中不存在 `test_harness.sh` -> 完全跳过此项检查

**严重程度：** **高**（自定义逻辑会增加维护负担，并导致报告不一致）

**建议：** 重构为使用 test_harness.sh 中共享的 `run_test`
**操作：** `REWRITE_MANUAL_EVIDENCE`

**工作量：** M

### 2. 黄金文件完整性

**内容：** 测试套件包含 `expected/` 目录，其中的参考文件与测试场景相匹配

**检测：**
- 检查套件目录是否包含 `expected/` 子目录
- 比较测试场景数量（通过 grep 查找 `run_test` 调用）与预期文件数量
- 如果测试使用 `diff` 与预期文件进行比较，但缺少预期目录 -> 记为问题

**第二层判断：** 并非所有测试都需要黄金文件。验证 HTTP 状态码、计时或动态数据的测试可能合理地跳过黄金文件比较 -> 如果测试中没有 `diff` 或与文件进行比较，则跳过

**严重性：** **高**（没有黄金文件 = 无法针对输出正确性进行回归检测）

**建议：** 添加包含参考输出文件的 expected/ 目录
**操作：** `REWRITE_MANUAL_EVIDENCE`

**工作量：** M

### 3. 配置引入

**内容：** 脚本引入共享的 `config.sh`，以确保配置一致

**检测：**
- Grep 查找 `source.*config.sh` 或 `. .*config.sh`
- 如果不存在 -> 脚本自行管理 BASE_URL、令牌等

**第二层判断：** 如果脚本是独立工具（例如 `tools/*.sh`）-> 跳过

**严重性：** **中**

**建议：** 添加 `source "$THIS_DIR/../config.sh"` 以使用共享配置
**操作：** `REWRITE_MANUAL_EVIDENCE`

**工作量：** S

### 4. 快速失败合规性

**内容：** 脚本使用 `set -e`，并在失败时返回退出码 1

**检测：**
- Grep 查找 `set -e`（或 `set -eo pipefail`）
- 检查失败路径是否会产生非零退出码（而不是到处被 `|| true` 吞掉）

**严重性：** **高**（静默失败会掩盖已损坏的测试）

**建议：** 在脚本开头添加 `set -e`，确保测试失败能够向上传播
**操作：** `REWRITE_MANUAL_EVIDENCE`

**工作量：** S

### 5. 模板合规性

**内容：** 脚本遵循项目测试模板（TEMPLATE-api-endpoint.sh、TEMPLATE-document-format.sh）

**检测：**
- 如果 `tests/manual/` 中存在 TEMPLATE 文件，则检查结构是否一致：
  - 包含描述、所测试 AC 和前置条件的头部注释块
  - 标准变量命名（`THIS_DIR`、`EXPECTED_DIR`）
  - 标准设置模式（`source config.sh`、`check_jq`、`setup_auth`）
- 如果项目中不存在模板 -> 完全跳过此项检查

**第二层判断：** 在模板出现之前编写的旧脚本可能会有所不同。标记为中，而不是高

**严重性：** **中**

**建议：** 使脚本结构与项目 TEMPLATE 文件保持一致
**操作：** `REWRITE_MANUAL_EVIDENCE`

**工作量：** M

### 6. 幂等性

**内容：** 脚本可以安全地重复运行，不会受到先前运行所产生副作用的影响

**检测：**
- Grep 查找清理模式：`trap.*EXIT`、`rm -f`、`cleanup` 函数
- 检查是否创建了临时文件却未进行清理
- 检查是否存在会在重新运行时发生冲突的硬编码资源名称（例如，使用固定电子邮件地址创建用户，却不检查该用户是否已存在）

**第二层判断：** 仅仅读取数据的脚本（GET 请求、查询）本身就是幂等的 -> 跳过

**严重性：** **中**

**建议：** 添加清理 trap，或为每次运行使用唯一标识符
**操作：** `REWRITE_MANUAL_EVIDENCE`

**工作量：** S-M

### 7. 文档

**内容：** 测试套件目录中包含 README.md，用于说明用途和前置条件

**检测：**
- 检查套件目录（`NN-feature/`）是否包含 README.md
- 如果缺失 -> 记录发现项

**第 2 层：** 初始化目录（`00-setup/`）和工具目录（`tools/`）可能不需要 README -> 跳过

**严重程度：** **低**

**建议：** 添加 README.md，说明测试用途、前置条件和使用方法
**操作：** `REWRITE_MANUAL_EVIDENCE`

**工作量：** S

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

**严重程度映射：**
- 未采用测试框架（存在测试框架时）、无黄金文件（基于预期结果时）、无快速失败机制 -> 高
- 未加载配置、与模板存在偏差、非幂等 -> 中
- 缺少 README -> 低

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程按照共享契约生成自己的运行范围制品路径。

将报告写入 `{output_dir}/ln-636--global.md`，其中 `category: "Manual Evidence"`，检查项包括：harness_adoption、golden_file_completeness、config_sourcing、fail_fast_compliance、template_compliance、idempotency、documentation。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-636--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告
- **工作量须符合实际：** S = <1h，M = 1-4h，L = >4h
- **为空时跳过：** 如果不存在 `tests/manual/` 目录，则返回 10/10 分且发现项为零
- **排除非测试文件：** 跳过 `config.sh`、`test_harness.sh`、`test-all.sh`、`regenerate-golden.sh`、`TEMPLATE-*.sh`，以及 `tools/`、`results/`、`test-runs/` 中的文件
- **感知上下文：** 初始化脚本（`00-setup/`）适用宽松要求（无需黄金文件，也无需测试框架）
- **独特视角：** 仅审计手动测试证据。不要评判自动化测试的价值、E2E 优先级、产品行为、覆盖缺失、可信度、判定依据强度或结构。
- **必须指定操作：** 对发现项使用 `REWRITE_MANUAL_EVIDENCE`。在报告摘要中将合规脚本汇总为 `KEEP_MANUAL_EVIDENCE`，不要将其作为发现项。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 成功解析 contextStore（包括 output_dir）
- [ ] 已发现手动测试基础设施（config.sh、测试框架、模板）
- [ ] 已对每个测试脚本完成全部 7 项检查
- [ ] 已应用第 2 层上下文分析（初始化/工具排除项）
- [ ] 已收集包含严重程度、位置、工作量、操作和建议的发现项
- [ ] 已使用扣分算法计算分数
- [ ] 已将报告写入 `{output_dir}/ln-636--global.md`（单次原子 Write 调用）
- [ ] 已按照契约写入摘要

## 参考文件

- **审计输出架构：** `references/audit_output_schema.md`

---
**版本：** 1.0.0
**最后更新：** 2026-03-13