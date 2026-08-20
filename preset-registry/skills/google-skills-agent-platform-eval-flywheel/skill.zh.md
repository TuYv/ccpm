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
# Agent Platform Eval Flywheel 技能

帮助用户使用 Agent Platform GenAI 评估 SDK（`google.genai` / `agentplatform`）评估并迭代改进 GenAI 模型和智能体。

## 何时使用此技能

-   使用 Agent Platform GenAI 评估 SDK（`client.evals.evaluate()`）评估 GenAI 智能体或模型。
-   从会话追踪记录、pandas DataFrame 或合成生成创建评估数据集。
-   选择、配置或编写自定义评估指标。
-   分析量规裁决、损失模式和聚类失败情况。
-   根据评估结果提出具体的代码/提示词改进建议。
-   评估由 Agent Platform **端点**（BYOM）提供服务的模型，或按 ID 评估 **模型即服务（MaaS）** 模型，包括在需要时先部署模型。对于此情况，请遵循 [references/deployment.md](references/deployment.md)，并使用 `endpoint_evaluation.py` / `maas_evaluation.py` 脚本。

## 安全与确认分级（关键）

在代表用户执行任何命令或脚本之前，你必须根据请求的操作遵守以下安全分级：

1.  **Tier R**：只读（`inspect_results.py`、`compare_results.py`、`validate_dataset.py`、`parse_adk_traces.py`、`render_html_report.py`）
    *   **规则**：无需确认。你可以立即执行这些辅助脚本，以检查数据、验证架构、解析追踪记录或比较评估结果。
2.  **Tier M：具有计算成本的只读操作**（`client.evals.run_inference`、`client.evals.evaluate`、`client.evals.generate_conversation_scenarios`、`client.evals.generate_loss_clusters`）
    *   **规则**：这些操作会调用 LLM 或远程评估服务，消耗计算资源并产生费用。这需要通过提供“是”/“否”选项进行**交互式确认**。一旦获得过一次授权，后续评估无需再次询问。
    *   **同轮限制**：不得在展示确认提示的同一轮中运行评估。询问后应结束当前轮次并等待用户回复；仅在获得明确的“是”/批准后才执行。先打印预览再在用户能够回答前调用工具，不视为已获得确认。

## 设置

这些脚本需要 `vertexai`（来自 `google-cloud-aiplatform[evaluation]`）、`google-genai`、`pandas` 和 `requests`。**不要**创建虚拟环境——它一开始是空的，会隐藏环境中已有的软件包，导致不必要的重复安装。先探测，仅安装缺失的软件包：

```bash
python3 -c "import vertexai, google.genai, pandas, requests" \
  || pip install 'google-cloud-aiplatform[evaluation]>=1.163.0' 'google-genai>=1.0.0'
```

版本说明符必须保持引号：未加引号时，bash 会将 `>=1.154.0` 视为重定向，并静默写入一个空文件，而不是约束安装版本。

需要 `GOOGLE_CLOUD_PROJECT` 和 `GOOGLE_CLOUD_LOCATION`。先检查环境变量；如果缺失，请询问用户。较新的 Gemini 模型通常需要 `location="global"`。

### 正确的 SDK 入口点

```python
import agentplatform
client = agentplatform.Client(project=PROJECT, location=LOCATION)

client.evals.run_inference(model=..., src=...)
client.evals.evaluate(dataset=..., metrics=...)
client.evals.generate_conversation_scenarios(...)
```

以下两个导入看似合理，实际并非如此：

-   `from agentplatform.types import evals` -- 会导致 `ModuleNotFoundError`。`types` 是
    模块，而不是包；请使用 `from agentplatform import types`。
-   `from vertexai.evaluation import PointwiseMetric, EvalTask` -- 已被取代的 SDK。
    其中的类接受不同的参数（`PointwiseMetric` 没有
    `system_instruction`），因此针对它编写的代码会因 `TypeError`
    而非导入错误失败。请始终使用 `agentplatform`。

## 质量飞轮

首次运行时按顺序执行五个阶段，随后循环 2 → 5，直至达到质量
目标。

### 浪费时间的捷径

| 捷径                                 | 失败原因                             |
| ------------------------------------ | ------------------------------------ |
| “我会调低指标阈值                    | 掩盖真实失败。修复智能体，           |
: 这样就能通过。”                     : 而不是降低标准。                     :
| “这个案例不稳定，我会跳过它。”       | 不稳定性揭示了智能体中的非确定性。   |
:                                      : 使用 `temperature=0`                  :
:                                      : 或更严格的指令进行修复。              :
| “我只需要修复评估                    | 如果预期输出持续变化，                |
: 数据集，不需要修复智能体。”          : 智能体就存在行为问题。                :
| “我可以从追踪中判断它能正常工作      | 自我评分无法泛化。                    |
: — 跳过阶段 3。”                      : 始终运行 `evaluate()` 并查看          :
:                                      : 分数。                                :
| “一次迭代就够了。”                   | 预计需要 5–10+ 次迭代。过早停止      |
:                                      : 会使其他指标上的回归问题未被发现。    :

### 1. 准备数据

