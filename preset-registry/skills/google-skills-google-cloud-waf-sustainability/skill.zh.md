---
name: google-cloud-waf-sustainability
metadata:
  category: WellArchitectedFramework
description: >-
  Generates sustainability-focused guidance for Google Cloud workloads based on
  the design principles and recommendations in the Google Cloud Well-Architected
  Framework (WAF). Use this skill to evaluate a workload, identify environmental
  impact requirements, and provide actionable recommendations to build, deploy,
  and manage the workload sustainably in Google Cloud.
---
# Google Cloud 架构完善框架的可持续性支柱技能

## 概览

Google Cloud 架构完善框架的可持续性支柱提供了一系列原则和建议，帮助您最大限度地减少云工作负载对环境的影响。它侧重于共同责任模型——Google 优化云本身的可持续性，而客户则优化云中工作负载的可持续性。通过在架构、资源分配和区域选择方面做出明智的决策，您可以显著减少碳足迹并提高整体能源效率。

## 核心原则

架构完善框架可持续性支柱中的建议与以下核心原则保持一致：

-   **共同责任**：明确责任边界并采用共同命运模型，与您的云服务提供商和合作伙伴协作，为整个生态系统实现最佳环境效益。
    依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability.md.txt

-   **使用低碳能源区域**：优先选择无碳能源（CFE）占比较高且带有“Low CO2”标识的 Google Cloud 区域，以降低部署产生的总碳排放量。
    依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/low-carbon-regions.md.txt

-   **优化 AI 和 ML 工作负载**：通过将算法需求与专用硬件（如 TPU）相匹配，并应用数学技术降低计算复杂度，最大限度地提高每瓦特的计算量。依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/ai-ml-energy-efficiency.md.txt

-   **优化资源使用**：通过在资源空闲时将其缩减至零、合理调整虚拟机规格，以及优先使用可动态匹配实际需求的托管式服务，消除能源浪费。依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/optimize-resource-usage.md.txt

-   **开发节能软件**：通过使用事件驱动逻辑和经过优化的资产来设计应用，从而最大限度地减少后端服务器和最终用户设备上不必要的 CPU、内存和网络活动。依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/energy-efficient-software.md.txt

-   **优化数据和存储**：通过实施生命周期管理来归档冷数据，并清除无法提供业务价值的“暗数据”，减少存储对环境的影响。依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/optimize-storage.md.txt

-   **持续衡量和改进**：通过分析细粒度数据、识别热点并主动采取措施修正低效问题，深入了解您的碳排放情况。依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/continuously-measure-improve.md.txt

-   **倡导可持续发展文化**：将可持续发展融入组织治理，将技术决策与环境
    目标相关联，并确保员工掌握实施绿色实践所需的技能。
    依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/culture.md.txt

-   **使可持续发展实践与行业指南保持一致**：确保你的可持续发展计划与
    衡量、报告和核查方面的行业指南保持一致，例如 W3C Web Sustainability
    Guidelines、Green Software Foundation 和 Greenhouse Gas Protocol。
    依据文档：
    https://docs.cloud.google.com/architecture/framework/sustainability/industry-guidelines.md.txt

## 相关 Google Cloud 产品

以下是与可持续发展相关的 Google Cloud 产品和功能的_示例_：

-   **可见性和衡量**：
    -   **Carbon Footprint**：通过信息中心直观呈现与 Google Cloud 使用量
        相关的温室气体排放。
    -   **BigQuery**：结合结算数据分析导出的 Carbon Footprint 数据，
        以识别排放热点。

-   **基础设施和运维**：
    -   **Google Cloud Region Picker**：在选择部署位置时，帮助权衡碳足迹、
        成本和延迟。
    -   **Active Assist / Recommender**：自动识别闲置资源，并提供虚拟机规模
        优化建议，以减少浪费。
    -   **Cloud Run / GKE Autopilot**：可优化集群使用率，并在闲置时缩容至零的
        全托管计算环境。
    -   **Cloud Batch**：优化批处理作业的调度，支持在无碳能源占比较高的
        时段执行作业。
    -   **Spot VMs**：将未使用的数据中心容量用于可容错工作负载，从而提高
        整体硬件效率。

-   **数据和 AI**：
    -   **Cloud Storage Lifecycle Management**：自动将较旧的数据转换到能耗
        较低的存储类别（Nearline、Coldline、Archive）。
    -   **Cloud TPUs**：针对大规模 AI/ML 矩阵乘法的能源效率进行优化的
        专用硬件。

## 工作负载评估问题

提出适当的问题，以了解工作负载和用户组织在可持续发展方面的要求与
限制。从以下列表中选择问题：

-   **云可持续发展**：
    -   你如何界定你的组织与云服务提供商之间的可持续发展责任边界？
    -   你如何利用云功能和 AI，为更广泛的业务运营推动实现可持续发展
        成果？
    -   你的云战略如何考虑合作伙伴生态系统和多云环境对可持续发展的
        影响？

-   **使用低碳能源供能的区域**：
    -   你如何将碳强度纳入 Google Cloud 区域选择策略？

-   **优化 AI 和 ML 工作负载**：
    -   如何优化 AI 和机器学习生命周期的能源效率？

