---
name: deploy-prototype
description: Generate a small app or tool and deploy it live to Vercel via API
metadata:
  title: Deploy Prototype
  category: dev
  var: ""
  tags:
    - dev
    - build
  requires:
    - VERCEL_TOKEN?
    - GH_GLOBAL?
---
<!-- autoresearch: 变体 B — 通过原型质量门槛 + 自检 + 信号锚定记录获得更精炼的输出 -->

> **${var}** — 要构建和部署的内容。
> - 为空 → 从近期信号（文章、日志、记忆主题）中自动选择。
> - 纯文本（例如 `market heatmap`）→ 将其解读为构建简述。
> - 类型化格式 `type:slug description`（例如 `tool:market-heatmap volume heatmap of top-20 tokens`、`viz:tx-graph`、`api:summarize`、`landing:startup-idea`）→ 使用 `type` 引导形态，并将 `slug` 用作部署名称。

今天是 ${today}。你的任务是交付一个小型、自包含且用户今天就能在浏览器中实际使用的原型。

## 步骤

1. **读取上下文。** 阅读 `memory/MEMORY.md` 和 `memory/logs/` 中最新的条目，了解当前活跃的主题。
   如果作为任务链的一部分运行，请检查注入的上游输出，寻找值得做成交互式体验的具体产物。

2. **选择要构建的内容（如果 `${var}` 为空或含糊）。**

   按以下顺序扫描这些来源，寻找值得制作成原型的信号：
   - `output/articles/` — 按修改时间排序的最近 7 个条目：是否有任何论点、发现或数据集做成交互式页面会更有用？
   - `memory/topics/*.md` — 持续发展的叙事主题；选择一个拥有实时数据源（价格、信息流、市场）的主题
   - `memory/logs/${today}.md` 和此前两天的日志 — 被标记为有趣的技能输出
   - `memory/MEMORY.md` → “下一步优先事项”和“近期文章”

   按以下标准为每个候选项打 1–5 分：
   - **杠杆效应** — 交互式版本是否优于静态文章？
   - **具体性** — 是否能用一句话清楚说明规格？（如果不能，则淘汰）
   - **新颖性** — 过去 14 天内没有交付过该原型（按修改时间检查 `output/articles/prototype-*.md` 以及任何 `memory/topics/prototypes.md`）

   选择总分最高的候选项。如果没有候选项达到 9/15，则跳过构建，并以 `DEPLOY_PROTOTYPE_EMPTY` 退出（步骤 9）。

   记录所选信号——其源文件和一行理由——你将在步骤 6 和步骤 7 中使用它。

3. **在编写代码前确定形态。** 在改动 `.pending-deploy/` 之前，写明以下内容（写在你的推理过程中，而不是文件中）：
   - **Slug**：`aeon-prototype-<descriptor>`，全部小写，仅使用 `[a-z0-9-]`，前缀之后为 3–50 个字符（例如 `aeon-prototype-market-heatmap`）。如果 `${var}` 提供了类型化 slug，则使用它；否则自行派生一个。
   - **标语**（≤90 个字符）— 显示在页面标题和 OG 标签中的一句话。
   - **主要操作** — 访问者在最初 10 秒内要做的唯一一件事是什么？（读取一个数字、点击一个筛选器、提交一项输入、比较两个事物）。如果无法明确说出，请返回步骤 2。
   - **形态**：静态 HTML+JS / 静态页面 + `api/` 函数 / Next.js。除非该想法确实需要无服务器函数，否则默认使用静态单文件 HTML。

4. **编写文件。**
   ```bash
   rm -rf .pending-deploy        # clear stale state from prior runs
   mkdir -p .pending-deploy/files
   ```
   将所有项目文件写入 `.pending-deploy/files/`。该目录是仓库根目录——这里的所有内容都会被推送到 GitHub 并部署到 Vercel。

