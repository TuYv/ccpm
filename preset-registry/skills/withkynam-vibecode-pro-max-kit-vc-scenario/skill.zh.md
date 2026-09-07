---
name: vc-scenario
description: "Generate comprehensive edge cases and test scenarios by decomposing features across 12 dimensions. Use before implementation or testing to catch issues early."
argument-hint: "<file path or feature description>"
trigger_keywords: edge cases, test scenarios, what could go wrong
layer: helper
metadata:
  author: claudekit
  attribution: "Scenario exploration pattern adapted from autoresearch by Udit Goenka (MIT)"
  license: MIT
  version: "1.0.0"
---
# vc-scenario — 边界情况与场景探索器

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 先给答案、使用平实语言、不使用未经解释的术语、长回复提供 TL;DR。

在实现开始之前，将任意功能或代码路径沿 12 个维度进行拆解，暴露边界情况、风险和测试目标。

## 模式选择

在生成场景之前先选择模式。默认为简单模式，除非满足某个触发条件。

### 简单模式（默认）

根据提示中提供的计划描述、检查清单条目或方案文本来生成边界情况。不派生子代理。

**适用于：**
- 检查清单条目自包含且描述清晰
- 影响范围小（1–2 个文件、单一包）
- 不涉及身份验证、计费、schema 或外部 API 界面
- 追求速度且假设性覆盖已足够

### 深度模式

派生一个研究子代理，在生成场景之前阅读实际源码。场景引用的是真实的变量名、真实的函数签名以及代码中可见的真实故障模式，而非假设性内容。

**触发条件（满足任一即可）：**
- 检查清单条目修改了身份验证、计费、schema 或外部 API 界面
- 影响范围跨越 3 个以上文件或 2 个以上包
- 计划中将该条目标记为 `HIGH_RISK`
- 调用方明确要求使用深度模式

**深度模式子代理的步骤：**
1. 阅读被修改的实际源文件（来自计划的 Touchpoints）
2. 定位并阅读这些文件对应的现有测试文件（通过 grep 搜索导入路径或 describe 块）
3. 阅读受影响的任何 Public Contracts（来自计划的 Public Contracts 部分）
4. 返回：真实的函数签名、实际的数据形状、现有测试覆盖缺口、代码中可见的真实故障模式

随后由编排器利用该研究输出生成场景。

### 输出质量差异

| 模式 | 示例场景 |
|------|-----------------|
| 简单 | “如果输入为 null 怎么办？” |
| 深度 | “如果 `creditBalance.available` 为 0 但 `creditBalance.pending` 为正——`deductCredits(amount)` 只检查 `available`，还是检查 `available + pending`？” |

简单模式能快速发现通用的边界情况。深度模式能发现只有通过阅读实际实现才能找到的场景。

---

## 何时使用

- 在实现复杂或有状态的功能之前
- 在编写测试之前（生成测试目标）
- 在规划或代码评审期间进行风险评估
- API 设计评审——尽早暴露契约边界情况

## 何时不使用

- 琐碎的单行改动或纯外观的 UI 调整
- 已充分测试、近期无修改的稳定代码
- 无逻辑路径的纯配置变更

---

## 12 个拆解维度

并非 12 个维度都适用于每个功能。先识别相关维度，然后只针对这些维度生成场景。

