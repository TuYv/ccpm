---
name: pwa-development
description: Progressive Web Apps - service workers, caching strategies, offline, Workbox
when-to-use: When building PWA features - service workers, caching, offline support
user-invocable: false
paths: ["**/sw.*", "**/service-worker.*", "**/workbox-config.*", "**/manifest.json"]
effort: medium
---
# PWA 开发技能


**目的：** 构建可离线工作、能像原生应用一样安装，并在所有设备上提供快速、可靠体验的渐进式 Web 应用。

---

## PWA 核心要求

```
┌─────────────────────────────────────────────────────────────────┐
│  THE THREE PILLARS OF PWA                                       │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  1. HTTPS                                                       │
│     Required for service workers and security.                  │
│     localhost allowed for development.                          │
│                                                                 │
│  2. SERVICE WORKER                                              │
│     JavaScript that runs in background.                         │
│     Enables offline, caching, push notifications.               │
│                                                                 │
│  3. WEB APP MANIFEST                                            │
│     JSON file describing app metadata.                          │
│     Enables installation and app-like experience.               │
├─────────────────────────────────────────────────────────────────┤
│  INSTALLABILITY CRITERIA (Chrome)                               │
│  ─────────────────────────────────────────────────────────────  │
│  • HTTPS (or localhost)                                         │
│  • Service worker with fetch handler                            │
│  • Web app manifest with: name, icons (192px + 512px),          │
│    start_url, display: standalone/fullscreen/minimal-ui         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Web 应用清单

### 必填字段

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "description": "A description of what the app does",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 增强型清单（完整功能）

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "description": "A full-featured PWA",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#3367D6",
  "dir": "ltr",
  "lang": "en",
  "categories": ["productivity", "utilities"],

  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],

  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],

  "shortcuts": [
    {
      "name": "New Item",
      "short_name": "New",
      "description": "Create a new item",
      "url": "/new?source=shortcut",
      "icons": [{ "src": "/icons/shortcut-new.png", "sizes": "192x192" }]
    }
  ],

  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [{ "name": "files", "accept": ["image/*"] }]
    }
  },

  "protocol_handlers": [
    {
      "protocol": "web+myapp",
      "url": "/handle?url=%s"
    }
  ],

  "file_handlers": [
    {
      "action": "/open-file",
      "accept": {
        "text/plain": [".txt"]
      }
    }
  ]
}
```

### Manifest 检查清单

- [ ] 已定义 `name` 和 `short_name`
- [ ] 已设置 `start_url`（使用查询参数进行分析）
- [ ] `display` 已设置为 `standalone` 或 `fullscreen`
- [ ] 图标：至少包含 192x192 和 512x512
- [ ] 包含用于 Android 自适应图标的可遮罩图标
- [ ] `theme_color` 与应用设计一致
- [ ] 设置用于启动画面的 `background_color`
- [ ] 用于丰富安装界面的屏幕截图（可选）
- [ ] 用于快捷操作的快捷方式（可选）

---

## Service Worker 模式

### 基础 Service Worker

```javascript
// sw.js
const CACHE_NAME = 'app-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/offline.html'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

### 注册

```javascript
// main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('SW registered:', registration.scope);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}
```

---

## 缓存策略

### 策略选择指南

| 策略 | 使用场景 | 说明 |
|----------|----------|-------------|
| **缓存优先** | 静态资源（CSS、JS、图像） | 先检查缓存，未命中时回退到网络 |
| **网络优先** | API 响应、动态内容 | 先尝试网络，失败时回退到缓存 |
| **使用旧缓存并在后台重新验证** | 半静态内容（头像、文章） | 立即返回缓存，并在后台更新 |
| **仅网络** | 不可缓存的请求（分析） | 始终使用网络 |
| **仅缓存** | 仅离线资源 | 仅从缓存提供 |

### 缓存优先（离线优先）

```javascript
// Best for: Static assets that rarely change
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
            return response;
          });
        })
    );
  }
});
```

### 网络优先（优先获取最新内容）

```javascript
// Best for: API data, frequently updated content
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### 缓存优先，同时在后台重新验证

```javascript
// Best for: Content that's okay to be slightly outdated
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/articles/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
          return cached || fetchPromise;
        });
      })
    );
  }
});
```

---

## Workbox（推荐）

### 为什么选择 Workbox？

- 经过实战检验的缓存策略
- 支持修订版本管理的预缓存
- 为离线表单提供后台同步
- 自动清理缓存
- 支持 TypeScript

