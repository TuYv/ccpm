---
name: summarize
description: Summarize or extract text/transcripts from URLs, podcasts, YouTube videos, and local files using the summarize CLI. Use when asked to summarize a link, article, video, or file, or to transcribe a YouTube video.
metadata:
  {
    "openclaw":
      {
        "emoji": "🧾",
        "requires": { "bins": ["summarize"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/summarize",
              "bins": ["summarize"],
              "label": "Install summarize (brew)",
            },
          ],
      },
  }
---
# Summarize

快速总结 URL、本地文件和 YouTube 链接的 CLI 工具。

## 快速开始

```bash
summarize "https://example.com" --model google/gemini-3-flash-preview
summarize "/path/to/file.pdf" --model google/gemini-3-flash-preview
summarize "https://youtu.be/dQw4w9WgXcQ" --youtube auto
```

## YouTube：总结与转录文本

尽力而为的转录文本提取（仅限 URL）：

```bash
summarize "https://youtu.be/dQw4w9WgXcQ" --youtube auto --extract-only
```

如果用户要求的是转录文本但内容过长，请先返回一份简明的总结，然后询问要展开哪个部分或时间范围。

## 模型与密钥

为你所选的提供商设置 API 密钥：

- OpenAI：`OPENAI_API_KEY`
- Anthropic：`ANTHROPIC_API_KEY`
- xAI：`XAI_API_KEY`
- Google：`GEMINI_API_KEY`（别名：`GOOGLE_GENERATIVE_AI_API_KEY`、`GOOGLE_API_KEY`）

如果未设置，默认模型为 `google/gemini-3-flash-preview`。

## 常用标志

- `--length short|medium|long|xl|xxl|<chars>` — 控制总结长度
- `--max-output-tokens <count>` — 硬性 token 上限
- `--extract-only` — 仅提取原始文本，不做总结（仅限 URL）
- `--json` — 输出机器可读的结果
- `--firecrawl auto|off|always` — 针对被屏蔽站点的回退提取
- `--youtube auto` — 设置了 `APIFY_API_TOKEN` 时使用 Apify 回退

## 配置

可选的配置文件：`~/.summarize/config.json`

```json
{ "model": "openai/gpt-5.2" }
```

可选服务：

- `FIRECRAWL_API_KEY` 用于被屏蔽的站点
- `APIFY_API_TOKEN` 用于 YouTube 回退
