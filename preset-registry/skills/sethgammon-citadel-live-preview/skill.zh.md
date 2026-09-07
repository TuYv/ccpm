---
name: live-preview
license: MIT
description: >-
  Mid-build visual verification loop. Takes screenshots of components during
  construction, not just after. Catches visual regressions and invisible features
  before they compound. Requires Playwright or similar screenshot tool.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - preview
  - screenshot
  - visual check
  - does it render
last-updated: 2026-03-21
---
# /live-preview — 构建-验证-修复循环

## 前提条件

此技能需要截图工具。支持的有：
- **Playwright**（推荐）：`npx playwright screenshot [url] [output.png]`
- **Puppeteer**：通过一个小脚本
- **任何接受 URL 并生成截图的工具**

如果没有可用的截图工具，此技能会告知需要安装什么并退出。

## 何时使用

- 任何时候修改了 .tsx、.jsx、.vue、.svelte 或 .html 文件
- 在组件创建或替换之后
- 在视觉重设计活动期间
- 当 Archon 或 Marshal 委派 UI 工作时

## 协议

### 步骤 1：检测

确定哪些内容需要视觉验证：

1. 检查当前会话/阶段中修改了哪些文件
2. 筛选出视图层文件（.tsx、.jsx、.vue、.svelte、.html、.css）
3. **如果未找到视图层文件**：提前退出并提示
   “未修改任何视图层文件。无可预览内容。”跳过步骤 2-5。
   这对于非 UI 仓库（CLI 工具、库、Agent 框架）属于预期情况。
4. 将每个被修改的文件映射到其渲染所在的路由或 URL：
   - 如果项目有路由清单或站点地图，使用它
   - 如果项目有开发服务器，确定哪些路由渲染了被修改的组件
   - 如果无法确定路由，请询问用户

### 步骤 2：捕获

对每个需要验证的路由/URL：

1. 确保开发服务器正在运行（若未运行则启动它）
2. 截取屏幕截图：
   ```bash
   npx playwright screenshot http://localhost:{port}/{route} .planning/screenshots/{route-slug}.png --full-page
   ```
3. 如果 Playwright 不可用，尝试：
   ```bash
   # Check for playwright
   npx playwright --version 2>/dev/null
   # If not found, inform the user:
   # "live-preview needs Playwright for screenshots. Install with: npm i -D playwright"
   ```

### 步骤 3：验证

对每张截图：

1. 读取截图（视觉能力）。检查：
   - 组件是否正常渲染？（不是空白，不是不可见）
   - 它显示的是真实数据还是占位符/空状态？
   - 是否存在明显的布局破坏（元素重叠、溢出、区块缺失）？
   - 是否符合预期的设计方向？
2. 记录结果：
   - PASS：渲染正确，符合预期
   - FAIL：描述问题所在
   - BLANK：未渲染任何内容（严重故障）

### 步骤 4：修复（如果发现故障）

针对每个 FAIL 或 BLANK：

1. 诊断：是数据问题、渲染问题，还是缺少导入？
2. 修复根本原因（而非临时补丁）
3. 重新截取并重新验证
4. 每个组件最多进行 2 次修复尝试。如果仍然失败，记录下来并继续。

### 步骤 5：产物

保存验证产物：

1. 截图保存到 `.planning/screenshots/{campaign-slug}/`（如果在活动期间）
   或 `.planning/screenshots/`（如果是独立运行）
2. 在 Codex 中，还要为应用产物/浏览器工作流注册截图：
   ```bash
   node scripts/codex-app-artifacts.js record --workflow live-preview --kind screenshot --path ".planning/screenshots/{route-slug}.png" --status pass
   ```
3. 验证已注册的产物：
   ```bash
   node scripts/codex-app-artifacts.js verify --require-artifacts
   ```
4. 编写验证摘要：
   ```markdown
   ## Visual Verification: {date}

   | Route | File Modified | Result | Notes |
   |-------|--------------|--------|-------|
   | /dashboard | Dashboard.tsx | PASS | Renders correctly |
   | /settings | SettingsPanel.tsx | FAIL → PASS | Fixed missing import, re-verified |
   | /profile | ProfileCard.tsx | BLANK → PASS | Component wasn't mounted, fixed export |
   ```

## 与 Archon 的集成

当 Archon 委派一个会修改视图文件的构建阶段时：

1. 子代理完成后，Archon 会对被修改的路由调用 /live-preview
2. 如果任何路由为 BLANK 或 FAIL，该阶段不会被标记为完成
3. 在进入下一阶段之前先运行修复循环
4. 这是 Archon 步骤 4（自我修正）质量抽检的一部分

## 此技能可防止的问题

- **不可见的功能**（复盘 #17）——编译通过但什么都不渲染
- **布局回归**——对一个组件的修改破坏了另一个组件的布局
- **把空状态当作功能发布**——数据未连接，UI 只渲染出骨架屏
- **“在我机器上能跑”**——截图是任何人都能审查的产物

## 边缘情况

- **开发服务器未运行**：主动提出启动它。输出：“未在 localhost:{port} 上检测到开发服务器。请使用 `npm run dev` 或等效命令启动，然后重新运行 /live-preview。”不要尝试对已停止的服务器截图。
- **端口不是 3000**：在询问之前先检查常见的替代端口（3001、5173、4173、8080）。阅读 `package.json` 的 scripts，查找 `--port` 标志或 `PORT` 环境变量。
- **截图工具不可用**（未安装 Playwright）：输出需要手动检查的内容——列出被修改的路由，描述每个路由应渲染的内容，并建议安装 Playwright：`npm i -D playwright`。优雅退出而不崩溃。
- **`.planning/screenshots/` 不存在**：在写入产物之前先创建该目录。绝不因输出目录缺失而报错。
- **未修改任何视图层文件**：立即退出并提示“未修改任何视图层文件。无可预览内容。”这对非 UI 仓库而言是预期且正确的行为。

## 上下文闸门

**披露**：“正在截取屏幕截图以进行视觉验证。图像将保存到 `.planning/screenshots/`。”
**可逆性**：绿色——仅截图；保存到 `.planning/screenshots/`。不修改任何源文件。
**信任闸门**：
- 任意：完整的截图捕获、验证和修复工作流。

## 质量闸门

- 每个被修改的视图文件都必须有对应的截图
- BLANK 结果属于严重故障（绝不可接受）
- 截图必须保存为产物（而不是仅仅检查后就丢弃）
- 每个组件的修复尝试上限为 2 次（防止无限循环）

## 退出协议

```
---HANDOFF---
- Live Preview: {N} routes verified
- Results: {pass}/{total} passed
- Failures: {list of routes that failed and what was wrong}
- Screenshots: .planning/screenshots/{path}
- Reversibility: green — delete .planning/screenshots/ to remove artifacts; no source files modified
---
```
