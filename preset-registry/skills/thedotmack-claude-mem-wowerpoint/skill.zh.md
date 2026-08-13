---
name: wowerpoint
description: Turn one document into a kawaii NotebookLM slide-deck PDF. Use for "wowerpoint this", "make a deck about <file>", "turn this report into slides", or any request to render a single document as shareable narrative slides.
---
# Wowerpoint

输入一份文档，输出一份 PDF。只支持幻灯片；同一引擎的公开视频和播客质量明显更差且不在支持范围内；如果用户要做这些，请直接引导他们使用 `notebooklm` CLI。

## 触发词

- "Wowerpoint `<file>`"
- "Make a slide deck about `<file>`"
- "Turn this report into slides"
- "Kawaii-deck this"

## 安装配置（每台机器一次）

如果 `notebooklm auth check` 返回 0 且 `command -v jq` 可解析，则跳过。

```bash
uv tool install --with playwright --force notebooklm-py
$(uv tool dir)/notebooklm-py/bin/playwright install chromium
```

`jq` 是工作流 JSON 解析所必需；若缺失请安装（macOS 上用 `brew install jq`，或使用你发行版的包管理器）。

然后由用户交互式认证——不要脚本化。告诉他们执行 `! notebooklm login`，这样 OAuth 的回车会落在他们的终端里。

## 工作流

### 1. 源文档

你需要且仅需要一份源文档。如果它不存在或内容过于薄弱，无法支撑一份幻灯片，**请先写好它**——使用 mem-search 和 sequential thinking 使其完整（长文档、叙事型，几千字很正常）。不要用补充更多来源来掩盖一份薄弱的源文件。

### 2. 认证预检

```bash
notebooklm auth check 2>&1 | tail -5
```

若返回 1 且提示 `Run 'notebooklm login' to authenticate.`，则中止并告知用户。

### 3. 创建笔记本，添加源

```bash
NOTEBOOK_ID=$(notebooklm create "<title>" --json | jq -r .notebook.id)
SOURCE_ID=$(notebooklm source add "<doc-path>" --notebook "$NOTEBOOK_ID" --json | jq -r .source.id)
```

标题：源文档的 H1，或其文件名主干；若是有时效性的工作，请追加日期。

JSON 外层字段不同——`create` 对应 `.notebook.id`，`source add` 对应 `.source.id`，`generate` 对应 `.task_id`。字段选错会得到空字符串并导致后续静默失败。

### 4. 启动子代理

生成大约需要 10 分钟，不要等待阻塞。使用如下模板，并设置 `run_in_background: true`。

### 5. 结束你的回合

打印笔记本链接，方便用户实时观察：

```text
https://notebooklm.google.com/notebook/<NOTEBOOK_ID>
```

子代理完成通知会在文件写入磁盘时触发。

## 输出路径

与源文件同目录并行命名：

```text
<source-dir>/<source-stem>-slides.pdf
```

如果源文件不适合作为输出位置，默认改为 `reports/<stem>-slides.pdf`。

## 分享链接（WOWerpoint Server）

PDF 落盘后，子代理还会将其 POST 到 WOWerpoint Server，该服务会把 16:9 幻灯片转换为 9:16 的移动端副本，并返回一个分享链接。分享链接是交付给用户的主要产物，磁盘上的 PDF 仅作备份。

所需环境变量（在用户的 shell 中导出——子代理继承父进程环境，因此普通 `export` 即可；不会运行 dotenv 加载器）：

```bash
WOWERPOINT_API_BASE=https://wowerpoint-api.<subdomain>.workers.dev
WOWERPOINT_VIEWER_BASE=https://wowerpoint-viewer.<subdomain>.workers.dev
WOWERPOINT_UPLOAD_TOKEN=<token>
```

若任一变量缺失，则跳过分享链接步骤，仅交付 PDF。

上传模式（在子代理确认 PDF 已落盘后执行）。捕获完整响应以处理空的 `id` 和 `error` 负载——`jq -r '.id'` 对缺失键会返回字符串 `null`，因此必须始终通过 `.id // empty` 过滤：

```bash
if [ -n "$WOWERPOINT_API_BASE" ] && [ -n "$WOWERPOINT_UPLOAD_TOKEN" ] && [ -n "$WOWERPOINT_VIEWER_BASE" ]; then
  UPLOAD_JSON=$(curl -sS --connect-timeout 10 --max-time 30 -X POST "$WOWERPOINT_API_BASE/api/decks" \
    -H "Authorization: Bearer $WOWERPOINT_UPLOAD_TOKEN" \
    -F "file=@<OUTPUT_PATH>" \
    -F "title=<TITLE>")
  DECK_ID=$(printf '%s' "$UPLOAD_JSON" | jq -r '.id // empty')
  API_ERROR=$(printf '%s' "$UPLOAD_JSON" | jq -r '.error // empty')
  if [ -n "$API_ERROR" ] || [ -z "$DECK_ID" ]; then
    echo "WOWerpoint upload warning: ${API_ERROR:-missing id}"
  else
    echo "Share URL: $WOWERPOINT_VIEWER_BASE/d/$DECK_ID"
  fi
fi
```

返回的 `id` 是基于标题生成的 kebab-case slug，并附带随机生物后缀（例如 `tokenrouter-quest-hawk`，或若标题为空/非 ASCII 时为 `velvet-comet-tiger`）。分享链接为：

