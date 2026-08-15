---
name: implicit-cad
description: Create, edit, render, and snapshot browser-native implicit CAD `.implicit.js` and `.implicit.mjs` files using GLSL signed-distance fields, shader primitives, smooth booleans, TPMS fields, and direct CAD Viewer raymarch rendering. Experimental.
---
# 隐式 CAD

此技能适用于应作为浏览器 JS 模块直接在 CAD Viewer 中运行的隐式 CAD 模型。主要产物是 `.implicit.js` 或 `.implicit.mjs` 文件。

此技能尚处于实验阶段。除非用户明确要求隐式模型，否则始终优先采用传统的 STEP 优先 CAD 工作流。

## 文件格式

隐式 CAD 文件是一个 ES 模块，用于导出 `implicit.js/0.1.0` 对象。模式的权威来源位于捆绑包中的 `scripts/packages/implicitjs/src/lib/implicitCad/schema.js`；`scripts/lib/implicit-cad.mjs` 将其重新导出为 `SCHEMA`，供使用辅助函数编写的模块使用。

```js
export default {
  schema: "implicit.js/0.1.0",
  name: "rounded capsule block",
  glsl: `
float sdf(vec3 p) {
  float sphere = implicit_sphere(p, vec3(0.0), 22.0);
  float block = implicit_box_centered(p, vec3(34.0, 18.0, 18.0), vec3(0.0));
  return implicit_union_round(sphere, block, 3.0);
}

vec3 color(vec3 p, vec3 normal) {
  return mix(vec3(0.20, 0.55, 0.95), vec3(0.95, 0.45, 0.20), smoothstep(-15.0, 20.0, p.z));
}
`,
};
```

模型也可以声明参数和动画。参数定义使用 implicitjs 控件模式：`number`、`boolean`、`enum`/`select`、`color`、`string` 和 `button`。数值、布尔值、颜色和按钮参数会自动成为同名的 GLSL uniform；不要添加单独的 `uniforms` 对象。`bounds` 是可选的，省略时会根据 SDF 进行估算；仅当自动估算范围过大、速度过慢或遗漏异常场时，才添加显式边界。`bounds` 和 `render` 可以是接收 `{ ...params, params, animation, animationState, elapsedSec, progress, t }` 的 JavaScript 函数。

内置 GLSL 辅助函数使用 `implicit_*` 命名空间，例如 `implicit_sphere`、`implicit_box_centered` 和 `implicit_union_round`。

```js
export default {
  schema: "implicit.js/0.1.0",
  name: "breathing orb",
  params: {
    radius: {
      type: "number",
      label: "Radius",
      min: 12,
      max: 34,
      default: 22,
      unit: "mm",
    },
  },
  animations: {
    breathe: {
      label: "Breathe",
      duration: 3,
      update({ progress, set }) {
        set("radius", 18 + Math.sin(progress * Math.PI) * 10);
      },
    },
  },
  render: { steps: 224, epsilon: 0.004 },
  glsl: `
float sdf(vec3 p) {
  return length(p) - radius;
}

vec3 color(vec3 p, vec3 normal) {
  return mix(vec3(0.10, 0.58, 0.95), vec3(1.0, 0.34, 0.12), smoothstep(-18.0, 18.0, p.z));
}
`,
};
```

不要从此技能中复制捆绑的辅助文件。如果辅助函数有用，请在编写期间使用 `scripts/lib/implicit-cad.mjs`，或将独立的 GLSL 输出到最终的 `.implicit.js`/`.implicit.mjs` 模块中。

## 编写工作流

1. 编写一份自然语言建模简述，其中包含尺寸、坐标假设、程序化颜色意图和视觉检查项。
2. 创建或编辑用户指定的 `.implicit.js`/`.implicit.mjs` 模块。
3. 在有用时，使用 `scripts/lib/implicit-cad.mjs` 辅助函数来处理图元和场组合：
   - 图元：`sphere`、`circle`、`boxCentered`、`plane`、`lineSegment`、`torus`、`axis`、`cylinder`、`cylinderCapped`、`capsule`、`cone`、`coneCapped`、`coneCapsule`
   - 布尔运算/混合：`unionSharp`、`intersectSharp`、`unionRound`、`intersectRound`、`unionChamfer`、`intersectChamfer`、`unionExp`、`intersectExp`、`unionLpNorm`、`intersectLpNorm`、`unionRvachev`、`intersectRvachev`、`difference`
   - 修改器/晶格：`shell`、`rotateAxis`、`repeatCentered`、`remapCylindrical`、`cubicGrid`、`squareHoneycomb`、`squareHoneycombReinforced`、`squareDiagonalHoneycomb`、`octetHoneycomb`、`hexagonalHoneycomb`、`triangularHoneycomb`
   - TPMS 场：`tpmsGyroid`、`tpmsSchwarz`、`tpmsDiamond`、`tpmsLidinoid`、`tpmsNeovius`、`tpmsSplitP`、`tpmsIwp`
   - 着色器包装器：`distanceFunction` 输出 `float sdf(vec3 p)`，`colorFunction` 输出 `vec3 color(vec3 p, vec3 normal)`
