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
 - 提取：摘要、AC、每个 AC 行对应的平台、市场、组件。
 - 使用 `?expand=renderedFields` 获取 Jira 数据——HTML 中的平台颜色为权威依据：
 `#00B8D9` = Web · `#36B37E` = Mobile · `#FF991F` = Web+Mobile
 - 有关角色/市场逻辑，请参阅[参与者/权限矩阵](../quality-engineering-business-analysis/references/analysis_patterns.md)。

2. **影响分析**（在创建任何 TC 之前运行）
 - **步骤——直接查找**：使用 Jira 问题键（例如 `{PROJECT}-{ID}`）调用 `Get Issue Link Test Cases`。
 - **步骤 B——补充查找**：如果步骤 0 无结果，则使用 `[Module]` 和 `[Screen]` 关键字搜索，并检查同级问题链接。
 - 有关完整流程，请参阅[发现协议](references/impact_analysis.md)。
 - 将每个 AC 映射到覆盖状态：
 - **已覆盖** → 询问用户：跳过，还是更新为当前格式？
 - **部分覆盖** → 始终建议新建 TC。
 - **未覆盖** → 始终新建 TC。

3. **起草制品**：
 - 写入前删除任何现有的 `zephyr_test_plan.md`。
 - 严格遵循 [TC 格式参考](references/tc_format.md)中的四部分格式。
 - 写入后：重新读取文件，并在聊天中输出完整内容，以便用户无需打开文件即可审核。
 - 询问：审核批准、已覆盖 AC 的处理方式以及 Zephyr 文件夹 ID。

4. **在 Zephyr 中创建**（获得用户明确批准后）
 - `Create Test Case`（包含 `customFields`——无需单独更新）→ `Create Test Case Steps` → `Create Test Case Issue Link`
 - 对于现有 TC 的**更新**：通过 `Get Test Case Steps` 获取当前步骤，显示更新前后的差异，等待明确批准，然后执行 `Update Test Case`。

## 平台规则

| AC 行 | 操作 |
| ------------------------------------------- | --------------------------------------------------------------- |
| 单行 `[ WEB + MOBILE ]` | 创建一个 TC，平台 = "Web and Mobile"，名称中不添加平台前缀 |
| 两行行为相同但平台不同 | 创建两个 TC，分别使用 `Web_` / `Mobile_` 前缀——绝不合并 |

## 命名与归档

- **名称**：仅在平台专属时添加 `Web_` / `Mobile_` 前缀；如果同时适用于 Web 和 Mobile，则省略前缀。
- **文件夹**：使用用户提供或 Technical Impact 中指定的准确文件夹 ID。

### 角色映射规则

- **关键**：如果验收标准在订购/结账上下文中使用“用户”“买家”或“客户”等通用术语，则必须映射到所有购买角色：`["Client user", "Client admin", "Internal sales rep", "External sales rep"]`，不得默认映射到 `Client user`。

## API 关键说明（SmartBear MCP——`@smartbear/smartbear-mcp`）

- **`Create Test Case`** 要求使用 `projectKey="{PROJECT}"`，并直接支持 `customFields`（无需为角色/平台单独执行更新）。
- **`Create Test Case Steps`** 使用 `testCaseKey` + `mode`（APPEND/OVERWRITE）+ `items[]`。
- **`Create Test Case Issue Link`** 使用 `testCaseKey` + `issueId`（数字形式的 Jira 问题 ID——从工单的 `id` 字段中获取，而不是使用问题键字符串）。
- **`Get Issue Link Test Cases`** 使用 `issueKey`（例如 `{PROJECT}-{ID}`）——直接返回关联的 TC 键。
- **`Update Test Case`** 使用 `testCaseKey`——仅在修改现有 TC 时需要，创建新 TC 时不需要。

## 反模式

- **不得省略前缀**：发送到 Zephyr API 的 TC 名称必须为平台专属 TC 添加 `Web_` 或 `Mobile_` 前缀——逐字复制构件草稿中的名称；仅当 Platform = "Web and Mobile" 时省略前缀。
- **不得跳过 Draft 状态**：始终设置 status = Draft；绝不自动批准。
- **不得使用扁平的 folderId**：在所有 PUT 有效负载中使用 `"folder": {"id": X}`。
- **不得拆分 WEB+MOBILE**：一个 AC 行 = 一个 Platform 为 "Web and Mobile" 的 TC。
- **不得合并平台**：两个 AC 行、不同平台 = 两个独立的 TC。
- **不得静默更新**：显示更新前后的差异；等待明确批准。
- **不得跳过查找**：始终先执行 Step 直接链接查找，再进行补充搜索。
- **不得使用陈旧构件**：每次运行前删除现有的 `zephyr_test_plan.md`。
- **不得跳过覆盖情况**：每个构件必须以覆盖情况分析表开头。
- **不得幽灵更新**：只要匹配的代码发生变化，就更新 Zephyr TC。
- **不得使用模糊步骤**：使用具体且可观察的结果——例如，`"System works"` → `"Banner 'Success' is visible"`。

## 覆盖情况措辞

- 在影响分析期间，将每个 AC 标记为已覆盖、部分覆盖或未覆盖，并在起草新测试用例之前检查是否存在重复测试用例。

## 规范响应锚点

应用此技能时，请在相关情况下保留以下领域术语或含义等效的具体示例：
- 重复
- 影响分析
- 无平台前缀
- 独立

- 其他基于任务的精确锚点：Issue Link