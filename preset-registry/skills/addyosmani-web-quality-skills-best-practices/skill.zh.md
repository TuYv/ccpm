---
name: best-practices
description: Apply modern web development best practices for security, compatibility, and code quality. Use when asked to "apply best practices", "security audit", "modernize code", "code quality review", or "check for vulnerabilities".
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---
# 最佳实践

基于 Lighthouse 最佳实践审计的现代 Web 开发标准。涵盖安全性、浏览器兼容性和代码质量模式。

## 证据驱动的审计工作流

当渲染后的页面可用时：

1. 在具备相应能力时，运行实时 Lighthouse 最佳实践审计；使用 Chrome DevTools MCP 时，请使用 `lighthouse_audit`。正常页面加载使用导航模式，必须保留当前状态时使用快照模式。
2. 检查列出的控制台和网络故障，仅在其能够支持某项发现时获取具体详情。
3. 使用依赖项、响应头、配置和源代码检查来补充运行时证据；Lighthouse 并非完整的安全评估工具。
4. 修复相关代码，重新运行相同的审计，并将安全性发现与风格偏好分开处理。

如果实时工具不可用，请使用 Lighthouse CLI，并结合有针对性的依赖项和响应头检查。切勿将 Lighthouse 高分作为应用程序安全的证明。

## 安全性

当安全性属于评估范围，或实时审计发现相关故障时，请阅读[安全参考](references/SECURITY.md)。其中涵盖 HTTPS/HSTS、CSP 和 Trusted Types、子资源完整性、响应头、依赖项、清理以及 Cookie。

最低要求：

* **使用 HTTPS，且不得包含混合内容。** 只有在确认所有相关子域都支持 HTTPS 后，才添加 HSTS。
* **将严格的 CSP 视为纵深防御措施。** 优先使用 nonce 或哈希，并在强制执行之前使用仅报告模式进行测试。
* **清理不受信任的 HTML，并保护 DOM XSS 接收点。** 不需要标记时，优先使用文本 API。
* **固定并审查第三方代码。** 在交付模型支持的情况下使用 SRI，并及时修补依赖项。
* **在运行时验证响应头。** 仅凭源配置无法证明已部署页面实际发送了哪些内容。

## 浏览器兼容性

### Doctype 声明

```html
<!-- ❌ Missing or invalid doctype -->
<HTML>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">

<!-- ✅ HTML5 doctype -->
<!DOCTYPE html>
<html lang="en">
```

### 字符编码

```html
<!-- ❌ Missing or late charset -->
<html>
<head>
  <title>Page</title>
  <meta charset="UTF-8">
</head>

<!-- ✅ Charset as first element in head -->
<html>
<head>
  <meta charset="UTF-8">
  <title>Page</title>
</head>
```

### Viewport meta 标签

```html
<!-- ❌ Missing viewport -->
<head>
  <title>Page</title>
</head>

<!-- ✅ Responsive viewport -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page</title>
</head>
```

### 特性检测

```javascript
// ❌ Browser detection (brittle)
if (navigator.userAgent.includes('Chrome')) {
  // Chrome-specific code
}

// ✅ Feature detection
if ('IntersectionObserver' in window) {
  // Use IntersectionObserver
} else {
  // Fallback
}

// ✅ Using @supports in CSS
@supports (display: grid) {
  .container {
    display: grid;
  }
}

@supports not (display: grid) {
  .container {
    display: flex;
  }
}
```

### Polyfill（按需使用）

优先选择**在构建时打包 polyfill**（Babel/SWC + `core-js`，或 `@vitejs/plugin-legacy`），并根据你所支持的浏览器列表确定目标范围。这样可以完全消除运行时检查，也能避免向现代浏览器发送 polyfill 字节。

如果必须在运行时加载 polyfill，请追加一个 script 元素——绝不要使用 `document.write`（它会阻塞解析器，并且在 async/deferred 上下文中无法正常工作）：

```html
<script>
  if (!('fetch' in window)) {
    const s = document.createElement('script');
    s.src = '/polyfills/fetch.js';
    s.defer = true;
    document.head.appendChild(s);
  }
</script>
```

