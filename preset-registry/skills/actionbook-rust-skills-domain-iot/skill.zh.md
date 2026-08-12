---
name: domain-iot
description: "Use when building IoT apps. Keywords: IoT, Internet of Things, sensor, MQTT, device, edge computing, telemetry, actuator, smart home, gateway, protocol, 物联网, 传感器, 边缘计算, 智能家居"
user-invocable: false
---
# IoT 领域

> **第 3 层：领域约束**

## 领域约束 → 设计影响

| 领域规则 | 设计约束 | Rust 影响 |
|-------------|-------------------|------------------|
| 网络不可靠 | 离线优先 | 本地缓冲 |
| 功耗约束 | 高效代码 | 休眠模式、最少分配 |
| 资源限制 | 小体积 | 必要时使用 no_std |
| 安全性 | 加密通信 | TLS、签名固件 |
| 可靠性 | 自恢复 | 看门狗、错误处理 |
| OTA 更新 | 安全升级 | 回滚能力 |

---

## 关键约束

### 网络不可靠性

```
RULE: Network can fail at any time
WHY: Wireless, remote locations
RUST: Local queue, retry with backoff
```

### 电源管理

```
RULE: Minimize power consumption
WHY: Battery life, energy costs
RUST: Sleep modes, efficient algorithms
```

### 设备安全

```
RULE: All communication encrypted
WHY: Physical access possible
RUST: TLS, signed messages
```

---

## 向下追溯 ↓

从约束到设计（第 2 层）：

```
"Need offline-first design"
    ↓ m12-lifecycle: Local buffer with persistence
    ↓ m13-domain-error: Retry with backoff

"Need power efficiency"
    ↓ domain-embedded: no_std patterns
    ↓ m10-performance: Minimal allocations

"Need reliable messaging"
    ↓ m07-concurrency: Async with timeout
    ↓ MQTT: QoS levels
```

---

## 环境对比

| 环境 | 技术栈 | Crate |
|-------------|-------|--------|
| Linux 网关 | tokio + std | rumqttc, reqwest |
| MCU 设备 | embassy + no_std | embedded-hal |
| 混合环境 | 拆分工作负载 | 两者皆用 |

## 关键 Crate

| 用途 | Crate |
|---------|-------|
| MQTT (std) | rumqttc, paho-mqtt |
| 嵌入式 | embedded-hal, embassy |
| 异步 (std) | tokio |
| 异步 (no_std) | embassy |
| 日志 (no_std) | defmt |
| 日志 (std) | tracing |

## 设计模式

| 模式 | 用途 | 实现 |
|---------|---------|----------------|
| 发布/订阅 | 设备通信 | MQTT 主题 |
| 边缘计算 | 本地处理 | 上传前过滤 |
| OTA 更新 | 固件升级 | 签名 + 回滚 |
| 电源管理 | 延长电池续航 | 休眠 + 唤醒事件 |
| 存储转发 | 网络可靠性 | 本地队列 |

## 代码模式：MQTT 客户端

```rust
use rumqttc::{AsyncClient, MqttOptions, QoS};

async fn run_mqtt() -> anyhow::Result<()> {
    let mut options = MqttOptions::new("device-1", "broker.example.com", 1883);
    options.set_keep_alive(Duration::from_secs(30));

    let (client, mut eventloop) = AsyncClient::new(options, 10);

    // Subscribe to commands
    client.subscribe("devices/device-1/commands", QoS::AtLeastOnce).await?;

    // Publish telemetry
    tokio::spawn(async move {
        loop {
            let data = read_sensor().await;
            client.publish("devices/device-1/telemetry", QoS::AtLeastOnce, false, data).await.ok();
            tokio::time::sleep(Duration::from_secs(60)).await;
        }
    });

    // Process events
    loop {
        match eventloop.poll().await {
            Ok(event) => handle_event(event).await,
            Err(e) => {
                tracing::error!("MQTT error: {}", e);
                tokio::time::sleep(Duration::from_secs(5)).await;
            }
        }
    }
}
```

---

## 常见错误

| 错误 | 领域违规 | 修复方式 |
|---------|-----------------|-----|
| 没有重试逻辑 | 数据丢失 | 指数退避 |
| 无线模块始终开启 | 电池耗电 | 在发送间隔期间休眠 |
| 未加密的 MQTT | 安全风险 | TLS |
| 没有本地缓冲区 | 网络中断 = 数据丢失 | 在本地持久化 |

---

## 追溯到第 1 层

| 约束 | 第 2 层模式 | 第 1 层实现 |
|------------|-----------------|------------------------|
| 离线优先 | 存储并转发 | 本地队列 + 刷新 |
| 能效 | 休眠模式 | 基于定时器唤醒 |
| 网络可靠性 | 重试 | tokio-retry, backoff |
| 安全性 | TLS | rustls, native-tls |

---

## 相关技能

| 适用场景 | 参见 |
|------|-----|
| 嵌入式模式 | domain-embedded |
| 异步模式 | m07-concurrency |
| 错误恢复 | m13-domain-error |
| 性能 | m10-performance |