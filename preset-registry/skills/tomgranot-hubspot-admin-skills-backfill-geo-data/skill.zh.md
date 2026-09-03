---
name: backfill-geo-data
description: "Enrich missing geographic data (country, state, city) on contacts and companies using HubSpot workflows, external data providers, or IP-based geolocation."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 回填地理数据

补全联系人和公司上缺失的国家、州和城市值。地理数据可用于区域分配、区域报告以及合规（GDPR、各州隐私法）。

## 前提条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），需具有联系人和公司的读写权限范围
- Python 3.10+ 及 [`uv`](https://github.com/astral-sh/uv)
- 已具备标准化的地理值（先运行 `/standardize-geo-values`）

## 补充方法

### 方法 1：HubSpot 工作流补充（最简单）

使用 HubSpot 内置的 Operations Hub 数据质量工具或 Breeze Intelligence（如果你的套餐中可用）自动填充地理字段。

1. 创建一个由以下条件触发的工作流：国家未知且邮箱已知
2. 使用 "Enrich contact" 操作（Operations Hub Professional+）或 Breeze Intelligence 补充功能
3. 如果补充填写了国家/州，工作流即完成
4. 如果补充失败，则分支到标记以供人工审核

### 方法 2：公司域名查询（基于 API）

对于有公司关联但没有地理数据的联系人，查询该公司的地理信息：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# Find contacts missing country but with company association
resp = requests.post(f"{BASE}/crm/v3/objects/contacts/search", headers=HEADERS, json={
    "filterGroups": [{"filters": [
        {"propertyName": "country", "operator": "NOT_HAS_PROPERTY"},
        {"propertyName": "associatedcompanyid", "operator": "HAS_PROPERTY"},
    ]}],
    "properties": ["email", "associatedcompanyid"],
    "limit": 100,
})
resp.raise_for_status()
```

将关联公司的国家/州/城市复制到联系人（与 `/enrich-company-name` 的模式相同）。

### 方法 3：外部数据提供商

使用 `/waterfall-enrich-contacts` —— 它提供可插拔的提供商适配器（默认为 FullEnrich；内置 Apollo、Hunter、Dropcontact，也可自行接入）、单次运行成本上限、不覆盖安全机制以及 CSV 审计记录。请先用尽方法 1-2：外部查询按联系人消耗积分，内部数据则是免费的。

## 分步操作说明

### 阶段 1：规划

1. 根据数据量、套餐等级和预算选择补充方法（见上文）—— 与用户确认。
2. 确认不覆盖规则：补充只能填充空字段。

### 阶段 2：事前 —— 评估缺口

1. 统计缺失国家、州和城市的联系人数量。
2. 按来源细分 —— 哪些线索来源往往缺失地理数据？
3. 在进行任何更改之前，导出受影响记录的 CSV 基线。

### 阶段 3：执行 —— 运行补充

1. 应用所选方法（或组合多种方法以实现最大覆盖率）。
2. 以每批 100 条的方式处理，以遵守速率限制。
3. 根据 `/standardize-geo-values` 的标准化地理格式验证补充后的值。

### 阶段 4：事后 —— 验证

1. 重新统计缺失地理字段的联系人数量。计算改进百分比。
2. 抽查 20-30 个已补充的联系人以核实准确性。
3. 设置新联系人数据卫生工作流，以防止未来出现缺口。

## 回滚

- 如果补充数据不准确，筛选出由补充流程更新的联系人（使用 `hs_lastmodifieddate` 范围）并清空地理字段。
- 在运行补充之前，保留原始数据的备份导出。

## 提示

- 基于表单提交的 IP 地理定位信息已被 HubSpot 捕获在 `ip_city`、`ip_state`、`ip_country` 中。如果标准字段为空，可将这些值复制到标准字段。
- 不要用补充数据覆盖手动输入的地理数据 —— 写入前务必检查"是否为空"。
