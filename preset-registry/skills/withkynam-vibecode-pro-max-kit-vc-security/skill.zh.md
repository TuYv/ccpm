---
name: vc-security
description: "STRIDE + OWASP-based security audit with optional auto-fix. Scans code for vulnerabilities, categorizes by severity, and can iteratively fix findings using vc-autoresearch pattern."
argument-hint: "<scope glob or 'full'> [--fix] [--iterations N]"
trigger_keywords: security, vulnerability, auth, XSS, SQL injection
layer: helper
metadata:
  author: claudekit
  attribution: "Security audit pattern adapted from autoresearch by Udit Goenka (MIT)"
  license: MIT
  version: "1.0.0"
---
# vc-security — 安全审计

> **输出风格：**遵循 `process/development-protocols/communication-standards.md` — 先给答案、语言平实、不使用未加解释的术语，长回复附 TL;DR。

对给定范围运行结构化的 STRIDE + OWASP 安全审计，产出按严重程度排序的发现报告。使用 `--fix` 时，会按照 vc-autoresearch 的 guard 模式迭代应用修复。

## 何时使用

- 发布或重大部署之前
- 新增认证、支付或数据处理功能之后
- 定期安全审查（每月/每季度）
- 合规检查（SOC 2、GDPR、PCI-DSS 准备）

## 何时不应使用

- 纯外观调整（CSS、文案修改）
- 不涉及面向用户的代码或数据处理

---

## 模式

| 模式 | 调用方式 | 行为 |
|------|-----------|----------|
| 仅审计 | `/vc-security <scope>` | 扫描 → 分类 → 报告 |
| 审计 + 修复 | `/vc-security <scope> --fix` | 扫描 → 分类 → 迭代修复 |
| 有限次修复 | `/vc-security <scope> --fix --iterations N` | 将修复迭代次数限制为 N |

---

## 审计方法论

### 1. 范围解析
将所提供的 glob 或 `full` 关键字展开为文件列表。在分析之前先读取所有范围内的文件。

### 2. STRIDE 分析
系统地评估每个威胁类别：
- **S**poofing（仿冒）— 身份/认证弱点
- **T**ampering（篡改）— 输入校验、完整性控制
- **R**epudiation（抵赖）— 审计日志缺失
- **I**nformation Disclosure（信息泄露）— 数据泄露、密钥暴露
- **D**enial of Service（拒绝服务）— 速率限制、资源耗尽
- **E**levation of Privilege（权限提升）— 访问控制失效、RBAC 缺口

### 3. OWASP Top 10 检查
将发现映射到 OWASP 类别（A01–A10）。各类别的检查项见 `references/stride-owasp-checklist.md`。

### 4. 依赖审计
为检测到的技术栈运行相应的包审计工具：
- Node.js: `pnpm audit`
- Python: `pip-audit`
- Go: `govulncheck`
- Ruby: `bundle audit`

### 5. 敏感信息检测
使用正则表达式模式扫描硬编码的 API 密钥、密码、令牌和私钥。参见 `references/stride-owasp-checklist.md` → Secret Patterns。

### 6. 发现分级
为每项发现分配严重程度级别（参见下方的严重程度定义）。

---

## 输出格式

```
## Security Audit Report

### Summary
- Files scanned: N
- Findings: X critical, Y high, Z medium, W low, V info

### Findings

| # | Severity | Category | File:Line | Description | Fix Recommendation |
|---|----------|----------|-----------|-------------|-------------------|
| 1 | Critical  | Injection | api/users.ts:45 | SQL string concatenation | Use parameterized queries |
| 2 | High      | Auth      | auth/login.ts:12 | No rate limiting | Add express-rate-limit |
```

---

## 修复模式（--fix）

当提供 `--fix` 时，在审计之后迭代应用修复：

1. 按严重程度对所有发现进行排序（Critical → High → Medium → Low）
2. 对每个发现：
   a. 应用一个针对性的修复
   b. 运行 guard（测试或 lint），验证无回归
   c. 提交：`security(fix-N): <short description>`
   d. 进入下一个发现
3. 如果 guard 失败则提前停止 — 报告失败而不是继续
4. 使用 `vc-autoresearch` 的 guard 模式防止回归

> 提示：当范围较大时，可使用 `--iterations N` 为总修复迭代次数设置上限。

---

## 严重程度定义

| 严重程度 | 描述 | 修复优先级 |
|----------|-------------|-------------|
| Critical | 现在即可被利用，存在数据泄露或 RCE 风险 | 立即 — 阻塞发布 |
| High | 以中等工作量即可利用，影响显著 | 本迭代 |
| Medium | 可利用性或影响有限 | 下一迭代 |
| Low | 理论性风险，纵深防御层面的改进 | 待办列表 |
| Info | 最佳实践建议，无直接风险 | 可选 |

---

## 与其他技能的集成

- 当 `vc-predict` 的 security persona 标记出安全顾虑时，在其之后运行
- 将 Critical/High 级别的发现送入 `vc-autoresearch --fix` 进行自动修复
- 使用 `vc-scenario` 并加上 `--focus authorization`，对认证流程做更深入的测试
- 与 `generate-plan` / `plan-agent` 搭配，将 Medium/Low 级别的发现安排为迭代任务

---

## 示例调用

```bash
# Audit API layer only
/vc-security src/api/**/*.ts

# Audit entire src/ and auto-fix, max 15 iterations
/vc-security src/ --fix --iterations 15

# Full codebase audit (no fix)
/vc-security full
```

---

详细的逐类别检查清单与敏感信息检测正则模式，参见 `references/stride-owasp-checklist.md`。
