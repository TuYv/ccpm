---
name: cleanup-workflows
description: "Audit and remove inactive, test, or deprecated workflows from HubSpot. Identifies workflows that have never enrolled contacts, workflows turned off for 90+ days, and test workflows."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 清理工作流（Cleanup Workflows）

审计 HubSpot 工作流以清除冗余。未使用的工作流会让自动化仪表盘变得杂乱，让人更难理解哪些流程在真正运行。

## 前置条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），具有 `automation` 权限范围
- Python 3.10+ 以及 [`uv`](https://github.com/astral-sh/uv)
- 注意：Automation API 在某些套餐层级上可能返回 403。如果遇到这种情况，请在 HubSpot UI 中于 Automation > Workflows 下手动审计。
- 强烈建议：先运行 `/workflows-as-code`，导出每个工作流的 JSON 备份——被删除的工作流无法恢复，但有了导出文件就可以通过 API 重新创建它们。

## 分步操作说明

### 阶段 1：规划

在开始之前与用户确认：

1. 先归档策略：先关闭，等待一周，再删除（推荐）？
2. 是否有任何绝对不能触碰的工作流（合规相关、集成相关）？

### 阶段 2：清理前

通过 v4 Automation API 对所有工作流进行盘点：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

flows, after = [], None
while True:
    params = {"limit": 100}
    if after:
        params["after"] = after
    resp = requests.get(f"{BASE}/automation/v4/flows", headers=HEADERS, params=params)
    resp.raise_for_status()
    data = resp.json()
    flows.extend(data.get("results", []))
    after = data.get("paging", {}).get("next", {}).get("after")
    if not after:
        break
```

对于每个工作流，记录：flow ID、名称、启用状态、类型、创建日期、最后更新日期。注册（enrollment）计数可在 UI 中查看（Automation > Workflows > Details）。

### 阶段 3：执行

标记符合以下任一条件的工作流：

1. 已**关闭**超过 90 天且无重新启用计划
2. **从未有过任何注册记录**（可能是测试或废弃的草稿）
3. **测试工作流**（名称包含 "test"、"temp"、"copy of"、"draft"）
4. 已被更新版本**取代**的工作流
5. 持续失败、处于**错误状态**的工作流

删除之前，请检查：
- 该工作流是否会流转到另一个工作流（通过注册触发器或 go-to-workflow 操作）？
- 该工作流是否设置了其他工作流所依赖的属性？
- 是否有文档引用了该工作流？

将候选列表呈报给用户，并等待明确确认。然后，对于已确认的候选对象：先关闭每个工作流（在 UI 中操作，或使用 `PUT /automation/v4/flows/{flowId}` 并设置 `isEnabled: false`——该 PUT 请求需要当前的 `revisionId`），等待一周，然后通过 `DELETE /automation/v4/flows/{flowId}` 或 UI 删除。

### 阶段 4：清理后

1. 重新运行盘点，确认被删除的工作流已不复存在。
2. 在清理日志中记录被删除的工作流（名称、用途、删除原因）。
3. 通知工作流的负责人。

## 回滚

- 已删除的工作流在 HubSpot 中无法恢复。
- 事先通过 `/workflows-as-code` 导出的文件包含每个工作流的完整 JSON 定义——可以使用 `POST /automation/v4/flows` 根据其导出内容重新创建被删除的工作流。
- 即使工作流被删除，HubSpot 仍会在联系人记录上保留该工作流的活动历史。

## 提示

- 在工作流仪表盘中使用文件夹，按团队、用途或状态进行组织。
- 为草稿/测试工作流添加 "[TEST]" 前缀，便于日后识别。
- 每季度审查一次工作流，作为数据库清理例行工作的一部分。
