---
name: alterlab-lamindb
description: Manage, annotate, and trace biological data with LaminDB, an open-source FAIR data framework that makes datasets queryable, versioned, and reproducible. Use when registering or querying biological datasets (scRNA-seq, spatial, flow cytometry), validating and curating data against ontologies (genes, cell types, diseases, tissues), tracking data lineage and computational workflows, building data lakehouses, or wiring integrations with Nextflow, Snakemake, W&B, or MLflow. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# LaminDB

## 概述

LaminDB 是一个面向生物学的开源数据框架，旨在使数据可查询、可追溯、可复现，并符合 FAIR 原则（可发现、可访问、可互操作、可重用）。它通过统一的 Python API 提供一个整合式平台，将湖仓架构、数据血缘追踪、特征存储、生物本体、LIMS（实验室信息管理系统）和 ELN（电子实验记录本）功能结合在一起。

**核心价值主张：**
- **可查询性**：按元数据、特征和本体术语搜索及筛选数据集
- **可追溯性**：从原始数据到分析再到结果的自动化血缘追踪
- **可复现性**：对数据、代码和环境进行版本控制
- **符合 FAIR 原则**：使用生物本体进行标准化注释

## 何时使用此技能

在以下情况中使用此技能：

- **管理生物数据集**：scRNA-seq、bulk RNA-seq、空间转录组学、流式细胞术、多模态数据、EHR 数据
- **追踪计算工作流**：Notebook、脚本、流水线执行（Nextflow、Snakemake、Redun）
- **整理和验证数据**：模式验证、标准化、基于本体的注释
- **使用生物本体**：基因、蛋白质、细胞类型、组织、疾病、通路（通过 Bionty）
- **构建数据湖仓**：跨多个数据集的统一查询接口
- **确保可复现性**：自动版本控制、血缘追踪、环境捕获
- **集成 ML 流水线**：与 Weights & Biases、MLflow、HuggingFace、scVI-tools 连接
- **部署数据基础设施**：搭建本地或基于云的数据管理系统
- **开展数据集协作**：使用标准化元数据共享经过整理和注释的数据

## 核心能力

LaminDB 提供六个相互关联的能力领域，每个领域都在 references 文件夹中有详细说明。

### 1. 核心概念与数据血缘

**核心实体：**
- **工件**：版本化的数据集（DataFrame、AnnData、Parquet、Zarr 等）
- **记录**：实验实体（样本、扰动、仪器）
- **运行与转换**：计算血缘追踪（哪些代码生成了哪些数据）
- **特征**：用于注释和查询的类型化元数据字段

**关键工作流：**
- 从文件或 Python 对象创建工件并对其进行版本控制
- 使用 `ln.track()` 和 `ln.finish()` 追踪 Notebook/脚本的执行
- 使用类型化特征为工件添加注释
- 使用 `artifact.view_lineage()` 可视化数据血缘图
- 按来源查询（查找由特定代码/输入生成的所有输出）

**参考资料：** `references/core-concepts.md` - 阅读此文档，了解有关工件、记录、运行、转换、特征、版本控制和血缘追踪的详细信息。

### 2. 数据管理与查询

**查询能力：**
- 使用自动补全功能浏览和查找注册表
- 使用 `get()`、`one()`、`one_or_none()` 检索单条记录
- 使用比较运算符（`__gt`、`__lte`、`__contains`、`__startswith`）进行筛选
- 基于特征的查询（按已注释的元数据查询）
- 使用双下划线语法跨注册表遍历
- 跨注册表进行全文搜索
- 使用 Q 对象进行高级逻辑查询（AND、OR、NOT）
- 流式处理大型数据集，无需将其加载到内存中

**关键工作流：**
- 使用筛选和排序浏览制品
- 按特征、创建日期、创建者、大小等条件查询
- 分块或使用数组切片流式处理大型文件
- 使用分层键组织数据
- 将制品分组到集合中

**参考：** `references/data-management.md` - 阅读此文档，了解全面的查询模式、筛选示例、流式处理策略和数据组织最佳实践。

### 3. 注释与验证

**整理流程：**
1. **验证**：确认数据集符合所需模式
2. **标准化**：修正拼写错误，将同义词映射到规范术语
3. **注释**：将数据集链接到元数据实体，以便查询

**模式类型：**
- **灵活模式**：仅验证已知列，允许额外的元数据
- **最低要求模式**：指定必要列，允许额外列
- **严格模式**：完全控制结构和值

**支持的数据类型：**
- DataFrames（Parquet、CSV）
- AnnData（单细胞基因组学）
- MuData（多模态）
- SpatialData（空间转录组学）
- TileDB-SOMA（可扩展数组）

