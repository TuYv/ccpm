---
name: gke-upgrades
metadata:
  category: Containers
description: >-
  Plans, executes, and validates Google Kubernetes Engine (GKE) cluster upgrades
  and maintenance operations for both Standard and Autopilot clusters. Produces
  upgrade plans, pre/post-upgrade checklists, maintenance runbooks with gcloud
  commands, release channel strategy, and troubleshooting guides. Handles node
  pool upgrade strategies (surge, blue-green), version compatibility, PDB
  management, and workload-specific concerns (stateful, GPU, operators). Use this
  skill whenever the user mentions GKE upgrades, Kubernetes version bumps, node
  pool maintenance, GKE patching, cluster version management, release channel
  selection, maintenance windows, surge upgrades, stuck upgrades, or any GKE
  lifecycle management task — even casual mentions like "we need to upgrade our
  clusters" or "plan our next GKE maintenance" or "our upgrade is stuck." Don't
  use for GKE cluster creation, application onboarding, general networking/routing
  setup, or security policy configurations (use gke-basics or relevant GKE skills
  instead).
---
# GKE 升级与维护

生成清晰、可执行的文档——升级计划、运行手册或检查清单——并根据用户的环境量身定制。输出内容应针对其集群模式、发布渠道、版本和工作负载类型，而不是提供通用建议。

始终围绕自动升级模型来组织指导：首选的控制机制是结合维护窗口和维护排除项使用自动升级。

## 上下文收集

在生成任何升级相关内容之前，先确定：

- **集群模式**——Standard 还是 Autopilot？（Autopilot 不提供节点池管理、强制要求设置资源请求，并且不支持 SSH）
- **当前版本和目标版本**——节点与控制平面的版本偏差必须在 2 个次要版本以内。
- **发布渠道**——Rapid、Regular、Stable 还是 Extended。
- **环境拓扑与发布顺序**——单集群还是多集群、dev/staging/prod 环境层级，以及是否使用发布顺序功能。
- **工作负载敏感性**——StatefulSets、数据库、GPU 和长时间运行的批处理作业需要特殊处理。

如果用户已预先提供这些信息，请直接生成交付内容。如果描述含糊，请采用合理的默认值，并明确标注相关假设。

## 核心原则

GKE 版本遵循 Kubernetes 版本术语：**Major.Minor.Patch**（例如 1.30.1-gke.1187000）。**次要**版本升级（例如 1.29 → 1.30）会引入新功能和 API。**补丁**版本升级（例如 1.30.1 → 1.30.2）会引入安全修复和错误修复。确保用户理解这一区别。

1. **控制平面逐级升级，节点池可跨级升级**——控制平面升级必须逐级进行（N → N+1 → N+2）。节点池支持跨级升级到 N+2。
2. **先升级控制平面**——必须先升级控制平面，再升级节点池。节点最多可以落后控制平面 2 个次要版本。
3. **环境逐级推进**——始终先升级 dev/staging，再升级生产环境。使用**发布顺序功能**（首选）在不同环境之间自动执行并强制遵循这一推进顺序（例如 dev → staging → prod）；如果未使用发布顺序功能，则手动协调版本推进。
4. **感知工作负载**——升级策略取决于正在运行的工作负载类型（无状态、有状态、GPU、批处理）。
5. **优先使用发布渠道**——始终建议使用发布渠道。请注意，“无渠道”（静态版本控制）已被弃用，应将集群迁移到发布渠道。
6. **回滚/降级**——控制平面补丁版本和节点池（次要版本及补丁版本）可以回滚（降级到目标版本）。GKE 支持分两步进行控制平面次要版本升级，其中第 1 步可以回滚。其他控制平面次要版本回滚无法由客户自行完成，需要 GKE Support。
7. **节点池升级顺序**——升级多个节点池时，始终建议按顺序进行：先升级非关键/无状态节点池（将其作为金丝雀），验证集群健康状况后，再升级关键的有状态节点池（数据库）或 GPU 节点池。

## 发布渠道

