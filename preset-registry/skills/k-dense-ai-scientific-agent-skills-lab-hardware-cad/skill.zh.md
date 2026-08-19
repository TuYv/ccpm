---
name: lab-hardware-cad
description: Design custom laboratory hardware as parametric build123d models and export fabrication-ready STEP, STL, and DXF files - microfluidic chips and molds, optomechanical mounts and breadboard adapters, cuvette and microplate holders, tube racks, animal-behavior rigs, and 3D-printed instrument fixtures. Use when a research task needs a physical part that must mate with standardized labware, an optical table, a cage system, or a printer, CNC, or laser process.
license: MIT
compatibility: Python 3.10-3.14 with build123d 0.11.1 and matplotlib for snapshots. Geometry commands require build123d; the standards lookup and the interface check run on the standard library alone. No network access needed.
allowed-tools: Read Write Edit Bash Glob Grep
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
  last-reviewed: "2026-08-15"
  build123d-version: "0.11.1"
---
# 实验室硬件 CAD

将实体研究硬件设计为**参数化 Python 源代码**，导出 STEP 作为权威产物，并在进行任何制造之前，从数值和视觉两方面验证结果。

实验室硬件最棘手的地方几乎从来不是几何形状，而是零件必须与尺寸由公开标准或供应商图纸规定的设备配合。支架宽 0.5 mm 就无法装入酶标仪；通道的宽高比不正确，就会在键合过程中塌陷；安装座的螺栓孔位间距如果是 25.4 mm 而不是 25.0 mm，就无法连接到光学平台。此技能用于确保这些尺寸正确且经过检查。

## 适用场景

对于任何设计、建模或制造实验室实体零件的请求，都应使用此技能：芯片、模具、安装座、转接件、支架、机架、托架、外壳、夹具、固定装置、实验场或迷宫。也适用于检查或修改现有 STEP 文件。

**不要**用于有限元分析、计算流体力学、分子结构或科学绘图。这些属于其他技能。

## 设置

```bash
uv venv --python 3.12 .venv-labcad
uv pip install --python .venv-labcad/bin/python "build123d==0.11.1" "matplotlib>=3.8"
```

build123d 0.11.1 需要 Python >=3.10,<3.15，并通过
`cadquery-ocp-novtk` 引入 OpenCascade 内核。该 wheel 体积较大；每个项目安装一次并重复使用。

所有附带脚本都支持 `--help`。`check.py standards` 无需安装 build123d 即可运行。

**模型文件会被执行，而不是被解析。** `gen.py`、`check.py` 和 `snapshot.py` 会导入
一个 `*_model.py` 并调用其 `build()`，该调用会在当前环境中运行任意 Python 代码。这是参数化 CAD 固有的特性——源代码就是设计本身。只能运行本次会话中编写的模型文件，或由用户从可信位置提供的模型文件。如果模型来自互联网、共享驱动器或不受信任的同事，请先阅读后再运行，并说明你已经这样做了。

## 必需的工作流程

按顺序执行以下步骤。第 5 步和第 6 步不是可选项，第 5 步通过也不能免除第 6 步。

### 1. 归入设备系列

阅读请求，对其进行分类，并加载**恰好一个**系列参考文档。不要加载全部四个——它们篇幅较长，在不同系列之间混用约定是常见的错误来源。

| 如果零件是 | 加载 |
| --- | --- |
| 芯片、模具、通道网络、流通池、垫片，或任何带有流体端口的部件 | `references/microfluidics.md` |
| 光路中的安装座、立柱、面包板转接件、笼式系统部件、滤光片架或样品架 | `references/optomechanics.md` |
| 用于微孔板、比色皿、试管、载玻片或培养皿的转接件、插入件、机架或支架 | `references/labware-adapters.md` |
| 用于动物实验的实验场、迷宫、头部固定部件、出液嘴、系绳或挤出安装式外壳 | `references/behavior-rigs.md` |

如果零件确实跨越两个系列——例如连接到光学平台的微流控芯片——则加载拥有**关键接口**的系列，然后只阅读第二个系列中的接口部分。在回复中说明你归入了哪个系列。

### 2. 在创建任何几何体之前确定接口尺寸

每个零件至少有一个配合接口。在编写代码之前，为每个接口记下：

- 尺寸的**来源**：已发布的标准、供应商图纸或用户测量值；
- **标称值和公差**；
- 你打算采用的**间隙或过盈**，以及原因。

