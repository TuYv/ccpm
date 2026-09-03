---
name: thinking-red-team
description: For authorized security review of code, auth, or APIs you control, model the attacker, map the attack surface, and report only findings with a reproducible exploit path and verified mitigation.
disable-model-invocation: true
---
# 红队

对获授权评估的系统进行对抗性安全审查。抢在外部攻击者之前动手，但只报告你真正能攻破的内容：每项发现都需要一条具体的利用路径，并需验证所提修复确实能将其封堵。

## 何时使用

- 对你掌控并获准探测的代码、身份认证、授权、API、数据处理或基础设施进行安全审查。
- 在系统上线前进行加固，且该系统涉及身份认证、资金、个人数据或特权操作。
- 检查某类特定漏洞（注入、XSS、IDOR、认证绕过、SSRF、机密泄露等）是否确实存在，并附带一条真实可用的路径。
- 验证所声称的防护措施是否真的能拦截攻击，而不仅仅是扫描器没有告警。

## 何时不使用

- 无权攻击目标 —— 立即停止；不要探测你不拥有、也没有书面许可进行测试的系统。
- 没有可复现利用路径的猜测性“最佳实践”备注 —— 直接丢弃；它们不算发现。
- 对计划、策略或决策的压力测试 —— 请使用 pre-mortem（计划会如何失败）或 steel-manning（针对该决策的最强反方论证）。
- 没有安全目标的架构韧性评估 —— 请使用 systems 或 pre-mortem。
- 仅以扫描器输出作为报告 —— 匹配到的模式只是线索；红队测试要求给出利用路径。
- 与安全无关的根因定位或假设定位 —— 请使用 scientific-method 或 five-whys-plus。

## 流程

1. **确认授权与目标。** 说明目标、允许范围、范围外资产、成功条件（例如：未授权读取数据、权限提升）以及终止规则。若授权不明确，应拒绝或缩小范围。
2. **构建威胁模型。** 列出对手画像（匿名外部人员、已认证用户、特权内部人员）及其在现实访问条件下的目标。没有攻击者和目标的攻击只是噪音。
3. **绘制攻击面。** 枚举入口点与信任边界：公开端点、认证流程、API、上传、管理界面、后台任务、webhook、机密信息和数据存储。记录暴露情况与所需权限。
4. **追踪利用路径。** 对每个高价值攻击面，尝试具体的滥用方式：输入篡改、授权缺口、令牌/会话滥用、注入、SSRF、IDOR、批量赋值、限流绕过、机密泄露。记录确切步骤和观察到的行为。
5. **应用防捏造关卡。** 只有当你能完整走通“入口点 → 有序步骤 → 对该代码/配置的实际影响”时，才保留该发现。不完整的路径一律丢弃，而不是列为“informational”。
6. **评估严重程度并尝试绕过防御。** 对影响和可利用性打分。对每项相关控制措施（限流、校验、会话检查），尝试一种现实可行的绕过方式，并记录其守住了还是被攻破。
7. **给出并验证缓解措施。** 对每项保留的发现，给出最小化的具体修复方案，并说明如何重新测试以确认路径已被封堵。优先选择能消除利用前提条件的修复。当范围内攻击面已覆盖完毕或授权/预算耗尽时即停止；零发现也是有效结果。

## 输出

```text
Target/scope: <in | out | goal | authorization>
Threat model: <actors, access, goals>
Attack surface: <entry points + trust boundaries>
Findings (only complete paths):
  - Title | Severity
    Entry: <endpoint/param/file>
    Steps: <1..n>
    Impact: <realized effect>
    Bypass attempts: <control → result>
    Mitigation: <minimal fix>
    Re-test: <how to confirm closed>
Summary: <kept count; dropped speculative count>
```

## 验证

- 对任何缺少入口、步骤或实际影响的发现予以证伪；将“可能存在漏洞”视为非发现。
- 当授权范围内的攻击面已穷尽，或重新测试表明缓解措施已封堵各路径时，即停止。
- 过度使用防范：不要用最佳实践清单凑数；不要将本技能用于非安全性的计划评审；未经授权不得发起攻击。
