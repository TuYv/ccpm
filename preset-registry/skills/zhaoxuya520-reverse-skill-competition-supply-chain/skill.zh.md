---
name: competition-supply-chain
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for CI/CD, registry, dependency drift, artifact provenance, image build, release pipeline, and runtime consumer challenges. Use when the user asks to trace dependency drift, registry pulls, malicious packages, build or release tampering, CI execution, artifact signing, or which shipped artifact the runtime actually consumes. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛供应链

只有在 `$ctf-sandbox-orchestrator` 已激活并确立了沙箱假设、节点归属和证据优先级之后，才可将本技能作为下游的专门化技能使用。如果尚未出现这种情况，请先返回 `$ctf-sandbox-orchestrator`。

当挑战实质上关乎溯源、依赖漂移、构建产物、发布流程，或实际交付到运行时的制品究竟是什么时，使用此技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 将问题拆分为源码、依赖解析、构建、打包、发布和运行时消费。
2. 确定预期制品与运行时制品之间首次出现分歧的位置。
3. 将溯源保持为一条紧凑的链条，而不是零散的观察集合。
4. 复现仍能暴露问题的最小构建或打包路径。
5. 将提交入库的意图与流水线实际产出的内容区分开来。

## 工作流程

### 1. 端到端追踪溯源信息

- 梳理源码检出、锁定文件、依赖获取、安装前/安装后步骤、构建脚本、打包、发布目标以及运行时消费者。
- 对比声明的版本、解析后的版本和实际交付的制品。
- 注意 registry、缓存、镜像或 CI 环境之间的差异。

### 2. 核对构建时与运行时

- 将清单文件与镜像层、挂载的机密信息、生成的文件以及运行时钩子进行对比。
- 确定决定性的变更发生在依赖安装、构建步骤、发布步骤还是运行时引导阶段。

### 3. 报告断点

- 指出溯源信息发生分歧的最早位置。
- 将证据保持在一条从源码到运行时消费者的简短链条中。

## 阅读此参考文档

- 加载 `references/supply-chain.md` 以获取溯源检查清单、证据打包方式以及常见的流水线故障模式。

## 需要保留的内容

- 声明的依赖、解析后的依赖以及运行时制品的版本
- CI 步骤名称、registry 拉取记录、制品哈希以及镜像层或软件包层
- 实际接受或执行该制品的运行时消费者
