---
name: expo-examples
description: Framework (OSS). Expo's official example projects - the expo/examples repo of ~70 `with-*` integrations (Stripe, Clerk, Supabase, OpenAI, maps, Reanimated, SQLite, Skia, NativeWind, and more). Use when integrating a third-party library or service into an existing Expo app and you want the canonical, version-matched pattern to adapt, or when scaffolding a new project from one with `npx create-expo --example`.
allowed-tools: "Read,Bash(gh api:*),Bash(git clone:*),Bash(npx create-expo:*),Bash(npx degit:*),Bash(bun create:*)"
version: 1.0.0
license: MIT
---
# Expo 示例

[expo/examples](https://github.com/expo/examples) 是 Expo 官方维护的、包含约 70 个**集成示例**的库——其中的目录名为 `with-<library>`（例如 `with-stripe`、`with-maps`），每个目录都围绕**一个**库或服务构建。这些不是完整应用：它们是**托管式**项目（没有 `ios/`/`android/` 目录——原生配置通过 config plugins 完成），典型示例是一个约 **100–200 行的单屏页面**。可以从中提取规范的集成*模式*——包括依赖集合、`app.json` 配置插件，以及 Expo 针对当前 SDK 维护的最小连接代码——然后将其改编到用户的应用中。不要指望从中直接搬用应用架构。

在手动实现集成之前，先查找示例。（示例类型——全栈、展示、起步项目——记录在 `./references/catalog.md` 中。）

## 两种模式

1. **参考 / 改编**（最常见）——用户已有项目。找到匹配的示例，阅读其关键文件，并将其*模式*应用到用户的代码中。
2. **脚手架**——从零开始。直接基于示例创建一个新项目。

## 工作流

### 1. 找到正确的示例

将用户的需求映射到示例名称（例如，支付 → `with-stripe`，身份验证 → `with-clerk`）。`./references/catalog.md` 是按类别整理的快照，便于快速筛选——但它会逐渐过时，因此请对照实时列表进行确认：

```bash
# Live example names:
gh api repos/expo/examples/contents --jq '.[] | select(.type=="dir" and (.name|startswith(".")|not)) | .name'
# Aliases (renamed) + deprecated (dead/moved) examples — check before recommending:
gh api repos/expo/examples/contents/meta.json --jq '.content' | base64 -d
```

`meta.json` 是判断哪些示例已重命名或失效的权威来源（已弃用的示例会从仓库目录树中移除，但仍会列在这里，每个示例都有一条 `message`）。如果某个示例位于其 `deprecated` 映射中，不要推荐它——应按照 `message` 指向的现代路径操作。如果它位于 `aliases` 中，则使用 `destination`。

### 2a. 参考模式——研究示例，但不要修改用户的项目

这是最常见的情况：用户已经有一个应用，并希望了解 Expo 如何实现某项功能。将示例作为**参考**阅读，然后手动将其中的模式应用到用户的代码中——绝不要在用户的项目上直接搭建示例。

**首先，一次调用列出整个示例。** 集成代码通常是嵌套的（例如，Stripe 的服务器路由位于 `app/api/` 中），因此只列出一层会遗漏重要文件：

```bash
gh api 'repos/expo/examples/git/trees/master?recursive=1' \
  --jq '.tree[].path | select(startswith("with-stripe/"))'
```

**然后优先读取高价值文件：** `README.md`（设置）→ `package.json`（依赖）→ `app.json`（配置插件 / 权限）→ 清单中显示的集成代码 → `.env`（必需的密钥）。每个文件使用：

```bash
gh api repos/expo/examples/contents/with-stripe/utils/stripe-server.ts --jq '.content' | base64 -d
# No gh? Raw URL (branch is master):
curl -s https://raw.githubusercontent.com/expo/examples/master/with-stripe/utils/stripe-server.ts
```

**要读取多个文件？** 许多集成分布在服务器路由、客户端 provider 和配置中（Stripe 就是如此）。跳过逐文件调用——将整个示例拉取到一个**临时的、被 gitignore 的目录（不是用户的项目）**中，然后使用 Grep/Read 自由读取，最后手动应用：

```bash
npx degit expo/examples/with-stripe /tmp/expo-ref/with-stripe   # clean copy, no git history
# fallback without degit (sparse-checkout, no full ~64 MB clone):
git clone --depth 1 --filter=blob:none --sparse https://github.com/expo/examples.git /tmp/expo-ref/examples \
  && (cd /tmp/expo-ref/examples && git sparse-checkout set with-stripe)
```

从那里使用 Grep/Read 读取；完成后删除临时目录。

### 2b. 脚手架模式 — 从示例创建新项目

```bash
npx create-expo --example with-stripe   # short form:  npx create-expo -e with-stripe
bun create expo --example with-stripe    # with bun
```

### 3. 适配到用户的应用中 — 非破坏性地进行（关键）

当用户已经有一个应用时，**只添加示例引入的内容；绝不要覆盖他们现有的设置。**

- **对齐版本——不要复制固定版本。** 示例跟踪**最新** SDK，因此其中的 `package.json` 固定版本可能与旧项目不匹配。只使用 `npx expo install <pkg>` 添加*缺失的*依赖（它会解析与 SDK 匹配的版本），而不是复制确切版本。
- **合并配置，不要替换配置。** 只添加示例引入且用户缺少的 `app.json`/`app.config.*` 插件和权限——保留用户现有的配置块不变。
- **移植集成代码。**
- 根据示例的 `.env` 形状重新创建环境变量——其中包含的是占位符，绝不会包含可用的密钥。

只有在集成代码已完成移植，并且用户应用所需的每个依赖、配置插件、权限和环境变量都已得到处理时，才算完成——而不是仅仅看起来已经连接起来。

## 注意事项

- **默认分支是 `master`，**不是 `main`（这对原始 URL 和 sparse checkout 很重要）。
- **单击即可部署。** 每个示例都有一个启动 URL：`https://launch.expo.dev/?github=https://github.com/expo/examples/tree/master/<example>`。

## 相关技能

- 原生 UI 组件（`@expo/ui` package）→ `expo-ui`
- 样式和原生体验的屏幕 → `expo-native-ui`
- 导航和路由 → `expo-router`
- 编写原生模块 → `expo-module`
- 在采用最新 SDK 示例之前升级 SDK → `expo-upgrade`

## 参考资料

- `./references/catalog.md` — 示例库的分类快照，用于快速分流。

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-examples" "<actionable feedback>"
```
只有在你有具体且可执行的反馈时才提交。尽可能包含更多相关上下文。
如果 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能，并遵循其 eval-candidate 流程，不要重复使用上面的命令。