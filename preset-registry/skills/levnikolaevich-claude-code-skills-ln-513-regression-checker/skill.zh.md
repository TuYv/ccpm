---
name: ln-513-regression-checker
description: "Runs existing test suite to catch regressions after implementation changes. Use when Story needs regression verification. No status changes."
license: MIT
model: claude-haiku-4-5
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 回归检查器

**类型：** L3 工作器  
**类别：** 5XX 质量

运行现有测试套件，以确保实现变更后未引入回归问题。

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | 是 | 参数、git 分支、看板、用户 | 要处理的 Story |

**解析方式：** Story 解析链。  
**状态筛选器：** To Review

## 目的与范围
- 检测测试框架（pytest/jest/vitest/go test/等）和测试目录。
- 执行完整测试套件；捕获 stdout/stderr，以用于 Story 质量门禁。
- 返回包含计数/日志摘录的 PASS/FAIL；绝不修改 Linear 或看板。
- 保留完整的 stdout/stderr 输出，以供下游日志分析。

## 使用时机
- 代码质量检查通过后
- 代码质量检查已通过

## 工作流

### 阶段 0：解析输入

**强制阅读：** 加载 `references/input_resolution_pattern.md`、`references/ci_tool_detection.md`

1. **解析 storyId：** 按照指南运行 Story 解析链（状态筛选器：[To Review]）。

### 阶段 1：执行测试

**强制阅读：** 加载 `references/output_normalization.md`

读取目标项目文件（如果存在）：`docs/project/infrastructure.md`、`docs/project/runbook.md`

1) 根据 ci_tool_detection.md 命令注册表（测试框架部分）自动发现测试框架。  
2) 从 infrastructure.md 获取服务端点和端口分配。从 runbook.md 获取准确的测试命令、Docker 设置和环境变量。Runbook 命令的优先级高于自动检测（遵循 ci_tool_detection.md 的发现层级）。  
3) 构建适当的测试命令；设置超时后运行（根据 ci_tool_detection.md，每次 5 分钟）；捕获 stdout/stderr。  
4) 解析结果：通过/失败数量；关键失败测试。  
5) **标准化并对失败进行分组：** 将 `references/output_normalization.md` §1-§3 应用于测试输出。按错误类别（Import/Module、Assertion、Timeout、Type、Connection、Runtime）对失败测试进行分组。分组报告，例如：“auth/ 中有 3 个 Import 错误，payment/ 中有 2 个 Assertion 不匹配”。  
6) 输出判定 JSON（PASS 或 FAIL + 分组后的失败列表），并添加 Linear 评论。

## 关键规则
- 不得选择性运行测试；必须运行完整测试套件。
- 不得修复测试或更改状态；仅报告结果。
- 在评论中保留原语言（EN/RU）。

## 运行时摘要制品

**强制阅读：** 加载 `references/quality_summary_contract.md`、`references/quality_worker_runtime_contract.md`

运行时配置：
- 系列：`quality-worker`
- 工作器：`ln-513`
- 摘要类型：`quality-worker`
- 协调器使用的有效载荷字段：`worker`、`status`、`verdict`、`issues`、`warnings`、`artifact_path`

调用规则：
- 独立运行：省略 `runId` 和 `summaryArtifactPath`
- 托管运行：同时传入 `runId` 和准确的 `summaryArtifactPath`
- 始终在终止结果前写入已验证的摘要

**Monitor（2.1.98+）：** 对于预计耗时超过 30 秒的测试套件命令，使用 `Monitor`。回退方案：`Bash(run_in_background=true)`。

## 完成定义

- [ ] 已检测到框架；已执行命令
- [ ] 已解析结果；已生成判定结果，并列出失败的测试（如有）
- [ ] 已在跟踪器中发布包含摘要的评论

## 参考文件
- 下游使用的基于风险的限制：`references/risk_based_testing_guide.md`
- **CI 工具检测：** `references/ci_tool_detection.md`
- **输出规范化：** `references/output_normalization.md`
- **Pytest 模式：** `references/pytest_configuration.md`

---
**版本：** 3.1.0
**最后更新：** 2026-01-09