### 安装

```bash
npm install workbox-webpack-plugin  # Webpack
npm install @vite-pwa/vite-plugin   # Vite
```

### 将 Workbox 与 Vite 配合使用

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
};
```

### Workbox 手动配置 Service Worker

```javascript
// sw.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache static assets (generated by build tool)
precacheAndRoute(self.__WB_MANIFEST);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);

// Cache page navigations
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);
```

---

## 离线体验

### 离线页面

```html
<!-- offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - App Name</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .offline-content {
      text-align: center;
      padding: 2rem;
    }
    .offline-icon { font-size: 4rem; }
    h1 { color: #333; }
    p { color: #666; }
    button {
      background: #3367D6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <div class="offline-content">
    <div class="offline-icon">📡</div>
    <h1>You're offline</h1>
    <p>Check your connection and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>
```

### 离线检测

```javascript
// Online/offline status handling
function updateOnlineStatus() {
  const status = navigator.onLine ? 'online' : 'offline';
  document.body.dataset.connectionStatus = status;

  if (!navigator.onLine) {
    showNotification('You are offline. Some features may be unavailable.');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
```

### 后台同步（将离线操作加入队列）

```javascript
// sw.js with Workbox
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

const bgSyncPlugin = new BackgroundSyncPlugin('formQueue', {
  maxRetentionTime: 24 * 60 // Retry for 24 hours
});

registerRoute(
  ({ url }) => url.pathname === '/api/submit',
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);
```

```javascript
// main.js - Queue form submission
async function submitForm(data) {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    // Will be retried by background sync when online
    showNotification('Saved offline. Will sync when connected.');
  }
}
```

---

## 类应用功能

### 安装提示

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

async function installApp() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install`);
  deferredPrompt = null;
  hideInstallButton();
}

window.addEventListener('appinstalled', () => {
  console.log('App installed');
  deferredPrompt = null;
});
```

### 检测独立模式

```javascript
// Check if running as installed PWA
function isInstalledPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true; // iOS
}

// Listen for display mode changes
window.matchMedia('(display-mode: standalone)')
  .addEventListener('change', (e) => {
    console.log('Display mode:', e.matches ? 'standalone' : 'browser');
  });
```

### 推送通知

```javascript
// Request permission
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await subscribeToPush();
  }
  return permission;
}

// Subscribe to push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}

// sw.js - Handle push events
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url }
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### 共享目标

```javascript
// sw.js - Handle share target
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/share') &&
      event.request.method === 'POST') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const title = formData.get('title');
      const text = formData.get('text');
      const url = formData.get('url');

      // Store or process shared content
      // Redirect to app with shared data
      return Response.redirect(`/?shared=true&title=${encodeURIComponent(title)}`);
    })());
  }
});
```

---

## 性能优化

### 关键渲染路径

```html
<!-- Inline critical CSS -->
<style>
  /* Critical above-the-fold styles */
</style>

<!-- Preload important resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/scripts/app.js" as="script">

<!-- Defer non-critical CSS -->
<link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
```

### 图像优化

```html
<!-- Responsive images -->
<img
  src="/images/hero-800.webp"
  srcset="
    /images/hero-400.webp 400w,
    /images/hero-800.webp 800w,
    /images/hero-1200.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero image"
  loading="lazy"
  decoding="async"
>

<!-- Modern formats with fallback -->
<picture>
  <source srcset="/images/hero.avif" type="image/avif">
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="Hero image" loading="lazy">
</picture>
```

### 代码拆分

```javascript
// Dynamic imports for route-based splitting
const routes = {
  '/': () => import('./pages/Home.js'),
  '/about': () => import('./pages/About.js'),
  '/settings': () => import('./pages/Settings.js')
};

async function loadPage(path) {
  const loader = routes[path];
  if (loader) {
    const module = await loader();
    return module.default;
  }
}
```

---

## 测试 PWA

### Lighthouse 审计

```bash
# Run Lighthouse from CLI
npx lighthouse https://your-app.com --view

# Key metrics to check:
# - PWA badge (installable, offline-ready)
# - Performance score
# - Best practices
# - Accessibility
```

### 手动测试检查清单

- [ ] **可安装性**
  - [ ] 桌面版 Chrome 上会出现安装提示
  - [ ] 可以添加到移动设备主屏幕
  - [ ] 安装后，应用以独立模式打开