生成一个 `EvaluationDataset`。存在三种输入形式，选择与用户现有数据
相匹配的一种：

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

多轮代理轨迹会将每段对话包装为 `AgentData` →
    `ConversationTurn` → `AgentEvent`。完整的类型层级请参阅
    [references/dataset_schema.md](references/dataset_schema.md)。

-   **Pandas DataFrame（表格数据源 — CSV、BigQuery、Sheets）：**

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

    列名必须与所选指标期望的字段匹配（各指标的要求表请参阅
    [references/dataset_schema.md](references/dataset_schema.md)）。

-   **冷启动（完全没有数据）：** 使用
    `client.evals.generate_conversation_scenarios(agent=..., config=...)` 在服务器端合成场景——该
    参数为 `agent` 或 `agent_info`，不是 `agents`，并且必须提供 `config`。配置类为
    `types.evals.UserScenarioGenerationConfig`，不是 `types.UserScenarioGenerationConfig`。设置其
    `user_scenario_count`（1-100）：其默认值为 None，客户端接受该值，但服务器会以
    `400 INVALID_ARGUMENT` 拒绝调用。`count` 是单独的字段，不能代替它。第 2 阶段会执行这些场景。

-   **托管代理（Gemini Agents API）：** 评估通过
    [Managed Agents API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/managed-agents)
    创建的代理。使用 `generate_conversation_scenarios` 根据代理的配置创建测试场景，使用
    `run_inference` 执行代理，并使用 `evaluate` 为轨迹评分。这些函数现在接受托管代理和
    交互 ID 作为输入。你也可以使用 `InteractionsDataSource` 评估通过 Interactions API
    记录的现有交互。完整代码模式请参阅
    [references/sdk_patterns.md](references/sdk_patterns.md) 中的模式 8。

对于 ADK 会话转储，请使用 `scripts/parse_adk_traces.py`，而不是手动编写转换代码。

### 2. 运行推理

在数据集中填充响应/轨迹。如果轨迹已经完整（例如生产日志或回放），则**跳过此阶段**。

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

**根据你想要衡量的内容选择指标。** 完整目录请参阅
[references/metric_registry.md](references/metric_registry.md)。

**Agent 指标（多轮、自适应量规）** — 从这里开始进行 Agent 评估。

目标                                          | 指标
--------------------------------------------- | -------------------------------
Agent 是否实现了用户的目标？                   | `multi_turn_task_success`
推理路径是否符合逻辑且高效？                   | `multi_turn_trajectory_quality`
跨轮次的工具/函数调用质量                      | `multi_turn_tool_use_quality`
整体对话质量                                   | `multi_turn_general_quality`
最终响应质量（无需参考答案）                   | `final_response_quality`
最终响应与黄金参考答案的对比                   | `final_response_match`
单轮工具使用                                   | `tool_use_quality`

**通用质量指标（单轮、自适应量规）** — 用于模型评估。

目标                                                  | 指标
----------------------------------------------------- | -----------------------
整体响应质量（推荐的起点）                            | `general_quality`
语言质量（流畅性、连贯性、语法）                      | `text_quality`
遵循特定约束 / 指令的程度                             | `instruction_following`

**静态量规指标（固定标准）** — 与上述指标一同应用。

目标                                              | 指标
------------------------------------------------- | ---------------
捕获幻觉式声明（RAG、事实性回答）                  | `hallucination`
相对于所提供上下文的事实性 / 一致性                | `grounding`
安全策略合规性                                    | `safety`

**没有内置覆盖的领域特定检查：** 编写自定义指标。

-   **预定义：** `types.RubricMetric.<NAME>` — 服务端 AutoRater，无需
    评审模型。
-   **自定义 LLM-as-a-judge：** 使用带有 `prompt_template` 的 `types.LLMMetric`，或使用
    `types.MetricPromptBuilder` 构建结构化量规。始终设置
    `judge_model`；其默认值为 `None`，此时每个案例都会因 `400
    INVALID_ARGUMENT: Error parsing JSON` 而失败。
-   **自定义代码：** 使用 `types.CodeExecutionMetric`，并通过包含
    `def evaluate(instance: dict)` 的 `custom_function` 字符串进行远程沙盒执行；或者使用
    带有 `custom_function=<callable>` 的 `types.Metric` 进行本地执行。

**始终持久化结果**，以便第 4 和第 5 阶段可以读取它。请同时保存 JSON
（机器可读、可比较）和 HTML（人类可读、可链接）：

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

或者事后运行：`scripts/render_html_report.py --type evaluation` 或
`scripts/inspect_results.py --save-html`。

### 4. 分析失败项

读取 `summary_metrics` 和 `eval_case_results` ——绝不要编造分数。使用
`scripts/inspect_results.py --failing-only` 筛选失败项。

对于每个失败的指标，请参阅
[references/failure_patterns.md](references/failure_patterns.md) 了解更深入的
诊断。简要映射如下：

