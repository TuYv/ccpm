---
name: loki-mode
description: "Launch Loki Mode autonomous SDLC agent. Handles PRD-to-deployment with minimal human intervention. Invoke for multi-phase development tasks, bug fixing campaigns, or full product builds."
---
# Loki 模式 - OpenClaw 技能

## 何时使用
- 用户要求根据 PRD“构建”“实现”或“开发”某项功能
- 用户提供需求文档，并希望自主执行
- 用户说出“loki mode”或提及自主开发
- 用户希望在代码库上运行完整的 SDLC 周期

## 前置条件
- 主机上已安装 `loki` CLI（通过 `npm install -g loki-mode` 或 Homebrew）
- 已安装以下工具之一：Claude Code、Codex CLI 或 Gemini CLI
- 已设置相应的 API 密钥（ANTHROPIC_API_KEY、OPENAI_API_KEY 或 GOOGLE_API_KEY）

## 如何调用

### 启动会话
使用 bash 工具并启用后台模式：
```
bash(command: "loki start <prd-path> --bg --yes --no-dashboard", pty: true, background: true, workdir: "<project-dir>")
```

关键标志：
- `--bg`：后台模式（会话在工具调用结束后继续运行）
- `--yes`：跳过确认提示
- `--no-dashboard`：避免沙盒环境中的端口冲突
- `--provider <claude|codex|gemini>`：选择 AI 提供商（默认值：claude）
- `--budget <amount>`：设置以美元计的成本上限（超出后自动暂停）

### 监控进度
每 30 秒轮询一次状态：
```
bash(command: "loki status --json", workdir: "<project-dir>")
```

JSON 输出包含：
- `version`：Loki Mode 版本字符串
- `status`：inactive、running、paused、stopped、completed、unknown
- `phase`：当前 SDLC 阶段（例如 BOOTSTRAP、DISCOVERY、ARCHITECTURE、DEVELOPMENT、QA、DEPLOYMENT）
- `iteration`：当前迭代编号
- `provider`：当前使用的 AI 提供商（claude、codex、gemini）
- `pid`：正在运行的会话的进程 ID（未运行时为 null）
- `elapsed_time`：会话启动后经过的秒数
- `dashboard_url`：Web 仪表板的 URL（禁用时为 null）
- `task_counts`：包含 `total`、`completed`、`failed`、`pending` 计数的对象

如需跟踪预算（JSON 输出中不包含），请直接读取预算文件：
```
bash(command: "cat .loki/metrics/budget.json 2>/dev/null || echo '{}'", workdir: "<project-dir>")
```
预算 JSON 字段：`budget_limit`、`budget_used`

### 向频道报告进度
每次轮询后，汇总变更：
- 阶段转换（“已从 ARCHITECTURE 转至 DEVELOPMENT”）
- 任务完成数量（“20 个任务中已完成 12 个，0 个失败”）
- 已用时间（“已运行 45 分钟”）
- 需要注意的错误状态（失败任务数 > 0，或状态为 unknown）

如果启用了预算跟踪，请在更新中包含成本：
- “预估成本：$4.50 / $50.00 预算”

### 控制命令
- 暂停：`bash(command: "loki pause", workdir: "<project-dir>")`
- 恢复：`bash(command: "loki resume", workdir: "<project-dir>")`
- 停止：`bash(command: "loki stop", workdir: "<project-dir>")`
- 状态：`bash(command: "loki status", workdir: "<project-dir>")`
- 日志：`bash(command: "loki logs --tail 50", workdir: "<project-dir>")`

### 会话完成
当状态变为“stopped”或“completed”时：
1. 运行 `loki status --json` 获取最终摘要
2. 运行 `git log --oneline -20` 显示已创建的提交
3. 报告最终任务计数、已用时间和持续时间
4. 如果存在委员会裁决，请将其包含在内：`cat .loki/council/report.md`

## 关键规则
- **始终**使用 `--bg` 标志（会话必须在工具调用结束后继续运行）
- **始终**使用 `--yes` 标志（非交互式通道中不能出现确认提示）
- **绝不要**在 OpenClaw 工作区目录本身中运行 loki
- 轮询状态，而不是监视 stdout（后台模式会分离进程）
- 如果会话崩溃，请先检查 `loki logs`，再重新启动
- 遵守预算限制——启用跟踪时，每次进度更新都必须包含成本
- 建议使用 `--no-dashboard` 标志，以避免沙盒环境中的端口冲突