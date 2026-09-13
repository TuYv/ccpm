---
name: quality-engineering-visual-baseline
description: Captures, masks, compares, and updates screenshot baselines for web and mobile suites, with per-region thresholds and a reviewed-diff rule for every baseline change. Use when a screenshot assertion fails, a baseline needs updating, or visual checks are being added; not for deciding what to verify.
guardrail: true
metadata:
  triggers:
    files:
      - "**/__screenshots__/**"
      - "**/*-snapshots/**"
      - "**/__image_snapshots__/**"
    keywords:
      - visual baseline
      - screenshot baseline
      - update snapshots
      - toHaveScreenshot
      - pixel diff
      - mask dynamic
      - baseline diff
---
# 质量工程：视觉基线

## **优先级：P1（高）**

## 捕获

- 对计划指定的每个场景、视口、主题和语言环境分别设置一个基线；绝不能为每台开发机器设置一个基线。只能在 CI 镜像中捕获；本地捕获的基线仅作为草稿。
- 在捕获前冻结动画和时钟；等待网络空闲并确保字体已加载。
- 将基线命名为 `<screen>-<state>-<viewport>[-dark][-<locale>].png`，并放置在工具的快照目录中、与 spec 文件相邻的位置。

## 先遮罩，再设置阈值

- 在比较前遮罩所有动态区域：时钟、计数器、头像、广告、地图、第三方嵌入内容、随机化的 id。遮罩区域会作为一个实心块进行比较，因此其中的布局偏移仍会导致失败。
- 阈值应按区域设置且保持较小：文本和控件最多允许 `0.1%` 的差异像素，图像和图表为 `1%`。高于 `1%` 的全套件阈值等同于禁用检查。
- 详见[遮罩和阈值](references/masking-and-thresholds.md)。

## 对失败进行分类

截图差异属于 `VISUAL_DIFF`。除非整个差异都位于本应被遮罩或设置阈值的区域内（此时应修复遮罩，而不是基线），否则它属于 `REAL_REGRESSION`。布局偏移、元素缺失、颜色错误或文本被裁剪，在产品负责人另行确认之前，都应视为产品变更。

## 更新基线

- 基线只能通过经过审查的差异进行更新：PR 中包含更新前后的图像、关联的预期产品变更，并在提交中指定审批人。详见[基线更新审查](references/baseline-update-review.md)。
- 绝不要盲目执行 `--update-snapshots`：它会批准本次运行中的所有差异，包括尚未发现的回归。
- 只更新已审查其差异的基线，并使用 `--grep` 和 spec 路径限定范围；从同一次提交重新生成其余基线，以便未相关的漂移仍然可见。

## 红旗信号

“直接更新快照” · “把阈值提高到 5%” · “把整个页眉遮罩掉” · “在我看来它没变”——这些做法都会在未查看回归的情况下接受回归。停下来；审查差异图像，明确预期变更，然后只更新那一个基线。

## 反模式

- **禁止盲目更新快照**：未经审查差异就使用 `--update-snapshots`，会批准未经审查的视觉回归。
- **禁止提高阈值**：提高阈值以使差异通过，会禁用对未来所有差异的检查。
- **禁止用遮罩修复问题**：遮罩发生回归的区域会隐藏回归；只遮罩真正的动态内容。
- **禁止使用本地基线**：在 CI 镜像之外捕获的基线会在下一个运行器上失败。

## 参考

- [遮罩和阈值](references/masking-and-thresholds.md)
- [基线更新审查](references/baseline-update-review.md)
- [工具矩阵](references/tool-matrix.md)