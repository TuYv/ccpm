---
name: accessibility
description: Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "keyboard navigation", or "make accessible".
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---
# 无障碍（a11y）

基于 WCAG 2.2 和 Lighthouse 无障碍审计的综合无障碍指南。目标：让所有人（包括残障人士）都能使用内容。

## 以证据为依据的审计工作流

当渲染后的页面可用时：

1. 如果具备相应能力，请运行实时 Lighthouse 无障碍审计；使用 Chrome DevTools MCP 时，使用 `lighthouse_audit`。对于面向公众的常规页面，使用移动设备导航模式；如果重新加载会丢失已认证状态或用户创建的状态，则使用快照模式。
2. 使用审计失败的节点来定位相关组件或模板，而不是在整个代码仓库中搜索通用模式。
3. 检查渲染后的无障碍树快照，确认名称、角色、状态、地标和标题结构；使用 Chrome DevTools MCP 时，使用 `take_snapshot`。使用键盘操作受影响的流程。
4. 修复源代码，然后重新运行相同的审计和手动交互测试。

如果实时工具不可用，请使用 Lighthouse CLI 或 axe 进行自动化覆盖，并完成相同的手动检查。自动化工具只能检测一部分无障碍障碍：得分 100 并不代表符合 WCAG，低分也不能取代问题级别的证据。

## WCAG 原则：POUR

| 原则 | 说明 |
|-----------|-------------|
| **P** 可感知 | 内容可通过不同感官被感知 |
| **O** 可操作 | 所有用户都可以操作界面 |
| **U** 可理解 | 内容和界面易于理解 |
| **R** 健壮性 | 内容可与辅助技术配合使用 |

## 一致性级别

| 级别 | 要求 | 目标 |
|-------|-------------|--------|
| **A** | 最低无障碍要求 | 必须通过 |
| **AA** | 标准一致性 | 应当通过（在许多司法管辖区属于法律要求） |
| **AAA** | 增强无障碍要求 | 最好具备 |

---

## 可感知

### 文本替代内容（1.1）

**图像需要替代文本：**
```html
<!-- ❌ Missing alt -->
<img src="chart.png">

<!-- ✅ Descriptive alt -->
<img src="chart.png" alt="Bar chart showing 40% increase in Q3 sales">

<!-- ✅ Decorative image (empty alt) -->
<img src="decorative-border.png" alt="" role="presentation">

<!-- ✅ Complex image with longer description -->
<figure>
  <img src="infographic.png" alt="2024 market trends infographic" 
       aria-describedby="infographic-desc">
  <figcaption id="infographic-desc">
    <!-- Detailed description -->
  </figcaption>
</figure>
```

**图标按钮需要无障碍名称：**
```html
<!-- ❌ No accessible name -->
<button><svg><!-- menu icon --></svg></button>

<!-- ✅ Using aria-label -->
<button aria-label="Open menu">
  <svg aria-hidden="true"><!-- menu icon --></svg>
</button>

<!-- ✅ Using visually hidden text -->
<button>
  <svg aria-hidden="true"><!-- menu icon --></svg>
  <span class="visually-hidden">Open menu</span>
</button>
```

**视觉隐藏类：**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 颜色对比度 (1.4.3, 1.4.6)

| 文本大小 | AA 最低要求 | AAA 增强要求 |
|-----------|------------|--------------|
| 普通文本（< 18px / 粗体 < 14px） | 4.5:1 | 7:1 |
| 大文本（≥ 18px / 粗体 ≥ 14px） | 3:1 | 4.5:1 |
| UI 组件和图形 | 3:1 | 3:1 |

```css
/* ❌ Low contrast (2.5:1) */
.low-contrast {
  color: #999;
  background: #fff;
}

/* ✅ Sufficient contrast (7:1) */
.high-contrast {
  color: #333;
  background: #fff;
}

/* ✅ Focus states need contrast too (3:1 against background, WCAG 1.4.11) */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

**不要仅依赖颜色：**
```html
<!-- ❌ Only color indicates error -->
<input class="error-border">
<style>.error-border { border-color: red; }</style>

<!-- ✅ Color + icon + text -->
<div class="field-error">
  <input aria-invalid="true" aria-describedby="email-error">
  <span id="email-error" class="error-message">
    <svg aria-hidden="true"><!-- error icon --></svg>
    Please enter a valid email address
  </span>
</div>
```

### 媒体替代内容 (1.2)

```html
<!-- Video with captions -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default>
  <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Descriptions">
</video>

<!-- Audio with transcript -->
<audio controls>
  <source src="podcast.mp3" type="audio/mp3">
</audio>
<details>
  <summary>Transcript</summary>
  <p>Full transcript text...</p>
