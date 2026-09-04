---
name: reverse-skill-router
description: Use the reverse-skill repository from Codex for authorized reverse engineering, security analysis, CTF, and defensive testing tasks. Requires the reverse-skill repository to be available as the current workspace or an explicitly supplied local path.
---
# Reverse Skill Codex 适配器

本插件是一个可选的 Codex 入口。仓库本身仍然是权威的、与客户端无关的实现。

当当前工作区是 `reverse-skill` 仓库时：

1. 阅读仓库根目录下的 `RULES.md`。
2. 运行平台原生的 `skills/scripts/master-route` 入口并传入用户的任务，从 `skills/config/routing.json` 中选出 PRIMARY 技能。
3. 在执行任何针对目标的操作之前，使用平台原生的 `case-init` 和 `case-guard` 脚本创建并校验 `work/<case>/scope.md`。
4. 打开选定的 `skills/<PRIMARY>/SKILL.md`，并遵循其中针对该任务的指令。
5. 只通过生成的 `skills/tool-index.md` 来解析工具；除非用户明确要求该操作，否则不要注册 MCP 服务器或安装工具。

如果该仓库不是当前工作区，且未提供本地仓库路径，请说明此适配器不内置路由器的第二份副本。请用户打开或克隆 `https://github.com/zhaoxuya520/reverse-skill`，然后从其 `RULES.md` 继续。

不要将本插件的存在、某个目标名称或某个示例路径视为授权。授权来自该仓库的范围契约。
