---
name: mtls-configuration
description: Configure mutual TLS (mTLS) for zero-trust service-to-service communication. Use when implementing zero-trust networking, certificate management, or securing internal service communication.
---
# mTLS 配置

面向零信任服务网格通信的双向 TLS（mTLS）实施综合指南。

## 何时使用本技能

- 实现零信任网络
- 保护服务间通信安全
- 证书轮换与管理
- 调试 TLS 握手问题
- 合规性要求（PCI-DSS、HIPAA）
- 多集群安全通信

## 核心概念

### 1. mTLS 流程

```
┌─────────┐                              ┌─────────┐
│ Service │                              │ Service │
│    A    │                              │    B    │
└────┬────┘                              └────┬────┘
     │                                        │
┌────┴────┐      TLS Handshake          ┌────┴────┐
│  Proxy  │◄───────────────────────────►│  Proxy  │
│(Sidecar)│  1. ClientHello             │(Sidecar)│
│         │  2. ServerHello + Cert      │         │
│         │  3. Client Cert             │         │
│         │  4. Verify Both Certs       │         │
│         │  5. Encrypted Channel       │         │
└─────────┘                              └─────────┘
```

### 2. 证书层级

```
Root CA (Self-signed, long-lived)
    │
    ├── Intermediate CA (Cluster-level)
    │       │
    │       ├── Workload Cert (Service A)
    │       └── Workload Cert (Service B)
    │
    └── Intermediate CA (Multi-cluster)
            │
            └── Cross-cluster certs
```

## 模板与详细示例

完整的模板库和详细示例位于 `references/details.md` 中。当你需要具体模板时，请阅读该文件。

## 最佳实践

### 应当做的

- **从 PERMISSIVE 模式开始** - 逐步迁移到 STRICT
- **监控证书过期时间** - 设置告警
- **使用短生命周期证书** - 工作负载证书不超过 24 小时
- **定期轮换 CA** - 提前规划 CA 轮换
- **记录 TLS 错误日志** - 用于调试和审计

### 不应做的

- **不要禁用 mTLS** - 不要在生产环境中为了方便而禁用
- **不要忽视证书过期** - 实现轮换自动化
- **不要使用自签名证书** - 使用规范的 CA 层级
- **不要跳过验证** - 验证完整证书链
