---
name: competition-ad-certificate-abuse
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for AD CS, certificate templates, enrollment rights, EKUs, SAN controls, PKINIT, certificate mapping, and cert-based privilege paths. Use when the user asks about ESC-style abuse, certificate templates, enrollment agents, EKUs, SAN or subject controls, smartcard or PKINIT logon, CA policy, or how an issued cert turns into accepted privilege. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 AD 证书滥用

仅在 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点所有权和证据优先级之后，才将此技能用作下游的专门化技能。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当决定性的身份边界基于证书，且难点在于证明模板或 CA 策略如何转化为被接受的特权时，使用此技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 在深入每个证书细节之前，先识别 CA、模板、注册主体和接受服务。
2. 将模板的可注册性与基于证书的身份验证或特权接受区分开来。
3. 以紧凑的块形式记录 EKU、主题或 SAN 控制、颁发要求、注册权限和映射行为。
4. 将已颁发的证书与一条被接受的路径绑定：PKINIT、Schannel、LDAPS、WinRM 或其他已映射的服务。
5. 重现能够产生决定性特权的最小证书颁发到接受链。

## 工作流程

### 1. 映射 CA 与模板信任

- 记录 CA 配置、模板名称、注册权限、管理员审批、授权签名、EKU、主题要求和 SAN 行为。
- 注意该路径是否依赖于备用主题名称、`UPN`、DNS 名称、注册代理行为或模板取代关系。
- 保持主体、模板和颁发策略紧密关联。

### 2. 证明证书到特权的接受

- 展示已颁发的证书如何被映射或接受：PKINIT、智能卡登录、Schannel 身份验证、服务映射或显式证书映射。
- 记录序列号、主题、SAN、EKU、有效期，以及接受它的确切服务或域边界。
- 将证书颁发与实际授予特权的独立步骤区分开来。

### 3. 精简至决定性滥用链

- 将路径压缩为最小的序列：注册权限或配置错误 -> 已颁发的证书 -> 被接受的映射 -> 产生的特权。
- 清楚地说明弱点存在于模板配置、CA 策略、映射逻辑、中继路径还是注册权限中。
- 如果任务实际上涉及 PKINIT 之后的委派或票据转换，请切换回更专门的 Kerberos 技能。

## 阅读此参考

- 加载 `references/ad-certificate-abuse.md` 以获取 AD CS 清单、模板清单和证据打包内容。

## 需要保留的内容

- CA 名称、模板名称、权限、EKU、颁发标志、SAN 控制和映射细节
- 已颁发证书的字段、序列号、主题、SAN，以及接受它的服务或登录路径
- 最小的可重现的注册到特权链
