---
name: stata-audit
description: Inspect, validate, summarize, and render local Stata-MCP audit evidence under .statamcp. Use when a user asks what tools ran, whether a security guard blocked anything, how one run links across JSONL files, whether snapshots are intact, or wants an interactive audit dashboard.
metadata:
  version: "0.1.0"
---
# Stata-MCP Audit

读取 Stata-MCP 证据，而不更改源 JSONL 账本或快照对象。将每个脚本和模板都相对于本技能目录进行解析，同时将默认证据根目录从用户当前工作目录解析为 `<cwd>/.statamcp`。

## 选择作用范围最窄的脚本

| 用户需求 | 脚本 | 结果 |
| --- | --- | --- |
| 检查安全拦截或警告 | `scripts/security_audit.py` | 安全决策、执行是否被阻止、风险类型以及关联状态 |
| 汇总项目使用情况 | `scripts/analyze_audit.py` | 中立的计数、观测时段、工具构成、结果、快照以及局限性 |
| 查看近期记录或某一次运行 | `scripts/inspect_audit.py` | 按精确 `run_id` 连接、保留源数据原样的记录 |
| 检查证据完整性 | `scripts/validate_audit.py` | 生命周期、时间戳、安全链接以及完整 SHA-256 快照校验 |
| 打开交互式视图 | `scripts/render_audit_html.py` | 带互链账本和可移动时间窗口的独立英文 HTML 仪表盘 |

将用户的项目目录用作命令的工作目录。示例：

```bash
python /absolute/path/to/stata-audit/scripts/validate_audit.py .statamcp
```

所有脚本都接受一个可选的 artifact-root 参数，默认值为 `./.statamcp`。文本输出适合快速审阅；当结构化的下游分析有用时，可添加 `--json`。

## 审查规则

- 使用精确的 `run_id` 连接生命周期记录，而不是文件名或时间上的接近。
- 将 `event == "blocked"` 且 `executed == false` 的情况视为一次被阻止的调用。正常的被阻止调用属于安全证据，而不是脚本故障。
- 沿着 `security_event_ids` 追溯到 `audit/security.jsonl`，并报告缺失或不一致的链接。
- 对照完整记录的 SHA-256 校验快照字节。前八个字符仅用于显示。
- 将缺失的终止事件视为调查线索，而不是工具已执行或已失败的证明。
- 将客户端名称和版本视为自行上报的元数据，而不是经过验证的用户或代理身份。
- 除非用户明确需要，否则保持完整路径处于掩码状态。报告脚本在该场景下支持 `--show-paths`。
- 绝不就地编辑、排序、截断、轮转、重放或修复证据。

## 脚本用法

安全审查：

```bash
python scripts/security_audit.py .statamcp
python scripts/security_audit.py .statamcp --json
```

项目使用分析：

```bash
python scripts/analyze_audit.py .statamcp
```

查看最新记录或重建某一次精确运行：

```bash
python scripts/inspect_audit.py .statamcp --limit 20
python scripts/inspect_audit.py .statamcp --run-id <exact-run-id> --json
```

校验证据：

```bash
python scripts/validate_audit.py .statamcp
```

退出码 `0` 表示未发现完整性错误。退出码 `1` 表示证据缺失、格式损坏、不一致，或未通过快照哈希校验。警告仍然可见，但仅凭警告不会导致校验失败。

渲染综合仪表盘或单个工具视图：

```bash
python scripts/render_audit_html.py .statamcp
python scripts/render_audit_html.py .statamcp --tool stata_do
```

默认输出目录为：

```text
<cwd>/.statamcp/reports/html/
```

综合报告使用 `YYYYMMDD-HHMM-audit.html`。筛选后的报告使用工具名称，例如 `YYYYMMDD-HHMM-stata_do.html`。渲染器会从其自身 Python 文件所在位置定位 `assets/audit_dashboard.html`，因此无论用户当前处于哪个目录，它都能正常工作。

仪表盘的全局起点和终点取自所选证据中的最小和最大时间戳。它的两个 `Time position` 手柄从这些确切边界开始，并控制可见图表的起点和终点。普通文本使用 Times New Roman；工具名称、运行 ID、账本、哈希和路径使用等宽代码字体。时间显示为 `YYYY-MM-DD HH-MM`，并附带查看者的本地时区名称和 UTC 偏移量。

渲染完成后，报告所生成文件的确切路径，并询问用户是否希望打开它。仅在用户同意后才打开。使用平台常规的本地文件打开命令（macOS 上为 `open`，Linux 上为 `xdg-open`，Windows 上为 `start`）。

## 报告边界

将结论表述为基于已记录工具调用的测量结果。不要声称该审计捕获了未记录的思考、手动的 Stata 操作、作者身份或连续的代理会话。如果证据存在解析错误、不支持的 schema 版本、未匹配的生命周期事件、缺失的安全链接或哈希校验失败，请在总结行为之前先指出这些局限性。
