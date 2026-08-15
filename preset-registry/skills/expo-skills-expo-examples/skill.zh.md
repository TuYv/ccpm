---
name: expo-examples
description: Framework (OSS). Expo's official example projects - the expo/examples repo of ~70 `with-*` integrations (Stripe, Clerk, Supabase, OpenAI, maps, Reanimated, SQLite, Skia, NativeWind, and more). Use when integrating a third-party library or service into an existing Expo app and you want the canonical, version-matched pattern to adapt, or when scaffolding a new project from one with `npx create-expo --example`.
allowed-tools: "Read,Bash(gh api:*),Bash(git clone:*),Bash(npx create-expo:*),Bash(npx degit:*),Bash(bun create:*)"
version: 1.0.0
license: MIT
---
# Expo 示例

[expo/examples](https://github.com/expo/examples) 是 Expo 官方维护的库，包含约 70 个**集成示例**——目录以 `with-<library>` 命名（例如 `with-stripe`、`with-maps`），每个示例都围绕**一个**库或服务构建。这些并非完整应用：它们是**托管式**项目（没有 `ios/`/`android/` 目录——原生配置通过配置插件完成），典型示例仅包含**一个约 100–200 行代码的单一界面**。应从中挖掘规范的集成*模式*——依赖项集合、`app.json` 配置插件，以及 Expo 针对当前 SDK 维护的最小接线代码——并将其适配到用户的应用中。不要指望直接从中提取完整的应用架构。

在手动编写集成方案之前，应优先查找现有示例。（完整栈、功能展示、启动模板等类型见 `./references/catalog.md`。）

## 两种模式

1. **参考 / 适配**（最常见）——用户已经有一个项目。找到匹配的示例，阅读其中的关键文件，并将其*模式*应用到用户的代码中。
2. **搭建项目**——适用于全新项目。直接以示例为基础启动一个新项目。

## 工作流程

### 1. 找到合适的示例

将用户的需求映射到对应的示例名称（例如支付 → `with-stripe`，身份验证 → `with-clerk`）。`./references/catalog.md` 是按类别整理的快照，可用于快速筛选——但它可能会过时，因此还需对照实时列表进行确认：

```bash
# Live example names:
gh api repos/expo/examples/contents --jq '.[] | select(.type=="dir" and (.name|startswith(".")|not)) | .name'
# Aliases (renamed) + deprecated (dead/moved) examples — check before recommending:
gh api repos/expo/examples/contents/meta.json --jq '.content' | base64 -d
```

对于哪些示例已重命名或失效，`meta.json` 是事实依据（已弃用的示例会从仓库目录树中移除，但仍会列在此处，并且每个示例都有一条 `message`）。如果某个示例位于其 `deprecated` 映射中，请勿推荐该示例——应根据 `message` 转到新的路径。如果它位于 `aliases` 中，请使用 `destination`。

### 2a. 参考模式——在不改动用户项目的情况下研究示例

最常见的情况是：用户已经有一个应用，并希望了解 Expo 如何实现某项功能。将示例作为**参考**进行阅读，并手动应用其中的模式——绝不要在用户的项目之上搭建示例。

**首先，通过一次调用列出整个示例。** 集成代码通常位于嵌套目录中（例如 Stripe 的服务器路由位于 `app/api/`），因此只列出一层目录会遗漏重要文件：

```bash
gh api 'repos/expo/examples/git/trees/master?recursive=1' \
  --jq '.tree[].path | select(startswith("with-stripe/"))'
```

**然后优先阅读信息密度高的文件：**`README.md`（配置步骤）→ `package.json`（依赖项）→ `app.json`（配置插件 / 权限）→ 清单中显示的集成代码 → `.env`（必需的密钥）。读取单个文件时：

```bash
gh api repos/expo/examples/contents/with-stripe/utils/stripe-server.ts --jq '.content' | base64 -d
# No gh? Raw URL (branch is master):
curl -s https://raw.githubusercontent.com/expo/examples/master/with-stripe/utils/stripe-server.ts
```

**需要读取多个文件？** 许多集成都分散在服务器路由、客户端提供器和配置中（Stripe 就是如此）。跳过逐文件调用——将整个示例拉取到一个**临时目录或被 git 忽略的目录（不得位于用户项目中）**，然后使用 Grep/Read 自由读取，再手动应用：

```bash
npx degit expo/examples/with-stripe /tmp/expo-ref/with-stripe   # clean copy, no git history
# fallback without degit (sparse-checkout, no full ~64 MB clone):
git clone --depth 1 --filter=blob:none --sparse https://github.com/expo/examples.git /tmp/expo-ref/examples \
  && (cd /tmp/expo-ref/examples && git sparse-checkout set with-stripe)
```

在那里使用 Grep/Read 读取；完成后删除临时目录。

### 2b. 脚手架模式——基于示例创建新项目

```bash
npx create-expo --example with-stripe   # short form:  npx create-expo -e with-stripe
bun create expo --example with-stripe    # with bun
```

### 3. 以非破坏性方式适配到用户的应用中（关键）

当用户已经有应用时，**只添加示例引入的内容；绝不要覆盖他们的现有设置。**

- **对齐版本——不要复制固定版本。** 示例会跟进**最新** SDK，因此其 `package.json` 中固定的版本不会与旧项目匹配。只使用 `npx expo install <pkg>` 添加*缺失的*依赖（它会解析出与 SDK 匹配的版本），而不是复制确切版本。
- **合并配置，不要替换配置。** 只添加示例引入且用户尚未配置的 `app.json`/`app.config.*` 插件和权限——完整保留用户现有的配置块。
- **移植集成代码。**
- **根据示例的 `.env` 结构重新创建环境变量**——其中只有占位符，绝不包含可用的密钥。

当集成代码已经完成移植，并且用户应用中已涵盖其所需的每项依赖、配置插件、权限和环境变量时，才算**完成**——仅仅*看起来*已连接并不算完成。

## 注意事项

- **默认分支是 `master`，**而不是 `main`（这会影响原始文件 URL 和稀疏检出）。
- **一键部署。** 每个示例都有一个启动 URL：`https://launch.expo.dev/?github=https://github.com/expo/examples/tree/master/<example>`。

## 相关技能

- Tailwind / NativeWind 样式 → `expo-tailwind-setup`
- 原生 UI 组件（@expo/ui 包）→ `expo-ui`
- 样式设计和具有原生观感的屏幕 → `expo-native-ui`
- 导航和路由 → `expo-router`
- 编写原生模块 → `expo-module`
- 在采用最新 SDK 的示例之前升级 SDK → `expo-upgrade`

## 参考资料

- `./references/catalog.md`——示例库的分类快照，用于快速筛选。

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-examples" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供所有相关上下文。
如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。