</details>
```

---

## 可操作

### 键盘可访问 (2.1)

**所有功能都必须可通过键盘访问。** 优先使用原生交互元素——`<button>`、`<a href>` 和表单控件无需额外处理即可支持 Enter/Space 激活、焦点和辅助技术语义。只有在无法使用原生元素时，才手动添加键盘处理。

```html
<!-- ❌ Non-interactive element with click only: not focusable, no keyboard activation -->
<div class="card" onclick="handleAction()">Open</div>

<!-- ✅ Best: use a native button -->
<button type="button" onclick="handleAction()">Open</button>
```

```javascript
// ✅ When you MUST use a non-interactive element (e.g. div with role="button"),
// make it focusable AND handle keyboard activation. Do NOT add this to a native
// <button> — Enter/Space already fire click, so you'd double-trigger.
element.setAttribute('role', 'button');
element.setAttribute('tabindex', '0');
element.addEventListener('click', handleAction);
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
});
```

**不得存在键盘陷阱。** 用户必须能够使用 Tab 键进入和离开每个组件。对话框应使用[模态框焦点陷阱模式](references/A11Y-PATTERNS.md#modal-focus-trap)——原生 `<dialog>` 元素会自动处理这一点。

### 焦点可见 (2.4.7)

```css
/* ❌ Never remove focus outlines */
*:focus { outline: none; }

/* ✅ Use :focus-visible for keyboard-only focus */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid currentColor; /* inherits text color → already contrast-checked */
  outline-offset: 2px;
}

/* ✅ Or pick a brand color and verify ≥3:1 contrast against every background it lands on */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5);
}
```

### 焦点不被遮挡（2.4.11）— 2.2 新增

当元素获得键盘焦点时，不得被其他由作者创建的内容（如粘性页眉、页脚或重叠面板）完全遮挡。在 AAA 级（2.4.12）中，获得焦点的元素任何部分都不得被遮挡。

```css
/* ✅ Account for sticky headers when scrolling to focused elements */
:target {
  scroll-margin-top: 80px;
}

/* ✅ Ensure focused items clear fixed/sticky bars */
:focus {
  scroll-margin-top: 80px;
  scroll-margin-bottom: 60px;
}
```

### 跳过链接（2.4.1）

提供跳过链接，使键盘用户可以绕过重复的导航。有关完整的标记和样式，请参阅[跳过链接模式](references/A11Y-PATTERNS.md#skip-link)。

### 目标尺寸（2.5.8）— 2.2 新增

交互目标必须至少为 **24 × 24 CSS 像素**（AA 级）。例外情况包括：行内文本链接、尺寸由浏览器控制的元素，以及以边界框为中心的 24px 圆不会与其他目标重叠的目标。

```css
/* ✅ Minimum target size */
button,
[role="button"],
input[type="checkbox"] + label,
input[type="radio"] + label {
  min-width: 24px;
  min-height: 24px;
}

