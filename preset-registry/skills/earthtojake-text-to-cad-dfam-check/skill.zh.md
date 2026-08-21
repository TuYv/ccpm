---
name: dfam-check
description: Measure mesh files against Design for Additive Manufacturing (DfAM) rules and report printability findings per process (FDM, SLS, SLA/DLP, metal PBF, MJF). Use when the user asks whether a part is printable, wants overhang/wall-thickness/support analysis of an `.stl`, `.obj`, `.ply`, or `.3mf` mesh, wants a build-orientation recommendation, or wants DfAM redesign guidance before slicing with `$gcode` or regenerating geometry with `$cad`.
---
# DfAM 检查

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请将已安装的本地技能文件作为运行时的事实来源；仓库链接仅用于来源说明和版本审查。

使用此技能可在切片或打印之前，针对网格文件生成保守且有证据支持的 DfAM 报告。它会在本地测量几何事实，并将其与各工艺的设计限制进行比较；它绝不会执行切片、上传或启动打印作业。

## 几何检查

对于所有几何事实，请在当前项目的 Python 环境中使用 `scripts/dfam_tool.py`（需要 `trimesh`、`numpy`、`rtree`）。该工具仅报告事实：它会报告测量结果，但绝不会输出通过/失败或就绪状态。比较和判定属于此工作流的职责。当工具能够进行测量时，不要凭目测或根据渲染图估算壁厚、悬垂角度或支撑体积。

```bash
python scripts/dfam_tool.py measure part.stl --angle-limit 45
python scripts/dfam_tool.py orientations part.stl --angle-limit 45
```

测量前，请根据 `references/process-limits.md` 将 `--angle-limit` 设置为目标工艺的自支撑角度，并在目标工艺发生变化时重新运行：汇总的支撑面积事实是依据该值分档统计的。

STEP/STP 输入是边界表示 CAD，而不是网格。当已安装 `$cad` 技能时，请先使用该技能导出 STL 辅助文件，然后在此处测量该 STL。请报告这一补救措施，而不是尝试直接解析原始 STEP。

## 工作流

1. 收集打印意图：目标工艺、材料、层高，以及用户能够提供的任何机器或材料数据表。如果工艺未知，请先使用默认的 45° 限制测量一次，然后按候选工艺分别呈现结果，而不是猜测单一判定。
2. 阅读 `references/process-limits.md`，并选择目标工艺对应的限制列。用户提供的机器/材料数据表优先于默认值；每项比较都要引用实际使用的来源。
3. 对用户实际上传的文件运行 `measure`。不要只检查生成器脚本、源 CAD 模型或该文件的控制台摘要。
4. 当工艺需要支撑且测得的支撑面积不为零时，运行 `orientations`。报告任何能够显著减少支撑面积的候选方向，并说明其构建高度方面的权衡。
5. 将每项测量事实与引用的限制进行比较，并使用克制的状态标签报告结果：
   - `✅ pass`：测量事实满足引用的限制。
   - `❌ fail`：测量事实直接违反引用的限制。
   - `❓ need more info`：缺少工艺上下文、几何体尚未测量、采样过于稀疏而不可信，或存在工具限制。
6. 按严重程度排列结果：首先是水密性（对所有工艺都会阻止切片），然后是壁厚，再然后是悬垂/支撑，最后是方向和成本信号。

## 比较

仅比较可信的成对证据。

- 每项结果都要引用限制来源（process-limits 表格行或用户数据表字段）和测量事实（JSON 字段路径）。
- 即使单独的 `min_mm` 可能只是采样离群值，只要 `p05_mm` 低于壁厚限制，就应将其视为违规；同时报告这两个值。
- 对于装配体，`wall_thickness` 会报告 `body_count` 和 `per_body` 明细。应将违规归因于其所属的实体；跨实体汇总得到的薄壁数值不能作为针对整个零件的结果。
- 不要将支撑角度结果应用于粉末工艺（SLS、MJF）；粉末工艺相关的检查是封闭体积中的粉末逸出，而此工具目前尚不能测量该项——当可能存在封闭空腔时，将其报告为 `❓ need more info`。
- 不要在不说明的情况下缩放几何体。`scale.units_suspect` 是根据包围盒对角线测得的：当其为 `true` 时，源文件可能使用米或英寸作为单位，每个朝下的面都会被视为位于构建板上，而悬垂和支撑数值为 0.0 不代表任何有效含义。请报告单位/缩放问题，并要求用户确认单位，然后再与任何材料限制进行比较。
- 支撑体积比是粗略的上限估计；应将其作为成本信号报告，而不是硬性失败，除非用户已设置明确的预算。

## 重新设计交接

对于每个 `❌ fail`，都应提供一条具体、通俗易懂且包含目标数值的重新设计指令（例如“将 [12.4, 3.0, 8.1] 处的壁厚从 0.6 mm 增加到 ≥1.2 mm”，或“将 [23.3, 10.0, 52.0] 处的悬垂倒角处理为 ≥45°”）。
安装了 `$cad` 技能后，应主动提出使用该技能应用重新设计指令，并在此处重新测量再生成的几何体，重复此过程，直到不再存在任何 `❌ fail` 结果。安装了 `$cad-viewer` 后，将测量过的文件路径交给该技能，以便用户直观检查这些结果。