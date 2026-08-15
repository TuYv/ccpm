---
name: security-audit
description: "Audit the game for security vulnerabilities: save tampering, cheat vectors, network exploits, data exposure, and input validation gaps. Produces a prioritised security report with remediation guidance. Run before any public release or multiplayer launch."
argument-hint: "[full | network | save | input | quick]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Task
model: sonnet
agent: security-engineer
---
# 安全审计

对于任何已发布的游戏，安全性都不是可选项。即使是单人游戏，也存在篡改存档的途径。多人游戏则存在作弊攻击面、数据泄露风险以及拒绝服务的可能性。此技能会系统性地审计代码库中最常见的游戏安全问题，并生成一份按优先级排序的修复计划。

**运行此技能：**
- 在任何公开发布之前（Polish → Release 阶段门禁的必要条件）
- 在启用任何在线/多人游戏功能之前
- 在实现任何从磁盘或网络读取数据的系统之后
- 当收到与安全相关的缺陷报告时

**输出：** `production/security/security-audit-[date].md`

---

## 阶段 1：解析参数并确定范围

**模式：**
- `full` — 所有类别（建议在发布前使用）
- `network` — 仅网络/多人游戏
- `save` — 仅存档文件和序列化
- `input` — 仅输入验证和注入
- `quick` — 仅检查高严重性问题（速度最快，适合迭代使用）
- 无参数 — 运行 `full`

读取 `.claude/docs/technical-preferences.md` 以确定：
- 引擎和语言（影响要搜索的模式）
- 目标平台（影响适用的攻击面）
- 多人游戏/网络功能是否在审计范围内

---

## 阶段 2：启动安全工程师

通过 Task 启动 `security-engineer`。传入：
- 审计范围/模式
- 技术偏好中指定的引擎和语言
- 所有源目录的清单：`src/`、`assets/data/` 以及所有配置文件

安全工程师会针对 6 个类别执行审计（参见阶段 3）。收集其全部发现后再继续。

---

## 阶段 3：审计类别

安全工程师会评估以下每个类别。跳过不适用于项目范围的类别。

### 类别 1：存档文件和序列化安全
- 存档文件在加载前是否经过验证？（禁止盲目反序列化）
- 存档文件路径是否根据用户输入构造？（路径遍历风险）
- 存档文件是否使用校验和或签名？（篡改检测）
- 游戏是否在不进行边界检查的情况下信任存档文件中的数值？
- 存档加载代码附近是否存在任何 eval() 或动态代码执行调用？

Grep 模式：`File.open`、`load`、`deserialize`、`JSON.parse`、`from_json`、`read_file` — 检查每一处是否进行了验证。

### 类别 2：网络和多人游戏安全（如果仅为单人游戏则跳过）
- 游戏状态是否以服务器为权威，还是由客户端决定结果？
- 是否对传入的网络数据包进行了大小、类型和值范围验证？
- 是否在服务器端验证玩家位置和状态变化？
- 是否对所有网络调用实施了速率限制？
- 身份验证令牌是否得到正确处理（绝不以明文发送）？
- 游戏是否在发布构建中暴露了任何调试端点？

Grep 搜索：`recv`、`receive`、`PacketPeer`、`socket`、`NetworkedMultiplayerPeer`、`rpc`、`rpc_id` — 检查每个调用位置是否进行了验证。

### 类别 3：输入验证
- 是否有任何玩家提供的字符串被用于文件路径？（路径遍历）
- 是否有任何玩家提供的字符串未经净化就被写入日志？（日志注入）
- 数值输入（例如物品数量、角色属性）在使用前是否经过边界检查？
- 成就/统计数据的值在写入任何后端之前是否经过检查？

检索：`get_input`、`Input.get_`、`input_map`、面向用户的文本字段——检查验证机制。

### 类别 4：数据暴露
- `src/` 或 `assets/` 中是否硬编码了任何 API 密钥、凭据或机密信息？
- 发布构建中是否包含调试符号或过于详细的错误消息？
- 游戏是否将敏感的玩家数据记录到磁盘或控制台？
- 是否向玩家暴露了任何内部文件路径或系统信息？

检索：`api_key`、`secret`、`password`、`token`、`private_key`、`DEBUG`，以及面向发布的代码中的 `print(`。

### 类别 5：作弊与防篡改风险点
- 对游戏玩法至关重要的值是否仅存储在内存中，而不是存储在易于编辑的文件中？
- 关键的游戏进度标志（例如，“是否已为 DLC 付费”）是否经过服务器端验证？
- 多人游戏是否具有针对内存编辑工具（Cheat Engine 等）的保护措施？
- 排行榜/分数提交是否在接受前经过验证？

