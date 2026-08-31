---
name: add-provider
description: Add a new inference provider to genai-prices, including provider data, matching, usage extractors, update automation, cassettes, agentic checks, generated artifacts, and Python/JavaScript parity tests. Use for a new provider, not a new model on an existing provider.
---
# 添加提供商

将该提供商作为完整且易于维护的集成添加进去。编辑前先阅读 `AGENTS.md`。保留工作树中与此无关的更改。

## 确定支持范围

使用提供商的官方定价页面和模型目录。记录确切的源 URL。

在映射价格前阅读 `prices/units.yml`。只包含当前已发布合约所表示的计费单位。不要为了适配某个提供商而添加单位，因为这会导致 v3 合约变更。在提供商的
`price_comments` 中说明排除的模型类别。

确定官方来源是完整目录，还是仅包含定价页面。这决定了缺失模型是否可以视为潜在的移除。

## 编写提供商 YAML

创建 `prices/providers/<provider>.yml`。绝不要直接编辑生成的产物。

在适用时涵盖以下字段：

- `id`、`name` 和官方 `pricing_urls`
- `api_pattern`：提供商实际使用的 API 主机和路径
- `provider_match`：常见的提供商标识符
- 仅当提供商拥有明确且无歧义的模型 ID 命名空间时，才使用 `model_match`
- 仅当有意继承另一提供商的价格时，才使用 `fallback_model_providers`
- `price_comments`：免费额度、不支持的单位、区域差异或其他计算边界

对于每个受支持的模型：

- 使用确切的 API 模型 ID 作为规范 `id`
- 添加精确的别名，避免与同系列其他模型产生匹配
- 将官方费率映射到正确的单位，例如 `_mtok`、`_kcount` 或 `_mchars`
- 在单位注册表支持表示时，包含缓存、推理、模态、请求和工具费率
- 将 `prices_checked` 设置为验证日期
- 使用带日期的条件价格保留历史价格变化，而不是覆盖旧费率
- 对官方已弃用的模型进行标记；不要从不完整的来源推断模型已被移除

保持模型按 ID 排序。尽可能使用官方文档中的名称和上下文窗口。

## 添加用量提取

检查每种受支持 API 风格的已记录或已文档化响应体。不要假设 OpenAI 兼容端点与提供商的原生端点具有相同的响应。

为报告用量的风格添加提供商提取器。当响应包含模型时，提取模型。当响应省略模型时，返回模型可为空的用量，以便调用方在价格计算期间提供请求模型。单独映射缓存 token。任何映射 `completion_tokens` 的提取器，也必须将提供商的推理 token 明细映射到
`output_reasoning_tokens`。通过公开的 Python 和 JavaScript 提取 API 测试每种风格。

如果 API 响应不报告用量，则保持该风格不受支持，并记录此限制，不要臆造映射。

## 尽可能添加确定性更新

当官方来源公开且结构化时，添加 `prices/src/prices/source_<provider>.py`：

- 使用 `httpx2` 获取数据
- 使用 `Decimal` 解析价格
- 更新 `prices_checked`，同时保留经过整理的名称、别名、上下文窗口和生命周期标记
- 将变更后的费率作为带日期的条件价格追加，而不是覆盖定价历史
- 添加新发现的、属于支持范围的模型
- 在写入前拒绝空结果或可疑的小结果
- 当来源无法读取或结构发生变化时明确失败

通过 `prices.__main__` 暴露 `get_<provider>_prices`。将 `<provider>-get` 添加到 `Makefile`，并将其纳入
`get-all-prices`。

使用 `@pytest.mark.vcr` 测试真实的 HTTP 边界。记录官方响应，检查 cassette，移除凭据和临时 Cookie，提交该
cassette，并通过以下命令证明可以重放：

```bash
uv run pytest tests/test_source_<provider>.py --record-mode=none
```

仅在纯解析器和更新行为测试中使用精简的合成输入。不要用手写的 HTTP mock 替代外部请求。

## 添加代理式监控

将该 provider 添加到 `.github/agentic-price-check-providers.yml`，包括其 YAML 路径、准确的官方来源、支持范围和
单位映射说明。将每个来源域名添加到
`.github/workflows/agentic-price-check-direct-providers.md` 中的 `network.allowed`。

更新工作流中的 provider 数量以及 `.github/workflows/AGENTIC_PRICE_CHECK.md`。使用固定的仓库版本编译生成的锁文件。
绝不要手动编辑锁文件。

```bash
gh aw compile agentic-price-check-direct-providers --no-check-update
gh aw compile agentic-price-check-direct-providers --no-check-update --no-emit --validate --actionlint
```

该代理式工作流是只读的。它通过一个持续更新的问题报告价格差异、新模型、可能被移除的模型、未检查的字段以及
无法读取的来源。

## 验证两种运行时

为以下内容添加针对性的 Python 和 JavaScript 测试：

- 通过显式 provider ID 选择 provider
- 在支持的情况下，通过 API URL 和模型命名空间选择 provider
- 代表性输入、缓存输入和输出的价格计算
- 每一种用量提取器类型
- 可能发生冲突的别名和依赖上下文的匹配
- 更新器解析、元数据保留、写入保护以及 cassette 重放

每次编辑 provider 数据后运行 `make build`。这会重新生成 v2 feed、包数据、模式和 provider 清单。
绝不要手动编辑这些输出或 `tests/dataset/usages.json`。

交接前，运行：

```bash
make all
git diff --check
```

检查 provider YAML、cassette 和生成的差异。确认冻结的 v1 文件未发生变化。遵循 `AGENTS.md` 中关于提交、PR 描述、
AI 免责声明、CI 监控和评审处理的要求。