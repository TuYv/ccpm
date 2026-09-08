---
name: enrich-industry
description: "Backfill contact-level industry from associated company records using a HubSpot workflow. Enables industry-based segmentation for targeted campaigns aligned with ICP verticals."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: data-enrichment
---
# 从关联公司补充联系人行业信息

将行业数据从公司记录复制到其关联的联系人。在典型的 B2B CRM 中，公司记录的行业字段填充率很高（80-90%），而联系人记录几乎为零。此工作流可自动弥合这一差距。

## 为什么这很重要

如果联系人记录上没有行业信息，就无法按垂直行业对邮件营销活动进行细分。对于瞄准特定行业的 B2B 公司而言，这决定了你是在“广撒网碰运气”式地群发邮件，还是在发送有针对性且相关的信息。联系人上的行业数据还会为 ICP 分层分类和线索评分模型提供输入。

## 前提条件

- HubSpot Marketing Hub Professional 或 Sales Hub Professional（用于工作流）
- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），用于脚本化阶段
- Python 3.10+ 以及 [`uv`](https://github.com/astral-sh/uv)
- 应先完成公司名称补充（enrich-company-name 技能），因为它可能会触发新的公司关联
- 拥有 Settings > Properties 的访问权限，以便验证/创建联系人 Industry 属性

## 脚本

| 阶段 | 脚本 | 运行方式 |
|-------|--------|----------|
| 前置 | [`scripts/before.py`](./scripts/before.py) | `uv run skills/enrich-industry/scripts/before.py` |
| 后置 | [`scripts/after.py`](./scripts/after.py) | `uv run skills/enrich-industry/scripts/after.py` |

没有执行脚本：补充操作本身作为 HubSpot 工作流运行（参见下文的“执行”部分）。

## 计划

1. 验证联系人 Industry 属性存在且与公司 Industry 属性兼容
2. 审计有多少联系人可以被补充（前置状态）
3. 构建一个从关联公司复制行业信息的工作流
4. 验证补充结果（后置状态）

## 前置

### 检查属性兼容性

这是最重要的前置步骤。联系人可能同时存在两个行业属性：`industry` 和 `industry_name`。你必须验证 HubSpot 在列表和报表中使用的是哪一个。

1. 前往 **Settings > Properties > Contact properties**
2. 搜索 "Industry"
3. 记下联系人对象上所有与行业相关的属性
4. 检查现有列表、报表和工作流中使用的是哪个属性
5. 目标属性必须与公司 Industry 属性兼容：
   - 如果两者均为 **dropdown select**：选项值必须完全匹配（拼写相同、大小写相同）
   - 如果联系人属性为 **single-line text**：它将接受任何值（最安全的选择）
   - 如果不确定，请使用 single-line text 以避免复制失败

**如果不存在联系人 Industry 属性**，请创建一个：
- 对象：Contact
- 分组：Contact information
- 标签：Industry
- 字段类型：Dropdown select（从公司 Industry 属性复制所有值）或 Single-line text（接受任何值）

### 审计补充机会

运行 `uv run skills/enrich-industry/scripts/before.py`。核心查询如下：

```python
resp = requests.post(f"{BASE}/crm/v3/objects/contacts/search", headers=HEADERS, json={
    "filterGroups": [{"filters": [
        {"propertyName": "industry", "operator": "NOT_HAS_PROPERTY"},
    ]}],
    "limit": 1,
})
print(f"Contacts missing industry: {resp.json()['total']}")
```

另外创建一个 HubSpot 列表来估算可补充的联系人数量：
- 筛选条件 1：Contact Industry > is unknown
- 筛选条件 2：AND Associated company > Industry > is known
- 该数量告诉你实际会有多少联系人得到补充

## 执行

### 创建补充工作流

此工作流与公司名称补充工作流几乎完全相同。如果你已经构建过那个工作流，可以直接克隆它并替换其中的属性引用。

1. 前往 **Automation > Workflows > Create workflow**
2. 选择 **Contact-based > Blank workflow**
3. 名称：`AUTO-ENRICH: Copy Industry from Company`

**注册触发条件：**
- Contact property > Industry > **is unknown**
- AND Associated company > Industry > **is known**

**重新注册：**
- 基于相同条件启用重新注册。这可确保之后才与公司建立关联的联系人也能被补充。

**操作：复制属性**
- 复制来源：Company > Industry
- 复制目标：Contact > Industry

**激活：**
- 点击 Review > Turn on
- 选择 **Yes, enroll existing contacts**

**注意：** 与公司名称工作流不同，这里不需要设置延迟。如果联系人已经关联了带有行业数据的公司（由注册触发条件检查），复制可以立即进行。

## 后置

等待 1-2 小时让工作流完成处理，然后进行验证：`uv run skills/enrich-industry/scripts/after.py`（它会重新运行前置状态查询并与基线进行对比）。

**验证清单：**

1. 联系人行业数量应从接近零跃升至数万
2. 补充列表（缺少行业 + 存在公司关联）应接近 0
3. 抽查 20+ 个联系人以核实准确性：
   - 打开联系人记录
   - 验证 Industry 字段显示了值
   - 点击关联的公司，确认行业信息一致
4. 检查联系人上的行业分布是否与公司行业分布大致相符
5. 检查工作流历史记录中是否存在失败 —— 最常见的是属性值不匹配（公司拥有的值与联系人上的某个下拉选项不匹配）

## 回滚

- 关闭该工作流以停止进一步的补充。
- 该工作流只会填充空字段。如果复制了错误的值（例如下拉选项不匹配），请根据工作流的注册历史筛选联系人并清除联系人的 `industry` 属性，或者从属性历史记录中恢复各个值。

## 外部提供商

此技能只移动门户中已有的行业数据（公司 → 联系人）。当*公司*本身没有行业值时，这一空缺需要外部数据 —— 与供应商无关的补充路径请参见 `/waterfall-enrich-contacts`，平台内补充可使用 HubSpot 的 Breeze Intelligence 附加组件。

## 关键技术经验

- **可能存在两个行业属性。** 一些 HubSpot 门户在联系人上同时拥有 `industry` 和 `industry_name`。在构建工作流之前，请验证哪一个是权威属性。写入错误的属性意味着你的列表和报表将看不到这些数据。
- **下拉值匹配区分大小写且要求精确。** 如果公司 Industry 的值是 "Healthcare"，而联系人 Industry 下拉选项是 "healthcare"（小写），复制将会失败。请确保值完全匹配。
- **考虑合并相似行业。** 许多 CRM 中存在类似 "Healthcare" 和 "Hospital & Health Care" 这样相互重叠的值。为了便于细分，可以考虑创建一个单独的 "Industry Group" 属性，将相似的值映射到更宽泛的类别。这是可选的，但能提升列表的可用性。
- **这不会覆盖现有值。** 注册触发条件要求 "Industry is unknown"，因此已经拥有行业数据的联系人不会受到影响。
- **如果使用文本字段而不是下拉菜单：** 补充仍然有效，但你将无法在列表中按精确的下拉值进行筛选。之后可以转换为下拉菜单，但需要先清理不一致的文本值。
- **在公司名称补充之后运行此技能。** 公司名称补充可能会触发新的公司关联，从而增加符合行业补充条件的联系人数量。
- **克隆公司名称工作流。** 结构几乎完全相同。在 HubSpot 中克隆它并替换属性引用，可以节省时间。
