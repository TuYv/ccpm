---
name: use-kicad-cli
description: Drives the KiCad command-line interface (`kicad-cli`, version 9.0) to export schematics and PCBs, produce fabrication outputs, and run design checks. This skill should be used when the user asks to export gerbers, drill, or pick-and-place files, generate a BOM or netlist, run ERC or DRC (including in CI), export a STEP/3D model or PDF/SVG, upgrade KiCad symbol/footprint libraries, or run a KiCad job set. Invoked via "/hardware:use-kicad-cli".
user-invocable: true
license: MIT
metadata:
  version: "1.0"
---
# 使用 kicad-cli

通过驱动 KiCad 9.0 的命令行工具 `kicad-cli`，从 KiCad 项目生成制造、文档和 3D 输出，并运行电气规则检查和设计规则检查。它包含六个命令组：`sch`（原理图）、`pcb`（电路板）、`sym`（符号）、`fp`（封装）、`jobset`（批处理作业集）和 `version`。

## 流程

1. 确定用户需要哪种产物（制造文件、BOM、检查、3D 模型、PDF、库升级），并使用下表将其映射到相应的命令组。
2. 在运行任何命令之前，找到并验证二进制文件（参见“定位二进制文件”）。首先运行 `kicad-cli version` 以确认其可以正常工作。
3. 加载匹配的参考文件，并使用其中的确切标志。不要臆造标志——不确定时，运行 `kicad-cli <group> <command> -h`。
4. 构建命令，先创建所有输出目录，然后运行命令。报告生成的文件（对于检查，还需报告退出码和报告路径）。

## 关键操作规则

- **macOS 二进制文件不在 PATH 中。** 在 macOS 上，它位于 `/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli`。在 Linux 上，`kicad-cli` 位于 PATH 中；在 Windows 上，它是 KiCad `bin` 文件夹中的 `kicad-cli.exe`。在构建流水线之前，必须使用 `kicad-cli version` 进行确认。
- **如果不使用 `--exit-code-violations`，检查即使发现违规也会静默通过。** 默认情况下，即使存在违规，`pcb drc` 和 `sch erc` 也会以 `0` 退出——它们只会写入报告。必须传递 `--exit-code-violations`，以便在发现违规时获得退出码 `5`。在 CI 中，将退出码 `5` 视为“发现违规”；其他非零退出码表示工具或 IO 错误。参见 `references/checks.md`。
- **对于某些命令，`--output` 是目录；对于其他命令，它是文件。** 目录：`pcb export gerbers`、`pcb export drill`、`*/export svg`（多文件）。文件：`pcb export pdf`、`pcb export step`、`pcb export pos`、单文件导出。先创建目录；切勿假定工具会自动创建深层目录。
- **使用 `pcb export gerbers`（复数形式）。** 单数形式的 `pcb export gerber` 在 9.0 中已弃用，并在 10.0 中移除。
- **使用 `--define-var KEY=VALUE`**（`-D`）**设置变量**，以便在导出时覆盖项目文本变量（例如 `${REV}`），而不是编辑电路板。在 shell 中使用单引号保护 `${QUANTITY}` 之类的 KiCad 字段变量，避免它们被展开。
- **切勿硬编码 DRC/ERC JSON 模式。** 虽然支持 `--format json`，但其字段名称没有正式文档——请先生成示例并检查，然后再进行解析。
- **无显示环境的 CI：** `kicad-cli` 通常可以无头运行，但某些操作需要 X 显示环境。稳健的模式是使用官方 `kicad/kicad:9.0` Docker 镜像，或者先运行 `Xvfb :99 -ac -nolisten tcp &`，然后运行 `export DISPLAY=:99`。参见 `references/setup.md`。

## 命令映射

| 用户需求 | 命令 | 参考资料 |
|---|---|---|
| Gerber / 钻孔 / 贴装坐标文件 | `pcb export gerbers` / `drill` / `pos` | `references/pcb-export.md` |
| 电路板 PDF / SVG / DXF | `pcb export pdf` / `svg` / `dxf` | `references/pcb-export.md` |
| 3D 模型（STEP/GLB/VRML/……） | `pcb export step` / `glb` / `vrml` | `references/pcb-export.md` |
| IPC-2581 / IPC-D-356 / ODB++ | `pcb export ipc2581` / `ipcd356` / `odb` | `references/pcb-export.md` |
| 电路板渲染图（PNG/JPEG） | `pcb render` | `references/pcb-export.md` |
| 原理图 PDF / SVG / DXF / PS / HPGL | `sch export <fmt>` | `references/sch-export.md` |
| BOM / 网表 | `sch export bom` / `netlist` | `references/sch-export.md` |
| 设计规则检查 / 电气规则检查 | `pcb drc` / `sch erc` | `references/checks.md` |
| 符号/封装 SVG 或库升级 | `sym ...` / `fp ...` | `references/sym-fp-jobset.md` |
| 可复现的批量输出 | `jobset run` | `references/sym-fp-jobset.md` |
| 端到端流程 | — | `references/workflows.md` |

## 定位二进制文件

按以下顺序尝试：PATH 中的 `kicad-cli`；macOS 上的 `/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli`；Windows 上的 `C:\Program Files\KiCad\9.0\bin\kicad-cli.exe`。将解析得到的路径赋值给一个 shell 变量并重复使用：

```bash
KCLI=$(command -v kicad-cli || echo /Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli)
"$KCLI" version
```

如果均不可用，请告知用户尚未安装 KiCad 9.0，或询问其安装路径。

## 参考资料

- `references/setup.md` — 跨平台定位二进制文件、无头/CI 环境设置、`version`、全局选项（`--define-var`、`--output` 语义）以及注意事项。
- `references/pcb-export.md` — 所有 `pcb export` 子命令（gerbers、drill、pos、pdf、svg、dxf、step、glb、vrml、ipc2581、ipcd356、odb 及其他）以及 `pcb render`。
- `references/sch-export.md` — `sch export` 的 pdf/svg/dxf/ps/hpgl、netlist、bom、python-bom。
- `references/checks.md` — `pcb drc` 和 `sch erc`：标志、严重级别、退出代码、JSON 注意事项以及 CI 门禁。
- `references/sym-fp-jobset.md` — `sym` 和 `fp` 的导出/升级，以及 `jobset run`。
- `references/workflows.md` — 端到端操作方案（制造包、CI 检查、原理图 PDF、STEP 模型、作业集）。