在 `assets/standards.json` 或系列参考文档中查找该数值。**绝不要凭记忆填写接口尺寸。** 如果该数值不在标准文件或参考文档中，应要求用户提供供应商图纸或测量值，而不是自行猜测。猜测接口尺寸是此技能中代价最高的单一失效模式。

必须*接纳*标准化组件的特征，应以该组件的**最大实体状态**——标称值加上正公差——为基准确定尺寸，之后再增加间隙。若以标称值为基准确定尺寸，则它只能适配符合要求的零件中尺寸较小的一半。

```bash
python scripts/check.py standards --list
python scripts/check.py standards --show slas-microplate-footprint
```

捆绑的标准 ID（必须使用精确字符串；不要猜测变体）包括：`slas-microplate-footprint`、
`slas-microplate-height`、`slas-microplate-flange`、`slas-well-positions-96`、
`slas-well-positions-384`、`slas-well-positions-1536`、`cuvette-standard-10mm`、
`optical-breadboard-metric`、`optical-breadboard-imperial`、`cage-system-30mm`、
`sm1-lens-tube-thread`。

如果零件不与列表中的任何对象配合，这很常见，也完全没问题：声明没有接口，并在报告中将每个接口尺寸及其来源（用户规格、供应商图纸、测量值）标记为**未检查**。绝不要为了填补空缺而声明一个无关标准——虚构的声明比诚实地写下“没有人检查过这个”更糟糕。

### 3. 在选择几何体之前选择工艺

阅读 `references/fabrication-limits.md`。工艺决定最小壁厚、最小特征尺寸、可实现的公差，以及零件能否承受高压灭菌或与所用溶剂接触。在模型文档字符串中记录工艺和材料。

### 4. 编写参数化模型

编写 `<part>_model.py`。源文件是权威产物——**绝不要手动编辑导出的
STEP 文件**，也绝不要从网格重新生成。

要求：

- 用户可能修改的每个尺寸都必须是一个**模块级命名常量**，并在名称中带有单位：`bore_d_mm`、`wall_t_mm`、`post_h_mm`。除 0、1 和 2 外，正文中不得出现无名称的数字。
- 暴露 `build() -> Part`。`gen.py` 会调用它。
- 将参数分组到 `INTERFACE` 块（由标准固定的尺寸，并注明标准 ID）和 `DESIGN` 块（可自由选择的尺寸）中。
- **在函数内部派生所有计算尺寸**，绝不要在模块级别派生，这样 `--param` 覆盖才能真正传递到这些计算中。
- 声明一个 `interfaces()` 函数，返回零件必须适配的尺寸，并为每个尺寸提供其标准 ID 和意图。这使接口能够在第 5 步进行机器检查。特征必须**接纳**任何符合标准的零件时，`intent` 为 `"envelope"`（凹槽、孔或槽——在最大实体状态加上你的间隙条件下进行单侧检查）；本零件自身必须符合标准时，`intent` 为 `"match"`（对称公差带）。`clearance` 是预期的总间隙，单位为 mm，且必须为非负值。只声明约束本零件配合特征的尺寸——配合设备的属性（例如工作台的边缘边框、典型的板厚）不是你的接口。如果没有适用的捆绑标准，则返回 `[]`。
- 声明一个 `checks()` 函数，用于检查从构建实体测得的**通过/不通过量规**：对于所有必须穿过或装入其中的对象（螺钉杆、光束通道、处于最大实体状态并放入其凹槽的配合零件），设置一个 `clear` 区域；对于所有必须保留的对象（凸棱、台阶、螺钉座），设置一个 `material` 区域；对于用户声明的每个尺寸限制，设置一个 `bbox_*` 边界。将请求中的**每一项几何要求**映射到一个条目；这些检查能够捕获 `is_valid`、包围盒和声明数值无法发现的错误。`gen.py` 会在每次生成时运行这些检查，并在任一项失败时使构建失败。模式和完整示例见：`references/build123d-patterns.md`。
- 在模块文档字符串中写明工艺、材料以及每个接口的来源。

