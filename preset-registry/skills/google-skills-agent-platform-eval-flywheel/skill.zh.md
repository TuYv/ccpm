---
name: agent-platform-eval-flywheel
metadata:
  category: AiAndMachineLearning
description: >-
  Measures and improves the quality of AI models and agents on Google Cloud
  using the Eval Quality Flywheel methodology. Use when evaluating an agent or
  model, building an eval dataset, picking or writing evaluation metrics,
  analyzing failures, comparing results before and after a fix, or when
  guidance is needed on Agent Platform eval methodology — including
  dataset schema, LLM-as-judge scoring, and common failure causes. For
  fine-tuning, use agent-platform-tuning. For general production deployment,
  use agent-platform-deploy.
---
# Agent Platform 评估飞轮技能

帮助用户使用 Agent Platform GenAI Evaluation SDK（`google.genai` / `agentplatform`）评估并迭代改进 GenAI 模型和智能体。

## 何时使用此技能

-   使用 Agent Platform GenAI Evaluation SDK（`client.evals.evaluate()`）评估 GenAI 智能体或模型。
-   从会话轨迹、pandas DataFrame 或合成生成的数据创建评估数据集。
-   选择、配置或编写自定义评估指标。
-   分析评分准则判定、损失模式以及对失败案例进行聚类。
-   根据评估结果提出具体的代码或提示词改进建议。
-   评估部署在 Agent Platform **endpoint** 上的模型（BYOM），或根据 ID 评估 **Model-as-a-Service (MaaS)** 模型——包括在需要时先部署模型。对于这种情况，请遵循 [references/deployment.md](references/deployment.md)，并使用 `endpoint_evaluation.py` / `maas_evaluation.py` 脚本。

## 安全与确认级别（关键）

代表用户执行任何命令或脚本之前，你必须根据所请求的操作遵循以下安全级别：

1.  **Tier R**：只读（`inspect_results.py`、`compare_results.py`、`validate_dataset.py`、`parse_adk_traces.py`、`render_html_report.py`）
    *   **规则**：无需确认。你可以立即执行这些辅助脚本，以检查数据、验证架构、解析轨迹或比较评估结果。
2.  **Tier M：会产生计算成本的只读操作（`client.evals.run_inference`、`client.evals.evaluate`、`client.evals.generate_conversation_scenarios`、`client.evals.generate_loss_clusters`）**
    *   **规则**：这些操作会调用 LLM 或远程评估服务，从而消耗计算资源并产生费用。因此必须提供带有 'Yes'/'No' 选项的**交互式确认**。一旦获得一次授权，后续评估无需再次询问。

## 设置

这些脚本需要 `vertexai`（来自 `google-cloud-aiplatform[evaluation]`）、`google-genai`、`pandas` 和 `requests`。**不要**创建虚拟环境——虚拟环境初始为空，并会隐藏当前环境已经提供的软件包，从而导致重复安装。先探测依赖，并且仅安装缺少的软件包：

```bash
python3 -c "import vertexai, google.genai, pandas, requests" \
  || pip install 'google-cloud-aiplatform[evaluation]>=1.163.0' 'google-genai>=1.0.0'
```

版本说明符必须保持带引号的形式：如果不加引号，bash 会将 `>=1.154.0` 识别为重定向，并悄无声息地写入一个空文件，而不是对安装版本加以限制。

需要设置 `GOOGLE_CLOUD_PROJECT` 和 `GOOGLE_CLOUD_LOCATION`。请先检查环境变量；如果缺失，则询问用户。较新的 Gemini 模型通常需要 `location="global"`。

### 正确的 SDK 入口点

```python
import agentplatform
client = agentplatform.Client(project=PROJECT, location=LOCATION)

client.evals.run_inference(model=..., src=...)
client.evals.evaluate(dataset=..., metrics=...)
client.evals.generate_conversation_scenarios(...)
```

两个看似合理但实际错误的导入方式：

-   `from agentplatform.types import evals` -- 会引发 `ModuleNotFoundError`。`types` 是
    模块而不是包；请使用 `from agentplatform import types`。
-   `from vertexai.evaluation import PointwiseMetric, EvalTask` -- 这是
    已被取代的 SDK。它的类接受不同的参数（`PointwiseMetric` 没有
    `system_instruction`），因此基于它编写的代码会引发 `TypeError`，
    而不是导入错误。请始终使用 `agentplatform`。

## 质量飞轮

