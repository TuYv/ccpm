---
name: dxf
description: Generate, regenerate, and validate 2D DXF drawings from Python ezdxf sources. Use for DXF files, `.dxf.py` generators, gen_dxf() sources, 2D profiles, outlines, templates, gaskets, panels, flat patterns, laser/plasma/waterjet cut layouts, and 2D drawing exports of CAD geometry.
---
# DXF 生成与验证

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请以已安装的本地技能文件作为运行时的事实来源；仓库链接仅用于来源追溯和版本审查。

## 目的

根据自然语言需求或 CAD 几何体创建或修改 2D DXF 图纸，生成经过验证的图纸制品，并返回检查后的输出。DXF 图纸的事实来源是一个名为 `<name>.dxf.py` 的专用 Python 生成器文件，其中定义了 `gen_dxf()`；输出路径由 CLI 管理。

默认构建产物是**图纸包**——一种由 CAD Viewer 提供并自动重新生成的渲染制品：

```
<model-folder>/__cadgen__/models/<name>.dxf.py/
  drawing.json    # provenance + freshness descriptor
  drawing.dxf     # the built DXF (the exchange artifact)
  preview.glb     # the baked 3D flat pattern (what the viewer renders)
```

`preview.glb` 由构建过程的一个 Node 子进程根据 `drawing.dxf` 烘焙生成，并且位于同一个生成锁内，因此一次构建要么同时生成两个有效载荷，要么两个都不生成。它需要 PATH 中存在 `node`（或设置 `CADGEN_NODE`）。

同级的 `<name>.dxf` 文件**仅按需**写入（通过 `--write`、`-o` 或 `SOURCE=OUTPUT` 对），用于交付给切割服务或其他工具。导出的 `.dxf` 是一个特定时间点的交付物，与其生成器完全分离：重新构建绝不会删除、重写它，也不会跟踪其是否过期（与导出的 STEP 文件相同）——需要刷新时请重新导出。不要提交生成的 `.dxf` 输出；图纸包缓存已被 git 忽略，并会按需重新构建。

## 三种 DXF 工作流

创建新图纸时，请从 `references/generator-templates.md` 复制适用于相应工作流的完整生成器模板。

1. **从头生成 DXF**（独立制图——垫片、面板、模板、背后没有 3D 模型的切割布局）：使用一个 `<name>.dxf.py` 直接构建 `ezdxf` 文档。

2. **从生成的 STEP 零件派生 DXF**（`$cad` 模型的展开图案／轮廓）：使用一个 `<name>.dxf.py`，放在其所投影的 `<name>.step.py` 旁边。生成器入口文件使用带点的扩展名，无法按模块名导入，因此需要通过路径加载 STEP 源文件以复用其几何体：

   ```python
   from pathlib import Path
   from cadgen.sources import load_source_module

   _step = load_source_module(Path(__file__).with_name("bracket.step.py"))

   def gen_dxf():
       return {"document": _step.build_dxf()}
   ```

   将共享的制图逻辑（例如通过 `cadgen.flatten` 展开零件的 `build_dxf()` 辅助函数）保留在 `.step.py` 或普通辅助模块中；`.dxf.py` 是图纸入口点。加载的 `.step.py` 及其导入项会记录在图纸的源文件闭包中，因此编辑 3D 零件会自动使缓存的图纸失效。

3. **从导入的 STEP 派生 DXF**（没有 Python 源文件的 `.step`/`.stp` 文件）：使用一个 `<name>.dxf.py` 读取 STEP（例如使用 `build123d.import_step`），并通过 `cadgen.flatten` 对其进行投影。只有 Python 源文件会作为新鲜度输入——与组合导入 STEP 的 `gen_step()` 类似，导入的文件发生变化时，图纸不会自动重新构建；替换文件后请使用 `--force` 重新运行。

`gen_dxf()` 必须位于专用的 `.dxf.py` 文件中：同时定义 `gen_step()` 和 `gen_dxf()` 的源文件会被拒绝。仅定义 `gen_dxf()` 的普通 `<name>.py` 文件仍可作为显式 CLI 目标接受（CLI 不关心命名），但只有 `.dxf.py` 文件才会作为 CAD 查看器列出并重新构建的目录条目。

## 何时使用此技能

当用户要求生成用于激光、等离子、水刀或 CNC 铣削的 DXF 文件、2D 图纸、轮廓、外形线、模板、垫片、面板、展开图或切割排版时，使用此技能。

