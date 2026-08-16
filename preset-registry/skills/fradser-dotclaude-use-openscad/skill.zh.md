---
name: use-openscad
description: Writes OpenSCAD code and drives the `openscad` command-line compiler to produce STL/3MF/AMF/DXF/SVG/PNG outputs from parametric `.scad` models. This skill should be used when the user asks to design a 3D-printable part, generate a laser-cut 2D plate, render a preview image of a CAD model, export STL for 3D printing, batch-render parametric variants, or convert between mesh formats. Invoked via "/hardware:use-openscad".
user-invocable: true
license: MIT
metadata:
  version: "1.0"
---
# 使用 OpenSCAD

在 OpenSCAD 中设计参数化 3D 和 2D 零件，并使用 `openscad` CLI 将其编译为制造输出文件。OpenSCAD 是一种基于代码的函数式 CAD 语言，支持模块与函数、CSG 布尔运算和拉伸，非常适合由智能体编写并迭代设计。

## 流程

1. 理解用户的需求（可打印零件、激光切割板、预览图像或网格转换），并选择目标格式（用于 3D 打印的 STL/3MF/AMF、用于 2D 切割的 DXF/SVG、用于预览的 PNG）。
2. 找到并验证二进制文件（参见“定位二进制文件”）。首先运行 `openscad_run --version`，确认其可以正常工作。
3. 使用 `references/language.md` 中的语法编写 `.scad` 模型。当用户希望通过命令行进行参数化控制时，将尺寸设为 `-D` 变量。
4. 使用 `references/cli.md` 中的正确标志进行编译。有关端到端操作步骤，请参阅 `references/workflows.md`；有关可打印性规则，请参阅 `references/design.md`。
5. 导出 STL/3MF 后，在声明成功之前，扫描 stderr 中是否存在流形警告（参见关键规则）。

## 关键操作规则

- **网格导出（STL/3MF/AMF/DXF/SVG）始终使用完整的 CGAL 几何体——无需使用 `--render`。** `--render` 仅影响 PNG 图像导出（若不使用它，PNG 将使用 OpenCSG 预览）。直接执行 `openscad -o out.stl model.scad` 即可生成完整网格。对于 STL，请显式传入 `--export-format binstl`（ASCII 是当前默认格式；二进制格式计划在未来成为默认格式）。导出后，扫描 stderr 中是否存在流形警告——见下文。
- **macOS 二进制文件不在 PATH 中。** 它位于 `/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD`。在 Linux 上，尝试使用 `openscad` 或 `openscad-nightly`；在 Windows 上，调用 `openscad.com`（包装程序，而不是 `openscad.exe`）。在远程服务器上，使用 Docker 镜像（参见 `hardware/scripts/docker/openscad/`）。在构建流水线之前，必须使用 `openscad_run --version` 进行确认。
- **退出码没有正式文档。** 根据经验，编译/解析错误时返回非零值，成功时返回零值，即使存在警告也是如此；`--hardwarnings` 会使第一个警告成为致命错误。不要想当然——对于 CI 门禁，请使用 `--hardwarnings` 运行，并将任何非零退出码视为失败。如果不确定某个标志，请运行 `openscad --help` 并查看实际的标志列表。
- **变量在其作用域内不可变。** 在同一作用域中重新赋值会从原始位置进行替换（第一次赋值永远不会执行，并会发出警告）；花括号会创建不会向外泄漏的内部作用域。请使用 `is_undef(x)`，而不是 `x == undef`。来自 CLI 的 `-D var=val` 常量会覆盖程序顶层的值。
- **对库使用 `use`，不要使用 `include`。** `include <lib.scad>` 相当于原样复制粘贴，会运行顶层几何体并使错误行号难以理解；`use <lib.scad>` 会抑制顶层几何体，仅公开函数/模块。对任何库文件都应使用 `use`。
- **字符串 `-D` 值需要 Shell 引号。** `-D 'mode="parts"'`（bash）——内层引号是 OpenSCAD 表达式的一部分。数值形式的 `-D w=60` 不需要引号。
- **网格导出后扫描 stderr。** 使用 `2>&1` 捕获输出，并使用 grep 搜索 `manifold`、`self-intersect`、`degenerate`、`warning`——即使退出码为零，OpenSCAD 也会将网格问题输出到 stderr。参见 `references/workflows.md`。

