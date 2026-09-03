---
name: cleanup-deals
description: "Standardize deal pipelines, remove test deals, and address deals with missing amounts or close dates. Coordinates with Salesforce sync if applicable."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 清理交易

规范化交易数据，使管道报表准确。测试交易、缺失金额的交易以及长期滞留的商机都会扭曲预测结果和管道指标。

## 前置条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），并具备 `crm.objects.deals.read` 和 `crm.objects.deals.write` 权限范围
- Python 3.10+ 以及 [`uv`](https://github.com/astral-sh/uv)
- 了解哪些交易管道正在使用，哪些是从 Salesforce 同步而来的

## 重要：Salesforce 同步注意事项

如果交易是从 Salesforce 同步的：
- 未经与 Salesforce 管理员协调，切勿删除或修改已同步的交易。
- 在 HubSpot 中所做的更改可能会同步回 Salesforce 并导致数据丢失。
- 通过检查 `hs_salesforceopportunityid` 属性来识别已同步的交易。

## 分步操作说明

### 阶段 1：规划

开始之前，与用户确认以下事项：

1. 哪些管道属于清理范围，哪些是从 Salesforce 同步的（未经协调不得触碰）？
2. 关闭被放弃交易的滞留判定截止时间（默认：90 天无活动）。

### 阶段 2：执行前

通过 CRM Search API 拉取交易指标：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def deal_count(prop, operator):
    resp = requests.post(f"{BASE}/crm/v3/objects/deals/search", headers=HEADERS, json={
        "filterGroups": [{"filters": [{"propertyName": prop, "operator": operator}]}],
        "limit": 1,
    })
    resp.raise_for_status()
    return resp.json()["total"]

no_amount = deal_count("amount", "NOT_HAS_PROPERTY")
no_close = deal_count("closedate", "NOT_HAS_PROPERTY")
```

记录：交易总数、每个管道阶段的交易数量、缺失金额的交易、缺失成交日期的交易、滞留交易（处于开启状态且 60 天以上无活动）。

### 阶段 3：执行

1. **删除测试交易** —— 搜索名称包含 "test"、"demo"、"sample" 的交易，或金额 = $0 且没有关联联系人的交易。
2. **处理缺失金额** —— 导出没有 `amount` 的交易，与销售团队协作填写金额或将其标记为失败。
3. **关闭滞留交易** —— 处于开启状态且 90 天以上无活动的交易应与交易负责人一同审查。如果已被放弃，则将其设置为 "Closed Lost"。
4. **规范化管道阶段** —— 确保所有管道的阶段名称和概率百分比保持一致。
5. **移除未使用的管道** —— 如果某个管道的活动交易数量为零且不再使用，则将其归档或删除。

### 阶段 4：执行后

1. 重新运行交易审计查询。确认：
   - 测试交易已被移除
   - 缺失金额的交易数量有所下降
   - 滞留交易数量有所下降
2. 检查管道报表是否准确。

## 回滚

- 已删除的交易可在 90 天内从 HubSpot 的回收站恢复。
- 阶段变更和属性更新可以手动撤销，但没有批量撤销功能。
- 对于从 Salesforce 同步的交易，还需检查 Salesforce 的回收站。

## 提示

- 建立交易卫生规则：60 天无活动的交易自动向负责人发送提醒（构建一个简单的工作流）。
- 将 `amount` 和 `closedate` 设为交易的必填属性，以防止未来出现数据缺失。
