---
name: moai-ref-secops
description: >
  DevSecOps, container, and API operational defensive security reference: CI/CD
  pipeline hardening, secret scanning, IaC misconfiguration detection, SAST/DAST
  integration, container image scanning, Kubernetes RBAC hardening, container-escape
  defense, runtime threat detection, OWASP API Top 10 operational defense, WAF rule
  tuning, and GraphQL/REST depth and rate limiting. Agent-extending skill that
  amplifies backend, security, and platform-engineering work with production-grade
  defensive patterns for pipelines, containers, and running APIs.
  NOT for: offensive techniques (exploit execution, container-escape attack steps,
  privilege-escalation procedures, attack tooling), dev-time web-app OWASP Top 10
  (see moai-ref-owasp-checklist), LLM/AI security (see moai-ref-llm-security),
  supply-chain provenance and signing (see moai-ref-supply-chain), or general API
  design (see moai-ref-api-patterns).

when_to_use: >
  Use when hardening a CI/CD pipeline, scanning infrastructure-as-code for
  misconfiguration, hardening a container image or Kubernetes cluster, defending
  against container escape, writing runtime-detection rules, enforcing operational
  API defenses (BOLA detection in production, rate-limit enforcement, server-side
  authorization, WAF tuning), or limiting GraphQL/REST query depth and complexity.
  Loads as background knowledge for DevSecOps review, container-security hardening,
  and API operational-defense tasks across any language ecosystem.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-06-24"
  tags: "devsecops, container, kubernetes, rbac, api-security, owasp-api, cicd, iac-scanning, runtime-detection, waf, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000
---
# DevSecOps、容器与 API 运维安全参考

面向防御实践者的系统运维层参考——包括构建系统的流水线、运行系统的容器与编排器，以及系统在运行时暴露的 API 接口面。每个章节都以防御、加固、检测或验证为出发点：说明错误配置、如何检测以及如何预防，而绝不会说明如何利用。

本技能按子领域划分为三个模块。以下概述给出了共享威胁模型和入口；深入内容位于各模块中。该威胁模型聚焦于运维：流水线可能遭到篡改以注入构建步骤，容器可能因错误配置而导致攻击者突破到宿主机，运行中的 API 可能将一个租户的数据泄露给另一个租户。相应防御措施会在每一层建立最小权限、隔离、检测和运行时授权机制。

## 三个子领域（模块）

| 子领域 | 模块 | 涵盖内容 |
|------------|--------|--------|
| DevSecOps | [modules/devsecops.md](modules/devsecops.md) | CI/CD 流水线加固、密钥扫描、IaC 错误配置检测（Terraform / CloudFormation）、SAST/DAST 集成 |
| 容器 | [modules/container.md](modules/container.md) | 镜像扫描、Kubernetes RBAC 加固、容器逃逸防御（seccomp / AppArmor / 只读根文件系统 / 非 root 用户）、运行时威胁检测 |
| API 运维 | [modules/api-ops.md](modules/api-ops.md) | OWASP API Top 10 运维防御（生产环境中的 BOLA / 身份验证失效检测、速率限制强制执行、服务端授权）、WAF 规则调优、GraphQL/REST 深度与复杂度限制 |

## 运维信任边界

核心防御理念是：每个运维层都是一个边界，已经抵达该层的攻击者可以从这里继续向下一层移动。纵深防御意味着每个边界都假设其之前的边界可能已经失守。

| 边界 | 运维风险 | 主要防御措施 | 模块 |
|----------|------------------|-----------------|--------|
| 源代码 → 流水线 | 注入的构建步骤、泄露的密钥、中毒的运行器 | 签名流水线、密钥扫描、运行器隔离 | DevSecOps |
| 流水线 → 基础设施配置 | 错误配置的云资源（开放的存储桶、过于宽松的 IAM） | 在应用配置前执行 IaC 扫描 | DevSecOps |
| 镜像 → 镜像仓库 | 存在漏洞的基础镜像、嵌入的密钥 | 镜像扫描 + 准入控制 | 容器 |
| 容器 → 宿主机 | 从容器逃逸至节点 | seccomp、AppArmor、只读根文件系统、非 root 用户、移除 capabilities | 容器 |
| 集群身份 → 资源 | 权限过高的 ServiceAccount、范围过宽的 RoleBinding | 最小权限 RBAC、PodSecurity 准入控制 | 容器 |
| 客户端 → API | 对象/功能授权失效、资源耗尽 | 服务端授权、速率限制、WAF | API 运维 |

## 生态系统中立的工具

本技能以工具类别来指代工具。当某个工具是其类别中事实上的跨生态系统标准时，会提及该工具，但会将其描述为“标准的 \<category\> 工具”——相关概念可迁移至任何同等工具。不偏重任何单一语言生态系统；流水线示例采用 CLI 形式，而非特定于某种语言的源代码。

## 与 moai-ref-owasp-checklist 的区别（运维阶段，而非开发阶段）

