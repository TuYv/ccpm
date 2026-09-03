---
name: review-bounced-contacts
description: "Weekly manual review of contacts with 3+ bounce events. Decide whether to delete or attempt recovery for each flagged contact. Prevents over-suppression while removing truly bad data."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 退信联系人复核

针对被标记为 3 次以上退信的联系人进行每周人工复核的流程。退信监控工作流会自动抑制这些联系人，但是否永久删除还是尝试恢复，应由人来决定。

## 前提条件

- 退信监控工作流已激活（先运行 `/bounce-monitoring-workflow`）
- 联系人上已存在 `email_health_flag` 自定义属性
- 拥有 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），用于脚本化预筛选

## 分步操作说明

### 阶段 1：准备

使用 CRM Search API 拉取 `email_health_flag` 已设置的联系人：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

resp = requests.post(f"{BASE}/crm/v3/objects/contacts/search", headers=HEADERS, json={
    "filterGroups": [{"filters": [
        {"propertyName": "email_health_flag", "operator": "EQ", "value": "true"},
    ]}],
    "properties": ["email", "firstname", "lastname", "company",
                   "hs_email_bounce", "hs_email_hard_bounce_reason_enum",
                   "lifecyclestage", "hubspot_owner_id"],
    "limit": 100,
})
resp.raise_for_status()
results = resp.json()["results"]
```

将结果导出为 CSV 以供复核。

### 阶段 2：执行——逐一复核联系人

对每个被标记的联系人，检查以下事项：

1. **邮箱域名是否仍然有效？** 快速做一次 MX 记录查询，或直接访问该域名。
2. **这是已知客户还是高价值联系人？** 查看生命周期阶段和交易历史。
3. **退信原因是什么？** 硬退信（邮箱无效）还是软退信（邮箱已满、临时错误）。

**决策矩阵：**

| 域名有效？ | 高价值？ | 退信类型 | 操作 |
|---------------|-------------|-------------|--------|
| 否 | 任意 | 任意 | 删除 |
| 是 | 否 | 硬退信 | 删除 |
| 是 | 否 | 软退信 | 保持抑制，下季度复查 |
| 是 | 是 | 硬退信 | 尝试查找更新后的邮箱 |
| 是 | 是 | 软退信 | 保持抑制，持续监控 |

### 阶段 3：收尾——执行决策并记录

1. 通过 HubSpot UI 或 API 批量删除，**删除**标记为待删除的联系人。
2. 在所有已复核的联系人上**清除** `email_health_flag`。
3. 记录复核结果（删除数量、保留数量、恢复尝试次数），供季度报告使用。

## 回滚

- 已删除的联系人可在 90 天内从 HubSpot 的回收站中恢复。
- 保留为抑制状态的联系人，可通过工作流或在 UI 中手动更新，恢复其营销状态。

## MCP 说明

这种每周分诊工作正是 HubSpot 的 MCP 服务器所擅长的高度交互、需要大量判断的任务（参见 `/connect-hubspot-mcp`）：在你决定删除还是恢复的同时，以对话方式让 Claude 拉取每个被标记联系人的详情、交易历史和退信原因。

## 执行频率

每周运行一次，最好在周一早晨。视数量多少，通常需要 5-15 分钟。如果每周数量超过 50 个联系人，请排查根本原因（劣质名单来源、表单垃圾提交等）。
