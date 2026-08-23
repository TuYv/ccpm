---
name: autopilot-cad-builder
description: Deterministic CAD build orchestration for Autopilot Chat using openagents CAD and pane tools, including week-1 gripper flow.
metadata:
  oa:
    project: openagents
    identifier: autopilot-cad-builder
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - codex:tool-call
      - cad:orchestration
      - cad:intent-control
      - desktop:pane-control
---
# Autopilot CAD 构建器

在主 `Autopilot Chat` 窗格中进行 CAD 设计轮次时，请使用此技能。

## 目标

- 在实时构建 CAD 时，让用户始终留在聊天界面中。
- 仅使用结构化 CAD 变更。
- 确保执行过程具有确定性且可检查。
- 确保快照所反映的事实与可见的渲染结果保持一致。

## 必需工具

仅使用：

- `openagents.pane.list`
- `openagents.pane.open`
- `openagents.pane.focus`
- `openagents.pane.action`
- `openagents.cad.intent`
- `openagents.cad.action`

## 操作约定

1. 在进行 CAD 变更之前，确保 CAD 窗格已打开并获得焦点。
2. 优先使用带类型化载荷的 `intent_json`，而非自由格式的提示词编辑。
3. 每次执行变更意图后，使用快照/状态操作创建检查点。
4. 保持工具调用序列简短且具有确定性。
5. 如果意图解析失败，请使用更严格的 `intent_json` 重试一次。
6. 如果 CAD 变更失败，请向用户提供简洁的补救措施。
7. 除非快照事实予以确认，否则绝不能声称 2x2 网格可见。

## 第 1 周规范提示词

当用户意图是构建第 1 周的夹爪时，请使用以下完全一致的自然语言提示词：

`Create a basic 2-jaw robotic gripper with a base plate, two parallel fingers, and mounting holes for a servo motor. Make it 3D-printable and parametric for easy scaling.`

## 第 1 周首选 `intent_json`

使用严格的类型化载荷：

```json
{
  "intent": "CreateParallelJawGripperSpec",
  "jaw_open_mm": 42.0,
  "finger_length_mm": 65.0,
  "finger_thickness_mm": 8.0,
  "base_width_mm": 78.0,
  "base_depth_mm": 52.0,
  "base_thickness_mm": 8.0,
  "servo_mount_hole_diameter_mm": 2.9,
  "print_fit_mm": 0.15,
  "print_clearance_mm": 0.35
}
```

对于第 1 周的变体，要求按稳定顺序使用确定性 ID：

- `variant.baseline`
- `variant.wide-jaw`
- `variant.long-reach`
- `variant.stiff-finger`

通过显式调用 `SetMaterial` 为每个活动变体设置材质，并在每次分配后验证 `variant_materials` 映射。

## 第 1 周构建序列

1. 为 CAD 调用 `openagents.pane.open`。
2. 为 CAD 调用 `openagents.pane.focus`。
3. 调用 `openagents.cad.intent`，并传入严格的 `CreateParallelJawGripperSpec` `intent_json`。
4. 为 `GenerateVariants` 调用 `openagents.cad.intent`，并设置 `count=4`。
5. 依次切换活动变体，并为每个目标变体调用 `SetMaterial`。
6. 在单视图布局中捕获快照事实。
7. 将视口布局（`toggle_viewport_layout` 或 `toggle_layout`）切换为四视图。
8. 再次捕获快照事实，并确认所有变体均可见。
9. 返回与检查点字段对应的最终摘要，而不是基于假设的摘要。

## 快照事实约定

在断言布局/可见性之前，请验证：

- 对于第 1 周路径，`design_profile == "parallel_jaw_gripper"`。
- `viewport_layout` 为 `single` 或 `quad`。
- `visible_variant_ids` 与当前渲染布局一致。
- 在单视图中，`all_variants_visible` 为 `false`；在四视图中，其为 `true`。
- `variant_materials` 映射包含全部四个第 1 周变体 ID。

## 安全规则

- 不要虚构不受支持的 CAD 意图。
- 未读取 CAD 快照/检查点时，不要声称已完成。
- 除非 `all_variants_visible=true` 且 `visible_variant_ids` 包含全部四个 ID，否则不要声称“所有四个变体都已显示”。
- 不要使用非 `openagents.*` 工具对 CAD 窗格进行变更。