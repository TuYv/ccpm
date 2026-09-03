---
name: competition-cloud-metadata-path
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for cloud metadata services, instance identity, workload identity, link-local credential paths, role assumption, and metadata-to-privilege trust edges. Use when the user asks to inspect metadata-service access, instance credentials, pod or workload identity, link-local token paths, SSRF-to-metadata escalation, or explain how metadata-derived credentials turn into accepted cloud or control-plane privilege. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛云元数据路径

仅在 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专门化技能使用。如果这些尚未完成，请先返回 `$ctf-sandbox-orchestrator`。

当决定性优势不仅在于能够触及元数据，而在于证明由元数据派生的身份如何被接受为特权时，请使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 确定当前活跃的是哪种元数据面：实例元数据、工作负载身份、节点身份、任务角色，或平台特定的令牌端点。
2. 记录确切的可达路径：本地进程、Pod、容器、代理、SSRF 面或主机路由。
3. 将元数据可达性与凭证签发以及下游特权接受分离开来。
4. 将令牌格式、角色身份、作用域和接受方 API 保存到紧凑的证据块中。
5. 复现能够证明该挑战制胜要点的、从元数据到被接受特权的最小路径。

## 工作流程

### 1. 梳理元数据可达性

- 记录元数据端点、必需的请求头、跳数限制、会话令牌、工作负载选择器或路径前缀。
- 注明访问是来自直接的本地调用、Pod 网络、SSRF、Sidecar 还是主机级路由。
- 将触达面与元数据端点保持在同一条链中。

### 2. 证明凭证或身份的签发

- 展示元数据响应如何变成令牌、临时凭证、签名身份文档或平台特定的工作负载身份。
- 记录对下游有影响的过期时间、角色名称、主体、受众、签发者或云账户映射。
- 区分原始元数据与可用的凭证材料。

### 3. 归约到决定性的信任路径

- 将结果压缩为最小序列：触达面 -> 元数据调用 -> 凭证签发 -> 被接受的云或集群操作。
- 明确说明弱点究竟位于可达性、元数据配置、角色信任、下游策略还是工作负载绑定之中。
- 如果挑战在凭证签发之后收窄为 RBAC 或集群变更，请切换回更聚焦的控制面技能。

## 阅读本参考文档

- 加载 `references/cloud-metadata-path.md` 以获取可达性检查清单、令牌检查清单以及证据打包方法。
- 如果难点在于先证明服务端获取原语、SSRF 可达性或内部端点遍历，之后才轮到元数据本身，请优先使用 `$competition-ssrf-metadata-pivot`。

## 需保留的内容

- 元数据端点、必需的请求头、可达路径、已签发的令牌或凭证，以及接受方 API
- 角色名称、受众、签发者、账户绑定，以及承载特权的操作
- 最小的可重放元数据到特权链