4. 添加可选的 `params` 和 `animations`，用于尺寸、开关、调色板、模式切换和动画探索。在 GLSL 中直接使用参数名称；运行时会声明匹配的 uniform。
5. 当模型能从局部材质变化中受益时，使用 `vec3 color(vec3 p, vec3 normal)` 添加可选的程序化颜色。将颜色值保持在 0..1 的 RGB 范围内。
6. 首先依赖自动 SDF 边界。当动画、周期性、平移或非常薄的模型需要更紧凑或更可靠的取景/导出采样时，添加显式边界。
7. 在对可见几何体、颜色、参数、动画、边界、渲染或影响导出的内容进行更改后，运行下面的轻量级视觉验证流程。
8. 运行 `python scripts/gen <model.implicit.js>`，以构建（或刷新）CAD Viewer 打开的渲染包。如果还需要同级的 `<name>.glb` 文件，请添加 `--write`；对于 STL/3MF、非默认参数或动画，请使用 `node scripts/export.mjs --input <model.implicit.js> --glb`。

## 可视化验证

将此技能的快照工具用作快速可视化检查，而不是确定性导入/导出验证的替代方案。快照组应保持精简且目的明确。

对于简单的静态编辑，一张图像就足够了：

```bash
python scripts/snapshot --input models/implicit-cad/<model>.implicit.js --output /tmp/implicit-review/<model>.png
```

对于拓扑、周期性、细小特征、布尔混合、对象标识、颜色或疑似取景问题，请在一次 CLI 调用中渲染一小组快照，以便复用浏览器、模块和运行时模型：

```bash
python scripts/snapshot --job - <<'JSON'
{
  "input": "models/implicit-cad/<model>.implicit.js",
  "mode": "view",
  "render": { "sizeProfile": "simple", "frameMargin": 1.55 },
  "graphics": { "modelColors": true, "detail": 1.2, "shadows": true, "ambientOcclusion": true },
  "outputs": [
    { "path": "/tmp/implicit-review/<model>-iso.png", "camera": "iso" },
    { "path": "/tmp/implicit-review/<model>-front.png", "camera": "front" },
    { "path": "/tmp/implicit-review/<model>-top.png", "camera": "top" },
    { "path": "/tmp/implicit-review/<model>-right.png", "camera": "right" }
  ]
}
JSON
```

对于单一参数状态，请在作业级别添加 `implicitParameters`；当审查重点是比较不同参数变体时，则在各个输出中添加。当模型接近画面边缘时，将 `render.frameMargin` 设为约 `1.5`；如果快照看起来仍被裁切，请先检查源代码中的 `bounds` 是否裁切了光线步进本身。

对于动画，仅当动态效果属于请求的一部分时才创建简短的 GIF：

```bash
python scripts/snapshot --job - <<'JSON'
{
  "input": "models/implicit-cad/<model>.implicit.js",
  "mode": "animate",
  "outputs": [{ "path": "/tmp/implicit-review/<model>-animation.gif" }],
  "implicitAnimation": { "activeId": "<animation-id>", "durationSeconds": 3, "fps": 12 }
}
JSON
```

检查生成的 PNG/GIF，确认取景居中、顶部/底部/侧面均未被裁切、轮廓和拓扑符合预期、参数差异清晰可见、GLSL 定义的颜色正确、没有意外的孔洞/间隙，并且在所请求的图形设置下边缘足够平滑。如果快照显示存在不匹配，请修复隐式源文件或边界，然后仅重新运行相关的快照组。

## 交接

