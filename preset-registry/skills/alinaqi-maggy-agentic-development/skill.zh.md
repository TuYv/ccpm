---
name: agentic-development
description: Build AI agents with Pydantic AI (Python) and Claude SDK (Node.js)
when-to-use: When building AI agents, tool-using LLM systems, or agentic workflows
user-invocable: false
effort: high
---
# Agentic Development Skill


用于构建能够借助工具执行多步骤任务的自主 AI Agent。

**来源：** [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk) | [Anthropic Claude Code 最佳实践](https://www.anthropic.com/engineering/claude-code-best-practices) | [Pydantic AI](https://ai.pydantic.dev/) | [Google Gemini Agent 开发](https://developers.googleblog.com/en/building-agents-google-gemini-open-source-frameworks/) | [OpenAI Agent 构建](https://developers.openai.com/tracks/building-agents/)

---

## 按语言选择框架

| 语言/框架 | 默认框架 | 原因 |
|-------------------|---------|-----|
| **Python** | **Pydantic AI** | 类型安全、Pydantic 验证、支持多模型、适合生产环境 |
| **Node.js / Next.js** | **Claude Agent SDK** | Anthropic 官方 SDK、支持工具、多 Agent、原生流式传输 |

### Python：Pydantic AI（默认）
```python
from pydantic_ai import Agent
from pydantic import BaseModel

class SearchResult(BaseModel):
    title: str
    url: str
    summary: str

agent = Agent(
    'claude-sonnet-4-20250514',
    result_type=list[SearchResult],
    system_prompt='You are a research assistant.',
)

# Type-safe result
result = await agent.run('Find articles about AI agents')
for item in result.data:
    print(f"{item.title}: {item.url}")
```

### Node.js / Next.js：Claude Agent SDK（默认）
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Define tools
const tools: Anthropic.Tool[] = [
  {
    name: "web_search",
    description: "Search the web for information",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
];

// Agentic loop
async function runAgent(prompt: string) {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: prompt },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools,
      messages,
    });

    // Check for tool use
    if (response.stop_reason === "tool_use") {
      const toolUse = response.content.find((b) => b.type === "tool_use");
      if (toolUse) {
        const result = await executeTool(toolUse.name, toolUse.input);
        messages.push({ role: "assistant", content: response.content });
        messages.push({
          role: "user",
          content: [{ type: "tool_result", tool_use_id: toolUse.id, content: result }],
        });
        continue;
      }
    }

    // Done - return final response
    return response.content.find((b) => b.type === "text")?.text;
  }
}
```

---

## 核心原则

**先规划，逐步执行，始终验证。**

在执行前进行研究和规划的 Agent，其表现始终优于直接采取行动的 Agent。将复杂任务拆分为可验证的步骤，审慎使用工具，并在整个执行过程中保持清晰的状态。

---

## Agent 架构

### 三个组件（OpenAI）
```
┌─────────────────────────────────────────────────┐
│                    AGENT                        │
├─────────────────────────────────────────────────┤
│  Model (Brain)      │ LLM for reasoning &       │
│                     │ decision-making           │
├─────────────────────┼───────────────────────────┤
│  Tools (Arms/Legs)  │ APIs, functions, external │
│                     │ systems for action        │
├─────────────────────┼───────────────────────────┤
│  Instructions       │ System prompts defining   │
│  (Rules)            │ behavior & boundaries     │
└─────────────────────┴───────────────────────────┘
```

### 项目结构
```
project/
├── src/
│   ├── agents/
│   │   ├── orchestrator.ts    # Main agent coordinator
│   │   ├── specialized/       # Task-specific agents
│   │   │   ├── researcher.ts
│   │   │   ├── coder.ts
│   │   │   └── reviewer.ts
│   │   └── base.ts            # Shared agent interface
│   ├── tools/
│   │   ├── definitions/       # Tool schemas
│   │   ├── implementations/   # Tool logic
│   │   └── registry.ts        # Tool discovery
│   ├── prompts/
│   │   ├── system/            # Agent instructions
│   │   └── templates/         # Task templates
│   └── memory/
│       ├── conversation.ts    # Short-term context
│       └── persistent.ts      # Long-term storage
├── tests/
│   ├── agents/                # Agent behavior tests
│   ├── tools/                 # Tool unit tests
│   └── evals/                 # End-to-end evaluations
└── skills/                    # Agent skills (Anthropic pattern)
    ├── skill-name/
    │   ├── instructions.md
    │   ├── scripts/
    │   └── resources/