- [ ] **离线支持**
  - [ ] 离线时（飞行模式）应用可以加载
  - [ ] 缓存的页面可以正确显示
  - [ ] 对于未缓存的路由，会显示离线后备页面
  - [ ] 恢复在线后，后台同步正常工作

- [ ] **性能**
  - [ ] 首次内容绘制 < 1.8s
  - [ ] 最大内容绘制 < 2.5s
  - [ ] 可交互时间 < 3.8s
  - [ ] 累积布局偏移 < 0.1

- [ ] **Service Worker**
  - [ ] SW 注册成功
  - [ ] 安装时缓存静态资源
  - [ ] SW 可以正确更新（新版本）
  - [ ] 不存在陈旧缓存问题

- [ ] **Manifest**
  - [ ] 所有必填字段均已提供
  - [ ] 图标显示正确
  - [ ] 主题颜色已应用
  - [ ] 启动时显示启动画面

### 测试 Service Worker 更新

```javascript
// Force update check
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.update();
  });
}

// Listen for updates
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // New service worker activated
  window.location.reload();
});
```

---

## 项目结构

```
project/
├── public/
│   ├── manifest.json           # Web app manifest
│   ├── sw.js                   # Service worker (if not bundled)
│   ├── offline.html            # Offline fallback page
│   ├── robots.txt
│   └── icons/
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png
│       ├── icon-384.png
│       ├── icon-512.png
│       ├── icon-maskable.png   # For adaptive icons
│       ├── apple-touch-icon.png
│       └── favicon.ico
├── src/
│   ├── sw.js                   # Service worker source (if bundled)
│   ├── pwa/
│   │   ├── install.js          # Install prompt handling
│   │   ├── offline.js          # Offline detection
│   │   └── push.js             # Push notification handling
│   └── ...
└── tests/
    └── pwa/
        ├── manifest.test.js
        ├── sw.test.js
        └── offline.test.js
```

---

## 常见错误

| 错误 | 修复方法 |
|---------|-----|
| 缺少可遮罩图标 | 添加带有 `"purpose": "maskable"` 的图标 |
| 没有离线后备页面 | 创建 `offline.html` 并对其进行缓存 |
| 缓存永不过期 | 使用 Workbox 的 `ExpirationPlugin` |
| SW 缓存过于激进 | 根据资源类型使用适当的策略 |
| 没有更新机制 | 实现 `skipWaiting()` + 重新加载提示 |
| 安装提示失效 | 确保 manifest 满足所有条件 |
| 生产环境中未使用 HTTPS | 配置 SSL 证书 |
| 缓存过大 | 设置 `maxEntries` 和 `maxAgeSeconds` |
| API 响应陈旧 | 对动态数据使用 `NetworkFirst` |
| 缺少 start_url 跟踪 | 添加查询参数：`/?source=pwa` |

---

## PWA 开发检查清单

### 发布前

- [ ] 已配置 HTTPS（生产环境）
- [ ] Manifest 完整，包含所有必填字段
- [ ] 已提供所有必需尺寸的图标（192、512、maskable）
- [ ] Service worker 已注册并正常工作
- [ ] 已创建并缓存离线页面
- [ ] 已为所有资源类型定义缓存策略
- [ ] 已实现安装提示处理
- [ ] 通过 Lighthouse PWA 审核

### 发布后

- [ ] 监控缓存大小
- [ ] 测试 SW 更新不会导致应用无法运行
- [ ] 通过分析工具跟踪 PWA 安装情况
- [ ] 在多种设备/浏览器上进行测试
- [ ] 监控 Core Web Vitals
- [ ] 设置推送通知流程（如需要）

---

## 特定框架指南

### Next.js

```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Your Next.js config
});
```

### Create React App

```bash
# CRA 4+ has PWA support built-in
npx create-react-app my-pwa --template cra-template-pwa
```

### Vite（任意框架）

```bash
npm install vite-plugin-pwa -D
```

有关配置，请参阅上文的 Workbox 与 Vite 章节。

---

## 快速参考

### 缓存策略速查表

```
Static Assets (CSS, JS, images)     → Cache First
API Responses                        → Network First
User-generated content              → Stale While Revalidate
Analytics, non-cacheable            → Network Only
Offline-only assets                 → Cache Only
```

### Manifest 最低要求

```json
{
  "name": "App Name",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker 生命周期

```
1. Register → 2. Install → 3. Activate → 4. Fetch
     ↓              ↓            ↓           ↓
  Load app    Cache assets  Clean old   Serve requests
                            caches      from cache/network
```