| 渠道 | 最适合 | SLA |
|---------|----------|-----|
| **Rapid** | 开发/测试、尽早使用新功能 | 无升级稳定性 SLA |
| **Regular**（默认） | 大多数生产环境 | 完整 SLA |
| **Stable** | 任务关键型、稳定性优先 | 完整 SLA |
| **Extended** | 合规性、控制 EoS 强制执行 | 完整 SLA |

### 支持生命周期
标准 GKE 版本自进入 **Regular** 渠道起可获得 14 个月的支持。这意味着：

- **Rapid** 渠道版本的支持时间可能超过 14 个月（因为它们先进入 Rapid，之后才进入 Regular）。
- **Stable** 渠道版本的支持时间可能少于 14 个月（因为它们在进入 Regular 之后才进入 Stable）。
- **Extended** 支持可将此期限延长至最长 24 个月。请注意，仅在扩展支持期内（第 15 至 24 个月）收取额外费用。

### 当前功能

- **Extended 渠道的周期计算**：14 个月的标准支持 + 约 10 个月的扩展支持 ≈ 每个次要版本总计 24 个月。即使使用 Extended，仍会发生强制升级：如果不采取任何操作，GKE 会在支持终止时自动升级集群——平均约每 4 个月提升一个次要版本，与其他渠道的节奏相同（只是功能会更晚提供）。
- **升级可靠性（KubeCon NA 2025）**：Google 报告称，GKE 控制平面和节点的升级成功率达到 99.99%；安全回滚和跨版本升级支持旨在让团队降低升级频率（例如从每季度一次改为每年一次）。请先在非生产集群中试点跨版本升级。
- **自动扩缩的蓝绿节点升级**（预览版）：一种蓝绿升级变体，可按需扩容绿色池，而不是预先配置完整的重复池——适用于无法预留 2 倍容量、且对中断敏感的工作负载。
- **计划集群升级通知**（预览版）：可选择提前接收计划次要版本升级的通知，并将这些通知接入告警系统。
- **节点排空期间的优雅终止和 PDB**：蓝绿升级（包括自动扩缩的蓝绿升级，预览版）是*唯一*最多可遵循 `terminationGracePeriodSeconds` 24 小时的策略；激增升级最多遵循 60 分钟。在节点排空期间，GKE 最多遵循 PDB 60 分钟，之后会强制删除 Pod（并发送通知）。

## 维护时段和排除项

配置维护时段以控制自动升级的时间。除集群级维护排除项外，GKE 还支持节点池级维护排除项，以阻止特定工作负载的升级。

**排除项类型和限制：**

- **“不进行任何升级”（范围：`no_upgrades`）**：阻止所有升级（次要版本、补丁和节点升级）。
  - **限制**：每个排除项最长 **90 天**，且一个集群最多只能有 **3** 个此类排除项。这些排除项合计后，仍必须确保在任意滚动的 92 天时段内至少有 **48 小时可用于维护**——因此，不能将它们串联为超过 90 天的连续冻结期。GKE 建议将此类排除项控制在 30 天以内。
- **“不进行次要版本或节点升级”（范围：`no_minor_or_node_upgrades`）**：阻止次要版本和节点升级，但允许控制平面补丁升级（风险较低）。
  - **限制**：没有固定的天数上限——受次要版本的**支持终止时间（EoS）**约束。建议：控制在约 6 个月以内。
- **“不进行次要版本升级”（范围：`no_minor_upgrades`）**：阻止次要版本升级，但允许控制平面补丁和节点升级。
  - **限制**：没有固定的天数上限——受 EoS 约束。建议：控制在约 6 个月以内。

**重要的排除规则（在建议排除项时必须遵循，并且必须包含在最终文本回复中）：**

