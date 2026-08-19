---
name: geopandas
description: Guidance and local audit tools for Python workflows that directly use GeoPandas GeoSeries, GeoDataFrame, spatial operations, or vector-data I/O.
license: MIT
compatibility: Requires Python 3.10+ and uv. Bundled CLIs are local-only; runtime analysis requires the pinned GeoPandas stack below.
allowed-tools: Read Write Bash Glob Grep
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
  last-reviewed: "2026-07-23"
---
# GeoPandas

使用 GeoPandas 处理表示为类似 pandas 的 `GeoSeries` 和
`GeoDataFrame` 对象的平面矢量数据。此技能面向稳定版 **GeoPandas 1.1.4**（发布于
2026-06-26），而不是尚未发布的 1.2 文档。

## 可复现环境

GeoPandas 1.1.4 要求 Python 3.10+；其标记版本的源代码要求 NumPy >=1.24、
pandas >=2.0、Shapely >=2.0、pyproj >=3.5、pyogrio >=0.7.2 以及 `packaging`。
以下精确的 Python 3.12 快照已于 2026-07-23 完成冒烟测试：

```bash
uv venv --python 3.12
uv pip install \
  "geopandas==1.1.4" \
  "numpy==2.5.1" \
  "pandas==3.0.5" \
  "shapely==2.1.2" \
  "pyproj==3.7.2" \
  "pyogrio==0.13.0" \
  "pyarrow==25.0.0" \
  "packaging==26.2"
```

也应在项目锁定文件中固定可选的绘图库和 PostGIS 包的版本。
不要混用来自不兼容软件包渠道的二进制地理空间包。

## 安全与隐私约定

- 将精确坐标、地址、地块边界、轨迹和小区域连接视为敏感信息。默认报告应使用计数、类别、粗略范围和经过删减的标识符。发布前进行概化处理。
- 永远不要自动加载 URL、云 URI、GDAL `/vsi*` 路径、归档文件，也不要对地址进行地理编码。获取明确批准，验证来源和哈希值，然后将解包后的本地文件暂存到隔离工作区中。
- GDAL/OGR 驱动、GEOS、PROJ、pyogrio、Shapely、pyproj 及其 wheel 属于原生代码信任边界。优先使用官方 wheel/conda-forge，记录原生组件版本，限制驱动，并在沙箱中处理不受信任的数据。
- 不要通过宽松的 GDAL 驱动打开启用宏的办公文件或嵌套归档。随附的 CLI 使用扩展名白名单并拒绝归档文件。
- 只读取已命名的数据库机密信息，例如 `GEOPANDAS_POSTGIS_PASSWORD`；使用机密管理器或作用域受限的环境变量。绝不要将密码嵌入 URL 或源代码中，不要打印引擎/URL，也不要转储环境变量。
- 每个派生工件都需要记录源数据哈希值/版本、CRS、操作参数、谓词、连接基数、精度/修复选项以及行数检查结果。

## 正确性门槛

在信任结果之前应用以下门槛：

1. **标识与来源** — 确定源图层、稳定的要素键、重复 ID、行数、几何列、解析器/驱动以及内容哈希值。
2. **几何状态** — 分别统计 null、空、无效、混合、Z/M 以及已坍缩的几何。`None` 表示缺失；空的 Shapely 几何是真实存在的几何。
3. **CRS 语义** — 必须有 CRS 元数据。`set_crs()` 分配元数据；`to_crs()` 转换坐标。绝不要根据坐标范围猜测 CRS。
4. **单位与操作** — GeoPandas 使用平面模型。地理坐标是角度单位；不要直接将其用于缓冲区、距离、面积、最近邻连接、精度网格或容差。选择适用的本地/等积 CRS 或测地线方法。
5. **转换质量** — 检查轴顺序、适用范围、大地基准转换管线、预期精度、粗略状态以及缺失的网格。除非用户明确批准获取网格，否则保持 PROJ 网络禁用。
6. **拓扑与精度** — 在修复/叠加操作之前和之后进行验证。根据源数据精度和 CRS 单位选择精度网格；任意捕捉可能导致要素坍缩或产生偏差。
7. **基数** — 在执行 `merge`、`sjoin` 或 `sjoin_nearest` 之前，说明预期的一对一、一对多或多对多行为；之后审计未匹配行和倍增行。
8. **输出约定** — 使用新的输出路径，保留稳定的要素 ID，记录模式/CRS/编码，重新打开工件，并比较计数/类型。

## CRS 和反子午线规则

