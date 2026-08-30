---
name: system-design-communication
description: "Select how services talk: REST, gRPC, GraphQL, WebSocket, SSE, or webhook per hop, sync versus async per flow, service discovery mode, and DNS/edge routing. Use when choosing a protocol or API paradigm; defer REST contract detail (status codes, pagination, OpenAPI) to common-api-design."
metadata:
  triggers:
    keywords:
      - grpc
      - graphql vs rest
      - websocket
      - server-sent events
      - webhook
      - service discovery
      - protocol choice
      - api paradigm
      - dns routing
---
# 通信方式选择

## **优先级：P1（高）**

根据约束，而不是熟悉程度，为每一跳选择合适的范式。同一个流程合理地使用三种范式也是可能的。

## 范式表

| 观察到的约束 | 范式 | 可接受的代价 |
| --- | --- | --- |
| 面向广泛且未知的客户端进行资源 CRUD；需要 HTTP 缓存 | REST | 过度获取/获取不足；聚合数据需要 N 次往返 |
| 内部服务间调用、低延迟、流式传输、以 schema 为先 | gRPC | 浏览器需要代理；L7 负载均衡器需要理解 HTTP/2 |
| 一个客户端聚合多个来源，并返回按客户端需求定制的响应 | GraphQL | 查询成本限制和 N+1 resolver 问题由你负责 |
| 双向实时通信（聊天、协作、游戏） | WebSocket | 有状态连接；负载均衡器需要会话亲和性；需要重连协议 |
| 仅服务端推送（动态信息流、进度、通知） | SSE | 仅支持单向通信；使用普通 HTTP，并内置自动重连 |
| 跨组织的异步回调 | Webhook | 必须由接收方负责重试、签名验证和幂等性 |

## 每个流程的同步与异步选择

- 调用方需要获得答案后才能继续 -> 使用带超时和回退机制的同步调用。
- 调用方需要的是完成，而不是立即获得答案 -> 使用队列或事件；返回一个 id 供调用方轮询，或推送结果。
- 面向用户的路径上，内部同步调用最多不要串联超过 2 跳；每一跳都会增加延迟和失败概率。

## 服务发现

- 从基于 DNS 的负载均衡器发现开始；对大多数系统而言，这已经足够。
- 当实例变化速度快于 DNS TTL 传播速度时，改用经过健康检查的注册中心（服务端发现）。
- 仅当客户端必须选择具体实例时才使用客户端发现（缓存亲和性、区域本地路由）；这会使每个客户端都与注册中心耦合。

## DNS 与边缘路由

- DNS TTL 是故障转移的调节手段：较低的 TTL 可以实现快速区域切换，但代价是增加解析器负载。
- Geo-DNS 将用户路由到最近的区域；它是路由机制，而不是故障转移机制——应与健康检查配合使用。
- 不要使用 DNS 进行实例级负载均衡；解析器会缓存结果，并忽略你设置的权重。

## 版本控制

- 在线合约只进行增量变更：新增字段必须是可选的，旧字段绝不能重新定义用途。
- 破坏性变更 = 并行提供新版本，设置带有使用情况遥测的弃用窗口，然后移除旧版本。
- 内部 gRPC/proto：为已移除的字段编号预留；绝不要重复使用这些编号。

## 反模式

- **不要到处使用同一种范式**：边缘使用 REST、内部使用 gRPC、异步使用事件是正常做法，并不矛盾。
- **不要将 WebSocket 用于仅服务端推送**：SSE 成本更低，也更能适应代理。
- **没有签名、重试策略和幂等键，就不要使用 webhook**：三者缺一不可，否则就不具备生产可用性。
- **不要将 GraphQL 用作弥补 API 设计缺失的代理**：没有负责人的 schema 泛滥，只是换成 resolver 后的同一团乱麻。
- **不要对只需要知晓结果的服务进行同步调用**：通知应作为事件处理。

## 参考资料

- [通信方式选择详解](references/communication-selection.md) - 各范式的故障模式、逐跳指导和迁移说明