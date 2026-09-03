---
name: nano-pdf
description: Edit or create PDFs with natural-language instructions using the nano-pdf CLI. Use when asked to make a PDF, edit a PDF, add pages, change text in a PDF, or convert content to PDF format.
metadata:
  {
    "openclaw":
      {
        "emoji": "📄",
        "requires": { "bins": ["nano-pdf"] },
        "install":
          [
            {
              "id": "uv",
              "kind": "uv",
              "package": "nano-pdf",
              "bins": ["nano-pdf"],
              "label": "Install nano-pdf (uv)",
            },
          ],
      },
  }
---
# nano-pdf

使用 `nano-pdf` 通过自然语言指令对 PDF 中的特定页面应用编辑。

## 快速开始

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results' and fix the typo in the subtitle"
```

## 创建新 PDF

```bash
nano-pdf create output.pdf "Create a one-page summary of quarterly results with a header, bullet points, and a footer"
```

## 在 SwarmClaw 中使用

当用户要求创建或编辑 PDF 时：

1. 检查 `nano-pdf` 是否已安装：`which nano-pdf`
2. 如果未安装，通过 `uv tool install nano-pdf` 或 `pip install nano-pdf` 安装
3. 运行相应的命令
4. 将输出文件路径报告给用户

## 注意事项

- 页码是从 0 开始还是从 1 开始编号取决于工具版本；如果结果看起来相差一页，请换用另一种编号方式重试。
- 在报告成功之前，务必对输出的 PDF 进行合理性检查。
- 对于多页编辑，请针对每一页分别运行命令。
