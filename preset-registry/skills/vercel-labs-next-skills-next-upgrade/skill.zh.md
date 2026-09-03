---
name: next-upgrade
description: Upgrade Next.js to the latest version following official migration guides and codemods
argument-hint: "[target-version]"
---
# 升级 Next.js

按照官方迁移指南，将当前项目升级到最新的 Next.js 版本。

## 说明

1. **检测当前版本**：读取 `package.json`，确定当前的 Next.js 版本及相关依赖（React、React DOM 等）

2. **获取最新的升级指南**：使用 WebFetch 获取官方升级文档：
   - Codemods：https://nextjs.org/docs/app/guides/upgrading/codemods
   - 特定版本的指南（根据需要调整版本）：
     - https://nextjs.org/docs/app/guides/upgrading/version-16 
     - https://nextjs.org/docs/app/guides/upgrading/version-15
     - https://nextjs.org/docs/app/guides/upgrading/version-14

3. **确定升级路径**：根据当前版本，判断哪些迁移步骤适用。对于跨大版本的升级，请逐级递增（例如 13 → 14 → 15）。

4. **先运行 codemods**：Next.js 提供了 codemods 来自动处理破坏性变更：
   ```bash
   npx @next/codemod@latest <transform> <path>
   ```
   常用的转换：
   - `next-async-request-api` - 更新异步 Request API（v15）
   - `next-request-geo-ip` - 迁移 geo/ip 属性（v15）
   - `next-dynamic-access-named-export` - 转换动态导入（v15）

5. **更新依赖**：同时升级 Next.js 及其对等依赖：
   ```bash
   npm install next@latest react@latest react-dom@latest
   ```

6. **审查破坏性变更**：查看升级指南，确认需要手动进行的修改：
   - API 变更（例如 v15 中的异步 params）
   - `next.config.js` 中的配置变更
   - 被弃用特性的移除

7. **更新 TypeScript 类型**（如适用）：
   ```bash
   npm install @types/react@latest @types/react-dom@latest
   ```

8. **测试升级结果**：
   - 运行 `npm run build` 检查是否存在构建错误
   - 运行 `npm run dev` 并测试关键功能
