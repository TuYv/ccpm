---
name: competition-container-runtime
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for live container runtime analysis, mounted secrets, sidecars, namespaces, init containers, entrypoint drift, and route-to-container resolution. Use when the user asks why a live container differs from manifests, where a mounted secret is consumed, how a sidecar or init container changes runtime state, or which route resolves to which live container. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛容器运行时

仅当 `$ctf-sandbox-orchestrator` 已激活并已确立沙盒假设、节点归属与证据优先级之后，才将本技能作为下游专门化技能使用。如果尚未发生这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当挑战的核心实际上是运行中的容器或 pod 当前在做什么，而不是已入库的 manifest 声称它应该做什么时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 将意图与现实区分开：manifest、镜像、启动过程、运行时挂载、运行时路由、运行时进程。
2. 梳理链条：主机 -> 代理 -> 容器或 pod -> 挂载卷 -> 消费进程。
3. 将密钥、渲染后的配置、init 输出和 sidecar 输出与静态 manifest 分开对待。
4. 证明一条从挂载或注入状态到可达行为的最小运行时路径。
5. 用最小的运行时专属链条复现该效果。

## 工作流程

### 1. 勘察运行时环境

- 将 compose 或 kube 的 manifest 与实际运行的容器、pod、挂载卷、环境变量、sidecar、init 容器和入口点进行对比。
- 找出实际消费所挂载密钥、渲染后配置或共享卷输出的进程。

### 2. 追踪路由与挂载边界

- 将虚拟主机、反向代理、service、容器端口、文件系统挂载以及运行时生成的文件路径关联到一起。
- 记录决定性状态是烧录在镜像中、通过环境变量注入、后续挂载，还是由 init/sidecar 进程写入。

### 3. 报告运行时偏差

- 指出运行时环境与入库意图出现分歧的最早节点。
- 保留一条从 manifest 或 compose 意图到实际消费行为的紧凑证据链。

## 阅读此参考

- 阅读 `references/container-runtime.md`，其中包含运行时检查清单、挂载链检查清单以及常见的运行时与静态差异陷阱。
- 如果难点在于 kube API 权限、service-account 信任、RBAC 边缘情况、准入阶段变更或控制器创建的工作负载漂移，优先使用 `$competition-k8s-control-plane`。
- 如果难点在于 Host 头路由、路径前缀重写或跨节点的路由到 service 映射，优先使用 `$competition-runtime-routing`。
- 如果难点在于证明容器向主机的越界、内核攻击面前置条件或稳定的逃逸原语，优先使用 `$competition-kernel-container-escape`。
- 如果难点在于重放 Linux 密钥、socket 信任边界或获得容器立足点后的主机间横向移动，优先使用 `$competition-linux-credential-pivot`。

## 需要保留的内容

- 与运行时挂载或路由相关的 Compose/Kubernetes 片段
- 容器 ID、pod 名称、挂载路径、sidecar 输出、渲染后配置路径以及消费进程
- 仅在运行时才变得可达的确切路由或文件路径
