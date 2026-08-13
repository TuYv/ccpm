---
name: "browser-automation"
description: "Use when the user asks to automate browser tasks, scrape websites, fill forms, capture screenshots, extract structured data from web pages, or build web automation workflows. NOT for testing — use playwright-pro for that."
---
# 浏览器自动化 - 强大

## 概述

浏览器自动化技能提供了全面的工具和知识，用于使用 Playwright 构建生产级 Web 自动化工作流。该技能涵盖数据提取、表单填写、屏幕截图、会话管理和反检测模式，可实现大规模、可靠的浏览器自动化。

**何时使用此技能：**
- 从网站抓取结构化数据（表格、列表、搜索结果）
- 自动执行多步骤浏览器工作流（登录、填写表单、下载文件）
- 捕获网页的屏幕截图或 PDF
- 从 SPA 和大量使用 JavaScript 的网站中提取数据
- 构建可重复执行的基于浏览器的数据管道

**何时不应使用此技能：**
- 编写浏览器测试或 E2E 测试套件——请改用 **playwright-pro**
- 测试 API 端点——请改用 **api-test-suite-builder**
- 进行负载测试或性能基准测试——请改用 **performance-profiler**

**为什么选择 Playwright，而不是 Selenium 或 Puppeteer：**
- **内置自动等待**——大多数操作不需要显式调用 `sleep()` 或 `waitForElement()`
- **通过一个 API 支持多种浏览器**——Chromium、Firefox、WebKit，无需更改任何配置
- **网络拦截**——原生支持屏蔽广告、模拟响应和捕获 API 调用
- **浏览器上下文**——无需启动新的浏览器实例即可创建隔离会话
- **代码生成**——`playwright codegen` 可记录你的操作并生成脚本
- **异步优先**——使用 Python async/await 实现高吞吐量抓取

## 核心能力

### 1. Web 抓取模式

**选择器优先级（从最可靠到最不可靠）：**
1. `data-testid`、`data-id` 或自定义数据属性——网站重新设计后仍能保持稳定
2. `#id` 选择器——具有唯一性，但可能会在不同部署版本之间发生变化
3. 语义选择器：`article`、`nav`、`main`、`section`——不易受 CSS 变更影响
4. 基于类的选择器：`.product-card`、`.price`——如果类是自动生成的（例如 CSS 模块），则较为脆弱
5. 位置选择器：`nth-child()`、`nth-of-type()`——仅作为最后手段，布局变化时容易失效

仅当 CSS 无法表达所需关系时才使用 XPath（例如祖先遍历、基于文本的选择）。

**分页策略：**下一页按钮、基于 URL 的分页（`?page=N`）、无限滚动、加载更多按钮。完整的分页处理程序和滚动模式请参阅 [data_extraction_recipes.md](references/data_extraction_recipes.md)。

### 2. 表单填写与多步骤工作流

将多步骤表单拆分为每个步骤对应的独立函数。每个函数负责填写字段、单击“下一步”/“继续”，并等待下一步骤加载完成（URL 发生变化或 DOM 元素出现）。

关键模式：登录流程、多页面表单、文件上传（包括拖放区域）、原生和自定义下拉菜单处理。有关 `fill()`、`select_option()`、`set_input_files()` 和 `expect_file_chooser()` 的完整 API 参考，请参阅 [playwright_browser_api.md](references/playwright_browser_api.md)。

### 3. 屏幕截图与 PDF 捕获

- **完整页面：** `await page.screenshot(path="full.png", full_page=True)`
- **元素：** `await page.locator("div.chart").screenshot(path="chart.png")`
- **PDF（仅限 Chromium）：** `await page.pdf(path="out.pdf", format="A4", print_background=True)`
- **视觉回归：**在已知状态下截取屏幕截图，将基准图像存储在版本控制系统中，并采用以下命名格式：`{page}_{viewport}_{state}.png`

有关完整的截图/PDF 选项，请参阅 [playwright_browser_api.md](references/playwright_browser_api.md)。

### 4. 结构化数据提取

核心提取模式：
- **表格转 JSON** — 将 `<thead>` 表头和 `<tbody>` 行提取为字典
- **列表转数组** — 使用字段-选择器映射来映射重复的卡片元素（支持使用 `::attr()` 提取属性）
- **嵌套/线程式数据** — 递归提取带回复的评论、分类树

有关完整的提取函数、价格解析、数据清理工具以及输出格式辅助函数（JSON、CSV、JSONL），请参阅 [data_extraction_recipes.md](references/data_extraction_recipes.md)。

### 5. Cookie 与会话管理

