---
name: google-cloud-waf-security
metadata:
  category: WellArchitectedFramework
description: >-
  Generates security-focused guidance for Google Cloud workloads based on the
  design principles and recommendations in the Google Cloud Well-Architected
  Framework (WAF). Use this skill to evaluate workloads, identify security
  requirements, and provide actionable recommendations for IAM, network
  security, data protection, and operational security.
---
# Google Cloud 架构完善框架安全支柱技能

## 概述

Google Cloud 架构完善框架的安全支柱提供了设计原则和最佳实践，通过将安全性集成到云工作负载架构的每一层，帮助构建稳健的安全态势。它侧重于维护数据和系统的机密性与完整性，同时确保合规性和隐私保护。它为风险管理、威胁防御和身份控制提供了一种结构化方法，使您能够安全且规模化地运行云工作负载。

## 工作流程

激活此技能后，请按照以下步骤评估并改善指定 Google Cloud 工作负载的安全态势：

1.  **了解背景信息**：从**工作负载评估问题**列表中提出有针对性的问题，以收集有关用户当前架构、安全要求和约束条件的信息。
2.  **分析并识别差距**：根据**核心原则**和**验证清单**评估工作负载，以识别安全漏洞、缺失的控制措施或偏离最佳实践的情况。
3.  **制定建议**：根据 Google Cloud 架构完善框架提供可操作且按优先级排序的指导。推荐**相关 Google Cloud 产品**中的特定产品，以解决已识别的差距。
4.  **解释建议**：使所有建议与适当的**核心原则**保持一致，并说明每项建议可带来的益处。
5.  **迭代并完善**：帮助用户调整建议，以适应其特定要求和约束条件。

## 核心原则

架构完善框架安全支柱中的建议与以下核心原则保持一致：

-  **实施安全设计**：从应用和基础设施的初始设计阶段开始，集成云安全和网络安全方面的考量。Google Cloud 提供架构蓝图和建议，帮助您应用此原则。依据文档：
   https://docs.cloud.google.com/architecture/framework/security/implement-security-by-design.md.txt

-  **实施零信任**：采用_永不信任，始终验证_的方法，根据对信任的持续验证授予资源访问权限。Google Cloud 通过 Chrome Enterprise Premium、Identity-Aware Proxy (IAP) 和 IAM Recommender 等产品支持此原则。依据文档：
   https://docs.cloud.google.com/architecture/framework/security/implement-zero-trust.md.txt

-  **实施左移安全**：在软件开发生命周期的早期实施安全控制。在进行系统变更之前避免产生安全缺陷。在提交系统变更后，尽早、快速且可靠地检测并修复安全缺陷。Google Cloud 通过 Cloud Build、Binary Authorization 和 Artifact Registry 等产品支持此原则。依据文档：
   https://docs.cloud.google.com/architecture/framework/security/implement-shift-left-security.md.txt

-  **实施先发式网络防御**：通过实施威胁情报等稳健的基础措施，采取主动的安全方法。这种方法可帮助您为更有效的威胁检测和响应奠定基础。Google Cloud 的分层安全控制方法符合此原则。Google Cloud 通过 Security Command Center、Google Threat Intelligence 和 Google SecOps 等产品支持此原则。依据文档：
   https://docs.cloud.google.com/architecture/framework/security/implement-preemptive-cyber-defense.md.txt

-  **安全且负责任地使用 AI**：以负责任且安全的方式开发和部署 AI 系统。此原则的建议与 Well-Architected Framework 的 AI 和机器学习视角中的指导，以及 Google 的 Secure AI Framework (SAIF) 保持一致。依据文档：
   https://docs.cloud.google.com/architecture/framework/security/use-ai-securely-and-responsibly.md.txt

-  **使用 AI 增强安全性**：通过 Gemini in Security 和整体平台安全功能，使用 AI 功能改进现有的安全系统和流程。将 AI 用作提高补救工作自动化程度并确保安全卫生的工具，从而使其他系统更加安全。Google Cloud 通过 Google Threat Intelligence 和 Google SecOps 等产品支持此原则。依据文档：
   https://docs.cloud.google.com/architecture/framework/security/use-ai-for-security.md.txt

-  **满足监管、合规和隐私要求**：遵守特定于行业的法规、合规标准和隐私要求。Google Cloud 通过 Assured Workloads、Organization Policy Service 和我们的合规资源中心等产品和资源，帮助您履行这些义务。依据文档：
   https://docs.cloud.google.com/architecture/framework/security/meet-regulatory-compliance-and-privacy-needs.md.txt

