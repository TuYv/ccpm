---
name: common-llm-security
description: OWASP LLM Top 10 (2025) audit checklist for AI applications, agent tools, RAG pipelines, and prompt construction. Use when performing any security review touching LLM client code, prompt templates, agent tools, or vector stores.
metadata:
  triggers:
    keywords:
    - LLM security
    - prompt injection
    - agent security
    - RAG security
    - AI security
    - openai
    - anthropic
    - langchain
    - LLM review
---
# OWASP LLM 十大安全检查清单（2025）

## **优先级：P0（严重）**

## 实施指南

- **首先检查 LLM01**：提示词注入是 LLM 的首要风险——任何直接拼接到提示词字符串中的用户输入都应立即标记为 P0。
- **接着检查 LLM06**：代理工具拥有写入、删除或执行能力，但未设置确认机制，应标记为 P0。
- **标记每一项**：✅ 不受影响 | ⚠️ 需要审查 | 🔴 已确认发现。
- **P0 发现会将安全评分上限限制为 40/100**——不得跳过任何一项。
- 有关完整的检测信号，请参阅 [references/owasp-llm.md](references/owasp-llm.md)。

## OWASP LLM 十大风险（2025）

| ID | 风险 | 关键检测信号 |
| ----- | ---- | -------------------- |
| LLM01 | 提示词注入 | 用户输入以字符串形式拼接到提示词中。检索到的文档被插入系统轮次。 |
| LLM02 | 敏感信息泄露 | PII 或凭据被传入提示词上下文。记录 LLM 响应时未进行脱敏。 |
| LLM03 | 供应链 | 使用未经验证的模型权重或插件。添加第三方代理时未进行可信度审查。 |
| LLM04 | 数据与模型投毒 | 未经验证便将用户可控数据写入训练集或嵌入存储。 |
| LLM05 | 输出处理不当 | LLM 输出被直接用于 DOM 接收点、SQL 查询、shell 命令或重定向 URL。 |
| LLM06 | 过度自主权 | 代理工具拥有写入、删除或网络访问权限，但没有人工介入确认。 |
| LLM07 | 系统提示词泄露 | 系统提示词内容通过工具输出、错误消息或 API 响应返回。 |
| LLM08 | 向量与嵌入弱点 | 未经清理便将用户文本注入向量存储。未实施租户命名空间隔离。 |
| LLM09 | 错误信息 | 未经验证便将 LLM 输出用于关键决策（医疗、金融、法律）。 |
| LLM10 | 无界消耗 | LLM 调用未设置 `max_tokens`。调用没有速率限制。代理循环没有深度上限。 |

## 反模式

- **不得拼接提示词**：将用户输入作为独立的 `user` 轮次传递，绝不插入系统提示词中。
- **不得将原始 LLM 输出用于接收点**：将 LLM 响应写入 DOM、查询或 shell 之前，必须进行清理。
- **不得使用无上限的代理循环**：每个代理式递归都必须强制实施最大迭代次数或深度限制。

## 参考资料

- [OWASP LLM——完整检测信号](references/owasp-llm.md)——审计任何 LLM 客户端代码时加载

## 规范响应锚点

当此技能适用时，请在相关情况下保留以下领域术语或含义相同的具体示例：
- sanitize