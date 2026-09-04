---
name: workflows-as-code
description: "Export all HubSpot workflows to versioned JSON files via the v4 Automation API, diff exports over time, and restore or recreate workflows from JSON. Treats workflow definitions like code: backed up, reviewable, and recoverable."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: automation-workflows
---
# 工作流即代码

将门户中的每个工作流导出为 JSON 文件，将导出内容纳入版本控制，并在出现问题时从 JSON 恢复工作流。HubSpot 没有工作流回收站——除非你保留了工作流的定义，否则被删除或损坏的工作流就彻底丢失了。这项技能为你提供了这样的安全网，还能让你通过可审查的 diff 查看两次导出之间的变更。

## 为什么这很重要

工作流是生产环境的自动化，但大多数门户把它们当作一次性的 UI 配置来对待：没有备份，没有变更历史，没有审查。在工作流编辑器中的一次误点击，可能会在数周内悄无声息地破坏线索路由或抑制逻辑。v4 Automation API 支持对工作流定义进行完整的读取和创建，这使得类似代码的生命周期成为可能：导出 → 版本化 → diff → 恢复。

## 前置条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），需具备 `automation` 权限范围（如果任何流程涉及敏感属性，还需敏感数据权限范围）
- Python 3.10+，并安装 [`uv`](https://github.com/astral-sh/uv)
- 一个用于存放导出文件的位置——git 仓库是理想之选（这里默认将 `data/workflow-exports/` 加入 gitignore，因为导出内容可能引用内部名称；如需保留历史，请将它们移至私有仓库）

## 脚本

| 阶段 | 脚本 | 运行方式 |
|-------|--------|----------|
| 导出 | [`scripts/export.py`](./scripts/export.py) | `uv run skills/workflows-as-code/scripts/export.py` |
| 恢复 | [`scripts/restore.py`](./scripts/restore.py) | `uv run skills/workflows-as-code/scripts/restore.py <export-file.json>` |

`export.py` 通过 `GET /automation/v4/flows` 列出所有流程，通过批量读取端点（`POST /automation/v4/flows/batch/read`，失败时回退为逐个流程的 GET 请求）获取每个流程的完整定义，然后为每个工作流写入一个 JSON 文件，外加一个清单文件。`restore.py` 通过 `POST /automation/v4/flows` 从导出文件重新创建工作流——**始终为禁用状态**，名称带 "(restored)" 后缀，以便在启用前进行审查。

## 执行模式

### 阶段 1：规划

1. 确定导出节奏：在任何工作流清理之前（强制要求——参见 `/cleanup-workflows`）、构建新工作流之后，以及按日程定期进行（每月一次与 `/quarterly-database-cleanup` 搭配得很好）。
2. 确定导出文件的长期存放位置（建议使用私有 git 仓库）。

### 阶段 2：事前

无需准备任何内容——导出是只读操作。记下 Automation > Workflows 中当前的工作流数量，以便后续比对。

### 阶段 3：执行——导出

```bash
uv run skills/workflows-as-code/scripts/export.py
```

输出目录结构：

```
data/workflow-exports/<YYYY-MM-DD>/
├── manifest.csv              # flowId, name, type, isEnabled, revisionId, file
├── flow-<flowId>.json        # one full definition per workflow
└── ...
```

对比两次导出的差异：

```bash
diff -u data/workflow-exports/2026-06-01/flow-12345.json \
        data/workflow-exports/2026-07-01/flow-12345.json
```

（时间戳和修订 ID 会有所不同；有意义的变化会体现在 `actions` 和 `enrollmentCriteria` 中。）

### 阶段 3（备选）：执行——恢复

要从导出文件重建已删除或损坏的工作流：

```bash
uv run skills/workflows-as-code/scripts/restore.py data/workflow-exports/2026-06-01/flow-12345.json
```

该脚本会剥离服务器分配的字段（`id`、`revisionId`、时间戳），将流程重命名并加上 "(restored)" 后缀以避免名称冲突，并以**禁用**状态创建它。在 UI 中审查该工作流，对照原始版本核验注册条件和操作，然后重命名并启用。

### 阶段 4：事后

1. 导出：验证清单文件的行数与门户的工作流数量一致，并抽查打开一个 JSON 文件。
2. 恢复：在 Automation > Workflows 中打开恢复的工作流，与导出文件进行比对，然后启用。

## 回滚

- 导出是只读操作——无需回滚。
- 不想要的已恢复工作流：它是以禁用状态创建的；直接删除即可。

## 技术陷阱

1. **原地更新需要当前的 `revisionId`。** `PUT /automation/v4/{flowId}` 必须包含该流程最新的 `revisionId` 和 `type`——过期的修订会被拒绝。恢复脚本通过创建新流程而非更新来绕过这一问题。
2. **某些操作无法完美往返。** 字段结构未记录在档的操作（例如 copy-from-associated-object、通知收件人）可以正常导出，但在另一个门户中重新创建时可能被拒绝。恢复脚本会逐操作报告错误；被拒绝的操作请在 UI 中手动添加。
3. **v3 的 workflow ID 并不是 v4 的 flow ID。** 如果你有基于 `/automation/v3/workflows` 构建的旧工具，v4 API 提供了用于迁移的 workflowId → flowId 映射端点。新工具应仅使用 v4——v3 已是遗留版本。
4. **敏感数据权限范围。** 读取或设置敏感属性的流程要求你的私有应用具备相应的敏感数据权限范围，否则读取会失败。
5. **导出内容可能包含内部数据。** 工作流名称、属性名称、列表 ID 和通知文本都会包含在 JSON 中。请像对待配置机密一样对待导出文件——将它们保存在私有仓库中。
