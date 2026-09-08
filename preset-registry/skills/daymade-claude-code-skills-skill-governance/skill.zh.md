---
name: skill-governance
description: >-
  Govern the real Claude Code and Codex Skill surface without losing cold
  capability. Use when users ask how many Skills are loaded, why the catalog is
  huge or descriptions are truncated, want only routers visible while
  gstack/Lark/IMA/UiPath stay on disk, or need to reconcile
  source/install/cache drift, `.agents/skills`/`.claude/skills`/legacy
  `.codex/skills`, loose or duplicate Skills, discovery policy, marketplace
  sources, suite migrations, superseded plugins, or old cache versions. Verifies
  the fresh host catalog and router resources; filesystem counts or completed
  cleanup are not success.
---
# Skill 治理

治理用户实际接触到的 Skill 表面：预期的热入口或路由器在全新宿主中完全可见，冷能力仍可访问，可编辑行为只有一个规范所有者，并且每次退役都可恢复。目录数量更少并不是目标。

## 必需结果契约

在执行前，用一句话说明：

- 哪些入口或路由器必须对模型可见；
- 哪些能力必须在冷状态下保持可用；
- 用户授权更改哪一层；
- 哪些全新宿主证据将证明成功。

如果请求只是“有多少 / 加载了什么 / 为什么”，则保持只读。

## 系统模型

绝不要将以下层级合并为一体：

1. **规范源** — 可编辑所拥有行为的位置。
2. **已安装清单** — 磁盘上存在的 bundle 和版本。
3. **发现策略** — Claude 或 Codex 可以发现的内容。
4. **模型可见目录** — 全新模型提示中的元数据。
5. **运行时资源** — 路由器仍需要的隐藏脚本、引用和资源。

已安装不代表已激活；已激活不代表可见；可见不代表可用。数量和字节总数仅是诊断值。

## 权限顺序

使用当前运行时事实，而不是记忆中的约定：

- 所有源代码仓库及其清单，用于确定可编辑的 Skill 行为；
- `claude plugin ... --json`，用于确定当前 Claude marketplace/install 状态；
- 显式的 source-sync activation manifest，用于确定受管理的 Daymade 链接；
- `~/.agents/skills`，作为 Codex 当前的用户 Skill 根目录；
- `~/.codex/config.toml` 中的精确路径策略，用于确定 Codex 发现禁用项；
- `codex debug prompt-input`，用于确定实际的全新 Codex 目录；
- 已安装的 vendor bundle，用于提供第三方冷资源。

`~/.codex/skills` 是旧版/系统兼容路径，除非当前本地契约明确为其指定其他角色。绝不要仅为了让所有权看起来完整，就将第三方清单移入所拥有源的激活清单。

## 路由请求

在使用该工作流前，完整阅读
[`references/skill-surface-governance.md`](references/skill-surface-governance.md)
中指定的章节。

| 请求 | 阅读并使用 |
|---|---|
| Codex 实际加载了什么；数量、截断、重复身份、缺失路由器 | §3–4，然后 §11 |
| 对齐所拥有的源链接或 `~/.agents/skills` 激活状态 | §2–5，然后 §11 |
| 让 gstack/Lark/IMA/UiPath 或其他 bundle 通过路由器保持冷状态 | §2–4、§6，然后 §11 |
| Claude marketplace/plugin 源或已安装状态漂移 | §2–3、§7，然后 §11 |
| 旧缓存版本 | §2 和 §7“Exceptional manual cache repair” |
| 由套件取代的独立插件 | §7–8，然后 §11 |
| 项目 `.claude/skills` 与 `.agents/skills` 漂移 | §9，然后 §11 |
| 退役松散或重复的 Skill 目录 | §2–3、§10–11 |

## Codex 快速只读审计

对于本地使用属于交付内容的新注册 Skill，在宣布其就绪前，运行
`references/skill-surface-governance.md` §14 中针对目标名称的检查。这涵盖 Claude 的全新命令目录和 Codex 的全新提示。名称必须来自请求的交付内容，而不能只来自当前激活白名单。

