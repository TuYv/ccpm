---
name: canvas
description: "Visual layer of the wiki. Add images, text cards, PDFs, and wiki pages to Obsidian canvas files with auto-positioning inside zones. Integrates with /banana for image capture. Triggers on: /canvas, canvas new, canvas add image, canvas add text, canvas add pdf, canvas add note, canvas zone, canvas list, canvas from banana, add to canvas, put this on the canvas, open canvas, create canvas."
allowed-tools: Read Write Edit Glob Grep
---
# canvas：视觉参考层

三个知识捕获层：
- `/save` → 文本综合（wiki/questions/、wiki/concepts/）
- `/autoresearch` → 结构化知识（wiki/sources/、wiki/concepts/）
- `/canvas` → 视觉参考（wiki/canvases/）

画布是一个由 Obsidian 渲染为无限视觉画板的 JSON 文件。此 Skill 直接读取和写入画布 JSON。进行任何编辑之前，请阅读 `references/canvas-spec.md` 以了解完整的格式参考。此规范与 [JSON Canvas 开放标准](https://jsoncanvas.org/)保持一致。

**底层能力偏好（v1.7+）**：此 Skill 是一个自包含的后备方案。**优先使用 `kepano/obsidian-skills`** 作为权威底层能力——其中的 `json-canvas` Skill 是规范的标准参考。如果你看到一个不带 `claude-obsidian:` 命名空间的可用 `json-canvas` Skill，那就是 kepano 的版本：涉及规范问题时请使用它。对于限定在 wiki 范围内的*工作流*（定位到 wiki/canvases/、/banana 集成、区域布局），请继续使用此 `canvas` Skill——这些是 claude-obsidian 独有的，构建在 kepano 的基础能力之上。安装 kepano：`claude plugin marketplace add kepano/obsidian-skills`。

---

## 默认画布

`wiki/canvases/main.canvas`

如果该文件不存在，则创建它：

```json
{
  "nodes": [
    {
      "id": "title",
      "type": "text",
      "text": "# Visual Reference\n\nDrop images, PDFs, and notes here.",
      "x": -400, "y": -300, "width": 400, "height": 120, "color": "6"
    },
    {
      "id": "zone-default",
      "type": "group",
      "label": "General",
      "x": -400, "y": -140, "width": 800, "height": 400, "color": "4"
    }
  ],
  "edges": []
}
```

---

## 操作

### open / status（不带参数的 `/canvas`）

1. 检查 `wiki/canvases/main.canvas` 是否存在。
2. 如果存在：读取该文件，按类型统计节点数量，并列出所有组节点的标签（区域名称）。
   报告：“画布有 N 个节点：X 个图像、Y 个文本卡片、Z 个 wiki 页面。区域：[list]”
3. 如果不存在：使用上面的初始结构创建它。
   报告：“已创建带有 General 区域的 main.canvas。”
4. 告知用户：“在 Obsidian 中打开 `wiki/canvases/main.canvas` 进行查看。”

---

### new（`/canvas new [name]`）

1. 将名称转换为 slug：转为小写，空格 → 连字符，并移除特殊字符。
2. 使用初始结构创建 `wiki/canvases/[slug].canvas`，并将标题更新为 `# [Name]`。
3. 在 `wiki/overview.md` 的 “## Canvases” 子章节下添加条目（追加在 Current State 章节之后）。不要修改 `wiki/index.md`。该文件使用固定的章节架构（Domains、Entities、Concepts、Sources、Questions、Comparisons）。
4. 报告：“已创建 wiki/canvases/[slug].canvas”

---

### add image（`/canvas add image [path or url]`）

**解析图像：**
- 如果是 URL（以 `http` 开头）：使用 `curl -sL [url] -o _attachments/images/canvas/[filename]` 下载
  从 URL 路径推导文件名；如果无法确定，则使用 `img-[timestamp].jpg`。
- 如果是仓库外部的本地路径：`cp [path] _attachments/images/canvas/`
- 如果已经是仓库相对路径：直接使用。

如果 `_attachments/images/canvas/` 不存在，则创建它。

**检测宽高比：**
使用 `python3 -c "from PIL import Image; img=Image.open('[path]'); print(img.width, img.height)"` 或 `identify -format '%w %h' [path]`。
完整的宽高比 → 画布尺寸表（包括 4:3、3:4、超宽等 7 种比例）请参阅 `references/canvas-spec.md`。不要在此处使用内联表格。该规范是尺寸设置的唯一事实来源。

**使用自动布局定位**（参见下方的“自动定位”部分）。

**将节点追加到画布 JSON 并写入。**

报告：“已将 [filename] 添加到 [zone] 区域，位置为 ([x], [y])。”

---

### 添加文本（`/canvas add text [content]`）

创建一个文本节点：
```json
{
  "id": "text-[timestamp]",
  "type": "text",
  "text": "[content]",
  "x": [auto], "y": [auto],
  "width": 300, "height": 120,
  "color": "4"
}
```

使用自动布局定位。写入并报告。

---

### 添加 PDF（`/canvas add pdf [path]`）

与添加图像相同。Obsidian 会将 PDF 原生渲染为文件节点。
- 如果文件位于仓库外，则将其复制到 `_attachments/pdfs/canvas/`。
- 固定尺寸：width=400，height=520。
- 如果可以确定页数，请在报告中说明。

---

### 添加笔记（`/canvas add note [wiki-page]`）

1. 在 `wiki/` 中搜索与页面名称匹配的文件（不区分大小写，允许部分匹配）。
2. 使用相对于仓库的路径作为 `file` 字段。
   - 使用 `"type": "file"`（而不是 `"type": "link"`）：`.md` 文件使用文件节点，而不是链接节点。
   - `"type": "link"` 接受 `url: "https://..."`：它仅用于 Web URL。
3. 创建一个文件节点：width=300，height=100。
4. 使用自动布局定位。

```json
{
  "id": "note-[timestamp]",
  "type": "file",
  "file": "wiki/concepts/LLM Wiki Pattern.md",
  "x": [auto], "y": [auto],
  "width": 300, "height": 100
}
```

---

### 区域（`/canvas zone [name] [color]`）

1. 读取画布 JSON。
2. 查找 max_y：`max(node.y + node.height for all nodes) + 60`。如果没有节点，则使用 280（为上方的初始标题节点留出空间）。
3. 创建一个组节点：

```json
{
  "id": "zone-[slug]",
  "type": "group",
  "label": "[name]",
  "x": -400,
  "y": [max_y],
  "width": 1000,
  "height": 400,
  "color": "[color or '3']"
}
```

有效颜色：`"1"`=红色 `"2"`=橙色 `"3"`=黄色 `"4"`=绿色 `"5"`=青色 `"6"`=紫色

写入并报告。

---

### 列出（`/canvas list`）

1. `glob wiki/canvases/*.canvas`
2. 对于每个画布：读取 JSON，按类型统计节点数量。
3. 报告：

```
wiki/canvases/main.canvas      . 14 nodes (8 images, 3 text, 2 file, 1 group)
wiki/canvases/design-ideas.canvas. 42 nodes (30 images, 4 text, 8 groups)
```

---

### 从 banana 添加（`/canvas from banana`）（如果已安装 banana-claude 插件）

1. 首先检查 `wiki/canvases/.recent-images.txt`（新写入图像的会话日志）。
2. 如果未找到或为空：使用具有正确优先级的 `find`（必须使用括号。如果没有括号，`-newer` 只会绑定到最后一个 `-name` 子句）：
   ```bash
   python3 -c "import time,os; open('/tmp/ten-min-ago','w').close(); os.utime('/tmp/ten-min-ago',(time.time()-600,time.time()-600))"
   find _attachments/images -newer /tmp/ten-min-ago \( -name "*.png" -o -name "*.jpg" \)
   ```
   注意：`/banana` 是一个可选的外部 Skill，并未随此插件一起提供。如果用户已安装它，`.recent-images.txt` 日志将会填充。否则，将使用上面的 `find` 命令作为后备方案。
3. 如果仍然没有结果：显示最近修改的 5 张图像。
4. 展示列表：“找到 N 张最近的图像：[list]。是否添加到画布？添加到哪个区域？（区域名称 / 'new [name]' / 'skip'）”
5. 确认后：使用添加图像的逻辑添加每张图像。

---

## 自动定位算法

请阅读 `references/canvas-spec.md`，了解完整的坐标系统。

```python
def next_position(canvas_nodes, target_zone_label, new_w, new_h):
    # Find zone group node
    zone = next((n for n in canvas_nodes
                 if n.get('type') == 'group'
                 and n.get('label') == target_zone_label), None)

    if zone is None:
        # No zone: place below all content
        max_y = max((n['y'] + n.get('height', 0) for n in canvas_nodes), default=-140)
        return -400, max_y + 60

    zx, zy = zone['x'], zone['y']
    zw, zh = zone['width'], zone['height']

    # Nodes inside this zone
    inside = [n for n in canvas_nodes
              if n.get('type') != 'group'
              and zx <= n['x'] < zx + zw
              and zy <= n['y'] < zy + zh]

    if not inside:
        return zx + 20, zy + 20

    rightmost_x = max(n['x'] + n.get('width', 0) for n in inside)
    next_x = rightmost_x + 40

    if next_x + new_w > zx + zw:
        # New row
        max_row_y = max(n['y'] + n.get('height', 0) for n in inside)
        return zx + 20, max_row_y + 20

    # Same row: align to the top of all existing nodes in the zone
    current_row_y = min(n['y'] for n in inside)
    return next_x, current_row_y
```

---

## ID 生成

读取画布并收集所有现有 ID。切勿重复使用。

安全的 ID 模式：`[type]-[content-slug]-[full-unix-timestamp]`

使用完整的 Unix 时间戳（10 位），以避免批量操作中发生冲突。

示例：`img-cover-1744032823`、`text-note-1744032845`、`zone-branding-1744032901`

如果检测到冲突（画布中已存在该 ID），则追加 `-2`、`-3` 等。

---

## 会话日志（可选钩子）

如果 `wiki/canvases/.recent-images.txt` 存在，则将在本次会话期间写入 `_attachments/images/` 的所有新图像路径追加到该文件中（每行一个路径，仅保留最后 20 个）。

`/canvas from banana` 会优先读取此文件，因此无需搜索文件系统即可立即完成。

---

## Banana 集成（如果已安装 banana-claude 插件）

在同一会话中执行任何 `/banana` 后，如果用户说“add to canvas”或“put on canvas”，则将其视为 `/canvas from banana`。

当 `/banana` 完成图像生成后，建议：
> “是否将生成的图像添加到画布？运行 `/canvas from banana`”

---

## 总结

1. 编辑任何画布 JSON 前，请先阅读 canvas-spec.md。
2. 写入前始终先读取画布文件。解析现有节点，以避免 ID 冲突并计算自动位置。
3. 为下载或复制的图像创建 `_attachments/images/canvas/`。
4. 创建新画布时更新 `wiki/index.md`。
5. 每次添加操作后报告位置和区域。

## 另请参阅

关于独立视觉内容制作（12 种模板、6 种布局算法、AI 生成、
演示文稿），请参阅 [claude-canvas](https://github.com/AgriciDaniel/claude-canvas)。
此技能用于处理 Wiki 范围内的视觉看板。claude-canvas 用于处理任何项目的
全功能画布编排。

---

## 思考方式（10 项原则映射）

在开发此技能时，请应用十原则循环。有关标准框架，请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 哪些图片、PDF、笔记属于此画布？添加前先逐一阅读。 |
| 2 | 观察（内部） | 我是在追求美观，还是在真正传达信息？美观却无法提供信息的画布只是噪声。 |
| 3 | 倾听 | 用户对于这些项目如何关联的心智模型。画布应反映该模型，而不是强加另一种模型。 |
| 4 | 思考 | 布局、分组层级、边结构。空间推理很重要；随意摆放会造成困惑。 |
| 5 | 连接（横向） | 画布节点之间的边能够揭示线性 Wiki 中不可见的隐藏结构。 |
| 6 | 连接（系统） | JSON Canvas 1.0 规范 + Obsidian 原生渲染 + 用于 AI 图像生成的 banana 技能。 |
| 7 | 感受 | 画布应当一目了然，而不是箭头组成的迷宫。 |
| 8 | 接受 | 并非每个项目都需要画布。当纯文本已经足够时，要坦然承认。 |
| 9 | 创造 | 使用稳定的 ID 和合理的位置编写 `.canvas` JSON。 |
| 10 | 成长 | 哪些画布会被再次打开？哪些会被弃用？随着时间推移，这些信号会帮助判断内容是否值得使用画布。 |