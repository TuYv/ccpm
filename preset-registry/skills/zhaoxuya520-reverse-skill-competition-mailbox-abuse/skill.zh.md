---
name: competition-mailbox-abuse
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for enterprise mail abuse, OAuth consent, inbox or forwarding rules, transport rules, shared mailbox access, phishing chains, and token-to-mailbox side effects. Use when the user asks to trace mailbox rules, OAuth consent grants, forwarding or delegate abuse, shared mailbox access, message-trace evidence, or explain how mail artifacts turn into persistence, exfiltration, or privilege. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛邮箱滥用

仅在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点归属与证据优先级之后，才将本技能作为下游专门化使用。如果尚未发生这些情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性路径经过邮箱行为、同意流程或消息路由效应，而不仅仅是通用 AD 证据时，使用此技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 判断当前路径属于钓鱼到同意、令牌到邮箱、基于规则的持久化，还是传输层级的邮件重新路由。
2. 保持邮箱证据、身份证据与消息跟踪证据关联到同一用户、邮箱、令牌或消息 ID。
3. 将令牌或委派边的持有，与它所带来的实际邮箱效应区分开。
4. 以紧凑的块记录转发目标、规则谓词、同意范围、共享邮箱边以及由此产生的邮件流。
5. 复现能够证明持久化、数据外泄或特权的最小邮件效应。

## 工作流程

### 1. 映射邮件信任路径

- 识别所涉及的主体、邮箱、令牌或会话、同意授权、委派边、共享邮箱关系或应用注册。
- 记录同意范围、邮箱权限、规则归属、传输动作以及消息跟踪标识符。
- 区分客户端可见症状与服务器端邮箱或传输状态。

### 2. 证明邮箱效应

- 关联同意日志、登录记录、消息跟踪、收件箱规则、传输规则、转发设置以及邮箱审计事件。
- 展示哪条规则或哪个令牌产生了哪种具体效应：静默转发、标记已读、删除、委派访问或消息重新路由。
- 保持各日志之间的消息 ID、发件人或收件人对以及时间戳一致对齐。

### 3. 归约为决定性滥用链

- 将路径压缩为最小序列：诱饵或授权 -> 令牌或委派边 -> 邮箱或传输变更 -> 由此产生的邮件效应。
- 明确说明持久化存在于同意授权、邮箱规则、传输配置还是共享邮箱权限之中。
- 如果任务扩展到主机跳板或 Kerberos 接受，请切换回更宽泛的身份技能。

## 阅读本参考

- 加载 `references/mailbox-abuse.md` 以获取同意清单、规则清单和证据打包内容。

## 需要保留的内容

- 同意范围、令牌声明、邮箱权限、规则定义、转发目标以及消息 ID
- 与同一邮件路径关联的消息跟踪行、审计事件和邮箱效应
- 能够证明持久化、数据外泄或委派访问的最小可重放序列
