# Hugging Face

## 概述
AI 模型和数据集中心。提供公共 REST API，用于搜索和浏览 ML 模型、数据集以及 Spaces（演示应用）。

## 工作流

### 查找 ML 模型
1. `searchModels(search)` → `id`（owner/name 格式）
2. `getModel(owner, name)` → pipeline_tag、downloads、tags、cardData、siblings

### 探索数据集
1. `searchDatasets(search)` → `id`（owner/name 格式）
2. `getDataset(owner, name)` → cardData、description、citation、siblings

### 发现演示应用
1. `getSpaces(search)` → `id`、`sdk`、`runtime.stage`

### 研究模型及其数据
1. `searchModels(search)` → `id`（owner/name）
2. `getModel(owner, name)` → `cardData.datasets`（引用的数据集名称）
3. `searchDatasets(search)` → 查找引用的数据集 → `id`
4. `getDataset(owner, name)` → description、citation

## 操作

| 操作 | 用途 | 主要输入 | 主要输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchModels | 查找 ML 模型 | search | id, author, downloads, pipeline_tag, tags | 可按 downloads/likes/trending 排序 |
| getModel | 获取模型详情 | owner, name <- searchModels | id, pipeline_tag, downloads, tags, cardData, siblings | 包含文件列表和相关 Spaces |
| searchDatasets | 查找数据集 | search | id, author, downloads, tags | 可按 downloads/likes/trending 排序 |
| getDataset | 获取数据集详情 | owner, name <- searchDatasets | id, downloads, tags, cardData, description, citation | 包含文件列表 |
| getSpaces | 浏览演示应用 | search | id, author, likes, sdk, runtime | 可按 likes/trending 排序 |

## 快速开始

```bash
# Search for models
openweb huggingface exec searchModels '{"search": "text-generation", "limit": 5}'

# Get model details
openweb huggingface exec getModel '{"owner": "meta-llama", "name": "Llama-2-7b"}'

# Search for datasets
openweb huggingface exec searchDatasets '{"search": "sentiment", "limit": 5}'

# Get dataset details
openweb huggingface exec getDataset '{"owner": "stanfordnlp", "name": "imdb"}'

# Browse Spaces
openweb huggingface exec getSpaces '{"search": "chatbot", "limit": 5}'
```