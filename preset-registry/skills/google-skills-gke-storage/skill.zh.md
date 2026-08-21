---
name: gke-storage
description: >-
  Manages GKE storage, including PVCs, PersistentVolumes, Filestore, and GCS
  FUSE. Use when configuring GKE storage, creating PVCs, or setting up GCS FUSE
  on GKE. Don't use for database administration or replication strategies
  outside volume provisioning context.
metadata:
  category: Storage
---
# GKE 存储

本参考文档涵盖 GKE 集群的存储配置，包括持久磁盘、文件存储和云存储集成。

> **MCP 工具：** `apply_k8s_manifest`、`get_k8s_resource`、
> `describe_k8s_resource`、`get_cluster`

## 黄金路径存储默认配置

黄金路径 Autopilot 配置会启用以下 CSI 驱动程序：

| 驱动程序          | 黄金路径       | 访问模式     | 使用场景             |
| --------------- | ----------------- | --------------- | -------------------- |
| Compute Engine  | 已启用（默认） | ReadWriteOnce   | 用于数据库、         |
: Persistent Disk :                   :                 : 单 Pod 工作负载的    :
: CSI             :                   :                 : 块存储               :
| Google Cloud    | 已启用           | ReadWriteMany   | 用于多 Pod 访问的    |
: Filestore CSI   :                   :                 : 共享 NFS             :
| Cloud Storage   | 已启用           | ReadWriteMany / | 将 GCS 存储桶挂载为  |
: FUSE CSI        :                   : ReadOnlyMany    : 卷                   :
| Parallelstore   | 已启用           | ReadWriteMany   | 高性能并行文件系统   |
: CSI             :                   :                 :                      :
| 启动磁盘类型    | `pd-balanced`     | 不适用          | 节点启动磁盘         |

## StorageClass

### 默认 StorageClass

GKE 提供内置的 StorageClass：

StorageClass   | 磁盘类型              | 使用场景
-------------- | --------------------- | ------------------------------
`standard-rwo` | `pd-standard`         | 经济实惠、低 IOPS
`premium-rwo`  | `pd-ssd`              | 高 IOPS、数据库
`standard-rwx` | Filestore（Basic HDD） | 共享 NFS
`premium-rwx`  | Filestore（Basic SSD） | 共享 NFS、更高性能

### 自定义 StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-regional
provisioner: pd.csi.storage.gke.io
parameters:
  type: pd-ssd
  replication-type: regional-pd    # Replicate across 2 zones
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true         # Always enable for production
```

## PersistentVolumeClaim

### 块存储（ReadWriteOnce）

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-pvc
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: premium-rwo
  resources:
    requests:
      storage: 100Gi
```

### 共享文件存储（通过 Filestore 实现 ReadWriteMany）

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: shared-data
spec:
  accessModes:
  - ReadWriteMany
  storageClassName: standard-rwx
  resources:
    requests:
      storage: 1Ti    # Filestore minimum is 1 TiB for Basic tier
```

### GCS 存储桶挂载（Cloud Storage FUSE）

无需 PVC 即可将 GCS 存储桶挂载为卷：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gcs-reader
  annotations:
    gke-gcsfuse/volumes: "true"
spec:
  containers:
  - name: reader
    image: busybox
    command: ["ls", "/data"]
    volumeMounts:
    - name: gcs-bucket
      mountPath: /data
  volumes:
  - name: gcs-bucket
    csi:
      driver: gcsfuse.csi.storage.gke.io
      readOnly: true
      volumeAttributes:
        bucketName: <BUCKET_NAME>
```

> 要求 Pod 的服务账号使用 Workload Identity，并对该存储桶具有
> `storage.objectViewer` 权限。

## 卷扩容

如果 StorageClass 设置了 `allowVolumeExpansion: true`，可通过更新 PVC 来调整大小：

```bash
# kubectl
kubectl patch pvc <PVC_NAME> -p '{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}'
```

```
# MCP (preferred)
patch_k8s_resource(parent="...", resourceType="persistentvolumeclaim", name="<PVC_NAME>",
  patch='{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}')
```

Kubernetes 会自动调整文件系统的大小。

## 最佳实践

1.  **始终启用卷扩容**：在所有 StorageClass 上设置 `allowVolumeExpansion: true`
2.  **生产环境使用区域级 PD**：`replication-type: regional-pd`
    可跨 2 个可用区复制，以实现高可用性
3.  **使用 `WaitForFirstConsumer`**：确保 PV 与 Pod 在同一
    可用区中完成配置
4.  **选择正确的磁盘类型**：数据库使用 `pd-ssd`，常规用途使用 `pd-balanced`
    （黄金路径默认值），冷存储使用 `pd-standard`
5.  **使用 Filestore 实现共享访问**：当多个 Pod 需要读写
    相同文件时
6.  **数据流水线使用 GCS FUSE**：为机器学习训练
    数据、日志等直接挂载存储桶
7.  **备份 PVC**：使用 Backup for GKE（请参阅 `gke-backup-dr` skill）来
    保护持久化数据