## 命令映射

| 用户需求 | 标志 | 参考文档 |
|---|---|---|
| 用于 3D 打印的 STL | `--export-format binstl -o out.stl` | `references/cli.md` |
| 3MF / AMF | `-o out.3mf` | `references/cli.md` |
| 2D DXF / SVG（激光切割） | `-o out.dxf` | `references/cli.md` |
| 预览 PNG | `--preview --imgsize W,H --viewall --autocenter`（使用 `--render` 可获得精确的非预览渲染结果） | `references/cli.md` |
| 参数化变体 | `-D var=val`（可重复使用） | `references/cli.md` |
| 批量渲染 | 通过 shell 循环遍历 `-D` 值 | `references/workflows.md` |
| 网格转换（STL→3MF） | 在用于重新导出的 `.scad` 文件中使用 `import()` | `references/workflows.md` |
| 语言语法 | 模块、函数、CSG、拉伸 | `references/language.md` |
| 可打印性规则 | 壁厚、悬垂、间隙 | `references/design.md` |

## 定位二进制文件

```bash
# Resolve the OpenSCAD binary — local binary or Docker container
__openscad_resolve() {
  # 1. macOS .app bundle
  local mac="/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD"
  if [[ -x "$mac" ]]; then echo "local:$mac"; return; fi
  # 2. PATH
  if command -v openscad &>/dev/null; then echo "local:openscad"; return; fi
  if command -v openscad-nightly &>/dev/null; then echo "local:openscad-nightly"; return; fi
  # 3. Docker (image must exist locally)
  if command -v docker &>/dev/null; then
    local img="${OPENSCAD_DOCKER_IMAGE:-openscad-cli}"
    if docker image inspect "$img" &>/dev/null 2>&1; then
      echo "docker:$img"
      return
    fi
  fi
  echo ""
}

OPENSCAD_TARGET="$(__openscad_resolve)"
if [[ -z "$OPENSCAD_TARGET" ]]; then
  echo "ERROR: OpenSCAD not found." >&2
  echo "  Install locally:  brew install openscad  (macOS)  or  apt install openscad  (Linux)" >&2
  echo "  Build Docker:     docker build -t openscad-cli '${CLAUDE_PLUGIN_ROOT:-.}/scripts/docker/openscad/'" >&2
  exit 1
fi

# Run wrapper — transparently handles local binary vs Docker
openscad_run() {
  local mode="${OPENSCAD_TARGET%%:*}"   # "local" or "docker"
  local target="${OPENSCAD_TARGET#*:}"  # binary path or image name
  if [[ "$mode" = "docker" ]]; then
    docker run --rm -v "$PWD:/work" -w /work "$target" "$@"
  else
    "$target" "$@"
  fi
}

openscad_run --version
```

`openscad_run` 函数封装了每次调用。其用法与直接调用 `openscad` 完全相同：
```bash
openscad_run --export-format binstl -o out.stl model.scad
openscad_run -o preview.png --preview --imgsize=1280,960 model.scad
```

**Docker 镜像：** 在仓库根目录中使用 `docker build -t openscad-cli hardware/scripts/docker/openscad/` 进行构建。可通过 `OPENSCAD_DOCKER_IMAGE=my-registry/openscad:latest` 覆盖镜像名称。

## 参考文档

- `references/language.md` — OpenSCAD 语法：模块/函数、变量与作用域、控制流、CSG 布尔运算、基本体、变换、拉伸与投影、导入/包含/使用。
- `references/cli.md` — 完整的 `openscad` CLI：输出与格式标志、`-D` 变量、渲染模式、图像/相机选项、诊断、`--enable` 功能、无头模式说明。
- `references/design.md` — 可打印性启发式规则（最小壁厚、悬垂、桥接、间隙、流形）以及激光切割的 2D 规则。
- `references/workflows.md` — 端到端操作流程（参数化 STL、2D DXF、预览 PNG、批量变体、网格转换、stderr 验证）。