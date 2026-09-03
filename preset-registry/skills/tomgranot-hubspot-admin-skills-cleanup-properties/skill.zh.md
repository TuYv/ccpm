---
name: cleanup-properties
description: "Archive or delete unused custom properties across all HubSpot object types (contacts, companies, deals). Identifies Salesforce sync properties, test/temp properties, and obsolete form fields."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 清理属性

移除或归档未使用的自定义属性。属性膨胀会拖慢表单速度、让用户感到困惑，并加大数据映射的难度。

## 前置条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），需具备 `crm.schemas.*.read` 和 `crm.schemas.*.write` 权限范围（scope）
- Python 3.10+ 及 [`uv`](https://github.com/astral-sh/uv)

## 分步操作说明

### 阶段 1：规划

开始前先与用户确认：

1. 采用「优先归档」策略（推荐），还是对明显废弃的测试属性直接删除？
2. 是否有 Salesforce（或其他 CRM）同步处于启用状态？如果有，在动手之前先获取同步属性的映射关系。

### 阶段 2：事前

通过 Properties API（v3）为每种对象类型盘点自定义属性：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

for obj_type in ["contacts", "companies", "deals"]:
    resp = requests.get(f"{BASE}/crm/v3/properties/{obj_type}", headers=HEADERS)
    resp.raise_for_status()
    custom_props = [p for p in resp.json()["results"] if not p.get("hubspotDefined")]
```

对于每个自定义属性，记录：名称（name）、标签（label）、对象类型（object type）、字段类型（type）、所属分组（group）、有值的记录数（需要通过搜索查询获取）、是否在任何表单/工作流/列表中使用。

### 阶段 3：执行

**可以安全删除：**
- 没有任何已填充记录且未在任何表单、工作流或列表中使用的属性
- 名称中包含 "test"、"temp"、"old_"、"copy_of" 的属性
- 由已停用的集成创建的属性

**需谨慎处理：**
- **Salesforce 同步属性**（`hs_salesforce_*` 前缀或在同步设置中映射的属性）——未与 Salesforce 管理员协调前不要删除
- **表单字段**——删除前检查该属性是否在任何活跃表单中使用
- **工作流依赖**——检查是否有任何工作流读取或设置此属性
- **计算属性**——检查是否有其他计算属性引用了此属性

**以下情况应归档而非删除：**
- 该属性包含报表可能需要的历史数据
- 你不确定是否有任何内容依赖于它

在向用户展示列表并获得明确确认后，通过 `DELETE /crm/v3/properties/{objectType}/{propertyName}` 归档候选属性（这是归档操作——属性会转入已归档状态）。

### 阶段 4：事后

1. 先归档属性（HubSpot 支持属性归档）。
2. 等待 30 天，然后删除未引发任何问题的已归档属性。
3. 将所有变更记录在清理日志中。

## 回滚

- 已归档的属性可以随时取消归档。
- 已删除的属性无法恢复。属性定义及所有关联数据将永久丢失。
- 务必先归档再删除，以提供一个安全窗口期。

## 提示

- 每季度执行一次本操作，作为数据库清理例程的一部分。
- 今后建立属性命名规范（例如 `team_purpose_detail`）。
- 限制可创建自定义属性的人员范围，以防止属性泛滥。
- HubSpot 对每种对象类型有属性数量上限——及时清理可避免达到上限。
