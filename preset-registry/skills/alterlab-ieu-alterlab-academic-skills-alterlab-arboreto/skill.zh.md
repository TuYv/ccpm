---
name: alterlab-arboreto
description: Infer gene regulatory networks (GRNs) from expression matrices using arboreto's scalable GRNBoost2 and GENIE3 tree-ensemble algorithms with Dask-distributed computation. Use when analyzing bulk or single-cell RNA-seq transcriptomics to map transcription-factor-to-target-gene regulatory interactions, build adjacency networks, or run the GRN-inference step of a SCENIC pipeline on large datasets. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Arboreto

## 概述

Arboreto 是一个计算库，它使用可并行化的算法从基因表达数据中推断基因调控网络（GRN），可从单机扩展到多节点集群。

**核心能力**：根据不同观测（细胞、样本、条件）中的表达模式，识别哪些转录因子（TF）调控哪些靶基因。

## 快速开始

安装 arboreto：
```bash
uv pip install arboreto
```

基本 GRN 推断：
```python
import pandas as pd
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Load expression data (genes as columns)
    expression_matrix = pd.read_csv('expression_data.tsv', sep='\t')

    # Infer regulatory network
    network = grnboost2(expression_data=expression_matrix)

    # Save results (TF, target, importance)
    network.to_csv('network.tsv', sep='\t', index=False, header=False)
```

**重要**：由于 Dask 会生成新进程，请始终使用 `if __name__ == '__main__':` 保护语句。

## 核心能力

### 1. 基本 GRN 推断

适用于标准 GRN 推断工作流，包括：
- 输入数据准备（Pandas DataFrame 或 NumPy array）
- 使用 GRNBoost2 或 GENIE3 运行推断
- 按转录因子进行筛选
- 输出格式及其解释

**参见**：`references/basic_inference.md`

**使用可直接运行的脚本**：对于标准推断任务，请使用 `scripts/basic_grn_inference.py`：
```bash
python scripts/basic_grn_inference.py expression_data.tsv output_network.tsv --tf-file tfs.txt --seed 777
```

### 2. 算法选择

Arboreto 提供两种算法：

**GRNBoost2（推荐）**：
- 基于快速梯度提升的推断
- 针对大型数据集（1 万个以上观测）进行了优化
- 大多数分析的默认选择

**GENIE3**：
- 基于随机森林的推断
- 原始的多元回归方法
- 用于比较或验证

快速比较：
```python
from arboreto.algo import grnboost2, genie3

# Fast, recommended
network_grnboost = grnboost2(expression_data=matrix)

# Classic algorithm
network_genie3 = genie3(expression_data=matrix)
```

**有关详细的算法比较、参数和选择指南**：`references/algorithms.md`

### 3. 分布式计算

将推断从本地多核环境扩展到集群环境：

**本地（默认）**——自动使用所有可用核心：
```python
network = grnboost2(expression_data=matrix)
```

**自定义本地客户端**——控制资源：
```python
from distributed import LocalCluster, Client

local_cluster = LocalCluster(n_workers=10, memory_limit='8GB')
client = Client(local_cluster)

network = grnboost2(expression_data=matrix, client_or_address=client)

client.close()
local_cluster.close()
```

**集群计算**——连接到远程 Dask 调度器：
```python
from distributed import Client

client = Client('tcp://scheduler:8786')
network = grnboost2(expression_data=matrix, client_or_address=client)
```

**有关集群设置、性能优化和大规模工作流**：`references/distributed_computing.md`

## 安装

```bash
uv pip install arboreto
```

**依赖项**：scipy、scikit-learn、numpy、pandas、dask、distributed

## 常见用例

### 单细胞 RNA-seq 分析
```python
import pandas as pd
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Load single-cell expression matrix (cells x genes)
    sc_data = pd.read_csv('scrna_counts.tsv', sep='\t')

    # Infer cell-type-specific regulatory network
    network = grnboost2(expression_data=sc_data, seed=42)

    # importance is unbounded (not a 0-1 probability); keep the top links
    # per target rather than applying an absolute threshold.
    top_links = network.sort_values('importance', ascending=False).groupby('target').head(10)
    top_links.to_csv('grn_top_links.tsv', sep='\t', index=False)
```

### 使用 TF 筛选的 Bulk RNA-seq 分析
```python
from arboreto.utils import load_tf_names
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Load data
    expression_data = pd.read_csv('rnaseq_tpm.tsv', sep='\t')
    tf_names = load_tf_names('human_tfs.txt')

    # Infer with TF restriction
    network = grnboost2(
        expression_data=expression_data,
        tf_names=tf_names,
        seed=123
    )

    network.to_csv('tf_target_network.tsv', sep='\t', index=False)
```

### 比较分析（多种条件）
```python
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Infer networks for different conditions
    conditions = ['control', 'treatment_24h', 'treatment_48h']

    for condition in conditions:
        data = pd.read_csv(f'{condition}_expression.tsv', sep='\t')
        network = grnboost2(expression_data=data, seed=42)
        network.to_csv(f'{condition}_network.tsv', sep='\t', index=False)
```

## 输出解读

Arboreto 返回一个包含调控连接的 DataFrame：

| 列 | 说明 |
|--------|-------------|
| `TF` | 转录因子（调控因子） |
| `target` | 靶基因 |
| `importance` | 调控重要性分数（越高表示越强） |

**筛选策略**：`importance` 是一个无界的相对分数（源自树的特征重要性），而不是概率或相关性——不要应用类似 `> 0.5` 的绝对阈值。推荐：
- 每个靶基因保留前 N 个连接
- 根据本次运行自身的分布计算分位数阈值
- 在 SCENIC 工作流中，保留所有连接，并让下游的 cisTarget 基序剪枝执行筛选

## 与 pySCENIC 集成

Arboreto 是用于单细胞调控网络分析的 SCENIC 流水线的核心组件：

```python
# Step 1: Use arboreto for GRN inference
from arboreto.algo import grnboost2
network = grnboost2(expression_data=sc_data, tf_names=tf_list)

# Step 2: Use pySCENIC for regulon identification and activity scoring
# (See pySCENIC documentation for downstream analysis)
```

## 可复现性

始终设置种子以获得可复现的结果：
```python
network = grnboost2(expression_data=matrix, seed=777)
```

GRNBoost2 具有随机性，因此单个种子只能固定某一次运行，并不能证明结果具有稳健性。要构建共识网络，请使用多个种子运行，并保留重复出现的连接，然后对其重要性取平均值：
```python
import pandas as pd
from distributed import LocalCluster, Client
from arboreto.algo import grnboost2

if __name__ == '__main__':
    client = Client(LocalCluster())

    seeds = [42, 123, 777]
    networks = [
        grnboost2(expression_data=matrix, client_or_address=client, seed=s)
        for s in seeds
    ]
    client.close()

    # Consensus: keep edges present in every run, average their importance
    combined = pd.concat(networks)
    consensus = (combined.groupby(['TF', 'target'])
                 .agg(importance=('importance', 'mean'), n_runs=('importance', 'size'))
                 .reset_index())
    consensus = consensus[consensus['n_runs'] == len(seeds)]
``

## 故障排除

**内存错误**：通过筛选低方差基因来减小数据集大小，或使用分布式计算

**性能缓慢**：使用 GRNBoost2 替代 GENIE3，启用分布式客户端，筛选 TF 列表

**Dask 错误**：确保脚本中包含 `if __name__ == '__main__':` 保护语句

**结果为空**：检查数据格式（基因作为列），确认 TF 名称与基因名称匹配