```python
"""SLAS microplate carrier for a custom stage insert.

Process: FDM, PETG, 0.2 mm layer.  Tolerance budget +/-0.3 mm.
Interfaces:
  - Plate pocket: ANSI/SLAS 1-2004 (R2012) footprint 127.76 x 85.48 mm, +/-0.25.
  - Stage bolts: user-measured, 40.0 mm centres (drawing in docs/stage.pdf).
"""
from build123d import *

# --- INTERFACE (fixed by standard; do not tune) ---
plate_l_mm = 127.76   # ANSI/SLAS 1-2004 nominal
plate_w_mm = 85.48    # ANSI/SLAS 1-2004 nominal
plate_tol_mm = 0.25   # ANSI/SLAS 1-2004; the pocket is sized to nominal + this
# --- DESIGN (free) ---
pocket_clearance_mm = 0.40   # per-side; FDM, see fabrication-limits.md
wall_t_mm = 3.0
floor_t_mm = 2.5
body_h_mm = 12.0


def pocket_mm() -> tuple[float, float]:
    """Pocket at the plate's maximum material condition plus clearance per side.

    A pocket sized from nominal jams on roughly half of conforming plates.
    """
    growth = plate_tol_mm + 2 * pocket_clearance_mm
    return plate_l_mm + growth, plate_w_mm + growth


def interfaces() -> list[dict]:
    """What this part must fit. `check.py interfaces` verifies every entry."""
    pocket_l, pocket_w = pocket_mm()
    return [
        {"feature": "plate pocket length", "standard": "slas-microplate-footprint",
         "dimension": "footprint_length", "value": pocket_l,
         "intent": "envelope", "clearance": 2 * pocket_clearance_mm},
        {"feature": "plate pocket width", "standard": "slas-microplate-footprint",
         "dimension": "footprint_width", "value": pocket_w,
         "intent": "envelope", "clearance": 2 * pocket_clearance_mm},
    ]


def checks() -> list[dict]:
    """Gauges measured from the built solid. Sized from the REQUIREMENT's numbers
    (plate MMC, the user's height limit), not from the pocket parameters, so a
    wrong parameter cannot shrink the gauge to match the wrong geometry."""
    depth = body_h_mm - floor_t_mm
    return [
        {"feature": "plate at MMC drops into the pocket",
         "clear": {"box": (plate_l_mm + plate_tol_mm, plate_w_mm + plate_tol_mm, depth),
                   "at": [(0.0, 0.0, floor_t_mm + depth / 2)]}},
        {"feature": "under 15 mm for the stage", "bbox_z": {"max": 15.0}},
    ]


def build() -> Part:
    pocket_l, pocket_w = pocket_mm()
    with BuildPart() as carrier:
        Box(pocket_l + 2 * wall_t_mm, pocket_w + 2 * wall_t_mm, body_h_mm,
            align=(Align.CENTER, Align.CENTER, Align.MIN))
        with Locations((0, 0, floor_t_mm)):
            Box(pocket_l, pocket_w, body_h_mm, mode=Mode.SUBTRACT,
                align=(Align.CENTER, Align.CENTER, Align.MIN))
    return carrier.part
```

有关 builder-vs-algebra 的选择、`interfaces()` 契约、草图绘制、选择器、圆角和螺纹嵌件孔，请参见 `references/build123d-patterns.md`。

### 5. 生成并运行检查

```bash
python scripts/gen.py carrier_model.py --outdir out/
python scripts/check.py facts out/carrier.step
python scripts/check.py interfaces out/carrier.manifest.json
python scripts/check.py geometry out/carrier.step --model carrier_model.py
```

`gen.py` 还会根据刚刚构建的实体评估模型的 `checks()` gauges，打印每项 PASS/FAIL，将结果记录到 manifest 中，并在检查失败时以非零状态退出——因此，违反自身声明几何约束的零件绝不会悄无声息地变成产物。`check.py geometry` 会针对导出的 STEP 重新运行同一组 gauges，而 STEP 才是权威产物。

`out/` 是一种临时目录约定，并非强制要求。当用户要求将交付物放在特定位置时，应在那里生成（`--outdir .`），或在结束前将 STEP、manifest 和 DXF 复制到该位置——只存在于 `out/` 内的交付物并不算已经交付。

`gen.py` 会写入 `carrier.step`（权威产物）、`carrier.stl`（网格预览和打印使用），以及记录源文件哈希、解析后的参数、声明的接口、库版本和实测包围盒、体积与有效性的 `carrier.manifest.json`。manifest 是溯源记录——应将它与产物放在一起。

