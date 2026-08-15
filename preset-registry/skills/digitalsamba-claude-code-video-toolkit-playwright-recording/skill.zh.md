---
name: playwright-recording
description: Record browser interactions as video using Playwright. Use for capturing demo videos, app walkthroughs, and UI flows for Remotion videos. Triggers include recording a demo, capturing browser video, screen recording a website, or creating walkthrough footage.
---
# Playwright 视频录制

Playwright 可以将浏览器交互录制为视频，非常适合用作 Remotion 合成中的演示素材。

## 快速开始

### 安装

```bash
# In your video project
npm init -y
npm install -D playwright @playwright/test
npx playwright install chromium
```

### 基础录制脚本

```typescript
// scripts/record-demo.ts
import { chromium } from 'playwright';

async function recordDemo() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './recordings',
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  // Your recording actions
  await page.goto('https://example.com');
  await page.waitForTimeout(2000);
  await page.click('button.demo');
  await page.waitForTimeout(3000);

  // Close to save video
  await context.close();
  await browser.close();

  console.log('Recording saved to ./recordings/');
}

recordDemo();
```

运行方式：
```bash
npx ts-node scripts/record-demo.ts
# or
npx tsx scripts/record-demo.ts
```

## 录制配置

### 视口尺寸

```typescript
// Standard 1080p (recommended for Remotion)
viewport: { width: 1920, height: 1080 }

// 720p (smaller files)
viewport: { width: 1280, height: 720 }

// Square (social media)
viewport: { width: 1080, height: 1080 }

// Mobile
viewport: { width: 390, height: 844 } // iPhone 14
```

### 视频质量设置

```typescript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: {
    dir: './recordings',
    size: { width: 1920, height: 1080 } // Match viewport for crisp output
  },
  // Slow down for visibility
  // Note: slowMo is on browser launch, not context
});

// For slow motion, launch browser with slowMo
const browser = await chromium.launch({
  slowMo: 100 // 100ms delay between actions
});
```

## 录制模式

### 表单提交演示

```typescript
import { chromium } from 'playwright';

async function recordFormDemo() {
  const browser = await chromium.launch({ slowMo: 50 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './recordings', size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();

  await page.goto('https://myapp.com/form');
  await page.waitForTimeout(1000);

  // Type with realistic speed
  await page.fill('#name', 'John Smith', { timeout: 5000 });
  await page.waitForTimeout(500);

  await page.fill('#email', 'john@example.com');
  await page.waitForTimeout(500);

  // Click submit
  await page.click('button[type="submit"]');

  // Wait for result
  await page.waitForSelector('.success-message');
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();
}
```

### 多页面导航

```typescript
async function recordNavDemo() {
  const browser = await chromium.launch({ slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './recordings', size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();

  // Page 1
  await page.goto('https://myapp.com');
  await page.waitForTimeout(2000);

  // Navigate to page 2
  await page.click('nav a[href="/features"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Navigate to page 3
  await page.click('nav a[href="/pricing"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();
}
```

### 滚动演示

```typescript
async function recordScrollDemo() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './recordings', size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();

  await page.goto('https://myapp.com/long-page');
  await page.waitForTimeout(1000);

  // Smooth scroll
  await page.evaluate(async () => {
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 10; i++) {
      window.scrollBy({ top: 200, behavior: 'smooth' });
      await delay(300);
    }
  });

  await page.waitForTimeout(1000);
  await context.close();
  await browser.close();
}
```

### 登录流程

```typescript
async function recordLoginDemo() {
  const browser = await chromium.launch({ slowMo: 75 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './recordings', size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();

  await page.goto('https://myapp.com/login');
  await page.waitForTimeout(1000);

  await page.fill('#email', 'demo@example.com');
  await page.waitForTimeout(300);

  await page.fill('#password', '••••••••');
  await page.waitForTimeout(500);

  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(3000);

  await context.close();
  await browser.close();
}
```

## 光标高亮

Playwright 默认不显示光标。可添加视觉指示器：

### CSS 光标高亮

```typescript
// Inject cursor visualization
await page.addStyleTag({
  content: `
    * { cursor: none !important; }
    .playwright-cursor {
      position: fixed;
      width: 24px;
      height: 24px;
      background: rgba(255, 100, 100, 0.5);
      border: 2px solid rgba(255, 50, 50, 0.8);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease;
    }
    .playwright-cursor.clicking {
      transform: translate(-50%, -50%) scale(0.8);
      background: rgba(255, 50, 50, 0.8);
    }
  `
});

// Add cursor element
await page.evaluate(() => {
  const cursor = document.createElement('div');
  cursor.className = 'playwright-cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
});
```

### 点击涟漪效果

