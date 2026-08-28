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

治理用户实际体验到的 Skill 表面：预期的热入口或路由器在全新宿主中完全可见，冷能力仍可访问，可编辑行为只有一个规范归属方，并且每次退役都可恢复。目录数量更少并不是目标。

## 必需的结果契约

在执行操作之前，用一句话说明：

- 哪些入口或路由器必须对模型可见；
- 哪些能力必须在冷状态下保持可用；
- 用户授权修改的是哪一层；
- 哪些全新宿主证据可以证明成功。

如果请求仅仅是“有多少 / 加载了什么 / 为什么”，则保持只读。

## 系统模型

绝不要将以下层级合并为一个：

1. **规范源** — 可以编辑所属行为的位置。
2. **已安装清单** — 磁盘上存在的包和版本。
3. **发现策略** — Claude 或 Codex 可以发现的内容。
4. **模型可见目录** — 全新模型提示中的元数据。
5. **运行时资源** — 路由器仍然需要的隐藏脚本、引用和资源。

已安装不代表已激活；已激活不证明可见；可见不证明可用。数量和字节总数仅是诊断值。

## 权威顺序

使用当前运行时事实，而不是记忆中的约定：

- 使用所属源代码仓库及其清单确定可编辑的 Skill 行为；
- 使用 `claude plugin ... --json` 确定当前 Claude marketplace/install 状态；
- 使用显式的源同步激活清单确定受管 Daymade 链接；
- 使用 `~/.agents/skills` 作为 Codex 当前的用户 Skill 根目录；
- 使用精确路径 `~/.codex/config.toml` 策略确定 Codex 发现禁用项；
- 使用 `codex debug prompt-input` 确定实际的全新 Codex 目录；
- 使用已安装的供应商包提供第三方冷资源。

`~/.codex/skills` 属于旧版/系统兼容路径，除非当前本地契约明确为其指定其他角色。绝不要仅仅为了让所有权看起来完整，就将第三方清单移入所属源激活清单。

## 路由请求

在使用该工作流之前，完整阅读
[`references/skill-surface-governance.md`](references/skill-surface-governance.md)
中指定的章节。

| 请求 | 阅读并使用 |
|---|---|
| Codex 实际加载了什么；数量、截断、重复身份、缺失路由器 | §3–4，然后 §11 |
| 对齐所属源链接或 `~/.agents/skills` 激活状态 | §2–5，然后 §11 |
| 将 gstack/Lark/IMA/UiPath 或其他包置于路由器之后并保持冷状态 | §2–4、§6，然后 §11 |
| Claude marketplace/plugin 源或已安装状态漂移 | §2–3、§7，然后 §11 |
| 旧缓存版本 | §2 和 §7“Exceptional manual cache repair” |
| 已被套件取代的独立插件 | §7–8，然后 §11 |
| 项目 `.claude/skills` 与 `.agents/skills` 漂移 | §9，然后 §11 |
| 退役松散或重复的 Skill 目录 | §2–3、§10–11 |

## Codex 只读快速审计

从此 Skill 包运行：

```bash
python3 scripts/audit_codex_skill_surface.py --json
```

仅添加用户或激活 SSOT 实际声明的策略：

```bash
python3 scripts/audit_codex_skill_surface.py \
  --require-visible gstack-router \
  --json
```

该脚本将 `codex debug prompt-input` 与 Codex 自有 app-server 的 `skills/list` 所解析出的完整元数据，以及精确的激活/发现策略进行比较。
退出码 `0` 表示检查通过，`1` 表示存在压力或漂移，需要作出决策，`2` 表示证据无效。该脚本为只读操作。不要将退出码 `1` 转换为自动清理操作。

对于项目的双根目录：

```bash
python3 scripts/audit_project_skill_roots.py <project-root> --json
```

该审计工具通过 frontmatter 的 `name` 配对直接子级 bundle，仅识别其明确声明的可见失败兼容路由器契约，并区分共享目标、完全相同的副本、实际漂移和无效状态。

## 不可妥协的安全边界

- 漂移检查为只读操作。配置编辑、链接同步、安装、卸载、移动、缓存修复和 marketplace 源变更都需要授权。
- 保留 Claude 插件的作用域。在停用旧身份之前，先验证替代项。
- 绝不要使用直接复制缓存的方式进行安装或源同步。
- 不要强制要求“只保留一个缓存版本”。当前的 Claude Code 会为运行中的会话处理孤立版本的宽限期；手动移除缓存仅限于特殊修复场景。
- 不要盲目执行 marketplace 先移除再添加的操作。移除最后一个具有作用域的 marketplace 可能会卸载其中的插件。
- 在认定任何候选项冗余之前，读取其全部独有的指令、脚本、参考资料和资源。旧或简短并不意味着没有价值。
- 保持冷态第三方资源已安装；仅隐藏其精确的发现路径，然后证明路由器仍能解析一个代表性能力。
- 通过可恢复的移动操作以及文件/可执行文件/哈希清单进行停用，绝不要使用 `rm -rf`。
- 已存在的会话会保留启动元数据。在将交互式目录视为验证结果之前，先重启。

## 源和激活的所有权

对于由 Daymade 源支持的 Codex 激活，转交给当前的
`claude-switch-models-setup` dry-run/apply 工作流。其明确的
`codex-active-skills.json` 仅负责管理从已声明源 marketplace 创建的链接。不要在此处重新实现其冲突、符号链接或清理逻辑。

对于 Claude 插件，检查当前的 marketplace 和安装 JSON，在原始作用域通过官方 CLI 进行更新或重新安装，并独立读取回结果。将缓存文件夹视为派生的运行时产物。

对于套件拓扑变更，使用 `marketplace-dev` 编辑源清单；仅使用此 Skill 在当前主机上协调已经落地的迁移。

## 完成标准

所有适用的声明都必须经过独立证明：

- 已命名规范源和当前所有者；
- 选定的直接条目/路由器出现在全新的提示中，且描述完整无缺；
- 计划保持冷态的条目不在该目录中；
- 一个代表性的冷态能力仍能解析并正常工作；
- 由源支持的链接或 Claude 安装已读回，并具有预期的身份、源/版本和作用域；
- 任何已停用的 bundle 及其恢复清单仍然存在；
- 未解决的所有权、主机版本行为或有意保留的例外情况均已明确。

到此为止。除非请求的结果仍然缺乏证据，否则不要创建新的钩子、清单、报告层或清理项目。