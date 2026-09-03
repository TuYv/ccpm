---
name: cleanup-lead-owners
description: "Remove non-employee users from HubSpot and reassign their orphaned contacts, companies, and deals. Pairs with the assign-unowned-contacts skill for comprehensive ownership cleanup."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 清理线索所有者

将已离职员工从 HubSpot 中移除，并重新分配其名下的 CRM 记录。没有活跃所有者的孤儿记录容易被遗漏。

## 前提条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），需具备 `crm.objects.owners.read` 以及联系人/公司/交易的写入权限
- Python 3.10+ 以及 [`uv`](https://github.com/astral-sh/uv)
- 一份当前员工名单（用于与 HubSpot 用户比对）
- 一个默认所有者，或针对孤儿记录的轮询分配规则

## 分步操作说明

### 阶段 1：规划

开始前与用户确认以下事项：

1. 重新分配的记录由谁接收——单个默认所有者，还是按区域/轮询规则分配？
2. 哪些被标记的用户应被停用，哪些只需移除其名下的记录？

### 阶段 2：执行前

通过 Owners API 识别非员工所有者：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

active = requests.get(f"{BASE}/crm/v3/owners", headers=HEADERS,
                      params={"limit": 100, "archived": "false"}).json()["results"]
deactivated = requests.get(f"{BASE}/crm/v3/owners", headers=HEADERS,
                           params={"limit": 100, "archived": "true"}).json()["results"]
```

与当前员工名单进行交叉核对。标记以下情况：
- 仍拥有记录的已停用 HubSpot 用户
- 已不是员工但仍处于活跃状态的 HubSpot 用户
- 不应拥有记录的承包商或供应商

对于每个被标记的所有者，统计其名下的联系人、公司和交易数量。

### 阶段 3：执行

1. **重新分配**非员工拥有的记录：
   - 使用批量更新 API 将联系人重新分配给合适的活跃所有者
   - 如果没有明确的所有者，则应用轮询或基于区域的规则
   - 重新分配与相同联系人关联的公司和交易

2. **停用**不再是员工的用户（需要在 HubSpot Settings > Users & Teams 中具有 Super Admin 权限）。

3. 重新分配后**运行 `/assign-unowned-contacts`**，以捕获最终没有所有者的任何记录。

### 阶段 4：执行后

1. 搜索 `hubspot_owner_id` 与任何已停用所有者 ID 匹配的联系人——匹配数量应为零。
2. 确认所有已重新分配的联系人都有活跃所有者。
3. 检查是否有工作流因所有者变更而中断（某些工作流可能会按特定所有者筛选）。

## 回滚

- 可以通过批量更新将 `hubspot_owner_id` 改回原始值，从而撤销所有者的重新分配。
- 在进行更改之前，保留原始所有者分配的日志。
- 如有需要，可在 HubSpot 设置中重新激活已停用的用户。

## 提示

- 每当有员工离职时就运行此流程——不要等到季度清理时才进行。
- 建立一份包含 HubSpot 记录重新分配的离职清单。
- 与 `/assign-unowned-contacts` 配合使用，实现全面的所有权维护。
