---
name: security-audit
description: Audit a codebase or directory for security issues (hardcoded secrets, injection, unsafe deserialization, weak crypto, authz gaps) and produce a structured findings report. Use when the user asks for a security review, an audit, or to check code for vulnerabilities. Report only — never fix.
---
# security-audit — 审查代码中的安全问题，仅报告结果

## 1. 收集范围

确定要审计的对象（目录、差异或模块）。使用 sys_os_* / git 自行收集——这是准备工作，不是调查。

## 2. 调度扫描器（目的：探索 / 搜索）

将范围交给扫描器；它会读取源代码、清单和历史记录，并返回每项发现的证据。不要自行在整个仓库中展开调查。

## 3. 汇总草稿 — 发现项模板（必须与编排器提示词一致）

对于每项发现：

    ### <Severity>: <short title>
    - **Severity**: Critical | High | Medium | Low | Info
    - **Location**: file:line
    - **Recommendation**: <fix guidance — describe it, never apply it>
    - **Confidence**: high | medium | low

## 4. 跨供应商审查（目的：审查）

将草稿交由审查器（codex，来自不同供应商）处理，以确认真正的问题并剔除误报。将其判定结果整合进来。

## 5. 交付

提交最终报告。你只负责报告；绝不编辑、修补或修复代码。