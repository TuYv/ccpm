---
name: n8n-binary-and-data
description: Handle files and binary data in n8n correctly. Use when working with files, images, PDFs, attachments, uploads or downloads, base64, vision/multimodal input, or when an AI agent needs a file as tool input or output — and whenever the user mentions $binary, binaryPropertyName, "read the PDF", "attach the file", "send the image", Merge losing binary, or a CDN for chat images. Covers the $binary vs $json split, reading/writing binary, keeping binary alive across transforms with Merge, the agent-tool binary boundary, and the CDN/URL requirement for chat surfaces.
---
# n8n 二进制与数据

每个 n8n 条目都包含两个相互独立的槽位：用于存放结构化数据的 `$json`，以及用于存放文件字节的 `$binary`。它们在工作流中并行传递。文件内容——实际的 PDF、图像或 zip——存放在 `$binary` 中，绝不会存放在 `$json` 中。如果混淆了两者，就可能读取到空字段、在流程中途丢失文件，或者向 AI 智能体提供其无法使用的工具输入。

本技能介绍二进制数据存放在哪里、如何读取和写入二进制数据、如何防止其在不知情的情况下被移除、二进制数据与 AI 智能体工具边界之间不可逾越的界限，以及聊天界面为何需要 URL 而不是原始字节。

---

## 可避免 90% 二进制数据错误的三条规则

1. **文件内容位于 `$binary` 中，而不是 `$json` 中。** 通过 HTTP 下载、“Read Files”或电子邮件附件触发器获取文件后，字节会存放在 `$binary.<key>` 中。`$json` 最多只保存元数据。从 `$json.data` 读取文件内容将一无所获。

2. **二进制数据无法跨越 AI 智能体工具边界——无论哪个方向。** 工具参数和工具返回值都只能是 JSON。上传的图像无法作为文件传入工具，工具也无法返回原始字节。应先将文件暂存到存储服务中，再通过 JSON 传递键或 URL。请参阅 `AGENT_TOOL_BINARY.md`。

3. **聊天界面通过 URL 而不是 `$binary` 渲染图像。** Slack、Discord、Teams、Telegram、嵌入式 Webhook 聊天——它们都不会读取二进制槽位。图像必须存放在可通过 URL 获取的位置。请参阅 `CDN_REQUIREMENT.md`。

---

## 两个槽位

每个条目的结构如下：

```json
{
  "json": { "customerId": 42, "status": "sent" },
  "binary": {
    "invoice": {
      "data": "<base64-encoded bytes>",
      "mimeType": "application/pdf",
      "fileName": "invoice-42.pdf",
      "fileExtension": "pdf"
    }
  }
}
```

`binary` 内部的键（此处为 `invoice`）是**二进制属性名称**。大多数文件处理节点都有一个指向该键的 `binaryPropertyName` 参数——生产者为槽位命名，消费者通过该名称引用它。大多数节点的默认键都是 `data`，因此在没有其他说明时，可以假定使用 `$binary.data`。

`$json` 和 `$binary` 是相互独立的命名空间。类似 `{{ $binary.invoice.fileName }}` 的表达式读取文件元数据；`{{ $json.customerId }}` 则读取数据。两者绝不会混用。

这种划分也解释了 Webhook 的一个易错点：接收 `multipart/form-data` 的 Webhook 触发器会将上传的文件放入 `$binary`，并将随附的表单字段放入 `$json.body`——因此，上传的文件根本不会位于 `$json` 下的任何位置。（Webhook 的 `$json.body` 嵌套属于 **n8n 表达式语法**范畴。）

有关完整的槽位结构、MIME 类型和大小限制，请参阅 `BINARY_BASICS.md`。

---

## 生成二进制数据

你很少需要手动构建 `$binary` 槽位——节点会自动为你填充它：

| 来源 | 二进制数据的生成方式 |
|---|---|
| 使用 `responseFormat: "file"` 的 HTTP Request | 响应正文会存入 `$binary.data`（或你设置的名称） |
| Read/Write Files from Disk | 文件内容被读取到 `$binary` 中 |
| 存储服务下载（S3、Google Drive、Dropbox 等） | 下载的文件位于 `$binary.<key>` 中 |
| 带附件的电子邮件触发器 | 每个附件都会存入 `$binary` |
| 服务提供商的 AI 媒体节点（图像/音频生成） | 设置 `options.binaryPropertyOutput`，使字节存入下一个节点所查找的位置 |