- **保存/恢复 Cookie：** `context.cookies()` 和 `context.add_cookies()`
- **完整存储状态**（Cookie + localStorage）：使用 `context.storage_state(path="state.json")` 保存，使用 `browser.new_context(storage_state="state.json")` 恢复

**最佳实践：** 登录后保存状态，并在多个抓取会话中重复使用。开始长时间任务前检查会话有效性——向受保护页面发起轻量级请求，并确认未被重定向到登录页面。有关 Cookie 和存储状态 API 的详细信息，请参阅 [playwright_browser_api.md](references/playwright_browser_api.md)。

### 6. 反检测模式

现代网站会通过多种手段检测自动化。请按以下优先顺序应用这些措施：

1. **移除 WebDriver 标志** — 通过初始化脚本移除 `navigator.webdriver = true`（关键）
2. **自定义用户代理** — 轮换使用真实浏览器 UA；绝不要使用默认的无头模式 UA
3. **真实的视口** — 设置为 1920x1080 或类似的真实设备尺寸（默认的 800x600 是一个危险信号）
4. **请求节流** — 在操作之间添加 `random.uniform()` 随机延迟
5. **代理支持** — 按浏览器或上下文配置代理

有关完整的隐身技术栈，请参阅 [anti_detection_patterns.md](references/anti_detection_patterns.md)：navigator 属性强化、WebGL/canvas 指纹规避、行为模拟（鼠标移动、输入速度、滚动模式）、代理轮换策略以及检测自测 URL。

### 7. 动态内容处理

- **SPA 渲染：** 等待内容选择器（`wait_for_selector`），而不是页面加载事件
- **等待 AJAX/Fetch：** 使用 `page.expect_response("**/api/data*")` 拦截并等待特定 API 调用
- **Shadow DOM：** Playwright 使用 `>>` 运算符穿透开放的 Shadow DOM：`page.locator("custom-element >> .inner-class")`
- **延迟加载的图像：** 使用 `scroll_into_view_if_needed()` 将元素滚动到视图中，以触发加载

有关等待策略、网络拦截和 Shadow DOM 的详细信息，请参阅 [playwright_browser_api.md](references/playwright_browser_api.md)。

### 8. 错误处理与重试逻辑

- **退避重试：** 使用带指数退避的重试逻辑封装页面交互（例如 1 秒、2 秒、4 秒）
- **备用选择器：** 出现 `TimeoutError` 时，在失败退出前尝试其他选择器
- **错误状态截图：** 发生意外故障时，捕获 `page.screenshot(path="error-state.png")` 以便调试
- **速率限制检测：** 检查 HTTP 429 响应并遵循 `Retry-After` 标头

完整的指数退避实现和速率限制器类请参阅 [anti_detection_patterns.md](references/anti_detection_patterns.md)。

## 工作流

### 工作流 1：单页面数据提取

**场景：** 从包含 JavaScript 渲染内容的单个页面中提取产品数据。

**步骤：**
1. 开发期间以有头模式启动浏览器（`headless=False`），生产环境中切换为无头模式
2. 导航至 URL 并等待内容选择器
3. 使用带字段映射的 `query_selector_all` 提取数据
4. 验证提取的数据（检查空值和预期类型）
5. 输出为 JSON

```python
async def extract_single_page(url, selectors):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 ..."
        )
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle")
        data = await extract_listings(page, selectors["container"], selectors["fields"])
        await browser.close()
    return data
```

### 工作流 2：带分页的多页面抓取

**场景：** 抓取 50 多个页面的搜索结果。

**步骤：**
1. 使用反检测设置启动浏览器
2. 导航至第一页
3. 从当前页面提取数据
4. 检查“下一页”按钮是否存在且已启用
5. 点击下一页，等待新内容加载（而不仅仅是等待导航）
6. 重复操作，直到没有下一页或达到最大页数
7. 根据唯一键对结果去重
8. 增量写入输出（不要将所有内容都保存在内存中）

```python
async def scrape_paginated(base_url, selectors, max_pages=100):
    all_data = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await (await browser.new_context()).new_page()
        await page.goto(base_url)

        for page_num in range(max_pages):
            items = await extract_listings(page, selectors["container"], selectors["fields"])
            all_data.extend(items)

            next_btn = page.locator(selectors["next_button"])
            if await next_btn.count() == 0 or await next_btn.is_disabled():
                break

            await next_btn.click()
            await page.wait_for_selector(selectors["container"])
            await human_delay(800, 2000)

        await browser.close()
    return all_data
```

### 工作流 3：需身份验证的工作流自动化

