---
name: llm-patterns
description: AI-first application patterns, LLM testing, prompt management
when-to-use: When building apps where LLMs handle core logic - classification, extraction, generation
user-invocable: false
effort: medium
---
# LLM 模式技能


适用于由 LLM 处理逻辑操作的 AI 优先应用。

---

## 核心原则

**LLM 负责逻辑，代码负责衔接。**

使用 LLM 处理：
- 分类、提取、总结
- 运用自然语言推理进行决策
- 内容生成与转换
- 使用代码实现时容易变得脆弱的复杂条件逻辑

使用传统代码处理：
- 数据验证（Zod/Pydantic）
- API 路由和 HTTP 处理
- 数据库操作
- 身份认证/权限授权
- 编排和错误处理

---

## 项目结构

```
project/
├── src/
│   ├── core/
│   │   ├── prompts/           # Prompt templates
│   │   │   ├── classify.ts
│   │   │   └── extract.ts
│   │   ├── llm/               # LLM client and utilities
│   │   │   ├── client.ts      # LLM client wrapper
│   │   │   ├── schemas.ts     # Response schemas (Zod)
│   │   │   └── index.ts
│   │   └── services/          # Business logic using LLM
│   ├── infra/
│   └── ...
├── tests/
│   ├── unit/
│   ├── integration/
│   └── llm/                   # LLM-specific tests
│       ├── fixtures/          # Saved responses for deterministic tests
│       ├── evals/             # Evaluation test suites
│       └── mocks/             # Mock LLM responses
└── _project_specs/
    └── prompts/               # Prompt specifications
```

---

## LLM 客户端模式

### 类型化 LLM 封装
```typescript
// core/llm/client.ts
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic();

interface LLMCallOptions<T> {
  prompt: string;
  schema: z.ZodSchema<T>;
  model?: string;
  maxTokens?: number;
}

export async function llmCall<T>({
  prompt,
  schema,
  model = 'claude-sonnet-4-20250514',
  maxTokens = 1024,
}: LLMCallOptions<T>): Promise<T> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Parse and validate response
  const parsed = JSON.parse(text);
  return schema.parse(parsed);
}
```

### 结构化输出
```typescript
// core/llm/schemas.ts
import { z } from 'zod';

export const ClassificationSchema = z.object({
  category: z.enum(['support', 'sales', 'feedback', 'other']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export type Classification = z.infer<typeof ClassificationSchema>;
```

---

## 提示词模式

### 模板函数
```typescript
// core/prompts/classify.ts
export function classifyTicketPrompt(ticket: string): string {
  return `Classify this support ticket into one of these categories:
- support: Technical issues or help requests
- sales: Pricing, plans, or purchase inquiries
- feedback: Suggestions or complaints
- other: Anything else

