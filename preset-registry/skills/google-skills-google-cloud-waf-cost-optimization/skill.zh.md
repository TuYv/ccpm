---
name: google-cloud-waf-cost-optimization
metadata:
  category: WellArchitectedFramework
description: Generates cost optimization guidance for Google Cloud workloads based on the Google Cloud Well-Architected Framework (WAF). Use this skill to evaluate a workload, identify cost requirements and constraints, and provide actionable recommendations for build, deploy, and manage the workload cost-efficiently in Google Cloud.
---
# Google Cloud Well-Architected Framework 成本优化支柱技能

## 概述

Google Cloud Well-Architected Framework 的成本优化支柱提供了一种结构化方法，
用于优化云工作负载的成本，同时最大限度地提高业务价值。云成本与本地部署的
资本性支出 (CapEx) 模式存在显著差异，因此需要转向运营支出 (OpEx) 管理，
并建立问责文化 (FinOps)。
FinOps 生命周期由三个迭代阶段组成：
- **告知**：可见性和分配。始终从 **Cloud Billing
  reports** 开始，以获得控制台内置的可见性（按部门标签筛选）。
  再配合使用 **Looker Studio**，创建可自定义、可共享的跨部门
  信息中心。

- **优化**：费率和用量。消除浪费、合理调整资源规模，并利用承诺机制（**CUDs**、**SUDs**）。
- **运营**：持续改进。将成本管理集成到交付流水线中，并建立治理机制。

## 操作说明

- **全面优先**：始终提供与所提及的服务或场景相关的完整标准建议/策略列表。不要仅仅因为要提出后续问题，就限制范围或省略标准要素。
- **完整合取**：当一条指令包含多个操作时（例如“A **AND** B”），你必须在响应中明确提及并解释**这两个**操作。
- **条件式评估**：除非用户明确要求先进行访谈或评估，否则只能在提供标准框架建议*之后*，使用“工作负载评估问题”来完善建议。

## 核心原则

Well-Architected Framework 成本优化支柱中的建议
与以下核心原则保持一致：

-  **使云支出与业务价值保持一致**：确保云
   资源通过使 IT 支出与业务目标保持一致，交付可衡量的业务价值。
   优先考虑能够直接促进收入增长、客户满意度提升或运营效率提高的
   投资。依据文档：
   https://docs.cloud.google.com/architecture/framework/cost-optimization/align-cloud-spending-business-value.md.txt

-  **培养成本意识文化**：确保组织内的人员
   在做出决策和开展活动时考虑成本影响。
   为团队提供所需的可见性和信息，使其能够做出明智且
   具有成本意识的选择。依据文档：
   https://docs.cloud.google.com/architecture/framework/cost-optimization/foster-culture-cost-awareness.md.txt

-  **优化资源使用**：仅预配所需的资源，并且
   仅为实际使用量付费。选择能够满足技术和业务需求且最具成本效益的资源类型、
   规模和位置。
   依据文档：
   https://docs.cloud.google.com/architecture/framework/cost-optimization/optimize-resource-usage.md.txt

-  **持续优化**：持续监控云资源使用情况和成本，并根据需要主动进行调整，以优化支出。这种迭代方法有助于在低效问题变得严重之前发现并解决它们。依据文档：
   https://docs.cloud.google.com/architecture/framework/cost-optimization/optimize-continuously.md.txt

## 相关 Google Cloud 产品

以下是与成本优化相关的 Google Cloud 产品和功能的_示例_：

- **可见性和监控**：

  - **Cloud Billing 报告**：用于可视化支出和趋势的内置仪表板。**对于在控制台中实现可见性至关重要。**
  - **BigQuery 结算导出**：支持使用 SQL 和 BI 工具对结算数据进行细粒度的自定义分析。
  - **Looker Studio**：用于创建详细、可共享的成本仪表板和报告。**与 Cloud Billing 报告配合使用，以获得自定义的可视化洞察。**
  - **结算提醒和预算**：当支出达到预定义阈值时发送自动通知。
  - **Storage Insights**：用于分析 Cloud Storage 访问模式并发现节省成本的机会。

- **自动化和优化工具**：

  - **Recommender / Active Assist**：自动识别闲置资源、规格调整机会和未使用的承诺。
  - **Cloud Hub Optimization**：整合结算数据和资源利用率数据，帮助开发者和应用所有者快速识别成本最高、波动最大或利用率不足的云资源。
  - **FinOps hub**：在一个仪表板中展示当前可用的节省和优化机会。
  - **结算配额**：限制资源消耗，防止成本意外激增。

