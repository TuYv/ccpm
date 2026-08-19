---
name: imaging-data-commons
description: Query and download public cancer imaging data from NCI Imaging Data Commons. Invoke for any question about IDC collections, cancer imaging datasets, DICOM data access, radiology (CT, MR, PET) or pathology AI training sets, metadata queries, visualization, or license checks — even when the user doesn't explicitly mention "IDC". No authentication required.
license: This skill is provided under the MIT License. IDC data itself has individual licensing (mostly CC-BY, some CC-NC) that must be respected when using the data.
metadata:
  version: "1.5"
  source-skill-version: 1.8.1
  skill-author: Andrey Fedorov, @fedorov
  idc-index: "0.12.5"
  idc-data-version: "v24"
  repository: https://github.com/ImagingDataCommons/imaging-data-commons-skill
---
# Imaging Data Commons

## 概述

从美国国家癌症研究所 Imaging Data Commons（IDC）查询和下载公开的癌症影像数据。访问数据无需身份验证。

**预期网络访问：** IDC 元数据有三种访问方式——随 `idc-index` Python 软件包提供的本地 DuckDB 索引（无需网络），或通过 MCP 或 REST 访问托管的 IDC 服务（`api.imaging.datacommons.cancer.gov`，无需身份验证）。文件下载使用公共 GCS（`storage.googleapis.com`）和 AWS S3（`s3.amazonaws.com`），无需身份验证。DICOMweb 访问使用公共 IDC 代理（`proxy.imaging.datacommons.cancer.gov`，无需身份验证）或 Google Cloud Healthcare API（`healthcare.googleapis.com`，需要 GCP 身份验证）。可选的 BigQuery 查询（`bigquery.googleapis.com`）同样需要 GCP 身份验证。此 skill 不会访问任何凭据或环境变量。

**当前 IDC 数据版本：v24**（始终进行验证——参见 *最佳实践*）

**首先选择访问路径。** 不存在唯一的默认路径：最经济且正确的路径取决于会话和任务。

1. **当前会话是否已经有 IDC MCP server？** 将发现和元数据查询转到该服务器——参见 *IDC
   MCP Server*。
2. **否则，是否已安装 `idc-index`？** 运行 `python scripts/check_version.py`。如果通过，
   则所有操作都使用 `idc-index`。
3. **未安装，且任务是只读元数据操作**——计数、属性值、collection 查询、少于 10 000 行的
   SQL、许可证、引用、viewer URL？** 使用 `curl` 访问 REST API；不要安装任何东西。**安装会带来约
   77 MB 的打包索引数据以及 pandas、pyarrow 和 duckdb 的开销，而元数据问题并不需要这些。参见
   *数据访问选项*。
4. **未安装，且任务需要的不只是元数据**——下载文件、使用 pandas 或绘图、pydicom/SimpleITK、
   病理切片、超过 10 000 行的结果，或用户会重新运行的固定版本脚本？安装 `idc-index`：
   `check_version.py` 会以非零状态退出，并打印适用于当前解释器的确切安装命令。优先使用虚拟
   环境，然后重启 Python。