I’ll inspect the workspace to locate the Skill bundle and verify the audit scripts’ expected invocation, then run the requested read-only checks and report the evidence without making changes.运行此 Skill bundle：

```bash
python3 scripts/audit_codex_skill_surface.py --json
```

只添加用户或激活 SSOT 实际声明的策略：

```bash
python3 scripts/audit_codex_skill_surface.py \
  --require-visible gstack-router \
  --json
```

该脚本将 `codex debug prompt-input` 与 Codex 自身 app-server 的 `skills/list` 所解析的完整元数据，以及精确的激活/发现策略进行比较。退出码 `0` 表示干净，`1` 表示存在需要分类的压力或漂移，`2` 表示证据无效。该脚本是只读的。不要将退出码 `1` 自动转换为裁剪操作。

对于项目的双根目录：

```bash
python3 scripts/audit_project_skill_roots.py <project-root> --json
```

该审计通过 frontmatter `name` 配对直接子 bundle，仅识别其明确声明的 fail-visible 兼容路由器契约，并区分共享目标、完全相同的副本、实际漂移和无效状态。

## 不可妥协的安全边界

- 漂移检查是只读的。配置编辑、链接同步、安装、卸载、移动、缓存修复和 marketplace 源变更都需要授权。
- 保留 Claude plugin 的作用域。在停用旧身份之前，验证替代项。
- 绝不要直接复制缓存来进行安装或源同步。
- 不要强制要求“只保留一个缓存版本”。当前 Claude Code 负责为运行中的会话处理孤立版本的宽限期；手动移除缓存只应作为特殊修复手段。
- 不要盲目执行 marketplace 的先移除后添加操作。移除最后一个具有作用域的 marketplace 可能会卸载其 plugins。
- 在认定候选项冗余之前，读取每个候选项独有的 instructions、scripts、references 和 assets。旧或简短不代表没有价值。
- 保持冷门第三方资源处于安装状态；只隐藏其确切的发现路径，然后证明路由器仍能解析一个代表性能力。
- 通过可恢复的移动操作以及文件/可执行文件/hash 清单来停用，绝不要使用 `rm -rf`。
- 现有会话会保留启动元数据。在将交互式目录视为验证依据之前，先重启。

## 源与激活所有权

对于 Daymade 源支持的 Codex 激活，使用当前的 `claude-switch-models-setup` dry-run/apply 工作流。其明确的 `codex-active-skills.json` 仅负责从已声明的源 marketplace 创建的链接。不要在此处重新实现其冲突、符号链接或裁剪逻辑。

对于 Claude plugins，检查当前的 marketplace 和安装 JSON，在原始作用域通过官方 CLI 更新或重新安装，并独立读回结果。将缓存目录视为派生的运行时产物。

对于 suite 拓扑变更，使用 `marketplace-dev` 编辑源清单；仅使用此 Skill 在当前主机上协调已经落地的迁移。

## 完成定义

所有适用的声明都必须独立得到证明：

- 已命名规范源和当前所有者；
- 在请求的发现策略下，选定的直接条目/路由器出现在全新的 prompt 中；单独报告描述截断情况，包括仅安装目标门控通过的情况；
- 计划保持冷门的条目不在该目录中；
- 一个代表性的冷门能力仍能解析并正常工作；
- 源支持的链接或 Claude 安装通过读回确认其预期身份、源/版本和作用域；
- 任何已停用的 bundle 及其恢复清单仍然存在；
- 未解决的所有权、主机版本行为或有意保留的例外都已明确。

仅当实际任务执行属于交付内容的一部分时，才使用参考文档中的任务行为检查；仅有目录可见性并不能证明结果。

到此为止。如果请求的结果仍缺乏证据，不要创建新的 hook、manifest、report layer 或 cleanup project。