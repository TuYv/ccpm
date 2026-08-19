---
name: astropy
description: Core Python library for astronomy and astrophysics workflows that need Astropy APIs, including units/quantities, coordinates, FITS I/O, tables, time systems, WCS, and cosmology. Use when implementing or debugging astronomical data analysis code with Astropy.
license: BSD-3-Clause license
compatibility: Requires Python 3.11+ with astropy installed (uv for package installation). Some features (object name resolution, site lookups, remote FITS reads, IERS updates) need network access.
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
---
# Astropy

## 概述

Astropy 是天文学领域的核心 Python 软件包，为天文研究和数据分析提供基础功能。可使用 astropy 进行坐标转换、单位和量计算、FITS 文件操作、宇宙学计算、精确时间处理、表格数据操作以及天文图像处理。

## 何时使用此 Skill

当任务涉及以下内容时，使用 astropy：
- 在天球坐标系之间转换（ICRS、Galactic、FK5、AltAz 等）
- 处理物理单位和量（将 Jy 转换为 mJy、将秒差距转换为 km 等）
- 读取、写入或操作 FITS 文件（图像或表格）
- 宇宙学计算（光度距离、回望时间、哈勃参数）
- 使用不同时标（UTC、TAI、TT、TDB）和格式（JD、MJD、ISO）进行精确时间处理
- 表格操作（读取星表、交叉匹配、筛选、连接）
- 像素坐标与世界坐标之间的 WCS 转换
- 天文常数和计算

## 快速开始

```python
import astropy.units as u
from astropy.coordinates import SkyCoord
from astropy.time import Time
from astropy.io import fits
from astropy.table import Table
from astropy.cosmology import Planck18

# Units and quantities
distance = 100 * u.pc
distance_km = distance.to(u.km)

# Coordinates
coord = SkyCoord(ra=10.5*u.degree, dec=41.2*u.degree, frame='icrs')
coord_galactic = coord.galactic

# Time
t = Time('2023-01-15 12:30:00')
jd = t.jd  # Julian Date

# FITS files
data = fits.getdata('image.fits')
header = fits.getheader('image.fits')

# Tables
table = Table.read('catalog.fits')

# Cosmology
d_L = Planck18.luminosity_distance(z=1.0)
```

## 核心功能

### 1. 单位和量（`astropy.units`）

处理带单位的物理量，执行单位转换，并确保计算中的量纲一致性。

**关键操作：**
- 通过将数值与单位相乘来创建量
- 使用 `.to()` 方法在单位之间转换
- 执行自动处理单位的算术运算
- 使用等价关系进行领域特定的转换（光谱、多普勒、视差）
- 处理对数单位（星等、分贝）

**参见：** `references/units.md`，了解完整文档、单位系统、等价关系、性能优化和单位算术。

### 2. 坐标系（`astropy.coordinates`）

表示天体位置，并在不同坐标框架之间进行转换。

**关键操作：**
- 使用 `SkyCoord` 在任意坐标框架中创建坐标（ICRS、Galactic、FK5、AltAz 等）
- 在坐标系之间转换
- 计算角距离和位置角
- 将坐标与星表进行匹配
- 包含距离以进行三维坐标操作
- 处理自行和径向速度
- 从在线数据库查询命名天体

**参见：** `references/coordinates.md`，了解详细的坐标框架说明、转换、依赖观测者的坐标框架（AltAz）、星表匹配和性能建议。

### 3. 宇宙学计算（`astropy.cosmology`）

使用标准宇宙学模型执行宇宙学计算。

**关键操作：**
- 使用内置宇宙学模型（Planck18、WMAP9 等）
- 创建自定义宇宙学模型
- 计算距离（光度距离、共动距离、角直径距离）
- 计算年龄和回溯时间
- 确定任意红移下的哈勃参数
- 计算密度参数和体积
- 执行反向计算（根据给定距离查找 z）

**参见：** `references/cosmology.md`，了解可用模型、距离计算、时间计算、密度参数和中微子效应。

### 4. FITS 文件处理 (`astropy.io.fits`)

读取、写入和操作 FITS（灵活图像传输系统）文件。

**关键操作：**
- 使用上下文管理器打开 FITS 文件
- 按索引或名称访问 HDU（头数据单元）
- 读取和修改头信息（关键字、注释、历史记录）
- 处理图像数据（NumPy 数组）
- 处理表格数据（二进制表和 ASCII 表）
- 创建新的 FITS 文件（单扩展或多扩展）
- 对大型文件使用内存映射
- 访问远程 FITS 文件（S3、HTTP）

**参见：** `references/fits.md`，了解全面的文件操作、头信息操作、图像和表格处理、多扩展文件及性能注意事项。

### 5. 表格操作 (`astropy.table`)

处理表格数据，支持单位、元数据和多种文件格式。