对于 HTTP 下载，唯一重要的字段是 `responseFormat`。请在 `nodes-base.httpRequest` 上使用 `get_node` 确认该字段——将其保留为默认的 JSON/字符串格式，通常正是下载的文件最终在 `$json` 中变成乱码文本，而不是在 `$binary` 中成为完整字节数据的典型原因。

---

## 在 Code 节点中读取和写入二进制数据

大多数工作流从不需要拆解这些字节——它们只需将二进制数据传递给使用方（电子邮件附件、文件上传、Slack 文件）。当你确实需要原始字节时，请在 Code 节点中进行处理。

使用 `getBinaryDataBuffer` **读取**——不要尝试手动对 `$binary.<key>.data` 进行 base64 解码：

```javascript
// Code node, "Run Once for Each Item"
const buffer = await this.helpers.getBinaryDataBuffer(0, 'data'); // (itemIndex, propertyName)
const text = buffer.toString('utf-8');
const length = buffer.length;

return [{
  json: { ...$json, length },
  binary: $input.item.binary,   // pass the binary through, or it's gone
}];
```

通过自行构建数据槽来**写入**——对字节进行 base64 编码，并添加 mime 类型和文件名：

```javascript
const text = 'Hello, world!';
return [{
  json: { ok: true },
  binary: {
    report: {
      data: Buffer.from(text).toString('base64'),
      mimeType: 'text/plain',
      fileName: 'report.txt',
      fileExtension: 'txt',
    },
  },
}];
```

Code 节点的沙箱、辅助函数和执行模式属于 **n8n-code-javascript**（以及 **n8n-code-python**）的范畴——语言层面的细节请参考这些 Skill。这里需要记住的唯一一项二进制相关事项是：如果 Code 节点返回 `[{ json: {...} }]` 时没有重新附加 `binary`，它会**静默丢弃文件**。请参阅 `BINARY_BASICS.md`。

---

## 在转换过程中保留二进制数据

仅处理 JSON 的节点——Edit Fields (Set)、Code、IF 以及其他节点——可能会从其输出中丢弃 `$binary` 数据槽。工作流可以顺利通过验证并正常运行；只是在下游电子邮件节点尝试附加文件时，文件已经不在那里了。

有两种保留方式：

- **使用转换节点上的透传选项。** Edit Fields 提供 `includeOtherFields`；Code 节点可以显式返回 `binary: $input.item.binary`。如果该方式可用，这是成本最低的修复方法。
- **分支后按位置合并。** 将源数据同时路由到转换分支和旁路分支，然后使用处于 `combineByPosition` 模式的 Merge 重新合并。JSON 来自转换分支，而二进制数据则在旁路分支中得以保留。

```
[Source with binary] ─┬─→ [Edit Fields: change JSON] ─┐
                      │      (binary stripped here)     ├─→ [Merge: combineByPosition] ─→ [Email: attach]
                      └──────────────────────────────────┘
                          (bypass — binary passes through untouched)
```

`combineByPosition` 会将每个输入中的第 N 个条目配对，因此字段数量必须一致。连接布线方式以及包含多个数据剥离点的链路所适用的替代方案（尽早上传、子工作流）请参阅 `MERGE_FOR_CONTEXT.md`。

---

## Agent 与工具之间的二进制边界

这是最棘手的边界。AI Agent 通过 JSON 与其工具（Custom Code Tool、Call n8n Workflow Tool、HTTP Request Tool、MCP 工具）通信。无论哪个方向，二进制数据都无法通过该通道。两个方向的解决方案形式相同：**将字节暂存到存储中，通过 JSON 传递键/URL，然后在另一端获取。**

**入站——用户上传代理工具必须处理的文件：**

1. 聊天触发器会为你提供一个 `files[]` 数组。将其拆分，并以哈希键为键把每个文件上传到私有存储。
2. 在代理运行前重新合并该分支（这是一个同步屏障，并非装饰），并在代理上设置 `executeOnce: true`，这样 N 个文件就不会触发 N 次代理运行。
3. 将这些键注入代理的系统提示词中，同时列出原始名称（供人理解的上下文）和存储键（工具所需的值），并明确注明“必须使用与此完全一致的键”。
4. 工具以字符串参数形式接收该键，并自行从存储中下载文件。

**出站——工具生成代理必须返回的文件：**

