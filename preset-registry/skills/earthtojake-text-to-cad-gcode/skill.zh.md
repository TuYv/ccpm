---
name: gcode
description: Generate, inspect, dry-run, and statically validate plain FDM `.gcode` from 3D mesh files by orchestrating real slicer CLIs. Use when Codex needs to slice `.stl`, `.obj`, unsliced `.3mf`, `.ply`, `.glb`, or `.gltf` into printer-profiled G-code, discover local slicer backends, inspect whether a mesh is slice-ready, or validate generated G-code before any printer-specific handoff.
---
# G-code

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。
运行时以已安装的本地 skill 文件为准；仓库链接仅用于来源追溯和发布审查。

将此 skill 用于从网格文件生成纯 `.gcode`。它与打印机无关，绝不会上传、启动或打包打印任务。

## 工作流程

1. 确认输入是受支持的网格文件：`.stl`、`.obj`、未切片的 `.3mf`、`.ply`、`.glb` 或 `.gltf`。
2. 要求提供明确的打印机/配置包装器 JSON。不要臆造真实打印机配置文件。
3. 当后端未知时，发现切片器后端：

```bash
python scripts/gcode_tool.py discover
```

4. 检查输入：

```bash
python scripts/gcode_tool.py inspect --input path/to/model.stl --json
```

5. 执行前先对切片器命令进行试运行：

```bash
python scripts/gcode_tool.py slice \
  --input path/to/model.stl \
  --output /tmp/model.gcode \
  --profile path/to/profile.json \
  --backend auto \
  --dry-run
```

6. 仅当试运行命令和配置文件均适当后才执行：

```bash
python scripts/gcode_tool.py slice \
  --input path/to/model.stl \
  --output /tmp/model.gcode \
  --profile path/to/profile.json \
  --backend auto \
  --execute
```

7. 验证生成的 G-code：

```bash
python scripts/gcode_tool.py validate \
  --gcode /tmp/model.gcode \
  --profile path/to/profile.json \
  --json
```

## 配置文件契约

每次切片都需要一个包装器配置文件 JSON，其中包含绝对路径的原生切片器配置文件：

```json
{
  "backend": "orcaslicer",
  "native_config": "/absolute/path/to/native-slicer-profile",
  "machine": {
    "name": "Example Printer",
    "bed_size_mm": [180, 180],
    "z_height_mm": 180,
    "motion_bounds_mm": {
      "x": [0, 180],
      "y": [0, 180],
      "z": [0, 180]
    }
  },
  "filament": {
    "type": "PLA",
    "nozzle_temp_c": 220,
    "bed_temp_c": 65
  }
}
```

包装器提供验证边界和后端选择。`machine.motion_bounds_mm` 是可选的；对于默认的 `0..bed_size` 和 `0..z_height` 边界，可以省略该字段；如果起始/结束 G-code 有意使用打印区域之外的安全擦拭/清料位置，则可以根据原生打印机配置文件设置该字段。原生切片器配置文件仍是详细工艺、打印机和耗材行为的来源。

对于 OrcaSlicer，如果真实配置文件拆分为机器、工艺和耗材 JSON 文件，请使用 `native_settings` 和 `native_filaments`。保留 `native_config` 作为指向主原生配置文件的绝对路径，以确保兼容性：

```json
{
  "backend": "orcaslicer",
  "native_config": "/absolute/path/to/machine-or-process.json",
  "native_settings": [
    "/absolute/path/to/machine.json",
    "/absolute/path/to/process.json"
  ],
  "native_filaments": [
    "/absolute/path/to/filament.json"
  ],
  "machine": {
    "name": "Example Printer",
    "bed_size_mm": [180, 180],
    "z_height_mm": 180
  },
  "filament": {
    "type": "PLA",
    "nozzle_temp_c": 220,
    "bed_temp_c": 65
  }
}
```

## 后端与输入

首选切片器后端顺序为 `orcaslicer`、`prusa-slicer`，然后是 `curaengine`。如果没有可用的首选后端，优先安装 OrcaSlicer；在 macOS 上使用 `brew install --cask orcaslicer`，然后重新运行 `discover`。该辅助工具会同时检查 `PATH` 和通常的 `/Applications/OrcaSlicer.app` cask 位置。Bambu Studio 可能会被发现工具报告为可用，但并不优先选择，因为其 CLI 导出路径在 macOS 上表现出不稳定性。

将 `.stl`、`.obj` 和未切片的 `.3mf` 直接传递给切片器。在执行时，使用可选的 `trimesh` 将 `.ply`、`.glb` 和 `.gltf` 转换为临时 STL；如果 `trimesh` 不可用，请要求用户安装它，或提供 `.stl`、`.obj` 或未切片的 `.3mf`。

在 v1 中拒绝 `.step`、`.stp`、`.dxf`、`.svg`、`.urdf` 和 `.sdf`。`inspect` 和 `slice` 会失败，并返回一个结构化的 `remediation` 对象，其中命名了用于生成可切片网格的 skill 和命令；请使用该对象，而不是自行推断转换流程：

- `.step`、`.stp`：边界表示 CAD，而不是网格。使用 `$cad` 导出 STL sidecar（`python scripts/export <input> --stl <output>.stl`，或使用 `python scripts/export <model>.step.py --stl <output>.stl` 指定生成器），然后在此处切片导出的 `.stl`。
- `.dxf`、`.svg`：没有 2D 到网格转换流程的 2D 图纸。使用 `$cad` 中的 `gen_step()` 建模 3D 实体并导出 STL sidecar，然后进行切片。如果零件是平面切割件而不是打印件，请改用 `$sendcutsend`，不要使用此 skill。
- `.urdf`、`.sdf`：引用每个链接网格文件的机器人描述。逐个切片所引用的 `.stl`/`.obj` 网格；先使用 `$cad` 从所属 CAD 源重新生成过时或缺失的网格。机器人描述本身请使用 `$urdf` 或 `$sdf`。

当后端行为、配置文件预期或源链接很重要时，请阅读 `references/slicer-backends.md`。

## 验证

在将生成的 G-code 交给特定打印机工作流之前，始终验证该 G-code。验证器会检查内容是否非空、温度命令、移动命令、挤出移动、XYZ 边界以及未知命令警告。

在解释验证输出或决定某个警告是否可以接受时，请阅读 `references/gcode-validation.md`。

## Bambu 边界

此 skill 仅生成纯 `.gcode`。它不会创建 Bambu `.gcode.3mf` 压缩包，也不会连接打印机。对于 Bambu 上传/启动工作流，请将经过验证的纯 `.gcode` 交给 `$bambu-labs`。由 `$bambu-labs` 选择特定于打印机的局域网交接方式，例如 A1 Mini 模板项目或明确启用的 bambox 项目包。