---
name: cleanup-forms
description: "Audit and remove unused, test, or deprecated forms from HubSpot. Identifies forms with zero submissions, forms not embedded on any page, and test forms left over from development."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 清理表单

审计 HubSpot 表单以移除未使用和测试用的表单。过期表单会使表单仪表盘变得杂乱，并可能在构建工作流或报告时造成混淆。

## 前提条件

- 一个具有 `forms` 权限范围的 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`）
- Python 3.10+，并安装 [`uv`](https://github.com/astral-sh/uv)
- 注意：在某些套餐层级上，Forms API 可能返回 403。如果出现这种情况，请在 HubSpot UI 中的 Marketing > Forms 下手动执行审计。

## 分步操作说明

### 阶段 1：规划

在开始之前与用户确认：

1. 处理力度如何：直接删除，还是先加上 "[DEPRECATED]" 前缀，下个季度再删除？
2. 是否有任何绝不能触碰的表单（合规、法务、进行中的营销活动）？

### 阶段 2：操作前

通过 Marketing Forms API（v3）清点所有表单：

```python
import os, requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BASE = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

forms, after = [], None
while True:
    params = {"limit": 100}
    if after:
        params["after"] = after
    resp = requests.get(f"{BASE}/marketing/v3/forms", headers=HEADERS, params=params)
    resp.raise_for_status()
    data = resp.json()
    forms.extend(data.get("results", []))
    after = data.get("paging", {}).get("next", {}).get("after")
    if not after:
        break
```

对于每个表单，记录：表单 ID、名称、类型、提交次数、创建日期、最近提交日期。

### 阶段 3：执行

标记符合以下任一条件的表单：

1. **零提交**且创建时间超过 30 天
2. **近期无提交**（最近一次提交在 6 个月以上）且未嵌入任何活跃页面
3. **测试表单**（名称包含 "test"、"temp"、"draft"、"copy of"）
4. 已被更新版本替代的**弃用表单**

删除之前，检查：
- 该表单是否被任何工作流的注册触发器引用？
- 该表单是否嵌入在任何已上线的落地页或网站页面上？
- 该表单是否用于任何弹窗或滑入式 CTA？

将候选列表呈现给用户并等待明确确认，然后通过 API（`DELETE /marketing/v3/forms/{formId}`）或 UI 删除已确认未使用的表单。

### 阶段 4：操作后

1. 重新运行清点，确认已删除的表单不复存在。
2. 在清理日志中记录删除了哪些内容。
3. 如果删除了有提交记录的表单，提交数据会保留在联系人记录上——但表单定义会消失。

## 回滚

- 已删除的表单在 HubSpot 中无法恢复。
- 在删除有任何提交记录的表单之前，先导出表单定义（字段名称、设置），以便重新创建。
- 无论表单是否被删除，联系人记录都会保留其表单提交历史。

## 提示

- 建立命名规范：`[TEAM] - Purpose - Version`（例如 `[Marketing] - Webinar Registration - v2`）。
- 对弃用表单加上 "[DEPRECATED]" 前缀，而不是立即删除——在一个季度无使用之后再删除。
