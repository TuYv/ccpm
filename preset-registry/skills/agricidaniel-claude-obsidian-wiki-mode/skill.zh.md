---
name: wiki-mode
description: "Methodology modes for the Compound Vault. Lets the vault declare an organizational style (LYT / PARA / Zettelkasten / Generic) that wiki-ingest, save, and autoresearch consult before filing new pages. Reads `.vault-meta/mode.json`; defaults to `generic` (v1.6/v1.7 behavior) when absent. Per the May 2026 compass artifact, methodology support was priority gap 5 — no other Claude+Obsidian competitor ships it as a first-class skill. Triggers on: set vault mode, switch to PARA, use LYT, what's my vault mode, zettelkasten setup, wiki mode, methodology mode, change mode, configure mode."
allowed-tools: Read, Write, Bash
---
# wiki-mode：复合型 Vault 的方法论模式

v1.6 + v1.7 的 Vault 结构不带任何倾向性——`wiki/sources/`、`wiki/entities/`、`wiki/concepts/` 等。这适合拥有自己组织习惯的高级用户，却无法满足大量希望遵循一种具名方法论的 Obsidian 用户。

**v1.8 推出 `wiki-mode` 来填补这一空白。** Vault 在 `.vault-meta/mode.json` 中声明一种模式（LYT、PARA、Zettelkasten 或 Generic）；其他技能在决定将新页面归档到何处之前，会先读取该模式。Mode = `generic` 是默认值，并完整保留 v1.6/v1.7 的行为。

**根据 2026 年 5 月的指南针产物**：这是已识别出的 5 个优先级差距中的第 5 个。Ideaverse Pro 2.0（售价 200 美元的付费 Vault）将 LYT 作为一种带有明确倾向的结构提供；没有任何 Claude+Obsidian 竞品将 PARA / Zettelkasten / 模式感知路由作为一等技能提供。v1.8 使我们在审计 §9 的方法论支持维度上从 TIE → LEAD（7 个维度中的 5 个，#1）。

---

## 四种模式

### LYT（Linking Your Thinking——Nick Milo）

**理念：**笔记相互链接，文件夹不会。其组织原语是 **MOC**（Map of Content）——一种链接至一组原子笔记的枢纽笔记。你永远不需要浏览文件夹；而是通过跟随链接进行导航。

**归档约定：**
- `wiki/mocs/<topic>-moc.md`——某个主题集群的 MOC
- `wiki/notes/<atomic-note>.md`——以其表达的想法命名的扁平化原子笔记列表，每条笔记都至少由一个 MOC 链接

**适用场景：**中大型知识库（>100 条笔记）、以概念集群和知识图谱进行思考的用户。

### PARA（Tiago Forte）

**理念：**按**可行动性**而非主题进行组织。正在推进的工作放入 Projects，持续承担的责任放入 Areas，参考资料放入 Resources，已完成或不活跃的内容放入 Archives。

**归档约定：**
- `wiki/projects/<project-name>/<note>.md`——具有截止日期/预期成果的活跃项目
- `wiki/areas/<area-name>/<note>.md`——持续承担的责任（无截止日期）
- `wiki/resources/<topic>/<note>.md`——按主题组织的参考资料
- `wiki/archives/<year>/<note>.md`——已完成的项目、不再维护的领域

**适用场景：**重视工作流的用户、管理多个项目的知识工作者、采用与 GTD 相近实践的用户。

### Zettelkasten（Niklas Luhmann 的卡片盒）

**理念：**原子笔记、唯一 ID、密集的双向链接。没有文件夹。每条笔记只回答一个想法。笔记通过 ID 引用彼此发现。

**归档约定：**
- `wiki/<YYYYMMDDHHMMSSffffff>-<slug>.md`——扁平化、带时间戳的 ID（20 位数字 = 日期 + 微秒，可避免冲突）
- 每条笔记的 frontmatter 中都包含 `id:`、`parent_id:`（可选）、`child_ids:`（可选）
- 不使用子目录；wiki/ 根目录就是整个 Vault

**适用场景：**学者、研究人员，以及构建永久知识产物的长期主义思考者。纪律性要求最高；归档层级最少。

### Generic（默认——v1.7 行为）

**归档约定：**保留 v1.6/v1.7 的默认方式——`wiki/sources/`、`wiki/entities/`、`wiki/concepts/`、`wiki/<domain>/`。不施加任何倾向。

