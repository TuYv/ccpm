---
name: migration-ready-schema
description: Data-model rules that make a schema importable from day one, so the migration-import-engineer is never blocked on missing columns. Every SMB Product-Builder product must let a customer bring their data from an incumbent (ServiceTitan/Toast/Mindbody/Shopify) — that requires provenance (source_ref) and rollback (import_batch_id) on importable entities, and modelling real-world actors as entities rather than inline fields. Applied by architect when writing the data model in ARCH-{slug}.md, and checked by migration-import-engineer. One cheap rule set prevents the migration↔architecture seam gap from recurring across all 40 products.
when_to_use: |
  Apply when:
  - architect writes the Data contracts / data model section of ARCH-{slug}.md
  - migration-import-engineer verifies the destination schema can satisfy its
    idempotency + rollback invariants
  - any new entity is added that could be populated from an import or a third-party sync
  Do NOT apply to purely ephemeral / derived tables (caches, materialized views) that are
  never imported into.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/data-import/**"
---
# 可迁移的 Schema——从第一天起即可导入

每个 SMB 产品的切入点都是**较低的切换成本**——客户会从现有服务商处带入他们的数据。
如果 Schema 无法以幂等且可逆的方式接收这些数据，
`migration-import-engineer` 就会受阻，而所谓的切入点也只是一句口号。这些规则在
设计阶段实施成本很低，但事后几乎不可能干净地补上。**在设计任何导入功能之前，
先将这些规则应用到 ARCH 中的数据模型。**

## 三条规则（真正会阻碍导入的规则）

### 1. 可导入实体带有 `source_ref`（来源信息）
任何可通过现有服务商导出数据或第三方同步填充的实体，都需要有一个
可为 null 且**唯一**的 `source_ref` 列：

```
source_ref  text  UNIQUE NULL   -- e.g. "servicetitan:pricebook:8842"
```

- 它是幂等式重复导入的**去重键**（重复运行同一份导出数据永远不会产生重复项）。
- 使用 `{source}:{type}:{id}` 命名空间，避免两个现有服务商的数据发生冲突。
- 允许为 null，因为原生创建的行没有来源。

### 2. 可导入实体带有 `import_batch_id`（回滚）
```
import_batch_id  uuid  NULL  -- tags every row written by one import run
```
回滚 = 删除 `import_batch_id = ?` 的记录。没有它就无法撤销，而无法撤销的导入，
用户永远不会足够信任并实际运行。

### 3. 将现实世界中的参与方建模为实体，而不是内联字段
客户、联系人、供应商、成员或租户都是**拥有自己数据表的实体**，即使
v1 仅存储姓名和电话号码。原因是：导入会在依赖记录（报价、订单、预订）存在
**之前**填充这些实体——`Quote` 上的内联 `customer_name` 字段**无处存放**
导入的客户。内联参与方是最常见的迁移阻碍因素。

```
-- WRONG (blocks import):  Quote(... customer_contact text)
-- RIGHT:                   CustomerContact(id, ..., source_ref, import_batch_id)
                            Quote(... customer_contact_id → CustomerContact.id)
```

## 辅助规则（成本低廉，可防止无提示的数据丢失）

- **金额使用整数最小货币单位**（`*_cents`），绝不使用浮点数——现有服务商的导出数据包含精确
  金额；浮点数会破坏其精度。
- **时间戳携带来源时区**（存储 UTC + 偏移量，或使用时区感知类型）——导出数据使用
  本地时间；含义不明确的 `MM/DD` 和无时区日期时间会造成数据丢失。
- **用于集成记录管理的基础设施表必须存在于模型中**：`outbound_message`
  （幂等发送保护）、`processed_webhook_events`（事件去重）。
  集成工程师依赖这些表；应明确列出它们，以免其意外缺失。

## 检查清单（架构师在最终确定数据模型前执行）

```
For each entity in the data model:
- [ ] Can it be imported from an incumbent or third-party? If yes → has source_ref + import_batch_id
- [ ] Is it a real-world actor (customer/contact/vendor/member)? If yes → it is its own entity, not an inline field
- [ ] Money fields integer minor units? Timestamps tz-aware?
- [ ] Listed the infra tables (outbound_message, processed_webhook_events) the integrations layer needs?
```

通过这份检查清单的数据模型，会为 `migration-import-engineer` 提供一个可幂等且可逆地导入的目标——不存在受阻的衔接点。