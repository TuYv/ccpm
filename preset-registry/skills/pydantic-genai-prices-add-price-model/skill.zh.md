---
name: add-price-model
description: >-
  Add a new LLM model (or provider) to genai-prices pricing data, or change the price of one that is
  already there. Use when asked to add/update pricing for a model — e.g. "add grok 4.5", "add the new
  Claude", "update openai o5 prices", "provider X cut its prices". Covers sourcing prices, probing
  OpenRouter for undocumented dated snapshot IDs, editing the provider YAML, preserving price history
  across a rate change, building, verifying resolution, and opening the PR.
---
# 将模型添加到 genai-prices

绝不要手动编辑生成的数据。编辑 `prices/providers/<provider>.yml` 中的提供商 YAML，然后运行
`make build`。线上发布的 payload 是 `prices/new_data/v2/data.json`；`prices/data.json` 和
`prices/data_slim.json` 是**冻结的 v1** 快照，构建步骤已不再写入它们——不要修改。

## 0. 范围：承载此模型的每个提供商，而不只是你被指定的那个

一个模型很少只存在于一个提供商上。大型厂商的旗舰模型会通过云平台和聚合器转售，而每个平台都需要**各自的 YAML 条目**——同一个“添加新的 Claude”的请求意味着需要修改
`anthropic.yml`、`aws.yml`（Bedrock）、`google.yml`（Vertex）以及 `openrouter.yml`。
只添加直接厂商的条目是最常见的遗漏（Opus 5 就是如此，见 #501，之后还需要跟进 #502）。编辑之前，列出所有承载该模型的提供商，并在同一个 PR 中全部覆盖：

- **直接厂商** — `anthropic.yml`、`openai.yml`、`google.yml`（Gemini）、`x_ai.yml` 等。
- **聚合器/网关** — `openrouter.yml`（通常首日就会支持；经常会暴露 `-fast`/`:beta` 变体）。
- **云平台转售商** — `aws.yml`（Bedrock：拆分为 `global.*` + `regional.*`，区域版本约贵 10%），
  `google.yml`（Vertex Claude 条目也位于此处，与 Gemini 分开），Azure（`azure.yml` 仅适用于 Azure **OpenAI**——Foundry 上的 Claude 不在此范围内；记录这一点，但不要强行添加）。

请从每个提供商的文档/模型列表中确认其是否承载该模型；不要想当然。如果某个转售商确实尚未发布该模型，那是**唯一**可以推迟添加该提供商的理由——在 PR 中说明是哪一个提供商以及原因，并在模型发布后跟进（见下文“提供商发布时机”）。“我只被要求处理提供商 X”不是跳过其他提供商的理由。

## 1. 分支

通过 `origin` 上的分支贡献（本仓库是 `pydantic/genai-prices`，不是 fork）。始终基于最新获取的上游代码：

```bash
git fetch origin && git checkout -b <slug> origin/main
```

## 2. 获取价格来源（引用所有内容）

优先从**提供商自己的文档**中获取 input / cached-input / output 每百万 token 的价格和上下文窗口（这是权威来源）。厂商文档通常会省略 **cache-read** 费率——请交叉核对 OpenRouter 的 endpoint API，该 API 会公开此费率：

```
https://openrouter.ai/api/v1/models/<provider>/<model>/endpoints
```

`pricing.input_cache_read` 是按 token 计价的——乘以 1,000,000 即可得到每百万 token 的价格。记录每个数字的来源；将这些来源放入 PR 正文中。

## 3. 探测 OpenRouter，获取带日期的快照 ID（每次都要执行）

提供商会发布带日期的快照 ID（例如 `grok-4.5-20260708`），而这些 ID 不会出现在其文档中。一个真实的最小请求会在响应的 `model` 字段中返回解析后的带日期 ID——请记录它，以便 YAML 的 `match`
能够覆盖未来带日期的快照。

密钥位于 `~/ai-coding-tools/.env` 中，名称为 `OPENROUTER_API_KEY`。不要在内联命令中引用秘密环境变量（某个 hook 会阻止这样做，`env-run` 也会拒绝）——将请求放入一个在内部使用该变量的脚本中，然后使用 `env-run` 运行：

```bash
# scratchpad/or_probe.sh consumes $OPENROUTER_API_KEY internally
~/.claude/scripts/env-run ~/ai-coding-tools/.env -- bash scratchpad/or_probe.sh
```