API 运维模块涵盖 API 安全的**运行时/运维**部分——
检测生产流量中的对象级授权失效、在网关实施速率限制、
调优 WAF、限制线上端点的查询深度。**开发阶段**部分——
开发者在编写端点时采用的安全编码模式（参数化查询、输入验证、
身份验证设计、安全标头）——归属于 `moai-ref-owasp-checklist`。
本技能仅涵盖运维层面，不会重复这些内容。

## 交叉引用

- `moai-ref-owasp-checklist` — 开发阶段的 Web 应用 OWASP 十大风险、身份验证
  模式、输入验证、HTTP 安全标头（开发阶段的范畴；
  本技能涵盖运维阶段的范畴）。
- `moai-ref-supply-chain` — SBOM、SLSA 来源证明、Sigstore 签名、依赖项
  安全治理（供应链范畴；本技能中的镜像扫描和流水线签名会利用其实现
  制品来源追溯）。
- `moai-ref-llm-security` — AI/LLM 防御性安全（LLM 特有的运维
  范畴，与本技能涵盖的通用 API/容器/流水线范畴不同）。
- `moai-ref-api-patterns` — REST/GraphQL API 设计和错误处理（
  API 设计范畴，与本技能涵盖的 API 运维防御范畴不同）。

## 防御性严重程度级别

| 级别 | 标签 | 措施 | 示例 |
|-------|-------|--------|---------|
| P0 | 严重 | 阻止发布 | 容器以特权模式运行并挂载主机目录；API 端点未在服务器端执行对象所有权检查 |
| P1 | 高 | 合并前修复 | 流水线密钥暴露在构建日志中；ServiceAccount 绑定到 cluster-admin |
| P2 | 中 | 在当前迭代内修复 | 流水线中没有镜像扫描；高开销端点没有速率限制 |
| P3 | 低 | 记录到待办事项中 | 在应当强制执行的情况下，WAF 仅采用检测模式；浅层架构未设置 GraphQL 深度限制 |

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “集群是内部的，因此可以不强化 RBAC” | 任何遭入侵的 Pod 都能访问内部集群。最小权限 RBAC 是阻止单个遭入侵工作负载控制整个集群的安全边界。 |
| “容器运行的是我们自己可信的镜像，因此没必要防范容器逃逸” | 包含存在漏洞的依赖项时，可信镜像仍然存在逃逸风险。seccomp、非 root 用户和只读根文件系统的实施成本很低，并且以镜像可能已遭入侵为前提。 |
| “授权由前端处理，API 可以信任客户端” | 客户端永远不是信任边界。每一项 API 运维防御措施——尤其是对象级授权失效防御——都要求服务器端对每个请求执行对象所有权检查。 |
| “我们在构建时扫描镜像，运行时检测是多余的” | 构建时扫描无法发现部署后披露的零日漏洞，也无法检测运行时行为。运行时检测可以发现静态扫描无法发现的问题。 |
| “速率限制会影响合法用户，如果发生滥用，我们再添加” | 无限制资源消耗是 OWASP API 十大风险之一，往往在被发现之前就已遭到利用。速率限制和查询复杂度上限是必要的控制措施，而不是事后补救。 |

**逐层假定已遭入侵**：每个运维层都假定其前一层可能已经失效——流水线假定源已被投毒，容器假定镜像存在漏洞，API 假定客户端具有恶意。防御依赖的是每一层的控制措施，而不是对前一层的信任。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 容器以特权模式或 root 身份运行，使用可写的根文件系统，或者挂载了主机路径
- Kubernetes ServiceAccount 绑定到 cluster-admin 或通配符 Role
- API 端点按 ID 返回对象，但不进行服务端所有权检查（对象级授权失效）
- CI/CD 流水线将密钥输出到构建日志中，或在共享且未隔离的运行器上运行不受信任的代码
- 基础设施即代码未经错误配置扫描便应用到生产环境
- 面向公众的 API 没有速率限制、查询深度限制和请求大小上限
- 缺少运行时检测，因此部署后遭到入侵时不会产生警报

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] CI/CD 流水线在部署前运行密钥扫描和 IaC 错误配置扫描；运行器相互隔离（参见 [modules/devsecops.md](modules/devsecops.md)）
- [ ] 容器镜像经过扫描并由准入控制进行管控；容器以非 root 身份运行，使用只读根文件系统、移除 capabilities，并应用 seccomp 配置文件（参见 [modules/container.md](modules/container.md)）
- [ ] Kubernetes RBAC 遵循最小权限原则；没有任何 ServiceAccount 绑定到 cluster-admin；强制执行 PodSecurity 准入（参见 [modules/container.md](modules/container.md)）
- [ ] 运行时检测规则针对容器逃逸和凭据访问行为发出警报；警报会发送给响应人员（参见 [modules/container.md](modules/container.md)）
- [ ] 每个 API 端点都强制执行服务端对象级和功能级授权；可在生产流量中检测到 BOLA（参见 [modules/api-ops.md](modules/api-ops.md)）
- [ ] 在网关处强制执行速率限制、请求大小上限以及 GraphQL/REST 深度和复杂度限制（参见 [modules/api-ops.md](modules/api-ops.md)）
- [ ] 运维覆盖范围不重复 `moai-ref-owasp-checklist` 中的开发阶段模式；两者需结合查阅

<!-- moai:evolvable-end -->