---
name: oversized-cursor
description: House-style oversized macOS cursor technique for HyperFrames launch videos. Load whenever a scene involves cursors or a pointer-led action, when kicking off a UI scene, when igniting a morph/transition/typing run with a click, or when a scene reads as static, dead, or stale and needs a cheap high-yield source of motion to carry the viewer's eye and segment them out of the stale state. Covers cursor size/look (incl. brand-motif cursors), the off-screen entry law, tip-targeting and the click tap, click-ignites-the-next-beat, and exit / cross-scene handoff.
---
# 超大光标——视线引导者

一个特意放大的 macOS 风格指针，作为一个_可见的主角_穿行于画面中：它从屏幕外进入，引导观众的视线移向下一个关注点，通过点击触发接下来发生的事情，然后离开。已在多部发布影片中经过制作验证。

**它存在的原因。** 大幅度的光标移动是发布视频中成本最低、收益最高的动态来源之一：只需一个元素和仅使用 transform 的补间动画，它就能：(1) 在原本会显得静止呆板的场景中引导视线横跨屏幕，(2) 为形变/转场赋予因果触发感（“是这次点击造成的”），以及 (3) 在开启新场景或复杂动画序列时，让视线摆脱停滞状态。越大越好——实际尺寸的光标在视频尺度下会消失不见。

## 尺寸与外观（统一惯例）

- **全画幅场景：`7cqw`**（在 1920 宽度下约为 134px）。模拟界面内 / 小画幅变体：
  `4.6–5.5cqw`。绝不能更小。
- 所有场景统一使用一种 SVG 箭头几何形状。两种经过验证的填充方案——白色主体 + 黑色描边，或黑色主体（`#1c1c1c`）+ 白色描边（1.4px）。根据每个场景的对比度选择，但整部影片中保持一致。
- **品牌主题光标（强力招式）。** macOS 箭头是默认选择，而非强制要求。当主题品牌拥有辨识度高的光标标识时——例如协作设计工具中带姓名标签的彩色多人协作箭头（Figma 风格）、创意套件的精密十字准星、独具特色的产品指针——应改用该品牌自己的光标：任何熟悉该产品的人都能立即读懂这种品牌语言。所有规则均原样适用（超大尺寸、从画面外真实进入/退出、尖端对准目标、点击触发），带姓名标签的变体应作为一个刚性整体移动（标签跟随在箭头后方）。仅当该主题确实具有明确可识别的指涉时才使用；如果没人认得这个光标，它就只是一个古怪的箭头——此时应恢复使用 macOS 默认光标。
- `filter: drop-shadow(0 4px 6px rgba(0,0,0,.3))`、`pointer-events: none`、
  `z-index` 高于所有场景内容，并设置 `will-change: transform`。

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

## 入场法则——真实移动，绝不显现

光标**始终从屏幕外进入**（标准方式：从下方，`top:115–120%`），并通过一次减速滑行动画移动至第一个目标。必须让人_感觉它进入了房间_。绝不能让它在静止位置通过不透明度渐变淡入，也绝不能使用遮罩显现——那看起来就像故障（这是一个真实且反复观察到的失败模式）。

- 默认路径：沿 **y 轴垂直向上**移动至目标——不要使用零碎的对角线路径。
  如果对角线本身就是叙事的一部分（朝偏离轴线的目标入场），那么使用对角线没有问题，但无论如何都必须是一条连续向量。
- `duration: 0.4–0.92s`、`ease: power3.out`，并在 fromTo 上设置 `immediateRender: false`。

```js
tl.fromTo(
  cursor,
  { left: "48.6%", top: "115%" },
  { left: "48.6%", top: "55%", duration: 0.85, ease: "power3.out", immediateRender: false },
  0.25,
);
```

## 尖端瞄准与点击轻触

热点位于箭头的尖端，而不是方框中心。让**尖端**落在目标中心，并让所有按压缩放都以尖端为轴心：`transformOrigin: '21% 14%'`（适用于 24 单位 viewBox 中的房屋箭头路径）。

点击 = 非对称压缩/展开（1:2 的时长比例会呈现出真实的轻触感）：

```js
tl.to(cursor, { scale: 0.84, duration: 0.1, ease: "power2.in", transformOrigin: "21% 14%" }, t);
tl.to(
  cursor,
  { scale: 1, duration: 0.22, ease: "power2.out", transformOrigin: "21% 14%" },
  t + 0.1,
);
```

**目标的反应是一个独立、并行的补间动画**（按钮：`scale: 0.94` + 按压颜色/阴影，与点击在同一个 `t` 开始）。仅光标轻触（例如聚焦文本输入框）时，目标不得有任何反应。目标侧应搭配 `cursor-click-ripple` / `press-release-spring`。

## 点击点燃下一个节拍

绝不要让变形、输入过程、窗口变换或定义场景的动画自行_开始_。将光标停在触发目标上，让点击在同一帧触发动画：

- 点击 ▸ 菜单/子菜单级联展开、开关翻转
- 点击 ▸ 启动输入框中的打字动画
- 点击 ▸ 编辑器向下变形 / 窗口收缩
- 点击 ▸ 标志点亮 / 飞行启动
- 点击 ▸ 播放状态翻转 + 产品模型中的 UI 生机唤醒

在光标不主导的长节拍（打字、旁白）期间，光标应**漂移到一旁**（0.5–0.9s，`power2.out`）——绝不能僵停在动作上方，也不能无所事事地晃动。

## 退出法则与跨场景交接

仅允许两种退出方式——两者都必须具有物理运动感，**绝不能原地淡出**：

1. **离开画面**：使用 `power2.in` 加速移出最近的边缘
   （`left:'118%'`、`left:'-12%'` 或 `top:'116%'`），时长 0.5–0.7s。
2. **截断曲线交接**：在硬切前最后约 0.3s 内，光标开始使用
   `power2.in` 朝下一个场景的首个点击点加速，走完这段路径最初约 1/3；下一个构图使用 `gsap.set` 将光标放置在
   交接姿态，并以匹配的速度使用 `power2.out` 继续运动。光标本身成为衔接切口的载体元素：

```js
// scene A, last 0.3s — start the journey:
tl.to(cursor, { left: "40.7%", top: "63.7%", duration: 0.3, ease: "power2.in" }, CUT - 0.3);
// scene B, t=0 — finish it at matched velocity:
gsap.set(cursorB, { left: "40.7%", top: "63.7%" });
tl.to(cursorB, { left: "22%", top: "45%", duration: 0.6, ease: "power2.out" }, 0);
```

## 检查清单

- [ ] 全画面中 ≥ 7cqw（模型内部为 4.6–5.5cqw）——不确定时，宁可更大
- [ ] 沿一条连续矢量路径从画面外进入（不得使用淡入/蒙版显现）
- [ ] 尖端落在目标中心；按压以 `transformOrigin: '21% 14%'` 为轴心
- [ ] 每次点击都必须在同一帧引发某种效果
- [ ] 在光标不主导的节拍期间漂移到一旁；不得有任何空闲晃动
- [ ] 以物理方式退出（移出画面或截断曲线交接）——不得原地淡出