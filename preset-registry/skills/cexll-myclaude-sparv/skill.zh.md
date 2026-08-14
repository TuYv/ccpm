---
name: sparv
description: Minimal SPARV workflow (Specify→Plan→Act→Review→Vault) with 10-point spec gate, unified journal, 2-action saves, 3-failure protocol, and EHRB risk detection.
---
# SPARV

五阶段工作流：**S**明确 → **P**规划 → **A**执行 → **R**审查 → **V**归档。

目标：一次性完成“需求 → 可验证交付”，并将关键决策记录在外部记忆中，而不是依赖假设。

## 核心规则（强制）

- **10 分明确门槛**：规格评分为 `0-10`；必须达到 `>=9` 才能进入规划阶段。
- **每 2 次操作保存**：每进行 2 次工具调用，就向 `.sparv/journal.md` 追加一条记录。
- **3 次失败协议**：连续失败 3 次后停止，并上报给用户。
- **EHRB**：检测到高风险时，必须获得用户明确确认（生产环境/敏感数据/破坏性操作/计费 API/安全关键操作）。
- **固定阶段名称**：`specify|plan|act|review|vault`（存储在 `.sparv/state.yaml:current_phase` 中）。

## 增强规则（v1.1）

### 不确定性声明（G3）

当明确阶段的任一维度得分低于 2 时：
- 声明：`UNCERTAIN: <what> | ASSUMPTION: <fallback>`
- 在进入规划阶段前，将所有假设列入日志
- 针对模糊需求提供 2-3 个选项

示例：
```
UNCERTAIN: deployment target | ASSUMPTION: Docker container
UNCERTAIN: auth method | OPTIONS: JWT / OAuth2 / Session
```

### 需求路由

| 模式 | 条件 | 流程 |
|------|-----------|------|
| **快速** | 评分 >= 9 且涉及文件数 <= 3 且无 EHRB | 明确 → 执行 → 审查 |
| **完整** | 其他情况 | 明确 → 规划 → 执行 → 审查 → 归档 |

快速模式会跳过正式的规划阶段，但仍要求：
- 将完成承诺写入日志
- 适用每 2 次操作保存规则
- 审查阶段为强制要求

### 上下文获取（可选）

在明确阶段评分前：
1. 检查 `.sparv/kb.md` 中是否有现有模式/决策
2. 如果信息不足，则扫描代码库中的相关文件
3. 将调查结果记录在日志的 `## Context` 下

如果用户已明确提供完整上下文，则跳过此步骤。

### 知识库维护

在归档阶段更新 `.sparv/kb.md`：
- **模式**：发现的可复用代码模式
- **决策**：架构选择及其理由
- **注意事项**：常见陷阱及解决方案

### CHANGELOG 更新

对于非简单变更，在审查或归档阶段使用：
```bash
~/.claude/skills/sparv/scripts/changelog-update.sh --type <Added|Changed|Fixed|Removed> --desc "..."
```

## 外部记忆（两个文件）

初始化（在项目根目录运行）：

```bash
~/.claude/skills/sparv/scripts/init-session.sh --force
```

文件约定：

- `.sparv/state.yaml`：状态机（最少包含字段：`session_id/current_phase/action_count/consecutive_failures`）
- `.sparv/journal.md`：统一日志（规划/进度/发现均记录在此）
- `.sparv/history/<session_id>/`：归档目录

## 阶段 1：明确（10 分制）

每项得分为 0/1/2，总分为 0-10：

1) **价值**：为什么要做，收益/指标是否可验证
2) **范围**：MVP + 不在范围内的内容
3) **验收**：可测试的验收标准
4) **边界**：错误/性能/兼容性/安全关键边界
5) **风险**：EHRB/依赖项/未知因素 + 处理方法

`score < 9`：继续提问；不要进入规划阶段。
`score >= 9`：写下清晰的 `completion_promise`（可验证的完成承诺），然后进入规划阶段。

## 阶段 2：计划

- 拆分为原子任务（粒度为 2–5 分钟），每个任务都应有可验证的输出/测试点。
- 将计划写入 `.sparv/journal.md`（计划部分或直接追加）。

## 阶段 3：执行

- **TDD 规则**：没有失败的测试 → 不编写生产代码。
- 每执行 2 个操作自动写入日志（PostToolUse 钩子）。
- 失败计数（3 次失败协议）：

```bash
~/.claude/skills/sparv/scripts/failure-tracker.sh fail --note "short blocker"
~/.claude/skills/sparv/scripts/failure-tracker.sh reset
```

## 阶段 4：审查

- 分两个阶段：规范一致性 → 代码质量（正确性/性能/安全性/测试）。
- 最多进行 3 轮修复；超过则上报给用户。

在会话结束前运行 3 问重启测试：

```bash
~/.claude/skills/sparv/scripts/reboot-test.sh --strict
```

## 阶段 5：归档

归档当前会话：

```bash
~/.claude/skills/sparv/scripts/archive-session.sh
```

## 脚本工具

| 脚本 | 用途 |
|--------|---------|
| `scripts/init-session.sh` | 初始化 `.sparv/`，生成 `state.yaml` + `journal.md` |
| `scripts/save-progress.sh` | 维护 `action_count`，每执行 2 个操作追加到 `journal.md` |
| `scripts/check-ehrb.sh` | 扫描差异/文本，输出（可选写入）`ehrb_flags` |
| `scripts/failure-tracker.sh` | 维护 `consecutive_failures`，达到 3 时返回退出码 3 |
| `scripts/reboot-test.sh` | 3 问自检（可选严格模式） |
| `scripts/archive-session.sh` | 将 `journal.md` + `state.yaml` 归档到 `history/` |

## 自动钩子

`hooks/hooks.json`：

- PostToolUse：`save-progress.sh`（每 2 个操作保存）
- PreToolUse：`check-ehrb.sh --diff --dry-run`（仅提示，不写入状态）
- Stop：`reboot-test.sh --strict`（3 问自检）

---

*质量优先于速度——持续迭代，直至真正完成。*