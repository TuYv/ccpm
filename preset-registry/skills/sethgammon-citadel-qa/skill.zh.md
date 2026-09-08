---
name: qa
license: MIT
description: >-
  Browser-based QA verification. Launches a real browser, navigates the app,
  clicks buttons, fills forms, and tests user flows. Works as a standalone
  skill or as a phase end condition in campaigns. Requires Playwright
  (optional dependency, graceful skip if not installed).
user-invocable: true
auto-trigger: false
trigger_keywords:
  - qa
  - test the app
  - click through
  - does it work
  - browser test
effort: high
---
# /qa — 浏览器 QA 验证

## 依赖：Playwright

/qa 需要 Playwright。它是一个可选依赖。

**如果已安装 Playwright：** 完整的浏览器 QA 可以运行。
**如果未安装 Playwright：** 该技能会主动提出安装它，或者回退到 /live-preview（仅截图验证）。

检测方法：
```bash
npx playwright --version 2>/dev/null
```

安装（如果用户同意）：
```bash
npm install -D playwright
npx playwright install chromium
```

只安装 Chromium（下载量最小，约 150MB）。不安装 Firefox 或 WebKit，除非用户要求进行跨浏览器测试。

**/do setup 集成：** 在 setup 期间，如果项目是一个 web 应用（包含 React、Next.js、Vue、Svelte 或 HTML 文件），主动提出安装 Playwright：
“我看到这是一个 web 项目。要启用浏览器 QA 测试吗？这将安装 Playwright（约 150MB）用于交互测试。(y/n)"

如果对方拒绝，/qa 就回退到 /live-preview。不做强求。

## 何时使用

- 构建完一个功能之后（验证它确实能在浏览器中正常工作）
- 作为阶段结束条件："QA verification passes for [flow]"
- 当 /do 路由到 "qa"、"测试一下应用”、“能用吗”、“点一遍试试”等请求时
- 当 /create-app 的 campaign 进入验证阶段时
- 在 /live-preview 展示出某个内容已渲染、但你还需要验证交互时

## 协议

### 第 1 步：探索（DISCOVER）

测试之前，先弄清楚要测什么：

1. 阅读项目的路由/页面（来自文件树、路由配置或 package.json 中的 scripts）
2. 阅读 PRD 或 campaign 文件（如果存在），了解预期的用户流程
3. 识别可测试的流程：
   - 页面加载并渲染（基线）
   - 页面之间的导航
   - 表单提交
   - 按钮点击处理器
   - 认证流程（登录、登出、受保护路由）
   - CRUD 操作（创建、读取、更新、删除）
   - 错误状态（无效输入、网络错误）

如果不存在 PRD 或 campaign 文件，询问：“我应该测试什么？给我 1-3 个用户流程。”

### 第 2 步：启动应用

测试之前，应用必须处于运行状态：

1. 检查开发服务器是否已在运行（尝试 curl localhost:3000、5173、8080）
2. 如果未运行，查看 package.json 中的 start/dev 脚本
3. 启动它：`npm run dev` 或等效命令，在后台运行
4. 等待服务器就绪（轮询健康检查端点或主 URL）
5. 如果应用无法启动，报告错误并停止。不要测试一个坏掉的应用。

记录服务器是否由 agent 启动。如果是，在完成时终止它。

### 第 3 步：测试

针对第 1 步中识别出的每个流程，编写并运行一个 Playwright 脚本：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate
  await page.goto('http://localhost:3000');

  // Verify page loaded
  const title = await page.title();

  // Test interactions
  await page.click('button[data-testid="add-todo"]');
  await page.fill('input[name="title"]', 'Test todo');
  await page.click('button[type="submit"]');

  // Verify result
  const todoText = await page.textContent('.todo-item:last-child');

  // Screenshot for evidence
  await page.screenshot({ path: '.planning/screenshots/qa-flow-1.png' });

  await browser.close();
})();
```

针对每个测试：
- 导航到相关页面
- 执行用户操作（点击、填写、提交）
- 验证预期结果（元素出现、文本变化、发生导航）
- 截图作为证据
- 记录日志：PASS 或 FAIL 并附描述

### 第 4 步：报告

将结果写入 `.planning/qa-report-{date}.md`：

```markdown
# QA Report: {App Name or Feature}

> Date: {ISO date}
> Flows tested: {N}
> Passed: {N}
> Failed: {N}
> Screenshots: .planning/screenshots/qa-*.png

