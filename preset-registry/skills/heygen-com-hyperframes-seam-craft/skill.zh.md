---
name: seam-craft
description: Render-correctness doctrine for scene-to-scene seams in HyperFrames launch videos — the prerequisites that make transitions composite correctly on the master timeline. Load when assembling the master timeline / index.html, when a white flash appears at a cut or crossfade seam (especially on dark films), when reasoning about why a transition opacity dip shows through, or when verifying the render-side mechanics of how overlapping scene wrappers blend. Covers the opaque stage-ground (#root background) white-flash guard and how the injector overlaps wrappers, holds final frames, ping-pongs tracks, and stamps lint-clean template code onto the master timeline. Does NOT contain the per-transition catalog — see the transition registry for individual transition entries.
---
# 接缝工艺——场景间转场的渲染前提条件

这是 PLV 场景间接缝的**渲染正确性准则**：确保任何转场都能正确合成所需的前提条件和主时间轴机制，与具体选择哪种转场无关。各类转场目录（交叉淡化、推拉滑动、穿越缩放、曲线切换……）位于转场注册表中——本页是支撑所有这些转场的底层准则。

此准则所涵盖的转场均**已达到 Tier-B 就绪标准**：仅对两个场景的**剪辑包装器**（`#el-<sid>`）应用变换 / 不透明度 / 滤镜，不注入叠加层 DOM，也不需要各场景配合。叠加层系列（交错色块、百叶窗、漏光、网格溶解、页面灼烧）和着色器转场将推迟到后续阶段。

## 舞台底色前提条件（白闪防护）

有几个模板会产生两个包装器的不透明度之和 < 1 的时间窗口（曲线切换的窗口中段切换、穿越缩放的 0.15 下限、普通交叉淡化的幂曲线下凹）。在此窗口期间，包装器后方的任何内容都会显现。如果组装后的 `index.html` 中的 `#root` 没有不透明背景，渲染器就会将该下凹区间合成到默认的**白色**页面上 → 每个接缝处都会出现白闪，在深色影片中尤其刺眼（修复前已在两次 Spotify 运行中观察到）。**组装器必须为舞台着色：** `#root { background:
var(--canvas-deep, var(--canvas, #000)) }`——`assemble-index.mjs` 现在会输出此样式；这些模板的任何其他使用方也必须提供同样的保证。

## 注入器如何应用转场

在场景 _i_（`from`）与场景 _i+1_（`to`）之间的 `break` 边界处，注入器会：

1. 将 `#el-<from>` 包装器的 `data-duration` 延长 `duration_s`（保持其最后一帧——已验证：`core/src/runtime/init.ts:1393-1410` 外部槽位分支）。
2. 将 `#el-<to>` 包装器的 `data-start` 提前 `duration_s`（创建重叠窗口）。
3. 将**所有**剪辑的 `data-track-index` 重新分配为 0/1 乒乓交替形式，使两个重叠的包装器永远不会共享同一轨道（同轨重叠是非法的——`core/src/lint/rules/composition.ts`）。较高的轨道会合成在上层。
4. 在 `T = overlap-start` 处将 `gsap_template` 写入 `window.__timelines["main"]`。

原型渲染验证（2026-05-31）：主时间轴包装器补间会被定位并渲染（不会与子合成自身暂停的时间轴发生重复定位——运行时会独立驱动它们），延长后的包装器会保持场景 _i_ 的最后一帧，而位于较高轨道上的传入包装器会在传出包装器上方进行合成并与之混合。

## 模板占位符

注入器会替换每个 `gsap_template` 行中的以下标记：

| 标记                               | 含义                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `__OLD__`                          | `"#el-<from>"`——传出剪辑包装器选择器（带引号）                           |
| `__NEW__`                          | `"#el-<to>"`——传入剪辑包装器选择器（带引号）                             |
| `__T__`                            | 以秒为单位的重叠开始时间（主时钟）                                       |
| `__DUR__`                          | 此边界的 `duration_s`                                                     |
| `__DX__`                           | 方向类型的水平移动距离：`-1920`（LEFT）/ `1920`（RIGHT）                 |
| `__DY__`                           | 垂直移动距离：`-1080`（UP）/ `1080`（DOWN）                              |
| `__ORIGIN_OUT__` / `__ORIGIN_IN__` | `squeeze` 的 transformOrigin 对                                           |

`filter` / `scaleX` / `transformOrigin` 在主时间轴上均可通过 lint 检查
（已验证：`core/src/lint/rules/gsap.ts` 没有针对单个属性的白名单，并且其检查范围限定在
`data-composition-id` 区域内；x/y/scale/rotation/opacity 白名单仅是 _scene-worker_ 的提示词规则——它并不约束 index.html）。