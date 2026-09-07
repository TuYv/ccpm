---
name: quality-engineering-selector-stability
description: Cross-stack selector and test-id policy for web and mobile automation. Use when writing or reviewing E2E/UI test locators, or adding data-testid/accessibility identifiers to components.
metadata:
  triggers:
    files:
      - "**/e2e/**/*.{ts,js}"
      - "**/*.e2e.{ts,js}"
    keywords:
      - selector
      - locator
      - data-testid
      - testID
      - accessibilityIdentifier
      - testTag
      - stable locator
      - selector drift
---
# 质量工程：选择器稳定性

## **优先级：P0（关键）**

## Web 选择器阶梯

`getByRole` / `getByLabel` > `getByTestId`（`data-testid`）> CSS 属性选择器。绝不使用 XPath、`nth-child` 或自动生成的类名。

## 移动端选择器阶梯

Accessibility id > resource-id / `testTag` > predicate/uiautomator > XPath。绝不使用 XPath。

## 框架对照表

- React/Next.js：`data-testid`。React Native：`testID` + `accessibilityLabel`。
- Flutter：黑盒 E2E 测试使用 `Semantics(identifier:)`；`WidgetKeys` 保留用于 widget 测试。
- SwiftUI/UIKit：`.accessibilityIdentifier`。Compose：`Modifier.testTag` + `testTagsAsResourceId = true`。

## 命名

`<screen>-<element>-<role>`，kebab-case（例如 `checkout-submit-button`）。

## 插入策略

仅为叶子级的可交互/可断言元素添加 id，绝不给布局包装元素添加。绝不重命名已有的 id——id 是其他测试所依赖的公共契约。

## 漂移分类

`rename`（id 发生变更）、`restructure`（DOM/树结构被移动）、`i18n`（可见文本变化，id 不受影响）。

## 反模式

- 对翻译字符串使用文本选择器、基于索引的定位器（`nth`）、自动生成/哈希化的类名。
- 将 `accessibilityLabel` 用作测试 id（它是面向用户的 a11y 文本，不是稳定标识符）。
- “暂时先用一下 xpath”——不存在临时的 XPath；从第一次提交起就遵循选择器阶梯。

## 参考资料

- [选择器阶梯详解](references/selector-ladder.md)
- [测试 ID 命名](references/testid-naming.md)
- [插入策略](references/insertion-policy.md)
- [漂移分类](references/drift-classification.md)