**关键操作：**
- 从数组、列表或字典创建表格
- 以多种格式读取/写入表格（FITS、CSV、HDF5、VOTable）
- 访问和修改列与行
- 对表格进行排序、筛选和索引
- 执行数据库风格的操作（连接、分组、聚合）
- 堆叠和连接表格
- 使用感知单位的列（QTable）
- 使用掩码处理缺失数据

**参见：** `references/tables.md`，了解表格创建、I/O 操作、数据处理、排序、筛选、连接、分组和性能提示。

### 6. 时间处理 (`astropy.time`)

精确表示时间，并在时间尺度和格式之间进行转换。

**关键操作：**
- 以多种格式创建 Time 对象（ISO、JD、MJD、Unix 等）
- 在时间尺度之间转换（UTC、TAI、TT、TDB 等）
- 使用 TimeDelta 执行时间算术运算
- 计算观测者的恒星时
- 计算光行时修正（质心、日心）
- 高效处理时间数组
- 处理掩码（缺失）时间

**参见：** `references/time.md`，了解时间格式、时间尺度、转换、算术运算、观测功能和精度处理。

### 7. 世界坐标系统 (`astropy.wcs`)

在图像中的像素坐标与世界坐标之间进行转换。

**关键操作：**
- 从 FITS 头信息中读取 WCS
- 将像素坐标转换为世界坐标（以及反向转换）
- 计算图像覆盖范围
- 访问 WCS 参数（参考像素、投影、比例）
- 创建自定义 WCS 对象

**参见：** `references/wcs_and_other_modules.md`，了解 WCS 操作和转换。

## 附加功能

`references/wcs_and_other_modules.md` 文件还涵盖：

### NDData 和 CCDData
用于存储带有元数据、不确定性、掩码和 WCS 信息的 n 维数据集的容器。

### 建模
用于创建数学模型并将其拟合到天文数据的框架。

### 可视化
提供具有适当拉伸和缩放功能的天文图像显示工具。

### 常量
具有正确单位的物理和天文常量（光速、太阳质量、普朗克常量等）。

### 卷积
用于平滑和滤波的图像处理核。

### 统计
包括 sigma 裁剪和异常值剔除在内的稳健统计函数。

## 安装

```bash
# Reproducible install against the current stable release
uv pip install "astropy==7.2.0"

# Recommended optional dependencies for plotting and common workflows
uv pip install "astropy[recommended]==7.2.0"

# Full optional dependency set for broad astronomy workflows
uv pip install "astropy[all]==7.2.0"
```

Astropy 7.2.0 要求 Python 3.11+，并依赖于 NumPy、PyERFA、PyYAML 和 packaging。请使用隔离的虚拟环境；不要以提升的权限安装 Astropy。

请注意，`[recommended]` 和 `[all]` 扩展项会以未固定版本引入传递依赖项（matplotlib、scipy 等）。对于可复现的生产环境，请使用锁文件固定完整依赖树（在项目中使用 `uv lock`，或针对 requirements 文件使用 `uv pip compile`），并在部署前审查解析后的版本。

## 常见工作流

### 在坐标系统之间转换坐标

```python
from astropy.coordinates import SkyCoord
import astropy.units as u

# Create coordinate
c = SkyCoord(ra='05h23m34.5s', dec='-69d45m22s', frame='icrs')

# Transform to galactic
c_gal = c.galactic
print(f"l={c_gal.l.deg}, b={c_gal.b.deg}")

# Transform to alt-az (requires time and location)
from astropy.time import Time
from astropy.coordinates import EarthLocation, AltAz

observing_time = Time('2023-06-15 23:00:00')
observing_location = EarthLocation(lat=40*u.deg, lon=-120*u.deg)
aa_frame = AltAz(obstime=observing_time, location=observing_location)
c_altaz = c.transform_to(aa_frame)
print(f"Alt={c_altaz.alt.deg}, Az={c_altaz.az.deg}")
```

### 读取和分析 FITS 文件

```python
from astropy.io import fits
import numpy as np

# Open FITS file
with fits.open('observation.fits') as hdul:
    # Display structure
    hdul.info()

    # Get image data and header
    data = hdul[1].data
    header = hdul[1].header

    # Access header values
    exptime = header['EXPTIME']
    filter_name = header['FILTER']

    # Analyze data
    mean = np.mean(data)
    median = np.median(data)
    print(f"Mean: {mean}, Median: {median}")
```

### 宇宙学距离计算

```python
from astropy.cosmology import Planck18
import astropy.units as u
import numpy as np

# Calculate distances at z=1.5
z = 1.5
d_L = Planck18.luminosity_distance(z)
d_A = Planck18.angular_diameter_distance(z)

print(f"Luminosity distance: {d_L}")
print(f"Angular diameter distance: {d_A}")

# Age of universe at that redshift
age = Planck18.age(z)
print(f"Age at z={z}: {age.to(u.Gyr)}")

# Lookback time
t_lookback = Planck18.lookback_time(z)
print(f"Lookback time: {t_lookback.to(u.Gyr)}")
```

