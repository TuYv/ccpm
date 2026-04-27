# 配方（Recipe）+ 库（Library）模型重构 — 设计文档

**日期**：2026-04-27  
**状态**：已确认，待实现  
**范围**：导航重构、行为语义重定义、首启扫描导入、配方页面新增

---

## 问题陈述

CCPM 已实现完整的预设 / Skills / MCP catalog 和自动发现，但用户反馈「画面不对」。

根因诊断：当前 6 Tab（预设 / Skills / MCP / 已安装 / 备份 / Claude 配置）按**数据类型**组织导航，迫使用户先理解「preset / skill / MCP 是三个不同概念」才能开始用，与产品目标「让用户在 GUI 上完成 Claude Code 配置，零学习成本」相悖。

## 目标

让新用户打开 app 立即知道：
1. 我的 Claude 现在是什么状态
2. 怎么改 / 升级它
3. 改完一键生效

不需要先学懂 preset / skill / MCP 的差别。

---

## 核心机制：库 + 配方

```
┌─────────────────────────────────────────────────────────────┐
│ 远程 registry / GitHub 自动发现                              │
└─────────────────────────────┬───────────────────────────────┘
                              ↓ 用户「下载」
┌─────────────────────────────────────────────────────────────┐
│ CCPM 本地库 ~/.claude-presets/library/                       │
│   ├── claude-md/<id>/CLAUDE.md, settings.json, meta.json    │
│   ├── skills/<id>/SKILL.md, skill.json                      │
│   └── mcps/<id>/mcp.json                                    │
│                                                              │
│ 库中的内容不影响 Claude Code 实际行为。                       │
└─────────────────────────────┬───────────────────────────────┘
                              ↓ 用户在「配方」中拼装并点「激活」
┌─────────────────────────────────────────────────────────────┐
│ 配方 = 引用库中条目 + settings 覆盖                          │
│   recipes/<id>.json:                                         │
│     { claude_md: <library-id>,                              │
│       skills: [<library-id>, ...],                          │
│       mcps:   [{ ref: <library-id>, env: {...} }],          │
│       settings_override: {...} }                            │
└─────────────────────────────┬───────────────────────────────┘
                              ↓ 激活
┌─────────────────────────────────────────────────────────────┐
│ ~/.claude/{CLAUDE.md, settings.json, skills/, ...}          │
└─────────────────────────────────────────────────────────────┘
```

**关键约束**：
- 库内条目**永不改写** `~/.claude/`，下载是轻动作
- 配方采用**引用而非拷贝**（库条目更新后所有引用它的配方自动跟随）
- 激活才会触发备份 + 写入 `~/.claude/`

---

## 导航结构

```
配方 | 预设 | Skills | MCP | 已安装 | 备份 | Claude 配置
```

**配方放首位**：作为主入口和 dashboard。其余 5 tab（预设 / Skills / MCP / 已安装 / 备份）保持现有位置和职责，仅行为语义微调。

| Tab | 角色 | 行为变化 |
|-----|------|---------|
| **配方** | 主入口、Dashboard、激活控制台 | **新增** |
| **预设** | CLAUDE.md 文档库（含旧预设迁移） | 「安装」→「下载到库」；不再直接写 `~/.claude/` |
| **Skills** | Skill 库 | 同上 |
| **MCP** | MCP 库 | 同上 |
| **已安装** | 显示当前激活的配方在各 scope 的状态 | 不再独立追踪 skill/MCP 状态（看配方引用） |
| **备份** | 同今 | 同今 |
| **Claude 配置** | settings.json 高级编辑器 | 同今（保留给进阶用户细调） |

---

## 首启体验

第一次打开 app（检测到本地库为空）：