`idc-index`（[GitHub](https://github.com/imagingdatacommons/idc-index)）仍然是功能最强的路径，也是唯一能够传输图像字节的路径；这里只是要求不要在任务需要之前就为此付出代价。`check_version.py` 本身从不安装任何东西——当存在更新版本的 `idc-index` 或 skill 时，它也会发出提示。

**`idc-index` 路径的设置：**

```python
from idc_index import IDCClient
client = IDCClient()

# Verify IDC data version (should be "v24")
print(f"IDC data version: {client.get_idc_version()}")
```

**核心工作流：** 使用 `client.sql_query()` 查询元数据 → 使用 `client.download_from_selection()` 下载 → 使用 `client.get_viewer_URL()` 可视化。下面的 Python 示例假设使用此 `client`；*数据访问选项*中提供了 REST 的对应方式。要了解当前数据规模，请运行 `references/sql_patterns.md` 中的汇总查询，或运行 `GET /v3/stats`。

## IDC MCP Server

IDC 运行着一个托管的 MCP server，地址为 `https://api.imaging.datacommons.cancer.gov/mcp`
（可流式传输的 HTTP，无需身份验证）。在可用时，它可以补充下面的 `idc-index` 工作流，但不会
取代该工作流。

通过 MCP 资源 `idc://guide`，或以下工具名称中的三个及以上来**识别它**：
`build_cohort`、`get_cohort_urls`、`list_analysis_results` 和 `get_idc_version`。诸如
`run_sql` 之类的通用名称本身不能作为判断依据。如果无法明确识别，请使用
`idc-index`。

**如果本次会话中有该 server**，请将其视为发现和元数据方面的权威来源 —
IDC 版本、计数、属性值、队列构建、元数据 SQL — 并遵循该 server 自身的指示，而不是
从本文件中重新推导这些信息。其数据版本以 server 报告的版本为准：调用
`get_idc_version`，不要依赖本文件中固定的版本。

对于 server 不支持的操作，请回到这里：下载文件、本地 pandas/notebook
分析、DICOMweb、BigQuery、数字病理切片，以及可复现脚本。将 server 返回的
SeriesInstanceUIDs 传递给 `client.download_from_selection(...)`，以完成交接，并在此时运行
`scripts/check_version.py`。

**如果该 server 不可用**，则可通过 REST API 在无需配置的情况下访问相同的服务，地址为
`https://api.imaging.datacommons.cancer.gov/v3` — 根据 *Overview* 中的路由门控规则，将其
用于只读元数据，而不是安装 `idc-index`。最多只建议连接 MCP server 一次，且仅限于需要
重复进行交互式发现的情况；绝不要自行更改用户的配置。

请参阅 `references/mcp_guide.md`，了解工具清单、交接模式以及针对各主机的说明。

## 何时使用此 Skill

- 查找公开可用的放射学（CT、MR、PET）或病理学（切片显微镜）图像
- 按癌症类型、模态、解剖部位或其他元数据选择图像子集
- 从 IDC 下载 DICOM 数据
- 在研究或商业应用中使用前检查数据许可
- 在浏览器中可视化医学图像，无需本地 DICOM 查看器软件

## 快速导航

下文依次介绍：MCP/REST 路由规则、IDC 数据模型、索引表及其连接方式、核心 API 模式（查询、下载、可视化、许可、引用）、最佳实践和故障排除。

**参考指南（按需加载）：**

| 指南 | 加载时机 |
|-------|--------------|
| `index_tables_guide.md` | 复杂 JOIN、模式发现、DataFrame 访问 |
| `use_cases.md` | 端到端工作流：训练数据集、批量下载、使用 pydicom/SimpleITK 读取 DICOM、流水线集成 |
| `sql_patterns.md` | 快速 SQL 模式：筛选条件发现、注释、大小估算 |
| `clinical_data_guide.md` | 临床/表格数据、影像与临床数据连接、值映射 |
| `licensing_and_citation.md` | 商业使用问题、混合许可队列、引用格式 |
| `cloud_storage_guide.md` | 直接访问 S3/GCS、版本控制、UUID 映射 |
| `dicomweb_guide.md` | DICOMweb 端点、PACS 集成 |
| `digital_pathology_guide.md` | 切片显微镜（SM）、注释（ANN）、病理学工作流 |
| `bigquery_guide.md` | 完整 DICOM 元数据、私有元素（需要 GCP） |
| `cli_guide.md` | 命令行工具（`idc download`、清单文件） |
| `parquet_access_guide.md` | 通过 GCS 直接查询 Parquet（无需安装 idc-index） |
| `mcp_guide.md` | 托管的 IDC MCP server：工具清单、识别、向 `idc-index` 交接 |
| `rest_api_guide.md` | 托管的 IDC REST API：端点、筛选语法、通过 HTTP 执行 SQL、清单 |

## IDC 数据模型

IDC 在标准 DICOM 层级（Patient → Study → Series → Instance）之上增加了两个分组层级：

- **collection_id**：按疾病、成像模态或研究重点对患者进行分组（例如 `tcga_luad`、`nlst`）。一个患者只能属于一个 collection。
- **analysis_result_id**：标识跨一个或多个原始 collection 的派生对象（分割结果、标注、放射组学特征）。使用它查找 AI 生成的或专家标注；使用 `collection_id` 查找原始影像数据（其中可能本身包含已提交的标注）。

**查询时使用的关键标识符：**
| 标识符 | 范围 | 用途 |
|------------|-------|---------|
| `collection_id` | 数据集分组 | 按项目/研究进行筛选 |
| `PatientID` | 患者 | 按患者对图像进行分组 |
| `StudyInstanceUID` | DICOM study | 对相关 series 进行分组、可视化 |
| `SeriesInstanceUID` | DICOM series | 对相关 series 进行分组、可视化 |

## 索引表

`idc-index` 软件包提供多个元数据索引表，可通过 SQL 或 pandas DataFrame 访问。REST API 通过 `GET /tables` 和 `POST /sql` 暴露相同的表。

**重要：**`client.indices_overview` 是当前表说明、可用列及其类型的权威来源——编写 SQL 或探索数据结构时应查询它。它还可以回答“列 X 位于哪个表中”；有关该搜索模式和完整架构发现，请参阅 `references/index_tables_guide.md`。

### 可用表

查询任何索引表之前，始终调用 `client.fetch_index("table_name")`——对于所有表（包括启动时自动加载的表），此调用都是安全且幂等的。

| 类别 | 表 | 粒度 |
|--------|--------|-------------|
| 核心 | `index`（所有当前数据的主要元数据）、`collections_index`、`analysis_results_index` | series / collection / analysis result |
| 成像模态采集参数 | `ct_index`、`mr_index`、`pt_index`、`contrast_index` | 1 行 = 该模态的 1 个 series |
| 派生对象 | `seg_index`、`rtstruct_index`、`ann_index`、`ann_group_index` | 1 行 = 1 个 series（或 annotation group） |
| 显微镜 | `sm_index`、`sm_instance_index` | 1 行 = 1 个 SM series / instance |
| 几何信息、临床信息、历史记录 | `volume_geometry_index`、`clinical_index`、`version_metadata_index`、`prior_versions_index` | 参见指南 |

`references/index_tables_guide.md` 包含完整的清单，以及每个表的列和内容——当你需要了解某个专用表实际包含哪些内容时，请加载该文件。

**`prior_versions_index` 仅用于可复现性。**它包含已从 IDC 中永久*移除*的 series，与 `index` 完全没有重叠。仅在需要针对 IDC 的某个历史版本复现工作时使用它。不要将其用于版本历史或“有哪些新增内容”之类的问题——这些问题应使用主 `index` 表中的 `series_init_idc_version` / `series_revised_idc_version`，它们与该表中的 `min_idc_version` / `max_idc_version` 并不等价。

### 连接表

**`SeriesInstanceUID` 是所有系列级专用表的通用连接键**：`sm_index`、`sm_instance_index`、`seg_index`、`ann_index`、`ann_group_index`、`contrast_index`、`volume_geometry_index`、`rtstruct_index`、`ct_index`、`mr_index`、`pt_index`。始终使用 `SeriesInstanceUID` 将这些表与 `index` 连接。以下例外情况使用不同的列名。

| 连接列 | 表 | 使用场景 |
|-------------|--------|----------|
| `collection_id` | index, prior_versions_index, collections_index, clinical_index | 将系列与集合元数据或临床数据关联 |
| `analysis_result_id` | index, analysis_results_index | 将系列与分析结果元数据（注释、分割）关联 |
| `source_DOI` | index, analysis_results_index | 根据出版物 DOI 进行关联 |
| `segmented_SeriesInstanceUID` | seg_index → index | 将分割与其源图像系列关联（`seg_index.segmented_SeriesInstanceUID = index.SeriesInstanceUID`） |
| `referenced_SeriesInstanceUID` | ann_index → index, rtstruct_index → index | 将注释或 RTSTRUCT 与其源图像系列关联 |

**注意：**`subjects`、`updated` 和 `description` 出现在多个表中，但含义不同（计数与标识符、不同的更新上下文）。始终使用 `SeriesInstanceUID` 将 `prior_versions_index` 与 `index` 连接会返回零行 — 请参见上面的警告。

有关详细的连接示例、模式发现模式、键列参考和 DataFrame 访问，请参见 `references/index_tables_guide.md`。

### 临床数据访问

临床（非影像）属性 — 分期、人口统计信息、治疗 — 存储在各个集合对应的表中。`client.fetch_index("clinical_index")` 加载将列映射到集合的字典；`client.get_clinical_table(name)` 返回一个 DataFrame 格式的表。

有关发现工作流、编码值映射以及将临床数据与影像数据连接，请参见 `references/clinical_data_guide.md`。

## 数据访问选项

| 方法 | 身份验证 | 最适用于 | 参考 |
|--------|------|----------|-----------|
| `idc-index` | 否 | 下载、pandas 分析、无界查询 — 功能最强的路径 | 本文档 |
| IDC MCP server | 否 | 发现、构建队列，以及会话已经具备相关信息时的元数据访问 | `mcp_guide.md` |
| IDC REST API | 否 | 无需安装即可从任何语言或 shell 访问元数据 — 当 `idc-index` 不可用时的默认选项 | `rest_api_guide.md` |
| Direct Parquet (GCS) | 否 | 固定版本的查询，或超出 REST 行数上限的结果 | `parquet_access_guide.md` |
| Cloud storage (S3/GCS) | 否 | 直接文件访问、批量传输、自定义流水线 | `cloud_storage_guide.md` |
| DICOMweb via IDC proxy | 否 | 工具和 PACS 集成；有每日配额，因此适用于测试和中等规模使用 | `dicomweb_guide.md` |
| DICOMweb via Google Healthcare | 是（GCP） | 生产规模下使用相同的 DICOMweb API，且不受代理配额限制 | `dicomweb_guide.md` |
| SlicerIDCBrowser | 否 | 在 3D Slicer 中进行三维可视化和分析 | https://github.com/ImagingDataCommons/SlicerIDCBrowser |
| BigQuery | 是（GCP） | 完整的 DICOM 元数据、私有元素、SR 测量值 — 最后的选择 | `bigquery_guide.md` |

**IDC Portal（https://portal.imaging.datacommons.cancer.gov/）仅支持交互式操作** —
基于浏览器的探索、手动队列选择和下载。与上面所有选项不同，它没有程序化接口，因此应引导用户前往该门户自行浏览或点击操作数据；绝不要将其作为脚本或工作流中的步骤。

**REST API — 无需安装的元数据路径**

`https://api.imaging.datacommons.cancer.gov/v3`，无需身份验证：发现、队列计数和清单、只读 SQL、临床表、查看器 URL、许可证、引用信息。它与基于普通 HTTP 的 MCP 服务器使用的是同一服务，因此无需配置。它绝不会传输图像字节 — 要下载、获取 DataFrame，或获取超过 10 000 行的结果，请切换到 `idc-index`。

```bash
B=https://api.imaging.datacommons.cancer.gov/v3
curl -s $B/version   # idc_version, idc_index_data_version, api_version
curl -s $B/stats     # collections, patients, studies, series, instances, size_TB
curl -s "$B/attributes/Modality/values?limit=5"   # real filter values, with counts
curl -s $B/sql -H 'content-type: application/json' \
  -d '{"sql":"SELECT collection_id, COUNT(*) n FROM index GROUP BY 1 ORDER BY n DESC LIMIT 3"}'
curl -s $B/cohort/counts -H 'content-type: application/json' \
  -d '{"filters":{"terms":{"collection_id":["rider_pilot"]}}}'
```

**过滤器对象始终放在 `filters` 下** — `cohort/counts`、`cohort/manifest`、`cohort/manifest.txt`、`licenses` 和 `citations` 都是如此。裸过滤器或无法识别的键会返回一个指出修正方式的 422；未过滤的序列枚举请求会返回 400，而不是返回整个存档。每个经过过滤的响应都会回显 `filters_applied` 和 `warnings` — 请阅读它们，因为其中会指出服务器丢弃的任何谓词。因此，计数为零且 `warnings` 为空表示过滤器没有匹配任何内容，而不是值的大小写写错；大小写写错会产生相应警告。

`POST /sql` 接受针对 `idc-index` 暴露的表以及 `clinical.<table>` 的一个只读 `SELECT`/`WITH` 查询；`max_rows` 默认为 5 000，最大为 10 000，截断结果时会将 `truncated` 标记为真。`GET /attributes` 列出 19 个可过滤属性 — 临床值、分割解剖结构和采集参数不在其中，需要使用 SQL。没有速率限制或配额。**仅使用 v3：** V1 和 V2 已被取代并计划关闭，因此如果用户提供了任何 `/v1/` 或 `Modality_btw` 风格的示例，应将其移植，而不是在其基础上扩展。

两端都基于 `idc-index-data` 构建，因此在混用两者之前，请将 API 的 `idc_index_data_version` 与本地的 `idc_index_data.__version__` 进行比较：**主版本号是 IDC 数据发布版本**（`24.x.y` 提供 `v24`），因此次版本号或补丁版本号不同意味着序列相同。如果 API 领先一个完整发布版本，`idc-index` **无法下载额外的序列** — 它会静默跳过自身索引中未列出的内容 — 因此要么升级它（运行 `scripts/check_version.py` 获取正确命令），要么使用 `s5cmd --no-sign-request` 直接从存储桶传输。

请参阅 `references/rest_api_guide.md`，了解端点参考、过滤器依据、限制以及基于清单的下载流程。

**云存储组织**

所有 DICOM 文件都存储在 AWS S3 和 GCS 之间镜像的公共存储桶中，并按 CRDC UUID
（而非 DICOM UID）组织，以支持版本控制，路径格式为
`<crdc_series_uuid>/<crdc_instance_uuid>.dcm`。通过 AWS CLI、gsutil 或 s5cmd 使用匿名访问时
均可免费访问（不收取出口费用）；对于 S3 URL，请使用 `series_aws_url` 列。请注意，
`idc-open-data-cr` / `idc-open-cr`（约占数据的 4%）限制商业用途（CC BY-NC）。完整的
存储桶列表和 UUID 映射请参见 `references/cloud_storage_guide.md`。

**DICOMweb 访问**

IDC 数据可通过 DICOMweb（Google Cloud Healthcare API）访问，以用于 PACS 集成和
兼容 DICOMweb 的工具：公共代理（无需身份验证，但有每日配额）适合测试和中等规模的
查询；Google Healthcare（GCP 身份验证）适合生产环境的数据量。请参见
`references/dicomweb_guide.md`。

**直接访问 Parquet**

`idc-index` 元数据表也以 Parquet 格式发布在公共 GCS 存储桶
（`idc-index-data-artifacts`）中，可使用 DuckDB 或 pandas 查询。这需要安装 DuckDB，
且无法访问各集合的临床数据表，因此对于临时元数据查询，优先使用 REST `/sql`；
需要固定数据版本或查询结果超过 REST 行数上限时，选择 Parquet。请参见
`references/parquet_access_guide.md`。

## 核心能力

下面的模式是仅凭记忆而不进行检查时最容易出错的部分。每个领域的可运行示例都位于
正文中以内联方式指明的参考指南中。

### 1. 发现——在根据值进行筛选之前先枚举值

根据猜测的 `Modality` 或 `BodyPartExamined` 字符串进行筛选，是结果集为空的最常见原因。
请先进行枚举：

```python
modalities = client.sql_query("""
    SELECT DISTINCT Modality, COUNT(*) as series_count
    FROM index
    GROUP BY Modality
    ORDER BY series_count DESC
""")
print(modalities)
```

相同的模式适用于任何筛选列，也可以选择使用另一个条件进一步缩小范围 —
例如在某个 `Modality`、`Manufacturer` 或 `collection_id` 中查询
`BodyPartExamined`。在 REST 路径中，这种校验只需一次调用 — `GET /attributes/{attr}/values`
会返回带计数的值；而 cohort 端点会在 `warnings` 中报告大小写不匹配的值，而不是返回空结果。

两个索引包含经过整理的集合级元数据，而主 `index` 不包含这些元数据；使用前都需要先执行
`client.fetch_index(...)`：`collections_index`（癌症类型、肿瘤位置、物种、受试者数量）和
`analysis_results_index`（派生数据集——AI 分割结果、专家标注、影像组学——及其来源集合和
模态）。

**癌症类型位于 `collections_index.cancer_types`，而不在 `index` 中**——按癌症类型筛选
需要执行连接：

```python
client.fetch_index("collections_index")
results = client.sql_query("""
    SELECT i.collection_id, i.PatientID, i.SeriesInstanceUID, i.Modality
    FROM index i
    JOIN collections_index c ON i.collection_id = c.collection_id
    WHERE c.cancer_types LIKE '%Breast%'
      AND i.Modality = 'MR'
    LIMIT 20
""")
```

`client.sql_query()` 返回 pandas DataFrame。在编写查询之前，请通过
`client.get_index_schema('index')` 或 `client.indices_overview` 确认列名，而不要想当然地假设
列名。

参见 `references/sql_patterns.md`，了解筛选值发现、注释和分段
查询、大小估算、临床关联以及版本跟踪（“vX 中有哪些新内容”——在
`index` 中使用 `series_init_idc_version` / `series_revised_idc_version`，绝不要使用
`prior_versions_index`）。

### 2. 下载 DICOM 文件

**两种下载方法的前两个参数顺序相反。** 这是导致 IDC 代码损坏的最常见原因——请检查参数顺序，不要凭记忆：

| 方法 | 第一个参数 | 第二个参数 | 使用场景 |
|--------|-----------|------------|----------|
| `download_from_selection` | `downloadDir`（必需） | 筛选关键字参数（可选） | 按集合、患者、检查或序列进行筛选 |
| `download_dicom_series` | `seriesInstanceUID`（必需） | `downloadDir`（必需） | 仅通过 UID 下载指定序列 |

**`download_from_selection` 接受筛选关键字参数，而不是 DataFrame。** 名称
“from_selection”指的是根据条件筛选 IDC 索引，而不是接受 pandas DataFrame。要下载查询结果，请先将 UID 提取到列表中：

```python
# Step 1: Query for series UIDs
series_df = client.sql_query("""
    SELECT SeriesInstanceUID
    FROM index
    WHERE Modality = 'CT'
      AND BodyPartExamined = 'CHEST'
      AND collection_id = 'nlst'
    LIMIT 5
""")

# Step 2: Extract UIDs as a list from the DataFrame
uids = list(series_df['SeriesInstanceUID'].values)

# Step 3: Pass the list to download_from_selection (NOT the DataFrame itself)
client.download_from_selection(
    downloadDir="./data/lung_ct",
    seriesInstanceUID=uids       # list of strings, not a DataFrame
)

# Alternative: download_dicom_series has seriesInstanceUID as FIRST arg (different order!)
client.download_dicom_series(
    seriesInstanceUID=uids,      # FIRST arg here
    downloadDir="./data/lung_ct"
)

# Whole collection: downloadDir is still the FIRST positional argument
client.download_from_selection(downloadDir="./data/rider", collection_id="rider_pilot")
```

两种方法默认都使用 AWS；要从 Google Storage 拉取数据，请传入
`source_bucket_location="gcs"`。

**下载的文件命名为 `<crdc_instance_uuid>.dcm`，而不是使用 SOPInstanceUID 命名。** DICOM
UID 会保留在文件元数据中，而不是文件名中。使用 `crdc_instance_uuid`
列将文件映射回其来源序列。

`idc download <collection|series-uid|manifest> --download-dir ./data` 可在
shell 中执行相同操作。有关 `dirTemplate` 层级选项（Python 默认值：
`%collection_id/%PatientID/%StudyInstanceUID/%Modality_%SeriesInstanceUID`；`dirTemplate=""`
会将文件平铺存放）、支持断点续传的 manifest 下载以及试运行大小估算，请参见
`references/cli_guide.md`。

### 3. 可视化 IDC 图像

```python
viewer_url = client.get_viewer_URL(seriesInstanceUID=uid)        # one series
viewer_url = client.get_viewer_URL(studyInstanceUID=study_uid)   # all series in a study
```

返回一个浏览器 URL——不会下载任何内容。该方法会自动为放射学图像选择 OHIF v3，为
切片显微镜图像选择 SLIM。当一个 DICOM Study 中包含多个 Series（来自同一次 MRI 检查的
T1、T2 和 DWI）时，按 study 查看非常有用。

### 4. 许可证与引用——必须履行的义务，而非可选步骤

IDC 数据附带的许可证条款和署名要求会随数据进入任何下游出版物或产品，而这两者都无法从像素数据中推断出来。**使用前请检查许可证，并为下载的所有内容生成引用。**

```python
# License breakdown for a selection
licenses = client.sql_query("""
    SELECT DISTINCT collection_id, license_short_name,
           COUNT(DISTINCT SeriesInstanceUID) as series_count
    FROM index GROUP BY collection_id, license_short_name
""")

# Citations for the same selection you downloaded (APA by default)
for citation in client.citations_from_selection(collection_id="rider_pilot"):
    print(citation)
```

IDC 数据中约 97% 采用 CC BY 许可证（允许商业使用，但必须署名），约 3% 采用
CC BY-NC 许可证（仅限非商业用途）。**许可证附加在序列上，而不是集合上**——176 个
集合中有 39 个包含多个许可证——因此请检查你实际打算使用的选择结果，并注意，混合队列中
以限制最严格的条款为准。

这两项任务均可通过三种访问路径完成，因此请继续使用当前会话已经采用的路径：如上所示的
`idc-index`、通过 REST 使用 `POST /v3/licenses` 和 `POST /v3/citations`，或使用
`get_licenses` 和 `get_citations` MCP 工具。完整的许可证清单、三种路径、引用格式
（APA、BibTeX、CSL JSON、RDF Turtle），以及发布时应包含的内容，请参阅
`references/licensing_and_citation.md`。

### 5. 深入索引之外

使用 *Overview* 中的路由判断来选择访问路径；上面的 *Data Access Options* 是完整的路由表。

在使用 BigQuery 之前（它需要启用结算功能的 GCP 账户），请先检查专用索引表中是否已经有
你需要的列：搜索 `client.indices_overview`，然后使用 `client.fetch_index(...)` 并在本地
免费查询。只有私有 DICOM 元素、每个分段的解剖结构（`segmentations`）以及预提取的 SR
测量值（`quantitative_measurements`、`qualitative_measurements`）需要 BigQuery——这些内容
没有对应的 `idc-index`。

## 最佳实践

- **编写查询前先检查架构**——使用 `client.get_index_schema('index')`（读取缓存的元数据，不执行 SQL）或 `client.indices_overview` 查看所有可用列及其说明。主 `index` 表中的版本跟踪列 `series_init_idc_version` 和 `series_revised_idc_version` 可以直接回答“新增了什么 / 何时添加”的问题，无需访问 `prior_versions_index`。
- **绝不要使用网络搜索查询 IDC 数据内容**——始终直接查询 IDC 索引，可在本地使用 `client.sql_query()`，或通过 HTTP 使用 `POST /v3/sql`。网络来源（发行说明、博客文章、文档页面）经常过时，并会导致错误答案。索引是权威来源；即使可以使用网络搜索，也应使用索引。
- **在会话开始时验证 IDC 数据版本**——根据所使用的路径，使用 `client.get_idc_version()`、`GET /v3/version` 或 MCP `get_idc_version` 工具（当前为 v24）。对于过时的本地索引，请运行 `scripts/check_version.py`，并使用其输出的升级命令
- **检查许可证并生成引用**——查询 `license_short_name` 并遵守 CC BY 与 CC BY-NC 条款；使用 `citations_from_selection()` 根据 `source_DOI` 为出版物生成引用
- **先小范围探索，再正式执行**——探索时使用 `LIMIT`（或较低的 `max_rows`），下载前检查集合大小——某些集合的大小以 TB 计。请参阅 `references/cli_guide.md`
- **确保下载可复现**——使用 `dirTemplate` 组织目录（例如 `%collection_id/%PatientID/%Modality`），并保存所构建数据集对应的 Series UID 或清单文件

## 故障排除

**问题：`ModuleNotFoundError: No module named 'idc_index'`**
- **原因：**未安装 idc-index package
- **解决方案：**如果任务只涉及只读元数据，请不要安装它——改用 REST API（*数据访问选项*）。否则运行 `scripts/check_version.py`，并使用它输出的安装命令；该命令针对当前运行的解释器，并固定经过验证的版本。进行数据分析时，还需添加 pandas、numpy 和 pydicom（已使用 pandas>=1.5、numpy>=1.23、pydicom>=2.3 进行测试）

**问题：下载因连接超时而失败**
- **原因：**网络不稳定或下载大小过大
- **解决方案：**分批下载（每批 10-20 个 series）；有关 `--use-s5cmd-sync` 的续传和重试指南，请参阅 `references/cli_guide.md`

**问题：`BigQuery quota exceeded` 或发生计费错误**
- **原因：**BigQuery 要求使用已启用计费功能的 GCP project
- **解决方案：**对于简单查询，请使用 idc-index mini-index（无需计费）；或者参阅 `references/bigquery_guide.md` 了解成本优化建议

**问题：找不到 Series UID 或未返回数据**
- **原因：**UID 拼写错误、数据不在当前 IDC 版本中，或字段名称错误
- **解决方案：**先使用 `LIMIT 5` 进行测试，对照 `client.indices_overview` 检查字段名称，并确认该 series 位于当前版本中（部分旧数据已弃用）

**问题：`index` table 中找不到列（例如 `SliceThickness`、`PixelSpacing`、`KVP`、`EchoTime`、`InjectedDose`）**
- **原因：**`index` table 仅包含 series-level metadata；特定 modality 的采集和重建参数位于专用 tables（`ct_index`、`mr_index`、`pt_index`）中
- **解决方案：**在 `client.indices_overview` 中搜索该列，以找到其所在的 table——循环示例位于 `references/index_tables_guide.md` 的*查找包含某列的表*部分——然后按 `SeriesInstanceUID` 获取并连接：
  ```python
  client.fetch_index("ct_index")
  result = client.sql_query("""
      SELECT i.SeriesInstanceUID, i.Modality, c.SliceThickness, c.KVP, c.PixelSpacing_row_mm
      FROM index i
      JOIN ct_index c USING (SeriesInstanceUID)
      WHERE i.collection_id = 'your_collection'
  """)
  ```

**问题：下载的 DICOM files 无法打开**
- **原因：**下载损坏，或对象类型是 viewer 无法处理的类型——SEG、RTSTRUCT、SR 和 slide microscopy 都需要专用工具
- **解决方案：**先检查 `Modality` 和 `SOPClassUID`，使用 `pydicom.dcmread(file, force=True)` 进行验证，尝试其他 viewer（病理学可使用 3D Slicer、QuPath），然后重新下载

## 资源

参考指南及其触发条件列于上面的*快速导航*中。

- **IDC Portal**: https://portal.imaging.datacommons.cancer.gov/explore/
- **文档**: https://learn.canceridc.dev/ — **教程**: https://github.com/ImagingDataCommons/IDC-Tutorials
- **用户论坛**: https://discourse.canceridc.dev/ — **idc-index**: https://github.com/ImagingDataCommons/idc-index
- **[indices_reference](https://idc-index.readthedocs.io/en/latest/indices_reference.html)** — 外部 index-table 文档（可能领先于已安装的版本）
- **引用**: Fedorov, A., 等。"National Cancer Institute Imaging Data Commons: Toward Transparency, Reproducibility, and Scalability in Imaging Artificial Intelligence." RadioGraphics 43.12 (2023). https://doi.org/10.1148/rg.230180
- **Skill 更新**: [releases page](https://github.com/ImagingDataCommons/imaging-data-commons-skill/releases)；关注该 repository（Watch → Custom → Releases）。