---
name: migration
description: Implement reversible compatibility-safe transitions. Use for schema, data, API, protocol, configuration, or dependency migrations requiring rollback and preservation proof.
---
# 迁移

在编辑前映射当前读者、写者、数据形状、兼容窗口和所有权。

- 定义向前路径和回滚路径。  
- 保留现有数据；将破坏性步骤明确列出并单独授权。  
- 在发布可重叠的情况下，保持混合版本操作的安全。  
- 在适用场景下按顺序执行扩展、迁移、验证，然后再收缩。  
- 让重试具备幂等性，并确保部分失败可被观察。  
- 在所需的过渡阶段验证旧路径和新路径。  

在请求阶段通过后停止；不要隐式执行后续的破坏性收缩。
