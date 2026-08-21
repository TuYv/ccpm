---
name: spark-consumption-cli
description: >
  Interactive ad-hoc Spark analysis through Fabric Lakehouse Livy API sessions ONLY.
  This skill NEVER authors or runs a notebook: any notebook cell (%%sql/%%configure) or a
  notebook-run-by-name (and reporting its run status) is `spark-authoring-cli`, not this skill.
  Scope: create a Livy session, execute PySpark, inspect output, and compute quick
  calculations over lakehouse data (DataFrames, cross-lakehouse joins, Delta time-travel, unstructured/JSON).
  For Spark failure triage use `spark-operations-cli`; for plain T-SQL Lakehouse/Warehouse queries use `sqldw-consumption-cli`.
  Triggers: "create Livy session", "run Livy calculation", "Livy session calculation", "interactive Livy session",
  "PySpark", "analyze with PySpark", "Spark DataFrame",
  "lakehouse with Python", "PySpark data quality", "Delta time-travel with Spark",
  "join tables across Lakehouses".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: spark-consumption-cli`（`az rest`：`--headers "x-ms-fabric-skill=spark-consumption-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项，但仍须添加。

> **更新检查 — 每个会话一次（强制要求）**
> 每个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话之前已执行过该检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选

# 数据工程使用 — CLI 技能

## 目录

