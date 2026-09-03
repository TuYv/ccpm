---
name: web-to-markdown
description: "Use ONLY when the user explicitly says: 'use the skill web-to-markdown ...' (or 'use a skill web-to-markdown ...'). Converts webpage URLs to clean Markdown by calling the local web2md CLI (Puppeteer + Readability), suitable for JS-rendered pages."
metadata:
  version: 0.1.0
---
# web-to-markdown

通过驱动本地安装的浏览器（借助 `web2md`）将网页转换为干净的 Markdown。

## 硬性触发门槛（必须强制执行）

除非用户**明确**写出了类似以下的短语，否则不得使用此技能：
- `use the skill web-to-markdown ...`
- `use a skill web-to-markdown ...`

如果用户没有明确按名称请求此技能，请停止并要求其重新发起包含以下内容的请求：`use the skill web-to-markdown`。

## 此技能的功能

- 处理 JS 渲染的页面（Puppeteer → 用户的 Chrome）。
- 通过 `puppeteer-core` 与 Chromium 系浏览器（Chrome/Chromium/Brave/Edge）配合使用效果最佳。
- 提取主要内容（Readability）。
- 转换为 Markdown（Turndown），链接经过清理，并可选地生成 YAML frontmatter。

## 非目标

- 不要使用 Playwright 或其他浏览器自动化技术栈；实现机制是 `web2md`。

## 你应收集的输入（仅在缺失时询问）

- `url`（或 URL 列表）
- 输出偏好：
  - 打印到 stdout（`--print`），或
  - 保存到文件（`--out ./file.md`），或
  - 保存到目录（`--out ./some-dir/`，按页面标题自动命名）
- 针对棘手页面的可选渲染控制参数：
  - `--chrome-path <path>`（当 Chrome 自动检测失败时使用）
  - `--interactive`（显示 Chrome 并暂停，以便用户完成人机验证/登录，然后按 Enter）
  - `--wait-until load|domcontentloaded|networkidle0|networkidle2`
  - `--wait-for '<css selector>'`
  - `--wait-ms <milliseconds>`
  - `--headful`（调试用）
  - `--no-sandbox`（在容器/CI 环境中有时是必需的）
  - `--user-data-dir <dir>`（登录/会话；请使用专用的配置目录）

## 工作流程

1) 确认用户明确调用了此技能（`use the skill web-to-markdown`）。
2) 验证 URL 以 `http://` 或 `https://` 开头。
3) 确保 `web2md` 已安装：
   - 运行：`command -v web2md`
   - 如果缺失，指示用户安装它（假定项目位于 `~/workspace/softaworks/projects/web2md`）：
     - `cd ~/workspace/softaworks/projects/web2md && npm install && npm run build && npm link`
     - 或者：`cd ~/workspace/softaworks/projects/web2md && npm install && npm run build && npm install -g .`
4) 转换：
   - 单个 URL → 文件：
     - `web2md '<url>' --out ./page.md`
   - 单个 URL → 目录中自动命名的文件：
     - `mkdir -p ./out && web2md '<url>' --out ./out/`
   - 人工验证/登录墙（交互式）：
     - `mkdir -p ./out && web2md '<url>' --interactive --user-data-dir ./tmp/web2md-profile --out ./out/`
     - 然后：在浏览器窗口中完成验证，并在终端中按 Enter 以继续。
   - 打印到 stdout：
     - `web2md '<url>' --print`
   - 多个 URL（批量）：
     - 创建输出目录（例如 `./out/`），然后对每个 URL 使用 `--out ./out/` 运行一条 `web2md` 命令
5) 验证输出：
   - 如果写入文件，请验证文件存在且非空（例如 `ls -la <path>` 和 `wc -c <path>`）。
6) 返回：
   - 保存的文件路径，或 Markdown 内容（stdout 模式）。

## 默认设置（推荐）

- 对于大多数页面：`--wait-until networkidle2`
- 对于重型应用：先使用 `--wait-until domcontentloaded --wait-ms 2000`，如有需要再添加 `--wait-for 'main'`（或其他稳定的选择器）。
