---
name: setup
description: Get a new developer up and running with the Chops codebase — prerequisites, build, architecture, and common tasks.
---
搭建 Chops 开发环境，并帮助新贡献者熟悉代码库。

## 操作说明

### 第 1 步：检查前置条件

验证以下各项是否已安装。如果缺少任何一项，告知用户需要安装什么并停止。

1. **macOS 15+** — `sw_vers -productVersion`（必须 ≥ 15.0）
2. **Xcode 命令行工具** — `xcode-select -p`（如缺失：`xcode-select --install`）
3. **Homebrew** — `which brew`（如缺失：引导用户访问 https://brew.sh）
4. **xcodegen** — `which xcodegen`（如缺失：`brew install xcodegen`）

### 第 2 步：生成 Xcode 项目

```bash
xcodegen generate
```

此命令会读取 `project.yml`（所有 Xcode 项目设置的唯一可信来源）并生成 `Chops.xcodeproj`。每当 `project.yml` 发生变化时都重新运行此命令。切勿直接编辑 `.xcodeproj`。

### 第 3 步：构建并运行

```bash
xcodebuild -scheme Chops -configuration Debug build
```

或者在 Xcode 中打开并按 Cmd+R：

```bash
open Chops.xcodeproj
```

### 第 4 步：引导开发者熟悉项目

分享以下架构概览：

**入口：** `Chops/App/ChopsApp.swift` — 设置 SwiftData ModelContainer（Skill + SkillCollection），启动 Sparkle 更新器，将 AppState 注入环境。

**状态：** `Chops/App/AppState.swift` — `@Observable` 单例，保存 UI 状态（所选工具、所选技能、搜索文本、侧边栏筛选条件）。

**模型（SwiftData）：**
- `Chops/Models/Skill.swift` — 一个已发现的技能文件，通过解析后的符号链接路径唯一标识
- `Chops/Models/Collection.swift` — 用户创建的技能分组
- `Chops/Models/ToolSource.swift` — 受支持工具的枚举，包含显示名称、图标、颜色和文件系统路径

**服务：**
- `Chops/Services/SkillScanner.swift` — 探测工具目录，解析 frontmatter，并以 upsert 方式写入 SwiftData。通过解析后的符号链接路径去重。
- `Chops/Services/FileWatcher.swift` — 通过 DispatchSource 使用 FSEvents，在文件变化时触发重新扫描
- `Chops/Services/SkillParser.swift` — 分发给 FrontmatterParser（.md）或 MDCParser（.mdc）
- `Chops/Services/SearchService.swift` — 内存中的全文搜索

**视图：** 三栏 NavigationSplitView（侧边栏 → 列表 → 详情）。编辑器封装 NSTextView 以实现原生文本编辑。通过 FocusedValues 实现 Cmd+S 保存。

**关键设计决策：**
- 无沙盒 — 应用需要不受限制的文件系统访问权限，以读取 ~/ 下各处的点文件
- 符号链接去重 — 多个工具目录中的同一文件会显示为一个带有多个工具徽章的技能
- 无测试套件 — 通过构建、运行和观察来手动验证

**扫描的工具路径：**

| 工具 | 路径 |
|------|-------|
| Claude Code | `~/.claude/skills/`, `~/.agents/skills` |
| Cursor | `~/.cursor/skills/`, `~/.cursor/rules` |
| Windsurf | `~/.codeium/windsurf/memories/`, `~/.windsurf/rules` |
| Codex | `~/.codex` |
| Amp | `~/.config/amp` |

Copilot 和 Aider 仅检测项目级技能（无全局路径）。

## 需要了解的常见任务

**添加新工具：** 在 `Chops/Models/ToolSource.swift` 的 `ToolSource` 枚举中添加一个 case。填写 `displayName`、`iconName`、`color`、`globalPaths`。如果该工具使用非标准文件布局，请更新 `SkillScanner`。

**修改解析逻辑：** Frontmatter → `Chops/Utilities/FrontmatterParser.swift`。Cursor .mdc → `Chops/Utilities/MDCParser.swift`。分发逻辑 → `Chops/Services/SkillParser.swift`。

**修改 UI：** 视图位于 `Chops/Views/`（Sidebar/、Detail/、Settings/、Shared/）。主布局为 `Chops/App/ContentView.swift`。

## 重要规则

- `project.yml` 是 Xcode 设置的唯一可信来源 — 切勿直接编辑 `.xcodeproj`
- Sparkle（自动更新）是唯一的外部依赖 — 通过 SPM 自动拉取
- 没有测试套件 — 务必通过手动构建并运行应用来验证改动
- 应用在无沙盒模式下运行 — 这是有意为之且必需的