首次执行时按顺序完成五个阶段，之后循环执行 2 → 5，直至达到质量
目标。

### 浪费时间的捷径

| 捷径                                 | 失败原因                             |
| ------------------------------------ | ------------------------------------ |
| “我会调低指标阈值，                  | 这会掩盖真正的失败。应该修复智能体， |
: 让它通过。”                          : 而不是降低标准。                     :
| “这个用例不稳定，我会跳过它。”       | 不稳定性暴露了智能体中的非确定性。   |
:                                      : 请使用 `temperature=0` 或更严格的    :
:                                      : 指令进行修复。                       :
| “我只需要修复评估数据集，            | 如果预期输出不断变化，说明智能体存在 |
: 而不是智能体。”                      : 行为问题。                           :
| “我从跟踪记录就能看出它有效          | 自我评分无法泛化。                   |
: ——跳过阶段 3。”                      : 始终运行 `evaluate()` 并查看         :
:                                      : 分数。                               :
| “迭代一次就够了。”                   | 通常需要迭代 5–10 次以上。过早停止   |
:                                      : 会导致其他指标上的回归未被发现。     :

### 1. 准备数据

生成一个 `EvaluationDataset`。输入数据有三种形式，请选择与用户已有
数据相匹配的形式：

-   **`EvalCase` 列表（单轮或多轮）：**

    ```python
    from agentplatform import types
    from google.genai import types as genai_types

    # prompt/reference/response values are Content, not str. UserContent and
    # ModelContent wrap a plain string and set the right role.
    dataset = types.EvaluationDataset(eval_cases=[
        types.EvalCase(
            prompt=genai_types.UserContent("What is 2+2?"),
            responses=[types.ResponseCandidate(
                response=genai_types.ModelContent("4"))],
            reference=types.ResponseCandidate(
                response=genai_types.ModelContent("4")),
        ),
        # For multi-turn agent traces, set agent_data instead of prompt/responses.
    ])
    ```

    多轮智能体跟踪记录会将每段对话依次封装在 `AgentData` →
    `ConversationTurn` → `AgentEvent` 中。完整的类型层次结构请参阅
    [references/dataset_schema.md](references/dataset_schema.md)。

-   **Pandas DataFrame（表格数据源——CSV、BigQuery、Sheets）：**

```python
    import pandas as pd
    from agentplatform import types

    df = pd.DataFrame({
        "prompt":    ["What is 2+2?", "Capital of France?"],
        "response":  ["4",            "Paris"],
        "reference": ["4",            "Paris"],
    })
    dataset = types.EvaluationDataset(eval_dataset_df=df)
    ```

    列名必须与所选指标要求的字段一致（有关各指标的要求表，请参阅
    [references/dataset_schema.md](references/dataset_schema.md)）。

-   **冷启动（完全没有数据）：**使用
    `client.evals.generate_conversation_scenarios(agent=..., config=...)`
    在服务器端合成场景——参数是 `agent` 或 `agent_info`，而不是 `agents`，并且
    `config` 是必需的。配置类是 `types.evals.UserScenarioGenerationConfig`，
    而不是 `types.UserScenarioGenerationConfig`。请设置其 `user_scenario_count`
    （1-100）：其默认值为 None，客户端会接受该值，但服务器会以
    `400 INVALID_ARGUMENT` 拒绝调用。`count` 是一个单独的字段，不能替代它。
    阶段 2 会实际运行这些场景。

-   **托管式智能体（Gemini Agents API）：**评估使用
    [托管式智能体 API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/managed-agents)
    创建的智能体。使用 `generate_conversation_scenarios` 根据智能体的配置创建测试场景，
    使用 `run_inference` 执行智能体，并使用 `evaluate`
    对轨迹进行评分。这些函数现在接受托管式智能体和交互 ID 作为输入。你还可以使用
    `InteractionsDataSource` 评估通过 Interactions API 记录的现有交互。有关完整代码模式，
    请参阅 [references/sdk_patterns.md](references/sdk_patterns.md) 中的模式 8。

对于 ADK 会话转储，请使用 `scripts/parse_adk_traces.py`，而不要手动编写转换代码。

### 2. 运行推理

在数据集中填充响应/轨迹。如果轨迹已经完整（例如生产日志或重放），则**跳过此阶段**。