注意：客户端反作弊在很大程度上无法有效强制执行。对于任何具有竞争性或涉及商业变现的内容，应重点关注服务器端验证。

### 类别 6：依赖项与供应链
- 是否使用了任何第三方插件或库？请列出它们。
- 所使用版本的插件是否存在已知 CVE？
- 插件来源是否经过验证（官方市场、经过审查的代码仓库）？

匹配：`addons/`、`plugins/`、`third_party/`、`vendor/`——列出所有外部依赖项。

---

## 阶段 4：对发现进行分类

为每项发现指定：

**严重程度：**
| 级别 | 定义 |
|-------|-----------|
| **严重** | 远程代码执行、数据泄露，或可轻易利用且会破坏多人游戏公平性的作弊漏洞 |
| **高** | 可绕过进度机制的存档篡改、凭据暴露，或绕过服务器端权威控制 |
| **中** | 客户端作弊能力、信息泄露，或影响有限的输入验证缺口 |
| **低** | 纵深防御改进——能够缩小攻击面，但不存在直接可利用的漏洞 |

**状态：** 待处理 / 已接受风险 / 超出范围

---

## 阶段 5：生成报告

```markdown
# Security Audit Report

**Date**: [date]
**Scope**: [full | network | save | input | quick]
**Engine**: [engine + version]
**Audited by**: security-engineer via /security-audit
**Files scanned**: [N source files, N config files]

---

## Executive Summary

| Severity | Count | Must Fix Before Release |
|----------|-------|------------------------|
| CRITICAL | [N] | Yes — all |
| HIGH | [N] | Yes — all |
| MEDIUM | [N] | Recommended |
| LOW | [N] | Optional |

**Release recommendation**: [CLEAR TO SHIP / FIX CRITICALS FIRST / DO NOT SHIP]

---

## CRITICAL Findings

### SEC-001: [Title]
**Category**: [Save / Network / Input / Data / Cheat / Dependency]
**File**: `[path]` line [N]
**Description**: [What the vulnerability is]
**Attack scenario**: [How a malicious user would exploit it]
**Remediation**: [Specific code change or pattern to apply]
**Effort**: [Low / Medium / High]

[repeat per finding]

---

## HIGH Findings

[same format]

---

## MEDIUM Findings

[same format]

---

## LOW Findings

[same format]

---

## Accepted Risk

[Any findings explicitly accepted by the team with rationale]

---

## Dependency Inventory

| Plugin / Library | Version | Source | Known CVEs |
|-----------------|---------|--------|------------|
| [name] | [version] | [source] | [none / CVE-XXXX-NNNN] |

---

## Remediation Priority Order

1. [SEC-NNN] — [1-line description] — Est. effort: [Low/Medium/High]
2. ...

---

## Re-Audit Trigger

Run `/security-audit` again after remediating any CRITICAL or HIGH findings.
The Polish → Release gate requires this report with no open CRITICAL or HIGH items.
```

---

## 阶段 6：撰写报告

在对话中提供报告摘要（执行摘要 + 仅限 CRITICAL/HIGH 级别的发现）。

询问：“我可以将完整的安全审计报告写入 `production/security/security-audit-[date].md` 吗？”

仅在获得批准后写入。

---

## 阶段 7：关卡集成

此报告是通过 **Polish → Release 关卡**所需的工件。

修复发现的问题后，重新运行：`/security-audit quick`，确认 CRITICAL/HIGH 级别的问题均已解决，然后再运行 `/gate-check release`。

如果存在 CRITICAL 级别的发现：
> “⛔ 所有 CRITICAL 级别的安全问题都必须在任何公开发布之前解决。在解决这些问题之前，请勿继续执行 `/launch-checklist`。”

如果不存在 CRITICAL/HIGH 级别的发现：
> “✅ 没有阻碍发布的安全问题。报告已写入 `production/security/`。运行 `/gate-check release` 时请包含此路径。”

---

## 协作协议

- **绝不要假定某种模式是安全的**——将其标记出来并让用户决定
- **接受风险也是一种有效的结果**——对于单人团队而言，某些 LOW 级别的发现可能是可接受的权衡；请记录该决定
- **多人游戏的标准更高**——在多人游戏场景中，任何 HIGH 级别的发现都应视为 CRITICAL 级别
- **这不是渗透测试**——本审计涵盖常见模式；在任何竞技型或商业化多人游戏发布之前，建议由人类安全专业人员进行真正的渗透测试