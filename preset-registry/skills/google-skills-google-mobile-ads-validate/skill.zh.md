---
name: google-mobile-ads-validate
description: >-
  Validates a project's Google Mobile Ads (GMA) SDK integration for iOS,
  Android, or Unity projects. Use when conducting a full pre-launch audit of an
  app that integrates GMA SDK or when validating any individual GMA SDK
  integration checks, such as when validating ad unit IDs and ad formats,
  SKAdNetwork IDs, mediation adapter SDK version compatibility, or ad
  preloading.
metadata:
  version: 1.0.0
  category: GoogleAds
---
# 验证 Google Mobile Ads SDK 集成

对项目的 Google Mobile Ads (GMA) SDK 集成进行验证，既可以进行完整审计，也可以针对特定请求的检查。

-   **完整审计**：如果用户请求一般性验证或完整审计，则评估所有清单项。
-   **特定检查**：如果用户只要求验证某个特定方面（例如广告预加载），则仅评估相关的检查项，而不运行整个清单。

## 评分规则

对每项检查，应用以下状态之一：

-   **Pass**：未满足任何 Warning、Fail 或 N/A 标准。
-   **Warning**、**Fail** 或 **N/A**：满足各相应状态中描述的条件。

## 验证清单

阅读要执行的每项检查所对应的参考指南：

-   项目中没有测试应用 ID，格式正确：`references/application-id.md`
-   项目中没有测试广告单元，格式正确：`references/ad-units.md`
-   已实现所有 Google SKAdNetwork ID：`references/google-skadnetwork-ids.md`
-   中介适配器兼容性：`references/mediation-adapter-compatibility.md`
-   广告预加载验证检查：`references/ad-preloading.md`

## 最终输出

按照以下格式生成 Markdown 报告。**仅**包含实际已检查项目的发现结果。

| 检查项 | 状态 | 发现结果 | 后续步骤 |
| :--- | :---: | :--- | :--- |
| 项目中没有测试应用 ID，格式正确 | {{status_1}} | {{findings_1}} | {{next_steps_1}} |
| 项目中没有测试广告单元，格式正确 | {{status_2}} | {{findings_2}} | {{next_steps_2}} |
| 已实现所有 Google SKAdNetwork ID | {{status_3}} | {{findings_3}} | {{next_steps_3}} |
| 中介适配器兼容性 | {{status_4}} | {{findings_4}} | {{next_steps_4}} |
| 广告预加载验证检查 | {{status_5}} | {{findings_5}} | {{next_steps_5}} |
