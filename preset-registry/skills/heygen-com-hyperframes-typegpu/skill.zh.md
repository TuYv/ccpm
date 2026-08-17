---
name: typegpu
description: TypeGPU and raw WebGPU adapter patterns for HyperFrames. Use when creating GPU-rendered compositions with TypeGPU, raw WebGPU, WGSL fragment shaders, compute pipelines, liquid glass effects, particle systems, or any canvas layer driven by navigator.gpu that responds to HyperFrames hf-seek events.
---
# HyperFrames 中的 TypeGPU / WebGPU

HyperFrames 通过其 `typegpu` 运行时适配器支持 TypeGPU 和原生 WebGPU。该适配器不会接管你的管线。它会发布 HyperFrames 时间并分发 seek 事件，以便你的合成内容能够渲染精确的 GPU 帧。

## 约定

- 异步初始化 WebGPU（`await navigator.gpu.requestAdapter()`），但必须在任何 `await` 之前**同步**注册所有 GSAP 补间动画。HyperFrames 播放器会在页面加载时立即读取时间线。
- 使用 HyperFrames 时间进行渲染，而不是 `performance.now()`。
- 监听 `hf-seek` 事件，并严格按照该时间重新渲染。
- 针对 WebGPU 不可用的环境添加防护——适配器不会替你进行检查。
- 对于视频渲染，在提交 GPU 工作后调用 `await device.queue.onSubmittedWorkDone()`，以确保在捕获帧之前已将画布内容刷新完毕。

适配器会在每次 seek 时设置 `window.__hfTypegpuTime`，并分发 `new CustomEvent("hf-seek", { detail: { time } })`。

## 基本模式

```html
<canvas id="gpu-layer"></canvas>
<script>
  (async () => {
    if (!navigator.gpu) return;
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return;
    const device = await adapter.requestDevice();
    const canvas = document.getElementById("gpu-layer");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("webgpu");
    const fmt = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format: fmt, alphaMode: "opaque" });

    // Build your pipeline, buffers, bind groups...
    const timeUniform = new Float32Array([0]);
    const timeBuf = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    function render(t) {
      timeUniform[0] = t;
      device.queue.writeBuffer(timeBuf, 0, timeUniform);
      const enc = device.createCommandEncoder();
      const pass = enc.beginRenderPass({
        colorAttachments: [
          {
            view: ctx.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([enc.finish()]);
    }

    render(0);
    window.addEventListener("hf-seek", (e) => render(e.detail.time));
  })();
</script>
```

## 时间线注册

驱动文本、字幕或 HTML 元素的 GSAP 补间动画必须在任何 `await` 之前**同步**注册：

```js
const tl = gsap.timeline({ paused: true });

// Caption tweens: synchronous, added before WebGPU init
gsap.set(".cap", { opacity: 0 });
tl.to("#cap-1", { opacity: 1, duration: 0.3 }, 1.0);
tl.to("#cap-1", { opacity: 0, duration: 0.2 }, 3.5);

window.__timelines["my-comp"] = tl;

// GPU-dependent tweens can go inside the async IIFE
(async () => {
  // ... WebGPU init ...
  const proxy = { value: 0 };
  tl.to(proxy, { value: 1, duration: 2, onUpdate: render }, 0.5);
})();
```

## 视频驱动的效果（液态玻璃、扭曲）

要将 `<video>` 用作 GPU 输入纹理：

```js
const videoEl = document.getElementById("aroll");

// Wait for video metadata before creating the texture
await new Promise((r) => {
  if (videoEl.readyState >= 1) r();
  else videoEl.addEventListener("loadedmetadata", r, { once: true });
});

// Create texture at the video's NATIVE resolution
const vw = videoEl.videoWidth,
  vh = videoEl.videoHeight;
const bgTex = device.createTexture({
  size: [vw, vh],
  format: "rgba8unorm",
  usage:
    GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
});

function render(t) {
  try {
    device.queue.copyExternalImageToTexture({ source: videoEl }, { texture: bgTex }, [vw, vh]);
  } catch (_) {
    /* frame not decoded yet */
  }
  // ... draw ...
}
```

**渲染模式注意事项：** 无头 Chrome 可能无法对视频元素执行 `copyExternalImageToTexture`。对于生产渲染，请预先通过 FFmpeg 将关键帧提取为 PNG，并将其作为图像纹理加载。

## 通过降采样通道实现磨砂模糊

单通道高斯核对于玻璃质感的磨砂模糊来说效果太弱。请使用双通道方法：

1. **通道 1 — 降采样：** 将全分辨率纹理渲染到一个较小的纹理（1/6 分辨率）。降采样期间的双线性过滤会自然地对像素取平均值。
2. **通道 2 — 玻璃合成：** 对磨砂内部区域采样较小的纹理（双线性放大 = 强烈的平滑模糊），并对清晰区域和色差折射采样全分辨率纹理。

这种方式无需生成 mipmap，即可实现与 TypeGPU 的 `textureSampleBias` mip 层级方法相同的效果。

## 透明画布与不透明画布

- **`alphaMode: 'opaque'`** — GPU 画布渲染完整帧（视频 + 效果）。适用于由 GPU 流水线处理所有视觉内容的情况。
- **`alphaMode: 'premultiplied'`** — GPU 画布在 alpha = 0 的位置透明，使下方的 HTML 元素能够显示出来。适用于叠加在普通 `<video>` 元素之上的覆盖效果（粒子、路径动画）。

## WGSL 全屏三角形

用于全屏效果的标准顶点着色器（无需顶点缓冲区）：

```wgsl
struct Vo { @builtin(position) pos: vec4f, @location(0) uv: vec2f }

@vertex fn vs(@builtin(vertex_index) vi: u32) -> Vo {
  let ps = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.));
  let ts = array<vec2f, 3>(vec2f(0., 1.), vec2f(2., 1.), vec2f(0., -1.));
  return Vo(vec4f(ps[vi], 0., 1.), ts[vi]);
}
```

使用 `pass.draw(3)` 进行绘制——用一个三角形覆盖视口。

## 圆角矩形 SDF（液态玻璃胶囊）

```wgsl
fn sdf_box(p: vec2f, half_size: vec2f, corner_radius: f32) -> f32 {
  let d = abs(p) - half_size + vec2f(corner_radius);
  return length(max(d, vec2f(0.))) + min(max(d.x, d.y), 0.) - corner_radius;
}
```

使用此函数为玻璃效果定义内部、环形和外部区域。负值表示位于形状内部。

## 确定性渲染

- 不要使用 `Math.random()`——使用带种子的伪随机数生成器。
- 不要在渲染循环中使用 `requestAnimationFrame`——仅在响应 `hf-seek` 时进行渲染。
- 不要使用 `performance.now()` 获取动画时间——读取 `window.__hfTypegpuTime` 或 `e.detail.time`。
- GPU 提交后，调用 `await device.queue.onSubmittedWorkDone()` 以进行渲染模式下的帧捕获。