## Results

### Flow 1: {description}
- Steps: {what was done}
- Expected: {what should happen}
- Actual: {what did happen}
- Result: PASS / FAIL
- Screenshot: {path}
- Notes: {any observations}

### Flow 2: ...
```

### 第 5 步：campaign 集成

作为阶段结束条件运行时：

campaign 文件可以指定 QA 条件：
```
| 3 | qa_verify | /qa passes for: add todo, complete todo, delete todo |
```

/qa 读取该条件，运行这些具体流程，并报告通过/失败。
只有所有指定流程都通过，该阶段才算完成。

## Cookie 与认证支持

对于带身份认证的应用：

1. 先运行认证流程：导航到登录页，填写凭据，提交
2. 保存浏览器上下文（cookies + localStorage 状态）
3. 在后续所有测试中使用已保存的上下文
4. 这意味着认证流程无需在每个测试中重新登录即可正常运行

测试凭据应来自 `.env.example` 或 campaign 文件。
绝不读取 `.env`（受钩子保护）。只使用测试账号。

## 回退：未安装 Playwright

如果未安装 Playwright 且用户拒绝安装：

1. 回退到 /live-preview（仅截图）
2. 报告：“浏览器 QA 不可用（未安装 Playwright）。仅进行可视化验证。”
3. 对本应被测试的每个页面截图
4. 将交互测试标记为 SKIPPED，可视化测试标记为 PASS/FAIL

## /qa 不会做的事

- 未经询问就安装 Playwright
- 在生产环境中测试（仅限 localhost，除非用户明确提供 URL）
- 替代单元/集成测试（这是用户流程测试，不是代码测试）
- 每次编辑后都运行（成本太高——仅在显式调用或作为阶段结束条件时运行）
- 访问 .env 文件（使用 .env.example 或来自 campaign 的测试凭据）

## 质量闸门

- 每个被测试的流程所有字段均已填写（steps、expected、actual、result）
- 每个流程都截图（无论通过还是失败）
- 失败的流程包含足以复现问题的细节
- 测试执行前应用确实在运行（而不是在测一个死掉的服务器）

## 边缘情况

**未安装 Playwright 且用户拒绝**：回退到 /live-preview。在报告中将所有交互测试标记为 SKIPPED。仅可视化的验证仍会运行。

**开发服务器无法启动**：报告启动错误并停止。不要尝试测试一个没有运行的服务器。建议用户先修复启动错误。

**无法发现任何路由或页面**：向用户询问 1-3 个要测试的流程。不要猜测路由。

**没有 UI（纯 API 项目）**：报告“未检测到 UI——/qa 需要可通过浏览器访问的界面。请使用 typecheck 和单元测试进行 API 验证。”然后优雅地停止。

**如果 .planning/screenshots/ 不存在**：在保存截图前先创建它。如果 `.planning/` 不存在，将截图保存到项目根目录下的 `qa-screenshots/` 目录，并在报告中注明该路径。

## Codex App 产物清单

在 Codex 中保存截图、视频、渲染出的 PDF 或 QA 报告后，注册每个持久产物，以便 Codex 应用/浏览器工作流之后能够找到它们：

```bash
node scripts/codex-app-artifacts.js record --workflow qa --kind screenshot --path ".planning/screenshots/qa-flow-1.png" --status pass
```

清单文件位于 `.planning/artifacts/codex-app-evidence.jsonl`。

在 Codex 中报告 QA 完成之前，验证清单指向的是真实存在的文件：

```bash
node scripts/codex-app-artifacts.js verify --require-artifacts
```

## 上下文闸门

**披露：** 可能启动开发服务器；将截图和报告保存到 `.planning/`。启动前说明服务器归属。
**可逆性：** amber——会创建报告和截图；仅当开发服务器由本技能启动时才会被停止。删除生成的文件即可撤销。
**信任闸门：** 任意。针对外部/生产 URL 运行需达到 Familiar (5+)。

## 退出协议

```
---HANDOFF---
- QA Report: .planning/qa-report-{date}.md
- Flows tested: {N}
- Passed: {N} | Failed: {N} | Skipped: {N}
- Screenshots: .planning/screenshots/qa-*.png
- Server: {started by agent (killed) | was already running (left running)}
- Reversibility: amber — delete `.planning/qa-report-{date}.md` and `screenshots/qa-*.png` to undo
---
```
