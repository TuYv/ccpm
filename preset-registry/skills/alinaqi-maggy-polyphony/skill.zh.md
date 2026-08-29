---
name: polyphony
description: Multi-agent orchestration with container-isolated workspaces — each agent session runs in its own Docker container with independent git branches
when-to-use: Always loaded when container isolation is available (Docker/OrbStack installed). Default for /spawn-team.
user-invocable: false
effort: high
---
# Polyphony — 多智能体编排

用于并行执行智能体的容器隔离工作区。每个智能体都拥有自己的 Docker 容器，并在独立分支上进行完整的 git 克隆。无冲突、彼此独立测试、生成干净的 PR。

---

## 架构（6 层）

1. **工作源** — 来自 GitHub Issues（`gh api`）或本地 SQLite 队列的任务
2. **编排器** — 监督循环：发现 -> 认领 -> 路由 -> 配置 -> 运行 -> 验证 -> 合并
3. **路由器** — 纯函数：任务 x 策略 -> RunSpec（5 个维度的复杂度评分）
4. **身份代理** — 将命名凭据解析为卷挂载 + 环境变量覆盖
5. **工作区管理器** — 按任务执行 `git clone --reference`、分支检出和清理
6. **工作者运行时** — Docker 容器创建/启动/停止/日志生命周期管理

---

## 任务生命周期

```
DISCOVERED -> CLAIMED -> ROUTED -> PROVISIONED -> RUNNING -> VERIFYING -> LANDED
                                                     |           |
                                                     v           v
                                                   FAILED --> BLOCKED
                                                     |
                                                     v
                                                   CLAIMED (retry)
```

---

## 前置条件

- 已安装并运行 Docker 或 OrbStack
- 至少有一个可用的智能体 CLI（Claude、Codex 或 Kimi）
- 已配置 CLI 订阅（而非 API 密钥）

检查：
```bash
command -v docker &>/dev/null || command -v orbctl &>/dev/null
```

---

## 配置

所有配置都位于 `~/.polyphony/`：

| 文件 | 用途 |
|------|---------|
| `config.yaml` | 工作区根目录、轮询间隔、最大并发数 |
| `identities.yaml` | 带卷路径的命名凭据包 |
| `agents.yaml` | 智能体配置文件（CLI 命令、优势） |
| `routing.yaml` | 路由规则和回退链 |

使用以下命令初始化：`polyphony init`

---

## 路由规则

规则按从上到下的顺序进行评估；第一个匹配项获胜。每条规则都有一个 `match` 谓词和一个 `agent` 目标。

```yaml
rules:
  - match: { task_type: docs, risk: low }
    agent: kimi
  - match: { task_type: bugfix }
    agent: codex
  - match: { risk: high }
    agent: claude
default:
  agent: claude
  fallback: [codex, kimi]
```

---

## 复杂度评分（5 个维度）

每个维度的评分为 0-2 分，总分为 0-10 分。

| 维度 | 来源 |
|-----------|--------|
| 圈复杂度 | LOC + 作用域大小 |
| 扇出 | 调用方数量 |
| 安全边界 | Auth/PII 关键词 |
| 并发性 | Lock/transaction 关键词 |
| 领域不变量 | 风险级别 + 任务类型 |

路由阈值：
- **0-3**：交由 Kimi 单独处理
- **4-6**：Kimi + Codex 审查
- **7-10**：由 Claude 直接处理

---

## 容器隔离

每个任务都拥有：
- 一个基于 `polyphony-worker:latest` 的独立 Docker 容器
- 位于 `/workspace` 的完整 git 克隆（不是 worktree）
- 以只读方式挂载的身份验证卷（例如 `~/.claude:/home/worker/.claude:ro`）
- 独立的测试执行环境
- 用于创建 PR 的独立分支

---

## CLI 命令

```bash
polyphony init                    # Create ~/.polyphony/ with config templates
polyphony spawn "Fix auth bug"    # Create and route a task
polyphony status                  # Show task states
polyphony cleanup                 # Remove completed workspaces
```

---

## 与现有技能的集成

- **cross-agent-delegation**：使用 Polyphony 的复杂度评分进行路由决策
- **agent-teams**：使用 Polyphony 的工作区隔离，而不是共享目录
- **spawn-team**：使用 Polyphony 的容器配置为功能代理提供环境