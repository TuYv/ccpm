---
name: photo-to-scanned-pdf
description: >-
  Two pipelines ending at a scanner-look PDF. (1) Phone photos of paper
  documents (contracts, stamped certificates, receipts, forms, handwritten
  notes) → clean scanner-quality PDF: perspective rectification + noteshrink
  whitening + A4 assembly + mandatory whole-document check. Trigger: "把照片
  做成扫描件", "photos to scanned PDF", "make this look scanned", "手机拍的
  文档转 PDF", "盖章文件扫描", replacing pages in an existing scanned PDF,
  any CamScanner-like request. (2) A digital document with no signature yet
  (rendered docx/PDF, confirmation form, contract draft) → make it look
  hand-signed and scanned: synthesize a handwriting-style signature, composite
  it onto the signature line, apply the same scan-look post-processing.
  Trigger: "帮我做个手写签名", "生成签名盖到这份文件上", "做成签过字的扫描件",
  "synthesize a signature", any request for a document that needs to look
  signed without a real photographed signature. Do NOT hand-roll
  levels/contrast enhancement for scan-look — tried and rejected twice; this
  skill's pipeline is the proven one.
---
# 照片 → 扫描版 PDF

两条相关的处理流程，目标效果相同，但起点不同：
一类是纸质文档的手机照片；另一类是需要先添加合成签名，才能呈现已签署效果的数字文档。以下介绍行之有效的处理流程，以及一旦跳过就会导致交付错误 PDF 的失败模式。

**你需要哪一种？**

| 输入是…… | 使用 |
|---|---|
| 已签名/盖章纸质文档的手机照片 | 本文件，下方的主流程 |
| **尚未签名**的数字文档（docx/PDF），且你需要让它看起来像是手写签名 | [references/digital-signature-synthesis.md](references/digital-signature-synthesis.md) |

```
photos ──► rectify (photo_to_scan.py --raw)
       ──► ORDER BY CONTENT, detect colored paper   ← agent eyes, not filenames
       ──► enhance: noteshrink (white batch with -g │ colored pages separately,
                                after white-balance pre-pass)
       ──► assemble_pdf.py → A4 PDF
       ──► make_contact_sheet.py → READ IT, verify EVERY page   ← mandatory
```

**职责分工**：脚本负责执行；你（智能体）负责两个判断步骤——根据内容确定页面顺序，以及验证整份文档。两者都无法通过自动化省去：文件名无法反映真实顺序，而逐页抽查会遗漏页面错位问题。数字签名分支遵循相同的理念，也有两个需要判断的环节——请参阅参考文件。

## 步骤 0 — 依赖项

```bash
which pdftoppm || brew install poppler   # contact sheet + any PDF rendering
uvx noteshrink --help | head -3          # first run builds it (~30 s)
```

这些脚本是通过 `uv run` 运行的单文件脚本（PEP 723）；OpenCV/PIL/img2pdf 会在首次运行时自动解析。

## 步骤 1 — 矫正

```bash
uv run <skill>/scripts/photo_to_scan.py --raw --out-dir work --prefix page \
    photo1.jpg photo2.jpg ...
```

预期结果：每张照片生成一个 `page_NN.jpg`，且每个文件都带有 `[quad]` 标记。`[FULLFRAME-fallback]` 标记表示未检测到纸张轮廓（背景杂乱、页面被截断）——查看该照片并决定：重新拍摄，还是接受未裁剪的完整画面。

该脚本会在内部处理 EXIF 旋转（`cv2.imread` 会忽略 EXIF；手机照片通常带有旋转信息——如果使用原始 OpenCV 进行矫正，会在没有任何提示的情况下生成横置的页面）。

## 步骤 2 — 根据内容排序，检测彩色纸张（智能体判断）

**阅读每张经过矫正的图像**（每条消息一批，约 6 张），并记录两项信息：

1. **页面身份**——日期、标题、页码，或任何可用于区分页面的信息。
   批量导出的照片（WeChat、AirDrop）使用的是*导出*时刻的时间戳，通常所有照片的时间戳都集中在同一秒内——文件名顺序毫无意义。真实案例：17 张照片最终发现与文档实际顺序完全相反；只有阅读内容才发现了这一问题。
2. **纸张颜色**——白色还是彩色（蓝色/黄色/粉色纸张）？彩色页面在步骤 3 中需要采用不同的处理路径。如果无法确定，请通过程序采样：获取空白区域的平均 RGB；`B > R + 25` ⇒ 纸张偏蓝。

继续处理之前，将最终页面顺序整理为一个明确的列表。如果这些页面应该与外部登记信息（发票清单、会议表格）相匹配，请立即根据该信息交叉核对页面身份——此时发现页面缺失/重复只需几秒即可处理；交付后才发现则需要返工。

## 步骤 3 — 增强（noteshrink，按纸张颜色拆分）

**白色纸张页面 — 单个批次，全局调色板：**

```bash
uvx noteshrink -w -g -K -q -b ns -c "true" page_03.jpg page_01.jpg page_07.jpg ...
# inputs IN FINAL PAGE ORDER → outputs ns0000.png, ns0001.png, ... in that order
```

