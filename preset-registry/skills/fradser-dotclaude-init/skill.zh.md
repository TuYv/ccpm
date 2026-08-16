---
name: init
description: Initializes or optimizes git-agent configuration, regenerates commit scopes from git history, and re-derives .gitignore rules.
user-invocable: true
argument-hint: "[--scope | --gitignore]"
allowed-tools: ["Bash(git-agent:*)"]
---
## 执行

根据 `$ARGUMENTS` 执行初始化或优化：

1. **优化提交作用域**（根据历史记录重新生成）：
   ```bash
   git-agent init --scope --force
   ```
2. **重新推导 `.gitignore`**（保留自定义规则）：
   ```bash
   git-agent init --gitignore
   ```
3. **完整初始化**（同时处理作用域和 `.gitignore`）：
   ```bash
   git-agent init --scope --gitignore
   ```

完成后报告更新后的配置状态。

CLI 参考：`../../references/cli.md`