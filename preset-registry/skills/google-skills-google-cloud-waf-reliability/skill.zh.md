---
name: google-cloud-waf-reliability
metadata:
  category: WellArchitectedFramework
description: >-
  Generates guidance for reliability, resilience, availability, redundancy,
  fault-tolerance, and disaster recovery (DR) for Google Cloud workloads based
  on the design principles and recommendations in the Google Cloud
  Well-Architected Framework. Use when the user asks to evaluate, design, or
  improve the reliability, resilience, availability, or disaster recovery
  capabilities of Google Cloud workloads.
---
# Google Cloud Well-Architected Framework 可靠性支柱技能

## 概览

Google Cloud Well-Architected Framework 的可靠性支柱提供了相关原则和建议，
帮助您在 Google Cloud 中设计、部署和管理可靠、有韧性且高度可用的工作负载。
可靠的系统能够在规定条件下持续执行其预期功能，具备应对故障的韧性，并能从中断中
平稳恢复，从而最大限度地减少停机时间、提升用户体验并确保数据完整性。

## 核心原则

Well-Architected Framework 可靠性支柱中的建议
与以下核心原则保持一致：

-  **根据用户体验目标定义可靠性**：可靠性的衡量应反映
   系统用户的实际体验，而不是仅仅依赖基础设施指标。应重点关注
   对用户最重要的结果。依据文档：
   https://docs.cloud.google.com/architecture/framework/reliability/define-reliability-based-on-user-experience-goals.md.txt

-   **设定切合实际的可靠性目标**：确定适当的服务等级目标
    （SLO），在实现最高可用性所需的成本和复杂性与业务需求之间取得平衡。
    提供有关如何根据监控信号、错误预算和用户体验目标定义
    服务等级目标（SLO）的指导。依据文档：
    https://docs.cloud.google.com/architecture/framework/reliability/set-targets.md.txt

-  **通过资源冗余构建高可用系统**：通过在可用区和
   区域之间复制关键组件来消除单点故障，从而在局部中断期间维持运行。
   依据文档：
   https://docs.cloud.google.com/architecture/framework/reliability/build-highly-available-systems.md.txt

-   **利用横向可伸缩性**：设计可
    横向扩缩（添加更多实例）的系统架构，以无缝适应负载
    波动并提高整体容错能力。纳入主动式
    容量规划，以监控和调整项目配额与资源
    可用性，为突发负载峰值做好准备。依据文档：
    https://docs.cloud.google.com/architecture/framework/reliability/horizontal-scalability.md.txt

-   **使用可观测性检测潜在故障**：实施全面的
    监控、日志记录和告警系统，以便在异常导致面向用户的问题之前主动检测、
    诊断并处理异常。监控
    黄金信号（延迟、流量、错误和饱和度），并设置在
    信号超过指定阈值时触发的告警。使用 Cloud Monitoring
    为黄金信号构建综合信息中心。依据文档：
    https://docs.cloud.google.com/architecture/framework/reliability/observability.md.txt

-   **为优雅降级而设计**：构建能够在
    依赖项发生故障或系统承受极端压力时，即使性能有所下降或功能受到限制，
    仍可维持关键功能的系统。为避免
    级联故障，建议设置告警以尽早检测故障、
    使用断路器模式、有效处理超时以释放
    被阻塞的资源、采用具有指数退避和抖动机制的重试以
    避免恢复中的后端系统不堪重负，以及返回自定义错误
    响应或静态后备页面。依据文档：
    https://docs.cloud.google.com/architecture/framework/reliability/graceful-degradation.md.txt

-  **执行故障恢复测试**：通过持续模拟故障并验证自动和手动恢复流程的有效性，增强对系统韧性的信心。依据文档：
   https://docs.cloud.google.com/architecture/framework/reliability/perform-testing-for-recovery-from-failures.md.txt

-  **执行数据丢失恢复测试**：定期测试备份和还原规程，确保能够从数据损坏或丢失中快速恢复，并保持在定义的恢复时间目标（RTO）和恢复点目标（RPO）范围内。依据文档：
   https://docs.cloud.google.com/architecture/framework/reliability/perform-testing-for-recovery-from-data-loss.md.txt

-  **开展全面的事后复盘**：通过全面调查中断事件以了解根本原因，并随后实施防止问题再次发生的措施，营造无责文化。依据文档：
   https://docs.cloud.google.com/architecture/framework/reliability/conduct-postmortems.md.txt

## 相关 Google Cloud 产品

以下是与可靠性相关的 Google Cloud 产品和功能的_示例_：

- **计算**：Compute Engine Managed Instance Groups (MIGs)、Google Kubernetes
  Engine (GKE)、Cloud Run
- **网络**：Cloud Load Balancing、Cloud CDN、Cloud DNS
- **存储和数据库**：Cloud Storage (multi-region)、Cloud SQL High
  Availability、Spanner、Filestore、Firestore
- **运维**：Cloud Monitoring、Cloud Logging、Google Cloud Managed Service
  for Prometheus
- **灾难恢复**：Backup and DR Service、Filestore backups

## 工作负载评估问题

提出适当的问题，以了解工作负载及用户组织在可靠性方面的要求和约束。从以下列表中选择问题：

- 贵组织如何根据用户体验定义和衡量系统的可靠性？
- 贵组织如何为服务设定可靠性目标？
- 贵组织通过资源冗余确保高可用性的策略是什么？
- 贵组织如何利用横向扩展来维持性能和可靠性？
- 贵组织如何利用可观测性（指标、日志、跟踪）获取洞察并检测潜在故障？
- 贵组织如何基于可观测性数据管理告警，以确保及时响应重大问题，同时避免告警疲劳？
- 贵组织采取哪些措施来确保系统在高负载或部分故障期间能够优雅降级？
- 贵组织对系统故障恢复（例如区域故障转移、版本发布回滚）进行测试的频率和全面程度如何？
- 贵组织采用什么方法测试数据丢失恢复？
- 贵组织如何在事件发生后开展并利用事后复盘？

## 验证清单

使用以下检查清单评估该架构是否符合可靠性建议：

- 已明确定义并持续监控以用户为中心的 SLI 和 SLO。
- 该架构通过跨可用区或跨区域冗余来避免单点故障。
- 已启用自动扩缩容，以便在无需人工干预的情况下应对需求变化。
- 已配置应用程序和基础设施健康检查，以触发自动故障转移。
- 已制定定期备份计划，并定期测试恢复流程。
- 系统架构采用断路器、指数退避重试和速率限制等模式，以支持优雅降级。
- 定期举行故障演练或开展混沌工程实践，以验证故障恢复能力。
- 已建立正式的、无指责的事后复盘流程，以确保组织能够从运营事件中汲取经验。