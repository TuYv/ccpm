---
name: cleanup-lists
description: "Audit and remove unused, empty, or duplicate list definitions from HubSpot. Identifies lists with zero members, lists not used by any workflow or email, and overlapping list criteria."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 清理列表

审计 HubSpot 列表以清除杂乱内容。未使用的列表会拖慢 UI、困扰团队成员，并可能掩盖真正重要的列表。

## 前提条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），具备 `crm.lists.read` 权限（执行删除则需要 `crm.lists.write`）
- Python 3.10+ 及 [`uv`](https://github.com/astral-sh/uv)
- 注意：某些订阅层级可能无法访问 Lists API 并返回 403。如遇此情况，请在 UI 中手动执行审计。

## 分步说明

### 阶段 1：规划

在开始之前与用户确认：

1. 直接删除，还是先加上 "[ARCHIVE]" 前缀、下个季度再删除？
2. 是否存在绝不能触碰的列表（抑制列表、合规细分、活跃营销活动的受众）？

### 阶段 2：执行前

通过 Lists API（v3）对所有列表进行盘点：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

lists, offset = [], 0
while True:
    resp = requests.post(f"{BASE}/crm/v3/lists/search", headers=HEADERS,
                         json={"offset": offset, "count": 100})
    resp.raise_for_status()
    data = resp.json()
    lists.extend(data.get("lists", []))
    if not data.get("hasMore"):
        break
    offset = data.get("offset", offset + 100)
```

对每个列表记录：列表 ID、名称、处理类型（DYNAMIC/MANUAL）、成员数（`additionalProperties`）、创建日期、最后更新日期。

导出为 CSV 以供审查。

### 阶段 3：执行

标记符合以下任一条件的列表：

1. **成员数为零** 且创建时间超过 30 天
2. **未被** 任何工作流、电子邮件或广告受众引用
3. **名称重复** 或筛选条件几乎完全相同
4. **测试/临时列表**（名称包含 "test"、"temp"、"copy of"、"old"）
5. **静态列表** 超过 6 个月未更新

删除前先与工作流和电子邮件营销活动交叉核对——一个成员数为零的列表可能仍被用作注册触发器。

将候选列表呈现给用户并等待明确确认，然后通过 `DELETE /crm/v3/lists/{listId}` 或 UI 执行删除。

### 阶段 4：执行后

1. 重新运行盘点，确认已删除的列表确实不存在了。
2. 在清理日志中记录删除的内容（列表名称、ID、原因）。
3. 如果团队成员创建的列表被删除了，请通知他们。

## 回滚

- HubSpot 没有列表回收站。已删除的列表无法恢复。
- 删除前，请导出列表定义（筛选器/条件），以便在需要时重新创建。
- 静态列表：如果成员数据很重要，请在删除前导出成员 ID。

## 技巧

- 每季度执行一次，作为数据库清理例行工作的一部分。
- 从今以后建立命名规范（例如，以团队名称或用途作为前缀）。
- 如果不确定，请为列表添加 "[ARCHIVE]" 前缀进行归档，而不是直接删除。