```bash
curl -sS https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer ${OPENROUTER_API_KEY}" -H "Content-Type: application/json" \
  -d '{"model":"<provider>/<model>","messages":[{"role":"user","content":"hi"}],"max_tokens":5}' \
  | jq '{id, model, provider}'
```

`model` 字段（例如 `x-ai/grok-4.5-20260708`）会显示快照。添加 `regex: '^<model>-\d{8}$'`
子句（以及带 `<provider>/` 前缀的变体）后，无需单独的条目即可解析。

## 4. 添加 YAML 条目

按照 `prices/providers/<provider>.yml` 中同级模型的结构（排序、`match`/`or` 风格以及字段）进行匹配。包括：

- `match.or`：裸 id、`regex: '^<id>-\d{8}$'`、带 `<provider>/` 前缀的裸 id + 日期形式、`-latest`
- `context_window`
- `prices_checked:` **今天的日期**（检查 `currentDate` 系统提醒）
- `prices:` `input_mtok`、`cache_read_mtok`（提供商没有此项时省略）、`output_mtok`

当某个值需要解释或引用来源时，添加 `price_comments` 字段。

这三个键涵盖了常见情况。完整的词汇表源自 `prices/units.yml`——如果模型还会针对其他项目计费（推理或引用 token、按模态计费的费率、1h 缓存写入、网页搜索、请求），请检查该文件。**并非每个键都以每 Mtoken 为单位：**`_kcount` 表示每 1,000 个，`_mchars` 表示每 1M 个字符，`_hours` 表示每 3,600 秒，`_gpixels` 表示每 1e9 个，`_kpages` 表示每 1,000 个页面。在 `_kcount` 键下填写每 Mtoken 的数值虽然是有效的 YAML，但数值会相差 1000 倍。价格还必须覆盖其祖先项——具有
`cache_write_1h_mtok` 的模型也需要 `cache_write_mtok`；`make build` 会告诉你缺少哪个键。

**不要为了让模型匹配而向 `prices/units.yml` 添加新单位。**这会扩大已发布的 v2
架构，而这属于 v3 变更——请参阅 `AGENTS.md` § "Adding a unit"。请改为提交 issue。

**如果新模型是当前旗舰模型，请迁移 family 级别的 `-latest` 别名。**两类 `-latest` 别名可以共存，且行为不同：

- 版本特定的（`<id>-latest`，例如 `grok-4.3-latest`）——始终保留在其自身条目中。
- family 级别 / 裸形式（`<provider>-latest`，例如 `grok-latest`）——表示“当前旗舰模型”，应该指向此刻最新/最好的模型。

添加新的旗舰模型时，**将 family 级别的别名从之前的旗舰模型移到新条目上**（在此处添加，并从原条目中删除）。首先确认提供商的别名实际解析到哪个模型——检查提供商文档；如果可以，调用 API 并读取响应中的 `model` 字段——然后与其保持一致。不要想当然；别名方案因提供商而异（有些厂商根本没有裸 family 别名）。

## 4b. 更改已存在模型的价格

提供商调整费率时，**不要**编辑现有的 `prices:` 块。覆盖这些值会按照新费率重新计算该库过去为该模型计算过的所有请求的价格，因此变更之前的请求也会按新费率计费。GPT-5.6 Luna 和 Terra 就发生过这种情况，#531 中对此进行了说明，而 #535 不得不撤销该更改。

请改为添加一个带日期的条目。将 `prices:` 从映射转换为条件条目列表：

```yaml
prices:
  - prices: # the rates that were already there, unchanged and unconstrained
      input_mtok: 1
      output_mtok: 6
  - constraint:
      # https://developers.openai.com/api/docs/changelog
      start_date: 2026-07-30
    prices: # the new rates
      input_mtok: 0.2
      output_mtok: 1.2
```

- 将不带 `constraint` 的条目放在**最前面**。两个引擎都会反向扫描列表，并采用第一个约束处于生效状态的条目，因此将无约束条目放在最后会使它始终优先。
- 将 `start_date` 设置为提供商新价格生效的日期，而不是今天。在 `start_date` 旁边的 YAML 注释中引用注明该日期的变更日志或公告。
- 将 `prices_checked` 设置为今天。它记录的是你验证价格的时间，与价格发生变化的时间是两个不同的事实。
- 向已经使用列表的模型追加一个条目。保留现有条目不变。

仅在一种情况下原地覆盖：旧值在写入时就是错误的。修正没有值得保留的历史记录。在 PR 正文中说明你属于上述两种情况中的哪一种。

