---
name: write-contract
description: Write production-quality GenLayer intelligent contracts. Always pins concrete GenVM runner version hashes and never uses local-only test/latest runner aliases. Covers equivalence principles, storage rules, LLM resilience, and cross-contract interaction.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---
# 编写智能合约

编写能够通过共识、正确处理错误并经受生产环境考验的 GenLayer 智能合约指南。

## 关键：固定 Runner 版本

所有 GenLayer 网络都会拒绝 `py-genlayer:test`、`py-genlayer:latest` 以及未指定版本的 runner 别名。所有生成的合约都必须以固定版本的 runner 依赖头开始。

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

`test` 和 `latest` 是供 GenLayer 运行时开发者使用的本地开发别名。它们可能仅在经过特殊配置、设置了 GenLayer 开发者环境变量的本地 Studio 环境中工作，但在 GenLayer 网络上无法工作，并且不得出现在生成的用户合约中。

返回任何合约代码之前，请确认：

- 第一行是固定的 `Depends` runner 版本哈希。
- 不存在 `py-genlayer:test`。
- 不存在 `py-genlayer:latest`。
- 不存在未指定版本的 `py-genlayer`。

编写或修改合约后，始终使用 `genvm-lint check` 进行检查。

## 何时使用 GenLayer

编写代码之前，先判断该功能是否确实需要 GenLayer 共识。近期构建者反馈表明，许多项目一开始会把 GenLayer 当作通用 AI 后端；应引导他们明确 GenLayer 在链上的共识职责。

当合约必须围绕某个主观判断、外部判断或 AI 介入的判断进行协调或结算，并且需要多个验证者独立验证时，应使用 GenLayer：

- 争议解决：证据必须经过评估，且结果会影响托管资金、支付、声誉或访问权限。
- 预测或预言机类市场：合约需要根据外部证据获取经过独立验证的结果。
- 合规、审核或评分流程：最终决策必须具备足够的可复现性以达成验证者共识，但无法简化为简单的确定性 API 调用。
- 自主代理：需要透明的结算、申诉和可审计的状态转换，而不是依赖私有的链下决策。

在以下情况下，优先使用普通后端、前端或链下 LLM 工作流：

- 前端已经计算出最终答案，而 GenLayer 只会对其进行背书。
- 合约只存储用户提供的数据，不涉及验证者可验证的判断。
- 确定性智能合约、REST API 或数据库任务可以在不使用 AI 共识的情况下完成工作。
- 数据获取或提示步骤没有与链上状态转换、托管资金、支付或可申诉的决策关联。

对于每个合约，在实现之前写明边界：

- **前端/后端负责：** UI、用户身份验证、索引、非权威预览、缓存的市场数据以及便利性分析。
- **GenLayer 合约负责：** 需要共识的最小状态转换、证据输入、验证者比较规则、最终结算效果以及任何申诉或轮换路径。
- **外部来源负责：** 原始事实或文档；除非验证者能够重新获取、规范化并比较这些内容，否则不要将其视为可信数据。

如果边界不明确，请在编码前创建一份单页架构说明：用户操作 -> 证据来源 -> 非确定性调用 -> 等价性原则 -> 状态更新 -> 用户可见的结算。

## 合约骨架

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class MyContract(gl.Contract):
    # Storage fields — typed, persisted on-chain
    owner: Address
    items: TreeMap[str, Item]
    item_order: DynArray[str]

    def __init__(self, param: str):
        self.owner = gl.message.sender_account

    @gl.public.view
    def get_item(self, item_id: str) -> dict:
        return {"id": item_id, "value": self.items[item_id].value}

    @gl.public.write
    def set_item(self, item_id: str, value: str) -> None:
        if gl.message.sender_account != self.owner:
            raise gl.UserError("Only owner")
        self.items[item_id] = Item(value=value)
        self.item_order.append(item_id)