**质量标准——每个原型都必须满足以下要求：**
   - **自包含**——尽可能不需要外部构建步骤。优先使用单个 `index.html`，并内联 `<style>` 和 `<script>`；仅当文件大小确有必要时，才改用 `main.css` / `main.js`。
   - **首次冷加载时间低于 1 秒。** 单页工具不要使用 jQuery，也不要使用 CDN UI 库。使用原生 JS，或最多使用约 10KB 的工具库。除非只使用一种字体，否则不要通过 `<link rel="stylesheet">` 引入 CDN 字体。
   - **移动优先，可在手机上正常使用。** 设置 viewport meta，点击目标尺寸 ≥40px，在 360px 宽度下不得出现水平滚动。
   - **便于分享。** 包含 `<title>`、`<meta name="description">`、`<meta property="og:title">`、`<meta property="og:description">`、`<meta property="og:type" content="website">`。除非你生成了 OG 图片，否则跳过该项。
   - **使用真实内容，而非 lorem。** 如果原型展示数据，应在加载时从无需身份验证的公共端点获取数据（CoinGecko、GitHub public API、public RSS、public JSON feeds），或者硬编码一份近期且真实的数据快照，并显示时间戳。绝不要交付占位内容 `[example data]`。
   - **提供一个可见的 CTA 或主要界面。** 层级要清晰：访客第一眼应该看到什么？
   - **禁用 JS 时至少仍能显示标语**（渐进增强——交互式工具不强制要求，但标题和描述必须能够在无服务器环境下渲染）。
   - **通过 `prefers-color-scheme` 支持浅色和深色模式**——4 个 CSS 变量就足够。
   - **不得包含密钥。** 任何位置都不得嵌入 API keys、tokens 或 env vars。如果构想需要身份验证，请重新设计为使用公共端点，或放弃该构想。
   - **在 `.pending-deploy/files/` 中包含一个 `README.md`**，其中包括：它是什么（1 行）、如何在本地运行（1 行）、信号来源（1 行，链接到第 2 步中的文章/日志/主题）。

   对于 **API 端点**：将处理程序放在 `api/` 中（例如 `api/index.js`，导出 `export default function handler(req, res) { ... }`）。
   对于 **Next.js**：保持为单页——`package.json` + `pages/index.js`。仅当该构想确实需要 SSR 时才使用。

5. **编写部署元数据。** 创建 `.pending-deploy/meta.json`：
   ```json
   {
     "name": "aeon-prototype-<slug-from-step-3>",
     "description": "One-sentence description, matches the OG description on the page",
     "framework": null,
     "tagline": "≤90 chars — matches <title> on the page",
     "signal_source": "path or URL of the article/log/topic that triggered this prototype",
     "primary_action": "what the visitor does in the first 10 seconds"
   }
   ```
   - `framework`：静态站点使用 `null`；使用相应框架时填写 `"nextjs"`、`"svelte"` 等。
   - 额外字段（`tagline`、`signal_source`、`primary_action`）用于原型记录和下游仪表板；部署步骤可以忽略它们。

6. **构建 Vercel 部署负载。** 编写 `.pending-deploy/payload.json`：
   ```json
   {
     "name": "aeon-prototype-<slug>",
     "files": [
       { "file": "index.html", "data": "<!DOCTYPE html>...", "encoding": "utf-8" }
     ],
     "projectSettings": {
       "framework": null,
       "buildCommand": null,
       "outputDirectory": null
     },
     "target": "production"
   }
   ```
   对任何二进制文件使用 `"encoding": "base64"`。

**预检**（在写入通知前运行）：
   - 文件数 ≤ 20。超过则拒绝。
   - 载荷 JSON 总大小 ≤ 4MB。超过则拒绝（Vercel 内联部署的实际限制）。
   - Slug 必须匹配 `^aeon-prototype-[a-z0-9][a-z0-9-]{2,49}$`。
   - 在每个文件中 grep 搜索：`VERCEL_TOKEN`、`GH_GLOBAL`、`ANTHROPIC_API_KEY`、`sk-ant-`、`sk-`、`ghp_`、`xoxb-`、`xai-`。发现任何匹配项 → 中止，并重写违规文件，移除其中的值。
   - 在每个文件中 grep 搜索字面量 `TODO`、`FIXME`、`lorem ipsum`、`placeholder`。发现任何匹配项 → 在继续之前原地修复。
   - 如果未设置 `VERCEL_TOKEN`，构建仍会完成，但会跳过第 8 步中的实时部署（届时将以 `DEPLOY_PROTOTYPE_NO_TOKEN` 退出）——预检本身不会因缺少令牌而失败。