验证边界两侧：

```bash
uv run python -c "
from datetime import datetime, timezone
from genai_prices import calc_price, Usage
u = Usage(input_tokens=1_000_000)
for day in [(2026, 7, 29), (2026, 7, 30)]:
    t = datetime(*day, tzinfo=timezone.utc)
    r = calc_price(u, '<id>', provider_id='<provider_id>', genai_request_timestamp=t)
    print(t.date(), '->', r.model_price.input_mtok, r.total_price)
"
```

然后在 `tests/test_price_calc.py` 中固定这两侧的行为——变更前一天添加一个断言，变更当天添加一个断言。只覆盖当前价格的测试，即使针对被覆盖的历史记录也同样会通过，这正是 #531 能够通过的原因。

## 5. 构建 + 验证解析结果

使用 `make build`，不要只使用 `make build-prices`。已安装的 `genai_prices` 包（以及 JS 包）会读取其**捆绑**的数据（`packages/python/genai_prices/data.py`、`packages/js/src/data.ts`）。`make build-prices` 只会写入 `prices/new_data/v2/*` 和 `prices/providers/.schema.json`——它不会修改捆绑的数据，因此在此之后运行的 `calc_price` 检查验证的是**过时的**包数据，并且可能悄无声息地显示错误结果。`make build` 会运行 `build-prices` + `package-data` + `inject-providers`。

```bash
make build    # build-prices + package-data + inject-providers
```

确认基础 id、带日期的快照、带提供商前缀的带日期 id，以及你修改过的任何 `-latest` 别名，都能解析到预期条目（包含之前的旗舰模型，以证明其特定版本的 `-latest` 没有发生变化）：

```bash
uv run python -c "
from genai_prices import calc_price, Usage
u = Usage(input_tokens=1000, output_tokens=1000)
for m in ['<id>', '<id>-<YYYYMMDD>', '<provider>/<id>-<YYYYMMDD>', '<provider>-latest', '<prev-id>-latest']:
    r = calc_price(u, m, provider_id='<provider_id>')
    print(m, '->', r.model.id, r.model.prices.input_mtok, r.model.prices.output_mtok)
"
```

## 6. 提交、推送、创建 PR

预提交 `build` hook 会重新生成十个路径，因此第一次 `git commit` 会在重写这些文件后中止；重新暂存并再次提交。显式暂存文件 — **绝不要使用 `git add -A`**（这会泄露本地/临时文件）— 也绝不要使用 `--no-verify`，因为正是这个 hook 确保已发布的数据与 YAML 保持同步：

```bash
git add prices/providers/<provider>.yml \
        prices/providers/.schema.json \
        prices/new_data/v2/data.json prices/new_data/v2/data.schema.json \
        prices/new_data/v2/data_slim.json prices/new_data/v2/data_slim.schema.json \
        packages/python/genai_prices/data.py packages/python/genai_prices/data_units.py \
        packages/js/src/data.ts packages/js/src/dataUnits.ts \
        README.md
git commit -m "Add <Provider> <Model> pricing"   # 如果 hooks 重写了文件，再重新运行一次
git push -u origin <slug>
gh pr create --base main --title "Add <Provider> <Model> pricing" --body "..."
```

普通的价格新增通常只会修改其中一部分文件 — 中止的提交之后运行 `git status` 就能知道具体是哪些文件。只有在 `prices/units.yml` 发生变化时，schema 和 `*_units` 文件才会改变，而价格新增不应修改该文件。

绝不要强制推送。PR 正文：价格表、来源（提供商文档 + 用于缓存费率的 OpenRouter），以及范围说明（例如单一变体 / 不支持缓存写入 / 你移动的任何 `-latest` 别名，并为每项附上一行原因）。

推送之后不要闲置 — 持续轮询，直到 CI 通过，并且每条 reviewer 评论（包括 cubic 的评论）都已处理或驳回（参见 `AGENTS.md`）。未解决的 review thread 意味着该 PR 无法合并。

## 提供商发布时机

这是第 0 步的应急出口，而不是默认创建单一提供商 PR 的理由。在同一个 PR 中涵盖已经提供该模型的每个提供商。OpenRouter 通常会在首日列出新模型。只有当某个转售商（Bedrock / Vertex）确实尚未发布时，才应推迟该提供商 — 在 PR 正文中注明它，并在该提供商上线后通过后续 PR 跟进，而不是阻塞其余提供商。