```

## 运行器依赖

合约的第一行声明 GenVM Python 运行器。始终固定具体的运行器版本哈希。所有 GenLayer 网络都会拒绝生成合约中的 `test`、`latest` 和未指定版本的运行器别名。

### 单文件 Python 合约

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

### 多文件 Python 合约包

当合约分布在多个文件中时，使用 `py-genlayer-multi`。

```python
# { "Depends": "py-genlayer-multi:06zyvrlivjga0d5jlpdbprksc0pa6jmllxvp8s20hq1l512vh5yk" }
```

### 使用嵌入或语义搜索的合约

在主 Python 运行器之前，通过 `Seq` 块添加 `py-lib-genlayer-embeddings`。

```python
# {
#   "Seq": [
#     { "Depends": "py-lib-genlayer-embeddings:0bmbm3cyfwxsyh454z53vxqjf47wz2q7smcqp1q4g4a6k2kidnyk" },
#     { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
#   ]
# }
```

## 等价性原则 — 使用哪一种

这是最关键的决策。选择错误会导致共识失败，或使系统很容易遭到利用。

### 决策树

```
Can validators reproduce the exact same normalized output?
├── YES → strict_eq
│         Exact match. Use when outputs are deterministic or can be
│         canonicalized (e.g., JSON with sort_keys=True).
│         Examples: blockchain RPC, stable REST APIs.
│
└── NO  → Write a custom validator function (run_nondet_unsafe)
          Default: produce independent evidence. Usually rerun the same task
          and compare decision fields, derived status, scores, or other stable
          outputs with explicit tolerances. Only skip the second answer when
          the validator can judge the leader output against source data and criteria.
```

GenLayer 还提供 `prompt_comparative` 和 `prompt_non_comparative` 作为便捷封装，但大多数合约很快就会超出它们的适用范围。应从自定义验证器函数开始，以获得完整的灵活性。

### 默认采用独立验证

对于 LLM 和 Web 操作，绝不要信任 leader。validator 必须使用 leader 的答案之外的证据来验证 leader 答案的实质内容。实际上，这意味着以下做法之一：

- 重新运行相同的 LLM/Web 任务，并比较稳定的决策字段。
- 获取相同的源数据，并独立推导出要存储的状态。
- 针对 leader 输出和 validator 输出运行显式的比较性 LLM 判断。
- 对于开放式输出，根据相同的输入/源数据和明确的标准评判 leader 输出。

不要编写只检查 `leader_result.calldata` 是否具有有效 JSON 结构、是否使用允许的枚举值、摘要是否非空或置信度是否在范围内的 validator。这种验证只验证 leader 的输出，而不是共识。它 100% 信任 leader 的实质性答案，只能证明 leader 正确地格式化了答案。

非比较性验证并不意味着“信任 leader”。它意味着 validator 不会生成第二个候选答案，但仍必须读取相同的输入/源数据，并判断 leader 输出是否符合明确的标准。例如，摘要 validator 应检查所提出的摘要是否忠实于文章、是否涵盖重要内容、是否避免虚构事实，以及是否满足长度/风格约束。

分类、评分、提取、真实性判断、安全判断、排序和结算逻辑几乎总是需要比较性验证：重新运行或独立推导答案，然后比较决策字段、提取字段、分数区间或推导出的状态。如果 validator 只检查 leader 是否选择了 `authentic`、`suspicious` 或 `inconclusive` 等允许的标签，那么实际上就是由 leader 单独做出决定。

### strict_eq — 仅适用于确定性调用

```python
def fetch_balance(self) -> int:
    def call_rpc():
        res = gl.nondet.web.post(rpc_url, body=payload, headers=headers)
        return json.loads(res.body.decode("utf-8"))["result"]
    return gl.eq_principle.strict_eq(call_rpc)
