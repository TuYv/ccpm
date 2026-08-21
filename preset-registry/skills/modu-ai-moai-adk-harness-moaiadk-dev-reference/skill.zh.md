---
name: harness-moaiadk-dev-reference
description: moai-adk-go local dev reference — version management/release process (sec 5), shell-script hook development (sec 7), build & dev commands (sec 10). Load only when performing these specific tasks.
---
# harness-moaiadk-dev-reference

> moai-adk-go 本地开发参考资料 — 将 `CLAUDE.local.md` §5/§7/§10 中针对具体工作的详细内容迁移至此（延迟加载）。这些参考资料无需在每个会话中加载。用于减少始终加载的上下文。
> 所属：`harness-*` 命名空间（用户所有，`moai update` 时保留 — CLAUDE.local.md §24）。禁止镜像到模板。

---

## 版本管理（来自 CLAUDE.local.md §5）

### 单一事实来源

- [HARD] `go.mod` 模块版本 + git 标签是权威来源
- [HARD] `pkg/version/version.go` 在构建时从 git 标签读取版本

**版本参考：**
- 权威来源：Git 标签（例如 `v1.0.0`）
- 运行时访问：通过 `git describe` 访问 `pkg/version/version.go`
- 配置显示：`.moai/config/sections/system.yaml`（由发布流程更新）

### 构建版本注入

构建时使用 ldflags 注入版本：

```bash
# Build with version injection
go build -ldflags="-X github.com/modu-ai/moai-adk/pkg/version.Version=v1.0.0"

# Makefile handles this automatically
make build VERSION=1.0.0
```

### 需要同步版本的文件

发布新版本时，请更新：

**文档文件：**
- README.md（版本行）
- README.ko.md（版本行）
- CHANGELOG.md（新版本条目）

**配置文件：**
- .moai/config/sections/system.yaml（moai.version）
- internal/template/templates/.moai/config/config.yaml（moai.version）

### 发布流程

1. 在 CHANGELOG.md 中添加新版本条目
2. 创建 git 标签：`git tag v1.0.0`
3. 推送标签：`git push origin v1.0.0`
4. 构建发布二进制文件：`make release VERSION=1.0.0`

---

## Hook 开发（来自 CLAUDE.local.md §7）

### [HARD] 仅使用 Shell 脚本 Hook

moai-adk-go 使用 shell 脚本实现 hook，而不是 Python：

**Hook 包装脚本模式：**
```bash
#!/bin/bash
# .claude/hooks/moai/handle-session-start.sh

# Read stdin JSON from Claude Code
INPUT=$(cat)

# Call moai binary with hook subcommand
moai hook session-start <<< "$INPUT"
```

**使用 Shell 脚本的原因：**
- 执行速度更快（没有 Python 启动开销）
- 始终可用（不依赖 uv/python）
- 跨平台（bash、/bin/sh）

### Hook 命令格式

**settings.json hook 配置：**
```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/moai/handle-session-start.sh\"",
        "timeout": 5
      }]
    }]
  }
}
```

**关键规则：**
- [HARD] 始终为 `$CLAUDE_PROJECT_DIR` 添加引号：`"$CLAUDE_PROJECT_DIR"`
- [HARD] 使用 hook 包装脚本的完整路径
- [HARD] 设置适当的超时时间。MoAI 策略默认值为 5 秒（Claude Code 平台的默认值为 10 分钟；MoAI 将其收紧至 5 秒，以避免会话停滞）。

### 平台差异

**macOS/Linux：**
```json
"command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/moai/hook.sh\""
```

**Windows：**
```json
"command": "\"%CLAUDE_PROJECT_DIR%\\.claude\\hooks\\moai\\hook.sh\""
```

---

## 构建与开发命令（来自 CLAUDE.local.md §10）

### 常用命令

```bash
# Build the project
make build

# Run tests
make test

# Run with race detection
make test-race

# Run linter
make lint

# Format code
make fmt

# Install locally
make install

# Clean build artifacts
make clean

# Run go fix modernizers
make fix
```

### 开发工作流

```bash
# 1. Edit templates
vim internal/template/templates/.claude/skills/moai/SKILL.md

# 2. Regenerate embedded files
make build

# 3. Run tests
go test ./internal/template/...

# 4. Test locally
./moai init test-project

# 5. Commit
git add internal/template/templates/
git commit -m "feat(template): update SKILL.md"
```