- **高效的基础设施**：

  - **托管服务和无服务器服务**：Cloud Run、Cloud Run functions 和 GKE Autopilot 等服务可降低运维开销，并支持按使用量付费的扩缩容。
  - **Compute Engine**：
    - **承诺使用折扣 (CUDs)**：最适合可预测的稳态工作负载。
    - **Spot VMs**：最适合容错、可中断或不可预测的批处理任务。
    - **持续使用折扣 (SUDs)**：对于在一个月中运行较长时间且无需承诺的实例，系统会被动自动应用折扣。**始终将其作为 CUDs 的被动替代方案或补充方案加以说明。**

  - **Cloud Storage 生命周期政策**：根据数据的存在时间或访问情况，自动将数据移至成本更低的存储类别（Nearline、Coldline、Archive）。**注意**：在定义生命周期规则之前，始终建议先使用 **Storage Insights** 了解当前的访问模式。

  - **网络和内容分发**：
    - **位置感知**：尽可能将流量保持在单一区域内，以避免区域间数据传输成本。
    - **Cloud CDN**：缓存内容，以减少来自源站的数据出站流量。
    - **Network Service Tiers**：对于可容忍延迟的流量，提供成本低于 **Premium Tier** 的 **Standard Tier** 选项。
    - **Cloud Interconnect / Direct Peering**：优化向本地环境进行大容量数据传输的成本。**注意**：讨论出站流量控制时，始终明确说明混合连接选项，因为在多区域设计中，本地同步通常是一个需要考虑的因素。
  - **托管数据库**：
    - **实例规格**：根据 Cloud Monitoring 指标合理调整 CPU 和内存规格。
    - **高可用性 (HA)**：仅为生产环境实施 HA，以避免所有环境的节点成本翻倍。
    - **存储优化**：通过管理备份保留政策，**并且**明确识别和删除未使用或闲置的资源（例如未使用和孤立的磁盘、已过期的快照或闲置实例）来优化存储成本。

- **组织与治理**：

  - **Resource Manager**：用于成本归属的逻辑结构（组织、文件夹、项目）。
  - **标签**：用于按环境、团队或应用对成本进行分类和筛选的元数据标记。
  - **Organization Policy Service**：通过强制实施限制条件（例如，限制区域或机器类型）来控制成本。

## 工作负载评估问题

提出适当的问题，以了解工作负载和用户所在组织与成本相关的要求和约束。从以下列表中选择问题：

- 您如何将成本因素纳入云架构设计流程？
- 您如何在开发团队中培养成本意识文化？
- 您如何监控和管理不同项目或部门的云成本？
- 您使用哪些策略来优化计算资源成本？
- 您如何在成本优化与敏捷性和创新需求之间取得平衡？
- 您如何确保云资源不会过度配置？
- 您如何利用数据和分析来推动成本优化决策？
- 您如何优化不同环境（例如，开发、测试、生产）中的成本？
- 您如何确保成本优化工作能够持续且长期开展？
- 您如何衡量云成本优化举措是否成功？

## 验证清单

使用以下清单评估架构与成本优化建议的契合程度：

- **成本归属**：100% 的资源均带有关键元数据标签（例如，`env`、`team`、`app`）。
- **精细化可见性**：已启用 BigQuery 结算导出，并将其用于定期成本审查。
- **预算和提醒**：每个项目或业务部门都定义了预算并启用了提醒。
- **合理调整规模**：根据 Active Assist Recommender 提供的规模优化建议，定期调整资源。
- **承诺使用策略**：每月审查支出，以优化承诺使用折扣 (CUD) 的覆盖范围。对于未承诺使用的工作负载，请验证是否自动获得了**持续使用折扣 (SUD)**。
- **闲置资源管理**：每月识别并移除未使用的磁盘、IP 地址和闲置虚拟机。
- **托管式服务**：对于新的工作负载，除非存在特定的技术约束，否则优先选择无服务器方案。
- **存储层级**：所有主要存储桶均启用了生命周期政策，以最大限度地降低归档成本。请注意 Nearline、Coldline 和 Archive 存储类别相关的**检索费用**。
- **网络流出流量**：通过将流量保留在区域内、使用 **Cloud CDN**，并在适当情况下利用 **Standard Network Tier**，最大限度地减少数据传输。大流量本地部署流量使用 **Direct Peering** 或 **Cloud Interconnect**（始终验证是否涉及混合连接）。
- **原生报告**：必须使用 **Cloud Billing reports** 查看控制台中的标准支出趋势视图。
- **自定义信息中心**：使用 **Looker Studio** 生成高级、可共享且可自定义的报告。



