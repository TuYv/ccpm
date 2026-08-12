---
name: nextjs-turbopack
description: Next.js 16+ and Turbopack — incremental bundling, FS caching, dev speed, and when to use Turbopack vs webpack.
origin: ECC
---
# Next.js 与 Turbopack

Next.js 16+ 默认使用 Turbopack 进行本地开发：这是一个用 Rust 编写的增量打包器，可显著加快开发环境的启动和热更新速度。

## 何时使用

- **Turbopack（默认开发模式）**：用于日常开发。冷启动和 HMR 速度更快，尤其适合大型应用。
- **Webpack（旧版开发模式）**：仅当遇到 Turbopack 错误，或在开发环境中依赖仅支持 webpack 的插件时使用。可通过 `--webpack` 禁用 Turbopack（或使用 `--no-turbopack`，具体取决于你的 Next.js 版本；请查阅对应版本的文档）。
- **生产环境**：生产构建行为（`next build`）可能使用 Turbopack 或 webpack，具体取决于 Next.js 版本；请查阅对应版本的 Next.js 官方文档。

适用场景：开发或调试 Next.js 16+ 应用、诊断开发环境启动或 HMR 缓慢的问题，或优化生产环境打包产物。

## 工作原理

- **Turbopack**：用于 Next.js 开发环境的增量打包器。它使用文件系统缓存，因此重新启动会快得多（例如，在大型项目中可提升 5–14 倍）。
- **开发环境中的默认选项**：从 Next.js 16 开始，除非被禁用，否则 `next dev` 将使用 Turbopack 运行。
- **文件系统缓存**：重新启动时会复用之前的工作成果；缓存通常位于 `.next` 下；基本使用无需额外配置。
- **Bundle Analyzer（Next.js 16.1+）**：实验性 Bundle Analyzer，用于检查输出并找出体积较大的依赖项；可通过配置或实验性标志启用（请参阅对应版本的 Next.js 文档）。

## 示例

### 命令

```bash
next dev
next build
next start
```

### 用法

运行 `next dev`，使用 Turbopack 进行本地开发。使用 Bundle Analyzer（请参阅 Next.js 文档）优化代码拆分并精简大型依赖项。尽可能优先使用 App Router 和服务器组件。

## 最佳实践

- 使用较新的 Next.js 16.x 版本，以获得稳定的 Turbopack 和缓存行为。
- 如果开发环境速度较慢，请确保正在使用 Turbopack（默认选项），并且缓存未被不必要地清除。
- 对于生产环境打包体积问题，请使用适用于对应版本的 Next.js 官方打包分析工具。