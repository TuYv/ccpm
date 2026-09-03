---
name: competition-request-normalization-smuggling
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for parser differentials, HTTP normalization gaps, ambiguous headers, path decoding drift, transfer-framing mismatches, and request smuggling routes. Use when the user asks to trace proxy and backend parse differences, conflicting path normalization, Host or forwarded-header ambiguity, CL/TE issues, or routing outcomes that differ across hops. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛请求规范化走私

仅在 `$ctf-sandbox-orchestrator` 已经激活并已确立沙箱假设、节点所有权和证据优先级之后，才将本技能作为下游专门化来使用。如果尚未发生上述情况，请先返回 `$ctf-sandbox-orchestrator`。

当请求的解释在代理、中间件和后端解析器各层之间发生变化时，使用此技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 梳理每一个解析跳点：面向客户端的代理、网关、应用服务器以及下游服务。
2. 记录每个跳点处的路径规范化、头部标准化、传输分帧和主机推导。
3. 捕获一个被接受的基准请求和一个差异最小的差分请求。
4. 证明是哪个跳点对请求做出了不同的解释。
5. 复现一条能产生决定性行为的最小差分路径。

## 工作流程

### 1. 梳理解析与路由边界

- 记录 `Host`、转发头部、路径解码、斜杠折叠、点段处理以及大小写行为。
- 在相关时注意 `Content-Length`、`Transfer-Encoding`、分块分帧和连接复用行为。
- 将边缘解析器与后端解析器的决策并排对照。

### 2. 证明差分解释

- 构建仅在一个规范化维度上存在差异的成对请求。
- 捕获代理日志、后端日志、路由匹配结果以及下游请求的形态。
- 展示路由、鉴权范围或请求体边界在何处发生分歧。

### 3. 精简为决定性走私链

- 压缩为：构造的请求 -> 跨跳点的解析器差异 -> 非预期的被路由请求或隐藏端点可达 -> 由此产生的效果。
- 说明根本原因是路径规范化漂移、头部歧义、传输分帧差异，还是主机推导混淆。
- 如果该链条主要表现为不涉及分帧技巧的运行时路由，则移交给运行时路由技能。

## 阅读此参考文档

- 加载 `references/request-normalization-smuggling.md`，以获取解析差分核对清单和证据打包内容。

## 需要保留的内容

- 原始请求对、逐跳解释以及最终路由目标
- 导致行为翻转的确切规范化或分帧差异
- 一条可重放的最小差分请求路径