1. 工具子工作流生成二进制数据，将其上传到存储，并返回类似 `{ "ok": true, "key": "...", "url": "https://...", "mimeType": "image/png" }` 的 JSON。
2. 代理在回复中嵌入该 URL（或将该键传递给另一个工具）。

代理上的 `passthroughBinaryImages: true` 只会改变 **LLM 所看到的内容**，以便进行视觉处理——它并**不会**让工具接收到文件，而且仅适用于图像（不包括 PDF、音频或视频）。对于任何工具，你仍然需要采用“上传并传递键”的模式。完整模式、哈希策略、存储选项和长时间运行工具的变体请参阅 `AGENT_TOOL_BINARY.md`。

> 正在构建工具本身？有关 Custom Code Tool 协定，请参阅 **n8n-code-tool**；有关带工具的 AI 代理结构，请参阅 **n8n-workflow-patterns**。

---

## 聊天界面的 CDN 要求

当工作流生成图像，并且用户希望在聊天消息中显示该图像时：

- **仅在数据项上附带二进制数据是不够的。** 聊天客户端会渲染通过 URL 引用图像的消息（或通过平台自身的文件上传 API 推送字节）。它绝不会读取 `$binary`。
- **这些字节必须存放在可通过 HTTPS URL 获取的位置。** 先上传到对象存储或网盘，然后嵌入返回的 URL。
- **n8n 没有内置 CDN。** 存储由用户提供。

应询问用户已经在使用哪种存储，而不是默认使用 S3——对象存储（S3、R2、GCS、Azure Blob、Backblaze B2、Supabase Storage）和网盘类服务（Dropbox、Google Drive、OneDrive、Box）都可以使用，而且都会影响 URL 的形式。如果用户目前没有任何存储方案，Cloudflare R2 是最容易上手的起点。对于敏感内容，应使用带过期时间的签名 URL，而不是永久公开的 URL。请参阅 `CDN_REQUIREMENT.md`。

---

## 不可用的功能

- **`$fromAI()` 无法承载二进制数据。** 它可以使用字符串、数字、布尔值和对象填充工具参数，但绝不能传递文件字节。请改为传递存储键。
- **工具参数和返回值仅支持 JSON。** 代理工具无论输入还是输出，都不存在“二进制参数”。
- **n8n 不提供 CDN 或公共文件托管服务。** 通过 URL 提供文件始终由用户的存储服务完成，而不是由 n8n 完成。
- **`getBinaryDataBuffer` 是 Code 节点的辅助函数。** 它在 Custom Code Tool 沙箱中不可用（请参阅 **n8n-code-tool**）。

---

## Data Tables 的位置

对于持久化表格存储——对暂存文件进行引用计数、跟踪哪些键仍处于活动状态、去重——应使用由 **n8n-mcp-tools-expert** 负责的 `n8n_manage_datatable` 接口。本技能不涵盖数据表。

---

## 反模式

| 反模式 | 问题所在 | 修复方法 |
|---|---|---|
| 从 `$json` 读取文件内容 | 字节数据位于 `$binary` 中；`$json` 为空或仅包含元数据 | 读取 `$binary.<key>`，或在 Code 节点中使用 `getBinaryDataBuffer` |
| HTTP 下载时未设置 `responseFormat: "file"` | 字节数据会以乱码文本形式进入 `$json`，而非干净的二进制数据 | 在 HTTP Request 节点上设置 `responseFormat: "file"` |
| Code 节点返回 `[{json:{...}}]`，但没有 `binary` | 文件会在下游被悄然丢弃 | 在返回值中重新附加 `binary: $input.item.binary` |
| JSON 转换（Edit Fields/IF）吞掉了二进制数据 | Email/upload 节点找不到可附加的内容 | 使用直通选项，或进行分支后按位置 Merge |
| 通过 `$fromAI` 将上传的文件传入工具 | `$fromAI` 无法承载二进制数据；工具不会收到任何内容 | 预先暂存到存储中，将键注入系统提示词，工具再按键获取 |
| 误以为 `passthroughBinaryImages` 能让工具看到文件 | 它只影响 LLM 看到的内容，而且仅适用于图像 | 工具仍需使用上传并传递键的模式 |
| 工具向代理返回原始二进制数据 | 工具输出是 JSON；字节数据无法保留（还会导致上下文膨胀） | 上传文件，并在 JSON 中返回 `{ key, url }` |
| 将 `$binary` 发布到聊天界面并期望其显示图像 | 聊天客户端通过 URL 渲染，而非使用原始字节 | 上传到存储/CDN，嵌入 URL，或使用平台文件 API |
| 在 Code 节点中硬编码 base64 | 工作流 JSON 会非常庞大、运行缓慢且容易泄漏数据 | 通过 `$binary` 引用，或上传后通过 URL 引用 |

