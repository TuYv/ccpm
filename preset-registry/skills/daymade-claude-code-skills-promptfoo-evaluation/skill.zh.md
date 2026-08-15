---
name: promptfoo-evaluation
description: Configures and runs LLM evaluation using Promptfoo framework. Use when setting up prompt testing, creating evaluation configs (promptfooconfig.yaml), writing Python custom assertions, implementing llm-rubric for LLM-as-judge, or managing few-shot examples in prompts. Triggers on keywords like "promptfoo", "eval", "LLM evaluation", "prompt testing", or "model comparison".
---
# Promptfoo 评估

## 概述

此技能提供使用 [Promptfoo](https://www.promptfoo.dev/) 配置和运行 LLM 评估的指导。Promptfoo 是一款用于测试和比较 LLM 输出的开源 CLI 工具。

## 快速开始

```bash
# Initialize a new evaluation project
npx promptfoo@latest init

# Run evaluation
npx promptfoo@latest eval

# View results in browser
npx promptfoo@latest view
```

## 配置结构

典型的 Promptfoo 项目结构：

```
project/
├── promptfooconfig.yaml    # Main configuration
├── prompts/
│   ├── system.md           # System prompt
│   └── chat.json           # Chat format prompt
├── tests/
│   └── cases.yaml          # Test cases
└── scripts/
    └── metrics.py          # Custom Python assertions
```

## 核心配置（promptfooconfig.yaml）

```yaml
# yaml-language-server: $schema=https://promptfoo.dev/config-schema.json
description: "My LLM Evaluation"

# Prompts to test
prompts:
  - file://prompts/system.md
  - file://prompts/chat.json

# Models to compare
providers:
  - id: anthropic:messages:claude-sonnet-4-6
    label: Claude-Sonnet-4.6
  - id: openai:gpt-4.1
    label: GPT-4.1

# Test cases
tests: file://tests/cases.yaml

# Concurrency control (MUST be under commandLineOptions, NOT top-level)
commandLineOptions:
  maxConcurrency: 2

# Default assertions for all tests
defaultTest:
  assert:
    - type: python
      value: file://scripts/metrics.py:custom_assert
    - type: llm-rubric
      value: |
        Evaluate the response quality on a 0-1 scale.
      threshold: 0.7

# Output path
outputPath: results/eval-results.json
```

## 提示词格式

### 文本提示词（system.md）

```markdown
You are a helpful assistant.

Task: {{task}}
Context: {{context}}
```

### 聊天格式（chat.json）

```json
[
  {"role": "system", "content": "{{system_prompt}}"},
  {"role": "user", "content": "{{user_input}}"}
]
```

### 少样本模式

将示例直接嵌入提示词，或使用包含助手消息的聊天格式：

```json
[
  {"role": "system", "content": "{{system_prompt}}"},
  {"role": "user", "content": "Example input: {{example_input}}"},
  {"role": "assistant", "content": "{{example_output}}"},
  {"role": "user", "content": "Now process: {{actual_input}}"}
]
```

## 测试用例（tests/cases.yaml）

```yaml
- description: "Test case 1"
  vars:
    system_prompt: file://prompts/system.md
    user_input: "Hello world"
    # Load content from files
    context: file://data/context.txt
  assert:
    - type: contains
      value: "expected text"
    - type: python
      value: file://scripts/metrics.py:custom_check
      threshold: 0.8
```

## Python 自定义断言

创建用于自定义断言的 Python 文件（例如 `scripts/metrics.py`）：

```python
def get_assert(output: str, context: dict) -> dict:
    """Default assertion function."""
    vars_dict = context.get('vars', {})

    # Access test variables
    expected = vars_dict.get('expected', '')

    # Return result
    return {
        "pass": expected in output,
        "score": 0.8,
        "reason": "Contains expected content",
        "named_scores": {"relevance": 0.9}
    }

def custom_check(output: str, context: dict) -> dict:
    """Custom named assertion."""
    word_count = len(output.split())
    passed = 100 <= word_count <= 500

    return {
        "pass": passed,
        "score": min(1.0, word_count / 300),
        "reason": f"Word count: {word_count}"
    }
```

**要点：**
- 默认函数名为 `get_assert`
- 使用 `file://path.py:function_name` 指定函数
- 返回 `bool`、`float`（分数），或包含 pass/score/reason 的 `dict`
- 通过 `context['vars']` 访问变量

## 使用 LLM 作为评判器（llm-rubric）

```yaml
assert:
  - type: llm-rubric
    value: |
      Evaluate the response based on:
      1. Accuracy of information
      2. Clarity of explanation
      3. Completeness

      Score 0.0-1.0 where 0.7+ is passing.
    threshold: 0.7
    provider: openai:gpt-4.1  # Optional: override grader model
```

**使用中继/代理 API 时**，每个 `llm-rubric` 断言都需要有自己的 `provider` 配置，其中包含 `apiBaseUrl`。否则，评判器会回退到默认的 Anthropic/OpenAI 端点，并出现 401 错误：

```yaml
assert:
  - type: llm-rubric
    value: |
      Evaluate quality on a 0-1 scale.
    threshold: 0.7
    provider:
      id: anthropic:messages:claude-sonnet-4-6
      config:
        apiBaseUrl: https://your-relay.example.com/api
```

**最佳实践：**
- 提供明确的评分标准
- 使用 `threshold` 设置最低通过分数
- 默认评判器使用可用的 API 密钥（OpenAI → Anthropic → Google）
- **使用中继/代理时**：每个 `llm-rubric` 都必须有自己的 `provider`，并包含 `apiBaseUrl`——主 provider 的 `apiBaseUrl` 不会被继承

## 常见断言类型

| 类型 | 用途 | 示例 |
|------|-------|---------|
| `contains` | 检查子字符串 | `value: "hello"` |
| `icontains` | 不区分大小写 | `value: "HELLO"` |
| `equals` | 精确匹配 | `value: "42"` |
| `regex` | 模式匹配 | `value: "\\d{4}"` |
| `python` | 自定义逻辑 | `value: file://script.py` |
| `llm-rubric` | LLM 评分 | `value: "Is professional"` |
| `latency` | 响应时间 | `threshold: 1000` |

## 文件引用

所有 `file://` 路径均相对于 `promptfooconfig.yaml` 所在位置解析（而不是相对于包含该引用的 YAML 文件）。当 `tests:` 引用单独的 YAML 文件时，这是一个常见陷阱——该测试文件中的 `file://` 路径仍然从配置根目录开始解析。

```yaml
# Load file content as variable
vars:
  content: file://data/input.txt

# Load prompt from file
prompts:
  - file://prompts/main.md

# Load test cases from file
tests: file://tests/cases.yaml

# Load Python assertion
assert:
  - type: python
    value: file://scripts/check.py:validate
```

## 运行评估

```bash
# Basic run
npx promptfoo@latest eval

# With specific config
npx promptfoo@latest eval --config path/to/config.yaml

# Output to file
npx promptfoo@latest eval --output results.json

# Filter tests
npx promptfoo@latest eval --filter-metadata category=math

# View results
npx promptfoo@latest view
```

## 中继/代理 API 配置

使用 API 中继或代理而不是直接连接 Anthropic/OpenAI 端点时：

```yaml
providers:
  - id: anthropic:messages:claude-sonnet-4-6
    label: Claude-Sonnet-4.6
    config:
      max_tokens: 4096
      apiBaseUrl: https://your-relay.example.com/api  # Promptfoo appends /v1/messages

# CRITICAL: maxConcurrency MUST be under commandLineOptions (NOT top-level)
commandLineOptions:
  maxConcurrency: 1  # Respect relay rate limits
```

**关键规则：**
- `apiBaseUrl` 应放在 `providers[].config` 中——Promptfoo 会自动追加 `/v1/messages`
- `maxConcurrency` 必须位于 `commandLineOptions:` 下——将其放在顶层会被静默忽略
- 将中继与 LLM 评判器结合使用时，请设置 `maxConcurrency: 1`，以避免触发并发请求限制（生成和评分共享同一个请求池）
- 通过 `ANTHROPIC_API_KEY` 环境变量传递中继令牌

## 故障排除

**找不到 Python：**
```bash
export PROMPTFOO_PYTHON=python3
```

**大型输出被截断：**
超过 30000 个字符的输出会被截断。请在断言中使用 `head_limit`。

**找不到文件错误：**
所有 `file://` 路径均相对于 `promptfooconfig.yaml` 所在位置解析。

**`maxConcurrency` 被忽略（显示“up to N at a time”）：**
`maxConcurrency` 必须位于 `commandLineOptions:` 下，而不是 YAML 顶层。这是一个常见错误。

**使用中继 API 时，LLM 评判器返回 401：**
每个 `llm-rubric` 断言都必须拥有自己的 `provider`，并包含 `apiBaseUrl`。评分器断言不会继承主提供商配置。

**模型输出中的 HTML 标签导致指标虚高：**
模型可能会在结构化内容中输出 `<br>`、`<b>` 等。在测量之前，请在 Python 断言中移除 HTML：
```python
import re
clean_text = re.sub(r'<[^>]+>', '', raw_text)
```

## 回显提供商（预览模式）

使用 **回显提供商**，无需发起 API 调用即可预览渲染后的提示词：

```yaml
# promptfooconfig-preview.yaml
providers:
  - echo  # Returns prompt as output, no API calls

tests:
  - vars:
      input: "test content"
```

**使用场景：**
- 在进行昂贵的 API 调用之前预览提示词渲染结果
- 验证少样本示例是否已正确加载
- 调试变量替换问题
- 验证提示词结构

```bash
# Run preview mode
npx promptfoo@latest eval --config promptfooconfig-preview.yaml
```

**成本：** 免费——不消耗 API 令牌。

## 高级少样本实现

### 多轮对话模式

对于包含完整示例的复杂少样本学习：

```json
[
  {"role": "system", "content": "{{system_prompt}}"},

  // Few-shot Example 1
  {"role": "user", "content": "Task: {{example_input_1}}"},
  {"role": "assistant", "content": "{{example_output_1}}"},

  // Few-shot Example 2 (optional)
  {"role": "user", "content": "Task: {{example_input_2}}"},
  {"role": "assistant", "content": "{{example_output_2}}"},

  // Actual test
  {"role": "user", "content": "Task: {{actual_input}}"}
]
```

**测试用例配置：**

```yaml
tests:
  - vars:
      system_prompt: file://prompts/system.md
      # Few-shot examples
      example_input_1: file://data/examples/input1.txt
      example_output_1: file://data/examples/output1.txt
      example_input_2: file://data/examples/input2.txt
      example_output_2: file://data/examples/output2.txt
      # Actual test
      actual_input: file://data/test1.txt
```

**最佳实践：**
- 使用 1–3 个少样本示例（更多示例可能会削弱效果）
- 确保示例与任务格式完全一致
- 从文件加载示例，以提高可维护性
- 首先使用回显提供商验证结构

## 长文本处理

对于中文/长篇内容评估（1 万字符以上）：

**配置：**

```yaml
providers:
  - id: anthropic:messages:claude-sonnet-4-6
    config:
      max_tokens: 8192  # Increase for long outputs

defaultTest:
  assert:
    - type: python
      value: file://scripts/metrics.py:check_length
```

**用于文本指标的 Python 断言：**

```python
import re

def strip_tags(text: str) -> str:
    """Remove HTML tags for pure text."""
    return re.sub(r'<[^>]+>', '', text)

def check_length(output: str, context: dict) -> dict:
    """Check output length constraints."""
    raw_input = context['vars'].get('raw_input', '')

    input_len = len(strip_tags(raw_input))
    output_len = len(strip_tags(output))

    reduction_ratio = 1 - (output_len / input_len) if input_len > 0 else 0

    return {
        "pass": 0.7 <= reduction_ratio <= 0.9,
        "score": reduction_ratio,
        "reason": f"Reduction: {reduction_ratio:.1%} (target: 70-90%)",
        "named_scores": {
            "input_length": input_len,
            "output_length": output_len,
            "reduction_ratio": reduction_ratio
        }
    }
```

## 真实案例

**项目：** 从长篇转录文本中筛选中文短视频内容

**结构：**
```
tiaogaoren/
├── promptfooconfig.yaml          # Production config
├── promptfooconfig-preview.yaml  # Preview config (echo provider)
├── prompts/
│   ├── tiaogaoren-prompt.json   # Chat format with few-shot
│   └── v4/system-v4.md          # System prompt
├── tests/cases.yaml              # 3 test samples
├── scripts/metrics.py            # Custom metrics (reduction ratio, etc.)
├── data/                         # 5 samples (2 few-shot, 3 eval)
└── results/
```

**参见：** `./tiaogaoren/`（示例项目根目录）以了解完整实现。

## 资源

有关详细的 API 参考和高级模式，请参阅 [references/promptfoo_api.md](references/promptfoo_api.md)。