### 交叉匹配星表

```python
from astropy.table import Table
from astropy.coordinates import SkyCoord, match_coordinates_sky
import astropy.units as u

# Read catalogs
cat1 = Table.read('catalog1.fits')
cat2 = Table.read('catalog2.fits')

# Create coordinate objects
coords1 = SkyCoord(ra=cat1['RA']*u.degree, dec=cat1['DEC']*u.degree)
coords2 = SkyCoord(ra=cat2['RA']*u.degree, dec=cat2['DEC']*u.degree)

# Find matches
idx, sep, _ = coords1.match_to_catalog_sky(coords2)

# Filter by separation threshold
max_sep = 1 * u.arcsec
matches = sep < max_sep

# Create matched catalogs
cat1_matched = cat1[matches]
cat2_matched = cat2[idx[matches]]
print(f"Found {len(cat1_matched)} matches")
```

## 最佳实践

1. **始终使用单位**：为量附加单位，以避免错误并确保量纲一致性
2. **对 FITS 文件使用上下文管理器**：确保正确关闭文件
3. **优先使用数组而不是循环**：将多个坐标或时间作为数组进行处理，以获得更好的性能
4. **检查坐标系**：在进行变换之前验证坐标系
5. **使用合适的宇宙学模型**：为分析选择正确的宇宙学模型
6. **处理缺失数据**：对于包含缺失值的表，使用 masked columns
7. **指定时间尺度**：对于精确计时，明确指定时间尺度（UTC、TT、TDB）
8. **使用 QTable 处理带单位的表**：当表列带有单位时
9. **检查 WCS 有效性**：在使用变换之前验证 WCS
10. **缓存频繁使用的值**：可以缓存开销较大的计算结果（例如宇宙学距离）
11. **明确网络访问行为**：`SkyCoord.from_name()`、`EarthLocation.of_site(refresh_cache=True)`、`EarthLocation.of_address()`、`download_file()`、远程 FITS 读取以及某些 IERS 时间/坐标变换可能会联系外部服务或更新本地缓存。避免将敏感的目标名称、地址、URL 或专有文件位置发送给第三方服务。在处理可能敏感的目标或数据位置时，请在进行这些网络调用前向用户确认。
12. **固定版本以确保可复现性**：对于共享环境，使用诸如 `astropy==7.2.0` 这样的固定版本；在查看发行说明后，有意地更新版本固定信息。

## 当前版本说明

- 当前经过研究的稳定版本：Astropy 7.2.0（发布于 2025-11-25；截至 2026-06-10 已确认是当前版本）
- Python 要求：3.11+
- **Astropy 8.0 处于候选发布阶段**（8.0.0rc1，2026-05-26）。需要提前注意的主要变更：
  - 已弃用的 `astropy.cosmology` 子模块 shim（`astropy.cosmology.flrw`、`.core`、`.funcs`、`.connect`、`.parameter`）将被移除——请直接从 `astropy.cosmology` 导入所有内容（例如，`from astropy.cosmology import FlatLambdaCDM, z_at_value`）
  - `astropy.constants` 的默认值将从 CODATA 2018 更改为 CODATA 2022；如果可复现性很重要，请通过 `astropyconst` science states 固定常数版本
  - NumPy 2.0 将成为最低支持版本；7.2.x LTS 分支将在 8.0 发布后的六个月内继续支持 NumPy 1.x
  - 内置测试运行器（`astropy.test()`、`TestRunner`）已正式弃用——请直接调用 `pytest`
- 新代码中应避免使用近期 7.x 弃用的功能：将表索引标识符作为第一个 `.loc` 元素传入（`t.loc["b", 2]`）——改用 `t.loc.with_index("b")[2]`（计划在 9.0 中移除）；`astropy.utils.isiterable()`——改用 `numpy.iterable()`
- 近期 7.0 的移除项：较早的已弃用 FITS API，例如 `(Bin)Table.update`、`_ExtensionHDU`、`_NonstandardExtHDU` 以及 `CompImageHDU` 的 `tile_size` 参数；`CompImageHeader` 已弃用。在新示例中避免使用这些旧模式。
- 推荐的可选 extras 是用于常见绘图/科学依赖的 `recommended`，以及仅在需要广泛的可选功能集时使用的 `all`。

## 文档和资源

- Astropy 官方文档：https://docs.astropy.org/en/stable/
- 教程：https://learn.astropy.org/
- GitHub：https://github.com/astropy/astropy

## 参考文件

有关特定模块的详细信息：
- `references/units.md` - 单位、量、转换和等价关系
- `references/coordinates.md` - 坐标系、变换和星表匹配
- `references/cosmology.md` - 宇宙学模型和计算
- `references/fits.md` - FITS 文件操作和处理
- `references/tables.md` - 表格创建、I/O 和操作
- `references/time.md` - 时间格式、时间尺度和计算
- `references/wcs_and_other_modules.md` - WCS、NDData、建模、可视化、常量和实用工具