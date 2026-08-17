---
name: three
description: Three.js and WebGL adapter patterns for HyperFrames. Use when creating deterministic Three.js scenes, WebGL canvas layers, AnimationMixer timelines, camera motion, shader-driven visuals, or canvas renders that respond to HyperFrames hf-seek events.
---
# HyperFrames 中的 Three.js

HyperFrames 通过其 `three` 运行时适配器支持 Three.js。该适配器不会接管你的场景。它会发布时间信息并分发 seek 事件，以便你的合成能够渲染精确的帧。

## 约定

- 尽可能同步创建场景、相机、渲染器、材质和资源。
- 基于 HyperFrames 时间而非挂钟时间进行渲染。
- 监听 `hf-seek` 事件，并精确渲染该时间点。
- 在对渲染至关重要的 seek 操作之前加载模型、纹理和 HDRI。不要在 seek 时获取它们。
- 避免使用 `requestAnimationFrame` 或 `renderer.setAnimationLoop` 作为对渲染至关重要的运动效果的基准来源。

适配器会设置 `window.__hfThreeTime`，并在每次 seek 时分发 `new CustomEvent("hf-seek", { detail: { time } })`。

## 基本模式

```html
<canvas id="three-layer"></canvas>
<script type="module">
  import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";

  const canvas = document.getElementById("three-layer");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  // Match these to your composition's frame size.
  renderer.setSize(1920, 1080, false);
  renderer.setPixelRatio(1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1920 / 1080, 0.1, 100);
  camera.position.set(0, 0, 6);

  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4, 4),
    new THREE.MeshStandardMaterial({ color: 0x64d2ff, roughness: 0.38 }),
  );
  scene.add(mesh);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 2));

  function renderAt(time) {
    mesh.rotation.y = time * 0.7;
    mesh.rotation.x = Math.sin(time * 0.6) * 0.16;
    renderer.render(scene, camera);
  }

  window.addEventListener("hf-seek", (event) => {
    renderAt(event.detail.time);
  });

  renderAt(window.__hfThreeTime || 0);
</script>
```

```css
#three-layer {
  width: 100%;
  height: 100%;
  display: block;
}
```

## AnimationMixer 模式

对于 GLTF 或创作好的剪辑动画，请直接定位 mixer：

```js
function renderAt(time) {
  mixer.setTime(time);
  renderer.render(scene, camera);
}
```

如果存在多个 mixer，请使用同一个 `time` 定位所有 mixer。

## 适用场景

- 确定性的 3D 对象、产品旋转展示、使用种子数据的粒子以及着色器画面。
- 根据 `time` 推导出的相机运动。
- 资源位于本地且在验证完成前已加载的 GLTF 动画剪辑。

## 避免

- 使用 `Date.now()`、`performance.now()` 或时钟增量更新场景状态。
- 将对渲染至关重要的工作留在自由运行的动画循环中。
- 在渲染时加载远程模型或纹理。
- 输出依赖设备像素比。进行视频渲染时，请固定渲染器尺寸和像素比。
- 使用依赖前一帧历史记录的后处理通道，除非你可以根据时间重建状态。

## 验证

编辑 Three.js 合成后：

```bash
npx hyperframes lint
npx hyperframes validate
```

## 致谢与参考资料

- HyperFrames 适配器源代码：`packages/core/src/runtime/adapters/three.ts`。
- Three.js `WebGLRenderer` 文档：https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js `AnimationMixer.setTime()` 文档：https://threejs.org/docs/pages/AnimationMixer.html