---
name: quality-engineering-zephyr-test-generation
description: 'Generate Zephyr test cases from Jira stories: parse acceptance criteria and business rules, impact-analyze existing TCs (update vs. create new), and draft correctly named test cases. Use for AC-to-test generation; defer post-generation Jira linking and manual test-case quality review.'
metadata:
  triggers:
    files:
    - '**/user_story.md'
    keywords:
    - generate test cases
    - zephyr
    - impact analysis
    - create test case
---
# Zephyr 测试生成标准

## **优先级：P1（高）**

## 工作流：Jira → Zephyr

1. **分析需求**：
 - 提取：Summary、AC、每个 AC 行对应的平台、市场、组件。
 - 使用 `?expand=renderedFields` 获取 Jira 数据 — 对于平台颜色，以 HTML 为准：
 `#00B8D9` = Web · `#36B37E` = Mobile · `#FF991F` = Web+Mobile
 - 有关角色/市场逻辑，请参阅[角色/权限矩阵](../quality-engineering-business-analysis/references/analysis_patterns.md)。
 - 根据 `quality-engineering-test-plan-authoring` 场景扩展规则，若 AC 存在歧义则暂停：AC 过短、没有预期行为、捆绑式 AC、相互矛盾。起草前先提问。

2. **影响分析**（创建任何 TC 前执行）
 - **步骤 A — 直接查找**：使用 Jira issue key（例如 `{PROJECT}-{ID}`）调用 `Get Issue Link Test Cases`。
 - **步骤 B — 补充查找**：如果步骤 A 未找到结果，则使用 `[Module]` 和 `[Screen]` 关键词进行搜索，并检查兄弟 issue links。
 - 完整链路请参阅[发现协议](references/impact_analysis.md)。
 - 将每个 AC 映射到覆盖状态：
 - **已覆盖** → 询问用户：跳过，还是更新为当前格式？
 - **部分覆盖** → 始终提出创建新的 TC。
 - **未覆盖** → 始终创建新的 TC。

3. **起草产物**：
 - 写入前删除任何现有的 `zephyr_test_plan.md`。
 - 严格遵循[TC 格式参考](references/tc_format.md)中的 4-section 格式。
 - 写入后：重新读取文件，并在聊天中打印完整内容，以便用户无需打开文件即可审核。
 - 询问：审核批准、如何处理已覆盖的 AC，以及 Zephyr Folder ID。

4. **在 Zephyr 中创建**（获得用户明确批准后）
 - `Create Test Case`（包含 `customFields` — 无需单独执行 Update）→ `Create Test Case Steps` → `Create Test Case Issue Link`
 - 对现有 TC 进行**更新**时：通过 `Get Test Case Steps` 获取当前步骤，展示更新前/后的差异，等待明确批准，然后执行 `Update Test Case`。
 - 参数契约请参阅[SmartBear API 说明](references/smartbear-api.md)。

## 平台规则

| AC 行 | 操作 |
| ------------------------------------------- | --------------------------------------------------------------- |
| 单行 `[ WEB + MOBILE ]` | 一个 TC，Platform = "Web and Mobile"，名称中不添加平台前缀 |
| 两行行为相同但平台不同 | 两个 TC，使用 `Web_` / `Mobile_` 前缀 — 绝不合并 |

## 命名与归档

- **名称**：仅在平台专属时添加 `Web_` / `Mobile_` 前缀；Web and Mobile 不添加前缀。
- **文件夹**：使用用户提供或 Technical Impact 中指定的确切 Folder ID。

### 角色映射规则

- **关键**：如果 Acceptance Criteria 在下单/结账上下文中使用了诸如“用户”“买家”或“客户”等通用术语，则**必须**映射到所有购买角色：`["Client user", "Client admin", "Internal sales rep", "External sales rep"]`。不得默认映射为 `Client user`。

## 反模式

- **不得省略前缀**：发送至 Zephyr API 的 TC 名称必须包含平台专属 TC 的 `Web_` 或 `Mobile_` 前缀 — 从产物草稿中原样复制；仅当 Platform = "Web and Mobile" 时省略前缀。
- **不得跳过草稿**：始终设置 status = Draft；不得自动批准。
- **不得使用扁平的 folderId**：所有 PUT payload 中都使用 `"folder": {"id": X}`。
- **不得拆分 WEB+MOBILE**：一行 AC = 一个 Platform 为 "Web and Mobile" 的 TC。
- **不得合并平台**：两行 AC、平台不同 = 两个独立的 TC。
- **不得静默更新**：展示更新前/后的差异；等待明确批准。
- **不得跳过查找**：始终先执行步骤 A 的直接链接查找，再进行补充搜索。
- **不得使用过时的产物**：每次运行前删除现有的 `zephyr_test_plan.md`。
- **不得跳过覆盖分析**：Coverage Analysis 表必须打开每个产物。
- **不得遗漏更新**：匹配的代码发生变更时，更新 Zephyr TC。
- **不得使用模糊步骤**：使用具体、可观察的结果 — 例如，将 `"System works"` 改为 `"Banner 'Success' is visible"`。
- **不得臆造预期结果**：引用 AC 或业务规则，或标记为 `ASSUMED` 并将其提交审核。
- **不得重新措辞负向场景**：N 和 E 场景必须改变前置条件或输入，而不是只改变措辞。
- **不得在 AC 存在歧义时生成**：暂停并提问；令人信服的 TC 不应掩盖缺失的需求。

## 覆盖措辞

- 在影响分析（impact analysis）期间，将每个 AC 映射为 Covered、Partial 或 Not Covered，并在起草新测试用例之前检查是否存在重复（duplicate）测试用例。

## 规范响应锚点

当此技能适用时，在回答中保留以下领域术语或相关的具体示例（如适用）：
- duplicate
- impact analysis
- no platform prefix
- separate

- 其他与任务相关的确切锚点：Issue Link