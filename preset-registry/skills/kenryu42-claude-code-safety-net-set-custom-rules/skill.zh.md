---
name: set-custom-rules
description: Configure cc-safety-net custom rules.
disable-model-invocation: true
---
# 设置自定义规则

## 工作流程

帮助用户为 Safety Net 配置自定义拦截规则。

1. 运行 `npx -y cc-safety-net --custom-rules-doc`，并将其输出的模式文档作为唯一准确信息来源。
2. 询问要配置的作用域：
   - 用户作用域：`~/.cc-safety-net/config.json`，应用于所有项目。
   - 项目作用域：`.safety-net.json`，仅应用于当前项目。
3. 展示几个自然语言示例，然后请用户描述他们想要的规则：
   - 拦截 `git add -A` 和 `git add .`，以防止暂存所有更改。
   - 拦截 `npm install -g`，以防止全局安装软件包。
   - 拦截 `docker system prune`，以防止意外清理。
4. 使用模式文档将用户的请求转换为有效的 Safety Net JSON。向用户展示生成的配置，并询问内容是否正确。
5. 写入前检查现有配置：
   - 用户配置：`cat ~/.cc-safety-net/config.json 2>/dev/null || echo "No user config found"`
   - 项目配置：`cat .safety-net.json 2>/dev/null || echo "No project config found"`
6. 如果所选作用域已有配置，向用户展示该配置，并询问是合并还是替换。合并时，保留不相关的现有规则，并使用新版本更新同名规则。
7. 仅在用户确认后写入所选配置文件。
8. 运行 `npx -y cc-safety-net --verify-config`。
9. 如果验证失败，展示确切的错误，建议最小限度的修复方案，并在再次更改配置前征得确认。
10. 确认保存路径，说明更改会立即生效，并总结新增或更新的规则。

## 规则

- 自定义规则只能增加限制；不能绕过 Safety Net 的内置保护机制。
- 规则名称必须唯一，不区分大小写。
- 如果配置无效，Safety Net 会忽略整个自定义配置，仅使用内置规则。