```

绝不要将其用于 LLM 调用，或用于在不同请求之间会发生变化的网页。

### 自定义 Validator 函数（最常见）

这是非确定性操作的默认选择。你需要编写 leader 函数和 validator 函数，并使用自己的比较逻辑。validator 应独立执行或验证相同的实质性任务，然后比较重要的结果字段。

```python
def score_content(self, content: str) -> dict:
    def leader_fn():
        analysis = gl.nondet.exec_prompt(prompt, response_format="json")
        score = _parse_llm_score(analysis)
        return {"score": score, "analysis": str(analysis.get("analysis", ""))}

    def validator_fn(leaders_res: gl.vm.Result) -> bool:
        if not isinstance(leaders_res, gl.vm.Return):
            return _handle_leader_error(leaders_res, leader_fn)

        validator_result = leader_fn()
        leader_score = leaders_res.calldata["score"]
        validator_score = validator_result["score"]

        # 门槛检查：如果任一分数为零（拒绝），两者必须一致
        if (leader_score == 0) != (validator_score == 0):
            return False

        # 容差：在 5 倍/0.5 倍范围内
        if leader_score > 0 and validator_score > 0:
            ratio = leader_score / validator_score
            if ratio > 5.0 or ratio < 0.2:
                return False

        return True

    return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
```

### 便捷包装器

`prompt_comparative` 会重新运行任务，并将两次输出连同你的原则字符串一起发送给 LLM。`prompt_non_comparative` 不会重新运行任务；它会要求验证器根据输入数据和标准判断 leader 的输出。两者都便于原型开发，但存在局限性；对于大多数生产环境契约，建议使用带有显式比较逻辑的自定义验证器函数。

除非你能解释为什么独立再次执行任务没有意义，以及验证器如何仍然能够根据源数据验证 leader 的输出，否则应优先使用 `prompt_comparative`。如果唯一原因是“输出可能不同”，请比较决策字段、规范化输出、推导状态，或使用容差，而不是完全放弃比较。

```python
def resolve(self) -> str:
    def analyze():
        page = gl.get_webpage(url, mode="text")
        return gl.exec_prompt(f"Analyze: {page}\nReturn JSON with outcome and reasoning.")

    return gl.eq_principle.prompt_comparative(
        analyze,
        principle="`outcome` field must be exactly the same. All other fields must be similar.",
    )
```

## 错误分类

对错误进行分类，以便验证器知道如何比较它们。这对于失败路径上的共识至关重要。

```python
ERROR_EXPECTED  = "[EXPECTED]"   # Business logic (deterministic) — exact match required
ERROR_EXTERNAL  = "[EXTERNAL]"   # External API 4xx (deterministic) — exact match required
ERROR_TRANSIENT = "[TRANSIENT]"  # Network/5xx (non-deterministic) — agree if both transient
ERROR_LLM       = "[LLM_ERROR]"  # LLM misbehavior — always disagree, force rotation
```

### 验证器的规范错误处理器

```python
def _handle_leader_error(leaders_res, leader_fn) -> bool:
    leader_msg = leaders_res.message if hasattr(leaders_res, 'message') else ''
    try:
        leader_fn()
        return False  # Leader errored, validator succeeded — disagree
    except gl.vm.UserError as e:
        validator_msg = e.message if hasattr(e, 'message') else str(e)
        # Deterministic errors: must match exactly
        if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
            return validator_msg == leader_msg
        # Transient: agree if both hit transient failure
        if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
            return True
        # LLM or unknown: disagree — forces consensus retry
        return False
    except Exception:
        return False
```

### 应用错误前缀

```python
# Web requests
if response.status >= 400 and response.status < 500:
    raise gl.vm.UserError(f"{ERROR_EXTERNAL} API returned {response.status}")
elif response.status >= 500:
    raise gl.vm.UserError(f"{ERROR_TRANSIENT} API temporarily unavailable")

# LLM responses
if not isinstance(analysis, dict):
    raise gl.vm.UserError(f"{ERROR_LLM} LLM returned non-dict: {type(analysis)}")

# Business logic
if user_balance < amount:
    raise gl.vm.UserError(f"{ERROR_EXPECTED} Insufficient balance")