| 任务 | 参考资料 | 说明 |
|---|---|---|
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) ||
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) ||
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) ||
| 分页 | [COMMON-CORE.md § 分页](../../common/COMMON-CORE.md#pagination) ||
| 长时间运行的操作 (LRO) | [COMMON-CORE.md § 长时间运行的操作 (LRO)](../../common/COMMON-CORE.md#long-running-operations-lro) ||
| 速率限制与节流 | [COMMON-CORE.md § 速率限制与节流](../../common/COMMON-CORE.md#rate-limiting--throttling) ||
| OneLake 数据访问 | [COMMON-CORE.md § OneLake 数据访问](../../common/COMMON-CORE.md#onelake-data-access) | 需要 `storage.azure.com` 令牌，而非 Fabric 令牌 |
| 作业执行 | [COMMON-CORE.md § 作业执行](../../common/COMMON-CORE.md#job-execution) ||
| 容量管理 | [COMMON-CORE.md § 容量管理](../../common/COMMON-CORE.md#capacity-management) ||
| 注意事项与故障排除 | [COMMON-CORE.md § 注意事项与故障排除](../../common/COMMON-CORE.md#gotchas--troubleshooting) ||
| 最佳实践 | [COMMON-CORE.md § 最佳实践](../../common/COMMON-CORE.md#best-practices) ||
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) ||
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** — *请先阅读链接* [根据工作区名称查找工作区 ID，或根据项名称、项类型和工作区 ID 查找项 ID 时需要] |
| 身份验证方法 | [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource https://api.fabric.microsoft.com`**，否则 `az rest` 会失败 |
| 分页模式 | [COMMON-CLI.md § 分页模式](../../common/COMMON-CLI.md#pagination-pattern) ||
| 长时间运行的操作 (LRO) 模式 | [COMMON-CLI.md § 长时间运行的操作 (LRO) 模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) ||
| 通过 `curl` 访问 OneLake 数据 | [COMMON-CLI.md § 通过 curl 访问 OneLake 数据](../../common/COMMON-CLI.md#onelake-data-access-via-curl) | 使用 `curl`，不要使用 `az rest`（令牌受众不同） |
| SQL / TDS 数据平面访问 | [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access) | `sqlcmd` (Go) 连接、查询、CSV 导出 |
| 作业执行 (CLI) | [COMMON-CLI.md § 作业执行 (CLI)](../../common/COMMON-CLI.md#job-execution) ||
| OneLake 快捷方式 | [COMMON-CLI.md § OneLake 快捷方式](../../common/COMMON-CLI.md#onelake-shortcuts) ||
| 容量管理 (CLI) | [COMMON-CLI.md § 容量管理 (CLI)](../../common/COMMON-CLI.md#capacity-management) ||
| 组合方法 | [COMMON-CLI.md § 组合方法](../../common/COMMON-CLI.md#composite-recipes) ||
| 注意事项与故障排除（CLI 特定） | [COMMON-CLI.md § 注意事项与故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |
| 快速参考：`az rest` 模板 | [COMMON-CLI.md § 快速参考：az rest 模板](../../common/COMMON-CLI.md#quick-reference-az-rest-template) ||
| 快速参考：令牌受众 / CLI 工具矩阵 | [COMMON-CLI.md § 快速参考：令牌受众 ↔ CLI 工具矩阵](../../common/COMMON-CLI.md#quick-reference-token-audience--cli-tool-matrix) | 各服务应使用的 `--resource` 和工具 |
| 与 SPARK-AUTHORING-CORE.md 的关系 | [SPARK-CONSUMPTION-CORE.md § 与 SPARK-AUTHORING-CORE.md 的关系](../../common/SPARK-CONSUMPTION-CORE.md#relationship-to-spark-authoring-coremd) ||
| 数据工程使用能力矩阵 | [SPARK-CONSUMPTION-CORE.md § 数据工程使用能力矩阵](../../common/SPARK-CONSUMPTION-CORE.md#data-engineering-consumption-capability-matrix) ||
| OneLake 表 API（已启用架构的 Lakehouse） | [SPARK-CONSUMPTION-CORE.md § OneLake 表 API（已启用架构的 Lakehouse）](../../common/SPARK-CONSUMPTION-CORE.md#onelake-table-apis-schema-enabled-lakehouses) | 与 Unity Catalog 兼容的元数据；需要 `storage.azure.com` 令牌 |
| Lakehouse Livy 会话管理 | [SPARK-CONSUMPTION-CORE.md § Livy 会话管理](../../common/SPARK-CONSUMPTION-CORE.md#livy-session-management) | Lakehouse Livy API：会话创建、状态、生命周期、终止 |
| 交互式数据探索 | [SPARK-CONSUMPTION-CORE.md § 交互式数据探索](../../common/SPARK-CONSUMPTION-CORE.md#interactive-data-exploration) | 语句执行、输出检索、数据发现 |
| PySpark 分析模式 | [SPARK-CONSUMPTION-CORE.md § PySpark 分析模式](../../common/SPARK-CONSUMPTION-CORE.md#pyspark-analytics-patterns) | 跨 Lakehouse 三部分命名、性能优化 |
| 必须/推荐/避免 | [SKILL.md § 必须/推荐/避免](#mustpreferavoid) | **必须执行 / 避免 / 推荐** 检查清单 |
| 快速入门 | [SKILL.md § 快速入门](#quick-start) | CLI 特定的 Lakehouse Livy 会话设置和数据探索 |
| 关键 Fabric 模式 | [SKILL.md § 关键 Fabric 模式](#key-fabric-patterns) | Spark 模式快速参考表 |
| 会话清理 | [SKILL.md § 会话清理](#session-cleanup) | 通过 CLI 清理空闲的 Lakehouse Livy 会话 |

---

## 必须/建议/避免

### 必须执行

- 创建新会话前，检查是否存在空闲会话
- 使用动态工作区/Lakehouse 发现
- 遵循 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的 API 模式

### 建议

- **对简单的 Lakehouse 查询使用 sqldw-consumption-cli** — 对 Lakehouse Delta 表执行行数统计、SELECT、架构探索、筛选和聚合时，应通过 `sqlcmd` 使用 SQL Endpoint，而不是 Spark。仅当用户明确要求使用 PySpark、DataFrames 或 Spark 特有功能时，才使用此技能。
- 对 Delta 表使用 SQL Endpoint
- 对非结构化/JSON 数据或复杂 Python 分析使用 Livy
- 优先复用会话，而不是创建会话

### 避免

- 对工作区 ID 进行硬编码
- 创建不必要的会话
- 在没有 LIMIT 的情况下返回大型结果集
- **混淆 Lakehouse Livy 会话与 Notebook Spark 会话** — 此技能涵盖 **Lakehouse Livy 会话**（位于 `/lakehouses/{lhId}/livyapi/.../sessions` 的公共 Livy API）。通过 Jobs API（`RunNotebook`）运行 Notebook 时，会在内部创建 Notebook Spark 会话，且这些会话不通过 Livy API 进行管理。若要将 Notebook 作为作业运行，请参阅 SPARK-AUTHORING-CORE.md § Notebook 执行与作业管理
- **编写或生成 Notebook 单元格** — 要求提供 `%%sql`、`%%configure`、PySpark Notebook 单元格代码、Notebook 部署或 Notebook 执行的提示词属于 `spark-authoring-cli`，即使该单元格用于查询数据也是如此。

---

## 快速入门

### 环境设置

应用 COMMON-CORE.md 环境检测模式中的环境检测，以设置：
- `$FABRIC_API_BASE` 和 `$FABRIC_RESOURCE_SCOPE`
- 用于 Livy 操作的 `$FABRIC_API_URL` 和 `$LIVY_API_PATH`

**身份验证**：使用 [COMMON-CLI.md](../../common/COMMON-CLI.md) 环境检测和 API 配置中的令牌获取方式

### 工作区和项目发现

**首选方式**：使用 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的项目发现模式（在 Fabric 中查找内容），按名称查找工作区和项目。

**备用方式**（当工作区已知时）：
```bash
# List workspaces
az rest --method get --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces" --query "value[].{name:displayName, id:id}" --output table
read -p "Workspace ID: " workspaceId

# List lakehouses in workspace
az rest --method get --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces/$workspaceId/items?type=Lakehouse" --query "value[].{name:displayName, id:id}" --output table  
read -p "Lakehouse ID: " lakehouseId
```

### Lakehouse Livy 会话管理

> **Fabric 中的两类 Spark 会话** — 此技能管理 **Lakehouse Livy 会话**，这些会话通过公共 Livy API 端点（`/lakehouses/{lhId}/livyapi/.../sessions`）创建。它们是供远程客户端使用的临时交互式会话。**Notebook Spark 会话**采用独立的机制 — 执行 Fabric Notebook 时（通过门户或 Jobs API `RunNotebook`），系统会在内部创建这些会话；它们通过 Notebook 生命周期进行管理，而不是通过 Livy API 进行管理。

```bash
# Check for existing idle Lakehouse Livy session (avoid resource waste)
sessionId=$(az rest --method get --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces/$workspaceId/lakehouses/$lakehouseId/$LIVY_API_PATH/sessions" --query "sessions[?state=='idle'][0].id" --output tsv)

# Create if none available - FORCE STARTER POOL USAGE
if [[ -z "$sessionId" ]]; then
    cat > /tmp/body.json << 'EOF'
{
    "name":"analysis",
    "driverMemory":"56g",
    "driverCores":8,
    "executorMemory":"56g",
    "executorCores":8,
    "conf": {
        "spark.dynamicAllocation.enabled": "true",
        "spark.fabric.pool.name": "Starter Pool"
    }
}
EOF
    sessionId=$(az rest --method post --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces/$workspaceId/lakehouses/$lakehouseId/$LIVY_API_PATH/sessions" --body @/tmp/body.json --query "id" --output tsv)
    
    echo "⏳ Waiting for starter pool session to be ready..." 
    # With starter pools, this should be 3-5 seconds
    timeout=30  # Reduced from 90s since starter pools are fast
    while [ $timeout -gt 0 ]; do
        state=$(az rest --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces/$workspaceId/lakehouses/$lakehouseId/$LIVY_API_PATH/sessions/$sessionId" --query "state" --output tsv)
        if [[ "$state" == "idle" ]]; then
            echo "✅ Session ready in starter pool!"
            break
        fi
        echo "   Session state: $state (${timeout}s remaining)"
        sleep 3
        timeout=$((timeout - 3))
    done
fi
```

### 数据探索（Fabric 特定模式）
```bash
# Execute statement (LLM knows Python/Spark syntax)
cat > /tmp/body.json << 'EOF'
{
  "code": "spark.sql(\"SHOW TABLES\").show(); df = spark.table(\"your_table\"); df.describe().show()",
  "kind": "pyspark"
}
EOF
az rest --method post --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces/$workspaceId/lakehouses/$lakehouseId/$LIVY_API_PATH/sessions/$sessionId/statements" --body @/tmp/body.json
```

## Fabric 关键模式

| 模式 | 代码 | 使用场景 |
|---|---|---|
| **表发现** | `spark.sql("SHOW TABLES")` | 列出可用的表 |
| **跨 Lakehouse** | `spark.sql("SELECT * FROM other_workspace.table")` | 跨工作区查询 |
| **Delta 功能** | `df.history()`, `df.readVersion(1)` | 时间旅行、版本控制 |
| **架构演进** | `df.printSchema()` | 了解结构 |

## Lakehouse Livy 会话清理
```bash
# Clean up idle Lakehouse Livy sessions (optional)
az rest --method get --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces/$workspaceId/lakehouses/$lakehouseId/$LIVY_API_PATH/sessions" --query "sessions[?state=='idle'].id" --output tsv | xargs -I {} az rest --method delete --resource "$FABRIC_RESOURCE_SCOPE" --url "$FABRIC_API_URL/workspaces/$workspaceId/lakehouses/$lakehouseId/$LIVY_API_PATH/sessions/{}"
```

---

**重点**：此技能提供 Fabric 特定的 REST API 模式。LLM 已掌握 Python/Spark 语法——我们重点关注 Fabric 集成、会话管理和 API 端点。