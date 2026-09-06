---
name: dxf
description: Generate, regenerate, and validate 2D DXF drawings from Python build123d sources. Use for DXF files, `.py` drawing scripts, @dxf models, 2D profiles, outlines, templates, gaskets, panels, flat patterns, laser/plasma/waterjet cut layouts, and 2D drawing exports of CAD geometry.
---
# DXF 生成与验证

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。  
以本地安装的 skill 文件作为运行时事实来源；仓库链接仅用于来源追溯和发布审查。

## 设置

此 skill 的命令是 `cadgen` distribution 的薄封装入口；该 distribution 携带 Python 构建运行时及其执行的 JavaScript。安装一次即可：

```bash
python -m pip install -r requirements.txt
```

图纸使用 build123d 几何体，因此图纸构建与 STEP 构建一样会加载 CAD kernel（冷启动约需 2.5 秒；温启动时由常驻 daemon 吸收这部分开销）。只有 `cadgen dxf snapshot` 额外需要 **`PATH` 中存在 Node 20 或更高版本**——它会通过内置的 Node 单次进程按需对展开图进行网格化；如果缺少 `node`，渲染时会报告该问题。

## 用途

根据自然语言需求或 CAD 几何体创建或修改 2D DXF 图纸，生成经过验证的图纸产物，并返回已检查的输出。DXF 图纸的事实来源是名为 `<name>.py` 的 Python 文件，其中定义了一个无参数的 `@dxf` 模型函数。

**图纸就是模型。** 它拥有与 `@step` 零件相同的封装器、记录、新鲜度门控和构建作业；其唯一输出是 `.dxf` 文件；它没有几何树（没有任何内容链接到图纸）。每次运行都会写入同级的 `<name>.dxf`（或装饰器命名的 `out=`）；源文件未改变时则不执行任何操作；调用零件模型的图纸——例如在其函数体中调用 `bracket()`——会在该零件的 GEOMETRY 发生变化时变为过期状态，在零件未变化时保持当前状态；`cadgen store why <drawing>.py` 可解释该判定；`--force` 会无论如何重新构建。CAD Viewer 和 `dxf snapshot` 读取的都是 `.dxf` 文件本身，因此交给切割服务的文件与查看器渲染的文件完全相同。

## 合约

**`@dxf` 函数不接受参数，并返回 build123d 2D 几何体。引擎负责写入 DXF。** 你不需要创建文档、命名文件或放置实体——这与 `@step` 所采用的职责划分相同。

```python
from cadgen import build123d as bd
from cadgen import dxf


HOLE_D = 4.5


@dxf
def gasket():
    with bd.BuildSketch() as cut:
        bd.Rectangle(60, 40)
        bd.Circle(HOLE_D / 2, mode=bd.Mode.SUBTRACT)
    return cut.sketch          # bare shape -> the CUT layer


if __name__ == "__main__":
    gasket()
```

- **裸形状** → 一个 `CUT` 图层。这就是大多数图纸的完整合约。
- **`{layer: shape}`** → 命名图层，适用于确实包含多个 CAM 操作（`CUT` / `ENGRAVE` / `SCORE`）的图纸。其子项全部带有标签的 `Compound` 具有相同含义。
- **无参数。** 尺寸应定义为模块常量（`HOLE_D = 4.5`），或定义为从图纸所派生的零件中导入的常量；不同的图纸应使用不同的文件。
- **文本** 使用 `bd.Text(...)` 在标记图层上雕刻为 OUTLINES，绝不能使用 DXF `TEXT` 实体：切割和标记工具链消费的是几何体，而 CAM 内部的字体渲染并不可靠。
- **几何体必须位于 XY 平面。** 从实体中取得的面会位于该实体的高度；请将其重新定位（`flatten.flatten_face(face)`，或 `bd.Location((0, 0, -z)) * face`）。引擎会拒绝偏离平面的几何体，而不是默默写入其 XY 投影。
- **输出字节由几何体决定。** 图层按名称排序，实体按几何内容排序，因此未改变的图纸无论在冷启动还是温启动、无论在哪台机器上重新构建，都会生成完全相同的文件。

## 三种 DXF 工作流

创建新图纸时，从
`references/generator-templates.md` 复制适用工作流的完整模板。