对于 DXF 所派生自的 3D 零件或装配体，使用 `$cad`。对于 SendCutSend 特定的上传预检，使用 `$sendcutsend`。

## 默认设置

除非用户另有指定，否则使用以下默认设置：

- 单位：毫米；在文档中显式设置（`doc.units = ezdxf.units.MM`）。
- 几何图形以 1:1 比例位于模型空间中。
- 切割轮廓使用闭合多段线或闭合的直线/圆弧环；开放轮廓仅用于雕刻或参考几何图形（生成验证会强制执行此要求——参见“验证”）。
- 对于基于 CAD 的零件，使用 `cadgen.flatten` 从实际 STEP/实体拓扑派生 DXF 切割轮廓：选择真实的平面（`planar_faces`），对其进行投影和合并（`union_projected_faces`），并生成干净的闭合轮廓（`add_shapely_geometry`）。仅当没有可靠的 3D 拓扑可供投影时，才使用手工绘制的参数化外形线。
- 当切割工艺需要时，使用 `cadgen.flatten.offset_geometry` / `offset_closed_points` 应用切缝宽度／刀具半径补偿；不要手动偏移坐标。
- 图层表达设计意图：将切割几何图形与折弯／折叠线放在不同图层中，并在折弯图层名称中包含 "bend"，以便下游工具将其分类为折弯而非切割。
- DXF 图层表示绘图结构，而非 STEP 零件／装配体结构。

## 工具

此技能有两个启动器，按照源文件的提供者进行划分——与 CAD 技能在 `scripts/gen` 和 `scripts/artifact` 之间采用的划分方式相同：

```bash
python scripts/gen targets... [flags]        # gen_dxf() Python generators
python scripts/artifact target [flags]       # one drawing, INCLUDING an imported .dxf
python scripts/snapshot --input <drawing> --output <file.png>   # render it
```

使用当前项目的 Python 解释器；将 `python` 视为解释器占位符，并使用 `--help` 查看完整接口。目标路径相对于命令的当前工作目录解析；应从拥有这些制品的工作区运行命令，并使用相对于当前工作目录的目标路径。将绘图生成器与其派生几何图形放在同一目录中，并命名为 `<name>.dxf.py`。

DXF 目标是定义以下内容的 Python 源文件：

```python
def gen_dxf():
    ...
    return {"document": document}  # or a bare ezdxf document
```

每次运行都会构建／刷新绘图包。标志：

- `--write` — 同时写出同级的 `<name>.dxf` 导出文件。
- `-o`/`--output PATH` — 导出到自定义路径；仅可用于单个普通的生成型 Python 目标。
- `SOURCE.dxf.py=OUTPUT.dxf` 位置参数对 — 为每个目标指定自定义导出路径。
- `--force` — 即使缓存的绘图包是最新的，也重新构建（否则，源文件闭包未发生变化时会跳过构建）。
- `--validate` — 不执行生成，而是使用生成阶段的绘图检查来验证现有的 `.dxf` 文件。

不要在 `gen_dxf()` 的返回值中放置输出路径。

`scripts/gen` 仅运行生成器。导入的 `.dxf` 没有可运行的生成器，因此应改用 `scripts/artifact`：

```bash
python scripts/artifact path/to/imported.dxf
python scripts/artifact path/to/source.dxf.py --force
```

这会构建与 CAD Viewer 按需构建的相同隐藏 `__cadgen__` 工程图包——其中包含工程图 DXF，以及视口渲染的 3D `preview.glb`——并且支持任一种源文件类型，因此也可以用它调试所生成工程图的软件包构建过程。标志：`--write PATH`（同时将软件包的工程图 DXF 写入该位置）、`--force`、`--verbose`。

`scripts/snapshot` 将工程图的 3D 展开图渲染为 PNG 静态图或环绕 GIF：

```bash
python scripts/snapshot --input path/to/imported.dxf --output review.png
python scripts/snapshot --input path/to/source.dxf.py --output turntable.gif --mode orbit
```

它会先构建或刷新工程图包，然后通过共享的快照 CLI（`cadgen.snapshot_cli`）以及所有渲染技能共用的同一套无头浏览器运行时，渲染该软件包的 `preview.glb`——因此几何体和材质的渲染效果与 CAD Viewer 完全一致；默认的 `snapshot` 主题与视口的区别仅在于移除了网格、原点坐标轴和阴影。软件包构建使用的，是 `scripts/artifact` 和查看器所运行的同一个带锁 `artifact_build(DRAWING_PACKAGE)`，因此快照操作不会与其中任何一个发生竞争。

