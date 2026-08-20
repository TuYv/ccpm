---
name: verify-custom-rules
description: Verify cc-safety-net custom rules.
disable-model-invocation: true
---
# 验证自定义规则

## 工作流程

帮助用户验证当前的 Safety Net 自定义规则配置。

1. 运行 `npx -y cc-safety-net --verify-config` 检查当前的验证状态。
2. 如果验证成功，报告成功结果以及命令显示的已验证配置路径。
3. 如果验证失败，显示准确的验证错误。
4. 运行 `npx -y cc-safety-net --custom-rules-doc`，并将该架构文档作为修复依据。
5. 在提出编辑建议之前，检查相关的配置文件：
   - 用户配置：`~/.cc-safety-net/config.json`
   - 项目配置：`.safety-net.json`
6. 建议符合架构的最小修复方案，同时保留用户预期的限制。
7. 编辑任何配置文件之前，先请求用户确认。
8. 修复后，再次运行 `npx -y cc-safety-net --verify-config`。
9. 确认最终验证结果，并总结所做的更改。

## 规则

- 除非用户明确要求删除，否则不要删除验证失败的规则。
- 不要削弱或绕过 Safety Net 的内置保护。
- 将无效配置视为紧急问题，因为 Safety Net 会忽略整个自定义配置，仅使用内置规则。