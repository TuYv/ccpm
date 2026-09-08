---
name: aspire-init
description: >-
  **WORKFLOW SKILL** - First-run flow for adding Aspire to a repo. Picks `aspire new`
  (greenfield) or `aspire init` (existing repo), drops the AppHost skeleton, then hands
  off to `aspireify` for resource wiring.
  USE FOR: aspire init, aspire new, aspire-starter, aspire-ts-starter, aspire-py-starter,
  add Aspire to existing repo, scaffold Aspire app, bootstrap Aspire, no AppHost detected,
  install aspireify, generated .aspire/modules.
  DO NOT USE FOR: AppHost wiring on an existing AppHost (use aspireify), start/stop/wait
  (use aspire-orchestration), deploy/publish (use aspire-deployment), logs/traces (use
  aspire-monitoring), repo that already has an AppHost.
  INVOKES: aspire CLI (init, new, doctor), aspireify (handoff after skeleton drop).
  FOR SINGLE OPERATIONS: Run `aspire init` or `aspire new TEMPLATE` directly.
license: MIT
metadata:
  author: Microsoft
  version: "0.0.1"
---
# Aspire Init

> **仅限首次运行。** 此技能负责为尚未拥有 Aspire AppHost 的仓库提供骨架落地与模板选择。
> 骨架就位后，交由
> [`aspireify`](../aspireify/SKILL.md) 完成实际的资源接线。

## 前置条件

| 要求 | 安装方式 |
|-------------|---------|
| .NET 10.0 SDK | https://dotnet.microsoft.com/download |
| Aspire CLI（curl 安装脚本） | `curl -sSL https://aspire.dev/install.sh \| bash` |
| Aspire CLI（NativeAOT 全局工具） | `dotnet tool install -g Aspire.Cli`（需要 .NET 10） |
| 诊断缺失的前置条件 | `aspire doctor` |

> Aspire 将 CLI 作为 NativeAOT .NET 全局工具发布 —— 启动即时，无需 JIT 预热。
> 对于没有 .NET 10 的环境，仍支持 curl/PowerShell 安装脚本。

## 检测

仅在向尚无 Aspire 的工作区添加 Aspire 时**才**激活。在运行 `aspire init` 之前，确认以下
全部条件：

| 信号 | 检测方式 | 含义 |
|--------|---------------|---------|
| 无 C# AppHost | 没有包含 `Aspire.AppHost.Sdk` 的 `.csproj` | 可以初始化 |
| 无基于文件的 AppHost | 没有带 `#:sdk Aspire.AppHost.Sdk` 的 `apphost.cs` | 可以初始化 |
| 无 TypeScript AppHost | 仓库根目录中没有 `apphost.ts` | 可以初始化 |
| 无 Aspire 配置 | 仓库根目录中没有 `aspire.config.json` | 可以初始化 |
| 用户意图 | 明确说出 “add Aspire”、“scaffold Aspire”、"aspire init" | 可以初始化 |

如果**任何** AppHost 信号已经存在，**不要运行 `aspire init`**。转交给
[`aspireify`](../aspireify/SKILL.md)（重新接线）或
[`aspire-orchestration`](../aspire-orchestration/SKILL.md)（生命周期）。

## 决策：`aspire new` vs `aspire init`

| 情形 | 命令 | 原因 |
|-----------|---------|-----|
| 空目录或全新项目 | `aspire new <template>` | 生成完整的入门解决方案 |
| 已有需要建模服务的现有仓库 | `aspire init` | 在现有代码旁落地最小骨架 + `aspire.config.json` |
| 用户想要可供学习的示例 | `aspire new aspire-starter` | 包含 ApiService + Web + ServiceDefaults |
| 用户想要尽可能小的脚手架 | `aspire new aspire-empty`（C#）或 `aspire new aspire-ts-empty`（TS） | 未预先接线任何资源 |
| 用户想要 Python 服务 | `aspire new aspire-py-starter`（TypeScript AppHost 驱动 Python） | **不是** `dotnet new` —— 该模板已在 13.3 中移除 |

完整的模板列表及选项请参见 [references/templates.md](references/templates.md)。

## 工作流 A —— `aspire new <template>`（新项目）

适用于位于空目录或尚不存在目录中的全新项目：

