---
name: status
description: Show the Basic Memory plugin's current state for this project — active project, capture folders, output style, recent session checkpoints, and whether Basic Memory is reachable.
disable-model-invocation: true
---
# Basic Memory 状态

报告插件在当前项目中的状态，然后给出简明摘要。
这是一次快速诊断——收集事实并列出即可；不要过度调查。

## 收集信息

1. **CLI 是否可用？** 运行 `basic-memory --version`（如果失败，则尝试 `bm --version`）。如果
   两者均未找到，请报告 Basic Memory 未安装或不在 PATH 中，然后停止——
   没有它，其他任何功能都无法工作。

2. **配置。** 读取 `.claude/settings.json`（如果存在，也读取 `.claude/settings.local.json`）
   并报告：
   - 从 `basicMemory` 块中获取：`primaryProject`（如果未指定，则说明未固定项目——将使用
     默认项目）、`secondaryProjects`（团队/共享的只读来源）、`teamProjects`
     （供 `/basic-memory:share` 使用的共享目标）、`captureFolder`
     （默认为 `sessions`）、`rememberFolder`（默认为 `bm-remember`），以及
     `preCompactCapture` 模式（默认为 `extractive`）。
   - 从**根级**设置对象（而非 `basicMemory`）中获取：`outputStyle` 是否为
     `basic-memory`——即捕获反射功能是否已启用。

3. **最近的检查点。** 使用 `search_notes`，并设置
   `metadata_filters={"type": "session"}`、`page_size` 5；如果设置了 `primaryProject`，
   则将查询限定到该项目。按标题 + 永久链接列出最近的会话检查点。

4. **活跃任务。** 使用 `search_notes`，并设置
   `metadata_filters={"type": "task", "status": "active"}`——只报告数量。

将这些查询限定到 `primaryProject` 时，请将其作为 `project` 传入；如果它是
`external_id` UUID，则作为 `project_id` 传入（在 `project` 中传入裸 UUID 无法正确路由）。

## 展示

按以下格式列出（填入实际值；对于无法确定的内容，请填写“—”或简短说明，
不要因此导致整个报告失败）：

```
## Basic Memory status

- CLI:               basic-memory <version>
- Project:           <primaryProject, or "default project (not pinned)">
- Reads from (team): <secondaryProjects joined, or "none">
- Share targets:     <teamProjects keys joined, or "none">
- Capture folder:    <captureFolder>
- Remember folder:   <rememberFolder>
- Output style:      <enabled | not enabled>
- PreCompact:        <mode>
- Recent checkpoints: <n>
    - <title> — <permalink>
    ...
- Active tasks:      <n>
```

如果尚无检查点，请写明“尚无”，并提醒用户：检查点会在上下文压缩前自动写入
（且必须设置 `primaryProject` 才能写入检查点）。