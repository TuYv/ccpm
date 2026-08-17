---
name: publish-to-confluence
description: Publish any markdown file from the vault to Confluence with format conversion and approval gate
roles: [product-manager, engineering-lead, founder]
integrations: [confluence]
---
# COG 发布到 Confluence 技能

## 何时调用
- 用户希望将文档发布到 Confluence
- 用户说“publish to Confluence”“push to wiki”“send to Confluence”或“confluence publish”
- 用户有一个 Markdown 文件，希望通过 Confluence 与团队共享
- 生成 PRD、发布说明或其他应发布到 Wiki 的文档后

## Agent 模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果是 `agent_mode: team` — 此技能不会带来显著收益（单个顺序操作）
- 如果是 `agent_mode: solo` — 标准执行

## 命令：`/publish-to-confluence`

## 执行前检查

1. **读取 `00-inbox/MY-INTEGRATIONS.md`** — Confluence 必须列在 Active Integrations 下
   - 如果 Confluence **未激活**：告知用户并停止。
     ```
     Confluence is not in your active integrations.

     Would you like to:
     a) Set up Confluence integration (I'll add it to MY-INTEGRATIONS.md)
     b) Export the document in a Confluence-compatible format for manual upload
     ```
   - 如果 Confluence **已禁用**：按照 COG 约定静默跳过。如果 HackMD、Notion 等替代发布平台处于激活状态，则建议使用它们。

2. **获取当前时间戳：** 使用 Bash 运行 `date '+%Y-%m-%d %H:%M'`

---

## 执行策略

### 阶段 1：确定源文档

确定要发布的内容：

**选项 A：用户指定文件路径**
```
Read the specified file from the vault.
```

**选项 B：用户描述文档**
```
Search for matching files:
1. Glob for likely matches in 04-projects/, 05-knowledge/, 01-daily/
2. Present candidates and let user choose
```

**选项 C：刚刚生成的文档**
如果此技能是在生成 PRD、发布说明或其他文档后立即调用的，则使用该文档。

### 阶段 2：配置发布目标

询问用户（如果尚未提供）：

```
Where should this be published in Confluence?

Required:
- Space key: [CUSTOMIZE: YOUR-SPACE-KEY] (or let me search for spaces)
- Parent page: [Page title or ID under which to nest this page]

Optional:
- Page title: [defaults to the document's H1 heading]
- Labels: [Confluence labels to add]
- Publish mode: "create new" or "update existing"
```

**如果用户不知道空间或父页面：**
```
Use WebFetch to search Confluence:
GET /wiki/rest/api/space?limit=50
- List available spaces for the user to choose

GET /wiki/rest/api/content?spaceKey=[SPACE]&type=page&limit=25
- List pages in the space for parent page selection
```

### 阶段 3：将 Markdown 转换为 Confluence 格式

将 Markdown 文档转换为 Confluence 存储格式（XHTML）：

**转换规则：**
| Markdown | Confluence 存储格式 |
|----------|--------------------------|
| `# Heading` | `<h1>Heading</h1>` |
| `## Heading` | `<h2>Heading</h2>` |
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `- list item` | `<ul><li>list item</li></ul>` |
| `1. list item` | `<ol><li>list item</li></ol>` |
| `[text](url)` | `<a href="url">text</a>` |
| `` `code` `` | `<code>code</code>` |
| 代码块 | `<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[...]]></ac:plain-text-body></ac:structured-macro>` |
| 表格 | `<table><tbody><tr><th>...</th></tr><tr><td>...</td></tr></tbody></table>` |
| `> blockquote` | `<blockquote><p>quote</p></blockquote>` |
| `---` | `<hr />` |
| `- [ ] task` | `<ac:task-list><ac:task><ac:task-status>incomplete</ac:task-status><ac:task-body>task</ac:task-body></ac:task></ac:task-list>` |
| `- [x] task` | 与上方相同，但状态为 `complete` |
| YAML frontmatter | 完全移除（不在 Confluence 中显示） |

