---
name: share
description: Promote a note from your personal Basic Memory project to a shared team project, with attribution. Use when the user says "share this with the team", "publish this decision", or runs /basic-memory:share. This is the deliberate way to write to a team workspace — auto-capture never does.
argument-hint: <note title or permalink to share>
---
# 分享到团队项目

将个人/主项目中的笔记复制到已配置的**团队项目**中，以便团队成员查看。这是插件写入共享项目的*唯一*途径——会话检查点和 `/basic-memory:remember` 始终保留在个人项目中。

## 步骤

1. **解析配置。** 读取 `.claude/settings.json`（以及 `.local`）中的 `basicMemory`：
   - `teamProjects` — `<project-ref>` → `{ "promoteFolder": "shared" }` 的映射。
     这些是允许的分享目标。`<project-ref>` 是包含工作区限定信息的名称（例如 `my-team-2/notes`）或 `external_id` UUID。
   - `primaryProject` — 从中读取源项目笔记。

   如果 `teamProjects` 为空，告知用户尚未配置分享目标，并建议添加一个（或运行 `/basic-memory:setup`），然后停止。不要虚构目标。

2. **查找源笔记。** 根据 `$ARGUMENTS`（标题、永久链接或 `memory://` URL），从 `primaryProject` 中对其调用 `read_note`。如果 `$ARGUMENTS` 为空（你是通过“分享此内容”调用的），则使用对话中指向最明确的笔记——如果存在任何歧义，确认具体是哪一篇。获取其标题、完整内容（包括 frontmatter）和源永久链接。

3. **选择目标。** 如果 `teamProjects` 只有一个条目，则使用该条目。如果有多个，则询问要分享到哪个团队项目。使用该条目的 `promoteFolder`（默认为 `shared`）。

4. **写入前确认。** 此次写入将对团队成员可见，因此向用户展示你即将执行的操作——*"将 '<title>' 分享到 <target>/<promoteFolder>？"*——并等待用户确认。绝不能静默分享。

5. **使用 `write_note` 写入共享副本**：
   - 路由到目标：如果团队引用是 `external_id` UUID，则将其作为 `project_id` 传入；否则，将包含工作区限定信息的名称作为 `project` 传入。（在 `project` 中传入裸 UUID 无法进行路由——Basic Memory 仅通过 `project_id` 接收 UUID。）
   - `directory` = `promoteFolder`
   - `title` = 源标题
   - `content` = 源内容，并添加来源信息：保留其 frontmatter（这样共享的决策仍会保持 `type: decision`，并且可以在团队的结构化召回中找到），添加 `shared_from: <source permalink>` frontmatter 字段，并添加一条观察记录 `- [context] Shared from <source permalink>`。
   除非用户明确同意，否则不要覆盖目标位置已有的笔记。

6. **用一行确认**：说明分享了什么以及新的团队永久链接，例如：
   `Shared → my-team-2/shared/<slug>`。

## 注意事项

- 分享操作会**复制**笔记；原笔记仍保留在你的项目中。对其中一份的编辑不会同步到另一份。
- 不要分享包含秘密、凭据或任何用户不希望团队成员看到的内容的笔记——如有疑问，请先询问。
- 使用当前已连接的任意 Basic Memory MCP 服务器；通过 `project`（限定名称）或 `project_id`（UUID）参数路由到团队项目。