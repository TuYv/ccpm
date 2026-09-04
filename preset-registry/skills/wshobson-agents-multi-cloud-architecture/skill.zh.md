---
name: multi-cloud-architecture
description: Design multi-cloud architectures using a decision framework to select and integrate services across AWS, Azure, GCP, and OCI. Use when building multi-cloud systems, avoiding vendor lock-in, or leveraging best-of-breed services from multiple providers.
---
# 多云架构

跨 AWS、Azure、GCP 和 OCI 构建应用架构的决策框架与模式。

## 用途

设计云无关架构，并就跨云服务商的服务选型做出明智决策。

## 何时使用

- 设计多云策略
- 在云服务商之间迁移
- 为特定工作负载选择云服务
- 实现云无关架构
- 跨服务商优化成本

## 云服务对比

### 计算服务

| AWS     | Azure               | GCP             | OCI                 | 使用场景           |
| ------- | ------------------- | --------------- | ------------------- | ------------------ |
| EC2     | Virtual Machines    | Compute Engine  | Compute             | IaaS 虚拟机        |
| ECS     | Container Instances | Cloud Run       | Container Instances | 容器               |
| EKS     | AKS                 | GKE             | OKE                 | Kubernetes         |
| Lambda  | Functions           | Cloud Functions | Functions           | 无服务器           |
| Fargate | Container Apps      | Cloud Run       | Container Instances | 托管容器           |

### 存储服务

| AWS     | Azure           | GCP             | OCI            | 使用场景         |
| ------- | --------------- | --------------- | -------------- | ---------------- |
| S3      | Blob Storage    | Cloud Storage   | Object Storage | 对象存储         |
| EBS     | Managed Disks   | Persistent Disk | Block Volumes  | 块存储           |
| EFS     | Azure Files     | Filestore       | File Storage   | 文件存储         |
| Glacier | Archive Storage | Archive Storage | Archive Storage | 冷存储           |

### 数据库服务

| AWS         | Azure            | GCP           | OCI                 | 使用场景          |
| ----------- | ---------------- | ------------- | ------------------- | ----------------- |
| RDS         | SQL Database     | Cloud SQL     | MySQL HeatWave      |
