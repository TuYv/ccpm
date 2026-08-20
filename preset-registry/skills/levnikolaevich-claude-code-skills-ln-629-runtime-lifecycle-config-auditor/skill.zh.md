---
name: ln-629-runtime-lifecycle-config-auditor
description: "Checks runtime lifecycle and config validation: bootstrap, shutdown, probes, cleanup, env sync, and fail-fast startup. Use for runtime readiness."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__trace_paths, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
model: claude-sonnet-4-6
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 运行时生命周期与配置审计器（L3 工作器）

**类型：** L3 工作器

专门用于审计运行时就绪状态、生命周期和启动配置验证的工作器。

## 目的与范围

- 审计**运行时生命周期和配置验证**（类别 12：中优先级）
- 检查引导启动、关闭、信号处理、探针、资源清理、环境变量/配置同步以及快速失败式启动验证
- 输出 `FIX_BOOTSTRAP`、`ADD_CONFIG_VALIDATION` 或 `FIX_SHUTDOWN`
- 计算合规评分（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含技术栈、部署类型、代码库根目录和 output_dir 的 `contextStore`。

当生命周期追踪能够显著提高置信度时，优先使用 `hex-graph`。在可用的情况下，优先使用 `hex-line` 读取本地代码。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明采用了回退方案。

## 工作流程

检测策略：使用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) 解析上下文 + output_dir
2) 检查生命周期和配置验证模式（第 1 层：grep 搜索 SIGTERM、关闭处理程序、探针、环境变量读取和设置验证）
3) 分析每个候选项的上下文（第 2 层）：
   - 引导启动顺序：读取主文件 -- 追踪实际初始化顺序，验证依赖项是否在使用前已就绪
   - 优雅关闭：读取信号处理程序 -- 它们是否确实关闭了所有资源？还是只记录日志并退出？
   - 资源清理：读取关闭处理程序 -- 是否关闭了所有已打开的资源（数据库、Redis、队列）？
   - 探针：检查部署配置（Dockerfile、k8s 清单）-- 是否采用容器化部署？
   - 配置验证：是否在开始处理流量之前，于启动时验证必需的环境变量/配置值？
4) 收集已确认的问题
5) 计算评分
6) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，通过单次 Write 调用将其写入 `{output_dir}/ln-629--global.md`
7) **返回摘要：** 返回最简摘要

## 审计规则

### 1. 引导启动初始化顺序
**检测：**
- 检查主文件/index 文件中的初始化顺序
- 验证依赖项是否在使用前加载（先加载数据库，再加载路由）

**严重程度：**
- **高：** 顺序不正确会导致启动失败

**建议：** 按照正确顺序初始化：配置 -> 数据库 -> 路由 -> 服务器

**工作量：** M（重构启动流程）

### 2. 优雅关闭
**检测：**
- Grep 搜索 `SIGTERM`、`SIGINT` 处理程序
- 检查 `process.on('SIGTERM')`（Node.js）
- 检查 `signal.Notify`（Go）

**严重程度：**
- **HIGH：** 无关闭处理程序（突然终止）

**建议：** 添加 SIGTERM 处理程序，优雅地关闭连接

**工作量：** M（添加关闭逻辑）

### 3. 退出时清理资源
**检测：**
- 检查关闭时是否已关闭 DB 连接
- 验证文件句柄是否已释放
- 检查工作线程是否已停止

**严重程度：**
- **MEDIUM：** 关闭时发生资源泄漏

**建议：** 在关闭处理程序中关闭所有资源

**工作量：** S-M（添加清理调用）

### 4. 信号处理
**检测：**
- 检查是否有 SIGTERM、SIGINT、SIGHUP 的处理程序
- 验证信号是否正确传播到子进程

**严重程度：**
- **MEDIUM：** 缺少信号处理程序

**建议：** 处理所有标准信号

**工作量：** S（添加信号处理程序）

### 5. 存活/就绪探针
**检测（适用于容器化应用）：**
- 检查是否存在 `/live`、`/ready` 端点
- 验证 Kubernetes 探针配置

**严重程度：**
- **MEDIUM：** 无探针（Kubernetes 无法检测健康状态）

**建议：** 添加 `/live`（是否正在运行）和 `/ready`（是否已准备好接收流量）

**工作量：** S（添加端点）

### 6. 启动配置验证
**检测：**
- 查找启动路径中的 env/config 读取操作
- 检查是否使用验证框架或显式的快速失败检查
- 如果存在已记录的启动配置，将代码所需的运行时变量与其进行比较

**严重程度：**
- **HIGH：** 必需配置可能缺失，但应用仍能启动
- **MEDIUM：** 默认值/不同步可能导致本地、CI 和部署环境的启动行为不同

**建议：** 在启动时验证必需配置，并在接受流量之前失败退出

**工作量：** M

## 评分算法

**强制阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**强制阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程按照共享契约生成自己的运行范围制品路径。

将报告写入 `{output_dir}/ln-629--global.md`，其中 `category: "Runtime Lifecycle & Config"`，并包含以下检查项：bootstrap_order、graceful_shutdown、resource_cleanup、signal_handling、probes、startup_config_validation。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-629--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 参考文件

- **审计输出模式：** `references/audit_output_schema.md`

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告问题，生命周期变更可能导致停机
- **部署感知：** 根据部署类型调整探针检查（Kubernetes = 必需探针，裸机 = 可选）
- **工作量须切合实际：** S = <1h，M = 1-4h，L = >4h
- **排除项：** 跳过 CLI 工具和脚本（没有长时间运行的生命周期），跳过无服务器函数（生命周期由平台管理）
- **初始化顺序很重要：** 无论上下文如何，凡是在 DB 初始化前使用 DB，均标记为 HIGH
- **独特视角：** 仅审计运行时就绪状态和启动配置验证。不要审计配置架构边界、软件包健康状况或诊断遥测。
- **所需操作：** 每个发现都使用 `FIX_BOOTSTRAP`、`ADD_CONFIG_VALIDATION` 或 `FIX_SHUTDOWN`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已解析 contextStore（部署类型、output_dir）
- [ ] 已完成全部 6 项检查（引导顺序、优雅关闭、资源清理、信号处理、探针、启动配置验证）
- [ ] 已收集发现项，包括严重程度、位置、工作量、操作和建议
- [ ] 已根据 `references/audit_scoring.md` 计算评分
- [ ] 报告已写入 `{output_dir}/ln-629--global.md`（以单次原子 Write 调用完成）
- [ ] 已根据契约编写摘要

---
**版本：** 3.0.0
**最后更新：** 2025-12-23