| 失败的指标                          | 需要更改的内容                         |
| ----------------------------------- | -------------------------------------- |
| `multi_turn_task_success` 低        | Agent 未完成目标——                    |
:                                     : 修复编排、缺失的工具调用、            :
:                                     : 过早终止、错误的工具                  :
:                                     : 选择。                                :
| `multi_turn_trajectory_quality` 低  | Agent 达成目标的方式                  |
:                                     : 效率低下——优化规划                    :
:                                     : 提示，移除冗余的工具调用。            :
| `multi_turn_tool_use_quality` 低    | 修复工具描述、参数                    |
:                                     : 文档字符串，或 Agent 关于              :
:                                     : 工具选择的指令。                      :
| `final_response_quality` 低         | 阅读自动生成的评分标准判定；            |
:                                     : 优化指令以解决                        :
:                                     : 得分最低的标准。                      :
| `final_response_match` 低           | Agent 的最终答案与                    |
:                                     : 黄金参考答案不匹配——调整响应          :
:                                     : 格式或更新参考答案。                  :
| `hallucination` 低                 | 收紧指令，使其以工具输出为依据；        |
:                                     : 验证工具是否                          :
:                                     : 实际返回了所声称的数据。              :
| `grounding` 低                     | 响应与提供的上下文相矛盾——添加明确的“仅 |
:                                     : 从上下文引用”指令。                   :
| `safety` 低                        | 添加安全护栏；审查评分标准判定中的      |
:                                     : 违规内容类别。                        :
| `general_quality` / `text_quality`  | 调整系统指令措辞；                     |
: 低                                 : 模型的默认表述对于该任务而言过于        :
:                                     : 泛泛。                                :
| `instruction_following` 低          | Agent 忽略了约束——                    |
:                                     : 在系统指令中重申这些约束              :
:                                     : 或使用更严格的措辞。                  :
| Agent 调用了错误的工具              | 修复工具描述、Agent                    |
:                                     : 指令或 `tool_config`。                :
| Agent 调用了额外的工具              | 添加明确的停止指令，或                  |
:                                     : 切换到                                :
:                                     : `multi_turn_tool_use_quality` 以      :
:                                     : 在评分标准中暴露额外调用。             :

**对于同一指标的 10+ 次失败**，请使用**错误分析服务**将失败聚类为主题（L1/L2 分类法类别），而不是阅读每一条追踪记录：

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

### 5. 优化并迭代

应用针对失败指标的修复。重新运行阶段 3。使用
`scripts/compare_results.py --baseline <prev> --candidate <new>` 进行比较，以确认目标指标有所提升，且没有其他指标退步。

跟踪各轮迭代的进展：

迭代次数 | 指标 A | 指标 B | 所做更改
--------- | -------- | -------- | ----------------------
基线      | 0.62     | 0.55     | —
v2        | 0.78     | 0.68     | 添加了 grounding 提示
v3        | 0.81     | 0.72     | 修复了工具选择

预计每个失败案例需要 5–10+ 轮迭代。只有在案例通过后，才应使用更多评估案例扩展覆盖范围。

## 证明你的工作

绝不要声称你没有从实际 `result` 对象中读取到的评估结果。

-   运行评估后，打印 `summary_metrics` 表
    (`scripts/inspect_results.py`)。
-   修复后，通过 `scripts/compare_results.py` 展示修复前后的结果。
-   在宣布成功之前，确认所有案例都通过——而不只是你正在处理的那一个。

如果你无法提供证据（SDK 调用失败、结果被截断、指标不受支持），请明确说明。不要掩盖缺口。

## 工作规则

1.  **始终先制定计划：** 在编写脚本之前，输出一个 `<plan>` 块，详细说明你即将执行的步骤。
2.  **逐步执行：** 编写脚本，执行它，等待输出，然后再分析。不要在一次回复中完成所有操作。
3.  **标准 Python：** 使用标准 Python 导入（`import agentplatform`、`from google.genai import types`）。不要使用内部导入路径。
4.  **验证后再判断：** 当不确定 SDK 类型或指标时，检查 SDK 源代码，而不是猜测或编造。

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

有关高级模式，请参阅 [references/sdk_patterns.md](references/sdk_patterns.md)：合成数据生成、成对比较、`MetricPromptBuilder`、多智能体评估。

## 随附脚本

脚本                   | 使用时机
---------------------- | -----------
`validate_dataset.py`    | 阶段 3 之前 — 捕获格式错误的 `EvaluationDataset` JSON。
`parse_adk_traces.py`    | 阶段 1 — 将 ADK 会话转储转换为规范数据集格式。
`inspect_results.py`     | 阶段 3/4 — 呈现摘要和每个案例的评分。使用 `--save-html` 生成可浏览的报告。
`compare_results.py`     | 阶段 5 — 对比基线与候选结果，检测回归。
`render_html_report.py`  | 从已保存的结果 JSON 或损失聚类 JSON 渲染 HTML。
`endpoint_evaluation.py` | 针对已部署的 Agent Platform 端点（BYOM）执行阶段 2/3。请参阅 [references/deployment.md](references/deployment.md)。
`maas_evaluation.py`     | 针对按 ID 指定的 Model-as-a-Service 模型执行阶段 2/3。请参阅 [references/deployment.md](references/deployment.md)。