```

---

## 工作流模式：探索-规划-执行-验证

### 1. 探索阶段
```typescript
// Gather context before acting
async function explore(task: Task): Promise<Context> {
  const relevantFiles = await agent.searchCodebase(task.query);
  const existingPatterns = await agent.analyzePatterns(relevantFiles);
  const dependencies = await agent.identifyDependencies(task);

  return { relevantFiles, existingPatterns, dependencies };
}
```

### 2. 规划阶段（关键）
```typescript
// Plan explicitly before execution
async function plan(task: Task, context: Context): Promise<Plan> {
  const prompt = `
    Task: ${task.description}
    Context: ${JSON.stringify(context)}

    Create a step-by-step plan. For each step:
    1. What action to take
    2. What tools to use
    3. How to verify success
    4. What could go wrong

    Output JSON with steps array.
  `;

  return await llmCall({ prompt, schema: PlanSchema });
}
```

### 3. 执行阶段
```typescript
// Execute with verification at each step
async function execute(plan: Plan): Promise<Result[]> {
  const results: Result[] = [];

  for (const step of plan.steps) {
    // Execute single step
    const result = await executeStep(step);

    // Verify before continuing
    if (!await verify(step, result)) {
      // Self-correct or escalate
      const corrected = await selfCorrect(step, result);
      if (!corrected.success) {
        return handleFailure(step, results);
      }
    }

    results.push(result);
  }

  return results;
}
```

### 4. 验证阶段
```typescript
// Independent verification prevents overfitting
async function verify(step: Step, result: Result): Promise<boolean> {
  // Run tests if available
  if (step.testCommand) {
    const testResult = await runCommand(step.testCommand);
    if (!testResult.success) return false;
  }

  // Use LLM to verify against criteria
  const verification = await llmCall({
    prompt: `
      Step: ${step.description}
      Expected: ${step.successCriteria}
      Actual: ${JSON.stringify(result)}

      Does the result satisfy the success criteria?
      Respond with { "passes": boolean, "reasoning": string }
    `,
    schema: VerificationSchema
  });

  return verification.passes;
}
```

---

## 工具设计

### 工具定义模式
```typescript
// tools/definitions/file-operations.ts
import { z } from 'zod';

export const ReadFileTool = {
  name: 'read_file',
  description: 'Read contents of a file. Use before modifying any file.',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file'),
    startLine: z.number().optional().describe('Start line (1-indexed)'),
    endLine: z.number().optional().describe('End line (1-indexed)'),
  }),
  // Risk level for guardrails (OpenAI pattern)
  riskLevel: 'low' as const,
};