完成会创建或修改 `.implicit.js`、`.implicit.mjs`、`.glb`、`.stl` 或 `.3mf` 构件的隐式 CAD 工作后，如果已安装 `$cad-viewer` 技能，则必须始终将明确的文件路径交给 `$cad-viewer`。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回相关已创建或已更新文件的链接；请在最终响应中包含这些实时查看器链接。如果 `$cad-viewer` 不可用或启动失败，请报告该情况，而不是默默省略交接步骤。

生成验证快照后，还应在最终响应中包含已保存的 PNG/GIF 快照。如果不适用快照或快照生成失败，请说明原因，并报告仍然执行了哪些确定性验证。

## 快照工具

在此技能目录中：

```bash
python scripts/snapshot --input <model.implicit.js> --output <snapshot.png>
python scripts/snapshot --input <model.implicit.js> --output <orbit.gif> --mode orbit
python scripts/snapshot --job <render-job.json>
python scripts/snapshot --job - --json
python scripts/snapshot --help
```

使用 `python scripts/snapshot --help` 查看当前完整的命令接口。快照 CLI 与其他所有渲染技能共享（`cadgen.snapshot_cli`），并由 CAD Viewer 所使用的同一浏览器运行时驱动，因此几何体、材质和光照的渲染效果完全一致——默认的 `snapshot` 主题特意仅通过移除网格、原点轴和阴影来与视口区分；此技能仅支持 `.implicit.js`。主题设置统一位于 `--theme` 下，隐式光线步进质量设置位于 `--graphics` 下，与查看器的 Theme 和 Graphics 标签页相对应。不存在 `--display`：显示设置属于 CAD 拓扑设置，而隐式模型不包含任何此类设置。默认主题为 `snapshot`——即移除了地面网格、原点轴和阴影的 Workbench Light；此处默认同样关闭光线步进阴影，因此隐式快照与无阴影的网格路径一致（传入 `--graphics '{"shadows":true}'` 可恢复阴影）。该工具会在输出扩展名之前附加 UTC 时间戳。JSON 作业可以是单个作业、一个包含多个 `outputs` 的作业、原始作业数组或 `{ "jobs": [...] }`；对于审查资料包，优先使用多输出作业，因为这样可避免为每个相机重复构建同一制品。

## 生成工具

在此技能目录中：

```bash
python scripts/gen <model.implicit.js>
python scripts/gen <model.implicit.js> --write
python scripts/gen models/implicits/*.implicit.js --force
python scripts/gen <model.implicit.js> --resolution 128 --threads 4
python scripts/gen --help
```

`scripts/gen` 会构建模型的**渲染包**——即 CAD Viewer 打开的烘焙网格，
位于模型文件夹下的 `__cadgen__/models/<name>.implicit.js/`（`implicit.json` +
`model.glb`）。该渲染包使用模型参数的默认值进行烘焙：不包含实时
参数，也不包含动画。查看器也会通过同一
生成器按需构建它，因此在此处构建的渲染包与通过打开模型构建的渲染包是相同的制品。

渲染包为最新状态的模型会被跳过；`--force` 会强制重新构建。`--write` 还会通过
同一次网格处理，在源文件旁保留同级的 `<name>.glb`——该文件是普通的
导出预设 GLB（渲染包自身的 `model.glb` 已针对查看器进行压缩，不能作为
替代品）。当你需要 STL 或 3MF、非默认参数或
动画时，请使用 `scripts/export`。

## 导出工具

在此技能目录中：

```bash
node scripts/export.mjs --input <model.implicit.js> --glb
node scripts/export.mjs --input <model.implicit.js> --stl <mesh.stl> --resolution <resolution>
node scripts/export.mjs --input <model.implicit.js> --stl --3mf --glb
node scripts/export.mjs --input <model.implicit.js> --3mf --params '<parameter-json>' --json
node scripts/export.mjs --help
```

每种格式对应一个标志——`--stl`、`--3mf`、`--glb`——一次运行中可指定多个，与 CAD Skill 的导出 CLI 保持一致。必须至少指定一个格式；若未指定，命令将以状态码 2 退出。每次运行只对模型进行一次网格化，因此请求的所有格式均来自完全相同的几何体。未提供路径的格式标志会将文件写入源文件所在目录，并使用相同的主文件名，例如对于 `<model>.implicit.js`，输出为 `<model>.glb`；提供的路径则相对于当前目录解析。使用 `node scripts/export.mjs --help` 查看当前完整的命令接口。