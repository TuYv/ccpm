---
name: competition-agent-cloud
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for AI-agent, prompt-injection, MCP or toolchain, cloud, container, CI/CD, and supply-chain challenges. Use when the user asks to analyze prompt-to-tool flows, retrieval poisoning, mounted secrets, deployment drift, runtime-vs-manifest mismatches, registry provenance, or CI-produced artifacts under sandbox assumptions. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛智能体云

仅在 `$ctf-sandbox-orchestrator` 已处于激活状态并已确立沙箱假设、节点所有权和证据优先级之后，才可将此技能用作下游专门化技能。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当挑战路径由提示到工具的执行、检索与记忆边界、部署漂移或构建与发布溯源驱动时，使用此技能。

除非用户明确要求使用英文，否则请用简体中文回复。

## 快速开始

1. 判断主导路径是智能体驱动还是基础设施驱动。
2. 梳理出一条最小控制链：不可信输入 -> 可见上下文 -> 工具或部署副作用。
3. 区分已检入的意图与实际运行时的真实情况。
4. 将提示词、工具参数、清单、挂载和溯源步骤保存在紧凑的证据块中。
5. 以最少的上下文和最少的插桩复现漏洞利用或错误配置。

## 工作流程

### 1. 智能体与提示注入

- 将提示词、工具 schema、检索到的分块、规划器笔记、记忆文件和交接内容视为挑战工件。
- 证明一条从不可信内容到模型可见指令、再到工具副作用的最小链路。
- 区分宣称的能力与运行时实际暴露的能力。

### 2. 云、容器与 CI/CD

- 将构建时、部署时与运行时区分开来。
- 将 compose 或 kube 清单与实际挂载、环境变量、日志和流量进行核对。
- 追踪从源码到依赖解析、构建、发布再到运行时消费者的溯源链。

## 阅读此参考资料

- 加载 `references/agent-cloud.md` 以获取控制栈检查清单、部署实际状态检查清单和证据打包内容。
- 如果任务具体涉及提示边界滥用或检索内容到工具的漂移，优先使用 `$competition-prompt-injection`。
- 如果任务具体涉及 CI、依赖溯源、注册表漂移或已交付工件，优先使用 `$competition-supply-chain`。
- 如果任务具体涉及队列载荷、异步 worker 漂移、重试或仅存在于 worker 的运行时状态，优先使用 `$competition-queue-worker-drift`。
- 如果任务具体涉及针对内部控制面的 SSRF、元数据端点或由元数据派生的令牌跳板，优先使用 `$competition-ssrf-metadata-pivot`。
- 如果任务具体涉及代理与上游之间的解析差异、歧义头部、路径规范化漂移或请求走私行为，优先使用 `$competition-request-normalization-smuggling`。
- 如果任务具体涉及元数据服务访问、实例或工作负载身份、链路本地令牌路径或由元数据派生的权限，优先使用 `$competition-cloud-metadata-path`。
- 如果任务具体涉及 kube API 权限、服务账户信任、准入行为、控制器漂移或集群密钥暴露，优先使用 `$competition-k8s-control-plane`。
- 如果任务具体涉及实际挂载、sidecar、init 容器或仅运行时暴露的密钥，优先使用 `$competition-container-runtime`。
- 如果任务具体涉及容器到宿主机的边界突破、内核层面的前提条件或逃逸原语的验证，优先使用 `$competition-kernel-container-escape`。

## 需要保留的内容

- 提示词片段、检索到的分块、规划器状态转换和最终工具参数
- 与实际挂载或路由相关联的 Compose 或 Kubernetes 片段
- 工件哈希、依赖漂移、CI 步骤以及由此产生的运行时消费者
