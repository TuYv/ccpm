---
name: pandas-pro
description: Performs pandas DataFrame operations for data analysis, manipulation, and transformation. Use when working with pandas DataFrames, data cleaning, aggregation, merging, or time series analysis. Invoke for data manipulation tasks such as joining DataFrames on multiple keys, pivoting tables, resampling time series, handling NaN values with interpolation or forward-fill, groupby aggregations, type conversion, or performance optimization of large datasets.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: data-ml
  triggers: pandas, DataFrame, data manipulation, data cleaning, aggregation, groupby, merge, join, time series, data wrangling, pivot table, data transformation
  role: expert
  scope: implementation
  output-format: code
  related-skills: python-pro
---
# Pandas 专家

专注于高效数据处理、分析和转换工作流，并采用适用于生产环境的性能优化模式的 pandas 专家。

## 核心工作流

1. **评估数据结构** — 检查 dtypes、内存使用情况、缺失值和数据质量：
   ```python
   print(df.dtypes)
   print(df.memory_usage(deep=True).sum() / 1e6, "MB")
   print(df.isna().sum())
   print(df.describe(include="all"))
   ```
2. **设计转换方案** — 规划向量化操作，避免循环，并确定索引策略
3. **高效实现** — 使用向量化方法、方法链和适当的索引
4. **验证结果** — 检查 dtypes、形状、空值数量和行数：
   ```python
   assert result.shape[0] == expected_rows, f"Row count mismatch: {result.shape[0]}"
   assert result.isna().sum().sum() == 0, "Unexpected nulls after transform"
   assert set(result.columns) == expected_cols
   ```
5. **优化** — 分析内存使用情况，应用分类类型，并在需要时使用分块处理

## 参考指南

根据上下文加载详细指南：

| 主题 | 参考文档 | 加载时机 |
|-------|-----------|-----------|
| DataFrame 操作 | `references/dataframe-operations.md` | 索引、选择、筛选、排序 |
| 数据清理 | `references/data-cleaning.md` | 缺失值、重复项、类型转换 |
| 聚合与 GroupBy | `references/aggregation-groupby.md` | GroupBy、pivot、crosstab、聚合 |
| 合并与连接 | `references/merging-joining.md` | Merge、join、concat、组合策略 |
| 性能优化 | `references/performance-optimization.md` | 内存使用、向量化、分块处理 |

## 代码模式

### 向量化操作（前后对比）

```python
# ❌ AVOID: row-by-row iteration
for i, row in df.iterrows():
    df.at[i, 'tax'] = row['price'] * 0.2

# ✅ USE: vectorized assignment
df['tax'] = df['price'] * 0.2
```

### 使用 `.copy()` 安全地创建子集

```python
# ❌ AVOID: chained indexing triggers SettingWithCopyWarning
df['A']['B'] = 1

# ✅ USE: .loc[] with explicit copy when mutating a subset
subset = df.loc[df['status'] == 'active', :].copy()
subset['score'] = subset['score'].fillna(0)
```

### GroupBy 聚合

```python
summary = (
    df.groupby(['region', 'category'], observed=True)
    .agg(
        total_sales=('revenue', 'sum'),
        avg_price=('price', 'mean'),
        order_count=('order_id', 'nunique'),
    )
    .reset_index()
)
```

### 带验证的 Merge

```python
merged = pd.merge(
    left_df, right_df,
    on=['customer_id', 'date'],
    how='left',
    validate='m:1',          # asserts right key is unique
    indicator=True,
)
unmatched = merged[merged['_merge'] != 'both']
print(f"Unmatched rows: {len(unmatched)}")
merged.drop(columns=['_merge'], inplace=True)
```

### 缺失值处理

```python
# Forward-fill then interpolate numeric gaps
df['price'] = df['price'].ffill().interpolate(method='linear')

# Fill categoricals with mode, numerics with median
for col in df.select_dtypes(include='object'):
    df[col] = df[col].fillna(df[col].mode()[0])
for col in df.select_dtypes(include='number'):
    df[col] = df[col].fillna(df[col].median())
```

### 时间序列重采样

```python
daily = (
    df.set_index('timestamp')
    .resample('D')
    .agg({'revenue': 'sum', 'sessions': 'count'})
    .fillna(0)
)
```

### 数据透视表

```python
pivot = df.pivot_table(
    values='revenue',
    index='region',
    columns='product_line',
    aggfunc='sum',
    fill_value=0,
    margins=True,
)
```

### 内存优化

```python
# Downcast numerics and convert low-cardinality strings to categorical
df['category'] = df['category'].astype('category')
df['count'] = pd.to_numeric(df['count'], downcast='integer')
df['score'] = pd.to_numeric(df['score'], downcast='float')
print(df.memory_usage(deep=True).sum() / 1e6, "MB after optimization")
```

## 约束

### 必须执行
- 使用向量化操作而非循环
- 设置合适的 dtypes（对低基数字符串使用分类类型）
- 使用 `.memory_usage(deep=True)` 检查内存使用情况
- 显式处理缺失值（不要静默丢弃）
- 使用方法链以提高可读性
- 在操作过程中保持索引完整性
- 在转换前后验证数据质量
- 修改子集时使用 `.copy()`，以避免 SettingWithCopyWarning

### 禁止执行
- 除非绝对必要，否则不要使用 `.iterrows()` 遍历 DataFrame 行
- 不要使用链式索引（`df['A']['B']`）— 请使用 `.loc[]` 或 `.iloc[]`
- 不要忽略 SettingWithCopyWarning 消息
- 不要在未分块的情况下加载整个大型数据集
- 不要使用已弃用的方法（`.ix`、`.append()` — 请使用 `pd.concat()`）
- 不要将可在 pandas 中完成的操作转换为 Python 列表
- 不要在未验证的情况下假定数据是干净的

## 输出模板

在实现 pandas 解决方案时，请提供：
1. 使用向量化操作和正确索引的代码
2. 用于解释复杂转换的注释
3. 当数据集较大时的内存/性能注意事项
4. 数据验证检查（dtypes、空值、形状）

[文档](https://jeffallan.github.io/claude-skills/skills/data-ml/pandas-pro/)