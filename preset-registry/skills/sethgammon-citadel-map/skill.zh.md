---
name: map
license: MIT
description: >-
  Structural codebase index generator. Builds a compact JSON map of files,
  exports, imports, dependency graph, and roles. Queryable by keyword. Injected
  into fleet agents as context slices to reduce token usage on code navigation.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - map
  - index codebase
  - codebase map
  - structural index
  - scan codebase
  - map stats
  - map query
last-updated: 2026-03-29
---
# /map —— 代码库智能

## 使用场景

在以下情况使用 `/map`：
- 开始在一个不熟悉的代码库上工作时（先构建索引）
- 某个 fleet 或 archon 活动需要 agent 知道“哪些文件对 X 重要”
- 你想快速了解结构概览（统计信息、角色、依赖图）
- 你需要找到与某个关键词相关的文件，而无需进行探索性读取

以下情况请勿使用 `/map`：
- 读取文件内容（使用 Read）
- 在文件内搜索字符串模式（使用 Grep）
- 已知路径的单文件编辑

## 命令

| 命令 | 行为 |
|---|---|
| `/map` | 生成或刷新索引（若缓存仍然新鲜则跳过） |
| `/map --force` | 即使缓存仍然新鲜也重建索引 |
| `/map query <terms>` | 在索引中搜索匹配关键词的文件 |
| `/map stats` | 打印摘要统计（文件数、行数、语言、角色） |
| `/map slice <terms>` | 输出用于 agent 注入的紧凑上下文切片 |
| `/map stale` | 检测已索引源文件的新增、更改或删除 |

## 协议

### 步骤 1：生成索引

运行索引生成器：

```bash
node scripts/map-index.js --generate --root .
```

如果用户要求全新重建，或索引已过期，则添加 `--force`。

生成器会：
1. 遍历项目树（遵循 `.gitignore`，跳过 `node_modules`、`dist` 等）
2. 从每个源文件中提取导出、导入和符号
3. 为每个文件推断角色（组件、hook、store、路由、测试、配置等）
4. 根据解析后的导入路径构建依赖图
5. 记录每个文件的 SHA-256 哈希以及整个索引的源签名
6. 提取类路由路径和包验证脚本
7. 将索引写入 `.planning/map/index.json`

**支持的语言：**TypeScript、JavaScript、Python、Go、Rust。

**缓存行为：**索引缓存 5 分钟。在该时间窗口内的后续运行会立即退出，除非传入 `--force`。

如果 `.planning/map/` 不存在，生成器会自动创建它。

### 步骤 2：查询（当用户提供搜索词时）

```bash
node scripts/map-index.js --query "<terms>"
```

查询引擎按以下方式为文件评分：
- 路径匹配：每个词 +3
- 导出匹配：每个词 +5
- 符号匹配：每个词 +2
- 角色匹配：每个词 +1

结果按分数排序，上限为 20 个文件（可通过 `--max-files` 配置）。输出的预算上限为 8000 个字符，以确保注入安全。

### 步骤 3：统计（结构概览）

```bash
node scripts/map-index.js --stats
```

输出：文件数、行数、导出数、依赖边数、路由数、包脚本数、验证命令数、按语言的分布，以及按角色的分布。

### 步骤 4：切片（agent 上下文注入）

当其他技能或编排器需要用于 agent 注入的地图切片时：

1. 运行 `node scripts/map-index.js --slice "<scope terms>" --max-files 15`
2. 注入生成的紧凑块：

```
=== MAP SLICE: <terms> ===
Generated: <timestamp>
Verification: npm run test | npm run typecheck
<score> <role>  <path>  [<top exports>]  (<lines>L)
...
=== END MAP SLICE ===
```

3. 调用方技能将此块与 CLAUDE.md 和 rules-summary.md 一起注入到
   agent 的提示中

**Token 预算：**15 个文件的切片通常为 800-1200 个 token。这取代了 agent 本来需要花费 2000-5000 个 token 进行探索性 Glob/Grep 才能找到相关文件的开销。

### 步骤 5：过期检查

在将现有地图注入到长期运行的活动中之前，请运行：

```bash
node scripts/map-index.js --stale
```

当地图为最新状态时，命令以 `0` 退出；当已索引的源文件被新增、更改或删除时，以 `2` 退出。使用以下命令刷新：

```bash
node scripts/map-index.js --generate --force --root .
```

## Fleet 集成

当 `/map` 索引存在时，Fleet agent 会自动接收地图切片：

1. 在启动每一波之前，Fleet 会检查 `.planning/map/index.json` 是否存在
2. 如果存在：Fleet 会运行一个以每个 agent 被分配领域为范围的切片
3. 生成的切片会与 CLAUDE.md 和 rules-summary.md 一起前置到 agent 的上下文中
4. 如果索引不存在：Fleet 在没有地图切片的情况下继续（不会报错）

**上下文注入顺序：**
1. CLAUDE.md 内容
2. `.claude/agent-context/rules-summary.md`
3. **地图切片**（限定于 agent 的领域/方向）
4. 活动特定的方向和范围
5. 来自之前各波次的发现简报

## 情境门控

**披露：**“正在生成代码库地图。将创建 `.planning/map/index.json`。”
**可逆性：**绿色 —— 仅创建 `.planning/map/index.json`；通过删除 `.planning/map/` 来撤销。
**信任门控：**
- 任意：生成索引、查询、统计、切片。

## 质量门控

- 索引必须在任何受支持的项目上无错误地生成
- 查询必须返回按相关性分数排序的结果
- 统计输出必须能在 5 秒内被人工快速浏览
- 对于 15 个文件的结果，切片输出必须保持在 2000 个 token 以下
- 索引必须能处理 10 万行以上的仓库而不挂起（迭代式遍历器，无递归限制）
- 缓存必须在 TTL 窗口内防止冗余重新生成
- 过期检查必须能检测已索引源文件的新增、更改和删除
- 当包脚本存在时，切片输出必须包含相关的验证命令

## 边缘情况

- **未找到源文件**：生成器写入空索引（`fileCount: 0`）。查询不返回结果。这不是错误。
- **`.planning/` 不存在**：生成器通过 `mkdirSync({ recursive: true })` 自动创建 `.planning/map/`。
- **查询时索引文件缺失**：错误消息："Index not found. Run `node scripts/map-index.js --generate` first."
- **二进制文件或不支持的文件**：静默跳过。只有具有可识别语言扩展名的文件才会被索引。
- **超大仓库（1 万个以上文件）**：遍历器是迭代式的（基于栈），而非递归。无栈溢出风险。首次运行可能需要 5-10 秒。
- **Windows 路径**：所有存储的路径都使用正斜杠，以保持跨平台一致性。

## 退出协议

生成后：
```
Index written: <path>
  <file count> files, <edge count> dependency links
  <route count> routes, <verification command count> verification commands
```

查询后：
```
Results for "<terms>" (<count> matches):
  Score  Role        Path
  -----------------------------------------------
  <results>
```

统计后：打印完整的统计信息块。

切片后：输出已格式化、可直接注入的切片块。

过期检查后：
```
Map index is current.
```

或：

```
Map index is stale.
Changed: <paths>
Added: <paths>
Removed: <paths>
```

可逆性：绿色 —— 删除 `.planning/map/` 即可移除所有生成的产物；不会修改任何源文件。
