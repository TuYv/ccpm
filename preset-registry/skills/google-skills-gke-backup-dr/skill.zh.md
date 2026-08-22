---
name: gke-backup-dr
description: >-
  Configures Backup for GKE: the BackupRestore cluster addon, BackupPlan and
  RestorePlan resources, restore workflows, and CMEK-encrypted backups. Use
  for backup policies, disaster recovery, or GKE cluster restores. Don't use
  for database backups.
metadata:
  category: Storage
---
# GKE 备份与灾难恢复

使用 Backup for GKE 保护有状态 GKE 工作负载。Backup for GKE 可以捕获
Kubernetes 资源元数据（清单、配置和 Secret）以及
底层持久卷（PV）数据——但只有在备份方案明确启用它们时，才会捕获卷数据和 Secret
（请参阅下方标志）。

## CLI 参考

```bash
# Enable the BackupRestore addon (Slow cluster-level update)
gcloud container clusters update {cluster_name} \
  --update-addons=BackupRestore=ENABLED --location={location} --quiet

# Create Backup Plan
gcloud beta container backup-restore backup-plans create {plan_name} \
  --project={project_id} --location={location} \
  --cluster=projects/{project_id}/locations/{location}/clusters/{cluster_name} \
  --all-namespaces \
  --include-volume-data --include-secrets \
  --backup-retain-days={days} --cron-schedule="{cron}" --quiet

# Trigger Manual Backup
gcloud beta container backup-restore backups create {backup_name} \
  --backup-plan={plan_name} --location={location} --quiet

# Create Restore Plan
gcloud beta container backup-restore restore-plans create {restore_plan_name} \
  --location={location} \
  --cluster=projects/{project_id}/locations/{location}/clusters/{target_cluster_name} \
  --backup-plan=projects/{project_id}/locations/{location}/backupPlans/{source_backup_plan_name} \
  --all-namespaces \
  --cluster-resource-conflict-policy=use-existing-version \
  --namespaced-resource-restore-mode=fail-on-conflict --quiet

# Execute Restore
gcloud beta container backup-restore restores create {restore_name} \
  --restore-plan={restore_plan_name} --location={location} \
  --backup=projects/{project_id}/locations/{location}/backupPlans/{source_backup_plan_name}/backups/{backup_name} \
  --quiet

# Verify Restore Status
gcloud beta container backup-restore restores describe {restore_name} \
  --restore-plan={restore_plan_name} --location={location}
```

> [!WARNING] **`--include-volume-data` 和 `--include-secrets` 的默认值均为
> FALSE。** 如果省略它们，备份方案会在不发出提示的情况下生成**仅包含配置的
> 备份**，其中不包含持久卷快照和 Secret。当目标是完整保护工作负载时，务必显式传递这两个
> 标志。

注意：

-   `backup-restore` 命令组需要 `gcloud beta` 组件
    （`gcloud components install beta`）。
-   `--cluster` 需要完整的资源路径
    `projects/{project_id}/locations/{location}/clusters/{cluster_name}`（对于可用区级
    集群，则为 `projects/{project_id}/zones/{zone}/clusters/{cluster_name}`），
    而不能只提供集群名称。
-   恢复方案必须且只能指定一个命名空间资源范围标志：
    `--all-namespaces`、`--selected-namespaces={ns1},{ns2}`、
    `--excluded-namespaces=...`、`--selected-applications=...` 或
    `--no-namespaces`。

## 恢复安全性（关键）

恢复操作会写入**正在运行的集群**，并且根据冲突策略，
可能会覆盖或删除现有资源：

-   `--cluster-resource-conflict-policy=use-existing-version` 会保留现有的
    集群范围资源（安全默认值）；`use-backup-version` 会先**删除**
    现有版本——删除 CRD 会删除其所有 CR。
-   `--namespaced-resource-restore-mode=fail-on-conflict` 会在发生任何冲突时中止
    （安全默认值）；`merge-skip-on-conflict` 会跳过存在冲突的资源；
    `merge-replace-on-conflict` 和 `merge-replace-volume-on-conflict`
    会**覆盖**现有资源或卷；`delete-and-restore` 会在恢复前**删除
    整个存在冲突的命名空间**（以及其中的所有资源）。