```text
$WOWERPOINT_VIEWER_BASE/d/<id>
```

它会立即生效（先显示“still converting…”页面，完成后自动刷新）。每张幻灯片转换约需 1–2 分钟。请在最终回复中打印分享链接。

## 提示词

一句话。默认值：

```text
Use kawaii characters to tell the story of <subject>. Keep it warm and clear.
```

用源文档 H1 或用户表述中的一句话替换 `<subject>`。如果用户提供了自己的提示词，请逐字透传，不要扩展。

## 子代理模板（可复制、可参数化）

```text
You're handling NotebookLM slide-deck generation. Work in `<repo-absolute-path>`.

Context:
- The `notebooklm` CLI is installed and authenticated (parent verified with `notebooklm auth check`).
- A notebook and source already exist.

Inputs:
- Notebook ID: `<NOTEBOOK_ID>`
- Source ID: `<SOURCE_ID>`
- Generation prompt: `<PROMPT>`
- Output path: `<OUTPUT_PATH>`
- Deck title: `<TITLE>` (the notebook title, used by the share-link step)

Steps:

1. Wait for source: `notebooklm source wait <SOURCE_ID> -n <NOTEBOOK_ID> --timeout 600`
   Exit 0 = ready, 1 = error, 2 = timeout. On timeout, run `notebooklm source list -n <NOTEBOOK_ID> --json` and report status.

2. Generate: `notebooklm generate slide-deck "<PROMPT>" --format detailed --length default --notebook <NOTEBOOK_ID> --json --retry 2`
   Parse `task_id` from the JSON (key is `task_id` at top level).
   On `GENERATION_FAILED` or "No result found for RPC ID": sleep 300, retry once, then give up.

3. Wait for artifact: `notebooklm artifact wait <task_id> -n <NOTEBOOK_ID> --timeout 1800`

4. Download: `notebooklm download slide-deck <OUTPUT_PATH> -a <task_id> -n <NOTEBOOK_ID>`

5. Verify: `ls -la <OUTPUT_PATH>` confirms the file exists.

6. Upload to WOWerpoint Server for a mobile share link. Skip silently if any of `WOWERPOINT_API_BASE`, `WOWERPOINT_UPLOAD_TOKEN`, or `WOWERPOINT_VIEWER_BASE` is unset. Otherwise:

   ```bash
   if [ -n "$WOWERPOINT_API_BASE" ] && [ -n "$WOWERPOINT_UPLOAD_TOKEN" ] && [ -n "$WOWERPOINT_VIEWER_BASE" ]; then
     UPLOAD_JSON=$(curl -sS --connect-timeout 10 --max-time 30 -X POST "$WOWERPOINT_API_BASE/api/decks" \
       -H "Authorization: Bearer $WOWERPOINT_UPLOAD_TOKEN" \
       -F "file=@<OUTPUT_PATH>" \
       -F "title=<TITLE>")
     DECK_ID=$(printf '%s' "$UPLOAD_JSON" | jq -r '.id // empty')
     API_ERROR=$(printf '%s' "$UPLOAD_JSON" | jq -r '.error // empty')
     if [ -n "$API_ERROR" ] || [ -z "$DECK_ID" ]; then
       echo "WOWerpoint upload warning: ${API_ERROR:-missing id}"
     else
       echo "Share URL: $WOWERPOINT_VIEWER_BASE/d/$DECK_ID"
     fi
   fi
   ```

   On warning, the PDF on disk is still a valid deliverable — do not retry the upload.

Report briefly (under 200 words):
- Final artifact ID
- Time per phase (source wait, generation, render wait, download)
- Output file path + size
- Share URL (if produced)
- Any retries or warnings
- Exact error message if any step failed

Do NOT poll status manually. The `wait` commands handle backoff.
```

## 失败模式

- **`pip: command not found`** — 现代 macOS 不在 PATH 中提供 pip。请使用 `uv tool install`。
- **`Playwright not installed`** — 使用 `--with playwright` 安装 `notebooklm-py`，然后执行 `playwright install chromium`。
- **`Run 'notebooklm login' to authenticate`** — 只有用户本人才能完成 OAuth。
- **`task_id` 解析为空字符串** — JSON 外层键错误。`generate` 在顶层返回 `{"task_id": "..."}`。
- **限流（`GENERATION_FAILED` 或 "No result found for RPC ID"）** — `--retry 2` 会处理瞬时问题；若持续失败，请等待 5–10 分钟或回退到网页 UI。
- **敏感文档上传被拒** — 在添加含有凭据、客户数据或未发布产品信息的源文档前先确认。NotebookLM 是 Google 服务。
- **`--length long` 不存在** — 只支持 `default|short`。若用户要求“长幻灯片”，使用 `default` 并说明原因。
- **不存在 `--style` 参数** — kawaii 体现在提示词文本中。

## 操作提示

- **低成本重跑** — 一旦 `notebook` 和 `source` 存在，使用不同提示词进行重新生成只会重复生成 + 下载步骤。请复用 `NOTEBOOK_ID` 和 `SOURCE_ID`。
- **Web UI 备用方案** — 如果生成被限流超过 30 分钟，请打开 notebook 的 URL，并在 UI 中触发生成，然后执行 `notebooklm artifact list -n <NOTEBOOK_ID>` 和 `download`。
