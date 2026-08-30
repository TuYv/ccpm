---
name: system-design-estimation
description: "Compute defensible capacity numbers before architecture: average and peak QPS, storage growth, bandwidth, working-set memory, latency and availability budgets. Use when sizing a service, provisioning infrastructure, or checking that a design survives peak load."
metadata:
  triggers:
    keywords:
      - back of envelope
      - qps
      - capacity estimate
      - storage estimate
      - throughput budget
      - peak load
      - latency budget
      - sizing
---
# 容量估算

## **优先级：P1（高）**

在架构设计之前进行估算。一个数量级的差异就会决定缓存、分片和队列的选择。

## 核心公式

- `average QPS = DAU x actions per user per day / 86,400`
- `peak QPS = average QPS x peak factor`（默认为 5x；对于限时抢购、票务开售或定时推送，则为 20-100x）
- `storage per year = writes per day x record size x 365 x replication factor`
- `bandwidth = QPS x payload size`（分别计算入口和出口）
- `working set = hot records x record size`，其中 hot 通常是数据的 20%，却承载 80% 的读取
- `connections = concurrent users x connections per user`；将其与连接池和文件描述符限制进行比较

## 方法

1. 将每个输入值四舍五入到一位有效数字。这里的精确度是假精确。
2. 依次计算平均值、峰值、存储、带宽，然后是内存。
3. 将每个结果与[估算数字](references/estimation-numbers.md)中的已知上限进行比较：单节点 QPS、磁盘 IOPS、NIC 吞吐量、每个实例的 RAM。
4. 指出**决定性数量**——第一个突破单节点上限的数字。它决定高层设计中首先需要添加的组件。
5. 将每个假设的输入值重新写在结果旁边，以便错误的假设能够显现，而不是被埋藏起来。

## 成本

- 在提出建议之前，将估算出的容量转换为每月支出：计算、存储加出口流量、托管服务溢价，以及任何冗余机制所带来的倍数。
- 成本是设计约束，而不是事后考虑。预算无法支撑的拓扑不是设计，而是一个之后会被否决的提案。
- 在有助于说明问题时，给出单位价值成本：每 1k 次请求、每保留 1 GB 数据、每增加一个可用性九位数的成本。

## 延迟预算

- 将 p95 预算构建为各跳转延迟之和；每次远程调用都会消耗同一个固定预算。
- 使用数量级锚点：内存 100ns、SSD 读取 100us、同数据中心往返 500us、跨区域往返 100ms+。
- N 次调用的同步扇出成本取决于最慢的调用，而不是平均值。使用 p99 而不是均值进行预算。

## 可用性计算

- 串行依赖会相乘：同一路径中的三个 99.9% 服务只能得到 99.7%。
- 只有在故障模式相互独立时，冗余副本才会增加九位数；共享存储或配置平面会抵消这一收益。
- 在承诺目标之前，先将目标转换为每月以分钟计的错误预算。

## 反模式

- **没有数字就开始设计**：在 QPS 和存储量明确之前，绝不要选择数据库或缓存。
- **只按平均值估算**：容量按峰值进行配置，成本按平均值进行建模。
- **不隐藏单位**：在每个数字旁标明单位和时间窗口（QPS、GB/day、GB/year）。
- **未经验证的精确度**：不要根据假设的 DAU 报告 4,873 QPS；应报告约 5k QPS。

## 验证

- [ ] 同时说明平均和峰值 QPS，并注明峰值系数
- [ ] 在包含副本的情况下，按照保留窗口预测存储量
- [ ] 确定决定性数量，并将其映射到设计后果
- [ ] 在结果旁标注每个假设的输入值

## 参考资料

- [估算数字](references/estimation-numbers.md) - 二的幂、延迟表、单节点上限、演算示例