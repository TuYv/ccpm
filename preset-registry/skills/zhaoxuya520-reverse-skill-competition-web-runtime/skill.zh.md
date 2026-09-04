---
name: competition-web-runtime
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for CTF web, API, SSR, frontend, queue-backed app, and routing challenges. Use when the user asks to inspect a site or API, follow real browser requests, debug auth or session flow, trace uploads or workers, find hidden routes, or explain why frontend and backend behavior diverge under sandbox-internal routing. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 Web 运行时

本技能只能在 `$ctf-sandbox-orchestrator` 已处于激活状态并已确立沙箱假设、节点归属和证据优先级之后，作为下游特化技能使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当当前挑战主要涉及 Web 行为、浏览器状态、服务器路由、API 顺序或基于 worker 的应用流程时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 假设所呈现的主机、域名和路由均属于沙箱。
2. 在信任可见的 UI 之前，先检查入口 HTML、启动脚本、运行时配置和路由注册。
3. 在基于源码做出宽泛论断之前，先端到端捕获一条真实的请求流。
4. 同时检查浏览器持久化状态与后端状态。
5. 在仅改变一个变量的情况下重新运行最小流程。

## 工作流程

### 1. 映射当前活动运行时

- 识别处于活动状态的主机、路径、代理、容器和 worker。
- 检查 cookie、localStorage、sessionStorage、IndexedDB、Cache Storage 和 service worker。
- 记录在当前活动流程中实际出现的路由名称、功能开关（feature flags）、存储键、队列名称和 worker 名称。

### 2. 捕获真实的请求顺序

- 对起决定性作用的请求，记录其确切的主机、路径、查询字符串、请求头、cookie 和请求体。
- 对比成功路径与失败路径。
- 将 UI 门控视为线索，而非后端强制执行的证明。

### 3. 仅在证实一条路径之后再扩展

- 追踪中间件顺序、处理器、认证/会话边界、上传、导出和后台任务。
- 只有在第一条流程得到落实之后，才验证隐藏路由、备用主机名、预览模式或 worker 副作用。

## 阅读本参考资料

- 加载 `references/routing-runtime.md` 以获取详细的检查清单、证据打包规范以及常见的 Web 陷阱。
- 如果任务具体涉及 SSR 加载器、模板上下文、hydration 载荷、预览渲染或渲染层强制执行漂移，请优先使用 `$competition-template-render-path`。
- 如果任务具体涉及 source map、构建清单、chunk 注册表、产出的 bundle，或从已交付资产中恢复隐藏的运行时结构，请优先使用 `$competition-bundle-sourcemap-recovery`。
- 如果任务具体涉及 GraphQL schema、RPC 清单、持久化查询、生成的客户端，或契约与处理器之间的漂移，请优先使用 `$competition-graphql-rpc-drift`。
- 如果任务具体涉及 SSRF 输入点、内部端点可达性、元数据服务跳板，或通过服务端请求提取令牌，请优先使用 `$competition-ssrf-metadata-pivot`。
- 如果任务具体涉及竞态窗口、依赖顺序的状态变更、重复动作效果，或对时序敏感的漂移，请优先使用 `$competition-race-condition-state-drift`。
- 如果任务具体涉及代理与后端之间的解析差异、路径规范化漂移、请求头歧义，或请求走私路由，请优先使用 `$competition-request-normalization-smuggling`。
- 如果任务具体涉及浏览器 cookie、存储、IndexedDB、Cache Storage、service worker，或缓存的身份认证状态，请优先使用 `$competition-browser-persistence`。
- 如果任务具体涉及 OAuth 或 OIDC 重定向、回调参数、PKCE、scope、令牌交换或 claim 的接受，请优先使用 `$competition-oauth-oidc-chain`。
- 如果任务具体涉及 JWT 请求头、claim 规范化、密钥查找、`kid`、`alg`、签发方或受众混淆，请优先使用 `$competition-jwt-claim-confusion`。
- 如果任务具体涉及上传解析、预览、归档解压、转换器或反序列化链，请优先使用 `$competition-file-parser-chain`。
- 如果任务具体涉及队列载荷、仅限 worker 的行为、重试、cron 漂移或异步副作用，请优先使用 `$competition-queue-worker-drift`。
- 如果任务具体涉及 WebSocket 或 SSE 握手、订阅、实时帧、重连逻辑或由帧驱动的状态变更，请优先使用 `$competition-websocket-runtime`。
- 如果任务具体涉及 Host 请求头、vhost 路由、反向代理或路由到服务的解析，请优先使用 `$competition-runtime-routing`。
- 如果唯一可用的证据是抓包数据，且难点在于流或协议重建，请优先使用 `$competition-pcap-protocol`。

## 需要保留的内容

- 能证明行为的确切请求与响应
- 具体的文件路径、函数名称、路由名称和存储键
- 当异步处理重要时，记录队列载荷、worker 名称或重试行为
