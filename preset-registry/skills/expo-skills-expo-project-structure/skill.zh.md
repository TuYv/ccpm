---
name: expo-project-structure
description: Framework (OSS). Folder structure for a new Expo app. Use when scaffolding or laying out a new Expo project with Expo Router, or deciding where a file should live in one. For new projects only — never restructure an existing app to match.
version: 1.0.0
license: MIT
---
# Expo 项目结构

适用于**新建** Expo 应用的起始骨架——即尚未提交任何文件夹结构的应用。

**仅适用于新项目。** 如果应用已有布局，请遵循其现有约定并将文件保留在原位——这只是一个起始默认方案，绝不是需要强制执行或迁移到的标准。如果不确定项目是否为新项目，请在移动任何内容之前先询问。

根据以下规则组合而成的完整布局：

```
├── assets/
├── scripts/
├── src/
│   ├── app/                       # Expo Router routes ONLY — every file is a route
│   │   ├── api/                   #   server API routes, grouped here
│   │   │   ├── user+api.ts
│   │   │   └── settings+api.ts
│   │   ├── _layout.tsx
│   │   ├── _layout.web.tsx         #   platform-specific layout
│   │   ├── index.tsx
│   │   └── settings.tsx
│   ├── components/                 # reusable UI: button, card, table…
│   │   ├── table/                  #   complex component → folder + index.tsx
│   │   │   ├── cell.tsx
│   │   │   └── index.tsx
│   │   ├── bar-chart.tsx
│   │   ├── bar-chart.web.tsx        #   platform-specific variant
│   │   └── button.tsx
│   ├── screens/                    # screen bodies that route files render
│   │   ├── home/
│   │   │   ├── card.tsx            #   used only by Home — not shared
│   │   │   └── index.tsx           #   rendered by src/app/index.tsx
│   │   └── settings.tsx
│   ├── server/                     # server-only helpers used by app/api
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── utils/                      # standalone helpers + colocated tests
│   │   ├── format-date.ts
│   │   └── format-date.test.ts
│   ├── hooks/                      # reusable hooks: use-theme.ts…
│   ├── constants.ts
│   └── theme.ts
├── app.json
├── eas.json
└── package.json
```

## `src/` 和 `src/app`

将应用代码放在 `src/` 下，以便与配置文件分离。Expo Router 原生支持 `app/` 和 `src/app/`——如需切换，请移动该文件夹并重启打包器。默认模板会在 `tsconfig.json` 中将 `@/*` 别名指向 `./src/*`。

`src/app` **仅用于路由**：其中的每个文件都会成为一个路由，因此不应放入其他内容。以下所有内容都应放在与其同级的文件夹中。

## components/ — 可复用 UI

通用且可复用的 UI（按钮、卡片、表格），每个组件提供一个具名导出。文件使用 **kebab-case** 命名（`bar-chart.tsx`），与默认的 `create-expo-app` 模板保持一致。当组件规模增大时，为其创建独立文件夹，将根组件放在 `index.tsx` 中，并将其私有子组件**就近放置**在旁边——导入路径（`@/components/table`）保持不变。

## screens/ — 页面主体

由于 `app/` 中的文件必须是路由，因此复杂且不可复用的页面 UI 无法放在那里。当一个页面变得足够复杂，需要拆分成独立组件时，请将其放入 `screens/`，并让每个路由只负责渲染对应的页面：

```tsx
import { Home } from "@/screens/home";

export default function HomeScreen() {
  // route-specific concerns only — e.g. read url params here
  return <Home />;
}
```

将屏幕的私有组件**共置**在其文件夹内（`screens/home/components/`）。额外的好处是：同一个屏幕可以在多个路由下渲染。

## server/ + app/api/ — 分离服务器端代码

在 `app/` 中的文件名后追加 `+api`，会使其成为服务器端 **API 路由**。服务器端代码不同于前端代码——它运行在类似 Node 的服务器环境中（使用 EAS Hosting 部署，或部署在[第三方服务](https://docs.expo.dev/router/web/api-routes/#hosting-on-third-party-services)上），并且可以读取私密环境变量（`process.env.X`，而不仅仅是 `EXPO_PUBLIC_*`）。请将其分开：

- 将所有路由集中在 `app/api/` 下 → `/api/user`、`/api/settings`。这样可以将它们共置在一起并避免冲突（例如 `/user` 屏幕与 `/user` 路由发生冲突）。
- 将共享的仅服务器端辅助函数放在 `src/server/` 中。
- 考虑使用 ESLint 规则，将 `+api` 文件和 `server/` 与仅适用于前端的检查隔离开来。

## 平台特定代码

对于较小的差异：使用 `Platform.select` / `Platform.OS`。对于较大的差异，应拆分为平台文件，而不是使用内联 `if/else`——例如 `bar-chart.tsx` + `bar-chart.web.tsx`，导入时不带扩展名（`@/components/bar-chart`）；Metro 会为每个目标平台选择正确的文件。

- 各变体的 Props 必须完全一致。
- 始终需要一个默认文件（不带平台扩展名）——如果组件仅用于单个平台，可将其实现为空操作。
- 支持的扩展名：`.ios`、`.android`、`.native`、`.web`。

## 共置样式和测试

- **样式：**将 `StyleSheet.create({ ... })` 对象放在组件文件底部，而不是单独的 `.styles` 文件中。
- **测试：**将 `format-date.test.ts` 放在 `format-date.ts` 旁边（优先于单独的 `__tests__/` 文件夹），这样一眼就能看出哪些文件经过了测试。

## AI 和配置文件

Agent 指令位于仓库根目录——`AGENTS.md` / `CLAUDE.md`，项目 skill 则位于 `.claude/` 下。其他配置和资源应放在 `src/` 之外：`app.json` / `app.config.ts`、`eas.json`、`package.json`、`assets/` 和 `scripts/`。

---

基于 Kadi Kraman 撰写的 [Expo 应用文件夹结构最佳实践](https://expo.dev/blog/expo-app-folder-structure-best-practices)。有关 `src/` 优先级和别名机制，请参阅 [Expo 文档](https://docs.expo.dev/router/reference/src-directory/)。

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-project-structure" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不要重复使用上述命令。