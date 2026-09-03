---
name: competition-file-parser-chain
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for file uploads, imports, previews, archive extraction, format conversion, parser invocation, and deserialization chains. Use when the user asks to inspect an upload or import path, trace archive extraction, preview or converter behavior, explain how a file reaches a parser or deserializer, or connect one uploaded artifact to the decisive backend effect. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛文件解析器链

仅在 `$ctf-sandbox-orchestrator` 已激活并确立了沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专门化技能使用。如果尚未出现这种情况，请先返回 `$ctf-sandbox-orchestrator`。

当难点在于追踪一个文件从入口开始、经过每一个重要的解析器、提取器、转换器或反序列化器边界时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 分别保留原始上传文件和每一个派生工件。
2. 按顺序映射整条链路：入口、临时存储、归档提取、格式转换、解析器调用、反序列化以及最终消费者。
3. 在改动任何内容之前，先记录文件名、MIME 推断、扩展名、临时路径和解析器选择。
4. 将客户端可见的验证与后端解析器行为区分开来。
5. 复现能够产生决定性分支或工件的最小文件处理链。

## 工作流程

### 1. 映射文件入口与派生过程

- 记录请求结构、multipart 名称、内容类型、文件名、临时路径、上传暂存和存储键。
- 记下每一个派生工件：提取出的归档成员、转换后的预览、生成的缩略图、临时文档或反序列化得到的对象。
- 将原始文件与每个派生物分开标注。

### 2. 追踪解析器与转换边界

- 说明每一步运行的是哪个解析器、转换器、提取器或反序列化器。
- 记录由扩展名、MIME、魔数（magic bytes）、schema、归档成员名称或嵌入元数据驱动的解析器特有决策。
- 区分解析成功、预览成功、转换成功以及业务逻辑接受。

### 3. 缩减至决定性文件链

- 将结果压缩为最小序列：上传 -> 派生工件 -> 解析器边界 -> 产生的效果。
- 明确说明决定性弱点究竟位于归档处理、MIME 推断、文件转换、路径解析还是反序列化之中。
- 如果该链路在入队之后基本变成一个通用的异步 worker 问题，就移交给更专门的队列或 worker 技能。

## 阅读此参考资料

- 加载 `references/file-parser-chain.md` 以获取入口检查清单、解析器检查清单和证据打包内容。

## 需要保留的内容

- 原始上传文件、派生文件、临时路径、存储键、解析器名称和转换步骤
- 后端行为与用户可见验证出现分歧的确切边界
- 一条能够到达决定性效果的最小可重放文件处理序列