---

## 参考文件

| 文件 | 何时阅读 |
|---|---|
| `BINARY_BASICS.md` | 首次处理二进制数据，或读写 `$binary` 槽位、MIME 类型、大小限制时 |
| `AGENT_TOOL_BINARY.md` | 代理工具需要上传的文件或会生成文件时——涵盖两个方向上的边界 |
| `MERGE_FOR_CONTEXT.md` | 二进制数据在 JSON 转换后消失，需要将其重新附加时 |
| `CDN_REQUIREMENT.md` | 在聊天界面或任何需要通过 URL 引用图像的位置显示图像时 |

---

## 与其他技能的集成

**n8n-code-javascript / n8n-code-python**：Code 节点是读写原始字节的位置（`getBinaryDataBuffer`、`Buffer.from(...).toString('base64')`）。这些技能负责沙箱、辅助函数和执行模式的细节——本技能负责二进制数据必须在返回时重新附加这一规则。

**n8n-code-tool**：Custom Code Tool 的沙箱限制更严格——没有 `$binary`、`getBinaryDataBuffer` 或 `$fromAI`。当工具需要文件时，本技能的存储键模式就是其获取文件的方式。

**n8n-workflow-patterns**：代理与工具之间的二进制边界位于带工具的 AI 代理模式内部；CDN 流程是一条生成 → 上传 → 回复链。

**n8n-node-configuration**：`responseFormat`、`binaryPropertyName`、`includeOtherFields`、`binaryPropertyOutput` 都是条件字段——使用 `get_node` 确认用户所用版本中的确切名称。

**n8n-expression-syntax**：处理 `$binary.<key>.fileName` 与 `$json.body` 的区别（尤其是 Webhook 上传）属于表达式范畴。

**n8n-validation-expert**：丢失的二进制槽位是一种静默失败——`validate_workflow` 不会将其标记出来。请通过检查执行记录来确认它是否存在。

**n8n-mcp-tools-expert**：负责 `n8n_manage_datatable`（数据表）和 `n8n_executions`——使用后者确认 `binary` 槽位是否确实通过了某个给定节点。

**n8n-error-handling**：存储上传和下载可能失败；入站/出站暂存步骤需要错误分支，以免键缺失时静默返回 404。

**using-n8n-mcp-skills**：这些技能如何协同配合的索引。

---

## 验证二进制数据是否保留

验证无法发现被移除的二进制槽位——这是一种静默失败。请确认工作流运行正确：

1. 使用 `n8n_test_workflow`（或触发一次真实运行）生成一条执行记录。
2. 使用 `n8n_executions` 拉取该执行记录，并检查各节点输出中的 `binary` 槽位——即使 base64 数据因过大而无法呈现，它也会显示是否存在及其元数据。
3. 最后仍出现 `binary` 的节点，就是移除该槽位之前的节点。应在此处添加透传或 Merge。

---

## 快速参考检查清单

- [ ] 从 `$binary.<key>` 读取文件内容——绝不能从 `$json` 读取
- [ ] HTTP 下载使用 `responseFormat: "file"`
- [ ] 当文件必须继续传递时，Code 节点在返回结果中重新附加 `binary`
- [ ] JSON 转换要么透传二进制数据，要么通过 Merge 将其合并回来（`combineByPosition`）
- [ ] 不要尝试将二进制数据传入或传出智能体工具——改为通过 JSON 传递键或 URL
- [ ] `passthroughBinaryImages` 仅用于 LLM 视觉能力，不能用作工具通道
- [ ] 面向聊天界面的图片应上传到存储；嵌入的是 URL，而不是字节数据
- [ ] 与用户共同选择存储后端（不要默认使用 S3）；敏感内容使用签名 URL
- [ ] 通过检查执行记录确认二进制数据是否存在，而不是依赖验证

---

**请记住**：两个槽位并列存在。数据通过 `$json` 传递，文件通过 `$binary` 传递——而当文件必须跨越智能体工具或到达聊天界面时，它应以 URL 而不是字节数据的形式传递。