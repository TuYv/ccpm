---
name: nuxt-studio
description: Configure and operate the self-hosted Nuxt Studio editor for Nuxt Content. Use when working with nuxt-studio installation, editor customization, OAuth or custom authentication, media, drafts, Git publishing, or production deployment.
license: MIT
---
# Nuxt Studio

Nuxt Studio 负责内容编辑和发布。Nuxt Content 负责集合、查询、解析和渲染。

## 工作流程

1. 检查已安装的 `nuxt-studio` 和 `@nuxt/content` 版本、部署模式、代码仓库提供商以及身份验证提供商。当编辑器路由、Git 目标和登录回调均指向同一部署时，即表示已了解相关设置。
2. 打开下方最匹配且范围最小的指南，并确保集合和模式的更改位于 `nuxt-content` 边界内。
3. 首先根据文件系统验证本地编辑，然后在支持 SSR 的部署上验证生产环境登录，并完成一次发布周期。当提交到达配置的分支，且重新构建的站点公开该提交的内容时，工作即告完成。

## 路由

| 任务                                                                                      | 打开                                         |
| ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| 安装、代码仓库设置、OAuth/自定义身份验证、编辑器筛选器或环境变量 | [配置](references/configuration.md) |
| 可视化/MDC 编辑、模式表单、草稿、媒体或 AI 辅助                         | [实时编辑](references/live-editing.md)   |
| SSR 部署、Git 发布、分支策略、冲突或单体代码仓库                  | [部署](references/deployment.md)       |
| 集合、验证器、查询、钩子或渲染                                     | `nuxt-content` 技能                         |

## 基线配置

```bash
npx nuxt module add nuxt-studio
```

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/content', 'nuxt-studio'],
  studio: {
    repository: {
      provider: 'github',
      owner: 'your-org',
      repo: 'your-repo',
      branch: 'main',
    },
  },
})
```

```bash
NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID=<client-id>
NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET=<client-secret>
```

Studio 默认运行在 `/_studio`。受支持的 CI 提供商可以推断代码仓库元数据，但身份验证凭据仍需作为显式部署密钥进行配置。