Respond with JSON:
{
  "category": "...",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Ticket:
${ticket}`;
}
```

### 提示词版本管理
```typescript
// core/prompts/index.ts
export const PROMPTS = {
  classify: {
    v1: classifyTicketPromptV1,
    v2: classifyTicketPromptV2,  // improved accuracy
    current: classifyTicketPromptV2,
  },
} as const;
```

---

## 测试 LLM 调用

### 1. 使用 Mock 的单元测试（快速、确定性）
```typescript
// tests/llm/mocks/classify.mock.ts
export const mockClassifyResponse = {
  category: 'support',
  confidence: 0.95,
  reasoning: 'User is asking for help with login',
};

// tests/unit/services/ticket.test.ts
import { classifyTicket } from '../../../src/core/services/ticket';
import { mockClassifyResponse } from '../../llm/mocks/classify.mock';

// Mock the LLM client
vi.mock('../../../src/core/llm/client', () => ({
  llmCall: vi.fn().mockResolvedValue(mockClassifyResponse),
}));

describe('classifyTicket', () => {
  it('returns classification for ticket', async () => {
    const result = await classifyTicket('I cannot log in');

    expect(result.category).toBe('support');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
```

### 2. 固定数据测试（确定性，测试解析）
```typescript
// tests/llm/fixtures/classify.fixtures.json
{
  "support_ticket": {
    "input": "I can't reset my password",
    "expected_category": "support",
    "raw_response": "{\"category\":\"support\",\"confidence\":0.98,\"reasoning\":\"Password reset is a support issue\"}"
  }
}

// tests/llm/classify.fixture.test.ts
import fixtures from './fixtures/classify.fixtures.json';
import { ClassificationSchema } from '../../src/core/llm/schemas';

describe('Classification Response Parsing', () => {
  Object.entries(fixtures).forEach(([name, fixture]) => {
    it(`parses ${name} correctly`, () => {
      const parsed = JSON.parse(fixture.raw_response);
      const result = ClassificationSchema.parse(parsed);

      expect(result.category).toBe(fixture.expected_category);
    });
  });
});
```

### 3. 评估测试（较慢，每晚在 CI 中运行）
```typescript
// tests/llm/evals/classify.eval.test.ts
import { classifyTicket } from '../../../src/core/services/ticket';

const TEST_CASES = [
  { input: 'How much does the pro plan cost?', expected: 'sales' },
  { input: 'The app crashes when I click save', expected: 'support' },
  { input: 'You should add dark mode', expected: 'feedback' },
  { input: 'What time is it in Tokyo?', expected: 'other' },
];

describe('Classification Accuracy (Eval)', () => {
  // Skip in regular CI, run nightly
  const runEvals = process.env.RUN_LLM_EVALS === 'true';

  it.skipIf(!runEvals)('achieves >90% accuracy on test set', async () => {
    let correct = 0;

    for (const testCase of TEST_CASES) {
      const result = await classifyTicket(testCase.input);
      if (result.category === testCase.expected) correct++;
    }

    const accuracy = correct / TEST_CASES.length;
    expect(accuracy).toBeGreaterThan(0.9);
  }, 60000); // 60s timeout for LLM calls
});
```

---

## 用于 LLM 测试的 GitHub Actions

```yaml
# .github/workflows/quality.yml (add to existing)
jobs:
  quality:
    # ... existing steps ...

    - name: Run Tests (with LLM mocks)
      run: npm run test:coverage

  llm-evals:
    runs-on: ubuntu-latest
    # Run nightly or on-demand
    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run LLM Evals
        run: npm run test:evals
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          RUN_LLM_EVALS: 'true'
```

---

## 成本与性能跟踪

```typescript
// core/llm/client.ts - add tracking
interface LLMMetrics {
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cost: number;
}

export async function llmCallWithMetrics<T>(
  options: LLMCallOptions<T>
): Promise<{ result: T; metrics: LLMMetrics }> {
  const start = Date.now();

  const response = await client.messages.create({...});

  const metrics: LLMMetrics = {
    model: options.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs: Date.now() - start,
    cost: calculateCost(response.usage, options.model),
  };

  // Log or send to monitoring
  console.log('[LLM]', metrics);

  return { result: parsed, metrics };
}
```

---

## LLM 反模式

- ❌ 在业务逻辑中硬编码提示词——应使用提示词模板
- ❌ 不对 LLM 响应进行模式验证——始终使用 Zod
- ❌ 在 CI 中使用真实的 LLM 调用进行测试——单元测试应使用模拟
- ❌ 不跟踪成本——监控令牌用量
- ❌ 忽略延迟——LLM 调用速度较慢，应采用异步设计
- ❌ LLM 失败时没有回退方案——处理超时和错误
- ❌ 提示词未纳入版本控制——跟踪提示词变更
- ❌ 没有评估套件——持续衡量准确率
- ❌ 使用 LLM 处理确定性逻辑——使用代码进行验证、鉴权和数学运算
- ❌ 使用庞大的单体提示词——组合多个更小且目标明确的提示词