```

## 存储规则

### 类型 — 使用 GenLayer 类型，而不是 Python 内置类型

| Python | GenLayer | 说明 |
|--------|----------|-------|
| `dict` | `TreeMap[K, V]` | O(log n) 查找，持久化 |
| `list` | `DynArray[T]` | 动态数组，持久化 |
| `int` | `u256` / `i256` | 用于链上数学运算的定长整数 |
| `float` | 谨慎使用 | 参见下方的浮点数指南 |
| `enum` | `str` | 存储 `.value`，而不是枚举本身 |

### 浮点数

- **在 nondet 块中**：原生浮点数可以正常工作，但它们本质上是非确定性的（硬件差异会导致舍入结果不同）。应在验证器逻辑中通过容差或在比较前进行舍入来处理这一点。
- **在 deterministic 块中**：浮点数由软件模拟 — 具有确定性，但速度较慢。
- **对于跨链互操作 / 货币**：使用采用 atto 精度的 `u256`（数值 × 10^18）— 这是所有区块链通用的标准。

### 用于复杂状态的 Dataclass

```python
@allow_storage
@dataclass
class Item:
    name: str
    status: str          # Use str, not Enum
    atto_amount: u256    # Atto-scale (value * 10^18) for money
    created_at: str      # ISO format string
    tags: DynArray[str]
```

### 声明规则

- **存储字段是类级别的类型注解** — 不是在 `__init__` 中进行赋值。类型注解声明存储槽；`__init__` 只设置初始值。

```python
class MyContract(gl.Contract):
    owner: Address            # ← storage field (class-level annotation)
    items: DynArray[str]      # ← storage field
    count: u256               # ← storage field

    def __init__(self):
        self.owner = gl.message.sender_address   # ← initial value only
        # DynArray/TreeMap don't need initialization — they start empty
```

错误示例：
```python
def __init__(self):
    self.owner: Address = gl.message.sender_address  # ← NOT a storage field!
    self.items = []                                    # ← list is not a storage type
```

### 布局规则

- **仅在末尾追加新字段**，前提是使用可升级合约。存储布局与顺序相关 — 重新排序或插入字段会破坏已部署的合约。详情请参见可升级性文档。
- **新字段的默认值** — 对于部署后添加的字段，现有存储读取结果为零值/空值。
- **通过追加来初始化 DynArray/TreeMap**，而不是赋值。`self.items = [x]` 不起作用。
- **O(1) 统计索引** — 在集合旁维护一个 `TreeMap[str, u256]` 计数器，以便快速计数。
- **DynArray 中的复杂数据** — 要存储结构化数据（字典、嵌套对象），请序列化为 JSON 字符串：使用 `json.dumps()`/`json.loads()` 配合 `DynArray[str]`。

## LLM 弹性

LLM 返回的格式不可预测。始终进行防御性解析。

```python
def _parse_llm_score(analysis: dict) -> int:
    """Extract numeric score from LLM response, handling common variations."""
    if not isinstance(analysis, dict):
        raise gl.vm.UserError(f"{ERROR_LLM} Non-dict response: {type(analysis)}")

    # Key aliasing — LLMs use alternate names
    raw = analysis.get("score")
    if raw is None:
        for alt in ("rating", "points", "value", "result"):
            if alt in analysis:
                raw = analysis[alt]
                break

    if raw is None:
        raise gl.vm.UserError(f"{ERROR_LLM} Missing 'score'. Keys: {list(analysis.keys())}")

    # Coerce aggressively — handles int, float, "3", "3.5", whitespace
    try:
        return max(0, int(round(float(str(raw).strip()))))
    except (ValueError, TypeError):
        raise gl.vm.UserError(f"{ERROR_LLM} Non-numeric score: {raw}")
```

### 清理 LLM 输出中的 JSON

```python
def _parse_json(text: str) -> dict:
    """Clean LLM JSON: strip wrapping text, fix trailing commas."""
    import re
    first = text.find("{")
    last = text.rfind("}")
    text = text[first:last + 1]
    text = re.sub(r",(?!\s*?[\{\[\"\'\w])", "", text)  # Remove trailing commas
    return json.loads(text)
