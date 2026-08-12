---
name: core-agent-browser
description: "Internal support skill for agent-browser CLI workflows used by rust-learner, docs-researcher, and crate-researcher. Use only when browser automation is explicitly required."
user-invocable: false
disable-model-invocation: true
---
# 使用 agent-browser 进行浏览器自动化

## 优先级说明

获取 Rust/crate 信息时，请按以下优先顺序：
1. **rust-learner skill** - 编排 actionbook + browser-fetcher
2. **actionbook MCP** - 为已知站点提供预计算的选择器
3. **agent-browser CLI** - 直接进行浏览器自动化（最后手段）

仅在以下情况下直接使用 agent-browser：
- actionbook 没有目标站点的预计算选择器
- 需要进行交互式浏览器测试/自动化
- 需要截图或填写表单

## 快速开始

```bash
agent-browser open <url>        # Navigate to page
agent-browser snapshot -i       # Get interactive elements with refs
agent-browser click @e1         # Click element by ref
agent-browser fill @e2 "text"   # Fill input by ref
agent-browser close             # Close browser
```

## 核心工作流

1. 导航：`agent-browser open <url>`
2. 获取快照：`agent-browser snapshot -i`（返回带有类似 `@e1`、`@e2` 引用的元素）
3. 使用快照中的引用进行交互
4. 导航或 DOM 发生重大变化后重新获取快照

## 命令

### 导航
```bash
agent-browser open <url>      # Navigate to URL
agent-browser back            # Go back
agent-browser forward         # Go forward
agent-browser reload          # Reload page
agent-browser close           # Close browser
```

### 快照（页面分析）
```bash
agent-browser snapshot        # Full accessibility tree
agent-browser snapshot -i     # Interactive elements only (recommended)
agent-browser snapshot -c     # Compact output
agent-browser snapshot -d 3   # Limit depth to 3
```

### 交互（使用快照中的 @refs）
```bash
agent-browser click @e1           # Click
agent-browser dblclick @e1        # Double-click
agent-browser fill @e2 "text"     # Clear and type
agent-browser type @e2 "text"     # Type without clearing
agent-browser press Enter         # Press key
agent-browser press Control+a     # Key combination
agent-browser hover @e1           # Hover
agent-browser check @e1           # Check checkbox
agent-browser uncheck @e1         # Uncheck checkbox
agent-browser select @e1 "value"  # Select dropdown
agent-browser scroll down 500     # Scroll page
agent-browser scrollintoview @e1  # Scroll element into view
```

### 获取信息
```bash
agent-browser get text @e1        # Get element text
agent-browser get value @e1       # Get input value
agent-browser get title           # Get page title
agent-browser get url             # Get current URL
```

### 截图
```bash
agent-browser screenshot          # Screenshot to stdout
agent-browser screenshot path.png # Save to file
agent-browser screenshot --full   # Full page
```

### 等待
```bash
agent-browser wait @e1                     # Wait for element
agent-browser wait 2000                    # Wait milliseconds
agent-browser wait --text "Success"        # Wait for text
agent-browser wait --load networkidle      # Wait for network idle
```

### 语义定位器（引用的替代方案）
```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
```

## 示例：表单提交

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output shows: textbox "Email" [ref=e1], textbox "Password" [ref=e2], button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # Check result
```