```python
# Agent eval — pass a callable wrapping the user's ADK Agent/App.
client.evals.run_inference(model=agent_callable, src=dataset)

# Model eval — pass a model ID directly.
client.evals.run_inference(model="gemini-2.5-flash", src=dataset)

# Synthesized scenarios — let the simulator drive.
client.evals.run_inference(
    model=agent_callable,
    src=dataset,
    user_simulator_config=UserSimulatorConfig(max_turn=10),
)

# DataFrame also works as src= — no EvalCase wrapping needed.
client.evals.run_inference(model="gemini-2.5-flash", src=df)

# Managed Agent — pass an agent resource name.
AGENT_RESOURCE = f"projects/{PROJECT_ID}/locations/global/agents/{AGENT_ID}"
client.evals.run_inference(
    agent=AGENT_RESOURCE,
    src=scenarios,
    config={"user_simulator_config": {"max_turn": 3}},
)
```

### 3. 评分（始终运行）

```python
result = client.evals.evaluate(dataset=dataset, metrics=[...])
result.show()  # Interactive HTML report with scores, rubrics, and traces.
```

**根据你想衡量的内容选择指标。** 完整目录见
[references/metric_registry.md](references/metric_registry.md)。

**智能体指标（多轮、自适应评分标准）** — 进行智能体评估时从这里开始。

目标                                          | 指标
--------------------------------------------- | -------------------------------
智能体是否实现了用户的目标？                   | `multi_turn_task_success`
推理路径是否合乎逻辑且高效？                   | `multi_turn_trajectory_quality`
跨轮次的工具/函数调用质量                      | `multi_turn_tool_use_quality`
整体对话质量                                  | `multi_turn_general_quality`
最终响应质量（无需参考答案）                   | `final_response_quality`
最终响应与标准参考答案的匹配程度               | `final_response_match`
单轮工具使用                                  | `tool_use_quality`

**通用质量指标（单轮、自适应评分标准）** — 用于模型评估。

目标                                                  | 指标
----------------------------------------------------- | -----------------------
整体响应质量（推荐起点）                              | `general_quality`
语言质量（流畅性、连贯性、语法）                      | `text_quality`
对特定约束/指令的遵循程度                             | `instruction_following`

**静态评分标准指标（固定标准）** — 与上述指标结合使用。

目标                                              | 指标
------------------------------------------------- | ---------------
识别虚构的断言（RAG、事实性回答）                 | `hallucination`
相对于所提供上下文的事实准确性/一致性             | `grounding`
安全策略合规性                                    | `safety`

**没有内置指标可覆盖的领域特定检查：** 编写自定义指标。

-   **预定义：** `types.RubricMetric.<NAME>` — 服务端 AutoRater，无需
    评判模型。
-   **自定义 LLM 评判器：** 使用带有 `prompt_template` 的 `types.LLMMetric`，或
    使用 `types.MetricPromptBuilder` 构建结构化评分标准。务必设置
    `judge_model`；其默认值为 `None`，否则每个用例都会失败并返回 `400
    INVALID_ARGUMENT: Error parsing JSON`。
-   **自定义代码：** 使用 `types.CodeExecutionMetric`，并提供包含
    `def evaluate(instance: dict)` 的 `custom_function` 字符串，以便在远程沙箱中执行；或者
    使用带有 `custom_function=<callable>` 的 `types.Metric` 在本地执行。

**始终持久化结果**，以便第 4 和第 5 阶段读取。请同时保存 JSON
（机器可读、可进行差异比较）和 HTML（人类可读、可链接）：

```python
import datetime
from pathlib import Path

from agentplatform._genai import _evals_visualization

out_dir = Path("artifacts/grade_results")
out_dir.mkdir(parents=True, exist_ok=True)
ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

# fallback=str, or a DataFrame-backed dataset raises PydanticSerializationError.
result_json = result.model_dump_json(fallback=str)
(out_dir / f"results_{ts}.json").write_text(result_json)

html = _evals_visualization.get_evaluation_html(result_json)
(out_dir / f"results_{ts}.html").write_text(str(html))
```

或在事后运行：`scripts/render_html_report.py --type evaluation` 或
`scripts/inspect_results.py --save-html`。

### 4. 分析失败原因

读取 `summary_metrics` 和 `eval_case_results`——绝不要编造分数。使用
`scripts/inspect_results.py --failing-only` 筛选失败项。

对于每个失败的指标，请参阅
[references/failure_patterns.md](references/failure_patterns.md) 以获取更深入的
诊断。简要对应关系如下：