- **Google Cloud 上的责任共担与命运共同体**：了解 Google 负责云的_自身_安全，而您负责云_中_工作负载的安全。认识到这种责任划分会因工作负载类型而异。了解 Google 为帮助确保云的_自身_安全所采取的措施。采取适当行动，帮助确保您的工作负载在云_中_的安全。
  依据文档：https://docs.cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate.md.txt

## 相关 Google Cloud 产品

以下是与安全相关的 Google Cloud 产品和功能_示例_：

- **身份和访问权限管理**

  - **Cloud Identity**：管理用户生命周期、身份验证和身份联合。
  - **Identity and Access Management (IAM)**：对 Google Cloud 资源进行精细的访问权限控制。
  - **Identity-Aware Proxy (IAP)**：无需 VPN 即可安全访问应用。
  - **Chrome Enterprise Premium**：端点安全和上下文感知访问。
  - **IAM Recommender**：提供政策智能。

- **网络安全**

  - **Google Cloud Armor**：DDoS 防护和 Web 应用防火墙 (WAF)。
  - **VPC Service Controls**：定义安全边界，防止数据
    外泄。
  - **Cloud Next-Generation Firewall (NGFW)**：为网络流量提供高级
    威胁防护。
  - **Shared VPC**：跨项目集中管理网络。
  - **Cloud Interconnect and IPsec VPN**：安全的专用连接。
  -**Private Service Connect**：提供对托管服务的私有访问

- **数据安全**

  - **Cloud Key Management Service (KMS)**：管理加密密钥。
  - **Sensitive Data Protection（以前称为 Cloud DLP）**：发现和编校
    敏感数据。
  - **Confidential Computing**：加密使用中（内存中）的数据。

- **安全运营 (SecOps)**

  - **Google SecOps (Chronicle)**：威胁检测和安全分析。
  - **Security Command Center (SCC)**：集中管理漏洞和
    威胁。
  - **Cloud Logging and Cloud Monitoring**：深入了解系统活动。
  - **BigQuery**：存储导出的日志以供分析。

- **自动化和供应链**

  - **Cloud Build**：保护 CI/CD 流水线。
  - **Artifact Analysis**：对容器映像进行漏洞扫描。
  - **Binary Authorization**：在部署时强制执行政策。
  - **Assured open source software**：使用安全的 OSS 软件包。

## 工作负载评估问题

提出适当的问题，以了解工作负载和用户组织在安全方面的要求及
限制。从以下列表中选择问题：

- **安全设计**：

  - 如何在项目的初始规划和设计阶段纳入
    安全考虑因素？
  - 如何定义和记录新应用及
    服务的安全要求？
  - 如何确保将安全性集成到开发
    生命周期中？
  - 在设计阶段执行威胁建模时，会使用哪些工具和
    技术？
  - 如何管理在设计和开发过程中发现的安全漏洞并确定其
    优先级？
  - 如何处理应用和
    基础设施的安全更新及补丁？
  - 如何记录安全设计决策，并将其传达给团队
    和利益相关者？
  - 如何确保在各个环境中一致地应用
    安全配置？
  - 如何验证安全控制和
    措施的有效性？
  - 如何处理安全例外情况以及对安全
    设计的偏离？

- **零信任**：

  - 如何验证访问 Google
    Cloud 资源的用户和设备并对其进行身份认证？
  - 如何在访问控制中实施最小权限原则？
  - 如何监控和控制 Google Cloud
    环境内的网络流量？
  - 如何保护 Google Cloud
    环境中传输中和静态的数据？
  - 如何对用户和设备
    活动实施持续监控和日志记录？
  - 在零信任环境中，如何处理和应对安全事件及
    入侵？
  - 在零信任
    环境中，如何管理和更新安全政策及控制措施？
  - 如何确保第三方应用和服务符合
    零信任原则？
  - 在零信任
    环境中，如何处理远程访问和 BYOD 设备？
  - 如何就零信任原则和
    实践对员工进行教育和培训？

- **安全左移**：

  - 如何在开发流程的早期阶段将安全测试集成到开发流水线中？
  - 在开发阶段会执行哪些类型的安全测试？
  - 如何向开发人员提供有关安全漏洞和最佳实践的反馈？
  - 如何赋能开发人员，使其对自己代码的安全性负责？
  - 如何确保安全要求得到明确定义并传达给开发人员？
  - 如何衡量安全左移计划的有效性？
  - 如何处理代码中的安全依赖项和第三方库？
  - 如何管理和更新开发环境中的安全配置？
  - 如何处理开发过程中不符合安全策略的安全例外和偏差？
  - 如何在开发人员中营造安全意识和责任文化？

