---
name: case-review
description: Reviews a reverse-skill case package for scope readiness, Evidence to Finding to Path traceability, work item coverage, timeline references, and optional artifact hash integrity before report handoff.
---
# 证据图审查

当逆向工程、取证、CTF 或经授权的安全案例需要可辩护的交接时，使用本技能。它会审计现有的 `work/<case>/` 包，不更改案例，也不接触目标。

## 范围

本技能涵盖：

- 范围元数据与目标活动就绪情况
- Evidence 记录结构与可复现性字段
- 工作项和时间线条目对 Evidence 的引用
- 报告 Markdown 中结构化的 Finding 与 Path
- 针对案例本地工件的可选 SHA-256 校验
- 用于报告交接的 Markdown 或 JSON 审查结果

它不得执行侦察、漏洞利用、动态插桩或目标更改。这些操作属于被路由的分析技能，并且需要通过案例范围门控。

## 必须采取的行动

1. `NOW`：阅读 `../field-journal/precedent-reverse.md`，并确认本次操作是对既有已授权案例包的审查。
2. `NOW`：确认案例路径，并选择只读审查模式。
3. `NEXT`：阅读 `../tool-index.md`；本技能仅使用 Python 3 标准库，不需要 bootstrap。
4. `NEXT`：运行 `python3 scripts/review_case.py <case-root> --format markdown`。
5. `ACT`：解决每一个错误，然后在声称交接完成之前重新运行审查。

## 工具依赖

| 工具 | 是否必需 | 用途 | 自动 bootstrap |
|------|----------|---------|---------------|
| Python 3.9+ | 是 | 运行只读的案例审查脚本 | 否，使用平台自带的 Python 安装 |

不需要网络访问，也不需要第三方包。

## 工作流程

### 阶段 1：受理

对现有的案例目录运行审查：

```bash
python3 skills/case-review/scripts/review_case.py work/<case> --format markdown
```

确认 `scope.md`、`timeline.md`、`workitems.md` 和 `evidence/` 均已存在。非 strict 审查会报告范围警告，而 strict 审查会将警告视为交接阻塞项。

## 建议下一步（选一个编号）

1. 修复 scope.md 中的授权、范围或 network_profile 字段
2. 继续检查 Evidence 记录的可复现命令和来源
3. 导出当前 review 结果并附到阶段性报告
4. 换 JSON 输出接入 CI 或其他审查工具
5. 暂停，先确认审查范围

### 阶段 2：可追溯性

审查针对以下各项的检查：

- 不存在的 Evidence ID
- 缺少 `evidence_ids` 的 Finding
- 缺少合法 `path_type` 或 Evidence 引用的 Path
- 指向未知 Evidence 的工作项和时间线条目
- 未被链接的 Evidence 记录
- 置信度低的已验证 Finding

离线观察仅在其 `notes` 字段明确记录了离线限制时，才可以使用 `repro_command: n/a`。

当其他工具需要稳定字段时，使用 JSON：

```bash
python3 skills/case-review/scripts/review_case.py work/<case> --format json
```

## 建议下一步（选一个编号）

1. 补写缺失的 Evidence，并保留原始命令
2. 将候选 Finding 绑定到 Evidence 后重新审查
3. 为调用链或攻击链补充 P-id 和 Path 步骤
4. 生成 Markdown handoff summary
5. 换回 PRIMARY skill 继续分析

### 阶段 3：固定性校验

当 Evidence 记录同时包含 `content_hash` 和 `artifact_path` 时，校验案例本地的工件：

```bash
python3 skills/case-review/scripts/review_case.py work/<case> --verify-hashes --strict
```

脚本接受 `sha256:<64 hex characters>` 格式，并检查工件是否仍位于案例根目录之内。哈希不匹配属于硬性失败。

PowerShell 的 Evidence 辅助脚本可以在追加记录的同时记录哈希：

```powershell
powershell -File skills/scripts/append-evidence.ps1 -CaseRoot work\<case> -Id E-001 -Title "Sample hash" -ReproCommand "sha256sum evidence/sample.bin" -ArtifactPath "evidence\sample.bin"
```

## 建议下一步（选一个编号）

1. 修复 hash mismatch 或替换已污染的工作副本
2. 为未固定的原始文件补充 SHA-256 和 artifact_path
3. 继续进入报告生成阶段
4. 导出 JSON 结果供 CI 保存
5. 暂停并请求人工复核

### 阶段 4：交接

在最终报告或专家交接之前使用 strict 模式：

```bash
python3 skills/case-review/scripts/review_case.py work/<case> --strict --format markdown > work/<case>/report/case-review.md
```

除非显式使用 shell 重定向来保存其输出，该命令对案例是只读的。本审查不构成法律建议，也不能替代组织内部的证据处理流程。

## 建议下一步（选一个编号）

1. 将通过的 review 结果交给 `docs-generator/` 生成正式报告
2. 回到 PRIMARY skill 补齐新的分析证据
3. 归档 Markdown 和 JSON review 结果
4. 暂停并请求人工复核

## 语言行为约定

- 内部推理、工具选择与阶段控制：英文。
- 用户可见的消息、章节标签、报告与下一步菜单：中文，除非用户要求其他语言。
- 默认的双语标签中文在前、英文在后，以 `/` 分隔