/* ✅ Comfortable target size (recommended 44×44) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 拖动操作（2.5.7）— 2.2 新增

任何需要拖动的操作都必须提供单指针替代方式（例如按钮、输入控件）。有关可排序列表示例，请参阅[拖动操作模式](references/A11Y-PATTERNS.md#dragging-movements)。

### 时间限制（2.2）

```javascript
// Allow users to extend time limits
function showSessionWarning() {
  const modal = createModal({
    title: 'Session Expiring',
    content: 'Your session will expire in 2 minutes.',
    actions: [
      { label: 'Extend session', action: extendSession },
      { label: 'Log out', action: logout }
    ],
    timeout: 120000
  });
}
```

### 动效（2.3）

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 可理解

### 页面语言（3.1.1）

```html
<!-- ❌ No language specified -->
<html>

<!-- ✅ Language specified -->
<html lang="en">

<!-- ✅ Language changes within page -->
<p>The French word for hello is <span lang="fr">bonjour</span>.</p>
```

### 一致的导航（3.2.3）

```html
<!-- Navigation should be consistent across pages -->
<nav aria-label="Main">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### 一致的帮助（3.2.6）— 2.2 新增

如果某种帮助机制（联系信息、聊天小组件、常见问题链接、自助选项）在多个页面中重复出现，则每次都必须以**相同的相对顺序**出现。依赖一致位置的用户不应在每个页面上都费力寻找帮助。

### 表单标签 (3.3.2)

每个输入控件都需要一个以编程方式关联的标签。有关显式、隐式和说明性示例，请参阅[表单标签模式](references/A11Y-PATTERNS.md#form-labels)。

### 错误处理 (3.3.1, 3.3.3)

使用 `role="alert"` 或 `aria-live` 向屏幕阅读器播报错误，在无效字段上设置 `aria-invalid="true"`，并在提交时将焦点置于第一个错误处。有关完整的标记和 JS，请参阅[错误处理模式](references/A11Y-PATTERNS.md#error-handling)。

### 冗余输入 (3.3.7) — 2.2 新增

不要强制用户重新输入他们在同一会话中已经提供的信息。应根据之前的步骤自动填充，或允许用户从之前输入的值中进行选择。例外情况：出于安全目的的重新确认以及已过期的内容。

```html
<!-- ✅ Auto-fill shipping address from billing -->
<fieldset>
  <legend>Shipping address</legend>
  <label>
    <input type="checkbox" id="same-as-billing" checked>
    Same as billing address
  </label>
  <!-- Fields auto-populated when checked -->
</fieldset>
```

### 无障碍身份验证 (3.3.8) — 2.2 新增

登录流程不得依赖认知功能测试（例如记住密码、解谜），除非至少满足以下一项：
- 提供复制粘贴或自动填充机制
- 提供替代方法（例如通行密钥、SSO、电子邮件链接）
- 测试使用对象识别或个人内容（仅适用于 AA；AAA 取消了此例外）

```html
<!-- ✅ Allow paste in password fields -->
<input type="password" id="password" autocomplete="current-password">

<!-- ✅ Offer passwordless alternatives -->
<button type="button">Sign in with passkey</button>
<button type="button">Email me a login link</button>
```

---

## 健壮性

### ARIA 使用 (4.1.2)

**优先使用原生元素：**
```html
<!-- ❌ ARIA role on div -->
<div role="button" tabindex="0">Click me</div>

<!-- ✅ Native button -->
<button>Click me</button>

<!-- ❌ ARIA checkbox -->
<div role="checkbox" aria-checked="false">Option</div>

<!-- ✅ Native checkbox -->
<label><input type="checkbox"> Option</label>
```

**需要使用 ARIA 时，**请使用正确的角色和状态。有关完整的标签列表实例，请参阅 [ARIA 标签页模式](references/A11Y-PATTERNS.md#aria-tabs)。

### 实时区域 (4.1.3)

使用 `aria-live` 区域播报动态内容变化，而不移动焦点。有关标记和 `showNotification()` 辅助函数，请参阅[实时区域模式](references/A11Y-PATTERNS.md#live-regions-and-notifications)。

---

## 测试清单

### 自动化测试

优先使用实时 Lighthouse 审计，以便将渲染后未通过检查的节点直接返回给智能体。使用 Chrome DevTools MCP 时，可使用 `lighthouse_audit`。否则：

```bash
# Lighthouse accessibility audit
npx lighthouse https://example.com --only-categories=accessibility

# axe-core
npm install @axe-core/cli -g
axe https://example.com
```

### 手动测试

- [ ] **键盘导航：**使用 Tab 键遍历整个页面，使用 Enter/Space 激活
- [ ] **屏幕阅读器：**使用 VoiceOver (Mac)、NVDA (Windows) 或 TalkBack (Android) 进行测试
- [ ] **缩放：**内容在缩放至 200% 时仍可使用
- [ ] **高对比度：**使用 Windows 高对比度模式进行测试
- [ ] **减少动态效果：**使用 `prefers-reduced-motion: reduce` 进行测试
- [ ] **焦点顺序：**顺序合乎逻辑并与视觉顺序一致
- [ ] **目标尺寸：**交互式元素满足至少 24×24px 的要求

有关 VoiceOver 和 NVDA 的快捷键，请参阅[屏幕阅读器命令参考](references/A11Y-PATTERNS.md#screen-reader-commands)。

---

## 按影响程度分类的常见问题

### 严重（立即修复）
1. 表单缺少标签
2. 图片缺少替代文本
3. 颜色对比度不足
4. 键盘陷阱
5. 无焦点指示器

### 重大（发布前修复）
1. 缺少页面语言声明
2. 缺少标题结构
3. 链接文本描述不明确
4. 媒体自动播放
5. 缺少跳转链接

### 中等（尽快修复）
1. 图标缺少 ARIA 标签
2. 导航不一致
3. 缺少错误标识
4. 限时操作缺少控制选项
5. 缺少地标区域

## 参考资料

- [WCAG 2.2 快速参考](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA 创作实践](https://www.w3.org/WAI/ARIA/apg/)
- [Deque axe 规则](https://dequeuniversity.com/rules/axe/)
- [Web 质量审计](../web-quality-audit/SKILL.md)
- [WCAG 标准参考](references/WCAG.md)
- [无障碍代码模式](references/A11Y-PATTERNS.md)