GeoPandas 将 CRS 存储为 `pyproj.CRS`。坐标数组使用传统的 GIS
`(x, y)` 顺序，而权威定义可能声明以纬度优先的轴顺序。
对于显式的坐标数组转换流程，请使用 `Transformer(..., always_xy=True)`，
并记录这一选择。

`to_crs()` 转换顶点，并假设每条线段在源 CRS 中都是直线；它不会转换大地线弧段。
跨越 ±180° 或投影边界的几何可能会发生严重的错误环绕。应在有文档记录的地理表示中
检测跨越、拆分/解环绕并加密，然后转换各个部分，最后进行验证。不要将 Web Mercator
用作通用测量 CRS。

```python
crs = gdf.crs  # a pyproj.CRS when present
if crs is None or crs.is_geographic:
    raise ValueError("Choose a justified projected CRS before planar measurement")

unit_names = [axis.unit_name for axis in crs.axis_info]
areas = gdf.geometry.area  # square CRS units, not automatically square metres
```

参见 [CRS 管理](references/crs-management.md)。

## 核心 API 决策

### 数据结构

- 一个 `GeoDataFrame` 可以包含多个几何列，每列都有 CRS 元数据，
  但只有 `active_geometry_name` 会驱动框架级空间操作。
- 二元 `GeoSeries` 方法按行操作，默认按索引对齐。仅当明确需要按位置配对，
  且已验证长度和顺序时，才使用 `align=False`。
- 重复的列名和重复的要素 ID 存在歧义；应在连接和导出之前拒绝或解决这些问题。

参见[数据结构](references/data-structures.md)。

### 几何有效性、精度和合并

在使用 `make_valid(method="linework"|"structure", keep_collapsed=...)` 之前，
请使用 `is_valid` 和经过删减的 `is_valid_reason()` 类别。修复可能改变几何类型或维度；
请保留原始数据，并比较数量、面积、类型、空几何和塌缩部分。

`set_precision(grid_size, mode=...)` 使用 **CRS 单位**，并可能移除重复顶点或使要素塌缩。
`union_all(method="unary", grid_size=...)` 是稳健的默认选项。只有在
`is_valid_coverage()` 证明不存在重叠且边缘匹配后，才使用 `coverage`；当其分区假设有用时，
使用 Shapely >=2.1 中的 `disjoint_subset`。

参见[几何操作](references/geometric-operations.md)。

### 连接、叠加、裁剪和融合

- `sjoin` 的谓词具有方向性：`left.within(right)` 并不等同于
  `left.contains(right)`。`intersects` 包含边界接触；`contains`
  排除仅接触边界的点，而 `covers` 包含边界点。
- `predicate="dwithin"` 要求提供 `distance`；标量距离或每个左侧行对应的距离
  均以 CRS 单位表示。`sjoin_nearest` 会返回所有距离相等的最近匹配项，并且**不**实现
  `k=` 参数。
- `overlay(..., make_valid=True)` 会修复无效输入，但可能改变类型；
  `keep_geom_type=None` 会在发出警告的同时丢弃其他类型。精度不匹配可能产生狭长碎片；
  应量化这些碎片，而不是默默删除它们。
- `clip` 会融合掩膜。矩形裁剪速度较快，但结果可能不干净，
  并且可能遗漏塌缩为点的线；请验证其输出。
- `dissolve` 将 `groupby.agg` 与 `union_all` 结合；应选择明确的属性聚合方式，
  并审查为空的分组键。

请参阅[空间分析](references/spatial-analysis.md)。

### I/O、Arrow 和 PostGIS

GeoPandas 1.x 默认使用 pyogrio。驱动的可用性和语义由已安装的
GDAL 决定，而不只是由 GeoPandas 决定。一般互操作优先使用本地
GeoPackage，列式互操作优先使用 WKB GeoParquet。

GeoParquet 默认使用稳定的模式 1.0.0。原生 GeoArrow 编码和 bbox
覆盖需要模式 1.1.0，且互操作性仍较弱。缺少 GeoParquet
`crs` 键表示 `OGC:CRS84`；显式的 `crs: null` 表示未知——不要将二者混淆。
每次导出后都要重新打开并进行验证。

对于 PostGIS，请使用参数化 SQL 以及 SQLAlchemy 的 `Engine`/`Connection`。
`if_exists="replace"` 具有破坏性；默认使用 `"fail"`，并使用事务。

请参阅[数据 I/O](references/data-io.md)。

## 迁移检查清单

对于从 GeoPandas 0.14 或更早版本迁移的代码：

- GeoPandas 1.0 仅支持 Shapely >=2；PyGEOS、Shapely <2 以及 rtree
  空间索引后端均已移除。