**规则：**

1.  首先在非生产目标集群中验证恢复操作。
2.  除非用户明确需要还原实时资源，否则优先使用安全默认值
    （`use-existing-version` + `fail-on-conflict`）。
3.  **在执行恢复到生产集群的操作之前，始终获得用户的明确确认**，
    并说明当前生效的冲突策略及其可能覆盖或删除的内容。

## 最佳实践

1.  **CMEK 加密**：使用客户管理的加密密钥对备份计划进行加密：
    `--encryption-key=projects/{project_id}/locations/{location}/keyRings/{ring}/cryptoKeys/{key}`。
2.  **范围**：优先备份特定命名空间，而不是整个集群：
    `--selected-namespaces={ns1},{ns2}`（而不是
    `--all-namespaces`）。
3.  **应用一致性**：建议在备份之前使数据库进入静默状态或暂停
    应用写入（例如使用备份前钩子或数据库专用工具），
    以确保数据完整性。
4.  **CSI 卷快照**：确保有状态备份使用 GKE 的 CSI
    （容器存储接口）驱动程序创建卷快照，以捕获
    持久卷数据。
5.  **服务术语**：在回复中始终将该服务明确称为 **Backup
    for GKE**。这可将其与范围更广（但与之互补）的 Google Cloud **备份和灾难恢复 (DR)
    服务**区分开来，## 黄金路径备份默认配置

Backup for GKE 推荐的生产环境黄金路径配置：

-   **插件**：启用 BackupRestore 插件
    （`--update-addons=BackupRestore=ENABLED`）。
-   **包含卷**：显式传入 `--include-volume-data`（启用，
    因为服务默认值为 false）。
-   **包含 Secret**：显式传入 `--include-secrets`（启用，因为
    服务默认值为 false）。
-   **保留期**：定义保留期限（例如通过
    `--backup-retain-days=30` 设置为 30 天）。
-   **加密**：启用 CMEK（`--encryption-key=...`）。

## 近期变更

-   **跨项目备份与恢复（正式发布）**：备份计划可以将备份存储在
    与源集群不同的项目中，恢复计划也可以将第三个项目中的
    集群作为目标。这样既能实现集中式备份项目（由平台团队管理
    不可变性/保留策略），也能在不授予源项目访问权限的情况下
    跨项目初始化环境。
-   **定价变更（自 2026-03-02 起生效）**：备份管理费已从
    **基于 Pod** 的定价模式改为**基于命名空间**的定价模式——按每个计划最近一次
    成功备份中的非系统命名空间收费（不包括
    `kube-system` 等系统命名空间）。现有承诺使用折扣
    (CUD) 持有者在承诺期结束前仍采用基于 Pod 的管理定价；
    其他所有用户都将转为新模式。请参阅
    https://cloud.google.com/products/backup-for-gke/pricing-changes。
-   **智能调度**：以 RPO 为驱动的备份调度，可替代
    固定 cron 调度——创建备份计划时传入 `--target-rpo-minutes={minutes}`，而不是
    `--cron-schedule`（还可选择通过 `--exclusion-windows-file`
    配置 RPO 排除时间窗口）。
-   **Hyperdisk 支持**：运行 **1.33.1-gke.1959000 及更高版本**的 GKE
    集群支持备份和恢复 **Hyperdisk ML** 及
    **Hyperdisk Balanced High Availability** 卷（也支持 Hyperdisk throughput、
    extreme 和 balanced 类型）。

## 故障排除与常见陷阱（关键）

> [!IMPORTANT] **耗时操作**：启用 BackupRestore 插件
> (`--update-addons=BackupRestore=ENABLED`) 会触发耗时较长的 Google Cloud 控制
> 平面集群更新，此过程需要几分钟。* **规则**：**不要运行终端
> 循环来等待 GKE Backup 插件变为活动状态。** *
> **操作**：提供用于启用该插件的命令，说明该操作将在
> 后台继续进行，然后立即着手编写备份计划配置。不要阻塞等待。