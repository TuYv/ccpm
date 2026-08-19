---
name: lamindb
description: Use when working with LaminDB, the open-source lineage-native lakehouse for biological datasets and models. Covers setup, artifact registration, query/search, lineage tracking, validation, ontology-backed annotation with Bionty, collections, branches, storage, and workflow integrations.
license: Apache-2.0 license
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# LaminDB

## 概述

LaminDB 是一个面向生物学的开源、原生支持血缘追踪的湖仓。它让数据集和模型具备可查询、可追溯、可验证、可复现以及符合 FAIR（可发现、可访问、可互操作、可复用）原则的特性，同时将数据以开放格式存储在本地文件系统、S3、GCS、Hugging Face、SQLite 和 Postgres 中。

**核心价值主张：**
- **可查询性**：搜索和筛选 artifacts、records、runs、features、schemas 及 collections
- **可追溯性**：跟踪 notebook、script、function 和 pipeline 的输入、输出、参数、源代码及环境
- **验证**：使用 schemas 管理 DataFrame、AnnData、SpatialData、TileDB-SOMA、Parquet、Zarr 及其他生物学格式
- **FAIR 合规性**：借助 Bionty 支持的本体和自定义 registries 标准化注释
- **变更管理**：通过 projects、branches、spaces、collections 以及保存的 notes 或 plans 组织工作

## 何时使用此 Skill

在以下情况下使用此 skill：

- **管理生物学数据集**：scRNA-seq、bulk RNA-seq、空间转录组、流式细胞术、多模态数据、EHR 数据
- **跟踪计算工作流**：Notebook、script、function、shell script 以及 pipeline 执行（Nextflow、Snakemake、Redun）
- **整理和验证数据**：Schema 验证、标准化、基于本体的注释
- **处理生物学本体**：基因、蛋白质、细胞类型、组织、疾病、通路（通过 Bionty）
- **构建数据湖仓**：跨多个数据集提供统一的查询接口
- **确保可复现性**：自动版本控制、血缘追踪、环境捕获
- **集成 ML pipeline**：连接 Weights & Biases、MLflow、Hugging Face、Lightning、scVI-tools
- **部署数据基础设施**：设置本地或基于云的数据管理系统
- **协作处理数据集**：共享经过整理和注释、具有标准化元数据的数据

## 核心能力

LaminDB 提供六个相互关联的能力领域，每个领域都在 references 文件夹中有详细文档。

### 1. 核心概念与数据血缘

**核心实体：**
- **Artifacts**：经过版本控制的数据集（DataFrame、AnnData、Parquet、Zarr 等）
- **Records 与 ULabels**：实验实体、类型化 records 和简单 labels
- **Collections**：经过版本控制的不可变 artifact 集合
- **Runs 与 Transforms**：计算血缘追踪（哪些代码生成了哪些数据）
- **Features**：用于注释和查询的类型化元数据字段
- **Projects、Branches 与 Spaces**：项目分组、变更管理和访问边界

**关键工作流：**
- 从文件或 Python 对象创建 artifact 并进行版本控制
- 使用 `ln.track()` 和 `ln.finish()` 跟踪 notebook/script 的执行
- 使用 `@ln.flow()` 和 `@ln.step()` 跟踪 function 工作流
- 使用 records、ulabels、projects 和类型化 features 为 artifact 添加注释
- 使用 `artifact.view_lineage()` 可视化数据血缘图
- 按来源查询（查找特定代码/输入生成的所有输出）

**参考：** `references/core-concepts.md` - 阅读此文档以详细了解 artifacts、records、runs、transforms、features、版本控制和血缘追踪。

### 2. 数据管理与查询

**查询功能：**
- 使用自动补全探索和查找注册表
- 使用 `get()`、`one()`、`one_or_none()` 获取单条记录
- 使用比较运算符（`__gt`、`__lte`、`__contains`、`__startswith`）进行筛选
- 基于特征的查询，包括使用 `Feature` 对象进行表达式风格的查询
- 使用双下划线语法跨注册表遍历
- 跨注册表进行全文搜索
- 使用 `ln.Q` 对象进行高级逻辑查询（AND、OR、NOT）
- 流式处理大型数据集，无需将其加载到内存中

**关键工作流：**
- 使用筛选条件和排序浏览数据对象
- 按特征、创建日期、创建者、大小等条件查询
- 分块或使用数组切片流式处理大型文件
- 使用层级键组织数据
- 将数据对象分组为集合

**参考：** `references/data-management.md` - 阅读此文档以全面了解查询模式、筛选示例、流式处理策略和数据组织最佳实践。

### 3. 注释与验证

**整理流程：**
1. **验证**：确认数据集符合所需的架构
2. **标准化**：修正拼写错误，将同义词映射到规范术语
3. **注释**：将数据集链接到元数据实体，以便进行查询