**场景：** 登录门户网站，完成多步骤表单，并下载报告。

**步骤：**
1. 检查现有的会话状态文件
2. 如果没有会话，则执行登录并保存状态
3. 使用已保存的会话导航至目标页面
4. 使用提供的数据填写多步骤表单
5. 等待下载触发
6. 将下载的文件保存到目标目录

```python
async def authenticated_workflow(credentials, form_data, download_dir):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        state_file = "session_state.json"

        # Restore or create session
        if os.path.exists(state_file):
            context = await browser.new_context(storage_state=state_file)
        else:
            context = await browser.new_context()
            page = await context.new_page()
            await login(page, credentials["url"], credentials["user"], credentials["pass"])
            await context.storage_state(path=state_file)

        page = await context.new_page()
        await page.goto(form_data["target_url"])

        # Fill form steps
        for step_fn in [fill_step_1, fill_step_2]:
            await step_fn(page, form_data)

        # Handle download
        async with page.expect_download() as dl_info:
            await page.click("button:has-text('Download Report')")
        download = await dl_info.value
        await download.save_as(os.path.join(download_dir, download.suggested_filename))

        await browser.close()
```

## 工具参考

| 脚本 | 用途 | 关键标志 | 输出 |
|--------|---------|-----------|--------|
| `scraping_toolkit.py` | 生成 Playwright 抓取脚本框架 | `--url`、`--selectors`、`--paginate`、`--output` | Python 脚本或 JSON 配置 |
| `form_automation_builder.py` | 根据字段规范生成表单填写自动化脚本 | `--fields`、`--url`、`--output` | Python 自动化脚本 |
| `anti_detection_checker.py` | 审查 Playwright 脚本中的检测风险因素 | `--file`、`--verbose` | 带评分的风险报告 |

所有脚本仅使用标准库。运行 `python3 <script> --help` 查看完整用法。

## 反模式

### 硬编码等待
**错误做法：** 在每个操作前使用 `await page.wait_for_timeout(5000)`。
**正确做法：** 使用 `wait_for_selector`、`wait_for_url`、`expect_response` 或 `wait_for_load_state`。硬编码等待不稳定且速度慢。

### 没有错误恢复
**错误做法：** 使用遇到第一次失败就崩溃的线性脚本。
**正确做法：** 将每个页面交互包装在 try/except 中。截取错误状态的屏幕截图。实现采用指数退避的重试机制。

### 忽略 robots.txt
**错误做法：** 在不检查 robots.txt 指令的情况下进行抓取。
**正确做法：** 抓取前获取并解析 robots.txt。遵守 `Crawl-delay`。跳过禁止访问的路径。如果进行大规模抓取，请将你的机器人名称添加到 User-Agent 中。

### 在脚本中存储凭据
**错误做法：** 在 Python 文件中硬编码用户名和密码。
**正确做法：** 使用环境变量、`.env` 文件（由 git 忽略）或密钥管理器。通过 CLI 参数传递凭据。

### 没有速率限制
**错误做法：** 以每秒 100 个请求的速度轰炸网站。
**正确做法：** 在请求之间添加随机延迟（礼貌抓取建议为 1–3 秒）。监控 429 响应。实现指数退避。

### 选择器脆弱
**错误做法：** 依赖自动生成的类名（`.css-1a2b3c`）或深层嵌套（`div > div > div > span:nth-child(3)`）。
**正确做法：** 使用数据属性、语义化 HTML 或基于文本的定位器。先在浏览器 DevTools 中测试选择器。

### 未清理浏览器实例
**错误做法：** 启动浏览器后不将其关闭，从而导致资源泄漏。
**正确做法：** 始终使用 `try/finally` 或异步上下文管理器来确保调用 `browser.close()`。

### 在生产环境中以有头模式运行
**错误做法：** 在生产环境/CI 中使用 `headless=False`。
**正确做法：** 开发时使用有头模式进行调试，部署时使用 `headless=True`。使用环境变量进行切换：`headless = os.environ.get("HEADLESS", "true") == "true"`。

## 交叉引用

- **playwright-pro** — 浏览器测试技能。用于 E2E 测试、测试断言和测试夹具。浏览器自动化用于数据提取和工作流自动化，而不是测试。
- **api-test-suite-builder** — 当网站具有公共 API 时，直接调用 API，而不是抓取渲染后的页面。这样更快、更可靠，也更不容易被检测到。
- **performance-profiler** — 如果自动化脚本运行缓慢，请先分析瓶颈，再增加并发。
- **env-secrets-manager** — 用于安全管理经过身份验证的自动化工作流所使用的凭据。