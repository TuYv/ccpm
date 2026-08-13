---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
license: Complete terms in LICENSE.txt
---
# Web 应用测试

要测试本地 Web 应用，请编写原生 Python Playwright 脚本。

**可用的辅助脚本**：
- `scripts/with_server.py` - 管理服务器生命周期（支持多个服务器）

**始终先使用 `--help` 运行脚本** 查看用法。不要在先尝试运行脚本并确认确有必要进行定制化方案之前读取源代码。这些脚本可能非常大，因此会污染你的上下文窗口。它们存在的目的是作为黑盒脚本直接调用，而不是被读入你的上下文窗口。

## 选择你的方法的决策树

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run: python scripts/with_server.py --help
        │        Then use the helper + write simplified Playwright script
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## 示例：使用 with_server.py

要启动服务器，请先运行 `--help`，然后使用该辅助脚本：

**单一服务器：**
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
```

**多个服务器（例如后端 + 前端）：**
```bash
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

要创建自动化脚本，请仅包含 Playwright 逻辑（服务器将自动管理）：
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True) # Always launch chromium in headless mode
    page = browser.new_page()
    page.goto('http://localhost:5173') # Server already running and ready
    page.wait_for_load_state('networkidle') # CRITICAL: Wait for JS to execute
    # ... your automation logic
    browser.close()
```

## 先侦察再行动模式

1. **检查已渲染 DOM**：
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. 从检查结果中**识别选择器**

3. 使用已发现的选择器**执行操作**

## 常见陷阱

❌ **不要**在动态应用上先检查 DOM 而不等待 `networkidle`
✅ **请先**在检查前执行 `page.wait_for_load_state('networkidle')`

## 最佳实践

- **将捆绑脚本作为黑盒使用** - 为了完成任务，请考虑 `scripts/` 中是否有可用脚本。它们可可靠处理常见且复杂的工作流，而不会让上下文窗口变脏。先用 `--help` 查看用法，然后直接调用。
- 在同步脚本中使用 `sync_playwright()`
- 完成后始终关闭浏览器
- 使用有描述性的选择器：`text=`、`role=`、CSS 选择器或 ID
- 添加适当的等待：`page.wait_for_selector()` 或 `page.wait_for_timeout()`

## 参考文件

- **examples/** - 展示常见模式的示例：
  - `element_discovery.py` - 发现页面上的按钮、链接和输入框
  - `static_html_automation.py` - 使用 file:// URL 处理本地 HTML
  - `console_logging.py` - 在自动化过程中捕获控制台日志
