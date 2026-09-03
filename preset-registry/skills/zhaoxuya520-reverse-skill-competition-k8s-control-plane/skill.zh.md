---
name: competition-k8s-control-plane
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for Kubernetes API analysis, service-account trust, RBAC edges, admission and controller behavior, cluster secrets, workload mutation, and namespace-scoped drift. Use when the user asks to inspect kube API permissions, service-account tokens, RoleBinding or ClusterRoleBinding edges, admission webhooks, controller-created pods, secret exposure, or why live workloads differ from manifests. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# Competition K8s 控制平面

本技能只能作为下游专门化技能，在 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点归属关系和证据优先级之后使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当决定性路径贯穿 Kubernetes 控制平面状态、API 权限或控制器行为，而不仅仅是单个容器的运行时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 将 manifest 所声明的意图与集群的 live 状态区分开：API 对象、变更、控制器、secret 以及由此产生的工作负载。
2. 首先识别当前活跃的主体：服务账号、kubeconfig 身份、节点凭据、webhook 或控制器。
3. 将最小的控制平面边映射到其工作负载效果。
4. 将 RBAC、服务账号、owner reference、命名空间边界以及 secret 的消费方保存在紧凑的证据块中。
5. 重现能够产生决定性工作负载或 secret 效果的最小集群操作。

## 工作流程

### 1. 映射 API 信任路径

- 记录命名空间、服务账号、Roles、ClusterRoles、绑定、准入钩子、控制器，以及它们可以变更的资源。
- 区分读取权限、创建权限、patch 权限、exec 权限和 secret 访问权限。
- 将主体、verb、resource、namespace 以及产生的对象保持在同一条链上。

### 2. 追踪变更到工作负载状态

- 展示一个 API 动作如何变成 Pod、卷挂载、secret 暴露、env 注入、job 运行或由控制器创建的产物。
- 将仓库中签入的 YAML 与经过默认值填充、准入变更或控制器调和之后的 live 对象进行对比。
- 区分 Pod 运行时行为与集群级变更逻辑。

### 3. 归约到决定性集群路径

- 将结果压缩为最小的链路：主体 -> API 权限 -> 被变更的对象 -> 由此产生的工作负载、secret 或路由效果。
- 让 kube 对象、live describe 结果以及被消费的 secret 或 config 路径保持在同一命名空间和控制器下。
- 如果问题收窄到单个容器的挂载或运行时偏差，请切换回范围更窄的容器运行时技能。

## 阅读此参考资料

- 加载 `references/k8s-control-plane.md` 以获取 RBAC 检查清单、控制器检查清单以及证据打包方法。
- 如果难点在于元数据服务的可达性、工作负载身份、实例凭据或由元数据派生的权限，请优先使用 `$competition-cloud-metadata-path`。

## 需要保留的内容

- 命名空间、服务账号、verb、资源种类、RoleBinding 或 ClusterRoleBinding，以及 owner reference 链
- 准入变更、生成的工作负载、被挂载的 secret，以及由控制器产生的漂移
- 产生决定性效果的确切 API 动作或对象 diff