**步骤 1 — 扫描 `~/.claude/`**
- 检测 `~/.claude/CLAUDE.md`：存在 → 复制到库 `~/.claude-presets/library/claude-md/imported-existing/CLAUDE.md`，并复制 `settings.json` 同目录，meta 标记为「我的现有 CLAUDE.md」
- 扫描 `~/.claude/settings.json` 中的 `mcpServers`：每条 → 写入 `library/mcps/<id>/mcp.json`，meta 标记为「我的现有 MCP」
- 扫描 `~/.claude/skills/*/`：每个目录 → 复制到 `library/skills/<id>/`，meta 标记为「我的现有 skill」

**步骤 2 — 自动生成「当前配置」配方**
- 创建 `~/.claude-presets/recipes/current.json`，引用上述全部导入的库条目
- 标记为「已激活」（因为它就是 `~/.claude/` 实际的反映）

**步骤 3 — 用户落地配方页**
- 看到一张配方卡片：**「我的当前配置」**（含 X 个 skill、Y 个 MCP、CLAUDE.md 摘要、激活中绿点）
- 旁边一栏「**推荐配方**」（暂时按 tag 推 3-5 个，后续可智能化）

整个流程**不写入** `~/.claude/`（因为已经是用户原有内容），首启对外完全透明。

---

## 配方页面（新增）

### 列表态

```
[+ 新建配方]                       [搜索...]

┌──────────────────────────────────────────────────────────┐
│ ✓ 我的当前配置                          [激活中] [编辑]    │
│ 📄 imported CLAUDE.md (3.2KB)                              │
│ ⚡ 4 skills · 🔌 2 MCPs                                    │
│ 全局 · 最近激活 5 分钟前                                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Rust 开发                                  [激活] [编辑]   │
│ 📄 rust-cli · ⚡ 2 skills · 🔌 1 MCP (github)              │
│ 未激活                                                     │
└──────────────────────────────────────────────────────────┘

推荐配方（库存内可拼装）
┌────────────┬────────────┬────────────┐
│ 前端开发    │ 代码审查    │ 文档写作    │
│ 1+3+1      │ 1+2+0      │ 1+2+0      │
└────────────┴────────────┴────────────┘
```

### 编辑态（Recipe Editor）

```
配方名称：[Rust 开发                    ]
描述：　[Rust CLI 项目最佳实践          ]

CLAUDE.md  [选择...]  当前: rust-cli
─────────────────────────────────────
Skills     [+ 添加]
  □ systematic-debugging   [已库存]
  □ tdd                    [已库存]
  □ verification           [需先下载到库]
─────────────────────────────────────
MCPs       [+ 添加]
  □ github  GITHUB_TOKEN: [ghp_xxx____]
─────────────────────────────────────
Settings 覆盖   [展开高级]
  model: [claude-sonnet-4-6 ▾]
  effortLevel: [medium ▾]

[取消]              [保存]  [保存并激活]
```

「+ 添加」打开抽屉：从对应库（Skills/MCP）选已下载的；如果库里没有，按钮提示「→ 去 Skills tab 下载」。

### 激活流程

1. 用户点「激活」 → 弹确认对话框：
   - 显示将写入的文件清单（diff vs 当前 `~/.claude/`）
   - scope 选择（全局 / 某项目）
2. 用户确认 → 备份当前 `~/.claude/` → 按配方写入 → toast 「✓ 已激活 Rust 开发」
3. 列表项左侧出现「✓ 激活中」标记，原激活配方变为「未激活」

---

## 数据模型变化

### 新增类型

```rust
/// 库中的 CLAUDE.md 条目
pub struct ClaudeMdLibraryItem {
    pub id: String,
    pub name: String,
    pub description: String,
    pub source: ItemSource,         // remote | imported | user-created
    pub claude_md_path: PathBuf,    // 库内文件
    pub settings_path: Option<PathBuf>, // 同 dir 的 settings.json（如有）
    pub downloaded_at: String,
}

pub enum ItemSource {
    Remote { repo: String, url: String },  // 来自 registry
    Imported { from: String },              // 从 ~/.claude/ 扫描导入
    UserCreated,                            // 用户手工新建
}

/// 配方
pub struct Recipe {
    pub id: String,
    pub name: String,
    pub description: String,
    pub claude_md: Option<String>,             // library item id
    pub skills: Vec<String>,                    // library item ids
    pub mcps: Vec<RecipeMcpEntry>,
    pub settings_override: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

pub struct RecipeMcpEntry {
    pub library_id: String,
    pub env: HashMap<String, String>,
}

/// 激活记录（替代旧 InstalledState 的 ActivePresetInfo）
pub struct ActiveRecipe {
    pub recipe_id: String,
    pub activated_at: String,
    pub written_files: Vec<String>,
    pub backup_ref: String,
}
```