1. **从头绘制**（垫片、面板、模板、没有其背后 3D 模型的切割布局）：使用一个构建草图并返回它们的 `<name>.py`。

2. **生成的 STEP 零件的展开图**：在其所派生的模型旁放置一个图纸脚本，并使用其**自己的** stem（每个文件一个模型，`bracket_drawing.py` 放在 `bracket.py` 旁边）。导入模型并调用它，就像装配组合子零件一样：导入不会进行构建，而是在图纸的构建过程中调用并返回零件几何体（如果零件已过期，则先构建零件）。

   ```python
   from cadgen import dxf, flatten
   from bracket import bracket        # a child: tracked by its RESULT

   KERF = 0.15


   @dxf
   def bracket_drawing():
       return flatten.flat_pattern(bracket(), coordinate=3.0, kerf=KERF)


   if __name__ == "__main__":
       bracket_drawing()
   ```

   图纸的记录会固定零件的树，因此会使图纸过期，而不会使那些不改变几何体的零件编辑（注释、重构、颜色）过期。从零件导入的常量（`from bracket import THICKNESS`）也会以相同的方式按值进行追踪。

3. **导入的 STEP 的展开图**（没有 Python 源代码的 `.step`/`.stp`）：使用 `cadgen.read_step` 读取，而不是使用 `build123d.import_step`。它会将文件的内容哈希记录为构建 INPUT，因此替换供应商提供的 STEP 后，图纸会自行变为过期状态，无需使用 `--force`；如果通过 build123d 读取，图纸会针对一个已在其背后发生变化的文件仍保持“current”状态。

   ```python
   from pathlib import Path

   from cadgen import dxf, flatten, read_step

   _HERE = Path(__file__).resolve().parent

   KERF = 0.15


   @dxf
   def panel_flat():
       panel = read_step(_HERE / "imported" / "vendor_panel.step")   # recorded input
       return flatten.flat_pattern(panel, coordinate=3.0, kerf=KERF)


   if __name__ == "__main__":
       panel_flat()
   ```

   **绝不要读取本项目生成的 STEP。** 读取 `@step` 模型写出的 `.step` 并不是循环，而是一张其输入会在模型每次运行时发生变化的图纸：新鲜度门禁永远无法判定为“current”，每次构建都会进行完整重建，并且展开图依赖于上一次运行留在磁盘上的内容。将源 STEP 保存在图纸旁边的 `imported/` 目录中，并像其他输入一样提交到版本控制中——输入路径和输出路径是不同文件，这就是整条规则。对于本项目**确实生成**的 STEP，应改用工作流 2：导入模型脚本并调用它，该方式按结果进行追踪，且永远不会接触构建产物。

每个文件只能有一个模型：同时声明 `@step` 和 `@dxf` 模型的源文件会被拒绝——图纸应拥有自己的脚本。图纸组合模型，反之则不成立：在 `@step` 体内调用 `@dxf` 函数只会得到其 2D 几何体，并且不会建立任何链接。查看器目录只包含构建产物：脚本永远不会被列出；运行所写入的 `.dxf` 才是查看器渲染的条目。

## 使用此技能的情形

当用户请求用于激光、等离子、水刀或 CNC 路由加工的 DXF 文件、二维图纸、轮廓、外形、模板、垫片、面板、展开图或切割布局时，使用此技能。

使用 `$cad` 处理 DXF 所源自的 3D 零件或装配体。使用 `$sendcutsend` 进行 SendCutSend 专用的上传前检查。

## 默认设置

除非用户另有指定，否则使用以下默认设置：

- 单位：毫米。由引擎设置，图纸不声明单位。
- 几何体以 1:1 比例位于 XY 平面。
- 切割轮廓闭合。开放轮廓应放在折弯/雕刻/参考图层上 — 生成验证会强制执行此规则（参见验证）。
- 对于基于 CAD 的零件，使用 `cadgen.flatten` 从真实拓扑派生轮廓，而不是重新绘制轮廓：`planar_faces` 用于选择，`flatten_face` 将面精确展开到 XY 平面，`union_faces` 用于融合，而 `flat_pattern` 一次完成所有操作。仅当不存在可靠的 3D 拓扑时，才手绘参数化外形。
- Kerf / 刀具半径补偿使用 `flatten.offset_profile(shape, amount)` 或 `flat_pattern(..., kerf=...)`；绝不要手动偏移坐标。
- **曲线保持为曲线。** 联合和偏移是精确的 OCC 操作，因此圆角会以 `ARC` 导出，孔会以 `CIRCLE` 导出，并包含 kerf 补偿。如果轮廓最终由数百条短 `LINE` 组成，说明某个环节回退到了采样路径 — 应进行调查，而不是直接接受。
- 图层承载设计意图：将切割几何体与折弯/折叠线保留在不同图层上，并在折弯图层名称中包含 "bend"，以便下游工具将其分类为折弯而不是切割。
- DXF 图层属于图纸结构，而不是 STEP 零件/装配体结构。