**关键工作流：**
- 定义用于数据验证的特征和模式
- 使用 `DataFrameCurator` 或 `AnnDataCurator` 进行验证
- 使用 `.cat.standardize()` 标准化值
- 使用 `.cat.add_ontology()` 映射到本体
- 保存与模式关联的已整理制品
- 按特征查询已验证的数据集

**参考：** `references/annotation-validation.md` - 阅读此文档，了解详细的整理工作流、模式设计范式、验证错误处理方法和最佳实践。

### 4. 生物学本体

**可用本体（通过 Bionty）：**
- 基因（Ensembl）、蛋白质（UniProt）
- 细胞类型（CL）、细胞系（CLO）
- 组织（Uberon）、疾病（Mondo、DOID）
- 表型（HPO）、通路（GO）
- 实验因素（EFO）、发育阶段
- 生物体（NCBItaxon）、药物（DrugBank）

**关键工作流：**
- 使用 `bt.CellType.import_source()` 导入公共本体
- 使用关键词或精确匹配搜索本体
- 使用同义词映射标准化术语
- 探索层级关系（父级、子级、祖先级）
- 根据本体术语验证数据
- 使用本体记录注释数据集
- 创建自定义术语和层级结构
- 处理多生物体上下文（人类、小鼠等）

**参考：** `references/ontologies.md` - 阅读此文档，了解全面的本体操作、标准化策略、层级导航和注释工作流。

### 5. 集成

**工作流管理器：**
- Nextflow：跟踪流水线进程和输出
- Snakemake：集成到 Snakemake 规则中
- Redun：与 Redun 任务跟踪相结合

**MLOps 平台：**
- Weights & Biases：将实验与数据制品关联
- MLflow：跟踪模型和实验
- HuggingFace：跟踪模型微调
- scVI-tools：单细胞分析工作流

**存储系统：**
- 本地文件系统、AWS S3、Google Cloud Storage
- S3 兼容存储（MinIO、Cloudflare R2）
- HTTP/HTTPS 端点（只读）
- HuggingFace 数据集

**数组存储：**
- TileDB-SOMA（支持 cellxgene）
- DuckDB，用于对 Parquet 文件执行 SQL 查询

**可视化：**
- Vitessce，用于交互式空间/单细胞可视化

**版本控制：**
- Git 集成，用于源代码跟踪

**参考：** `references/integrations.md` - 阅读此文件，了解第三方系统的集成模式、代码示例和故障排除方法。

### 6. 设置与部署

**安装：**
- 基础安装：`uv pip install lamindb`
- 安装额外依赖：`uv pip install 'lamindb[gcp,zarr,fcs]'`
- 模块：bionty、wetlab、clinical

**实例类型：**
- 本地 SQLite（开发环境）
- 云存储 + SQLite（小型团队）
- 云存储 + PostgreSQL（生产环境）

**存储选项：**
- 本地文件系统
- 支持可配置区域和权限的 AWS S3
- Google Cloud Storage
- S3 兼容端点（MinIO、Cloudflare R2）

**配置：**
- 云文件缓存管理
- 多用户系统配置
- Git 仓库同步
- 环境变量

**部署模式：**
- 本地开发 → 云端生产环境迁移
- 多区域部署
- 个人实例共享存储

**参考：** `references/setup-deployment.md` - 阅读此文件，了解详细的安装、配置、存储设置、数据库管理、安全最佳实践和故障排除方法。

## 常见用例工作流

### 用例 1：使用本体校验的单细胞 RNA-seq 分析

```python
import lamindb as ln
import bionty as bt
import anndata as ad

# Start tracking
ln.track(params={"analysis": "scRNA-seq QC and annotation"})

# Import cell type ontology
bt.CellType.import_source()

# Load data
adata = ad.read_h5ad("raw_counts.h5ad")

# Validate and standardize cell types
adata.obs["cell_type"] = bt.CellType.standardize(adata.obs["cell_type"])

# Curate with schema
curator = ln.curators.AnnDataCurator(adata, schema)
curator.validate()
artifact = curator.save_artifact(key="scrna/validated.h5ad")

# Link ontology annotations (validated CellType records)
cell_types = bt.CellType.from_values(adata.obs.cell_type)
artifact.cell_types.add(cell_types)  # typed accessor: <registry-name-plural>.add(...)

ln.finish()
```

### 用例 2：构建可查询的数据湖仓

```python
import lamindb as ln

# Register multiple experiments
for i, file in enumerate(data_files):
    artifact = ln.Artifact.from_anndata(
        ad.read_h5ad(file),
        key=f"scrna/batch_{i}.h5ad",
        description=f"scRNA-seq batch {i}"
    ).save()

    # Annotate with features
    artifact.features.add_values({
        "batch": i,
        "tissue": tissues[i],
        "condition": conditions[i]
    })

# Query across all experiments
immune_datasets = ln.Artifact.filter(
    key__startswith="scrna/",
    tissue="PBMC",
    condition="treated"
).to_dataframe()

# Load specific datasets
for artifact in immune_datasets:
    adata = artifact.load()
    # Analyze
```

