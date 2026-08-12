---
name: best-practices
description: Apply modern web development best practices for security, compatibility, and code quality. Use when asked to "apply best practices", "security audit", "modernize code", "code quality review", or "check for vulnerabilities".
license: MIT
metadata:
  author: web-quality-skills
  version: "1.0"
---
# 最佳实践

基于 Lighthouse 最佳实践审计的现代 Web 开发标准。涵盖安全性、浏览器兼容性和代码质量模式。

## 安全性

### 全面使用 HTTPS

**强制使用 HTTPS：**
```html
<!-- ❌ Mixed content -->
<img src="http://example.com/image.jpg">
<script src="http://cdn.example.com/script.js"></script>

<!-- ✅ HTTPS only -->
<img src="https://example.com/image.jpg">
<script src="https://cdn.example.com/script.js"></script>
```

避免使用协议相对 URL（`//example.com/...`）——它们是 HTTP 时代的模式，在仅使用 HTTPS 的网站上没有任何好处，而且会向审查者隐藏实际使用的协议。

**HSTS 标头：**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 内容安全策略（CSP）

```html
<!-- Basic CSP via meta tag -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://trusted-cdn.com; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.example.com;">

<!-- Better: HTTP header -->
```

**CSP 标头（推荐）：**
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-abc123' https://trusted.com;
  style-src 'self' 'nonce-abc123';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
```

**为内联脚本使用 nonce：**
```html
<script nonce="abc123">
  // This inline script is allowed
</script>
```

### Trusted Types（现代 DOM-XSS 防御机制）

严格的 CSP 会阻止加载不受信任的*脚本文件*，但它无法阻止字符串进入 `innerHTML`、`eval` 或其他 DOM-XSS 接收点。Trusted Types——自 2026 年初起已成为所有主流浏览器的基线特性——通过让这些接收点拒绝原始字符串，并且仅接受由命名策略生成的类型化对象来填补这一漏洞。

```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types default;
```

```javascript
// One central policy that does the sanitization
const escape = trustedTypes.createPolicy('default', {
  createHTML: (s) => DOMPurify.sanitize(s, { RETURN_TRUSTED_TYPE: true })
});

// ❌ This now throws TypeError under enforcement
element.innerHTML = userInput;

// ✅ Goes through the policy
element.innerHTML = escape.createHTML(userInput);
```

首先使用 `Content-Security-Policy-Report-Only` 部署，以找出应用中每一处接收点用法，然后再切换为强制执行模式。Angular 内置了 Trusted Types 支持；启用 Trusted Types 强制执行时，React 19+ 会生成 TrustedHTML；对于其他所有情况，[DOMPurify](https://github.com/cure53/DOMPurify) 是事实上的标准净化器。

### 为第三方脚本使用子资源完整性（SRI）

对于从不受你控制的 CDN 加载的每个 `<script>` 和 `<link rel="stylesheet">`，都应固定其版本和哈希。如果 CDN 遭到入侵——正如 2024 年 polyfill.io 事件中发生的那样——浏览器会拒绝执行哈希不匹配的文件。

```html
<script src="https://cdn.example.com/lib@1.2.3/dist/lib.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

`integrity` 接受以空格分隔的哈希值；轮换版本前，请加入下一版本的哈希值以避免停机。使用 `openssl dgst -sha384 -binary file.js | openssl base64 -A` 生成。SRI 要求 CDN 返回包含 `crossorigin` 和 `Access-Control-Allow-Origin` 的响应头。

### 安全响应头

```
# Prevent clickjacking — prefer CSP `frame-ancestors` (above); X-Frame-Options
# is the legacy fallback for older browsers.
X-Frame-Options: DENY

# Prevent MIME type sniffing
X-Content-Type-Options: nosniff

# Do NOT send X-XSS-Protection. The legacy browser XSS auditor was deprecated
# and removed (Chrome 78, Edge 17), and in some cases it introduced its own
# vulnerabilities. Use a strict CSP + Trusted Types (below) instead.

# Control referrer information
Referrer-Policy: strict-origin-when-cross-origin

# Permissions policy (formerly Feature-Policy)
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 不使用存在漏洞的库

```bash
# Check for vulnerabilities
npm audit
yarn audit

# Auto-fix when possible
npm audit fix

# Check specific package
npm ls lodash
```

**保持依赖项为最新版本：**
```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "update": "npm update && npm audit fix"
  }
}
```

**应避免的已知漏洞模式：**
```javascript
// ❌ Recursive merges of untrusted input can pollute Object.prototype
//    via __proto__, constructor, or prototype keys.
_.merge(target, userInput);          // lodash <4.17.20
$.extend(true, {}, target, userInput); // jQuery deep extend
Object.assign(target, ...userInputs); // safe by itself (shallow), but unsafe
                                      // when target IS Object.prototype-derived
                                      // and userInput contains __proto__

