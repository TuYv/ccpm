---
name: assign-unowned-contacts
description: "Assign an owner to marketing contacts that have no owner. Ensures every marketable contact has accountability for follow-up, proper lead routing, and accurate owner-based reporting."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: data-enrichment
---
# 为无归属的营销联系人分配所有者

为所有当前没有所有者的营销联系人分配一个所有者。无归属的联系人会在报告中造成缺口，妨碍正常的线索路由，也意味着没有人对营销活动所产生响应的跟进负责。

## 为什么这很重要

没有所有者的营销联系人是一个盲区。他们收到了营销活动，但没有人看到他们的响应；他们出现在汇总指标中，却不出现在个人管道视图里。在基于所有者的仪表板和报告中，他们根本不存在。对于使用轮转或基于区域路由的团队来说，无归属的联系人会完全绕过整个系统。

## 前提条件

- 已完成阶段 1 的数据清理以及阶段 3 较早的数据充实流程
- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），需具备联系人读写和所有者读取权限范围
- Python 3.10+，并安装了 [`uv`](https://github.com/astral-sh/uv)
- 拥有联系人访问权限，并且具有批量编辑所有者分配的权限
- **在批量分配之前获得团队负责人的批准。** 这是一个业务决策，而不仅仅是技术决策。在继续之前，先就分配策略获得批准。

## 脚本

| 阶段 | 脚本 | 运行命令 |
|-------|--------|----------|
| 执行前 | [`scripts/before.py`](./scripts/before.py) | `uv run skills/assign-unowned-contacts/scripts/before.py` |
| 执行 | [`scripts/execute.py`](./scripts/execute.py) | `uv run skills/assign-unowned-contacts/scripts/execute.py` |
| 执行后 | [`scripts/after.py`](./scripts/after.py) | `uv run skills/assign-unowned-contacts/scripts/after.py` |

`before.py` 会统计无归属营销联系人的数量，并列出可用的所有者。`execute.py` 会将它们批量分配给 `HUBSPOT_TARGET_OWNER_ID`（在 `.env` 中设置；安全阈值为 50,000——之所以设置得较高，是因为所有者分配完全可逆）。`after.py` 会验证数量已降为零。

## 访谈：收集需求

在执行之前，请向用户收集以下信息：

**Q1：无归属的联系人应分配给谁？**
- 示例：“全部分配给我们的 Integration User”、“在销售团队中分发”、“分配给 Marketing Team 用户”、“按区域分配给特定销售代表”
- 默认值：无默认值——这是一个需要团队负责人批准的业务决策

**Q2：我们应该使用基于区域的路由、轮转，还是单一兜底所有者？**
- 示例：基于区域（按地理位置或行业分配）、轮转（在活跃销售代表之间均匀分发）、兜底（将所有联系人分配给一个用户）
- 默认值：作为临时措施，兜底分配给单个集成/服务用户，并计划稍后实施正式的路由

## 计划

1. 识别所有没有所有者的营销联系人（执行前状态）
2. 确定分配策略（兜底用户 vs. 区域规则）
3. 执行批量分配
4. 验证所有营销联系人都已有所有者（执行后状态）

## 执行前

### 创建无归属营销联系人列表

1. 进入 **Contacts > Lists > Create list**
2. 选择 **Active list**
3. 名称：`CLEANUP: Unowned Marketing Contacts`
4. 添加筛选条件：
   - Marketing contact status > is any of > Marketing contact
   - AND Contact owner > is unknown
5. 保存列表并记录数量

### 脚本方式

运行 `uv run skills/assign-unowned-contacts/scripts/before.py`。核心查询如下：

```python
resp = requests.post(f"{BASE}/crm/v3/objects/contacts/search", headers=HEADERS, json={
    "filterGroups": [{"filters": [
        {"propertyName": "hs_marketable_status", "operator": "EQ", "value": "true"},
        {"propertyName": "hubspot_owner_id", "operator": "NOT_HAS_PROPERTY"},
    ]}],
    "limit": 1,
})
print(f"Unowned marketing contacts: {resp.json()['total']}")
```

## 执行

### 分配策略决策

选择以下方案之一（需经团队负责人批准）：

**方案 A：兜底用户（最简单）**
- 将所有无归属联系人分配给单个集成/服务用户
- 优点：快速，可立即确保 100% 的覆盖率
- 缺点：一个“所有者”会积累大量联系人；对路由而言没有实际意义
- 适用场景：计划稍后实施正式路由，当下只需要先确保覆盖

**方案 B：区域/地域规则**
- 根据联系人的地理位置、行业或公司规模进行分配
- 优点：所有权分配更有意义，更有利于销售跟进
- 缺点：需要明确的路由矩阵，执行起来更复杂
- 适用场景：已建立成熟的销售区域划分

**方案 C：轮转**
- 在活跃销售代表之间均匀分发
- 优点：分配公平，责任即时到人
- 缺点：可能会把联系人分配给不负责该细分领域的销售代表
- 适用场景：团队规模小，所有销售代表都处理所有细分领域

### 通过 UI 进行批量分配

1. 打开无归属营销联系人列表
2. 点击表格表头中的复选框，选中当前页面上的所有联系人
3. 点击 **Select all X contacts**，以跨所有页面全选
4. 点击工具栏中的 **Edit**
5. 在属性下拉菜单中选择 **Contact owner**
6. 搜索并选择指定的所有者
7. 点击 **Update**
8. 确认批量编辑
9. 对于较大量级（5,000+），HubSpot 会分批处理，可能需要几分钟时间。

### 通过 API 进行批量分配

对于兜底策略，这一过程完全由脚本完成：在 `.env` 中设置 `HUBSPOT_TARGET_OWNER_ID`（运行 `before.py` 可查看可用的所有者 ID），然后运行 `uv run skills/assign-unowned-contacts/scripts/execute.py`。

```python
# What execute.py does:
# 1. POST /crm/v3/objects/contacts/search — unowned marketing contacts (paginated)
# 2. Build batch payload: {"inputs": [{"id": ..., "properties": {"hubspot_owner_id": OWNER_ID}}]}
# 3. POST /crm/v3/objects/contacts/batch/update in batches of 100

# For territory-based routing (extend the script):
# 1. Search for unowned marketing contacts with country/state/industry properties
# 2. Map each contact to an owner via your territory matrix
# 3. Batch update with the appropriate owner per contact
```

**API 注意事项：**
- 通过 Owners API 获取所有者 ID：`GET /crm/v3/owners?limit=100`
- 要按邮箱查找特定所有者：遍历所有者并匹配 `email`
- 批量更新每次调用最多接受 100 条记录
- 速率限制：每 10 秒 100 个请求

## 执行后

等待 5-10 分钟，待 HubSpot 完成处理后再进行验证：`uv run skills/assign-unowned-contacts/scripts/after.py`（它会重新运行执行前状态查询并与基线比较；数量应为 0）。

**验证清单：**

1. 无归属营销联系人列表显示 0 个联系人
2. 重新运行执行前状态脚本——数量应为 0
3. 抽查 5-10 个此前无归属的联系人——确认它们显示已分配的所有者
4. 检查基于所有者的仪表板/报告，确认之前不可见的联系人现在已出现

## 回滚

- 所有者分配是完全可逆的：执行脚本的 CSV 审计日志记录了它分配的每一个联系人。要撤销，可对这些联系人 ID 批量更新为原来的所有者（“无所有者”则为空值）。
- 单条分配记录也可以在各联系人的属性历史中还原。

## 关键技术经验

- **这是一个业务决策，而不仅仅是技术决策。** 在执行之前，务必就分配策略获得销售/营销管理层的批准。将联系人批量分配给错误的人会造成混乱并损害信任。
- **兜底用户只是临时方案。** 如果将联系人分配给单个集成用户，应规划一个后续流程，在建立正式路由后将联系人重新分配给实际的销售代表。
- **与线索所有者清理配合进行。** 一旦建立了正式路由，重新审视兜底用户名下的联系人，并将他们重新分配给真正的所有者。
- **HubSpot 批量编辑的限制。** 对于非常大的批次（10,000+），UI 批量编辑可能会超时。请改用 API 方式，它能妥善处理分页和批处理。
- **新联系人同样需要路由。** 在这次一次性清理之后，应实施一个工作流或线索轮转规则，以便今后自动为新产生的营销联系人分配所有者。
