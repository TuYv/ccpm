---
name: competition-runtime-routing
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for reverse proxies, Host headers, forwarded headers, vhost routing, websocket upgrades, path-prefix rewriting, base-URL derivation, and multi-node route resolution. Use when the user asks which host or container serves a route, why a public-looking domain still belongs to the sandbox, how headers or proxies change behavior, or how a route resolves across proxy, container, and worker boundaries. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛运行时路由

只有在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点归属和证据优先级之后，才可将本技能作为下游专项使用。如果尚未发生这种情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性问题在于哪个沙箱节点、代理规则或由请求头派生的分支实际服务于线上请求时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 除非题目路径能够证伪，否则假定所呈现的每个主机名、域名和节点都属于沙箱。
2. 构建一张路由图：客户端主机和协议 -> 代理规则 -> 服务或容器 -> 进程 -> 下游存储或工作进程。
3. 记录确切的塑形输入：Host、X-Forwarded-* 请求头、Origin、路径前缀、websocket 升级或 base URL。
4. 在扩展到其他主机或前缀之前，先端到端地证明一条路由解析。
5. 每次只更改一个路由输入，重新运行同一请求。

## 工作流程

### 1. 映射路由输入

- 检查 vhost 规则、反向代理、转发请求头、路径前缀重写、上游池以及 websocket 或 SSE 升级。
- 记录请求中哪些部分会影响路由或应用行为：主机、协议、端口、路径、前缀、cookie 作用域或 origin。
- 首先将看似公网的域名、云主机名和独立的 VPS 节点视为沙箱路由装置。

### 2. 追踪路由至线上消费方

- 按 主机名 -> 代理规则 -> 容器或进程 -> 端口 -> 下游服务 的链路进行映射。
- 将已提交到代码库的代理意图与线上监听器、挂载的配置、运行时环境以及观测到的流量进行对比。
- 将请求头、代理配置和线上请求痕迹保持在同一条证据链中。

### 3. 证明决定性偏差

- 将结果简化为能够翻转基于主机的路由、租户选择、cookie 作用域或上游目标的最小请求形态。
- 区分路由解析与应用认证逻辑；证明每个决策实际发生在哪里。
- 如果问题从路由转移到一般性的 Web 状态或容器运行时漂移，请切换回更宽泛的父技能。

## 阅读此参考文档

- 加载 `references/runtime-routing.md` 以获取路由检查清单、请求头矩阵和证据打包方法。
- 如果难点在于解析器差异、传输分帧歧义或代理-后端请求走私行为，请优先使用 `$competition-request-normalization-smuggling`。

## 需要保留的内容

- 主机名、代理配置片段、请求头集合、路径前缀、监听端口以及特定路由的 cookie
- 到达决定性后端或分支的确切请求形态
- 针对当前活跃路径的一张紧凑的 主机 -> 代理 -> 服务 -> 进程 映射图