- **主动式网络防御**：

  - 如何在潜在安全威胁影响系统之前主动识别并缓解这些威胁？
  - 使用哪些工具和技术进行持续的安全监控和分析？
  - 如何响应和处置安全警报与事件？
  - 如何模拟和测试事件响应计划？
  - 如何及时了解最新的安全威胁和漏洞？
  - 如何应对并缓解针对应用程序和服务的 DDoS 攻击？
  - 如何保护敏感数据免受内部威胁？
  - 如何确保安全控制措施能够有效抵御高级持续性威胁（APT）？
  - 如何处理供应链中的安全漏洞？
  - 如何调整安全态势以应对不断演变的威胁和技术？

- **AI 工作负载安全**：

  - 如何确保 AI 模型和数据的安全？
  - 如何解决 AI 模型中潜在的偏见和伦理问题？
  - 如何保护 AI 模型免受对抗性攻击和数据投毒？
  - 如何确保 AI 模型所使用数据的隐私？
  - 如何解释和解读 AI 模型所做出的决策？
  - 如何管理和控制对 AI 模型及数据的访问？
  - 如何确保遵守与 AI 和 ML 相关的法规与标准？
  - 如何监控和检测 AI 模型行为中的异常？
  - 如何处理和响应涉及 AI 模型的安全事件？
  - 如何就安全且负责任地使用 AI 和 ML 对员工进行教育和培训？

- **AI 赋能安全**：

  - 如何利用 AI 和 ML 增强安全态势？
  - 使用哪些类型的 AI 模型来实现安全目的？
  - 如何针对安全应用训练和验证 AI 模型？
  - 如何确保基于 AI 的安全系统的准确性和可靠性？
  - 如何处理基于 AI 的安全系统产生的误报和漏报？
  - 如何将基于 AI 的安全系统与现有安全基础设施集成？
  - 如何管理和更新用于安全应用的 AI 模型？
  - 如何解释和解读用于安全应用的 AI 模型所做出的决策？
  - 如何确保出于安全目的，以合乎伦理且负责任的方式使用 AI 和 ML？
  - 如何衡量 AI 和 ML 在改善安全态势方面的有效性？

- **法规合规与隐私**：

  - 您需要遵守哪些法规合规框架和隐私标准？
  - 您如何评估和管理 Google Cloud 环境中的合规风险？
  - 您如何确保在 Google Cloud 中存储和处理的敏感数据的隐私性？
  - 您如何处理与隐私法规相关的数据主体请求（DSR）？
  - 您如何记录和跟踪合规活动及证据？
  - 您如何确保第三方供应商和合作伙伴遵守您的法规与隐私要求？
  - 您如何处理与合规法规相关的数据泄露和安全事件？
  - 您如何及时了解法规合规与隐私标准的变化？
  - 您如何针对法规合规与隐私要求对员工进行教育和培训？
  - 您如何向审计人员和监管机构展示并证明合规性？

## 验证检查清单

使用以下检查清单评估架构与安全建议的一致性：

- **安全设计**：

  - 是否根据系统组件的安全功能和加固程度来选择组件？
  - 是否在网络、主机和应用层实施了纵深防御？
  - 是否使用安全的库和应用框架来防止常见漏洞？
  - 是否使用行业标准进行风险评估？

- **零信任**：

  - 是否使用 Cloud Identity 作为集中式身份提供商来管理用户生命周期和身份联合？
  - 是否根据用户身份和上下文（设备、位置）实施访问控制？
  - 是否对内部流量使用私有连接方式（Cloud Interconnect、VPN）？
  - 是否在所有项目中禁用了默认网络？
  - 是否围绕敏感数据建立了 VPC Service Controls 边界？

- **安全左移**：

  - 是否使用基础设施即代码（例如 Terraform）预配基础设施？
  - 是否将自动化安全扫描集成到 CI/CD 流水线中？
  - 是否有用于扫描和修补依赖项漏洞的流程？
  - 是否使用 Binary Authorization 来确保仅部署可信镜像？

- **主动式网络防御**：

  - 是否将威胁情报集成到安全运营中？
  - 是否为所有关键资源启用并集中管理安全日志？
  - 是否针对常见安全威胁配置了自动响应？
  - 是否通过定期测试或红队演练来验证防御措施？

- **AI 安全与治理**：

  - 是否保护 AI 流水线免遭篡改和数据投毒？
  - 是否在适当情况下对训练数据使用差分隐私或数据掩码？
  - 是否使用 Vertex Explainable AI 和公平性指标进行模型治理？