---
name: related
description: Mines git history to find files and test suites that historically change together with specified target files (co-change relations). Use before making changes or running tests to discover coupled code.
user-invocable: true
argument-hint: "[file-path or --tests file-path]"
allowed-tools: ["Bash(git-agent:*)"]
---
## 执行

执行 `git-agent related` 以查询共同变更关系（离线且只读）：

1. **查找耦合文件**：
   ```bash
   git-agent related <file-paths...>
   ```
2. **查找相关测试**：
   ```bash
   git-agent related --tests <file-paths...>
   ```
3. **结构化 JSON 输出**：
   ```bash
   git-agent related -o json <file-paths...>
   ```

报告历史上存在耦合关系的文件和测试，以指导代码编辑和测试套件执行。

CLI 参考：`../../references/cli.md`