**架构类型：**
- **灵活架构**：仅验证已知列，允许额外的元数据
- **最小必需架构**：指定必要列，允许额外列
- **严格架构**：完全控制结构和值

**支持的数据类型：**
- DataFrames（Parquet、CSV）
- AnnData（单细胞基因组学）
- MuData（多模态）
- SpatialData（空间转录组学）
- TileDB-SOMA（可扩展数组）

**关键工作流：**
- 为数据验证定义特征和架构
- 使用 `DataFrameCurator`、`AnnDataCurator`、`SpatialDataCurator` 或 `TiledbsomaExperimentCurator` 进行验证
- 使用 `.cat.standardize()` 标准化值
- 使用 `.cat.add_ontology()` 映射到本体
- 保存与架构关联的整理后数据对象
- 按特征查询经过验证的数据集

**参考：** `references/annotation-validation.md` - 阅读此文档以详细了解数据整理工作流、架构设计模式、验证错误处理方式和最佳实践。

### 4. 生物学本体

**可用本体（通过 Bionty）：**
- 基因（Ensembl）、蛋白质（UniProt）
- 细胞类型（CL）、细胞系（CLO）
- 组织（Uberon）、疾病（Mondo、DOID）
- 表型（HPO）、通路（GO）
- 实验因素（EFO）、发育阶段
- 生物（NCBItaxon）、药物（DrugBank）

**关键工作流：**
- 使用 `bt.CellType.import_source()` 导入公共本体
- 使用关键词匹配或精确匹配搜索本体
- 使用同义词映射标准化术语
- 探索层级关系（父级、子级、祖先）
- 根据本体术语验证数据
- 使用本体记录注释数据集
- 创建自定义术语和层级结构
- 处理多生物 context（人类、小鼠等）

**参考：** `references/ontologies.md` - 阅读此文档以全面了解本体操作、标准化策略、层级导航和注释工作流。

### 5. 集成

**工作流管理器：**
- Nextflow：跟踪流程进程和输出
- Snakemake：集成到 Snakemake 规则中
- Redun：与 Redun 任务跟踪结合
- Lightning：持久化检查点和训练元数据

**MLOps 平台：**
- Weights & Biases：将实验与数据工件关联
- MLflow：跟踪模型和实验
- Hugging Face：跟踪模型微调
- scVI-tools：单细胞分析工作流

**存储系统：**
- 本地文件系统、AWS S3、Google Cloud Storage
- 兼容 S3 的存储（MinIO、Cloudflare R2）
- HTTP/HTTPS 端点（只读）
- HuggingFace 数据集

**数组存储：**
- TileDB-SOMA（支持 cellxgene）
- DuckDB，用于对 Parquet 文件执行 SQL 查询

**可视化：**
- Vitessce，用于交互式空间/单细胞可视化

**版本控制：**
- Git 集成，用于源代码跟踪

**参考：** `references/integrations.md` - 阅读此文档以了解第三方系统的集成模式、代码示例和故障排除。

### 6. 设置与部署

**安装：**
- 当前稳定基线：`lamindb==2.5.1`（发布于 2026-06-01；Python >=3.10，<=3.14）
- 基础安装：`uv pip install 'lamindb==2.5.1'`
- 安装额外组件：`uv pip install 'lamindb[gcp,zarr-v2,fcs]==2.5.1'`
- 仅安装最小命名空间：`uv pip install 'lamindb-core==2.5.1'`
- Bionty 模块：包含在 LaminDB 文档中，并可通过 `uv pip install 'bionty==2.4.0'` 获取
- 可选模块：对于 wetlab 或 clinical schema 模块，应固定经过审核的版本，而不是安装浮动的最新版本

**实例类型：**
- 本地 SQLite（开发）
- 云存储 + SQLite（小型团队）
- 云存储 + PostgreSQL（生产）

**存储选项：**
- 本地文件系统
- AWS S3，支持配置区域和权限
- Google Cloud Storage
- 兼容 S3 的端点（MinIO、Cloudflare R2）

**配置：**
- 云文件的缓存管理
- 多用户系统配置
- Git 仓库同步
- 用于凭据和连接 URL 的命名环境变量

**部署模式：**
- 本地开发 → 云生产环境迁移
- 多区域部署
- 使用个人实例的共享存储

**参考：** `references/setup-deployment.md` - 阅读此文档以了解详细的安装、配置、存储设置、数据库管理、安全最佳实践和故障排除。

## 安全与防护默认设置

在协助进行 LaminDB 设置或集成时：

