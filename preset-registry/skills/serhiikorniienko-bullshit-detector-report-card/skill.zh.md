---
name: report-card
description: Render a finished BS report as a self-contained HTML page — score hero, filterable claims, readable on a phone, prints to a clean PDF. Use when the user wants to open, share, print, or show a report to someone who is not going to read a markdown table, or asks for "the HTML version", "something I can send", "a shareable page", or "make this readable".
---
# report-card

把 `bs-report-<slug>-<date>.md` 变成任何人都打得开的一个 HTML 文件。

markdown 是产出物，并且将一直是产出物——它是 `tally.py` 检查的对象，是与后续一次运行做 diff 的对象，也是被提交进仓库的对象。这个技能为同一份文件加了一个**面向读者**的视图。它只渲染；从不编辑、重新计数或添加。页面上的每一个数字都是从 markdown 原样照抄的。

## 为什么需要它

一份 BS 报告是一张五列的断言表。在笔记本电脑上没问题。但在手机上——共享链接实际上正是在手机上被打开的——Evidence 列完全没法读，而读者的第一个问题（“它哪里有问题？”）意味着要滚动二十行才能找到真正要紧的那两行。

## 用法

```bash
uv run <this-skill-dir>/scripts/render_report.py ~/.bullshit-detector/reports/<YYYY>/bs-report-<slug>-<date>.md
```

在 markdown 旁边写入 `bs-report-<slug>-<date>.html`。`-o <path>` 可写到别处。没有安装步骤，没有依赖——脚本只依赖标准库，在裸 `python3` 和 `uv run` 下都能跑，它产出的页面也不发起任何网络请求。正是这个组合让它能在代码执行沙箱里工作——在这种沙箱里，HTML 是用户唯一能带走的东西。

- `--open` 在默认浏览器中展示页面。在没有浏览器的地方——沙箱、无头主机——它会说明这一点，文件仍然会写出。**当页面已存在时会跳过它**，因为重新渲染是常态（run 行在第一遍之后才会定稿），而每次打开都会再弹出一个标签页——连续三次真实运行给用户留下了两个多余标签页。文件会原地更新；刷新你已有的标签页即可。
- `--reopen` 在页面已存在时也照样打开——用于在之后的会话里重新拾起一份报告。绝不要把这当作失败。
- `--quiet` 只打印输出路径，便于写脚本。

## 交接块

默认情况下，脚本会打印结束一次检测运行的块：

```
BS score 4/10 · Mostly fine
  the macro data is real and mostly checks out; the narrative glue is crypto-Twitter.
Tally: 35 claims extracted, 34 individually source-checked — 22 confirmed, 5 plausible,
  5 misleading, 2 false. 1 not checked.
run: 16m30s, searches 35, tools 65, coverage 1, per claim 29s

markdown  file:///Users/…/bs-report-japans-money-is-collapsing-2026-07-31.md
page      file:///Users/…/bs-report-japans-money-is-collapsing-2026-07-31.html
          opened in your browser
```

**直接粘贴；不要重新构造。** 每个数字都来自 `tally.py` 刚刚重新清点过的报告。凭记忆重新敲一遍的摘要，会朝着美化这次运行的方向出错——这与清点数字和搜索次数是同一种失败模式，只是高了一层。

路径刻意使用 `file://` URL：终端会把裸 URL 变成可点击链接，两个文件都只需一次 cmd-click 即可打开。不要把它们缩写成 `~/…`，也不要藏在链接文字后面。

## 合规门禁

渲染之前，脚本会先让报告过一遍检测器的 `tally.py`，并**拒绝渲染未通过检查的报告**：

```
REFUSED: bs-report-our-solar-system-2026-07-31.md does not pass tally.py.
  ✗ run line: 25 claims individually source-checked from 21 searches — every claim
    carrying a verdict needs its own search, so this reports more verification than
    was performed
```

退出码 3。这就是这道门禁的意义所在：一个如此体面的页面，若建立在一份连自身算术都过不去的报告之上，就会把一份坏报告洗白成看起来权威的东西。修好门禁点出的问题，然后重跑。

- `--force` 照样渲染，并把失败项作为警告打印出来。
- `--no-check` 跳过门禁——用于不是 BS 报告的 markdown。
- `--tally <path>` 或 `$BULLSHIT_DETECTOR_TALLY`，用于无法自动找到它的情况。

如果 `tally.py` 根本没有安装——这个技能可以脱离检测器单独安装——脚本会给出警告并照常渲染。缺少校验器是发出警告的理由，不是阻止别人查看一份已有报告的理由。

`--og-image <absolute-url>` 添加链接预览图。只在页面被托管到某处之后才有用；本地文件请跳过。

然后告诉用户路径，并说明它在任何浏览器里都能打开。在 macOS 上，`open <path>` 即可。

## 页面在 markdown 之上增加了什么

- **分数主视觉**——数字以它应得的尺寸呈现，按 RUBRIC 档位着色（Solid / Mostly fine / Hype-heavy / Mostly bullshit / Fabricated），旁边是一句话结论。
- **结论筛选芯片**——`Problems` 只显示 ❌ 和 🟠，`Load-bearing only` 隐藏附带性表格。这正是非技术读者能读完整份报告的全部原因。
- **900px 以下断言显示为卡片**，之上则显示为表格。行相同、顺序相同、文字相同。
- **打印样式表**——Cmd-P 得到一份干净的 PDF，每个链接后面印出其 URL。打印时有意忽略筛选器：一份被筛选过的 PDF 等于一份悄悄丢掉了行的报告，而那是这个工具绝不能产出的那一种产出物。
- **链接预览标签**——粘贴出去的链接显示 `<title> — N/10` 和结论行，而不是一个裸 URL。

## 规则

- **渲染，不要重新报告。** 如果某个数字看起来不对，那就是 markdown 错了——在那里修好它再重新渲染。绝不要在 HTML 里纠正它。
- **markdown 仍然是唯一可信源。** 交接文件时要这么说；HTML 只是一个视图，只有 markdown 才是 `tally.py` 校验过的东西。
- **不要用 `--force` 让拒绝消失。** 门禁指出的是报告里一个真实的缺陷。强行渲染过去，会产出一个比其背后内容看起来更可信的页面——而这正是这个工具存在的全部目的所要抓住的失败。
- **不要在没人要求的情况下发布任何东西。** 人们会把本工具指向未发布的草稿、内部文档以及别人私下发给他们的东西。写一个本地文件不是发布；把它放到互联网上是另一个决定，逐报告地归属于用户。
- 渲染器刻意宽松——缺了分数或版本戳的报告依然渲染，页面上会注明缺了哪些字段。这是查看器该干的事。`tally.py` 才是严格的那一方，两者不能互换角色。

## 已知限制

- 断言表必须保持 `| # | Claim | Type | Verdict | Evidence |` 的形状——`#` 列是渲染器区分断言表与其他表格的依据，结论符号只从它自己的单元格里读取，绝不读行内其他位置。
- 任何语言的报告都能正常渲染（使用系统字体，不打包网络字体）。
- 图片不在这里生成。社媒轮播图位于 [share](../share/SKILL.md)。