- pyogrio 已取代 Fiona，成为已安装/默认的 I/O 引擎。显式设置 `engine=`
  并测试模式、空数据、datetime、编码和追加行为。
- 将 `sjoin(op=...)` 替换为 `predicate=`，将 `sindex.query_bulk()` 替换为
  `sindex.query()`，将 `unary_union` 替换为 `union_all()`，并将
  `GeometryArray.data` 替换为 `to_numpy()`/`np.asarray`。
- 将 `read_file(include_fields=...|ignore_fields=...)` 替换为 `columns=`。
  使用 `schema_version=`，不要使用已移除的 GeoParquet `version=` 兼容参数。
- 不要使用已移除的 `geopandas.datasets`、内部的 `geopandas.io.*` 入口、
  绘图中的 `axes`/`colormap` 或集合运算运算符。
- `explode()` 现在默认为 `index_parts=False`；传递给
  `set_geometry()` 的具名 Series 会提供新的活动列名称；具名的右侧索引可以在
  `sjoin` 输出中替代 `index_right`。
- 不要通过为 `.crs` 赋值来覆盖元数据，也不要依赖已弃用的
  `set_geometry(drop=...)`；请使用显式的 `set_crs()` 以及重命名/删除步骤。
- GeoPandas 1.1 要求 Python >=3.10、pandas >=2.0、NumPy >=1.24 和 pyproj
  >=3.5。版本 1.1.2 修复了通过 PostGIS 几何列名称进行的 SQL 注入问题；固定使用的
  1.1.4 包含该修复。

### 绘图和探索

地图是分析输出：标注单位、分类方法、缺失数据、归一化分母和日期。
`explore()` 可能会在工具提示/弹出窗口中暴露每个属性，并联系瓦片/CDN 服务器；
对于本地草稿，应先进行概化，并使用 `tiles=None`、`tooltip=False` 和
`popup=False`。

请参阅[可视化](references/visualization.md)。

## 随附的本地 CLI

所有辅助工具都是确定性的，会拒绝网络/归档路径，限制输入字节数和要素数量，
保持导入延迟加载以确保 `--help` 不依赖任何依赖项，并输出不含坐标或记录标识符的
JSON。

| CLI | 用途 |
|---|---|
| `scripts/vector_inventory.py` | 脱敏的本地矢量/GeoParquet 技术清单 |
| `scripts/crs_reprojection_plan.py` | CRS 单位、轴、候选转换和反子午线计划 |
| `scripts/geometry_validity_report.py` | 试运行有效性审计；可选修复到新的 GeoPackage |
| `scripts/spatial_join_audit.py` | 谓词语义、重复 ID 和连接基数 |
| `scripts/export_plan.py` | 不执行矢量/GeoParquet 导出契约 |
| `scripts/sensitive_coordinates_checklist.py` | 隐私/概化发布门禁 |

```bash
python skills/geopandas/scripts/vector_inventory.py --help
python skills/geopandas/scripts/crs_reprojection_plan.py \
  --source-crs EPSG:4326 --target-crs EPSG:32631
python skills/geopandas/scripts/geometry_validity_report.py data.gpkg
python skills/geopandas/scripts/spatial_join_audit.py points.gpkg zones.gpkg \
  --predicate within --left-id point_id --right-id zone_id
python skills/geopandas/scripts/export_plan.py data.gpkg result.parquet \
  --format geoparquet --schema-version 1.0.0 \
  --stable-id-column feature_id --id-unique-verified
python skills/geopandas/scripts/sensitive_coordinates_checklist.py \
  --public-output --precise-points --contains-addresses
```

## 参考索引

- [数据结构](references/data-structures.md)
- [CRS 管理](references/crs-management.md)
- [几何运算](references/geometric-operations.md)
- [空间分析](references/spatial-analysis.md)
- [数据 I/O](references/data-io.md)
- [可视化](references/visualization.md)

## 来源（已于 2026-07-23 验证）

- [PyPI 上的 GeoPandas 1.1.4](https://pypi.org/project/geopandas/1.1.4/) — 发布于 2026-06-26。
- [GeoPandas 1.1.4 发布说明](https://github.com/geopandas/geopandas/releases/tag/v1.1.4) — 错误修复版本。
- [GeoPandas 1.1.4 标记版本的依赖项](https://github.com/geopandas/geopandas/blob/v1.1.4/pyproject.toml)。
- [GeoPandas 稳定版文档](https://geopandas.org/en/stable/)。
- [GeoPandas 1.0 迁移版本](https://github.com/geopandas/geopandas/releases/tag/v1.0.0)。