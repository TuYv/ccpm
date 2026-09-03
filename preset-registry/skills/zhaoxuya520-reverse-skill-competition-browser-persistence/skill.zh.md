---
name: competition-browser-persistence
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for browser cookies, localStorage, sessionStorage, IndexedDB, Cache Storage, service workers, offline caches, and client-side session persistence. Use when the user asks to inspect browser state, replay cached auth or session behavior, explain why a page behaves differently after load, or trace how stored client state changes requests, rendering, or access. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛浏览器持久化

仅在 `$ctf-sandbox-orchestrator` 已激活并确立了沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专门化技能使用。如果尚未发生这些情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性分支存在于浏览器持有的状态中，而不仅仅存在于可见 HTML 或后端源码中时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 首先识别活跃的持久化面：cookie jar、localStorage、sessionStorage、IndexedDB、Cache Storage 或 service worker。
2. 在修改状态之前，记录 origin、scope、domain、path、expiry 和键名。
3. 将存储的状态与一个具体效果关联：请求头、渲染分支、缓存响应、离线行为或隐藏路由访问。
4. 将启动时状态与运行时修改的状态区分开。
5. 重现能到达决定性分支的最小有状态序列。

## 工作流程

### 1. 映射浏览器状态面

- 检查 cookie、存储桶、service worker 注册、缓存条目以及启动期间暴露的瞬态全局变量。
- 记录每个状态项实际适用于哪个 origin、host、路由或功能标志。
- 将认证令牌、刷新材料、CSRF 状态、缓存响应和功能开关分别保存在独立的证据块中。

### 2. 将状态与运行时行为关联

- 展示存储的状态如何变成请求头、角色推导、路由可见性、缓存的 API 数据或离线回退行为。
- 对比干净状态与已修改状态的运行，每次只改变一个变量。
- 区分仅限 UI 的状态与后端接受的状态。

### 3. 归约到决定性的持久化链

- 将结果压缩为最小的链：初始页面或登录 -> 状态持久化 -> 后续请求或渲染分支 -> 最终能力。
- 使提取的存储、service worker 脚本和重放步骤与同一 origin 和路由保持关联。
- 如果问题扩展到浏览器持久化之外的一般 Web 路由或 worker 行为，请切换回更宽泛的 web-runtime 技能。

## 阅读此参考

- 加载 `references/browser-persistence.md` 以获取浏览器状态清单、service-worker 清单和证据打包方法。

## 需要保留的内容

- Cookie 属性、存储键、数据库名、缓存键、service worker 作用域和 origin 边界
- 每个决定性状态项导致的确切请求或渲染效果
- 最小可行路径的干净状态与已修改状态的重现步骤