### 用例 3：集成 W&B 的 ML 流水线

```python
import lamindb as ln
import wandb

# Initialize both systems
wandb.init(project="drug-response", name="exp-42")
ln.track(params={"model": "random_forest", "n_estimators": 100})

# Load training data from LaminDB
train_artifact = ln.Artifact.get(key="datasets/train.parquet")
train_data = train_artifact.load()

# Train model
model = train_model(train_data)

# Log to W&B
wandb.log({"accuracy": 0.95})

# Save model in LaminDB with W&B linkage
import joblib
joblib.dump(model, "model.pkl")
model_artifact = ln.Artifact("model.pkl", key="models/exp-42.pkl").save()
model_artifact.features.add_values({"wandb_run_id": wandb.run.id})

ln.finish()
wandb.finish()
```

### 用例 4：Nextflow 流水线集成

```python
# In Nextflow process script
import lamindb as ln

ln.track()

# Load input artifact
input_artifact = ln.Artifact.get(key="raw/batch_${batch_id}.fastq.gz")
input_path = input_artifact.cache()

# Process (alignment, quantification, etc.)
# ... Nextflow process logic ...

# Save output
output_artifact = ln.Artifact(
    "counts.csv",
    key="processed/batch_${batch_id}_counts.csv"
).save()

ln.finish()
```

## 入门检查清单

要开始高效使用 LaminDB：

1. **安装与设置**（`references/setup-deployment.md`）
   - 安装 LaminDB 和所需的额外依赖
   - 使用 `lamin login` 进行身份验证
   - 使用 `lamin init --storage ...` 初始化实例

2. **学习核心概念**（`references/core-concepts.md`）
   - 理解制品、记录、运行和转换
   - 练习创建和检索制品
   - 在工作流中实现 `ln.track()` 和 `ln.finish()`

3. **掌握查询**（`references/data-management.md`）
   - 练习筛选和搜索注册表
   - 学习基于特征的查询
   - 尝试以流式方式处理大型文件

4. **设置验证**（`references/annotation-validation.md`）
   - 定义与研究领域相关的特征
   - 为数据类型创建模式
   - 练习整理工作流

5. **集成本体**（`references/ontologies.md`）
   - 导入相关的生物学本体（基因、细胞类型等）
   - 验证现有注释
   - 使用本体术语对元数据进行标准化

6. **连接工具**（`references/integrations.md`）
   - 与现有工作流管理器集成
   - 连接机器学习平台以跟踪实验
   - 配置云存储和计算资源

## 关键原则

使用 LaminDB 时，请遵循以下原则：

1. **跟踪一切**：在每次分析开始时使用 `ln.track()`，以自动捕获数据沿袭关系

2. **尽早验证**：在开展大规模分析之前定义模式并验证数据

3. **使用本体**：利用公共生物学本体实现标准化注释

4. **使用键进行组织**：以分层方式构造制品键（例如 `project/experiment/batch/file.h5ad`）

5. **先查询元数据**：在加载大型文件之前进行筛选和搜索

6. **使用版本控制，而不是复制**：使用内置版本控制，而不是为修改创建新键

7. **使用特征进行注释**：为可查询的元数据定义带类型的特征

8. **详尽记录文档**：为制品、模式和转换添加描述

9. **利用数据沿袭关系**：使用 `view_lineage()` 了解数据来源

10. **从本地开始，扩展至云端**：使用 SQLite 在本地开发，使用 PostgreSQL 部署到云端

## 参考文件

此技能包含按功能组织的完整参考文档：

- **`references/core-concepts.md`** - 制品、记录、运行、转换、特征、版本控制、数据沿袭关系
- **`references/data-management.md`** - 查询、筛选、搜索、流式处理、数据组织
- **`references/annotation-validation.md`** - 模式设计、整理工作流、验证策略
- **`references/ontologies.md`** - 生物学本体管理、标准化、层级结构
- **`references/integrations.md`** - 工作流管理器、MLOps 平台、存储系统、工具
- **`references/setup-deployment.md`** - 安装、配置、部署、故障排除

根据当前任务所需的具体 LaminDB 功能，阅读相关的参考文件。

## 其他资源

- **官方文档**：https://docs.lamin.ai
- **API 参考**：https://docs.lamin.ai/api
- **GitHub 仓库**：https://github.com/laminlabs/lamindb
- **教程**：https://docs.lamin.ai/tutorial
- **常见问题**：https://docs.lamin.ai/faq