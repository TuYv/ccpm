---
name: bm-share
description: Share a personal Basic Memory note to a configured team project from Codex with attribution and explicit confirmation.
---
# 共享笔记

将笔记从已配置的主项目复制到已配置的团队项目。这是有意执行的共享写入路径。自动检查点和快速记录仍保留在个人项目中。

## 步骤

1. 读取 `~/.codex/basic-memory.json`，然后读取最近的项目
   `.codex/basic-memory.json`；项目键会覆盖用户键。解析：
   - `primaryProject`
   - `teamProjects`，从项目引用到设置的映射

2. 如果未配置任何团队项目，请停止并要求用户运行设置或添加
   目标。不要虚构团队目标位置。

3. 从用户的参数或当前对话中读取源笔记。如果
   存在歧义，请询问要共享哪篇笔记。

4. 选择目标。如果有多个团队项目，请询问要使用哪一个。

5. 写入前进行确认。提示应具体明确：
   `Share "<title>" to <target>/<promoteFolder>?`

6. 写入副本：
   - 路由到目标项目
   - `directory`：目标 `promoteFolder`，默认为 `shared`
   - 保留原始内容和有用的前置元数据
   - 如果可能，添加 `shared_from: <source permalink>` 前置元数据
   - 添加 `- [context] Shared from <source permalink>` 作为观察记录

7. 使用新的团队永久链接进行确认。

未经明确同意，绝不共享机密、凭据或私密笔记。