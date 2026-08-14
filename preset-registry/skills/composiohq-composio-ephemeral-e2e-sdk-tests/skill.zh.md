# 临时 E2E SDK 测试

用于快速临时验证 Composio SDK 与 AI 框架的集成。切勿提交这些测试。

## 重要区别

- **临时测试**（本 Skill）：在 `.agent_cache/test-<usecase>` 中进行快速验证——切勿提交
- **在 CI 中运行的正式 E2E 测试**：使用 `ts/e2e-tests/`——需要提交到仓库

## 快速设置

```bash
# Use descriptive usecase names (e.g., openai-direct-tools, vercel-tool-router, anthropic-mcp)
TEST_DIR=".agent_cache/test-<usecase>"
mkdir -p "$TEST_DIR" && cd "$TEST_DIR"
npm init -y
npm install @composio/core  # Add framework-specific packages as needed
```

## 测试内容

- **直接工具（非智能体式）**：不使用 Tool Router，将 SDK 与 AI 框架集成
- **Tool Router（智能体式）**：使用 Tool Router 创建用户隔离的会话
- **MCP 集成**：MCP 协议兼容性
- **框架兼容性**：不同的 AI 框架（OpenAI、Vercel、Anthropic 等）

## 实现示例

有关实现示例，请参阅现有 Skill：

- **Tool Router 基础知识**：阅读 `building-agents` Skill
- **OpenAI 集成**：阅读 `building-agents-using-openai` Skill
- **Vercel AI SDK**：阅读 `building-agents-using-vercel` Skill
- **Anthropic**：阅读 `building-agents-using-anthropic` Skill
- **LangChain**：阅读 `building-agents-using-langchain` Skill
- **其他框架**：查看相应的 `building-agents-using-*` Skill

## 清理

```bash
cd .. && rm -rf "$TEST_DIR"
```

## 最佳实践

- **始终使用 .agent_cache**——这些测试是临时的，切勿提交
- **对于 CI E2E 测试**——改用 `ts/e2e-tests/`（参见 `ts/e2e-tests/README.md`）
- **使用无需身份验证的应用**——使用 HackerNews、公共 API 进行快速测试
- **报告严重问题**——如有需要，请将适当的测试用例添加到 `ts/e2e-tests/`