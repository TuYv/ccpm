---
name: quality-engineering-playwright-pom-generation
description: Generates Playwright page objects from an executable test plan, one class per screen with ladder-compliant locators and no assertions, wired into a shared fixture. Use when a web scenario needs a page object that does not exist yet, or when locators drift and the page object must be rebuilt.
metadata:
  triggers:
    files:
      - "tests/pages/**/*.ts"
      - "**/page-objects/**/*.ts"
      - "**/*.page.ts"
    keywords:
      - page object
      - page object model
      - pom generation
      - generate page objects
      - playwright fixture
      - pages fixture
---
# 质量工程：Playwright 页面对象生成

## **优先级：P1（高）**

## 输入

来自 `docs/srs/test-plan-[slug].md` 的 Web 场景块（`Steps`、`Expected`、`@AC-n`），以及该屏幕已解析的 `SELECTOR_GAPS`。必须根据计划生成，不能仅从实时 DOM 爬取生成：计划规定了哪些元素是相关的。

## 布局

- 每个屏幕对应一个文件：`tests/pages/<screen>.page.ts`，类名为 `<Screen>Page`（例如 `CheckoutPage`）。
- 每个计划涉及的元素对应一个 locator getter，并以元素命名（`submitButton`、`emailInput`）。
- 每个计划步骤动词对应一个操作方法（`fillShipping(data)`、`submit()`）；操作返回 `void` 或下一个页面对象。
- `tests/fixtures.ts` 中的 `pages` fixture 暴露所有页面对象；spec 必须从该文件导入 `test`，不能直接从 `@playwright/test` 导入。

## Locator 规则

遵循 `quality-engineering-selector-stability` 中的 Web 定位器阶梯：优先使用 `getByRole` / `getByLabel`，其次使用带有 `<screen>-<element>-<role>` id 的 `getByTestId`，然后使用属性 CSS。禁止使用 XPath、`nth`、翻译后的字符串文本或生成的类名。当元素没有稳定的 locator 时，不要自行臆造：在输出的 `Selector Gaps` 下记录该问题，以供 `specialist-testid-inserter` 处理。

## 页面对象中禁止断言

页面对象暴露状态（`orderId()`、`isVisible()`），由 spec 进行断言。在页面对象中使用 `expect` 会隐藏场景中的断言，并破坏正向和负向用例之间的复用。

## 工作流

1. 阅读场景块和屏幕已有的页面对象（如有）；在已有对象的基础上扩展，不要重复创建。
2. 将每个计划步骤映射到现有或新增的操作方法；将每个 `Expected` 映射到一个状态 getter。
3. 按照定位器阶梯编写 locator；在输出的 `Selector Gaps` 下列出未解决的元素。
4. 在 `pages` fixture 中注册页面对象。
5. 运行 `npx tsc --noEmit -p tests`（或仓库中的类型检查命令）以及一次 seed spec。

## 反模式

- **页面对象中禁止断言**：`expect` 应位于 spec 中。
- **禁止创建 DOM 爬取式页面对象**：一个包含四十个没人使用的 getter 的类是噪音，而不是覆盖率。
- **禁止重复创建页面对象**：创建前搜索 `tests/pages/`；扩展已有类。
- **spec 中禁止直接使用 `page`**：所有交互都必须通过页面对象或 seed 完成。
- **禁止重命名测试 id**：id 是公共契约；重命名属于 selector gap，而不是重构。

## 参考

- [页面对象模板](references/page-object-template.md)
- [Fixture 接线](references/fixture-wiring.md)
- [Playwright MCP 编写](references/playwright-mcp-authoring.md)