## 工具

```bash
python <drawing>.py [flags]                    # its __main__ calls the @dxf model, which writes the .dxf
cadgen dxf snapshot <drawing.dxf> <file.png>   # render it
cadgen store why <drawing>.py                  # why the drawing is stale or current
```

**运行脚本（其 `__main__` 调用）是唯一入口。** 不存在 `cadgen dxf build`：`.dxf` 没有任何派生状态需要命令进行物化 — 文件本身就是产品，CAD Viewer 会直接解析它，而 `dxf snapshot` 会在需要时对其进行网格化。图纸的门控机制使重建成本很低：未更改的源文件，如果其 `.dxf` 仍通过验证且零件子项也未更改，则不会执行任何操作；而 `--force` 会强制重建。文件内容是图纸 GEOMETRY 的函数，因此冷运行和预热的守护进程工作线程会写入相同的文件。构建之间不会相互等待或取消；调用零件的图纸会像任何父级一样并行构建它们。

导入的 `.dxf` 完全不需要任何处理 — 直接将其交给 snapshot 或 Viewer。

使用当前激活的项目 Python 解释器；将 `python` 视为解释器占位符，并使用 `--help` 查看完整接口。目标路径相对于命令的当前工作目录解析；从拥有这些构件的工作区运行命令，并使用相对于 cwd 的目标路径。将图纸脚本放在其派生几何体所在的同一目录中，并命名为 `<name>.py`。

Flags（模型脚本会自行运行；不存在生成 CLI）：

- `--force` — 即使记录的输出是最新的，也重新生成。
- `--verbose`、`--json`。

一次运行会在 stdout 上严格按照 STEP 模型的方式响应 — `built DXF/plate_drawing.dxf`
或 `current DXF/plate_drawing.dxf` — 进度信息写入 stderr；`--json` 会将结果输出为一行 JSON（包含
`outcome`、`document` 和 `tree`，对于 drawing，`tree` 为 null），并为每次状态转换输出一行 JSON。

一个脚本对应一张图纸：运行每个需要构建的脚本。不要将输出路径放入 `@dxf` 函数的返回值中；装饰器上的 `out=` 是图纸指定目标位置的唯一位置（相对于脚本）。

`cadgen dxf snapshot` 将图纸的 3D 平面展开图渲染为 PNG 静态图：

```bash
cadgen dxf snapshot path/to/imported.dxf review.png
cadgen dxf snapshot path/to/drawing.dxf review.png --camera top
```

它只接受 `.dxf` 文档 — 按名称拒绝模型脚本（先运行 `python <drawing>.py`，然后对其写出的图纸执行 snapshot）。该命令会通过捆绑的 Node 单次运行程序按需对平面展开图进行网格化，并通过共享的 snapshot CLI（`cadgen.snapshot_cli`）以及所有渲染 skill 使用的同一个无头浏览器运行时进行渲染 — 因此几何体和材质的渲染结果与 CAD Viewer 完全一致；默认的 `snapshot` 主题与视口的唯一区别是移除了网格、原点轴和阴影。

OUT — 第二个位置参数 — 将严格按照给定路径写入；相对路径会相对于当前工作目录解析。渲染开始前会删除目标文件，完成后的图像会以原子方式写入，因此：迭代时重复使用同一个名称（每次读取都能确定是刚刚运行生成的渲染结果），只有确实需要比较两张图像时才为迭代命名，并将缺少文件视为失败信号 — 路径上永远不会残留旧图像而被误认为输出。目录（将 `tmp/` 作为 OUT）属于不关心具体文件名的情况，会在其中生成一个带时间戳的名称，并打印在 `saved snapshot:` 行中。