```

### 始终使用 response_format="json"

```python
result = gl.nondet.exec_prompt(task, response_format="json")
```

这会告诉 LLM 返回 JSON。但仍需进行验证和清理，因为 LLM 并不总是遵守要求。

## Agentic 模式 — LLM 生成代码 + 确定性评估

LLM 无法可靠地检查输入中的字符（它们可能会臆造 em dash、错误统计字符数等）。但它们可以为这些检查生成正确的 Python 代码。使用 `eval()` 在 `spawn_sandbox()` 内运行 LLM 生成的代码，以确定性地执行检查，然后将结果作为事实依据反馈回去。

```python
def check_rules(self, text: str, rules: str) -> dict:
    def run():
        # Step 1: LLM generates Python checks from natural language rules
        checks = gl.nondet.exec_prompt(
            f"""Generate Python expressions to verify these rules.
Variable `text` contains the post. Skip subjective rules.
Rules: {rules}
Output JSON: {{"checks": [{{"rule": "...", "expression": "..."}}]}}""",
            response_format="json",
        ).get("checks", [])

        # Step 2: eval() all checks in one sandbox — deterministic, no hallucination
        def eval_checks():
            results = []
            for c in checks:
                try:
                    ok = eval(c["expression"], {
                        "__builtins__": {"len": len, "any": any, "all": all, "str": str},
                        "text": text,
                    })
                    results.append({"rule": c["rule"], "result": "SATISFIED" if ok else "VIOLATED"})
                except Exception:
                    pass  # skip broken expressions, let LLM handle the rule
            return results

        check_results = gl.vm.unpack_result(gl.vm.spawn_sandbox(eval_checks))

        # Step 3: LLM scores with ground truth — can't hallucinate what code already verified
        ground_truth = "\n".join(f"- {r['rule']}: {r['result']}" for r in check_results)
        score = gl.nondet.exec_prompt(
            f"""GROUND TRUTH (from code — do NOT override): {ground_truth}
For rules not listed, use your judgment.
Post: {text}  Rules: {rules}
Output: {{"analysis": "...", "passed": true/false}}""",
            response_format="json",
        )

        return {"passed": score.get("passed", False), "analysis": score.get("analysis", ""), "checks": check_results}

    return gl.eq_principle.prompt_comparative(run, "Must agree on passed/failed and same rule violations")
```

使用时机：适用于规则以自然语言指定，并包含 LLM 不可靠的字符级或格式检查的任何契约（特定标点符号、字符数、URL 是否存在、主题标签数量限制等）。

## 跨合约交互

### 从另一个合约读取（同步）

```python
other = gl.get_contract_at(Address(other_address))
value = other.view().get_data()
```

### 向另一个合约写入（异步）

```python
other = gl.get_contract_at(Address(other_address))
other.emit(on="accepted").process_data(payload)  # Non-blocking
```

`emit()` 会将调用加入队列——它会在当前交易之后执行。使用 `on="accepted"`（快速）或 `on="finalized"`（安全）。

**警告：** 如果当前交易在 `emit()` 之后被申诉，已发出的调用仍会发生，但余额可能已经被扣减。

### 工厂模式——部署子合约

```python
def __init__(self, num_workers: int):
    with open("/contract/Worker.py", "rt") as f:
        worker_code = f.read()

    for i in range(num_workers):
        addr = gl.deploy_contract(
            code=worker_code.encode("utf-8"),
            args=[i, gl.message.contract_address],
            salt_nonce=i + 1,
            on="accepted",
        )
        self.worker_addresses.append(addr)
```

工作合约在部署后不可变更。代码变更需要重新部署工厂合约。

### 跨链 RPC 验证

```python
def verify_deposit(self, rpc_url: str, contract_addr: str, call_data: bytes) -> bytes:
    """Verify state on another chain via eth_call."""
    payload = {
        "jsonrpc": "2.0", "id": 1,
        "method": "eth_call",
        "params": [{"to": contract_addr, "data": "0x" + call_data.hex()}, "latest"],
    }

    def fetch():
        res = gl.nondet.web.post(rpc_url, body=json.dumps(payload).encode(),
                                  headers={"Content-Type": "application/json"})
        if res.status != 200:
            raise gl.vm.UserError(f"{ERROR_EXTERNAL} RPC failed: {res.status}")
        data = json.loads(res.body.decode("utf-8"))
        if "error" in data:
            raise gl.vm.UserError(f"{ERROR_EXTERNAL} RPC error: {data['error']}")
        hex_result = data.get("result", "0x")[2:]
        return bytes.fromhex(hex_result) if hex_result else b""

    return gl.eq_principle.strict_eq(fetch)
