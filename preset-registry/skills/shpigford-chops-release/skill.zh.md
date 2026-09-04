---
name: release
description: Determine the next version, update the marketing site, and run the full release pipeline.
---
发布 Chops 的新版本。根据 git 历史确定版本号，更新营销网站，并运行发布脚本。

## Instructions

### 步骤 1：验证前置条件

1. 确认项目根目录下存在 `.env`。如果不存在，停止并告诉用户：
   “缺少 `.env` 文件。请将 `.env.example` 复制为 `.env`，并填入 APPLE_TEAM_ID、APPLE_ID 和 SIGNING_IDENTITY_NAME。”
2. 确认 notarytool 钥匙串配置 `AC_PASSWORD` 可用：
   ```bash
   xcrun notarytool history --keychain-profile "AC_PASSWORD" >/dev/null 2>&1
   ```
   如果失败，停止并让用户运行：
   ```bash
   xcrun notarytool store-credentials "AC_PASSWORD" --apple-id "<APPLE_ID>" --team-id "<TEAM_ID>" --password "<app-specific-password>"
   ```
3. 确认工作树是干净的（`git status --porcelain`）。如果有未提交的更改，停止并让用户先提交或暂存。
4. 确认当前在 `main` 分支上。如果不在，停止并让用户先切换到 `main`。

### 步骤 2：确定下一个版本号

1. 获取最新的 tag：
   ```bash
   git tag -l 'v*' | sort -V | tail -1
   ```
2. 获取自该 tag 以来的提交：
   ```bash
   git log <latest_tag>..HEAD --oneline --format='%s'
   ```
3. 如果自上一个 tag 以来没有任何提交，停止并告诉用户没有可发布的内容。
4. 对当前最新版本应用 semver 规则：
   - 如果任何提交信息以 `feat:` 或 `feat(` 开头 → **minor** 版本升级（例如 1.1.0 → 1.2.0）
   - 如果所有提交都是 `fix:`、`chore:`、`docs:` 或类似类型 → **patch** 版本升级（例如 1.1.0 → 1.1.1）
   - 如果任何提交包含 `BREAKING CHANGE` 或使用了 `!:` 后缀 → 询问用户应使用哪个版本号
   - 如果提交信息含义模糊或未遵循约定式提交（conventional commits），使用 `mcp__conductor__AskUserQuestion` 询问：
     - question: "自上次发布以来的提交无法明确表明版本变化。本次发布应使用哪个版本号？"
     - header: “发布版本号”
     - multiSelect: false
     - 带有如下标签的选项："Patch (X.Y.Z+1)"、"Minor (X.Y+1.0)"、"Major (X+1.0.0)"、"Custom"

### 步骤 3：确认版本号

在继续之前务必确认版本号。使用 `mcp__conductor__AskUserQuestion`：
- question: "以 v<VERSION> 发布？包含的提交：\n<commit list>"
- header: “确认发布”
- multiSelect: false
- options:
  - “是，发布 v<VERSION>"
  - "使用其他版本号”
  - “取消”

如果用户选择“使用其他版本号”，询问其版本号。如果用户选择“取消”，则停止。

### 步骤 3.5：更新 CHANGELOG.md

1. 检查 `CHANGELOG.md` 是否有包含内容（列表项）的 `## [Unreleased]` 小节。
2. 如果 `## [Unreleased]` 小节为空或不存在，根据自上一个 tag 以来的提交起草条目：
   - **以面向用户的视角改写每个条目。**不要照搬提交信息。从用户的角度描述变化——它带来了什么能力、修复了什么问题或改进了什么。
   - 反例："feat: add skills registry browser with multi-agent install"
   - 正例："直接在应用中浏览并安装社区技能"
   - 条目保持简洁（每条一行）。不使用技术术语，不带提交前缀。
   - 使用 `mcp__conductor__AskUserQuestion` 与用户确认起草的条目。
3. 将 `## [Unreleased]` 重命名为 `## [VERSION] - YYYY-MM-DD`（今天的日期）。
4. 在其上方添加一个新的空 `## [Unreleased]` 小节。

### 步骤 4：更新营销网站的版本号

1. 编辑 `site/src/pages/index.astro`。找到包含 `class="requires"` 的那一行，并将其替换为：
   ```html
   <p class="requires">v<VERSION> &middot; Requires macOS Sequoia</p>
   ```
   其中 `<VERSION>` 是已确认的版本号。
2. 将此更改与更新日志一起提交：
   ```bash
   git add site/src/pages/index.astro CHANGELOG.md
   git commit -m "chore: update site version to v<VERSION>"
   git push
   ```

### 步骤 5：运行发布脚本

```bash
./scripts/release.sh <VERSION>
```

该脚本会处理：xcodegen → archive → export → DMG → notarize → staple → git tag → appcast → push → GitHub Release。

让它运行完毕。如果失败，向用户报告错误输出并停止。不要自动重试。

### 步骤 6：推送并汇报

确保所有提交都已在远程仓库：
```bash
git push
```

告诉用户：
- 本次发布的版本号
- 链接：`https://github.com/Shpigford/chops/releases/tag/v<VERSION>`
- 提醒用户如有需要，部署营销网站（从 `site/` 目录运行 `npm run build`）

## 重要规则

- 在继续之前，务必与用户确认版本号
- 当 `.env` 缺失或工作树不干净时，绝不运行发布脚本
- 绝不跳过营销网站的版本号更新
- 如果发布脚本失败，不要重试——报告错误并停止
- 发布脚本会处理 git 打标签和 GitHub release 的创建——不要重复这些步骤