1. **仅限自动升级**：维护排除项**只会阻止自动升级**。用户手动发起的升级会绕过排除项。你必须向用户说明这一点。
2. **警告不要使用“No channel”**：你必须明确警告，禁用发布渠道（“No channel”/静态版本控制）的方式已被弃用，不得将其用作排除项的替代方案。
3. **比较作用域**：你必须解释“No upgrades”（存在限制，会阻止补丁升级）与“No minor or node upgrades”（允许补丁升级，持续时间更长）之间的区别。当用户希望允许安全补丁/修复，同时阻止次要版本跃迁时，应推荐“No minor or node upgrades”。
4. **处理超过 90 天的期限**：如果用户需要阻止升级超过 90 天，你必须说明“No upgrades”对每个排除项有 90 天的限制（每个集群最多 3 个，并且在任意滚动的 92 天窗口内必须保留 48 小时的维护可用时间，因此无法通过串联排除项实现更长时间的连续冻结），并建议使用有作用域的排除项（“No minor or node upgrades”/“No minor upgrades”）。这些排除项没有固定天数上限，可以一直持续到次要版本的支持终止日期。
5. **版本偏差**：使用排除项时，应注意控制平面与节点池之间的版本偏差。确保偏差不超过支持的 2 个次要版本。使用 `--add-maintenance-exclusion-until-end-of-support` 设置持久排除项。
6. **正确的 gcloud 语法**：提供用于排除项的 `gcloud` 命令时，必须使用独立的标志语法：`--add-maintenance-exclusion-name`、`--add-maintenance-exclusion-start`、`--add-maintenance-exclusion-end`（或 `--add-maintenance-exclusion-until-end-of-support`）以及 `--add-maintenance-exclusion-scope`（不要使用单个逗号分隔的 `--add-maintenance-exclusion` 标志）。

## 强制升级覆盖

GKE 保留在强制操作中覆盖用户定义的维护窗口和排除项的权利。这些覆盖无法禁用或阻止。

**常见覆盖场景：**

- **关键安全补丁**：必须立即应用的紧急漏洞修复，以保护基础设施。
- **支持终止（EoS）/生命周期终止（EOL）强制执行**：如果集群正在运行不受支持的版本，GKE 将强制把它升级到受支持的版本。
- **即将过期的证书**：如果控制平面证书（CA）即将过期（30 天内），并且必须执行轮换以防止集群变得不可恢复。
- **维护不足**：GKE 要求在任意滚动的 92 天窗口内至少有 48 小时的维护可用时间。如果排除项阻止了过多维护，GKE 可能会强制执行升级。

**指导原则（讨论覆盖时必须遵循）：**

1. **与公告进行关联**：如果 GKE 执行了意外升级，你必须明确建议检查 GKE 版本说明或安全公告，以确认该事件是否与紧急补丁有关（不要只建议检查 Cloud Audit Logs）。
2. **面向韧性进行设计**：工作负载必须设计为能够承受意外的控制平面或节点轮换。你必须建议：
   - 使用区域级集群（多主节点），以确保控制平面升级期间 API 的可用性。
   - 跨多个可用区部署工作负载。
   - 为关键部署设置大于 1 的副本数。
   - 正确配置 Pod Disruption Budgets（PDB），且不要设置得过于严格。

## 升级规划

当被要求规划升级时，请生成一份结构化文档，涵盖：

- 版本兼容性（破坏性变更、已弃用的 API）（仅适用于次要版本升级）
- 升级路径（按顺序逐个升级次要版本）（仅适用于次要版本升级）
- 节点池升级策略（仅限 Standard）
- 工作负载就绪情况（PDB、资源请求）
- 回滚/应急流程（如何回退节点池，或如何与 GKE 支持团队协调主节点回滚）

**兼容性搜索规则：**

- 如果无法立即从工作区或通过快速 Web 搜索获得兼容性信息（例如第三方 Operator 兼容性、GPU 驱动程序/CUDA 兼容性矩阵），**请勿循环搜索或多次尝试搜索**。相反，应在检查清单中将兼容性验证列为用户必须完成的**关键升级前行动项**。

### 节点池策略（仅限 Standard）

建议将 **Surge 升级**作为默认且最常用的策略，并针对不同节点池采用以下设置：