标志：`--mode view|orbit|list`、`--camera`、`--theme`、`--size-profile`、`--width`/`--height`、`--job`、`--force`、`--json`。主题设置统一归于一个 `--theme` 之下，与查看器的 Theme 选项卡相对应；默认主题是 `snapshot`，即不带地面网格、原点坐标轴或阴影的 Workbench Light。不存在 `--display`，也没有选择器、参数、剖面或爆炸选项：工程图不携带 CAD 拓扑，而显示设置属于 CAD 拓扑设置。

没有任何 CLI 会检查现有的 `.dxf`。如需检查实体或图层，请直接使用 `ezdxf`，工程图检查则使用 `--validate`；使用 `$cad-viewer` 直观检查几何体。

## 工作流程

1. 将请求整理为一份简短说明：轮廓尺寸、孔和槽、图层、单位、输出路径以及验证目标。
2. 选择工作流程：独立绘图、投影已生成的 STEP（先使用 `$cad` 创建并验证 STEP 几何体），或投影导入的 STEP（在 `sources` 中声明）。
3. 编写或编辑 `<name>.dxf.py` 源文件，将有意义的尺寸定义为命名参数，并复用 STEP 源文件的几何辅助函数，而不是重复编写公式。
4. 仅对明确指定的 Python 源文件目标运行 `scripts/gen`；不要对整个目录运行生成操作。

```bash
python scripts/gen path/to/source.dxf.py
python scripts/gen path/to/source.dxf.py --write
python scripts/gen path/to/source.dxf.py -o path/to/output.dxf
python scripts/gen path/to/a.dxf.py=out/a.dxf path/to/b.dxf.py=out/b.dxf
```

5. 以确定性的方式验证生成的 DXF，然后进行交付并报告结果。

## 查看器集成

无论绘图包是否已构建，`<name>.dxf.py` 文件都会作为 CAD Viewer 目录条目列出。打开此类文件会触发统一的渲染工件流程：如果包缺失或已过期（源闭包中的任何文件——生成器、通过路径加载的 `.step.py` 源文件以及辅助模块——比描述文件更新），系统会自动重新构建。对于生成的绘图，查看器的导出下拉菜单会提供“下载 DXF”选项（它会先刷新包，因此导出内容绝不会过期）。导入的 `.dxf` 同样由工件系统管理——查看器会按需构建其绘图包，与处理导入的 `.step` 完全相同——但它绝不会成为 `dxf` CLI 的目标：该 CLI 仅构建 `.dxf.py` 生成器。

## 验证

验证发生在生成过程中，而不是生成之后：每次 `gen_dxf()` 构建都会先对内存中的文档运行绘图检查，然后才写入包或任何导出文件；如果构建中发现错误，则构建失败。检查包括：切割图层的轮廓必须闭合（多段线、圆或由首尾相连的直线/圆弧组成的环）；拒绝零长度/退化实体；拒绝完全重复的几何图形（存在重复切割风险）；拒绝明确无单位的文档；拒绝空模型空间。只有弯折/雕刻/参考意图图层（按名称匹配）才允许存在开放几何图形。

也可以对任何现有的 `.dxf` 文件事后运行相同的检查：

```bash
python scripts/gen --validate path/to/file.dxf
```

除了内置检查之外，还应针对绘图包中已构建的 DXF（如果请求了导出路径，则针对导出路径）使用有针对性的 `ezdxf` 读取来验证所请求的尺寸（按图层统计实体数量、绘图范围，以及用户指定的每一个尺寸），并在 CAD Viewer 中目视检查几何图形：

```python
import ezdxf

doc = ezdxf.readfile("path/to/__cadgen__/models/source.dxf.py/drawing.dxf")
msp = doc.modelspace()
profiles = [e for e in msp.query("LWPOLYLINE") if e.closed]
holes = msp.query('CIRCLE[layer=="0"]')
```

仅报告实际运行过的检查。

## 交付

创建或修改 DXF 绘图后，如果已安装 `$cad-viewer`，则必须**始终**将明确的 `.dxf.py` 文件路径交给它，并在最终响应中包含其实时查看器链接。如果 `$cad-viewer` 不可用或启动失败，请报告该情况，并改用 `ezdxf` 检查，而不是在不作说明的情况下省略交付步骤。

最终响应应包括生成的文件、返回的查看器链接、实际运行过的验证以及所作的假设。