**何时使用：** 当你不想采用某种特定方法论，或者正在从 v1.7 迁移并希望行为完全不变时。

---

## 如何设置模式

```bash
bash bin/setup-mode.sh
```

交互式提示：从 4 种模式中选择一种。配置将写入 `.vault-meta/mode.json`。还可以选择性地初始化模板文件夹（LYT 的 `mocs/`，PARA 的 `projects/areas/resources/archives/`）。

要通过编程方式检查当前模式：

```bash
cat .vault-meta/mode.json | python3 -c 'import json,sys; print(json.load(sys.stdin)["mode"])'
```

要在之后切换模式：重新运行 `setup-mode.sh`。现有文件不会自动迁移；新模式只会影响从该时刻起新归档的页面。迁移需要手动执行（请参阅下方的[迁移部分](#migration-between-modes)）。

---

## 模式配置模式定义（`.vault-meta/mode.json`）

```json
{
  "schema_version": 1,
  "mode": "lyt|para|zettelkasten|generic",
  "configured_at": "ISO-8601 timestamp",
  "config": {
    "lyt": {
      "moc_folder": "wiki/mocs/",
      "notes_folder": "wiki/notes/"
    },
    "para": {
      "projects_folder": "wiki/projects/",
      "areas_folder": "wiki/areas/",
      "resources_folder": "wiki/resources/",
      "archives_folder": "wiki/archives/"
    },
    "zettelkasten": {
      "id_format": "YYYYMMDDHHMMSSffffff",
      "no_folders": true,
      "root_folder": "wiki/"
    },
    "generic": {
      "sources_folder": "wiki/sources/",
      "entities_folder": "wiki/entities/",
      "concepts_folder": "wiki/concepts/",
      "sessions_folder": "wiki/sessions/"
    }
  }
}
```

`config` 块始终包含全部四种模式；当前启用的模式由 `mode` 指定。这样，你就可以在不丢失自定义文件夹覆盖配置的情况下切换模式。

---

## 其他技能如何使用该模式

集成层位于三个技能中：

- `skills/wiki-ingest/SKILL.md` — “## 模式感知（v1.8+）”部分
- `skills/save/SKILL.md` — “## 模式感知（v1.8+）”部分
- `skills/autoresearch/SKILL.md` — “## 模式感知（v1.8+）”部分

每个技能都会读取 `.vault-meta/mode.json`（通过 `cat` 或直接读取）。如果该文件不存在 → mode = generic，行为保持不变。如果存在且 mode != generic，则根据该模式的配置进行路由。

路由表：

| 内容类型 | Generic | LYT | PARA | Zettelkasten |
|---|---|---|---|---|
| 新来源摄取 | `wiki/sources/foo.md` | `wiki/notes/foo.md` + 添加到主题 MOC | `wiki/resources/<topic>/foo.md` | `wiki/<ID>-foo.md` |
| 新实体 | `wiki/entities/<Name>.md` | `wiki/notes/<Name>.md` + 实体 MOC | `wiki/resources/people/<Name>.md` | `wiki/<ID>-<name>.md` |
| 新概念 | `wiki/concepts/<Name>.md` | `wiki/notes/<Name>.md` + 概念 MOC | `wiki/resources/concepts/<Name>.md` | `wiki/<ID>-<name>.md` |
| 会话笔记（`/save`） | `wiki/sessions/<date>-<topic>.md` | `wiki/notes/<date>-<topic>.md` + 会话 MOC | `wiki/projects/<project>/<date>-<topic>.md` | `wiki/<ID>-session-<topic>.md` |
| 研究输出（`/autoresearch`） | `wiki/concepts/<topic>.md` | `wiki/notes/<topic>.md` + 主题 MOC | `wiki/resources/<topic>/<topic>.md` | `wiki/<ID>-<topic>.md` |

---

## 模板

各模式的模板位于 `skills/wiki-mode/templates/`：

- [`lyt/moc-template.md`](templates/lyt/moc-template.md) — MOC 脚手架
- [`lyt/atomic-template.md`](templates/lyt/atomic-template.md) — 链接到 MOC 的原子笔记
- [`para/project-template.md`](templates/para/project-template.md) — 包含状态、截止日期和下一步行动的项目
- [`para/area-template.md`](templates/para/area-template.md) — 持续承担的责任
- [`para/resource-template.md`](templates/para/resource-template.md) — 参考资料
- [`zettel/atomic-template.md`](templates/zettel/atomic-template.md) — 原子论点及父/子 ID

创建新页面的技能会查询与 (mode, content-type) 组合相匹配的模板，并将其作为结构起点。模板只是建议；始终以技能自身的内容逻辑为准。

---

## 模式间迁移

切换模式不会自动迁移现有文件。手动迁移：

1. 设置新模式：`bash bin/setup-mode.sh`
2. 现有文件保留在原始位置并继续正常工作
3. 新文件按照新模式归档
4. （可选）使用文件管理器或 `git mv`，手动将现有文件移动到新结构中

不进行自动迁移的原因：wiki 包含你的思考。自动重写路径可能会破坏 wikilink、丢失数据，或带来意外结果。手动迁移会促使你明确判断哪些内容适合新方法论，哪些内容应留在当前所在位置。

特别是对于 LYT：切换到 LYT 后，运行 `lint the wiki`（技能：wiki-lint），以识别适合纳入 MOC 的孤立页面。

---

## 功能门控

此技能在 v1.8+ 中普遍可用。技能本身无需运行 `bin/setup-*.sh`——仅在显式设置非默认模式时才需要。使用该模式的技能会检查 `.vault-meta/mode.json`；不存在则表示 generic。

```bash
# Detection idiom for consumers:
if [ -f .vault-meta/mode.json ]; then
  MODE=$(python3 -c 'import json; print(json.load(open(".vault-meta/mode.json"))["mode"])')
else
  MODE="generic"
fi
```

---

## 为什么在 v1.8 而不是 v2.0+ 中推出此功能

根据审计 §9：方法论支持是取得领先成本最低的维度。其他产品都未提供此功能。其实现主要由约定、路由和模板组成；不需要新基础设施，也不需要新依赖。在开展规模更大的 v2.0（derive）和 v2.5（GUI）工作之前，这是路线图中投资回报率最高的版本。

v1.8 发布后：根据 compass 产物，claude-obsidian 在 7 个维度中的 5 个维度上处于领先地位。其余 2 个维度（GUI 易用性、衍生输出）本身都需要大版本才能实现。

---

## 交叉引用

- [`docs/methodology-modes-guide.md`](../../docs/methodology-modes-guide.md) — 叙述性指南及模式选择决策树
- [`wiki/references/methodology-modes.md`](../../wiki/references/methodology-modes.md) — 简短决策树
- [`docs/compound-vault-guide.md`](../../docs/compound-vault-guide.md) — v1.7 综合指南（v1.8 以此为基础）
- v1.7.0 审计 §9 维度 6（方法论 TIE → LEAD）：[`docs/audits/v1.7.0-audit-2026-05-17.md`](../../docs/audits/v1.7.0-audit-2026-05-17.md)

---

## 如何思考（10 原则映射）

使用此技能时，请应用 10 原则循环。有关规范框架，请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 在执行任何路由之前，读取 `.vault-meta/mode.json` 以了解当前启用的模式。 |
| 2 | 观察（内部） | 审视 mode=generic 是默认模式这一假设——用户可能使用的是 LYT/PARA/Zettelkasten。 |
| 3 | 倾听 | 模式体现的是用户的组织直觉，而不是你的。尊重用户的配置。 |
| 4 | 思考 | 将特定于模式的路由规则应用于当前的内容类型（来源 / 实体 / 概念 / 会话 / 研究）。 |
| 5 | 连接（横向） | 此技能的 `safe_name` 是规范的清理器——wiki-ingest、save、autoresearch 最终都会经由此处处理。 |
| 6 | 连接（系统） | 三个消费方技能依赖 `route` 输出；消费方之间的一致性是 v1.8 契约。 |
| 7 | 感受 | 路由后的路径对用户而言是否合理？`wiki/notes/Foo.md`（LYT）与 `wiki/concepts/Foo.md`（generic）的含义不同。 |
| 8 | 接受 | 模式选择由用户决定。接受 PARA 用户有时会希望覆盖自动路由这一事实。 |
| 9 | 创造 | 返回路由后的路径字符串——一个安全且唯一的文件系统位置。 |
| 10 | 成长 | 当模式在仓库使用过程中发生变化时，如实说明迁移成本；现有页面**不会**自动迁移。 |