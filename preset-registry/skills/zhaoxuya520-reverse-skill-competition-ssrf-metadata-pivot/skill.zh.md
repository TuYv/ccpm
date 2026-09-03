---
name: competition-ssrf-metadata-pivot
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for SSRF reachability, internal route probing, metadata-service access, credential pivoting, and token-to-accepted-privilege chains. Use when the user asks to trace SSRF sources, internal hosts, metadata endpoints, link-local tokens, service-account credentials, or explain how a server-side fetch edge turns into accepted access. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 SSRF 元数据横向跳转

仅在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专门化能力使用。如果尚未发生上述情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性路径经过服务器端请求能力、内部服务可达性或由元数据派生的凭据时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 区分 SSRF 来源、转发层、可达目标以及接受下游凭据的边。
2. 在做任何变形之前，先记录请求方法、URL 构造方式、头部行为、重定向、DNS 或主机覆盖，以及响应形态。
3. 将内部主机、元数据端点、令牌提取和接受凭据的服务绘制为一条链。
4. 区分只读可达性与携带凭据的访问。
5. 复现从 SSRF 到被接受访问的最小路径。

## 工作流程

### 1. 映射 SSRF 可达性

- 记录来源原语：URL 参数、webhook、图片抓取器、导入器、代理端点或后端回调。
- 记录归一化步骤：协议过滤、主机允许列表、重定向、DNS 解析、路径重写以及头部注入。
- 将目标主机、协议和响应行为与确切的 SSRF 来源绑定对应。

### 2. 追踪元数据与凭据跳转

- 说明元数据端点、内部控制 API 或工作负载身份服务是否可达。
- 记录令牌字段、角色范围、服务账号、过期时间以及令牌在何处被接受。
- 区分凭据提取成功与在下游服务处被接受的权限。

### 3. 收敛为决定性 SSRF 链

- 压缩为：SSRF 来源 -> 内部或元数据目标 -> 凭据或敏感响应 -> 被接受的重放或 API 访问。
- 说明决定性边是解析器绕过、允许列表绕过、重定向滥用、头部混淆，还是元数据信任。
- 如果任务主要变成云身份策略分析，请移交给更聚焦的云元数据技能。

## 阅读此参考资料

- 加载 `references/ssrf-metadata-pivot.md` 以获取 SSRF 检查清单、元数据跳转手法和证据打包方法。

## 需要保留的内容

- SSRF 来源点、URL 构造规则、可达主机以及响应差异
- 提取到的令牌或凭据字段、范围以及接受该凭据的服务
- 一条从 SSRF 到被接受访问的最小重放路径
