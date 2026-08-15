---
name: create-feishu-doc
description: Automates creating new documents in the Feishu workspace. This skill should be used when the user asks to "create a Feishu doc", "create a new doc in Feishu", "open Feishu and create document", "create document in leiniao-ibg", or mentions creating documents in Feishu or Lark workspace.
user-invocable: true
allowed-tools: ["Bash(agent-browser:*)", "Skill"]
version: 0.1.0
---
# 创建飞书文档自动化

## 目的

通过浏览器自动化操作导航用户界面、进行身份验证，并创建具有指定标题和内容的文档，从而自动完成在飞书（Lark）工作区中新建文档的流程。

## 前提条件

- 能够访问飞书工作区（https://leiniao-ibg.feishu.cn）
- 拥有该工作区的有效身份验证凭据
- 能够通过 `agent-browser` 使用浏览器自动化功能

## 工作流程

### 第 1 步：加载浏览器自动化 Skill

使用 Skill 工具加载 `office:agent-browser` Skill，以使用浏览器自动化命令。

### 第 2 步：导航至飞书云盘

打开飞书云盘主页：

```bash
agent-browser open https://leiniao-ibg.feishu.cn/drive/home/
```

等待页面加载：

```bash
agent-browser wait --load networkidle
```

### 第 3 步：验证身份认证状态

获取快照以检查是否已登录：

```bash
agent-browser snapshot -i
```

如果需要登录，请等待用户手动完成身份验证，或根据页面状态处理身份验证流程。

### 第 4 步：创建新文档

点击“新建”按钮（使用快照定位元素引用）：

```bash
agent-browser snapshot -i
# Locate "新建" button ref (e.g., @e1)
agent-browser click @e1
```

等待下拉菜单出现：

```bash
agent-browser wait 1000
```

再次获取快照，以定位“文档”选项：

```bash
agent-browser snapshot -i
# Locate "文档" button ref (e.g., @e2)
agent-browser click @e2
```

### 第 5 步：选择新文档类型

点击子菜单中的“新建空白文档”选项：

```bash
agent-browser wait 1000
agent-browser snapshot -i
# Locate "新建空白文档" button ref (e.g., @e3)
agent-browser click @e3
```

### 第 6 步：等待新标签页打开

等待新文档在新标签页中打开：

```bash
agent-browser wait --load networkidle
```

检查标签页，确保新文档页面已打开：

```bash
agent-browser tab
```

如果存在多个标签页，请切换到最新的标签页（通常是最后一个）：

```bash
agent-browser tab 2  # Adjust index based on tab list
```

### 第 7 步：输入文档标题

页面应自动聚焦标题输入字段。如果标题字段默认已聚焦，请直接输入标题：

```bash
agent-browser type @e1 "Document Title Here"
```

如果未自动聚焦，请获取快照以定位标题输入字段：

```bash
agent-browser snapshot -i
# Locate title input ref (e.g., @e1)
agent-browser fill @e1 "Document Title Here"
```

### 第 8 步：输入文档内容

按 Tab 键或点击以移动到内容区域：

```bash
agent-browser press Tab
```

或者定位并点击内容编辑器：

```bash
agent-browser snapshot -i
# Locate content editor ref (e.g., @e2)
agent-browser click @e2
```

输入文档内容：

```bash
agent-browser type @e2 "Document content goes here..."
```

对于多行内容，请在输入中使用换行符：

```bash
agent-browser type @e2 "First paragraph

Second paragraph

Third paragraph"
```

### 第 9 步：验证并保存

截取最终屏幕截图，以验证文档是否已成功创建：

```bash
agent-browser screenshot
```

飞书文档会自动保存，因此无需执行显式保存操作。文档现在已可使用。

### 步骤 10：关闭浏览器（可选）

完成后关闭浏览器会话：

```bash
agent-browser close
```

## 错误处理

### 身份验证问题

如果身份验证失败或需要登录：
1. 暂停工作流
2. 告知用户需要手动登录
3. 等待用户确认后再继续
4. 身份验证完成后恢复工作流

### 未找到元素

如果快照无法定位预期的 UI 元素（按钮引用）：
1. 截取不带 `-i` 标志的完整快照以进行调试
2. 检查 UI 是否已发生变化或语言设置是否不同
3. 使用语义定位器作为备用方案：
   ```bash
   agent-browser find text "新建" click  # Find "新建" (New) button
   agent-browser find text "文档" click  # Find "文档" (Doc) button
   agent-browser find text "新建空白文档" click  # Find "新建空白文档" (New Doc) button
   ```

### 超时问题

如果页面加载时间过长：
1. 增加等待超时时间：`agent-browser wait --load networkidle --timeout 10000`
2. 检查网络连接
3. 验证飞书服务的可用性

## 自定义

### 不同的工作区

要用于其他飞书工作区，请替换步骤 2 中的 URL：

```bash
agent-browser open https://your-workspace.feishu.cn/drive/home/
```

### 文档模板

要使用特定文档模板而不是空白文档：
1. 单击“文档”后，导航到模板库
2. 找到并单击所需的模板
3. 继续输入标题和内容

## 最佳实践

1. **会话复用**：创建多个文档时，保持浏览器会话处于打开状态并复用身份验证状态
2. **错误截图**：在每个关键步骤截取屏幕截图，以便调试
3. **等待 UI**：导航后始终等待网络空闲，以确保 UI 元素已加载
4. **显式等待**：单击下拉菜单后使用显式等待（例如 `agent-browser wait 1000`）

## 其他资源

### 浏览器自动化参考

有关详细的浏览器自动化命令和模式：
- 加载 `office:agent-browser` Skill 以获取完整的命令参考
- 请参阅 agent-browser 文档中的快照和交互模式

### 使用示例

```bash
# Complete workflow example
agent-browser open https://leiniao-ibg.feishu.cn/drive/home/
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser click @e1  # 新建 button
agent-browser wait 1000
agent-browser snapshot -i
agent-browser click @e2  # 文档 button
agent-browser wait 1000
agent-browser snapshot -i
agent-browser click @e3  # 新建空白文档 button
agent-browser wait --load networkidle
agent-browser tab
agent-browser tab 2  # Switch to new tab
agent-browser type @e1 "My Document Title"
agent-browser press Tab
agent-browser type @e2 "My document content..."
agent-browser screenshot
```