`check.py facts` 会报告 `is_valid`、包围盒、体积、表面积、质心和实体数量。报告 `is_valid: false` 的零件属于损坏的几何体；在继续之前修复源文件。

`check.py interfaces` 会根据标准数据库评估模型声明的每一项接口，并在检查失败时以非零状态退出。**必须明确它会验证什么、不会验证什么：**它检查的是*声明的数值*——可以发现抄录的尺寸错误、使用了错误的标准，以及使用公称尺寸而非 MMC 尺寸进行定尺寸的问题——但它绝不会测量构建出的几何体；而且，如果某个值是使用与检查它的相同常量计算出来的，那么按照构造，它会在没有任何余量的情况下通过。不要将它作为几何体正确的证据；`facts` 和 snapshot 才是几何检查。空的声明列表也会通过：与捆绑数据库中的任何内容都不配合的零件没有需要声明的接口，其接口尺寸会在报告中标记为未检查。

对于任何内部特征，应使用 `interfaces`，而不是 `check.py fit`——凹 pocket、孔或槽不会出现在零件的外部包围盒中，而这正是 `fit` 测量的对象。只有在需要手动检查一个数值时（`--value footprint_length=128.81`），或零件自身的轮廓就是接口时（例如按照板件轮廓裁切的垫片），才使用 `fit`。

对于装配体，请检查零件之间是否发生干涉：

```bash
python scripts/check.py clearance out/carrier.step out/lid.step --min 0.3
```

### 6. 获取快照并实际查看

```bash
python scripts/snapshot.py out/carrier.step --out out/carrier.png
```

然后**读取 PNG**。每次生成和每次修改之后都必须执行此步骤。
确定性检查通过并不是跳过它的理由：`is_valid` 和正确的包围盒，都完全可能与在错误表面切出的 pocket、放置在主体外部的凸台，或吃掉某个特征的圆角相一致。这些错误在图片中很明显，却无法从数字中看出来。

也要了解渲染的局限性。相对于画面太小的特征——例如 40 mm 零件上的 0.3 mm 模具凸脊、板件上的沉孔台阶——可能根本无法从这些视图中判断。不要声称看到了图像无法分辨的内容；这比不看更糟。对于此类特征，该 skill 提供了相应工具：`check.py bores` 会打印每个圆柱面（直径、轴线、位置、跨度、扫掠角），以便你将钻孔情况与模型意图进行核对；`check.py probe` 则可以在不编辑模型的情况下，回答一次性的“该区域是否畅通 / 此处是否存在材料”问题。引用测量出的数值；对于图片，只报告图片实际显示的内容。

这六个视图是真正的正交投影，轮廓线是模型的实际边缘，绘制时**未消除隐藏线**。因此，透过材料可见的圆形是远侧的孔，而不是窗口——零件并不透明。应按这种方式解读，而不要报告一个并不存在的孔。

请在响应中说明你在快照中看到了什么，而不只是说你生成了快照。

### 7. 通过源代码修复

如果任何检查失败，请编辑参数或模型代码，重新运行 `gen.py`，并重新运行**第 5 步和第 6 步**。绝不要直接修改 STEP 文件。

### 8. 制造前报告

按照 `references/validation.md` 逐项执行，并向用户提供：工艺和材料、每个接口尺寸及其来源和公差、所选的间隙、快照显示的内容，以及任何未通过的检查。

明确标出自动检查无法覆盖的每个接口——供应商图纸、用户测量值、未包含在随附数据库中的标准。`check.py interfaces` 只报告模型针对已知标准声明的内容，因此其中没有报告并不代表已确认；任何无人能够检查的尺寸都必须明确列出。

## 单位

build123d 在内部不带单位，本技能中的所有内容均使用**毫米和度**。调用 `export_step` 时使用 `Unit.MM`。英制硬件在光机系统中随处可见（1/4-20 螺钉、1 英寸网格、SM1 螺纹）；请在定义位置通过一个单独命名的常量将其转换为毫米，并且绝不要在同一个表达式中混用单位制。1 英寸正好等于 25.4 mm，25 mm 的公制光学网格**不可**与 1 英寸英制网格互换——四个孔累计会产生 1.6 mm 的误差。

## 公差和配合

公称尺寸不等于配合尺寸。每个配合尺寸都需要根据 `references/fabrication-limits.md` 中的工艺公差，有意选择间隙。常见默认值（每侧）：

