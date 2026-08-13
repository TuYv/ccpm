---
name: claude-md-dependency-rescan
description: Re-detect this project's tech stack from package.json / requirements.txt / pyproject.toml / go.mod / Cargo.toml and diff it against the Tech Stack section of every CLAUDE.md. Read-only — returns added / removed / renamed dependencies, never edits.
when_to_use: |
  Use when the user asks "is my Tech Stack section up to date?", "what deps changed?",
  "rescan my dependencies", after dependency upgrades, or as part of /sync-claude-md --weekly.
argument-hint: "[manifest-path]"
context: fork
agent: Explore
allowed-tools:
  - Read
  - Glob
  - Grep
  - "Bash(find:*)"
  - "Bash(cat:*)"
disable-model-invocation: false
---
# CLAUDE.md 依赖项重新扫描（派生，只读）

可选的显式清单：`$ARGUMENTS`（默认：自动检测全部五种清单类型）。

按顺序执行以下步骤。不要修改任何文件。

1. **检测清单。** 在仓库根目录及其下一层目录（工作区/单体仓库）中查找 `package.json`、`requirements.txt`、`pyproject.toml`、`go.mod`、`Cargo.toml`。
2. **从每个清单中提取声明的依赖项**：
   - `package.json` → `dependencies` 和 `devDependencies` 的键（忽略版本）。
   - `requirements.txt` → 每个非注释行的第一个词元。
   - `pyproject.toml` → `[project.dependencies]` / `[tool.poetry.dependencies]` 的键。
   - `go.mod` → `require (...)` 下的模块路径。
   - `Cargo.toml` → `[dependencies]` / `[dev-dependencies]` 下的键。
3. **盘点文档中记录的依赖项**，检查每个 `CLAUDE.md`（以及 `.claude/rules/*.md`）：搜索技术栈/依赖项章节及其下方的列表。
4. **为每个文件计算三个集合：**
   - `added`：存在于清单中，但此 CLAUDE.md 中没有。
   - `removed`：记录在此 CLAUDE.md 中，但清单中没有。
   - `renamed`：文档中有记录且存在于清单中，但拼写不同（`react-router` 与 `react-router-dom`、`pg` 与 `psycopg2`）。
5. **返回**以下精确格式：

```
## Dependency Rescan

Manifests detected: <list>
Total declared deps: <count>

### Per file
#### <path-to-CLAUDE.md>
- Added (in manifest, not documented): <list or "none">
- Removed (documented, not in manifest): <list or "none">
- Renamed / aliased: <list or "none">
```

6. 如果每组文档记录的依赖项都与其清单匹配，则精确返回 `## Dependency Rescan\n\nAll documented deps match manifests. <M> files inspected.`。不要添加多余内容。

**硬性规则**：不要提出具体的编辑建议——只需呈现差异。由 `/sync-claude-md` 决定是否写入这些差异。