---
name: google-cloud-waf-operational-excellence
metadata:
  category: WellArchitectedFramework
description: >-
  Generates operations-focused guidance for Google Cloud workloads based on the
  design principles and recommendations in the Operational Excellence pillar of
  the Google Cloud Well-Architected Framework (WAF). Use this skill to evaluate
  a workload, identify operational requirements, and provide actionable
  recommendations for deployment, monitoring, and incident management.
---
# Google Cloud Well-Architected Framework 卓越运营支柱技能

## 概述

Google Cloud Well-Architected Framework 中的卓越运营支柱提供了关于如何在 Google Cloud 上高效运行工作负载的建议。云中的卓越运营涉及设计、实现和管理能够提供价值、性能、安全性和可靠性的云解决方案。此支柱中的建议可帮助您持续改进和调整工作负载，以满足云中不断变化和持续演进的需求。

## 核心原则

Well-Architected Framework 卓越运营支柱中的建议与以下核心原则保持一致：

-   **确保运营就绪**：定义并衡量工作负载达到生产就绪状态所需满足的标准，包括人员配置、流程和治理。依据文档：
    https://docs.cloud.google.com/architecture/framework/operational-excellence/operational-readiness-and-performance-using-cloudops.md.txt

-   **管理突发事件和问题**：建立结构化的突发事件响应、沟通和根本原因分析流程，以最大限度地降低影响并防止问题再次发生。依据文档：
    https://docs.cloud.google.com/architecture/framework/operational-excellence/manage-incidents-and-problems.md.txt

-   **管理和优化云资源**：监控资源利用率并合理调整环境规模，以便在确保运营效率的同时维持性能。依据文档：
    https://docs.cloud.google.com/architecture/framework/operational-excellence/manage-and-optimize-cloud-resources.md.txt

-   **自动执行和管理变更**：使用基础设施即代码 (IaC) 和 CI/CD 流水线，确保部署和配置变更具有一致性、可重复性和低风险。依据文档：
    https://docs.cloud.google.com/architecture/framework/operational-excellence/automate-and-manage-change.md.txt

-   **持续改进和创新**：定期审查架构、监控行业趋势并调整运营方式，以满足不断变化的业务需求。依据文档：
    https://docs.cloud.google.com/architecture/framework/operational-excellence/continuously-improve-and-innovate.md.txt

## 相关 Google Cloud 产品

以下是与卓越运营相关的 Google Cloud 产品和功能的_示例_：

-   **可观测性和监控**
    -   **Cloud Monitoring**：为 Google Cloud 和混合环境提供全栈可观测性。
    -   **Cloud Logging**：大规模实时日志管理和分析。
    -   **Error Reporting**：汇总并显示正在运行的云服务所产生的错误。
    -   **Service Monitoring**：用于定义和跟踪服务等级目标 (SLO) 的工具。

-   **自动化和 CI/CD**
    -   **Cloud Build**：用于构建、测试和部署软件的无服务器平台。
    -   **Cloud Deploy**：面向 GKE、Cloud Run 和 GCE 的托管式持续交付服务。
    -   **Terraform / Infrastructure Manager**：用于基础设施即代码 (IaC) 自动化的托管服务。
    -   **Artifact Registry**：用于管理构建制品和容器映像的中央代码库。

-   **资源管理与优化**
    -   **Recommender (Active Assist)**：自动识别闲置资源和适当调整资源规模的机会。
    -   **Resource Manager**：跨组织、文件夹和项目对资源进行分层管理。

-   **事件响应**
    -   **事件响应与管理 (IRM)**：用于管理运营中断的结构化工具和流程。

## 工作负载评估问题

提出适当的问题，以了解工作负载及用户组织在运营方面的需求和约束。从以下列表中选择问题：

-   **运营就绪状态与性能**
    -   您如何定义和衡量云工作负载的运营就绪状态？您使用哪些具体标准或指标？
    -   请描述您为关键工作负载定义、跟踪和实现 SLO 的流程。

-   **事件与问题管理**
    -   请描述您的事件管理流程，包括角色、职责和沟通渠道。
    -   您如何开展事件后审查 (PIR)，以确定根本原因并实施预防措施？

-   **资源管理与优化**
    -   您如何确保云资源的规模适合工作负载？您使用哪些工具或技术？

-   **变更自动化**
    -   请描述您的变更管理流程，包括审批工作流、测试程序和部署策略。
    -   您如何实现部署自动化、确保部署一致性并管理配置？

-   **持续改进**
    -   您如何确保云运营能够持续调整，以满足不断变化的业务需求和技术进步？

## 验证检查清单

使用以下检查清单评估架构与卓越运营建议的一致性：

-   **运营就绪状态**
    -   [ ] 已建立正式的框架或一组标准，用于在生产部署前评估运营就绪状态。
    -   [ ] 已明确定义服务级别目标 (SLO)，并使用自动化工具进行监控。

-   **事件管理**
    -   [ ] 已明确定义并记录事件响应角色和沟通渠道。
    -   [ ] 对所有重大事件均采用结构化、无责的事后复盘流程。

-   **变更自动化**
    -   [ ] 所有基础设施变更均使用基础设施即代码 (IaC) 执行，以确保一致性。
    -   [ ] CI/CD 流水线已集成针对所有部署变更的自动化测试。

-   **资源优化**
    -   [ ] 定期使用 Active Assist 的建议或性能数据审查资源利用率。

-   **改进文化**
    -   [ ] 已制定成文的策略，用于定期审查并调整云运营，以适应行业发展。