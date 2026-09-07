---
name: organize
license: MIT
description: >-
  Repository structure only: directory layout, file placement, naming
  conventions, and where-does-this-belong decisions. Detects the project's
  convention, audits files against it, and executes move plans with
  import-path updates. Never changes code inside files beyond the import
  updates a move forces; in-file restructuring is /refactor.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - organize
  - directory structure
  - folder structure
  - project structure
  - file organization
  - organize directories
  - organize files
  - cleanup directories
  - directory convention
  - where should this go
  - messy project
last-updated: 2026-06-11
---
# /organize —— 仓库结构

## 定位说明

**使用场景：**决定某个文件应放在何处、依据项目约定审计文件的摆放位置、执行命名约定排查，或移动文件以使目录树与声明的布局保持一致。

**不适用场景：**你需要代码关系的结构图（使用 `/map`）、需要修改文件内部的代码（使用 `/refactor`）、需要清理磁盘或构建产物（使用 `/houseclean`），或需要执行某个已知的单一移动操作（使用 `/refactor move`）。

## 与 /refactor 的边界

/organize 改变文件的位置和命名。在文件内部更改代码结构（提取、内联、拆分函数或组件、重命名符号）属于 /refactor。/organize 唯一会做的文件内编辑，是移动或重命名所迫的导入路径更新。如果审计发现某个文件应当拆分或合并，建议使用 /refactor；不要在这里处理。

## 命令

| 命令 | 行为 |
|---|---|
| `/organize` | 检测约定、审计摆放位置、提出并执行移动计划 |
| `/organize --audit` | 对照清单检查当前文件，仅报告违规项 |
| `/organize --show` | 显示当前的组织清单 |
| `/organize --lock` | 设置 `locked: true`，使强制执行钩子阻止违规 |
| `/organize --unlock` | 设置 `locked: false`，使强制执行仅具建议性 |
| `/organize where does {file} go` | 单一摆放决策，不进行完整审计 |

## 协议

### 第 1 步：CHECK

读取 `.claude/harness.json`。如果存在 `organization` 键，则使用其约定和摆放规则；在不带参数运行 `/organize` 时，询问是要审计、调整规则还是重新配置。如果不存在该键，继续第 2 步。

### 第 2 步：DETECT

使用 **Glob 工具**（而非 `find` 或 `Get-ChildItem`）来发现目录。过滤掉 `node_modules`、`.git`、`.planning`、`.citadel`、`.claude`、`dist`、`build`、`__pycache__`、`.next`、`target`、`.venv`、`venv`。上限为 200 个目录；若超过，则仅扫描最上面 3 层。

约定信号：
- `src/components/`、`src/hooks/`、`src/utils/` -> **layer-based**
- `src/features/auth/`、`src/features/dashboard/` -> **feature-based**
- `src/auth/components/`、`src/auth/hooks/` -> **hybrid**
- 扁平的 `src/` 且无子目录 -> **flat**
- 信号混杂 -> **custom**（询问用户采用哪种约定）

记录：约定、置信度（高/中/低）、各根目录及其用途、异常项。

### 第 3 步：AUDIT

对照摆放规则（如有清单则使用清单，否则使用检测到的约定）检查每个源文件。同时检查命名：破坏同级文件主流大小写或后缀模式的文件或目录。

```
=== Structure Audit: {project} ===
Convention: {convention} ({confidence})
Compliant: {N}/{M} source files
Violations:
  {current_path} -> {expected_path} ({rule broken})
Naming:
  {path}: {issue}
```

### 第 4 步：PLAN

在改动任何内容之前，为每个违规项构建移动计划：源路径 -> 目标路径、每一个导入路径需要变更的导入方，以及需要更新再导出的 barrel/index 文件。仅做移动和重命名；绝不删除含有内容的文件。呈现计划并等待确认。

### 第 5 步：APPLY

执行已确认的移动，更新所有引用被移动文件的导入路径，更新 barrel 文件，然后运行项目的类型检查命令（来自 harness.json）。不允许出现任何新错误。如果某次移动因导入路径以外的原因未通过类型检查，则回退该单个移动并标记该文件，而不是编辑其代码。

### 第 6 步：CONFIGURE

首次运行或重新配置时，将 `organization` 键写入 harness.json。采用读-改-写方式：保留所有其他键，并保留此技能不再管理的任何既有 `dynamic`/`cleanupPolicy` 条目。

```json
{
  "organization": {
    "convention": "layer",
    "roots": { "src": { "purpose": "application source" } },
    "placement": [
      { "glob": "*.test.{ts,tsx}", "rule": "colocated", "target": null, "reason": "tests live next to source" }
    ],
    "locked": false
  }
}
```

规则类型：`colocated`、`sibling-dir`、`root-dir`、`within-root`。初始设置 `locked: false`；`/organize --lock` 通过 organize-enforce 钩子开启阻止式强制执行。

## 边缘情况

- **未发现目录 / 空项目：**建议采用 flat 约定；没有可审计的内容。
- **Monorepo（多个 package.json）：**分别扫描每个包的根目录；询问规则是按包设定还是全仓库统一。
- **harness.json 缺失：**依据检测到的约定以建议模式进行审计；提议创建清单。
- **用户更改约定：**以将要移动的文件数量发出警告。未经明确确认，绝不批量移动。
- **与 `protectedFiles` 冲突：**如果受保护文件与摆放规则冲突，发出警告并询问以哪个为准。

## 情境门控

**披露：**“正在审计仓库结构。移动仅在你确认计划后才会执行。”
**可逆性：**amber——文件移动与导入路径更新；提交前可用 `git checkout -- .` 撤销，提交后可用 `git revert` 撤销。
**信任门控：**任意级别：可执行检测和审计。熟悉（5 次以上会话）：已确认的移动计划可自主执行。

## 质量门控

- [ ] 在给出任何审计结论之前，已检测或从清单读取约定
- [ ] 每个违规项均列出当前路径、预期路径及其违反的规则
- [ ] 在移动任何文件之前，已呈现移动计划并获得确认
- [ ] 除导入路径更新外，不做任何文件内代码编辑；拆分/提取需求转交 /refactor 处理
- [ ] 移动后类型检查通过（零新错误）
- [ ] 写入 harness.json 时保留 `organization` 之外的所有键

## 退出协议

```
---HANDOFF---
- Structure: {convention}; {compliant}/{total} files compliant after changes
- Moves: {N} files moved, {M} import paths updated, 0 in-file refactors
- Deferred to /refactor: {split/extract recommendations, or "none"}
- Enforcement: {"advisory (unlocked)" | "blocking (locked)"}
- Reversibility: amber -- undo moves with git checkout/revert
---
```