```typescript
// Add click ripple visualization
await page.addStyleTag({
  content: `
    .click-ripple {
      position: fixed;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(234, 88, 12, 0.4);
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%) scale(0);
      animation: ripple 0.4s ease-out forwards;
    }
    @keyframes ripple {
      to {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
      }
    }
  `
});

// Custom click function with ripple
async function clickWithRipple(page, selector) {
  const element = await page.locator(selector);
  const box = await element.boundingBox();

  await page.evaluate(({ x, y }) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });

  await element.click();
}
```

## Remotion 输出

### 将录制文件移动到 public/demos/

```typescript
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function recordForRemotion(outputName: string) {
  const browser = await chromium.launch({ slowMo: 50 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './temp-recordings', size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();

  // ... recording actions ...

  await context.close();

  // Get the video path
  const video = page.video();
  const videoPath = await video?.path();

  if (videoPath) {
    const destPath = `./public/demos/${outputName}.webm`;
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.renameSync(videoPath, destPath);
    console.log(`Recording saved to: ${destPath}`);

    // Get duration for config
    // Use ffprobe: ffprobe -v error -show_entries format=duration -of csv=p=0 file.webm
  }

  await browser.close();
}
```

### 将 WebM 转换为 MP4

Playwright 输出 WebM。将其转换以获得更好的 Remotion 兼容性：

```bash
ffmpeg -i recording.webm -c:v libx264 -crf 20 -preset medium -movflags faststart public/demos/demo.mp4
```

## 交互式录制

对于由用户驱动、需要手动执行操作的录制：

```typescript
// Inject ESC key listener to stop recording
async function injectStopListener(page: Page): Promise<void> {
  await page.evaluate(() => {
    if ((window as any).__escListenerAdded) return;
    (window as any).__escListenerAdded = true;
    (window as any).__stopRecording = false;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        (window as any).__stopRecording = true;
      }
    });
  });
}

// Poll for stop signal - handle navigation errors gracefully
while (!stopped) {
  try {
    const shouldStop = await page.evaluate(() => (window as any).__stopRecording === true);
    if (shouldStop) break;
  } catch {
    // Page navigating - continue recording
  }
  await new Promise(r => setTimeout(r, 200));
}
```

**关键要点：** `page.evaluate()` 在导航期间会抛出异常。使用 try/catch 并继续执行——不要将错误视为停止信号。

## 笔记本电脑的窗口缩放

以完整 1080p 进行录制，同时显示较小的窗口：

```typescript
const scale = 0.75; // 75% window size
const context = await browser.newContext({
  viewport: { width: 1920 * scale, height: 1080 * scale },
  deviceScaleFactor: 1 / scale,
  recordVideo: { dir: './recordings', size: { width: 1920, height: 1080 } },
});
```

## 关闭 Cookie 横幅

适用于常见用户同意管理平台的完整选择器列表：

```typescript
const COOKIE_SELECTORS = [
  '#onetrust-accept-btn-handler',           // OneTrust
  '#CybotCookiebotDialogBodyButtonAccept',  // Cookiebot
  '.cc-btn.cc-dismiss',                      // Cookie Consent by Insites
  '[class*="cookie"] button[class*="accept"]',
  '[class*="consent"] button[class*="accept"]',
  'button:has-text("Accept all")',
  'button:has-text("Accept cookies")',
  'button:has-text("Got it")',
];

async function dismissCookieBanners(page: Page): Promise<void> {
  await page.waitForTimeout(500);
  for (const selector of COOKIE_SELECTORS) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 100 })) {
        await btn.click({ timeout: 500 });
        return;
      }
    } catch { /* try next */ }
  }
}
```

在 `page.goto()` 之后以及导航时的 `page.on('load')` 中调用。

## 重要提示：注入的元素会出现在视频中

**警告：** 你注入的任何 DOM 元素（光标、控制面板、覆盖层）都会被录制。若要录制无 UI 的视频，请仅使用基于终端的控制方式（Ctrl+C、最长时长计时器）。

## 高质量演示录制技巧

1. **使用 slowMo** - 50-100ms 可让操作清晰可见
2. **添加 waitForTimeout** - 在操作之间暂停，便于理解
3. **等待动画完成** - 使用 `waitForLoadState('networkidle')`
4. **匹配 Remotion 尺寸** - 通常为 1920x1080、30fps
5. **先在不录制的情况下测试** - 在最终录制前完成调试
6. **清除浏览器状态** - 使用全新上下文以获得干净的演示
7. **关闭 Cookie 横幅** - 使用上方完整的选择器列表
8. **导航后重新注入** - 页面加载时光标/监听器会重置

---

## 反馈与贡献

如果此 skill 缺少信息或有改进空间：

- **缺少某种模式？** 描述你的需求
- **发现错误？** 告诉我哪里有问题
- **想要贡献？** 我可以帮助你：
  1. 更新此 skill 并加入改进
  2. 为 github.com/digitalsamba/claude-code-video-toolkit 创建 PR

只需说出 "improve this skill"，我就会指导你更新 `.claude/skills/playwright-recording/SKILL.md`。