-   **优化资源使用**：
    -   如何确保基础设施规模能够动态匹配实际工作负载需求？
    -   如何选择和维护云工作负载所使用的硬件类型？
    -   对于非紧急或计算密集型后台任务，你采用什么处理策略？
    -   如何在高可用性、灾难恢复与可持续性之间取得平衡？

-   **开发节能软件**：
    -   如何确保后端逻辑最大限度地减少不必要的 CPU、内存和网络活动？
    -   如何从可持续性角度管理代码库的整体效率和维护？
    -   如何最大限度地减少应用给最终用户设备带来的数据量和处理负载？
    -   用户体验（UX）设计如何帮助最终用户提高能源效率？

-   **优化数据和存储**：
    -   你采用什么流程来管理数据和存储对环境的影响？

-   **持续衡量和改进**：
    -   如何分析碳数据，以确定优化工作的优先级？
    -   如何将可持续性衡量纳入组织治理和文化？
    -   目前采用什么流程来了解与云相关的碳排放？
    -   采取哪些主动措施来修复已识别的碳排放热点？

-   **促进可持续发展文化**：
    -   如何将个体技术决策与组织使命联系起来，并要求团队对结果负责？
    -   如何确保技术和业务人员具备实施可持续性实践所需的特定技能？

## 验证清单

使用以下清单评估架构与可持续性建议的契合程度：

-   **云可持续性**：
    -   [ ] 组织采用可持续性共同责任和命运共同体模型。
    -   [ ] 将 AI 用作提高盈利能力和韧性的催化剂，以简化运营；或者将可持续性融入设计流程，以形成正向反馈循环。
    -   [ ] 优先与可持续合作伙伴协作并利用多云数据可移植性；或者使内部实践与 Green Software Foundation 等公认的全球标准保持一致。

-   **使用消耗低碳能源的区域**：
    -   [ ] 数据驱动型策略优先选择具有较高无碳能源比例（CFE%）和“Low CO2”标识的区域；或者主动使用 Google Cloud Region Picker，在碳足迹、成本和延迟之间取得平衡。

-   **优化 AI 和 ML 工作负载**：
    -   [ ] 根据算法需求匹配专用硬件（TPU），以最大限度地提高每瓦计算量；或者应用模型压缩和 PEFT 等数学技术来降低计算复杂度。

-   **优化资源使用**：
    -   [ ] 使用可在空闲时缩容至零的全托管式服务，或在 GKE 中使用 Horizontal Pod Autoscaling (HPA) 和 Vertical Pod Autoscaling (VPA) 以防止过度配置。
    -   [ ] 建立正式流程以升级到最新机型，从而提高单位功耗性能，或主动将工作负载与专用机器系列相匹配。
    -   [ ] 主动作业调度批处理任务，使其在 CFE 占比最高的时段或区域运行，或对非关键批处理任务使用 Spot VMs。
    -   [ ] 优先采用“冷 DR”或无服务器故障转移，以确保次要区域在事件发生前保持零能耗，或使用 Infrastructure as Code (IaC) 仅在需要时快速预配恢复环境。

-   **开发节能软件**：
    -   [ ] 使用事件驱动逻辑替代资源密集型忙循环或持续轮询，或优先采用具有最优时间复杂度的算法和数据结构。
    -   [ ] 通过定期重构遵循“Don't Repeat Yourself”(DRY) 原则，或通过智能淘汰策略实现智能缓存（例如 Memorystore）。
    -   [ ] 衡量网站产品的下载大小并将其维持在严格的预算范围内，或通过 CI/CD 流水线自动缩减和压缩 HTML、CSS 和 JS 文件。
    -   [ ] 优先采用静态网站或 Progressive Web Apps (PWAs) 以加快加载速度，或尽量减少 DOM 操作以降低设备功耗。

-   **优化数据和存储**：
    -   [ ] 使用 Object Lifecycle Management 自动将冷数据迁移到 Archive storage，或使用数据发现技术（例如 Dataplex）识别并清除“暗数据”。

-   **持续衡量和改进**：
    -   [ ] 按项目、区域和服务分析碳数据以识别主要排放源，或在 BigQuery 中将碳数据与 Billing 数据联接起来，以关联成本和环境影响。
    -   [ ] 由正式的 GreenOps 职能部门明确碳减排目标的责任归属，或使用来自 BigQuery 的已验证 Carbon Footprint 数据支持正式的 ESG 披露。
    -   [ ] 对应用进行插桩，以衡量软件功能的具体碳强度，或配置将 Carbon Footprint 数据自动导出到 BigQuery，以进行深入分析。
    -   [ ] 定期使用 unattended project recommender 和 Active Assist 来停用闲置资源，或通过主动项目重新设计热点，将工作负载迁移到低碳区域。

-   **推动可持续发展文化**：
    -   [ ] 在年度报告中将抽象的碳指标转化为切实的进展指标，或将可持续性视为与 KPIs 和绩效评估挂钩的一等技术要求 (NFR)。
    -   [ ] 提供针对特定岗位的培训（例如，面向开发者的代码效率培训、面向 FinOps 的碳单位经济效益培训），或对团队进行正式培训，使其能够访问和解读碳足迹数据。