// ✅ For untrusted bags, use a null-prototype object so __proto__ is just a key
const safe = Object.create(null);
Object.assign(safe, userInput); // shallow, no recursion → safe by construction

// ✅ For deep copies, structuredClone drops __proto__ and functions
const deepSafe = structuredClone(userInput);

// ✅ For deep merges, use a library that explicitly blocks dangerous keys
//    (e.g. lodash ≥4.17.21 _.mergeWith with a customizer, or deepmerge-ts).
```

### 输入净化

```javascript
// ❌ XSS vulnerable
element.innerHTML = userInput;
document.write(userInput);

// ✅ Safe text content
element.textContent = userInput;

// ✅ If HTML needed, sanitize
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 安全 Cookie

```javascript
// ❌ Insecure cookie
document.cookie = "session=abc123";

// ✅ Secure cookie (server-side)
Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Strict; Path=/
```

---

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

### Polyfill（需要时）

优先选择**在构建时打包 polyfill**（Babel/SWC + `core-js`，或 `@vitejs/plugin-legacy`），并根据你支持的浏览器列表确定目标。这可以完全消除运行时检查，并避免向现代浏览器发送 polyfill 字节。

如果必须在运行时加载 polyfill，请追加一个 script 元素——绝不要使用 `document.write`（它会阻塞解析器，并且在异步/延迟执行的上下文中无法正常工作）：

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

**绝不要从你无法控制的第三方 CDN 加载 polyfill。** `polyfill.io` 服务曾在[2024 年年中遭到入侵](https://sansec.io/research/polyfill-supply-chain-attack)，攻击者利用供应链攻击向约 10 万个网站投放恶意软件。请自行托管，或使用经过审查的镜像（例如 [Cloudflare 的 `cdnjs` polyfill 构建版本](https://blog.cloudflare.com/polyfill-io-now-available-on-cdnjs-reduce-your-supply-chain-risk/)）——并使用[子资源完整性](#subresource-integrity-sri-for-third-party-scripts)固定版本。

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

### 事件监听器的 passive 选项

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

### 无控制台错误

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

### 全局错误处理程序

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

上传到错误跟踪服务时，**请从生产环境的 source map 中移除 `sourcesContent`**。默认情况下，打包工具会将完整的原始源代码嵌入 `.map` 文件中——任何获得该 source map 的人（包括通过配置错误的上传步骤获取的人）都能得到未经压缩的代码。请配置打包工具以省略 `sourcesContent`，或在上传时使用能够执行此操作的 Sentry/Bugsnag CLI 标志。

对于 Vite，优先使用 `sourcemap: 'hidden'`，而不是 `'true'`，这样就不会在 bundle 中生成 `//# sourceMappingURL=` 注释。

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

### 高效的事件处理程序

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

### 图像宽高比

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
- [ ] 无易受攻击的依赖项（`npm audit`）
- [ ] 已配置 CSP 标头（包含 `frame-ancestors`、`base-uri`、`form-action`）
- [ ] 已强制执行 `require-trusted-types-for 'script'`（或在推广期间仅报告）
- [ ] 第三方 `<script>`/`<link rel="stylesheet">` 已使用 SRI 哈希固定
- [ ] 已设置安全标头（HSTS、X-Content-Type-Options、Referrer-Policy）
- [ ] 未暴露源映射（并且已从上传的源映射中移除 `sourcesContent`）

### 兼容性
- [ ] 有效的 HTML5 doctype
- [ ] 在 head 中首先声明字符集
- [ ] 已设置 viewport meta 标签
- [ ] 未使用已弃用的 API
- [ ] 滚动/触摸事件使用被动事件监听器

### 代码质量
- [ ] 无控制台错误
- [ ] HTML 有效（无重复 ID）
- [ ] 使用语义化 HTML 元素
- [ ] 正确处理错误
- [ ] 组件中进行了内存清理

### 用户体验
- [ ] 无侵入式插页
- [ ] 在适当情境下请求权限
- [ ] 错误消息清晰
- [ ] 图像宽高比适当

## 工具

| 工具 | 用途 |
|------|---------|
| `npm audit` | 依赖项漏洞 |
| [SecurityHeaders.com](https://securityheaders.com) | 标头分析 |
| [W3C Validator](https://validator.w3.org) | HTML 验证 |
| Lighthouse | 最佳实践审计 |
| [Observatory](https://observatory.mozilla.org) | 安全扫描 |

## 参考资料

- [MDN Web 安全](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP 十大安全风险](https://owasp.org/www-project-top-ten/)
- [Web 质量审计](../web-quality-audit/SKILL.md)