### Library 文件布局

```
~/.claude-presets/
  library/
    claude-md/
      <id>/CLAUDE.md
      <id>/settings.json (optional)
      <id>/meta.json
    skills/
      <id>/SKILL.md
      <id>/meta.json
    mcps/
      <id>/mcp.json
  recipes/
    <id>.json
  active.json   (which recipe id is active in which scope)
  backups/      (同今)
  cache/        (registry cache, 同今)
```

---

## 关键决策（已锁定）

| 决策 | 结论 |
|------|------|
| Skill / MCP 在配方中 | 引用库 ID（不快照拷贝） |
| settings 覆盖 | 配方可携带 `settings_override`，激活时合并到 settings.json |
| 同时激活 | 全局 1 个 + 每项目 1 个（保留现有行为） |
| 首启 | 空库 + 扫描 `~/.claude/` 自动导入 + 生成「我的当前配置」配方 |
| 现存 5 个内置预设 | 拆解：CLAUDE.md 进 `claude-md` 库；同时生成同名预制配方引用之 |

---

## Critical Experiences

按 product-design 标准识别 2-3 个**做错就毁掉整个产品**的关键体验：

### 1. 首启扫描导入（make-or-break）
**做对的样子**：用户首启 → 看到「我的当前配置」配方已经在那里，含他熟悉的内容（自己的 CLAUDE.md 摘要、自己装过的 skill/MCP），完全没有「这工具要从零开始」的感觉。

**做错的样子**：
- 漏扫某些目录 → 用户觉得「我装的东西没了」
- 重复导入 → 库里出现 2 份相同 skill
- 标记错误 → 把用户原 settings 当成下载的，激活其他配方时强制覆盖丢失

### 2. 激活前的 diff 预览
**做对的样子**：点「激活」前清楚看到「会改掉这些文件 / 新增这些 / 删除这些」+ 「不放心可以一键回滚」。

**做错的样子**：
- 没预览直接生效 → 用户丢失自定义 CLAUDE.md
- diff 太工程化（几千行 JSON）→ 用户看不懂

### 3. 配方编辑器的「补充下载」流
**做对的样子**：用户在配方里勾一个 skill 但库里还没有 → 一个按钮「下载到库」；下载完自动勾上；不用切到 Skills tab。

**做错的样子**：让用户跳到 Skills tab 找 → 下载 → 切回配方 → 重新选；流程断裂。

---

## 不在此次范围

- 配方推荐算法（先按 tag 静态推，后续单独做）
- 配方共享 / 导出导入
- 多人协作 / 团队配方
- 移动端 / Web 版
- 自动检测 `~/.claude/` 的外部修改并提示

---

## 实现顺序建议

1. **数据层**（Rust core）：新增 `library.rs` + `recipes.rs`；`InstalledState` 收敛到 `active.json`
2. **首启扫描**（Rust core）：`importer.rs` 增加 `scan_existing_claude_dir`
3. **激活流程改造**（Rust core）：`activate_recipe(recipe_id, scope)` 替代 `activate_preset`
4. **Tauri 命令层**：list_recipes / get_recipe / save_recipe / activate_recipe / scan_existing
5. **前端配方页**（新页面 + Editor）
6. **现有 3 catalog 改语义**：「安装」按钮文案改成「下载到库」，逻辑只写库不动 `~/.claude/`
7. **已安装页改造**：显示当前激活的配方
8. **数据迁移**：既有 `installed.json` / 5 个 seed preset → 新模型