语法：`cadgen dxf snapshot TARGET [OUT] [flags]`。Flags：`--mode view|list`、`--camera`、`--theme`、`--size-profile`、`--width`/`--height`、`--job`、`--view-labels`、`--debug`、`--json`。主题设置统一放在一个 `--theme` 下，与查看器的 Theme 选项卡保持一致；默认主题是 `snapshot`，即不带地面网格、原点轴或阴影的 Workbench Light。该命令没有 `--display`，也完全没有 selector、kinematics、section 或 exploded 选项 — 它们会从 `--help` 中直接省略，而不是在运行时拒绝，因为图纸不包含 CAD 拓扑，而显示设置属于 CAD 拓扑设置。

没有任何 CLI 会检查现有的 `.dxf`。如需检查实体或图层，请直接使用 `ezdxf` 读取它（它随 build123d 一起提供）；对于图纸检查，请使用 `validate_dxf_file`；使用 `$cad-viewer` 目视检查几何体。

## 工作流

1. 将请求转换为简短说明：轮廓尺寸、孔和槽、图层、单位、输出路径以及验证目标。
2. 选择工作流：从头开始绘制、生成模型的平面展开图（先使用 `$cad` 创建并验证 3D 几何体），或导入 STEP 的平面展开图。
3. 编写或编辑 `<name>.py` 源文件，将有意义的尺寸定义为命名常量，并复用模型的几何辅助函数，而不是重复公式。
4. 直接运行每个图纸脚本（`python <drawing>.py`）；不要遍历目录。

```bash
python path/to/source.py
python path/to/source.py --force
```

5. 确定性地验证生成的 DXF，然后交接并报告。

## 查看器集成

CAD Viewer 仅对 `.dxf` 文件进行编目（只处理构件，从不处理脚本），它是一个静态可视化工具：它会渲染磁盘上存在的 `.dxf`（自行解析并生成网格：对于标注图纸，生成二维线稿；对于切割布局，生成可折叠的三维平面展开图），并且从不运行脚本。尚不存在 `.dxf` 的图纸，在其脚本运行前不会显示；编辑后重新生成同样由脚本负责。查看器中没有导出功能。导入的 `.dxf` 会直接渲染，不涉及构件管理。

## 验证

验证发生在生成过程中，而不是生成之后：每次 `@dxf` 构建都会在任何内容写入之前，对引擎刚刚序列化的文档运行图纸检查，并且存在错误发现时构建会失败。检查内容包括：切割图层的轮廓必须闭合（多段线、圆，或由线段/圆弧串联成的环），拒绝零长度/退化实体，拒绝完全重复的几何图形（存在重复切割风险），拒绝明确声明为无单位的文档，以及拒绝模型空间为空的文档。仅允许弯折/雕刻/参考意图图层存在开放几何图形（按名称匹配）。

通过 `cadgen.drawing_checks`，同样的检查也会对任何现有 `.dxf` 文件执行事后验证，包括从未由生成器生成的文件：

```python
from cadgen.drawing_checks import validate_dxf_file

for finding in validate_dxf_file("path/to/file.dxf"):
    print(finding.render())
```

除了内置检查之外，还要使用针对性的 `ezdxf` 读取操作，根据生成的同级 `.dxf`（或者声明了 `out=` 时的该路径）验证所请求的尺寸（按图层统计实体数量、图纸范围，以及用户指定的每个尺寸），并在 CAD Viewer 中以视觉方式检查几何图形：

```python
import ezdxf

doc = ezdxf.readfile("path/to/source.dxf")
msp = doc.modelspace()
cut = msp.query('*[layer=="CUT"]')
holes = msp.query('CIRCLE[layer=="CUT"]')
```

只报告实际运行过的检查。

## 交接

创建或修改 DXF 图纸后，如果已安装 `$cad-viewer` skill，必须始终将明确的 `.dxf` 文件路径交给 `$cad-viewer`，并在最终响应中包含其实时查看器链接。如果 `$cad-viewer` 不可用或启动失败，请报告该情况，并依靠 `ezdxf` 检查，而不要静默省略交接。

最终响应应包括生成的文件、返回的查看器链接、实际运行的验证，以及相关假设。