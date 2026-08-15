---
name: llm-icon-finder
description: Finding and accessing AI/LLM model brand icons from lobe-icons library. Use when users need icon URLs, want to download brand logos for AI models/providers/applications (Claude, GPT, Gemini, etc.), or request icons in SVG/PNG/WEBP formats.
---
# 查找 AI/LLM 品牌图标

从 [lobe-icons](https://github.com/lobehub/lobe-icons) 库获取 AI/LLM 模型的品牌图标和徽标。该库包含 100 多个图标，涵盖模型（Claude、GPT、Gemini）、提供商（OpenAI、Anthropic、Google）和应用程序（ComfyUI、LobeChat）。

## 图标格式和变体

**可用格式**：SVG（可缩放）、PNG（光栅）、WEBP（压缩）
**主题变体**：浅色、深色和彩色（部分图标）

## CDN URL 模式

使用以下模式构造 URL：

```
# SVG
https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-svg/{light|dark}/{icon-name}.svg

# PNG
https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/{light|dark}/{icon-name}.png

# WEBP
https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-webp/{light|dark}/{icon-name}.webp

# Color variant (append -color to icon-name)
https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/{icon-name}-color.png
```

**图标命名约定**：使用小写字母和连字符（例如 `claude`、`chatglm`、`openai`、`huggingface`）

## 工作流程

当用户请求图标时：

1. 确定图标名称（通常使用小写的公司/模型名称，多单词名称使用连字符连接）
2. 确定格式（默认：PNG）和主题（默认：深色）
3. 使用上述模式构造 CDN URL
4. 向用户提供 URL
5. 如果用户请求下载，使用 Bash 工具和 curl
6. 包含 Web 查看器链接：`https://lobehub.com/icons/{icon-name}`

## 查找图标名称

**常用图标**：请参阅 `references/icons-list.md`，其中包含按类别（模型、提供商、应用程序、中国 AI）整理的完整列表

**名称不确定时**：
- 浏览 https://lobehub.com/icons
- 尝试不同的名称形式（例如公司名称与产品名称：`alibaba` 与 `alibabacloud`）
- 如果标准 URL 无效，检查是否存在 `-color` 变体

**中国 AI 模型**：支持中文查询（例如“智谱”→ `chatglm`，“月之暗面”→ `moonshot`）

## 示例

**单个图标请求**：
```
User: "Claude icon"
→ Provide: https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/claude.png
→ Also mention color variant and web viewer link
```

**下载多个图标**：
```bash
curl -o openai.svg "https://raw.githubusercontent.com/lobehub/lobe-icons/.../dark/openai.svg"
curl -o anthropic.svg "https://raw.githubusercontent.com/lobehub/lobe-icons/.../dark/anthropic.svg"
```

**中文查询**：
```
User: "找一下智谱的图标"
→ Identify: 智谱 = ChatGLM → icon name: chatglm
→ Provide URLs and mention related icons (zhipu, codegeex)
```

## 故障排除

如果 URL 返回 404：
1. 尝试使用带 `-color` 后缀的变体
2. 检查其他命名方式（例如 `chatgpt` 与 `gpt`、`google` 与 `gemini`）
3. 引导用户访问 https://lobehub.com/icons 进行浏览
4. 搜索代码仓库：https://github.com/lobehub/lobe-icons

## 参考文件

- `references/icons-list.md` - 按类别整理的 100 多个可用图标的完整列表
- `references/developer-info.md` - npm 安装和 React 使用示例