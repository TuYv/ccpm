---
name: review-pr
description: Review a pull request for bugs, security issues, and improvements. Use when the user asks to review a PR, review changes, or check code quality of a branch.
allowed-tools: Bash, Read, Grep, Glob
---
# Pull Request 审查

审查当前分支相对于基础分支的变更。

## 步骤

1. 确定基础分支：
   - 依次尝试 `main`、`master`，然后询问用户
   - 运行 `git log --oneline <base>..HEAD` 查看此 PR 中的所有提交
2. 运行 `git diff <base>...HEAD` 查看完整的 diff
3. 对于较大的 diff，使用 `git diff <base>...HEAD -- <file>` 逐个文件审查
4. 对每个已变更的文件，检查以下方面：
   - **Bug**：逻辑错误、差一错误、null/undefined 访问、竞态条件
   - **安全**：注入、XSS、身份验证绕过、硬编码密钥、SSRF
   - **性能**：N+1 查询、无边界循环、缺失索引、内存泄漏
   - **错误处理**：缺少 try/catch、错误被吞掉、错误信息不清晰
   - **风格**：与代码库其余部分不一致
   - **测试**：缺少针对新功能或边界情况的测试
5. 提供结构化的审查结果：

   **摘要** —— 此 PR 做了什么（1-2 句话）

   **问题** —— 应在合并前修复的 Bug、安全或正确性问题

   **建议** —— 值得考虑的非阻塞性改进

   **结论** —— 批准 / 请求更改 / 需要讨论

要具体——引用文件路径和行号。给出具体的修复方案，而不是模糊的建议。

$ARGUMENTS
