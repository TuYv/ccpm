---
name: google-cloud-waf-performance-optimization
metadata:
  category: WellArchitectedFramework
description: >-
  Generates performance-focused guidance for Google Cloud workloads based on the
  design principles and recommendations in the Performance Optimization pillar
  of the Google Cloud Well-Architected Framework (WAF). Use this skill
  to evaluate a workload, identify performance requirements, and provide
  actionable recommendations for resource allocation, modular design, and
  elasticity.
---
# Google Cloud Well-Architected Framework 性能优化支柱技能

## 概述

Google Cloud Well-Architected Framework 的性能优化支柱提供了一系列原则和建议，帮助您设计、构建和运营高性能工作负载。该支柱重点关注如何高效分配资源、利用模块化架构，以及如何使用数据驱动的洞察持续监控和改进性能，以适应不断变化的业务需求。

## 核心原则

Well-Architected Framework 性能优化支柱中的建议与以下核心原则保持一致：

-   **规划资源分配**：谨慎选择和配置最符合工作负载特定要求的计算、存储和网络资源。依据文档：
    https://docs.cloud.google.com/architecture/framework/performance-optimization/plan-resource-allocation.md.txt

-   **充分利用弹性**：利用自动扩缩容和无服务器技术，根据实时需求波动动态调整资源容量。依据文档：
    https://docs.cloud.google.com/architecture/framework/performance-optimization/elasticity.md.txt

-   **推行模块化设计**：使用独立、松耦合的组件构建系统，以增强可伸缩性，并允许在不影响整个系统的情况下优化各个部分。依据文档：
    https://docs.cloud.google.com/architecture/framework/performance-optimization/promote-modular-design.md.txt

-   **持续监控和改进性能**：实施强大的可观测性机制以识别瓶颈，并使用性能数据推动整个软件开发生命周期中的迭代改进。依据文档：
    https://docs.cloud.google.com/architecture/framework/performance-optimization/continuously-monitor-and-improve-performance.md.txt

## 相关 Google Cloud 产品

以下是与性能优化相关的 Google Cloud 产品和功能的_示例_：

-   **计算和扩缩容**
    -   **Compute Engine (MIGs)**：支持自动扩缩容和负载均衡、适用于基于 VM 的工作负载的托管式实例组。
    -   **Google Kubernetes Engine (GKE)**：提供容器编排，并支持 Pod 水平和垂直自动扩缩容。
    -   **Cloud Run**：完全托管式无服务器平台，可根据流量自动将容器缩容至零或扩容。

-   **数据和缓存**
    -   **Cloud CDN**：低延迟内容分发网络，用于在更靠近最终用户的位置缓存静态和动态内容。
    -   **Memorystore**：适用于 Valkey 和 Redis 的托管式内存数据存储，可提供亚毫秒级数据访问。
    -   **Bigtable**：适用于需要低延迟和高吞吐量的分析及运营工作负载的 NoSQL 数据库服务。
    -   **Spanner**：为任务关键型事务应用提供全局一致性、高可用性和水平扩展能力的 RDBMS。

-   **性能分析与监控**
    -   **Cloud Trace**：分布式追踪系统，可帮助识别延迟
        瓶颈。
    -   **Cloud Profiler**：持续进行 CPU 和内存性能分析，以识别
        资源消耗较高的应用程序代码。
    -   **Cloud Monitoring**：根据延迟和吞吐量等
        性能 KPI 提供信息中心和提醒。

## 工作负载评估问题

提出适当的问题，以了解工作负载和用户组织在性能方面的要求与
约束。从以下列表中选择问题：

-   **规划资源分配**
    -   最初为新应用程序预配计算资源时，
        你采用什么方法来确定应对预期峰值负载所需的
        容量？
    -   你采用哪些缓存策略（浏览器、内存、CDN、数据库）
        来提升性能和响应速度？
    -   你如何针对应用程序优化数据存储解决方案
        （例如 SSD 与 HDD、存储类别）的性能？

-   **促进模块化设计**
    -   你采用哪些架构模式（微服务、异步消息传递、
        无状态服务器）来增强性能和韧性？
    -   你如何设计应用程序，以最大限度减少系统某一部分发生故障
        对其他部分造成的影响？

-   **持续监控并改进性能**
    -   你多久审查和分析一次
        生产环境应用程序及基础设施的性能？
    -   你使用哪些工具或技术（APM、分布式追踪、负载测试）
        来主动识别和诊断性能瓶颈？
    -   你如何将性能考量纳入软件
        开发生命周期（SDLC）？

-   **利用弹性**
    -   在维持性能的同时，你使用哪些方法来管理和优化云
        资源成本？
    -   你通常如何处理应用程序突发的流量或工作负载
        峰值？

## 验证清单

使用以下清单评估架构与
性能优化建议的一致性：

-   **资源分配**
    -   [ ] 初始预配基于负载测试或历史数据，
        而不是一般性估算。
    -   [ ] 在多个层级（CDN、内存或
        浏览器）实施缓存，以减轻后端系统的负载。
    -   [ ] 根据工作负载的具体 I/O 要求选择存储类型（SSD/HDD）
        和存储类别。

-   **模块化设计**
    -   [ ] 架构使用微服务或解耦组件，以支持
        独立扩缩容。
    -   [ ] 实施断路器或舱壁模式来隔离故障，
        防止整个系统出现性能下降。

-   **监控与持续改进**
    -   [ ] 针对关键性能指标（KPI）配置自动化信息中心和
        提醒。
    -   [ ] 使用分布式追踪和性能分析工具来识别
        代码级瓶颈。
    -   [ ] 将性能测试（单元测试和集成测试）集成到
        软件开发生命周期中。

-   **弹性**
    -   [ ] 已配置并验证自动扩缩容规则，以应对变化的需求。
    -   [ ] 架构利用无服务器或托管服务，动态调整容量以匹配负载。
    -   [ ] 定期审查资源利用率，以消除闲置开销并平衡成本与性能。