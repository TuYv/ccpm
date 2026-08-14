---
name: remember
description: Quickly capture a thought, fact, or reminder into Basic Memory as a lightweight note. Use when the user says "remember that…", "note this", "save this to memory", or runs /basic-memory:remember. For quick deliberate capture — not full decision or session records.
argument-hint: <text to remember>
---
# 记住

将 `$ARGUMENTS` 快速记录到 Basic Memory 中，保留用户的原话。

## 步骤

1. **解析配置。** 读取 `.claude/settings.json`（如果 `.claude/settings.local.json`
   存在，也要读取），并查找 `basicMemory` 块：
   - `rememberFolder` — 快速记录所用的文件夹（默认值：`bm-remember`）
   - `primaryProject` — 要写入的项目（默认行为：省略 `project` 参数，以便
     Basic Memory 使用其默认项目）

   两者均为可选项。如果该块或某个键缺失，请使用默认值。如果设置文件不存在，
   不要报错。

2. **生成笔记。**
   - **内容** = `$ARGUMENTS` 中的文本，逐字保留。不要改写或填充。
   - **标题** = 该文本的第一行，截短至 ≤ 80 个字符（如果截断，则追加 `…`）。
     如果它是很长的单行文本，则改写一个简短的描述性标题。
   - 如果 `$ARGUMENTS` 为空（例如，调用你的原因是用户说了“记住……”），
     则从对话中记录他们明确要求你记住的内容。如果确实不清楚要保存什么，
     则简短提问一句。

3. **使用 `write_note` 写入：**
   - `title` = 生成的标题
   - `directory` = 解析出的 `rememberFolder`
   - `content` = 文本
   - `tags` = `["manual-capture"]`
   - 如果设置了 `primaryProject`，则路由至该项目：将其作为 `project` 传入；
     如果它是 `external_id` UUID，则作为 `project_id` 传入（在 `project` 中传入
     裸 UUID 无法正确路由）。如果未设置 `primaryProject`，则两者都省略。
   除非用户明确要求，否则不要覆盖已有笔记。

4. **用一行确认：** 保存的内容及其永久链接 —
   例如：`Saved → bm-remember/<slug>`。

## 注意事项

- 这是一次*快速*记录。保留用户的措辞；除非用户要求，否则不要添加观察、
  关系或结构。
- 对于包含理由和备选方案的决策，请改为编写 `type: decision` 笔记
  （basic-memory 输出样式会处理这一点）。工作会话的收尾是 PreCompact
  检查点的职责，而不是此技能的职责。
- 使用已连接的任意 Basic Memory MCP 服务器——不要假定特定的工具名称前缀。