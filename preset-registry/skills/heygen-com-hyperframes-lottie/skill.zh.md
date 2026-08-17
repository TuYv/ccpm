---
name: lottie
description: Lottie and dotLottie adapter patterns for HyperFrames. Use when embedding lottie-web JSON animations, .lottie files, @lottiefiles/dotlottie-web players, registering instances on window.__hfLottie, or making After Effects exports deterministic in HyperFrames.
---
# HyperFrames 中的 Lottie

HyperFrames 可以通过其 `lottie` 运行时适配器对 `lottie-web` 和 dotLottie 播放器进行定位。Lottie 非常适合这种场景，因为动画时间线已经编码在资源中；HyperFrames 只需要一个可供其定位的播放器对象。

## 约定

- 从本地项目文件加载资源，通常位于 `assets/` 下。
- 设置 `autoplay: false`。
- 除非用户明确希望循环播放，否则优先设置 `loop: false`。
- 将返回的每个动画或播放器注册到 `window.__hfLottie`。
- 使用 CSS 保持 Lottie 容器的尺寸稳定。

适配器使用 `goToAndStop(timeMs, false)` 定位 `lottie-web`，并根据播放器的形态使用帧或百分比 API 定位 dotLottie。

## lottie-web 模式

```html
<div id="logo-lottie" class="lottie-layer"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<script>
  const anim = lottie.loadAnimation({
    container: document.getElementById("logo-lottie"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "assets/logo-reveal.json",
  });

  window.__hfLottie = window.__hfLottie || [];
  window.__hfLottie.push(anim);
</script>
```

```css
.lottie-layer {
  width: 100%;
  height: 100%;
}
```

## dotLottie 模式

```html
<canvas id="product-lottie" class="lottie-canvas"></canvas>
<script src="https://unpkg.com/@lottiefiles/dotlottie-web"></script>
<script>
  const player = new DotLottie({
    canvas: document.getElementById("product-lottie"),
    src: "assets/product-flow.lottie",
    autoplay: false,
    loop: false,
  });

  window.__hfLottie = window.__hfLottie || [];
  window.__hfLottie.push(player);
</script>
```

```css
.lottie-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
```

## 多个动画

将每个播放器推入同一个注册表：

```js
window.__hfLottie = window.__hfLottie || [];
window.__hfLottie.push(backgroundAnim);
window.__hfLottie.push(iconAnim);
window.__hfLottie.push(confettiAnim);
```

HyperFrames 会将它们全部定位到相同的合成时间。

## 适用场景

- 已知能够在 lottie-web 中正确渲染的 After Effects 导出内容。
- Logo 展示动画、图标循环动画、装饰性点缀和产品 UI 动效。
- 将 Remotion 中的 Lottie 用法转换为纯 HyperFrames HTML。

## 避免

- 在渲染时依赖远程 `path` URL。
- 使用 `play()` 开始播放。
- 假定不受支持的 After Effects 效果在导出后仍能保留。请先在浏览器中测试 JSON 或 `.lottie` 文件。
- 异步加载播放器，并在 HyperFrames 验证已经检查过页面之后才注册它。

## 验证

编辑 Lottie 合成后：

```bash
npx hyperframes lint
npx hyperframes validate
```

## 致谢与参考资料

- HyperFrames 适配器源代码：`packages/core/src/runtime/adapters/lottie.ts`。
- Airbnb 的 lottie-web：https://github.com/airbnb/lottie-web
- lottie-web `loadAnimation` 选项：https://github.com/airbnb/lottie-web/wiki/loadAnimation-options
- LottieFiles 的 dotLottie Web 播放器方法：https://developers.lottiefiles.com/docs/dotlottie-player/dotlottie-web/methods