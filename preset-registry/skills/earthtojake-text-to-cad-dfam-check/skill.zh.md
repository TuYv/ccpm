---
name: dfam-check
description: Measure mesh files against Design for Additive Manufacturing (DfAM) rules and report printability findings per process (FDM, SLS, SLA/DLP, metal PBF, MJF). Use when the user asks whether a part is printable, wants overhang/wall-thickness/support analysis of an `.stl`, `.obj`, `.ply`, or `.3mf` mesh, wants a build-orientation recommendation, or wants DfAM redesign guidance before slicing with `$gcode` or regenerating geometry with `$cad`.
---
# DfAM 检查

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。
请将已安装的本地 skill 文件作为运行时的事实依据；
仓库链接仅用于来源追溯和发布审查。

使用此 skill 在切片或打印之前，为网格文件生成保守且有证据支持的 DfAM 报告。它在本地测量几何事实，并将其与各工艺的设计限制进行比较；它绝不会执行切片、上传或启动打印任务。

## 几何检查

对于所有几何事实，使用活动项目 Python 环境中的 `scripts/dfam_tool.py`（请先安装 `requirements.txt`，每次运行都需要它）。该工具仅提供事实：
它报告测量结果，绝不会输出通过/失败或准备就绪状态。
比较和结论属于此工作流。只要工具能够测量，就不要凭肉眼或根据渲染结果估算壁厚、
悬垂角度或支撑体积。

```bash
python scripts/dfam_tool.py measure part.stl --angle-limit 45
python scripts/dfam_tool.py orientations part.stl --angle-limit 45
```

测量前，将 `--angle-limit` 设置为 `references/process-limits.md` 中目标工艺的自支撑角；当目标工艺发生变化时重新运行：聚合支撑面积数据会根据该角度进行分箱。

STEP/STP 输入是边界表示 CAD，而不是网格。当安装了 `$cad`
skill 时，先使用它导出 STL sidecar，然后在此处测量 STL。
请报告这一补救措施，不要尝试直接解析原始 STEP。

## 工作流

1. 收集打印意图：目标工艺、材料、层高，以及用户能够提供的任何机器或材料数据表。如果工艺未知，先使用默认的 45° 限制测量一次，然后按候选工艺分别呈现结果，而不是猜测单一结论。
2. 阅读 `references/process-limits.md`，并选择目标工艺对应的限制列。用户提供的机器/材料数据表优先于默认值；对于每项比较，引用实际使用的来源。
3. 对确切的上传文件运行 `measure`。不要只检查生成器脚本、源 CAD 模型或文件的控制台摘要。
4. 当工艺需要支撑且测得的支撑面积非零时，运行 `orientations`。报告任何能够显著减少支撑面积的候选方向，并说明其打印高度的权衡。
5. 将每项测量事实与引用的限制进行比较，并使用克制的状态标签报告结果：
   - `✅ pass`：测量事实满足引用的限制。
   - `❌ fail`：测量事实直接违反引用的限制。
   - `❓ need more info`：缺少工艺上下文、几何未测量、采样过于稀疏而无法信任，或存在工具限制。
6. 按严重程度排列结果：首先是水密性（对所有工艺都会阻塞切片），其次是壁厚，然后是悬垂/支撑，最后是方向和成本信号。

## 比较

只比较相互可信的证据对。

- 对于每项发现，引用限制来源（process-limits 表格行，或用户数据表中的字段）以及测量事实（JSON 字段路径）。
- 将低于壁厚限制的 `p05_mm` 视为违规，即使仅凭 `min_mm` 可能被认为是采样离群值；同时报告两个值。
- 对于装配体，`wall_thickness` 会报告 `body_count` 和 `per_body` 明细。将违规归因于所属的实体；不能将跨实体汇总得到的薄值作为针对整个零件的发现。
- 不要将支撑角度相关发现应用于粉末工艺（SLS、MJF）；相关的粉末工艺检查是封闭体积中的粉末排出，而此工具目前尚未测量该项——当很可能存在封闭空腔时，将其报告为 `❓ need more info`。
- 不要静默缩放几何体。`scale.units_suspect` 根据包围盒对角线测量得出：当其为 `true` 时，源文件可能使用米或英寸作为单位，所有朝下的面都会被读取为放置在打印板上，而悬垂和支撑数据为 0.0 也没有意义。请报告单位/缩放发现，并要求用户在将任何数据与材料限制进行比较前确认单位。
- 支撑体积比是粗略的上限；将其报告为成本信号，而不是硬性失败，除非用户设置了明确的预算。

## 重新设计交接

对于每个 `❌ fail`，都要提供具体、使用自然语言描述且包含目标数值的重新设计指令
（例如“将 [12.4, 3.0, 8.1] 处的壁厚从 0.6 mm 增加到 ≥1.2 mm”，或“将 [23.3, 10.0, 52.0] 处的悬垂部分倒角至 ≥45°”）。
如果已安装 `$cad` skill，请提供使用它应用重新设计指令并在此处重新测量重新生成的几何体的选项，重复此过程，直到不再存在 `❌ fail` findings。如果已安装 `$cad-viewer`，请将已测量的文件路径交给它，以便用户直观检查这些 findings。