**重要的转换注意事项：**
- 移除 YAML frontmatter——它不应出现在 Confluence 页面中
- 仔细保留表格结构
- 将相对 vault 链接转换为纯文本（它们在 Confluence 中无法使用）
- 正确处理嵌套列表
- 原样保留 emoji 字符

### 阶段 4：预览和审批关卡

**关键：未经用户明确批准，绝不发布。**

向用户显示摘要：

```
Ready to publish to Confluence:

Document: [filename]
Title: [page title]
Space: [space key]
Parent Page: [parent page title]
Mode: [create new / update existing]
Labels: [labels]

Content preview (first 500 chars):
[preview text]

Estimated page size: [approximate word count]

Proceed with publishing? (yes/no)
```

**等待用户明确回复 "yes" 后再继续。**

### 阶段 5：发布

#### 创建新页面
```
Use WebFetch to POST to Confluence REST API:

POST [CUSTOMIZE: your-confluence-url]/wiki/rest/api/content

Headers:
  Content-Type: application/json
  Authorization: [from configured credentials]

Body:
{
  "type": "page",
  "title": "[page title]",
  "space": { "key": "[SPACE_KEY]" },
  "ancestors": [{ "id": "[PARENT_PAGE_ID]" }],
  "body": {
    "storage": {
      "value": "[converted XHTML content]",
      "representation": "storage"
    }
  },
  "metadata": {
    "labels": [
      { "prefix": "global", "name": "[label]" }
    ]
  }
}
```

#### 更新现有页面
```
First, get the current page to obtain the version number:
GET [CUSTOMIZE: your-confluence-url]/wiki/rest/api/content/[PAGE_ID]?expand=version

Then update:
PUT [CUSTOMIZE: your-confluence-url]/wiki/rest/api/content/[PAGE_ID]

Body:
{
  "type": "page",
  "title": "[page title]",
  "version": { "number": [current_version + 1] },
  "body": {
    "storage": {
      "value": "[converted XHTML content]",
      "representation": "storage"
    }
  }
}
```

### 阶段 6：确认并更新 Vault

成功发布后：

1. **向用户确认：**
   ```
   Published successfully!

   Page: [Title]
   URL: [Confluence page URL]
   Space: [Space Key]
   Version: [version number]
   ```

2. **更新源 vault 文件**（将发布元数据添加到 frontmatter）：
   ```yaml
   confluence_url: "[page URL]"
   confluence_page_id: "[page ID]"
   confluence_space: "[space key]"
   published_at: "[timestamp]"
   confluence_version: [version number]
   ```

3. **记录此次发布**，以供将来参考。

---

## 重新发布（更新流程）

如果 vault 文件的 frontmatter 中已包含 `confluence_page_id`：

```
This document was previously published to Confluence:
  URL: [confluence_url]
  Last published: [published_at]

Would you like to:
a) Update the existing Confluence page (increment version)
b) Create a new page (separate copy)
c) Cancel
```

---

## 回退行为

| 场景 | 行为 |
|----------|----------|
| Confluence 未启用 | 停止并通知用户；建议使用其他平台 |
| Confluence API 失败 | 将转换后的 XHTML 保存到文件中，以便用户手动粘贴 |
| 身份验证失败 | 通知用户其 Confluence 凭据可能需要刷新 |
| 页面已存在（标题相同） | 询问用户：更新现有页面、使用其他标题创建页面，或取消 |
| 文档非常大 | 提醒用户注意页面大小；建议拆分为多个子页面 |
| 复杂 markdown（不支持的元素） | 尽最大努力进行转换，并对任何无法转换的元素发出警告 |

## 错误处理

- **API 403（禁止访问）**：用户可能缺少目标空间的写入权限
- **API 404（未找到）**：空间键或父页面 ID 可能不正确
- **API 409（冲突）**：页面已被他人修改；获取最新版本后重试
- **转换失败**：对于无法转换的元素，回退为纯文本
- **速率限制**：采用退避策略重试
- **网络错误**：将转换后的内容保存在本地，以免工作成果丢失