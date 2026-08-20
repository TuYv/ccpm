---
name: ln-625-dependency-reuse-auditor
description: "Checks dependency health and generic custom utility/integration replacement opportunities. Use when auditing dependency and reuse risk."
allowed-tools: Read, Grep, Glob, Bash, WebFetch, WebSearch, mcp__hex-graph__audit_workspace, mcp__hex-graph__find_references, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 依赖与复用审计器（L3 工作器）

**类型：** L3 工作器

专门用于审计依赖项健康状况和复用风险的工作器。

## 目的与范围

- 支持 `vulnerabilities_only` 模式，用于仅检查漏洞的运行
- 审计**依赖项和复用风险**（类别 7+8：中优先级）
- 检查过时/无人维护的软件包、未使用的依赖项、**CVE 漏洞**，以及应使用原生/现有/开源替代方案的通用自定义工具/集成模块
- 输出 `PATCH_DEPENDENCY`、`REMOVE_DEPENDENCY` 或 `REPLACE_CUSTOM_UTILITY`
- 计算合规评分（X/10）

## 参数

| 参数 | 可选值 | 默认值 | 说明 |
|-------|--------|---------|-------------|
| mode | `full` / `vulnerabilities_only` | `full` | `full` = 全部 5 项检查，`vulnerabilities_only` = 仅进行 CVE 扫描 |

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时主机的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含技术栈、软件包清单路径、代码库根目录和 output_dir 的 `contextStore`。

默认使用 `mode=full`。当仅要求提供软件包漏洞发现时，使用 `mode=vulnerabilities_only`。

当依赖项引用或代码复用证据能够实质性改进审计时，优先使用 `hex-graph`。在可用时，优先使用 `hex-line` 读取本地代码。如果 MCP 不可用、不受支持或未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明所使用的回退方案。

## 工作流

检测策略：使用两层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) 解析上下文、mode 参数和 output_dir
2) 运行依赖项检查（第 1 层：根据 mode 使用审计工具）
3) 按候选项分析上下文（第 2 层）：
   - 可用功能：读取使用情况——lodash 是仅用于 1 个函数（易于替换），还是深度集成（难以替换）？
   - 自定义工具替换：读取代码——它确实是通用工具/集成，还是领域特定逻辑？
   - 漏洞：读取代码——此项目中是否实际调用了存在漏洞的 API？
4) 收集发现
5) 计算评分
6) **写入报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，通过单次 Write 调用写入 `{output_dir}/ln-625--global.md`
7) **返回摘要：** 返回最简摘要

---

## 审计规则（5 项检查）

### 1. 过时的软件包
**模式：** 仅限 full

**检测：**
- 运行 `npm outdated --json`（Node.js）
- 运行 `pip list --outdated --format=json`（Python）
- 运行 `cargo outdated --format=json`（Rust）

**严重程度：**
- **高：** 落后一个主版本（安全风险）
- **中：** 落后一个次版本
- **低：** 落后一个补丁版本

**建议：** 更新到最新版本，并测试是否存在破坏性变更

**工作量：** S-M（更新版本，运行测试）

### 2. 未使用的依赖项
**模式：** 仅 full

**检测：**
- 解析 package.json/requirements.txt
- 在代码库中搜索 `import`/`require` 语句
- 找出从未导入的依赖项

**严重程度：**
- **中：** 未使用的生产依赖项（会增大软件包体积）
- **低：** 未使用的开发依赖项

**建议：** 从软件包清单中移除

**工作量：** S（删除相应行，进行测试）

### 3. 未使用的可用功能
**模式：** 仅 full

**检测：**
- 在原生 fetch 可用时（Node 18+），检查是否使用了 axios
- 在数组方法足够时，检查是否使用了 lodash
- 在 Date.toLocaleString 足够时，检查是否使用了 moment

**严重程度：**
- **中：** 不必要的依赖项（会增加软件包体积）

**建议：** 使用原生替代方案

**工作量：** M（重构代码以使用原生 API）

### 4. 通用自定义实用工具/集成的替换
**模式：** 仅 full