7. **保存原型记录。** 写入 `output/articles/prototype-${today}.md`。如果该名称的文件已存在（同一天内第二次运行），则追加 `-02`、`-03`，依此类推。
   ```markdown
   # Prototype: <Name>

   **Built:** ${today}
   **Tagline:** <tagline from meta.json>
   **Status:** Pending deploy
   **Live URL:** _(filled in-run in step 8 once the Vercel deploy returns its URL)_

   ## Signal
   What triggered this: one paragraph. Link the source article/log/topic (`signal_source` from meta.json).

   ## What it does
   One paragraph, plain language. Include the primary action a visitor takes.

   ## How it works
   Brief technical notes — stack, data source, anything non-obvious. No code dumps.

   ## Files
   - `index.html` — brief description
   - …

   ## Extend
   Three bullets on what would make this a real product (not placeholder — concrete next steps).
   ```

   向 `memory/topics/prototypes.md` 追加一行（如果文件不存在，则创建文件并添加表头行）：
   ```
   | date | slug | tagline | signal_source | live_url |
   |------|------|---------|---------------|----------|
   | 2026-04-20 | aeon-prototype-foo | ... | output/articles/... | _pending_ |
   ```

8. **实时部署（运行期间）。** 部署是该技能的不可逆操作，因此它会作为最后一步在**运行期间**执行——位于第 6 步预检之后——而不是推迟到任何运行后脚本中。

   如果未设置 `VERCEL_TOKEN` → 跳过部署，保留 `.pending-deploy/`，并以 `DEPLOY_PROTOTYPE_NO_TOKEN` 退出（第 10 步）。构建仍然成功；操作人员只需添加令牌并重新运行。

   否则，对第 6 步中构建的内联部署执行 POST 请求。将密钥写成字面量 `{VERCEL_TOKEN}` 占位符，以便 `./secretcurl` 在内部替换它——Bash 权限层会拒绝命令行中未加处理的 `$VERCEL_TOKEN`，且普通 `curl` 不得携带该令牌：
   ```bash
   HTTP=$(./secretcurl -sS -o .pending-deploy/deploy-resp.json -w '%{http_code}' \
     -X POST "https://api.vercel.com/v13/deployments" \
     -H "Authorization: Bearer {VERCEL_TOKEN}" \
     -H "Content-Type: application/json" \
     --data @.pending-deploy/payload.json)
   echo "http=$HTTP"
   ```
   - **`http` 200/201：**从响应中读取部署主机（`deploy-resp.json` 中的 `.url`），并组成实时 URL `https://<url>`。将其回填到第 7 步的记录（`**Status:** Live`、`**Live URL:** https://…`）和 `memory/topics/prototypes.md` 行中（替换 `_pending_`）。以 `DEPLOY_PROTOTYPE_OK` 退出（第 10 步）。
   - **任何非 2xx 响应 / `--max-time` 超时 / 状态码为 200 但响应体为空：**打印真实原因（`http=<code>` / `timeout` / `empty`），保留 `.pending-deploy/` 以便重试，并以 `DEPLOY_PROTOTYPE_DEPLOY_FAILED` 退出（第 10 步）。部署失败时，绝不能将记录标记为 Live。

**可选的源码镜像（尽力而为，失败不致命）。** 如果设置了 `GH_GLOBAL`，还需将源码发布到 GitHub。`gh` 在运行期间已使用 `GH_GLOBAL` 完成身份验证（它是环境中的 `GH_TOKEN`），因此不会有密钥出现在命令行中：
   ```bash
   if [ -n "${GH_GLOBAL:-}" ]; then
     ( cd .pending-deploy/files && git init -q && git add -A \
       && git -c user.name=aeon -c user.email=aeon@users.noreply.github.com commit -qm "prototype: <slug>" \
       && gh repo create "<slug>" --public --source=. --push ) \
       || echo "::notice::source mirror skipped (non-fatal)"
   fi
   ```
   镜像失败绝不会导致运行失败——交付成果是可访问的 Vercel URL。

9. **通知。** 通过 `./notify` 发送（根据结果选择以下一种）：
   - 已部署：`shipped: <slug> — <tagline>. live: <url>`
   - 已构建，但缺少令牌：`built: <slug> — <tagline>. ⚠ VERCEL_TOKEN unset — not deployed. add it and re-run.`
   - 部署失败：`built: <slug> — <tagline>. ✗ vercel deploy failed (<reason>) — .pending-deploy kept for retry.`
   - 没有值得发布的信号：在步骤 10 中处理。