| 失败的指标                          | 应更改的内容                           |
| ----------------------------------- | -------------------------------------- |
| `multi_turn_task_success` 较低      | 智能体未完成目标——                     |
:                                     : 修复编排、缺失的工具调用、             :
:                                     : 过早终止或错误的工具                   :
:                                     : 选择。                                 :
| `multi_turn_trajectory_quality` 较低 | 智能体以低效的方式                     |
:                                     : 达成目标——优化规划                     :
:                                     : 提示词，移除冗余的工具调用。           :
| `multi_turn_tool_use_quality` 较低  | 修正工具描述、参数                     |
:                                     : 文档字符串或用于                       :
:                                     : 工具选择的智能体指令。                 :
| `final_response_quality` 较低       | 阅读自动生成的评分标准判定；           |
:                                     : 优化指令，以解决                       :
:                                     : 得分最低的标准。                       :
| `final_response_match` 较低         | 智能体的最终答案与                     |
:                                     : 黄金参考答案不匹配——调整响应           :
:                                     : 格式或更新参考答案。                   :
| `hallucination` 较低                | 收紧指令，确保内容基于                  |
:                                     : 工具输出；验证工具                     :
:                                     : 是否确实返回了所声称的数据。           :
| `grounding` 较低                    | 响应与所提供的                         |
:                                     : 上下文矛盾——添加明确的“仅引用          :
:                                     : 上下文内容”指令。                      :
| `safety` 较低                       | 添加安全防护措施；检查                  |
:                                     : 评分标准判定中违规内容的               :
:                                     : 类别。                                 :
| `general_quality` / `text_quality`  | 调整系统指令措辞；                     |
: 较低                                : 模型的默认表述对于该任务而言           :
:                                     : 过于笼统。                             :
| `instruction_following` 较低        | 智能体忽略了约束——                     |
:                                     : 在系统指令中重申这些约束               :
:                                     : 或使用更严格的措辞。                   :
| 智能体调用了错误的工具              | 修正工具描述、智能体                    |
:                                     : 指令或 `tool_config`。                 :
| 智能体调用了额外的工具              | 添加明确的停止指令，或                 |
:                                     : 切换到                                 :
:                                     : `multi_turn_tool_use_quality`，以便    :
:                                     : 在评分标准中揭示额外调用。             :

**对于同一指标出现 10 次以上失败的情况**，使用**错误分析服务**将失败案例聚类为不同主题（L1/L2 分类类别），而不是逐条阅读每个跟踪记录：

```python
# Only supports multi_turn_task_success and multi_turn_tool_use_quality.
# Service runs in the global region.
analysis_client = agentplatform.Client(project="PROJECT_ID", location="global")
response = analysis_client.evals.generate_loss_clusters(
    eval_result=result,
    metric="multi_turn_task_success",
    config={"max_top_cluster_count": 5},
)
for r in response.results:
    for cluster in r.clusters:
        print(
            f"[{cluster.taxonomy_entry.l1_category}/"
            f"{cluster.taxonomy_entry.l2_category}] "
            f"{cluster.item_count} cases — {cluster.taxonomy_entry.description}"
        )
```

保存 `response.model_dump_json()`，并使用 `scripts/render_html_report.py
--type loss-analysis` 进行渲染。

### 5. 优化与迭代

应用针对失败指标的修复。重新运行阶段 3。使用 `scripts/compare_results.py --baseline <prev> --candidate <new>` 进行比较，以确认目标指标有所改善，并且没有其他指标出现回退。

跟踪各次迭代的进展：

迭代版本 | 指标 A | 指标 B | 所做更改
--------- | -------- | -------- | ----------------------
基线  | 0.62     | 0.55     | —
v2        | 0.78     | 0.68     | 添加了事实依据提示词
v3        | 0.81     | 0.72     | 修复了工具选择

预计每个失败案例需要进行 5–10 次以上的迭代。只有当一个案例通过后，才应使用更多评估案例扩大覆盖范围。

## 证明你的工作

绝不要声称你没有从实际 `result` 对象中读取到的评估结果。

-   运行评估后，打印 `summary_metrics` 表
    （`scripts/inspect_results.py`）。
-   修复后，通过 `scripts/compare_results.py` 展示修复前后的对比。
-   在宣布成功之前，确认所有案例均已通过，而不仅仅是你正在处理的那个案例。

如果你无法提供证据（SDK 调用失败、结果被截断、指标不受支持），请明确说明。不要掩盖缺失的信息。

