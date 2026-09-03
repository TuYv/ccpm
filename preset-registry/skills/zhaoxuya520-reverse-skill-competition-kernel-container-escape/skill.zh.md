---
name: competition-kernel-container-escape
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for kernel attack surface, namespace and cgroup boundaries, container isolation assumptions, syscall paths, and escape primitive verification. Use when the user asks to analyze container-to-host escape paths, kernel exploit prerequisites, namespace crossover, capability misuse, or prove whether an exploit primitive crosses the sandbox boundary. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛内核容器逃逸

仅在 `$ctf-sandbox-orchestrator` 已激活并确立了沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专项使用。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当决定性步骤是证明容器化上下文与宿主机或更高权限内核上下文之间的边界穿越时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 首先梳理运行时隔离：命名空间、cgroups、seccomp、capabilities、LSM 以及挂载边界。
2. 将利用前提、原语与边界穿越证明区分开来。
3. 记录内核版本、配置线索、运行时选项以及可达的系统调用面。
4. 将插桩观测与未被污染的挑战路径分开保存。
5. 复现一条从原语到边界穿越的最小链路。

## 工作流程

### 1. 梳理隔离与内核面

- 记录命名空间映射、cgroup 模式、capabilities、seccomp profile、AppArmor 或 SELinux 状态、已挂载的文件系统以及运行时 socket。
- 留意内核版本、发行版构建线索、模块暴露情况以及容器运行时行为。
- 确保宿主机侧与容器侧的观测记录与确切的节点和上下文保持关联。

### 2. 证明利用原语与边界穿越

- 展示可控输入、触发条件、受影响对象，以及可观测的内核或运行时状态变化。
- 捕获穿越前后的身份、命名空间、挂载或进程可见性，以证明边界穿越。
- 区分仅造成崩溃的行为与稳定的能力获取。

### 3. 归约为决定性逃逸链

- 压缩为：前提状态 -> 原语触发 -> 边界穿越证据 -> 由此获得的宿主机级能力。
- 说明根本原因是内核漏洞、运行时配置错误、能力过度授予，还是命名空间泄漏。
- 如果该路径主要依赖初始立足之后的凭据重放，请移交给 Linux 凭据跳转技能。

## 阅读此参考文档

- 加载 `references/kernel-container-escape.md` 以获取隔离清单、原语清单和对等性指引。

## 需要保留的内容

- 内核与运行时上下文、能力集、seccomp 或 LSM 状态，以及命名空间映射
- 原语触发数据、边界穿越证据，以及由此获得的能力
- 一条从容器上下文到宿主机相关影响的最小可复现链路