- 切勿显示、记录或传输实际的 API 密钥、云凭据、数据库密码，或包含机密信息的完整连接字符串。
- 优先使用 IAM 角色、工作负载身份、机密管理器，或使用 `LAMIN_DB_URL`、`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `GOOGLE_APPLICATION_CREDENTIALS` 等命名环境变量；只检查命名变量是否存在，不要检查其值。
- 在保存来自 REST API、外部数据库或用户提供文件的内容之前，使用显式模式或 curator 对其进行验证和清理。
- 为确保安装可复现，请固定软件包版本或使用锁定文件。只有当用户明确希望获取上游最新版本时，才可以使用浮动安装。

## 常见使用场景工作流

### 使用场景 1：带本体验证的单细胞 RNA-seq 分析

```python
import lamindb as ln
import bionty as bt
import anndata as ad

# Start tracking a notebook/script run
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

# Link ontology-backed annotations for queryability
cell_types = bt.CellType.from_values(adata.obs["cell_type"])
artifact.cell_types.add(*cell_types)

ln.finish()
```

### 使用场景 2：构建可查询的数据湖仓

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
    artifact.features.set_values({
        "batch": i,
        "tissue": tissues[i],
        "condition": conditions[i]
    })

# Query across all experiments by annotated features
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

### 使用场景 3：集成 W&B 的 ML 流水线

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
model_artifact.features.set_values({"wandb_run_id": wandb.run.id})

ln.finish()
wandb.finish()
```

### 使用场景 4：Nextflow 流水线集成

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

对于原生 Nextflow 项目，在可用时优先使用 `nf-lamin` 插件和当前的 `nextflow.config` 模式；对于较小或自定义的流水线步骤，则使用内联 Python 跟踪。

## 入门检查清单

要有效开始使用 LaminDB：

1. **安装与设置** (`references/setup-deployment.md`)
   - 安装固定版本的 LaminDB 及所需的额外依赖
   - 使用 `lamin login` 进行身份验证
   - 使用 `lamin init --storage ...` 初始化实例

2. **学习核心概念** (`references/core-concepts.md`)
   - 了解 Artifacts、Records、Runs、Transforms
   - 练习创建和获取 artifacts
   - 在工作流中实现 `ln.track()`/`ln.finish()` 或 `@ln.flow()`/`@ln.step()`

3. **掌握查询** (`references/data-management.md`)
   - 练习过滤和搜索注册表
   - 学习基于 feature 的查询和表达式风格的过滤器
   - 尝试流式处理大型文件

4. **设置验证** (`references/annotation-validation.md`)
   - 定义与研究领域相关的 features
   - 为数据类型创建 schemas
   - 练习整理工作流

5. **集成本体** (`references/ontologies.md`)
   - 导入相关的生物学本体（基因、细胞类型等）
   - 验证现有注释
   - 使用本体术语标准化元数据

6. **连接工具** (`references/integrations.md`)
   - 与现有工作流管理器集成
   - 连接 ML 平台以跟踪实验
   - 配置云存储和计算资源

## 核心原则

使用 LaminDB 时请遵循以下原则：

1. **跟踪一切**：在每次分析开始时使用 `ln.track()`，以自动捕获 lineage

2. **尽早验证**：在进行大量分析之前定义 schemas 并验证数据

3. **使用本体**：利用公共生物学本体实现标准化注释

4. **使用 keys 组织**：以层次结构组织 artifact keys（例如 `project/experiment/batch/file.h5ad`）

5. **先查询元数据**：在加载大型文件之前先进行过滤和搜索

6. **进行版本控制，而不是重复创建**：对修改使用内置版本控制，而不是为修改创建新的 keys

7. **使用 features 添加注释**：定义类型化 features，并使用 `artifact.features.set_values()` 添加可查询的元数据

8. **完整记录文档**：为 artifacts、schemas 和 transforms 添加描述

9. **利用 lineage**：使用 `view_lineage()` 了解数据来源

10. **从本地开始，扩展到云端**：使用 SQLite 进行本地开发，使用 PostgreSQL 部署到云端

## 参考文件

此 skill 包含按功能组织的完整参考文档：

- **`references/core-concepts.md`** - Artifacts、records、runs、transforms、features、版本控制、lineage
- **`references/data-management.md`** - 查询、过滤、搜索、流式处理、数据组织
- **`references/annotation-validation.md`** - Schema 设计、整理工作流、验证策略
- **`references/ontologies.md`** - 生物学本体管理、标准化、层级结构
- **`references/integrations.md`** - 工作流管理器、MLOps 平台、存储系统、工具
- **`references/setup-deployment.md`** - 安装、配置、部署、故障排除

根据当前任务所需的具体 LaminDB 功能，阅读相关的参考文件。

## 其他资源

- **官方文档**：https://docs.lamin.ai
- **API 参考**：https://docs.lamin.ai/api
- **GitHub 代码库**：https://github.com/laminlabs/lamindb
- **教程**：https://docs.lamin.ai/tutorial
- **常见问题**：https://docs.lamin.ai/faq