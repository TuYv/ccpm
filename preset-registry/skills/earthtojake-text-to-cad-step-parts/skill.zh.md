---
name: step-parts
description: Find, evaluate, and download common purchasable CAD parts from step.parts, including named off-the-shelf actuators, servos, motors, electronics boards, connectors, screws, bolts, nuts, washers, bearings, standoffs, and other catalog components. Use when Codex needs to search the hosted step.parts catalog before creating simplified placeholder geometry, resolve fuzzy part names, standards, aliases, or dimensions, choose a matching part, fetch a canonical .step file, verify checksums, or use the step.parts API/OpenAPI/catalog endpoints for standard part discovery.
---
# CAD 零件

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请将已安装的本地技能文件作为运行时的事实来源；该仓库链接仅用于来源追溯和版本审核。

## 概述

请使用托管的 step.parts 机器接口，而不是抓取 HTML 或依赖本地仓库文件。除非用户提供了其他托管镜像，否则应将 `https://api.step.parts` 视为规范 API 源站，并将 `https://www.step.parts` 视为网站/静态资源源站。网络/DNS 故障不足以得出结论：如果无法从沙箱访问 `api.step.parts`，请在报告未找到结果或使用占位几何体之前，获取网络权限并重试一次。除非 API 可访问且未返回任何相关候选项，否则不要将零件描述为不可用。

当 CAD 装配体包含指定名称的现成执行器、舵机、电机、电子板、连接器或其他可采购组件时，请先搜索 step.parts，再创建简化的占位几何体。对于指定名称的舵机、电机和执行器，在放弃之前，应同时搜索准确的型号字符串以及常见别名/供应商拼写。例如，`STS3215` 也可能以 `ST3215`、`3215`、`Waveshare Feetech ST3215` 的形式出现，或归入 `family=feetech`。如果 API 可访问，但没有准确或近似准确的匹配项，请记录搜索未命中，然后使用有文档依据的包络模型或简化替代模型。

## 快速工作流程

1. 将请求的零件解析为搜索词和可选筛选条件：
   - 使用 `q` 搜索模糊词元、标准、别名、尺寸、来源/产品 URL，以及属性名称/值。
   - 当用户提供准确的筛选条件时，使用 `category`、`family`、`standard` 或 `tag`。
2. 搜索 `/v1/parts` 并检查 `items`、`total` 和 `facets`。对于执行器型号，在将空结果视为未命中之前，应尝试可能的别名、去掉字母后的形式、供应商名称以及相关的系列筛选条件。
3. 如果结果含糊不清，请在选择之前列出几个最佳选项及其 `id`、`name`、`standard` 和关键属性。如果某个结果明显匹配，则直接返回所选记录的详细信息，无须下载，除非用户要求获取本地 STEP 文件。
4. 找到准确或近似准确的现成执行器型号时，应优先下载并使用其 STEP 文件，除非有明确的装配阶段理由需要使用简化包络模型。请明确记录该选择。
5. 当用户要求下载或保存 STEP 文件时，请下载其 `stepUrl`，然后在记录包含 `sha256` 时用其验证文件。
6. 下载完成后，返回本地路径以及所选零件的 id 和页面/API URL，以便用户追溯来源。

## CAD 查看器交接

完成 step.parts 相关工作后，如果创建或更新了本地 `.step` 或 `.stp` 文件，并且已安装 `$cad-viewer`，则必须始终将明确的文件路径交给 `$cad-viewer`。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回指向相关已创建或已更新文件的链接；如果 `$cad-viewer` 不可用或启动失败，请报告该情况，而不要默默省略交接。

## 内置下载器

使用 `scripts/download_step_part.py` 进行确定性的搜索、下载和校验和验证：

```bash
python scripts/download_step_part.py "M3 socket head 12" --download
python scripts/download_step_part.py --id iso4762_socket_head_cap_screw_m3x12 --download
python scripts/download_step_part.py "bearing 608zz" --limit 5
```

常用选项：

- `--origin`：仅当用户提供了其他托管 API 源时，覆盖 `https://api.step.parts`。
- `--tag`、`--category`、`--family`、`--standard`：可重复使用的分面筛选器。
- `--out-dir`：当用户要求保存到特定目标位置时，覆盖下载目录。
- `--all`：与 `--download` 一起使用时，将返回页面中的每个结果分别下载为 STEP 文件。
- `--overwrite`：替换现有的输出文件。

该脚本将 JSON 输出到 stdout。执行搜索时，它会输出匹配的记录。执行下载时，它会输出已保存文件的路径、校验和以及源 URL。

## API 参考

需要了解端点详情、字段含义或查询语义时，请阅读 `references/step-parts-api.md`。优先使用：

- `/v1/parts`：用于通过筛选条件进行搜索，并返回绝对资源 URL。
- `/v1/parts/{id}`：用于获取一条包含扩展信息的记录。
- 返回的 `stepUrl`：用于下载 STEP 文件。
- `/v1/catalog/parts.index.json`：用于获取紧凑的发现索引。
- `/v1/catalog/schema`：用于了解字段和系列属性的含义。
- `/v1/openapi.json`：用于生成客户端或工具。

## 搜索指南

- API 会对查询词元执行 AND 运算，因此开始时应具体，但不要添加过多限制。例如，在添加精确的系列和标准筛选条件之前，先使用 `M3 SHCS 12`。
- 同一分面中的值会执行 OR 运算，而选定的 `tag`、`category`、`family` 和 `standard` 字段之间会执行 AND 运算。使用精确分面在已知类别中缩小范围，然后根据名称和属性手动排序。
- 标准可使用 `ISO 4762`、`ISO4762` 或精确的 `standard.designation` 进行查询。
- `attributes` 对象包含特定于系列的信息，例如 `thread`、`lengthMm`、`bore1Mm`、`material`、`profileSeries`、`slotSizeMm`，以及以毫米为单位的尺寸。
- 零件、GLB 和 PNG 的 URL 模式在 `https://www.step.parts` 上是可预测的；STEP URL 会感知环境，在生产环境中可能解析到 GitHub LFS 媒体。下载时请使用目录/API 中的 `stepUrl`。