- **无状态**：使用较高的 `maxSurge`（2-3）以提高速度，使用 `maxUnavailable=0` 以确保安全。
- **有状态/数据库**：`maxSurge=1, maxUnavailable=0`（保守）。
- **GPU（固定预留）**：`maxSurge=0, maxUnavailable=1`（无额外容量）。
- **大型（50 个以上节点）**：`maxSurge=20, maxUnavailable=0`（最大并行度）。

对于需要快速回滚或严格验证的关键任务工作负载，建议采用 **Standard 蓝绿升级**。可将 **Autoscaled 蓝绿升级**作为对中断敏感的工作负载的一种选择，但需指出该功能目前处于预览阶段，并且可能存在容量要求。

**升级顺序（仅限用户发起的升级）：**规划手动升级时，请明确节点池的升级顺序。建议先升级无状态节点池，验证集群稳定性，然后再升级有状态/GPU 节点池。对于自动升级，GKE 会自动按顺序管理节点池升级。

有关标准命令序列和运行手册模板，请参阅 [`references/runbook-template.md`](references/runbook-template.md)。

### 大规模 AI/ML 集群（GPU/TPU）

针对 GPU/TPU 升级提供建议时，必须涵盖以下所有内容：

- **不支持实时迁移**：GPU VM 不支持实时迁移；GKE 升级将强制重启 Pod。请向用户说明这一点。
- **固定预留和配额**：H100/A100 通常使用固定预留，且没有备用配额。建议采用**零 Surge 的滚动升级**（`maxSurge=0, maxUnavailable=1`），即先释放正在升级的节点所占用的预留资源，再预配其替代节点。说明在这种情况下**蓝绿升级不可行**，因为在转换期间，蓝绿升级需要双倍（2x）的 GPU 资源（包括配额和预留）。
- **驱动程序耦合**：GPU 驱动程序与节点操作系统镜像紧密耦合，因此节点升级会引入新的 Linux 内核和 NVIDIA 驱动程序，从而可能破坏 CUDA 兼容性。建议先在预演环境/集群中升级并测试 CUDA 兼容性，并更新工作负载依赖项（容器镜像中的 CUDA 版本），使其与新驱动程序匹配，然后再尝试升级。若要诊断驱动程序回归问题，请对比旧节点（正常工作）和新节点（无法正常工作）的操作系统镜像、内核版本（`uname -r`）和驱动程序版本，并部署测试 Pod（例如向量加法）来验证 GPU 访问。如果生产环境受阻，将节点池回滚到之前的版本是最快的缓解措施。
- **运维安全**：建议使用 GKE **维护排除项**，以阻止在训练活动进行期间自动升级。在手动升级之前，封锁 GPU 节点，并等待正在运行的训练作业完成检查点保存或执行完毕。
- **TPU 注意事项**：TPU 切片会以原子方式重新创建（而非滚动更新）；对一个切片进行维护会重启该环境中的所有切片。

## 检查清单

以可复制且带复选框的 Markdown 格式生成检查清单。完整的升级前和升级后检查清单模板，请参阅 [`references/checklists.md`](references/checklists.md)。根据用户的环境调整这些模板。

**有状态工作负载：** 当存在有状态工作负载（数据库）时，升级前检查清单中必须始终包含 PV 备份完成情况检查，以及 PV 回收策略（例如 Retain 与 Delete）验证。

**Autopilot 检查清单：** 对于 Autopilot 集群，确保检查清单包含：

- 验证所有容器上的 `resources.requests`（Autopilot 要求）。
- 必须包含用于检查 API 弃用情况的具体 `kubectl` 命令，特别是：使用 `kubectl get --raw /metrics | grep apiserver_request_total | grep deprecated` 检查是否有任何活动工作负载正在使用已弃用的 API。
- 验证 PDB，确保其不会阻止节点排空（尽管节点由 GKE 管理，但 PDB 仍然会被遵循）。
- 识别并删除“裸 Pod”（不受 ReplicaSet/Deployment/StatefulSet 管理的 Pod），因为在节点重新创建期间，它们不会被重新调度。
- 验证 `terminationGracePeriodSeconds`，确保在节点重新创建期间，Pod 有足够的时间优雅关闭。