**检测：**
- 在 `utils/`、`lib/`、`helpers/`、`common/`、`shared/`、`pkg/`、`internal/` 中查找重要的自定义实用工具/集成文件
- 查找 parser、formatter、validator、converter、encoder、serializer、logger、cache、queue、scheduler、mailer、http、client、wrapper、adapter、connector 等名称
- 在建议替换之前阅读代码以确定其用途
- 优先选择原生平台 API、项目已有依赖项，其次选择维护良好的开源软件包

**严重程度：**
- **高：** 对超过 200 LOC 的通用模块存在高置信度的替代方案，或自定义加密/序列化功能有更安全的成熟替代方案
- **中：** 对 100-200 LOC 的模块存在高置信度的替代方案，或存在具有明显维护优势的中等置信度替代方案
- **低：** 存在部分替换机会或可使用原生 API 进行清理

**第 2 层：**
- 跳过特定领域的业务逻辑
- 功能对等程度低于 80% 时跳过
- 在建议使用开源软件之前，使用可用的研究工具检查其维护情况、许可证兼容性和已知安全公告

**建议：** 替换为原生 API、已有依赖项提供的功能或经过审查的开源替代方案

**工作量：** M（集成库，替换调用）

### 5. 漏洞扫描（CVE/CVSS）
**模式：** full 和 vulnerabilities_only

**检测：**
- 检测生态系统：npm、NuGet、pip、Go、Bundler、Cargo、Composer
- 按照 `references/vulnerability_commands.md` 运行各生态系统的审计命令
- 按照 `references/cvss_severity_mapping.md` 中的 CVSS 映射解析结果

**严重程度：**
- **严重：** CVSS 9.0-10.0（需要立即修复）
- **高：** CVSS 7.0-8.9（在 48 小时内修复）
- **中：** CVSS 4.0-6.9（在 1 周内修复）
- **低：** CVSS 0.1-3.9（方便时修复）

**修复分类：**
- 补丁版本更新 (x.x.Y) -> 可安全自动修复
- 次版本更新 (x.Y.0) -> 通常安全
- 主版本更新 (Y.0.0) -> 需要人工审查
- 没有可用修复 -> 记录并监控

**建议：** 更新到已修复的版本，并验证锁文件的完整性

**工作量：** S-L（取决于破坏性变更）

---

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

**注意：** 当 mode=vulnerabilities_only 时，仅根据漏洞发现项评分。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器根据共享契约生成自己的运行作用域产物路径。

将报告写入 `{output_dir}/ln-625--global.md`，其中 `category: "Dependency & Reuse Risk"`，检查项为：outdated_packages、unused_deps、available_natives、custom_utility_replacement、vulnerability_scan。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-625--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 参考文件

| 文件 | 用途 |
|------|---------|
| `references/vulnerability_commands.md` | 特定于生态系统的审计命令 |
| `references/ci_integration_guide.md` | CI/CD 集成指南 |
| `references/cvss_severity_mapping.md` | CVSS 到严重性级别的映射 |
| `references/audit_output_schema.md` | 审计输出模式 |

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告，绝不修改包清单或锁文件
- **模式感知执行：** 在 `vulnerabilities_only` 模式下，完全跳过检查 1-4
- **工作量务实估算：** S = <1h，M = 1-4h，L = >4h
- **基于 CVSS 的严重性：** 严格按照 `references/cvss_severity_mapping.md` 映射漏洞严重性
- **排除项：** 在提升漏洞严重性时跳过 devDependencies，并跳过 vendored/bundled 依赖项
- **独特视角：** 仅审计依赖项/包的健康状况和通用复用机会。不要审计应用程序的可利用性、架构现代化或特定领域的业务逻辑。
- **操作要求：** 每个发现项使用 `PATCH_DEPENDENCY`、`REMOVE_DEPENDENCY` 或 `REPLACE_CUSTOM_UTILITY`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已解析 contextStore（包括 mode 参数和 output_dir）
- [ ] 已完成所有适用的检查（完整模式为 5 项，vulnerabilities_only 模式为 1 项）
- [ ] 在提出替换建议之前，已对通用自定义实用工具/集成候选项进行分类
- [ ] 已收集发现项，包括 severity、location、effort、action、fix_type、recommendation
- [ ] 已按照 `references/audit_scoring.md` 计算评分
- [ ] 已将报告写入 `{output_dir}/ln-625--global.md`（通过一次原子 Write 调用）
- [ ] 已按照契约写入摘要

---
**版本：** 4.0.0
**最后更新：** 2026-02-05