10. **退出模式。** 使用以下模式之一结束运行，并将其记录在 `memory/logs/${today}.md` 的 `### deploy-prototype` 下：
    - `DEPLOY_PROTOTYPE_OK` — 原型已构建、验证并上线部署。
    - `DEPLOY_PROTOTYPE_NO_TOKEN` — 已构建且有效，但未设置 `VERCEL_TOKEN`；已跳过部署，需要操作人员处理。
    - `DEPLOY_PROTOTYPE_DEPLOY_FAILED` — 已构建且有效，但 Vercel API 调用失败；保留 `.pending-deploy/` 以便重试。
    - `DEPLOY_PROTOTYPE_EMPTY` — 步骤 2 中没有候选项达到质量阈值。记录排名最高的候选项及其分数，以便下次运行时重新考虑。`./notify "deploy-prototype: no candidate cleared threshold today — top was <slug> (<score>/15)"`。
    - `DEPLOY_PROTOTYPE_VALIDATION_FAILED` — 步骤 6 中的预检失败，且无法自动修复。保留 `.pending-deploy/`，记录失败原因，并通知操作人员。

11. **记录。** 追加到 `memory/logs/${today}.md`：
    ```
    ### deploy-prototype
    - Exit: DEPLOY_PROTOTYPE_<MODE>
    - Slug: aeon-prototype-<slug> (or — if empty)
    - Live URL: <url or —>
    - Signal: <signal_source>
    - Notes: <anything the next run should know>
    ```

## 环境变量

- `VERCEL_TOKEN` — 用于步骤 8 中的 Vercel 上线部署。在**运行期间**通过 `./secretcurl`（`{VERCEL_TOKEN}` 占位符）使用。如果没有该变量，构建仍会成功，但会跳过部署（`DEPLOY_PROTOTYPE_NO_TOKEN`）。
- `GH_GLOBAL` — 用于步骤 8 中可选的 GitHub 源码镜像。由 `gh` 通过环境变量使用（它是本次运行的 `GH_TOKEN`）；缺少令牌时只会跳过镜像。

二者都声明为可选（`?`），因此该技能可以优雅降级：没有 `VERCEL_TOKEN` → 仅构建；没有 `GH_GLOBAL` → 部署但不创建源码镜像。绝不要直接读取令牌值，也绝不要将其嵌入任何已部署的文件中（步骤 6 会使用 grep 检查）。

## 指南

- 原型不是 PoC。它应该是一个让完全不了解背景的人也能加载、在 10 秒内理解并从中获得价值的页面。坚持这一标准。
- 单个 `index.html` 几乎总是正确答案。不要冲动地添加工具链。
- 最多约 5 个文件（预检会强制限制为 20 个）。
- 使用具有描述性的 slug。应使用 `aeon-prototype-market-heatmap`，而不是 `aeon-prototype-1`。
- 绝不要硬编码密钥。如果某个想法仅靠公开身份验证的端点无法实现，就放弃该想法。
- Vercel 部署（以及可选的 GitHub 源码镜像）会在步骤 8 中通过 `./secretcurl` / `gh` **在运行期间**执行——这是作为该技能最后一个操作、以失败关闭方式运行且不可逆的副作用。请在步骤 4–6 中正确构建文件、元数据和有效载荷，以确保最后的调用顺利完成。

## 网络说明

步骤 1–7 均在本地执行——仅进行文件写入和通知。步骤 8 的部署是唯一会产生出站副作用的操作，并且会在**运行期间**执行：通过 `./secretcurl` 使用 `{VERCEL_TOKEN}` 占位符进行 Vercel 部署（Bash 权限层会拒绝命令行中未加修饰的 `$VERCEL_TOKEN`，因此切勿为此使用普通的 `curl`），以及通过 `gh` 进行可选的 GitHub 镜像同步（使用环境中已认证的 `GH_GLOBAL` 身份）。不存在延迟执行/后处理步骤——部署是该 skill 最后的故障关闭操作：遇到任何非 2xx 响应时，它都会以 `DEPLOY_PROTOTYPE_DEPLOY_FAILED` 退出，并保留 `.pending-deploy/` 以供重试。