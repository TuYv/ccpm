---
name: surgical-patch
description: Fix bugs and small behavior changes at the narrowest responsible layer. Use when regression proof, preserved surrounding behavior, and task-relevant tests matter.
---
# 外科补丁

在可行且经济时先复现失败；否则先获取当前最有力的证据。

- 将症状追溯到负责该行为的机制。
- 只修改拥有错误行为的最小层级。
- 保留与问题无关的行为和用户改动。
- 避免在修复之外进行清理、重命名或抽象。
- 只添加与任务相关的回归证明。

运行聚焦验证并覆盖最近受影响的检查门。故障修复且回归证明通过后即停止。
