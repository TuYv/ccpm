---
name: competition-template-render-path
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for SSR, template rendering, route loaders, hydration payloads, server-client render boundaries, and template-to-handler enforcement gaps. Use when the user asks to inspect SSR or template routes, trace render context or hydration data, compare template gating with handler enforcement, explain preview or hidden-route rendering, or connect render pipeline behavior to the decisive branch. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛模板渲染路径

仅在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点所有权和证据优先级之后，才将本技能作为下游的专门化技能使用。如果这些尚未完成，请先返回 `$ctf-sandbox-orchestrator`。

当决定性的缺陷或制品位于路由解析、服务端渲染上下文、模板数据或水合交接中，而不仅仅存在于普通 JSON API 中时，使用本技能。

除非用户明确要求使用英文，否则请用简体中文回复。

## 快速开始

1. 按顺序梳理渲染链路：路由解析、loader 或数据获取、模板或组件上下文、响应 HTML、水合载荷以及客户端接管。
2. 在改动任何内容之前，先记录主机、路由参数、预览开关、租户或主机切换，以及仅限服务端的变量。
3. 将模板门控与 loader 或处理器的强制执行进行对比。
4. 保留一条成功渲染路径和一条失败渲染路径，并使两者之间的差异最小。
5. 复现能够证明决定性行为的最小请求到渲染分支。

## 工作流程

### 1. 梳理路由到渲染上下文的映射

- 记录当前活动视图的主机、路径、路由匹配结果、loader、模板、布局、水合数据块以及客户端启动 chunk。
- 注意响应是 SSR HTML、静态 HTML 加上水合、边缘渲染内容，还是被其他路由使用的模板片段。
- 将仅限服务端的上下文与客户端可见的上下文区分开。

### 2. 追踪模板与强制执行的边界

- 展示权限、功能开关、预览状态、租户选择或基于主机的切换在何处被应用。
- 对比模板级门控、loader 级门控与后端处理器强制执行，而不是只信任其中任何一层。
- 记录暴露决定性分支的隐藏字段、内联数据、水合 JSON、meta 标签或备用局部模板。

### 3. 精简至决定性渲染路径

- 将结果压缩为最小序列：请求 -> 路由匹配 -> loader 或模板上下文 -> 渲染输出或隐藏数据 -> 产生的效果。
- 明确说明决定性弱点究竟位于路由选择、模板上下文构建、服务端到客户端的水合交接，还是渲染与处理器之间互不匹配的强制执行。
- 如果任务主要变成对已产出 bundle 的恢复或对 source map 的重建，则移交给更聚焦的 bundle 技能。

## 阅读此参考文档

- 加载 `references/template-render-path.md` 以获取渲染检查清单、水合检查清单以及证据打包说明。

## 需要保留的内容

- 路由名称、loader 名称、模板、布局、水合键，以及主机或预览开关
- 一对成功与失败的样本，展示渲染层行为出现分歧的位置
- 一条能够到达决定性分支的最小请求到渲染序列