export const WriteFileTool = {
  name: 'write_file',
  description: 'Write content to a file. Always read first to understand context.',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file'),
    content: z.string().describe('Complete file content'),
  }),
  riskLevel: 'medium' as const,
  // Require confirmation for high-risk operations
  requiresConfirmation: true,
};
```

### 工具实现
```typescript
// tools/implementations/file-operations.ts
export async function readFile(
  params: z.infer<typeof ReadFileTool.parameters>
): Promise<ToolResult> {
  try {
    const content = await fs.readFile(params.path, 'utf-8');
    const lines = content.split('\n');

    const start = (params.startLine ?? 1) - 1;
    const end = params.endLine ?? lines.length;

    return {
      success: true,
      data: lines.slice(start, end).join('\n'),
      metadata: { totalLines: lines.length }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read file: ${error.message}`
    };
  }
}
```

### 优先使用内置工具（OpenAI）
```typescript
// Use platform-provided tools when available
const agent = createAgent({
  tools: [
    // Built-in tools (handled by platform)
    { type: 'web_search' },
    { type: 'code_interpreter' },

    // Custom tools only when needed
    { type: 'function', function: customDatabaseTool },
  ],
});
```

---

## 多智能体模式

### 单智能体（默认）
对于大多数任务，使用一个智能体。多个智能体会增加复杂性。

### 智能体即工具模式（OpenAI）
```typescript
// Expose specialized agents as callable tools
const researchAgent = createAgent({
  name: 'researcher',
  instructions: 'You research topics and return structured findings.',
  tools: [webSearchTool, documentReadTool],
});

const mainAgent = createAgent({
  tools: [
    {
      type: 'function',
      function: {
        name: 'research_topic',
        description: 'Delegate research to specialized agent',
        parameters: ResearchQuerySchema,
        handler: async (query) => researchAgent.run(query),
      },
    },
  ],
});
```

### 交接模式 (OpenAI)
```typescript
// One-way transfer between agents
const customerServiceAgent = createAgent({
  tools: [
    // Handoff to specialist when needed
    {
      name: 'transfer_to_billing',
      description: 'Transfer to billing specialist for payment issues',
      handler: async (context) => {
        return { handoff: 'billing_agent', context };
      },
    },
  ],
});
```

### 何时使用多个代理
- 具有不重叠工具的不同任务领域
- 需要不同的授权级别
- 具有明确交接点的复杂工作流
- 独立子任务的并行执行

---

## 记忆与状态

### 对话记忆
```typescript
// memory/conversation.ts
interface ConversationMemory {
  messages: Message[];
  maxTokens: number;

  add(message: Message): void;
  getContext(): Message[];
  summarize(): Promise<string>;
}

// Maintain state across tool calls (Gemini pattern)
interface AgentState {
  thoughtSignature?: string;  // Encrypted reasoning state
  conversationId: string;     // For shared memory
  currentPlan?: Plan;
  completedSteps: Step[];
}
```

### 持久化记忆
```typescript
// memory/persistent.ts
interface PersistentMemory {
  // Store learnings across sessions
  store(key: string, value: any): Promise<void>;
  retrieve(key: string): Promise<any>;

  // Semantic search over past interactions
  search(query: string, limit: number): Promise<Memory[]>;
}
```

---

## 防护措施与安全性

### 多层保护 (OpenAI)
```typescript
// guards/index.ts
interface GuardrailConfig {
  // Input validation
  inputClassifier: (input: string) => Promise<SafetyResult>;

  // Output validation
  outputValidator: (output: string) => Promise<SafetyResult>;

  // Tool risk assessment
  toolRiskLevels: Record<string, 'low' | 'medium' | 'high'>;

  // Actions requiring human approval
  humanInTheLoop: string[];
}

async function executeWithGuardrails(
  agent: Agent,
  input: string,
  config: GuardrailConfig
): Promise<Result> {
  // 1. Check input safety
  const inputCheck = await config.inputClassifier(input);
  if (!inputCheck.safe) {
    return { blocked: true, reason: inputCheck.reason };
  }

  // 2. Execute with tool monitoring
  const result = await agent.run(input, {
    beforeTool: async (tool, params) => {
      const risk = config.toolRiskLevels[tool.name];
      if (risk === 'high' || config.humanInTheLoop.includes(tool.name)) {
        return await requestHumanApproval(tool, params);
      }
      return { approved: true };
    },
  });

  // 3. Validate output
  const outputCheck = await config.outputValidator(result.output);
  if (!outputCheck.safe) {
    return { blocked: true, reason: outputCheck.reason };
  }

  return result;
}
```

### 范围约束 (OpenAI)
```typescript
// Agent must stay within defined scope
const agentInstructions = `
You are a customer service agent for Acme Corp.

SCOPE BOUNDARIES (non-negotiable):
- Only answer questions about Acme products and services
- Never provide legal, medical, or financial advice
- Never access or modify data outside your authorized scope
- If a request is out of scope, politely decline and explain why

If you cannot complete a task within scope, notify the user
and request explicit approval before proceeding.
`;
```

---

## 模型选择

### 将模型与任务相匹配
| 任务复杂度 | 推荐模型 | 备注 |
|-----------------|-------------------|-------|
| 简单、快速 | gpt-5-mini, claude-haiku | 低延迟 |
| 通用 | gpt-4.1, claude-sonnet | 平衡 |
| 复杂推理 | o4-mini, claude-opus | 更高准确性 |
| 深度规划 | gpt-5 + reasoning, ultrathink | 最大能力 |

### Gemini 特定说明
```typescript
// Use thinking_level for reasoning depth
const response = await gemini.generate({
  model: 'gemini-3',
  thinking_level: 'high',  // For complex planning
  temperature: 1.0,        // Optimized for reasoning engine
});

// Preserve thought state across tool calls
const nextResponse = await gemini.generate({
  thoughtSignature: response.thoughtSignature,  // Required for function calling
  // ... rest of params
});
```

### Claude 特定说明（思考模式）
```typescript
// Trigger extended thinking with keywords
const thinkingLevels = {
  'think': 'standard analysis',
  'think hard': 'deeper reasoning',
  'think harder': 'extensive analysis',
  'ultrathink': 'maximum reasoning budget',
};

const prompt = `
Think hard about this problem before proposing a solution.

Task: ${task.description}
`;
```

---

## 测试代理

### 单元测试（工具）
```typescript
describe('readFile tool', () => {
  it('reads file content correctly', async () => {
    const result = await readFile({ path: '/test/file.txt' });
    expect(result.success).toBe(true);
    expect(result.data).toContain('expected content');
  });
});
```

### 行为测试（代理决策）
```typescript
describe('agent planning', () => {
  it('creates plan before executing file modifications', async () => {
    const trace = await agent.runWithTrace('Refactor the auth module');

    // Verify planning happened first
    const firstToolCall = trace.toolCalls[0];
    expect(firstToolCall.name).toBe('read_file');

    // Verify no writes without reads
    const writeIndex = trace.toolCalls.findIndex(t => t.name === 'write_file');
    const readIndex = trace.toolCalls.findIndex(t => t.name === 'read_file');
    expect(readIndex).toBeLessThan(writeIndex);
  });
});
```

### 评估测试
```typescript
// Run nightly, not in regular CI
describe('Agent Accuracy (Eval)', () => {
  const testCases = loadTestCases('./evals/coding-tasks.json');

  it.each(testCases)('completes $name correctly', async (testCase) => {
    const result = await agent.run(testCase.input);

    // Verify against expected outcomes
    expect(result.filesModified).toEqual(testCase.expectedFiles);
    expect(await runTests(testCase.testCommand)).toBe(true);
  }, 120000);
});
```

---

## Pydantic AI 模式（Python 默认）

### 项目结构（Python）
```
project/
├── src/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── researcher.py       # Research agent
│   │   ├── coder.py            # Coding agent
│   │   └── orchestrator.py     # Main coordinator
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── web.py              # Web search tools
│   │   ├── files.py            # File operations
│   │   └── database.py         # DB queries
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models
│   └── deps.py                 # Dependencies
├── tests/
│   ├── test_agents.py
│   └── test_tools.py
└── pyproject.toml
```

### 使用工具的 Agent
```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from httpx import AsyncClient

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str

class ResearchDeps(BaseModel):
    http_client: AsyncClient
    api_key: str

research_agent = Agent(
    'claude-sonnet-4-20250514',
    deps_type=ResearchDeps,
    result_type=list[SearchResult],
    system_prompt='You are a research assistant. Use tools to find information.',
)

@research_agent.tool
async def web_search(ctx: RunContext[ResearchDeps], query: str) -> list[dict]:
    """Search the web for information."""
    response = await ctx.deps.http_client.get(
        'https://api.search.com/search',
        params={'q': query},
        headers={'Authorization': f'Bearer {ctx.deps.api_key}'},
    )
    return response.json()['results']

@research_agent.tool
async def read_webpage(ctx: RunContext[ResearchDeps], url: str) -> str:
    """Read and extract content from a webpage."""
    response = await ctx.deps.http_client.get(url)
    return response.text[:5000]  # Truncate for context

# Usage
async def main():
    async with AsyncClient() as client:
        deps = ResearchDeps(http_client=client, api_key='...')
        result = await research_agent.run(
            'Find recent articles about LLM agents',
            deps=deps,
        )
        for item in result.data:
            print(f"- {item.title}")
```

### 带验证的结构化输出
```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class CodeReview(BaseModel):
    summary: str = Field(description="Brief summary of the review")
    issues: list[str] = Field(description="List of issues found")
    suggestions: list[str] = Field(description="Improvement suggestions")
    approval: bool = Field(description="Whether code is approved")
    confidence: float = Field(ge=0, le=1, description="Confidence score")

review_agent = Agent(
    'claude-sonnet-4-20250514',
    result_type=CodeReview,
    system_prompt='Review code for quality, security, and best practices.',
)

# Result is validated Pydantic model
result = await review_agent.run(f"Review this code:\n```python\n{code}\n```")
if result.data.approval:
    print("Code approved!")
else:
    for issue in result.data.issues:
        print(f"Issue: {issue}")
```

### 多 Agent 协作
```python
from pydantic_ai import Agent

# Specialized agents
planner = Agent('claude-sonnet-4-20250514', system_prompt='Create detailed plans.')
executor = Agent('claude-sonnet-4-20250514', system_prompt='Execute tasks precisely.')
reviewer = Agent('claude-sonnet-4-20250514', system_prompt='Review and verify work.')

async def orchestrate(task: str):
    # 1. Plan
    plan = await planner.run(f"Create a plan for: {task}")

    # 2. Execute each step
    results = []
    for step in plan.data.steps:
        result = await executor.run(f"Execute: {step}")
        results.append(result.data)

    # 3. Review
    review = await reviewer.run(
        f"Review the results:\nTask: {task}\nResults: {results}"
    )

    return review.data
```

### 流式响应
```python
from pydantic_ai import Agent

agent = Agent('claude-sonnet-4-20250514')

async def stream_response(prompt: str):
    async with agent.run_stream(prompt) as response:
        async for chunk in response.stream():
            print(chunk, end='', flush=True)

    # Get final structured result
    result = await response.get_data()
    return result
```

### 测试 Agent
```python
import pytest
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

@pytest.fixture
def test_agent():
    return Agent(
        TestModel(),  # Mock model for testing
        result_type=str,
    )

async def test_agent_response(test_agent):
    result = await test_agent.run('Test prompt')
    assert result.data is not None

# Test with specific responses
async def test_with_mock_response():
    model = TestModel()
    model.seed_response('Expected output')

    agent = Agent(model)
    result = await agent.run('Any prompt')
    assert result.data == 'Expected output'
```

---

## 技能模式（Anthropic）

### 技能结构
```
skills/
└── code-review/
    ├── instructions.md      # How to perform code reviews
    ├── scripts/
    │   └── run-linters.sh   # Supporting scripts
    └── resources/
        └── checklist.md     # Review checklist
```

### instructions.md 示例
```markdown
# Code Review Skill

## When to Use
Activate this skill when asked to review code, PRs, or diffs.

## Process
1. Read the changed files completely
2. Run linters: `./scripts/run-linters.sh`
3. Check against resources/checklist.md
4. Provide structured feedback

## Output Format
- Summary (1-2 sentences)
- Issues found (severity: critical/major/minor)
- Suggestions for improvement
- Approval recommendation
```

### 动态加载技能
```typescript
async function loadSkill(skillName: string): Promise<Skill> {
  const skillPath = `./skills/${skillName}`;
  const instructions = await fs.readFile(`${skillPath}/instructions.md`, 'utf-8');
  const scripts = await glob(`${skillPath}/scripts/*`);
  const resources = await glob(`${skillPath}/resources/*`);

  return {
    name: skillName,
    instructions,
    scripts: scripts.map(s => ({ name: path.basename(s), path: s })),
    resources: await Promise.all(resources.map(loadResource)),
  };
}
```

---

## 反模式

- **执行前不做规划** - 直接开始行动的 Agent 更容易出错
- **单体 Agent** - 一个拥有 50 个工具的 Agent 会陷入混乱
- **不进行验证** - Agent 必须验证自己的工作
- **硬编码工具调用顺序** - 让模型决定工具调用顺序
- **缺少防护措施** - 所有 Agent 都需要安全边界
- **没有状态管理** - 在工具调用之间丢失上下文
- **只测试成功路径** - 测试失败情况和边界情况
- **忽略模型差异** - 推理模型需要不同的提示词
- **不跟踪成本** - Agent 工作流可能成本高昂
- **完全自动化且没有监督** - 对关键操作应采用人在回路中

---

## 快速参考

### Agent 开发检查清单
- [ ] 明确定义 Agent 的范围和边界
- [ ] 设计具有明确 schema 和风险等级的工具
- [ ] 实现探索-规划-执行-验证工作流
- [ ] 添加多层防护措施
- [ ] 设置对话记忆和持久化记忆
- [ ] 编写行为测试和评估测试
- [ ] 根据任务复杂度配置适当的模型
- [ ] 为高风险操作添加人在回路机制
- [ ] 监控 token 使用量和成本
- [ ] 记录 skills 和指令

### 思考触发词（Claude）
```
"think"        → Standard analysis
"think hard"   → Deeper reasoning
"think harder" → Extensive analysis
"ultrathink"   → Maximum reasoning
```

### Gemini 设置
```
thinking_level: "high" | "low"
temperature: 1.0 (keep at 1.0 for reasoning)
thoughtSignature: <pass back for function calling>
```