- `-w` 表示白色背景，`-g` 表示使用一个全局调色板（使各页面的墨迹/印章颜色保持一致），`-K` 表示保持给定顺序，`-c "true"` 表示跳过其内部的 PDF 步骤（由我们自行组装）。
- **请显式传入文件名。** zsh 不会对 `$VAR` 进行单词拆分——变量中的文件列表会作为一个巨大的“文件名”传入，noteshrink 会直接退出且不生成输出，而 `-q` 会使其保持静默。请验证输出是否存在（`ls ns0*.png`），不要相信 stdout。

**彩色纸张页面 — 单独处理，并预先进行白平衡：**

```bash
uv run <skill>/scripts/photo_to_scan.py --out-dir work --prefix wb colored_photo.jpg   # no --raw
uvx noteshrink -w -g -K -q -b nc -c "true" work/wb_01.jpg
```

以下两种不同的故障模式决定了必须进行这种拆分（在制定此规则之前，两者都曾作为缺陷发布）：

1. **将彩色页面放入 `-g` 批次会污染整份文档**——纸张颜色会进入全局调色板，导致白色页面出现带色阴影/伪影。
2. **仅对彩色纸张使用 noteshrink，会使背景变白，却无法消除前景偏色**——在蓝色纸张上拍摄的黑色墨迹会呈现蓝紫色，红色印章会呈现栗色。`photo_to_scan.py` 的默认模式（非 `--raw`）会先除去纸张颜色，使墨迹恢复为黑色、印章恢复为红色。

## 步骤 4 — 组装

```bash
uv run <skill>/scripts/assemble_pdf.py --out scanned.pdf \
    ns0000.png ns0001.png nc0000.png ns0002.png ...   # FINAL page order
```

预期结果：`OK scanned.pdf (N pages, ~0.05 MB/page)`。边缘裁剪（在 200 dpi 下，默认顶部 24px、两侧 12px）会移除透视校正过程中沿页面边缘带入的一小条桌面区域；文档页边距远大于该裁剪范围。

## 步骤 5 — 验证整份文档（强制要求，并非可选）

```bash
uv run <skill>/scripts/make_contact_sheet.py scanned.pdf --out contact.png
```

**读取 `contact.png` 并检查每一页**：页面标识顺序完整且正确（每个日期/标题都位于应在的位置，无重复、无缺失），没有颜色异常的页面，印章/签名均存在。然后以完整分辨率抽查阅读 1–2 页，确认文字清晰度。

为什么每次都要检查整份文档：以下是提炼出此技能的那次会话中，两个曾作为缺陷发布的案例——

- 某次页面替换任务将新页面写入了**错误的位置**（复制命令中存在差一错误），悄无声息地覆盖了相邻页面。对被替换位置进行的逐页检查通过了；被覆盖的相邻页面直到用户发现才暴露出来。
- 一个调色板污染缺陷（步骤 3 的第 1 点）使那些*并未*被编辑的页面产生了色偏。仅检查编辑过的页面未能发现这个问题。

成本上的不对称是绝对的：联系表 = 一次读取；交付的 PDF 中出现错误页面 = 返工 + 信任损失。**“我验证了我修改过的页面”不算验证。**

## 替换现有扫描 PDF 中的页面

将每页增强后的 PNG（`ns*/nc*`）保留为工作集。要替换第 k 页：
按照步骤 1–3 处理新照片，覆盖该页的 PNG，然后重新执行步骤 4–5。
复制到编号槽位时，请注意映射关系——照片顺序反转后，槽位编号会发生变化；
应根据页面的*内容身份*推导槽位，绝不能根据其在照片批次中的位置来判断。之后，步骤 5 的完整
检查才是真正为你提供保障的环节。

## 故障排查

| 症状 | 原因 / 解决方法 |
|---|---|
| 输出结果“不像扫描件”——存在灰雾、文字模糊 | 你自行实现了色阶/曲线/除法增强。不要这样做——在改用 noteshrink 之前，两次尝试都被真实用户否决了（背景采样 + 调色板量化才是生成纯白扫描效果的关键）。 |
| 白色页面带有彩色阴影 | `-g` 批次中混入了彩色纸张页面。重新运行仅包含白色页面的批次（步骤 3）。 |
| 彩色页面上的墨迹看起来呈蓝色/紫色，印章看起来呈栗色 | noteshrink 直接处理了彩色页面的原始图像。插入白平衡预处理步骤（运行 `photo_to_scan.py`，但不使用 `--raw`）。 |
| noteshrink 没有生成输出，也没有报错 | 在 zsh 下通过未加引号的 shell 变量传递了文件列表（不会进行单词拆分），或者路径中含有空格。请传递明确的文件名；检查 `ls ns0*.png`。 |
| 页面横置 / 上下颠倒 | 上游某处忽略了 EXIF，或者检测出的四边形为横向。`photo_to_scan.py` 会校正 EXIF 并旋转为纵向；但它无法判断页面是否上下颠倒——请在步骤 2 中发现并旋转源照片。 |
| 照片上出现 `[FULLFRAME-fallback]` | 未检测到纸张轮廓（纸张与桌面之间对比度低，或页面被截断）。请在深色背景下重新拍摄，或者接受使用完整画面并依靠边缘裁剪。 |
| PDF 中页面边缘有细窄的深色条带 | 矫正过程中带入了桌面区域。调高 `assemble_pdf.py` 中的 `--crop-top/--crop-side`。 |
| PDF 中的页面顺序错误 | 错误地假设了文件名顺序。顺序来自步骤 2 的内容识别，并会显式传递给 noteshrink（`-K`）和 `assemble_pdf.py`。 |