| # | 维度 | 需要关注的点 |
|---|-----------|------------------|
| 1 | **用户类型** | 管理员、访客、被封禁用户、新用户、重度用户、机器人/爬虫 |
| 2 | **输入极值** | 空值、null、最大长度、unicode、特殊字符、SQL/脚本注入 |
| 3 | **时序** | 并发访问、竞态条件、超时、慢速网络、重试风暴 |
| 4 | **规模** | 0 条、1 条、100 万条数据、分页边界、游标回绕 |
| 5 | **状态转换** | 首次使用、流程中途中止、崩溃后恢复、部分完成 |
| 6 | **环境** | 移动设备/低端 CPU、无 JS、屏幕阅读器、代理/VPN、不同时区/语言环境 |
| 7 | **错误级联** | 数据库宕机、API 超时、磁盘满、OOM、网络分区、部分写入 |
| 8 | **授权** | 过期令牌、角色错误、共享/公开链接、CORS、CSRF、提权 |
| 9 | **数据完整性** | 重复条目、孤儿引用、编码不匹配、并发 schema 迁移 |
| 10 | **集成** | webhook 重放、API 版本不匹配、第三方服务中断、契约漂移 |
| 11 | **合规** | GDPR 删除请求、审计日志缺口、数据保留、意外的 PII 泄露 |
| 12 | **业务逻辑** | 边界定价（零/负数）、优惠券叠加、部分交付后退款、免费层限额 |

---

## 工作流程

**第 0 步 —— 选择模式**，依据上文的模式选择规则。

**简单模式：**

1. **解析**提示中的功能描述或检查清单条目
2. **筛选维度** —— 标记 12 个维度中哪些适用；明确跳过不相关的维度
3. **生成 3–5 个场景**（针对每个相关维度）
4. **划分严重程度** —— 严重 / 高 / 中 / 低
5. **输出**为结构化表格（见下方格式）
6. **汇总**按严重程度统计的场景总数

**深度模式：**

1. **派生研究子代理** —— 传入 Touchpoints、Public Contracts 以及检查清单条目文本
2. **子代理返回**真实的函数签名、数据形状、覆盖缺口、可见的故障模式
3. **筛选维度**，利用研究输出剔除不适用的维度
4. **生成 3–5 个场景**（针对每个相关维度），引用实际的变量/函数名
5. **划分严重程度** —— 严重 / 高 / 中 / 低
6. **输出**为附带源码佐证（相关处给出文件 + 行号）的结构化表格
7. **汇总**按严重程度统计的场景总数

### 严重程度标准

| 级别 | 含义 |
|-------|---------|
| **严重** | 数据丢失、安全漏洞、身份验证绕过、静默损坏 |
| **高** | 部分用户的功能受损、数据不一致 |
| **中** | 用户体验降级、可恢复的错误未告知用户 |
| **低** | 轻微视觉故障、非阻塞性警告 |

---

## 输出格式

```
## Scenario Report: [target]

Dimensions analyzed: [list]
Dimensions skipped: [list + reason]

| # | Dimension | Scenario | Severity | Expected Behavior |
|---|-----------|----------|----------|-------------------|
| 1 | Input Extremes | Empty string for required name field | High | Return 400 with field error |
| 2 | Authorization | Expired JWT accessing protected route | Critical | Redirect to login, invalidate session |
| 3 | Timing | Two users submit same form simultaneously | High | Idempotency key or conflict error |

### Summary
- Critical: N
- High: N
- Medium: N
- Low: N
- Total: N scenarios across X dimensions
```

---

## 与其他技能的集成

| 下一步 | 技能 | 方法 |
|-----------|-------|-----|
| 从场景生成测试用例 | `vc-test` | 将场景表格作为输入上下文传入 |
| 为实现计划提供风险信息 | `generate-plan` / `plan-agent` | 将“严重/高”行粘贴到风险评估中 |
| 针对主要风险进行深度人格辩论 | `vc-predict` | 将“严重”场景作为变更提案输入 |

---

## 调用示例

```
# Simple mode (default — self-contained, narrow blast radius)
/vc-scenario src/api/payment.ts
/vc-scenario "User registration with OAuth providers"
/vc-scenario src/middleware/auth.ts

# Deep mode (auto-triggered: billing surface, 3+ files)
/vc-scenario "Deduct credits on model usage — touches CreditBalance, CreditTransaction, usage-sync.ts"

# Deep mode (explicit request)
/vc-scenario --deep "Add multi-tenancy to the database layer"
```