**绝不要从你无法控制的第三方 CDN 加载 polyfill。** `polyfill.io` 服务曾在 [2024 年年中遭到入侵](https://sansec.io/research/polyfill-supply-chain-attack)，攻击者通过供应链攻击利用该服务向约 10 万个网站投放恶意软件。请自行托管，或使用经过审查的镜像（例如 [Cloudflare 的 `cdnjs` polyfill 构建版本](https://blog.cloudflare.com/polyfill-io-now-available-on-cdnjs-reduce-your-supply-chain-risk/)）——并使用[子资源完整性](#subresource-integrity-sri-for-third-party-scripts)固定版本。

---

## 已弃用的 API

### 避免使用以下 API

```javascript
// ❌ document.write (blocks parsing)
document.write('<script src="..."></script>');

// ✅ Dynamic script loading
const script = document.createElement('script');
script.src = '...';
document.head.appendChild(script);

// ❌ Synchronous XHR (blocks main thread)
const xhr = new XMLHttpRequest();
xhr.open('GET', url, false); // false = synchronous

// ✅ Async fetch
const response = await fetch(url);

// ❌ Application Cache (deprecated)
<html manifest="cache.manifest">

// ✅ Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 被动事件监听器

```javascript
// ❌ Non-passive touch/wheel (may block scrolling)
element.addEventListener('touchstart', handler);
element.addEventListener('wheel', handler);

// ✅ Passive listeners (allows smooth scrolling)
element.addEventListener('touchstart', handler, { passive: true });
element.addEventListener('wheel', handler, { passive: true });

// ✅ If you need preventDefault, be explicit
element.addEventListener('touchstart', handler, { passive: false });
```

---

## 控制台与错误

### 不得出现控制台错误

```javascript
// ❌ Errors in production
console.log('Debug info'); // Remove in production
throw new Error('Unhandled'); // Catch all errors

// ✅ Proper error handling
try {
  riskyOperation();
} catch (error) {
  // Log to error tracking service
  errorTracker.captureException(error);
  // Show user-friendly message
  showErrorMessage('Something went wrong. Please try again.');
}
```

### 错误边界（React）

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    errorTracker.captureException(error, { extra: info });
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 全局错误处理器

```javascript
// Catch unhandled errors
window.addEventListener('error', (event) => {
  errorTracker.captureException(event.error);
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorTracker.captureException(event.reason);
});
```

---

## Source map

### 生产环境配置

```javascript
// ❌ Source maps exposed in production
// webpack.config.js
module.exports = {
  devtool: 'source-map', // Exposes source code
};

// ✅ Hidden source maps (uploaded to error tracker)
module.exports = {
  devtool: 'hidden-source-map',
};

// ✅ Or no source maps in production
module.exports = {
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
};
```

上传到错误跟踪器时，**请从生产环境的 source map 中移除 `sourcesContent`**。默认情况下，打包工具会将完整的原始源代码嵌入 `.map` 文件中——任何获取该 source map 的人（包括因上传步骤配置错误而获得它的人）都会得到未经压缩的代码。请配置打包工具以省略 `sourcesContent`，或在上传时使用具备此功能的 Sentry/Bugsnag CLI 标志。

对于 Vite，优先使用 `sourcemap: 'hidden'`，而不是 `'true'`，以避免在 bundle 中生成 `//# sourceMappingURL=` 注释。

---

## 性能最佳实践

### 避免阻塞模式

```javascript
// ❌ Blocking script
<script src="heavy-library.js"></script>

// ✅ Deferred script
<script defer src="heavy-library.js"></script>

// ❌ Blocking CSS import
@import url('other-styles.css');

// ✅ Link tags (parallel loading)
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="other-styles.css">
```

### 高效的事件处理器

```javascript
// ❌ Handler on every element
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

// ✅ Event delegation
container.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e);
  }
});
```

### 内存管理

```javascript
// ❌ Memory leak (never removed)
const handler = () => { /* ... */ };
window.addEventListener('resize', handler);

// ✅ Cleanup when done
const handler = () => { /* ... */ };
window.addEventListener('resize', handler);

// Later, when component unmounts:
window.removeEventListener('resize', handler);

// ✅ Using AbortController
const controller = new AbortController();
window.addEventListener('resize', handler, { signal: controller.signal });

// Cleanup:
controller.abort();
```

---

## 代码质量

### 有效的 HTML

```html
<!-- ❌ Invalid HTML -->
<div id="header">
<div id="header"> <!-- Duplicate ID -->

<ul>
  <div>Item</div> <!-- Invalid child -->
</ul>

<a href="/"><button>Click</button></a> <!-- Invalid nesting -->

<!-- ✅ Valid HTML -->
<header id="site-header">
</header>

<ul>
  <li>Item</li>
</ul>

<a href="/" class="button">Click</a>
```

### 语义化 HTML

```html
<!-- ❌ Non-semantic -->
<div class="header">
  <div class="nav">
    <div class="nav-item">Home</div>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="title">Headline</div>
  </div>
</div>

<!-- ✅ Semantic HTML5 -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <article>
    <h1>Headline</h1>
  </article>
</main>
```

### 图片宽高比

```html
<!-- ❌ Distorted images -->
<img src="photo.jpg" width="300" height="100">
<!-- If actual ratio is 4:3, this squishes the image -->

<!-- ✅ Preserve aspect ratio -->
<img src="photo.jpg" width="300" height="225">
<!-- Actual 4:3 dimensions -->

<!-- ✅ CSS object-fit for flexibility -->
<img src="photo.jpg" style="width: 300px; height: 200px; object-fit: cover;">
```

---

## 权限与隐私

### 正确请求权限

```javascript
// ❌ Request on page load (bad UX, often denied)
navigator.geolocation.getCurrentPosition(success, error);

// ✅ Request in context, after user action
findNearbyButton.addEventListener('click', async () => {
  // Explain why you need it
  if (await showPermissionExplanation()) {
    navigator.geolocation.getCurrentPosition(success, error);
  }
});
```

### 权限策略

```html
<!-- Restrict powerful features -->
<meta http-equiv="Permissions-Policy" 
      content="geolocation=(), camera=(), microphone=()">

<!-- Or allow for specific origins -->
<meta http-equiv="Permissions-Policy" 
      content="geolocation=(self 'https://maps.example.com')">
```

---

## 审计检查清单

### 安全性（关键）
- [ ] 已启用 HTTPS，无混合内容
- [ ] 无存在漏洞的依赖项（`npm audit`）
- [ ] 已配置 CSP 标头（包含 `frame-ancestors`、`base-uri`、`form-action`）
- [ ] 已强制执行 `require-trusted-types-for 'script'`（或在推出期间仅报告）
- [ ] 第三方 `<script>`/`<link rel="stylesheet">` 已使用 SRI 哈希固定
- [ ] 已设置安全标头（HSTS、X-Content-Type-Options、Referrer-Policy）
- [ ] 未暴露源映射（且已从上传的源映射中移除 `sourcesContent`）

### 兼容性
- [ ] 使用有效的 HTML5 文档类型声明
- [ ] 字符集声明位于 head 中的首位
- [ ] 已设置 viewport meta 标签
- [ ] 未使用已弃用的 API
- [ ] 滚动/触摸事件使用被动事件监听器

### 代码质量
- [ ] 无控制台错误
- [ ] HTML 有效（无重复 ID）
- [ ] 使用语义化 HTML 元素
- [ ] 正确处理错误
- [ ] 组件中已进行内存清理

### 用户体验
- [ ] 无侵入式插页
- [ ] 在适当的上下文中请求权限
- [ ] 错误消息清晰
- [ ] 图片宽高比适当

## 工具

| 工具 | 用途 |
|------|---------|
| `npm audit` | 检查依赖项漏洞 |
| [SecurityHeaders.com](https://securityheaders.com) | 标头分析 |
| [W3C Validator](https://validator.w3.org) | HTML 验证 |
| 实时 Lighthouse 审计（Chrome DevTools MCP：`lighthouse_audit`） | 面向智能体的已渲染最佳实践检查 |
| Lighthouse CLI | 最佳实践审计的备用方案 |
| [Observatory](https://observatory.mozilla.org) | 安全扫描 |

## 参考资料

- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Quality Audit](../web-quality-audit/SKILL.md)