## 维护操作手册

生成包含实际 `gcloud` 和 `kubectl` 命令的分步操作手册。有关标准命令序列，请参阅 `references/runbook-template.md`。

**任何放宽安全控制的操作手册都必须在同一份操作手册中恢复该控制。** 这首先适用于节点池迁移或回滚期间的 PDB：在排空前备份 PDB，并将重新应用 PDB 作为独立的编号步骤，同时包含相应验证，而不是仅在结尾附带说明。如果一份操作手册通过将 `maxUnavailable: 100%` 修补为该值来解除排空阻塞，却从不恢复原设置，那么集群将失去中断保护，而且在下一次自愿驱逐发生之前，这一缺口都不会显现。同一规则也适用于为完成该流程而添加的维护排除项、节点封锁以及自动扩缩器 `minNodes` 覆盖。

## 维护窗口暂停

诊断“卡住”的升级时，应考虑升级是否因维护窗口而暂停：

- **静默暂停行为：** 如果维护窗口在升级（自动或手动）完成之前关闭，GKE 会有意暂停发布，以防止在允许的时间范围之外造成中断。
- **混合版本状态：** 集群会保持在稳定的混合版本状态（部分节点已升级，部分节点尚未升级）。必须明确说明，这是受支持且安全的预期结果。
- **恢复：** 当下一个维护窗口打开时，升级将自动恢复。
- **立即完成的缓解措施：** 如果用户希望立即完成升级，必须建议**临时扩大维护窗口**，使其覆盖当前时间（例如，使用 `gcloud container clusters update ... --maintenance-window-start ... --maintenance-window-duration ...`）。不要建议重新触发手动升级或绕过维护窗口。

## 故障排除

当用户报告升级卡住或失败时，你必须在最终回复中系统地分析并处理以下全部 5 种潜在原因。即使你怀疑其中某一项是主要原因，也不要省略其他检查：

1. **PDB 阻止节点排空：**使用 `kubectl get pdb -A` 确定是否有任何 PDB 的 `ALLOWED DISRUPTIONS = 0`。
2. **资源限制：**检查 Pod 是否因容量限制而卡在 `Pending` 状态。
3. **裸 Pod：**识别没有所有者引用且阻止节点排空的 Pod（建议将其删除）。
4. **准入 Webhook：**检查 Validating/Mutating Webhook 是否拒绝在新节点上创建 Pod。
5. **PVC 挂载问题：**检查卷挂载失败问题（尤其是可用区限制）。

**资源售罄/配额耗尽规则：**

- 如果升级因 Compute Engine 资源的 `ZONE_RESOURCE_POOL_EXHAUSTED`（资源售罄）或 `QUOTA_EXCEEDED` 而卡住：
  1. 建议将升级策略修改为 `maxSurge=0`（原地滚动升级），以绕过配额限制。
  2. 对于 `QUOTA_EXCEEDED`，建议向 Google Cloud 申请提高配额。
  3. 你必须建议**将工作负载迁移到容量/配额可用的其他可用区或区域，或者在其中创建新的节点池**，以此作为缓解措施。

有关每个步骤的准确诊断命令和修复流程，请参阅 [`references/troubleshooting.md`](references/troubleshooting.md)。

## 参考资料

- [GKE 版本说明](https://cloud.google.com/kubernetes-engine/docs/release-notes)
- [升级 GKE 集群](https://cloud.google.com/kubernetes-engine/docs/how-to/upgrading-a-cluster)
- [维护时段和排除项](https://cloud.google.com/kubernetes-engine/docs/concepts/maintenance-windows-and-exclusions)
- [发布顺序概念](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/rollout-sequencing/about-rollout-sequencing)
- [配置发布顺序](https://cloud.google.com/kubernetes-engine/docs/how-to/rollout-sequencing)