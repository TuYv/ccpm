---
name: oversized-cursor
description: House-style oversized macOS cursor technique for HyperFrames launch videos. Load whenever a scene involves cursors or a pointer-led action, when kicking off a UI scene, when igniting a morph/transition/typing run with a click, or when a scene reads as static, dead, or stale and needs a cheap high-yield source of motion to carry the viewer's eye and segment them out of the stale state. Covers cursor size/look (incl. brand-motif cursors), the off-screen entry law, tip-targeting and the click tap, click-ignites-the-next-beat, and exit / cross-scene handoff.
metadata:
  internal: true
---
# 超大光标 —— 视线引导者

一种刻意放大的 macOS 风格指针，作为_可见的主角_在画面中移动：它从画外进入，引导观众视线前往下一个关注点，点击触发接下来发生的事情，然后离开。已在多部发布影片中经过制作验证。

**存在的意义。** 大幅度的光标移动是发布视频中成本最低、收益最高的运动来源之一：只需一个元素和仅改变变换属性的补间动画，就能（1）在原本容易显得死气沉沉的场景中带领视线横跨屏幕，（2）为形变和转场提供因果触发（“是点击造成了变化”），以及（3）在启动新场景或复杂动画序列时，将视线从停滞状态中分离出来。越大越好——实际尺寸的光标在视频比例下会消失。

## 尺寸与外观（规范约定）

- **全画幅场景：`7cqw`**（在 1920px 下约为 134px）。嵌入模拟界面 / 小画幅变体：`4.6–5.5cqw`。绝不能更小。
- 所有场景统一使用一种 SVG 箭头几何形状。两种经过验证的填充方案——白色主体 + 黑色描边，或黑色主体（`#1c1c1c`）+ 白色描边（1.4px）。根据场景对比度选择，每部影片中保持一致。
- **品牌主题光标（强力方案）。** macOS 箭头是默认选项，**不是强制要求**。当主体品牌拥有可识别的光标身份——例如协作设计工具中带姓名标签的彩色多人光标（Figma 风格）、创意套件的精准十字准线，或某种独特的产品指针——就改用该光标：对于了解该产品的人来说，它能立即传达品牌语言。其他规则保持不变（超大尺寸、从画外进入和离开、尖端对准目标、点击触发），带姓名标签的变体要作为一个刚性整体移动（标签跟随在箭头后方）。只有当这种主题确实具有可供观众联想到的特征时才使用；一个没人能识别的光标只会是一个奇怪的箭头——此时回归 macOS 默认样式。
- `filter: drop-shadow(0 4px 6px rgba(0,0,0,.3))`、`pointer-events: none`、`z-index` 高于所有场景内容、`will-change: transform`。

```css
#root .cursor {
  position: absolute;
  left: 48%;
  top: 115%; /* off-screen below — the resting pose IS off-screen */
  width: 7cqw;
  height: 7cqw;
  z-index: 20;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  pointer-events: none;
  will-change: transform;
}
```

## 进入规则——必须真实，不能被看见

光标**始终从画外进入**（规范方式：从下方进入，`top:115–120%`），然后沿一段减速滑行路径抵达第一个目标。它必须让人感觉像是“进入了房间”。绝不要在静止位置通过透明度淡入，也不要用遮罩揭示——那看起来像故障（这是一个真实存在且被反复观察到的失败模式）。

- 默认路径：沿 y 轴**直线上移**到目标位置——不要使用碎片化的斜线。当故事本身需要朝向偏轴目标进入时，可以使用斜线，但无论哪种情况都必须是一条连续向量。
- `duration: 0.4–0.92s`、`ease: power3.out`、`fromTo` 中设置 `immediateRender: false`。

```js
tl.fromTo(
  cursor,
  { left: "48.6%", top: "115%" },
  { left: "48.6%", top: "55%", duration: 0.85, ease: "power3.out", immediateRender: false },
  0.25,
);
```

## Tip 定位与点击动作

热点是箭头的箭尖，而不是方框中心。让**箭尖**落在目标中心，并将所有按压缩放都围绕箭尖进行：`transformOrigin: '21% 14%'`（适用于 24-unit viewBox 中的房屋箭头路径）。

点击 = 不对称压缩/展开（1:2 的比例呈现真实的点击感）：

```js
tl.to(cursor, { scale: 0.84, duration: 0.1, ease: "power2.in", transformOrigin: "21% 14%" }, t);
tl.to(
  cursor,
  { scale: 1, duration: 0.22, ease: "power2.out", transformOrigin: "21% 14%" },
  t + 0.1,
);
```

**目标的反应是一个独立的并行动画**（按钮：`scale: 0.94` + 按压颜色/阴影，并从同一个 `t` 开始）。仅光标自身的点击（例如聚焦文本输入框）不会触发目标反应。目标侧可搭配 `cursor-click-ripple` / `press-release-spring`。

## 点击会点燃下一拍

不要让变形、输入动画、窗口变换或定义场景的动画只是简单地开始。让光标停在触发点上，并让点击在同一帧触发它：

- 点击 ▸ 菜单/子菜单级联、开关翻转
- 点击 ▸ 启动向输入框中输入文字
- 点击 ▸ 编辑器向下变形 / 窗口缩小
- 点击 ▸ logo 点燃 / 飞行启动
- 点击 ▸ 播放状态翻转 + 产品模拟界面中的 UI 生命被唤醒

在光标不负责的长时段动作（输入、旁白）期间，光标要**向一侧漂移**（0.5–0.9s，`power2.out`），绝不能冻结在动作上方，也不能无意义地晃动。

## 退出规则与跨场景交接

有两种获准的退出方式，两者都必须具有物理感，**绝不能原地淡出**：

1. **离开画面**：使用 `power2.in` 加速驶向最近的边缘（`left:'118%'`、`left:'-12%'` 或 `top:'116%'`），耗时 0.5–0.7s。
2. **切断曲线交接**：在硬切前最后约 0.3s，光标开始使用 `power2.in` 加速驶向**下一场景的第一个点击位置**，覆盖该路径的前约 1/3；下一个构图通过 `gsap.set` 将光标设置在交接姿态上，并以匹配的速度使用 `power2.out` 继续。光标本身成为衔接场景的载体：

```js
// scene A, last 0.3s — start the journey:
tl.to(cursor, { left: "40.7%", top: "63.7%", duration: 0.3, ease: "power2.in" }, CUT - 0.3);
// scene B, t=0 — finish it at matched velocity:
gsap.set(cursorB, { left: "40.7%", top: "63.7%" });
tl.to(cursorB, { left: "22%", top: "45%", duration: 0.6, ease: "power2.out" }, 0);
```

## 检查清单

- [ ] ≥ 7cqw 全画面（模拟界面内为 4.6–5.5cqw）——不确定时，宁可更大
- [ ] 从画面外沿一条连续向量进入（不使用淡入/遮罩揭示）
- [ ] 箭尖落在目标中心；按压围绕 `transformOrigin: '21% 14%'` 进行
- [ ] 每次点击都会在同一帧触发某些变化
- [ ] 在不负责的动作期间向一侧漂移；零无意义晃动
- [ ] 以物理方式退出（离开画面或切断曲线交接）——不能原地淡出