1. 如果不确定 CLI 是否已安装，用 `aspire doctor` 确认前置条件。
2. 从 [references/templates.md](references/templates.md) 中挑选一个模板。
3. 运行模板，agent 流程中需附加 `--non-interactive`：
   ```bash
   aspire new aspire-starter --name MyApp --output ./MyApp --non-interactive
   ```
4. 新目录已由模板完成全部接线 —— **无需移交给 aspireify**。
5. 转交给 [`aspire-orchestration`](../aspire-orchestration/SKILL.md) 进行首次运行
   （`aspire start`）。

## 工作流 B —— `aspire init`（已有仓库）

适用于已经包含服务（Express API、.NET API、Python 服务等）
且需要在其旁边添加 AppHost 的仓库：

1. 核对[检测](#detection)表 —— 确认**没有** AppHost 存在。
2. 运行 `aspire init`，非交互式流程中需显式指定语言：
   ```bash
   aspire init --language csharp --non-interactive
   # or
   aspire init --language typescript --non-interactive
   ```
3. `aspire init` 会落地：
   - AppHost 骨架（带 `#:sdk` 指令的 `apphost.cs`，**或**带生成的 `.aspire/modules/` 文件夹的
     `apphost.ts`）
   - 描述语言 + AppHost 路径的 AppHost 配置
   - 将 **`aspireify`** agent 技能装入项目的技能目录（与 `aspire agent init` 所用的目录相同）
4. **移交给 `aspireify`** —— `aspire init` **不会**自行接线资源、项目或集成。
5. `aspireify` 完成接线后，通过 `aspire start`
   （[`aspire-orchestration`](../aspire-orchestration/SKILL.md)）进行验证。

完整流程（包括 `aspire.config.json` 的内容以及 `aspire init` 中途失败时的处理方法）
请参见 [references/init-workflow.md](references/init-workflow.md)。

## 移交规则

| `aspire init` / `aspire new` 完成后…… | 转交给 |
|------------------------------------------------|----------|
| 骨架已落地，资源需要接线 | → `aspireify` 技能（插件内或项目本地） |
| 骨架已落地，需验证其可启动 | → `aspire-orchestration`（运行 `aspire start`） |
| 由模板创建的新项目，已可运行 | → `aspire-orchestration` |
| 用户在初始化后要求部署 | → `aspire-deployment` |
| 用户在初始化后要求日志/追踪 | → `aspire-monitoring` |
| 检测到已有 AppHost —— 不要运行 init | → `aspireify`（重新接线）或 `aspire-orchestration`（生命周期） |

## 项目本地技能覆盖

如果项目中本地存在 `.agents/skills/aspire-init/SKILL.md`（来自较早版本 `aspire init` 运行的
旧式安装），**应警告用户并以其为准**。旧式的项目本地技能可能包含不应被此插件内技能覆盖的
仓库特定指导。

出于同样的原因，项目本地的 `aspireify` 技能（由 `aspire init` 安装）优先于此插件的插件内
`aspireify` —— 以项目本地副本为准并向用户发出警告。

## 错误处理

| 症状 | 原因 | 措施 |
|---------|-------|--------|
| `aspire init` 报告 AppHost 已存在 | 仓库已有 AppHost | 停止。转交给 `aspireify`（重新接线）或 `aspire-orchestration`（生命周期） |
| `aspire init` 在非交互模式下因缺少 `--language` 而失败 | 存在多条语言路径可选 | 使用 `--language csharp` 或 `--language typescript` 重新运行 |
| `aspire new` 拒绝 `--output` 路径 | 路径已存在且非空 | 使用其他 `--output` 或清空该目录 |
| 找不到 `aspire` 命令 | 未安装 CLI | `dotnet tool install -g Aspire.Cli`（.NET 10）或 `curl -sSL https://aspire.dev/install.sh \| bash` |
| `aspire doctor` 报告缺少 .NET 10 | SDK 缺失 | 先安装 .NET 10 SDK 再重试 |
| `aspire init` 成功但未安装 `aspireify` 技能 | 未检测到 agent 技能目录 | 运行 `aspire agent init` 安装 `aspireify`，然后继续接线 |
| 骨架已落地但资源未接线 | 符合预期 —— `aspire init` 不负责接线 | 移交给 `aspireify` |

## 参考文档

- [templates.md](references/templates.md) —— `aspire new` 模板与选项
- [init-workflow.md](references/init-workflow.md) —— `aspire init` 流程、`aspire.config.json`
  布局以及 `aspireify` 移交
