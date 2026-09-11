---
name: seam-craft
description: Render-correctness doctrine for scene-to-scene seams in HyperFrames launch videos — the prerequisites that make transitions composite correctly on the master timeline. Load when assembling the master timeline / index.html, when a white flash appears at a cut or crossfade seam (especially on dark films), when reasoning about why a transition opacity dip shows through, or when verifying the render-side mechanics of how overlapping scene wrappers blend. Covers the opaque stage-ground (#root background) white-flash guard and how the injector overlaps wrappers, holds final frames, ping-pongs tracks, and stamps lint-clean template code onto the master timeline. Does NOT contain the per-transition catalog — see the transition registry for individual transition entries.
metadata:
  internal: true
---
# Seam Craft — 场景到场景转场的渲染前置条件

这是 PLV 场景到场景接缝的**渲染正确性准则**：这些前置条件和主时间轴机制，能让任何转场都正确合成，而不依赖具体选择了哪一种转场。逐个转场的目录（crossfade、push-slide、zoom-through、cut-the-curve，……）位于转场注册表中，本页是支撑它们全部的底层准则。

此准则管辖的转场是 **Tier-B-ready**：只对两个场景**剪辑包装器**（`#el-<sid>`）执行纯 transform / opacity / filter，不注入覆盖层 DOM，不需要单个场景配合。覆盖层家族（staggered blocks、blinds、light leak、grid dissolve、page burn）和 shader 转场会推迟到后续阶段。

## 舞台底色前置条件（白闪防护）

有几个模板会打开一个窗口，在其中两个包装器的 opacity 总和 < 1（cut-the-curve 的中段窗口切换、zoom-through 的 0.15 下限、plain crossfade 的幂曲线下陷）。在那个窗口期间，包装器后面的任何内容都会透出来。如果组装后的 `index.html` `#root` 没有不透明背景，渲染器会把这段下陷合成到默认的**白色**页面上 → 每个接缝都会出现白闪，在暗色视频中非常刺眼（修复前曾在两次 Spotify 运行中观察到）。
**组装器必须绘制舞台：** `#root { background:
var(--canvas-deep, var(--canvas, #000)) }` — `assemble-index.mjs` 现在会输出这个；这些模板的任何其他消费者也拥有同样的保证责任。

## 注入器如何应用转场

在场景 _i_（`from`）和场景 _i+1_（`to`）之间的 `break` 边界处，注入器会：

1. 将 `#el-<from>` 包装器的 `data-duration` 延长 `duration_s`（保持其最终帧 — 已验证：`core/src/runtime/init.ts:1393-1410` external-slot branch）。
2. 将 `#el-<to>` 包装器的 `data-start` 提前 `duration_s`（创建重叠窗口）。
3. 将**所有**剪辑的 `data-track-index` 重新分配为 0/1 ping-pong，使两个重叠的包装器永远不会共享同一轨道（同轨重叠是非法的 — `core/src/lint/rules/composition.ts`）。更高轨道会合成在上方。
4. 在 `T = overlap-start` 处将 `gsap_template` 标记到 `window.__timelines["main"]` 中。

已通过原型渲染验证（2026-05-31）：主时间轴包装器 tween 会被 seek 并渲染（不会与子合成自身的 paused timeline 发生双重 seek — 运行时会独立驱动它们），延长后的包装器会保持场景 _i_ 的最终帧，而更高轨道的入场包装器会合成在出场包装器之上并与其混合。

## 模板占位符

注入器会替换每个 `gsap_template` 行中的这些 token：

| Token                              | 含义                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `__OLD__`                          | `"#el-<from>"` — 出场剪辑包装器选择器（带引号）                          |
| `__NEW__`                          | `"#el-<to>"` — 入场剪辑包装器选择器（带引号）                            |
| `__T__`                            | 重叠开始时间，单位为秒（主时钟）                                         |
| `__DUR__`                          | 此边界的 `duration_s`                                                    |
| `__DX__`                           | 方向类型的水平位移：`-1920` (LEFT) / `1920` (RIGHT)                      |
| `__DY__`                           | 垂直位移：`-1080` (UP) / `1080` (DOWN)                                   |
| `__ORIGIN_OUT__` / `__ORIGIN_IN__` | `squeeze` 的 transformOrigin 对                                          |

`filter` / `scaleX` / `transformOrigin` 在主时间轴上通过 lint 检查
（已验证：`core/src/lint/rules/gsap.ts` 没有按属性设置白名单，并且将其检查范围限定在
`data-composition-id` 范围内；x/y/scale/rotation/opacity 白名单仅是
_scene-worker_ 提示规则，不适用于 index.html）。