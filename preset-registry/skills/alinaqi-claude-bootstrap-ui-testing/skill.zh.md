---
name: ui-testing
description: Visual testing - catch invisible buttons, broken layouts, contrast
when-to-use: When writing visual or accessibility tests for UI components
user-invocable: false
paths: ["**/*.test.tsx", "**/*.spec.tsx", "**/*.stories.*"]
effort: medium
---
# UI 验证技能

*搭配 ui-web.md 或 ui-mobile.md 加载*

## 目的

快速验证生成的 UI 是否符合无障碍标准。创建任何新的 UI 组件后，请执行这些检查。

---

## 发布前检查清单

### 发布任何 UI 之前：

```markdown
## Visibility Check
- [ ] All buttons have visible background OR border
- [ ] No text is same color as its background
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Ghost/text buttons have visible borders

## Touch/Click Targets
- [ ] All buttons are minimum 44px height
- [ ] Icon buttons are minimum 44x44px
- [ ] Adequate spacing between clickable elements

## States
- [ ] Hover states visible (web)
- [ ] Pressed states visible (mobile)
- [ ] Focus rings on keyboard navigation
- [ ] Disabled states visually distinct (opacity 0.5)
- [ ] Loading states show indicators

## Dark Mode (if applicable)
- [ ] Text readable on dark backgrounds
- [ ] Borders visible in dark mode
- [ ] No gray-400 text on dark backgrounds

## Responsive (web)
- [ ] No horizontal scroll on mobile (320px)
- [ ] Content readable at all breakpoints
- [ ] Touch targets adequate on mobile
```

---

## 快速对比度检查

### 使用浏览器开发者工具
```
1. Right-click element → Inspect
2. In Styles panel, click on color value
3. Look for contrast ratio display
4. Must show ✓ for AA compliance (4.5:1 for text)
```

### 在线工具
- https://webaim.org/resources/contrastchecker/
- https://coolors.co/contrast-checker

### Tailwind 安全组合

```
LIGHT MODE (on white bg):
✓ text-gray-900  (#111827) = 16:1
✓ text-gray-800  (#1F2937) = 12:1
✓ text-gray-700  (#374151) = 9:1
✓ text-gray-600  (#4B5563) = 6:1
✗ text-gray-500  (#6B7280) = 4.6:1 (barely)
✗ text-gray-400  (#9CA3AF) = 2.6:1 (FAILS)

DARK MODE (on gray-900 bg):
✓ text-white     (#FFFFFF) = 16:1
✓ text-gray-100  (#F3F4F6) = 13:1
✓ text-gray-200  (#E5E7EB) = 11:1
✓ text-gray-300  (#D1D5DB) = 8:1
✗ text-gray-400  (#9CA3AF) = 5:1 (barely)
✗ text-gray-500  (#6B7280) = 3:1 (FAILS)
```

---

## 常见修复方法

### 不可见按钮
```tsx
// PROBLEM: No visible boundary
<button className="text-gray-500">Click</button>

// FIX: Add background OR border
<button className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
  Click
</button>
// OR
<button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg">
  Click
</button>
```

### 低对比度文本
```tsx
// PROBLEM: Light gray on white
<p className="text-gray-400">Secondary text</p>

// FIX: Use darker gray
<p className="text-gray-600">Secondary text</p>
```

### 缺少焦点状态
```tsx
// PROBLEM: Focus removed without replacement
<button className="outline-none">Submit</button>

// FIX: Add visible focus ring
<button className="outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
  Submit
</button>
```

### 触控目标过小
```tsx
// PROBLEM: Too small for fingers
<button className="p-1 text-sm">×</button>

// FIX: Minimum 44px
<button className="w-11 h-11 flex items-center justify-center">×</button>
```

### 深色模式失效
```tsx
// PROBLEM: Same colors in both modes
<p className="text-gray-400">Text</p>

// FIX: Adjust for dark mode
<p className="text-gray-600 dark:text-gray-300">Text</p>
```

---

## 自动化检查（可选）

### ESLint 插件
```bash
npm install -D eslint-plugin-jsx-a11y
```

```json
// .eslintrc
{
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

### Playwright 快速测试
```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('no accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 何时使用完整测试

在以下情况下添加全面的视觉测试（Playwright 截图、Storybook）：
- 构建组件库
- 多名开发者共同开发 UI
- UI 频繁变更
- 需要强制执行设计系统

对于个人项目或 MVP，上述检查清单已足够。