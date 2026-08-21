---
name: quality-engineering-quality-assurance
description: Write or review manual Zephyr test cases with 1-condition-per-TC granularity, Module_Action on Screen when Condition naming, platform prefix rules, and High/Normal/Low priority classification. Use for test-case authoring and review; defer Jira traceability, linking, and pushing cases to Zephyr.
metadata:
  triggers:
    keywords:
    - test case
    - manual test
    - zephyr
    - test scenario
    - naming convention
    - acceptance criteria
---
# 质量保证标准

## **优先级：P1（高）**

## 1. 测试用例粒度

- **1 个测试用例 = 1 个页面上的 1 个条件**。
 - **拆分页面**：“订单详情”和“商品详情”应分开。
 - **拆分条件**：“配置 A”和“配置 B”应分开。
- **禁止使用“OR”逻辑**：每个 TC 必须测试一条单一、明确的路径。

## 2. 命名规范

- **格式**：`Platform_Module_Action on Screen when Condition`（例如，`Web_Order_Verify...` 或 `Mobile_Order_Verify...`）
- **规则**：仅当需求为某个平台独有时，才添加 `Web_` 或 `Mobile_` 前缀。如果同时支持**两个平台**，则省略前缀。
- **示例**：`Order_Verify payment term on Item Details when Toggle is OFF`（同时支持两个平台）

## 3. 优先级级别

使用优先级理由说明每项分类的依据：

- 高：关键路径、阻断性缺陷。
- 普通：标准验证、边界情况。
- 低：外观问题、轻微改进。

## 4. 参考资料

- [详细示例](references/test_case_standards.md)

## 反模式

- **禁止宽泛的 TC**：`"Verify order flow works"` — 过于宽泛；每个 TC 必须恰好覆盖 1 个页面上的 1 个条件
- **禁止共享 TC（行为存在差异时）**：当 Web 和 Mobile 的行为存在差异时，不得在单个 TC 中同时测试二者 — 应按平台拆分为单独的 TC
- **禁止不完整命名**：`Order_Verify page` — 名称必须遵循完整格式：`Module_Action on Screen when Condition`
- **禁止虚高优先级**：将外观间距缺陷标记为高优先级 — 高优先级仅适用于关键路径上的阻断性问题

## 评审措辞

- 当测试用例违反命名规范时，明确指出命名违规，然后将其拆分为多个单独的 TC，确保每个 TC 仅包含 1 个页面上的 1 个条件。

## 规范响应锚点

应用此技能时，在相关情况下，回答中应保留以下领域术语或等效的具体示例：
- 命名违规
- 1 个测试用例 = 1 个条件
- 高：关键路径
- 低：外观问题
- `Module_Action on Screen when Condition`
- 禁止使用“OR”逻辑
- 拆分为单独的 TC
- 优先级理由