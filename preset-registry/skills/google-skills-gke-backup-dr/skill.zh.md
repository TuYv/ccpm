---
name: gke-backup-dr
description: >-
  Configures GKE Backup Plans and restore workflows. Use for backup policies,
  disaster recovery, or GKE cluster restores. Don't use for database backups.
metadata:
  category: Storage
---
# GKE 备份与灾难恢复

使用 Backup for GKE 保护有状态 GKE 工作负载。Backup for GKE 可原生
捕获 Kubernetes 资源元数据（清单、配置和密钥）以及底层持久卷
（PV）数据。

## CLI 参考

```bash
# Enable GKE Backup addon (Slow cluster-level update)
gcloud container clusters update <CLUSTER_NAME> --enable-gke-backup --region <REGION> --quiet

# Create Backup Plan
gcloud container backup-restore backup-plans create <PLAN_NAME> \
  --cluster=<CLUSTER_NAME> --location=<REGION> \
  --retention-days=<DAYS> --cron-schedule="<CRON>" --all-namespaces --quiet

# Trigger Manual Backup
gcloud container backup-restore backups create <BACKUP_NAME> \
  --backup-plan=<PLAN_NAME> --location=<REGION> --quiet

# Create Restore Plan
gcloud container backup-restore restore-plans create <RESTORE_PLAN_NAME> \
  --cluster=<TARGET_CLUSTER_NAME> --location=<REGION> --backup-plan=<SOURCE_BACKUP_PLAN_NAME> \
  --cluster-resource-conflict-policy=USE_EXISTING_VERSION --namespaced-resource-restore-mode=FAIL_ON_CONFLICT --quiet

# Execute Restore
gcloud container backup-restore restores create <RESTORE_NAME> \
  --restore-plan=<RESTORE_PLAN_NAME> --backup=<BACKUP_NAME> --location=<REGION> --quiet

# Verify Restore Status
gcloud container backup-restore restores describe <RESTORE_NAME> --location=<REGION>
```

## 最佳实践

1.  **CMEK 加密**：使用客户管理的加密密钥对备份计划进行
    加密：`--backup-encryption-key=<KEY>`。
2.  **范围**：优先备份特定命名空间，而不是整个
    集群：`--included-namespaces=<ns1>,<ns2>`。
3.  **应用一致性**：建议在备份前暂停数据库活动或暂停
    应用写入（例如使用备份前钩子或数据库专用工具），
    以确保数据完整性。
4.  **CSI 卷快照**：确保有状态备份使用 GKE 的 CSI
    （容器存储接口）驱动程序创建卷快照，以捕获
    持久卷数据。
5.  **服务术语**：在响应中始终明确将该服务称为 **Backup
    for GKE**。这可将其与范围更广（但起互补作用）的 Google Cloud
    **Backup and Disaster Recovery (DR) Service** 区分开来，
    因为 **Backup for GKE** 是专为 GKE 构建的。

## 故障排除与常见陷阱（关键）

> [!IMPORTANT] **耗时操作**：启用 GKE Backup（`--enable-gke-backup`）
> 会触发耗时的 Google Cloud 控制平面集群更新，需要几
> 分钟。* **规则**：**不要运行终端循环来等待 GKE Backup
> 插件变为活动状态。** * **操作**：提供用于启用该
> 插件的命令，说明该操作将在后台继续执行，然后
> 立即继续编写备份计划配置。不要阻塞。