## 交互规则

1.  **始终先制定计划：** 在编写脚本之前，输出一个 `<plan>` 块，详细说明你接下来要执行的步骤。
2.  **逐步执行：** 编写脚本、执行脚本、等待输出，然后进行分析。不要在一个响应中完成所有操作。
3.  **标准 Python：** 使用标准 Python 导入方式（`import agentplatform`、`from google.genai import types`）。不要使用内部导入路径。
4.  **先验证，再猜测：** 当不确定 SDK 类型或指标时，检查 SDK 源代码，而不是猜测或产生幻觉。

## SDK 快速参考

```python
import agentplatform
from agentplatform import types
from google.genai import types as genai_types
import pandas as pd

# Initialize client
client = agentplatform.Client(project="PROJECT_ID", location="LOCATION")

# --- SINGLE-TURN EVAL (pandas DataFrame) -- RECOMMENDED ---
# The converter wraps plain strings for you.
df = pd.DataFrame({
    "prompt":   ["Q1", "Q2"],
    "response": ["A1", "A2"],
})
dataset = types.EvaluationDataset(eval_dataset_df=df)

# --- SINGLE-TURN EVAL (direct EvalCase) ---
# Verbose and easy to get wrong; see references/dataset_schema.md for the
# exact types before using this form.
dataset = types.EvaluationDataset(eval_cases=[
    types.EvalCase(
        prompt=genai_types.UserContent("Query here"),
        responses=[types.ResponseCandidate(
            response=genai_types.ModelContent("Model response here"))],
        reference=types.ResponseCandidate(
            response=genai_types.ModelContent("Ground truth here")),
    ),
])

# --- MULTI-TURN AGENT EVAL ---
agent_data = types.evals.AgentData(
    agents={"my_agent": types.evals.AgentConfig(
        agent_id="my_agent", instruction="You are helpful.")},
    turns=[types.evals.ConversationTurn(turn_index=0, events=[
        types.evals.AgentEvent(author="user",
            content=genai_types.Content(role="user",
                parts=[genai_types.Part(text="Hello")])),
        types.evals.AgentEvent(author="my_agent",
            content=genai_types.Content(role="model",
                parts=[genai_types.Part(text="Hi! How can I help?")])),
    ])],
)
dataset = types.EvaluationDataset(
    eval_cases=[types.EvalCase(agent_data=agent_data)])

# --- METRICS ---
predefined = types.RubricMetric.MULTI_TURN_TRAJECTORY_QUALITY
custom_llm = types.LLMMetric(name="tone",
    prompt_template="Is this polite? Response: {response}")
custom_code = types.CodeExecutionMetric(name="check",
    custom_function='def evaluate(instance): return {"score": 1.0}')

# --- EVALUATE ---
result = client.evals.evaluate(dataset=dataset, metrics=[predefined])

# --- RESULTS ---
for s in result.summary_metrics:
    print(f"{s.metric_name}: mean={s.mean_score}, pass_rate={s.pass_rate}")
for case in result.eval_case_results:
    for cand in case.response_candidate_results:
        for name, r in cand.metric_results.items():
            print(f"  {name}: score={r.score}, explanation={r.explanation}")
```

高级模式请参阅 [references/sdk_patterns.md](references/sdk_patterns.md)：合成数据生成、成对比较、`MetricPromptBuilder`、多智能体评估。

## 捆绑脚本

脚本                     | 使用时机
------------------------ | -----------
`validate_dataset.py`    | 阶段 3 之前——检查格式错误的 `EvaluationDataset` JSON。
`parse_adk_traces.py`    | 阶段 1——将 ADK 会话转储转换为规范的数据集结构。
`inspect_results.py`     | 阶段 3/4——呈现摘要和逐用例评分。使用 `--save-html` 生成可浏览的报告。
`compare_results.py`     | 阶段 5——比较基线与候选结果，检测回归。
`render_html_report.py`  | 根据已保存的结果 JSON 或损失聚类 JSON 呈现 HTML。
`endpoint_evaluation.py` | 针对已部署的 Agent Platform 端点（BYOM）执行阶段 2/3。请参阅 [references/deployment.md](references/deployment.md)。
`maas_evaluation.py`     | 针对按 ID 指定的模型即服务（Model-as-a-Service）模型执行阶段 2/3。请参阅 [references/deployment.md](references/deployment.md)。