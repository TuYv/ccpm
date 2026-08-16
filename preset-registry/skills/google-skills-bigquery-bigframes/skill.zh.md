---
name: bigquery-bigframes
metadata:
  category: BigDataAndAnalytics
description: >-
  Generates Python code using BigQuery DataFrames (BigFrames), the pandas/scikit-learn-style API over BigQuery. Use when writing BigFrames code or doing pandas-style dataframe/ML work against BigQuery (e.g. in a notebook). Don't use for SQL-first workflows or the google-cloud-bigquery client library — use bigquery-basics.
---
# BigFrames（BigQuery DataFrame）基础
BigFrames 是一个 Python 库，让你能够使用熟悉的 Python API，
充分利用 BigQuery 的数据处理能力。

## DataFrame API 最佳实践
* **将处理留在云端**：通过 BigFrames 方法执行数据清理、转换和分析，
  以利用 BigQuery 的规模化处理能力，而不是下载数据。
* **优先使用部分排序模式**：导入 BigFrames 后立即启用部分排序模式。
  这会放宽对行顺序的约束，从而显著加快数据处理速度。
  ```python
  import bigframes.pandas as bpd
  bpd.options.bigquery.ordering_mode = 'partial'
  ```
* **使用 `peek()` 预览数据**：使用 `peek(n)` 而不是 `head(n)` 来预览数据。
  `peek(n)` 会随机抽取 `n` 行，因此速度要快得多。
  `head(n)` 会按严格顺序返回行，并且在 `partial` 排序模式下会失败，
  除非已对 DataFrame 进行显式排序。
* **避免在本地实体化数据**：`to_pandas()` 等方法会将所有数据下载到
  客户端内存中，绕过 BigQuery 的分布式计算，并可能导致内存不足（OOM）
  错误。除非满足以下条件，否则不要在本地实体化数据：
  * 数据集足够小，可以安全地放入内存。
  * 错误消息明确要求在本地实体化。
* **优先使用 DataFrame API，而不是 SQL 查询**：如果 DataFrame/Series
  方法可以实现相同结果，请勿通过 `read_gbq()` 编写原始 SQL 查询，
  因为这会破坏 Pandas 抽象，并阻碍查询的惰性执行。
* **优先使用访问器，而不是 UDF/Lambda**：
    * 使用内置访问器（例如 `df.col.str.*`、`df.col.dt.*`），而不是
      远程用户定义函数（UDF）。UDF 的部署需要额外的资源和时间。
    * 不要将 lambda 与 `Series.map()` 或 `DataFrame.apply()` 一起使用。
      如果函数没有 `udf` 或 `remote_function` 装饰器，这些方法将不接受它。
    ```python
    # Avoid:
    df["upper"] = df["name"].map(lambda x: x.upper())

    # Prefer:
    df["upper"] = df["name"].str.upper()
    ```
* **验证架构**：不要假设中间输出的架构。主动使用 `.dtypes` 验证架构，
  并使用 `display()` 和 `.peek()` 检查样本记录。
* **可视化**：尽可能直接从 BigFrames DataFrame/Series 绘图。
  BigFrames 与 Matplotlib 和 Seaborn 兼容。如果直接绘图失败，请使用
  `.plot` 访问器。如果数据集太大而无法绘图，请先聚合或采样数据，
  然后再调用 `.to_pandas()` 在本地绘图。

## 机器学习
* **使用 `bigframes.bigquery.ml` 包**：不要将 Scikit-learn 或其他机器学习
  库与 BigQuery DataFrame 一起使用。标准 Scikit-learn 模型需要将数据
  加载到本地客户端内存中，而 `bigframes.bigquery.ml` 会将训练直接委托给
  BigQuery 的可扩展机器学习引擎。从 `bigframes.bigquery.ml` 导入函数。

### 参考目录
* [线性回归](references/linear_regression.md)：训练线性回归模型来预测
  数值。
* [逻辑回归](references/logistic_regression.md)：训练逻辑回归模型来预测
  布尔值。

## BigFrames ML（旧版）

BigFrames ML 包（`bigframes.ml`）是一个模仿 scikit-learn API 的旧版包，已不再建议用于新项目。仅当用户明确要求使用 BigFrames ML 时，才使用此包。

* **旧版导入**：当用户要求使用旧版 BigFrames ML 时，从 `bigframes.ml` 而不是 `bigframes.bigquery.ml` 导入工具和类。
* **预测返回 DataFrame**：与 Scikit-learn 不同，BigFrames 的 `predict()` 方法始终返回一个同时包含预测结果和特征的 **DataFrame**，而不是仅包含预测结果的单个序列。
* **不支持 `random_state`**：实例化 BigFrames ML 模型时，不要传入 `random_state` 参数，因为 BigFrames ML 包不支持此参数。
* **自动缩放**：除非用户明确要求，否则不要使用 `OneHotEncoder` 或 `StandardScaler`，因为缩放会自动处理。
* **超参数调优**：使用自定义循环进行超参数调优，因为 BigFrames 不提供 `GridSearchCV` 或 `RandomizedSearchCV`。
* **ARIMA Plus**（预测）：
    * 从 `bigframes.ml.forecasting` 导入。
    * 按时间顺序对数据进行排序，并在训练前以某个时间点为界进行拆分。
    * 确保预测范围小于或等于训练范围。
* **PCA**：BigFrames 的 PCA 类没有 `transform()` 方法。请改用 `predict()`。
* **模型持久化**：要持久化模型，请使用 `model.to_gbq()`。要加载已持久化的模型，请使用 `bpd.read_gbq_model()`。