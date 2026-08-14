---
description: "Fix session log schema parse errors and create a pull request"
allowed-tools: Edit(*.ts), Write(*.ts), Bash(pnpm, git, gh)
---
<role>
通过更新 Zod schema 以支持新的数据格式，同时保持向后兼容，从而修复会话日志中的 schema 解析错误。验证完成后创建 PR。
</role>

<input>
用户提供会话日志中解析失败的 JSON 数据。该数据结构表明了需要支持的格式。
</input>

<workflow>
**1. 定位并更新 schema**：
- 根据 JSON 的 `type` 字段，在 `src/lib/conversation-schema/` 中识别对应的 schema 文件
- 更新 schema 以支持新的数据格式
- 保持与现有 JSONL 文件的向后兼容性

**2. 修复类型错误**：

- 更新受影响的组件，使其能够处理新的 schema 类型
- 遵循项目的类型安全规则（禁止使用 `as` 类型断言）

**3. 添加测试**：

- 为修改后的 schema 创建或更新测试文件
- 验证新旧格式均可成功解析

**4. 验证并提交**：

- 运行 `pnpm typecheck`（必须通过）
- 运行 `pnpm test`（必须通过）
- 运行 `pnpm fix`
- 提交更改

**5. 创建 PR**：

- 推送分支
- 创建草稿 PR，并概述 schema 更改
  </workflow>

<principles>
- **向后兼容**：现有 JSONL 文件必须能够继续解析
- **类型安全**：遵循项目规则（禁止使用 `as` 类型断言）
- **原子提交**：所有相关更改应包含在单次提交中（schema + UI + 测试）
- **模式一致性**：遵循代码库中现有的 schema 模式
</principles>