```

## Web 请求

### 为共识提取稳定字段

外部 API 会返回可变数据（时间戳、计数）。只提取稳定字段：

```python
def leader_fn():
    res = gl.nondet.web.get(api_url)
    data = json.loads(res.body.decode("utf-8"))
    # Only return fields that won't change between leader and validator calls
    return {"id": data["id"], "login": data["login"], "status": data["status"]}
    # NOT: follower_count, updated_at, online_status
```

### 从可变数据推导状态

当原始数据可能不同（例如 CI 检查计数发生变化）时，比较推导出的摘要：

```python
def validator_fn(leaders_res: gl.vm.Result) -> bool:
    validator_checks = leader_fn()

    def derive(checks):
        if not checks: return "pending"
        for c in checks:
            if c.get("conclusion") != "success": return "failing"
        return "success"

    return derive(leaders_res.calldata) == derive(validator_checks)
```

## 反模式

| 不要这样做 | 应改为 | 原因 |
|-------|-----------|-----|
| `py-genlayer:test`、`py-genlayer:latest` 或未指定版本的 `py-genlayer` | 固定文档中指定的 runner 版本哈希 | 所有 GenLayer 网络都会拒绝 runner 别名和未固定版本的依赖 |
| 对 LLM 调用使用 `strict_eq()` | 自定义验证函数 | LLM 输出具有非确定性，`strict_eq` 始终无法通过共识 |
| 存储 `list` 或 `dict` | `DynArray[T]` 或 `TreeMap[K, V]` | Python 内置类型无法持久化 |
| 使用原生 `float` 表示金额 | 使用 Atto 精度的 `u256`（value * 10^18） | 这是区块链之间进行互操作时的标准做法 |
| 在 dataclass 中间插入字段 | 仅追加到末尾（适用于可升级合约） | 存储布局按位置排列，插入字段会移动其后的所有字段 |
| 直接存储 `Enum` | 将 `enum.value` 作为 `str` 存储 | 存储不支持 Enum 类型 |
| 忽略 LLM 响应格式 | 验证类型、清理 JSON、为键设置别名 | LLM 返回的格式不可预测 |
| 仅验证 Schema 或仅验证 leader 输出的 LLM/web 输出验证器 | 重新运行任务、独立推导结果，或与源数据进行核验 | 格式检查只能证明 JSON 格式正确，无法验证 leader 的答案 |
| 对分类、评分、提取决策使用 `prompt_non_comparative` | 使用带字段级比较或容差的比较型验证器 | 决策需要就实质结果达成一致；仅检查允许的标签会让单个 leader 独自决定结果 |
| 让 validator 同意 LLM 错误 | 返回 `False`（不同意）以强制轮换 | 同意错误的 LLM 输出会锁定错误状态 |
| 在合约中使用裸 `Exception` | 使用带错误前缀的 `gl.vm.UserError` | 裸异常会变成无法恢复的 VMError |
| 在验证器中比较可变的 API 字段 | 提取稳定字段或推导状态 | 时间戳、计数等字段会在不同调用之间发生变化 |
| 对大型集合进行 O(n) 扫描 | 维护 TreeMap 索引以实现 O(1) 查找 | 交易受计算限制 |

## 测试策略

1. **先执行 Lint**：`genvm-lint check contracts/my_contract.py`
2. **直接模式测试**：速度快（30ms），无需服务器。用于测试业务逻辑、验证、状态转换。不执行 validator 逻辑。
3. **集成测试**：速度较慢（数秒至数分钟），使用完整共识。用于测试验证器一致性以及真实的 web/LLM 调用。部署前运行。