| 配合 | FDM | SLA | CNC |
| --- | --- | --- | --- |
| 自由滑动（板件装入凹槽） | 0.40 mm | 0.20 mm | 0.10 mm |
| 定位但可拆卸 | 0.25 mm | 0.10 mm | 0.05 mm |
| 压入 / 过盈 | -0.05 mm | -0.03 mm | -0.02 mm |

这些数值是首件制作的起始点，并非保证值。报告这些数值时要说明这一点，并建议在确定制作完整零件之前，先打印一个关键接口的测试样件。

## 科学方面的注意事项

- **材料相容性起决定作用。** 几何上完美但聚合物选错的零件在实际使用中仍会失效：高压灭菌循环会使 PLA 变形，许多溶剂会使亚克力产生龟裂，而未固化的 SLA 树脂具有细胞毒性。在为任何会接触细胞、组织、溶剂或热量的部件推荐材料之前，请检查 `references/fabrication-limits.md`。
- **光学零件有几何要求之外的要求。** 自发荧光、表面粗糙度和杂散光散射在 STEP 文件中不可见。黑色树脂并不自动意味着低散射。
- **供应商的实验室耗材存在差异。** SLAS 标准规定了板件的外形尺寸，但没有规定孔位几何形状、裙边轮廓或盖子的配合情况，并且不同供应商提供的耗材管规格也不同。在有标准的情况下，应按标准设计；否则必须要求进行测量。
- **包围盒检查通过并不代表零件合格。** `fit` 只检查提供给它的尺寸。它无法发现缺失的特征，也不能替代快照。

## 参考资料

| 文件 | 内容 |
| --- | --- |
| `references/microfluidics.md` | 通道横截面和纵横比、模具与芯片的极性、不同工艺的最小特征尺寸、端口和管路接口、键合区域、死体积 |
| `references/optomechanics.md` | 光学平台网格和螺钉间隙、支柱和底座高度、30 mm 笼式结构几何尺寸、SM 镜筒螺纹、光束高度 |
| `references/labware-adapters.md` | ANSI/SLAS 1-4 微孔板尺寸、比色皿、管、载玻片、培养皿、平台和载物台约束 |
| `references/behavior-rigs.md` | 竞技场和迷宫几何尺寸、头部固定接口、出液嘴和端口、T 型槽挤压型材、清洁和耐久性 |
| `references/fabrication-limits.md` | 工艺公差、最小壁厚和特征尺寸、间隙和螺纹嵌件、材料、高压灭菌、溶剂兼容性和生物相容性 |
| `references/validation.md` | 制造前检查清单，以及每个检查项目所能捕获的失效模式 |
| `references/build123d-patterns.md` | build123d 0.11.1 API 实用指南：构建器与代数建模、草图、选择器、接合件、导出 |

## 脚本

| 命令 | 用途 |
| --- | --- |
| `gen.py <model.py> --outdir DIR` | 运行 `build()`，导出 STEP 和 STL，并写入溯源清单 |
| `gen.py <model.py> --dxf [--dxf-z MM]` | 同时切片生成用于激光切割的二维 DXF 轮廓（默认平面：中等高度） |
| `check.py facts <step>` | 有效性、包围盒、体积、面积、质心、实体数量 |
| `check.py interfaces <manifest\|model.py>` | 根据相应标准检查每个已声明的接口尺寸；失败时以非零状态退出 |
| `check.py geometry <model.py\|step --model M>` | 根据构建后的实体评估模型的 `checks()` 检查量——测量得到，而非声明得到 |
| `check.py probe <step> --cyl D\|--box X,Y,Z --at ...` | 单次临时检查：该区域是否没有材料，或是否被材料填充 |
| `check.py bores <step>` | 统计每个圆柱面：直径、轴线、位置、跨度、扫掠角度 |
| `check.py fit --standard ID --value DIM=MM` | 手动检查一个尺寸，或检查外部包络就是该接口的零件 |
| `check.py clearance <a> <b> --min MM` | 两个实体之间的最小距离；检测干涉 |
| `check.py standards [--list\|--show ID]` | 浏览捆绑的标准数据（仅标准库） |
| `snapshot.py <step> --out PNG` | 生成六视图正交投影和等轴测渲染图，用于目视检查 |

所有命令都接受 `--json` 以输出机器可读的结果，并将进度写入 stderr。  
`check.py standards`，以及针对清单运行的 `check.py interfaces`，无需安装 build123d 即可运行。